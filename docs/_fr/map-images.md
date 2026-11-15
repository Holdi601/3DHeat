---
title: "Images de carte"
parent: "Niveaux et géométrie de fond"
nav_order: 1
lang: "fr"
source: "map-images.md"
source_hash: "f0bbaa4b019e"
translated: true
outdated: false
---

# Images de carte

Une image de carte est une image plate - une mini-carte, une photo satellite, un plan d’étage - posée sous vos données pour voir où se trouve la chaleur. Vous indiquez à la visionneuse où place l’image en épinglant deux points sur elle à deux endroits du monde (les « ancres »).

## Charger et placer une image de carte {#load-and-place-a-map-image}

1. Chargez d’abord vos données ([Importer des données](getting-data-in.md)).
2. Dans **Arrière-plan / niveau**, appuyez sur **Image de carte…** et choisissez l’image. Elle est étirée sur la zone des données.
3. Appuyez sur **Ajuster aux limites des données** si l’image a été déplacée. L’ancre 1 va au coin haut-gauche de l’image, l’ancre 2 au coin bas-droit, aux bords des données.
4. Si la chaleur ne s’aligne pas sur l’image, choisissez deux repères éloignés l’un de l’autre (par exemple deux coins opposés d’un bâtiment ou deux carrefours). Relevez le pixel de chacun sur l’image et sa position dans le monde (survolez avec la [règle](measure.md) pour lire **X** et **Z**).
5. Saisissez-les dans **Placement** : pour **Ancre 1**, le **px** du repère, le **py**, le **X monde**, le **Z monde** ; de même pour **Ancre 2**.
6. Vérifiez : une trace ou un point chaud que vous savez sur une route doit maintenant tomber sur cette route. Ajustez les chiffres jusqu’à ce que ce soit le cas.

![La section Placement avec deux ancres et la chaleur dessinée sur une image de carte](../assets/img/en/map-images-placement.webp)

Les deux repères doivent différer à la fois par leur colonne et par leur ligne de pixels, sinon le panneau affiche *Les deux ancres partagent une ligne ou une colonne de pixels*.

## Chargement {#loading}

Tout format d’image que le navigateur sait décoder. Une image dont le plus grand côté dépasse **8192 px** est réduite à 8192 (le plus grand côté que le GPU doit tenir), et le panneau affiche *Réduite de W×H à w×h*.

Au chargement, l’image est étirée sur les limites X-Z des données (ou sur ±1000 unités sans données), nord en haut, à la plus basse hauteur Y des données. Les valeurs par défaut sont **Opacité** 100 %, **Luminosité** 0.7, **Désaturer** 100 %, **Inverser nord/sud** activé : désaturée et assombrie, car le rôle du fond est de vous aider à repérer un point chaud, non de rivaliser avec lui.

## Commandes {#controls}

| Commande | Par défaut | Plage | Signification |
|---|---|---|---|
| **Opacité** | 100 % | 0-100 % | |
| **Luminosité** | 0.7 | 0-2 (curseur 64) | |
| **Désaturer** | 100 % | 0-100 % | Fond gris, chaleur saturée. La couleur de la carte ferait concurrence à la couleur des données. |
| **Inverser nord/sud** | activé | | Quelle ligne de l’image est le Z maximum du monde. Le basculer avec des données chargées réajuste aussi les ancres aux limites des données. |
| **Placement** : Ancre 1, Ancre 2 | les coins de l’image sur les limites des données | | Chaque ancre est un pixel de l’image - **px** (depuis la gauche, de 0 à la largeur) et **py** (depuis le haut, de 0 à la hauteur) - et la coordonnée du monde où elle se trouve, **X monde** et **Z monde**. L’échelle et le décalage découlent de la paire. |
| **Ajuster aux limites des données** | | | Met l’ancre 1 au coin haut-gauche de l’image et l’ancre 2 au coin bas-droit, aux limites X-Z des données. Un point de départ pour un placement exact. Il faut des données. |
| **Altitude** | le Y le plus bas des données | Y min des données - 500 à Y max + 500 (curseur Y max + 100 000) | Hauteur du plan de la carte. Placez-le juste sous les données pour que rien ne soit caché par lui. |

La ligne du nom affiche `largeur×hauteur px · x × z m/px`, la taille dans le monde d’un pixel selon chaque axe.

## Dans la scène {#in-the-scene}

L’image est un seul quad texturé à l’altitude choisie. À pleine opacité, elle écrit la profondeur, donc elle participe à [l’occlusion](depth-and-culling.md) comme du sol ; en dessous de 100 % d’opacité, elle est mélangée et n’écrit pas de profondeur, donc elle ne cache rien. La [règle](measure.md) mesure sur son plan. La [bibliothèque de niveaux](level-library.md) enregistre un niveau image avec ses ancres.

## Carte de Dota 2 {#dota-2-map}

**Carte de Dota 2** à côté de **Image de carte…** récupère le dessin de la carte actuelle de Dota 2 que [OpenDota](https://www.opendota.com) affiche sur ses pages de match, et le place sous les tableaux que le [Watcher](https://github.com/Holdi601/3DHeat-Watcher) écrit à partir des replays de Dota 2 ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). L’image est récupérée sur opendota.com quand on appuie sur le bouton et ne fait pas partie de 3DHeat ; le dessin du dernier patch est pris dans la liste même d’OpenDota, et celui du 7.40 quand la liste ne peut pas être lue.

| | |
|---|---|
| Source | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Placement | La calibration d’OpenDota : l’image couvre les unités-monde de Dota de -8192 à 8064 sur les deux axes (cases de 128 unités, de 64 à 191), nord en haut. Avec les axes du tableau de replay (Z vertical, Y inversé), cela donne X monde de -8192 à 8064 et Z monde de -8064 à 8192. Environ 18 unités par pixel. |
| Altitude | 0. Les héros se tiennent de 0 à environ 600. |
| Aspect | Luminosité 0.8, désaturer 50 %. |

Vérifié sur le replay d’un match public du patch 7.40 : la trace de chaque héros suit les voies dessinées, et les tours, casernes et ancestraux que place le replay tombent sur les bases dessinées. La vue **Dessus** montre la carte avec le nord en bas de l’écran, comme elle le fait pour tout tableau à Z vertical avec Y inversé.

Le dessin est celui d’OpenDota, de la carte de Valve ; Valve n’approuve pas 3DHeat.

### La carte 3D {#the-3d-map}

Avec Dota 2 installé, l’outil séparé [3DHeat Dota](https://holdi601.github.io/3DHeat-Ext-Dota/) (`heat3d-dota-maps level -o dota.glb` ; la commande [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) du Watcher le lance aussi) crée la carte en 3D à partir des fichiers du jeu lui-même : sol, falaises, eau, arbres et bâtiments, dans les unités et les axes des tables des replays. Chargez le fichier une fois avec **Modèle 3D…** : la visionneuse le reconnaît à ses parties (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree` ; `isDotaLevel` dans `dotaMap.ts`), le range aussitôt dans la [bibliothèque de niveaux](level-library.md) en remplaçant une version plus ancienne, et l'indique. Dès lors, **Carte de Dota 2** charge cette carte 3D depuis la bibliothèque au lieu de télécharger le dessin ; s'il n'y en a aucune dans la bibliothèque, il télécharge le dessin et explique comment créer la carte 3D. Le fichier vient de votre propre installation et reste sur votre machine.

## Pour les développeurs {#for-developers}

### Comment les ancres placent l’image {#how-the-anchors-place-the-image}

Tiré de [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), avec les ancres *a* et *b* :

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Deux ancres fixent l’échelle et le décalage sur chaque axe indépendamment, si bien qu’une carte peut être étirée différemment en X et en Z, mais pas tournée. Les ancres doivent différer dans **les deux** coordonnées de pixel ; quand elles partagent une ligne ou une colonne, aucune échelle ne peut être déduite, la carte n’est pas dessinée, et le panneau affiche *Les deux ancres partagent une ligne ou une colonne de pixels*.
