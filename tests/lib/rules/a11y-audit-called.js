"use strict";

/**
 * @fileoverview Tests for a11y-audit-called rule.
 * @author Buck Doyle <https://github.com/backspace>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { RuleTester } from "eslint";
import rule from "../../../lib/rules/a11y-audit-called.js";
import { stripIndents as code } from "common-tags";

// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
});

ruleTester.run("a11y-audit-called", rule, {
  valid: [
    {
      code: code`import a11yAudit from 'ember-a11y-testing/test-support/audit';
      a11yAudit();`,
    },
    {
      code: code`import a11yAudit from 'ember-a11y-testing/test-support/audit';
      import { visit } from '@ember/test-helpers';

      function test1() {
        visit();
        a11yAudit();
      }

      function test2() {
        visit();
      }`,
    },
    {
      code: `import a11yAudit2 from 'custom-module'; a11yAudit2();`,
      settings: {
        "ember-a11y-testing": {
          auditModule: {
            package: "custom-module",
            exportName: "default",
          },
        },
      },
    },
  ],
  invalid: [
    {
      code: code`
            import { fillIn } from "@ember/test-helpers";
            import a11yAudit from 'ember-a11y-testing/test-support/audit';
            async function doStuff() {
              return fillIn('#hi');
            }`,
      errors: [{ messageId: "a11yAuditCalled" }],
    },
    {
      code: `import audit from 'custom-module'; a11yAudit();`,
      errors: [{ messageId: "a11yAuditCalled" }],
      settings: {
        "ember-a11y-testing": {
          auditModule: {
            package: "custom-module",
            exportName: "default",
          },
        },
      },
    },
    {
      code: `a11yAudit();`,
      errors: [{ messageId: "a11yAuditImported" }],
    },
  ],
});
