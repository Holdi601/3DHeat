---
title: "Accueil"
nav_order: 1
lang: "fr"
source: "index.md"
source_hash: "b93bb646bdad"
translated: true
outdated: false
---

# 3DHeat

3DHeat montre où les choses se sont passées dans un jeu : où les joueurs sont allés, où ils se sont battus et où ils sont tombés. Il les affiche sous forme de couleurs lumineuses dans lesquelles vous pouvez voler, ou sous forme de petites figurines 3D qui rejouent le match.

Chargez des positions (CSV, Parquet, enregistrements Tacview, replays convertis, un fichier seul, un dossier ou des milliers de matchs) et voyez-les sous forme de **carte de chaleur dans laquelle vous pouvez voler**, de **figurines qui rejouent le match**, de lignes le long des trajets suivis, ou comme une population face à une autre. Il repère seul ce qui ressort, et il fonctionne entièrement dans votre navigateur : rien n'est envoyé nulle part.

![Chaleur de dix matchs de chars au-dessus de la vallée de démonstration](../assets/img/en/heat-hero.webp)

**Première visite ?** Créez les [données de démonstration](demo-data.md) et suivez leurs sept étapes. Chaque image de ce site a été prise avec elles.

## Ce que cela fait {#what-it-does}

| | |
|---|---|
| ![Différence](../assets/img/en/heat-difference.webp) | **[Modes de chaleur](heat-modes.md)** - la chaleur, la [différence](difference.md) (rouge là où un camp était plus présent, bleu-vert là où l'autre l'était), la [chaleur par équipe](team-heat.md), la [chaleur linéaire](line-heat.md) ; la [chaleur directionnelle](directional-heat.md) avec des secteurs, des champs de flèches et des diagrammes polaires ; la chaleur [pondérée par la valeur](value-weighting.md) : ce que coûtent les armes, les véhicules et le carburant. |
| ![Replay](../assets/img/en/replay-tanks.webp) | **[Replay de match](match-replay.md)** - chaque unité sous la forme de la [figurine](figures.md) de ce qu'elle est, des symboles OTAN ou russes de loin, missiles et traceurs, marques de coups, épaves, incendies, tourelles, objectifs, caméras de type Tacview et affichage tactique ; [plusieurs matchs à la fois](many-matches.md). |
| ![Observations](../assets/img/en/insights.webp) | **[Observations](insights.md)** - les bonnes positions, les zones mortelles, les pièges de réapparition, les goulets et les joueurs qui se démarquent, trouvés et classés avec leurs preuves ; un bilan écrit, éventuellement rédigé par une IA de votre choix ; un commentateur pour un match ; le [prisme de connaissances](knowledge.md). |
| ![Volumes](../assets/img/en/compare.webp) | **[Volumes](volumes.md)** - tracez des boîtes, des prismes, des cylindres et des sphères, filtrez selon eux, comptez ce qui s'y passe, exportez-le et comparez des lieux côte à côte ; [détail](breakdown.md) de qui et de quoi réussit le mieux dans un lieu. |
| ![Filtres](../assets/img/en/filters.webp) | **[Filtres](filters.md)** - par type d'événement, joueur ou IA, classe de véhicule, valeur, n'importe quelle colonne, dans la carte graphique quelle que soit la taille des données. |
| ![Niveau](../assets/img/en/level-panel.webp) | **[Niveaux](levels.md)** - images de carte, niveaux 3D réalisés avec les [outils de données](#related-repositories), simplification, le [décor du monde réel](world-backdrop.md) avec un vrai relief pour les données de vol. |

Aussi : l'onglet [Analyse de course](race-analysis.md) pour les tours des jeux de course, l'onglet [Match](match-analysis.md) pour les bilans de Counter-Strike 2, le [Tableau tactique](tactics-board.md) pour les plans sur un niveau, l'[analyse des impacts](hit-analysis.md) par véhicule, l'[analyse de masse](mass-analysis.md) de milliers de matchs, les [trajectoires de caméra et vidéos](camera-path-and-video.md), [40 langues](languages.md), [unités métriques ou impériales](settings.md).

## Les onglets {#the-tabs}

Les onglets se trouvent en haut de la barre latérale, sous le nom, les unités et le menu de langue.

| Onglet | À quoi il sert |
|---|---|
| **Carte de chaleur** | Tout tableau de positions : les modes de chaleur, la superposition de figurines, les filtres, les volumes, les observations, les niveaux, la mesure et la vidéo. |
| **Analyse de course** | Deux tours ou plus d'un même parcours : où le temps est perdu, pourquoi, et ce qu'il faut changer. |
| **Match** | Le replay en figurines d'un match, et les bilans de match de Counter-Strike 2. |
| **Tactique** | Des plans sur un niveau : figurines, trajets, utilitaires lancés, zones et notes, par étapes qui se jouent. |
| **Véhicules** | Où chaque unité a été touchée, par qui et avec quoi. |

## Installer et lancer {#install-and-run}

### Windows, la méthode facile {#windows-the-easy-way}

La racine du dépôt contient trois fichiers batch.

| Fichier | Ce qu'il fait |
|---|---|
| `start.bat` | Lance la visionneuse. Trouve Node.js même lorsqu'il n'est pas dans le `PATH` (il cherche dans `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` et `%LOCALAPPDATA%\Programs\nodejs`). Si Node.js est absent, il propose d'installer la version LTS avec `winget install -e --id OpenJS.NodeJS.LTS`. Au premier lancement, il demande avant de télécharger les dépendances (environ 300 Mo dans `node_modules\` à l'intérieur du dossier, rien à l'échelle du système). Il refuse de démarrer si quelque chose écoute déjà sur le port 5273, et renvoie alors vers `restart.bat`. Lorsque le dossier est un dépôt git sans modifications locales et qu'une version plus récente existe, il demande s'il faut mettre à jour (O/N ; sans réponse sous 60 s, il garde cette version ; voir [Mises à jour](updates.md)). Il lance ensuite le serveur de développement sur `http://127.0.0.1:5273/` et ouvre le navigateur. **La fenêtre est le serveur** : laissez-la ouverte, fermez-la ou appuyez sur Ctrl+C pour arrêter. |
| `restart.bat` | Exécute `stop.bat quiet`, puis `start.bat`. Nécessaire seulement après une modification de `vite.config.ts`, l'ajout d'une dépendance, ou lorsque le serveur est bloqué : les modifications du code source sont rechargées à chaud. |
| `stop.bat` | Arrête ce qui écoute sur le port 5273, en trouvant l'identifiant du processus avec `netstat`, jamais par nom d'image : les autres processus Node.js de la machine ne sont donc pas touchés. Attend environ deux secondes que le socket soit libéré. Avec l'argument `quiet`, il ne fait pas de pause à la fin. |

### À la main (tout système) {#by-hand-any-os}


```bash
git clone --recursive https://github.com/Holdi601/3DHeat.git
cd 3DHeat
npm install
npm run dev      # http://127.0.0.1:5273
```

Le dossier `exporters/` contient les outils de données séparés, sous forme de sous-modules git, chacun ayant son propre dépôt ; après un clone simple, lancez `git submodule update --init`. La visionneuse elle-même n'en a pas besoin pour fonctionner. `exporters/ext/` contient les convertisseurs facultatifs (replays de War Thunder, World of Tanks, World of Warships, Squad ; cartes DCS et IL-2), tenus à part pour qu'un problème avec l'un d'eux ne touche aucun autre.

Aucune donnée de jeu n'est fournie avec tout cela : les niveaux, les cartes et les enregistrements sont créés sur votre propre machine avec les outils, à partir de jeux que vous possédez.

### Scripts npm {#npm-scripts}

| Script | Ce qu'il lance |
|---|---|
| `npm run dev` | Le serveur de développement Vite sur le port 5273, lié à `127.0.0.1`. |
| `npm run build` | Vérification des types (`tsc --noEmit`) et un paquet de production dans `dist/`. |
| `npm run preview` | Sert le paquet de production. |
| `npm run typecheck` | La seule vérification des types. |
| `npm test` / `npm run test:watch` | Tests unitaires et d'intégration (vitest). |
| `npm run smoke` | Pilote l'application réelle dans Chromium sans interface et vérifie que le canevas contient des pixels colorés selon les données ; les captures d'écran vont dans `tools/.smoke/`. Suppose que le serveur de développement tourne. |
| `npm run smoke:f16` | La même suite avec `?heat=f16`, qui force le chemin d'accumulation en demi-précision (voir [Accumulation en demi-précision](half-float-accumulation.md)). |
| `npm run bench` | Test de performance de l'ingestion ; écrit `tools/.smoke/ingest-bench.json`. |
| `npm run test:heavy` | Tests qui exigent de gros fichiers de données réelles ; ils s'ignorent d'eux-mêmes quand les fichiers sont absents. |
| `npm run inspect -- <file.parquet>` | Affiche le schéma d'un fichier Parquet et quelques lignes (`tools/inspect-parquet.mjs`). |

### Ce que le serveur de développement ajoute {#what-the-dev-server-adds}

La visionneuse est une page web statique, mais le serveur de développement (voir `vite.config.ts`) ajoute deux routes locales qu'un déploiement statique de `dist/` n'a pas :

- `/__host/memory` indique la RAM installée et libre de la machine et, lorsqu'il peut la lire, la mémoire de la carte graphique (depuis `nvidia-smi`, ou sous Windows depuis l'entrée de registre de l'adaptateur d'affichage). C'est ce qui permet aux [budgets mémoire](memory-and-budgets.md) d'utiliser des chiffres réels plutôt que les estimations plafonnées du navigateur.
- `/__heat3d/update` vérifie si le dépôt local est en retard et peut le mettre à jour en avance rapide ([Mises à jour](updates.md)).

Le serveur n'est lié qu'à `127.0.0.1`, donc aucune de ces routes n'est accessible depuis le réseau. Ouvrez-le avec `http://127.0.0.1:5273` : `localhost` peut se résoudre vers la boucle locale IPv6 `::1`, où rien n'écoute. Il n'envoie aucun en-tête d'isolation inter-origines (COOP/COEP) : rien dans la visionneuse n'utilise `SharedArrayBuffer`, et les workers transmettent leurs données par transfert, qui n'en a pas besoin.

## Exigences de navigateur et de carte graphique {#browser-and-gpu-requirements}

- **Un navigateur avec WebGPU ou WebGL2.** WebGPU est essayé en premier (Chrome et Edge le proposent) ; sans lui, le moteur WebGL2 est utilisé. WebGL2 doit proposer `EXT_color_buffer_float` (rendu vers des textures en virgule flottante), sinon la visionneuse affiche « Cannot initialise the renderer ». Voir [Les deux moteurs de rendu](backends.md). La visionneuse est développée et testée dans Chromium ; les autres navigateurs ne sont pas vérifiés.
- **Accélération matérielle activée.** Lorsque le navigateur dessine sur le processeur (SwiftShader, llvmpipe, le Microsoft Basic Render Driver et similaires), une bannière rouge en haut de la barre latérale l'indique et explique comment y remédier. Voir [Détection du rendu logiciel](software-rendering.md).
- **Une carte graphique dédiée aide, sans être obligatoire.** Les deux moteurs demandent l'adaptateur haute performance. La quantité de données pouvant être conservée sur la carte graphique est un budget que vous pouvez voir et modifier ([Mémoire et budgets](memory-and-budgets.md)).
- **Les fonctions facultatives** utilisent d'autres API du navigateur : le rendu vidéo exige `VideoEncoder` de WebCodecs avec VP9 ou VP8 ([Trajectoire de caméra et vidéo](camera-path-and-video.md)) ; la simplification de maillage des niveaux exige WebAssembly ; le dépôt de dossiers utilise l'API File and Directory Entries ; la bibliothèque de niveaux utilise IndexedDB ; les manettes utilisent l'API Gamepad.

## Plan de la documentation {#documentation-map}

**Commencer** : [Données de démonstration](demo-data.md) · [Importer des données](getting-data-in.md) ([charger des fichiers](loading-files.md), [correspondance des colonnes](column-mapping.md), [axes, unités et temps](axes-units-and-time.md), [sessions, personnes et groupes](sessions-persons-groups.md), [Tacview](tacview-acmi.md), [convertisseurs](converters.md), [.3dheat](container.md), [mémoire et budgets](memory-and-budgets.md))

**Voir** : [Modes de chaleur](heat-modes.md) ([chaleur](heat.md), [forme des sprites](sprite-shape.md), [couleur et exposition](colour-and-exposure.md), [profondeur et élimination des faces](depth-and-culling.md), [différence](difference.md), [chaleur par équipe](team-heat.md), [chaleur linéaire](line-heat.md), [replay en boîtes](box-replay.md), [chaleur directionnelle](directional-heat.md), [pondération des valeurs](value-weighting.md)) · [Chronologie](timeline.md) · [Niveaux](levels.md) ([images de carte](map-images.md), [niveaux 3D](model-levels.md), [apparence](level-appearance.md), [bibliothèque](level-library.md), [décor du monde réel](world-backdrop.md), [ses sources](world-backdrop-sources.md)) · [Caméra](camera.md) ([manette](gamepad.md), [touches](keyboard-reference.md)) · [Trajectoire de caméra et vidéo](camera-path-and-video.md)

**Analyser** : [Filtres et outils](filters-and-tools.md) ([filtres](filters.md), [équipes](teams-list.md), [entités](entities.md), [coupe](slice.md), [mesure](measure.md), [volumes](volumes.md), [détail](breakdown.md)) · [Observations](insights.md) ([prisme de connaissances](knowledge.md)) · [Analyse de masse](mass-analysis.md)

**Replay** : [Replay de match](match-replay.md) · [Plusieurs matchs à la fois](many-matches.md) · [Figurines](figures.md) ([dans la superposition de figurines](figure-replay.md), [crédits](figure-credits.md)) · [Parité avec Tacview](tacview-parity.md) · [Analyse des impacts](hit-analysis.md)

**Autres onglets** : [Analyse de course](race-analysis.md) ([la méthode](race-analytics.md), [autres jeux](other-games.md)) · [Analyse de match](match-analysis.md) · [Tableau tactique](tactics-board.md) ([vitesses](tactics-speeds.md))

**La visionneuse** : [Glossaire](glossary.md) · [Réglages, unités et touches](settings.md) · [Langues](languages.md) · [Mises à jour](updates.md) · [Fonctionnement interne du rendu](rendering-internals.md) ([moteurs](backends.md), [accumulation](accumulation.md), [échantillonnage et budgets](sampling-and-budgets.md), [demi-précision](half-float-accumulation.md), [mémoire GPU](gpu-memory.md), [rendu logiciel](software-rendering.md), [performance et statistiques](performance-and-stats.md)) · [Formats de données](data-formats.md) · [Référence](reference.md) · [Maintenir la documentation](maintaining.md)

## Dépôts associés {#related-repositories}

La visionneuse lit les données ; ces outils les produisent. Chacun est un dépôt public (MIT) avec sa propre documentation. Aucun ne fournit de données de jeu : les niveaux, les cartes et les enregistrements sont créés sur votre propre machine, à partir de jeux que vous possédez.

| Dépôt | Ce qu'il fait | Utile pour |
|---|---|---|
| [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) | Lit les parcours et les niveaux dans les archives que les jeux fournissent (Forza Horizon, BeamNG, Assetto Corsa Rally ; lecteurs Unreal, Unity, Frostbite et Source 2) et les exporte en glTF | un niveau 3D sous votre chaleur ou votre replay |
| [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) | Enregistre la télémétrie des tours à partir des interfaces que publient les jeux de course, et reconstruit des niveaux à partir de vidéos de jeu | des tours pour l'Analyse de course ; un niveau là où aucun fichier ne peut être lu |
| [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) | Extension de l'éditeur Unreal qui exporte un niveau dans un seul fichier glTF | les niveaux de vos propres projets Unreal |
| [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) | Démos de Counter-Strike 2 en tables de chaleur et en bilans de match, cartes CS2 en géométrie | la chaleur CS2, les replays et l'onglet Match |
| [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) | Enregistre votre jeu en arrière-plan à partir de ce que publient les jeux : télémétrie, intégrations d'état de jeu, journaux, replays | vos propres statistiques sans rien faire à la main |
| [3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder) | Replays War Thunder (`.wrpl`) en tables : trajectoires aériennes et terrestres, tirs, impacts, éliminations, tourelles, objectifs | les replays War Thunder, les marques de coups et les observations |
| [3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT) | Replays World of Tanks en tables : position de chaque véhicule, morts et éliminations | la chaleur et les replays de World of Tanks |
| [3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs) | Replays World of Warships en tables : position de chaque navire et coulages | la chaleur et les replays de World of Warships |
| [3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad) | Démos de serveur Squad en tables : position, équipe et escouade de chaque joueur | la chaleur et les replays de Squad |
| [3DHeat-Ext-DCS](https://github.com/Holdi601/3DHeat-Ext-DCS) | Terrains de DCS World, depuis votre propre installation, en niveaux : sol, routes, villes, aérodromes, champs, eau | DCS et les enregistrements Tacview sur leur vrai terrain |
| [3DHeat-Ext-IL2](https://github.com/Holdi601/3DHeat-Ext-IL2) | Cartes d'IL-2 Great Battles en niveaux | les enregistrements d'IL-2 sur leur carte |

## Structure des sources, en bref {#source-layout-briefly}

| Dossier | Contenu |
|---|---|
| [`src/data/`](https://github.com/Holdi601/3DHeat/tree/main/src/data) | Sélection des fichiers, ingestion CSV et Parquet, mappage automatique, validation, modèle mémoire, constructeur de jeux de données, lecture des modèles, classification, simplification, bibliothèque de niveaux |
| [`src/render/`](https://github.com/Holdi601/3DHeat/tree/main/src/render) | La boucle d'image (`engine.ts`), l'échantillonnage, les deux moteurs, la caméra, la manette, la mesure, la trajectoire de caméra, l'enregistrement vidéo |
| [`src/state/`](https://github.com/Holdi601/3DHeat/tree/main/src/state) | L'état de l'application (`store.ts`) avec toutes les valeurs par défaut, les types du domaine (`types.ts`), la courbe des sprites |
| [`src/ui/`](https://github.com/Holdi601/3DHeat/tree/main/src/ui) | Les panneaux de la barre latérale, la chronologie, les superpositions |
| [`src/race/`](https://github.com/Holdi601/3DHeat/tree/main/src/race), [`src/match/`](https://github.com/Holdi601/3DHeat/tree/main/src/match) | Les onglets Analyse de course et Match |
| [`src/i18n/`](https://github.com/Holdi601/3DHeat/tree/main/src/i18n) | Traductions |
| [`src/insights/`](https://github.com/Holdi601/3DHeat/tree/main/src/insights) | Observations : détecteurs, bilan, commentateur, fournisseurs d'IA, prisme de connaissances |
| [`src/mass/`](https://github.com/Holdi601/3DHeat/tree/main/src/mass) | Analyse de masse sur de nombreux matchs |
| [`src/volumes/`](https://github.com/Holdi601/3DHeat/tree/main/src/volumes) | Volumes, leurs statistiques, export et comparaison |
| [`src/breakdown/`](https://github.com/Holdi601/3DHeat/tree/main/src/breakdown) | Détail et facteurs |
| [`src/overlay/`](https://github.com/Holdi601/3DHeat/tree/main/src/overlay) | La superposition de nombreux matchs |
| [`src/figures/`](https://github.com/Holdi601/3DHeat/tree/main/src/figures) | Le catalogue de figurines et son constructeur |
| [`src/vehicle/`](https://github.com/Holdi601/3DHeat/tree/main/src/vehicle) | Analyse des impacts (onglet Véhicules) |
| [`src/tactics/`](https://github.com/Holdi601/3DHeat/tree/main/src/tactics) | Le tableau tactique |
| [`src/world/`](https://github.com/Holdi601/3DHeat/tree/main/src/world) | Le décor du monde réel |
| [`src/units/`](https://github.com/Holdi601/3DHeat/tree/main/src/units) | Unités de mesure |
