---
title: "Breytar geyma allt"
parent: "Hvernig gögn eru sett inn"
nav_order: 8
lang: "is"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Breytar geyma allt

Þú þarft ekki þessa síðu til að opna endurspilun. Hún er fyrir fólk sem skrifar verkfæri sem breyta leikjaskrám í töflur 3DHeat, og fyrir alla sem vilja vita af hverju þessar töflur geyma svo mikið.

Sérhvert verkfæri sem breytir endurspilun, demói, skráningu eða beinni fjarmælingu leiks í eitthvað sem skoðarinn opnar fylgir einni reglu:

> **Breyttu öllu sem uppsprettan geymir og hægt er að lesa núna, og geymdu afganginn óskertan, svo að hægt sé að lesa hann seinna án upprunalegu skrárinnar.**

Endurspilun er oft horfin eftir uppfærslu leiksins, endurinnsetningu eða full disk, og bein straumur er horfinn um leið og hann var sendur. Það sem breytir sleppir er tapað fyrir fullt og allt; það sem er geymt óskert er hægt að afkóða þann dag sem einhver skilur það. Breytirinn ákveður því aldrei hvað verður gagnlegt: hann afkóðar það sem hann getur, geymir hver önnur skilaboð, pakka, atburð, eiginleika eða línu óbreytt við hliðina á töflunni, og segir í eigin úttaki hversu mikið af hverju hann las og hversu mikið hann einungis geymdi.

Þessi síða er samningurinn sem allir breytar deila: breytarnir fyrir endurspilanir War Thunder, World of Tanks, World of Warships og Squad, CS2-demóbreytirinn, bakgrunnsvaktarinn (afkóðari Dota-endurspilana og hver lifandi millistykki), mælitæki leiksins fyrir upptökur, og innflutningar skoðarans sjálfs (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Lesendur skoðarans sjálfs eru lýstir í [Tacview-upptökum](tacview-acmi.md) og [Hleðsla skráa](loading-files.md); eins-skráarformið er [Ein skrá fyrir hvern leik](container.md). Einn leikur verður að töflu, `match.json` og hliðarskrám, valfrjálst pakkað í eina `.3dheat`-skrá. Hvert verkfæri hefur **Heildarkafla** (Completeness) í README sínu sem telur upp, fyrir þá uppsprettu, hvað er lesið, hvað er geymt óskert og hvað er ekki til staðar, og af hverju.

## Þrjú heimili fyrir hvert atriði {#three-homes-for-every-item}

Allt sem uppspretta geymir endar á nákvæmlega einum af þremur stöðum:

| Heimili | Hvað fer þangað |
|---|---|
| **Afkóðað** | Taflan (ein röð fyrir hvert sýni eða atburð, dálkarnir sem skoðarinn les, auka dálkar fyrir hvert annað gildi sem tilheyrir röð) og leikjaskjalið `<match>.match.json` (allt sem tilheyrir leiknum í heild: stillingar, liðsskipan, úrslit, stigatöflur, sjálfsprófið). |
| **Geymt óskert** | Hliðarskrá við hlið töflunnar: sérhvert atriði sem er ekki afkóðað, eða aðeins að hluta, heilt og óbreytt, með tegund sinni, tíma og einingu eða einingu sem það tilheyrir. |
| **Ekki til staðar** | Nefnt í Heildarkafla README með ástæðunni: sniðið geymir það ekki (endurspilun viðskiptavinar hefur ekki innsláttur annarra spilara), uppsprettan sendir það aldrei, eða lestur þess er ekki leyfður (varið ferli, dulkóðaður kubbur sem lykillinn er ekki okkar að nota). |

Atriði sem er **að hluta** afkóðað er bæði afkóðað *og* geymt óskert: taflan fær það sem skilst, hliðarskráin allt atriðið, svo að betri afkóðari síðar þarfnast ekki upprunalegu skrárinnar.

Það er ekkert fjórða heimili. Að henda einhverju af því að það virtist gagnslaust, af því að það var líklega afrit, eða af því að það var stórt, er villa. Þynning er aðeins leyfð í töflunni (myndavél á 2 Hz í stað 60), aldrei í hliðarskránni.

## Hliðarskrár {#sidecars}

Hliðarskrá er Parquet-skrá við hlið töflunnar, nefnd eftir henni:

```
<mappa>/<leikur>.parquet              taflan
<mappa>/<leikur>.match.json           leikjaskjalið
<mappa>/<leikur>.<hvað>.parquet       hliðarskrá
```

`<hvað>` er eitt orð af þessum lista. Nýr breytir velur orðið sem passar, eða bætir nýju hér við **og** við `SIDECAR_PARQUET` í [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts), svo að skoðarinn sleppi henni þegar heil mappa er hlaðin.

| `<hvað>` | Geymir | Notað af |
|---|---|---|
| `messages` | pakka, köll á eininga-aðferðir og uppfærslur eiginleika úr netstraumi, óskert | War Thunder, World of Tanks, World of Warships |
| `flight` | færslur flugmódels fyrir hverja flugvél, óskert | War Thunder |
| `packets` | heila ramma og netskilaboð, eða ílátsbúta, utan einingastraumsins | CS2, Dota 2, Squad |
| `events` | leikjaatburðir með öllum lyklum sínum, eins og þáttarinn skilar þeim | CS2 |
| `entities` | uppfærslur eininga og eiginleika, fjarkall, rásir opnaðar og lokaðar, með útflutningunum sem afkóðari þarf | Squad, Dota 2 |
| `props` | sérhver eiginleiki einingar sem þáttarinn les, í hvert sinn sem hann breyttist | CS2 |
| `units` | ástand eininga utan staðsetningartöflunnar | Dota 2 |
| `combatlog` | bardagaskrá, hver færsla með öllum reitum | Dota 2 |
| `strings` | hver færsla í hverri strengatöflu | CS2, Dota 2 |
| `objectives` | fangsvæði og markmið, hver breyting með tíma sínum | War Thunder |
| `raw` | beinn straumur: hver pakki, lína, API-skjal eða minnislestur sem barst, heilt | setur vaktarans (`heat.raw.parquet`), skrár upptökutækja leiksins fyrir hringi (`<stimpill>_<leikur>.raw.parquet`), endurspilunarskrár vaktarans fyrir osu!, LoL og Valorant |

Mappahleðsla skoðarans sleppir hverri `*.<hvað>.parquet` af þessum lista, og hverri `*.match.json`, `*.meta.json`, `*.summary.json` og hinum JSON-hliðarskránum; ef opnuð er ein þeirra ein og sér, með því að velja eða draga bara þá skrá, hleðst hún eins og hver önnur tafla (sjá [Hleðsla skráa](loading-files.md)).

Þetta eru skrárnar eins og breytir skrifar þær með `--loose`. Sjálfgefið pakka breytar War Thunder, CS2 og Tacview töflu, skjali og hliðarskrám leiks í eina skrá, `<match>.3dheat`, undir sömu heitum (sjá [Ein skrá fyrir hvern leik](container.md)); allt hér gildir fyrir hvern hluta.

### Dálkar {#columns}

Hver röð hliðarskrár er eitt atriði. Dálkarnir eru, í þessari röð, þeir sem eiga við:

| Dálkur | Tegund | Hvað |
|---|---|---|
| `time` | float64 | sekúndur á sömu klukku og `time` töflunnar (eða `tick` þar sem uppsprettan telur tikk; þá bæði) |
| `type` | streng (orðabók) | hvað atriðið er, á eigin hugtökum uppsprettunnar: pakkategund, skilaboðanúmer, atburðaheiti, slóð eiginleika, forskeyti línu |
| `name` | streng (orðabók) | heiti þess þar sem það er þekkt (samfélagsheiti, flokksheiti), annars tómt |
| `entity` / `unit` / `uid` / `player` | heiltala eða strengur | hverjum það tilheyrir, með sömu auðkennum og taflan, svo að röð í hliðarskránni sé hægt að tengja við braut |
| `decoded` | streng (JSON) | það sem skilst af því, þar sem eitthvað skilst; annars tómt |
| `payload` | tvíundir | bæti atriðisins, heil og óbreytt (tvíundir uppsprettur) |
| `text` | streng | texti atriðisins, heill og óbreyttur (textauppsprettur: lína í skrá, JSON-hlutur, lykil-gildablokk) |

Fleiri dálkar eru leyfðir (bitaforskot, stærð, rás). Strengir sem endurtaka sig eru orðabókakóðaðir og skráin er skrifuð með zstd, svo að hliðarskrá er aðeins brot af stærð endurspilunarinnar sjálfrar.

Hliðarskrá verður að duga ein og sér: afkóðari sem er skrifaður síðar les hliðarskrána, aldrei upprunalegu endurspilunina. Þar sem atriði verður ekki skilið án samhengis (flokkur einingar, strengatafla, lykill sem skilaboð vísa í), fer samhengið líka í hliðarskrána, eða í leikjaskjalið.

### Lifandi uppsprettur {#live-sources}

Lifandi millistykki (UDP-fjarmæling, sameiginlegt minni, skrá leiks, staðbundið API) hafa enga skrá til að fara aftur í. Þau skrá **hvern reit sem uppsprettan sendir**, jafnvel þá sem ekkert notar enn:

- pakkastraumur: hver pakki heill, `payload` eru bætin, `type` auðkenni pakkans eða sniðið, á þeim hraða sem hann berst;
- sameiginlegt minni eða kannað API: hver reitur í hverri lestri, annað hvort sem nefndir dálkar eða allur blokkin sem `payload`, á þeim hraða sem millistykkið les;
- skrá: hver lína, `text` er línan, `type` tegund línunnar, þar með taldar línur sem millistykkið bregst ekki við.

Þetta fara í `<seta>.raw.parquet` við hlið töflu setunnar. Stærðin er verðið fyrir regluna; hún er haldin niðri með zstd og orðabókakóðun, ekki með því að sleppa hlutum.

## Sjálfsprófið {#the-self-check}

Sérhver breytir skrifar, í leikjaskjal sitt (eða `meta.json` setunnar, eða samantekt þar sem hann hefur ekkert leikjaskjal), `completeness`-kubb undir `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Reitur | Merking |
|---|---|
| `seen` | hversu mörg atriði af þessari tegund uppsprettan geymir |
| `decoded` | lesin heil inn í töfluna eða leikjaskjalið |
| `partial` | lesin að hluta inn í töfluna eða skjalið, og geymd heil í hliðarskrá |
| `raw` | geymd heil aðeins í hliðarskrá, ekki afkóðuð |
| `lost` | `seen - decoded - partial - raw`: verður að vera 0 |

Efsta `lost` er summan. Prófanir breytisins staðfesta að það sé 0 á tilbúnum sýnum hans, og README segir hvað það var á raunverulegum sýnum. `lost` sem er ekki núll er breytirinn sem segir að hann hafi brotið regluna; hann nefnir tegundina, svo að bilið finnist.

„Tegundirnar“ eru eigin tegundir uppsprettunnar: pakkategundir, skilaboðanúmer, atburðaheiti, eiginleikahópar, línutegundir. Þær eru taldar þar sem breytirinn rekst á þær, ekki út frá lista yfir það sem hann býst við, svo að tegund sem enginn vissi af birtist með talningu sinni í stað þess að hverfa.

## Heildarkafli README {#the-readmes-completeness-section}

Í README hvers breytis er kafli með fyrirsögninni **Heildarkafli** (Completeness), með þremur listum:

- **Lesið**: það sem fer í töfluna og leikjaskjalið, og hvernig hvert nýtt svið var athugað gegn einhverju óháðu (tölum leiksins sjálfs, annarri uppsprettu, upptöku gerðri í þeim tilgangi).
- **Geymt óskert**: hvað er í hvaða hliðarskrá, undir hvaða `type`, og hvað er vitað um það hingað til.
- **Ekki til staðar**: það sem uppsprettan geymir ekki eða má ekki lesa, og af hverju.

Hann vísar til baka á þessa síðu.

## Hvar hver breytir stendur {#where-each-converter-stands}

| Breytir | Hliðarskrár | Heildarkaflinn hans |
|---|---|---|
| Endurspilanir War Thunder | `messages`, `flight` | [README 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (talningar sjálfsprófsins eru undir `counts`; `completeness`-kubburinn á eftir að koma) |
| Endurspilanir World of Tanks | `messages` | [README 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| Endurspilanir World of Warships | `messages` | [README 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Demó af Squad-þjónum | `entities`, `packets` | [README 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2-demó | `events`, `props`, `strings`, `packets` | [README 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Endurspilanir Dota 2 (vaktari) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota 2 endurspilanir](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!, LoL, Valorant endurspilanir (vaktari) | `raw` | síður þeirra í [skjölum vaktarans](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Lifandi millistykki (vaktari) | `raw` | síða hvers leiks í [skjölum vaktarans](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), og [þróun](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) fyrir `Session.raw` |
| Upptökutæki fyrir hringi (upptökutól leiks) | `raw`, og `unparsed`-bæti inni í Forza-hringskrá | [README 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Eigin innflutningur skoðarans | engar: sjá hér að neðan | þessi síða |

### Eigin innflutningur skoðarans {#the-viewers-own-imports}

Tacview ACMI, OCAP og GPS-sniðin eru lesin í vafranum úr eigin skrá notandans; skoðarinn geymir ekkert af þeim, svo að skráin sjálf er áfram skráin. Þau lesa samt eins mikið og þau geta:

- **Tacview ACMI** (`src/data/acmi.ts`): sérhver hlutalína með staðsetningu er röð með hverjum eiginleika sem upptakan geymir, hver atburður er röð, hver fjarlæging er röð, eigin eiginleikar upptökunnar (með FileType og FileVersion úr hausnum) á hverri röð sem `RecordingInfo`; athugasemdalína er atburðurinn `Comment`, hlutur sem fær aldrei staðsetningu er röðin `Unplaced` á viðmiðunarpunktinum, og U/V eru dálkar hvenær sem einhver röð hefur þá. Eiginleikalína án staðsetningar er lesin að hluta: gildi hennar ná næstu röð hlutarins, ekki á sínum eigin tíma. `AcmiTable.completeness` telur línur skráarinnar eftir tegund.
- **OCAP** (`src/data/ocap.ts`): rammar, skot, merki allra eininga, hver tegund atburðar (óþekktar tegundir sem raðir af „Mission“ með texta sínum) og eigin svið skjalsins (`Info`). Ekki lesið enn: eiginleikar eininga og viðbótarstaðsetningarstök umfram þau sem talin eru upp í hausnum (viðbætur nýrri upptökutækis), og endurteknir rammar dauðrar einingar eftir dauða hennar (þynntir viljandi: ekkert breytist í þeim).
- **GPS-snið** (`src/data/geoTracks.ts`): staðsetningarpunktarnir, tími þeirra, hæð, stefna og hraði, og hjartsláttur, snúningshraði, afl, hiti, gervihnettir, HDOP og þrýstihæð þar sem skráin skráir þau. Ekki lesið enn: önnur GPX- og KML-viðbót, NMEA-setningar aðrar en staðsetningarsetningarnar, IGC-færslur aðrar en punktarnir og viðbætur þeirra, og FIT-skilaboð önnur en færslur (hringir, lotur, upplýsingar um tæki).

Þessi göt eru talin upp til að þau séu lokuð, ekki til að afsaka þau; útflutningar skoðarans á hlaðinni upptöku (`src/data/exportRecording.ts`) skrifa aðeins það sem var lesið.

## Að bæta við breyti {#adding-a-converter}

1. Taktu saman það sem sniðið geymir, út frá skjölunum þess, eigin byggingum þess, eða með því að telja hverja skilaboðategund í raunverulegum sýnum. Listinn er `types` sjálfsprófsins.
2. Afkóðaðu það sem hægt er að athuga núna. Sérhvert nýtt svið er athugað gegn einhverju óháðu áður en það fer í töfluna; svið sem ekki er hægt að athuga enn er áfram óafkóðað.
3. Geymdu afganginn heilan í hliðarskrá sem er nefnd eins og að ofan, með dálkunum að ofan.
4. Skrifaðu `completeness`-kubbinn og próf sem staðfestir að `lost` sé 0.
5. Skrifaðu Heildarkafla README og tengdu hingað.
6. Ef `<hvað>` hliðarskrárinnar er nýtt, bættu því við töfluna að ofan og við `SIDECAR_PARQUET` í `src/data/filePick.ts`.

Breytarnir eru „clean-room“: þeir eru skrifaðir út frá sniðum, skjölum og sýnum, aldrei út frá GPL- eða AGPL-kóða. Sýni af raunverulegum endurspilunum eru áfram á vélinni sem bjó þau til; próf nota tilbúnar skrár.
