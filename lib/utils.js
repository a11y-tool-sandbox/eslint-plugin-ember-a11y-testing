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

exports.buildConfig = function buildConfig(rawConfig) {
  let firstOption = rawConfig[0] || {};

  const defaults = {
    include: [],
    exclude: [],
    auditModule: {
      package: 'ember-a11y-testing/test-support/audit',
      exportName: 'default'
    }
  }

  return {...defaults, ...firstOption};
}
