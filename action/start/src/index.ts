import * as core from "@actions/core";
import {loadSpec} from "../../../packages/engine/src/transactionSpec.js";
import {validateSpec} from "../../../packages/engine/src/validateSpec.js";
import {initState} from "../../../packages/engine/src/state.js";
import {uploadStateArtifact} from "../../../packages/shared/artifact.js";
import { logInfo, logError } from "../../../packages/shared/logger.js";

/**
 * GitHub Action: Start Transaction
 *
 * This action initializes a new transaction by:
 * 1. Loading the transaction specification from a YAML file
 * 2. Validating the spec structure
 * 3. Creating an initial transaction state file
 * 4. Uploading state as artifact for multi-job workflows
 */
async function run() {

    try {
        logInfo("Starting transaction initialization");
        const specPath = core.getInput("spec", { required: true });
        const spec = loadSpec(specPath);

        validateSpec(spec);

        const { id, state } = spec.transaction;

        initState(state.path, id);
        logInfo(`Initialized state for transaction '${id}' at ${state.path}`);

        await uploadStateArtifact(state.path);
        logInfo(`Uploaded state artifact for transaction '${id}'`);

        core.info(`Transaction '${id}' initialized and state uploaded`);
    } catch (err) {
        logError("Failed to initialize transaction", err instanceof Error ? err : undefined);
        core.setFailed(err instanceof Error ? err.message : String(err));
    }
}

run();