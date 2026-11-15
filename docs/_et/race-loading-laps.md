---
title: "Ringide laadimine"
parent: "Sõiduanalüüs"
nav_order: 51
lang: "et"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Ringide laadimine

Ringifail on ühe sõidu salvestis: kus auto oli ja mida juht tegi, mitu korda sekundis. Laadi kaks või enam sama raja ringi ja **Sõiduanalüüs** vaade saab need võrrelda.

![Sõiduanalüüsi vaate Ringid jaotis, kus on laaditud kolm demoringi: ringide nimekiri, võrdlustäht, fookus](../assets/img/en/race-loading-laps-list.webp)

## Esimesed ringid {#your-first-laps}

1. Ava **Sõiduanalüüs** vaade.
2. Ainult vaatad? Vajuta **Demoringid** (vt [Demoringid](#demo-laps)).
3. Oma ringid: salvesta need mängus salvestajaga (vt [Failivormingud](#file-formats)). Salvestaja kirjutab ühe faili iga ringi kohta.
4. Vajuta **Laadi ringifailid…** ja vali kaks või enam sama raja faili, või vajuta **Kaust…** ja vali kaust, mis neid hoiab. Võid faile või kaustu ka vaate peale lohistada.
5. Klõpsa ringi nimekirjas, et näha, kus see aega kaotab.

**Hoiatus: ringe võrreldakse ühe raja kaupa.** Teise nimetatud raja ringi laadimine tühjendab juba laaditud ringid.

## Nupud {#the-buttons}

| Juhtnupp | Mis teeb |
|---|---|
| **Laadi ringifailid…** | failivalija failidele `.json`, `.csv`, `.txt`, `.ibt`, `.gz` ja `.h3dcars`, mitu korraga (`.h3dcars` on autofail, vt [Autod](race-replay-and-scene.md#the-cars)) |
| **Kaust…** | kaustavalija: iga ringifail selles kaustas ja selle all |
| **Demoringid** | kolm väljamõeldud ringi väljamõeldud rajal (vt [Demoringid](#demo-laps)) |
| **Tühjenda** | eemaldab kõik ringid (näidatakse, kui ringid on laaditud) |
| lohistamine vaatele | vaate peale lohistatud failid ja terved kaustad laaditakse samamoodi |

Ringid **lisatakse** juba laaditutele – **kui need ei ole teise nimetatud raja ringid. Siis tühjendatakse enne laaditud ringid** (ringe võrreldakse ühe raja kaupa). Faile, mida ei saa lugeda, loetletakse nuppude all, üks rida igaüks; ülejäänud laaditakse.

## Failivormingud {#file-formats}

Vorming tuvastatakse sisu järgi, mitte failinime järgi. Lihtsalt öeldes:

- **heat3d-lap** on fail, mida 3DHeat'i salvestaja kirjutab enamiku mängude jaoks.
- **FH Companion** on tasuta tööriist, mis salvestab Forza Horizoni ringe. See kirjutab ringifaili ja selle kõrvale `.json.tele.gz` faili (sama ring iga rehvi andmetega, gzip-pakitud). Vali need mõlemad korraga.
- **iRacingi `.ibt`** on iRacingi enda telemeetriafail. Lülita autos sisse logimine klahviga Alt+L ja laadi fail nii, nagu see on.
- **Ringi CSV** on lihtne tabel, üks rida iga hetke kohta.

| Vorming | Tüüpiline allikas | Lugeja |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon ja Motorsport Data Outi kaudu, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companioni ringi `.json` | FH Companioni ringide kogu | `fromFhCompanion` |
| FH Companioni telemeetria `.json.tele.gz` | iga FH Companioni ringifaili kõrval | `readForzaTelemetry` |
| iRacingi `.ibt` | iRacingi enda telemeetriafailid (logimine sisse klahviga Alt+L autos) | `readIbt` |
| ringi CSV | `heat3d_capture laps`, Trackmania plugin või mis tahes CSV, kus on `x`, `z`, aja veerg ja valikuliselt `lap` veerg | `fromCsv` |

Kuidas iga mäng salvestatakse ja mida see saadab, on kirjeldatud salvestajate dokumentatsioonis: [GameCapture: mängud](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) ja [GameCapture: ringivorming](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md). Vt ka [Muud võidusõidumängud](other-games.md).

## Kaustad ja rajad {#folders-and-courses}

**Kaust…** või lohistatud kaust toob kaasa kõik selle all olevad failid. Kaustas võetakse arvesse ainult faile, mille nimi lõpeb `.json`, `.csv`, `.txt`, `.ibt` või `.tele.gz`. `.json`, mis ei ole ring (raja enda fail, tema kaart), jäetakse vahele ilma veateta.

**Mitu rada ühes valikus.** FH Companioni ringiteek hoiab iga raja kaustas nimega `<raja nimi> (course_<x>_<z>_to_<x>_<z>)` (või lihtsalt `course_...`, kui rajal nime pole). Kui valitud failid asuvad rohkem kui ühes sellises rajakaustas, ei laadita midagi. Selle asemel ütleb **Ringid** jaotis: "Need on N raja ringid, ja ringe võrreldakse ühe raja kaupa. Vali üks:" ning loetleb iga raja koos ringide arvuga (failid, mille nimi lõpeb `.json`, `.csv` või `.ibt`, välja arvatud `course.json`), kõige rohkem ringe sisaldav esimesena. Klõps ühel laadib selle raja failid.

Raja võti on tema nimi ja **algpunkt**, mitte lõpp-punkt. Lõpetamata sõite hoiab FH Companion samas nimes ja samast algusest (kaustas `unfinished/`), kus need peatusid lõpp-punktina, ja need käivad koos oma rajaga. Nimekirjas on need märgitud **osalisena**.

**Mitu rada valitud failides.** Kui otse valitud failid (mitte rajakaustadest) on rohkem kui ühe nimetatud raja ringid, pakutakse sama valikut iga raja kohta eraldi. Ringid, mis ei nimeta rada, lähevad kaasa sellele rajale, mis valitakse.

## Autode nimed {#car-names}

Ring saab nime oma auto täieliku nime järgi, nii nagu mäng selle annab. Kui ringifail ei nimeta autot:

1. **Kaust.** FH Companioni raamatukogu hoiab ringe kaustas `<kursus>/<klass>/<auto nimi> '<yy> (car<number>)/<häälestus>/<silt>/<ring>.json`. Kõige sisemine kaust, mis sobib kujuga `<nimi> (car<number>)`, annab nime ja numbri; kujuga `car<number>` annab ainult numbri. Ainult kausta valikud ja lohistatud kaustad kannavad seda teed.
2. **Teine sama auto ring.** Kui mõni ring nimetab auto, kutsutakse iga ringi, millel on sama mäng ja autonumber, selle nimega. See kehtib koos laaditud ringidega ja hiljem selles brauseris laaditud ringidega: nimed hoitakse `localStorage`-is võtme `heat3d.carNames` all (võti `<mäng>:<autonumber>`). Privaatses aknas kestavad need nii kaua kui ringid.
3. Muidu "car 1234" tema numbri järgi või "car".

**Sildid.** Ringide nimekirjas näitab ring oma auto nime. Mitu sama auto ringi on nummerdatud "Nimi #1", "Nimi #2". Analüüsi laused kasutavad samu silte, kui need on ainulaadsed. Muidu on see auto nimi koos ringi ajaga, "Nimi (1:29.616)" (näidisaeg), nummerdatud edasi, kui ikka ei ole ainulaadne.

**Rühmitamine.** Ringid kuuluvad samale autole (ümbrikute, profiilide ja võrdluste jaoks), kui nende autonumber (või nimi, kui numbrit pole) ja jõudlusindeks on samad (`carKey`). Sama mudel erineva häälestusega on teine auto.

**Klassid.** Ringi jõudlusklass on mängu oma (Forza D..X, iRacingi auto klassi lühinimi). Statistikas järjestatakse klassid D, C, B, A, S1, S2, R, X ja seejärel tähestikuliselt ülejäänud.

## Demoringid {#demo-laps}

**Demoringid** laadib kolm ringi väljamõeldud rajalt (neli sirget ja neli paremkäelist kurvi). Need on tehtud lihtsa sõidukimudeliga ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): iga kurvi haarepiiratud kiirus, kiirendusläbi edasi ja pidurdusläbi tagasi, nagu teeb ringisimulaator.

| Ring | Auto | Vead |
|---|---|---|
| puhas | Haarduvusauto | pole |
| vigadega | Haarduvusauto | pidurdab T2 sisse 35 m varem, gaasi peale T3-st väljudes 30 m hiljem, võtab T4 0,88 oma kiirusest, sõidab 1,2 m ühele poole |
| teine auto | Võimsusauto | pole; sõidab 1,2 m teisele poole |

| Auto (number) | Haare | Pidurdus | Traktsioon | Võimsus/mass | Takistus |
|---|---|---|---|---|---|
| Haarduvusauto (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Võimsusauto (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Ring vigadega on fookuses. Rada on joonistatud nii, nagu Forza hoiab oma maailma (vasakukäeline), nii et – täpselt nagu päris Forza ringi puhul – tuleb see peegeldatuna ja vaade pakub **Pööra X ümber**. Kõik kolm ringi kannavad rattapõhiseid andmeid, nii et iga vaate osal on midagi näidata.

## Ringide nimekiri {#the-lap-list}

Iga rida vasakult paremale:

| Element | Teeb |
|---|---|
| ● / ○ | näitab / peidab ringi (jooned, auto, kaart, graafikud); peidetud ringe analüüsitakse ikka |
| värviriba | ringi värv |
| nimi ja sildid | klõps viib **fookusesse**; hõljutades tema allikafail ja auto (nimi · klassi PI · veosüsteem) |
| ⌖ | jälita seda autot kaameraga (uuesti klõps peatab) |
| ★ | võrdle kõike selle ringiga (tee võrdlusringiks); võrdlusringil keelatud |
| × | eemalda ring |

**Sildid:** *võrdlusring*; *parim X-st* (või *klassi parim*) klassi kiireimal ringil, kui klasse on mitu; *osaline* sõidul, mis ei jõudnud lõpuni.

**Teine rida:** klass (ainult mitme klassi korral), ringi aeg (`1:29.616`), vahe ringiga, millega seda võrreldakse (oma klassi parim või võrdlusring), kujul `+0.512` (näide), ja *algab hiljem*, kui ring algab rohkem kui 10 m võrdlusringi algusest.

Kui ringe on rohkem kui 8, on rea "N-st M joonistatud" juures **Näita kõiki** (joonista iga ring: aeglasem ja segane) ja **Ainult vaadeldavad** (võrdlusring, fookusring ja oma klassi parim). Statistika loeb igal juhul kõiki ringe.

Loendi all: peegelduse vihje, kui ringid ütlevad, et joonis on peegeldatud (vt [peegeldatud maailmad](race-replay-and-scene.md#mirrored-worlds)), ja kahe või enama ringi korral vihje "Klõpsa ringil, et näha, kus see aega kaotab …", ning mitme klassi korral ka see, et iga ring võrreldakse oma klassi kiireimaga.

### Võrdlus ja fookus {#reference-and-focus}

- **Võrdlusring:** ring, millega kõik teised on joondatud ja mida vaikimisi võrreldakse. See on kiireim **täielik** ring, kui ★ pole valinud teist (esimene laaditud ring, kui täielikku pole). Võrdlusringi eemaldamine viib tagasi automaatse valiku juurde.
- **Fookus:** ring, mille leide, auto juhtimist ja kaarte näidatakse. See jääb sinna, kuhu kasutaja selle pani. Muidu on see **aeglaseim** ring, mis ei ole võrdlusring ("kõige rohkem õppida"). Ringi fookusesse panek muudab ta ka nähtavaks ja tema klassi parima ringi nähtavaks. Võrdlusringi fookusesse panek võrdleb seda sellega, milline teine ring oli igas kurvis kiireim.
- **Klassid:** mitme jõudlusklassi ringide korral võrreldakse iga ringi oma klassi kiireima täieliku ringiga (võrdlusringi klassis võrdlusringiga). Vt [Raja statistika](race-course-statistics.md).

### Värvid {#colours}

Iga ring saab oma värvi laadimisjärjekorra järgi, nii et ring säilitab oma värvi, kui teised on peidetud. Toonid on paigutatud värviratta peale nii, nagu soojuskaardi meeskonnarežiim rühmi paigutab. Iga koha heledus (0,52 kuni 0,66 OKLCH-is) ja küllastus (0,12 kuni 0,18) on valitud nii, et see seisaks kõige kaugemal naabritest (ja viimane esimesest) tavalise, protanoopse ja deuteranoopse nägemise korral. Iga värv on vähemalt 3:1 kontrastis tumeda graafikupinna vastu.

## Arendajatele {#for-developers}

Kood: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Kuidas iga vorming loetakse {#how-each-format-is-read}

Iga vorming lõpeb ühe `LapTrace`-ina: kanalid kanooniliste nimedega (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` jne, vt [kanalitabelit](race-charts-and-hud.md#the-channel-table)), auto, ringi aeg, see, kas ring on täielik, ja `meta` plokk. Igas vormingus algavad `time` ja `distance` 0-st, ja kui allikal ei ole `speed`-i, arvutatakse see vahemaa ja aja jagatisena naaberproovidest.

#### heat3d-lap JSON {#heat3d-lap-json}

JSON-objekt, kus on `"format": "heat3d-lap"`. Loetavad väljad:

| Väli | Kasutus |
|---|---|
| `channels` | objekt massiividest, üks iga kanali kohta kanoonilise nime järgi; rattapõhised kanalid `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` ja `z` on kohustuslikud |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | auto: id, nimi, Forza klassi indeks (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), jõudlusindeks, veosüsteemi kood (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | ringi aeg; kui puudub, siis viimane `time` väärtus |
| `lap.complete` | `false` märgib osalist sõitu; muu on täielik |
| `game`, `track` | nimed; `game` määrab discipliini (allpool) |
| `units.slipRatio` / `units.slipAngle` | kuidas libisemine on skaleeritud: ühik, mis sisaldab `raw`, tähendab `scaled`; `normalised` tähendab `peak`; muu tähendab `physical` |
| `meta` | `slip`, `surface`, `discipline`, kui antud, tühistavad ülaltoodu |

Ilma `distance` kanalita summeeritakse vahemaa 3D-asukohtadest.

#### FH Companioni ringifailid {#fh-companion-lap-files}

JSON-objekt, mille `Lap` objekt hoiab `samples` massiivi (umbes iga 5 m kohta üks proov). Seosed:

| FH Companion | Kanal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (nihutatud nii, et ring algab 0-st) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | samad, väikeste tähtedega |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², nime vaatamata) |
| `Puddle` | `puddle` |

Auto tuleb `Lap.carOrdinal`-ist, `Lap.carName`-ist (ainult uuemad failid), `Class`-ist (või `Lap.carClass`-ist Forza klassi indeksina), `Lap.performanceIndex`-ist, `Lap.drivetrain`-ist ja `Lap.peakKilowatts`-ist. Aeg tuleb `Lap.lapSeconds`-ist. Sõit, mille `EndedAtFinish` on `false`, on osaline. Mäng on `forza-horizon`.

Need failid ei kanna rehvide andmeid ega suunda. Seetõttu ei saa lukke, rattalibisemisi ja libisemisi neist üksi hinnata; tõuked (roolist raja suhtes) ning tabamused ja kokkupõrked saab ikka. Vali ka iga faili kõrvale `.tele.gz`, et saada ülejäänu.

#### FH Companioni telemeetria (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

Gzip-pakitud JSON `{ version, columns, data }`: Forza kogu Data Out ühe ringi kohta, üks rida paketi kohta, mängu enda väljanimedega. Veerge otsitakse nime järgi, mitte positsiooni järgi. Formaat 2 hoiab iga paketi (umbes 110 sekundis mängu 64 tiku vastu). Rida, mis on eelmisega identne kõiges peale salvestaja enda kella (`t`, `metres`), jäetakse ära, nii et ring loetakse mängu 64 rea sekundis. (Laadimisnupu tooltip ütleb seda: "iga rehvi libisemine 64 Hz-ga".)

| Data Out väli | Kanal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (autoraamis: x paremale, y üles, z ette) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, skaleeritud 0..255 → 0..1 |
| `Steer` | `steer`, skaleeritud -127..127 → -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, teisendatud Fahrenheitist °C-ks |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` igal rattal |

`<Wheel>` on `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` → `FL`, `FR`, `RL`, `RR`. Libisemine on märgitud `peak`-iks (Forza normaliseeritud libisemine: üle 1 on rehv haardest väljas).

**Paarimine.** Ringifail `<ring>.json` ja `<ring>.json.tele.gz`, mis on valitud või lohistatud koos (sama tee, aga `.tele.gz`), saavad **ühe** ringi: telemeetria kanalid, ringifaili auto, klass, aeg, rada ja osalisuse lipp. Telemeetriafaili enda autonimi võidab, kui sellel on see. Üksi laaditav `.tele.gz` laadib ikka. Formaat 2 failid kannavad `car` (`ordinal`, `name`, `class`, `pi`), `track` ja `lapSeconds`. Ilma nendeta on ringi aeg telemeetria enda kestus ja auto on teadmata.

#### iRacingi `.ibt` {#iracing-ibt}

iRacingi telemeetriafail loetakse otse (brauseris, teisendamata): 112-baidine päis, 32-baidine ketta alampäis, muutujate tabel (144 baiti kanali kohta) ja sessiooni YAML.

- **Nõutavad kanalid:** `SessionTime`, `Lap`, `Lat`, `Lon`. Ilma nendeta: "… ei ole kanaleid SessionTime, Lap, Lat ja Lon – kas see on iRacingi telemeetriafail?"
- **Positsioonid:** laiuskraad ja pikkuskraad paigutatakse meetrites tasapinnale, mis puutub esimest nullist erinevat fiksi (Maa raadius 6 371 008,8 m): x ida, z lõuna, y kõrgus (`Alt`). Vaikimisi kaameraga on seega põhi ekraanil üleval. See ei ole raja enda raam: väljavõetud kursuse mudel ei joonduks.
- **Ringid:** sessioon jaotatakse kohtadesse, kus `Lap` muutub. Ring säilitatakse, kui tal on rohkem kui 60 proovi, ta algab alla 5% `LapDistPct`-st ja lõpeb üle 95%. Osalised ringid jäetakse välja. Kui ühtegi ei jää: "… ei ole täielikku ringi N km pikkusel rajal" (raja pikkus YAML-ist) või "… ei ole täielikku ringi".
- **Vahemaa:** `LapDist` ringi algusest, muidu summeeritud asukohtadest.
- **Auto:** `DriverInfo`-st: mängija `CarScreenName`, `CarID` (autonumbrina) ja `CarClassShortName` (klassina). Rada: `TrackDisplayName`, muidu `TrackName`.

Kaardistatud kanalid:

| iRacing | Kanal | Teisendus |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | samad nimed | - |
| `Clutch` | `clutch` | `1 - v` (iRacing loeb sisselülitust; meie oma on pedaal) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radiaanid vastupäeva; −1..1, parem positiivne; max vähemalt 0,1, π puudumisel) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | samad, väikeste tähtedega | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | jagatud 100-ga, kui üle 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | kere keskmine temperatuur |
| `LFshockDefl` ... | `suspensionM.FL` ... | amortisaatori läbivajumine, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa → psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Ratta eesliited: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Iga teine** kanal, millel on üks väärtus proovi kohta (mitte bitiväli), antakse edasi oma nimega. Kui see algab ratta eesliitega, on see rattapõhine (`RRspeed` saab `speed.RR`), nii et graafikud ja kaartide väärtuste loendid pakuvad kõiki. iRacing ei logi rehvi libisemist, seega hinnatakse auto juhtimist triivinurga järgi: `Yaw`, sobitatuna sõidusuunaga, võrreldes suunaga, kuhu auto läheb, ja roolipööret võrreldes rajaga. Külgkiirenduse ja pöörlemiskiiruse võrdlust kasutatakse ainult siis, kui suunda ei saa sobitada, nii et triivinurka ei ole (vt [Sõiduki juhtimise sündmused](race-control-events.md)).

Vead: "… on liiga lühike, et olla .ibt-fail", "… ei ole iRacingi telemeetriapäist", "… ei ole positsioonifiksi".

#### Ringi CSV {#lap-csv}

Üks rida proovi kohta. Mitut ringi ühes failis eristab `lap` veerg. Eraldaja tuvastatakse esimestest viiest reast. Valikuline esimene rida `# { ...json... }` kirjeldab sõitu: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Veerg (suurtähtedeta) | Kanal |
|---|---|
| `x`, `y`, `z` | asukoht (`x` ja `z` kohustuslikud) |
| `elapsed` või `time` | `time` (kohustuslik igal ringil) |
| `metres` või `distance` | `distance` (muidu summeeritud asukohtadest) |
| `speed_ms` või `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | samad |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| mis tahes kanoonilise kanali nimi, nt `latVel`, `slipIndex.FL` | iseenesest |
| `lap` | millisele ringile rida kuulub |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | ringi aeg, autonumber, klass, PI, rada (iga ringi esimesest reast) |

Ilma kirjelduseta võetakse mänguks `forza-horizon` ja iga ring täielikuna. Ringi allikas näidatakse kujul `<fail> · <ring>`, kui failis on mitu ringi. Vead: "… ei ole ridu", "… ei ole veerge x ja z", "… ei ole ühtegi ringi aja veeruga".

#### Distsipliin ja pinnas {#discipline-and-surface}

Mida analüüs eeldab ringi kohta, kui ring seda ei ütle (`lap.ts`):

- **Distsipliin:** `meta.discipline`, muidu: mängu nimi, mis sobib mustriga `rally|wrc|dirt|rbr`, on **rally**; `trackmania` on **arcade**; kõik muu on **circuit**.
- **Pinnas:** `meta.surface`, muidu rajanimest ja allikast. Rally nimega `monte` on **segapinnas**. `snow|ice|winter|arctic|sweden` on **lumi**. Asfaldirallid (Spain/España/Catalunya/Costa Daurada, Croatia/Hrvatska, Central Europe, Germany/Deutschland, Japan, Corsica/Corse, Ypres või sõnad tarmac/asphalt) on **asfalt**. Mis tahes nimi, millel on `scramble|trail|cross country|dirt|gravel`, on **lahtine pinnas**. Muu rallilõiku hinnatakse selle järgi, kuidas autot juhiti: proovidest, mis sõidavad kiiremini kui 12 m/s ja on maapinnal (vähemalt 200), on külgkiirenduse 95. protsentiil vähemalt 10 m/s² ja mediaanne triivinurk alla 6° (võetud kohtadest, kus auto kurvis 70% sellest või rohkem, vähemalt 30 proovi). Kui see täidetakse, on **asfalt**. Kõik muu või liiga vähe, et öelda, on **lahtine pinnas**. Mitte-rally nimi, milles on `rally`, on **lahtine pinnas**; kõik muu on **asfalt**.
- Proovi kohta tühistab `loose` kanal (Forza pinna vibratsioon, Trackmania materjalid, vt [Sõiduki juhtimise sündmused](race-control-events.md#the-ground)) ringi pinna.
