---
title: "Þekkingarskrá"
parent: "Þekkingarlinsan"
nav_order: 2
lang: "is"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Þekkingarskrá

Þetta er full skrá yfir það sem [þekkingarlinsan](knowledge.md) veit: mynstrin sem hún leitar að, hugmyndirnar, aðferðirnar, sögulegu dæmin og rannsóknirnar sem hún vitnar í, ásamt bókunum og greinunum að baki þeim. Notaðu skrána til að fletta upp færslu eftir auðkenni hennar eða til að athuga heimild.

Þessi síða er búin til úr þekkingargrunninum með `node tools/knowledge-doc.mjs`; ekki breyta neinu á milli merkjanna.

<!-- kb:begin -->

Þekkingargrunnurinn hefur 579 færslur (135 hugtök, 37 aðferðir, 277 söguleg dæmi, 17 hönnunarreglur, 113 rannsóknir) yfir 93 mynstur og vísar í 556 heimildir.

### Mynstur (93) {#patterns-93}

| auðkenni | ætt | hvernig það lítur út í gögnunum |
|---|---|---|
| `concentration` | kraftur | Sú hlið sem flytur fleiri einingar á einn stað vinnur þann stað með meiri mun en fjöldinn einn skýrir. |
| `local-superiority` | kraftur | Fellur lenda hjá þeirri hlið sem er fjölmennari innan skotfæris, hverjar sem heildartölurnar eru. |
| `attrition` | kraftur | Tapið fylgir styrk beggja hliða yfir tíma; bardaginn ræðst af því hvor klárast fyrst. |
| `exchange-ratio` | kraftur | Fellur á hvert tap eru mjög mismunandi eftir stað, hlið eða flokki. |
| `aimed-fire` | kraftur | Tapið vex með fjölda óvinarins en ekki með eigin fjölda. |
| `area-fire` | kraftur | Tapið vex með margfeldi fjölda beggja hliða: þrengsli eru refsiverð. |
| `defeat-in-detail` | kraftur | Hlið er eydd smátt og smátt þegar hlutar hennar koma einn af öðrum. |
| `mutual-support` | kraftur | Tapi er fljótt svarað af nærstöddum liðsfélaga: skipti. |
| `combined-arms` | kraftur | Flokkar standa sig vel saman þar sem hver hylur veikleika hins, og illa einir. |
| `class-counter` | kraftur | Einn flokkur vinnur óvenjulega mikið gegn ákveðnum öðrum flokki eða á ákveðnum stað. |
| `initiative` | kraftur | Sá sem skorar fyrst í viðureign vinnur hana oftast. |
| `key-terrain` | landslag | Sömu fáu staðirnir ráða bardögum leik eftir leik. |
| `fields-of-fire` | landslag | Staðir sem sjá langt yfir landið sem aðrir verða að fara yfir skora fleiri fellur. |
| `high-ground` | landslag | Fellur verða úr hæð yfir landinu þar sem fórnarlömbin standa. |
| `cover` | landslag | Dauðsföll á tíma minnka þar sem landslagið hindrar sjón og skot. |
| `open-ground` | landslag | Dauðsföll á tíma aukast þar sem ekkert hindrar sjón og skot. |
| `kill-zone` | landslag | Dauðsföll safnast þar sem hreyfing neyðist um svæði sem sést til og er varið með skotum. |
| `chokepoint` | landslag | Margar yfirferðir þrengjast um lítið land, með tapi þar. |
| `reverse-slope` | landslag | Öryggi rétt bak við hrygg eða vegg, utan beinnar sjónar óvinarins. |
| `safe-ground` | landslag | Staður þar sem tíminn fer í en fáir falla. |
| `obstacle` | landslag | Leiðir beygja um lokað land í fáar brautir. |
| `flank` | hreyfing | Sjaldan notuð leið leiðir til fleiri fellna en aðalleiðirnar. |
| `avenue-of-approach` | hreyfing | Hreyfingin fer um fáar brautir milli svæða. |
| `mobility` | hreyfing | Einingar á hreyfingu falla minna (eða meira) á tíma en seinar eða kyrrar einingar. |
| `static-exposure` | hreyfing | Einingar sem standa kyrrar falla meira á tíma en þær sem hreyfast. |
| `interior-lines` | hreyfing | Hlið með stuttar leiðir milli bardaga sinna breytir styrk hraðar en hin. |
| `envelopment` | hreyfing | Fellur koma úr mörgum áttum á stöðu einnar hliðar. |
| `ambush` | hreyfing | Einingar sem fara eftir leið falla fljótt fyrir óvinum sem þegar eru í stöðu. |
| `spawn-pressure` | tími | Líf enda fljótt eftir að þau hefjast á einum upprunastað. |
| `tempo` | tími | Hraðari hliðin kemst í bardagann og skorar áður en hin bregst við. |
| `surprise` | tími | Tapið kemur í hrinu áður en fórnarlömbin ná að svara. |
| `energy-advantage` | loft | Þeir sem drepa hafa meiri hæð og hraða en fórnarlömbin. |
| `air-superiority` | loft | Flugvélar einnar hliðar fella margfalt meira en þær tapa. |
| `sead` | loft | Loftvarnir á jörðu taka margar flugvélar þar til þær finnast og eru eyddar. |
| `bvr` | loft | Fellur verða á löngu færi, áður en fórnarlambið nær að loka bilinu. |
| `fleet-salvo` | sjór | Sá sem á fyrsta höggið tapar litlu; hinir lifa lítið af til að svara. |
| `scouting` | sjór | Sú hlið sem finnur hina fyrst velur bardagann. |
| `urban-close` | borg | Stutt skotfæri, mörg dauðsföll meðal þéttrar byggðar og hægur hreinsunartími. |
| `vertical` | borg | Fellur úr efri hæðum eða þökum niður á götur. |
| `skill-dispersion` | fólk | Fáir leikmenn eiga stóran hluta fellna eða dauðsfalla. |
| `ai-vs-player` | fólk | Gervigreindarstýrðar einingar standa sig öðruvísi en leikmenn á sama stað. |
| `balance` | hönnun | Hliðar, upprunastaðir eða flokkar byrja með misjafna möguleika. |
| `economy` | hönnun | Auðlindir sem eru unnar, greiddar og tapaðar safnast á fáa staði eða leikmenn. |
| `flow` | hönnun | Hvernig leikmenn fara um borðið: lykkjur, brautir, blindgötur. |
| `sightlines` | hönnun | Löng sjónlína ræður hvar bardagar hefjast og hver vinnur þá. |
| `readability` | hönnun | Dauðsföll sem leikmenn sjá ekki koma: aftan frá, utan sjónsviðs. |
| `formation` | hreyfing | Einingar hliðar fara saman í þekkjanlegri mynd: lína, dálkur, fleygur, þrep, kassi. |
| `frontal-assault` | hreyfing | Hópur nálgast óvininn beint framan í framhlið hans. |
| `double-envelopment` | hreyfing | Tveir hópar ráðast á báða kanta sama óvinahers um svipað leyti. |
| `encirclement` | hreyfing | Óvinahópur endar með hina hliðina allt í kring um sig og fáar leiðir út. |
| `penetration` | hreyfing | Hópur fer í gegnum línu óvinarins þar sem óvinir standa beggja vegna. |
| `fire-and-maneuver` | hreyfing | Hluti hóps hreyfist meðan hinir standa kyrrir og hylja hann, og hlutverkin skiptast á. |
| `feint` | hreyfing | Lítill hópur dregur óvininn á einn stað; aðalátakið kemur annars staðar skömmu síðar. |
| `withdrawal` | hreyfing | Hópur í snertingu snýr sér undan og eykur bilið að óvininum. |
| `pursuit` | hreyfing | Hópur eltir óvin sem fer burt og heldur eða minnkar bilið. |
| `defence-in-depth` | landslag | Varnarmenn standa í mörgum beltum hvert á eftir öðru eftir framrásarás óvinarins. |
| `screening` | hreyfing | Lítil eining fer langt á undan meginhlutanum og mætir óvininum fyrst. |
| `dispersion` | kraftur | Hlið dreifir sér með tímanum; færri einingar hennar eru á sama stað. |
| `missile-defence` | loft | Flugvélar undir eldflaugaógn snúa ógninni að hliðinni eða skottinu: crank, notch, drag, pump. |
| `angles-fight` | loft | Návígisbardagi í lofti á lágum hraða og mikilli beygjugetu, barist um stöðu nefsins fremur en orku. |
| `cap` | loft | Flugvélar sveima yfir föstum stað í mínútur og bíða eftir óvininum. |
| `strike-package` | loft | Flugvélar ólíkra hlutverka fljúga saman að marki; sumar ráðast á jörðina, aðrar verja þær. |
| `line-of-battle` | sjór | Skip sigla í röð hvert á eftir öðru svo allar hliðar byssna nái skotum. |
| `crossing-the-t` | sjór | Röð fer þvert fyrir haus óvinarraðarinnar: allar byssur hennar beinast, fáar óvinarinnar. |
| `fatal-funnel` | borg | Leikmenn sem fara inn um eina dyr, herbergi eða þrengsli deyja þar á augnabliki mun oftar en þeir sem fara inn annars staðar. |
| `crossfire` | kraftur | Þeir sem halda stöðu þar sem skotlínur mætast úr mismunandi hornum vinna fleiri einvígi en einn einn. |
| `peeker-advantage` | tími | Leikmaðurinn sem kemur í sjónsvið vinnur einvígi gegn þeim sem heldur horninu oftar (eða sjaldnar) en í helmingi tilvika. |
| `entry` | tími | Fyrsta fellan í lotu ræður miklu um hana; innkomur vinna eða tapa eftir stað og stuðningi. |
| `utility-support` | kraftur | Blossi eða reykur rétt fyrir einvígi breytir því hver vinnur það. |
| `man-advantage` | kraftur | Lotur vinnur sú hlið sem hefur fleiri leikmenn á lífi, og sumar hliðar nýta eða henda forskoti. |
| `clutch` | fólk | Síðustu leikmenn á lífi vinna oftar (eða sjaldnar) en ástand lotunnar spáir. |
| `action-value` | fólk | Fellur, skipti, uppsetningar og hjálpartæki eru mismunandi í því hve mikið þau breyta líkum á sigri. |
| `lurk` | hreyfing | Leikmaður einn fjarri liðinu fellir (eða fellur) í annarri tíðni en hópurinn. |
| `rotation` | hreyfing | Hversu hratt hlið færir leikmenn í bardagann eða að markmiðinu ræður hvort hún heldur eða nær aftur. |
| `collective-order` | fólk | Hreyfanlegar einingar hliðar snúa í sömu átt mun oftar en eigin slóðir, færðar til í tíma, myndu gera af tilviljun. |
| `milling` | fólk | Einingar hliðar hringsnúast um sameiginlega miðju: snúningur án nettóferðar. |
| `herding` | fólk | Einingar fara frá stað eins og liðsfélaginn á undan gerði, umfram eigin líkur staðarins og umfram það að herma eftir óvininum. |
| `lane-formation` | fólk | Andstæð flæði halda sig í aðskildum brautum; hreyfing safnast á fáar slóðir sem eru notaðar leik eftir leik. |
| `crowding` | fólk | Hraði og flæði minnka þegar einingar þjappast; um þrengsli fer minna í gegn þótt ýtt sé fastar. |
| `leadership` | fólk | Sumar einingar snúa fyrst og aðrar herma eftir stefnu þeirra nokkrum sekúndum síðar. |
| `cohesion` | fólk | Einingar sem reka frá hópnum falla oftar en þær sem halda sig með honum. |
| `breaking-point` | fólk | Hlið sem hefur misst hluta styrks síns hættir að sækja og hopar, umfram það sem fjarlægðin að óvininum skýrir. |
| `panic` | fólk | Undir skyndilegri ógn dreifast einingar, flýja eða frjósa, og samhæfingin hrynur. |
| `loss-chasing` | fólk | Eftir tap taka einingar meiri (eða minni) áhættu en eftir ávinning. |
| `hot-hand` | fólk | Velgengni fylgir velgengni oftar en stokkaðar raðir sama leikmanns leyfa. |
| `conformity` | fólk | Meðlimir hliðar velja eins - kaup, búnað, leiðir - umfram eigin val. |
| `suppression` | fólk | Skothríð sem berst hefur áhrif á hvernig einingar hreyfa sig og skjóta, jafnvel þótt hún drepi ekki. |
| `social-loafing` | fólk | Átak á hvern einstakling minnkar eftir því sem fleiri liðsfélagar eru til staðar. |
| `mixed-strategy` | fólk | Val sem ætti að vera óútreiknanlegt verður mynstrað: einn kostur vinnur oftar, eða val fylgja röð. |
| `coordination` | fólk | Meðlimir starfa í takt án sýnilegra skipana: samhæfð hreyfing, tímasetning og val. |
| `contagion` | fólk | Ástand berst frá einingu til einingar við snertingu eða nálægð og breiðist um kortið. |
| `territoriality` | fólk | Einingar halda fjarlægð hver frá annarri og halda sig á eigin landi. |
| `interaction-network` | fólk | Hver berst, styður og fylgir hverjum myndar net með miðstöðvum, klösum og brúm. |

### Hugtök (135) {#concepts-135}

| auðkenni | heiti | sjónarhorn | mynstur | heimildir |
|---|---|---|---|---|
| `concept.lanchester-square` | Lanchester-lögmál ferningsins (markviss skot) | hernaður, loft, sjó, rafíþróttir | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Línulegt lögmál Lanchesters (svæðisskot, einn gegn einum) | hernaður, borg, rafíþróttir | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Samþjöppun afla (massi) | hernaður, loft, sjó, rafíþróttir | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Hlutföll afla og 3:1-reglan | hernaður | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Skiptahlutfall tapa | hernaður, loft, rafíþróttir, hönnun | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Bardagamáttur og margfaldarar hans | hernaður | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Nútímakerfi beitingar herafla | hernaður | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | OODA-lykkjan (athuga, greina, ákveða, framkvæma) | hernaður, loft, rafíþróttir | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Orku- og hreyfigetukenningin | loft | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Grunnflugbardagahreyfingar og loftbardagastjórnun | loft | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Landgreining: OAKOC / KOCOA | hernaður, hönnun, borg | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: verkefnabreytur | hernaður | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Lykil- og úrslitaland | hernaður, hönnun, rafíþróttir | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Athugun og skotsvið | hernaður, hönnun, rafíþróttir, borg | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Skjól og felur | hernaður, borg, hönnun | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Framrásarleiðir og hreyfigangar | hernaður, hönnun | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Þrengsli og gljúfur | hernaður, hönnun, rafíþróttir | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Bardagasvæði og drápssvæði | hernaður, borg, hönnun | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Vörn á bakhlið hryggjar og felulandsvörn | hernaður, hönnun | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Hæðin | hernaður, hönnun | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Innri og ytri línur | hernaður | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Sigrað í smáatriðum | hernaður, rafíþróttir | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Gagnkvæmur stuðningur | hernaður, loft, rafíþróttir | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Samverkandi hergreinar | hernaður, hönnun | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Bæling | hernaður, borg | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Bæling og eyðing loftvarna óvinarins (SEAD/DEAD) | loft, hernaður | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Loftvarnarsveimur (CAP) og loftyfirráð | loft | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Átök utan sjónsviðs | loft | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Óbein nálgun | hernaður, rafíþróttir, hönnun | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Umlykjing og umkringing | hernaður | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Launsátur | hernaður, rafíþróttir, hönnun | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Varnir í dýpt | hernaður | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Núningur og þokan í stríði | hernaður, rafíþróttir | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Hápunktur sóknar | hernaður | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Óvænt árás | hernaður, loft, sjó, rafíþróttir | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Sparnaður afla | hernaður, rafíþróttir | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Þéttbýlisland | borg, hernaður, rafíþróttir | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Yfirráð á hafi og úrslitaorrusta flotans | sjó | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Salvulíkan Hughes: ráðast fyrst | sjó, loft | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Leitar- og greiningarkenning | sjó, loft, hernaður | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Aðgerðagreining: mælikvarðar á árangur | hernaður, loft, sjó, hönnun | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Stríðsleikir sem greining | hernaður, hönnun | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Hreyfihernaður | hernaður, rafíþróttir | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Samheldni og siðferðisþátturinn | hernaður | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Þungamiðja | hernaður | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Úrslitapunktar | hernaður, rafíþróttir | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Aðgerðalínur | hernaður | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Aðferðir útrýmingar og þreytu | hernaður | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Djúporrusta og djúpar aðgerðir | hernaður | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | hernaður, loft | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Verkefnastjórn (Auftragstaktik) | hernaður, rafíþróttir | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Gegnumbrot og nýting | hernaður | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Eldur og hreyfing | hernaður, rafíþróttir | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Hoppandi yfirhylming | hernaður, rafíþróttir | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Könnunartog og laumusókn | hernaður, rafíþróttir | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | Varaliðið | hernaður, rafíþróttir | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Teygjanleg vörn og gagnárás | hernaður | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | Drápskeðjan (finna, festa, rekja, miða, ráðast á, meta) | hernaður, loft, sjó | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Greiningarfjarlægð gegn bardagafjarlægð | loft, sjó, hernaður | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Virði bardagaskilvirkni | hernaður, rafíþróttir | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Dreifing á vígvelli | hernaður, rafíþróttir | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Nálægur loftstuðningur | loft, hernaður | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Loftbann (interdiction) | loft, hernaður | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Fylgd gegn orrustuflugsveit | loft | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Orkubardagi gegn snúningsbardaga | loft | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Forskot, hrein og seinkandi eftirför | loft | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Thach-sveiflan | loft | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Fingurfjórir og bardagaparið | loft | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Floti sem er til staðar | sjó | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Að fara þvert fyrir T | sjó, hernaður | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Skipalest | sjó | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Aðgangshöft og svæðisbönn | sjó, loft, hernaður | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Varnarvígi í byggð | borg, hernaður | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Músarholur og hreyfing um hús | borg, hernaður, hönnun | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Umsátur | hernaður, borg | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Skæruhernaður | hernaður, borg | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Gagnuppreisnaraðgerðir | hernaður, borg | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Skjól | hernaður, hönnun | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Blekking (maskirovka) | hernaður, rafíþróttir | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Upplýsingaforskot | hernaður, rafíþróttir | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Sparilotur og auðlindatakt | rafíþróttir, hönnun | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Hreyfifylkingar: lína, dálkur, fleygur, þrep | hernaður, rafíþróttir | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Framhliðarsókn | hernaður | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Tvöföld umlykjing (klemman) | hernaður | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Umkringing og vasinn | hernaður | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Gegnumbrot | hernaður | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Eftirför | hernaður | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Undanhald: hörfun, tafir og hopp | hernaður | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Blekkingarárás og sýndarárás | hernaður, rafíþróttir | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Skerming, gæsla og hylja: öryggi á undan meginhlutanum | hernaður | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Vörn gegn eldflaug: crank, notch, drag og pump | loft | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Fylkingar utan sjónsviðs: veggur, forystu-slóð, mylla, klemma | loft | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Hornabardagi og orkubardagi | loft | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Árásarpakki og röðun bælingar | loft | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | Orrustulínan | sjó | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | Banvæni trektin | borg, hernaður, rafíþróttir, hönnun | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Hreinsun herbergja: óvænt, hraði, stýrt ofbeldi | borg, hernaður, rafíþróttir | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Yfirráðapunktar | borg, hernaður, rafíþróttir | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Horn hreinsuð: sneiðing kökunnar | borg, hernaður, rafíþróttir | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Krossskot og samtvinnuð skotsvið | hernaður, borg, rafíþróttir, hönnun | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Forskot þess sem kíkir | rafíþróttir, hönnun | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Mannsforskot í útrýmingarlotum | rafíþróttir, hernaður | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Innkoma og opnunareinvígið | rafíþróttir, borg | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Hjálpartæki fyrir innkomu: blossi og reykur | rafíþróttir, borg, hernaður | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Félagskraftalíkan um gangandi umferð | hönnun, borg, hernaður | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Brautamyndun í gagnstæðu flæði | hönnun, borg | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Hraðara er hægara | hönnun, borg, hernaður | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Grundvallarmynd mannfjölda | hönnun, borg | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Slóðamyndun og óskalínur | hönnun, hernaður | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Skelfing er sjaldgæf: sameiginlegur styrkur | hernaður, borg, hönnun | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: aðskilnaður, röðun, samloðun | hönnun, hernaður | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Reglustærð og upphaf sameiginlegrar hreyfingar | hönnun, hernaður, loft, sjó | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Hjörð, hringsnúningur og skautað ástand | hönnun, hernaður, sjó | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Áhrifarík forysta án merkja | hernaður, rafíþróttir, hönnun | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Nágrannar taldir, ekki mældir | loft, hernaður | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Hjarðgreind | hönnun, rafíþróttir, hernaður | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Hjarðhegðun og upplýsingafossar | rafíþróttir, hönnun, hernaður | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Félagsleg lausagangur | rafíþróttir, hönnun, hernaður | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Dreifð ábyrgð | rafíþróttir, hernaður | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Samloðun frumhóps | hernaður, rafíþróttir | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Brotmörk og mannfallsþröskuldar | hernaður | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Bæling: það sem skotgnýr gerir fyrir utan að drepa | hernaður, borg | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Ótti og streita í bardagaákvörðunum | hernaður, rafíþróttir | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Kafnað undir þrýstingi | rafíþróttir | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Væntingakenning og tapfælni | rafíþróttir, hönnun | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Núlljöfnuður og áhrif annarra peninga | rafíþróttir | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Tilt (reiðikast) | rafíþróttir | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Sokinn kostnaður | rafíþróttir, hernaður | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | Heita höndin og rökvilla hennar | rafíþróttir | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Blandaðar aðferðir: að vera óútreiknanlegur | rafíþróttir, hönnun, hernaður | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Sameiginleg hugarlíkön | rafíþróttir, hernaður | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Þættir teymisvinnu | rafíþróttir, hernaður | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Sýndarheimar sem tilraunastofur hegðunar | hönnun, rafíþróttir | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Persónulegt rými og svæði | hönnun, borg | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Gagnvirknisnet: miðstöðvar og veik tengsl | rafíþróttir, hönnun | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |


### Aðferðir (37) {#methods-37}

| auðkenni | heiti | mynstur | heimildir |
|---|---|---|---|
| `method.lanchester-fit` | Aðlögun Lanchester-veldisvísa að viðureignargögnum | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Skiptahlutfall eftir hlið og stað | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Staðbundið aflahlutfall þegar hvert fall verður | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Sjónsvið: sjónlínusvæði skotsviða | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Sérorka við föll og dauðsföll (loft) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Þrautseigja heitra bletta milli leikja | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Skiptahlutfall (gagnkvæmur stuðningur) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Viðureignir og forskot fyrsta falls | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Staðbundin sjálffylgni dauðsfalla (I Moran) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Hlutföll miðuð við grunnlínu kortsins sjálfs með FDR-stýringu | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Undirbúningur greiningar vígvallar (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Pörunarmatslíkön (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Sigurlíkur og mat á aðgerðum | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Yfirráð á svæði og yfirráð á velli | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Salvujafna löguð að skipum í snertingu | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Hlutfall bardagaskilvirkni á einingarstund í átökum | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Greiningar- og bardagafjarlægðir | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Tímasetning drápskeðjunnar | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Dreifing gegn hlutdeild falla (samþjöppun afla í tíma) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Tapshlutfall og föll á flugferð | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Líkan af sigurlíkum lotu | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Virði aðgerðar: viðbætt sigurlíkindi | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Leiðrétt plús-mínus með hryggjaraðgreiningu (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Samdráttur: reynslu-Bayes | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Væntanlegar niðurstöður: frá væntanlegum mörkum til væntanlegra einvígja | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Mæling á uppsetningum, snúningum og laumum | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Speglunarvandinn: afritun eða sameiginleg orsök | herding, conformity | Manski 1993 |
| `method.streak-correction` | Syrpur með leiðréttingu fyrir endanlegar raðir | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Skautun og hringsnúningsstærðir reglu | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Forystumenn úr seinkaðri stefnufylgni | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Leiðarfossapróf fyrir hjarðhegðun | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Aðskilnaður brauta og varanleiki slóða | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Hætta eftirlegukinda | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Brotferill | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Viðbrögð við skothríð | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Áhætta eftir tap eða ávinning | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Samkomulag um kaup (kappa Fleiss) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Söguleg dæmi (277) {#historical-cases-277}

| auðkenni | dæmi | hvenær | umfang | mynstur | heimildir |
|---|---|---|---|---|---|
| `case.thermopylae` | Þermópýlur | 480 f.Kr. | orrusta | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamis | 480 f.Kr. | orrusta | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Maraþon | 490 f.Kr. | orrusta | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuktra | 371 f.Kr. | orrusta | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331 f.Kr. | orrusta | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Trasímenvatn | 217 f.Kr. | orrusta | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Kanna | 216 f.Kr. | orrusta | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Teutóborgarskógur | 9 e.Kr. | orrusta | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | orrusta | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Stirlingbrúin | 1297 | orrusta | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Agincourt | 1415 | orrusta | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen | 1757 | orrusta | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlitz | 1805 | orrusta | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | orrusta | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | orrusta | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: Marye's Heights | 1862 | viðureign | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | viðureign | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: Árás Picketts | 1863 | viðureign | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | orrusta | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | viðureign | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | herferð | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | Somme, fyrsti dagurinn | 1. júlí 1916 | orrusta | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | herferð | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jótland | 1916 | orrusta | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939-40 | orrusta | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan og Ardennafjöll | maí 1940 | herferð | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Gagnárásin við Arras | 21. maí 1940 | viðureign | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Orrustan um Bretland | júl.–okt. 1940 | herferð | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Orrustan um Atlantshaf: aðgerðagreining skipalesta | 1939-45 | herferð | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | júní 1942 | orrusta | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Annar El Alamein | okt.–nóv. 1942 | orrusta | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Kasserine-skarðið | feb. 1943 | orrusta | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Stalíngrad | ágúst 1942 – feb. 1943 | herferð | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kúrsk | júlí 1943 | herferð | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prokhorovka | 12. júlí 1943 | viðureign | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13. júní 1944 | viðureign | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Heggir Normandí | júní–júlí 1944 | herferð | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Aðgerðin Cobra | júlí 1944 | herferð | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Leytefló | okt. 1944 | orrusta | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | des. 1944 | orrusta | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Tsushima | maí 1905 | orrusta | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Inchon | sept. 1950 | herferð | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | MiG Alley | 1950-53 | herferð | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | orrusta | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | nóv. 1965 | viðureign | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operation Bolo | 2. jan. 1967 | viðureign | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Gólan: Tárdalurinn (the Valley of Tears) | okt. 1973 | orrusta | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Sínaí: Kínabýlið (the Chinese Farm) | okt. 1973 | orrusta | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Bekaa-dalurinn (Operation Mole Cricket 19) | júní 1982 | orrusta | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Loftstríðið við Falklandseyjar | maí–júní 1982 | herferð | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Loftherferð Desert Storm | jan.–feb. 1991 | herferð | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26. feb. 1991 | viðureign | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadishu | okt. 1993 | viðureign | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Grozní | des. 1994 – feb. 1995 | orrusta | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hue | jan.–mars 1968 | orrusta | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Loftherferðin í Kosovo | mars–júní 1999 | herferð | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Fallúja (Operation Al Fajr) | nóv. 2004 | orrusta | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mosúl | 2016-17 | herferð | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Kadesh | u.þ.b. 1274 f.Kr. | orrusta | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Issos | 333 f.Kr. | orrusta | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 f.Kr. | orrusta | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Karrhae | 53 f.Kr. | orrusta | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Farsalos | 48 f.Kr. | orrusta | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianópel | 378 e.Kr. | orrusta | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Yarmouk | 636 e.Kr. | orrusta | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manzikert | 1071 | orrusta | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hattín | 1187 | orrusta | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburn | 1314 | orrusta | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Crécy | 1346 | orrusta | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Poitiers | 1356 | orrusta | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunwald (Tannenberg) | 1410 | orrusta | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeld | 1631 | orrusta | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blenheim | 1704 | orrusta | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Poltava | 1709 | orrusta | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rossbach | 1757 | orrusta | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | herferð | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | orrusta | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena-Auerstedt | 1806 | orrusta | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodínó | 1812 | orrusta | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Leipzig | 1813 | orrusta | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | orrusta | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | orrusta | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | herferð | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadowa) | 1866 | orrusta | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | orrusta | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | orrusta | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdúrman | 1898 | orrusta | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | viðureign | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Gallipoli | 1915 | herferð | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | nóv. 1917 | orrusta | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Caporetto | okt.–nóv. 1917 | herferð | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Þýska vorsóknin (Operation Michael) | mars–apríl 1918 | herferð | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | ágúst 1918 | orrusta | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Khalkhin Gol (Nomonhan) | ágúst 1939 | orrusta | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | Pólska herferðin | sept. 1939 | herferð | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut og Gembloux | maí 1940 | orrusta | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | maí 1940 | viðureign | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Dunkirk-varnarhringurinn | maí–júní 1940 | herferð | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operation Compass og Beda Fomm | des. 1940 – feb. 1941 | herferð | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Operation Crusader og Sidi Rezegh | nóv.–des. 1941 | herferð | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | maí–júní 1942 | orrusta | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alam Halfa | ágúst–sept. 1942 | orrusta | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno-Brody | júní 1941 | orrusta | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Umkringing Kíev | sept. 1941 | herferð | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moskva | okt. 1941 – jan. 1942 | herferð | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Rzhev og Operation Mars | 1942 | herferð | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Annað Kharkov | maí 1942 | orrusta | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Þriðja Kharkov (högg Mansteins) | feb.–mars 1943 | herferð | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operation Bagration | júní–ágúst 1944 | herferð | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Korsún-Sévtsénkovskíj-vasinn | jan.–feb. 1944 | orrusta | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Kamenets-Podolskíj-vasinn | mars–apríl 1944 | herferð | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operation Epsom | júní 1944 | orrusta | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operation Goodwood | júlí 1944 | orrusta | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operation Totalize | ágúst 1944 | orrusta | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | ágúst 1944 | orrusta | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Falaise-vasinn | ágúst 1944 | herferð | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden og Arnhem | sept. 1944 | herferð | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Aachen | okt. 1944 | orrusta | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Hürtgen-skógur | sept. 1944 – feb. 1945 | herferð | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | sept. 1944 | orrusta | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | St. Vith | des. 1944 | orrusta | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Elsenborn-hryggurinn | des. 1944 | orrusta | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Seelow-hæðir | apríl 1945 | orrusta | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlín | apríl–maí 1945 | orrusta | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operation Spring Awakening | mars 1945 | orrusta | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | des. 1943 | orrusta | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Varsjáruppreisnin | ágúst–okt. 1944 | herferð | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | nóv. 1943 | orrusta | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | sept.–nóv. 1944 | orrusta | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | feb.–mars 1945 | orrusta | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinawa | apríl–júní 1945 | herferð | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manila | feb.–mars 1945 | orrusta | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Mansjúría (Ágúststormurinn) | ágúst 1945 | herferð | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Pusan-varnarhringurinn | ágúst–sept. 1950 | herferð | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Chosin-lónið | nóv.–des. 1950 | herferð | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Imjin-á | apríl 1951 | orrusta | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapyong | apríl 1951 | orrusta | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | apríl og júlí 1953 | viðureign | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | jan.–apríl 1968 | orrusta | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | nóv. 1967 | orrusta | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (Ap Bia-fjall) | maí 1969 | viðureign | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila–Um Katef | júní 1967 | orrusta | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailia | okt. 1973 | orrusta | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | júní 1982 | viðureign | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Umsátrið um Beirút | júní–ágúst 1982 | herferð | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Líbanon 2006: Bint Jbeil og skriðdrekaógnin | júlí–ágúst 2006 | herferð | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Faw | feb. 1986 | orrusta | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basra (Karbala-5) | jan.–feb. 1987 | orrusta | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Khafji | jan.–feb. 1991 | orrusta | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Objective Norfolk | 26.–27. feb. 1991 | orrusta | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medina-hryggurinn | 27. feb. 1991 | orrusta | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Wadi al-Batin-blekkingarnar | feb. 1991 | herferð | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nasiríyah | mars 2003 | orrusta | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Objective Peach | apríl 2003 | viðureign | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Þrumuhlaupin (The Thunder Runs) | apríl 2003 | orrusta | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Debecka-skarðið | apríl 2003 | viðureign | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramadi | 2006-07 | herferð | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadr-borgarhverfið | mars–maí 2008 | orrusta | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Operation Anaconda | mars 2002 | orrusta | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | júlí 2008 | viðureign | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | okt. 2009 | viðureign | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala og varðstöðvahúsin | 2006-07 | herferð | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Orrustan um Algeirsborg | 1956-57 | herferð | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Rhódesíska Fireforce | 1974-79 | herferð | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Umsátrið um Sarajevó | 1992-96 | herferð | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Grozní 1999-2000 | des. 1999 – feb. 2000 | orrusta | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Rússo-georgíska stríðið | ágúst 2008 | herferð | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillia | júlí 2014 | viðureign | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovaisk | ágúst 2014 | orrusta | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debaltsevo | jan.–feb. 2015 | orrusta | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Donetsk-flugvöllurinn | sept. 2014 – jan. 2015 | orrusta | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Hostomel-flugvöllurinn | feb. 2022 | viðureign | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | Kíev-ásinn og fyrirsátin við Brovary | mars 2022 | viðureign | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Mariupol og Azovstal | feb.–maí 2022 | orrusta | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Gagnsókn við Kharkiv | sept. 2022 | herferð | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Yfirferðin yfir Síversku-Donets við Bilohorivka | maí 2022 | viðureign | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bakhmut | ágúst 2022 – maí 2023 | orrusta | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Sóknin við Zaporizhzhia | júní–nóv. 2023 | herferð | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Stríðið í Nagorno-Karabakh | sept.–nóv. 2020 | herferð | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Blitz | sept. 1940 – maí 1941 | herferð | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: fyrsti dagurinn í loftinu | 22. júní 1941 | orrusta | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Krít | maí 1941 | orrusta | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Umsátrið um Möltu | 1940-1942 | herferð | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Loftbrúin til Stalíngrad | nóv. 1942 – feb. 1943 | herferð | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Loftorrustur yfir Kúban | apríl–júní 1943 | herferð | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kúrsk í loftinu | júlí 1943 | orrusta | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operation Bagration í loftinu | júní–ágúst 1944 | herferð | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploiești (Operation Tidal Wave) | 1. ágúst 1943 | viðureign | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Stíflurárásin (Operation Chastise) | 16.–17. maí 1943 | viðureign | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hamborg (Operation Gomorrah) | júlí–ágúst 1943 | orrusta | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt–Regensburg | 17. ágúst 1943 | orrusta | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Annað Schweinfurt („Svarti fimmtudagurinn") | 14. okt. 1943 | viðureign | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Big Week (Operation Argument) | feb. 1944 | herferð | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Nürnbergárásin | 30.–31. mars 1944 | viðureign | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operation Bodenplatte | 1. jan. 1945 | orrusta | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Orrustan í Bismarckhafi | mars 1943 | orrusta | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Að þagga niður í Rabaul | 1943-1944 | herferð | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Filippseyjahaf („Marianas Turkey Shoot") | júní 1944 | orrusta | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Svarti þriðjudagurinn yfir Namsi | 23. okt. 1951 | viðureign | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operation Rolling Thunder | 1965-1968 | herferð | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Thanh Hoa-brúin | 1965-1972 | viðureign | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | Wild Weasels | 1965-1973 | herferð | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Ault-skýrslan og Top Gun | 1968-1972 | herferð | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operation Linebacker | maí–okt. 1972 | herferð | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II („Ellefu daga stríðið") | des. 1972 | herferð | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operation Focus (Moked) | 5. júní 1967 | orrusta | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Slitastríðið: eldflaugabeltið | 1969-1970 | herferð | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | SAM-regnhlífin yfir skurðinum | okt. 1973 | orrusta | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (Operation Opera) | 7. júní 1981 | viðureign | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operation El Dorado Canyon | 15. apríl 1986 | viðureign | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Loftstríð Írans og Íraks | 1980-1988 | herferð | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Black Buck-árásirnar | maí–júní 1982 | viðureign | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: skipulagning loftherferðarinnar við Persaflóa | ágúst 1990 – jan. 1991 | herferð | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: fyrsta Apache-árásin | 17. jan. 1991 | viðureign | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | Hin mikla Scud-veiði | jan.–feb. 1991 | herferð | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Mutla-hryggurinn („Dauðahraðbrautin") | 26.–27. feb. 1991 | viðureign | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operation Anaconda: Apache-þyrlur í Shahi-Kot | mars 2002 | orrusta | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | Árás Apache-þyrlna við Karbala | 24. mars 2003 | viðureign | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | Loftherferðin í Líbíu | mars–okt. 2011 | herferð | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Nagorno-Karabakh: drónar og loftvarnir | sept.–nóv. 2020 | herferð | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Úkraína: lofthelgin í deilu | 2022 | herferð | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Hostomel-flugvöllurinn | feb. 2022 | viðureign | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | feb.–mars 1971 | herferð | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operation Eagle Claw | apríl 1980 | viðureign | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afganistan: Stinger | 1986-1989 | herferð | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | orrusta | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | Spánska armadan | 1588 | herferð | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Quiberon-flói | 1759 | orrusta | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | Chesapeake (Virginia Capes) | 1781 | orrusta | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Nílarorrustan (Aboukir-flói) | 1798 | orrusta | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Kaupmannahöfn | 1801 | orrusta | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | mars 1862 | viðureign | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lissa | 1866 | orrusta | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Yalu | 1894 | orrusta | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Manilaflói | 1898 | orrusta | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Helgolandsflói | ágúst 1914 | orrusta | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel og Falklandseyjar | nóv.–des. 1914 | herferð | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Dogger Bank | jan. 1915 | orrusta | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | River Plate | des. 1939 | orrusta | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Taranto | nóv. 1940 | viðureign | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Cape Matapan | mars 1941 | orrusta | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Danmerkursund og hvernig Bismarck sökk | maí 1941 | herferð | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7. des. 1941 | viðureign | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales og Repulse | 10. des. 1941 | viðureign | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Java-hafið | feb. 1942 | orrusta | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Kóralhafið | maí 1942 | orrusta | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Savo-eyja | ágúst 1942 | orrusta | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Austur-Salómonseyjar | ágúst 1942 | orrusta | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Cape Esperance | okt. 1942 | orrusta | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Santa Cruz-eyjar | okt. 1942 | orrusta | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Sjóorrustan við Guadalcanal | 12.–15. nóv. 1942 | orrusta | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | nóv. 1942 | viðureign | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | Channel Dash | feb. 1942 | viðureign | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operation Pedestal | ágúst 1942 | orrusta | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Svartur maí | maí 1943 | herferð | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | North Cape | des. 1943 | orrusta | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | Kafbátaherferð Bandaríkjanna gegn Japan | 1941-1945 | herferð | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Undan Samar | 25. okt. 1944 | orrusta | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Surigao-sund | 25. okt. 1944 | orrusta | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinawa: kamikaze-herferðin | apríl–júní 1945 | herferð | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Sökkun Eilat | okt. 1967 | viðureign | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakia | okt. 1973 | orrusta | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | Sökkun General Belgrano | 2. maí 1982 | viðureign | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | Tap HMS Sheffield | 4. maí 1982 | viðureign | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17. maí 1987 | viðureign | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operation Praying Mantis | 18. apríl 1988 | orrusta | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | ágúst 2004 | viðureign | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Bisu-byltingin | mars 2007 | orrusta | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | Draumaspólan á The International 2013 | ágúst 2013 | viðureign | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Faker's Zed gegn Ryu | sept. 2013 | viðureign | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Overpass-hröðunin | nóv. 2014 | viðureign | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | Hoppandi AWP á Mirage | apríl 2016 | viðureign | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis og útbúnaðartímabilið | 2018 | herferð | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five gegn OG | apríl 2019 | orrusta | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar nær stórmeistarastigi | 2019 | herferð | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Vinstri krókurinn (landsókn Operation Desert Storm) | 24.–28. febrúar 1991 | herferð | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | Atvikið Corrupted Blood | september 2005 | herferð | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Leikja- og borðahönnun (17) {#game-and-level-design-17}

| auðkenni | heiti | mynstur | heimildir |
|---|---|---|---|
| `design.chokepoint` | Þrengsli í borðahönnun | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Hliðarleiðir og valkostaleiðir | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Sjónlínur og bardagafjarlægð | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Staðsetning skjóls og taktur | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Hönnun upprunastaða og vörn upprunastaða | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Jafnvægi í samhverfum og ósamhverfum kortum | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Jafnvægi flokka og mótvægi | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Flæði, lykkjur og læsilegt skipulag | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Auðlindakerfi leikja og endurgjöfarlykkjur | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Pörun og dreifing færni | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | Gervigreindarandstæðingar sem borðarannsóknir | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Þýðingarríkur leikur og val | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Skipti og liðsleikur í skotleikjum | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Yfirráð yfir korti | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Hitakort og rúmfræðileg fjarmæling í hönnun | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Tökin, námið og gamanið | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Umferðahagkerfi og kaupákvarðanir | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Rannsóknir (113) {#studies-113}

| auðkenni | heiti | heimildir |
|---|---|---|
| `study.engel-1954` | Engel: Lanchester-lögmál ferningsins við Iwo Jima | Engel 1954 |
| `study.bracken-1995` | Bracken: Lanchester-líkön af Ardennunum | Bracken 1995 |
| `study.fricker-1998` | Fricker: þreytulíkön af Ardennunum endurskoðuð | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas og Turkes: Kúrsk og Ardennurnar | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley og Helmbold: staðfesting á ferningslögmálinu | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | GIS-greining á dauðsföllum leikmanna | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: myndgerð samkeppnishegðunar | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Verðmæti aðgerða í Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Uppgötvun viðureigna í rafíþróttum | Schubert et al. 2016 |
| `study.red-baron` | Project Red Baron: loftbardagi yfir Víetnam | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: megindlegt mat á sögulegum orrustum | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: beiting herafla skýrir niðurstöður | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Yfirlit yfir sjónræna framsetningu leikjagagna | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Lanchester gegn þremur öldum landorrustna | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: sextíu viðureignir síðari heimsstyrjaldar | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: bardagalíkön og bandaríska borgarastríðið | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: tölfræðilíkan af þreytugögnum | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: framsóknarhraði í landhernaði | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas og Dinges: aðstæður skipta meira máli en lögmálið | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | Kursk-gagnagrunnurinn | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | Gagnagrunnur Ardennaherferðarinnar | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson og MacKay: orrustan um Bretland sem Lanchester-gögn | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte og Schmidt: fjöldinn vinnur enn orrustur | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: reglufesta mannfalls í orrustum | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Taktíska tölulega ákvarðanalíkan Dupuy | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: stríð í tölum | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: bardagaafl | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter og Stam: lýðræðisríki í stríði | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: aðlögunarvirka líkanið | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester og skæruhernaður | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: slembilíkan salvu | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: hornsteinar flotataktíkur | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | Umræðan um 3:1-regluna | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: líkanagerð vopnaðra átaka | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Ault-skýrslan: eldflaugar skotnar utan umslags síns | Ault 1969; Michel 1997 |
| `study.gwaps` | Gulf War Air Power Survey | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Hringrás Blacketts | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Stillingar djúpsprengja hjá Coastal Command | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Hvítir undirkantar á kafbátaleitarflugvélum | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: brynja þar sem sprengjuflugvélarnar sem komu til baka voru ekki hittar | Mangel & Samaniego 1984 |
| `study.optimal-search` | Bestu leit: frá kafbátum til AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: bardagi í helvíti | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Aðgangshöft og svæðisbönn | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Hvernig leikmenn missa áhugann | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Hópun í hegðun leikmanna í náttúrunni | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Greining á gremju leikmanna | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: fjarmælaborð í framleiðslu | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: sjónræn greining leikja | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Hreyfing persóna á vígvöllum World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: mæling á notendaprófum í stórum stíl | Kim et al. 2008 |
| `study.game-data-science` | Gagnafræði leikja | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Gervigreind og leikir | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Færni og hreyfing liða í Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Bardagamynstur sem spá fyrir um sigra í MOBA-leikjum | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Hlutverk leikmanna í Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Spá um úrslit Dota 2 út frá valinu | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Lifandi sigurspá í atvinnumennsku rafíþrótta | Hodge et al. 2021 |
| `study.rioult-2014` | Topólógía staðsetningar leikmanna | Rioult et al. 2014 |
| `study.bednarek-2017` | Mat á leikmönnum í liðsskotleikjum | Bednárek et al. 2017 |
| `study.katona-2019` | Spá um hver deyr næst | Katona et al. 2019 |
| `study.block-2018` | Gagnadrifnar sögur fyrir áhorfendur rafíþrótta | Block et al. 2018 |
| `study.ggviz` | ggViz: leit að leikjaástandi í stórum stíl | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: stórfelld styrkingarnám í Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: stórmeistarastig í StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Væntanlegt virði vörslu í körfubolta | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: virði aðgerða með boltann í fótbolta | Decroos et al. 2019 |
| `study.pitch-control` | Stjórn á velli og sköpun svæðis | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | Rúmfræðileg uppbygging varnarhæfni | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Liðshlutverk úr rakningargögnum | Lucey et al. 2013 |
| `study.shot-quality` | Væntanleg mörk og gæði skota | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: rúmfræðileg skotnýting | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Rúmtímagreining á liðsíþróttum | Gudmundsson & Horton 2017 |
| `study.ripley-k` | K-fall Ripley: þyrping á öllum kvörðum | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark og Evans: dreifing næsta nágranna | Clark & Evans 1954 |
| `study.getis-ord` | Heitir reitir Getis-Ord | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Staðbundnir vísar um rúmfræðileg tengsl | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | Rúmfræðileg skanntölfræði | Kulldorff 1997 |
| `study.kde` | Kjarnaþéttleikamat | Silverman 1986 |
| `study.knox-1964` | Samspil rúms og tíma | Knox 1964; Diggle 2013 |
| `study.maup` | Vandamál breytanlegra svæðiseininga (MAUP) | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Ísóvistar og sýnileikarit | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Rýmisfræði (space syntax) | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Meðalþrengsli | Lloyd 1967 |
| `study.survival-analysis` | Lifunargreining á tíma þar til dauði verður | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Alhæfð línuleg líkön fyrir talningar | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap og bil á mati | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey o.fl.: seinkun og forskot þess sem kíkir | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee og Chang: skot um horn | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: seinkun og aðgerðir leikmanna | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos o.fl.: atvinnumenn og áhugamenn metin út frá sigurlíkum | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos o.fl.: efnahagsákvarðanir í Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: snjöll fell og verðlaus dauðsföll | Maymin 2021 |
| `study.moba-live-prediction` | Lifandi spá um úrslit í MOBA-leikjum | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa o.fl.: lotur í Valorant út frá taktískum eiginleikum | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv o.fl.: hlutverk í atvinnumennsku Counter-Strike 2 | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim o.fl.: þjálfun í návígisbardögum | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Órói mannfjölda á Hajj 2006 | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Göngu hópar móta mannfjölda | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Stigskipt hópkvik í dúfnahjörðum | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Félagsleg áhrif gera árangur ójafnan og óútreiknanlegan | Salganik et al. 2006 |
| `study.wisdom-undermined` | Félagsleg áhrif grafa undan visku fjöldans | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | Aðdráttarafl fjöldans | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Samræmi við einróma meirihluta | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: bardagahvöt í Írak | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Samloðun og árangur: yfirlitsgreiningar | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Tapfælni meðal atvinnugolfara | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Heita höndin í hafnabolta | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Vítaspyrnur: atvinnumenn leika minimax | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Minimax-leikur á Wimbledon | Walker & Wooders 2001 |
| `study.collective-intelligence` | Hópgreind liða | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Félagsnet í netheimi | Szell et al. 2010 |
| `study.team-networks` | Sendinet og frammistaða liða | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Hegðun breiðist út um þyrpt net | Centola 2010 |

### Heimildaskrá {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(yfirfarið 2026-11-15: smáatriði)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(yfirfarið 2026-11-15: smáatriði)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(yfirfarið 2026-11-15: smáatriði)*
- Ammianus Marcellinus (trans. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(yfirfarið 2026-11-15: smáatriði)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(yfirfarið 2026-11-15: smáatriði)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(yfirfarið 2026-11-15: smáatriði)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(yfirfarið 2026-11-15: smáatriði)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(yfirfarið 2026-11-15: smáatriði)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(yfirfarið 2026-11-15: smáatriði)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(yfirfarið 2026-11-15: smáatriði)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(yfirfarið 2026-11-15: smáatriði)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(yfirfarið 2026-11-15: smáatriði)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(yfirfarið 2026-11-15: smáatriði)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(yfirfarið 2026-11-15: smáatriði)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(yfirfarið 2026-11-15: smáatriði)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(yfirfarið 2026-11-15: smáatriði)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(yfirfarið 2026-11-15: smáatriði)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(yfirfarið 2026-11-15: smáatriði)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(yfirfarið 2026-11-15: smáatriði)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(yfirfarið 2026-11-15: smáatriði)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(yfirfarið 2026-11-15: smáatriði)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(yfirfarið 2026-11-15: smáatriði)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(yfirfarið 2026-11-15: smáatriði)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(yfirfarið 2026-11-15: smáatriði)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(yfirfarið 2026-11-15: smáatriði)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(yfirfarið 2026-11-15: tilvist)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(yfirfarið 2026-11-15: smáatriði)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(yfirfarið 2026-11-15: smáatriði)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(yfirfarið 2026-11-15: smáatriði)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(yfirfarið 2026-11-15: smáatriði)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(yfirfarið 2026-11-15: smáatriði)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(yfirfarið 2026-11-15: smáatriði)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(yfirfarið 2026-11-15: tilvist)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(yfirfarið 2026-11-15: smáatriði)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(yfirfarið 2026-11-15: smáatriði)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(yfirfarið 2026-11-15: smáatriði)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(yfirfarið 2026-11-15: smáatriði)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(yfirfarið 2026-11-15: smáatriði)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(yfirfarið 2026-11-15: tilvist)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(yfirfarið 2026-11-15: smáatriði)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(yfirfarið 2026-11-15: smáatriði)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(yfirfarið 2026-11-15: smáatriði)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(yfirfarið 2026-11-15: tilvist)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(yfirfarið 2026-11-15: smáatriði)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(yfirfarið 2026-11-15: smáatriði)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(yfirfarið 2026-11-15: smáatriði)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(yfirfarið 2026-11-15: smáatriði)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(yfirfarið 2026-11-15: tilvist)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(yfirfarið 2026-11-15: smáatriði)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(yfirfarið 2026-11-15: smáatriði)*
- Caesar, G. J. (trans. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(yfirfarið 2026-11-15: smáatriði)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(yfirfarið 2026-11-15: smáatriði)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(yfirfarið 2026-11-15: smáatriði)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(yfirfarið 2026-11-15: smáatriði)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(yfirfarið 2026-11-15: smáatriði)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(yfirfarið 2026-11-15: smáatriði)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(yfirfarið 2026-11-15: smáatriði)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(yfirfarið 2026-11-15: smáatriði)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(yfirfarið 2026-11-15: smáatriði)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(yfirfarið 2026-11-15: smáatriði)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(yfirfarið 2026-11-15: smáatriði)*
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(yfirfarið 2026-11-15: smáatriði)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(yfirfarið 2026-11-15: smáatriði)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(yfirfarið 2026-11-15: smáatriði)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(yfirfarið 2026-11-15: smáatriði)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(yfirfarið 2026-11-15: smáatriði)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(yfirfarið 2026-11-15: tilvist)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(yfirfarið 2026-11-15: smáatriði)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(yfirfarið 2026-11-15: smáatriði)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(yfirfarið 2026-11-15: smáatriði)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(yfirfarið 2026-11-15: tilvist)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(yfirfarið 2026-11-15: tilvist)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(yfirfarið 2026-11-15: smáatriði)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(yfirfarið 2026-11-15: smáatriði)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(yfirfarið 2026-11-15: tilvist)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(yfirfarið 2026-11-15: smáatriði)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(yfirfarið 2026-11-15: smáatriði)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(yfirfarið 2026-11-15: smáatriði)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(yfirfarið 2026-11-15: smáatriði)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(yfirfarið 2026-11-15: smáatriði)*
- Delbrück, H. (trans. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(yfirfarið 2026-11-15: tilvist)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(yfirfarið 2026-11-15: smáatriði)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(yfirfarið 2026-11-15: smáatriði)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(yfirfarið 2026-11-15: smáatriði)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(yfirfarið 2026-11-15: smáatriði)*
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(yfirfarið 2026-11-15: smáatriði)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(yfirfarið 2026-11-15: smáatriði)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(yfirfarið 2026-11-15: smáatriði)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(yfirfarið 2026-11-15: smáatriði)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(yfirfarið 2026-11-15: tilvist)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(yfirfarið 2026-11-15: smáatriði)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(yfirfarið 2026-11-15: smáatriði)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(yfirfarið 2026-11-15: smáatriði)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(yfirfarið 2026-11-15: smáatriði)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(yfirfarið 2026-11-15: smáatriði)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(yfirfarið 2026-11-15: smáatriði)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(yfirfarið 2026-11-15: smáatriði)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(yfirfarið 2026-11-15: tilvist)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(yfirfarið 2026-11-15: smáatriði)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(yfirfarið 2026-11-15: smáatriði)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(yfirfarið 2026-11-15: smáatriði)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(yfirfarið 2026-11-15: smáatriði)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(yfirfarið 2026-11-15: smáatriði)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(yfirfarið 2026-11-15: smáatriði)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(yfirfarið 2026-11-15: smáatriði)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(yfirfarið 2026-11-15: smáatriði)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(yfirfarið 2026-11-15: smáatriði)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(yfirfarið 2026-11-15: smáatriði)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(yfirfarið 2026-11-15: smáatriði)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(yfirfarið 2026-11-15: smáatriði)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(yfirfarið 2026-11-15: smáatriði)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(yfirfarið 2026-11-15: smáatriði)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(yfirfarið 2026-11-15: smáatriði)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(yfirfarið 2026-11-15: smáatriði)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(yfirfarið 2026-11-15: smáatriði)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(yfirfarið 2026-11-15: smáatriði)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(yfirfarið 2026-11-15: tilvist)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(yfirfarið 2026-11-15: smáatriði)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(yfirfarið 2026-11-15: smáatriði)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(yfirfarið 2026-11-15: smáatriði)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(yfirfarið 2026-11-15: smáatriði)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(yfirfarið 2026-11-15: smáatriði)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(yfirfarið 2026-11-15: smáatriði)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(yfirfarið 2026-11-15: smáatriði)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(yfirfarið 2026-11-15: smáatriði)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(yfirfarið 2026-11-15: smáatriði)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(yfirfarið 2026-11-15: smáatriði)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(yfirfarið 2026-11-15: smáatriði)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(yfirfarið 2026-11-15: smáatriði)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(yfirfarið 2026-11-15: smáatriði)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(yfirfarið 2026-11-15: smáatriði)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(yfirfarið 2026-11-15: smáatriði)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(yfirfarið 2026-11-15: smáatriði)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(yfirfarið 2026-11-15: smáatriði)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(yfirfarið 2026-11-15: smáatriði)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(yfirfarið 2026-11-15: smáatriði)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(yfirfarið 2026-11-15: smáatriði)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(yfirfarið 2026-11-15: smáatriði)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(yfirfarið 2026-11-15: smáatriði)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(yfirfarið 2026-11-15: smáatriði)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(yfirfarið 2026-11-15: smáatriði)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(yfirfarið 2026-11-15: smáatriði)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(yfirfarið 2026-11-15: smáatriði)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(yfirfarið 2026-11-15: smáatriði)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(yfirfarið 2026-11-15: smáatriði)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(yfirfarið 2026-11-15: smáatriði)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(yfirfarið 2026-11-15: smáatriði)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(yfirfarið 2026-11-15: smáatriði)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(yfirfarið 2026-11-15: smáatriði)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(yfirfarið 2026-11-15: smáatriði)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(yfirfarið 2026-11-15: smáatriði)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(yfirfarið 2026-11-15: smáatriði)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(yfirfarið 2026-11-15: smáatriði)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(yfirfarið 2026-11-15: smáatriði)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(yfirfarið 2026-11-15: smáatriði)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(yfirfarið 2026-11-15: smáatriði)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(yfirfarið 2026-11-15: smáatriði)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(yfirfarið 2026-11-15: smáatriði)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(yfirfarið 2026-11-15: smáatriði)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(yfirfarið 2026-11-15: smáatriði)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(yfirfarið 2026-11-15: smáatriði)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(yfirfarið 2026-11-15: smáatriði)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(yfirfarið 2026-11-15: smáatriði)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(yfirfarið 2026-11-15: smáatriði)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(yfirfarið 2026-11-15: smáatriði)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(yfirfarið 2026-11-15: smáatriði)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(yfirfarið 2026-11-15: smáatriði)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(yfirfarið 2026-11-15: smáatriði)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(yfirfarið 2026-11-15: smáatriði)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(yfirfarið 2026-11-15: smáatriði)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(yfirfarið 2026-11-15: tilvist)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(yfirfarið 2026-11-15: smáatriði)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(yfirfarið 2026-11-15: smáatriði)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(yfirfarið 2026-11-15: smáatriði)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(yfirfarið 2026-11-15: smáatriði)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(yfirfarið 2026-11-15: smáatriði)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(yfirfarið 2026-11-15: smáatriði)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(yfirfarið 2026-11-15: smáatriði)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(yfirfarið 2026-11-15: smáatriði)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(yfirfarið 2026-11-15: smáatriði)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(yfirfarið 2026-11-15: smáatriði)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(yfirfarið 2026-11-15: smáatriði)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(yfirfarið 2026-11-15: smáatriði)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(yfirfarið 2026-11-15: smáatriði)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(yfirfarið 2026-11-15: smáatriði)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(yfirfarið 2026-11-15: smáatriði)*
- Isserson, G. S. (trans. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(yfirfarið 2026-11-15: smáatriði)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(yfirfarið 2026-11-15: smáatriði)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(yfirfarið 2026-11-15: smáatriði)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(yfirfarið 2026-11-15: smáatriði)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(yfirfarið 2026-11-15: smáatriði)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(yfirfarið 2026-11-15: smáatriði)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(yfirfarið 2026-11-15: smáatriði)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(yfirfarið 2026-11-15: tilvist)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(yfirfarið 2026-11-15: smáatriði)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(yfirfarið 2026-11-15: smáatriði)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(yfirfarið 2026-11-15: smáatriði)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(yfirfarið 2026-11-15: smáatriði)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(yfirfarið 2026-11-15: smáatriði)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(yfirfarið 2026-11-15: smáatriði)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(yfirfarið 2026-11-15: smáatriði)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(yfirfarið 2026-11-15: smáatriði)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(yfirfarið 2026-11-15: smáatriði)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(yfirfarið 2026-11-15: smáatriði)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(yfirfarið 2026-11-15: smáatriði)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(yfirfarið 2026-11-15: smáatriði)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(yfirfarið 2026-11-15: tilvist)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(yfirfarið 2026-11-15: smáatriði)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(yfirfarið 2026-11-15: smáatriði)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(yfirfarið 2026-11-15: smáatriði)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(yfirfarið 2026-11-15: smáatriði)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(yfirfarið 2026-11-15: smáatriði)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(yfirfarið 2026-11-15: smáatriði)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(yfirfarið 2026-11-15: smáatriði)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(yfirfarið 2026-11-15: smáatriði)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(yfirfarið 2026-11-15: smáatriði)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(yfirfarið 2026-11-15: smáatriði)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(yfirfarið 2026-11-15: tilvist)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(yfirfarið 2026-11-15: smáatriði)*
- Livy (trans. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(yfirfarið 2026-11-15: smáatriði)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(yfirfarið 2026-11-15: smáatriði)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(yfirfarið 2026-11-15: smáatriði)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(yfirfarið 2026-11-15: smáatriði)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(yfirfarið 2026-11-15: tilvist)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(yfirfarið 2026-11-15: smáatriði)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(yfirfarið 2026-11-15: smáatriði)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(yfirfarið 2026-11-15: smáatriði)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(yfirfarið 2026-11-15: smáatriði)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(yfirfarið 2026-11-15: smáatriði)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(yfirfarið 2026-11-15: smáatriði)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(yfirfarið 2026-11-15: smáatriði)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(yfirfarið 2026-11-15: tilvist)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(yfirfarið 2026-11-15: smáatriði)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(yfirfarið 2026-11-15: smáatriði)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(yfirfarið 2026-11-15: smáatriði)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(yfirfarið 2026-11-15: smáatriði)*
- Mao Tse-tung (trans. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(yfirfarið 2026-11-15: tilvist)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(yfirfarið 2026-11-15: smáatriði)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(yfirfarið 2026-11-15: smáatriði)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(yfirfarið 2026-11-15: smáatriði)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(yfirfarið 2026-11-15: smáatriði)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(yfirfarið 2026-11-15: smáatriði)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(yfirfarið 2026-11-15: smáatriði)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(yfirfarið 2026-11-15: smáatriði)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(yfirfarið 2026-11-15: tilvist)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(yfirfarið 2026-11-15: smáatriði)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(yfirfarið 2026-11-15: smáatriði)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(yfirfarið 2026-11-15: smáatriði)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(yfirfarið 2026-11-15: smáatriði)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(yfirfarið 2026-11-15: smáatriði)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(yfirfarið 2026-11-15: smáatriði)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(yfirfarið 2026-11-15: smáatriði)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(yfirfarið 2026-11-15: smáatriði)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(yfirfarið 2026-11-15: smáatriði)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(yfirfarið 2026-11-15: smáatriði)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(yfirfarið 2026-11-15: tilvist)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(yfirfarið 2026-11-15: tilvist)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(yfirfarið 2026-11-15: smáatriði)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(yfirfarið 2026-11-15: smáatriði)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(yfirfarið 2026-11-15: smáatriði)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(yfirfarið 2026-11-15: smáatriði)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(yfirfarið 2026-11-15: tilvist)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(yfirfarið 2026-11-15: tilvist)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(yfirfarið 2026-11-15: smáatriði)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(yfirfarið 2026-11-15: smáatriði)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(yfirfarið 2026-11-15: tilvist)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(yfirfarið 2026-11-15: smáatriði)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(yfirfarið 2026-11-15: smáatriði)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(yfirfarið 2026-11-15: smáatriði)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(yfirfarið 2026-11-15: smáatriði)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(yfirfarið 2026-11-15: smáatriði)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(yfirfarið 2026-11-15: smáatriði)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(yfirfarið 2026-11-15: smáatriði)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(yfirfarið 2026-11-15: smáatriði)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(yfirfarið 2026-11-15: smáatriði)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(yfirfarið 2026-11-15: smáatriði)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(yfirfarið 2026-11-15: smáatriði)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(yfirfarið 2026-11-15: smáatriði)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(yfirfarið 2026-11-15: smáatriði)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(yfirfarið 2026-11-15: tilvist)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(yfirfarið 2026-11-15: smáatriði)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(yfirfarið 2026-11-15: smáatriði)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(yfirfarið 2026-11-15: smáatriði)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(yfirfarið 2026-11-15: smáatriði)*
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(yfirfarið 2026-11-15: smáatriði)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(yfirfarið 2026-11-15: smáatriði)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(yfirfarið 2026-11-15: smáatriði)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(yfirfarið 2026-11-15: smáatriði)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(yfirfarið 2026-11-15: smáatriði)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(yfirfarið 2026-11-15: smáatriði)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(yfirfarið 2026-11-15: smáatriði)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(yfirfarið 2026-11-15: smáatriði)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(yfirfarið 2026-11-15: smáatriði)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(yfirfarið 2026-11-15: smáatriði)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(yfirfarið 2026-11-15: smáatriði)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(yfirfarið 2026-11-15: smáatriði)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(yfirfarið 2026-11-15: smáatriði)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(yfirfarið 2026-11-15: smáatriði)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(yfirfarið 2026-11-15: smáatriði)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(yfirfarið 2026-11-15: smáatriði)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(yfirfarið 2026-11-15: smáatriði)*
- Plutarch (trans. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(yfirfarið 2026-11-15: smáatriði)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(yfirfarið 2026-11-15: smáatriði)*
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(yfirfarið 2026-11-15: smáatriði)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(yfirfarið 2026-11-15: smáatriði)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(yfirfarið 2026-11-15: smáatriði)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(yfirfarið 2026-11-15: smáatriði)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(yfirfarið 2026-11-15: smáatriði)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(yfirfarið 2026-11-15: smáatriði)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(yfirfarið 2026-11-15: smáatriði)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(yfirfarið 2026-11-15: smáatriði)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(yfirfarið 2026-11-15: smáatriði)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(yfirfarið 2026-11-15: smáatriði)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(yfirfarið 2026-11-15: smáatriði)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(yfirfarið 2026-11-15: smáatriði)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(yfirfarið 2026-11-15: smáatriði)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(yfirfarið 2026-11-15: smáatriði)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(yfirfarið 2026-11-15: smáatriði)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(yfirfarið 2026-11-15: smáatriði)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(yfirfarið 2026-11-15: smáatriði)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(yfirfarið 2026-11-15: tilvist)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(yfirfarið 2026-11-15: tilvist)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(yfirfarið 2026-11-15: tilvist)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(yfirfarið 2026-11-15: tilvist)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(yfirfarið 2026-11-15: smáatriði)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(yfirfarið 2026-11-15: smáatriði)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(yfirfarið 2026-11-15: smáatriði)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(yfirfarið 2026-11-15: smáatriði)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(yfirfarið 2026-11-15: smáatriði)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(yfirfarið 2026-11-15: smáatriði)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(yfirfarið 2026-11-15: smáatriði)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(yfirfarið 2026-11-15: tilvist)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(yfirfarið 2026-11-15: smáatriði)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(yfirfarið 2026-11-15: smáatriði)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(yfirfarið 2026-11-15: smáatriði)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(yfirfarið 2026-11-15: smáatriði)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(yfirfarið 2026-11-15: tilvist)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(yfirfarið 2026-11-15: smáatriði)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(yfirfarið 2026-11-15: tilvist)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(yfirfarið 2026-11-15: smáatriði)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(yfirfarið 2026-11-15: smáatriði)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(yfirfarið 2026-11-15: smáatriði)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(yfirfarið 2026-11-15: smáatriði)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(yfirfarið 2026-11-15: smáatriði)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(yfirfarið 2026-11-15: tilvist)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(yfirfarið 2026-11-15: smáatriði)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(yfirfarið 2026-11-15: smáatriði)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(yfirfarið 2026-11-15: smáatriði)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(yfirfarið 2026-11-15: smáatriði)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(yfirfarið 2026-11-15: smáatriði)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(yfirfarið 2026-11-15: smáatriði)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(yfirfarið 2026-11-15: smáatriði)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(yfirfarið 2026-11-15: smáatriði)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(yfirfarið 2026-11-15: smáatriði)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(yfirfarið 2026-11-15: tilvist)*
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(yfirfarið 2026-11-15: smáatriði)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(yfirfarið 2026-11-15: smáatriði)*
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(yfirfarið 2026-11-15: smáatriði)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(yfirfarið 2026-11-15: smáatriði)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(yfirfarið 2026-11-15: smáatriði)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(yfirfarið 2026-11-15: smáatriði)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(yfirfarið 2026-11-15: smáatriði)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(yfirfarið 2026-11-15: smáatriði)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(yfirfarið 2026-11-15: smáatriði)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(yfirfarið 2026-11-15: smáatriði)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(yfirfarið 2026-11-15: smáatriði)*
- Triandafillov, V. K. (trans. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(yfirfarið 2026-11-15: smáatriði)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(yfirfarið 2026-11-15: smáatriði)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(yfirfarið 2026-11-15: smáatriði)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(yfirfarið 2026-11-15: smáatriði)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(yfirfarið 2026-11-15: smáatriði)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(yfirfarið 2026-11-15: smáatriði)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(yfirfarið 2026-11-15: smáatriði)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(yfirfarið 2026-11-15: tilvist)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(yfirfarið 2026-11-15: smáatriði)*
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(almenningseign)* *(yfirfarið 2026-11-15: tilvist)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(yfirfarið 2026-11-15: smáatriði)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(yfirfarið 2026-11-15: smáatriði)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(yfirfarið 2026-11-15: smáatriði)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(yfirfarið 2026-11-15: smáatriði)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(yfirfarið 2026-11-15: smáatriði)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(yfirfarið 2026-11-15: smáatriði)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(yfirfarið 2026-11-15: smáatriði)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(yfirfarið 2026-11-15: tilvist)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(yfirfarið 2026-11-15: smáatriði)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(yfirfarið 2026-11-15: tilvist)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(yfirfarið 2026-11-15: tilvist)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(yfirfarið 2026-11-15: tilvist)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(yfirfarið 2026-11-15: smáatriði)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(yfirfarið 2026-11-15: smáatriði)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(yfirfarið 2026-11-15: smáatriði)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(yfirfarið 2026-11-15: smáatriði)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(yfirfarið 2026-11-15: smáatriði)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(yfirfarið 2026-11-15: smáatriði)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(yfirfarið 2026-11-15: tilvist)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(yfirfarið 2026-11-15: smáatriði)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(yfirfarið 2026-11-15: smáatriði)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(yfirfarið 2026-11-15: smáatriði)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(yfirfarið 2026-11-15: smáatriði)*
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(almenningseign)* *(yfirfarið 2026-11-15: smáatriði)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(yfirfarið 2026-11-15: smáatriði)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(yfirfarið 2026-11-15: smáatriði)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(yfirfarið 2026-11-15: smáatriði)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(yfirfarið 2026-11-15: tilvist)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(yfirfarið 2026-11-15: smáatriði)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(yfirfarið 2026-11-15: tilvist)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(yfirfarið 2026-11-15: tilvist)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(yfirfarið 2026-11-15: smáatriði)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(yfirfarið 2026-11-15: smáatriði)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(yfirfarið 2026-11-15: smáatriði)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(yfirfarið 2026-11-15: smáatriði)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(yfirfarið 2026-11-15: smáatriði)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(yfirfarið 2026-11-15: smáatriði)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(yfirfarið 2026-11-15: smáatriði)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(yfirfarið 2026-11-15: smáatriði)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(yfirfarið 2026-11-15: smáatriði)*

<!-- kb:end -->
