---
title: "Minne och budgetar"
parent: "Läsa in data"
nav_order: 6
lang: "sv"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Minne, budgetar och passningskontrollen

Din dator har begränsat minne. 3DHeat räknar ihop vad dina filer behöver och säger till innan du trycker på **Läs in** om de får plats.

![Minnesuppskattningen säger att det inte får plats, med Läs in var [N]:e rad förifylld och knappen Läs in som säger För stor – minska eller gallra](../assets/img/en/memory-and-budgets-wont-fit.webp)

*För stort för den här datorn? 3DHeat föreslår att du läser in var N:e rad i stället.*

En webbläsarflik som får slut på minne mitt i en inläsning kraschar och förlorar minuter av arbete, och ett grafikkort som ber om mer än det har tappar antingen sitt sammanhang eller saktar ner till kryp. Därför säger panelen Källa, innan en inläsning startar, hur mycket minne den behöver, jämför det med budgetar som upptäckts för den här datorn, och vägrar – med en utväg – när det inte får plats. Modellen finns i [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Minnesuppskattningen {#the-memory-estimate}

Visas ovanför knappen **Läs in** när raderna har räknats.

| Rad | Betydelse |
|---|---|
| **Minnesuppskattning** – *får plats* / *snävt* / *får inte plats* | Domen, grön, gul eller röd. |
| `N rader · B B/rad` | Rader som läses in (efter steget) och de stadiga byten per rad. |
| `RAM X kvar, Y på topp vid inläsning` | Minne som hålls när det är inläst, och toppen under inläsningen. |
| `GPU Z · beräknad inläsning T` | GPU-minne för raderna, och en beräknad tid vid 1,2 miljoner rader per sekund. |
| GPU-namn | Renderarens namn, när drivrutinen anger det. |
| Meddelanden | Varför det inte får plats, eller är snävt, och vad du ska göra. |
| **Läs in var [N]:e rad** | Gallringssteget (se nedan). |
| `Budget: X RAM, Y GPU. Justera under Prestanda → Resursbudgetar.` | Budgetarna som kontrollen använde. |

### Byte per rad {#bytes-per-row}

| Kolumn | Stadig (RAM) | Noteringar |
|---|---|---|
| Position | 12 | Tre 32-bitars flyttal, alltid (en platt axel är fortfarande en array) |
| Tid | 4 | När den är mappad |
| Livstid | 4 | När tid och person är mappade |
| Person | 4 | När den är mappad |
| Grupp | 2 | När den är mappad |
| Session | 4 | När den är mappad |
| `Källfil` | 4 | När mer än en fil lästs in |
| Varje filterkolumn | 4 | Per bockad kolumn *Behåll för filtrering* |

**Toppen** lägger till det en inläsning bara tillfälligt behöver – 8 byte 64-bitars tid under sammanslagningen, 12 byte sorteringsnycklar och index, 4 byte arbetsutrymme för permutationen (alla tre när tid är mappad), och 4 byte medan grupp-kolumnen fortfarande är 32-bitars – och multiplicerar summan med **2,0**. Den faktorn är uppmätt (en verklig inläsning av flera filer nådde 1,9 gånger de uppräknade arrayerna, från Parquet-avkodarens arbetsmängd, kopiorna som trimmar varje kolumn till rätt längd, och minne som frigjorts men ännu inte återlämnats) och avrundad uppåt, eftersom en för låg uppskattning kostar en kraschad flik medan en för hög bara kostar ett onödigt steg.

På **GPU:n** kostar varje rad 8 byte (position och grupp, 16 bitar vardera), plus 4 byte (tid och livstid, 16 bitar vardera) när både tid och person är mappade. Se [GPU-minnets residens](gpu-memory.md). Filterstrukturer (4 byte per rad och aktivt filter) och linjevärmens segmentstarter (8 byte per rad medan läget Linjer är på) ingår inte i uppskattningen.

## Passningskontrollen {#the-fit-check}

Tre begränsningar jämförs ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- toppen av RAM mot **RAM-budgeten**,
- GPU-byte mot **GPU-budgeten**,
- antalet rader mot **sorteringstaket** på 400 000 000 rader, när en tidskolumn är mappad.

Den värsta av de tre kvoterna avgör: upp till 70 % *får plats*, upp till 100 % *snävt* (den bör läsas in, men räkna med att det blir långsamt), över det *får inte plats*. När det inte får plats anger panelen den begränsning som bestämmer och föreslår:

- att läsa in var *N*:e rad, med *N* = ⌈rader / rader som får plats⌉, förifyllt i stegrutan;
- att ta bort filterkolumner, avmappa tidskolumnen (vilket tar bort sorteringen och dess tak, till priset av tidslinjen), eller att höja budgeten.

När budgeten i sig inte är ett faktum om hårdvaran – webbläsaren begränsade RAM-värdet, standardvärdet hölls nere av det som är ledigt just nu, eller GPU-värdet är en gissning – säger meddelandet det, så att du inte tar till ett steg du inte behöver.

### Gallring {#decimation}

**Läs in var [N]:e rad** behåller en rad av *N*, räknat per fil. Värmen är ett medelvärde, så varje *N*:e rad ger samma fördelning med mer brus – samma avvägning som renderaren redan gör varje bildruta. Rutan börjar på 1 (*rad (alla)*); när urvalet inte får plats är den förifylld med det föreslagna steget om du inte skrivit i den. Knappen Läs in säger sedan *Läs in N filer (1 av K)*, och datamängdens namn anger `var K:e rad`.

### Sorteringstaket {#the-sort-ceiling}

Renderaren behöver rader i stigande tidsordning, så en mappad tidskolumn innebär att varje rad sorteras, med en radixsortering över 32-bitarsnycklar ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Över **400 miljoner** rader vägras det i stället för att försökas i en flik. Det kontrolleras före inläsningen, så ett urval över gränsen vägras med ett stegförslag i stället för att läsas in helt och misslyckas i sista steget. Nära gränsen (*snävt*) varnar panelen för att sorteringen är ett långt pass utan egen framstegsindikator. Utan tidskolumn sker ingen sortering och inget tak gäller.

## Resursbudgetar {#resource-budgets}

**Prestanda → Resursbudgetar** (en hopfällbar rad längst ned i panelen Prestanda, som visar `Resursbudgetar - RAM, GPU, kärnor`). Budgetarna är upptäckta; det upptäckta värdet är standardvärdet; och reglagen går inte högre än ett **tak** som är det upptäckta värdet, utom där upptäckten är känd för att inte vara en mätning.

| Kontroll | Intervall | Betydelse |
|---|---|---|
| **RAM för raddata** | 256 MiB till RAM-taket, logaritmiskt | RAM-budgeten för passningskontrollen. Markeras *(över upptäckt)* när den går över standardvärdet, *(max)* vid taket. |
| **GPU för raddata** | 128 MiB till GPU-taket, logaritmiskt | GPU-budgeten för passningskontrollen och för uppladdning av rader. Markeras *(över upptäckt)* när den går över standardvärdet, *(max)* vid taket. |
| **Tolkningstrådar** | 1 till antalet logiska kärnor | Hur många filer en inläsning tolkar samtidigt, var och en i en egen arbetare. Standard kärnor - 2 (kärnor - 1 på fyra kärnor eller färre). Se [Tolkningstrådar](#parser-threads) (under För utvecklare). |
| Källraden | | Var varje siffra kom ifrån (`RAM: …. GPU: …. CPU: ….`). |
| **Identifiera igen** | | Begär en ny minnesavläsning från utvecklingsservern och räknar om alla budgetar. |
| GPU-namn | | Adapterns korta namn; den fullständiga renderarsträngen är verktygstipset. |

### Höja GPU-budgeten {#raising-the-gpu-budget}

En GPU-budget över det upptäckta värdet gäller som inställd: passningskontrollen och uppladdningen tar samma värde från en funktion ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), som bara begränsar det till GPU-taket som reglaget stannar vid. En inläsning som kontrollen godkänner laddas alltså upp helt. Över det upptäckta värdet visar reglaget *(över upptäckt)*: siffran är då din bedömning av kortet, inte en mätning, och att sätta den högre än vad kortet klarar riskerar ett förlorat sammanhang eller ett kryp.

## Stora datamängder: hävstängerna {#huge-datasets-the-levers}

Från billigast till mest drastiskt:

1. **Färre filterkolumner.** Varje är 4 byte per rad och ett avkodningspass.
2. **Ett steg.** Var *N*:e rad.
3. **Ingen tidskolumn.** Ingen sortering, inget sorteringstak, inga 4–8 byte per rad för tid och livstid – och ingen tidslinje.
4. **Höj budgetarna**, när du vet att minnet finns där.

Vid renderingen hanteras stora datamängder med sampling och progressiv ackumulering i stället för att data minskas; se [Sampling och budgetar](sampling-and-budgets.md).

## För utvecklare {#for-developers}

### Tolkningstrådar {#parser-threads}

En inläsning av flera filer tolkar upp till **Tolkningstrådar** av dem samtidigt, var och en i en tolkningsarbetare som startas av inmatningsarbetaren för den inläsningen ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Vid 1, eller för en enda fil, tolkas filerna efter varandra i själva inmatningsarbetaren.

Att köra flera samtidigt lossar inte passningskontrollen:

- **Byggaren räknas först.** De sammanslagna kolumnerna allokeras för hela urvalet innan den första filen läses, så filerna som är i farten får bara det RAM-budgeten lämnar bredvid dem (`parseHeadroom`): position, 64-bitars tid, blickvinklar, person, 32-bitars grupp, session, filterkolumner och `Källfil`, per rad som ska läsas in – gånger 2,6 när radantalet är en CSV-uppskattning, för en kolumn som växer till en större.
- **Varje fil reserverar sin kostnad innan den startar** (`fileParseBytes`): dess rader (från Parquet-fotnoten; en CSV-fils del av uppskattningen efter storlek) gånger samma kolumner, gånger **8** – blocket i sig, kopian bredvid det medan rader utan position tas bort, och avkodarens arbetsmängd, som för textkolumner är långt större än deras id:n. Ett steg minskar inte detta, eftersom filer läses helt och gallras efteråt. Åttan är en marginal satt genom mätning: vid 3, eller vid 5, drev trettio tolkningstrådar en flik över dess gräns på 86 miljoner rader med person- och sessionsnamn; vid 8 gjorde de inte det.
- **En annan fil startar bara om dess reservation ryms** i det som är kvar. En fil som är klar men väntar på att en tidigare ska slås samman behåller sin reservation tills den slagits samman.
- **En fil körs alltid.** När inget är reserverat startar nästa fil oavsett vad den kostar – det är den en-i-taget-inläsning som passningskontrollen godkände, så en snäv budget faller tillbaka på den i stället för att vägra.

Figuren *topp vid inläsning* är toppen för en en-i-taget-inläsning, som kommer vid sorteringen, efter att varje fil lästs. Filer som tolkas sida vid sida kan ta mer minne än den figuren medan de läses; reservationerna håller det inom RAM-budgeten, i den mån uppskattningarna ovan stämmer.

Sammanslagningsordningen är urvalets ordning, oavsett i vilken ordning filerna blir klara, så numreringen av person, grupp och session, raderna och värdena i `Källfil` är identiska med en en-i-taget-inläsning. En fil som inte kan läsas hoppas över och listas precis som förut. En tolkningsarbetare som dör avslutar hela inläsningen, som inmatningsarbetarens död alltid gjort, och varje tolkningsarbetare avslutas när inläsningen slutar, hur den än slutar. Om tolkningsarbetare inte alls kan startas tolkas filerna i stället i inmatningsarbetaren.

### Hur siffrorna upptäcks {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) körs vid uppstart, en gång till när renderaren finns, och vid **Identifiera igen**.

**RAM, med utvecklingsservern.** `start.bat` och `npm run dev` serverar sidan från en process som kan läsa datorns minne, på `/__host/memory` (svarar inom 1,5 s, annars ignoreras det). Standardvärdet är det mindre av 60 % av installerat RAM och 80 % av det som är ledigt just nu; taket är 60 % av installerat. När ledigt minne är det som håller standardvärdet nere säger panelen det och föreslår att du stänger program och trycker på **Identifiera igen**.

**RAM, utan den** (en statisk publicering): ingen webbläsar-API rapporterar ledigt minne, och `navigator.deviceMemory` avrundas nedåt till en tvåpotens och begränsas till 8 GiB av Chrome och Edge. Standardvärdet är 60 % av `deviceMemory`, dessutom begränsat till 4 × fliken fria JS-heap där webbläsaren rapporterar en, eller 4 GiB när inget rapporteras. När `deviceMemory` visar exakt 8 (taket) markeras värdet som *begränsat*, och taket är 4 × standardvärdet, med en notis om att värdet över standardvärdet är ditt påstående, inte en mätning.

**Oavsett vilket** begränsas RAM-standardvärdet och -taket till **12 GiB**, det mest typade array-minne en Chrome-flik kan hålla oavsett vad datorn har (en sida nådde cirka 15,75 GB och misslyckades; 12 lämnar utrymme för allt annat), och går aldrig under 256 MiB.

**GPU-minne.** Inget webb-API rapporterar det alls.

- Med utvecklingsservern läses kortets minne av `nvidia-smi` (den största adaptern) eller, på Windows, från drivrutinens registervärde `HardwareInformation.qwMemorySize`. Standardvärdet är 70 % av det, taket 90 %.
- Utan avläsning dras det av: 2 GiB som standard; 4 GiB när den största texturen är 16 384 px eller större (ett diskret kort), 1 GiB när den är mindre; eller 8 × WebGPU:s `maxBufferSize` när det är större. Taket är då 8 × det härledda värdet, eftersom slutsatsen skiljer ett integrerat kort från ett diskret och inget finare. Panelen säger att värdet är härlett.
- Aldrig under 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4 när inget rapporteras).
