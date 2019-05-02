module.exports = {
  root: true,

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },

  env: {
    browser: true,
    es6: true
  },

  plugins: ["ember-a11y-testing"],

  rules: {
    "ember-a11y-testing/a11y-audit": "error"
  }
};
