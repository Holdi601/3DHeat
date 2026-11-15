---
title: "Tacview-optagelser (ACMI)"
parent: "Indlæs data"
nav_order: 7
lang: "da"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Tacview-optagelser (ACMI)

Tacview er et program, der optager flyvninger i flysimulatorer. Dets filer ender på `.acmi`. 3DHeat åbner dem, så du kan se, hvor hvert fly fløj.

Tacviews flyvningsoptagelser indlæses som enhver anden tabel. Vælg eller træk en `.acmi` (tekst, `.txt.acmi`, eller zippet, `.zip.acmi`), og tryk på **Indlæs**. Du får så varmen fra alle flyvninger, og i fanen **Kamp** et replay med figurer, spor og en hændelsesliste ([Kamp-replay](match-replay.md)). ACMI er Tacviews offentlige filformat ([dokumentation](https://www.tacview.net/documentation/acmi/)). DCS (gennem Tacviews eksportør), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS og andre skriver det, så det læser alle disse.

## Hvad en optagelse bliver til {#what-a-recording-becomes}

Der er en række, hver gang et objekts position skrives, en række pr. hændelse ved objektets sted og en række, når et objekt forlades (`Removed`, hvor det sidst var). En hændelse om et objekt, der endnu ikke er set (et bogmærke, en besked til alle), er en række for objektet `(recording)` i referencepunktet. Optagelsen bærer sin egen læsevejledning, så kortlægningstrinnet udfylder sig selv. Læseren skriver disse kolonner: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo` og derefter alle andre egenskaber, optagelsen har. Deres roller:

| Kolonne | Rolle | Betydning |
|---|---|---|
| Time | tid | Sekunder efter optagelsens ReferenceTime. Unix-sekunder, når den har en, så uret viser den rigtige tid. |
| X, Y | position | Øst og nord, i meter, på et plan, der rører jorden i optagelsens referencepunkt. Afstande og pejlinger er rigtige i nærheden og driver under en tusindedel ved 100 km. Nord bliver verdens -Z. |
| Altitude | position (op) | Meter. |
| Object | person | Piloten og objektets navn med dets id, fx `Viper 1 (F-16C_50) #a01`. Et ubemandet objekt får fx `(T-90A) #401`. |
| Coalition | hold | Siden (eller farven, når der ikke er nogen koalition). |
| Heading, Pitch | blik | Grader. Kurs 0 er nord. |
| Recording | session | Optagelsens Title, eller filnavnet. Flere optagelser indlæses side om side, uden at deres spor hænger sammen. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtre | Gemmes til filtrering. Type og Name vælger hvert objekts [figur](figures.md). Event går til debriefens hændelsesliste, og Roll hælder flyet. |
| U, V | | Spillets egne flade verdensmeter, når alle prøver har dem (DCS skriver dem). |
| EventObjects | filtre | Hvert objekt en hændelse nævner (`Message|a01|b02|...`), efter id. |
| RecordingInfo | | Optagelsens egne egenskaber, som de var på det tidspunkt: DataSource, DataRecorder, Author, Category, Briefing, Comments og så videre, som JSON. |
| IAS, Mach, AOA, FuelWeight og så videre | filtre | Enhver anden numerisk egenskab, optagelsen har. |
| Parent, CallSign, LockedTarget, Label, Shape og så videre | filtre | Enhver anden tekstegenskab, optagelsen har. En egenskab med en værdi, der ikke er et tal, er tekst. |

Alle fire former for Tacviews position (`lon|lat|alt`, med `u|v`, med `roll|pitch|yaw`, og med alle disse og en kurs) læses. Tomme felter beholder den sidste værdi. `-id` fjerner et objekt, og et id, der bruges igen efter det, er et nyt objekt. Escapede kommaer og fortsatte linjer håndteres.

Positionerne projiceres altid ud fra breddegrad og længdegrad og aldrig fra U/V. Optagelser fra alle spil deler derfor én projektion med en baggrund af den rigtige verden.
