"use strict";

const utils = require("../utils");

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

module.exports = {
  meta: {
    type: "problem",
    fixable: "code",

    description:
      "enforce calling a11yAudit after test helpers in acceptance tests",
    category: "Accessibility",
    recommended: true,
    url:
      "https://github.com/jgwhite/eslint-plugin-ember-a11y-testing/blob/master/lib/rules/a11y-audit-after-test-helper.js",

    schema: [],

    messages: {
      a11yAuditAfterHelper: "Call a11yAudit after acceptance test helper",
    },
  },

  create(context) {
    return {
      ["Program:exit"](/* node */) {
        const settings = utils.extractSettings(context);
        const modules = utils.extractModules(settings);

        const declaration = utils.findA11yAuditImportDeclaration(
          context,
          settings
        );
        const a11yAuditIdentifier = declaration
          ? declaration.local.name
          : utils.DEFAULT_A11Y_AUDIT_VARIABLE;

        Object.entries(modules).forEach(([sourceName, config]) => {
          const { include, exclude } = config;
          const totalImportNames = include.filter(
            (importName) => !exclude.includes(importName)
          );
          forEachImportVariable(sourceName, totalImportNames, (variable) => {
            variable.references.forEach((ref) => {
              const node = ref.identifier;
              if (node.parent.type === "CallExpression") {
                visit(node.parent);
              }
            });
          });
        });

        function forEachImportVariable(sourceName, toInclude, callback) {
          const sourceCode = context.getSourceCode();
          const importDeclarations = sourceCode.ast.body.filter(
            ({ type, source }) => {
              return (
                type === "ImportDeclaration" &&
                source &&
                source.value === sourceName
              );
            }
          );
          const importSpecifiers = importDeclarations.reduce(
            (memo, { specifiers }) => {
              const matching = specifiers.filter(({ type, imported }) => {
                if (type === "ImportDefaultSpecifier") {
                  return toInclude.includes("default");
                } else if (type === "ImportSpecifier") {
                  return toInclude.includes(imported.name);
                }
              });
              return memo.concat(matching);
            },
            []
          );
          importSpecifiers.forEach((specifier) => {
            context.getDeclaredVariables(specifier).forEach((variable) => {
              callback(variable);
            });
          });
        }

        function visit(node) {
          let parentExpressionStatementNode = utils.findParentOfType(
            node,
            "ExpressionStatement"
          );

          if (!parentExpressionStatementNode) {
            parentExpressionStatementNode = utils.findParentOfType(
              node,
              "ReturnStatement"
            );
          }

          const nextToken = context
            .getSourceCode()
            .getTokenAfter(parentExpressionStatementNode);

          const nextNode = nextToken
            ? context.getNodeByRangeIndex(...nextToken.range)
            : null;

          const nextNodeExists = Boolean(nextNode);

          const isA11yAudit = (node) => {
            if (!node) {
              return false;
            }
            if (node.parent && node.parent.type === "CallExpression") {
              return (
                node.parent.callee.type === "Identifier" &&
                node.parent.callee.name === a11yAuditIdentifier
              );
            } else if (
              node.type === "AwaitExpression" &&
              node.argument.type === "CallExpression"
            ) {
              return (
                node.argument.callee.type === "Identifier" &&
                node.argument.callee.name === a11yAuditIdentifier
              );
            }
          };
          const nextNodeIsA11yAudit = nextNodeExists && isA11yAudit(nextNode);

          if (!nextNodeExists || !nextNodeIsA11yAudit) {
            context.report({
              node,
              messageId: "a11yAuditAfterHelper",
              fix(fixer) {
                // don't attempt to autofix when helper is passed to a function, e.g.
                // assert.throws(fillIn('#foo', 'hi))
                if (node.parent.type === "CallExpression") {
                  return;
                }
                if (nextNode) {
                  // don't autofix `a11yAudit` (e.g. without parens/not a call expression)
                  // it should get autofixed by a11y-audit-no-expression instead.
                  if (
                    nextNode.type === "ExpressionStatement" &&
                    nextNode.expression.type === "Identifier" &&
                    nextNode.expression.name === a11yAuditIdentifier
                  ) {
                    return;
                  } else if (nextNode.type === "AwaitExpression") {
                    if (
                      nextNode.argument.type === "Identifier" &&
                      nextNode.argument.name === a11yAuditIdentifier
                    ) {
                      return;
                    }
                  }
                }
                const parentFn = utils.findParentOfType(node, /Function/);
                const isInReturnStatement =
                  parentFn && node.parent.type === "ReturnStatement";
                const prefix = parentFn && parentFn.async ? "await " : "";
                const leftPadding =
                  parentExpressionStatementNode.parent &&
                  parentExpressionStatementNode.parent &&
                  parentExpressionStatementNode.parent.type === "Program"
                    ? // if we're in the top of the file, which we shouldn't be, just go to the next line
                      // and let the user fix spacing issues with whatever eslint settings they have.
                      "\n"
                    : "\n" + "".padStart(node.parent.loc.start.column, " ");
                if (isInReturnStatement) {
                  const sourceCode = context.getSourceCode();
                  // replace `return helper()` with `await helper(); return a11yAudit`
                  const returnStatementArgumentCode = sourceCode.getText(node);
                  let fixed = `${prefix}${returnStatementArgumentCode};${leftPadding}return ${a11yAuditIdentifier}();`;
                  return fixer.replaceTextRange(node.parent.range, fixed);
                }
                let fixed = `;${leftPadding}${prefix}${a11yAuditIdentifier}()`;
                return fixer.insertTextAfter(node, fixed);
              },
            });
          }
        }
      },
    };
  },
};
