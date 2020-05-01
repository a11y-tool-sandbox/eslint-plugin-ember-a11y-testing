"use strict";

/**
 * @fileoverview Tests that `a11yAudit` is called as a function. Prevents accidentally comitting code like
 * `a11yAudit` (no parens, so the audit doens't actually run)
 * @author Stanley Stuart <https://github.com/fivetanley>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/a11y-audit-no-expression");
const { RuleTester } = require("eslint/lib/rule-tester");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

ruleTester.run("a11y-audit-no-expression", rule, {
  valid: [
    // visit
    {
      code: `visit(); a11yAudit();`,
    },
    // import alias works
    {
      code: `import a11yAudit2 from 'ember-a11y-testing/ember-a11y-testing/test-support/audit'; (async () => { visit(); await a11yAudit2; })`,
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
    },
    // custom module used
    {
      code:
        'import { audit } from "dashboard/tests/helpers/audit"; (async () => { while(true) { visit(); await audit(); } })();',
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
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
      code:
        'import audit from "dashboard/tests/helpers/audit"; (async () => { while(true) { visit(); await audit(); } })();',
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
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
      code:
        'import audit from "dashboard/tests/helpers/audit"; const audit2 = audit; (async () => { while(true) { visit(); await audit2(); } })();',
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
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
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
      errors: [{ messageId: "a11yAuditMustBeCalled" }],
      output:
        "import a11yAudit24 from 'ember-a11y-testing/test-support/audit'; (async () => { visit(); await a11yAudit24(); })()",
    },
    {
      code: `import a11yAudit24 from 'ember-a11y-testing/test-support/audit'; (async () => { visit(); await a11yAudit24; })()`,
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
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
      parserOptions: {
        ecmaVersion: "2018",
      },
    },
    // async function with block statements
    {
      code: "(async function () { while(true) { visit(); a11yAudit; } })();",
      errors: [{ messageId: "a11yAuditMustBeCalled" }],
      output:
        "(async function () { while(true) { visit(); await a11yAudit(); } })();",
      parserOptions: {
        ecmaVersion: "2018",
      },
    },
    // async arrow function
    {
      code: "(async () => { while(true) { visit(); a11yAudit; } })();",
      errors: [{ messageId: "a11yAuditMustBeCalled" }],
      output:
        "(async () => { while(true) { visit(); await a11yAudit(); } })();",
      parserOptions: {
        ecmaVersion: "2018",
      },
    },
    // custom module used
    {
      code:
        'import { audit } from "dashboard/tests/helpers/audit"; (async () => { while(true) { visit(); audit; } })();',
      errors: [{ messageId: "a11yAuditMustBeCalled" }],
      output:
        'import { audit } from "dashboard/tests/helpers/audit"; (async () => { while(true) { visit(); await audit(); } })();',
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
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
      code:
        'import audit from "dashboard/tests/helpers/audit"; (async () => { while(true) { visit(); audit; } })();',
      errors: [{ messageId: "a11yAuditMustBeCalled" }],
      output:
        'import audit from "dashboard/tests/helpers/audit"; (async () => { while(true) { visit(); await audit(); } })();',
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
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
