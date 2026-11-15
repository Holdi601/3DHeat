---
title: "Charger des fichiers"
parent: "Importer des données"
nav_order: 1
lang: "fr"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Charger des fichiers

Cette page montre comment donner vos fichiers à 3DHeat et ce qu'il en fait. Déposez un dossier : il choisit les fichiers qui contiennent des positions et les fusionne en une seule image.

1. Ouvrez **Source** en haut de la barre latérale de l'onglet Carte de chaleur.
2. Déposez des fichiers ou un dossier sur la zone de dépôt, ou appuyez sur **Fichiers…** ou **Dossier…**.
3. Lisez la ligne de sélection et l'**Estimation de la mémoire** (voir l'image ci-dessous).
4. Appuyez sur **Charger**.

![Le panneau Source après le dépôt d'un dossier de dix parties : 1 la ligne de sélection, 2 l'estimation de la mémoire à « ça tient », et 3 Charger 10 fichiers](../assets/img/en/loading-files-source.webp)

*Après le dépôt d'un dossier, 3DHeat vous dit ce qu'il a trouvé et si cela tient.*

Les fichiers se chargent dans le panneau **Source**, en haut de la barre latérale de l'onglet Carte de chaleur. Tout ce qui est sélectionné d'un coup devient **un seul** jeu de données.

## Choisir les fichiers {#choosing-files}

| Commande | Ce qu'elle fait |
|---|---|
| **Déposez des fichiers ou un dossier ici** (la zone de dépôt) | Déposez n'importe quel mélange de fichiers et de dossiers. Les dossiers sont parcourus récursivement. Cliquer sur la zone de dépôt ouvre le même sélecteur que **Fichiers…**. |
| **Un fichier…** | Un sélecteur de fichier pour un seul fichier. |
| **Fichiers…** | Un sélecteur de fichiers qui accepte plusieurs fichiers. |
| **Dossier…** | Un sélecteur de dossier (le sélecteur `webkitdirectory` du navigateur) ; chaque fichier de l'arborescence est proposé. |

Les sélecteurs acceptent les types de fichiers de la [liste des fichiers chargeables](data-formats.md#files). En bref : `.parquet`/`.pq` sont lus comme du Parquet, `.csv`/`.tsv`/`.txt` comme du texte délimité, `.acmi` (Tacview), les `.json`/`.json.gz` OCAP et les formats GPS (GPX, KML, KMZ, NMEA, IGC, FIT) passent par leurs propres lecteurs, et les conteneurs `.3dheat` se chargent comme les tables qu'ils contiennent ([Un fichier par match](container.md)). Un conteneur qui ne peut pas être lu est ignoré avec le motif *pas un fichier csv/parquet*.

Les dossiers déposés sont parcourus sur 12 niveaux de profondeur au plus et 20 000 fichiers au plus, par précaution contre les boucles de liens symboliques et les arborescences sans fin.

## Quels fichiers sont gardés {#which-files-are-kept}

Avant toute lecture, la sélection est filtrée ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)) :

- Un fichier d'une autre extension est ignoré : *pas un fichier csv/parquet*.
- Un fichier de 0 octet est ignoré : *vide (0 octet)*.
- **Les fichiers annexes des convertisseurs** — les données brutes qu'un convertisseur garde à côté de la table d'un match, `<match>.messages.parquet`, `.events.parquet`, `.raw.parquet` et les autres listés dans [Les convertisseurs conservent tout](converters.md) — sont ignorés : *fichier annexe d'un convertisseur*. Pour en ouvrir un, choisissez-le ou déposez-le seul (ou seulement des annexes) : une sélection composée uniquement d'annexes les charge comme n'importe quelle table. Le JSON à côté d'une table (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` et `.hints.json`) n'est jamais proposé comme positions.
- **La règle du fichier de mouvement.** Si un fichier de la sélection s'appelle `movement*.parquet`, `movement*.csv` (et les autres extensions) — `movement.parquet`, `movement_1.parquet` et ainsi de suite — alors tous les autres fichiers de données sont ignorés : *pas un fichier de mouvement, et ce dossier contient des fichiers de mouvement*. Les exports de télémétrie contiennent souvent une table de positions à côté de dizaines de tables sans positions, et seules les premières peuvent être dessinées. Un dossier sans aucun fichier de mouvement charge tous ses fichiers de données. Exemple : un dossier avec `movement_1.parquet`, `kills.parquet` et `shop.parquet` charge `movement_1.parquet` ; les deux autres sont listés comme ignorés.
- Les fichiers gardés sont triés par leur chemin dans la sélection, si bien que le même dossier produit toujours le même jeu de données et les mêmes couleurs.

Le panneau affiche ensuite la sélection (le nom d'un seul fichier, ou `dossier (N fichiers)` avec le plus long dossier commun), le nombre de fichiers, leur taille totale et le nombre total de lignes — exact quand tous les fichiers sont du Parquet, marqué `≈` dès qu'un seul est du CSV. Les fichiers ignorés sont listés avec leur motif, les quatre premiers par nom.

## Lire le schéma {#reading-the-schema}

Le **premier** fichier de la sélection est ouvert pour décrire le schéma (« Lecture du schéma ») : ses noms de colonnes, ses 50 premières lignes de données, les colonnes qui semblent numériques et, pour le Parquet, le type logique de chaque colonne et l'entrée `heat3d` du pied de fichier. Un dossier d'exports d'une même table partage un schéma, donc un seul fichier le représente tous. Ensuite, chaque fichier est mesuré (« Comptage des lignes ») : le pied d'un fichier Parquet donne le nombre exact en une petite lecture ; le nombre d'un CSV est estimé à partir de la longueur moyenne des lignes de son premier mégaoctet.

Le panneau [Mappage des colonnes](column-mapping.md) s'ouvre avec les devinettes automatiques, et l'[estimation de la mémoire](memory-and-budgets.md) apparaît au-dessus du bouton **Charger**.

## Messages avant le chargement {#messages-before-loading}

Sous la sélection, le panneau liste, d'après [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts) :

- **Erreurs** (rouge) — le chargement ne peut pas démarrer : moins de deux axes de position, la même colonne sur deux axes, une colonne mappée absente du fichier, une colonne de position qui ne semble pas numérique, une colonne de temps dont les valeurs échantillonnées sont du texte alors que l'unité est un nombre (chaque ligne serait lue comme NaN et tomberait au temps 0), une colonne de temps réglée sur ISO-8601 dont aucune valeur échantillonnée ne se lit comme une date, une échelle d'unité de 0.
- **Avertissements** (ambre) — cela se chargera, mais probablement pas comme prévu : une colonne de groupe qui prend une valeur distincte sur la plupart des lignes échantillonnées (c'est donc un identifiant, pas un groupe), une colonne de temps `DATE` (chaque ligne d'un jour partage le même instant), une direction du regard réglée sans ses colonnes.
- **Remarques** — ce que le mappage implique : dessin sur un plan quand un axe n'est pas mappé, pas de chronologie sans colonne de temps, pas de trajectoires sans colonne de personne, et sans colonne de groupe une seule couleur pour tout et une différence qui ne peut se répartir que sur une colonne gardée pour le filtrage.

## Chargement {#loading}

Le bouton **Charger** affiche *Charger le fichier*, *Charger N fichiers*, ou *Charger N fichiers (1 sur K)* quand un [pas de décimation](memory-and-budgets.md#decimation) est réglé. Il affiche *Trop grand - réduire ou décimer* et est désactivé quand le [contrôle de tenue](memory-and-budgets.md#the-fit-check) indique que le chargement ne tiendra pas ; il est aussi désactivé tant que le mappage a des erreurs ou qu'un autre chargement est en cours.

Pendant le chargement, le panneau affiche l'étape en cours (avec `[fichier/fichiers]` devant quand il y en a plusieurs), les lignes lues jusque-là, une barre de progression et **Annuler**. Annuler arrête le worker d'ingestion, et avec lui les workers d'analyse qu'il a lancés.

La page continue de se dessiner pendant le chargement, car le travail se fait en arrière-plan. Vous voyez l'étape en cours, les lignes lues, une barre de progression et **Annuler**. Après le dernier fichier, le panneau affiche les étapes *Mise des lignes dans l'ordre temporel*, *Réordonnancement des colonnes (n sur m)*, *Mesure de l'étendue*, *Construction de la liste*, *Résumé des sessions* et *Calcul des durées de vie*, puis *Envoi de N lignes au GPU* pendant une image, pour qu'un long envoi ne soit jamais pris pour un blocage.

### Le fonctionnement {#how-it-works}

Le chargement se fait dans un Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Avec plusieurs fichiers et plus d'un [fil d'analyse](memory-and-budgets.md#parser-threads), jusqu'à ce nombre de fichiers sont analysés **en même temps**, chacun dans son propre worker d'analyse ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), dans la limite de la place laissée par le budget de RAM ; ils sont tout de même fusionnés un par un dans l'ordre de la sélection, si bien que le jeu de données est le même qu'avec un chargement un fichier à la fois. Pendant que plusieurs sont en cours, la ligne de progression nomme le fichier qui a signalé en dernier, et la barre et le compte de lignes additionnent tous les fichiers en cours. Avec un seul fil, ou un seul fichier, les fichiers sont analysés l'un après l'autre dans le worker d'ingestion lui-même. Seules les colonnes que nomme le mappage sont lues : une colonne non mappée d'un fichier Parquet ne coûte rien ; un CSV est parcouru octet par octet, mais seuls les champs mappés sont décodés.

## Plusieurs fichiers deviennent un seul jeu de données {#several-files-become-one-dataset}

Quand plus d'un fichier est chargé ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) :

- **Une seule liste.** Les personnes, les groupes, les sessions et les valeurs de catégorie sont des dictionnaires partagés par tous les fichiers ; la même joueuse dans deux exports est donc une personne avec une seule trajectoire.
- **Une seule origine des temps.** Les temps sont gardés en secondes sur 64 bits pendant la fusion, recalés sur le temps le plus ancien de la sélection *complète*, puis stockés en secondes sur 32 bits à partir de cette origine. Quatre exports de quatre après-midi sont placés dans leur vrai ordre, et non empilés les uns sur les autres.
- **Un seul ordre temporel.** Les lignes de tous les fichiers sont triées par temps avec un tri radix (voir [la limite du tri](memory-and-budgets.md#the-sort-ceiling)).
- **Une colonne `Source file`.** Chaque ligne retient le fichier dont elle vient, dans une colonne de catégorie nommée `Source file`. Elle apparaît dans les [Filtres](filters.md) et sous le nom *Source file - comparer deux chargements* dans la [répartition différentielle](difference.md). Un chargement d'un seul fichier ne l'a pas : une colonne constante coûterait 4 octets par ligne pour ne rien dire.
- **Colonnes manquantes.** Un fichier qui n'a pas une des colonnes de *filtre* apporte simplement aucune valeur pour elle. Un fichier qui n'a pas une colonne de *rôle* mappée (X, temps, personne, ...) échoue avec *le fichier n'a pas de colonne « nom »* ; dans un chargement de plusieurs fichiers, ce fichier est ignoré et les autres se chargent quand même, et les fichiers ignorés sont listés sur le jeu de données. Un chargement d'un seul fichier qui échoue affiche l'erreur.
- **Avertissement de manque.** Quand les lignes chargées sont moins de 95 % des lignes comptées au préalable, le jeu de données porte un avertissement avec la part manquante — venant de fichiers illisibles ou de lignes sans position utilisable, qui sont supprimées à l'entrée.

## Après le chargement {#after-loading}

Le nouveau jeu de données remplace le précédent. À chaque chargement ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)) :

- tous les filtres et la visibilité des groupes sont effacés ;
- la répartition différentielle par groupe est remise à zéro : la première moitié des groupes (arrondie au supérieur) est positive, le reste négatif ;
- le rayon des sprites est réglé sur l'étendue horizontale / 120 et la saturation sur une estimation analytique ; la taille des cubes, la longueur du rayon de regard, la vitesse de déplacement et les plans proche et lointain sont réglés d'après l'étendue (voir [Sessions, personnes et groupes](sessions-persons-groups.md#entity-size)) ;
- la session du replay de boîte est réglée sur la session qui a le plus de lignes ;
- les parcours de la chaleur de lignes sont de nouveau devinés ([Chaleur de lignes](line-heat.md)) ;
- le mode de vue revient à **Chaleur** si le mode courant n'est pas pris en charge par les nouvelles données ; la chronologie revient à **Tout** sans colonne de temps, et l'historique à **Cumulé** sans durées de vie ;
- la tête de lecture est ramenée au début et la lecture s'arrête ;
- la caméra cadre tout le jeu de données depuis la direction par défaut (regard le long de -Z, incliné vers le bas d'environ 36°).

Le panneau **Jeu de données** affiche ensuite le nom du jeu de données (la sélection, le nombre de lignes et de fichiers, et le pas s'il en a été utilisé un), `N équipes · N personnes · Ns d'étendue`, et chaque avertissement produit par le chargement, en ambre, tant que le jeu de données est chargé. **Décharger** dans ce panneau retire le jeu de données.
