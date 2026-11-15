---
title: "Nahrávky Tacview (ACMI)"
parent: "Ako dostať dáta dnu"
nav_order: 7
lang: "sk"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---


# Nahrávky Tacview (ACMI)

Tacview je program, ktorý zaznamenáva lety v leteckých simulátoroch; jeho súbory končia na `.acmi`. 3DHeat ich otvára, aby ste videli, kam lietalo každé lietadlo.

Nahrávky letov z Tacview sa načítajú ako každá tabuľka: vyberte alebo pretiahnite `.acmi` (text, `.txt.acmi`, alebo zabalený, `.zip.acmi`) a stlačte **Načítať**. Potom dostanete teplo všetkých letov a na karte **Zápas** prehrávanie s figúrkami, stopami a zoznamom udalostí ([Prehrávanie zápasu](match-replay.md)). ACMI je verejný formát súborov Tacview ([dokumentácia](https://www.tacview.net/documentation/acmi/)); DCS (cez exportér Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS a ďalšie ho zapisujú, takže to číta ktorýkoľvek z nich.

## Čím sa nahrávka stane {#what-a-recording-becomes}

Jeden riadok vždy, keď sa zapíše pozícia objektu, jeden riadok na každú udalosť na mieste objektu a jeden riadok, keď objekt zmizne (`Removed`, kde bol naposledy). Udalosť o objekte, ktorý ešte nebol videný - záložka, správa pre všetkých - je riadok objektu `(recording)` v referenčnom bode. Nahrávka nesie vlastné pokyny na čítanie, takže krok mapovania sa vyplní sám. Čítač zapisuje tieto stĺpce: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, a potom ďalšie vlastnosti, ktoré nahrávka má. Ich úlohy:

| Stĺpec | Úloha | Význam |
|---|---|---|
| Time | čas | Sekundy po ReferenceTime nahrávky; Unixové sekundy, keď ju má, takže hodiny ukážu skutočný čas. |
| X, Y | pozícia | Východ a sever, metre, na rovine dotýkajúcej sa zeme v referenčnom bode nahrávky: vzdialenosti a smery sú pri ňom pravdivé, s odchýlkou pod tisícinu pri 100 km. Sever sa stáva svetovým -Z. |
| Altitude | pozícia (hore) | Metre. |
| Object | osoba | Pilot a názov objektu s jeho id, napr. `Viper 1 (F-16C_50) #a01`; bezpilotný objekt `(T-90A) #401`. |
| Coalition | tím | Strana (alebo farba, keď nie je koalícia). |
| Heading, Pitch | pohľad | Stupne; smer 0 je sever. |
| Recording | relácia | Title nahrávky, alebo názov súboru: viac nahrávok sa načíta vedľa seba bez spojenia ich stôp. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtre | Uchované na filtrovanie; Type a Name vyberú [figúrku](figures.md) každého objektu, Event napája zoznam udalostí rozboru, Roll nakláňa lietadlo. |
| U, V | | Vlastné ploché metre hry, keď ich má každá vzorka (DCS ich zapisuje). |
| EventObjects | filtre | Každý objekt, ktorý udalosť pomenuje (`Message|a01|b02|...`), podľa id. |
| RecordingInfo | | Vlastnosti nahrávky, ako boli v tom okamihu - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - ako JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtre | Akákoľvek ďalšia číselná vlastnosť, ktorú nahrávka nesie. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtre | Akákoľvek ďalšia textová vlastnosť, ktorú nahrávka nesie; vlastnosť s hodnotou, ktorá nie je číslo, je text. |

Všetky štyri tvary pozície z Tacview (`lon|lat|alt`, s `u|v`, s `roll|pitch|yaw`, a so všetkými a smerom) sa čítajú; prázdne polia si ponechajú poslednú hodnotu; `-id` odstráni objekt a id použité znova po ňom je nový objekt. Escapované čiarky a pokračujúce riadky sa spracujú.

Pozície sa vždy premietajú zo zemepisnej šírky a dĺžky, nikdy sa neberú z U/V, takže nahrávky zo všetkých hier zdieľajú jednu projekciu s pozadím skutočného sveta.
