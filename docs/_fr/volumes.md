---
title: "Volumes et comparaison"
parent: "Filtres et outils"
nav_order: 6
lang: "fr"
source: "volumes.md"
source_hash: "25cc132dbe25"
translated: true
outdated: false
---

# Volumes et comparaison

Un **volume** est une boîte invisible (ou un cylindre, ou une sphère) que vous tracez autour d'un lieu, pour poser la question : que s'est-il passé ici ? Utilisez-le pour compter les éliminations sur un pont, comparer deux collines, ou n'afficher que l'activité d'une zone.

```
 vue de dessus           Vous tracez une forme -> la visionneuse compte
 +------------+          ce qui se trouve à l'intérieur :
 |   ( A )    |           lignes, joueurs, éliminations, temps ...
 |        [B] |          Comparez A et B, côte à côte.
 +------------+
```

![Trois volumes sur la vallée de démonstration : deux cylindres autour des collines, une boîte autour du village](../assets/img/en/volumes.webp)

Les volumes mesurent ce qui se passe à l'intérieur, restreignent la vue à eux, exportent leurs lignes et peuvent être comparés côte à côte. Voir aussi le [glossaire](glossary.md) pour ligne, personne et match.

## Tracer un volume {#draw-a-volume}

1. Ouvrez **Volumes** dans la barre latérale.
2. Choisissez un outil et tracez dans la vue 3D ou sur la carte 2D. Le sol et le plafond partent des données situées dessous. Échap annule.
3. Cliquez sur le volume pour le sélectionner ; ses **Statistiques** apparaissent.

| Outil | Comment tracer |
|---|---|
| **Boîte** | Faites glisser un rectangle (Maj : un carré). Un clic place une boîte par défaut. |
| **n-gone** | Faites glisser depuis le centre (Maj le garde régulier). *Coins* règle n, de 3 à 64 (par défaut 8, le bouton affiche donc **8-gone**). |
| **Polygone** | Cliquez les coins ; fermez par un double-clic, Entrée ou un clic sur le premier coin. Retour arrière supprime le dernier coin. |
| **Cylindre** | Faites glisser le rayon. |
| **Sphère** | Faites glisser le rayon ; elle repose sur le sol. |

## Modifier {#edit}

- Cliquez un volume pour le sélectionner. Faites glisser son corps pour le déplacer, ses coins pour le remodeler (Maj sur un coin met à l'échelle).
- Les poignées **jaunes** règlent le sol et le plafond, la poignée **cyan** le fait pivoter.
- Alt+glisser copie, Suppr supprime, Ctrl+Z / Ctrl+Y annulent et rétablissent, Ctrl+D duplique. **Tout retirer** supprime chaque volume.
- Valeurs exactes : Sol, Plafond, Rotation / Tangage / Roulis (boîtes), Rayon (sphères, cylindres).

Chaque ligne de volume a une case d'affichage, une couleur, un nom, **inclure** ou **exclure**, dupliquer et supprimer. Les volumes sont enregistrés dans le navigateur pour chaque jeu de données, et **Enregistrer...** / **Charger...** écrivent et lisent un fichier `volumes.json`.

## Filtrer la vue {#filter-the-view}

| Filtre | Effet |
|---|---|
| **Tout afficher** (par défaut) | Les volumes ne font que mesurer. |
| **Seulement dedans** | La chaleur, le replay et l'[analyse des impacts](hit-analysis.md) ne dessinent que ce qui se trouve dans les volumes inclus et hors des volumes exclus. |
| **Masquer dedans** | L'inverse. |

Le filtre GPU prend jusqu'à 8 volumes avec 64 points de contour au total ; un « ! » marque un volume au-delà de cette limite. Les statistiques et l'export le comptent encore.

## Statistiques {#statistics}

La zone **Statistiques** suit les filtres, la fenêtre temporelle et les groupes masqués. *Sélectionné* affiche le volume sélectionné, *Comparer tout* met chaque volume côte à côte. Elle affiche :

- **Lignes dedans (affichées)** et **Lignes dedans (toutes les données)**, **Joueurs**, **Équipes**, **Matchs**, **Temps à l'intérieur**, **Entrées / sorties**, **Chaleur max**, **Chaleur moyenne**, **Volume / empreinte** et un histogramme **Quand** ;
- par colonne : les catégories avec **Lift** (part à l'intérieur divisée par la part dans toutes les données affichées), et les nombres avec l'intervalle, la médiane et les 5e-95e centiles.

**Statistiques en CSV / JSON** les enregistre. **Exporter les données dedans** écrit les lignes à l'intérieur en CSV ou en Parquet (*Seulement les lignes affichées* activé par défaut), pour un volume ou pour tous, avec une colonne indiquant le volume qui contient chaque ligne.

## Comparer des volumes {#compare-volumes}

Avec deux volumes visibles ou plus, appuyez sur **Comparer...**.

1. Tracez trois volumes, par exemple Colline ouest, Colline est et Village.
2. Appuyez sur **Comparer...** sous Statistiques.
3. Dans **Tableau**, lisez l'écart de chaque valeur par rapport au premier volume.
4. Passez à **Barres** pour voir les parts sous forme de barres.

![Le tableau Comparer les volumes : lignes, temps à l'intérieur, joueurs et plus pour chaque volume, avec l'écart par rapport au premier](../assets/img/en/compare.webp)

| Vue | Affiche |
|---|---|
| **Tableau** | Lignes, temps à l'intérieur, joueurs, matchs, équipes, entrées, sorties, passages, durée des passages, éliminations, morts, éliminations par mort, éliminations par minute, temps par joueur, colonnes de valeur ; regroupées par événements, classe de véhicule, joueur ou IA, équipe et direction. Chaque valeur montre son écart par rapport au premier volume et une taille d'effet (négligeable, faible, moyenne, forte). Cliquez l'en-tête d'un volume pour trier par distance au premier. |
| **Barres** | Effectifs ou parts par événement, classe, acteur, équipe ou direction. Cliquez une barre pour filtrer la vue dessus. |
| **Au fil du match** | Un graphique par volume sur les minutes du match : présence, lignes ou éliminations. Cliquez pour y aller. |
| **Passages** | Diagrammes en boîte et en violon de la durée des passages (échelle logarithmique). |
| **Flux** | Là où les trajectoires vont après avoir quitté chaque volume : une matrice de transitions ou des rubans de flux. |

![La vue Barres : types d'événements par volume, en parts](../assets/img/en/compare-bars.webp)

## Astuces {#tips}

- Partez d'une observation : dans [Observations](insights.md), **Volume ici** ajoute un cylindre autour du lieu de l'observation.
- **Détail...** ouvre le [Détail](breakdown.md) du volume sélectionné : qui et quoi réussit le mieux à l'intérieur.
- La [chaleur directionnelle](directional-heat.md) peut tracer les directions à l'intérieur du volume sélectionné.
- L'[onglet Véhicules](hit-analysis.md#restrict-to-an-area) utilise les mêmes volumes comme filtre de zone.
