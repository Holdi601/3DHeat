---
title: "Tacview salvestised (ACMI)"
parent: "Andmete sisselugemine"
nav_order: 7
lang: "et"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Tacview salvestised (ACMI)

Tacview on programm, mis salvestab lende lennusimulaatorites. Selle failid lõpevad `.acmi`-ga. 3DHeat avab need, et sa näeksid, kus iga lennuk lendas.

Tacview lennusalvestised laaditakse nagu iga tabel: vali või lohista `.acmi` (tekst, `.txt.acmi` või zipitud, `.zip.acmi`) ja vajuta **Laadi**. Saad siis kõigi lendude soojuse ning vahekaardil **Matš** kordusvaate koos kujude, radade ja sündmuste loendiga ([Matši kordus](match-replay.md)). ACMI on Tacview avalik failivorming ([dokumentatsioon](https://www.tacview.net/documentation/acmi/)). DCS (Tacview eksportija kaudu), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS ja teised kirjutavad seda, seega loetakse neist igaüht.

## Mis saab salvestisest {#what-a-recording-becomes}

Üks rida iga kord, kui objekti asukoht kirjutatakse. Üks rida iga sündmuse kohta objekti asukohas. Üks rida, kui objekt lahkub (`Removed`, kus ta viimati oli). Sündmus objektist, mida pole veel nähtud, näiteks järjehoidja või sõnum kõigile, on rida objektiga `(recording)` vastuspunktis. Salvestisel on oma lugemisjuhised, nii et kaardistamise samm täidab end ise. Lugeja kirjutab need veerud: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, ning seejärel kõik muud salvestise omadused. Nende rollid:

| Veerg | Roll | Tähendus |
|---|---|---|
| Time | aeg | Sekundid pärast salvestise ReferenceTime'i; Unixi sekundid, kui see on olemas, nii et kell näitab päris aega. |
| X, Y | asukoht | Ida ja põhi meetrites tasapinnal, mis puudutab maakera salvestise vastuspunktis: kaugused ja suunad on selle lähedal õiged, kuid 100 km juures triivivad alla tuhandiku. Põhi muutub maailma -Z-ks. |
| Altitude | asukoht (üles) | Meetrites. |
| Object | isik | Piloot ja objekti nimi koos ID-ga, näiteks `Viper 1 (F-16C_50) #a01`; juhita objekt `(T-90A) #401`. |
| Coalition | meeskond | Pool (või värv, kui koalitsiooni pole). |
| Heading, Pitch | vaade | Kraadides; suund 0 on põhi. |
| Recording | seanss | Salvestise Title või failinimi: mitu salvestist laaditakse kõrvuti, ilma et nende rajad ühineksid. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtrid | Alles hoitud filtreerimiseks. Type ja Name valivad iga objekti [kuju](figures.md), Event toidab ülevaate sündmuste loendit ja Roll kallutab lennuki. |
| U, V | | Mängu enda tasase maailma meetrid, kui igal proovil need on (DCS kirjutab need). |
| EventObjects | filtrid | Iga objekt, mida sündmus nimetab (`Message|a01|b02|...`), ID järgi. |
| RecordingInfo | | Salvestise enda omadused sellel hetkel, nagu need olid (DataSource, DataRecorder, Author, Category, Briefing, Comments, ...), JSON-ina. |
| IAS, Mach, AOA, FuelWeight, ... | filtrid | Mis tahes muu arvuline omadus, mida salvestis kannab. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtrid | Mis tahes muu tekstiline omadus, mida salvestis kannab. Omadus, mille väärtus pole arv, on tekst. |

Tacview asukoha kõik neli vormi (`lon|lat|alt`, `u|v`-ga, `roll|pitch|yaw`-ga ja kõigi nendega koos suunaga) loetakse. Tühjad väljad jätavad viimase väärtuse. `-id` eemaldab objekti, ja ID, mida kasutatakse pärast seda uuesti, on uus objekt. Märgitud komad ja jätkuvad read on käsitletud.

Asukohad projitseeritakse alati laiuskraadist ja pikkuskraadist, mitte U/V-st. Nii jagavad kõigi mängude salvestised ühte projektsiooni koos päris maailma taustaga.
