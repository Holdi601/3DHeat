---
title: "Combat a curta distància i rondes"
parent: "Troballes"
nav_order: 2
lang: "ca"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Combat proper i rondes

Per als tiradors per rondes (Counter-Strike primer, qualsevol dada amb rondes, bàndols i morts), Troballes mesura com es van guanyar els combats: qui va guanyar els duels d'obertura i quant valien, si les morts es van intercanviar, si el jugador que treu el cap per un angle va guanyar al que el sosté, si els foc creuats i els flaixos van valer la pena, com es van moure les probabilitats de la ronda amb cada baixa, i quines portes van matar els jugadors que hi entraven. Useu-la per veure per què es van guanyar les rondes, no només qui va fer les baixes.

Les mesures surten de la doctrina de neteja d'habitacions i de combat urbà (l'embut mortal, els punts de domini, el foc creuat) i de l'analítica d'esports i de l'esport (probabilitat de guanyar, valor de les accions, més-menys ajustat). Cada una es llegeix a través de la [lent del coneixement](knowledge.md) i es cita.

## Proveu-ho {#try-it}

1. Carregueu una o més partides amb rondes (una conversió de CS2 té tot el que necessita).
2. Obriu **Troballes** i premeu **Cercar troballes**.
3. Sota **Mètriques de la lent**, llegiu les línies des de *Probabilitat de guanyar la ronda* fins a *Impacte del jugador*; cadascuna té els seus números, el seu interval del 95 %, el seu valor q i les fonts que segueix.
4. Trieu la lent **Esports** o **Urbà** per llegir-les a través d'aquella literatura; **Escriu amb IA** les envia amb l'informe.

## Què mesura {#what-it-measures}

| Mesura | Què diu | Com |
|---|---|---|
| Probabilitat de guanyar la ronda | Com de probable era que cada bàndol guanyés la ronda a cada moment | Regressió logística sobre els jugadors vius de cada bàndol, la bomba o l'objectiu i el seu temps, el rellotge de la ronda i la compra, ajustada a les dades carregades; calibratge comprovat fora de la mostra per ronda (puntuació de Brier i habilitat, pèrdua logarítmica, error de calibratge sobre deu intervals, pendent de recalibratge, AUC) |
| Valor de les accions | Quant una baixa, una baixa d'obertura, un intercanvi, una baixa darrere d'un flaix, una col·locació o un flaix va canviar la probabilitat de guanyar del bàndol | Probabilitat de guanyar després menys abans; intercanvis, obertures i baixes encegades comprovats contra les altres baixes per permutació |
| Duels d'obertura | Quin bàndol guanya el primer duel, amb quina freqüència això guanya la ronda, i on un bàndol guanya obertures molt per sobre de la seva mitjana pròpia | Intervals de Wilson; llocs per la prova binomial exacta contra la part del bàndol, q sobre els llocs |
| Intercanvis | Morts contestades per una baixa d'un company sobre l'assassí dins de 5 s, el temps que va trigar, i rondes guanyades quan la primera mort es va intercanviar | Prova exacta de Fisher, interval de Newcombe |
| Qui avança contra qui aguanta | Duels on un jugador es va moure cap al combat (1,5 m/s o més durant l'últim segon) i l'altre es va quedar quiet (0,75 m/s o menys): la part de qui avança | Prova binomial exacta contra la meitat |
| Punteria abans del duel | La mirada de cada jugador contra la direcció cap a l'altre 0,75 s abans de la baixa; qui estava millor apuntat i amb quina freqüència aquell jugador va guanyar; els que aguanten al seu angle (dins de 15°) contra els que no hi són; rangs de baixa | Prova binomial exacta; Fisher |
| Foc creuat | Els que aguanten amb un company quiet dins de 25 m de qui avança, la línia del qual cap a ell és de 35° o més fora de la seva pròpia, contra els que aguanten sols | Fisher, Newcombe |
| Utilitats en les entrades | Qui avança darrere d'un flaix del seu propi bàndol (dins de 3 s i 15 m) o d'un fum (dins de 18 s) contra els avanços sense cobertura; duels d'obertura amb un flaix només en un bàndol; víctimes encegades | Fisher, binomial |
| Avantatge d'home | Per a cada estat de jugadors vius (5v4, 4v5, 2v1...) assolit primer en una ronda, la part de rondes guanyades des d'allà | Intervals de Wilson |
| Remuntades | Rondes on un bàndol va quedar amb el seu últim jugador: victòries contra les victòries esperades pel model, per nombre d'adversaris | Prova normal de l'observat contra l'esperat |
| Apilaments, rotacions, emboscades | El grup més gran dins de 10 m en el duel d'obertura (3 o més: apilat); jugadors a més de 30 m del primer combat o de l'objectiu col·locat i amb quina rapidesa s'hi acosten dins de 12 m; temps i probabilitats de baixa/mort a més de 30 m de cada company | Fisher; raó de probabilitats amb l'interval de Woolf |
| Després de la col·locació i recuperació | Rondes guanyades pel bàndol que col·loca, segons els números en el moment de la col·locació, i la seva part de duels després de la col·locació | Intervals de Wilson |
| Embuts mortals | Entrades a cada lloc (un canvi de la columna de lloc, o si no d'una cel·la de 8 m) i morts dins de 2,5 s d'entrar, contra la taxa del mapa | Prova binomial exacta, q sobre els llocs; raó contreta amb 20 entrades a la taxa del mapa |
| Impacte del jugador | Probabilitat de guanyar afegida per ronda per cada jugador (baixes, morts, col·locacions), contreta per Bayes empíric; més-menys ajustat per cresta dels resultats de ronda contra l'inici del model; valor de baixa per lloc i arma, contret | Penalització triada per validació creuada de cinc particions |

Totes les proves d'una anàlisi comparteixen una mateixa taxa de falsos descobriments (Benjamini-Hochberg), amb tots els llocs provats incloses, no només els que es mostren; el q que es mostra és sobre tots ells. El model i el seu calibratge s'ajusten a les dades carregades, de manera que descriuen aquella població: un model professional jutja malament el joc casual, i a l'inrevés.

Comprovat amb rondes sintètiques amb efectes sembrats (l'avantatge de qui avança, els foc creuats, els flaixos, un embut mortal, una punteria millor que guanya), i en 100 conjunts de dades de les mateixes rondes sense ells, on la taxa de falsos descobriments de les proves dels efectes sembrats ha de quedar en el 5 % nominal (dins d'una banda) (`src/insights/cqb/cqb.test.ts`); en unes mil rondes reals el model va puntuar un Brier de 0,14 contra 0,25 de la taxa base, un error de calibratge de 0,03 i un pendent de recalibratge d'1,0.

## Dades que necessita {#data-it-needs}

- Les columnes **time**, **player**, **side** i **round** (la sessió), i les baixes i morts a la columna d'esdeveniments; les rondes on ningú no mor dues vegades es tracten com a rondes d'eliminació (l'avantatge d'home, les remuntades i el model les necessiten);
- una columna d'**altra part** (`other`, `victim`, `killer`, `attacker`) que anomena la víctima en una baixa i l'assassí en una mort (sense ella, les baixes i morts en el mateix moment s'aparellen);
- una **direcció de mirada** per a les mesures de punteria;
- una columna `event` en brut que anomena `flash`, `smoke`, `he`, `molotov`, `plant` i `defuse` per a utilitats i col·locacions;
- `won` (el bàndol de la fila va guanyar la ronda), `place` (noms de lloc), `weapon`, `buy` i `state_flashed` quan les dades els tenen.

Les posicions s'haurien de mostrejar diverses vegades per segon; les velocitats, la punteria i els foc creuats llegeixen els dos darrers segons abans de cada mort.

## Al desglossament {#in-the-breakdown}

El [desglossament](breakdown.md) mesura quatre de les situacions com a factors, amb i sense: *encegat*, *mort intercanviada*, *duel d'obertura* i els números (*home de més*, *nombres iguals*, *home de menys*), cadascun sobre K/D, rondes guanyades, supervivència i baixes per minut.

## Moltes partides {#many-matches}

Cada resum de partida de l'[anàlisi de moltes partides](mass-analysis.md) de dades amb una columna de ronda porta les mateixes mesures com a recomptes (`cqb` al resum): duels d'obertura, intercanvis, avanços, foc creuats, entrades amb flaix, punteria, avantatge d'home, col·locacions i els 40 llocs més visitats amb les seves entrades i morts. Els recomptes se sumen entre partides, de manera que mil partides donen les mateixes parts que una anàlisi gran. La pestanya **Combat proper** del panell les mostra com a parts amb els seus intervals, sobre totes les pistes o per pista; un clic en una fila carrega les partides d'on va sortir.

## Per als desenvolupadors {#for-developers}

`src/insights/cqb/`: `walk.ts` (una passada sobre les files en ordre de temps, rondes mantingudes separades, duels registrats amb el seu estat), `finish.ts` (les mètriques i els recomptes per partida), `model.ts` (regressió logística per IRLS, calibratge, cresta amb gradients conjugats, Bayes empíric, Fisher, Newcombe, proves per permutació), `run.ts` i `worker.ts` (el visor: el seu propi treballador, al costat de la passada de troballes), `summary.ts` (el col·lector del resum de moltes partides), `factors.ts` (les situacions del desglossament), `shows.ts` (el que llegeix la lent), `synth.ts` (les rondes de prova). Les entrades de coneixement són a `src/insights/knowledge/cqb.ts`, els patrons a `patterns-cqb.ts`. Els resultats van a l'informe com a `lens.cqb`.
