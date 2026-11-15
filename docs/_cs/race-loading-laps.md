---
title: "Načítání kol"
parent: "Analýza závodu"
nav_order: 51
lang: "cs"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Načítání kol

Soubor kola je záznam jedné jízdy: kde byl vůz a co řidič dělal, mnohokrát za sekundu. Když načtete dvě nebo víc kol téže tratě, může je záložka **Analýza závodu** porovnat.

![Oddíl Kola v záložce Analýza závodu se třemi načtenými ukázkovými koly: seznam kol, referenční hvězda, zaměření](../assets/img/en/race-loading-laps-list.webp)

## Vaše první kola {#your-first-laps}

1. Otevřete záložku **Analýza závodu**.
2. Jen se díváte? Stiskněte **Ukázková kola** (viz [Ukázková kola](#demo-laps)).
3. Vlastní kola: nahrajte je ve hře pomocí záznamníku (viz [Formáty souborů](#file-formats)). Záznamník zapíše jeden soubor na jedno kolo.
4. Stiskněte **Načíst soubory kol…** a vyberte dva nebo víc souborů téže tratě. Nebo stiskněte **Složka…** a vyberte složku, která je obsahuje. Soubory nebo složky můžete také přetáhnout do 3D zobrazení.
5. Klikněte na kolo v seznamu a uvidíte, kde ztrácí čas.

**Pozor: kola se porovnávají jen jedna trať po druhé.** Načtení kola jiné pojmenované tratě vymaže dříve načtená kola.

## Ovládací prvky {#the-buttons}

| Ovládací prvek | Dělá |
|---|---|
| **Načíst soubory kol…** | výběr souborů typu `.json`, `.csv`, `.txt`, `.ibt`, `.gz` a `.h3dcars`, více najednou (`.h3dcars` je soubor s vozem, viz [Vozy](race-replay-and-scene.md#the-cars)) |
| **Složka…** | výběr složky: každý soubor kola v ní a v podsložkách |
| **Ukázková kola** | tři vymyšlená kola vymyšlené tratě (viz [Ukázková kola](#demo-laps)) |
| **Vymazat** | odstraní všechna kola (zobrazí se, když jsou kola načtena) |
| přetažení na zobrazení | soubory a celé složky přetažené na 3D zobrazení se načtou stejně |

Kola se **přidávají** k těm, která jsou načtena, **pokud nejsou z jiné pojmenované tratě. Pak se nejdřív vymažou načtená kola**, protože kola se porovnávají jen jedna trať po druhé. Soubory, které nejdou přečíst, se uvedou pod tlačítky, každý na jednom řádku. Ostatní se načtou.

## Formáty souborů {#file-formats}

Formát se pozná podle obsahu, ne podle názvu souboru. Prostě řečeno:

- **heat3d-lap** je soubor, který pro většinu her zapisuje záznamník 3DHeat.
- **FH Companion** je bezplatný nástroj, který zaznamenává kola Forza Horizon. Zapíše soubor kola a vedle něj soubor `.json.tele.gz` (stejné kolo se všemi daty pneumatik, komprimované gzipem). Vyberte oba najednou.
- **iRacing `.ibt`** je vlastní telemetrický soubor iRacingu. Zapněte záznam v autě klávesou Alt+L a načtěte soubor tak, jak je.
- **CSV kola** je prostá tabulka, jeden řádek na jeden okamžik.

| Formát | Typický zdroj | Čte ho |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon a Motorsport přes Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion lap `.json` | knihovna kol FH Companion | `fromFhCompanion` |
| FH Companion telemetry `.json.tele.gz` | vedle každého souboru kola FH Companion | `readForzaTelemetry` |
| iRacing `.ibt` | vlastní telemetrické soubory iRacingu (záznam zapnutý klávesou Alt+L v autě) | `readIbt` |
| CSV kola | `heat3d_capture laps`, plugin Trackmania, nebo jakékoli CSV se sloupci `x`, `z`, časem a volitelně sloupcem `lap` | `fromCsv` |

Jak se každá hra zaznamenává a co posílá, popisují záznamníky: [GameCapture: hry](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
a [GameCapture: formát kola](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Viz také [Jiné závodní hry](other-games.md).

## Složky a tratě {#folders-and-courses}

**Složka…**, nebo přetažená složka, přinese každý soubor v ní i pod ní. Uvnitř složky se berou jen soubory končící na `.json`, `.csv`, `.txt`, `.ibt` nebo `.tele.gz`. `.json`, který není kolem (vlastní soubor tratě, její mapa), se přeskočí bez chyby.

**Několik tratí v jednom výběru.** Knihovna kol FH Companion ukládá každou trať do složky pojmenované `<název tratě> (course_<x>_<z>_to_<x>_<z>)`, nebo jen `course_...`, když trať nemá název. Když vybrané soubory leží ve více takových složkách tratí, nenačte se nic. Místo toho oddíl **Kola** napíše „Jsou to kola N tratí a kola se porovnávají jen jedna trať po druhé. Vyberte jednu:“. Vypíše každou trať s počtem kol (soubory končící `.json`, `.csv` nebo `.ibt`, `course.json` se nepočítá), s nejvíc koly nahoře. Klik na jednu načte soubory té tratě.

Trať je určena svým názvem a svým **začátkem**, ne koncem. Běhy, které nikdy neskončily, uchovává FH Companion pod stejným názvem a začátkem (v `unfinished/`), s místem, kde zastavily, jako koncem. Patří ke své trati a v seznamu jsou označeny **neúplné**.

**Několik tratí mezi vybranými soubory.** Když jsou vybrané soubory (ne ze složek tratí) kola více pojmenovaných tratí, nabídne se stejná volba pro každou trať. Kola bez názvu tratě jdou s tou tratí, která je vybrána.

## Názvy vozů {#car-names}

Kolo se jmenuje celým názvem vozu, jak ho hra uvádí. Kde soubor kola vůz nepojmenovává:

1. **Složka.** Knihovna FH Companion ukládá kola do `<trať>/<třída>/<název vozu> '<rr> (car<číslo>)/<ladění>/<štítek>/<kolo>.json`. Nejvnitřnější složka, která odpovídá `<název> (car<číslo>)`, dá název i číslo. Složka odpovídající `car<číslo>` dá jen číslo. Tuto cestu nesou jen výběry složek a přetažené složky.
2. **Jiné kolo téhož vozu.** Jakmile nějaké kolo pojmenuje vůz, každé kolo se stejnou hrou a číslem vozu se jmenuje stejně. Platí to pro kola načtená společně i pro kola načtená později v tomto prohlížeči. Názvy se uchovávají v `localStorage` pod klíčem `heat3d.carNames` (klíč `<hra>:<číslo vozu>`). V soukromém okně vydrží jen tak dlouho jako kola.
3. Jinak „car 1234“ podle čísla, nebo „car“.

**Popisky.** V seznamu kol kolo ukazuje název vozu. Několik kol téhož vozu se číslují „Název #1“, „Název #2“. Věty analýzy používají stejné popisky, když jsou jedinečné. Jinak název vozu s časem kola, „Název (1:29.616)“ (příklad časů), a případně dál číslovaný, když ani tak není jedinečný.

**Seskupení.** Kola patří ke stejnému vozu (pro obálky, profily a srovnání), když se shoduje jejich číslo vozu (nebo název, když číslo není) a jejich index výkonu (`carKey`). Stejný model s jiným laděním je jiný vůz.

**Třídy.** Výkonnostní třída kola je třída hry (Forza D..X, krátký název třídy vozu u iRacingu). Statistiky je řadí D, C, B, A, S1, S2, R, X, potom ostatní podle abecedy.

## Ukázková kola {#demo-laps}

**Ukázková kola** načtou tři kola vymyšlené tratě (čtyři rovinky a čtyři zatáčky doprava). Vytvořil je jednoduchý model vozidla ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): rychlost každé zatáčky omezená přilnavostí, průjezd zrychlením dopředu a průjezd brzděním dozadu, jak to dělá simulátor kola.

| Kolo | Vůz | Chyby |
|---|---|---|
| čisté | vůz s přilnavostí | žádné |
| s chybami | vůz s přilnavostí | brzdí o 35 m brzy do T2, přidá plyn o 30 m pozdě z T3, projede T4 na 0,88 své rychlosti, jede 1,2 m na jednu stranu |
| jiný vůz | vůz s výkonem | žádné; jede 1,2 m na druhou stranu |

| Vůz (číslo) | Přilnavost | Brzdění | Trakce | Výkon/hmotnost | Odpor |
|---|---|---|---|---|---|
| Vůz s přilnavostí (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Vůz s výkonem (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Kolo s chybami je zaměřené. Okruh je rozložen tak, jak Forza drží svůj svět (levotočivě). Proto – stejně jako u skutečného kola z Forzy – vyjde zrcadlově a záložka nabídne **Převrátit X**. Všechna tři kola nesou data pro každé kolo, takže každá část záložky má co ukázat.

## Seznam kol {#the-lap-list}

Každý řádek, zleva doprava:

| Prvek | Dělá |
|---|---|
| ● / ○ | ukáže nebo skryje kolo (čáry, vůz, karta, grafy). Skrytá kola se analyzují dál |
| barevný proužek | barva kola |
| název a štítky | klik pro **zaměření** kola. Najetím se zobrazí jeho zdrojový soubor a vůz (název · třída PI · pohon) |
| ⌖ | sledovat tento vůz kamerou (klik znovu pro zastavení) |
| ★ | porovnat všechno s tímto kolem (udělat z něj referenci). U reference nedostupné |
| × | odstraní kolo |

**Štítky:** *reference*; *nejlepší z X* (nebo *nejlepší ve své třídě*) u nejrychlejšího kola třídy, když je tříd víc; *neúplné* u jízdy, která nedojela do cíle.

**Druhý řádek:** třída (jen když je tříd víc), čas kola (`1:29.616`), mezera k porovnávanému kolu (nejlepšímu ve své třídě nebo referenci) jako `+0.512` (příklad), a *startuje pozdě*, když kolo začíná víc než 10 m po startu reference.

Když je kol víc než 8, řádek „N z M zobrazeno“ nabídne **Zobrazit vše** (nakreslí každé kolo: pomaleji a zamotaně) a **Jen prohlížená** (referenci, zaměřené kolo a nejlepší kolo své třídy). Statistiky počítají každé kolo, ať je zvolena kterákoli z těchto možností.

Pod seznamem je nápověda k zrcadlení, když kola říkají, že kresba je zrcadlená (viz [zrcadlené světy](race-replay-and-scene.md#mirrored-worlds)). U dvou nebo víc kol je tam nápověda „Klikněte na kolo a uvidíte, kde ztrácí čas …“ a u více tříd také to, že každé kolo se porovnává s nejrychlejším ve své třídě.

### Reference a zaměření {#reference-and-focus}

- **Reference:** kolo, na které se všechna ostatní zarovnají a která se ve výchozím nastavení srovnávají s ním. Je to nejrychlejší **úplné** kolo, pokud ★ nevybere jiné. Když žádné není úplné, je to první načtené kolo. Odstraněním referenčního kola se vrátí automatický výběr.
- **Zaměření:** kolo, jehož nálezy, ovládání vozu a mapy se ukazují. Zůstává tam, kam ho uživatel dal. Jinak je to **nejpomalejší** kolo, které není referencí („nejvíc se z něj dá naučit“). Zaměření kola ho také odkryje a odkryje nejlepší kolo jeho třídy. Zaměření reference ji srovná s tím jiným kolem, které bylo v každé zatáčce nejrychlejší.
- **Třídy:** u kol více výkonnostních tříd se každé kolo porovnává s nejrychlejším úplným kolem své třídy (referencí, ve třídě reference). Viz [Statistiky tratě](race-course-statistics.md).

### Barvy {#colours}

Každé kolo má vlastní barvu podle pořadí načtení, takže si kolo barvu podrží, i když jsou jiná skrytá. Odstíny jsou rozloženy po barevném kruhu tak, jak režim týmů tepelné mapy rozkládá skupiny. Pro každé místo se světlost (0,52 až 0,66 v OKLCH) a sytost (0,12 až 0,18) volí tak, aby byla co nejdál od sousedních míst (a poslední od prvního) při normálním, protanopickém a deuteranopickém vidění. Každá musí být aspoň 3:1 proti tmavému povrchu grafu.

## Pro vývojáře {#for-developers}

Kód: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Jak se čte každý formát {#how-each-format-is-read}
Každý formát skončí jako jeden `LapTrace`: kanály s kanonickými názvy (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., viz [tabulka kanálů](race-charts-and-hud.md#the-channel-table)), vůz, čas kola, údaj, zda jde o úplné kolo, a blok `meta`. U každého formátu se `time` a `distance` posunou tak, aby začínaly na 0. Kde zdroj nemá `speed`, dopočítá se jako vzdálenost děleno časem ze sousedních vzorků.

#### heat3d-lap JSON {#heat3d-lap-json}

JSON objekt s `"format": "heat3d-lap"`. Čtená pole:

| Pole | K čemu |
|---|---|
| `channels` | objekt polí, jedno pole na kanál, podle kanonického názvu. Kanály na jednotlivá kola jako `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` a `z` jsou povinné |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | vůz: id, název, index třídy Forzy (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), index výkonu, kód pohonu (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | čas kola. Když chybí, poslední hodnota `time` |
| `lap.complete` | `false` označí neúplnou jízdu. Cokoli jiného znamená úplné kolo |
| `game`, `track` | názvy. `game` určuje disciplínu (viz níže) |
| `units.slipRatio` / `units.slipAngle` | jak se škáluje prokluz: jednotka obsahující `raw` znamená `scaled`, `normalised` znamená `peak`, cokoli jiného `physical` |
| `meta` | `slip`, `surface`, `discipline`, když jsou zadány, přepíší výše uvedené |

Bez kanálu `distance` se vzdálenost sečte z 3D pozic.

#### FH Companion lap files {#fh-companion-lap-files}

JSON objekt s objektem `Lap`, který drží pole `samples` (jeden vzorek zhruba každých 5 m). Namapovaná pole:

| FH Companion | Kanál |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (posunuto, aby kolo začínalo na 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | totéž, malými písmeny |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², i když se to tak jmenuje) |
| `Puddle` | `puddle` |

Vůz se bere z `Lap.carOrdinal`, `Lap.carName` (jen novější soubory), `Class` (nebo `Lap.carClass` jako index třídy Forzy), `Lap.performanceIndex`, `Lap.drivetrain` a `Lap.peakKilowatts`. Čas z `Lap.lapSeconds`. Jízda s `EndedAtFinish: false` je neúplná. Hra je `forza-horizon`.

Tyto soubory nenesou data pneumatik ani směr jízdy. Zablokování, protáčení a smyky z nich tedy samy o sobě nejdou posoudit. Tlaky (z řízení proti trase) a nárazy a nehody jít posoudit ještě mohou. Pro zbytek vyberte i `.tele.gz` vedle každého z nich.

#### FH Companion telemetry (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

JSON komprimovaný gzipem, `{ version, columns, data }`: celý Forza Data Out pro jedno kolo, jeden řádek na paket, vlastní názvy polí hry. Sloupce se hledají podle názvu, nikdy podle pozice. Formát 2 drží každý paket (asi 110 za sekundu oproti 64 tikům hry). Řádek, který je ve všem stejný jako předchozí, kromě vlastních hodin záznamníku (`t`, `metres`), se zahodí. Kolo se tak čte na 64 řádků za sekundu, jak je posílá hra. (Popisek tlačítka načtení to říká: „dává skluz každé pneumatiky s frekvencí 64 Hz“.)

| Pole Data Out | Kanál |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (rám vozu: x vpravo, y nahoru, z dopředu) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, přepočteno z 0..255 na 0..1 |
| `Steer` | `steer`, přepočteno z -127..127 na -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, převedeno z Fahrenheitů na °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` pro každé kolo |

`<Wheel>` je `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` → `FL`, `FR`, `RL`, `RR`. Prokluz je označen `peak` (normalizovaný prokluz Forzy: za hodnotou 1 pneumatika povolila).

**Spárování.** Soubor kola `<kolo>.json` a `<kolo>.json.tele.gz` vybrané nebo přetažené společně (stejná cesta, jen s `.tele.gz`) se stanou **jedním** kolem. Mají kanály telemetrie, s vozem, třídou, časem, tratí a příznakem neúplnosti ze souboru kola. Název vozu ze souboru telemetrie má přednost, pokud nějaký má. Samotný `.tele.gz` se také načte. Soubory formátu 2 nesou `car` (`ordinal`, `name`, `class`, `pi`), `track` a `lapSeconds`. Bez nich je čas kola délka telemetrie a vůz není znám.

#### iRacing `.ibt` {#iracing-ibt}

Telemetrický soubor iRacingu se čte přímo (v prohlížeči, bez převodu): hlavička 112 bajtů, podhlavička disku 32 bajtů, tabulka proměnných (144 bajtů na kanál) a YAML relace.

- **Povinné kanály:** `SessionTime`, `Lap`, `Lat`, `Lon`. Bez nich: „… nemá kanály SessionTime, Lap, Lat a Lon. Je to telemetrický soubor iRacingu?“
- **Pozice:** zeměpisná šířka a délka se rozloží na metry v rovině tečné k prvnímu nenulovému určení polohy (poloměr Země 6 371 008,8 m): x na východ, z na jih, y výška (`Alt`). Při výchozím natočení kamery na sever je tedy sever nahoře. Není to vlastní souřadnicová soustava tratě. Vytažený model tratě by se nezarovnal.
- **Kola:** relace se rozdělí tam, kde se mění `Lap`. Kolo se nechá, když má víc než 60 vzorků, začíná pod 5 % `LapDistPct` a končí nad 95 %. Neúplná kola se zahodí. Když nezbude žádné: „… nemá žádné úplné kolo tratě o délce N km“ (délka z YAML), nebo „… nemá žádné úplné kolo“.
- **Vzdálenost:** `LapDist` od začátku kola, jinak sečtená z pozic.
- **Vůz:** z `DriverInfo`: `CarScreenName` hráče, `CarID` (jako číslo vozu) a `CarClassShortName` (jako třída). Trať: `TrackDisplayName`, jinak `TrackName`.

Namapované kanály:

| iRacing | Kanál | Převod |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | stejné názvy | - |
| `Clutch` | `clutch` | `1 - v` (iRacing počítá zapojení, my pedál) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radiány proti směru hodinových ručiček na -1..1, vpravo kladné; maximum aspoň 0,1, když chybí, π) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | totéž, malými písmeny | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | děleno 100, když je nad 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | teplota středu kostry |
| `LFshockDefl` ... | `suspensionM.FL` ... | výchylka tlumiče, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa na psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Předpony kol: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Každý další** kanál s jednou hodnotou na vzorek (ne bitové pole) se předá pod svým vlastním názvem. Když začíná předponou kola, je pro dané kolo (`RRspeed` se stane `speed.RR`). Grafy a seznamy hodnot na kartách tak nabídnou všechny. iRacing neloguje prokluz pneumatik. Ovládání vozu se proto posuzuje z úhlu driftu (`Yaw` přiložený ke směru jízdy, proti tomu, kam vůz jede) a z řízení proti trase. Rychlost natáčení proti boční akceleraci se použije jen tehdy, když se směr přiložit nedá. Pak úhel driftu není k dispozici (viz [Události ovládání vozu](race-control-events.md)).

Chyby: „… je příliš krátký na soubor .ibt“, „… nemá hlavičku telemetrie iRacingu“, „… nemá žádná určení polohy“.

#### Lap CSV {#lap-csv}

Jeden řádek na vzorek. Více kol v jednom souboru se rozliší podle sloupce `lap`. Oddělovač se pozná z prvních pěti řádků. Nepovinný první řádek `# { ...json... }` popisuje jízdu: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Sloupec (bez ohledu na velikost písmen) | Kanál |
|---|---|
| `x`, `y`, `z` | pozice (`x` a `z` povinné) |
| `elapsed` nebo `time` | `time` (povinné pro každé kolo) |
| `metres` nebo `distance` | `distance` (jinak sečteno z pozic) |
| `speed_ms` nebo `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | totéž |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| jakýkoli kanonický název kanálu, např. `latVel`, `slipIndex.FL` | sám sebe |
| `lap` | ke kterému kolu řádek patří |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | čas kola, číslo vozu, třída, PI, trať (z prvního řádku každého kola) |

Bez popisu se hra bere jako `forza-horizon` a každé kolo jako úplné. Zdroj kola se ukáže jako `<soubor> · <kolo>`, když soubor drží několik kol. Chyby: „… nemá žádné řádky“, „… nemá sloupce x a z“, „… nemá žádná kola se sloupcem času“.

#### Disciplína a povrch {#discipline-and-surface}

Co analýza předpokládá o kole, když to kolo neříká (`lap.ts`):

- **Disciplína:** `meta.discipline`. Jinak název hry odpovídající `rally|wrc|dirt|rbr` je **rallye**, `trackmania` je **arkáda** a cokoli jiného **okruh**.
- **Povrch:** `meta.surface`. Jinak se bere z názvu tratě a zdroje. Rallye s názvem `monte` je **smíšený**. `snow|ice|winter|arctic|sweden` je **sníh**. Asfaltové rallye (Španělsko/España/Catalunya/Costa Daurada, Chorvatsko/Hrvatska, Střední Evropa, Německo/Deutschland, Japonsko, Korsika/Corse, Ypry, nebo slova tarmac/asphalt) jsou **asfalt**. Každý název s `scramble|trail|cross country|dirt|gravel` je **sypký**. Jiná etapa rallye se posoudí podle toho, jak byl vůz řízen: nad vzorky jedoucími rychleji než 12 m/s a na zemi (alespoň 200 jich). 95. percentil bočního zrychlení 10 m/s² nebo víc spolu s mediánem úhlu driftu pod 6° (bere se tam, kde vůz zatáčel na 70 % té hodnoty nebo víc, alespoň 30 vzorků), znamená asfalt. Cokoli jiného, nebo příliš málo na rozpoznání, je sypké. Název, který není rallye, ale obsahuje `rally`, je sypký. Vše ostatní je asfalt.
- Pro každý vzorek přepíše povrch kola kanál `loose` (rozechvění povrchu u Forzy, materiály u Trackmanie, viz [Události ovládání vozu](race-control-events.md#the-ground)).
