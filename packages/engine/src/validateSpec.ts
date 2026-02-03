import { TransactionSpec } from "./transactionSpec";

/**
 * Validates that a transaction specification contains all required fields.
 *
 * This function performs structural validation to ensure:
 * - The transaction root object exists
 * - The transaction has a valid ID
 * - The state configuration includes a path
 *
 * @param spec - The transaction specification to validate
 * @throws Error if any required field is missing or invalid
 */
export function validateSpec(spec: TransactionSpec) {
    // Check for transaction root object
    if (!spec?.transaction) {
        throw new Error("Missing 'transaction' root");
    }

    const { id, state } = spec.transaction;

    // Validate transaction ID is present
    if (!id) {
        throw new Error("transaction.id is required");
    }

    // Validate state path is configured
    if (!state?.path) {
        throw new Error("transaction.state.path is required");
    }
}
