---
title: "Référence clavier et souris"
parent: "Caméra et commandes"
nav_order: 2
lang: "fr"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Référence clavier et souris

Chaque touche et chaque action de souris au même endroit, pour trouver celle dont vous avez besoin. Cliquez d’abord dans la vue pour qu’elle reçoive le clavier. Les touches sont ignorées tant qu’une zone de texte ou une liste déroulante a le focus. La version courte est aussi affichée en bas à gauche de la vue.

Recherche rapide :

| Je veux ... | Appuyer sur |
|---|---|
| voler | `W A S D`, glisser pour regarder |
| tout voir | `F` |
| lire ou mettre en pause | `K` |
| lire en arrière | `J` (appuyer à nouveau pour pauser), en avant `L` |
| voir ce que signifient les couleurs | `?` ou `F1` |
| annuler dans l’onglet Tactique | `Ctrl+Z` |

## Caméra {#camera}

Tiré de [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Entrée | Effet |
|---|---|
| `W` / `↑` | Avancer dans la direction de la vue |
| `S` / `↓` | Reculer |
| `A` / `←` | Glisser à gauche |
| `D` / `→` | Glisser à droite |
| `Espace` / `E` | Monter |
| `Q` / `Ctrl` gauche | Descendre |
| `Maj` (l’une ou l’autre) | Maintenir : vitesse ×6 |
| `Alt` gauche | Maintenir : vitesse à 15 % |
| Glisser avec le bouton gauche ou droit sur la vue | Regarder (pointeur verrouillé pendant que le bouton est enfoncé) |
| Molette (perspective) | Vitesse de vol ×1.5 par cran (4 crans au maximum par événement de molette) |
| Molette (parallèle) | Zoom |
| Clic droit | N’ouvre aucun menu contextuel sur la vue |

## Général {#global}

Tiré de [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Touche | Effet |
|---|---|
| `K` | Lire / mettre en pause la [chronologie](timeline.md) |
| `F` | Cadrer les données |
| `C` | Copier la position, le lacet et le tangage de la caméra ([lecture de la caméra](camera.md#camera-readout)) |
| `G` | Aller à un point saisi : ouvre la boîte sous la lecture de la caméra |
| `Échap` | Ferme la fiche de sélection ; puis arrête de regarder la deuxième unité ; puis arrête de suivre une unité |
| `T` | Active ou désactive l’aspect d’affichage tactique ([Replay de match](match-replay.md#display-style)) |
| `?` / `F1` | Mode aide : ce que signifient les couleurs ([Réglages, unités et touches](settings.md#help-mode)) |
| `1` | [Chaleur](heat.md) |
| `2` | [Différence](difference.md) |
| `3` | [Chaleur par équipe](team-heat.md) |
| `4` | [Lignes](line-heat.md) |
| `]` | Repousse la limite d’élimination lointaine ×1.12 (`Maj` : ×1.35) |
| `[` | Rapproche la limite d’élimination lointaine ÷1.12 (`Maj` : ÷1.35) |
| `\` | Désactive la limite d’élimination lointaine / la réactive à l’endroit où elle était ([Profondeur et élimination des faces](depth-and-culling.md#keyboard)) |

Le mode **Figurines superposées** n’a pas de touche numérique ; choisissez-le dans la barre des modes ou ouvrez l’onglet Match. Les touches numériques passent par la même vérification que la barre des modes : une touche pour un mode que la barre indique comme indisponible pour les données chargées ne fait rien.

## Replay de match {#match-replay}

En mode Figurines superposées, qu’utilise l’onglet Match ([Replay de match](match-replay.md)). Elles fonctionnent qu’une unité soit suivie ou non, sauf indication contraire :

| Touche | Effet |
|---|---|
| `B` | Ajouter un signet : l’instant et la caméra |
| `M` | Carte 2D : coin, vue entière, désactivée |
| `V` / `Maj+V` | Vue de caméra suivante / précédente de l’unité suivie |
| `H` | Affichage tête haute dans les vues cockpit et padlock |
| `Page suivante` / `Page précédente` | Événement suivant / précédent des genres que liste la liste d’événements |
| `J` | Lecture en arrière ; à nouveau, pour pauser |
| `L` | Lecture en avant ; à nouveau, pour pauser |
| `.` / `,` | Une seconde en avant / en arrière, en pause (`Maj` : dix secondes) |
| `Échap` | Arrête de regarder la cible d’abord, puis arrête de suivre |
| `Ctrl`+clic ou `Alt`+clic sur une unité (dans la vue ou dans la liste des unités) | Regarder depuis l’unité suivie (la vue à deux unités) ; cliquez à nouveau pour la retirer |
| `Maj`+clic sur deux unités | Mesurer entre elles : relèvement, portée, différence de hauteur |

`V` demande une unité suivie. `M` est la carte 2D ici, et « déplacer » dans l’onglet Tactique.

## Suivre une unité {#following-a-unit}

Pendant que la caméra suit une unité, la molette et les touches de vol tournent autour de l’unité au lieu de voler librement ([Caméra](camera.md#while-following-a-unit)) :

| Entrée | Effet |
|---|---|
| Molette, `W` / `S` | Plus près / plus loin (plus haut / plus bas dans la vue satellite). Pas dans les vues cockpit et padlock. |
| `A` / `D`, `Q` / `E` | Tourner autour de l’unité (vues poursuite et orbite) |
| Glisser | Regarder autour de l’unité ; dans le cockpit, regarder à l’intérieur |
| `V` / `Maj+V` | Vue de caméra suivante / précédente |
| `H` | Affichage tête haute (vues cockpit et padlock) |
| `Échap` | Arrête de regarder la deuxième unité, puis arrête de suivre |

## Tableau tactique {#tactics-board}

Dans l’onglet Tactique ([Tableau tactique](tactics-board.md)). `F`, `C`, `G` et `T` fonctionnent comme ci-dessus ; les touches numériques ne font rien.

| Touche | Effet |
|---|---|
| `Ctrl+Z` | Annuler |
| `Ctrl+Y` ou `Ctrl+Maj+Z` | Rétablir |
| `Entrée` | Termine la flèche en cours de tracé (un double-clic ou un clic droit fait de même) |
| `Échap` | Annule un glisser ; sinon abandonne la flèche ou le déplacement en cours ; sinon désélectionne |
| `Suppr` ou `Retour arrière` | Supprime la sélection |
| `W` / `E` / `R` | Poignée Déplacer / Tourner / Échelle pour la sélection (schéma **W / E / R**) |
| `G` / `R` / `S` | Poignée Déplacer / Tourner / Échelle pour la sélection (schéma **G / R / S**) |
| `R` | Sans sélection : tourne la prochaine figurine à placer de 15°. `Maj+R` la tourne en sens inverse. |
| `M` | Une figurine sélectionnée : la déplace jusqu’au prochain clic |
| `K` | Lire ou mettre en pause le plan |
| Maj+clic | Ajoute à la sélection ou retire de la sélection |
| Maj+glisser | Trace un cadre autour de ce qu’il faut sélectionner |
| `Ctrl` pendant qu’on glisse une poignée | S’aligne sur la grille ou sur le pas d’angle |

Les touches de poignée ne marchent que si quelque chose est sélectionné ; sans sélection, `W A S D` font voler la caméra comme d’habitude.

## Clic pour sélectionner {#click-to-pick}

Avec **Un clic montre ce qui s'y trouve** activé et la règle désactivée ([Clic pour sélectionner](camera.md#click-to-pick)) :

| Entrée | Effet |
|---|---|
| Clic gauche (sans glisser plus de 4 px) | Montre le point de donnée, ou sinon le point du niveau, sous le pointeur |

## Mesure {#measure}

Avec **Règle active** ([Mesure](measure.md)) :

| Entrée | Effet |
|---|---|
| Clic gauche (sans glisser plus de 4 px) | Pose un point |
| Clic droit | Retire le dernier point |

## Ailleurs {#elsewhere}

| Où | Entrée | Effet |
|---|---|---|
| La poignée de n’importe quel curseur (à côté du nombre) | Glisser vers le haut / le bas | Change la valeur en continu, d’autant plus vite qu’on glisse loin ; maintenez `Maj` pour un réglage fin. Relâchez pour arrêter. |
| L’affichage de vitesse sur la vue | Glisser vers le haut / le bas | Change la vitesse de vol de la même façon. |
| Cases de position | `Entrée` | Applique la position ou l’orientation saisie. |
| Éditeur de courbe | Double-clic / Alt-clic / clic droit | Ajoute un point / retire un point ([Forme des sprites](sprite-shape.md#the-curve-editor)). |

## Onglet Analyse de course {#race-analysis-tab}

Dans l’onglet Analyse de course, `K` lance et met en pause le replay de course, `Début` le rembobine, et les touches numériques ne font rien. Voir [Analyse de course](race-analysis.md).

## Touches que la visionneuse garde du navigateur {#keys-the-viewer-keeps-from-the-browser}

Certains raccourcis du navigateur fermeraient ou rechargeraient la page et feraient perdre une session chargée ; la visionneuse les garde pour elle. La liste est générée à partir du code : [Raccourcis du navigateur](ref-browser-keys.md).

## Manette {#gamepad}

Voir [Manette et HOTAS](gamepad.md).
