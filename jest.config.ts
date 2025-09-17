import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "./tests",
  roots: ["<rootDir>/unit"],
};

export default config;
