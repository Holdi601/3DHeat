---
title: "Analyse virage par virage"
parent: "Analyse de course"
nav_order: 55
lang: "fr"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analyse virage par virage

Deux tours du même circuit sont comparés virage par virage. Pour chaque virage, la visionneuse indique qui a été le plus rapide, combien de temps il a valu et pourquoi - freiné trop tôt, remis les gaz tard, pris une trajectoire plus large - pour que vous sachiez quoi travailler en premier.

![Un constat ouvert dans Où progresser, à côté du tableau Virage par virage](../assets/img/en/race-corner-finding.webp)

Un exemple détaillé : dans le virage 3, Driver A freine 20 m plus tôt que Driver B et perd 0,15 s pour y arriver, mais remet les gaz plus tôt et gagne 0,15 s à la sortie. Au total 0,00 s : le virage est égal, et personne ne se fait dire de freiner plus tard.

## Ce que vous voyez {#what-you-see}

### Où progresser {#where-to-improve}

La section de la barre latérale pour le tour examiné (« Chargez au moins deux tours d'un même circuit. » tant que ce n'est pas le cas).

**En-tête :** « <tour> <temps> contre <référence> <temps> » et l'écart de temps au tour - ou, pour la référence, « contre le tour le plus rapide, quel qu'il soit, à travers chaque virage (…) » et le total perdu. À côté, la perte répartie entre *conduite* et *voiture / contexte*.

**La barre de répartition :** le temps perdu par groupe de cause (freinage, entrée, sortie, ligne droite, voiture, contexte), dans les couleurs des causes, avec une légende.

**Les constats**, en trois listes :

1. Les pertes du pilote, la plus coûteuse en premier, 12 au plus - ou « Nulle part où une autre conduite ferait gagner du temps ne ressort. »
2. **Voir ce que la voiture ou la situation a coûté (X s)** - pertes de la voiture et du contexte, 8 au plus (activé par défaut).
3. **Là où <tour> est plus rapide, ou égal d'une autre façon (N)** - gains et virages égaux, 10 au plus (activé par défaut).

Chaque constat affiche son rang, son titre (le virage et ce qui s'est passé, avec le coût pour une perte), la phrase de verdict, le coût (les gains avec un moins) avec une barre, et une pastille : *freinage*, *entrée*, *sortie*, *ligne droite* (pertes du pilote, avec « · voiture X » quand la voiture explique 0,02 s ou plus), *voiture*, *contexte*, *plus rapide*, *égal*. **Cliquez sur l'un** pour aligner les voitures 40 m avant lui, le cadrer et le rejouer, et ouvrir ses mesures :

- **Freinage :** où chacun a freiné (ou levé le pied) et à quelle vitesse, et de combien de mètres plus tôt ou plus tard (à partir de 5 m) ;
- **Le plus lent :** la vitesse minimale de chaque tour et où elle se trouve ;
- **Pleins gaz :** où chacun était à fond, et de combien plus tôt ou plus tard ;
- **Trajectoire :** différence au point d'entrée, rayons les plus serrés, de combien à l'intérieur ou à l'extérieur, et la forme de la trajectoire de chaque tour et son sommet ;
- **Ligne droite jusqu'au virage suivant :** sa longueur, les deux vitesses là où les deux étaient à fond, ce qu'elle a perdu ou gagné et de quoi - la vitesse de départ, la traction plus forte de l'autre, un lever de pied, la vitesse freinée, la façon de conduire (parties à partir de 0,02 s) ;
- **La voiture :** la part de la perte qui vient de la voiture, et de quoi (traction, adhérence, freins ; quand c'est 0,02 s ou plus) ;

puis le conseil, **Les voitures :** (dans des voitures différentes, voir [Profils de voitures](race-car-profiles.md#what-the-cars-decide-in-a-corner)), et le conseil de trajectoire.

### Virage par virage {#corner-by-corner}

Un tableau (avec deux tours ou plus), une ligne par segment, de la classe du tour examiné quand il y a plusieurs classes :

| Colonne | Affiche |
|---|---|
| Virage | `T3`, `T11-T12` |
| Le plus rapide | le tour le plus rapide à travers lui (son propre temps du début à la fin du segment) |
| de | son avance sur le deuxième, en s |
| trajectoire | la forme et le sommet de la trajectoire du tour le plus rapide (« V · tardif », « U/V · milieu ») ; survolez pour ses rayons les plus serrés, à l'entrée et à la sortie ; « dans les deux sens » pour un enchaînement mixte |
| (le tour examiné) | de combien il était en retard sur le plus rapide, ou ✓ s'il était le plus rapide |

Cliquer sur une ligne ouvre là le constat du tour examiné (ou aligne les voitures 40 m avant le segment). Sous le tableau, quand chaque virage a un temps : « Le plus rapide à travers chaque virage, mis bout à bout : <temps> (± par rapport à la référence / par rapport au meilleur de la classe X) » - les meilleurs segments plus le passage le plus rapide jusqu'au premier virage quand c'est un tronçon à part.

## Comment on le calcule {#how-it-is-worked-out}

La règle qui gouverne tout : **un virage est jugé en entier**, du point de freinage qui le précède au point de freinage du suivant. Un tour qui freine plus tôt pour tourner la voiture et remettre les gaz plus tôt se voit porter au crédit la sortie qu'il a achetée, et non le conseil de freiner plus tard.

## Un seul axe de distance {#one-distance-axis}

Les tours se comparent par la distance, non par le temps : une seconde plus tard, deux tours ne sont pas au même virage. Ni par le compteur kilométrique propre à chaque tour (une trajectoire plus serrée couvre moins de mètres). La trajectoire parcourue du tour de **référence** sert d'axe :

- Chaque échantillon des autres tours est **projeté** sur le chemin de référence : chaque échantillon reçoit `s`, sa distance le long de la référence, et `d`, sa distance à gauche (positive) ou à droite. La recherche avance à partir du point précédent (de 8 segments de chemin en arrière à 40 en avant), si bien qu'un tour qui se croise lui-même ne saute jamais à l'autre croisement. Le premier échantillon est cherché dans le premier quart du chemin (sur un circuit, départ et arrivée coïncident) ; quand rien n'est à moins de 30 m, le point le plus proche n'importe où, sans être derrière le dernier point trouvé, est pris (après un tête-à-queue ou une sortie de piste). `s` ne diminue jamais : un échantillon qui se projette derrière le précédent est retenu.
- Chaque canal est **rééchantillonné** sur une grille commune, **tous les 2 m**, linéairement ; les canaux en paliers (rapport, drapeaux) prennent l'échantillon le plus proche. Hors de la plage propre à un tour, les valeurs sont vides.
- Les premiers et derniers échantillons d'un tour se projettent un peu à l'intérieur des extrémités de la référence ; chaque tour est donc **prolongé jusqu'à 15 m** au-delà de ses extrémités à la vitesse qu'il avait (le temps augmente de la distance divisée par la vitesse, le reste est conservé) - ainsi son écart sur la ligne est sa différence de temps au tour.
- `delta` = le temps du tour à chaque point de la grille moins celui de la référence : l'écart. `lateral` = `d` sur la grille.

Le temps qu'un tour a pris de plus qu'un autre entre deux points de la grille est la différence de leurs deltas : `rel(s)`. Tout ce qui suit repose dessus.

## Virages {#corners}

Trouvés sur la **référence** (`findCorners`), avec sa vitesse lissée sur ±6 m et sa courbure (variation de cap sur ±5 échantillons, lissée sur ±10 m) :

1. **Creux de vitesse avec importance.** Un point qui est le plus bas à ±40 m, dont la chute depuis la vitesse la plus haute de chaque côté (avant un creux plus bas) vaut au moins `max(2,5 m/s, 6 % de la vitesse)`.
2. **Coudes.** Un sommet local de courbure plus serré qu'un rayon de **300 m**, sans creux de vitesse dans les 80 m : un coude pris à fond reste un virage à conduire.
3. **Phases.** Depuis chaque sommet en remontant tant que la référence freine (> 0,1) ou n'est pas à fond (< 0,95) : l'entrée ; en avançant tant qu'elle n'est pas à fond : la sortie. Un coude pris à fond reçoit ±30 m. Les virages qui se chevauchent sont gardés séparés mais disposés pour couvrir le tour sans trou.
4. Numérotés T1, T2 … dans l'ordre du tour ; **à gauche ou à droite** selon le signe de la courbure et selon que le monde est en miroir (inconnu compte comme en miroir).

**La fenêtre du virage** (où la référence tourne) : depuis le point le plus serré à ±40 m du sommet, vers l'extérieur tant que la courbure reste au-dessus d'un sixième de son maximum, plus 10 m de chaque côté. Son côté donne le signe de « intérieur ».

## Segments : de zone de freinage à zone de freinage {#segments-braking-zone-to-braking-zone}

Chaque virage possède la route à mi-chemin des sommets de chaque côté. Dedans :

- **Le point le plus lent de chaque tour** est un vrai creux de sa vitesse - rien de plus lent dans les 6 m (3 points de grille) de chaque côté, en regardant au-delà des extrémités du tronçon, pour que la sortie du virage précédent, encore en accélération, ne soit jamais prise pour lui - cherché de 15 m avant la fenêtre du virage à 10 m après. Un tour qui n'a jamais ralenti là est placé au sommet.
- **Où un tour a commencé à ralentir pour lui** (`entryOf`) : en remontant depuis son point le plus lent à travers le freinage ou le lever de pied, par-dessus les petits coups de pleins gaz, jusqu'à ce qu'il ait eu le pied au plancher (accélérateur ≥ 0,95, frein ≤ 0,1) pendant **10 m** ; un accélérateur repris dans les **30 m** qui précèdent le point le plus lent appartient encore au virage ; à fond tout du long, le point le plus lent lui-même. Un tour sans voie d'accélérateur, ou qui n'a jamais eu le pied au plancher depuis le virage précédent, commence à son point le plus rapide entre les deux.
- **Le segment commence** au premier des tours qui commence à ralentir pour lui (4 m plus tôt), et va jusqu'au début du suivant, si bien que tout le freinage de chaque tour est à l'intérieur et que les segments couvrent le tour sans trou.

**Enchaînements.** Des virages consécutifs entre lesquels la référence n'est jamais à fond - moins de **40 m** de pleins gaz - forment un seul segment, « T11-T12 », conduit d'un trait ; un enchaînement tient au plus **trois** virages (une section sinueuse jamais à fond commence un nouveau segment). Un enchaînement qui tourne dans les deux sens est *mixte* : aucune forme de trajectoire unique n'y est mesurée.

**Sur un circuit** (la référence finit à moins de 50 m de son départ), la ligne droite du dernier segment continue au-delà de la ligne jusqu'au premier point de freinage : le passage lancé depuis la ligne compte avec le dernier virage. Un tour parti de l'arrêt ou d'un départ de course (voir [Le départ](#the-start)) garde ce passage à part.

### Vers quoi mène un virage {#what-a-corner-leads-onto}

Mesuré sur la référence : les mètres à pleins gaz après le virage (de ses pleins gaz jusqu'à la fin du segment, plus le passage au-delà de la ligne) et avant (le « après » du segment précédent, ou depuis le départ).

| Type | Règle |
|---|---|
| **entre deux lignes droites** (`both`) | 200 m ou plus avant **et** 120 m ou plus après |
| **vers une ligne droite** | 200 m ou plus après, ou 120 m ou plus après et au moins autant qu'avant |
| **après une ligne droite** | 200 m ou plus avant |
| **enchaînement** | tout le reste |

## Ce que chaque tour a fait dans un virage {#what-each-lap-did-in-a-corner}

`cornerMetrics`, par tour et par segment, sur la grille (pas de 2 m). Pédales : le frein compte au-dessus de 0,1 ; pleins gaz à 0,95 et plus.

| Mesure | Règle |
|---|---|
| **point de freinage** | le premier freinage sous lequel l'accélérateur a été relâché (sous 0,5), ou qui a duré **15 m** - un petit coup de pied gauche avec la puissance engagée n'est pas le début du freinage ; avec seulement de petits coups, le premier |
| **levé de pied** | sans freinage, le premier point où l'accélérateur est passé sous 0,8 |
| (sans pédales) | le point où le tour a commencé à ralentir (ci-dessus) |
| **relâchement du frein** | le dernier freinage jusqu'à 30 m après le point le plus lent |
| **vitesse au point de freinage**, **mètres de freinage** | jusqu'au point le plus lent |
| **freinage maximal**, **décélération maximale** | sur la zone de freinage (accélérations au-delà de 45 m/s² ignorées) |
| **freinage en appui** | mètres avec frein > 0,05 et |direction| > 0,1 |
| **glissement au blocage** | le glissement de roue le plus négatif dans la zone (quand le tour a un glissement) |
| **point le plus lent**, **vitesse minimale** | comme ci-dessus |
| **accélérateur ouvert** | après le relâchement (ou le point le plus lent), le premier accélérateur > 0,15 sans frein |
| **pleins gaz** | le premier point ensuite tenu à ≥ 0,95 pendant 10 m |
| **roue libre** | mètres du relâchement à l'accélérateur ouvert, frein et accélérateur tous deux sous 0,05 |
| **creux d'accélérateur** | nombre de fois où l'accélérateur est tombé de plus de 0,25 sous son plus haut courant entre l'ouverture et les pleins gaz |
| **latéral maximal** | la plus forte accélération latérale, de 20 m avant le relâchement jusqu'au plus tard des deux : pleins gaz ou 20 m après le point le plus lent |
| **rapport au sommet** | au point le plus lent |
| **glissement à l'accélération** | le glissement le plus fort des roues motrices entre l'ouverture et les pleins gaz |
| **équilibre** | angle de glissement avant moins arrière au milieu (+ sous-virage) |
| **ligne droite à pleins gaz** | la part du segment après les pleins gaz (et le passage au-delà de la ligne) à ≥ 0,95 ; le plus long lever de pied dessus |
| **vitesse freinée** | la plus grande vitesse perdue depuis un point haut avec accélérateur ≥ 0,9, sans frein, au sol |
| **dérive à l'entrée** | le plus grand angle de dérive du point de freinage à 5 m après le point le plus lent, au sol |
| **frein à main** | où il a été actionné (> 0,2), jusqu'à 10 m après le point le plus lent |
| **air** | secondes en l'air sur le segment, et son plus long saut |

## À qui chaque tour est comparé {#who-each-lap-is-compared-with}

- Un tour est comparé au **tour complet le plus rapide de sa propre classe de performance** (la référence, dans la classe de la référence).
- Ce meilleur tour de classe lui-même (et la référence) est comparé, segment par segment, à **celui des autres tours de sa classe qui a été le plus rapide** à travers lui - ou à tous les tours, quand il est seul dans sa classe.

La carte des temps, les écarts de la liste des tours, les événements de maîtrise de la voiture et le tableau des virages suivent la même comparaison.

## Le bilan temps d'un virage {#the-time-account-of-a-corner}

`compareCorner`, pour un tour face à l'autre sur un segment :

- **net** = `rel(fin) - rel(début)` (plus le passage au-delà de la ligne sur un tour lancé) : le verdict. Plus proche que **0,03 s** est **égal**.
- **La répartition** - à quel endroit du virage le meneur a tourné : dans le tronçon qui va du premier point de freinage ou point le plus lent de l'un ou l'autre tour jusqu'au plus tard de leurs points de pleins gaz et de point le plus lent, la plus forte variation que le tour a ensuite rendue ou reprise, quand cette variation dépasse **0,04 s** ; sinon le plus tard des deux points les plus lents.
- **Jusqu'au sommet** = `rel(répartition) - rel(début)` ; **après** = le net moins cela.
  Quand les deux sont d'au moins 0,04 s et de signes opposés, le tour a **tradé** l'un contre l'autre.
- **Après** se répartit à nouveau là où les deux tours sont à fond : la **sortie** (de la répartition aux pleins gaz les plus tardifs) et la **ligne droite** (de là jusqu'à la fin).
- **La ligne droite** se répartit en trois :
  - *vitesse de sortie* (`byExit`) - mesurée, non modélisée : la voiture la plus lente passe la vitesse de départ de la plus rapide un peu plus loin sur la ligne droite, et à partir de là sa propre trace est ce qu'elle aurait fait depuis cette vitesse, avec son propre rapport, sa traînée et sa pente. Ramenée à ce point (et prolongée à sa vitesse de fin pour les mètres qu'elle gagne), c'est son temps depuis le départ plus rapide ; l'écart est le coût de la vitesse de sortie. Quand la voiture la plus lente n'atteint jamais cette vitesse (ou seulement dans les 2 derniers échantillons), son accélération propre le long du tronçon est reportée en puissance (`a·v` maintenu), sans jamais dépasser ce que son enveloppe montre à cette vitesse (deux fois l'accélération mesurée sans enveloppe).
  - *la traction des voitures* (`byPower`) - seulement dans des voitures différentes : les deux voitures depuis la même vitesse sur les mêmes mètres, à fond, en intégrant l'accélération à pleins gaz que chacune a montrée à chaque vitesse.
  - *la façon de conduire* (`driven`) - le reste : un lever de pied, une vitesse freinée à pleins gaz.

  La vitesse de sortie n'explique jamais plus que le coût de la ligne droite (et jamais avec le signe opposé), sauf si un lever de pied ou une vitesse freinée en a repris une partie. Un tour **a levé le pied** sur la ligne droite quand sa part à pleins gaz est sous à la fois 0,9 et la part de l'autre moins 0,05. La vitesse freinée compte quand les deux diffèrent de plus de 1 m/s. Un désaccord de moins de 0,02 s de signe est ramené à 0.

Le net de chaque segment s'additionne à la différence de temps au tour, et le « jusqu'au sommet » et « après » de chaque virage s'additionnent au net (les tests vérifient les deux).

### La part de la voiture {#the-cars-share}

Seulement quand les tours sont dans des **voitures différentes** et que le tour a perdu du temps (`carShare`) :

- **traction** : la traction des voitures sur la ligne droite (ci-dessus), jusqu'à la perte ;
- **adhérence** : quand le tour était à la limite de sa voiture (accélération latérale au milieu d'au moins **90 %** de ce que sa voiture tient à cette vitesse) et que l'autre voiture tient plus de **5 %** de plus : de la vitesse minimale la plus basse non expliquée par un rayon plus serré, la part `½ ln(adhérence_autre / adhérence_moi) / ln(vitesse_autre / vitesse_moi)` de la perte restante ;
- **freins** : quand le tour a freiné (sans lever de pied), que l'autre voiture freine plus fort de plus de **5 %**, et que la décélération *moyenne* du tour dans la zone était d'au moins **80 %** de ce que sa voiture peut faire : de `u` à `v` à `a1` contre `a2`, en finissant au même point, `(1/a1 - 1/a2)(u - v)² / 2u`, jusqu'à ce qui reste.

Le coût de la voiture est la somme, au plus égale à la perte.

## Le verdict et le constat {#the-verdict-and-the-finding}

`cornerFinding` écrit au plus un constat par tour et par virage, en essayant dans cet ordre :

| Cas | Constat | Issue |
|---|---|---|
| net dans ±0,03 s, un tradé, côté le plus petit ≥ **0,1 s** | **égal, deux façons de passer** - qui était lent à l'entrée et rapide à la sortie, et qui était l'inverse ; avec une ligne droite après (vers une ligne droite, ou entre deux), la façon lent-à-l'entrée, rapide-à-la-sortie est celle sur laquelle construire : garder son accélérateur précoce, regagner l'entrée en freinant plus fort, pas plus tard | égal |
| net dans ±0,03 s, sinon | rien à dire | - |
| gagné, un tradé, perdu jusqu'au sommet | **lent à l'entrée, rapide à la sortie a payé** : le garder, ici la sortie vaut plus | gain |
| gagné, un tradé, gagné jusqu'au sommet | **plus rapide à l'entrée** : l'entrée est juste, des pleins gaz plus tôt en garderaient davantage | gain |
| gagné, et l'autre tour a une perte ici | **plus rapide - à cause de ce qu'a fait l'autre**, sa cause et son conseil disaient « Pour l'autre tour : … » | gain |
| gagné autrement | **plus rapide à l'entrée / à la sortie**, selon la moitié qui a le plus gagné (freiner plus tard, plus de vitesse au milieu ; ou relâcher plus tôt, traction plus forte) | gain |
| perdu, et un **choc ou une collision** coûte au moins `max(0,05 s, 40 % de la perte)` | l'impact est l'histoire du virage, avant les voitures | perte |
| perdu, et la **part de la voiture** est de 60 % ou plus | **la voiture** : sa traction sur la ligne droite, son adhérence au milieu, ou ses freins - la plus grande part ; avec la part du pilote (≥ 0,03 s) dite « Les X s restantes : … » | perte |
| perdu, et une **faute de maîtrise de la voiture** non partagée coûte au moins `max(0,05 s, 40 %)` | cette faute (voir plus bas), avec la façon dont le temps a bougé autour | perte |
| perdu, et un **saut plus long** coûte au moins `max(0,05 s, 40 %)` | le saut | perte |
| perdu, un tradé, gagné jusqu'au sommet | **trop rapide à l'entrée, lent à la sortie** : la cause de la sortie ; sacrifier un peu d'entrée pour tourner et être à fond plus tôt, avec les points de freinage et de pleins gaz de l'autre tour. Sa racine (`cause`, ce que comptent les [statistiques](race-course-statistics.md)) : freiner plus tard, quand il a freiné de plus de quelques mètres plus tard que l'autre ; sinon la cause de la sortie | perte |
| perdu, un tradé, perdu jusqu'au sommet | **a trop donné à l'entrée par rapport à ce que la sortie a repris** : la cause de l'entrée, qui est aussi sa racine (`cause`) ; garder la sortie, perdre moins à l'entrée | perte |
| perdu, levé sur la ligne droite, et la part conduite plus de la moitié de la perte | **pas à fond sur la ligne droite** : part à pleins gaz comparée à celle de l'autre, où et combien de temps le lever de pied | perte |
| perdu, la traction des voitures plus de 60 % de la perte et la ligne droite plus de la moitié | **la traction de la voiture sur la ligne droite** (avec la traction des deux voitures à 160 km/h) | perte |
| perdu autrement | la cause de la moitié qui a perdu le plus (quand le côté jusqu'au sommet est au moins aussi grand que celui d'après : celle de l'entrée ; sinon celle de la sortie). Plus lent à la sortie seulement parce que plus lent au milieu (de plus de 1 m/s) : la cause du milieu à la place | perte |

Un constat sur une perte peut aussi se terminer par **Aussi :** - vitesse freinée à pleins gaz, ou un lever de pied sur la ligne droite - quand la part conduite de la ligne droite a coûté plus de 0,04 s et que ce n'était pas déjà la cause.

Les constats sont triés : les pertes d'abord, la plus coûteuse en premier ; puis les gains et les virages égaux.

### Causes à l'entrée {#causes-on-the-way-in}

`entryCause`, la première qui s'applique (les écarts de vitesse minimale sont en m/s ; « 5 m » est le seuil pour qu'un point plus tôt ou plus tard compte) :

| n° | Cause (erreur) | Règle |
|---|---|---|
| 1 | un choc ou une collision à l'entrée | un impact non partagé commençant à moins de 10 m après le point le plus lent |
| 2 | **presque à l'arrêt** (incident) | vitesse la plus basse sous **60 %** de ce que l'adhérence de cette voiture permet là où l'autre est passé (`v_autre · √(adhérence_moi / adhérence_autre)` quand l'autre voiture adhère davantage, sinon la vitesse de l'autre), l'autre tour au-dessus de 8 m/s - un tête-à-queue, un contact ou un virage manqué |
| 3 | une faute de maîtrise de la voiture à l'entrée | un blocage, une poussée, un tête-à-queue ou un dérapage non partagé, hors accélérateur, commençant à moins de 10 m après le point le plus lent, coûtant ≥ 0,02 s |
| 4 | un saut plus long avant le point le plus lent | voir [rallye](#rally-rotation-and-flights) |
| 5 | **levé** là où l'autre est resté à fond ou a levé 5 m ou plus tard | ce tour seul a levé |
| 6 | **freiné là où l'autre n'a fait que lever**, ou est resté à fond | et était plus lent de plus de 0,5 m/s au milieu |
| 7 | **freiné doucement** | il a freiné (sans lever), avait de la marge pour freiner plus fort - avec les données de pneus, son glissement au blocage sous **60 %** du glissement où les freins de cette voiture donnent le meilleur ; sans, une décélération maximale sous **85 %** de ce qu'il montre à cette vitesse - la pédale sous 0,95, et la décélération maximale de l'autre tour plus de **15 %** plus haute |
| 8 | **freiné tôt** - ou **les freins de la voiture** | freiné de plus de 5 m avant l'autre. Dans une autre voiture dont les freins sont plus forts de plus de 5 %, et avec pas plus de 10 m de marge sur la distance que cette voiture a besoin à sa propre décélération : les freins de la voiture. Sinon freiné tôt, avec « Freiner plus tard - environ N m » (dans une autre voiture, les mètres au-delà de ce qu'elle a besoin) |
| 9 | **roue libre** | plus de 10 m sans aucune pédale, et 5 m de plus que l'autre |
| 10 | **plus lent au milieu** | plus de 0,5 m/s plus lent au point le plus lent ; réparti par `v² = a·R` (ci-dessous) |
| 11 | **arrivé plus lentement** | plus de 1 m/s plus lent au point de freinage, sans freinage tôt : décidé avant - par le virage précédent et la traction de la voiture, ou par un saut de 0,2 s plus long dans le virage précédent. Celle de la voiture quand les voitures diffèrent |
| 12 | plus lent jusqu'au sommet | sinon : relâcher le frein plus en douceur et rouler avec plus de vitesse au milieu |

**Plus lent au milieu** (`middleSplit`) : le rayon de chaque tour à son point le plus lent est mesuré sur son propre chemin (±8 m), son accélération latérale est `v²/R`, et

`ln(v_autre / v_moi) = ½ ln(a_autre / a_moi) + ½ ln(R_autre / R_moi)`.

- Le rayon explique **la moitié ou plus** : **une trajectoire trop serrée** - « utilisez plus de la route », avec les deux rayons et la part.
- À la limite de la voiture (qui glisse au-delà de 10° de dérive sur asphalte / 20° sur meuble, ou accélération latérale d'au moins 90 % de ce qu'elle tient à cette vitesse) et que l'autre voiture adhère de plus de 5 % : **l'adhérence de la voiture** ; protéger la sortie à la place.
- Glisse dans le virage (dérive au-delà de 10° / 20°) et l'autre tour non (sa dérive à l'entrée d'au moins 4° de moins) : **de côté** - au-delà de son adhérence, et non en deçà ; arriver un peu plus lent. Dit comme celui de la voiture quand cette voiture accroche son arrière au moins une fois de plus par tour que l'autre.
- Dans une autre voiture qui tient moins de **96 %** de l'adhérence de l'autre, et que le tour a gardé à 1 m/s près de `v_autre · √(adhérence_moi / adhérence_autre)` : **l'adhérence de la voiture** - « freiner plus tard ne comblera pas cela ».
- Sinon **de l'adhérence en réserve** : accélération latérale comparée à celle de l'autre sur un rayon voisin, et ce que tient cette voiture ; garder plus de vitesse jusqu'au sommet. Quand l'arrière de cette voiture lâche avant que son adhérence soit épuisée (ses glissades commencent sous 85 % de son adhérence, et le tour était à 80 % de cela), trouver le reste par petits pas.

### Causes à la sortie {#causes-on-the-way-out}

`exitCause`, la première qui s'applique :

| n° | Cause (erreur) | Règle |
|---|---|---|
| 1 | une faute de maîtrise de la voiture à la sortie | patinage, tête-à-queue, glissade ou impact non partagés finissant à 10 m avant le point le plus lent ou après |
| 2 | **vitesse freinée** | plus de 1 m/s de vitesse perdue à pleins gaz que l'autre ; au-delà de **7 m/s (25 km/h)**, « plutôt un contact ou un tête-à-queue qu'une glissade » |
| 3 | **a mal tourné la voiture** (sol meuble) | voir [rallye](#rally-rotation-and-flights) |
| 4 | **remis les gaz plus tard** | accélérateur ouvert plus de 5 m plus tard, compté aussi depuis le point le plus lent de chaque tour (un tour dont le point le plus lent est plus tardif n'est pas blâmé pour un accélérateur plus tardif) |
| 5 | **hésité sur l'accélérateur** | plus de creux d'accélérateur que l'autre |
| 6 | **élargi et attendu** | plus de 1,5 m à l'extérieur de l'autre là où les deux étaient à fond, et pleins gaz plus de 5 m plus tard depuis son propre point le plus lent |
| 7 | **pleins gaz plus tard** | pleins gaz plus de 5 m plus tard, aussi depuis son propre point le plus lent ; avec l'accélération de la voiture à cet endroit |
| 8 | **la conduite de la voiture** | dans une autre voiture qui tire moins de 95 % de l'autre à cette vitesse, et la traction a expliqué une partie de la ligne droite |
| 9 | **plus lent en sortie de virage** | sinon : un sommet plus tardif, donc la voiture est droite plus tôt |

Quand les deux tours étaient dans des rapports différents au point le plus lent, le conseil se termine par « Rapport N au sommet ; l'autre a utilisé M. »

### Fautes de maîtrise de la voiture et impacts {#car-control-faults-and-impacts}

Une faute des [événements de maîtrise de la voiture](race-control-events.md) comme cause : un blocage est une cause de *freinage*, un patinage ou une glissade à l'accélérateur une cause de *sortie*, le reste *entrée* ; un impact après le point le plus lent est *sortie*, avant lui *entrée*. Le conseil est celui de l'événement lui-même, puis « Cela a coûté environ X s jusqu'à 40 m après » (ou « jusqu'à ce que la voiture retrouve sa vitesse » pour un impact). Un blocage dont le point de freinage est plus de 5 m plus tôt que celui de l'autre ajoute que le tour a aussi freiné tôt - les roues tournant, il n'en aurait pas eu besoin.

### Rallye : rotation et sauts {#rally-rotation-and-flights}

Sur **sol meuble**, avec des angles de dérive sur les deux tours, et ce tour à l'accélérateur (ou à plat) plus de 5 m plus tard :

- **A moins tourné la voiture** : l'autre avait tourné la voiture de **12°** ou plus à son point le plus lent, et d'au moins **8°** de plus que ce tour. Conseil : un lever de pied ou un petit coup de frein du pied gauche à l'entrée du virage, avec le point de frein à main de l'autre tour quand lui seul s'en est servi, ou le frein à main dans un virage plus lent que 15 m/s (54 km/h).
- **A trop tourné la voiture** : ce tour l'avait tourné de 12° ou plus, et d'au moins **12°** de plus que l'autre : il a fallu le redresser avant de pouvoir remettre les gaz.

**Un saut plus long** : en l'air 0,2 s ou plus de plus que l'autre, coûtant au moins 0,03 s de 10 m avant le décollage à 40 m après la réception (ou à la fin du segment). Avant le point le plus lent, c'est une cause d'entrée ; cela devient l'histoire du virage quand il explique 40 % ou plus. Le conseil : garder l'accélérateur ouvert au décollage, passer la bosse un peu plus lentement ou avec un petit coup de frein.

### Le départ {#the-start}

Avant le premier virage, sur un sprint, ou quand l'un des tours part de l'arrêt (moins de 5 m/s là où les deux sont en premier sur l'axe) ou d'un départ de course (moins de 60 % de la vitesse de l'autre), le trajet jusqu'au premier point de freinage est son propre constat (virage 0) quand il diffère de plus de 0,03 s : *Le lancement*, *Le départ de la course* ou *Jusqu'au premier virage*. Une perte là est mise sur le compte de la situation (*contexte*) quand un tour est parti d'un départ de course et l'autre à vitesse de croisière, sur celui de la voiture quand les tours sont dans des voitures différentes, et sur celui du pilote sinon. Conseils : dans une autre voiture depuis l'arrêt, « surtout la voiture » ; un départ arrêté dans la même voiture, lancer avec moins de patinage et changer au sommet de la plage de puissance ; un départ de course, comparer avec un autre premier tour ; un départ lancé, une meilleure sortie du dernier virage se reporte sur la ligne.

## La trajectoire parcourue {#the-driven-line}

`lineMetrics`, par tour et par segment (pas pour les enchaînements mixtes), à partir des seules positions (lissées ±2 échantillons) sur la fenêtre du virage :

| Mesure | Règle |
|---|---|
| courbure | variation de cap sur ±8 m du propre chemin du tour |
| **rayon le plus serré** | 1 / la courbure maximale |
| **entrée en virage** / **sortie de virage** | là où la courbure dépasse pour la première / dernière fois un cinquième de son maximum |
| **milieu** | là où le tour a tourné la moitié de sa variation de cap |
| rayon entrée / sortie | mètres parcourus pendant la moitié de la variation de cap, avant / après le milieu |
| **forme** | rayon le plus serré sur le rayon moyen pendant le virage : sous **0,55** un **V**, au-dessus de **0,75** un **U**, entre les deux « U/V » |
| **sommet** | rayon de sortie sur rayon d'entrée : au-dessus de **1,25** tardif, sous **0,8** précoce, sinon milieu |
| **sommet de vitesse** | le point le plus lent plus de **15 m** avant le milieu : lent à l'entrée, rapide à la sortie ; plus de 15 m après : ça freine encore après le milieu |

Face à l'autre tour : de combien il roulait à l'intérieur (+) ou à l'extérieur à l'entrée en virage, dans la partie la plus serrée et là où les deux étaient à fond (dit à partir de 1 m) ; où chacun est entré en virage (dit à partir de 8 m).

### Quelle trajectoire convient à cette voiture ici {#which-line-suits-this-car-here}

`lineFor`, à partir de ce vers quoi mène le virage et du caractère de la voiture à ce virage :

- **puissance-adhérence** = l'accélération à pleins gaz de la voiture à la vitesse de sortie, divisée par son adhérence à la vitesse minimale (depuis son enveloppe). **Pied au plancher** à **0,45** et plus ; **élan** à **0,25** et moins.
- **appui aérodynamique** : adhérence à 151-252 km/h divisée par l'adhérence à 54-108 km/h de **1,15** ou plus, pour un virage pris à **144 km/h** (40 m/s) ou plus vite - alors c'est un virage d'élan quelle que soit la puissance. Non jugé sur sol meuble.

| Type de virage | Voiture | Trajectoire |
|---|---|---|
| après une ligne droite | pied au plancher / autre | V / U, sommet au milieu : « la zone de freinage est le gain » |
| entre deux lignes droites | élan / autre | U / V, sommet tardif |
| enchaînement | élan / autre | U / V, sommet au milieu : « conduisez-le pour la sortie du suivant » |
| vers une ligne droite | élan (ou un virage rapide à appui) | U large et arrondi, sommet un peu tardif |
| vers une ligne droite | pied au plancher | V : freiner droit, entrer tard, tourner dans un milieu court et serré, ligne droite tôt |
| vers une ligne droite | entre les deux | U avec sommet tardif : lent à l'entrée, rapide à la sortie |

Quand la sortie compte (vers une ligne droite, entre deux), la transmission ajoute une phrase : **Traction avant** - la faire tourner au freinage, n'ajouter de la puissance qu'à mesure que la roue se déroule ; **propulsion** avec un pied au plancher de 0,35 ou plus - la redresser avant les pleins gaz ; **intégrale** - elle peut prendre de la puissance en tournant encore. Sur sol meuble, chaque trajectoire ajoute : faire tourner la voiture à l'entrée.

La phrase dit ensuite ce que le tour a conduit, et si cela convient : *un point le plus lent tardif gêne la sortie* ou *un sommet précoce gêne la sortie* quand un sommet tardif était voulu et que le tour n'a ni n'a eu de sommet tardif ni n'a été le plus lent tôt ; *plus arrondi que ce que veut cette voiture* quand un V était voulu ; *plus carré que ce que veut cette voiture* quand un U était voulu ; sinon *cela convient*.


## Pour les développeurs {#for-developers}

Code : [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Le raisonnement et ses sources : [la méthode](race-analytics.md).
