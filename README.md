# CoCode-World

**Shared 3D Proxy Representation for Multi-Player World Models**

Project page: https://iapple233.github.io/CCW/

The page includes the complete demonstration, 33 short generalization examples from the curated Actor GTA300, Actor Align78, Eval278, GTA556, Action200, and Actor-consistency selections, and 18 complete 60-second Action200 sequences. Each example supports synchronized player views and generated/proxy comparisons.

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

`dist/` contains the complete static website. All runtime asset paths are relative, so the site works under the `/CCW/` repository path. The cover randomly selects six existing short clips for its muted, slanted video wall and preserves each clip's original wide ratio; gallery videos still load only when an example is selected. Selecting a case starts both player views together; the comparison slider reveals the 3D proxy over the generated view. The service worker caches 1 MiB video chunks (up to 160 chunks, about 160 MiB), shares requests across both player views, and reuses completed chunks when revisiting a video. Cached chunks are versioned by media content; browsers may evict them. Persistent caching requires HTTPS or localhost; other origins retain native on-demand playback.

## Publishing

The GitHub Pages workflow validates and builds changes pushed to `main`. It reads the repository's current Pages source: with **GitHub Actions**, it uploads and deploys `dist/`; with **Deploy from a branch**, GitHub's Pages build publishes the configured branch and folder. The repository root contains the complete static site, including `.nojekyll`. The validation workflow can also be run manually from the Actions tab.

## Editing

- `index.html`: publication title and the cover, demo, short-gallery, and long-gallery sections.
- `assets/style.css`: responsive dark green-black, cream, and gold theme with individual case layouts.
- `assets/taste/`: scoped, unmodified Taste Skill navigation, motion, and research-heading runtime.
- `assets/app.js`: on-demand playback for individual cases and synchronized generated/proxy comparison.
- `assets/gallery-layout.js`: divides short galleries into two pages of complete three-column rows.
- `scripts/gallery-refresh-20261111.json`: source hashes, decoded frame counts, replacement decisions, and the temporary row filler.
- `assets/gallery.json`: the current 51 selected examples, short event captions, and media paths.
- `service-worker.js`: on-demand video range caching.
- `assets/media-sizes.json`: byte lengths and content revisions used for range responses; regenerate with `node scripts/media-manifest.mjs` after changing video files.
- `MEDIA.md`: media sources, checkpoint information, and encoding details.

Fonts are stored locally with their SIL Open Font License notices. The original repository's license is retained; external fonts and research media retain their respective rights and attribution.

## Page design

The cover and typography take direction from [UniWorld](https://zephipage.github.io/UniWorld/), while keeping CoCode-World's existing gameplay stills, demo, and case selections. The page uses a large Mulish title, an italic serif paper title, a dark cover with a slanted original-ratio video wall, and an 88%-width content area. The page contains the cover, original demo, 33 short cases, and 18 long cases; it adds no abstract or feature sections. Motion is limited to the hero entrance, hover feedback, the cover video wall, and the long-gallery heading, with reduced-motion support.

Both galleries show each case directly in a three-column desktop grid, with two columns on narrower screens and one on mobile. The 33 short cases are split into pages of 15 and 18 (five and six complete desktop rows); the 18 longer scenes remain one page with six rows. Page sizes are calculated in complete rows, so 39 short cases would divide into 18 and 21. Each case has its own in-place play control; selecting it loads only that case and starts both player views together. Event titles and one-sentence captions remain visible. Each selection starts with the complete generated view and the slider at its left (Generated) endpoint; moving right reveals the 3D proxy. There is no shared player, thumbnail selector, playback timeline, or mode switch.

The checked-in build command writes to `dist/` by default. Set `CCW_BUILD_DIR` to an absolute path outside the repository to build elsewhere without replacing the existing `dist/` directory.

The November 11 selection removes the five rejected short cases and replaces the rejected and average long cases. All six new short examples contain the first 124 frames of both generated and proxy streams. `Along the coast` is a temporary row filler. The long gallery starts with `A quiet rest` and `Ride through the city`. Page 27 uses Seed0 where no seed was specified; all supplied case/checkpoint entries are used directly. The two average long cases remain at the end as temporary row fillers.
