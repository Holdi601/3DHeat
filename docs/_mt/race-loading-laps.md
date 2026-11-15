---
title: "Tagħbija tal-ġirjiet"
parent: "Analiżi tat-tellieqa"
nav_order: 51
lang: "mt"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Tagħbija tad-dawriet

Fajl ta' dawra hu rekording ta' sewqa waħda: fejn kienet il-karozza u x'għamel is-sewwieq, ħafna drabi kull sekonda. Tagħbija ta' żewġ dawriet jew aktar tal-istess kors tippermetti lit-tab **Analiżi tat-tellieqa** iqabbilhom.

![It-taqsima Dawriet tat-tab Analiżi tat-tellieqa b'tliet dawriet demo mgħobbija: lista tad-dawriet, stilla tar-referenza, il-fokus](../assets/img/en/race-loading-laps-list.webp)

## L-ewwel dawriet tiegħek {#your-first-laps}

1. Iftaħ it-tab **Analiżi tat-tellieqa**.
2. Qed tħares biss? Ikklikkja **Dawriet demo** (ara [Dawriet demo](#demo-laps)).
3. Id-dawriet tiegħek stess: irrekordjahom fil-logħba b'recorder (ara [Formati tal-fajls](#file-formats)). Ir-recorder jikteb fajl wieħed għal kull dawra.
4. Ikklikkja **Iftaħ fajls tad-dawra…** u agħżel żewġ fajls jew aktar tal-istess kors, jew ikklikkja **Folder…** u agħżel il-folder li fih huma. Tista' wkoll tħalli fajls jew folders fuq il-view 3D.
5. Ikklikkja dawra fil-lista biex tara fejn qed titlef il-ħin.

**Twissija: id-dawriet jitqabblu kors wieħed b'kull darba.** Tagħbija ta' dawra ta' kors ieħor imsemmi tneħħi d-dawriet diġà mgħobbija.

## Il-buttuni {#the-buttons}

| Kontroll | Jagħmel |
|---|---|
| **Iftaħ fajls tad-dawra…** | għażel fajl għal fajls `.json`, `.csv`, `.txt`, `.ibt`, `.gz` u `.h3dcars`, diversi f'daqqa (`.h3dcars` hu fajl ta' karozza, ara [Karozzi](race-replay-and-scene.md#the-cars)) |
| **Folder…** | għażel folder: kull fajl tad-dawra fil-folder u taħtu |
| **Dawriet demo** | tliet dawriet magħmulin ta' ċirkwit magħmul (ara [Dawriet demo](#demo-laps)) |
| **Neħħi** | jneħħi kull dawra (jidher ladarba jkun hemm dawriet mgħobbija) |
| twaqqigħ fuq il-view | fajls u folders imwaqqgħa fuq il-view 3D jinġarru bl-istess mod |

Id-dawriet **jiżdiedu** ma' dawk mgħobbija - **sakemm ma jkunux ta' kors iehor imsemmi: allura d-dawriet mgħobbija jitneħħew l-ewwel** (id-dawriet jitqabblu kors wieħed b'kull darba). Fajls li ma jistgħux jinqraw jidhru taħt il-buttuni, linja għal kull wieħed; l-oħrajn jitgħabbew xorta.

## Formati tal-fajls {#file-formats}

Il-format jinħataf mill-kontenut, mhux mill-isem tal-fajl. Bil-kliem sempliċi:

- **heat3d-lap** hu l-fajl li r-recorder ta' 3DHeat jikteb għall-biċċa l-kbira tal-logħbiet.
- **FH Companion** hu għodda ħielsa li tirrekordja dawriet ta' Forza Horizon. Tikteb fajl tad-dawra u, ħdejh, fajl `.json.tele.gz` (l-istess dawra b'kull data tal-gomom kollha, ikkompressata bil-gzip). Agħżel iż-żewġ fajls flimkien.
- **iRacing `.ibt`** hu l-fajl tat-telemetrija proprju ta' iRacing; ixgħel ir-reġistrazzjoni fil-karozza b'Alt+L u tgħabbi l-fajl kif hu.
- **CSV tad-dawra** hu tabella sempliċi, ringiela waħda għal kull mument.

| Format | Sors tipiku | Miqri minn |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon u Motorsport permezz ta' Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| dawra `.json` tal-FH Companion | il-librerija tad-dawriet tal-FH Companion | `fromFhCompanion` |
| telemetrija `.json.tele.gz` tal-FH Companion | ħdejn kull fajl tad-dawra tal-FH Companion | `readForzaTelemetry` |
| iRacing `.ibt` | il-fajls tat-telemetrija proprji ta' iRacing (ir-reġistrazzjoni tixgħel b'Alt+L fil-karozza) | `readIbt` |
| CSV tad-dawra | `heat3d_capture laps`, il-plugin ta' Trackmania, jew kull CSV b'`x`, `z`, kolonna tal-ħin u eventwalment kolonna `lap` | `fromCsv` |

Kif jiġi rreġistrat kull logħba u x'jibgħat hu ddokumentat mir-recorders: [GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
u [GameCapture: the lap format](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Ara wkoll [Logħbiet oħra tas-sewqan](other-games.md).

## Folders u korsijiet {#folders-and-courses}

**Folder…**, jew folder imwaqqa', iġib kull fajl taħtu. Ġewwa folder jitqiesu biss fajls li jispiċċaw b'`.json`, `.csv`, `.txt`, `.ibt` jew `.tele.gz`, u `.json` li ma jkunx dawra (fajl proprju tal-kors, il-mappa tiegħu) jitħalla barra mingħajr żball.

**Diversi korsijiet f'għażla waħda.** Il-librerija tad-dawriet tal-FH Companion iżżomm kull kors f'folder jismu `<isem il-kors> (course_<x>_<z>_to_<x>_<z>)` (jew `course_...` biss għal kors bla isem). Meta l-fajls magħżula jkunu f'iktar minn folder ta' kors wieħed bħal dan, ebda wieħed ma jitgħabba; minflok it-taqsima **Dawriet** tgħid "Dawn huma dawriet ta' N korsijiet, u d-dawriet jitqabblu kors wieħed b'kull darba. Agħżel wieħed:" u tlista kull kors bl-għadd tad-dawriet tiegħu (fajls li jispiċċaw `.json`, `.csv` jew `.ibt`, `course.json` mhux imgħodd), dawk b'aktar dawriet l-ewwel. Il-kliku fuq wieħed jgħabbi l-fajls ta' dak il-kors.

Kors jiġi identifikat mill-isem u mill-**bidu** tiegħu, mhux mit-tmiem: tellieqa li qatt ma spiċċat tinżamm mill-FH Companion taħt l-istess isem u bidu (f'`unfinished/`) bil-post fejn waqfet bħala t-tmiem, u jmorru mal-kors tagħhom - immarkati **parzjali** fil-lista.

**Diversi binarji fost il-fajls magħżula.** Meta l-fajls magħżula direttament (mhux minn folders ta' kors) ikunu dawriet ta' aktar minn binarju bl-isem, l-istess għażla tiġi offruta għal kull binarju; dawriet li ma jsemmux binarju jmorru ma' dak li jkun magħżul.

## Ismijiet tal-karozzi {#car-names}

Dawra tissejjaħ bl-isem sħiħ tal-karozza tagħha, kif tagħtih il-logħba. Fejn il-fajl tad-dawra ma jsemmix il-karozza:

1. **Il-folder.** Il-librerija tal-FH Companion iżżomm id-dawriet f'
   `<kors>/<klassi>/<isem il-karozza> '<yy> (car<numru>)/<tune>/<tag>/<dawra>.json`.
   L-iktar folder ġewwa li jaqbel `<isem> (car<numru>)` jagħti l-isem u n-numru; wieħed li jaqbel `car<numru>` in-numru biss. Dan it-triq jidher biss fl-għażliet ta' folders u fil-folders imwaqqgħa.
2. **Dawra oħra tal-istess karozza.** Ladarba xi dawra ssemmi karozza, kull dawra bl-istess logħba u l-istess numru tal-karozza titsejjaħ bl-istess isem - id-dawriet mgħobbija flimkien, u dawriet imgħobbija aktar tard f'dan il-browser: l-ismijiet jinżammu f'`localStorage` taħt `heat3d.carNames` (imfittex bħala `<logħba>:<numru tal-karozza>`). F'tieqa privata jdumu kemm id-dawriet.
3. Inkella "car 1234" bin-numru tagħha, jew "car".

**Tikketti.** Fil-lista tad-dawriet dawra turi l-isem tal-karozza tagħha; diversi dawriet tal-istess karozza jinġabru bin-numri "Isem #1", "Isem #2". Is-sentenzi tal-analiżi jużaw l-istess tikketti meta jkunu uniċi; inkella l-isem tal-karozza mal-ħin tad-dawra, "Isem (1:29.616)" (ħinijiet ta' eżempju), numerati aktar jekk ikun għadu mhux uniku.

**Raggruppament.** Dawriet jappartjenu għall-istess karozza (għall-envelopes, il-profili u l-paragun) meta n-numru tal-karozza tagħhom - jew l-isem jekk ma jkun hemm numru - u l-indiċi tal-prestazzjoni tagħhom ikunu l-istess (`carKey`): l-istess mudell b'tune differenti hu karozza differenti.

**Klassijiet.** Il-klassi tal-prestazzjoni ta' dawra hi dik tal-logħba (Forza D..X, l-isem qasir tal-klassi tal-karozza ta' iRacing); l-istatistika tqiegħed il-klassijiet D, C, B, A, S1, S2, R, X, imbagħad oħrajn alfabetikament.

## Dawriet demo {#demo-laps}

**Dawriet demo** jgħabbi tliet dawriet ta' ċirkwit magħmul (erba' dritti u erba' kantunieri tal-lemin), magħmula minn mudell sempliċi tal-karozza ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): l-veloċità limitata mill-aderenza ta' kull kantuniera, passaġġ ta' aċċelerazzjoni 'l quddiem u passaġġ ta' brejkjar lura, bħal simulatur tad-dawra.

| Dawra | Karozza | Żbalji |
|---|---|---|
| nadifa | Karozza tal-aderenza | xejn |
| bl-iżbalji | Karozza tal-aderenza | tibrejkja 35 m kmieni fit-T2, tiħu l-gass 30 m tard għal barra mit-T3, tieħu t-T4 b'0.88 tal-veloċità tagħha, issuq 1.2 m għal naħa waħda |
| karozza oħra | Karozza tal-qawwa | xejn; issuq 1.2 m għan-naħa l-oħra |

| Karozza (numru) | Aderenza | Brejkjar | Trazzjoni | Qawwa/massa | Drag |
|---|---|---|---|---|---|
| Karozza tal-aderenza (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0.0009 /m |
| Karozza tal-qawwa (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0.0006 /m |

Id-dawra bl-iżbalji hi fil-fokus. Iċ-ċirkwit hu mpoġġi bil-mod li jżomm Forza d-dinja tagħha (bil-lemin-xellug), għalhekk - bl-istess mod ta' dawra vera ta' Forza - tidher imqallba, u t-tab joffri **Aqleb X**. It-tliet dawriet kollha jġorru dejta għal kull rota, għalhekk kull parti tat-tab għandha x'turi.

## Il-lista tad-dawriet {#the-lap-list}

Kull ringiela, minn tax-xellug għal tal-lemin:

| Element | Jagħmel |
|---|---|
| ● / ○ | juri / jaħbi d-dawra (linji, karozza, karta, grafiċi); dawriet moħbija xorta jiġu analizzati |
| linja bil-kulur | il-kulur tad-dawra |
| isem u tikketti | ikklikkja biex tiffoka d-dawra; ftit minn fuq turi l-fajl sors tagħha u l-karozza (isem · klassi PI · drivetrain) |
| ⌖ | segwi din il-karozza bil-kamera (ikklikkja darba oħra biex tieqaf) |
| ★ | qabbel kollox ma' din id-dawra (għamilha r-referenza); mitfija fuq ir-referenza |
| × | neħħi d-dawra |

**Tikketti:** *reference*; *best of X* (jew *best of its class*) fuq l-aktar dawra mgħaġġla ta' klassi meta jkunu diversi klassijiet; *partial* fuq tellieqa li ma laħqitx it-tmiem.

**It-tieni linja:** il-klassi (meta jkunu diversi klassijiet biss), il-ħin tad-dawra (`1:29.616`), id-distakk mad-dawra li tittieħed magħha (l-aħjar tal-klassi tagħha, jew ir-referenza) bħala `+0.512` (eżempju), u *starts late* meta d-dawra tibda aktar minn 10 m wara l-bidu tar-referenza.

B'aktar minn 8 dawriet tidher linja "N minn M miġbuda" bil-buttuni **Uri kollox** (tiġbed kull dawra: aktar bil-mod, u taqbad kollox ħaġa waħda) u **Dawk li qed tħares lejhom biss** (ir-referenza, id-dawra fil-fokus u l-aħjar tal-klassi tagħha); l-istatistika tgħodd kull dawra f'kull każ.

Taħt il-lista: l-avviż tal-maqlub meta d-dawriet jgħidu li r-disinn hu mqallab (ara [dinjiet imqallbin](race-replay-and-scene.md#mirrored-worlds)), u b'żewġ dawriet jew aktar l-avviż "Ikklikkja dawra biex tara fejn qed titlef il-ħin …", u, b'diversi klassijiet, li kull dawra titqabbel mal-aktar mgħaġġla tal-klassi tagħha.

### Referenza u fokus {#reference-and-focus}

- **Referenza:** id-dawra li kull oħra titpoġġa miegħha u, b'default, titqabbel magħha. L-aktar dawra **sħiħa** mgħaġġla sakemm ★ ma jagħżel oħra (l-ewwel dawra mgħobbija meta ebda waħda ma tkun sħiħa). Jekk titneħħa r-referenza, terġa' tiġi l-għażla awtomatika.
- **Fokus:** id-dawra li s-sejbiet, il-kontroll tal-karozza u l-mapep tagħha jintwerew. Tibqa' fejn ħa l-utent; inkella hi l-**iktar bil-mod** dawra li mhix ir-referenza ("l-iktar x'titgħallem"). Il-fokus fuq dawra jneħħilha l-moħbi u l-aħjar dawra tal-klassi tagħha. Il-fokus fuq ir-referenza tqabbilha ma' min minn dawriet oħra kien l-aktar mgħaġġel minn kull kantuniera.
- **Klassijiet:** b'dawriet ta' diversi klassijiet tal-prestazzjoni, kull dawra titqabbel mal-aktar dawra sħiħa mgħaġġla tal-klassi tagħha stess (ir-referenza, fil-klassi tar-referenza). Ara [Statistika tal-kors](race-course-statistics.md).

### Kuluri {#colours}

Kull dawra tieħu l-kulur tagħha, skont il-pożizzjoni tagħha fl-ordni tat-tagħbija, sabiex dawra żżomm il-kulur tagħha meta oħrajn ikunu moħbija. Il-kuluri jinxtered madwar ir-rota tal-kuluri kif it-mod tal-ġrupp tal-heatmap jaqsam il-gruppi; għal kull slot il-ħafifija (0.52 sa 0.66 f'OKLCH) u l-kroma (0.12 sa 0.18) jintgħażlu biex jibqgħu l-aktar 'il bogħod mill-slots ġirien (u l-aħħar mill-ewwel) taħt viżjoni normali, protan u deutan, kull wieħed b'mill-inqas 3:1 kontra s-sfond skur tal-grafika.

## Għall-iżviluppaturi {#for-developers}

Kodiċi: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Kif jinqara kull format {#how-each-format-is-read}

Kull format jispiċċa bħala `LapTrace` wieħed: kanali b'ismijiet kanoniċi (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., ara [it-tabella tal-kanali](race-charts-and-hud.md#the-channel-table)), il-karozza, il-ħin tad-dawra, jekk hijiex dawra sħiħa, u blokk `meta`. Għal kull format, `time` u `distance` jitħarrku biex jibdew f'0, u fejn sors ma jkollux `speed` tinħadem bħala d-distanza fuq il-ħin mill-kampjuni ġirien.

#### JSON heat3d-lap {#heat3d-lap-json}

Oġġett JSON b'`"format": "heat3d-lap"`. Oqsma li jinqraw:

| Qasam | Użu |
|---|---|
| `channels` | oġġett ta' arrays, wieħed għal kull kanal, bl-isem kanoniku; kanali għal kull rota bħala `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` u `z` huma meħtieġa |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | il-karozza: l-id, l-isem, l-indiċi tal-klassi ta' Forza (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), l-indiċi tal-prestazzjoni, il-kodiċi tad-drivetrain (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | il-ħin tad-dawra; il-valur `time` l-aħħar meta ma jkunx hemm |
| `lap.complete` | `false` timmarka tellieqa parzjali; kull ħaġa oħra hi dawra sħiħa |
| `game`, `track` | ismijiet; `game` jiddeċiedi d-dixxiplina (ara hawn taħt) |
| `units.slipRatio` / `units.slipAngle` | kif il-ħtikk hu skalat: unità li fiha `raw` tfisser `scaled`, `normalised` tfisser `peak`, kull ħaġa oħra `physical` |
| `meta` | `slip`, `surface`, `discipline` kif jingħataw jiswew fuq dawk ta' hawn fuq |

Mingħajr kanal `distance`, id-distanza tingħadd mill-pożizzjonijiet 3D.

#### Fajls tad-dawra tal-FH Companion {#fh-companion-lap-files}

Oġġett JSON b'oġġett `Lap` li fih array `samples` (kampjun kull madwar 5 m). Oqsma mħabbra:

| FH Companion | Kanal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (imħarrek sabiex id-dawra tibda f'0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | l-istess, bl-ittri żgħar |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², minkejja l-isem) |
| `Puddle` | `puddle` |

Il-karozza tiġi minn `Lap.carOrdinal`, `Lap.carName` (fajls aktar ġodda biss), `Class` (jew `Lap.carClass` bħala indiċi tal-klassi ta' Forza), `Lap.performanceIndex`, `Lap.drivetrain` u `Lap.peakKilowatts`; il-ħin minn `Lap.lapSeconds`; tellieqa b'`EndedAtFinish: false` hi parzjali. Il-logħba hi `forza-horizon`.

Dawn il-fajls ma jġorru l-ebda dejta tal-gomom u l-ebda direzzjoni, għalhekk blokki, ħtikk fuq il-gomma u skivi ma jistgħux jiġu ġudikati minnhom waħedhom; il-ħabtiet (mill-iddawwar tat-timone kontra t-triq) u l-daqqiet u l-kwarti xorta jibqgħu. Agħżel ukoll il-`.tele.gz` ħdejn kull wieħed għall-bqija.

#### Telemetrija tal-FH Companion (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

JSON ikkompressat bil-gzip `{ version, columns, data }`: Data Out kollu ta' Forza għal dawra waħda, ringiela waħda għal kull pakkett, bl-ismijiet tal-logħba stess. Il-kolonni jinstabu bl-isem, qatt bil-pożizzjoni. Format 2 iżomm kull pakkett (madwar 110 kull sekonda kontra l-64 tick tal-logħba); ringiela identika għal dik ta' qabilha f'kollox ħlief l-arloġġ tar-recorder innifsu (`t`, `metres`) titwarrab, għalhekk dawra tinqara fuq il-64 ringiela kull sekonda tal-logħba. (It-tooltip tal-buttun tat-tagħbija jgħid dan: "għall-iskiv ta' kull gomma f'64 Hz".)

| Qasam tal-Data Out | Kanal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (fil-qafas tal-karozza: x lemin, y fuq, z quddiem) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, mibdula minn 0..255 għal 0..1 |
| `Steer` | `steer`, mibdula minn -127..127 għal -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, maqlub minn Fahrenheit għal °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` għal kull rota |

`<Wheel>` hu `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` →
`FL`, `FR`, `RL`, `RR`. L-iskiv hu mmarkat `peak` (il-ħtikk normalizzat ta' Forza: meta jgħaddi 1 il-gomma tkun telqet).

**Immaqqim.** Fajl tad-dawra `<lap>.json` u `<lap>.json.tele.gz` magħżula jew imwaqqa' flimkien (l-istess triq ħlief `.tele.gz`) isiru **dawra waħda**: il-kanali tat-telemetrija, bil-karozza, il-klassi, il-ħin, il-binarju u l-bandiera tal-parzjali tal-fajl tad-dawra. L-isem tal-karozza tal-fajl tat-telemetrija jirbaħ meta jkollu wieħed. Fajl `.tele.gz` waħdu xorta jitgħabba: fajls format 2 iġorru `car` (`ordinal`, `name`, `class`, `pi`), `track` u `lapSeconds`; mingħajr dawn il-ħin tad-dawra hu t-tul tat-telemetrija innifisha u l-karozza mhix magħrufa.

#### iRacing `.ibt` {#iracing-ibt}

Il-fajl tat-telemetrija ta' iRacing jinqara direttament (fil-browser, mingħajr konverżjoni): il-header ta' 112-byte, is-sub-header tad-disk ta' 32-byte, it-tabella tal-varjabbli (144 byte għal kull kanal) u l-YAML tas-sessjoni.

- **Kanali meħtieġa:** `SessionTime`, `Lap`, `Lat`, `Lon`. Mingħajrhom: "… m'għandux SessionTime, Lap, Lat u Lon - hu fajl tat-telemetrija ta' iRacing?"
- **Pożizzjonijiet:** il-latitudni u l-longitudni jitqiegħdu f'metri fuq pjan tanġenti fl-ewwel fix mhux żero (raġġ tad-Dinja 6 371 008.8 m): x il-lvant, z in-nofsinhar, y l-altitudni (`Alt`) - allura bil-kamera default it-tramuntana hi 'il fuq fuq l-iskrin. Mhux il-qafas tal-binarju stess: mudell tal-kors maqlugħ ma jkunx jaqbel.
- **Dawriet:** is-sessjoni tinqasam fejn `Lap` jinbidel; dawra tinżamm meta jkollha iktar minn 60 kampjun, tibda taħt 5% ta' `LapDistPct` u tispiċċa fuq 95%. Dawriet parzjali jitħassru. Meta ma jkun baqa' xejn: "… m'għandux dawra sħiħa tal-binarju ta' N km" (it-tul tal-binarju mill-YAML) jew "… m'għandux dawra sħiħa".
- **Distanza:** `LapDist` mill-bidu tad-dawra, inkella miżjuda mill-pożizzjonijiet.
- **Karozza:** mid-`DriverInfo`: `CarScreenName` tas-sewwieq, `CarID` (bħala n-numru tal-karozza) u `CarClassShortName` (bħala l-klassi). Binarju: `TrackDisplayName`, inkella `TrackName`.

Kanali mmappjati:

| iRacing | Kanal | Konverżjoni |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | l-istess ismijiet | - |
| `Clutch` | `clutch` | `1 - v` (iRacing jgħodd l-impenn; tagħna hu l-pedal) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radjanti kontra l-arloġġ għal -1..1 lemin pożittiv; il-massimu mill-inqas 0.1, π meta ma jkunx hemm) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | l-istess, bl-ittri żgħar | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | maqsum 100 meta jkun aktar minn 1.5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | it-temperatura tal-qalba tal-karkassa |
| `LFshockDefl` ... | `suspensionM.FL` ... | deflezzjoni tal-kuxxinett, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0.145038 (kPa għal psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Prefissi tar-roti: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Kull kanal ieħor** b'valur wieħed għal kull kampjun (mhux tat-tip bit-field) jgħaddi bl-isem tiegħu stess - għal kull rota meta jibda b'prefiss ta' rota (`RRspeed` isir `speed.RR`) - sabiex il-grafiċi u l-listi tal-valuri tal-karti joffru kollha. iRacing ma jirreġistra l-ebda ħtikk tal-gomom: il-kontroll tal-karozza jitkejjel mill-angolu tad-drift - `Yaw`, imqabbel mad-direzzjoni tal-vjaġġ, kontra fejn tmur il-karozza - u t-timone kontra t-triq. Ir-rata tad-dawran kontra l-aċċelerazzjoni laterali tintuża biss meta d-direzzjoni ma tistax titqabbel, għalhekk ma jkun hemm l-ebda angolu ta' drift (ara [Avvenimenti tal-kontroll tal-karozza](race-control-events.md)).

Żbalji: "… qasir wisq biex ikun fajl .ibt", "… m'għandux header ta' telemetrija ta' iRacing", "… m'għandux fixes ta' pożizzjoni".

#### CSV tad-dawra {#lap-csv}

Ringiela waħda għal kull kampjun; diversi dawriet f'fajl wieħed jinftehmu permezz ta' kolonna `lap`. Il-limitatur jinstab mill-ewwel ħames linji. Linja bl-ewwel karattru `#` u warajha `{ ...json... }` tiddeskrivi d-dawra: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Kolonna (mingħajr sensittività għall-ittri kbar) | Kanal |
|---|---|
| `x`, `y`, `z` | pożizzjoni (`x` u `z` meħtieġa) |
| `elapsed` jew `time` | `time` (meħtieġ għal kull dawra) |
| `metres` jew `distance` | `distance` (inkella miżjuda mill-pożizzjonijiet) |
| `speed_ms` jew `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | l-istess |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| kwalunkwe isem kanoniku, pereżempju `latVel`, `slipIndex.FL` | innifsu |
| `lap` | liema dawra tappartjeni għaliha ringiela |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | il-ħin tad-dawra, in-numru tal-karozza, il-klassi, il-PI, il-binarju (mill-ewwel ringiela ta' kull dawra) |

Mingħajr deskrizzjoni l-logħba tittieħed bħala `forza-horizon` u kull dawra bħala sħiħa. Is-sors ta' dawra jintwera bħala `<fajl> · <dawra>` meta l-fajl ikun fih diversi. Żbalji: "… m'għandux ringieli", "… m'għandux kolonni x u z", "… m'għandux dawriet b'kolonna tal-ħin".

#### Dixxiplina u wiċċ {#discipline-and-surface}

Dak li l-analiżi tassumi dwar dawra, meta d-dawra ma tgħidx (`lap.ts`):

- **Dixxiplina:** `meta.discipline`, inkella isem tal-logħba li jaqbel `rally|wrc|dirt|rbr` hu **rally**, `trackmania` hu **arcade**, kull ħaġa oħra **circuit**.
- **Wiċċ:** `meta.surface`, inkella mill-isem tal-binarju u s-sors: rally bl-isem `monte` hu **imħallat**; `snow|ice|winter|arctic|sweden` **borra**; ir-rallies tal-asfalt (Spanja/España/Catalunya/Costa Daurada, Kroazja/Hrvatska, Ewropa Ċentrali, il-Ġermanja/Deutschland, il-Ġappun, Korsika/Corse, Ypres, jew il-kliem tarmac/asphalt) **asfalt**; kull isem b'`scramble|trail|cross country|dirt|gravel` **ġrar**; stage oħra ta' rally tiġi ġudikata minn kif kienet misjuqa l-karozza: fuq il-kampjuni iktar mgħaġġla minn 12 m/s u fuq l-art (mill-inqas 200 minnhom), il-95 persentil tal-aċċelerazzjoni laterali ta' 10 m/s² jew aktar flimkien ma' angolu ta' drift medjan taħt 6° (meħud fejn il-karozza daret f'70% ta' dak jew aktar, mill-inqas 30 kampjun) huwa asfalt; kull ħaġa oħra, jew fejn ikun hemm xi ftit biex wieħed jgħid, hi ġrar. Isem li mhux ta' rally bil-kelma `rally` fih hu ġrar; kull ħaġa oħra, asfalt.
- Għal kull kampjun, kanal `loose` (ir-rumble tal-wiċċ ta' Forza, il-materjali ta' Trackmania, ara [Avvenimenti tal-kontroll tal-karozza](race-control-events.md#the-ground)) jissostitwixxi l-wiċċ tad-dawra.
