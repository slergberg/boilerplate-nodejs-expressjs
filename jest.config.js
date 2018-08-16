module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    '{config,helpers,src}/**/*.{js}',
    '*.{js}',
  ],
  coveragePathIgnorePatterns: [
    'jest.config.js',
  ],
}
