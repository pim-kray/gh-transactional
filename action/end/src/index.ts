import * as core from "@actions/core";
import { loadSpec } from "../../../packages/engine/src/transactionSpec";
import { loadState, saveState } from "../../../packages/engine/src/state";
import { endTransaction } from "../../../packages/engine/src/endTransaction";

/**
 * GitHub Action: End Transaction
 *
 * This action finalizes a transaction by:
 * 1. Loading the transaction specification
 * 2. Loading the current transaction state
 * 3. Deciding to commit or rollback based on step statuses
 * 4. Executing compensations if rollback is needed
 * 5. Saving the final transaction state
 */
async function run() {
    try {
        // Load transaction spec (hardcoded path for Phase 3)
        const spec = loadSpec("tx.yaml");
        const statePath = spec.transaction.state.path;

        // Load current transaction state
        const state = loadState(statePath);

        // End transaction: commit or rollback
        const finalState = endTransaction(state);

        // Persist final state
        saveState(statePath, finalState);

        // Report result
        if (finalState.status === "ABORTED") {
            core.setFailed("Transaction aborted and rolled back");
        } else {
            core.info("Transaction committed successfully");
        }
    } catch (err) {
        core.setFailed(err instanceof Error ? err.message : String(err));
    }
}

run();
