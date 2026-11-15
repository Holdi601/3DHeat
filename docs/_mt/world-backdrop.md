---
title: "Isfond tad-dinja"
parent: "Livelli u ġeometrija tal-isfond"
nav_order: 5
has_children: true
lang: "mt"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Isfond tad-dinja

Isfond tad-dinja iqiegħed l-art vera taħt registrazzjoni ta' titjira: għoljiet, toroq, xmajjar, bażijiet tal-ajru u bini, imniżżla minn dejta tal-mapep ħielsa miftuħa. Uża dan meta rekording ta' Tacview kieku jkun qed jitfgħa fuq grilja vojta. Hu **livell** ([glossarju](glossary.md)), għalhekk is-sħana u l-figuri jitqiegħdu fuqu.

## Ibni wieħed {#build-one}

1. Tgħabbi rekording ta' titjira li jgħid fejn hu fuq id-dinja (fajl Tacview `.acmi`), jew ma tgħabbi xejn u tagħżel teatru fit-tielet pass. Ara [Kif tidħol id-dejta](getting-data-in.md).
2. Iftaħ **Sfond / livell** fil-sidebar.
3. Ikklikkja **Id-dinja vera bħala sfond** biex tibni l-art taħt id-dejta tiegħek. Jew agħżel mappa tal-logħba f'**Teatru tal-operazzjonijiet** u ikklikkja **Ibni l-isfond tat-teatru** (jew **Ixxandra t-teatru**).
4. Stenna. Il-panew juri x'qed isir (*Madum tal-elevazzjoni*, *Madum tal-mappa*, *Qed tinbena l-isfond*); **Ikkanċella** twaqqaf.
5. Ara madwar. Is-sistema tal-kreditu għad-dejta tal-mappa tinkiteb fil-kantuna t'isfel tal-lemin tal-view.

L-ewwel bini jniżżel madwar xi għexieren ta' megabytes. Il-browser iżomm dawn, għalhekk bini tat-tieni darba tal-istess żona ma jniżżel xejn. **Insa l-madum tal-mappa** jneħħihom. Il-buttuna **Id-dinja vera bħala sfond** tidher biss meta d-dejta mgħobbija jkollha referenza ġeografika (hawn taħt).

Kollox jinbena f'worker ta' sottofond ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Ir-riżultat jieħu post il-livell kurrenti u jaħdem bħal kull [livell 3D](model-levels.md): jaħbi s-sħana li tkun wara, jinqata' mill-qatgħa, għandu l-[kontrolli tad-dehra](level-appearance.md), u jista' jinħażen fil-[librerija](level-library.md).

## Fejn hi d-dejta: ir-referenza ġeografika {#where-the-data-is-the-geographic-reference}

Sett ta' dejta jieħu referenza ġeografika biss minn sors li jgħidha:

- **Rekording ACMI**: il-`ReferenceLatitude` u l-`ReferenceLongitude` fil-header tiegħu, u pożizzjonijiet li l-qarrej jipproġettahom fuq il-pjan li jmiss l-elissojde WGS84 hemm (X lvant, Y tramuntana, f'metri; l-għoljiet huma l-altitudni tar-rekording 'il fuq mill-livell tal-baħar). Ir-referenza tinżamm meta t-tqabbil jieħu **X** u **Y** bħala l-assi tal-art - u dan hu dak li jgħidu l-ħjiel tar-rekording innifsu - u titwarrab meta l-art tiġi minn kwalunkwe kolonna oħra, bħal **U** u **V** ta' logħba li hi dinja ċatta.
- **Tabella Parquet li l-ħjiel `heat3d` tagħha jkollhom dħul `geo`** - it-tabelli tal-[Watcher](https://github.com/Holdi601/3DHeat-Watcher) għal DCS, MSFS, X-Plane u IL-2 (Tacview). Id-dħul hu deskritt taħt [Għall-iżviluppaturi](#for-developers).

Tagħbija ta' diversi fajls iżżomm ir-referenza biss meta jkunu kollha jaqblu fuqha. Kull tagħbija oħra mhix affettwata u ma tġib l-ebda referenza.

L-isfond jiġi proġettat bl-istess mod u mbagħad jgħaddi mill-mappa tal-assi tat-tagħbija, sabiex jinżel taħt id-dejta kull ma tkun il-mappa tal-assi jew l-iskala.

## Teatri {#theatres}

L-għażla **Teatru tal-operazzjonijiet** tlista l-mapep reali ta' DCS World (Caucasus, Nevada, Normandy 2, The Channel, Syria, Persian Gulf, Marianas, Marianas WWII, South Atlantic, Sinai, Afghanistan, Kola, Germany Cold War, Iraq) u IL-2 Great Battles (Stalingrad, Moscow, Kuban, Rheinland, Normandy, Prokhorovka, Velikie Luki, Arras, Odessa, Finnish Gulf / Leningrad, Korea), kull wieħed b'il-kaxxa tiegħu fuq id-dinja ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). Il-kaxxi ta' DCS huma l-estensjonijiet tal-editurs, ikkalkulati mill-proġezzjonijiet ippubblikati; il-kaxxi ta' IL-2, u dawk ta' DCS immarkati hekk, huma stimi mid-daqsijiet ippubblikati tal-mapep u l-bliet fit-truf tagħhom - il-panew jgħid liema.

**Ibni l-isfond tat-teatru** jibni żewġ livelli ta' dettall f'mesh wieħed:

| Livell | Żona | Art | Mappa |
|---|---|---|---|
| Teatru | il-kaxxa kollha | l-iktar zoom profond sa 10 li jeħtieġ mill-iktar 64 tile ta' għoli (madwar 3 km kull vertiċi fuq il-Caucasus, 1 km fuq Normandy) | il-baħar, il-għadajjar, il-kopertura tal-art u t-triq tal-karrijiet mill-iktar 64 tile tal-vetturi fi zoom 4 sa 9 |
| Żona dettaljata | **Taħt id-dejta**, **Madwar punt** (latitudni, longitudni, 12 sa 400 km), jew xejn | sa zoom 12 f'mill-iktar 100 tile, bl-iktar 500,000 vertiċi | dak kollu hawn taħt, mill-iktar 1,500 tile tal-vetturi fl-iktar zoom profond sa 14 li jaqbel |

Iż-żona dettaljata tqatta toqba fil-grilja tat-teatru, imwessa' sa ċelloli sħaħ sabiex iż-żewġ grilji jaqsmu l-linji tat-tarf tagħhom, u ħajt irqiq jagħlaq il-ġuntura fejn jieħdu l-għoljiet b'mod differenti.

Bid-dejta mgħobbija t-teatru jinbena fuq il-pjan tad-dejta, sabiex jinżel taħtha kif inbena. Mingħajr dejta jinbena madwar il-punt ta' referenza proprju tat-teatru (gradi sħaħ qrib iż-żona dettaljata tiegħu). Dejta mgħobbija wara fuq referenza oħra - fajl ACMI jisimmha waħdu - tmexxi l-isfond taħtha: il-bidla eżatta bejn iż-żewġ proġezzjonijiet tiġi kkalkulata fuq grilja ta' 256 × 256 fuq l-isfond, u tinqara bejn in-nodi, b'metru jew tnejn madwar teatru kollu ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Isfond mħażen fil-librerija jżomm il-post tiegħu u jitmexxa bl-istess mod meta jitgħabba taħt dejta oħra.

### Ixxandar teatru {#streaming-a-theatre}

**Ixxandra t-teatru** juri t-teatru bħal kif juri mapep ta' simulatur tat-titjiħ: l-art tasal bħala ħafna tile żgħar madwar il-kamera, mgħobbija hekk kif titkaxkar u mitfuha meta jkunu 'l bogħod ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Quadtree ta' tile ta' Web Mercator.** Il-għeruq f'zoom 5 jkopru 1,500 km madwar il-kamera, sabiex l-art tmur 'il bogħod mill-kaxxa tat-teatru sal-orizzont. Tile tinqasam f'erba' uliedha filwaqt li l-kamera tkun eqreb mill-1.4 darba l-wisa' tagħha, sa zoom 15 (madwar 1 km tile, 15 m bejn il-vertiċi tal-art): id-dettall jonqos mad-distanza kif jonqos fuq l-iskrin.
- **Kull tile għandu mesh tiegħu**, mibni f'worker ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): grilja tal-art ta' 65 × 65 b'tarf madwar il-bordura (sabiex il-ġirien b'dettall differenti qatt ma juru xquq), kopertura tal-art u l-baħar miżbugħa fuqha, toroq, linji tal-ferrovija, għadajjar, xmajjar, bażijiet tal-ajru, pisti tal-ajru mqisa u binjiet fuqhom, u optionalment l-istampa tas-satellita tal-kwadru tagħha. Ir-renderer ifittex it-tiles bl-aspett u r-regoli tal-fond tal-livell, sabiex jaħbu s-sħana li tkun wara bħal kull livell.
- **Qadim l-ewwel.** It-tiles jintalbu qodma u qrib l-ewwel, erba' niżżiliet f'daqqa għal kull sors; waqt li l-wild ta' tile jitgħabba, it-tile jidher minflokhom, sabiex il-view jimtela minnufih u jsir aktar ċar.
- **Memorja**: tiles mibnija jinżammu sa 600 MB, l-iktar wieħed li ntuża l-inqas f'daqqa jitneħħa l-ewwel. **Niżżiliet** jibqgħu fil-cache tat-tiles, miżmuma f'budget ta' 2 GB, l-iktar qodma l-ewwel 'il barra: il-fluwidu lura minn żona ma jiswa xejn, u m'hemm l-ebda limitu għal kull bini.
- **Mħażna fil-librerija** bħal dak li tixxandar - it-teatru, l-għażliet tiegħu u l-post tiegħu fid-dinja - mhux bħala tiles: it-tagħbija terġa' tixxandar, mill-cache tat-tiles fejn it-tiles għadhom hemm. Il-kliks u l-ispezzjonatur jolqtu t-tiles kif jolqtu kull livell.
- Iż-żewġ renderers jpingu t-tiles: iċċekkjati ftit fuq GPU vera (WebGPU u WebGL2 fuq l-istess karta), inkluż sħana moħbija wara xkaff.
- Bid-dejta mgħobbija t-tiles jinbnew fuq il-pjan tad-dejta; dejta mgħobbija wara fuq pjan ieħor tibni mill-ġdid it-tiles hemm (mill-cache).
- Imkejjel fuq titjiriet sintetiċi fuq tliet postijiet (Normandy, Nevada, Syria): madwar 63, 45 u 24 MB fl-ewwel żjara b'immaġini; it-tieni żjara ma tniżżel xejn.

## Dak li jinbena {#what-is-built}

| Parti | Sors | Kif |
|---|---|---|
| Immaġini tas-satellita (teatri mixxandrin, fakultattiv) | EOX Sentinel-2 cloudless 2016 | **Immaġini tas-satellita** jgħatti l-art bil-mużajk tal-2016 bla sħab (madwar 10 m kull pixel, zoom 14, tile iktar fond jikber) minflok il-kopertura tal-art miżbugħa; it-toroq, il-pisti, il-binjiet u l-ismijiet jibqgħu fuq quddiem. |
| Immaġini aktar fini (l-Istati Uniti, Franza) | USGS National Map orthoimagery; IGN BD ORTHO | Bl-**Immaġini tas-satellita** mixgħula, tile tal-mappa minn zoom 13 li jinsab kompletament fl-Istati Uniti kontinentali jew Franza metropolitana, jieħu minflok l-ortofoto nazzjonali, żewġ zooms aktar fond mit-tile (sittax minn it-tiles tagħha mqiegħda f'xbieha waħda, madwar 1-2 m kull pixel mill-qrib). EOX kullimkien l-ieħor. |
| Art (teatri mixxandrin) | Mapterhorn | Copernicus GLO-30 kullimkien (madwar 19 m kull pixel fi zoom 12), skala ta' metri fejn ikun hemm il-ħarsa tal-pajjiż stess (Franza, l-Istati Uniti u oħrajn); mqrija żewġ zooms iktar bil-mod minn kull tile. L-AWS Terrain Tiles jekk Mapterhorn ma jilħaqx. |
| Art | AWS Terrain Tiles (Terrarium PNG) | grilja ta' għoli fuq il-kaxxa: iz-zoom hu l-iktar profond sa 12 (madwar 28 m kull pixel f'43° N) li jeħtieġ mill-iktar 36 tile, u l-grilja tinqatta' sa mill-iktar 400,000 vertiċi. Impinġi bħala art bl-indikaturi tal-medda tas-soltu. |
| Toroq, linji tal-ferrovija | tiles vettorjali ta' OpenFreeMap, is-saff `transportation` | xtajjar ċatti mdendla fuq l-art, imwessgħin għad-distanza tal-art u mtellgħa ftit fil-mija minnha sabiex ma jiggliterixxux maġenbha. Wisgħat skont it-tip, minn 16 m (awtostrada) sa 3 m (track, ferrovija); qatt aktar dojoq mid-dijagonali tal-kaxxa / 5000. Mogħdijiet, ferries u mini ma jitħallewx. |
| Bażijiet tal-ajru | is-saff `aeroway` | poligoni ta' pista, taxiway, apron u helipad mdendla bħala art; linji tal-pista u tat-taxiway bħala xtajjar ta' 45 m u 18 m. |
| Ilma | is-saff `water` | il-baħar ċatt fuq 0 m, għadajjar u għadajjar żgħar ċatti fl-iktar xatt baxx tagħhom, xmajjar mdendla. Impinġi bħala ilma: dawl ċatt, ebda kontorn. |
| Kopertura tal-art | is-saffi `landcover` u `landuse` | mħabba fuq il-vertiċi stess tal-art, mingħajr triangoli żejda: foresti, ħaxix u parks ħodor, għelieqi tal-qamħ isfar, art mxarrba, ramel, blat, silġ; żoni residenzjali, industrijali, kummerċjali, militari u ta' ħofor f'toni maħmuġa. L-ilma jinbeda wkoll taħt il-wiċċ tal-ilma, sabiex ix-xatt jinqara minn kull għoli. L-art maħlula tieħu tinta ħafifa ta' għoli (griż-aħdar tal-biċċa l-baxxa, kannella fl-għoljiet, silġ fuq 3,000 m). Jinqara fir-riżoluzzjoni tal-art: madwar 30-45 m fiż-żona dettaljata, kilometri fit-teatru. |
| Ismijiet tal-postijiet | is-saffi `place` u `aerodrome_label` | bliet, ibliet u rħula, u bażijiet tal-ajru bil-kodiċi ICAO tagħhom, miktuba fuq il-view; kemm jidhru kull tip jikber mal-għoli tal-kamera, sa 70 f'daqqa. |
| Pisti mqisa | [OurAirports](https://ourairports.com/data/) `runways.csv` (dominju pubbliku) | fakultattiv (**Pisti minn OurAirports**, mixgħul b'default): kull pista miftuħa bi tmiem it-tnejn fil-lista, minn threshold għal threshold bil-wisa' elenkat, b'strixxi tal-ġenb, linja ċentrali mtaqqba u barrili tal-threshold. Lista waħda ta' 4 MB, niżżlet darba u miżmuma fil-cache. |
| Bini | is-saff `building` | footprints mgħollija minn `render_min_height` sa `render_height` (6 m meta jonqos) fuq l-iktar art baxxa taħthom; partijiet `hide_3d` jitħallew barra. Impinġi bħala strutturi. |

Tiles vettorjali jinqraw f'zoom 14 (l-unika zoom bil-bini) meta ż-żona tkun teħtieġ mill-iktar 300 minnhom, inkella fl-iktar zoom profond li jeħtieġ, sa 8. Żona akbar tieħu l-art biss.

### Aspett {#look}

Isfond jibda bl-**Uri l-kulur mqabbad** mixgħul - il-kulur hu dak li jgħid triq ċara minn art griża fuqha, pista skura minn l-apron tagħha - bit-tarf tat-triangoli tal-art mitfi, b'kontorni ħfief, il-baħar opak (art taħtu tqabbad mal-wiċċ għal fond 'il bogħod), u binjiet griż ċar u kważi solidi, kif jiddisinjahom mappa. Il-baħar miftuħ ma jieħu l-ebda triangolu tal-art. Kull ma hu ieħor hu l-aspett default ta' livell ta' mudell.

## Krediti fuq it-tela {#credits-on-the-canvas}

Filwaqt li isfond ikun il-livell, il-krediti tas-sorsi jinkitbu fil-kantuna t'isfel tal-lemin tal-view, mingħajr ma tikklikkja, sabiex l-istampi u l-vidjows imqabbda jkollhom magħhom:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Elevation: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; and others

Kull parti tgħaqqad mal-paġna ta' attribuzzjoni tas-sors tagħha (openstreetmap.org/copyright u l-[lista ta' attribuzzjoni](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) tal-Terrain Tiles). Isfond mħażen fil-librerija jżomm il-krediti tiegħu u juriehom mill-ġdid meta jitgħabba. It-test jiġi tradott mal-viewer; l-ismijiet le.

## Sorsi u t-termini tagħhom {#sources-and-their-terms}

Kull sors, il-liċenzja tiegħu u kif l-isfond jibqa' fil-limiti tat-termini: [Isfond tad-dinja: sorsi u termini](world-backdrop-sources.md).

## Il-cache tat-tiles {#the-tile-cache}

Kull tile, u t-TileJSON tat-tiles vettorjali, jinżamm fil-Cache API tal-browser taħt `3dheat-world-tiles-v1`, skont l-URL. It-tieni bini tal-istess żona ma jagħmel l-ebda talba u jaħdem offline: it-TileJSON jintalab l-ewwel u, meta jfalli, il-kopja tiegħu fil-cache tgħid liema tiles diġà hemm. Tiles li s-server ma għandux (il-baħar miftuħ, 404) jinftakru bħala nieqsa wkoll.

L-URLs tat-tiles vettorjali jġorru d-data tal-bini tal-mappa, għalhekk wara li OpenFreeMap joħroġ bini ġdid, l-isfond li jmiss jniżżel tiles ġodda u dawk il-qodma jibqgħu sa ma jitnaddfu. Il-cache tinżamm sa 2 GB: meta jaqbeż dan, jitneħħew l-ewwel il-tiles li ilhom maħżuna l-iktar. **Insa l-madum tal-mappa** jneħħi l-cache kollha. Il-cache teħtieġ oriġini sigura (`https://` jew `localhost`); f'postijiet oħra kull bini jerġa' jniżżel.

## Mqabbel ma' Tacview {#compared-with-tacview}

Iċċekkjat bl-għajn fuq post wieħed għal kull teatru, b'rekordings sintetiċi: it-tlaq mill-art tal-pisti jaqa' fuq il-linji ċentrali tal-pisti mpinġija, il-qsim tal-kosta jaqa' fuq il-kosta. In-naħa ta' Tacview hi mid-dokumentazzjoni tagħha u mill-istampi tagħha ppubblikati (tacview.net, il-paġna tagħha fuq Steam), mhux minn tħaddim tagħha hawn.

| | Tacview 1.9 | dan l-isfond, miksub |
|---|---|---|
| Firxa | id-dinja kollha | 1,500 km madwar il-kamera, kull fejn tkun |
| Art | ETOPO1 (madwar 1.25 km) miġbura ġewwa; SRTM 25-75 m jekk l-utent jinstalla l-fajls; art ta' DCS esportata minn DCS | Copernicus GLO-30 (Mapterhorn), skala ta' metri fi Franza u l-Istati Uniti |
| Immaġini | ebda waħda miġbura ġewwa; teksturi li l-utent jniżżel (Mapview, SAS Planet, add-ons bħal chart VFR tal-Caucasus) | EOX Sentinel-2 cloudless 2016, madwar 10 m, miksub |
| Kopertura tal-art | xejn, sakemm ma tkunx fi tekstura | minn OpenStreetMap, miżbugħa fuq l-art (mingħajr immaġini) |
| Toroq, linji tal-ferrovija | xejn, sakemm ma tkunx fi tekstura | kull klassi ħdejn il-kamera, toroq ewlenin 'il bogħod |
| Bini | xejn | footprints mgħollija ħdejn il-kamera |
| Bażijiet tal-ajru | tikketti u pisti bħala kaxxi ċatti, mingħajr markings | pisti minn truf miksuba b'strixxi tal-ġenb, linja ċentrali u barrili tal-threshold; taxiways, aprons; ismijiet bil-kodiċi ICAO |
| Ismijiet tal-postijiet | xi tikketti ta' rħula u bliet | bliet, ibliet, rħula, bażijiet tal-ajru, skont il-bogħod u l-għoli |

Fejn għadu jaqa' qasir:

- **Riżoluzzjoni tal-immaġni**: barra mill-Istati Uniti u Franza il-mużajk tas-satellita ta' 10 m hu frisk taħt madwar 2 km; Tacview b'tekstura ta' zoom-17 installata mill-utent hi aktar ċara hemm.
- **Art fl-forma ta' DCS stess**: Tacview jista' juri l-art li DCS innifsu jesporta; hawnhekk hi d-dinja reali, li tiddiffrixxi mill-art ta' DCS fejn il-mudellaturi tal-mappa biddlu xi ħaġa.
- **Il-kurvatura**: l-art hi pjan ċatt, għalhekk l-orizzont m'huwiex ta' dinja kurva; Tacview juri sfera.
- **Veloċità**: l-ewwel żjara f'post tniżżel għexieren ta' megabytes qabel ma tiġi ċara; f'browser b'software rendering (l-istampi) jinżamm bi ftit frames kull sekonda b'bosta mijiet ta' tiles.

## Limiti u dak li ġej {#limits-and-what-comes-later}

- **Riżoluzzjoni tal-art**: madwar 30 m fl-aħjar, u iktar bil-mod f'żoni kbar. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFFs fuq AWS, mingħajr ċavetta, test ta' kreditu fiss) hu sors aħjar: 30 m kullimkien, GLO-90 fejn GLO-30 għandu toqob (l-Armenja u l-Azerbaiġan, li DCS Caucasus jkopri). Jeħtieġ qarrej ta' GeoTIFF u għadu ma jintużax.
- **Art aħjar**: Copernicus GLO-30 fuq AWS ma jibgħatx headers ta' CORS, għalhekk browser ma jistax jaqrah; il-mirror ta' OpenTopography jinqara (CORS u ranges), imma t-termini tagħhom għal użu ta' runtime ta' app pubblika mhumiex magħrufa - għandhom jiġu mistaqsija qabel kull użu. Mapterhorn diġà fih GLO-30.
- **Kurvatura**: l-art hi pjan ċatt u l-għoljiet ma jinżlux għall-kurvatura tad-dinja, skont kif jitqiegħdu r-rekordings (l-altitudni bħala għoli); lil hinn mir-referenza it-tnejn jaqsmu flimkien, b'inqas minn parti f'elf f'100 km. Li titgħawweġ it-tiles biss tqatta'hom mid-dejta 'l bogħod, għalhekk ma tingħatax. Orizzont kurv jeħtieġ l-istess tnaqqis - id-distanza mill-kamera kwadru fuq darbtejn ir-raġġ tad-dinja - applikat f'kull passaġġ li jpinġi pożizzjoni (livell, tiles, sħana, linji, kaxxi, tikketti, l-għażla) bħala uniform wieħed komuni; mudell sferiku jeħtieġ pożizzjonijiet ċentrati fid-dinja għad-dejta wkoll u rendering relattiv għall-kamera. It-tnejn huma ppjanati mal-mod tal-globu.
- **Dinja tal-preżent biss**: il-mapep storiċi ta' DCS u IL-2 (Normandy 2, The Channel, Germany Cold War, kull mappa ta' IL-2) jinbnew bil-bliet, it-toroq u x-xtut tal-lum; il-panew jgħid dan. Bażijiet tal-ajru tal-perjodu ma jinbnewx.
- **Mhux mod globu**: isfond hu pjan lokali ċatt. Veduta tad-dinja kollha hi ppjanata.
- It-toroq jitwessgħu f'żoni kbar sabiex jibqgħu viżibbli; mill-qrib jidhru usa' minn ħajja.
- Ismijiet tat-teatri tad-DCS fit-tabelli tal-Watcher jitqabblu kif jagħtihom DCS fil-`mission.theatre`; isem mhux fil-lista jerġa' lura għall-ewwel fix imdawwar għal gradi sħaħ, u għal latitudni u longitudni biss.

## Mapep storiċi (għadhom mhux mibnija) {#historical-maps-not-built-yet}

Mapep tal-perjodu jistgħu jagħtu t-teksturi lit-teatri storiċi iktar tard. Is-serje tal-Army Map Service (AMS) tal-Istati Uniti huma xogħlijiet tal-gvern federali tal-Istati Uniti, ġeneralment ikkunsidrati dominju pubbliku (iċċekkja r-rekord ta' kull skan; ħafna huma ripetizzjonijiet ta' oriġinali GSGS Brittaniċi jew Ġermaniżi, li d-dritt tal-Kuruna jew it-terminu tax-xogħol anonimu tagħhom ukoll għadda):

| Teatru | Serje | Fejn ġie skannjat |
|---|---|---|
| IL-2 Stalingrad, Moscow, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, Eastern Europe 1:250,000 (magħmul fis-snin 1950 minn mapep Sovjetiċi u Ġermaniżi) | UT Austin PCL; xi folji ġew georeferenced fi UT GeoData |
| IL-2 Normandy, DCS Normandy 2 u The Channel | AMS **M661** / GSGS 4250, France 1:50,000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250,000 u **M841** 1:25,000 (il-Ġermanja) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50,000 (edizzjonijiet tal-1951) u **L552** 1:250,000 | ANU Open Research (folji L751, "copyright expired"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | mapep Brittaniċi tal-Ewwel Gwerra (mhux AMS) | McMaster University; National Library of Scotland (termini mhux kummerċjali) |

Il-folji ta' AMS jġorru tikek ta' latitudni u longitudni fil-kantunieri tagħhom, għalhekk kull wieħed jitpoġġa b'fit ta' erba' kantunieri u jinxtered fuq l-art bħala tekstura, inbena u miżmum lokalment bħat-tiles.

## Għall-iżviluppaturi {#for-developers}

### Id-dħul `geo` f'tabella Parquet {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` u `up` jgħidu liema kolonni fihom il-metri tal-lvant u tat-tramuntana fuq l-istess pjan tanġenti f'(`lat0`, `lon0`) u l-altitudni. It-tagħbija tgħaddi r-referenza meta t-tqabbil tagħha jieħu eżattament dawk il-kolonni (il-lvant bħala X, it-tramuntana u l-għoli bħala Y u Z b'kull mod). Id-dħul fakultattiv `dcs` isemmi l-metri proprji ta' tabella ta' DCS (x tramuntana, y fuq, z lvant) u t-teatru tagħha: tagħbija li tqabbel dawk il-kolonni titqiegħed minflok permezz tal-proġezzjoni transverse Mercator tat-teatru ([koordinati ta' DCS](#dcs-coordinates)). Tabella mingħajr `geo` taqra kif kienet qabel.

### Koordinati ta' DCS {#dcs-coordinates}

Kull teatru ta' DCS hu proġezzjoni Transverse Mercator (WGS84, skala 0.9996) bil-meridjan ċentrali u l-oriġini falza proprja tiegħu, bl-x ta' DCS bħala n-northing u z bħala l-easting. Il-kostanti huma dawk li l-proġett pydcs jippubblika; il-matematika hi s-serje ta' Krüger sa is-sitt ordni (Karney 2011), mittiefsa f'[`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Isfond għal metri ta' DCS jinbena dritt fihom, sabiex tabella ta' Watcher għal DCS immappjata b'`dcs_x`/`dcs_y`/`dcs_z`, livell li l-konvertitur tal-art ta' DCS kiteb u l-isfond jaqsmu kollha qafas wieħed. Il-kostanti ta' Iraq mhumiex ippubblikati; huma mqabbla ma' punti ta' referenza ppubblikati (4 cm root mean square).

It-tabelli ta' DCS tal-Watcher jinsabu fuq pjan tanġenti fil-punt ta' referenza fiss tat-teatru (l-istess punt li l-għażla tat-teatru tuża, hawn taħt), sabiex diversi missjonijiet fuq teatru wieħed jingħaqdu bir-referenza tagħhom intatta u jitqabblu ma' isfond tat-teatru mingħajr ma jitmexxa.

### Sempliċità u baġit {#simplification-and-budget}

- Bini taħt 20 m² jitneħħa; 60 m² meta l-kaxxa tkun aktar minn 30 km wiesgħa, 150 m² lil hinn minn 80 km. Il-bqija jiżdiedu l-ikbar l-ewwel sa ma l-bini jilħaq 1.5M triangolu.
- It-toroq minuri, it-toroq tas-servizz u t-traċċi jitneħħew lil hinn minn 60 km wiesgħa; lil hinn minn 150 km jibqgħu biss l-awtostradi, il-trunk, il-primarji u s-sekondarji.
- L-isfond kollu jibqa' taħt madwar 3M triangolu. In-nota tal-importazzjoni tgħid kemm bini tħalla barra.
