---
title: Demo data
nav_order: 2
---

# Demo data: try the viewer in five minutes

![Heat of ten tank matches in the demo valley: what step 4 shows](assets/img/en/heat-hero.webp)

No data of your own yet? The repository makes some. Everything in it is invented: a valley, a yard, and matches of three made-up game styles with players called *Blue 1* or *Red 3*. The pictures on this site were all taken with it.

## Make it

```bash
node tools/demo-data.mjs
```

This writes into `tools/.shots/demo/`:

| File | What it is |
|---|---|
| `demo-valley.glb` | a 12 km valley with two hills and a village, as a 3D level |
| `demo-yard.glb` | a 160 m walled yard with buildings, as a 3D level |
| `tanks.parquet` | 10 tank matches, 8 against 8: movement, shots, hits with the place on the hull, fires, kills, wrecks, turret aim, winners |
| `tanks/match-NN.parquet` | the same matches, one file each, for [many matches at once](many-matches.md) |
| `air.parquet` | a 4 against 4 air fight with missiles, flares, kills and misses |
| `shooter.parquet` | 12 rounds of 5 against 5 on foot: shots, kills, a plant, credits earned and spent, helmets and utility |
| `mass/` | a folder of small `.3dheat` matches, for [mass analysis](mass-analysis.md) |
| a race lap set | two laps of one car on a made-up course, for [Race analysis](race-analysis.md) |

Each table names its own columns in its footer, so it loads without any mapping.

## Try it

1. Start the viewer (`start.bat` on Windows, or `npm install` once and then `npm run dev` on any system) and open `http://127.0.0.1:5273/`.
2. **Map and background → 3D model…** and pick `demo-valley.glb`.
3. **Source → Files…** and pick `tanks.parquet`.
4. Press `F` to frame the data. You see the [heat](heat.md) of ten matches.
5. Try the mode bar: **Difference** (Blue against Red), **Team heat**, **Lines**.
6. Open **Insights** (in the Heatmap sidebar): it finds the places where far more was fired, hit and destroyed than elsewhere - around the two hills.
7. Open the **Match** tab; under **Matches in the replay** choose *Match 01*; press **Play** on the timeline: the [replay](match-replay.md).

![A replay of Match 01 with tanks as figures](assets/img/en/replay-overview.webp)

For the shooter, load `demo-yard.glb` and `shooter.parquet`; for the air fight, `air.parquet` (the figures are easier to see at **Figure size** 4, a slider in the **Team viewer** panel of the Heatmap sidebar).

## The screenshots

The site's pictures are made from this data by a script, in any of the viewer's languages:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

The screenshot server runs without a local figure pack, so only the public figure catalogue is shown. Pictures go to `docs/assets/img/<lang>/`. See [Maintaining the docs](maintaining.md).
