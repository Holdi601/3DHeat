---
title: "Närstrid och rundor"
parent: "Insikter"
nav_order: 2
lang: "sv"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Närstrid och rundor

För rundbaserade skjutspel (Counter-Strike först, all data med rundor, sidor och dödanden) mäter Insikter hur striderna vanns: vem som tog de öppnande duellerna och vad de var värda, om dödsfall byttes, om spelaren som kikade in i ett hörn slog den som höll det, om korseld och bländare lönade sig, hur rundoddsen rörde sig med varje död, och vilka dörröppningar som dödade spelarna som gick in i dem. Använd den för att se varför rundor vanns, inte bara vem som fick dödarna.

Måtten kommer från rumsrensning och stadsdoktrin (den dödliga tratten, dominansens punkter, korseld) och från esport och idrottsanalys (vinstsannolikhet, värdet av handlingar, justerad plus-minus). Varje mått läses genom [kunskapslinsen](knowledge.md) och hänvisas till.

## Prova {#try-it}

1. Läs in en eller flera matcher med rundor (en CS2-konvertering har allt som behövs).
2. Öppna **Insikter** och tryck på **Hitta insikter**.
3. Under **Linsmått**, läs raderna från *Vinstsannolikhet per runda* till *Spelarpåverkan*; var och en har sina siffror, sitt 95 %-intervall, sitt q-värde och de källor det följer.
4. Välj linsen **Esport** eller **Stad** för att läsa dem genom den litteraturen; **Skriv med AI** skickar dem med rapporten.

## Vad den mäter {#what-it-measures}

| Mått | Vad det säger | Hur |
|---|---|---|
| Vinstsannolikhet per runda | Hur sannolikt varje sida var att vinna rundan vid varje ögonblick | Logistisk regression på spelarna levande på varje sida, bomben eller målet och dess tid, rundklockan och köpet, anpassad till de inlästa data; kalibrering kontrollerad utanför anpassningen per runda (Brier-poäng och skill, log loss, kalibreringsfel över tio fack, rekalibreringslutning, AUC) |
| Värdet av handlingar | Hur mycket ett dödande, ett öppnande dödande, ett byte, ett dödande bakom en bländare, en bomb-plantering eller en bländare ändrade sidans chans att vinna | Vinstsannolikhet efter minus före; byten, öppnande och bländade dödanden prövade mot de andra dödandena med permutation |
| Öppnande duellar | Vilken sida som vinner den första duellen, hur ofta det vinner rundan, och där en sida vinner öppningar långt över sitt eget genomsnitt | Wilson-intervall; platser med exakt binomialtest mot sidans andel, q över platserna |
| Byten | Dödsfall besvarade av en lagkamrats dödande av dödaren inom 5 s, tiden det tog, och rundor vunna när första dödsfallet byttes | Fishers exakta test, Newcombes intervall |
| Kikaren mot den som håller | Duellar där en spelare rörde sig in i striden (1,5 m/s eller mer under den sista sekunden) och den andra stod still (0,75 m/s eller mindre): kikarens andel | Exakt binomialtest mot hälften |
| Sikte före duellen | Varje spelares blick mot riktningen till den andre 0,75 s före dödandet; vem som siktade bäst och hur ofta den spelaren vann; de som höll sitt hörn (inom 15°) mot de som inte gjorde det; dödsavstånd | Exakt binomialtest; Fisher |
| Korseld | Spelare som håller med en stillastående lagkamrat inom 25 m från kikaren vars linje mot den är 35° eller mer från deras egen, mot de som håller ensamma | Fisher, Newcombe |
| Hjälpmedel vid inträden | Kikare bakom en bländare från sin egen sida (inom 3 s och 15 m) eller en rök (inom 18 s) mot torra kikningar; öppnande duellar med en bländare på bara ena sidan; bländade offer | Fisher, binomial |
| Mantalsfördel | För varje läge med levande spelare (5v4, 4v5, 2v1 ...) som först nåddes i en runda: andelen rundor vunna därifrån | Wilson-intervall |
| Clutchar | Rundor där en sida kom ner till sin sista spelare: vinster mot modellens förväntade vinster, efter antal motståndare | Normaltest av observerat mot förväntat |
| Staplingar, rotationer, lurar | Den största gruppen inom 10 m vid den öppnande duellen (3 eller fler: stapling); spelare mer än 30 m från första striden eller det plantade målet och hur fort de kommer inom 12 m; tid och dödsodds mer än 30 m från varje lagkamrat | Fisher; oddskvot med Woolfs intervall |
| Efter plantering och återtagning | Rundor vunna av den plantande sidan, efter siffrorna vid planteringen, och dess andel av duellerna efter planteringen | Wilson-intervall |
| Dödliga tratter | Inträden i varje plats (en ändring i platskolumnen, annars i en 8 m-cell) och dödsfall inom 2,5 s efter inträdet, mot kartans takt | Exakt binomialtest, q över platserna; kvoten krympt med 20 inträden vid kartans takt |
| Spelarpåverkan | Vinstsannolikhet tillagd per runda av varje spelare (dödanden, dödsfall, planteringar), krympt med empirisk Bayes; ridge-justerad plus-minus av rundresultat mot modellens start; dödandets värde per plats och vapen, krympt | Straff valt med femfaldig korsvalidering |

Alla tester i en analys delar ett falskt upptäcktsvärde (Benjamini–Hochberg), med alla prövade platser medräknade, inte bara de som visas; q-värdet som visas gäller över alla dem. Modellen och dess kalibrering anpassas till de inlästa data, så de beskriver den populationen: en professionell modell misstar sig om vanligt spel, och tvärtom.

Kontrollerat på syntetiska rundor med inplanterade effekter (kikarens fördel, korseld, bländare, en dödlig tratt, bättre sikte som vinner), och på 100 dataset av samma rundor utan dem, där det falska upptäcktsvärdet för de inplanterade effekternas tester måste ligga kvar på den nominella 5 % (inom ett band) (`src/insights/cqb/cqb.test.ts`); på cirka tusen verkliga rundor fick modellen en Brier-poäng på 0,14 mot 0,25 för basfrekvensen, ett kalibreringsfel på 0,03 och en rekalibreringslutning på 1,0.

## Data den behöver {#data-it-needs}

- kolumnerna **tid**, **spelare**, **sida** och **runda** (sessionen), och dödanden och dödsfall i händelsekolumnen; rundor där ingen dör två gånger behandlas som eliminationsrundor (mantalsfördel, clutchar och modellen behöver dem);
- en kolumn för **annan part** (`other`, `victim`, `killer`, `attacker`) som anger offret vid ett dödande och dödaren vid ett dödsfall (utan den parar man dödanden och dödsfall som sker samtidigt);
- en **blickriktning** för sikte-måtten;
- en rå kolumn `event` som anger `flash`, `smoke`, `he`, `molotov`, `plant` och `defuse` för hjälpmedel och planteringar;
- `won` (radens sida vann rundan), `place` (callouts), `weapon`, `buy` och `state_flashed` där datan har dem.

Positioner bör samplas flera gånger per sekund; hastigheter, sikte och korseld läser de två sista sekunderna före varje dödsfall.
## I uppdelningen {#in-the-breakdown}

[Uppdelningen](breakdown.md) mäter fyra av situationerna som faktorer, med och utan: *bländad*, *dödsfall bytt*, *öppnande duell* och siffrorna (*man över*, *jämna tal*, *man under*), var och en på K/D, vunna rundor, överlevnad och dödanden per minut.

## Många matcher {#many-matches}

Varje matchsammanfattning i [analysen av många matcher](mass-analysis.md) av data med en rundkolumn bär samma mått som antal (`cqb` i sammanfattningen): öppnande duellar, byten, kikningar, korseld, bländade inträden, sikte, mantalsfördel, planteringar och de 40 mest besökta platserna med deras inträden och dödsfall. Antalen adderas över matcher, så tusen matcher ger samma andelar som en stor analys. Panelens flik **Närstrid** visar dem som andelar med deras intervall, över alla kartor eller per karta; ett klick på en rad laddar de matcher den kom från.

## För utvecklare {#for-developers}

`src/insights/cqb/`: `walk.ts` (en genomgång av raderna i tidsordning, rundor hålls isär, duellar registreras med sitt tillstånd), `finish.ts` (måtten och antalen per match), `model.ts` (logistisk regression med IRLS, kalibrering, ridge med konjugerade gradienter, empirisk Bayes, Fisher, Newcombe, permutationstester), `run.ts` och `worker.ts` (betraktaren: egen arbetsprocess, bredvid genomgången av insikter), `summary.ts` (samlaren för sammanfattningen av många matcher), `factors.ts` (uppdelningens situationer), `shows.ts` (vad linsen läser), `synth.ts` (testrundorna). Kunskapsposterna finns i `src/insights/knowledge/cqb.ts`, mönstren i `patterns-cqb.ts`. Resultaten går in i rapporten som `lens.cqb`.
