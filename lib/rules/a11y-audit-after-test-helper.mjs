import * as utils from "../utils.mjs";

/**
 * @fileoverview Enforce calling a11yAudit after test helpers
 * in acceptance tests
 * @author Chad Carbert <https://github.com/chadian>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const DEFAULT_HELPERS = [
  "blur",
  "click",
  "doubleClick",
  "fillIn",
  "focus",
  "tap",
  "triggerEvent",
  "triggerKeyEvent",
  "visit",
];

const rule = {
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description:
        "enforce calling a11yAudit after test helpers in acceptance tests",
      category: "Accessibility",
      recommended: true,
      url: "https://github.com/jgwhite/eslint-plugin-ember-a11y-testing/blob/master/lib/rules/a11y-audit-after-test-helper.js",
    },
    schema: [],
    messages: {
      a11yAuditAfterHelper: "Call a11yAudit after acceptance test helper",
    },
  },

  create(context) {
    const testHelpers = new Set();
    let a11yAuditName = utils.DEFAULT_A11Y_AUDIT_VARIABLE;

    function isA11yAuditCall(node) {
      if (!node) return false;

      if (node.type === "ExpressionStatement") {
        const expr = node.expression;
        if (
          expr.type === "CallExpression" &&
          expr.callee.type === "Identifier"
        ) {
          return expr.callee.name === a11yAuditName;
        }
        if (
          expr.type === "AwaitExpression" &&
          expr.argument.type === "CallExpression" &&
          expr.argument.callee.type === "Identifier"
        ) {
          return expr.argument.callee.name === a11yAuditName;
        }
      } else if (node.type === "ReturnStatement") {
        const expr = node.argument;
        if (!expr) return false;

        if (
          expr.type === "CallExpression" &&
          expr.callee.type === "Identifier"
        ) {
          return expr.callee.name === a11yAuditName;
        }
        if (
          expr.type === "AwaitExpression" &&
          expr.argument.type === "CallExpression" &&
          expr.argument.callee.type === "Identifier"
        ) {
          return expr.argument.callee.name === a11yAuditName;
        }
      }
      return false;
    }

    function isTestHelperCall(node) {
      if (!node) return false;

      let calleeNode;
      if (node.type === "CallExpression") {
        calleeNode = node.callee;
      } else if (
        node.type === "AwaitExpression" &&
        node.argument.type === "CallExpression"
      ) {
        calleeNode = node.argument.callee;
      }

      return (
        calleeNode &&
        calleeNode.type === "Identifier" &&
        testHelpers.has(calleeNode.name)
      );
    }

    function processImports(statement, moduleName, config) {
      const excludedHelpers = config.exclude || [];
      const includedHelpers = config.include || [];

      // For @ember/test-helpers, use default helpers if no includes specified
      // For custom modules, only use included helpers
      const totalHelpers =
        moduleName === "@ember/test-helpers"
          ? includedHelpers.length > 0
            ? includedHelpers.filter(
                (helper) => !excludedHelpers.includes(helper),
              )
            : DEFAULT_HELPERS.filter(
                (helper) => !excludedHelpers.includes(helper),
              )
          : includedHelpers.filter(
              (helper) => !excludedHelpers.includes(helper),
            );

      statement.specifiers.forEach((specifier) => {
        if (specifier.type === "ImportSpecifier") {
          const importedName = specifier.imported.name;
          const localName = specifier.local.name;

          if (totalHelpers.includes(importedName)) {
            testHelpers.add(localName);
          }
        } else if (specifier.type === "ImportDefaultSpecifier") {
          if (totalHelpers.includes("default")) {
            testHelpers.add(specifier.local.name);
          }
        }
      });
    }

    function findNextStatement(node, block) {
      if (!block || !block.body) return null;
      const statements = block.body;
      const currentIndex = statements.indexOf(node);
      if (currentIndex === -1) {
        // If we can't find the node directly, try to find its parent ExpressionStatement
        const parentExpr = statements.find(
          (stmt) =>
            stmt.type === "ExpressionStatement" && stmt.expression === node,
        );
        if (parentExpr) {
          const parentIndex = statements.indexOf(parentExpr);
          return parentIndex !== -1 ? statements[parentIndex + 1] : null;
        }
        return null;
      }
      return statements[currentIndex + 1];
    }

    function isInFunctionArgument(node) {
      let current = node;

      // For await expressions, check the inner CallExpression
      if (node.type === "AwaitExpression") {
        current = node.argument;
      }

      // If this is a CallExpression, check if it's an argument to another function
      if (current.type === "CallExpression") {
        const parent = current.parent;
        if (
          parent &&
          parent.type === "CallExpression" &&
          parent.arguments.includes(current)
        ) {
          return true;
        }
      }

      return false;
    }

    function isReturningA11yAudit(node) {
      if (!node) return false;

      if (node.type === "ReturnStatement") {
        const expr = node.argument;
        if (!expr) return false;

        if (
          expr.type === "CallExpression" &&
          expr.callee.type === "Identifier"
        ) {
          return expr.callee.name === a11yAuditName;
        }
        if (
          expr.type === "AwaitExpression" &&
          expr.argument.type === "CallExpression" &&
          expr.argument.callee.type === "Identifier"
        ) {
          return expr.argument.callee.name === a11yAuditName;
        }
      }
      return false;
    }

    function isNextStatementA11yAudit(node, parentBlock) {
      if (!parentBlock || !parentBlock.body) return false;
      const nextStatement = findNextStatement(node, parentBlock);
      return nextStatement && isA11yAuditCall(nextStatement);
    }

    function reportMissingAudit(node) {
      // Skip reporting if this is a CallExpression inside an AwaitExpression
      if (
        node.type === "CallExpression" &&
        node.parent?.type === "AwaitExpression"
      ) {
        return;
      }

      // Skip if we're already reporting on the parent await expression
      if (
        node.type === "AwaitExpression" &&
        node.parent.type === "ExpressionStatement"
      ) {
        const parentExpr = node.parent;
        if (isNextStatementA11yAudit(parentExpr, parentExpr.parent)) {
          return;
        }
      }

      // Skip if we're already reporting on the parent expression statement
      if (
        node.parent?.type === "ExpressionStatement" &&
        isNextStatementA11yAudit(node.parent, node.parent.parent)
      ) {
        return;
      }

      context.report({
        node,
        messageId: "a11yAuditAfterHelper",
        fix: (fixer) => {
          const isAsync =
            node.type === "AwaitExpression" ||
            node.parent?.type === "AwaitExpression" ||
            utils.findParentOfType(node, "FunctionDeclaration")?.async;
          const prefix = isAsync ? "await " : "";

          // Special handling for return statements
          if (node.type === "ReturnStatement") {
            const returnExpr = node.argument;
            const returnText = context.sourceCode.getText(returnExpr);
            return fixer.replaceText(
              node,
              `await ${returnText};\nreturn ${a11yAuditName}();`,
            );
          }

          // Special handling for function arguments
          if (isInFunctionArgument(node)) {
            const parentCall = utils.findParentOfType(node, "CallExpression");
            if (parentCall) {
              // Skip if this is an assert.throws call
              const callee = parentCall.callee;
              if (
                callee.type === "MemberExpression" &&
                callee.object.name === "assert" &&
                callee.property.name === "throws"
              ) {
                return null;
              }

              const callText = context.sourceCode.getText(parentCall);
              const lastParen = callText.lastIndexOf(")");
              if (lastParen !== -1) {
                const beforeParen = callText.slice(0, lastParen);
                const afterParen = callText.slice(lastParen);
                return fixer.replaceText(
                  parentCall,
                  `${beforeParen}, ${prefix}${a11yAuditName}()${afterParen}`,
                );
              }
            }
          }

          const fix = `\n${prefix}${a11yAuditName}();`;
          return fixer.insertTextAfter(
            node.parent?.type === "ExpressionStatement" ? node.parent : node,
            fix,
          );
        },
      });
    }

    return {
      Program(node) {
        const settings = utils.extractSettings(context);
        const modules = settings.modules || {
          "@ember/test-helpers": {},
        };

        const declaration = utils.findA11yAuditImportDeclaration(
          context,
          settings,
        );
        if (declaration) {
          a11yAuditName = declaration.local.name;
        }

        // Process all import declarations for each module
        node.body.forEach((statement) => {
          if (statement.type !== "ImportDeclaration") return;
          const source = statement.source.value;

          // Find the matching module config
          const moduleConfig = modules[source] || {};
          if (source === "@ember/test-helpers" || moduleConfig.include) {
            processImports(statement, source, moduleConfig);
          }
        });
      },

      ExpressionStatement(node) {
        const expr = node.expression;

        // Skip if this is an await expression - let the AwaitExpression handler handle it
        if (expr.type === "AwaitExpression") {
          return;
        }

        if (!isTestHelperCall(expr)) {
          return;
        }

        if (isInFunctionArgument(expr)) {
          reportMissingAudit(expr);
          return;
        }

        if (!isNextStatementA11yAudit(node, node.parent)) {
          reportMissingAudit(expr);
        }
      },

      CallExpression(node) {
        if (!isTestHelperCall(node)) {
          return;
        }

        // Skip if this is part of an await expression - let the AwaitExpression handler handle it
        if (node.parent.type === "AwaitExpression") {
          return;
        }

        // Skip if this is a direct expression statement - let the ExpressionStatement handler handle it
        if (node.parent.type === "ExpressionStatement") {
          return;
        }

        if (isInFunctionArgument(node)) {
          reportMissingAudit(node);
          return;
        }

        const returnParent = utils.findParentOfType(node, "ReturnStatement");
        if (returnParent) {
          // Skip if the return statement is returning a11yAudit
          if (isReturningA11yAudit(returnParent)) {
            return;
          }

          reportMissingAudit(returnParent);
        }
      },

      AwaitExpression(node) {
        if (!isTestHelperCall(node)) {
          return;
        }

        if (isInFunctionArgument(node)) {
          reportMissingAudit(node);
          return;
        }

        const returnParent = utils.findParentOfType(node, "ReturnStatement");
        if (returnParent) {
          // Skip if the return statement is returning a11yAudit
          if (isReturningA11yAudit(returnParent)) {
            return;
          }

          reportMissingAudit(returnParent);
          return;
        }

        // Only report if this is a standalone await expression
        if (node.parent.type === "ExpressionStatement") {
          if (!isNextStatementA11yAudit(node.parent, node.parent.parent)) {
            reportMissingAudit(node);
          }
        }
      },
    };
  },
};

export default rule;
