# eslint-plugin-ember-a11y-testing

ESLint plugin for ember-a11y-testing

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
    "ember-a11y-testing/a11y-audit": "error"
  }
}
```

### Using a custom audit module

By default, `eslint-plugin-ember-a11y-testing` expects you to define imports
for `a11yAudit` in your tests as listed on the [ember-a11y-testing
README](https://github.com/ember-a11y/ember-a11y-testing#acceptance-tests):

```javascript
import a11yAudit from 'ember-a11y-testing/test-support/audit';
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

```javascript
// your module defined at tests/helpers/audit.js
import a11yAudit from 'ember-a11y-testing/test-support/audit';

export default async function audit() {
  const axeOptions = {
    // redacted for brevity
  }
  await a11yAudit(axeOptions);
}
```

`eslint-plugin-ember-a11y-testing` will then expect you to import from that
module like so:

```javascript
import a11yAudit from 'my-app/tests/helpers/audit';
```
