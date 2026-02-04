import { TransactionState } from "./state.js";
import { rollbackTransaction } from "./rollback.js";
import { logInfo } from "../../shared/logger.js";

/**
 * Ends a transaction by either committing or rolling back.
 *
 * Decision logic:
 * - If any step has status "FAILED" → rollback all completed steps
 * - If all steps are "COMPLETED" → commit the transaction
 *
 * After rollback, the transaction status is set to "ABORTED".
 * After commit, the transaction status is set to "COMMITTED".
 *
 * @param state - Current transaction state
 * @returns Updated transaction state with final status
 */
export function endTransaction(state: TransactionState): TransactionState {
    logInfo("Ending transaction");

    const hasFailure = state.steps.some(s => s.status === "FAILED");

    if (hasFailure) {
        logInfo("Failure detected, rolling back transaction");
        rollbackTransaction(state);
        state.status = "ABORTED"; // expliciet
        logInfo("Transaction aborted");
    } else {
        state.status = "COMMITTED";
        logInfo("Transaction committed");
    }

    return state;
}