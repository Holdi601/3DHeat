---
title: "Tacview-opptak (ACMI)"
parent: "Få inn data"
nav_order: 7
lang: "no"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Tacview-opptak (ACMI)

Tacview er et program som tar opp flyvninger i flysimulatorer; filene slutter på `.acmi`. 3DHeat åpner dem slik at du kan se hvor hvert fly fløy.

Tacviews flyopptak lastes som en hvilken som helst tabell: velg eller slipp en `.acmi` (tekst, `.txt.acmi`, eller zippet, `.zip.acmi`) og trykk **Last inn**. Du får da varmen fra alle flyvningene, og i fanen **Kamp** en avspilling med figurer, spor og en hendelsesliste ([Kampreplay](match-replay.md)). ACMI er Tacviews offentlige filformat ([dokumentasjon](https://www.tacview.net/documentation/acmi/)). DCS (gjennom Tacviews eksportør), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS og andre skriver det, så dette leser alle dem.

## Hva et opptak blir {#what-a-recording-becomes}

Én rad hver gang et objekts posisjon skrives, én rad per hendelse på objektets sted, og én rad når et objekt forlater (`Removed`, der det sist var). En hendelse om et objekt som ikke er sett ennå (en bokmerke, en melding til alle) er en rad for objektet `(recording)` i referansepunktet. Opptaket bærer sine egne leseinstruksjoner, så kartleggingstrinnet fylles ut selv. Leseren skriver disse kolonnene: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, og deretter alle andre egenskaper opptaket har. Deres roller:

| Kolonne | Rolle | Betydning |
|---|---|---|
| Time | tid | Sekunder etter opptakets ReferenceTime; Unix-sekunder når det har en, så klokken viser riktig tid. |
| X, Y | posisjon | Øst og nord, meter, på et plan som tangerer jorden i opptakets referansepunkt: avstander og peilinger er riktige nær det, og driver under én tusendel ved 100 km. Nord blir verdens -Z. |
| Altitude | posisjon (opp) | Meter. |
| Object | person | Piloten og objektets navn med id, f.eks. `Viper 1 (F-16C_50) #a01`; et ubemannet objekt `(T-90A) #401`. |
| Coalition | lag | Siden (eller fargen, når det ikke finnes noen koalisjon). |
| Heading, Pitch | blikk | Grader; kurs 0 er nord. |
| Recording | økt | Opptakets Title, eller filnavnet: flere opptak lastes side om side uten at sporene går sammen. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtre | Beholdt for filtrering; Type og Name velger hvert objekts [figur](figures.md), Event mater hendelseslisten i etterbehandlingen, Roll krenger flyet. |
| U, V | | Spillets egne flate verdensmeter, når alle prøver har dem (DCS skriver dem). |
| EventObjects | filtre | Alle objekter en hendelse nevner (`Message|a01|b02|...`), etter id. |
| RecordingInfo | | Opptakets egne egenskaper slik de sto på det øyeblikket - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - som JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtre | Enhver annen numerisk egenskap opptaket har. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtre | Enhver annen tekstegenskap opptaket har; en egenskap med en verdi som ikke er et tall, er tekst. |

Alle fire formene for Tacviews posisjon (`lon|lat|alt`, med `u|v`, med `roll|pitch|yaw`, og med alle disse og en kurs) leses, og tomme felt beholder den siste verdien. `-id` fjerner et objekt, og en id som brukes igjen etter det, er et nytt objekt. Escapede komma og fortsatte linjer håndteres.

Posisjonene projiseres alltid fra breddegrad og lengdegrad, aldri hentet fra U/V. Dermed deler opptak fra alle spill én projeksjon, med en bakgrunn av den virkelige verden.
