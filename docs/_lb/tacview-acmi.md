---
title: "Tacview-Opnamen (ACMI)"
parent: "Daten astellen"
nav_order: 7
lang: "lb"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---


# Tacview-Opnamen (ACMI)

Tacview ass e Programm, dat Flich an Fluchsimulatoren opholt; hir Dateien enden op `.acmi`. 3DHeat mécht se op, sou datt Dir gesitt, wou all Fliger gefloen ass.

Tacview-Flichopname lueden wéi all Tabell: wielt eng `.acmi` (Text, `.txt.acmi`, oder gezippt, `.zip.acmi`) aus oder zitt se eran, an dréckt **Lueden**. Dann kritt Dir d'Heat vun all Flich, an am Tab **Match** en Replay mat Figuren, Spuere a enger Eventlëscht ([Match-Replay](match-replay.md)). ACMI ass Tacview sengt ëffentlecht Dateiform ([Dokumentatioun](https://www.tacview.net/documentation/acmi/)); DCS (iwwer dem Exporter vu Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS an anerer schreiwen se, dofir liest dëst all dovun.

## Wat eng Opnam gëtt {#what-a-recording-becomes}

Eng Zeil all Kéier wann d'Positioun vun engem Objet geschriwwe gëtt, eng Zeil pro Event um Plaz vum Objet, a eng Zeil, wann e Objet fortgeet (`Removed`, wou en zulescht war). E Event ouni Objet, dat ee nach net gesinn huet - en Lesezeechen, eng Noriicht u jiddereen - ass eng Zeil vum Objet `(recording)` am Referenzpunkt. D'Opnam huet hir eege Liesanweisungen, dofir fëllt de Mapping-Schrëtt sech selwer aus. De Lieser schreift dës Kolonnen: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, a derno all weider Eegenschaften, déi d'Opnam huet. Hir Rollen:

| Kolonn | Roll | Bedeitung |
|---|---|---|
| Time | Zäit | Sekonnen nom ReferenceTime vun der Opnam; Unix-Sekonnen, wann eng do ass, sou datt d'Auer déi richteg Zäit weist. |
| X, Y | Positioun | Ost a Nord, Meter, op enger Fläch, déi d'Äerd am Referenzpunkt vun der Opnam berréiert: Distanzen a Peilungen stëmmen dobäi, a wäit ewech siicht se um manner wéi een Tausendstel pro 100 km. Nord gëtt de -Z vun der Welt. |
| Altitude | Positioun (uewen) | Meter. |
| Object | Persoun | De Pilot an de Numm vum Objet mat senger ID, z. B. `Viper 1 (F-16C_50) #a01`; e Objet ouni Pilot `(T-90A) #401`. |
| Coalition | Team | D'Säit (oder d'Faarf, wann et keng Koalitioun gëtt). |
| Heading, Pitch | Siicht | Grad; Heading 0 ass Nord. |
| Recording | Sitzung | Den Titel vun der Opnam oder den Dateinumm: e puer Opname lueden nieft-nieneen, ouni datt hir Spuere zesummekommen. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | Filter | Fir d'Filtere behalen; Type an Name wielen d'[Figur](figures.md) vun all Objet, Event gëtt d'Eventlëscht vum Debrief, Roll kippt d'Fligerei. |
| U, V | | D'flaach Welt-Meter vum Spiel, wann all Probe se huet (DCS schreift se). |
| EventObjects | Filter | All Objeten, déi e Event nennt (`Message|a01|b02|...`), iwwer d'ID. |
| RecordingInfo | | D'eegen Eegenschaften vun der Opnam, wéi se an dem Moment waren - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - als JSON. |
| IAS, Mach, AOA, FuelWeight, ... | Filter | All aner numeresch Eegenschaft, déi d'Opnam huet. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | Filter | All aner Text-Eegenschaften, déi d'Opnam huet; eng Eegenschaft, deenen hire Wäert keng Zuel ass, ass Text. |

All véier Formen vun der Positioun bei Tacview ginn gelies (`lon|lat|alt`, mat `u|v`, mat `roll|pitch|yaw`, a mat alle deenen an enger Heading), a leer Felder behalen de leschten Wäert. `-id` läscht e Objet, an eng ID, déi nach eng Kéier benotzt gëtt, ass en neit Objet. Escaped Kommaen an weidergefouert Zeilen ginn och verschafft.

D'Positiounen ginn ëmmer aus Breet- a Längegrad projizéiert, ni aus U/V geholl; dofir deelen sech d'Opnamen all Spiller eng Projektioun mat engem Hannergrond vun der richteger Welt.
