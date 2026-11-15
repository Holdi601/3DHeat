---
title: "Djup och bortsortering"
parent: "Värmelägen"
nav_order: 4
lang: "sv"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Djup och bortsortering

Djup gör att kullar och väggar döljer värmen bakom sig, precis som en riktig vägg döljer en person. Avståndsgallring behåller bara värmen mellan ett närmaste och ett längsta avstånd från kameran.

![En låg kamera bakom en kulle, med Dölj bakom terräng av (till vänster) och på (till höger)](../assets/img/en/depth-and-culling-terrain.webp)

![Avståndsgallring med Fjärran på 400 m och Skär nivån också på: en skiva av kartan runt kameran](../assets/img/en/depth-and-culling-far.webp)

Utan djup är en värmekarta över en 3D-[bana](levels.md) ett platt överlägg. Allt datamaterialet lyser igenom varje vägg med full styrka. De djupsignaler som banan ger tas bort, och en hotspot inne i en byggnad ser likadan ut som en på taket. Avsnittet **Djup** gör att banan döljer det som står bakom den. **Avståndsgallring** begränsar värmen till ett skal eller en skiva runt kameran. [Skivan](slice.md) skär ut en skiva ur världen. Alla tre gäller värmelägena och ändrar vilka rader som bidrar. Därför startar ändringar av dem om ackumuleringen.

## Djup {#depth}

Båda reglagen kräver en [bana](levels.md), antingen en kartbild eller en 3D-modell. Utan bana finns inget att gömma sig bakom, och de gör ingenting. Båda är avstängda medan [Platta ut på markplanet](sprite-shape.md#flatten-onto-ground-plane) är på.

### Dölj bakom terräng {#hide-behind-terrain}

**Dölj bakom terräng** (standard på): en datapunkt vars närmaste yta mot kameran är *marken* (inte en konstruktion) tas bort helt. Den dämpas inte.

Terräng och väggar är ogenomskinliga på olika sätt. Du ser *genom* en vägg med avsikt, för att se på vilket golv trafiken gick. Du vill aldrig se genom en kulle. Bakom en kulle ligger den andra sidan av kartan, och på en karta som är kilometer stor är det mesta av datamaterialet där. Det summeras längs horisonten till ett band som är ljusare än allt i förgrunden. En enda dämpning kan inte tjäna båda syftena. Därför får terrängen en avskärning, och väggarna behåller dämpningen nedan.

### Dolt bakom geometri {#hidden-behind-geometry}

**Dolt bakom geometri** (standard 0,8): hur kraftigt en datapunkt bakom banans geometri undertrycks. Värdet läses *syns igenom* vid 0, *N % svagare* däremellan (reglagets läge, inte den uppmätta dämpningen) och *helt dold* vid 1.

Varje vägg eller golv mellan en punkt och kameran dämpar den ytterligare. En vägg lämnar några procent kvar vid standardvärdet, och varje extra yta halverar det som är kvar, upp till fyra ytor. Vid 1 ritas inget bakom geometri. Det är den billigaste inställningen.

Se även [Banans utseende](level-appearance.md).

## Avståndsgallring {#distance-culling}

**Avståndsgallring** (stängd som standard) begränsar värmen till rader mellan ett närmaste och ett längsta avstånd från kameran. Sätt en längsta gräns för att läsa av täthet inne i en byggnad, utan att den andra sidan av kartan summeras ovanpå. Sätt en närmaste gräns för att flyga *genom* en hotspot i stället för in i den.

| Reglage | Standard | Intervall (jogg) | Betydelse |
|---|---|---|---|
| **Nära** | av | 0,5–5000 m, logaritmiskt. Den nedersta 5 % av spåret = av (200 000) | Rader närmare än så hoppas över. |
| **Fjärran** | av | 1–200 000 m, logaritmiskt. Botten = av (10 000 000) | Rader längre bort än så hoppas över. |
| **Skär vid ett plan** | på | | Mät gränserna längs visningsaxeln i stället för från ögat. Snittet blir då ett plan parallellt med skärmen i stället för ett klot runt dig. Ett klots kant böjer sig bort över bilden och glider när du vrider dig. Ett plan stannar där du placerade det. |
| **Skär nivån också** | på | | Skär marken, konstruktioner och vatten vid samma gränser. Med nivån hel tas datapunkterna bort, och byggnaden står kvar framför dem. Med båda skurna blir det ett snitt genom kartan, och punkterna sitter mot sina väggar och golv. Det här reglaget ritar bara om. Det startar inte om ackumuleringen. |

### Tangentbord {#keyboard}

Den längsta gränsen är ett reglage du sveper med. Gå igenom en byggnad och se på vilket golv trafiken dyker upp. Därför finns den på tangentbordet medan du flyger ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Tangent | Effekt |
|---|---|
| `]` | Flytta den längsta gränsen längre ut med en faktor 1,12 (Shift: 1,35) |
| `[` | Dra den inåt med samma faktor |
| `\` | Stäng av den längsta gränsen, eller slå på den igen på det avstånd där den lämnades (6000 första gången) |

Stegen är geometriska, eftersom det användbara området sträcker sig över fyra storleksordningar, från ett rum till en karta. Tangentbordet håller den längsta gränsen mellan 100 och 400 000. Tangenterna gör ingenting medan en textruta eller meny har fokus.

## För utvecklare {#for-developers}

### Dölj bakom terräng {#hide-behind-terrain}

Konstruktionerna ritas in i en egen djuptextur. Ett fragment som ligger bakom scenens djup men *inte* bakom konstruktionernas djup ligger bakom marken och kasseras. Det kostar ett djuppass över konstruktionerna, som hoppas över när reglaget är av.

### Dolt bakom geometri {#hidden-behind-geometry}

Det räknas **per yta**. En enda djupjämförelse kan bara säga "något ligger framför". En punkt bakom en vägg och en punkt fyra rum in i en byggnad skulle då dämpas lika, och insidan skulle bli en enda svag smet. I stället **djupskalas** konstruktionsgeometrin i upp till 3 ytterligare lager ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Varje fragment räknar hur många ytor som ligger framför det (scenens eget djup plus de skalade lagren, upp till fyra). Dämpningen staplas:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Reglage | 1 yta | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25 % | 12,5 % | 6,25 % | 3,1 % |
| 0,8 (standard) | 4 % | 2 % | 1 % | 0,6 % (golv) |
| 1,0 | ritas inte | ritas inte | ritas inte | ritas inte |

Varför två faktorer: reglaget är kalibrerat så att en vägg lämnar några procent kvar. Det är utseendet som signalerar "bakom något". Några procent staplade skulle vara noll vid tredje väggen. Att halvera för varje extra yta ger fyra urskiljbara steg. Varför kvadrerat: linjärt lämnade ett mättat fält fortfarande mättat bakom en vägg. Fjärde potens raderade det vid 0,8. Varför ett golv: om dold värme döljs helt ser ett rum fullt med dold trafik ut som ett tomt rum, utan något som antyder att man ska ta till [Skivan](slice.md). Bara ett reglage som står på 1 döljer den helt. Det är dessutom den billigaste inställningen, eftersom dolda punkter då kasseras.

Hur ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), punktvärmeshaderna): jämförelsen görs per fragment mot scenens djuptextur, i **fönsterdjup** och inte i världsavstånd. En djuptextursläsning i vertexsteget ger "långt bort" överallt på vissa drivrutiner, ANGLEs programvaruraster bland dem. Att linearisera båda djupen till meter förlorar separationen genom precisionen när närmaste och längsta avstånd ligger långt från varandra. Förskjutningen är en spriteradie omräknad till fönsterenheter plus några minst signifikanta bitar, så att en datapunkt som vilar på en yta inte skuggar sig själv.

Konstruktionerna ritas genomskinliga, men de ritas in i det djup som skuggningen läser. En bana vars konstruktioner inte nådde djuptexturen skulle skugga bara mot terrängen.

### Avståndsgallring {#distance-culling}

Båda gränserna utvärderas i vertexshadern. En gallrad rad kostar därför en vertex och inga fragment.
