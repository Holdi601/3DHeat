---
title: "Demodata"
nav_order: 2
lang: "da"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# Demodata: prøv vieweren på fem minutter

![Varme fra ti stridsvognskampe i Demo Valley: det trin 4 viser](../assets/img/en/heat-hero.webp)

Har du ingen data af egen hånd endnu? Repositoriet laver nogle. Alt i det er opdigtet: en dal (Demo Valley), en gård (Demo Yard) og kampe i tre opdigtede spilstile med spillere, der hedder *Blue 1* eller *Red 3*. Billederne på dette websted er alle taget med dem.

## Lav dem {#make-it}

```bash
node tools/demo-data.mjs
```

Dette skriver til `tools/.shots/demo/`:

| Fil | Hvad den er |
|---|---|
| `demo-valley.glb` | en 12 km lang dal med to bakker og en landsby, som 3D-bane |
| `demo-yard.glb` | en 160 m stor muret gård med bygninger, som 3D-bane |
| `tanks.parquet` | 10 stridsvognskampe, 8 mod 8: bevægelse, skud, træffere med stedet på skroget, brande, drab, vrag, tårnsigte, vindere |
| `tanks/match-NN.parquet` | de samme kampe, én fil hver, til [mange kampe på én gang](many-matches.md) |
| `air.parquet` | en luftkamp 4 mod 4 med missiler, flares, drab og missede skud |
| `shooter.parquet` | 12 runder med 5 mod 5 til fods: skud, drab, en plantning, optjente og brugte credits, hjelme og hjælpemidler |
| `mass/` | en mappe med små `.3dheat`-kampe til [massanalyse](mass-analysis.md) |
| et sæt banaomgange | to omgange med én bil på en opdigtet bane, til [Løbsanalyse](race-analysis.md) |

Hver tabel angiver sine egne kolonner i sin fod, så den indlæses uden nogen tilknytning.

## Prøv det {#try-it}

1. Start vieweren (`start.bat` på Windows, eller `npm install` én gang og derefter `npm run dev` på ethvert system) og åbn `http://127.0.0.1:5273/`.
2. **Baggrund / bane → 3D-model …** og vælg `demo-valley.glb`.
3. **Kilde → Filer …** og vælg `tanks.parquet`.
4. Tryk `F` for at indramme dataene. Du ser [varmen](heat.md) fra ti kampe.
5. Prøv tilstandslinjen: **Forskel** (Blue mod Red), **Holdvarme** og **Linjer**.
6. Åbn **Indsigter** (i Heatmap-sidebjælken): den finder de steder, hvor langt mere blev skudt, ramt og ødelagt end andre steder – omkring de to bakker.
7. Åbn fanen **Kamp**; under **Kampe i replayet** vælg *Match 01*, og tryk på **Afspil** på tidslinjen: [replayet](match-replay.md).

![Et replay af Match 01 med stridsvogne som figurer](../assets/img/en/replay-overview.webp)

Til skytten indlæser du `demo-yard.glb` og `shooter.parquet`; til luftkampen `air.parquet` (figurerne er lettere at se ved **Figurstørrelse** 4, en skyder i panelet **Holdvisning** i Heatmap-sidebjælken).

## Skærmbillederne {#the-screenshots}

Billederne på webstedet laves ud fra disse data af et script, på ethvert af vieweren sprog:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

Skærmbilledserveren kører uden en lokal figurpakke, så kun den offentlige figurkatalog vises. Billederne gemmes i `docs/assets/img/<lang>/`. Se [Vedligeholdelse af dokumentationen](maintaining.md).
