---
title: "Tacview-inspelningar (ACMI)"
parent: "Läsa in data"
nav_order: 7
lang: "sv"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Tacview-inspelningar (ACMI)

Tacview är ett program som spelar in flygningar i flygsimulatorer. Dess filer slutar på `.acmi`. 3DHeat öppnar dem så att du kan se var varje flygplan flög.

Tacview-inspelningar läses in som vilken tabell som helst: välj eller släpp en `.acmi` (text, `.txt.acmi`, eller zippad, `.zip.acmi`) och tryck på **Läs in**. Du får då värmen från alla flygningar, och på fliken **Match** en uppspelning med figurer, spår och en händelselista ([Matchrepris](match-replay.md)). ACMI är Tacviews öppna filformat ([dokumentation](https://www.tacview.net/documentation/acmi/)). DCS (via Tacviews exportör), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS och andra skriver det, så den här läser vilken av dem som helst.

## Vad en inspelning blir {#what-a-recording-becomes}

En rad varje gång ett objekts position skrivs. En rad per händelse vid objektets plats. Och en rad när ett objekt lämnar (`Removed`, där det senast var). En händelse som inte hör till något objekt som setts ännu, som ett bokmärke eller ett meddelande till alla, blir en rad för objektet `(recording)` vid referenspunkten. Inspelningen bär sina egna läsanvisningar, så kartläggningssteget fyller i sig självt. Läsaren skriver dessa kolumner: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, och sedan eventuella andra egenskaper som inspelningen har. Deras roller:

| Kolumn | Roll | Betydelse |
|---|---|---|
| Time | tid | Sekunder efter inspelningens ReferenceTime. Unix-sekunder när den har en, så att klockan visar riktig tid. |
| X, Y | position | Öst och norr, i meter, på ett plan som tangerar jorden vid inspelningens referenspunkt. Avstånd och bäringar är sanna nära den och avviker med under en tusendel vid 100 km. Norr blir världens -Z. |
| Altitude | position (upp) | Meter. |
| Object | person | Piloten och objektets namn med dess id, till exempel `Viper 1 (F-16C_50) #a01`. Ett obemannat objekt får till exempel `(T-90A) #401`. |
| Coalition | lag | Sidan (eller färgen, när det inte finns någon koalition). |
| Heading, Pitch | blick | Grader. Kurs 0 är norr. |
| Recording | session | Inspelningens Title, eller filnamnet. Flera inspelningar läses in sida vid sida utan att deras spår förenas. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filter | Behålls för filtrering. Type och Name väljer varje objekts [figur](figures.md), Event matar debriefens händelselista, och Roll lutar flygplanet. |
| U, V | | Spelets egna platta världsmeter, när varje prov har dem. DCS skriver dem. |
| EventObjects | filter | Varje objekt som en händelse nämner (`Message|a01|b02|...`), med id. |
| RecordingInfo | | Inspelningens egna egenskaper så som de var vid det ögonblicket (DataSource, DataRecorder, Author, Category, Briefing, Comments, ...), som JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filter | Andra numeriska egenskaper som inspelningen bär. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filter | Andra textegenskaper som inspelningen bär. En egenskap vars värde inte är ett tal är text. |

Alla fyra formerna av Tacviews position (`lon|lat|alt`, med `u|v`, med `roll|pitch|yaw`, och med alla dem plus en kurs) läses. Tomma fält behåller det senaste värdet. `-id` tar bort ett objekt, och ett id som används igen efter det är ett nytt objekt. Escapade kommatecken och fortsatta rader hanteras.

Positionerna projiceras alltid från latitud och longitud, aldrig från U/V. Därför delar inspelningar från alla spel en projektion, med en bakgrund av den verkliga världen.
