const demo = document.querySelector('#demo-video');
const galleries = [];

function timeLabel(seconds) {
  const time = Math.max(0, Math.floor(seconds || 0));
  return `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`;
}

class Gallery {
  constructor(root, entries) {
    this.root = root;
    this.entries = entries;
    this.long = root.dataset.collection === 'long';
    this.cases = this.long ? entries.filter((entry) => entry.group === 'riding') : entries;
    this.pageSize = this.long ? 4 : 10;
    this.page = 0;
    this.index = 0;
    this.playing = false;
    this.pending = false;
    this.previousSplit = 62;
    this.requestId = 0;
    this.frame = 0;
    this.seekTime = 0;
    this.abort = new AbortController();
    this.shell = root.querySelector('.gallery-shell');
    this.views = root.querySelector('.paired-viewports');
    this.videos = [...this.views.querySelectorAll('video')];
    this.primary = this.views.querySelector('.generated-video');
    this.button = root.querySelector('.play-button');
    this.range = root.querySelector('.comparison-control input');
    this.timeline = root.querySelector('.playback-timeline input');
    this.selector = root.querySelector('.case-selector');
    this.navigation = root.querySelector('.collection-navigation');
    this.modes = [...root.querySelectorAll('button[data-mode]')];
    this.fullscreen = root.querySelector('.icon-button');

    this.button.addEventListener('click', () => this.playing || this.pending ? this.pause() : this.play());
    this.range.addEventListener('input', () => this.setSplit(this.range.value));
    this.modes.forEach((button) => button.addEventListener('click', () => {
      this.setSplit(button.dataset.mode === 'generated' ? 100 : button.dataset.mode === 'proxy' ? 0 : this.previousSplit);
    }));
    this.timeline?.addEventListener('input', () => this.seek(Number(this.timeline.value)));
    root.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
      this.pause();
      this.cases = this.entries.filter((entry) => entry.group === button.dataset.category);
      this.page = 0;
      root.querySelectorAll('[data-category]').forEach((tab) => tab.setAttribute('aria-pressed', String(tab === button)));
      this.renderSelector();
      this.select(0);
    }));
    this.views.querySelectorAll('.compare-viewport').forEach((viewport) => {
      let dragging = false;
      const move = (event) => {
        const bounds = viewport.getBoundingClientRect();
        this.setSplit((event.clientX - bounds.left) / bounds.width * 100);
      };
      viewport.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        dragging = true;
        viewport.setPointerCapture(event.pointerId);
        move(event);
      });
      viewport.addEventListener('pointermove', (event) => { if (dragging) move(event); });
      viewport.addEventListener('pointerup', () => { dragging = false; });
      viewport.addEventListener('pointercancel', () => { dragging = false; });
    });
    if (!document.fullscreenEnabled) this.fullscreen.hidden = true;
    this.fullscreen.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await this.shell.requestFullscreen();
      } catch { this.notify('Fullscreen is unavailable in this browser. You can continue watching here.'); }
    });
    document.addEventListener('fullscreenchange', () => this.fullscreen.setAttribute('aria-label',
      document.fullscreenElement === this.shell ? 'Exit fullscreen' : 'View gallery fullscreen'));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting && document.fullscreenElement !== this.shell) this.pause();
      }).observe(this.shell);
    }
    this.videos.forEach((video) => video.addEventListener('error', () => {
      if (!video.getAttribute('src')) return;
      this.pause();
      this.notify('This video could not be loaded. Try Play again or choose another example.');
    }));
    this.renderSelector();
    this.select(0);
    this.setSplit(62);
    this.shell.setAttribute('aria-busy', 'false');
  }

  notify(message = '') {
    const status = this.root.querySelector('.gallery-status');
    status.textContent = message;
    status.hidden = !message;
  }

  updateButton() {
    this.button.querySelector('span').textContent = this.pending ? 'Cancel' : this.playing ? 'Pause' : 'Play';
    this.button.setAttribute('aria-label', this.pending ? 'Cancel loading' : this.playing ? 'Pause both views' : 'Play both views');
    this.button.querySelector('svg').innerHTML = this.pending || this.playing
      ? '<path d="M5 3h4v14H5zm7 0h4v14h-4z" fill="currentColor"/>'
      : '<path d="m6 3 10 7-10 7V3Z" fill="currentColor"/>';
    this.button.disabled = !this.cases.length;
  }

  pause() {
    this.requestId++;
    this.playing = false;
    this.pending = false;
    this.videos.forEach((video) => video.pause());
    cancelAnimationFrame(this.frame);
    this.updateButton();
  }

  load() {
    this.videos.forEach((video) => {
      if (!video.getAttribute('src') || video.error) {
        video.src = video.dataset.src;
        video.load();
      }
      video.loop = true;
    });
  }

  async play() {
    this.pause();
    galleries.forEach((gallery) => { if (gallery !== this) gallery.pause(); });
    demo.pause();
    this.notify();
    const request = ++this.requestId;
    this.pending = true;
    this.updateButton();
    this.load();
    this.applySeek();
    try {
      await Promise.all(this.videos.map((video) => video.play()));
      if (request !== this.requestId) return;
      this.pending = false;
      this.playing = true;
      this.updateButton();
      this.sync();
    } catch {
      if (request !== this.requestId) return;
      this.pause();
      this.notify('Playback could not start. Please try Play again or choose another example.');
    }
  }

  updateTime(time) {
    this.root.querySelector('.play-time').textContent = `${timeLabel(time)} / ${timeLabel(this.cases[this.index].duration)}`;
    if (this.timeline) {
      this.timeline.value = String(time);
      this.timeline.setAttribute('aria-valuetext', `${time.toFixed(1)} of 60 seconds`);
    }
  }

  sync() {
    if (!this.playing) return;
    const time = this.primary.currentTime;
    this.seekTime = time;
    this.videos.forEach((video) => {
      if (video !== this.primary && video.readyState >= 2 && !video.seeking && Math.abs(video.currentTime - time) > 0.08) video.currentTime = time;
    });
    this.updateTime(time);
    this.frame = requestAnimationFrame(() => this.sync());
  }

  applySeek() {
    this.videos.forEach((video) => {
      if (video.readyState >= 1 && Number.isFinite(video.duration)) video.currentTime = Math.min(this.seekTime, video.duration - 0.05);
    });
  }

  seek(time) {
    this.seekTime = Math.max(0, Math.min(time, this.cases[this.index].duration - 0.05));
    this.load();
    this.applySeek();
    this.updateTime(this.seekTime);
  }

  setSplit(value) {
    const split = Math.max(0, Math.min(100, Number(value)));
    const mode = split === 0 ? 'proxy' : split === 100 ? 'generated' : 'compare';
    this.views.style.setProperty('--split', `${split}%`);
    this.views.dataset.mode = mode;
    this.range.value = String(split);
    this.range.setAttribute('aria-valuetext', `${Math.round(split)} percent generated, ${100 - Math.round(split)} percent 3D proxy`);
    this.modes.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    if (split > 0 && split < 100) this.previousSplit = split;
  }

  select(index) {
    this.pause();
    this.abort.abort();
    this.abort = new AbortController();
    this.notify();
    this.index = index;
    this.seekTime = 0;
    const item = this.cases[index];
    this.views.style.setProperty('--view-ratio', `${item.width / 2} / ${item.height}`);
    this.shell.dataset.caseId = item.id;
    this.videos.forEach((video) => {
      const generated = video.classList.contains('generated-video');
      video.removeAttribute('src');
      video.poster = generated ? item.poster : item.proxyPoster;
      video.dataset.src = generated ? item.generated : item.proxy;
      video.load();
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = Math.min(this.seekTime, video.duration - 0.05);
      }, { once: true, signal: this.abort.signal });
    });
    this.root.querySelector('.case-category').textContent = item.category;
    this.root.querySelector('.gallery-heading h3').textContent = item.title;
    this.root.querySelector('.gallery-caption').textContent = item.caption;
    const counter = this.root.querySelector('.case-counter');
    const total = document.createElement('span');
    total.textContent = `/ ${String(this.cases.length).padStart(2, '0')}`;
    counter.replaceChildren(document.createTextNode(`${String(index + 1).padStart(2, '0')} `), total);
    this.updateTime(0);
    this.selector.querySelectorAll('.case-button').forEach((button) => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.index) === index));
    });
  }

  renderSelector() {
    this.selector.replaceChildren();
    const start = this.page * this.pageSize;
    this.cases.slice(start, start + this.pageSize).forEach((item, offset) => {
      const index = start + offset;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'case-button';
      button.dataset.index = String(index);
      button.setAttribute('aria-label', `Show example ${index + 1}: ${item.title}`);
      button.setAttribute('aria-pressed', String(index === this.index));
      const thumbnail = document.createElement('img');
      thumbnail.src = item.thumbnail;
      thumbnail.alt = '';
      thumbnail.width = 400;
      thumbnail.height = 226;
      thumbnail.loading = 'lazy';
      const title = document.createElement('span');
      title.textContent = `${String(index + 1).padStart(2, '0')} · ${item.title}`;
      const description = document.createElement('small');
      description.textContent = `Case ${String(item.sourceIndex).padStart(2, '0')} · ${this.long ? '60 seconds' : '5 seconds'}`;
      button.append(thumbnail, title, description);
      button.addEventListener('click', () => this.select(index));
      this.selector.append(button);
    });
    if (!this.navigation) return;
    this.navigation.replaceChildren();
    const label = document.createElement('span');
    label.textContent = `${start + 1}–${Math.min(start + this.pageSize, this.cases.length)} of ${this.cases.length} examples`;
    this.navigation.append(label);
    for (let page = 0; page < Math.ceil(this.cases.length / this.pageSize); page++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${page * this.pageSize + 1}–${Math.min((page + 1) * this.pageSize, this.cases.length)}`;
      button.setAttribute('aria-label', `Show examples ${button.textContent}`);
      button.setAttribute('aria-current', page === this.page ? 'page' : 'false');
      button.addEventListener('click', () => {
        this.page = page;
        this.renderSelector();
        this.select(page * this.pageSize);
      });
      this.navigation.append(button);
    }
  }
}

demo.addEventListener('play', () => galleries.forEach((gallery) => gallery.pause()));
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
