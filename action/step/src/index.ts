import * as core from "@actions/core";
import {loadState, saveState} from "../../../packages/engine/src/state.js";
import {executeStep} from "../../../packages/engine/src/executeStep.js";
import {downloadStateArtifact, uploadStateArtifact} from "../../../packages/shared/artifact.js";
import { logInfo, logError } from "../../../packages/shared/logger.js";

/**
 * GitHub Action: Execute Transaction Step
 *
 * This action executes a single transactional step by:
 * 1. Downloading the latest state artifact from previous job
 * 2. Loading the transaction state (which contains spec path)
 * 3. Loading the transaction specification
 * 4. Executing the run command
 * 5. Marking the step as COMPLETED or FAILED
 * 6. Saving and uploading the updated state
 */
async function run() {

    try {
        logInfo("Starting step action");
        const stepId = core.getInput("id", { required: true });
        const runCmd = core.getInput("run", { required: true });
        const compensate = core.getInput("compensate");

        await downloadStateArtifact();
        logInfo("Downloaded state artifact");

        // First load state to get spec path and state file location
        // We need to find the state file - check common locations
        const possibleStatePaths = [
            ".gh-transaction/state.json",
            "tx-state.json",
            ".github/tx-state.json"
        ];

        let state;
        let statePath;
        for (const path of possibleStatePaths) {
            try {
                state = loadState(path);
                statePath = path;
                logInfo(`Found state file at ${path}`);
                break;
            } catch {
                // Try next path
            }
        }

        if (!state || !statePath) {
            throw new Error("Could not find state file. Make sure 'start' action ran successfully.");
        }

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
