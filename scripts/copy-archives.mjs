import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'archives');
const dest = path.join(root, 'dist', 'archives');

if (!fs.existsSync(src)) {
  console.log('[info] No archives/ folder, skip copy');
  process.exit(0);
}

fs.mkdirSync(dest, { recursive: true });
for (const name of fs.readdirSync(src)) {
  fs.copyFileSync(path.join(src, name), path.join(dest, name));
}
console.log('[info] Copied archives/ -> dist/archives/');
