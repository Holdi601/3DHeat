---
title: "Niveaux 3D"
parent: "Niveaux et géométrie de fond"
nav_order: 2
lang: "fr"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: false
---

# Niveaux 3D

Un niveau 3D est un modèle du lieu - collines, rues, bâtiments - dans lequel vos données se trouvent. Il permet de voir sur quel étage, quelle colline ou quel toit se trouve la chaleur. Le visualiseur le découpe en terrain (plein), structures (translucides, pour voir à l'intérieur) et eau.

## Charger un niveau 3D {#load-a-3d-level}

1. Chargez d'abord vos données ([Charger vos données](getting-data-in.md)). Le modèle doit utiliser le même espace monde et la même unité que les données, Y vers le haut.
2. Dans **Arrière-plan / niveau**, choisissez une **Cible de simplification**. Laissez *Complet - sans simplification* sauf si le modèle est énorme.
3. Appuyez sur **Modèle 3D…** et choisissez un fichier `.glb`, `.gltf`, `.obj`, `.stl` ou `.ply`.
4. Attendez la ligne de progression. **Annuler** l'arrête.
5. Appuyez sur **F** dans la vue. Le sol est plein, les structures sont des coques translucides, l'eau est plate.
6. Réglez l'aspect dans [Apparence du niveau](level-appearance.md). Appuyez sur **Enregistrer dans la bibliothèque** pour garder le résultat ([Bibliothèque de niveaux](level-library.md)).

![Un niveau 3D chargé : sol opaque avec courbes de niveau, bâtiments translucides, eau plate](../assets/img/en/model-levels-loaded.webp)

**Modèle 3D…** charge le maillage du niveau. Il est analysé, classé et simplifié dans un travailleur en arrière-plan ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)), avec une ligne de progression et **Annuler** : *Lecture du modèle*, *Analyse du fichier*, *Empaquetage de N textures*, *Classement de N parties*, *Simplification du sol (N triangles)*, *Simplification des structures (N triangles)*, *Construction du fil de fer*.

## Formats {#formats}

| Format | Ce qui est lu | Limites |
|---|---|---|
| `.glb` | Chaque primitive de maille avec `mode` 4 (triangles) ou sans mode, avec la transformation monde de chaque nœud appliquée ; `POSITION` ; `COLOR_0` (vec3 ou vec4) comme couleur de sommet ; la `baseColorTexture` du matériau et son `TEXCOORD_n` comme texture ; les noms de nœuds et de mailles comme noms de parties. | Les lignes et les points sont ignorés. |
| `.gltf` | Idem. | Seulement avec des tampons intégrés : un glTF qui référence un `.bin` externe est refusé avec *Exportez en un seul .glb pour que la géométrie soit intégrée.* |
| `.obj` | Faces, avec les blocs `o` et `g` comme parties. | Géométrie seulement (pas de matériaux). |
| `.stl` | Binaire et ASCII (`solid …`). | Une seule partie. |
| `.ply` | ASCII seulement. | Le PLY binaire est refusé avec *Convertissez en .glb ou en .stl binaire.* |

Géométrie seulement : positions, normales et triangles soudés dans un seul tampon, plus les couleurs et coordonnées de texture lorsqu'elles existent ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Un modèle sans triangle est refusé. Le modèle doit être dans le même espace monde et la même unité que les données (Y vers le haut) : rien n'est transformé pour s'ajuster.

## Terrestres, structures et eau {#ground-structures-and-water}

Un niveau est découpé en trois classes à l'import, car elles appellent des traitements opposés ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)) :

- **Terrestres** - dessinés opaques et ombrés avec des indices de relief (pente, courbes de niveau, rampe d'altitude) pour pouvoir lire une position par rapport à eux.
- **Structures** - les bâtiments et accessoires se dressent entre la caméra et la chaleur qu'ils contiennent ; ils sont donc dessinés comme une **coque transparente** (faces légères avec un bord clair, plus les arêtes dédoublonnées) - ou, lorsqu'ils sont texturés, pleins avec leurs textures.
- **Eau** - plate, sans indices de terrain : une courbe de niveau à travers un lac n'a aucun sens.

Chaque partie (nœud glTF, objet ou groupe OBJ) est classée isolément, selon la première règle qui s'applique :

1. **L'étiquette de l'exporteur.** Un nom qui commence par `ground:`, `structure:` ou `water:` (ou avec `|` à la place de `:`) est pris au mot. Les exporteurs du projet étiquettent chaque partie de cette façon.
2. **Noms d'eau.** `water` comme mot (pas *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Noms de terrain.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Noms de structures.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Géométrie.** Une partie qui couvre plus de 25 % de la surface X-Z de la carte, dont plus de 60 % de l'aire des triangles est tournée vers le haut, est du terrain. Une partie dont moins de 45 % est tournée vers le haut, ou plus haute que 15 % de la hauteur du niveau tout en couvrant moins de 10 % de sa surface, est une structure. La part tournée vers le haut est pondérée par l'aire, donc une maison n'est pas jugée plate à cause de son toit.
6. **Sinon, terrain** - une partie ambiguë est par défaut du terrain, car une coque par défaut presque invisible ferait ressembler le niveau à une panne d'affichage.

Un modèle qui est une seule partie classée comme structure devient du terrain à la place (*maille unique sans nom - traitée comme terrain*).

### Maillages de navigation {#navigation-meshes}

Une partie nommée `nav:…` (le `nav:walkable` d'un exporteur de niveau) est un maillage de navigation : là où un soldat peut se tenir. Elle est listée comme terrain (*maillage de navigation - non dessiné, car il repose sur le sol ; les clics le trouvent quand même*) mais **non dessinée**. Elle est posée sur le sol dont elle a été générée, coplanaire à moins de quelques centimètres, et dessinée comme du terrain, les deux surfaces se disputaient chaque pixel : sur un niveau avec une texture de sol cuite, toute la zone jouable apparaissait en plaques grises et beiges aux bords nets, une par triangle de navigation. Elle est gardée, non simplifiée, pour que [choisir en cliquant](camera.md#click-to-pick) puisse dire si un endroit est praticable. Les entrées de bibliothèque ne la gardent pas.

**Afficher la classification des parties (N)** dans le panneau (affiché pour les modèles de plus d'une partie) liste chaque partie avec sa classe et la raison - *étiquetée par l'exporteur*, *le nom correspond au motif*, *couvre X % de la carte, Y % tournés vers le haut*, *Y % tournés vers le haut, Z % de la hauteur du niveau*, *ambigu - classé en terrain par défaut*. Pour en changer une, renommez la partie dans le modèle source et importez à nouveau ; le découpage est figé dans les tampons d'index.

## Simplification {#simplification}

**Cible de simplification** règle le budget de triangles du prochain import ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)) :

| Réglage | Triangles |
|---|---|
| *Complet - sans simplification* (par défaut) | tous |
| *Haute - 8 M de triangles* | 8 000 000 |
| *Moyenne - 3 M de triangles* | 3 000 000 |
| *Basse - 800 k de triangles* | 800 000 |
| *Silhouette - 100 k de triangles* | 100 000 |

Le budget est réparti à **60 % pour les structures et 40 % pour le sol**, simplifiés séparément - les structures perdent leur forme le plus vite sous décimation. L'eau n'est pas simplifiée. La simplification est un effondrement d'arêtes avec des métriques d'erreur quadrique ([meshoptimizer](https://github.com/zeux/meshoptimizer), via WebAssembly), après soudure des sommets confondus, pour que les silhouettes et les arêtes vives survivent. La note d'import indique `source → maintenant triangles, écart X %`, la répartition sol / structures / eau entre les parties, et - lorsque *Complet* a été utilisé sur un modèle de plus de 8 M de triangles - suggère *Haute* (jusqu'à 30 M) ou *Moyenne* (au-delà). Sans WebAssembly, le simplificateur est indisponible et l'import le dit.

Les niveaux issus des exporteurs du projet ont déjà leur budget ; la cible existe pour les actifs bruts qui n'en ont pas.

## Textures {#textures}

Un `.glb` dont les parties portent des textures de couleur de base est dessiné avec elles - un export de circuit de course, par exemple, en porte une par tuile de terrain et une par modèle placé.

La texture du sol est affichée par défaut lorsqu'elle existe ; les structures qui portent des textures commencent **pleines, avec leurs propres textures** (bordures, glissières, murs de pneus et panneaux sont les bords d'une route, pas des bâtiments où regarder à l'intérieur), avec le fil de fer désactivé et l'ombrage plat désactivé. Voir [Apparence du niveau](level-appearance.md).

## Grands niveaux {#large-levels}

- Au-delà de **300 000** triangles de structure, les arêtes des structures commencent désactivées et l'opacité des faces à 35 % : avec une arête dans chaque pixel, le quartier apparaît comme un blanc uniforme.
- Le plan lointain de la caméra s'élargit pour contenir le niveau ([Niveaux](levels.md#what-a-level-does-for-the-heat)).

## Pour les développeurs {#for-developers}

### Atlas de textures {#texture-atlas}

Chaque texture est empaquetée dans **un seul atlas** dans le travailleur d'import ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), pour que le niveau reste un seul dessin, un seul échantillonneur et un seul attribut de coordonnées de texture sur les deux moteurs :

- empaquetée en rayons à la taille propre de chaque image, réduite seulement si l'ensemble ne tiendrait pas dans **8192 px** dans un sens ou dans l'autre (la limite de taille de texture par défaut de WebGPU) ;
- une **gouttière de 16 pixels** autour de chaque image, et seulement les 5 niveaux de mip que cette gouttière protège, pour qu'un panneau lointain n'échantillonne jamais la texture de son voisin ;
- les **textures répétées** restent répétées. Une image dont l'échantillonneur glTF répète (la valeur par défaut de glTF) et dont les coordonnées de texture sortent de 0..1 - un mur de briques dont l'UV va de 0 à 40 le long de lui - devient une *tuile* : ses sommets gardent leurs propres coordonnées et un numéro de tuile sur 16 bits, et les shaders ramènent la coordonnée dans le rectangle de la tuile pixel par pixel, en prenant le niveau de mip à partir de la coordonnée non ramenée pour que les jointures ne se voient pas. La gouttière d'une tuile contient son propre bord opposé. Un axe dont l'échantillonneur serre est serré ; une image dont les coordonnées restent dans 0..1 est dessinée comme avant. Un niveau avec des tuiles coûte 4 octets de plus par sommet.

### Le contrat d'exportation {#the-exporter-contract}

Ce que le visualiseur attend d'un niveau, quel que soit celui qui l'a fait :

- un `.glb` unique et autonome ;
- `POSITION` en float32, primitives de triangles ;
- des noms de nœuds `ground:*`, `structure:*` et `water:*` (tout autre nom est classé par les règles ci-dessus), et `nav:*` pour un maillage de navigation, qui est gardé mais non dessiné ;
- des coordonnées dans l'espace monde, **Y vers le haut**, dans la même unité que la télémétrie, pour que les données se posent sur le niveau sans aucune étape de placement.
