const utils = require('../utils');

module.exports = {
  meta: {
    type: "problem",
    fixable: "code",

    description: "enforce a11yAudit must be called as a function",
    category: "Accessibility",
    recommended: true,
    url: "https://github.com/jgwhite/eslint-plugin-ember-a11y-testing/blob/master/lib/rules/a11y-audit-no-expression.js",

    messages: {
      a11yAuditMustBeCalled: "a11yAudit must be called as a function and can't be used as a value. Replace `a11yAudit` with added parens, e.g. `a11yAudit()`",
    },
    schema: [{
      "type": "object",
      "properties": {
        "auditModule": {
          "type": "object",
          "items": {
            "package": "string",
            "exportName": "string"
          }
        }
      }
    }],
  },
  create(context) {
    const options = Array.isArray(context.options) ?
      context.options[0] && context.options[0].auditModule || {} :
      {};

    const defaults = {
      package: 'ember-a11y-testing/test-support/audit',
      exportName: 'default'
    };
    const config = {...defaults, ...options};
    return {
      ExpressionStatement: function(node) {
        const a11yIdentifier = findA11yAuditIdentifier(node.expression, context, config);
        if (node.expression.type === "Identifier" && node.expression.name === a11yIdentifier) {
          context.report({
            node,
            messageId: "a11yAuditMustBeCalled",
            fix(fixer) {
              const functionParent = findParentFunction(node);
              const prefix = functionParent && functionParent.async ? 'await ' : '';
              return fixer.replaceText(node.expression, `${prefix}${node.expression.name}()`);
            }
          })
        }
      },
      AwaitExpression: function(node) {
        const a11yIdentifier = findA11yAuditIdentifier(node.argument, context, config);
        if (node.argument && node.argument.type === "Identifier" && node.argument.name === a11yIdentifier) {
          context.report({
            node,
            messageId: "a11yAuditMustBeCalled",
            fix(fixer) {
              return fixer.replaceText(node.argument, `${node.argument.name}()`);
            }
          })
        }
      }
    }
  }
};


function findParentFunction(node) {
  if (!node) {
    return node;
  }
  if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
    return node;
  }
  return findParentFunction(node.parent);
}


/*
  this is intended to be used to find the name of the emberA11y import name, but in reverse.
  For example:

  test('my test', function() {
    await foo();
    await a11yAudit();
          ^ tries to figure out the name of the import
  })

  This makes it so you can copy
*/
function findA11yAuditIdentifier(node, context, config) {
  const defaultImportVariableName = 'a11yAudit'
  const ref = context.getScope(node).references.find(({identifier: { name }, }) => name === node.name);
  if (!ref || !ref.resolved) return defaultImportVariableName;
  const def = ref.resolved.defs.find((def) => {
    const { type } = def
    if (type === 'ImportBinding') {
      if (config.exportName === 'default') {
        return def.node.type === 'ImportDefaultSpecifier' && def.parent.source.value === config.package
      } else  {
        return def.node.type === 'ImportSpecifier' && def.node.imported.name === config.exportName && def.parent.source.value === config.package;
      }
    }
  });
  return (def && def.name.name) || defaultImportVariableName;
}