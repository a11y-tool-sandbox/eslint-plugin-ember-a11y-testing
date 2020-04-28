"use strict";

const utils = require('../utils');

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

    description: "enforce calling a11yAudit after test helpers in acceptance tests",
    category: "Accessibility",
    recommended: true,
    url: "https://github.com/jgwhite/eslint-plugin-ember-a11y-testing/blob/master/lib/rules/a11y-audit-after-test-helper.js",

    schema: [{
      "type": "object",
      "properties": {
        "include": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "exclude": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    }],

    parserOptions: {
      "ecmaVersion": 2017,
      "sourceType": "module"
    },

    messages: {
      a11yAuditMustBeCalled: "a11yAudit must be called as a function and can't be used as a value. Replace `a11yAudit` with added parens, e.g. `a11yAudit()`",
      a11yAuditAfterHelper: "Call a11yAudit after acceptance test helper"
    }
  },

  create(context) {
    if (!context.getFilename().includes("tests/acceptance")) {
      return {};
    }

    const defaultTestHelperFunctions = [
      // route helpers
      "visit",

      // dom interaction helpers
      "blur",
      "click",
      "doubleClick",
      "fillIn",
      "focus",
      "tap",
      "triggerEvent",
      "triggerKeyEvent",
      "typeIn",

      // rendering helpers
      "render",

      // TODO: decide if wait helpers would be handy to audit
      // "waitFor",
      // "waitUntil",
      // "settled"
    ];

    const settings = utils.extractSettings(context);

    const extractOptions = (rawConfig) => {
      if (!Array.isArray(rawConfig)) {
        return extractOptions([]);
      }
      const config = rawConfig[0] || {};
      return {
        include: [],
        exclude: [],
        ...config
      };
    }
    const options = extractOptions(context.options);
    const includeFunctionNames = options.include;

    const excludeFunctionNames = options.exclude;

    const declaration = utils.findA11yAuditImportDeclaration(context, settings);
    const a11yAuditIdentifier = declaration ? declaration.local.name : utils.DEFAULT_A11Y_AUDIT_VARIABLE;

    const functionSelectors = []
      .concat(defaultTestHelperFunctions, includeFunctionNames)
      .filter(fn => !excludeFunctionNames.includes(fn))
      .map(helperName => `[callee.name="${helperName}"]`)
      .join(",");

    return {
      ["CallExpression" + functionSelectors]: function(node) {
        const parentExpressionStatementNode = utils.findParentOfType(node, 'ExpressionStatement');

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
          if (node.parent && node.parent.type === 'CallExpression') {
            return node.parent.callee.type === 'Identifier' && node.parent.callee.name === a11yAuditIdentifier;
          } else if (node.type === 'AwaitExpression' && node.argument.type === 'CallExpression') {
            return node.argument.callee.type === 'Identifier' && node.argument.callee.name === a11yAuditIdentifier;
          }
        }
        const nextNodeIsA11yAudit = nextNodeExists && isA11yAudit(nextNode);

        if (
          !nextNodeExists ||
          !nextNodeIsA11yAudit
        ) {
          context.report({
            node,
            messageId: "a11yAuditAfterHelper",
            fix(fixer) {
              // don't attempt to autofix when helper is passed to a function, e.g.
              // assert.throws(fillIn('#foo', 'hi))
              if (node.parent.type === 'CallExpression') {
                return;
              }
              if (nextNode) {
                // don't autofix `a11yAudit` (e.g. without parens/not a call expression)
                // it should get autofixed by a11y-audit-no-expression instead.
                if(nextNode.type === 'ExpressionStatement' && nextNode.expression.type === 'Identifier' && nextNode.expression.name === a11yAuditIdentifier) {
                  return
                } else if (nextNode.type === 'AwaitExpression') {
                  if (nextNode.argument.type === 'Identifier' && nextNode.argument.name === a11yAuditIdentifier) {
                    return
                  }
                }
              }
              let fixerNode = node;
              let parentFn = utils.findParentOfType(node, /FunctionDeclaration/);
              let prefix = parentFn && parentFn.async ? 'await ' : '';
              return fixer.insertTextAfter(fixerNode, `; ${prefix}${a11yAuditIdentifier}()`);
            }
          });
        }
      }
    };
  }
};
