---
title: "Ekwivalenza ma' Tacview"
parent: "Replay tal-partita"
grand_parent: "Replay"
nav_order: 1
lang: "mt"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Ekwivalenza ma' Tacview

Tacview huwa programm popolari biex tara reġistrazzjonijiet tat-titjir. Jekk tafu, din il-paġna turi fejn hemm kull wieħed mill-għodod tiegħu f'3DHeat.

Tilista kull karatteristika ta' Tacview 1.9 (il-manwal tiegħu, it-tabella tal-kliem tal-interface tiegħu u l-format tal-fajl ACMI 2.2) u fejn tinsab il-[replay tal-partita](match-replay.md) ta' 3DHeat rigward kull waħda. L-għan: dak li Tacview jista' jagħmel għal replay u d-dejta tiegħu, 3DHeat jista' jagħmlu wkoll.

**Status:**
- **lest**: diġà fi 3DHeat.
- **ġdid**: maħdum biex jaqbel ma' karatteristika ta' Tacview.
- **għadu**: japplika, imma għadu ma nbnax.
- **m'huwiex applikabbli**: ma japplikax hawn, bir-raġuni miktuba.

Fejn issib il-karatteristiċi: it-tab **Partita**, **Replay bil-figuri** (jew **Figuri fuq xulxin** fit-tab Heatmap), fit-taqsimiet tal-iskrin tal-ġenb **Replay**, **Unitajiet**, **Avvenimenti**, **Markaturi**, **Wiri tattiku**, **Statistika**, **Ċaqliq tal-ħin u qtugħ**, **Mappa u pożizzjoni**, **Awdjo u vidjo** u **Tikketti**. Ara [Replay tal-partita](match-replay.md).

## Kameras {#cameras}

| Tacview | 3DHeat | Status |
|---|---|---|
| Veduta mill-kokpit (F5), l-orizzont jaqlab mal-inġenju | **Kokpit**: barra mill-unità tul l-attitudni tagħha, kif jaħdem il-mudell tal-moviment. Il-figura tal-unità stess tiġi maqtugħa 'l barra. Iġbed biex tħares madwar; **Ħares 'il quddiem mill-ġdid** ierġa' jpoġġi lura. | ġdid |
| HUD fil-veduta mill-kokpit (għażla IAS/CAS/TAS) | **Skrin head-up** (H): l-orizzont u l-iskala tal-pitch tal-veduta attwali, marker tat-triq tat-titjir, nastru tad-direzzjoni, IAS, għoli, TAS, Mach, G, angolu ta' attakk, veloċità vertikali, AGL | ġdid |
| Strumenti 3D tal-kokpit, tracking tar-ras tal-pilota (PilotHead*), TrackIR | L-ebda mudelli tal-kokpit; l-angoli tar-ras jidhru fil-veduta **Mhux ipproċessat** tal-karta tal-unità | m'huwiex applikabbli (l-ebda mudelli tal-kokpit; it-tracking tar-ras huwa hardware għat-titjir live) |
| Veduta esterna (F6): iddawwar madwar l-oġġett prinċipali | **Wara** (iduru mal-unità) u **Orbita** (iżommu d-direzzjoni tagħhom) | lest |
| Kamera dogfight, "Ħares lejn il-mira" (padlock) | **Padlock**: mill-kokpit, miżmuma fuq il-mira | ġdid |
| Kamera dogfight, "Ċentrata" / "Ħares 'il quddiem" | **Mira**: wara l-unità fuq il-linja mill-mira, tħares 'il quddiem lejn il-mira. **Fissa** fl-azimut 0 tħares 'il quddiem minn quddiem. | ġdid |
| Biddel primarju u sekondarju | **Biddel** ħdejn il-mira | ġdid |
| Veduta satellitari (F7), mill-fuq ortografika | **Satellita**: direttament 'il isfel fuq l-unità, it-tramuntana fuq; iġbed biex iduru. Il-mappa 2D hija l-pjan ortografiku. | ġdid |
| Kamera ħielsa (F8), W/A/S/D, E/C | Il-kamera ħielsa tat-titjir (W/A/S/D, Space/Q, Shift/Alt) | lest |
| Kamera tal-add-on Head-On; kamera esterna marbuta mal-oġġett | **Fissa**: post madwar l-unità li jduru u jdawru magħha; iġbed biex tmexxih (wara, f'nofs ġewwieħ, head-on) | ġdid |
| Kamera tal-add-on Lock (iffriżża l-pożizzjoni) | Ieqaf issegwi (Esc): il-kamera tibqa' fejn kienet | lest |
| Veduta strateġika (tkabbar 'il barra għad-dinja kollha) | [Sfond tad-dinja](world-backdrop.md) u l-qafas tal-mappa 2D tar-reġistrazzjoni kollha | lest |
| Issettjar tal-field of view | **Kamera u xena** FOV | lest |
| Iddawwar il-veduti bi tasti | **V** il-veduta li jmiss, **Shift+V** lura | ġdid |

## Opzjonijiet tal-veduta 3D u l-wiri {#d-view-and-display-options}

| Tacview | 3DHeat | Status |
|---|---|---|
| Traċċi tar-ribbon, slider tat-tul | Traċċi (sekondi) fil-wiri tat-tim | lest |
| Traċċa mistennija (mogħdija 'l quddiem) | **Mogħdija 'l quddiem**: fejn l-unità verament tmur fis-sekondi li ġejjin | ġdid |
| Linji tal-għoli tal-oġġett / ħitan | **Linji vertikali** | lest (linji; il-ħitan ma nbnewx) |
| Vetturi tal-oġġett magħżul: direzzjoni (imqatta'), rotta (sħiħa), lift | **Vetturi tal-veloċità** (rotta u veloċità għal tant sekondi, b'nasiħa) u **Linji tal-imnieħer u tal-lift** (imnieħer imqatta', lift qasir u skur) | ġdid |
| Linja tal-vista tal-pilota | **Linja tal-vista tal-pilota**: linja ċjana mqatta' tul PilotHeadYaw/PilotHeadPitch (jew kolonna HeadYaw, ViewYaw jew LookYaw) kontra l-assi tal-unità | ġdid |
| Qubbiet tal-firxa letali tas-SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, "2" t'ta' l-istess) | **Żoni ta' ingaġġ**: qubbiet, ovojdi fejn il-firxa vertikali tinbidel, mitfija waqt li EngagementMode huwa 0 | ġdid |
| Lokkijiet tar-radar (LockedTarget..9) b'tikketti | **Lokkijiet**: linji ħomor għal kull oġġett imsakkar; ambra mqatta' lejn FocusedTarget; tul LockedTargetAzimuth/Elevation/Range fejn ma jkun isemmi l-ebda oġġett. **Tikketti tal-lock**: l-isem u l-firxa tal-mira fuq kull linja tal-lock | ġdid |
| Kun tar-radar (RadarMode, Azimuth, Elevation, Roll, Range, beamwidths) u l-bieb tal-firxa | **Koni tar-radar**: it-truf u l-eqqel tan-nofs tar-raġġ imdawwar bl-azimut, l-elevazzjoni u r-roll kontra l-unità; il-bieb tal-firxa bħala żewġ truf sofor. Mingħajr beamwidths, biss l-assi tar-raġġ. | ġdid |
| Linja tal-vista bejn iż-żewġ oġġetti magħżula (ħadra / ħamra mqatta' meta t-terren jaqta') | Il-linja tal-par immisurat tiddawwar aħmar u mqatta' meta l-livell ikun bejniethom | ġdid |
| Jikber awtomatikament oġġetti 'l bogħod | L-iżgħar figura fuq l-iskrin (pixels) | lest |
| Grilja tal-latitudni/longitudni | **Mappa u pożizzjoni → Grilja**: linji tal-latitudni u l-longitudni fuq l-art taħt il-kamera, f'spazjatura tonda skont l-għoli (10° sa 1'), bi tikketti; jew il-grilja tal-kilometri **MGRS** tal-zona UTM, bil-zona u l-kwadru ta' 100 km muri. Il-grilja tal-mappa 2D tibqa' kif kienet | ġdid |
| Ċrieki tal-bullseye | Ċrieki madwar il-bullseye ta' kull tim fuq il-mappa 2D | ġdid (2D biss) |
| Overlay tal-glideslope | **Glideslopes**: mogħdijiet ta' 3° b'truf ta' skala sħiħa ta' ±0.7° fuq it-tmiem taż-żewġ naħat ta' kull pista ħdejn ir-reġistrazzjoni, mill-limiti u l-għoli mkejla ta' OurAirports (imniżżla darba, miżmuma offline), tikka f'kull mili nawtiku, imsemmija bl-ajruport u l-pista | ġdid |
| Restrizzjonijiet tal-għoli (allarm ta' soffit/art) | **Restrizzjoni tal-altitudni**: art u soffitt; tikketti ta' unitajiet barra jmorru ħomor, u kull qsim (taħt l-art, fuq is-soffitt, lura ġewwa) jitniżżel - kklikk imur hemm u jsegwi l-unità | ġdid |
| Oġġetti mejta griżi, imneħħija wara 15-il minuta | Il-ħajjiet jintemmu mat-traċċa tagħhom; unità mejta tidher iddgħajjfa fil-lista tal-unitajiet | lest |
| Proprjetajiet Visible / Disabled | Juru fil-**Mhux ipproċessat**; xejn ma jinħeba minnhom | għadu |
| Turi l-pożizzjonijiet tal-istick/throttle/pedal | Il-throttle u l-valuri tal-magna f'kampi; l-inputs tal-kontroll fil-**Mhux ipproċessat** | lest (bħala valuri) |
| Kummenti bħala sottotitoli | **Messaġġi bħala sottotitoli** (Tikketti): avvenimenti ACMI Message u Comment, u chat minn kwalunkwe logħba (avvenimenti Chat, Say jew Radio, jew kolonna tal-chat), fil-qiegħ tal-veduta b'min qal dan, għal sitt sekondi | ġdid |
| Wiri tad-data u tal-ħin UTC | Arloġġ tal-linja tal-ħin b'UTC fejn ir-reġistrazzjoni għandha ħin ta' referenza | lest |
| Pożizzjoni tal-mouse lat/long, MGRS, bullseye | Il-kard tal-għażla (ikklikkja punt) jagħti latitudni/longitudni f'gradi, minuti u sekondi u MGRS ħdejn il-metri tad-dinja; bullseye għal kull unità (kamp) | ġdid |
| Logo personalizzat | Mhux maħdum | m'huwiex applikabbli (branding) |
| Mudelli 3D, l-eqreb meta ma jkunx magħruf | Il-katalgu tal-figuri tagħna, l-ekwivalenti l-eqreb, daqs reali | lest |
| Impenji multipli (linji bejn kull par) | **Linji tal-ingaġġ**: minn kull unità fil-kamp għal kull avversarju fil-firxa stabbilita (1-200 km), b'kull firxa tagħha, l-60 par l-eqreb; il-par immisurat kif kien | ġdid |

## Tikketti {#labels}

| Tacview | 3DHeat | Status |
|---|---|---|
| Tikketti on/off, separatament għal oġġetti magħżula u mhux magħżula | **Tikketti** b'regoli għal **Magħżula**, **Inġenji tal-ajru**, **Art**, **Vapuri**, **Armi** u **AI**: murija jew le, valuri tagħhom, prijorità | ġdid |
| Oqsma tat-tikketti: isem, call sign, pilota, veloċitajiet (TAS/CAS/IAS/Mach/GS), għoljiet (ASL/AGL), VS, AOA, AOS, G (vertikali, laterali, longitudinali), rata u raġġ tad-dawran, enerġija, fuel weight/volume/flow, heading/track, roll/pitch, heart rate | Kull valur ta' `fields.ts`: l-istess lista, miżjuda fejn ma tkunx irrekordjata (stimi mmarkati ~). Roll rate u SpO2 biss permezz tal-Mhux ipproċessat. | lest |
| Pożizzjoni tal-bullseye fit-tikketti | Oqsma **Bullseye (rotta / firxa)** | ġdid |
| Devjazzjonijiet tal-ILS, distanza mtajra | Valuri mhux ipproċessati; distanza mtajra fl-istatistika | lest (f'parti) |
| Tneħħi t-telemetrija mhux magħżula mil-lixka | **Żomm it-tikketti 'l bogħod minn xulxin**, imqegħda skont il-prijorità ta' kull regola | lest / ġdid |
| Ittikketta l-oġġetti kollha tal-art / l-theddid biss | Ir-regoli tal-Art u tal-AI | ġdid |
| Skala tat-tikketti | **Daqs tat-tikketti** (60-250%) | ġdid |
| Unitajiet metriċi / imperjali | Metriċi / imperjali | lest (żewġ settings, mhux tmienja) |

## Informazzjoni tal-oġġett u t-telemetrija {#object-info-and-telemetry}

| Tacview | 3DHeat | Status |
|---|---|---|
| Għażla primarja u sekondarja | Ikklikkja isegwi u jagħżel; ikklikkja tnejn bi Shift biex tkejjel; għażla **Mira** | lest / ġdid |
| Firxa / bearing / aspect / closure bejn żewġ oġġetti | Linja BRAA tal-par immisurat; oqsma Range, Bearing, Aspect u Closure mill-unità segwita | lest |
| Bearing relattiv, rata tal-LOS | Oqsma **Bearing relattiv** (minn mnieħer l-unità segwita, L/R) u **Rata tal-linja tal-vista** (°/s) | ġdid |
| Tieqet tat-telemetrija | Il-karta tal-unità u l-karta tal-hover | lest |
| Telemetrija mhux ipproċessata (kull proprjetà rreġistrata, anke dawk mhux magħrufa) | **Mhux ipproċessat** fil-karta tal-unità: kull kolonna fir-ringiel tal-unità kif hemm miktuba | ġdid |
| Lista tal-oġġetti attivi | **Unitajiet**: plejers, AI, armi fl-ajru, dawk ħajjin mdawla | lest |
| Tieqa tal-proprjetajiet tar-reġistrazzjoni (titlu, awtur, briefing...) | Miżmuma bħala l-kolonna RecordingInfo; murija fil-Mhux ipproċessat | lest (l-ebda tieqa) |
| Formati tal-pożizzjoni DMS/MGRS, tramuntana manjetika | **Pożizzjoni (lat / long)** f'DMS u oqsma **MGRS**; qasam **Direzzjoni manjetika**; **Direzzjonijiet manjetiċi** jikteb heading, course u bearing manjetiċi (°M) u juri kompass biż-żewġ tramuntani u l-varjazzjoni - il-World Magnetic Model 2025 (koeffiċjenti tad-dominju pubbliku), imħaddma hawn fil-post u d-data tal-unità | ġdid |

## Grafiċi {#charts}

| Tacview | 3DHeat | Status |
|---|---|---|
| Grafiku ta' oġġett wieħed, sa 4 valuri | **Maż-żmien** (u l-grafiku taħt Replay) | lest |
| Ippjana sa 4 oġġetti f'daqqa | **Qabbel**: valur wieħed ta' sa 8 unitajiet fuq skala waħda | ġdid |
| Valur kontra valur (stil energy-manoeuvrability) | **Valur vs valur**: rata tad-dawran kontra l-veloċità jew kwalunkwe par ieħor, kull unità linja, il-punt attwali tagħha mmarkat | ġdid |
| L-assi X bil-ħin; zoom; ikkontrolla l-ħin mill-grafiku | Ir-rota tikber fil-ħin, id-doppju-klikk jerġa' jissettja, il-klikk imur għall-mument | ġdid |
| L-assi X bid-distanza fl-arja jew fl-art | **Ħin / Distanza fl-arja / Distanza fl-art** fuq il-grafiċi tal-ħin u tal-qabbil; zoom u l-klikk biex tmur jaħdmu l-istess | ġdid |
| Grafiċi ppreżettati (enerġija, aċċelerazzjoni...) | Kull valur jista' jintgħażel (l-għoli tal-enerġija u r-rata tiegħu huma valuri) | lest |

## Statistika, log tat-titjir, avvenimenti {#statistics-flight-log-events}

| Tacview | 3DHeat | Status |
|---|---|---|
| Log tat-titjir: qala' l-art, niżel, sparaw, laqtek, qatlek, ħalla żona | **Statistika** għal kull unità: ħajjiet, qtil, mewt, tiri, laqtiet, proporzjon ta' laqtiet, tlugħ, nżul, ħin fl-ajru, l-akbar G (u l-minimu), l-akbar veloċità, għoli u Mach, distanza. It-tlugħ ġej mill-avvenimenti TakenOff/Landed, OnGround, AGL, jew stima mmarkata ~. | ġdid |
| Add-ons tal-iskor u tar-rapport tal-missjoni | Sommarju għal kull tim u l-aktar qtil; l-iskor tas-sommarju tal-partita stess | ġdid / lest |
| Esporta log tat-titjir bħala XML/CSV | **Esporta CSV** tal-istatistika, u tal-avvenimenti kif jidhru fil-lista | ġdid (CSV biss) |
| Esporta telemetrija CSV f'rata | **Telemetrija tal-unità magħżula**: kull valur, minn 1 sa 20 kull sekonda | ġdid |
| Log ta' avvenimenti, doppju-klikk biex tmur hemm u tagħżel | Lista ta' **Avvenimenti**, imfiltrata skont it-tip u l-unità; klikk jitlaq hemm bit-tajran | lest |
| L-avveniment ta' qabel / ta' wara (Ctrl+←/→) | **Page Up / Page Down** | ġdid |
| Waqfa fuq avveniment | **Waqfa f'avveniment** | ġdid |
| Markaturi tal-linja tal-ħin (rilaxxi, laqtiet, qerda; dik tal-oġġett magħżul fl-blu; markaturi aħmar) | Qtil u mwiet bħala barra ta' densità, dik tal-unità segwita fl-blu, markaturi aħmar; ikklikkja biex tmur | ġdid |
| Neħħi avveniment, qtil-neħħi | Mhux maħdum | m'huwiex applikabbli (l-avvenimenti huma tar-reġistrazzjoni; il-filtri jaħbuhom) |

## Markaturi {#bookmarks}

| Tacview | 3DHeat | Status |
|---|---|---|
| Żid markatur bl-għażla u l-veduta | **Żid markatur** (B): il-mument, il-kamera ħielsa jew l-unità segwita bil-veduta, id-distanza u l-mira tagħha; imsemmi; miżmum f'dan il-browser għal kull reġistrazzjoni | ġdid |
| Neħħi markatur | × fil-lista | ġdid |
| Markaturi fuq il-linja tal-ħin u fil-logs | Marki ħomor; il-lista | ġdid |
| Event=Bookmark fl-ACMI | Imniżżel taħt il-marki tar-reġistrazzjoni, mal-qtil, l-mwiet u l-messaġġi | ġdid |
| Shortcut tal-kopja/paste (aqsam veduta) | **Esporta / Importa** il-markaturi bħala fajl; C jikkopja l-pożizzjoni tal-kamera | ġdid |

## Tħaddim {#playback}

| Tacview | 3DHeat | Status |
|---|---|---|
| Play/pause, għall-bidu, veloċità, iġbed il-linja tal-ħin | Linja tal-ħin | lest |
| Frame b'frame | **,** u **.** sekonda lura u 'l quddiem (Shift: għaxar) | ġdid |
| Tħaddim lura | **◀** fuq il-linja tal-ħin, **J** (**L** 'il quddiem; l-istess buttuna darba oħra tieqaf): jaħdem mit-tmiem lejn il-bidu bil-veloċità magħżula, b'loop jew jieqaf fil-bidu | ġdid |
| Kaxxa tal-qbiż tal-ħin | Il-linja tal-ħin u l-lista tal-avvenimenti | lest |
| Iċċaqlaq oġġett wieħed fil-ħin (ghost) | **Ċaqliq tal-ħin u qtugħ**: iċċaqlaq it-titjir ta' unità waħda, jew ir-reġistrazzjoni kollha, b'tant sekondi; **Allinja r-reġistrazzjonijiet** iċċaqlaq diversi reġistrazzjonijiet biex jibdew flimkien u jitlaqħom f'daqqa (żewġ sorties f'ġranet differenti ħdejn xulxin). Ir-reġistrazzjoni tinbena mill-ġdid, u t-traċċi, l-avvenimenti, il-grafiċi u l-istatistika jsegwuha | ġdid |
| Qtugħ qabel/wara | **Minn issa / Sa issa / Aqta' għal dan l-ispan** (l-undo jżomm iċ-ċaqliqat), imbagħad **Esporta CSV** (jerġa' jitgħabba f'3DHeat) jew **Esporta ACMI** (test ta' Tacview 2.2, għal reġistrazzjoni mqiegħda fuq l-art) | ġdid |

## Terren u mappa {#terrain-and-map}

| Tacview | 3DHeat | Status |
|---|---|---|
| Terren reali, elevazzjoni u teksturi personalizzati | Livelli (il-mappa tal-logħba bħala mudell 3D), tiles tal-isfond tad-dinja | lest |
| Modi tat-terren ċatt / vojt / kontrast għoli | [Dehra tal-livell](level-appearance.md): rilievi tal-art, wiċċ u strutturi murija jew le | lest (mhux l-istess modi) |
| Mappa taktika 2D (Tacview ma għandux waħda: il-veduta satellitari) | **Mappa 2D**: il-kantuniera jew il-veduta sħiħa, simboli skont it-tip u t-tim (plejers mimlija, AI mbiċċċa) mdawra lejn id-direzzjoni tagħhom, traċċi, ismijiet, skala, ċrieki tal-firxa madwar l-unità segwita, ċrieki tal-bullseye, il-post tal-kamera 3D, il-mwiet reċenti; iġbed, roti, ikklikkja biex issegwi (M) | ġdid |
| Oġġetti statiċi (ajruporti, pisti, waypoints, żoni, KML) | Pisti mkejla (OurAirports) fl-isfond tad-dinja u l-glideslopes tagħhom; waypoints GPX u placemarks KML jinħattu bħala oġġetti fissi; [Il-pjanċa tat-tattika](tactics-board.md) tiddisinja żoni u rotot | ġdid |

## Importazzjoni, esportazzjoni, reġistrazzjoni {#import-export-recording}

| Tacview | 3DHeat | Status |
|---|---|---|
| Test u zip ta' ACMI | [Tacview ACMI](tacview-acmi.md) | lest |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (traċċi, rotot, waypoints; heart rate, cadence, power, temperature ta' Garmin), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC u GGA ta' kull talker, checksums iċċekkjati, b'qsim ta' nofsillejl), **IGC** (rekords B, data, pilota u glider), **FIT** (messaġġi tar-record, timestamps kompressati) - kull wieħed imqiegħed skont il-latitudni u l-longitudni fuq il-pjan f'nofs it-traċċi, sabiex l-isfond tad-dinja jitqabbel; heading, pitch u veloċità mill-fajl jew minn fix għal fix. CSV u Parquet kif kien | ġdid (DIS m'huwiex applikabbli: protokoll tan-netwerk live) |
| Reġistraturi nattivi (DCS, BMS, IL-2, MSFS...) | Il-konverturi tagħna stess (War Thunder, CS2, Squad, Arma u oħrajn) | lest (tagħna) |
| Telemetrija live permezz ta' TCP, ADS-B | Mhux maħdum | m'huwiex applikabbli (replays wara l-partita) |
| Awdjo/vidjo sinkronizzat | **Awdjo u vidjo**: fajl lokali jitlaq, jieqaf, jmur fuq u jbiddel il-veloċità mal-linja tal-ħin minn bidu stabbilit (**Jibda issa**, ±0.1 s); vidjo f'pannell li jinbidel id-daqs fuq il-veduta, jew picture-in-picture. Il-fajl jibqa' fil-browser | ġdid |
| Esportazzjoni tal-vidjo | [Mogħdija tal-kamera u vidjo](camera-path-and-video.md) | lest |

## Oħrajn {#other}

| Tacview | 3DHeat | Status |
|---|---|---|
| Add-ons ta' Lua | Mhux maħdum | m'huwiex applikabbli (open source: ibdel il-viewer innifsu) |
| Debriefing online (sessjoni kondiviża) | Mhux maħdum | m'huwiex applikabbli (dak ta' Tacview huwa sessjoni ospitata li żżomm lil kulħadd fuq l-istess playhead. 3DHeat m'għandux server u jżomm ir-reġistrazzjonijiet fuq il-magna tal-viewer, u anke link peer-to-peer jeħtieġ server tas-sinjali. Debrief jinqasam bħala fajls: ir-reġistrazzjoni maqtugħa (Esporta ACMI jew CSV) u l-fajl tal-markaturi, li jinfetħu fl-istess mumenti u veduti) |
| Kontroll remot mill-istruttur | Mhux maħdum | m'huwiex applikabbli (jikkontrolla simulatur li jkun qed jaħdem) |
| Editjar tal-oġġetti (żid, editja, neħħi oġġetti) | [Il-pjanċa tat-tattika](tactics-board.md) għal oġġetti ppjanati; ir-reġistrazzjonijiet huma biss għall-qari | m'huwiex applikabbli |
| Lingwi | 40 lingwa | lest |
| Awtentikazzjoni tar-reġistrazzjonijiet | Mhux maħdum | m'huwiex applikabbli |

## Għall-iżviluppaturi: il-proprjetajiet ACMI 2.2 {#for-developers-acmi-22-properties}

Il-`data/acmi.ts` jaqraħom; proprjetajiet numeriċi isiru kolonni numeriċi, dawk tat-test isiru kolonni tal-kategorija. Kollha jidhru taħt **Mhux ipproċessat** fil-karta tal-unità. Dawn jinqraw għal skop:

| Proprjetajiet | Użu |
|---|---|
| T (l-erba' forom kollha), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Pożizzjoni, attitudni, figura, isem tal-unità, tim |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Oqsma, grafiċi, HUD, identifikazzjoni tat-tlugħ u tan-nżul |
| VerticalGForce, LongitudinalGForce, LateralGForce | Oqsma tal-G |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Oqsma |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Oqsma tal-fjuwil, immirati fuq it-tankijiet |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Koni tar-radar u l-bieb tal-firxa |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Linji tal-lock |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Qubbiet tal-ingaġġ |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Oqsma |
| Health | Qasam |
| Avvenimenti: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Il-lista tal-avvenimenti, l-istatistika (mwiet, tlugħ, nżul), markaturi; Message u Comment bħala sottotitoli |
| PilotHeadYaw, PilotHeadPitch | Linja tal-vista tal-pilota |
| Tag tat-tip Bullseye (Navaid+Static+Bullseye) | Qasam tal-bullseye u ċrieki tal-mappa |
| Kull ħaġa oħra (PilotHeadRoll, kontrolli, uċuħ, devjazzjonijiet tal-ILS, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, daqsijiet...) | Murija kif kitbet taħt **Mhux ipproċessat** |

Il-angoli tar-radar u tal-lock jittieħdu kontra l-assi tal-unità stess: azimut lejn il-lemin, elevazzjoni 'il fuq, roll lemin-wing 'l isfel. L-ispeċifikazzjoni ACMI tgħid li huma relattivi għall-inġenju imma mhux f'liema direzzjoni hija pożittiva; din il-qari tieħu t-trasformazzjoni tagħha (yaw clockwise, pitch 'il fuq, roll lemin).
