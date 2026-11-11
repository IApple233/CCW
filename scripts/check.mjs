import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { shortPageSizes } from '../assets/gallery-layout.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const css = await readFile(path.join(root, 'assets/style.css'), 'utf8');
const app = await readFile(path.join(root, 'assets/app.js'), 'utf8');
const gallery = JSON.parse(await readFile(path.join(root, 'assets/gallery.json'), 'utf8'));
const selection = JSON.parse(await readFile(path.join(root, 'scripts/gallery-selection.json'), 'utf8'));
const refresh = JSON.parse(await readFile(path.join(root, 'scripts/gallery-refresh-20261111.json'), 'utf8'));
const mediaSizes = JSON.parse(await readFile(path.join(root, 'assets/media-sizes.json'), 'utf8'));
const assets = new Set([...html.matchAll(/(?:src|href|poster)="([^"#][^"]*)"/g)].map((m) => m[1]).filter((s) => !/^https?:/.test(s)));
for (const match of css.matchAll(/url\("([^"]+)"\)/g)) assets.add(`assets/${match[1]}`);
const pageSizes = shortPageSizes(gallery.short.length);
assert.deepEqual(pageSizes, refresh.shortPageSizes, 'Short page sizes must match the curated selection');
assert.equal(pageSizes.reduce((sum, size) => sum + size, 0), gallery.short.length, 'Every short case belongs to one page');
assert(pageSizes.every((size) => size > 0 && size % 3 === 0), 'Each short page must have complete three-column rows');
assert.deepEqual(shortPageSizes(39), [18, 21], 'An extra complete row must go on page two');
assert.throws(() => shortPageSizes(32), /three-column/, 'Incomplete rows must not silently reach publication');
assert.equal(gallery.long.length, refresh.longCount, 'Long selection must match the curated case count');
assert.equal(gallery.long.length % 3, 0, 'Long gallery must have complete three-column rows');
assert.deepEqual(gallery.long.slice(0, 2).map((item) => item.title), refresh.longLeadingTitles, 'Preserve the requested first two long cases');
assert(!gallery.short.some((item) => refresh.removedShortTitles.includes(item.title)), 'Rejected short cases must be absent');
assert(!gallery.long.some((item) => refresh.removedLongTitles.includes(item.title)), 'Rejected or replaced long cases must be absent');
assert.deepEqual(gallery.short.filter((item) => item.selectionRole === 'temporary-row-filler').map((item) => item.id), refresh.temporaryFillers, 'Only the recorded average case may fill the final row');
assets.add('assets/gallery-layout.js');
assert(app.includes("shuffle(entries).slice(0, 6)"), 'The cover must use six randomly selected short clips');
assert(app.includes('let currentPage = -1'), 'Short pagination must initialize before showing page one');
assert(css.includes('aspect-ratio: var(--media-ratio, 1600 / 450)'), 'Cover tiles must preserve source media ratios');
for (const collection of ['short', 'long']) {
  assert.deepEqual(gallery[collection].map((item) => item.id), selection[collection].map((item) => item.id), `The ${collection} cases must follow the project owner's current selection and order`);
  selection[collection].forEach((chosen, index) => {
    for (const key of Object.keys(chosen)) assert.deepEqual(gallery[collection][index][key], chosen[key], `Incorrect selected ${key}: ${chosen.id}`);
  });
}
assert(gallery.short.every((item) => Math.abs(item.duration - item.frames / 24) < 0.01 && (item.frames === 124 || item.frames === 120)), 'Short examples must retain their supplied frame counts');
assert(gallery.long.every((item) => item.duration === 60), 'Long examples must be complete 60-second videos');
assert(!html.includes('class="play-button"') && !html.includes('playback-timeline'), 'Gallery playback has no extra play or timeline controls');
assert(!html.includes('data-category='), 'Long scenes are presented as one gallery without category filters');
const examples = [...gallery.short, ...gallery.long];
for (const encoded of refresh.encoded) {
  const item = examples.find((entry) => entry.id === encoded.id);
  assert(item, `Missing requested new case: ${encoded.id}`);
  assert.equal(encoded.frames, item.collection === 'short' ? 124 : 1440, `Wrong imported frame count: ${item.id}`);
  const data = await readFile(path.join(root, item[encoded.kind]));
  assert.equal(createHash('sha256').update(data).digest('hex'), encoded.sha256, `Imported media differs from its decoded-frame verification: ${item.id}`);
}
const ids = new Set();
for (const item of examples) {
  assert(!ids.has(item.id), `Duplicate gallery ID: ${item.id}`);
  ids.add(item.id);
  for (const key of ['title', 'category', 'caption']) assert(item[key], `Missing ${key}`);
  assert(item.duration > 0, 'Every clip needs a duration');
  for (const key of ['generated', 'proxy', 'poster', 'proxyPoster', 'thumbnail']) assets.add(item[key]);
  assets.add(item.thumbnail.replace(/\.webp$/, '-320.webp'));
  for (const width of [480, 960]) assets.add(`assets/media/previews/${item.id}-${width}.webp`);
}
for (const asset of assets) await access(path.join(root, asset), constants.R_OK);
for (const asset of [...assets].filter((asset) => asset.endsWith('.mp4'))) {
  const data = await readFile(path.join(root, asset));
  assert.equal(mediaSizes[asset]?.size, data.byteLength, `Stale media size: ${asset}`);
  assert.equal(mediaSizes[asset]?.revision, createHash('sha256').update(data).digest('hex').slice(0, 16), `Stale media revision: ${asset}`);
}
for (const anchor of html.matchAll(/href="#([^"]+)"/g)) assert(html.includes(`id="${anchor[1]}"`), `Broken anchor: ${anchor[1]}`);
assert(html.includes('CoCode-World'), 'Correct publication title required');
console.log(`Validated ${assets.size} local assets, ${examples.length} gallery examples, selected case order, media revisions, and section anchors.`);
