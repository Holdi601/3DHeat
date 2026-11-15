---
title: "Ngarkimi i rrethimeve"
parent: "Analiza e garës"
nav_order: 51
lang: "sq"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Ngarkimi i rrethimeve

Një skedar xhiro është regjistrim i një vozitjeje: ku ishte makina dhe çfarë bëri shoferi, shumë herë në sekondë. Ngarko dy ose më shumë xhiro të së njëjtës pistë dhe skeda **Analiza e garës** mund t'i krahasojë ato.

![Seksioni Xhirot i skedës Analiza e garës me tre xhiro demo të ngarkuara: lista e xhirove, ylli i referencës, fokusi](../assets/img/en/race-loading-laps-list.webp)

## Xhirot e para {#your-first-laps}

1. Hap skedën **Analiza e garës**.
2. Vetëm po shikon? Shtyp **Xhiro demo** (shih [Xhiro demo](#demo-laps)).
3. Xhirot e tua: regjistroji në lojë me një regjistrues (shih [Formatet e skedarëve](#file-formats)). Regjistruesi shkruan një skedar për çdo xhiro.
4. Shtyp **Ngarko skedarë xhirosh…** dhe zgjidh dy ose më shumë skedarë të së njëjtës pistë, ose shtyp **Dosje…** dhe zgjidh dosjen që i mban ata. Mund të lëshosh edhe skedarë ose dosje mbi pamjen 3D.
5. Kliko një xhiro në listë për të parë ku humb kohë.

**Kujdes: xhirot krahasohen një pistë në herë.** Ngarkimi i një xhiro të një pisteje tjetër të emërtuar pastron xhirot që janë ngarkuar tashmë.

## Butonat {#the-buttons}

| Kontrolli | Bën |
|---|---|
| **Ngarko skedarë xhirosh…** | një zgjedhës skedarësh për skedarët `.json`, `.csv`, `.txt`, `.ibt`, `.gz` dhe `.h3dcars`, disa njëherësh (`.h3dcars` është një skedar makine, shih [Makinat](race-replay-and-scene.md#the-cars)) |
| **Dosje…** | një zgjedhës dosjesh: çdo skedar xhiroje në dosje dhe nën të |
| **Xhiro demo** | tre xhiro të trilluara të një pisteje të trilluar (shih [Xhiro demo](#demo-laps)) |
| **Pastro** | heq çdo xhiro (shfaqet kur janë ngarkuar xhiro) |
| lëshimi mbi pamje | skedarët dhe dosjet e lëshuara mbi pamjen 3D ngarkohen në të njëjtën mënyrë |

Xhirot **shtohen** te ato të ngarkuara - **përveç nëse janë të një pisteje tjetër të emërtuar: atëherë xhirot e ngarkuara pastrohen më parë** (xhirot krahasohen një pistë në herë). Skedarët që s'mund të lexohen listohen nën butona, një rresht për secilin; të tjerët ngarkohen gjithsesi.

## Formatet e skedarëve {#file-formats}

Formati njihet nga përmbajtja, jo nga emri i skedarit. Me fjalë të thjeshta:

- **heat3d-lap** është skedari që shkruan regjistruesi i 3DHeat për shumicën e lojërave.
- **FH Companion** është një mjet falas që regjistron xhiro të Forza Horizon. Shkruan një skedar xhiroje dhe, pranë tij, një skedar `.json.tele.gz` (i njëjti xhiro me të dhënat e çdo gome, i kompresuar me gzip). Zgjidhi të dy bashkë.
- **iRacing `.ibt`** është skedari i vet i telemetrisë së iRacing; ndiz regjistrimin në makinë me Alt+L dhe ngarkoje skedarin ashtu si është.
- Një **CSV xhiroje** është një tabelë e thjeshtë, një rresht për çdo moment.

| Formati | Burimi tipik | Lexohet nga |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon dhe Motorsport mbi Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion lap `.json` | biblioteka e xhirove të FH Companion | `fromFhCompanion` |
| FH Companion telemetry `.json.tele.gz` | pranë çdo skedari xhiroje të FH Companion | `readForzaTelemetry` |
| iRacing `.ibt` | skedarët e vet të telemetrisë së iRacing (regjistrimi ndizet me Alt+L në makinë) | `readIbt` |
| CSV xhiroje | `heat3d_capture laps`, shtojca e Trackmania, ose çdo CSV me `x`, `z`, një kolonë kohe dhe opsionalisht një kolonë `lap` | `fromCsv` |

Si regjistrohet çdo lojë dhe çfarë dërgon, dokumentohet nga regjistruesit:
[GameCapture: lojërat](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
dhe [GameCapture: formati i xhiros](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Shih edhe [Lojërat e tjera të garave](other-games.md).

## Dosjet dhe pistat {#folders-and-courses}

**Dosje…**, ose një dosje e lëshuar, sjell çdo skedar nën të. Brenda një dosjeje merren parasysh vetëm skedarët që mbarojnë me `.json`, `.csv`, `.txt`, `.ibt` ose `.tele.gz`, dhe një `.json` që nuk është xhiro (skedari vetjak i një pisteje, harta e saj) kapërcehet pa gabim.

**Disa pista në një zgjedhje.** Biblioteka e xhirove të FH Companion mban çdo pistë në një dosje me emrin `<emri i pistës> (course_<x>_<z>_to_<x>_<z>)` (ose një `course_...` të zhveshur për një pistë pa emër). Kur skedarët e zgjedhur gjenden në më shumë se një dosje të tillë pistash, asgjë nuk ngarkohet; në vend të kësaj seksioni **Xhirot** thotë "Këto janë xhiro të N pistave, dhe xhirot krahasohen një pistë në herë. Zgjidh një:" dhe liston çdo pistë me numrin e xhirove të saj (skedarët që mbarojnë me `.json`, `.csv` ose `.ibt`, `course.json` nuk numërohet), me më shumë xhiro më parë. Kliko një për të ngarkuar skedarët e asaj pisteje.

Një pistë identifikohet me emrin dhe pikën e **nisjes**, jo të fundit: garat që nuk mbaruan mbahen nga FH Companion me të njëjtin emër dhe nisje (në `unfinished/`), me vendin ku u ndalën si fund, dhe shkojnë me pistën e tyre - shënuar **e pjesshme** në listë.

**Disa pista midis skedarëve të zgjedhur.** Kur skedarët e zgjedhur drejtpërdrejt (jo nga dosjet e pistave) janë xhiro të më shumë se një pisteje të emërtuar, e njëjta zgjedhje ofrohet për çdo pistë; xhirot që nuk emërtojnë pistë shkojnë me cilëndo pistë që zgjidhet.

## Emrat e makinave {#car-names}

Një xhiro thirret me emrin e plotë të makinës së vet, ashtu si e jep loja. Aty ku skedari i xhiros nuk e emërton makinën:

1. **Dosja.** Biblioteka e FH Companion mban xhirot në `<course>/<class>/<car name> '<yy> (car<number>)/<tune>/<tag>/<lap>.json`. Dosja më e brendshme që përputhet me `<name> (car<number>)` jep emrin dhe numrin; ajo që përputhet me `car<number>` vetëm numrin. Vetëm zgjedhjet e dosjeve dhe dosjet e lëshuara mbartin këtë shteg.
2. **Një xhiro tjetër i së njëjtës makinë.** Sapo një xhiro emërton një makinë, çdo xhiro me të njëjtën lojë dhe numër makine thirret kështu - xhirot e ngarkuara bashkë, dhe xhirot e ngarkuara më vonë në këtë shfletues: emrat mbahen në `localStorage` nën `heat3d.carNames` (me çelës `<game>:<car number>`). Në një dritare private zgjasin aq sa xhirot.
3. Përndryshe "car 1234" sipas numrit, ose "car".

**Etiketat.** Në listën e xhirove një xhiro shfaq emrin e makinës; disa xhiro të së njëjtës makinë numërohen "Emri #1", "Emri #2". Fjalitë e analizës përdorin të njëjtat etiketa kur janë unike; përndryshe emrin e makinës me kohën e xhirit, "Emri (1:29.616)" (kohë shembull), i numëruar më tej nëse ende nuk është unik.

**Grupimi.** Xhirot i përkasin së njëjtës makinë (për zarfet, profilet dhe krahasimet) kur numri i makinës - ose emri, kur s'ka numër - dhe indeksi i performancës së tyre janë të njëjtë (`carKey`): i njëjti model me një akordim tjetër është një makinë tjetër.

**Klasat.** Klasa e performancës së një xhiroje është ajo e lojës (Forza D..X, emri i shkurtër i klasës së makinës së iRacing); statistikat i renditin D, C, B, A, S1, S2, R, X, pastaj të tjerat sipas alfabetit.

## Xhiro demo {#demo-laps}

**Xhiro demo** ngarkon tre xhiro të një pisteje të trilluar (katër drejtëza dhe katër kthesa djathtas), të bëra nga një model i thjeshtë mjeti ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): shpejtësia e çdo kthese e kufizuar nga aderenca, një kalim përshpejtimi përpara dhe një kalim frenimi prapa, si e bën një simulues xhiroje.

| Xhiro | Makina | Gabimet |
|---|---|---|
| i pagabuar | Grip car | asnjë |
| me gabime | Grip car | frenon 35 m herët në T2, merr gazin 30 m vonë pas T3, merr T4 me 0.88 të shpejtësisë së vet, drejtohet 1.2 m në një anë |
| makinë tjetër | Power car | asnjë; drejtohet 1.2 m në anën tjetër |

| Makina (numri) | Aderenca | Frenimi | Tërheqja | Fuqia/masa | Rezistenca |
|---|---|---|---|---|---|
| Grip car (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0.0009 /m |
| Power car (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0.0006 /m |

Xhiro me gabimet është e fokusuar. Pista është e shtruar ashtu si e mban Forza botën e vet (e majtë), kështu që - ashtu si me një xhiro të vërtetë të Forza - del e pasqyruar dhe skeda ofron **Përmbys X**. Të tre xhirot mbartin të dhëna për çdo rrotë, kështu që çdo pjesë e skedës ka çfarë të shfaqë.

## Lista e xhirove {#the-lap-list}

Çdo rresht, nga e majta në të djathtë:

| Elementi | Bën |
|---|---|
| ● / ○ | shfaq / fsheh xhirin (vija, makina, karta, grafikët); xhirot e fshehura analizohen gjithsesi |
| vija me ngjyrë | ngjyra e xhirit |
| emri dhe etiketat | kliko për të **fokusuar** xhirin; kalo me miun për skedarin e tij burimor dhe makinën (emri · klasa PI · transmisioni) |
| ⌖ | ndiq këtë makinë me kamerën (kliko përsëri për ta ndaluar) |
| ★ | krahaso gjithçka me këtë xhiro (bëje referencë); joaktiv te referenca |
| × | hiq xhirin |

**Etiketat:** *referenca*; *më i miri i X* (ose *më i miri i klasës së vet*) te xhiroja më e shpejtë e një klase kur ka disa klasa; *e pjesshme* te një vrapim që nuk arriti në fund.

**Rreshti i dytë:** klasa (vetëm me disa klasa), koha e xhirit (`1:29.616`), hendeku me xhirin me të cilin krahasohet (më i miri i klasës së vet, ose referenca) si `+0.512` (shembull), dhe *fillon vonë* kur xhiroja fillon më shumë se 10 m pas nisjes së referencës.

Me më shumë se 8 xhiro një rresht "N nga M të vizatuara" ofron **Shfaq të gjitha** (vizaton çdo xhiro: më ngadalë, dhe një ngatërresë) dhe **Vetëm ato që shihen** (referenca, xhiroja e fokusuar dhe më i miri i klasës së saj; statistikat numërojnë çdo xhiro në të dyja rastet).

Nën listën: sugjerimi i pasqyrimit kur xhirot thonë se vizatimi është i pasqyruar (shih [botërat e pasqyruara](race-replay-and-scene.md#mirrored-worlds)), dhe me dy ose më shumë xhiro sugjerimi "Kliko një xhiro për të parë ku humb kohë …", plus, me disa klasa, që çdo xhiro krahasohet me më të shpejtin e klasës së vet.

### Referenca dhe fokusi {#reference-and-focus}

- **Referenca:** xhiroja me të cilën krahasohet çdo tjetër dhe, si parazgjedhje, krahasohet me të. Më e shpejta **e plotë**, përveç nëse ★ zgjedh tjetër (xhiro e parë e ngarkuar kur asnjë nuk është e plotë). Heqja e xhirit referencë kthehet te zgjedhja automatike.
- **Fokusi:** xhiroja të cilës i shfaqen gjetjet, kontrolli i makinës dhe hartat. Mbetet aty ku e vendosi përdoruesi; përndryshe është xhiroja **më e ngadalta** që nuk është referenca ("më shumë për të mësuar"). Fokusimi i një xhiro e zbulon atë dhe xhiron më të mirë të klasës së vet. Fokusimi i referencës e krahason atë me cilindo xhiro tjetër që ishte më e shpejtë përmes çdo kthese.
- **Klasat:** me xhiro të disa klasave performance, çdo xhiro krahasohet me xhiron e plotë më të shpejtë të klasës së vet (referencën, në klasën e referencës). Shih [Statistikat e pistës](race-course-statistics.md).

### Ngjyrat {#colours}

Çdo xhiro merr ngjyrën e vet, sipas pozicionit në radhën e ngarkimit, kështu që një xhiro e mban ngjyrën kur të tjerat fshihen. Nuancat janë shpërndarë rreth rrethit të ngjyrave ashtu si e shpërndan mënyra ekip e hartës së nxehtësisë grupet; për çdo vend, ndriçimi (0.52 deri 0.66 në OKLCH) dhe kroma (0.12 deri 0.18) zgjidhen që të qëndrojnë sa më larg vendeve fqinje (dhe i fundit nga i pari), nën vizionin normal, protan dhe deutan, secila të paktën 3:1 kundër sipërfaqes së errët të grafikut.

## Për zhvilluesit {#for-developers}

Kodi: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Si lexohet çdo format {#how-each-format-is-read}

Çdo format përfundon si një `LapTrace` i vetëm: kanale me emra kanonikë (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., shih [tabelën e kanaleve](race-charts-and-hud.md#the-channel-table)), makina, koha e xhirit, nëse është xhiro i plotë, dhe një bllok `meta`. Për çdo format, `time` dhe `distance` zhvendosen të fillojnë nga 0, dhe aty ku një burim nuk ka `speed`, ajo llogaritet si distanca pjesëtuar me kohën nga mostrat fqinje.

#### heat3d-lap JSON {#heat3d-lap-json}

Një objekt JSON me `"format": "heat3d-lap"`. Fushat që lexohen:

| Fusha | Përdorimi |
|---|---|
| `channels` | një objekt me vargje, një për kanal, sipas emrit kanonik; kanalet për rrotë si `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` dhe `z` janë të detyrueshme |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | makina: id, emri, indeksi i klasës Forza (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), indeksi i performancës, kodi i transmisionit (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | koha e xhirit; vlera e fundit e `time` kur mungon |
| `lap.complete` | `false` shënon një vrapim të pjesshëm; çdo gjë tjetër është e plotë |
| `game`, `track` | emrat; `game` vendos disiplinën (shih më poshtë) |
| `units.slipRatio` / `units.slipAngle` | si shkallëzohet rrëshqitja: një njësi që përmban `raw` do të thotë `scaled`, `normalised` do të thotë `peak`, çdo tjetër `physical` |
| `meta` | `slip`, `surface`, `discipline` siç jepen, mbishkruajnë sa më sipër |

Pa kanal `distance`, distanca mblidhet nga pozicionet 3D.

#### Skedarët e xhirove të FH Companion {#fh-companion-lap-files}

Një objekt JSON me një objekt `Lap` që mban një varg `samples` (një mostër rreth çdo 5 m). Fushat e lidhura:

| FH Companion | Kanali |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (zhvendosur që xhiroja të fillojë nga 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | e njëjta gjë, me shkronja të vogla |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², pavarësisht emrit) |
| `Puddle` | `puddle` |

Makina vjen nga `Lap.carOrdinal`, `Lap.carName` (vetëm skedarët më të rinj), `Class` (ose `Lap.carClass` si indeks klase Forza), `Lap.performanceIndex`, `Lap.drivetrain` dhe `Lap.peakKilowatts`; koha nga `Lap.lapSeconds`; një vrapim me `EndedAtFinish: false` është i pjesshëm. Loja është `forza-horizon`.

Këta skedarë nuk mbajnë të dhëna gomash dhe as drejtim, kështu që bllokimet, rrotullimi i rrotave dhe rrëshqitjet nuk mund të gjykohen vetëm nga ata; shtytjet (nga timoni kundrejt rrugës) dhe goditjet dhe përplasjet ende po. Zgjidh edhe `.tele.gz` pranë çdo njërit për pjesën tjetër.

#### Telemetria e FH Companion (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

JSON i kompresuar me gzip `{ version, columns, data }`: e tërë Data Out e Forza për një xhiro, një rresht për paketë, me emrat e vetë fushave të lojës. Kolonat gjenden sipas emrit, kurrë sipas pozicionit. Formati 2 mban çdo paketë (rreth 110 në sekondë kundrejt 64 tiketave të lojës); një rresht identik me atë para tij në çdo gjë përveç orës së vet të regjistruesit (`t`, `metres`) hidhet, kështu që një xhiro lexohet me 64 rreshta në sekondë, të lojës. (Këshilla e butonit të ngarkimit e thotë kështu: "për rrëshqitjen e çdo gome me 64 Hz".)

| Fusha e Data Out | Kanali |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (kornizë makine: x djathtas, y lart, z përpara) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, të shkallëzuara nga 0..255 në 0..1 |
| `Steer` | `steer`, e shkallëzuar nga -127..127 në -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, e kthyer nga Fahrenheit në °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` për rrotë |

`<Wheel>` është `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` → `FL`, `FR`, `RL`, `RR`. Rrëshqitja shënohet `peak` (rrëshqitja e normalizuar e Forza: përtej 1 goma ka humbur aderencën).

**Çiftimi.** Një skedar xhiroje `<lap>.json` dhe `<lap>.json.tele.gz`, të zgjedhur ose të lëshuar bashkë (i njëjti shteg përveç `.tele.gz`), bëhen **një** xhiro: kanalet e telemetrisë, me makinën, klasën, kohën, pistën dhe shenjën e pjesshme të skedarit të xhiros. Emri i makinës së skedarit të telemetrisë mbizotëron kur ka një. Një `.tele.gz` i vetëm ngarkohet gjithsesi: skedarët e formatit 2 mbajnë `car` (`ordinal`, `name`, `class`, `pi`), `track` dhe `lapSeconds`; pa ato, koha e xhirit është kohëzgjatja e vet e telemetrisë dhe makina është e panjohur.

#### iRacing `.ibt` {#iracing-ibt}

Skedari i telemetrisë së iRacing lexohet drejtpërdrejt (në shfletues, pa konvertim): koka 112-bajtëshe, nën-koka 32-bajtëshe e diskut, tabela e ndryshueshme (144 bajt për kanal) dhe YAML-i i sesionit.

- **Kanalet e detyrueshme:** `SessionTime`, `Lap`, `Lat`, `Lon`. Pa to: "… nuk ka kanalet SessionTime, Lap, Lat dhe Lon - a është ky një skedar telemetrie iRacing?"
- **Pozicionet:** gjerësia dhe gjatësia shtrihen në metra mbi një plan tangjent me pikën e parë jo-zero (rrezja e Tokës 6 371 008.8 m): x lindje, z jug, y lartësia (`Alt`) - kështu që me kamerën e parazgjedhur veriu është lart në ekran. Jo kuadri i vet i pistës: një model i nxjerrë pistë nuk do të përputhej.
- **Xhirot:** sesioni ndahet aty ku ndryshon `Lap`; një xhiro mbahet kur ka më shumë se 60 mostra, nis nën 5% të `LapDistPct` dhe mbaron mbi 95%. Xhirot e pjesshme hidhen. Kur nuk mbetet asnjë: "… nuk ka xhiro të plotë të pistës N km" (gjatësia e pistës nga YAML-i) ose "… nuk ka xhiro të plotë".
- **Distanca:** `LapDist` nga fillimi i xhirit, përndryshe e mbledhur nga pozicionet.
- **Makina:** nga `DriverInfo`: `CarScreenName` i lojtarit, `CarID` (si numri i makinës) dhe `CarClassShortName` (si klasa). Pista: `TrackDisplayName`, përndryshe `TrackName`.

Kanalet e hartuara:

| iRacing | Kanali | Konvertimi |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | të njëjtat emra | - |
| `Clutch` | `clutch` | `1 - v` (iRacing numëron angazhimin; i yni është pedali) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radianë, në drejtim të kundërt të akrepave, deri -1..1, djathtas pozitiv; maksimumi të paktën 0.1, π kur mungon) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | të njëjtat, me shkronja të vogla | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | pjesëtuar me 100 kur është mbi 1.5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | temperatura e mesit të trupit të gomës |
| `LFshockDefl` ... | `suspensionM.FL` ... | devijimi i amortizuesit, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0.145038 (kPa në psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Prefikset e rrotave: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Çdo kanal tjetër** me një vlerë për mostër (jo i tipit bit-field) kalon me emrin e vet - për rrotë kur fillon me një prefiks rrote (`RRspeed` bëhet `speed.RR`) - kështu që grafikët dhe listat e vlerave të kartave i ofrojnë të gjithë. iRacing nuk regjistron rrëshqitje gome: kontrolli i makinës gjykohet nga këndi i devijimit - `Yaw`, i përshtatur me drejtimin e lëvizjes, kundrejt ku shkon makina - dhe timoni kundrejt rrugës. Shpejtësia e rrotullimit kundrejt përshpejtimit anësor përdoret vetëm kur drejtimi nuk mund të përshtatet, kështu që nuk ka kënd devijimi (shih [Ngjarjet e kontrollit të makinës](race-control-events.md)).

Gabimet: "… është shumë i shkurtër për të qenë skedar .ibt", "… nuk ka kokën e telemetrisë iRacing", "… nuk ka matje pozicioni".

#### CSV xhiroje {#lap-csv}

Një rresht për mostër; shumë xhiro në një skedar dallohen me një kolonë `lap`. Ndarësi zbulohet nga pesë rreshtat e parë. Një rresht i parë opsional `# { ...json... }` përshkruan vrapimin: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Kolona (pa dallim shkronjash) | Kanali |
|---|---|
| `x`, `y`, `z` | pozicioni (`x` dhe `z` të detyrueshme) |
| `elapsed` ose `time` | `time` (e detyrueshme për çdo xhiro) |
| `metres` ose `distance` | `distance` (përndryshe e mbledhur nga pozicionet) |
| `speed_ms` ose `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | të njëjtat |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| çdo emër kanali kanonik, p.sh. `latVel`, `slipIndex.FL` | vetveten |
| `lap` | cilit xhiro i takon një rresht |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | koha e xhirit, numri i makinës, klasa, PI, pista (nga rreshti i parë i çdo xhiroje) |

Pa përshkrim, loja merret si `forza-horizon` dhe çdo xhiro si e plotë. Burimi i një xhiroje shfaqet si `<file> · <lap>` kur skedari mban disa. Gabimet: "… nuk ka rreshta", "… nuk ka kolona x dhe z", "… nuk ka xhiro me një kolonë kohe".

#### Disiplina dhe toka {#discipline-and-surface}

Çfarë supozon analiza për një xhiro, kur xhiroja nuk e thotë (`lap.ts`):

- **Disiplina:** `meta.discipline`, përndryshe një emër loje që përputhet me `rally|wrc|dirt|rbr` është **rali**, `trackmania` është **arcade**, çdo gjë tjetër **pistë**.
- **Toka:** `meta.surface`, përndryshe nga emri i pistës dhe burimi: një rali me emrin `monte` është **e përzier**; `snow|ice|winter|arctic|sweden` **borë**; ralitë në asfalt (Spain/España/Catalunya/Costa Daurada, Croatia/Hrvatska, Central Europe, Germany/Deutschland, Japan, Corsica/Corse, Ypres, ose fjalët tarmac/asphalt) **asfalt**; çdo emër me `scramble|trail|cross country|dirt|gravel` **e shkrifët**; një fazë tjetër rali gjykohet nga mënyra si u drejtua makina: mbi mostrat më shpejt se 12 m/s dhe në tokë (të paktën 200 prej tyre), një përqindje e 95-të e përshpejtimit anësor prej 10 m/s² ose më shumë, bashkë me një devijim mesatar këndi nën 6° (marrë aty ku makina u kthye me 70% të asaj ose më shumë, të paktën 30 mostra), është asfalt; çdo gjë tjetër, ose shumë pak për ta thënë, është e shkrifët. Një emër jo-rali me `rally` brenda është i shkrifët; çdo gjë tjetër asfalt.
- Për çdo mostër, një kanal `loose` (dridhja e tokës e Forza, materialet e Trackmania, shih [Ngjarjet e kontrollit të makinës](race-control-events.md#the-ground)) mbishkruan tokën e xhirit.
