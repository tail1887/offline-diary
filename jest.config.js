export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.m?[jt]sx?$': ['babel-jest', { configFile: './babel.config.js' }]
  }
};