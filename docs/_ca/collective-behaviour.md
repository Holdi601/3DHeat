---
title: "Comportament col·lectiu"
parent: "Troballes"
nav_order: 3
lang: "ca"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---


# Comportament col·lectiu: multituds, bandades, ramats i decisions sota pressió

Els jugadors d'una partida es comporten com la gent a qualsevol lloc: s'agrupen a les portes, segueixen el qui ha anat primer, es mantenen junts o es dispersen, es retiren després de pèrdues fortes, i en assumeixen més risc després d'una mala vida. La **lent de mètriques de comportament** mesura aquests patrons amb els mètodes de la ciència de multituds, la física del moviment col·lectiu, l'economia del comportament i la psicologia militar, cadascun contra el seu propi model nul, i els llegeix a través de les entrades corresponents de la [base de coneixement](knowledge.md).

## Prova-ho {#try-it}

1. Carrega una o més partides amb temps, posicions i equips.
2. Obre **Troballes** i executa-la.
3. Desplega **Mètriques de la lent**: les mesures de comportament apareixen amb les altres
   (Alineació col·lectiva, Ramat de rutes, Carrils i rastres, Aglomeració, Líders i seguidors,
   Cohesió i rezagats, Punt de ruptura, Risc després de pèrdues, Ratxes, Acord de compra, Supressió),
   cadascuna amb els seus números, la seva prova i la bibliografia que la explica.
4. El **Resum** les cita; **Escriu amb IA** les envia amb l'informe.

## Les mesures {#the-measures}

Els rastres es remostregen a un punt cada 2 s (la posició al final del interval
i la velocitat durant ell). Les distàncies s'escalen amb l'espaiat típic de les dades
pròpies - la distància mediana d'una unitat al seu company més proper - de manera que
la mateixa mesura serveix per a infanteria, tancs i avions.

| Mesura | Què mesura | Model nul i prova | Coneixement |
|---|---|---|---|
| Alineació col·lectiva | Polarització (longitud de la direcció mitjana de les unitats) de les unitats en moviment de cada bàndol cada 2 s, remolí (rotació al voltant del centre de massa), proporcions de temps polaritzat, remolí i eixam, per fase de la partida; en combats entre dos bàndols alineats, la part de morts del bàndol més alineat | El rastre propi de cada unitat desplaçat en el temps dins de la partida (manté el seu camí, trenca la simultaneïtat); prova de canvi de signe en finestres de 60 s | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Ramat de rutes | Amb quina freqüència una unitat surt d'un lloc com ho havia fet el company anterior (en 30 s), per la mateixa entrada, contra les proporcions de sortida del mateix lloc - i contra copiar un pas anterior d'un enemic | Sortides barrejades dins del lloc i de l'entrada; l'efecte és el company menys la còpia de l'enemic (problema del reflex de Manski: copiar i un pla que el bàndol comparteix es veuen iguals) | Banerjee 1992, Bikhchandani et al. 1992, Manski 1993 |
| Carrils i rastres | Segregació lateral de les dues direccions en llocs amb contracorrent; proporció del moviment en el 10% del terreny més transitat, el seu Gini, i la superposició del terreny més transitat de les partides | Direccions barrejades entre visites senceres; dues graelles desplaçades mig lloc, cadascuna provada, Bonferroni | Helbing et al. 1997, 2005 |
| Aglomeració | Velocitat (relativa al pas propi de la unitat) i flux segons el nombre de veïns a menys del doble de l'espaiat típic, la caiguda de capacitat a la classe més densa, al terreny més transitat; morts per hora en multituds; trets per minut de companys propers (*social loafing*) | La correlació velocitat-densitat pròpia de cada unitat, canvi de signe sobre unitats, efecte mínim ρ més enllà de ±0,05; proves exactes de taxa | Helbing et al. 2000, Seyfried et al. 2005, Latané et al. 1979 |
| Líders i seguidors | Per a companys que viatgen junts, el retard en el temps (fins a 8 s) en què la direcció d'un prediu millor la de l'altre; graf de líders, transitivitat de les tríades, taxes de mort i de mort dels líders | Parells amb un rastre desplaçat en el temps donen el llindar del 95%; prova binomial contra el 5% | Nagy et al. 2010, Couzin et al. 2005 |
| Cohesió i rezagats | Temps passat a més de tres vegades l'espaiat típic del bàndol del company més proper; taxa de mort allà contra amb el grup; l'espaiat d'un bàndol contra la seva part de morts en un combat | Prova condicional exacta de dues taxes de Poisson | Shils i Janowitz 1948, Siebold 2007 |
| Punt de ruptura | Velocitat d'aproximació cap a l'enemic (al pas del bàndol) segons la proporció del bàndol perduda en l'últim minut; el nivell de pèrdues més baix al qual els bàndols es retiren | Bootstrap de clúster unilateral contra una retirada d'una desena part del pas (les pèrdues arriben on els bàndols es troben, i els bàndols que es troben deixen de tancar la distància), Bonferroni sobre els nivells | Dupuy 1987, Rowland 2006 |
| Risc després de pèrdues | Proporció de la vida següent passada davant del propi bàndol cap a l'enemic, per sobre de la proporció pròpia del bàndol i d'altres unitats que tornen en aquell moment: després d'una vida perduda sense mort contra després d'una amb mort; mort primerenca després de mort primerenca (inclinació) | Les vides de cada unitat barrejades (es manté la primera vida), de manera que el biaix de seqüència finita és dins del model nul | Kahneman i Tversky 1979, Thaler i Johnson 1990 |
| Ratxes | P(mort després de k morts) − P(mort després de k morts de l'altre), k = 1..3 | La seqüència de cada jugador barrejada 1.000 cops: es resta el biaix que van mostrar Miller i Sanjurjo; Bonferroni sobre k | Gilovich et al. 1985, Miller i Sanjurjo 2018 |
| Acord de compra | Kappa de Fleiss de les franges d'equipament (eco, força, complet; tercils fora del Counter-Strike) dins de la ronda d'un bàndol | Les rondes-jugador del bàndol barrejades entre les seves rondes | Fleiss 1971 |
| Supressió | Velocitat en els 4 s després del dany no mortal contra els 4 s abans, i trets en els 10 s després contra abans, en els impactes i en els moments tranquils de la mateixa unitat | Canvi de signe sobre unitats, efectes mínims de 0,05 del pas i un tret per minut | Rowland 2006 |

Cada p-valor de l'informe passa per la taxa de descobriment fals de Benjamini-Hochberg
(`q`). Una mesura s'omet quan les dades no la poden sostenir: calen rondes i valors
d'equipament per a l'acord de compra, esdeveniments de dany per a la supressió, morts
i baixes atribuïdes a unitats per a les ratxes i el risc.

## A l'anàlisi de massa {#in-the-mass-analysis}

Cada resum de partida (`<match>.summary.json`, mira
[Anàlisi de massa](mass-analysis.md)) porta les mateixes mesures per a aquella partida
a la seva secció `behaviour`, de manera que es poden comparar milers de partides sense
tornar a llegir les seves files.

## Com funciona bé {#how-well-it-works}

Sobre batalles simulades amb cada efecte construït dins, i els mateixos mons sense ell
(`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): cada mesura troba el seu efecte
plantat, i els mons nuls es mantenen per sota del llindar de descobriment fals. Risc després
de pèrdues té la menor potència; el ramat de rutes no pot distingir la còpia d'un pla
compartit (un bàndol que comparteix un objectiu és "ramat" segons aquesta mesura).

## Per a desenvolupadors {#for-developers}

- `src/insights/behaviour/acc.ts` - l'acumulador (rastres remostrejats, esdeveniments,
  rondes) i `finish`; `motion.ts` i `choice.ts` les mesures;
  `bstats.ts` els ajudants de permutació, bootstrap i kappa; `shows.ts` els patrons
  i les frases que llegeix la lent (`lens.<measure>`).
- `feed.ts` l'alimenta des dels blocs del worker de troballes; `summaryTap.ts` des d'un
  resum de partida mentre en fa el flux de la taula.
- Coneixement: `src/insights/knowledge/behaviour.ts` (entrades),
  `patterns-behaviour.ts`, `refs-behaviour.ts` (referències, cadascuna comprovada
  contra el seu registre a Crossref o Open Library).
- Etiquetes: `lens.metric.<measure>` a `locales/*/lens.json`.
