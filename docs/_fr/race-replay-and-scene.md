---
title: "Replay et scène 3D"
parent: "Analyse de course"
nav_order: 52
lang: "fr"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Replay et scène 3D

Rejouez vos tours ensemble, comme une course, et regardez où l'un prend de l'avance. Tout ce que vous voyez dans la vue 3D de l'onglet **Analyse de course** est décrit ici : les trajectoires parcourues, les couleurs peintes sur la piste, les voitures et les étiquettes.

![Carte des causes avec les voitures alignées 40 m avant un virage : piste colorée, deux voitures et le poteau à drapeau](../assets/img/en/race-replay-lined-up.webp)

## L'horloge du replay {#the-replay-clock}

Une seule horloge anime chaque tour : des secondes du tour de **référence**. Le moteur la fait avancer à chaque image pendant la lecture (durée de l'image × vitesse de relecture) ; à la fin, elle revient à 0 quand **Boucle** est activée, sinon elle s'arrête. L'horloge ne fait volontairement pas partie du magasin de données, pour que la barre latérale ne se redessine pas à chaque image ; l'affichage tête haute et les graphiques s'y abonnent et se mettent à jour au plus une fois par image.

**La durée du replay** est le plus long temps que n'importe quel tour occupe sur l'horloge : le temps de chaque tour (moins son décalage dans *Alignées*), ou le temps de la référence dans *Côte à côte*.

## La barre de commande {#the-transport-bar}

Sous la vue, de gauche à droite :

| Commande | Fait |
|---|---|
| ⏮ | retour au départ (aussi **Home**) |
| ▶ / ❚❚ | lecture / pause (aussi **K**) |
| vitesse | 0.25×, 0.5×, 1×, 2×, 4× |
| curseur de défilement | règle l'horloge directement, par pas de 0,01 s |
| horloge | `temps / durée · mètres` : l'horloge en temps de tour, la durée du replay, et le chemin parcouru par la voiture de référence sur le tour de référence |
| *Depuis la ligne* / *Alignées* / *Côte à côte* | le mode de replay (ci-dessous) |
| **Aligner ici** | place chaque voiture là où se trouve la référence maintenant, et continue à partir de là |
| **Boucle** | recommence à la fin (activé par défaut) |
| **Masquer les graphiques** / **Afficher les graphiques** | les graphiques de distance sous la barre |

Les boutons sont désactivés tant qu'aucun tour n'est chargé (un seul tour suffit pour le rejouer ; les comparaisons en demandent deux).

## Modes de replay {#replay-modes}

Comment le temps propre de chaque tour découle de l'horloge :

| Mode | Temps de chaque tour | Ce qui est montré |
|---|---|---|
| **Depuis la ligne** (`start`) | l'horloge elle-même | chaque tour depuis son propre départ : une course entre eux, l'écart grandissant comme il l'a fait en piste |
| **Alignées** (`anchor`) | l'horloge plus le décalage du tour | chaque voiture au même endroit au même instant, puis relâchée - ce qui se passe à partir de ce point, et non depuis le départ du tour |
| **Côte à côte** (`locked`) | le moment où le tour a atteint la distance actuelle de la référence | chaque voiture maintenue à la distance de la référence pendant tout le tour : vitesses et commandes comparées mètre par mètre |

Utilisez-le quand :

- **Depuis la ligne** : vous voulez voir qui est devant et comment l'écart grandit.
- **Alignées** : vous voulez savoir ce qui se passe dans un virage ou sur une ligne droite, avec tout le monde parti à égalité à cet endroit.
- **Côte à côte** : vous voulez comparer ce que font les pilotes avec les pédales et le volant au même endroit du parcours.

**Décalages dans *Alignées* :** pour une ancre à `s` mètres le long de la référence, le décalage de chaque tour est son propre temps à `s` moins le temps de la référence à `s`, les deux lus sur les tours alignés (voir [un seul axe de distance](race-corner-analysis.md#one-distance-axis)). Un tour qui ne couvre pas `s` garde le décalage 0. Choisir *Alignées* parmi les boutons de mode ancre à la distance actuelle de la référence.

Un poteau blanc avec un drapeau (14 m de haut) marque l'ancre en mode *Alignées*.

### Aligner {#lining-up}

| Action | Ancre | Horloge |
|---|---|---|
| **Aligner ici** | là où se trouve la référence maintenant | inchangée |
| Maj+clic sur les graphiques | le mètre cliqué | 1,5 s avant que la référence ne l'atteigne |
| un constat dans *Où progresser*, un badge numéroté sur la piste, une ligne de *Virage par virage* avec un constat | 40 m avant le début de la cause du constat | 1,5 s avant ce point ; puis lecture |
| un événement de maîtrise de la voiture, l'étiquette d'un choc | 40 m avant l'événement | 1,5 s avant ; puis lecture |
| un tour dans les statistiques du circuit | comme son constat ou son événement | comme ci-dessus, avec ce tour examiné |

Regarder un constat le cadre aussi avec la caméra - une sphère centrée sur le milieu de la plage du constat, de rayon le plus grand de 40 m et de la moitié de sa longueur plus 30 m (60 m pour un événement) - sauf si la caméra suit une voiture.

### Caméra qui suit {#chase-camera}

⌖ dans la liste des tours fait suivre cette voiture par la caméra : à 2,5 + 4 × taille de la voiture mètres derrière elle et à 0,9 + 1,1 × taille de la voiture mètres au-dessus, regardant dans le sens de déplacement, inclinée vers le bas sur la voiture, adoucie (20 % du chemin à chaque image) pour ne pas trembler à chaque oscillation. ⌖ à nouveau la libère. La voiture suivie est dessinée un peu plus claire, avec un anneau blanc au sol, et sa fiche est mise en évidence.

## La section Affichage {#the-view-section}

| Commande | Par défaut | Fait |
|---|---|---|
| **Lignes** / **Carte des temps** / **Carte des causes** / **Carte des erreurs** | Carte des temps | ce qui est peint le long de la piste (ci-dessous) ; *Lignes* ne peint rien |
| légende | - | *gagne ↔ perd* pour la carte des temps, les couleurs de causes pour la carte des causes, *peu de tours ↔ la plupart des tours* pour la carte des erreurs |
| **Trajectoires parcourues** | activé | la ligne de chaque tour visible, dans sa couleur |
| **Voitures** | activé | les voitures, et les sources des fiches de l'affichage tête haute |
| **Pneus et suspension** | activé | température des pneus, anneaux de glissement, bielles de suspension et autres symboles par roue, et feux de toit sur les voitures |
| **Étiquettes** | activé | noms de virages, badges numérotés, étiquettes de chocs, étiquettes de virage de la carte des erreurs |
| **Piste d'après les tours** | activé | une surface de route pour un circuit sans modèle extrait (masquée quand un modèle de circuit est chargé) |
| **Toutes les valeurs sur les fiches** | désactivé | chaque canal listé sur chaque fiche de l'affichage tête haute |
| **Formes réelles des voitures** | activé | chaque voiture sous la forme de son équivalent (voir [Les voitures](#the-cars)) ; désactivé : la monoplace ouverte, qui ne cache rien de la télémétrie |
| **Taille des voitures** | 1× | de 1× à 10× par pas de 0,5 ; 1× est la taille réelle de la voiture, aussi longue et large qu'elle l'est dans le jeu. Rien d'autre que ce curseur ne la change |

## Trajectoires parcourues {#driven-lines}

Le chemin de chaque tour visible à travers ses propres échantillons, dans sa couleur, tracé 0,12 m sous la position enregistrée (la position enregistrée d'une voiture est son point de référence, à 0,28 à 0,47 m au-dessus de la route sur les parcours Forza extraits). Un point est gardé tous les 1,5 m ; avec plus de 10 tours visibles, les tours non examinés gardent un point tous les 6 m (chaque sommet part vers le GPU à chaque image).

## Les cartes {#the-maps}

Les trois sont des rubans le long du chemin de **référence**, 0,2 m sous les positions enregistrées, un quadrilatère par pas de grille de 2 m.

### Carte des temps (`where`) {#time-map-where}

Pour le tour examiné : secondes gagnées ou perdues par mètre face au tour auquel il est comparé à cet endroit (le meilleur de sa classe, ou pour la référence le tour le plus rapide, quel qu'il soit, à travers chaque segment), à partir de la variation de l'écart aligné par pas de grille, lissée sur ±10 m. Rouge là où il perd du temps, vert là où il en gagne, gris entre les deux ; l'échelle de couleurs est le 95e centile des valeurs absolues, donc les pics sont écrêtés et la plus grande partie du tour reste dans la plage. 6 m de large.

### Carte des causes (`why`) {#cause-map-why}

Pour le tour examiné : chaque perte est peinte sur la plage où se trouve sa **cause** (et non là où le temps apparaît), colorée selon le groupe de la cause, le constat le plus coûteux l'emportant là où deux se chevauchent. Largeur `3 + 9·√(coût / plus grand coût)` mètres ; là où rien n'a été perdu, une bande grise de 2 m. Le constat sélectionné dans *Où progresser* est peint en blanc.

| Groupe | Couleur | Constats |
|---|---|---|
| freinage | orange | pertes du pilote dans la phase de freinage |
| entrée | magenta | pertes du pilote à l'entrée et au milieu du virage |
| sortie | bleu | pertes du pilote à la sortie |
| ligne droite | jaune | pertes du pilote sur la ligne droite |
| voiture | gris | ce que la voiture explique |
| contexte | gris foncé | la situation (un départ de course face à un tour lancé) |

### Carte des erreurs {#mistake-map}

Le nombre de tours (parmi tous ceux des classes choisies dans les statistiques du circuit) qui ont fait une erreur à chaque mètre - de tout type, ou seulement celui choisi dans les statistiques. Chaque tour ne compte qu'une fois par mètre ; la plage de chaque erreur est élargie de 6 m de chaque côté pour qu'une courte apparaisse. Largeur `3 + 10·(tours / plus de tours)` mètres, et une couleur allant du brun terne à l'orange vif ; bande grise de 2 m là où aucun tour n'a fait d'erreur. Voir [Statistiques du circuit](race-course-statistics.md#the-mistake-map).

## Piste d'après les tours {#track-from-the-laps}

Pour un jeu dont le parcours n'a pas été extrait, une route est dessinée sous les lignes : aussi large que les tours s'étalent autour de la référence (les décalages latéraux à 25 m près comptent) plus 2 m de chaque côté, au moins 4 m de chaque côté de la ligne de référence, lissée sur ±8 points de grille (±16 m), en gris asphalte avec de fines lignes de bord, 0,3 m sous les positions enregistrées. Masquée tant qu'un modèle de circuit est chargé dans **Niveau**.

## Chocs et collisions sur la piste {#hits-and-crashes-on-the-track}

Les chocs et collisions de chaque tour visible (voir [Événements de maîtrise de la voiture](race-control-events.md#hits-and-crashes)) sont marqués à l'endroit où ils se sont produits, chaque fois que les lignes ou les voitures sont dessinées : une étoile en pointe - rouge pour une collision, ambre pour un choc - posée sur un poteau, avec un anneau de la couleur du tour à son pied, à la taille de la voiture (les collisions plus grandes). Quand une voiture passe le moment d'un choc, un anneau de choc s'étend à partir de lui pendant 0,8 s.

## Mode aide {#help-mode}

**?** à côté du sélecteur de langue, ou la touche **?** ou **F1**, affiche une légende de chaque couleur à l'écran, sur les trois onglets ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx), [`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Le choix reste dans ce navigateur.

- **La légende** dans le coin de la vue liste les couleurs de l'onglet et du mode utilisés. Chaque échelle vient de l'endroit où la vue la prend, donc une échelle de chaleur que vous avez modifiée s'affiche modifiée. Sur l'onglet d'analyse de course, seules les couleurs que portent les tours chargés sont listées.
- **La fiche de chaque voiture** reçoit un tableau de ce qui est dessiné sur ses roues, par nom, avec la valeur de chaque roue dans la couleur où elle est dessinée.
- **La voiture examinée** reçoit une étiquette à chaque roue qui dit la même chose, placée à l'extérieur des coins. Masquée quand la voiture est trop petite à l'écran pour qu'elles y tiennent.

## Les voitures {#the-cars}

**Chaque voiture dans sa propre forme**, dans la couleur de son tour et à sa taille réelle. Les formes viennent d'un fichier de voitures, fait une fois sur la machine où tourne le jeu :

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Sans fichier, chaque voiture est dessinée comme **la voiture propre de la visionneuse** de son genre et de son époque : berline, coupé, berline compacte, break, voiture de sport, supercar, muscle car, tout-terrain, pick-up, fourgon ou microcar, chacune en version classique (avant 1980), des années 80 et 90, ou moderne ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Elles sont construites ici à partir de proportions générales : pas de logos, pas de noms de modèles et rien des fichiers d'un jeu quel qu'il soit, si bien qu'elles sont livrées avec la visionneuse. Le genre vient du nom de la voiture, l'époque de l'année qu'il contient ; une voiture sans l'un ni l'autre se déduit de sa classe. Une centaine de générations réelles sont connues par leur longueur, largeur, hauteur et empattement publiés ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts) ; une ligne chacune, arrondies), si bien qu'une BMW Série 3 des années 1990 reçoit la taille et l'allure de cette voiture, toujours sous forme de simple forme, sans insigne ni calandre.

Le fichier de voitures est fait sur votre propre machine à partir de votre propre copie du jeu. Il contient un modèle peu détaillé de chaque voiture, d'environ 900 triangles, avec ses positions de roues (voir [la commande `cars` de l'extracteur](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Charger le fichier de voitures...** dans les réglages de la vue, ou déposer le fichier sur l'onglet d'analyse, le charge ; il reste dans ce navigateur. Il contient les formes du jeu, donc ce n'est pas quelque chose à transmettre, et la visionneuse n'en livre aucun.

La voiture qui remplace celle d'un tour est déterminée à partir de ce qui est chargé à chaque fois, et n'est jamais gardée ; ainsi une voiture sans équivalent aujourd'hui reçoit la sienne dès qu'un fichier plus récent la contient ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)) :

| Voiture du tour | Dessinée comme |
|---|---|
| son numéro figure dans le fichier pour le même jeu | cette voiture-là |
| même marque, et un mot du modèle dans le nom | ce modèle, le plus proche en années |
| même marque, même génération | la voiture de cette marque la plus proche en années |
| autre cas, avec un fichier de voitures | la voiture la plus proche de la même marque s'il en existe une, sinon la même sorte de carrosserie, la plus proche en années |
| une monoplace, d'après son nom | la monoplace ci-dessous |
| aucun des deux premiers cas, et la visionneuse connaît la voiture par sa taille | la voiture propre de la visionneuse à la taille réelle de cette voiture, avec ou sans fichier |
| autre cas sans fichier | la voiture propre de la visionneuse de ce genre et de cette époque |

Ainsi, un tour d'une BMW Série 3 de 1990 d'un autre jeu montre une BMW de cette année à peu près, et une voiture plus récente que le fichier montre sa plus proche parente jusqu'à ce que le fichier soit refait. L'infobulle d'un tour, et la ligne sous la taille des voitures pour le tour examiné, disent sous quelle forme il est dessiné et à quel point c'est proche.

Les voitures propres de la visionneuse ont des vitres sombres. Les modèles d'un fichier de voitures sont d'une seule couleur sur toute leur surface, car le fichier n'a ni peinture ni vitrage pour s'en servir. Les roues, feux arrière, phares et symboles de télémétrie ci-dessous sont dessinés comme sur la monoplace ; la bielle de suspension remonte le long de l'extérieur de la roue, où elle se voit, et les bras de suspension sont omis.

**La monoplace** est une voiture à roues découvertes dans la couleur du tour, si bien que l'avant est évident sous n'importe quel angle et que rien ne cache les roues : caisson, capot moteur, pontons, habitacle avec un casque, arceau, plancher, ailerons avant et arrière ; quatre roues rondes, les avant tournées par la direction (jusqu'à 0,5 rad en butée), chacune sur deux bras de suspension avec fusée, biellette de direction (avant) ou arbre de transmission (arrière), et une bielle de suspension. Le modèle est abaissé de 0,3 m par rapport à la position enregistrée pour que ses roues reposent sur la route, et mis à l'échelle par **Taille des voitures**.

**La carrosserie bouge sur ses ressorts** : quand le tour porte les quatre débattements de suspension, chaque coin s'abaisse de son débattement (exagéré à 0,12 m entre le détente maximale et la compression maximale pour que cela se voie depuis une caméra qui suit), et la caisse s'enfonce, tangue et roule sur le plan passant par les quatre.

**Ce qui est dessiné à partir de la télémétrie** (avec *Pneus et suspension* activé) suit le [tableau des canaux](race-charts-and-hud.md#the-channel-table) :

| Symbole | Vient de | Dessin |
|---|---|---|
| couleur du pneu | `tireTemp` | le pneu lui-même, bleu froid → cyan → vert en fonctionnement → jaune → rouge chaud, sur 40 à 130 °C |
| anneau de glissement | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (le plus grand) | un anneau au sol sous la roue, vert avec adhérence disponible, ambre à 0,66, rouge à 1 (le bord de l'adhérence tel que le jeu le donne) ; discret sous 0,3 |
| barre de suspension | `suspension` (0..1) | la bielle colorée selon le débattement : bleu détendu, blanc au milieu, rouge comprimé |
| lueur de frein | `brakeTemp` (100 à 900 °C) | un disque sur la face extérieure de la roue, du sombre à l'orange |
| bande d'usure | `tireWear` (0..1) | une bande sur le bord de la bande de roulement, blanc neuf → rouge usé |
| barre de charge | `wheelLoad` (0 à 12 000 N) | un poteau à côté de la roue, aussi haut que la charge |

Les feux de freinage (feu de pluie et becquets d'aile) s'allument avec la pédale de frein. Chaque canal `lamp` qui est actif (au-dessus de la moitié de son échelle) allume un feu au-dessus de la prise d'air dans sa couleur : ABS en action, antipatinage en action, DRS, limiteur de vitesse aux stands, frein à main, en l'air.

**Dans une foule** (plus de 10 voitures visibles), les voitures non examinées sont dessinées simplement : caisse, ailes, roues et feu de freinage seulement.

## Étiquettes {#labels}

Accrochées à la piste et placées à chaque image à partir de la projection de la caméra (hors écran ou derrière la caméra, masquées). Avec **Étiquettes** activé :

| Étiquette | Où | Clic |
|---|---|---|
| noms de virages (`T1`, `T2` …) | au sommet de chaque virage sur la référence | - |
| badges numérotés 1 à 5 | les cinq plus grosses pertes du pilote du tour examiné, au milieu de la plage de chaque cause, bordés de la couleur de la cause ; survolez pour le titre et le coût | aligner et rejouer ce constat |
| étiquettes de choc / collision | au-dessus de chaque salve du tour **examiné** : « Collision −45 km/h » / « Choc −12 km/h » ; survolez pour la description complète et le conseil | aligner et rejouer le choc |
| étiquettes de virage de la carte des erreurs (au lieu des noms de virages et des badges, quand la carte est celle des erreurs) | au sommet de chaque virage : « T3 · 5/40 freinage trop tôt » (l'erreur la plus fréquente, tours qui l'ont commise / tours qui ont pris le virage), « T3 · 5/40 » quand un seul type est choisi, « T3 · propre » quand aucun ; survolez pour les pertes du virage et ses cinq erreurs les plus fréquentes | ouvrir ou fermer ce virage dans les statistiques du circuit |

## Mondes en miroir {#mirrored-worlds}

Le monde de la visionneuse est droitier, avec Y vers le haut : vu d'en haut, une voiture dont le sens de déplacement `atan2(dx, dz)` augmente tourne à gauche. Un jeu à monde gaucher - Forza en fait partie - sort en miroir : chaque virage à droite est dessiné comme un virage à gauche, parcours et tours compris.

Les tours le disent d'eux-mêmes ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)) : en parcourant chaque tour de quelques mètres (3 m) à la fois, le virage de son chemin est comparé à la compression de la suspension extérieure (`suspension.FR` moins `suspension.FL`) et, sans suspension, à la direction (positive vers la droite dans chaque adaptateur). Un tour qui tourne moins de π au total ne dit rien ; une preuve compte quand elle dépasse 2 % du virage. Les tours votent ; une égalité donne « impossible à dire ».

Quand le verdict des tours ne concorde pas avec l'inversion actuelle des axes (un nombre impair d'axes inversés dans **Caméra et scène → Inverser un axe du monde**), la section **Tours** le signale sous la liste :

- le jeu est en miroir et rien n'est inversé : « Ces tours tournent à droite là où le parcours est dessiné en virage à gauche … » avec **Inverser X** ;
- des axes sont inversés mais les tours ne sont pas en miroir : « Les axes inversés dessinent ces tours en miroir … » avec **Réinitialiser les axes**.

Seul le dessin change - une réflexion intégrée à la matrice de vue ; les données, l'analyse et chaque coordonnée que montrent les outils restent celles du jeu. L'inversion est gardée dans le navigateur. L'analyse nomme les virages à gauche ou à droite par la même mesure (un monde inconnu est pris pour un monde en miroir, comme celui de Forza).

## Pour les développeurs {#for-developers}

Code : [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Où se trouve une voiture à un instant {#what-a-car-is-at-a-moment}

`stateAt` interpole chaque canal entre les deux échantillons qui encadrent le temps du tour. Les canaux qui sautent (rapport, drapeaux) prennent l'échantillon le plus proche. Un tour terminé se gare sur la ligne.

**Cap.** La direction de déplacement vient de positions espacées de quelques mètres (au moins 2 m de chaque côté, pour qu'une oscillation ne fasse pas tourner la voiture). Le cap de la caisse ne vient du lacet du jeu que lorsqu'il est ajusté au sens de déplacement - signe et décalage, par moyenne circulaire sur les échantillons plus rapides que 10 m/s (au moins 20) - et seulement s'il concorde ensuite avec lui (variance circulaire sous 0,05, environ 18° de dispersion) ; sinon la caisse pointe dans le sens de déplacement. Cela garde une glissade visible (caisse et trajectoire écartées) sans faire confiance à la convention d'angle d'un jeu.

**Direction et côtés.** Dans quel sens une direction positive fait tourner la voiture, et de quel côté se trouvent les roues droites du jeu, se mesurent sur le tour : la direction par rapport au virage de la trajectoire, et la suspension de quel côté se comprime à l'extérieur des virages (sans données de suspension, les jeux Forza sont pris pour des mondes en miroir).
