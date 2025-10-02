module.exports = {
  testEnvironment: "jsdom",

  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],

  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: ["node_modules/(?!(axios)/)"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
};
