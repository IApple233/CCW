import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = {};
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await scan(file);
    else if (entry.name.endsWith('.mp4')) {
      const data = await readFile(file);
      manifest[path.relative(root, file).split(path.sep).join('/')] = {
        size: data.byteLength,
        revision: createHash('sha256').update(data).digest('hex').slice(0, 16)
      };
    }
  }
}
await scan(path.join(root, 'assets/media'));
await writeFile(path.join(root, 'assets/media-sizes.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Updated cache metadata for ${Object.keys(manifest).length} videos.`);
