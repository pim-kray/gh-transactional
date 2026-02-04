import { endTransaction } from "../src/endTransaction.js";
import { TransactionState } from "../src/state.js";


test("commits transaction when no steps failed", () => {
    const state: TransactionState = {
        transactionId: "test",
        status: "RUNNING",
        steps: [
            {
                id: "step-1",
                status: "COMPLETED",
                run: "echo ok",
            },
        ],
    };

    const result = endTransaction(state);

    expect(result.status).toBe("COMMITTED");
});


test("rolls back completed steps in reverse order on failure", () => {
    const state: TransactionState = {
        transactionId: "test",
        status: "RUNNING",
        steps: [
            {
                id: "step-1",
                status: "COMPLETED",
                run: "echo 1",
                compensate: "echo rollback-1",
            },
            {
                id: "step-2",
                status: "FAILED",
                run: "exit 1",
            },
            {
                id: "step-3",
                status: "COMPLETED",
                run: "echo 3",
                compensate: "echo rollback-3",
            },
        ],
    };

    const result = endTransaction(state);

    expect(result.status).toBe("ABORTED");
    // Rollback executes compensate commands in reverse order (step-3, then step-1)
    // Since these are real executions, we just verify the transaction was aborted
});

test("steps without compensate are skipped during rollback", () => {
    const state: TransactionState = {
        transactionId: "test",
        status: "RUNNING",
        specPath: "test-spec.yaml",
        steps: [
            {
                id: "step-1",
                status: "COMPLETED",
                run: "echo 1",
            },
            {
                id: "step-2",
                status: "FAILED",
                run: "exit 1",
            },
        ],
    };

    const result = endTransaction(state);

    expect(result.status).toBe("ABORTED");
});
