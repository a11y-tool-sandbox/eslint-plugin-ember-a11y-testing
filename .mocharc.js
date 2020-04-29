const isCI = process.env.CI;
module.exports = {
  reporter: isCI ? 'mocha-junit-reporter' : 'dot'
}