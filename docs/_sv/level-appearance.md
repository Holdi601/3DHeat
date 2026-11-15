---
title: "Banans utseende"
parent: "Banor och bakgrundsgeometri"
nav_order: 3
lang: "sv"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Banans utseende

Dessa reglage ändrar hur en 3D-bana ser ut, så att värmen sticker ut ur den och du ändå kan läsa av platsen. Inget här ändrar data.

## Snabbstart {#quick-start}

1. Läs in en 3D-bana ([3D-banor](model-levels.md)).
2. Under **Bakgrund / nivå**, sänk **Ljusstyrka** tills värmen är det ljusaste på skärmen.
3. Öppna **Markrelief** och höj **Lutningsskuggning** eller **Höjdkurvornas styrka** tills du kan skilja en kulle från en slätt.
4. Öppna **Strukturer**. Sänk **Ytornas opacitet** för att se in i byggnader, eller slå på **Strukturtextur** för att se dem solida.
5. Om marken har en bild målad på sig, prova **Marktextur** av och på.

![Avsnitten Markrelief och Strukturer öppna, med banan visad med reliefsignaler](../assets/img/en/level-appearance-sections.webp)

När en [3D-bana](model-levels.md) är inläst visar panelen Bakgrund / nivå de här reglagen. Standardvärdena är de som en nyimporterad bana får ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Ändringar ritar bara om scenen. Värmeackumuleringen behålls.

## Hela banan {#the-whole-level}

| Reglage | Standard | Intervall | Betydelse |
|---|---|---|---|
| **Opacitet** | 100 % | 0–100 % | Under 100 % blandas banan och skriver inget djup. Då [skymmer](depth-and-culling.md) den inte längre värmen. |
| **Ljusstyrka** | 0,9 | 0–2 (jogg 64) | |

Banan ritas avmättad: grå mark och ett tonat skal. Då är värmen det enda mättade på skärmen. Till skillnad från en [kartbild](map-images.md) har en 3D-bana inget reglage för Avmätta.

## Markrelief {#ground-relief}

På långt håll ser en kulle och en slätt likadana ut, grå. Därför lägger visaren till tre ledtrådar. Var och en svarar på ett annat problem:

| Reglage | Standard | Betydelse |
|---|---|---|
| **Avstånd mellan höjdkurvor** | från markens höjdintervall | Höjden mellan höjdkurvorna, logaritmiskt från 1/4000 till 1/2 av banans höjdintervall. Spårets nedersta är *av*. Standard är 1/40 av markens höjdintervall, avrundat till ett steg 1/2/5. 10 m-linjer passar en bergssida och är värdelösa på en stenbrottsbotten. Varje femte linje ritas starkare. Höjdkurvorna ritas i skärmrymd och är därför en pixel breda vid all zoom. De är den enda ledtråden som klarar mark som är för flack för att skuggas alls. |
| **Höjdkurvornas styrka** | 35 % | 0–100 % |
| **Lutningsskuggning** | 55 % | Mörkar efter branthet, så att slänter och klippor syns från alla kameravinklar. Ett ljus gör det inte. Det plattar ut bilden så fort du vänder dig mot det. |
| **Höjdramp** | 50 % | Låg mark mörkare, hög mark ljusare, över markens höjdintervall. Det är formen i stor skala. |

Avsnittets rubrik visar höjdkurvornas läge: *var N m*, höjdkurvornas avstånd, eller *inga höjdkurvor* när avståndet är av.

## Markytan {#ground-surface}

| Reglage | Standard | Visas när | Betydelse |
|---|---|---|---|
| **Vatten** | på | banan har vatten | Sjöar, floder och havet, ritade platta i en blekt blågrå ton. Inga terrängledtrådar gäller för en yta som är plan per definition. |
| **Vattnets opacitet** | 60 % | Vatten är på | Kustlinjen och marken under grundvattnet syns genom genomskinligt vatten. |
| **Marktrianglar** | 30 % (0 för en bana med texturer) | alltid | Terrängens egna kanter, ritade över den skuggade ytan. De bleknar ut mellan 6 % och 25 % av banans bredd från kameran. De visar hur grovt marken samplades och ger en lutning något att bedöma avståndet med. Byggs vid första användningen, vilket tar en stund på en stor bana. |
| **Mark endast som trådmodell** | av | alltid | Byter ut terrängytan mot dess kanter. Helt schematiskt. Skuggningen, höjdkurvorna och skymningen försvinner också, så *Marktrianglar* är oftast det bättre valet. |
| **Marktextur** | på | banan har texturer | Ritar marken i de texturer filen bär (asfalt, kantzon, gräs). Meshbelysningen läggs försiktigt ovanpå, eftersom texturen redan har sin egen fina relief. **Ljusstyrka** är sättet att dämpa den under värmen. Avmätta hör till kartbilder. |
| **Fångad färg** | av | banan har vertexfärger | Skuggar marken med den färg som en skanning fångade i stället för grått. En rekonstruerad väg skulle annars inte gå att skilja från kantzonen. Motorexporter har ingen färg. När den saknas säger panelen *Den här banan har ingen färg.* |

## Strukturer {#structures}

Rubriken **Strukturer** visar antalet trianglar i konstruktionerna. Texten nedanför säger hur de ritas (*ritas solida i sina egna texturer* eller *ritas som ett genomskinligt skal så att du kan se värmen inuti dem*) och hur många delar som är konstruktioner.

| Reglage | Standard | Betydelse |
|---|---|---|
| **Strukturtextur** | på när konstruktionerna har texturer | Ritar konstruktionerna solida, i sina egna texturer. Att slå på den sätter ytornas opacitet till 100 % och stänger av kanterna. Att slå av den återgår till det tonade genomskinliga skalet på 25 %. En texturerad konstruktion belyses från den sida kameran ser, eftersom en skylt är två ytor mot varandra. Vilken som vinner djupprovet beror på avrundning. |
| **Trådkanter** | på. Av över 300 000 konstruktionstrianglar eller när de har texturer | Avdubblerade kanter på konstruktionerna, en linje per kant. |
| **Kanternas opacitet** | 50 % | |
| **Skalytor** | på | En svag yta med en ljus Fresnel-kant, så att en byggnad ser ut som en volym och inte som ett bur eller en dimbank. |
| **Ytornas opacitet** | 25 % (35 % över 300 000 konstruktionstrianglar, 100 % med texturer) | 0–60 % på spåret, upp till 100 % med handtaget. Håll den låg. Solida konstruktioner döljer datan inne i dem. |
| **Skarpa kanter** | på (av när de har texturer) | Skuggar varje triangel efter dess egen normal, beräknad i fragmentshadern från derivator i skärmrymd. Exporterade banor är svetsade och bär medelvärdesnormaler. Det får varje hörn på en låda att se ut som "smält folie". Att dela upp varje vertex för att åtgärda det skulle multiplicera vertexbufferten. Stäng av den för en bana där de krökta ytorna är viktigare än hörnen. |
| **Strukturtoning** | Cyan | En färgväljare och förinställningarna **Cyan**, **Bärnsten**, **Violett** och **Vit**. |
| **Visa delklassificering (N)** | | Varje del, dess klass och skälet. Se [3D-banor](model-levels.md#ground-structures-and-water). |

## Skära banan {#cutting-the-level}

[Skivan](slice.md) och, med *Skär nivån också*, [avståndsgallringen](depth-and-culling.md#distance-culling) skär marken, konstruktionerna och vattnet vid samma plan som värmen.
