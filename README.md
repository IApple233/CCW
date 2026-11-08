# CoCode-World

**Shared 3D Proxy Representation for Multi-Player World Models**

Project page: https://iapple233.github.io/CCW/

The page includes the complete demonstration, 24 short examples from the 0921 generalization evaluation at Step 5000, and 18 complete 60-second Long Event50 examples: six each of riding, interaction, and exploration. Each example supports synchronized player views and generated/proxy comparisons.

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

The GitHub Pages workflow validates, builds, and publishes changes pushed to `main`. Repository Settings → Pages should use **GitHub Actions** as the source. The workflow can also be run manually from the Actions tab.

## Editing

- `index.html`: publication title, abstract, and page sections.
- `assets/style.css`: responsive navy, ice blue, and coral theme.
- `assets/app.js`: synchronized playback, pagination, category selection, and comparison controls.
- `assets/gallery.json`: the 42 selected examples and media paths.
- `MEDIA.md`: media sources, checkpoint information, and encoding details.

Fonts are stored locally with their SIL Open Font License notices. The original repository's license is retained; external fonts and research media retain their respective rights and attribution.
