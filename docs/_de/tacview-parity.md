---
title: "Tacview-Parität"
parent: "Match-Replay"
grand_parent: "Replay"
nav_order: 1
lang: "de"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Tacview-Parität

Tacview ist ein beliebtes Programm, um Flugaufnahmen anzusehen. Wenn du es kennst, zeigt diese Seite, wo jedes seiner Werkzeuge in 3DHeat zu finden ist.

Sie listet jede Funktion von Tacview 1.9 auf (sein Handbuch, seine Tabelle mit den Oberflächentexten und das Dateiformat ACMI 2.2) und zeigt, wo das [Match-Replay](match-replay.md) von 3DHeat dabei steht. Das Ziel: Was Tacview für ein Replay und seine Daten kann, kann 3DHeat auch.

**Status:**
- **vorhanden**: ist schon in 3DHeat.
- **neu**: gebaut, um eine Tacview-Funktion nachzubilden.
- **noch nicht**: trifft zu, ist aber nicht gebaut.
- **entfällt**: trifft hier nicht zu, mit dem Grund.

Wo du die Funktionen findest: im Tab **Match**, bei **Figuren-Replay** (oder **Figuren-Overlay** im Tab Heatmap), in den Seitenleisten-Abschnitten **Replay**, **Einheiten**, **Ereignisse**, **Lesezeichen**, **Taktische Anzeige**, **Statistik**, **Zeitverschiebung und Zuschnitt**, **Karte und Position**, **Audio und Video** und **Beschriftungen**. Siehe [Match-Replay](match-replay.md).

## Kameras {#cameras}

| Tacview | 3DHeat | Status |
|---|---|---|
| Cockpit-Ansicht (F5), der Horizont dreht sich mit dem Flugzeug | **Cockpit**: aus der Einheit heraus entlang ihrer Lage, so wie das Bewegungsmodell sie führt. Die eigene Figur der Einheit wird ausgeblendet. Ziehen, um sich umzusehen; **Wieder nach vorn schauen** setzt zurück. | neu |
| HUD in der Cockpit-Ansicht (Wahl IAS/CAS/TAS) | **Head-up-Display** (H): Horizont und Tonleiter des tatsächlichen Blicks, Flugbahnmarker, Kursband, IAS, Höhe, TAS, Mach, G, Anstellwinkel, Vertikalgeschwindigkeit, AGL | neu |
| 3D-Cockpitinstrumente, Kopfverfolgung des Piloten (PilotHead*), TrackIR | Keine Cockpit-Modelle; die Kopfwinkel stehen in der Ansicht **Roh** der Einheitenkarte | entfällt (keine Cockpit-Modelle; Kopfverfolgungs-Hardware ist für das Fliegen in Echtzeit gedacht) |
| Außenansicht (F6): um das primäre Objekt kreisen | **Verfolger** (dreht sich mit der Einheit) und **Orbit** (behält seine eigene Richtung) | vorhanden |
| Dogfight-Kamera, „Ziel anschauen“ (Padlock) | **Padlock**: aus dem Cockpit, auf dem Ziel gehalten | neu |
| Dogfight-Kamera, „Zentriert“ / „Nach vorn schauen“ | **Ziel**: hinter der Einheit auf der Linie zum Ziel, mit Blick über sie hinweg auf das Ziel. **Fest** bei Azimut 0 schaut von vorn nach vorn. | neu |
| Primäres und sekundäres Objekt tauschen | **Tauschen** neben dem Ziel | neu |
| Satellitenansicht (F7), senkrecht von oben | **Satellit**: senkrecht nach unten auf die Einheit, Norden oben; Ziehen dreht. Die 2D-Karte ist der senkrechte Grundriss. | neu |
| Freie Kamera (F8), W/A/S/D, E/C | Die freie Flugkamera (W/A/S/D, Leertaste/Q, Umschalt/Alt) | vorhanden |
| Zusatz „Head-On“-Kamera; externe Kamera fest am Objekt | **Fest**: ein Platz um die Einheit, der sich mit ihr dreht und rollt; Ziehen verschiebt ihn (hinten, an einer Flügelspitze, von vorn) | neu |
| Zusatz „Lock-Kamera“ (Position einfrieren) | Folgen beenden (Esc): die Kamera bleibt, wo sie war | vorhanden |
| Strategische Ansicht (herauszoomen auf die ganze Erde) | [Welt-Hintergrund](world-backdrop.md) und der Rahmen der 2D-Karte für die ganze Aufnahme | vorhanden |
| Einstellung des Sichtfelds | **Kamera & Szene**, Sichtfeld | vorhanden |
| Ansichten mit Tasten durchschalten | **V** nächste Ansicht, **Umschalt+V** zurück | neu |

## Optionen für 3D-Ansicht und Anzeige {#d-view-and-display-options}

| Tacview | 3DHeat | Status |
|---|---|---|
| Bandspuren, Regler für die Länge | Spuren (Sekunden) im Team-Viewer | vorhanden |
| Vorausschauende Spur (Weg voraus) | **Weg voraus**: wohin die Einheit in den nächsten Sekunden tatsächlich fährt | neu |
| Höhenlinien über dem Objekt / Wände | **Lotlinien** | vorhanden (Linien; Wände nicht gebaut) |
| Vektoren des gewählten Objekts: Richtung (gepunktet), Kurs (durchgezogen), Auftrieb | **Geschwindigkeitsvektoren** (Kurs und Geschwindigkeit für so viele Sekunden, mit einem Tipp) und **Nasen- und Auftriebslinien** (Nase gestrichelt, Auftrieb kurz und dunkel) | neu |
| Blickrichtung des Piloten | **Blickrichtung des Piloten**: eine gestrichelte cyanfarbene Linie entlang PilotHeadYaw/PilotHeadPitch (oder einer Spalte HeadYaw, ViewYaw oder LookYaw) gegen die Achsen der Einheit | neu |
| Tödliche Reichweiten von Flugabwehr (EngagementRange, VerticalEngagementRange, EngagementMode, die Zwillinge mit „2“) | **Wirkungszonen**: Kuppeln, eiförmig, wo sich die vertikale Reichweite unterscheidet, aus, solange EngagementMode 0 ist | neu |
| Radarzielerfassungen (LockedTarget..9) mit Beschriftungen | **Aufschaltungen**: rote Linien zu jedem aufgeschalteten Objekt; gestrichelt bernsteinfarben zu FocusedTarget; entlang LockedTargetAzimuth/Elevation/Range, wo kein Objekt genannt wird. **Lock-Beschriftungen**: Name und Entfernung des Ziels an jeder Aufschaltlinie | neu |
| Radarkegel (RadarMode, Azimut, Elevation, Roll, Reichweite, Strahlbreiten) und Entfernungstor | **Radarkegel**: Rand und mittlerer Ring des Strahls, gedreht nach Azimut, Elevation und Roll gegen die Einheit; das Entfernungstor als zwei gelbe Ränder. Ohne Strahlbreiten nur die Achse des Strahls. | neu |
| Sichtlinie zwischen den beiden gewählten Objekten (grün / rot gepunktet, wenn Gelände dazwischen liegt) | Die Linie des gemessenen Paares wird rot und gestrichelt, wenn das Level dazwischen liegt | neu |
| Entfernte Objekte automatisch vergrößern | Kleinste Figur auf dem Bildschirm (Pixel) | vorhanden |
| Breiten-/Längengitter | **Karte und Position → Gitter**: Breiten- und Längenlinien auf dem Boden unter der Kamera, mit runden Abständen je nach Höhe (10° bis 1'), beschriftet; oder das **MGRS**-Kilometergitter der UTM-Zone, mit Zone und 100-km-Quadrat. Das eigene Gitter der 2D-Karte wie bisher | neu |
| Bullseye-Ringe | Ringe um das Bullseye jedes Teams auf der 2D-Karte | neu (nur 2D) |
| Gleitpfad-Überlagerung | **Gleitpfade**: 3°-Pfade mit den Rändern für Vollausschlag bei ±0,7° an beiden Enden jeder Landebahn nahe der Aufnahme, aus den vermessenen Schwellen und Höhen von OurAirports (einmal geladen, offline gespeichert), ein Strich bei jeder Seemeile, benannt nach Flughafen und Landebahn | neu |
| Höhenbeschränkungen (Alarm für Decke und Boden) | **Höhenbeschränkung**: ein Boden und eine Decke; Beschriftungen von Einheiten außerhalb werden rot, und jede Überschreitung (unter dem Boden, über der Decke, zurück innerhalb) ist aufgelistet – ein Klick fährt dorthin und folgt der Einheit | neu |
| Zerstörte Objekte grau, nach 15 min entfernt | Leben enden mit ihrer Spur; eine tote Einheit wird in der Einheitenliste abgedunkelt | vorhanden |
| Eigenschaften „Sichtbar“ / „Deaktiviert“ | In **Roh** angezeigt; nichts wird dadurch ausgeblendet | noch nicht |
| Positionen von Steuerknüppel, Schub und Pedalen anzeigen | Schub- und Triebwerkswerte in Feldern; Steuereingaben in **Roh** | vorhanden (als Werte) |
| Kommentare als Untertitel | **Nachrichten als Untertitel** (Beschriftungen): ACMI-Ereignisse Message und Comment sowie Chat aus jedem Spiel (Ereignisse Chat, Say oder Radio, oder eine Chat-Spalte), unten in der Ansicht mit Angabe, wer es sagte, sechs Sekunden lang | neu |
| Anzeige von Datum und UTC-Zeit | Zeitleisten-Uhr mit UTC, wo die Aufnahme eine Referenzzeit hat | vorhanden |
| Mausposition als Breite/Länge, MGRS, Bullseye | Die Auswahlkarte (Klick auf einen Punkt) gibt Breite/Länge in Grad, Minuten und Sekunden sowie MGRS neben den Weltmetern; Bullseye je Einheit (Feld) | neu |
| Eigenes Logo | Nicht gebaut | entfällt (Branding) |
| 3D-Modelle, bei Unbekanntem das nächste | Eigener Figuren-Katalog, nächstes Gegenstück, wahre Größe | vorhanden |
| Mehrere Gefechte (Linien zwischen allen Paaren) | **Gefechtslinien**: von jeder Einheit im Bereich zu jedem Gegner innerhalb des eingestellten Umkreises (1–200 km), jeweils mit ihrer Entfernung, die nächsten 60 Paare; das gemessene Paar wie bisher | neu |

## Beschriftungen {#labels}

| Tacview | 3DHeat | Status |
|---|---|---|
| Beschriftungen ein/aus, getrennt für gewählte und nicht gewählte Objekte | **Beschriftungen** mit Regeln für **Gewählte**, **Luftfahrzeuge**, **Boden**, **Schiffe**, **Waffen** und **KI**: an oder aus, eigene Werte, Priorität | neu |
| Beschriftungsfelder: Name, Rufzeichen, Pilot, Geschwindigkeiten (TAS/CAS/IAS/Mach/GS), Höhen (ASL/AGL), VS, AOA, AOS, G (vertikal, seitlich, längs), Drehrate und Radius, Energie, Treibstoff Gewicht/Volumen/Fluss, Kurs/Spur, Roll/Nick, Herzfrequenz | Jeder Wert aus `fields.ts`: dieselbe Liste, dort berechnet, wo nichts aufgezeichnet ist (Schätzungen mit ~ markiert). Rollrate und SpO2 nur über Roh. | vorhanden |
| Position des Bullseye in den Beschriftungen | Feld **Bullseye (Peilung / Entfernung)** | neu |
| ILS-Abweichungen, zurückgelegte Strecke | Rohwerte; zurückgelegte Strecke in der Statistik | vorhanden (teilweise) |
| Nicht gewählte Telemetrie entzerren | **Beschriftungen auseinanderhalten**, nach der Priorität jeder Regel geordnet | vorhanden / neu |
| Alle Bodenobjekte beschriften / nur Bedrohungen | Die Regeln Boden und KI | neu |
| Größe der Beschriftungen | **Beschriftungsgröße** (60–250 %) | neu |
| Metrische / imperiale Einheiten | Metrisch / imperial | vorhanden (zwei Voreinstellungen, nicht acht) |

## Objektinfo und Telemetrie {#object-info-and-telemetry}

| Tacview | 3DHeat | Status |
|---|---|---|
| Primäre und sekundäre Auswahl | Klick folgt und wählt; Umschalt-Klick auf zwei misst; Auswahl **Ziel** | vorhanden / neu |
| Entfernung / Peilung / Aspekt / Annäherung zwischen zwei Objekten | BRAA-Linie des gemessenen Paares; Felder Entfernung, Peilung, Aspekt und Annäherung von der gefolgten Einheit | vorhanden |
| Relative Peilung, Sichtlinienrate | Felder **Relative Peilung** (von der Nase der gefolgten Einheit, L/R) und **Sichtlinienrate** (°/s) | neu |
| Telemetriefenster | Die Einheitenkarte und die Schwebekarte | vorhanden |
| Rohe Telemetrie (jede aufgezeichnete Eigenschaft, auch unbekannte) | **Roh** in der Einheitenkarte: jede Spalte in der Zeile der Einheit, wie geschrieben | neu |
| Liste aktiver Objekte | **Einheiten**: Spieler, KI, Waffen im Flug, lebende hell | vorhanden |
| Fenster mit den Aufnahmeeigenschaften (Titel, Autor, Briefing ...) | Als Spalte RecordingInfo behalten; in Roh angezeigt | vorhanden (kein Fenster) |
| Positionsformate DMS/MGRS, magnetischer Norden | **Position (Breite / Länge)** in DMS und Felder **MGRS**; ein Feld **Magnetischer Steuerkurs**; **Magnetische Kurse** schreibt Kurs, Spur und Peilung magnetisch (°M) und zeigt einen Kompass mit beiden Nordrichtungen und der Missweisung – das World Magnetic Model 2025 (Koeffizienten gemeinfrei), hier berechnet für den Ort und das Datum der Einheit | neu |

## Diagramme {#charts}

| Tacview | 3DHeat | Status |
|---|---|---|
| Diagramm eines Objekts, bis zu 4 Werte | **Über die Zeit** (und das Diagramm unter Replay) | vorhanden |
| Bis zu 4 Objekte gleichzeitig auftragen | **Vergleich**: ein Wert von bis zu 8 Einheiten auf einer Skala | neu |
| Wert gegen Wert (Stil Energie-Manövrierbarkeit) | **Wert gegen Wert**: Drehrate gegen Geschwindigkeit oder jedes andere Paar, jede Einheit eine Linie, ihr aktueller Punkt markiert | neu |
| X-Achse nach Zeit; zoomen; Zeit aus dem Diagramm ziehen | Mausrad zoomt in der Zeit, Doppelklick setzt zurück, Klick springt zum Moment | neu |
| X-Achse nach Luft- oder Bodenstrecke | **Zeit / Luftstrecke / Bodenstrecke** bei den Diagrammen Zeit und Vergleich; Zoomen und Klick-zum-Springen funktionieren gleich | neu |
| Vordefinierte Diagramme (Energie, Beschleunigung ...) | Jeder Wert kann gewählt werden (Energiehöhe und ihre Änderung sind Werte) | vorhanden |

## Statistik, Flugprotokoll, Ereignisse {#statistics-flight-log-events}

| Tacview | 3DHeat | Status |
|---|---|---|
| Flugprotokoll: abgehoben, gelandet, geschossen, getroffen von, zerstört von, Gebiet verlassen | **Statistik** je Einheit: Leben, Abschüsse, Tode, Schüsse, Treffer, Trefferquote, Starts, Landungen, Zeit in der Luft, maximales G (und minimales), Höchstgeschwindigkeit, Höhe und Mach, Strecke. Starts stammen aus den Ereignissen TakenOff/Landed, OnGround, AGL oder einer Schätzung mit ~. | neu |
| Erweiterungen für Wertung und Einsatzbericht | Zusammenfassung je Team und die meisten Abschüsse; die eigene Wertungstafel der Match-Zusammenfassung | neu / vorhanden |
| Flugprotokoll als XML/CSV exportieren | **CSV exportieren** der Statistik und der Ereignisse wie aufgelistet | neu (nur CSV) |
| Telemetrie als CSV in einer Rate exportieren | **Telemetrie der gewählten Einheit**: jeder Wert, 1–20 pro Sekunde | neu |
| Ereignisprotokoll, Doppelklick springt dorthin und wählt | Liste **Ereignisse**, gefiltert nach Art und Einheit; ein Klick fliegt dorthin | vorhanden |
| Vorheriges / nächstes Ereignis (Strg+←/→) | **Bild auf / Bild ab** | neu |
| Pause bei Ereignis | **Pause bei Ereignis** | neu |
| Marker auf der Zeitleiste (Freigaben, Treffer, Zerstörungen; das des gewählten Objekts blau; Lesezeichen rot) | Abschüsse und Tode als Dichteleiste, die der gefolgten Einheit blau, Lesezeichen rot; Klick springt | neu |
| Ein Ereignis entfernen, Abschuss entfernen | Nicht gebaut | entfällt (Ereignisse gehören zur Aufnahme; Filter blenden sie aus) |

## Lesezeichen {#bookmarks}

| Tacview | 3DHeat | Status |
|---|---|---|
| Lesezeichen mit Auswahl und Blickpunkt einfügen | **Lesezeichen hinzufügen** (B): der Moment, die freie Kamera oder die gefolgte Einheit mit ihrem Blick, Abstand und Ziel; benannt; in diesem Browser je Aufnahme gespeichert | neu |
| Lesezeichen entfernen | × in der Liste | neu |
| Lesezeichen auf der Zeitleiste und in den Protokollen | Rote Marken; die Liste | neu |
| Event=Bookmark in ACMI | Unter den Marken der Aufnahme aufgelistet, mit Abschüssen, Tod und Nachrichten | neu |
| Tastenkürzel Kopieren/Einfügen (eine Ansicht teilen) | **Lesezeichen exportieren / importieren** als Datei; C kopiert die Kamerapose | neu |

## Wiedergabe {#playback}

| Tacview | 3DHeat | Status |
|---|---|---|
| Abspielen/Pause, zum Anfang, Geschwindigkeit, Zeitleiste ziehen | Zeitleiste | vorhanden |
| Bild für Bild | **,** und **.** eine Sekunde zurück und vor (Umschalt: zehn) | neu |
| Rückwärts abspielen | **◀** auf der Zeitleiste, **J** (**L** vorwärts; dieselbe Taste erneut hält an): spielt vom Ende zum Anfang mit der gewählten Geschwindigkeit, wiederholt oder hält am Anfang an | neu |
| Dialog „Zu Zeit springen“ | Die Zeitleiste und die Ereignisliste | vorhanden |
| Zeitverschiebung eines Objekts (Geist) | **Zeitverschiebung und Zuschnitt**: den Flug einer Einheit oder eine ganze Aufnahme um so viele Sekunden verschieben; **Aufzeichnungen ausrichten** bringt mehrere Aufnahmen zum gemeinsamen Start und spielt sie gleichzeitig ab (zwei Einsätze an verschiedenen Tagen nebeneinander). Die Aufnahme wird neu aufgebaut, daher folgen Spuren, Ereignisse, Diagramme und Statistik | neu |
| Zuschnitt vor/nach | **Ab jetzt / Bis jetzt / Auf diesen Abschnitt zuschneiden** (Rückgängig behält die Verschiebungen), dann **CSV exportieren** (lädt zurück in 3DHeat) oder **ACMI exportieren** (Tacview-2.2-Text, für eine auf der Erde platzierte Aufnahme) | neu |

## Gelände und Karte {#terrain-and-map}

| Tacview | 3DHeat | Status |
|---|---|---|
| Echtes Gelände, eigene Höhen und Texturen | Levels (die eigene Karte des Spiels als 3D-Modell), Kacheln des Welt-Hintergrunds | vorhanden |
| Modi für flaches / leeres / kontrastreiches Gelände | [Level-Darstellung](level-appearance.md): Geländerelief, Oberfläche und Strukturen an oder aus | vorhanden (nicht dieselben Modi) |
| Taktische 2D-Karte (Tacview hat keine: Satellitenansicht) | **2D-Karte**: Ecke oder ganze Ansicht, Symbole nach Art und Team (gefüllt Spieler, umrandet KI), nach ihrem Kurs gedreht, Spuren, Namen, Maßstab, Entfernungsringe um die gefolgte Einheit, Bullseye-Ringe, der Platz der 3D-Kamera, kürzliche Tode; ziehen, Mausrad, Klick zum Folgen (M) | neu |
| Statische Objekte (Flughäfen, Landebahnen, Wegpunkte, Gebiete, KML) | Vermessene Landebahnen (OurAirports) im Welt-Hintergrund und ihre Gleitpfade; GPX-Wegpunkte und KML-Marken werden als stehende Objekte geladen; das [Taktik-Brett](tactics-board.md) zeichnet Gebiete und Routen | neu |

## Import, Export, Aufnahme {#import-export-recording}

| Tacview | 3DHeat | Status |
|---|---|---|
| ACMI-Text und Zip | [Tacview ACMI](tacview-acmi.md) | vorhanden |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS ... | **GPX** (Tracks, Routen, Wegpunkte; Herzfrequenz, Trittfrequenz, Leistung, Temperatur von Garmin), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC und GGA jedes Senders, Prüfsummen geprüft, über Mitternacht), **IGC** (B-Sätze, Datum, Pilot und Segelflugzeug), **FIT** (Record-Nachrichten, komprimierte Zeitstempel) – jede nach Breite und Länge auf der Ebene in der Mitte der Tracks platziert, damit der Welt-Hintergrund passt; Kurs, Neigung und Geschwindigkeit aus der Datei oder von Fix zu Fix. CSV und Parquet wie bisher | neu (DIS entfällt: ein Live-Netzwerkprotokoll) |
| Eigene Aufnahmegeräte (DCS, BMS, IL-2, MSFS ...) | Eigene Konverter von 3DHeat (War Thunder, CS2, Squad, Arma und andere) | vorhanden (eigene) |
| Echtzeit-Telemetrie über TCP, ADS-B | Nicht gebaut | entfällt (Wiedergabe nach dem Match) |
| Synchronisiertes Audio/Video | **Audio und Video**: eine lokale Datei spielt, pausiert, springt und ändert das Tempo mit der Zeitleiste ab einem festen Start (**Beginnt jetzt**, ±0,1 s); ein Video in einem veränderbaren Feld über der Ansicht oder als Bild-in-Bild. Die Datei bleibt im Browser | neu |
| Videoexport | [Kamerapfad und Video](camera-path-and-video.md) | vorhanden |

## Anderes {#other}

| Tacview | 3DHeat | Status |
|---|---|---|
| Lua-Erweiterungen | Nicht gebaut | entfällt (Open Source: den Viewer selbst ändern) |
| Online-Nachbesprechung (gemeinsame Sitzung) | Nicht gebaut | entfällt (Tacviews ist eine gehostete Sitzung, die alle an einem Abspielkopf hält. 3DHeat hat keinen Server, und Aufnahmen bleiben auf dem Rechner des Viewers; selbst eine Peer-to-peer-Verbindung braucht einen Signalserver. Eine Nachbesprechung wird als Dateien geteilt: die gekürzte Aufnahme (ACMI- oder CSV-Export) und die Lesezeichen-Datei, die an denselben Momenten und Ansichten öffnen) |
| Fernsteuerung durch einen Ausbilder | Nicht gebaut | entfällt (steuert einen laufenden Simulator) |
| Bearbeiten von Objekten (hinzufügen, ändern, entfernen) | [Taktik-Brett](tactics-board.md) für geplante Objekte; Aufnahmen sind nur lesbar | entfällt |
| Sprachen | 40 Sprachen | vorhanden |
| Echtheitsprüfung von Aufnahmen | Nicht gebaut | entfällt |

## Für Entwickler: ACMI-2.2-Eigenschaften {#for-developers-acmi-22-properties}

Gelesen von `data/acmi.ts`; Zahleneigenschaften werden zu Zahlenspalten, Textangaben zu Kategoriespalten. Alle werden unter **Roh** in der Einheitenkarte angezeigt. Diese werden zu einem Zweck gelesen:

| Eigenschaften | Verwendung |
|---|---|
| T (alle vier Formen), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Position, Lage, Figur, Name der Einheit, Team |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Felder, Diagramme, HUD, Erkennung von Start und Landung |
| VerticalGForce, LongitudinalGForce, LateralGForce | G-Felder |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Felder |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Treibstofffelder, über die Tanks summiert |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radarkegel und Entfernungstor |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Aufschaltlinien |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Wirkungskuppeln |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Felder |
| Health | Feld |
| Ereignisse: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Ereignisliste, Statistik (Tode, Starts, Landungen), Lesezeichen; Message und Comment als Untertitel |
| PilotHeadYaw, PilotHeadPitch | Blickrichtung des Piloten |
| Typ-Markierung Bullseye (Navaid+Static+Bullseye) | Feld Bullseye und Kartenringe |
| Alles andere (PilotHeadRoll, Steuerungen, Oberflächen, ILS-Abweichungen, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, Größen ...) | Wie geschrieben unter **Roh** angezeigt |

Radar- und Aufschaltwinkel werden gegen die eigenen Achsen der Einheit gemessen: Azimut nach rechts, Elevation nach oben, Roll mit dem rechten Flügel nach unten. Die ACMI-Spezifikation sagt, dass sie relativ zum Luftfahrzeug sind, aber nicht, welche Richtung positiv ist; diese Lesart folgt ihrer Transformation (Gierung im Uhrzeigersinn, Nick nach oben, Roll rechter Flügel nach unten).
