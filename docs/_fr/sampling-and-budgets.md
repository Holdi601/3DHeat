---
title: "Échantillonnage et budgets"
parent: "Fonctionnement interne du rendu"
nav_order: 3
lang: "fr"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Échantillonnage et budgets

Quand il y a trop de points à dessiner en une image, la visionneuse en dessine un échantillon régulier et fait compter chaque point davantage, pour que l’image reste juste. Un contrôleur règle combien elle en dessine pour que la visionneuse garde sa fréquence d’images.

## Commandes du panneau Performances {#performance-panel-controls}

| Commande | Par défaut | Plage (curseur) |
|---|---|---|
| **Dessiner chaque ligne à chaque image** | activé | |
| **Budget adaptatif** | activé | |
| **FPS cible** | 60 | 20-240 (1000) |
| **Sprites / image au départ** (adaptatif) ou **Sprites / image** | 4.00M | 65 536-268 435 456, logarithmique (268 435 456) |
| **Résolution de la chaleur** | 100 % | 25-100 %, multipliée par l’échelle de l’étape deux adaptative |
| **Affinage progressif** | activé | Désactivé : chaque image est une nouvelle estimation d’une seule image (utile pour voir l’échantillon brut). |

Voir aussi [Panneau Performances et superposition des statistiques](performance-and-stats.md).

## Pour les développeurs {#for-developers}

### Lignes candidates {#candidate-rows}

Les lignes sont stockées dans l’ordre croissant du temps. La fenêtre de la chronologie [*lo*, *hi*] devient une plage de lignes grâce à deux recherches dichotomiques sur la colonne de temps ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)) ; sans colonne de temps, chaque ligne est candidate. Ce sont les **Lignes dans la fenêtre** de la superposition des statistiques. Les tests par ligne - filtres, groupes, séparation, élimination, coupe, durée de vie - se font plus tard, dans le shader ; une ligne qui échoue coûte une invocation de sommet et aucun fragment.

### Le plan d’échantillonnage {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) découpe la plage candidate en **blocs de 4 096 lignes consécutives** et choisit combien en dessiner à partir du budget de sprites de l’image :

- Si le budget couvre chaque bloc, tous sont dessinés - l’image est exacte.
- Sinon, les blocs sont pris à un pas régulier sur toute la plage, décalés d’une gigue qui avance du nombre d’or à chaque image ; ainsi les images successives couvrent des blocs différents, et leur réunion se remplit régulièrement. C’est un échantillon **stratifié** : chaque partie de la plage temporelle est représentée dans chaque image.

La chaleur de chaque ligne dessinée est multipliée par **candidats / soumis**, si bien que la chaleur attendue d’une image est exacte à n’importe quel budget ; seul le bruit dépend du budget. Les lignes vivent par morceaux de 8 388 608 (voir [Résidence de la mémoire GPU](gpu-memory.md)) ; un bloc est coupé quand il traverse un morceau, et chaque morceau reçoit la liste des débuts de blocs qu’il doit dessiner.

Un plan peut contenir au plus 65 536 blocs - 268 435 456 sprites - car les deux backends tiennent un tampon fixe de 65 536 emplacements pour les débuts de blocs. Une demande supérieure est plafonnée à ce niveau, et le manque apparaît franchement sous la forme de davantage d’images pour converger.

### Dessiner chaque ligne à chaque image {#draw-every-row-each-frame}

**Performances → Dessiner chaque ligne à chaque image** (par défaut **activé**) : le budget devient un plancher au lieu d’un plafond, et une image qui commence une nouvelle estimation dessine chaque ligne dont elle est responsable (jusqu’au plafond de 268 M).

La raison : un déplacement de caméra jette l’accumulation, si bien qu’une image en mouvement est une seule estimation dont le bruit dépend de la part des données qu’elle a dessinée - avec un quart dessiné, vous voyez un quart en points pondérés lumineux, et c’est ce qui fait scintiller une vue en mouvement. Tout dessiner fait de chaque image l’image finie. Le coût est que le temps d’image suit désormais la taille des données dans la fenêtre ; les leviers sont une fenêtre temporelle plus étroite, les filtres, ou une élimination par distance, qui réduisent les candidats au lieu de les échantillonner plus finement.

Désactivez-la sur un matériel qui ne peut pas supporter tout le champ d’un coup : *Sprites / image* devient alors une vraie limite, et la vue converge sur quelques images fixes.

Le coût d’un plan complet, mesuré sur une carte graphique de bureau haut de gamme avec une toile 4K et un grand niveau, avec des sprites de 1 m de rayon (un ou deux pixels) : environ 100 M de sprites par image à 30 fps, 200 M à 15 fps, et le maximum de 268 M à environ 12 fps. Avec des sprites aussi petits, l’étape des sommets est tout le coût, et la résolution de la chaleur ne change rien ; avec de grands sprites, c’est le remplissage qui compte : 8 M de sprites de 100 m de rayon ont pris 2.5 s par image à pleine résolution de la chaleur, et 170 ms à 25 %. **Dessiner chaque ligne à chaque image** part donc de 67 M et monte d’un quart par image tant que les images prennent moins de 150 ms, et il est divisé par deux quand elles prennent plus de 400 ms, pour qu’une vue lourde ne fasse pas dépasser à une image ce que permet le chien de garde du GPU.

### Le budget adaptatif {#the-adaptive-budget}

**Performances → Budget adaptatif** (par défaut activé) règle le budget de sprites pour tenir la **FPS cible** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Il est inactif dans le replay de boîtes et pendant les rendus vidéo.

L’entrée est le temps d’image, lissé (90 % de l’ancien + 10 % du nouveau, avec des images isolées plafonnées à 2 s), face à une cible de 1000 / max(15, FPS cible) ms.

**Étape un - sprites.** À chaque image, le budget est multiplié par `1 + (cible / image - 1) × gain`, avec un gain de 0.35 quand c’est trop lent et 0.08 quand il reste de la marge, borné à un facteur de 0.5-1.25 par image et à 65 536-268 435 456 sprites.

**Étape deux - résolution.** Seulement quand le budget est déjà à son plancher et que les images sont encore plus de 10 % trop lentes, la résolution du tampon de chaleur baisse de 8 % par image, jusqu’à 25 % de la toile ; elle remonte de 4 % par image tant qu’il reste 30 % de marge. Le coût du fragment baisse avec le carré de la résolution, ce qui se voit à peine sous une rampe douce. (Mesuré en rendu logiciel avec 10 M de lignes et des sprites surdimensionnés : 141 ms → 17 ms par image.) L’échelle est arrondie aux seizièmes ; *Rés. chaleur* de la superposition l’affiche.

**Abandon.** Une image lente ressemble à la même image, que ce soient les sprites ou un niveau lourd qui en soient la cause - il n’y a pas de mesure du temps par passe. Si le budget reste à son plancher et que les images restent sous 70 % de la cible pendant 30 images, les sprites n’étaient pas le coût : le contrôleur passe en **remontée**, en multipliant le budget par 1.5 toutes les 14 images et en rétablissant la résolution, tant que le temps d’image reste dans 1.5 fois ce qu’il était au plancher. Une remontée qui empire les choses au-delà de cela revient à 60 % et reprend le contrôle normal ; atteindre la cible termine la remontée.

Avec le budget adaptatif désactivé, le budget est simplement **Sprites / image**.

Avec *Dessiner chaque ligne à chaque image* activé, le budget adaptatif tourne quand même, mais la règle exacte élève le budget pour couvrir toutes les lignes candidates ; en pratique, il ne règle donc que l’étape de résolution et les images qui ne commencent pas une nouvelle estimation.
