---
title: "Analyse de course"
nav_order: 14
has_children: true
lang: "fr"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# Analyse de course

Vous avez roulé deux fois le même circuit. L'onglet **Analyse de course** joue les deux trajets ensemble en 3D, montre où un tour était plus lent et vous dit pourquoi. Pas encore de tours ? Appuyez sur **Tours de démo**.

![L'onglet Analyse de course avec les tours de démo : la barre latérale avec Tours et Où progresser, les voitures sur le circuit, les graphiques sous la vue](../assets/img/en/race-analysis-overview.webp)

L'onglet compare deux tours ou plus d'un même parcours. Il partage le canevas, la caméra et le modèle de circuit chargé (**Arrière-plan / niveau**) avec la carte de chaleur ; tout le reste lui est propre : sa propre barre latérale et sa propre barre sous la vue. Des mots comme *tour*, *référence* et *corde* sont dans le [glossaire](glossary.md).

Cette page est le plan de l'onglet. Chaque partie a sa propre page :

| Page | Ce qu'elle couvre |
|---|---|
| [Charger des tours](race-loading-laps.md) | chaque format de fichier, les dossiers et les circuits, les noms de voitures, les tours de démo, la liste des tours, la référence et la mise au point |
| [Rejeu et scène 3D](race-replay-and-scene.md) | la barre de transport, les trois modes de rejeu, l'alignement des voitures, la caméra de poursuite, les lignes, les cartes, les voitures, les étiquettes, les mondes en miroir |
| [Graphiques et HUD](race-charts-and-hud.md) | les graphiques de distance, le sélecteur de graphique, le survol et le zoom, les cartes de voiture, le tableau des canaux |
| [Événements de contrôle des voitures](race-control-events.md) | blocages, patinage des roues, survirage, tête-à-queue, sous-virage, impacts, accidents, ABS/TC, frein à main, air - comment chacun est détecté, avec chaque seuil |
| [Analyse virage par virage](race-corner-analysis.md) | alignement par distance, virages et segments, le bilan de temps d'un virage, chaque cause et l'ordre dans lequel elles sont testées, la forme de la trajectoire et le conseil |
| [Profils de voitures et comparaison](race-car-profiles.md) | ce que chaque voiture peut faire, mesuré sur ses tours ; *Voitures comparées* ; ce que la voiture décide dans chaque virage |
| [Statistiques du circuit](race-course-statistics.md) | de nombreux tours d'un même circuit : erreurs par virage et par type, carte des erreurs, export de la carte de chaleur, limites de performance |
| [Analyse de course : la méthode](race-analytics.md) | la recherche derrière les règles, avec les sources |
| [Autres jeux de course](other-games.md) | ce que fait la visionneuse avec les tours de chaque jeu : glissement et dérive calculés là où un jeu ne les envoie pas, mondes en miroir, canaux supplémentaires |

## L'écran {#the-screen}

**Barre latérale**, de haut en bas (les sections peuvent être repliées) :

1. **Tours** - charger, lister, afficher/masquer, référence, mise au point, poursuite.
   Voir [Charger des tours](race-loading-laps.md).
2. **Statistiques du circuit** - seulement à partir de trois tours chargés.
   Voir [Statistiques du circuit](race-course-statistics.md).
3. **Où progresser** - les constats du tour mis au point, virage par virage.
   Voir [Analyse virage par virage](race-corner-analysis.md).
4. **Virage par virage** (ou *Virage par virage - classe X* avec plusieurs
   classes) - le tour le plus rapide à travers chaque virage et sa trajectoire. Affiché avec
   deux tours ou plus.
5. **Contrôle de la voiture** - blocages, glissades, poussées et impacts du tour mis au point.
   Voir [Événements de contrôle des voitures](race-control-events.md).
6. **Voitures comparées** (ou **La voiture** avec une seule voiture) - voir
   [Profils de voitures et comparaison](race-car-profiles.md).
7. **Vue** - quelle carte est peinte sur la piste et ce qui est dessiné.
   Voir [Rejeu et scène 3D](race-replay-and-scene.md).
8. Les panneaux partagés **Niveau** et **Caméra et scène** (modèle du circuit,
   inversion des axes, caméra) - documentés avec la carte de chaleur et [Caméra](camera.md).

**La vue** montre le circuit, les lignes parcourues, la carte, les voitures, les
étiquettes épinglées à la piste, et jusqu'à six cartes de voiture en haut à gauche (voir
[Graphiques et HUD](race-charts-and-hud.md)). Sans tour chargé, elle indique
« Aucun tour chargé - Déposez ici deux fichiers de tour ou plus, ou chargez les tours de démo
depuis la barre latérale. »

**La barre sous la vue** contient le transport du rejeu et, sauf si elle est masquée,
les graphiques de distance.

## Démarrage rapide {#quick-start}

1. Ouvrez l'onglet **Analyse de course** (à côté de **Carte de chaleur** en haut de la
   barre latérale).
2. Chargez des tours. Appuyez sur **Tours de démo** pour voir ce que fait l'onglet avec trois
   tours fictifs. Pour vos propres tours, enregistrez-les d'abord
   ([formats de fichier et enregistreurs](race-loading-laps.md#file-formats)), puis appuyez sur
   **Charger des tours…** ou **Dossier…**, ou déposez fichiers ou dossiers sur la vue.
3. Le tour complet le plus rapide devient la référence ; le tour le plus lent parmi les autres est
   mis au point. Cliquez sur un tour de la liste pour le mettre au point ; ★ en fait la
   référence.
4. Lisez **Où progresser**. Cliquez sur un constat : les voitures sont alignées 40 m
   avant lui, la caméra le cadre, le rejeu le traverse et les mesures s'ouvrent.
5. Survolez les graphiques pour amener chaque voiture à ce mètre ; Maj+clic pour les aligner
   à cet endroit.

## Clavier {#keyboard}

Tant que l'onglet Course est ouvert :

| Touche | Action |
|---|---|
| **K** | lecture / pause du rejeu |
| **Début** | retour au début du rejeu |
| touches numériques | rien (dans la carte de chaleur, elles changent de mode) |

Les touches saisies dans un champ de texte ou une liste déroulante sont ignorées. Les touches de
caméra fonctionnent comme dans la carte de chaleur (**W A S D**, **Espace** pour monter, **Q** pour
descendre, **Maj** plus rapide, **Alt** plus lent, souris pour regarder ; tout est dans
[Caméra](camera.md)) ; **F** cadre les tours chargés (comme le fait le chargement des tours).

## Beaucoup de tours {#many-laps}

- Tous les tours chargés sont analysés et comptés ; des dizaines prennent une ou deux secondes.
- Au-delà de **8** tours (`SHOW_ALL_UP_TO`), les tours ajoutés ne sont dessinés que s'ils sont
  la référence, le tour mis au point, ou le meilleur tour de la classe du tour mis au point.
  *Tout afficher* / *Seulement ceux regardés* basculent entre les deux.
- Au-delà de **10** voitures visibles (`PLAIN_PAST`), les tours non regardés (ni le tour mis au point,
  ni la voiture suivie, ni la référence) sont dessinés avec des lignes éclaircies à un point
  tous les 6 m au lieu de 1,5 m, et avec des voitures simples.
- Les graphiques dessinent au plus **8** tours ; le HUD affiche au plus **6** cartes.
- Les statistiques du circuit apparaissent à partir de **3** tours.

Détails : [Statistiques du circuit](race-course-statistics.md#performance-with-many-laps).

## Réglages d'affichage par défaut {#default-view-settings}

| Réglage | Par défaut |
|---|---|
| Carte | Carte temporelle |
| Lignes parcourues, Voitures, Pneus et suspension, Étiquettes, Piste d'après les tours | activé |
| Toutes les valeurs sur les cartes | désactivé |
| Taille des voitures | 1× |
| Graphiques | affichés |
| Mode de rejeu | Depuis la ligne |
| Vitesse du rejeu | 1× |
| Boucle | activée |

Rien de tout cela n'est enregistré ; un rechargement repart des valeurs par défaut. Ce qui est
mémorisé dans le navigateur : la langue, et les noms de voitures appris à partir des fichiers de tour
(voir [Charger des tours](race-loading-laps.md#car-names)).

## Pour les développeurs {#for-developers}

### What happens when laps are loaded {#what-happens-when-laps-are-loaded}

Every time the set of laps, the reference or the language changes, the whole
analysis is redone (`analyse` in
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Derived channels are added to each lap where the game does not send them:
   drift angle, wheel slip from wheel speeds, in the air, loose ground, yaw
   rate ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. The reference is chosen and every lap is projected onto its path and
   resampled every 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Whether the game's world is mirrored is worked out from the laps
   ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Corners are found on the reference, and grouped into segments from one
   braking zone to the next ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Per car: its envelope (grip, braking, pull per speed), its profile, its
   tyre curves ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Per lap and segment: what it did (brake point, slowest point, full
   throttle, ...) and the line it drove ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Per lap: its car-control events, each laid against the lap it is compared
   with there.
8. Per lap and segment: the time account against its comparison lap and the
   finding in words.
9. The time map and the cause map per lap.

The texts are produced in the current language; switching language runs the
analysis again (and renames the demo laps). A failure in the analysis is
shown under the **Laps** buttons as an error and the laps stay loaded.

### Source files {#source-files}

| File | Role |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | reading lap files |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | the lap type, naming, demo laps |
| `src/race/derive.ts`, `handedness.ts` | derived channels, mirrored worlds |
| `src/race/align.ts`, `segments.ts`, `line.ts` | distance axis, corners, lines |
| `src/race/analysis.ts` | corners compared, causes, findings |
| `src/race/envelope.ts`, `profile.ts` | what a car can do |
| `src/race/control.ts`, `impacts.ts` | car control, hits and crashes |
| `src/race/stats.ts` | many laps |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | replay and drawing |
| `src/race/schema.ts`, `graphs.ts` | the channel table, the charts' rows |
| `src/ui/race/*` | the sidebar, the charts, the HUD, the labels |
| `src/state/raceStore.ts` | the tab's state and the replay clock |
