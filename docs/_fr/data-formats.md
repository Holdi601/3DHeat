---
title: "Référence des formats de données"
nav_order: 19
lang: "fr"
source: "data-formats.md"
source_hash: "23c1890ce185"
translated: true
outdated: false
---

# Référence des formats de données

Cette page liste tous les types de fichiers que 3DHeat peut ouvrir, et ce qu'une table contenue dans un fichier doit contenir. Une table, ce sont des lignes et des colonnes, comme dans un tableur : chaque ligne indique où se trouvait quelque chose et, si vous l'avez, quand et qui.

Ce que l'onglet Carte de chaleur lit, colonne par colonne, et les indices qu'un fichier Parquet peut contenir. (L'onglet Analyse de course lit les fichiers de tours, et l'onglet Match les résumés de match ; voir [Analyse de course](race-analysis.md) et [Analyse de match](match-analysis.md).)

## Fichiers {#files}

Voici la liste complète et unique des fichiers chargeables. Le panneau **Source** (**Fichiers…**, **Dossier…**, ou glisser-déposer) accepte exactement ceux-ci :

| Extension | Ce que c'est | Lu par |
|---|---|---|
| `.parquet`, `.pq` | Table Parquet | le lecteur Parquet (ci-dessous) |
| `.csv`, `.tsv`, `.txt` | Texte délimité | le lecteur de texte (ci-dessous) |
| `.3dheat` | Un match dans un seul fichier (un ZIP contenant la table et ses extras) | se charge comme la table qu'il contient - [Un fichier par match](container.md) |
| `.acmi` (aussi `.txt.acmi`, `.zip.acmi`) | Enregistrement de vol Tacview | son propre lecteur - [Enregistrements Tacview](tacview-acmi.md) |
| `.json`, `.json.gz` | Enregistrement OCAP (de type Arma) | son propre lecteur |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | Traces GPS : GPX, KML/KMZ, journaux NMEA, journaux de vol à voile IGC, fichiers de sport FIT | son propre lecteur ; les positions viennent de la latitude et de la longitude |

Ne sont pas chargés comme positions : les petits fichiers JSON qui accompagnent une table pour la décrire (noms se terminant par `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), et les tables supplémentaires d'un convertisseur (`<match>.events.parquet` et similaires, voir [Convertisseurs](converters.md)), sauf si vous les choisissez seules. Tout autre fichier est ignoré, avec une raison. La façon dont une sélection est filtrée est expliquée dans [Charger des fichiers](loading-files.md#which-files-are-kept).

Les fichiers vides sont ignorés. Dans une sélection qui contient des fichiers `movement*.<ext>`, seuls ceux-là sont chargés ([Charger des fichiers](loading-files.md#which-files-are-kept)).

Les données tiennent en **une ligne par échantillon** : une position à un instant donné, avec éventuellement qui, quel groupe, quelle session, où l'on regardait, et d'autres colonnes. Les lignes d'événement (une élimination, une pose, un tir) peuvent se trouver dans la même table que les lignes de position ; elles se distinguent par une colonne d'événement.

## Texte délimité (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Un fichier minimal utile, trois lignes :

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Les colonnes se rangent toutes seules ([Mappage des colonnes](column-mapping.md)).

Lu par un analyseur d'octets qui ne décode que les colonnes mappées ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Aspect | Règle |
|---|---|
| En-tête | La première ligne non vide contient les noms des colonnes. Un nom vide devient `column_N`. |
| Séparateur | Détecté à partir des 20 premières lignes non vides du premier mébioctet (1 MiB), parmi la virgule, le point-virgule, la tabulation et la barre verticale, selon la **cohérence** : le séparateur qui donne le même nombre de champs sur chaque ligne échantillonnée l'emporte, puis celui qui donne le plus de champs. L'espace n'est jamais détecté mais peut être choisi ; n'importe quel caractère unique peut être saisi ([Mappage des colonnes](column-mapping.md#the-fields)). |
| Guillemets | RFC 4180 : les champs peuvent être entourés de guillemets doubles, `""` à l'intérieur des guillemets est un guillemet littéral. |
| Espaces | Les espaces, tabulations et guillemets au début et à la fin de chaque champ sont retirés. |
| Champs par ligne | 4 096 au maximum ; davantage est une erreur (*le séparateur est-il bon ?*). |
| Nombres | Signe facultatif, chiffres, `.` facultatif avec décimales, exposant facultatif (`1.5e-3`). Une virgule décimale (`1,5`), des séparateurs de milliers ou des unités (`12 m`) ne se lisent pas et comptent comme manquants. Si votre fichier utilise des virgules décimales, remplacez-les par des points avant de charger (un rechercher-remplacer dans un éditeur de texte suffit). |
| Colonne numérique | Une colonne est proposée comme numérique lorsque plus de 90 % des valeurs non vides des 50 premières lignes se lisent comme des nombres. |
| Nombre de lignes | Estimé avant le chargement, à partir de la longueur moyenne des lignes du premier mébioctet (1 MiB). |
| Encodage du texte | UTF-8. |

## Parquet {#parquet}

Lu avec [hyparquet](https://github.com/hyparam/hyparquet), morceau de colonne par morceau de colonne, dans des tableaux typés, en ne demandant que les colonnes mappées ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Aspect | Règle |
|---|---|
| Nombre de lignes | Exact, lu dans le pied de fichier, avant le chargement. |
| Aperçu | Les 50 premières lignes, décodées en objets ; leurs valeurs décident quelles colonnes semblent numériques. |
| Entiers | `INT32`, et `INT64` (décodé en BigInt) deviennent des nombres. |
| Flottants | `FLOAT`, `DOUBLE`. |
| Booléens | 1 et 0. |
| Chaînes | Utilisées pour les colonnes de personne, de groupe, de session et de catégorie ; une chaîne qui ressemble à un nombre est acceptée pour les rôles numériques. |
| Types logiques `TIMESTAMP`, `DATE` | Décodés en instants (millisecondes depuis 1970) ; utilisés comme axe de temps, le réglage d'unité est ignoré. |
| Colonnes imbriquées | Les colonnes de structures et de listes ne sont prévues pour aucun rôle (elles s'affichent en texte JSON) ; non testé. |
| Métadonnées du pied de fichier | La clé `heat3d` est lue comme indices de mappage (ci-dessous). |

Une colonne de position, de temps ou de regard qui contient autre chose qu'un nombre se décode comme manquante.

## Rôles et types des colonnes {#column-roles-and-types}

| Rôle | Type dans le fichier | Obligatoire | Stocké comme | Limites |
|---|---|---|---|---|
| X, Y, Z | nombre | deux sur trois | flottant 32 bits, après le [mappage des axes](axes-units-and-time.md) | Une ligne sans position utilisable est supprimée. |
| Temps | nombre dans l'une des [unités de temps](axes-units-and-time.md#time-units), timestamp Parquet, ou texte ISO-8601 | non | flottant 32 bits en secondes depuis la plus ancienne ligne | Le tri est refusé au-delà de 400 000 000 lignes ([pourquoi](memory-and-budgets.md#the-sort-ceiling)). |
| Personne | quelconque ; encodé par dictionnaire | non | identifiant 32 bits | |
| Session | quelconque ; encodé par dictionnaire | non | identifiant 32 bits | Les libellés sont listés jusqu'à 100 000 sessions. |
| Groupe | quelconque ; encodé par dictionnaire | non | identifiant 16 bits | Jusqu'à 4 096 groupes, sinon le regroupement est abandonné. |
| Lacet, tangage (yaw, pitch) | nombre, en degrés ou en radians | non | flottant 32 bits en radians | |
| Direction X, Y, Z | nombre | non (les trois ensemble) | converti en lacet et tangage | |
| Colonne de filtre, *plage* | nombre | non | flottant 32 bits | Jusqu'à 4 filtres actifs à la fois. |
| Colonne de filtre, *catégorie* | quelconque ; encodé par dictionnaire | non | identifiant 32 bits | Jusqu'à 4 096 valeurs, sinon la colonne n'est pas gardée. |

Une colonne `TIMESTAMP` Parquet gardée comme colonne de filtre est une *plage* de millisecondes depuis l'époque - un curseur, pas une liste.

## Colonnes de résultat {#outcome-columns}

Qui a gagné, sur chaque ligne. Ainsi, un endroit, un trajet ou une action peut être jugé selon la fréquence à laquelle son camp a ensuite gagné ([Taux de victoire](win-rate.md)). La visionneuse garde ces colonnes d’elle-même, les liste en premier dans les [filtres](filters.md), dans la langue de la visionneuse, et les lit dans la [carte des taux de victoire](win-rate.md), le [détail](breakdown.md) et les [statistiques de volume](volumes.md#statistics). Un convertisseur pour un jeu par manches (CS2, Valorant, Rainbow Six Siege) ou par matchs (War Thunder) écrit les quatre :

| Colonne | Type | Signification |
|---|---|---|
| `won` | 0/1 (vide si inconnu) | le camp (l'équipe) de la ligne a gagné **la manche** ; dans un jeu sans manches, le match |
| `matchWon` | 0/1 (vide si inconnu) | le camp (l'équipe) de la ligne a gagné **le match** ; vide si l'enregistrement ne montre pas la fin |
| `round` | nombre entier, à partir de 1 | la manche à laquelle appartient la ligne ; 1 partout dans un jeu par matchs |
| `roundEndReason` | texte | comment la manche s'est terminée (dans un jeu par matchs, le match), avec les mots ci-dessous |

`won` et `matchWon` appartiennent au camp de la ligne : les lignes d'un joueur T portent le résultat du camp T, celles d'une unité IA celui de son équipe ; les lignes qui n'appartiennent à aucun camp les laissent vides. Un camp qui change à la mi-temps garde son propre `matchWon` et prend le `won` de chaque manche telle qu'il l'a jouée. Une égalité vaut 0 pour les deux camps.

Les raisons de fin, communes à tous les jeux pour qu'un seul filtre marche sur tous (le mot propre d'un jeu est associé quand c'est possible, [`data/outcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/outcome.ts)) :

| `roundEndReason` | Signification | Jeux |
|---|---|---|
| `elimination` | tous les joueurs d'un camp sont éliminés | CS2, Valorant, Rainbow Six Siege |
| `bomb` | la bombe (le spike, la cible du désamorceur) a explosé | CS2, Valorant, Rainbow Six Siege |
| `defuse` | la bombe (le spike) a été désamorcée | CS2, Valorant, Rainbow Six Siege |
| `time` | le chronomètre de la manche est arrivé à zéro ; War Thunder : décidé alors que les deux camps avaient encore des tickets | tous |
| `surrender` | un camp a abandonné | CS2, Valorant, Rainbow Six Siege |
| `draw` | pas de vainqueur | CS2 |
| `objective` | un objectif pris ou tenu (otage extrait, zone sécurisée) | Rainbow Six Siege |
| `capture` | à court de tickets pendant que le vainqueur tenait des zones de capture | War Thunder |
| `tickets` | tickets perdus à cause des éliminations | War Thunder |
| `destruction` | les derniers véhicules perdus d'un coup, plus personne pour réapparaître | War Thunder |
| `other` | tout le reste | |

Nommez-les aussi dans la liste `extra` des indices `heat3d`, comme toute autre colonne. Les noms de colonne `win`, `round_won`, `match_won`, `end_reason` et `win_reason` sont lus comme les mêmes colonnes.

## Les indices `heat3d` {#the-heat3d-hints}

Un fichier Parquet peut porter ses propres instructions de lecture dans les métadonnées clé/valeur de son pied de fichier, sous la clé **`heat3d`**, sous forme d'objet JSON ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). La visionneuse les applique par-dessus ses propres suppositions quand le fichier est le premier d'une sélection ; chaque entrée est facultative, et chaque résultat reste affiché et modifiable dans le panneau [Mappage des colonnes](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Tout ce qui n'est pas un objet JSON valide est ignoré.

### Schéma {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          noms des colonnes de la position
    "time": string,                                  la colonne de temps
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           colonnes de filtre à garder, les plus utiles en premier
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  doit être > 0
  },
  "entity": {
    "size": number                                   taille d'une chose suivie, en unités du fichier, > 0
  }
}
```

| Entrée | Appliquée quand | Effet |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | la colonne nommée existe dans le fichier | Définit ce rôle. |
| `columns.timeUnit` | c'est l'une des sept unités | Définit l'unité de temps. |
| `columns.angleUnit` | `"degrees"` ou `"radians"` | Définit l'unité d'angle. |
| `columns.lookMode` | `"vector"` avec dirX, dirY et dirZ tous définis ; `"yawPitch"` avec yaw défini ; `"none"` | Définit le mode de regard. |
| `columns.extra` | c'est un tableau | Remplace la liste de filtres automatique, en ne gardant que les colonnes existantes qui ne servent à aucun rôle ; chacune est *plage* si elle semblait numérique dans l'aperçu, sinon *catégorie*. Sans elle, la liste automatique est gardée, moins toute colonne qu'un indice a affectée à un rôle. |
| `axes.up` | `"y"` ou `"z"` | Axe vertical. |
| `axes.flipX/Y/Z` | un booléen | Inversions. |
| `axes.scale` | un nombre > 0 | Échelle des unités. |
| `entity.size` | un nombre > 0 | [Taille d'entité](sessions-persons-groups.md#entity-size) (multipliée par l'échelle des unités au chargement). La seule façon de la définir. |

### Exemple {#example}

Un export inventé d'un jeu de tir : Z vers le haut, centimètres, un monde gaucher, des joueurs larges d'environ 72 cm.

```json
{
  "columns": {
    "x": "pos_x", "y": "pos_y", "z": "pos_z",
    "time": "t", "timeUnit": "seconds",
    "personId": "player", "teamId": "side", "sessionId": "round_id",
    "lookMode": "yawPitch", "yaw": "view_yaw", "pitch": "view_pitch", "angleUnit": "degrees",
    "extra": ["event", "weapon", "map"]
  },
  "axes": { "up": "z", "flipY": true, "scale": 0.01 },
  "entity": { "size": 72 }
}
```

### L'écrire {#writing-it}

Avec pyarrow, les métadonnées de schéma personnalisées s'écrivent dans les métadonnées clé/valeur du fichier :

```python
import json
import pyarrow as pa
import pyarrow.parquet as pq

table = pa.table({...})
hints = {"columns": {"x": "pos_x", "y": "pos_y", "z": "pos_z", "time": "t"}, "axes": {"up": "z"}}
meta = dict(table.schema.metadata or {})
meta[b"heat3d"] = json.dumps(hints).encode("utf-8")
pq.write_table(table.replace_schema_metadata(meta), "movement.parquet")
```

`npm run inspect -- file.parquet` affiche le schéma d'un fichier, ce qui permet de vérifier rapidement les noms de colonnes auxquels les indices font référence.

## Ce que l'onglet Carte de chaleur écrit {#what-the-heatmap-tab-writes}

Rien n'est réécrit dans les données. Les sorties sont :

- des vidéos, en WebM (VP9 ou VP8) - [Trajet de caméra et vidéo](camera-path-and-video.md) ;
- une pose de caméra, copiée dans le presse-papiers sous forme de texte - [Caméra](camera.md#pose) ;
- des niveaux enregistrés dans la [bibliothèque de niveaux](level-library.md) du navigateur.
