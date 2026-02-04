/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",

    roots: [
        "<rootDir>/packages"
    ],

    testMatch: [
        "**/test/**/*.spec.ts"
    ],

    moduleFileExtensions: ["ts", "js", "json"],
    
    extensionsToTreatAsEsm: [".ts"],
    
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            useESM: true,
        }],
    },
};