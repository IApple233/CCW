const CACHE_PREFIX = `ccw-video-${new URL(self.registration.scope).pathname}-`;
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const CHUNK_SIZE = 1024 * 1024;
const MAX_CHUNKS = 160;
const pending = new Map();
let sizes;
let maintenance = Promise.resolve();

self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (event) => event.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map((name) => caches.delete(name)));
  await self.clients.claim();
})()));

async function mediaSizes() {
  if (!sizes) sizes = fetch(new URL('assets/media-sizes.json', self.registration.scope), { cache: 'no-cache' })
    .then((response) => { if (!response.ok) throw new Error('Media manifest unavailable'); return response.json(); })
    .catch((error) => { sizes = undefined; throw error; });
  return sizes;
}

function trim(cache) {
  maintenance = maintenance.catch(() => {}).then(async () => {
    const keys = await cache.keys();
    await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_CHUNKS)).map((key) => cache.delete(key)));
  });
  return maintenance;
}

async function chunk(url, index, size, revision) {
  const key = new URL(url);
  key.searchParams.set('ccw-revision', revision);
  key.searchParams.set('ccw-chunk', String(index));
  const id = key.href;
  if (pending.has(id)) return pending.get(id);
  const task = (async () => {
    let cache;
    try {
      cache = await caches.open(CACHE_NAME);
      const stored = await cache.match(id);
      if (stored) return new Uint8Array(await stored.arrayBuffer());
    } catch { /* Streaming still works when persistent storage is unavailable. */ }
    const start = index * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, size) - 1;
    const response = await fetch(url, { headers: { Range: `bytes=${start}-${end}` }, cache: 'no-cache' });
    if (!response.ok) throw new Error(`Video request failed: ${response.status}`);
    let data = new Uint8Array(await response.arrayBuffer());
    if (response.status === 200 && data.byteLength === size) data = data.slice(start, end + 1);
    if (data.byteLength !== end - start + 1) throw new Error('Incomplete video chunk');
    if (cache) {
      try {
        await cache.put(id, new Response(data, { headers: { 'Content-Type': 'application/octet-stream' } }));
        await trim(cache);
      } catch { /* Quota failures must not prevent playback. */ }
    }
    return data;
  })();
  pending.set(id, task);
  try { return await task; } finally { pending.delete(id); }
}

async function videoResponse(request, path) {
  let manifest;
  try { manifest = await mediaSizes(); } catch { return fetch(request); }
  const item = manifest[path];
  if (!item) return fetch(request);
  const { size, revision } = item;
  const range = request.headers.get('Range');
  const match = range && /^bytes=([0-9]*)-([0-9]*)$/.exec(range);
  if (range && (!match || (!match[1] && !match[2]))) return fetch(request);
  const start = match ? (match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]))) : 0;
  const end = match && match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (start > end || start >= size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  let cursor = start;
  let cancelled = false;
  const body = new ReadableStream({
    async pull(controller) {
      try {
        const index = Math.floor(cursor / CHUNK_SIZE);
        const data = await chunk(request.url, index, size, revision);
        if (cancelled) return;
        const offset = cursor - index * CHUNK_SIZE;
        const length = Math.min(data.byteLength - offset, end - cursor + 1);
        controller.enqueue(data.slice(offset, offset + length));
        cursor += length;
        if (cursor > end) controller.close();
      } catch (error) { if (!cancelled) controller.error(error); }
    },
    cancel() { cancelled = true; }
  });
  const headers = { 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes', 'Content-Length': String(end - start + 1) };
  if (range) headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  return new Response(body, { status: range ? 206 : 200, headers });
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || !url.href.startsWith(self.registration.scope) || !url.pathname.endsWith('.mp4')) return;
  const path = url.pathname.slice(new URL(self.registration.scope).pathname.length);
  if (!path.startsWith('assets/media/')) return;
  event.respondWith(videoResponse(event.request, path));
});
