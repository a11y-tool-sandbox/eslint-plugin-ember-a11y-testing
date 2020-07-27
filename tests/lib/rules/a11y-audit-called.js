"use strict";

/**
 * @fileoverview Tests for a11y-audit-called rule.
 * @author Buck Doyle <https://github.com/backspace>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/a11y-audit-called");
const { RuleTester } = require("eslint/lib/rule-tester");
const { stripIndents: code } = require("common-tags");

// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

function runWithModernSyntax(testName, rule, options) {
  const makeTestModern = (testCase) => {
    const defaultParserOptions = {
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
      },
    };
    return {
      ...defaultParserOptions,
      ...testCase,
    };
  };
  const validCases = (options.valid || []).map(makeTestModern);
  const invalidCases = (options.invalid || []).map(makeTestModern);
  return ruleTester.run(testName, rule, {
    ...options,
    valid: validCases,
    invalid: invalidCases,
  });
}

runWithModernSyntax("a11y-audit-called", rule, {
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
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
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
