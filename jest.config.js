module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  modulePathIgnorePatterns: ['dist'],
  testMatch: ['**/*.test.{js,jsx,ts,tsx}'],
  testTimeout: 10000,
  transform: {
    '\\.(ts|tsx)$': 'ts-jest',
  },
}
