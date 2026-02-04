import fs from "fs";
import path from "path";

export function initState(statePath: string, transactionId: string, specPath: string) {
    const dir = path.dirname(statePath);
    fs.mkdirSync(dir, { recursive: true });

    const initialState = {
        transactionId,
        status: "RUNNING",
        specPath,
        steps: [],
    };

    fs.writeFileSync(statePath, JSON.stringify(initialState, null, 2));
}

export type StepState = {
    id: string;
    status: "STARTED" | "COMPLETED" | "FAILED";
    run: string;
    compensate?: string;
};

export type TransactionState = {
    transactionId: string;
    status: "RUNNING" | "ABORTED" | "COMMITTED";
    specPath: string;
    steps: StepState[];
};

export function loadState(statePath: string): TransactionState {
    try {
        const raw = fs.readFileSync(statePath, "utf8");
        const state = JSON.parse(raw) as TransactionState;

        // Validate basic structure
        if (!state.transactionId || !state.status || !Array.isArray(state.steps)) {
            throw new Error("Invalid state file structure");
        }

        // specPath is required for dynamic spec loading
        if (!state.specPath) {
            throw new Error("State file missing specPath field");
        }

        return state;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to load transaction state from ${statePath}: ${error.message}`);
        }
        throw error;
    }
}

export function saveState(statePath: string, state: TransactionState) {
    try {
        const dir = path.dirname(statePath);
        fs.mkdirSync(dir, { recursive: true });

        // Atomic write: write to temp file, then rename
        const tempPath = `${statePath}.tmp`;
        fs.writeFileSync(tempPath, JSON.stringify(state, null, 2));
        fs.renameSync(tempPath, statePath);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to save transaction state to ${statePath}: ${error.message}`);
        }
        throw error;
    }
}
