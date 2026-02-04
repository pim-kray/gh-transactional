import { DefaultArtifactClient } from "@actions/artifact";

const ARTIFACT_BASE_NAME = "gh-transaction-state";

export async function uploadStateArtifact(filePath: string) {
    const client = new DefaultArtifactClient();
    // Use a timestamp to make each artifact unique within the workflow run
    const timestamp = Date.now();
    const artifactName = `${ARTIFACT_BASE_NAME}-${timestamp}`;

    await client.uploadArtifact(
        artifactName,
        [filePath],
        process.cwd()
    );
}

export async function downloadStateArtifact() {
    const client = new DefaultArtifactClient();
    const { artifacts } = await client.listArtifacts();

    // Find the latest artifact with our base name (sorted by creation time)
    const stateArtifacts = artifacts
        .filter(a => a.name.startsWith(ARTIFACT_BASE_NAME))
        .sort((a, b) => {
            // Extract timestamps from artifact names and sort descending
            const timeA = parseInt(a.name.split('-').pop() || '0');
            const timeB = parseInt(b.name.split('-').pop() || '0');
            return timeB - timeA;
        });

    if (stateArtifacts.length === 0) {
        throw new Error(`No artifacts found with base name '${ARTIFACT_BASE_NAME}'`);
    }

    const latestArtifact = stateArtifacts[0];

    if (!latestArtifact.id) {
        throw new Error(`Artifact '${latestArtifact.name}' has no ID`);
    }

    await client.downloadArtifact(latestArtifact.id, {
        path: process.cwd(),
    });
}

