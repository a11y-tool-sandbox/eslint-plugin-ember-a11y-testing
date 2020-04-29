module.exports = {
  root: true,

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },

  env: {
    browser: true,
    es6: true,
  },

  plugins: ["ember-a11y-testing"],
  settings: {
    "ember-a11y-testing": {
      auditModule: {
        package: "ember-a11y-testing/test-support/audit",
        exportName: "default",
      },
    },
  },

  rules: {
    "ember-a11y-testing/a11y-audit": "error",
    "ember-a11y-testing/a11y-audit-after-test-helper": "error",
    "ember-a11y-testing/a11y-audit-no-expression": "error",
    "ember-a11y-testing/a11y-audit-no-globals": "error",
  },
};
