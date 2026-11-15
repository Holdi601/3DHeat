---
title: "Niveaux et géométrie de fond"
nav_order: 16
has_children: true
lang: "fr"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: false
---

# Niveaux et géométrie de fond

Un niveau est le lieu 3D où se déroulait la partie : une carte, une ville, un circuit. Placez-en un derrière vos données et vous voyez *où* se trouve la chaleur. Le panneau **Arrière-plan / niveau** (voir le [glossaire](glossary.md) pour « niveau ») vous donne trois types de contexte :

- une **image de carte**, géoréférencée par deux ancres - voir [Images de carte](map-images.md) ;
- un **niveau 3D** - `.glb`, `.gltf`, `.obj`, `.stl` ou `.ply` - découpé en sol, structures et eau, et simplifié à l'import - voir [Niveaux 3D](model-levels.md) et [Apparence du niveau](level-appearance.md) ;
- un **décor du monde réel** - pour un enregistrement qui indique où il se trouve sur la Terre (un fichier Tacview ACMI) : le vrai relief, les routes, l'eau, les aérodromes et les bâtiments, téléchargés depuis des données ouvertes - voir [Décor du monde réel](world-backdrop.md).

Sans rien de chargé, la scène est sombre avec une grille et des axes colorés (**Grille** et **Axes** dans [Caméra et scène](camera.md)), et le panneau indique *Rien de chargé - la scène affiche une grille et des axes. Ajoutez une image de carte ou un maillage de niveau pour donner du contexte à la chaleur.*

Le niveau est partagé par les trois onglets : un circuit chargé dans l'onglet Analyse de course est le même niveau que celui qu'affiche la carte de chaleur.

![Le panneau Arrière-plan / niveau avec un niveau chargé : boutons Image de carte et Modèle 3D, Théâtre, Opacité, Luminosité, Enregistrer dans la bibliothèque et la liste de la Bibliothèque](../assets/img/en/level-panel.webp)

## Placer un niveau derrière vos données {#put-a-level-behind-your-data}

1. Chargez d'abord vos données ([Importer des données](getting-data-in.md)), pour que le niveau soit ajusté à elles.
2. Ouvrez **Arrière-plan / niveau** dans la barre latérale.
3. Appuyez sur **Image de carte…** pour une image ou sur **Modèle 3D…** pour un niveau 3D, puis choisissez le fichier. Pour un enregistrement du monde réel, utilisez plutôt **Décor du monde réel** ou **Théâtre**.
4. Attendez la fin de la ligne de progression. Un gros modèle est d'abord simplifié (voir **Cible de simplification** plus bas).
5. Appuyez sur **F** dans la vue pour cadrer tout. Réglez **Opacité** et **Luminosité** jusqu'à ce que la chaleur ressorte du niveau.
6. Appuyez sur **Enregistrer dans la bibliothèque** si vous comptez réutiliser le niveau ([Bibliothèque de niveaux](level-library.md)).

## Ce que fait un niveau pour la chaleur {#what-a-level-does-for-the-heat}

- Il **occulte** : les points de données situés derrière lui sont assombris selon la surface, et ceux qui se trouvent derrière le terrain sont masqués ([Profondeur et élimination des faces](depth-and-culling.md)). Sans niveau, il n'y a pas d'occultation.
- Il est **coupé** par la [Coupe](slice.md) et, avec *Couper aussi le niveau*, par [l'élimination par distance](depth-and-culling.md#distance-culling), en même temps que la chaleur.
- C'est la seule chose que [la profondeur de champ](camera.md#depth-of-field) floute, en dehors de la grille et des boîtes.
- Un niveau 3D **élargit le plan lointain de la caméra** lorsqu'il est plus grand que les données : le proche et le lointain sont calibrés d'après le jeu de données, et une carte exportée de plusieurs kilomètres de côté resterait entièrement derrière le plan lointain et laisserait une vue vide. Le plan lointain devient 3 × l'étendue horizontale du niveau lorsqu'elle est plus grande, le plan proche le suit (au moins lointain / 100 000) pour conserver la précision de profondeur dont dépend l'occultation, et la vitesse de vol est relevée à au moins étendue / 12. Il n'est jamais rétréci, seulement élargi.

## Le panneau, de haut en bas {#the-panel-top-to-bottom}

| Élément | Détails |
|---|---|
| **Image de carte…**, **Modèle 3D…** | Charge l'un ou l'autre ; remplace le niveau en cours. |
| **Décor du monde réel**, **Oublier les tuiles** | Seulement pour un jeu de données avec une référence géographique : construit le vrai lieu sous lui comme niveau, ou supprime les tuiles téléchargées. [Décor du monde réel](world-backdrop.md) |
| **Cible de simplification** | Le budget de triangles pour le prochain import de modèle : *Complet - sans simplification* (par défaut), *Élevé - 8 M*, *Moyen - 3 M*, *Faible - 800 k*, *Silhouette - 100 k*. [Niveaux 3D](model-levels.md#simplification) |
| Progression et **Annuler** | Pendant le décodage ou l'import. |
| Note d'import | Triangles avant et après, découpage sol / structures / eau, niveau de détail utilisé. |
| Nom et taille | `largeur×hauteur px · x × z m/px` pour une image, `N triangles (sur M)` pour un modèle. |
| **Opacité**, **Luminosité** | Pour les deux types. |
| Commandes de l'image | **Désaturer**, **Inverser nord/sud**, **Placement** (deux ancres), **Ajuster aux limites des données**, **Altitude**. [Images de carte](map-images.md) |
| Commandes du modèle | Relief du sol, eau, triangles du sol, fil de fer, texture, couleur capturée, structures, classement des parties. [Apparence du niveau](level-appearance.md) |
| **Enregistrer dans la bibliothèque**, **Retirer** | [Bibliothèque de niveaux](level-library.md) ; Retirer décharge le niveau. |
| **Bibliothèque** | Les niveaux enregistrés dans ce navigateur. [Bibliothèque de niveaux](level-library.md) |

## Pages de cette section {#pages-in-this-section}

- [Images de carte](map-images.md)
- [Niveaux 3D](model-levels.md) - formats, parties, classement, simplification, textures
- [Apparence du niveau](level-appearance.md) - chaque commande d'un niveau 3D
- [Bibliothèque de niveaux](level-library.md)
- [Décor du monde réel](world-backdrop.md) - le monde réel sous un enregistrement, à partir de données ouvertes

Obtenir des niveaux depuis des jeux et des moteurs relève des outils d'export séparés (voir le [README](https://github.com/Holdi601/3DHeat/blob/main/README.md) du dépôt) ; le contrat auquel ils écrivent est résumé dans [Niveaux 3D](model-levels.md#the-exporter-contract).
