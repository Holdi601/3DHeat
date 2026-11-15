---
title: "Andra racingspel"
parent: "Racinganalys"
nav_order: 59
lang: "sv"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Andra racingspel i visaren

Visaren läser varv från många racingspel, inte bara ett. Den här sidan listar dem och förklarar hur du får ut ett varv ur varje.

## Spelen {#the-games}

| Spel | Inspelare | Slirning i filen? | Världen spegelvänd? | Noteringar |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out över UDP), eller FH Companions varvfiler plus deras `.tele.gz` | ja, per hjul (normaliserad) | ja (vänsterhänt värld) | `.tele.gz`-filen bredvid varje FH Companion-varv ger varje hjuls slirning; varvfilen ensam gör det inte |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (delat minne) | ja, per hjul | uppmätt från varven | även ABS och spårkontroll i funktion, hjullaster, temperaturer |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | nej, räknas ut från hjulhastigheterna | uppmätt från varven | rally: löst underlag och hopp bedöms på annat sätt |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | nej | uppmätt från varven | inga hjulhastigheter |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (en mod) | nej, räknas ut från hjulhastigheterna | uppmätt från varven | |
| Trackmania | Openplanet-insticksprogrammet, `telemetry --game trackmania --install` | en slirningskoefficient per hjul | uppmätt från varven | arkadfysik: sladdar bedöms på annat sätt |
| iRacing | ingen: dess egen `.ibt`-fil | nej (loggas inte); räknas ut från girningen | nej (GPS-baserad) | slå på loggning i bilen med Alt+L |

## Så spelar du in ett varv {#how-to-record-a-lap}

1. Välj ditt spel i tabellen och ställ in det så som inspelarens sida för spelet säger (en inställning i spelet, en mod, eller ingenting alls för iRacing). Stegen skiljer sig mellan spelen, så de finns i inspelarnas dokument: [GameCapture: spel](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Starta inspelaren och kör. Den skriver en fil per varv.
3. På fliken **Racinganalys** tryck på **Läs in varvfiler…** och välj två eller fler varv av samma bana (se [Läs in varv](race-loading-laps.md)).

För rallyspel ger inspelaren en fil per sträckkörning. För Forza är enklaste starten FH Companions bibliotek med deras `.tele.gz`-filer bredvid varvfilerna.

## Vad inspelarna dokumenterar {#what-the-recorders-document}

Hur varje spel spelas in, vad det skickar, källorna till dess layouter och vilka banor som kan exporteras från dess filer, det dokumenterar inspelarna själva: [GameCapture: spel](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (offentlig, i [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). Varvfilen som varje inspelare skriver beskrivs i [GameCapture: varvformatet](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Vad visaren gör med dem {#what-the-viewer-does-with-them}

Varje spel hamnar som `heat3d-lap`-filer (eller som en varv-CSV, eller läses direkt, som iRacings `.ibt` görs). De använder de kanoniska kanalnamnen i `src/race/schema.ts` och ett `meta`-block som säger vad deras siffror betyder: hur slirningen är skalad, bana eller rally eller arkad, och underlaget när det är känt. Därför behandlar fliken **Racinganalys** alla lika. När ingen banmodell är inläst ritar fliken **Racinganalys** en väg utifrån varvens egen spridning, så varje spel går att använda utan modell.

Det som inget av rallyspelen skickar, däckslirningen, räknar visaren ut. Den gör det från varje hjuls kontaktyta eller ytfart mot bilens fart där ett spel skickar en sådan (`(hjul - bil) / bil`), och från hjulets rotation och en rullradie uppmätt på varvet självt där spelet bara skickar rotation. Driftvinkeln kommer från bilens egen hastighet (Forza, AC-spelen, Trackmania, RBR), från världshastigheten projicerad på bilens axlar (EA WRC, DiRT, BeamNG), eller från riktningen i förhållande till banan. Om bilen är i luften avgörs det av hjulens kontakt, laster eller fjädring. Se `src/race/derive.ts`.

Där ett spels värld är vänsterhänt, som Forzas, blir banan spegelvänd i visaren. Varvens egen styrning och fjädring avslöjar det, och fliken **Racinganalys** erbjuder att vända en axel. Spel där det inte står dokumenterat hur världen är vänd (RBR, BeamNG, Trackmania) hanteras på samma sätt: det mäts, det antas inte.

Utöver körkanalerna behåller inspelarna det varje spel lägger till: AC-spelens ABS och spårkontroll i funktion, bromsbalans, DRS, depåbegränsare, boost samt livslängd för bromsbelägg och bromsskivor. iRacings hjälpinställningar, bromsbalans, bränsle, olje- och vattentemperaturer, och varje annan kanal den loggar under sitt eget namn. Visaren ritar dem från sin kanaltabell (lampor, nivåer, symboler, grafer), så fler kanaler kräver ingen ändring i visaren.
