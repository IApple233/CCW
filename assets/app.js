// Register the handler without prefetching any videos.
const mediaCacheReady = Promise.race([(async () => {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  try {
    await navigator.serviceWorker.register(new URL('../service-worker.js', import.meta.url));
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await Promise.race([
        new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })),
        new Promise((resolve) => setTimeout(resolve, 1500))
      ]);
    }
  } catch { /* Native playback remains available when caching is blocked. */ }
})(), new Promise((resolve) => setTimeout(resolve, 3000))]);

const demo = document.querySelector('#demo-video');
let activeCard = null;
let demoRequest = 0;
let demoResumeTime = 0;
const coverVideos = [];
let coverVisible = false;

function releaseDemo() {
  demoRequest++;
  demo.pause();
  if (demo.readyState === 0 && demo.networkState !== HTMLMediaElement.NETWORK_LOADING) return;
  if (demo.readyState > 0) demoResumeTime = demo.ended ? 0 : demo.currentTime;
  demo.preload = 'none';
  demo.load();
}

demo.addEventListener('loadedmetadata', () => {
  if (demoResumeTime > 0 && Number.isFinite(demo.duration)) {
    demo.currentTime = Math.min(demoResumeTime, Math.max(0, demo.duration - .05));
  }
  demoResumeTime = 0;
});

document.querySelector('#watch-demo').addEventListener('click', async () => {
  activeCard?.release();
  const request = ++demoRequest;
  await mediaCacheReady;
  if (request !== demoRequest) return;
  demo.scrollIntoView({ block: 'center', behavior: 'auto' });
  try { await demo.play(); } catch { demo.focus(); }
});

demo.addEventListener('play', () => activeCard?.release());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    activeCard?.release();
    releaseDemo();
    coverVideos.forEach((video) => video.pause());
  } else if (coverVisible) {
    coverVideos.forEach((video) => void video.play().catch(() => {}));
  }
});

const visibility = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting && activeCard?.stage === entry.target) activeCard.release();
  }
}) : null;

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function mountCoverVideos(entries) {
  const scenes = document.querySelector('#cover-scenes');
  const wall = document.querySelector('#cover-video-wall');
  if (!scenes || !wall || !entries?.length) return;

  const selected = shuffle(entries).slice(0, 6);
  scenes.querySelectorAll('.cover-fallback img').forEach((image, index) => {
    const item = selected[index % selected.length];
    image.src = item.poster;
    image.width = item.width;
    image.height = item.height;
  });
  const rows = Array.from({ length: 3 }, (_, rowIndex) => {
    const row = element('div', 'cover-video-row');
    row.dataset.row = String(rowIndex);
    return row;
  });
  let playable = 0;
  rows.forEach((row, rowIndex) => {
    for (let tileIndex = 0; tileIndex < 2; tileIndex++) {
      const item = selected[rowIndex * 2 + tileIndex];
      const tile = element('div', 'cover-video-tile');
      const video = element('video');
      tile.style.setProperty('--media-ratio', `${item.width} / ${item.height}`);
      video.width = item.width;
      video.height = item.height;
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'none';
      video.poster = item.poster;
      video.setAttribute('aria-hidden', 'true');
      video.addEventListener('loadedmetadata', () => {
        if (Number.isFinite(video.duration) && video.duration > 0.2) {
          video.currentTime = Math.random() * Math.max(0, video.duration - 0.1);
        }
        void video.play().catch(() => {});
      }, { once: true });
      video.addEventListener('canplay', () => {
        playable += 1;
        if (playable === 1) scenes.dataset.videoReady = 'true';
      }, { once: true });
      video.addEventListener('error', () => tile.classList.add('is-failed'));
      video.src = item.generated;
      coverVideos.push(video);
      tile.append(video);
      row.append(tile);
    }
  });
  wall.replaceChildren(...rows);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      coverVisible = entry.isIntersecting && !document.hidden;
      coverVideos.forEach((video) => {
        if (coverVisible) void video.play().catch(() => {});
        else video.pause();
      });
    }, { threshold: 0.05 });
    observer.observe(scenes.closest('.cover') || scenes);
  } else {
    coverVisible = true;
    coverVideos.forEach((video) => void video.play().catch(() => {}));
  }
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

class SceneCard {
  constructor(item, number) {
    this.item = item;
    this.requestId = 0;
    this.frame = 0;
    this.videos = [];
    this.playing = false;
    this.loading = false;
    this.root = element('article', 'scene-card');
    this.root.dataset.caseId = item.id;
    this.root.setAttribute('aria-labelledby', `scene-title-${number}`);
    const heading = element('div', 'scene-heading');
    const title = element('h3', '', item.title);
    title.id = `scene-title-${number}`;
    heading.append(title, element('span', 'scene-duration', `${Math.round(item.duration)} sec`));

    this.stage = element('div', 'scene-stage');
    const poster = element('img', 'card-poster');
    poster.src = `assets/media/previews/${item.id}-480.webp`;
    poster.srcset = `assets/media/previews/${item.id}-480.webp 480w, assets/media/previews/${item.id}-960.webp 960w`;
    poster.sizes = '(max-width: 600px) 90vw, (max-width: 900px) 43vw, 28vw';
    poster.width = item.width;
    poster.height = item.height;
    poster.loading = 'lazy';
    poster.decoding = 'async';
    poster.alt = '';
    this.views = element('div', 'player-views');
    this.launch = element('button', 'scene-launch');
    this.launch.type = 'button';
    this.glyph = element('span', 'play-glyph', '▶');
    this.glyph.setAttribute('aria-hidden', 'true');
    this.launch.append(this.glyph);
    this.launch.addEventListener('click', () => {
      if (this.playing || this.loading) this.pause();
      else void this.play();
    });
    const labels = element('div', 'player-labels');
    labels.setAttribute('aria-hidden', 'true');
    labels.append(element('span', '', 'Player A'), element('span', '', 'Player B'));
    this.stage.append(poster, this.views, this.launch, labels);

    const controls = element('div', 'scene-controls');
    const label = element('label', '', 'Generated');
    label.htmlFor = `scene-range-${number}`;
    this.range = element('input');
    this.range.type = 'range';
    this.range.id = label.htmlFor;
    this.range.min = '0';
    this.range.max = '100';
    this.range.value = '0';
    this.range.disabled = true;
    this.range.setAttribute('aria-label', `Generated and 3D proxy comparison for ${item.title}`);
    this.range.addEventListener('input', () => this.setSplit(this.range.value));
    controls.append(label, this.range, element('span', '', '3D proxy'));
    this.status = element('p', 'scene-status');
    this.status.setAttribute('role', 'status');
    this.status.hidden = true;
    this.root.append(heading, this.stage, controls, element('p', 'scene-caption', item.caption), this.status);
    this.setSplit(0);
    this.updateState();
    visibility?.observe(this.stage);
  }

  updateState() {
    this.root.toggleAttribute('data-playing', this.playing);
    this.root.toggleAttribute('data-loading', this.loading);
    this.launch.setAttribute('aria-label', `${this.playing ? 'Pause' : this.loading ? 'Cancel loading' : 'Play'} ${this.item.title}`);
    this.launch.setAttribute('aria-pressed', String(this.playing));
    this.glyph.textContent = this.loading ? '…' : this.playing ? 'Ⅱ' : '▶';
    this.stage.setAttribute('aria-busy', String(this.loading));
  }

  notify(message = '') {
    this.status.textContent = message;
    this.status.hidden = !message;
  }

  createMedia() {
    if (this.videos.length) return;
    for (const player of ['a', 'b']) {
      const viewport = element('div', 'player-viewport');
      viewport.dataset.player = player;
      const generatedLayer = element('div', 'generated-layer');
      for (const kind of ['proxy', 'generated']) {
        const video = element('video', `${kind}-video media-slice`);
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.preload = 'auto';
        video.setAttribute('aria-label', `Player ${player.toUpperCase()} ${kind}`);
        video.addEventListener('error', () => {
          if (!video.getAttribute('src') || activeCard !== this) return;
          this.release();
          this.notify('The video could not load. Click the scene to retry.');
        });
        // Both viewpoints use one source and share the service worker's cached chunks.
        video.src = this.item[kind];
        (kind === 'generated' ? generatedLayer : viewport).append(video);
        this.videos.push(video);
      }
      viewport.append(generatedLayer, element('div', 'compare-divider'));
      this.views.append(viewport);
    }
  }

  async play() {
    if (activeCard !== this) {
      activeCard?.release();
      activeCard = this;
      this.setSplit(0);
    }
    releaseDemo();
    this.pause();
    this.notify();
    this.loading = true;
    this.updateState();
    const request = ++this.requestId;
    await mediaCacheReady;
    if (request !== this.requestId || activeCard !== this) return;
    this.createMedia();
    try {
      await Promise.all(this.videos.map((video) => video.play()));
      if (request !== this.requestId || activeCard !== this) return;
      this.loading = false;
      this.playing = true;
      this.range.disabled = false;
      this.root.setAttribute('data-ready', '');
      this.updateState();
      this.sync();
    } catch {
      if (request !== this.requestId) return;
      this.release();
      this.notify('Playback could not start. Click the scene to retry.');
    }
  }

  pause() {
    this.requestId++;
    this.playing = false;
    this.loading = false;
    this.videos.forEach((video) => video.pause());
    cancelAnimationFrame(this.frame);
    this.updateState();
  }

  release() {
    this.pause();
    this.videos.forEach((video) => {
      video.removeAttribute('src');
      video.load();
    });
    this.videos = [];
    this.views.replaceChildren();
    this.range.disabled = true;
    this.root.removeAttribute('data-ready');
    this.setSplit(0);
    if (activeCard === this) activeCard = null;
  }

  sync() {
    if (!this.playing) return;
    const leader = this.videos.find((video) => video.classList.contains('generated-video'));
    const time = leader?.currentTime || 0;
    this.videos.forEach((video) => {
      if (video.readyState >= 2 && !video.seeking && Math.abs(video.currentTime - time) > .08) video.currentTime = time;
    });
    this.frame = requestAnimationFrame(() => this.sync());
  }

  setSplit(value) {
    const proxy = Math.max(0, Math.min(100, Number(value)));
    this.root.style.setProperty('--split', `${100 - proxy}%`);
    this.root.toggleAttribute('data-full-generated', proxy === 0);
    this.root.toggleAttribute('data-full-proxy', proxy === 100);
    this.range.value = String(proxy);
    this.range.setAttribute('aria-valuetext', `${100 - proxy} percent generated, ${proxy} percent 3D proxy`);
  }
}

function renderPagination(root, cards, pageSize) {
  const navigation = root.querySelector('.collection-pagination');
  if (!navigation || cards.length <= pageSize) return;

  const totalPages = Math.ceil(cards.length / pageSize);
  const previous = element('button', 'pagination-arrow', '←');
  previous.type = 'button';
  previous.setAttribute('aria-label', 'Show previous short video page');
  const pages = element('div', 'pagination-pages');
  const next = element('button', 'pagination-arrow', '→');
  next.type = 'button';
  next.setAttribute('aria-label', 'Show next short video page');
  const status = element('span', 'pagination-status');
  status.setAttribute('aria-live', 'polite');
  const pageButtons = [];
  let currentPage = -1;

  for (let page = 0; page < totalPages; page++) {
    const button = element('button', 'pagination-page', String(page + 1));
    button.type = 'button';
    button.setAttribute('aria-label', `Show short video page ${page + 1}`);
    button.dataset.page = String(page);
    button.addEventListener('click', () => showPage(page));
    pageButtons.push(button);
    pages.append(button);
  }

  function showPage(page) {
    const nextPage = Math.max(0, Math.min(totalPages - 1, page));
    if (nextPage === currentPage) return;
    currentPage = nextPage;
    if (activeCard && cards.includes(activeCard)) activeCard.release();
    cards.forEach((card, index) => {
      card.root.hidden = index < currentPage * pageSize || index >= (currentPage + 1) * pageSize;
    });
    previous.disabled = currentPage === 0;
    next.disabled = currentPage === totalPages - 1;
    pageButtons.forEach((button, index) => {
      button.setAttribute('aria-current', index === currentPage ? 'page' : 'false');
    });
    status.textContent = `Page ${currentPage + 1} of ${totalPages}`;
  }

  previous.addEventListener('click', () => showPage(currentPage - 1));
  next.addEventListener('click', () => showPage(currentPage + 1));
  navigation.replaceChildren(previous, pages, next, status);
  navigation.hidden = false;
  showPage(0);
}

async function initialize() {
  try {
    const response = await fetch('assets/gallery.json');
    if (!response.ok) throw new Error('Gallery unavailable');
    const collections = await response.json();
    mountCoverVideos(collections.short);
    let number = 0;
    document.querySelectorAll('[data-collection]').forEach((root) => {
      const entries = collections[root.dataset.collection];
      if (!Array.isArray(entries) || !entries.length) throw new Error('Missing gallery collection');
      const grid = root.querySelector('.video-grid');
      const fragment = document.createDocumentFragment();
      const cards = entries.map((item) => new SceneCard(item, number++));
      cards.forEach((card) => fragment.append(card.root));
      grid.replaceChildren(fragment);
      grid.setAttribute('aria-busy', 'false');
      renderPagination(root, cards, root.dataset.collection === 'short' ? 16 : cards.length);
    });
  } catch {
    document.querySelectorAll('[data-collection]').forEach((root) => {
      const status = root.querySelector('.collection-status');
      status.textContent = 'The gallery could not load. Please refresh the page.';
      status.hidden = false;
      root.querySelector('.video-grid').setAttribute('aria-busy', 'false');
    });
  }
  // Mount only the existing heading moment. The full site runtime is unnecessary here.
  try {
    const { mountAll } = await import('./taste/moments/moments.js');
    await mountAll();
  } catch { /* The heading remains readable if motion cannot be loaded. */ }
}
initialize();
