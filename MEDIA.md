# Media provenance

All demonstration and evaluation media was supplied by the CoCode-World project owner. The gallery follows the owner's selected case IDs and checkpoints in the supplied `case` list. `scripts/gallery-selection.json` preserves that order without private local paths.

## Demonstration

Source filename: `GameWorld_Demo_Motion_Rollback_FlashVSR_v2.mp4`.

The full 127-second demonstration is preserved, including audio and embedded GameWorld branding. The browser version is 1280×720 H.264/yuv420p at 24 fps with AAC audio and faststart. Its poster and social preview use the frame at 22 seconds.

## Generalization results

The 32 short examples appear in the owner's order:

| Source viewer | Checkpoint | Count | Duration |
| --- | --- | --- | --- |
| `actor-gta300-steps` | Step 2000 | 10 | 124 frames / 24 fps (5.167 seconds) |
| `actor-align78-steps` | Step 3000 | 19 | 124 frames / 24 fps (5.167 seconds) |
| `eval278-short-steps` | Step 3000 | 3 | 120 frames / 24 fps (5 seconds) |

The Short100 generated videos contain 120 frames. Their matching 124-frame proxy sources are limited to the same first 120 frames to keep playback aligned; no generated frames are discarded.

## Complete 60-second sequences

Source viewer: `action200-long`, checkpoint **Step 4000**. All 12 examples retain 1,440 frames at 24 fps, with six riding, five interaction, and one exploration sequence. Category buttons preserve the relative order of the owner's selection.

## Selected source IDs

### actor-gta300-steps · Step 2000

- `gta300_v1_011`
- `gta300_v1_016`
- `gta300_v1_018`
- `gta300_v1_020`
- `gta300_v1_030`
- `gta300_v1_031`
- `gta300_v1_033`
- `gta300_v1_034`
- `gta300_v1_036`
- `gta300_v1_044`

### actor-align78-steps · Step 3000

- `case_033_09182--dual--s00022--f000000--general`
- `case_047_0922--dual--s00001--f000000--general`
- `case_048_0922--dual--s00004--f000000--general`
- `case_052_0922--dual--s00008--f000000--general`
- `case_055_0922--dual--s00011--f000000--general`
- `case_059_0922--dual--s00052--f000000--general`
- `case_066_0923--dual--s00011--f000000--general`
- `case_072_0923--dual--s00094--f000000--general`
- `case_073_0923--dual--s00023--f000000--general`
- `case_075_ep3--dual--s00003--f000000--general`
- `case_097_0916--dual--s00039--f000000--general`
- `case_150_0922--dual--s00016--f000000--general`
- `case_156_0922--dual--s00025--f000000--general`
- `case_178_0923--dual--s00051--f000000--general`
- `case_177_0923--dual--s00035--f000000--general`
- `case_173_0923--dual--s00031--f000000--general`
- `case_170_0923--dual--s00028--f000000--general`
- `case_165_0923--dual--s00017--f000000--general`
- `case_164_0922--dual--s00088--f000000--general`

### eval278-short-steps · Step 3000

- `old_short--case_026_ep3--riding--t000008308`
- `old_short--case_027_ep4--riding--t000013144`
- `old_short--case_030_1008--riding--t000164796`

### action200-long · Step 4000

- `old_long--case_001_0917--riding--t000056296`
- `old_long--case_006_0916--riding--t000085560`
- `new_long--case_048_1008--exploration--t000183892`
- `new_long--case_038_1008--interaction--t000201624`
- `new_long--case_037_1008--interaction--t000187240`
- `new_long--case_034_1008--interaction--t000151652`
- `new_long--case_032_1007--interaction--t000118296`
- `new_long--case_025_1007--interaction--t000057536`
- `new_long--case_020_1009--riding--t000032860`
- `new_long--case_019_1009--riding--t000019964`
- `new_long--case_018_1009--riding--t000016740`
- `new_long--case_009_1008--riding--t000118048`

## Web encoding

Gallery videos are resized proportionally from 2560×720 to 1600×450. They use H.264/yuv420p, CRF 24, a 2000 kbit/s maximum video rate, faststart, and no audio. Posters use the frame at 2 seconds; thumbnails show Player A. The interface crops the two player halves into separate panels and synchronizes generated and proxy playback.

The abstract and reported metrics are taken from the supplied project brief. Author, paper, and code links are omitted until provided by the project owner.
