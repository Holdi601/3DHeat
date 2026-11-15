---
title: "Učitavanje krugova"
parent: "Analiza utrke"
nav_order: 51
lang: "bs"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Učitavanje krugova

Datoteka kruga je snimak jedne vožnje: gdje je automobil bio i šta je vozač radio, mnogo puta u sekundi. Učitajte dva ili više krugova iste staze, i kartica **Analiza utrke** ih može uporediti.

![Odjeljak Krugovi na kartici Analiza utrke, sa tri učitana demo kruga: lista krugova, zvjezdica reference, fokus](../assets/img/en/race-loading-laps-list.webp)

## Vaši prvi krugovi {#your-first-laps}

1. Otvorite karticu **Analiza utrke**.
2. Samo gledate? Pritisnite **Demo krugovi** (vidi [Demo krugovi](#demo-laps)).
3. Vaši vlastiti krugovi: snimite ih u igri sa snimačem (vidi [Formati datoteka](#file-formats)). Snimač piše jednu datoteku po krugu.
4. Pritisnite **Učitaj datoteke krugova…** i izaberite dvije ili više datoteka iste staze, ili pritisnite **Mapa…** i izaberite mapu u kojoj su. Datoteke ili mape možete prevući i na 3D prikaz.
5. Kliknite krug na listi da vidite gdje gubi vrijeme.

**Upozorenje: krugovi se upoređuju jedna staza po jedna.** Učitavanje kruga druge imenovane staze briše krugove koji su već učitani.

## Dugmad {#the-buttons}

| Kontrola | Radi |
|---|---|
| **Učitaj datoteke krugova…** | birač datoteka za `.json`, `.csv`, `.txt`, `.ibt`, `.gz` i `.h3dcars` datoteke, nekoliko odjednom (`.h3dcars` je datoteka automobila, vidi [Automobili](race-replay-and-scene.md#the-cars)) |
| **Mapa…** | birač mape: svaka datoteka kruga u mapi i ispod nje |
| **Demo krugovi** | tri izmišljena kruga izmišljene staze (vidi [Demo krugovi](#demo-laps)) |
| **Očisti** | uklanja svaki krug (prikazuje se kada su krugovi učitani) |
| prevlačenje na prikaz | datoteke i cijele mape prevučene na 3D prikaz učitavaju se na isti način |

Krugovi se **dodaju** onima koji su učitani – **osim ako su sa druge imenovane staze: tada se učitani krugovi prvo brišu** (krugovi se upoređuju jedna staza po jedna). Datoteke koje se ne mogu pročitati navode se ispod dugmadi, jedan red za svaku; ostale se i dalje učitavaju.

## Formati datoteka {#file-formats}

Format se prepoznaje iz sadržaja, a ne iz naziva datoteke. Ukratko:

- **heat3d-lap** je datoteka koju 3DHeat snimač piše za većinu igara.
- **FH Companion** je besplatan alat koji snima krugove u Forza Horizon-u. Piše datoteku kruga i, uz nju, `.json.tele.gz` datoteku (isti krug sa podacima svake gume, kompresovan gzip-om). Izaberite obje zajedno.
- **iRacing `.ibt`** je iRacing-ova vlastita telemetrijska datoteka; uključite snimanje u automobilu sa Alt+L i učitajte datoteku kakva jeste.
- **CSV krug** je obična tabela, jedan red za svaki trenutak.

| Format | Tipičan izvor | Čita ga |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon i Motorsport preko Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion `.json` krug | biblioteka krugova FH Companion-a | `fromFhCompanion` |
| FH Companion telemetrija `.json.tele.gz` | uz svaku datoteku kruga FH Companion-a | `readForzaTelemetry` |
| iRacing `.ibt` | iRacing-ove vlastite telemetrijske datoteke (uključeno snimanje sa Alt+L u automobilu) | `readIbt` |
| CSV krug | `heat3d_capture laps`, Trackmania dodatak, ili bilo koji CSV sa `x`, `z`, kolonom vremena i opciono kolonom `lap` | `fromCsv` |

Kako se svaka igra snima i šta šalje, dokumentuju snimači:
[GameCapture: igre](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
i [GameCapture: format kruga](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Vidi i [Ostale trkaće igre](other-games.md).

## Mape i staze {#folders-and-courses}

**Mapa…**, ili prevučena mapa, donosi svaku datoteku ispod nje. Unutar mape uzimaju se u obzir samo datoteke koje se završavaju na `.json`, `.csv`, `.txt`, `.ibt` ili `.tele.gz`, a `.json` koji nije krug (sopstvena datoteka staze, njena mapa) preskače se bez greške.

**Više staza u jednom izboru.** Biblioteka krugova FH Companion-a čuva svaku stazu u mapi imena `<naziv staze> (course_<x>_<z>_to_<x>_<z>)` (ili samo `course_...` za neimenovanu stazu). Kada izabrane datoteke leže u više takvih mapa staza, ništa se ne učitava; umjesto toga odjeljak **Krugovi** kaže „Ovo su krugovi N staza, a krugovi se upoređuju jedna staza po jedna. Izaberite jednu:“ i navodi svaku stazu sa brojem krugova (datoteke koje se završavaju na `.json`, `.csv` ili `.ibt`, `course.json` se ne računa), od najviše krugova. Klik na jednu učitava datoteke te staze.

Staza se označava nazivom i **početnom** tačkom, a ne krajnjom: vožnje koje nisu završene FH Companion čuva pod istim nazivom i početkom (u `unfinished/`), sa mjestom gdje su stale kao krajem, i idu uz svoju stazu – u listi označene kao **djelimičan**.

**Više staza među izabranim datotekama.** Kada datoteke izabrane direktno (ne iz mapa staza) su krugovi više imenovanih staza, ista izbor se nudi za svaku stazu; krugovi koji ne imenuju stazu idu uz onu koja je izabrana.

## Nazivi automobila {#car-names}

Krug se zove po punom nazivu automobila, kako ga igra daje. Gdje datoteka kruga ne imenuje automobil:

1. **Mapa.** Biblioteka FH Companion-a čuva krugove u `<staza>/<klasa>/<naziv automobila> '<yy> (car<broj>)/<podešavanje>/<oznaka>/<krug>.json`. Najunutrašnja mapa koja odgovara `<naziv> (car<broj>)` daje naziv i broj; ona koja odgovara `car<broj>` samo broj. Ovu putanju nose samo izbori mapa i prevučene mape.
2. **Drugi krug istog automobila.** Kada bilo koji krug imenuje automobil, svaki krug sa istom igrom i brojem automobila zove se tako – krugovi učitani zajedno, i krugovi učitani kasnije u ovom pregledaču: nazivi se čuvaju u `localStorage` pod `heat3d.carNames` (ključ `<igra>:<broj automobila>`). U privatnom prozoru traju koliko i krugovi.
3. Inače „car 1234“ po broju, ili „car“.

**Oznake.** U listi krugova krug prikazuje naziv automobila; više krugova istog automobila numerisano je „Naziv #1“, „Naziv #2“. Rečenice analize koriste iste oznake kada su jedinstvene; inače naziv automobila sa vremenom kruga, „Naziv (1:29.616)“ (primjer vremena), dalje numerisano ako ni to nije jedinstveno.

**Grupisanje.** Krugovi pripadaju istom automobilu (za ovojnice, profile i poređenja) kada su njihov broj automobila – ili naziv ako nema broja – i njihov indeks performansi isti (`carKey`): isti model sa drugim podešavanjem je drugi automobil.

**Klase.** Performansna klasa kruga je igrina (Forza D..X, iRacing-ov kratki naziv klase automobila); statistika ih slaže D, C, B, A, S1, S2, R, X, zatim ostale po abecedi.

## Demo krugovi {#demo-laps}

**Demo krugovi** učitava tri kruga izmišljene staze (četiri pravca i četiri desne krivine), napravljena jednostavnim modelom vozila ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): brzina svake krivine ograničena prianjanjem, prolaz ubrzanja unaprijed i prolaz kočenja unazad, kao što radi simulator kruga.

| Krug | Automobil | Greške |
|---|---|---|
| čist | Automobil sa prianjanjem | nema |
| sa greškama | Automobil sa prianjanjem | kočio 35 m rano u T2, dao gas 30 m kasno na izlazu iz T3, uzeo T4 pri 0,88 svoje brzine, vozio 1,2 m na jednu stranu |
| drugi automobil | Automobil sa snagom | nema; vozio 1,2 m na drugu stranu |

| Automobil (broj) | Prianjanje | Kočenje | Vuča | Snaga/masa | Otpor |
|---|---|---|---|---|---|
| Automobil sa prianjanjem (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Automobil sa snagom (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Krug sa greškama je u fokusu. Staza je postavljena onako kako Forza čuva svoj svijet (lijevoruk), pa – tačno kao pravi Forza krug – izlazi ogledalski, a kartica nudi **Obrni X**. Sva tri kruga nose podatke po točku, pa svaki dio kartice ima šta da pokaže.

## Lista krugova {#the-lap-list}

Svaki red, s lijeva na desno:

| Element | Radi |
|---|---|
| ● / ○ | prikazuje / sakriva krug (linije, automobil, kartica, grafikoni); skriveni krugovi se i dalje analiziraju |
| obojena linija | boja kruga |
| naziv i oznake | klik za **fokus** na krug; pređite mišem za njegovu izvornu datoteku i automobil (naziv · klasa PI · pogon) |
| ⌖ | prati ovaj automobil kamerom (ponovni klik zaustavlja) |
| ★ | uporedi sve sa ovim krugom (postavi ga za referencu); onemogućeno na referenci |
| × | uklanja krug |

**Oznake:** *referenca*; *najbolji u klasi X* (ili *najbolji u svojoj klasi*) na najbržem krugu klase kada ima više klasa; *djelimičan* na vožnji koja nije stigla do cilja.

**Druga linija:** klasa (samo kada ima više klasa), vrijeme kruga (`1:29.616`), razlika prema krugu sa kojim se poredi (najbolji u svojoj klasi, ili referenca) kao `+0,512` (primjer), i *počinje kasno* kada krug počinje više od 10 m poslije starta reference.

Sa više od 8 krugova red „N od M iscrtano“ nudi **Prikaži sve** (iscrtaj svaki krug: sporije, i zamršeno) i **Samo posmatrani** (referenca, krug u fokusu i najbolji u njegovoj klasi; statistika u svakom slučaju broji svaki krug).

Ispod liste: savjet o ogledalu kada krugovi kažu da je crtanje ogledalsko (vidi [ogledalski svjetovi](race-replay-and-scene.md#mirrored-worlds)), a sa dva ili više krugova savjet „Kliknite krug da vidite gdje gubi vrijeme …“, plus, sa više klasa, da se svaki krug poredi sa najbržim u svojoj klasi.

### Referenca i fokus {#reference-and-focus}

- **Referenca:** krug na koji se svi ostali poravnavaju i, podrazumijevano, sa kojim se upoređuju. Najbrži **potpun** krug, osim ako ★ izabere drugi (prvi učitani krug kada nijedan nije potpun). Uklanjanje referentnog kruga vraća na automatski izbor.
- **Fokus:** krug čiji se nalazi, kontrola automobila i mape prikazuju. Ostaje tamo gdje ga je korisnik stavio; inače je to **najsporiji** krug koji nije referenca („najviše za naučiti“). Fokusiranje kruga ga takođe otkriva, a i najbolji krug njegove klase. Fokusiranje reference poredi je sa onim drugim krugom koji je bio najbrži kroz svaku krivinu.
- **Klase:** sa krugovima više performansnih klasa, svaki krug se poredi sa najbržim potpunim krugom svoje klase (referenca, u klasi reference). Vidi [Statistika staze](race-course-statistics.md).

### Boje {#colours}

Svaki krug dobija svoju boju, prema položaju u redoslijedu učitavanja, pa krug zadržava boju kada su drugi sakriveni. Nijanse su raspoređene po krugu boja kao što režim tima u toplotnoj mapi raspoređuje grupe; za svako mjesto svjetlina (0,52 do 0,66 u OKLCH) i zasićenost (0,12 do 0,18) biraju se tako da budu što dalje od susjednih mjesta (a posljednja od prve) pod normalnim, protan i deutan vidom, svaka najmanje 3:1 naspram tamne površine grafikona.

## Za programere {#for-developers}

Kod: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Kako se čita svaki format {#how-each-format-is-read}

Svaki format završava kao jedan `LapTrace`: kanali sa kanonskim nazivima (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., vidi [tabelu kanala](race-charts-and-hud.md#the-channel-table)), automobil, vrijeme kruga, da li je potpun krug, i blok `meta`. Za svaki format, `time` i `distance` se pomjeraju da počnu od 0, a gdje izvor nema `speed`, računa se kao rastojanje kroz vrijeme iz susjednih uzoraka.

#### heat3d-lap JSON {#heat3d-lap-json}

JSON objekat sa `"format": "heat3d-lap"`. Polja koja se čitaju:

| Polje | Upotreba |
|---|---|
| `channels` | objekat nizova, jedan po kanalu, po kanonskom nazivu; kanali po točku kao `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` i `z` su obavezni |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | automobil: id, naziv, Forza indeks klase (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), indeks performansi, šifra pogona (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | vrijeme kruga; posljednja vrijednost `time` kada nedostaje |
| `lap.complete` | `false` označava djelimičnu vožnju; sve drugo je potpuno |
| `game`, `track` | nazivi; `game` određuje disciplinu (vidi dolje) |
| `units.slipRatio` / `units.slipAngle` | kako je klizanje skalirano: jedinica koja sadrži `raw` znači `scaled`, `normalised` znači `peak`, sve drugo `physical` |
| `meta` | `slip`, `surface`, `discipline` kako su dati nadjačavaju gore navedeno |

Bez kanala `distance`, rastojanje se zbraja iz 3D pozicija.

#### FH Companion datoteke krugova {#fh-companion-lap-files}

JSON objekat sa objektom `Lap` koji sadrži niz `samples` (jedan uzorak otprilike svakih 5 m). Polja koja se preslikavaju:

| FH Companion | Kanal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (pomjereno tako da krug počne od 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | isto, malim slovima |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², uprkos nazivu) |
| `Puddle` | `puddle` |

Automobil dolazi iz `Lap.carOrdinal`, `Lap.carName` (samo novije datoteke), `Class` (ili `Lap.carClass` kao Forza indeks klase), `Lap.performanceIndex`, `Lap.drivetrain` i `Lap.peakKilowatts`; vrijeme iz `Lap.lapSeconds`; vožnja sa `EndedAtFinish: false` je djelimična. Igra je `forza-horizon`.

Ove datoteke ne nose podatke o gumama ni o smjeru, pa se blokade, proklizavanja i klizanja ne mogu ocijeniti samo iz njih; guranja (iz volana naspram putanje) i udarci i sudari i dalje mogu. Izaberite i `.tele.gz` uz svaku za ostalo.

#### FH Companion telemetrija (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

JSON `{ version, columns, data }` kompresovan gzip-om: cijeli Forza Data Out za jedan krug, jedan red po paketu, sa igrinim vlastitim nazivima polja. Kolone se traže po nazivu, nikad po položaju. Format 2 čuva svaki paket (oko 110 u sekundi naspram 64 takta igre); red identičan prethodnom u svemu osim u satu snimača (`t`, `metres`) se odbacuje, pa se krug čita sa 64 reda u sekundi igre. (Opis dugmeta za učitavanje to kaže: „za klizanje svake gume na 64 Hz“.)

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
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` po točku |

`<Wheel>` je `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` → `FL`, `FR`, `RL`, `RR`. Klizanje je označeno kao `peak` (Forzino normalizovano klizanje: iza 1 guma je izgubila prianjanje).

**Sparivanje.** Datoteka kruga `<krug>.json` i `<krug>.json.tele.gz` izabrane ili prevučene zajedno (ista putanja, samo `.tele.gz`) postaju **jedan** krug: kanali telemetrije, sa automobilom, klasom, vremenom, stazom i oznakom djelimičnosti iz datoteke kruga. Naziv automobila iz telemetrijske datoteke ima prednost kada ga ima. Sama `.tele.gz` datoteka se i dalje učitava: datoteke formata 2 nose `car` (`ordinal`, `name`, `class`, `pi`), `track` i `lapSeconds`; bez njih je vrijeme kruga sopstveno trajanje telemetrije, a automobil je nepoznat.

#### iRacing `.ibt` {#iracing-ibt}

iRacing-ova telemetrijska datoteka čita se direktno (u pregledaču, bez pretvaranja): zaglavlje od 112 bajtova, podzaglavlje diska od 32 bajta, tabela varijabli (144 bajta po kanalu) i YAML sesije.

- **Obavezni kanali:** `SessionTime`, `Lap`, `Lat`, `Lon`. Bez njih: „… nema kanale SessionTime, Lap, Lat i Lon – je li ovo iRacing telemetrijska datoteka?“
- **Pozicije:** geografska širina i dužina raspoređuju se u metrima na ravni tangentnoj na prvi fiks različit od nule (poluprečnik Zemlje 6 371 008,8 m): x istok, z jug, y visina (`Alt`) – pa je uz podrazumijevanu kameru sjever gore na ekranu. Nije okvir same staze: izvučeni model staze se ne bi poklopio.
- **Krugovi:** sesija se dijeli gdje se `Lap` mijenja; krug se zadržava kada ima više od 60 uzoraka, počinje ispod 5% `LapDistPct` i završava iznad 95%. Djelimični krugovi se odbacuju. Kada ne ostane nijedan: „… nema potpun krug staze od N km“ (dužina staze iz YAML-a) ili „… nema potpun krug“.
- **Rastojanje:** `LapDist` od starta kruga, inače zbrojeno iz pozicija.
- **Automobil:** iz `DriverInfo`: `CarScreenName` igrača, `CarID` (kao broj automobila) i `CarClassShortName` (kao klasa). Staza: `TrackDisplayName`, inače `TrackName`.

Preslikani kanali:

| iRacing | Kanal | Pretvaranje |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | isti nazivi | - |
| `Clutch` | `clutch` | `1 - v` (iRacing broji uključenost; naš je pedala) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radijani suprotno kazaljci na satu u -1..1, desno pozitivno; maks. najmanje 0,1, π kada nedostaje) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | isto, malim slovima | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | dijeli se sa 100 kada je iznad 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | srednja temperatura karkasa |
| `LFshockDefl` ... | `suspensionM.FL` ... | otklon amortizera, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa u psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Prefiksi točkova: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Svaki drugi** kanal sa jednom vrijednošću po uzorku (ne tipa bitskog polja) prenosi se pod svojim nazivom – po točku kada počinje prefiksom točka (`RRspeed` postaje `speed.RR`) – pa grafikoni i liste vrijednosti kartica nude sve njih. iRacing ne bilježi klizanje guma: kontrola automobila se ocjenjuje iz ugla driftovanja – `Yaw`, uklopljen u smjer kretanja, naspram toga kamo automobil ide – i iz volana naspram putanje. Brzina skretanja naspram bočnog ubrzanja koristi se samo kada pravac ne može da se uklopi, pa tada nema ugla driftovanja (vidi [Događaji kontrole automobila](race-control-events.md)).

Greške: „… je prekratka za .ibt datoteku“, „… nema iRacing telemetrijsko zaglavlje“, „… nema fiksove pozicije“.

#### CSV krug {#lap-csv}

Jedan red po uzorku; više krugova u jednoj datoteci razlikuje se po koloni `lap`. Razdjelnik se prepoznaje iz prvih pet redova. Opcioni prvi red `# { ...json... }` opisuje vožnju: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Kolona (bez obzira na velika i mala slova) | Kanal |
|---|---|
| `x`, `y`, `z` | pozicija (`x` i `z` obavezni) |
| `elapsed` ili `time` | `time` (obavezno po krugu) |
| `metres` ili `distance` | `distance` (inače zbrojeno iz pozicija) |
| `speed_ms` ili `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | isto |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| bilo koji kanonski naziv kanala, npr. `latVel`, `slipIndex.FL` | sam sebe |
| `lap` | kom krugu red pripada |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | vrijeme kruga, broj automobila, klasa, PI, staza (iz prvog reda svakog kruga) |

Bez opisa igra se uzima kao `forza-horizon`, a svaki krug kao potpun. Izvor kruga prikazuje se kao `<datoteka> · <krug>` kada datoteka ima više krugova. Greške: „… nema redova“, „… nema kolone x i z“, „… nema krugova sa kolonom vremena“.

#### Disciplina i podloga {#discipline-and-surface}

Šta analiza pretpostavlja o krugu kada krug to ne kaže (`lap.ts`):

- **Disciplina:** `meta.discipline`, inače naziv igre koji odgovara `rally|wrc|dirt|rbr` je **reli**, `trackmania` je **arkadni**, sve ostalo **staza**.
- **Podloga:** `meta.surface`, inače iz naziva staze i izvora: reli imenovan `monte` je **mješovito**; `snow|ice|winter|arctic|sweden` **snijeg**; asfaltni reli (Spain/España/Catalunya/Costa Daurada, Croatia/Hrvatska, Central Europe, Germany/Deutschland, Japan, Corsica/Corse, Ypres, ili riječi tarmac/asphalt) **asfalt**; svaki naziv sa `scramble|trail|cross country|dirt|gravel` **rastresita podloga**; druga etapa relija se procjenjuje po tome kako je automobil vožen: nad uzorcima bržim od 12 m/s i na tlu (najmanje 200 njih), 95. percentil bočnog ubrzanja od 10 m/s² ili više zajedno sa medijanom ugla driftovanja ispod 6° (uzeto tamo gdje je automobil skretao pri 70% toga ili više, najmanje 30 uzoraka) je asfalt; sve ostalo, ili premalo da se kaže, je rastresita podloga. Naziv koji nije reli, a sadrži `rally`, je rastresit; sve drugo asfalt.
- Po uzorku, kanal `loose` (tutnjanje terena kod Forze, materijali kod Trackmanie, vidi [Događaji kontrole automobila](race-control-events.md#the-ground)) nadjačava podlogu kruga.
