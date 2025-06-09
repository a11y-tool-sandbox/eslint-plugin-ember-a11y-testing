import * as utils from "../utils.mjs";

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

const rule = {
  meta: {
    type: "problem",
    docs: {
      description: "enforce a11yAudit must be called at least once",
      category: "Accessibility",
      recommended: true,
      url: "https://github.com/a11y-tool-sandbox/eslint-plugin-ember-a11y-testing/blob/master/lib/rules/a11y-audit-called.js",
    },
    schema: [
      {
        type: "object",
        properties: {
          auditModule: {
            type: "object",
            properties: {
              package: { type: "string" },
              exportName: { type: "string" },
            },
            required: ["package", "exportName"],
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      a11yAuditCalled: "`{{name}}` must be called",
      a11yAuditImported: "a11y audit helper must be imported",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const settings = context.settings["ember-a11y-testing"] || {};
    const auditModule = options.auditModule ||
      settings.auditModule || {
        package: "ember-a11y-testing/test-support/audit",
        exportName: "default",
      };

    let a11yAuditCalled = false;
    let a11yImportDeclaration = null;

    return {
      ImportDeclaration(node) {
        if (node.source.value === auditModule.package) {
          a11yImportDeclaration = utils.findA11yAuditImportDeclaration(
            context,
            { auditModule },
          );
        }
      },

      CallExpression(node) {
        if (!a11yImportDeclaration) return;

        let identifier = node.callee.type === "Identifier" && node.callee;
        if (!identifier || identifier.name !== a11yImportDeclaration.local.name)
          return;

        a11yAuditCalled = true;
      },

      "Program:exit": function (node) {
        if (!a11yImportDeclaration) {
          context.report({
            node,
            messageId: "a11yAuditImported",
          });
          return;
        }

        if (!a11yAuditCalled) {
          context.report({
            node,
            messageId: "a11yAuditCalled",
            data: {
              name: a11yImportDeclaration.local.name,
            },
          });
        }
      },
    };
  },
};

export default rule;
