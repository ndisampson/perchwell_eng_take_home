module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  roots: ["<rootDir>/app/javascript"],
  moduleFileExtensions: ["js", "jsx", "json"],
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest"
  },
  testMatch: ["**/?(*.)+(test).js?(x)"],
  modulePathIgnorePatterns: ["<rootDir>/vendor/"],
  snapshotResolver: "<rootDir>/snapshot-resolver.js"
};

