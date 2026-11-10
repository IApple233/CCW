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
const galleries = [];
const watchDemo = document.querySelector('#watch-demo');
let demoResumeTime = 0;
let demoRequest = 0;

function releaseDemo() {
  demoRequest++;
  demo.pause();
  if (demo.readyState === 0 && demo.networkState !== HTMLMediaElement.NETWORK_LOADING) return;
  if (demo.readyState > 0) demoResumeTime = demo.ended ? 0 : demo.currentTime;
  // Resetting with preload="none" cancels buffering while retaining the native source and controls.
  demo.preload = 'none';
  demo.load();
}

demo.addEventListener('loadedmetadata', () => {
  if (demoResumeTime > 0 && Number.isFinite(demo.duration)) {
    demo.currentTime = Math.min(demoResumeTime, Math.max(0, demo.duration - 0.05));
  }
  demoResumeTime = 0;
});

watchDemo?.addEventListener('click', async () => {
  galleries.forEach((gallery) => gallery.release());
  const request = ++demoRequest;
  await mediaCacheReady;
  if (request !== demoRequest) return;
  demo.scrollIntoView({ block: 'center', behavior: 'auto' });
  try { await demo.play(); } catch { demo.focus(); }
});

const navToggle = document.querySelector('.nav__toggle');
if (navToggle) {
  const updateNavLabel = () => navToggle.setAttribute('aria-label',
    navToggle.getAttribute('aria-expanded') === 'true' ? 'Close navigation' : 'Open navigation');
  new MutationObserver(updateNavLabel).observe(navToggle, { attributes: true, attributeFilter: ['aria-expanded'] });
  updateNavLabel();
}

class Gallery {
  constructor(root, entries) {
    this.root = root;
    this.entries = entries;
    this.long = root.dataset.collection === 'long';
    this.cases = entries;
    this.pageSize = 12;
    this.page = 0;
    this.index = 0;
    this.playing = false;
    this.requestId = 0;
    this.loadId = 0;
    this.frame = 0;
    this.shell = root.querySelector('.gallery-shell');
    this.views = root.querySelector('.paired-viewports');
    this.videos = [...this.views.querySelectorAll('video')];
    this.range = root.querySelector('.comparison-control input');
    this.selector = root.querySelector('.case-selector');
    this.navigation = root.querySelector('.collection-navigation');

    this.range.addEventListener('input', () => this.setSplit(this.range.value));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) this.pause();
      }).observe(this.shell);
    }
    this.videos.forEach((video) => video.addEventListener('error', () => {
      if (!video.getAttribute('src')) return;
      this.pause();
      this.notify('This video could not be loaded. Select the case again to retry.');
    }));
    this.renderSelector();
    this.select(0);
    this.shell.setAttribute('aria-busy', 'false');
  }

  notify(message = '') {
    const status = this.root.querySelector('.gallery-status');
    status.textContent = message;
    status.hidden = !message;
  }

  pause() {
    this.requestId++;
    this.playing = false;
    this.videos.forEach((video) => video.pause());
    cancelAnimationFrame(this.frame);
  }

  release() {
    this.pause();
    this.loadId++;
    this.videos.forEach((video) => {
      video.preload = 'none';
      video.removeAttribute('src');
      video.load();
    });
  }

  async load() {
    const selected = this.cases[this.index];
    const load = this.loadId;
    await mediaCacheReady;
    if (selected !== this.cases[this.index] || load !== this.loadId) return;
    this.videos.forEach((video) => {
      if (!video.getAttribute('src') || video.error) {
        video.preload = 'auto';
        video.src = video.dataset.src;
        video.load();
      }
      video.loop = true;
    });
  }

  async play() {
    this.pause();
    galleries.forEach((gallery) => { if (gallery !== this) gallery.release(); });
    releaseDemo();
    this.notify();
    const request = ++this.requestId;
    await this.load();
    if (request !== this.requestId) return;
    try {
      await Promise.all(this.videos.map((video) => video.play()));
      if (request !== this.requestId) return;
      this.playing = true;
      this.sync();
    } catch {
      if (request !== this.requestId) return;
      this.pause();
      this.notify('Playback could not start. Select this case again to retry.');
    }
  }

  sync() {
    if (!this.playing) return;
    const time = this.videos.find((video) => video.classList.contains('generated-video'))?.currentTime || 0;
    this.videos.forEach((video) => {
      if (video.readyState >= 2 && !video.seeking && Math.abs(video.currentTime - time) > 0.08) video.currentTime = time;
    });
    this.frame = requestAnimationFrame(() => this.sync());
  }

  setSplit(value) {
    const proxy = Math.max(0, Math.min(100, Number(value)));
    this.views.style.setProperty('--split', `${100 - proxy}%`);
    this.views.toggleAttribute('data-full-generated', proxy === 0);
    this.range.value = String(proxy);
    this.range.setAttribute('aria-valuetext', `${100 - Math.round(proxy)} percent generated, ${Math.round(proxy)} percent 3D proxy`);
  }

  select(index, autoplay = false) {
    this.pause();
    this.loadId++;
    this.notify();
    this.index = index;
    const item = this.cases[index];
    this.setSplit(0);
    this.views.style.setProperty('--view-ratio', `${item.width / 2} / ${item.height}`);
    this.shell.dataset.caseId = item.id;
    this.videos.forEach((video) => {
      const generated = video.classList.contains('generated-video');
      video.preload = 'none';
      video.removeAttribute('src');
      video.poster = generated ? item.poster : item.proxyPoster;
      video.dataset.src = generated ? item.generated : item.proxy;
      video.load();
    });
    this.root.querySelector('.gallery-heading h3').textContent = item.title;
    this.root.querySelector('.gallery-caption').textContent = item.caption;
    this.selector.querySelectorAll('.case-button').forEach((button) => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.index) === index));
    });
    if (autoplay) void this.play();
  }

  openCase(index) {
    this.shell.scrollIntoView({ block: 'center', behavior: 'auto' });
    this.select(index, true);
  }

  renderSelector() {
    this.selector.replaceChildren();
    const start = this.page * this.pageSize;
    const visibleCases = this.long ? this.cases : this.cases.slice(start, start + this.pageSize);
    visibleCases.forEach((item, offset) => {
      const index = start + offset;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'case-button';
      button.dataset.index = String(index);
      button.setAttribute('aria-label', `Show ${item.title}`);
      button.setAttribute('aria-pressed', String(index === this.index));
      const thumbnail = document.createElement('img');
      thumbnail.loading = 'lazy';
      thumbnail.decoding = 'async';
      // Match the gallery columns and gutters without downloading the largest thumbnail everywhere.
      thumbnail.sizes = '(max-width: 359px) calc((100vw - 52px) / 2), (max-width: 639px) calc((100vw - 60px) / 2), (max-width: 1023px) calc((100vw - 132px) / 4), (min-width: 1440px) 190px, calc((100vw - 160px) / 6)';
      thumbnail.srcset = `${item.thumbnail.replace(/\.webp$/, '-320.webp')} 320w, ${item.thumbnail} 400w`;
      thumbnail.src = item.thumbnail;
      thumbnail.alt = '';
      thumbnail.width = 400;
      thumbnail.height = 226;
      const thumbnailFrame = document.createElement('span');
      thumbnailFrame.className = 'case-thumbnail m-zoom';
      thumbnailFrame.append(thumbnail);
      const title = document.createElement('span');
      title.textContent = item.title;
      button.append(thumbnailFrame, title);
      button.addEventListener('click', () => this.openCase(index));
      this.selector.append(button);
    });
    if (!this.navigation) return;
    this.navigation.replaceChildren();
    const label = document.createElement('span');
    label.textContent = `Page ${this.page + 1} of ${Math.ceil(this.cases.length / this.pageSize)}`;
    this.navigation.append(label);
    for (let page = 0; page < Math.ceil(this.cases.length / this.pageSize); page++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `Page ${page + 1}`;
      button.setAttribute('aria-label', `Show ${button.textContent.toLowerCase()}`);
      button.setAttribute('aria-current', page === this.page ? 'page' : 'false');
      button.addEventListener('click', () => {
        this.page = page;
        this.renderSelector();
        this.openCase(page * this.pageSize);
      });
      this.navigation.append(button);
    }
  }
}

demo.addEventListener('play', () => galleries.forEach((gallery) => gallery.release()));
document.addEventListener('visibilitychange', () => { if (document.hidden) galleries.forEach((gallery) => gallery.pause()); });

async function initialize() {
  try {
    const response = await fetch('assets/gallery.json');
    if (!response.ok) throw new Error('Gallery unavailable');
    const collections = await response.json();
    document.querySelectorAll('[data-collection]').forEach((root) => {
      const entries = collections[root.dataset.collection];
      if (!Array.isArray(entries) || !entries.length) throw new Error('Missing gallery collection');
      galleries.push(new Gallery(root, entries));
    });
  } catch {
    document.querySelectorAll('[data-collection]').forEach((root) => {
      const status = root.querySelector('.gallery-status');
      status.textContent = 'The gallery could not be loaded. Please refresh the page or watch the full demonstration above.';
      status.hidden = false;
      root.querySelector('.gallery-shell').setAttribute('aria-busy', 'false');
    });
  }
}
initialize();
