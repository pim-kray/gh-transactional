import { DefaultArtifactClient } from "@actions/artifact";

const ARTIFACT_NAME = "gh-transaction-state";

export async function uploadStateArtifact(filePath: string) {
    const client = new DefaultArtifactClient();
    await client.uploadArtifact(
        ARTIFACT_NAME,
        [filePath],
        process.cwd()
    );
}

export async function downloadStateArtifact() {
    const client = new DefaultArtifactClient();
    const { artifacts } = await client.listArtifacts();
    const artifact = artifacts.find(a => a.name === ARTIFACT_NAME);

    if (!artifact || !artifact.id) {
        throw new Error(`Artifact '${ARTIFACT_NAME}' not found`);
    }

    await client.downloadArtifact(artifact.id, {
        path: process.cwd(),
    });
}

