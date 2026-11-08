import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const css = await readFile(path.join(root, 'assets/style.css'), 'utf8');
const gallery = JSON.parse(await readFile(path.join(root, 'assets/gallery.json'), 'utf8'));
const assets = new Set([...html.matchAll(/(?:src|href|poster)="([^"#][^"]*)"/g)].map((m) => m[1]).filter((s) => !/^https?:/.test(s)));
for (const match of css.matchAll(/url\("([^"]+)"\)/g)) assets.add(`assets/${match[1]}`);
assert.equal(gallery.short.length, 24, 'Exactly 24 short examples are required');
assert.equal(gallery.long.length, 18, 'Exactly 18 long examples are required');
assert(gallery.short.every((item) => item.checkpoint === 5000 && Math.abs(item.duration - 124 / 24) < 0.01), 'Short examples must use Step 5000 and retain 124 frames');
assert(gallery.long.every((item) => item.duration === 60), 'Long examples must be complete 60-second videos');
for (const group of ['riding', 'interaction', 'exploration']) {
  assert.equal(gallery.long.filter((item) => item.group === group).length, 6, `Six ${group} examples are required`);
}
const examples = [...gallery.short, ...gallery.long];
const ids = new Set();
for (const item of examples) {
  assert(!ids.has(item.id), `Duplicate gallery ID: ${item.id}`);
  ids.add(item.id);
  for (const key of ['title', 'category', 'caption']) assert(item[key], `Missing ${key}`);
  assert(item.duration > 0, 'Every clip needs a duration');
  for (const key of ['generated', 'proxy', 'poster', 'proxyPoster', 'thumbnail']) assets.add(item[key]);
}
for (const asset of assets) await access(path.join(root, asset), constants.R_OK);
for (const anchor of html.matchAll(/href="#([^"]+)"/g)) assert(html.includes(`id="${anchor[1]}"`), `Broken anchor: ${anchor[1]}`);
assert(html.includes('CoCode-World'), 'Correct publication title required');
assert(html.includes('0.524') && html.includes('0.469') && html.includes('3.847') && html.includes('3.552'), 'Published metrics must match the supplied abstract');
console.log(`Validated ${assets.size} local assets, ${examples.length} gallery examples, category counts, section anchors, and supplied metrics.`);
