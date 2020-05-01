# eslint-plugin-ember-a11y-testing

[![CircleCI Build Status](https://circleci.com/gh/a11y-tool-sandbox/eslint-plugin-ember-a11y-testing.svg?style=svg)](https://circleci.com/gh/a11y-tool-sandbox/eslint-plugin-ember-a11y-testing)

ESLint plugin for ember-a11y-testing. This plugin adds some rules to ensure
that `a11yAudit` from
[https://github.com/ember-a11y/ember-a11y-testing](https://github.com/ember-a11y/ember-a11y-testing)
is called after each call to a helper from [@ember/test-helpers](https://github.com/emberjs/ember-test-helpers/blob/master/API.md).

For example, the following code will trigger a linting error:

```js
import { module, test } from "qunit";
import { visit, click, setupApplicationTest } from "@ember/test-helpers";
import a11yAudit from "ember-a11y-testing";

module("visiting the bakery", function (hooks) {
  setupApplicationTest(hooks);
  test("shows kolaches available", async function (/* assert */) {
    await visit("/bakery");
    await a11yAudit(); // no lint error here
    await click("#kolache-button");
    // oops, forgot to call a11yAudit here. ESLint will raise an error
  });
});
```

This ESLint plugin provides both reporting and autofixing (through `eslint
--fix` or editor integration) and can serve as a tool to help you migrate to
auditing your tests with [aXe](https://github.com/dequelabs/axe-core) through
`ember-a11y-testing`.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

If using yarn:

```
yarn add --dev eslint
```

Next, install `eslint-plugin-ember-a11y-testing`:

```
$ npm install eslint-plugin-ember-a11y-testing --save-dev
```

If using yarn:

```
$ yarn add --dev eslint-plugin-ember-a11y-testing
```

**Note:** If you installed ESLint globally (using the `-g` flag with `npm`, or `yarn global` with yarn) then you must also install `eslint-plugin-ember-a11y-testing` globally.

## Usage

Add `ember-a11y-testing` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": [
    "ember-a11y-testing"
  ]
}
```

Or extend the recommended config:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:ember/recommended",
    "plugin:ember-a11y-testing/recommended"
  ]
}
```

Or configure the rules you want to use under the rules section.
```json
{
  "rules": {
    "ember-a11y-testing/a11y-audit": "error",
    "ember-a11y-testing/a11y-audit-after-test-helper": "error",
    "ember-a11y-testing/a11y-audit-no-expression": "error",
    "ember-a11y-testing/a11y-audit-no-globals": "error",
  }
}
```

There are a few rules in this plugin to facilitate `eslint --fix`, so we
recommend you keep all of them on.

### Configuring which helpers to assert audit after

By default, eslint-plugin-ember-a11y-testing will ensure there is a call to
`a11yAudit` after this subset of helpers from
[@ember/test-helpers](https://github.com/emberjs/ember-test-helpers/blob/master/API.md):

- `visit`
- `blur`
- `click`
- `doubleClick`
- `fillIn`
- `focus`
- `tap`
- `triggerEvent`
- `triggerKeyEvent`
- `typeIn`
- `render`

If you want to exclude any of these helpers for any reason, you can configure the `a11y-audit-after-test-helper` plugin as follows:

```json
{
  "plugins": ["ember-a11y-testing"],
  "settings": {
    "ember-a11y-testing": {
      "modules": {
        "@ember/test-helpers": {
          "exclude": [
            "fillIn"
          ]
        }
      }
    }
  }
}
```

### Auditing custom helpers

Apps and addons often develop their own helpers for interacting with components. eslint-plugin-ember-a11y-testing can audit those as well by specifying them in the `modules` setting. For example, if you have a custom helper exported at `confirm` from the `tests/helpers/confirm` module, and the name of your app (as specified in `name` in package.json at the root of your project) is 'myapp':

```json
{
  "plugins": ["ember-a11y-testing"],
  "settings": {
    "ember-a11y-testing": {
      "modules": {
        "myapp/tests/helpers": {
          "include": ["confirm"]
        }
      }
    }
  }
}
```

This will result in the following code trigger a linting error (and can also be autofixed if you have `eslint --fix` enabled):

<!-- global module, setupApplicationTest, test, visit -->
```js
import { confirm } from "myapp/tests/helpers";

module("my acceptance test", function (hooks) {
  setupApplicationTest(hooks);
  test("user can confirm thing", async function (/*assert*/) {
    await visit("/seize-the-means-of-production");
    await confirm('[data-test-selector="confirm-button"]');
    // eslint will indicate an error here until away `a11yAudit` is added.
  });
});
```

### Using a custom audit module

By default, `eslint-plugin-ember-a11y-testing` expects you to define imports
for `a11yAudit` in your tests as listed on the [ember-a11y-testing
README](https://github.com/ember-a11y/ember-a11y-testing#acceptance-tests):

<!-- eslint-disable no-unused-vars -->
```js
import a11yAudit from "ember-a11y-testing/test-support/audit";
```

However, sometimes it's handy to combine `a11yAudit` with your own setup
code, or keep configuration for aXe in one place. In that case, you can tell
`eslint-plugin-ember-a11y-testing` that you'd like to use a different module:

```json
{
  "plugins": ["ember-a11y-testing"],
  "settings": {
    "ember-a11y-testing": {
      "auditModule": {
        "package": "my-app/tests/helpers/audit",
        "exportName": "default"
      }
    }
  }
}
```

```js
// your module defined at tests/helpers/audit.js
import a11yAudit from "ember-a11y-testing/test-support/audit";

export default async function audit() {
  const axeOptions = {
    // redacted for brevity
  };
  await a11yAudit(axeOptions);
}
```

`eslint-plugin-ember-a11y-testing` will then expect you to import from that
module like so:

<!-- eslint-disable no-unused-vars -->
```js
import a11yAudit from "my-app/tests/helpers/audit";
```
