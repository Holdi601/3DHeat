---
title: "Bibliothèque de niveaux"
parent: "Niveaux et géométrie de fond"
nav_order: 4
lang: "fr"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Bibliothèque de niveaux

La bibliothèque garde vos niveaux dans ce navigateur, pour que vous n'ayez pas à les charger et à les simplifier de nouveau. **Vider les données du site dans le navigateur supprime la bibliothèque, et il n'existe pas d'export.** Gardez vos fichiers d'origine.

Traiter un niveau (analyse, classement, soudure, décimation, assemblage des textures) est lent, et le résultat est toujours le même. La **Bibliothèque**, en bas du panneau Arrière-plan / niveau, garde les niveaux traités dans ce navigateur. Ainsi, un maillage décimé n'est jamais reconstruit deux fois ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Enregistrer et recharger un niveau {#save-and-reload-a-level}

1. Chargez une image de carte ou un modèle 3D et vérifiez qu'il paraît juste.
2. Appuyez sur **Enregistrer dans la bibliothèque**. Le panneau affiche *Enregistré. Il se chargera instantanément la prochaine fois.*
3. La prochaine fois, ouvrez la liste **Bibliothèque** et appuyez sur ▸ à côté du niveau.
4. Appuyez sur ✕ pour supprimer une entrée dont vous n'avez plus besoin.

## Utilisation {#using-it}

| Commande | Effet |
|---|---|
| **Enregistrer dans la bibliothèque** | Stocke le niveau actuel. Une image de carte est stockée en PNG avec ses deux ancrages ; un modèle, comme ses tampons traités. Le panneau affiche *Enregistré. Il se chargera instantanément la prochaine fois.* |
| Liste de la bibliothèque | Une ligne par niveau stocké : nom (avec sa taille stockée au survol), triangles pour un modèle ou largeur en pixels pour une image. |
| ▸ (*Charger*) | Charge l'entrée comme niveau actuel. |
| ✕ (*Supprimer*) | Retire l'entrée. |
| Ligne d'utilisation | `Utilisé : X sur Y.` : l'estimation de stockage du navigateur pour ce site. |

Sans rien de stocké, la liste affiche *Vide. Chargez une carte ou un modèle, puis « Enregistrer dans la bibliothèque ».*

## Ce qui est stocké {#what-is-stored}

| Type | Stocké | Non stocké |
|---|---|---|
| Image de carte | L'image (PNG), sa taille, ses ancrages | Altitude, miroir, opacité, luminosité, désaturation : remis aux valeurs par défaut (altitude = le Y le plus bas du jeu de données actuel, miroir activé) |
| Niveau 3D | Sommets, couleurs des sommets, coordonnées de texture, leurs tuiles et l'atlas de textures, triangles de sol, de structures et d'eau, arêtes des structures, nombres de triangles | Noms des parties et raisons de classement, et tous les réglages d'apparence : remis aux valeurs par défaut d'un import neuf |

Un modèle chargé depuis la bibliothèque n'a pas de liste de parties. Ses limites et sa bande de hauteur du sol sont recalculées à partir de ses sommets.

## Où elle se trouve {#where-it-lives}

Dans IndexedDB du navigateur, base `3dheat`, magasin d'objets `levels`, pour l'origine de la page (l'adresse affichée dans la barre d'adresse du navigateur). Elle est locale à ce profil de navigateur : un autre navigateur, un autre profil ou une autre adresse (par exemple `localhost` au lieu de `127.0.0.1`) voit une bibliothèque différente et vide. Vider les données du site dans le navigateur la supprime. Les entrées enregistrées par des versions plus anciennes, sans structures, couleurs ni eau, se chargent toujours.
