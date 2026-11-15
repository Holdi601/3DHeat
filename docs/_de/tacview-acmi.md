---
title: "Tacview-Aufnahmen (ACMI)"
parent: "Daten laden"
nav_order: 7
lang: "de"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Tacview-Aufzeichnungen (ACMI)

Tacview ist ein Programm, das Flüge in Flugsimulatoren aufzeichnet. Seine Dateien enden auf `.acmi`. 3DHeat öffnet sie, damit du siehst, wohin jedes Flugzeug geflogen ist.

Tacview-Flugaufzeichnungen laden wie jede Tabelle: Wähle eine `.acmi` aus oder ziehe sie hinein (Text, `.txt.acmi` oder gepackt, `.zip.acmi`) und drücke **Laden**. Du bekommst dann die Intensität aller Flüge. Im Tab **Match** gibt es eine Wiedergabe mit Figuren, Spuren und einer Ereignisliste ([Match-Wiedergabe](match-replay.md)). ACMI ist das öffentliche Dateiformat von Tacview ([Dokumentation](https://www.tacview.net/documentation/acmi/)). DCS (über den Exporter von Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS und andere schreiben es. Deshalb liest der Viewer alle davon.

## Was eine Aufzeichnung wird {#what-a-recording-becomes}

Eine Zeile jedes Mal, wenn die Position eines Objekts geschrieben wird. Eine Zeile je Ereignis am Ort des Objekts. Und eine Zeile, wenn ein Objekt verschwindet (`Removed`, dort, wo es zuletzt war). Ein Ereignis ohne ein bisher gesehenes Objekt, etwa eine Markierung oder eine Nachricht an alle, ist eine Zeile des Objekts `(recording)` am Bezugspunkt. Die Aufzeichnung bringt ihre eigene Leseanleitung mit, daher füllt sich der Zuordnungsschritt selbst aus. Der Leser schreibt diese Spalten: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo` und dann alle weiteren Eigenschaften der Aufzeichnung. Ihre Rollen:

| Spalte | Rolle | Bedeutung |
|---|---|---|
| Time | Zeit | Sekunden nach der ReferenceTime der Aufzeichnung; Unix-Sekunden, wenn sie eine hat, damit die Uhr die echte Zeit zeigt. |
| X, Y | Position | Ost und Nord, in Metern, auf einer Ebene, die die Erde am Bezugspunkt der Aufzeichnung berührt. Entfernungen und Peilungen stimmen in der Nähe, sie weichen auf 100 km um weniger als einen Teil auf tausend ab. Nord wird zum -Z der Welt. |
| Altitude | Position (oben) | Meter. |
| Object | Person | Der Pilot und der Name des Objekts mit seiner ID, zum Beispiel `Viper 1 (F-16C_50) #a01`; ein unbemanntes Objekt `(T-90A) #401`. |
| Coalition | Team | Die Seite (oder die Farbe, wenn es keine Koalition gibt). |
| Heading, Pitch | Blick | Grad; Kurs 0 ist Nord. |
| Recording | Sitzung | Der Titel der Aufzeichnung oder der Dateiname: Mehrere Aufzeichnungen laden nebeneinander, ohne dass ihre Spuren zusammenhängen. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | Filter | Für das Filtern aufbewahrt. Type und Name wählen die [Figur](figures.md) jedes Objekts, Event speist die Ereignisliste der Nachbesprechung, Roll lässt das Flugzeug kippen. |
| U, V | | Die flachen Weltmeter des Spiels, wenn jede Probe sie hat (DCS schreibt sie). |
| EventObjects | Filter | Jedes Objekt, das ein Ereignis nennt (`Message|a01|b02|...`), über seine ID. |
| RecordingInfo | | Die eigenen Eigenschaften der Aufzeichnung, wie sie in diesem Moment waren: DataSource, DataRecorder, Author, Category, Briefing, Comments, ... als JSON. |
| IAS, Mach, AOA, FuelWeight, ... | Filter | Jede andere numerische Eigenschaft der Aufzeichnung. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | Filter | Jede andere Textreigenschaft der Aufzeichnung. Eine Eigenschaft mit einem Wert, der keine Zahl ist, ist Text. |

Alle vier Formen der Position von Tacview werden gelesen (`lon|lat|alt`, mit `u|v`, mit `roll|pitch|yaw` und mit allen dreien plus Kurs). Leere Felder behalten den letzten Wert. `-id` entfernt ein Objekt, und eine ID, die danach erneut vorkommt, ist ein neues Objekt. Maskierte Kommas und fortgesetzte Zeilen werden verarbeitet.

Die Positionen werden immer aus Breiten- und Längengrad projiziert, nie aus U/V. So teilen sich Aufzeichnungen aller Spiele eine Projektion mit einem Hintergrund der echten Welt.
