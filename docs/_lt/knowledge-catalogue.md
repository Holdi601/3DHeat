---
title: "Žinių katalogas"
parent: "Žinių lęšis"
nav_order: 2
lang: "lt"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Žinių katalogas

Čia pilnas sąrašas to, ką [žinių lęšis](knowledge.md) žino: modeliai, kuriuos jis ieško, idėjos, metodai, istoriniai atvejai ir tyrimai, kuriuos jis cituoja, ir knygos bei straipsniai, kuriais jie remiasi. Naudokite jį, kad rastumėte įrašą pagal jo id arba patikrintumėte šaltinį.

Šis puslapis sugeneruotas iš žinių bazės komanda `node tools/knowledge-doc.mjs`; nekeiskite to, kas yra tarp žymių.

<!-- kb:begin -->

Žinių bazėje yra 579 įrašai (135 sąvokos, 37 metodai, 277 istoriniai atvejai, 17 projektavimo principų, 113 tyrimų), apimantys 93 modelius, ir cituojama 556 šaltiniai.

### Modeliai (93) {#patterns-93}

| id | šeima | kaip tai atrodo duomenyse |
|---|---|---|
| `concentration` | jėga | Pusė, kuri į vieną vietą atveda daugiau vienetų, laimi tą vietą labiau, nei leidžia vien skaičiai. |
| `local-superiority` | jėga | Žudymai tenka tai pusei, kuri kovos nuotolyje turi daugiau kovotojų, nepaisant bendrų skaičių. |
| `attrition` | jėga | Nuostoliai seka abiejų pusių jėgas laikui bėgant; kovą nulemia tas, kas pirmas išsenka. |
| `exchange-ratio` | jėga | Žudymai vienam nuostoliui smarkiai skiriasi pagal vietą, pusę ar klasę. |
| `aimed-fire` | jėga | Nuostoliai auga su priešo skaičiumi, bet ne su savo. |
| `area-fire` | jėga | Nuostoliai auga su abiejų pusių skaičių sandauga: spūstis baudžiama. |
| `defeat-in-detail` | jėga | Viena pusė sunaikinama po dalį, kai jos dalys atvyksta po vieną. |
| `mutual-support` | jėga | Nuostolį greitai atsako netoliese esantis bendražygis: keičiamasi. |
| `combined-arms` | jėga | Klasės gerai veikia kartu, kai viena dengia kitos silpnybę, ir blogai, kai veikia vienos. |
| `class-counter` | jėga | Viena klasė laimi nesuproporcingai prieš tam tikrą kitą klasę arba tam tikroje vietoje. |
| `initiative` | jėga | Tas, kas pirmas pelno tašką susirėmime, linkęs jį laimėti. |
| `key-terrain` | reljefas | Tos pačios kelios vietos lemia kovas rungtynė po rungtynės. |
| `fields-of-fire` | reljefas | Vietos, iš kurių matyti toli per žemę, kurią kiti turi pereiti, duoda daugiau žudymų. |
| `high-ground` | reljefas | Žudymai daromi iš aukščiau žemės, ant kurios stovi aukos. |
| `cover` | reljefas | Mirčių skaičius per laiką krenta ten, kur geometrija blokuoja matymą ir ugnį. |
| `open-ground` | reljefas | Mirčių skaičius per laiką kyla ten, kur nieko nebloką matymo ir ugnies. |
| `kill-zone` | reljefas | Mirtys susitelkia ten, kur judėjimas priverstas eiti stebimu, ugnimi dengiamu plotu. |
| `chokepoint` | reljefas | Daug perėjimų išspaudžiama per mažai žemės, ir ten krenta nuostoliai. |
| `reverse-slope` | reljefas | Saugumas tiesiai už kalvagūbrio ar sienos, be tiesioginio priešo matymo. |
| `safe-ground` | reljefas | Vieta, kur laikas praleidžiamas, bet mažai žmonių žūva. |
| `obstacle` | reljefas | Maršrutai apeina užblokuotą žemę ir susispaudžia į kelias juostas. |
| `flank` | judėjimas | Retai naudojamas maršrutas duoda daugiau žudymų nei pagrindiniai. |
| `avenue-of-approach` | judėjimas | Judėjimas teka keliomis juostomis tarp zonų. |
| `mobility` | judėjimas | Judantys vienetai miršta mažiau (ar daugiau) per laiką nei lėti ar stovintys. |
| `static-exposure` | judėjimas | Vienetai, stovintys vietoje, miršta per laiką daugiau nei judantys. |
| `interior-lines` | judėjimas | Pusė, turinti trumpus maršrutus tarp savo kovų, greičiau perkelia jėgas nei kita. |
| `envelopment` | judėjimas | Žudymai ateina iš kelių krypčių į vienos pusės poziciją. |
| `ambush` | judėjimas | Vienetai, judantys maršrutu, greitai miršta nuo priešų, jau užėmusių pozicijas. |
| `spawn-pressure` | laikas | Gyvenimai greitai baigiasi po pradžios prie vieno atsiradimo taško. |
| `tempo` | laikas | Greitesnė pusė pasiekia kovą ir pelno tašką, kol kita sureaguoja. |
| `surprise` | laikas | Nuostoliai ateina pliūpsniu, prieš aukoms atsakant ugnimi. |
| `energy-advantage` | oras | Žudikai turi daugiau aukščio ir greičio nei aukos. |
| `air-superiority` | oras | Vienos pusės orlaiviai nužudo daug kartų daugiau, nei patys praranda. |
| `sead` | oras | Žemės oro gynyba numuša daug orlaivių, kol ji nerasta ir nesunaikinta. |
| `bvr` | oras | Žudymai vyksta dideliu nuotoliu, prieš auką galint priartėti. |
| `fleet-salvo` | jūra | Pajėgos, kurios pirmos smogia, mažai praranda; kita beveik nieko neišgyvena, kad atsakytų. |
| `scouting` | jūra | Pusė, kuri pirmoji randa kitą, pasirenka kovą. |
| `urban-close` | miestas | Trumpi kovos nuotoliai, daug mirčių tankioje geometrijoje, lėtas išvalymas. |
| `vertical` | miestas | Žudymai iš viršutinių aukštų ar stogų į gatves. |
| `skill-dispersion` | žmonės | Keli žaidėjai sudaro didelę žudymų ar mirčių dalį. |
| `ai-vs-player` | žmonės | Dirbtinio intelekto valdomi vienetai toje pačioje vietoje sekasi kitaip nei žaidėjams. |
| `balance` | dizainas | Pusės, atsiradimo taškai ar klasės pradeda su netolygiomis galimybėmis. |
| `economy` | dizainas | Uždirbami, mokami ir prarandami ištekliai susitelkia keliose vietose ar tarp kelių žaidėjų. |
| `flow` | dizainas | Kaip žaidėjai juda lygyje: kilpos, juostos, aklavietės. |
| `sightlines` | dizainas | Ilgos matymo linijos lemia, kur prasideda kovos ir kas jas laimi. |
| `readability` | dizainas | Mirtys, kurių žaidėjai nemato ateinant: iš nugaros, iš už akiračio. |
| `formation` | judėjimas | Vienos pusės vienetai juda kartu atpažįstama forma: linija, kolona, pleištas, ešelonas, dėžė. |
| `frontal-assault` | judėjimas | Grupė artėja prie priešo tiesiai į jo priekinę dalį. |
| `double-envelopment` | judėjimas | Dvi grupės smogia abiem vienos priešo grupės flangais maždaug tuo pačiu metu. |
| `encirclement` | judėjimas | Priešo grupė atsiduria apsupta kitos pusės ir turi mažai išeičių. |
| `penetration` | judėjimas | Grupė praeina per priešo liniją, kur priešai stovi abiejose pusėse. |
| `fire-and-maneuver` | judėjimas | Dalis grupės juda, kol kita stovi ir dengia, o vaidmenys keičiasi. |
| `feint` | judėjimas | Maža grupė traukia priešą į vieną vietą; pagrindinis smūgis netrukus ateina kitur. |
| `withdrawal` | judėjimas | Grupė kontakte pasisuka ir didina atstumą iki priešo. |
| `pursuit` | judėjimas | Grupė seka priešą, kuris juda šalin, išlaikydama ar mažindama atstumą. |
| `defence-in-depth` | reljefas | Gynėjai stovi keliomis juostomis viena už kitos palei priešo puolimo ašį. |
| `screening` | judėjimas | Maža dalis juda toli priekyje nuo pagrindinio kūno ir pirmoji sutinka priešą. |
| `dispersion` | jėga | Pusė laikui bėgant išsisklaido; mažiau jos vienetų dalijasi viena vieta. |
| `missile-defence` | oras | Orlaiviai, esantys raketų grėsmėje, pasuka grėsmę į šoną ar uodegą: crank, notch, drag, pump. |
| `angles-fight` | oras | Arti vykstanti oro kova mažu greičiu ir dideliu posūkio greičiu, kovojama dėl nosies padėties, o ne dėl energijos. |
| `cap` | oras | Orlaiviai skrieja aplink fiksuotą postą minutėmis, laukdami priešo. |
| `strike-package` | oras | Skirtingų vaidmenų orlaiviai skrenda kartu į taikinį; vieni puola žemę, kiti dengia. |
| `line-of-battle` | jūra | Laivai plaukia kolona vienas už kito, kad visi šoniniai bortai būtų nukreipti į priešą. |
| `crossing-the-t` | jūra | Kolona pereina priešo kolonos priekį: visi jos ginklai nukreipti, o mažai priešo ginklų gali šaudyti. |
| `fatal-funnel` | miestas | Žaidėjai, įeinantys pro vienas duris, kambarį ar siaurą vietą, ten žūva per akimirką daug dažniau nei įeidami kitur. |
| `crossfire` | jėga | Laikytojai, kurių ugnies linijos susikerta iš skirtingų kampų, laimi daugiau dvikovų nei vienas laikytojas. |
| `peeker-advantage` | laikas | Žaidėjas, įžengiantis į matymo lauką, laimi dvikovas prieš tą, kuris laiko kampą, dažniau (ar rečiau) nei pusę kartų. |
| `entry` | laikas | Pirmas raundo žudymas nulemia didelę raundo dalį; įėjimai laimi ar pralaimi pagal vietą ir palaikymą. |
| `utility-support` | jėga | Blykstė ar dūmai prieš dvikovą pakeičia, kas ją laimi. |
| `man-advantage` | jėga | Raundus laimi pusė, turinti daugiau gyvų žaidėjų; kai kurios pusės pranašumą paverčia pergale, o kitos jį iššvaisto. |
| `clutch` | žmonės | Paskutiniai gyvi žaidėjai laimi dažniau (ar rečiau), nei prognozuoja raundo būklė. |
| `action-value` | žmonės | Žudymai, keitimai, bombų padėjimai ir pagalbinės priemonės skiriasi tuo, kiek jie keičia laimėjimo šansą. |
| `lurk` | judėjimas | Žaidėjas vienas toli nuo komandos žudo (ar miršta) kitu tempu nei būrys. |
| `rotation` | judėjimas | Kaip greitai pusė perkelia žaidėjus į kovą ar tikslą, nulemia, ar ji laikosi, ar atsiima. |
| `collective-order` | žmonės | Pusės judantys vienetai dažniau nei atsitiktinai leistų jų pačių takai, perkelti laike, eina ta pačia kryptimi. |
| `milling` | žmonės | Pusės vienetai sukasi apie bendrą centrą: sukimasis be grynos kelionės. |
| `herding` | žmonės | Vienetai palieka vietą taip, kaip prieš juos tai padarė bendražygis, peržengdami vietos ir priešo kopijavimo ribas. |
| `lane-formation` | žmonės | Priešingi srautai laikosi atskirų juostų; judėjimas susitelkia ant kelių takų, naudojamų rungtynė po rungtynės. |
| `crowding` | žmonės | Greitis ir srautas krinta, kai vienetai susispaudžia; per siaurą vietą stumiant stipriau, praeina mažiau. |
| `leadership` | žmonės | Kai kurie vienetai pirmi pasisuka, o kiti kelias sekundes vėliau kopijuoja jų kryptį. |
| `cohesion` | žmonės | Vienetai, nutolstantys nuo grupės, miršta dažniau nei tie, kurie laikosi kartu. |
| `breaking-point` | žmonės | Pusė, praradusi dalį savo jėgos, nustoja artėti ir atsitraukia, o tai neparodo vien jos atstumas iki priešo. |
| `panic` | žmonės | Staiga kilus grėsmei vienetai išsisklaido, bėga ar sustingsta, ir koordinacija subyra. |
| `loss-chasing` | žmonės | Po nuostolio vienetai imasi daugiau (ar mažiau) rizikos nei po laimėjimo. |
| `hot-hand` | žmonės | Sėkmė seka sėkmę dažniau, nei leidžia atsitiktinai sumaišytos tos pačios žaidėjo sekos. |
| `conformity` | žmonės | Pusės nariai pasirenka panašiai — pirkimus, įrangą, maršrutus — daugiau, nei leidžia jų pačių pageidavimai. |
| `suppression` | žmonės | Gaunama ugnis keičia, kaip vienetai juda ir šaudo, net jei nenužudo. |
| `social-loafing` | žmonės | Veiksmai vienam nariui mažėja, kai yra daugiau bendražygių. |
| `mixed-strategy` | žmonės | Pasirinkimai, kurie turėtų būti nenuspėjami, tampa tvarkingi: viena parinktis laimi dažniau, arba pasirinkimai eina sekomis. |
| `coordination` | žmonės | Nariai veikia sinchroniškai be matomų įsakymų: suderintas judėjimas, laikas ir pasirinkimai. |
| `contagion` | žmonės | Būsena persiduoda iš vieneto į vienetą sąlyčiu ar artumu ir plinta per žemėlapį. |
| `territoriality` | žmonės | Vienetai laikosi atstumo vienas nuo kito ir išlaiko savo žemę. |
| `interaction-network` | žmonės | Kas kovoja, palaiko ir seka ką, sudaro tinklą su centrais, grupėmis ir tiltais. |

### Sąvokos (135) {#concepts-135}

| id | pavadinimas | lęšiai | modeliai | šaltiniai |
|---|---|---|---|---|
| `concept.lanchester-square` | Lanchesterio kvadratinis dėsnis (tikslus šaudymas) | karinis, oro, jūrų, e. sportas | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Lanchesterio tiesinis dėsnis (plotinis šaudymas, vienas prieš vieną) | karinis, miesto, e. sportas | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Jėgos sutelkimas (masė) | karinis, oro, jūrų, e. sportas | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Jėgų santykiai ir 3:1 taisyklė | karinis | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Nuostolių mainų santykis | karinis, oro, e. sportas, dizainas | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Kovinė galia ir jos daugikliai | karinis | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Šiuolaikinė jėgų panaudojimo sistema | karinis | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | OODA ciklas (stebėti-orientuotis-nuspręsti-veikti) | karinis, oro, e. sportas | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Energijos ir manevringumo teorija | oro | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Pagrindiniai naikintuvų manevrai ir oro kovos manevravimas | oro | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Reljefo analizė: OAKOC / KOCOA | karinis, dizainas, miesto | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: misijos kintamieji | karinis | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Pagrindinis ir lemiamas reljefas | karinis, dizainas, e. sportas | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Stebėjimas ir ugnies laukai | karinis, dizainas, e. sportas, miesto | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Priedanga ir maskavimas | karinis, miesto, dizainas | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Artėjimo kryptys ir judėjimo koridoriai | karinis, dizainas | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Siauros vietos ir tarpekliai | karinis, dizainas, e. sportas | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Kovos zonos ir mirties zonos | karinis, miesto, dizainas | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Gynyba už šlaito ir paslėpimas (defilada) | karinis, dizainas | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Aukštumos | karinis, dizainas | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Vidinės ir išorinės linijos | karinis | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Sunaikinimas dalimis | karinis, e. sportas | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Abipusis palaikymas | karinis, oro, e. sportas | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Kombinuoti ginklai | karinis, dizainas | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Slopinimas | karinis, miesto | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Priešo oro gynybos slopinimas ir sunaikinimas (SEAD/DEAD) | oro, karinis | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Kovinis oro patrulis ir oro pranašumas | oro | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Kova už regėjimo ribų | oro | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Netiesioginis priartėjimas | karinis, e. sportas, dizainas | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Apsupimas ir apgaubimas | karinis | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Pasala | karinis, e. sportas, dizainas | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Gynyba gylyje | karinis | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Trintis ir karo rūkas | karinis, e. sportas | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Puolimo kulminacijos taškas | karinis | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Netikėtumas | karinis, oro, jūrų, e. sportas | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Jėgų ekonomija | karinis, e. sportas | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Miesto reljefas | miesto, karinis, e. sportas | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Jūrų kontrolė ir lemiamas laivyno mūšis | jūrų | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Hughes' salvės modelis: pirmas efektyviai smogti | jūrų, oro | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Paieškos ir aptikimo teorija | jūrų, oro, karinis | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Operacijų tyrimai: veiksmingumo matai | karinis, oro, jūrų, dizainas | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Karo žaidimai kaip analizė | karinis, dizainas | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Manevrinis karas | karinis, e. sportas | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Sanglauda ir moralinis veiksnys | karinis | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Svorio centras | karinis | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Lemiami taškai | karinis, e. sportas | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Veiklos linijos | karinis | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Sunaikinimo ir nuvargdymo strategijos | karinis | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Gilusis mūšis ir gilieji veiksmai | karinis | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | Oro-sausumos mūšis (AirLand Battle) | karinis, oro | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Misijos vadovavimas (Auftragstaktik) | karinis, e. sportas | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Proveržis ir išnaudojimas | karinis | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Ugnis ir judėjimas | karinis, e. sportas | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Šuolinis dengimas (bounding overwatch) | karinis, e. sportas | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Žvalgybos traukimas ir infiltracija | karinis, e. sportas | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | Rezervas | karinis, e. sportas | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Elastinga gynyba ir kontrataka | karinis | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | Naikinimo grandinė (surasti, fiksuoti, sekti, taikyti, įveikti, įvertinti) | karinis, oro, jūrų | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Aptikimo nuotolis ir kovos nuotolis | oro, jūrų, karinis | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Kovinio veiksmingumo vertė | karinis, e. sportas | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Išsisklaidymas mūšio lauke | karinis, e. sportas | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Artimoji oro parama | oro, karinis | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Oro draudimas (interdikcija) | oro, karinis | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Lydėjimas prieš naikintuvų šlavimą | oro | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Energijos kova prieš sukimosi kovą | oro | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Pirmasis, tiesusis ir atsilikęs vedimas | oro | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Thach vingiavimas | oro | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Piršto keturetas ir kovos pora | oro | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Laivynas kaip būvis (fleet in being) | jūrų | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Kirtimas per T | jūrų, karinis | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Konvojus | jūrų | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Prieigos draudimas ir zonos uždarymas (A2/AD) | jūrų, oro, karinis | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Stiprios vietos gynyba užstatytose vietovėse | miesto, karinis | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Judėjimas per pastatus (mouseholing) | miesto, karinis, dizainas | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Apgultis | karinis, miesto | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Partizaninis karas | karinis, miesto | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Kontrsukilimas | karinis, miesto | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Prieglobstis | karinis, dizainas | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Apgaulė (maskirovka) | karinis, e. sportas | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Informacijos pranašumas | karinis, e. sportas | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Ekonomikos raundai ir išteklių tempas | e. sportas, dizainas | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Judėjimo formacijos: linija, kolona, pleištas, ešelonas | karinis, e. sportas | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Frontalinis puolimas | karinis | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Dvigubas apgaubimas (replės) | karinis | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Apsupimas ir „katilas“ | karinis | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Įsiskverbimas ir proveržis | karinis | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Persekiojimas | karinis | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Atgalinis judėjimas: atsitraukimas, delsimas ir atsitraukimas | karinis | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Klaidinimas ir demonstracija | karinis, e. sportas | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Ekranas, sargyba ir dengimas: apsauga prieš pagrindinį kūną | karinis | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Gynyba nuo raketos: crank, notch, drag ir pump | oro | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Formacijos už regėjimo ribų: siena, pirmasis-sekantis, malūnėlis, replės | oro | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Kampų kova ir energijos kova | oro | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Smūgių paketas ir slopinimo seka | oro, karinis | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | Mūšio linija | jūrų | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | Mirtinas piltuvas | miesto, karinis, e. sportas, dizainas | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Kambarių valymas: netikėtumas, greitis, kontroliuojamas smurtas | miesto, karinis, e. sportas | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Dominavimo taškai | miesto, karinis, e. sportas | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Kampų valymas (slicing the pie) | miesto, karinis, e. sportas | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Kryžminė ugnis ir sutampantys ugnies laukai | karinis, miesto, e. sportas, dizainas | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Žvilgsnio žaidėjo pranašumas | e. sportas, dizainas | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Žmonių pranašumas eliminacijos raunduose | e. sportas, karinis | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Įėjimas ir atidarymo dvikova | e. sportas, miesto | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Pagalbinės priemonės prieš įėjimą: blykstė ir dūmai | e. sportas, miesto, karinis | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Socialinių jėgų modelis pėsčiųjų judėjimui | dizainas, miesto, karinis | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Juostų formavimasis priešpriešiniame sraute | dizainas, miesto | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Greičiau reiškia lėčiau | dizainas, miesto, karinis | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Pagrindinė minios diagrama | dizainas, miesto | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Takų formavimasis ir norų linijos (desire lines) | dizainas, karinis | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Panika retai: bendras atsparumas | karinis, miesto, dizainas | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: atskyrimas, lygiavimas, sanglauda | dizainas, karinis | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Tvarkos parametras ir kolektyvinio judėjimo pradžia | dizainas, karinis, oro, jūrų | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Spiečius, sukimasis ir poliarizuotos būsenos | dizainas, karinis, jūrų | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Veiksmingas vadovavimas be signalų | karinis, e. sportas, dizainas | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Kaimynai pagal skaičių, o ne pagal atstumą | oro, karinis | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Spiečiaus intelektas | dizainas, e. sportas, karinis | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Pulkavimas ir informacijos kaskados | e. sportas, dizainas, karinis | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Socialinis tingėjimas (social loafing) | e. sportas, dizainas, karinis | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Atsakomybės išsklaidymas | e. sportas, karinis | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Pirminės grupės sanglauda | karinis, e. sportas | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Lūžio taškai ir nuostolių ribos | karinis | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Slopinimas: ką ugnis daro be žudymo | karinis, miesto | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Baimė ir stresas kovos sprendimuose | karinis, e. sportas | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Sužlugimas spaudimo sąlygomis | e. sportas | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Perspektyvų teorija ir nuostolių vengimas | e. sportas, dizainas | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Nulinio pelno ir „pinigų iš namų“ efektai | e. sportas | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Nervinimasis (tilt) | e. sportas | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Prarastos sąnaudos (sunk cost) | e. sportas, karinis | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | Karšta ranka ir jos klaida | e. sportas | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Mišrios strategijos: nenuspėjamumas | e. sportas, dizainas, karinis | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Bendri mąstymo modeliai | e. sportas, karinis | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Komandinio darbo sudedamosios dalys | e. sportas, karinis | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Virtualūs pasauliai kaip elgesio laboratorijos | dizainas, e. sportas | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Asmeninė erdvė ir teritorija | dizainas, miesto | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Sąveikos tinklai: centrai ir silpnos jungtys | e. sportas, dizainas | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Metodai (37) {#methods-37}

| id | pavadinimas | modeliai | šaltiniai |
|---|---|---|---|
| `method.lanchester-fit` | Lanchesterio rodiklių pritaikymas kovų duomenims | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Mainų santykis pagal pusę ir vietą | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Vietinis jėgų santykis kiekvieno žudymo metu | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Matymo sritis: ugnies laukai pagal matymo linijas | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Savitoji energija žudymų ir mirčių metu (oras) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Karštųjų taškų išlikimas rungtynėse | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Keitimų dažnis (abipusis palaikymas) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Kovos ir pirmo žudymo pranašumas | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Mirčių erdvinė autokoreliacija (Moran's I) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Dažniai pagal žemėlapio bazinę liniją su FDR kontrole | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Mūšio lauko žvalgybinis paruošimas (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Porinio palyginimo reitingų modeliai (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Laimėjimo tikimybė ir veiksmų vertinimas | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Erdvės kontrolė ir aikštės kontrolė | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Salvių lygtis, pritaikyta laivams kontakte | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Kovinio veiksmingumo santykis pagal vienetą-valandą veiksme | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Aptikimo ir kovos nuotoliai | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Naikinimo grandinės laikas | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Išsisklaidymas prieš žudymų dalį (jėgos sutelkimas laike) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Nuostolių dažnis ir žudymai per skrydį | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Raundo laimėjimo tikimybės modelis | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Veiksmo vertė: pridėta laimėjimo tikimybė | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Koreguotas plius-minus pagal kalnagūbrio regresiją (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Susitraukimas: empirinis Bajesas | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Tikėtini rezultatai: nuo tikėtinų įvarčių iki tikėtinų dvikovų | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Pasiruošimų, rotacijų ir slapstymosi matavimas | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Atspindžio problema: kopijavimas ar bendra priežastis | herding, conformity | Manski 1993 |
| `method.streak-correction` | Serijos su baigtinių sekų pataisa | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Poliarizacijos ir sukimosi tvarkos parametrai | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Lyderiai pagal laiku atidėtą krypties koreliaciją | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Maršrutų kaskados testas pulkavimui | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Juostų atskyrimas ir takų išlikimas | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Atsilikėlių rizika | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Lūžio kreivė | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Atsakas į gaunamą ugnį | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Rizika po nuostolio ar pelno | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Pirkimo sutarimas (Fleiss' kappa) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Istoriniai atvejai (277) {#historical-cases-277}

| id | atvejis | kada | mastas | modeliai | šaltiniai |
|---|---|---|---|---|---|
| `case.thermopylae` | Termopilai | 480 m. pr. Kr. | mūšis | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamis | 480 m. pr. Kr. | mūšis | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Maratonas | 490 m. pr. Kr. | mūšis | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuktra | 371 m. pr. Kr. | mūšis | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331 m. pr. Kr. | mūšis | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Trasimeno ežeras | 217 m. pr. Kr. | mūšis | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Kanai | 216 m. pr. Kr. | mūšis | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Teutoburgo miškas | 9 m. po Kr. | mūšis | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastingsas | 1066 | mūšis | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Stirlingo tiltas | 1297 | mūšis | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Azinkūras | 1415 | mūšis | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Lojenas | 1757 | mūšis | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlicas | 1805 | mūšis | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgaras | 1805 | mūšis | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Vaterlo | 1815 | mūšis | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburgas: Marye's aukštumos | 1862 | susirėmimas | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburgas: Little Round Top | 1863 | susirėmimas | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburgas: Picketo šturmas | 1863 | susirėmimas | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlvana | 1879 | mūšis | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorkės brodas | 1879 | susirėmimas | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenbergas | 1914 | kampanija | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | Sommas, pirmoji diena | 1916 m. liepos 1 d. | mūšis | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdenas | 1916 | kampanija | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jutlandija | 1916 | mūšis | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomusalmis | 1939–40 | mūšis | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedanas ir Ardėnai | 1940 m. gegužė | kampanija | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Arro kontrataka | 1940 m. gegužės 21 d. | susirėmimas | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Didžiosios Britanijos mūšis | 1940 m. liepa–spalis | kampanija | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Atlanto mūšis: konvojų operacijų tyrimai | 1939–45 | kampanija | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midvėjus | 1942 m. birželis | mūšis | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Antrasis El Alameinas | 1942 m. spalis–lapkritis | mūšis | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Kasserinos perėja | 1943 m. vasaris | mūšis | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Stalingradas | 1942 m. rugpjūtis–1943 m. vasaris | kampanija | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kurskas | 1943 m. liepa | kampanija | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prochorovka | 1943 m. liepos 12 d. | susirėmimas | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Vilje-Bokažas | 1944 m. birželio 13 d. | susirėmimas | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Normandijos gyvatvorių vietovės | 1944 m. birželis–liepa | kampanija | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Operacija „Cobra“ | 1944 m. liepa | kampanija | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Leiteo įlanka | 1944 m. spalis | mūšis | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastonė | 1944 m. gruodis | mūšis | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Cušima | 1905 m. gegužė | mūšis | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Inčhonas | 1950 m. rugsėjis | kampanija | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | MiG alėja | 1950–53 | kampanija | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dienbienfu | 1954 | mūšis | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | 1965 m. lapkritis | susirėmimas | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operacija „Bolo“ | 1967 m. sausio 2 d. | susirėmimas | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golanas: Ašarų slėnis | 1973 m. spalis | mūšis | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Sinajus: Kinų ūkis | 1973 m. spalis | mūšis | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Bekos slėnis (Operacija „Mole Cricket 19“) | 1982 m. birželis | mūšis | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Foklando oro karas | 1982 m. gegužė–birželis | kampanija | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | „Dykumos audros“ oro kampanija | 1991 m. sausis–vasaris | kampanija | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 1991 m. vasario 26 d. | susirėmimas | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadišas | 1993 m. spalis | susirėmimas | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Groznas | 1994 m. gruodis–1995 m. vasaris | mūšis | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hujė | 1968 m. sausis–kovas | mūšis | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Kosovo oro kampanija | 1999 m. kovas–birželis | kampanija | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Falūdža (Operacija „Al Fajr“) | 2004 m. lapkritis | mūšis | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mosulas | 2016–17 | kampanija | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Kadešas | apie 1274 m. pr. Kr. | mūšis | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Isas | 333 m. pr. Kr. | mūšis | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 m. pr. Kr. | mūšis | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Karai | 53 m. pr. Kr. | mūšis | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Farsalas | 48 m. pr. Kr. | mūšis | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianopolis | 378 m. po Kr. | mūšis | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Jarmukas | 636 m. po Kr. | mūšis | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Mancikertas | 1071 | mūšis | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hatinas | 1187 | mūšis | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburnas | 1314 | mūšis | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Kresi | 1346 | mūšis | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Puatjė | 1356 | mūšis | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunvaldas (Tannenbergas) | 1410 | mūšis | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeldas | 1631 | mūšis | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blenheimas | 1704 | mūšis | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Poltava | 1709 | mūšis | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rosbachas | 1757 | mūšis | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | kampanija | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Jorktaunas | 1781 | mūšis | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena-Auerštetas | 1806 | mūšis | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodinas | 1812 | mūšis | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Leipcigas | 1813 | mūšis | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietamas | 1862 | mūšis | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Čensloriusvilis | 1863 | mūšis | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Viksburgas | 1863 | kampanija | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Kėniggrecas (Sadova) | 1866 | mūšis | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedanas | 1870 | mūšis | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukdenas | 1905 | mūšis | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurmanas | 1898 | mūšis | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kopas | 1900 | susirėmimas | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Galipolis | 1915 | kampanija | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Kambrė | 1917 m. lapkritis | mūšis | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Kaporetas | 1917 m. spalis–lapkritis | kampanija | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Vokietijos pavasario puolimas (Operacija „Michael“) | 1918 m. kovas–balandis | kampanija | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amjenas | 1918 m. rugpjūtis | mūšis | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Chalchin Golas (Nomonhanas) | 1939 m. rugpjūtis | mūšis | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | Lenkijos kampanija | 1939 m. rugsėjis | kampanija | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hanjutas ir Žamblū | 1940 m. gegužė | mūšis | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonas | 1940 m. gegužė | susirėmimas | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Dankerko perimetras | 1940 m. gegužė–birželis | kampanija | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operacija „Compass“ ir Beda Fomas | 1940 m. gruodis–1941 m. vasaris | kampanija | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Operacija „Crusader“ ir Sidi Rezegas | 1941 m. lapkritis–gruodis | kampanija | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | 1942 m. gegužė–birželis | mūšis | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alamhalfa | 1942 m. rugpjūtis–rugsėjis | mūšis | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno-Brodis | 1941 m. birželis | mūšis | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Kijevo apsupimas | 1941 m. rugsėjis | kampanija | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Maskva | 1941 m. spalis–1942 m. sausis | kampanija | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Rževas ir Operacija „Mars“ | 1942 | kampanija | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Antrasis Charkovas | 1942 m. gegužė | mūšis | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Trečiasis Charkovas (Manšteino smūgis atgal) | 1943 m. vasaris–kovas | kampanija | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operacija „Bagrationas“ | 1944 m. birželis–rugpjūtis | kampanija | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Korsuno-Čerkasų katilas | 1944 m. sausis–vasaris | mūšis | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Kamenecas-Podolskis katilas | 1944 m. kovas–balandis | kampanija | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operacija „Epsom“ | 1944 m. birželis | mūšis | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operacija „Goodwood“ | 1944 m. liepa | mūšis | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operacija „Totalize“ | 1944 m. rugpjūtis | mūšis | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortenas | 1944 m. rugpjūtis | mūšis | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Falezo katilas | 1944 m. rugpjūtis | kampanija | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden ir Arnhemas | 1944 m. rugsėjis | kampanija | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Achenas | 1944 m. spalis | mūšis | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Hiurtgeno miškas | 1944 m. rugsėjis–1945 m. vasaris | kampanija | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arakūras | 1944 m. rugsėjis | mūšis | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | Sv. Vitas | 1944 m. gruodis | mūšis | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Elzenbornas | 1944 m. gruodis | mūšis | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Zėlovo aukštumos | 1945 m. balandis | mūšis | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlynas | 1945 m. balandis–gegužė | mūšis | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operacija „Pavasario prabudimas“ | 1945 m. kovas | mūšis | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | 1943 m. gruodis | mūšis | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Varšuvos sukilimas | 1944 m. rugpjūtis–spalis | kampanija | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarava | 1943 m. lapkritis | mūšis | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Pelelijus | 1944 m. rugsėjis–lapkritis | mūšis | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Ivodzima | 1945 m. vasaris–kovas | mūšis | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinava | 1945 m. balandis–birželis | kampanija | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manila | 1945 m. vasaris–kovas | mūšis | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Mandžiūrija („Rugpjūčio audra“) | 1945 m. rugpjūtis | kampanija | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Pusano perimetras | 1950 m. rugpjūtis–rugsėjis | kampanija | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Čosino rezervuaras | 1950 m. lapkritis–gruodis | kampanija | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Imdžino upė | 1951 m. balandis | mūšis | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapjonas | 1951 m. balandis | mūšis | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | 1951 m. balandis ir 1953 m. liepa | susirėmimas | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Kesanas | 1968 m. sausis–balandis | mūšis | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | 1967 m. lapkritis | mūšis | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (Ap Bia kalnas) | 1969 m. gegužė | susirėmimas | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila–Um Katef | 1967 m. birželis | mūšis | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailija | 1973 m. spalis | mūšis | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultanas Jakūbas | 1982 m. birželis | susirėmimas | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Beiruto apgultis | 1982 m. birželis–rugpjūtis | kampanija | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Libanas 2006: Bint Džbeilas ir priešpriešinio tanko grėsmė | 2006 m. liepa–rugpjūtis | kampanija | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al Faw | 1986 m. vasaris | mūšis | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basra (Karbala-5) | 1987 m. sausis–vasaris | mūšis | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Hafdži | 1991 m. sausis–vasaris | mūšis | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Norfolko tikslas | 1991 m. vasario 26–27 d. | mūšis | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medinos kalvagūbris | 1991 m. vasario 27 d. | mūšis | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Vadi al Batino klaidinimai | 1991 m. vasaris | kampanija | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nasirija | 2003 m. kovas | mūšis | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Peach tikslas | 2003 m. balandis | susirėmimas | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | „Griaustinio bėgimai“ | 2003 m. balandis | mūšis | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Debekos perėja | 2003 m. balandis | susirėmimas | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramadis | 2006–07 | kampanija | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadras Sitis | 2008 m. kovas–gegužė | mūšis | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Operacija „Anaconda“ | 2002 m. kovas | mūšis | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Vanatas | 2008 m. liepa | susirėmimas | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdešas (COP Keating) | 2009 m. spalis | susirėmimas | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Kala ir būrių namai | 2006–07 | kampanija | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Alžyro mūšis | 1956–57 | kampanija | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Rodezijos „Fireforce“ | 1974–79 | kampanija | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Sarajevo apgultis | 1992–96 | kampanija | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Groznas 1999–2000 | 1999 m. gruodis–2000 m. vasaris | mūšis | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Rusijos ir Gruzijos karas | 2008 m. rugpjūtis | kampanija | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopilja | 2014 m. liepa | susirėmimas | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovaiskas | 2014 m. rugpjūtis | mūšis | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debalcevė | 2015 m. sausis–vasaris | mūšis | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Donecko oro uostas | 2014 m. rugsėjis–2015 m. sausis | mūšis | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Hostomelio oro uostas | 2022 m. vasaris | susirėmimas | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | Kijevo ašis ir Brovarų pasala | 2022 m. kovas | susirėmimas | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Mariupolis ir Azovstalis | 2022 m. vasaris–gegužė | mūšis | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Charkovo kontrpuolimas | 2022 m. rugsėjis | kampanija | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Sivierskio Donco kirtimas prie Bilohorivkos | 2022 m. gegužė | susirėmimas | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bachmutas | 2022 m. rugpjūtis–2023 m. gegužė | mūšis | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Zaporižios puolimas | 2023 m. birželis–lapkritis | kampanija | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Kalnų Karabacho karas | 2020 m. rugsėjis–lapkritis | kampanija | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Blitzas | 1940 m. rugsėjis–1941 m. gegužė | kampanija | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | „Barbarosa“: pirmoji diena ore | 1941 m. birželio 22 d. | mūšis | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Kreta | 1941 m. gegužė | mūšis | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Maltos apgultis | 1940–1942 | kampanija | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Stalingrado oro tiltas | 1942 m. lapkritis–1943 m. vasaris | kampanija | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Oro mūšiai virš Kubanės | 1943 m. balandis–birželis | kampanija | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kurskas ore | 1943 m. liepa | mūšis | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operacija „Bagrationas“ ore | 1944 m. birželis–rugpjūtis | kampanija | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploeštis (Operacija „Tidal Wave“) | 1943 m. rugpjūčio 1 d. | susirėmimas | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Dambų reidas (Operacija „Chastise“) | 1943 m. gegužės 16–17 d. | susirėmimas | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hamburgas (Operacija „Gomorra“) | 1943 m. liepa–rugpjūtis | mūšis | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Švainfurtas–Regensburgas | 1943 m. rugpjūčio 17 d. | mūšis | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Antrasis Švainfurtas („Juodasis ketvirtadienis“) | 1943 m. spalio 14 d. | susirėmimas | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Didžioji savaitė (Operacija „Argument“) | 1944 m. vasaris | kampanija | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Niurnbergo reidas | 1944 m. kovo 30–31 d. | susirėmimas | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operacija „Bodenplatte“ | 1945 m. sausio 1 d. | mūšis | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Bismarko jūros mūšis | 1943 m. kovas | mūšis | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Rabaulo neutralizavimas | 1943–1944 | kampanija | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Filipinų jūra („Marianų kalakutų šaudynės“) | 1944 m. birželis | mūšis | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Juodasis antradienis virš Namsio | 1951 m. spalio 23 d. | susirėmimas | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operacija „Rolling Thunder“ | 1965–1968 | kampanija | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Thanh Hoa tiltas | 1965–1972 | susirėmimas | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | „Wild Weasel“ eskadrilės | 1965–1973 | kampanija | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Ault ataskaita ir „Top Gun“ | 1968–1972 | kampanija | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operacija „Linebacker“ | 1972 m. gegužė–spalis | kampanija | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | „Linebacker II“ („Vienuolikos dienų karas“) | 1972 m. gruodis | kampanija | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operacija „Focus“ (Moked) | 1967 m. birželio 5 d. | mūšis | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Nusidėvėjimo karas: raketų juosta | 1969–1970 | kampanija | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | Priešlėktuvinės raketos virš kanalo | 1973 m. spalis | mūšis | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirakas (Operacija „Opera“) | 1981 m. birželio 7 d. | susirėmimas | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operacija „El Dorado Canyon“ | 1986 m. balandžio 15 d. | susirėmimas | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Irano ir Irako oro karas | 1980–1988 | kampanija | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | „Black Buck“ reidai | 1982 m. gegužė–birželis | susirėmimas | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | „Instant Thunder“: Persijos įlankos oro kampanijos planavimas | 1990 m. rugpjūtis–1991 m. sausis | kampanija | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Darbo grupė „Normandy“: pirmasis „Apache“ smūgis | 1991 m. sausio 17 d. | susirėmimas | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | Didžioji „Scud“ medžioklė | 1991 m. sausis–vasaris | kampanija | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Mutlos kalvagūbris („Mirties kelias“) | 1991 m. vasario 26–27 d. | susirėmimas | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operacija „Anaconda“: „Apache“ Šahi Kote | 2002 m. kovas | mūšis | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | Karbalos „Apache“ puolimas | 2003 m. kovo 24 d. | susirėmimas | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | Libijos oro kampanija | 2011 m. kovas–spalis | kampanija | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Kalnų Karabachas: dronai ir oro gynyba | 2020 m. rugsėjis–lapkritis | kampanija | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ukraina: ginčijamas oras | 2022 | kampanija | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Hostomelio oro uostas | 2022 m. vasaris | susirėmimas | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | „Lam Son 719“ | 1971 m. vasaris–kovas | kampanija | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operacija „Eagle Claw“ | 1980 m. balandis | susirėmimas | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afganistanas: „Stinger“ | 1986–1989 | kampanija | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | mūšis | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | Ispanijos armada | 1588 | kampanija | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Kiberono įlanka | 1759 | mūšis | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | Česapiko įlanka (Virdžinijos kyšuliai) | 1781 | mūšis | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Nilas (Abukyro įlanka) | 1798 | mūšis | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Kopenhaga | 1801 | mūšis | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hamptono reidas | 1862 m. kovas | susirėmimas | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lisa | 1866 | mūšis | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Jalu | 1894 | mūšis | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Manilos įlanka | 1898 | mūšis | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Helgolando įlanka | 1914 m. rugpjūtis | mūšis | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Koronelis ir Folklandai | 1914 m. lapkritis–gruodis | kampanija | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Doggerio sekla | 1915 m. sausis | mūšis | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | Rio de la Platos mūšis | 1939 m. gruodis | mūšis | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Taranto | 1940 m. lapkritis | susirėmimas | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Matapanas | 1941 m. kovas | mūšis | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Danijos sąsiauris ir „Bismarko“ nuskandinimas | 1941 m. gegužė | kampanija | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pirl Harboras | 1941 m. gruodžio 7 d. | susirėmimas | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | „Prince of Wales“ ir „Repulse“ | 1941 m. gruodžio 10 d. | susirėmimas | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Javos jūra | 1942 m. vasaris | mūšis | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Koralų jūra | 1942 m. gegužė | mūšis | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Savo sala | 1942 m. rugpjūtis | mūšis | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Rytų Solomonai | 1942 m. rugpjūtis | mūšis | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Cape Esperance kyšulys | 1942 m. spalis | mūšis | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Santa Kruso salos | 1942 m. spalis | mūšis | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Gvadalkanalo jūrinis mūšis | 1942 m. lapkričio 12–15 d. | mūšis | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tasafaronga | 1942 m. lapkritis | susirėmimas | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | „Channel Dash“ | 1942 m. vasaris | susirėmimas | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operacija „Pedestal“ | 1942 m. rugpjūtis | mūšis | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Juodasis gegužės mėnuo | 1943 m. gegužė | kampanija | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Šiaurės kyšulys | 1943 m. gruodis | mūšis | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | JAV povandeninių laivų kampanija prieš Japoniją | 1941–1945 | kampanija | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Prie Samaro | 1944 m. spalio 25 d. | mūšis | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Surigao sąsiauris | 1944 m. spalio 25 d. | mūšis | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinava: kamikadzių kampanija | 1945 m. balandis–birželis | kampanija | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | „Eilato“ nuskandinimas | 1967 m. spalis | susirėmimas | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakija | 1973 m. spalis | mūšis | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | „General Belgrano“ nuskandinimas | 1982 m. gegužės 2 d. | susirėmimas | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | HMS „Sheffield“ netektis | 1982 m. gegužės 4 d. | susirėmimas | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS „Stark“ | 1987 m. gegužės 17 d. | susirėmimas | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operacija „Praying Mantis“ | 1988 m. balandžio 18 d. | mūšis | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | 2004 m. rugpjūtis | susirėmimas | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Bisu revoliucija | 2007 m. kovas | mūšis | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | „Dream Coil“ 2013 m. „The International“ | 2013 m. rugpjūtis | susirėmimas | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Faker su Zed prieš Ryu | 2013 m. rugsėjis | susirėmimas | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | „Overpass boost“ (viadukto stiprinimas) | 2014 m. lapkritis | susirėmimas | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | Šokinėjantis AWP ant Mirage | 2016 m. balandis | susirėmimas | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | „Astralis“ ir įrankių era | 2018 | kampanija | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | „OpenAI Five“ prieš OG | 2019 m. balandis | mūšis | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | „AlphaStar“ pasiekia grandmasterio lygį | 2019 | kampanija | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Kairysis kabliukas (Operacijos „Desert Storm“ sausumos puolimas) | 1991 m. vasario 24–28 d. | kampanija | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | „Corrupted Blood“ incidentas | 2005 m. rugsėjis | kampanija | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Žaidimų ir lygių dizainas (17) {#game-and-level-design-17}

| id | pavadinimas | modeliai | šaltiniai |
|---|---|---|---|
| `design.chokepoint` | Siauros vietos lygių dizaine | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Šoniniai maršrutai ir alternatyvūs keliai | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Matymo linijos ir kovos atstumas | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Priedangos išdėstymas ir ritmas | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Atsiradimo taškų dizainas ir apsauga juose | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Simetriškų ir nesimetriškų žemėlapių balansas | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Klasių balansas ir priešpriešos | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Srautas, kilpos ir aiškūs išdėstymai | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Žaidimų ekonomikos ir grįžtamojo ryšio kilpos | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Rungtynių parinkimas ir įgūdžių sklaida | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | Dirbtinio intelekto priešininkai kaip lygių tyrimo zondai | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Prasmingas žaidimas ir pasirinkimai | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Keitimasis ir komandinis žaidimas šaudyklėse | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Žemėlapio kontrolė | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Šilumos žemėlapiai ir erdvinė telemetrija dizaine | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Meistriškumas, mokymasis ir smagumas | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Raundų ekonomika ir pirkimo sprendimai | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Tyrimai (113) {#studies-113}

| id | pavadinimas | šaltiniai |
|---|---|---|
| `study.engel-1954` | Engelis: Lanchesterio kvadratinis dėsnis Ivodzimoje | Engel 1954 |
| `study.bracken-1995` | Brackenas: Lanchesterio modeliai Ardėnuose | Bracken 1995 |
| `study.fricker-1998` | Frickeris: nusidėvėjimo modeliai Ardėnuose iš naujo | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas ir Turkesas: Kurskas ir Ardėnai | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley ir Helmboldas: kvadratinio dėsnio patikrinimas | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | Žaidėjų mirčių GIS analizė | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | „Lighthouse“: konkurencinio elgesio vizualizavimas | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Veiksmų vertinimas „Counter-Strike“ | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Susitikimų aptikimas e. sporte | Schubert et al. 2016 |
| `study.red-baron` | Projektas „Red Baron“: oro kova virš Vietnamo | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: kiekybinis istorinių mūšių vertinimas | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: jėgų panaudojimas paaiškina rezultatus | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Apžvalga: žaidimo duomenų vizualizavimas | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willardas: Lanchesteris prieš tris šimtus metų sausumos mūšių | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fainas: šešiasdešimt Antrojo pasaulinio karo susirėmimų | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weissas: kovos modeliai ir JAV pilietinis karas | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: nusidėvėjimo duomenų statistinis modelis | Hartley 1995 |
| `study.helmbold-1995` | Helmboldas: pažangos greičiai sausumos kovoje | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas ir Dinges: aplinkybės svarbiau nei dėsnis | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | Kursko duomenų bazė | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | Ardėnų kampanijos duomenų bazė | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnsonas ir MacKay: Didžiosios Britanijos mūšis kaip Lanchesterio duomenys | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte ir Schmidtas: skaičiai vis dar laimi mūšius | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: mūšių nuostolių dėsningumai | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Dupuy taktinis skaitinis determinuotas modelis | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: karas skaičiais | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveldas: kovinė galia | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiteris ir Stamas: demokratijos karuose | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epšteinas: adaptyvusis dinaminis modelis | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchmanas: Lanchesteris ir partizaninis karas | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrongas: stochastinis salvių modelis | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughesas: laivyno taktikos pagrindai | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | 3:1 taisyklės diskusija | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kressas: ginkluotų konfliktų modeliavimas | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Ault ataskaita: raketos paleistos už savo ribų | Ault 1969; Michel 1997 |
| `study.gwaps` | „Gulf War Air Power Survey“ (Persijos įlankos karo oro galios apžvalga) | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Blackett'o cirkas | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Gylio bombų nustatymai Pakrančių komandoje | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Baltos apatinės dalys priešpovandeniniams orlaiviams | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Waldas: šarvai ten, kur nebuvo pataikyta į grįžusius bombonešius | Mangel & Samaniego 1984 |
| `study.optimal-search` | Optimali paieška: nuo povandeninių laivų iki AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glennas: kova pragare | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Prieigos draudimas ir zonos uždarymas | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Kaip žaidėjai praranda susidomėjimą | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Žaidėjų elgesio grupavimas natūraliomis sąlygomis | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Žaidėjų nusivylimo aptikimas | Canossa et al. 2011 |
| `study.medler-2011` | „Data Cracker“: telemetrijos suvestinės gamyboje | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: žaidimo vizualinė analitika | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Avataro judėjimas „World of Warcraft“ kovos zonose | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: vartotojų testų instrumentavimas dideliu mastu | Kim et al. 2008 |
| `study.game-data-science` | Žaidimų duomenų mokslas | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Dirbtinis intelektas ir žaidimai | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Įgūdžiai ir komandos judėjimas „Dota 2“ | Drachen et al. 2014 |
| `study.yang-2014` | Kovos modeliai, prognozuojantys MOBA pergales | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Žaidėjų vaidmenys „Dota 2“ | Eggert et al. 2015 |
| `study.semenov-2017` | „Dota 2“ rezultatų prognozavimas pagal pasirinkimus | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Tiesioginė pergalės prognozė profesionaliame e. sporte | Hodge et al. 2021 |
| `study.rioult-2014` | Žaidėjų pozicijų topologija | Rioult et al. 2014 |
| `study.bednarek-2017` | Žaidėjų vertinimas komandiniuose šaudyklėse | Bednárek et al. 2017 |
| `study.katona-2019` | Kas mirs kitas: prognozavimas | Katona et al. 2019 |
| `study.block-2018` | Duomenimis paremti pasakojimai e. sporto auditorijai | Block et al. 2018 |
| `study.ggviz` | ggViz: žaidimo būsenų paieška dideliu mastu | Xenopoulos et al. 2022 |
| `study.openai-five` | „OpenAI Five“: didelio masto stiprinamasis mokymasis „Dota 2“ | Berner et al. 2019 |
| `study.alphastar` | „AlphaStar“: grandmasterio lygis „StarCraft II“ | Vinyals et al. 2019 |
| `study.cervone-2016` | Tikėtina valdymo vertė krepšinyje | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: kamuoliu atliekamų veiksmų vertinimas futbole | Decroos et al. 2019 |
| `study.pitch-control` | Aikštės kontrolė ir erdvės kūrimas | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | Gynybos įgūdžių erdvinė struktūra | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Komandos vaidmenys iš judėjimo sekimo duomenų | Lucey et al. 2013 |
| `study.shot-quality` | Tikėtini įvarčiai ir smūgio kokybė | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: erdvinis šaudymo efektyvumas | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Komandinių sporto šakų erdvinė-laikinė analizė | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Ripley K: grupavimas visuose mastuose | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clarkas ir Evansas: artimiausio kaimyno išsisklaidymas | Clark & Evans 1954 |
| `study.getis-ord` | Getis-Ordo karštieji taškai | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Vietiniai erdvinės asociacijos rodikliai | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | Erdvinė skenavimo statistika | Kulldorff 1997 |
| `study.kde` | Branduolio tankio įvertinimas | Silverman 1986 |
| `study.knox-1964` | Erdvės ir laiko sąveika | Knox 1964; Diggle 2013 |
| `study.maup` | Modifikuojamo ploto vienetų problema | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Izovistos ir matomumo grafai | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Erdvės sintaksė | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Vidutinis sutankėjimas | Lloyd 1967 |
| `study.survival-analysis` | Išgyvenimo analizė laikui iki mirties | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Apibendrintieji tiesiniai modeliai skaičiams | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap ir intervalų įvertinimai | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey ir kt.: delsa ir žvilgsnio žaidėjo pranašumas | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee ir Changas: šūvis aplink kampą | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypoolas: delsa ir žaidėjų veiksmai | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos ir kt.: profesionalai ir mėgėjai pagal laimėjimo tikimybę | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos ir kt.: ekonominiai sprendimai „Counter-Strike“ | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: protingi žudymai ir bevertės mirtys | Maymin 2021 |
| `study.moba-live-prediction` | Tiesioginė MOBA rezultatų prognozė | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa ir kt.: „Valorant“ raundai pagal taktines savybes | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv ir kt.: vaidmenys profesionaliame „Counter-Strike 2“ | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim ir kt.: artimojo mūšio mokymas | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Minios turbulencija 2006 m. hadžo metu | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Ėjimo grupės formuoja minias | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Hierarchinė grupių dinamika balandžių būriuose | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Socialinė įtaka daro sėkmę nelygią ir nenuspėjamą | Salganik et al. 2006 |
| `study.wisdom-undermined` | Socialinė įtaka silpnina minios išmintį | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | Minios traukos galia | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Konformizmas prieš vienbalsę daugumą | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Kodėl jie kovoja: kovinė motyvacija Irake | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Sanglauda ir rezultatas: metaanalizės | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Nuostolių vengimas tarp profesionalių golfininkų | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Karšta ranka beisbole | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Baudiniai: profesionalai žaidžia minimax | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Minimax žaidimas Vimbldone | Walker & Wooders 2001 |
| `study.collective-intelligence` | Komandų kolektyvinis intelektas | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Internetinio pasaulio socialiniai tinklai | Szell et al. 2010 |
| `study.team-networks` | Perdavimų tinklai ir komandos rezultatas | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Elgesys plinta grupuotais tinklais | Centola 2010 |

### Bibliografija {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(patikrinta 2026-11-15: išsamiai)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(patikrinta 2026-11-15: išsamiai)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(patikrinta 2026-11-15: išsamiai)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(patikrinta 2026-11-15: išsamiai)*
- Ammianus Marcellinus (vert. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(patikrinta 2026-11-15: išsamiai)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(patikrinta 2026-11-15: išsamiai)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(patikrinta 2026-11-15: išsamiai)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(patikrinta 2026-11-15: išsamiai)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Ardant du Picq, C. (vert. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(patikrinta 2026-11-15: išsamiai)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(patikrinta 2026-11-15: išsamiai)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Arrian (vert. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(patikrinta 2026-11-15: išsamiai)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(patikrinta 2026-11-15: išsamiai)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(patikrinta 2026-11-15: išsamiai)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(patikrinta 2026-11-15: išsamiai)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(patikrinta 2026-11-15: išsamiai)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(patikrinta 2026-11-15: išsamiai)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(patikrinta 2026-11-15: išsamiai)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(patikrinta 2026-11-15: išsamiai)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(patikrinta 2026-11-15: išsamiai)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(patikrinta 2026-11-15: išsamiai)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(patikrinta 2026-11-15: išsamiai)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(patikrinta 2026-11-15: išsamiai)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(patikrinta 2026-11-15: išsamiai)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(patikrinta 2026-11-15: išsamiai)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(patikrinta 2026-11-15: išsamiai)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(patikrinta 2026-11-15: išsamiai)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(patikrinta 2026-11-15: išsamiai)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(patikrinta 2026-11-15: egzistavimas)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(patikrinta 2026-11-15: išsamiai)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(patikrinta 2026-11-15: išsamiai)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(patikrinta 2026-11-15: išsamiai)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(patikrinta 2026-11-15: išsamiai)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(patikrinta 2026-11-15: išsamiai)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(patikrinta 2026-11-15: išsamiai)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(patikrinta 2026-11-15: egzistavimas)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(patikrinta 2026-11-15: išsamiai)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(patikrinta 2026-11-15: išsamiai)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(patikrinta 2026-11-15: išsamiai)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(patikrinta 2026-11-15: išsamiai)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(patikrinta 2026-11-15: išsamiai)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(patikrinta 2026-11-15: išsamiai)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(patikrinta 2026-11-15: egzistavimas)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(patikrinta 2026-11-15: išsamiai)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(patikrinta 2026-11-15: išsamiai)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(patikrinta 2026-11-15: išsamiai)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(patikrinta 2026-11-15: išsamiai)*
- Boyd, J. R. (1986). Patterns of Conflict (pranešimas). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(patikrinta 2026-11-15: egzistavimas)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(patikrinta 2026-11-15: išsamiai)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(patikrinta 2026-11-15: išsamiai)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(patikrinta 2026-11-15: išsamiai)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(patikrinta 2026-11-15: išsamiai)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(patikrinta 2026-11-15: egzistavimas)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(patikrinta 2026-11-15: išsamiai)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(patikrinta 2026-11-15: išsamiai)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(patikrinta 2026-11-15: išsamiai)*
- Caesar, G. J. (vert. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(patikrinta 2026-11-15: išsamiai)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(patikrinta 2026-11-15: išsamiai)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(patikrinta 2026-11-15: išsamiai)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(patikrinta 2026-11-15: išsamiai)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(patikrinta 2026-11-15: išsamiai)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(patikrinta 2026-11-15: išsamiai)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(patikrinta 2026-11-15: išsamiai)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(patikrinta 2026-11-15: išsamiai)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(patikrinta 2026-11-15: išsamiai)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(patikrinta 2026-11-15: išsamiai)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(patikrinta 2026-11-15: išsamiai)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(patikrinta 2026-11-15: išsamiai)*
- Clausewitz, C. von (vert. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(patikrinta 2026-11-15: išsamiai)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(patikrinta 2026-11-15: išsamiai)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(patikrinta 2026-11-15: išsamiai)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(patikrinta 2026-11-15: išsamiai)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(patikrinta 2026-11-15: išsamiai)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(patikrinta 2026-11-15: išsamiai)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(patikrinta 2026-11-15: išsamiai)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(patikrinta 2026-11-15: egzistavimas)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(patikrinta 2026-11-15: išsamiai)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(patikrinta 2026-11-15: išsamiai)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(patikrinta 2026-11-15: išsamiai)*
- Craven, W. F.; Cate, J. L. (red.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(patikrinta 2026-11-15: egzistavimas)*
- Craven, W. F.; Cate, J. L. (red.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(patikrinta 2026-11-15: egzistavimas)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(patikrinta 2026-11-15: išsamiai)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(patikrinta 2026-11-15: išsamiai)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(patikrinta 2026-11-15: išsamiai)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(patikrinta 2026-11-15: egzistavimas)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(patikrinta 2026-11-15: išsamiai)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(patikrinta 2026-11-15: išsamiai)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(patikrinta 2026-11-15: išsamiai)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(patikrinta 2026-11-15: išsamiai)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(patikrinta 2026-11-15: išsamiai)*
- Delbrück, H. (vert. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(patikrinta 2026-11-15: egzistavimas)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(patikrinta 2026-11-15: išsamiai)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3 leid.). CRC Press, Boca Raton. *(patikrinta 2026-11-15: išsamiai)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(patikrinta 2026-11-15: išsamiai)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(patikrinta 2026-11-15: išsamiai)*
- Douhet, G. (vert. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; perleista Office of Air Force History 1983. *(patikrinta 2026-11-15: išsamiai)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(patikrinta 2026-11-15: išsamiai)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(patikrinta 2026-11-15: išsamiai)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(patikrinta 2026-11-15: išsamiai)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(patikrinta 2026-11-15: egzistavimas)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(patikrinta 2026-11-15: išsamiai)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(patikrinta 2026-11-15: išsamiai)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(patikrinta 2026-11-15: išsamiai)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(patikrinta 2026-11-15: išsamiai)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(patikrinta 2026-11-15: išsamiai)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(patikrinta 2026-11-15: išsamiai)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(patikrinta 2026-11-15: išsamiai)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(patikrinta 2026-11-15: išsamiai)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(patikrinta 2026-11-15: išsamiai)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(patikrinta 2026-11-15: egzistavimas)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(patikrinta 2026-11-15: išsamiai)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(patikrinta 2026-11-15: išsamiai)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(patikrinta 2026-11-15: išsamiai)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(patikrinta 2026-11-15: išsamiai)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(patikrinta 2026-11-15: išsamiai)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(patikrinta 2026-11-15: išsamiai)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(patikrinta 2026-11-15: išsamiai)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(patikrinta 2026-11-15: išsamiai)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(patikrinta 2026-11-15: išsamiai)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(patikrinta 2026-11-15: išsamiai)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(patikrinta 2026-11-15: išsamiai)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(patikrinta 2026-11-15: išsamiai)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(patikrinta 2026-11-15: išsamiai)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(patikrinta 2026-11-15: išsamiai)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(patikrinta 2026-11-15: išsamiai)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(patikrinta 2026-11-15: išsamiai)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(patikrinta 2026-11-15: išsamiai)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(patikrinta 2026-11-15: išsamiai)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(patikrinta 2026-11-15: išsamiai)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(patikrinta 2026-11-15: egzistavimas)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(patikrinta 2026-11-15: išsamiai)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(patikrinta 2026-11-15: išsamiai)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(patikrinta 2026-11-15: išsamiai)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(patikrinta 2026-11-15: išsamiai)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(patikrinta 2026-11-15: išsamiai)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(patikrinta 2026-11-15: išsamiai)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(patikrinta 2026-11-15: išsamiai)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2 leid.). Morgan Kaufmann, Burlington. *(patikrinta 2026-11-15: išsamiai)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (pataisytas leid.). Office of Air Force History, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(patikrinta 2026-11-15: išsamiai)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(patikrinta 2026-11-15: išsamiai)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(patikrinta 2026-11-15: išsamiai)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(patikrinta 2026-11-15: išsamiai)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(patikrinta 2026-11-15: išsamiai)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(patikrinta 2026-11-15: išsamiai)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(patikrinta 2026-11-15: išsamiai)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(patikrinta 2026-11-15: išsamiai)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(patikrinta 2026-11-15: išsamiai)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(patikrinta 2026-11-15: išsamiai)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(patikrinta 2026-11-15: išsamiai)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(patikrinta 2026-11-15: išsamiai)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(patikrinta 2026-11-15: išsamiai)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(patikrinta 2026-11-15: išsamiai)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(patikrinta 2026-11-15: išsamiai)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(patikrinta 2026-11-15: išsamiai)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(patikrinta 2026-11-15: išsamiai)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(patikrinta 2026-11-15: išsamiai)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(patikrinta 2026-11-15: išsamiai)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(patikrinta 2026-11-15: išsamiai)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(patikrinta 2026-11-15: išsamiai)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Grau, L. W. (red.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(patikrinta 2026-11-15: išsamiai)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(patikrinta 2026-11-15: išsamiai)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(patikrinta 2026-11-15: išsamiai)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(patikrinta 2026-11-15: išsamiai)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(patikrinta 2026-11-15: išsamiai)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(patikrinta 2026-11-15: išsamiai)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(patikrinta 2026-11-15: išsamiai)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(patikrinta 2026-11-15: išsamiai)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(patikrinta 2026-11-15: išsamiai)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(patikrinta 2026-11-15: išsamiai)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(patikrinta 2026-11-15: išsamiai)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(patikrinta 2026-11-15: išsamiai)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(patikrinta 2026-11-15: išsamiai)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(patikrinta 2026-11-15: išsamiai)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(patikrinta 2026-11-15: išsamiai)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(patikrinta 2026-11-15: išsamiai)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(patikrinta 2026-11-15: išsamiai)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(patikrinta 2026-11-15: išsamiai)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(patikrinta 2026-11-15: išsamiai)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(patikrinta 2026-11-15: išsamiai)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(patikrinta 2026-11-15: išsamiai)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(patikrinta 2026-11-15: išsamiai)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(patikrinta 2026-11-15: išsamiai)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(patikrinta 2026-11-15: išsamiai)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(patikrinta 2026-11-15: išsamiai)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(patikrinta 2026-11-15: išsamiai)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(patikrinta 2026-11-15: išsamiai)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(patikrinta 2026-11-15: išsamiai)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(patikrinta 2026-11-15: išsamiai)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(patikrinta 2026-11-15: egzistavimas)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Herodotus (vert. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(patikrinta 2026-11-15: išsamiai)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(patikrinta 2026-11-15: išsamiai)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(patikrinta 2026-11-15: išsamiai)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(patikrinta 2026-11-15: išsamiai)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(patikrinta 2026-11-15: išsamiai)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(patikrinta 2026-11-15: išsamiai)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(patikrinta 2026-11-15: išsamiai)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(patikrinta 2026-11-15: išsamiai)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(patikrinta 2026-11-15: išsamiai)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(patikrinta 2026-11-15: išsamiai)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(patikrinta 2026-11-15: išsamiai)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(patikrinta 2026-11-15: išsamiai)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(patikrinta 2026-11-15: išsamiai)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2 leid.). Naval Institute Press, Annapolis. *(patikrinta 2026-11-15: išsamiai)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3 leid.). Naval Institute Press, Annapolis. *(patikrinta 2026-11-15: išsamiai)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(patikrinta 2026-11-15: išsamiai)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(patikrinta 2026-11-15: išsamiai)*
- Isserson, G. S. (vert. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(patikrinta 2026-11-15: išsamiai)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(patikrinta 2026-11-15: išsamiai)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Jomini, A.-H. de (vert. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(patikrinta 2026-11-15: išsamiai)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(patikrinta 2026-11-15: išsamiai)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(patikrinta 2026-11-15: išsamiai)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(patikrinta 2026-11-15: išsamiai)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(patikrinta 2026-11-15: išsamiai)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(patikrinta 2026-11-15: egzistavimas)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(patikrinta 2026-11-15: išsamiai)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(patikrinta 2026-11-15: išsamiai)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(patikrinta 2026-11-15: išsamiai)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(patikrinta 2026-11-15: išsamiai)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(patikrinta 2026-11-15: išsamiai)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(patikrinta 2026-11-15: išsamiai)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(patikrinta 2026-11-15: išsamiai)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(patikrinta 2026-11-15: išsamiai)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(patikrinta 2026-11-15: išsamiai)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(patikrinta 2026-11-15: išsamiai)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(patikrinta 2026-11-15: išsamiai)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(patikrinta 2026-11-15: išsamiai)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(patikrinta 2026-11-15: išsamiai)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(patikrinta 2026-11-15: egzistavimas)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(patikrinta 2026-11-15: išsamiai)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(patikrinta 2026-11-15: išsamiai)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(patikrinta 2026-11-15: išsamiai)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(patikrinta 2026-11-15: išsamiai)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(patikrinta 2026-11-15: išsamiai)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(patikrinta 2026-11-15: išsamiai)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(patikrinta 2026-11-15: išsamiai)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(patikrinta 2026-11-15: išsamiai)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(patikrinta 2026-11-15: išsamiai)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(patikrinta 2026-11-15: išsamiai)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(patikrinta 2026-11-15: egzistavimas)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(patikrinta 2026-11-15: išsamiai)*
- Livy (vert. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(patikrinta 2026-11-15: išsamiai)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(patikrinta 2026-11-15: išsamiai)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(patikrinta 2026-11-15: išsamiai)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(patikrinta 2026-11-15: išsamiai)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(patikrinta 2026-11-15: egzistavimas)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(patikrinta 2026-11-15: išsamiai)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(patikrinta 2026-11-15: išsamiai)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(patikrinta 2026-11-15: išsamiai)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(patikrinta 2026-11-15: išsamiai)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(patikrinta 2026-11-15: išsamiai)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(patikrinta 2026-11-15: išsamiai)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(patikrinta 2026-11-15: išsamiai)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(patikrinta 2026-11-15: egzistavimas)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(patikrinta 2026-11-15: išsamiai)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(patikrinta 2026-11-15: išsamiai)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(patikrinta 2026-11-15: išsamiai)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(patikrinta 2026-11-15: išsamiai)*
- Mao Tse-tung (vert. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(patikrinta 2026-11-15: egzistavimas)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(patikrinta 2026-11-15: išsamiai)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(patikrinta 2026-11-15: išsamiai)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(patikrinta 2026-11-15: išsamiai)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(patikrinta 2026-11-15: išsamiai)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(patikrinta 2026-11-15: išsamiai)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(patikrinta 2026-11-15: išsamiai)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(patikrinta 2026-11-15: išsamiai)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2 leid.). Chapman & Hall, London. *(patikrinta 2026-11-15: išsamiai)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(patikrinta 2026-11-15: išsamiai)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(patikrinta 2026-11-15: išsamiai)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(patikrinta 2026-11-15: egzistavimas)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(patikrinta 2026-11-15: išsamiai)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(patikrinta 2026-11-15: išsamiai)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(patikrinta 2026-11-15: išsamiai)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(patikrinta 2026-11-15: išsamiai)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(patikrinta 2026-11-15: išsamiai)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(patikrinta 2026-11-15: išsamiai)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(patikrinta 2026-11-15: išsamiai)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(patikrinta 2026-11-15: išsamiai)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(patikrinta 2026-11-15: išsamiai)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(patikrinta 2026-11-15: išsamiai)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(patikrinta 2026-11-15: išsamiai)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(patikrinta 2026-11-15: egzistavimas)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(patikrinta 2026-11-15: egzistavimas)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(patikrinta 2026-11-15: išsamiai)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(patikrinta 2026-11-15: išsamiai)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(patikrinta 2026-11-15: išsamiai)*
- Morillo, S. (red.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(patikrinta 2026-11-15: išsamiai)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(patikrinta 2026-11-15: išsamiai)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(patikrinta 2026-11-15: egzistavimas)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(patikrinta 2026-11-15: egzistavimas)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(patikrinta 2026-11-15: išsamiai)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(patikrinta 2026-11-15: išsamiai)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(patikrinta 2026-11-15: egzistavimas)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(patikrinta 2026-11-15: išsamiai)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(patikrinta 2026-11-15: išsamiai)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(patikrinta 2026-11-15: išsamiai)*
- Mueller, K. P. (red.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(patikrinta 2026-11-15: išsamiai)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(patikrinta 2026-11-15: išsamiai)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(patikrinta 2026-11-15: išsamiai)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(patikrinta 2026-11-15: išsamiai)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(patikrinta 2026-11-15: išsamiai)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(patikrinta 2026-11-15: išsamiai)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(patikrinta 2026-11-15: išsamiai)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(patikrinta 2026-11-15: išsamiai)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(patikrinta 2026-11-15: išsamiai)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(patikrinta 2026-11-15: išsamiai)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(patikrinta 2026-11-15: išsamiai)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(patikrinta 2026-11-15: egzistavimas)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(patikrinta 2026-11-15: išsamiai)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(patikrinta 2026-11-15: išsamiai)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(patikrinta 2026-11-15: išsamiai)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(patikrinta 2026-11-15: išsamiai)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(patikrinta 2026-11-15: išsamiai)*
- Osipov, M. (vert. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(patikrinta 2026-11-15: išsamiai)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(patikrinta 2026-11-15: išsamiai)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(patikrinta 2026-11-15: išsamiai)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(patikrinta 2026-11-15: išsamiai)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(patikrinta 2026-11-15: išsamiai)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(patikrinta 2026-11-15: išsamiai)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(patikrinta 2026-11-15: išsamiai)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(patikrinta 2026-11-15: išsamiai)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(patikrinta 2026-11-15: išsamiai)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(patikrinta 2026-11-15: išsamiai)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(patikrinta 2026-11-15: išsamiai)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(patikrinta 2026-11-15: išsamiai)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(patikrinta 2026-11-15: išsamiai)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(patikrinta 2026-11-15: išsamiai)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(patikrinta 2026-11-15: išsamiai)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(patikrinta 2026-11-15: išsamiai)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(patikrinta 2026-11-15: išsamiai)*
- Plutarch (vert. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(patikrinta 2026-11-15: išsamiai)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(patikrinta 2026-11-15: išsamiai)*
- Polybius (vert. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(patikrinta 2026-11-15: išsamiai)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(patikrinta 2026-11-15: išsamiai)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(patikrinta 2026-11-15: išsamiai)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(patikrinta 2026-11-15: išsamiai)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(patikrinta 2026-11-15: išsamiai)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(patikrinta 2026-11-15: išsamiai)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(patikrinta 2026-11-15: išsamiai)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(patikrinta 2026-11-15: išsamiai)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(patikrinta 2026-11-15: išsamiai)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(patikrinta 2026-11-15: išsamiai)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(patikrinta 2026-11-15: išsamiai)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(patikrinta 2026-11-15: išsamiai)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(patikrinta 2026-11-15: išsamiai)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(patikrinta 2026-11-15: išsamiai)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(patikrinta 2026-11-15: išsamiai)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(patikrinta 2026-11-15: išsamiai)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(patikrinta 2026-11-15: išsamiai)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(patikrinta 2026-11-15: išsamiai)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(patikrinta 2026-11-15: išsamiai)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(patikrinta 2026-11-15: išsamiai)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(patikrinta 2026-11-15: išsamiai)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(patikrinta 2026-11-15: egzistavimas)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(patikrinta 2026-11-15: egzistavimas)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(patikrinta 2026-11-15: egzistavimas)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(patikrinta 2026-11-15: egzistavimas)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(patikrinta 2026-11-15: išsamiai)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(patikrinta 2026-11-15: išsamiai)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(patikrinta 2026-11-15: išsamiai)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(patikrinta 2026-11-15: išsamiai)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(patikrinta 2026-11-15: išsamiai)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(patikrinta 2026-11-15: išsamiai)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(patikrinta 2026-11-15: išsamiai)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(patikrinta 2026-11-15: išsamiai)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(patikrinta 2026-11-15: egzistavimas)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(patikrinta 2026-11-15: išsamiai)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(patikrinta 2026-11-15: išsamiai)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (red.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(patikrinta 2026-11-15: išsamiai)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(patikrinta 2026-11-15: išsamiai)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(patikrinta 2026-11-15: egzistavimas)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(patikrinta 2026-11-15: išsamiai)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(patikrinta 2026-11-15: egzistavimas)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(patikrinta 2026-11-15: išsamiai)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(patikrinta 2026-11-15: išsamiai)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(patikrinta 2026-11-15: išsamiai)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(patikrinta 2026-11-15: išsamiai)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(patikrinta 2026-11-15: išsamiai)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(patikrinta 2026-11-15: egzistavimas)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(patikrinta 2026-11-15: išsamiai)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(patikrinta 2026-11-15: išsamiai)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(patikrinta 2026-11-15: išsamiai)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(patikrinta 2026-11-15: išsamiai)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(patikrinta 2026-11-15: išsamiai)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(patikrinta 2026-11-15: išsamiai)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(patikrinta 2026-11-15: išsamiai)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(patikrinta 2026-11-15: išsamiai)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(patikrinta 2026-11-15: išsamiai)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(patikrinta 2026-11-15: išsamiai)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(patikrinta 2026-11-15: išsamiai)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(patikrinta 2026-11-15: egzistavimas)*
- Sun Tzu (vert. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(patikrinta 2026-11-15: išsamiai)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(patikrinta 2026-11-15: išsamiai)*
- Tacitus (vert. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(patikrinta 2026-11-15: išsamiai)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(patikrinta 2026-11-15: išsamiai)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(patikrinta 2026-11-15: išsamiai)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(patikrinta 2026-11-15: išsamiai)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(patikrinta 2026-11-15: išsamiai)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(patikrinta 2026-11-15: išsamiai)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(patikrinta 2026-11-15: išsamiai)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(patikrinta 2026-11-15: išsamiai)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2 leid.). CRC Press, Boca Raton. *(patikrinta 2026-11-15: išsamiai)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(patikrinta 2026-11-15: išsamiai)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(patikrinta 2026-11-15: išsamiai)*
- Triandafillov, V. K. (vert. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(patikrinta 2026-11-15: išsamiai)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(patikrinta 2026-11-15: išsamiai)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(patikrinta 2026-11-15: išsamiai)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(patikrinta 2026-11-15: išsamiai)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(patikrinta 2026-11-15: išsamiai)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(patikrinta 2026-11-15: išsamiai)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(patikrinta 2026-11-15: išsamiai)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(patikrinta 2026-11-15: egzistavimas)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(patikrinta 2026-11-15: išsamiai)*
- Vegetius (vert. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(viešas domenas)* *(patikrinta 2026-11-15: egzistavimas)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(patikrinta 2026-11-15: išsamiai)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(patikrinta 2026-11-15: išsamiai)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(patikrinta 2026-11-15: išsamiai)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(patikrinta 2026-11-15: išsamiai)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(patikrinta 2026-11-15: išsamiai)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(patikrinta 2026-11-15: išsamiai)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(patikrinta 2026-11-15: išsamiai)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(patikrinta 2026-11-15: išsamiai)*
- Wallner, G. (red.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(patikrinta 2026-11-15: egzistavimas)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(patikrinta 2026-11-15: išsamiai)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(patikrinta 2026-11-15: egzistavimas)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(patikrinta 2026-11-15: egzistavimas)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(patikrinta 2026-11-15: išsamiai)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(patikrinta 2026-11-15: egzistavimas)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(patikrinta 2026-11-15: išsamiai)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(patikrinta 2026-11-15: išsamiai)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(patikrinta 2026-11-15: išsamiai)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(patikrinta 2026-11-15: išsamiai)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(patikrinta 2026-11-15: išsamiai)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(patikrinta 2026-11-15: išsamiai)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2 leid.). Air University Press, Maxwell AFB. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(patikrinta 2026-11-15: egzistavimas)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(patikrinta 2026-11-15: išsamiai)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(patikrinta 2026-11-15: išsamiai)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(patikrinta 2026-11-15: išsamiai)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(patikrinta 2026-11-15: išsamiai)*
- Xenophon (vert. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(viešas domenas)* *(patikrinta 2026-11-15: išsamiai)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(patikrinta 2026-11-15: išsamiai)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(patikrinta 2026-11-15: išsamiai)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(patikrinta 2026-11-15: išsamiai)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(patikrinta 2026-11-15: egzistavimas)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(patikrinta 2026-11-15: išsamiai)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(patikrinta 2026-11-15: egzistavimas)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(patikrinta 2026-11-15: egzistavimas)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(patikrinta 2026-11-15: išsamiai)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(patikrinta 2026-11-15: išsamiai)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(patikrinta 2026-11-15: išsamiai)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(patikrinta 2026-11-15: išsamiai)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(patikrinta 2026-11-15: išsamiai)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(patikrinta 2026-11-15: išsamiai)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(patikrinta 2026-11-15: išsamiai)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(patikrinta 2026-11-15: išsamiai)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(patikrinta 2026-11-15: išsamiai)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(patikrinta 2026-11-15: išsamiai)*

<!-- kb:end -->
