---
title: "Aðrir kappakstursleikir"
parent: "Kappakstursgreining"
nav_order: 59
lang: "is"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Aðrir kappakstursleikir í skoðaranum

Skoðarinn les hringi úr mörgum kappakstursleikjum, ekki bara einum. Þessi síða telur þá upp og segir hvernig fæst hringur út úr hverjum þeirra.

## Leikirnir {#the-games}

| Leikur | Upptökutæki | Sleiki í skránni? | Heimurinn speglaður? | Athugasemdir |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out yfir UDP), eða hringjaskrár FH Companion ásamt `.tele.gz` | já, fyrir hvert hjól (staðlað) | já (heimur í vinstri hnitakerfi) | `.tele.gz`-skráin við hvern hring frá FH Companion gefur sleika hvers hjóls; hringjaskráin ein og sér gerir það ekki |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (sameiginlegt minni) | já, fyrir hvert hjól | mælt úr hringjunum | einnig ABS og spólvörn að verki, álag á hjól, hitastig |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | nei, reiknað út frá hraða hjólanna | mælt úr hringjunum | rall: laus jörð og stökk eru metin öðruvísi |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | nei | mælt úr hringjunum | engir hraðar hjóla |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (breyting, mod) | nei, reiknað út frá hraða hjólanna | mælt úr hringjunum | |
| Trackmania | Openplanet-viðbótin, `telemetry --game trackmania --install` | sleikistuðull fyrir hvert hjól | mælt úr hringjunum | spilakassaeðlisfræði: rennsli er metið öðruvísi |
| iRacing | ekkert: eigin `.ibt`-skrá | nei (ekki skráð); reiknað út frá snúningshorni | nei (byggt á GPS) | kveiktu á skráningu í bílnum með Alt+L |

## Hvernig þú tekur upp hring {#how-to-record-a-lap}

1. Veldu leikinn þinn í töflunni og settu hann upp eins og síða upptökutækisins fyrir hann segir (stilling í leiknum, breyting eða ekkert fyrir iRacing). Skrefin eru ólík eftir leikjum, þess vegna eru þau í skjölum upptökutækjanna: [GameCapture: leikir](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Ræstu upptökutækið og keyrðu. Það skrifar eina skrá fyrir hvern hring.
3. Á flipanum **Kappakstursgreining** ýtirðu á **Hlaða hringjaskrám…** og velur tvo eða fleiri hringi af sömu braut (sjá [Hlaða hringjum](race-loading-laps.md)).

Fyrir rallleiki skrifar upptökutækið eina skrá fyrir hverja sérleið og fyrir Forza er auðveldast að byrja með bókasafn FH Companion ásamt `.tele.gz`-skránum við hringjaskrárnar.

## Það sem upptökutækin skjalfesta {#what-the-recorders-document}

Hvernig hver leikur er tekinn upp, hvað hann sendir, heimildir fyrir uppsetningum hans og hvaða brautir er hægt að flytja út úr skrám hans, er á ábyrgð upptökutækjanna að skjalfesta: [GameCapture: leikir](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (opinbert, í [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). Hringjaskráin sem hvert upptökutæki skrifar er lýst í [GameCapture: hringjasniðinu](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Það sem skoðarinn gerir við þær {#what-the-viewer-does-with-them}

Hver leikur endar sem `heat3d-lap`-skrár (eða CSV-skrá með hringjum, eða er lesinn beint, eins og `.ibt` hjá iRacing). Þær nota staðlaða rásaheiti úr `src/race/schema.ts` og `meta`-reit sem segir hvað tölurnar þýða: hvernig sleikinn er skalaður, hvort þetta er braut, rall eða spilakassi, og yfirborðið ef það er þekkt. Þannig fer flipinn **Kappakstursgreining** eins með þær allar. Þegar engin brautarmynd er hlaðin teiknar flipinn **Kappakstursgreining** veg út frá dreifingu hringjanna sjálfra, svo hver leikur er nothæfur án brautar.

Það sem enginn rallleikjanna sendir, sleik í dekkjum, reiknar skoðarinn sjálfur: út frá snertifleti eða yfirborðshraða hvers hjóls miðað við hraða bílsins þar sem leikurinn sendir hann (`(hjól - bíll) / bíll`), og út frá snúningi þess og veltiradíus sem er mældur á hringnum sjálfum þar sem leikurinn sendir aðeins snúning. Rekshornið kemur úr hraðavigri bílsins sjálfs (Forza, AC-leikirnir, Trackmania, RBR), úr hraðavigri heimsins varpað á ása bílsins (EA WRC, DiRT, BeamNG), eða úr stefnu bílsins miðað við brautina. Hvort bíllinn er í loftinu kemur úr snertingu hjólanna, álagi eða fjöðrun. Sjá `src/race/derive.ts`.

Þar sem heimur leiksins er í vinstri hnitakerfi, eins og hjá Forza, kemur brautin spegluð í skoðaranum. Stýring og fjöðrun í hringjunum sjálfum sýna það, og flipinn **Kappakstursgreining** býðst til að snúa ás við. Leikir þar sem hnitakerfið er ekki skjalfest (RBR, BeamNG, Trackmania) eru meðhöndlaðir á sama hátt: mældir, ekki gefið sér.

Auk aksturs-rásanna geyma upptökutækin það sem hver leikur bætir við: ABS og spólvörn þegar þær eru að verki í AC-leikjunum, bremsujöfnun, DRS, pit limiter, boost og endingu bremsuklossa og diska; aðstoðarstillingar iRacing, bremsujöfnun, eldsneyti, olíu- og vatnshitastig og allar aðrar rásir sem það skráir undir sínu eigin nafni. Skoðarinn teiknar þær úr rásatöflu sinni (ljós, stig, tákn, línurit), svo fleiri rásir kalla ekki á breytingu í skoðaranum.
