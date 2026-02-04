import * as core from "@actions/core";
import fs from "fs";
import path from "path";
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
 * 4. Uploading state and spec as artifacts for multi-job workflows
 */
async function run() {

    try {
        logInfo("Starting transaction initialization");
        const specPath = core.getInput("spec", { required: true });
        const spec = loadSpec(specPath);

        validateSpec(spec);

        const { id, state } = spec.transaction;

        // Store absolute path to spec file in state
        const absoluteSpecPath = path.resolve(specPath);
        initState(state.path, id, absoluteSpecPath);
        logInfo(`Initialized state for transaction '${id}' at ${state.path}`);

        // Copy spec file to state directory so it's available in other jobs
        const stateDir = path.dirname(state.path);
        const specFileName = path.basename(specPath);
        const specCopyPath = path.join(stateDir, specFileName);
        fs.copyFileSync(specPath, specCopyPath);
        logInfo(`Copied spec file to ${specCopyPath}`);

        await uploadStateArtifact(state.path);
        logInfo(`Uploaded state artifact for transaction '${id}'`);

        core.info(`Transaction '${id}' initialized and state uploaded`);
    } catch (err) {
        logError("Failed to initialize transaction", err instanceof Error ? err : undefined);
        core.setFailed(err instanceof Error ? err.message : String(err));
    }
}

run();