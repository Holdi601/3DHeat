---
title: "Načítanie kôl"
parent: "Analýza pretekov"
nav_order: 51
lang: "sk"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Načítanie kôl

Súbor kola je záznam jednej jazdy: kde bolo auto a čo vodič robil, mnohokrát za sekundu. Načítajte dve alebo viac kôl tej istej trate a karta **Analýza pretekov** ich dokáže porovnať.

![Časť Kolá na karte Analýza pretekov s tromi ukážkovými kolami: zoznam kôl, referenčná hviezdička, zameranie](../assets/img/en/race-loading-laps-list.webp)

## Vaše prvé kolá {#your-first-laps}

1. Otvorte kartu **Analýza pretekov**.
2. Len sa pozeráte? Stlačte **Ukážkové kolá** (pozri [Ukážkové kolá](#demo-laps)).
3. Vaše vlastné kolá: nahrajte ich v hre nahrávačom (pozri [Formáty súborov](#file-formats)). Nahrávač zapíše jeden súbor na každé kolo.
4. Stlačte **Načítať súbory kôl…** a vyberte dva alebo viac súborov tej istej trate, alebo stlačte **Priečinok…** a vyberte priečinok, ktorý ich drží. Súbory alebo priečinky môžete aj pretiahnuť na 3D výhľad.
5. Kliknite na kolo v zozname, aby ste videli, kde strácalo čas.

**Upozornenie: kolá sa porovnávajú jedna trať naraz.** Načítanie kola inej pomenovanej trate vymaže kolá, ktoré sú už načítané.

## Tlačidlá {#the-buttons}

| Ovládací prvok | Čo robí |
|---|---|
| **Načítať súbory kôl…** | výber súborov pre `.json`, `.csv`, `.txt`, `.ibt`, `.gz` a `.h3dcars`, niekoľko naraz (`.h3dcars` je súbor auta, pozri [Autá](race-replay-and-scene.md#the-cars)) |
| **Priečinok…** | výber priečinka: každý súbor kola v priečinku a pod ním |
| **Ukážkové kolá** | tri vymyslené kolá vymysleného okruhu (pozri [Ukážkové kolá](#demo-laps)) |
| **Vymazať** | odstráni každé kolo (zobrazí sa, keď sú kolá načítané) |
| pustenie na výhľad | súbory a celé priečinky pustené na 3D výhľad sa načítajú rovnako |

Kolá sa **pridávajú** k tým, ktoré sú načítané - **pokiaľ nie sú z inej pomenovanej trate: potom sa najprv vymažú načítané kolá** (kolá sa porovnávajú jedna trať naraz). Súbory, ktoré sa nedajú prečítať, sa vypíšu pod tlačidlami, po jednom riadku; ostatné sa načítajú aj tak.

## Formáty súborov {#file-formats}

Formát sa určuje podľa obsahu, nie podľa názvu súboru. Jednoducho povedané:

- **heat3d-lap** je súbor, ktorý zapisuje nahrávač 3DHeat pre väčšinu hier.
- **FH Companion** je bezplatný nástroj, ktorý nahráva kolá Forza Horizon. Zapíše súbor kola a vedľa neho súbor `.json.tele.gz` (to isté kolo so všetkými údajmi každej pneumatiky, komprimované gzipom). Vyberte ich oba naraz.
- **iRacing `.ibt`** je vlastný telemetrický súbor iRacing; zapnite zaznamenávanie v aute klávesmi Alt+L a načítajte súbor, ako je.
- **CSV kola** je jednoduchá tabuľka, jeden riadok na jeden okamih.

| Formát | Typický zdroj | Číta to |
|---|---|---|
| JSON `heat3d-lap` | `heat3d_capture telemetry --game ...` (Forza Horizon a Motorsport cez Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| JSON kola FH Companion `.json` | knižnica kôl FH Companion | `fromFhCompanion` |
| telemetria FH Companion `.json.tele.gz` | vedľa každého súboru kola FH Companion | `readForzaTelemetry` |
| iRacing `.ibt` | vlastné telemetrické súbory iRacing (zapnuté zaznamenávanie klávesmi Alt+L v aute) | `readIbt` |
| CSV kola | `heat3d_capture laps`, plugin Trackmania, alebo ľubovoľné CSV so stĺpcami `x`, `z`, stĺpcom času a voliteľne stĺpcom `lap` | `fromCsv` |

Ako sa každá hra nahráva a čo posiela, dokumentujú nahrávače:
[GameCapture: hry](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
a [GameCapture: formát kola](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Pozri aj [Ďalšie závodné hry](other-games.md).

## Priečinky a trate {#folders-and-courses}

**Priečinok…**, alebo pustený priečinok, prinesie každý súbor v ňom aj pod ním. V priečinku sa berú do úvahy len súbory končiace na `.json`, `.csv`, `.txt`, `.ibt` alebo `.tele.gz`, a `.json`, ktorý nie je kolo (vlastný súbor trate, jej mapa), sa preskočí bez chyby.

**Viac tratí v jednom výbere.** Knižnica kôl FH Companion drží každú trať v priečinku pomenovanom `<názov trate> (course_<x>_<z>_to_<x>_<z>)` (alebo holý `course_...` pre nepomenovanú trať). Keď vybrané súbory sú vo viac než jednom takomto priečinku trate, nič sa nenačíta; namiesto toho sekcia **Kolá** hovorí „Toto sú kolá N tratí a kolá sa porovnávajú jedna trať naraz. Vyberte jednu:“ a vypíše každú trať s počtom kôl (súbory končiace na `.json`, `.csv` alebo `.ibt`, `course.json` sa nepočíta), najviac kôl prvé. Kliknutie na jednu načíta súbory tej trate.

Trať sa identifikuje podľa jej názvu a **začiatočného** bodu, nie konečného: jazdy, ktoré sa nikdy neskončili, FH Companion drží pod tým istým názvom a začiatkom (v `unfinished/`) s miestom, kde sa zastavili, ako koncom, a idú so svojou traťou - v zozname sú označené ako **neúplné**.

**Viac tratí medzi vybranými súbormi.** Keď sú súbory vybrané priamo (nie z priečinkov tratí) kolami viac než jednej pomenovanej trate, rovnaká voľba sa ponúkne pre každú trať; kolá, ktoré nemenujú žiadnu trať, idú s tou, ktorá je vybraná.

## Názvy áut {#car-names}

Kolo sa volá celým názvom svojho auta, ako ho hra dáva. Keď súbor kola auto nepomenúva:

1. **Priečinok.** Knižnica FH Companion drží kolá v `<trať>/<trieda>/<názov auta> '<rr> (car<číslo>)/<ladenie>/<značka>/<kolo>.json`. Najvnútornejší priečinok, ktorý sa zhoduje s `<názov> (car<číslo>)`, dá názov a číslo; ten, ktorý sa zhoduje s `car<číslo>`, dá len číslo. Túto cestu nesú len vybrané priečinky a pustené priečinky.
2. **Iné kolo toho istého auta.** Keď akékoľvek kolo pomenuje auto, každé kolo s tou istou hrou a číslom auta sa volá rovnako - kolá načítané spolu a kolá načítané neskôr v tomto prehliadači: názvy sa držia v `localStorage` pod `heat3d.carNames` (kľúč `<hra>:<číslo auta>`). V súkromnom okne vydržia len toľko, koľko kolá.
3. Inak „auto 1234“ podľa jeho čísla, alebo „auto“.

**Popisky.** V zozname kôl kolo ukazuje názov svojho auta; viac kôl toho istého auta je očíslovaných „Názov #1“, „Názov #2“. Vety analýzy používajú tie isté popisky, keď sú jedinečné; inak názov auta s časom kola, „Názov (1:29.616)“ (príkladové časy), a ďalej číslované, keď stále nie sú jedinečné.

**Zoskupovanie.** Kolá patria tomu istému autu (pre obálky, profily a porovnania), keď sú ich číslo auta - alebo názov, keď číslo nie je - a ich index výkonu rovnaké (`carKey`): rovnaký model s iným ladením je iné auto.

**Triedy.** Výkonová trieda kola je triedou hry (Forza D..X, skrátený názov triedy auta iRacing); štatistiky ich zoradia D, C, B, A, S1, S2, R, X, potom ostatné abecedne.

## Ukážkové kolá {#demo-laps}

**Ukážkové kolá** načítajú tri kolá vymysleného okruhu (štyri rovinky a štyri zákruty doprava), vytvorené jednoduchým modelom vozidla ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): rýchlosť každej zákruty obmedzená priľnavosťou, prejazd zrýchlenia dopredu a prejazd brzdenia dozadu, ako to robí simulátor kôl.

| Kolo | Auto | Chyby |
|---|---|---|
| čisté | Auto na priľnavosť | žiadne |
| s chybami | Auto na priľnavosť | brzdí 35 m skoro do T2, na plyn sa dostane o 30 m neskoro za T3, prejde T4 pri 0,88 svojej rýchlosti, zájde 1,2 m na jednu stranu |
| iné auto | Výkonové auto | žiadne; zájde 1,2 m na druhú stranu |

| Auto (číslo) | Priľnavosť | Brzdenie | Trakcia | Výkon/hmotnosť | Odpor |
|---|---|---|---|---|---|
| Auto na priľnavosť (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Výkonové auto (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |


Kolo s chybami je zamerané. Trať je naložená tak, ako Forza drží svoj svet (ľavotočivý), takže - presne ako pri skutočnom kole Forza - vyjde zrkadlovo a karta ponúkne **Obrátiť X**. Všetky tri kolá nesú údaje pre každé koleso, takže každá časť karty má čo ukázať.

## Zoznam kôl {#the-lap-list}

Každý riadok, zľava doprava:

| Prvok | Robí |
|---|---|
| ● / ○ | zobrazí / skryje kolo (čiary, auto, karta, grafy); skryté kolá sa stále analyzujú |
| farebný ťah | farba kola |
| meno a štítky | kliknutím sa kolo **zameria**; po nabehnutí myšou jeho zdrojový súbor a auto (názov · trieda PI · pohon) |
| ⌖ | nasledovať toto auto kamerou (kliknutím znova sa zastaví) |
| ★ | porovnať všetko s týmto kolom (urobiť ho referenciou); na referencii nedostupné |
| × | odstrániť kolo |

**Štítky:** *referencia*; *najlepšie z X* (alebo *najlepšie z triedy*) na najrýchlejšom kole triedy, keď je tried viac; *neúplné* pri jazde, ktorá nedošla do cieľa.

**Druhý riadok:** trieda (len pri viacerých triedach), čas kola (`1:29.616`), rozdiel voči kolu, s ktorým sa porovnáva (najlepšie z jeho triedy, alebo referencia), ako `+0.512` (príklad), a *štart neskoro*, keď kolo začína o viac než 10 m po štarte referencie.

Pri viac než 8 kolách riadok „N z M vykreslených“ ponúka **Zobraziť všetky** (vykresliť každé kolo: pomalšie a plné zamotania) a **Len skúmané** (referencia, zvolené kolo a najlepšie z jeho triedy; štatistiky počítajú každé kolo tak či onak).

Pod zoznamom: nápoveda o zrkadlení, keď kolá hovoria, že kreslenie je zrkadlené (pozri [zrkadlené svety](race-replay-and-scene.md#mirrored-worlds)), a pri dvoch a viac kolách nápoveda „Kliknite na kolo, aby ste videli, kde stráca čas …“, plus, pri viacerých triedach, že každé kolo sa porovnáva s najrýchlejším z vlastnej triedy.

### Referencia a zameranie {#reference-and-focus}

- **Referencia:** kolo, na ktoré sa každé ďalšie zarovnáva a, predvolene, porovnáva. Najrýchlejšie **úplné** kolo, pokiaľ si používateľ cez ★ nevybral iné (prvé načítané kolo, keď žiadne nie je úplné). Odstránenie referenčného kola vráti automatický výber.
- **Zameranie:** kolo, ktorého nálezy, ovládanie auta a mapy sa zobrazujú. Zostáva tam, kde ho používateľ dal; inak je to **najpomalšie** kolo, ktoré nie je referenciou („najviac sa dá naučiť“). Zameranie kola ho tiež odkryje a odkryje najlepšie kolo jeho triedy. Zameranie referencie ju porovnáva s tým iným kolom, ktoré bolo cez každú zákrutu najrýchlejšie.
- **Triedy:** pri kolách viacerých výkonových tried sa každé kolo porovnáva s najrýchlejším úplným kolom svojej vlastnej triedy (referencia, v triede referencie). Pozri [Štatistiky trate](race-course-statistics.md).

### Farby {#colours}

Každé kolo dostane vlastnú farbu podľa svojho miesta v poradí načítania, takže kolo si farbu ponechá, keď sú iné skryté. Odtiene sú rozložené na farebnom kruhu tak, ako režim tímov teplovej mapy rozkladá skupiny; pre každú pozíciu sa svetlosť (0,52 až 0,66 v OKLCH) a sýtosť (0,12 až 0,18) vyberajú tak, aby stáli čo najďalej od susedných pozícií (a posledná od prvej) pri normálnom, protanopickom a deuteranopickom videní, každá aspoň 3:1 voči tmavému povrchu grafu.

## Pre vývojárov {#for-developers}

Kód: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Ako sa číta každý formát {#how-each-format-is-read}

Každý formát skončí ako jeden `LapTrace`: kanály s kanonickými názvami (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., pozri [tabuľku kanálov](race-charts-and-hud.md#the-channel-table)), auto, čas kola, či ide o úplné kolo, a blok `meta`. Pri každom formáte sa `time` a `distance` posunú, aby začínali na 0, a kde zdroj nemá `speed`, vypočíta sa ako vzdialenosť delená časom zo susedných vzoriek.

#### JSON heat3d-lap {#heat3d-lap-json}

JSON objekt s `"format": "heat3d-lap"`. Čítané polia:

| Pole | Použitie |
|---|---|
| `channels` | objekt polí, jedno pre každý kanál, podľa kanonického názvu; kanály pre každé koleso ako `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` a `z` sú povinné |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | auto: id, názov, index triedy Forza (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), index výkonu, kód pohonu (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | čas kola; posledná hodnota `time`, keď chýba |
| `lap.complete` | `false` označí neúplnú jazdu; čokoľvek iné je úplné |
| `game`, `track` | názvy; `game` určuje disciplínu (pozri nižšie) |
| `units.slipRatio` / `units.slipAngle` | ako sa prešmyk škáluje: jednotka obsahujúca `raw` znamená `scaled`, `normalised` znamená `peak`, inak `physical` |
| `meta` | `slip`, `surface`, `discipline` zadané tak, ako sú, prepíšu to vyššie |

Bez kanála `distance` sa vzdialenosť sčíta z 3D pozícií.

#### Súbory kôl FH Companion {#fh-companion-lap-files}

JSON objekt s objektom `Lap`, ktorý drží pole `samples` (jedna vzorka asi každých 5 m). Namapované polia:

| FH Companion | Kanál |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (posunuté, aby kolo začínalo na 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | rovnaké, malými písmenami |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², napriek názvu) |
| `Puddle` | `puddle` |

Auto pochádza z `Lap.carOrdinal`, `Lap.carName` (len novšie súbory), `Class` (alebo `Lap.carClass` ako index triedy Forza), `Lap.performanceIndex`, `Lap.drivetrain` a `Lap.peakKilowatts`; čas z `Lap.lapSeconds`; jazda s `EndedAtFinish: false` je neúplná. Hra je `forza-horizon`.

Tieto súbory nenesú údaje o pneumatikách ani o smere, takže zámky, prešmyk kolies a šmyky sa z nich samy nedajú posúdiť; podtáčania (z riadenia oproti dráhe) a nárazy a havárie áno. Vyberte aj `.tele.gz` vedľa každého z nich pre ostatné.

#### Telemetria FH Companion (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

JSON komprimovaný gzipom `{ version, columns, data }`: celý Forza Data Out pre jedno kolo, jeden riadok na paket, vlastné názvy polí hry. Stĺpce sa hľadajú podľa názvu, nikdy podľa pozície. Formát 2 drží každý paket (asi 110 za sekundu oproti 64 tikom hry); riadok, ktorý je v ničom inom rovnaký ako ten pred ním, okrem vlastných hodín nahrávača (`t`, `metres`), sa zahodí, takže kolo sa číta pri 64 riadkoch za sekundu hry. (Nápoveda tlačidla načítania to hovorí: „pre každý prešmyk každého kolesa pri 64 Hz“.)

| Pole Data Out | Kanál |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (rámec auta: x vpravo, y hore, z dopredu) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, prepočítané z 0..255 na 0..1 |
| `Steer` | `steer`, prepočítané z -127..127 na -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, prepočítané z Fahrenheitov na °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` pre každé koleso |

`<Wheel>` je `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` →
`FL`, `FR`, `RL`, `RR`. Prešmyk je označený ako `peak` (normalizovaný prešmyk Forzy: nad
1 pneumatika pustila).

**Párovanie.** Súbor kola `<kolo>.json` a `<kolo>.json.tele.gz`, vybrané alebo pustené spolu (rovnaká cesta, len s `.tele.gz`), sa stanú **jedným** kolom: kanály telemetrie, s autom, triedou, časom, traťou a príznakom neúplnosti zo súboru kola. Vlastný názov auta zo súboru telemetrie má prednosť, keď ho má.
Samotný `.tele.gz` sa stále načíta: súbory formátu 2 nesú `car` (`ordinal`, `name`, `class`, `pi`), `track` a `lapSeconds`; bez nich je čas kola vlastným trvaním telemetrie a auto nie je známe.

#### iRacing `.ibt` {#iracing-ibt}

Telemetrický súbor iRacing sa číta priamo (v prehliadači, bez konverzie): 112-bajtová hlavička, 32-bajtová podhlavička disku, tabuľka premenných (144 bajtov na kanál) a YAML relácie.

- **Povinné kanály:** `SessionTime`, `Lap`, `Lat`, `Lon`. Bez nich: „… nemá kanály SessionTime, Lap, Lat a Lon - je to telemetrický súbor iRacing?“
- **Pozície:** zemepisná šírka a dĺžka sa rozložia v metroch na rovine dotyčnej v prvom nenulovom zamerení (polomer Zeme 6 371 008,8 m): x na východ, z na juh, y nadmorská výška (`Alt`) - takže pri predvolenej kamere smerujúcej na sever je sever hore na obrazovke. Nie vlastný rámec trate: vyťažený model trate by sa nezarovnal.
- **Kolá:** relácia sa rozdelí tam, kde sa `Lap` zmení; kolo sa ponechá, keď má viac než 60 vzoriek, začína pod 5 % `LapDistPct` a končí nad 95 %. Neúplné kolá sa zahodia. Keď nezostane žiadne: „… nemá žiadne úplné kolo trate dlhej N km“ (dĺžka trate z YAML) alebo „… nemá žiadne úplné kolo“.
- **Vzdialenosť:** `LapDist` od začiatku kola, inak sčítaná z pozícií.
- **Auto:** z `DriverInfo`: `CarScreenName` hráča, `CarID` (ako číslo auta) a `CarClassShortName` (ako trieda). Trať: `TrackDisplayName`, inak `TrackName`.

Namapované kanály:

| iRacing | Kanál | Prepočet |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | rovnaké názvy | - |
| `Clutch` | `clutch` | `1 - v` (iRacing počíta zapojenie; náš je pedál) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radiány proti smeru hodinových ručičiek na -1..1 vpravo kladné; maximum aspoň 0,1, π keď chýba) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | rovnaké, malými písmenami | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | delené 100, keď je nad 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | teplota stredu kostry |
| `LFshockDefl` ... | `suspensionM.FL` ... | výchylka tlmiča, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa na psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Predpony kolies: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Každý iný**
kanál s jednou hodnotou na vzorku (nie typu bitových polí) prejde pod svojím názvom - pre každé koleso, keď sa začína predponou kolesa
(`RRspeed` sa stane `speed.RR`) - takže grafy a zoznamy hodnôt na kartách ponúkajú všetky. iRacing neloguje prešmyk pneumatík: ovládanie auta sa posudzuje z uhla driftu - `Yaw`, prispôsobený smeru jazdy, oproti tomu, kam auto ide - a z riadenia oproti dráhe. Uhlová rýchlosť zatáčania proti bočnému zrýchleniu sa použije len vtedy, keď sa smer nedá prispôsobiť, takže uhol driftu vtedy nie je (pozri [Udalosti kontroly auta](race-control-events.md)).

Chyby: „… je príliš krátky na súbor .ibt“, „… nemá hlavičku telemetrie iRacing“, „… nemá žiadne zamerania pozície“.

#### CSV kola {#lap-csv}

Jeden riadok na vzorku; mnohé kolá v jednom súbore sa rozlišujú stĺpcom `lap`. Oddeľovač sa zisťuje z prvých piatich riadkov. Voliteľný prvý riadok `# { ...json... }` opisuje jazdu: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Stĺpec (bez ohľadu na veľkosť písmen) | Kanál |
|---|---|
| `x`, `y`, `z` | pozícia (`x` a `z` povinné) |
| `elapsed` alebo `time` | `time` (povinné pre každé kolo) |
| `metres` alebo `distance` | `distance` (inak sčítané z pozícií) |
| `speed_ms` alebo `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | rovnaké |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| ľubovoľný kanonický názov kanála, napr. `latVel`, `slipIndex.FL` | sám seba |
| `lap` | ku ktorému kolu riadok patrí |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | čas kola, číslo auta, trieda, PI, trať (z prvého riadku každého kola) |

Bez opisu sa hra berie ako `forza-horizon` a každé kolo ako úplné. Zdroj kola sa zobrazí ako `<súbor> · <kolo>`, keď súbor drží viac kôl. Chyby: „… nemá riadky“, „… nemá stĺpce x a z“, „… nemá kolá so stĺpcom času“.

#### Disciplína a povrch {#discipline-and-surface}

Čo analýza predpokladá o kole, keď to kolo nehovorí (`lap.ts`):

- **Disciplína:** `meta.discipline`, inak názov hry zodpovedajúci `rally|wrc|dirt|rbr` je **rally**, `trackmania` je **arkáda**, čokoľvek iné **okruh**.
- **Povrch:** `meta.surface`, inak z názvu trate a zdroja: rally pomenované `monte` je **zmiešané**; `snow|ice|winter|arctic|sweden` **sneh**; asfaltové rally (Španielsko/España/Catalunya/Costa Daurada, Chorvátsko/Hrvatska, Stredná Európa, Nemecko/Deutschland, Japonsko, Korzika/Corse, Ypres, alebo slová tarmac/asphalt) **asfalt**; každý názov s `scramble|trail|cross country|dirt|gravel` **nespevnený**; iná etapa rally sa posudzuje podľa toho, ako sa auto jazdilo: nad vzorkami rýchlejšími než 12 m/s a na podklade (aspoň 200 z nich), 95. percentil bočného zrýchlenia 10 m/s² alebo viac spolu s mediánom uhla driftu pod 6° (berie sa tam, kde auto zatáčalo pri 70 % tej hodnoty alebo viac, aspoň 30 vzoriek) je asfalt; všetko ostatné, alebo príliš málo na rozhodnutie, je nespevnené. Názov mimo rally s `rally` v ňom je nespevnený; všetko ostatné asfalt.
- Pre každú vzorku kanál `loose` (otrasy povrchu Forzy, materiály Trackmanie, pozri [Udalosti kontroly auta](race-control-events.md#the-ground)) prepíše povrch kola.
