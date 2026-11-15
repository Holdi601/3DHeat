---
title: "Figurines dans la superposition"
parent: "Figurines"
grand_parent: "Replay"
nav_order: 2
lang: "fr"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figurines dans la superposition

Cette page traite de la transformation des boîtes en petites figurines 3D de ce que chaque unité était réellement, et de la fumée et du feu que les figurines laissent derrière elles. Les commandes du replay lui-même se trouvent sur [Replay de match](match-replay.md).

Dans les [figurines superposées](box-replay.md) et dans le replay en figurines de l'onglet **Match**, **Figurines au lieu de boîtes** (activé par défaut) dessine chaque personne vivante sous la forme de ce qu'elle est : un soldat à pied, le char que quelqu'un conduit, l'avion dont une trace Tacview est issue. La figurine a la couleur, la place et le cap de la boîte. Pour les avions et les missiles, elle a aussi le tangage et, si les données ont une colonne Roll, l'inclinaison. **Taille des figurines** les met à l'échelle ; 1 fois correspond à la taille réelle. Un clic sur une figurine répond comme un clic sur sa boîte.

## Quelle figurine {#which-figure}

Les colonnes de nom et de type des données décident. Les règles complètes, avec les noms des colonnes, sont sur [Figurines](figures.md#which-figure-a-unit-gets). Des données sans aucune de ces colonnes sont des données de personnes : tout le monde est un soldat.

La correspondance est mise en cache par étiquette ; une image ne coûte donc que la mise en place. Une unité de données vaut un mètre, sauf si les données indiquent la taille d'un objet suivi (l'export CS2 dit qu'un joueur mesure 32 unités de large). Les figurines sont mises à l'échelle en conséquence.

Un lot optionnel de vos propres figurines peut remplacer les figurines du catalogue sur votre machine ; voir [Figurines](figures.md#an-optional-local-figure-pack).

## Effets {#effects}

Les lignes d'événements qui laissent quelque chose derrière elles pendant un moment sont dessinées là où elles se sont produites, pendant toute la durée, dans la couleur de celui qui les a causées : une fumée (environ 18 s), un cocktail molotov ou incendiaire (7 s), un flash (environ une seconde) et une explosion HE (moins d'une seconde), un leurre (15 s), une bombe posée (40 s). Elles viennent d'une colonne d'événement (Event, Events) dont l'étiquette est `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` ou `plant`. L'export CS2 les écrit au moment de la détonation.

## Replay de match : les outils de Tacview {#match-replay-tacviews-tools}

Les caméras, les signets, l'affichage tactique, les statistiques, les étiquettes, les **Lignes verticales**, la liste d'événements et la fenêtre des graphiques sont décrits sur [Replay de match](match-replay.md). [Parité avec Tacview](tacview-parity.md) liste chaque fonctionnalité de Tacview et indique où elle en est.
