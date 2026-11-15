---
title: "Regjistrimet Tacview (ACMI)"
parent: "Si të futni të dhënat"
nav_order: 7
lang: "sq"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Regjistrimet Tacview (ACMI)

Tacview është një program që regjistron fluturimet në simulatorët e fluturimit; skedarët e tij mbarojnë me `.acmi`. 3DHeat i hap, që të shohësh ku fluturoi çdo avion.

Regjistrimet e fluturimeve të Tacview ngarkohen si çdo tabelë: zgjidh ose lësho një `.acmi` (tekst, `.txt.acmi`, ose i zipuar, `.zip.acmi`) dhe shtyp **Ngarko**. Pastaj merr nxehtësinë e të gjitha fluturimeve, dhe në skedën **Ndeshja** një riprodhim me figura, gjurmë dhe listë ngjarjesh ([Riprodhimi i ndeshjes](match-replay.md)). ACMI është formati publik i skedarëve të Tacview ([dokumentimi](https://www.tacview.net/documentation/acmi/)); DCS (përmes eksportuesit të Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS dhe të tjerë e shkruajnë, kështu që kjo lexon çdonjërin prej tyre.

## Çfarë bëhet një regjistrim {#what-a-recording-becomes}

Një rresht për çdo herë që shkruhet pozicioni i një objekti, një rresht për çdo ngjarje te vendi i objektit, dhe një rresht kur një objekt largohet (`Removed`, aty ku ishte për herë të fundit). Një ngjarje për një objekt që nuk është parë ende - një shenjë, një mesazh për të gjithë - është një rresht i objektit `(recording)` te pika e referencës. Regjistrimi mbart vetë udhëzimet e veta të leximit, kështu që hapi i përshtatjes plotësohet vetë. Lexuesi shkruan këto kolona: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, pastaj çdo veti tjetër që ka regjistrimi. Rolet e tyre:

| Kolona | Roli | Kuptimi |
|---|---|---|
| Time | koha | Sekonda pas ReferenceTime të regjistrimit; sekonda Unix kur ka një të tillë, që ora të tregojë kohën reale. |
| X, Y | pozicioni | Lindje dhe veri, metra, në një plan që prek tokën te pika e referencës së regjistrimit: distancat dhe drejtimet janë të sakta afër saj, dhe shmangen nën një të mijtën në 100 km. Veriu bëhet -Z e botës. |
| Altitude | pozicioni (lart) | Metra. |
| Object | personi | Piloti dhe emri i objektit me ID-në e tij, p.sh. `Viper 1 (F-16C_50) #a01`; një objekt pa pilot `(T-90A) #401`. |
| Coalition | ekipi | Krahu (ose ngjyra, kur nuk ka koalicion). |
| Heading, Pitch | shikimi | Gradë; drejtimi 0 është veri. |
| Recording | seanca | Titulli i regjistrimit, ose emri i skedarit: disa regjistrime ngarkohen krah për krah pa i bashkuar gjurmët. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtrat | Mbahen për filtrim; Type dhe Name zgjedhin [figurën](figures.md) e çdo objekti, Event ushqen listën e ngjarjeve të debrifingut, Roll e anon avionin. |
| U, V | | Metrat e botës së sheshtë të vetë lojës, kur çdo mostër i ka ato (DCS i shkruan). |
| EventObjects | filtrat | Çdo objekt që e emëron një ngjarje (`Message|a01|b02|...`), sipas ID-së. |
| RecordingInfo | | Vetitë e vetë regjistrimit ashtu siç ishin në atë moment - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - si JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtrat | Çdo veti tjetër numerike që mban regjistrimi. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtrat | Çdo veti tjetër tekstuale që mban regjistrimi; një veti me çdo vlerë që nuk është numër është tekst. |

Të katër format e pozicionit të Tacview (`lon|lat|alt`, me `u|v`, me `roll|pitch|yaw`, dhe me të gjitha dhe një drejtim) lexohen; fushat boshe mbajnë vlerën e fundit; `-id` heq një objekt, dhe një ID e përdorur sërish pasi është hequr është objekt i ri. Presjet e shpëtuara dhe rreshtat e vazhduar trajtohen.

Pozicionet projektohen gjithmonë nga gjerësia dhe gjatësia gjeografike, kurrë nuk merren nga U/V, kështu që regjistrimet nga çdo lojë ndajnë një projeksion të vetëm me një sfond të botës reale.
