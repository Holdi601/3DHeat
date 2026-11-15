---
title: "Date demonstrative"
nav_order: 2
lang: "ro"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# Date demonstrative: încearcă vizualizatorul în cinci minute

![Căldura a zece meciuri cu tancuri în valea demonstrativă: ce arată pasul 4](../assets/img/en/heat-hero.webp)

Nu ai încă date proprii? Depozitul le generează. Totul în el este inventat: o vale, o curte și meciuri din trei stiluri de joc inventate, cu jucători numiți *Blue 1* sau *Red 3*. Imaginile de pe acest site au fost toate făcute cu ele.

## Generează-le {#make-it}

```bash
node tools/demo-data.mjs
```

Acesta scrie în `tools/.shots/demo/`:

| Fișier | Ce este |
|---|---|
| `demo-valley.glb` | o vale de 12 km cu două dealuri și un sat, ca nivel 3D |
| `demo-yard.glb` | o curte împrejmuită de 160 m, cu clădiri, ca nivel 3D |
| `tanks.parquet` | 10 meciuri cu tancuri, 8 contra 8: mișcare, trageri, lovituri cu locul de pe corp, incendii, eliminări, epave, direcția turelei, câștigătorii |
| `tanks/match-NN.parquet` | aceleași meciuri, câte un fișier pentru fiecare, pentru [multe meciuri deodată](many-matches.md) |
| `air.parquet` | o luptă aeriană 4 contra 4, cu rachete, flare-uri, eliminări și ratări |
| `shooter.parquet` | 12 runde de 5 contra 5 pe jos: trageri, eliminări, o plantare, credite câștigate și cheltuite, căști și utilitare |
| `mass/` | un dosar cu meciuri `.3dheat` mici, pentru [analiza de masă](mass-analysis.md) |
| un set de ture | două ture ale unei mașini pe un traseu inventat, pentru [Analiză de cursă](race-analysis.md) |

Fiecare tabel își numește coloanele în subsolul său, deci se încarcă fără nicio mapare.

## Încearcă-le {#try-it}

1. Pornește vizualizatorul (`start.bat` pe Windows sau `npm install` o dată și apoi `npm run dev` pe orice sistem) și deschide `http://127.0.0.1:5273/`.
2. **Fundal / nivel → Model 3D…** și alege `demo-valley.glb`.
3. **Sursă → Fișiere…** și alege `tanks.parquet`.
4. Apasă `F` ca să încadrezi datele. Vezi [căldura](heat.md) din zece meciuri.
5. Încearcă bara de moduri: **Diferență** (Blue față de Red), **Căldură pe echipe**, **Linii**.
6. Deschide **Observații** (în bara laterală Hartă termică): găsește locurile unde s-a tras, s-a lovit și s-a distrus mult mai mult decât în altă parte - în jurul celor două dealuri.
7. Deschide fila **Meci**; sub **Meciuri din reluare** alege *Match 01*; apasă **Redare** pe cronologie: [reluarea](match-replay.md).

![O reluare a Match 01 cu tancuri ca figuri](../assets/img/en/replay-overview.webp)

Pentru tragător, încarcă `demo-yard.glb` și `shooter.parquet`; pentru lupta aeriană, `air.parquet` (figurile se văd mai bine la **Mărimea figurilor** 4, un glisor din panoul **Vizualizare pe echipe** din bara laterală Hartă termică).

## Capturile de ecran {#the-screenshots}

Imaginile site-ului sunt făcute din aceste date de un script, în oricare dintre limbile vizualizatorului:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

Serverul de capturi rulează fără un pachet local de figuri, deci se arată doar catalogul public de figuri. Imaginile ajung în `docs/assets/img/<lang>/`. Vezi [Întreținerea documentației](maintaining.md).
