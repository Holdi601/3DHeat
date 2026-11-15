---
title: "Tacview ieraksti (ACMI)"
parent: "Datu ievade"
nav_order: 7
lang: "lv"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Tacview ieraksti (ACMI)

Tacview ir programma, kas ieraksta lidojumus lidojumu simulatoros; tās faili beidzas ar `.acmi`. 3DHeat tos atver, lai jūs varētu redzēt, kur lidoja katrs lidaparāts.

Tacview lidojumu ieraksti ielādējas kā jebkura tabula: izvēlieties vai nometiet `.acmi` (teksts, `.txt.acmi` vai zipēts, `.zip.acmi`) un nospiediet **Ielādēt**. Tad jūs iegūstat visu lidojumu siltumu, un cilnē **Mačs** atkārtojumu ar figūrām, trajektorijām un notikumu sarakstu ([Spēles atkārtojums](match-replay.md)). ACMI ir Tacview publiskais failu formāts ([dokumentācija](https://www.tacview.net/documentation/acmi/)). DCS (caur Tacview eksportētāju), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS un citi to raksta, tātad šis lasītājs nolasa jebkuru no tiem.

## Ko kļūst par ierakstu {#what-a-recording-becomes}

Viena rinda katru reizi, kad tiek ierakstīta objekta pozīcija. Viena rinda katram notikumam objekta vietā. Viena rinda, kad objekts pazūd (`Removed`, kur tas bija pēdējoreiz). Notikums par objektu, kas vēl nav redzēts (atzīme, ziņa visiem), ir rinda objektam `(recording)` atsauces punktā. Ierakstā ir paša lasīšanas norādījumi, tāpēc kartēšanas solis aizpildās pats. Lasītājs raksta šīs kolonnas: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, un tad visas citas īpašības, kādas ierakstam ir. To lomas:

| Kolonna | Loma | Nozīme |
|---|---|---|
| Time | laiks | Sekundes pēc ieraksta ReferenceTime; Unix sekundes, ja tāda ir, lai pulkstenis rādītu īsto laiku. |
| X, Y | pozīcija | Austrumi un ziemeļi, metri, plaknē, kas pieskaras zemei ieraksta atsauces punktā: attālumi un virzieni ir pareizi tuvumā, novirzoties mazāk par tūkstošdaļu pie 100 km. Ziemeļi kļūst par pasaules -Z. |
| Altitude | pozīcija (augstums) | Metri. |
| Object | persona | Pilots un objekta nosaukums ar tā id, piem., `Viper 1 (F-16C_50) #a01`; objekts bez pilota `(T-90A) #401`. |
| Coalition | komanda | Puse (vai krāsa, ja koalīcijas nav). |
| Heading, Pitch | skatiens | Grādi; virziens 0 ir ziemeļi. |
| Recording | sesija | Ieraksta Title vai faila nosaukums: vairāki ieraksti ielādējas blakus, to trajektorijas nesaplūst. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtri | Saglabāti filtrēšanai. Type un Name izvēlas katra objekta [figūru](figures.md), Event baro atbriefinga notikumu sarakstu, Roll noliec lidaparātu. |
| U, V | | Spēles pašas plakanās pasaules metri, kad katram paraugam tie ir (DCS tos raksta). |
| EventObjects | filtri | Katrs objekts, ko nosauc notikums (`Message|a01|b02|...`), pēc id. |
| RecordingInfo | | Ieraksta pašas īpašības, kādas tās bija šajā brīdī (DataSource, DataRecorder, Author, Category, Briefing, Comments, ...) kā JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtri | Jebkura cita skaitliska īpašība, ko ieraksts satur. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtri | Jebkura cita teksta īpašība, ko ieraksts satur. Īpašība ar jebkuru vērtību, kas nav skaitlis, ir teksts. |

Visas četras Tacview pozīcijas formas (`lon|lat|alt`, ar `u|v`, ar `roll|pitch|yaw` un ar visām un virzienu) tiek nolasītas. Tukšie lauki saglabā pēdējo vērtību. `-id` noņem objektu, un id, kas izmantots atkārtoti pēc tam, ir jauns objekts. Izbēgušie komati un turpinātās rindas tiek apstrādātas.

Pozīcijas vienmēr tiek projicētas no platuma un garuma, nekad nenolasītas no U/V. Tāpēc ieraksti no katras spēles dala vienu projekciju ar reālas pasaules fonu.
