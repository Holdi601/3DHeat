---
title: "Entités"
parent: "Filtres et outils"
nav_order: 3
lang: "fr"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entités

**Entités** vous permet de choisir un joueur (ou quelques-uns) pour ne voir que là où ce joueur est allé. Utilisez-le pour suivre votre propre déplacement ou celui d'un adversaire.

Le panneau s'affiche quand le jeu de données a une colonne de personne. Son en-tête montre le nombre de personnes, ou `sélection sur total` pendant qu'une sélection est active (une *personne* est un joueur ou une IA, voir le [glossaire](glossary.md)).

## Choisir un joueur {#pick-a-player}

1. Ouvrez **Entités** dans la barre latérale.
2. Tapez une partie du nom dans la zone de recherche.
3. Cochez le joueur. L'en-tête affiche par exemple `2 sur 10`, et tout le reste disparaît.
4. **Effacer** affiche de nouveau tout le monde.

![Entités avec deux joueurs sur dix sélectionnés](../assets/img/en/entities-selected.webp)

La sélection ne montre que les personnes sélectionnées, dans les modes de chaleur (points, lignes, différence, chaleur par équipe) comme dans les traces, les figurines et les traînées de la [superposition des figurines](box-replay.md). Laissez-la vide pour montrer tout le monde ; sélectionner tout le monde revient à ne rien sélectionner.

## Le panneau {#the-panel}

| Partie | Sens |
|---|---|
| Zone de recherche | *Chercher parmi N entités...* : filtre la liste par une sous-chaîne du nom, sans tenir compte de la casse. Affiche `N résultats`, ou `N résultats, les 200 premiers affichés` ; *Aucun résultat pour « ... »* quand la recherche ne trouve rien. |
| Liste | Jusqu'à 200 personnes (les 200 premières correspondantes), chacune avec une case à cocher, une pastille de la couleur de la personne et le nom (*(sans nom)* si le nom est vide). |
| Indication « en jeu » | Quand le temps joue, la liste contient celles *en jeu à la tête de lecture*. Une recherche trouve toutes les personnes. |
| **IA (n)** | Un groupe repliable qui contient les unités pilotées par l'IA, à part des joueurs. |
| **Ajouter la liste** | Ajoute à la sélection toutes les personnes actuellement listées. |
| **Seulement la liste** | Rend la sélection exactement égale aux personnes listées. |
| **Effacer** | Vide la sélection. |

## Limites {#limits}

Dans la chaleur, la sélection est un filtre et utilise l'un des quatre [emplacements de filtre](filters.md#rules). Quand les autres filtres occupent déjà les quatre, le panneau dit *Non appliqué à la chaleur : tous les emplacements de filtre sont pris. La superposition des figurines n'affiche encore que ces entités. Effacez un filtre dans Filtres pour en libérer un.* Effacez un filtre pour libérer un emplacement.

La sélection est effacée à chaque nouveau jeu de données. L'onglet **Match** règle la même sélection quand il se concentre sur un joueur.

## Pour les développeurs {#for-developers}

La sélection est stockée comme un filtre *persons* ([Filtres](filters.md#for-developers)). Le masque du shader contient 65 536 identifiants de personne. Une personne au-delà de ce nombre n'est pas dessinée dans la chaleur quand une sélection est active.
