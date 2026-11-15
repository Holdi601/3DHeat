---
title: "Fonctionnement interne du rendu"
nav_order: 22
has_children: true
lang: "fr"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Rendu interne

La visionneuse dessine des millions de points sous forme de taches lumineuses et les additionne. Cette section explique les astuces qui gardent cela rapide, et ce que signifient les nombres de l'affichage des statistiques. Lisez-la si la visionneuse vous semble lente, ou si vous voulez travailler sur le moteur de rendu.

```
data -> time window -> GPU filters -> sampling plan -> splat -> accumulate -> colour -> screen
```

Pour voir comment se comporte votre ordinateur, regardez la case de statistiques en haut à droite de la vue : [Panneau de performance et statistiques](performance-and-stats.md). Les nouveaux mots (GPU, ligne, sprite, carte de chaleur) sont dans le [glossaire](glossary.md).

## Le problème central {#the-core-problem}

Une somme de rampes radiales qui se chevauchent coûte *N* × π*r*² fragments fusionnés par image. Avec 100 millions de sprites de rayon 8 px, cela fait 2 × 10¹⁰ fragments, soit environ une seconde de travail sur un GPU haut de gamme. On ne peut pas tout calculer par force brute à chaque image. La visionneuse combine donc :

- **des lignes triées par temps** : une fenêtre de temps se trouve par deux recherches dichotomiques, et le coût suit les lignes de la fenêtre, pas le jeu de données entier ;
- **aucun travail par ligne sur le CPU à chaque image** : les lignes vivent en mémoire GPU, quantifiées ; les filtres, les signes de groupe, le test de durée de vie, la fenêtre, l'élimination hors champ et la coupe sont tous évalués dans le shader de sommet ;
- **un échantillonnage stratifié** avec des poids de compensation quand une image ne peut pas dessiner toutes les lignes, et **une accumulation progressive** qui converge vers le résultat exact de toutes les lignes tant que la vue ne change pas ([Échantillonnage et budgets](sampling-and-budgets.md), [Accumulation](accumulation.md)) ;
- **un régulateur à deux étages** qui sacrifie d'abord les sprites par image, puis la résolution de la chaleur, pour garder la fréquence d'images ([Échantillonnage et budgets](sampling-and-budgets.md#the-adaptive-budget)) ;
- **des budgets mémoire imposés**, pour qu'un jeu de données qui ne tient pas soit tronqué de façon visible au lieu de faire planter l'application ([Occupation de la mémoire GPU](gpu-memory.md)).

## Une image {#one-frame}

La boucle d'image est [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Tout ce qui change à chaque image (caméra, tête de lecture, budget) vit dans le moteur, pas dans l'état de l'application. Une image ne coûte donc aucun travail React : l'état est lu une fois par image, et réécrit seulement pour les affichages à basse fréquence.

1. **Nouvelles données ?** Un nouveau jeu de données est annoncé (*Envoi de N lignes sur le GPU*) sur une image et envoyé sur la suivante, pour que le message s'affiche avant que le travail ne bloque le fil. Un nouveau niveau est remis au moteur ; les trajets de chaleur des lignes sont construits ou libérés.
2. **La tête de lecture** avance (limitée à 0,1 s de temps réel par image), boucle ou s'arrête.
3. **La caméra** lit le clavier, la souris et la manette ; le miroir d'axe est intégré à la matrice de vue ; sous WebGPU, une matrice de remise à l'échelle de la profondeur convertit la plage de profondeur de style OpenGL de three.js vers celle de WebGPU.
4. **Ce qui est visible** : la plage de temps de la chronologie et de l'historique ; la table des signes de groupe (visibilité seulement sous une séparation par colonne) ; jusqu'à quatre filtres : filtres de colonnes et sélection d'Entités ; la séparation de différence.
5. **Les tables de couleurs et de courbes** sont reconstruites si leurs réglages ont changé.
6. **Budget** : le régulateur adaptatif fixe le budget de sprites et la résolution de chaleur de cette image ; avec *Dessiner chaque ligne à chaque image*, le budget est relevé pour couvrir chaque ligne candidate.
7. **Les signatures** décident ce que le tampon d'accumulation représente encore : un changement qui modifie ce que les lignes apportent ou comment (*géométrie*), la fenêtre de temps, ou seulement la façon dont le résultat est coloré (*composite*). Voir [Accumulation](accumulation.md#what-restarts-it).
8. **Plan d'échantillonnage** : quels blocs de lignes dessiner ([Échantillonnage et budgets](sampling-and-budgets.md)).
9. **Mode d'accumulation** : réinitialiser, étendre, moyenne glissante, moyenne courante, ou inactif.
10. **Géométrie du replay de boîtes** (cubes, traînées) sur le CPU, seulement dans ce mode et seulement quand la vue n'est pas inactive.
11. **Rendu** : le moteur dessine la scène (niveau, grille, axes, boîtes, traînées, règle), projette la chaleur dans la cible de chaleur, la fusionne dans l'accumulateur, et compose la chaleur sur la scène dans le canevas.
12. **L'exposition automatique** se déclenche quand son compte à rebours atteint zéro ; la sonde de chaleur de la règle lit au plus un pixel toutes les 120 ms ; les affichages sont publiés.

Une image inactive (convergée, rien n'a changé) saute la scène et la projection, mais **recompose** quand même : un canevas WebGL créé sans `preserveDrawingBuffer` a un contenu indéfini après composition, donc lui faire confiance pour garder la dernière image n'est pas sûr. La scène et les cibles de chaleur sont les tampons d'image propres à la visionneuse et les conservent. Une image inactive ne coûte donc qu'une passe plein écran.

## Pages de cette section {#pages-in-this-section}

- [Les deux moteurs de rendu](backends.md) : WebGPU et WebGL2, comment l'un est choisi, paramètres d'adresse
- [Accumulation](accumulation.md) : réinitialiser, étendre, moyenne glissante, moyenne courante
- [Échantillonnage et budgets](sampling-and-budgets.md) : l'échantillonneur stratifié, le mode exact, le budget adaptatif
- [Accumulation en demi-précision](half-float-accumulation.md) : plage et précision sur les cibles 16 bits
- [Occupation de la mémoire GPU](gpu-memory.md) : stockage des lignes quantifié et budget GPU imposé
- [Détection du rendu logiciel](software-rendering.md)
- [Panneau de performance et statistiques](performance-and-stats.md)
