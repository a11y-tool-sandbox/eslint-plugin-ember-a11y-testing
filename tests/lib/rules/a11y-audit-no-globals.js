"use strict";

/**
 * @fileoverview Tests that `a11yAudit` is called as a function. Prevents accidentally comitting code like
 * `a11yAudit` (no parens, so the audit doens't actually run)
 * @author Stanley Stuart <https://github.com/fivetanley>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/a11y-audit-no-globals");
const { RuleTester } = require("eslint/lib/rule-tester");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

ruleTester.run("a11y-audit-no-globals", rule, {
  valid: [
    {
      code: `import a11yAudit from 'ember-a11y-testing/test-support/audit'; a11yAudit();`,
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
    },
    {
      code: `import a11yAudit2 from 'ember-a11y-testing/test-support/audit'; a11yAudit2();`,
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
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
      code: `a11yAudit();`,
      errors: [{ messageId: "a11yAuditNoGlobals" }],
      output: `import a11yAudit from 'ember-a11y-testing/test-support/audit';\na11yAudit();`,
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
    },
    {
      code: `/* existing import with comments */\nimport Blah from 'blah';\nimport Foo from 'foo'; a11yAudit();`,
      errors: [{ messageId: "a11yAuditNoGlobals" }],
      output: `/* existing import with comments */\nimport Blah from 'blah';\nimport Foo from 'foo';\nimport a11yAudit from 'ember-a11y-testing/test-support/audit'; a11yAudit();`,
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
    },
    {
      code: `a11yAudit();`,
      errors: [{ messageId: "a11yAuditNoGlobals" }],
      output: `import { a11yAudit2 as a11yAudit } from 'custom-module';\na11yAudit();`,
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
      settings: {
        "ember-a11y-testing": {
          auditModule: {
            package: "custom-module",
            exportName: "a11yAudit2",
          },
        },
      },
    },
    {
      code: `import a11yAudit2 from 'ember-a11y-testing/test-support/audit'; a11yAudit();`,
      errors: [{ messageId: "a11yAuditNoGlobalsUseImportName" }],
      output: `import a11yAudit2 from 'ember-a11y-testing/test-support/audit'; a11yAudit2();`,
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
    },
    {
      code: `import a11yAudit2 from 'ember-a11y-testing/test-support/audit'; a11yAudit();`,
      errors: [{ messageId: "a11yAuditNoGlobalsUseImportName" }],
      output: `import a11yAudit2 from 'ember-a11y-testing/test-support/audit'; a11yAudit2();`,
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
    },
    {
      code: `import a11yAudit2 from 'custom-module'; a11yAudit();`,
      errors: [{ messageId: "a11yAuditNoGlobalsUseImportName" }],
      output: `import a11yAudit2 from 'custom-module'; a11yAudit2();`,
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
    {
      code: `import { a11yAudit2 } from 'custom-module'; a11yAudit();`,
      errors: [{ messageId: "a11yAuditNoGlobalsUseImportName" }],
      output: `import { a11yAudit2 } from 'custom-module'; a11yAudit2();`,
      parserOptions: {
        ecmaVersion: "2018",
        sourceType: "module",
      },
      settings: {
        "ember-a11y-testing": {
          auditModule: {
            package: "custom-module",
            exportName: "a11yAudit2",
          },
        },
      },
    },
  ],
});
