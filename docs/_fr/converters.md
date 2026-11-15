---
title: "Les convertisseurs conservent tout"
parent: "Importer des données"
nav_order: 8
lang: "fr"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Les convertisseurs gardent tout

Vous n'avez pas besoin de cette page pour ouvrir un replay. Elle est destinée aux personnes qui écrivent des outils qui transforment des fichiers de jeu en tables 3DHeat, et à quiconque veut savoir pourquoi ces tables contiennent autant de choses.

Chaque outil qui transforme le replay, la démo, le journal ou la télémétrie en direct d'un jeu en quelque chose que le visualiseur ouvre suit une seule règle :

> **Convertir tout ce que la source contient et qui peut être lu aujourd'hui, et garder le reste intact, pour qu'il puisse être lu plus tard sans le fichier d'origine.**

Un replay disparaît souvent après une mise à jour du jeu, une réinstallation ou un disque plein, et un flux en direct disparaît dès qu'il a été envoyé. Ce qu'un convertisseur laisse tomber est perdu pour de bon ; ce qu'il garde intact peut être décodé le jour où quelqu'un le comprend. Un convertisseur ne décide donc jamais de ce qui sera utile : il décode ce qu'il peut, garde chaque autre message, paquet, événement, propriété ou ligne inchangé à côté de la table, et indique dans sa propre sortie combien de chacun il a lu et combien il n'a fait que garder.

Cette page décrit la convention que partagent tous les convertisseurs : ceux des replays War Thunder, World of Tanks, World of Warships et Squad, le convertisseur de démos CS2, le watcher en arrière-plan (son décodeur de replays Dota et chaque adaptateur en direct), les lecteurs de télémétrie de l'outil de capture de jeu, et les imports propres au visualiseur (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Les lecteurs propres au visualiseur sont décrits dans [Enregistrements Tacview](tacview-acmi.md) et [Charger des fichiers](loading-files.md) ; la forme en un seul fichier est [Un fichier par partie](container.md). Une partie devient une table, un `match.json` et des fichiers annexes, en option regroupés dans un seul fichier `.3dheat`. Le README de chaque outil a une section **Complétude** qui liste, pour cette source, ce qui est lu, ce qui est gardé brut et ce qui n'est pas disponible, et pourquoi.

## Trois destinations pour chaque élément {#three-homes-for-every-item}

Tout ce qu'une source contient finit à exactement un de ces trois endroits :

| Destination | Ce qui y va |
|---|---|
| **Décodé** | La table (une ligne par échantillon ou événement, les colonnes que lit le visualiseur, des colonnes en plus pour chaque autre valeur qui appartient à une ligne) et le document de partie `<partie>.match.json` (tout ce qui appartient à la partie dans son ensemble : réglages, effectifs, résultats, tableaux des scores, l'autocontrôle). |
| **Gardé brut** | Un fichier annexe à côté de la table : chaque élément qui n'est pas décodé, ou seulement en partie, entier et inchangé, avec son type, son temps et l'unité ou l'entité à laquelle il appartient. |
| **Non disponible** | Nommé dans la section Complétude du README avec la raison : le format ne le porte pas (un replay client n'a pas les commandes des autres joueurs), la source ne l'envoie jamais, ou le lire n'est pas permis (un processus protégé, un bloc chiffré dont la clé n'est pas à nous). |

Un élément **partiellement** décodé est décodé *et* gardé brut : la table reçoit ce qui est compris, le fichier annexe l'élément entier, pour qu'un meilleur décodeur plus tard n'ait pas besoin du fichier d'origine.

Il n'y a pas de quatrième destination. Laisser tomber quelque chose parce qu'il semblait inutile, parce que c'était un doublon « probablement », ou parce qu'il était gros, est un bogue. N'alléger est permis que dans la table (une caméra à 2 Hz au lieu de 60), jamais dans le fichier annexe.

## Fichiers annexes {#sidecars}

Un fichier annexe est un fichier Parquet à côté de la table, qui porte le même nom :

```
<dossier>/<partie>.parquet              la table
<dossier>/<partie>.match.json           le document de partie
<dossier>/<partie>.<quoi>.parquet       un fichier annexe
```

`<quoi>` est un seul mot de cette liste. Un nouveau convertisseur choisit le mot qui convient, ou ajoute un nouveau mot ici **et** à `SIDECAR_PARQUET` dans
[`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts),
pour que le visualiseur l'ignore lorsqu'un dossier entier est chargé.

| `<quoi>` | Contient | Utilisé par |
|---|---|---|
| `messages` | paquets, appels de méthodes d'entités et mises à jour de propriétés d'un flux réseau, entiers | War Thunder, World of Tanks, World of Warships |
| `flight` | entrées du modèle de vol par avion, entières | War Thunder |
| `packets` | trames et messages réseau entiers, ou morceaux de conteneur, hors du flux d'entités | CS2, Dota 2, Squad |
| `events` | événements de jeu avec toutes leurs clés, tels que les donne l'analyseur | CS2 |
| `entities` | mises à jour d'entités et de propriétés, appels distants, canaux ouverts et fermés, avec les exports dont un décodeur a besoin | Squad, Dota 2 |
| `props` | chaque propriété d'entité lue par l'analyseur, à chaque changement | CS2 |
| `units` | état par unité hors de la table des positions | Dota 2 |
| `combatlog` | un journal de combat, chaque entrée avec chaque champ | Dota 2 |
| `strings` | chaque entrée de chaque table de chaînes | CS2, Dota 2 |
| `objectives` | zones de capture et objectifs, chaque changement avec son temps | War Thunder |
| `raw` | un flux en direct : chaque paquet, ligne, document d'API ou lecture mémoire reçu, entier | les sessions du watcher (`heat.raw.parquet`), les enregistreurs de tours de l'outil de capture de jeu (`<horodatage>_<jeu>.raw.parquet`), les fichiers de replay osu!, LoL et Valorant du watcher |

Le chargement d'un dossier par le visualiseur ignore chaque `*.<quoi>.parquet` de cette liste, et chaque `*.match.json`, `*.meta.json`, `*.summary.json` et les autres fichiers annexes JSON ; en ouvrir un seul, en le choisissant ou en le déposant seul, le charge comme n'importe quelle table (voir [Charger des fichiers](loading-files.md)).

Ce sont les fichiers tels qu'un convertisseur les écrit avec `--loose`. Par défaut, les convertisseurs War Thunder, CS2 et Tacview regroupent la table, le document et les fichiers annexes d'une partie dans un seul fichier, `<partie>.3dheat`, sous les mêmes noms (voir [Un fichier par partie](container.md)) ; tout ce qui est ici vaut pour chaque élément.

### Colonnes {#columns}

Chaque ligne d'un fichier annexe est un élément. Les colonnes sont, dans cet ordre, celles qui s'appliquent :

| Colonne | Type | Contenu |
|---|---|---|
| `time` | float64 | secondes sur la même horloge que le `time` de la table (ou `tick` lorsque la source compte des ticks ; alors les deux) |
| `type` | chaîne (dictionnaire) | ce que l'élément est, dans les propres termes de la source : un type de paquet, un identifiant de message, un nom d'événement, un chemin de propriété, un préfixe de ligne |
| `name` | chaîne (dictionnaire) | son nom lorsqu'il est connu (un nom de communauté, un nom de classe), sinon vide |
| `entity` / `unit` / `uid` / `player` | entier ou chaîne | à qui il appartient, avec les mêmes identifiants que la table, pour qu'une ligne du fichier annexe puisse être reliée à une trajectoire |
| `decoded` | chaîne (JSON) | ce qui est compris de l'élément, lorsque quelque chose l'est ; sinon vide |
| `payload` | binaire | les octets de l'élément, entiers et inchangés (sources binaires) |
| `text` | chaîne | le texte de l'élément, entier et inchangé (sources textuelles : une ligne de journal, un objet JSON, un bloc clé-valeur) |

D'autres colonnes sont permises (un décalage de bits, une taille, un canal). Les chaînes qui se répètent sont encodées par dictionnaire et le fichier est écrit en zstd, donc un fichier annexe ne représente qu'une fraction de la taille du replay lui-même.

Un fichier annexe doit suffire seul : un décodeur écrit plus tard lit le fichier annexe, jamais le replay d'origine. Lorsqu'un élément ne peut pas être compris sans contexte (la classe d'une entité, une table de chaînes, une clé à laquelle un message se réfère), ce contexte va aussi dans le fichier annexe, ou dans le document de partie.

### Sources en direct {#live-sources}

Les adaptateurs en direct (télémétrie UDP, mémoire partagée, journal d'un jeu, API locale) n'ont aucun fichier vers lequel revenir. Ils enregistrent **chaque champ que la source envoie**, même ceux que rien n'utilise encore :

- un flux de paquets : chaque paquet entier, `payload` les octets, `type` son identifiant ou son format de paquet, au rythme où il arrive ;
- la mémoire partagée ou une API interrogée : chaque champ de chaque lecture, soit sous forme de colonnes nommées, soit le bloc entier en `payload`, au rythme de lecture de l'adaptateur ;
- un journal : chaque ligne, `text` la ligne, `type` le genre de la ligne, y compris les lignes sur lesquelles l'adaptateur n'agit pas.

Ces données vont dans `<session>.raw.parquet`, à côté de la table de la session. La taille est le prix de la règle ; elle est réduite par zstd et l'encodage par dictionnaire, pas en laissant des choses de côté.

## L'autocontrôle {#the-self-check}

Chaque convertisseur écrit, dans son document de partie (ou dans le `meta.json` de la session, ou dans un résumé lorsqu'il n'a pas de document de partie), un bloc `completeness` sous `selfCheck` :

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Champ | Signification |
|---|---|
| `seen` | combien d'éléments de ce type la source contient |
| `decoded` | lus entiers dans la table ou le document de partie |
| `partial` | lus en partie dans la table ou le document, et gardés entiers dans un fichier annexe |
| `raw` | gardés entiers dans un fichier annexe seulement, non décodés |
| `lost` | `seen - decoded - partial - raw` : doit valoir 0 |

Le `lost` de premier niveau est la somme. Les tests d'un convertisseur affirment qu'il vaut 0 sur leurs échantillons synthétiques, et le README dit ce qu'il valait sur de vrais fichiers. Un `lost` non nul est le convertisseur qui signale qu'il a enfreint la règle ; il nomme le type, pour que le manque puisse être trouvé.

Les « types » sont ceux de la source : types de paquets, identifiants de messages, noms d'événements, groupes de propriétés, genres de lignes. Ils sont comptés là où le convertisseur les rencontre, et non à partir d'une liste de ce qu'il attend ; ainsi, un type que personne ne connaissait apparaît avec son compte au lieu de disparaître.

## La section Complétude du README {#the-readmes-completeness-section}

Le README de chaque convertisseur a une section intitulée **Complétude**, avec trois listes :

- **Lu** : ce qui va dans la table et le document de partie, et comment chaque nouveau champ a été vérifié par rapport à quelque chose d'indépendant (les propres chiffres du jeu, une seconde source, un enregistrement fait exprès).
- **Gardé brut** : ce qui se trouve dans quel fichier annexe, sous quel `type`, et ce qu'on en sait pour l'instant.
- **Non disponible** : ce que la source ne porte pas ou ne peut pas être lu, et pourquoi.

Elle renvoie à cette page.

## Où en est chaque convertisseur {#where-each-converter-stands}

| Convertisseur | Fichiers annexes | Sa section Complétude |
|---|---|---|
| Replays War Thunder | `messages`, `flight` | [README 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (ses comptes d'autocontrôle sont sous `counts` ; le bloc `completeness` doit suivre) |
| Replays World of Tanks | `messages` | [README 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| Replays World of Warships | `messages` | [README 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Démos de serveur Squad | `entities`, `packets` | [README 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| Démos CS2 | `events`, `props`, `strings`, `packets` | [README 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Replays Dota 2 (watcher) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Replays Dota 2](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| Replays osu!, LoL, Valorant (watcher) | `raw` | leurs pages dans les [documents du watcher](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Adaptateurs en direct (watcher) | `raw` | la page de chaque jeu dans les [documents du watcher](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), et [développement](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) pour `Session.raw` |
| Enregistreurs de tours (outil de capture) | `raw`, et des octets `unparsed` dans un fichier de tour Forza | [README 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Imports propres au visualiseur | aucun : voir plus bas | cette page |

### Les imports propres au visualiseur {#the-viewers-own-imports}

Tacview ACMI, OCAP et les formats GPS sont lus dans le navigateur à partir du fichier de l'utilisateur ; le visualiseur ne garde rien d'eux, donc le fichier lui-même reste l'enregistrement. Ils sont tout de même lus autant que possible :

- **Tacview ACMI** (`src/data/acmi.ts`) : chaque ligne d'objet avec une position est une ligne avec chaque propriété que porte l'enregistrement, chaque événement est une ligne, chaque retrait est une ligne, et les propriétés propres à l'enregistrement (avec le FileType et le FileVersion de l'en-tête) figurent sur chaque ligne sous `RecordingInfo` ; une ligne de commentaire est un événement `Comment`, un objet qui ne reçoit jamais de position devient une ligne `Unplaced` au point de référence, et U/V sont des colonnes dès qu'une ligne les a. Une ligne de propriété sans position n'est lue qu'en partie : ses valeurs atteignent la ligne suivante de l'objet, et non leur propre temps. `AcmiTable.completeness` compte les lignes du fichier par genre.
- **OCAP** (`src/data/ocap.ts`) : les trames, tirs, marqueurs de chaque entité, chaque genre d'événement (les genres inconnus deviennent des lignes « Mission » avec leur texte) et les champs propres du document (`Info`). Pas encore lu : les champs d'entité et les éléments de position en fin de ligne autres que ceux listés dans son en-tête (ajouts d'un enregistreur plus récent), et les trames répétées d'une unité morte après sa mort (allégées à dessein : rien ne change dans ces trames).
- **Formats GPS** (`src/data/geoTracks.ts`) : les positions, leur heure, l'altitude, le cap et la vitesse, ainsi que la fréquence cardiaque, la cadence, la puissance, la température, les satellites, le HDOP et l'altitude barométrique lorsque le fichier les enregistre. Pas encore lu : les autres extensions GPX et KML, les phrases NMEA autres que celles de position, les enregistrements IGC autres que les positions et leurs extensions, et les messages FIT autres que les enregistrements (tours, sessions, informations sur l'appareil).

Ces lacunes sont listées pour qu'elles soient comblées, pas pour s'en excuser ; les exports du visualiseur d'un enregistrement chargé (`src/data/exportRecording.ts`) n'écrivent que ce qui a été lu.

## Ajouter un convertisseur {#adding-a-converter}

1. Listez ce que le format contient, d'après sa documentation, ses propres structures, ou en comptant chaque type de message dans de vrais échantillons. La liste devient les `types` de l'autocontrôle.
2. Décodez ce qui peut être vérifié dès maintenant. Chaque nouveau champ est vérifié par rapport à quelque chose d'indépendant avant d'entrer dans la table ; un champ qui ne peut pas encore être vérifié reste brut.
3. Gardez le reste entier dans un fichier annexe nommé comme ci-dessus, avec les colonnes ci-dessus.
4. Écrivez le bloc `completeness` et un test qui vérifie qu'il vaut 0 pour `lost`.
5. Écrivez la section Complétude du README et renvoyez ici.
6. Si le `<quoi>` du fichier annexe est nouveau, ajoutez-le au tableau ci-dessus et à `SIDECAR_PARQUET` dans `src/data/filePick.ts`.

Les convertisseurs sont écrits en salle blanche : ils sont faits à partir des formats, de la documentation et des échantillons, jamais à partir de code GPL ou AGPL. Les échantillons de vrais replays restent sur la machine qui les a faits ; les tests utilisent des fichiers synthétiques.
