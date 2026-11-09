# CoCode-World

**Shared 3D Proxy Representation for Multi-Player World Models**

Project page: https://iapple233.github.io/CCW/

The page includes the complete demonstration and 44 examples selected by the project owner: 32 short generalization examples and 12 complete 60-second sequences. Every example supports synchronized player views and generated/proxy comparisons.

| Collection | Checkpoint | Examples |
| --- | --- | --- |
| Actor GTA300 | Step 2000 | 10 |
| Actor Align78 | Step 3000 | 19 |
| Eval278 / Short100 | Step 3000 | 3 |
| Action200 long sequences | Step 4000 | 12: 6 riding, 5 interaction, 1 exploration |

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

`dist/` contains the complete static website. All runtime asset paths are relative, so the site works under the `/CCW/` repository path. Videos load on demand.

## Publishing

The repository currently publishes GitHub Pages from `main` at `/`. The root contains the static page and `.nojekyll`, so pushing to `main` updates the site automatically. The workflow validates all selected cases and assets. It also supports deployment from `dist/` if the Pages source is changed to GitHub Actions.

## Editing

- `index.html`: publication title, abstract, and page sections.
- `assets/style.css`: responsive navy, ice blue, and coral theme.
- `assets/app.js`: synchronized playback, pagination, category selection, and comparison controls.
- `assets/gallery.json`: the 44 selected examples and media paths.
- `scripts/gallery-selection.json`: selected source IDs, exact order, checkpoints, and frame counts checked during validation.
- `MEDIA.md`: media sources, checkpoint information, and encoding details.

Fonts are stored locally with their SIL Open Font License notices. The original repository's license is retained; external fonts and research media retain their respective rights and attribution.
