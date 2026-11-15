---
title: "Sampling og budgetter"
parent: "Renderingens indre"
nav_order: 3
lang: "da"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Sampling og budgetter

Når der er for mange prikker til at tegne i ét billede, tegner viseren en jævn stikprøve og gør hver prik vigtigere, så billedet stadig er rigtigt. En regulator justerer, hvor mange den tegner, så viseren holder sin billedfrekvens.

## Ydelsespanelets indstillinger {#performance-panel-controls}

| Indstilling | Standard | Interval (skyder) |
|---|---|---|
| **Tegn alle rækker i hvert billede** | til | |
| **Adaptivt budget** | til | |
| **Mål-FPS** | 60 | 20-240 (1000) |
| **Start-sprites / billede** (adaptiv) eller **Sprites / billede** | 4,00M | 65.536-268.435.456, logaritmisk (268.435.456) |
| **Varmeopløsning** | 100 % | 25-100 %, ganget med den adaptive trin-to-skala |
| **Progressiv forfining** | til | Fra: hvert billede er et friskt enkeltbilledskøn (nyttigt til at se den rå stikprøve). |

Se også [Ydelsespanel og statistik-overlejring](performance-and-stats.md).

## For udviklere {#for-developers}

### Kandidatrækker {#candidate-rows}

Rækker gemmes i stigende tidsorden. Tidslinjevinduet [*lo*, *hi*] bliver til et rækkeinterval med to binære søgninger over tidskolonnen ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); uden tidskolonne er hver række en kandidat. Det er **Rækker i vinduet** i statistik-overlejringen. Tests pr. række - filtre, grupper, opdeling, afskæring, udsnit, levetid - sker senere i shaderen; en række, der fejler, koster ét vertex-kald og ingen fragmenter.

### Samplingplanen {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) deler kandidatintervallet op i **blokke på 4.096 rækker i træk** og vælger, hvor mange der skal tegnes ud fra billedets spritebudget:

- Dækker budgettet alle blokke, tegnes de alle - billedet er rigtigt.
- Ellers tages blokke med en jævn skridtlængde hen over intervallet, forskudt med en jitter, der rykker den gyldne snit hvert billede, så på hinanden følgende billeder dækker forskellige blokke, og foreningen udfylder jævnt. Det er en **stratificeret** stikprøve: hver del af tidsintervallet er repræsenteret i hvert billede.

Hver tegnet række's varme ganges med **kandidater / indsendte**, så billedets forventede varme er rigtig ved ethvert budget; kun støjen afhænger af budgettet. Rækker ligger i bidder på 8.388.608 (se [GPU-hukommelsesresidens](gpu-memory.md)); en blok deles, hvor den krydser en bid, og hver bid får listen over blokstarter, den skal tegne.

En plan kan højst bære 65.536 blokke - 268.435.456 sprites - fordi begge backends har en fast buffer med 65.536 blokstarter. En større forespørgsel begrænses dertil, og manglen viser sig ærligt som flere billeder, før det konvergerer.

### Tegn alle rækker i hvert billede {#draw-every-row-each-frame}

**Ydelse → Tegn alle rækker i hvert billede** (standard **til**): budgettet bliver et gulv i stedet for et loft, og et billede, der starter et friskt skøn, tegner hver række, det har ansvar for (op til loftet på 268M).

Grunden: en kamerabevægelse kasserer akkumuleringen, så et billede i bevægelse er et enkelt skøn, hvis støj er sat af, hvor meget af dataene det tegnede - med en fjerdedel tegnet ser du en fjerdedel af dem som lyse vægtede prikker, og det er det, der får en bevægelig visning til at glimte. At tegne alt gør hvert billede til det færdige billede. Prisen er, at billedtiden nu følger størrelsen af dataene i vinduet; håndtagene er et smallere tidsvindue, filtre eller en afstandsafskæring, som reducerer kandidaterne i stedet for at sample dem tyndere.

Slå den fra på hardware, der ikke har råd til hele feltet på én gang: *Sprites / billede* er så en reel grænse, og visningen konvergerer over nogle få stille billeder i stedet.

Hvad en fuld plan koster, målt på en højtydende desktop-GPU med et 4K-lærred og en stor bane, med sprites på 1 m radius (en eller to pixels): nogenlunde 100M sprites pr. billede ved 30 fps, 200M ved 15 fps og maksimum på 268M ved omkring 12 fps. Med så små sprites er vertex-trinnet hele omkostningen, og varmeopløsningen ændrer intet; med store sprites er det fyldet: 8M sprites med 100 m radius tog 2,5 s pr. billede ved fuld varmeopløsning og 170 ms ved 25 %. **Tegn alle rækker i hvert billede** starter derfor på 67M og stiger med en fjerdedel pr. billede, mens billederne tager under 150 ms, og halveres, mens de tager over 400 ms, så en tung visning ikke kan køre et billede længere, end GPU'ens watchdog tillader.

### Det adaptive budget {#the-adaptive-budget}

**Ydelse → Adaptivt budget** (standard til) justerer spritebudgettet, så det holder **Mål-FPS** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Det er inaktivt i boksreplay og under videorendering.

Input er billedtiden, udjævnet (90 % forrige + 10 % ny, med enkeltbilleder begrænset til 2 s), mod et mål på 1000 / max(15, mål-FPS) ms.

**Trin ét - sprites.** Hvert billede ganges budgettet med `1 + (mål / billede - 1) × forstærkning`, med en forstærkning på 0,35, når det er for langsomt, og 0,08, når der er luft; klemt til en faktor på 0,5-1,25 pr. billede og til 65.536-268.435.456 sprites.

**Trin to - opløsning.** Kun når budgettet allerede er på sit gulv, og billederne stadig er mere end 10 % for langsomme, falder varmebufferens opløsning med 8 % pr. billede, ned til 25 % af lærredet; den kommer tilbage med 4 % pr. billede, mens der er 30 % luft. Fragmentomkostningen falder med kvadratet på opløsningen, hvilket næsten er usynligt under en blød rampe. (Målt med softwarerendering med 10M rækker og overdimensionerede sprites: 141 ms → 17 ms pr. billede.) Skalaen rundes til sekstendedele; overlejringens *Varmeopl.* viser den.

**At give op.** Et langsomt billede ser ens ud, uanset om sprites forårsagede det, eller en tung bane gjorde - der er ingen timing pr. gennemløb. Sidder budgettet på sit gulv, og billederne bliver under 70 % af målet i 30 billeder, var det ikke sprites, der var omkostningen: regulatoren skifter til **klatring**, ganger budgettet med 1,5 hver 14. billede og gendanner opløsningen, så længe billedtiden holder sig inden for 1,5 gange det, den var på gulvet. En klatring, der gør det værre end det, skærer tilbage til 60 % og genoptager normal regulering; når målet nås, slutter klatringen.

Med det adaptive budget slået fra er budgettet simpelthen **Sprites / billede**.

Med *Tegn alle rækker i hvert billede* til kører det adaptive budget stadig, men den eksakte regel hæver budgettet, så det dækker alle kandidatrækker; i praksis styrer det kun opløsningstrinnet og billeder, der ikke starter et friskt skøn.
