---
title: "Aner Rennspiller"
parent: "Course-Analys"
nav_order: 59
lang: "lb"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Aner Rennspiller an der Visualisatioun

D'Visualisatioun liest Ronnen aus ville Rennspiller, net nëmmen aus engem. Dës Säit listet se op a seet, wéi een all Spiller eng Ronn kritt.

## D'Spiller {#the-games}

| Spiller | Opnamegerät | Rutsch an der Datei? | Welt gespigelt? | Notizen |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out iwwer UDP), oder d'Rondendateien vum FH Companion plus hir `.tele.gz` | jo, pro Rad (normaliséiert) | jo (linkshänneg Welt) | déi `.tele.gz` nieft all FH-Companion-Ronn gëtt de Rutsch fir all Rad; d'Rondendatei eleng gëtt en net |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (gemeinsame Späicher) | jo, pro Rad | aus den Ronnen gemooss | och ABS a Traktiounskontroll am Asaz, Radlaascht, Temperaturen |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | nee, aus de Radgeschwindegkeeten ausgerechent | aus den Ronnen gemooss | Rally: lockeren Buedem a Sprénge gëtt anescht beuerteelt |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | nee | aus den Ronnen gemooss | keng Radgeschwindegkeeten |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (e Mod) | nee, aus de Radgeschwindegkeeten ausgerechent | aus den Ronnen gemooss | |
| Trackmania | den Openplanet-Plugin, `telemetry --game trackmania --install` | e Rutsch-Koeffizient pro Rad | aus den Ronnen gemooss | Arcade-Physik: Rutscher gëtt anescht beuerteelt |
| iRacing | keen: seng eege `.ibt`-Datei | nee (net opgeholl); aus dem Gier ausgerechent | nee (GPS-baséiert) | Logging am Auto mat Alt+L aschalten |

## Wéi ee eng Ronn opnémmt {#how-to-record-a-lap}

1. Sich däin Spiller an der Tabell eraus a riicht en an, wéi d'Säit vum Opnamegerät fir dee Spiller seet (eng Astellung am Spiel, e Mod, oder guer näischt bei iRacing). D'Schrëtt sinn bei all Spiller anescht, dofir stinn se an den Dokumenter vun de Opnamegeräter: [GameCapture: Spiller](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Start d'Opnamegerät an fuer dann. Et schreift eng Datei pro Ronn.
3. Am Tab **Course-Analys** dréck **Ronnefichiere lueden…** a wiel zwou oder méi Ronnen vum selwechte Parcours (kuckt [Ronnen lueden](race-loading-laps.md)).

Bei Rallye-Spiller gëtt d'Opnamegerät eng Datei pro Etappelaf. Bei Forza ass den einfachste Start d'Bibliothéik vum FH Companion mat de `.tele.gz`-Dateien nieft de Rondendateien.

## Wat d'Opnamegeräter dokumentéieren {#what-the-recorders-document}

Wéi all Spiller opgeholl gëtt, wat et schécken, d'Quelle fir seng Layouten, an iwwerwelch Parcoursen aus senge Dateien kann exportéiert ginn, dat dokumentéieren d'Opnamegeräter selwer: [GameCapture: Spiller](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (ëffentlech, am [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). D'Rondendatei, déi jiddert Opnamegerät schreift, ass [GameCapture: d'Rondenformat](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Wat d'Visualisatioun domat mécht {#what-the-viewer-does-with-them}

All Spiller ännert sech zu `heat3d-lap`-Dateien (oder enger Ronn-CSV, oder et gëtt direkt gelies, wéi iRacing seng `.ibt`), mat de kanonesche Kanalnimm aus `src/race/schema.ts` an engem `meta`-Block, deen seet, wat seng Zuelen bedeiten - wéi de Rutsch skaléiert ass, ob Circuit, Rally oder Arcade, an den Undergrond wann bekannt. Dofir behandelt de Tab **Course-Analys** se all gläich. Wann kee Parcoursmodell gelueden ass, zeechent de Tab **Course-Analys** eng Strooss aus der Streeung vun den Ronnen selwer. So ass jiddert Spiller brauchbar ouni Parcoursmodell.

Wat keen vun de Rallye-Spiller schéckt - de Reifenrutsch - rechent d'Visualisatioun aus: aus dem Kontaktflech vum Rad oder der Uewerflächegeschwindegkeet géint d'Geschwindegkeet vum Auto, wou e Spiller eng schéckt (`(Rad - Auto) / Auto`), a wann e nëmmen d'Drieung schéckt, aus der Drieung an engem Rollradius, deen op der Ronn selwer gemooss ass. De Driftwénkel kënnt vun der eegener Geschwindegkeet vum Auto (Forza, d'AC-Spiller, Trackmania, RBR), aus der Weltgeschwindegkeet, projizéiert op d'Achsen vum Auto (EA WRC, DiRT, BeamNG), oder aus der Richtung géint de Wee. Ob d'Auto an der Loft ass, kënnt vum Kontakt vun de Räder, de Laschten oder der Federung. Kuckt `src/race/derive.ts`.

Wann d'Welt vun engem Spiller linkshänneg ass - wéi bei Forza - kënnt de Parcours an der Visualisatioun gespigelt eraus. D'eegen Lenkung a Federung vun der Ronn verroden dat; de Tab **Course-Analys** bitt un, eng Achs ëmzedréinen. Spiller, bei deenen d'Händegkeet net dokumentéiert ass (RBR, BeamNG, Trackmania), ginn der selwechter Manéier behandelt: gemooss, net ugeholl.

Nieft de Fuerfunktiounen halen d'Opnamegeräter fest, wat all Spiller derbäi bréngt: bei den AC-Spiller ABS an Traktiounskontroll wann se aktiv sinn, Bremsverdeelung, DRS, Boxenbegrenzer, Boost an d'Liewensdauer vun de Bremsbäppen an der Bremsscheif; bei iRacing d'Hëllefsastellungen, Bremsverdeelung, Benzin, Ueleg- an Waasserttemperaturen, a jiddere Kanal, deen et ënner sengem eegenen Numm opholt. D'Visualisatioun zeechent se aus hirer Kanaltabell - als Lampen, Niveauen, Symboler oder Grafiken. Dofir brauch méi Opnemen keng Ännerung an der Visualisatioun.
