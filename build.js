/* build.js */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const actions = ['start', 'step', 'end'];

console.log('🏗️  Building GitHub Actions with ncc...');

// First, compile TypeScript to intermediate dist/
console.log('📦 Compiling TypeScript...');
execSync('tsc -b', { stdio: 'inherit' });

// Then bundle each action with ncc
actions.forEach(action => {
    const actionDir = path.join('action', action);
    const actionDistDir = path.join(actionDir, 'dist');
    const sourceFile = path.join('dist', 'action', action, 'src', 'index.js');

    console.log(`📦 Bundling '${action}' action...`);

    // Clean action's dist folder
    if (fs.existsSync(actionDistDir)) {
        fs.rmSync(actionDistDir, { recursive: true, force: true });
    }

    // Bundle with ncc
    execSync(`npx @vercel/ncc build ${sourceFile} -o ${actionDistDir} --source-map --license licenses.txt`, {
        stdio: 'inherit'
    });

    // Verify the bundle was created
    const bundleFile = path.join(actionDistDir, 'index.js');
    if (!fs.existsSync(bundleFile)) {
        console.error(`❌ Failed to bundle: ${bundleFile}`);
        process.exit(1);
    }

    console.log(`✅ '${action}' bundled successfully: ${actionDistDir}/index.js`);
});

console.log('🚀 All actions built and bundled successfully!');
