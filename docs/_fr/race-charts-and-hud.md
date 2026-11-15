---
title: "Graphiques et HUD"
parent: "Analyse de course"
nav_order: 53
lang: "fr"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Graphiques et HUD

Les graphiques alignent vos tours mètre par mètre, pour voir où un pilote a freiné plus tard ou levé le pied plus tôt. Les cartes en haut à gauche de la vue montrent ce que fait chaque voiture et chaque pilote à cet instant.

![Graphiques sous la vue : lignes d'écart, de vitesse, d'accélérateur, de frein et de direction pour deux tours, les bandeaux de temps et de cause en haut, et le curseur avec les cartes](../assets/img/en/race-charts-rows.webp)

## Les graphiques {#the-charts}

Chaque tour sur un même axe de distance — des mètres le long de la référence (voir [un seul axe de distance](race-corner-analysis.md#one-distance-axis)) — donc le même x est le même endroit de la piste pour chaque tour. Un tour est tracé seul (et se rejoue) ; un second tour du même parcours est tracé à côté de lui. Sans tour chargé (ou quand l'analyse a échoué), la zone affiche : « Les graphiques apparaissent une fois un tour chargé ; chargez un autre tour du même parcours pour comparer les deux. »

### Ce qu'ils montrent {#what-is-on-them}

- **La légende** : la couleur et le nom de chaque tour tracé, la référence marquée « (référence) » ; « +N de plus dessinés, non tracés » quand plus de tours sont visibles que tracés ; **Graphiques (N) ▾** ; **Tour entier** pendant le zoom ; une ligne d'aide.
- **Deux bandeaux** en haut, pour le tour mis au point :
  - *temps* : la [carte des temps](race-replay-and-scene.md#time-map-where) sous forme de bandeau, rouge quand on perd du temps, vert quand on en gagne ;
  - *cause* : chacune de ses pertes sous forme de barre au-dessus de l'endroit de sa cause, dans la couleur de la cause ; survolez une barre pour son titre et son coût.
- **Bandes de virage** : une bande ombrée de l'entrée à la sortie de chaque virage (tel que trouvé sur la référence), et son nom (`T1` …) sous l'axe, au point de corde.
- **La constatation choisie** : une bande dans la couleur de sa cause, sur sa plage.
- **Les lignes** (graphiques), une par voie choisie, chacune avec son nom et la valeur haute et basse de sa plage à gauche, une ligne de zéro là où la plage traverse zéro. Chaque tour est une ligne dans sa couleur : le tour mis au point fait 2 px de large et est opaque, la référence est opaque, les autres font 1,5 px à 75 %. La ligne d'écart laisse la référence de côté (elle vaut zéro par rapport à elle-même).
- **Le curseur** : une ligne verticale à l'endroit de la voiture de référence (ou du pointeur), et un point par voiture sur chaque ligne sauf l'écart — au curseur, chaque voiture est au même mètre ; sinon, la distance propre de chaque voiture à l'horloge du replay.

Au maximum **8** tours sont tracés : le tour mis au point, le meilleur de sa classe et la référence d'abord, puis les autres dans l'ordre de chargement.

### Lignes et leurs hauteurs {#rows-and-their-heights}

Les lignes se partagent la hauteur du graphique selon leur poids, aucune n'étant plus petite que 16 px :

| Ligne | Poids |
|---|---|
| Écart (par rapport à la référence, secondes, avec signe) | 1,7 |
| Vitesse (km/h) | 1,7 |
| une pédale (accélérateur, frein, embrayage) | 1 |
| direction | 1,1 |
| rapport | 0,8 |
| un voyant (frein à main, ABS …) | 0,55 |
| tout le reste | 1 |

Une voie dont la plage d'affichage est fixée dans le tableau (pédales 0-100 %) l'utilise ; les autres s'ajustent à la partie visible des tours. Un nom de ligne trop long pour la place (un long mot dans une autre langue) fait descendre la valeur haute d'une ligne quand la ligne est assez haute, et est tronqué avec des points de suspension sinon ; le nom complet apparaît dans l'info-bulle.

### Les graphiques par défaut {#the-default-graphs}

Tant que vous n'en choisissez pas : l'**écart**, puis chaque voie que le tableau marque `graph` et que les tours possèdent — accélérateur, frein, embrayage, frein à main, direction, rapport, vitesse — sauf qu'une voie de pédale ou de voyant est écartée à moins qu'un tour ne la fasse dépasser 0,02 (un embrayage jamais enfoncé n'est pas un graphique). L'ordre est celui du tableau.

### Le choix des graphiques {#the-graph-picker}

**Graphiques (N) ▾** ouvre un panneau au-dessus du bouton :

- une case de filtre (correspond au nom ou à l'identifiant d'une voie) ;
- **Par défaut** (retour à l'ensemble par défaut ; son info-bulle indique combien) et **Fermer** ;
- *Écart par rapport à la référence*, puis chaque voie que portent les tours tracés, regroupées (mouvement, commandes, moteur, aides, pneus, freins, suspension, roues, autres, chronométrage, position), une case à cocher chacune ; une voie par roue tient sur une ligne avec une pastille par roue (AvG, AvD, ArG, ArD — avant gauche, avant droit, arrière gauche, arrière droit).

Cocher garde l'ordre du tableau, quel que soit l'ordre des cases cochées. Le choix tient jusqu'à **Par défaut** ou à un rechargement. Les voies que le tableau ne connaît pas sont proposées sous *autres*, nommées d'après leur propre identifiant (« brakeLinePress » → « Brake line press »).

### Survol, molette, zoom, clic {#hover-wheel-zoom-click}

| Commande | Effet |
|---|---|
| survol | chaque voiture, sa carte et ses commandes se déplacent à ce mètre ; un poteau la marque sur la piste ; un tableau liste la valeur de chaque tour tracé sur chaque ligne à cet endroit (l'écart affiché « réf » pour la référence) ; au-dessus des cartes, « à N m - le curseur des graphiques ». Sortir de la zone de tracé rend la main au replay |
| molette | fait avancer le replay le long du tour de 1/200 de la portée visible par cran (Maj : 5×), en mettant le replay en pause ; zoomé, la vue suit le curseur |
| Ctrl+molette (Cmd+molette) | zoome l'axe de distance autour du pointeur, 1,25× en arrière / 0,8× en avant par cran, jamais moins de 40 m ; dézoomer jusqu'au tour entier termine le zoom |
| molette latérale | déplace la vue pendant le zoom (10 % de la portée par 100 unités de défilement) |
| double-clic, **Tour entier** | dézoome |
| clic | saute le replay à l'endroit où la référence atteint ce mètre |
| Maj+clic | aligne les voitures à cet endroit (voir [aligner](race-replay-and-scene.md#lining-up)) |

Les graphiques se redessinent dans la langue courante quand elle change.

La ligne d'aide de la légende dit la même chose en bref : « Survol : toutes les voitures là · molette : avancer le long du tour · Ctrl+molette : zoom · clic : sauter · Maj+clic : aligner ».

## Les cartes des voitures (HUD) {#the-car-cards-hud}

En haut à gauche de la vue, une carte par tour visible — au maximum **6**, les six premiers tours visibles dans l'ordre de chargement — pour l'instant où le replay (ou le curseur des graphiques) se trouve.

**En-tête :** la couleur et le nom du tour ; l'écart en direct — le temps de ce tour pour atteindre sa distance actuelle moins le temps de la référence pour atteindre la même distance, « +0,48 s » — ou « référence » ; **⋯** pour afficher ou masquer toutes les autres valeurs (la même chose que *Toutes les valeurs sur les cartes*). La carte de la voiture poursuivie est mise en évidence.

**La voiture vue d'en haut :** le contour de la carrosserie dans la couleur du tour avec une flèche à l'avant, quatre pneus (les avant tournés jusqu'à 28° avec la direction), chacun coloré selon sa température, avec les mêmes symboles que la voiture 3D dessinée à plat : anneau de glissement, barre de suspension, lueur des freins, bande d'usure, barre de charge.

**Lectures :** vitesse en km/h, le temps propre du tour, sa distance le long de la référence.

**Commandes :**

- un volant tourné par la commande de direction (plein braquage dessiné à 180°), avec le pourcentage dessous ;
- une barre par pédale, de gauche à droite comme sur un bloc de pédales — embrayage, frein, accélérateur — chacune avec son pourcentage et son nom court, dans sa couleur (seulement les pédales que porte le tour) ;
- le rapport (R pour la marche arrière, N pour le point mort) ;
- un petit voyant par voie marche/arrêt que porte le tour — frein à main, ABS, TC, DRS, limiteur de stand, en l'air — allumé dans sa couleur quand il est en marche (au-dessus de la moitié de sa plage) ;
- une lecture par voie de niveau : répartition de freinage, réglages ABS et TC, suralimentation, carburant.

**La trace des commandes :** les **6 dernières secondes** de chaque pédale (une voie, chacune dans sa couleur) et de la direction (sa propre voie, centrée), qui finit à cet instant — ce que le pilote a fait pour y arriver. Jusqu'à 160 points.

**Toutes les valeurs** (⋯ ou *Toutes les valeurs sur les cartes*) : chaque autre valeur scalaire que porte le tour à cet instant, puis chaque voie par roue en quatre valeurs (AvG AvD ArG ArD), nommées d'après le tableau des voies ou d'après le nom propre de la voie, classées par groupe.

## Pour les développeurs {#for-developers}

Code : [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Le tableau des voies {#the-channel-table}

`CHANNELS` dans [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) est l'unique endroit où une voie est décrite : son unité, si c'est une valeur par échantillon ou une par roue (stockée sous `name.FL` …), son groupe, une plage d'affichage, la façon dont elle est dessinée sur la voiture (`glyph`), la façon dont elle apparaît sur la carte (`input` : `pedal`, `steering`, `gear`, `lamp`, `level`), si c'est un graphique par défaut, si elle avance par paliers plutôt que de se fondre (rapport, drapeaux), et comment elle est affichée (échelle, unité, décimales). Les libellés et les noms courts sont des messages dans chaque langue (`race.channel.<name>.label` / `.short`).

Voies avec un dessin ou un graphique par défaut :

| Voie | Unité | Dessinée en | Graphique par défaut |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pédale (vert, rouge, …), affichée en % | oui |
| `handbrake` | 0..1 | voyant | oui |
| `steer` | -1..1, droite positive | volant | oui |
| `gear` | - | rapport | oui |
| `speed` | m/s, affichée en km/h | - | oui |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | voyant | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | lecture de niveau | - |
| `tireTemp` (par roue) | °C, affichage 40-130 | couleur du pneu | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (par roue) | comme le jeu les échelonne, affichage ±1,5 | anneau de glissement | - |
| `combinedSlip`, `slipIndex` (par roue) | affichage 0-1,5, 0-1 | anneau de glissement | - |
| `suspension` (par roue) | 0..1 | barre de suspension | - |
| `brakeTemp` (par roue) | °C, affichage 100-900 | lueur de frein | - |
| `tireWear` (par roue) | 0..1 | bande d'usure | - |
| `wheelLoad` (par roue) | N, affichage 0-12 000 | barre de charge | - |

Les autres du tableau (tracées et listées, non dessinées) : `latAcc`, `longAcc`, `vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`, `vertVel`, `bodySlip` (angle de dérive), `loose`, `lateral` (écart par rapport à la référence), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`, `tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`, `wheelSpeed`, `wheelSurfaceSpeed`, ainsi que `time`, `distance`, `x`, `y`, `z`.

**Une voie absente du tableau** est tout de même lue, tracée (sous *autres*) et listée sur les cartes, avec son nom propre. **Pour lui donner un vrai nom, une unité et un dessin**, ajoutez une entrée au tableau (et son message de libellé dans chaque `src/i18n/locales/<langue>/race-channels.json`). Un *nouveau type* de dessin de roue est une entrée dans `WHEEL_GLYPHS` (glyph.ts) et son jumeau à plat `CARD_GLYPHS` (RaceHud.tsx) ; les deux sont typés par le genre, donc la compilation échoue tant que les deux n'existent pas. `src/race/extensible.test.ts` vérifie que les voies inconnues atteignent les graphiques, que chaque symbole du tableau peut être dessiné et que les voyants s'allument.
