"use strict";

const utils = require("../utils");

/**
 * @fileoverview Enforce a11yAudit must be imported from the desired package.
 * @author Stanley Stuart <https://github.com/fivetanley>
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

    description: "enforce a11yAudit must be imported",
    category: "Accessibility",
    recommended: true,
    url:
      "https://github.com/a11y-tool-sandbox/eslint-plugin-ember-a11y-testing/blob/master/lib/rules/a11y-audit-no-globals.js",

    schema: [],

    messages: {
      a11yAuditNoGlobals: "'{{name}} must be imported from {{package}}",
      a11yAuditNoGlobalsUseImportName:
        "'{{name}} is not defined in this file, but {{a11yIdentifier}} is already imported from {{package}}. Change variable name to `{{a11yIdentifier}}` instead",
    },
  },

  create(context) {
    const settings = utils.extractSettings(context);

    const a11yImportDeclaration = utils.findA11yAuditImportDeclaration(
      context,
      settings
    );
    const a11yAuditIdentifier = a11yImportDeclaration
      ? a11yImportDeclaration.local.name
      : utils.DEFAULT_A11Y_AUDIT_VARIABLE;

    return {
      CallExpression(node) {
        let identifier = node.callee.type === "Identifier" && node.callee;
        if (
          !identifier ||
          identifier.name !== utils.DEFAULT_A11Y_AUDIT_VARIABLE
        )
          return;
        if (a11yImportDeclaration && a11yAuditIdentifier !== "a11yAudit") {
          context.report({
            node,
            messageId: "a11yAuditNoGlobalsUseImportName",
            data: {
              name: identifier.name,
              package: settings.auditModule.package,
              a11yIdentifier: a11yAuditIdentifier,
            },
            fix(fixer) {
              return fixer.replaceText(identifier, a11yAuditIdentifier);
            },
          });
        } else if (!a11yImportDeclaration) {
          context.report({
            node,
            messageId: "a11yAuditNoGlobals",
            data: {
              name: identifier.name,
              package: settings.auditModule.package,
            },
            fix(fixer) {
              const sourceCode = context.getSourceCode();
              let importVariable;
              if (settings.auditModule.exportName === "default") {
                importVariable = `${a11yAuditIdentifier}`;
              } else {
                let prefix = "";
                if (
                  settings.auditModule.exportName !==
                  utils.DEFAULT_A11Y_AUDIT_VARIABLE
                ) {
                  prefix = `${settings.auditModule.exportName} as `;
                }
                importVariable = `{ ${prefix}${a11yAuditIdentifier} }`;
              }
              const importDeclarations = sourceCode.ast.body.filter(
                ({ type }) => type === "ImportDeclaration"
              );
              const lastImportDeclaration =
                importDeclarations[importDeclarations.length - 1];
              if (lastImportDeclaration) {
                return fixer.insertTextAfter(
                  lastImportDeclaration,
                  `\nimport ${importVariable} from '${settings.auditModule.package}';`,
                  { skipComments: true }
                );
              }
              return fixer.insertTextBefore(
                sourceCode.ast.body[0],
                `import ${importVariable} from '${settings.auditModule.package}';\n`,
                { skipComments: true }
              );
            },
          });
        }
      },
    };
  },
};
