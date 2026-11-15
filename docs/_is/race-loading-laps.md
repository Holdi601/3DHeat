---
title: "Hleðsla hringja"
parent: "Kappakstursgreining"
nav_order: 51
lang: "is"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Hleðsla hringja

Hringjaskrá er upptaka af einum akstri: hvar bíllinn var og hvað ökumaðurinn gerði, mörgum sinnum á sekúndu. Hlaðir þú tveimur hringjum eða fleiri á sömu braut getur flipinn **Kappakstursgreining** borið þá saman.

![Hringjahlutinn í flipanum Kappakstursgreining með þremur sýnishringjum hlöðnum: listi hringja, viðmiðsstjarna, fókus](../assets/img/en/race-loading-laps-list.webp)

## Fyrstu hringirnir þínir {#your-first-laps}

1. Opnaðu flipann **Kappakstursgreining**.
2. Bara að skoða? Ýttu á **Sýnishringir** (sjá [Sýnishringir](#demo-laps)).
3. Þínir eigin hringir: taktu þá upp í leiknum með upptökutæki (sjá [Skráarsnið](#file-formats)). Upptökutækið skrifar eina skrá fyrir hvern hring.
4. Ýttu á **Hlaða hringjaskrám…** og veldu tvær skrár eða fleiri af sömu braut, eða ýttu á **Mappa…** og veldu möppuna sem geymir þær. Þú getur líka dregið skrár eða möppur yfir þrívíðu sýnina.
5. Smelltu á hring í listanum til að sjá hvar hann tapar tíma.

**Aðvörun: hringir eru bornir saman einni braut í einu.** Ef þú hleður hring af annarri nefndri braut er hringjunum sem þegar eru hlaðnir eytt.

## Hnapparnir {#the-buttons}

| Stjórntæki | Gerir |
|---|---|
| **Hlaða hringjaskrám…** | skráarvalur fyrir `.json`, `.csv`, `.txt`, `.ibt`, `.gz` og `.h3dcars` skrár, nokkrar í einu (`.h3dcars` er bílaskrá, sjá [Bílar](race-replay-and-scene.md#the-cars)) |
| **Mappa…** | möppuvalur: sérhver hringjaskrá í möppunni og neðar í henni |
| **Sýnishringir** | þrír búnir til hringir á búinni braut (sjá [Sýnishringir](#demo-laps)) |
| **Hreinsa** | fjarlægir alla hringi (birtist þegar hringir eru hlaðnir) |
| sleppa á sýnina | skrár og heilar möppur sem eru dregnar á þrívíðu sýnina eru hlaðnar á sama hátt |

Hringir **bætast við** þá sem eru hlaðnir – **nema þeir séu af annarri nefndri braut: þá eru hlaðnir hringir fyrst hreinsaðir** (hringir eru bornir saman einni braut í einu). Skrár sem ekki er hægt að lesa eru taldar upp undir hnöppunum, ein lína hver; hinar hlaðast samt.

## Skráarsnið {#file-formats}

Sniðið er greint af efninu, ekki skráarheitinu. Í einföldu máli:

- **heat3d-lap** er skráin sem upptökutæki 3DHeat skrifar fyrir flesta leiki.
- **FH Companion** er ókeypis verkfæri sem tekur upp hringi í Forza Horizon. Það skrifar hringjaskrá og við hliðina `.json.tele.gz` skrá (sami hringurinn með gögnum allra hjólanna, þjöppuð með gzip). Veldu þær báðar saman.
- **iRacing `.ibt`** er eigin mælingaskrá iRacing; kveiktu á skráningu í bílnum með Alt+L og hlaðaðu skránni eins og hún er.
- **Hringja-CSV** er einföld tafla, ein röð fyrir hvert augnablik.

| Snið | Dæmigerð uppspretta | Lesið af |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon og Motorsport yfir Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion hringja-`.json` | hringjasafn FH Companion | `fromFhCompanion` |
| FH Companion mælingar `.json.tele.gz` | við hlið hverrar FH Companion hringjaskrár | `readForzaTelemetry` |
| iRacing `.ibt` | eigin mælingaskrár iRacing (skráning kveikt með Alt+L í bílnum) | `readIbt` |
| hringja-CSV | `heat3d_capture laps`, Trackmania-viðbótin, eða hvaða CSV sem er með `x`, `z`, tímadálk og valfrjálst `lap`-dálk | `fromCsv` |

Hvernig hver leikur er tekinn upp og hvað hann sendir er lýst af upptökutækjunum:
[GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
og [GameCapture: the lap format](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Sjá líka [Aðrir kappakstursleikir](other-games.md).

## Möppur og brautir {#folders-and-courses}

**Mappa…**, eða mappa sem er dregin inn, tekur allar skrár undir henni. Innan möppu eru aðeins skrár sem enda á `.json`, `.csv`, `.txt`, `.ibt` eða `.tele.gz` skoðaðar, og `.json` skrá sem er ekki hringur (skrá brautarinnar sjálfrar, kortið hennar) er sleppt án villu.

**Nokkrar brautir í einu vali.** Hringjasafn FH Companion geymir hverja braut í möppu sem heitir `<nafn brautar> (course_<x>_<z>_to_<x>_<z>)` (eða bara `course_...` fyrir óskráða braut). Þegar valdar skrár eru í fleiri en einni slíkri brautarmöppu er ekkert hlaðið; í staðinn segir hlutinn **Hringir** „Þetta eru hringir af N brautum, og hringir eru bornir saman einni braut í einu. Veldu eina:“ og telur upp hverja braut með fjölda hringja (skrár sem enda á `.json`, `.csv` eða `.ibt`, `course.json` telst ekki), flesta hringi fyrst. Ef smellt er á eina eru skrár þeirrar brautar hlaðnar.

Braut er auðkennd með nafni sínu og **upphafspunkti**, ekki endapunkti: keyrslur sem voru aldrei kláraðar eru geymdar af FH Companion undir sama nafni og upphafi (í `unfinished/`) með þeim stað þar sem þær stöðvuðust sem endi, og þær fylgja braut sinni – merktar **ófullgerðar** í listanum.

**Nokkrar brautir meðal valinna skráa.** Þegar skrár sem eru valdar beint (ekki úr brautarmöppum) eru hringir af fleiri en einni nefndri braut, er sama val boðið fyrir hverja braut; hringir sem nefna enga braut fylgja þeirri braut sem er valin.

## Bílanöfn {#car-names}

Hringur er kallaður eftir fullu nafni bílsins eins og leikurinn gefur það. Þar sem hringjaskráin nefnir ekki bílinn:

1. **Mappan.** Hringjasafn FH Companion geymir hringi í `<braut>/<flokkur>/<bílanafn> '<yy> (car<númer>)/<stilling>/<merki>/<hringur>.json`. Innsta mappan sem passar við `<nafn> (car<númer>)` gefur nafnið og númerið; sú sem passar við `car<númer>` gefur aðeins númerið. Aðeins valdar möppur og möppur sem eru dregnar inn bera þessa slóð.
2. **Annar hringur af sama bíl.** Þegar einhver hringur nefnir bíl, er sérhver hringur með sama leik og bílnúmer kallaður því nafni – hringirnir sem eru hlaðnir saman, og hringir sem eru hlaðnir síðar í þessum vafra: nöfnin eru geymd í `localStorage` undir `heat3d.carNames` (lykill `<leikur>:<bílnúmer>`). Í einkagluggum endast þau eins lengi og hringirnir.
3. Annars „car 1234“ eftir númerinu, eða „car“.

**Merkimiðar.** Í hringjalistanum sýnir hringur nafn bílsins; nokkrir hringir af sama bíl eru númeraðir „Nafn #1“, „Nafn #2“. Setningar greiningarinnar nota sömu merkimiða þegar þeir eru einstakir; annars nafn bílsins með hringtímanum, „Nafn (1:29.616)“ (dæmistímar), og númerað frekar ef það er enn ekki einstakt.

**Flokkun.** Hringir tilheyra sama bíl (fyrir umslög, snið og samanburð) þegar bílnúmer þeirra – eða nafn þegar ekkert númer er – og afkastavísitala eru þau sömu (`carKey`): sama gerð með annarri stillingu er annar bíll.

**Flokkar.** Afkastaflokkur hrings er flokkur leiksins (Forza D..X, stutt heiti bílaflokks iRacing); tölfræðin raðar þeim D, C, B, A, S1, S2, R, X, og síðan öðrum í stafrófsröð.

## Sýnishringir {#demo-laps}

**Sýnishringir** hleður þremur hringjum á búinni braut (fjórum beinum köflum og fjórum hægri beygjum), búnum til með einföldu ökutækislíkani ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): hraði hverrar beygju takmarkaður af gripi, hröðunarferð fram á við og bremsuferð aftur á bak, eins og hringhermir gerir.

| Hringur | Bíll | Bilanir |
|---|---|---|
| hreinn | Gripbíll | engin |
| með mistökum | Gripbíll | bremsar 35 m snemma inn í T2, fær inngjöfina 30 m seint út úr T3, tekur T4 á 0,88 af hraða sínum, ekur 1,2 m til annarrar hliðar |
| annar bíll | Aflbíll | engin; ekur 1,2 m til hinnar hliðarinnar |

| Bíll (númer) | Grip | Bremsun | Tog | Afl/massi | Viðnám |
|---|---|---|---|---|---|
| Gripbíll (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Aflbíll (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Hringurinn með mistökunum er í brennidepli. Brautin er lögð eins og Forza geymir heim sinn (vinstri-handar), svo – alveg eins og með raunverulegan Forza-hring – kemur hún spegluð og flipinn býður **Snúa X við**. Allir þrír hringirnir bera gögn fyrir hvert hjól, þannig að hver hluti flipans hefur eitthvað til að sýna.

## Hringjalistinn {#the-lap-list}

Hver röð, frá vinstri til hægri:

| Þáttur | Gerir |
|---|---|
| ● / ○ | sýnir / felur hringinn (línur, bíl, spjald, gröf); faldir hringir eru samt greindir |
| litstrik | lit hringsins |
| nafn og merki | smelltu til að **fókusa** hringinn; hafðu músina yfir til að sjá skrána og bílinn (nafn · afkastavísitala · drifrás) |
| ⌖ | eltu þennan bíl með myndavélinni (smelltu aftur til að hætta) |
| ★ | beru allt saman við þennan hring (gerðu hann að viðmiði); óvirkt á viðmiðinu |
| × | fjarlægir hringinn |

**Merkingar:** *viðmið*; *best af X* (eða *best í sínum flokki*) á fljótasta hring flokks þegar flokkar eru nokkrir; *ófullgerður* á keyrslu sem náði ekki í mark.

**Önnur línan:** flokkurinn (aðeins þegar flokkar eru nokkrir), hringtíminn (`1:29.616`), bilið að hringnum sem hann er borinn saman við (sá besti í flokknum, eða viðmiðið) sem `+0.512` (dæmi), og *byrjar seint* þegar hringurinn byrjar meira en 10 m eftir ræsingu viðmiðsins.

Með fleiri en 8 hringjum birtist línan „N af M teiknaðir“ með **Sýna alla** (teikna alla hringi: hægara, og flækja) og **Aðeins þá sem eru skoðaðir** (viðmiðið, hringurinn í brennidepli og sá besti í flokknum sínum; tölfræðin telur alla hringi hvort sem er).

Undir listanum: ábendingin um spegilmyndina þegar hringirnir segja að teikningin sé speguð (sjá [speglaðir heimar](race-replay-and-scene.md#mirrored-worlds)), og með tveimur hringjum eða fleiri ábendingin „Smelltu á hring til að sjá hvar hann tapar tíma …“, og, með nokkrum flokkum, að hver hringur sé borinn saman við þann fljótasta í sínum flokki.

### Viðmið og fókus {#reference-and-focus}

- **Viðmið:** hringurinn sem allir hinir eru stilltir á og, sjálfgefið, bornir saman við. Fljótasti **heili** hringurinn nema ★ hafi valið annan (fyrsti hlaðni hringurinn þegar enginn er heill). Ef viðmiðshringnum er eytt fer valið aftur til sjálfvirka valsins.
- **Fókus:** hringurinn sem niðurstöður hans, bílstýring og kort eru sýnd fyrir. Hann helst þar sem notandinn setti hann; annars er það **hægasti** hringurinn sem er ekki viðmiðið („mest að læra“). Að fókusa hring sýnir hann líka og besta hring í sínum flokki. Að fókusa viðmiðið ber það saman við þann hring sem var fljótastur í gegnum hverja beygju.
- **Flokkar:** með hringjum af nokkrum afkastaflokkum er sérhver hringur borinn saman við fljótasta heila hringinn í sínum eigin flokki (viðmiðið, í flokki viðmiðsins). Sjá [Tölfræði brautar](race-course-statistics.md).

### Litir {#colours}

Sérhver hringur fær sinn eigin lit, eftir stöðu sinni í hleðsluröðinni, þannig að hringur heldur lit sínum þegar aðrir eru faldir. Litatónarnir eru dreifðir um litahjólið eins og hópstilling hitakortsins dreifir hópum; fyrir hvert sæti eru birtustig (0,52 til 0,66 í OKLCH) og litstyrkur (0,12 til 0,18) valin til að standa sem lengst frá nærliggjandi sætum (og það síðasta frá því fyrsta) við venjulega sýn, rauðgræna og grænrauða sýn, og hvert um sig að minnsta kosti 3:1 á móti dökku grafyfirborðinu.

## Fyrir forritara {#for-developers}

Kóði: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

#### Hvernig hvert snið er lesið {#how-each-format-is-read}

Sérhvert snið endar sem einn `LapTrace`: rásir undir stöðluðum nöfnum (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., sjá [rásatöfluna](race-charts-and-hud.md#the-channel-table)), bíllinn, hringtíminn, hvort hringurinn er heill, og `meta`-blokk. Fyrir sérhvert snið er `time` og `distance` færð þannig að þau byrji á 0, og þar sem uppspretta hefur ekki `speed` er hann reiknaður sem vegalengd deilt með tíma út frá næstu sýnum.

#### heat3d-lap JSON {#heat3d-lap-json}

JSON-hlutur með `"format": "heat3d-lap"`. Lesnir reitir:

| Reitur | Notkun |
|---|---|
| `channels` | hlutur með fylkjum, eitt fyrir hverja rás, eftir stöðluðu nafni; rásir fyrir hvert hjól sem `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` og `z` eru nauðsynleg |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | bíllinn: auðkenni, nafn, Forza-flokksvísitala (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), afkastavísitala, drifrásarkóði (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | hringtíminn; síðasta `time`-gildið þegar hann vantar |
| `lap.complete` | `false` merkir ófullgerða keyrslu; allt annað er heill hringur |
| `game`, `track` | nöfn; `game` ræður greininni (sjá hér að neðan) |
| `units.slipRatio` / `units.slipAngle` | hvernig renni er skalað: eining sem inniheldur `raw` þýðir `scaled`, `normalised` þýðir `peak`, annað `physical` |
| `meta` | `slip`, `surface`, `discipline` eins og gefið er yfirskrifa það sem að ofan er |

Án `distance`-rásar er vegalengdin lögð saman úr þrívíðum staðsetningum.

#### FH Companion hringjaskrár {#fh-companion-lap-files}

JSON-hlutur með `Lap`-hlut sem geymir `samples`-fylki (eitt sýni um 5 m fresti). Reitir færðir:

| FH Companion | Rás |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (færð þannig að hringurinn byrjar á 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | sömu, með lágstöfum |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², þrátt fyrir nafnið) |
| `Puddle` | `puddle` |

Bíllinn kemur úr `Lap.carOrdinal`, `Lap.carName` (aðeins nýrri skrár), `Class` (eða `Lap.carClass` sem Forza-flokksvísitala), `Lap.performanceIndex`, `Lap.drivetrain` og `Lap.peakKilowatts`; tíminn úr `Lap.lapSeconds`; keyrsla með `EndedAtFinish: false` er ófullgerð. Leikurinn er `forza-horizon`.

Þessar skrár hafa engin dekkjagögn og enga stefnu, þannig að ekki er hægt að dæma læsingar, spól og rennsli af þeim einum; ýtingar (út frá stýrinu á móti ferlinum) og högg og árekstrar eru þó enn metin. Veldu `.tele.gz` við hlið hverrar skrár líka fyrir hitt.

#### FH Companion mælingar (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

Gzip-þjöppuð JSON `{ version, columns, data }`: allt Data Out frá Forza fyrir einn hring, ein röð fyrir hvern pakka, með eigin reitanöfnum leiksins. Dálkar eru sóttir eftir nafni, aldrei eftir staðsetningu. Snið 2 geymir alla pakka (um 110 á sekúndu á móti 64 tikkum leiksins); röð sem er eins og sú á undan í öllu nema eigin klukku upptökutækisins (`t`, `metres`) er felld niður, þannig að hringur er lesinn á 64 röðum á sekúndu leiksins. (Hjálpartexti hleðsluhnappsins segir það: „fyrir rennið á hverju dekki við 64 Hz“.)

| Data Out-reitur | Rás |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (rammi bílsins: x hægri, y upp, z fram) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, skalað úr 0..255 í 0..1 |
| `Steer` | `steer`, skalað úr -127..127 í -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, breytt úr Fahrenheit í °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` fyrir hvert hjól |

`<Wheel>` er `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` → `FL`, `FR`, `RL`, `RR`. Renni er merkt `peak` (staðlað renni Forza: yfir 1 hefur dekkið sleppt).

**Pörun.** Hringjaskrá `<lap>.json` og `<lap>.json.tele.gz` sem eru valdar eða dregnar inn saman (sama slóð nema `.tele.gz`) verða **einn** hringur: rásir mælinganna, með bíl, flokki, tíma, braut og ófullgerðarmerki hringjaskrárinnar. Eigið bílanafn mælingaskrárinnar gengur fyrir þegar hún hefur eitt. `.tele.gz` ein og sér hleðst líka: skrár af sniði 2 bera `car` (`ordinal`, `name`, `class`, `pi`), `track` og `lapSeconds`; án þeirra er hringtíminn lengd mælinganna sjálfra og bíllinn óþekktur.

#### iRacing `.ibt` {#iracing-ibt}

Mælingaskrá iRacing er lesin beint (í vafranum, án umbreytingar): 112 bæta hausinn, 32 bæta undirhausinn á disknum, breytutaflan (144 bæti á rás) og YAML-lotugögnin.

- **Nauðsynlegar rásir:** `SessionTime`, `Lap`, `Lat`, `Lon`. Án þeirra: „… hefur ekki SessionTime, Lap, Lat og Lon rásir – er þetta mælingaskrá iRacing?“
- **Staðsetningar:** breiddar- og lengdarbaugur eru settir út í metrum á flöt sem snertir fyrsta staðarákvörðun sem er ekki núll (radíus jarðar 6 371 008,8 m): x austur, z suður, y hæðin (`Alt`) – þannig að með sjálfgefnu myndavélarstefnu í norður er norður upp á skjánum. Ekki rammi brautarinnar sjálfrar: dregið líkan af braut myndi ekki passa.
- **Hringir:** lotan er skipt þar sem `Lap` breytist; hringur er geymdur þegar hann hefur meira en 60 sýni, byrjar undir 5% af `LapDistPct` og endar yfir 95%. Ófullgerðir hringir eru felldir niður. Þegar enginn er eftir: „… hefur engan heilan hring af N km brautinni“ (lengd brautar úr YAML) eða „… hefur engan heilan hring“.
- **Vegalengd:** `LapDist` frá upphafi hringsins, annars lögð saman úr staðsetningum.
- **Bíll:** úr `DriverInfo`: `CarScreenName` ökumannsins, `CarID` (sem bílnúmer) og `CarClassShortName` (sem flokkur). Braut: `TrackDisplayName`, annars `TrackName`.

Varpaðar rásir:

| iRacing | Rás | Umbreyting |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | sömu nöfn | - |
| `Clutch` | `clutch` | `1 - v` (iRacing telur tengingu; hjá okkur er það pedallinn) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radíanar rangsælis í -1..1, hægri jákvætt; hámark að minnsta kosti 0,1, π þegar það vantar) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | sömu, með lágstöfum | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | deilt með 100 þegar það er yfir 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | hitastig miðju hylsis |
| `LFshockDefl` ... | `suspensionM.FL` ... | dempaefni, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa í psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Forskeyti hjóla: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Sérhver önnur** rás með eitt gildi á sýni (ekki af bitasviðsgerð) er látin fara í gegn undir eigin nafni – fyrir hvert hjól þegar hún byrjar á forskeyti hjóls (`RRspeed` verður `speed.RR`) – þannig að grafið og gildalistar spjaldanna bjóða þær allar. iRacing skráir ekkert dekkjarenni: stjórn bíls er metin út frá skriðhorninu – `Yaw`, fellt að akstursstefnunni, á móti því hvert bíllinn fer – og stýrinu á móti ferlinum. Snúningshraðinn á móti hliðarhröðuninni er notaður aðeins þegar ekki er hægt að fella stefnuna, þannig að þá er ekkert skriðhorn (sjá [Atburðir í stýringu bíls](race-control-events.md)).

Villur: „… er of stutt til að vera .ibt skrá“, „… hefur ekki hausinn á iRacing mælingaskrá“, „… hefur engar staðarákvarðanir“.

#### Hringja-CSV {#lap-csv}

Ein röð fyrir hvert sýni; margir hringir í einni skrá eru aðgreindir með `lap`-dálki. Skiljan er greind út frá fyrstu fimm línunum. Valfrjáls fyrsta lína `# { ...json... }` lýsir keyrslunni: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Dálkur (óháð stafstærð) | Rás |
|---|---|
| `x`, `y`, `z` | staðsetning (`x` og `z` nauðsynleg) |
| `elapsed` eða `time` | `time` (nauðsynlegt fyrir hvern hring) |
| `metres` eða `distance` | `distance` (annars lagt saman úr staðsetningum) |
| `speed_ms` eða `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | sömu |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| sérhvert staðlað rásarnafn, t.d. `latVel`, `slipIndex.FL` | það sjálft |
| `lap` | hvaða hring röðin tilheyrir |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | hringtími, bílnúmer, flokkur, PI, braut (úr fyrstu röð hvers hrings) |

Án lýsingar er leikurinn talinn `forza-horizon` og sérhver hringur heill. Uppruni hrings birtist sem `<skrá> · <hringur>` þegar skráin geymir nokkra. Villur: „… hefur engar raðir“, „… hefur engan x- og z-dálk“, „… hefur engan hring með tímadálki“.

#### Grein og yfirborð {#discipline-and-surface}

Það sem greiningin gerir ráð fyrir um hring, þegar hringurinn segir það ekki (`lap.ts`):

- **Grein:** `meta.discipline`, annars er leiknafn sem passar við `rally|wrc|dirt|rbr` **rall**, `trackmania` er **spilakassi**, annað **braut**.
- **Yfirborð:** `meta.surface`, annars út frá heiti brautar og uppruna: rall sem heitir `monte` er **blandað**; `snow|ice|winter|arctic|sweden` **snjór**; malbiksrallin (Spánn/España/Catalunya/Costa Daurada, Króatía/Hrvatska, Mið-Evrópa, Þýskaland/Deutschland, Japan, Korsíka/Corse, Ypres, eða orðin tarmac/asphalt) **malbik**; hvert heiti með `scramble|trail|cross country|dirt|gravel` **laust**; annar rallkafli er metinn út frá því hvernig bíllinn var ekinn: yfir sýnin hraðari en 12 m/s og á undirlaginu (að minnsta kosti 200 þeirra), 95. hundraðshluti hliðarhröðunar 10 m/s² eða meira ásamt miðgildi skriðhorns undir 6° (tekið þar sem bíllinn beygði á 70% af því eða meira, að minnsta kosti 30 sýni) er **malbik**; allt annað, eða of lítið til að greina, er **laust**. Rall-óskyld heiti með `rally` í sér er **laust**; annað allt **malbik**.
- Fyrir hvert sýni yfirskrifar `loose`-rás (undirlagsnötrun Forza, efni Trackmania, sjá [Atburðir í stýringu bíls](race-control-events.md#the-ground)) yfirborð hringsins.
