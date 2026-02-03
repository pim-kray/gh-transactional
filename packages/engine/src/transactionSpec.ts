import fs from "fs";
import yaml from "js-yaml"

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
    const raw = fs.readFileSync(path, "utf8");
    return yaml.load(raw) as TransactionSpec;
}