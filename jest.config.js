const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",

    roots: [
        "<rootDir>/packages"
    ],

    testMatch: [
        "**/test/**/*.spec.ts"
    ],

    moduleFileExtensions: ["ts", "js", "json"]
};