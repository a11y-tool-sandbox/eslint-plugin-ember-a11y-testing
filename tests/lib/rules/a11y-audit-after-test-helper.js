"use strict";

/**
 * @fileoverview Tests for a11y-audit-after-test-helper rule.
 * @author Chad Carbert <https://github.com/chadian>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/a11y-audit-after-test-helper");
const { RuleTester } = require("eslint/lib/rule-tester");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const TEST_FILE_NAME = "tests/acceptance/application-test.js";
const ruleTester = new RuleTester();

ruleTester.run("a11y-audit-after-test-helper", rule, {
  valid: [
    // visit
    {
      code: `visit(); a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `visit();
      a11yAudit();`,
      filename: TEST_FILE_NAME,
    },

    // rule not applicable outside of tests/acceptance folder
    {
      code: `visit();`,
      filename: "app/controllers/application.js",
    },

    // rule not applicable in non-acceptance tests
    {
      code: `visit();`,
      filename: "tests/integration/my-test.js",
    },

    // rule not applicable if function is excluded
    {
      code: `visit();`,
      filename: TEST_FILE_NAME,
      options: [
        {
          exclude: ["visit"],
        },
      ],
    },

    //
    // smoke tests on other default test helpers
    //
    {
      code: `blur(); a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `click(); a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `doubleClick(); a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `focus(); a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `tap(); a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `triggerEvent(); a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `triggerKeyEvent(); a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `async function foo() { await triggerKeyEvent(); await a11yAudit(); }`,
      filename: TEST_FILE_NAME,
      parserOptions: {
        ecmaVersion: "2018",
      },
    },
    // for of inside await
    {
      code: `async function doStuff() {
        for (const x of y) {
          await click(); a11yAudit();
          await blur(); a11yAudit();
        }
      }`,
      filename: TEST_FILE_NAME,
      parserOptions: {
        ecmaVersion: "2019",
      },
    },
  ],
  invalid: [
    // nested block statements
    {
      code: `async function doStuff() {
        for await (const x of y) {
          await fillIn(); await a11yAudit();
          await blur('[data-test-selector]');
        }
      }`,
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `async function doStuff() {
        for await (const x of y) {
          await fillIn(); await a11yAudit();
          await blur('[data-test-selector]'); await a11yAudit();
        }
      }`,
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
      },
    },
    // doesn't try to autofix if passed to function
    {
      code: `assert.throws(fillIn('foo', 'bar'));`,
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `assert.throws(fillIn('foo', 'bar'));`,
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
      },
    },
    // without adding a11yAudit after using `include` option
    {
      code: "myCustom();",
      options: [
        {
          include: ["myCustom"],
        },
      ],
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `myCustom(); a11yAudit();`,
    },
    // without adding a11yAudit after using `include` option (multiple)
    {
      code: `
        myCustom();
        a11yAudit();

        anotherCustom();`,
      options: [
        {
          include: ["myCustom", "anotherCustom"],
        },
      ],
      output: `
        myCustom();
        a11yAudit();

        anotherCustom(); a11yAudit();`,
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
    },

    //
    // smoke tests on other default test helpers
    //

    {
      code: "blur();",
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `blur(); a11yAudit();`,
    },
    {
      code: "click();",
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `click(); a11yAudit();`,
    },
    {
      code: "doubleClick();",
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `doubleClick(); a11yAudit();`,
    },
    {
      code: "focus();",
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `focus(); a11yAudit();`,
    },
    {
      code: "tap();",
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `tap(); a11yAudit();`,
    },
    {
      code: "triggerEvent();",
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `triggerEvent(); a11yAudit();`,
    },
    {
      code: "triggerKeyEvent();",
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `triggerKeyEvent(); a11yAudit();`,
    },
    {
      code: `
      import a11yTesting24 from "ember-a11y-testing/test-support/audit";
      async function foo() {
        await visit();
      }`,
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `
      import a11yTesting24 from "ember-a11y-testing/test-support/audit";
      async function foo() {
        await visit(); await a11yTesting24();
      }`,
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
    },
  ],
});
