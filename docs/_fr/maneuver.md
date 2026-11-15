---
title: "Manœuvres"
parent: "Observations"
nav_order: 4
lang: "fr"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manœuvres : comment les groupes se déplacent

**Observations → Manœuvres** suit la façon dont les unités de chaque camp se déplacent *en groupes* et nomme les manœuvres qu'elles font : un débordement, une tenaille, une percée, une embuscade, un repli, une défense contre missiles, le franchissement en T. Pour chacune, il indique le degré de certitude, les chiffres qui la fondent, si elle a payé, et ses parallèles dans la doctrine et l'histoire. **Analyse de masse → Manœuvres** les compte sur des milliers de parties : à quelle fréquence chacune est faite par carte, mode et camp, et à quelle fréquence elle paie.

Tout est calculé dans votre navigateur, dans son propre worker (`src/insights/maneuver`). Une partie de quelques centaines d'unités prend 10 à 500 ms, une guerre aérienne de deux heures avec des milliers d'objets environ une seconde.

## Utilisation {#using-it}

- Ouvrez **Observations**, onglet **Manœuvres**. Le calcul se fait à la première ouverture ; cliquez sur **Chercher à nouveau** après avoir changé les filtres.
- **Sûre / Probable / Possible** fixe le niveau de confiance affiché (Probable par défaut).
- La **frise chronologique** a une voie par camp et une barre par manœuvre ; la **liste** en dessous montre la même chose, par ordre de temps. Un clic passe au replay à son début, déplace la caméra là-bas et la dessine en 3D : le chemin de chaque groupe est une flèche (les deux bras d'une tenaille sont ses arcs), les contours des groupes au moment clé (celui de l'ennemi dans la couleur de son camp), le front ennemi est une ligne blanche. **Tout dessiner en 3D** ajoute les autres manœuvres de la partie, en pâle. Les lignes sont envoyées à la carte graphique une seule fois, quand le choix change, et non à chaque image : avec 480 manœuvres dessinées pendant la lecture, les temps d'image sur une vraie carte graphique (WebGL2 et WebGPU, p99 18,0 à 18,5 ms, max 19,5 à 20,8 ms) sont les mêmes qu'avec les lignes absentes.
- Une manœuvre ouverte montre son résultat (les éliminations et les pertes des unités qui l'ont faite, pendant qu'elle se déroulait et juste après, comparées à l'échange de leur camp sur toute la partie), ses preuves, et les entrées de la base de connaissances qui s'y rapportent : la doctrine et les parallèles historiques (Cannes pour une tenaille, Sedan 1940 pour une percée, Tsushima pour le franchissement en T, l'opération Bolo pour une feinte...).
- Le petit tableau à la fin : par sorte et par camp, faites et payantes.

![Une tenaille sur la partie de démonstration synthétique : les flèches des deux bras, le corps ennemi et son front](../assets/img/en/maneuvers.webp)

## Comment les groupes sont trouvés {#how-groups-are-found}

Chaque unité est placée sur une chronologie commune (un pas de 1 s à pied, 2 s sinon, plus long pour les très gros fichiers), gardée immobile à sa mort pour qu'une réapparition ne trace pas de ligne sur la carte. À chaque pas, les unités d'un camp et d'une sorte (avions, véhicules, navires, infanterie) sont reliées quand elles sont proches — 18 m à pied, 170 m pour les véhicules, 3 km pour les navires, 5 km pour les avions — et qu'elles bougent de la même façon (vitesses à moins de la moitié de la plus rapide, ou toutes à l'arrêt). Un groupe garde l'identifiant du groupe où se trouvaient la plupart de ses membres. Une unité sans classe est mise à pied, en véhicule ou en l'air selon sa vitesse.

La **forme** d'un groupe se lit par rapport à son cap : une colonne ou une ligne selon ses écarts en long et en travers, un coin quand le milieu mène, un échelon quand les membres reculent d'un côté, une boîte quand ils tiennent les coins.

Tout est jugé à l'échelle propre de la partie : la **portée d'engagement** `R` est le 75e centile de la distance entre un tueur et sa victime (borné au sens du domaine), et les durées d'une manœuvre varient selon la sorte d'unité (l'infanterie a un tiers du terrain).

## Ce qu'elle trouve {#what-it-finds}

| Manœuvre | Trouvée quand |
|---|---|
| Formation | un groupe garde une seule forme pendant 60 % de ses pas en mouvement, pendant 30 s |
| Attaque frontale | un groupe se rapproche de hors de portée jusqu'au contact, ¾ R ou plus, depuis moins de 35° de la direction où l'ennemi fait face |
| Attaque de flanc | la même chose de 50 à 130° (l'arrière au-delà) ; sûre seulement avec une *force de fixation* amie qui combat l'ennemi là (éliminations dans les deux sens) |
| Tenaille | deux attaques de flanc d'un camp sur le même corps ennemi, de côtés opposés (100° ou plus d'écart), dans les 90 s ; sûre quand les bras combattent |
| Encerclement | un groupe ennemi compact avec au moins autant de l'autre camp autour de lui dans 1,5 R, venant de deux groupes ou plus, sans trou de plus de 100°, pendant une minute, coupé de son propre camp ; sûr quand l'anneau s'est refermé de ½ R et a combattu la poche |
| Percée | un groupe passe une ligne tenue (des ennemis immobiles 30 s à sa gauche et à sa droite, le centre de leur camp au-delà) ; sûre quand il va ½ R plus loin, y reste 20 s et y combat ; une percée est un R de plus au-delà |
| Progression par bonds avec appui | dans un petit groupe, une partie avance pendant que le reste reste immobile, les rôles changeant quatre fois ou plus, avec un tir de couverture de la partie immobile |
| Concentration / dispersion | la part d'un camp près de son point le plus dense monte de 35 % à 60 % (des unités arrivent à 1,5 R ou plus, puis le contact) — ou baisse quand le camp s'éparpille |
| Feinte | un petit élément au contact attire deux ennemis ou plus d'ailleurs ; un groupe plus gros frappe alors à quatre portées, là où l'ennemi a moins de monde |
| Repli / poursuite | un groupe au contact se détourne et ouvre R depuis l'endroit où il combattait ; sûr quand un ennemi là venait de tuer l'un des siens et que le groupe s'est mis à 2 R de ce tueur (jamais à pied : voir plus bas) ; les ennemis qui vont dans le même sens et suivent poursuivent |
| Défense en profondeur | des unités à l'arrêt dans deux ceintures ou plus, en travers de l'axe de l'ennemi, à R de profondeur, l'ennemi qui arrive, le feu venant des ceintures |
| Défense à contre-pente | trois éliminations ou plus à courte portée par des unités à l'arrêt, contre des victimes venues par-dessus une crête |
| Embuscade | un groupe en mouvement rencontre des ennemis restés immobiles 45 s ; ils tirent les premiers et les mobiles perdent deux unités ou la moitié du groupe |
| Écran | une ou deux unités qui avancent devant un corps de trois unités ou plus, rencontrant l'ennemi en premier |
| Lignes intérieures | les groupes d'un camp sont proches les uns des autres entre ceux de l'autre, ses unités passant de l'un à l'autre |
| Tempo | un camp répond au contact (virage, changement de vitesse, premier tir) 1,5 fois plus vite, p de Mann-Whitney inférieur à 0,05 |
| Crank, notch, drag, pump | la cible d'un tir de missile fait tourner le tireur de 35 à 70°, de 75 à 105°, au-delà de 140°, ou le tire et revient en arrière |
| Tenaille aérienne, mur, lead-trail, grinder | une paire qui se scinde sur un même ennemi ; trois de front face à l'ennemi ; un élément 5 à 20 km derrière un autre ; deux qui tournent autour d'un même point, séparées d'un point |
| Patrouille aérienne de combat | des orbites autour d'une station pendant trois minutes |
| Combat en énergie / en angles | dans un combat rapproché — caps à 30° l'un de l'autre, chacun tenant l'autre sur son nez à tour de rôle, ou une élimination entre eux — altitude utilisée et montée, ou à plat en virant fort tout en ralentissant ; sûr quand l'un a tué l'autre |
| Paquet d'attaque, SEAD | un groupe aérien aux rôles mêlés, dont certains frappent au sol ; les éliminations de la défense aérienne avant la plupart des autres tirs au sol |
| Ligne de bataille, franchissement en T | trois navires en colonne ; une colonne qui se place en travers de la tête d'une colonne ennemie |

Chaque manœuvre indique quels **schémas** de la base de connaissances elle montre (`patterns-maneuver.ts` : formation, attaque frontale, double enveloppement, encerclement, percée, feu et mouvement, feinte, repli, poursuite, défense en profondeur, écran, dispersion, défense contre missiles, combat en angles, patrouille aérienne de combat, paquet d'attaque, ligne de bataille, franchissement en T) et les entrées à lire en premier ; les anciennes entrées reportent les nouveaux schémas par `knowledge/maneuver-tags.ts`. Voir [Le prisme de connaissances](knowledge.md).

**Payante** compare l'échange des unités pendant son déroulement (et une minute après) avec celui de leur camp sur toute la partie ; un repli paie quand il perd moins d'unités après s'être retourné qu'avant, une défense contre missiles quand l'avion survit une minute, un encerclement quand la poche perd la moitié de ses forces.

## Sur plusieurs parties {#over-many-matches}

Le résumé de chaque partie (`src/mass/summarize.ts`, voir [Analyse de masse](mass-analysis.md)) contient une petite section `maneuvers` : par sorte et par camp, faites (au niveau Probable ou plus), payantes, non payantes, éliminations et pertes. **Analyse de masse → Manœuvres** les additionne sur les parties retenues par le filtre — par carte et mode, ou sur toutes — avec l'intervalle de Wilson du taux de réussite ; une ligne charge les parties où elle a été faite. Les résumés écrits avant l'existence de cette section n'en ont pas : lancez `node tools/3dheat-summarize.mjs <dossier> --force` pour l'ajouter.

## Son degré de certitude {#how-sure-it-is}

Des parties synthétiques avec des manœuvres posées (`synth.ts`, lancées par `maneuver.test.ts`) : les 28 sortes posées sont toutes trouvées au niveau Probable ou plus ; sur 50 manœuvres signalées, 31 sont de la sorte posée et les 19 autres sont bien là aussi (la formation du groupe en mouvement, l'approche frontale de la colonne qui perce) ; aucune n'est fausse. Sur 30 parties nulles — des marches aléatoires séparées et mêlées, des unités immobiles au hasard, des avions en ligne droite, une foule qui tourne sur elle-même — rien n'est signalé au niveau Probable ou plus.

Sur des données réelles (des dizaines de batailles terrestres, quelques longues missions de guerre aérienne, une douzaine de parties de tir) : attaques frontales, flancs, percées et encerclements dans les batailles de chars, formations et combats rapprochés dans les airs, défenses contre missiles, orbites de patrouille et paires lead-trail dans les missions de guerre aérienne, exécutions frontales, colonnes et quelques embuscades et paires à bonds dans les jeux de tir. Les seuils sont les formes de la doctrine à l'échelle du jeu : lisez une trouvaille avec ses preuves, et le taux du tableau de masse avec son intervalle.

### Contre des modèles nuls des mêmes parties {#against-null-models-of-the-same-matches}

Un détecteur peut être trompé par le terrain et la foule : dans une mêlée, chaque groupe a des ennemis tout autour. Chaque sorte est donc aussi lancée sur des **modèles nuls** construits à partir des mêmes parties (`nulls.ts`), où les camps ne se rencontrent plus comme avant : la chronologie d'un camp tournée d'un tiers à deux tiers de la partie (*décalage*), ou ses trajectoires tournées autour du centre de la carte (*rotation*) ; et les étiquettes d'équipe mélangées (*équipes*, qui garde par construction environ la moitié des vrais combats). Les combats ne sont comptés que comme des éliminations appariées à leur mort, le tueur à moins de 2 R et la victime à l'endroit — un modèle nul brise ces appariements. Trouvailles au niveau Probable ou plus, réelles contre les modèles nuls (30 batailles de chars ; 12 parties de tir) :

| Sorte | Batailles de chars : réel / décalage / rotation | Tir : réel / décalage / rotation |
|---|---|---|
| Encerclement | 0 / 0 / 0 (était 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Percée | 0,03 / 0,02 / 0,05 (était 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Flanc | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Attaque frontale | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Repli | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (donc jamais sûr à pied) |
| Embuscade | - | 0,17 / 0,04 / 0,04 |
| Combat en énergie | 1,2 / 0,1 / 0,85 | - |
| Combat en angles | 0,6 / 0,07 / 0,3 | - |

Les combats aériens rapprochés au centre d'un champ de bataille survivent à un virage autour de ce centre : la colonne de rotation les flatte donc moins qu'elle ne flatte les sortes terrestres. Les sortes à l'intérieur d'un même camp — formation, patrouille aérienne de combat, grinder, paquet d'attaque, SEAD, bonds, écran — ne dépendent pas de l'autre camp et ne sont pas testées ainsi. `maneuver.test.ts` vérifie que les modèles nuls suppriment le flanc, la tenaille, l'encerclement, la percée, l'embuscade et le repli posés dans les parties synthétiques.

## Limites {#limits}

- Les groupes ont besoin de positions dans le temps ; un fichier d'événements seul n'en a pas.
- L'orientation n'est pas lue dans les données : le front de l'ennemi est l'endroit où la force de fixation l'engage, sinon où il se déplace, sinon d'où venait l'attaquant.
- Le terrain est lu d'après les hauteurs propres aux unités (la contre-pente) ; il n'y a pas de test de ligne de visée.
- Les très gros fichiers sont échantillonnés à des pas plus longs ; les courtes manœuvres aériennes y sont tout de même lues à partir de pas de 2 à 4 s.
