import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const css = await readFile(path.join(root, 'assets/style.css'), 'utf8');
const app = await readFile(path.join(root, 'assets/app.js'), 'utf8');
const gallery = JSON.parse(await readFile(path.join(root, 'assets/gallery.json'), 'utf8'));
const selection = JSON.parse(await readFile(path.join(root, 'scripts/gallery-selection.json'), 'utf8'));
const mediaSizes = JSON.parse(await readFile(path.join(root, 'assets/media-sizes.json'), 'utf8'));
const assets = new Set([...html.matchAll(/(?:src|href|poster)="([^"#][^"]*)"/g)].map((m) => m[1]).filter((s) => !/^https?:/.test(s)));
for (const match of css.matchAll(/url\("([^"]+)"\)/g)) assets.add(`assets/${match[1]}`);
assert.equal(gallery.short.length, 32, 'Exactly 32 current short examples are required');
assert.equal(gallery.long.length, 12, 'Exactly 12 current long examples are required');
for (const collection of ['short', 'long']) {
  assert.deepEqual(gallery[collection].map((item) => item.id), selection[collection].map((item) => item.id), `The ${collection} cases must follow the project owner's current selection and order`);
}
assert(gallery.short.every((item) => item.checkpoint === 2000 || item.checkpoint === 3000), 'Short examples must use current actor/eval checkpoints');
assert(gallery.short.every((item) => Math.abs(item.duration - item.frames / 24) < 0.01 && (item.frames === 124 || item.frames === 120)), 'Short examples must retain their supplied frame counts');
assert(gallery.long.every((item) => item.duration === 60), 'Long examples must be complete 60-second videos');
assert.equal(gallery.long.filter((item) => item.group === 'riding').length, 6, 'Six riding examples are required');
assert.equal(gallery.long.filter((item) => item.group === 'interaction').length, 5, 'Five interaction examples are required');
assert.equal(gallery.long.filter((item) => item.group === 'exploration').length, 1, 'One exploration example is required');
assert(!html.includes('class="play-button"') && !html.includes('playback-timeline'), 'Gallery playback has no extra play or timeline controls');
assert(!html.includes('data-category='), 'Long scenes are presented as one gallery without category filters');
assert.equal((html.match(/class="case-selector long-selector"/g) || []).length, 1, 'Long scenes use one selector');
assert(css.includes('.long-selector { grid-template-columns: repeat(6, minmax(0, 1fr))'), 'The desktop long-scene gallery uses six columns');
assert(app.includes('this.shell.scrollIntoView({ block: \'center\', behavior: \'auto\' })') && app.includes('this.select(index, true)'), 'Opening a case scrolls to its player and starts playback');
const examples = [...gallery.short, ...gallery.long];
const ids = new Set();
for (const item of examples) {
  assert(!ids.has(item.id), `Duplicate gallery ID: ${item.id}`);
  ids.add(item.id);
  for (const key of ['title', 'category', 'caption']) assert(item[key], `Missing ${key}`);
  assert(item.duration > 0, 'Every clip needs a duration');
  for (const key of ['generated', 'proxy', 'poster', 'proxyPoster', 'thumbnail']) assets.add(item[key]);
  assets.add(item.thumbnail.replace(/\.webp$/, '-320.webp'));
}
for (const asset of assets) await access(path.join(root, asset), constants.R_OK);
for (const asset of [...assets].filter((asset) => asset.endsWith('.mp4'))) {
  const data = await readFile(path.join(root, asset));
  assert.equal(mediaSizes[asset]?.size, data.byteLength, `Stale media size: ${asset}`);
  assert.equal(mediaSizes[asset]?.revision, createHash('sha256').update(data).digest('hex').slice(0, 16), `Stale media revision: ${asset}`);
}
for (const anchor of html.matchAll(/href="#([^"]+)"/g)) assert(html.includes(`id="${anchor[1]}"`), `Broken anchor: ${anchor[1]}`);
assert(html.includes('CoCode-World'), 'Correct publication title required');
assert(html.includes('0.524') && html.includes('0.469') && html.includes('3.847') && html.includes('3.552'), 'Published metrics must match the supplied abstract');
console.log(`Validated ${assets.size} local assets, ${examples.length} gallery examples, desktop layout, playback controls, section anchors, and supplied metrics.`);
