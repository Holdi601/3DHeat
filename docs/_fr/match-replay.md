---
title: "Replay de match"
parent: "Replay"
nav_order: 1
has_children: true
lang: "fr"
source: "match-replay.md"
source_hash: "14a8aade5ff0"
translated: true
outdated: false
---

# Replay de match

Le replay est un film du match dans lequel chaque joueur est dessiné comme la chose qu’il conduisait. Servez-vous-en pour revoir un combat, suivre une unité et voir qui a touché qui.

Les tirs, les impacts, les incendies et les épaves sont dessinés sur les unités et les objectifs du niveau. Des caméras, des étiquettes et un affichage tactique vous aident à lire le combat. Vous connaissez Tacview ? [Parité avec Tacview](tacview-parity.md) indique où se trouve chacun de ses outils.

![Replay en figurines de la démo de chars : les chars sous forme de figurines propres, avec des étiquettes de nom, de véhicule et de vitesse](../assets/img/fr/replay-overview.webp)

## Lancer un replay {#start-a-replay}

1. Chargez un enregistrement avec **Source → Fichiers…** ou en le déposant dans le panneau Source (tout tableau avec une colonne **person** et une colonne **time**, un fichier Tacview, un replay converti, un match [`.3dheat`](container.md)). Voir [Importer des données](getting-data-in.md).
2. Ouvrez l’onglet **Match** et choisissez **Replay en figurines**, ou choisissez **Figurines superposées** dans la barre des modes de l’onglet Carte de chaleur.
3. Sous **Matchs du replay**, choisissez un match, tous à la fois, ou plusieurs.
4. Appuyez sur **Lecture** sur la chronologie (ou sur `K`). Faites glisser la chronologie pour sauter.

Les figurines remplacent les boîtes pour chaque unité dont le nom ou le type est connu (voir [Figurines](figures.md)). Les données sans colonne de nom ou de type sont dessinées comme des soldats.

![L’onglet Match : le sélecteur de matchs, la section Figurines, les vues de caméra, Lecture et la liste des événements](../assets/img/fr/match-replay-tab.webp)

## Figurines {#figures}

![Un char en feu vu par la caméra en orbite, avec le tir qui l’a touché](../assets/img/fr/replay-tanks.webp)

| Réglage (section **Figurines**) | Par défaut | Ce qu’il fait |
|---|---|---|
| **Figurines au lieu de boîtes** | activé | Désactivé, dessine de simples boîtes. |
| **Taille des figurines** (fois la taille réelle) | 1 | 1 est la taille réelle ; de 0.25 à 20 fois (échelle logarithmique). Plus grand aide de loin. |
| **Plus petite figure à l’écran** | 36 px | Les figurines lointaines grandissent pour rester visibles à cette taille, de 0 à 200 px ; 0 garde la taille réelle. |
| **À distance** : Figure, Flèche, Symbole | Figure | Ce qu’une unité lointaine devient. |
| **Symboles** | OTAN (APP-6) | OTAN (APP-6), signes tactiques russes, icônes **Carte de jeu**, ou **Formes seules (sans couleur)**. |
| **Taille des symboles**, **Mon camp**, **Hostile / Neutre**, **Traits de cap** | 28 px (12 à 64), automatique, hostile, activé | L’aspect des symboles et le camp qui est le vôtre. |
| **Lignes verticales** | activé | Une ligne part de chaque unité et descend jusqu’au sol, pour lire les hauteurs en 3D. |
| **Lignes de sol et étiquettes sur les armes** | désactivé | Lignes jusqu’au sol et étiquettes sur les missiles et les bombes. |
| **Incendies sur les unités** | activé | Des flammes, du moment où une unité prend feu jusqu’à ce que le feu soit éteint. |
| **Impacts sur les unités** | activé | Marques aux endroits où les tirs ont touché (ci-dessous). **Durée des impacts** : de 1 à 300 secondes, ou **Toute la vie**. **Marqueurs flottants** : marques dessinées au-dessus de la surface. |
| **Lignes de visée et de tourelle** | désactivé | En pointillés : où regarde le joueur ; en trait plein : où pointe le canon. |
| **Bâtiments** | plein | Bâtiments pleins ou transparents, quand le niveau les dessine. |

### Symboles à distance {#symbols-at-a-distance}

Quand une unité serait plus petite que **Plus petite figure à l’écran**, elle peut devenir un symbole qui reste lisible. La forme indique le genre (par exemple une boîte aux coins arrondis avec une marque de chenille pour un blindé) ; la couleur indique le camp. Ouvrez le menu **Symboles** pour changer le style.

![Les mêmes six unités en symboles OTAN, signes tactiques russes, icônes de carte de jeu et formes seules](../assets/img/fr/match-replay-symbols-styles.webp)

### Marques de coups, épaves et incendies {#hit-marks-wrecks-and-fires}

- **Les marques de coups** se posent sur la surface que le tir a rencontrée, à l’échelle de la figurine. Leur aspect dit ce qui s’est passé : un trou (traversé), une éclaboussure lumineuse (non traversé), une entaille (ricochet), une étoile de suie (obus explosif). Un anneau coloré dit l’effet : tir mortel, module détruit, critique, grave, dégâts, sans dégâts, touché. Survolez une marque pour voir le nom du projectile.
- Une unité détruite est dessinée **carbonisée** en épave, de sa mort jusqu’à sa réapparition ou sa suppression ; son symbole est barré.
- **Les incendies** brûlent sur une unité du moment où elle prend feu jusqu’à ce que le feu soit éteint.
- **Les tourelles** tournent vers l’endroit où les données indiquent que le canon pointe (ou, à défaut, vers l’endroit où regarde le joueur).

### Armes, leurres et traceurs {#weapons-decoys-and-tracers}

Avec **Armes, tirs et coups au but** activé (section Visionneuse d’équipe) : les missiles, roquettes, bombes et torpilles volent comme leurs propres figurines avec une traînée de fumée ; les balles et les obus sont des traceurs ; les impacts et les explosions illuminent. Un traceur tracé **en pointillés** a été reconstitué à partir d’un coup, car les données ne contenaient pas le tir. Les leurres et les paillettes sont dessinés comme des leurres ; ils sont masqués de la liste des unités, sauf si *Leurres et obus* est coché.

## Caméras {#cameras}

Cliquez sur une unité ou sur son étiquette pour la **suivre** ; la section **Replay** propose **Poursuite**, **Orbite**, **Cockpit** (avec un affichage tête haute, `H`), **Fixe**, **Padlock**, **Cible** et **Satellite**. `V` les fait défiler, **Distance de la caméra** règle la distance. Échap arrête.

- **Vue à deux unités** : choisissez une **Cible** (ou cliquez sur une unité avec Ctrl ou Alt) pour la regarder depuis l’unité suivie ; **Échanger** les inverse.
- **Mesure** : Maj-clic sur deux unités pour le relèvement, la portée et la différence de hauteur entre elles.
- **Carte 2D** (`M`) : vue en coin ou en plein écran, avec les traces et les noms.
- **Signets** (`B`) : enregistrent l’instant et la caméra ; les morts, les éliminations et les marques propres à l’enregistrement sont listés aussi.
- **Événements** : chaque événement dans l’ordre du temps ; un clic y saute. `Page précédente` / `Page suivante` sautent d’un événement à l’autre ; **Pause sur événement** s’arrête à chacun.

## Affichage tactique {#tactical-display}

![La démo aérienne avec l’aspect d’affichage tactique (T) : terrain en fil de fer, panneaux d’éliminations et d’événements](../assets/img/fr/replay-air-tactical.webp)

La section **Affichage tactique** dessine, pour aucune unité, les unités sélectionnées, toutes, ou un seul type (aéronefs, terrestres, navires, armes) : vecteurs de vitesse et trajectoire à venir, lignes du nez et de portance, cônes radar, verrouillages, liaisons de données, zones et lignes d’engagement, lignes de visée, là où les joueurs regardent (cônes de vision), visée des tourelles, et la caméra enregistrée.

### Style d’affichage {#display-style}

`T` (ou l’interrupteur **Afficher en mode tactique**) fait passer à un aspect d’écran radar : lueur, contours, courbes de niveau, grille de mesure, lignes de balayage, anneaux de portée, échelles d’altitude, panneaux d’éliminations et d’événements, et un **Réalisateur** qui déplace la caméra vers les événements tout seul.

![Le même combat aérien dans l’aspect normal](../assets/img/fr/replay-air.webp)

## Objectifs {#objectives}

Quand un match arrive avec ses objectifs, la section **Objectifs** les dessine sur le niveau : zones de capture (avec le propriétaire et la progression de la capture), points de départ, aérodromes, zones et cibles de bombardement, chaque couche pouvant être affichée ou masquée, avec des étiquettes. Ils se voient à travers le sol. Quand plusieurs modes de jeu sont chargés, **Mode** filtre les matchs par mode. Les objectifs viennent d’un fichier de match du convertisseur placé à côté de l’enregistrement, ou à l’intérieur d’un conteneur [`.3dheat`](container.md).

## Étiquettes et statistiques {#labels-and-statistics}

- **Étiquettes** : règles par genre (**Sélectionnées**, **Aéronefs**, **Terrestres**, **Navires**, **Armes**, **IA**) : affichées ou non, quelles valeurs, et une **Priorité** pour savoir qui obtient la place quand les étiquettes se chevauchent. **Écarter les étiquettes** déplace une étiquette à côté de son unité quand elle en couvrirait une autre, et la retire là où il n’y a pas de place. **Taille des étiquettes** va de 60 à 250 %. **Revenir au nom, véhicule, altitude et vitesse** rétablit les règles.
  - Les unités terrestres commencent avec le nom, le véhicule et la vitesse.
  - Les aéronefs commencent avec le nom, le véhicule, l’altitude et la vitesse.
  - Les navires commencent avec le nom, le véhicule, la vitesse et le cap.
  - Survolez une unité pour voir toutes ses valeurs.
- **Statistiques** : par équipe et par unité : éliminations, morts, tirs, coups au but, taux de réussite, décollages, atterrissages, temps en vol, vitesse maximale, hauteur et G, distance. Export CSV.
- **Graphiques** : les valeurs d’une unité au fil du temps, deux unités comparées, ou une valeur face à une autre.

## Beaucoup de matchs à la fois {#many-matches-at-once}

Pour superposer des centaines ou des milliers de matchs, voir [Beaucoup de matchs à la fois](many-matches.md). Détails des figurines (fumée, feu, autres effets datés) : [Figurines dans la superposition](figure-replay.md). Liste des fonctions Tacview : [Parité avec Tacview](tacview-parity.md), une page enfant de celle-ci.
