---
title: "Demodata"
nav_order: 2
lang: "no"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# Demodata: prøv visningsprogrammet på fem minutter

![Varme fra ti stridsvognkamper i demo-dalen: det steg 4 viser](../assets/img/en/heat-hero.webp)

Har du ingen egne data ennå? Repositoriet lager noen. Alt i det er oppdiktet: en dal, en gård, og kamper av tre oppdiktede spillstiler med spillere som heter *Blue 1* eller *Red 3*. Bildene på denne siden er alle tatt med dem.

## Lag dem {#make-it}

```bash
node tools/demo-data.mjs
```

Dette skriver til `tools/.shots/demo/`:

| Fil | Hva den er |
|---|---|
| `demo-valley.glb` | en 12 km lang dal med to åser og en landsby, som 3D-bane |
| `demo-yard.glb` | en 160 m lang gård med mur og bygninger, som 3D-bane |
| `tanks.parquet` | 10 stridsvognkamper, 8 mot 8: bevegelse, skudd, treff med plassen på skroget, branner, drap, vrak, tårnsikte, vinnere |
| `tanks/match-NN.parquet` | de samme kampene, én fil hver, for [mange kamper samtidig](many-matches.md) |
| `air.parquet` | en luftkamp 4 mot 4 med missiler, flares, drap og bom |
| `shooter.parquet` | 12 runder med 5 mot 5 til fots: skudd, drap, en plassering av bombe, opptjente og brukte kreditter, hjelmer og utstyr |
| `mass/` | en mappe med små `.3dheat`-kamper, for [massanalyse](mass-analysis.md) |
| et sett med løpsrunder | to runder med én bil på en oppdiktet bane, for [Løpsanalyse](race-analysis.md) |

Hver tabell navngir sine egne kolonner i bunnteksten, så den lastes inn uten noen kobling.

## Prøv det {#try-it}

1. Start visningsprogrammet (`start.bat` på Windows, eller `npm install` én gang og deretter `npm run dev` på alle systemer) og åpne `http://127.0.0.1:5273/`.
2. **Bakgrunn / bane → 3D-modell…** og velg `demo-valley.glb`.
3. **Kilde → Filer…** og velg `tanks.parquet`.
4. Trykk `F` for å tilpasse rammen til dataene. Du ser [varmen](heat.md) fra ti kamper.
5. Prøv modusraden: **Differanse** (Blue mot Red), **Lagvarme**, **Linjer**.
6. Åpne **Innsikter** (i sidepanelet for Varmekart): den finner stedene der langt mer ble skutt, truffet og ødelagt enn ellers – rundt de to åsene.
7. Åpne fanen **Kamp**; under **Kamper i reprisen** velger du *Match 01*; trykk **Spill av** på tidslinjen: [replayet](match-replay.md).

![Et replay av Match 01 med stridsvogner som figurer](../assets/img/en/replay-overview.webp)

For skytespillet laster du `demo-yard.glb` og `shooter.parquet`; for luftkampen `air.parquet` (figurene er lettere å se ved **Figurstørrelse** 4, en glidebryter i panelet **Lagvisning** i sidepanelet for Varmekart).

## Skjermbildene {#the-screenshots}

Sidens bilder lages fra disse dataene med et skript, på hvilket som helst av visningsprogrammets språk:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

Skjermbildeserveren kjører uten en lokal figurpakke, så bare den offentlige figurkatalogen vises. Bildene går til `docs/assets/img/<lang>/`. Se [Vedlikehold av dokumentasjonen](maintaining.md).
