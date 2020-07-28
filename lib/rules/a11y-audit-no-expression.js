const utils = require("../utils");

module.exports = {
  meta: {
    type: "problem",
    fixable: "code",

    description: "enforce a11yAudit must be called as a function",
    category: "Accessibility",
    recommended: true,
    url:
      "https://github.com/a11y-tool-sandbox/eslint-plugin-ember-a11y-testing/blob/master/lib/rules/a11y-audit-no-expression.js",

    messages: {
      a11yAuditMustBeCalled:
        "a11yAudit must be called as a function. Replace `a11yAudit` with added parens, e.g. `a11yAudit()`",
    },
    schema: [],
  },
  create(context) {
    const settings = utils.extractSettings(context);
    return {
      ExpressionStatement: function (node) {
        const a11yIdentifier = findA11yAuditIdentifier(
          node.expression,
          context,
          settings
        );
        if (
          node.expression.type === "Identifier" &&
          node.expression.name === a11yIdentifier
        ) {
          context.report({
            node,
            messageId: "a11yAuditMustBeCalled",
            fix(fixer) {
              const functionParent = utils.findParentOfType(node, /Function/);
              const prefix =
                functionParent && functionParent.async ? "await " : "";
              return fixer.replaceText(
                node.expression,
                `${prefix}${node.expression.name}()`
              );
            },
          });
        }
      },
      AwaitExpression: function (node) {
        const a11yIdentifier = findA11yAuditIdentifier(
          node.argument,
          context,
          settings
        );
        if (
          node.argument &&
          node.argument.type === "Identifier" &&
          node.argument.name === a11yIdentifier
        ) {
          context.report({
            node,
            messageId: "a11yAuditMustBeCalled",
            fix(fixer) {
              return fixer.replaceText(
                node.argument,
                `${node.argument.name}()`
              );
            },
          });
        }
      },
    };
  },
};

/*
  this is intended to be used to find the name of the emberA11y import name, but in reverse.
  For example:

  test('my test', function() {
    await foo();
    await a11yAudit();
          ^ tries to figure out the name of the import
  })

  This makes it so you can use variable bindings:

  // still valid
  const a11yTest = a11yAudit;

  or rewrite with imports:

  import { a11yAudit as foo } from 'package';
*/
function findA11yAuditIdentifier(node, context, settings) {
  const defaultImportVariableName = utils.DEFAULT_A11Y_AUDIT_VARIABLE;
  const ref = context
    .getScope(node)
    .references.find(({ identifier: { name } }) => name === node.name);
  if (!ref || !ref.resolved) return defaultImportVariableName;
  const def = ref.resolved.defs.find((def) => {
    const { type } = def;
    if (type === "ImportBinding") {
      if (settings.auditModule.exportName === "default") {
        return (
          def.node.type === "ImportDefaultSpecifier" &&
          def.parent.source.value === settings.auditModule.package
        );
      } else {
        return (
          def.node.type === "ImportSpecifier" &&
          def.node.imported.name === settings.auditModule.exportName &&
          def.parent.source.value === settings.auditModule.package
        );
      }
    }
  });
  return (def && def.name.name) || defaultImportVariableName;
}
