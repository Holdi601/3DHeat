---
title: "Tacview-opnamen (ACMI)"
parent: "Gegevens binnenhalen"
nav_order: 7
lang: "nl"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Tacview-opnamen (ACMI)

Tacview is een programma dat vluchten in vluchtsimulators opneemt; de bestanden eindigen op `.acmi`. 3DHeat opent ze zodat je kunt zien waar elk vliegtuig heeft gevlogen.

Tacview-vluchtopnamen laden net als elke tabel: kies of sleep een `.acmi` (tekst, `.txt.acmi`, of gezipt, `.zip.acmi`) en druk op **Laden**. Je krijgt dan de warmte van alle vluchten, en op het tabblad **Match** een replay met figuren, sporen en een gebeurtenissenlijst ([Wedstrijdreplay](match-replay.md)). ACMI is het openbare bestandsformaat van Tacview ([documentatie](https://www.tacview.net/documentation/acmi/)); DCS (via de exporter van Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS en andere schrijven het, dus dit leest elk ervan.

## Wat een opname wordt {#what-a-recording-becomes}

Eén rij elke keer dat de positie van een object wordt geschreven, één rij per gebeurtenis op de plek van het object, en één rij wanneer een object verdwijnt (`Removed`, waar het voor het laatst was). Een gebeurtenis over een object dat nog niet is gezien - een bladwijzer, een bericht aan iedereen - is een rij van het object `(recording)` op het referentiepunt. De opname bevat zijn eigen leesinstructies, dus de koppelstap vult zichzelf in. De lezer schrijft deze kolommen: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, en daarna alle verdere eigenschappen die de opname heeft. Hun rollen:

| Kolom | Rol | Betekenis |
|---|---|---|
| Time | tijd | Seconden na de ReferenceTime van de opname; Unix-seconden als die er een heeft, zodat de klok de echte tijd toont. |
| X, Y | positie | Oost en noord, in meters, op een vlak dat de aarde raakt in het referentiepunt van de opname: afstanden en peilingen zijn er juist, en wijken op 100 km minder dan een duizendste af. Noord wordt de -Z van de wereld. |
| Altitude | positie (omhoog) | Meters. |
| Object | persoon | De piloot en de naam van het object met zijn id, bijvoorbeeld `Viper 1 (F-16C_50) #a01`; een onbemand object `(T-90A) #401`. |
| Coalition | team | De partij (of de kleur, als er geen coalitie is). |
| Heading, Pitch | kijkrichting | Graden; koers 0 is noord. |
| Recording | sessie | De Title van de opname, of de bestandsnaam: meerdere opnamen laden naast elkaar zonder dat hun sporen aan elkaar vastzitten. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filters | Bewaard voor filteren; Type en Name kiezen de [figuur](figures.md) van elk object, Event voedt de gebeurtenissenlijst van de nabespreking, Roll laat het vliegtuig kantelen. |
| U, V | | De eigen platte-wereldmeters van het spel, wanneer elk monster ze heeft (DCS schrijft ze). |
| EventObjects | filters | Elk object dat een gebeurtenis noemt (`Message|a01|b02|...`), op id. |
| RecordingInfo | | De eigen eigenschappen van de opname zoals ze op dat moment stonden - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - als JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filters | Elke andere numerieke eigenschap die de opname heeft. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filters | Elke andere teksteigenschap die de opname heeft; een eigenschap met een waarde die geen getal is, is tekst. |

Alle vier vormen van de positie van Tacview (`lon|lat|alt`, met `u|v`, met `roll|pitch|yaw`, en met alles plus een koers) worden gelezen; lege velden houden de laatste waarde. `-id` verwijdert een object, en een id dat daarna weer wordt gebruikt, is een nieuw object. Ge-escapete komma's en doorlopende regels worden verwerkt.

De posities worden altijd geprojecteerd vanuit breedte- en lengtegraad, nooit uit U/V, zodat opnamen van elk spel één projectie delen met een achtergrond van de echte wereld.
