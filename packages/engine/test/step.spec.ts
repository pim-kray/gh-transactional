import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { loadState, saveState } from "../src/state.js";
import { executeStep } from "../src/executeStep.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TMP = path.join(__dirname, ".tmp");

beforeEach(() => {
    fs.rmSync(TMP, { recursive: true, force: true });
    fs.mkdirSync(TMP, { recursive: true });
});

afterEach(() => {
    fs.rmSync(TMP, { recursive: true, force: true });
});

test("successful step updates state to COMPLETED", () => {
    const statePath = path.join(TMP, "tx.json");

    saveState(statePath, {
        transactionId: "test",
        status: "RUNNING",
        steps: [],
    });

    const state = loadState(statePath);

    const newState = executeStep(state, {
        id: "step-1",
        run: "echo hello",
    });

    expect(newState.steps[0].status).toBe("COMPLETED");

    // Verify state can be persisted and reloaded
    saveState(statePath, newState);
    const reloadedState = loadState(statePath);
    expect(reloadedState.steps[0].status).toBe("COMPLETED");
});

test("failing step updates state to FAILED", () => {
    const statePath = path.join(TMP, "tx.json");

    saveState(statePath, {
        transactionId: "test",
        status: "RUNNING",
        steps: [],
    });

    const state = loadState(statePath);

    expect(() =>
        executeStep(state, {
            id: "step-1",
            run: "exit 1",
        })
    ).toThrow();

    expect(state.steps[0].status).toBe("FAILED");

    // Verify failed state can be persisted
    saveState(statePath, state);
    const reloadedState = loadState(statePath);
    expect(reloadedState.steps[0].status).toBe("FAILED");
});

test("multiple steps are appended in execution order", () => {
    const statePath = path.join(TMP, "tx.json");

    saveState(statePath, {
        transactionId: "test",
        status: "RUNNING",
        steps: [],
    });

    let state = loadState(statePath);

    state = executeStep(state, {
        id: "step-1",
        run: "echo first",
    });

    // Persist after first step
    saveState(statePath, state);

    state = executeStep(state, {
        id: "step-2",
        run: "echo second",
    });

    // Persist final state
    saveState(statePath, state);

    expect(state.steps).toHaveLength(2);
    expect(state.steps[0].id).toBe("step-1");
    expect(state.steps[1].id).toBe("step-2");

    // Verify persistence
    const reloadedState = loadState(statePath);
    expect(reloadedState.steps).toHaveLength(2);
    expect(reloadedState.steps[0].status).toBe("COMPLETED");
    expect(reloadedState.steps[1].status).toBe("COMPLETED");
});

test("compensate command is stored when provided", () => {
    const statePath = path.join(TMP, "tx.json");

    saveState(statePath, {
        transactionId: "test",
        status: "RUNNING",
        steps: [],
    });

    const state = loadState(statePath);

    const newState = executeStep(state, {
        id: "step-with-compensate",
        run: "echo run",
        compensate: "echo rollback",
    });

    expect(newState.steps[0].compensate).toBe("echo rollback");

    // Verify compensate command persists
    saveState(statePath, newState);
    const reloadedState = loadState(statePath);
    expect(reloadedState.steps[0].compensate).toBe("echo rollback");
});
