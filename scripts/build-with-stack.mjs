import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, '..');
const stackDir = join(rootDir, '3d-album-stack');
const stackDistDir = join(stackDir, 'dist');
const publicStackDir = join(rootDir, 'public', '3d-album-stack');

if (!existsSync(stackDir)) {
  throw new Error('Missing 3d-album-stack directory.');
}

console.log('[build-with-stack] Building 3d-album-stack...');
execSync('npm run build:stack', { cwd: rootDir, stdio: 'inherit' });

if (!existsSync(stackDistDir)) {
  throw new Error('3d-album-stack build output was not found.');
}

rmSync(publicStackDir, { recursive: true, force: true });
mkdirSync(publicStackDir, { recursive: true });
cpSync(stackDistDir, publicStackDir, { recursive: true });

console.log('[build-with-stack] Building chill-cv...');
execSync('vite build', { cwd: rootDir, stdio: 'inherit' });
