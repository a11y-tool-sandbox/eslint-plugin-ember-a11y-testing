"use strict";

/**
 * @fileoverview Tests for a11y-audit-after-test-helper rule.
 * @author Chad Carbert <https://github.com/chadian>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { RuleTester } from "eslint";
import rule from "../../../lib/rules/a11y-audit-after-test-helper.mjs";
import { stripIndents as code } from "common-tags";

// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
});

ruleTester.run("a11y-audit-after-test-helper", rule, {
  valid: [
    // visit
    {
      code: code`
      import { visit } from '@ember/test-helpers';
      visit();
      a11yAudit();`,
    },

    // rule not applicable if function is excluded
    {
      code: code`import { visit } from '@ember/test-helpers'; visit();`,
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
      code: code`import { blur } from '@ember/test-helpers'; blur();\na11yAudit();`,
    },
    {
      code: code`import { click } from '@ember/test-helpers'; click();\na11yAudit();`,
    },
    {
      code: code`import { doubleClick } from '@ember/test-helpers'; doubleClick();\na11yAudit();`,
    },
    {
      code: code`import { focus } from '@ember/test-helpers'; focus();\na11yAudit();`,
    },
    {
      code: code`import { tap } from '@ember/test-helpers'; tap();\na11yAudit();`,
    },
    {
      code: code`import { triggerEvent } from '@ember/test-helpers'; triggerEvent();\na11yAudit();`,
    },
    {
      code: code`import { triggerKeyEvent } from '@ember/test-helpers'; triggerKeyEvent();\na11yAudit();`,
    },
    {
      code: code`import { triggerKeyEvent } from '@ember/test-helpers'; async function foo() { await triggerKeyEvent();\nawait a11yAudit(); }`,
    },
    // for of inside await
    {
      code: code`
      import { click, blur } from '@ember/test-helpers';
      async function doStuff() {
        for (const x of y) {
          await click();
          a11yAudit();
          await blur();
          a11yAudit();
        }
      }`,
    },
    // when helper is a11yAudit is returned
    {
      code: code`
      import { click } from '@ember/test-helpers';
      import a11yAudit from 'ember-a11y-audit/test-support/audit';
      async function doStuff() {
        await click('.the-btn');
        return a11yAudit();
      }`,
    },
  ],
  invalid: [
    // returning a helper
    {
      code: code`import { fillIn } from "@ember/test-helpers";
            async function doStuff() {
              return fillIn('#hi');
            }`,
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      output: code`import { fillIn } from "@ember/test-helpers";
            async function doStuff() {
              await fillIn('#hi');
              return a11yAudit();
            }`,
    },
    // nested block statements
    {
      code: code`import { blur, fillIn } from "@ember/test-helpers";
        async function doStuff() {
          for await (const x of y) {
            await fillIn();
            await a11yAudit();
            await blur('[data-test-selector]');
          }
        }`,
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      output: code`import { blur, fillIn } from "@ember/test-helpers";
        async function doStuff() {
          for await (const x of y) {
            await fillIn();
            await a11yAudit();
            await blur('[data-test-selector]');
            await a11yAudit();
          }
        }`,
    },
    // renaming ember test helper using import { helper as otherVariable }
    {
      code: code`import { blur as blur2 /* woo hoo */, fillIn } from "@ember/test-helpers";
        async function doStuff() {
          for await (const x of y) {
            await fillIn();
            await a11yAudit();
            await blur2('[data-test-selector]');
          }
        }`,
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      output: code`import { blur as blur2 /* woo hoo */, fillIn } from "@ember/test-helpers";
        async function doStuff() {
          for await (const x of y) {
            await fillIn();
            await a11yAudit();
            await blur2('[data-test-selector]');
            await a11yAudit();
          }
        }`,
    },
    // doesn't try to autofix if passed to function
    {
      code: "import { fillIn } from \"@ember/test-helpers\"; assert.throws(fillIn('foo', 'bar'));",
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      output: null,
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
      output: code`import {myCustom} from "custom"; myCustom();\na11yAudit();`,
    },
    // without adding a11yAudit after using `include` option (multiple)
    {
      code: code`
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
      output: code`
        import { myCustom, anotherCustom } from 'custom';
        myCustom();
        a11yAudit();

        anotherCustom();
        a11yAudit();`,
      errors: [{ messageId: "a11yAuditAfterHelper" }],
    },
    // using custom helper with ember test helpers
    {
      code: code`
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
      output: code`
        import { myCustom, anotherCustom } from 'custom';
        import { click } from '@ember/test-helpers';
        myCustom();
        a11yAudit();
        click();
        a11yAudit();

        anotherCustom();
        a11yAudit();`,
      errors: [
        { messageId: "a11yAuditAfterHelper" },
        { messageId: "a11yAuditAfterHelper" },
      ],
    },
    // using custom helper (default import)
    {
      code: code`
        import myCustom from 'custom';
        myCustom();`,
      settings: {
        "ember-a11y-testing": {
          modules: {
            custom: {
              include: ["default"],
            },
          },
        },
      },
      output: code`
        import myCustom from 'custom';
        myCustom();
        a11yAudit();`,
      errors: [{ messageId: "a11yAuditAfterHelper" }],
    },

    //
    // smoke tests on other default test helpers
    //
    {
      code: 'import { blur } from "@ember/test-helpers"; blur();',
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      output:
        'import { blur } from "@ember/test-helpers"; blur();\na11yAudit();',
    },
    {
      code: 'import { click } from "@ember/test-helpers"; click();',
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      output:
        'import { click } from "@ember/test-helpers"; click();\na11yAudit();',
    },
    {
      code: 'import { doubleClick } from "@ember/test-helpers"; doubleClick();',
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      output:
        'import { doubleClick } from "@ember/test-helpers"; doubleClick();\na11yAudit();',
    },
    {
      code: 'import { focus } from "@ember/test-helpers"; focus();',
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      output:
        'import { focus } from "@ember/test-helpers"; focus();\na11yAudit();',
    },
    {
      code: 'import { tap } from "@ember/test-helpers"; tap();',
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      output: 'import { tap } from "@ember/test-helpers"; tap();\na11yAudit();',
    },
    {
      code: 'import { triggerEvent } from "@ember/test-helpers"; triggerEvent();',
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      output:
        'import { triggerEvent } from "@ember/test-helpers"; triggerEvent();\na11yAudit();',
    },
    {
      code: 'import { triggerKeyEvent } from "@ember/test-helpers"; triggerKeyEvent();',
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      output:
        'import { triggerKeyEvent } from "@ember/test-helpers"; triggerKeyEvent();\na11yAudit();',
    },
    {
      code: code`
      import { visit } from '@ember/test-helpers';
      import a11yTesting24 from "ember-a11y-testing/test-support/audit";
      async function foo() {
        await visit();
      }`,
      errors: [{ messageId: "a11yAuditAfterHelper" }],
      output: code`
      import { visit } from '@ember/test-helpers';
      import a11yTesting24 from "ember-a11y-testing/test-support/audit";
      async function foo() {
        await visit();
        await a11yTesting24();
      }`,
    },
  ],
});
