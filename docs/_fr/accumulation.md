---
title: "Accumulation"
parent: "Fonctionnement interne du rendu"
nav_order: 2
lang: "fr"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Accumulation

Quand la visionneuse ne peut pas dessiner chaque point en une image, elle en dessine une partie, puis une autre, et additionne les images tant que vous restez immobile. L’image gagne en netteté, comme une photo qui se révèle. Bouger la caméra recommence tout. La ligne **Couverture** de la superposition des statistiques indique où en est le calcul.

![La superposition des statistiques : Couverture affiche un pourcentage pendant que l’image se révèle, et *exacte* quand elle est complète](../assets/img/en/performance-stats-overlay.webp)

## Pour les développeurs {#for-developers}

Quand une image ne peut pas dessiner toutes les lignes, elle en dessine un échantillon et le pondère ; l’image est alors une estimation non biaisée mais bruitée. **L’accumulation** fusionne les images successives pour que l’estimation converge vers la réponse exacte tant que rien ne change. Chaque image choisit l’un de cinq modes ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)) ; le dernier utilisé se trouve dans `engine.live.accumMode`.

| Mode | Quand | Ce qui arrive à l’accumulateur |
|---|---|---|
| **reset** | la caméra a bougé, quelque chose qui modifie le champ a changé, l’affinage progressif est désactivé, une fenêtre croissante démarre (première image de la lecture, après un saut), ou la chaleur linéaire lue a bougé | Remplacé par l’estimation de cette image. |
| **extend** | une fenêtre **Cumulée** qui n’a fait que grandir depuis la dernière image | Cette image ne dessine que les lignes qui viennent de devenir visibles, à plein poids, et les additionne. Rien ne s’atténue. |
| **ema** | une fenêtre glissante (**Fenêtre**, **Durée de vie**) a bougé | `acc = acc × (1 - 0.34) + frame × 0.34` - une moyenne mobile exponentielle d’environ trois images. |
| **mean** | rien n’a changé et l’estimation n’est pas complète | `acc = acc × (1 - 1/n) + frame × 1/n` à la *n*-ième image : une moyenne courante. |
| **skip** (inactif) | convergé et rien n’a changé | Rien n’est dessiné ; l’image ne fait que recomposer. |

### Pourquoi chacun {#why-each}

- **Moyenne courante, pas somme.** Multiplier le tampon par 1 - 1/n et ajouter 1/n de la nouvelle image revient algébriquement à additionner puis diviser par *n* à la fin, mais le tampon contient toujours la valeur d’un seul champ. Une somme atteint *n* fois le champ, et sur une cible de 16 bits elle sature à 65 504 ; avec un diviseur qui ne cesse de grandir, une vue immobile s’éteindrait d’autant plus qu’elle resterait longtemps - alors qu’une caméra en mouvement, qui repart à zéro à chaque image, paraît parfaitement juste. La suite de tests de fumée affirme que 16 images fusionnées donnent 1.00 fois ce que donne une seule image.
- **Extend pour la lecture cumulée.** Les lignes déjà accumulées restent visibles, donc une image n’a besoin que de la fraction de seconde qui vient d’arriver - ce qui tient dans une image, et y entre donc exactement. Recalculer l’estimation éclairerait chaque image un sous-ensemble aléatoire différent, et l’atténuerait, ce qui se lirait comme des rafales qui s’allument et disparaissent ; une image en pause continuerait à se remplir. La suite affirme que le total monte de façon monotone pendant la lecture, et reste dans 0.02 % pendant 2.5 s de pause.
- **Moyenne mobile pour les fenêtres glissantes.** Elles changent vraiment à chaque image. Un poids de mélange fixe suit la fenêtre mobile (une moyenne sur toutes les images depuis le début de la lecture resterait en retard sur la tête de lecture) et est bien plus calme que de repartir de zéro.
- **Reset pour les lignes lues.** Les têtes de chaleur linéaire bougent à chaque image ; une moyenne mobile les étalerait chacune en traînée, si bien que chaque image est dessinée entière et que l’atténuation de la queue est celle de l’image elle-même.
- **Les images partielles passent par une cible de travail.** Une image fusionnée à une fraction du poids plein est projetée dans une cible séparée depuis zéro, puis mélangée à l’accumulateur, au lieu d’être projetée directement avec un poids de 1/n. Directement, chaque sprite serait ajouté à 1/n de la taille du total qu’il rejoint, ce que l’arrondi d’une cible en demi-précision effacerait - le pire là où c’est le plus dense ([Accumulation en demi-précision](half-float-accumulation.md)).

### Convergence {#convergence}

Le plan de chaque image connaît le nombre de lignes candidates et celui qu’il soumet ; le nombre d’images nécessaires pour couvrir chaque ligne est donc ⌈candidats / soumis⌉. Une fois ce nombre d’images fusionnées, la vue est **convergée** : la ligne *Couverture* de la superposition des statistiques passe du pourcentage à *exacte*, et les images suivantes sont inactives. Avec **Dessiner chaque ligne à chaque image** activé (par défaut), une seule image couvre en général tout, si bien que la convergence est immédiate ; la mécanique progressive n’est nécessaire que lorsque la fenêtre contient plus de lignes qu’un plan de dessin ne peut en porter (environ 67 millions).

### Ce qui la relance {#what-restarts-it}

Les réglages se répartissent en trois groupes, selon ce que signifie encore le tampon accumulé une fois qu’ils ont changé :

| Groupe | Modifications | Effet |
|---|---|---|
| **Géométrie** - quelles lignes contribuent et combien | mode de vue ; trajets de la chaleur linéaire ; rayon, intensité au centre et au bord, atténuation, rampe douce, courbe, limites en pixels, aplatissement des sprites ; élimination par distance proche, lointaine et planaire ; occlusion et masquage derrière le terrain ; la coupe ; taille de la toile ; résolution de la chaleur ; visibilité et signes des groupes ; la séparation de la différence ; Tout / Lecture ; l’historique ; les filtres de colonnes et la sélection des Entités ; le gain en demi-précision | Reset. |
| **Fenêtre** - la plage de temps | la tête de lecture qui bouge ; la solution de repli et l’atténuation de la Durée de vie | Extend (cumulée) ou moyenne mobile (glissante). |
| **Composition** - seulement la coloration | saturation, réponse à la densité, chaleur minimale, les rampes de couleurs ; couper le niveau ; grille et axes ; réglages et session du replay de boîtes ; profondeur de champ | Redessiner sans toucher à la chaleur. |

Un déplacement de caméra relance toujours. Ainsi, faire glisser la saturation ou la rampe ne coûte rien ; faire glisser le rayon des sprites relance la convergence à chaque pas.
