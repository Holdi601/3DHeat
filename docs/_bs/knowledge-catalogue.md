---
title: "Katalog znanja"
parent: "Sočivo znanja"
nav_order: 2
lang: "bs"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Katalog znanja

Ovo je potpun spisak onoga što [sočivo znanja](knowledge.md) zna: obrasce koje traži, ideje, metode, historijske slučajeve i studije koje navodi, te knjige i radove iza njih. Koristite ga da pronađete unos po njegovom identifikatoru ili da provjerite izvor.

Ova stranica je generisana iz baze znanja pomoću `node tools/knowledge-doc.mjs`; ne uređujte između oznaka.

<!-- kb:begin -->

Baza znanja sadrži 579 unosa (135 koncepata, 37 metoda, 277 historijskih slučajeva, 17 principa dizajna, 113 studija) kroz 93 obrasca, uz 556 referenci.

### Obrasci (93)

| identifikator | porodica | kako izgleda u podacima |
|---|---|---|
| `concentration` | force | Strana koja dovede više jedinica na jedno mjesto pobjeđuje na tom mjestu s više od same brojčane prednosti. |
| `local-superiority` | force | Ubistva pripadaju onoj strani koja u dometu borbe ima više snaga od protivnika, bez obzira na ukupne brojeve. |
| `attrition` | force | Gubici prate snage obiju strana kroz vrijeme; borbu odlučuje ko prvi ostane bez resursa. |
| `exchange-ratio` | force | Broj ubistava po gubitku znatno se razlikuje po mjestu, strani ili klasi. |
| `aimed-fire` | force | Gubici rastu s brojem neprijatelja, ali ne i s vlastitim brojem. |
| `area-fire` | force | Gubici rastu s proizvodom brojeva obiju strana: gužva se kažnjava. |
| `defeat-in-detail` | force | Strana se uništava po dijelovima kako joj dijelovi stižu jedan po jedan. |
| `mutual-support` | force | Gubitak se brzo nadoknađuje obližnjim saigračem: razmjene. |
| `combined-arms` | force | Klase dobro rade zajedno tamo gdje jedna pokriva slabost druge, a loše same. |
| `class-counter` | force | Jedna klasa nesrazmjerno pobjeđuje protiv određene druge klase ili na određenom mjestu. |
| `initiative` | force | Ko prvi postigne rezultat u angažmanu, obično ga i dobije. |
| `key-terrain` | terrain | Isto nekoliko mjesta odlučuje borbe iz utakmice u utakmicu. |
| `fields-of-fire` | terrain | Mjesta koja daleko vide preko terena koji drugi moraju preći donose više ubistava. |
| `high-ground` | terrain | Ubistva se čine odozgo, s terena višeg od onog na kojem stoje žrtve. |
| `cover` | terrain | Smrti po vremenu padaju tamo gdje geometrija blokira vid i vatru. |
| `open-ground` | terrain | Smrti po vremenu rastu tamo gdje ništa ne blokira vid i vatru. |
| `kill-zone` | terrain | Smrti se gomilaju tamo gdje je kretanje prisiljeno kroz posmatran teren pod vatrom. |
| `chokepoint` | terrain | Mnogo prelazaka prolazi kroz malo prostora, uz gubitke tamo. |
| `reverse-slope` | terrain | Sigurnost odmah iza grebena ili zida, van direktnog pogleda neprijatelja. |
| `safe-ground` | terrain | Mjesto na kojem se provodi vrijeme, ali malo ko strada. |
| `obstacle` | terrain | Rute se savijaju oko blokiranog terena u nekoliko traka. |
| `flank` | movement | Rijetko korištena ruta vodi do više ubistava nego glavne. |
| `avenue-of-approach` | movement | Kretanje teče duž nekoliko traka između područja. |
| `mobility` | movement | Pokretne jedinice ginu manje (ili više) po vremenu nego spore ili nepokretne. |
| `static-exposure` | movement | Jedinice koje stoje ginu više po vremenu nego one u pokretu. |
| `interior-lines` | movement | Strana s kratkim rutama između svojih borbi mijenja snagu brže od druge. |
| `envelopment` | movement | Ubistva dolaze iz više pravaca na poziciju jedne strane. |
| `ambush` | movement | Jedinice koje se kreću duž rute brzo ginu od neprijatelja koji su već na položaju. |
| `spawn-pressure` | time | Životi brzo završavaju nakon početka na jednom mjestu pojavljivanja. |
| `tempo` | time | Brža strana stiže do borbe i postiže rezultat prije nego druga reaguje. |
| `surprise` | time | Gubici dolaze u naletu prije nego žrtve uzvrate vatru. |
| `energy-advantage` | air | Ubice imaju više visine i brzine od svojih žrtava. |
| `air-superiority` | air | Avioni jedne strane ubijaju mnogo puta više nego što gube. |
| `sead` | air | Protivvazdušna odbrana sa zemlje odnosi mnogo aviona dok je ne pronađu i unište. |
| `bvr` | air | Ubistva se dešavaju na velikoj udaljenosti, prije nego što žrtva može prići. |
| `fleet-salvo` | sea | Snaga koja prva zada udarac malo gubi; druga malo preživi da uzvrati. |
| `scouting` | sea | Strana koja prva pronađe drugu bira borbu. |
| `urban-close` | urban | Kratki dometi borbe, mnogo smrti među gustom geometrijom, spor pročišćavanje. |
| `vertical` | urban | Ubistva s gornjih spratova ili krovova na ulice. |
| `skill-dispersion` | people | Nekoliko igrača čini veliki dio ubistava ili smrti. |
| `ai-vs-player` | people | Jedinice kojima upravlja AI drukčije prolaze od igrača na istom mjestu. |
| `balance` | design | Strane, pojavljivanja ili klase kreću s neravnopravnim šansama. |
| `economy` | design | Resursi koji se zarade, potroše i izgube koncentrišu se na nekoliko mjesta ili igrača. |
| `flow` | design | Kako igrači prolaze kroz nivo: petlje, trake, slijepe ulice. |
| `sightlines` | design | Dugi vidni pravci odlučuju gdje borbe počinju i ko ih dobija. |
| `readability` | design | Smrti koje igrači ne mogu vidjeti unaprijed: s leđa, iz nevidljivog položaja. |
| `formation` | movement | Jedinice jedne strane kreću se zajedno u prepoznatljivom obliku: linija, kolona, klin, ešelon, kvadrat. |
| `frontal-assault` | movement | Grupa ide na neprijatelja ravno u lice njegovog fronta. |
| `double-envelopment` | movement | Dvije grupe napadaju oba boka jednog neprijateljskog tijela otprilike istovremeno. |
| `encirclement` | movement | Neprijateljska grupa ostaje okružena drugom stranom sa svih strana i s malo izlaza. |
| `penetration` | movement | Grupa prolazi kroz neprijateljsku liniju tamo gdje neprijatelji stoje s obje njene strane. |
| `fire-and-maneuver` | movement | Dio grupe se kreće dok ostatak stoji i pokriva ga, a uloge se izmjenjuju. |
| `feint` | movement | Mala grupa vuče neprijatelja na jedno mjesto; glavni napor udara drugdje ubrzo nakon toga. |
| `withdrawal` | movement | Grupa u kontaktu okreće se i povećava rastojanje od neprijatelja. |
| `pursuit` | movement | Grupa prati neprijatelja koji se udaljava, održavajući ili smanjujući rastojanje. |
| `defence-in-depth` | terrain | Branioci stoje u nekoliko pojaseva jedan iza drugog duž pravca neprijateljskog napredovanja. |
| `screening` | movement | Mali element se kreće daleko ispred svog glavnog tijela i prvi susreće neprijatelja. |
| `dispersion` | force | Strana se s vremenom širi; manje njenih jedinica dijeli isto mjesto. |
| `missile-defence` | air | Avioni pod prijetnjom rakete okreću prijetnju na bok ili rep: crank, notch, drag, pump. |
| `angles-fight` | air | Borba iz blizine na maloj brzini i velikoj brzini skretanja, vođena za položaj nosa, a ne za energiju. |
| `cap` | air | Avioni kruže oko fiksne stanice minutama, čekajući da neprijatelj dođe. |
| `strike-package` | air | Avioni različitih uloga lete zajedno do cilja; neki napadaju zemlju, drugi ih pokrivaju. |
| `line-of-battle` | sea | Brodovi plove u koloni jedan iza drugog tako da svi bokovi gađaju. |
| `crossing-the-t` | sea | Kolona prelazi preko čela neprijateljske kolone: svi njeni topovi gađaju, a malo neprijateljskih. |
| `fatal-funnel` | urban | Igrači koji uđu kroz jedna vrata, sobu ili usko grlo tu ginu u trenutku mnogo češće nego kad ulaze drugdje. |
| `crossfire` | force | Držaoci čije se linije vatre sastaju pod različitim uglovima pobjeđuju više dvoboja nego jedan držalac. |
| `peeker-advantage` | time | Igrač koji se pomjeri u vidno polje pobjeđuje u dvobojima protiv onoga ko drži ugao češće (ili rjeđe) nego u pola slučajeva. |
| `entry` | time | Prvo ubistvo u rundi odlučuje velik dio runde; ulasci pobjeđuju ili gube zavisno od mjesta i podrške. |
| `utility-support` | force | Bljesak ili dim neposredno prije dvoboja mijenja ko ga dobija. |
| `man-advantage` | force | Runde dobija strana s više živih igrača, a neke strane pretvaraju ili bacaju prednost. |
| `clutch` | people | Posljednji živi igrači pobjeđuju češće (ili rjeđe) nego što stanje runde predviđa. |
| `action-value` | people | Ubistva, razmjene, postavljanja i pomoćna sredstva razlikuju se po tome koliko mijenjaju šansu za pobjedu. |
| `lurk` | movement | Igrač sam daleko od tima ubija (ili ginu) drugom brzinom nego čopor. |
| `rotation` | movement | Koliko brzo strana pomjera igrače ka borbi ili cilju odlučuje hoće li zadržati ili vratiti. |
| `collective-order` | people | Pokretne jedinice jedne strane kreću se u istom smjeru mnogo češće nego što bi to slučajno bilo za njihove vlastite staze, pomaknute u vremenu. |
| `milling` | people | Jedinice jedne strane kruže oko zajedničkog centra: rotacija bez neto kretanja. |
| `herding` | people | Jedinice napuštaju mjesto onako kako je to učinio saigrač prije njih, mimo šansi samog mjesta i mimo kopiranja neprijatelja. |
| `lane-formation` | people | Suprotni tokovi drže odvojene trake; kretanje se koncentriše na nekoliko staza koje se koriste iz utakmice u utakmicu. |
| `crowding` | people | Brzina i tok padaju kad se jedinice nagomilaju; kroz usko grlo jače guranje propusti manje. |
| `leadership` | people | Neke jedinice se prve okrenu, a druge kopiraju njihov pravac nekoliko sekundi kasnije. |
| `cohesion` | people | Jedinice koje se odvoje od grupe ginu češće od onih koje ostaju uz nju. |
| `breaking-point` | people | Strana koja izgubi dio snage prestaje da se približava i povlači se, mimo onoga što objašnjava njena udaljenost od neprijatelja. |
| `panic` | people | Pod iznenadnom prijetnjom jedinice se razbježe, odlaze brzo ili se ukoče, a koordinacija se raspadne. |
| `loss-chasing` | people | Nakon gubitka jedinice preuzimaju više (ili manje) rizika nego nakon dobitka. |
| `hot-hand` | people | Uspjeh se češće nastavlja uspjehom nego što to dopuštaju izmiješani nizovi istog igrača. |
| `conformity` | people | Članovi jedne strane biraju slično - kupovine, opremu, rute - mimo sopstvenih sklonosti. |
| `suppression` | people | Dolazna vatra mijenja način na koji se jedinice kreću i gađaju, čak i kad ne ubija. |
| `social-loafing` | people | Akcija po glavi opada što je prisutno više saigrača. |
| `mixed-strategy` | people | Izbori koji bi trebali biti nepredvidivi postaju obrasci: jedna opcija pobjeđuje češće, ili izbori teku u nizovima. |
| `coordination` | people | Članovi djeluju usklađeno bez vidljivih naređenja: usklađeno kretanje, tajming i izbori. |
| `contagion` | people | Stanje prelazi s jedinice na jedinicu dodirom ili blizinom i širi se kroz mapu. |
| `territoriality` | people | Jedinice drže razmak jedna od druge i ostaju na svom tlu. |
| `interaction-network` | people | Ko se bori, podržava i prati koga čini mrežu s čvorištima, grupama i mostovima. |

### Koncepti (135)

| identifikator | naziv | sočiva | obrasci | izvori |
|---|---|---|---|---|
| `concept.lanchester-square` | Lanchesterov zakon kvadrata (ciljana vatra) | military, air, naval, esports | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Lanchesterov linearni zakon (područna vatra, jedan na jedan) | military, urban, esports | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Koncentracija snaga (masa) | military, air, naval, esports | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Odnosi snaga i pravilo 3:1 | military | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Odnos razmjene gubitaka | military, air, esports, design | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Borbena moć i njeni množioci | military | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Savremeni sistem upotrebe snaga | military | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | OODA petlja (posmatraj-orijentiši-odluči-djeluj) | military, air, esports | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Teorija energije i manevrisanja | air | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Osnovni borbeni manevri i borbeno manevrisanje u vazduhu | air | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Analiza terena: OAKOC / KOCOA | military, design, urban | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: varijable misije | military | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Ključni i odlučujući teren | military, design, esports | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Osmatranje i polja vatre | military, design, esports, urban | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Zaklon i maskiranje | military, urban, design | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Pravci prilaza i koridori kretanja | military, design | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Uska grla i klanci | military, design, esports | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Područja angažmana i zone ubijanja | military, urban, design | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Odbrana s povratne kosine i zaklon u depresiji | military, design | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Visoko tlo | military, design | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Unutrašnje i vanjske linije | military | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Poraz po dijelovima | military, esports | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Međusobna podrška | military, air, esports | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Kombinovani rodovi | military, design | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Potiskivanje vatrom | military, urban | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Potiskivanje i uništavanje protivvazdušne odbrane neprijatelja (SEAD/DEAD) | air, military | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Borbena patrola iz vazduha i vazdušna prevlast | air | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Angažman izvan vidnog dometa | air | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Indirektni prilaz | military, esports, design | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Obuhvat i okruženje | military | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Zasjeda | military, esports, design | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Odbrana u dubini | military | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Trenje i magla rata | military, esports | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Kulminaciona tačka napada | military | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Iznenađenje | military, air, naval, esports | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Ekonomija snaga | military, esports | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Urbani teren | urban, military, esports | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Kontrola mora i odlučujuća bitka flota | naval | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Hughesov model salvi: napasti efikasno prvi | naval, air | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Teorija traganja i otkrivanja | naval, air, military | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Operaciona istraživanja: mjere efektivnosti | military, air, naval, design | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Ratne igre kao analiza | military, design | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Ratovanje manevrom | military, esports | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Kohezija i moralni faktor | military | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Centar gravitacije | military | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Odlučujuće tačke | military, esports | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Linije operacija | military | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Strategije uništenja i iscrpljivanja | military | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Duboka bitka i duboke operacije | military | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle (zračno-kopnena bitka) | military, air | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Komandovanje zadacima (Auftragstaktik) | military, esports | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Proboj i iskorištavanje | military | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Vatra i kretanje | military, esports | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Skakutavo kretanje uz osmatranje | military, esports | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Izviđačko izvlačenje i infiltracija | military, esports | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | Rezerva | military, esports | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Elastična odbrana i protunapad | military | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | Lanac ubijanja (pronaći, fiksirati, pratiti, ciljati, angažovati, procijeniti) | military, air, naval | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Domet otkrivanja naspram dometa angažmana | air, naval, military | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Vrijednost efektivnosti borbe | military, esports | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Rasprostiranje na bojištu | military, esports | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Bliska vazdušna podrška | air, military | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Vazdušna interdikcija | air, military | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Pratnja naspram lovačke pročišćavajuće misije | air | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Borba energijom naspram borbe skretanjem | air | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Vodeća, čista i zaostajuća potjera | air | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Thach weave (Thachov zavoj) | air | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Četvorka prstiju i borbeni par | air | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Flota u postojanju | naval | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Prelazak preko T | naval, military | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Konvoj | naval | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Pristup zabranjen i zabrana područja (A2/AD) | naval, air, military | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Odbrana uporišta u izgrađenim područjima | urban, military | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Probijanje rupa u zidovima i kretanje kroz zgrade (mouseholing) | urban, military, design | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Opsada | military, urban | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Gerilsko ratovanje | military, urban | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Protivpobuna | military, urban | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Utočište | military, design | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Obmana (maskirovka) | military, esports | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Informaciona prednost | military, esports | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Ekonomske runde i resursni tempo | esports, design | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Formacije kretanja: linija, kolona, klin, ešelon | military, esports | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Frontalni napad | military | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Dvostruki obuhvat (kliješta) | military | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Okruženje i džep | military | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Prodor i proboj | military | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Potjera | military | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Povlačenje: odstupanje, odlaganje i povlačenje | military | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Finta i demonstracija | military, esports | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Zaštita, straža i pokrivanje: osiguranje ispred glavnog tijela | military | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Odbrana od rakete: crank, notch, drag i pump | air | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Formacije izvan vidnog dometa: zid, vodeći-zaostali, mlin, kliješta | air | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Borba uglova i borba energijom | air | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Udarni paket i redoslijed potiskivanja | air | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | Borbena linija | naval | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | Smrtonosni lijevak | urban, military, esports, design | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Čišćenje prostorije: iznenađenje, brzina, kontrolisano nasilje | urban, military, esports | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Tačke dominacije | urban, military, esports | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Pregledanje uglova: rezanje pite | urban, military, esports | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Unakrsna vatra i međusobno povezana polja vatre | military, urban, esports, design | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Prednost onoga ko viri | esports, design | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Prednost u broju igrača u eliminacionim rundama | esports, military | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Ulazak i otvarajući dvoboj | esports, urban | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Pomoćna sredstva prije ulaska: bljesak i dim | esports, urban, military | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Model društvene sile pješačkog kretanja | design, urban, military | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Formiranje traka u protivnom toku | design, urban | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Brže je sporije | design, urban, military | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Osnovni dijagram gomile | design, urban | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Formiranje staza i željene linije | design, military | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Panika je rijetka: kolektivna otpornost | military, urban, design | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boidi: razdvajanje, usklađivanje, kohezija | design, military | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Parametar reda i nastanak kolektivnog kretanja | design, military, air, naval | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Jato, kruženje i polarizovana stanja | design, military, naval | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Efikasno vođstvo bez signala | military, esports, design | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Susjedi po broju, a ne po udaljenosti | air, military | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Inteligencija jata | design, esports, military | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Stado i informacijske kaskade | esports, design, military | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Društveno zalaganje manje (social loafing) | esports, design, military | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Rasplinjavanje odgovornosti | esports, military | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Kohezija primarne grupe | military, esports | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Tačke lomljenja i pragovi gubitaka | military | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Potiskivanje: šta vatra radi osim ubijanja | military, urban | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Strah i stres u borbenim odlukama | military, esports | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Gubljenje pod pritiskom | esports | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Teorija izgleda i averzija prema gubitku | esports, design | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Efekti izjednačenja i novca iz kuće | esports | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Tilt (gubitak kontrole nad igrom) | esports | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Utopljeni trošak | esports, military | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | Vrući niz i zabluda o njemu | esports | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Mješovite strategije: biti nepredvidiv | esports, design, military | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Zajednički mentalni modeli | esports, military | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Komponente timskog rada | esports, military | coordination, leadership, mutual-support | Salas et al. 2005 |

| `concept.virtual-worlds-labs` | Virtuelni svjetovi kao laboratorije ponašanja | design, esports | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Lični prostor i teritorija | design, urban | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Mreže interakcija: čvorišta i slabe veze | esports, design | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Metode (37)

| identifikator | naziv | obrasci | izvori |
|---|---|---|---|
| `method.lanchester-fit` | Usklađivanje Lanchesterovih eksponenata s podacima angažmana | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Odnos razmjene po strani i po mjestu | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Lokalni odnos snaga u trenutku svakog ubistva | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Vidno polje: polja vatre po liniji vida | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Specifična energija pri ubistvima i smrtima (vazduh) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Postojanost žarišta kroz utakmice | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Stopa razmjena (međusobna podrška) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Angažmani i prednost prvog ubistva | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Prostorna autokorelacija smrti (Moranovo I) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Stope u odnosu na osnovu same mape uz kontrolu FDR | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Obavještajna priprema bojišta (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Modeli ocjenjivanja poređenjem u parovima (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Vjerovatnoća pobjede i vrednovanje akcija | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Kontrola prostora i kontrola terena | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Jednačina salvi usklađena s brodovima u kontaktu | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Odnos borbene efektivnosti po jedinici-satu u akciji | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Domet od otkrivanja do angažmana i dometi angažmana | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Vremenski tok lanca ubijanja | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Rasprostiranje naspram udjela ubistava (koncentracija snaga u vremenu) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Stopa gubitaka i ubistava po letu | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Model vjerovatnoće pobjede u rundi | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Vrijednost akcije: dodana vjerovatnoća pobjede | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Prilagođeni plus-minus ridge regresijom (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Skupljanje procjena: empirijski Bayes | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Očekivani ishodi: od očekivanih golova do očekivanih dvoboja | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Mjerenje postavki, rotacija i vrebanja | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Problem refleksije: kopiranje ili zajednički uzrok | herding, conformity | Manski 1993 |
| `method.streak-correction` | Nizovi uz korekciju konačnog niza | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Parametri polarizacije i kruženja | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Vođe iz korelacije pravca s vremenskim kašnjenjem | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Test kaskade ruta za stadno ponašanje | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Razdvajanje traka i postojanost staza | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Hazard zaostajanja | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Kriva lomljenja | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Odgovor na dolaznu vatru | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Rizik nakon gubitka ili dobitka | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Sporazum o kupovini (Fleissov kappa) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Historijski slučajevi (277)

| identifikator | slučaj | kada | razmjer | obrasci | izvori |
|---|---|---|---|---|---|
| `case.thermopylae` | Termopile | 480. p. n. e. | bitka | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamis | 480. p. n. e. | bitka | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Marathon | 490. p. n. e. | bitka | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuctra | 371. p. n. e. | bitka | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331. p. n. e. | bitka | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Trasimensko jezero | 217. p. n. e. | bitka | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Cannae | 216. p. n. e. | bitka | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Teutoburška šuma | n. e. 9 | bitka | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | bitka | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Stirlingski most | 1297 | bitka | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Agincourt | 1415 | bitka | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen | 1757 | bitka | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlic | 1805 | bitka | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | bitka | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | bitka | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: Maryjeve visoravni | 1862 | angažman | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | angažman | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: Pickettov juriš | 1863 | angažman | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | bitka | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | angažman | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | kampanja | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | Somme, prvi dan | 1. jul 1916 | bitka | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | kampanja | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jutland | 1916 | bitka | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939-40 | bitka | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan i Ardeni | maj 1940 | kampanja | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Arrasov protunapad | 21. maj 1940 | angažman | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Bitka za Britaniju | jul-okt 1940 | kampanja | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Bitka za Atlantik: operaciona istraživanja konvoja | 1939-45 | kampanja | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | jun 1942 | bitka | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Drugi El Alamein | okt-nov 1942 | bitka | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Kasserine Pass | feb 1943 | bitka | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Staljingrad | avg 1942-feb 1943 | kampanja | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kursk | jul 1943 | kampanja | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prohorovka | 12. jul 1943 | angažman | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13. jun 1944 | angažman | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Normandijski živi plotovi | jun-jul 1944 | kampanja | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Operacija Cobra | jul 1944 | kampanja | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Leyte Gulf | okt 1944 | bitka | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | dec 1944 | bitka | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Cušima | maj 1905 | bitka | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Inčon | sep 1950 | kampanja | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | MiG Alley | 1950-53 | kampanja | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | bitka | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | nov 1965 | angažman | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operacija Bolo | 2. jan 1967 | angažman | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golan: Dolina suza | okt 1973 | bitka | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Sinaj: Kineska farma | okt 1973 | bitka | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Dolina Bekaa (operacija Mole Cricket 19) | jun 1982 | bitka | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Vazdušni rat za Falklande | maj-jun 1982 | kampanja | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Vazdušna kampanja Pustinjske oluje | jan-feb 1991 | kampanja | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26. feb 1991 | angažman | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadiš | okt 1993 | angažman | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Grozni | dec 1994-feb 1995 | bitka | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hue | jan-mar 1968 | bitka | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Vazdušna kampanja na Kosovu | mar-jun 1999 | kampanja | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Falluđa (operacija Al Fajr) | nov 2004 | bitka | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mosul | 2016-17 | kampanja | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Kadeš | oko 1274. p. n. e. | bitka | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Issus | 333. p. n. e. | bitka | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202. p. n. e. | bitka | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Carrhae | 53. p. n. e. | bitka | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Farsal | 48. p. n. e. | bitka | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianopolj | n. e. 378 | bitka | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Yarmouk | n. e. 636 | bitka | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manzikert | 1071 | bitka | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hitin | 1187 | bitka | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
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
| `case.jena-auerstedt` | Jena-Auerstedt | 1806 | bitka | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodino | 1812 | bitka | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Leipzig | 1813 | bitka | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | bitka | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | bitka | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | kampanja | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadowa) | 1866 | bitka | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | bitka | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | bitka | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurman | 1898 | bitka | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | angažman | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Galipoli | 1915 | kampanja | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | nov 1917 | bitka | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Caporetto | okt-nov 1917 | kampanja | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Njemačka proljetna ofanziva (operacija Michael) | mar-apr 1918 | kampanja | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | avg 1918 | bitka | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Halhin Gol (Nomonhan) | avg 1939 | bitka | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | Poljska kampanja | sep 1939 | kampanja | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut i Gembloux | maj 1940 | bitka | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | maj 1940 | angažman | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Dunkirkski obruč | maj-jun 1940 | kampanja | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operacija Compass i Beda Fomm | dec 1940-feb 1941 | kampanja | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Operacija Crusader i Sidi Rezegh | nov-dec 1941 | kampanja | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | maj-jun 1942 | bitka | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alam Halfa | avg-sep 1942 | bitka | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno-Brody | jun 1941 | bitka | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Okruženje Kijeva | sep 1941 | kampanja | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moskva | okt 1941-jan 1942 | kampanja | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Ržev i operacija Mars | 1942 | kampanja | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Drugi Harkov | maj 1942 | bitka | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Treći Harkov (Mansteinov udarac unazad) | feb-mar 1943 | kampanja | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operacija Bagration | jun-avg 1944 | kampanja | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Džep Korsun-Čerkasi | jan-feb 1944 | bitka | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Džep Kamenec-Podoljski | mar-apr 1944 | kampanja | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operacija Epsom | jun 1944 | bitka | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operacija Goodwood | jul 1944 | bitka | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operacija Totalize | avg 1944 | bitka | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | avg 1944 | bitka | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Falaise: džep | avg 1944 | kampanja | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden i Arnhem | sep 1944 | kampanja | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Aachen | okt 1944 | bitka | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Hürtgenska šuma | sep 1944-feb 1945 | kampanja | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | sep 1944 | bitka | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | St. Vith | dec 1944 | bitka | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Elsenborn Ridge | dec 1944 | bitka | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Seelowske visoravni | apr 1945 | bitka | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlin | apr-maj 1945 | bitka | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operacija Spring Awakening | mar 1945 | bitka | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | dec 1943 | bitka | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Varšavski ustanak | avg-okt 1944 | kampanja | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | nov 1943 | bitka | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | sep-nov 1944 | bitka | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | feb-mar 1945 | bitka | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinawa | apr-jun 1945 | kampanja | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manila | feb-mar 1945 | bitka | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Mandžurija (avgustovska oluja) | avg 1945 | kampanja | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Pusanski obruč | avg-sep 1950 | kampanja | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Rezervoar Chosin | nov-dec 1950 | kampanja | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Rijeka Imjin | apr 1951 | bitka | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapyong | apr 1951 | bitka | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | apr i jul 1953 | angažman | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | jan-apr 1968 | bitka | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | nov 1967 | bitka | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (planina Ap Bia) | maj 1969 | angažman | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila-Um Katef | jun 1967 | bitka | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailija | okt 1973 | bitka | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | jun 1982 | angažman | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Opsada Bejruta | jun-avg 1982 | kampanja | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Liban 2006: Bint Džbejl i prijetnja oklopnim vozilima | jul-avg 2006 | kampanja | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Faw | feb 1986 | bitka | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basra (Karbala-5) | jan-feb 1987 | bitka | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Khafji | jan-feb 1991 | bitka | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Cilj Norfolk | 26-27. feb 1991 | bitka | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medina Ridge | 27. feb 1991 | bitka | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Lažne manevre u Wadi al-Batinu | feb 1991 | kampanja | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nasirija | mar 2003 | bitka | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Cilj Peach | apr 2003 | angažman | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Thunder Runs | apr 2003 | bitka | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Prolaz Debecka | apr 2003 | angažman | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramadi | 2006-07 | kampanja | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadr Siti | mar-maj 2008 | bitka | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Operacija Anaconda | mar 2002 | bitka | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | jul 2008 | angažman | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | okt 2009 | angažman | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala i položajne kuće čete | 2006-07 | kampanja | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Bitka za Alžir | 1956-57 | kampanja | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Rodezijska Fireforce | 1974-79 | kampanja | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Opsada Sarajeva | 1992-96 | kampanja | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Grozni 1999-2000 | dec 1999-feb 2000 | bitka | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Rusko-gruzijski rat | avg 2008 | kampanja | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopilja | jul 2014 | angažman | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovajsk | avg 2014 | bitka | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debaljceve | jan-feb 2015 | bitka | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Aerodrom Donjeck | sep 2014-jan 2015 | bitka | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Aerodrom Hostomel | feb 2022 | angažman | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | Kijevska osovina i zasjeda kod Brovarija | mar 2022 | angažman | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Mariupolj i Azovstal | feb-maj 2022 | bitka | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Harkovska protuofanziva | sep 2022 | kampanja | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Prelaz preko Sjeverskog Donjca kod Bilohorivke | maj 2022 | angažman | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bahmut | avg 2022-maj 2023 | bitka | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Zaporoška ofanziva | jun-nov 2023 | kampanja | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Rat u Nagorno-Karabahu | sep-nov 2020 | kampanja | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Blitz | sep 1940-maj 1941 | kampanja | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: prvi dan u vazduhu | 22. jun 1941 | bitka | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Kreta | maj 1941 | bitka | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Opsada Malte | 1940-1942 | kampanja | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Vazdušni most za Staljingrad | nov 1942-feb 1943 | kampanja | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Vazdušne bitke nad Kubanom | apr-jun 1943 | kampanja | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kursk u vazduhu | jul 1943 | bitka | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operacija Bagration u vazduhu | jun-avg 1944 | kampanja | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploješti (operacija Tidal Wave) | 1. avg 1943 | angažman | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Napad na brane (operacija Chastise) | 16-17. maj 1943 | angažman | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hamburg (operacija Gomorrah) | jul-avg 1943 | bitka | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt-Regensburg | 17. avg 1943 | bitka | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Drugi Schweinfurt ("Crveni četvrtak") | 14. okt 1943 | angažman | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Velika sedmica (operacija Argument) | feb 1944 | kampanja | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Napad na Nürnberg | 30-31. mar 1944 | angažman | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operacija Bodenplatte | 1. jan 1945 | bitka | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Bitka u Bizmarkovom moru | mar 1943 | bitka | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Neutralisanje Rabaula | 1943-1944 | kampanja | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Filipinsko more ("Lov na ćurke na Marijanama") | jun 1944 | bitka | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Crveni utorak iznad Namsija | 23. okt 1951 | angažman | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operacija Rolling Thunder | 1965-1968 | kampanja | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Most Thanh Hoa | 1965-1972 | angažman | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | Wild Weasels | 1965-1973 | kampanja | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Izvještaj Aulta i Top Gun | 1968-1972 | kampanja | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operacija Linebacker | maj-okt 1972 | kampanja | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II ("Jedanaestodnevni rat") | dec 1972 | kampanja | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operacija Focus (Moked) | 5. jun 1967 | bitka | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Rat na iscrpljivanje: pojas raketa | 1969-1970 | kampanja | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | Protivvazdušni kišobran nad kanalom | okt 1973 | bitka | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (operacija Opera) | 7. jun 1981 | angažman | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operacija El Dorado Canyon | 15. apr 1986 | angažman | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Vazdušni rat Iran-Irak | 1980-1988 | kampanja | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Napadi Black Buck | maj-jun 1982 | angažman | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: planiranje zalivske vazdušne kampanje | avg 1990-jan 1991 | kampanja | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Radna grupa Normandija: prvi udar helikoptera Apache | 17. jan 1991 | angažman | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | Veliki lov na Scud | jan-feb 1991 | kampanja | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Grebeni Mutla ("Autoput smrti") | 26-27. feb 1991 | angažman | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operacija Anaconda: helikopteri Apache u Shahi-Kotu | mar 2002 | bitka | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | Napad helikoptera Apache kod Karbale | 24. mar 2003 | angažman | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | Libijska vazdušna kampanja | mar-okt 2011 | kampanja | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Nagorno-Karabah: dronovi i protivvazdušna odbrana | sep-nov 2020 | kampanja | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ukrajina: osporavani vazduh | 2022 | kampanja | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Aerodrom Hostomel | feb 2022 | angažman | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | feb-mar 1971 | kampanja | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operacija Eagle Claw | apr 1980 | angažman | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Avganistan: Stinger | 1986-1989 | kampanja | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | bitka | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | Španska armada | 1588 | kampanja | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Quiberon Bay | 1759 | bitka | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | Chesapeake (Virginia Capes) | 1781 | bitka | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Nil (zaliv Aboukir) | 1798 | bitka | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Kopenhagen | 1801 | bitka | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | mar 1862 | angažman | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Viš (Lissa) | 1866 | bitka | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Jalu | 1894 | bitka | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Manilski zaliv | 1898 | bitka | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Helgolandski zaliv | avg 1914 | bitka | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel i Falklandi | nov-dec 1914 | kampanja | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Dogger Bank | jan 1915 | bitka | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | Río de la Plata | dec 1939 | bitka | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Taranto | nov 1940 | angažman | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Rt Matapan | mar 1941 | bitka | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Danski tjesnac i potapanje Bismarcka | maj 1941 | kampanja | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7. dec 1941 | angažman | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales i Repulse | 10. dec 1941 | angažman | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Javansko more | feb 1942 | bitka | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Koraljno more | maj 1942 | bitka | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Savo | avg 1942 | bitka | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Istočni Solomoni | avg 1942 | bitka | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Rt Esperance | okt 1942 | bitka | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Ostrva Santa Cruz | okt 1942 | bitka | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Pomorska bitka kod Guadalcanala | 12-15. nov 1942 | bitka | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | nov 1942 | angažman | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | Probijanje kroz Kanal | feb 1942 | angažman | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operacija Pedestal | avg 1942 | bitka | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Crveni maj | maj 1943 | kampanja | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Nordkap | dec 1943 | bitka | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | Američka podmornička kampanja protiv Japana | 1941-1945 | kampanja | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Kod Samara | 25. okt 1944 | bitka | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Tjesnac Surigao | 25. okt 1944 | bitka | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinawa: kamikaze kampanja | apr-jun 1945 | kampanja | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Potapanje Eilata | okt 1967 | angažman | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakija | okt 1973 | bitka | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | Potapanje General Belgrana | 2. maj 1982 | angažman | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | Gubitak HMS Sheffielda | 4. maj 1982 | angažman | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17. maj 1987 | angažman | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operacija Praying Mantis | 18. apr 1988 | bitka | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | avg 2004 | angažman | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Bisu revolucija | mar 2007 | bitka | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | Dream Coil na The International 2013 | avg 2013 | angažman | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Fakerov Zed protiv Ryua | sep 2013 | angažman | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Nadvožnjak i pojačanje | nov 2014 | angažman | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | Skakanje s AWP-om na Miragu | apr 2016 | angažman | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis i era pomoćnih sredstava | 2018 | kampanja | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five protiv OG | apr 2019 | bitka | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar dostiže grandmastera | 2019 | kampanja | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Lijeva kuka (kopnena ofanziva operacije Pustinjska oluja) | 24-28. februar 1991 | kampanja | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | Incident "Corrupted Blood" | septembar 2005 | kampanja | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Dizajn igara i nivoa (17)

| identifikator | naziv | obrasci | izvori |
|---|---|---|---|
| `design.chokepoint` | Uska grla u dizajnu nivoa | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Bočne rute i alternativni putevi | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Vidni pravci i daljina angažmana | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Raspored zaklona i ritam | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Dizajn pojavljivanja i zaštita pri pojavljivanju | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Ravnoteža simetričnih i asimetričnih mapa | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Ravnoteža klasa i protivteže | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Tok, petlje i čitljivi rasporedi | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Ekonomije igara i povratne petlje | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Uparivanje igrača i raspon vještine | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | AI protivnici kao sonde nivoa | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Smislena igra i izbor | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Razmjene i timska igra u pucačinama | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Kontrola mape | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Toplotne mape i prostorna telemetrija u dizajnu | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Ovladavanje, učenje i zabava | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Ekonomije rundi i odluke o kupovini | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |
### Studije (113)

| identifikator | naziv | izvori |
|---|---|---|
| `study.engel-1954` | Engel: Lanchesterov zakon kvadrata na Iwo Jimi | Engel 1954 |
| `study.bracken-1995` | Bracken: Lanchesterovi modeli za Ardene | Bracken 1995 |
| `study.fricker-1998` | Fricker: ponovni pregled modela iscrpljivanja za Ardene | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas i Turkes: Kursk i Ardeni | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley i Helmbold: provjera zakona kvadrata | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | GIS analiza smrti igrača | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: vizuelizacija takmičarskog ponašanja | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Vrednovanje akcija u Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Otkrivanje susreta u e-sportu | Schubert et al. 2016 |
| `study.red-baron` | Projekat Red Baron: vazdušni boj iznad Vijetnama | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: kvantifikovana procjena historijskih bitki | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: upotreba snaga objašnjava ishode | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Pregled vizuelizacije podataka iz igre | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Lanchester naspram tri vijeka kopnenih bitki | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: šezdeset angažmana Drugog svjetskog rata | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: modeli borbe i američki građanski rat | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: statistički model podataka o iscrpljivanju | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: stope napredovanja u kopnenoj borbi | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas i Dinges: okolnosti važnije od zakona | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | Baza podataka o Kursku | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | Baza podataka kampanje u Ardenima | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson i MacKay: Bitka za Britaniju kao Lanchesterovi podaci | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte i Schmidt: brojevi i dalje pobjeđuju bitke | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: pravilnosti gubitaka u bitkama | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Dupuyjev taktički numerički deterministički model | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: rat brojevima | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: borbena moć | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter i Stam: demokratije u ratu | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: adaptivni dinamički model | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester i gerilski rat | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: stohastički model salvi | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: temelji taktike flote | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | Rasprava o pravilu 3:1 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: modeliranje oružanih sukoba | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Izvještaj Aulta: rakete ispaljene izvan svoje ovojnice | Ault 1969; Michel 1997 |
| `study.gwaps` | Pregled zračne moći u Zaljevskom ratu | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Blackettov cirkus | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Podešavanja dubinskih bombi u obalnoj komandi | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Bijele donje strane protupodmorničkih aviona | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: oklop tamo gdje pogođeni bombarderi nisu bili | Mangel & Samaniego 1984 |
| `study.optimal-search` | Optimalna potraga: od podmornica do AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: borba u paklu | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Pristup zabranjen i zabrana područja | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Kako igrači gube interes | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Grupisanje ponašanja igrača u prirodi | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Otkrivanje frustracije igrača | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: kontrolne table telemetrije u produkciji | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: vizuelna analitika igranja | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Kretanje avatara na bojnim poljima World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: instrumentalizacija korisničkih testova u velikom obimu | Kim et al. 2008 |
| `study.game-data-science` | Nauka o podacima igara | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Vještačka inteligencija i igre | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Vještina i kretanje tima u Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Obrasci borbe koji predviđaju pobjede u MOBA | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Uloge igrača u Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Predviđanje ishoda Dota 2 iz izbora heroja | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Predviđanje pobjede uživo u profesionalnom e-sportu | Hodge et al. 2021 |
| `study.rioult-2014` | Topologija pozicija igrača | Rioult et al. 2014 |
| `study.bednarek-2017` | Ocjenjivanje igrača u timskim pucačinama | Bednárek et al. 2017 |
| `study.katona-2019` | Predviđanje ko će sljedeći ginuti | Katona et al. 2019 |
| `study.block-2018` | Priče zasnovane na podacima za publiku e-sporta | Block et al. 2018 |
| `study.ggviz` | ggViz: pretraga stanja igre u velikom obimu | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: učenje s pojačanjem velikog obima u Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: nivo grandmastera u StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Očekivana vrijednost posjeda u košarci | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: vrednovanje akcija s loptom u fudbalu | Decroos et al. 2019 |
| `study.pitch-control` | Kontrola terena i stvaranje prostora | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | Prostorna struktura odbrambene vještine | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Uloge u timu iz podataka praćenja | Lucey et al. 2013 |
| `study.shot-quality` | Očekivani golovi i kvalitet udarca | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: prostorna efikasnost šuta | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Prostorno-vremenska analiza timskih sportova | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Ripleyjevo K: grupisanje na svakoj skali | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark i Evans: rasipanje po najbližem susjedu | Clark & Evans 1954 |
| `study.getis-ord` | Getis-Ord žarišta | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Lokalni pokazatelji prostorne povezanosti | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | Prostorna statistika skeniranja | Kulldorff 1997 |
| `study.kde` | Procjena gustine jezgrom | Silverman 1986 |
| `study.knox-1964` | Prostorno-vremenska interakcija | Knox 1964; Diggle 2013 |
| `study.maup` | Problem promjenjive prostorne jedinice | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Izovisti i grafovi vidljivosti | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Prostorna sintaksa | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Srednje zgušnjavanje | Lloyd 1967 |
| `study.survival-analysis` | Analiza preživljavanja za vrijeme do smrti | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Generalizovani linearni modeli za brojanja | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap i intervalne procjene | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey i saradnici: kašnjenje i prednost onoga ko viri | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee i Chang: pucanj iza ugla | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: kašnjenje i akcije igrača | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos i saradnici: profesionalci i amateri kroz vjerovatnoću pobjede | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos i saradnici: ekonomske odluke u Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: pametna ubistva i bezvrijedne smrti | Maymin 2021 |
| `study.moba-live-prediction` | Predviđanje ishoda uživo u MOBA | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa i saradnici: runde Valoranta iz taktičkih obilježja | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv i saradnici: uloge u profesionalnom Counter-Strike 2 | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim i saradnici: obuka za borbu iz bliskog dometa | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Turbulencije gomile na hadžu 2006 | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Grupe koje hodaju oblikuju gomile | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Hijerarhijska dinamika grupa u jatima golubova | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Društveni uticaj čini uspjeh nejednakim i nepredvidivim | Salganik et al. 2006 |
| `study.wisdom-undermined` | Društveni uticaj potkopava mudrost gomile | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | Privlačna snaga gomile | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Konformizam prema jednoglasnoj većini | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: motivacija za borbu u Iraku | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Kohezija i učinak: metaanalize | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Averzija prema gubitku među profesionalnim golferima | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Vrući niz u bejzbolu | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Penali: profesionalci igraju minimaks | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Minimaks igra na Wimbledonu | Walker & Wooders 2001 |
| `study.collective-intelligence` | Kolektivna inteligencija timova | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Društvene mreže jednog online svijeta | Szell et al. 2010 |
| `study.team-networks` | Mreže dodavanja i učinak tima | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Ponašanje se širi kroz klastrovane mreže | Centola 2010 |

### Bibliografija

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(provjereno 2026-11-15: detalji)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(provjereno 2026-11-15: detalji)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(provjereno 2026-11-15: detalji)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(provjereno 2026-11-15: detalji)*
- Ammianus Marcellinus (trans. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(provjereno 2026-11-15: detalji)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(provjereno 2026-11-15: detalji)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(provjereno 2026-11-15: detalji)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(provjereno 2026-11-15: detalji)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(provjereno 2026-11-15: detalji)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(provjereno 2026-11-15: detalji)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(provjereno 2026-11-15: detalji)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(provjereno 2026-11-15: detalji)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(provjereno 2026-11-15: detalji)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(provjereno 2026-11-15: detalji)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(provjereno 2026-11-15: detalji)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(provjereno 2026-11-15: detalji)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(provjereno 2026-11-15: detalji)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(provjereno 2026-11-15: detalji)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(provjereno 2026-11-15: detalji)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(provjereno 2026-11-15: detalji)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(provjereno 2026-11-15: detalji)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(provjereno 2026-11-15: detalji)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(provjereno 2026-11-15: detalji)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(provjereno 2026-11-15: detalji)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(provjereno 2026-11-15: detalji)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(provjereno 2026-11-15: detalji)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(provjereno 2026-11-15: detalji)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(provjereno 2026-11-15: postojanje)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(provjereno 2026-11-15: detalji)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(provjereno 2026-11-15: detalji)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(provjereno 2026-11-15: detalji)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(provjereno 2026-11-15: detalji)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(provjereno 2026-11-15: detalji)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(provjereno 2026-11-15: detalji)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(provjereno 2026-11-15: postojanje)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(provjereno 2026-11-15: detalji)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(provjereno 2026-11-15: detalji)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(provjereno 2026-11-15: detalji)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(provjereno 2026-11-15: detalji)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(provjereno 2026-11-15: detalji)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(provjereno 2026-11-15: detalji)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(provjereno 2026-11-15: postojanje)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(provjereno 2026-11-15: detalji)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(provjereno 2026-11-15: detalji)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(provjereno 2026-11-15: detalji)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(provjereno 2026-11-15: detalji)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(provjereno 2026-11-15: postojanje)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(provjereno 2026-11-15: detalji)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(provjereno 2026-11-15: detalji)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(provjereno 2026-11-15: detalji)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(provjereno 2026-11-15: detalji)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(provjereno 2026-11-15: postojanje)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(provjereno 2026-11-15: detalji)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(provjereno 2026-11-15: detalji)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(provjereno 2026-11-15: detalji)*
- Caesar, G. J. (trans. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(provjereno 2026-11-15: detalji)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(provjereno 2026-11-15: detalji)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(provjereno 2026-11-15: detalji)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(provjereno 2026-11-15: detalji)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(provjereno 2026-11-15: detalji)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(provjereno 2026-11-15: detalji)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(provjereno 2026-11-15: detalji)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(provjereno 2026-11-15: detalji)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(provjereno 2026-11-15: detalji)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(provjereno 2026-11-15: detalji)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(provjereno 2026-11-15: detalji)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(provjereno 2026-11-15: detalji)*
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(provjereno 2026-11-15: detalji)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(provjereno 2026-11-15: detalji)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(provjereno 2026-11-15: detalji)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(provjereno 2026-11-15: detalji)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(provjereno 2026-11-15: detalji)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(provjereno 2026-11-15: detalji)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(provjereno 2026-11-15: detalji)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(provjereno 2026-11-15: postojanje)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(provjereno 2026-11-15: detalji)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(provjereno 2026-11-15: detalji)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(provjereno 2026-11-15: detalji)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(provjereno 2026-11-15: postojanje)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(provjereno 2026-11-15: postojanje)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(provjereno 2026-11-15: detalji)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(provjereno 2026-11-15: detalji)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(provjereno 2026-11-15: detalji)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(provjereno 2026-11-15: postojanje)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(provjereno 2026-11-15: detalji)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(provjereno 2026-11-15: detalji)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(provjereno 2026-11-15: detalji)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(provjereno 2026-11-15: detalji)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(provjereno 2026-11-15: detalji)*
- Delbrück, H. (trans. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(provjereno 2026-11-15: postojanje)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(provjereno 2026-11-15: detalji)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(provjereno 2026-11-15: detalji)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(provjereno 2026-11-15: detalji)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(provjereno 2026-11-15: detalji)*
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(provjereno 2026-11-15: detalji)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(provjereno 2026-11-15: detalji)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(provjereno 2026-11-15: detalji)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(provjereno 2026-11-15: detalji)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(provjereno 2026-11-15: postojanje)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(provjereno 2026-11-15: detalji)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(provjereno 2026-11-15: detalji)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(provjereno 2026-11-15: detalji)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(provjereno 2026-11-15: detalji)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(provjereno 2026-11-15: detalji)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(provjereno 2026-11-15: detalji)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(provjereno 2026-11-15: detalji)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(provjereno 2026-11-15: detalji)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(provjereno 2026-11-15: detalji)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(provjereno 2026-11-15: postojanje)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(provjereno 2026-11-15: detalji)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(provjereno 2026-11-15: detalji)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(provjereno 2026-11-15: detalji)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(provjereno 2026-11-15: detalji)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(provjereno 2026-11-15: detalji)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(provjereno 2026-11-15: detalji)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(provjereno 2026-11-15: detalji)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(provjereno 2026-11-15: detalji)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(provjereno 2026-11-15: detalji)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(provjereno 2026-11-15: detalji)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(provjereno 2026-11-15: detalji)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(provjereno 2026-11-15: detalji)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(provjereno 2026-11-15: detalji)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(provjereno 2026-11-15: detalji)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(provjereno 2026-11-15: detalji)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(provjereno 2026-11-15: detalji)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(provjereno 2026-11-15: detalji)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(provjereno 2026-11-15: detalji)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(provjereno 2026-11-15: detalji)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(provjereno 2026-11-15: postojanje)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(provjereno 2026-11-15: detalji)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(provjereno 2026-11-15: detalji)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(provjereno 2026-11-15: detalji)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(provjereno 2026-11-15: detalji)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(provjereno 2026-11-15: detalji)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(provjereno 2026-11-15: detalji)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(provjereno 2026-11-15: detalji)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(provjereno 2026-11-15: detalji)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(provjereno 2026-11-15: detalji)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(provjereno 2026-11-15: detalji)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(provjereno 2026-11-15: detalji)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(provjereno 2026-11-15: detalji)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(provjereno 2026-11-15: detalji)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(provjereno 2026-11-15: detalji)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(provjereno 2026-11-15: detalji)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(provjereno 2026-11-15: detalji)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(provjereno 2026-11-15: detalji)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(provjereno 2026-11-15: detalji)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(provjereno 2026-11-15: detalji)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(provjereno 2026-11-15: detalji)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(provjereno 2026-11-15: detalji)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(provjereno 2026-11-15: detalji)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(provjereno 2026-11-15: detalji)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(provjereno 2026-11-15: detalji)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(provjereno 2026-11-15: detalji)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(provjereno 2026-11-15: detalji)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(provjereno 2026-11-15: detalji)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(provjereno 2026-11-15: detalji)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(provjereno 2026-11-15: detalji)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(provjereno 2026-11-15: detalji)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(provjereno 2026-11-15: detalji)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(provjereno 2026-11-15: detalji)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(provjereno 2026-11-15: detalji)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(provjereno 2026-11-15: detalji)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(provjereno 2026-11-15: detalji)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(provjereno 2026-11-15: detalji)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(provjereno 2026-11-15: detalji)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(provjereno 2026-11-15: detalji)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(provjereno 2026-11-15: detalji)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(provjereno 2026-11-15: detalji)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(provjereno 2026-11-15: detalji)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(provjereno 2026-11-15: detalji)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(provjereno 2026-11-15: detalji)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(provjereno 2026-11-15: detalji)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(provjereno 2026-11-15: detalji)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(provjereno 2026-11-15: detalji)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(provjereno 2026-11-15: detalji)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(provjereno 2026-11-15: detalji)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(provjereno 2026-11-15: detalji)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(provjereno 2026-11-15: detalji)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(provjereno 2026-11-15: detalji)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(provjereno 2026-11-15: detalji)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(provjereno 2026-11-15: detalji)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(provjereno 2026-11-15: detalji)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(provjereno 2026-11-15: detalji)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(provjereno 2026-11-15: detalji)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(provjereno 2026-11-15: detalji)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(provjereno 2026-11-15: detalji)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(provjereno 2026-11-15: postojanje)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(provjereno 2026-11-15: detalji)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(provjereno 2026-11-15: detalji)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(provjereno 2026-11-15: detalji)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(provjereno 2026-11-15: detalji)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(provjereno 2026-11-15: detalji)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(provjereno 2026-11-15: detalji)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(provjereno 2026-11-15: detalji)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(provjereno 2026-11-15: detalji)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(provjereno 2026-11-15: detalji)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(provjereno 2026-11-15: detalji)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(provjereno 2026-11-15: detalji)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(provjereno 2026-11-15: detalji)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(provjereno 2026-11-15: detalji)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(provjereno 2026-11-15: detalji)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(provjereno 2026-11-15: detalji)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(provjereno 2026-11-15: detalji)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(provjereno 2026-11-15: detalji)*
- Isserson, G. S. (trans. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(provjereno 2026-11-15: detalji)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(provjereno 2026-11-15: detalji)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(provjereno 2026-11-15: detalji)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(provjereno 2026-11-15: detalji)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(provjereno 2026-11-15: detalji)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(provjereno 2026-11-15: detalji)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(provjereno 2026-11-15: detalji)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(provjereno 2026-11-15: postojanje)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(provjereno 2026-11-15: detalji)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(provjereno 2026-11-15: detalji)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(provjereno 2026-11-15: detalji)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(provjereno 2026-11-15: detalji)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(provjereno 2026-11-15: detalji)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(provjereno 2026-11-15: detalji)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(provjereno 2026-11-15: detalji)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(provjereno 2026-11-15: detalji)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(provjereno 2026-11-15: detalji)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(provjereno 2026-11-15: detalji)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(provjereno 2026-11-15: detalji)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(provjereno 2026-11-15: detalji)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(provjereno 2026-11-15: detalji)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(provjereno 2026-11-15: postojanje)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(provjereno 2026-11-15: detalji)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(provjereno 2026-11-15: detalji)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(provjereno 2026-11-15: detalji)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(provjereno 2026-11-15: detalji)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(provjereno 2026-11-15: detalji)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(provjereno 2026-11-15: detalji)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(provjereno 2026-11-15: detalji)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(provjereno 2026-11-15: detalji)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(provjereno 2026-11-15: detalji)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(provjereno 2026-11-15: detalji)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(provjereno 2026-11-15: postojanje)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(provjereno 2026-11-15: detalji)*
- Livy (trans. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(provjereno 2026-11-15: detalji)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(provjereno 2026-11-15: detalji)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(provjereno 2026-11-15: detalji)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(provjereno 2026-11-15: detalji)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(provjereno 2026-11-15: postojanje)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(provjereno 2026-11-15: detalji)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(provjereno 2026-11-15: detalji)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(provjereno 2026-11-15: detalji)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(provjereno 2026-11-15: detalji)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(provjereno 2026-11-15: detalji)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(provjereno 2026-11-15: detalji)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(provjereno 2026-11-15: detalji)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(provjereno 2026-11-15: postojanje)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(provjereno 2026-11-15: detalji)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(provjereno 2026-11-15: detalji)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(provjereno 2026-11-15: detalji)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(provjereno 2026-11-15: detalji)*
- Mao Tse-tung (trans. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(provjereno 2026-11-15: postojanje)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(provjereno 2026-11-15: detalji)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(provjereno 2026-11-15: detalji)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(provjereno 2026-11-15: detalji)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(provjereno 2026-11-15: detalji)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(provjereno 2026-11-15: detalji)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(provjereno 2026-11-15: detalji)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(provjereno 2026-11-15: detalji)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(provjereno 2026-11-15: detalji)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(provjereno 2026-11-15: detalji)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(provjereno 2026-11-15: detalji)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(provjereno 2026-11-15: postojanje)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(provjereno 2026-11-15: detalji)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(provjereno 2026-11-15: detalji)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(provjereno 2026-11-15: detalji)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(provjereno 2026-11-15: detalji)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(provjereno 2026-11-15: detalji)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(provjereno 2026-11-15: detalji)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(provjereno 2026-11-15: detalji)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(provjereno 2026-11-15: detalji)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(provjereno 2026-11-15: detalji)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(provjereno 2026-11-15: detalji)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(provjereno 2026-11-15: detalji)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(provjereno 2026-11-15: postojanje)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(provjereno 2026-11-15: postojanje)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(provjereno 2026-11-15: detalji)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(provjereno 2026-11-15: detalji)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(provjereno 2026-11-15: detalji)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(provjereno 2026-11-15: detalji)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(provjereno 2026-11-15: detalji)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(provjereno 2026-11-15: postojanje)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(provjereno 2026-11-15: postojanje)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(provjereno 2026-11-15: detalji)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(provjereno 2026-11-15: detalji)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(provjereno 2026-11-15: postojanje)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(provjereno 2026-11-15: detalji)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(provjereno 2026-11-15: detalji)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(provjereno 2026-11-15: detalji)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(provjereno 2026-11-15: detalji)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(provjereno 2026-11-15: detalji)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(provjereno 2026-11-15: detalji)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(provjereno 2026-11-15: detalji)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(provjereno 2026-11-15: detalji)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(provjereno 2026-11-15: detalji)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(provjereno 2026-11-15: detalji)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(provjereno 2026-11-15: detalji)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(provjereno 2026-11-15: detalji)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(provjereno 2026-11-15: detalji)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(provjereno 2026-11-15: detalji)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(provjereno 2026-11-15: postojanje)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(provjereno 2026-11-15: detalji)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(provjereno 2026-11-15: detalji)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(provjereno 2026-11-15: detalji)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(provjereno 2026-11-15: detalji)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(provjereno 2026-11-15: detalji)*
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(provjereno 2026-11-15: detalji)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(provjereno 2026-11-15: detalji)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(provjereno 2026-11-15: detalji)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(provjereno 2026-11-15: detalji)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(provjereno 2026-11-15: detalji)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(provjereno 2026-11-15: detalji)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(provjereno 2026-11-15: detalji)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(provjereno 2026-11-15: detalji)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(provjereno 2026-11-15: detalji)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(provjereno 2026-11-15: detalji)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(provjereno 2026-11-15: detalji)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(provjereno 2026-11-15: detalji)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(provjereno 2026-11-15: detalji)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(provjereno 2026-11-15: detalji)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(provjereno 2026-11-15: detalji)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(provjereno 2026-11-15: detalji)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(provjereno 2026-11-15: detalji)*
- Plutarch (trans. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(provjereno 2026-11-15: detalji)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(provjereno 2026-11-15: detalji)*
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(provjereno 2026-11-15: detalji)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(provjereno 2026-11-15: detalji)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(provjereno 2026-11-15: detalji)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(provjereno 2026-11-15: detalji)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(provjereno 2026-11-15: detalji)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(provjereno 2026-11-15: detalji)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(provjereno 2026-11-15: detalji)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(provjereno 2026-11-15: detalji)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(provjereno 2026-11-15: detalji)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(provjereno 2026-11-15: detalji)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(provjereno 2026-11-15: detalji)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(provjereno 2026-11-15: detalji)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(provjereno 2026-11-15: detalji)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(provjereno 2026-11-15: detalji)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(provjereno 2026-11-15: detalji)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(provjereno 2026-11-15: detalji)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(provjereno 2026-11-15: detalji)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(provjereno 2026-11-15: detalji)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(provjereno 2026-11-15: detalji)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(provjereno 2026-11-15: detalji)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(provjereno 2026-11-15: detalji)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(provjereno 2026-11-15: postojanje)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(provjereno 2026-11-15: postojanje)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(provjereno 2026-11-15: postojanje)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(provjereno 2026-11-15: postojanje)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(provjereno 2026-11-15: detalji)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(provjereno 2026-11-15: detalji)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(provjereno 2026-11-15: detalji)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(provjereno 2026-11-15: detalji)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(provjereno 2026-11-15: detalji)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(provjereno 2026-11-15: detalji)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(provjereno 2026-11-15: detalji)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(provjereno 2026-11-15: detalji)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(provjereno 2026-11-15: postojanje)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(provjereno 2026-11-15: detalji)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(provjereno 2026-11-15: detalji)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(provjereno 2026-11-15: detalji)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(provjereno 2026-11-15: detalji)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(provjereno 2026-11-15: postojanje)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(provjereno 2026-11-15: detalji)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(provjereno 2026-11-15: postojanje)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(provjereno 2026-11-15: detalji)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(provjereno 2026-11-15: detalji)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(provjereno 2026-11-15: detalji)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(provjereno 2026-11-15: detalji)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(provjereno 2026-11-15: detalji)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(provjereno 2026-11-15: postojanje)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(provjereno 2026-11-15: detalji)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(provjereno 2026-11-15: detalji)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(provjereno 2026-11-15: detalji)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(provjereno 2026-11-15: detalji)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(provjereno 2026-11-15: detalji)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(provjereno 2026-11-15: detalji)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(provjereno 2026-11-15: detalji)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(provjereno 2026-11-15: detalji)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(provjereno 2026-11-15: detalji)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(provjereno 2026-11-15: detalji)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(provjereno 2026-11-15: detalji)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(provjereno 2026-11-15: postojanje)*
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(provjereno 2026-11-15: detalji)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(provjereno 2026-11-15: detalji)*
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(provjereno 2026-11-15: detalji)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(provjereno 2026-11-15: detalji)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(provjereno 2026-11-15: detalji)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(provjereno 2026-11-15: detalji)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(provjereno 2026-11-15: detalji)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(provjereno 2026-11-15: detalji)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(provjereno 2026-11-15: detalji)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(provjereno 2026-11-15: detalji)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(provjereno 2026-11-15: detalji)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(provjereno 2026-11-15: detalji)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(provjereno 2026-11-15: detalji)*
- Triandafillov, V. K. (trans. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(provjereno 2026-11-15: detalji)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(provjereno 2026-11-15: detalji)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(provjereno 2026-11-15: detalji)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(provjereno 2026-11-15: detalji)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(provjereno 2026-11-15: detalji)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(provjereno 2026-11-15: detalji)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(provjereno 2026-11-15: detalji)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(provjereno 2026-11-15: postojanje)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(provjereno 2026-11-15: detalji)*
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(javno dobro)* *(provjereno 2026-11-15: postojanje)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(provjereno 2026-11-15: detalji)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(provjereno 2026-11-15: detalji)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(provjereno 2026-11-15: detalji)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(provjereno 2026-11-15: detalji)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(provjereno 2026-11-15: detalji)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(provjereno 2026-11-15: detalji)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(provjereno 2026-11-15: detalji)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(provjereno 2026-11-15: detalji)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(provjereno 2026-11-15: postojanje)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(provjereno 2026-11-15: detalji)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(provjereno 2026-11-15: postojanje)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(provjereno 2026-11-15: postojanje)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(provjereno 2026-11-15: detalji)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(provjereno 2026-11-15: postojanje)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(provjereno 2026-11-15: detalji)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(provjereno 2026-11-15: detalji)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(provjereno 2026-11-15: detalji)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(provjereno 2026-11-15: detalji)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(provjereno 2026-11-15: detalji)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(provjereno 2026-11-15: detalji)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(provjereno 2026-11-15: postojanje)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(provjereno 2026-11-15: detalji)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(provjereno 2026-11-15: detalji)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(provjereno 2026-11-15: detalji)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(provjereno 2026-11-15: detalji)*
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(javno dobro)* *(provjereno 2026-11-15: detalji)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(provjereno 2026-11-15: detalji)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(provjereno 2026-11-15: detalji)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(provjereno 2026-11-15: detalji)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(provjereno 2026-11-15: postojanje)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(provjereno 2026-11-15: detalji)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(provjereno 2026-11-15: postojanje)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(provjereno 2026-11-15: postojanje)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(provjereno 2026-11-15: detalji)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(provjereno 2026-11-15: detalji)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(provjereno 2026-11-15: detalji)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(provjereno 2026-11-15: detalji)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(provjereno 2026-11-15: detalji)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(provjereno 2026-11-15: detalji)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(provjereno 2026-11-15: detalji)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(provjereno 2026-11-15: detalji)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(provjereno 2026-11-15: detalji)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(provjereno 2026-11-15: detalji)*

<!-- kb:end -->
