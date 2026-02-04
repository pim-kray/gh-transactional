import fs from "fs";
import path from "path";

export function initState(statePath: string, transactionId: string) {
    const dir = path.dirname(statePath);
    fs.mkdirSync(dir, { recursive: true });

    const initialState = {
        transactionId,
        status: "RUNNING",
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
    steps: StepState[];
};

export function loadState(statePath: string): TransactionState {
    return JSON.parse(fs.readFileSync(statePath, "utf8"));
}

export function saveState(statePath: string, state: TransactionState) {
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}
