---
title: "Analyse des impacts (onglet Véhicules)"
parent: "Replay"
nav_order: 4
lang: "fr"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Analyse des impacts

L’onglet **Véhicules** montre où un char, un navire ou un soldat a été touché, et par qui. Servez-vous-en pour voir quel côté d’un char reçoit les tirs, ou quel ennemi fait les dégâts.

## Essayer {#try-it}

1. Chargez un match qui contient des impacts (le tableau ci-dessous indique quels jeux en donnent).
2. Ouvrez l’onglet **Véhicules** en haut.
3. Sous **Véhicule**, choisissez une unité, par exemple un type de char. Le nombre entre parenthèses est le nombre de coups reçus.
4. Lisez la figure : chaque marque est un impact, placé là où il a frappé.
5. Ouvrez **Qui l’a touchée** pour voir les tireurs, les armes ou les véhicules tireurs, avec les impacts, les dégâts, les éliminations et la distance.

![L’onglet Véhicules : un char de démonstration avec des marques d’impact, et Qui l’a touchée ouvert](../assets/img/en/hit-analysis-tank.webp)

Si rien n’est chargé, ou si les données n’ont pas d’impact sur les véhicules, l’onglet indique ce qui manque et quel convertisseur utiliser.

```
        tireur ----> o  marque d’impact sur la figure
        tireur ----> o
  [ figure du char ]
```

La figure montre les impacts là où les données donnent un point ou une partie du corps. Le détail (qui l’a touchée, avec quoi, avec quelle force, de quelle distance) fonctionne pour chaque source.

## Ce que donne chaque source {#what-each-source-gives}

| Source | Point sur l’unité | Tireur | Arme | Dégâts / issue |
|---|---|---|---|---|
| War Thunder | oui, dans le repère de l’unité, avec le sens du tir | oui | le véhicule du tireur | critique, grave, modules détruits, tir mortel |
| CS2 | partie du corps (hitgroup) | oui | oui | dégâts, blindage, santé restante |
| World of Tanks | oui (boîte de composant, entrée et sortie) | oui | - | dégâts ou aucun (ricochet, pas de pénétration) |
| World of Warships | oui, dans le repère du navire | oui | type de coup | - |
| Squad | véhicules : oui - l’impact placé dans le repère du véhicule à partir de sa propre position et de son cap | non (les données n’en nomment aucun) | le type de dégât | la baisse de la santé du véhicule à cet instant, détruit |
| Soldats de Squad | non : les résultats de coup (os et point d’impact) sont gardés bruts par le convertisseur ; les lignes `impact` avec `hitBone` sont lues dès qu’il les écrit | | | blessures et morts seulement |
| Arma (OCAP, l’enregistreur d’Arma 3) | non : OCAP enregistre qui a touché ou tué qui, avec quoi, de quelle distance, pas où | oui | oui | touché ou tué, distance |
| Tacview ACMI | oui là où un objet d’arme finit à moins de 30 m d’une unité (pas son lanceur) : son dernier lieu dans le repère de l’unité (cap, tangage, roulis), en venant de la direction où il a volé | le `Parent` de l’arme | le nom de l’arme, ou le AmmoType d’un Timeout | `Outcome` du Timeout, baisses de `Health`, `Destroyed` ; sans arme, une élimination ou des dégâts sans point |
| Télémétrie IL-2 (Watcher) | oui : les événements `hit` / `damage` portent le point dans le repère de l’avion du joueur (pris comme x vers l’avant, y vers le haut, z vers la droite) | non | non | la force |
| Dota 2 | non : le journal de combat n’a pas de lieu sur un héros | l’unité attaquante | la capacité ou l’objet (aucun : une attaque) | dégâts, mort du héros |
| Battlefield 6 (GameCapture) | non : la capture lit le fil des frags (éliminations, morts, indicateur de tir à la tête), pas les impacts | | | |
| DCS / autres sources en direct du Watcher | aucun événement d’impact au-delà de ce que contiennent leurs enregistrements Tacview | | | |

Quand aucun impact de l’unité n’a de point, la figure ne montre aucune marque, et le détail **Qui l’a touchée** s’ouvre tout seul : par tireur, arme ou véhicule du tireur, chacun avec ses impacts, ses dégâts et ses éliminations, ainsi que la distance médiane et la plus lointaine.

## Limiter à une zone {#restrict-to-an-area}

La section **Zone** limite l’analyse aux impacts qui ont eu lieu dans un endroit de la carte.

1. Appuyez sur **Dessiner un rectangle** ou **Dessiner un polygone**, et dessinez sur le sol 3D ou sur la carte tactique.
2. Choisissez **Victime dedans** (compter un impact quand l’unité touchée était dans la zone) ou **Tireur dedans** (quand c’était celui qui a tiré).
3. Appuyez sur **Les utiliser comme filtre**. Les puces affichent « {n} sur {total} impacts dans la zone ».
4. **Réinitialiser la zone** supprime toutes les zones.

Chaque zone est un [volume](volumes.md), si bien que les mêmes formes filtrent aussi la carte de chaleur et le replay. Une zone peut inclure ou exclure (une zone d’exclusion retire ses impacts, affichés comme « {n} sur {total} impacts hors de la zone »). Chaque zone apparaît comme une puce avec le nombre d’impacts de l’unité qui s’y trouvaient ; le × d’une puce la retire. Les comptes, la figure, le détail et les listes filtrées suivent tous.

Les places d’un impact : la ligne dont il vient contient la place d’une seule partie (celle de la victime pour un blessé ou un frappé, celle du tireur pour un tir) ; celle de l’autre est l’échantillon propre de cette unité le plus proche dans le temps (à 5 s près). Un impact dont la place de la partie n’est pas connue est laissé de côté pendant qu’une zone filtre, et le panneau dit combien (« Laissés de côté, aucune place connue »).

## Pour les développeurs {#for-developers}

Tout convertisseur peut ajouter des impacts : une ligne de victime (`hit`, `impact`, `hurt`, `wounded`) avec `hitBone` (un os du squelette, une sélection d’Arma, une zone de coup de Reforger - mappée sur la tête, le torse, le ventre, les bras et les jambes) ou `hitLocalX/Y/Z` (en mètres, x vers l’avant, y vers le haut, z vers la droite), avec `other` pour le tireur et `damage`.
