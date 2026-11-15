---
title: "Tacview-Parittéit"
parent: "Match-Replay"
grand_parent: "Replay"
nav_order: 1
lang: "lb"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Tacview-Parittéit

Tacview ass e bekannte Programm fir Fluchopnamen ze kucken. Wann Dir et kennt, weist dës Säit, wou all Funktioun vu Tacview bei 3DHeat ass.

Si lëscht all Funktioun vu Tacview 1.9 op (säin Handbuch, seng Tabell mat den Texter vun der Benotzerflächt an d'Dateiformat ACMI 2.2) a wéi d'[Match-Replay](match-replay.md) vu 3DHeat domat steet. D'Ziel: wat Tacview fir eng Replay an hir Daten kann, dat kann 3DHeat och.

**Stand:**
- **fäerdeg**: scho bei 3DHeat.
- **nei**: gebaut, fir eng Tacview-Funktioun no ze maachen.
- **nach net**: gëlt, awer gebaut ass se nach net.
- **n/a**: gëlt hei net, mat dem Grond.

Wou d'Funktiounen sinn: den **Match**-Tab, **Figuren-Replay** (oder **Figuren-Overlay** am Heatmap-Tab), an de Säitebar-Ofschnitter **Replay**, **Eenheeten**, **Evenementer**, **Lieszeechen**, **Taktesch Usiicht**, **Statistiken**, **Zäitverschibung an Trimmen**, **Kaart a Positioun**, **Audio a Video** an **Beschrëftungen**. Kuckt [Match-Replay](match-replay.md).

## Kameraen {#cameras}

| Tacview | 3DHeat | Stand |
|---|---|---|
| Cockpit-Usiicht (F5), den Horizont dréit sech mam Fligeren | **Cockpit**: aus der Eenheet eraus no hirer Lag, wéi dat Bewegungsmodell et huet. D'eege Figur vun der Eenheet gëtt ausgeblend. Zitt, fir ronderëm ze kucken; **Erëm no vir kucken** setzt zréck. | nei |
| HUD an der Cockpit-Usiicht (IAS/CAS/TAS-Wiel) | **Head-up-Display** (H): Horizont an Tonhöchtsleeder vun der richteger Usiicht, Fluchwee-Markéierung, Kursband, IAS, Héicht, TAS, Mach, G, Upwénkel, Vertikalgeschwindegkeet, AGL | nei |
| 3D-Cockpit-Instrumenter, Kapp-Verfolgung vum Pilot (PilotHead*), TrackIR | Keng Cockpit-Modeller; d'Kappwénkel stinn an der **Roh**-Usiicht vun der Eenheetskaart | n/a (keng Cockpit-Modeller; d'Kappverfolgung ass fir d'Liewefluch) |
| Extern Usiicht (F6): ronderëm dat Haaptobjet kreesen | **Hannendrun** (dréit mat der Eenheet) an **Orbit** (behält seng eege Richtung) | fäerdeg |
| Dogfight-Kamera, „Op d'Zil kucken" (Padlock) | **Padlock**: aus dem Cockpit, op d'Zil gehalen | nei |
| Dogfight-Kamera, „Zentréiert" / „No vir kucken" | **Zil**: hannert der Eenheet op der Linn vum Zil, kuckt laanscht et op d'Zil. **Fix** bei Azimut 0 kuckt no vir vun doheem. | nei |
| Haaptobjet an Zweetobjet tauschen | **Täuschen** nieft dem Zil | nei |
| Satellitte-Usiicht (F7), vertikal vu uewen | **Satellit**: direkt vun uewen op d'Eenheet, Norden uewen; zitt, fir ze dréinen. D'2D-Kaart ass de vertikale Plang. | nei |
| Fräi Kamera (F8), W/A/S/D, E/C | D'fräi Fluchkamera (W/A/S/D, Space/Q, Shift/Alt) | fäerdeg |
| Zousazkamera Head-On; externe Kamera, fest um Objet | **Fix**: eng Plaz ronderëm d'Eenheet, déi sech mat dréit a rullt; zitt, fir se ze réckelen (hannendrun, en Fligerflilleg, vir-op) | nei |
| Zousazkamera Lock Camera (Positioun festhalen) | Follegen ophalen (Esc): d'Kamera bleift, wou se war | fäerdeg |
| Strategesch Usiicht (erausgezoomt op d'ganz Äerd) | [Welt-Hannergrond](world-backdrop.md) an de Rumm vun der ganzer Opnam op der 2D-Kaart | fäerdeg |
| Astellung fir de Siichwénkel | **Kamera a Zeen** FOV | fäerdeg |
| Usiichten mat Tasten wiesselen | **V** nächst Usiicht, **Shift+V** zréck | nei |

## 3D-Usiicht an Uweflächenoptiounen {#d-view-and-display-options}

| Tacview | 3DHeat | Stand |
|---|---|---|
| Band-Spueren, Längeschiebe | Spueren (Sekonnen) am Team-Viewer | fäerdeg |
| Virauskuckende Spuer (Wee viraus) | **Wee viraus**: wou d'Eenheet an de nächste Sekonnen wierklech hiféiert | nei |
| Héichtelinnen oder Mauere vum Objet | **Lotlinnen** | fäerdeg (Linnen; Mauere sinn net gebaut) |
| Vektoren vum gewielte Objet: Kurs (gepunktet), Fahrt (vollen), Opdrift | **Vitessvektoren** (Kurs an Geschwindegkeet fir sou vill Sekonnen, mat engem Tipp) an **Nues- an Opdriwwslinnen** (Nues gestréchelt, Opdrift kuerz a donkel) | nei |
| Siichtlinn vum Pilot | **Siichtlinn vum Pilot**: eng gestrécheelt cyan Linn laanscht PilotHeadYaw/PilotHeadPitch (oder eng Kolonn HeadYaw, ViewYaw oder LookYaw) géint d'Achsen vun der Eenheet | nei |
| SAM/AAA-Reichweiten (EngagementRange, VerticalEngagementRange, EngagementMode, „2"-Zwillingen) | **Gefechtszonen**: Kuppelen, eiförmeg wou d'vertikal Reichweit anescht ass, esou laang wéi EngagementMode 0 ass | nei |
| Radar-Opschaltungen (LockedTarget..9) mat Etiketten | **Opschaltungen**: rout Linnen zu all opgeschalteter Objet; gestrécheelt giel zu FocusedTarget; laanscht LockedTargetAzimuth/Elevation/Range wou kee Objet genannt ass. **Opschaltungs-Etiketten**: den Numm an d'Distanz vum Zil op all Opschaltungslinn | nei |
| Radarkegel (RadarMode, Azimut, Elevatioun, Roll, Reichweit, Strahlbreeten) an Reichweitetor | **Radarkegelen**: Rand an Mëttelring vum Strahl, gedréint no Azimut, Elevatioun a Roll géint d'Eenheet; den Reichweitetor als zwee giel Ränner. Ouni Strahlbreeten nëmmen d'Achs vum Strahl. | nei |
| Siichtlinn tëscht den zwee gewielte Objeten (gréng / rout gepunktet, wann d'Terrain blockéiert) | D'Linn vum gemooossene Paar gëtt rout a gestrécheelt, wann d'Niveau tëscht hinnen ass | nei |
| Wäit ewech Objeten automatesch méi grouss | Klengst Figur um Bildschierm (Pixel) | fäerdeg |
| Breet- an Längegradnetz | **Kaart a Positioun → Gitter**: Breet- an Längelinnen op dem Buedem ënner der Kamera, an enger rondder Distanz fir d'Héicht (10° bis 1'), beschrëft; oder dat **MGRS**-Kilometergitter vun der UTM-Zon, mat der Zon an dem 100-km-Quadrat. D'Gitter vun der 2D-Kaart wéi virdrun | nei |
| Bullseye-Ringen | Ringen ëm de Bullseye vun all Team op der 2D-Kaart | nei (nëmmen 2D) |
| Gleitpfad-Iwwerlagerung | **Gleitpfaden**: 3°-Pisten mat de ±0,7°-Rand op béide Enden vun all Piste an der Nopeschaft vun der Opnam, aus de vermooss Schwelle an Héichte vun OurAirports (eemol erofgelueden, offline gehalen), eng Markéierung pro Nautesch Meile, mat Fluchhafen an Piste beschrëft | nei |
| Héichtebegrenzungen (Alarm fir Plafong/Buedem) | **Héichtebegrenzung**: e Buedem an e Plafong; Etiketten vun Eenheeten dobaussen ginn rout, an all Iwwerschreiden (ënner dem Buedem, iwwer dem Plafong, zréck dobannen) gëtt opgelëscht - e Klick geet dohinner a follegt der Eenheet | nei |
| Zerstéiert Objete grau, no 15 Minutten ewechgeholl | Liewen ophalen mat hirer Spuer; eng dout Eenheet gëtt an der Eenheetslëscht gedämpft | fäerdeg |
| Propertyen „Visible" / „Disabled" | An **Roh** gewisen; näischt gëtt dodurch verstoppt | nach net |
| Steierknüppel-, Gas- an Pedalpositioune uweisen | Gas- an Motorwäerter a Felder; Steuerinputs an **Roh** | fäerdeg (als Wäerter) |
| Kommentaren als Ënnertitelen | **Messagen als Ënnertitelen** (Beschrëftungen): ACMI-Message- an Comment-Evenementer, an Chat aus all Spill (Chat-, Say- oder Radio-Evenementer, oder eng Chat-Kolonn), ënne am Bild mat wiem et gesot huet, sechs Sekonnen | nei |
| Datums- an UTC-Zäitusiicht | Zäitlinn-Auer mat UTC, wann d'Opnam eng Referenzzäit huet | fäerdeg |
| Maus-Positioun Breet/Längt, MGRS, Bullseye | D'Kaart vum Punkt (klickt en Punkt) gëtt Breet/Längt a Grad, Minutten an Sekonnen an MGRS nieft de Welt-Meter; Bullseye pro Eenheet (Feld) | nei |
| Eegent Logo | Net gebaut | n/a (Branding) |
| 3D-Modeller, dat nootste wann onbekannt | Eege Figurekatalog, nootste Géigestéck, richtege Gréisst | fäerdeg |
| Vill Engagementer (Linnen tëscht all Puer) | **Kampflinnen**: vun all Eenheet am Ëmfang zu all Géigner an der agestallter Distanz (1-200 km), mat der Distanz, déi 60 nootste Puer; dat gemooss Puer wéi virdrun | nei |

## Beschrëftungen {#labels}

| Tacview | 3DHeat | Stand |
|---|---|---|
| Beschrëftungen un/aus, getrennt fir gewielt an net gewielt Objeten | **Beschrëftungen** mat Reegelen fir **Gewielt**, **Fligeren**, **Buedem**, **Schëffer**, **Waffen** an **KI**: gewisen oder net, eegen Wäerter, Prioritéit | nei |
| Beschrëftungsfelder: Numm, Rufzeechen, Pilot, Geschwindegkeeten (TAS/CAS/IAS/Mach/GS), Héichten (ASL/AGL), VS, AOA, AOS, G (vertikal, quer, längs), Dréiungsrate an -radius, Energie, Brennstoff (Gewiicht/Volumen/Fluss), Kurs/Spuer, Roll/Pitch, Häerzfrequenz | All Wäert vun `fields.ts`: dee selwechten Undeel, do wou se net opgeholl sinn, ausgerechent (mat ~ markéiert). Rollrate an SpO2 nëmme via Roh. | fäerdeg |
| Bullseye-Positioun an de Beschrëftungen | Feld **Bullseye (Peilung / Distanz)** | nei |
| ILS-Ofwäichungen, zréckgeluechte Distanz | Rauwerter a Roh; geflunn Distanz an der Statistik | fäerdeg (deelweis) |
| Net gewielt Telemetrie ophuelen | **Etiketten ausenanerhalen**, geuerdnet no der Prioritéit vun all Reegel | fäerdeg / nei |
| All Buedemobjete beschrëften / nëmmen Gefore | D'Reegelen Buedem an KI | nei |
| Beschrëftungsgréisst | **Etikettegréisst** (60-250 %) | nei |
| Metresch oder englesch Eenheeten | Metresch / englesch | fäerdeg (zwou Virastellungen, net aacht) |

## Objektinfo an Telemetrie {#object-info-and-telemetry}

| Tacview | 3DHeat | Stand |
|---|---|---|
| Haaptauswiel an Zweetauswiel | Klick follegt a wielt; Shift-Klick op zwee fir ze moossen; **Zil**-Auswiel | fäerdeg / nei |
| Distanz / Peilung / Aspekt / Annäherung tëscht zwee Objeten | BRAA-Linn vum gemoossene Paar; Felder Distanz, Peilung, Aspekt an Annäherung vun der gefollegter Eenheet | fäerdeg |
| Relativ Peilung, Siichtlinn-Rate | Felder **Relativ Peilung** (vun der Nues vun der gefollegter Eenheet, L/R) an **Wénkelgeschwindegkeet vun der Siichtlinn** (°/s) | nei |
| Telemetrie-Fënsteren | D'Eenheetskaart an d'Schwiewekaart | fäerdeg |
| Roh-Telemetrie (all opgehuelt Propertyen, och déi onbekannt) | **Roh** an der Eenheetskaart: all Kolonn an der Zeil vun der Eenheet, wéi se geschriwwe steet | nei |
| Lëscht vun aktive Objeten | **Eenheeten**: Spiller, KI, Waffen an der Loft; lieweg hell | fäerdeg |
| Fënster mat de Propertyen vun der Opnam (Titel, Auteur, Briefing...) | Als Kolonn RecordingInfo gehalen; an Roh gewisen | fäerdeg (kee Fënster) |
| Positiounsformater DMS/MGRS, magnetesche Norden | **Positioun (Breet / Längt)** a DMS an **MGRS**-Felder; e Feld **Magnetesche Steierkurs**; **Magnéitesch Kursen** schreift Kurs a Peilung magnetesch (°M) an weist e Kompass mat béide Nordeen an der Ofwäichung - dat Weltmagnetmodell 2025 (ëffentlech Koeffizienten), hei ausgerechent fir d'Plaz an den Datum vun der Eenheet | nei |

## Diagrammer {#charts}

| Tacview | 3DHeat | Stand |
|---|---|---|
| Diagramm vun engem Objet, bis 4 Wäerter | **Iwwer d’Zäit** (an de Diagramm ënner Replay) | fäerdeg |
| Bis 4 Objete gläichzäiteg zeechnen | **Vergläichen**: ee Wäert vun bis 8 Eenheeten op enger Skala | nei |
| Wäert géint Wäert (Energie-Manöververmögen) | **Wäert géint Wäert**: Dréiungsrate géint Geschwindegkeet oder all anert Paar, all Eenheet eng Linn, hiren aktuellen Punkt markéiert | nei |
| X-Achs no Zäit; zoomen; Zäit aus dem Diagramm verréckelen | Mausrad zoomt an der Zäit, Duebelklick setzt zréck, Klick geet op de Moment | nei |
| X-Achs no Loft- oder Buedemdistanz | **Zäit / Lofdistanz / Buedemdistanz** op de Zäit- an de Vergläichsdiagrammer; Zoom an Klick-zum-Goen funktionéieren wéi virdrun | nei |
| Virdefinéiert Diagrammer (Energie, Beschleunegung...) | All Wäert kann gewielt ginn (Energiehéicht an hir Ännerung si Wäerter) | fäerdeg |

## Statistiken, Fluchlog, Evenementer {#statistics-flight-log-events}

| Tacview | 3DHeat | Stand |
|---|---|---|
| Fluchlog: ofgehuewen, gelant, geschoss, getraff vun, zerstéiert vun, Gebitt verlooss | **Statistiken** pro Eenheet: Liewen, Ofschosse, Doudesfäll, Schëss, Treffer, Trefferquote, Ofhiewen, Landungen, Zäit an der Loft, méi héich G (a mannst G), héchst Geschwindegkeet, Héicht a Mach, Distanz. Ofhiewen kommen vun TakenOff-/Landed-Evenementer, OnGround, AGL oder enger Schätzung mat ~. | nei |
| Zousätz fir Resultatstabellen a Missiounsberichter | Zesummefaassung pro Team an déi meeschte Ofschëss; d'eegen Resultatstabell vun der Match-Zesummefaassung | nei / fäerdeg |
| Fluchlog als XML/CSV exportéieren | **CSV exportéieren** vun der Statistik, an vun de Evenementer wéi se opgelëscht sinn | nei (nëmmen CSV) |
| Telemetrie-CSV mat enger Rate exportéieren | **Telemetrie vun der gewielter Eenheet**: all Wäert, 1-20 pro Sekonn | nei |
| Evenement-Logbuch, Duebelklick fir dohinner ze goen an ze wielen | **Evenementer**-Lëscht, gefilter no Aart a Eenheet; e Klick fléien dohinner | fäerdeg |
| Lescht / nächst Evenement (Ctrl+←/→) | **Bild op / Bild erof** | nei |
| Pausen am Evenement | **Pausen am Evenement** | nei |
| Zäitlinn-Markéierungen (Erléisungen, Treffer, Zerstéierungen; dat vum gewielte Objet blo, Lieszeechen rout) | Ofschëss an Doudesfäll als Dichtegrafik, dat vun der gefollegter Eenheet blo, Lieszeechen rout; klicken, fir dohinner ze goen | nei |
| Evenement ewechhuelen, Kill-Remove | Net gebaut | n/a (d'Evenementer si vun der Opnam; Filteren verstoppt se) |

## Lieszeechen {#bookmarks}

| Tacview | 3DHeat | Stand |
|---|---|---|
| Lieszeechen setzen mat Auswiel an Usiicht | **Lieszeechen derbäisetzen** (B): de Moment, d'fräi Kamera oder d'gefollegt Eenheet mat hirer Usiicht, Distanz a Zil; mat Numm; an dësem Browser pro Opnam gehalen | nei |
| Lieszeechen ewechhuelen | × an der Lëscht | nei |
| Lieszeechen op der Zäitlinn an an de Lëschte | Rout Markéierungen; d'Lëscht | nei |
| Event=Bookmark am ACMI | Ënner den Markéierunge vun der Opnam opgelëscht, mat Ofschëss, Doudesfäll a Messagen | nei |
| Kopéiere-/Afügen-Tastatur (eng Usiicht deelen) | **Exportéieren / Importéieren** vun de Lieszeechen als Datei; C kopéiert d'Kamerastellung | nei |

## Ofspillen {#playback}

| Tacview | 3DHeat | Stand |
|---|---|---|
| Ofspillen/Pausen, op den Ufank, Geschwindegkeet, Zäitlinn schrauwen | Zäitlinn | fäerdeg |
| Bild fir Bild | **,** an **.** eng Sekonn zréck an no vir (Shift: zéng) | nei |
| Ëmgedréint ofspillen | **◀** op der Zäitlinn, **J** (**L** no vir; dee selwechte Knäppchen nach eng Kéier hält un): spillt vum Enn Richtung Ufank mat der gewielter Geschwindegkeet, a Schleife oder hält um Ufank | nei |
| Zäitsprong-Fënster | D'Zäitlinn an d'Evenementlëscht | fäerdeg |
| Zäitverschibung vun engem Objet (Geescht) | **Zäitverschibung an Trimmen**: de Fluch vun enger Eenheet oder vun enger ganzer Opnam ëm sou vill Sekonnen verréckelen; **Opnamen ausriichten** setzt verschidde Opnamen zesummen un de Start a spillt se gläichzäiteg of (zwee Flich un verschiddenen Deeg niewent-enanner). D'Opnam gëtt nei gebaut, also Spueren, Evenementer, Diagrammer a Statistiken lafen mat | nei |
| Trimmen virdrun/duerno | **Vun elo un / Bis elo / Op dës Spann schneiden** (Zréckhuele hält d'Verschiebungen), dann **CSV exportéieren** (lued sech a 3DHeat zréck) oder **ACMI exportéieren** (Tacview-2.2-Text, fir eng Opnam op der Äerd) | nei |

## Terrain a Kaart {#terrain-and-map}

| Tacview | 3DHeat | Stand |
|---|---|---|
| Richtegt Terrain, eegen Héichten a Texturen | Niveauen (d'eege Kaart vum Spill als 3D-Modell), Kachele vum Welt-Hannergrond | fäerdeg |
| Flaches / eidelt / héichkontrastrecht Terrain | [Niveau-Ausgesinn](level-appearance.md): Geländerelief, Uewerfläch a Bauten gewisen oder net | fäerdeg (net dee selwechte Modi) |
| 2D-Taktikkaart (Tacview huet keng: Satellitte-Usiicht) | **2D-Kaart**: Eck- oder ganz Usiicht, Symboler no Aart a Team (voll Spiller, Ëmrëss KI) no hirer Richtung gedréint, Spueren, Nimm, Skaleleiste, Distanzringen ëm d'gefollegt Eenheet, Bullseye-Ringen, d'Plaz vun der 3D-Kamera, nei Doudesfäll; zéien, Mausrad, Klick fir ze follegen (M) | nei |
| Statesch Objete (Fluchhäfen, Pisten, Wegpunkte, Gebidder, KML) | Richteg Pisten (OurAirports) am Welt-Hannergrond an hir Gleitpfaden; GPX-Wegpunkte a KML-Markéierungen gi als stänneg Objeten gelueden; de [Taktikbrett](tactics-board.md) zeechent Gebidder an Routen | nei |

## Import, Export, Opnam {#import-export-recording}

| Tacview | 3DHeat | Stand |
|---|---|---|
| ACMI-Text an Zip | [Tacview ACMI](tacview-acmi.md) | fäerdeg |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (Spueren, Routen, Wegpunkte; Garmin-Häerzfrequenz, Trëtt, Leeschtung, Temperatur), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC an GGA vu jidder Quell, Prüfsummen kontrolléiert, iwwer Mëtternuecht), **IGC** (B-Eintrëg, Datum, Pilot an Segelfliger), **FIT** (Record-Messagen, komprimiert Zäitstempel) - all no Breet a Längt op der Ebene an der Mëtt vun den Spueren gesat, sou datt de Welt-Hannergrond passt; Kurs, Neigung an Geschwindegkeet aus der Datei oder vun enger Positioun zu der nächster. CSV a Parquet wéi virdrun | nei (DIS n/a: e Live-Netzwierkprotokoll) |
| Eegen Recorder (DCS, BMS, IL-2, MSFS...) | Dem 3DHeat seng eege Konverter (War Thunder, CS2, Squad, Arma an anerer) | fäerdeg (eegen) |
| Telemetrie a Real-Zäit iwwer TCP, ADS-B | Net gebaut | n/a (Replays nom Match) |
| Synchron Audio/Video | **Audio a Video**: eng lokal Datei spillt, pausiert, sicht an ännert d'Geschwindegkeet mat der Zäitlinn ab engem gesate Start (**Fänkt elo un**, ±0,1 s); e Video an engem gréisseren Fënster iwwer der Usiicht, oder Bild-am-Bild. D'Datei bleift am Browser | nei |
| Video-Export | [Kamerapad an Video](camera-path-and-video.md) | fäerdeg |

## Anescht {#other}

| Tacview | 3DHeat | Stand |
|---|---|---|
| Lua-Zousätz | Net gebaut | n/a (oppe Quellcode: den Viewer selwer änneren) |
| Online-Debriefing (gedeelte Sessioun) | Net gebaut | n/a (dem Tacview seng ass eng gehäscht Sessioun, déi all op engem Playhead hält. 3DHeat huet keen Server a behält d'Opnamen op dem Rechner vum Viewer, a och eng Peer-to-Peer-Verbindung brauch e Signalserver. E Debriefing gëtt als Dateien gedeelt: d'getrimmt Opnam (ACMI- oder CSV-Export) an d'Lieszeechen-Datei, déi bei de selwechten Momenter an Usiichten opmaachen) |
| Instruktor-Fernsteierung | Net gebaut | n/a (steiert e lafende Simulator) |
| Objete beaarbechten (derbäisetzen, änneren, ewechhuelen) | [Taktikbrett](tactics-board.md) fir geplangt Objeten; Opnamen sinn nëmme liesbar | n/a |
| Sproochen | 40 Sprooche | fäerdeg |
| Authentifizéierung vun Opnamen | Net gebaut | n/a |

## Fir Entwéckler: ACMI-2.2-Propertyen {#for-developers-acmi-22-properties}

Gelies vun `data/acmi.ts`; numeresch Propertyen ginn Zuelekolonnen, Text-Propertyen Kategoriekolonnen. All si ënner **Roh** an der Eenheetskaart gewisen. Dës ginn fir e Zweck gelies:

| Propertyen | Benotzung |
|---|---|
| T (all véier Formen), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Positioun, Lag, Figur, Eenheetsnumm, Team |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Felder, Diagrammer, HUD, Erkennung vum Ofhiewen a Landen |
| VerticalGForce, LongitudinalGForce, LateralGForce | G-Felder |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Felder |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Brennstoff-Felder, iwwer d'Tanken zesummegezielt |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radarkegelen an Reichweitetor |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Opschaltungslinnen |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Gefechtskupelen |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Felder |
| Health | Feld |
| Evenementer: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Evenementlëscht, Statistik (Doudesfäll, Ofhiewen, Landungen), Lieszeechen; Message a Comment als Ënnertitelen |
| PilotHeadYaw, PilotHeadPitch | Siichtlinn vum Pilot |
| Typ-Markéierung Bullseye (Navaid+Static+Bullseye) | Bullseye-Feld a Kaartringen |
| Alles anert (PilotHeadRoll, Steierungen, Uewerflächen, ILS-Ofwäichungen, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, Gréissten...) | Wéi geschriwwen gewisen ënner **Roh** |

Radar- an Opschaltungswénkel sinn op d'eege Achsen vun der Eenheet bezu: Azimut no riets, Elevatioun no uewen, Roll riets Flillek no ënnen. D'ACMI-Spezifikatioun seet, datt se relativ zum Fligeren sinn, awer net, a wéi enger Richtung positiv ass; dës Liesung follegt hirer Transformatioun (Gier am Auer-Sënn, Pitch no uewen, Roll riets).

