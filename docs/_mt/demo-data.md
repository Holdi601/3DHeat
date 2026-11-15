---
title: "Data demo"
nav_order: 2
lang: "mt"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# Data demo: ipprova l-viewer f'ħames minuti

![Sħana ta' għaxar partiti ta' tanks fil-Demo Valley: dak li juri l-pass 4](../assets/img/en/heat-hero.webp)

Għadek ma għandekx data tiegħek? Ir-repożitorju jagħmel xi waħda. Kollox fih hu mħoloq: wied, bitħa, u partiti ta' tliet stili ta' logħba mħolqa b'plejers imsejħa *Blue 1* jew *Red 3*. Ir-ritratti kollha fuq dan is-sit ittieħdu bih.

## Agħmilha {#make-it}

```bash
node tools/demo-data.mjs
```

Dan jikteb f'`tools/.shots/demo/`:

| Fajl | X'inhu |
|---|---|
| `demo-valley.glb` | wied ta' 12 km b'żewġ għoljiet u raħal, bħala livell 3D |
| `demo-yard.glb` | bitħa mdawra b'ħajt ta' 160 m bil-bini, bħala livell 3D |
| `tanks.parquet` | 10 partiti ta' tanks, 8 kontra 8: movimenti, tiri, laqtiet bil-post fuq il-ġisem, nirien, qtil, wrecks, nixxiegħa tat-torri, rebbieħa |
| `tanks/match-NN.parquet` | l-istess partiti, kull wieħed f'fajl, għal [ħafna partiti f'daqqa](many-matches.md) |
| `air.parquet` | ġlieda ta' ajru 4 kontra 4 bil-missili, flares, qtil u tfixkil |
| `shooter.parquet` | 12-il rawnd ta' 5 kontra 5 fuq l-art: tiri, qtil, plant, kredits miksuba u mitlufa, ħwejjeġ tar-ras u utility |
| `mass/` | folder ta' partiti `.3dheat` żgħar, għal [analiżi tal-massa](mass-analysis.md) |
| sett ta' dawriet tat-tellieqa | żewġ dawriet ta' karozza waħda fuq kors mħolqa, għal [Analiżi tat-tellieqa](race-analysis.md) |

Kull tabella ssemmi l-kolonni tagħha fil-footer tagħha, għalhekk titħabbar mingħajr ebda immappjar.

## Ipprova {#try-it}

1. Ibda l-viewer (`start.bat` fuq Windows, jew `npm install` darba u mbagħad `npm run dev` fuq kwalunkwe sistema) u iftaħ `http://127.0.0.1:5273/`.
2. **Sfond / livell → Mudell 3D…** u agħżel `demo-valley.glb`.
3. **Sors → Fajls…** u agħżel `tanks.parquet`.
4. Agħfas `F` biex tiffrena d-data. Tara l-[sħana](heat.md) ta' għaxar partiti.
5. Ipprova l-bar tal-modalitajiet: **Differenza** (Blue kontra Red), **Sħana tat-tim**, **Linji**.
6. Iftaħ **Għarfien** (fis-sidebar tal-Heatmap): isib l-postijiet fejn ġie sparat, laqat u meqrud ħafna iktar minn postijiet oħra - madwar iż-żewġ għoljiet.
7. Iftaħ it-tab **Partita**; taħt **Partiti fir-replay** agħżel *Match 01*; agħfas **Ħaddem** fuq il-linja taż-żmien: il-[replay](match-replay.md).

![Replay ta' Match 01 b'tanks bħala figuri](../assets/img/en/replay-overview.webp)

Għall-shooter, tella' `demo-yard.glb` u `shooter.parquet`; għall-ġlieda tal-ajru, `air.parquet` (il-figuri jidhru aħjar fi **Daqs tal-figuri** 4, slider fil-pannell **Viewer tat-timijiet** tas-sidebar tal-Heatmap).

## Ir-ritratti {#the-screenshots}

Ir-ritratti tas-sit jinħolqu minn din id-data b'script, f'kwalunkwe lingwa tal-viewer:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

Is-server tar-ritratti jaħdem mingħajr pakkett lokali ta' figuri, għalhekk juri biss il-katalgu pubbliku tal-figuri. Ir-ritratti jmorru f'`docs/assets/img/<lang>/`. Ara [Iż-żamma tad-dokumentazzjoni](maintaining.md).
