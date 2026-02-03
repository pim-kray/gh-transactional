import * as core from "@actions/core";
import {loadSpec} from "engine/src/transactionSpec";
import {validateSpec} from "engine/src/validateSpec";
import {initState} from "engine/src/state";

/**
 * GitHub Action: Start Transaction
 *
 * This action initializes a new transaction by:
 * 1. Loading the transaction specification from a YAML file
 * 2. Validating the spec structure
 * 3. Creating an initial transaction state file
 */
async function run() {
    try {
        const specPath = core.getInput("spec", { required: true });
        const spec = loadSpec(specPath);

        validateSpec(spec);

        const { id, state } = spec.transaction;

        initState(state.path, id);

        core.info(`Transaction '${id}' initialized`);
    } catch (err) {
        core.setFailed(err instanceof Error ? err.message : String(err));
    }
}

run();