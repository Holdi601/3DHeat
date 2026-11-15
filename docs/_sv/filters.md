---
title: "Filter"
parent: "Filter och verktyg"
nav_order: 1
lang: "sv"
source: "filters.md"
source_hash: "e957bf788bda"
translated: true
outdated: false
---

# Filter

**Filter** döljer de rader du inte bryr dig om, till exempel en fordonsklass eller en händelsetyp, och bilden uppdateras på en gång. Panelen listar kolumnerna som behållits vid inläsningen under *Behåll för filtrering* ([Kolumnmappning](column-mapping.md)), plus *Källfil* när flera filer lästes in.

## Prova det {#try-it}

1. Läs in en datamängd och öppna **Filter** i sidofältet.
2. Under **Fordonsklass**, avmarkera *Stridsvagn*. Bilden ändras på en gång.
3. Tryck **Rensa alla filter** för att ångra.

![Filterpanelen: visarens egna kolumner (Händelsetyp, Fordonsklass) först, sedan kolumnerna från din fil](../assets/img/en/filters.webp)

De första raderna är visarens egna kolumner (nedan). Raderna efter dem kommer från din fil.

## Kolumner som visaren lägger till {#columns-the-viewer-adds}

Vid inläsning räknar visaren ut fyra egna kolumner och listar dem **först**, med namn och värden på ditt språk. Då fungerar samma filter för varje spel och varje datakälla:

| Kolumn | Värden | Räknas ut från |
|---|---|---|
| **Händelsetyp** | 23 slag: Position, Skott avfyrat, Avfyrning (robot, raket, bomb), Träff, Miss (vapnet slutade nära inget mål), Explosion, Skada, Dödning, Död, Förstörd, Krasch, Utkastning / nödutrymning, Uppdykning, Försvinnande, Start, Landning, Markkontakt, Stopp på marken, Ombeväpning / tankning, Erövring / mål, Lockbete, Meddelande, Övrigt | en kolumn som heter `event`, `events`, `event_type` eller `event_name`. Varje spels egna ord (`shot`, `burst`, `fired`, `struck`, `flare`, `plant` ...) mappas till dessa slag. Hela tabellen: [Händelsetyper och klasser](ref-event-types.md). |
| **Spelare eller AI** | Spelare, AI | en kolumn `ai`, `is_ai`, `bot` eller `actor`; annars `is_player` / `human`; annars ett konto-id (`user_id`, `steam_id`; tomt eller 0 är AI); för Tacview-inspelningar, om objektet har en pilot |
| **Fordonsklass** | 17 klasser: Jaktplan, Attackflygplan, Bombplan, Övriga flygplan, Helikopter, Stridsvagn, Pansarfordon, Luftvärn, Artilleri, Lastbil / bil, Fartyg, Ubåt, Infanteri, Vapen, Lockbete, Konstruktion, Övrigt | fordonets eller enhetens namn (jämfört mot [figurkatalogen](figures.md)) och typkolumner |
| **Målklass** | samma klasser | motpartens fordon (`other_vehicle`, `target_vehicle`, `victim_type` ...) |

Bara de slag som förekommer listas. Värdekolumner (`cost_*`, `earn_*`, `net_*` och *Kostnadskälla*, se [Värdeviktning](value-weighting.md)) kan filtreras precis som vilken talkolumn som helst. Avmarkera till exempel *estimate* under *Kostnadskälla* för att bara behålla prissatta rader.

En kategorilista med fler än 12 värden får en sökruta (*Sök bland n värden*) och en knapp **Bara dessa**, som tillåter exakt de värden som matchar.

Vilka kolumner som kan filtreras avgörs vid inläsningen, eftersom de måste läsas då. Utan någon behållen kolumn säger panelen det och pekar på *Behåll för filtrering*.

## Talkolumner (intervall) {#numeric-columns-range}

![Ett intervallfilter (förlorade pengar) med båda ändarna dragna](../assets/img/en/filters-numeric.webp)

| Del | Betydelse |
|---|---|
| Namn, och `min ... max` | Kolumnen, och det aktuella intervallet (kolumnens hela intervall så länge inget filter är satt). |
| Första raden: sifferruta och reglage | Den nedre gränsen. Drar du reglaget över den övre gränsen, drar det med sig den övre gränsen. |
| Andra raden: sifferruta och reglage | Den övre gränsen. Drar du under den nedre gränsen, drar den med sig den också. |
| **Återställ *kolumn*** | Tar bort det här filtret. |

Reglagen täcker kolumnens minsta till största värde i 1 000 steg. Sifferrutorna accepterar valfritt värde. En rad klarar sig när dess värde ligger inom intervallet, med båda ändarna inräknade. Stora värden visas i exponentform (`1.23e6`).

## Kategorikolumner {#category-columns}

| Del | Betydelse |
|---|---|
| Namn, och `tillåtna/totalt` | Kolumnen, och hur många av dess värden som tillåts. |
| Värdelista | En kryssruta per värde. Ett tomt värde visas som *(tomt)*. |
| **Alla** / **Inga** | Tillåt alla värden / inget värde. |

Att tillåta alla värden tar bort filtret.

## Regler {#rules}

- **Fyra filter samtidigt.** Rubriken visar `aktiva/4`. Ett femte filter tillämpas inte, och panelen säger det. Ett val i [Entiteter](entities.md) (eller spelarfokus i fliken Match) använder ett av de fyra. Ett filter som täcker hela kolumnen använder inget.
- **En kategorikolumn har högst 4 096 värden.** En bredare behålls inte vid inläsningen.
- **Filter kombineras med OCH**, och med lagsynlighet, differensuppdelningen, tidsfönstret, bortsorteringen på avstånd och [snittet](slice.md).
- **Att ändra ett filter startar om ackumuleringen och mäter om exponeringen några bildrutor senare**, eftersom filtrering kan ändra tätheten mycket ([Färg och exponering](colour-and-exposure.md#auto-exposure)).
- **Rensa alla filter** tar bort varje kolumnfilter. Lagsynlighet och spelarval som satts på annat håll behålls.
- Kolumnfilter ändrar värmelägena. De ändrar inte figurerna i [figuruppspelningen](box-replay.md), som följer lagsynligheten och valet i Entiteter. Valet i Entiteter ändrar båda.
- I [linjevärme](line-heat.md) testas ett filter på raden som varje segment *slutar* vid.
- Vid varje ny datamängd rensas alla filter.

## För utvecklare {#for-developers}

**Slots.** Each active filter takes one of four GPU slots ([`MAX_FILTER_SLOTS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), a texture of 4 bytes per row. Slots go to the filters in the order they were last changed ([`filterSlots`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts), shared by the shader and both panels). Past four, an error says *Only the first 4 filters are applied. Clear one - the rest are being ignored, not silently combined*, and the extra filters' names read *column (not applied)*. Filters run per row in the vertex shader, so changing a threshold needs no re-parse and no re-upload.

**Filters the panel does not show.** Two more kinds exist in the application state ([`FilterSpec`](https://github.com/Holdi601/3DHeat/blob/main/src/state/types.ts)):

- a **groups** filter, set by the Match tab when it focuses one side. It hides the other groups in every mode, a [difference](difference.md) split by a column included.
- a **persons** filter, set by the [Entities](entities.md) panel and by the Match tab when it focuses one player. It restricts the figure replay and the heat modes. In the heat it is a category filter over the person ids and takes one of the four slots. Its mask holds 65,536 ids ([`FILTER_MASK_CAPACITY`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); a person past that is not drawn in the heat while it is active, even when selected. The figure replay still shows them.
