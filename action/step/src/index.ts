import * as core from "@actions/core";
import {loadSpec} from "engine/src/transactionSpec";
import {loadState, saveState} from "engine/src/state";
import {executeStep} from "engine/src/executeStep";


async function run() {
    try {
        const stepId = core.getInput("id", { required: true });
        const runCmd = core.getInput("run", { required: true });
        const compensate = core.getInput("compensate");

        const spec = loadSpec("tx.yaml"); // for now: fixed path
        const statePath = spec.transaction.state.path;

        const state = loadState(statePath);

        const newState = executeStep(state, {
            id: stepId,
            run: runCmd,
            compensate,
        });

        saveState(statePath, newState);

        core.info(`Step '${stepId}' completed`);
    } catch (err: any) {
        core.setFailed(err.message);
    }
}

run();
