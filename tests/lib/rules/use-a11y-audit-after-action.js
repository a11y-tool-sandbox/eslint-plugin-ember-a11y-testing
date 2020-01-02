/* eslint-disable no-undef */
const rule = require('../rules/use-a11y-audit-after-action');
const { RuleTester } = require('eslint/lib/rule-tester');
const ruleTester = new RuleTester();

const TEST_FILE_NAME = 'tests/acceptance/application-test.js';

ruleTester.run('use-a11y-audit-after-action', rule, {
  valid: [
    // visit
    {
      code: `visit(); a11yAudit();`,
      filename: TEST_FILE_NAME
    },
    {
      code: `visit();
      a11yAudit();`,
      filename: TEST_FILE_NAME
    },

    // rule not applicable outside of tests/acceptance folder
    {
      code: `visit();`,
      filename: 'app/controllers/application.js'
    },

    // rule not applicable in non-acceptance tests
    {
      code: `visit();`,
      filename: 'tests/integration/my-test.js'
    },

    // rule not applicable if function is excluded
    {
      code: `visit();`,
      filename: TEST_FILE_NAME,
      options: [
        {
          exclude: ['visit']
        }
      ]
    },

    //
    // smoke tests on other default test helpers
    //
    {
      code: `blur(); a11yAudit();`,
      filename: TEST_FILE_NAME
    },
    {
      code: `click(); a11yAudit();`,
      filename: TEST_FILE_NAME
    },
    {
      code: `doubleClick(); a11yAudit();`,
      filename: TEST_FILE_NAME
    },
    {
      code: `fillIn(); a11yAudit();`,
      filename: TEST_FILE_NAME
    },
    {
      code: `focus(); a11yAudit();`,
      filename: TEST_FILE_NAME
    },
    {
      code: `tap(); a11yAudit();`,
      filename: TEST_FILE_NAME
    },
    {
      code: `triggerEvent(); a11yAudit();`,
      filename: TEST_FILE_NAME
    },
    {
      code: `triggerKeyEvent(); a11yAudit();`,
      filename: TEST_FILE_NAME
    }
  ],
  invalid: [
    // without calling a11yAudit after
    {
      code: 'visit();',
      errors: [{ messageId: 'a11yAuditAfterAction' }],
      filename: TEST_FILE_NAME
    },
    // referencing without calling a11yAudit after
    {
      code: 'visit(); a11yAudit;',
      errors: [{ messageId: 'a11yAuditAfterAction' }],
      filename: TEST_FILE_NAME
    },
    // without adding a11yAudit after using `include` option
    {
      code: 'myCustom();',
      options: [
        {
          include: ['myCustom']
        }
      ],
      errors: [{ messageId: 'a11yAuditAfterAction' }],
      filename: TEST_FILE_NAME
    },
    // without adding a11yAudit after using `include` option (multiple)
    {
      code: `
        myCustom();
        a11yAudit();

        anotherCustom();`,
      options: [
        {
          include: ['myCustom', 'anotherCustom']
        }
      ],
      errors: [{ messageId: 'a11yAuditAfterAction' }],
      filename: TEST_FILE_NAME
    },

    //
    // smoke tests on other default test helpers
    //

    {
      code: 'blur();',
      errors: [{ messageId: 'a11yAuditAfterAction' }],
      filename: TEST_FILE_NAME
    },
    {
      code: 'click();',
      errors: [{ messageId: 'a11yAuditAfterAction' }],
      filename: TEST_FILE_NAME
    },
    {
      code: 'doubleClick();',
      errors: [{ messageId: 'a11yAuditAfterAction' }],
      filename: TEST_FILE_NAME
    },
    {
      code: 'fillIn();',
      errors: [{ messageId: 'a11yAuditAfterAction' }],
      filename: TEST_FILE_NAME
    },
    {
      code: 'focus();',
      errors: [{ messageId: 'a11yAuditAfterAction' }],
      filename: TEST_FILE_NAME
    },
    {
      code: 'tap();',
      errors: [{ messageId: 'a11yAuditAfterAction' }],
      filename: TEST_FILE_NAME
    },
    {
      code: 'triggerEvent();',
      errors: [{ messageId: 'a11yAuditAfterAction' }],
      filename: TEST_FILE_NAME
    },
    {
      code: 'triggerKeyEvent();',
      errors: [{ messageId: 'a11yAuditAfterAction' }],
      filename: TEST_FILE_NAME
    }
  ]
});
