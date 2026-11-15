---
title: "Katalogu i njohurive"
parent: "Lente e njohurive"
nav_order: 2
lang: "sq"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Katalogu i njohurive

Ky është lista e plotë e asaj që njeh [lente e njohurive](knowledge.md): modelet që kërkon, idetë, metodat, rastet historike dhe studimet që citon, si edhe librat dhe punimet pas tyre. Përdore për të gjetur një hyrje sipas ID-së së saj ose për të kontrolluar një burim.

Kjo faqe gjenerohet nga baza e njohurive me `node tools/knowledge-doc.mjs`; mos redakto midis shenjave.

<!-- kb:begin -->

Baza e njohurive përmban 579 hyrje (135 koncepte, 37 metoda, 277 raste historike, 17 parime projektimi, 113 studime) mbi 93 modele, dhe citon 556 referenca.

### Modelet (93) {#patterns-93}

| id | familja | çfarë duket në të dhënat |
|---|---|---|
| `concentration` | forca | Pala që sjell më shumë njësi në një vend e fiton atë vend me diferencë më të madhe se vetëm numri i tyre. |
| `local-superiority` | forca | Vrasjet i takojnë asaj pale që ka epërsi numerike brenda rrezes së angazhimit, pavarësisht nga totalet. |
| `attrition` | forca | Humbjet ndjekin forcën e të dyja palëve me kalimin e kohës; luftën e vendos ajo që mbaron e para. |
| `exchange-ratio` | forca | Vrasjet për çdo humbje ndryshojnë shumë sipas vendit, palës ose klasës. |
| `aimed-fire` | forca | Humbjet rriten me numrin e armikut, por jo me numrin e vetë palës. |
| `area-fire` | forca | Humbjet rriten me prodhimin e numrave të të dyja palëve: grumbullimi ndëshkohet. |
| `defeat-in-detail` | forca | Një palë shkatërrohet pjesë-pjesë, ndërsa pjesët e saj arrijnë një nga një. |
| `mutual-support` | forca | Një humbje i përgjigjet shpejt një shok i afërt: shkëmbime. |
| `combined-arms` | forca | Klasat funksionojnë mirë së bashku kur secila mbulon dobësinë e tjetrës, dhe keq kur janë vetëm. |
| `class-counter` | forca | Një klasë fiton jashtëzakonisht kundër një klase të caktuar tjetër ose në një vend të caktuar. |
| `initiative` | forca | Ai që shënon i pari në një angazhim priret ta fitojë. |
| `key-terrain` | terreni | Të njëjtat pak vende vendosin luftimet ndeshje pas ndeshjeje. |
| `fields-of-fire` | terreni | Vendet që shohin larg mbi tokën që të tjerët duhet ta kalojnë japin më shumë vrasje. |
| `high-ground` | terreni | Vrasjet bëhen nga lart, mbi tokën ku qëndrojnë viktimat. |
| `cover` | terreni | Vdekjet për kohë bien aty ku gjeometria bllokon shikimin dhe zjarrin. |
| `open-ground` | terreni | Vdekjet për kohë rriten aty ku asgjë nuk bllokon shikimin dhe zjarrin. |
| `kill-zone` | terreni | Vdekjet përqendrohen aty ku lëvizja detyrohet të kalojë nëpër tokë të vëzhguar dhe të mbuluar nga zjarri. |
| `chokepoint` | terreni | Shumë kalime shtrydhen nëpër pak tokë, me humbje atje. |
| `reverse-slope` | terreni | Siguri pak pas një kreshte ose muri, jashtë shikimit të drejtpërdrejtë të armikut. |
| `safe-ground` | terreni | Vend ku kalohet koha, por vdes pak njeri. |
| `obstacle` | terreni | Rrugët kthehen rreth tokës së bllokuar në disa korsi. |
| `flank` | lëvizja | Një rrugë e përdorur rrallë sjell më shumë vrasje se rrugët kryesore. |
| `avenue-of-approach` | lëvizja | Lëvizja rrjedh përgjatë disa korsive midis zonave. |
| `mobility` | lëvizja | Njësitë në lëvizje vdesin më pak (ose më shumë) për kohë sesa ato të ngadalta ose të palëvizshme. |
| `static-exposure` | lëvizja | Njësitë që qëndrojnë në një vend vdesin më shumë për kohë sesa ato në lëvizje. |
| `interior-lines` | lëvizja | Një palë me rrugë të shkurtra midis luftimeve të saj e zhvendos forcën më shpejt se tjetra. |
| `envelopment` | lëvizja | Vrasjet vijnë nga disa drejtime mbi pozicionin e një pale. |
| `ambush` | lëvizja | Njësitë që lëvizin përgjatë një rruge vdesin shpejt nga armiq që janë tashmë në pozicion. |
| `spawn-pressure` | koha | Jetët mbarojnë shpejt pasi fillojnë në një pikë lindjeje. |
| `tempo` | koha | Pala më e shpejtë arrin te luftimi dhe shënon para se tjetra të reagojë. |
| `surprise` | koha | Humbjet vijnë me një shpërthim para se viktimat të kthejnë zjarrin. |
| `energy-advantage` | ajri | Vrasësit kanë më shumë lartësi dhe shpejtësi sesa viktimat e tyre. |
| `air-superiority` | ajri | Avionët e një pale vrasin shumë herë më shumë sesa humbasin. |
| `sead` | ajri | Mbrojtjet ajrore tokësore marrin shumë avionë derisa gjenden dhe shkatërrohen. |
| `bvr` | ajri | Vrasjet ndodhin nga distanca e gjatë, para se viktima të mund t'i afrohet. |
| `fleet-salvo` | deti | Një forcë që e godet e para humbet pak; tjetra mbijeton pak për t'u përgjigjur. |
| `scouting` | deti | Pala që e gjen tjetrën e para zgjedh luftimin. |
| `urban-close` | urbane | Distanca të shkurtra angazhimi, shumë vdekje mes gjeometrisë së dendur, pastrim i ngadaltë. |
| `vertical` | urbane | Vrasje nga katet e larta ose nga çatitë mbi rrugë. |
| `skill-dispersion` | njerëzit | Disa lojtarë llogarisin një pjesë të madhe të vrasjeve ose vdekjeve. |
| `ai-vs-player` | njerëzit | Njësitë e kontrolluara nga AI kanë rezultate të ndryshme nga lojtarët në të njëjtin vend. |
| `balance` | dizajni | Palët, lindjet ose klasat fillojnë me shanse të pabarabarta. |
| `economy` | dizajni | Burimet e fituara, të paguara dhe të humbura përqendrohen në pak vende ose lojtarë. |
| `flow` | dizajni | Si lëvizin lojtarët nëpër nivel: unaza, korsi, rrugë pa dalje. |
| `sightlines` | dizajni | Vijat e gjata të shikimit vendosin ku nisin luftimet dhe kush i fiton ato. |
| `readability` | dizajni | Vdekje që lojtarët nuk mund t'i shohin të vijnë: nga prapa, nga jashtë shikimit. |
| `formation` | lëvizja | Njësitë e një pale lëvizin bashkë në një formë të njohshme: vijë, kolonë, kunj, eshelon, kuti. |
| `frontal-assault` | lëvizja | Një grup i afrohet armikut drejt e në përballje me frontin e tij. |
| `double-envelopment` | lëvizja | Dy grupe godasin të dy krahët e një trupi armik pothuajse në të njëjtën kohë. |
| `encirclement` | lëvizja | Një grup armik mbetet me palën tjetër përreth dhe me pak rrugë daljeje. |
| `penetration` | lëvizja | Një grup kalon nëpër vijën armike ku armiq qëndrojnë në të dy anët e tij. |
| `fire-and-maneuver` | lëvizja | Një pjesë e grupit lëviz ndërsa pjesa tjetër qëndron dhe e mbulon, dhe rolet alternohen. |
| `feint` | lëvizja | Një grup i vogël e tërheq armikun në një vend; përpjekja kryesore godet diku tjetër pak më vonë. |
| `withdrawal` | lëvizja | Një grup në kontakt kthehet dhe hap distancën me armikun. |
| `pursuit` | lëvizja | Një grup ndjek një armik që largohet, duke e mbajtur ose duke e ngushtuar distancën. |
| `defence-in-depth` | terreni | Mbrojtësit qëndrojnë në disa brez njëri pas tjetrit përgjatë boshtit të përparimit armik. |
| `screening` | lëvizja | Një element i vogël lëviz shumë përpara trupit kryesor dhe takon armikun i pari. |
| `dispersion` | forca | Një palë shpërndahet me kalimin e kohës; më pak njësi të saj ndajnë të njëjtin vend. |
| `missile-defence` | ajri | Avionët nën kërcënim raketash e kthejnë kërcënimin nga krahu ose bishti: crank, notch, drag, pump. |
| `angles-fight` | ajri | Luftim i shkurtër ajror me shpejtësi të ulët dhe ritëm të lartë kthese, i zhvilluar për pozicionin e hundës më shumë sesa për energjinë. |
| `cap` | ajri | Avionët rrotullohen rreth një stacioni të fiksuar për minuta, duke pritur që armiku të vijë. |
| `strike-package` | ajri | Avionë me role të ndryshme fluturojnë bashkë drejt një objektivi; disa sulmojnë tokën, të tjerë i mbulojnë. |
| `line-of-battle` | deti | Anijet lundrojnë në kolonë një pas tjetrës, që të gjitha topat e brezit të godasin. |
| `crossing-the-t` | deti | Një kolonë kalon mbi kokën e kolonës armike: të gjitha topat e saj godasin, dhe pak nga ai i armikut. |
| `fatal-funnel` | urbane | Lojtarët që hyjnë nga një derë, dhomë ose shtrëngim vdesin aty brenda çastesh shumë më shpesh sesa kur hyjnë gjetkë. |
| `crossfire` | forca | Mbajtësit, vijat e zjarrit të të cilëve konvergjojnë nga kënde të ndryshme, fitojnë më shumë duele sesa një mbajtës i vetëm. |
| `peeker-advantage` | koha | Lojtari që del në shikim fiton duelet kundër atij që mban këndin më shpesh (ose më rrallë) se gjysma. |
| `entry` | koha | Vrasja e parë e një raundi vendos shumicën e raundit; hyrjet fitojnë ose humbasin sipas vendit dhe mbështetjes. |
| `utility-support` | forca | Një flash ose tym pak para një dueli ndryshon kush e fiton atë. |
| `man-advantage` | forca | Raundet fitohen nga pala me më shumë lojtarë gjallë, dhe disa palë e kthejnë ose e humbin një epërsi. |
| `clutch` | njerëzit | Lojtarët e fundit gjallë fitojnë më shpesh (ose më rrallë) sesa gjendja e raundit parashikon. |
| `action-value` | njerëzit | Vrasjet, shkëmbimet, vendosjet e bombës dhe granatat ndihmëse ndryshojnë në sasinë me të cilën ndryshojnë shansin për të fituar. |
| `lurk` | lëvizja | Një lojtar i vetëm larg ekipit vret (ose vdes) me një ritëm të ndryshëm nga grupi. |
| `rotation` | lëvizja | Sa shpejt një palë zhvendos lojtarët te luftimi ose objektivi vendos nëse e mban apo e rimerr. |
| `collective-order` | njerëzit | Njësitë në lëvizje të një pale drejtohen për të njëjtën anë shumë më shpesh sesa do ta bënin rastësisht gjurmët e tyre, të zhvendosura në kohë. |
| `milling` | njerëzit | Njësitë e një pale rrethojnë një qendër të përbashkët: rrotullim pa lëvizje neto. |
| `herding` | njerëzit | Njësitë largohen nga një vend ashtu si e bëri shoku i para tyre, përtej gjasave të vetë vendit dhe përtej kopjimit të armikut. |
| `lane-formation` | njerëzit | Rrjedhat e kundërta mbahen në korsi të ndara; lëvizja përqendrohet në disa shtigje të ripërdorura ndeshje pas ndeshjeje. |
| `crowding` | njerëzit | Shpejtësia dhe rrjedha bien kur njësitë grumbullohen; nëpër një shtrëngim, shtyrja më fort kalon më pak. |
| `leadership` | njerëzit | Disa njësi kthehen të parat dhe të tjerat kopjojnë drejtimin e tyre disa sekonda më vonë. |
| `cohesion` | njerëzit | Njësitë që largohen nga grupi i tyre vdesin më shpesh sesa ato që qëndrojnë me të. |
| `breaking-point` | njerëzit | Një palë që ka humbur një pjesë të forcës së saj ndalon së afruari dhe tërhiqet, përtej asaj që shpjegon distanca nga armiku. |
| `panic` | njerëzit | Nën kërcënim të papritur njësitë shpërndahen, ikin me shpejtësi ose ngrijnë; koordinimi shpërbëhet. |
| `loss-chasing` | njerëzit | Pas një humbjeje njësitë marrin më shumë (ose më pak) rrezik sesa pas një fitoreje. |
| `hot-hand` | njerëzit | Suksesi pason suksesin më shpesh sesa lejojnë sekuencat e përziera të të njëjtit lojtar. |
| `conformity` | njerëzit | Anëtarët e një pale zgjedhin njësoj - blerje, ngarkesa, rrugë - përtej preferencave të tyre. |
| `suppression` | njerëzit | Zjarri që vjen ndryshon mënyrën si njësitë lëvizin dhe qëllojnë, edhe kur nuk vret. |
| `social-loafing` | njerëzit | Veprimi për kokë bie kur janë të pranishëm më shumë shokë ekipi. |
| `mixed-strategy` | njerëzit | Zgjedhjet që duhet të jenë të paparashikueshme bëhen me model: një opsion fiton më shpesh, ose zgjedhjet ndjekin sekuenca. |
| `coordination` | njerëzit | Anëtarët veprojnë në hap pa urdhra të dukshëm: lëvizje, kohë dhe zgjedhje të sinkronizuara. |
| `contagion` | njerëzit | Një gjendje kalon nga njësia në njësi me kontakt ose afërsi dhe përhapet nëpër hartë. |
| `territoriality` | njerëzit | Njësitë mbajnë distancën midis tyre dhe mbahen në tokën e tyre. |
| `interaction-network` | njerëzit | Kush lufton, mbështet dhe ndjek kë formon një rrjet me qendra, grupime dhe ura. |


### Konceptet (135) {#concepts-135}

| id | titulli | lentet | modelet | burimet |
|---|---|---|---|---|
| `concept.lanchester-square` | Ligji katror i Lanchester-it (zjarr i synuar) | ushtarak, ajror, detar, e-sport | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Ligji linear i Lanchester-it (zjarr zonal, një kundër një) | ushtarak, urban, e-sport | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Përqendrimi i forcës (masa) | ushtarak, ajror, detar, e-sport | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Raportet e forcës dhe rregulli 3:1 | ushtarak | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Raporti i shkëmbimit të humbjeve | ushtarak, ajror, e-sport, dizajn | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Fuqia luftarake dhe shumëzuesit e saj | ushtarak | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Sistemi modern i përdorimit të forcës | ushtarak | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | Cikli OODA (vëzhgo-orienton-vendos-vepro) | ushtarak, ajror, e-sport | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Teoria e energjisë-manovrueshmërisë | ajror | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Manovrat bazë të avionëve luftarakë dhe manovrimi në luftim ajror | ajror | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Analiza e terrenit: OAKOC / KOCOA | ushtarak, dizajn, urban | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: variablat e misionit | ushtarak | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Terreni kyç dhe vendimtar | ushtarak, dizajn, e-sport | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Vëzhgimi dhe fushat e zjarrit | ushtarak, dizajn, e-sport, urban | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Mbulesa dhe fshehja | ushtarak, urban, dizajn | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Rrugët e afrimit dhe korridoret e lëvizjes | ushtarak, dizajn | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Shtrëngimet dhe kalimet e ngushta | ushtarak, dizajn, e-sport | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Zonat e angazhimit dhe zonat e vrasjes | ushtarak, urban, dizajn | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Mbrojtja në pjerrësinë e kundërt dhe fshehja | ushtarak, dizajn | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Lartësia dominuese | ushtarak, dizajn | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Vijat e brendshme dhe të jashtme | ushtarak | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Shkatërrimi pjesë-pjesë | ushtarak, e-sport | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Mbështetja e ndërsjellë | ushtarak, ajror, e-sport | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Armët e kombinuara | ushtarak, dizajn | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Shtypja me zjarr | ushtarak, urban | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Shtypja dhe shkatërrimi i mbrojtjes ajrore armike (SEAD/DEAD) | ajror, ushtarak | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Patrulla ajrore luftarake dhe epërsia ajrore | ajror | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Angazhimi jashtë kufirit të shikimit vizual | ajror | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Qasja indirekte | ushtarak, e-sport, dizajn | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Rrethimi dhe rrethimi i plotë | ushtarak | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Pritë | ushtarak, e-sport, dizajn | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Mbrojtja në thellësi | ushtarak | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Fërkimi dhe mjegulla e luftës | ushtarak, e-sport | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Pika kulminante e sulmit | ushtarak | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Befasia | ushtarak, ajror, detar, e-sport | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Ekonomia e forcës | ushtarak, e-sport | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Terreni urban | urban, ushtarak, e-sport | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Kontrolli i detit dhe beteja vendimtare e flotës | detar | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Modeli i salvove të Hughes-it: sulmo efektivisht i pari | detar, ajror | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Teoria e kërkimit dhe zbulimit | detar, ajror, ushtarak | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Kërkimi operacional: masat e efektivitetit | ushtarak, ajror, detar, dizajn | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Lojërat e luftës si analizë | ushtarak, dizajn | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Lufta e manovrës | ushtarak, e-sport | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Kohezioni dhe faktori moral | ushtarak | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Qendra e gravitetit | ushtarak | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Pikat vendimtare | ushtarak, e-sport | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Vijat e operacioneve | ushtarak | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Strategjitë e shfarosjes dhe të lodhjes | ushtarak | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Beteja e thellë dhe operacionet e thella | ushtarak | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | Beteja ajër-tokë (AirLand Battle) | ushtarak, ajror | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Komanda me mision (Auftragstaktik) | ushtarak, e-sport | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Depërtimi dhe shfrytëzimi | ushtarak | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Zjarri dhe lëvizja | ushtarak, e-sport | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Lëvizja me kërcime dhe mbulim zjarri | ushtarak, e-sport | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Tërheqja e zbulimit dhe infiltrimi | ushtarak, e-sport | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | Rezerva | ushtarak, e-sport | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Mbrojtja elastike dhe kundërsulmi | ushtarak | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | Zinxhiri i vrasjes (gjej, fikso, ndiq, cakto, angazho, vlerëso) | ushtarak, ajror, detar | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Distanca e zbulimit kundrejt distancës së angazhimit | ajror, detar, ushtarak | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Vlera e efektivitetit luftarak | ushtarak, e-sport | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Shpërndarja në fushën e betejës | ushtarak, e-sport | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Mbështetja ajrore e afërt | ajror, ushtarak | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Ndërprerja ajrore | ajror, ushtarak | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Eskortë kundrejt pastrimit me avionë luftarakë | ajror | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Luftim me energji kundrejt luftimit me kthesa | ajror | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Ndjekja përpara, e drejtë dhe prapa | ajror | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Lëkundja Thach (Thach weave) | ajror | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Katërshi "finger-four" dhe çifti luftarak | ajror | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Flota ekzistuese (fleet in being) | detar | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Kalimi i T | detar, ushtarak | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Konvoi | detar | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Parandalimi i hyrjes dhe mohimi i zonës (A2/AD) | detar, ajror, ushtarak | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Mbrojtja me pikë të fortë në zona të ndërtuara | urban, ushtarak | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Vrimat e miut dhe lëvizja nëpër ndërtesa (mouseholing) | urban, ushtarak, dizajn | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Rrethimi (siege) | ushtarak, urban | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Lufta guerile | ushtarak, urban | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Kundërrebelimi | ushtarak, urban | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Strehimorja | ushtarak, dizajn | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Mashtrimi (maskirovka) | ushtarak, e-sport | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Epërsia e informacionit | ushtarak, e-sport | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Raundet ekonomike dhe ritmi i burimeve | e-sport, dizajn | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Formacionet e lëvizjes: vijë, kolonë, kunj, eshelon | ushtarak, e-sport | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Sulmi frontal | ushtarak | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Rrethimi i dyfishtë (pinca) | ushtarak | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Rrethimi dhe xhepi | ushtarak | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Depërtimi dhe thyerja | ushtarak | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Ndjekja | ushtarak | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Retrogradimi: tërheqje, vonesë dhe tërheqje e plotë | ushtarak | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Dredhia dhe demonstrata | ushtarak, e-sport | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Ekranimi, roja dhe mbulimi: siguria përpara trupit kryesor | ushtarak | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Mbrojtja nga raketa: crank, notch, drag dhe pump | ajror | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Formacionet jashtë kufirit të shikimit: wall, lead-trail, grinder, pincer | ajror | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Luftimi me kënde dhe luftimi me energji | ajror | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Paketa goditëse dhe rendi i shtypjes | ajror | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | Vija e betejës | detar | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | Hinka fatale | urban, ushtarak, e-sport, dizajn | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Pastrimi i dhomës: befasi, shpejtësi, dhunë e kontrolluar | urban, ushtarak, e-sport | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Pikat e dominimit | urban, ushtarak, e-sport | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Pastrimi i këndeve: prerja e tortës | urban, ushtarak, e-sport | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Zjarri i kryqëzuar dhe fushat e zjarrit të ndërthurura | ushtarak, urban, e-sport, dizajn | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Epërsia e atij që del në shikim | e-sport, dizajn | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Epërsia numerike në raundet eliminuese | e-sport, ushtarak | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Hyrja dhe duelet e hapjes | e-sport, urban | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Pajisjet ndihmëse para hyrjes: flash dhe tym | e-sport, urban, ushtarak | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Modeli i forcës sociale për lëvizjen e këmbësorëve | dizajn, urban, ushtarak | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Formimi i korsive në rrjedhë të kundërt | dizajn, urban | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Më shpejt do të thotë më ngadalë | dizajn, urban, ushtarak | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Diagrama themelore e turmave | dizajn, urban | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Formimi i shtigjeve dhe vijat e dëshirës | dizajn, ushtarak | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Paniku është i rrallë: qëndrueshmëria kolektive | ushtarak, urban, dizajn | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: ndarja, përshtatja, kohezioni | dizajn, ushtarak | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Parametri i rendit dhe fillimi i lëvizjes kolektive | dizajn, ushtarak, ajror, detar | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Grumbulli, rrotullimi dhe gjendjet e polarizuara | dizajn, ushtarak, detar | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Udhëheqja efektive pa sinjale | ushtarak, e-sport, dizajn | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Fqinjët sipas numrit, jo sipas distancës | ajror, ushtarak | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Inteligjenca e grumbullit | dizajn, e-sport, ushtarak | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Prirja e kopjimit dhe kaskadat e informacionit | e-sport, dizajn, ushtarak | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Përtacia shoqërore (social loafing) | e-sport, dizajn, ushtarak | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Shpërndarja e përgjegjësisë | e-sport, ushtarak | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Kohezioni i grupit parësor | ushtarak, e-sport | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Pikat e thyerjes dhe pragjet e humbjeve | ushtarak | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Shtypja: çfarë bën zjarri përveç vrasjes | ushtarak, urban | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Frika dhe stresi në vendimet në luftim | ushtarak, e-sport | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Dridhja nën presion (choking) | e-sport | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Teoria e perspektivës dhe averzioni ndaj humbjes | e-sport, dizajn | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Efektet e barazimit dhe të "parave të shtëpisë" | e-sport | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Tilt | e-sport | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Kosto e zhytur (sunk cost) | e-sport, ushtarak | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | Dora e nxehtë dhe gabimi i saj | e-sport | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Strategjitë e përziera: të jesh i paparashikueshëm | e-sport, dizajn, ushtarak | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Modelet e përbashkëta mendore | e-sport, ushtarak | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Përbërësit e punës në ekip | e-sport, ushtarak | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Botët virtuale si laboratorë të sjelljes | dizajn, e-sport | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Hapësira personale dhe territori | dizajn, urban | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Rrjetet e ndërveprimit: qendrat dhe lidhjet e dobëta | e-sport, dizajn | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Metodat (37) {#methods-37}

| id | titulli | modelet | burimet |
|---|---|---|---|
| `method.lanchester-fit` | Përshtatja e eksponentëve të Lanchester-it me të dhënat e angazhimit | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Raporti i shkëmbimit sipas palës dhe sipas vendit | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Raporti lokal i forcës në çastin e çdo vrasjeje | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Fusha e shikimit (viewshed): fushat e zjarrit me vijë shikimi | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Energjia specifike në vrasje dhe vdekje (ajror) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Qëndrueshmëria e pikave të nxehta ndërmjet ndeshjeve | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Shkalla e shkëmbimeve (mbështetja e ndërsjellë) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Angazhimet dhe avantazhi i vrasjes së parë | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Autokorrelacioni hapësinor i vdekjeve (I i Moran-it) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Normat krahasuar me bazën e vetë hartës, me kontroll FDR | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Përgatitja e inteligjencës së fushës së betejës (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Modelet e vlerësimit me krahasim çift (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Probabiliteti i fitores dhe vlerësimi i veprimeve | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Kontrolli i hapësirës dhe kontrolli i fushës (pitch control) | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Ekuacioni i salvove i përshtatur me anijet në kontakt | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Raporti i efektivitetit luftarak për njësi-orë në veprim | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Distancat nga zbulimi te angazhimi dhe distancat e angazhimit | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Koha e zinxhirit të vrasjes | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Shpërndarja kundrejt pjesës së vrasjeve (përqendrimi i forcës në kohë) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Norma e humbjeve dhe vrasjet për fluturim (sortie) | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Modeli i probabilitetit për fitimin e raundit | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Vlera e veprimit: probabilitet i shtuar i fitores | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Plus-minus i rregulluar me regresion ridge (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Tkurrja: Bayes empirik | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Rezultatet e pritshme: nga golat e pritshëm te duelet e pritshme | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Matja e pritjeve, rotacioneve dhe lurks | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Problemi i reflektimit: kopjim apo shkak i përbashkët | herding, conformity | Manski 1993 |
| `method.streak-correction` | Seritë me korrigjimin e sekuencës së fundme | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Parametrat e rendit për polarizimin dhe grumbullimin | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Udhëheqësit nga korrelacioni i drejtimit të vonuar | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Testi i kaskadës së rrugëve për prirjen e kopjimit | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Ndarja e korsive dhe qëndrueshmëria e shtigjeve | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Rreziku i vonuesve | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Kurba e thyerjes | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Përgjigjja ndaj zjarrit që vjen | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Rreziku pas një humbjeje ose fitoreje | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Marrëveshja e blerjes (kappa e Fleiss-it) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Rastet historike (277) {#historical-cases-277}

| id | rasti | kur | shkalla | modelet | burimet |
|---|---|---|---|---|---|
| `case.thermopylae` | Termopilet | 480 p.e.s. | betejë | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamina | 480 p.e.s. | betejë | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Maratona | 490 p.e.s. | betejë | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuktra | 371 p.e.s. | betejë | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331 p.e.s. | betejë | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Trasimeno | 217 p.e.s. | betejë | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Kanae | 216 p.e.s. | betejë | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Pylli i Teutoburgut | 9 e.s. | betejë | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | betejë | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Ura e Stirlingut | 1297 | betejë | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Agincourt | 1415 | betejë | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen | 1757 | betejë | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlitz | 1805 | betejë | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | betejë | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | betejë | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: Kodrat e Marye | 1862 | angazhim | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | angazhim | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: Sulmi i Pickett-it | 1863 | angazhim | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | betejë | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | angazhim | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | fushatë | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | Somme, dita e parë | 1 korrik 1916 | betejë | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | fushatë | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jutland | 1916 | betejë | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939-40 | betejë | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan dhe Ardenët | maj 1940 | fushatë | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Kundërsulmi i Arrasit | 21 maj 1940 | angazhim | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Beteja e Britanisë | korrik-tetor 1940 | fushatë | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Beteja e Atlantikut: kërkimi operacional i konvojeve | 1939-45 | fushatë | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | qershor 1942 | betejë | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | El Alamein i dytë | tetor-nëntor 1942 | betejë | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Kasserine Pass | shkurt 1943 | betejë | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Stalingradi | gusht 1942-shkurt 1943 | fushatë | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kursk | korrik 1943 | fushatë | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prokhorovka | 12 korrik 1943 | angazhim | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13 qershor 1944 | angazhim | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Gardhet e Normandisë | qershor-korrik 1944 | fushatë | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Operacioni Cobra | korrik 1944 | fushatë | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Gjiri i Leyte-s | tetor 1944 | betejë | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | dhjetor 1944 | betejë | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Tsushima | maj 1905 | betejë | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Inçon | shtator 1950 | fushatë | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | MiG Alley | 1950-53 | fushatë | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | betejë | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | nëntor 1965 | angazhim | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operacioni Bolo | 2 janar 1967 | angazhim | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golani: Lugina e lotëve | tetor 1973 | betejë | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Sinai: Ferma Kineze | tetor 1973 | betejë | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Lugina e Bekaas (Operacioni Mole Cricket 19) | qershor 1982 | betejë | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Lufta ajrore e Falklandeve | maj-qershor 1982 | fushatë | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Fushata ajrore e Desert Storm | janar-shkurt 1991 | fushatë | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26 shkurt 1991 | angazhim | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadishu | tetor 1993 | angazhim | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Groznit | dhjetor 1994-shkurt 1995 | betejë | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hue | janar-mars 1968 | betejë | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Fushata ajrore e Kosovës | mars-qershor 1999 | fushatë | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Fallusha (Operacioni Al Fajr) | nëntor 2004 | betejë | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mosuli | 2016-17 | fushatë | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Kadeshi | rreth 1274 p.e.s. | betejë | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Isos | 333 p.e.s. | betejë | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 p.e.s. | betejë | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Karrhai | 53 p.e.s. | betejë | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Farsalia | 48 p.e.s. | betejë | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianopoli | 378 e.s. | betejë | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Jarmuku | 636 e.s. | betejë | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manzikerti | 1071 | betejë | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hatini | 1187 | betejë | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburn | 1314 | betejë | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Crécy | 1346 | betejë | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Poitiers | 1356 | betejë | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunwaldi (Tannenberg) | 1410 | betejë | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeld | 1631 | betejë | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blenheim | 1704 | betejë | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Poltava | 1709 | betejë | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rossbach | 1757 | betejë | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | fushatë | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | betejë | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena-Auerstedt | 1806 | betejë | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodino | 1812 | betejë | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Leipzig | 1813 | betejë | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | betejë | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | betejë | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | fushatë | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadova) | 1866 | betejë | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | betejë | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | betejë | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurman | 1898 | betejë | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | angazhim | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Galipoli | 1915 | fushatë | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | nëntor 1917 | betejë | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Kaporeto | tetor-nëntor 1917 | fushatë | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Ofensiva gjermane e pranverës (Operacioni Michael) | mars-prill 1918 | fushatë | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | gusht 1918 | betejë | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Khalkhin Gol (Nomonhan) | gusht 1939 | betejë | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | Fushata polake | shtator 1939 | fushatë | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut dhe Gembloux | maj 1940 | betejë | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | maj 1940 | angazhim | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Perimetri i Dunkirk-ut | maj-qershor 1940 | fushatë | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operacioni Compass dhe Beda Fomm | dhjetor 1940-shkurt 1941 | fushatë | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Operacioni Crusader dhe Sidi Rezegh | nëntor-dhjetor 1941 | fushatë | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | maj-qershor 1942 | betejë | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alam Halfa | gusht-shtator 1942 | betejë | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno-Brody | qershor 1941 | betejë | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Rrethimi i Kievit | shtator 1941 | fushatë | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moska | tetor 1941-janar 1942 | fushatë | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |

| `case.rzhev-mars` | Rzhev dhe Operacioni Mars | 1942 | fushatë | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Kharkovi i dytë | maj 1942 | betejë | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Kharkovi i tretë (goditja e kthyer e Manstein-it) | shkurt-mars 1943 | fushatë | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operacioni Bagration | qershor-gusht 1944 | fushatë | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Xhepi Korsun-Çerkasi | janar-shkurt 1944 | betejë | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Xhepi Kamenets-Podolsk | mars-prill 1944 | fushatë | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operacioni Epsom | qershor 1944 | betejë | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operacioni Goodwood | korrik 1944 | betejë | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operacioni Totalize | gusht 1944 | betejë | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | gusht 1944 | betejë | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Xhepi i Falaise-it | gusht 1944 | fushatë | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden dhe Arnhem | shtator 1944 | fushatë | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Aachen | tetor 1944 | betejë | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Pylli i Hürtgenit | shtator 1944-shkurt 1945 | fushatë | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | shtator 1944 | betejë | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | St. Vith | dhjetor 1944 | betejë | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Kreshta e Elsenborn-it | dhjetor 1944 | betejë | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Kodrat e Seelow-së | prill 1945 | betejë | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlini | prill-maj 1945 | betejë | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operacioni Zgjimi i Pranverës | mars 1945 | betejë | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | dhjetor 1943 | betejë | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Kryengritja e Varshavës | gusht-tetor 1944 | fushatë | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | nëntor 1943 | betejë | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | shtator-nëntor 1944 | betejë | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | shkurt-mars 1945 | betejë | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinawa | prill-qershor 1945 | fushatë | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manila | shkurt-mars 1945 | betejë | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Mançuria (Stuhia e gushtit) | gusht 1945 | fushatë | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Perimetri i Pusanit | gusht-shtator 1950 | fushatë | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Rezervuari Chosin | nëntor-dhjetor 1950 | fushatë | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Lumi Imjin | prill 1951 | betejë | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapyong | prill 1951 | betejë | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Kodra Pork Chop | prill dhe korrik 1953 | angazhim | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | janar-prill 1968 | betejë | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | nëntor 1967 | betejë | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Kodra Hamburger (Mali Ap Bia) | maj 1969 | angazhim | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila-Um Katef | qershor 1967 | betejë | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailia | tetor 1973 | betejë | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | qershor 1982 | angazhim | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Rrethimi i Bejrutit | qershor-gusht 1982 | fushatë | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Libani 2006: Bint Jbeil dhe kërcënimi kundër tankeve | korrik-gusht 2006 | fushatë | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Faw | shkurt 1986 | betejë | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basra (Karbala-5) | janar-shkurt 1987 | betejë | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Khafji | janar-shkurt 1991 | betejë | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Objektivi Norfolk | 26-27 shkurt 1991 | betejë | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Kreshta e Medinës | 27 shkurt 1991 | betejë | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Gënjeshtrat e Wadi al-Batin-it | shkurt 1991 | fushatë | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nasiriyah | mars 2003 | betejë | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Objektivi Peach | prill 2003 | angazhim | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Vrapimet e Thunder | prill 2003 | betejë | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Kalimi i Debecka | prill 2003 | angazhim | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramadi | 2006-07 | fushatë | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadr City | mars-maj 2008 | betejë | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Operacioni Anaconda | mars 2002 | betejë | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | korrik 2008 | angazhim | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | tetor 2009 | angazhim | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala dhe shtëpitë e togerive | 2006-07 | fushatë | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Beteja e Algjerit | 1956-57 | fushatë | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Zjarrfikësit e Rodhesisë (Rhodesian Fireforce) | 1974-79 | fushatë | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Rrethimi i Sarajevës | 1992-96 | fushatë | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Groznit 1999-2000 | dhjetor 1999-shkurt 2000 | betejë | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Lufta ruso-gjeorgjiane | gusht 2008 | fushatë | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillia | korrik 2014 | angazhim | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovaisk | gusht 2014 | betejë | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debaltseve | janar-shkurt 2015 | betejë | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Aeroporti i Donetskut | shtator 2014-janar 2015 | betejë | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Aeroporti i Hostomelit | shkurt 2022 | angazhim | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | Aksi i Kievit dhe pritja e Brovarit | mars 2022 | angazhim | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Mariupoli dhe Azovstal | shkurt-maj 2022 | betejë | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Kundërsulmi i Kharkivit | shtator 2022 | fushatë | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Kalimi i Siverskyi Donets te Bilohorivka | maj 2022 | angazhim | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bakhmuti | gusht 2022-maj 2023 | betejë | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Sulmi i Zaporizhzhias | qershor-nëntor 2023 | fushatë | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Lufta e Nagorno-Karabakh | shtator-nëntor 2020 | fushatë | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Blitz | shtator 1940-maj 1941 | fushatë | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: dita e parë në ajër | 22 qershor 1941 | betejë | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Kreta | maj 1941 | betejë | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Rrethimi i Maltës | 1940-1942 | fushatë | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Ura ajrore e Stalingradit | nëntor 1942-shkurt 1943 | fushatë | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Betejat ajrore mbi Kuban | prill-qershor 1943 | fushatë | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kursku në ajër | korrik 1943 | betejë | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operacioni Bagration në ajër | qershor-gusht 1944 | fushatë | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploeshti (Operacioni Tidal Wave) | 1 gusht 1943 | angazhim | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Sulmi mbi digat (Operacioni Chastise) | 16-17 maj 1943 | angazhim | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hamburgu (Operacioni Gomorrah) | korrik-gusht 1943 | betejë | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt-Regensburg | 17 gusht 1943 | betejë | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Schweinfurti i dytë ("E enjtja e zezë") | 14 tetor 1943 | angazhim | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Java e madhe (Operacioni Argument) | shkurt 1944 | fushatë | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Sulmi në Nürnberg | 30-31 mars 1944 | angazhim | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operacioni Bodenplatte | 1 janar 1945 | betejë | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Beteja e detit Bismarck | mars 1943 | betejë | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Neutralizimi i Rabaulit | 1943-1944 | fushatë | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Deti i Filipineve ("Gjuetia e lehtë e Marianave") | qershor 1944 | betejë | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | E martja e zezë mbi Namsi | 23 tetor 1951 | angazhim | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operacioni Rolling Thunder | 1965-1968 | fushatë | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Ura e Thanh Hoa-s | 1965-1972 | angazhim | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | Wild Weasels | 1965-1973 | fushatë | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Raporti Ault dhe Top Gun | 1968-1972 | fushatë | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operacioni Linebacker | maj-tetor 1972 | fushatë | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II ("Lufta e njëmbëdhjetë ditëve") | dhjetor 1972 | fushatë | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operacioni Focus (Moked) | 5 qershor 1967 | betejë | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Lufta e lodhjes: brezi i raketave | 1969-1970 | fushatë | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | Çadra SAM mbi kanal | tetor 1973 | betejë | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (Operacioni Opera) | 7 qershor 1981 | angazhim | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operacioni El Dorado Canyon | 15 prill 1986 | angazhim | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Lufta ajrore Iran-Irak | 1980-1988 | fushatë | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Sulmet Black Buck | maj-qershor 1982 | angazhim | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: planifikimi i fushatës ajrore të Gjirit | gusht 1990-janar 1991 | fushatë | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: goditja e hapjes me Apache | 17 janar 1991 | angazhim | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | Gjuetia e madhe e Scud-ëve | janar-shkurt 1991 | fushatë | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Brinjët e Mutlës ("Rruga e vdekjes") | 26-27 shkurt 1991 | angazhim | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operacioni Anaconda: Apache në Shahi-Kot | mars 2002 | betejë | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | Sulmi Apache i Karbalasë | 24 mars 2003 | angazhim | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | Fushata ajrore e Libisë | mars-tetor 2011 | fushatë | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Nagorno-Karabakh: dronët dhe mbrojtjet ajrore | shtator-nëntor 2020 | fushatë | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ukraina: ajri i kontestuar | 2022 | fushatë | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Aeroporti i Hostomelit | shkurt 2022 | angazhim | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | shkurt-mars 1971 | fushatë | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operacioni Eagle Claw | prill 1980 | angazhim | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afganistani: Stinger | 1986-1989 | fushatë | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | betejë | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | Armada Spanjolle | 1588 | fushatë | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Gjiri i Quiberon | 1759 | betejë | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | Chesapeake (Virginia Capes) | 1781 | betejë | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Nili (gjiri i Aboukir) | 1798 | betejë | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Kopenhaga | 1801 | betejë | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | mars 1862 | angazhim | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lissa | 1866 | betejë | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Yalu | 1894 | betejë | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Gjiri i Manilës | 1898 | betejë | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Gjiri i Helgolandit | gusht 1914 | betejë | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel dhe Falklandet | nëntor-dhjetor 1914 | fushatë | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Dogger Bank | janar 1915 | betejë | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | River Plate | dhjetor 1939 | betejë | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Taranto | nëntor 1940 | angazhim | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Kepi Matapan | mars 1941 | betejë | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Ngushtica e Danimarkës dhe fundosja e Bismarck-ut | maj 1941 | fushatë | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7 dhjetor 1941 | angazhim | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales dhe Repulse | 10 dhjetor 1941 | angazhim | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Deti i Java-s | shkurt 1942 | betejë | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Deti i Koralit | maj 1942 | betejë | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Ishulli Savo | gusht 1942 | betejë | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Solomonet Lindore | gusht 1942 | betejë | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Kepi Esperance | tetor 1942 | betejë | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Ishujt Santa Cruz | tetor 1942 | betejë | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Beteja detare e Guadalcanalit | 12-15 nëntor 1942 | betejë | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | nëntor 1942 | angazhim | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | Sulmi i Kanalit (Channel Dash) | shkurt 1942 | angazhim | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operacioni Pedestal | gusht 1942 | betejë | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Maji i zi | maj 1943 | fushatë | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Kepi i Veriut | dhjetor 1943 | betejë | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | Fushata e nëndetëseve amerikane kundër Japonisë | 1941-1945 | fushatë | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Përballë Samarit | 25 tetor 1944 | betejë | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Ngushtica e Surigaos | 25 tetor 1944 | betejë | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinawa: fushata kamikaze | prill-qershor 1945 | fushatë | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Fundosja e Eilatit | tetor 1967 | angazhim | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakia | tetor 1973 | betejë | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | Fundosja e General Belgrano | 2 maj 1982 | angazhim | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | Humbja e HMS Sheffield | 4 maj 1982 | angazhim | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17 maj 1987 | angazhim | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operacioni Praying Mantis | 18 prill 1988 | betejë | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | gusht 2004 | angazhim | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Revolucioni Bisu | mars 2007 | betejë | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | Dream Coil në The International 2013 | gusht 2013 | angazhim | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Zed i Faker-it kundër Ryu | shtator 2013 | angazhim | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Boost-i i Overpass-it | nëntor 2014 | angazhim | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | AWP që kërcen në Mirage | prill 2016 | angazhim | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis dhe epoka e utility-t | 2018 | fushatë | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five kundër OG | prill 2019 | betejë | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar arrin grandmaster | 2019 | fushatë | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Goditja e majtë (fushata tokësore e Desert Storm) | 24-28 shkurt 1991 | fushatë | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | Incidenti Corrupted Blood | shtator 2005 | fushatë | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Dizajni i lojës dhe i niveleve (17) {#game-and-level-design-17}

| id | titulli | modelet | burimet |
|---|---|---|---|
| `design.chokepoint` | Shtrëngimet në dizajnin e niveleve | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Rrugët e flankut dhe rrugët alternative | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Vijat e shikimit dhe distanca e angazhimit | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Vendosja e mbulesave dhe ritmi | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Dizajni i lindjeve dhe mbrojtja e lindjes | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Ekuilibri simetrik dhe asimetrik i hartës | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Ekuilibri i klasave dhe kundërshtimet | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Rrjedha, unazat dhe skemat e lexueshme | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Ekonomitë e lojërave dhe unazat e reagimit | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Matchmaking dhe shpërndarja e aftësive | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | Kundërshtarët AI si sonda të nivelit | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Loja me kuptim dhe zgjedhja | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Shkëmbimi dhe loja në ekip në shooter-at | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Kontrolli i hartës | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Hartat e nxehtësisë dhe telemetria hapësinore në dizajn | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Zotërimi, mësimi dhe argëtimi | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Ekonomitë e raundeve dhe vendimet e blerjes | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Studimet (113) {#studies-113}

| id | titulli | burimet |
|---|---|---|
| `study.engel-1954` | Engel: ligji katror i Lanchester-it në Iwo Jima | Engel 1954 |
| `study.bracken-1995` | Bracken: modelet e Lanchester-it për Ardenët | Bracken 1995 |
| `study.fricker-1998` | Fricker: modelet e lodhjes për Ardenët, rishikuar | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas dhe Turkes: Kursku dhe Ardenët | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley dhe Helmbold: vërtetimi i ligjit katror | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | Analizë GIS e vdekjeve të lojtarëve | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: vizualizimi i sjelljes konkurruese | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Vlerësimi i veprimeve në Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Zbulimi i takimeve në e-sport | Schubert et al. 2016 |
| `study.red-baron` | Projekti Red Baron: luftim ajror mbi Vietnam | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: gjykimi i kuantifikuar i betejave historike | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: përdorimi i forcës shpjegon rezultatet | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Sondazh mbi vizualizimin e të dhënave të lojës | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Lanchester kundrejt tre shekujve të betejave tokësore | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: gjashtëdhjetë angazhime të Luftës së Dytë Botërore | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: modelet e luftimit dhe Lufta Civile Amerikane | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: model statistikor i të dhënave të lodhjes | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: shpejtësia e përparimit në luftimin tokësor | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas dhe Dinges: rrethanat rëndojnë më shumë se ligji | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | Baza e të dhënave të Kurskut | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | Baza e të dhënave të fushatës së Ardenëve | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson dhe MacKay: Beteja e Britanisë si të dhëna Lanchester | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte dhe Schmidt: numrat ende fitojnë betejat | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: rregullsitë e humbjeve në betejë | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Modeli determinist numerik taktik i Dupuy-t | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: lufta me numra | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: fuqia luftarake | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter dhe Stam: demokracitë në luftë | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: modeli dinamik adaptiv | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester dhe lufta guerile | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: modeli stokastik i salvove | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: themelet e taktikës së flotës | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | Debati për rregullin 3:1 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: modelimi i konflikteve të armatosura | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Raporti Ault: raketat e lëshuara jashtë zarfit të tyre | Ault 1969; Michel 1997 |
| `study.gwaps` | Gulf War Air Power Survey | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Cirku i Blackett-it | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Cilësimet e bombave të thellësisë në Coastal Command | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Krahë të bardhë për avionët kundër nëndetëseve | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: blindim aty ku bombarduesit që u kthyen nuk ishin goditur | Mangel & Samaniego 1984 |
| `study.optimal-search` | Kërkimi optimal: nga nëndetëset te AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: lufta në ferr | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Parandalimi i hyrjes dhe mohimi i zonës | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Si humbin lojtarët interesin | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Grupimi i sjelljes së lojtarëve në natyrë | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Zbulimi i frustrimit të lojtarit | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: panelet e telemetrisë në prodhim | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: analitika vizuale e lojës | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Lëvizja e avatarëve në fushat e betejës të World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: instrumentimi i testeve të përdoruesve në shkallë | Kim et al. 2008 |
| `study.game-data-science` | Shkenca e të dhënave të lojërave | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Inteligjenca artificiale dhe lojërat | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Aftësia dhe lëvizja e ekipit në Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Modelet e luftimit që parashikojnë fitoret në MOBA | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Rolet e lojtarëve në Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Parashikimi i rezultateve të Dota 2 nga draftet | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Parashikimi i fitores në kohë reale në e-sport profesionist | Hodge et al. 2021 |
| `study.rioult-2014` | Topologjia e pozicioneve të lojtarëve | Rioult et al. 2014 |
| `study.bednarek-2017` | Vlerësimi i lojtarëve në shooter-at me ekip | Bednárek et al. 2017 |
| `study.katona-2019` | Parashikimi i kush vdes më pas | Katona et al. 2019 |
| `study.block-2018` | Histori të bazuara në të dhëna për audiencën e e-sportit | Block et al. 2018 |
| `study.ggviz` | ggViz: kërkimi i gjendjeve të lojës në shkallë | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: mësimi i përforcuar në shkallë të madhe në Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: nivel grandmaster në StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Vlera e pritshme e posedimit në basketboll | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: vlerësimi i veprimeve me top në futboll | Decroos et al. 2019 |
| `study.pitch-control` | Kontrolli i fushës dhe krijimi i hapësirës | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | Struktura hapësinore e aftësisë mbrojtëse | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Rolet e ekipit nga të dhënat e gjurmimit | Lucey et al. 2013 |
| `study.shot-quality` | Golat e pritshëm dhe cilësia e goditjes | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: efikasiteti hapësinor i gjuajtjes | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Analiza hapësinore-kohore e sporteve ekipore | Gudmundsson & Horton 2017 |
| `study.ripley-k` | K i Ripley-t: grumbullimi në çdo shkallë | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark dhe Evans: shpërndarja e fqinjit më të afërt | Clark & Evans 1954 |
| `study.getis-ord` | Pikat e nxehta të Getis-Ord | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Tregues lokalë të lidhjes hapësinore | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | Statistika e skanimit hapësinor | Kulldorff 1997 |
| `study.kde` | Vlerësimi i densitetit me kernel | Silverman 1986 |
| `study.knox-1964` | Ndërveprimi hapësinor-kohor | Knox 1964; Diggle 2013 |
| `study.maup` | Problemi i njësisë së zonës së modifikueshme (MAUP) | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Izovistat dhe grafet e dukshmërisë | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Sintaksa e hapësirës | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Grumbullimi mesatar | Lloyd 1967 |
| `study.survival-analysis` | Analiza e mbijetesës për kohën e vdekjes | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Modelet linear të përgjithësuara për numërimet | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap dhe intervalet e vlerësimit | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey et al.: vonesa dhe epërsia e atij që del në shikim | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee dhe Chang: të shtënat nga cepi | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: vonesa dhe veprimet e lojtarit | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos et al.: profesionistët dhe amatorët përmes probabilitetit të fitores | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos et al.: vendimet ekonomike në Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: vrasjet e zgjuara dhe vdekjet pa vlerë | Maymin 2021 |
| `study.moba-live-prediction` | Parashikimi i rezultatit në kohë reale në MOBA | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa et al.: raundet e Valorant nga veçoritë taktike | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv et al.: rolet në Counter-Strike 2 profesionist | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim et al.: stërvitja e luftimit në distancë të afërt | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Turbulenca e turmës në Haxhin e vitit 2006 | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Grupet që ecin formojnë turmat | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Dinamika hierarkike e grupeve në tufat e pëllumbave | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Ndikimi shoqëror e bën suksesin të pabarabartë dhe të paparashikueshëm | Salganik et al. 2006 |
| `study.wisdom-undermined` | Ndikimi shoqëror e dobëson mençurinë e turmave | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | Forca tërheqëse e një turme | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Konformizmi ndaj një shumice të njëzëshme | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: motivimi për luftim në Irak | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Kohezioni dhe performanca: meta-analiza | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Averzioni ndaj humbjes te golfistët profesionistë | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Duar të nxehta në bejsboll | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Penallti: profesionistët luajnë minimax | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Loja minimax në Wimbledon | Walker & Wooders 2001 |
| `study.collective-intelligence` | Inteligjenca kolektive e ekipeve | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Rrjetet sociale të një bote online | Szell et al. 2010 |
| `study.team-networks` | Rrjetet e pasimeve dhe performanca e ekipit | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Sjellja përhapet nëpër rrjete të grumbulluara | Centola 2010 |

### Bibliografia {#bibliography}


- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(kontrolluar 2026-11-15: detaje)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(kontrolluar 2026-11-15: detaje)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(kontrolluar 2026-11-15: detaje)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(kontrolluar 2026-11-15: detaje)*
- Ammianus Marcellinus (përkth. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(kontrolluar 2026-11-15: detaje)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(kontrolluar 2026-11-15: detaje)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(kontrolluar 2026-11-15: detaje)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(kontrolluar 2026-11-15: detaje)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Ardant du Picq, C. (përkth. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(kontrolluar 2026-11-15: detaje)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(kontrolluar 2026-11-15: detaje)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Arrian (përkth. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(kontrolluar 2026-11-15: detaje)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(kontrolluar 2026-11-15: detaje)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(kontrolluar 2026-11-15: detaje)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(kontrolluar 2026-11-15: detaje)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(kontrolluar 2026-11-15: detaje)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(kontrolluar 2026-11-15: detaje)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(kontrolluar 2026-11-15: detaje)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(kontrolluar 2026-11-15: detaje)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(kontrolluar 2026-11-15: detaje)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(kontrolluar 2026-11-15: detaje)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(kontrolluar 2026-11-15: detaje)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(kontrolluar 2026-11-15: detaje)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(kontrolluar 2026-11-15: detaje)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(kontrolluar 2026-11-15: detaje)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(kontrolluar 2026-11-15: detaje)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(kontrolluar 2026-11-15: detaje)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(kontrolluar 2026-11-15: detaje)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(kontrolluar 2026-11-15: ekzistenca)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(kontrolluar 2026-11-15: detaje)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(kontrolluar 2026-11-15: detaje)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(kontrolluar 2026-11-15: detaje)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(kontrolluar 2026-11-15: detaje)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(kontrolluar 2026-11-15: detaje)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(kontrolluar 2026-11-15: detaje)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(kontrolluar 2026-11-15: ekzistenca)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(kontrolluar 2026-11-15: detaje)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(kontrolluar 2026-11-15: detaje)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(kontrolluar 2026-11-15: detaje)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(kontrolluar 2026-11-15: detaje)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(kontrolluar 2026-11-15: detaje)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(kontrolluar 2026-11-15: detaje)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(kontrolluar 2026-11-15: ekzistenca)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(kontrolluar 2026-11-15: detaje)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(kontrolluar 2026-11-15: detaje)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(kontrolluar 2026-11-15: detaje)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(kontrolluar 2026-11-15: detaje)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(kontrolluar 2026-11-15: ekzistenca)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(kontrolluar 2026-11-15: detaje)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(kontrolluar 2026-11-15: detaje)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(kontrolluar 2026-11-15: detaje)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(kontrolluar 2026-11-15: detaje)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(kontrolluar 2026-11-15: ekzistenca)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(kontrolluar 2026-11-15: detaje)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(kontrolluar 2026-11-15: detaje)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(kontrolluar 2026-11-15: detaje)*
- Caesar, G. J. (përkth. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(kontrolluar 2026-11-15: detaje)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(kontrolluar 2026-11-15: detaje)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(kontrolluar 2026-11-15: detaje)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(kontrolluar 2026-11-15: detaje)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(kontrolluar 2026-11-15: detaje)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(kontrolluar 2026-11-15: detaje)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(kontrolluar 2026-11-15: detaje)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(kontrolluar 2026-11-15: detaje)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(kontrolluar 2026-11-15: detaje)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(kontrolluar 2026-11-15: detaje)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(kontrolluar 2026-11-15: detaje)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(kontrolluar 2026-11-15: detaje)*
- Clausewitz, C. von (përkth. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(kontrolluar 2026-11-15: detaje)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(kontrolluar 2026-11-15: detaje)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(kontrolluar 2026-11-15: detaje)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(kontrolluar 2026-11-15: detaje)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(kontrolluar 2026-11-15: detaje)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(kontrolluar 2026-11-15: detaje)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(kontrolluar 2026-11-15: detaje)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Corbett, J. S. (1920). Naval Operations vëll. 1 (History of the Great War). Longmans, Green, London. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Corbett, J. S. (1921). Naval Operations vëll. 2 (History of the Great War). Longmans, Green, London. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Corbett, J. S. (1923). Naval Operations vëll. 3 (History of the Great War). Longmans, Green, London. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(kontrolluar 2026-11-15: ekzistenca)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(kontrolluar 2026-11-15: detaje)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(kontrolluar 2026-11-15: detaje)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(kontrolluar 2026-11-15: detaje)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vëll. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(kontrolluar 2026-11-15: ekzistenca)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vëll. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(kontrolluar 2026-11-15: ekzistenca)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(kontrolluar 2026-11-15: detaje)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(kontrolluar 2026-11-15: detaje)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(kontrolluar 2026-11-15: detaje)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(kontrolluar 2026-11-15: ekzistenca)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(kontrolluar 2026-11-15: detaje)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(kontrolluar 2026-11-15: detaje)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(kontrolluar 2026-11-15: detaje)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(kontrolluar 2026-11-15: detaje)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(kontrolluar 2026-11-15: detaje)*
- Delbrück, H. (përkth. Renfroe, W. J.) (1990). History of the Art of War, vëll. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(kontrolluar 2026-11-15: ekzistenca)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(kontrolluar 2026-11-15: detaje)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(kontrolluar 2026-11-15: detaje)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(kontrolluar 2026-11-15: detaje)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(kontrolluar 2026-11-15: detaje)*
- Douhet, G. (përkth. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(kontrolluar 2026-11-15: detaje)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(kontrolluar 2026-11-15: detaje)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(kontrolluar 2026-11-15: detaje)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(kontrolluar 2026-11-15: detaje)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(kontrolluar 2026-11-15: ekzistenca)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(kontrolluar 2026-11-15: detaje)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(kontrolluar 2026-11-15: detaje)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(kontrolluar 2026-11-15: detaje)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(kontrolluar 2026-11-15: detaje)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(kontrolluar 2026-11-15: detaje)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(kontrolluar 2026-11-15: detaje)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(kontrolluar 2026-11-15: detaje)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(kontrolluar 2026-11-15: detaje)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(kontrolluar 2026-11-15: detaje)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(kontrolluar 2026-11-15: ekzistenca)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(kontrolluar 2026-11-15: detaje)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(kontrolluar 2026-11-15: detaje)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(kontrolluar 2026-11-15: detaje)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(kontrolluar 2026-11-15: detaje)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(kontrolluar 2026-11-15: detaje)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(kontrolluar 2026-11-15: detaje)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(kontrolluar 2026-11-15: detaje)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(kontrolluar 2026-11-15: detaje)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(kontrolluar 2026-11-15: detaje)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(kontrolluar 2026-11-15: detaje)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(kontrolluar 2026-11-15: detaje)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(kontrolluar 2026-11-15: detaje)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(kontrolluar 2026-11-15: detaje)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(kontrolluar 2026-11-15: detaje)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(kontrolluar 2026-11-15: detaje)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(kontrolluar 2026-11-15: detaje)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(kontrolluar 2026-11-15: detaje)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(kontrolluar 2026-11-15: detaje)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(kontrolluar 2026-11-15: detaje)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(kontrolluar 2026-11-15: ekzistenca)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(kontrolluar 2026-11-15: detaje)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(kontrolluar 2026-11-15: detaje)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(kontrolluar 2026-11-15: detaje)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(kontrolluar 2026-11-15: detaje)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(kontrolluar 2026-11-15: detaje)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(kontrolluar 2026-11-15: detaje)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(kontrolluar 2026-11-15: detaje)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(kontrolluar 2026-11-15: detaje)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(kontrolluar 2026-11-15: detaje)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(kontrolluar 2026-11-15: detaje)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(kontrolluar 2026-11-15: detaje)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(kontrolluar 2026-11-15: detaje)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(kontrolluar 2026-11-15: detaje)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(kontrolluar 2026-11-15: detaje)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(kontrolluar 2026-11-15: detaje)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(kontrolluar 2026-11-15: detaje)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(kontrolluar 2026-11-15: detaje)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(kontrolluar 2026-11-15: detaje)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(kontrolluar 2026-11-15: detaje)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(kontrolluar 2026-11-15: detaje)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(kontrolluar 2026-11-15: detaje)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(kontrolluar 2026-11-15: detaje)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(kontrolluar 2026-11-15: detaje)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(kontrolluar 2026-11-15: detaje)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(kontrolluar 2026-11-15: detaje)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(kontrolluar 2026-11-15: detaje)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(kontrolluar 2026-11-15: detaje)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(kontrolluar 2026-11-15: detaje)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(kontrolluar 2026-11-15: detaje)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(kontrolluar 2026-11-15: detaje)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(kontrolluar 2026-11-15: detaje)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(kontrolluar 2026-11-15: detaje)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(kontrolluar 2026-11-15: detaje)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(kontrolluar 2026-11-15: detaje)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(kontrolluar 2026-11-15: detaje)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(kontrolluar 2026-11-15: detaje)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(kontrolluar 2026-11-15: detaje)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(kontrolluar 2026-11-15: detaje)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(kontrolluar 2026-11-15: detaje)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(kontrolluar 2026-11-15: detaje)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(kontrolluar 2026-11-15: detaje)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(kontrolluar 2026-11-15: detaje)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(kontrolluar 2026-11-15: detaje)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(kontrolluar 2026-11-15: detaje)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(kontrolluar 2026-11-15: detaje)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(kontrolluar 2026-11-15: detaje)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(kontrolluar 2026-11-15: detaje)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(kontrolluar 2026-11-15: detaje)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(kontrolluar 2026-11-15: detaje)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(kontrolluar 2026-11-15: detaje)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(kontrolluar 2026-11-15: detaje)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(kontrolluar 2026-11-15: detaje)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(kontrolluar 2026-11-15: detaje)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(kontrolluar 2026-11-15: detaje)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(kontrolluar 2026-11-15: detaje)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(kontrolluar 2026-11-15: detaje)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(kontrolluar 2026-11-15: detaje)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(kontrolluar 2026-11-15: detaje)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(kontrolluar 2026-11-15: ekzistenca)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Herodotus (përkth. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(kontrolluar 2026-11-15: detaje)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(kontrolluar 2026-11-15: detaje)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(kontrolluar 2026-11-15: detaje)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(kontrolluar 2026-11-15: detaje)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(kontrolluar 2026-11-15: detaje)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(kontrolluar 2026-11-15: detaje)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(kontrolluar 2026-11-15: detaje)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(kontrolluar 2026-11-15: detaje)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(kontrolluar 2026-11-15: detaje)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(kontrolluar 2026-11-15: detaje)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(kontrolluar 2026-11-15: detaje)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(kontrolluar 2026-11-15: detaje)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(kontrolluar 2026-11-15: detaje)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(kontrolluar 2026-11-15: detaje)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(kontrolluar 2026-11-15: detaje)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(kontrolluar 2026-11-15: detaje)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(kontrolluar 2026-11-15: detaje)*
- Isserson, G. S. (përkth. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(kontrolluar 2026-11-15: detaje)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(kontrolluar 2026-11-15: detaje)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Jomini, A.-H. de (përkth. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(kontrolluar 2026-11-15: detaje)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(kontrolluar 2026-11-15: detaje)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(kontrolluar 2026-11-15: detaje)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(kontrolluar 2026-11-15: detaje)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(kontrolluar 2026-11-15: detaje)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(kontrolluar 2026-11-15: ekzistenca)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(kontrolluar 2026-11-15: detaje)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(kontrolluar 2026-11-15: detaje)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(kontrolluar 2026-11-15: detaje)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(kontrolluar 2026-11-15: detaje)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(kontrolluar 2026-11-15: detaje)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(kontrolluar 2026-11-15: detaje)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(kontrolluar 2026-11-15: detaje)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(kontrolluar 2026-11-15: detaje)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(kontrolluar 2026-11-15: detaje)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(kontrolluar 2026-11-15: detaje)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(kontrolluar 2026-11-15: detaje)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(kontrolluar 2026-11-15: detaje)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(kontrolluar 2026-11-15: detaje)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(kontrolluar 2026-11-15: ekzistenca)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(kontrolluar 2026-11-15: detaje)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(kontrolluar 2026-11-15: detaje)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(kontrolluar 2026-11-15: detaje)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(kontrolluar 2026-11-15: detaje)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(kontrolluar 2026-11-15: detaje)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(kontrolluar 2026-11-15: detaje)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(kontrolluar 2026-11-15: detaje)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(kontrolluar 2026-11-15: detaje)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(kontrolluar 2026-11-15: detaje)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(kontrolluar 2026-11-15: detaje)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(kontrolluar 2026-11-15: ekzistenca)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(kontrolluar 2026-11-15: detaje)*
- Livy (përkth. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(kontrolluar 2026-11-15: detaje)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(kontrolluar 2026-11-15: detaje)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(kontrolluar 2026-11-15: detaje)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(kontrolluar 2026-11-15: detaje)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(kontrolluar 2026-11-15: ekzistenca)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(kontrolluar 2026-11-15: detaje)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(kontrolluar 2026-11-15: detaje)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(kontrolluar 2026-11-15: detaje)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(kontrolluar 2026-11-15: detaje)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(kontrolluar 2026-11-15: detaje)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(kontrolluar 2026-11-15: detaje)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(kontrolluar 2026-11-15: detaje)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(kontrolluar 2026-11-15: ekzistenca)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(kontrolluar 2026-11-15: detaje)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(kontrolluar 2026-11-15: detaje)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(kontrolluar 2026-11-15: detaje)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(kontrolluar 2026-11-15: detaje)*
- Mao Tse-tung (përkth. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(kontrolluar 2026-11-15: ekzistenca)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(kontrolluar 2026-11-15: detaje)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(kontrolluar 2026-11-15: detaje)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(kontrolluar 2026-11-15: detaje)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(kontrolluar 2026-11-15: detaje)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(kontrolluar 2026-11-15: detaje)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(kontrolluar 2026-11-15: detaje)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(kontrolluar 2026-11-15: detaje)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(kontrolluar 2026-11-15: detaje)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(kontrolluar 2026-11-15: detaje)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(kontrolluar 2026-11-15: detaje)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(kontrolluar 2026-11-15: ekzistenca)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(kontrolluar 2026-11-15: detaje)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(kontrolluar 2026-11-15: detaje)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(kontrolluar 2026-11-15: detaje)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(kontrolluar 2026-11-15: detaje)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(kontrolluar 2026-11-15: detaje)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(kontrolluar 2026-11-15: detaje)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(kontrolluar 2026-11-15: detaje)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(kontrolluar 2026-11-15: detaje)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(kontrolluar 2026-11-15: detaje)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(kontrolluar 2026-11-15: detaje)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(kontrolluar 2026-11-15: detaje)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(kontrolluar 2026-11-15: ekzistenca)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(kontrolluar 2026-11-15: ekzistenca)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(kontrolluar 2026-11-15: detaje)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(kontrolluar 2026-11-15: detaje)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(kontrolluar 2026-11-15: detaje)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(kontrolluar 2026-11-15: detaje)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vëll. 3). Little, Brown, Boston. *(kontrolluar 2026-11-15: detaje)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vëll. 4). Little, Brown, Boston. *(kontrolluar 2026-11-15: ekzistenca)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vëll. 5). Little, Brown, Boston. *(kontrolluar 2026-11-15: ekzistenca)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vëll. 6). Little, Brown, Boston. *(kontrolluar 2026-11-15: detaje)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vëll. 8). Little, Brown, Boston. *(kontrolluar 2026-11-15: detaje)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vëll. 12). Little, Brown, Boston. *(kontrolluar 2026-11-15: ekzistenca)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vëll. 14). Little, Brown, Boston. *(kontrolluar 2026-11-15: detaje)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(kontrolluar 2026-11-15: detaje)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(kontrolluar 2026-11-15: detaje)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(kontrolluar 2026-11-15: detaje)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(kontrolluar 2026-11-15: detaje)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(kontrolluar 2026-11-15: detaje)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(kontrolluar 2026-11-15: detaje)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(kontrolluar 2026-11-15: detaje)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(kontrolluar 2026-11-15: detaje)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(kontrolluar 2026-11-15: detaje)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(kontrolluar 2026-11-15: detaje)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(kontrolluar 2026-11-15: detaje)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(kontrolluar 2026-11-15: detaje)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(kontrolluar 2026-11-15: detaje)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(kontrolluar 2026-11-15: ekzistenca)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(kontrolluar 2026-11-15: detaje)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(kontrolluar 2026-11-15: detaje)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(kontrolluar 2026-11-15: detaje)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(kontrolluar 2026-11-15: detaje)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(kontrolluar 2026-11-15: detaje)*
- Osipov, M. (përkth. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(kontrolluar 2026-11-15: detaje)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US botim: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(kontrolluar 2026-11-15: detaje)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(kontrolluar 2026-11-15: detaje)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(kontrolluar 2026-11-15: detaje)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(kontrolluar 2026-11-15: detaje)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(kontrolluar 2026-11-15: detaje)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(kontrolluar 2026-11-15: detaje)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(kontrolluar 2026-11-15: detaje)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(kontrolluar 2026-11-15: detaje)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(kontrolluar 2026-11-15: detaje)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(kontrolluar 2026-11-15: detaje)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(kontrolluar 2026-11-15: detaje)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(kontrolluar 2026-11-15: detaje)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(kontrolluar 2026-11-15: detaje)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(kontrolluar 2026-11-15: detaje)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(kontrolluar 2026-11-15: detaje)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(kontrolluar 2026-11-15: detaje)*
- Plutarch (përkth. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(kontrolluar 2026-11-15: detaje)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(kontrolluar 2026-11-15: detaje)*
- Polybius (përkth. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(kontrolluar 2026-11-15: detaje)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(kontrolluar 2026-11-15: detaje)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(kontrolluar 2026-11-15: detaje)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(kontrolluar 2026-11-15: detaje)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(kontrolluar 2026-11-15: detaje)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(kontrolluar 2026-11-15: detaje)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(kontrolluar 2026-11-15: detaje)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(kontrolluar 2026-11-15: detaje)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(kontrolluar 2026-11-15: detaje)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(kontrolluar 2026-11-15: detaje)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(kontrolluar 2026-11-15: detaje)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(kontrolluar 2026-11-15: detaje)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(kontrolluar 2026-11-15: detaje)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(kontrolluar 2026-11-15: detaje)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(kontrolluar 2026-11-15: detaje)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(kontrolluar 2026-11-15: detaje)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(kontrolluar 2026-11-15: detaje)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(kontrolluar 2026-11-15: detaje)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(kontrolluar 2026-11-15: detaje)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(kontrolluar 2026-11-15: detaje)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(kontrolluar 2026-11-15: detaje)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(kontrolluar 2026-11-15: ekzistenca)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vëll. 1: The Defensive. HMSO, London. *(kontrolluar 2026-11-15: ekzistenca)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vëll. 2: The Period of Balance. HMSO, London. *(kontrolluar 2026-11-15: ekzistenca)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vëll. 3, part 1: The Offensive. HMSO, London. *(kontrolluar 2026-11-15: ekzistenca)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(kontrolluar 2026-11-15: detaje)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(kontrolluar 2026-11-15: detaje)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(kontrolluar 2026-11-15: detaje)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(kontrolluar 2026-11-15: detaje)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(kontrolluar 2026-11-15: detaje)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(kontrolluar 2026-11-15: detaje)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(kontrolluar 2026-11-15: detaje)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(kontrolluar 2026-11-15: detaje)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(kontrolluar 2026-11-15: ekzistenca)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(kontrolluar 2026-11-15: detaje)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(kontrolluar 2026-11-15: detaje)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(kontrolluar 2026-11-15: detaje)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(kontrolluar 2026-11-15: detaje)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(kontrolluar 2026-11-15: ekzistenca)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(kontrolluar 2026-11-15: detaje)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(kontrolluar 2026-11-15: ekzistenca)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(kontrolluar 2026-11-15: detaje)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(kontrolluar 2026-11-15: detaje)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(kontrolluar 2026-11-15: detaje)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(kontrolluar 2026-11-15: detaje)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(kontrolluar 2026-11-15: detaje)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(kontrolluar 2026-11-15: ekzistenca)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(kontrolluar 2026-11-15: detaje)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(kontrolluar 2026-11-15: detaje)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(kontrolluar 2026-11-15: detaje)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(kontrolluar 2026-11-15: detaje)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(kontrolluar 2026-11-15: detaje)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(kontrolluar 2026-11-15: detaje)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(kontrolluar 2026-11-15: detaje)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(kontrolluar 2026-11-15: detaje)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(kontrolluar 2026-11-15: detaje)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(kontrolluar 2026-11-15: detaje)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(kontrolluar 2026-11-15: detaje)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(kontrolluar 2026-11-15: ekzistenca)*
- Sun Tzu (përkth. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(kontrolluar 2026-11-15: detaje)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(kontrolluar 2026-11-15: detaje)*
- Tacitus (përkth. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(kontrolluar 2026-11-15: detaje)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(kontrolluar 2026-11-15: detaje)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(kontrolluar 2026-11-15: detaje)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(kontrolluar 2026-11-15: detaje)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(kontrolluar 2026-11-15: detaje)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(kontrolluar 2026-11-15: detaje)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(kontrolluar 2026-11-15: detaje)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(kontrolluar 2026-11-15: detaje)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(kontrolluar 2026-11-15: detaje)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(kontrolluar 2026-11-15: detaje)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(kontrolluar 2026-11-15: detaje)*
- Triandafillov, V. K. (përkth. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(kontrolluar 2026-11-15: detaje)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(kontrolluar 2026-11-15: detaje)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(kontrolluar 2026-11-15: detaje)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(kontrolluar 2026-11-15: detaje)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(kontrolluar 2026-11-15: detaje)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(kontrolluar 2026-11-15: detaje)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(kontrolluar 2026-11-15: detaje)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(kontrolluar 2026-11-15: ekzistenca)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vëll. 7. Government Printing Office, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vëll. 21 (Fredericksburg). Government Printing Office, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(kontrolluar 2026-11-15: detaje)*
- Vegetius (përkth. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(domen publik)* *(kontrolluar 2026-11-15: ekzistenca)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(kontrolluar 2026-11-15: detaje)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(kontrolluar 2026-11-15: detaje)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(kontrolluar 2026-11-15: detaje)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(kontrolluar 2026-11-15: detaje)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(kontrolluar 2026-11-15: detaje)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(kontrolluar 2026-11-15: detaje)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(kontrolluar 2026-11-15: detaje)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(kontrolluar 2026-11-15: detaje)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(kontrolluar 2026-11-15: ekzistenca)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(kontrolluar 2026-11-15: detaje)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(kontrolluar 2026-11-15: ekzistenca)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(kontrolluar 2026-11-15: ekzistenca)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(kontrolluar 2026-11-15: detaje)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(kontrolluar 2026-11-15: ekzistenca)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(kontrolluar 2026-11-15: detaje)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(kontrolluar 2026-11-15: detaje)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(kontrolluar 2026-11-15: detaje)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(kontrolluar 2026-11-15: detaje)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(kontrolluar 2026-11-15: detaje)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(kontrolluar 2026-11-15: detaje)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(kontrolluar 2026-11-15: ekzistenca)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(kontrolluar 2026-11-15: detaje)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(kontrolluar 2026-11-15: detaje)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(kontrolluar 2026-11-15: detaje)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(kontrolluar 2026-11-15: detaje)*
- Xenophon (përkth. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(domen publik)* *(kontrolluar 2026-11-15: detaje)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(kontrolluar 2026-11-15: detaje)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(kontrolluar 2026-11-15: detaje)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(kontrolluar 2026-11-15: detaje)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(kontrolluar 2026-11-15: ekzistenca)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(kontrolluar 2026-11-15: detaje)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(kontrolluar 2026-11-15: ekzistenca)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(kontrolluar 2026-11-15: ekzistenca)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(kontrolluar 2026-11-15: detaje)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(kontrolluar 2026-11-15: detaje)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(kontrolluar 2026-11-15: detaje)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(kontrolluar 2026-11-15: detaje)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(kontrolluar 2026-11-15: detaje)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(kontrolluar 2026-11-15: detaje)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(kontrolluar 2026-11-15: detaje)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(kontrolluar 2026-11-15: detaje)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(kontrolluar 2026-11-15: detaje)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(kontrolluar 2026-11-15: detaje)*

<!-- kb:end -->
