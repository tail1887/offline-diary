export default {
  testEnvironment: 'node', // ← jsdom 대신 node로 변경
  transform: {
    '^.+\\.m?[jt]sx?$': ['babel-jest', { configFile: './babel.config.js' }]
  }
};