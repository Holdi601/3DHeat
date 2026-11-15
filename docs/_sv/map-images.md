---
title: "Kartbilder"
parent: "Banor och bakgrundsgeometri"
nav_order: 1
lang: "sv"
source: "map-images.md"
source_hash: "f0bbaa4b019e"
translated: true
outdated: false
---

# Kartbilder

En kartbild är en plan bild, till exempel en minikarta, ett satellitfoto eller en planritning. Den läggs under dina data så att du kan se var värmen sitter. Du talar om för visaren var bilden hör hemma genom att fästa två punkter på den vid två platser i världen (ankarna).

## Läs in och placera en kartbild {#load-and-place-a-map-image}

1. Läs in dina data först ([Hämta data](getting-data-in.md)).
2. Under **Bakgrund / nivå**, tryck på **Kartbild…** och välj bilden. Den sträcks ut över datans område.
3. Tryck på **Anpassa till datans gränser** om bilden har flyttats. Ankare 1 hamnar i bildens övre vänstra hörn, ankare 2 i dess nedre högra hörn, vid datans kanter.
4. Om värmen inte passar med bilden, välj två landmärken som ligger långt från varandra (till exempel två motsatta hörn på en byggnad eller två korsningar). Läs av varje punkts pixel på bilden och dess position i världen (håll markören över [linjalen](measure.md) för att läsa av **X** och **Z**).
5. Skriv in dem i **Placering**: för **Ankare 1** landmärkets **px**, **py**, **värld X** och **värld Z**. Samma sak för **Ankare 2**.
6. Kontrollera: ett spår eller en hotspot som du vet ligger på en väg ska nu ligga på den vägen. Justera siffrorna tills det stämmer.

![Avsnittet Placering med två ankare och värme ritad på en kartbild](../assets/img/en/map-images-placement.webp)

De två landmärkena måste skilja sig både i pixelkolumn och i pixelrad. Annars säger panelen *De två ankarna delar en pixelrad eller kolumn*.

## Inläsning {#loading}

Vilket bildformat som helst som webbläsaren kan avkoda. En bild vars längre sida är över **8192 px** skalas ner till 8192. Det är den största sidan som grafikkortet begärs hålla. Panelen säger *Nedskalad från W×H till w×h*.

Vid inläsning sträcks bilden ut över datamängdens X-Z-gränser (eller ±1000 enheter utan data), med norr uppåt, vid datamängdens lägsta Y. Standardvärdena är **Opacitet** 100 %, **Ljusstyrka** 0,7, **Avmätta** 100 % och **Vänd nord/syd** på. Bilden är avmättad och nedtonad, eftersom bakgrundens uppgift är att låta dig hitta en hotspot, inte att konkurrera med den.

## Reglage {#controls}

| Reglage | Standard | Intervall | Betydelse |
|---|---|---|---|
| **Opacitet** | 100 % | 0–100 % | |
| **Ljusstyrka** | 0,7 | 0–2 (jogg 64) | |
| **Avmätta** | 100 % | 0–100 % | Grå bakgrund, mättad värme. Färg i kartan tävlar med färg i datan. |
| **Vänd nord/syd** | på | | Vilken bildrad som är världens högsta Z. Om du slår av eller på den med data inlästa, passas ankarna också om till datans gränser. |
| **Placering**: Ankare 1, Ankare 2 | bildens hörn mot datans gränser | | Varje ankare är en pixel på bilden: **px** (från vänster, 0 till bredden) och **py** (uppifrån, 0 till höjden), och den världskoordinat den sitter vid, **värld X** och **värld Z**. Skala och förskjutning följer av paret. |
| **Anpassa till datans gränser** | | | Lägger ankare 1 i bildens övre vänstra hörn och ankare 2 i dess nedre högra hörn, vid datans X-Z-gränser. En utgångspunkt för exakt placering. Kräver data. |
| **Höjd** | datans lägsta Y | datans min Y - 500 till max Y + 500 (jogg max Y + 100 000) | Kartplanets höjd. Lägg den strax under data, så att inget döljs av den. |

Namnraden visar `bredd×höjd px · x × z m/px`, alltså världens storlek på en pixel längs varje axel.

## I scenen {#in-the-scene}

Bilden är en enda texturerad fyrhörning på höjden. Vid full opacitet skriver den djup, så den deltar i [skymningen](depth-and-culling.md) som mark. Under 100 % opacitet blandas den och skriver inget djup. Då skymmer den ingenting. [Linjalen](measure.md) mäter i dess plan. [Banbiblioteket](level-library.md) sparar en bildbana med dess ankare.

## Dota 2-kartan {#dota-2-map}

**Dota 2-karta** bredvid **Kartbild…** hämtar ritningen av den aktuella Dota 2-kartan som [OpenDota](https://www.opendota.com) visar på sina matchsidor. Den placeras under tabeller som [Watcher](https://github.com/Holdi601/3DHeat-Watcher) skriver från Dota 2-repriser ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Bilden hämtas från opendota.com när knappen trycks in och ingår inte i 3DHeat. Den senaste patchens ritning tas från OpenDotas egen lista, och 7.40-ritningen används när listan inte kan läsas.

| | |
|---|---|
| Källa | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Placering | OpenDotas kalibrering: bilden täcker Dota-världsenheter från -8192 till 8064 på båda axlarna (128-enhetsceller 64 till 191), norr överst. Med reprisens tabellaxlar (Z upp, Y vänd) blir det världen X från -8192 till 8064 och världen Z från -8064 till 8192. Ungefär 18 enheter per pixel. |
| Höjd | 0. Hjältarna står på 0 till ungefär 600. |
| Utseende | Ljusstyrka 0,8, avmätta 50 %. |

Kontrollerat på en offentlig matchrepris av patch 7.40. Varje hjältes spår följer de ritade filerna, och tornen, kasernerna och de ancient som repriset placerar hamnar på de ritade baserna. Vyn **Ovan** visar kartan med norr längst ner på skärmen. Det gör den för varje tabell med Z upp och Y vänd.

Ritningen är OpenDotas, av Valves karta. Valve står inte bakom 3DHeat.

### 3D-kartan {#the-3d-map}

Med Dota 2 installerat skapar det separata verktyget [3DHeat Dota](https://holdi601.github.io/3DHeat-Ext-Dota/) (`heat3d-dota-maps level -o dota.glb`; Watchers kommando [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) kör det också) kartan i 3D från spelets egna filer: mark, klippor, vatten, träd och byggnader, i repristabellernas enheter och axlar. Läs in filen en gång med **3D-modell…**: visaren känner igen den på dess delar (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` i `dotaMap.ts`), lägger den genast i [banbiblioteket](level-library.md), där den ersätter en äldre, och säger det. Därefter läser **Dota 2-karta** in den här 3D-kartan från biblioteket i stället för att hämta ritningen; finns ingen i biblioteket hämtar den ritningen och berättar hur du skapar 3D-kartan. Filen kommer från din egen installation och stannar på din dator.

## För utvecklare {#for-developers}

### Hur ankaren placerar bilden {#how-the-anchors-place-the-image}

Från [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), med ankarna *a* och *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Två ankare fixerar både skala och förskjutning på varje axel, var för sig. En karta kan alltså sträckas olika på X och Z, men inte roteras. Ankarna måste skilja sig åt i **båda** pixelkoordinaterna. Delar de en rad eller en kolumn går ingen skala att härleda. Kartan ritas inte då, och panelen säger *De två ankarna delar en pixelrad eller kolumn*.
