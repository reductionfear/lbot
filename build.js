import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const injectSrc = path.join(__dirname, 'inject.js');
const injectDest = path.join(distDir, 'inject.js');

console.log('Building Lichess External Mover...');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('✓ Created dist directory');
}

// Copy inject.js to dist
fs.copyFileSync(injectSrc, injectDest);
console.log('✓ Copied inject.js to dist/');

console.log('');
console.log('Build complete! Run "npm start" to launch the application.');
