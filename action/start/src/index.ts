import * as core from "@actions/core";
import {loadSpec} from "engine/src/transactionSpec";
import {validateSpec} from "engine/src/validateSpec";
import {initState} from "engine/src/state";

async function run() {
    try {
        const specPath = core.getInput("spec", { required: true });
        const spec = loadSpec(specPath);

        validateSpec(spec);

        const { id, state } = spec.transaction;

        initState(state.path, id);

        core.info(`Transaction '${id}' initialized`);
    } catch (err: any) {
        core.setFailed(err.message);
    }
}

run();