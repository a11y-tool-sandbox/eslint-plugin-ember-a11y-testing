import * as utils from "../utils.mjs";

/**
 * @fileoverview Tests that `a11yAudit` is imported from the desired package.
 * @author Stanley Stuart <https://github.com/fivetanley>
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
    fixable: "code",
    docs: {
      description: "enforce a11yAudit must be imported",
      category: "Accessibility",
      recommended: true,
      url: "https://github.com/a11y-tool-sandbox/eslint-plugin-ember-a11y-testing/blob/master/lib/rules/a11y-audit-no-globals.js",
    },
    schema: [],
    messages: {
      a11yAuditNoGlobals: "a11yAudit must be imported",
      a11yAuditNoGlobalsUseImportName: "Use imported a11yAudit name",
    },
  },

  create(context) {
    const settings = utils.extractSettings(context);

    return {
      Identifier(node) {
        if (node.name !== utils.DEFAULT_A11Y_AUDIT_VARIABLE) return;
        if (node.parent.type === "ImportDefaultSpecifier") return;
        if (node.parent.type === "ImportSpecifier") return;
        if (node.parent.type === "MemberExpression") return;

        const a11yImportDeclaration = utils.findA11yAuditImportDeclaration(
          context,
          settings,
        );

        // If there's any import from the audit module, suggest using that
        const hasAuditImport = context
          .getSourceCode()
          .ast.body.some(
            (node) =>
              node.type === "ImportDeclaration" &&
              node.source.value === settings.auditModule.package,
          );

        // Don't report if the identifier is already properly imported
        if (
          a11yImportDeclaration &&
          node.name === a11yImportDeclaration.local.name
        ) {
          return;
        }

        // Check if there's already an import from the same module
        const existingImport = context
          .getSourceCode()
          .ast.body.find(
            (node) =>
              node.type === "ImportDeclaration" &&
              node.source.value === settings.auditModule.package,
          );

        const messageId = hasAuditImport
          ? "a11yAuditNoGlobalsUseImportName"
          : "a11yAuditNoGlobals";

        context.report({
          node,
          messageId,
          fix(fixer) {
            if (hasAuditImport && a11yImportDeclaration) {
              return fixer.replaceText(node, a11yImportDeclaration.local.name);
            }

            // If there's already an import from the same module, use that name
            if (existingImport) {
              const importedName = existingImport.specifiers[0].local.name;
              return fixer.replaceText(node, importedName);
            }

            const importStatement =
              settings.auditModule.exportName === "default"
                ? `import ${utils.DEFAULT_A11Y_AUDIT_VARIABLE} from '${settings.auditModule.package}';`
                : `import { ${settings.auditModule.exportName} as ${utils.DEFAULT_A11Y_AUDIT_VARIABLE} } from '${settings.auditModule.package}';`;

            const program = context.getSourceCode().ast;
            const lastImport = program.body.reduce((memo, node, index) => {
              if (node.type === "ImportDeclaration") {
                return index;
              }
              return memo;
            }, -1);

            if (lastImport === -1) {
              return fixer.insertTextBefore(program, importStatement + "\n");
            }

            const lastImportNode = program.body[lastImport];
            return fixer.insertTextAfter(
              lastImportNode,
              "\n" + importStatement,
            );
          },
        });
      },
    };
  },
};

export default rule;
