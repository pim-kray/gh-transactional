import * as core from "@actions/core";
import {loadSpec} from "../../../packages/engine/src/transactionSpec.js";
import {loadState, saveState} from "../../../packages/engine/src/state.js";
import {executeStep} from "../../../packages/engine/src/executeStep.js";
import {downloadStateArtifact, uploadStateArtifact} from "../../../packages/shared/artifact.js";
import { logInfo, logError } from "../../../packages/shared/logger.js";

/**
 * GitHub Action: Execute Transaction Step
 *
 * This action executes a single transactional step by:
 * 1. Downloading the latest state artifact from previous job
 * 2. Loading the transaction specification and state
 * 3. Executing the run command
 * 4. Marking the step as COMPLETED or FAILED
 * 5. Saving and uploading the updated state
 */
async function run() {

    try {
        logInfo("Starting step action");
        const stepId = core.getInput("id", { required: true });
        const runCmd = core.getInput("run", { required: true });
        const compensate = core.getInput("compensate");

        await downloadStateArtifact();
        logInfo("Downloaded state artifact");

        const spec = loadSpec("tx.yaml"); // for now: fixed path
        const statePath = spec.transaction.state.path;

        const state = loadState(statePath);
        logInfo(`Loaded state from ${statePath}`);

        const newState = executeStep(state, {
            id: stepId,
            run: runCmd,
            compensate,
        });
        logInfo(`Executed step '${stepId}' with run command: ${runCmd}`);

        saveState(statePath, newState);
        logInfo(`Saved updated state to ${statePath}`);

        await uploadStateArtifact(statePath);
        logInfo("Uploaded updated state artifact");

        core.info(`Step '${stepId}' executed and state updated`);
    } catch (err) {
        logError("Failed to execute step", err instanceof Error ? err : undefined);
        core.setFailed(err instanceof Error ? err.message : String(err));
    }
}

run();
