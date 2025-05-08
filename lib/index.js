/**
 * @fileoverview ESLint plugin for ember-a11y-testing
 * @author Jamie White
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import a11yAuditAfterTestHelper from "./rules/a11y-audit-after-test-helper.js";
import a11yAuditCalled from "./rules/a11y-audit-called.js";
import a11yAuditNoExpression from "./rules/a11y-audit-no-expression.js";
import a11yAuditNoGlobals from "./rules/a11y-audit-no-globals.js";
import recommended from "./configs/recommended.js";

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

export default {
  rules: {
    "a11y-audit-after-test-helper": a11yAuditAfterTestHelper,
    "a11y-audit-called": a11yAuditCalled,
    "a11y-audit-no-expression": a11yAuditNoExpression,
    "a11y-audit-no-globals": a11yAuditNoGlobals,
  },
  configs: {
    recommended,
  },
};
