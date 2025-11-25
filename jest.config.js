export default {
  testEnvironment: 'node',
  testMatch: ['**/test-*.test.ts'],
  collectCoverageFrom: [
    '*.ts',
    '!*.test.ts',
    '!jest.config.js',
  ],
};
