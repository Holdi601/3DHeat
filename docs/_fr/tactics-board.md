---
title: "Tableau tactique"
nav_order: 12
has_children: true
lang: "fr"
source: "tactics-board.md"
source_hash: "e89ef050b0f2"
translated: true
outdated: false
---

# Tableau tactique

L'onglet **Tactique** est une planche à dessin pour un plan d'équipe : vous posez de petites figurines sur une carte, vous tracez des flèches pour leurs déplacements, et vous appuyez sur lecture pour voir la scène se jouer. Servez-vous-en pour préparer une manche ou une attaque avant de jouer. Il partage le canevas, la caméra et le [niveau](levels.md) avec les autres onglets, et rien d'autre ; un plan n'est pas une donnée et ne dessine aucune chaleur.

## Votre premier plan {#your-first-plan}

1. Ouvrez l'onglet **Tactique**. Choisissez le **Jeu** (par exemple Counter-Strike 2) et, pour Valorant, appuyez sur **Charger les cartes Valorant** puis choisissez une **Carte**. Vous pouvez aussi charger d'abord un [niveau](levels.md).
2. Choisissez un **Camp** (il règle la couleur) et appuyez sur **Vue de dessus**.
3. Choisissez **Lieu**, prenez une figurine dans **Figurines** (utilisez **Rechercher des figurines** pour en trouver une) et cliquez sur la carte. Placez-en deux ou trois.
4. Choisissez **Flèche**, cliquez sur une figurine, cliquez le long du chemin qu'elle doit suivre, et appuyez sur **Entrée** pour terminer la flèche.
5. Appuyez sur **+** sous la vue pour ajouter l'étape 2. Chaque figurine commence là où sa flèche s'est terminée. Tracez d'autres flèches à cet endroit.
6. Appuyez sur **▶** (ou `K`) pour jouer le plan à partir de l'étape affichée jusqu'à la fin.
7. Nommez le plan dans **Nom du plan** et appuyez sur **Enregistrer**.

![L'onglet Tactique en vue de dessus : jeu, camps et outils à gauche, trois figurines avec des flèches de déplacement, un arc de fumigène lancé, une zone et les étapes en bas](../assets/img/fr/tactics.webp)

## Démarrer un plan {#starting-a-plan}

| Commande | Ce qu'elle fait |
|---|---|
| **Jeu** | Choisit les camps et les figurines que propose la palette : Counter-Strike 2 (T, CT ; joueurs et utilitaires), Valorant (Attaque, Défense ; joueurs et capacités génériques), Battlefield, Squad, Arma (infanterie, véhicules terrestres, avions, bateaux), DCS / War Thunder / IL-2 (avions à réaction, avions à hélices, hélicoptères, défense aérienne, sol, navires, armes), et Autre. Un plan qui a déjà des figurines garde ses camps quand le jeu change. |
| **Nom du plan** | Le nom sous lequel le plan est enregistré. |
| **Carte**, **Charger les cartes Valorant** | Avec Valorant choisi : **Charger les cartes Valorant** obtient la liste des cartes depuis [valorant-api.com](https://valorant-api.com) ; **Carte** pose ensuite la mini-carte de la carte choisie comme niveau, cadrée par le haut. L'image est téléchargée au choix et n'est jamais livrée avec le logiciel. L'avis de Riot s'affiche tant qu'elle est à l'écran (voir plus bas). |
| **Camp** | Le camp auquel appartiennent la prochaine figurine, flèche ou zone ; elle prend la couleur du camp. |

Sans niveau, le tableau est le plan de sol plat. Chargez un niveau sous **Niveau** pour planifier sur une vraie carte : une carte CS2 exportée avec l'outil CS2, un niveau de la bibliothèque, ou une image de carte.

## Outils {#tools}

| Outil | Clic | Remarques |
|---|---|---|
| **Sélectionner** | Une figurine, un point de passage, une flèche, une zone ou une note la sélectionne. | Maj+clic ajoute ou retire ; Maj+glisser trace un cadre autour de ce qu'il faut ajouter. La sélection reçoit une poignée de transformation (voir plus bas) ; `Suppr` ou `Retour arrière` la retire. `M` déplace la figurine sélectionnée vers le prochain clic. |
| **Lieu** | Pose la figurine choisie. | Une figurine se choisit dans la palette **Figurines** (avec **Rechercher des figurines**). Sans sélection, `R` tourne la prochaine figurine de 15° avant qu'elle soit posée (`Maj+R` dans l'autre sens). |
| **Flèche** | Chaque clic ajoute un point ; Entrée, un double-clic ou un clic droit la termine, Échap la supprime. | **Déplacer**, **Attaque** (pointe plus large) ou **Surveiller** (une ligne fine à hauteur des yeux). Une flèche commencée sur une figurine est l'itinéraire de cette figurine à cette étape : rejouée, la figurine le parcourt, et l'étape suivante commence là où il s'est terminé. |
| **Lancer** | Le lanceur, puis l'endroit où cela atterrit. | Un arc en pointillés relie l'un à l'autre, et l'utilitaire choisi (fumée, flash, cocktail molotov, ...) apparaît à l'endroit d'atterrissage et y reste à partir de cette étape. |
| **Zone** | Le centre, puis le bord. | Un disque dans la couleur du camp. |
| **Note** | L'endroit de la note ; demande son texte. | Affichée comme une épingle, et son texte au-dessus. |
| **Effacer** | Une figurine, une flèche, une zone ou une note. | La retire à partir de cette étape ; sur sa première étape, la retire complètement. |

**Annuler** et **Rétablir** (`Ctrl+Z` ; `Ctrl+Y` ou `Ctrl+Maj+Z`) parcourent chaque modification. Une ligne sous le plan indique combien il a de figurines, de flèches et d'étapes. **Vue de dessus** regarde droit vers le bas (orthographique), **Vue 3D** revient à la perspective, **Image** cadre le plan, ou le niveau quand le plan est vide.

**Taille des figurines** met à l'échelle toutes les figurines du tableau ; 1× est la taille réelle, ce qui, vu de très haut, fait quelques pixels pour une personne.

## Déplacer, tourner et redimensionner {#moving-turning-and-scaling}

Tout ce qui est sur le tableau se déplace comme dans un éditeur 3D : figurines, utilitaires, repères, points de passage isolés et flèches entières, zones et notes. Ce qui est sélectionné reçoit une poignée en son milieu :

| Mode | Touches | Poignées |
|---|---|---|
| **Déplacer** | W (ou G) | Une flèche par axe (X rouge, Y vert et vers le haut, Z bleu) se déplace le long de lui ; un carré se déplace dans son plan ; le centre se déplace sur le niveau sous le pointeur. |
| **Pivoter** | E (ou R) | Un anneau par axe tourne autour de lui. Les anneaux d'une seule figurine sont son propre lacet, tangage et roulis ; un groupe tourne autour des axes du monde, autour de son milieu. |
| **Redimensionner** | R (ou S) | Écarte ou rapproche la sélection depuis son milieu le long d'un axe ou dans toutes les directions ; le rayon d'une zone grandit avec elle. |

Les **touches** basculent entre W / E / R (Unity, Unreal) et G / R / S (Blender) ; les touches ne choisissent le mode que lorsque quelque chose est sélectionné, et font voler la caméra sinon. Ainsi `R` veut dire **Redimensionner** avec les touches W / E / R et **Pivoter** avec les touches G / R / S quand quelque chose est sélectionné, et fait tourner la prochaine figurine à poser quand rien ne l'est. Toutes les touches du tableau sont listées dans la [référence clavier](keyboard-reference.md#tactics-board). Maintenez **Ctrl** en faisant glisser pour aligner un déplacement sur la **Grille** (mètres) ou une rotation sur le **Pas d'angle**. **Aligner au sol** (activé par défaut) pose les personnes, véhicules, repères, points de passage et zones déplacés sur la surface du niveau ; les avions et hélicoptères gardent leur hauteur, et un glissement le long de la flèche Y ne s'aligne jamais. Glisser une poignée ne déplace jamais la caméra. **Échap** annule un glissement, et chaque modification est une étape d'Annuler.

Les points de passage s'affichent sous forme de points sur les flèches de l'étape affichée : cliquez sur l'un pour le sélectionner, glissez-le pour le déplacer, Suppr pour l'enlever. La section **Sélectionnées** affiche la place de la sélection en mètres, le lacet, le tangage et le roulis d'une figurine en degrés, et le rayon d'une zone, chacun modifiable en tapant la valeur.

## Chronométrage {#timing}

L'itinéraire d'une figurine est chronométré : chaque segment prend sa longueur sur le niveau — échantillonnée sur la surface tous les deux mètres environ, si bien qu'une colline ou un escalier entre deux points compte — à la vitesse du **mode** de déplacement de cette figurine dans ce jeu, plus l'éventuelle **attente** à un point de passage. L'infanterie rampe, s'accroupit, marche (silencieuse), court ou sprinte ; les véhicules et bateaux avancent lentement, prudemment, normalement ou à fond ; les avions et hélicoptères volent lentement, en croisière, en vitesse de combat ou au maximum. Un mode que le jeu n'a pas (CS2 n'a pas de sprint) prend le plus proche de ceux qu'il a. Le ralentissement d'une pente dépend du jeu : dans CS2 et Valorant seule la distance horizontale compte, comme dans les jeux ; les simulations militaires ralentissent l'infanterie en montée (fonction de marche de Tobler) et les véhicules selon la pente.

Les vitesses viennent de tables propres à chaque jeu, avec leurs sources (voir [Vitesses de déplacement](tactics-speeds.md)) : CS2 selon l'arme tenue, d'après les définitions d'armes du jeu ; Valorant selon l'arme ; Battlefield, Squad, Arma et les jeux aériens selon le type et la classe de véhicule. **Se déplace comme** choisit le profil d'une figurine (une arme, un type de véhicule) ; **Perso (m/s)** remplace n'importe quel mode pour cette figurine. Les modes portent les noms affichés par le tableau : *Ramper*, *S'accroupir*, *Marcher (silencieux)*, *Courir*, *Sprinter* ; *Prudent*, *Normal*, *Rapide* ; *Lent*, *Croisière*, *Combat*, *Maximum*.

Chaque point de passage affiche le temps depuis le précédent et le temps depuis le début du plan (« +3,9 s · 0:12 »). L'itinéraire de la figurine sélectionnée liste chaque segment avec son mode, sa longueur et son temps, l'attente et l'arrivée. **Arrivées** sous **Chronométrage** place chaque figurine itinérante sur une seule ligne de temps, la première arrivée en haut. Avec **Lecture en temps réel** (activé par défaut), une étape dure jusqu'à l'arrivée du plus lent des itinéraires et chaque figurine se déplace à sa propre vitesse ; **Secondes** est alors la plus courte longueur de l'étape. **Unités du niveau par mètre** indique ce que vaut le niveau : 39,37 pour les cartes CS2 (unités du jeu), 1 pour les cartes en mètres.

## Comparer avec les données de match {#compare-with-match-data}

**Charger des matchs…** lit les tables de match CS2 de la carte (les fichiers Parquet de l'outil CS2, autant qu'on veut ; seulement les colonnes nécessaires, en arrière-plan) ; **Utiliser les données chargées** prend les données chargées dans la visionneuse. Ensuite :

- **Arrivée la plus précoce sur la carte** colore la carte selon le temps écoulé depuis le début de la manche auquel un joueur a atteint chaque endroit pour la première fois — le bouton **Le plus rapide** montre le plus rapide sur toutes les manches, **Typique (médiane)** la manche du milieu — du vert tôt au rouge tard, pour un camp ou les deux. Cela montre ce qui est possible et quand.
- L'itinéraire sélectionné est comparé à ce que les joueurs ont réalisé du début (ou du début de la manche) jusqu'à sa fin, chaque fin étant un disque du rayon réglé : « Le plus rapide observé 14,2 s, p10 15,0 s, médiane 18,3 s sur 41 essais ; votre plan 15,1 s ».
- Les vitesses réellement atteintes par les joueurs — course, marche, accroupi, d'après les colonnes de marche et d'accroupissement des tables — en m/s.

## Étapes {#steps}

La barre sous la vue contient les étapes. Un plan en commence une ; **+** en ajoute une, et chaque figurine y commence là où son itinéraire de la dernière étape s'est terminé ; **−** retire celle qui est affichée. **Secondes** indique la durée de l'étape affichée lorsqu'elle est jouée. **▶** (K) joue depuis l'étape affichée jusqu'à la fin : les figurines qui ont un itinéraire le parcourent, celles déplacées vers un nouvel endroit à l'étape suivante y glissent, et les autres restent immobiles. Pendant qu'une étape est affichée, la place de chaque figurine à l'étape suivante est dessinée en fantôme pâle, et les flèches de la dernière étape restent faiblement visibles sous celles de celle-ci.

## Enregistrer {#saving}

La section **Fichier** contient **Enregistrer**, **Ouvrir** et **Vider**. **Enregistrer** écrit le plan sous `<nom>.h3dplan.json` (JSON brut : camps, étapes, figurines avec une place par étape, flèches, zones, notes) ; **Ouvrir** le relit. Un fichier d'une autre version, ou qui n'est pas un plan, est refusé avec la raison. **Vider** efface le plan ; Annuler le rétablit.

## Figurines {#figures}

Chaque figurine est construite par la visionneuse elle-même : des formes simples à la taille publiée d'un type, avec les traits qui la distinguent de ses voisines — les roues de route et la tourelle d'un char, les canons, missiles et radars d'un véhicule de défense aérienne, le plan d'aile, la queue et les moteurs d'un avion, les rotors et les ailettes d'un hélicoptère. Rien n'est repris d'un jeu. Un modèle inventé par un jeu est montré comme la figurine générique de sa classe. Voir [Figurines](figures.md#which-figure-a-unit-gets) pour savoir comment les données trouvent leur figurine.

## L'avis de Riot {#riots-notice}

Les cartes Valorant sont montrées selon la politique « Legal Jibber Jabber » de Riot Games, qui autorise les projets communautaires gratuits à les utiliser et demande cet avis partout où elles apparaissent : *3DHeat was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.* Les capacités du tableau sont des formes génériques, pas l'art de Riot.
