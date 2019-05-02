# eslint-plugin-ember-a11y-testing

ESLint plugin for ember-a11y-testing

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-ember-a11y-testing`:

```
$ npm install eslint-plugin-ember-a11y-testing --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-ember-a11y-testing` globally.

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
