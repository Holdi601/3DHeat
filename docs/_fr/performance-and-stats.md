---
title: "Panneau de performance et statistiques"
parent: "Fonctionnement interne du rendu"
nav_order: 7
lang: "fr"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Panneau de performance et statistiques

La case en haut à droite de la vue montre l'effort de la visionneuse : combien d'images par seconde, combien de points elle dessine, et si elle affine encore l'image. Le panneau **Performances** vous permet d'échanger la qualité de l'image contre la vitesse.

## L'affichage des statistiques {#the-stats-overlay}

La case en haut à droite de la vue, dans les onglets **Carte de chaleur** et **Match** ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Elle lit à chaque image d'animation la mesure en direct du moteur.

![L'affichage des statistiques sur la scène de beaucoup de matchs, avec des repères numérotés : 1 Moteur de rendu, 2 FPS, 3 Image, 4 Lignes dans la fenêtre, 5 Sprites / image, 6 Budget, 7 Résol. chaleur, 8 Couverture](../assets/img/en/performance-stats-overlay.webp)

| Ligne | Signification |
|---|---|
| **Moteur de rendu** | *WebGPU* ou *WebGL2*. Survolez la ligne pour voir pourquoi WebGPU n'a pas été utilisé, s'il ne l'a pas été. Voir [Les deux moteurs de rendu](backends.md). |
| **FPS** | Images par seconde, en moyenne sur au moins 0,4 s. |
| **Image** | Temps d'image en ms, lissé (90 % de l'ancienne valeur, 10 % de la nouvelle). C'est le temps entre deux images, pas le temps GPU : aucun temps GPU par passe n'est mesuré. |
| **Lignes dans la fenêtre** | Lignes candidates : les lignes de la fenêtre de temps actuelle, avant le filtrage par ligne dans le shader. |
| **Sprites / image** | Sprites envoyés par le plan de la dernière image (gardé à la valeur prévue sur les images inactives, qui ne dessinent rien). |
| **Budget** | Le budget de sprites avec lequel cette image a été planifiée : la valeur du régulateur adaptatif, relevée à tous les candidats quand on dessine chaque ligne. |
| **Résol. chaleur** | La résolution du tampon de chaleur, en part du canevas : le réglage *Résolution de la chaleur* multiplié par l'échelle du second étage adaptatif. |
| **Couverture** | Le chemin parcouru par l'accumulation progressive vers l'utilisation de chaque ligne : un pourcentage pendant la convergence (orange), *exact* une fois terminé. Une image bruitée n'est jamais prise pour l'image finale. |
| **Cubes** | Boîtes dessinées dans les [figurines superposées](box-replay.md). |
| **Non résident** | Affiché seulement quand des lignes n'ont pas tenu dans le budget GPU : le nombre de lignes concernées. Voir [Occupation de la mémoire GPU](gpu-memory.md). |

## L'affichage de la vitesse {#the-speed-display}

En bas à droite de la vue, seulement en perspective : la vitesse de vol et le temps pour traverser les données à cette vitesse. Faites-le glisser pour changer la vitesse. Voir [Caméra et commandes](camera.md#fly-speed).

## Si la visionneuse est lente {#if-the-viewer-is-slow}

Regardez l'affichage des statistiques, puis :

1. **Lignes dans la fenêtre bien plus grand que Sprites / image, Couverture sous 100 %** : l'image ne peut pas tout dessiner. Elle converge sur plusieurs images quand la vue est immobile. Resserrez la fenêtre, filtrez ou éliminez des candidats pour réduire leur nombre, ou acceptez l'échantillonnage.
2. **Sprites / image égal à Lignes dans la fenêtre, image toujours lente** : le coût est par sprite à l'écran. Baissez le *Rayon maximal en pixels* ([Forme des sprites](sprite-shape.md#pixel-clamps)) ou la *Résolution de la chaleur*.
3. **Lent avec peu de lignes** : c'est probablement le niveau. Beaucoup d'éléments de structure avec les arêtes activées, des triangles de sol, la profondeur de champ. Voir [Apparence du niveau](level-appearance.md).
4. **Tout est lent, et une bannière rouge apparaît** : rendu logiciel ([Détection du rendu logiciel](software-rendering.md)).

## Le panneau Performances {#the-performance-panel}

| Commande | Défaut | Effet |
|---|---|---|
| Indication | | Chaque image projette un sous-ensemble aléatoire et stratifié des lignes visibles, avec un poids mis à l'échelle pour compenser. La chaleur attendue est donc exacte à n'importe quel budget. Garder la vue immobile continue de fusionner les images jusqu'à ce que chaque ligne ait contribué. |
| **Dessiner chaque ligne à chaque image** | activé | Chaque image qui démarre une nouvelle estimation dessine chaque ligne candidate (jusqu'à environ 268 M). Le budget ci-dessous devient alors un plancher. [Échantillonnage et budgets](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Budget adaptatif** | activé | Ajuste les sprites par image, puis la résolution de la chaleur, pour tenir la fréquence d'images cible. Il s'arrête de réduire quand réduire ne sert à rien. [Échantillonnage et budgets](sampling-and-budgets.md#the-adaptive-budget) |
| **FPS cible** | 60 | 20 à 240 (1 000 avec la poignée). Les valeurs sous 15 sont ramenées à 15. |
| **Sprites / image au départ** / **Sprites / image** | 4,00 M | 65 536 à 268 435 456, échelle logarithmique. Nommé *au départ* quand le budget adaptatif est actif, parce que le régulateur le déplace. |
| **Résolution de la chaleur** | 100 % | 25 à 100 %. Le coût des fragments croît avec le carré : 50 % divise par quatre le travail de fusion, et le champ de chaleur est assez lisse pour que cela se voie à peine. |
| **Affinage progressif** | activé | Accumule d'une image à l'autre tant que la vue est immobile. Désactivé, l'estimation d'une seule image est affichée à chaque image. [Accumulation](accumulation.md) |
| **Budgets de ressources** | détectés | Budgets de RAM, de GPU et du fil d'analyse. [Mémoire et budgets](memory-and-budgets.md#resource-budgets) |

Aucun de ces réglages n'est enregistré : un rechargement rétablit les valeurs par défaut.
