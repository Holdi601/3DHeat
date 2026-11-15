---
title: "Trajectoire de caméra et vidéo"
nav_order: 15
lang: "fr"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Trajectoire de caméra et vidéo

Faites un film de vos données : vous placez la caméra à quelques endroits, la visionneuse vole de l’un à l’autre et enregistre une vidéo. Chaque image est très nette, sans grain. La caméra et la tête de lecture bougent ensemble, si bien que le même panneau fait aussi un timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Faire un survol {#make-a-flythrough}

1. Volez jusqu’à l’endroit où le film commence et appuyez sur **Ajouter une image clé ici** dans **Trajectoire de caméra et rendu**.
2. Volez jusqu’à l’endroit suivant et appuyez à nouveau. Répétez pour chaque étape.
3. Cochez **Aperçu le long de la trajectoire** et faites glisser **Position le long de la trajectoire** pour vérifier le mouvement.
4. Réglez la **Durée** (la longueur de la vidéo). Un mouvement juste mais trop rapide n’a besoin que d’une durée plus longue.
5. Appuyez sur **Générer la vidéo**. Attendez la ligne de progression ; le fichier se télécharge à la fin.

![Le panneau Trajectoire de caméra et rendu avec trois images clés, interpolation Douce, 12 s, 30 fps et 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Images clés {#keyframes}

| Commande | Effet |
|---|---|
| **Ajouter une image clé ici** | Ajoute la position, le lacet, le tangage et le champ de vision actuels de la caméra comme une image clé. |
| **Effacer** | Supprime toutes les images clés. |
| Liste des images clés | Une ligne par clé : son numéro (un clic y fait voler la caméra, en réglant aussi le champ de vision), la position, `lacet° / tangage°`, et **×** pour la supprimer. |

Les clés sont réparties **également** le long d’un axe de trajectoire normalisé de 0 à 1 chaque fois qu’on en ajoute ou retire une ; la durée de sortie étire ensuite tout le mouvement, si bien qu’un plan juste mais trop rapide n’a besoin que d’une durée plus longue. Le lacet est déroulé entre les clés, pour que la caméra tourne par le plus court chemin.

Sans images clés, un rendu garde la caméra actuelle immobile pendant tout le clip - un timelapse parfaitement valable.

## Réglages de la trajectoire {#path-settings}

| Commande | Par défaut | Plage (curseur) | Signification |
|---|---|---|---|
| **Interpolation** (2 clés ou plus) | *Douce* | *Douce* / *Droite* | *Douce* : une courbe de Hermite cubique qui passe par les clés, avec des tangentes issues des clés voisines, si bien que la vitesse se raccorde à chaque clé et qu’il n’y a aucun à-coup où les segments se rejoignent. *Droite* : des lignes droites entre les clés, prévisibles, avec un angle visible à chaque clé. Le champ de vision est toujours interpolé linéairement. |
| Ligne de déplacement (2 clés ou plus) | | | `N unités de déplacement - M par seconde à cette durée`, ou une note disant que les clés sont toutes au même endroit. |
| **Aperçu le long de la trajectoire** (1 clé ou plus) | désactivé | | Pilote la caméra de la fenêtre d’affichage depuis la trajectoire, et déplace la tête de lecture avec elle comme le fait le rendu, pour juger le mouvement avant le rendu. |
| **Position le long de la trajectoire** (pendant l’aperçu) | 0 % | 0-100 % | L’endroit de la trajectoire à prévisualiser. |
| **Durée** | 12 s | 1-120 s (3600) | Longueur de la vidéo. |
| **Fréquence d’images** | 30 fps | 6-60 (240) | |
| **Débit** | 16 Mbps | 1-60 Mbps, logarithmique (400) | Les dégradés de chaleur se rayent mal à bas débit : il y a peu de détails derrière lesquels un codec peut cacher l’erreur. |
| **Limite d’attente de convergence** | 240 images | 2-600 (10 000) | La plus longue attente qu’une image de sortie peut subir pour devenir exacte. Les images qui atteignent la limite sont tout de même écrites, et comptées. |
| Résumé | | | `N images · fenêtre : cumulée/fixe/durée de vie`, et, quand la chronologie est en mode Tout : *(le rendu passe de Tout à Lecture pour que la tête de lecture ait un sens)*. |
| **Générer la vidéo** / **Annuler** | | | Lance le rendu ; pendant qu’il tourne, affiche `image i / n · attendu w · X Mo` et le nombre d’images qui n’étaient pas exactes. Il faut un jeu de données. |

## Astuces {#tips}

- La taille de sortie est la taille de la toile en pixels physiques (le rapport de pixels de l’écran, plafonné à 2). Redimensionnez la fenêtre du navigateur pour la changer.
- Un historique cumulé construit la chaleur tout au long du clip ; un historique par fenêtre ou par durée de vie montre une tranche de temps mobile.
- Les positions des clés sont des coordonnées d’affichage : avec un [axe du monde inversé](camera.md#invert-world-axis), les clés faites avant de l’inverser pointent ailleurs après.

## Pour les développeurs {#for-developers}

### Ce que fait un rendu {#what-a-render-does}

1. Prend une capture de test de l’image pour connaître la taille de sortie exacte en pixels physiques.
2. Choisit un codec par WebCodecs : **VP9** (`vp09.00.10.08`), sinon **VP8**, au débit et à la fréquence d’images choisis. Sans `VideoEncoder`, il s’arrête avec *Ce navigateur n’a pas de VideoEncoder - WebCodecs est requis pour écrire une vidéo* ; sans aucun des deux codecs, avec *Aucun codec vidéo pris en charge (VP9, VP8 essayés)*.
3. Prend la main sur les réglages dont un rendu a besoin : met la lecture en pause, désactive le **budget adaptatif**, active l’**affinage progressif** et règle le budget de sprites à 64 M par image (le budget adaptatif protège la fréquence d’images, qui est le mauvais but ici : il lirait chaque image lente qui converge comme une raison de dessiner moins de lignes, ce qui demande davantage d’images pour converger), et passe la chronologie de **Tout** à **Lecture**. Le réglage d’historique (cumulé, fenêtre, durée de vie) reste tel quel : un rendu doit être ce que vous regardiez, rejoué et enregistré.
4. Pour chaque image de sortie *f* sur *n*, avec *u* = f / (n - 1) :
   - place la caméra à la pose de la trajectoire en *u* (s’il y a des clés) ;
   - place la tête de lecture à la même fraction *u* de la plage de la chronologie (l’étendue de la session choisie dans le replay de boîtes) ;
   - force une nouvelle estimation, même quand la caméra n’a pas bougé - hériter de l’accumulation de l’image précédente laisserait un fantôme de la fenêtre précédente ;
   - attend, image par image, que l’image soit exacte (toutes les lignes candidates dessinées en une image, ou l’accumulation terminée), jusqu’à la limite d’attente ;
   - capture l’image composée et l’encode, avec une image clé toutes les 2 secondes de sortie pour que le fichier soit navigable.
5. Assemble les images dans un fichier WebM ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) avec des horodatages choisis d’après la fréquence d’images - le temps réel qu’a pris chaque image n’a pas d’importance.
6. Rétablit le budget, le champ de vision, le mode de la chronologie, la tête de lecture et l’état de lecture (en cours ou non).
7. Télécharge la vidéo sous le nom `3dheat-<largeur>x<hauteur>-<images>f.webm` et affiche `N images à L×H, X Mo - chaque image exacte`, ou combien ont atteint la limite d’attente.

**Annuler** s’arrête après l’image en cours (*Rendu annulé.*) et rétablit les réglages.
