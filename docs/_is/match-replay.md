---
title: "Endurspilun leiks"
nav_order: 9
has_children: true
lang: "is"
source: "match-replay.md"
source_hash: "9d61f24a5a04"
translated: true
outdated: false
---


# Endurspilun leiks

Endurspilunin er kvikmynd af leiknum þar sem hver leikmaður er teiknaður sem það sem hann ók. Notaðu hana til að horfa aftur á bardaga, fylgja einni einingu og sjá hver hitti hvern.

Skot, högg, eldar og flök eru teiknuð á einingarnar og markmiðin á borðinu. Myndavélar, merkingar og taktísk skjámynd hjálpa þér að lesa bardagann. Þekkir þú Tacview? [Samræmi við Tacview](tacview-parity.md) sýnir hvar hvert þeirra tóla er.

![Fígúruendurspilun tankasýnidæmisins: skriðdrekar sem eigin fígúrur, með merkingum fyrir heiti, farartæki og hraða](../assets/img/en/replay-overview.webp)

## Byrjaðu endurspilun {#start-a-replay}

1. Hladdu upptöku með **Uppruni → Skrár…** eða með því að sleppa henni á spjaldið Uppruni (hvaða töflu sem er með **manneskju**- og **tíma**dálk, Tacview-skrá, breyttri endurspilun, [`.3dheat`](container.md)-leik). Sjá [Hvernig gögn eru sett inn](getting-data-in.md).
2. Opnaðu flipann **Leikur** og veldu **Fígúruendurspilun**, eða veldu **Fígúruyfirlögn** á mótastiku flipans Hitakort.
3. Undir **Leikir í endurspiluninni** veldu einn leik, alla í einu, eða nokkra.
4. Ýttu á **Spila** á tímalínunni (eða `K`). Dragðu tímalínuna til að hoppa.

Fígúrur koma í stað kassa fyrir hverja einingu sem nafn hennar eða gerð er þekkt (sjá [Fígúrur](figures.md)). Gögn án dálks fyrir nafn eða gerð eru teiknuð sem hermenn.

![Flipinn Leikur: val leikja, hlutinn Fígúrur, myndavélarsýnirnar, Spila og atburðalistinn](../assets/img/en/match-replay-tab.webp)

## Fígúrur {#figures}

![Brennandi skriðdreki í brautarmyndavélinni, með skotinu sem hitti hann](../assets/img/en/replay-tanks.webp)

| Stilling (hlutinn **Fígúrur**) | Sjálfgildi | Hvað hún gerir |
|---|---|---|
| **Fígúrur í stað kassa** | kveikt | Slökkt teiknar einfalda kassa. |
| **Stærð fígúra** (sinnum raunstærð) | 1 | 1 er raunstærð; 0,25 til 20 sinnum (lógaritmískur kvarði). Stærra hjálpar úr fjarlægð. |
| **Minnsta mynd á skjá** | 36 px | Fígúrur í fjarlægð stækka til að haldast þessi stórar, 0 til 200 px; 0 heldur raunstærð. |
| **Í fjarlægð**: Fígúra, Ör, Tákn | Fígúra | Hvað eining í fjarlægð verður. |
| **Tákn** | NATO (APP-6) | NATO (APP-6), rússnesk taktísk tákn, tákn **Leikjakorts**, eða **Aðeins lögun (fyrir litblinda)**. |
| **Stærð tákns**, **Mín hlið**, **Fjandsamlegt / Hlutlaust**, **Stefnustrik** | 28 px (12 til 64), sjálfvirkt, fjandsamlegt, kveikt | Hvernig tákn líta út og hvaða hlið er vinveitt. |
| **Lóðlínur** | kveikt | Lína frá hverri einingu beint niður á jörðina, svo hæðir lesast í 3D. |
| **Lóðlínur og merki á vopnum** | slökkt | Línur niður á jörð og merki á flaugum og sprengjum. |
| **Eldar á einingum** | kveikt | Logar frá því augnabliki sem eining kviknar í þar til slökkt er. |
| **Hittni á einingar** | kveikt | Merki þar sem skot hittu (hér að neðan). **Hittni helst**: 1 til 300 sekúndur, eða **Allt lífið**. **Fljótandi merki**: merki teiknuð fyrir ofan yfirborðið. |
| **Mið- og turnlínur** | slökkt | Strikaðar: þar sem leikmaðurinn horfir; heilar: þar sem byssan beinist. |
| **Byggingar** | heilar | Heilar eða gegnsæjar byggingar, þegar borðið teiknar þær. |

### Tákn úr fjarlægð {#symbols-at-a-distance}

Þegar eining væri minni en **Minnsta mynd á skjá** getur hún orðið tákn sem helst læsilegt. Lögunin segir hvers konar hún er (til dæmis ávöl kassi með beltismerki fyrir brynvarið); liturinn segir hvaða hlið. Opnaðu valmyndina **Tákn** til að breyta stílnum.

![Sömu sex einingarnar sem NATO-tákn, rússnesk taktísk tákn, tákn leikjakorts og aðeins lögun](../assets/img/en/match-replay-symbols-styles.webp)

### Höggmerki, flök og eldar {#hit-marks-wrecks-and-fires}

- **Höggmerki** sitja á yfirborðinu sem skotið mætti, í mælikvarða fígúrunnar. Útlitið segir hvað gerðist: gat (fór í gegn), björt skvetta (fór ekki í gegn), rispa (rann af), sótstjarna (sprengikúla). Litaður hringur segir hvað það gerði: banaskot, eining eyðilögð, mikilvægt, alvarlegt, skaði, enginn skaði, hitt. Færðu bendilinn yfir merkið til að sjá heiti skotsins.
- Eining sem var eyðilögð er teiknuð **brunnin** sem flak frá dauða sínum þar til hún lifnar við eða er fjarlægð; táknið hennar er strikað yfir.
- **Eldar** brenna á einingu frá því hún kviknar í þar til slökkt er.
- **Turnar** snúast þangað sem gögnin segja að byssan beinist (eða, án þess, þangað sem leikmaðurinn horfir).

### Vopn, tálbeitur og rekjarar {#weapons-decoys-and-tracers}

Með **Vopn, skot og hittni** kveikt (hlutinn Liðssýn): flaugar, eldflaugar, sprengjur og tundurskeyti fljúga sem eigin fígúrur með reykslóð; byssukúlur og skeljar eru rekjarar; högg og sprengingar blossa upp. Rekjari teiknaður **strikaður** var reiknaður út frá höggi, því gögnin höfðu ekkert skot. Blys og flís eru teiknuð sem tálbeitur; þau eru falin úr einingalistanum nema *Tálbeitur og skeljar* sé hakað.

## Myndavélar {#cameras}

Smelltu á einingu eða merki hennar til að **fylgja** henni; hlutinn **Endurspilun** býður upp á **Elta**, **Hringsóla**, **Stjórnklefa** (með höfuðskjá, `H`), **Föst**, **Padlock**, **Skotmark** og **Gervihnött**. `V` fer á milli þeirra, **Fjarlægð myndavélar** stillir hversu langt. Esc stöðvar.

- **Sýn á tvær einingar**: veldu **Skotmark** (eða Ctrl/Alt-smelltu á einingu) til að horfa á hana frá þeirri sem fylgt er; **Skipta** skiptir þeim.
- **Mæling**: Shift-smelltu á tvær einingar fyrir stefnu, drægni og hæðarmun þeirra á milli.
- **2D kort** (`M`): horn- eða öll sýn, með slóðum og heitum.
- **Bókamerki** (`B`): vistaðu augnablikið og myndavélina; eigin dráp, dauðsföll og merki upptökunnar eru líka skráð.
- **Atburðir**: sérhver atburður í tímaröð; smellur hoppar þangað. `Page Up` / `Page Down` hoppa á milli atburða; **Gera hlé á atburði** stöðvar við hvern.

## Taktísk skjámynd {#tactical-display}

![Loftsýnidæmið með taktísku skjámyndinni (T): vírgrindarlandslag, dráps- og atburðaspjöld](../assets/img/en/replay-air-tactical.webp)

Hlutinn **Hernaðarsýn** teiknar, fyrir enga einingu, þær sem valdar eru, allar, eða eina tegund (loftför, land, skip, vopn): hraðavigra og leiðina framundan, nef- og lyftulínur, ratsjárkeilur, læsingar, gagnatengingar, þátttökusvæði og línur, sjónlínur, hvert leikmenn horfa (sjónkeilur), miðun turna, og skráða myndavélina.

### Stíll skjámyndar {#display-style}

`T` (eða rofinn **Sýna sem taktíska skjámynd**) skiptir útlitinu yfir í ratsjárskjástíl: glóð, útlínur, hæðarlínur, mælinet, skanna-línur, drægnihringi, hæðarstiga, spjöld með dráp og atburðum, og **Leikstjóra** sem færir myndavélina að atburðum sjálfur.

![Sama loftorrustan í venjulegu útliti](../assets/img/en/replay-air.webp)

## Markmið {#objectives}

Þegar leik fylgja markmið hans teiknar hlutinn **Markmið** þau á borðið: yfirtökusvæði (með eiganda og framvindu yfirtöku), upphafsstaði, flugvelli, svæði og sprengimarkmið, hvert lag hægt að kveikja og slökkva á, með merkingum. Þau sjást í gegnum jörðina. Þegar margir leikhamir eru hlaðnir síar **Hamur** leikina eftir hami. Markmiðin koma úr leikskrá breytis við hlið upptökunnar eða inni í [`.3dheat`](container.md)-ílátinu.

## Merkingar og tölfræði {#labels-and-statistics}

- **Merkingar**: reglur eftir tegund (**Valdar**, **Loftför**, **Land**, **Skip**, **Vopn**, **Gervigreind**): sýndar eða ekki, hvaða gildi, og **Forgangur** til að ákveða hver fær plássið þegar merkingar skarast. **Halda merkjum aðskildum** færir merki við hlið einingarinnar þegar það myndi hylja aðra, og sleppir því þar sem ekkert pláss er. **Stærð merkja** er 60 til 250%. **Aftur í nafn, farartæki, hæð og hraða** endurstillir reglurnar.
  - Landeiningar byrja með nafni, farartæki og hraða.
  - Loftför byrja með nafni, farartæki, hæð og hraða.
  - Skip byrja með nafni, farartæki, hraða og stefnu.
  - Færðu bendilinn yfir einingu til að sjá öll gildi hennar.
- **Tölfræði**: eftir liði og einingu: dráp, dauðsföll, skot, högg, hittnihlutfall, flugtök, lendingar, tími á lofti, hámarkshraði, hæð og G, vegalengd. CSV-útflutningur.
- **Gröf**: gildi einingar yfir tíma, tvær einingar bornar saman, eða eitt gildi á móti öðru.

## Margir leikir í einu {#many-matches-at-once}

Til að leggja hundruð eða þúsundir leikja yfir hvern annan, sjá [Margir leikir í einu](many-matches.md). Nánar um fígúrur (reyk, eld, aðra tímabundna áhrif): [Fígúrur í fígúruyfirlögninni](figure-replay.md). Listi yfir eiginleika Tacview: [Samræmi við Tacview](tacview-parity.md), undirsíða þessarar.
