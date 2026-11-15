---
title: "Mappage des colonnes"
parent: "Importer des données"
nav_order: 2
lang: "fr"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Mappage des colonnes

Un fichier est une table, et 3DHeat doit savoir quelle colonne contient la position est-ouest, laquelle contient le temps, laquelle contient le nom du joueur, et ainsi de suite. Ce panneau dit ce qu'il a deviné, et c'est là que vous corrigez une mauvaise devinette.

![Le panneau Mappage des colonnes après le chargement d'un fichier Parquet : toutes les cases déjà remplies - 1 X, 2 Y, 3 Z, 4 Temps, 5 Identifiant de personne, 6 Session / match, 7 Équipe / groupe](../assets/img/en/column-mapping-panel.webp)

*Le fichier a donné ses propres noms de colonnes, donc chaque case est déjà remplie.*

Par exemple, un CSV dont l'en-tête est `x,y,z,t,player,team` se mappe tout seul : x, y et z deviennent la position, `t` le temps, `player` la [personne](glossary.md) et `team` le [groupe](glossary.md).

Une fois les fichiers choisis, le panneau **Mappage des colonnes** s'ouvre sous le panneau Source. Il dit quelle colonne joue quel rôle. Il est rempli automatiquement, et chaque champ peut être modifié avant d'appuyer sur **Charger** ; le mappage est lu au moment du chargement, donc le modifier ensuite demande de charger de nouveau.

## Les champs {#the-fields}

Tous les menus de colonnes listent chaque colonne du premier fichier, plus *- aucune -*.

| Champ | Rôle | Remarques |
|---|---|---|
| **Séparateur** | CSV seulement : le séparateur de champs. | Menu : *Virgule ,*, *Point-virgule ;*, *Tabulation*, *Barre verticale \|*, *Espace* ; ou tapez n'importe quel caractère unique dans *ou tapez un caractère*. Détecté automatiquement (voir plus bas). Le changer relance le mappage automatique, si bien que les modifications faites avant sont perdues. |
| **X**, **Y**, **Z** | Position. | Au moins deux sont requis ; un troisième axe non mappé vaut 0 (les données sont sur un plan). La même colonne sur deux axes est une erreur. |
| **Axe vertical dans la source** | Quel axe de la source pointe vers le haut. | *Z vers le haut (la plupart des moteurs de jeu)* ou *Y vers le haut (convention graphique)*. Voir [Axes, unités et temps](axes-units-and-time.md). |
| **Échelle des unités** | Multiplie chaque position. | Boutons *1 (m)* et *0.01 (cm→m)*, ou tapez une valeur. |
| **Inverser X / Inverser Y / Inverser Z** | Change le signe d'un axe de la source. | Appliqué aux positions et aux vecteurs de direction du regard. |
| **Temps** | L'axe du temps. | Facultatif. Sans lui, il n'y a pas de chronologie. |
| **Unité de temps** | Comment lire la colonne de temps. | Sept unités ; voir [Axes, unités et temps](axes-units-and-time.md#time). Ignoré pour les colonnes Parquet `TIMESTAMP`/`DATE`, ce que le panneau indique. |
| **Identifiant de personne** | À qui ou à quoi une ligne appartient. | Facultatif. Rend possibles les trajectoires, les durées de vie, le replay de boîte et la chaleur par lignes. |
| **Session / match** | Quel match, raid, manche, partie ou tour appartient à une ligne. | Facultatif. Les positions ne sont jamais interpolées, tracées ni reliées en un parcours à travers un changement de session. Voir [Sessions, personnes et groupes](sessions-persons-groups.md). |
| **Équipe / groupe** | Toute colonne à faible nombre de valeurs. | Facultatif. Pilote les couleurs des groupes, la chaleur par équipe et la répartition différentielle par groupe. |
| **Direction du regard** | *Aucune*, *Colonnes lacet / tangage* ou *Colonnes de vecteur de direction*. | Avec lacet/tangage : **Lacet**, **Tangage** et **Unité d’angle** (*Degrés* / *Radians*). Avec un vecteur : **Dir X**, **Dir Y**, **Dir Z**. Utilisé pour les rayons de regard du [replay de boîte](box-replay.md). |
| **Conserver pour le filtrage** | Colonnes supplémentaires gardées en mémoire. | Une case par colonne, et pour chaque colonne cochée une *plage* (numérique) ou une *catégorie*. Chacune coûte 4 octets par ligne et une passe de décodage au chargement. Seules les colonnes gardées peuvent être [filtrées](filters.md), servir à une [répartition différentielle](difference.md) ou de colonne d'événements pour la [chaleur par lignes](line-heat.md). |
| **Afficher des lignes d'exemple** | Un tableau des 12 premières lignes échantillonnées, toutes colonnes. | Pour vérifier les devinettes. |

Une colonne de filtre cochée sans réglage explicite est lue comme *plage* ; une colonne d'identifiant d'allure numérique est souvent plus utile comme *catégorie*. Seuls 4 filtres peuvent être actifs à la fois ([Filtres](filters.md)).

## Comment le mappage automatique devine {#how-the-auto-mapping-guesses}

La devinette se trouve dans [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Elle regarde les noms de colonnes, quelles colonnes sont numériques dans les lignes échantillonnées (plus de 90 % des valeurs non vides se lisent comme des nombres), combien de valeurs distinctes chaque colonne prend dans l'échantillon, et les types logiques Parquet. Les motifs de noms sont essayés dans l'ordre, sans tenir compte de la casse, et le premier motif qui correspond à une colonne encore libre l'emporte.

### Position {#position}

| Axe | Motifs de noms, dans l'ordre (colonnes numériques seulement) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Si un axe est encore vide, les premières colonnes numériques libres (en ignorant `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) le remplissent dans l'ordre. Une mauvaise devinette se voit tout de suite à l'écran ; un axe vide laisserait une fenêtre vide.

### Temps {#time}

- **Les colonnes d'instant Parquet d'abord.** Parmi les colonnes dont le type logique est `TIMESTAMP` ou `DATE`, la meilleure est choisie par score : +10 000 si le nom correspond à un motif de temps, -5 000 pour un `DATE` simple, plus le nombre de valeurs distinctes dans l'échantillon. Une date d'un jour entier et un début de session constant ont presque aucune valeur distincte, donc l'instant d'événement l'emporte. L'unité est alors *horodatage Unix (ms)*.
- **Sinon par nom :** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, puis les noms de temps écoulé (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). L'unité est ensuite devinée d'après les valeurs : ISO-8601 quand une valeur ressemble à `AAAA-MM-JJT…` ou `AAAA-MM-JJ …` ; sinon d'après la plus grande grandeur : au-dessus de 10^17 nanosecondes, au-dessus de 10^14 microsecondes, au-dessus de 10^11 millisecondes Unix, au-dessus de 10^8 secondes Unix, au-dessus de 10^6 millisecondes, sinon secondes.

Quand une colonne de temps écoulé est choisie, le panneau note que chaque session est alors alignée sur son propre début — bien pour superposer des matchs, pas pour les voir dans leur vraie suite.

### Session, personne, groupe {#session-person-group}

La session est revendiquée **après** l'axe du temps et **avant** la personne et le groupe, parce qu'une colonne de session est souvent un horodatage (l'instant de début du match sur chaque ligne du match).

| Rôle | Motifs de noms, dans l'ordre |
|---|---|
| Session | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (chacun exactement, éventuellement avec `_id`) |
| Personne | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, puis `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (données de course : c'est la voiture qui bouge) |
| Groupe | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Groupe, de repli | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Un candidat de groupe qui prend une valeur distincte sur la plupart des lignes échantillonnées (plus de max(48, 60 % de l'échantillon)) est un identifiant, pas un groupe : il devient la colonne de personne si aucune n'a été trouvée, et n'est pas utilisé comme groupe. Si aucune colonne de groupe n'est trouvée, la colonne non numérique qui a le moins de valeurs distinctes entre 2 et 12 est utilisée.

### Direction du regard {#look-direction}

Une colonne numérique nommée `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` ou `rot_z` / `rotation_z` passe la direction du regard en lacet/tangage ; le tangage est cherché comme `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Les degrés sont supposés quand un lacet échantillonné dépasse 7 en valeur absolue, sinon les radians. Un vecteur de direction n'est jamais deviné ; il vient des indications ci-dessous ou de vous.

### Colonnes de filtre {#filter-columns}

**6** colonnes au maximum sont gardées automatiquement, classées :

1. `region`, `sessionMode`, `actor` — des colonnes faites pour être filtrées (score 1200) ;
2. les colonnes de catégorie qui varient dans l'échantillon, celles avec le moins de valeurs distinctes d'abord (1000 moins le nombre) ;
3. une colonne constante dans l'échantillon, mais seulement quand plusieurs fichiers sont chargés — elle peut changer d'un fichier à l'autre, comme une région ou un identifiant de test (600) ;
4. les colonnes numériques (500).

Les colonnes qui jouent déjà un rôle, les noms de bruit ci-dessus, les colonnes constantes dans un chargement d'un seul fichier, et les colonnes de texte libre (plus de max(16, la moitié de l'échantillon) valeurs distinctes) ne sont pas proposées automatiquement. Toute colonne peut toujours être cochée à la main.

### Axe vertical {#up-axis}

Quand les trois axes sont mappés, l'axe dont l'étendue de Y et de Z est la plus petite dans l'échantillon est pris pour le haut (une carte est bien plus large que haute) ; sinon, Z vers le haut est supposé.

## Les indications `heat3d` dans le pied d'un Parquet {#the-heat3d-hints-in-a-parquet-footer}

Un fichier Parquet peut dire comment il doit être lu. Si le pied du fichier contient une entrée de métadonnées clé/valeur de clé **`heat3d`**, sa valeur est lue comme du JSON et posée par-dessus les devinettes ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Le convertisseur de démos CS2 écrit une telle entrée, si bien que ses tables s'ouvrent avec le joueur comme personne, le camp comme groupe, chaque manche comme session, la direction du regard activée et le monde dans le bon sens.

Seul le **premier** fichier d'une sélection est lu pour les indications. Chaque entrée est facultative, et chaque valeur indiquée apparaît encore dans le panneau et peut être modifiée. Une description complète du schéma, avec un exemple et la façon de l'écrire, se trouve dans la [Référence des formats de données](data-formats.md#the-heat3d-hints).

Les règles, en bref :

- Une colonne nommée par une indication n'est appliquée que si le fichier a cette colonne.
- `lookMode: "vector"` ne prend effet que si `dirX`, `dirY` et `dirZ` sont tous réglés ; `"yawPitch"` seulement si `yaw` est réglé.
- `extra`, s'il est présent, remplace la liste automatique des filtres (les noms inconnus et les colonnes qui jouent déjà un rôle sont retirés) ; le type plage/catégorie de chacune suit si elle semblait numérique. S'il est absent, la liste automatique est gardée, moins toute colonne à laquelle une indication a donné un rôle.
- `axes.up` doit valoir `"y"` ou `"z"`, les inversions doivent être des booléens, `scale` doit être positif.
- `entity.size`, quand il est positif, est la taille d'une chose suivie dans les unités du fichier ([taille des entités](sessions-persons-groups.md#entity-size)) ; c'est le seul moyen de la régler.

## Problème connu : changer le séparateur du CSV {#known-issue-overriding-the-csv-separator}

Quand vous changez le séparateur pour un autre que celui détecté, la liste des colonnes et les lignes d'exemple ne changent pas (l'aperçu découpe encore avec le séparateur détecté). Le séparateur choisi sert toujours au chargement lui-même. Si le séparateur détecté est faux :

1. Ouvrez le fichier dans un éditeur de texte.
2. Remplacez partout le séparateur par une virgule (et les virgules décimales par des points).
3. Enregistrez, puis chargez de nouveau le fichier.

La cause se trouve dans [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
