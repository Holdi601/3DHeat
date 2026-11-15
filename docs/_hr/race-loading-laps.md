---
title: "Učitavanje krugova"
parent: "Analiza utrke"
nav_order: 51
lang: "hr"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Učitavanje krugova

Datoteka kruga je snimka jedne vožnje: gdje je automobil bio i što je vozač radio, mnogo puta u sekundi. Učitajte dva ili više krugova iste staze pa ih kartica **Analiza utrke** može usporediti.

![Odjeljak Krugovi na kartici Analiza utrke s tri učitana demo kruga: popis krugova, referentna zvijezda i fokus](../assets/img/en/race-loading-laps-list.webp)

## Vaši prvi krugovi {#your-first-laps}

1. Otvorite karticu **Analiza utrke**.
2. Samo gledate? Pritisnite **Demo krugovi** (vidi [Demo krugovi](#demo-laps)).
3. Vaši vlastiti krugovi: snimite ih u igri snimačem (vidi [Formati datoteka](#file-formats)). Snimač piše jednu datoteku po krugu.
4. Pritisnite **Učitaj datoteke krugova…** i odaberite dvije ili više datoteka iste staze, ili pritisnite **Mapa…** i odaberite mapu u kojoj su. Datoteke ili mape možete i ispustiti na 3D prikaz.
5. Kliknite krug na popisu da vidite gdje gubi vrijeme.

**Upozorenje: krugovi se uspoređuju jedna staza po jedna.** Učitavanje kruga neke druge imenovane staze briše krugove koji su već učitani.

## Gumbi {#the-buttons}

| Kontrola | Radi |
|---|---|
| **Učitaj datoteke krugova…** | birač datoteka za `.json`, `.csv`, `.txt`, `.ibt`, `.gz` i `.h3dcars`, nekoliko odjednom (`.h3dcars` je datoteka automobila, vidi [Automobili](race-replay-and-scene.md#the-cars)) |
| **Mapa…** | birač mape: svaka datoteka krugova u mapi i ispod nje |
| **Demo krugovi** | tri izmišljena kruga izmišljene staze (vidi [Demo krugovi](#demo-laps)) |
| **Očisti** | uklanja svaki krug (prikazano kad su krugovi učitani) |
| ispuštanje na prikaz | datoteke i cijele mape ispuštene na 3D prikaz učitavaju se na isti način |

Krugovi se **dodaju** onima koji su već učitani - **osim ako su iz druge imenovane staze: tada se učitani krugovi prvo brišu** (krugovi se uspoređuju jedna staza po jedna). Datoteke koje se ne mogu pročitati navedene su ispod gumba, po jedan redak za svaku; ostale se i dalje učitavaju.

## Formati datoteka {#file-formats}

Format se određuje po sadržaju, a ne po nazivu datoteke. Ukratko:

- **heat3d-lap** je datoteka koju snimač 3DHeat piše za većinu igara.
- **FH Companion** je besplatan alat koji snima krugove Forza Horizona. Piše datoteku kruga i uz nju `.json.tele.gz` datoteku (isti krug sa svim podacima svake gume, komprimirano gzipom). Odaberite obje zajedno.
- **iRacing `.ibt`** je vlastita telemetrijska datoteka iRacinga; uključite snimanje u automobilu s Alt+L i učitajte datoteku kakva jest.
- **CSV krug** je obična tablica, jedan redak po trenutku.

| Format | Tipičan izvor | Čita ga |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon i Motorsport preko Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion `.json` kruga | biblioteka krugova FH Companiona | `fromFhCompanion` |
| FH Companion telemetrija `.json.tele.gz` | uz svaku datoteku kruga FH Companiona | `readForzaTelemetry` |
| iRacing `.ibt` | vlastite telemetrijske datoteke iRacinga (snimanje uključeno s Alt+L u automobilu) | `readIbt` |
| CSV krug | `heat3d_capture laps`, dodatak Trackmania ili bilo koji CSV s `x`, `z`, stupcem vremena i, po želji, stupcem `lap` | `fromCsv` |

Kako se svaka igra snima i što šalje, dokumentirano je u snimačima: [GameCapture: igre](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
i [GameCapture: format kruga](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Vidi i [Ostale igre za utrke](other-games.md).

## Mape i staze {#folders-and-courses}

**Mapa…**, ili ispuštena mapa, donosi svaku datoteku ispod sebe. Unutar mape uzimaju se u obzir samo datoteke koje završavaju na `.json`, `.csv`, `.txt`, `.ibt` ili `.tele.gz`, a `.json` koji nije krug (vlastita datoteka staze, njezina karta) preskače se bez greške.

**Nekoliko staza u jednom odabiru.** Biblioteka krugova FH Companiona čuva svaku stazu u mapi imenovanoj `<naziv staze> (course_<x>_<z>_to_<x>_<z>)` (ili golo `course_...` za nenaimenovanu stazu). Kad odabrane datoteke leže u više od jedne takve mape staze, ništa se ne učitava; umjesto toga odjeljak **Krugovi** kaže „Ovo su krugovi N staza, a krugovi se uspoređuju za jednu po jednu stazu. Odaberite jednu:” i navodi svaku stazu s brojem krugova (datoteke koje završavaju na `.json`, `.csv` ili `.ibt`; `course.json` se ne broji), s najviše krugova prvo. Klik na jednu učitava datoteke te staze.

Staza se određuje po imenu i **početnoj** točki, ne završnoj: vožnje koje nikad nisu završene FH Companion čuva pod istim imenom i početkom (u `unfinished/`), s mjestom gdje su stale zapisanim kao kraj, i idu uz svoju stazu - u popisu označene **djelomičan**.

**Nekoliko staza među odabranim datotekama.** Kad datoteke odabrane izravno (ne iz mapa staza) jesu krugovi više od jedne imenovane staze, ista se izbira nudi po stazi; krugovi koji ne imenuju stazu idu uz onu koja je odabrana.

## Imena automobila {#car-names}

Krug se zove po punom imenu automobila, kako ga igra daje. Gdje datoteka kruga ne imenuje automobil:

1. **Mapa.** Biblioteka FH Companiona čuva krugove u `<staza>/<klasa>/<ime automobila '<yy> (car<broj>)/<štimanje>/<oznaka>/<krug>.json`. Najunutarnija mapa koja odgovara `<ime> (car<broj>)` daje ime i broj; ona koja odgovara `car<broj>` daje samo broj. Samo odabiri mapa i ispuštene mape nose tu putanju.
2. **Drugi krug istog automobila.** Kad bilo koji krug imenuje automobil, svaki krug s istom igrom i brojem automobila zove se tako - krugovi učitani zajedno i krugovi učitani kasnije u ovom pregledniku: imena se čuvaju u `localStorage` pod `heat3d.carNames` (ključ `<igra>:<broj automobila>`). U privatnom prozoru traju samo koliko i krugovi.
3. Inače „automobil 1234” po broju, ili „automobil”.

**Oznake.** Na popisu krugova krug pokazuje ime automobila; nekoliko krugova istog automobila numerirano je kao „Ime #1”, „Ime #2”. Rečenice analize koriste iste oznake kad su jedinstvene; inače ime automobila s vremenom kruga, „Ime (1:29.616)” (primjer vremena), i dalje numerirano ako još nije jedinstveno.

**Grupiranje.** Krugovi pripadaju istom automobilu (za ovojnice, profile i usporedbe) kad su im broj automobila - ili ime, ako nema broja - i indeks performansi isti (`carKey`): isti model s drugim štimanjem je drugi automobil.

**Klase.** Klasa performansi kruga je ona iz igre (Forza D..X, kratki naziv klase iRacing automobila); statistika ih poredá D, C, B, A, S1, S2, R, X, a ostale abecedno.

## Demo krugovi {#demo-laps}

**Demo krugovi** učitava tri kruga izmišljene staze (četiri ravnine i četiri zavoja udesno), napravljena jednostavnim modelom vozila ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): ograničena brzina prionljivosti svakog zavoja, prolaz ubrzanja unaprijed i prolaz kočenja unatrag, kako to radi simulator kruga.

| Krug | Automobil | Greške |
|---|---|---|
| čist | Grip car | nema |
| s greškama | Grip car | kočio 35 m rano u T2, na gas došao 30 m kasno iz T3, uzeo T4 pri 0,88 svoje brzine, vozio 1,2 m na jednu stranu |
| drugi automobil | Power car | nema; vozio 1,2 m na drugu stranu |

| Automobil (broj) | Prionljivost | Kočenje | Vuča | Snaga/masa | Otpor |
|---|---|---|---|---|---|
| Grip car (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0.0009 /m |
| Power car (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0.0006 /m |

Krug s greškama je u fokusu. Staza je postavljena onako kako Forza čuva svoj svijet (lijevoruko), pa - baš kao i pravi Forza krug - izlazi zrcaljen i kartica nudi **Obrni X**. Sva tri kruga nose podatke po kotaču, pa svaki dio kartice ima što pokazati.

## Popis krugova {#the-lap-list}

Svaki redak, s lijeva na desno:

| Element | Radi |
|---|---|
| ● / ○ | prikazuje ili skriva krug (linije, automobil, kartica, grafovi); skriveni krugovi se i dalje analiziraju |
| obojena crta | boja kruga |
| ime i oznake | kliknite za **fokus** na krugu; pokažite mišem za njegovu izvornu datoteku i automobil (ime · klasa PI · pogon) |
| ⌖ | prati ovaj automobil kamerom (ponovnim klikom prestaje) |
| ★ | uspoređuje sve s ovim krugom (postaje referenca); onemogućeno na referenci |
| × | uklanja krug |

**Oznake:** *referentni*; *najbolji u klasi X* (ili *najbolji u svojoj klasi*) na najbržem krugu klase kad ima više klasa; *djelomičan* na vožnji koja nije stigla do cilja.

**Drugi redak:** klasa (samo kad ima više klasa), vrijeme kruga (`1:29.616`), razlika prema krugu s kojim se uspoređuje (najbolji u svojoj klasi ili referenca) kao `+0.512` (primjer), i *počinje kasno* kad krug počinje više od 10 m poslije starta reference.

Uz više od 8 krugova pojavljuje se redak „N od M iscrtano” s gumbima **Prikaži sve** (iscrtava svaki krug: sporije i zapetljano) i **Samo oni koji se gledaju** (referenca, krug u fokusu i najbolji u njegovoj klasi; statistika u oba slučaja broji svaki krug).

Ispod popisa: napomena o zrcaljenju kad krugovi kažu da je iscrtavanje zrcaljeno (vidi [zrcaljeni svjetovi](race-replay-and-scene.md#mirrored-worlds)), a uz dva ili više krugova savjet „Kliknite krug da vidite gdje gubi vrijeme …”, te, uz više klasa, da se svaki krug uspoređuje s najbržim u svojoj klasi.

### Referenca i fokus {#reference-and-focus}

- **Referenca:** krug na koji se svi ostali poravnavaju i, prema zadanom, s kojim se uspoređuju. Najbrži **cjelovit** krug, osim ako ★ nije odabrao drugi (prvi učitani krug kad nijedan nije cjelovit). Uklanjanje referentnog kruga vraća na automatski izbor.
- **Fokus:** krug čiji se nalazi, kontrola automobila i karte prikazuju. Ostaje tamo gdje ga je korisnik stavio; inače je to **najsporiji** krug koji nije referenca („najviše za naučiti”). Fokusiranje kruga također otkriva i najbolji krug njegove klase. Fokusiranje reference uspoređuje je s onim drugim krugom koji je bio najbrži kroz svaki zavoj.
- **Klase:** uz krugove nekoliko klasa performansi, svaki krug uspoređuje se s najbržim cjelovitim krugom svoje klase (referencom, u klasi reference). Vidi [Statistika staze](race-course-statistics.md).

### Boje {#colours}

Svaki krug dobiva svoju boju, prema položaju u redu učitavanja, pa krug zadržava boju kad su drugi skriveni. Nijanse su raspoređene po krugu boja, kao što timski način toplinske karte raspoređuje grupe; za svaki utor svjetlina (0,52 do 0,66 u OKLCH) i kroma (0,12 do 0,18) biraju se tako da budu što dalje od susjednih utora (a zadnji od prvog) pri normalnom, protanopskom i deuteranopskom vidu, svaki barem 3:1 naspram tamne površine grafa.

## Za programere {#for-developers}

Kod: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Kako se čita svaki format {#how-each-format-is-read}

Svaki format završava kao jedan `LapTrace`: kanali pod kanonskim nazivima (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., vidi [tablicu kanala](race-charts-and-hud.md#the-channel-table)), automobil, vrijeme kruga, je li krug cjelovit i blok `meta`. Za svaki format `time` i `distance` pomiču se tako da počinju od 0, a gdje izvor nema `speed`, računa se kao udaljenost podijeljena s vremenom iz susjednih uzoraka.

#### heat3d-lap JSON {#heat3d-lap-json}

JSON objekt s `"format": "heat3d-lap"`. Čitaju se ova polja:

| Polje | Upotreba |
|---|---|
| `channels` | objekt nizova, jedan po kanalu, po kanonskom nazivu; kanali po kotaču kao `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` i `z` su obavezni |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | automobil: id, ime, indeks klase Forze (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), indeks performansi, šifra pogona (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | vrijeme kruga; posljednja vrijednost `time` kad nedostaje |
| `lap.complete` | `false` označava djelomičnu vožnju; sve drugo je cjelovito |
| `game`, `track` | imena; `game` određuje disciplinu (vidi dolje) |
| `units.slipRatio` / `units.slipAngle` | kako je klizanje skalirano: jedinica koja sadrži `raw` znači `scaled`, `normalised` znači `peak`, a sve drugo `physical` |
| `meta` | `slip`, `surface`, `discipline` kako su navedeni nadjačavaju gore navedeno |

Bez kanala `distance`, udaljenost se zbraja iz 3D položaja.

#### Datoteke krugova FH Companiona {#fh-companion-lap-files}

JSON objekt s objektom `Lap` koji sadrži niz `samples` (jedan uzorak otprilike svakih 5 m). Polja su preslikana ovako:

| FH Companion | Kanal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (pomaknuto da krug počinje od 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | isto, malim slovima |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², unatoč nazivu) |
| `Puddle` | `puddle` |

Automobil dolazi iz `Lap.carOrdinal`, `Lap.carName` (samo noviji datoteke), `Class` (ili `Lap.carClass` kao indeks klase Forze), `Lap.performanceIndex`, `Lap.drivetrain` i `Lap.peakKilowatts`; vrijeme iz `Lap.lapSeconds`; vožnja s `EndedAtFinish: false` je djelomična. Igra je `forza-horizon`.

Ove datoteke nemaju podatke o gumama ni smjeru, pa se blokade, proklizavanja i klizanja iz njih same ne mogu ocijeniti; guranja (iz upravljanja naspram putanje) i udarci i sudari i dalje se mogu. Uz svaku odaberite i `.tele.gz` za ostalo.

#### Telemetrija FH Companiona (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

JSON `{ version, columns, data }` komprimiran gzipom: cijeli Forza Data Out za jedan krug, jedan redak po paketu, s vlastitim nazivima polja igre. Stupci se traže po nazivu, nikad po položaju. Format 2 zadržava svaki paket (oko 110 u sekundi naspram 64 otkucaja igre); redak identičan onom prije njega u svemu osim u vlastitom satu snimača (`t`, `metres`) se odbacuje, pa krug čita na 64 retka u sekundi. (Opis gumba za učitavanje to kaže: „za proklizavanje svake gume pri 64 Hz”.)

| Polje Data Out | Kanal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (okvir automobila: x desno, y gore, z naprijed) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, skalirano iz 0..255 u 0..1 |
| `Steer` | `steer`, skalirano iz -127..127 u -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, pretvoreno iz Fahrenheita u °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` po kotaču |

`<Wheel>` je `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` → `FL`, `FR`, `RL`, `RR`. Klizanje je označeno kao `peak` (Forzino normalizirano klizanje: iznad 1 guma je popustila).

**Uparivanje.** Datoteka kruga `<krug>.json` i `<krug>.json.tele.gz` odabrane ili ispuštene zajedno (ista putanja, samo s `.tele.gz`) postaju **jedan** krug: kanali telemetrije, uz automobil, klasu, vrijeme, stazu i oznaku djelomičnosti iz datoteke kruga. Ime automobila iz datoteke telemetrije ima prednost kad ga ima. Sama `.tele.gz` datoteka se i dalje učitava: datoteke formata 2 nose `car` (`ordinal`, `name`, `class`, `pi`), `track` i `lapSeconds`; bez njih je vrijeme kruga trajanje iz telemetrije, a automobil nepoznat.

#### iRacing `.ibt` {#iracing-ibt}

Telemetrijska datoteka iRacinga čita se izravno (u pregledniku, bez pretvaranja): zaglavlje od 112 bajtova, pomoćno zaglavlje diska od 32 bajta, tablica varijabli (144 bajta po kanalu) i sesijski YAML.

- **Obavezni kanali:** `SessionTime`, `Lap`, `Lat`, `Lon`. Bez njih: „… nema kanale SessionTime, Lap, Lat i Lon - je li to datoteka telemetrije iRacinga?”
- **Položaji:** geografska širina i dužina raspoređeni su u metrima na ravnini tangentnoj na prvi fiksni položaj različit od nule (polumjer Zemlje 6 371 008,8 m): x istok, z jug, y nadmorska visina (`Alt`) - pa je sa zadanom kamerom sjever gore na zaslonu. Nije okvir same staze: izvučeni model staze se ne bi poravnao.
- **Krugovi:** sesija se dijeli tamo gdje se `Lap` mijenja; krug se zadržava kad ima više od 60 uzoraka, počinje ispod 5% `LapDistPct` i završava iznad 95%. Djelomični krugovi se odbacuju. Kad ih nema, kaže se: „… nema cjelovit krug staze od N km” (duljina staze iz YAML-a) ili „… nema cjelovit krug”.
- **Udaljenost:** `LapDist` od početka kruga, inače zbrojena iz položaja.
- **Automobil:** iz `DriverInfo`: igračev `CarScreenName`, `CarID` (kao broj automobila) i `CarClassShortName` (kao klasa). Staza: `TrackDisplayName`, inače `TrackName`.

Preslikani kanali:

| iRacing | Kanal | Pretvorba |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | isti nazivi | - |
| `Clutch` | `clutch` | `1 - v` (iRacing broji uključenost; naš je pedala) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radijani, suprotno od kazaljke na satu; u -1..1 desno je pozitivno; najmanje 0,1 za najveći kut, π kad nedostaje) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | isto, malim slovima | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | podijeljeno sa 100 kad je iznad 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | temperatura sredine karkase |
| `LFshockDefl` ... | `suspensionM.FL` ... | otklon amortizera, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa u psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Prefiksi kotača: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Svaki drugi** kanal s jednom vrijednošću po uzorku (nije tipa bitovnog polja) prolazi pod svojim imenom - po kotaču kad počinje prefiksom kotača (`RRspeed` postaje `speed.RR`) - pa grafovi i popisi vrijednosti na karticama nude sve njih. iRacing ne bilježi klizanje guma: kontrola automobila ocjenjuje se iz kuta driftanja - `Yaw`, prilagođen smjeru kretanja, naspram toga kamo automobil ide - te upravljanja naspram putanje. Brzina zakretanja naspram bočnog ubrzanja koristi se samo kad se smjer ne može prilagoditi, pa tada nema kuta driftanja (vidi [Događaji kontrole automobila](race-control-events.md)).

Greške: „… je prekratak za .ibt datoteku”, „… nema zaglavlje telemetrije iRacinga”, „… nema položajnih fiksa”.

#### CSV krug {#lap-csv}

Jedan redak po uzorku; mnogo krugova u jednoj datoteci razlikuje se po stupcu `lap`. Razdjelnik se otkriva iz prvih pet redaka. Neobavezni prvi redak `# { ...json... }` opisuje vožnju: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Stupac (bez obzira na velika i mala slova) | Kanal |
|---|---|
| `x`, `y`, `z` | položaj (`x` i `z` su obavezni) |
| `elapsed` ili `time` | `time` (obavezno po krugu) |
| `metres` ili `distance` | `distance` (inače zbrojeno iz položaja) |
| `speed_ms` ili `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | isto |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| bilo koji kanonski naziv kanala, npr. `latVel`, `slipIndex.FL` | samog sebe |
| `lap` | kojem krugu red pripada |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | vrijeme kruga, broj automobila, klasa, PI, staza (iz prvog retka svakog kruga) |

Bez opisa igra se uzima kao `forza-horizon`, a svaki krug kao cjelovit. Izvor kruga prikazuje se kao `<datoteka> · <krug>` kad datoteka sadrži nekoliko krugova. Greške: „… nema redaka”, „… nema stupce x i z”, „… nema krugova sa stupcem vremena”.

#### Disciplina i podloga {#discipline-and-surface}

Što analiza pretpostavlja o krugu kad ga krug sam ne kaže (`lap.ts`):

- **Disciplina:** `meta.discipline`, inače naziv igre koji odgovara `rally|wrc|dirt|rbr` je **rally**, `trackmania` je **arkada**, a sve drugo **stazna utrka**.
- **Podloga:** `meta.surface`, inače iz naziva staze i izvora: rally nazvan `monte` je **mješovito**; `snow|ice|winter|arctic|sweden` **snijeg**; rallyji na asfaltu (Spain/España/Catalunya/Costa Daurada, Croatia/Hrvatska, Central Europe, Germany/Deutschland, Japan, Corsica/Corse, Ypres, ili riječi tarmac/asphalt) **asfalt**; svaki naziv s `scramble|trail|cross country|dirt|gravel` **rastresito**; druga rally dionica procjenjuje se iz načina vožnje: preko uzoraka brzih više od 12 m/s i na tlu (barem 200 njih), 95. percentil bočnog ubrzanja od 10 m/s² ili više zajedno s medijanom kuta driftanja ispod 6° (uzetim gdje je automobil skretao na 70% te vrijednosti ili više, barem 30 uzoraka) je **asfalt**; sve drugo, ili premalo za odluku, je **rastresito**. Naziv koji nije rally, a ima `rally` u sebi, je rastresito; sve ostalo asfalt.
- Po uzorku, kanal `loose` (tutnjanje podloge Forze, materijali Trackmanije, vidi [Događaji kontrole automobila](race-control-events.md#the-ground)) nadjačava podlogu kruga.
