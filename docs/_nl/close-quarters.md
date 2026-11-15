---
title: "Nabije gevechten en rondes"
parent: "Inzichten"
nav_order: 2
lang: "nl"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Nabije gevechten en rondes

Voor shooters op basis van rondes (Counter-Strike eerst, elke data met rondes, kanten en kills) meet Inzichten hoe de gevechten gewonnen werden: wie de openingsduels nam en wat die waard waren, of doden beantwoord werden, of de speler die een hoek opkwam de speler die die hoek hield versloeg, of kruisvuur en flitsers hun geld waard waren, hoe de kansen op de ronde met elke kill bewogen, en welke deuropeningen de spelers doodden die erdoorheen gingen. Gebruik het om te zien waarom rondes gewonnen werden, niet alleen wie de kills haalde.

De metingen komen uit de doctrine voor het ruimen van kamers en stedelijk gevechtsterrein (de fatale trechter, punten van overheersing, kruisvuur) en uit esports- en sportanalyse (kans om te winnen, waarde van acties, aangepaste plus-minus). Elk wordt gelezen via de [kennislens](knowledge.md) en geciteerd.

## Probeer het {#try-it}

1. Laad een of meer matches met rondes (een CS2-conversie heeft alles wat nodig is).
2. Open **Inzichten** en druk op **Inzichten zoeken**.
3. Lees onder **Lensmetingen** de regels van *Kans om de ronde te winnen* tot *Invloed van de speler*; elk heeft zijn cijfers, zijn 95%-interval, zijn q-waarde en de bronnen die het volgt.
4. Kies de lens **Esports** of **Stedelijk** om ze door die literatuur te lezen; **Schrijven met AI** stuurt ze mee met het rapport.

## Wat het meet {#what-it-measures}

| Meting | Wat het zegt | Hoe |
|---|---|---|
| Kans om de ronde te winnen | Hoe waarschijnlijk elke kant de ronde op elk moment won | Logistische regressie op de spelers in leven aan elke kant, de bom of het doel en zijn tijd, de rondeklok en de aankoop, gefit op de geladen data; kalibratie buiten de vouw per ronde gecontroleerd (Brier-score en vaardigheid, log loss, kalibratiefout over tien bakken, helling van de herkalibratie, AUC) |
| Waarde van acties | Hoeveel een kill, een openingskill, een trade, een kill achter een flits, een plant of een flits de kans van de kant om te winnen veranderde | Winstkans na min vóór; trades, openings- en geflitste kills getoetst tegen de andere kills met een permutatietest |
| Openingsduels | Welke kant het eerste duel wint, hoe vaak dat de ronde wint, en waar één kant openingen ver boven haar eigen gemiddelde wint | Wilson-intervallen; plekken met een exacte binomiale toets tegen het aandeel van de kant, q over de plekken |
| Trades | Doden die beantwoord worden door een kill van de doder door een teamgenoot binnen 5 s, de tijd die het kostte, en rondes gewonnen als de eerste dood getrade werd | Exacte toets van Fisher, interval van Newcombe |
| Peeker tegen houder | Duels waarin de ene speler de strijd in bewoog (1,5 m/s of meer over de laatste seconde) en de andere stilhield (0,75 m/s of minder): het aandeel van de peeker | Exacte binomiale toets tegen de helft |
| Mikken vóór het duel | Het zicht van elke speler tegen de richting naar de ander 0,75 s vóór de kill; wie er beter gericht was en hoe vaak die speler won; houders op hun hoek (binnen 15°) tegenover erbuiten; killafstanden | Exacte binomiale toets; Fisher |
| Kruisvuur | Houders met een stilstaande teamgenoot binnen 25 m van de peeker wier lijn erop 35° of meer van hun eigen lijn afwijkt, tegenover houders alleen | Fisher, Newcombe |
| Hulpmiddelen naar entries | Peekers achter een flits van de eigen kant (binnen 3 s en 15 m) of een rookwolk (binnen 18 s) tegenover droge peeks; openingsduels met een flits aan één kant alleen; slachtoffers die verblind werden | Fisher, binomiaal |
| Mannenvoordeel | Voor elke stand van spelers in leven (5v4, 4v5, 2v1...) die als eerste in een ronde bereikt wordt, het aandeel rondes dat daarvandaan gewonnen werd | Wilson-intervallen |
| Clutches | Rondes waarin een kant tot haar laatste speler terugviel: gewonnen tegenover het verwachte aantal van het model, per aantal tegenstanders | Normale toets van waargenomen tegen verwacht |
| Stapels, roteren, loeren | De grootste groep binnen 10 m bij het openingsduel (3 of meer: gestapeld); spelers die meer dan 30 m van het eerste gevecht of het geplante doel stonden en hoe snel ze binnen 12 m kwamen; tijd en kill-tot-doden-kansen meer dan 30 m van elke teamgenoot | Fisher; odds ratio met het interval van Woolf |
| Na de plant en het hertoveren | Rondes gewonnen door de plantende kant, naar de aantallen bij de plant, en haar aandeel in duels na de plant | Wilson-intervallen |
| Fatale trechters | Binnenkomsten in elke plek (een wijziging van de plekkolom, anders van een cel van 8 m) en doden binnen 2,5 s na het binnenkomen, tegenover het percentage van de kaart | Exacte binomiale toets, q over plekken; verhouding gekrompen met 20 binnenkomsten tegen het percentage van de kaart |
| Invloed van de speler | Winstkans toegevoegd per ronde door elke speler (kills, doden, planten), gekrompen met empirische Bayes; ridge-aangepaste plus-minus van rondeuitkomsten tegenover de start van het model; killwaarde per plek en wapen, gekrompen | Straf gekozen door vijfvoudige kruisvalidatie |

Alle toetsen van één analyse delen één fout-ontdekkingspercentage (Benjamini-Hochberg), inclusief elke geprobeerde plek, niet alleen de getoonde plekken; de getoonde q is over al die plekken. Het model en zijn kalibratie worden gefit op de geladen data, dus ze beschrijven die populatie: een professioneel model beoordeelt casual spel verkeerd, en andersom.

Gecontroleerd op synthetische rondes met ingebouwde effecten (het voordeel van een peeker, kruisvuur, flitsers, één fatale trechter, betere mikkers die winnen), en op 100 datasets van dezelfde rondes zonder die effecten, waar het fout-ontdekkingspercentage van de toetsen met ingebouwde effecten op het nominale 5% moet blijven (binnen een band) (`src/insights/cqb/cqb.test.ts`); op ongeveer duizend echte rondes haalde het model een Brier-score van 0,14 tegenover 0,25 voor het basispercentage, een kalibratiefout van 0,03 en een helling van de herkalibratie van 1,0.

## Data die het nodig heeft {#data-it-needs}

- kolommen **tijd**, **speler**, **kant** en **ronde** (de sessie), en kills en doden in de gebeurteniskolom; rondes waarin niemand twee keer sterft worden als eliminatierondes behandeld (mannenvoordeel, clutches en het model hebben ze nodig);
- een kolom **andere partij** (`other`, `victim`, `killer`, `attacker`) die bij een kill het slachtoffer noemt en bij een dood de doder (zonder die worden kills en doden op hetzelfde moment gekoppeld);
- een **kijkrichting** voor de mikmetingen;
- een ruwe kolom `event` die `flash`, `smoke`, `he`, `molotov`, `plant` en `defuse` noemt, voor hulpmiddelen en planten;
- `won` (de kant van de rij won de ronde), `place` (callouts), `weapon`, `buy` en `state_flashed` waar de data die heeft.

Posities moeten enkele keren per seconde bemonsterd zijn; snelheden, mikken en kruisvuur lezen de laatste twee seconden vóór elke dood.

## In de uitsplitsing {#in-the-breakdown}

De [uitsplitsing](breakdown.md) meet vier van de situaties als factoren, met tegenover zonder: *verblind*, *dood getrade*, *openingsduel* en de aantallen (*man erbij*, *gelijke aantallen*, *man minder*), elk op K/D, gewonnen rondes, overleving en kills per minuut.

## Veel matches {#many-matches}

Elke matchsamenvatting van de [analyse van veel matches](mass-analysis.md) van data met een rondekolom draagt dezelfde metingen als aantallen (`cqb` in de samenvatting): openingsduels, trades, peeks, kruisvuur, geflitste binnenkomsten, mikken, mannenvoordeel, planten en de 40 plekken waar het vaakst binnengegaan wordt, met hun binnenkomsten en doden. Aantallen tellen op over matches, dus duizend matches geven dezelfde aandelen als één grote analyse. Het tabblad **Nabije gevechten** van het paneel toont ze als aandelen met hun intervallen, over alle kaarten of per kaart; een klik op een rij laadt de matches waar ze vandaan kwamen.

## Voor ontwikkelaars {#for-developers}

`src/insights/cqb/`: `walk.ts` (één doorloop over rijen in tijdsvolgorde, rondes apart gehouden, duels opgeslagen met hun toestand), `finish.ts` (de metingen en de aantallen per match), `model.ts` (logistische regressie met IRLS, kalibratie, ridge met geconjugeerde gradiënten, empirische Bayes, Fisher, Newcombe, permutatietoetsen), `run.ts` en `worker.ts` (de viewer: een eigen worker, naast de inzichtdoorloop), `summary.ts` (de verzamelaar van de samenvatting van veel matches), `factors.ts` (de situaties van de uitsplitsing), `shows.ts` (wat de lens leest), `synth.ts` (de testrondes). De kennisitems staan in `src/insights/knowledge/cqb.ts`, de patronen in `patterns-cqb.ts`. De resultaten gaan naar het rapport als `lens.cqb`.
