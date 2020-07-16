const waitForExpect = require('wait-for-expect')

waitForExpect.defaults.interval = 100

module.exports = {
  modulePathIgnorePatterns: ['dist'],
  testEnvironment: './jest.environment.js',
  testTimeout: 10000,
}
