"use strict";

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
    type: "suggestion",

    description: "enforce calling a11yAudit after test helpers in acceptance tests",
    category: "Accessibility",
    recommended: true,
    url: "https://github.com/jgwhite/eslint-plugin-ember-a11y-testing/blob/master/lib/rules/a11y-audit-after-test-helper.js",

    schema: [],

    messages: {
      a11yAuditAfterAction: "Call a11yAudit after every acceptance test action"
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
      "triggerKeyEvent"
    ];

    const includeFunctionNames =
      Array.isArray(context.options) &&
      context.options[0] &&
      Array.isArray(context.options[0].include)
        ? context.options[0].include
        : [];

    const excludeFunctionNames =
      Array.isArray(context.options) &&
      context.options[0] &&
      Array.isArray(context.options[0].exclude)
        ? context.options[0].exclude
        : [];

    const functionSelectors = []
      .concat(defaultTestHelperFunctions, includeFunctionNames)
      .filter(fn => !excludeFunctionNames.includes(fn))
      .map(helperName => `[callee.name="${helperName}"]`)
      .join(",");

    return {
      ["CallExpression" + functionSelectors]: function(node) {
        const parentExpressionStatementNode = findExpressionParent(node);

        const nextToken = context
          .getSourceCode()
          .getTokenAfter(parentExpressionStatementNode);

        const nextNode = nextToken
          ? context.getNodeByRangeIndex(...nextToken.range)
          : null;

        const nextNodeExists = Boolean(nextNode);
        const nextNodeIsA11yAudit = nextNodeExists
          ? nextNode.name === "a11yAudit"
          : false;

        // check if the next node is being called with parens, ie: click()
        const nextNodeHasCallExpression = nextNodeExists
          ? nextNode.parent.type === "CallExpression"
          : false;

        if (
          !nextNodeExists ||
          !nextNodeIsA11yAudit ||
          !nextNodeHasCallExpression
        ) {
          context.report({
            node,
            messageId: "a11yAuditAfterAction"
          });
        }
      }
    };
  }
};

function findExpressionParent(node) {
  if (node.type === "ExpressionStatement") {
    return node;
  }

  if (!node) {
    return node;
  }

  return findExpressionParent(node.parent);
}
