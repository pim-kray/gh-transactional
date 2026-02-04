import * as core from "@actions/core";
import { loadState, saveState } from "../../../packages/engine/src/state.js";
import { endTransaction } from "../../../packages/engine/src/endTransaction.js";
import { downloadStateArtifact, uploadStateArtifact } from "../../../packages/shared/artifact.js";
import { logInfo, logError } from "../../../packages/shared/logger.js";

/**
 * GitHub Action: End Transaction
 *
 * This action finalizes a transaction by:
 * 1. Downloading the final state artifact
 * 2. Loading the transaction state (which contains spec path)
 * 3. Loading the transaction specification
 * 4. Deciding to commit or rollback based on step statuses
 * 5. Executing compensations if rollback is needed (even across jobs)
 * 6. Saving and uploading the final transaction state
 */
async function run() {

    try {
        logInfo("Starting end action");

        await downloadStateArtifact();
        logInfo("Downloaded final state artifact");

        // First load state to get spec path and state file location
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

        const finalState = endTransaction(state);
        logInfo(`Ended transaction, final status: ${finalState.status}`);

        saveState(statePath, finalState);
        logInfo(`Saved final state to ${statePath}`);

        await uploadStateArtifact(statePath);
        logInfo("Uploaded final state artifact");

        if (finalState.status === "ABORTED") {
            core.setFailed("Transaction rolled back due to step failure(s)");
        } else {
            core.info("Transaction committed successfully");
        }
    } catch (err) {
        logError("Failed to end transaction", err instanceof Error ? err : undefined);
        core.setFailed(err instanceof Error ? err.message : String(err));
    }
}

run();
