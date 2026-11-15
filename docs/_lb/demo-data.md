---
title: "Demo-Daten"
nav_order: 2
lang: "lb"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# Demo-Daten: probéiert den Viewer a fënnef Minutten

![Hëtzt vun zéng Panzermatcher am Demo-Tal: wat Schrëtt 4 weist](../assets/img/en/heat-hero.webp)

Nach keng eege Daten? Dat Repository mécht der. Alles dodriwwer ass erfonnt: en Tal, en Hof, an Matcher vun dräi erfonnte Spillstiler mat Spiller, déi *Blue 1* oder *Red 3* heeschen. D'Biller op dëser Säit goufen alleguer domat gemaach.

## Maacht se {#make-it}

```bash
node tools/demo-data.mjs
```

Dat schreift an `tools/.shots/demo/`:

| Datei | Wat et ass |
|---|---|
| `demo-valley.glb` | en 12-km-Tal mat zwee Hiwwelen an engem Duerf, als 3D-Level |
| `demo-yard.glb` | en 160-m-Hof mat Mauer a Gebaier, als 3D-Level |
| `tanks.parquet` | 10 Panzermatcher, 8 géint 8: Bewegung, Schëss, Treffer mat der Plaz um Rumpf, Brand, Ofschoss, Wracken, Tuermzil, Gewënner |
| `tanks/match-NN.parquet` | déi selwecht Matcher, all Datei fir sech, fir [vill Matcher op eemol](many-matches.md) |
| `air.parquet` | e Loftkampf 4 géint 4 mat Raketen, Fackelen, Ofschoss an Fehlschëss |
| `shooter.parquet` | 12 Ronnen 5 géint 5 zu Fouss: Schëss, Ofschoss, eng Bomm gesat, Crédits verdéngt a ausginn, Helmer a Utility |
| `mass/` | en Dossier mat klenge `.3dheat`-Matcher, fir [Massenanalys](mass-analysis.md) |
| en Ronnesaz | zwou Ronnen vun engem Auto op engem erfonnte Kurs, fir [Course-Analys](race-analysis.md) |

All Tabell nennt hir eegen Kolonnen an hirer Fousszeil, sou datt se ouni Zouweisung lued.

## Probéiert et {#try-it}

1. Startet den Viewer (`start.bat` op Windows, oder `npm install` eemol a dann `npm run dev` op all System) a maacht `http://127.0.0.1:5273/` op.
2. **Hannergrond / Level → 3D-Modell…** a wielt `demo-valley.glb`.
3. **Quell → Fichieren…** a wielt `tanks.parquet`.
4. Drëckt `F`, fir d'Daten ze riichten. Dir gesitt d'[Hëtzt](heat.md) vun zéng Matcher.
5. Probéiert d'Modus-Leescht: **Ënnerscheed** (Blue géint Red), **Equipen-Heat**, **Linnen**.
6. Maacht **Erkenntnisser** op (an der Heatmap-Säitelleescht): et fënnt d'Plazen, wou vill méi geschoss, getraff a zerstéiert gouf wéi anzwousch - ronderëm déi zwee Hiwwelen.
7. Maacht den **Match**-Tab op; ënner **Matcher am Replay** wielt *Match 01*; drëckt **Ofspillen** op der Zäitlinn: de [Replay](match-replay.md).

![E Replay vu Match 01 mat Panzer als Figuren](../assets/img/en/replay-overview.webp)

Fir de Schéisser lued `demo-yard.glb` an `shooter.parquet`; fir de Loftkampf `air.parquet` (d'Figuren sinn bei **Figurengréisst** 4 méi liicht ze gesinn, en Schieber am Panel **Equipenusiicht** an der Heatmap-Säitelleescht).

## D'Screenshoten {#the-screenshots}

D'Biller vun der Websäit ginn aus dësen Daten vun engem Skript gemaach, a jeder vun den Sproochen vum Viewer:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

De Screenshot-Server leeft ouni lokal Figurepak, sou datt nëmmen den ëffentlechen Figurekatalog gewise gëtt. Biller ginn an `docs/assets/img/<lang>/`. Kuckt [D'Dokumentatioun pflegen](maintaining.md).
