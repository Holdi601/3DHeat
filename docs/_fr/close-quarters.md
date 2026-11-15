---
title: "Combats rapprochés et manches"
parent: "Observations"
nav_order: 2
lang: "fr"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Combat rapproché et manches

Pour les jeux de tir par manches (Counter-Strike d'abord, toute donnée avec des manches, des camps et des éliminations), Observations mesure comment les combats ont été gagnés : qui a pris les duels d'ouverture et ce qu'ils valaient, si les morts ont été échangées, si le joueur qui sortait dans un angle battait celui qui le tenait, si les feux croisés et les flashs ont payé, comment les cotes de la manche ont bougé à chaque élimination, et quelles portes ont tué les joueurs qui y entraient. Servez-vous-en pour voir pourquoi les manches ont été gagnées, et pas seulement qui a fait les éliminations.

Les mesures viennent de la doctrine du nettoyage de pièces et du combat urbain (l'entonnoir mortel, les points de domination, les feux croisés) et de l'analyse d'esport et de sport (probabilité de victoire, valeur des actions, plus-moins ajusté). Chacune est lue à travers le [prisme de connaissances](knowledge.md) et citée.

## Essayez {#try-it}

1. Chargez un ou plusieurs matchs avec des manches (une conversion CS2 a tout ce qu'il faut).
2. Ouvrez **Observations** et appuyez sur **Trouver des observations**.
3. Sous **Mesures du prisme**, lisez les lignes de *Probabilité de gagner la manche* à *Impact du joueur* ; chacune a ses chiffres, son intervalle à 95 %, sa valeur q et les sources qu'elle suit.
4. Choisissez le prisme **Esport** ou **Combat urbain** pour les lire à travers cette littérature ; **Rédiger avec l'IA** les envoie avec le rapport.

## Ce qu'elle mesure {#what-it-measures}

| Mesure | Ce qu'elle dit | Comment |
|---|---|---|
| Probabilité de gagner la manche | La probabilité qu'avait chaque camp de gagner la manche à chaque instant | Régression logistique sur les joueurs vivants de chaque camp, la bombe ou l'objectif et son temps, l'horloge de la manche et l'achat, ajustée aux données chargées ; calibration vérifiée hors échantillon par manche (score de Brier et habileté, perte logarithmique, erreur de calibration sur dix classes, pente de recalibrage, AUC) |
| Valeur des actions | De combien une élimination, une élimination d'ouverture, un échange, une élimination derrière un flash, une pose ou un flash a changé la chance de gagner du camp | Probabilité de victoire après moins avant ; échanges, ouvertures et éliminations flashées testés contre les autres éliminations par permutation |
| Duels d'ouverture | Quel camp gagne le premier duel, à quelle fréquence cela gagne la manche, et où un camp gagne les ouvertures bien au-delà de sa propre moyenne | Intervalles de Wilson ; lieux par test binomial exact contre la part du camp, q sur les lieux |
| Échanges | Morts auxquelles un coéquipier répond par une élimination du tueur dans les 5 s, le temps que cela a pris, et manches gagnées quand la première mort a été échangée | Test exact de Fisher, intervalle de Newcombe |
| Joueur qui sort contre joueur qui tient | Duels où un joueur est entré dans le combat (1,5 m/s ou plus pendant la dernière seconde) et l'autre est resté immobile (0,75 m/s ou moins) : la part du joueur qui sort | Test binomial exact contre une moitié |
| Visée avant le duel | La vue de chaque joueur face au relèvement de l'autre 0,75 s avant l'élimination ; qui visait le mieux et à quelle fréquence ce joueur a gagné ; les joueurs qui tiennent sur leur angle (à 15° près) contre ceux qui en sont à côté ; portées des éliminations | Test binomial exact ; Fisher |
| Feux croisés | Joueurs qui tiennent avec un coéquipier immobile à moins de 25 m du joueur qui sort, dont la ligne de tir sur lui est à 35° ou plus de la leur, contre ceux qui tiennent seuls | Fisher, Newcombe |
| Utilitaires avant l'entrée | Joueurs qui sortent derrière un flash de leur camp (dans les 3 s et 15 m) ou une fumée (dans les 18 s), contre les sorties sans rien ; duels d'ouverture avec un flash d'un seul côté ; victimes aveuglées | Fisher, binomial |
| Avantage numérique | Pour chaque état de joueurs vivants (5v4, 4v5, 2v1...) atteint en premier dans une manche, la part des manches gagnées depuis cet état | Intervalles de Wilson |
| Clutches | Manches où un camp s'est retrouvé avec son dernier joueur : victoires face aux victoires attendues du modèle, par nombre d'adversaires | Test normal de l'observé contre l'attendu |
| Groupes, rotations, embuscades | Le plus grand groupe à moins de 10 m au duel d'ouverture (3 ou plus : empilé) ; joueurs à plus de 30 m du premier combat ou de l'objectif posé, et vitesse à laquelle ils arrivent à moins de 12 m ; temps et rapport élimination/mort à plus de 30 m de chaque coéquipier | Fisher ; rapport des cotes avec l'intervalle de Woolf |
| Après la pose et la reprise | Manches gagnées par le camp qui a posé, selon les chiffres au moment de la pose, et sa part des duels après la pose | Intervalles de Wilson |
| Entonnoirs mortels | Entrées dans chaque lieu (un changement de la colonne de lieu, sinon d'une case de 8 m) et morts dans les 2,5 s après l'entrée, face au taux de la carte | Test binomial exact, q sur les lieux ; rapport réduit avec 20 entrées au taux de la carte |
| Impact du joueur | Probabilité de victoire ajoutée par manche par chaque joueur (éliminations, morts, poses), réduite par bayésien empirique ; plus-moins ajusté par régression de crête des résultats de manche face au départ du modèle ; valeur d'une élimination par lieu et arme, réduite | Pénalité choisie par validation croisée à cinq plis |

Tous les tests d'une même analyse partagent un même taux de fausses découvertes (Benjamini-Hochberg), tous les lieux essayés compris, et pas seulement ceux affichés ; le q affiché porte sur tous. Le modèle et sa calibration sont ajustés aux données chargées, donc ils décrivent cette population : un modèle professionnel juge mal le jeu occasionnel, et inversement.

Vérifié sur des manches synthétiques aux effets posés (un avantage du joueur qui sort, des feux croisés, des flashs, un entonnoir mortel, une meilleure visée qui gagne), et sur 100 jeux de données de ces mêmes manches sans ces effets, où le taux de fausses découvertes des tests aux effets posés doit rester au niveau nominal de 5 % (dans une marge) (`src/insights/cqb/cqb.test.ts`) ; sur environ un millier de vraies manches, le modèle a obtenu un score de Brier de 0,14 contre 0,25 pour le taux de base, une erreur de calibration de 0,03 et une pente de recalibrage de 1,0.

## Données nécessaires {#data-it-needs}

- Les colonnes **temps**, **joueur**, **camp** et **manche** (la session), et les éliminations et les morts dans la colonne d'événements ; les manches où personne ne meurt deux fois sont traitées comme des manches d'élimination (l'avantage numérique, les clutches et le modèle en ont besoin) ;
- une colonne d'**autre partie** (`other`, `victim`, `killer`, `attacker`) qui nomme la victime lors d'une élimination et le tueur lors d'une mort (sans elle, les éliminations et les morts au même moment sont appariées) ;
- une **direction du regard** pour les mesures de visée ;
- une colonne d'`event` brute qui nomme `flash`, `smoke`, `he`, `molotov`, `plant` et `defuse` pour les utilitaires et les poses ;
- `won` (le camp de la ligne a gagné la manche), `place` (annonces), `weapon`, `buy` et `state_flashed` quand les données les ont.

Les positions devraient être échantillonnées plusieurs fois par seconde ; les vitesses, la visée et les feux croisés lisent les deux dernières secondes avant chaque mort.

## Dans la décomposition {#in-the-breakdown}

La [décomposition](breakdown.md) mesure quatre situations comme facteurs, avec et sans : *aveuglé*, *mort échangée*, *duel d'ouverture* et les chiffres (*en supériorité*, *nombres égaux*, *en infériorité*), chacun sur K/D, manches gagnées, survie et éliminations par minute.

## Plusieurs matchs {#many-matches}

Chaque résumé de match de l'[analyse de plusieurs matchs](mass-analysis.md) de données avec une colonne de manche porte les mêmes mesures sous forme de comptes (`cqb` dans le résumé) : duels d'ouverture, échanges, sorties, feux croisés, entrées flashées, visée, avantage numérique, poses et les 40 lieux les plus empruntés avec leurs entrées et leurs morts. Les comptes s'additionnent sur les matchs, si bien que mille matchs donnent les mêmes parts qu'une grande analyse. L'onglet **Combat rapproché** du panneau les montre sous forme de parts avec leurs intervalles, sur toutes les cartes ou par carte ; un clic sur une ligne charge les matchs dont elle vient.

## Pour les développeurs {#for-developers}

`src/insights/cqb/` : `walk.ts` (un passage sur les lignes dans l'ordre du temps, manches séparées, duels enregistrés avec leur état), `finish.ts` (les mesures et les comptes par match), `model.ts` (régression logistique par IRLS, calibration, régression de crête par gradients conjugués, bayésien empirique, Fisher, Newcombe, tests de permutation), `run.ts` et `worker.ts` (la visionneuse : son propre worker, à côté du passage d'observations), `summary.ts` (le collecteur du résumé de plusieurs matchs), `factors.ts` (les situations de la décomposition), `shows.ts` (ce que lit le prisme), `synth.ts` (les manches de test). Les entrées de connaissance sont dans `src/insights/knowledge/cqb.ts`, les schémas dans `patterns-cqb.ts`. Les résultats entrent dans le rapport sous `lens.cqb`.
