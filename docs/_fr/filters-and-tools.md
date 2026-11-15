---
title: "Filtres et outils"
nav_order: 6
has_children: true
lang: "fr"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filtres et outils

Ces panneaux vous permettent de choisir *quelles* données vous regardez et de mesurer ce que vous voyez. Utilisez-les quand l'image est trop chargée : n'afficher qu'une équipe, un joueur, un lieu, ou un étage d'un bâtiment.

Chaque panneau restreint les données, et ils fonctionnent ensemble : une ligne n'est dessinée que si elle passe **tous** les filtres (ET).

```
toutes les lignes -> Filtres -> Équipes -> Entités -> Coupe -> image
                      ET         ET        ET         ET
```

Exemple : décochez *Tank* dans Filtres, masquez l'équipe Red dans Équipes, et choisissez un joueur dans Entités. Vous ne voyez que les déplacements non blindés de ce joueur.

| Panneau | Ce qu'il fait | Modes de chaleur | Superposition de figurines |
|---|---|---|---|
| [Filtres](filters.md) | Filtres d'intervalle et de catégorie sur n'importe quelle colonne conservée au chargement. | Oui | Non (filtres de colonnes seulement) |
| [Répartition différentielle](difference.md#the-difference-split-panel) | Quelles lignes s'ajoutent et lesquelles se retranchent, en mode Différence. | Différence seulement | Non |
| [Équipes](teams-list.md) | Affiche ou masque chaque équipe ; place les équipes du côté + ou -. | Oui | Oui |
| [Entités](entities.md) | Choisit des joueurs individuels. | Oui | Oui |
| [Coupe](slice.md) | Découpe une tranche du niveau et de la chaleur, pour voir à l'intérieur des bâtiments. | Oui, et le niveau | Non |
| [Mesure](measure.md) | Une règle, et la valeur de chaleur sous le curseur. | Oui | Oui |
| [Volumes et comparaison](volumes.md) | Dessine des formes 3D et demande ce qui s'y est passé. Peut aussi filtrer. | Oui | Oui |
| [Détail](breakdown.md) | Quel véhicule, joueur ou arme réussit le mieux dans un lieu. | s.o. | s.o. |

L'analyse des impacts a son propre filtre de zone dans l'onglet **Véhicules** : voir [Analyse des impacts](hit-analysis.md).

Des termes comme carte de chaleur, ligne, personne et groupe sont expliqués dans le [glossaire](glossary.md).

## Où se trouvent les panneaux {#where-the-panels-are}

La barre latérale de l'onglet Carte de chaleur, de haut en bas :

1. Barre des modes et sélecteur de session
2. Source, Mappage des colonnes, Jeu de données
3. Parcours (mode Lignes)
4. Les panneaux de chaleur, ou la Vue des équipes
5. Répartition différentielle
6. Équipes
7. Entités
8. Filtres
9. Arrière-plan / niveau
10. Coupe
11. Mesure
12. Trajectoire de caméra et rendu
13. Performances
14. Caméra et scène

L'onglet Match affiche la barre des modes, le sélecteur de session, son propre panneau, Filtres, Arrière-plan / niveau et Caméra et scène.
