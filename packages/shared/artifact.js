"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadStateArtifact = uploadStateArtifact;
exports.downloadStateArtifact = downloadStateArtifact;
const artifact_1 = require("@actions/artifact");
const ARTIFACT_NAME = "gh-transaction-state";
async function uploadStateArtifact(filePath) {
    const client = new artifact_1.DefaultArtifactClient();
    await client.uploadArtifact(ARTIFACT_NAME, [filePath], process.cwd());
}
async function downloadStateArtifact() {
    const client = new artifact_1.DefaultArtifactClient();
    const { artifacts } = await client.listArtifacts();
    const artifact = artifacts.find(a => a.name === ARTIFACT_NAME);
    if (!artifact || !artifact.id) {
        throw new Error(`Artifact '${ARTIFACT_NAME}' not found`);
    }
    await client.downloadArtifact(artifact.id, {
        path: process.cwd(),
    });
}
