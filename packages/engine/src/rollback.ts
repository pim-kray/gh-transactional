import { execSync } from "child_process";
import { TransactionState } from "./state";

/**
 * Rolls back a transaction by executing compensation commands in reverse order.
 *
 * This function:
 * 1. Filters for completed steps that have a compensate command
 * 2. Reverses the order (LIFO - Last In First Out)
 * 3. Executes each compensation command
 * 4. Marks the transaction status as "ABORTED"
 *
 * Only steps with status "COMPLETED" and a defined compensate command are rolled back.
 * Failed steps or steps without compensation are skipped.
 *
 * @param state - Transaction state to rollback
 */
export function rollbackTransaction(state: TransactionState) {
    // Get completed steps with compensation in reverse order
    const completedSteps = state.steps
        .filter(s => s.status === "COMPLETED" && s.compensate)
        .reverse();

    // Execute each compensation command
    for (const step of completedSteps) {
        execSync(step.compensate!, { stdio: "inherit" });
    }

    // Mark transaction as aborted
    state.status = "ABORTED";
}
