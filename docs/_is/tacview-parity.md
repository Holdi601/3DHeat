---
title: "Samræmi við Tacview"
parent: "Endurspilun leiks"
grand_parent: "Endurspilun"
nav_order: 1
lang: "is"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Samræmi við Tacview

Tacview er vinsælt forrit til að horfa á flugupptökur. Ef þú þekkir það sýnir þessi síða hvar hvert af verkfærum þess er í 3DHeat.

Hún telur upp alla eiginleika Tacview 1.9 (handbókar þess, textatöflu notendaviðmótsins og ACMI 2.2 skráarsniðið) og hvar [endurspilun leiksins](match-replay.md) í 3DHeat stendur gagnvart þeim. Markmiðið: það sem Tacview getur gert fyrir endurspilun og gögn hennar, getur 3DHeat gert líka.

**Staða:**
- **lokið**: þegar til í 3DHeat.
- **nýtt**: smíðað til að samsvara eiginleika í Tacview.
- **ekki enn**: á við, en ekki smíðað.
- **á ekki við**: á ekki við hér, með ástæðu.

Hvar eiginleikarnir eru: flipinn **Leikur**, **Fígúruendurspilun** (eða **Fígúruyfirlögn** á flipanum Hitakort), í hliðarstikunni í hlutunum **Endurspilun**, **Einingar**, **Atburðir**, **Bókamerki**, **Hernaðarsýn**, **Tölfræði**, **Tímahliðrun og klipping**, **Kort og staðsetning**, **Hljóð og mynd** og **Merkingar**. Sjá [Endurspilun leiks](match-replay.md).

## Myndavélar {#cameras}

| Tacview | 3DHeat | Staða |
|---|---|---|
| Sýn úr stjórnklefa (F5), sjóndeildarhringurinn veltist með loftfarinu | **Stjórnklefi**: út úr einingunni eftir stöðu hennar, eins og hreyfilíkanið sýnir. Eigin fígúra einingarinnar er klippt burt. Dragðu til að líta í kringum þig; **Horfa aftur fram á við** endurstillir. | nýtt |
| HUD í sýn úr stjórnklefa (val á IAS/CAS/TAS) | **Sjónskjár** (H): sjóndeildarhringur og hallastigi raunverulegu sýnarinnar, merki flugleiðar, stefnuræma, IAS, hæð, TAS, Mach, G, árásarhorn, lóðréttur hraði, AGL | nýtt |
| Þrívíð mælitæki í stjórnklefa, rakning á höfði flugmanns (PilotHead*), TrackIR | Engin líkön af stjórnklefa; hornin á höfðinu sjást í **Hrá** sýn eininga­spjaldsins | á ekki við (engin líkön af stjórnklefa; búnaður til að rekja höfuð er fyrir lifandi flug) |
| Ytri sýn (F6): snúast um aðalhlutinn | **Elta** (snýst með einingunni) og **Hringsóla** (heldur eigin stefnu) | lokið |
| Myndavél í orrustu, „Horfa á skotmark“ (padlock) | **Padlock**: úr stjórnklefa, haldið á skotmarkinu | nýtt |
| Myndavél í orrustu, „Miðjað“ / „Horfa fram“ | **Skotmark**: aftan við einingu á línunni frá skotmarkinu, horft framhjá henni á skotmarkið. **Föst** á asimút 0 horfir fram frá framhlið. | nýtt |
| Skipta um aðal- og aukahlut | **Skipta** við hlið skotmarksins | nýtt |
| Gervihnattarsýn (F7), beint ofan frá | **Gervihnöttur**: beint niður á eininguna, norður upp; dragðu til að snúa. 2D kortið er samsíða grunnmynd. | nýtt |
| Frjáls myndavél (F8), W/A/S/D, E/C | Frjálsa myndavélin (W/A/S/D, bil/Q, Shift/Alt) | lokið |
| Viðbótarmyndavél Head-On; ytri myndavél föst við hlutinn | **Föst**: staður við hlið einingarinnar sem snýst og veltist með henni; dragðu til að færa hann (aftan, vængenda, beint framan) | nýtt |
| Viðbótarmyndavél Lock Camera (frystir staðsetninguna) | Hætta að fylgja (Esc): myndavélin er þar sem hún var | lokið |
| Stefnumótandi sýn (aðdráttur út á alla jörðina) | [Bakgrunnur heimsins](world-backdrop.md) og rammi alls upptökunnar á 2D kortinu | lokið |
| Stilling á sjónsviði | **Myndavél og sena** FOV | lokið |
| Skipta um sýn með tökkum | **V** næsta sýn, **Shift+V** til baka | nýtt |

## 3D sýn og birtingarvalkostir {#d-view-and-display-options}

| Tacview | 3DHeat | Staða |
|---|---|---|
| Slóðir sem borði, lengdarsleði | Slóðir (sekúndur) í skoðara liðsins | lokið |
| Vísandi slóð (leið framundan) | **Leið framundan**: hvert einingin raunverulega fer næstu sekúndurnar | nýtt |
| Hæðarlínur hluta / veggir | **Lóðlínur** | lokið (línur; veggir ekki smíðaðir) |
| Vigrar valins hlutar: stefna (punktalína), braut (heil lína), lyfta | **Hraðavigrar** (braut og hraði í svo margar sekúndur, með ábendingu) og **Nefs- og lyftilínur** (nef strikað, lyfta stutt og dökk) | nýtt |
| Sjónlína flugmanns | **Sjónlína flugmanns**: strikuð blágræn lína eftir PilotHeadYaw/PilotHeadPitch (eða dálki HeadYaw, ViewYaw eða LookYaw) miðað við ása einingarinnar | nýtt |
| Hvelfingar banvænna drægni SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, „2“-tvíburarnir) | **Átakasvæði**: hvelfingar, sporöskjulaga þar sem lóðrétta drægnin er önnur, slökkt meðan EngagementMode er 0 | nýtt |
| Ratsjárlæsingar (LockedTarget..9) með merkingum | **Læsingar**: rauðar línur að hverjum læstum hlut; strikaðar gular að FocusedTarget; eftir LockedTargetAzimuth/Elevation/Range þar sem enginn hlutur er nefndur. **Læsingamerki**: nafn skotmarksins og drægni á hverri læsingarlínu | nýtt |
| Ratsjárkeila (RadarMode, Azimuth, Elevation, Roll, Range, geislabreidd) og drægnishlið | **Ratsjárkeilur**: brún og miðhringur geislans sem snýst eftir asimút, hallahorni og veltu miðað við eininguna; drægnishliðið sem tvær gular brúnir. Án geislabreiddar, aðeins ás geislans. | nýtt |
| Sjónlína milli hlutanna tveggja sem eru valdir (græn / rauð punktalína þegar landslag hindrar) | Lína mældra parsins verður rauð og strikuð þegar landið er á milli þeirra | nýtt |
| Sjálfvirkur skali á fjarlægum hlutum | Minnsta fígúra á skjánum (pixlar) | lokið |
| Breiddar- og lengdarnet | **Kort og staðsetning → Hnitanet**: breiddar- og lengdarlínur á jörðinni undir myndavélinni, í ávölu bili eftir hæð (10° niður í 1'), merktar; eða **MGRS**-kílómetranet UTM-svæðisins, með svæðinu og 100 km reitnum sýnd. Hnitanet 2D kortsins eins og áður | nýtt |
| Bullseye-hringir | Hringir um bullseye hvers liðs á 2D kortinu | nýtt (aðeins 2D) |
| Aðflugshallayfirlag | **Aðflugshallar**: 3° leiðir með ±0,7° brúnum í fullum skala á báða enda hverrar flugbrautar nálægt upptökunni, út frá mældum þröskuldum og hæðum OurAirports (sótt einu sinni, geymt án nettengingar), merki við hverja sjómílu, nefnt eftir flugvelli og braut | nýtt |
| Hæðartakmarkanir (viðvörun um loft/gólf) | **Hæðartakmörkun**: gólf og loft; merki eininga utan þeirra verða rauð, og hvert yfirlit (undir gólfinu, yfir loftinu, aftur innan) er skráð - smellur fer þangað og fylgir einingunni | nýtt |
| Hlutir sem eyðast grárir, fjarlægðir eftir 15 mín | Líf enda með slóð sinni; eining sem er dauð er dofnuð í einingalistanum | lokið |
| Eiginleikarnir Visible / Disabled | Sýnt í **Hrá**; ekkert er falið af þeim | ekki enn |
| Birta stöðu priks/inngjafar/pedala | Inngjöf og vélargildi í reitum; stjórnmerki í **Hrá** | lokið (sem gildi) |
| Athugasemdir sem skjátextar | **Skilaboð sem skjátextar** (Merkingar): ACMI Message- og Comment-atburðir, og spjall úr hvaða leik sem er (Chat, Say eða Radio-atburðir, eða spjalldálkur), neðst í sýninni með því hver sagði það, í sex sekúndur | nýtt |
| Birting dagsetningar og UTC-tíma | Tímaklukka með UTC þar sem upptakan hefur viðmiðunartíma | lokið |
| Staða músar í breidd/lengd, MGRS, bullseye | Valspjaldið (smelltu á punkt) gefur breidd/lengd í gráðum, mínútum og sekúndum og MGRS við hlið heimsmetranna; bullseye fyrir hverja einingu (reitur) | nýtt |
| Sérsniðið merki | Ekki smíðað | á ekki við (vörumerki) |
| 3D líkön, næsta þegar óþekkt | Eigið fígúrusafn, næsti jafningi, rétt stærð | lokið |
| Margar átakalínur (línur milli allra para) | **Átakalínur**: frá hverri einingu í gildissviði að hverjum andstæðingi innan valins sviðs (1-200 km), hver með drægni sinni, næstu 60 pörin; mælda parið eins og áður | nýtt |

## Merkingar {#labels}

| Tacview | 3DHeat | Staða |
|---|---|---|
| Merkingar kveikt/slökkt, sér fyrir valda og óvalda hluti | **Merkingar** með reglum fyrir **Valdar**, **Loftför**, **Land**, **Skip**, **Vopn** og **Gervigreind**: sýnt eða ekki, eigin gildi, forgangur | nýtt |
| Reitir merkinga: nafn, kallmerki, flugmaður, hraðar (TAS/CAS/IAS/Mach/GS), hæðir (ASL/AGL), VS, AOA, AOS, G (lóðrétt, hlið, lengdar), beygjuhraði og radíus, orka, eldsneyti þyngd/rúmmál/flæði, stefna/braut, velta/halli, hjartsláttur | Hvert gildi í `fields.ts`: sami listi, reiknað þar sem ekki er skráð (áætlanir merktar ~). Veltuhraði og SpO2 aðeins um Hrá. | lokið |
| Staða bullseye í merkingum | Reiturinn **Bullseye (stefna / fjarlægð)** | nýtt |
| ILS-frávik, flogin vegalengd | Hrá gildi; flogin vegalengd í tölfræðinni | lokið (að hluta) |
| Hreinsa óvalda fjarmælingu | **Halda merkjum aðskildum**, raðað eftir forgangi hverrar reglu | lokið / nýtt |
| Merkja alla hluti á jörðu / aðeins ógnir | Reglurnar Land og Gervigreind | nýtt |
| Stærð merkinga | **Stærð merkja** (60-250%) | nýtt |
| Metrísk / enskar einingar | Metrískar / enskar | lokið (tvær forstillingar, ekki átta) |

## Upplýsingar um hluti og fjarmæling {#object-info-and-telemetry}

| Tacview | 3DHeat | Staða |
|---|---|---|
| Aðal- og aukaval | Smellur fylgir og velur; shift-smellur á tvo til að mæla; valtól **Skotmark** | lokið / nýtt |
| Drægni / stefna / sjónarhorn / lokun milli tveggja hluta | BRAA-lína mælda parsins; reitir Range, Bearing, Aspect og Closure frá eftirfylgdu einingunni | lokið |
| Afstæð miðun, hornhraði sjónlínu | Reitirnir **Afstæð miðun** (frá nefi eftirfylgdu einingarinnar, V/H) og **Hornhraði sjónlínu** (°/s) | nýtt |
| Fjarmælingargluggar | Einingaspjaldið og svífspjaldið | lokið |
| Hrá fjarmæling (hvert skráð eiginleikagildi, líka óþekkt) | **Hrá** á einingaspjaldinu: hver dálkur í röð einingarinnar eins og hann er skrifaður | nýtt |
| Listi virkra hluta | **Einingar**: leikmenn, gervigreind, vopn á flugi, lifandi einingar bjartar | lokið |
| Gluggi með eiginleikum upptökunnar (titill, höfundur, kynning...) | Geymt sem dálkurinn RecordingInfo; sýnt í Hrá | lokið (enginn gluggi) |
| Staðsetningarsnið DMS/MGRS, segulnorður | **Staðsetning (breidd / lengd)** í DMS og reitir **MGRS**; reiturinn **Segulstefna**; **Segulstefnur** skrifar stefnu, braut og stefnu miðað við segulnorður (°M) og sýnir áttavita með báðum norðrum og breytingunni - World Magnetic Model 2025 (opinberir stuðlar), reiknað hér á stað og dagsetningu einingarinnar | nýtt |

## Töflur {#charts}

| Tacview | 3DHeat | Staða |
|---|---|---|
| Tafla fyrir eitt loftfar, allt að 4 gildi | **Yfir tíma** (og taflan undir Endurspilun) | lokið |
| Teikna allt að 4 hluti í einu | **Samanburður**: eitt gildi fyrir allt að 8 einingar á einum kvarða | nýtt |
| Gildi á móti gildi (stíll orku og hreyfanleika) | **Gildi á móti gildi**: hraðabeygjuhraði á móti hraða eða hvaða pari sem er, hver eining er lína, núverandi punktur hennar merktur | nýtt |
| X-ás eftir tíma; aðdráttur; flytja tímann með töflunni | Músarhjól þysjar í tíma, tvísmellur endurstillir, smellur fer á augnablikið | nýtt |
| X-ás eftir loft- eða jarðarvegalengd | **Tími / Vegalengd í lofti / Vegalengd á jörðu** á tímatöflunni og samanburðartöflunni; aðdráttur og smellur-til-að-fara virka eins | nýtt |
| Fyrirfram skilgreindar töflur (orka, hröðun...) | Hvaða gildi sem er má velja (orkuhæð og breyting hennar eru gildi) | lokið |

## Tölfræði, flugskrá, atburðir {#statistics-flight-log-events}

| Tacview | 3DHeat | Staða |
|---|---|---|
| Flugskrá: tók á loft, lenti, skaut á, varð fyrir, eyðilagðist af, yfirgaf svæði | **Tölfræði** á hverja einingu: líf, fellingar, dauðsföll, skot, högg, hlutfall högga, flugtök, lendingar, tími í lofti, mesta G (og minnsta), mesti hraði, hæð og Mach, vegalengd. Flugtök koma úr TakenOff/Landed-atburðum, OnGround, AGL, eða áætlun merkt ~. | nýtt |
| Stigatafla og viðbætur með skýrslu verkefnis | Yfirlit eftir liði og flestar fellingar; eigin stigatafla leiksins í yfirliti | nýtt / lokið |
| Flytja út flugskrá sem XML/CSV | **Flytja út CSV** á tölfræðinni og á atburðunum eins og þeir eru taldir upp | nýtt (aðeins CSV) |
| Flytja út fjarmælingar-CSV á tilteknum hraða | **Fjarmæling völdu einingarinnar**: hvert gildi, 1-20 á sekúndu | nýtt |
| Atburðaskrá, tvísmellur til að fara þangað og velja | Listinn **Atburðir**, síaður eftir tegund og einingu; smellur flýgur þangað | lokið |
| Fyrri / næsti atburður (Ctrl+←/→) | **Page Up / Page Down** | nýtt |
| Gera hlé á atburði | **Gera hlé á atburði** | nýtt |
| Tímalínumerki (sleppingar, högg, eyðingar; hlutur valins í bláu og bókamerki í rauðu) | Fellingar og dauðsföll sem þéttleikastika, eftirfylgdu einingin í bláu, bókamerki í rauðu; smellur til að fara | nýtt |
| Fjarlægja atburð, fjarlægja fellingu | Ekki smíðað | á ekki við (atburðir tilheyra upptökunni; síur fela þá) |

## Bókamerki {#bookmarks}

| Tacview | 3DHeat | Staða |
|---|---|---|
| Setja bókamerki með vali og sjónarhorni | **Bæta við bókamerki** (B): augnablikið, frjálsa myndavélin eða eftirfylgda einingin með sýn sinni, fjarlægð og skotmarki; nefnt; geymt í þessum vafra fyrir hverja upptöku | nýtt |
| Fjarlægja bókamerki | × í listanum | nýtt |
| Bókamerki á tímalínunni og í skrám | Rauð merki; listinn | nýtt |
| Event=Bookmark í ACMI | Skráð undir merkjum upptökunnar, með fellingum, dauðsföllum og skilaboðum | nýtt |
| Flýtileið til að afrita/líma (deila sýn) | **Flytja út / inn** bókamerkin sem skrá; C afritar stöðu myndavélarinnar | nýtt |

## Afspilun {#playback}

| Tacview | 3DHeat | Staða |
|---|---|---|
| Spila/gera hlé, á upphaf, hraði, flytja tíma á tímalínu | Tímalína | lokið |
| Ramma fyrir ramma | **,** og **.** sekúndu til baka og áfram (Shift: tíu) | nýtt |
| Afspilun afturábak | **◀** á tímalínunni, **J** (**L** áfram; sami takki aftur gerir hlé): spilar frá enda í átt að upphafi á völdum hraða, endurtekið eða stoppað við upphaf | nýtt |
| Gluggi til að hoppa í tíma | Tímalínan og atburðalistinn | lokið |
| Tímahliðrun á einum hlut (draugur) | **Tímahliðrun og klipping**: færðu flug einnar einingar, eða allrar upptökunnar, um svo margar sekúndur; **Samstilla upptökurnar** færir nokkrar upptökur til að byrja saman og spilar þær í einu (tvær ferðir á ólíkum dögum hlið við hlið). Upptakan er endurbyggð, svo slóðir, atburðir, töflur og tölfræði fylgja | nýtt |
| Klippa fyrir/eftir | **Frá núna / Til núna / Klippa að þessu bili** (afturköllun heldur hliðrununum), síðan **Flytja út CSV** (hleðst aftur inn í 3DHeat) eða **Flytja út ACMI** (Tacview 2.2 texti, fyrir upptöku sett á jörðina) | nýtt |

## Landslag og kort {#terrain-and-map}

| Tacview | 3DHeat | Staða |
|---|---|---|
| Raunverulegt landslag, sérsniðin hæð og áferð | Borð (kort leiksins sem 3D líkan), flísar af bakgrunni heimsins | lokið |
| Flöt / tóm / landslag með mikilli andstæðu | [Útlit borðs](level-appearance.md): landslagsmótun, yfirborð og mannvirki sýnd eða ekki | lokið (ekki sömu hamir) |
| 2D taktískt kort (Tacview hefur ekkert: gervihnattarsýn) | **2D kort**: horn eða öll sýnin, tákn eftir tegund og liði (fylltir leikmenn, útlínur gervigreindar) snúin að stefnu sinni, slóðir, nöfn, kvarði, drægnihringir um eftirfylgdu einingu, bullseye-hringir, staður 3D myndavélarinnar, nýleg dauðsföll; dragðu, músarhjól, smelltu til að fylgja (M) | nýtt |
| Kyrrstæðir hlutir (flugvellir, flugbrautir, leiðarpunktar, svæði, KML) | Mældar flugbrautir (OurAirports) í bakgrunni heimsins og aðflugshallar þeirra; GPX-leiðarpunktar og KML-merki hlaðast sem standandi hlutir; [Taktískt borð](tactics-board.md) teiknar svæði og leiðir | nýtt |

## Innflutningur, útflutningur, upptaka {#import-export-recording}

| Tacview | 3DHeat | Staða |
|---|---|---|
| ACMI-texti og zip | [Tacview ACMI](tacview-acmi.md) | lokið |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (slóðir, leiðir, leiðarpunktar; hjartsláttur, snúningshraði, afl, hiti frá Garmin), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC og GGA frá hvaða sendanda sem er, athugaðar ávísanir, yfir miðnætti), **IGC** (B-færslur, dagsetning, flugmaður og svifflug), **FIT** (skilaboð um upptöku, þjöppuð tímamerki) - hvert sett eftir breidd og lengd á sléttuna á miðju slóðanna, svo bakgrunnur heimsins passar; stefna, halli og hraði úr skránni eða frá punkti til punkts. CSV og Parquet eins og áður | nýtt (DIS á ekki við: lifandi netsamskiptareglur) |
| Innfæddir upptökutæki (DCS, BMS, IL-2, MSFS...) | Eigin breytar 3DHeat (War Thunder, CS2, Squad, Arma og fleiri) | lokið (eigin) |
| Rauntímafjarmæling yfir TCP, ADS-B | Ekki smíðað | á ekki við (spilun eftir leikinn) |
| Samstilt hljóð/mynd | **Hljóð og mynd**: staðbundin skrá spilast, gerir hlé, leitar og breytir hraða með tímalínunni frá völdu upphafi (**Byrjar núna**, ±0,1 s); myndband í stillanlegri rúðu yfir sýninni, eða mynd-í-mynd. Skráin er áfram í vafranum | nýtt |
| Útflutningur myndbands | [Myndavélarslóð og myndband](camera-path-and-video.md) | lokið |

## Annað {#other}

| Tacview | 3DHeat | Staða |
|---|---|---|
| Lua-viðbætur | Ekki smíðað | á ekki við (opinn hugbúnaður: breyttu skoðaranum sjálfum) |
| Netkynning (sameiginleg lota) | Ekki smíðað | á ekki við (kynning Tacview er hýst lota sem heldur öllum á sama spilunarhaus. 3DHeat hefur enga þjóna og geymir upptökur á tölvu skoðarans, og jafnvel bein tenging þarf merkjaþjón. Kynning er deilt sem skrám: klipptu upptökunni (Flytja út ACMI eða CSV) og bókamerkjaskránni, sem opnast á sömu augnablikum og sýnum) |
| Stjórn kennara á fjarstýringu | Ekki smíðað | á ekki við (stjórnar hermi sem er í gangi) |
| Breyting á hlutum (bæta við, breyta, fjarlægja hluti) | [Taktískt borð](tactics-board.md) fyrir fyrirhugaða hluti; upptökur eru lesnar eingöngu | á ekki við |
| Tungumál | 40 tungumál | lokið |
| Auðkenning upptaka | Ekki smíðað | á ekki við |

## Fyrir forritara: ACMI 2.2 eiginleikar {#for-developers-acmi-22-properties}

Lesið af `data/acmi.ts`; talnaeiginleikar verða talnadálkar, textaeiginleikar flokkadálkar. Allir eru sýndir undir **Hrá** á einingaspjaldinu. Þessir eru lesnir í ákveðnum tilgangi:

| Eiginleikar | Notkun |
|---|---|
| T (allar fjórar myndir), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Staðsetning, stefna, fígúra, nafn einingar, lið |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Reitir, töflur, HUD, greining flugtaka og lendinga |
| VerticalGForce, LongitudinalGForce, LateralGForce | G-reitir |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Reitir |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Eldsneytisreitir, lagt saman yfir tankana |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Ratsjárkeilur og drægnishlið |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Læsingarlínur |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Átakahvelfingar |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Reitir |
| Health | Reitur |
| Atburðir: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Atburðalistinn, tölfræði (dauðsföll, flugtök, lendingar), bókamerki; Message og Comment sem skjátextar |
| PilotHeadYaw, PilotHeadPitch | Sjónlína flugmanns |
| Gerðarmerki Bullseye (Navaid+Static+Bullseye) | Bullseye-reitur og kortahringir |
| Allt annað (PilotHeadRoll, stýringar, fletir, ILS-frávik, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, stærðir...) | Sýnt eins og skrifað er undir **Hrá** |

Ásarhorn ratsjár og læsinga eru tekin miðað við eigin ása einingarinnar: asimút til hægri, hallahorn upp, velta hægri vængur niður. ACMI-lýsingin segir að þau séu miðuð við loftfarið en ekki í hvaða átt sé jákvætt; þessi lestur fylgir umbreytingu hennar (yaw réttsælis, pitch upp, roll hægri).
