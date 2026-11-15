---
title: "Katalog znanja"
parent: "Leča znanja"
nav_order: 2
lang: "sl"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Katalog znanja

To je celoten seznam tega, kar [leča znanja](knowledge.md) pozna: vzorce, ki jih išče, ideje, metode, zgodovinske primere in študije, ki jih navaja, ter knjige in članke, na katerih temeljijo. Uporabite ga, da poiščete vnos po njegovi oznaki ali preverite vir.

Ta stran je ustvarjena iz baze znanja z `node tools/knowledge-doc.mjs`; ne urejajte med oznakama.

<!-- kb:begin -->

Baza znanja vsebuje 579 vnosov (135 konceptov, 37 metod, 277 zgodovinskih primerov, 17 načel oblikovanja, 113 študij) za 93 vzorcev in navaja 556 virov.

### Vzorci (93) {#patterns-93}

| id | družina | kako izgleda v podatkih |
|---|---|---|
| `concentration` | sila | Stran, ki na eno mesto pripelje več enot, zmaga tam z večjo prednostjo, kot bi jo dala sama številčnost. |
| `local-superiority` | sila | Uboji gredo na stran, ki je v dosegu boja številčnejša od druge, ne glede na skupna števila. |
| `attrition` | sila | Izgube sledijo moči obeh strani skozi čas; o boju odloči, kdo prej zmanjka. |
| `exchange-ratio` | sila | Število ubitih na izgubo se močno razlikuje glede na kraj, stran ali razred. |
| `aimed-fire` | sila | Izgube rastejo s številom sovražnikov, ne pa s svojim številom. |
| `area-fire` | sila | Izgube rastejo z zmnožkom števil obeh strani: gneča se kaznuje. |
| `defeat-in-detail` | sila | Stran je uničena po delih, ker njeni deli prihajajo posamezno. |
| `mutual-support` | sila | Izgubo hitro pokrije bližnji soigralec: sledi menjava. |
| `combined-arms` | sila | Razredi so dobri skupaj, kjer se pokrivajo s slabostmi drugih, sami pa slabi. |
| `class-counter` | sila | En razred nesorazmerno zmaga proti določenemu drugemu razredu ali na določenem mestu. |
| `initiative` | sila | Kdor prvi zadene v spopadu, ga običajno tudi dobi. |
| `key-terrain` | teren | Iste nekaj točk odločajo boje v tekmi za tekmo. |
| `fields-of-fire` | teren | Kraji, ki daleč vidijo čez teren, ki ga morajo drugi prečkati, dosegajo več ubojev. |
| `high-ground` | teren | Uboji se zgodijo z višine nad tlemi, na katerih stojijo žrtve. |
| `cover` | teren | Smrti na čas padejo tam, kjer geometrija blokira pogled in ogenj. |
| `open-ground` | teren | Smrti na čas naraščajo tam, kjer nič ne blokira pogleda in ognja. |
| `kill-zone` | teren | Smrti se zgostijo tam, kjer je gibanje prisiljeno skozi opazovan, z ognjem pokrit teren. |
| `chokepoint` | teren | Veliko prehodov se stisne skozi malo terena, z izgubami tam. |
| `reverse-slope` | teren | Varnost tik za grebenom ali zidom, zunaj neposrednega pogleda sovražnika. |
| `safe-ground` | teren | Kraj, kjer se čas porablja, a malo jih umre. |
| `obstacle` | teren | Poti se ovijajo okoli blokiranega terena v nekaj pasov. |
| `flank` | gibanje | Redko uporabljena pot vodi do več ubojev kot glavne poti. |
| `avenue-of-approach` | gibanje | Gibanje teče po nekaj pasovih med območji. |
| `mobility` | gibanje | Premikajoče se enote na čas umrejo manj (ali več) kot počasne ali negibne. |
| `static-exposure` | gibanje | Enote, ki stojijo na mestu, na čas umrejo več kot tiste, ki se premikajo. |
| `interior-lines` | gibanje | Stran s kratkimi potmi med svojimi boji premika moč hitreje kot druga. |
| `envelopment` | gibanje | Uboji prihajajo z več smeri na položaj ene strani. |
| `ambush` | gibanje | Enote, ki se gibljejo po poti, hitro umrejo zaradi sovražnikov, ki so že na položaju. |
| `spawn-pressure` | čas | Življenja hitro končajo po začetku na enem izhodišču. |
| `tempo` | čas | Hitrejša stran pride do boja in zadene, preden drugi zareagira. |
| `surprise` | čas | Izgube pridejo v rafalu, preden žrtve vrnejo ogenj. |
| `energy-advantage` | zrak | Ubijalci imajo več višine in hitrosti kot njihove žrtve. |
| `air-superiority` | zrak | Letala ene strani ubijejo večkrat več, kot jih izgubijo. |
| `sead` | zrak | Zračna obramba na tleh vzame veliko letal, dokler ni najdena in uničena. |
| `bvr` | zrak | Uboji se zgodijo na veliki razdalji, preden se žrtev lahko približa. |
| `fleet-salvo` | morje | Sila, ki prva zada udarec, malo izgubi; druga malo preživi, da bi odgovorila. |
| `scouting` | morje | Stran, ki drugo najde prva, izbere boj. |
| `urban-close` | mestno okolje | Kratke razdalje spopada, veliko smrti med gosto geometrijo, počasno čiščenje. |
| `vertical` | mestno okolje | Uboji z zgornjih nadstropij ali streh na ulice. |
| `skill-dispersion` | ljudje | Nekaj igralcev predstavlja velik delež ubojev ali smrti. |
| `ai-vs-player` | ljudje | Enote, ki jih vodi AI, na istem mestu uspevajo drugače kot igralci. |
| `balance` | oblikovanje | Strani, izhodišča ali razredi začnejo z neenakimi možnostmi. |
| `economy` | oblikovanje | Viri, zasluženi, plačani in izgubljeni, se zgostijo na nekaj mestih ali pri nekaj igralcih. |
| `flow` | oblikovanje | Kako se igralci gibljejo skozi raven: zanke, pasovi, slepe ulice. |
| `sightlines` | oblikovanje | Dolge vidne črte odločajo, kje se boji začnejo in kdo jih dobi. |
| `readability` | oblikovanje | Smrti, ki jih igralci ne morejo videti vnaprej: od zadaj, iz skrite smeri. |
| `formation` | gibanje | Enote ene strani se gibljejo skupaj v prepoznavni obliki: vrsta, kolona, klin, eshalon, kvadrat. |
| `frontal-assault` | gibanje | Skupina se zaleti v sovražnika naravnost v čelo njegove fronte. |
| `double-envelopment` | gibanje | Dve skupini udarita oba boka enega sovražnega telesa približno istočasno. |
| `encirclement` | gibanje | Sovražna skupina se znajde obkrožena z drugo stranjo z vseh strani in z malo izhodi. |
| `penetration` | gibanje | Skupina prodre skozi sovražno linijo, kjer sovražniki stojijo na obeh straneh. |
| `fire-and-maneuver` | gibanje | Del skupine se premika, medtem ko ostali stojijo in krijejo, vloge pa se izmenjujejo. |
| `feint` | gibanje | Majhna skupina privabi sovražnika na eno mesto; glavni napor udari kmalu drugje. |
| `withdrawal` | gibanje | Skupina v stiku se obrne stran in poveča razdaljo do sovražnika. |
| `pursuit` | gibanje | Skupina sledi sovražniku, ki se oddaljuje, ohranja ali zmanjšuje razdaljo. |
| `defence-in-depth` | teren | Branilci stojijo v več pasovih drug za drugim vzdolž sovražnikove osi napredovanja. |
| `screening` | gibanje | Majhen element se premakne precej pred svoje glavno telo in prvi sreča sovražnika. |
| `dispersion` | sila | Stran se sčasoma razprši; manj njenih enot deli isto mesto. |
| `missile-defence` | zrak | Letala pod grožnjo raket obrnejo grožnjo na stran ali rep: crank, notch, drag, pump. |
| `angles-fight` | zrak | Zračni boj na kratki razdalji pri nizki hitrosti in visoki hitrosti zavoja, bojuje se za položaj nosu, ne za energijo. |
| `cap` | zrak | Letala krožijo okoli stalne postaje minute in čakajo, da pride sovražnik. |
| `strike-package` | zrak | Letala različnih vlog letijo skupaj do cilja; nekatera napadajo tla, druga krijejo. |
| `line-of-battle` | morje | Ladje plujejo v koloni ena za drugo, da lahko vsi bokovi streljajo. |
| `crossing-the-t` | morje | Kolona gre čez glavo sovražne kolone: vsi njeni topovi streljajo, malo sovražnih. |
| `fatal-funnel` | mestno okolje | Igralci, ki vstopijo skozi ena vrata, sobo ali ozko mesto, tam v trenutku umrejo bistveno pogosteje kot drugje. |
| `crossfire` | sila | Branilci, katerih strelne črte se sekajo pod različnimi koti, zmagajo v več dvobojih kot en sam branilec. |
| `peeker-advantage` | čas | Igralec, ki stopi v pogled, zmaga v dvobojih proti tistemu, ki drži kot, pogosteje (ali redkeje) kot v polovici primerov. |
| `entry` | čas | Prvi uboj v rundi odloči velik del runde; vstopi zmagajo ali izgubijo glede na mesto in podporo. |
| `utility-support` | sila | Bliskavica ali dim tik pred dvobojem spremenita, kdo ga dobi. |
| `man-advantage` | sila | Runde dobi stran z več živimi igralci; nekatere strani prednost pretvorijo ali zapravijo. |
| `clutch` | ljudje | Zadnji živi igralci zmagajo pogosteje (ali redkeje), kot napove stanje runde. |
| `action-value` | ljudje | Uboji, menjave, postavitve in pripomočki se razlikujejo po tem, koliko spremenijo možnost za zmago. |
| `lurk` | gibanje | Igralec sam daleč od ekipe ubija (ali umira) po drugačni stopnji kot krdelo. |
| `rotation` | gibanje | Hitrost, s katero stran premakne igralce na boj ali cilj, odloča, ali se drži ali ponovno zavzame. |
| `collective-order` | ljudje | Premikajoče se enote ene strani gredo v isto smer veliko pogosteje, kot bi naključno pričakovali glede na njihove lastne poti, premaknjene v času. |
| `milling` | ljudje | Enote ene strani krožijo okoli skupnega središča: vrtenje brez neto premika. |
| `herding` | ljudje | Enote zapustijo mesto tako, kot ga je prej zapustil soigralec, onkraj lastnih možnosti tega mesta in onkraj kopiranja sovražnika. |
| `lane-formation` | ljudje | Nasprotni tokovi ostajajo na ločenih pasovih; gibanje se zgosti na nekaj poteh, ki se uporabljajo tekma za tekmo. |
| `crowding` | ljudje | Hitrost in tok padata, ko se enote zgostijo; skozi ozko grlo močnejše potiskanje spravi skozenj manj enot. |
| `leadership` | ljudje | Nekatere enote se obrnejo prve, druge pa nekaj sekund kasneje kopirajo njihovo smer. |
| `cohesion` | ljudje | Enote, ki se oddaljijo od svoje skupine, umrejo pogosteje kot tiste, ki ostanejo z njo. |
| `breaking-point` | ljudje | Stran, ki je izgubila del svoje moči, neha zapirati razdaljo in se umakne, onkraj tega, kar pojasni njena razdalja do sovražnika. |
| `panic` | ljudje | Pod nenadno grožnjo se enote razpršijo, zbežijo ali zamrznejo, koordinacija pa razpade. |
| `loss-chasing` | ljudje | Po izgubi enote tvegajo več (ali manj) kot po pridobitvi. |
| `hot-hand` | ljudje | Uspeh sledi uspehu pogosteje, kot bi dopuščala premešana zaporedja istega igralca. |
| `conformity` | ljudje | Člani ene strani izbirajo podobno - nakupe, opremo, poti - onkraj lastnih nagnjenj. |
| `suppression` | ljudje | Dohodni ogenj spremeni, kako se enote gibljejo in streljajo, tudi če ne ubije. |
| `social-loafing` | ljudje | Akcija na glavo pada, ko je prisotnih več soigralcev. |
| `mixed-strategy` | ljudje | Izbire, ki bi morale biti nepredvidljive, postanejo vzorčne: ena možnost zmaga pogosteje ali izbire tečejo v zaporedjih. |
| `coordination` | ljudje | Člani delujejo usklajeno brez vidnih ukazov: sinhronizirano gibanje, časovanje in izbire. |
| `contagion` | ljudje | Stanje se prenaša z enote na enoto s stikom ali bližino in se širi po zemljevidu. |
| `territoriality` | ljudje | Enote ohranjajo razdaljo med seboj in se držijo svojega ozemlja. |
| `interaction-network` | ljudje | Kdo se bori, podpira in sledi komu, tvori mrežo z vozlišči, skupinami in mostovi. |

### Koncepti (135) {#concepts-135}

| id | naslov | leče | vzorci | viri |
|---|---|---|---|---|
| `concept.lanchester-square` | Lanchesterjev kvadratni zakon (ciljani ogenj) | vojaška, zračna, pomorska, e-šport | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Lanchesterjev linearni zakon (ogenj na območje, en proti enemu) | vojaška, mestna, e-šport | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Koncentracija sile (masa) | vojaška, zračna, pomorska, e-šport | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Razmerja sil in pravilo 3:1 | vojaška | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Razmerje izmenjave izgub | vojaška, zračna, e-šport, oblikovanje | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Bojna moč in njeni množitelji | vojaška | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Sodobni sistem uporabe sil | vojaška | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | Zanka OODA (opazuj-orientiraj-odloči-deluj) | vojaška, zračna, e-šport | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Teorija energijske manevrirnosti | zračna | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Osnovni manevri lovcev in zračno manevriranje v boju | zračna | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Analiza terena: OAKOC / KOCOA | vojaška, oblikovanje, mestna | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: spremenljivke naloge | vojaška | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Ključni in odločilni teren | vojaška, oblikovanje, e-šport | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Opazovanje in strelna polja | vojaška, oblikovanje, e-šport, mestna | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Kritje in prikritje | vojaška, mestna, oblikovanje | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Prihodne osi in koridorji gibanja | vojaška, oblikovanje | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Ozka grla in soteske | vojaška, oblikovanje, e-šport | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Območja spopada in območja smrti | vojaška, mestna, oblikovanje | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Obramba na zadnji strani pobočja in zakritje | vojaška, oblikovanje | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Višina | vojaška, oblikovanje | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Notranje in zunanje črte | vojaška | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Poraz po delih | vojaška, e-šport | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Medsebojna podpora | vojaška, zračna, e-šport | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Združeno orožje | vojaška, oblikovanje | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Zatiranje z ognjem | vojaška, mestna | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Zatiranje in uničenje sovražne zračne obrambe (SEAD/DEAD) | zračna, vojaška | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Bojno zračno patruljiranje in zračna premoč | zračna | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Spopad onkraj vidne razdalje | zračna | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Posredni pristop | vojaška, e-šport, oblikovanje | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Obhod in obkolitev | vojaška | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Zaseda | vojaška, e-šport, oblikovanje | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Obramba v globino | vojaška | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Trenje in megla vojne | vojaška, e-šport | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Vrhunec napada | vojaška | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Presenečenje | vojaška, zračna, pomorska, e-šport | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Ekonomija sil | vojaška, e-šport | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Mestni teren | mestna, vojaška, e-šport | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Nadzor nad morjem in odločilna flotna bitka | pomorska | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Hughesov model salve: napad najprej, učinkovito | pomorska, zračna | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Teorija iskanja in odkrivanja | pomorska, zračna, vojaška | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Operacijske raziskave: merila učinkovitosti | vojaška, zračna, pomorska, oblikovanje | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Vojne igre kot analiza | vojaška, oblikovanje | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Vojskovanje z manevrom | vojaška, e-šport | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Kohezija in moralni dejavnik | vojaška | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Težišče | vojaška | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Odločilne točke | vojaška, e-šport | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Operativne črte | vojaška | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Strategije uničenja in izčrpavanja | vojaška | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Globoka bitka in globoke operacije | vojaška | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle (zračno-kopenska bitka) | vojaška, zračna | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Poveljevanje z nalogo (Auftragstaktik) | vojaška, e-šport | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Preboj in izkoriščanje | vojaška | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Ogenj in gibanje | vojaška, e-šport | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Skakajoče kritje (bounding overwatch) | vojaška, e-šport | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Potegnitev izvidnikov in infiltracija | vojaška, e-šport | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | Rezerva | vojaška, e-šport | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Elastična obramba in protinapad | vojaška | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | Veriga ubijanja (najdi, določi, sledi, cilj, angažiraj, oceni) | vojaška, zračna, pomorska | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Razdalja odkrivanja v primerjavi z razdaljo angažmaja | zračna, pomorska, vojaška | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Učinkovita bojna vrednost | vojaška, e-šport | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Razpršenost na bojišču | vojaška, e-šport | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Tesna zračna podpora | zračna, vojaška | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Zračna prepoved (interdikcija) | zračna, vojaška | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Spremstvo v primerjavi z lovskim pometanjem | zračna | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Energijski boj v primerjavi z zavojnim bojem | zračna | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Zasledovanje z vodenjem, čisto in zaostajanje | zračna | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Thachov preplet | zračna | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Formacija prstnih štirih in boj v paru | zračna | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Flota v bivanju (fleet in being) | pomorska | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Prečkanje črke T | pomorska, vojaška | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Konvoj | pomorska | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Dostop onemogočen in območje zanikanja (A2/AD) | pomorska, zračna, vojaška | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Obramba utrdbe v naseljih | mestna, vojaška | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Prebijanje mišjih lukenj in gibanje po stavbah | mestna, vojaška, oblikovanje | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Obleganje | vojaška, mestna | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Gverilsko bojevanje | vojaška, mestna | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Protiupor (protiinsurgenca) | vojaška, mestna | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Zatočišče | vojaška, oblikovanje | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Zavajanje (maskirovka) | vojaška, e-šport | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Informacijska prednost | vojaška, e-šport | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Varčne runde in tempo virov | e-šport, oblikovanje | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Formacije za gibanje: vrsta, kolona, klin, eshalon | vojaška, e-šport | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Frontalni napad | vojaška | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Dvojni obhod (klešče) | vojaška | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Obkolitev in kotel | vojaška | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Prodor in preboj | vojaška | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Zasledovanje | vojaška | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Umikanje: odstop, zavlačevanje in umik | vojaška | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Finta in demonstracija | vojaška, e-šport | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Zaščita, straža in kritje: varovanje pred glavnim telesom | vojaška | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Obramba pred raketo: crank, notch, drag in pump | zračna | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Formacije onkraj vidne razdalje: stena, vodilni-zadnji, mlinček, klešče | zračna | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Boj s koti in energijski boj | zračna | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Udarni paket in zaporedje zatiranja | zračna | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | Bojna linija | pomorska | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | Usodni lijak | mestna, vojaška, e-šport, oblikovanje | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Čiščenje sob: presenečenje, hitrost, nadzorovano nasilje | mestna, vojaška, e-šport | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Točke prevlade | mestna, vojaška, e-šport | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Čiščenje kotov: rezanje pite | mestna, vojaška, e-šport | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Navzkrižni ogenj in prepletena strelna polja | vojaška, mestna, e-šport, oblikovanje | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Prednost tistega, ki pogleda | e-šport, oblikovanje | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Prednost v številu v rundah izločanja | e-šport, vojaška | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Vstop in uvodni dvoboj | e-šport, mestna | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Pripomočki pred vstopom: bliskavica in dim | e-šport, mestna, vojaška | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Model socialnih sil za gibanje pešcev | oblikovanje, mestna, vojaška | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Tvorba pasov v protitoku | oblikovanje, mestna | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Hitrejše je počasnejše | oblikovanje, mestna, vojaška | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Temeljni diagram množic | oblikovanje, mestna | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Tvorba poti in želeni tokovi (desire lines) | oblikovanje, vojaška | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Panika je redka: kolektivna odpornost | vojaška, mestna, oblikovanje | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: ločevanje, poravnava, kohezija | oblikovanje, vojaška | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Parameter reda in začetek kolektivnega gibanja | oblikovanje, vojaška, zračna, pomorska | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Roj, mlinček in polarizirana stanja | oblikovanje, vojaška, pomorska | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Učinkovito vodenje brez signalov | vojaška, e-šport, oblikovanje | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Sosedi po številu, ne po razdalji | zračna, vojaška | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Roevska inteligenca | oblikovanje, e-šport, vojaška | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Čreda in informacijske kaskade | e-šport, oblikovanje, vojaška | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Socialno lenarjenje | e-šport, oblikovanje, vojaška | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Razpršitev odgovornosti | e-šport, vojaška | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Kohezija primarne skupine | vojaška, e-šport | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Točke zloma in pragovi izgub | vojaška | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Zatiranje: kaj ogenj počne poleg ubijanja | vojaška, mestna | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Strah in stres pri odločitvah v boju | vojaška, e-šport | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Zadušitev pod pritiskom | e-šport | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Teorija izgledov in averzija do izgube | e-šport, oblikovanje | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Učinki izenačitve in denarja iz igre | e-šport | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Tilt | e-šport | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Potopljeni strošek | e-šport, vojaška | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | Vroča roka in njena zmota | e-šport | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Mešane strategije: biti nepredvidljiv | e-šport, oblikovanje, vojaška | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Skupni miselni modeli | e-šport, vojaška | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Sestavine timskega dela | e-šport, vojaška | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Virtualni svetovi kot laboratoriji vedenja | oblikovanje, e-šport | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Osebni prostor in ozemlje | oblikovanje, mestna | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Mreže interakcij: vozlišča in šibke vezi | e-šport, oblikovanje | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Metode (37) {#methods-37}

| id | naslov | vzorci | viri |
|---|---|---|---|
| `method.lanchester-fit` | Prilagajanje Lanchesterjevih eksponentov podatkom o spopadih | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Razmerje izmenjave po straneh in mestih | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Lokalno razmerje sil ob vsakem ubitem | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Vidno polje: strelna polja vzdolž vidnih črt | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Specifična energija ob ubojih in smrtih (zrak) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Vztrajnost žariščnih točk med tekmami | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Stopnja menjav (medsebojna podpora) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Spopadi in prednost prvega uboja | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Prostorska avtokorelacija smrti (Moranov I) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Stopnje glede na lastno izhodišče zemljevida z nadzorom FDR | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Obveščevalna priprava bojišča (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Modeli ocenjevanja s parnimi primerjavami (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Verjetnost zmage in vrednotenje dejanj | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Nadzor prostora in nadzor igrišča | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Enačba salve, prilagojena ladjam v stiku | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Razmerje bojne učinkovitosti na enoto ure v akciji | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Razdalje od odkritja do angažmaja in razdalje angažmaja | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Časovanje verige ubijanja | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Razpršenost v primerjavi z deležem ubojev (koncentracija sile v času) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Stopnja izgub in ubojev na polet | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Model verjetnosti zmage v rundi | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Vrednost dejanja: dodana verjetnost zmage | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Prilagojen plus-minus z ridge regresijo (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Krčenje: empirični Bayes | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Pričakovani izidi: od pričakovanih golov do pričakovanih dvobojev | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Merjenje postavitev, rotacij in prežanja (lurk) | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Problem refleksije: kopiranje ali skupni vzrok | herding, conformity | Manski 1993 |
| `method.streak-correction` | Nizi s popravkom končnega zaporedja | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Parametri polarizacije in mlinčka | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Vodje iz korelacije smeri z zamikom | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Test kaskade poti za čredo | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Ločevanje pasov in vztrajnost poti | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Nevarnost zaostalca | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Krivulja zloma | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Odziv na dohodni ogenj | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Tveganje po izgubi ali dobičku | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Sporazum o nakupih (Fleissov kappa) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Zgodovinski primeri (277) {#historical-cases-277}

| id | primer | kdaj | obseg | vzorci | viri |
|---|---|---|---|---|---|
| `case.thermopylae` | Termopile | 480 pr. n. št. | bitka | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamina | 480 pr. n. št. | bitka | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Maraton | 490 pr. n. št. | bitka | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuktra | 371 pr. n. št. | bitka | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331 pr. n. št. | bitka | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Trazimensko jezero | 217 pr. n. št. | bitka | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Kane | 216 pr. n. št. | bitka | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Teutoburški gozd | 9 n. št. | bitka | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | bitka | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Stirlingski most | 1297 | bitka | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Azincourt | 1415 | bitka | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen | 1757 | bitka | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlitz | 1805 | bitka | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | bitka | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | bitka | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: Marye's Heights | 1862 | spopad | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | spopad | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: Pickettov juriš | 1863 | spopad | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | bitka | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | spopad | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | kampanja | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | Somme, prvi dan | 1. julij 1916 | bitka | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | kampanja | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jutland | 1916 | bitka | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939–40 | bitka | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan in Ardeni | maj 1940 | kampanja | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Protinapad pri Arrasu | 21. maj 1940 | spopad | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Bitka za Britanijo | jul.–okt. 1940 | kampanja | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Bitka za Atlantik: operacijske raziskave konvojev | 1939–45 | kampanja | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | junij 1942 | bitka | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Druga bitka pri El Alameinu | okt.–nov. 1942 | bitka | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Kasserinski prelaz | feb. 1943 | bitka | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Stalingrad | avg. 1942–feb. 1943 | kampanja | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kursk | jul. 1943 | kampanja | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prohorovka | 12. julij 1943 | spopad | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13. junij 1944 | spopad | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Normandijski živi plotovi | junij–julij 1944 | kampanja | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Operacija Cobra | julij 1944 | kampanja | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Zaliv Leyte | okt. 1944 | bitka | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | dec. 1944 | bitka | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Cušima | maj 1905 | bitka | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Inchon | sep. 1950 | kampanja | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | MiG Alley | 1950–53 | kampanja | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | bitka | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | nov. 1965 | spopad | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operacija Bolo | 2. jan. 1967 | spopad | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golan: Dolina solz | okt. 1973 | bitka | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Sinaj: Kitajska kmetija | okt. 1973 | bitka | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Dolina Bekaa (operacija Mole Cricket 19) | junij 1982 | bitka | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Zračna vojna za Falklande | maj–junij 1982 | kampanja | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Zračna kampanja Puščavska nevihta | jan.–feb. 1991 | kampanja | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26. feb. 1991 | spopad | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadišu | okt. 1993 | spopad | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Grozni | dec. 1994–feb. 1995 | bitka | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hue | jan.–mar. 1968 | bitka | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Zračna kampanja na Kosovu | mar.–junij 1999 | kampanja | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Falludža (operacija Al Fajr) | nov. 2004 | bitka | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mosul | 2016–17 | kampanja | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Kadeš | okoli 1274 pr. n. št. | bitka | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Iso | 333 pr. n. št. | bitka | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 pr. n. št. | bitka | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Kare | 53 pr. n. št. | bitka | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Farsal | 48 pr. n. št. | bitka | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianopel | 378 n. št. | bitka | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Jarmuk | 636 n. št. | bitka | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manzikert | 1071 | bitka | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hittin | 1187 | bitka | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburn | 1314 | bitka | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Crécy | 1346 | bitka | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Poitiers | 1356 | bitka | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunwald (Tannenberg) | 1410 | bitka | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeld | 1631 | bitka | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blenheim | 1704 | bitka | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Poltava | 1709 | bitka | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rossbach | 1757 | bitka | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | kampanja | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | bitka | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena in Auerstedt | 1806 | bitka | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodino | 1812 | bitka | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Leipzig | 1813 | bitka | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | bitka | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | bitka | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | kampanja | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadova) | 1866 | bitka | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | bitka | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | bitka | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurman | 1898 | bitka | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | spopad | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Gallipoli | 1915 | kampanja | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | nov. 1917 | bitka | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Kobarid | okt.–nov. 1917 | kampanja | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Nemška pomladanska ofenziva (operacija Michael) | mar.–apr. 1918 | kampanja | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | avg. 1918 | bitka | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Halhin Gol (Nomonhan) | avg. 1939 | bitka | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | Poljska kampanja | sep. 1939 | kampanja | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut in Gembloux | maj 1940 | bitka | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | maj 1940 | spopad | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Obrambni obroč pri Dunkirku | maj–junij 1940 | kampanja | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operacija Compass in Beda Fomm | dec. 1940–feb. 1941 | kampanja | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Operacija Crusader in Sidi Rezegh | nov.–dec. 1941 | kampanja | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | maj–junij 1942 | bitka | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alam Halfa | avg.–sep. 1942 | bitka | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno-Brody | junij 1941 | bitka | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Obkolitev Kijeva | sep. 1941 | kampanja | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moskva | okt. 1941–jan. 1942 | kampanja | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Ržev in operacija Mars | 1942 | kampanja | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Drugi Harkov | maj 1942 | bitka | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Tretji Harkov (Mansteinov povratni udarec) | feb.–mar. 1943 | kampanja | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operacija Bagration | junij–avg. 1944 | kampanja | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Korsun-Čerkasi kotel | jan.–feb. 1944 | bitka | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Kamenec-Podolski kotel | mar.–apr. 1944 | kampanja | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operacija Epsom | junij 1944 | bitka | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operacija Goodwood | julij 1944 | bitka | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operacija Totalize | avg. 1944 | bitka | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | avg. 1944 | bitka | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Falaiški kotel | avg. 1944 | kampanja | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden in Arnhem | sep. 1944 | kampanja | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Aachen | okt. 1944 | bitka | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Hürtgenski gozd | sep. 1944–feb. 1945 | kampanja | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | sep. 1944 | bitka | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | St. Vith | dec. 1944 | bitka | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Elsenborn Ridge | dec. 1944 | bitka | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Seelowske višine | apr. 1945 | bitka | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlin | apr.–maj 1945 | bitka | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operacija Spring Awakening | mar. 1945 | bitka | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | dec. 1943 | bitka | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Varšavski upor | avg.–okt. 1944 | kampanja | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarava | nov. 1943 | bitka | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | sep.–nov. 1944 | bitka | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | feb.–mar. 1945 | bitka | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinava | apr.–junij 1945 | kampanja | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manila | feb.–mar. 1945 | bitka | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Mandžurija (avgustovska nevihta) | avg. 1945 | kampanja | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Pusanski obroč | avg.–sep. 1950 | kampanja | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Chosinsko jezero | nov.–dec. 1950 | kampanja | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Reka Imjin | apr. 1951 | bitka | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapjong | apr. 1951 | bitka | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | apr. in julij 1953 | spopad | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | jan.–apr. 1968 | bitka | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | nov. 1967 | bitka | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (gora Ap Bia) | maj 1969 | spopad | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila-Um Katef | junij 1967 | bitka | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailija | okt. 1973 | bitka | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | junij 1982 | spopad | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Obleganje Bejruta | junij–avg. 1982 | kampanja | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Libanon 2006: Bint Džbeil in grožnja s protitankovskim orožjem | julij–avg. 2006 | kampanja | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Faw | feb. 1986 | bitka | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basra (Karbala-5) | jan.–feb. 1987 | bitka | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Hafdži | jan.–feb. 1991 | bitka | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Cilj Norfolk | 26.–27. feb. 1991 | bitka | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medina Ridge | 27. feb. 1991 | bitka | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Lažne manevre pri Vadiju al-Batinu | feb. 1991 | kampanja | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nasirija | mar. 2003 | bitka | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Cilj Peach | apr. 2003 | spopad | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Hitri vdori Thunder | apr. 2003 | bitka | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Prelaz Debeka | apr. 2003 | spopad | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramadi | 2006–07 | kampanja | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadr Siti | mar.–maj 2008 | bitka | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Operacija Anaconda | mar. 2002 | bitka | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | julij 2008 | spopad | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | okt. 2009 | spopad | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala in hiše vodov | 2006–07 | kampanja | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Bitka za Alžir | 1956–57 | kampanja | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Rodezijska ognjena sila | 1974–79 | kampanja | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Obleganje Sarajeva | 1992–96 | kampanja | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Grozni 1999–2000 | dec. 1999–feb. 2000 | bitka | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Rusko-gruzijska vojna | avg. 2008 | kampanja | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillja | julij 2014 | spopad | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovajsk | avg. 2014 | bitka | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debalcevo | jan.–feb. 2015 | bitka | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Letališče Donck | sep. 2014–jan. 2015 | bitka | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Letališče Hostomel | feb. 2022 | spopad | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | Kijevska os in zaseda pri Brovariju | mar. 2022 | spopad | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Mariupol in Azovstal | feb.–maj 2022 | bitka | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Harkovska protiofenziva | sep. 2022 | kampanja | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Prehod čez Severski Doneck pri Bilogorivki | maj 2022 | spopad | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bahmut | avg. 2022–maj 2023 | bitka | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Zaporiška ofenziva | junij–nov. 2023 | kampanja | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Vojna za Gorski Karabah | sep.–nov. 2020 | kampanja | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Blitz | sep. 1940–maj 1941 | kampanja | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: prvi dan v zraku | 22. junij 1941 | bitka | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Kreta | maj 1941 | bitka | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Obleganje Malte | 1940–1942 | kampanja | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Zračni most do Stalingrada | nov. 1942–feb. 1943 | kampanja | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Zračni boji nad Kubanjo | apr.–junij 1943 | kampanja | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kursk v zraku | julij 1943 | bitka | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operacija Bagration v zraku | junij–avg. 1944 | kampanja | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploešti (operacija Tidal Wave) | 1. avg. 1943 | spopad | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Napad na jezove (operacija Chastise) | 16.–17. maj 1943 | spopad | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hamburg (operacija Gomorrah) | julij–avg. 1943 | bitka | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt-Regensburg | 17. avg. 1943 | bitka | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Drugi Schweinfurt ("črni četrtek") | 14. okt. 1943 | spopad | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Veliki teden (operacija Argument) | feb. 1944 | kampanja | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Napad na Nürnberg | 30.–31. mar. 1944 | spopad | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operacija Bodenplatte | 1. jan. 1945 | bitka | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Bitka v Bismarckovem morju | mar. 1943 | bitka | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Nevtralizacija Rabaula | 1943–1944 | kampanja | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Filipinsko morje ("Marianas Turkey Shoot") | junij 1944 | bitka | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Črni torek nad Namsijem | 23. okt. 1951 | spopad | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operacija Rolling Thunder | 1965–1968 | kampanja | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Most Thanh Hoa | 1965–1972 | spopad | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | Wild Weasels | 1965–1973 | kampanja | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Aultovo poročilo in Top Gun | 1968–1972 | kampanja | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operacija Linebacker | maj–okt. 1972 | kampanja | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II ("enajstdnevna vojna") | dec. 1972 | kampanja | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operacija Focus (Moked) | 5. junij 1967 | bitka | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Vojna izčrpavanja: raketni pas | 1969–1970 | kampanja | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | Raketni dežnik nad kanalom | okt. 1973 | bitka | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (operacija Opera) | 7. junij 1981 | spopad | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operacija El Dorado Canyon | 15. apr. 1986 | spopad | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Iransko-iraška zračna vojna | 1980–1988 | kampanja | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Napadi Black Buck | maj–junij 1982 | spopad | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: načrtovanje zračne kampanje v Zalivu | avg. 1990–jan. 1991 | kampanja | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Delovna skupina Normandija: prvi udar helikopterjev Apache | 17. jan. 1991 | spopad | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | Veliki lov na Scude | jan.–feb. 1991 | kampanja | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Greben Mutla ("avtocesta smrti") | 26.–27. feb. 1991 | spopad | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operacija Anaconda: Apači v Šahi-Kotu | mar. 2002 | bitka | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | Napad Apačev pri Karbali | 24. mar. 2003 | spopad | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | Zračna kampanja v Libiji | mar.–okt. 2011 | kampanja | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Gorski Karabah: droni in zračna obramba | sep.–nov. 2020 | kampanja | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ukrajina: sporni zrak | 2022 | kampanja | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Letališče Hostomel | feb. 2022 | spopad | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | feb.–mar. 1971 | kampanja | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operacija Eagle Claw | apr. 1980 | spopad | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afganistan: Stinger | 1986–1989 | kampanja | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | bitka | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | Špansko brodovje | 1588 | kampanja | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Zaliv Quiberon | 1759 | bitka | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | Chesapeake (Virginijski rtovi) | 1781 | bitka | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Nil (zaliv Aboukir) | 1798 | bitka | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Kopenhagen | 1801 | bitka | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | mar. 1862 | spopad | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lissa | 1866 | bitka | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Jalu | 1894 | bitka | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Manilski zaliv | 1898 | bitka | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Helgoland | avg. 1914 | bitka | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel in Falklandi | nov.–dec. 1914 | kampanja | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Dogger Bank | jan. 1915 | bitka | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | Rio de la Plata | dec. 1939 | bitka | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Taranto | nov. 1940 | spopad | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Rt Matapan | mar. 1941 | bitka | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Danska ožina in potop Bismarcka | maj 1941 | kampanja | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7. dec. 1941 | spopad | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales in Repulse | 10. dec. 1941 | spopad | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Javansko morje | feb. 1942 | bitka | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Koralno morje | maj 1942 | bitka | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Otok Savo | avg. 1942 | bitka | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Vzhodni Salomoni | avg. 1942 | bitka | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Rt Esperance | okt. 1942 | bitka | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Otočje Santa Cruz | okt. 1942 | bitka | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Pomorska bitka pri Guadalcanalu | 12.–15. nov. 1942 | bitka | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | nov. 1942 | spopad | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | Preboj skozi Rokavski preliv | feb. 1942 | spopad | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operacija Pedestal | avg. 1942 | bitka | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Črni maj | maj 1943 | kampanja | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Severni rt | dec. 1943 | bitka | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | Ameriška podmorniška kampanja proti Japonski | 1941–1945 | kampanja | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Ob otoku Samar | 25. okt. 1944 | bitka | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Ožina Surigao | 25. okt. 1944 | bitka | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinava: kamikaze kampanja | apr.–junij 1945 | kampanja | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Potop Ejlata | okt. 1967 | spopad | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakija | okt. 1973 | bitka | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | Potop križarke General Belgrano | 2. maj 1982 | spopad | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | Izguba ladje HMS Sheffield | 4. maj 1982 | spopad | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17. maj 1987 | spopad | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operacija Praying Mantis | 18. apr. 1988 | bitka | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | avg. 2004 | spopad | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Bisu revolucija | mar. 2007 | bitka | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | Dream Coil na The International 2013 | avg. 2013 | spopad | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Fakerjev Zed proti Ryuju | sep. 2013 | spopad | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Poganjanje na nadvozu | nov. 2014 | spopad | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | Skakajoči AWP na Mirageu | apr. 2016 | spopad | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis in doba pripomočkov | 2018 | kampanja | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five proti OG | apr. 2019 | bitka | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar doseže velemojstrstvo | 2019 | kampanja | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Levi zavoj (kopenska ofenziva Puščavska nevihta) | 24.–28. feb. 1991 | kampanja | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | Incident Corrupted Blood | sep. 2005 | kampanja | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Oblikovanje iger in ravni (17) {#game-and-level-design-17}

| id | naslov | vzorci | viri |
|---|---|---|---|
| `design.chokepoint` | Ozka grla v zasnovi ravni | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Bočne poti in nadomestne poti | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Vidne črte in razdalja spopada | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Postavitev kritja in ritem | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Zasnova izhodišč in zaščita izhodišč | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Ravnovesje simetričnih in nesimetričnih zemljevidov | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Ravnovesje razredov in protiukrepi | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Tok, zanke in pregledne postavitve | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Gospodarstva iger in povratne zanke | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Iskanje igre in razpon veščin | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | AI nasprotniki kot preizkus ravni | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Smiselna igra in izbira | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Menjave in ekipna igra v streljačinah | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Nadzor nad zemljevidom | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Toplotne karte in prostorska telemetrija v zasnovi | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Obvladovanje, učenje in zabava | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Gospodarstva krogov in odločitve o nakupih | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Študije (113) {#studies-113}

| id | naslov | viri |
|---|---|---|
| `study.engel-1954` | Engel: Lanchesterjev kvadratni zakon pri Iwo Jimi | Engel 1954 |
| `study.bracken-1995` | Bracken: Lanchesterjevi modeli za Ardene | Bracken 1995 |
| `study.fricker-1998` | Fricker: ponovni pregled modelov izčrpavanja za Ardene | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas in Turkes: Kursk in Ardeni | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley in Helmbold: preverjanje kvadratnega zakona | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | Analiza smrti igralcev z GIS | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: vizualizacija tekmovalnega vedenja | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Vrednotenje dejanj v Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Odkrivanje srečanj v e-športu | Schubert et al. 2016 |
| `study.red-baron` | Projekt Red Baron: zračni boj nad Vietnamom | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: kvantificirana presoja zgodovinskih bitk | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: uporaba sil pojasni izide | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Pregled vizualizacije podatkov o igranju | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Lanchester proti trem stoletjem kopenskih bitk | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: šestdeset spopadov druge svetovne vojne | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: modeli boja in ameriška državljanska vojna | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: statistični model podatkov o izgubah | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: hitrosti napredovanja v kopenskem boju | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas in Dinges: okoliščine so pomembnejše od zakona | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | Podatkovna baza Kursk | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | Podatkovna baza kampanje za Ardene | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson in MacKay: bitka za Britanijo kot podatki Lanchesterja | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte in Schmidt: številke še vedno zmagujejo bitke | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: pravilnosti izgub v bitkah | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Dupuyjev taktični številčni determinističen model | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: vojna s številkami | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: bojna moč | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter in Stam: demokracije v vojni | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: adaptivni dinamični model | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester in gverilsko bojevanje | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: stohastični model salve | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: temelji flotne taktike | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | Razprava o pravilu 3:1 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: modeliranje oboroženih spopadov | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Aultovo poročilo: rakete, izstreljene zunaj svojega ovojnika | Ault 1969; Michel 1997 |
| `study.gwaps` | Pregled zračne moči v Zalivski vojni | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Blackettov cirkus | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Nastavitve globinskih bomb v obalnem poveljstvu | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Bele spodnje strani protipodmorniških letal | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: oklep tja, kjer vrnjeni bombniki niso bili zadeti | Mangel & Samaniego 1984 |
| `study.optimal-search` | Optimalno iskanje: od podmornic do AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: boj v peklu | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Dostop onemogočen in območje zanikanja | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Kako igralci izgubijo zanimanje | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Gručenje vedenja igralcev v naravi | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Zaznavanje frustracije igralcev | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: nadzorne plošče telemetrije v produkciji | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: vizualna analitika igranja | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Gibanje avatarjev na bojiščih World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: instrumentiranje uporabniških testov v velikem obsegu | Kim et al. 2008 |
| `study.game-data-science` | Podatkovna znanost iger | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Umetna inteligenca in igre | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Veščina in gibanje ekipe v Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Vzorci bojev, ki napovedujejo zmage v MOBA | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Vloge igralcev v Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Napovedovanje izidov Dota 2 iz izbora | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Napoved zmage v živo v profesionalnem e-športu | Hodge et al. 2021 |
| `study.rioult-2014` | Topologija položajev igralcev | Rioult et al. 2014 |
| `study.bednarek-2017` | Vrednotenje igralcev v ekipnih streljačinah | Bednárek et al. 2017 |
| `study.katona-2019` | Napovedovanje, kdo bo umrl naslednji | Katona et al. 2019 |
| `study.block-2018` | Podatkovno vodene zgodbe za občinstvo e-športa | Block et al. 2018 |
| `study.ggviz` | ggViz: iskanje stanj igre v velikem obsegu | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: obsežno učenje z okrepitvijo v Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: raven velemojstra v StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Pričakovana vrednost posesti v košarki | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: vrednotenje dejanj z žogo v nogometu | Decroos et al. 2019 |
| `study.pitch-control` | Nadzor igrišča in ustvarjanje prostora | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | Prostorska struktura obrambne spretnosti | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Vloge v ekipi iz podatkov sledenja | Lucey et al. 2013 |
| `study.shot-quality` | Pričakovani goli in kakovost strelov | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: prostorska učinkovitost streljanja | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Prostorsko-časovna analiza ekipnih športov | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Ripleyjev K: gručenje na vseh merilih | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark in Evans: razpršitev do najbližjega soseda | Clark & Evans 1954 |
| `study.getis-ord` | Vroče točke Getis-Ord | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Lokalni kazalniki prostorske povezanosti | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | Statistika prostorskega pregledovanja | Kulldorff 1997 |
| `study.kde` | Ocena gostote z jedrom | Silverman 1986 |
| `study.knox-1964` | Prostorsko-časovna interakcija | Knox 1964; Diggle 2013 |
| `study.maup` | Problem spremenljive prostorske enote | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Izovisti in grafi vidnosti | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Prostorska sintaksa | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Povprečna gnečnost | Lloyd 1967 |
| `study.survival-analysis` | Analiza preživetja za čas do smrti | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Posplošeni linearni modeli za števila | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap in intervali zaupanja | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey in sod.: zakasnitev in prednost tistega, ki pogleda | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee in Chang: strel okoli vogala | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: zakasnitev in dejanja igralcev | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos in sod.: profesionalci in amaterji skozi verjetnost zmage | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos in sod.: gospodarske odločitve v Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: pametni uboji in brezvredne smrti | Maymin 2021 |
| `study.moba-live-prediction` | Napovedovanje izida MOBA v živo | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa in sod.: runde Valoranta iz taktičnih značilnosti | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv in sod.: vloge v profesionalnem Counter-Strike 2 | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim in sod.: usposabljanje za bližnji bojni spopad | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Turbulenca množice na hadžu leta 2006 | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Skupine pešcev oblikujejo množice | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Hierarhična dinamika skupin pri jatah golobov | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Družbeni vpliv naredi uspeh neenakega in nepredvidljivega | Salganik et al. 2006 |
| `study.wisdom-undermined` | Družbeni vpliv izpodkoplje modrost množice | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | Privlačna moč množice | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Skladnost z enoglasno večino | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: bojna motivacija v Iraku | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Kohezija in učinkovitost: meta-analize | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Averzija do izgube med profesionalnimi golfisti | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Vroče roke v baseballu | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Enajstmetrovke: profesionalci igrajo minimax | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Igra minimax na Wimbledonu | Walker & Wooders 2001 |
| `study.collective-intelligence` | Kolektivna inteligenca ekip | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Socialna omrežja spletnega sveta | Szell et al. 2010 |
| `study.team-networks` | Mreže podaj in uspešnost ekipe | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Vedenje se širi po gručastih omrežjih | Centola 2010 |

### Literatura {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(preverjeno 2026-11-15: podrobnosti)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(preverjeno 2026-11-15: podrobnosti)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(preverjeno 2026-11-15: podrobnosti)*
- Ammianus Marcellinus (prev. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(preverjeno 2026-11-15: podrobnosti)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(preverjeno 2026-11-15: podrobnosti)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(preverjeno 2026-11-15: podrobnosti)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(preverjeno 2026-11-15: podrobnosti)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Ardant du Picq, C. (prev. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(preverjeno 2026-11-15: podrobnosti)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(preverjeno 2026-11-15: podrobnosti)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Arrian (prev. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(preverjeno 2026-11-15: podrobnosti)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(preverjeno 2026-11-15: podrobnosti)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(preverjeno 2026-11-15: podrobnosti)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(preverjeno 2026-11-15: podrobnosti)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(preverjeno 2026-11-15: podrobnosti)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(preverjeno 2026-11-15: podrobnosti)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(preverjeno 2026-11-15: podrobnosti)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(preverjeno 2026-11-15: podrobnosti)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(preverjeno 2026-11-15: podrobnosti)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(preverjeno 2026-11-15: podrobnosti)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(preverjeno 2026-11-15: podrobnosti)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(preverjeno 2026-11-15: podrobnosti)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(preverjeno 2026-11-15: podrobnosti)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(preverjeno 2026-11-15: podrobnosti)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(preverjeno 2026-11-15: podrobnosti)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(preverjeno 2026-11-15: podrobnosti)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(preverjeno 2026-11-15: obstoj)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(preverjeno 2026-11-15: podrobnosti)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(preverjeno 2026-11-15: podrobnosti)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(preverjeno 2026-11-15: podrobnosti)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(preverjeno 2026-11-15: podrobnosti)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(preverjeno 2026-11-15: podrobnosti)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(preverjeno 2026-11-15: podrobnosti)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(preverjeno 2026-11-15: obstoj)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(preverjeno 2026-11-15: podrobnosti)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(preverjeno 2026-11-15: podrobnosti)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(preverjeno 2026-11-15: podrobnosti)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(preverjeno 2026-11-15: podrobnosti)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(preverjeno 2026-11-15: podrobnosti)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(preverjeno 2026-11-15: obstoj)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(preverjeno 2026-11-15: podrobnosti)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(preverjeno 2026-11-15: podrobnosti)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(preverjeno 2026-11-15: podrobnosti)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(preverjeno 2026-11-15: obstoj)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(preverjeno 2026-11-15: podrobnosti)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(preverjeno 2026-11-15: podrobnosti)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(preverjeno 2026-11-15: podrobnosti)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(preverjeno 2026-11-15: podrobnosti)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(preverjeno 2026-11-15: obstoj)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(preverjeno 2026-11-15: podrobnosti)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(preverjeno 2026-11-15: podrobnosti)*
- Caesar, G. J. (prev. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(preverjeno 2026-11-15: podrobnosti)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(preverjeno 2026-11-15: podrobnosti)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(preverjeno 2026-11-15: podrobnosti)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(preverjeno 2026-11-15: podrobnosti)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(preverjeno 2026-11-15: podrobnosti)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(preverjeno 2026-11-15: podrobnosti)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(preverjeno 2026-11-15: podrobnosti)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(preverjeno 2026-11-15: podrobnosti)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(preverjeno 2026-11-15: podrobnosti)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(preverjeno 2026-11-15: podrobnosti)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(preverjeno 2026-11-15: podrobnosti)*
- Clausewitz, C. von (prev. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(preverjeno 2026-11-15: podrobnosti)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(preverjeno 2026-11-15: podrobnosti)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(preverjeno 2026-11-15: podrobnosti)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(preverjeno 2026-11-15: podrobnosti)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(preverjeno 2026-11-15: podrobnosti)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Corbett, J. S. (1920). Naval Operations zv. 1 (History of the Great War). Longmans, Green, London. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Corbett, J. S. (1921). Naval Operations zv. 2 (History of the Great War). Longmans, Green, London. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Corbett, J. S. (1923). Naval Operations zv. 3 (History of the Great War). Longmans, Green, London. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(preverjeno 2026-11-15: obstoj)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(preverjeno 2026-11-15: podrobnosti)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(preverjeno 2026-11-15: podrobnosti)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(preverjeno 2026-11-15: podrobnosti)*
- Craven, W. F.; Cate, J. L. (ur.) (1949). The Army Air Forces in World War II, zv. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(preverjeno 2026-11-15: obstoj)*
- Craven, W. F.; Cate, J. L. (ur.) (1951). The Army Air Forces in World War II, zv. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(preverjeno 2026-11-15: obstoj)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(preverjeno 2026-11-15: podrobnosti)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(preverjeno 2026-11-15: podrobnosti)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(preverjeno 2026-11-15: obstoj)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(preverjeno 2026-11-15: podrobnosti)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(preverjeno 2026-11-15: podrobnosti)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(preverjeno 2026-11-15: podrobnosti)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(preverjeno 2026-11-15: podrobnosti)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(preverjeno 2026-11-15: podrobnosti)*
- Delbrück, H. (prev. Renfroe, W. J.) (1990). History of the Art of War, zv. 4: The Dawn of Modern Warfare (izv. 1920). University of Nebraska Press, Lincoln. *(preverjeno 2026-11-15: obstoj)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(preverjeno 2026-11-15: podrobnosti)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3. izd.). CRC Press, Boca Raton. *(preverjeno 2026-11-15: podrobnosti)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(preverjeno 2026-11-15: podrobnosti)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(preverjeno 2026-11-15: podrobnosti)*
- Douhet, G. (prev. Ferrari, D.) (1942). The Command of the Air (izv. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(preverjeno 2026-11-15: podrobnosti)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(preverjeno 2026-11-15: podrobnosti)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(preverjeno 2026-11-15: podrobnosti)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(preverjeno 2026-11-15: podrobnosti)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(preverjeno 2026-11-15: obstoj)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(preverjeno 2026-11-15: podrobnosti)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(preverjeno 2026-11-15: podrobnosti)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(preverjeno 2026-11-15: podrobnosti)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(preverjeno 2026-11-15: podrobnosti)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(preverjeno 2026-11-15: podrobnosti)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(preverjeno 2026-11-15: podrobnosti)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(preverjeno 2026-11-15: podrobnosti)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(preverjeno 2026-11-15: obstoj)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(preverjeno 2026-11-15: podrobnosti)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(preverjeno 2026-11-15: podrobnosti)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(preverjeno 2026-11-15: podrobnosti)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(preverjeno 2026-11-15: podrobnosti)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(preverjeno 2026-11-15: podrobnosti)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(preverjeno 2026-11-15: podrobnosti)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(preverjeno 2026-11-15: podrobnosti)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(preverjeno 2026-11-15: podrobnosti)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(preverjeno 2026-11-15: podrobnosti)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(preverjeno 2026-11-15: podrobnosti)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(preverjeno 2026-11-15: podrobnosti)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(preverjeno 2026-11-15: podrobnosti)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(preverjeno 2026-11-15: podrobnosti)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(preverjeno 2026-11-15: podrobnosti)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(preverjeno 2026-11-15: podrobnosti)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(preverjeno 2026-11-15: podrobnosti)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(preverjeno 2026-11-15: podrobnosti)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(preverjeno 2026-11-15: podrobnosti)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(preverjeno 2026-11-15: obstoj)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(preverjeno 2026-11-15: podrobnosti)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(preverjeno 2026-11-15: podrobnosti)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(preverjeno 2026-11-15: podrobnosti)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(preverjeno 2026-11-15: podrobnosti)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(preverjeno 2026-11-15: podrobnosti)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2. izd.). Morgan Kaufmann, Burlington. *(preverjeno 2026-11-15: podrobnosti)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(preverjeno 2026-11-15: podrobnosti)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(preverjeno 2026-11-15: podrobnosti)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(preverjeno 2026-11-15: podrobnosti)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(preverjeno 2026-11-15: podrobnosti)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(preverjeno 2026-11-15: podrobnosti)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(preverjeno 2026-11-15: podrobnosti)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(preverjeno 2026-11-15: podrobnosti)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(preverjeno 2026-11-15: podrobnosti)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(preverjeno 2026-11-15: podrobnosti)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(preverjeno 2026-11-15: podrobnosti)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(preverjeno 2026-11-15: podrobnosti)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(preverjeno 2026-11-15: podrobnosti)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(preverjeno 2026-11-15: podrobnosti)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(preverjeno 2026-11-15: podrobnosti)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(preverjeno 2026-11-15: podrobnosti)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(preverjeno 2026-11-15: podrobnosti)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(preverjeno 2026-11-15: podrobnosti)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(preverjeno 2026-11-15: podrobnosti)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(preverjeno 2026-11-15: podrobnosti)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(preverjeno 2026-11-15: podrobnosti)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(preverjeno 2026-11-15: podrobnosti)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(preverjeno 2026-11-15: podrobnosti)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(preverjeno 2026-11-15: podrobnosti)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(preverjeno 2026-11-15: podrobnosti)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(preverjeno 2026-11-15: podrobnosti)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(preverjeno 2026-11-15: podrobnosti)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(preverjeno 2026-11-15: podrobnosti)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(preverjeno 2026-11-15: podrobnosti)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(preverjeno 2026-11-15: podrobnosti)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(preverjeno 2026-11-15: podrobnosti)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(preverjeno 2026-11-15: podrobnosti)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(preverjeno 2026-11-15: podrobnosti)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(preverjeno 2026-11-15: podrobnosti)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(preverjeno 2026-11-15: podrobnosti)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(preverjeno 2026-11-15: podrobnosti)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(preverjeno 2026-11-15: podrobnosti)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(preverjeno 2026-11-15: podrobnosti)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(preverjeno 2026-11-15: podrobnosti)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(preverjeno 2026-11-15: podrobnosti)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(preverjeno 2026-11-15: podrobnosti)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(preverjeno 2026-11-15: podrobnosti)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(preverjeno 2026-11-15: podrobnosti)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(preverjeno 2026-11-15: podrobnosti)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(preverjeno 2026-11-15: podrobnosti)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(preverjeno 2026-11-15: podrobnosti)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(preverjeno 2026-11-15: podrobnosti)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(preverjeno 2026-11-15: podrobnosti)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(preverjeno 2026-11-15: obstoj)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Herodotus (prev. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(preverjeno 2026-11-15: podrobnosti)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(preverjeno 2026-11-15: podrobnosti)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(preverjeno 2026-11-15: podrobnosti)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(preverjeno 2026-11-15: podrobnosti)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(preverjeno 2026-11-15: podrobnosti)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(preverjeno 2026-11-15: podrobnosti)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(preverjeno 2026-11-15: podrobnosti)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(preverjeno 2026-11-15: podrobnosti)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(preverjeno 2026-11-15: podrobnosti)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(preverjeno 2026-11-15: podrobnosti)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(preverjeno 2026-11-15: podrobnosti)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2. izd.). Naval Institute Press, Annapolis. *(preverjeno 2026-11-15: podrobnosti)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3. izd.). Naval Institute Press, Annapolis. *(preverjeno 2026-11-15: podrobnosti)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(preverjeno 2026-11-15: podrobnosti)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(preverjeno 2026-11-15: podrobnosti)*
- Isserson, G. S. (prev. Menning, B. W.) (2013). The Evolution of Operational Art (izv. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(preverjeno 2026-11-15: podrobnosti)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(preverjeno 2026-11-15: podrobnosti)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Jomini, A.-H. de (prev. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(preverjeno 2026-11-15: podrobnosti)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(preverjeno 2026-11-15: podrobnosti)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(preverjeno 2026-11-15: podrobnosti)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(preverjeno 2026-11-15: podrobnosti)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(preverjeno 2026-11-15: podrobnosti)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(preverjeno 2026-11-15: obstoj)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(preverjeno 2026-11-15: podrobnosti)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(preverjeno 2026-11-15: podrobnosti)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(preverjeno 2026-11-15: podrobnosti)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(preverjeno 2026-11-15: podrobnosti)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(preverjeno 2026-11-15: podrobnosti)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(preverjeno 2026-11-15: podrobnosti)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(preverjeno 2026-11-15: podrobnosti)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(preverjeno 2026-11-15: podrobnosti)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(preverjeno 2026-11-15: podrobnosti)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(preverjeno 2026-11-15: podrobnosti)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(preverjeno 2026-11-15: podrobnosti)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(preverjeno 2026-11-15: podrobnosti)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(preverjeno 2026-11-15: obstoj)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(preverjeno 2026-11-15: podrobnosti)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(preverjeno 2026-11-15: podrobnosti)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(preverjeno 2026-11-15: podrobnosti)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(preverjeno 2026-11-15: podrobnosti)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(preverjeno 2026-11-15: podrobnosti)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(preverjeno 2026-11-15: podrobnosti)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(preverjeno 2026-11-15: podrobnosti)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(preverjeno 2026-11-15: podrobnosti)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(preverjeno 2026-11-15: podrobnosti)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(preverjeno 2026-11-15: podrobnosti)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(preverjeno 2026-11-15: obstoj)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(preverjeno 2026-11-15: podrobnosti)*
- Livy (prev. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(preverjeno 2026-11-15: podrobnosti)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(preverjeno 2026-11-15: podrobnosti)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(preverjeno 2026-11-15: podrobnosti)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(preverjeno 2026-11-15: podrobnosti)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(preverjeno 2026-11-15: obstoj)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(preverjeno 2026-11-15: podrobnosti)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(preverjeno 2026-11-15: podrobnosti)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(preverjeno 2026-11-15: podrobnosti)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(preverjeno 2026-11-15: podrobnosti)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(preverjeno 2026-11-15: podrobnosti)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(preverjeno 2026-11-15: podrobnosti)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(preverjeno 2026-11-15: podrobnosti)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(preverjeno 2026-11-15: obstoj)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(preverjeno 2026-11-15: podrobnosti)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(preverjeno 2026-11-15: podrobnosti)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(preverjeno 2026-11-15: podrobnosti)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(preverjeno 2026-11-15: podrobnosti)*
- Mao Tse-tung (prev. Griffith, S. B.) (1961). On Guerrilla Warfare (izv. 1937). Praeger, New York. *(preverjeno 2026-11-15: obstoj)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(preverjeno 2026-11-15: podrobnosti)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(preverjeno 2026-11-15: podrobnosti)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(preverjeno 2026-11-15: podrobnosti)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(preverjeno 2026-11-15: podrobnosti)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2. izd.). Chapman & Hall, London. *(preverjeno 2026-11-15: podrobnosti)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(preverjeno 2026-11-15: podrobnosti)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(preverjeno 2026-11-15: podrobnosti)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(preverjeno 2026-11-15: obstoj)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(preverjeno 2026-11-15: podrobnosti)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(preverjeno 2026-11-15: podrobnosti)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(preverjeno 2026-11-15: podrobnosti)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(preverjeno 2026-11-15: podrobnosti)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(preverjeno 2026-11-15: podrobnosti)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(preverjeno 2026-11-15: podrobnosti)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(preverjeno 2026-11-15: podrobnosti)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(preverjeno 2026-11-15: podrobnosti)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(preverjeno 2026-11-15: podrobnosti)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(preverjeno 2026-11-15: podrobnosti)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(preverjeno 2026-11-15: obstoj)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(preverjeno 2026-11-15: obstoj)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(preverjeno 2026-11-15: podrobnosti)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(preverjeno 2026-11-15: podrobnosti)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(preverjeno 2026-11-15: podrobnosti)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, zv. 3). Little, Brown, Boston. *(preverjeno 2026-11-15: podrobnosti)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, zv. 4). Little, Brown, Boston. *(preverjeno 2026-11-15: obstoj)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, zv. 5). Little, Brown, Boston. *(preverjeno 2026-11-15: obstoj)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, zv. 6). Little, Brown, Boston. *(preverjeno 2026-11-15: podrobnosti)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, zv. 8). Little, Brown, Boston. *(preverjeno 2026-11-15: podrobnosti)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, zv. 12). Little, Brown, Boston. *(preverjeno 2026-11-15: obstoj)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, zv. 14). Little, Brown, Boston. *(preverjeno 2026-11-15: podrobnosti)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(preverjeno 2026-11-15: podrobnosti)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(preverjeno 2026-11-15: podrobnosti)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(preverjeno 2026-11-15: podrobnosti)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(preverjeno 2026-11-15: podrobnosti)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(preverjeno 2026-11-15: podrobnosti)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(preverjeno 2026-11-15: podrobnosti)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(preverjeno 2026-11-15: podrobnosti)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(preverjeno 2026-11-15: podrobnosti)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(preverjeno 2026-11-15: podrobnosti)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(preverjeno 2026-11-15: podrobnosti)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(preverjeno 2026-11-15: podrobnosti)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(preverjeno 2026-11-15: podrobnosti)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(preverjeno 2026-11-15: obstoj)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(preverjeno 2026-11-15: podrobnosti)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(preverjeno 2026-11-15: podrobnosti)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(preverjeno 2026-11-15: podrobnosti)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(preverjeno 2026-11-15: podrobnosti)*
- Osipov, M. (prev. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (izv. 1915). Naval Research Logistics 42(3): 435-490. *(preverjeno 2026-11-15: podrobnosti)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(preverjeno 2026-11-15: podrobnosti)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(preverjeno 2026-11-15: podrobnosti)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(preverjeno 2026-11-15: podrobnosti)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(preverjeno 2026-11-15: podrobnosti)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(preverjeno 2026-11-15: podrobnosti)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(preverjeno 2026-11-15: podrobnosti)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(preverjeno 2026-11-15: podrobnosti)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(preverjeno 2026-11-15: podrobnosti)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(preverjeno 2026-11-15: podrobnosti)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(preverjeno 2026-11-15: podrobnosti)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(preverjeno 2026-11-15: podrobnosti)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(preverjeno 2026-11-15: podrobnosti)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(preverjeno 2026-11-15: podrobnosti)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(preverjeno 2026-11-15: podrobnosti)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(preverjeno 2026-11-15: podrobnosti)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(preverjeno 2026-11-15: podrobnosti)*
- Plutarch (prev. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(preverjeno 2026-11-15: podrobnosti)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(preverjeno 2026-11-15: podrobnosti)*
- Polybius (prev. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(preverjeno 2026-11-15: podrobnosti)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(preverjeno 2026-11-15: podrobnosti)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(preverjeno 2026-11-15: podrobnosti)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(preverjeno 2026-11-15: podrobnosti)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(preverjeno 2026-11-15: podrobnosti)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(preverjeno 2026-11-15: podrobnosti)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(preverjeno 2026-11-15: podrobnosti)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(preverjeno 2026-11-15: podrobnosti)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(preverjeno 2026-11-15: podrobnosti)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(preverjeno 2026-11-15: podrobnosti)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(preverjeno 2026-11-15: podrobnosti)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(preverjeno 2026-11-15: podrobnosti)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(preverjeno 2026-11-15: podrobnosti)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(preverjeno 2026-11-15: podrobnosti)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(preverjeno 2026-11-15: podrobnosti)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(preverjeno 2026-11-15: podrobnosti)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(preverjeno 2026-11-15: podrobnosti)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(preverjeno 2026-11-15: obstoj)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, zv. 1: The Defensive. HMSO, London. *(preverjeno 2026-11-15: obstoj)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, zv. 2: The Period of Balance. HMSO, London. *(preverjeno 2026-11-15: obstoj)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, zv. 3, part 1: The Offensive. HMSO, London. *(preverjeno 2026-11-15: obstoj)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(preverjeno 2026-11-15: podrobnosti)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(preverjeno 2026-11-15: podrobnosti)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(preverjeno 2026-11-15: podrobnosti)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(preverjeno 2026-11-15: podrobnosti)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(preverjeno 2026-11-15: podrobnosti)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(preverjeno 2026-11-15: podrobnosti)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(preverjeno 2026-11-15: podrobnosti)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(preverjeno 2026-11-15: obstoj)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(preverjeno 2026-11-15: podrobnosti)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(preverjeno 2026-11-15: podrobnosti)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (ur.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(preverjeno 2026-11-15: podrobnosti)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(preverjeno 2026-11-15: podrobnosti)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(preverjeno 2026-11-15: obstoj)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(preverjeno 2026-11-15: podrobnosti)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(preverjeno 2026-11-15: obstoj)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(preverjeno 2026-11-15: podrobnosti)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(preverjeno 2026-11-15: podrobnosti)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(preverjeno 2026-11-15: podrobnosti)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(preverjeno 2026-11-15: podrobnosti)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(preverjeno 2026-11-15: podrobnosti)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(preverjeno 2026-11-15: obstoj)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(preverjeno 2026-11-15: podrobnosti)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(preverjeno 2026-11-15: podrobnosti)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(preverjeno 2026-11-15: podrobnosti)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(preverjeno 2026-11-15: podrobnosti)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(preverjeno 2026-11-15: podrobnosti)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(preverjeno 2026-11-15: podrobnosti)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(preverjeno 2026-11-15: podrobnosti)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(preverjeno 2026-11-15: podrobnosti)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(preverjeno 2026-11-15: podrobnosti)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(preverjeno 2026-11-15: obstoj)*
- Sun Tzu (prev. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(preverjeno 2026-11-15: podrobnosti)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(preverjeno 2026-11-15: podrobnosti)*
- Tacitus (prev. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(preverjeno 2026-11-15: podrobnosti)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(preverjeno 2026-11-15: podrobnosti)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(preverjeno 2026-11-15: podrobnosti)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(preverjeno 2026-11-15: podrobnosti)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4. izd.). Routledge, Abingdon. *(preverjeno 2026-11-15: podrobnosti)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(preverjeno 2026-11-15: podrobnosti)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(preverjeno 2026-11-15: podrobnosti)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2. izd.). CRC Press, Boca Raton. *(preverjeno 2026-11-15: podrobnosti)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(preverjeno 2026-11-15: podrobnosti)*
- Triandafillov, V. K. (prev. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (izv. 1929). Frank Cass, Ilford. *(preverjeno 2026-11-15: podrobnosti)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(preverjeno 2026-11-15: podrobnosti)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(preverjeno 2026-11-15: podrobnosti)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(preverjeno 2026-11-15: podrobnosti)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(preverjeno 2026-11-15: podrobnosti)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(preverjeno 2026-11-15: podrobnosti)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(preverjeno 2026-11-15: podrobnosti)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(preverjeno 2026-11-15: obstoj)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, zv. 7. Government Printing Office, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I zv. 21 (Fredericksburg). Government Printing Office, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(preverjeno 2026-11-15: podrobnosti)*
- Vegetius (prev. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(javna last)* *(preverjeno 2026-11-15: obstoj)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(preverjeno 2026-11-15: podrobnosti)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(preverjeno 2026-11-15: podrobnosti)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(preverjeno 2026-11-15: podrobnosti)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(preverjeno 2026-11-15: podrobnosti)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(preverjeno 2026-11-15: podrobnosti)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(preverjeno 2026-11-15: podrobnosti)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(preverjeno 2026-11-15: podrobnosti)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(preverjeno 2026-11-15: obstoj)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(preverjeno 2026-11-15: podrobnosti)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(preverjeno 2026-11-15: obstoj)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Washburn, A. R. (2002). Search and Detection (4. izd.). INFORMS / Military Applications Section, Linthicum MD. *(preverjeno 2026-11-15: obstoj)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(preverjeno 2026-11-15: obstoj)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(preverjeno 2026-11-15: podrobnosti)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(preverjeno 2026-11-15: podrobnosti)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(preverjeno 2026-11-15: podrobnosti)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(preverjeno 2026-11-15: podrobnosti)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(preverjeno 2026-11-15: podrobnosti)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(preverjeno 2026-11-15: podrobnosti)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2. izd.). Air University Press, Maxwell AFB. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(preverjeno 2026-11-15: obstoj)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(preverjeno 2026-11-15: podrobnosti)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(preverjeno 2026-11-15: podrobnosti)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(preverjeno 2026-11-15: podrobnosti)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(preverjeno 2026-11-15: podrobnosti)*
- Xenophon (prev. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(javna last)* *(preverjeno 2026-11-15: podrobnosti)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(preverjeno 2026-11-15: podrobnosti)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(preverjeno 2026-11-15: podrobnosti)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(preverjeno 2026-11-15: podrobnosti)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(preverjeno 2026-11-15: obstoj)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(preverjeno 2026-11-15: podrobnosti)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(preverjeno 2026-11-15: obstoj)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(preverjeno 2026-11-15: obstoj)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(preverjeno 2026-11-15: podrobnosti)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(preverjeno 2026-11-15: podrobnosti)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(preverjeno 2026-11-15: podrobnosti)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(preverjeno 2026-11-15: podrobnosti)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(preverjeno 2026-11-15: podrobnosti)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(preverjeno 2026-11-15: podrobnosti)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(preverjeno 2026-11-15: podrobnosti)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(preverjeno 2026-11-15: podrobnosti)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(preverjeno 2026-11-15: podrobnosti)*

<!-- kb:end -->
