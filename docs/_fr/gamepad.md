---
title: "Manette et HOTAS"
parent: "Caméra et commandes"
nav_order: 1
lang: "fr"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Manette et HOTAS

Vous pouvez piloter la caméra avec une manette de type Xbox au lieu du clavier. Utilisez-la quand vous voulez vous détendre et regarder autour d'une grande scène. Son action **s'ajoute** à celle du clavier : vous pouvez utiliser les deux en même temps.

## Connecter une manette {#connect-a-controller}

1. Branchez la manette (ou appairez-la).
2. Cliquez dans la vue et appuyez sur un bouton de la manette. Les navigateurs n'affichent une manette qu'après sa première action.
3. Ouvrez **Caméra et scène → Manette**. La liste des périphériques l'affiche avec `●`.
4. Poussez le stick gauche pour voler, le stick droit pour regarder. Si la caméra dérive quand les sticks sont au centre, augmentez la **Zone morte**.

Tout périphérique que le navigateur associe à la disposition standard d'une manette fonctionne. Un manche de vol ou une manette de gaz (HOTAS) est ignoré par défaut ; voir plus bas.

## Commandes {#mapping}

| Commande | Effet |
|---|---|
| Stick gauche | Déplacement : avant/arrière et latéral |
| Stick droit | Regard : lacet et tangage, à la *Vitesse du regard* en degrés par seconde à pleine course |
| `RT` / `LT` (analogique) | Monter / descendre ; en projection parallèle, zoomer / dézoomer |
| `RB` (maintenu) | 6 fois plus vite |
| `LB` (maintenu) | 15 % de la vitesse |
| `A` (maintenu) | Sprint ×3 (se cumule avec RB/LB) |
| `Y` (appui) | Cadrer les données |

Les numéros des boutons suivent la disposition standard : A 0, Y 3, LB 4, RB 5, LT 6, RT 7 ; les sticks sont sur les axes 0-1 (gauche) et 2-3 (droit).

## Les réglages de la manette {#the-gamepad-settings}

Dans **Caméra et scène → Manette**. **Réglages** / **Masquer** ouvre ou ferme les commandes de réglage.

| Réglage | Défaut | Plage (réglage fin) | Sens |
|---|---|---|---|
| **Activée** | activé | | |
| État des périphériques | | | Chaque périphérique connecté : `●` quand il est suivi, `○` quand il ne l'est pas, avec *— pas une manette XInput, ignorée* ou *— pas une manette XInput, utilisée quand même* pour les périphériques non standard. Sans aucun périphérique : *Aucune manette détectée. Les navigateurs ne révèlent une manette qu’après sa première action — appuyez sur l’un de ses boutons.* |
| **Manette utilisée** | *Manettes XInput uniquement (recommandé)* | | Affiché quand un périphérique non standard est connecté. Choisissez un périphérique par son nom pour le suivre à la place. |
| **Vitesse du regard** | 150°/s | 20 à 540 (5 000) | Vitesse de rotation à pleine course du stick droit. |
| **Zone morte** | 12 % | 0 à 50 % (95 %) | Radiale : une poussée en diagonale ne fuit jamais dans un seul axe. Augmentez-la si la caméra dérive quand les sticks sont au centre. |
| **Courbe des sticks** | x² | linéaire (1) à x⁴ (16) | Exposant de réponse après la zone morte : contrôle plus fin près du centre, vitesse maximale toujours atteinte au bord. |
| **Inverser l’axe Y des sticks** | désactivé | | |
| **Intervertir les sticks** | désactivé | | Déplacement avec le stick droit, regard avec le gauche. |

La forme du stick : avec une inclinaison *m* (la longueur du vecteur du stick) et une zone morte *d*, la sortie vaut ((m - d) / (1 - d)) ^ courbe dans la direction du stick, et 0 à l'intérieur de la zone morte.

## Pourquoi seules les manettes standard par défaut {#why-only-standard-pads-by-default}

L'API Gamepad signale **tous** les périphériques HID qui ont des axes : manches de vol, manettes de gaz, pédales, volants. Ces axes ne reposent pas au centre : un axe de torsion ou un levier de gaz est en pleine course quand personne n'y touche. Lu comme un stick, cela donne une commande permanente à pleine vitesse qu'aucune zone morte ne peut supprimer. La caméra tournerait toute seule dès le chargement de la page, et chaque mode de chaleur paraîtrait cassé, car une caméra en mouvement redémarre l'accumulation à chaque image.

Un périphérique n'est donc suivi que lorsque le navigateur signale `mapping: "standard"`, c'est-à-dire « une manette de type XInput avec les axes là où on les attend ». Les autres périphériques sont listés et marqués comme ignorés. **Manette utilisée** permet d'en choisir un explicitement, par exemple pour piloter la caméra avec un HOTAS. Une fois une manette suivie, la caméra reste avec elle : deux manettes ne se disputent pas la caméra selon l'ordre d'énumération.

**HOTAS :** seuls les axes 0 à 3 (deux sticks) et les boutons standard sont lus. Une manette de gaz ou des pédales sur d'autres axes ne font rien. Un manche ou une manette de gaz dont les axes ne reposent pas au centre peut demander une **Zone morte** plus grande.

Les navigateurs cachent une manette tant qu'elle n'a pas envoyé sa première action. Une manette branchée mais non touchée n'existe donc pas encore pour la page.
