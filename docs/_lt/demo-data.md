---
title: "Demonstraciniai duomenys"
nav_order: 2
lang: "lt"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

![Dešimties tankų rungtynių šiluma demonstraciniame Demo Valley lygyje: ką rodo 4 žingsnis](../assets/img/en/heat-hero.webp)

Dar neturite savo duomenų? Saugykla juos sukuria. Viskas juose išgalvota: slėnis, kiemas ir trijų išgalvotų žaidimų stilių rungtynės, kuriose žaidėjai vadinasi *Blue 1* arba *Red 3*. Visi šios svetainės paveikslėliai padaryti su jais.

## Sukurkite juos {#make-it}

```bash
node tools/demo-data.mjs
```

Tai įrašo į `tools/.shots/demo/`:

| Failas | Kas tai |
|---|---|
| `demo-valley.glb` | 12 km ilgio slėnis su dviem kalvomis ir kaimu, kaip 3D lygis |
| `demo-yard.glb` | 160 m kiemas su siena ir pastatais, kaip 3D lygis |
| `tanks.parquet` | 10 tankų rungtynių, 8 prieš 8: judėjimas, šūviai, pataikymai su vieta korpuse, gaisrai, nužudymai, griuvėsiai, bokštų nukreipimas, nugalėtojai |
| `tanks/match-NN.parquet` | tos pačios rungtynės, kiekvienos atskirame faile, [daug rungtynių vienu metu](many-matches.md) |
| `air.parquet` | 4 prieš 4 oro mūšis su raketomis, šviesos signalais, nužudymais ir praleidimais |
| `shooter.parquet` | 12 raundų po 5 prieš 5 pėsčiomis: šūviai, nužudymai, bombos padėjimas, uždirbti ir išleisti kreditai, šalmai ir priemonės |
| `mass/` | aplankas su mažomis `.3dheat` rungtynėmis, [masinei analizei](mass-analysis.md) |
| ratų rinkinys | du vienos mašinos ratai išgalvotoje trasoje, [Lenktynių analizei](race-analysis.md) |

Kiekviena lentelė savo stulpelius nurodo apatinėje dalyje, todėl ji įkeliama be jokio priskyrimo.

## Išbandykite {#try-it}

1. Paleiskite peržiūros programą (Windows sistemoje `start.bat`, arba bet kurioje sistemoje vieną kartą `npm install`, tada `npm run dev`) ir atidarykite `http://127.0.0.1:5273/`.
2. **Fonas / lygis → 3D modelis…** ir pasirinkite `demo-valley.glb`.
3. **Šaltinis → Failai…** ir pasirinkite `tanks.parquet`.
4. Paspauskite `F`, kad įrėmintumėte duomenis. Matote dešimties rungtynių [šilumą](heat.md).
5. Išbandykite režimų juostą: **Skirtumas** (Blue prieš Red), **Komandų šiluma**, **Linijos**.
6. Atidarykite **Įžvalgos** (Šilumos žemėlapio šoninėje juostoje): jos ras vietas, kur buvo šaudoma, pataikoma ir naikinama daug daugiau nei kitur – aplink dvi kalvas.
7. Atidarykite skirtuką **Rungtynės**; skiltyje **Rungtynės pakartojime** pasirinkite *Match 01* ir laiko juostoje paspauskite **Groti**: [pakartojimas](match-replay.md).

![Match 01 pakartojimas, kuriame tankai rodomi kaip figūros](../assets/img/en/replay-overview.webp)

Šaulio duomenims įkelkite `demo-yard.glb` ir `shooter.parquet`; oro mūšiui – `air.parquet` (figūras lengviau matyti, kai **Figūrų dydis** yra 4; tai slankiklis **Komandų peržiūra** skydelyje Šilumos žemėlapio šoninėje juostoje).

## Ekrano nuotraukos {#the-screenshots}

Svetainės paveikslėlius iš šių duomenų daro scenarijus, bet kuria peržiūros programos kalba:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

Ekrano nuotraukų serveris veikia be vietinio figūrų paketo, todėl rodomas tik viešasis figūrų katalogas. Paveikslėliai eina į `docs/assets/img/<lang>/`. Žr. [Dokumentacijos priežiūra](maintaining.md).
