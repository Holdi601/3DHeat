---
title: "Profils de voitures et comparaison"
parent: "Analyse de course"
nav_order: 56
lang: "fr"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Profils de voitures et comparaison

Une voiture ne peut freiner, tourner et accélérer qu'à une certaine force. Le visualiseur mesure cette force à partir de vos propres tours, donc il ne vous demande jamais de faire ce que votre voiture ne peut pas faire. Cela permet aussi de savoir quelle part d'une seconde perdue vient de la voiture et non de vous.

![Voitures comparées : deux voitures côte à côte avec leur adhérence, leur freinage et leur motricité](../assets/img/en/race-cars-compared.webp)

L'analyse ne demande à un tour de freiner plus fort, de garder plus de vitesse ou d'accélérer plus tôt que là où sa voiture a montré qu'elle le peut, et elle retire d'une perte ce que les voitures elles-mêmes expliquent. Ainsi, les limites de chaque voiture (son *enveloppe*, plus bas) et son caractère (son *profil*) sont mesurés à partir de chacun de ses tours chargés. Cette page couvre l'enveloppe, le profil, la section **Voitures comparées**, et ce que les voitures décident dans chaque virage.

**Une voiture** = les tours avec le même numéro de voiture (ou le même nom, sans numéro) et le même indice de performance : un réglage différent est une autre voiture.

## L'enveloppe : ce que la voiture peut faire à chaque vitesse {#the-envelope-what-the-car-can-do-at-each-speed}

Par voiture, sur chacun de ses tours chargés, par **tranches de vitesse de 5 m/s** (24 tranches, jusqu'à 120 m/s). Les échantillons en l'air, la stabilisation de 0,3 s après un atterrissage, et de 0,1 s avant chaque contact à 1 s après celui-ci sont laissés de côté, et les accélérations de 80 m/s² ou plus sont ignorées (au-delà de ce que tient toute voiture avec de l'appui aérodynamique).

| Enveloppe | Échantillons | Valeur par tranche | Besoin |
|---|---|---|---|
| **adhérence latérale** | l'accélération latérale **tenue pendant une demi-seconde** (la moyenne de sa valeur absolue sur une fenêtre centrée de 0,5 s), seulement là où la voiture prenait un virage : au moins un tiers du 99e centile de tous ses échantillons | 95e centile | 6 échantillons |
| **freinage** | frein > 0,3 ; l'accélération longitudinale comme la médiane de chaque échantillon et de ses deux voisins | 95e centile de la décélération | 4 échantillons |
| **motricité pleins gaz** | accélérateur > 0,95, frein sous 0,05 ; la même médiane sur trois | 90e centile | 4 échantillons |

Pourquoi tenue pendant une demi-seconde : un trottoir, une glissade qui se rattrape, une voiture qu'on rattrape font monter l'accélération latérale un instant, et une voiture qui le fait souvent paraît plus accrocheuse qu'elle ne l'est. Pourquoi une médiane sur trois : à un espacement de cinq mètres, un échantillon représente une grande distance, et un pic d'un seul échantillon est un trottoir, une bosse ou un mur.

Lire l'enveloppe à une vitesse donnée interpole entre les centres des tranches, et prend la tranche la plus proche qui contient des données lorsqu'une tranche est vide.

**Sur deux sortes de sol.** Lorsque les tours d'une voiture ont roulé sur un cinquième ou plus de leurs échantillons sur l'asphalte et sur le sol meuble, une enveloppe distincte est gardée pour chacun, et chaque virage est jugé avec le sol sous la voiture à son point le plus lent.

**Croisement.** La vitesse à partir de laquelle la motricité décroît comme `1/v` (limitée par la puissance) plutôt que de rester plate (limitée par la traction) : la première tranche dont `a·v` est à 15 % près du plus haut `a·v` observé.

## Le profil : quel genre de voiture c'est {#the-profile-what-kind-of-car-it-is}

`profile`, à partir des mêmes tours (échantillons au sol, non heurtés, plus rapides que 8 m/s) :

| Mesure | Méthode |
|---|---|
| **adhérence tenue** (m/s²) | 95e centile de l'accélération latérale tenue sur une demi-seconde |
| **motricité** jusqu'à 50 km/h, 50-120, 120-200, au-delà de 200 (m/s²) | la moyenne de la motricité pleins gaz de l'enveloppe sur 3-14, 14-33, 33-56 et 56-90 m/s, aux vitesses atteintes par la voiture (jusqu'à sa vitesse maximale + 2 m/s), à partir d'au moins trois paliers de 1 m/s ; et le plus fort qu'elle a montré, et où |
| **freinage** (m/s²) | le freinage de l'enveloppe moyenné de 60 à 160 km/h (16,7-44,4 m/s), la bande que nomme la comparaison |
| **le plus rapide** | la plus haute vitesse atteinte |
| **plafonne à** | là où elle cesse de gagner en vitesse à pleins gaz sur une ligne droite (plus bas) |
| **tire encore à sa vitesse max** | la motricité de l'enveloppe à sa vitesse maximale : ce qu'il lui restait à donner |
| **arrière rattrapé, par tour** | nombre de tours où elle a glissé et il a fallu la rattraper (plus bas) |
| **part à l'accélérateur** | parmi ceux-ci, la part qui a commencé avec accélérateur > 0,5 et sans frein |
| **lâche à** | la médiane de l'accélération latérale tenue 0,15 s avant chaque début de glissade, en part de l'adhérence |
| **au-delà de 10° de dérive, en virage serré** | parmi les échantillons qui prennent un virage à 60 % de son adhérence ou plus, la part qui glisse (10° sur l'asphalte, 20° sur le meuble) ; il faut 30 échantillons |
| **dérive médiane** | sur les mêmes échantillons |
| **équilibre** | angle de dérive avant moins arrière (multiples du pic nominal) là où elle prend un virage serré sans glisser, moyenne d'au moins 30 échantillons : + pousse vers l'extérieur |
| **surface** | au-delà de 80 % d'échantillons meubles : meuble ; sous 20 % : asphalte ; sinon mixte |

**Plafonner.** Un échantillon compte lorsque la seconde qui l'entoure (±0,5 s, au moins 0,9 s de données) était entièrement à pleins gaz (> 0,95, sans frein), au sol, en **ligne droite** (|latérale| sous le plus grand de 4 m/s² et d'un quart de son adhérence), gagnant moins de **0,35 m/s²**, plus vite que 25 m/s et à 90 % près de la vitesse maximale du tour - des pleins gaz dans une côte ou dans un long virage cessent aussi de gagner, bien en dessous de la vitesse de pointe de la voiture. Avec au moins **une seconde** de ce palier sur l'ensemble des tours, la médiane de ces vitesses est là où elle plafonne. Sinon, il n'y a pas de vitesse de pointe : là où aucune ligne droite n'était assez longue, *tire encore à sa vitesse max* dit à quel point elle en était loin. Rien au-delà de ce que montrent les tours : le rapport de boîte et le limiteur mettent fin à la motricité d'une voiture bien avant la traînée.

**Perdre l'arrière.** Compté lorsque le pilote a dû le rattraper : en virage à 60 % de son adhérence ou plus, en glissade (dérive au-delà de 10° sur l'asphalte, 20° sur le meuble), avec le volant (au-delà de 0,06) braqué **à contre** du virage. Le signe de braquage qui va avec le signe de force latérale est mesuré pour chaque tour (échantillons qui tournent sans glisser). Une glissade est comptée une fois jusqu'à ce que la voiture cesse de glisser. Une voiture qu'on conduit un peu de travers exprès ne perd rien ; une voiture qui demande un contre-braquage, si. Compté de la même façon pour chaque voiture, pour que deux voitures puissent être comparées. Il faut du braquage et un angle de dérive.

## Voitures comparées {#cars-compared}

La section de la barre latérale s'appelle **La voiture** avec une seule voiture, **Voitures comparées** avec plusieurs.

**Le tableau** : une colonne par voiture, une ligne par mesure pour laquelle une voiture au moins a une valeur : Adhérence tenue ; Motricité jusqu'à 50 km/h, 50-120, 120-200, au-delà de 200 ; Freinage ; Le plus rapide ; Plafonne à (« tire encore » lorsqu'elle n'a jamais plafonné) ; Tire encore à sa vitesse max ; Arrière rattrapé, par tour ; Au-delà de 10° de dérive, en virage serré. Lorsque les voitures diffèrent de plus de 3 %, la meilleure valeur est marquée (plus haute pour l'adhérence, la motricité, le freinage, les vitesses ; plus basse pour les glissades arrière).

**Une voiture seule** : des phrases sur ce que montrent les tours - l'adhérence qu'elle tient (m/s² et g), sa motricité dans chaque bande, là où elle a cessé de gagner sur les longues lignes droites (ou qu'elle n'a jamais plafonné, et ce qu'elle tirait encore à sa vitesse max), et la fréquence à laquelle son arrière a dû être rattrapé (« presque jamais » en dessous d'une fois par tour, « surtout à l'accélérateur » lorsque 60 % ou plus commençaient là).

**Deux voitures** : pour chaque paire, une phrase chacune sur ce qu'est la voiture par rapport à l'autre (« X accélère mieux, mais ne tourne pas aussi fort, a besoin de plus de distance pour s'arrêter et perd plus facilement l'arrière »), le tableau, chaque différence nette de la plus grande à la plus petite, puis **Comment piloter chacune**. Au-delà de **3** paires, une seule paire est montrée : la voiture du tour sélectionné face à une voiture choisie dans une liste déroulante (par défaut la voiture du meilleur tour de sa classe, sinon celle de la référence, sinon la première autre).

Une différence n'est dite que lorsque les tours la montrent nettement :

| Différence | Dite à partir de | Phrase |
|---|---|---|
| adhérence | **4 %** | « X tient N % d'adhérence en plus dans les virages … cela fait M % de vitesse en plus au milieu de chaque virage » (la vitesse = √ du rapport d'adhérence) |
| motricité | **5 %**, dans la première bande que les deux voitures ont de 120-200, 50-120, au-delà de 200 km/h | « X accélère N % plus fort de 120 à 200 km/h » ; aussi au départ, ou « bien que Y démarre plus fort », lorsque le départ diffère de 8 % |
| vitesse de pointe | **4 km/h** | « X plafonne plus haut : il a cessé de gagner à … » |
| vitesse de pointe, une seule | une voiture a plafonné, l'autre non | « Y a manqué de motricité à … ; X gagnait encore de la vitesse au moment de freiner » |
| vitesse de pointe, aucune | aucune n'a plafonné | ce que chacune gagnait encore à sa vitesse max |
| freinage | **5 %** | « X s'arrête N % plus fort … Y doit freiner plus tôt » |
| perte de l'arrière | au moins une fois par tour de plus **et** une fois et demie plus souvent | « X perd l'arrière plus facilement : elle décroche assez pour demander un contre-braquage N fois par tour contre M … » - surtout à l'accélérateur (60 %+) ou surtout en entrée de virage avec lâcher (30 % ou moins), à partir d'environ P % de son adhérence ; sur le meuble, « une part de cela tient à la façon dont la voiture est tournée ; le rattrapage, non » |
| de travers | **12 points de pourcentage** de virage serré au-delà du seuil de dérive | « X roule plus de travers à la limite » |
| équilibre avant | **0,3** du pic nominal | « X pousse plus à l'avant … Il faut la ralentir et la tourner avant le sommet du virage » |

Les traits du résumé : *tient plus d'adhérence* / *ne tourne pas aussi fort*, *accélère mieux* / *tire moins*, *plafonne plus haut* / *plafonne plus bas*, *tire encore en fin de ligne droite* / *manque de motricité*, *freine plus fort* / *a besoin de plus de distance pour s'arrêter*, *est plus stable* / *perd plus facilement l'arrière* (*glisse beaucoup plus …* à deux fois plus souvent plus un ; *a besoin d'être rattrapée plus souvent* sur le meuble), *pousse à l'avant*. « Peu à distinguer de Y sur ces tours » lorsqu'il n'y a rien.

**Comment piloter chacune :**

- une voiture accroche plus et l'autre tire plus : gardez de la vitesse au milieu sur une ligne large et ronde (le « U ») avec celle qui accroche ; freinez droit, faites pivoter dans un milieu court et serré, puis redressez à la sortie (le « V ») avec celle qui tire fort ;
- une voiture est en retrait sur les deux : son meilleur tour est le plus propre - freinez droit, rayon le plus large, pleins gaz dès que la voiture le tient ;
- une voiture qui perd plus facilement l'arrière : remettez de l'accélérateur seulement au fur et à mesure que le volant se redresse et passez les rapports tôt (les glissades à l'accélérateur), ou relâchez doucement le frein et gardez un accélérateur stable au milieu (les glissades à l'entrée).

L'indication sous la section répète comment chaque mesure est prise.

## Ce que les voitures décident dans un virage {#what-the-cars-decide-in-a-corner}

Lorsque les tours sont dans des voitures différentes, la constatation de chaque virage perdu se termine par **Les voitures :** - ce qui, dans cette perte, relève des voitures, et comment tirer le meilleur de celle-ci (`carNote`) :

- **Au milieu**, lorsque cette voiture tient moins de 96 % de l'adhérence de l'autre, que l'autre allait plus de 0,5 m/s plus vite au point le plus lent, et que ce tour n'était pas loin en dessous de ce que son adhérence explique (au-delà de 70 % de celle-ci) : sur la trajectoire de l'autre voiture, l'adhérence de celle-ci permet `v_autre · √(adhérence_moi / adhérence_autre)`. Si le tour a réalisé cette vitesse (à 1 m/s près), l'écart vient de la voiture, et aucun point de freinage ne le change ; sinon, il reste à gagner une partie de la différence. Puis, là où le temps peut être gagné à la place : sur une ligne droite, entre deux, ou avec une voiture qui tire 5 % plus fort - après le sommet du virage (freiner droit, tourner plus tard, viser la sortie tôt) ; sinon le rayon le plus large que la route permet.
- **Un arrière qui a lâché ici** (une glissade ou un tête-à-queue non partagé, ou une dérive au-delà du seuil de glissade à l'entrée), dans une voiture qui le perd au moins une fois par tour de plus et une fois et demie plus souvent : ce qu'il faut faire avec cette voiture - remettre l'accélérateur au fur et à mesure que le volant se redresse (ses glissades commencent sous la puissance dans 60 % des cas ou plus) ou relâcher doucement le frein sans lever le pied.
- **La ligne droite suivante** : lorsque la motricité des voitures explique 0,03 s ou plus, la motricité plus forte de l'autre voiture à partir de la même vitesse, avec la motricité des deux voitures de 120 à 200 km/h.
- **Vitesse de pointe** : lorsque ce tour a atteint 98 % de l'endroit où sa voiture plafonne sur une ligne droite de plus de 150 m, et que l'autre a roulé 1,5 m/s plus vite : c'est la vitesse de pointe de la voiture, et chaque km/h de plus à la sortie du virage aide encore jusqu'à l'atteindre.
- **Freinage** : lorsque l'autre voiture freine 5 % plus fort et que ce tour a freiné plus de 5 m plus tôt, une partie du freinage plus tôt est due à la voiture.

La part de la voiture est aussi retirée du temps lui-même - voir [la part de la voiture](race-corner-analysis.md#the-cars-share) - et un virage où la voiture explique 60 % ou plus lui est imputé.

## Pour les développeurs {#for-developers}

Code : [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` dans [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` dans [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
