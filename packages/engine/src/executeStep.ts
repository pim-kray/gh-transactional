import { execSync } from "child_process";
import { TransactionState, StepState } from "./state";

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
    // Create initial step state
    const stepState: StepState = {
        id: step.id,
        status: "STARTED",
        run: step.run,
        compensate: step.compensate,
    };

    // Add step to transaction state
    state.steps.push(stepState);

    try {
        // Execute the run command
        execSync(step.run, { stdio: "inherit" });
        stepState.status = "COMPLETED";
    } catch (err) {
        // Mark as failed and propagate error
        stepState.status = "FAILED";
        throw err;
    }

    return state;
}
