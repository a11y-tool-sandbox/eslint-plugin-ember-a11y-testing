"use strict";

/**
 * @fileoverview Tests that `a11yAudit` is called as a function. Prevents accidentally comitting code like
 * `a11yAudit` (no parens, so the audit doens't actually run)
 * @author Stanley Stuart <https://github.com/fivetanley>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { RuleTester } from "eslint";
import rule from "../../../lib/rules/a11y-audit-no-expression.mjs";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
});

ruleTester.run("a11y-audit-no-expression", rule, {
  valid: [
    // visit
    {
      code: `visit(); a11yAudit();`,
    },
    // import alias works
    {
      code: `import a11yAudit2 from 'ember-a11y-testing/ember-a11y-testing/test-support/audit'; (async () => { visit(); await a11yAudit2; })`,
    },
    // custom module used
    {
      code: 'import { audit } from "dashboard/tests/helpers/audit"; (async () => { while(true) { visit(); await audit(); } })();',
      settings: {
        "ember-a11y-testing": {
          auditModule: {
            package: "dashboard/tests/helpers/audit",
            exportName: "audit",
          },
        },
      },
    },
    // custom module used, default import specifier
    {
      code: 'import audit from "dashboard/tests/helpers/audit"; (async () => { while(true) { visit(); await audit(); } })();',
      settings: {
        "ember-a11y-testing": {
          auditModule: {
            package: "dashboard/tests/helpers/audit",
            exportName: "default",
          },
        },
      },
    },
    // custom module used, default import specifier, but copied to another var
    {
      code: 'import audit from "dashboard/tests/helpers/audit"; const audit2 = audit; (async () => { while(true) { visit(); await audit2(); } })();',
      settings: {
        "ember-a11y-testing": {
          auditModule: {
            package: "dashboard/tests/helpers/audit",
            exportName: "default",
          },
        },
      },
    },
  ],
  invalid: [
    // import aliases work
    {
      code: `import a11yAudit24 from 'ember-a11y-testing/test-support/audit'; (async () => { visit(); await a11yAudit24; })()`,
      errors: [{ messageId: "a11yAuditMustBeCalled" }],
      output:
        "import a11yAudit24 from 'ember-a11y-testing/test-support/audit'; (async () => { visit(); await a11yAudit24(); })()",
    },
    // referencing without calling a11yAudit after
    {
      code: "visit(); a11yAudit;",
      errors: [{ messageId: "a11yAuditMustBeCalled" }],
      output: "visit(); a11yAudit();",
    },
    // async function
    {
      code: "(async function () { visit(); a11yAudit; })();",
      errors: [{ messageId: "a11yAuditMustBeCalled" }],
      output: "(async function () { visit(); await a11yAudit(); })();",
    },
    // async function with block statements
    {
      code: "(async function () { while(true) { visit(); a11yAudit; } })();",
      errors: [{ messageId: "a11yAuditMustBeCalled" }],
      output:
        "(async function () { while(true) { visit(); await a11yAudit(); } })();",
    },
    // async arrow function
    {
      code: "(async () => { while(true) { visit(); a11yAudit; } })();",
      errors: [{ messageId: "a11yAuditMustBeCalled" }],
      output:
        "(async () => { while(true) { visit(); await a11yAudit(); } })();",
    },
    // custom module used
    {
      code: 'import { audit } from "dashboard/tests/helpers/audit"; (async () => { while(true) { visit(); audit; } })();',
      errors: [{ messageId: "a11yAuditMustBeCalled" }],
      output:
        'import { audit } from "dashboard/tests/helpers/audit"; (async () => { while(true) { visit(); await audit(); } })();',
      settings: {
        "ember-a11y-testing": {
          auditModule: {
            package: "dashboard/tests/helpers/audit",
            exportName: "audit",
          },
        },
      },
    },
    // custom module used, default import specifier
    {
      code: 'import audit from "dashboard/tests/helpers/audit"; (async () => { while(true) { visit(); audit; } })();',
      errors: [{ messageId: "a11yAuditMustBeCalled" }],
      output:
        'import audit from "dashboard/tests/helpers/audit"; (async () => { while(true) { visit(); await audit(); } })();',
      settings: {
        "ember-a11y-testing": {
          auditModule: {
            package: "dashboard/tests/helpers/audit",
            exportName: "default",
          },
        },
      },
    },
  ],
});
