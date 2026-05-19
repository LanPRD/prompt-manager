import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./"
});

const config: Config = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  coveragePathIgnorePatterns: ["/node_modules/", "/.next/", "/__tests__/e2e/", "/src/components/ui/", "/src/lib/", "/prisma/"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/", "<rootDir>/__tests__/e2e/"]
};

export default createJestConfig(config);
