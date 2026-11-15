---
title: "Chaleur par équipe"
parent: "Modes de chaleur"
nav_order: 6
lang: "fr"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: false
---

# Chaleur par équipe

La chaleur par équipe montre où se trouvait chaque équipe, chacune dans sa propre couleur. Là où les équipes se chevauchent, les couleurs se mélangent.

**Chaleur par équipe** (touche 3) est le champ de densité de la [Chaleur](heat.md) avec une teinte propre à chaque [groupe](glossary.md). Là où des groupes se recouvrent, leurs teintes se mélangent ; un affrontement à égalité ressort neutre. L'opacité porte toujours la densité exactement comme dans les autres modes, si bien que l'image répond à *combien* et à *qui* à la fois. Elle exige une colonne de groupe.

![Chaleur par équipe : chaque camp dans sa propre couleur ; là où ils se chevauchent, les couleurs se mélangent](../assets/img/en/heat-teams.webp)

Ce n'est pas la [superposition de figurines](box-replay.md) : celle-ci dessine une figurine par personne ; ici il s'agit d'un champ de chaleur coloré par la même colonne.

## Comment l'utiliser {#how-to-use-it}

1. Appuyez sur `3` (ou choisissez **Chaleur par équipe** dans la barre des modes).
2. Ouvrez **Couleurs de la chaleur**. Les pastilles montrent la couleur de chaque groupe ; survolez une pastille pour le nom de l'équipe.
3. Si tout paraît gris, augmentez **Séparation des couleurs**.
4. Décochez un groupe dans la [Liste des équipes](teams-list.md) pour le retirer ; les autres couleurs restent où elles étaient.

## Commandes {#controls}

Dans la section **Couleurs de la chaleur** :

| Commande | Par défaut | Signification |
|---|---|---|
| Pastilles | | La couleur de chaque groupe, pour les 12 premiers groupes, puis *+N de plus*. Survolez pour le nom du groupe et la couleur. |
| **Séparation des couleurs** | 1,4 | À quelle distance un mélange est repoussé du neutre, de 0 à 4. 0 rend tout gris ; 1 est la vraie moyenne ; au-delà d'environ 2, les mélanges les plus clairs sortent de la plage affichable et sont bornés canal par canal, ce qui décale leur teinte. |
| **Rampe d’opacité (la couleur vient du groupe)** | la rampe de chaleur par défaut | Seul l'**alpha** de la rampe est utilisé ici : transparent là où il n'y a rien, opaque au sommet. Ses couleurs sont ignorées. |

Toutes les autres commandes de chaleur - forme, saturation, réponse, chaleur minimale, profondeur, élimination - fonctionnent comme dans la [Chaleur](heat.md).

La [Liste des équipes](teams-list.md) affiche la couleur de chaleur par équipe de chaque groupe comme pastille dans ce mode. Masquer un groupe laisse la couleur de tous les autres groupes là où elle était : les teintes viennent du nombre total de groupes, et non de ce qui est activé, si bien que deux images restent comparables.

## La palette {#the-palette}

Depuis [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts) :

- Les couleurs vivent sur le plan de couleur **Oklab** à une luminosité fixe (0,7) et une chroma fixe (0,115), de sorte que chaque groupe est aussi lumineux et qu'un groupe rouge ne paraît pas plus chaud qu'un groupe bleu.
- Avec *n* groupes, le cercle des teintes est divisé en *n* parts égales, et le groupe *i* prend le **centre** de sa part, `(i + 0,5) / n` d'un tour. Deux groupes quelconques sont aussi éloignés que le nombre le permet, et les opposés restent opposés quel que soit le nombre.
- Au plus **16** teintes distinctes sont utilisées. Avec davantage de groupes, les identifiants sont placés par divisions répétées (identifiants à bits inversés : 0, ½, ¼, ¾, ⅛, …) pour que des identifiants voisins ne partagent pas une teinte ; au-delà de 16, les groupes partagent forcément.
- Un groupe dont l'étiquette signifie « aucun groupe » - `0`, vide, `none`, `unknown`, `null` ou `-1`, sans tenir compte de la casse - est dessiné en **gris neutre** au lieu de prendre une part du cercle. Seule la première étiquette de ce type dans la liste des groupes est traitée ainsi.

La séparation par défaut est 1,4 et non 1, car à 1 un mélange de cinq teintes également réparties *est* gris : c'est juste, mais illisible. Un peu au-dessus de 1 garde les égalités honnêtes tout en rendant visible une répartition 60/40.

## Fonctionnement {#how-it-works}

La cible de chaleur a quatre canaux dans ce mode. Chaque sprite ajoute sa densité *v* au premier canal, et *v* × les coordonnées Oklab *a* et *b* du groupe aux deuxième et troisième. Au moment de la composition, le mélange du pixel est la moyenne pondérée par la densité : *a* = G / R, *b* = B / R, mise à l'échelle par la séparation des couleurs et convertie en sRGB à la luminosité de la palette. Diviser par la densité accumulée rend la teinte indépendante de la quantité de données, et c'est pourquoi chaque commande de densité agit toujours sur l'opacité seule.

La cible à quatre canaux coûte quatre fois plus de mémoire GPU que la cible de chaleur à un canal, à la même résolution.
