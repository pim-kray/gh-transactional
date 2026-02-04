import fs from "fs";
import yaml from "js-yaml";

export type TransactionSpec = {
    transaction: {
        id: string;
        mode?: "strict" | "best-effort";
        state: {
            path: string;
        }
    }
}

export function loadSpec(path: string): TransactionSpec {
    try {
        const raw = fs.readFileSync(path, "utf8");
        const spec = yaml.load(raw) as TransactionSpec;

        if (!spec) {
            throw new Error("Spec file is empty or invalid YAML");
        }

        return spec;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to load transaction spec from ${path}: ${error.message}`);
        }
        throw error;
    }
}