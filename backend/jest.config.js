module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  clearMocks: true,
  forceExit: true,
  setupFiles: ["<rootDir>/jest.setup.js"]
};
