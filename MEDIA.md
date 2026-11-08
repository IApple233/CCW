# Media provenance

All demonstration and evaluation media was supplied by the CoCode-World project owner. The site contains browser-compatible derivatives of the source videos.

## Demonstration

Source filename: `GameWorld_Demo_Motion_Rollback_FlashVSR_v2.mp4`.

The full 127-second demonstration is preserved, including audio and embedded GameWorld branding. The browser version is 1280×720 H.264/yuv420p at 24 fps with AAC audio and faststart. Its poster and social preview use the frame at 22 seconds.

## 0921 generalization

Source suite: `generalization_0921_30`, checkpoint **Step 5000**.

Twenty-four selected source viewer indices: **1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 27, 28, 29, 30**.

Each generated/proxy pair retains the full 124-frame sequence at 24 fps (5.167 seconds) and its 1664×480 side-by-side layout. The full original sample ID and checkpoint are recorded in `assets/gallery.json`.

## Long Event50

Source suite: `long_event50/viewer_60s`, checkpoint **Step 2000**.

| Category | Source case indices | Duration per example |
| --- | --- | --- |
| Riding / 骑乘 | 1, 2, 6, 9, 13, 14 | 60 seconds |
| Interaction / 交互 | 22, 27, 30, 32, 33, 38 | 60 seconds |
| Exploration / 探索 | 41, 42, 43, 44, 46, 48 | 60 seconds |

All eighteen examples preserve the complete 1,440-frame sequence at 24 fps. Their paired generated/proxy videos are resized proportionally from 2560×720 to 1600×450.

## Web encoding

Gallery videos use H.264/yuv420p, CRF 24, a 2000 kbit/s maximum video rate, faststart, and no audio. Posters use the frame at 2 seconds; thumbnails show Player A. The interface uses the source aspect ratio, crops the two player halves into separate panels, and synchronizes generated and proxy playback.

The abstract and reported metrics are taken from the supplied project brief. Author, paper, and code links are omitted until provided by the project owner.
