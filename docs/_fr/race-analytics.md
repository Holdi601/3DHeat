---
title: "Analyse de course : la méthode"
parent: "Analyse de course"
nav_order: 58
lang: "fr"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Analyse de course : la méthode

En bref :

- Les tours se comparent **par distance**, et non par temps, pour que le même endroit du circuit s'aligne.
- Chaque virage est jugé **en entier**, d'une zone de freinage à la suivante.
- Le temps perdu est **réparti** selon l'endroit où il a été perdu (freinage, entrée, sortie, ligne droite) et selon la part que la voiture explique.
- La cause est **expliquée en mots**, avec des conseils.
- Pour l'utiliser, et non pour lire comment elle fonctionne : voir [Analyse de course](race-analysis.md).

C'est la méthode derrière l'onglet **Analyse de course** : ce qu'elle mesure, comment elle décide où le temps est allé, et comment elle en tire des conseils. C'est la spécification que suit le code d'analyse (`src/race/`), si bien que chaque règle ici a son équivalent là-bas et un test qui la vérifie.

## Ce que font les outils professionnels {#what-the-professional-tools-do}

Les outils établis convergent sur le même noyau, et diffèrent surtout par leur degré d'aller vers les *causes* :

- **Tout se compare par distance, non par temps.** Deux tours sont rééchantillonnés sur un seul axe de distance ; la différence cumulée de temps écoulé à la même distance est le *delta* (MoTeC l'appelle variation de temps, d'autres écart de temps ou tracé de delta). Sa pente dit où le temps se perd à l'instant : une pente faible est une accélération, une traînée ou une adhérence soutenue ; une pente forte une différence de freinage ou d'accélérateur ; une vague qui monte et descend un échange entre vitesse d'entrée et sortie.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [section time analysis](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Chaque virage est découpé en phases** : freinage, entrée, milieu, sortie - point de freinage, freinage maximal et relâchement, vitesse minimale et l'endroit où elle se trouve, rapport, reprise de l'accélérateur, retour à pleins gaz, vitesse de sortie.
  ([Driver61: six phases](https://driver61.com/uni/corner-phases/),
  [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Des mini-secteurs par virage, et un meilleur temps théorique** assemblé à partir du plus rapide de chacun. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **La trajectoire parcourue est aussi comparée**, mais jamais seule : « une ligne sur une image ne signifie rien tant qu'on ne connaît pas les facteurs qui y contribuent » - elle se lit avec la trace de vitesse et le delta.
  ([Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **La cause profonde, non le symptôme.** La perte sur la ligne droite est-elle vraiment l'accélérateur, ou une mauvaise entrée a-t-elle forcé une reprise tardive ? Les erreurs sont classées par coût en temps au tour et expliquées en langage simple.
  ([Track Titan coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Ce qui n'allait pas dans la première version, et pourquoi c'est important {#what-went-wrong-in-the-first-version-and-why-it-matters}

La première version facturait chaque *phase* séparément et ne regardait que les pertes. Un tour qui freinait plus tôt perdait du temps dans la phase de freinage, et on lui disait de freiner plus tard - même quand ce freinage plus précoce faisait tourner la voiture plus tôt, remettre les gaz plus tôt et sortir du virage plus vite, et que tout était regagné sur la ligne droite. Dans un test, elle disait à ce tour qui faisait cela de « freiner beaucoup plus tard », alors que l'autre tour - qui, lui, freinait plus tard - avait manqué le sommet, élargi sa trajectoire et perdu exactement ce qu'il avait gagné. Les données de temps disaient que les deux façons de passer étaient égales ; le conseil disait le contraire.

La correction est la règle sur laquelle toutes les sources ci-dessus s'accordent : **un virage est jugé en entier**, du point de freinage qui le précède au point de freinage du suivant, car « parfois, sacrifier quelques millisecondes dans un virage peut améliorer le temps global tour en permettant des segments plus rapides ensuite » ([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Connaissances de pilotage que les règles encodent {#racing-knowledge-the-rules-encode}

**La vitesse de sortie compte plus que la vitesse d'entrée**, et d'autant plus que la ligne droite suivante est longue : « le temps passé sur les lignes droites domine le temps passé dans les virages », et un déficit de vitesse à la sortie se reporte jusqu'au point de freinage suivant. La façon la plus rapide de passer un virage et sa ligne droite consiste souvent à prendre le virage plus lentement pour remettre les gaz plus tôt - *lent à l'entrée, rapide à la sortie*.
([Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/))
Un planificateur de temps minimal qui est aussi récompensé pour la vitesse de sortie déplace ses sommets plus tard et obtient un tour *plus rapide* ; la récompense qui équilibre les deux vaut `L / v²` par unité de vitesse de sortie pour une ligne droite de longueur `L` à la vitesse `v` - le temps qu'une différence de vitesse coûte sur une ligne droite croît avec sa longueur et décroît avec le carré de la vitesse ([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Les virages selon ce vers quoi ils mènent.** Un virage qui mène à une ligne droite : maximiser la vitesse de sortie, sommet tardif, retour à la puissance le plus tôt possible. Un virage en fin de ligne droite : maximiser la vitesse emportée dedans, freiner le plus tard possible, un sommet plus précoce est acceptable. Un virage entre deux autres : compromis au profit de celui qui compte après. Un virage qui peut être l'un ou l'autre est traité comme un virage menant à une ligne droite. Les virages rapides pèsent davantage : à haute vitesse, une voiture accélère faiblement, et un km/h perdu ne se regagne pas.
([Allen Berg: three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/),
[Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

**Le cercle d'adhérence.** Un pneu a un seul budget d'adhérence, dépensé en freinage, en virage et en accélération dans un mélange quelconque ; l'accélération totale est `sqrt(lat² + long²)`. Le freinage en appui suit son bord : le frein se relâche à mesure que la direction et la charge latérale montent.
([friction circle](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**La roue libre** - aucune pédale enfoncée - est la façon la plus lente de perdre de la vitesse, et un indicateur de performance mesuré à part entière.
([Racecar Engineering / OptimumG: coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Le glissement.** La force longitudinale culmine à un taux de glissement d'environ 10 à 20 %, puis décroît ; au-delà, la roue bloque au freinage ou patine sous la puissance. Forza donne le glissement normalisé : 0 est l'adhérence totale, une valeur absolue au-dessus de 1 signifie adhérence perdue.
([longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Sous-virage et survirage.** Un angle de glissement avant plus grand que l'arrière est un sous-virage ; un arrière plus grand que l'avant est un survirage. Sans angles de glissement : la voiture tourne moins que ce que demande la direction (la direction au-delà de l'angle d'Ackermann `L/R` dont une voiture a besoin à basse vitesse).
([understeer, overview](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## La géométrie d'une trajectoire {#the-geometry-of-a-line}

La vitesse qu'une voiture peut tenir sur un rayon `R` est `v = sqrt(a R)`, avec `a` l'accélération latérale que donnent ses pneus (plus ce qu'ajoute l'appui aérodynamique, qui croît avec `v²`). Ainsi **la vitesse croît avec la racine carrée du rayon** : une trajectoire par le milieu sur un rayon plus grand de 20 % est environ 10 % plus rapide à cet endroit.
([maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: cornering](https://www.formula1-dictionary.net/cornering_tech.html))

**La trajectoire géométrique** est le plus grand arc à travers un virage : depuis le bord extérieur, touchant l'intérieur au sommet, puis de retour à l'extérieur. Pour un virage qui tourne de `θ` sur une route de largeur `w` (moins la largeur de la voiture), un arc tangent aux deux bords extérieurs et touchant le coin intérieur a `R = w / (1 - cos(θ/2))` (plus le rayon propre du bord intérieur) - pour un angle droit environ `3,4 w`, pour une épingle `w`. C'est pourquoi l'usage de la largeur compte le plus dans les virages moyens et le moins dans les épingles.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**Le sommet tardif** tourne plus tard et plus profond, sur un rayon d'abord plus serré, et ouvre le rayon à la sortie : plus lent au milieu, ligne droite plus tôt, pleins gaz plus tôt - « une vitesse minimale un peu plus basse mais un profil d'accélération plus fort à la sortie ». **Le sommet précoce** est l'inverse : plus rapide à l'entrée, et un rayon qui se resserre à la sortie et retient l'accélérateur - surtout une erreur, sauf en très faible adhérence, où la vitesse perdue à l'entrée ne peut pas se rattraper à la sortie. ([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[Vocabulaire de la télémétrie de course](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**Le « V » et le « U ».** Le U est la trajectoire ronde classique : le rayon le plus large, le moins de changement de direction. Le V entre plus tôt, va plus profond, fait tourner la voiture vite au milieu et prépare la sortie pour une sortie plus droite : le freinage reste droit (il peut donc être plus tardif), la vitesse minimale est plus basse mais atteinte plus tard, les pleins gaz arrivent beaucoup plus tôt.
([Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Courbure en fonction de la distance.** La trajectoire la plus rapide est un compromis entre le chemin le plus court et le moins courbé ; sur la largeur d'une piste, la courbure compte davantage, et une trajectoire à courbure minimale se rapproche de la trajectoire à temps minimal partout où la voiture est à sa limite - elle s'en écarte là où la voiture pourrait accélérer.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Virages enchaînés** - double sommet, chicane - forment un seul problème : la trajectoire de sortie de l'un est la trajectoire d'entrée du suivant, et on les conduit à rebours depuis celui qui mène à une ligne droite.
([Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

## Quelle trajectoire convient à quelle voiture {#which-line-suits-which-car}

Ce qui décide, c'est le **rapport puissance / adhérence** de la voiture aux vitesses de ce virage - « l'élan est une affaire d'adhérence contre puissance, un rapport ».
([Ross Bentley: momentum cars](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum over horsepower](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Voiture, dans ce virage | Trajectoire | Pourquoi |
|---|---|---|
| Accélère fort pour son adhérence (« pied au plancher ») | V : freiner droit et tard, tourner dans un milieu court et serré, aller droit et à fond tôt | le temps se gagne aux pleins gaz, non par la vitesse minimale |
| Accélère faiblement pour son adhérence (« élan ») | U large, sommet un peu tardif, garder la vitesse minimale haute | elle ne peut pas regagner la vitesse qu'elle freine |
| Entre les deux | lent à l'entrée, rapide à la sortie : U à sommet tardif | le compromis classique |
| Virage rapide, et plus encore avec l'appui aérodynamique | U, proche de la trajectoire géométrique | l'accélération est faible à haute vitesse ; l'adhérence due à l'appui croît avec `v²`, donc la vitesse au milieu rapporte deux fois |
| Adhérence très faible (mouillé, neige) | sommet plus précoce | la vitesse perdue à l'entrée ne peut pas se rattraper à la sortie |
| Puissance très au-delà de l'adhérence | la trajectoire compte moins | la motricité, non la trajectoire, limite la sortie |

« Plus le virage est rapide, plus il se rapproche de la trajectoire géométrique ; plus il est lent, plus on la modifie avec un sommet tardif. »
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: grip](https://driver61.com/uni/grip/))

La transmission change davantage la façon de conduire la trajectoire que la trajectoire elle-même : une voiture à traction avant se fait tourner au freinage (freinage en appui) et ne reçoit de la puissance qu'à mesure que la roue se déroule, sans quoi elle part large ; une puissante voiture à propulsion doit être droite avant les pleins gaz, sinon l'arrière décroche ; une intégrale peut prendre de la puissance en tournant encore, si bien qu'elle reprend l'accélérateur plus tôt.
([FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

La visionneuse mesure le rapport puissance / adhérence de la voiture à chaque virage à partir de sa propre conduite - l'accélération à pleins gaz à la vitesse de sortie, divisée par l'adhérence latérale à la vitesse minimale - et l'appelle « pied au plancher » à 0,45 et plus, « élan » à 0,25 et moins. Une voiture dont l'adhérence à 150-250 km/h dépasse de plus de 15 % son adhérence à 55-110 km/h a son appui aérodynamique à l'œuvre.

## La méthode {#the-method}

Les chiffres ci-dessous sont le raisonnement. Les seuils qu'utilise le code sont consignés sur une page chacun, et ces pages font référence quand un chiffre ici diffère : [Analyse virage par virage](race-corner-analysis.md), [Événements de maîtrise de la voiture](race-control-events.md), [Profils de voitures et comparaison](race-car-profiles.md) et [Statistiques du circuit](race-course-statistics.md).

### 1. Un seul axe de distance {#one-distance-axis}

Le tour le plus rapide est la référence, sauf si l'utilisateur en choisit un autre. Sa trajectoire parcourue sert d'axe : les échantillons de chaque autre tour y sont projetés, ce qui donne à chaque échantillon une distance le long de la référence `s` et un décalage latéral signé `d`. La projection ne cherche qu'en avant à partir du point précédent, si bien qu'un tour qui se recroise ne saute jamais du mauvais côté d'un pont. Les tours sont ensuite rééchantillonnés sur une grille commune, tous les 2 m, pour chaque canal. Chaque tour est prolongé de quelques derniers mètres à la vitesse qu'il avait, si bien que son delta sur la ligne est sa différence de temps au tour.

### 2. Virages, et la part de chaque virage dans le tour {#corners-and-each-corners-share-of-the-lap}

Comment les virages, les segments et les enchaînements sont trouvés : [Analyse virage par virage](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Le bilan temps d'un virage {#the-time-account-of-a-corner}

Net, répartition, vitesse de sortie et traction des voitures : [Analyse virage par virage](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Le verdict, et la cause {#the-verdict-and-the-cause}

Les schémas de verdict et les causes à l'entrée et à la sortie : [Analyse virage par virage](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. La voiture contre le pilote {#the-car-against-the-driver}

Quand les tours sont dans des voitures différentes, la perte que la voiture explique est retirée, par partie :

- **traction** : les voitures à partir de la même vitesse sur la ligne droite, comme plus haut ;
- **adhérence** : de la vitesse minimale la plus basse non expliquée par un rayon plus serré, la part `½ ln(adhérence_autre / adhérence_moi) / ln(vitesse_autre / vitesse_moi)`, quand le tour était à la limite de sa voiture (90 % de ce qu'elle a montré à cette vitesse) ;
- **freins** : de `u` à `v` avec une décélération `a1` contre `a2`, en finissant au même point, coûte `(1/a1 - 1/a2)(u - v)² / 2u` - seulement quand le tour a freiné à peu près aussi fort que sa voiture peut le faire dans la zone en moyenne, et non seulement à un pic.

Ce qu'une voiture peut faire vient de chaque tour chargé d'elle : adhérence latérale, freinage et accélération à pleins gaz par tranche de vitesse de 5 m/s (95e, 95e et 90e centiles). L'adhérence est ce que la voiture **a tenu pendant une demi-seconde** - l'accélération latérale moyennée sur 0,5 s - et non ce qu'un seul échantillon a touché : un vibreur, un glissement qui se rattrape, une voiture qu'on rattrape font monter la mesure un instant, et une voiture qui le fait souvent paraissait plus adhérente qu'elle ne l'est. (Vérifié sur des tours enregistrés de deux voitures différentes : la mesure par échantillon les rapprochait ; tenue pendant une demi-seconde, elle les sépare comme leurs temps au tour le font.) Le freinage et la traction prennent chaque échantillon comme la médiane de lui-même et de ses voisins. L'air, le tassement après une réception et chaque choc (section 6) jusqu'à ce que la voiture se soit rétablie sont exclus.

**Quel genre de voiture chacune est** (`profile.ts`) : à partir des mêmes tours,

- **adhérence tenue** : le 95e centile de cette accélération latérale sur une demi-seconde ;
- **traction** à pleins gaz jusqu'à 50 km/h, de 50 à 120, de 120 à 200 et au-delà de 200, et le maximum montré ;
- **freinage** de 60 à 160 km/h ;
- **vitesse de pointe** : là où elle a cessé de gagner à pleins gaz pendant une seconde sur une ligne droite - conduite droite, non un long virage pris à fond, où une voiture freine sa vitesse à toute puissance. Quand aucune ligne droite n'était assez longue, ce qu'elle tirait encore à sa plus haute vitesse dit à quelle distance elle en était. Rien au-delà de ce que montrent les tours : un ajustement de puissance selon la vitesse contre la traînée a placé une voiture de route 100 km/h au-delà de sa vraie vitesse de pointe, car le rapport de boîte et le limiteur mettent fin à la traction d'une voiture bien avant que la traînée ne le fasse ;
- **perte de l'arrière** : combien de fois un tour la voiture a glissé au-delà de 10° de dérive (20° sur sol meuble) avec les roues braquées contre le virage - rattrapée au contre-braquage - combien de ces glissades ont commencé à l'accélérateur, et à quelle part de son adhérence elles ont commencé. Une voiture conduite un peu de travers exprès ne perd rien ; une voiture qu'il faut rattraper, si. Compté de la même façon pour chaque voiture, pour que deux voitures puissent se comparer ;
- **équilibre**, quand les tours portent les angles de glissement : avant contre arrière à la limite.

**Voitures comparées** met les voitures côte à côte - un tableau, une phrase chacune sur ce qu'est la voiture par rapport à l'autre (« X accélère mieux, mais ne tourne pas aussi fort, a besoin de plus de distance pour s'arrêter et perd l'arrière plus facilement »), chaque différence qui est nette (4 % d'adhérence, 5 % de traction ou de freinage, 4 km/h de vitesse de pointe, un arrière rattrapé au moins une fois de plus par tour et d'une moitié de plus), et comment conduire chacune. Avec une seule voiture, il dit ce qu'est cette voiture.

**Dans chaque virage**, quand les tours sont dans des voitures différentes, le constat dit ce qu'en décident les voitures, et comment tirer le meilleur de celle-ci :

- **au milieu** : sur la trajectoire de l'autre voiture, l'adhérence de cette voiture permet `v_autre · √(adhérence_moi / adhérence_autre)`. Si le tour a tenu cela, l'écart vient de la voiture, et aucun point de freinage ne le change - cela est dit, et le virage est imputé à la voiture plutôt qu'au pilote ; s'il a tenu moins, le reste est là pour
  être gagné, et combien est dit. Ensuite, là où le temps peut être gagné à la place : vers une ligne droite, ou dans une voiture qui tire plus fort, après le sommet - freiner droit, entrer plus tard, orienter la voiture vers la sortie tôt ; sinon, le rayon le plus large que la route permet, car un rayon plus grand est le seul moyen d'aller plus vite sans plus d'adhérence ;
- **une arrière qui a lâché** ici, dans une voiture qui la perd plus facilement que l'autre : que faire dans cette voiture - l'accélérateur réengagé à mesure que la roue se déroule, ou le frein relâché doucement sans lever de pied au milieu du virage, selon la façon dont ses glissades commencent ;
- **la ligne droite suivante** : ce que la traction plus forte de l'autre voiture, à partir de la même vitesse, a pris, et où cette voiture a manqué de traction sur elle ;
- **un point de freinage plus tôt** dans une voiture qui freine moins fort.

Un tour qui a glissé au milieu d'un virage (au-delà de 10° de dérive sur asphalte) était au-delà de son adhérence, et non en deçà : il ne lui est jamais dit qu'il avait de l'adhérence en réserve à cet endroit. Et là où l'arrière de la voiture a lâché dans ce tour pour une accélération latérale moindre que celle que le virage demandait, « adhérence en réserve » dit de la trouver par petits pas.

### 6. Maîtrise de la voiture : blocages, patinages, glissades et poussées, chocs et collisions {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Chaque tour est aussi lu pour la façon dont la voiture a été menée - où une roue a bloqué, où les roues motrices ont patiné, où l'arrière a décroché, où l'avant a élargi la trajectoire - car ce sont les erreurs que le temps seul ne nomme pas. Trois choses permettent que cela tienne d'un jeu et d'un sol à l'autre.

**Là où l'adhérence s'arrête est mesuré à partir de la conduite de la voiture elle-même.** Les ingénieurs fixent un seuil de blocage par voiture au glissement qui donne la plus forte décélération (les canaux MoTeC de la série de freinage d'OptimumG utilisent -0,07 pour une voiture), et non une valeur de manuel, et les valeurs de manuel se contredisent de toute façon : la force culmine à 5-20 % de glissement sur asphalte selon le pneu et le modèle, à 6 % ou à 20-60 % sur neige selon la source, et aucune source n'en donne une pour le gravier. Les jeux mettent aussi le glissement à l'échelle différemment : celui de Forza est « normalisé » pour qu'au-delà de 1 l'adhérence soit perdue - pourtant les freins d'une voiture peuvent donner leur meilleur bien en dessous ou bien au-dessus de 1, et des zones de freinage ordinaires peuvent dépasser 1. Donc pour chaque voiture, sur chaque tour chargé d'elle, la force qu'elle a produite est répartie par tranches selon le glissement qu'elle avait - décélération contre le taux de glissement des roues en freinage en ligne droite, accélération (en part de ce que la voiture produit à cette vitesse) contre le glissement des roues motrices, adhérence en virage (en part de l'adhérence de la voiture à cette vitesse) contre l'angle de glissement de chaque essieu - et la limite est le glissement au-delà du meilleur où la force a baissé de 8 %. Une courbe qui ne baisse jamais dans les données - l'adhérence en virage et la traction de Forza Horizon - n'a pas de limite, et le glissement seul n'y signale rien. Avec trop peu de données, la limite est une fois et demie le pic nominal.

**Le sol est connu échantillon par échantillon**, là où le jeu le dit : Forza fait vibrer les pneus sur le gravier, la terre et l'herbe (peu d'échantillons sur un circuit en asphalte, beaucoup sur la terre et les parcours cross), Trackmania nomme le matériau sous chaque roue, et le sol d'une épreuve de rallye se trouve comme l'indique la section 11. Les courbes, les habitudes de dérive et les seuils sont tenus séparés pour l'asphalte et le sol meuble.

**Chaque événement est mis en face de l'autre tour sur les mêmes mètres.** Sur le gravier, sur la neige, dans un jeu d'arcade riche en dérapages, glisser est la façon de passer un virage : des études de commande optimale trouvent des solutions « à faible dérive » sur asphalte et des solutions « agressives, à forte dérive, voire à contre-braquage » hors route, les données de rallye montrent des pneus « bien à l'intérieur de la zone non linéaire », et bloquer une roue sur un sol très meuble peut même arrêter la voiture plus vite. Donc un événement que l'autre tour a aussi fait - 80 % ou plus de ces événements - est la façon de passer le virage, non une erreur, et un événement qu'il n'a pas fait n'est une faute que s'il a coûté du temps : le temps perdu de juste avant jusqu'à 40 m après. Une faute qui explique 40 % ou plus de la perte d'un virage devient la cause de ce virage.

Seuils de détection, test de l'autre tour, chocs et collisions, et textes de conseils : [Événements de maîtrise de la voiture](race-control-events.md).

### 6b. Beaucoup de tours : les statistiques du circuit {#b-many-laps-the-courses-statistics}

Comparaison par classe, ce qui compte comme une erreur, les statistiques et la carte des erreurs : [Statistiques du circuit](race-course-statistics.md).

### 7. La trajectoire parcourue {#the-driven-line}

Pour chaque tour et chaque virage, à partir des seules positions : là où il a commencé à tourner (un cinquième de sa courbure la plus serrée), son rayon le plus serré (sur ±8 m), le rayon moyen sur la première et la seconde moitié de sa variation de cap, et ainsi de suite.

- **forme** : rayon le plus serré sur rayon moyen sous 0,55 est un V, au-dessus de 0,75 un U ;
- **sommet** : rayon de sortie sur rayon d'entrée au-dessus de 1,25 est tardif, sous 0,8 précoce ;
- **sommet de vitesse** : son point le plus lent plus de 15 m avant le point médian de son virage est lent à l'entrée, rapide à la sortie ; plus de 15 m après, il ralentit encore après le milieu.

Face à l'autre tour : de combien il a roulé à l'intérieur ou à l'extérieur à l'entrée en virage, dans la partie la plus serrée et là où les deux étaient à fond, et où chacun est entré en virage. Chaque constat se termine par la trajectoire qui convient à la voiture du tour à ce virage - selon ce vers quoi mène le virage et le rapport puissance / adhérence, l'appui et la transmission mesurés - et par la question de savoir si le tour l'a conduite. La table « Virage par virage » liste le tour le plus rapide à travers chaque virage avec la forme de sa trajectoire, et les meilleurs virages mis bout à bout.

### 8. Deux cartes {#two-maps}

- **Où** : le circuit coloré par `dΔt/ds` contre la référence, rouge là où le temps se perd et vert là où il se gagne.
- **Pourquoi** : chaque perte tracée là où se trouve sa cause, colorée selon le groupe de la cause - freinage, entrée, sortie, ligne droite, voiture - et plus large pour une cause plus coûteuse.

### 9. Replay {#replay}

Une seule horloge, trois façons de la transformer en temps propre de chaque tour : depuis la ligne, alignés (chaque tour atteignant un même point du circuit au même instant, puis relâché) et côte à côte (chaque tour maintenu à la distance de la référence).

### 10. Dans quel sens est le monde {#which-way-round-the-world-is}

Le monde de la visionneuse est droitier, avec Y vers le haut. Un jeu à monde gaucher (Forza en fait partie) y sort en miroir : chaque virage à droite est dessiné comme un virage à gauche, parcours et tours compris. Les tours le disent d'eux-mêmes - la direction positive va à droite dans chaque adaptateur, et la suspension extérieure d'un virage se comprime - si bien que l'onglet d'analyse propose de le corriger, et **Caméra et scène → Inverser un axe du monde** le fait : X, Y ou Z dessiné à l'envers. Seul le dessin change - une réflexion intégrée à la matrice de vue ; la caméra vole dans le monde dessiné, et les données, l'analyse et chaque coordonnée que montrent les outils restent ceux du jeu. L'analyse nomme les virages à gauche ou à droite par la même mesure.

### 11. Rallye : la glissade, le pied gauche, l'air {#rally-the-slide-the-left-foot-the-air}

Une épreuve de rallye n'est pas un circuit conduit avec moins d'adhérence. Sur le gravier et la neige, la glissade est la façon de prendre un virage : la voiture est tournée à l'entrée en déplaçant son poids - « les freins transfèrent le poids de la voiture vers l'avant ... les pneus avant gagnent en adhérence, les pneus arrière en perdent, et la voiture tourne en glissant dans le virage », puis l'accélérateur revient une fois qu'elle est « alignée dans la direction où vous voulez aller » ([DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Le pied gauche fait le freinage pour que l'accélérateur et le frein puissent se jouer l'un contre l'autre, le frein à main fait tourner la voiture dans les virages serrés ([RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), et la voiture quitte le sol. La section 6 lit déjà les glissades face à l'autre tour ; ces règles portent le reste.

- **Le sol.** Ce que dit le tour (`meta.surface`, l'option `--surface` des enregistreurs de rallye), sinon le nom de l'épreuve - les rallyes sur asphalte (Espagne, Croatie, Europe centrale, Allemagne, Japon, Corse, Ypres), les épreuves d'hiver (neige), l'asphalte du Monte avec neige et glace dessus (mixte) - sinon la façon dont la voiture a été conduite. La limite latérale d'une voiture Rally2 est de 0,7 à 0,9 g sur gravier et de 1,3 à 1,4 g sur asphalte ([grenzbereich, valeurs de référence](https://github.com/GitCrush/grenzbereich)), et sur gravier elle va bien plus en dérive (section 6). Donc une épreuve où la voiture a tiré 10 m/s² ou plus (95e centile, à vitesse, sur le sol) avec une dérive médiane sous 6 degrés partout où elle a pris un virage à 70 % de cela ou plus était de l'asphalte ; tout autre cas, ou trop peu pour trancher, est meuble.
- **Ce que la voiture peut faire, sur le sol où elle l'a fait.** L'adhérence, le freinage et la traction (section 5) se mesurent séparément sur asphalte et sur sol meuble quand les tours ont roulé un cinquième ou plus de leurs échantillons sur chacun, et chaque virage est jugé avec le sol sous la voiture à son point le plus lent. Les échantillons en l'air et
pendant 0,3 s après une réception sont exclus de tout ce qui mesure la voiture - enveloppes, courbes de pneus, blocages et patinages : une réception secoue la voiture au-delà de tout ce que ses pneus peuvent faire, et des roues qui patinent en l'air ne sont pas du patinage. L'appui aérodynamique n'est pas jugé sur sol meuble, où les parties rapides et lentes d'une épreuve sont des routes différentes.
- **Un petit coup de pied gauche n'est pas un freinage.** Un léger contact du frein avec l'accélérateur encore à moitié ou plus, sur moins de 15 m, stabilise la voiture ou la fait tourner ; le point où un tour a commencé à freiner pour un virage est le premier freinage sous lequel l'accélérateur a été relâché, ou celui qui a duré davantage.
- **La voiture tournée à l'entrée.** Pour chaque tour et chaque virage, le plus grand angle de dérive entre son freinage et 5 m après son point le plus lent. Sur sol meuble, un tour dont la voiture a été tournée de 8 degrés ou plus de moins que l'autre (qui l'a tournée de 12 ou plus) et qui a remis les gaz ou roulé à plat plus tard, **a moins tourné la voiture** : le conseil est de lever le pied ou de donner un petit coup de frein du pied gauche à l'entrée, pour que l'arrière vienne - avec le point de frein à main de l'autre tour quand il en a utilisé un, ou le frein à main dans un virage plus lent que 54 km/h - et de l'avoir pointée vers la sortie avant le sommet. Celui qui l'a tournée de 12 degrés ou plus de plus que l'autre et qui a quand même remis les gaz plus tard **l'a trop tournée** : il a fallu la redresser avant que la puissance puisse passer. L'un ou l'autre est la cause du virage à la sortie, après une faute de maîtrise de la voiture. Le conseil de trajectoire sur sol meuble dit la même chose pour chaque virage.
- **L'air.** Un saut de 0,2 s ou plus plus long que celui de l'autre tour, qui a coûté du temps de 10 m avant le décollage à 40 m après la réception (ou à la fin du virage), est la cause quand il explique 40 % ou plus de la perte du virage ; et le virage suivant, atteint plus lentement, le dit. En l'air, la voiture ne peut ni tourner, ni freiner, ni accélérer. Le conseil garde l'accélérateur engagé au décollage - « ne levez pas le pied au décollage », ce qui ferait piquer le nez - et passe la bosse un peu plus lentement ou avec un petit coup de frein pour que la voiture reste basse ([DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Complexes d'au plus trois virages.** Une section sinueuse conduite sans jamais être à plat n'est pas un long complexe : au-delà de trois virages, un nouveau commence.

`src/race/rally.test.ts` soumet l'analyse à tout cela sur des épreuves parcourues avec un modèle simple : une voiture moins tournée et des pleins gaz tardifs, un saut plus long, de petits coups de pied gauche, une section sinueuse, asphalte contre gravier.

## Données, et ce que permet chaque source {#data-and-what-each-source-allows}

| Source | Cadence | Canaux | Permet |
|---|---|---|---|
| fichiers de tour FH Companion | ~5 m | position, vitesse, accélérateur, frein, direction, accélérations latérale et longitudinale, rapport | tout, sauf la maîtrise de la voiture, qui a besoin de la télémétrie à côté |
| `.tele.gz` de FH Companion, à côté de chaque fichier de tour | les 64 Hz du jeu (un enregistreur qui garde chaque paquet en écrit environ 110 par seconde ; les répétitions sont supprimées) | tout le Data Out de Forza : par roue, glissement, angle de glissement, glissement combiné, rotation, suspension, vibrations de surface ; vitesse dans le repère de la voiture ; vitesse de lacet | tout, maîtrise de la voiture comprise |
| Forza Data Out, enregistré par `heat3d_capture telemetry` | 60 Hz | tout ce qui précède, plus par roue : température des pneus, glissement, angle de glissement, glissement combiné, débattement de suspension, vitesse de roue, bandes rugueuses ; régime, puissance, couple, vitesse de lacet | tout |
| Assetto Corsa, ACC, AC EVO, AC Rally (mémoire partagée, `heat3d_capture telemetry --game ...`) | 60-333 Hz | un sur-ensemble : température du cœur et des zones intérieure, médiane et extérieure des pneus, pressions, températures de frein, charges de roue, carrossage, glissement et angle de glissement ; vitesse dans le repère de la voiture ; ABS et antipatinage en action (ACC, EVO, AC Rally) | tout |
| iRacing `.ibt`, lu directement | 60 Hz | position par GPS, pédales, direction, g, lacet, température de carcasse par roue, débattement d'amortisseur, pression, usure | tout ; maîtrise de la voiture à partir de l'angle de dérive (son lacet par rapport au sens de déplacement) et de la direction, sans glissement (non enregistré) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | par image ; 100 Hz | position, vitesse dans le monde et axes de la voiture, vitesse de la zone de contact et suspension par roue, pédales, direction, horloge et longueur de l'épreuve | tout ; glissement et angle de dérive déduits |
| Richard Burns Rally (UDP NGP) | par pas de physique | position, vitesses propres de la voiture, débattement et force des ressorts par roue, pédales | tout, sauf le glissement des roues |
| BeamNG.drive (la modification au protocole `heat3d`) | jusqu'à 100 Hz | position, vitesse dans le monde et axes, vitesse de surface par roue, rotation, charge et contact au sol | tout ; glissement et angle de dérive déduits |
| Trackmania (le module Openplanet) | par image | position, vitesses avant et latérale, pédales (frein activé ou non), direction, coefficient de glissement par roue et sol meuble, en l'air | tout ; l'angle de dérive à partir de la vitesse latérale |

Chaque source est transformée en un seul format de tour, `heat3d-lap`, dont les canaux ont des noms canoniques (`speed`, `throttle`, `tireTemp[FL]` ...). Le symbole de voiture et les graphiques dessinent les canaux que possède chaque tour.

## Sources {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections: time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (delta dans le domaine de la distance)](https://github.com/taishiliu25/lap-delta-analyzer)
- [Guide d'analyse de tour iRacing](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry : tours de session](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry : analyser les lignes de course](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut : meilleur temps théorique à partir des secteurs](https://overcut.gg/)
- [Track Titan : comment analyser la télémétrie](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG : indicateurs de blocage au freinage et de stabilité (sept. 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG : à l'accélérateur (janv. 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM : indicateurs de performance clés des pilotes (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Modèles de friction pneu-route et glissement optimal (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB : friction pneu-chaussée, glissement au pic sur neige et glace](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard : coefficients de friction des pneus, pic et glissement](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline : forces longitudinales](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline : forces latérales](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Stabilité des véhicules, limites d'angle de dérive (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Conduite de rallye à fort angle de dérive (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Manœuvres de rallye à temps minimal (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [Vitesse de lacet de référence de l'ESC (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Détection de sous-virage et de survirage par la direction contre le lacet (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC : angle de direction, Ackermann et gradient de sous-virage](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM : voies mathématiques (Kus, g combiné)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta : outil de survirage et sous-virage](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Freinage par cadence : blocage sur surfaces très meubles](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy : enregistrement de données sur épreuves de gravier](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish : comment utiliser les freins](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish : comment sauter avec une voiture de rallye](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario : la conduite de rallye, les bases](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich : dynamique des voitures de rallye, valeurs de référence](https://github.com/GitCrush/grenzbereich)
- [Trackmania, module d'entraînement au glissé (constantes)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania, description du glissé en vitesse](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan : flux de coaching](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan : la ligne en V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (vitesse de sortie contre temps minimal)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving : séquence pour améliorer le temps au tour](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools : les trois types de virages](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61 : prioriser les virages](https://driver61.com/uni/prioritising-corners/)
- [Driver61 : virages différents, techniques différentes](https://driver61.com/uni/different-corner-technique/)
- [Driver61 : les six phases d'un virage](https://driver61.com/uni/corner-phases/)
- [Driver61 : l'adhérence](https://driver61.com/uni/grip/)
- [Skip Barber Racing School : Going Faster (extrait)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley : qu'est-ce qu'une voiture d'élan](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [Le débat élan contre puissance](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Math on the racing line, partie 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, partie 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [Technique en traction avant](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD en virage](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Ligne de course](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary : technique en virage](https://www.formula1-dictionary.net/cornering_tech.html)
- [Vitesse maximale en virage](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Vocabulaire de la télémétrie de course](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Planification de trajectoire à temps minimal globale, avec courbure et distance](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM : optimisation globale de la trajectoire de course](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG : le facteur de roue libre](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Introduction au cercle d'adhérence](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com : diagramme g-g](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Glissement longitudinal](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Sous-virage, aperçu](https://www.sciencedirect.com/topics/engineering/understeer)
- [Sous-virage et survirage](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Documentation Forza Motorsport Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard : accélération limitée par la motricité](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard : accélération limitée par la puissance](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO, mémoire partagée](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [Lecteur de télémétrie AC Rally](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [Lecture des fichiers IBT d'iRacing](https://github.com/teamjorge/ibt)
