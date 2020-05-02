exports.DEFAULT_A11Y_AUDIT_VARIABLE = "a11yAudit";

exports.findParentOfType = function findParentOfType(node, types) {
  if (!node) {
    return node;
  }

  let typeMatches = false;
  if (Array.isArray(types)) {
    typeMatches = types.includes(node.type);
  } else if (types instanceof RegExp) {
    typeMatches = types.test(node.type);
  } else {
    typeMatches = types === node.type;
  }

  if (typeMatches) {
    return node;
  }

  return findParentOfType(node.parent, types);
};

exports.findA11yAuditImportDeclaration = function findA11yAuditImportName(
  context,
  config
) {
  const importDeclaration = context
    .getSourceCode()
    .ast.body.find(({ type, source }) => {
      return (
        type === "ImportDeclaration" &&
        source.value === config.auditModule.package
      );
    });

  return (
    importDeclaration &&
    importDeclaration.specifiers.find((specifier) => {
      if (config.auditModule.exportName === "default") {
        return specifier.type === "ImportDefaultSpecifier";
      } else {
        return (
          specifier.type === "ImportSpecifier" &&
          specifier.imported.name === config.auditModule.exportName
        );
      }
    })
  );
};

exports.extractSettings = function extractSettings({ settings }) {
  const providedSettings = settings["ember-a11y-testing"] || {};

  const defaults = {
    auditModule: {
      package: "ember-a11y-testing/test-support/audit",
      exportName: "default",
    },
  };

  return { ...defaults, ...providedSettings };
};

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

exports.extractModules = function extractModules(settings) {
  const modz = settings.modules || {};
  const emberTestHelpersDefaults = {
    include: defaultTestHelperFunctions,
    exclude: [],
  };
  let emberTestHelpersConfig = modz["@ember/test-helpers"] || {};
  emberTestHelpersConfig = {
    ...emberTestHelpersDefaults,
    ...emberTestHelpersConfig,
  };
  const modzWithDefaults = {
    "@ember/test-helpers": emberTestHelpersConfig,
    ...modz,
  };
  return Object.entries(modzWithDefaults).reduce(
    (memo, [sourceName, config]) => {
      memo[sourceName] = {
        include: [],
        exclude: [],
        ...config,
      };
      return memo;
    },
    {}
  );
};
