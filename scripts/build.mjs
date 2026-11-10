import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultOutput = path.join(root, 'dist');
const output = path.resolve(process.env.CCW_BUILD_DIR || defaultOutput);
if (output !== defaultOutput && (output === root || output.startsWith(`${root}${path.sep}`))) {
  throw new Error('CCW_BUILD_DIR must point outside the repository to preserve project files.');
}
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of ['index.html', 'assets', 'service-worker.js', '.nojekyll']) {
  await cp(path.join(root, file), path.join(output, file), { recursive: true });
}
console.log(`Built static project page in ${output}`);
