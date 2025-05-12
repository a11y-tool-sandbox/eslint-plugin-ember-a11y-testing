export const DEFAULT_A11Y_AUDIT_VARIABLE = "a11yAudit";

export function extractSettings(context) {
  const settings = context.settings["ember-a11y-testing"] || {};
  return {
    auditModule: settings.auditModule || {
      package: "ember-a11y-testing/test-support/audit",
      exportName: "default",
    },
    modules: settings.modules || {
      "@ember/test-helpers": {
        include: [
          "blur",
          "click",
          "doubleClick",
          "fillIn",
          "focus",
          "tap",
          "triggerEvent",
          "triggerKeyEvent",
          "visit",
        ],
        exclude: [],
      },
    },
  };
}

export function extractModules(settings) {
  return (
    settings.modules || {
      "@ember/test-helpers": {
        include: [
          "blur",
          "click",
          "doubleClick",
          "fillIn",
          "focus",
          "tap",
          "triggerEvent",
          "triggerKeyEvent",
          "visit",
        ],
        exclude: [],
      },
    }
  );
}

export function findA11yAuditImportDeclaration(context, settings) {
  const sourceCode = context.getSourceCode();
  const importDeclarations = sourceCode.ast.body.filter(({ type, source }) => {
    return (
      type === "ImportDeclaration" &&
      source &&
      source.value === settings.auditModule.package
    );
  });
  const importSpecifiers = importDeclarations.reduce((memo, { specifiers }) => {
    const matching = specifiers.filter(({ type, imported }) => {
      if (type === "ImportDefaultSpecifier") {
        return true;
      } else if (type === "ImportSpecifier") {
        return imported.name === DEFAULT_A11Y_AUDIT_VARIABLE;
      }
    });
    return memo.concat(matching);
  }, []);
  return importSpecifiers[0];
}

export function findParentOfType(node, type) {
  let parent = node.parent;
  while (parent) {
    if (typeof type === "string" && parent.type === type) {
      return parent;
    } else if (type instanceof RegExp && type.test(parent.type)) {
      return parent;
    }
    parent = parent.parent;
  }
  return null;
}
