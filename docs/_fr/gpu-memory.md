---
title: "Occupation de la mémoire GPU"
parent: "Fonctionnement interne du rendu"
nav_order: 5
lang: "fr"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# Occupation de la mémoire GPU

La carte graphique n'a qu'une certaine quantité de mémoire. Si vos données ne tiennent pas, la visionneuse montre ce qui tient et le dit : l'affichage des statistiques reçoit une ligne orange **Non résident** avec le nombre de lignes laissées de côté. Un jeu de données tronqué qui paraîtrait complet serait la pire erreur qu'un outil d'analyse puisse commettre. Cette ligne n'est donc jamais masquée.

![L'affichage des statistiques avec la ligne orange Non résident](../assets/img/en/gpu-memory-not-resident.webp)

Pour en faire tenir davantage, augmentez le budget GPU sous **Budgets de ressources**, puis rechargez ([Mémoire et budgets](memory-and-budgets.md#raising-the-gpu-budget)). Vous pouvez aussi réduire d'abord les données, ou utiliser une carte avec plus de mémoire.

## Pour les développeurs {#for-developers}

### Comment les lignes sont stockées sur le GPU {#how-rows-are-stored-on-the-gpu}

Les lignes sont envoyées une seule fois, quand un jeu de données arrive, par **blocs** de 8 388 608 lignes (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Chaque bloc est quantifié selon sa propre boîte englobante et son propre intervalle de temps :

| Donnée | Format | Octets par ligne |
|---|---|---|
| Position X, Y, Z et identifiant de groupe | quatre entiers non signés de 16 bits (RGBA16UI en WebGL2) ; X, Y, Z dans la boîte englobante du bloc | 8 |
| Temps et durée de vie (quand le jeu de données a les deux, le temps et la personne) | deux entiers non signés de 16 bits (RG16UI) : temps dans l'intervalle du bloc ; durée de vie, avec 65 535 signifiant « pas d'échantillon suivant » | 4 |

Les boîtes englobantes par bloc sont ce qui rend 16 bits suffisants. Un bloc couvre en général une fraction de la carte, donc le pas de quantification reste bien en dessous d'un centimètre sur une carte large de plusieurs kilomètres, très en dessous du bruit des vraies télémesures. L'identifiant de groupe, placé dans le quatrième canal, ne coûte rien. C'est la raison pour laquelle il ne peut y avoir plus de 4 096 groupes ([Groupes](sessions-persons-groups.md#limits)).

Sur WebGL2, chaque bloc est une texture de 8 192 texels de large, complétée jusqu'à des lignes de texture entières. Les lignes sont atteintes depuis `gl_VertexID` par une texture d'indices de blocs mise à jour à chaque image. Sur WebGPU, ce sont des buffers de stockage.

Mémoire GPU supplémentaire par ligne, allouée à l'usage :

- chaque [filtre](filters.md) de colonne actif : 4 octets par ligne (valeurs en flottant 32 bits ou identifiants de catégorie), envoyés par bloc la première fois que le filtre est utilisé ;
- [chaleur linéaire](line-heat.md) : 8 octets par ligne (le début de chaque segment, quantifié dans la boîte englobante des données, et ses indicateurs) tant que le mode Lignes est activé.

Ajoutez les cibles de rendu : couleur et profondeur de la scène, la cible de chaleur et son jumeau de travail (quatre canaux dans [Chaleur par équipe](team-heat.md)), les couches de *depth peeling* pour l'[occlusion](depth-and-culling.md), et la géométrie du niveau.

### Le budget est imposé à l'envoi {#the-budget-is-enforced-at-upload}

WebGL accepte des allocations qu'il ne peut pas servir, puis perd le contexte ou bascule sur la mémoire système à un coût ruineux. Le budget GPU est donc imposé quand le jeu de données est envoyé ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)) :

- les blocs sont envoyés dans l'ordre (c'est-à-dire dans l'ordre du temps) tant qu'ils tiennent ;
- le premier bloc qui ne tient pas est envoyé **en partie** : autant de lignes de texture entières que le budget restant peut contenir. Il n'est pas écarté en entier. Ainsi, un budget incapable de contenir un bloc entier montre quand même le plus possible. Comme les lignes sont ordonnées dans le temps, la partie affichée est un intervalle de temps cohérent ;
- tout ce qui suit est **non résident**.

Le manque n'est pas caché : l'affichage des statistiques montre une ligne **Non résident**, en orange, avec le nombre de lignes qui n'ont pas tenu, dès que ce nombre est supérieur à zéro. Un jeu de données tronqué qui paraît complet est la pire défaillance qu'un outil d'analyse puisse avoir. Le [contrôle de place](memory-and-budgets.md#the-fit-check) avant chargement est là pour éviter ce cas.

Le budget que le moteur utilise est le budget GPU de **Budgets de ressources**, le même chiffre que celui du contrôle de place. Il peut dépasser le chiffre détecté, jusqu'au plafond du curseur (voir [Augmenter le budget GPU](memory-and-budgets.md#raising-the-gpu-budget)). Il est appliqué quand un jeu de données est envoyé. Le modifier ensuite n'a d'effet qu'au chargement suivant.
