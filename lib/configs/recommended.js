import a11yAuditAfterTestHelper from "../rules/a11y-audit-after-test-helper.js";
import a11yAuditNoExpression from "../rules/a11y-audit-no-expression.js";
import a11yAuditNoGlobals from "../rules/a11y-audit-no-globals.js";

export default {
  languageOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    globals: {
      browser: true,
    },
  },
  settings: {
    "ember-a11y-testing": {
      auditModule: {
        package: "ember-a11y-testing/test-support/audit",
        exportName: "default",
      },
    },
  },
  rules: {
    "a11y-audit-after-test-helper": a11yAuditAfterTestHelper,
    "a11y-audit-no-expression": a11yAuditNoExpression,
    "a11y-audit-no-globals": a11yAuditNoGlobals,
  },
};
