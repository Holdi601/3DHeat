---
title: "Les deux moteurs de rendu"
parent: "Fonctionnement interne du rendu"
nav_order: 1
lang: "fr"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Les deux moteurs de rendu

Un navigateur peut laisser une page utiliser la carte graphique de deux façons : WebGPU (plus récent) et WebGL2. La visionneuse peut utiliser les deux et choisit toute seule le meilleur. Vous n'avez donc normalement rien à faire. Pour voir lequel est utilisé, regardez **Moteur de rendu** dans l'affichage des statistiques (en haut à droite de la vue).

![L'affichage des statistiques : Moteur de rendu, FPS, Image, Lignes dans la fenêtre, Sprites / image, Budget, Résol. chaleur, Couverture](../assets/img/en/performance-stats-overlay.webp)

La visionneuse a deux moteurs de rendu complets derrière une même interface ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)) : **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) et **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Les deux dessinent la même image avec les mêmes algorithmes ; les shaders existent en WGSL et en GLSL ES 3.00, côte à côte. La première ligne de l'affichage des statistiques, **Moteur de rendu**, indique celui qui tourne. Si vous la survolez, vous voyez pourquoi WebGPU n'a pas été utilisé, s'il ne l'a pas été.

## Pour les développeurs {#for-developers}

### Comment l'un est choisi {#how-one-is-chosen}

Un canevas ne peut contenir qu'un seul type de contexte. Le choix est donc fait une fois, avant tout dessin ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)) :

1. Sauf si WebGL2 est forcé : si `navigator.gpu` existe, demander un adaptateur avec `powerPreference: 'high-performance'` et un périphérique, puis créer le moteur WebGPU. Chaque échec est gardé en mémoire avec sa raison.
2. Si WebGPU était forcé et a échoué, on s'arrête : la vue affiche *Le moteur de rendu n’a pas pu être initialisé.* avec la raison.
3. Sinon, créer le moteur WebGL2 (en demandant lui aussi l'adaptateur haute performance). Si WebGL2 n'est pas disponible, ou ne peut pas dessiner dans des textures flottantes (`EXT_color_buffer_float`), la vue affiche l'erreur.

`powerPreference: 'high-performance'` empêche un portable à carte graphique commutable de donner à la page son GPU intégré. Au-delà, la page n'a pas son mot à dire : l'accélération matérielle est un réglage du navigateur.

### Paramètres dans l'adresse {#url-switches}

Ajoutez-les à l'adresse de la page, par exemple `http://127.0.0.1:5273/?backend=webgl2`.

| Paramètre | Effet |
|---|---|
| `?backend=webgpu` | Utiliser WebGPU, ou échouer. |
| `?backend=webgl2` | Utiliser WebGL2 même là où WebGPU est disponible. Cela sépare « ceci s'affiche mal » de « ceci s'affiche mal sur WebGPU ». |
| `?heat=f16` | Forcer le chemin d'accumulation de chaleur sur 16 bits, sur les deux moteurs ([Accumulation en demi-précision](half-float-accumulation.md)). |
| `?glcheck` | WebGL2 : lire les erreurs GL pendant l'image et les exposer dans `renderer.heatDebug`. Désactivé par défaut, car `getError` est un point de synchronisation du pipeline. |
| `?occdebug=<n>` | Aide pour les développeurs en WebGL2 : remplace la chaleur par des valeurs de débogage d'occlusion. Pas pour un usage normal. |

### Différences importantes {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Stockage des lignes | Buffers de stockage : un indice de ligne est un indice de tableau. Demande la plus grande liaison de buffer de stockage de l'adaptateur et les tailles de buffer. | Textures entières (8 192 texels de large) adressées depuis `gl_VertexID` par une texture d'indices de blocs, mise à jour à chaque image. |
| Accumulation de chaleur en 32 bits | Quand l'adaptateur offre à la fois `float32-blendable` et `float32-filterable` | Quand `EXT_float_blend` est présent |
| Sinon | 16 bits (`r16float`) | 16 bits (`R16F`) |
| Plage de profondeur | [0, 1] ; le moteur applique au préalable une remise à l'échelle des matrices [-1, 1] de three.js. Sans elle, une projection parallèle, dont la profondeur est linéaire, tombe presque entièrement sous 0 et est coupée sans bruit. | [-1, 1], utilisée telle quelle |
| Uniformes | Un anneau d'emplacements alignés sur 256 octets, un par dessin, liés par décalage. `queue.writeBuffer` est ordonné sur la file : un seul buffer réécrit à chaque dessin ferait lire la dernière écriture à tous les dessins. Le bloc uniforme de la passe de chaleur tient exactement dans un emplacement de 256 octets. | Uniformes ordinaires |
| Cible de chaleur sous la résolution du canevas | Reçoit sa propre texture de profondeur (toutes les pièces jointes d'une passe doivent avoir la même taille) | |
| Capture d'image | `captureFrame()` rend le composite une seconde fois dans une cible hors écran et le relit (Chromium sans interface rend WebGPU mais ne compose jamais son canevas) | Relit le tampon d'image par défaut à la prochaine image rendue |
| Relecture | Tampons de transfert gardés et réutilisés ; un seul lecteur en vol à la fois | `readPixels`, en demandant au pilote quelle paire format/type est permise |

Les deux moteurs envoient la table de courbes des sprites en demi-flottants. `queue.writeTexture` de WebGPU copie les octets bruts : les données sont donc d'abord encodées en binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Limites de texture {#texture-limits}

`texStorage2D` au-delà de `MAX_TEXTURE_SIZE` ne lève pas d'erreur : l'allocation est abandonnée, les envois suivants échouent et l'échantillonnage renvoie zéro. L'assistant WebGL2 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) vérifie les deux dimensions par rapport à la limite et lève une erreur avec la taille. La texture d'indices de blocs est bidimensionnelle (4 096 de large), elle ne peut donc pas dépasser une limite. `src/render/limits.test.ts` fixe chaque dimension de texture par rapport aux limites qu'il vaut la peine de prendre en charge. Le moteur WebGL2 refuse aussi un périphérique dont la taille maximale de texture est inférieure à la largeur de 8 192 de la texture de lignes.

### Tester les deux {#testing-both}

`npm run smoke` lance l'application réelle dans Chromium sans interface, en WebGL2 (par défaut `http://127.0.0.1:5273/`). Passez `"http://127.0.0.1:5273/?backend=webgpu"` à `node tools/smoke.mjs` pour WebGPU, et `npm run smoke:f16` pour le chemin demi-précision. `tools/probe-webgpu.mjs` et `tools/probe-present.mjs` (listés parmi les outils pour développeurs dans [Outils en ligne de commande](ref-tools.md)) diagnostiquent la disponibilité de l'adaptateur et de l'affichage dans les navigateurs sans interface.
