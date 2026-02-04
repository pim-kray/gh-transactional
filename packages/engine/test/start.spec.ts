import fs from "fs";
import path from "path";
import {loadSpec} from "../src/transactionSpec.js";
import {validateSpec} from "../src/validateSpec.js";
import {initState} from "../src/state.js";

const TEST_DIR = path.join(__dirname, ".tmp");

beforeEach(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
    fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterAll(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

test("creates transaction state file from valid spec", () => {
    const specPath = path.join(TEST_DIR, "tx.yaml");
    const statePath = path.join(TEST_DIR, "tx.json");

    fs.writeFileSync(
        specPath,
        `
transaction:
  id: test-transaction
  state:
    path: ${statePath}
`
    );

    const spec = loadSpec(specPath);
    validateSpec(spec);
    initState(statePath, spec.transaction.id);

    expect(fs.existsSync(statePath)).toBe(true);

    const state = JSON.parse(fs.readFileSync(statePath, "utf8"));

    expect(state).toEqual({
        transactionId: "test-transaction",
        status: "RUNNING",
        steps: [],
    });
});

test("validateSpec fails when transaction root is missing", () => {
    const specPath = path.join(TEST_DIR, "tx.yaml");

    fs.writeFileSync(
        specPath,
        `
someOtherField: value
`
    );

    const spec = loadSpec(specPath);

    expect(() => validateSpec(spec)).toThrow("Missing 'transaction' root");
});

test("validateSpec fails when transaction.id is missing", () => {
    const specPath = path.join(TEST_DIR, "tx.yaml");

    fs.writeFileSync(
        specPath,
        `
transaction:
  state:
    path: /some/path
`
    );

    const spec = loadSpec(specPath);

    expect(() => validateSpec(spec)).toThrow("transaction.id is required");
});

test("validateSpec fails when transaction.state.path is missing", () => {
    const specPath = path.join(TEST_DIR, "tx.yaml");

    fs.writeFileSync(
        specPath,
        `
transaction:
  id: test-transaction
`
    );

    const spec = loadSpec(specPath);

    expect(() => validateSpec(spec)).toThrow("transaction.state.path is required");
});

test("validateSpec fails when transaction.state is missing", () => {
    const specPath = path.join(TEST_DIR, "tx.yaml");

    fs.writeFileSync(
        specPath,
        `
transaction:
  id: test-transaction
  mode: strict
`
    );

    const spec = loadSpec(specPath);

    expect(() => validateSpec(spec)).toThrow("transaction.state.path is required");
});

