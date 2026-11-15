---
title: "Sampling och budgetar"
parent: "Rendering i detalj"
nav_order: 3
lang: "sv"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Sampling och budgetar

När det finns för många prickar för att rita dem i en bildruta, ritar visaren ett jämnt urval och gör att varje prick räknas för mer, så att bilden fortfarande stämmer. En regulator justerar hur många som ritas, så att visaren håller sin bildfrekvens.

## Reglagen i prestandapanelen {#performance-panel-controls}

| Reglage | Standard | Intervall (jogg) |
|---|---|---|
| **Rita alla rader varje bildruta** | på | |
| **Adaptiv budget** | på | |
| **Mål-FPS** | 60 | 20–240 (1000) |
| **Startvärde sprites / bildruta** (adaptiv) eller **Sprites / bildruta** | 4,00 M | 65 536–268 435 456, logaritmiskt (268 435 456) |
| **Värmeupplösning** | 100 % | 25–100 %, multiplicerat med den adaptiva steg två-skalan |
| **Progressiv förfining** | på | Av: varje bildruta är en ny skattning av en enda bildruta (användbart för att se det råa urvalet). |

Se även [Prestandapanelen och statistiköverlägget](performance-and-stats.md).

## För utvecklare {#for-developers}

### Kandidatrader {#candidate-rows}

Raderna lagras i stigande tidsordning. Tidslinjens fönster [*lo*, *hi*] blir ett radintervall med två binära sökningar över tidskolumnen ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Utan en tidskolumn är varje rad en kandidat. Dessa är **Rader i fönstret** i statistiköverlägget. Tester per rad (filter, grupper, delning, gallring, skiva, livstid) görs senare, i shadern. En rad som inte klarar testet kostar ett vertexanrop och inga fragment.

### Samplingsplanen {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) delar upp kandidatintervallet i **block om 4 096 rader i följd** och väljer hur många som ska ritas utifrån bildrutans spritebudget:

- Om budgeten täcker alla block ritas alla. Då är bildrutan exakt.
- Annars tas block med ett jämnt steg över intervallet, förskjutna med en jitter som flyttas med det gyllene snittet varje bildruta. Efterföljande bildrutor täcker därmed olika block, och unionen fylls jämnt. Det här är ett **stratifierat** urval: varje del av tidsintervallet finns med i varje bildruta.

Varje ritad rads värme multipliceras med **kandidater / skickade**. Den förväntade värmen i en bildruta är då exakt vid vilken budget som helst. Bara bruset beror på budgeten. Rader ligger i delar om 8 388 608 (se [GPU-minnets residens](gpu-memory.md)). Ett block delas där det korsar en del, och varje del får listan över blockstarter den måste rita.

En plan kan bära högst 65 536 block, alltså 268 435 456 sprites, eftersom båda backends har en fast buffert med 65 536 platser för blockstarter. En större begäran begränsas dit, och bristen visar sig ärligt som fler bildrutor för att konvergera.

### Rita alla rader varje bildruta {#draw-every-row-each-frame}

**Prestanda → Rita alla rader varje bildruta** (standard **på**): budgeten blir ett golv i stället för ett tak. En bildruta som startar en ny skattning ritar varje rad den ansvarar för (upp till taket på 268 M).

Skälet: en kameraförflyttning kasserar ackumuleringen. En rörlig bildruta är därför en enda skattning, vars brus bestäms av hur stor del av datamaterialet den ritade. Med en fjärdedel ritad ser du en fjärdedel i ljusa viktade prickar, och det är det som får en rörlig vy att glittra. Om allt ritas blir varje bildruta den färdiga bilden. Priset är att bildrutetiden nu följer datamängdens storlek i fönstret. Medlen är ett smalare tidsfönster, filter eller en avståndsgallring. De minskar kandidaterna i stället för att samplas tunnare.

Stäng av det på hårdvara som inte klarar hela fältet på en gång. *Sprites / bildruta* blir då en verklig gräns, och vyn konvergerar över några stillastående bildrutor i stället.

Vad en full plan kostar, uppmätt på en högpresterande skrivbords-GPU vid en 4K-canvas med en stor bana, med sprites på 1 m radie (en eller två pixlar): ungefär 100 M sprites per bildruta vid 30 fps, 200 M vid 15 fps och det högsta värdet 268 M vid ungefär 12 fps. Med så små sprites är vertexsteget hela kostnaden, och värmeupplösningen ändrar ingenting. Med stora sprites är det fyllningen som avgör: 8 M sprites med 100 m radie tog 2,5 s per bildruta vid full värmeupplösning och 170 ms vid 25 %. **Rita alla rader varje bildruta** börjar därför på 67 M och ökar med en fjärdedel per bildruta så länge bildrutorna tar under 150 ms. Den halveras när de tar över 400 ms. Då kan en tung vy aldrig driva en bildruta längre än GPU:ns vakthund tillåter.

### Den adaptiva budgeten {#the-adaptive-budget}

**Prestanda → Adaptiv budget** (standard på) justerar spritebudgeten så att den håller **Mål-FPS** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Den är vilande i lådrepris och under videorendering.

Indata är bildrutetiden, utjämnad (90 % föregående + 10 % nytt, där enskilda bildrutor begränsas till 2 s). Målet är 1000 / max(15, mål-FPS) ms.

**Steg ett: sprites.** Varje bildruta multipliceras budgeten med `1 + (target / frame - 1) × gain`. Förstärkningen är 0,35 när det är för långsamt och 0,08 när det finns marginal. Faktorn begränsas till 0,5–1,25 per bildruta och till 65 536–268 435 456 sprites.

**Steg två: upplösning.** Bara när budgeten redan ligger på sitt golv och bildrutorna fortfarande är mer än 10 % för långsamma sänks värmebufferns upplösning med 8 % per bildruta, ner till 25 % av canvasen. Den återhämtar sig med 4 % per bildruta när det finns 30 % marginal. Fragmentkostnaden faller med kvadraten på upplösningen, vilket nästan inte syns under en mjuk ramp. (Uppmätt med programvarurendering, 10 M rader och överdimensionerade sprites: 141 ms → 17 ms per bildruta.) Skalan avrundas till sextondelar. Överlägget *Värmeupplösning* visar den.

**Att ge upp.** En långsam bildruta ser likadan ut oavsett om sprites eller en tung bana orsakade den. Det finns ingen tidtagning per pass. Om budgeten ligger på sitt golv och bildrutorna ligger under 70 % av målet i 30 bildrutor, var det inte sprites som kostade. Regulatorn går då över till **klättring**. Den multiplicerar budgeten med 1,5 var 14:e bildruta och återställer upplösningen, så länge bildrutetiden håller sig inom 1,5 gånger det den var på golvet. En klättring som gör saker värre än så backar till 60 % och återgår till vanlig styrning. När målet nås avslutas klättringen.

Med den adaptiva budgeten av är budgeten helt enkelt **Sprites / bildruta**.

Med *Rita alla rader varje bildruta* på körs den adaptiva budgeten fortfarande. Den exakta regeln höjer dock budgeten så att alla kandidatrader täcks. I praktiken styr den därför bara upplösningssteget och bildrutor som inte startar en ny skattning.
