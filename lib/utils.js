exports.DEFAULT_A11Y_AUDIT_VARIABLE = 'a11yAudit';

exports.findParentOfType = function findParentOfType (node, types) {
  if (!node) {
    return node;
  }

  let typeMatches = false;
  if (Array.isArray(types)) {
    typeMatches = types.includes(node.type)
  } else if (types instanceof RegExp) {
    typeMatches = types.test(node.type);
  } else {
    typeMatches = types === node.type
  }

  if (typeMatches) {
    return node;
  }

  return findParentOfType(node.parent, types);
}

exports.findA11yAuditImportDeclaration = function findA11yAuditImportName(context, config) {
  const importDeclaration = context.getSourceCode().ast.body.find(({type, source}) => {
    return type === 'ImportDeclaration' && source.value === config.auditModule.package;
  });

  return importDeclaration && importDeclaration.specifiers.find((specifier) => {
    if (config.auditModule.exportName === 'default') {
      return specifier.type === 'ImportDefaultSpecifier';
    } else {
      return specifier.type === 'ImportSpecifier' && specifier.imported.name === config.auditModule.exportName;
    }
  });
}

exports.extractSettings = function extractSettings({settings}) {
  const providedSettings = settings["ember-a11y-testing"] || {};

  const defaults = {
    auditModule: {
      package: 'ember-a11y-testing/test-support/audit',
      exportName: 'default'
    }
  }

  return {...defaults, ...providedSettings};
}
