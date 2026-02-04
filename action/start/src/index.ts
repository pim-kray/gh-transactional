import * as core from "@actions/core";
import fs from "fs";
import path from "path";
import { loadSpec } from "../../../packages/engine/src/transactionSpec.js";
import { validateSpec } from "../../../packages/engine/src/validateSpec.js";
import { initState } from "../../../packages/engine/src/state.js";
import { uploadStateArtifact } from "../../../packages/shared/artifact.js";
import { logInfo, logError } from "../../../packages/shared/logger.js";

/**
 * GitHub Action: Start Transaction
 *
 * Responsibilities:
 * 1. Load and validate the transaction spec
 * 2. Create a deterministic transaction directory
 * 3. Initialize transaction state
 * 4. Persist an immutable copy of the spec
 * 5. Upload state as artifact for cross-job usage
 */
async function run() {
    try {
        logInfo("Starting transaction initialization");

        const specPath = core.getInput("spec", { required: true });
        const spec = loadSpec(specPath);
        validateSpec(spec);

        const { id } = spec.transaction;

        /**
         * Create deterministic transaction directory
         * This prevents path ambiguity and accidental overwrites
         */
        const txDir = ".gh-transaction";
        if (!fs.existsSync(txDir)) {
            fs.mkdirSync(txDir, { recursive: true });
            logInfo(`Created transaction directory at ${txDir}`);
        }

        /**
         * Resolve absolute spec path for traceability
         */
        const absoluteSpecPath = path.resolve(specPath);

        /**
         * Force state path into transaction directory
         * This guarantees a single source of truth
         */
        const statePath = path.join(txDir, "state.json");

        initState(statePath, id, absoluteSpecPath);
        logInfo(`Initialized state for transaction '${id}' at ${statePath}`);

        /**
         * Persist immutable spec copy for this transaction
         */
        const specCopyPath = path.join(txDir, "tx-spec.yaml");
        fs.copyFileSync(specPath, specCopyPath);
        logInfo(`Copied spec to ${specCopyPath}`);

        /**
         * Upload state artifact (state.json + spec copy)
         */
        await uploadStateArtifact(statePath);
        logInfo(`Uploaded state artifact for transaction '${id}'`);

        core.info(`Transaction '${id}' initialized successfully`);
    } catch (err) {
        logError(
            "Failed to initialize transaction",
            err instanceof Error ? err : undefined
        );
        core.setFailed(err instanceof Error ? err.message : String(err));
    }
}

run();