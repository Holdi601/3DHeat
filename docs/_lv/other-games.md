---
title: "Citas sacīkšu spēles"
parent: "Sacīkšu analīze"
nav_order: 59
lang: "lv"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Citas sacīkšu spēles

Skatītājs nolasa apļus no daudzām sacīkšu spēlēm, ne tikai no vienas. Šī lappuse tās uzskaita un parāda, kā no katras iegūt apli.

## Spēles {#the-games}

| Spēle | Ierakstītājs | Slīdums failā? | Pasaule spoguļota? | Piezīmes |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out pa UDP) vai FH Companion apļu faili un to `.tele.gz` | jā, katram riteni (normalizēts) | jā (kreisās rokas pasaule) | `.tele.gz` blakus katram FH Companion apļa failam dod katra riteņa slīdumu; pats apļa fails to nedod |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (kopējā atmiņa) | jā, katram riteni | izmērīta no apļiem | arī ABS un vilces kontrole darbībā, riteņu slodzes, temperatūras |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | nē, aprēķināts no riteņu ātrumiem | izmērīta no apļiem | rallijā birums un lēcieni tiek vērtēti citādi |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | nē | izmērīta no apļiem | nav riteņu ātrumu |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (mods) | nē, aprēķināts no riteņu ātrumiem | izmērīta no apļiem | |
| Trackmania | Openplanet spraudnis, `telemetry --game trackmania --install` | slīdes koeficients katram riteni | izmērīta no apļiem | arkādes fizika: slīdes tiek vērtētas citādi |
| iRacing | nav: tā paša `.ibt` fails | nē (netiek reģistrēts); aprēķināts no virziena leņķa (yaw) | nē (balstīts uz GPS) | ieslēdziet reģistrēšanu automašīnā ar Alt+L |

## Kā ierakstīt apli {#how-to-record-a-lap}

1. Atrodiet savu spēli tabulā un iestatiet to ierakstītāja lapā tā, kā tā norāda katrai spēlei (iestatījums spēlē, mods vai nekas iRacing gadījumā). Soļi katrai spēlei atšķiras, tāpēc tie ir ierakstītāju dokumentos: [GameCapture: spēles](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Palaidiet ierakstītāju un braukiet. Tas raksta vienu failu katram aplim.
3. Cilnē **Sacīkšu analīze** nospiediet **Ielādēt apļu failus…** un izvēlieties vismaz divus vienas trases apļus (skatiet [Apļu ielāde](race-loading-laps.md)).

Rallija spēlēs ierakstītājs dod vienu failu katram posma braucienam. Forzai vieglākais sākums ir FH Companion bibliotēka ar `.tele.gz` failiem blakus apļu failiem.

## Ko dokumentē ierakstītāji {#what-the-recorders-document}

Kā katra spēle tiek ierakstīta, ko tā sūta, tās izkārtojumu avotus un kuras trases var eksportēt no tās failiem, to dokumentē ierakstītāji: [GameCapture: spēles](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (publiski, [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). Apļu fails, ko raksta katrs ierakstītājs, ir aprakstīts [GameCapture: apļu formāts](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Ko skatītājs ar tiem dara {#what-the-viewer-does-with-them}

Katra spēle beigās kļūst par `heat3d-lap`
failiem (vai apļa CSV, vai tiek nolasīta tieši, kā iRacing `.ibt`), ar kanoniskiem kanālu nosaukumiem no `src/race/schema.ts` un `meta` bloku, kas saka, ko nozīmē tās skaitļi — kā tās slīdums ir mērogots, trase vai rallijs vai arkāde, virsma, ja zināma — tāpēc cilne **Sacīkšu analīze** tās visas apstrādā vienādi. Kad trases modelis nav ielādēts, cilne **Sacīkšu analīze** zīmē ceļu no pašu apļu izkliedes, tāpēc katra spēle ir lietojama arī bez trases modeļa.

Ko neviena rallija spēle nesūta — riepu slīdumu — skatītājs aprēķina: no katra riteņa kontaktlaukuma vai virsmas ātruma salīdzinājumā ar automašīnas ātrumu, kur spēle to sūta (`(wheel - car) / car`), vai no tā rotācijas un rites rādiusa, kas izmērīts pašā aplī, kur spēle sūta tikai rotāciju. Drifta leņķis nāk no automašīnas pašas ātruma (Forza, AC spēles, Trackmania, RBR), no pasaules ātruma, projicēta uz automašīnas asīm (EA WRC, DiRT, BeamNG), vai no virziena pret ceļu. Vai automašīna ir gaisā, nāk no tās riteņu kontakta, slodzēm vai balstiekārtas. Skatiet `src/race/derive.ts`.

Kur spēles pasaule ir kreisās rokas, kā Forzai, trase skatītājā tiek atspoguļota. Apļu stūrēšana un balstiekārta to atklāj, un cilne **Sacīkšu analīze** piedāvā apgriezt asi. Spēles, kuru pasaules orientācija nav dokumentēta (RBR, BeamNG, Trackmania), tiek apstrādātas tāpat: izmērītas, nevis pieņemtas.

Papildus braukšanas kanāliem ierakstītāji saglabā to, ko katra spēle pievieno: AC spēļu ABS un vilces kontroles darbību, bremžu sadalījumu, DRS, boksa ierobežotāju, pastiprinājumu un bremžu uzliku un diska resursu; iRacing palīgiestatījumus, bremžu sadalījumu, degvielu, eļļas un ūdens temperatūras un katru citu kanālu, ko tas reģistrē savā nosaukumā. Skatītājs tos zīmē no sava kanālu saraksta — rādītāji, līmeņi, simboli, grafiki — tāpēc vairāk ierakstīšanas nozīmē, ka skatītājā nekas nav jāmaina.
