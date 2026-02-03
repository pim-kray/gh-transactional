import fs from "fs";
import path from "path";

export function initState(statePath: string, transactionId: string) {
    // Ensure the parent directory exists
    const dir = path.dirname(statePath);
    fs.mkdirSync(dir, { recursive: true });

    // Create initial state object
    const initialState = {
        transactionId,
        status: "RUNNING",
        steps: [],
    };

    // Write state to file as formatted JSON
    fs.writeFileSync(statePath, JSON.stringify(initialState, null, 2));
}
