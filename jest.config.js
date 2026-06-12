module.exports = {
  testEnvironment: 'node',

  testMatch: ['**/tests/**/*.test.js'],

  // Which source files to measure
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**', // exclude config
    '!src/app.js', // exclude bootstrap
    '!src/server.js', // exclude bootstrap
  ],

  // Report formats
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
};
