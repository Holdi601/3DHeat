---
title: "Andre racingspill"
parent: "Løpsanalyse"
nav_order: 59
lang: "no"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Andre racingspill i visningsprogrammet

Visningsprogrammet leser runder fra mange racingspill, ikke bare ett. Denne siden lister dem opp og forklarer hvordan du får en runde ut av hvert av dem.

## Spillene {#the-games}

| Spill | Opptaker | Sliring i filen? | Verden speilvendt? | Merknader |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out over UDP), eller rundefilene fra FH Companion pluss deres `.tele.gz` | ja, per hjul (normalisert) | ja (venstrehåndet verden) | `.tele.gz`-filen ved siden av hver FH Companion-runde gir sliring for alle hjul; rundefilen alene gjør det ikke |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (delt minne) | ja, per hjul | målt fra rundene | også ABS og sporingskontroll i bruk, hjullaster og temperaturer |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | nei, regnes ut fra hjulhastighetene | målt fra rundene | rally: løst underlag og hopp bedømmes ulikt |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | nei | målt fra rundene | ingen hjulhastigheter |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (en mod) | nei, regnes ut fra hjulhastighetene | målt fra rundene | |
| Trackmania | Openplanet-tillegget, `telemetry --game trackmania --install` | en sliringskoeffisient per hjul | målt fra rundene | arkadefysikk: sliring bedømmes ulikt |
| iRacing | ingen: sin egen `.ibt`-fil | nei (ikke logget); regnes ut fra giringen | nei (GPS-basert) | slå på logging i bilen med Alt+L |

## Slik tar du opp en runde {#how-to-record-a-lap}

1. Velg spillet ditt i tabellen og sett det opp slik siden for opptakeren for det spillet sier (en innstilling i spillet, en mod, eller ingenting for iRacing). Stegene er ulike for hvert spill, så de står i opptakernes dokumenter: [GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Start opptakeren, og kjør. Den skriver én fil per runde.
3. I fanen **Løpsanalyse** trykk **Last inn rundefiler…** og velg to eller flere runder av samme bane (se [Laste inn runder](race-loading-laps.md)).

For rallyspill gir opptakeren én fil per etappekjøring, og for Forza er den enkleste starten FH Companions bibliotek med `.tele.gz`-filene ved siden av rundefilene.

## Hva opptakerne dokumenterer {#what-the-recorders-document}

Hvordan hvert spill tas opp, hva det sender, kildene til layoutene, og hvilke baner som kan eksporteres fra filene, er opptakernes ansvar å dokumentere: [GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (offentlig, i [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). Rundefilen hver opptaker skriver er beskrevet i [GameCapture: rundeformatet](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Hva visningsprogrammet gjør med dem {#what-the-viewer-does-with-them}

Hvert spill ender som `heat3d-lap`-filer (eller som en CSV-fil med runder, eller leses direkte, slik iRacings `.ibt` gjøres), med de kanoniske kanalnavnene i `src/race/schema.ts` og en `meta`-blokk som sier hva tallene betyr: hvordan sliringen er skalert, bane, rally eller arkade, og underlaget når det er kjent. Dermed behandler fanen **Løpsanalyse** dem alle likt. Når ingen banemodell er lastet, tegner fanen **Løpsanalyse** en vei ut fra rundenes egen spredning, så hvert spill kan brukes uten modell.

Det ingen av rallyspillene sender, sliring i dekkene, regner visningsprogrammet ut: fra hvert hjuls kontaktflate eller overflatehastighet mot bilens fart der et spill sender en av dem (`(wheel - car) / car`), og fra hjulrotasjonen og en rullradius målt på selve runden der spillet bare sender rotasjon. Driftvinkelen kommer fra bilens egen hastighet (Forza, AC-spillene, Trackmania, RBR), fra verdenshastigheten projisert på bilens akser (EA WRC, DiRT, BeamNG), eller fra retningen i forhold til banen. Om bilen er i luften, kommer fra hjulenes kontakt, belastning eller fjæring. Se `src/race/derive.ts`.

Der et spills verden er venstrehåndet, slik Forzas er, blir banen speilvendt i visningsprogrammet. Rundenes egen styring og fjæring avslører det, og fanen **Løpsanalyse** tilbyr å invertere en akse. Spill der håndvendingen ikke er dokumentert (RBR, BeamNG, Trackmania) behandles likt: målt, ikke antatt.

Utover kjørekanalene tar opptakerne vare på det hvert spill legger til: AC-spillenes ABS og sporingskontroll i bruk, bremsebalanse, DRS, pitbegrenser, boost og levetiden til bremseklosser og bremseskive; iRacings hjelpeinnstillinger, bremsebalanse, drivstoff, olje- og vanntemperaturer, og alle andre kanaler det logger under sitt eget navn. Visningsprogrammet tegner dem fra sin kanaltabell (lamper, nivåer, symboler, grafer), så å ta opp mer krever ingen endring i visningsprogrammet.
