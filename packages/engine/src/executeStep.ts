import { execSync } from "child_process";
import { TransactionState, StepState } from "./state.js";
import { logInfo, logError } from "../../shared/logger.js";

/**
 * Executes a transactional step and updates the transaction state.
 *
 * This function:
 * 1. Creates a step state record with status "STARTED"
 * 2. Adds it to the transaction state
 * 3. Executes the run command
 * 4. Updates status to "COMPLETED" on success or "FAILED" on error
 *
 * @param state - Current transaction state
 * @param step - Step definition containing id, run command, and optional compensate command
 * @returns Updated transaction state with the executed step
 * @throws Error if the step command fails
 */
export function executeStep(
    state: TransactionState,
    step: {
        id: string;
        run: string;
        compensate?: string;
    }
): TransactionState {
    const stepState: StepState = {
        id: step.id,
        status: "STARTED",
        run: step.run,
        compensate: step.compensate,
    };

    state.steps.push(stepState);
    logInfo(`Executing step '${step.id}' with command: ${step.run}`);

    try {
        execSync(step.run, { stdio: "inherit" });
        stepState.status = "COMPLETED";
        logInfo(`Step '${step.id}' completed successfully`);
    } catch (err) {
        stepState.status = "FAILED";
        logError(`Step '${step.id}' failed`, err instanceof Error ? err : undefined);
        throw err;
    }

    return state;
}
