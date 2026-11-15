---
title: "Un fichier par match (.3dheat)"
parent: "Importer des données"
nav_order: 9
lang: "fr"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Un fichier par match : `.3dheat`

Un fichier `.3dheat` est un match entier dans un seul fichier, à copier, garder ou partager. Pour l'ouvrir, déposez simplement le fichier sur le panneau Source.

```
match.3dheat   (a ZIP file)
  manifest      what the match is, and the list of everything inside
  table         the positions (Parquet)
  match.json    the match document
  sidecars      what the converter kept whole (events, messages, ...)
```

Un match converti était autrefois plusieurs fichiers côte à côte : la table `<match>.parquet`, le document du match `<match>.match.json` et les annexes `<match>.<what>.parquet` ([Les convertisseurs conservent tout](converters.md)). Un fichier `.3dheat` les contient tous en un : un replay, un fichier, à copier, garder ou partager.

Il est conçu pour que charger un millier de ces fichiers soit aussi rapide que charger les tables séparées, et pour que les convertisseurs futurs puissent y mettre beaucoup plus sans nouveau format.

## En charger un {#loading-one}

Partout où un fichier ou un dossier se charge, un fichier `.3dheat` se charge aussi, et un dossier peut mélanger conteneurs et fichiers séparés :

| Où | Ce qui est lu dans le conteneur |
|---|---|
| Panneau Source de la **Carte de chaleur** (fichiers, dossier, glisser-déposer) | ses tables, comme si c'étaient les `<match>.parquet` séparés |
| **Carte de chaleur → Plusieurs matchs à la fois** (Fichiers, Dossier, Ajouter un dossier) | ses tables, lues sur place par les workers du chargeur |
| Onglet **Match** (Charger, ou déposer sur la vue) | le document du match |
| Données de télémétrie du tableau **Tactique** | ses tables |

Ouvrir un conteneur lit deux petits morceaux : son répertoire à la fin et son manifeste au début ; rien d'une table n'est lu tant que le chargeur ne la lit pas. Les annexes et le document du match ne sont lus que quand quelque chose les demande. Un dossier qui contient le même match deux fois, séparé et empaqueté, ne le charge qu'une fois.

## Empaqueter et désempaqueter {#packing-and-unpacking}

Les nouvelles conversions écrivent des conteneurs par défaut : le convertisseur War Thunder (`heat3d-wt-replay`), le convertisseur CS2 (`heat3d_cs2 demos`) et l'outil Tacview (`node tools/acmi-to-parquet.mjs`). `--loose` garde les fichiers séparés.

Les matchs convertis avant, ou par d'autres outils, sont empaquetés avec :

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** trouve chaque table `<match>.parquet` sous les dossiers, avec les fichiers qui lui appartiennent, et écrit `<match>.3dheat` à côté d'eux. Un match déjà empaqueté est ignoré. Chaque conteneur est relu en entier (le sha256, la taille, le CRC et le pied Parquet de chaque élément) avant toute autre chose ; les fichiers séparés ne sont supprimés qu'avec `--delete-loose`, et pour un match empaqueté plus tôt seulement quand ils sont identiques octet pour octet à ce que contient le conteneur. Un match dont un fichier a changé dans les dernières minutes de `--settle` (10 par défaut) est laissé tranquille : un convertisseur peut encore l'écrire.
- **unpack** réécrit les éléments comme fichiers séparés à côté du conteneur.
- **update** ajoute ou remplace des éléments sans réécrire les tables déjà présentes dans le conteneur (ci-dessous).
- **repack** réécrit un conteneur en entier, en retirant ce que les mises à jour ont laissé derrière.

## Le format {#the-format}

Un fichier `.3dheat` est une archive ZIP (n'importe quel outil ZIP l'ouvre), avec ces règles :

1. **`manifest.json` est le premier élément** quand un conteneur est écrit, et il est toujours présent. Il se trouve par le répertoire central du ZIP, si bien qu'après un `update` il peut se trouver plus loin dans le fichier.
2. **Les éléments lus par plages d'octets ou déjà compressés sont stockés** (méthode ZIP 0) : Parquet, Arrow, images, modèles, audio, vidéo, blobs opaques. Un élément stocké est une plage d'octets continue du conteneur, si bien qu'un lecteur lit le pied d'une table et ses blocs de colonnes sur place, par `File.slice` dans un navigateur ou une requête par plage HTTP, exactement comme il lirait le fichier séparé.
3. **Le texte est compressé** (méthode 8) : JSON, CSV, texte brut. Ce sont de petits fichiers, lus en entier.
4. Les noms sont en UTF-8 (drapeau de bit 11), relatifs, séparés par `/`, sans `..` ; ils peuvent contenir des dossiers (`analysis/heat.json`). Un fichier séparé empaqueté garde son propre nom, si bien que le désempaquetage redonne les mêmes fichiers.
5. Les éléments de plus de 4 Gio, ou les conteneurs de plus de 65 535 éléments, utilisent ZIP64 comme d'habitude. Les écrivains ne mettent pas de descripteurs de données après les éléments.

Les éléments que les convertisseurs écrivent aujourd'hui, dans cet ordre :

| Rôle | Élément | Stocké |
|---|---|---|
| `table` | `<match>.parquet` | oui |
| `match` | `<match>.match.json` | non (compressé) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | oui |
| `summary` | `<match>.summary.json`, le résumé de l'index de masse ([Analyse de masse](mass-analysis.md)), ajouté par `tools/3dheat-summarize.mjs` | non (compressé) |

La table vient juste après le manifeste, si bien que la première lecture du début du fichier par le lecteur couvre à la fois le manifeste et l'en-tête local de la table.

### Le manifeste {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<map>_RB_<date>_<session>",
 "map": "<map>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<match>.parquet", "match": "<match>.match.json", "flight": "<match>.flight.parquet" },
 "members": [
  {
   "name": "<match>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 hex digits>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| Champ | Signification |
|---|---|
| `format` | toujours `3dheat` |
| `format_version` | `majeure.mineure` (voir plus bas) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | ce qu'est le match et ce qui l'a fait ; `null` quand c'est inconnu |
| `created`, `updated` | quand écrit, quand mis à jour pour la dernière fois (`updated` n'apparaît qu'après une mise à jour) |
| `roles` | chaque rôle relié au nom de son premier élément : un index rapide |
| `members` | chaque élément sauf le manifeste : la liste complète, et celle qu'un lecteur retient |
| `matches` | facultatif : les matchs d'un conteneur qui en contient plusieurs (ci-dessous) |
| `references` | facultatif : les fichiers dont le conteneur a besoin mais qu'il ne contient pas |
| `extensions` | facultatif : les métadonnées propres à un convertisseur |

Chaque élément :

| Champ | Signification |
|---|---|
| `name` | son chemin dans le conteneur |
| `role` | à quoi il sert (voir plus bas) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` ou `deflate` |
| `bytes` | sa taille, non compressée |
| `sha256` | de ses octets, non compressés |
| `rows` | le nombre de lignes d'une table |
| `schema` | la convention qu'il suit, `{ "id", "version" }` : le `format` et la `version` propres à un document (`heat3d-wt-replay-match` 2), `heat3d-table` pour une table que la visionneuse lit par son pied `heat3d`, `heat3d-acmi-table` pour celle de l'outil Tacview |
| `match` | dans un conteneur de plusieurs matchs, l'`id` de `matches[]` auquel il appartient |

### Conçu pour grandir {#made-to-grow}

Le format doit porter des replays bien plus riches qu'aujourd'hui sans casser ce qui les lit maintenant :

- **Versions.** `format_version` est `majeure.mineure`. Un lecteur lit chaque version mineure de sa majeure et ignore chaque champ qu'il ne connaît pas. La mineure monte quand quelque chose est ajouté ; la majeure seulement quand la disposition change au point qu'un lecteur plus ancien la lirait mal (un élément qui n'est plus stocké, le manifeste sorti de l'archive). La convention de chaque élément a sa propre version, dans son `schema`, si bien qu'une nouvelle disposition de table ou une nouvelle version de document n'exige pas de nouvelle version de conteneur. Les premiers conteneurs écrits disaient `"version": 1` à la place ; les lecteurs le prennent pour 1.0.
- **Les rôles sont ouverts.** Un rôle est n'importe quelle chaîne. Les lecteurs utilisent les rôles qu'ils connaissent et gardent les autres : un rôle inconnu est listé, jamais rejeté, et `update` et `repack` le transmettent intact. Un rôle peut avoir plusieurs éléments : plusieurs tables (trajectoires par unité, télémétrie à d'autres cadences), événements, voix, synchronisation vidéo, références de niveau, surcharges de figurines, résultats d'analyse. Les noms peuvent contenir des dossiers.
- **Tout média.** Un élément peut être n'importe quoi ayant un type de média : Parquet, JSON, Arrow, miniatures PNG ou JPEG, modèles glTF, audio, blobs bruts.
- **Plusieurs matchs.** Une session ou un tournoi peut tenir dans un conteneur : `matches` les liste (`{ "id", "map", "mode", "started", ... }`) et chaque élément nomme son `match`. La visionneuse charge chaque élément du rôle `table`.
- **Références.** Les fichiers dont un conteneur a besoin mais qu'il ne contient pas, par exemple un niveau, sont listés dans `references` par nom et sha256 (`{ "kind": "level", "name": "...", "sha256": "..." }`), si bien que le bon fichier est trouvé et vérifié sans être copié dans chaque match.
- **Extensions.** `extensions` contient les métadonnées propres à un convertisseur sous sa propre clé, `"<éditeur>/<nom>": { ... }`, si bien que deux convertisseurs n'entrent jamais en collision et qu'il n'y a rien à ajouter aux champs communs.
- **Mise à jour sur place.** `update` ajoute ou remplace des éléments sans réécrire les grandes tables stockées : les nouveaux éléments et un nouveau manifeste sont ajoutés après la fin du conteneur, suivis d'un nouveau répertoire central. Ce qui a été remplacé reste sous forme d'octets non référencés jusqu'à `repack`. Chaque élément et chaque champ du manifeste, connus ou non, sont conservés. Une mise à jour qui échoue est ramenée au conteneur tel qu'il était.

Les tests de la visionneuse s'assurent de cela : un conteneur de format 1.7 avec un rôle inconnu, un champ d'élément, une extension et un élément audio, dans un dossier, se charge, et survit à une mise à jour et à un repack avec tout intact ; un conteneur de majeure 2 est refusé.

## Écrivains {#writers}

- Node : [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (écrire, lire, vérifier, mettre à jour, repack), utilisé par l'outil d'empaquetage et l'outil Tacview.
- Python : `container.py`, environ 140 lignes sur le module standard `zipfile`, le même fichier dans chaque convertisseur (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), si bien qu'aucun convertisseur ne dépend d'un autre. Un nouveau convertisseur le copie.
- La visionneuse lit avec
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
