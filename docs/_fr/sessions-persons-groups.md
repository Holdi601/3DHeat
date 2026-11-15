---
title: "Sessions, personnes et groupes"
parent: "Importer des données"
nav_order: 4
lang: "fr"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sessions, personnes et groupes

Une **personne** est une chose qui bouge (un joueur, une voiture). Une **équipe / groupe** est le camp auquel elle appartient. Une **session** est un match ou un tour. Voir le [glossaire](glossary.md).

Une seule ligne d'un fichier peut nommer les trois :

| x | y | temps | joueur | équipe | match |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` est la personne, `team` le groupe, `match` la session.

Trois colonnes facultatives décrivent *qui* et *où dans l'histoire* appartient une ligne. Chacune est encodée en dictionnaire au chargement : les valeurs de texte deviennent de petits identifiants entiers par ligne, plus une seule liste d'étiquettes, partagée entre tous les fichiers du chargement.

## Personne {#person}

La colonne **Identifiant de personne** nomme la chose qui bouge à laquelle une ligne appartient : un joueur, un bot, une voiture. Elle est stockée sous forme d'un identifiant de 32 bits par ligne.

Avec une colonne de personne et une colonne de temps, le chargement calcule la **durée de vie** de chaque ligne : le temps jusqu'au prochain échantillon de la même personne *dans la même session*, ou « aucune » (une valeur sentinelle, -1) quand il n'y a pas d'échantillon suivant — la personne est morte, est partie, ou le journal s'est terminé. Les durées de vie alimentent l'historique **Durée de vie** de la [chronologie](timeline.md), l'interpolation et l'obsolescence dans le [replay de boîte](box-replay.md), et les coupures de parcours de la [chaleur par lignes](line-heat.md). Ce que fait une ligne sans suivante est un réglage d'affichage (*Durée de vie de repli*), pas une donnée figée.

Chaque personne reçoit le groupe de sa **première** ligne dans le temps ; cette attribution colore sa boîte dans le replay de boîte et décide quel interrupteur de visibilité de groupe la cache là. Les modes de chaleur utilisent plutôt le groupe propre à chaque ligne.

### Des noms portés par plusieurs choses à la fois {#names-worn-by-several-things-at-once}

Un nom n'est pas toujours une seule entité : dans certains exports, chaque bot de chaque match s'enregistre sous un même nom. Relier deux échantillons d'une telle « personne » — par interpolation, une traînée ou un parcours — trace une ligne entre deux créatures différentes à travers la carte.

Au chargement ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)), un nom est marqué **partagé** quand deux de ses enregistrements :

- sont dans la même session,
- ont le même temps,
- sont du même genre (chaque colonne de catégorie retenue a la même valeur), et
- sont plus éloignés que 1 % de la diagonale de l'étendue des données.

Les noms partagés sont dessinés comme des échantillons isolés — pas d'interpolation, pas de traînée, pas de parcours de chaleur par lignes. Le reste de leur comportement (leur chaleur) n'est pas touché. Le panneau Jeu de données indique combien de noms ont été marqués, avec jusqu'à trois exemples, et le panneau du replay de boîte répète ce compte.

## Session {#session}

La colonne **Session / match** dit à quel match, raid, manche, partie ou tour une ligne appartient. C'est elle qui fait d'une suite d'échantillons d'une personne une seule trajectoire continue : les vraies télémétries mêlent souvent des matchs simultanés, et l'échantillon d'un joueur juste avant la tête de lecture et celui juste après peuvent venir de matchs différents, à des centaines de mètres l'un de l'autre. Avec une colonne de session :

- l'interpolation, les traînées et les parcours de chaleur par lignes ne franchissent jamais un changement de session ;
- la durée de vie d'une ligne se termine à la fin de sa propre session ;
- le sélecteur **Session** apparaît en haut de la barre latérale, sous la barre des modes.

Une colonne de session est très souvent un *horodatage* — l'instant de début du match, répété sur chaque ligne de ce match. Le mappage automatique cherche les noms de session avant ceux de personne et de groupe pour cette raison ([Mappage des colonnes](column-mapping.md#session-person-group)). Un tour ou un relais de course est aussi une session : deux tours de la même voiture ne doivent pas être reliés en une seule trajectoire.

### Le sélecteur de session {#the-session-picker}

![Le sélecteur de session ouvert sur un fichier de dix matchs : Toutes les sessions (10), Match 01, Match 02 et ainsi de suite](../assets/img/en/sessions-persons-groups-picker.webp)

*Dix matchs dans un fichier : choisissez-en un ou voyez-les tous.*

Affiché quand le jeu de données a des sessions listées (voir la limite plus bas).

| Partie | Signification |
|---|---|
| Étiquette à droite | Le nombre de lignes de la session choisie, ou *tout à la fois*. |
| Menu | *Toutes les sessions (N)*, puis chaque session, la plus chargée d'abord, sous la forme `étiquette - N lignes, durée` (durée en secondes sous 90 s, en minutes sous 90 min, en heures au-delà). |
| Indication ambre | Affichée pour *Toutes les sessions* : les positions ne sont toujours jamais reliées entre sessions, mais des matchs simultanés mettent des joueurs sans rapport sur la carte ensemble. |
| Indication | Affichée dans les modes de chaleur quand une session est choisie : le choix ne fait que déplacer la tête de lecture. |

Au chargement, la session la plus chargée est sélectionnée. Choisir une session place la tête de lecture au début de cette session.

Ce que le choix change :

- Dans le **[replay de boîte](box-replay.md)**, il décide quelle session est rejouée : seules les boîtes et les traînées de cette session sont dessinées, et la plage de la chronologie devient la durée propre de la session.
- Dans les **modes de chaleur**, il ne restreint pas la chaleur, et une indication sous le sélecteur le dit : *Dans les modes de chaleur, ceci déplace seulement la tête de lecture au début de la session ; la chaleur compte toujours chaque session. Le replay de boîte joue la session choisie seule.* Pour restreindre la chaleur à une session, gardez aussi la colonne de session comme colonne de filtre (*Conserver pour le filtrage*) et filtrez dessus. Une colonne peut être à la fois la colonne de session et une colonne de filtre : le chargeur lit chaque colonne de filtre cochée à part, quel que soit le rôle qu'elle joue aussi.

### Trop de sessions {#too-many-sessions}

Jusqu'à **100 000** sessions sont listées. Au-delà, la colonne est en réalité un identifiant (un dossier de millions de sessions de quelques lignes chacune), et envoyer autant d'étiquettes du worker vers la page est ce qui fait manquer de mémoire un onglet. Le chargement garde alors les **identifiants** de session — les frontières sont donc toujours respectées partout — mais supprime les étiquettes et le sélecteur, et le panneau Jeu de données le signale.

## Groupe {#group}

La colonne **Équipe / groupe** est n'importe quelle colonne à faible nombre de valeurs : une équipe, un camp, une escouade, une faction, un indicateur joueur contre IA, une classe de voiture. Elle est stockée sous forme d'un identifiant de 16 bits par ligne et pilote :

- la [liste des équipes](teams-list.md) (visibilité par groupe, camps + / −),
- la [chaleur par équipe](team-heat.md) (une teinte par groupe),
- la répartition [différentielle](difference.md) par groupe,
- les couleurs des boîtes dans le [replay de boîte](box-replay.md) (une famille de teintes par groupe, une nuance par membre).

### Limites {#limits}

4 096 groupes distincts au maximum. L'identifiant de groupe voyage dans le quatrième canal du texel de position de chaque ligne sur le GPU, et chaque groupe a besoin d'un texel dans la table de signes de 4 096 de large que le shader lit pour décider *masqué*, *ajouté* ou *soustrait*. Une colonne qui a plus de valeurs distinctes est un identifiant, pas un groupe : **le chargement garde chaque ligne et ne supprime que le regroupement**, avec un avertissement sur le jeu de données qui suggère de la mapper comme colonne de personne, ou de la garder comme colonne de filtre.

La même limite de 4 096 s'applique à une colonne de filtre de *catégorie* conservée ; une colonne plus large n'est pas conservée, et le jeu de données le dit. Une colonne numérique (un horodatage, par exemple) n'a pas une telle limite comme filtre de *plage*.

Les valeurs de groupe `0`, une valeur vide, `none`, `unknown`, `null` et `-1` (sans tenir compte de la casse) signifient « pas de groupe » pour la [chaleur par équipe](team-heat.md), qui les dessine en gris neutre plutôt qu'en couleur affirmée.

## Taille des entités {#entity-size}

La taille d'une chose suivie — la boîte de collision d'un joueur, une voiture — décide de la taille des boîtes et des rayons de regard du [replay de boîte](box-replay.md). Il n'y a pas de champ pour cela dans le panneau ; cela vient des [indications `heat3d`](data-formats.md#the-heat3d-hints) du fichier (`entity.size`, dans les unités propres au fichier ; le convertisseur CS2 écrit 32). Le chargement le multiplie par l'échelle des unités.

À chaque chargement ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), avec *étendue* la plus grande des étendues X et Z des données :

| Réglage | Avec une taille d'entité | Sans |
|---|---|---|
| Taille du cube | taille de l'entité | étendue / 500 |
| Longueur du rayon de regard | taille de l'entité × 4 | étendue / 200 |
| Rayon du sprite | étendue / 120 | étendue / 120 |
| Point de saturation | estimation analytique (puis mesurée) | idem |
| Vitesse de déplacement | étendue / 12 | idem |
| Plan lointain | étendue × 12 | idem |
| Plan proche | max(0,05 ; étendue / 20 000) | idem |

## Le panneau Jeu de données {#the-dataset-panel}

Sous le panneau Source. Avec un jeu de données chargé, il affiche :

- le **nom** du jeu de données — la sélection, le nombre de lignes, le nombre de fichiers, le pas quand il en a été utilisé un ;
- **`N équipes · N personnes · Ns d'étendue`** ;
- chaque **avertissement** produit par le chargement, en ambre, tant que le jeu de données est chargé : groupes ou colonne de filtre retirés pour trop de valeurs, sessions non listées, noms partagés, lignes manquantes, fichiers ignorés ;
- le [générateur synthétique](synthetic-generator.md) ;
- **Décharger**, qui retire le jeu de données.

Le nombre de lignes est affiché dans l'en-tête du panneau.
