/* eslint-env node */
/* global process */

const isCI = process.env.CI;
module.exports = {
  reporter: isCI ? "mocha-junit-reporter" : "dot",
};
