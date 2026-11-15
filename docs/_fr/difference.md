---
title: "Différence"
parent: "Modes de chaleur"
nav_order: 5
lang: "fr"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: false
---

# Différence

Rouge là où l'équipe A était plus présente, bleu-vert là où l'équipe B l'était, rien là où elles étaient à égalité.

**Différence** (touche 2) est une chaleur signée. Les lignes d'une population ajoutent de la chaleur ; celles d'une autre population en retranchent. Là où les deux se recouvrent à parts égales, le résultat est nul et entièrement transparent ; là où l'une domine, il s'affiche dans les couleurs de ce camp : par défaut chaudes (transparent → rouge → jaune → blanc) pour le camp **+**, et froides (transparent → vert → bleu → violet) pour le camp **−**.

![Chaleur différentielle : rouge là où le camp + était plus présent, vert et bleu là où le camp - l'était](../assets/img/en/difference-split.webp)

## Comment l'utiliser {#how-to-use-it}

1. Appuyez sur `2` (ou choisissez **Différence** dans la barre des modes).
2. Ouvrez **Répartition différentielle** dans la barre latérale.
3. Choisissez **Répartir selon** : en général *Groupes*.
4. Placez un groupe (ou une valeur) sur **+** et un autre sur **−**.
5. Lisez les couleurs : le chaud signifie le camp +, le froid le camp −. Le panneau signale si un camp n'a aucune ligne (voir [Messages que vous pouvez voir](#messages-you-may-see)).

Ce sont *deux* populations précises qui comptent, si bien que la répartition peut porter sur n'importe quelle colonne conservée, pas seulement sur les groupes. Les lignes qui ne tombent sur **aucun** des deux camps sont **laissées de côté**, et non comptées comme zéro : c'est ce qui fait qu'une répartition sur deux valeurs parmi beaucoup compare exactement ces deux-là, et elle se combine avec les [filtres](filters.md) - filtrez sur une seule carte, puis répartissez cela par version.

Ce mode exige deux camps : une colonne de groupe avec au moins deux groupes, ou une répartition sur une colonne conservée pour le filtrage. Sur des données avec moins de deux groupes, un chargement démarre avec une répartition par colonne - la colonne *Fichier source* d'un chargement multi-fichiers en premier, sinon la première colonne catégorielle à deux valeurs, sinon la première colonne numérique ayant une étendue - de sorte que *comparer deux chargements* fonctionne sur des données sans aucun groupe. Seules les données sans groupe ni colonne laissent le mode indisponible ; il en va de même pour une répartition par colonne qui ne laisse rien d'un côté.

## Le panneau Répartition différentielle {#the-difference-split-panel}

Affiché en mode Différence, sous les panneaux de chaleur.

**Répartir selon** propose :

| Option | Affichée comme | Règle de répartition |
|---|---|---|
| Groupes | *Groupe (N)* (lorsqu'il existe une colonne de groupe) | Chaque groupe sur +, − ou aucun, à régler dans la [Liste des équipes](teams-list.md) |
| Une colonne catégorielle | *colonne (N valeurs)* | Valeurs sur +, − ou aucun |
| Une colonne numérique | *colonne (numérique)* | Une plage de valeurs pour chaque camp |
| Le fichier d'origine | *Fichier source - comparer deux chargements* (lorsque plusieurs fichiers ont été chargés) | Fichiers sur +, − ou aucun |

Seules les colonnes conservées sous *Garder pour le filtrage* au moment du chargement sont proposées.

### Comparer les proportions, pas les effectifs {#compare-shares-not-counts}

**Comparer les proportions, pas les effectifs** (désactivé par défaut) pondère chaque camp par un sur son propre nombre de lignes, de sorte qu'un camp qui a cinq fois plus de lignes ne gagne pas uniquement par le nombre. La couleur montre alors où chaque camp est proportionnellement plus fréquent que l'autre. Utilisez-la lorsque les deux camps ont des volumes de données très différents, par exemple deux sessions de durées différentes.

### Messages que vous pouvez voir {#messages-you-may-see}

Le panneau avertit lorsque l'image n'est pas une vraie différence :

| Message | Signification |
|---|---|
| *N + / M −* (ou *N + / M − / K inutilisées*) | Combien de valeurs se trouvent sur chaque camp (et sur aucun). |
| Aucune ligne de la fenêtre ne se trouve du côté **+** | Seul le camp **−** est dessiné. Déplacez la fenêtre de la chronologie ou modifiez la répartition. |
| Aucune ligne de la fenêtre ne se trouve du côté **−** | Seul le camp **+** est dessiné. |
| Aucune valeur ne se trouve sur l'un ou l'autre camp | La différence ne dessine rien. Placez au moins une valeur sur **+** ou **−**. |
| *colonne* ne peut pas être répartie de cette façon | La colonne choisie ne convient pas à la répartition. Choisissez à nouveau la colonne. |
| La colonne de répartition n'a pas tenu dans la mémoire GPU pour N morceaux sur M | Ces lignes ne sont pas dessinées. Augmentez le budget GPU sous Performance → Budgets de ressources, ou chargez moins de lignes. |

### Par groupe {#by-group}

Le panneau renvoie simplement vers la [Liste des équipes](teams-list.md), où chaque groupe a un bouton **+** et un bouton **−**. À chaque chargement, la première moitié des groupes (arrondie au supérieur) est placée sur +, le reste sur −; **Répartir équitablement** dans la Liste des équipes fait de nouveau la même chose. Un groupe placé sur aucun camp, ou masqué avec sa case, n'apporte rien.

### Par valeurs de catégorie {#by-category-values}

| Élément | Signification |
|---|---|
| `a + / b − / c inutilisées` | Combien de valeurs se trouvent sur chaque camp et sur aucun. |
| **Effacer** | Place chaque valeur sur aucun camp. |
| Liste des valeurs | Chaque valeur avec un bouton **+** et un bouton **−** (recliquez sur le bouton actif pour le retirer de ce camp). Une valeur vide est listée comme *(manquante)*. |
| Note de plafond | Seules les 200 premières valeurs sont listées : *Affichage des 200 premières valeurs sur N. Une colonne aussi large se réduit mieux d'abord avec un filtre, ou se répartit par plage si ses valeurs sont ordonnées.* |

Choisir la colonne place sa première valeur sur + et sa deuxième sur −. Lorsqu'aucun camp n'a de valeur, la répartition revient aux groupes au lieu d'afficher un cadre vide. *Fichier source* fonctionne de la même façon, une valeur par fichier : c'est ainsi que l'on compare deux exports, deux séries de tests ou deux versions.

### Par plage {#by-range}

| Élément | Signification |
|---|---|
| Indication | Le minimum et le maximum de la colonne. |
| **Plage positive (+)**, **de** / **à** | Les lignes dont la valeur est dans cette plage, bornes incluses, s'ajoutent. |
| **Plage négative (−)**, **de** / **à** | Les lignes dans cette plage se retranchent. |
| **Répartir au point milieu** | Règle + sur [minimum, milieu] et − sur [milieu, maximum] - c'est aussi ce que fait le choix de la colonne. |

Une valeur présente dans les deux plages compte comme +. Les plages n'ont pas à couvrir la colonne ; les valeurs hors des deux sont laissées de côté. *Les deux premières minutes contre les deux dernières* est une répartition par plage sur une colonne de type temps.

## Couleurs {#colours}

La section **Couleurs de la chaleur** affiche dans ce mode deux éditeurs de rampe : **Positive (équipes additives)** et **Négative (équipes soustractives)**, chacun avec son propre bouton de réinitialisation (*Réinitialiser à transparent → rouge → jaune → blanc*, *Réinitialiser à transparent → vert → bleu → violet*). La composition prend la valeur absolue de la chaleur nette à travers le [point de saturation et la réponse](colour-and-exposure.md), et choisit la rampe négative là où le net est inférieur à zéro. Voir [Couleur et exposition](colour-and-exposure.md#the-ramp-editor).

Utilisez la réponse à la densité *Linéaire* lorsque la taille de la différence compte : c'est la seule réponse où une même couleur signifie un même nombre.

## Fonctionnement {#how-it-works}

Chaque ligne reçoit un signe de +1, -1 ou 0 dans le shader de sommets ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)) ; un 0 rejette la ligne avant que tout fragment soit dessiné.

- Par groupe, le signe vient d'une table de 4 096 entrées indexée par l'identifiant de groupe de la ligne (l'identifiant de groupe voyage dans le quatrième canal du texel de position de la ligne).
- Par catégorie, le signe vient d'une seconde table de 4 096 entrées, remplie pour chaque valeur de catégorie ; la valeur de la ligne est lue dans la texture de filtre de la colonne ; une valeur au-delà de la fin de la table est rejetée sur les deux moteurs.
- Par plage, la valeur de la ligne est comparée aux deux plages.

Modifier la répartition relance l'accumulation.

**Les groupes masqués restent masqués avec toutes les répartitions.** Sous une répartition par colonne, la table des groupes ne porte plus de signes ; elle contient 1 pour un groupe affiché et 0 pour un groupe masqué ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), et les deux tables atteignent le shader ensemble - deux lignes d'une même texture de signes sur WebGL2, deux moitiés d'un même tampon de stockage sur WebGPU. Une ligne n'est dessinée que lorsque son groupe est affiché *et* que sa valeur de colonne se trouve sur un camp. Ainsi, un groupe décoché dans la [Liste des équipes](teams-list.md), ou écarté par la mise au point d'un camp de l'onglet Match, n'apporte rien, quelle que soit la façon dont la différence est répartie.
