---
title: "Tietokatalogi"
parent: "Tietolinssi"
nav_order: 2
lang: "fi"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Tietokatalogi

Tämä on täydellinen luettelo siitä, mitä [tietolinssi](knowledge.md) tietää: kuviot, joita se etsii, sekä ideat, menetelmät, historialliset tapaukset ja tutkimukset, joita se lainaa, ja kirjat ja artikkelit, joiden varassa ne ovat. Käytä sitä etsiäksesi merkinnän tunnisteella tai tarkistaaksesi lähteen.

Tämä sivu luodaan tietokannasta komennolla `node tools/knowledge-doc.mjs`. Älä muokkaa merkintöjen välissä olevaa sisältöä.

<!-- kb:begin -->

Tietokannassa on 579 merkintää (135 käsitettä, 37 menetelmää, 277 historiallista tapausta, 17 suunnitteluperiaatetta, 113 tutkimusta). Ne kattavat 93 kuviota ja viittaavat 556 lähteeseen.

### Kuviot (93) {#patterns-93}

| id | family | what it looks like in the data |
|---|---|---|
| `concentration` | voima | Puoli, joka tuo yhteen paikkaan enemmän yksiköitä, voittaa paikan selvemmin kuin pelkät luvut selittäisivät. |
| `local-superiority` | voima | Tappavat tulevat sille puolelle, jolla on paikallinen ylivoima hyökkäysetäisyydellä, kokonaismääristä riippumatta. |
| `attrition` | voima | Tappiot seuraavat molempien puolten vahvuuksia ajan kuluessa; taistelun ratkaisee se, joka loppuu ensin. |
| `exchange-ratio` | voima | Tappojen ja menetysten suhde vaihtelee voimakkaasti paikan, puolen tai luokan mukaan. |
| `aimed-fire` | voima | Tappiot kasvavat vihollisen määrän mukana, mutta eivät oman määrän mukana. |
| `area-fire` | voima | Tappiot kasvavat molempien puolten lukumäärien tulona: tungos rangaistaan. |
| `defeat-in-detail` | voima | Puoli tuhotaan osissa, kun sen osat saapuvat yksi kerrallaan. |
| `mutual-support` | voima | Menetykseen vastataan nopeasti lähellä olevan joukkuetoverin toimesta: vaihtoja tapahtuu. |
| `combined-arms` | voima | Luokat menestyvät yhdessä, kun kukin peittää toisen heikkouden, ja huonosti yksin. |
| `class-counter` | voima | Yksi luokka voittaa tietyn toisen luokan tai tietyn paikan kohdalla suhteettoman usein. |
| `initiative` | voima | Se, joka tekee ensimmäisen pisteen kahakassa, voittaa yleensä kahakan. |
| `key-terrain` | maasto | Samat muutamat paikat ratkaisevat taistelut ottelu toisensa jälkeen. |
| `fields-of-fire` | maasto | Paikat, joista näkee kauas yli maan, jonka muiden on ylitettävä, tuovat enemmän tappoja. |
| `high-ground` | maasto | Tappoja tehdään korkeammalta kuin maasta, jolla uhrit seisovat. |
| `cover` | maasto | Kuolemia tulee vähemmän ajassa siellä, missä geometria estää näön ja tulen. |
| `open-ground` | maasto | Kuolemia tulee enemmän ajassa siellä, missä mikään ei estä näköä tai tulta. |
| `kill-zone` | maasto | Kuolemat keskittyvät paikkoihin, joissa liike on pakotettu nähtyjen ja tulen peittämien alueiden läpi. |
| `chokepoint` | maasto | Monta ylitystä puristuu pienen maan läpi, ja siellä syntyy tappioita. |
| `reverse-slope` | maasto | Turvallisuus harjanteen tai seinän takana, poissa vihollisen suorasta näköyhteydestä. |
| `safe-ground` | maasto | Paikka, jossa aikaa vietetään mutta jossa kuolee vähän. |
| `obstacle` | maasto | Reitit kiertävät estettyä maastoa ja kapenevat muutamaksi kaistaksi. |
| `flank` | liike | Harvoin käytetty reitti tuo enemmän tappoja kuin pääreitit. |
| `avenue-of-approach` | liike | Liike virtaa muutamaa kaistaa pitkin alueiden välillä. |
| `mobility` | liike | Liikkuvat yksiköt kuolevat ajassa vähemmän (tai enemmän) kuin hitaat tai paikallaan olevat. |
| `static-exposure` | liike | Paikallaan seisovat yksiköt kuolevat ajassa enemmän kuin liikkuvat. |
| `interior-lines` | liike | Puoli, jolla on lyhyet reitit taistelujensa välillä, siirtää voimaansa nopeammin kuin toinen. |
| `envelopment` | liike | Tappoja tulee useasta suunnasta yhden puolen asemaan. |
| `ambush` | liike | Reittiä pitkin liikkuvat yksiköt kuolevat nopeasti vihollisille, jotka ovat jo asemissa. |
| `spawn-pressure` | aika | Elämät päättyvät pian alkamisen jälkeen yhdestä synnytyspaikasta. |
| `tempo` | aika | Nopeampi puoli ehtii taisteluun ja tekee pisteen ennen kuin toinen reagoi. |
| `surprise` | aika | Tappiot tulevat purskeina ennen kuin uhrit ehtivät vastata tulella. |
| `energy-advantage` | ilma | Tappajilla on enemmän korkeutta ja nopeutta kuin uhreillaan. |
| `air-superiority` | ilma | Yhden puolen lentokoneet tappavat moninkertaisesti sen, mitä menettävät. |
| `sead` | ilma | Maan ilmatorjunta vie monta lentokonetta, kunnes se löydetään ja tuhotaan. |
| `bvr` | ilma | Tappoja tapahtuu pitkällä etäisyydellä, ennen kuin uhri ehtii lähestyä. |
| `fleet-salvo` | meri | Voima, joka iskee ensin, menettää vähän; toinen jää vähän elämään vastatakseen. |
| `scouting` | meri | Puoli, joka löytää toisen ensin, valitsee taistelun. |
| `urban-close` | kaupunki | Lyhyet taisteluetäisyydet, paljon kuolemia tiheän geometrian keskellä ja hidas puhdistus. |
| `vertical` | kaupunki | Tappoja yläkerroksista tai katoilta kaduille. |
| `skill-dispersion` | ihmiset | Muutama pelaaja tekee suuren osan tappoista tai kuolemista. |
| `ai-vs-player` | ihmiset | Tekoälyn ohjaamat yksiköt menestyvät eri tavalla kuin pelaajat samassa paikassa. |
| `balance` | suunnittelu | Puolet, synnytyspaikat tai luokat alkavat epätasaisin mahdollisuuksin. |
| `economy` | suunnittelu | Ansaitut, maksetut ja menetetyt resurssit keskittyvät muutamaan paikkaan tai pelaajaan. |
| `flow` | suunnittelu | Miten pelaajat liikkuvat kentässä: silmukat, kaistat, umpikujat. |
| `sightlines` | suunnittelu | Pitkät näkölinjat päättävät, missä taistelut alkavat ja kuka ne voittaa. |
| `readability` | suunnittelu | Kuolemat, joita pelaajat eivät näe tulevan: takaa, näkymättömistä paikoista. |
| `formation` | liike | Puolen yksiköt liikkuvat yhdessä tunnistettavassa muodossa: linja, kolonna, kiila, portaikko, laatikko. |
| `frontal-assault` | liike | Ryhmä ryntää vihollisen kimppuun suoraan sen edessä. |
| `double-envelopment` | liike | Kaksi ryhmää iskee yhden vihollisjoukon molempiin kylkiin suunnilleen samaan aikaan. |
| `encirclement` | liike | Vihollisryhmä jää toisen puolen saartamaksi ympäriinsä, ja ulospääsyjä on vähän. |
| `penetration` | liike | Ryhmä menee vihollislinjan läpi paikassa, jossa vihollisia on molemmin puolin. |
| `fire-and-maneuver` | liike | Osa ryhmästä liikkuu, kun loput seisovat ja suojaavat sitä, ja roolit vaihtuvat. |
| `feint` | liike | Pieni ryhmä vetää vihollisen yhteen paikkaan; pääponnistus iskee muualle pian sen jälkeen. |
| `withdrawal` | liike | Kosketuksissa oleva ryhmä kääntyy pois ja kasvattaa etäisyyttä viholliseen. |
| `pursuit` | liike | Ryhmä seuraa vihollista, joka liikkuu poispäin, ja pitää tai kaventaa etäisyyttä. |
| `defence-in-depth` | maasto | Puolustajat seisovat useissa vyöhykkeissä peräkkäin vihollisen etenemisakselilla. |
| `screening` | liike | Pieni osa liikkuu hyvin edellä pääjoukosta ja kohtaa vihollisen ensin. |
| `dispersion` | voima | Puoli levittäytyy ajan kuluessa; harvemmat sen yksiköt ovat samassa paikassa. |
| `missile-defence` | ilma | Ohjusuhan alla olevat lentokoneet kääntävät uhan sivulle tai pyrstöön: crank, notch, drag, pump. |
| `angles-fight` | ilma | Lähitaisteluhävittäjien kahakka pienellä nopeudella ja suurella kääntökyvyllä, käydään nokka-asemasta eikä energiasta. |
| `cap` | ilma | Lentokoneet kiertävät kiinteää asemaa minuutteja ja odottavat vihollisen tuloa. |
| `strike-package` | ilma | Eri tehtävissä olevat lentokoneet lentävät yhdessä kohteeseen; osa hyökkää maahan, toiset suojaavat niitä. |
| `line-of-battle` | meri | Alukset höyryävät peräkkäin kolonnassa, jotta kaikki kyljet kantavat. |
| `crossing-the-t` | meri | Kolonna ylittää vihollisen kolonnan kärjen: kaikki sen tykit kantavat, vihollisen vain vähän. |
| `fatal-funnel` | kaupunki | Pelaajat, jotka astuvat yhteen oviaukkoon, huoneeseen tai kapeikkoon, kuolevat siellä hetkessä huomattavasti useammin kuin muualle mennessään. |
| `crossfire` | voima | Pitäjät, joiden tulilinjat kohtaavat eri kulmista, voittavat useammin kaksinkamppailun kuin yksi pitäjä. |
| `peeker-advantage` | aika | Pelaaja, joka astuu näkyviin, voittaa kaksinkamppailut useammin (tai harvemmin) kuin puolet kertaa vastaan pelaajaa, joka pitää kulmaa. |
| `entry` | aika | Kierroksen ensimmäinen tappo ratkaisee suuren osan kierroksesta; aloitukset voitetaan tai hävitään paikan ja tuen mukaan. |
| `utility-support` | voima | Välähdys tai savu juuri ennen kaksinkamppailua muuttaa sen voittajaa. |
| `man-advantage` | voima | Kierrokset voittaa puoli, jolla on enemmän elossa olevia pelaajia, ja jotkut puolet muuttavat tai heittävät etua pois. |
| `clutch` | ihmiset | Viimeiset elossa olevat pelaajat voittavat useammin (tai harvemmin) kuin kierroksen tilanne ennustaisi. |
| `action-value` | ihmiset | Tapot, vaihdot, pommin asetukset ja apuvälineet eroavat siinä, kuinka paljon ne muuttavat voittomahdollisuutta. |
| `lurk` | liike | Yksin joukkueesta kaukana oleva pelaaja tappaa (tai kuolee) eri tahdissa kuin parvi. |
| `rotation` | liike | Se, kuinka nopeasti puoli siirtää pelaajia taisteluun tai tavoitteeseen, ratkaisee, pitääkö se paikan vai vallataanko se takaisin. |
| `collective-order` | ihmiset | Puolen liikkuvat yksiköt kulkevat samaan suuntaan paljon useammin kuin omat, ajassa siirretyt radat sattumalta antaisivat. |
| `milling` | ihmiset | Puolen yksiköt kiertävät yhteistä keskustaa: pyörimistä ilman nettoliikettä. |
| `herding` | ihmiset | Yksiköt lähtevät paikasta samalla tavalla kuin edellinen joukkuetoveri, paikan omien todennäköisyyksien ja vihollisen kopioimisen ylittäen. |
| `lane-formation` | ihmiset | Vastakkaiset virrat pysyvät erillisillä kaistoilla; liike keskittyy muutamille poluille, joita käytetään ottelu toisensa jälkeen. |
| `crowding` | ihmiset | Nopeus ja virta laskevat, kun yksiköt kerääntyvät; kapeikossa kovempi työntäminen päästää läpi vähemmän. |
| `leadership` | ihmiset | Jotkut yksiköt kääntyvät ensin, ja toiset kopioivat niiden suunnan muutaman sekunnin myöhemmin. |
| `cohesion` | ihmiset | Yksiköt, jotka ajautuvat pois ryhmästään, kuolevat useammin kuin ne, jotka pysyvät sen mukana. |
| `breaking-point` | ihmiset | Puoli, joka on menettänyt osan vahvuudestaan, lakkaa kuromasta umpeen ja vetäytyy, enemmän kuin etäisyys viholliseen selittäisi. |
| `panic` | ihmiset | Äkillisen uhan alla yksiköt hajaantuvat, pakenevat tai jähmettyvät, ja yhteistyö hajoaa. |
| `loss-chasing` | ihmiset | Tappion jälkeen yksiköt ottavat enemmän (tai vähemmän) riskiä kuin voiton jälkeen. |
| `hot-hand` | ihmiset | Menestys seuraa menestystä useammin kuin saman pelaajan sekoitetut sarjat sallisivat. |
| `conformity` | ihmiset | Puolen jäsenet valitsevat samalla tavalla, esimerkiksi ostot, varusteet ja reitit, omia mieltymyksiään enemmän. |
| `suppression` | ihmiset | Tuleva tuli muuttaa yksiköiden liikkeitä ja ampumista, vaikka se ei tappaisi. |
| `social-loafing` | ihmiset | Toiminta per pää vähenee, kun joukkuetovereita on enemmän. |
| `mixed-strategy` | ihmiset | Valinnat, joiden pitäisi olla arvaamattomia, muuttuvat kaavamaisiksi: yksi vaihtoehto voittaa useammin, tai valinnat tulevat sarjoina. |
| `coordination` | ihmiset | Jäsenet toimivat yhteen ilman näkyviä käskyjä: liike, ajoitus ja valinnat ovat samassa tahdissa. |
| `contagion` | ihmiset | Tila siirtyy yksiköstä toiseen kosketuksen tai läheisyyden kautta ja leviää kartalla. |
| `territoriality` | ihmiset | Yksiköt pitävät etäisyyttä toisiinsa ja pysyvät omalla maallaan. |
| `interaction-network` | ihmiset | Se, kuka taistelee, tukee ja seuraa ketä, muodostaa verkoston, jossa on keskuksia, klustereita ja siltoja. |

### Käsitteet (135) {#concepts-135}

| id | title | lenses | patterns | sources |
|---|---|---|---|---|
| `concept.lanchester-square` | Lanchesterin neliölaki (tarkka tuli) | sotilas, ilma, meri, e-urheilu | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Lanchesterin lineaarinen laki (aluetuli, yksi yhtä vastaan) | sotilas, kaupunki, e-urheilu | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Voimien keskittäminen (massa) | sotilas, ilma, meri, e-urheilu | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Voimasuhteet ja 3:1-sääntö | sotilas | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Menetysten vaihtosuhde | sotilas, ilma, e-urheilu, suunnittelu | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Taisteluvoima ja sen kertoimet | sotilas | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Nykyaikainen voiman käytön järjestelmä | sotilas | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | OODA-silmukka (havaitse, suuntaudu, päätä, toimi) | sotilas, ilma, e-urheilu | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Energia-liikkuvuusteoria | ilma | energy-advantage, angles-fight, high-ground, mobility | Boyd ym. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Hävittäjän perusliikkeet ja ilmataistelun liikkeet | ilma | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Maaston analyysi: OAKOC / KOCOA | sotilas, suunnittelu, kaupunki | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: tehtävän muuttujat | sotilas | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Avainmaasto ja ratkaiseva maasto | sotilas, suunnittelu, e-urheilu | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Tarkkailu ja tulialueet | sotilas, suunnittelu, e-urheilu, kaupunki | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Suoja ja peittäminen | sotilas, kaupunki, suunnittelu | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Lähestymisreitit ja liikkuvuuskäytävät | sotilas, suunnittelu | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Pullonkaulat ja kapeikot | sotilas, suunnittelu, e-urheilu | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Taisteluvyöhykkeet ja tappovyöhykkeet | sotilas, kaupunki, suunnittelu | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Puolustus harjanteen takana ja peittyminen | sotilas, suunnittelu | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Korkea maasto | sotilas, suunnittelu | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Sisäiset ja ulkoiset linjat | sotilas | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Voittaminen osissa | sotilas, e-urheilu | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Keskinäinen tuki | sotilas, ilma, e-urheilu | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos ym. 2020 |
| `concept.combined-arms` | Yhdistetyt asejärjestelmät | sotilas, suunnittelu | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Tukahduttaminen | sotilas, kaupunki | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Vihollisen ilmatorjunnan tukahduttaminen ja tuhoaminen (SEAD/DEAD) | ilma, sotilas | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Ilmapartio ja ilmaylivoima | ilma | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Näkyvyysetäisyyden ulkopuolinen taistelu | ilma | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Epäsuora lähestyminen | sotilas, e-urheilu, suunnittelu | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Kiertäminen ja saartaminen | sotilas | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Väijytys | sotilas, e-urheilu, suunnittelu | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Syvyyssuuntainen puolustus | sotilas | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Kitka ja sodan sumu | sotilas, e-urheilu | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Hyökkäyksen huipentumapiste | sotilas | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Yllätys | sotilas, ilma, meri, e-urheilu | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Voimien taloudellinen käyttö | sotilas, e-urheilu | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Kaupunkimaasto | kaupunki, sotilas, e-urheilu | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Merenhallinta ja ratkaiseva laivastotaistelu | meri | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Hughesin salvomalli: hyökkää ensin tehokkaasti | meri, ilma | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Etsintä- ja havaitsemisteoria | meri, ilma, sotilas | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Operaatiotutkimus: tehokkuuden mittarit | sotilas, ilma, meri, suunnittelu | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Sotapelit analyysin välineenä | sotilas, suunnittelu | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Liikesota | sotilas, e-urheilu | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Yhteenkuuluvuus ja moraalinen tekijä | sotilas | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Painopiste | sotilas | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Ratkaisevat pisteet | sotilas, e-urheilu | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Toimintalinjat | sotilas | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Tuhoamisen ja uuvuttamisen strategiat | sotilas | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Syvä taistelu ja syvät operaatiot | sotilas | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | sotilas, ilma | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Tehtäväjohtaminen (Auftragstaktik) | sotilas, e-urheilu | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Läpimurto ja hyödyntäminen | sotilas | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Tuli ja liike | sotilas, e-urheilu | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Vuorotteleva liike ja suojatuli (bounding overwatch) | sotilas, e-urheilu | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Tiedustelun vetäminen ja tunkeutuminen | sotilas, e-urheilu | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | Reservi | sotilas, e-urheilu | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Joustava puolustus ja vastahyökkäys | sotilas | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | Tappoketju (löytää, paikantaa, seuraa, kohdistaa, ottaa kohteeksi, arvioi) | sotilas, ilma, meri | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Havaintoetäisyys ja taisteluetäisyys | ilma, meri, sotilas | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Taistelutehon arvo | sotilas, e-urheilu | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Hajautuminen taistelukentällä | sotilas, e-urheilu | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Lähitukilento | ilma, sotilas | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Ilmasaarto | ilma, sotilas | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Saattaminen vastaan hävittäjäetsintä | ilma | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Energiakahakka vastaan kääntökahakka | ilma | energy-advantage, initiative | Shaw 1985; Boyd ym. 1966 |
| `concept.pursuit-geometry` | Edellä, suoraan ja jäljessä oleva takaa-ajo | ilma | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Thach-kiepaus | ilma | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Sormineljä ja taistelupari | ilma | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Olemassa oleva laivasto | meri | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | T-ylitys (crossing the T) | meri, sotilas | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Saattue | meri | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Pääsyn estäminen ja aluekielto (A2/AD) | meri, ilma, sotilas | fields-of-fire, sead, avenue-of-approach | Krepinevich ym. 2003; Till 2018 |
| `concept.strongpoint` | Vahvan pisteen puolustus rakennetuilla alueilla | kaupunki, sotilas | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Rakennusten läpi liikkuminen (mouseholing) | kaupunki, sotilas, suunnittelu | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Piiritys | sotilas, kaupunki | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Sissisota | sotilas, kaupunki | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Kapinallisuuden torjunta | sotilas, kaupunki | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Turvapaikka | sotilas, suunnittelu | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Harhautus (maskirovka) | sotilas, e-urheilu | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Tietoetu | sotilas, e-urheilu | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Talouskierrokset ja resurssitahti | e-urheilu, suunnittelu | economy, balance, tempo | Xenopoulos ym. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Liikkumismuodostelmat: linja, kolonna, kiila, portaikko | sotilas, e-urheilu | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Suora hyökkäys | sotilas | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Kaksinkertainen kiertäminen (pihdit) | sotilas | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Saartaminen ja motti | sotilas | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Tunkeutuminen ja läpimurto | sotilas | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Takaa-ajo | sotilas | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Taaksepäin liike: vetäytyminen, viivytys ja perääntyminen | sotilas | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Harhautus ja näyttö | sotilas, e-urheilu | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Verhoaminen, vartiointi ja suojaus: turva pääjoukon edellä | sotilas | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Puolustautuminen ohjusta vastaan: crank, notch, drag ja pump | ilma | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd ym. 1966 |
| `concept.bvr-formations` | Näkyvyysetäisyyden ulkopuoliset muodostelmat: seinä, johtaja-perä, murskain, pihdit | ilma | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Kulmakahakka ja energiakahakka | ilma | angles-fight, energy-advantage | Shaw 1985; Boyd ym. 1966 |
| `concept.strike-package` | Iskupaketti ja tukahduttamisen ajoitus | ilma | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | Taistelulinja | meri | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | Kohtalokas suppilo | kaupunki, sotilas, e-urheilu, suunnittelu | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Huoneiden puhdistus: yllätys, nopeus, hallittu väkivalta | kaupunki, sotilas, e-urheilu | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Hallitsevat pisteet | kaupunki, sotilas, e-urheilu | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Kulmien tarkistus: piirakan viipalointi | kaupunki, sotilas, e-urheilu | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Ristituli ja lomittuvat tulialueet | sotilas, kaupunki, e-urheilu, suunnittelu | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Näkyviin astujan etu | e-urheilu, suunnittelu | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey ym. 2024; Lee & Chang 2017; Liu ym. 2022 |
| `concept.man-advantage` | Miesylivoima eliminointikierroksilla | e-urheilu, sotilas | man-advantage, local-superiority, entry, concentration | Xenopoulos ym. 2022; Xenopoulos ym. 2020; Makarov ym. 2018 |
| `concept.entry-duel` | Aloitus ja avauskaksinkamppailu | e-urheilu, kaupunki | entry, initiative, action-value, tempo | Xenopoulos ym. 2020; Xenopoulos ym. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Apuvälineet ennen aloitusta: välähdys ja savu | e-urheilu, kaupunki, sotilas | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos ym. 2020 |
| `concept.social-force-model` | Sosiaalisten voimien malli jalankulkijoiden liikkeestä | suunnittelu, kaupunki, sotilas | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing ym. 2005; Moussaïd ym. 2011 |
| `concept.lane-formation` | Kaistojen muodostuminen vastavirrassa | suunnittelu, kaupunki | lane-formation, flow, avenue-of-approach | Helbing ym. 2005; Helbing & Molnár 1995; Moussaïd ym. 2011 |
| `concept.faster-is-slower` | Nopeampi on hitaampi | suunnittelu, kaupunki, sotilas | crowding, chokepoint, panic | Helbing ym. 2000; Garcimartín ym. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Joukkojen peruskaavio | suunnittelu, kaupunki | crowding, flow | Seyfried ym. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Polkujen muodostuminen ja halupolut | suunnittelu, sotilas | lane-formation, flow, avenue-of-approach, key-terrain | Helbing ym. 1997; Helbing ym. 2005 |
| `concept.panic-myth` | Paniikki on harvinaista: yhteisön kestävyys | sotilas, kaupunki, suunnittelu | panic, cohesion, mutual-support | Quarantelli 1954; Drury ym. 2009; Helbing ym. 2000 |
| `concept.boids` | Boidit: erottelu, suuntautuminen, yhteenkuuluvuus | suunnittelu, sotilas | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Järjestysparametri ja yhteisen liikkeen alku | suunnittelu, sotilas, ilma, meri | collective-order, coordination | Vicsek ym. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Parvi, kiertely ja polarisoituneet tilat | suunnittelu, sotilas, meri | milling, collective-order | Couzin ym. 2002; Tunstrøm ym. 2013 |
| `concept.effective-leadership` | Tehokas johtajuus ilman merkkejä | sotilas, e-urheilu, suunnittelu | leadership, coordination, herding | Couzin ym. 2005; Dyer ym. 2009; Krause ym. 2010 |
| `concept.topological-interaction` | Naapurit lukumäärän, ei etäisyyden mukaan | ilma, sotilas | cohesion, collective-order | Ballerini ym. 2008 |
| `concept.swarm-intelligence` | Parviäly | suunnittelu, e-urheilu, sotilas | coordination, herding, collective-order | Krause ym. 2010; Lorenz ym. 2011 |
| `concept.information-cascade` | Laumautuminen ja tietokaskadit | e-urheilu, suunnittelu, sotilas | herding, conformity | Banerjee 1992; Bikhchandani ym. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Sosiaalinen laiskuus | e-urheilu, suunnittelu, sotilas | social-loafing, mutual-support | Latané ym. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Vastuun hajauttaminen | e-urheilu, sotilas | social-loafing, mutual-support | Darley & Latané 1968; Fischer ym. 2011 |
| `concept.primary-group` | Ensisijaisen ryhmän yhteenkuuluvuus | sotilas, e-urheilu | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Murtumispisteet ja tappioraja | sotilas | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Tukahduttaminen: mitä tuli tekee tappamisen lisäksi | sotilas, kaupunki | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Pelko ja stressi taistelupäätöksissä | sotilas, e-urheilu | panic, suppression, loss-chasing | Stouffer ym. 1949; Starcke & Brand 2012 |
| `concept.choking` | Tukehtuminen paineen alla | e-urheilu | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Odotusteoria ja tappioaversio | e-urheilu, suunnittelu | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Tasapainopiste ja pelirahan vaikutus | e-urheilu | loss-chasing | Thaler & Johnson 1990; Post ym. 2008 |
| `concept.tilt` | Tilt (turhautuminen) | e-urheilu | loss-chasing, panic | Smith ym. 2009 |
| `concept.sunk-cost` | Uponnut kustannus | e-urheilu, sotilas | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | Kuuma käsi ja sen harhaluulo | e-urheilu | hot-hand, skill-dispersion | Gilovich ym. 1985; Bar-Eli ym. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Sekastrategiat: arvaamattomuus | e-urheilu, suunnittelu, sotilas | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Yhteiset mentaaliset mallit | e-urheilu, sotilas | coordination, leadership | Mohammed ym. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Joukkuetyön osatekijät | e-urheilu, sotilas | coordination, leadership, mutual-support | Salas ym. 2005 |
| `concept.virtual-worlds-labs` | Virtuaalimaailmat käyttäytymisen laboratorioina | suunnittelu, e-urheilu | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee ym. 2007 |
| `concept.proxemics-territory` | Henkilökohtainen tila ja alue | suunnittelu, kaupunki | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee ym. 2007 |
| `concept.interaction-networks` | Vuorovaikutusverkostot: keskukset ja heikot siteet | e-urheilu, suunnittelu | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Menetelmät (37) {#methods-37}

| id | title | patterns | sources |
|---|---|---|---|
| `method.lanchester-fit` | Lanchesterin eksponenttien sovitus kahakkadataan | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Vaihtosuhde puolittain ja paikoittain | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Paikallinen voimasuhde jokaisen tapon hetkellä | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Näkyvyysalue: näkölinjat ja tulialueet | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Ominaisenergia tappojen ja kuolemien hetkellä (ilma) | energy-advantage, air-superiority | Boyd ym. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Kuumien pisteiden pysyvyys otteluiden välillä | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Vaihtojen määrä (keskinäinen tuki) | mutual-support, defeat-in-detail | Xenopoulos ym. 2020; Schubert ym. 2016; FM 3-21.8 2007 |
| `method.initiative` | Kahakat ja ensimmäisen tapon etu | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert ym. 2016; Xenopoulos ym. 2020 |
| `method.spatial-autocorrelation` | Kuolemien paikkasidonnaisuus (Moranin I) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Määrät suhteessa kartan omaan lähtötasoon, FDR-hallinnalla | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Taistelukentän tiedustelun valmistelu (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Parivertailuun perustuvat arviomallit (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich ym. 2007; Minka ym. 2018 |
| `method.win-probability` | Voittotodennäköisyys ja toimien arvo | initiative, economy, skill-dispersion | Xenopoulos ym. 2020; Hodge ym. 2021; Makarov ym. 2018; Cervone ym. 2016 |
| `method.space-control` | Tilan ja kentän hallinta | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Salvoyhtälö sovitettuna kosketuksessa oleviin aluksiin | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Taistelutehosuhde yksikkötuntia kohti toiminnassa | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Havainnoinnista taisteluun ja taisteluetäisyydet | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Tappoketjun ajoitus | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Hajautuminen suhteessa tappo-osuuteen (voiman keskittäminen ajassa) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Menetysten osuus ja tappoja lentoa kohden | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Kierroksen voittotodennäköisyysmalli | action-value, man-advantage, entry, clutch | Xenopoulos ym. 2022; Lock & Nettleton 2014; Robberechts ym. 2021; Brier 1950; Guo ym. 2017; Pakdaman Naeini ym. 2015 |
| `method.win-probability-added` | Toimen arvo: lisätty voittotodennäköisyys | action-value, entry, utility-support, mutual-support | Xenopoulos ym. 2020; Maymin 2021; Fernández ym. 2021; Pollard & Reep 1997; Decroos ym. 2019 |
| `method.adjusted-plus-minus` | Korjattu plus-minus harjanneregressiolla (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Kutistaminen: empiirinen Bayes | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Odotetut tulokset: odotetuista maaleista odotettuihin kaksinkamppailuihin | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Asetelmien, kiertojen ja väijyjien mittaaminen | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Heijastusongelma: kopiointi vai yhteinen syy | herding, conformity | Manski 1993 |
| `method.streak-correction` | Putket äärellisen jonon korjauksella | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Polarisaation ja kiertelyn järjestysparametrit | collective-order, milling | Vicsek ym. 1995; Couzin ym. 2002; Tunstrøm ym. 2013 |
| `method.lagged-heading` | Johtajat viiveellisen suunnan korrelaatiosta | leadership, coordination | Nagy ym. 2010; Couzin ym. 2005 |
| `method.route-cascade` | Reittikaskadi-testi laumautumiselle | herding, conformity | Bikhchandani ym. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Kaistojen erottelu ja polkujen pysyvyys | lane-formation, flow | Helbing ym. 2005; Helbing ym. 1997 |
| `method.straggler-hazard` | Jälkijoukkojen vaara | cohesion, mutual-support, defeat-in-detail | Moussaïd ym. 2010; Siebold 2007 |
| `method.breaking-curve` | Murtumiskäyrä | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Vastaus saapuvaan tuleen | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Riski tappion tai voiton jälkeen | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Ostosopimus (Fleissin kappa) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Historialliset tapaukset (277) {#historical-cases-277}

| id | case | when | scale | patterns | sources |
|---|---|---|---|---|---|
| `case.thermopylae` | Thermopylai | 480 eKr. | taistelu | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamis | 480 eKr. | taistelu | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Marathon | 490 eKr. | taistelu | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuktra | 371 eKr. | taistelu | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331 eKr. | taistelu | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Trasimenen järvi | 217 eKr. | taistelu | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Cannae | 216 eKr. | taistelu | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Teutoburgin metsä | 9 jKr. | taistelu | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | taistelu | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Stirlingin silta | 1297 | taistelu | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Agincourt | 1415 | taistelu | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen | 1757 | taistelu | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlitz | 1805 | taistelu | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | taistelu | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | taistelu | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: Marye's Heights | 1862 | kahakka | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | kahakka | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: Pickettin hyökkäys | 1863 | kahakka | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | taistelu | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | kahakka | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | kampanja | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | Sommen ensimmäinen päivä | 1. heinäkuuta 1916 | taistelu | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | kampanja | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jyllannin meritaistelu | 1916 | taistelu | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939-40 | taistelu | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan ja Ardennit | toukokuu 1940 | kampanja | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Arrasin vastahyökkäys | 21. toukokuuta 1940 | kahakka | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Britannian taistelu | heinä-lokakuu 1940 | kampanja | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Atlantin taistelu: saattueiden operaatiotutkimus | 1939-45 | kampanja | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | kesäkuu 1942 | taistelu | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Toinen El Alamein | lokakuu-marraskuu 1942 | taistelu | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Kasserinen sola | helmikuu 1943 | taistelu | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Stalingrad | elokuu 1942-helmikuu 1943 | kampanja | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kursk | heinäkuu 1943 | kampanja | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prohorovka | 12. heinäkuuta 1943 | kahakka | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13. kesäkuuta 1944 | kahakka | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Normandian pensasaidat | kesä-heinäkuu 1944 | kampanja | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Operaatio Cobra | heinäkuu 1944 | kampanja | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Leyte Gulf | lokakuu 1944 | taistelu | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | joulukuu 1944 | taistelu | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Tsushima | toukokuu 1905 | taistelu | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Inchon | syyskuu 1950 | kampanja | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | MiG Alley | 1950-53 | kampanja | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Điện Biên Phủ | 1954 | taistelu | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | marraskuu 1965 | kahakka | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operaatio Bolo | 2. tammikuuta 1967 | kahakka | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golan: Kyynelten laakso | lokakuu 1973 | taistelu | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Siinai: Kiinalainen maatila | lokakuu 1973 | taistelu | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Bekaan laakso (operaatio Mole Cricket 19) | kesäkuu 1982 | taistelu | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Falklandinsaarten ilmasota | toukokuu-kesäkuu 1982 | kampanja | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Aavikkomyrsky: ilmakampanja | tammi-helmikuu 1991 | kampanja | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26. helmikuuta 1991 | kahakka | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadishu | lokakuu 1993 | kahakka | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Grozny | joulukuu 1994-helmikuu 1995 | taistelu | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hue | tammi-maaliskuu 1968 | taistelu | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Kosovon ilmakampanja | maaliskuu-kesäkuu 1999 | kampanja | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Fallujah (operaatio Al Fajr) | marraskuu 2004 | taistelu | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mosul | 2016-17 | kampanja | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Kadesh | n. 1274 eKr. | taistelu | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Issos | 333 eKr. | taistelu | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 eKr. | taistelu | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Carrhae | 53 eKr. | taistelu | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Pharsalos | 48 eKr. | taistelu | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianopolis | 378 jKr. | taistelu | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Yarmouk | 636 jKr. | taistelu | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manzikert | 1071 | taistelu | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hattin | 1187 | taistelu | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburn | 1314 | taistelu | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Crécy | 1346 | taistelu | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Poitiers | 1356 | taistelu | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunwald (Tannenberg) | 1410 | taistelu | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeld | 1631 | taistelu | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blindheim | 1704 | taistelu | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Poltava | 1709 | taistelu | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rossbach | 1757 | taistelu | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | kampanja | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | taistelu | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena-Auerstedt | 1806 | taistelu | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodino | 1812 | taistelu | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Leipzig | 1813 | taistelu | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | taistelu | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | taistelu | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | kampanja | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadowa) | 1866 | taistelu | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | taistelu | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | taistelu | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurman | 1898 | taistelu | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | kahakka | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Gallipoli | 1915 | kampanja | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | marraskuu 1917 | taistelu | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Caporetto | lokakuu-marraskuu 1917 | kampanja | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Saksan kevätoffensiivi (operaatio Michael) | maaliskuu-huhtikuu 1918 | kampanja | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | elokuu 1918 | taistelu | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Halhin-Gol (Nomonhan) | elokuu 1939 | taistelu | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | Puolan kampanja | syyskuu 1939 | kampanja | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut ja Gembloux | toukokuu 1940 | taistelu | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | toukokuu 1940 | kahakka | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Dunkerquen puolustusrengas | toukokuu-kesäkuu 1940 | kampanja | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operaatio Compass ja Beda Fomm | joulukuu 1940-helmikuu 1941 | kampanja | mobility, flank, tempo, exchange-ratio | Playfair ym. 1954 |
| `case.crusader` | Operaatio Crusader ja Sidi Rezegh | marraskuu-joulukuu 1941 | kampanja | defeat-in-detail, combined-arms, attrition, concentration | Playfair ym. 1960 |
| `case.gazala` | Gazala | toukokuu-kesäkuu 1942 | taistelu | flank, defeat-in-detail, mutual-support, obstacle | Playfair ym. 1960 |
| `case.alam-halfa` | Alam Halfa | elokuu-syyskuu 1942 | taistelu | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno-Brody | kesäkuu 1941 | taistelu | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Kiovan saarto | syyskuu 1941 | kampanja | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moskova | lokakuu 1941-tammikuu 1942 | kampanja | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Rzhev ja operaatio Mars | 1942 | kampanja | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Toinen Harkova | toukokuu 1942 | taistelu | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Kolmas Harkova (Mansteinin takaiskuisku) | helmi-maaliskuu 1943 | kampanja | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operaatio Bagration | kesä-elokuu 1944 | kampanja | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Korsun-Tšerkassyn motti | tammi-helmikuu 1944 | taistelu | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Kamenets-Podolskin motti | maaliskuu-huhtikuu 1944 | kampanja | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operaatio Epsom | kesäkuu 1944 | taistelu | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operaatio Goodwood | heinäkuu 1944 | taistelu | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operaatio Totalize | elokuu 1944 | taistelu | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | elokuu 1944 | taistelu | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Falaisen motti | elokuu 1944 | kampanja | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden ja Arnhem | syyskuu 1944 | kampanja | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Aachen | lokakuu 1944 | taistelu | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Hürtgenin metsä | syyskuu 1944-helmikuu 1945 | kampanja | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | syyskuu 1944 | taistelu | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | St. Vith | joulukuu 1944 | taistelu | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Elsenbornin harjanne | joulukuu 1944 | taistelu | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Seelowin kukkulat | huhtikuu 1945 | taistelu | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berliini | huhtikuu-toukokuu 1945 | taistelu | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operaatio Spring Awakening (kevään herääminen) | maaliskuu 1945 | taistelu | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | joulukuu 1943 | taistelu | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Varsovan kapina | elokuu-lokakuu 1944 | kampanja | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | marraskuu 1943 | taistelu | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | syyskuu-marraskuu 1944 | taistelu | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | helmi-maaliskuu 1945 | taistelu | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinawa | huhti-kesäkuu 1945 | kampanja | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman ym. 1948 |
| `case.manila-1945` | Manila | helmi-maaliskuu 1945 | taistelu | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Mandžuria (elokuun myrsky) | elokuu 1945 | kampanja | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Pusanin puolustusrengas | elo-syyskuu 1950 | kampanja | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Chosinin tekojärvi | marraskuu-joulukuu 1950 | kampanja | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Imjinjoki | huhtikuu 1951 | taistelu | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapyong | huhtikuu 1951 | taistelu | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | huhtikuu ja heinäkuu 1953 | kahakka | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | tammi-huhtikuu 1968 | taistelu | high-ground, attrition, air-superiority, key-terrain | Shulimson ym. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | marraskuu 1967 | taistelu | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (Ap Bia -vuori) | toukokuu 1969 | kahakka | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila-Um Katef | kesäkuu 1967 | taistelu | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailia | lokakuu 1973 | taistelu | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | kesäkuu 1982 | kahakka | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Beirutin piiritys | kesä-elokuu 1982 | kampanja | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Libanon 2006: Bint Jbeil ja panssarintorjuntauhka | heinä-elokuu 2006 | kampanja | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Faw | helmikuu 1986 | taistelu | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basra (Karbala-5) | tammi-helmikuu 1987 | taistelu | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Khafji | tammi-helmikuu 1991 | taistelu | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Kohde Norfolk | 26.-27. helmikuuta 1991 | taistelu | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medinan harjanne | 27. helmikuuta 1991 | taistelu | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Wadi al-Batinin harhautukset | helmikuu 1991 | kampanja | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nasiriyah | maaliskuu 2003 | taistelu | ambush, urban-close, avenue-of-approach, readability | Fontenot ym. 2004; Reynolds 2005 |
| `case.objective-peach` | Kohde Peach | huhtikuu 2003 | kahakka | key-terrain, chokepoint, exchange-ratio | Fontenot ym. 2004 |
| `case.thunder-runs` | Ukkoslenkit (Thunder Runs) | huhtikuu 2003 | taistelu | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot ym. 2004 |
| `case.debecka-pass` | Debecka-sola | huhtikuu 2003 | kahakka | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramadi | 2006-07 | kampanja | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadr City | maaliskuu-toukokuu 2008 | taistelu | obstacle, scouting, urban-close, air-superiority | Johnson ym. 2013 |
| `case.anaconda` | Operaatio Anaconda | maaliskuu 2002 | taistelu | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | heinäkuu 2008 | kahakka | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | lokakuu 2009 | kahakka | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala ja joukkueen talot | 2006-07 | kampanja | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Algerin taistelu | 1956-57 | kampanja | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Rhodesian Fireforce | 1974-79 | kampanja | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Sarajevon piiritys | 1992-96 | kampanja | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Grozny 1999-2000 | joulukuu 1999-helmikuu 2000 | taistelu | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Venäjän ja Georgian sota | elokuu 2008 | kampanja | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillia | heinäkuu 2014 | kahakka | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovaisk | elokuu 2014 | taistelu | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debaltseve | tammi-helmikuu 2015 | taistelu | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Donetskin lentokenttä | syyskuu 2014-tammikuu 2015 | taistelu | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Hostomelin lentokenttä | helmikuu 2022 | kahakka | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi ym. 2022; Watling & Reynolds 2022 |
| `case.brovary` | Kiovan akseli ja Brovaryn väijytys | maaliskuu 2022 | kahakka | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi ym. 2022 |
| `case.mariupol` | Mariupol ja Azovstal | helmi-toukokuu 2022 | taistelu | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Harkovan vastahyökkäys | syyskuu 2022 | kampanja | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Siverskyi Donetsin ylitys Bilohorivkassa | toukokuu 2022 | kahakka | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi ym. 2022 |
| `case.bakhmut` | Bahmut | elokuu 2022-toukokuu 2023 | taistelu | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Zaporižžjan hyökkäys | kesä-marraskuu 2023 | kampanja | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Vuoristo-Karabahin sota | syyskuu-marraskuu 2020 | kampanja | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Blitz | syyskuu 1940-toukokuu 1941 | kampanja | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: ensimmäinen päivä ilmassa | 22. kesäkuuta 1941 | taistelu | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Kreeta | toukokuu 1941 | taistelu | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Maltan piiritys | 1940-1942 | kampanja | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Stalingradin ilmasilta | marraskuu 1942-helmikuu 1943 | kampanja | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Ilmataistelut Kubanin yllä | huhti-kesäkuu 1943 | kampanja | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kursk ilmassa | heinäkuu 1943 | taistelu | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operaatio Bagration ilmassa | kesä-elokuu 1944 | kampanja | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploiești (operaatio Tidal Wave) | 1. elokuuta 1943 | kahakka | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Patoiskun (operaatio Chastise) | 16.-17. toukokuuta 1943 | kahakka | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hampuri (operaatio Gomorrah) | heinä-elokuu 1943 | taistelu | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt-Regensburg | 17. elokuuta 1943 | taistelu | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Toinen Schweinfurt ("Musta torstai") | 14. lokakuuta 1943 | kahakka | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Iso viikko (operaatio Argument) | helmikuu 1944 | kampanja | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Nürnbergin hyökkäys | 30.-31. maaliskuuta 1944 | kahakka | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operaatio Bodenplatte | 1. tammikuuta 1945 | taistelu | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Bismarckinmeren taistelu | maaliskuu 1943 | taistelu | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Rabaulin neutralointi | 1943-1944 | kampanja | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Filippiinien meri ("Marianas Turkey Shoot") | kesäkuu 1944 | taistelu | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Musta tiistai Namsin yllä | 23. lokakuuta 1951 | kahakka | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operaatio Rolling Thunder | 1965-1968 | kampanja | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Thanh Hoan silta | 1965-1972 | kahakka | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | Wild Weasels | 1965-1973 | kampanja | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Ault-raportti ja Top Gun | 1968-1972 | kampanja | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operaatio Linebacker | toukokuu-lokakuu 1972 | kampanja | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II ("yhdentoista päivän sota") | joulukuu 1972 | kampanja | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operaatio Focus (Moked) | 5. kesäkuuta 1967 | taistelu | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Uuvutussota: ohjusvyöhyke | 1969-1970 | kampanja | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | SAM-sateenvarjo kanavan yllä | lokakuu 1973 | taistelu | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (operaatio Opera) | 7. kesäkuuta 1981 | kahakka | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operaatio El Dorado Canyon | 15. huhtikuuta 1986 | kahakka | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Iranin ja Irakin ilmasota | 1980-1988 | kampanja | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Black Buck -iskut | toukokuu-kesäkuu 1982 | kahakka | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: Persianlahden ilmakampanjan suunnittelu | elokuu 1990-tammikuu 1991 | kampanja | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: Apache-avausisku | 17. tammikuuta 1991 | kahakka | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | Suuri Scud-metsästys | tammi-helmikuu 1991 | kampanja | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Mutlan harjanne ("Kuoleman tie") | 26.-27. helmikuuta 1991 | kahakka | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operaatio Anaconda: Apachet Shahi-Kotissa | maaliskuu 2002 | taistelu | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | Karbalan Apache-hyökkäys | 24. maaliskuuta 2003 | kahakka | ambush, kill-zone, urban-close, readability | Fontenot ym. 2004 |
| `case.libya-2011` | Libyan ilmakampanja | maaliskuu-lokakuu 2011 | kampanja | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Vuoristo-Karabah: droonit ja ilmatorjunta | syyskuu-marraskuu 2020 | kampanja | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ukraina: kiistetty ilmatila | 2022 | kampanja | sead, mobility, air-superiority, static-exposure | Bronk ym. 2022 |
| `case.hostomel-2022` | Hostomelin lentokenttä | helmikuu 2022 | kahakka | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | helmi-maaliskuu 1971 | kampanja | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operaatio Eagle Claw | huhtikuu 1980 | kahakka | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afganistan: Stinger | 1986-1989 | kampanja | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | taistelu | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | Espanjan armada | 1588 | kampanja | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Quiberonin lahti | 1759 | taistelu | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | Chesapeake (Virginia Capes) | 1781 | taistelu | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Niili (Aboukirinlahti) | 1798 | taistelu | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Kööpenhamina | 1801 | taistelu | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | maaliskuu 1862 | kahakka | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lissa | 1866 | taistelu | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Yalu | 1894 | taistelu | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Manilanlahti | 1898 | taistelu | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Helgolandin lahti | elokuu 1914 | taistelu | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel ja Falklandinsaaret | marraskuu-joulukuu 1914 | kampanja | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Doggerbank | tammikuu 1915 | taistelu | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | River Plate | joulukuu 1939 | taistelu | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Taranto | marraskuu 1940 | kahakka | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Matapan | maaliskuu 1941 | taistelu | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Tanskan salmi ja Bismarckin upottaminen | toukokuu 1941 | kampanja | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7. joulukuuta 1941 | kahakka | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales ja Repulse | 10. joulukuuta 1941 | kahakka | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Jaavanmeri | helmikuu 1942 | taistelu | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Korallimeri | toukokuu 1942 | taistelu | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Savosaari | elokuu 1942 | taistelu | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Itäiset Salomonsaaret | elokuu 1942 | taistelu | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Cape Esperance | lokakuu 1942 | taistelu | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Santa Cruzin saaret | lokakuu 1942 | taistelu | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Guadalcanalin meritaistelu | 12.-15. marraskuuta 1942 | taistelu | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | marraskuu 1942 | kahakka | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | Kanaalin pakomatka | helmikuu 1942 | kahakka | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operaatio Pedestal | elokuu 1942 | taistelu | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Musta toukokuu | toukokuu 1943 | kampanja | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Nordkapp | joulukuu 1943 | taistelu | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | Yhdysvaltain sukellusvenekampanja Japania vastaan | 1941-1945 | kampanja | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Samarin edustalla | 25. lokakuuta 1944 | taistelu | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Surigaon salmi | 25. lokakuuta 1944 | taistelu | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinawa: kamikazekampanja | huhti-kesäkuu 1945 | kampanja | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Eilatin upottaminen | lokakuu 1967 | kahakka | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakia | lokakuu 1973 | taistelu | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | Generaali Belgranon upottaminen | 2. toukokuuta 1982 | kahakka | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | HMS Sheffieldin menetys | 4. toukokuuta 1982 | kahakka | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17. toukokuuta 1987 | kahakka | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operaatio Praying Mantis | 18. huhtikuuta 1988 | taistelu | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | elokuu 2004 | kahakka | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Bisun vallankumous | maaliskuu 2007 | taistelu | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | Dream Coil The International 2013 -turnauksessa | elokuu 2013 | kahakka | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Fakerin Zed Ryua vastaan | syyskuu 2013 | kahakka | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Overpassin boost | marraskuu 2014 | kahakka | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | Hyppäävä AWP Miragella | huhtikuu 2016 | kahakka | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis ja apuvälineiden aika | 2018 | kampanja | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five OG:tä vastaan | huhtikuu 2019 | taistelu | ai-vs-player, tempo, concentration | Berner ym. 2019 |
| `case.alphastar-2019` | AlphaStar saavuttaa grandmasterin | 2019 | kampanja | ai-vs-player, skill-dispersion | Vinyals ym. 2019 |
| `case.desert-storm-left-hook` | Vasen koukku (operaatio Desert Storm -maahyökkäys) | 24.-28. helmikuuta 1991 | kampanja | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | Corrupted Blood -tapaus | syyskuu 2005 | kampanja | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Peli- ja kenttäsuunnittelu (17) {#game-and-level-design-17}

| id | title | patterns | sources |
|---|---|---|---|
| `design.chokepoint` | Pullonkaulat kenttäsuunnittelussa | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Kylkireitit ja vaihtoehtoiset polut | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Näkölinjat ja taisteluetäisyys | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Suojien sijoittelu ja rytmi | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Synnytyspaikkojen suunnittelu ja synnytyssuoja | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Symmetrisen ja epäsymmetrisen kartan tasapaino | balance, exchange-ratio, key-terrain | Elias ym. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Luokkien tasapaino ja vastaukset | class-counter, balance, combined-arms | Sirlin 2006; Elias ym. 2012; Adams & Dormans 2012 |
| `design.flow` | Virta, silmukat ja selkeät asettelut | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander ym. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Pelitalous ja palautesilmukat | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Vastustajien valinta ja taitojen jakauma | skill-dispersion, balance | Herbrich ym. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | Tekoälyvastustajat kenttien koettelijoina | ai-vs-player, readability | Seif El-Nasr ym. 2013; Drachen ym. 2009 |
| `design.meaningful-play` | Merkityksellinen pelaaminen ja valinta | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Vaihdot ja joukkuepeli ampumapeleissä | mutual-support, initiative | Xenopoulos ym. 2020; Schubert ym. 2016 |
| `design.map-control` | Kartan hallinta | key-terrain, local-superiority, flow | Xenopoulos ym. 2022; Rioult ym. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Lämpökartat ja paikkatelemetria suunnittelussa | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler ym. 2004; Kim ym. 2008; Bowman ym. 2012 |
| `design.fun-mastery` | Hallinta, oppiminen ja hauskuus | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Kierrosten taloudet ja ostopäätökset | conformity, economy, coordination, mixed-strategy | Xenopoulos ym. 2020; Fleiss 1971 |

### Tutkimukset (113) {#studies-113}

| id | title | sources |
|---|---|---|
| `study.engel-1954` | Engel: Lanchesterin neliölaki Iwo Jimalla | Engel 1954 |
| `study.bracken-1995` | Bracken: Lanchesterin mallit Ardenneilla | Bracken 1995 |
| `study.fricker-1998` | Fricker: Ardennien uuvutusmallit uudelleen tarkasteltuina | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas ja Turkes: Kursk ja Ardennit | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley ja Helmbold: neliölain todentaminen | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | Pelaajien kuolemien GIS-analyysi | Drachen & Canossa 2009; Seif El-Nasr ym. 2013 |
| `study.hoobler-2004` | Lighthouse: kilpailukäyttäytymisen visualisointi | Hoobler ym. 2004 |
| `study.xenopoulos-2020` | Toimien arvottaminen Counter-Strikessa | Xenopoulos ym. 2020 |
| `study.schubert-2016` | Kohtaamisten tunnistaminen e-urheilussa | Schubert ym. 2016 |
| `study.red-baron` | Project Red Baron: ilmataistelu Vietnamin yllä | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: historiallisten taistelujen kvantifioitu arvio | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: voiman käyttö selittää lopputulokset | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Katsaus pelidatan visualisointiin | Wallner & Kriglstein 2013; Bowman ym. 2012 |
| `study.willard-1962` | Willard: Lanchester kolmen vuosisadan maataisteluita vastaan | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: kuusikymmentä toisen maailmansodan kahakkaa | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: taistelumallit ja Yhdysvaltain sisällissota | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: tilastollinen malli uuvutusdatalle | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: etenemisnopeudet maataistelussa | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas ja Dinges: olosuhteet ratkaisevat enemmän kuin laki | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | Kurskin tietokanta | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | Ardennien kampanjan tietokanta | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson ja MacKay: Britannian taistelu Lanchester-datana | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte ja Schmidt: luvut voittavat yhä taisteluja | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: taistelutappioiden säännönmukaisuudet | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Dupuyn taktinen numeerinen deterministinen malli | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: sota lukuina | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: taisteluvoima | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter ja Stam: demokratiat sodassa | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: mukautuva dynaaminen malli | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester ja sissisota | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: stokastinen salvomalli | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: laivastotaktiikan kulmakivet | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | 3:1-säännön keskustelu | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: aseellisten konfliktien mallintaminen | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Ault-raportti: ohjukset ammuttu alueensa ulkopuolelta | Ault 1969; Michel 1997 |
| `study.gwaps` | Persianlahden sodan ilmavoimatutkimus | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Blackettin sirkus | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Syvyyspommien asetukset rannikkojoukoissa (Coastal Command) | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Valkoiset alapinnat sukellusveneentorjuntakoneissa | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: panssarointi sinne, missä palanneisiin pommikoneisiin ei osunut | Mangel & Samaniego 1984 |
| `study.optimal-search` | Optimaalinen etsintä: sukellusveneistä AF447:ään | Stone 1975; Stone ym. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: taistelu helvetissä | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Pääsyn estäminen ja aluekielto | Krepinevich ym. 2003 |
| `study.bauckhage-2012` | Miten pelaajat menettävät kiinnostuksensa | Bauckhage ym. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Pelaajakäyttäytymisen klusterointi luonnollisessa ympäristössä | Drachen ym. 2012; Drachen ym. 2009 |
| `study.canossa-2011` | Pelaajan turhautumisen tunnistaminen | Canossa ym. 2011 |
| `study.medler-2011` | Data Cracker: telemetriapaneelit tuotannossa | Medler ym. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: pelin visuaalinen analytiikka | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Hahmon liike World of Warcraftin taistelukentillä | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: käyttäjätestien mittaaminen suuressa mittakaavassa | Kim ym. 2008 |
| `study.game-data-science` | Pelidatatiede | Seif El-Nasr ym. 2021; Seif El-Nasr ym. 2013 |
| `study.ai-and-games` | Tekoäly ja pelit | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Taito ja joukkueen liike Dota 2:ssa | Drachen ym. 2014 |
| `study.yang-2014` | Taistelukuviot, jotka ennustavat MOBA-voitot | Yang ym. 2014; Schubert ym. 2016 |
| `study.eggert-2015` | Pelaajaroolit Dota 2:ssa | Eggert ym. 2015 |
| `study.semenov-2017` | Dota 2:n lopputulosten ennustaminen draftista | Semenov ym. 2017; Makarov ym. 2018 |
| `study.hodge-2021` | Voittojen ennustaminen livenä ammattilaisten e-urheilussa | Hodge ym. 2021 |
| `study.rioult-2014` | Pelaajien sijaintien topologia | Rioult ym. 2014 |
| `study.bednarek-2017` | Pelaajien arviointi joukkuepelien ampujissa | Bednárek ym. 2017 |
| `study.katona-2019` | Kuka kuolee seuraavaksi: ennustaminen | Katona ym. 2019 |
| `study.block-2018` | Datalähtöiset tarinat e-urheilun yleisölle | Block ym. 2018 |
| `study.ggviz` | ggViz: pelitilojen haku suuressa mittakaavassa | Xenopoulos ym. 2022 |
| `study.openai-five` | OpenAI Five: laajamittainen vahvistusoppiminen Dota 2:ssa | Berner ym. 2019 |
| `study.alphastar` | AlphaStar: grandmaster-taso StarCraft II:ssa | Vinyals ym. 2019 |
| `study.cervone-2016` | Odotettu hallinta-arvo koripallossa | Cervone ym. 2016 |
| `study.decroos-2019` | VAEP: jalkapallon pallonkäsittelytoimien arvottaminen | Decroos ym. 2019 |
| `study.pitch-control` | Kentän hallinta ja tilan luominen | Spearman 2018; Fernández & Bornn 2018; Taki ym. 1996 |
| `study.franks-2015` | Puolustustaidon paikkarakenne | Franks ym. 2015; Miller ym. 2014 |
| `study.lucey-2013` | Joukkueen roolit seurantadatasta | Lucey ym. 2013 |
| `study.shot-quality` | Odotetut maalit ja laukauksen laatu | Decroos ym. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: paikkasidonnainen heittotehokkuus | Goldsberry 2012; Miller ym. 2014 |
| `study.team-sports-survey` | Joukkuelajien aika-paikka-analyysi | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Ripleyn K: klusterointi joka mittakaavassa | Ripley 1977; Baddeley ym. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark ja Evans: lähimmän naapurin hajautuminen | Clark & Evans 1954 |
| `study.getis-ord` | Getis-Ord-kuumat pisteet | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Paikallisen tilallisen yhteyden indikaattorit | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | Tilallinen skannaustilasto | Kulldorff 1997 |
| `study.kde` | Ydintiheysestimointi | Silverman 1986 |
| `study.knox-1964` | Aika-tilavuorovaikutus | Knox 1964; Diggle 2013 |
| `study.maup` | Muokattavan aluejakoyksikön ongelma | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Isovistit ja näkyvyysgraafit | Benedikt 1979; Turner ym. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Tilasyntaksi | Hillier & Hanson 1984; Turner ym. 2001 |
| `study.mean-crowding` | Keskimääräinen tiivistyminen | Lloyd 1967 |
| `study.survival-analysis` | Eloonjäämisanalyysi kuolemaan kuluvasta ajasta | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Yleistetyt lineaariset mallit lukumäärille | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap ja väliestimaatit | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey ym.: viive ja näkyviin astujan etu | Tokey ym. 2024 |
| `study.lee-chang-2017` | Lee ja Chang: laukaus kulman takaa | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: viive ja pelaajan toimet | Claypool & Claypool 2006; Liu ym. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos ym.: ammattilaiset ja harrastajat voittotodennäköisyyden kautta | Xenopoulos ym. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos ym.: taloudelliset päätökset Counter-Strikessa | Xenopoulos ym. 2021 |
| `study.maymin-2021` | Maymin: älykkäät tappot ja arvottomat kuolemat | Maymin 2021 |
| `study.moba-live-prediction` | Lopputuloksen ennustaminen livenä MOBA-peleissä | Yang ym. 2017; Silva ym. 2018 |
| `study.hayakawa-2025` | Hayakawa ym.: Valorant-kierrokset taktisista piirteistä | Hayakawa ym. 2025 |
| `study.paskiv-2026` | Paskiv ym.: roolit ammattilaisten Counter-Strike 2:ssa | Paskiv ym. 2026 |
| `study.ibrahim-2024` | Ibrahim ym.: lähitaistelun harjoittaminen | Ibrahim ym. 2024 |
| `study.crowd-turbulence` | Väkijoukon pyörteet vuoden 2006 hadžissa | Helbing ym. 2007; Moussaïd ym. 2011 |
| `study.walking-groups` | Kävelevät ryhmät muovaavat väkijoukkoja | Moussaïd ym. 2010 |
| `study.pigeon-hierarchy` | Hierarkkinen ryhmädynamiikka kyyhkyparvissa | Nagy ym. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Sosiaalinen vaikutus tekee menestyksestä epätasaista ja arvaamatonta | Salganik ym. 2006 |
| `study.wisdom-undermined` | Sosiaalinen vaikutus heikentää joukkojen viisautta | Lorenz ym. 2011 |
| `study.drawing-power-of-crowds` | Joukon vetovoima | Milgram ym. 1969; Gallup ym. 2012 |
| `study.asch-conformity` | Mukautuminen yksimielisen enemmistön mukaan | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: taistelumotivaatio Irakissa | Wong ym. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Yhteenkuuluvuus ja suoritus: metaanalyysit | Mullen & Copper 1994; Beal ym. 2003 |
| `study.loss-averse-golfers` | Tappioaversio ammattigolfaajilla | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Kuumat kädet pesäpallossa | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Rangaistuspotkut: ammattilaiset pelaavat minimax-strategiaa | Chiappori ym. 2002; Palacios-Huerta 2003; Bar-Eli ym. 2007 |
| `study.minimax-wimbledon` | Minimax-peli Wimbledonissa | Walker & Wooders 2001 |
| `study.collective-intelligence` | Joukkueiden kollektiivinen älykkyys | Woolley ym. 2010; Kim ym. 2017 |
| `study.online-world-networks` | Verkkomaailman sosiaaliset verkostot | Szell ym. 2010 |
| `study.team-networks` | Syöttöverkostot ja joukkueen suoritus | Duch ym. 2010; Grund 2012 |
| `study.complex-contagion` | Käyttäytyminen leviää klusteroituneiden verkostojen kautta | Centola 2010 |

### Lähdeluettelo {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Ammianus Marcellinus (käänn. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Ardant du Picq, C. (käänn. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Arrian (käänn. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(tarkistettu 2026-11-15: olemassaolo)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; ym. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(tarkistettu 2026-11-15: olemassaolo)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(tarkistettu 2026-11-15: olemassaolo)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(tarkistettu 2026-11-15: olemassaolo)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(tarkistettu 2026-11-15: olemassaolo)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Caesar, G. J. (käänn. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Clausewitz, C. von (käänn. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(tarkistettu 2026-11-15: olemassaolo)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Craven, W. F.; Cate, J. L. (toim.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(tarkistettu 2026-11-15: olemassaolo)*
- Craven, W. F.; Cate, J. L. (toim.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(tarkistettu 2026-11-15: olemassaolo)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(tarkistettu 2026-11-15: olemassaolo)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Delbrück, H. (käänn. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (alkup. 1920). University of Nebraska Press, Lincoln. *(tarkistettu 2026-11-15: olemassaolo)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3. painos). CRC Press, Boca Raton. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Douhet, G. (käänn. Ferrari, D.) (1942). The Command of the Air (alkup. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(tarkistettu 2026-11-15: olemassaolo)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(tarkistettu 2026-11-15: olemassaolo)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(tarkistettu 2026-11-15: yksityiskohdat)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(tarkistettu 2026-11-15: olemassaolo)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(tarkistettu 2026-11-15: yksityiskohdat)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2. painos). Morgan Kaufmann, Burlington. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (uud. laitos). Office of Air Force History, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(tarkistettu 2026-11-15: yksityiskohdat)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(tarkistettu 2026-11-15: yksityiskohdat)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Grau, L. W. (toim.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(tarkistettu 2026-11-15: olemassaolo)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Herodotus (käänn. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2. painos). Naval Institute Press, Annapolis. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3. painos). Naval Institute Press, Annapolis. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Isserson, G. S. (käänn. Menning, B. W.) (2013). The Evolution of Operational Art (alkup. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Jomini, A.-H. de (käänn. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(tarkistettu 2026-11-15: olemassaolo)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(tarkistettu 2026-11-15: yksityiskohdat)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(tarkistettu 2026-11-15: olemassaolo)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(tarkistettu 2026-11-15: olemassaolo)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Livy (käänn. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(tarkistettu 2026-11-15: olemassaolo)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(tarkistettu 2026-11-15: yksityiskohdat)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(tarkistettu 2026-11-15: olemassaolo)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Mao Tse-tung (käänn. Griffith, S. B.) (1961). On Guerrilla Warfare (alkup. 1937). Praeger, New York. *(tarkistettu 2026-11-15: olemassaolo)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(tarkistettu 2026-11-15: yksityiskohdat)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(tarkistettu 2026-11-15: yksityiskohdat)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(tarkistettu 2026-11-15: yksityiskohdat)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2. painos). Chapman & Hall, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(tarkistettu 2026-11-15: olemassaolo)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(tarkistettu 2026-11-15: olemassaolo)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(tarkistettu 2026-11-15: olemassaolo)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Morillo, S. (toim.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(tarkistettu 2026-11-15: olemassaolo)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(tarkistettu 2026-11-15: olemassaolo)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(tarkistettu 2026-11-15: olemassaolo)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Mueller, K. P. (toim.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(tarkistettu 2026-11-15: olemassaolo)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Osipov, M. (käänn. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (alkup. 1915). Naval Research Logistics 42(3): 435-490. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(tarkistettu 2026-11-15: yksityiskohdat)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(tarkistettu 2026-11-15: yksityiskohdat)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Plutarch (käänn. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Polybius (käänn. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(tarkistettu 2026-11-15: yksityiskohdat)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(tarkistettu 2026-11-15: olemassaolo)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(tarkistettu 2026-11-15: olemassaolo)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(tarkistettu 2026-11-15: olemassaolo)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(tarkistettu 2026-11-15: olemassaolo)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(tarkistettu 2026-11-15: olemassaolo)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (toim.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(tarkistettu 2026-11-15: olemassaolo)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(tarkistettu 2026-11-15: olemassaolo)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(tarkistettu 2026-11-15: olemassaolo)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(tarkistettu 2026-11-15: yksityiskohdat)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Special Operations Review Group (Holloway, J. L., puheenjohtaja) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Stouffer, S. A.; ym. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(tarkistettu 2026-11-15: olemassaolo)*
- Sun Tzu (käänn. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Tacitus (käänn. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(tarkistettu 2026-11-15: yksityiskohdat)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 osaa). Operations Research Society of America, Military Applications Section, Arlington VA. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4. painos). Routledge, Abingdon. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2. painos). CRC Press, Boca Raton. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Triandafillov, V. K. (käänn. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (alkup. 1929). Frank Cass, Ilford. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(tarkistettu 2026-11-15: olemassaolo)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Vegetius (käänn. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(julkinen alue)* *(tarkistettu 2026-11-15: olemassaolo)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; ym. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(tarkistettu 2026-11-15: yksityiskohdat)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Wallner, G. (toim.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(tarkistettu 2026-11-15: olemassaolo)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(tarkistettu 2026-11-15: olemassaolo)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Washburn, A. R. (2002). Search and Detection (4. painos). INFORMS / Military Applications Section, Linthicum MD. *(tarkistettu 2026-11-15: olemassaolo)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(tarkistettu 2026-11-15: olemassaolo)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2. painos). Air University Press, Maxwell AFB. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(tarkistettu 2026-11-15: olemassaolo)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Xenophon (käänn. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(julkinen alue)* *(tarkistettu 2026-11-15: yksityiskohdat)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(tarkistettu 2026-11-15: olemassaolo)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(tarkistettu 2026-11-15: olemassaolo)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(tarkistettu 2026-11-15: olemassaolo)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(tarkistettu 2026-11-15: yksityiskohdat)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(tarkistettu 2026-11-15: yksityiskohdat)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(tarkistettu 2026-11-15: yksityiskohdat)*

<!-- kb:end -->
