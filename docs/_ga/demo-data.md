---
title: "Sonraí taispeána"
nav_order: 2
lang: "ga"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# Sonraí taispeána: triail a bhaint as an amharcóir i gcúig nóiméad

![Teas deich gcluiche tanc sa ghleann taispeána: cad a thaispeánann céim 4](../assets/img/en/heat-hero.webp)

Gan sonraí de do chuid féin fós? Cruthaíonn an stóras cuid acu. Tá gach rud sa stóras seo intuaslagtha: gleann, clós, agus cluichí de thrí stíl chluiche bhréagach le himreoirí darb ainm *Blue 1* nó *Red 3*. Glacadh na pictiúir ar an suíomh seo go léir leo.

## Déan é {#make-it}

```bash
node tools/demo-data.mjs
```

Scríobhann sé isteach i `tools/.shots/demo/`:

| Comhad | Cad is ann dó |
|---|---|
| `demo-valley.glb` | gleann 12 km le dhá chnoc agus sráidbhaile, mar leibhéal 3D |
| `demo-yard.glb` | clós balla 160 m le foirgnimh, mar leibhéal 3D |
| `tanks.parquet` | 10 gcluiche tanc, 8 in aghaidh 8: gluaiseacht, urchair, buillí leis an áit ar an gcorp, tinte, marbhanna, longa briste, aim túirín, buaiteoirí |
| `tanks/match-NN.parquet` | na cluichí céanna, comhad amháin in aghaidh gach ceann, le haghaidh [go leor cluichí ag an am céanna](many-matches.md) |
| `air.parquet` | troid aeir 4 in aghaidh 4 le diúracáin, flairí, marbhanna agus cuir amú |
| `shooter.parquet` | 12 babhta de 5 in aghaidh 5 de chois: urchair, marbhanna, plandáil, creidiúintí tuillte agus caite, clogad agus fóiréinn |
| `mass/` | fillteán de chluichí beaga `.3dheat`, le haghaidh [anailíse mhais](mass-analysis.md) |
| tacar cuairteanna rása | dhá chuairt de charr amháin ar chúrsa bréagach, le haghaidh [Anailís rása](race-analysis.md) |

Ainmníonn gach tábla a cuid colún féin ina fhoot, ionas go lódálann sé gan aon mhapáil.

## Bain triail as {#try-it}

1. Tosaigh an t-amharcóir (`start.bat` ar Windows, nó `npm install` uair amháin agus ansin `npm run dev` ar aon chóras) agus oscail `http://127.0.0.1:5273/`.
2. **Cúlra / leibhéal → Samhail 3T…** agus roghnaigh `demo-valley.glb`.
3. **Foinse → Comhaid…** agus roghnaigh `tanks.parquet`.
4. Brúigh `F` chun na sonraí a fhrámú. Feiceann tú [teas](heat.md) deich gcluiche.
5. Bain triail as barra na modhanna: **Difríocht** (Blue in aghaidh Red), **Teas foirne**, **Línte**.
6. Oscail **Léargais** (sa bharra taoibh Léarscáil teasa): aimsíonn sé na háiteanna inar lámhachadh, buaileadh agus scriosadh i bhfad níos mó ná in áiteanna eile - timpeall an dá chnoc.
7. Oscail an cluaisín **Cluiche**; faoi **Cluichí san athsheinm** roghnaigh *Match 01*; brúigh **Seinn** ar an amlíne: an [athsheinm](match-replay.md).

![Athsheinm de Match 01 le tancanna mar fhigiúirí](../assets/img/en/replay-overview.webp)

Don lámhachóir, lódáil `demo-yard.glb` agus `shooter.parquet`; don troid aeir, `air.parquet` (is éasca na figiúirí a fheiceáil ag **Méid na bhfigiúirí** 4, sleamhnán sa phainéal **Amharcán foirne** de bharra taoibh na Léarscáile teasa).

## Na pictiúir scáileáin {#the-screenshots}

Déanann script pictiúir an tsuímh as na sonraí seo, i gceann de theangacha an amharcóra:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

Ritheann an freastalaí scáileáin gan phacáiste figiúr áitiúil, mar sin ní thaispeántar ach catalóg phoiblí na bhfigiúr. Téann pictiúir chuig `docs/assets/img/<lang>/`. Féach [Na doiciméid a choinneáil](maintaining.md).
