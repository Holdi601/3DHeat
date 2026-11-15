---
title: "Comportement collectif"
parent: "Observations"
nav_order: 3
lang: "fr"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Comportement collectif : foules, bancs, troupeaux et décisions sous pression

Les joueurs d’un match se comportent comme des gens partout ailleurs : ils se pressent aux portes, suivent celui qui est passé en premier, restent groupés ou s’éparpillent, reculent après de lourdes pertes, prennent plus de risques après une mauvaise vie. Les **mesures du prisme de comportement** mesurent ces schémas avec les méthodes de la science des foules, de la physique du mouvement collectif, de l’économie comportementale et de la psychologie militaire, chacune face à son propre modèle nul, et les lisent à travers les entrées correspondantes de la [base de connaissances](knowledge.md).

## Essayer {#try-it}

1. Chargez un ou plusieurs matchs avec le temps, les positions et les équipes.
2. Ouvrez **Observations** et lancez-la.
3. Dépliez **Mesures du prisme** : les mesures de comportement sont listées avec les autres (Alignement collectif, Troupeau sur les routes, Voies et sentiers, Entassement, Meneurs et suiveurs, Cohésion et traînards, Point de rupture, Risque après les pertes, Séries, Accord sur les achats, Suppression), chacune avec ses chiffres, son test et la littérature qui l’explique.
4. Le **Bilan** les cite ; **Rédiger avec l'IA** les envoie avec le rapport.

## Les mesures {#the-measures}

Les trajets sont rééchantillonnés à un point toutes les 2 s (la position à la fin du créneau et la vitesse sur celui-ci). Les distances sont mises à l’échelle de l’espacement typique des données elles-mêmes - la distance médiane entre une unité et son coéquipier le plus proche - si bien que la même mesure marche pour l’infanterie, les chars et les aéronefs.

| Mesure | Ce qu’elle mesure | Modèle nul et test | Connaissances |
|---|---|---|---|
| Alignement collectif | Polarisation (longueur du cap moyen des unités) de chaque camp, unités en mouvement, toutes les 2 s ; tournoiement (rotation autour du centre de gravité) ; parts du temps polarisé, en tournoiement et en essaim, par phase du match ; dans les combats entre deux camps alignés, la part des éliminations du camp le plus aligné | Trajet propre de chaque unité décalé dans le temps à l’intérieur du match (il garde son chemin, rompt la simultanéité) ; test de changement de signe sur des fenêtres de 60 s | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Troupeau sur les routes | À quelle fréquence une unité quitte un lieu comme l’a fait le coéquipier qui l’a précédée (dans les 30 s), pour la même entrée et la même sortie, par rapport aux parts de sortie propres au lieu - et par rapport à la copie d’un passage antérieur de l’ennemi | Sorties mélangées à l’intérieur du lieu et de l’entrée ; l’effet est la copie du coéquipier moins la copie de l’ennemi (problème de réflexion de Manski : la copie et un plan partagé par le camp se ressemblent) | Banerjee 1992, Bikhchandani et al. 1992, Manski 1993 |
| Voies et sentiers | Séparation latérale des deux sens dans les lieux à contre-flux ; part du mouvement sur les 10 % du sol les plus fréquentés, son coefficient de Gini, et le recouvrement du sol le plus fréquenté des matchs | Sens mélangés entre des visites complètes ; deux grilles décalées d’un demi-lieu, chacune testée, correction de Bonferroni | Helbing et al. 1997, 2005 |
| Entassement | Vitesse (par rapport au rythme propre de l’unité) et flux selon le nombre de voisins dans un rayon de deux fois l’espacement typique, la chute de capacité dans la classe la plus dense, sur le sol le plus fréquenté ; morts par heure dans les foules ; tirs par minute des coéquipiers à proximité (paresse sociale) | Corrélation vitesse-densité propre à chaque unité, test de changement de signe sur les unités, effet minimal ρ au-delà de ±0.05 ; tests exacts de taux | Helbing et al. 2000, Seyfried et al. 2005, Latané et al. 1979 |
| Meneurs et suiveurs | Pour les coéquipiers qui voyagent ensemble, le décalage temporel (jusqu’à 8 s) auquel le cap de l’un prédit le mieux celui de l’autre ; graphe des meneurs, transitivité des triades, taux de morts et d’éliminations des meneurs | Paires dont un trajet est décalé dans le temps : elles donnent le seuil à 95 % ; test binomial contre 5 % | Nagy et al. 2010, Couzin et al. 2005 |
| Cohésion et traînards | Temps passé au-delà de trois fois l’espacement typique du camp par rapport au coéquipier le plus proche ; taux de morts là-bas contre le groupe ; espacement d’un camp contre sa part des éliminations d’un combat | Test conditionnel exact de deux taux de Poisson | Shils et Janowitz 1948, Siebold 2007 |
| Point de rupture | Vitesse d’approche vers l’ennemi (au rythme propre du camp) selon la part du camp perdue dans la dernière minute ; le plus bas niveau de pertes auquel les camps se retirent | Bootstrap par grappes unilatéral contre un retrait d’un dixième du rythme (les pertes surviennent là où les camps se rencontrent, et les camps qui se rencontrent cessent de se rapprocher), correction de Bonferroni sur les niveaux | Dupuy 1987, Rowland 2006 |
| Risque après les pertes | Part de la vie suivante passée devant son camp vers l’ennemi, au-dessus de la part propre du camp et des autres unités qui reviennent à ce moment-là : après une vie perdue sans élimination contre après une vie avec élimination ; mort précoce après mort précoce (inclinaison) | Vies de chaque unité mélangées (la première vie est gardée), si bien que le biais de séquence finie est dans le modèle nul | Kahneman et Tversky 1979, Thaler et Johnson 1990 |
| Séries | P(élimination après k éliminations) − P(élimination après k morts), k = 1..3 | Séquence propre à chaque joueur mélangée 1 000 fois : le biais que Miller et Sanjurjo ont montré est retranché ; correction de Bonferroni sur k | Gilovich et al. 1985, Miller et Sanjurjo 2018 |
| Accord sur les achats | Kappa de Fleiss des tranches d’équipement (éco, force, complet ; tertiles hors Counter-Strike) à l’intérieur de la manche d’un camp | Manches-joueurs du camp mélangées entre ses manches | Fleiss 1971 |
| Suppression | Vitesse dans les 4 s après des dégâts non mortels contre les 4 s avant, et tirs dans les 10 s après contre avant, lors des coups et lors des moments calmes de la même unité | Changement de signe sur les unités, effets minimaux de 0.05 du rythme et d’un tir par minute | Rowland 2006 |

Chaque p-valeur du rapport passe par le taux de fausses découvertes de Benjamini-Hochberg (`q`). Une mesure est laissée de côté quand les données ne peuvent pas la porter : il faut des manches et des valeurs d’équipement pour l’accord sur les achats, des événements de dégâts pour la suppression, des éliminations et des morts attribuées aux unités pour les séries et le risque.

## Dans l’analyse de masse {#in-the-mass-analysis}

Chaque résumé de match (`<match>.summary.json`, voir [Analyse de masse](mass-analysis.md)) porte les mêmes mesures pour ce match dans sa section `behaviour`, si bien que des milliers de matchs peuvent être comparés sans relire leurs lignes.

## Son efficacité {#how-well-it-works}

Sur des batailles simulées avec chaque effet intégré, et les mêmes mondes sans (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`) : chaque mesure retrouve l’effet qu’on y a mis, et les mondes nuls restent sous le seuil de fausses découvertes. Le risque après les pertes a la moindre puissance ; le troupeau sur les routes ne sait pas distinguer la copie d’un plan commun (un camp qui partage un seul but est « troupeau » selon cette mesure).

## Pour les développeurs {#for-developers}

- `src/insights/behaviour/acc.ts` - l’accumulateur (trajets rééchantillonnés, événements, manches) et `finish` ; `motion.ts` et `choice.ts` les mesures ; `bstats.ts` les aides de permutation, de bootstrap et de kappa ; `shows.ts` les schémas et les phrases que lit le prisme (`lens.<measure>`).
- `feed.ts` l’alimente depuis les morceaux du worker d’observations ; `summaryTap.ts` depuis un résumé de match au fur et à mesure qu’il diffuse la table.
- Connaissances : `src/insights/knowledge/behaviour.ts` (entrées), `patterns-behaviour.ts`, `refs-behaviour.ts` (références, chacune vérifiée contre sa fiche Crossref ou Open Library).
- Libellés : `lens.metric.<measure>` dans `locales/*/lens.json`.
