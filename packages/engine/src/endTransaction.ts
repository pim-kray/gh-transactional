import { TransactionState } from "./state";
import { rollbackTransaction } from "./rollback";

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
    // Check if any step failed
    const hasFailure = state.steps.some(s => s.status === "FAILED");

    if (hasFailure) {
        // Rollback: execute compensations in reverse
        rollbackTransaction(state);
    } else {
        // Commit: mark transaction as successful
        state.status = "COMMITTED";
    }

    return state;
}
