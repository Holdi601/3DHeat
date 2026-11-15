---
title: "Liste des équipes"
parent: "Filtres et outils"
nav_order: 2
lang: "fr"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Liste des équipes

Le panneau **Équipes** vous permet de masquer une équipe ou de la placer d'un côté d'une comparaison. Utilisez-le pour ne regarder que Blue, ou pour demander « où va Blue que Red ne va pas ? ».

Un *groupe* est une équipe ou un camp, par exemple Blue et Red ([Groupes](sessions-persons-groups.md#group)). Le panneau s'affiche quand le jeu de données a une colonne de groupe ; le nombre de groupes figure dans son en-tête. En mode Chaleur par équipe, la barre latérale a aussi une section nommée **Vue des équipes** avec ses propres réglages. Cette page couvre la liste **Équipes**.

## Masquer une équipe {#hide-a-team}

1. Ouvrez **Équipes** dans la barre latérale.
2. Décochez la case (*Visible*) de l'équipe à masquer. L'image se met à jour tout de suite.
3. Appuyez sur **Tout afficher** pour faire revenir chaque équipe.

![La liste des équipes : Blue 5p, Red 5p, avec Tout afficher](../assets/img/en/teams-list.webp)

## Chaque ligne {#each-row}

| Partie | Sens |
|---|---|
| Case à cocher (*Visible*) | Affiche ou masque le groupe. |
| Pastille | La couleur du groupe : sa couleur de [chaleur par équipe](team-heat.md) en mode Chaleur par équipe, sa couleur de base dans les autres modes. |
| Nom | L'étiquette du groupe (étiquette complète au survol). |
| **+** / **-** (mode Différence) | Place le groupe du côté positif ou négatif de la [différence](difference.md). Cliquez à nouveau sur le bouton actif pour le retirer des deux côtés. |
| `Np` (autres modes) | Le nombre de personnes dont la première ligne est dans ce groupe. |

![Mode Différence : Blue du côté +, Red du côté -](../assets/img/en/teams-list-difference.webp)

## Boutons {#buttons}

| Bouton | Effet |
|---|---|
| **Tout afficher** | Rend de nouveau visible chaque groupe. |
| **Répartir équitablement** (mode Différence) | La première moitié des groupes (arrondie au supérieur) passe en +, le reste en -. C'est la même répartition que celle avec laquelle chaque chargement commence. |

## Ce que fait le masquage d'un groupe {#what-hiding-a-group-does}

- En **Chaleur**, **Chaleur par équipe** et **Lignes**, les lignes du groupe n'apportent rien.
- En **Différence**, un groupe masqué n'apporte rien, quel que soit son côté, y compris avec une séparation par une autre colonne (voir [Différence](difference.md#for-developers)).
- Dans la **superposition des figurines**, les personnes dont la première ligne est dans ce groupe ne sont pas dessinées.
- En **Chaleur par équipe**, les autres groupes gardent leurs couleurs. Les teintes sont attribuées d'après le nombre total de groupes, et non d'après ce qui est visible, pour que deux images restent comparables.

Changer la visibilité redémarre l'accumulation. À chaque nouveau jeu de données, chaque groupe redevient visible.

Le conseil du panneau change selon le mode : en Différence, il explique + et - ; en Chaleur par équipe, il indique que les pastilles sont les couleurs que dessine chaque groupe.
