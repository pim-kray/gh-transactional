import { execSync } from "child_process";
import { TransactionState, StepState } from "./state";

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

    try {
        execSync(step.run, { stdio: "inherit" });
        stepState.status = "COMPLETED";
    } catch (err) {
        stepState.status = "FAILED";
        throw err;
    }

    return state;
}
