---
title: "Nalaganje krogov"
parent: "Analiza dirke"
nav_order: 51
lang: "sl"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Nalaganje krogov

Datoteka kroga je zapis ene vožnje: kje je bil avto in kaj je voznik počel, večkrat na sekundo. Naložite dva ali več krogov iste proge in zavihek **Analiza dirke** jih lahko primerja.

![Razdelek Krogi na zavihku Analiza dirke s tremi naloženimi demo krogi: seznam krogov, referenčna zvezdica, fokus](../assets/img/en/race-loading-laps-list.webp)

## Vaši prvi krogi {#your-first-laps}

1. Odprite zavihek **Analiza dirke**.
2. Samo ogled? Pritisnite **Demo krogi** (glej [Demo krogi](#demo-laps)).
3. Vaši lastni krogi: posnemite jih v igri s snemalnikom (glej [Formati datotek](#file-formats)). Snemalnik zapiše eno datoteko na krog.
4. Pritisnite **Naloži datoteke krogov…** in izberite dve ali več datotek iste proge, ali pritisnite **Mapa…** in izberite mapo, ki jih vsebuje. Datoteke ali mape lahko tudi spustite na 3D pogled.
5. Kliknite krog na seznamu, da vidite, kje izgublja čas.

**Opozorilo: krogi se primerjajo po eni progi naenkrat.** Nalaganje kroga druge poimenovane proge izbriše že naložene krogi.

## Gumbi {#the-buttons}

| Kontrola | Naredi |
|---|---|
| **Naloži datoteke krogov…** | izbirnik datotek za `.json`, `.csv`, `.txt`, `.ibt`, `.gz` in `.h3dcars` datoteke, več naenkrat (`.h3dcars` je datoteka avta, glej [Avti](race-replay-and-scene.md#the-cars)) |
| **Mapa…** | izbirnik map: vsaka datoteka kroga v mapi in pod njo |
| **Demo krogi** | trije izmišljeni krogi na izmišljeni progi (glej [Demo krogi](#demo-laps)) |
| **Počisti** | odstrani vsak krog (prikazano, ko so krogi naloženi) |
| spust na pogled | datoteke in cele mape, spuščene na 3D pogled, se naložijo na enak način |

Krogi se **dodajo** k naloženim – **razen če so druge poimenovane proge: potem se naloženi krogi najprej počistijo** (krogi se primerjajo po eni progi naenkrat). Datoteke, ki jih ni mogoče prebrati, so navedene pod gumbi, vsaka v svoji vrstici; ostale se naložijo.

## Formati datotek {#file-formats}

Format se ugotovi iz vsebine, ne iz imena datoteke. Z drugimi besedami:

- **heat3d-lap** je datoteka, ki jo snemalnik 3DHeat zapiše za večino iger.
- **FH Companion** je brezplačno orodje, ki posname kroge Forza Horizon. Zapiše datoteko kroga in ob njej datoteko `.json.tele.gz` (isti krog z vsemi podatki vsake pnevmatike, stisnjen z gzip). Izberite obe hkrati.
- **iRacing `.ibt`** je telemetrijska datoteka iRacinga; v avtu vklopite beleženje s tipkama Alt+L in datoteko naložite takšno, kot je.
- **CSV krogov** je navadna tabela, ena vrstica na trenutek.

| Format | Tipičen vir | Prebere |
|---|---|---|
| JSON `heat3d-lap` | `heat3d_capture telemetry --game ...` (Forza Horizon in Motorsport preko Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| JSON kroga FH Companion | knjižnica krogov FH Companion | `fromFhCompanion` |
| telemetrija FH Companion `.json.tele.gz` | ob vsaki datoteki kroga FH Companion | `readForzaTelemetry` |
| iRacing `.ibt` | telemetrijske datoteke iRacinga (beleženje z Alt+L v avtu) | `readIbt` |
| CSV krogov | `heat3d_capture laps`, vtičnik Trackmania ali kateri koli CSV z `x`, `z`, stolpcem časa in po želji stolpcem `lap` | `fromCsv` |

Kako je posnet vsak igra in kaj pošlje, dokumentirajo snemalniki:
[GameCapture: igre](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
in [GameCapture: format kroga](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Glej tudi [Druge dirkalne igre](other-games.md).

## Mape in proge {#folders-and-courses}

**Mapa…**, ali spuščena mapa, prinese vse datoteke pod njo. Znotraj mape se upoštevajo samo datoteke, ki se končajo na `.json`, `.csv`, `.txt`, `.ibt` ali `.tele.gz`, in `.json`, ki ni krog (lastna datoteka proge, njen zemljevid), se preskoči brez napake.

**Več prog v enem izboru.** Knjižnica krogov FH Companion hrani vsako progo v mapi z imenom `<ime proge> (course_<x>_<z>_to_<x>_<z>)` (ali samo `course_...` za neimenovano progo). Kadar so izbrane datoteke v več takih mapah prog, se ne naloži nič; namesto tega razdelek **Krogi** pove "To so krogi N prog, krogi se primerjajo po eni progi naenkrat. Izberite eno:" in navede vsako progo s številom krogov (datoteke, ki se končajo na `.json`, `.csv` ali `.ibt`, datoteka `course.json` se ne šteje), največ krogov najprej. Klik na eno naloži datoteke te proge.

Proga je določena z imenom in **začetno** točko, ne s končno: vožnje, ki se niso končale, hrani FH Companion pod istim imenom in začetkom (v `unfinished/`), s točko, kjer so se ustavile, kot konec; spadajo k svoji progi – na seznamu so označene kot **delni**.

**Več prog med izbranimi datotekami.** Kadar so datoteke, izbrane neposredno (ne iz map prog), krogi več poimenovanih prog, se ista izbira ponudi za vsako progo posebej; krogi, ki ne navajajo proge, gredo z tisto progo, ki je izbrana.

## Imena avtov {#car-names}

Krog se imenuje po polnem imenu avta, kot ga poda igra. Kjer datoteka kroga ne navaja avta:

1. **Mapa.** Knjižnica FH Companion hrani kroge v
   `<proga>/<razred>/<ime avta> '<yy> (car<številka>)/<ugoditev>/<oznaka>/<krog>.json`.
   Najgloblja mapa, ki ustreza `<ime> (car<številka>)`, da ime in številko; tista, ki ustreza `car<številka>`, samo številko. To pot nosijo samo izbori map in spuščene mape.
2. **Drug krog istega avta.** Ko kateri koli krog navede avto, se vsak krog z istim načinom igre in številko avta imenuje tako – krogi, naloženi skupaj, in krogi, naloženi pozneje v tem brskalniku: imena so shranjena v `localStorage` pod `heat3d.carNames` (ključ `<igra>:<številka avta>`). V zasebnem oknu trajajo, dokler trajajo krogi.
3. Sicer "avto 1234" po številki ali "avto".

**Oznake.** Na seznamu krogov krog prikaže ime svojega avta; več krogov istega avta je oštevilčenih "Ime #1", "Ime #2". Stavki analize uporabljajo ista imena, kadar so edinstvena; sicer ime avta s časom kroga, "Ime (1:29.616)" (primer časov), še nadalje oštevilčeno, če še vedno ni edinstveno.

**Združevanje.** Krogi pripadajo istemu avtu (za ovojnice, profile in primerjave), kadar sta njihova številka avta – ali ime, kadar številke ni – in njun indeks zmogljivosti enaka (`carKey`): isti model z drugačno ugodbo je drug avto.

**Razredi.** Razred zmogljivosti kroga je igrin (Forza D..X, kratko ime razreda avta iRacinga); statistika jih uredi D, C, B, A, S1, S2, R, X, nato ostale po abecedi.

## Demo krogi {#demo-laps}

**Demo krogi** naložijo tri kroge izmišljene proge (štiri ravnine in štirje desnaki), narejene z enostavnim modelom vozila
([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)):
hitrost vsakega ovinka, omejena z oprijemom, prehod pospeševanja naprej in prehod zaviranja nazaj, kot to počne simulator kroga.

| Krog | Avto | Napake |
|---|---|---|
| čist | Avto z oprijemom | nobene |
| z napakami | Avto z oprijemom | zavira 35 m prezgodaj v T2, na plin pride 30 m prepozno za T3, vzame T4 pri 0,88 svoje hitrosti, vozi 1,2 m na eno stran |
| drug avto | Avto z močjo | nobene; vozi 1,2 m na drugo stran |

| Avto (številka) | Oprijem | Zaviranje | Vleka | Moč/masa | Upor |
|---|---|---|---|---|---|
| Avto z oprijemom (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Avto z močjo (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Krog z napakami je v fokusu. Proga je urejena tako, kot Forza hrani svet (levosučno), zato – tako kot pri pravem krogu Forze – pride zrcaljena in zavihek ponudi **Obrni X**. Vsi trije krogi nosijo podatke za vsako kolo, zato ima vsak del zavihka kaj pokazati.

## Seznam krogov {#the-lap-list}

Vsaka vrstica, od leve proti desni:

| Element | Naredi |
|---|---|
| ● / ○ | pokaže / skrije krog (črte, avto, kartica, grafi); skriti krogi se še vedno analizirajo |
| barvni potez | barva kroga |
| ime in oznake | klik za **fokus** na krog; ob premiku z miško vidite njegovo izvorno datoteko in avto (ime · razred PI · pogon) |
| ⌖ | sledi temu avtu s kamero (ponovni klik ustavi) |
| ★ | primerja vse s tem krogom (naredi ga za referenco); onemogočeno na referenci |
| × | odstrani krog |

**Oznake:** *referenca*; *najboljši od X* (ali *najboljši svojega razreda*) na najhitrejšem krogu razreda, kadar je razredov več; *delni* na vožnji, ki ni prišla do cilja.

**Druga vrstica:** razred (samo pri več razredih), čas kroga (`1:29.616`), razlika do kroga, s katerim se primerja (najboljši iz njegovega razreda ali referenca), kot `+0,512` (primer), in *začne pozno*, kadar krog začne več kot 10 m za začetkom reference.

Pri več kot 8 krogih vrstica "N od M prikazanih" ponudi **Prikaži vse** (nariše vsak krog: počasneje in zmeda) in **Samo ogledovani** (referenca, izbrani krog in najboljši iz njegovega razreda; statistika šteje vsak krog v vsakem primeru).

Pod seznamom: namig o zrcaljenju, kadar krogi kažejo, da je risba zrcaljena (glej [zrcaljeni svetovi](race-replay-and-scene.md#mirrored-worlds)), in pri dveh ali več krogih namig "Kliknite krog, da vidite, kje izgublja čas …", ter pri več razredih, da se vsak krog primerja z najhitrejšim iz svojega razreda.

### Referenca in fokus {#reference-and-focus}

- **Referenca:** krog, na katerega so poravnani vsi drugi in privzeto primerjani z njim. Najhitrejši **popolni** krog, razen če ★ izbere drugega (prvi naloženi krog, kadar nobeden ni popoln). Odstranitev referenčnega kroga vrne samodejno izbiro.
- **Fokus:** krog, čigar ugotovitve, nadzor avta in zemljevidi so prikazani. Ostane, kjer ga je uporabnik postavil; sicer je to **najpočasnejši** krog, ki ni referenca ("največ za naučiti"). Fokus na krogu ga tudi pokaže, prav tako pa najboljši krog njegovega razreda. Fokus na referenci jo primerja z drugim krogom, ki je bil skozi vsak ovinek najhitrejši.
- **Razredi:** pri krogih več razredov zmogljivosti se vsak krog primerja z najhitrejšim popolnim krogom svojega razreda (referenca, v razredu reference). Glej [Statistika proge](race-course-statistics.md).

### Barve {#colours}

Vsak krog dobi svojo barvo glede na položaj v vrstnem redu nalaganja, tako da krog ohrani barvo, tudi ko so drugi skriti. Odtenki so razporejeni po barvnem krogu, kot razporedi skupine način ekip toplotnega zemljevida; za vsako mesto se svetlost (0,52 do 0,66 v OKLCH) in nasičenost (0,12 do 0,18) izbereta tako, da so kar najbolj oddaljeni od sosednjih mest (in zadnji od prvega) pri normalnem, protanopskem in deuteranopskem vidu, vsak vsaj 3:1 proti temni površini grafa.

## Za razvijalce {#for-developers}

Koda: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Kako se bere vsak format {#how-each-format-is-read}

Vsak format konča kot en `LapTrace`: kanali s kanoničnimi imeni
(`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ...,
glej [tabelo kanalov](race-charts-and-hud.md#the-channel-table)), avto,
čas kroga, ali je krog popoln, in blok `meta`. Pri vsakem formatu se `time` in
`distance` premakneta, da se začneta pri 0, kjer vir nima `speed`, pa se izračuna
kot razdalja, deljena s časom, iz sosednjih vzorcev.

#### JSON heat3d-lap {#heat3d-lap-json}

JSON predmet z `"format": "heat3d-lap"`. Prebrana polja:

| Polje | Uporaba |
|---|---|
| `channels` | predmet z nizi, eden na kanal, po kanoničnem imenu; kanali po kolesih kot `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` in `z` so obvezni |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | avto: id, ime, indeks razreda Forze (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), indeks zmogljivosti, koda pogona (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | čas kroga; zadnja vrednost `time`, kadar manjka |
| `lap.complete` | `false` označi delno vožnjo; vse drugo je popolno |
| `game`, `track` | imena; `game` določi disciplino (glej spodaj) |
| `units.slipRatio` / `units.slipAngle` | kako je zdrs merjen: enota, ki vsebuje `raw`, pomeni `scaled`, `normalised` pomeni `peak`, vse drugo `physical` |
| `meta` | `slip`, `surface`, `discipline`, kadar so navedeni, prepišejo zgornje |

Brez kanala `distance` se razdalja sešteje iz 3D položajev.

#### Datoteke kroga FH Companion {#fh-companion-lap-files}

JSON predmet z `Lap` predmetom, ki vsebuje niz `samples` (en vzorec približno na
5 m). Preslikana polja:

| FH Companion | Kanal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (premaknjeno, da se krog začne pri 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | isto, z malimi črkami |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², kljub imenu) |
| `Puddle` | `puddle` |

Avto pride iz `Lap.carOrdinal`, `Lap.carName` (samo novejše datoteke),
`Class` (ali `Lap.carClass` kot indeks razreda Forze), `Lap.performanceIndex`,
`Lap.drivetrain` in `Lap.peakKilowatts`; čas iz `Lap.lapSeconds`; vožnja z
`EndedAtFinish: false` je delna. Igra je `forza-horizon`.

Te datoteke ne nosijo podatkov o pnevmatikah in ne smeri, zato iz njih same ni
mogoče presoditi blokad, prostotka in zdrsov; potiski (iz krmila glede na pot)
in zadetki ter trki pa še vedno. Izberite še `.tele.gz` ob vsaki za ostalo.

#### Telemetrija FH Companion (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

JSON `{ version, columns, data }`, stisnjen z gzip: celoten Data Out Forze za en
krog, ena vrstica na paket, z igrinimi lastnimi imeni polj. Stolpci se iščejo po
imenu, nikoli po položaju. Format 2 hrani vsak paket (okoli 110 na sekundo proti
igrinim 64 tikom); vrstica, ki je v vsem enaka prejšnji, razen v lastni uri
snemalnika (`t`, `metres`), se zavrže, zato se krog prebere z igrinimi 64 vrsticami
na sekundo. (Nasvet gumba za nalaganje to pove: "za vsak zdrs vsake pnevmatike pri 64 Hz".)

| Polje Data Out | Kanal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (okvir avta: x desno, y navzgor, z naprej) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, pretvorjeno iz 0..255 v 0..1 |
| `Steer` | `steer`, pretvorjeno iz -127..127 v -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, pretvorjeno iz Fahrenheita v °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` po kolesu |

`<Wheel>` je `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` →
`FL`, `FR`, `RL`, `RR`. Zdrs je označen kot `peak` (Forzin normaliziran zdrs: nad
1 je pnevmatika izgubila oprijem).

**Parjenje.** Datoteka kroga `<lap>.json` in `<lap>.json.tele.gz`, izbrani ali
spuščeni skupaj (ista pot, le da je `.tele.gz`), postaneta **en** krog: kanali
telemetrije, z avtom, razredom, časom, progo in zastavico delnosti datoteke kroga.
Ime avta iz telemetrijske datoteke ima prednost, kadar ga ima.
Samo `.tele.gz` se naloži tudi sam: datoteke formata 2 nosijo `car`
(`ordinal`, `name`, `class`, `pi`), `track` in `lapSeconds`; brez tega je čas
kroga trajanje iz telemetrije same, avto pa neznan.

#### iRacing `.ibt` {#iracing-ibt}

Telemetrijska datoteka iRacinga se prebere neposredno (v brskalniku, brez
pretvorbe): 112-bajtna glava, 32-bajtna podglava na disku, tabela spremenljivk
(144 bajtov na kanal) in YAML seje.

- **Obvezni kanali:** `SessionTime`, `Lap`, `Lat`, `Lon`. Brez njih:
  "… nima kanalov SessionTime, Lap, Lat in Lon – ali je to telemetrijska datoteka iRacinga?"
- **Položaji:** zemljepisna širina in dolžina sta postavljeni v metre na ravnino, tangentno na prvi neničelni položaj (polmer Zemlje 6 371 008,8 m): x vzhod, z jug, y višina (`Alt`) – tako je pri privzeti kameri, obrnjeni na sever, sever navzgor na zaslonu. Ni okvir proge same; izvlečen model proge se ne bi poravnal.
- **Krogi:** seja se razdeli, kjer se `Lap` spremeni; krog ohranjen, kadar ima več kot 60 vzorcev, se začne pod 5 % `LapDistPct` in konča nad 95 %. Delni krogi se zavržejo. Če jih ne ostane nobeden: "… nima popolnega kroga proge dolge N km" (dolžina proge iz YAML) ali "… nima popolnega kroga".
- **Razdalja:** `LapDist` od začetka kroga, sicer seštevek iz položajev.
- **Avto:** iz `DriverInfo`: igralčev `CarScreenName`, `CarID` (kot številka avta) in `CarClassShortName` (kot razred). Proga: `TrackDisplayName`, sicer `TrackName`.

Preslikani kanali:

| iRacing | Kanal | Pretvorba |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | enaka imena | - |
| `Clutch` | `clutch` | `1 - v` (iRacing šteje vklop; naš je pedal) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radiani v nasprotni smeri urnega kazalca na -1..1, desno pozitivno; največ vsaj 0,1, π, kadar manjka) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | isto, z malimi črkami | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | deljeno s 100, kadar je nad 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | temperatura sredine ogrodja |
| `LFshockDefl` ... | `suspensionM.FL` ... | odklon amortizerja, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa v psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Predpone koles: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Vsak drug**
kanal z eno vrednostjo na vzorec (ne vrste bitnih polj) gre skozi pod svojim
imenom – po kolesu, kadar se začne s predpono kolesa (`RRspeed` postane
`speed.RR`) – tako da grafi in seznami vrednosti na karticah ponudijo vse. iRacing ne beleži zdrsa pnevmatik:
nadzor avta se presoja iz kota drifta – `Yaw`, prilagojen smeri vožnje, proti
kam avto gre – in iz krmila glede na pot. Zasuk glede na bočni pospešek se uporabi
samo, kadar smeri ni mogoče prilagoditi, zato kota drifta ni (glej [Dogodki nadzora avta](race-control-events.md)).

Napake: "… je prekratek, da bi bil datoteka .ibt", "… nima glave telemetrije iRacinga", "… nima položajnih meritev".

#### CSV krogov {#lap-csv}

Ena vrstica na vzorec; več krogov v eni datoteki se loči po stolpcu `lap`.
Ločilo se zazna iz prvih pet vrstic. Neobvezna prva vrstica
`# { ...json... }` opisuje vožnjo: `game`, `track`, `seconds`,
`complete`, `meta`, `car`.

| Stolpec (brez razlike v velikosti črk) | Kanal |
|---|---|
| `x`, `y`, `z` | položaj (`x` in `z` obvezna) |
| `elapsed` ali `time` | `time` (obvezno na krog) |
| `metres` ali `distance` | `distance` (sicer seštevek iz položajev) |
| `speed_ms` ali `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | isto |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| katero koli kanonično ime kanala, npr. `latVel`, `slipIndex.FL` | samo to |
| `lap` | kateremu krogu vrstica pripada |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | čas kroga, številka avta, razred, PI, proga (iz prve vrstice vsakega kroga) |

Brez opisa se igra vzame kot `forza-horizon`, vsak krog pa kot popoln. Vir kroga
je prikazan kot `<datoteka> · <krog>`, kadar datoteka vsebuje več krogov. Napake: "… nima vrstic", "… nima stolpcev x in z", "… nima krogov
s stolpcem časa".

#### Disciplina in podlaga {#discipline-and-surface}

Kaj analiza predpostavi o krogu, kadar krog tega ne pove (`lap.ts`):

- **Disciplina:** `meta.discipline`, sicer ime igre, ki ustreza `rally|wrc|dirt|rbr`, je **rally**; `trackmania` je **arcade**; vse drugo **circuit**.
- **Podlaga:** `meta.surface`, sicer iz imena proge in vira: rally z imenom `monte` je **mešana**; `snow|ice|winter|arctic|sweden` **sneg**; asfaltni rallyji (Španija/España/Catalunya/Costa Daurada, Hrvaška/Hrvatska, Srednja Evropa, Nemčija/Deutschland, Japonska, Korzika/Corse, Ypres, ali besede tarmac/asphalt) **asfalt**; vsako ime z
  `scramble|trail|cross country|dirt|gravel` **rahla podlaga**; drug rally odsek
  se presodi po tem, kako je bil avto voden: nad vzorci, hitrejšimi od
  12 m/s in na podlagi (vsaj 200 jih je), 95. percentil bočnega pospeška 10 m/s² ali več skupaj s srednjim kotom drifta
  pod 6° (vzet tam, kjer je avto zavijal pri 70 % tega ali več, vsaj 30
  vzorcev) je asfalt; vse drugo ali premalo podatkov za presojo je rahla podlaga. Nerallyjevsko ime z `rally` v njem je rahla podlaga; vse drugo je asfalt.
- Za vsak vzorec kanal `loose` (površinsko tresenje Forze, materiali Trackmanie, glej [Dogodki nadzora avta](race-control-events.md#the-ground)) prepiše podlago kroga.
