---
title: "Catàleg de coneixement"
parent: "La lent del coneixement"
nav_order: 2
lang: "ca"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Catàleg del coneixement

Aquesta és la llista completa del que sap la [lent del coneixement](knowledge.md): els patrons que busca, les idees, mètodes, casos històrics i estudis que cita, i els llibres i articles que hi ha darrere. Fes-la servir per buscar una entrada pel seu identificador o per comprovar una font.

Aquesta pàgina es genera a partir de la base de coneixement amb `node tools/knowledge-doc.mjs`; no l'editis entre les marques.

<!-- kb:begin -->

La base de coneixement té 579 entrades (135 conceptes, 37 mètodes, 277 casos històrics, 17 principis de disseny, 113 estudis) sobre 93 patrons, i cita 556 referències.

### Patrons (93) {#patterns-93}

| id | família | com es veu a les dades |
|---|---|---|
| `concentration` | força | El bàndol que porta més unitats a un mateix lloc guanya aquell lloc amb més marge que només pel nombre. |
| `local-superiority` | força | Les baixes van pel bàndol que supera l'altre dins del radi de combat, sigui quin sigui el total. |
| `attrition` | força | Les pèrdues segueixen les forces dels dos bàndols amb el temps; la lluita la decideix qui s'acaba primer. |
| `exchange-ratio` | força | Les morts per cada pèrdua canvien molt segons el lloc, el bàndol o la classe. |
| `aimed-fire` | força | Les pèrdues creixen amb el nombre de l'enemic però no amb el propi. |
| `area-fire` | força | Les pèrdues creixen amb el producte dels nombres dels dos bàndols: l'aglomeració es paga. |
| `defeat-in-detail` | força | Un bàndol és destruït a trossos a mesura que les seves parts arriben una a una. |
| `mutual-support` | força | Una pèrdua és contestada de seguida per un company proper: intercanvis. |
| `combined-arms` | força | Les classes van bé juntes quan cadascuna cobreix la debilitat de l'altra, i van malament soles. |
| `class-counter` | força | Una classe guanya de manera desproporcionada contra una altra classe concreta o en un lloc concret. |
| `initiative` | força | Qui marca primer en un combat tendeix a guanyar-lo. |
| `key-terrain` | terreny | Els mateixos pocs llocs decideixen els combats partida rere partida. |
| `fields-of-fire` | terreny | Els llocs que veuen lluny sobre el terreny que els altres han de creuar fan més morts. |
| `high-ground` | terreny | Les morts es fan des de més amunt del terreny on són les víctimes. |
| `cover` | terreny | Les morts per temps baixen on la geometria bloqueja la vista i el foc. |
| `open-ground` | terreny | Les morts per temps pugen on res no bloqueja la vista ni el foc. |
| `kill-zone` | terreny | Les morts es concentren on el moviment es veu obligat a passar per terreny observat i cobert de foc. |
| `chokepoint` | terreny | Molts passos es premen per un terreny petit, amb pèrdues allà. |
| `reverse-slope` | terreny | Seguretat just darrere d'una cresta o d'un mur, fora de la vista directa de l'enemic. |
| `safe-ground` | terreny | Un lloc on es passa temps però on mor poca gent. |
| `obstacle` | terreny | Les rutes es doblegen al voltant del terreny bloquejat i es fan en pocs carrils. |
| `flank` | moviment | Una ruta poc usada porta a més morts que les rutes principals. |
| `avenue-of-approach` | moviment | El moviment circula per pocs carrils entre zones. |
| `mobility` | moviment | Les unitats que es mouen moren menys (o més) per temps que les lentes o les quietes. |
| `static-exposure` | moviment | Les unitats aturades moren més per temps que les que es mouen. |
| `interior-lines` | moviment | Un bàndol amb rutes curtes entre els seus combats canvia de força més de pressa que l'altre. |
| `envelopment` | moviment | Les morts arriben des de diverses direccions sobre la posició d'un bàndol. |
| `ambush` | moviment | Les unitats que avancen per una ruta moren de pressa davant d'enemics que ja són a lloc. |
| `spawn-pressure` | temps | Les vides acaben aviat després de començar en un mateix punt d'aparició. |
| `tempo` | temps | El bàndol més ràpid arriba al combat i marca abans que l'altre reaccioni. |
| `surprise` | temps | Les pèrdues arriben en una ràfega abans que les víctimes puguin respondre. |
| `energy-advantage` | aire | Els qui maten porten més altura i velocitat que les seves víctimes. |
| `air-superiority` | aire | Els avions d'un bàndol maten moltes vegades el que perden. |
| `sead` | aire | Les defenses antiaèries terrestres es carreguen molts avions fins que són trobades i destruïdes. |
| `bvr` | aire | Les morts es produeixen a llarga distància, abans que la víctima pugui acostar-se. |
| `fleet-salvo` | mar | Una força que descarrega el primer cop perd poc; l'altra sobreviu poc per respondre. |
| `scouting` | mar | El bàndol que troba primer l'altre tria el combat. |
| `urban-close` | urbà | Distàncies de combat curtes, moltes morts entre geometria densa i neteja lenta. |
| `vertical` | urbà | Morts des de pisos superiors o terrats sobre els carrers. |
| `skill-dispersion` | persones | Uns quants jugadors compten per una part gran de les morts o de les baixes. |
| `ai-vs-player` | persones | Les unitats controlades per la IA es comporten diferent dels jugadors al mateix lloc. |
| `balance` | disseny | Els bàndols, els punts d'aparició o les classes comencen amb opcions desiguals. |
| `economy` | disseny | Els recursos guanyats, pagats i perduts es concentren en pocs llocs o jugadors. |
| `flow` | disseny | Com es mouen els jugadors pel nivell: bucles, carrils, culs de sac. |
| `sightlines` | disseny | Les línies de visió llargues decideixen on comencen els combats i qui els guanya. |
| `readability` | disseny | Morts que els jugadors no poden veure venir: per darrere, des de fora de la vista. |
| `formation` | moviment | Les unitats d'un bàndol es mouen juntes en una forma reconeixible: línia, columna, falca, esglaó, caixa. |
| `frontal-assault` | moviment | Un grup es llança contra l'enemic de cara, directament contra el seu front. |
| `double-envelopment` | moviment | Dos grups ataquen els dos flancs d'un mateix cos enemic gairebé alhora. |
| `encirclement` | moviment | Un grup enemic queda envoltat per l'altre bàndol i amb poques sortides. |
| `penetration` | moviment | Un grup travessa la línia enemiga per on hi ha enemics a banda i banda. |
| `fire-and-maneuver` | moviment | Part d'un grup es mou mentre la resta està quieta i el cobreix, i els papers s'alternen. |
| `feint` | moviment | Un grup petit atrau l'enemic cap a un lloc; l'esforç principal colpeja en un altre lloc poc després. |
| `withdrawal` | moviment | Un grup en contacte es gira i obre distància amb l'enemic. |
| `pursuit` | moviment | Un grup segueix un enemic que s'allunya, mantenint o escurçant la distància. |
| `defence-in-depth` | terreny | Els defensors són en diverses franges, una darrere l'altra, al llarg de l'eix d'avanç de l'enemic. |
| `screening` | moviment | Un petit element es mou molt davant del seu cos principal i troba l'enemic primer. |
| `dispersion` | força | Un bàndol s'estén amb el temps; menys unitats seves comparteixen un mateix lloc. |
| `missile-defence` | aire | Els avions sota amenaça de míssil giren la amenaça cap al costat o la cua: crank, notch, drag, pump. |
| `angles-fight` | aire | Combat aeri a curta distància a poca velocitat i molt alta taxa de gir, lluitat per la posició del morro més que per l'energia. |
| `cap` | aire | Els avions fan òrbites en una posició fixa durant minuts, esperant que vingui l'enemic. |
| `strike-package` | aire | Avions de funcions diferents volen junts cap a un objectiu; alguns ataquen el terra i altres els cobreixen. |
| `line-of-battle` | mar | Els vaixells navegan en columna, un darrere l'altre, perquè totes les andanades puguin disparar. |
| `crossing-the-t` | mar | Una columna passa pel cap de la columna enemiga: tots els seus canons apunten i pocs dels de l'enemic. |
| `fatal-funnel` | urbà | Els jugadors que entren per una mateixa porta, sala o pas estret moren allà en pocs instants amb molta més freqüència que entrant per altres llocs. |
| `crossfire` | força | Els qui tenen línies de tir que conflueixen des d'angles diferents guanyen més duels que un de sol. |
| `peeker-advantage` | temps | El jugador que entra a la vista guanya els duels contra el que manté l'angle més (o menys) sovint que la meitat. |
| `entry` | temps | La primera mort d'una ronda decideix gran part de la ronda; les entrades guanyen o perden segons el lloc i el suport. |
| `utility-support` | força | Un flaix o fum just abans d'un duel canvia qui el guanya. |
| `man-advantage` | força | Les rondes les guanya el bàndol amb més jugadors vius, i alguns bàndols converteixen o malbaraten l'avantatge. |
| `clutch` | persones | Els últims jugadors vius guanyen més (o menys) sovint del que prediu l'estat de la ronda. |
| `action-value` | persones | Les morts, els intercanvis, les col·locacions i l'ús d'utilitat difereixen en quant canvien la probabilitat de guanyar. |
| `lurk` | moviment | Un jugador sol, lluny de l'equip, mata (o mor) a un ritme diferent del grup. |
| `rotation` | moviment | La rapidesa amb què un bàndol desplaça jugadors cap al combat o l'objectiu decideix si el manté o el recupera. |
| `collective-order` | persones | Les unitats en moviment d'un bàndol van cap a la mateixa direcció molt més sovint del que donarien per atzar les seves pròpies trajectòries, desplaçades en el temps. |
| `milling` | persones | Les unitats d'un bàndol giren al voltant d'un centre comú: rotació sense desplaçament net. |
| `herding` | persones | Les unitats abandonen un lloc com ho va fer el company que les precedia, més enllà de les probabilitats del propi lloc i més enllà de copiar l'enemic. |
| `lane-formation` | persones | Els fluxos oposats es mantenen en carrils separats; el moviment es concentra en pocs camins que es reutilitzen partida rere partida. |
| `crowding` | persones | La velocitat i el flux baixen quan les unitats s'amunteguen; per un pas estret, empènyer més fort fa passar menys unitats. |
| `leadership` | persones | Algunes unitats giren primer i les altres copien el seu rumb uns segons més tard. |
| `cohesion` | persones | Les unitats que s'allunyen del seu grup moren més sovint que les que s'hi mantenen. |
| `breaking-point` | persones | Un bàndol que ha perdut una part de la seva força deixa de tancar distància i es retira, més enllà del que explica la seva distància a l'enemic. |
| `panic` | persones | Sota una amenaça sobtada les unitats es dispersen, fugen o es queden glaçades, i la coordinació es trenca. |
| `loss-chasing` | persones | Després d'una pèrdua, les unitats prenen més (o menys) risc que després d'un guany. |
| `hot-hand` | persones | Un èxit segueix un altre èxit més sovint del que permeten les seqüències barrejades del mateix jugador. |
| `conformity` | persones | Els membres d'un bàndol trien igual (compres, equipaments, rutes) més enllà de les seves preferències. |
| `suppression` | persones | El foc que arriba canvia com es mouen i disparen les unitats, encara que no les mati. |
| `social-loafing` | persones | L'acció per cap baixa a mesura que hi ha més companys. |
| `mixed-strategy` | persones | Les eleccions que haurien de ser imprevisibles es tornen amb patró: una opció guanya més, o les eleccions segueixen seqüències. |
| `coordination` | persones | Els membres actuen en sintonia sense ordres visibles: moviment, temps i eleccions sincronitzats. |
| `contagion` | persones | Un estat passa d'unitat a unitat pel contacte o la proximitat i es propaga pel mapa. |
| `territoriality` | persones | Les unitats mantenen distància entre elles i s'aferren al seu propi terreny. |
| `interaction-network` | persones | Qui lluita, qui dona suport i a qui segueix formen una xarxa amb nodes, grups i ponts. |

### Conceptes (135) {#concepts-135}

| id | títol | lents | patrons | fonts |
|---|---|---|---|---|
| `concept.lanchester-square` | Llei quadrada de Lanchester (foc dirigit) | militar, aire, naval, esports | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Llei lineal de Lanchester (foc d'àrea, un contra un) | militar, urbà, esports | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Concentració de la força (massa) | militar, aire, naval, esports | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Proporcions de força i la regla 3:1 | militar | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Proporció d'intercanvi de pèrdues | militar, aire, esports, disseny | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Poder de combat i els seus multiplicadors | militar | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | El sistema modern d'ús de la força | militar | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | El cicle OODA (observar, orientar, decidir, actuar) | militar, aire, esports | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Teoria d'energia i maniobrabilitat | aire | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Maniobres bàsiques de caça i maniobra de combat aeri | aire | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Anàlisi del terreny: OAKOC / KOCOA | militar, disseny, urbà | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: variables de la missió | militar | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Terreny clau i terreny decisiu | militar, disseny, esports | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Observació i camps de tir | militar, disseny, esports, urbà | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Cobertura i ocultació | militar, urbà, disseny | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Eixos d'aproximació i corredors de mobilitat | militar, disseny | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Colls d'ampolla i passos estrets | militar, disseny, esports | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Àrees de combat i zones de mort | militar, urbà, disseny | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Defensa de contrapendent i rasant | militar, disseny | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | El terreny elevat | militar, disseny | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Línies interiors i exteriors | militar | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Derrota per parts | militar, esports | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Suport mutu | militar, aire, esports | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Armes combinades | militar, disseny | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Supressió | militar, urbà | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Supressió i destrucció de les defenses antiaèries enemigues (SEAD/DEAD) | aire, militar | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Patrulla aèria de combat i superioritat aèria | aire | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Combat més enllà de l'abast visual | aire | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | L'aproximació indirecta | militar, esports, disseny | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Enveliment i encerclament | militar | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Emboscada | militar, esports, disseny | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Defensa en profunditat | militar | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Fricció i la boira de la guerra | militar, esports | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Punt culminant de l'atac | militar | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Sorpresa | militar, aire, naval, esports | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Economia de la força | militar, esports | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Terreny urbà | urbà, militar, esports | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Control del mar i la batalla decisiva de la flota | naval | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Model d'andanada de Hughes: atacar efectivament primer | naval, aire | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Teoria de la recerca i la detecció | naval, aire, militar | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Recerca operativa: mesures d'efectivitat | militar, aire, naval, disseny | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Jocs de guerra com a anàlisi | militar, disseny | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Guerra de maniobra | militar, esports | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Cohesió i el factor moral | militar | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Centre de gravetat | militar | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Punts decisius | militar, esports | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Línies d'operació | militar | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Estratègies d'aniquilació i esgotament | militar | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Batalla en profunditat i operacions en profunditat | militar | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | militar, aire | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Comandament per missió (Auftragstaktik) | militar, esports | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Ruptura i explotació | militar | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Foc i moviment | militar, esports | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Avançament per salts amb cobertura | militar, esports | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Atracció per reconeixement i infiltració | militar, esports | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | La reserva | militar, esports | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Defensa elàstica i contraatac | militar | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | La cadena de mort (trobar, fixar, seguir, apuntar, atacar, avaluar) | militar, aire, naval | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Abast de detecció contra abast de combat | aire, naval, militar | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Valor d'efectivitat de combat | militar, esports | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Dispersió al camp de batalla | militar, esports | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Suport aeri a prop | aire, militar | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Interdicció aèria | aire, militar | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Escorta contra escombrada de caces | aire | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Combat d'energia contra combat de gir | aire | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Persecució de guia, pura i de cua | aire | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | El zigzag de Thach | aire | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | La formació de quatre dits i la parella de combat | aire | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Flota existent | naval | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Travessar la T | naval, militar | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Comboi | naval | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Accés denegat i negació d'àrea | naval, aire, militar | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Defensa de punts forts en zones edificades | urbà, militar | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Perforar parets i moure's entre edificis | urbà, militar, disseny | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Setge | militar, urbà | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Guerra de guerrilles | militar, urbà | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Contrainsurgència | militar, urbà | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Santuari | militar, disseny | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Engany (maskirovka) | militar, esports | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Avantatge d'informació | militar, esports | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Rondes d'economia i ritme de recursos | esports, disseny | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Formacions de moviment: línia, columna, falca, esglaó | militar, esports | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Atac frontal | militar | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Doble enveliment (la pinça) | militar | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Encerclament i la bossa | militar | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Penetració i ruptura | militar | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Persecució | militar | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Retrocés: retirada, dilació i fugida | militar | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Fintes i demostracions | militar, esports | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Pantalla, guàrdia i cobertura: seguretat davant del cos principal | militar | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Defensa contra un míssil: crank, notch, drag i pump | aire | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Formacions més enllà de l'abast visual: mur, guia-cua, trituradora, pinça | aire | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | El combat d'angles i el combat d'energia | aire | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Paquet d'atac i seqüenciació de la supressió | aire | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | La línia de batalla | naval | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | L'embut fatal | urbà, militar, esports, disseny | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Neteja de sales: sorpresa, rapidesa, violència controlada | urbà, militar, esports | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Punts de domini | urbà, militar, esports | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Revisar els racons: tallar el pastís | urbà, militar, esports | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Foc creuat i camps de tir entrellaçats | militar, urbà, esports, disseny | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | L'avantatge de qui surt a la vista | esports, disseny | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Avantatge numèric en rondes d'eliminació | esports, militar | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Entrada i el duel inicial | esports, urbà | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Utilitat abans de l'entrada: flaix i fum | esports, urbà, militar | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Model de forces socials del moviment de vianants | disseny, urbà, militar | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Formació de carrils en flux contrari | disseny, urbà | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Anar més ràpid és anar més lent | disseny, urbà, militar | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | El diagrama fonamental de les multituds | disseny, urbà | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Formació de senders i línies de desig | disseny, militar | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | El pànic és rar: resiliència col·lectiva | militar, urbà, disseny | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: separació, alineació, cohesió | disseny, militar | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Paràmetre d'ordre i l'inici del moviment col·lectiu | disseny, militar, aire, naval | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Estats d'eixam, de remolí i polaritzats | disseny, militar, naval | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Lideratge efectiu sense senyals | militar, esports, disseny | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Veïns per nombre, no per distància | aire, militar | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Intel·ligència d'eixam | disseny, esports, militar | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Ramat i cascades d'informació | esports, disseny, militar | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Gandulejar en grup | esports, disseny, militar | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Difusió de la responsabilitat | esports, militar | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Cohesió del grup primari | militar, esports | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Punts de ruptura i llindars de baixes | militar | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Supressió: què fa el foc a part de matar | militar, urbà | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Por i estrès en les decisions de combat | militar, esports | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Ensorrar-se sota pressió | esports | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Teoria de les perspectives i aversió a la pèrdua | esports, disseny | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Efectes del punt d'equilibri i dels diners del casino | esports | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Tilt | esports | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Cost enfonsat | esports, militar | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | La mà calenta i la seva fal·làcia | esports | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Estratègies mixtes: ser imprevisible | esports, disseny, militar | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Models mentals compartits | esports, militar | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Els components del treball en equip | esports, militar | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Els mons virtuals com a laboratoris del comportament | disseny, esports | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Espai personal i territori | disseny, urbà | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Xarxes d'interacció: nodes i vincles febles | esports, disseny | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |
### Mètodes (37) {#methods-37}

| id | títol | patrons | fonts |
|---|---|---|---|
| `method.lanchester-fit` | Ajust dels exponents de Lanchester a les dades de combat | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Proporció d'intercanvi per bàndol i per lloc | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Proporció de força local en el moment de cada mort | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Àrea visible: camps de tir per línia de visió | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Energia específica en les morts i les baixes (aire) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Persistència dels punts calents entre partides | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Taxa d'intercanvis (suport mutu) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Combats i avantatge de la primera mort | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Autocorrelació espacial de les morts (I de Moran) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Taxes respecte a la base del mapa, amb control de FDR | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Preparació de la intel·ligència del camp de batalla (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Models de valoració per comparació per parells (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Probabilitat de victòria i valoració d'accions | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Control de l'espai i control del terreny de joc | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Equació d'andanada ajustada a vaixells en contacte | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Proporció d'efectivitat de combat per unitat-hora en acció | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Abast de detecció a combat i abast de combat | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Temporització de la cadena de mort | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Dispersió contra la quota de morts (concentració de la força en el temps) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Taxa de pèrdues i morts per missió | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Model de probabilitat de guanyar la ronda | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Valor d'acció: probabilitat de victòria afegida | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Més-menys ajustat per regressió de cresta (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Contracció: Bayes empíric | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Resultats esperats: dels gols esperats als duels esperats | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Mesurar preparacions, rotacions i esperes | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | El problema del reflex: còpia o causa comuna | herding, conformity | Manski 1993 |
| `method.streak-correction` | Ratxes amb la correcció de seqüències finites | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Paràmetres d'ordre de polarització i de remolí | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Líders per correlació de rumb amb retard | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Prova de cascada de rutes per al ramat | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Segregació de carrils i persistència de senders | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Risc dels rezagats | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Corba de ruptura | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Resposta al foc que arriba | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Risc després d'una pèrdua o d'un guany | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Acord de compres (kappa de Fleiss) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Casos històrics (277) {#historical-cases-277}

| id | cas | quan | escala | patrons | fonts |
|---|---|---|---|---|---|
| `case.thermopylae` | Termòpiles | 480 aC | batalla | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamina | 480 aC | batalla | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Marató | 490 aC | batalla | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuctres | 371 aC | batalla | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331 aC | batalla | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Llac Trasimè | 217 aC | batalla | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Canes | 216 aC | batalla | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Bosc de Teutoburg | dC 9 | batalla | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | batalla | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Pont de Stirling | 1297 | batalla | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Azincourt | 1415 | batalla | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen | 1757 | batalla | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlitz | 1805 | batalla | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | batalla | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | batalla | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: els alts de Marye | 1862 | combat | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | combat | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: la càrrega de Pickett | 1863 | combat | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | batalla | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | combat | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | campanya | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | La Somme, primer dia | 1 de juliol de 1916 | batalla | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | campanya | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jutlàndia | 1916 | batalla | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939-40 | batalla | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan i les Ardenes | maig de 1940 | campanya | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Contraatac d'Arràs | 21 de maig de 1940 | combat | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Batalla d'Anglaterra | de juliol a octubre de 1940 | campanya | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Batalla de l'Atlàntic: recerca operativa dels convois | 1939-45 | campanya | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | juny de 1942 | batalla | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Segona Alamein | d'octubre a novembre de 1942 | batalla | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Pas de Kasserine | febrer de 1943 | batalla | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Stalingrad | d'agost de 1942 a febrer de 1943 | campanya | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kursk | juliol de 1943 | campanya | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prokhorovka | 12 de juliol de 1943 | combat | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13 de juny de 1944 | combat | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Bocatges de Normandia | de juny a juliol de 1944 | campanya | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Operació Cobra | juliol de 1944 | campanya | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Golf de Leyte | octubre de 1944 | batalla | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | desembre de 1944 | batalla | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Tsushima | maig de 1905 | batalla | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Incheon | setembre de 1950 | campanya | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | Carrer dels MiG | 1950-53 | campanya | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | batalla | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | novembre de 1965 | combat | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operació Bolo | 2 de gener de 1967 | combat | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golan: la vall de les llàgrimes | octubre de 1973 | batalla | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Sinaí: la Granja Xinesa | octubre de 1973 | batalla | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Vall de la Bekaa (Operació Mole Cricket 19) | juny de 1982 | batalla | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Guerra aèria de les Malvines | de maig a juny de 1982 | campanya | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Campanya aèria de Tempesta del Desert | de gener a febrer de 1991 | campanya | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26 de febrer de 1991 | combat | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadiscio | octubre de 1993 | combat | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Grozni | de desembre de 1994 a febrer de 1995 | batalla | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hue | de gener a març de 1968 | batalla | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Campanya aèria del Kosovo | de març a juny de 1999 | campanya | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Faluja (Operació Al Fajr) | novembre de 2004 | batalla | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mossul | 2016-17 | campanya | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Qadesh | c. 1274 aC | batalla | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Issos | 333 aC | batalla | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 aC | batalla | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Carres | 53 aC | batalla | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Farsàlia | 48 aC | batalla | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianòpolis | dC 378 | batalla | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Yarmuk | dC 636 | batalla | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manzikert | 1071 | batalla | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hattín | 1187 | batalla | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburn | 1314 | batalla | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Crécy | 1346 | batalla | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Poitiers | 1356 | batalla | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunwald (Tannenberg) | 1410 | batalla | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeld | 1631 | batalla | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blenheim | 1704 | batalla | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Poltava | 1709 | batalla | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rossbach | 1757 | batalla | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | campanya | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | batalla | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena-Auerstedt | 1806 | batalla | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodino | 1812 | batalla | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Leipzig | 1813 | batalla | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | batalla | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | batalla | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | campanya | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadowa) | 1866 | batalla | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | batalla | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | batalla | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurman | 1898 | batalla | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | combat | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Gal·lípoli | 1915 | campanya | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | novembre de 1917 | batalla | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Caporetto | octubre-novembre de 1917 | campanya | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | L'ofensiva alemanya de primavera (Operació Michael) | març-abril de 1918 | campanya | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | agost de 1918 | batalla | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Khalkhin Gol (Nomonhan) | agost de 1939 | batalla | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | La campanya de Polònia | setembre de 1939 | campanya | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut i Gembloux | maig de 1940 | batalla | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | maig de 1940 | combat | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | El perímetre de Dunkerque | maig-juny de 1940 | campanya | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operació Compass i Beda Fomm | desembre de 1940 a febrer de 1941 | campanya | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Operació Crusader i Sidi Rezegh | novembre-desembre de 1941 | campanya | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | maig-juny de 1942 | batalla | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alam Halfa | agost-setembre de 1942 | batalla | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno-Brody | juny de 1941 | batalla | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Encerclament de Kíev | setembre de 1941 | campanya | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moscou | octubre de 1941 a gener de 1942 | campanya | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Rjev i Operació Mart | 1942 | campanya | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Segona Kharkov | maig de 1942 | batalla | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Tercera Kharkov (el cop de revés de Manstein) | febrer-març de 1943 | campanya | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operació Bagration | juny-agost de 1944 | campanya | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Bossa de Korsun-Txerkassi | gener-febrer de 1944 | batalla | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Bossa de Kamenets-Podolski | març-abril de 1944 | campanya | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operació Epsom | juny de 1944 | batalla | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operació Goodwood | juliol de 1944 | batalla | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operació Totalize | agost de 1944 | batalla | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | agost de 1944 | batalla | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Bossa de Falaise | agost de 1944 | campanya | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden i Arnhem | setembre de 1944 | campanya | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Aquisgrà | octubre de 1944 | batalla | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Bosc de Hürtgen | setembre de 1944 a febrer de 1945 | campanya | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | setembre de 1944 | batalla | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | Sankt Vith | desembre de 1944 | batalla | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Serra d'Elsenborn | desembre de 1944 | batalla | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Altures de Seelow | abril de 1945 | batalla | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlín | abril-maig de 1945 | batalla | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operació Spring Awakening | març de 1945 | batalla | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | desembre de 1943 | batalla | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Aixecament de Varsòvia | agost-octubre de 1944 | campanya | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | novembre de 1943 | batalla | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | setembre-novembre de 1944 | batalla | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | febrer-març de 1945 | batalla | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinawa | abril-juny de 1945 | campanya | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manila | febrer-març de 1945 | batalla | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Manxúria (Tempesta d'agost) | agost de 1945 | campanya | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Perímetre de Busan | agost-setembre de 1950 | campanya | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Embassament de Chosin | novembre-desembre de 1950 | campanya | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Riu Imjin | abril de 1951 | batalla | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapyong | abril de 1951 | batalla | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | abril i juliol de 1953 | combat | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | gener-abril de 1968 | batalla | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | novembre de 1967 | batalla | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (muntanya Ap Bia) | maig de 1969 | combat | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila-Um Katef | juny de 1967 | batalla | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailia | octubre de 1973 | batalla | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | juny de 1982 | combat | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Setge de Beirut | juny-agost de 1982 | campanya | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Líban 2006: Bint Jbeil i l'amenaça antitanc | juliol-agost de 2006 | campanya | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Faw | febrer de 1986 | batalla | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basora (Karbala-5) | gener-febrer de 1987 | batalla | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Khafji | gener-febrer de 1991 | batalla | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Objectiu Norfolk | 26-27 de febrer de 1991 | batalla | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medina Ridge | 27 de febrer de 1991 | batalla | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Fintes de Wadi al-Batin | febrer de 1991 | campanya | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nasiriyah | març de 2003 | batalla | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Objectiu Peach | abril de 2003 | combat | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Les Thunder Runs | abril de 2003 | batalla | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Pas de Debecka | abril de 2003 | combat | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramadi | 2006-07 | campanya | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Ciutat de Sadr | març-maig de 2008 | batalla | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Operació Anaconda | març de 2002 | batalla | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | juliol de 2008 | combat | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | octubre de 2009 | combat | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala i els pobles de la secció | 2006-07 | campanya | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Batalla d'Alger | 1956-57 | campanya | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Fireforce de Rhodèsia | 1974-79 | campanya | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Setge de Sarajevo | 1992-96 | campanya | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Grozni 1999-2000 | desembre de 1999 a febrer de 2000 | batalla | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Guerra russo-georgiana | agost de 2008 | campanya | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillia | juliol de 2014 | combat | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovaisk | agost de 2014 | batalla | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debaltsevé | gener-febrer de 2015 | batalla | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Aeroport de Donetsk | setembre de 2014 a gener de 2015 | batalla | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Aeroport de Hostomel | febrer de 2022 | combat | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | L'eix de Kíev i l'emboscada de Brovary | març de 2022 | combat | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Mariúpol i Azovstal | febrer-maig de 2022 | batalla | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Contraofensiva de Kharkiv | setembre de 2022 | campanya | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Creuament del Siverskyi Donets a Bilohorivka | maig de 2022 | combat | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bakhmut | agost de 2022 a maig de 2023 | batalla | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Ofensiva de Zaporíjia | juny-novembre de 2023 | campanya | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Guerra del Nagorno-Karabakh | setembre-novembre de 2020 | campanya | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | El Blitz | setembre de 1940 a maig de 1941 | campanya | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarroja: el primer dia a l'aire | 22 de juny de 1941 | batalla | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Creta | maig de 1941 | batalla | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | El setge de Malta | 1940-1942 | campanya | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | El pont aeri de Stalingrad | novembre de 1942 a febrer de 1943 | campanya | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Batalles aèries sobre el Kuban | abril-juny de 1943 | campanya | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kursk a l'aire | juliol de 1943 | batalla | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operació Bagration a l'aire | juny-agost de 1944 | campanya | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploiești (Operació Tidal Wave) | 1 d'agost de 1943 | combat | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | L'atac a les preses (Operació Chastise) | 16-17 de maig de 1943 | combat | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hamburg (Operació Gomorra) | juliol-agost de 1943 | batalla | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt-Ratisbona | 17 d'agost de 1943 | batalla | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Segona Schweinfurt («Dijous negre») | 14 d'octubre de 1943 | combat | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | La Gran Setmana (Operació Argument) | febrer de 1944 | campanya | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | L'atac a Nuremberg | 30-31 de març de 1944 | combat | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operació Bodenplatte | 1 de gener de 1945 | batalla | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Batalla del mar de Bismarck | març de 1943 | batalla | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Neutralitzar Rabaul | 1943-1944 | campanya | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Mar de les Filipines («El tir al pavo de les Marianes») | juny de 1944 | batalla | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | El dimarts negre sobre Namsi | 23 d'octubre de 1951 | combat | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operació Rolling Thunder | 1965-1968 | campanya | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | El pont de Thanh Hoa | 1965-1972 | combat | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | Els Wild Weasel | 1965-1973 | campanya | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | L'informe d'Ault i Top Gun | 1968-1972 | campanya | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operació Linebacker | de maig a octubre de 1972 | campanya | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II («la guerra de onze dies») | desembre de 1972 | campanya | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operació Focus (Moked) | 5 de juny de 1967 | batalla | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Guerra d'desgast: el cinturó de míssils | 1969-1970 | campanya | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | El paraigua SAM sobre el canal | octubre de 1973 | batalla | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (Operació Opera) | 7 de juny de 1981 | combat | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operació El Dorado Canyon | 15 d'abril de 1986 | combat | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | La guerra aèria Iran-Iraq | 1980-1988 | campanya | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Les incursions Black Buck | de maig a juny de 1982 | combat | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: planificar la campanya aèria del Golf | d'agost de 1990 a gener de 1991 | campanya | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: el primer atac d'Apache | 17 de gener de 1991 | combat | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | La gran caça de Scud | de gener a febrer de 1991 | campanya | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Serra de Mutla («la carretera de la mort») | 26-27 de febrer de 1991 | combat | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operació Anaconda: Apaches a Shahi-Kot | març de 2002 | batalla | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | L'atac d'Apache a Karbala | 24 de març de 2003 | combat | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | La campanya aèria de Líbia | de març a octubre de 2011 | campanya | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Nagorno-Karabakh: drons i defenses antiaèries | setembre-novembre de 2020 | campanya | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ucraïna: l'aire disputat | 2022 | campanya | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Aeroport de Hostomel | febrer de 2022 | combat | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | febrer-març de 1971 | campanya | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operació Eagle Claw | abril de 1980 | combat | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afganistan: el Stinger | 1986-1989 | campanya | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepant | 1571 | batalla | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | L'Armada Invencible | 1588 | campanya | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Badia de Quiberon | 1759 | batalla | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | La badia de Chesapeake (cap de Virgínia) | 1781 | batalla | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | El Nil (badia d'Aboukir) | 1798 | batalla | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Copenhaguen | 1801 | batalla | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | març de 1862 | combat | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lissa | 1866 | batalla | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | El Yalu | 1894 | batalla | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Badia de Manila | 1898 | batalla | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Golf de Heligoland | agost de 1914 | batalla | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel i les Malvines | novembre-desembre de 1914 | campanya | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Dogger Bank | gener de 1915 | batalla | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | El Riu de la Plata | desembre de 1939 | batalla | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Tàranto | novembre de 1940 | combat | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Cap Matapan | març de 1941 | batalla | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Estret de Dinamarca i l'enfonsament del Bismarck | maig de 1941 | campanya | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7 de desembre de 1941 | combat | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales i Repulse | 10 de desembre de 1941 | combat | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | El mar de Java | febrer de 1942 | batalla | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | El mar del Coral | maig de 1942 | batalla | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Illa de Savo | agost de 1942 | batalla | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Les Salomons Orientals | agost de 1942 | batalla | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Cap Esperance | octubre de 1942 | batalla | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Illes Santa Cruz | octubre de 1942 | batalla | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Batalla naval de Guadalcanal | 12-15 de novembre de 1942 | batalla | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | novembre de 1942 | combat | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | La cursa pel Canal | febrer de 1942 | combat | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operació Pedestal | agost de 1942 | batalla | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | El maig negre | maig de 1943 | campanya | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Cap Nord | desembre de 1943 | batalla | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | La campanya de submarins dels EUA contra el Japó | 1941-1945 | campanya | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Davant de Samar | 25 d'octubre de 1944 | batalla | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Estret de Surigao | 25 d'octubre de 1944 | batalla | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinawa: la campanya dels kamikaze | abril-juny de 1945 | campanya | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | L'enfonsament de l'Eilat | octubre de 1967 | combat | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakia | octubre de 1973 | batalla | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | L'enfonsament del General Belgrano | 2 de maig de 1982 | combat | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | La pèrdua del HMS Sheffield | 4 de maig de 1982 | combat | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17 de maig de 1987 | combat | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operació Praying Mantis | 18 d'abril de 1988 | batalla | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | agost de 2004 | combat | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | La revolució del Bisu | març de 2007 | batalla | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | El Dream Coil a The International 2013 | agost de 2013 | combat | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | El Zed de Faker contra Ryu | setembre de 2013 | combat | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | El salt de l'Overpass | novembre de 2014 | combat | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | El AWP que salta a Mirage | abril de 2016 | combat | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis i l'era dels utilitaris | 2018 | campanya | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five contra OG | abril de 2019 | batalla | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar arriba a gran mestre | 2019 | campanya | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | El gancho per l'esquerra (ofensiva terrestre de la Tempesta del Desert) | 24-28 de febrer de 1991 | campanya | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | L'incident de la Sang Corrompuda | setembre de 2005 | campanya | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Disseny de nivells i de joc (17) {#game-and-level-design-17}

| id | títol | patrons | fonts |
|---|---|---|---|
| `design.chokepoint` | Colls d'ampolla en el disseny de nivells | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Rutes de flanqueig i camins alternatius | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Línies de visió i distància de combat | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Col·locació i ritme de la cobertura | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Disseny d'aparicions i protecció en aparèixer | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Equilibri de mapes simètrics i asimètrics | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Equilibri de classes i contrapesos | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Flux, bucles i dissenys llegibles | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Economies de joc i bucles de retroalimentació | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Emparellament i dispersió d'habilitat | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | Rivals IA com a sondes del nivell | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Joc significatiu i elecció | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Intercanvis i treball en equip als shooters | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Control del mapa | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Mapes de calor i telemetria espacial en el disseny | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Domini, aprenentatge i diversió | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Economies de ronda i decisions de compra | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Estudis (113) {#studies-113}

| id | títol | fonts |
|---|---|---|
| `study.engel-1954` | Engel: la llei quadrada de Lanchester a Iwo Jima | Engel 1954 |
| `study.bracken-1995` | Bracken: models de Lanchester a les Ardenes | Bracken 1995 |
| `study.fricker-1998` | Fricker: models d'desgast a les Ardenes revisats | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas i Turkes: Kursk i les Ardenes | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley i Helmbold: validar la llei quadrada | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | Anàlisi GIS de les morts dels jugadors | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: visualitzar el comportament competitiu | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Valorar accions a Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Detecció d'encontres a l'esport electrònic | Schubert et al. 2016 |
| `study.red-baron` | Projecte Red Baron: combat aeri sobre el Vietnam | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: judici quantificat de batalles històriques | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: l'ús de la força explica els resultats | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Revisió de la visualització de dades de joc | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Lanchester davant de tres segles de batalles terrestres | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: seixanta combats de la Segona Guerra Mundial | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: models de combat i la Guerra de Secessió dels EUA | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: un model estadístic de dades d'desgast | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: ritmes d'avanç en combat terrestre | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas i Dinges: les circumstàncies importen més que la llei | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | La base de dades de Kursk | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | La base de dades de la campanya de les Ardenes | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson i MacKay: la batalla d'Anglaterra com a dades de Lanchester | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte i Schmidt: els números encara guanyen batalles | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: regularitats de les baixes en batalla | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | El model numèric determinista tàctic de Dupuy | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: la guerra en números | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: la capacitat de combat | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter i Stam: les democràcies en guerra | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: el model dinàmic adaptatiu | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester i la guerra de guerrilles | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: el model estocàstic d'andanades | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: les pedres angulars de la tàctica de flota | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | El debat sobre la regla 3:1 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: modelar conflictes armats | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | L'informe d'Ault: míssils disparats fora de la seva envolupant | Ault 1969; Michel 1997 |
| `study.gwaps` | Gulf War Air Power Survey | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | El circ de Blackett | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Ajustaments de les càrregues de profunditat al Coastal Command | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Parts inferiors blanques per a avions antisubmarins | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: blindatge on no eren tocats els bombarders que tornaven | Mangel & Samaniego 1984 |
| `study.optimal-search` | Cerca òptima: dels submarins a l'AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: combat a l'infern | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Accés denegat i negació d'àrea | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Com els jugadors perden l'interès | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Agrupar el comportament dels jugadors en joc real | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Detectar la frustració del jugador | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: taulers de telemetria en producció | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: analítica visual del joc | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Moviment d'avatars als camps de batalla de World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: instrumentar proves d'usuari a gran escala | Kim et al. 2008 |
| `study.game-data-science` | Ciència de dades del joc | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Intel·ligència artificial i jocs | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Habilitat i moviment d'equip a Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Patrons de combat que anticipen victòries als MOBA | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Rols dels jugadors a Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Predir els resultats de Dota 2 a partir dels equips | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Predicció de victòria en directe a l'esport electrònic professional | Hodge et al. 2021 |
| `study.rioult-2014` | Topologia de les posicions dels jugadors | Rioult et al. 2014 |
| `study.bednarek-2017` | Avaluar jugadors en shooters per equips | Bednárek et al. 2017 |
| `study.katona-2019` | Predir qui morirà després | Katona et al. 2019 |
| `study.block-2018` | Històries basades en dades per al públic de l'esport electrònic | Block et al. 2018 |
| `study.ggviz` | ggViz: cercar estats de joc a gran escala | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: aprenentatge per reforç a gran escala a Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: nivell de gran mestre a StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Valor esperat de la possessió al bàsquet | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: valorar accions amb la pilota al futbol | Decroos et al. 2019 |
| `study.pitch-control` | Control del terreny de joc i creació d'espai | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | L'estructura espacial de l'habilitat defensiva | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Rols d'equip a partir de dades de seguiment | Lucey et al. 2013 |
| `study.shot-quality` | Gols esperats i qualitat del tir | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: eficiència espacial del tir | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Anàlisi espaciotemporal dels esports d'equip | Gudmundsson & Horton 2017 |
| `study.ripley-k` | K de Ripley: agrupament a cada escala | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark i Evans: dispersió del veí més proper | Clark & Evans 1954 |
| `study.getis-ord` | Punts calents de Getis-Ord | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Indicadors locals d'associació espacial | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | L'estadístic d'exploració espacial | Kulldorff 1997 |
| `study.kde` | Estimació de densitat amb nucli | Silverman 1986 |
| `study.knox-1964` | Interacció espaciotemporal | Knox 1964; Diggle 2013 |
| `study.maup` | El problema de la unitat espacial modificable | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Isòvistes i grafs de visibilitat | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Sintaxi espacial | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Aglomeració mitjana | Lloyd 1967 |
| `study.survival-analysis` | Anàlisi de supervivència per al temps fins a la mort | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Models lineals generalitzats per a recomptes | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap i intervals d'estimació | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey et al.: latència i l'avantatge de qui surt | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee i Chang: disparar des d'una cantonada | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: la latència i les accions del jugador | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos et al.: professionals i aficionats a través de la probabilitat de victòria | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos et al.: decisions econòmiques a Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: morts intel·ligents i baixes sense valor | Maymin 2021 |
| `study.moba-live-prediction` | Predicció del resultat en directe als MOBA | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa et al.: rondes de Valorant a partir de característiques tàctiques | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv et al.: rols a Counter-Strike 2 professional | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim et al.: entrenar el combat de proximitat | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Turbulència de la multitud al Hajj de 2006 | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Els grups que caminen donen forma a les multituds | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Dinàmica jeràrquica de grups en estols de coloms | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | La influència social fa l'èxit desigual i imprevisible | Salganik et al. 2006 |
| `study.wisdom-undermined` | La influència social debilita la saviesa de les multituds | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | El poder d'atracció d'una multitud | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Conformitat amb una majoria unànime | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: la motivació de combat a l'Iraq | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Cohesió i rendiment: metaanàlisi | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Aversió a la pèrdua entre golfistes professionals | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | La mà calenta al beisbol | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Penals: els professionals juguen minimax | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | El joc minimax a Wimbledon | Walker & Wooders 2001 |
| `study.collective-intelligence` | Intel·ligència col·lectiva dels equips | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Xarxes socials d'un món en línia | Szell et al. 2010 |
| `study.team-networks` | Xarxes de passades i rendiment d'equip | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | El comportament es propaga per xarxes agrupades | Centola 2010 |

### Bibliografia {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(revisat 2026-11-15: detall)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(revisat 2026-11-15: detall)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(revisat 2026-11-15: detall)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(revisat 2026-11-15: detall)*
- Ammianus Marcellinus (trans. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(domini públic)* *(revisat 2026-11-15: detall)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(revisat 2026-11-15: detall)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(revisat 2026-11-15: detall)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(revisat 2026-11-15: detall)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(revisat 2026-11-15: detall)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(domini públic)* *(revisat 2026-11-15: detall)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(revisat 2026-11-15: detall)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(revisat 2026-11-15: detall)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(domini públic)* *(revisat 2026-11-15: existència)*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(domini públic)* *(revisat 2026-11-15: detall)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(revisat 2026-11-15: detall)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(revisat 2026-11-15: detall)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(revisat 2026-11-15: detall)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(revisat 2026-11-15: detall)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(revisat 2026-11-15: detall)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(revisat 2026-11-15: detall)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(revisat 2026-11-15: detall)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(revisat 2026-11-15: detall)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(revisat 2026-11-15: detall)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(revisat 2026-11-15: detall)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(revisat 2026-11-15: detall)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(revisat 2026-11-15: detall)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(revisat 2026-11-15: detall)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(revisat 2026-11-15: detall)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(revisat 2026-11-15: detall)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(revisat 2026-11-15: detall)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(revisat 2026-11-15: detall)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(revisat 2026-11-15: existència)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(revisat 2026-11-15: detall)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(revisat 2026-11-15: detall)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(revisat 2026-11-15: detall)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(revisat 2026-11-15: detall)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(revisat 2026-11-15: detall)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(revisat 2026-11-15: detall)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(revisat 2026-11-15: existència)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(revisat 2026-11-15: detall)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(revisat 2026-11-15: detall)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(revisat 2026-11-15: detall)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(revisat 2026-11-15: detall)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(revisat 2026-11-15: detall)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(revisat 2026-11-15: detall)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(revisat 2026-11-15: existència)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(revisat 2026-11-15: detall)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(revisat 2026-11-15: detall)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(revisat 2026-11-15: detall)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(revisat 2026-11-15: detall)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(revisat 2026-11-15: existència)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(revisat 2026-11-15: detall)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(revisat 2026-11-15: detall)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(revisat 2026-11-15: detall)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(revisat 2026-11-15: detall)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(revisat 2026-11-15: existència)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(revisat 2026-11-15: detall)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(revisat 2026-11-15: detall)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(revisat 2026-11-15: detall)*
- Caesar, G. J. (trans. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(domini públic)* *(revisat 2026-11-15: detall)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(revisat 2026-11-15: detall)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(revisat 2026-11-15: detall)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(revisat 2026-11-15: detall)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(revisat 2026-11-15: detall)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(revisat 2026-11-15: detall)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(revisat 2026-11-15: detall)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(revisat 2026-11-15: detall)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(revisat 2026-11-15: detall)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(revisat 2026-11-15: detall)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(domini públic)* *(revisat 2026-11-15: detall)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(revisat 2026-11-15: detall)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(revisat 2026-11-15: detall)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(revisat 2026-11-15: detall)*
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(domini públic)* *(revisat 2026-11-15: existència)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(revisat 2026-11-15: detall)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(revisat 2026-11-15: detall)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(revisat 2026-11-15: detall)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(domini públic)* *(revisat 2026-11-15: detall)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(domini públic)* *(revisat 2026-11-15: detall)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(revisat 2026-11-15: detall)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(revisat 2026-11-15: detall)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(revisat 2026-11-15: detall)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(revisat 2026-11-15: detall)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(domini públic)* *(revisat 2026-11-15: detall)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(domini públic)* *(revisat 2026-11-15: detall)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(domini públic)* *(revisat 2026-11-15: existència)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(domini públic)* *(revisat 2026-11-15: existència)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(domini públic)* *(revisat 2026-11-15: existència)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(revisat 2026-11-15: existència)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(revisat 2026-11-15: detall)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(revisat 2026-11-15: detall)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(revisat 2026-11-15: detall)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(revisat 2026-11-15: existència)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(revisat 2026-11-15: existència)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(revisat 2026-11-15: detall)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(revisat 2026-11-15: detall)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(revisat 2026-11-15: detall)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(revisat 2026-11-15: existència)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(revisat 2026-11-15: detall)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(revisat 2026-11-15: detall)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(revisat 2026-11-15: detall)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(revisat 2026-11-15: detall)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(revisat 2026-11-15: detall)*
- Delbrück, H. (trans. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(revisat 2026-11-15: existència)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(domini públic)* *(revisat 2026-11-15: existència)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(revisat 2026-11-15: detall)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(revisat 2026-11-15: detall)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(revisat 2026-11-15: detall)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(revisat 2026-11-15: detall)*
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(revisat 2026-11-15: detall)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(revisat 2026-11-15: detall)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(revisat 2026-11-15: detall)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(revisat 2026-11-15: detall)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(revisat 2026-11-15: existència)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(domini públic)* *(revisat 2026-11-15: detall)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(revisat 2026-11-15: detall)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(revisat 2026-11-15: detall)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(revisat 2026-11-15: detall)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(revisat 2026-11-15: detall)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(revisat 2026-11-15: detall)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(revisat 2026-11-15: detall)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(revisat 2026-11-15: detall)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(domini públic)* *(revisat 2026-11-15: detall)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(revisat 2026-11-15: detall)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(revisat 2026-11-15: detall)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(revisat 2026-11-15: existència)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(revisat 2026-11-15: detall)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(revisat 2026-11-15: detall)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(revisat 2026-11-15: detall)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(revisat 2026-11-15: detall)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(revisat 2026-11-15: detall)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(revisat 2026-11-15: detall)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(revisat 2026-11-15: detall)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(revisat 2026-11-15: detall)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(revisat 2026-11-15: detall)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(revisat 2026-11-15: detall)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(revisat 2026-11-15: detall)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(revisat 2026-11-15: detall)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(revisat 2026-11-15: detall)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(revisat 2026-11-15: detall)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(revisat 2026-11-15: detall)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(revisat 2026-11-15: detall)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(revisat 2026-11-15: detall)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(revisat 2026-11-15: detall)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(domini públic)* *(revisat 2026-11-15: detall)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(revisat 2026-11-15: detall)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(revisat 2026-11-15: existència)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(revisat 2026-11-15: detall)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(revisat 2026-11-15: detall)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(revisat 2026-11-15: detall)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(revisat 2026-11-15: detall)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(revisat 2026-11-15: detall)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(revisat 2026-11-15: detall)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(revisat 2026-11-15: detall)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(revisat 2026-11-15: detall)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(revisat 2026-11-15: detall)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(revisat 2026-11-15: detall)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(revisat 2026-11-15: detall)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(revisat 2026-11-15: detall)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(revisat 2026-11-15: detall)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(revisat 2026-11-15: detall)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(revisat 2026-11-15: detall)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(domini públic)* *(revisat 2026-11-15: existència)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(domini públic)* *(revisat 2026-11-15: detall)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(revisat 2026-11-15: detall)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(revisat 2026-11-15: detall)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(revisat 2026-11-15: detall)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(revisat 2026-11-15: detall)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(revisat 2026-11-15: detall)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(revisat 2026-11-15: detall)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(revisat 2026-11-15: detall)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(revisat 2026-11-15: detall)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(revisat 2026-11-15: detall)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(revisat 2026-11-15: detall)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(revisat 2026-11-15: detall)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(revisat 2026-11-15: detall)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(revisat 2026-11-15: detall)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(revisat 2026-11-15: detall)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(domini públic)* *(revisat 2026-11-15: detall)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(revisat 2026-11-15: detall)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(revisat 2026-11-15: detall)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(revisat 2026-11-15: detall)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(revisat 2026-11-15: detall)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(revisat 2026-11-15: detall)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(revisat 2026-11-15: detall)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(revisat 2026-11-15: detall)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(revisat 2026-11-15: detall)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(revisat 2026-11-15: detall)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(revisat 2026-11-15: detall)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(revisat 2026-11-15: detall)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(revisat 2026-11-15: detall)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(revisat 2026-11-15: detall)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(revisat 2026-11-15: detall)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(revisat 2026-11-15: detall)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(revisat 2026-11-15: detall)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(revisat 2026-11-15: detall)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(revisat 2026-11-15: detall)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(revisat 2026-11-15: detall)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(revisat 2026-11-15: detall)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(revisat 2026-11-15: detall)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(domini públic)* *(revisat 2026-11-15: detall)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(domini públic)* *(revisat 2026-11-15: detall)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(domini públic)* *(revisat 2026-11-15: existència)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(domini públic)* *(revisat 2026-11-15: existència)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(domini públic)* *(revisat 2026-11-15: existència)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(domini públic)* *(revisat 2026-11-15: detall)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(domini públic)* *(revisat 2026-11-15: detall)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(revisat 2026-11-15: detall)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(revisat 2026-11-15: detall)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(revisat 2026-11-15: detall)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(revisat 2026-11-15: detall)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(revisat 2026-11-15: detall)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(revisat 2026-11-15: detall)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(revisat 2026-11-15: detall)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(revisat 2026-11-15: detall)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(revisat 2026-11-15: existència)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(domini públic)* *(revisat 2026-11-15: existència)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(revisat 2026-11-15: detall)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(revisat 2026-11-15: detall)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(revisat 2026-11-15: detall)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(revisat 2026-11-15: detall)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(revisat 2026-11-15: detall)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(revisat 2026-11-15: detall)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(revisat 2026-11-15: detall)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(revisat 2026-11-15: detall)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(revisat 2026-11-15: detall)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(revisat 2026-11-15: detall)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(revisat 2026-11-15: detall)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(domini públic)* *(revisat 2026-11-15: detall)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(revisat 2026-11-15: detall)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(revisat 2026-11-15: detall)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(revisat 2026-11-15: detall)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(revisat 2026-11-15: detall)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(revisat 2026-11-15: detall)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(revisat 2026-11-15: detall)*
- Isserson, G. S. (trans. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(domini públic)* *(revisat 2026-11-15: detall)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(revisat 2026-11-15: detall)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(revisat 2026-11-15: detall)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(domini públic)* *(revisat 2026-11-15: detall)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(revisat 2026-11-15: detall)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(revisat 2026-11-15: detall)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(revisat 2026-11-15: detall)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(revisat 2026-11-15: detall)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(revisat 2026-11-15: detall)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(revisat 2026-11-15: existència)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(revisat 2026-11-15: detall)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(revisat 2026-11-15: detall)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(revisat 2026-11-15: detall)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(revisat 2026-11-15: detall)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(revisat 2026-11-15: detall)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(revisat 2026-11-15: detall)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(revisat 2026-11-15: detall)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(revisat 2026-11-15: detall)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(revisat 2026-11-15: detall)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(revisat 2026-11-15: detall)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(revisat 2026-11-15: detall)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(revisat 2026-11-15: detall)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(revisat 2026-11-15: detall)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(revisat 2026-11-15: existència)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(revisat 2026-11-15: detall)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(revisat 2026-11-15: detall)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(revisat 2026-11-15: detall)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(revisat 2026-11-15: detall)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(revisat 2026-11-15: detall)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(domini públic)* *(revisat 2026-11-15: detall)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(revisat 2026-11-15: detall)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(revisat 2026-11-15: detall)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(revisat 2026-11-15: detall)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(revisat 2026-11-15: detall)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(domini públic)* *(revisat 2026-11-15: existència)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(revisat 2026-11-15: detall)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(revisat 2026-11-15: existència)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(revisat 2026-11-15: detall)*
- Livy (trans. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(domini públic)* *(revisat 2026-11-15: existència)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(revisat 2026-11-15: detall)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(revisat 2026-11-15: detall)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(revisat 2026-11-15: detall)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(revisat 2026-11-15: detall)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(revisat 2026-11-15: existència)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(revisat 2026-11-15: detall)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(revisat 2026-11-15: detall)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(revisat 2026-11-15: detall)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(revisat 2026-11-15: detall)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(domini públic)* *(revisat 2026-11-15: detall)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(revisat 2026-11-15: detall)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(revisat 2026-11-15: detall)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(revisat 2026-11-15: detall)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(domini públic)* *(revisat 2026-11-15: detall)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(domini públic)* *(revisat 2026-11-15: detall)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(revisat 2026-11-15: existència)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(revisat 2026-11-15: detall)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(revisat 2026-11-15: detall)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(revisat 2026-11-15: detall)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(revisat 2026-11-15: detall)*
- Mao Tse-tung (trans. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(revisat 2026-11-15: existència)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(revisat 2026-11-15: detall)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(revisat 2026-11-15: detall)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(revisat 2026-11-15: detall)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(domini públic)* *(revisat 2026-11-15: detall)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(domini públic)* *(revisat 2026-11-15: detall)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(revisat 2026-11-15: detall)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(revisat 2026-11-15: detall)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(revisat 2026-11-15: detall)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(revisat 2026-11-15: detall)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(revisat 2026-11-15: detall)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(revisat 2026-11-15: detall)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(revisat 2026-11-15: detall)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(revisat 2026-11-15: existència)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(revisat 2026-11-15: detall)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(revisat 2026-11-15: detall)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(revisat 2026-11-15: detall)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(revisat 2026-11-15: detall)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(revisat 2026-11-15: detall)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(revisat 2026-11-15: detall)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(revisat 2026-11-15: detall)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(revisat 2026-11-15: detall)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(revisat 2026-11-15: detall)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(revisat 2026-11-15: detall)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(revisat 2026-11-15: detall)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(revisat 2026-11-15: existència)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(revisat 2026-11-15: existència)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(revisat 2026-11-15: detall)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(revisat 2026-11-15: detall)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(revisat 2026-11-15: detall)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(revisat 2026-11-15: detall)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(revisat 2026-11-15: detall)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(revisat 2026-11-15: existència)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(revisat 2026-11-15: existència)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(revisat 2026-11-15: detall)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(revisat 2026-11-15: detall)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(revisat 2026-11-15: existència)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(revisat 2026-11-15: detall)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(domini públic)* *(revisat 2026-11-15: detall)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(revisat 2026-11-15: detall)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(revisat 2026-11-15: detall)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(revisat 2026-11-15: detall)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(revisat 2026-11-15: detall)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(domini públic)* *(revisat 2026-11-15: detall)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(revisat 2026-11-15: detall)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(revisat 2026-11-15: detall)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(revisat 2026-11-15: detall)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(revisat 2026-11-15: detall)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(revisat 2026-11-15: detall)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(revisat 2026-11-15: detall)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(revisat 2026-11-15: detall)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(revisat 2026-11-15: detall)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(revisat 2026-11-15: detall)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(revisat 2026-11-15: existència)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(revisat 2026-11-15: detall)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(revisat 2026-11-15: detall)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(revisat 2026-11-15: detall)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(revisat 2026-11-15: detall)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(revisat 2026-11-15: detall)*
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(revisat 2026-11-15: detall)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(revisat 2026-11-15: detall)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(revisat 2026-11-15: detall)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(revisat 2026-11-15: detall)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(revisat 2026-11-15: detall)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(revisat 2026-11-15: detall)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(revisat 2026-11-15: detall)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(revisat 2026-11-15: detall)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(revisat 2026-11-15: detall)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(revisat 2026-11-15: detall)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(revisat 2026-11-15: detall)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(revisat 2026-11-15: detall)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(revisat 2026-11-15: detall)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(revisat 2026-11-15: detall)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(revisat 2026-11-15: detall)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(revisat 2026-11-15: detall)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(revisat 2026-11-15: detall)*
- Plutarch (trans. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(domini públic)* *(revisat 2026-11-15: existència)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(revisat 2026-11-15: detall)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(revisat 2026-11-15: detall)*
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(domini públic)* *(revisat 2026-11-15: existència)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(revisat 2026-11-15: detall)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(revisat 2026-11-15: detall)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(revisat 2026-11-15: detall)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(revisat 2026-11-15: detall)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(revisat 2026-11-15: detall)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(revisat 2026-11-15: detall)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(revisat 2026-11-15: detall)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(revisat 2026-11-15: detall)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(revisat 2026-11-15: detall)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(revisat 2026-11-15: detall)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(revisat 2026-11-15: detall)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(revisat 2026-11-15: detall)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(revisat 2026-11-15: detall)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(revisat 2026-11-15: detall)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(revisat 2026-11-15: detall)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(revisat 2026-11-15: detall)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(revisat 2026-11-15: detall)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(revisat 2026-11-15: detall)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(revisat 2026-11-15: detall)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(revisat 2026-11-15: detall)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(domini públic)* *(revisat 2026-11-15: detall)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(revisat 2026-11-15: detall)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(revisat 2026-11-15: existència)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(revisat 2026-11-15: existència)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(revisat 2026-11-15: existència)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(revisat 2026-11-15: existència)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(revisat 2026-11-15: detall)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(revisat 2026-11-15: detall)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(revisat 2026-11-15: detall)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(revisat 2026-11-15: detall)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(revisat 2026-11-15: detall)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(revisat 2026-11-15: detall)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(revisat 2026-11-15: detall)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(revisat 2026-11-15: detall)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(revisat 2026-11-15: existència)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(revisat 2026-11-15: detall)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(revisat 2026-11-15: detall)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(revisat 2026-11-15: detall)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(revisat 2026-11-15: detall)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(revisat 2026-11-15: existència)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(revisat 2026-11-15: detall)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(revisat 2026-11-15: existència)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(revisat 2026-11-15: detall)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(revisat 2026-11-15: detall)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(revisat 2026-11-15: detall)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(revisat 2026-11-15: detall)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(domini públic)* *(revisat 2026-11-15: detall)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(revisat 2026-11-15: detall)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(revisat 2026-11-15: existència)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(revisat 2026-11-15: detall)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(revisat 2026-11-15: detall)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(revisat 2026-11-15: detall)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(revisat 2026-11-15: detall)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(revisat 2026-11-15: detall)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(revisat 2026-11-15: detall)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(revisat 2026-11-15: detall)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(revisat 2026-11-15: detall)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(revisat 2026-11-15: detall)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(revisat 2026-11-15: detall)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(revisat 2026-11-15: detall)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(revisat 2026-11-15: existència)*
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(domini públic)* *(revisat 2026-11-15: detall)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(revisat 2026-11-15: detall)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(revisat 2026-11-15: detall)*
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(domini públic)* *(revisat 2026-11-15: existència)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(revisat 2026-11-15: detall)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(revisat 2026-11-15: detall)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(revisat 2026-11-15: detall)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(revisat 2026-11-15: detall)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(revisat 2026-11-15: detall)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(revisat 2026-11-15: detall)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(revisat 2026-11-15: detall)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(revisat 2026-11-15: detall)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(revisat 2026-11-15: detall)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(revisat 2026-11-15: detall)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(revisat 2026-11-15: detall)*
- Triandafillov, V. K. (trans. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(revisat 2026-11-15: detall)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(revisat 2026-11-15: detall)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(revisat 2026-11-15: detall)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(revisat 2026-11-15: detall)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(revisat 2026-11-15: detall)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(revisat 2026-11-15: detall)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(revisat 2026-11-15: detall)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(revisat 2026-11-15: existència)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(domini públic)* *(revisat 2026-11-15: existència)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(revisat 2026-11-15: detall)*
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(domini públic)* *(revisat 2026-11-15: existència)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(domini públic)* *(revisat 2026-11-15: detall)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(revisat 2026-11-15: detall)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(revisat 2026-11-15: detall)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(revisat 2026-11-15: detall)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(revisat 2026-11-15: detall)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(revisat 2026-11-15: detall)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(revisat 2026-11-15: detall)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(revisat 2026-11-15: detall)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(revisat 2026-11-15: detall)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(revisat 2026-11-15: existència)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(revisat 2026-11-15: detall)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(revisat 2026-11-15: existència)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(revisat 2026-11-15: existència)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(revisat 2026-11-15: detall)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(revisat 2026-11-15: existència)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(revisat 2026-11-15: detall)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(revisat 2026-11-15: detall)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(revisat 2026-11-15: detall)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(revisat 2026-11-15: detall)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(domini públic)* *(revisat 2026-11-15: detall)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(revisat 2026-11-15: detall)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(revisat 2026-11-15: detall)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(domini públic)* *(revisat 2026-11-15: detall)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(domini públic)* *(revisat 2026-11-15: detall)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(revisat 2026-11-15: existència)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(revisat 2026-11-15: detall)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(domini públic)* *(revisat 2026-11-15: detall)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(revisat 2026-11-15: detall)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(domini públic)* *(revisat 2026-11-15: detall)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(revisat 2026-11-15: detall)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(revisat 2026-11-15: detall)*
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(domini públic)* *(revisat 2026-11-15: detall)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(revisat 2026-11-15: detall)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(revisat 2026-11-15: detall)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(revisat 2026-11-15: detall)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(revisat 2026-11-15: existència)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(revisat 2026-11-15: detall)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(revisat 2026-11-15: existència)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(revisat 2026-11-15: existència)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(revisat 2026-11-15: detall)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(revisat 2026-11-15: detall)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(revisat 2026-11-15: detall)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(revisat 2026-11-15: detall)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(revisat 2026-11-15: detall)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(revisat 2026-11-15: detall)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(revisat 2026-11-15: detall)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(revisat 2026-11-15: detall)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(revisat 2026-11-15: detall)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(revisat 2026-11-15: detall)*

<!-- kb:end -->
