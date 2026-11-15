---
title: "Caméra et commandes"
nav_order: 14
has_children: true
lang: "fr"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Caméra et commandes

Vous survolez la scène comme un oiseau : **W A S D** pour vous déplacer, glissez la souris pour regarder. Utilisez cette page pour voler, passer à une vue de dessus ou de côté, et lire exactement où se trouve la caméra.

## Voler en 4 étapes {#fly-in-4-steps}

1. Cliquez une fois sur la vue pour qu'elle reçoive le clavier.
2. Maintenez **W** pour avancer, **S** pour reculer, **A** et **D** pour aller de côté, **Espace** pour monter, **Q** pour descendre.
3. Maintenez le bouton gauche ou droit de la souris et glissez pour regarder autour de vous.
4. Appuyez sur **F** pour cadrer à nouveau toutes les données.

La caméra est une caméra libre avec une projection en perspective et une projection parallèle, des vues préréglées, une pose saisie et une profondeur de champ. Ses réglages sont dans le panneau **Caméra et scène**, en bas de la barre latérale (également affiché dans les onglets Analyse de course et Match). L'implémentation est [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Voler {#flying}

| Commande | Effet |
|---|---|
| `W` `A` `S` `D` ou les touches fléchées | Avant (dans le sens de la vue, tangage compris), gauche, arrière, droite |
| `Espace` ou `E` | Monter (vers le haut du monde) |
| `Q` ou `Ctrl` gauche | Descendre |
| `Maj` (maintenue) | 6 fois plus vite |
| `Alt` gauche (maintenue) | 15 % de la vitesse |
| Glisser avec le bouton gauche ou droit de la souris | Regarder autour. Le pointeur est verrouillé pendant le glissement. |
| Molette de la souris | Vitesse de vol ×1,5 par cran (perspective) ; zoom (parallèle) |
| `F` | Cadrer les données |
| Clic (sans glisser) | Montrer ce qui se trouve sous le pointeur ([Inspecter la vue](#inspecting-the-view)) |
| `C` | Copier la position, le lacet et le tangage de la caméra |
| `G` | Aller à un point saisi |
| `Échap` | Fermer la fiche de sélection (et arrêter de suivre une unité) |

### Pendant le suivi d'une unité {#while-following-a-unit}

Lorsque la caméra suit une unité dans un replay ([Replay de match](match-replay.md)), les touches de vol font autre chose :

| Commande | Effet |
|---|---|
| Molette, `W` / `S` | Plus près de l'unité / plus loin (plus haut / plus bas dans la vue satellite) |
| `A` / `D`, `Q` / `E` | Tourner autour de l'unité (vues poursuite et orbite) |
| Glisser | Regarder autour de l'unité (cockpit : regarder à l'intérieur) |
| `V` / `Maj+V` | Vue de caméra suivante / précédente |
| `Échap` | Arrêter de regarder la deuxième unité d'abord, puis arrêter de suivre |

Les touches de déplacement s'ajoutent à une [manette](gamepad.md) ; voir la [référence clavier](keyboard-reference.md) pour le reste. Les touches sont ignorées lorsqu'une zone de texte ou une liste déroulante a le focus. Le tangage est limité juste en deçà de la verticale, vers le haut comme vers le bas.

## Panneau Caméra et scène {#camera--scene-panel}

![Le panneau Caméra et scène : Projection, Vues préréglées, boutons Champ de vision, Vitesse de vol et Pose](../assets/img/en/camera-panel.webp)

### Projection {#projection}

**Projection** : *Perspective* (par défaut) ou *Parallèle*.

*Parallèle* (orthographique) supprime le raccourcissement : deux points chauds de même densité ont la même taille partout dans l'image, ce qui est la comparaison que sert une carte de chaleur, et c'est ce qui rend une vue isométrique vraiment isométrique. En mode parallèle, la molette du pointeur zoome (il n'y a pas de mouvement vers l'avant qui change l'échelle), et l'[affichage de la vitesse](#fly-speed) est masqué.

**Changer de projection garde le sujet à la même taille.** Une projection parallèle n'a pas de champ de vision, donc la hauteur de son volume de vue n'a aucun lien avec la distance de la caméra ; un basculement naïf zoome de façon démesurée ou ne montre rien. Passer en parallèle règle la hauteur du volume sur ce que la caméra en perspective couvre à la distance de mise au point (2 × distance × tan(champ / 2), la distance de mise au point étant celle du dernier cadrage). Revenir restaure la pose en perspective que vous aviez quittée, à la même échelle apparente, plutôt qu'à l'endroit où la vue parallèle a dérivé.

### Vues préréglées {#preset-views}

| Groupe | Boutons | Orientation |
|---|---|---|
| **Isométrique** | **NE**, **NO**, **SE**, **SO** | Parallèle, tangage -35,264° (= atan(1/√2), l'angle où les trois axes se projettent à la même longueur), lacet -45°, 45°, -135°, 135°. Quatre coins, parce qu'un seul masque toujours la moitié de la carte derrière ce qui est le plus proche. |
| **Élévations** | **Dessus**, **Dessous**, **Avant**, **Arrière**, **Gauche**, **Droite** | Parallèle. Dessus regarde droit vers le bas (tangage -89,9°), Dessous droit vers le haut, Avant suit -Z (lacet 0°), Arrière suit +Z (180°), Gauche suit -X (-90°), Droite suit +X (90°). |
| | **Retour à la perspective** | Revient à la pose en perspective que vous aviez quittée. Désactivé en perspective. |
| | **Vue de trois quarts** | Perspective, lacet -35°, tangage -28°. |

Chaque préréglage change la projection elle-même (en perspective, une « vue de dessus » converge encore vers un point de fuite, et des surfaces égales cessent de paraître égales) et cadre les données depuis cette direction.

### Champ de vision {#field-of-view}

**Champ de vision** : l'angle vertical. Par défaut 65°, de 10 à 140° sur la glissière (179° avec la poignée), avec les boutons **Plat 20°**, **Long 35°**, **Normal 50°**, **Large 65°**, **Très large 90°**. Étroit aplatit la perspective et ressemble davantage à une projection parallèle ; large exagère la profondeur et rend les distances difficiles à juger. Il reste actif en mode parallèle, où il règle l'échelle que le retour à la perspective calcule et la distance qu'utilise **Cadrer**.

### Vitesse de vol {#fly-speed}

**Vitesse de vol** : unités du monde (mètres) par seconde à pleine poussée. Par défaut 120 ; à chaque chargement, l'étendue horizontale des données / 12. Logarithmique, de 0,02 à 20 000 (200 000 avec la poignée ; la poignée la modifie par rapports, pas par quantités). La molette de la souris la multiplie ou la divise par 1,5 par cran, dans la limite de 0,02 à 200 000.

La même valeur s'affiche en bas à droite de la vue (en perspective seulement) : la vitesse en m/s ou km/s, et le temps qu'il faut pour traverser les données (ou le niveau, lorsqu'un niveau 3D est chargé) à cette vitesse. Glissez-la vers le haut ou vers le bas pour changer la vitesse.

### Proche et lointain {#near-and-far}

Distances de découpe **Proche** (par défaut 0,5) et **Lointain** (par défaut 40 000). Les deux sont recalculées à partir des données à chaque chargement (proche = max(0,05 ; étendue / 20 000), lointain = étendue × 12), et élargies, jamais rétrécies, par un niveau 3D plus grand ([Niveaux](levels.md#what-a-level-does-for-the-heat)). Leur rapport fixe la précision de profondeur sur laquelle s'appuie le masquage ; un proche minuscule avec un lointain énorme affaiblit le [masquage](depth-and-culling.md). Vu de l'extérieur de la scène ou de haut au-dessus de son sol, le plan proche utilisé se déplace en fait jusqu'à 2 % de cette distance, pour qu'une carte vue de très haut garde assez de précision de profondeur et que l'eau et la rive ne scintillent pas ; la case affiche toujours la valeur réglée.

### Autres réglages {#other-controls}

| Réglage | Par défaut | Signification |
|---|---|---|
| **Inverser Y** | désactivé | Inverse le regard de la souris vers le haut et vers le bas. |
| **Profondeur de champ** | désactivé | Voir plus bas. |
| **Manette** | activée | Voir [Manette et HOTAS](gamepad.md). |
| **Pose** | | Voir plus bas. |
| **Inspecter** | | La lecture de la caméra, le clic pour choisir, la convention de lacet et *Aller à un point* ; voir [Inspecter la vue](#inspecting-the-view). |
| **Cadrer le jeu de données (F)** | | Ajuste les données (dans l'onglet Analyse de course : les tours) à la vue, en gardant la direction actuelle. La caméra est placée à r / tan(champ / 2) du centre, r étant la demi-diagonale de l'emprise des données. |
| **Grille**, **Axes** | activés, activés | Une grille au sol au pas 1/2/5 × 10ⁿ d'environ 1/40 de l'étendue des données (s'étendant à 1,5 fois les données, entre 8 et 120 pas de grille), et des axes colorés. |
| **Inverser un axe du monde** X, Y, Z | désactivé | Voir plus bas. |

### Pose {#pose}

Cinq cases numériques, **X**, **Y**, **Z** et **lacet °**, **tangage °**, qui suivent la caméra tant qu'aucune n'a le focus. Tapez une valeur et appuyez sur `Entrée` (ou quittez la case) pour déplacer la caméra à cet endroit. **copier** place `pos X Y Z · lacet A · tangage B` dans le presse-papiers (avec `(lacet du jeu)` après, lorsque cette convention est choisie). Voler sert à explorer ; les coordonnées servent à reproduire une vue. Ce sont les mêmes nombres que la [lecture de la caméra](#camera-readout) : les coordonnées propres aux données, y compris lorsqu'un axe est inversé, et le lacet dans la [convention](#yaw-conventions) choisie.

### Inverser un axe du monde {#invert-world-axis}

**Inverser un axe du monde X / Y / Z** dessine le monde avec cet axe dans l'autre sens. Un jeu qui garde un monde gaucher apparaît en miroir dans ce visualiseur droitier : les virages à droite s'affichent comme des virages à gauche, et inverser X ou Z rétablit l'ordre. **Seul le dessin change** : les données, l'analyse et chaque coordonnée que montrent les outils (pose, règle, coupe) restent celles du jeu. La vue se retourne sur place, en gardant le même point regardé. Ce réglage est mémorisé dans le navigateur (clé `localStorage` `heat3d.mirror`) ; à comparer avec les [retournements](axes-units-and-time.md#flips) au chargement, qui changent les données.

## Inspecter la vue {#inspecting-the-view}

Où se trouve la caméra, ce qui est sous le pointeur, et aller à un point : le bloc **Inspecter** du panneau Caméra et scène, et deux superpositions en haut à gauche de la vue. Le code est dans [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) et [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Réglage | Par défaut | Signification |
|---|---|---|
| **Position de la caméra sur la vue** | activé | La lecture de la caméra, ci-dessous. Se ferme aussi avec sa **×**. |
| **Un clic montre ce qui s'y trouve** | activé | Choix au clic, ci-dessous. |
| **Convention de lacet** | Visualiseur | Quel lacet la lecture, les cases de pose et la case de saut montrent et lisent. |

Ces trois réglages sont mémorisés dans le navigateur (clé `localStorage` `heat3d.inspect`).

### Lecture de la caméra {#camera-readout}

En haut à gauche de la vue : **x**, **y**, **z**, **lacet** et **tangage** de la caméra, en direct, avec une étiquette qui nomme la convention de lacet. Elle affiche les mêmes nombres que les cases de [Pose](#pose) et ne coûte rien pendant le vol (elle est écrite dans la page à la cadence de l'image, sans redessiner les panneaux).

- **copier** (ou `C` n'importe où hors d'une zone de texte) place `x X y Y z Z lacet A tangage B (lacet du visualiseur)` dans le presse-papiers, avec des décimales `.` quelle que soit la langue : une ligne que la case de saut, et tout script, peut relire.
- **aller à** (ou `G`) ouvre une case en dessous : collez un point et appuyez sur `Entrée` pour le regarder, ou collez une pose copiée en entier pour vous placer dans cette vue. `Échap` ferme la case.

### Coordonnées : le repère propre aux données {#coordinates-the-datas-own-frame}

Chaque coordonnée que les outils d'inspection montrent ou acceptent est dans le **repère propre aux données chargées** : le [réglage des axes](axes-units-and-time.md) du chargement (axe vertical, retournements, échelle) est annulé. Une position lue sur la vue est le nombre que contient la table source, et un nombre de la table tapé dans la case de saut mène à ce point. Lorsque le réglage ne change rien (un chargement où Y est vertical et sans échelle, ce qu'écrivent les outils de capture et les exporteurs de niveaux), c'est simplement le monde ; sinon la lecture porte une étiquette **repère des données**. Sans jeu de données, les coordonnées sont celles du monde. Le lacet et le tangage se rapportent toujours au monde du visualiseur, Y vers le haut.

### Conventions de lacet {#yaw-conventions}

| Convention | Le lacet 0° regarde suivant | Croît vers | Utilisée par |
|---|---|---|---|
| **Visualiseur** | -Z | -X | la caméra libre, [vues préréglées](#preset-views) |
| **Jeu / outils de capture** | +X | -Z | les colonnes `yaw` et les poses des outils de capture ; dans un niveau exporté dans le repère du visualiseur, le lacet propre au jeu |

Le tangage est le même dans les deux : au-dessus de l'horizontale. Les deux diffèrent d'un quart de tour, et rien d'autre :

> lacet du visualiseur = lacet du jeu - 90°

Une direction `d` vaut `(cos p · cos y, sin p, -cos p · sin y)` dans la convention du jeu et `(-sin y · cos p, sin p, -cos y · cos p)` dans celle du visualiseur. Choisissez **Jeu / outils de capture** pour taper un lacet directement depuis une table de capture, ou pour comparer la lecture avec l'une d'elles.

### Aller à un point {#going-to-a-point}

**Aller à un point**, dans le bloc Inspecter (et la case **aller à** de la lecture) :

- la zone de texte accepte `x, y, z` ou `x y z` (ou `x; y; z`), avec un point décimal ou une virgule décimale : `-321.6, 137.8, -59.9` et `-321,6 137,8 -59,9` désignent le même point. Cinq nombres ajoutent un lacet et un tangage, et une pose copiée depuis la lecture ou les cases de pose est lue en entier, étiquettes et convention comprises ;
- **lacet °** et **tangage °** (facultatifs) tournent la caméra, dans la convention choisie ;
- **Regarder** garde le cap (incliné pour regarder vers le bas d'au moins 20° s'il regardait à l'horizontale) et recule le long de ce cap jusqu'à la distance actuelle, maintenue entre 0,3 % et 3 % de la largeur de la scène, soit 6 à 60 m sur un niveau de deux kilomètres. La distance de mise au point, la hauteur de la vue parallèle et la vitesse de vol suivent, pour que la vue arrive utilisable ;
- **Se placer ici** met la caméra sur le point, tournée selon le lacet et le tangage donnés, ou comme elle était.

Une pose collée avec son propre lacet et son propre tangage prend toujours cette vue.

### Choisir en cliquant {#click-to-pick}

Un clic sur la vue (appui puis relâchement sans glisser plus de 4 pixels ; un glissement regarde encore autour) affiche une fiche en haut à gauche avec ce qui se trouve sous le pointeur. Lorsque la [règle](measure.md) est active, les clics vont à la règle.

**Un point de donnée dessiné l'emporte.** L'échantillon le plus proche à moins de 8 pixels du clic, parmi ceux réellement dessinés : les lignes de la fenêtre temporelle et de la durée de vie, qui passent les [filtres](filters.md), les groupes affichés et la séparation des différences, à l'intérieur de la coupure de distance et d'une coupe qui découpe la chaleur. Dans le replay en boîtes, une boîte sous le pointeur (n'importe où sur elle). La fiche liste chaque colonne que porte la ligne, sous les noms de colonnes propres à la source (temps (heure de l'horloge, ou les secondes du fichier avec `m:ss.ss`), personne, groupe, session, chaque colonne conservée, la position et la direction du regard) et la distance à la caméra. Seules les colonnes gardées au chargement sont en mémoire : une colonne non choisie comme [colonne de filtre](column-mapping.md) n'est pas affichée.

**Sinon, la surface du niveau** : le point où le rayon du clic rencontre les vrais triangles du niveau (et non le plan de référence de la règle), avec la **partie** à laquelle il appartient (le nom donné par l'exporteur, `structure:props`, `ground:terrain …`), son **type** (sol, structure, eau, image de carte), les coordonnées et la distance. La géométrie masquée par une coupe ou par la coupure de distance est traversée. Lorsque le niveau a un [maillage de navigation](model-levels.md#navigation-meshes), une ligne le nomme et indique si le point s'y trouve (✓). Un nom de partie précédé de `≈` a été deviné à partir des boîtes englobantes des parties, parce que cette partie du niveau a été simplifiée au chargement.

La fiche reste jusqu'à sa fermeture (**×**, `Échap`), jusqu'à ce qu'un autre clic réponde à autre chose, ou qu'un clic dans le vide la remplace. Une croix cyan est dessinée au point dans la scène, et un anneau par-dessus à l'écran. Ses boutons : **copier** (toutes les valeurs, et les coordonnées sous la forme `x, y, z`), **Regarder**, et **Se placer ici** (sur un point de donnée, en regardant comme la ligne regardait lorsqu'elle a une direction de regard ; sur une surface, 1,7 m au-dessus).

Le niveau est indexé pour le choix au premier clic qui en a besoin : une grille de colonnes sur son emprise, construite quelques millisecondes à la fois entre les images pour que la vue ne s'arrête jamais (environ une seconde de travail pour un niveau de plusieurs millions de triangles), et gardée jusqu'au changement de niveau. Jusque-là, la fiche affiche *Préparation du niveau pour le choix* avec un pourcentage, et répond au clic quand il est prêt. Une recherche de point de donnée parmi plus de quatre millions de lignes dessinées est répartie de la même façon sur plusieurs images.

## Profondeur de champ {#depth-of-field}

Une section repliable dans Caméra et scène, intitulée *Profondeur de champ - activée* lorsqu'elle est active. Désactivée par défaut : c'est un effet de présentation, et la vue par défaut doit montrer les données plutôt qu'une interprétation d'elles.

| Réglage | Par défaut | Plage (glissière) | Signification |
|---|---|---|---|
| **Activée** | désactivé | | |
| **Mise au point sur ce qui a été cadré** | activé | | Mise au point à la distance qu'utilisait le dernier cadrage (*Mise au point à N m.*). |
| **Distance de mise au point** | 1000 | 1 à 200 000, logarithmique (10 000 000) | Affichée lorsque la mise au point est manuelle. |
| **Ouverture** | ±35 % | ±2 % à ±200 %, logarithmique (±3200 %) | La profondeur gardée nette, en fraction de la distance de mise au point : relative plutôt qu'un nombre f, parce que les scènes vont d'une pièce à une carte de huit kilomètres. |
| **Flou maximal** | 12 px | 1 à 48 (256) | Le plus grand rayon de flou ; le coût croît avec lui. |

Il floute le **niveau, la grille et les boîtes** - *pas la chaleur*. La chaleur d'un pixel est la somme de sprites à de nombreuses profondeurs : elle n'a donc pas de profondeur unique pour être hors de mise au point ; la flouter selon la géométrie qui se trouve derrière serait faux partout où elle flotte devant. Des données nettes sur un contexte adouci sont aussi le plus utile des deux. Le flou est une collecte de 24 échantillons à l'angle d'or, pondérée pour qu'un premier plan net ne soit pas étalé vers l'extérieur par l'arrière-plan flou. Le changer redessine sans relancer l'accumulation de chaleur.

## Résolution du canevas {#canvas-resolution}

Le canevas est rendu au rapport de pixels de l'écran, plafonné à 2. Le tampon de chaleur peut être rendu à une résolution plus basse que celle-ci ([Résolution de la chaleur](performance-and-stats.md)).

## Pages de cette section {#pages-in-this-section}

- [Manette et HOTAS](gamepad.md)
- [Référence clavier et souris](keyboard-reference.md)
