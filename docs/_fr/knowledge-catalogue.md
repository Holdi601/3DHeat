---
title: "Catalogue des connaissances"
parent: "Le prisme de connaissances"
nav_order: 2
lang: "fr"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Catalogue des connaissances

Voici la liste complète de ce que le [prisme de connaissances](knowledge.md) connaît : les schémas qu'il recherche, les idées, méthodes, cas historiques et études qu'il cite, ainsi que les livres et articles sur lesquels ils reposent. Utilisez-la pour retrouver une entrée par son identifiant ou pour vérifier une source.

Cette page est générée à partir de la base de connaissances par `node tools/knowledge-doc.mjs` ; ne la modifiez pas entre les marqueurs.

<!-- kb:begin -->

La base de connaissances compte 579 entrées (135 concepts, 37 méthodes, 277 cas historiques, 17 principes de conception, 113 études), réparties en 93 schémas, et cite 556 références.

### Schémas (93) {#patterns-93}

| id | famille | à quoi cela ressemble dans les données |
|---|---|---|
| `concentration` | force | Le camp qui amène plus d'unités en un même lieu gagne ce lieu bien au-delà de ce que ses seuls effectifs expliquent. |
| `local-superiority` | force | Les frags vont au camp qui est en supériorité numérique dans la portée d'engagement, quels que soient les totaux. |
| `attrition` | force | Les pertes suivent les forces des deux camps au fil du temps ; le combat est décidé par celui qui s'épuise en premier. |
| `exchange-ratio` | force | Le nombre de frags par perte varie fortement selon le lieu, le camp ou la classe. |
| `aimed-fire` | force | Les pertes augmentent avec le nombre des ennemis, mais pas avec le sien. |
| `area-fire` | force | Les pertes augmentent avec le produit des effectifs des deux camps : l'entassement est puni. |
| `defeat-in-detail` | force | Un camp est détruit morceau par morceau, à mesure que ses éléments arrivent un à un. |
| `mutual-support` | force | Une perte reçoit vite une réponse d'un coéquipier proche : ce sont des échanges. |
| `combined-arms` | force | Les classes réussissent ensemble lorsque chacune couvre la faiblesse de l'autre, et échouent seules. |
| `class-counter` | force | Une classe gagne de façon disproportionnée contre une autre classe précise ou dans un lieu précis. |
| `initiative` | force | Celui qui marque le premier dans un engagement tend à le gagner. |
| `key-terrain` | terrain | Les mêmes quelques lieux décident des combats, partie après partie. |
| `fields-of-fire` | terrain | Les lieux qui voient loin sur le terrain que les autres doivent traverser font plus de frags. |
| `high-ground` | terrain | Les frags sont faits depuis une position plus haute que le terrain où se tiennent les victimes. |
| `cover` | terrain | Les morts par temps diminuent là où la géométrie bloque la vue et les tirs. |
| `open-ground` | terrain | Les morts par temps augmentent là où rien ne bloque la vue et les tirs. |
| `kill-zone` | terrain | Les morts se concentrent là où le mouvement est forcé à passer par un terrain observé et couvert par le feu. |
| `chokepoint` | terrain | Beaucoup de passages sont resserrés sur peu de terrain, avec des pertes à cet endroit. |
| `reverse-slope` | terrain | Une sécurité juste derrière une crête ou un mur, hors de la vue directe de l'ennemi. |
| `safe-ground` | terrain | Un lieu où l'on passe du temps mais où l'on meurt peu. |
| `obstacle` | terrain | Les routes contournent le terrain bloqué et se réduisent à quelques voies. |
| `flank` | mouvement | Une route peu utilisée mène à plus de frags que les routes principales. |
| `avenue-of-approach` | mouvement | Le mouvement suit quelques voies entre les zones. |
| `mobility` | mouvement | Les unités en mouvement meurent moins (ou plus) par temps que les unités lentes ou immobiles. |
| `static-exposure` | mouvement | Les unités à l'arrêt meurent davantage par temps que celles qui se déplacent. |
| `interior-lines` | mouvement | Un camp qui dispose de routes courtes entre ses combats déplace sa force plus vite que l'autre. |
| `envelopment` | mouvement | Les frags viennent de plusieurs directions sur la position d'un camp. |
| `ambush` | mouvement | Les unités qui suivent une route meurent vite face à des ennemis déjà en place. |
| `spawn-pressure` | temps | Les vies se terminent peu après leur début, à un point d'apparition donné. |
| `tempo` | temps | Le camp le plus rapide arrive au combat et marque avant que l'autre ne réagisse. |
| `surprise` | temps | Les pertes arrivent en rafale, avant que les victimes ne puissent riposter. |
| `energy-advantage` | air | Les tireurs ont plus d'altitude et de vitesse que leurs victimes. |
| `air-superiority` | air | Les avions d'un camp font plusieurs fois plus de victimes qu'ils n'en perdent. |
| `sead` | air | Les défenses sol-air prennent beaucoup d'avions jusqu'à ce qu'elles soient repérées et détruites. |
| `bvr` | air | Les frags ont lieu à longue portée, avant que la victime ne puisse se rapprocher. |
| `fleet-salvo` | mer | Une force qui frappe la première perd peu ; l'autre survit peu pour riposter. |
| `scouting` | mer | Le camp qui trouve l'autre en premier choisit le combat. |
| `urban-close` | urbain | Portées d'engagement courtes, beaucoup de morts dans une géométrie dense, nettoyage lent. |
| `vertical` | urbain | Des frags tirés depuis les étages supérieurs ou les toits sur les rues. |
| `skill-dispersion` | personnes | Quelques joueurs représentent une grande part des frags ou des morts. |
| `ai-vs-player` | personnes | Les unités pilotées par l'IA ne se comportent pas comme des joueurs au même endroit. |
| `balance` | conception | Les camps, les points d'apparition ou les classes partent avec des chances inégales. |
| `economy` | conception | Les ressources gagnées, dépensées et perdues se concentrent sur quelques lieux ou joueurs. |
| `flow` | conception | La façon dont les joueurs se déplacent dans le niveau : boucles, voies, impasses. |
| `sightlines` | conception | Les longues lignes de vue décident où commencent les combats et qui les gagne. |
| `readability` | conception | Des morts que les joueurs ne voient pas venir : par derrière, depuis un endroit hors de vue. |
| `formation` | mouvement | Les unités d'un camp avancent ensemble selon une forme reconnaissable : ligne, colonne, coin, échelon, carré. |
| `frontal-assault` | mouvement | Un groupe fond sur l'ennemi droit devant lui, face à son front. |
| `double-envelopment` | mouvement | Deux groupes frappent les deux flancs d'un même corps ennemi à peu près en même temps. |
| `encirclement` | mouvement | Un groupe ennemi se retrouve encerclé par l'autre camp, avec peu de sorties. |
| `penetration` | mouvement | Un groupe traverse la ligne ennemie alors que des ennemis se tiennent des deux côtés. |
| `fire-and-maneuver` | mouvement | Une partie du groupe se déplace pendant que le reste reste en place et couvre, et les rôles alternent. |
| `feint` | mouvement | Un petit groupe attire l'ennemi vers un endroit ; l'effort principal frappe ailleurs peu après. |
| `withdrawal` | mouvement | Un groupe au contact se retire et augmente la distance avec l'ennemi. |
| `pursuit` | mouvement | Un groupe suit un ennemi qui s'éloigne, en gardant ou en réduisant la distance. |
| `defence-in-depth` | terrain | Les défenseurs tiennent plusieurs lignes l'une derrière l'autre, le long de l'axe d'avance de l'ennemi. |
| `screening` | mouvement | Un petit élément avance loin devant son corps principal et rencontre l'ennemi en premier. |
| `dispersion` | force | Un camp se disperse avec le temps ; moins de ses unités partagent un même lieu. |
| `missile-defence` | air | Les avions menacés par un missile tournent la menace vers le côté ou la queue : crank, notch, drag, pump. |
| `angles-fight` | air | Combat tournoyant à courte portée, à faible vitesse et fort taux de virage, mené pour la position du nez plutôt que pour l'énergie. |
| `cap` | air | Les avions tournent autour d'un point fixe pendant des minutes, en attendant que l'ennemi vienne. |
| `strike-package` | air | Des avions de rôles différents volent ensemble vers une cible ; certains attaquent le sol, d'autres les couvrent. |
| `line-of-battle` | mer | Les navires font route en colonne, l'un derrière l'autre, pour que toutes les bordées soient utilisables. |
| `crossing-the-t` | mer | Une colonne passe en travers de la tête de la colonne ennemie : toutes ses pièces tirent, peu de celles de l'ennemi. |
| `fatal-funnel` | urbain | Les joueurs qui entrent par une même porte, pièce ou passage meurent là dans les instants qui suivent bien plus souvent qu'ailleurs. |
| `crossfire` | force | Les défenseurs dont les lignes de tir convergent sous des angles différents gagnent plus de duels qu'un seul défenseur. |
| `peeker-advantage` | temps | Le joueur qui entre dans le champ de vue gagne les duels contre celui qui tient l'angle plus (ou moins) souvent que la moitié des fois. |
| `entry` | temps | Le premier frag d'une manche décide d'une grande part de la manche ; les entrées gagnent ou perdent selon le lieu et le soutien. |
| `utility-support` | force | Un flash ou une fumée juste avant un duel change qui le gagne. |
| `man-advantage` | force | Les manches sont gagnées par le camp qui a le plus de joueurs en vie, et certains camps transforment ou gaspillent un avantage. |
| `clutch` | personnes | Les derniers joueurs en vie gagnent plus (ou moins) souvent que ne le prévoit l'état de la manche. |
| `action-value` | personnes | Les frags, les échanges, les poses de bombe et l'utilité ne changent pas tous autant la chance de gagner. |
| `lurk` | mouvement | Un joueur seul, loin de son équipe, fait des frags (ou meurt) à un rythme différent de celui du groupe. |
| `rotation` | mouvement | La vitesse à laquelle un camp déplace ses joueurs vers le combat ou l'objectif décide s'il tient ou reprend. |
| `collective-order` | personnes | Les unités en mouvement d'un camp se dirigent dans le même sens bien plus souvent que ne le ferait le hasard, si leurs trajets étaient décalés dans le temps. |
| `milling` | personnes | Les unités d'un camp tournent autour d'un centre commun : rotation sans déplacement net. |
| `herding` | personnes | Les unités quittent un lieu comme le coéquipier qui les précède l'a fait, au-delà des chances propres à ce lieu et au-delà de la simple imitation de l'ennemi. |
| `lane-formation` | personnes | Les flux opposés restent sur des voies séparées ; le mouvement se concentre sur quelques sentiers réutilisés partie après partie. |
| `crowding` | personnes | La vitesse et le flux baissent quand les unités se resserrent ; à travers un goulot, pousser plus fort fait passer moins de monde. |
| `leadership` | personnes | Certaines unités se tournent les premières, et d'autres copient leur cap quelques secondes plus tard. |
| `cohesion` | personnes | Les unités qui s'écartent de leur groupe meurent plus souvent que celles qui restent avec lui. |
| `breaking-point` | personnes | Un camp qui a perdu une part de sa force cesse de se rapprocher et recule, au-delà de ce que sa distance à l'ennemi explique. |
| `panic` | personnes | Sous une menace soudaine, les unités se dispersent, s'enfuient ou se figent, et la coordination s'effondre. |
| `loss-chasing` | personnes | Après une perte, les unités prennent plus (ou moins) de risques qu'après un gain. |
| `hot-hand` | personnes | Un succès en appelle un autre plus souvent que ne le permettent des séquences mélangées du même joueur. |
| `conformity` | personnes | Les membres d'un camp font les mêmes choix - achats, équipements, routes - au-delà de leurs propres préférences. |
| `suppression` | personnes | Un feu reçu modifie la façon dont les unités se déplacent et tirent, même s'il ne tue pas. |
| `social-loafing` | personnes | L'action par tête baisse à mesure que les coéquipiers sont plus nombreux. |
| `mixed-strategy` | personnes | Des choix qui devraient être imprévisibles deviennent réguliers : une option gagne plus souvent, ou les choix s'enchaînent en séquences. |
| `coordination` | personnes | Les membres agissent de concert sans ordres visibles : mouvements, timing et choix synchronisés. |
| `contagion` | personnes | Un état passe d'une unité à l'autre par contact ou proximité et se répand sur la carte. |
| `territoriality` | personnes | Les unités gardent leurs distances entre elles et tiennent leur propre terrain. |
| `interaction-network` | personnes | Qui combat, soutient et suit qui forme un réseau avec des centres, des groupes et des ponts. |

### Concepts (135) {#concepts-135}

| id | titre | prismes | schémas | sources |
|---|---|---|---|---|
| `concept.lanchester-square` | Loi carrée de Lanchester (tir ajusté) | military, air, naval, esports | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Loi linéaire de Lanchester (tir de zone, un contre un) | military, urban, esports | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Concentration des forces (masse) | military, air, naval, esports | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Rapports de forces et règle des 3:1 | military | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Rapport d'échange des pertes | military, air, esports, design | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Puissance de combat et ses multiplicateurs | military | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Le système moderne d'emploi des forces | military | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | La boucle OODA (observer-orienter-décider-agir) | military, air, esports | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Théorie énergie-manœuvrabilité | air | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Manœuvres de base des chasseurs et manœuvres de combat aérien | air | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Analyse du terrain : OAKOC / KOCOA | military, design, urban | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC : variables de mission | military | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Terrain clé et terrain décisif | military, design, esports | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Observation et champs de tir | military, design, esports, urban | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Couvert et camouflage | military, urban, design | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Axes d'approche et corridors de mobilité | military, design | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Goulots et défilés | military, design, esports | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Zones d'engagement et zones de mise à mort | military, urban, design | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Défense en contre-pente et défilement | military, design | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Les hauteurs | military, design | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Lignes intérieures et extérieures | military | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Défaite par morceaux | military, esports | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Soutien mutuel | military, air, esports | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Armes combinées | military, design | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Neutralisation (suppression) | military, urban | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Neutralisation et destruction des défenses aériennes ennemies (SEAD/DEAD) | air, military | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Patrouille aérienne de combat et supériorité aérienne | air | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Engagement hors de portée visuelle | air | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | L'approche indirecte | military, esports, design | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Enveloppement et encerclement | military | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Embuscade | military, esports, design | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Défense en profondeur | military | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Friction et brouillard de guerre | military, esports | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Point culminant de l'attaque | military | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Surprise | military, air, naval, esports | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Économie des forces | military, esports | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Terrain urbain | urban, military, esports | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Maîtrise de la mer et bataille navale décisive | naval | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Modèle de salves de Hughes : attaquer efficacement en premier | naval, air | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Théorie de la recherche et de la détection | naval, air, military | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Recherche opérationnelle : mesures d'efficacité | military, air, naval, design | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Le wargaming comme analyse | military, design | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Guerre de manœuvre | military, esports | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Cohésion et facteur moral | military | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Centre de gravité | military | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Points décisifs | military, esports | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Lignes d'opération | military | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Stratégies d'anéantissement et d'épuisement | military | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Bataille en profondeur et opérations en profondeur | military | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | military, air | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Commandement par mission (Auftragstaktik) | military, esports | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Percée et exploitation | military | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Feu et mouvement | military, esports | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Progression par bonds couverts (bounding overwatch) | military, esports | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Attraction par la reconnaissance et infiltration | military, esports | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | La réserve | military, esports | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Défense élastique et contre-attaque | military | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | La chaîne de destruction (trouver, fixer, suivre, cibler, engager, évaluer) | military, air, naval | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Portée de détection contre portée d'engagement | air, naval, military | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Valeur d'efficacité au combat | military, esports | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Dispersion sur le champ de bataille | military, esports | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Appui aérien rapproché | air, military | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Interdiction aérienne | air, military | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Escorte contre balayage de chasse | air | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Combat d'énergie contre combat tournoyant | air | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Poursuite en avance, pure et en retard | air | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Le weave de Thach | air | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Le finger-four et la paire de combat | air | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Flotte en puissance (fleet in being) | naval | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Franchir le T | naval, military | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Convoi | naval | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Interdiction d'accès et déni de zone (A2/AD) | naval, air, military | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Défense en points d'appui dans les zones bâties | urban, military | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Passage par les bâtiments (mouseholing) et déplacement dans les immeubles | urban, military, design | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Siège | military, urban | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Guérilla | military, urban | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Contre-insurrection | military, urban | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Sanctuaire | military, design | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Déception (maskirovka) | military, esports | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Avantage informationnel | military, esports | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Manches d'économie et rythme des ressources | esports, design | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Formations de mouvement : ligne, colonne, coin, échelon | military, esports | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Attaque frontale | military | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Double enveloppement (la tenaille) | military | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Encerclement et poche | military | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Pénétration et percée | military | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Poursuite | military | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Mouvement retrograde : retraite, retardement et repli | military | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Feinte et démonstration | military, esports | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Écran, garde et couverture : sûreté devant le corps principal | military | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Se défendre contre un missile : crank, notch, drag et pump | air | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Formations hors de portée visuelle : mur, tête-queue, grinder, tenaille | air | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Le combat d'angles et le combat d'énergie | air | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Paquet de frappe et séquencement de la neutralisation | air | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | La ligne de bataille | naval | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | L'entonnoir fatal | urban, military, esports, design | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Nettoyage de pièce : surprise, vitesse, violence maîtrisée | urban, military, esports | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Points de domination | urban, military, esports | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Nettoyer les angles : slicing the pie | urban, military, esports | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Feux croisés et champs de tir imbriqués | military, urban, esports, design | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | L'avantage de celui qui sort (peeker's advantage) | esports, design | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Avantage numérique dans les manches à élimination | esports, military | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | L'entrée et le duel d'ouverture | esports, urban | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Utilitaires avant l'entrée : flash et fumée | esports, urban, military | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Modèle des forces sociales du mouvement des piétons | design, urban, military | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Formation de voies en flux inverse | design, urban | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Plus vite, c'est plus lent | design, urban, military | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Le diagramme fondamental des foules | design, urban | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Formation de sentiers et lignes de désir | design, military | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | La panique est rare : résilience collective | military, urban, design | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids : séparation, alignement, cohésion | design, military | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Paramètre d'ordre et apparition du mouvement collectif | design, military, air, naval | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Essaim, tournoiement et états polarisés | design, military, naval | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Leadership efficace sans signaux | military, esports, design | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Voisins par nombre, non par distance | air, military | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Intelligence en essaim | design, esports, military | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Mimétisme et cascades d'information | esports, design, military | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Paresse sociale (social loafing) | esports, design, military | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Dilution de la responsabilité | esports, military | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Cohésion du groupe primaire | military, esports | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Points de rupture et seuils de pertes | military | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Neutralisation : ce que le feu fait en plus de tuer | military, urban | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Peur et stress dans les décisions de combat | military, esports | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Craquer sous la pression | esports | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Théorie des perspectives et aversion aux pertes | esports, design | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Effets du point mort et de l'argent de la maison | esports | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Tilt | esports | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Coût irrécupérable | esports, military | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | La main chaude et son erreur | esports | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Stratégies mixtes : être imprévisible | esports, design, military | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Modèles mentaux partagés | esports, military | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Les composantes du travail d'équipe | esports, military | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Les mondes virtuels comme laboratoires du comportement | design, esports | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Espace personnel et territoire | design, urban | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Réseaux d'interaction : centres et liens faibles | esports, design | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Méthodes (37) {#methods-37}

| id | titre | schémas | sources |
|---|---|---|---|
| `method.lanchester-fit` | Ajustement des exposants de Lanchester aux données d'engagement | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Rapport d'échange par camp et par lieu | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Rapport de forces local au moment de chaque frag | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Champ de visibilité : champs de tir par ligne de vue | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Énergie spécifique lors des frags et des morts (air) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Persistance des points chauds d'une partie à l'autre | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Taux d'échange (soutien mutuel) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Engagements et avantage du premier frag | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Autocorrélation spatiale des morts (I de Moran) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Taux comparés à la référence propre de la carte, avec contrôle du FDR | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Préparation du renseignement sur le champ de bataille (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Modèles de classement par comparaisons deux à deux (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Probabilité de victoire et évaluation des actions | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Contrôle de l'espace et contrôle du terrain de jeu (pitch control) | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Équation de salves ajustée aux navires en contact | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Rapport d'efficacité au combat par heure-unité en action | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Portées de détection à engagement et portées d'engagement | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Chronologie de la chaîne de destruction | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Dispersion face à la part des frags (concentration des forces dans le temps) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Taux de pertes et frags par sortie | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Modèle de probabilité de victoire d'une manche | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Valeur d'une action : probabilité de victoire ajoutée | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Plus-minus ajusté par régression ridge (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Rétrécissement : Bayes empirique | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Résultats attendus : des buts attendus aux duels attendus | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Mesure des placements, rotations et lurks | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Le problème de réflexion : imitation ou cause commune | herding, conformity | Manski 1993 |
| `method.streak-correction` | Séries avec correction de séquence finie | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Paramètres d'ordre de polarisation et de tournoiement | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Meneurs à partir de la corrélation de cap décalée dans le temps | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Test de cascade de routes pour le mimétisme | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Séparation des voies et persistance des sentiers | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Risque des traînards | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Courbe de rupture | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Réaction au feu reçu | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Risque après une perte ou un gain | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Accord sur les achats (kappa de Fleiss) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Cas historiques (277) {#historical-cases-277}

| id | cas | quand | échelle | schémas | sources |
|---|---|---|---|---|---|
| `case.thermopylae` | Thermopyles | 480 av. J.-C. | bataille | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamine | 480 av. J.-C. | bataille | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Marathon | 490 av. J.-C. | bataille | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuctres | 371 av. J.-C. | bataille | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamèles | 331 av. J.-C. | bataille | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Lac Trasimène | 217 av. J.-C. | bataille | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Cannes | 216 av. J.-C. | bataille | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Forêt de Teutobourg | 9 ap. J.-C. | bataille | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | bataille | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Pont de Stirling | 1297 | bataille | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Azincourt | 1415 | bataille | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen | 1757 | bataille | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlitz | 1805 | bataille | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | bataille | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | bataille | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg : les hauteurs de Marye | 1862 | engagement | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg : Little Round Top | 1863 | engagement | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg : la charge de Pickett | 1863 | engagement | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | bataille | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | engagement | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | campagne | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | La Somme, premier jour | 1er juillet 1916 | bataille | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | campagne | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jutland | 1916 | bataille | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939-40 | bataille | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan et les Ardennes | mai 1940 | campagne | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Contre-attaque d'Arras | 21 mai 1940 | engagement | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Bataille d'Angleterre | juil.-oct. 1940 | campagne | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Bataille de l'Atlantique : recherche opérationnelle sur les convois | 1939-45 | campagne | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | juin 1942 | bataille | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Deuxième El-Alamein | oct.-nov. 1942 | bataille | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Col de Kasserine | févr. 1943 | bataille | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Stalingrad | août 1942-févr. 1943 | campagne | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Koursk | juil. 1943 | campagne | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prokhorovka | 12 juillet 1943 | engagement | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13 juin 1944 | engagement | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Haies de Normandie | juin-juil. 1944 | campagne | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Opération Cobra | juil. 1944 | campagne | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Golfe de Leyte | oct. 1944 | bataille | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | déc. 1944 | bataille | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Tsushima | mai 1905 | bataille | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Incheon | sept. 1950 | campagne | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | MiG Alley | 1950-53 | campagne | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | bataille | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang : LZ X-Ray | nov. 1965 | engagement | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Opération Bolo | 2 janv. 1967 | engagement | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golan : la vallée des larmes | oct. 1973 | bataille | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Sinaï : la ferme chinoise | oct. 1973 | bataille | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Vallée de la Bekaa (opération Mole Cricket 19) | juin 1982 | bataille | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Guerre aérienne des Malouines | mai-juin 1982 | campagne | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Campagne aérienne de Desert Storm | janv.-févr. 1991 | campagne | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26 févr. 1991 | engagement | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadiscio | oct. 1993 | engagement | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Grozny | déc. 1994-févr. 1995 | bataille | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hué | janv.-mars 1968 | bataille | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Campagne aérienne du Kosovo | mars-juin 1999 | campagne | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Fallouja (opération Al Fajr) | nov. 2004 | bataille | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mossoul | 2016-17 | campagne | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Qadesh | vers 1274 av. J.-C. | bataille | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Issus | 333 av. J.-C. | bataille | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 av. J.-C. | bataille | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Carrhes | 53 av. J.-C. | bataille | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Pharsale | 48 av. J.-C. | bataille | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Andrinople | 378 ap. J.-C. | bataille | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Yarmouk | 636 ap. J.-C. | bataille | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manzikert | 1071 | bataille | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hattin | 1187 | bataille | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburn | 1314 | bataille | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Crécy | 1346 | bataille | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Poitiers | 1356 | bataille | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunwald (Tannenberg) | 1410 | bataille | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeld | 1631 | bataille | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blenheim | 1704 | bataille | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Poltava | 1709 | bataille | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rossbach | 1757 | bataille | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | campagne | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | bataille | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Iéna-Auerstaedt | 1806 | bataille | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodino | 1812 | bataille | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Leipzig | 1813 | bataille | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | bataille | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | bataille | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | campagne | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadowa) | 1866 | bataille | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | bataille | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Moukden | 1905 | bataille | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdourman | 1898 | bataille | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | engagement | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Gallipoli | 1915 | campagne | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | nov. 1917 | bataille | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Caporetto | oct.-nov. 1917 | campagne | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | L'offensive allemande de printemps (opération Michael) | mars-avr. 1918 | campagne | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | août 1918 | bataille | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Khalkhin Gol (Nomonhan) | août 1939 | bataille | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | La campagne de Pologne | sept. 1939 | campagne | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut et Gembloux | mai 1940 | bataille | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | mai 1940 | engagement | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Le périmètre de Dunkerque | mai-juin 1940 | campagne | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Opération Compass et Beda Fomm | déc. 1940-févr. 1941 | campagne | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Opération Crusader et Sidi Rezegh | nov.-déc. 1941 | campagne | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | mai-juin 1942 | bataille | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alam Halfa | août-sept. 1942 | bataille | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Doubno-Brody | juin 1941 | bataille | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Encerclement de Kiev | sept. 1941 | campagne | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moscou | oct. 1941-janv. 1942 | campagne | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Rjev et opération Mars | 1942 | campagne | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Deuxième Kharkov | mai 1942 | bataille | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Troisième Kharkov (le coup de revers de Manstein) | févr.-mars 1943 | campagne | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Opération Bagration | juin-août 1944 | campagne | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Poche de Korsun-Tcherkassy | janv.-févr. 1944 | bataille | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Poche de Kamenets-Podolski | mars-avr. 1944 | campagne | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Opération Epsom | juin 1944 | bataille | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Opération Goodwood | juil. 1944 | bataille | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Opération Totalize | août 1944 | bataille | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | août 1944 | bataille | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Poche de Falaise | août 1944 | campagne | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden et Arnhem | sept. 1944 | campagne | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Aix-la-Chapelle | oct. 1944 | bataille | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Forêt de Hürtgen | sept. 1944-févr. 1945 | campagne | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | sept. 1944 | bataille | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | Saint-Vith | déc. 1944 | bataille | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Crête d'Elsenborn | déc. 1944 | bataille | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Hauteurs de Seelow | avr. 1945 | bataille | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlin | avr.-mai 1945 | bataille | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Opération Frühlingserwachen (Printemps réveillé) | mars 1945 | bataille | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | déc. 1943 | bataille | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Insurrection de Varsovie | août-oct. 1944 | campagne | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | nov. 1943 | bataille | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | sept.-nov. 1944 | bataille | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | févr.-mars 1945 | bataille | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinawa | avr.-juin 1945 | campagne | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manille | févr.-mars 1945 | bataille | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Mandchourie (tempête d'août) | août 1945 | campagne | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Périmètre de Pusan | août-sept. 1950 | campagne | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Réservoir de Chosin | nov.-déc. 1950 | campagne | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Rivière Imjin | avr. 1951 | bataille | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapyong | avr. 1951 | bataille | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | avr. et juil. 1953 | engagement | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | janv.-avr. 1968 | bataille | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | nov. 1967 | bataille | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (mont Ap Bia) | mai 1969 | engagement | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abou Ageila-Um Katef | juin 1967 | bataille | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismaïlia | oct. 1973 | bataille | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | juin 1982 | engagement | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Siège de Beyrouth | juin-août 1982 | campagne | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Liban 2006 : Bint Jbeil et la menace antichar | juil.-août 2006 | campagne | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Fao | févr. 1986 | bataille | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Bassorah (Karbala-5) | janv.-févr. 1987 | bataille | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Khafji | janv.-févr. 1991 | bataille | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Objectif Norfolk | 26-27 févr. 1991 | bataille | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Crête de Medina | 27 févr. 1991 | bataille | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Feintes de Wadi al-Batin | févr. 1991 | campagne | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nassiriya | mars 2003 | bataille | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Objectif Peach | avr. 2003 | engagement | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Les Thunder Runs | avr. 2003 | bataille | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Col de Debecka | avr. 2003 | engagement | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramadi | 2006-07 | campagne | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadr City | mars-mai 2008 | bataille | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Opération Anaconda | mars 2002 | bataille | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | juil. 2008 | engagement | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | oct. 2009 | engagement | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala et les maisons de section | 2006-07 | campagne | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Bataille d'Alger | 1956-57 | campagne | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Fireforce rhodésien | 1974-79 | campagne | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Siège de Sarajevo | 1992-96 | campagne | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Grozny 1999-2000 | déc. 1999-févr. 2000 | bataille | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Guerre russo-géorgienne | août 2008 | campagne | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillia | juil. 2014 | engagement | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovaïsk | août 2014 | bataille | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debaltseve | janv.-févr. 2015 | bataille | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Aéroport de Donetsk | sept. 2014-janv. 2015 | bataille | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Aéroport de Hostomel | févr. 2022 | engagement | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | L'axe de Kiev et l'embuscade de Brovary | mars 2022 | engagement | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Marioupol et Azovstal | févr.-mai 2022 | bataille | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Contre-offensive de Kharkiv | sept. 2022 | campagne | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Franchissement du Donets de Siverski à Bilohorivka | mai 2022 | engagement | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bakhmout | août 2022-mai 2023 | bataille | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Offensive de Zaporijjia | juin-nov. 2023 | campagne | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Guerre du Haut-Karabakh | sept.-nov. 2020 | campagne | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Le Blitz | sept. 1940-mai 1941 | campagne | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa : le premier jour dans les airs | 22 juin 1941 | bataille | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Crète | mai 1941 | bataille | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Le siège de Malte | 1940-1942 | campagne | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Le pont aérien de Stalingrad | nov. 1942-févr. 1943 | campagne | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Batailles aériennes sur le Kouban | avr.-juin 1943 | campagne | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Koursk dans les airs | juil. 1943 | bataille | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Opération Bagration dans les airs | juin-août 1944 | campagne | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploiești (opération Tidal Wave) | 1er août 1943 | engagement | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Raid sur les barrages (opération Chastise) | 16-17 mai 1943 | engagement | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hambourg (opération Gomorrhe) | juil.-août 1943 | bataille | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt-Ratisbonne | 17 août 1943 | bataille | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Deuxième Schweinfurt (« jeudi noir ») | 14 oct. 1943 | engagement | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Big Week (opération Argument) | févr. 1944 | campagne | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Le raid sur Nuremberg | 30-31 mars 1944 | engagement | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Opération Bodenplatte | 1er janv. 1945 | bataille | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Bataille de la mer de Bismarck | mars 1943 | bataille | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Neutraliser Rabaul | 1943-1944 | campagne | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Mer des Philippines (« Marianas Turkey Shoot ») | juin 1944 | bataille | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Mardi noir au-dessus de Namsi | 23 oct. 1951 | engagement | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Opération Rolling Thunder | 1965-1968 | campagne | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Le pont de Thanh Hoa | 1965-1972 | engagement | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | Les Wild Weasels | 1965-1973 | campagne | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Le rapport Ault et Top Gun | 1968-1972 | campagne | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Opération Linebacker | mai-oct. 1972 | campagne | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II (« la guerre de onze jours ») | déc. 1972 | campagne | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Opération Focus (Moked) | 5 juin 1967 | bataille | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Guerre d'usure : la ceinture de missiles | 1969-1970 | campagne | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | Le parapluie SAM sur le canal | oct. 1973 | bataille | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (opération Opera) | 7 juin 1981 | engagement | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Opération El Dorado Canyon | 15 avr. 1986 | engagement | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | La guerre aérienne Iran-Irak | 1980-1988 | campagne | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Raids Black Buck | mai-juin 1982 | engagement | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder : planification de la campagne aérienne du Golfe | août 1990-janv. 1991 | campagne | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy : la première frappe d'Apache | 17 janv. 1991 | engagement | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | La grande chasse aux Scud | janv.-févr. 1991 | campagne | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Crête de Mutla (« route de la mort ») | 26-27 févr. 1991 | engagement | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Opération Anaconda : les Apache dans la vallée de Shahi-Kot | mars 2002 | bataille | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | L'attaque d'Apache à Karbala | 24 mars 2003 | engagement | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | La campagne aérienne libyenne | mars-oct. 2011 | campagne | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Haut-Karabakh : drones et défenses aériennes | sept.-nov. 2020 | campagne | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ukraine : un ciel disputé | 2022 | campagne | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Aéroport de Hostomel | févr. 2022 | engagement | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | févr.-mars 1971 | campagne | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Opération Eagle Claw | avr. 1980 | engagement | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afghanistan : le Stinger | 1986-1989 | campagne | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lépante | 1571 | bataille | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | L'Armada espagnole | 1588 | campagne | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Baie de Quiberon | 1759 | bataille | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | La baie de Chesapeake (Virginia Capes) | 1781 | bataille | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Le Nil (baie d'Aboukir) | 1798 | bataille | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Copenhague | 1801 | bataille | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | mars 1862 | engagement | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lissa | 1866 | bataille | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Le Yalou | 1894 | bataille | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Baie de Manille | 1898 | bataille | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Bight d'Helgoland | août 1914 | bataille | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel et les Malouines | nov.-déc. 1914 | campagne | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Dogger Bank | janv. 1915 | bataille | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | Le Rio de la Plata | déc. 1939 | bataille | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Tarente | nov. 1940 | engagement | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Cap Matapan | mars 1941 | bataille | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Détroit du Danemark et naufrage du Bismarck | mai 1941 | campagne | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7 déc. 1941 | engagement | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales et Repulse | 10 déc. 1941 | engagement | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | La mer de Java | févr. 1942 | bataille | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | La mer de Corail | mai 1942 | bataille | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Savo | août 1942 | bataille | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Les Salomon orientales | août 1942 | bataille | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Cap Esperance | oct. 1942 | bataille | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Îles Santa Cruz | oct. 1942 | bataille | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Bataille navale de Guadalcanal | 12-15 nov. 1942 | bataille | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | nov. 1942 | engagement | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | La percée de la Manche | févr. 1942 | engagement | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Opération Pedestal | août 1942 | bataille | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Mai noir | mai 1943 | campagne | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Cap Nord | déc. 1943 | bataille | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | La campagne sous-marine américaine contre le Japon | 1941-1945 | campagne | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Au large de Samar | 25 oct. 1944 | bataille | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Détroit de Surigao | 25 oct. 1944 | bataille | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinawa : la campagne kamikaze | avr.-juin 1945 | campagne | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Le naufrage de l'Eilat | oct. 1967 | engagement | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Lattaquié | oct. 1973 | bataille | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | Le naufrage du General Belgrano | 2 mai 1982 | engagement | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | La perte du HMS Sheffield | 4 mai 1982 | engagement | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17 mai 1987 | engagement | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Opération Praying Mantis | 18 avr. 1988 | bataille | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | août 2004 | engagement | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | La révolution Bisu | mars 2007 | bataille | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | Le Dream Coil à The International 2013 | août 2013 | engagement | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Le Zed de Faker contre Ryu | sept. 2013 | engagement | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Le boost de l'Overpass | nov. 2014 | engagement | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | L'AWP sautante sur Mirage | avr. 2016 | engagement | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis et l'ère des utilitaires | 2018 | campagne | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five contre OG | avr. 2019 | bataille | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar atteint le grand maître | 2019 | campagne | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Le crochet gauche (offensive terrestre de l'opération Desert Storm) | 24-28 février 1991 | campagne | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | L'incident Corrupted Blood | septembre 2005 | campagne | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Principes de conception et de niveau (17) {#game-and-level-design-17}

| id | titre | schémas | sources |
|---|---|---|---|
| `design.chokepoint` | Goulots dans la conception de niveaux | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Routes de flanc et chemins alternatifs | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Lignes de vue et distance d'engagement | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Placement et rythme des couverts | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Conception des apparitions et protection à l'apparition | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Équilibre des cartes symétriques et asymétriques | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Équilibre des classes et contres | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Flux, boucles et agencements lisibles | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Économies de jeu et boucles de rétroaction | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Matchmaking et dispersion des niveaux | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | Adversaires IA comme sondes de niveau | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Jeu signifiant et choix | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Échanges et jeu d'équipe dans les jeux de tir | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Contrôle de la carte | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Cartes de chaleur et télémétrie spatiale dans la conception | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Maîtrise, apprentissage et plaisir | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Économies de manche et décisions d'achat | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Études (113) {#studies-113}

| id | titre | sources |
|---|---|---|
| `study.engel-1954` | Engel : loi carrée de Lanchester à Iwo Jima | Engel 1954 |
| `study.bracken-1995` | Bracken : modèles de Lanchester sur les Ardennes | Bracken 1995 |
| `study.fricker-1998` | Fricker : modèles d'attrition des Ardennes revisités | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas et Turkes : Koursk et les Ardennes | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley et Helmbold : validation de la loi carrée | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | Analyse SIG des morts des joueurs | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse : visualiser les comportements compétitifs | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Évaluer les actions dans Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Détection des rencontres dans l'esport | Schubert et al. 2016 |
| `study.red-baron` | Projet Red Baron : combat aérien au-dessus du Vietnam | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy : jugement quantifié des batailles historiques | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle : l'emploi des forces explique les résultats | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Panorama de la visualisation des données de jeu | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard : Lanchester face à trois siècles de batailles terrestres | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain : soixante engagements de la Seconde Guerre mondiale | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss : modèles de combat et guerre de Sécession | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley : un modèle statistique des données d'attrition | Hartley 1995 |
| `study.helmbold-1995` | Helmbold : vitesses d'avance dans le combat terrestre | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas et Dinges : les circonstances comptent plus que la loi | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | Base de données de Koursk | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | Base de données de la campagne des Ardennes | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson et MacKay : la bataille d'Angleterre comme données de Lanchester | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte et Schmidt : le nombre gagne toujours les batailles | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy : régularités des pertes de bataille | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Modèle numérique déterministe tactique de Dupuy | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence : la guerre en chiffres | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld : la puissance de combat | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter et Stam : les démocraties en guerre | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein : le modèle dynamique adaptatif | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman : Lanchester et la guérilla | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong : le modèle stochastique de salves | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes : les fondements de la tactique navale | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | Le débat sur la règle des 3:1 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress : modéliser les conflits armés | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Le rapport Ault : missiles tirés hors de leur enveloppe | Ault 1969; Michel 1997 |
| `study.gwaps` | Enquête sur la puissance aérienne de la guerre du Golfe | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Le cirque de Blackett | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Réglages des grenades sous-marines au Coastal Command | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Dessous blancs pour les avions anti-sous-marins | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald : du blindage là où les bombardiers rentrés n'étaient pas touchés | Mangel & Samaniego 1984 |
| `study.optimal-search` | Recherche optimale : des sous-marins à AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn : combat en enfer | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Interdiction d'accès et déni de zone | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Comment les joueurs perdent de l'intérêt | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Regroupement des comportements des joueurs en conditions réelles | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Détecter la frustration des joueurs | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker : tableaux de bord de télémétrie en production | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO : analyse visuelle du jeu | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Déplacement des avatars dans les champs de bataille de World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE : instrumenter les tests utilisateurs à grande échelle | Kim et al. 2008 |
| `study.game-data-science` | Science des données de jeu | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Intelligence artificielle et jeux | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Habileté et déplacements d'équipe dans Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Schémas de combat qui prédisent les victoires en MOBA | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Rôles des joueurs dans Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Prédire les issues de Dota 2 à partir des drafts | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Prédiction de victoire en direct dans l'esport professionnel | Hodge et al. 2021 |
| `study.rioult-2014` | Topologie des positions des joueurs | Rioult et al. 2014 |
| `study.bednarek-2017` | Évaluer les joueurs dans les jeux de tir d'équipe | Bednárek et al. 2017 |
| `study.katona-2019` | Prédire qui meurt ensuite | Katona et al. 2019 |
| `study.block-2018` | Récits fondés sur les données pour le public esport | Block et al. 2018 |
| `study.ggviz` | ggViz : rechercher des états de jeu à grande échelle | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five : apprentissage par renforcement à grande échelle dans Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar : niveau grand maître dans StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Valeur de possession attendue au basket-ball | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP : évaluer les actions avec ballon au football | Decroos et al. 2019 |
| `study.pitch-control` | Contrôle du terrain de jeu et création d'espace | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | La structure spatiale de l'habileté défensive | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Rôles d'équipe à partir des données de suivi | Lucey et al. 2013 |
| `study.shot-quality` | Buts attendus et qualité des tirs | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision : efficacité spatiale des tirs | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Analyse spatio-temporelle des sports d'équipe | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Le K de Ripley : regroupement à toutes les échelles | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark et Evans : dispersion du plus proche voisin | Clark & Evans 1954 |
| `study.getis-ord` | Points chauds de Getis-Ord | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Indicateurs locaux d'association spatiale | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | La statistique de balayage spatial | Kulldorff 1997 |
| `study.kde` | Estimation de densité par noyau | Silverman 1986 |
| `study.knox-1964` | Interaction espace-temps | Knox 1964; Diggle 2013 |
| `study.maup` | Le problème de l'unité spatiale modifiable | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Isovistes et graphes de visibilité | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Syntaxe spatiale | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Encombrement moyen | Lloyd 1967 |
| `study.survival-analysis` | Analyse de survie du temps jusqu'à la mort | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Modèles linéaires généralisés pour les comptages | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap et intervalles d'estimation | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey et al. : latence et avantage de celui qui sort | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee et Chang : tir au coin d'un mur | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool : latence et actions des joueurs | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos et al. : professionnels et amateurs par la probabilité de victoire | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos et al. : décisions économiques dans Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin : frags utiles et morts inutiles | Maymin 2021 |
| `study.moba-live-prediction` | Prédiction du résultat en direct dans les MOBA | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa et al. : manches de Valorant à partir de caractéristiques tactiques | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv et al. : rôles dans Counter-Strike 2 professionnel | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim et al. : entraîner le combat rapproché | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Turbulences de foule au pèlerinage du Hajj de 2006 | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Les groupes en marche façonnent les foules | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Dynamique hiérarchique de groupe chez les vols de pigeons | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | L'influence sociale rend le succès inégal et imprévisible | Salganik et al. 2006 |
| `study.wisdom-undermined` | L'influence sociale affaiblit la sagesse des foules | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | Le pouvoir d'attraction d'une foule | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Conformité à une majorité unanime | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | « Why They Fight » : motivation au combat en Irak | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Cohésion et performance : méta-analyses | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Aversion aux pertes chez les golfeurs professionnels | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Mains chaudes au baseball | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Tirs au but : les professionnels jouent le minimax | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Le minimax à Wimbledon | Walker & Wooders 2001 |
| `study.collective-intelligence` | Intelligence collective des équipes | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Réseaux sociaux d'un monde en ligne | Szell et al. 2010 |
| `study.team-networks` | Réseaux de passes et performance d'équipe | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Le comportement se propage dans les réseaux en grappes | Centola 2010 |

### Bibliographie {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(vérifié le 2026-11-15 : détail)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(vérifié le 2026-11-15 : détail)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(vérifié le 2026-11-15 : détail)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(vérifié le 2026-11-15 : détail)*
- Ammianus Marcellinus (trad. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(vérifié le 2026-11-15 : détail)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(vérifié le 2026-11-15 : détail)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(vérifié le 2026-11-15 : détail)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(vérifié le 2026-11-15 : détail)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Ardant du Picq, C. (trad. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(vérifié le 2026-11-15 : détail)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(vérifié le 2026-11-15 : détail)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Arrian (trad. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(vérifié le 2026-11-15 : détail)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(vérifié le 2026-11-15 : détail)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(vérifié le 2026-11-15 : détail)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(vérifié le 2026-11-15 : détail)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(vérifié le 2026-11-15 : détail)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(vérifié le 2026-11-15 : détail)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(vérifié le 2026-11-15 : détail)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(vérifié le 2026-11-15 : détail)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(vérifié le 2026-11-15 : détail)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(vérifié le 2026-11-15 : détail)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(vérifié le 2026-11-15 : détail)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(vérifié le 2026-11-15 : détail)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(vérifié le 2026-11-15 : détail)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(vérifié le 2026-11-15 : détail)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(vérifié le 2026-11-15 : détail)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(vérifié le 2026-11-15 : détail)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(vérifié le 2026-11-15 : détail)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(vérifié le 2026-11-15 : existence)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(vérifié le 2026-11-15 : détail)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(vérifié le 2026-11-15 : détail)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(vérifié le 2026-11-15 : détail)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(vérifié le 2026-11-15 : détail)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(vérifié le 2026-11-15 : détail)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(vérifié le 2026-11-15 : détail)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(vérifié le 2026-11-15 : existence)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(vérifié le 2026-11-15 : détail)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(vérifié le 2026-11-15 : détail)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(vérifié le 2026-11-15 : détail)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(vérifié le 2026-11-15 : détail)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(vérifié le 2026-11-15 : détail)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(vérifié le 2026-11-15 : détail)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(vérifié le 2026-11-15 : existence)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(vérifié le 2026-11-15 : détail)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(vérifié le 2026-11-15 : détail)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(vérifié le 2026-11-15 : détail)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(vérifié le 2026-11-15 : détail)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(vérifié le 2026-11-15 : existence)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(vérifié le 2026-11-15 : détail)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(vérifié le 2026-11-15 : détail)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(vérifié le 2026-11-15 : détail)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(vérifié le 2026-11-15 : détail)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(vérifié le 2026-11-15 : existence)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(vérifié le 2026-11-15 : détail)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(vérifié le 2026-11-15 : détail)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(vérifié le 2026-11-15 : détail)*
- Caesar, G. J. (trad. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(vérifié le 2026-11-15 : détail)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(vérifié le 2026-11-15 : détail)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(vérifié le 2026-11-15 : détail)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(vérifié le 2026-11-15 : détail)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(vérifié le 2026-11-15 : détail)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(vérifié le 2026-11-15 : détail)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(vérifié le 2026-11-15 : détail)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(vérifié le 2026-11-15 : détail)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(vérifié le 2026-11-15 : détail)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(vérifié le 2026-11-15 : détail)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(vérifié le 2026-11-15 : détail)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(vérifié le 2026-11-15 : détail)*
- Clausewitz, C. von (trad. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(vérifié le 2026-11-15 : détail)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(vérifié le 2026-11-15 : détail)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(vérifié le 2026-11-15 : détail)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(vérifié le 2026-11-15 : détail)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(vérifié le 2026-11-15 : détail)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(vérifié le 2026-11-15 : détail)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(vérifié le 2026-11-15 : détail)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(vérifié le 2026-11-15 : existence)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(vérifié le 2026-11-15 : détail)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(vérifié le 2026-11-15 : détail)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(vérifié le 2026-11-15 : détail)*
- Craven, W. F.; Cate, J. L. (dir.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(vérifié le 2026-11-15 : existence)*
- Craven, W. F.; Cate, J. L. (dir.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(vérifié le 2026-11-15 : existence)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(vérifié le 2026-11-15 : détail)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(vérifié le 2026-11-15 : détail)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(vérifié le 2026-11-15 : détail)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(vérifié le 2026-11-15 : existence)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(vérifié le 2026-11-15 : détail)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(vérifié le 2026-11-15 : détail)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(vérifié le 2026-11-15 : détail)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(vérifié le 2026-11-15 : détail)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(vérifié le 2026-11-15 : détail)*
- Delbrück, H. (trad. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(vérifié le 2026-11-15 : existence)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(vérifié le 2026-11-15 : détail)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3e éd.). CRC Press, Boca Raton. *(vérifié le 2026-11-15 : détail)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(vérifié le 2026-11-15 : détail)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(vérifié le 2026-11-15 : détail)*
- Douhet, G. (trad. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(vérifié le 2026-11-15 : détail)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(vérifié le 2026-11-15 : détail)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(vérifié le 2026-11-15 : détail)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(vérifié le 2026-11-15 : détail)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(vérifié le 2026-11-15 : existence)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(vérifié le 2026-11-15 : détail)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(vérifié le 2026-11-15 : détail)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(vérifié le 2026-11-15 : détail)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(vérifié le 2026-11-15 : détail)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(vérifié le 2026-11-15 : détail)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(vérifié le 2026-11-15 : détail)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(vérifié le 2026-11-15 : détail)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(vérifié le 2026-11-15 : détail)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(vérifié le 2026-11-15 : détail)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(vérifié le 2026-11-15 : existence)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(vérifié le 2026-11-15 : détail)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(vérifié le 2026-11-15 : détail)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(vérifié le 2026-11-15 : détail)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(vérifié le 2026-11-15 : détail)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(vérifié le 2026-11-15 : détail)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(vérifié le 2026-11-15 : détail)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(vérifié le 2026-11-15 : détail)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(vérifié le 2026-11-15 : détail)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(vérifié le 2026-11-15 : détail)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(vérifié le 2026-11-15 : détail)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(vérifié le 2026-11-15 : détail)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(vérifié le 2026-11-15 : détail)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(vérifié le 2026-11-15 : détail)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(vérifié le 2026-11-15 : détail)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(vérifié le 2026-11-15 : détail)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(vérifié le 2026-11-15 : détail)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(vérifié le 2026-11-15 : détail)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(vérifié le 2026-11-15 : détail)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(vérifié le 2026-11-15 : détail)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(vérifié le 2026-11-15 : existence)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(vérifié le 2026-11-15 : détail)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(vérifié le 2026-11-15 : détail)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(vérifié le 2026-11-15 : détail)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(vérifié le 2026-11-15 : détail)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(vérifié le 2026-11-15 : détail)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(vérifié le 2026-11-15 : détail)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(vérifié le 2026-11-15 : détail)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2e éd.). Morgan Kaufmann, Burlington. *(vérifié le 2026-11-15 : détail)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (éd. rév.). Office of Air Force History, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(vérifié le 2026-11-15 : détail)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(vérifié le 2026-11-15 : détail)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(vérifié le 2026-11-15 : détail)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(vérifié le 2026-11-15 : détail)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(vérifié le 2026-11-15 : détail)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(vérifié le 2026-11-15 : détail)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(vérifié le 2026-11-15 : détail)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(vérifié le 2026-11-15 : détail)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(vérifié le 2026-11-15 : détail)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(vérifié le 2026-11-15 : détail)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(vérifié le 2026-11-15 : détail)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(vérifié le 2026-11-15 : détail)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(vérifié le 2026-11-15 : détail)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(vérifié le 2026-11-15 : détail)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(vérifié le 2026-11-15 : détail)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(vérifié le 2026-11-15 : détail)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(vérifié le 2026-11-15 : détail)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(vérifié le 2026-11-15 : détail)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(vérifié le 2026-11-15 : détail)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(vérifié le 2026-11-15 : détail)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(vérifié le 2026-11-15 : détail)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Grau, L. W. (dir.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(vérifié le 2026-11-15 : détail)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(vérifié le 2026-11-15 : détail)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(vérifié le 2026-11-15 : détail)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(vérifié le 2026-11-15 : détail)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(vérifié le 2026-11-15 : détail)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(vérifié le 2026-11-15 : détail)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(vérifié le 2026-11-15 : détail)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(vérifié le 2026-11-15 : détail)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(vérifié le 2026-11-15 : détail)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(vérifié le 2026-11-15 : détail)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(vérifié le 2026-11-15 : détail)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(vérifié le 2026-11-15 : détail)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(vérifié le 2026-11-15 : détail)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(vérifié le 2026-11-15 : détail)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(vérifié le 2026-11-15 : détail)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(vérifié le 2026-11-15 : détail)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(vérifié le 2026-11-15 : détail)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(vérifié le 2026-11-15 : détail)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(vérifié le 2026-11-15 : détail)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(vérifié le 2026-11-15 : détail)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(vérifié le 2026-11-15 : détail)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(vérifié le 2026-11-15 : détail)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(vérifié le 2026-11-15 : détail)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(vérifié le 2026-11-15 : détail)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(vérifié le 2026-11-15 : détail)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(vérifié le 2026-11-15 : détail)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(vérifié le 2026-11-15 : détail)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(vérifié le 2026-11-15 : détail)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(vérifié le 2026-11-15 : détail)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(vérifié le 2026-11-15 : existence)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Herodotus (trad. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(vérifié le 2026-11-15 : détail)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(vérifié le 2026-11-15 : détail)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(vérifié le 2026-11-15 : détail)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(vérifié le 2026-11-15 : détail)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(vérifié le 2026-11-15 : détail)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(vérifié le 2026-11-15 : détail)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(vérifié le 2026-11-15 : détail)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(vérifié le 2026-11-15 : détail)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(vérifié le 2026-11-15 : détail)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(vérifié le 2026-11-15 : détail)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(vérifié le 2026-11-15 : détail)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(vérifié le 2026-11-15 : détail)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(vérifié le 2026-11-15 : détail)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2e éd.). Naval Institute Press, Annapolis. *(vérifié le 2026-11-15 : détail)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3e éd.). Naval Institute Press, Annapolis. *(vérifié le 2026-11-15 : détail)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(vérifié le 2026-11-15 : détail)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(vérifié le 2026-11-15 : détail)*
- Isserson, G. S. (trad. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(vérifié le 2026-11-15 : détail)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(vérifié le 2026-11-15 : détail)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Jomini, A.-H. de (trad. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(vérifié le 2026-11-15 : détail)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(vérifié le 2026-11-15 : détail)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(vérifié le 2026-11-15 : détail)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(vérifié le 2026-11-15 : détail)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(vérifié le 2026-11-15 : détail)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(vérifié le 2026-11-15 : existence)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(vérifié le 2026-11-15 : détail)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(vérifié le 2026-11-15 : détail)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(vérifié le 2026-11-15 : détail)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(vérifié le 2026-11-15 : détail)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(vérifié le 2026-11-15 : détail)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(vérifié le 2026-11-15 : détail)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(vérifié le 2026-11-15 : détail)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(vérifié le 2026-11-15 : détail)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(vérifié le 2026-11-15 : détail)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(vérifié le 2026-11-15 : détail)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(vérifié le 2026-11-15 : détail)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(vérifié le 2026-11-15 : détail)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(vérifié le 2026-11-15 : détail)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(vérifié le 2026-11-15 : existence)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(vérifié le 2026-11-15 : détail)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(vérifié le 2026-11-15 : détail)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(vérifié le 2026-11-15 : détail)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(vérifié le 2026-11-15 : détail)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(vérifié le 2026-11-15 : détail)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(vérifié le 2026-11-15 : détail)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(vérifié le 2026-11-15 : détail)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(vérifié le 2026-11-15 : détail)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(vérifié le 2026-11-15 : détail)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(vérifié le 2026-11-15 : détail)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(vérifié le 2026-11-15 : existence)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(vérifié le 2026-11-15 : détail)*
- Livy (trad. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(vérifié le 2026-11-15 : détail)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(vérifié le 2026-11-15 : détail)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(vérifié le 2026-11-15 : détail)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(vérifié le 2026-11-15 : détail)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(vérifié le 2026-11-15 : existence)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(vérifié le 2026-11-15 : détail)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(vérifié le 2026-11-15 : détail)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(vérifié le 2026-11-15 : détail)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(vérifié le 2026-11-15 : détail)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(vérifié le 2026-11-15 : détail)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(vérifié le 2026-11-15 : détail)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(vérifié le 2026-11-15 : détail)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(vérifié le 2026-11-15 : existence)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(vérifié le 2026-11-15 : détail)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(vérifié le 2026-11-15 : détail)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(vérifié le 2026-11-15 : détail)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(vérifié le 2026-11-15 : détail)*
- Mao Tse-tung (trad. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(vérifié le 2026-11-15 : existence)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(vérifié le 2026-11-15 : détail)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(vérifié le 2026-11-15 : détail)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(vérifié le 2026-11-15 : détail)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(vérifié le 2026-11-15 : détail)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(vérifié le 2026-11-15 : détail)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(vérifié le 2026-11-15 : détail)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(vérifié le 2026-11-15 : détail)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2e éd.). Chapman & Hall, London. *(vérifié le 2026-11-15 : détail)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(vérifié le 2026-11-15 : détail)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(vérifié le 2026-11-15 : détail)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(vérifié le 2026-11-15 : existence)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(vérifié le 2026-11-15 : détail)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(vérifié le 2026-11-15 : détail)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(vérifié le 2026-11-15 : détail)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(vérifié le 2026-11-15 : détail)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(vérifié le 2026-11-15 : détail)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(vérifié le 2026-11-15 : détail)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(vérifié le 2026-11-15 : détail)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(vérifié le 2026-11-15 : détail)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(vérifié le 2026-11-15 : détail)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(vérifié le 2026-11-15 : détail)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(vérifié le 2026-11-15 : détail)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(vérifié le 2026-11-15 : existence)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(vérifié le 2026-11-15 : existence)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(vérifié le 2026-11-15 : détail)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(vérifié le 2026-11-15 : détail)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(vérifié le 2026-11-15 : détail)*
- Morillo, S. (dir.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(vérifié le 2026-11-15 : détail)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(vérifié le 2026-11-15 : détail)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(vérifié le 2026-11-15 : existence)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(vérifié le 2026-11-15 : existence)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(vérifié le 2026-11-15 : détail)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(vérifié le 2026-11-15 : détail)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(vérifié le 2026-11-15 : existence)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(vérifié le 2026-11-15 : détail)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(vérifié le 2026-11-15 : détail)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(vérifié le 2026-11-15 : détail)*
- Mueller, K. P. (dir.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(vérifié le 2026-11-15 : détail)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(vérifié le 2026-11-15 : détail)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(vérifié le 2026-11-15 : détail)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(vérifié le 2026-11-15 : détail)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(vérifié le 2026-11-15 : détail)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(vérifié le 2026-11-15 : détail)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(vérifié le 2026-11-15 : détail)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(vérifié le 2026-11-15 : détail)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(vérifié le 2026-11-15 : détail)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(vérifié le 2026-11-15 : détail)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(vérifié le 2026-11-15 : détail)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(vérifié le 2026-11-15 : existence)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(vérifié le 2026-11-15 : détail)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(vérifié le 2026-11-15 : détail)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(vérifié le 2026-11-15 : détail)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(vérifié le 2026-11-15 : détail)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(vérifié le 2026-11-15 : détail)*
- Osipov, M. (trad. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(vérifié le 2026-11-15 : détail)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(vérifié le 2026-11-15 : détail)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(vérifié le 2026-11-15 : détail)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(vérifié le 2026-11-15 : détail)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(vérifié le 2026-11-15 : détail)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(vérifié le 2026-11-15 : détail)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(vérifié le 2026-11-15 : détail)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(vérifié le 2026-11-15 : détail)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(vérifié le 2026-11-15 : détail)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(vérifié le 2026-11-15 : détail)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(vérifié le 2026-11-15 : détail)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(vérifié le 2026-11-15 : détail)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(vérifié le 2026-11-15 : détail)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(vérifié le 2026-11-15 : détail)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(vérifié le 2026-11-15 : détail)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(vérifié le 2026-11-15 : détail)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(vérifié le 2026-11-15 : détail)*
- Plutarch (trad. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(vérifié le 2026-11-15 : détail)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(vérifié le 2026-11-15 : détail)*
- Polybius (trad. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(vérifié le 2026-11-15 : détail)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(vérifié le 2026-11-15 : détail)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(vérifié le 2026-11-15 : détail)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(vérifié le 2026-11-15 : détail)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(vérifié le 2026-11-15 : détail)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(vérifié le 2026-11-15 : détail)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(vérifié le 2026-11-15 : détail)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(vérifié le 2026-11-15 : détail)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(vérifié le 2026-11-15 : détail)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(vérifié le 2026-11-15 : détail)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(vérifié le 2026-11-15 : détail)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(vérifié le 2026-11-15 : détail)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(vérifié le 2026-11-15 : détail)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(vérifié le 2026-11-15 : détail)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(vérifié le 2026-11-15 : détail)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(vérifié le 2026-11-15 : détail)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(vérifié le 2026-11-15 : détail)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(vérifié le 2026-11-15 : détail)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(vérifié le 2026-11-15 : détail)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(vérifié le 2026-11-15 : détail)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(vérifié le 2026-11-15 : détail)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(vérifié le 2026-11-15 : existence)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(vérifié le 2026-11-15 : existence)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(vérifié le 2026-11-15 : existence)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(vérifié le 2026-11-15 : existence)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(vérifié le 2026-11-15 : détail)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(vérifié le 2026-11-15 : détail)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(vérifié le 2026-11-15 : détail)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(vérifié le 2026-11-15 : détail)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(vérifié le 2026-11-15 : détail)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(vérifié le 2026-11-15 : détail)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(vérifié le 2026-11-15 : détail)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(vérifié le 2026-11-15 : détail)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(vérifié le 2026-11-15 : existence)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(vérifié le 2026-11-15 : détail)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(vérifié le 2026-11-15 : détail)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (dir.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(vérifié le 2026-11-15 : détail)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(vérifié le 2026-11-15 : détail)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(vérifié le 2026-11-15 : existence)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(vérifié le 2026-11-15 : détail)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(vérifié le 2026-11-15 : existence)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(vérifié le 2026-11-15 : détail)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(vérifié le 2026-11-15 : détail)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(vérifié le 2026-11-15 : détail)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(vérifié le 2026-11-15 : détail)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(vérifié le 2026-11-15 : détail)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(vérifié le 2026-11-15 : existence)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(vérifié le 2026-11-15 : détail)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(vérifié le 2026-11-15 : détail)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(vérifié le 2026-11-15 : détail)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(vérifié le 2026-11-15 : détail)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(vérifié le 2026-11-15 : détail)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(vérifié le 2026-11-15 : détail)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(vérifié le 2026-11-15 : détail)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(vérifié le 2026-11-15 : détail)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(vérifié le 2026-11-15 : détail)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(vérifié le 2026-11-15 : détail)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(vérifié le 2026-11-15 : détail)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(vérifié le 2026-11-15 : existence)*
- Sun Tzu (trad. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(vérifié le 2026-11-15 : détail)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(vérifié le 2026-11-15 : détail)*
- Tacitus (trad. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(vérifié le 2026-11-15 : détail)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(vérifié le 2026-11-15 : détail)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(vérifié le 2026-11-15 : détail)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(vérifié le 2026-11-15 : détail)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(vérifié le 2026-11-15 : détail)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4e éd.). Routledge, Abingdon. *(vérifié le 2026-11-15 : détail)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(vérifié le 2026-11-15 : détail)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(vérifié le 2026-11-15 : détail)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2e éd.). CRC Press, Boca Raton. *(vérifié le 2026-11-15 : détail)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(vérifié le 2026-11-15 : détail)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(vérifié le 2026-11-15 : détail)*
- Triandafillov, V. K. (trad. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(vérifié le 2026-11-15 : détail)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(vérifié le 2026-11-15 : détail)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(vérifié le 2026-11-15 : détail)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(vérifié le 2026-11-15 : détail)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(vérifié le 2026-11-15 : détail)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(vérifié le 2026-11-15 : détail)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(vérifié le 2026-11-15 : détail)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(vérifié le 2026-11-15 : existence)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(vérifié le 2026-11-15 : détail)*
- Vegetius (trad. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(domaine public)* *(vérifié le 2026-11-15 : existence)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(vérifié le 2026-11-15 : détail)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(vérifié le 2026-11-15 : détail)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(vérifié le 2026-11-15 : détail)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(vérifié le 2026-11-15 : détail)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(vérifié le 2026-11-15 : détail)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(vérifié le 2026-11-15 : détail)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(vérifié le 2026-11-15 : détail)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(vérifié le 2026-11-15 : détail)*
- Wallner, G. (dir.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(vérifié le 2026-11-15 : existence)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(vérifié le 2026-11-15 : détail)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(vérifié le 2026-11-15 : existence)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Washburn, A. R. (2002). Search and Detection (4e éd.). INFORMS / Military Applications Section, Linthicum MD. *(vérifié le 2026-11-15 : existence)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(vérifié le 2026-11-15 : détail)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(vérifié le 2026-11-15 : existence)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(vérifié le 2026-11-15 : détail)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(vérifié le 2026-11-15 : détail)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(vérifié le 2026-11-15 : détail)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(vérifié le 2026-11-15 : détail)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(vérifié le 2026-11-15 : détail)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(vérifié le 2026-11-15 : détail)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2e éd.). Air University Press, Maxwell AFB. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(vérifié le 2026-11-15 : existence)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(vérifié le 2026-11-15 : détail)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(vérifié le 2026-11-15 : détail)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(vérifié le 2026-11-15 : détail)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(vérifié le 2026-11-15 : détail)*
- Xenophon (trad. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(domaine public)* *(vérifié le 2026-11-15 : détail)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(vérifié le 2026-11-15 : détail)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(vérifié le 2026-11-15 : détail)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(vérifié le 2026-11-15 : détail)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(vérifié le 2026-11-15 : existence)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(vérifié le 2026-11-15 : détail)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(vérifié le 2026-11-15 : existence)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(vérifié le 2026-11-15 : existence)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(vérifié le 2026-11-15 : détail)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(vérifié le 2026-11-15 : détail)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(vérifié le 2026-11-15 : détail)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(vérifié le 2026-11-15 : détail)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(vérifié le 2026-11-15 : détail)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(vérifié le 2026-11-15 : détail)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(vérifié le 2026-11-15 : détail)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(vérifié le 2026-11-15 : détail)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(vérifié le 2026-11-15 : détail)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(vérifié le 2026-11-15 : détail)*

<!-- kb:end -->
