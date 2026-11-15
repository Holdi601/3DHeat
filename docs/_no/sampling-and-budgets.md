---
title: "Sampling og budsjetter"
parent: "Rendering i detalj"
nav_order: 3
lang: "no"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Utvalg og budsjetter

Når det er for mange prikker til å tegne i ett bilde, tegner visningen et jevnt utvalg og gjør at hver prikk teller for mer, slik at bildet forblir riktig. En regulator justerer hvor mange den tegner, slik at visningen beholder bildefrekvensen sin.

## Kontrollene i ytelsespanelet {#performance-panel-controls}

| Kontroll | Standard | Område (jog) |
|---|---|---|
| **Tegn hver rad i hvert bilde** | på | |
| **Adaptivt budsjett** | på | |
| **Mål-FPS** | 60 | 20–240 (1000) |
| **Sprites / bilde ved start** (adaptivt) eller **Sprites / bilde** | 4,00 M | 65 536–268 435 456, logaritmisk (268 435 456) |
| **Varmeoppløsning** | 100 % | 25–100 %, ganget med skalaen for adaptivt trinn to |
| **Progressiv forbedring** | på | Av: hvert bilde er et nytt estimat fra ett enkelt bilde (nyttig for å se det rå utvalget). |

Se også [Ytelsespanel og statistikkoverlegg](performance-and-stats.md).

## For utviklere {#for-developers}

### Kandidatrader {#candidate-rows}

Rader lagres i stigende tidsrekkefølge. Tidsvinduet [*lav*, *høy*] blir til et radområde med to binærsøk over tidskolonnen ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); uten tidskolonne er hver rad en kandidat. Dette er **Rader i vinduet** i statistikkoverlegget. Tester per rad – filtre, grupper, deling, avskjæring, skive, levetid – skjer senere, i shaderen; en rad som ikke består, koster ett kall til vertex og ingen fragmenter.

### Utvalgsplanen {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) deler kandidatområdet inn i **blokker på 4 096 etterfølgende rader** og velger hvor mange som skal tegnes, ut fra bildets sprite-budsjett:

- Hvis budsjettet dekker alle blokkene, tegnes alle – bildet er nøyaktig.
- Ellers tas blokkene med et jevnt skritt over området, forskjøvet av en jitter som flytter seg med det gylne snitt hvert bilde, slik at påfølgende bilder dekker ulike blokker og foreningen fylles jevnt ut. Dette er et **lagdelt** utvalg: hver del av tidsområdet er representert i hvert bilde.

Varmen til hver tegnet rad ganges med **kandidater / sendt**, så den forventede varmen i et bilde er nøyaktig ved ethvert budsjett; bare støyen avhenger av budsjettet. Rader ligger i biter på 8 388 608 (se [GPU-minneresidens](gpu-memory.md)); en blokk deles der den krysser en bit, og hver bit får listen over blokkstarter den må tegne.

En plan kan ha høyst 65 536 blokker – 268 435 456 sprites – fordi begge backendene holder en fast buffer med 65 536 blokkstarter. En forespørsel om mer blir begrenset dit, og manglen vises ærlig som flere bilder før konvergens.

### Tegn hver rad i hvert bilde {#draw-every-row-each-frame}

**Ytelse → Tegn hver rad i hvert bilde** (standard **på**): budsjettet blir et gulv i stedet for et tak, og et bilde som starter et nytt estimat tegner hver rad det har ansvar for (opptil taket på 268 M).

Grunnen: en kamerabevegelse forkaster akkumuleringen, så et bevegelsesbilde er ett estimat der støyen settes av hvor mye av dataene det tegnet – med en fjerdedel tegnet ser du en fjerdedel av dem i lyse vektede prikker, og det er det som får en bevegelig visning til å glitre. Å tegne alt gjør hvert bilde til det ferdige bildet. Prisen er at bildetiden nå følger størrelsen på dataene i vinduet; hendelene er et smalere tidsvindu, filtre eller en avskjæring etter avstand, som reduserer kandidatene i stedet for å utvalge dem tynnere.

Slå den av på maskinvare som ikke har råd til hele feltet på en gang: *Sprites / bilde* er da en reell grense, og visningen konvergerer over noen få stillestående bilder i stedet.

Hva en full plan koster, målt på en skrivebords-GPU i toppklassen med et 4K-lerret og et stort nivå, med sprites på 1 m radius (en eller to piksler): omtrent 100 M sprites per bilde ved 30 fps, 200 M ved 15 fps, og maksimum 268 M ved omtrent 12 fps. Med så små sprites er toppunktsfasen hele kostnaden, og varmeoppløsningen endrer ingenting; med store sprites er det fyllingen som teller: 8 M sprites med 100 m radius tok 2,5 s per bilde ved full varmeoppløsning og 170 ms ved 25 %. **Tegn hver rad i hvert bilde** starter derfor på 67 M og stiger med en fjerdedel per bilde så lenge bildene tar under 150 ms, og halveres når de tar over 400 ms, slik at en tung visning ikke kan presse et bilde forbi det GPU-ens watchdog tillater.

### Det adaptive budsjettet {#the-adaptive-budget}

**Ytelse → Adaptivt budsjett** (standard på) justerer sprite-budsjettet slik at det holder **Mål-FPS** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Det er inaktivt i boksreprisen og under videorendering.

Inngangen er bildetiden, utjevnet (90 % tidligere + 10 % nytt, med enkeltbilder begrenset til 2 s), mot et mål på 1000 / maks(15, mål-FPS) ms.

**Trinn én – sprites.** Hvert bilde ganges budsjettet med `1 + (mål / bilde - 1) × forsterkning`, med forsterkning 0,35 når det er for tregt og 0,08 når det er rom igjen, begrenset til en faktor på 0,5–1,25 per bilde og til 65 536–268 435 456 sprites.

**Trinn to – oppløsning.** Bare når budsjettet allerede er på gulvet og bildene fortsatt er mer enn 10 % for trege, synker varmebufferens oppløsning med 8 % per bilde, ned til 25 % av lerretet; den går opp igjen med 4 % per bilde når det er 30 % rom igjen. Fragmentkostnaden faller med kvadratet av oppløsningen, noe som knapt er synlig under en myk rampe. (Målt med programvarerendering med 10 M rader og for store sprites: 141 ms → 17 ms per bilde.) Skalaen avrundes til sekstendedeler; overlegget viser den som *Varmeoppl.*

**Gi opp.** Et tregt bilde ser likt ut enten sprites forårsaket det eller et tungt nivå gjorde det – det finnes ingen tidtaking per gjennomgang. Hvis budsjettet står på gulvet og bildene blir under 70 % av målet i 30 bilder, var det ikke sprites som kostet: regulatoren går over til **klatring**, og ganger budsjettet med 1,5 hvert 14. bilde og gjenoppretter oppløsningen, så lenge bildetiden holder seg innen 1,5 ganger det den var på gulvet. En klatring som gjør det verre enn det, går tilbake til 60 % og gjenopptar vanlig styring; når målet nås, avsluttes klatringen.

Med det adaptive budsjettet av, er budsjettet ganske enkelt **Sprites / bilde**.

Med *Tegn hver rad i hvert bilde* på, kjører det adaptive budsjettet fortsatt, men den nøyaktige regelen hever budsjettet til å dekke alle kandidatradene, så i praksis styrer det bare oppløsningstrinnet og bilder som ikke starter et nytt estimat.
