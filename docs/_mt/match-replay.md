---
title: "Replay tal-partita"
nav_order: 9
has_children: true
lang: "mt"
source: "match-replay.md"
source_hash: "9d61f24a5a04"
translated: true
outdated: false
---

# Replay tal-partita

Ir-replay hu film tal-partita fejn kull plejer jinżel bħala l-ħaġa li kien isuq. Uża dan biex terġa' tara ġlieda, issegwi unità waħda u tara min laqat lil min.

Tiri, laqtiet, nirien u wrecks jinżlu fuq l-unitajiet u fuq l-għanijiet fuq il-livell. Kameras, tikketti u wiri taktiku jgħinuk taqra l-ġlieda. Taf Tacview? [Ekwivalenza ma' Tacview](tacview-parity.md) turi fejn hu kull għodda tagħha.

![Replay tal-figuri tad-demo tat-tanks: tanks bħala l-figuri tagħhom stess, b'tikketti ta' isem, vettura u veloċità](../assets/img/en/replay-overview.webp)

## Ibda replay {#start-a-replay}

1. Tella' reġistrazzjoni b'**Sors → Fajls…** jew billi tgħaddiha fuq il-pannell Sors (kwalunkwe tabella b'kolonna ta' **persuna** u **ħin**, fajl Tacview, replay konvertit, partita [`.3dheat`](container.md)). Ara [Kif tidħol id-data](getting-data-in.md).
2. Iftaħ it-tab **Partita** u agħżel **Replay bil-figuri**, jew agħżel **Figuri fuq xulxin** fil-bar tal-modalitajiet tat-tab Heatmap.
3. Taħt **Partiti fir-replay** agħżel partita waħda, kollha f'daqqa, jew diversi.
4. Agħfas **Ħaddem** fuq il-linja taż-żmien (jew `K`). Iġbed il-linja taż-żmien biex timxi għal post ieħor.

Figuri jieħdu post il-kaxxi għal kull unità li l-isem jew it-tip tagħha huwa magħruf (ara [Figuri](figures.md)). Data mingħajr kolonna ta' isem jew tip tinżel bħala suldati.

![It-tab Partita: l-għażla tal-partiti, it-taqsima Figuri, il-veduti tal-kamera, Ħaddem u l-lista tal-avvenimenti](../assets/img/en/match-replay-tab.webp)

## Figuri {#figures}

![Tank jaħraq fil-kamera ta' orbita, bil-laqta li laqtu](../assets/img/en/replay-tanks.webp)

| Setting (taqsima **Figuri**) | Bażi | X'jagħmel |
|---|---|---|
| **Figuri minflok kaxxi** | fuq | Mitfi jpinġi kaxxi sempliċi. |
| **Daqs tal-figuri** (darbiet id-daqs veru) | 1 | 1 hu d-daqs veru; 0.25 sa 20 darba (skala logaritmika). Iktar kbir jgħin minn 'l bogħod. |
| **L-iżgħar figura fuq l-iskrin** | 36 px | Figuri 'l bogħod jikbru biex jibqgħu daqshekk twal, 0 sa 200 px; 0 iżomm id-daqs veru. |
| **Mill-bogħod**: Figura, Vleġġa, Simbolu | Figura | X'isir unità 'l bogħod. |
| **Simboli** | NATO (APP-6) | NATO (APP-6), sinjali tattiċi Russi, ikoni tal-**mappa tal-logħba**, jew **Forom biss (għal min ma jarax il-kuluri)**. |
| **Daqs tas-simbolu**, **In-naħa tiegħi**, **Ostili / Newtrali**, **Marki tad-direzzjoni** | 28 px (12 sa 64), awtomatiku, ostili, fuq | Kif jidhru s-simboli u liema naħa hi ħabiba. |
| **Linji vertikali** | fuq | Linja minn kull unità 'l isfel sal-art, sabiex l-għoljiet jinqraw fit-3D. |
| **Linji vertikali u tikketti fuq l-armi** | mitfi | Linji sal-art u tikketti fuq missili u bombi. |
| **Nirien fuq l-unitajiet** | fuq | Fjammi mill-mument li unità tinqabad bin-nar sakemm jintfew. |
| **Laqtiet fuq l-unitajiet** | fuq | Marki fejn ġew imlaqqta t-tiri (hawn taħt). **Il-laqtiet jibqgħu**: 1 sa 300 sekonda, jew **Il-ħajja kollha**. **Markaturi jżommu f'wiċċ l-arja**: markaturi mpinġija 'l fuq mill-wiċċ. |
| **Linji tal-ħarsa u tat-turretta** | mitfi | Mtaqqba: fejn jħares il-plejer; sħiħa: fejn jimmira l-kanun. |
| **Bini** | sod | Bini sod jew trasparenti, meta l-livell jipinġih. |

### Simboli minn 'l bogħod {#symbols-at-a-distance}

Meta unità tkun iżgħar mill-**L-iżgħar figura fuq l-iskrin**, tista' ssir simbolu li jibqa' jinqara. Il-forma turi t-tip (pereżempju kaxxa b'qawsa u marka tar-roti għal armatura); il-kulur juri n-naħa. Iftaħ il-menu **Simboli** biex tbiddel l-istil.

![L-istess sitt unitajiet bħala simboli NATO, sinjali tattiċi Russi, ikoni tal-mappa tal-logħba u forom biss](../assets/img/en/match-replay-symbols-styles.webp)

### Marki tal-laqtiet, wrecks u nirien {#hit-marks-wrecks-and-fires}

- **Marki tal-laqtiet** jinsabu fuq il-wiċċ fejn laqat it-tir, fid-daqs tal-figura. L-aspett tagħhom juri x'ġara: toqba (għadda), splużjoni ċara (ma għaddiex), ħakk (indaqq), stilla tal-fwied (proġettil splussiv). Ċirku kulurat juri x'għamel: tir li qatel, modulu meqrud, kritiku, sever, dannu, ebda dannu, laqta. Għalli bil-mouse fuq marka biex tara l-isem tal-proġettil.
- Unità meqruda tinżel **maħruqa** bħala wreck mill-mewt tagħha sakemm terġa' tinbeda jew titneħħa; is-simbolu tagħha jkun imħassar.
- **Nirien** jidhru fuq unità mill-mument li tinqabad bin-nar sakemm jintfew.
- **Torretti** jduru lejn fejn juri d-data li jimmira l-kanun (jew, mingħajr dik, fejn jħares il-plejer).

### Armi, decoys u traċċanti {#weapons-decoys-and-tracers}

Bl-**Armi, tiri u laqtiet** mixgħul (taqsima Viewer tat-timijiet): missili, rockets, bombi u torpedoes jitħaddmu bħala figuri tagħhom stess b'traċċa tad-duħħan; balal u qxur huma traċċanti; l-impatti u l-splużjonijiet jiddu. Traċċant impinġi **mtaqqab** inħadem minn laqta, għax id-data ma kellhiex it-tir. Flares u chaff jinżlu bħala decoys; huma moħbija mil-lista tal-unitajiet sakemm ma tkunx imqiegħda *Decoys u qxur*.

## Kameras {#cameras}

Ikklikkja unità jew it-tikketta tagħha biex **issegwiha**; it-taqsima **Replay** toffri **Wara**, **Orbita**, **Kokpit** (bil-wiri head-up, `H`), **Fissa**, **Padlock**, **Mira** u **Satellita**. `V` iduru bejniethom, **Distanza tal-kamera** tgħid kemm 'il bogħod. Esc jieqaf.

- **Veduta ta' żewġ unitajiet**: agħżel **Mira** (jew Ctrl/Alt-ikklikkja unità) biex tarha minn dik issegwita; **Biddel** iqallibhom.
- **Kejl**: Shift-ikklikkja żewġ unitajiet għall-azimut, il-medda u d-differenza tal-għoli bejniethom.
- **Mappa 2D** (`M`): veduta f'kantuniera jew sħiħa, bit-traċċi u l-ismijiet.
- **Markaturi** (`B`): jisalvaw il-mument u l-kamera; il-kills, il-mwiet u l-markaturi tar-reġistrazzjoni nnifisha jinġabru wkoll.
- **Avvenimenti**: kull avveniment f'ordni taż-żmien; klikk imexxi hemm. `Page Up` / `Page Down` jimxu bejn l-avvenimenti; **Waqfa f'avveniment** jieqaf f'kull wieħed.

## Wiri taktiku {#tactical-display}

![Il-ġlieda tal-ajru demo bil-look tal-wiri taktiku (T): art bil-wire-frame, pannelli ta' kills u avvenimenti](../assets/img/en/replay-air-tactical.webp)

It-taqsima **Wiri taktiku** tpinġi, għal ebda unità, dawk magħżula, dawk kollha, jew tip wieħed (inġenji tal-ajru, art, bastimenti, armi): vetturi tal-veloċità u t-triq 'il quddiem, linji tal-imnieħer u tal-ġarr, koni tar-radar, lock-ons, data links, żoni u linji ta' ingaġġ, linji tal-ħarsa, fejn jħarsu l-plejers (koni tal-veduta), il-ħarsa tat-turretta, u l-kamera rrekordjata.

### Stil tal-wiri {#display-style}

`T` (jew il-bidla **Uri bħala wiri taktiku**) ibiddel il-look għal stil ta' skrin tar-radar: dwal, kontorni, linji ta' kontorn, griglja tal-kejl, linji tal-iskann, ċrieki tal-medda, skali tal-għoli, pannelli bil-kills u avvenimenti, u **Direttur** li jmexxi l-kamera għall-avvenimenti minnu nnifsu.

![L-istess ġlieda tal-ajru fil-look normali](../assets/img/en/replay-air.webp)

## Għanijiet {#objectives}

Meta partita tiġi bl-għanijiet tagħha, it-taqsima **Għanijiet** tpinġihom fuq il-livell: żoni ta' kaptura (bis-sid u l-progress tal-kaptura), spawns, ajruporti, żoni u mmirar tal-bombi, kull saff jista' jintfa', bit-tikketti. Jidhru minn taħt l-art. Meta jkunu mgħobbija diversi modalitajiet tal-logħba, **Modalità** tiffiltra l-partiti skont il-modalità. L-għanijiet ġejjin mill-fajl tal-partita tal-konvertitur ħdejn ir-reġistrazzjoni jew ġewwa kontenitur [`.3dheat`](container.md).

## Tikketti u statistika {#labels-and-statistics}

- **Tikketti**: regoli għal kull tip (**Magħżula**, **Inġenji tal-ajru**, **Art**, **Vapuri**, **Armi**, **AI**): jidhru jew le, liema valuri, u **Prijorità** għal min jieħu l-post meta t-tikketti jaqgħu fuq xulxin. **Żomm it-tikketti 'l bogħod minn xulxin** iġib tikketta ħdejn l-unità tagħha meta tkun se tkopri unità oħra, u titneħħa fejn ma jkunx hemm post. **Daqs tat-tikketti** hu 60 sa 250 %. **Lura għal isem, vettura, għoli u veloċità** jirrisettja r-regoli.
  - Unitajiet tal-art jibdew bl-isem, il-vettura u l-veloċità.
  - Inġenji tal-ajru jibdew bl-isem, il-vettura, l-għoli u l-veloċità.
  - Bastimenti jibdew bl-isem, il-vettura, il-veloċità u d-direzzjoni.
  - Għalli bil-mouse fuq unità biex tara kull valur li għandha.
- **Statistika**: kull tim u unità: kills, mwiet, tiri, laqtiet, proporzjon tal-laqtiet, tlugħ, nżul, ħin fl-ajru, l-ogħla veloċità, għoli u G, distanza. Esportazzjoni CSV.
- **Grafiċi**: il-valuri ta' unità maż-żmien, żewġ unitajiet imqabbla, jew valur wieħed kontra ieħor.

## Ħafna partiti f'daqqa {#many-matches-at-once}

Biex tqiegħed mijiet jew eluf ta' partiti fuq xulxin, ara [Ħafna partiti f'daqqa](many-matches.md). Dettalji tal-figuri (duħħan, nar, effetti oħra bil-ħin): [Effetti fuq il-figuri](figure-replay.md). Lista tal-funzjonijiet ta' Tacview: [Ekwivalenza ma' Tacview](tacview-parity.md), paġna ta' dan.
