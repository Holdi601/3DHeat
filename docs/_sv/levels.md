---
title: "Banor och bakgrundsgeometri"
nav_order: 13
has_children: true
lang: "sv"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: true
---

# Banor och bakgrundsgeometri

En bana är den 3D-plats där spelet utspelade sig: en karta, en stad, en bana. Lägg en bakom din data så ser du *var* värmen är. Panelen **Bakgrund / nivå** (se [Ordlistan](glossary.md) för ”level”) ger tre slags sammanhang:

- en **kartbild**, georefererad med två ankare. Se [Kartbilder](map-images.md);
- en **3D-bana** (`.glb`, `.gltf`, `.obj`, `.stl` eller `.ply`), delad i mark, konstruktioner och vatten och förenklad vid import. Se [3D-banor](model-levels.md) och [Banans utseende](level-appearance.md);
- en **världsbakgrund**, för en inspelning som säger var på jorden den är (en Tacview ACMI-fil): den verkliga terrängen, vägar, vatten, flygfält och byggnader, hämtade från öppna data. Se [Världsbakgrund](world-backdrop.md).

Utan något inläst är scenen mörk med ett rutnät och färgade axlar (**Rutnät** och **Axlar** i [Kamera & scen](camera.md)), och panelen säger: *Inget inläst – scenen visar ett rutnät och axlar. Lägg till en kartbild eller ett banmesh för att ge värmen ett sammanhang.*

Banan delas av alla tre flikarna: en bana som lästs in i fliken Racinganalys är samma bana som värmekartan visar.

![Panelen Bakgrund / nivå med en bana inläst: knapparna Kartbild och 3D-modell, Teater, Opacitet, Ljusstyrka, Spara i biblioteket och listan Bibliotek](../assets/img/sv/level-panel.webp)

## Lägg en bana bakom din data {#put-a-level-behind-your-data}

1. Läs in din data först ([Läsa in data](getting-data-in.md)), så att banan passas in mot den.
2. Öppna **Bakgrund / nivå** i sidofältet.
3. Tryck **Kartbild…** för en bild eller **3D-modell…** för en 3D-bana, och välj filen. För en inspelning från verkligheten använder du **Världsbakgrund** eller **Teater** i stället.
4. Vänta tills förloppsraden är klar. En stor modell förenklas först (se **Förenklingsmål** nedan).
5. Tryck **F** i vyn för att ramma in allt. Använd **Opacitet** och **Ljusstyrka** tills värmen står ut mot banan.
6. Tryck **Spara i biblioteket** om du ska använda banan igen ([Banbibliotek](level-library.md)).

## Vad en bana gör för värmen {#what-a-level-does-for-the-heat}

- Den **skymmer**: datapunkter bakom den dämpas per yta, och datapunkter bakom terrängen döljs ([Djup och bortsortering](depth-and-culling.md)). Utan bana finns ingen skymning.
- Den **skärs** av [Snitt](slice.md) och, med *Skär nivån också*, av [bortsortering på avstånd](depth-and-culling.md#distance-culling), tillsammans med värmen.
- Den är det enda som [skärpedjupet](camera.md#depth-of-field) suddar, förutom rutnätet och lådorna.
- En 3D-bana **vidgar kamerans fjärrplan** när den är större än datan. Närplan och fjärrplan kalibreras från datamängden, och en exporterad karta flera kilometer bred skulle annars ligga helt bakom fjärrplanet och lämna en tom vy. Fjärrplanet blir 3 × banans horisontella utsträckning när den är större. Närplanet följer med (minst fjärran / 100 000) för att behålla det djupdetalj som skymningen bygger på, och flyghastigheten höjs till minst utsträckning / 12. Den vidgas bara, aldrig smalnas av.

## Panelen, uppifrån och ned {#the-panel-top-to-bottom}

| Del | Detaljer |
|---|---|
| **Kartbild…**, **3D-modell…** | Läs in en. Den ersätter den nuvarande banan. |
| **Världsbakgrund**, **Glöm kartrutor** | Bara för en datamängd med en geografisk referens: bygg den verkliga platsen under den som bana, eller ta bort de hämtade rutorna. [Världsbakgrund](world-backdrop.md) |
| **Förenklingsmål** | Triangelbudgeten för nästa modellimport: *Full – ingen förenkling* (standard), *Hög – 8M*, *Medel – 3M*, *Låg – 800k*, *Silhuett – 100k*. [3D-banor](model-levels.md#simplification) |
| Förlopp och **Avbryt** | Under avkodning eller import. |
| Importnotis | Trianglar före och efter, delningen mark / konstruktioner / vatten och vilken detaljnivå som används. |
| Namn och storlek | `bredd×höjd px · x × z m/px` för en bild, `N trianglar (från M)` för en modell. |
| **Opacitet**, **Ljusstyrka** | Gäller båda slagen. |
| Bildreglage | **Desaturera**, **Vänd norr/söder**, **Placering** (två ankare), **Anpassa till datans gränser**, **Höjd**. [Kartbilder](map-images.md) |
| Modellreglage | Markrelief, vatten, marktrianglar, trådmodell, textur, inspelad färg, konstruktioner, delklassificering. [Banans utseende](level-appearance.md) |
| **Spara i biblioteket**, **Ta bort** | [Banbibliotek](level-library.md). Ta bort lossar banan. |
| **Bibliotek** | Banor som sparats i den här webbläsaren. [Banbibliotek](level-library.md) |

## Sidor i det här avsnittet {#pages-in-this-section}

- [Kartbilder](map-images.md)
- [3D-banor](model-levels.md): format, delar, klassificering, förenkling, texturer
- [Banans utseende](level-appearance.md): varje reglage för en 3D-bana
- [Banbibliotek](level-library.md)
- [Världsbakgrund](world-backdrop.md): den verkliga världen under en inspelning, från öppna data

Hur man får ut banor ur spel och motorer är uppgift för de separata exportverktygen (se förrådets [README](https://github.com/Holdi601/3DHeat/blob/main/README.md)). Kontraktet de skriver till sammanfattas i [3D-banor](model-levels.md#the-exporter-contract).
