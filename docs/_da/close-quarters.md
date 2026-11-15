---
title: "Nærkamp og runder"
parent: "Indsigter"
nav_order: 2
lang: "da"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Nærkamp og runder

For rundebaserede skydespil (Counter-Strike først, alle data med runder, sider og drab) måler Indsigter, hvordan kampene blev vundet: hvem der tog åbningsduellerne og hvad de var værd, om dødsfald blev byttet, om spilleren der kiggede frem i et hjørne slog den der holdt det, om krydsild og blink betalte sig, hvordan rundeoddsene bevægede sig med hvert drab, og hvilke døre der slog de spillere ihjel, der gik ind i dem. Brug den til at se, hvorfor runder blev vundet, ikke kun hvem der fik drabene.

Målingerne kommer fra doktrin for rydning af rum og bykamp (den dødelige tragt, dominansens punkter, krydsild) og fra e-sports og sportsanalyse (sandsynlighed for sejr, handlingers værdi, justeret plus-minus). Hver læses gennem [vidensobjektivet](knowledge.md) og citeres.

## Prøv det {#try-it}

1. Indlæs en eller flere kampe med runder (en CS2-konvertering har alt, den behøver).
2. Åbn **Indsigter** og tryk på **Find indsigter**.
3. Under **Linsemål** læser du linjerne fra *Sandsynlighed for rundesejr* til *Spillerens påvirkning*; hver har sine tal, sit 95 %-interval, sin q-værdi og de kilder, den følger.
4. Vælg linsen **E-sport** eller **By** for at læse dem gennem den litteratur; **Skriv med AI** sender dem med rapporten.

## Hvad den måler {#what-it-measures}

| Mål | Hvad det siger | Hvordan |
|---|---|---|
| Sandsynlighed for rundesejr | Hvor sandsynligt hver side var at vinde runden i hvert øjeblik | Logistisk regression på spillerne i live på hver side, bomben eller målet og dets tid, rundeuret og købet, tilpasset de indlæste data; kalibrering kontrolleret ude af fold pr. runde (Brier-score og færdighed, logtab, kalibreringsfejl over ti bins, rekalibreringshældning, AUC) |
| Handlingers værdi | Hvor meget et drab, et åbningsdrab, en byttehandel, et drab bag et blink, en plantning eller et blink ændrede sidens chance for at vinde | Sejrssandsynlighed efter minus før; byttehandler, åbnings- og blinkede drab testet mod de andre drab ved permutation |
| Åbningsduel | Hvilken side der vinder den første duel, hvor ofte det vinder runden, og hvor én side vinder åbninger langt over sit eget gennemsnit | Wilson-intervaller; steder med eksakt binomialtest mod sidens andel, q over steder |
| Byttehandler | Dødsfald besvaret af et holdkammerats drab af dræberen inden for 5 s, hvor lang tid det tog, og runder vundet når første dødsfald blev byttet | Fishers eksakte test, Newcombes interval |
| Den der kigger frem mod holderen | Dueller hvor én spiller bevægede sig ind i kampen (1,5 m/s eller mere i det sidste sekund) og den anden holdt stille (0,75 m/s eller mindre): kiggerens andel | Eksakt binomialtest mod én halvdel |
| Sigte før duellen | Hver spillers blik mod pejlingen til den anden 0,75 s før drabet; hvem der sigtede bedst, og hvor ofte den spiller vandt; holdere på deres vinkel (inden for 15°) mod uden for den; drabsafstande | Eksakt binomialtest; Fisher |
| Krydsild | Holdere med en stille holdkammerat inden for 25 m fra kiggeren, hvis linje mod den er 35° eller mere fra deres egen, mod holdere alene | Fisher, Newcombe |
| Hjælpemidler ind i indgange | Kiggere bag et blink fra deres egen side (inden for 3 s og 15 m) eller en røg (inden for 18 s) mod tørre kig; åbningsduellere med et blink på kun den ene side; blindede ofre | Fisher, binomial |
| Mandsfordel | For hver tilstand af spillere i live (5v4, 4v5, 2v1 ...) først nået i en runde, andelen af runder vundet derfra | Wilson-intervaller |
| Clutches | Runder hvor en side endte med sin sidste spiller: sejre mod modellens forventede sejre, efter antal modstandere | Normaltest af observeret mod forventet |
| Stakke, rotationer, lurk | Den største gruppe inden for 10 m ved åbningsduellen (3 eller flere: stablet); spillere over 30 m fra den første kamp eller det plantede mål og hvor hurtigt de kommer inden for 12 m; tid og drab-mod-dødsfald-odds mere end 30 m fra alle holdkammerater | Fisher; oddskvotient med Woolfs interval |
| Efter plantning og generobring | Runder vundet af den side, der plantede, efter tallene ved plantningen, og dens andel af duellerne efter plantningen | Wilson-intervaller |
| Dødelige tragter | Indgange til hvert sted (en ændring i stedskolonnen, ellers i en 8 m celle) og dødsfald inden for 2,5 s efter indgang, mod kortets rate | Eksakt binomialtest, q over steder; forhold krympet med 20 indgange til kortets rate |
| Spillerens påvirkning | Sandsynlighed for sejr tilføjet pr. runde af hver spiller (drab, dødsfald, plantninger), krympet med empirisk Bayes; ridge-justeret plus-minus af rundeudfald mod modellens start; drabsværdi efter sted og våben, krympet | Straf valgt ved femfold krydsvalidering |

Alle testene i én analyse deler én falsk-opdagelsesrate (Benjamini-Hochberg), med alle de testede steder med, ikke kun de viste; den viste q er over alle dem. Modellen og dens kalibrering er tilpasset de indlæste data, så de beskriver den population: en professionel model fejlbedømmer uformelt spil, og omvendt.

Kontrolleret på syntetiske runder med indlagte effekter (en kiggers fordel, krydsild, blink, én dødelig tragt, bedre sigte der vinder), og på 100 datasæt med de samme runder uden dem, hvor falsk-opdagelsesraten for testene med indlagte effekter skal blive på det nominelle 5 % (inden for et bånd) (`src/insights/cqb/cqb.test.ts`); på omkring tusind rigtige runder scorede modellen en Brier-score på 0,14 mod 0,25 for grundraten, en kalibreringsfejl på 0,03 og en rekalibreringshældning på 1,0.

## Data den har brug for {#data-it-needs}

- kolonnerne **tid**, **spiller**, **side** og **runde** (sessionen), og drab og dødsfald i hændelseskolonnen; runder hvor ingen dør to gange behandles som eliminationsrunder (mandsfordel, clutches og modellen har brug for dem);
- en kolonne for **den anden part** (`other`, `victim`, `killer`, `attacker`), der navngiver offeret ved et drab og dræberen ved et dødsfald (uden den parres drab og dødsfald i samme øjeblik);
- en **blikretning** til sigtemålene;
- en rå `event`-kolonne, der navngiver `flash`, `smoke`, `he`, `molotov`, `plant` og `defuse` til hjælpemidler og plantninger;
- `won` (rækkens side vandt runden), `place` (callouts), `weapon`, `buy` og `state_flashed`, hvor dataene har dem.

Positioner bør samples flere gange i sekundet; hastigheder, sigte og krydsild læser de sidste to sekunder før hvert dødsfald.

## I nedbrydningen {#in-the-breakdown}

[Nedbrydningen](breakdown.md) måler fire af situationerne som faktorer, med mod uden: *blindet*, *dødsfald byttet*, *åbningsduel* og tallene (*mand op*, *lige tal*, *mand ned*), hver på K/D, runder vundet, overlevelse og drab pr. minut.

## Mange kampe {#many-matches}

Hvert kampresumé fra [analysen af mange kampe](mass-analysis.md) af data med en rundekolonne bærer de samme målinger som tællinger (`cqb` i resuméet): åbningsduel, byttehandler, kig, krydsild, blinkede indgange, sigte, mandsfordel, plantninger og de 40 mest besøgte steder med deres indgange og dødsfald. Tællinger lægges sammen over kampe, så tusind kampe giver de samme andele som én stor analyse. Panelets fane **Nærkamp** viser dem som andele med deres intervaller, over alle kort eller pr. kort; et klik på en række indlæser de kampe, den kom fra.

## Til udviklere {#for-developers}

`src/insights/cqb/`: `walk.ts` (ét gennemløb af rækkerne i tidsorden, runder holdt adskilt, duellerne optaget med deres tilstand), `finish.ts` (målene og tællingerne pr. kamp), `model.ts` (logistisk regression ved IRLS, kalibrering, ridge med konjugerede gradienter, empirisk Bayes, Fisher, Newcombe, permutationstest), `run.ts` og `worker.ts` (vieweren: sin egen worker, ved siden af indsigt-gennemløbet), `summary.ts` (opsamleren til resuméet for mange kampe), `factors.ts` (nedbrydningens situationer), `shows.ts` (hvad linsen læser), `synth.ts` (testrunderne). Videnspostene ligger i `src/insights/knowledge/cqb.ts`, mønstrene i `patterns-cqb.ts`. Resultaterne går ind i rapporten som `lens.cqb`.
