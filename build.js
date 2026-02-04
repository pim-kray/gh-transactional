/* build.js */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const actions = ['start', 'step', 'end'];

console.log('🏗️  Verifying build output for GitHub Actions...');

actions.forEach(action => {
    const distFile = path.join('dist', 'action', action, 'src', 'index.js');

    if (!fs.existsSync(distFile)) {
        console.error(`❌ Build output not found: ${distFile}`);
        process.exit(1);
    }

    console.log(`✅ '${action}' built successfully: ${distFile}`);
});

console.log('🚀 All actions built successfully!');
