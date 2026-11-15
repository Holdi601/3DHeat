---
title: "Nærkamp og runder"
parent: "Innsikt"
nav_order: 2
lang: "no"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Nærkamp og runder

For skytespill med runder (Counter-Strike først, all data med runder, sider og drap) måler Innsikter hvordan kampene ble vunnet: hvem som tok åpningsduellene og hva de var verdt, om dødsfall ble byttet, om spilleren som kikket inn i en vinkel slo den som holdt den, om krysssild og blitser betalte seg, hvordan rundeoddsene beveget seg med hvert drap, og hvilke dører som drepte spillerne som gikk inn i dem. Bruk den for å se hvorfor runder ble vunnet, ikke bare hvem som fikk drapene.

Målene kommer fra doktrinen for rom-rydding og bykamp (den dødelige trakten, dominansepunkter, krysssild) og fra e-sport og idrettsanalyse (vinnersannsynlighet, verdi av handlinger, justert pluss-minus). Hvert leses gjennom [kunnskapslinsen](knowledge.md) og siteres.

## Prøv den {#try-it}

1. Last inn én eller flere kamper med runder (en CS2-konvertering har alt den trenger).
2. Åpne **Innsikter** og trykk **Finn innsikter**.
3. Under **Linsemål** leser du linjene fra *Vinnersannsynlighet i runden* til *Spillerpåvirkning*; hver har sine tall, sitt 95 % intervall, sin q-verdi og kildene den følger.
4. Velg linsen **E-sport** eller **Bykamp** for å lese dem gjennom den litteraturen; **Skriv med AI** sender dem med rapporten.

## Hva den måler {#what-it-measures}

| Mål | Hva det sier | Hvordan |
|---|---|---|
| Vinnersannsynlighet i runden | Hvor sannsynlig hver side var til å vinne runden på hvert øyeblikk | Logistisk regresjon på spillerne i live på hver side, bomben eller målet og dets tid, rundeklokken og innkjøpet, tilpasset dataene som er lastet; kalibrering kontrollert utenfor utvalget per runde (Brier-score og ferdighet, log-tap, kalibreringsfeil over ti intervaller, rekalibreringshelning, AUC) |
| Verdi av handlinger | Hvor mye et drap, et åpningsdrap, et bytte, et drap bak en blits, en plantning eller en blits endret sidens sjanse til å vinne | Vinnersannsynlighet etter minus før; bytter, åpnings- og blittdrap testet mot de andre drapene med permutasjon |
| Åpningsduellene | Hvilken side som vinner den første duellen, hvor ofte det vinner runden, og der en side vinner åpninger langt over sitt eget gjennomsnitt | Wilson-intervaller; steder med eksakt binomial-test mot sidens andel, q over steder |
| Bytter | Dødsfall besvart med et lagkamerats drap av drapsmannen innen 5 s, tiden det tok, og runder vunnet når første dødsfall ble byttet | Fishers eksakte test, Newcombes intervall |
| Kikkeren mot holderen | Dueller der den ene spilleren beveget seg inn i kampen (1,5 m/s eller mer det siste sekundet) og den andre holdt stille (0,75 m/s eller mindre): kikkerens andel | Eksakt binomial-test mot én halvdel |
| Sikte før duellen | Hver spillers sikt mot peilingen til den andre 0,75 s før drapet; hvem som sikte best og hvor ofte den spilleren vant; holdere i sin vinkel (innen 15°) mot utenfor den; drapsavstander | Eksakt binomial-test; Fisher |
| Krysssild | Holdere med en stille lagkamerat innen 25 m fra kikkeren hvis linje mot den er 35° eller mer forskjøvet fra deres egen, mot holdere alene | Fisher, Newcombe |
| Verktøy inn i innganger | Kikkere bak en blits fra sin egen side (innen 3 s og 15 m) eller en røyk (innen 18 s) mot tørre kikk; åpningsdueller med en blits på bare én side; blendede ofre | Fisher, binomial |
| Mannfordel | For hver tilstand av spillere i live (5v4, 4v5, 2v1 …) som først nås i en runde, andelen runder vunnet fra den | Wilson-intervaller |
| Clutcher | Runder der en side kom ned til sin siste spiller: seire mot modellens forventede seire, etter antall motstandere | Normaltest av observert mot forventet |
| Stabler, rotasjoner, lurere | Den største gruppen innen 10 m ved åpningsduellen (3 eller flere: stablet); spillere mer enn 30 m fra første kamp eller det plantede målet og hvor fort de kommer innen 12 m; tid og drap-mot-dødsfall-odds mer enn 30 m fra alle lagkamerater | Fisher; oddsforhold med Woolfs intervall |
| Etter plantingen og retakingen | Runder vunnet av den plantende siden, etter tallene ved plantingen, og dens andel av duellene etter plantingen | Wilson-intervaller |
| Dødelige trakter | Innganger til hvert sted (en endring i stedskolonnen, ellers i en 8 m-celle) og dødsfall innen 2,5 s etter å ha gått inn, mot kartets rate | Eksakt binomial-test, q over steder; forholdet krympet med 20 innganger til kartets rate |
| Spillerpåvirkning | Vinnersannsynlighet lagt til per runde av hver spiller (drap, dødsfall, plantinger), krympet med empirisk Bayes; ridge-justert pluss-minus av rundeutfall mot modellens start; drapsverdi etter sted og våpen, krympet | Straff valgt med fem-delt kryssvalidering |

Alle testene i én analyse deler én falsk oppdagelsesrate (Benjamini-Hochberg), med hvert sted som er prøvd tatt med, ikke bare stedene som vises; q-verdien som vises, er over alle dem. Modellen og dens kalibrering er tilpasset dataene som er lastet, så de beskriver den populasjonen: en profesjonell modell bedømmer uformelt spill feil, og omvendt.

Kontrollert på syntetiske runder med innlagte effekter (en kikkers fordel, krysssild, blitser, én dødelig trakt, bedre sikte som vinner), og på 100 datasett med de samme rundene uten dem, der den falske oppdagelsesraten for testene med innlagte effekter må holde seg på det nominelle 5 % (innenfor et bånd) (`src/insights/cqb/cqb.test.ts`); på rundt tusen ekte runder fikk modellen en Brier-score på 0,14 mot 0,25 for grunnraten, en kalibreringsfeil på 0,03 og en rekalibreringshelning på 1,0.

## Data den trenger {#data-it-needs}

- kolonnene **tid**, **spiller**, **side** og **runde** (økten), og drap og dødsfall i hendelseskolonnen; runder der ingen dør to ganger, behandles som eliminasjonsrunder (mannfordel, clutcher og modellen trenger dem);
- en **annen part**-kolonne (`other`, `victim`, `killer`, `attacker`) som nevner offeret ved et drap og drapsmannen ved et dødsfall (uten den paires drap og dødsfall i samme øyeblikk);
- en **blikkretning** for sikte-målene;
- en rå `event`-kolonne som nevner `flash`, `smoke`, `he`, `molotov`, `plant` og `defuse` for verktøy og plantinger;
- `won` (radens side vant runden), `place` (kallenavn), `weapon`, `buy` og `state_flashed` der dataene har dem.

Posisjoner bør samples flere ganger i sekundet; fart, sikte og krysssild leser de to siste sekundene før hvert dødsfall.

## I oppdelingen {#in-the-breakdown}

[Oppdelingen](breakdown.md) måler fire av situasjonene som faktorer, med mot uten: *blendet*, *dødsfall byttet*, *åpningsduell* og tallene (*mannsoverlegen*, *jevne tall*, *undermannet*), hver på K/D, runder vunnet, overlevelse og drap per minutt.

## Mange kamper {#many-matches}

Hvert kampsammendrag fra [mange-kamp-analysen](mass-analysis.md) av data med en rundekolonne bærer de samme målene som tellinger (`cqb` i sammendraget): åpningsduellene, bytter, kikk, krysssild, blittinnganger, sikte, mannfordel, plantinger og de 40 mest brukte stedene med sine innganger og dødsfall. Tellingene legges sammen over kamper, så tusen kamper gir de samme andelene som én stor analyse. Fanen **Nærkamp** i panelet viser dem som andeler med sine intervaller, over alle kart eller per kart; et klikk på en rad laster kampene den kom fra.

## For utviklere {#for-developers}

`src/insights/cqb/`: `walk.ts` (én gjennomgang av rader i tidsrekkefølge, runder holdt adskilt, dueller registrert med sin tilstand), `finish.ts` (målene og tellingene per kamp), `model.ts` (logistisk regresjon med IRLS, kalibrering, ridge med konjugerte gradienter, empirisk Bayes, Fisher, Newcombe, permutasjonstester), `run.ts` og `worker.ts` (seeren: sin egen arbeider, ved siden av innsiktsgjennomgangen), `summary.ts` (sammendragets innsamler for mange kamper), `factors.ts` (oppdelingens situasjoner), `shows.ts` (det linsen leser), `synth.ts` (testrundene). Kunnskapsoppføringene ligger i `src/insights/knowledge/cqb.ts`, mønstrene i `patterns-cqb.ts`. Resultatene går inn i rapporten som `lens.cqb`.
