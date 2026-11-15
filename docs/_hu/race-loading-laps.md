---
title: "Körök betöltése"
parent: "Versenyelemzés"
nav_order: 51
lang: "hu"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Körök betöltése

A körfájl egy menet felvétele: hol volt az autó és mit csinált a vezető, másodpercenként sokszor. Ha ugyanazon pálya két vagy több körét tölti be, a **Versenyelemzés** fül össze tudja hasonlítani őket.

![A Versenyelemzés fül Körök része három demókörrel betöltve: körlista, referenciacsillag, fókusz](../assets/img/en/race-loading-laps-list.webp)

## Az első köreid {#your-first-laps}

1. Nyisd meg a **Versenyelemzés** fület.
2. Csak nézelődsz? Nyomd meg a **Demókörök** gombot (lásd [Demókörök](#demo-laps)).
3. Saját köreid: rögzítsd őket a játékban egy rögzítővel (lásd [Fájlformátumok](#file-formats)). A rögzítő fájlonként egy kört ír.
4. Nyomd meg a **Körfájlok betöltése…** gombot, és válassz ki két vagy több fájlt ugyanarról a pályáról, vagy nyomd meg a **Mappa…** gombot, és válaszd ki a mappát, amelyben vannak. Fájlokat vagy mappákat a 3D-s nézetre is húzhatsz.
5. Kattints egy körre a listában, hogy lásd, hol veszít időt.

**Figyelem: a köröket egyszerre csak egy pályán hasonlítjuk össze.** Egy másik, nevesített pálya körének betöltése törli a már betöltött köröket.

## A gombok {#the-buttons}

| Vezérlő | Mit csinál |
|---|---|
| **Körfájlok betöltése…** | fájlválasztó `.json`, `.csv`, `.txt`, `.ibt`, `.gz` és `.h3dcars` fájlokhoz, egyszerre többet (a `.h3dcars` egy autófájl, lásd [Autók](race-replay-and-scene.md#the-cars)) |
| **Mappa…** | mappaválasztó: a mappában és az alatta lévő mappákban minden körfájl |
| **Demókörök** | három kitalált kör egy kitalált pályán (lásd [Demókörök](#demo-laps)) |
| **Törlés** | eltávolít minden kört (akkor látszik, ha vannak betöltött körök) |
| húzás a nézetre | a 3D-s nézetre húzott fájlok és egész mappák ugyanúgy töltődnek be |

A körök a betöltöttekhez **hozzáadódnak** – **kivéve, ha egy másik, nevesített pálya körei: akkor a betöltött körök előbb törlődnek** (a köröket egyszerre csak egy pályán hasonlítjuk össze). Az olvashatatlan fájlok a gombok alatt listázódnak, soronként egy-egy; a többi betöltődik.

## Fájlformátumok {#file-formats}

A formátumot a tartalomból állapítjuk meg, nem a fájlnévből. Egyszerűen:

- A **heat3d-lap** az a fájl, amelyet a 3DHeat rögzítője a legtöbb játékhoz ír.
- A **FH Companion** egy ingyenes eszköz, amely a Forza Horizon köreit rögzíti. Ír egy körfájlt, és mellé egy `.json.tele.gz` fájlt (ugyanaz a kör, minden gumi adatával, gzip-pel tömörítve). Ezt a kettőt együtt válaszd ki.
- Az **iRacing `.ibt`** az iRacing saját telemetriafájlja; kapcsold be a naplózást az autóban az Alt+L-lel, és a fájlt változtatás nélkül töltsd be.
- A **körös CSV** egy egyszerű tábla, soronként egy pillanattal.

| Formátum | Tipikus forrás | Olvassa |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon és Motorsport Data Out-on át, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion kör `.json` | az FH Companion körkönyvtára | `fromFhCompanion` |
| FH Companion telemetria `.json.tele.gz` | minden FH Companion körfájl mellett | `readForzaTelemetry` |
| iRacing `.ibt` | az iRacing saját telemetriafájljai (naplózás az autóban az Alt+L-lel) | `readIbt` |
| körös CSV | `heat3d_capture laps`, a Trackmania bővítmény, vagy bármely CSV `x`, `z`, időoszloppal és opcionálisan `lap` oszloppal | `fromCsv` |

Minden játék rögzítését és azt, mit küld, a rögzítők dokumentálják:
[GameCapture: játékok](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
és [GameCapture: a körformátum](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Lásd még [Más versenyjátékok](other-games.md).

## Mappák és pályák {#folders-and-courses}

A **Mappa…**, vagy egy húzott mappa, minden alatta lévő fájlt behoz. Egy mappán belül csak a `.json`, `.csv`, `.txt`, `.ibt` vagy `.tele.gz` végű fájlok számítanak, és egy olyan `.json`, amely nem kör (egy pálya saját fájlja, a térképe), hiba nélkül kimarad.

**Több pálya egy kijelölésben.** Az FH Companion körkönyvtára minden pályát egy `<pályanév> (course_<x>_<z>_to_<x>_<z>)` nevű mappában tart (vagy egy puszta `course_...` nevű mappában, ha a pálya névtelen). Ha a kiválasztott fájlok egynél több ilyen pályamappában vannak, semmi sem töltődik be; helyette a **Körök** rész ezt mondja: „Ezek N pálya körei, a köröket egyszerre csak egy pályán hasonlítjuk össze. Válassz egyet:”, és felsorolja mindegyik pályát a körei számával (a `.json`, `.csv` vagy `.ibt` végű fájlok, a `course.json` nélkül), a legtöbb körrel elöl. Egyre kattintva az adott pálya fájljai töltődnek be.

Egy pályát a neve és a **kezdőpontja** azonosít, nem a végpontja: a be nem fejezett menetek, amelyeket az FH Companion ugyanazon a néven és kezdőponton tart (a `unfinished/` mappában), a megálló helyüket tekintik végpontnak, és a pályájukkal együtt jönnek – a listában **részleges** jelöléssel.

**Több pálya a kiválasztott fájlok között.** Ha a közvetlenül kiválasztott fájlok (nem pályamappákból) egynél több nevesített pálya körei, minden pályához ugyanez a választás jár; a pályát nem nevező körök azzal a pályával együtt jönnek, amelyet kiválasztottak.

## Autónevek {#car-names}

A kört az autó teljes nevéről hívjuk, ahogy a játék adja. Ha a körfájl nem nevezi meg az autót:

1. **A mappa.** Az FH Companion könyvtára a köröket `<pálya>/<osztály>/<autónév> '<yy> (car<szám>)/<hangolás>/<címke>/<kör>.json` alatt tartja. A legbelső mappa, amely `<név> (car<szám>)` alakú, adja a nevet és a számot; a `car<szám>` alakú csak a számot. Ez az útvonal csak mappaválasztásnál és húzott mappáknál van meg.
2. **Ugyanazon autó másik köre.** Amint egy kör megnevez egy autót, minden kör, amelynek ugyanaz a játéka és autószáma, így hívódik – az együtt betöltött körök, és az ebben a böngészőben később betöltött körök is: a neveket a `localStorage` tárolja a `heat3d.carNames` alatt (kulcsa `<játék>:<autószám>`). Privát ablakban annyi ideig maradnak, mint a körök.
3. Egyébként „car 1234” a száma szerint, vagy „car”.

**Feliratok.** A körlistában egy kör az autója nevét mutatja; ugyanazon autó több köre „Név #1”, „Név #2” számozást kap. Az elemzés mondatai ugyanezeket a feliratokat használják, ha egyediek; egyébként az autónév a köridővel, „Név (1:29.616)” (példaidők), és tovább számozva, ha még mindig nem egyedi.

**Csoportosítás.** Körök ugyanahhoz az autóhoz tartoznak (burkolókhoz, profilokhoz és összehasonlításokhoz), ha az autószámuk – vagy név, ha nincs szám – és a teljesítményindexük megegyezik (`carKey`): ugyanaz a modell más hangolással másik autó.

**Osztályok.** Egy kör teljesítményosztálya a játéké (Forza D..X, az iRacing autóosztályának rövid neve); a statisztikák sorrendje D, C, B, A, S1, S2, R, X, utána a többi ábécé szerint.

## Demókörök {#demo-laps}

A **Demókörök** három kört tölt be egy kitalált pályáról (négy egyenes és négy jobbkanyar), amelyet egy egyszerű járműmodell készített ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): minden kanyar tapadás-korlátozott sebessége, egy előre haladó gyorsítási menet és egy hátrafelé haladó fékezési menet, ahogy egy köridő-szimulátor csinálja.

| Kör | Autó | Hibák |
|---|---|---|
| tiszta | Tapadós autó | nincs |
| hibákkal | Tapadós autó | 35 m-rel korán fékez a T2-be, 30 m-rel későn kap gázt a T3-ból kijövet, a T4-et sebessége 0,88-ánál veszi, 1,2 m-t visz az egyik oldalra |
| másik autó | Teljesítményes autó | nincs; 1,2 m-t visz a másik oldalra |

| Autó (szám) | Tapadás | Fékezés | Hajtás | Teljesítmény/tömeg | Légellenállás |
|---|---|---|---|---|---|
| Tapadós autó (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Teljesítményes autó (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

A hibás kör a fókuszált. A pálya úgy van kiosztva, ahogy a Forza a világát tartja (balkezes), így – pontosan mint egy valódi Forza-körnél – tükrözötten jön ki, és a fül az **X invertálását** kínálja. Mindhárom körben kerekenkénti adat van, így a fül minden része tud mit mutatni.

## A körlista {#the-lap-list}

Soronként, balról jobbra:

| Elem | Mit csinál |
|---|---|
| ● / ○ | megmutatja / elrejti a kört (vonalak, autó, kártya, diagramok); az elrejtett körök attól még elemzésre kerülnek |
| színes vonal | a kör színe |
| név és címkék | kattintással a kör **fókuszba** kerül; fölé húzva a forrásfájlja és az autója (név · osztály PI · hajtás) |
| ⌖ | ennek az autónak a követése a kamerával (újra kattintva áll le) |
| ★ | mindent ehhez a körhöz hasonlít (referenciává teszi); a referencián nem elérhető |
| × | eltávolítja a kört |

**Címkék:** *referencia*; *legjobb X* (vagy *osztályának legjobbja*) egy osztály leggyorsabb körén, ha több osztály van; *részleges* olyan menetnél, amely nem ért célba.

**A második sor:** az osztály (csak több osztálynál), a köridő (`1:29.616`), a különbség ahhoz a körhöz, amellyel hasonlítjuk (osztályának legjobbja vagy a referencia), mint `+0.512` (példa), és a *későn indul*, ha a kör több mint 10 m-rel a referencia kezdete után kezdődik.

Nyolc körnél többnél egy „N közül M rajzolva” sor **Összes megjelenítése** (minden kör rajzolása: lassabb, és összevissza) és **Csak a vizsgáltak** (a referencia, a fókuszált kör és osztályának legjobbja; a statisztikák mindkét esetben minden kört számolnak) gombot kínál.

A lista alatt: a tükrözési tipp, ha a körök szerint a rajz tükrözött (lásd [tükrözött világok](race-replay-and-scene.md#mirrored-worlds)), és két vagy több körnél a „Kattints egy körre, hogy lásd, hol veszít időt …” tipp, illetve több osztálynál az, hogy minden kört a saját osztálya leggyorsabbjához hasonlítunk.

### Referencia és fókusz {#reference-and-focus}

- **Referencia:** az a kör, amelyhez minden más igazodik, és alapból ehhez hasonlítjuk. A leggyorsabb **teljes** kör, hacsak a ★ másikat nem választ (ha nincs teljes kör, az első betöltött kör). A referencia-kör eltávolítása visszaállítja az automatikus választást.
- **Fókusz:** az a kör, amelynek megállapításai, autókezelése és térképei látszanak. Ott marad, ahová a felhasználó tette; egyébként a **leglassabb** kör, amely nem a referencia („a legtöbb tanulnivaló”). Egy kör fókuszba helyezése láthatóvá teszi, és osztályának legjobb körét is. A referencia fókuszálása azzal hasonlítja össze, aki az egyes kanyarokban a leggyorsabb volt.
- **Osztályok:** több teljesítményosztály körénél minden kört a saját osztálya leggyorsabb teljes körével hasonlítunk (a referenciát a referencia osztályában). Lásd [Pályastatisztikák](race-course-statistics.md).

### Színek {#colours}

Minden kör a betöltési sorrendje szerinti saját színt kap, így egy kör megtartja a színét, amikor mások el vannak rejtve. A színárnyalatok a színkörön úgy vannak elosztva, ahogy a hőtérkép csapatmódja a csoportokat; minden helyhez a világosságot (0,52–0,66 OKLCH-ban) és a telítettséget (0,12–0,18) úgy választjuk, hogy a szomszédos helyektől (az utolsó az elsőtől) a legtávolabb álljon normál, protan és deután látásban, mindegyik legalább 3:1 arányban a sötét diagramfelülettel szemben.

## Fejlesztőknek {#for-developers}

Kód: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Hogyan olvasódik minden formátum {#how-each-format-is-read}

Minden formátum egyetlen `LapTrace`-ben végződik: csatornák kanonikus nevekkel (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., lásd a [csatornatáblázatot](race-charts-and-hud.md#the-channel-table)), az autó, a köridő, az, hogy teljes kör-e, és egy `meta` blokk. Minden formátumnál a `time` és a `distance` nullától kezdődőre van eltolva, és ahol a forrásnak nincs `speed`-je, azt a távolságból és az időből számoljuk a szomszédos mintákból.

#### heat3d-lap JSON {#heat3d-lap-json}

Egy JSON-objektum `"format": "heat3d-lap"` mezővel. Olvasott mezők:

| Mező | Használat |
|---|---|
| `channels` | objektum tömbökkel, csatornánként, kanonikus névvel; kerekenkénti csatornák `név.FL`, `név.FR`, `név.RL`, `név.RR` alakban. A `time`, `x` és `z` kötelező |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | az autó: azonosító, név, Forza-osztályindex (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), teljesítményindex, hajtáskód (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | a köridő; ha hiányzik, az utolsó `time` érték |
| `lap.complete` | `false` részleges menetet jelöl; minden más teljes |
| `game`, `track` | nevek; a `game` dönti el a szakágat (lent) |
| `units.slipRatio` / `units.slipAngle` | hogyan skálázott a csúszás: a `raw` részt tartalmazó egység `scaled`, a `normalised` `peak`, minden más `physical` |
| `meta` | a megadott `slip`, `surface`, `discipline` felülírja a fentieket |

`distance` csatorna nélkül a távolságot a 3D-s pozíciókból összegezzük.

#### FH Companion körfájlok {#fh-companion-lap-files}

Egy JSON-objektum, amelynek `Lap` objektuma egy `samples` tömböt tartalmaz (kb. 5 m-enként egy minta). Leképezett mezők:

| FH Companion | Csatorna |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (úgy eltolva, hogy a kör 0-nál kezdődjön) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | ugyanaz, kisbetűvel |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², a nevük ellenére) |
| `Puddle` | `puddle` |

Az autó a `Lap.carOrdinal`, `Lap.carName` (csak újabb fájloknál), `Class` (vagy `Lap.carClass` Forza-osztályindexként), `Lap.performanceIndex`, `Lap.drivetrain` és `Lap.peakKilowatts` mezőkből jön; az idő a `Lap.lapSeconds`-ból; a menet, ahol `EndedAtFinish: false`, részleges. A játék `forza-horizon`.

Ezek a fájlok nem hordoznak gumiadatot és irányszöget, így a blokkolást, a kerékpörgést és a csúszásokat csak ezekből nem lehet megítélni; a tolásokat (a kormány és az útvonal szembeállításából) és az ütközéseket igen. Minden fájl mellé válaszd ki a hozzá tartozó `.tele.gz`-t is a többihez.

#### FH Companion telemetria (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

Gzip-pel tömörített JSON `{ version, columns, data }`: a Forza teljes Data Out-ja egy körre, soronként egy csomag, a játék saját mezőneveivel. Az oszlopokat névvel keressük, sosem pozícióval. A 2-es formátum minden csomagot megtart (kb. 110 másodpercenként a játék 64 ciklusával szemben); az a sor, amely mindenben egyezik az előzővel, kivéve a rögzítő saját óráját (`t`, `metres`), kimarad, így egy kör a játék 64 sor/másodperc sebességével olvasódik. (A betöltő gomb súgója ezt mondja: „minden gumi csúszása 64 Hz-en”.)

| Data Out mező | Csatorna |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (autó-keret: x jobbra, y felfelé, z előre) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, 0..255-ről 0..1-re skálázva |
| `Steer` | `steer`, -127..127-ről -1..1-re skálázva |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, Fahrenheitből °C-ra átszámolva |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` kerekenként |

A `<Wheel>` értéke `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` → `FL`, `FR`, `RL`, `RR`. A csúszás `peak`-ként van jelölve (a Forza normalizált csúszása: 1 felett a gumi elengedte az utat).

**Párosítás.** Egy `<kör>.json` és `<kör>.json.tele.gz` körfájl, amelyet együtt választanak ki vagy húznak be (ugyanaz az útvonal, csak `.tele.gz`-vel), **egy** kört alkot: a telemetria csatornái, a körfájl autójával, osztályával, idejével, pályájával és részleges jelölésével. A telemetriafájl saját autónevének van elsőbbsége, ha van neki. Egyedül a `.tele.gz` is betöltődik: a 2-es formátumú fájlok hordozzák a `car` (`ordinal`, `name`, `class`, `pi`), `track` és `lapSeconds` mezőket; ezek nélkül a köridő a telemetria saját hossza, az autó pedig ismeretlen.

#### iRacing `.ibt` {#iracing-ibt}

Az iRacing telemetriafájlját közvetlenül olvassuk (a böngészőben, átalakítás nélkül): a 112 bájtos fejlécet, a 32 bájtos lemez-alfejlécet, a változótáblázatot (csatornánként 144 bájt) és a munkamenet YAML-jét.

- **Kötelező csatornák:** `SessionTime`, `Lap`, `Lat`, `Lon`. Nélkülük: „… nincs SessionTime, Lap, Lat és Lon csatornája – iRacing telemetriafájl?”
- **Pozíciók:** a szélesség és hosszúság méterekben, az első nem nulla helymeghatározásnál érintősíkon van kiosztva (Föld sugara 6 371 008,8 m): x kelet, z dél, y a magasság (`Alt`) – így az alapértelmezett kamera mellett észak felfelé mutat a képernyőn. Nem a pálya saját kerete: egy kinyert pályamodell nem illene rá.
- **Körök:** a munkamenet ott van felosztva, ahol a `Lap` változik; egy kör megmarad, ha több mint 60 mintája van, a `LapDistPct` 5%-a alatt kezd, és 95% felett végez. A részleges köröket eldobjuk. Ha nem marad egy sem: „… nincs teljes köre az N km-es pályán” (a pálya hossza a YAML-ből) vagy „… nincs teljes köre”.
- **Távolság:** a `LapDist` a kör kezdetétől, különben a pozíciókból összegezve.
- **Autó:** a `DriverInfo`-ból: a játékos `CarScreenName`-je, `CarID` (autószámként) és `CarClassShortName` (osztályként). Pálya: `TrackDisplayName`, különben `TrackName`.

Leképezett csatornák:

| iRacing | Csatorna | Átalakítás |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | ugyanaz a név | - |
| `Clutch` | `clutch` | `1 - v` (az iRacing a bekapcsoltságot számolja; a mi pedálunk) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radiánban, az óramutató-járással ellentétesen; -1..1, jobbra pozitív; a max legalább 0,1, hiányában π) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | ugyanaz, kisbetűvel | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | 100-zal osztva, ha 1,5 felett van |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | a gumitest középső hőmérséklete |
| `LFshockDefl` ... | `suspensionM.FL` ... | lengéscsillapító-kitérés, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa-ból psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Kerék-előtagok: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Minden más** mintánként egy értéket adó csatorna (nem bitmező-típusú) a saját nevén megy át – kerekenként, ha kerék-előtaggal kezdődik (`RRspeed` lesz `speed.RR`) –, így a grafikonok és a kártyák értéklistái mindegyiket kínálják. Az iRacing nem naplóz gumi-csúszást: az autókezelést a sodródási szögből ítéljük meg – a `Yaw`, a haladási irányra illesztve, szemben azzal, hová megy az autó – és a kormányból az útvonalhoz képest. A yaw-sebességet az oldalirányú gyorsulással csak akkor használjuk, ha az irány nem illeszthető, így nincs sodródási szög (lásd [Autóvezetési események](race-control-events.md)).

Hibák: „… túl rövid ahhoz, hogy .ibt fájl legyen”, „… nem rendelkezik iRacing telemetria-fejléccel”, „… nincs helymeghatározása”.

#### Körös CSV {#lap-csv}

Soronként egy minta; több kör egy fájlban a `lap` oszloppal különböztethető meg. Az elválasztót az első öt sorból érzékeljük. Egy opcionális első sor, `# { ...json... }`, leírja a menetet: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Oszlop (kis- és nagybetű nem számít) | Csatorna |
|---|---|
| `x`, `y`, `z` | pozíció (`x` és `z` kötelező) |
| `elapsed` vagy `time` | `time` (körönként kötelező) |
| `metres` vagy `distance` | `distance` (különben a pozíciókból összegezve) |
| `speed_ms` vagy `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | ugyanaz |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| bármely kanonikus csatornanév, pl. `latVel`, `slipIndex.FL` | önmaga |
| `lap` | melyik körhöz tartozik a sor |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | köridő, autószám, osztály, PI, pálya (körönként az első sorból) |

Leírás nélkül a játék `forza-horizon`, és minden kör teljesnek számít. Egy kör forrása `<fájl> · <kör>` alakban látszik, ha a fájlban több kör van. Hibák: „… nem tartalmaz sorokat”, „… nem tartalmaz x és z oszlopot”, „… nem tartalmaz időoszloppal rendelkező köröket”.

#### Szakág és felület {#discipline-and-surface}

Amit az elemzés feltételez egy körről, ha a kör nem mondja meg (`lap.ts`):

- **Szakág:** a `meta.discipline`, különben ha a játéknév illik a `rally|wrc|dirt|rbr` mintára, akkor **ralli**; a `trackmania` **arcade**; minden más **pálya**.
- **Felület:** a `meta.surface`, különben a pálya nevéből és a forrásból: a `monte` nevű ralli **vegyes**; a `snow|ice|winter|arctic|sweden` **hó**; az aszfaltos ralik (Spain/España/Catalunya/Costa Daurada, Croatia/Hrvatska, Central Europe, Germany/Deutschland, Japan, Corsica/Corse, Ypres, vagy a tarmac/asphalt szavak) **aszfalt**; bármely név, amely `scramble|trail|cross country|dirt|gravel` szót tartalmaz, **laza talaj**; egyéb ralli-szakaszt a vezetés módjából ítélünk meg: a gyorsabb, 12 m/s-nál gyorsabb, a talajon (legalább 200 ilyen) mintákon a oldalirányú gyorsulás 95. percentilise 10 m/s² vagy több, és a sodródási szög mediánja 6° alatt (ott vettük, ahol az autó az ennek 70%-ánál vagy többnél kanyarodott, legalább 30 mintán) az aszfalt; minden más, vagy ami túl kevés a megítéléshez, laza talaj. Ha egy nem ralli nevében `rally` szerepel, az laza; minden más aszfalt.
- Mintánként a `loose` csatorna (a Forza talajrezgése, a Trackmania anyagai, lásd [Autóvezetési események](race-control-events.md#the-ground)) felülírja a kör felületét.
