import { endTransaction } from "../src/endTransaction.js";
import { TransactionState } from "../src/state.js";
import * as childProcess from "child_process";

jest.mock("child_process");

beforeEach(() => {
    jest.clearAllMocks();
});


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

    expect(childProcess.execSync).toHaveBeenCalledTimes(2);
    expect(childProcess.execSync).toHaveBeenNthCalledWith(
        1,
        "echo rollback-3",
        expect.anything()
    );
    expect(childProcess.execSync).toHaveBeenNthCalledWith(
        2,
        "echo rollback-1",
        expect.anything()
    );
});

test("steps without compensate are skipped during rollback", () => {
    const state: TransactionState = {
        transactionId: "test",
        status: "RUNNING",
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
