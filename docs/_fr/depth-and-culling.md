---
title: "Profondeur et élimination des faces"
parent: "Modes de chaleur"
nav_order: 4
lang: "fr"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Profondeur et élimination des faces

La profondeur fait que les collines et les murs cachent la chaleur qui se trouve derrière eux, comme un vrai mur cache une personne. L’élimination par distance ne garde que la chaleur comprise entre une distance proche et une distance lointaine de la caméra.

![Une caméra basse derrière une colline, avec Masquer derrière le terrain désactivé (à gauche) et activé (à droite)](../assets/img/en/depth-and-culling-terrain.webp)

![Élimination par distance avec Lointain à 400 m et Couper aussi le niveau activé : une tranche de la carte autour de la caméra](../assets/img/en/depth-and-culling-far.webp)

Sans profondeur, une carte de chaleur posée sur un [niveau](levels.md) 3D est une simple superposition plate : tout ce que contient le jeu de données brille à travers chaque mur avec sa pleine force, les indices de profondeur que fournit le niveau sont annulés, et un point chaud à l’intérieur d’un bâtiment a le même aspect que s’il était sur son toit. La section **Profondeur** fait que le niveau cache ce qui se trouve derrière lui ; **Élimination par distance** limite la chaleur à une coque ou une tranche autour de la caméra ; la [Coupe](slice.md) découpe une tranche du monde. Les trois s’appliquent aux modes de chaleur et changent les lignes qui contribuent ; les modifier relance donc l’accumulation.

## Profondeur {#depth}

Les deux commandes ont besoin d’un [niveau](levels.md) - une image de carte ou un modèle 3D. Sans niveau chargé, il n’y a rien derrière quoi se cacher, et elles ne font rien. Les deux sont désactivées quand [Aplatir sur le plan du sol](sprite-shape.md#flatten-onto-ground-plane) est activé.

### Masquer derrière le terrain {#hide-behind-terrain}

**Masquer derrière le terrain** (activé par défaut) : un point de donnée dont la surface la plus proche vers la caméra est le *sol* (et non une structure) est retiré tout à fait, pas seulement assombri.

Le terrain et les murs sont opaques de manières différentes. On regarde *à travers* un mur exprès, pour voir à quel étage circulait le trafic ; on ne veut jamais regarder à travers une colline, car derrière elle se trouve l’autre côté de la carte - qui, sur une carte longue de plusieurs kilomètres, représente la plus grande partie des données, et qui s’additionne à l’horizon en une bande plus lumineuse que tout ce qui est au premier plan. Un seul atténuateur ne peut pas servir aux deux ; le terrain reçoit donc une limite, et les murs gardent l’atténuation ci-dessous.

### Masqué derrière la géométrie {#hidden-behind-geometry}

**Masqué derrière la géométrie** (par défaut 0.8) : à quel point un point de donnée situé derrière la géométrie du niveau est supprimé. La valeur signifie *se voit à travers* à 0, *N % plus sombre* entre les deux (la position du curseur, et non l’assombrissement mesuré), *totalement masqué* à 1.

Chaque mur ou sol entre un point et la caméra l’assombrit davantage : un mur laisse quelques pour cent avec la valeur par défaut, et chaque surface supplémentaire divise par deux ce qui reste, jusqu’à quatre surfaces. À 1, rien derrière la géométrie n’est dessiné, et c’est le réglage le moins coûteux.

Voir aussi [Apparence du niveau](level-appearance.md).

## Élimination par distance {#distance-culling}

**Élimination par distance** (fermée par défaut) limite la chaleur aux lignes situées entre une borne proche et une borne lointaine à partir de la caméra. Réglez une borne lointaine pour lire la densité à l’intérieur d’un bâtiment sans que le côté lointain de la carte s’additionne par-dessus ; réglez une borne proche pour traverser un point chaud au lieu de foncer dedans.

| Commande | Par défaut | Plage (curseur) | Signification |
|---|---|---|---|
| **Proche** | désactivée | 0.5-5000 m, logarithmique, les 5 % du bas de la piste = désactivé (200 000) | Les lignes plus proches que cette distance sont ignorées. |
| **Lointain** | désactivée | 1-200 000 m, logarithmique, bas = désactivé (10 000 000) | Les lignes plus lointaines que cette distance sont ignorées. |
| **Couper selon un plan** | activé | | Mesure les bornes le long de l’axe de vue au lieu de partir de l’œil, si bien que la coupe est un plan parallèle à l’écran plutôt qu’une sphère autour de vous. Le bord d’une sphère s’incurve à travers l’image et glisse dès que vous tournez ; un plan reste là où vous l’avez mis. |
| **Couper aussi le niveau** | activé | | Coupe aussi le sol, les structures et l’eau aux mêmes bornes. Si le niveau reste entier, la coupe retire les points de donnée et laisse le bâtiment debout devant eux ; si les deux sont coupés, on obtient une section à travers la carte, et les points se trouvent contre leurs murs et leurs sols. Cette option ne fait que redessiner ; elle ne relance pas l’accumulation. |

### Clavier {#keyboard}

La borne lointaine est une commande qu’on balaie - on la fait traverser un bâtiment et on regarde à quel étage apparaît le trafic - c’est pourquoi elle est sur le clavier pendant que vous volez ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)) :

| Touche | Effet |
|---|---|
| `]` | Repousse la borne lointaine d’un facteur 1.12 (Maj : 1.35) |
| `[` | La rapproche du même facteur |
| `\` | Désactive la borne lointaine, ou la réactive à la distance où elle était laissée (6000 la première fois) |

Les pas sont géométriques, car la plage utile couvre quatre ordres de grandeur, d’une pièce à une carte. Le clavier garde la borne lointaine entre 100 et 400 000. Les touches ne font rien tant qu’une zone de texte ou un menu a le focus.

## Pour les développeurs {#for-developers}

### Masquer derrière le terrain {#hide-behind-terrain}

Les structures sont dessinées dans une texture de profondeur qui leur est propre. Un fragment qui est derrière la profondeur de la scène mais *pas* derrière la profondeur des structures est derrière le sol, et il est écarté. Cela coûte une passe de profondeur sur les structures, sautée quand l’interrupteur est désactivé.

### Masqué derrière la géométrie {#hidden-behind-geometry}

Le calcul se fait **par surface**. Une seule comparaison de profondeur ne peut dire que « quelque chose est devant » ; un point derrière un mur et un point situé quatre pièces plus loin dans un bâtiment seraient donc assombris de la même façon, et l’intérieur ressemblerait à une seule tache pâle. À la place, la géométrie des structures est **dépelée en profondeur** en jusqu’à 3 couches supplémentaires ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)) ; chaque fragment compte combien de surfaces se trouvent devant lui (la profondeur propre de la scène plus les couches dépelées : quatre au maximum), et l’assombrissement se compose :

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Curseur | 1 surface | 2 | 3 | 4 |
|---|---|---|---|---|
| 0.5 | 25 % | 12.5 % | 6.25 % | 3.1 % |
| 0.8 (par défaut) | 4 % | 2 % | 1 % | 0.6 % (plancher) |
| 1.0 | non dessiné | non dessiné | non dessiné | non dessiné |

Pourquoi deux facteurs : le curseur est calibré pour qu’un mur laisse quelques pour cent - l’aspect qui se lit comme « derrière quelque chose » - et quelques pour cent composés à chaque fois ne seraient plus rien au troisième mur ; diviser par deux à chaque surface supplémentaire garde quatre paliers distinguables. Pourquoi au carré : linéaire, une zone saturée restait saturée derrière un mur ; à la puissance quatre, elle disparaissait à 0.8. Pourquoi un plancher : cacher complètement la chaleur masquée fait qu’une pièce pleine de trafic caché paraît vide, sans rien qui suggère de recourir à la [Coupe](slice.md). Seul un curseur bloqué à 1 la cache tout à fait - et c’est le réglage le moins coûteux, car les points masqués sont alors écartés.

Fonctionnement ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), les shaders de chaleur par points) : la comparaison se fait par fragment, contre la texture de profondeur de la scène, en **profondeur de fenêtre** plutôt qu’en distance dans le monde. Une lecture de texture de profondeur à l’étape de sommets renvoie « lointain » partout sur certains pilotes (le rastériseur logiciel d’ANGLE en fait partie), et linéariser les deux profondeurs en mètres fait perdre la séparation par manque de précision quand la plage proche/lointaine est large. Le biais vaut un rayon de sprite converti en unités de fenêtre, plus quelques bits de poids faible, si bien qu’un point de donnée posé sur une surface ne se masque pas lui-même.

Les structures sont dessinées translucides, mais elles sont dessinées dans la profondeur que lit l’occlusion ; un niveau dont les structures n’atteindraient pas la texture de profondeur ne cacherait que contre le terrain.

### Élimination par distance {#distance-culling}

Les deux bornes sont évaluées dans le shader de sommets, si bien qu’une ligne éliminée coûte un sommet et aucun fragment.
