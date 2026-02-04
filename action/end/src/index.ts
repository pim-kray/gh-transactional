import * as core from "@actions/core";
import { loadSpec } from "../../../packages/engine/src/transactionSpec.js";
import { loadState, saveState } from "../../../packages/engine/src/state.js";
import { endTransaction } from "../../../packages/engine/src/endTransaction.js";
import { downloadStateArtifact, uploadStateArtifact } from "../../../packages/shared/artifact.js";
import { logInfo, logError } from "../../../packages/shared/logger.js";

/**
 * GitHub Action: End Transaction
 *
 * This action finalizes a transaction by:
 * 1. Downloading the final state artifact
 * 2. Loading the transaction specification
 * 3. Loading the current transaction state
 * 4. Deciding to commit or rollback based on step statuses
 * 5. Executing compensations if rollback is needed (even across jobs)
 * 6. Saving and uploading the final transaction state
 */
async function run() {

    try {
        logInfo("Starting end action");

        await downloadStateArtifact();
        logInfo("Downloaded final state artifact");

        const spec = loadSpec("tx.yaml");
        const statePath = spec.transaction.state.path;

        const state = loadState(statePath);
        logInfo(`Loaded state from ${statePath}`);

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
