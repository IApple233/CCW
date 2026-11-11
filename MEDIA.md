# Media provenance

All demonstration and evaluation media was supplied by the CoCode-World project owner. The current selection follows the November 11, 2026 replacement list. `scripts/gallery-selection.json` records the final order and checkpoints; `scripts/gallery-refresh-20261111.json` records original SHA-256 hashes, encoded SHA-256 hashes, decoded frame counts, and selection decisions. Private local source paths are not published.

## Demonstration

The complete 127-second `GameWorld_Demo_Motion_Rollback_FlashVSR_v2.mp4` is preserved, including audio and embedded GameWorld branding. The browser version is 1280×720 H.264/yuv420p at 24 fps with AAC audio and faststart.

## Short gallery

33 cases, divided into 15 and 18: five and six complete three-column desktop rows. All six newly supplied cases use exactly the first 124 frames, starting at frame zero, for both generated and proxy streams. The 30-second GTA300 Prompt v2 output is trimmed to 124 frames; its longer original proxy is trimmed to the same frame interval. Existing Eval278 examples retain their complete 120 frames, without repeating or inventing frames.

| Source viewer | Checkpoint | Count | Frames |
| --- | --- | --- | --- |
| `actor-gta300-steps` | 2000 | 6 | 124 |
| `gta556-dmd-step4000` | 4000 | 2 | 124 |
| `action200-short` | 2000 | 3 | 124 |
| `actor-align78-steps` | 3000 | 18 | 124 |
| `actorcons-gta300-promptv2-long30s` | 2500 | 1 | 124 |
| `eval278-short-steps` | 3000 | 3 | 120 |

The five explicitly rejected short cases are excluded. The sixth preferred replacement displaces `Along the coast`; that average case is retained once at the end as a temporary filler to complete the final row. The two GTA556 cases use Seed0 because the supplied list did not specify a seed.

## Long gallery

18 complete 60-second sequences, each with 1,440 frames at 24 fps. `A quiet rest` is first and `Ride through the city` second. The source checkpoints are preserved case by case, including the three newly requested Step2000 sequences.

All eight supplied long case/checkpoint entries are used directly, per the owner clarification. Page 20 cases 82 and 87 (Step4000) are freshly imported from their specified original videos and replace their former entries. `Road at dusk` and `Under the bridge` are retained at the end as temporary fillers, completing six desktop rows of three.

## Web encoding

Generated and proxy videos are encoded from hash-verified original 2560×720 files, proportionally resized to 1600×450, at their original 24 fps. Encoding uses H.264/yuv420p, CRF 24, a 2000 kbit/s maximum video rate, faststart, and no audio. Frame trimming uses `trim=start_frame=0:end_frame=124,setpts=PTS-STARTPTS` for new short cases and an end frame of 1440 for long cases. Both player halves remain in the same source canvas. Posters use frame time 2 seconds; thumbnails show Player A. The website displays synchronized player views and generated/proxy comparisons.

## Final selected cases

| Collection | Title | Source case | Checkpoint / variant | Frames |
| --- | --- | --- | --- | --- |
| short | Coastal drive | `gta300_v1_011` | 2000 | 124 |
| short | Across the pool | `gta300_v1_016` | 2000 | 124 |
| short | By the red car | `gta300_v1_018` | 2000 | 124 |
| short | At the roadside | `gta300_v1_020` | 2000 | 124 |
| short | Along the cove | `gta300_v1_030` | 2000 | 124 |
| short | Across the rooftops | `case_102_0916--dual--s00062--f000000--general` | 4000 / seed0 | 124 |
| short | Airfield sparring | `case_160_0922--dual--s00031--f000000--general` | 4000 / seed0 | 124 |
| short | Harbor sparring | `old_short--case_015_09182--interaction--t000064108` | 2000 / step-002000 | 124 |
| short | On the floating dock | `new_short--case_005_1007--interaction--t000058528` | 2000 / step-002000 | 124 |
| short | Evening encounter | `gta300_v1_044` | 2000 | 124 |
| short | Garden at dusk | `case_033_09182--dual--s00022--f000000--general` | 3000 | 124 |
| short | After-dark sparring | `new_short--case_011_1007--interaction--t000113336` | 2000 / step-002000 | 124 |
| short | Near the truck | `case_048_0922--dual--s00004--f000000--general` | 3000 | 124 |
| short | Across dry ground | `case_052_0922--dual--s00008--f000000--general` | 3000 | 124 |
| short | Country crossing | `case_055_0922--dual--s00011--f000000--general` | 3000 | 124 |
| short | By the fountain | `case_059_0922--dual--s00052--f000000--general` | 3000 | 124 |
| short | Courtyard stop | `case_066_0923--dual--s00011--f000000--general` | 3000 | 124 |
| short | Night street encounter | `gta300_v1_057` | 2500 / promptv2 | 124 |
| short | Past the storefront | `case_073_0923--dual--s00023--f000000--general` | 3000 | 124 |
| short | Across the plaza | `case_075_ep3--dual--s00003--f000000--general` | 3000 | 124 |
| short | Lantern-lit walk | `case_097_0916--dual--s00039--f000000--general` | 3000 | 124 |
| short | At the decorated car | `case_150_0922--dual--s00016--f000000--general` | 3000 | 124 |
| short | Through the snow | `case_156_0922--dual--s00025--f000000--general` | 3000 | 124 |
| short | City lights | `case_178_0923--dual--s00051--f000000--general` | 3000 | 124 |
| short | Neon plaza | `case_177_0923--dual--s00035--f000000--general` | 3000 | 124 |
| short | Along the tracks | `case_173_0923--dual--s00031--f000000--general` | 3000 | 124 |
| short | By the courtyard pool | `case_170_0923--dual--s00028--f000000--general` | 3000 | 124 |
| short | Through the pit lane | `case_165_0923--dual--s00017--f000000--general` | 3000 | 124 |
| short | At the red racer | `case_164_0922--dual--s00088--f000000--general` | 3000 | 124 |
| short | Country road | `old_short--case_026_ep3--riding--t000008308` | 3000 | 120 |
| short | White convertible | `old_short--case_027_ep4--riding--t000013144` | 3000 | 120 |
| short | Market turn | `old_short--case_030_1008--riding--t000164796` | 3000 | 120 |
| short | Along the coast | `case_072_0923--dual--s00094--f000000--general` | 3000 | 124 |
| long | A quiet rest | `new_long--case_034_1008--interaction--t000151652` | 4000 | 1440 |
| long | Ride through the city | `old_long--case_001_0917--riding--t000056296` | 4000 | 1440 |
| long | Across the desert | `old_long--case_006_0916--riding--t000085560` | 4000 | 1440 |
| long | Village stop | `new_long--case_048_1008--exploration--t000183892` | 4000 | 1440 |
| long | Moonlit meeting | `new_long--case_038_1008--interaction--t000201624` | 4000 | 1440 |
| long | Blue water tanks | `new_long--case_037_1008--interaction--t000187240` | 4000 / step-004000 | 1440 |
| long | Through the neighborhood | `old_long--case_043_0922--exploration--t000101804` | 2000 / step-002000 | 1440 |
| long | Seaside pier | `new_long--case_025_1007--interaction--t000057536` | 4000 | 1440 |
| long | Along the water | `new_long--case_020_1009--riding--t000032860` | 4000 | 1440 |
| long | Sunset road trip | `new_long--case_014_1008--riding--t000181660` | 2000 / step-002000 | 1440 |
| long | Hillside drive | `new_long--case_018_1009--riding--t000016740` | 4000 | 1440 |
| long | Blue-and-gold square | `old_long--case_048_0917--exploration--t000039060` | 2000 / step-002000 | 1440 |
| long | Beyond the garden fence | `new_long--case_021_1006--interaction--t000016120` | 4000 / step-004000 | 1440 |
| long | Beside the hillside home | `new_long--case_023_1007--interaction--t000039060` | 4000 / step-004000 | 1440 |
| long | Across the field | `new_long--case_032_1007--interaction--t000118296` | 4000 / step-004000 | 1440 |
| long | From beach to boulevard | `new_long--case_044_1007--exploration--t000091760` | 4000 / step-004000 | 1440 |
| long | Road at dusk | `new_long--case_009_1008--riding--t000118048` | 4000 | 1440 |
| long | Under the bridge | `new_long--case_019_1009--riding--t000019964` | 4000 | 1440 |
