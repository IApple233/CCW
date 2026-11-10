# CoCode-World

**Shared 3D Proxy Representation for Multi-Player World Models**

Project page: https://iapple233.github.io/CCW/

The page includes the complete demonstration, 32 short generalization examples from the current Actor GTA300, Actor Align78, and Eval278 selections, and 12 complete 60-second Action200 sequences: six riding, five interaction, and one exploration. Each example supports synchronized player views and generated/proxy comparisons.

## Local preview

Node.js 18 or later is required. There are no package dependencies to install.

```sh
npm run dev
```

Open http://localhost:4173. Use `npm run dev -- --port 8080` to choose another port. The local server supports byte-range requests for video seeking.

## Check and build

```sh
npm run check
npm run build
```

`dist/` contains the complete static website. All runtime asset paths are relative, so the site works under the `/CCW/` repository path. Videos load only when an example is selected. Selecting a case starts both player views together; the comparison slider reveals the 3D proxy over the generated view. The service worker caches 1 MiB video chunks (up to 160 chunks, about 160 MiB), shares requests across both player views, and reuses completed chunks when revisiting a video. It does not prefetch the gallery. Cached chunks are versioned by media content; browsers may evict them. Persistent caching requires HTTPS or localhost; other origins retain native on-demand playback.

## Publishing

The GitHub Pages workflow validates and builds changes pushed to `main`. It reads the repository's current Pages source: with **GitHub Actions**, it uploads and deploys `dist/`; with **Deploy from a branch**, GitHub's Pages build publishes the configured branch and folder. The repository root contains the complete static site, including `.nojekyll`. The validation workflow can also be run manually from the Actions tab.

## Editing

- `index.html`: publication title, abstract, and page sections.
- `assets/style.css`: responsive blue-black and cornflower theme, with light results and research sections.
- `assets/taste/`: scoped, unmodified Taste Skill navigation, motion, and research-heading runtime.
- `assets/app.js`: synchronized playback, short-result pagination, and generated/proxy comparison.
- `assets/gallery.json`: the current 44 selected examples, short event captions, and media paths.
- `service-worker.js`: on-demand video range caching.
- `assets/media-sizes.json`: byte lengths and content revisions used for range responses; regenerate with `node scripts/media-manifest.mjs` after changing video files.
- `MEDIA.md`: media sources, checkpoint information, and encoding details.

Fonts are stored locally with their SIL Open Font License notices. The original repository's license is retained; external fonts and research media retain their respective rights and attribution.

## Page design

The layout uses [Taste Skill 2.5.1](https://github.com/Leonxlnx/taste-skill) (source revision `f6b76575f949707b4e3c37cd86cb44b0b98643e8`), with locally hosted Gabarito, Figtree, and DM Mono fonts. A large project title leads into the original demo, followed by contrasting results, longer-scene, and research sections. Motion is limited to the hero entrance, hover feedback, and the research heading, with reduced-motion support.

The short-results gallery uses 12 examples per page: six columns and two rows on desktop, with three pages for the current 32-case upstream selection and fewer columns on narrow screens. All 12 longer scenes share one six-column desktop gallery. Event titles and one-sentence captions remain visible; selecting a case loads and plays only that case. Each selection starts with the complete generated view and the slider at its left (Generated) endpoint; moving right reveals the 3D proxy. The galleries have no separate play/pause buttons, timeline, or mode switches.

The checked-in build command writes to `dist/` by default. Set `CCW_BUILD_DIR` to an absolute path outside the repository to build elsewhere without replacing the existing `dist/` directory.
