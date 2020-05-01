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

    parserOptions: {
      ecmaVersion: 2017,
      sourceType: "module",
    },

    messages: {
      a11yAuditAfterHelper: "Call a11yAudit after acceptance test helper",
    },
  },

  create(context) {
    const settings = utils.extractSettings(context);
    const modules = utils.extractModules(settings);

    const declaration = utils.findA11yAuditImportDeclaration(context, settings);
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
          const matching = specifiers.filter(
            ({ type, imported }) =>
              type === "ImportSpecifier" && toInclude.includes(imported.name)
          );
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
      const parentExpressionStatementNode = utils.findParentOfType(
        node,
        "ExpressionStatement"
      );

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
            let fixerNode = node;
            let parentFn = utils.findParentOfType(node, /FunctionDeclaration/);
            let prefix = parentFn && parentFn.async ? "await " : "";
            return fixer.insertTextAfter(
              fixerNode,
              `; ${prefix}${a11yAuditIdentifier}()`
            );
          },
        });
      }
    }
    return {
      "Program:exit"(/*node*/) {},
    };
  },
};
