---
title: "Záznamy Tacview (ACMI)"
parent: "Jak nahrát data"
nav_order: 7
lang: "cs"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Záznamy Tacview (ACMI)

Tacview je program, který zaznamenává lety v leteckých simulátorech; jeho soubory končí na `.acmi`. 3DHeat je otevírá, abyste viděli, kam každé letadlo letělo.

Letové záznamy Tacview se načítají jako jakákoli tabulka: vyberte nebo přetáhněte `.acmi` (text, `.txt.acmi`, nebo zabalený, `.zip.acmi`) a stiskněte **Načíst**. Dostanete teplo všech letů a na kartě **Zápas** přehrávání s figurami, stopami a seznamem událostí ([Přehrávání zápasu](match-replay.md)). ACMI je veřejný formát souborů Tacview ([dokumentace](https://www.tacview.net/documentation/acmi/)); DCS (přes exportér Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS a další ho zapisují, takže to čte kterýkoli z nich.

## Z čeho se záznam stane {#what-a-recording-becomes}

Jeden řádek pokaždé, když se zapíše pozice objektu, jeden řádek na každou událost na místě objektu, a jeden řádek, když objekt zmizí (`Removed`, kde byl naposledy). Událost o objektu, který dosud nebyl vidět (záložka, zpráva všem), je řádek objektu `(recording)` v referenčním bodu. Záznam nese vlastní pokyny ke čtení, takže krok mapování se vyplní sám. Čtenář zapisuje tyto sloupce: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, a pak další vlastnosti, které záznam má. Jejich role:

| Sloupec | Role | Význam |
|---|---|---|
| Time | čas | Sekundy po ReferenceTime záznamu; Unixové sekundy, když ji má, takže hodiny ukazují skutečný čas. |
| X, Y | pozice | Východ a sever, metry, na rovině dotýkající se Země v referenčním bodu záznamu: vzdálenosti a směry jsou u něj správné, a na 100 km se odchylují o méně než promile. Sever se stane -Z světa. |
| Altitude | pozice (nahoru) | Metry. |
| Object | osoba | Pilot a název objektu s jeho id, např. `Viper 1 (F-16C_50) #a01`; objekt bez posádky `(T-90A) #401`. |
| Coalition | tým | Strana (nebo barva, když není koalice). |
| Heading, Pitch | pohled | Stupně; kurz 0 je sever. |
| Recording | relace | Title záznamu, nebo název souboru: několik záznamů se načte vedle sebe, aniž by se jejich stopy spojily. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtry | Ponechané pro filtrování; Type a Name vybírají [figuru](figures.md) každého objektu, Event krmí seznam událostí v debriefingu, Roll naklání letadlo. |
| U, V | | Ploché metry hry, je-li každý vzorek má (DCS je zapisuje). |
| EventObjects | filtry | Každý objekt, který událost jmenuje (`Message|a01|b02|...`), podle id. |
| RecordingInfo | | Vlastnosti záznamu tak, jak byly v tom okamžiku – DataSource, DataRecorder, Author, Category, Briefing, Comments, … – jako JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtry | Jakákoli jiná číselná vlastnost, kterou záznam nese. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtry | Jakákoli jiná textová vlastnost, kterou záznam nese; vlastnost s jakoukoli hodnotou, která není číslo, je text. |

Čtou se všechny čtyři tvary pozice Tacview (`lon|lat|alt`, s `u|v`, s `roll|pitch|yaw`, a se všemi a kurzem), prázdná pole si drží poslední hodnotu; `-id` objekt odstraní a id použité znovu po něm je nový objekt. Escapované čárky a pokračující řádky se zpracují.

Pozice se vždy promítají z šířky a délky, nikdy se nebírají z U/V, takže záznamy ze všech her sdílejí jednu projekci s podkladem skutečného světa.
