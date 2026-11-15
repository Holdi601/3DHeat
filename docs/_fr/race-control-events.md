---
title: "Événements de contrôle des voitures"
parent: "Analyse de course"
nav_order: 54
lang: "fr"
source: "race-control-events.md"
source_hash: "18fe9a0507bc"
translated: true
outdated: false
---

# Événements de contrôle des voitures

Le visualiseur montre comment chaque tour a été conduit et marque les endroits où le pilote a fait glisser la voiture, tourner, toucher quelque chose ou perdre de l'adhérence. C'est utile, parce qu'une erreur qui a coûté du temps est ce qu'on corrige le plus vite.

![La section Contrôle de la voiture : à quelle fréquence chaque tour a bloqué une roue, tourné ou élargi sa trajectoire, et la liste des défauts avec l'un d'eux ouvert](../assets/img/en/race-control-table.webp)

## En clair {#in-plain-words}

- **Blocage** : vous freinez si fort qu'une roue cesse de tourner et glisse. La voiture freine moins bien et ne peut plus tourner.
- **Patinage** : vous appuyez si fort sur l'accélérateur que les roues motrices tournent plus vite que la voiture n'avance. Vous perdez de la traction.
- **Survirage** : l'arrière de la voiture part en glisse large. S'il fait un tour complet, c'est un **tête-à-queue**.
- **Sous-virage** : l'avant de la voiture glisse large (la voiture « pousse »). Tourner davantage le volant n'aide pas.
- **Contact** et **accident** : la voiture a touché quelque chose (un contact est un choc léger ou un frottement, un accident est un choc fort).
- **ABS**, **TC** : les aides de la voiture qui agissent contre le blocage et le patinage. Ce ne sont pas des erreurs.

## La section Contrôle de la voiture (ce que vous voyez) {#the-car-control-section-what-you-see}

Pour le tour sélectionné, selon ce que contiennent les tours : sans glissement des pneus ni angle de glisse, la section montre ce qui peut encore être trouvé plutôt que rien (voir ci-dessous).

**Le tableau** : une ligne par type présent dans l'un des deux tours : Roues bloquées, Patinage, Arrière qui décroche (survirage et tête-à-queue), Avant qui pousse, Accidents, Contacts, ABS actif, Antipatinage actif, Frein à main, En l'air. Chaque case indique « nombre · secondes », pour le tour sélectionné et pour le tour auquel il est comparé. S'il existe un angle de glisse, une ligne *Angle de glisse maximal* indique le plus grand (au sol).

**La liste** : ses défauts non partagés qui coûtent au moins 0,02 s, du plus coûteux au moins coûteux, 12 au maximum, chacun avec son titre et son coût (et la pastille de son type). Cliquez sur l'un pour lire son conseil, aligner les voitures 40 m avant et le rejouer. **Aussi ce que les deux tours ont fait à cet endroit** ajoute chaque défaut, y compris les défauts partagés (pastille « les deux l'ont fait », coût « — » sous 0,01 s). S'il n'y en a aucun : « Rien de ce que X a fait avec les pneus ne lui a coûté du temps que Y n'a pas fait aussi. »

**La phrase sous le tableau** indique ce que la détection pouvait voir : « D'après le glissement et l'angle de dérive de chaque roue, et l'angle de glisse de la voiture. » (ou : glissement et angle de dérive ; glissement et angle de glisse ; glissement seul ; ou « D'après l'angle de glisse de la voiture seulement – ces tours ne contiennent pas le glissement des pneus. »). Elle indique aussi le sol pour lequel les seuils ont été mesurés (asphalte, meuble, mixte : au-delà de 80 % d'échantillons sur sol meuble, le sol est meuble ; en dessous de 20 %, asphalte), le tour auquel les événements ont été comparés, et comment le coût est compté.

Avec **aucun glissement de pneu et aucun angle de glisse** (un fichier de tour FH Companion sans sa télémétrie), le tableau et la liste sont tout de même affichés, et la phrase indique ce qui peut quand même être trouvé à partir de ce que contiennent les tours : « Ces tours ne contiennent ni glissement des pneus ni angle de glisse : blocages et patinage ne peuvent pas être détectés. Restent détectés : les sous-virages, d'après le braquage par rapport à la trajectoire ; les contacts et accidents, d'après la vitesse et l'accélération. » Les glissades d'après la vitesse de lacet sont aussi citées lorsque les tours en ont une ; les sous-virages ne sont cités que s'il y a du braquage. La phrase sur les seuils de glissement et d'angle de glisse est omise, et une seconde indication dit : « Pour Forza Horizon, prenez aussi le fichier `.tele.gz` à côté de chaque tour FH Companion : c'est la télémétrie complète, le glissement de chaque roue 64 fois par seconde. »

Le coût de contrôle **total** du tour (utilisé dans les résumés) compte une seule fois les défauts qui se chevauchent, un blocage et la glissade qu'il provoque, à 40 m près, au plus coûteux du groupe.

## Comment c'est détecté {#how-it-is-detected}

La suite de cette page est le règlement : chaque type, chaque seuil.

Code : [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Le raisonnement et la littérature sont dans [la méthode](race-analytics.md).

## Les types {#the-kinds}

| Type | Ligne du tableau | Un défaut ? | Plus courte durée retenue |
|---|---|---|---|
| `lock` | Roues bloquées | oui | 0,1 s |
| `wheelspin` | Patinage | oui | 0,15 s |
| `oversteer` | Arrière qui décroche | oui | 0,2 s |
| `spin` | (compté avec Arrière qui décroche) | oui | 0,1 s |
| `understeer` | Avant qui pousse | oui | 0,25 s |
| `crash` | Accidents | oui | - |
| `hit` | Contacts | oui | - |
| `abs` | ABS actif | non | 0,2 s |
| `tc` | Antipatinage actif | non | 0,2 s |
| `handbrake` | Frein à main | non | 0,1 s |
| `airborne` | En l'air | non | 0,15 s |

Les durées plus courtes sont du bruit (un trottoir, une bosse, un seul échantillon). Les suites de points de grille (tous les 2 m) qui passent un test sont réunies quand elles sont séparées par des trous allant jusqu'à 2 points. Seuls les **défauts** peuvent être des erreurs et avoir un coût ; les autres sont ce que la voiture et le pilote ont fait.

## Ce que chaque test demande {#what-every-test-needs}

### Canaux dérivés {#derived-channels}

Avant tout jugement, chaque tour reçoit ce que son jeu n'envoie pas, sous des noms canoniques (la valeur propre au jeu l'emporte toujours) :

| Canal | D'après |
|---|---|
| `bodySlip` (angle de glisse) | la vitesse dans le repère de la voiture, `atan2(latVel, abs(longVel))`, lorsque le jeu l'envoie (0 sous 3 m/s) ; sinon le cap (le lacet du jeu, ajusté au sens du déplacement par le signe et le décalage sur les échantillons plus rapides que 10 m/s, retenu seulement si la variance circulaire est inférieure à 0,05) par rapport au sens de déplacement (positions espacées d'au moins 2 m), à des vitesses supérieures à 3 m/s |
| `yawRate` (vitesse de lacet) | la variation de `yaw` dans le temps, lorsqu'il y a un cap mais pas de vitesse de lacet |
| `airborne` | toutes les roues sans contact avec le sol (≤ 0,5) ; sinon toutes les charges de roue sous 5 % de leur médiane ; sinon chaque débattement de suspension à 0,02 ou moins (entièrement détendue). Un seul échantillon isolé n'est pas un vol |
| `slipRatio.<W>` | `(vitesse de surface de la roue - vitesse de la voiture) / vitesse de la voiture` au-dessus de 3 m/s, lorsque le jeu envoie les vitesses de surface des roues ; ou à partir de la rotation de roue × un rayon de roulement mesuré sur le tour : la médiane de `vitesse / rotation` en roue libre en ligne droite (vitesse > 10 m/s, accélérateur < 0,3, frein < 0,05, abs(accélération longitudinale) < 3 m/s², pas en l'air ; tous les échantillons au-dessus de 10 m/s s'il y en a moins de 20), accepté entre 0,1 et 1 m. Marqué `physical` |
| `loose` | le grondement de surface de Forza sur au moins 2 roues (> 0,001) pendant au moins 0,33 s (un trottoir est plus court), les trous de moins de 1 s étant comblés |

### Au sol et stabilisé {#on-the-ground-and-settled}

Rien n'est jugé en l'air ni pendant **0,3 s après un atterrissage** : la suspension touche la butée et les accélérations grimpent, ce qui n'est ni de l'adhérence, ni du freinage, ni de la motricité. Un échantillon doit aussi être **en mouvement** : plus rapide que 5 m/s.

### Le sol {#the-ground}

Le sol de chaque échantillon est **meuble** lorsque le canal `loose` du tour l'indique (grondement de surface de Forza, matériaux de roue de Trackmania). Sinon, c'est le revêtement du tour (voir [discipline et surface](race-loading-laps.md#discipline-and-surface)) : asphalte, ou meuble pour tout le reste. Les courbes, les habitudes de glisse et les seuils sont séparés pour l'asphalte et pour le sol meuble.

### Glissement, en multiple du pic nominal du pneu {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Les jeux mettent le glissement à l'échelle différemment. `meta.slip` indique comment, et chaque glissement est divisé par une échelle pour qu'environ 1 corresponde au pic nominal du pneu :

| `meta.slip` | Signification | Divisé par |
|---|---|---|
| `peak` | normalisé par le jeu : au-delà de 1, l'adhérence est perdue (Forza Data Out) | 1 |
| `scaled` | glissement physique divisé par un pic sur asphalte (l'enregistreur Kunos) | le pic nominal du sol divisé par celui de l'asphalte |
| `index` | une mesure de glissement de 0 à 1 (SlipCoef de Trackmania) | 0,5 |
| `physical` (ou inconnu) | taux de glissement en fraction, angle de dérive en radians | le pic nominal du sol |

Pics nominaux, lorsqu'on ne sait rien de mieux :

| Surface | Taux de glissement | Angle de dérive |
|---|---|---|
| asphalte | 0,12 | 8° |
| mixte | 0,18 | 12° |
| meuble (gravier) | 0,25 | 15° |
| neige | 0,25 | 15° |
| glace | 0,10 | 6° |

### Où l'adhérence s'arrête : la courbe de pneu de chaque voiture {#where-grip-ends-each-cars-tyre-curves}

Le point où un pneu cesse de donner davantage est **mesuré pour chaque voiture**, à partir de chacun de ses tours chargés (`measureTyres`), séparément pour l'asphalte et le sol meuble :

| Courbe | Échantillons (vitesse > 10 m/s, stabilisés, accélérations sous 45 m/s²) | Glissement (x) | Force (y) |
|---|---|---|---|
| freinage | frein > 0,3, frein à main ≤ 0,2, en ligne droite (accélération transversale sous 30 % de la plus forte) | valeur absolue de la moyenne des taux de glissement des quatre roues | décélération |
| traction | accélérateur > 0,8, frein ≤ 0,05, en ligne droite, la motricité pleins gaz de la voiture à cette vitesse > 0,5 m/s² | le taux de glissement de la roue motrice la plus glissante | accélération, en part de cette motricité |
| avant | accélération transversale au-dessus de 30 % de la plus forte, adhérence de la voiture à cette vitesse > 1 m/s² | le plus grand angle de dérive avant | accélération transversale, en part de cette adhérence |
| arrière | idem | le plus grand angle de dérive arrière | idem |

« La plus forte » est le 99e centile de la valeur absolue de l'accélération transversale du tour sur ce sol (tout le sol lorsqu'il a moins de 50 échantillons). La transmission décide des roues motrices : traction avant, les roues avant ; propulsion, les roues arrière ; intégrale, toutes ; inconnue, toutes.

À partir d'au moins **150 échantillons**, le glissement est découpé en 6 à 14 intervalles d'effectif égal (un par tranche de 40 échantillons). La force de chaque intervalle est son quartile supérieur (ce que le pneu donnait lorsque le pilote le demandait), lissé sur les intervalles voisins. Le **meilleur** est l'intervalle où la force est la plus grande. La **limite** est le premier intervalle, au-delà du meilleur, où la force a chuté de **8 %**. Une courbe qui ne chute jamais dans les données n'a pas de limite (infinie) : dépasser le « pic » ne coûte rien dans ce jeu, et le seul glissement ne signale rien là (les courbes de virage et de traction de Forza Horizon sont ainsi). S'il y a trop peu d'échantillons sur un sol, on prend ceux de l'autre sol ; s'il y en a trop peu au total, on prend la limite **nominale** : 1,5 fois le pic nominal.

Chaque voiture reçoit aussi :

- son **habitude de glisse** : le quartile supérieur de son angle de glisse partout où elle prend un virage à 60 % de sa plus forte accélération ou plus (100 échantillons nécessaires) ;
- son **braquage par courbure** (`steerGain`), par tranche de vitesse de 5 m/s : la médiane de abs(braquage) / courbure de trajectoire lorsqu'elle prend un virage fermement mais bien en deçà de son adhérence (30 à 60 % de sa plus forte, courbure plus serrée qu'un rayon de 400 m, braquage au-dessus de 0,02 ; 25 échantillons par tranche). La courbure de la trajectoire est la vitesse de lacet divisée par la vitesse lorsque le jeu envoie une vitesse de lacet ; sinon, elle vient des positions à ±5 m.

## Détection, type par type {#detection-kind-by-kind}

| Type | Test (sur les échantillons en mouvement et stabilisés) | `peak` et `limit` |
|---|---|---|
| **blocage** (lock) | frein > 0,05, frein à main pas au-dessus de 0,2, et le taux de glissement d'une roue sous moins la limite de freinage | le glissement le plus négatif (multiples du pic nominal) ; la limite en négatif |
| **patinage** (wheelspin) | accélérateur > 0,2 (ou pas de voie d'accélérateur), et le taux de glissement d'une roue motrice au-dessus de la limite de traction | le plus grand glissement moteur ; la limite |
| **survirage** (angle de glisse) | l'angle de glisse au-dessus du plus grand entre le plancher du revêtement et 1,5 × l'habitude de glisse de la voiture à cet endroit | le plus grand angle de glisse, en radians |
| **survirage** (angles de dérive, sans angle de glisse) | l'angle de dérive arrière au-dessus de la limite arrière et de plus de 0,25 au-dessus du plus grand angle avant | l'angle de dérive arrière (multiples du pic) |
| **survirage** (sans angle de glisse, mais vitesse de lacet et accélération transversale) | la « vitesse d'attitude », abs(vitesse de lacet) moins abs(accélération transversale) / vitesse, au-dessus de 8 m/s, au-delà de 0,2 rad/s, avec le braquage contre le virage | rad/s ; limite 0,2 |
| **tête-à-queue** (spin) | un épisode de survirage dont l'angle de glisse a culminé au-delà de **60°** | comme survirage |
| **sous-virage** (angles de dérive) | pas en glisse, le plus grand angle de dérive avant au-dessus de la limite avant et de plus de 0,3 au-dessus de l'arrière | l'angle de dérive avant ; la limite |
| **sous-virage** (sans angles de dérive) | plus vite que 12 m/s, pas en glisse, pas en contre-braquage, accélération transversale au-dessus de la moitié de la plus forte du tour (99e centile), trajectoire plus serrée qu'un rayon de 300 m, et braquage plus de **1,6 fois** ce que le braquage par courbure propre à la voiture dit qu'il fallait | fois le braquage nécessaire ; limite 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` au-dessus de 0,5 | - |
| **frein à main** (handbrake) | `handbrake` au-dessus de 0,2 | - |
| **en l'air** (airborne) | `airborne` au-dessus de 0,5 | - |
| **contact**, **accident** | voir [Contacts et accidents](#hits-and-crashes) | vitesse perdue lors du choc |

Seuils plancher d'angle de glisse par revêtement : asphalte **7°**, mixte **10°**, meuble et neige **15°**, glace **10°**. Ils suivent la littérature : l'angle de dérive d'un pneu culmine à 3-10° sur asphalte et la limite de stabilité en angle de dérive de caisse d'une voiture de route est d'environ 12° sur asphalte sec, tandis que le rallye et le drift se pratiquent à 30-50° ([Analyse de course, sources](race-analytics.md#sources)). Une voiture qui glisse davantage naturellement (un modèle de pneu d'arcade, un spécialiste du gravier) a son propre seuil, plus haut, tiré de ses propres tours (1,5 × son habitude).

**Dans quel sens tourne la voiture** (pour « contre le virage ») : le changement de cap de la trajectoire du tour sur ±6 m (au moins 2 points de grille). Plus serré qu'un rayon de 600 m, c'est un virage ; à droite ou à gauche selon que le monde est miroité. Le braquage est **contre** le virage lorsque abs(braquage) > 0,05 et que son signe est opposé à celui du virage : une glissade qu'on **rattrape** avec un braquage contraire.

**Les pédales au départ** (`pedal`) : *freinage* lorsque le frein est au-dessus de 0,1 ; *accélérateur* au-dessus de 0,3 ; *relâché* lorsque l'accélérateur était au-dessus de 0,5 dans les 8 points de grille (16 m) précédents ; *roue libre* sinon (ou sans voie d'accélérateur).

## Mis en regard de l'autre tour {#laid-against-the-other-lap}

Chaque événement est jugé par rapport au tour auquel le tour sélectionné est comparé dans ce segment (le meilleur de sa catégorie ; pour ce tour lui-même, le plus rapide de sa catégorie dans le segment) :

1. **Le chemin parcouru par l'autre tour** sur les mêmes mètres, ±8 m : les propres événements de l'autre tour de la même famille (une tête-à-queue compte comme survirage, un accident comme contact), mesurés dans les mêmes unités, sans seuil, avec les courbes de pneu de l'autre voiture.
2. **Partagé** lorsque l'autre tour est allé aussi loin, à **80 %** ou plus : c'est la façon de prendre le virage, pas une erreur. Les types qui ne sont pas des défauts sont toujours « partagés ».
3. **Coût**, pour un défaut non partagé : le temps que ce tour perd face à l'autre, de 5 m avant l'événement jusqu'à **40 m après** (pour un contact ou un accident, jusqu'à ce que la voiture ait retrouvé sa vitesse : les mètres nécessaires pour la regagner à sa propre motricité, de 40 à 400 m ; sans motricité mesurée, 5 m/s²). Jamais négatif.
4. **Vitesse cédée** jusqu'à la limite de la voiture : pour un blocage, la décélération que la voiture montre pouvoir faire à cette vitesse moins celle qu'elle a faite, additionnée sur l'événement ; pour le patinage, sa motricité pleins gaz moins ce qu'elle a fait ; pour un choc, la vitesse qu'il a prise. Indiquée lorsqu'elle dépasse 0,5 m/s (1,8 km/h).

Un défaut non partagé qui coûte au moins **0,02 s** est listé. Les [statistiques de course](race-course-statistics.md) ne comptent que les défauts de **0,03 s** ou plus, pour qu'une erreur comptée sur de nombreux tours soit une erreur nette. Il peut aussi devenir la cause de la perte d'un virage (voir [Analyse virage par virage](race-corner-analysis.md#car-control-faults-and-impacts)).

## Contacts et accidents {#hits-and-crashes}

`impacts.ts` lit les contacts dans les **propres échantillons du tour**, avant rééchantillonnage, car un contact est terminé en centièmes de seconde. Les pneus ne peuvent pas produire les forces d'un choc, donc un contact est mesuré par rapport à la voiture du tour elle-même :

- **Son adhérence `G`** : le 99e centile de son accélération horizontale `√(lat² + long²)` sur le tour, au sol et plus vite que 5 m/s. Sans voies d'accélération (ou sous 3 m/s²), 15 m/s², l'adhérence d'une voiture routière.
- **Seuil** : `max(1,8 G, G + 18, 30)` m/s².
- **Échantillon heurté** : l'accélération horizontale au-dessus du seuil *et* qui saute de plus de la moitié de `G` par rapport à l'échantillon précédent ; **ou** la vitesse qui chute, en 0,1 s, de plus que ce que le seuil donnerait en 0,1 s plus 1,5 m/s. Seulement au sol et stabilisé, et seulement lorsque la voiture allait plus vite que 5 m/s.
- Les échantillons heurtés dans un intervalle de **0,4 s** forment un seul choc.
- **Avant / après** : la vitesse la plus haute dans les 0,15 s précédents ; la plus basse jusqu'à 0,3 s après le dernier échantillon heurté.
- **Pas un choc** : une vitesse perdue sans force derrière (la pointe d'accélération horizontale dans les 0,1 s sous le plus grand de `G` et 25 m/s²) est le jeu qui rembobine ou réinitialise la voiture.
- **Accident** lorsqu'il a pris **30 km/h** ou plus, ou lorsqu'il a fait perdre à la voiture plus de la moitié de sa vitesse ; **contact** sinon : un coup léger, un frottement contre un mur.
- **Direction** : l'accélération longitudinale plus grande que la transversale, et négative : *de face* ; positive : *par l'arrière* ; la transversale plus grande : *le long de son flanc*. Sans accélérations, de face.

Ce qu'une voiture peut faire est mesuré en retirant tous les chocs, de 0,1 s avant à 1 s après (`struckMask`).

## Les textes {#the-texts}

Chaque événement est décrit en nommant les deux tours, avec le lieu (en mètres le long de la référence), la vitesse de départ, de combien il dépasse la limite par rapport à l'autre tour, et un conseil. Le conseil découle du type et de ce qui a été mesuré :

| Événement | Conseil |
|---|---|
| blocage, avant seulement | un avant bloqué ne peut plus diriger : moins de pression en haut de la zone, relâchez-la dans le virage |
| blocage, arrière seulement | un arrière bloqué laisse la voiture tourner : freinez davantage en ligne droite, relâchez en tournant ; décalez la répartition vers l'avant si cela se reproduit |
| blocage, sol meuble | une roue bloquée creuse : serrez juste avant le blocage |
| blocage, autre | trop de pédale pour l'adhérence : dosez plus progressivement |
| patinage | rendez l'accélérateur au fur et à mesure que le volant se redresse, passez tôt les rapports là où la traction est limitée (sur sol meuble, un rapport plus haut adoucit le couple) |
| tête-à-queue / survirage | selon la pédale : sous freinage (trop de freinage en virage, une rétrogradation trop tôt), relâché (survirage au lâcher : maintenez un accélérateur stable), sur l'accélérateur (trop alors qu'on est encore braqué), aucun (entré trop vite dans le virage) ; « rattrapé avec un contre-braquage » lorsqu'on a contre-braqué ; sur sol meuble ou en rallye, « un certain angle est la façon rapide de tourner : l'autre tour en a eu assez » |
| sous-virage | plus de braquage ne sert à rien une fois que l'avant a décroché : arrivez plus lentement, gardez un peu de frein pour charger l'avant, déroulez ; sur sol meuble, faites tourner la voiture avec un lâcher ou un petit coup de pied gauche |
| contact / accident | sur le flanc : un mètre de marge coûte moins que le frottement ; par l'arrière : une autre voiture, ou un recul en glisse ; accident de face : freinez plus tôt ; un coup à l'avant : vous avez accroché quelque chose. « X a aussi touché là. » lorsque c'est partagé |

Dans Trackmania, une glissade dit aussi : en dessous d'environ **400 km/h** (**300** sur sol meuble : terre, herbe, plastique), une glissade donne moins de propulsion que l'adhérence ; au-dessus, une speedslide à le bon angle fait gagner du temps. Celle-ci en a coûté, donc son angle était mauvais.

## Ce que chaque source permet {#what-each-source-allows}

| Les tours contiennent | Blocages / patinage | Survirage / tête-à-queue | Sous-virage |
|---|---|---|---|
| glissement par roue et angle de dérive, vitesse de la voiture (Forza Data Out, les jeux AC) | à partir du glissement | à partir de l'angle de glisse, ou de l'angle de dérive arrière | à partir des angles de dérive |
| vitesses de roue, vitesse dans le monde (jeux de rallye, BeamNG) | à partir du glissement dérivé | à partir de l'angle de glisse dérivé | à partir de la courbure du braquage |
| lacet et vitesse de lacet, pas de glissement (iRacing) | - | à partir de l'angle de glisse (le lacet ajusté par rapport au sens de déplacement) ; à partir de la vitesse d'attitude, avec contre-braquage seulement, lorsque le lacet ne peut pas être fiable | à partir de la courbure du braquage |
| cap seulement | - | à partir du cap par rapport au sens de déplacement | à partir de la courbure du braquage |
| fichier de tour FH Companion seul (ni lacet, ni glissement) | - | - | à partir de la courbure du braquage (il a le braquage et les accélérations) |

Les contacts et accidents n'ont besoin que de la vitesse (mieux avec les accélérations), donc toutes les sources les ont. La section **Contrôle de la voiture** montre ce que permet chaque source : avec un fichier de tour FH Companion seul, ses poussées d'après le braquage et ses contacts, et l'indication de charger le `.tele.gz` pour le reste.
