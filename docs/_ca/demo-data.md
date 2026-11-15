---
title: "Dades de demostració"
nav_order: 2
lang: "ca"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# Dades de demostració: prova el visor en cinc minuts

![Calor de deu partides de tancs a la vall de demostració: el que mostra el pas 4](../assets/img/en/heat-hero.webp)

Encara no tens dades pròpies? El repositori en fa. Tot és inventat: una vall, un pati, i partides de tres estils de joc també inventats, amb jugadors que es diuen *Blue 1* o *Red 3*. Les imatges d'aquest lloc s'han fet totes amb aquestes dades.

## Crea-les {#make-it}

```bash
node tools/demo-data.mjs
```

Això escriu a `tools/.shots/demo/`:

| Fitxer | Què és |
|---|---|
| `demo-valley.glb` | una vall de 12 km amb dos turons i un poble, com a nivell 3D |
| `demo-yard.glb` | un pati emmurallat de 160 m amb edificis, com a nivell 3D |
| `tanks.parquet` | 10 partides de tancs, 8 contra 8: moviment, trets, impactes amb el lloc on toca el casc, incendis, morts, restes, punteria de la torreta, guanyadors |
| `tanks/match-NN.parquet` | les mateixes partides, un fitxer per cadascuna, per a [moltes partides alhora](many-matches.md) |
| `air.parquet` | una batalla aèria de 4 contra 4 amb míssils, bengales, morts i errades |
| `shooter.parquet` | 12 rondes de 5 contra 5 a peu: trets, morts, un explosiu, crèdits guanyats i gastats, cascos i utilitats |
| `mass/` | una carpeta de petites partides `.3dheat`, per a [anàlisi massiva](mass-analysis.md) |
| un conjunt de voltes | dues voltes d'un cotxe en un circuit inventat, per a [Anàlisi de curses](race-analysis.md) |

Cada taula indica les seves pròpies columnes al peu, així que es carrega sense cap assignació.

## Prova-ho {#try-it}

1. Inicia el visor (`start.bat` a Windows, o `npm install` una vegada i després `npm run dev` en qualsevol sistema) i obre `http://127.0.0.1:5273/`.
2. **Fons / nivell → Model 3D…** i tria `demo-valley.glb`.
3. **Origen → Fitxers…** i tria `tanks.parquet`.
4. Prem `F` per enquadrar les dades. Veus la [calor](heat.md) de deu partides.
5. Prova la barra de modes: **Diferència** (Blue contra Red), **Calor per equips**, **Línies**.
6. Obre **Troballes** (a la barra lateral del Mapa de calor): troba els llocs on es va disparar, tocar i destruir molt més que a la resta -al voltant dels dos turons.
7. Obre la pestanya **Partida**; a **Partides de la repetició** tria *Match 01*, i prem **Reprodueix** a la línia de temps: la [repetició](match-replay.md).

![Una repetició de Match 01 amb tancs com a figures](../assets/img/en/replay-overview.webp)

Per al tiroteig, carrega `demo-yard.glb` i `shooter.parquet`; per a la batalla aèria, `air.parquet` (les figures es veuen millor amb **Mida de les figures** 4, un lliscador al panell **Visor d'equips** de la barra lateral del Mapa de calor).

## Les captures de pantalla {#the-screenshots}

Les imatges del lloc les fa un script a partir d'aquestes dades, en qualsevol dels idiomes del visor:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

El servidor de captures funciona sense paquet local de figures, així que només es mostra el catàleg públic de figures. Les imatges van a `docs/assets/img/<idioma>/`. Vegeu [Manteniment de la documentació](maintaining.md).
