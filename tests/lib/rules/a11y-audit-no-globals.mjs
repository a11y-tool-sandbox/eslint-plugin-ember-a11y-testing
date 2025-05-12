"use strict";

/**
 * @fileoverview Tests that `a11yAudit` is imported from the desired package.
 * @author Stanley Stuart <https://github.com/fivetanley>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { RuleTester } from "eslint";
import rule from "../../../lib/rules/a11y-audit-no-globals.mjs";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
});

ruleTester.run("a11y-audit-no-globals", rule, {
  valid: [
    {
      code: `import a11yAudit from 'ember-a11y-testing/test-support/audit'; a11yAudit();`,
    },
    {
      code: `import a11yAudit2 from 'ember-a11y-testing/test-support/audit'; a11yAudit2();`,
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
      code: `a11yAudit();`,
      errors: [{ messageId: "a11yAuditNoGlobals" }],
      output: `import a11yAudit from 'ember-a11y-testing/test-support/audit';\na11yAudit();`,
    },
    {
      code: `/* existing import with comments */\nimport Blah from 'blah';\nimport Foo from 'foo'; a11yAudit();`,
      errors: [{ messageId: "a11yAuditNoGlobals" }],
      output: `/* existing import with comments */\nimport Blah from 'blah';\nimport Foo from 'foo';\nimport a11yAudit from 'ember-a11y-testing/test-support/audit'; a11yAudit();`,
    },
    {
      code: `a11yAudit();`,
      errors: [{ messageId: "a11yAuditNoGlobals" }],
      output: `import { a11yAudit2 as a11yAudit } from 'custom-module';\na11yAudit();`,
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
    },
    {
      code: `import a11yAudit2 from 'custom-module'; a11yAudit();`,
      errors: [{ messageId: "a11yAuditNoGlobalsUseImportName" }],
      output: `import a11yAudit2 from 'custom-module'; a11yAudit2();`,
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
