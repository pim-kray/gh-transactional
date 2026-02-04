import * as core from "@actions/core";
import { loadState, saveState } from "../../../packages/engine/src/state.js";
import { executeStep } from "../../../packages/engine/src/executeStep.js";
import {
    downloadStateArtifact,
    uploadStateArtifact,
} from "../../../packages/shared/artifact.js";
import { logInfo, logError } from "../../../packages/shared/logger.js";

/**
 * GitHub Action: Execute Transaction Step
 *
 * This action executes a single transactional step by:
 * 1. Downloading the latest transaction state artifact
 * 2. Loading the transaction state
 * 3. Executing the step command
 * 4. Persisting step status (COMPLETED or FAILED)
 * 5. Uploading updated state artifact
 *
 * IMPORTANT:
 * - This action NEVER fails, even when step execution fails
 * - Failures are recorded in state and handled by the 'end' action
 * - This allows subsequent steps to be skipped gracefully
 */
async function run() {
    let statePath: string | undefined;

    const stepId = core.getInput("id", { required: true });
    const runCmd = core.getInput("run", { required: true });
    const compensate = core.getInput("compensate");

    try {
        logInfo("Starting step action");

        await downloadStateArtifact();
        logInfo("Downloaded state artifact");

        // Locate transaction state file
        const possibleStatePaths = [
            ".gh-transaction/state.json",
            "tx-state.json",
            ".github/tx-state.json",
        ];

        let state;
        for (const path of possibleStatePaths) {
            try {
                state = loadState(path);
                statePath = path;
                logInfo(`Found state file at ${path}`);
                break;
            } catch {
                // try next
            }
        }

        if (!state || !statePath) {
            throw new Error(
                "Could not find transaction state. Ensure start action ran successfully."
            );
        }

        // Execute step - this will update state with COMPLETED or FAILED status
        try {
            const newState = executeStep(state, {
                id: stepId,
                run: runCmd,
                compensate,
            });

            saveState(statePath, newState);
            logInfo(`Saved updated state to ${statePath}`);

            await uploadStateArtifact(statePath);
            logInfo("Uploaded updated state artifact");

            core.info(`✅ Step '${stepId}' executed successfully`);
        } catch (stepErr) {
            // Step failed - executeStep already marked it as FAILED in state
            logError(`Step '${stepId}' failed`, stepErr instanceof Error ? stepErr : undefined);

            // Save the failed state
            saveState(statePath, state);
            logInfo(`Recorded FAILED status for step '${stepId}'`);

            await uploadStateArtifact(statePath);
            logInfo("Uploaded failed state artifact");

            // Don't fail the action - let end action handle rollback
            core.warning(`⚠️ Step '${stepId}' failed but transaction continues for rollback`);
        }
    } catch (err) {
        // Infrastructure error (not step failure)
        logError("Action infrastructure error", err instanceof Error ? err : undefined);
        core.setFailed(err instanceof Error ? err.message : String(err));
    }
}

run();
