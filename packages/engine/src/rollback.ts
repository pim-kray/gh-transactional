import { execSync } from "child_process";
import { TransactionState } from "./state.js";
import { logInfo, logError } from "../../shared/logger.js";

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
 * Compensation failures are logged but don't stop the rollback process (best-effort).
 *
 * @param state - Transaction state to rollback
 */
export function rollbackTransaction(state: TransactionState) {
    const completedSteps = state.steps
        .filter(s => s.status === "COMPLETED" && s.compensate)
        .reverse();

    logInfo(`Rolling back ${completedSteps.length} step(s) in reverse order`);

    for (const step of completedSteps) {
        try {
            logInfo(`Compensating step '${step.id}' with command: ${step.compensate}`);
            execSync(step.compensate!, { stdio: "inherit" });
            logInfo(`Successfully compensated step '${step.id}'`);
        } catch (error) {
            // Log but continue - best-effort rollback
            logError(`Failed to compensate step '${step.id}'`, error instanceof Error ? error : undefined);
        }
    }

    state.status = "ABORTED";
    logInfo("Transaction marked as ABORTED");
}
