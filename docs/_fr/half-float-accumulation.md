---
title: "Accumulation en demi-précision"
parent: "Fonctionnement interne du rendu"
nav_order: 4
lang: "fr"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Accumulation en demi-précision

Certaines cartes graphiques ne peuvent garder la chaleur que dans de petits nombres de 16 bits, ce qui pourrait couper ou arrondir les endroits les plus chauds. La visionneuse met les nombres à l'échelle pour que cela ne se voie pas. Vous n'avez rien à faire ; cette page est pour les développeurs.

## Pour les développeurs {#for-developers}

Un périphérique qui ne peut pas fusionner dans des textures flottantes 32 bits (pas de `float32-blendable` et `float32-filterable` sur WebGPU, pas d'`EXT_float_blend` sur WebGL2) reçoit une cible de chaleur en **flottant 16 bits** (`r16float`) : un maximum de 65 504 et 11 bits de mantisse. Un champ dense atteint plusieurs centaines de milliers. Une cible 16 bits **coupe** donc et **arrondit**, et l'erreur d'arrondi grandit avec la valeur. Cela se manifeste de façon très particulière : les zones les plus denses paraissent bien plus froides qu'elles ne le sont, alors que les zones clairsemées semblent correctes. Deux mécanismes s'en chargent. L'image n'est juste que si les deux fonctionnent.

### Plage : un gain sur chaque projection {#range-a-gain-on-every-splat}

Chaque projection est multipliée par un **gain**, et le composite le divise à nouveau. Le champ se place ainsi dans l'ordre de grandeur que les demi-flottants gèrent bien ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)) :

```
estimate = analytic saturation estimate for this dataset, radius and centre intensity
gain     = 2 ^ round(log2(2048 / estimate)),  exponent clamped to -20..20
```

2048 laisse environ 32 fois de marge au-dessus du sommet de la rampe avant 65 504. Le gain est une **puissance de deux** : une petite dérive de l'estimation le laisse donc inchangé, ainsi que le tampon accumulé. Il fait partie de la [signature de géométrie](accumulation.md#what-restarts-it), si bien qu'un changement redémarre l'accumulation.

Il est ancré sur l'estimation analytique, et volontairement **pas** sur le point de saturation. La saturation est appliquée au composite précisément pour que faire glisser son curseur ne redémarre jamais la convergence. Si le gain suivait ce curseur, le tampon contiendrait encore des valeurs écrites avec l'ancien gain, alors que le composite diviserait par le nouveau. Les deux erreurs s'annuleraient exactement, et le curseur paraîtrait ne rien faire.

Sur une cible 32 bits, le gain vaut toujours 1.

### Précision : des demi-images depuis zéro {#precision-partial-frames-from-zero}

Une image fusionnée dans l'accumulateur avec le poids 1/n est d'abord projetée dans une **cible de travail** depuis zéro, puis fusionnée. Elle n'est pas projetée directement dans l'accumulateur avec un poids de 1/n ([Accumulation](accumulation.md#why-each)). Directement, la contribution de chaque sprite serait 1/n de la taille du total courant auquel elle s'ajoute, et un demi-flottant arrondit ces valeurs à zéro, d'autant plus que le pixel est dense. Depuis zéro, chaque terme est comparable au total qu'il rejoint. C'est l'arithmétique qu'une image unique utilise déjà.

### Effet mesuré {#measured-effect}

Sur une scène synthétique dense, lecture du champ en unités comparables :

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32 bits (référence) | 6 051 | 60 742 | 121 199 | 232 744 |
| 16 bits avant | 1 372 | 6 972 | 7 840 | 7 840 |
| 16 bits après | 5 996 | 59 666 | 118 824 | 210 357 |

Le pic est passé de 30 fois trop bas à 0,90 ×, et l'image composée correspond à celle en 32 bits à 0,1 % de la luminance moyenne près.

### Le tester {#testing-it}

`?heat=f16` force ce chemin sur les deux moteurs. Sans cette bascule, l'arithmétique que seules les cartes plus faibles exécutent ne serait testée que par les personnes qui les utilisent. `npm run smoke:f16` lance toute la suite de tests dans le navigateur avec ce mode.

Les relectures annulent le gain : l'exposition automatique divise le champ lu par lui, et `engine.readHeatProbe()` le transmet au moteur de rendu. C'est aussi ainsi que la [lecture de chaleur en direct de la règle](measure.md#notes) est faite.
