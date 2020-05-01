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

runWithModernSyntax("a11y-audit-after-test-helper", rule, {
  valid: [
    // visit
    {
      code: `
      import { visit } from '@ember/test-helpers';
      visit();
      a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `
      import { visit } from '@ember/test-helpers';
      visit();
      a11yAudit();`,
      filename: TEST_FILE_NAME,
    },

    // rule not applicable outside of tests/acceptance folder
    {
      code: `import { visit } from '@ember/test-helpers'; visit();`,
      filename: "app/controllers/application.js",
    },

    // rule not applicable in non-acceptance tests
    {
      code: `import { visit } from '@ember/test-helpers'; visit();`,
      filename: "tests/integration/my-test.js",
    },

    // rule not applicable if function is excluded
    {
      code: `import { visit } from '@ember/test-helpers'; visit();`,
      filename: TEST_FILE_NAME,
      settings: {
        "ember-a11y-testing": {
          modules: {
            "@ember/test-helpers": {
              exclude: ["visit"],
            },
          },
        },
      },
    },

    //
    // smoke tests on other default test helpers
    //
    {
      code: `import { blur } from '@ember/test-helpers'; blur(); a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `import { click } from '@ember/test-helpers'; click(); a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `import { doubleClick } from '@ember/test-helpers'; doubleClick(); a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `import { focus } from '@ember/test-helpers'; focus(); a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `import { tap } from '@ember/test-helpers'; tap(); a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `import { triggerEvent } from '@ember/test-helpers'; triggerEvent(); a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `import { triggerKeyEvent } from '@ember/test-helpers'; triggerKeyEvent(); a11yAudit();`,
      filename: TEST_FILE_NAME,
    },
    {
      code: `import { triggerKeyEvent } from '@ember/test-helpers'; async function foo() { await triggerKeyEvent(); await a11yAudit(); }`,
      filename: TEST_FILE_NAME,
    },
    // for of inside await
    {
      code: `
      import { click, blur } from '@ember/test-helpers';
      async function doStuff() {
        for (const x of y) {
          await click(); a11yAudit();
          await blur(); a11yAudit();
        }
      }`,
      filename: TEST_FILE_NAME,
    },
  ],
  invalid: [
    // nested block statements
    {
      code: `import { blur, fillIn } from "@ember/test-helpers";
        async function doStuff() {
          for await (const x of y) {
            await fillIn(); await a11yAudit();
            await blur('[data-test-selector]');
          }
        }`,
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `import { blur, fillIn } from "@ember/test-helpers";
        async function doStuff() {
          for await (const x of y) {
            await fillIn(); await a11yAudit();
            await blur('[data-test-selector]'); await a11yAudit();
          }
        }`,
    },
    // renaming ember test helper using import { helper as otherVariable }
    {
      code: `import { blur as blur2 /* woo hoo */, fillIn } from "@ember/test-helpers";
        async function doStuff() {
          for await (const x of y) {
            await fillIn(); await a11yAudit();
            await blur2('[data-test-selector]');
          }
        }`,
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `import { blur as blur2 /* woo hoo */, fillIn } from "@ember/test-helpers";
        async function doStuff() {
          for await (const x of y) {
            await fillIn(); await a11yAudit();
            await blur2('[data-test-selector]'); await a11yAudit();
          }
        }`,
    },
    // doesn't try to autofix if passed to function
    {
      code: `import { fillIn } from "@ember/test-helpers"; assert.throws(fillIn('foo', 'bar'));`,
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `import { fillIn } from "@ember/test-helpers"; assert.throws(fillIn('foo', 'bar'));`,
    },
    // without adding a11yAudit after using `include` option
    {
      code: 'import {myCustom} from "custom"; myCustom();',
      settings: {
        "ember-a11y-testing": {
          modules: {
            custom: {
              include: ["myCustom"],
            },
          },
        },
      },
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `import {myCustom} from "custom"; myCustom(); a11yAudit();`,
    },
    // without adding a11yAudit after using `include` option (multiple)
    {
      code: `
        import { myCustom, anotherCustom } from 'custom';
        myCustom();
        a11yAudit();

        anotherCustom();`,
      settings: {
        "ember-a11y-testing": {
          modules: {
            custom: {
              include: ["myCustom", "anotherCustom"],
            },
          },
        },
      },
      output: `
        import { myCustom, anotherCustom } from 'custom';
        myCustom();
        a11yAudit();

        anotherCustom(); a11yAudit();`,
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
    },
    // using custom helper with ember test helpers
    {
      code: `
            import { myCustom, anotherCustom } from 'custom';
            import { click } from '@ember/test-helpers';
            myCustom();
            a11yAudit();
            click();

            anotherCustom();`,
      settings: {
        "ember-a11y-testing": {
          modules: {
            custom: {
              include: ["myCustom", "anotherCustom"],
            },
          },
        },
      },
      output: `
            import { myCustom, anotherCustom } from 'custom';
            import { click } from '@ember/test-helpers';
            myCustom();
            a11yAudit();
            click(); a11yAudit();

            anotherCustom(); a11yAudit();`,
      errors: [
        { messageId: "a11yAuditAfterHelper" },
        { messageId: "a11yAuditAfterHelper" },
      ],
      filename: TEST_FILE_NAME,
    },

    //
    // smoke tests on other default test helpers
    //
    {
      code: 'import { blur } from "@ember/test-helpers"; blur();',
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output:
        'import { blur } from "@ember/test-helpers"; blur(); a11yAudit();',
    },
    {
      code: 'import { click } from "@ember/test-helpers"; click();',
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output:
        'import { click } from "@ember/test-helpers"; click(); a11yAudit();',
    },
    {
      code: 'import { doubleClick } from "@ember/test-helpers"; doubleClick();',
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output:
        'import { doubleClick } from "@ember/test-helpers"; doubleClick(); a11yAudit();',
    },
    {
      code: 'import { focus } from "@ember/test-helpers"; focus();',
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output:
        'import { focus } from "@ember/test-helpers"; focus(); a11yAudit();',
    },
    {
      code: 'import { tap } from "@ember/test-helpers"; tap();',
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: 'import { tap } from "@ember/test-helpers"; tap(); a11yAudit();',
    },
    {
      code:
        'import { triggerEvent } from "@ember/test-helpers"; triggerEvent();',
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output:
        'import { triggerEvent } from "@ember/test-helpers"; triggerEvent(); a11yAudit();',
    },
    {
      code:
        'import { triggerKeyEvent } from "@ember/test-helpers"; triggerKeyEvent();',
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output:
        'import { triggerKeyEvent } from "@ember/test-helpers"; triggerKeyEvent(); a11yAudit();',
    },
    {
      code: `
      import { visit } from '@ember/test-helpers';
      import a11yTesting24 from "ember-a11y-testing/test-support/audit";
      async function foo() {
        await visit();
      }`,
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      filename: TEST_FILE_NAME,
      output: `
      import { visit } from '@ember/test-helpers';
      import a11yTesting24 from "ember-a11y-testing/test-support/audit";
      async function foo() {
        await visit(); await a11yTesting24();
      }`,
    },
  ],
});
