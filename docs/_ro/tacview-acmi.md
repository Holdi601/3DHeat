---
title: "Înregistrări Tacview (ACMI)"
parent: "Încărcarea datelor"
nav_order: 7
lang: "ro"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Înregistrări Tacview (ACMI)

Tacview este un program care înregistrează zborurile din simulatoarele de zbor; fișierele lui se termină în `.acmi`. 3DHeat le deschide ca să vezi unde a zburat fiecare aeronavă.

Înregistrările de zbor Tacview se încarcă ca orice tabel: alege sau trage un `.acmi` (text, `.txt.acmi`, sau arhivat, `.zip.acmi`) și apasă **Încarcă**. Primești apoi căldura tuturor zborurilor și, în fila **Meci**, o redare cu figuri, trasee și o listă de evenimente ([Redarea meciului](match-replay.md)). ACMI este formatul public de fișiere al Tacview ([documentație](https://www.tacview.net/documentation/acmi/)); DCS (prin exportatorul Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS și altele îl scriu, deci acesta citește oricare dintre ele.

## Ce devine o înregistrare {#what-a-recording-becomes}

Un rând de fiecare dată când se scrie poziția unui obiect, un rând pentru fiecare eveniment la locul obiectului și un rând când un obiect dispare (`Removed`, unde era ultima dată). Un eveniment despre un obiect încă nevăzut - un semn de carte, un mesaj către toți - este un rând al obiectului `(recording)` în punctul de referință. Înregistrarea își poartă propriile instrucțiuni de citire, deci pasul de mapare se completează singur. Cititorul scrie aceste coloane: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, apoi orice alte proprietăți pe care le are înregistrarea. Rolurile lor:

| Coloană | Rol | Înseamnă |
|---|---|---|
| Time | timp | Secunde după ReferenceTime al înregistrării; secunde Unix când are una, ca ceasul să arate ora reală. |
| X, Y | poziție | Est și nord, în metri, pe un plan atingând pământul în punctul de referință al înregistrării: distanțele și direcțiile sunt corecte în apropiere, derivând cu sub o parte la o mie la 100 km. Nordul devine -Z al lumii. |
| Altitude | poziție (sus) | Metri. |
| Object | persoană | Pilotul și numele obiectului cu id-ul lui, de exemplu `Viper 1 (F-16C_50) #a01`; un obiect fără pilot `(T-90A) #401`. |
| Coalition | echipă | Tabăra (sau culoarea, când nu există coaliție). |
| Heading, Pitch | privire | Grade; direcția 0 este nord. |
| Recording | sesiune | Titlul înregistrării sau numele fișierului: mai multe înregistrări se încarcă una lângă alta fără ca traseele lor să se unească. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtre | Păstrate pentru filtrare; Type și Name aleg [figura](figures.md) fiecărui obiect, Event alimentează lista de evenimente a debriefingului, Roll înclină aeronava. |
| U, V | | Metrii lumii plate proprii jocului, când fiecare eșantion le are (DCS le scrie). |
| EventObjects | filtre | Fiecare obiect pe care îl numește un eveniment (`Message|a01|b02|...`), după id. |
| RecordingInfo | | Proprietățile proprii ale înregistrării așa cum erau în acel moment - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - ca JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtre | Orice altă proprietate numerică pe care o are înregistrarea. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtre | Orice altă proprietate text pe care o are înregistrarea; o proprietate a cărei valoare nu este un număr este text. |

Toate cele patru forme ale poziției Tacview (`lon|lat|alt`, cu `u|v`, cu `roll|pitch|yaw`, și cu toate și cu o direcție) sunt citite; câmpurile goale păstrează ultima valoare; `-id` șterge un obiect, iar un id folosit din nou după aceea este un obiect nou. Virgulele escapate și liniile continuate sunt tratate.

Pozițiile sunt mereu proiectate din latitudine și longitudine, niciodată luate din U/V, așa că înregistrările din orice joc împart aceeași proiecție cu un fundal al lumii reale.
