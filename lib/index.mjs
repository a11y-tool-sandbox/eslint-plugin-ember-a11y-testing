/**
 * @fileoverview ESLint plugin for ember-a11y-testing
 * @author Jamie White
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import a11yAuditAfterTestHelper from "./rules/a11y-audit-after-test-helper.mjs";
import a11yAuditCalled from "./rules/a11y-audit-called.mjs";
import a11yAuditNoExpression from "./rules/a11y-audit-no-expression.mjs";
import a11yAuditNoGlobals from "./rules/a11y-audit-no-globals.mjs";

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

const rules = {
  "a11y-audit-after-test-helper": a11yAuditAfterTestHelper,
  "a11y-audit-called": a11yAuditCalled,
  "a11y-audit-no-expression": a11yAuditNoExpression,
  "a11y-audit-no-globals": a11yAuditNoGlobals,
};

export default {
  rules,
  configs: {
    recommended: {
      languageOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
        globals: {
          browser: true,
        },
      },
      plugins: {
        "ember-a11y-testing": { rules },
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
        "ember-a11y-testing/a11y-audit-after-test-helper": "error",
        "ember-a11y-testing/a11y-audit-no-expression": "error",
        "ember-a11y-testing/a11y-audit-no-globals": "error",
      },
    },
  },
};
