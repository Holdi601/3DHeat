---
title: "Demodata"
nav_order: 2
lang: "sv"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# Demodata: prova visaren på fem minuter

![Värme från tio stridsvagnsmatcher i demo valley: vad steg 4 visar](../assets/img/en/heat-hero.webp)

Inga egna data än? Förrådet skapar några. Allt i det är påhittat: en dal, en gård och matcher i tre påhittade spelstilar, med spelare som heter *Blue 1* eller *Red 3*. Bilderna på den här webbplatsen togs alla med dem.

## Skapa dem {#make-it}

```bash
node tools/demo-data.mjs
```

Det här skriver till `tools/.shots/demo/`:

| Fil | Vad den är |
|---|---|
| `demo-valley.glb` | en 12 km lång dal med två kullar och en by, som en 3D-bana |
| `demo-yard.glb` | en 160 m stor muromgärdad gård med byggnader, som en 3D-bana |
| `tanks.parquet` | 10 stridsvagnsmatcher, 8 mot 8: rörelse, skott, träffar med platsen på skrovet, bränder, dödningar, vrak, tornsikte, vinnare |
| `tanks/match-NN.parquet` | samma matcher, en fil var, för [många matcher samtidigt](many-matches.md) |
| `air.parquet` | en luftstrid 4 mot 4 med robotar, facklor, dödningar och missar |
| `shooter.parquet` | 12 ronder med 5 mot 5 till fots: skott, dödningar, en planterad bomb, intjänade och använda krediter, hjälmar och utrustning |
| `mass/` | en mapp med små `.3dheat`-matcher, för [massanalys](mass-analysis.md) |
| en uppsättning varvfiler | två varv med en bil på en påhittad bana, för [Racinganalys](race-analysis.md) |

Varje tabell anger sina egna kolumner i sin fot, så den läses in utan någon mappning.

## Prova den {#try-it}

1. Starta visaren (`start.bat` på Windows, eller `npm install` en gång och sedan `npm run dev` på valfritt system) och öppna `http://127.0.0.1:5273/`.
2. **Bakgrund / nivå → 3D-modell…** och välj `demo-valley.glb`.
3. **Källa → Filer…** och välj `tanks.parquet`.
4. Tryck `F` för att rama in datan. Du ser [värmen](heat.md) från tio matcher.
5. Prova lägesfältet: **Differens** (Blue mot Red), **Lagvärme**, **Linjer**.
6. Öppna **Insikter** (i sidofältet för Värmekarta): den hittar platserna där långt fler skott avlossades, träffar gjordes och förstörelser skedde än på andra ställen – runt de två kullarna.
7. Öppna fliken **Match**; under **Matcher i reprisen** välj *Match 01*; tryck **Spela** på tidslinjen: [repriserna](match-replay.md).

![En repris av Match 01 med stridsvagnar som figurer](../assets/img/en/replay-overview.webp)

För skyttespelet läser du in `demo-yard.glb` och `shooter.parquet`; för luftstriden `air.parquet` (figurerna syns bättre vid **Figurstorlek** 4, ett reglage i panelen **Lagvisare** i sidofältet för Värmekarta).

## Skärmbilderna {#the-screenshots}

Webbplatsens bilder görs från de här data med ett skript, på vilket språk som helst av visarens språk:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

Skärmbildsservern körs utan lokalt figurpaket, så bara den publika figurkatalogen visas. Bilderna går till `docs/assets/img/<lang>/`. Se [Underhålla dokumentationen](maintaining.md).
