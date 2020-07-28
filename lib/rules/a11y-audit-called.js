"use strict";

const utils = require("../utils");

/**
 * @fileoverview Enforce importing and calling a11yAudit at least once in a file.
 * @author Buck Doyle <https://github.com/backspace>
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

    description: "enforce a11yAudit must be called at least once",
    category: "Accessibility",
    recommended: true,
    url:
      "https://github.com/a11y-tool-sandbox/eslint-plugin-ember-a11y-testing/blob/master/lib/rules/a11y-audit-called.js",

    schema: [],

    messages: {
      a11yAuditCalled: "`{{name}}` must be called",
      a11yAuditImported: "a11y audit helper must be imported",
    },
  },

  create(context) {
    const settings = utils.extractSettings(context);

    const a11yImportDeclaration = utils.findA11yAuditImportDeclaration(
      context,
      settings
    );

    if (a11yImportDeclaration) {
      const a11yAuditIdentifier = a11yImportDeclaration.local.name;
      let a11yAuditCalled = false;

      return {
        "Program:exit": function (node) {
          if (!a11yAuditCalled) {
            context.report({
              node,
              messageId: "a11yAuditCalled",
              data: {
                name: a11yAuditIdentifier,
              },
            });
          }
        },

        CallExpression(node) {
          let identifier = node.callee.type === "Identifier" && node.callee;
          if (!identifier || identifier.name !== a11yAuditIdentifier) return;

          a11yAuditCalled = true;
        },
      };
    } else {
      return {
        Program: function (node) {
          context.report({
            node,
            messageId: "a11yAuditImported",
          });
        },
      };
    }
  },
};
