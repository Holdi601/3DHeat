---
title: "Teadmiste kataloog"
parent: "Teadmiste lääts"
nav_order: 2
lang: "et"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Teadmiste kataloog

See on täielik loend sellest, mida [teadmiste lääts](knowledge.md) teab: mustrid, mida ta otsib, ideed, meetodid, ajaloolised juhtumid ja uuringud, mida ta tsiteerib, ning raamatud ja artiklid, mis nende taga on. Kasuta seda, et leida kirje id järgi või kontrollida allikat.

See leht on genereeritud teadmusbaasist käsuga `node tools/knowledge-doc.mjs`; ära muuda märkide vahel olevat.

<!-- kb:begin -->

Teadmusbaasis on 579 kirjet (135 mõistet, 37 meetodit, 277 ajaloolist juhtumit, 17 disainipõhimõtet, 113 uuringut), mis hõlmavad 93 mustrit ja viitavad 556 allikale.

### Mustrid (93) {#patterns-93}

| id | perekond | mida see andmetes välja näeb |
|---|---|---|
| `concentration` | jõud | Pool, mis toob ühte kohta rohkem üksusi, võidab selle koha rohkem, kui pelkad arvud annaksid. |
| `local-superiority` | jõud | Surmad lähevad sellele poolele, kes on lahingukaugusel teisest arvukam, olenemata kogusummadest. |
| `attrition` | jõud | Kaotused järgivad mõlema poole jõudu aja jooksul; võitluse otsustab see, kes enne otsa saab. |
| `exchange-ratio` | jõud | Surmad ühe kaotuse kohta erinevad tugevasti koha, poole või klassi järgi. |
| `aimed-fire` | jõud | Kaotused kasvavad vastase arvuga, aga mitte oma arvuga. |
| `area-fire` | jõud | Kaotused kasvavad mõlema poole arvude korrutisega: tihedust karistatakse. |
| `defeat-in-detail` | jõud | Pool hävitatakse tükkhaaval, kui tema osad saabuvad ükshaaval. |
| `mutual-support` | jõud | Kaotusele vastab kiiresti läheduses olev kaaslane: vahetatakse. |
| `combined-arms` | jõud | Klassid toimivad koos hästi, kui üks katab teise nõrkust, ja halvasti, kui üksi. |
| `class-counter` | jõud | Üks klass võidab ebaproportsionaalselt mõne kindla teise klassi vastu või kindlas kohas. |
| `initiative` | jõud | Kes lahingus esimesena punkti teeb, võidab selle tavaliselt. |
| `key-terrain` | maastik | Samad mõned kohad otsustavad lahingud mäng mängu järel. |
| `fields-of-fire` | maastik | Kohad, kust nähakse kaugele üle maa, mida teised peavad läbima, toovad rohkem surmasid. |
| `high-ground` | maastik | Surmad tehakse kõrgemalt kui maa, millel ohvrid seisavad. |
| `cover` | maastik | Surmad ajaühiku kohta langevad seal, kus geomeetria blokeerib nägemise ja tule. |
| `open-ground` | maastik | Surmad ajaühiku kohta tõusevad seal, kus miski ei blokeeri nägemist ega tuld. |
| `kill-zone` | maastik | Surmad koonduvad sinna, kus liikumine on sunnitud läbi jälgitud ja tulega kaetud maa. |
| `chokepoint` | maastik | Paljud ületused surutakse läbi väikese maa, ja seal on kaotused. |
| `reverse-slope` | maastik | Turvalisus vahetult harja või müüri taga, vastase otsese nägemise eest varjus. |
| `safe-ground` | maastik | Koht, kus aega veedetakse, aga vähe surevad. |
| `obstacle` | maastik | Teed kõverduvad ümber blokeeritud maa ja muutuvad mõneks reaks. |
| `flank` | liikumine | Harva kasutatav tee viib rohkem surmadeni kui peamised teed. |
| `avenue-of-approach` | liikumine | Liikumine voolab mõne raja kaudu alade vahel. |
| `mobility` | liikumine | Liikuvad üksused surevad aja kohta vähem (või rohkem) kui aeglased või paigal seisvad. |
| `static-exposure` | liikumine | Paigal seisvad üksused surevad aja kohta rohkem kui liikuvad. |
| `interior-lines` | liikumine | Pool, kellel on oma lahingute vahel lühikesed teed, nihutab jõudu kiiremini kui teine. |
| `envelopment` | liikumine | Surmad tulevad mitmelt suunalt ühe poole positsioonile. |
| `ambush` | liikumine | Mööda teed liikuvad üksused surevad kiiresti vastastele, kes on juba positsioonil. |
| `spawn-pressure` | aeg | Elud lõpevad ühest tekkekohast alustades kiiresti. |
| `tempo` | aeg | Kiirem pool jõuab lahinguni ja löö enne, kui teine reageerib. |
| `surprise` | aeg | Kaotused tulevad purskena enne, kui ohvrid tagasi tulistavad. |
| `energy-advantage` | õhk | Tapjad on kõrgemal ja kiiremad kui nende ohvrid. |
| `air-superiority` | õhk | Ühe poole lennukid tapavad mitu korda rohkem, kui kaotavad. |
| `sead` | õhk | Maa-õhutõrje võtab palju lennukeid, kuni see leitakse ja hävitatakse. |
| `bvr` | õhk | Surmad juhtuvad pika kauguse pealt, enne kui ohver jõuab lähedale. |
| `fleet-salvo` | meri | Vägi, mis löö esimesena, kaotab vähe; teine jääb vähe ellu, et vastata. |
| `scouting` | meri | Pool, kes leiab teise esimesena, valib lahingu. |
| `urban-close` | linn | Lühikesed lahingukaugused, palju surmi tihedas geomeetrias, aeglane puhastamine. |
| `vertical` | linn | Surmad tulevad ülemistelt korrustelt või katustelt tänavale. |
| `skill-dispersion` | inimesed | Mõned mängijad moodustavad suure osa surmadest või kaotustest. |
| `ai-vs-player` | inimesed | AI juhitud üksused käituvad samas kohas mängijatest teisiti. |
| `balance` | disain | Pooled, tekkekohad või klassid alustavad ebaühtlaste võimalustega. |
| `economy` | disain | Teenitud, makstud ja kaotatud ressursid koonduvad mõnda kohta või mõne mängija kätte. |
| `flow` | disain | Kuidas mängijad taset läbivad: silmused, rajad, umbteed. |
| `sightlines` | disain | Pikad nägemisjooned otsustavad, kus lahingud algavad ja kes need võidab. |
| `readability` | disain | Surmad, mida mängijad ette ei näe: tagant, nägemisulatuse väljast. |
| `formation` | liikumine | Pooled üksused liiguvad koos tuntava kuju järgi: joon, kolonn, kiil, eššelon, kast. |
| `frontal-assault` | liikumine | Grupp tormab vaenlasele otse vastu esirinda. |
| `double-envelopment` | liikumine | Kaks gruppi lööb ühe vaenlase mõlemale küljele umbes samal ajal. |
| `encirclement` | liikumine | Vaenlase grupp jääb teise poole kõigi külge ümber, väljapääsud on vähesed. |
| `penetration` | liikumine | Grupp läbib vaenlase liini kohas, kus vaenlased seisavad mõlemal pool. |
| `fire-and-maneuver` | liikumine | Osa grupist liigub, kui ülejäänud seisab ja katab, ning rollid vahelduvad. |
| `feint` | liikumine | Väike grupp meelitab vaenlase ühte kohta; peamine löök tabab mujal veidi hiljem. |
| `withdrawal` | liikumine | Kontaktis olev grupp pöördub ära ja avab vahemaa vaenlaseni. |
| `pursuit` | liikumine | Grupp jälitab eemalduvat vaenlast, hoides või vähendades vahemaad. |
| `defence-in-depth` | maastik | Kaitsjad seisavad mitmes vööndis üksteise taga piki vaenlase edasiliikumise telge. |
| `screening` | liikumine | Väike üksus liigub põhijõust palju ees ja kohtub vaenlasega esimesena. |
| `dispersion` | jõud | Pool laieneb aja jooksul; vähem tema üksusi jagab ühte kohta. |
| `missile-defence` | õhk | Raketiohu all olevad lennukid pööravad ohu külje või saba poole: crank, notch, drag, pump. |
| `angles-fight` | õhk | Lähivõitlus madalal kiirusel ja suure pöörde kiirusega, peetakse ninaasendi, mitte energia pärast. |
| `cap` | õhk | Lennukid tiirlevad fikseeritud punkti ümber minuteid, oodates vastast. |
| `strike-package` | õhk | Erinevate rollidega lennukid lendavad koos sihtmärgini; osa ründab maad, teised katavad neid. |
| `line-of-battle` | meri | Laevad sõidavad kolonnis üksteise taga, et kõik külgkahurid saaksid tulistada. |
| `crossing-the-t` | meri | Kolonn läheb üle vaenlase kolonni esipoolest: kõik tema kahurid saavad tulistada, vaenlase omad vähesed. |
| `fatal-funnel` | linn | Mängijad, kes sisenevad ühte ust, tuppa või kitsaskohta, surevad seal mõne hetkega palju sagedamini kui mujale sisenedes. |
| `crossfire` | jõud | Hoidjad, kelle tulejooned koonduvad eri nurkade alt, võidavad rohkem duelle kui üksik hoidja. |
| `peeker-advantage` | aeg | Mängija, kes liigub nähtavale, võidab duelle sagedamini (või harvemini) kui pool vastu sellele, kes hoiab nurka. |
| `entry` | aeg | Vooru esimene surm määrab suure osa voorust; sisenemine võidab või kaotab koha ja toe järgi. |
| `utility-support` | jõud | Vahk või suits vahetult enne duelli muudab, kes selle võidab. |
| `man-advantage` | jõud | Vooru võidab pool, kellel on rohkem elus mängijaid, ja mõni pool muudab või raiskab eelise. |
| `clutch` | inimesed | Viimased ellujäänud mängijad võidavad sagedamini (või harvemini), kui vooru seis ette näitab. |
| `action-value` | inimesed | Surmad, vahetused, paigaldused ja abivahendid erinevad selle poolest, kui palju nad muudavad võidu võimalust. |
| `lurk` | liikumine | Üksik mängija meeskonnast kaugel tapab (või sureb) teistsugusel kiirusel kui parv. |
| `rotation` | liikumine | Kui kiiresti pool nihutab mängijaid lahingusse või eesmärgile, otsustab, kas ta peab positsiooni või võtab selle tagasi. |
| `collective-order` | inimesed | Poole liikuvad üksused suunduvad samasse kohta palju sagedamini, kui nende omad rajad, ajas nihutatuna, juhuslikult annaksid. |
| `milling` | inimesed | Poole üksused tiirlevad ühise keskme ümber: pöörlemine ilma puhta liikumiseta. |
| `herding` | inimesed | Üksused lahkuvad kohast nii, nagu nende ees olnud kaaslane, kaugemale koha enda tõenäosusest ja vaenlase kopeerimisest. |
| `lane-formation` | inimesed | Vastassuunalised voolud hoiavad eraldi radu; liikumine koondub mõnele rajale, mida kasutatakse mängust mängu. |
| `crowding` | inimesed | Kiirus ja voog langevad, kui üksused kogunevad; kitsaskohast läbisurumine annab vähem läbijaid. |
| `leadership` | inimesed | Mõned üksused pöörduvad esimesena ja teised kopeerivad nende suuna mõne sekundi hiljem. |
| `cohesion` | inimesed | Üksused, mis triivivad grupist eemale, surevad sagedamini kui need, kes grupiga koos püsivad. |
| `breaking-point` | inimesed | Pool, kes on kaotanud osa oma jõust, lõpetab lähenemise ja taandub, kaugemale kui tema vahemaa vaenlaseni seletab. |
| `panic` | inimesed | Äkilise ohu all üksused hajuvad, põgenevad või külmuvad ning koordinatsioon laguneb. |
| `loss-chasing` | inimesed | Pärast kaotust võtavad üksused rohkem (või vähem) riski kui pärast võitu. |
| `hot-hand` | inimesed | Edu järgneb edule sagedamini, kui segatud sama mängija järjestused lubaksid. |
| `conformity` | inimesed | Poole liikmed valivad ühtemoodi – ostud, varustus, teed – oma eelistustest hoolimata. |
| `suppression` | inimesed | Sissetulev tuli muudab, kuidas üksused liiguvad ja tulistavad, isegi kui see ei tapa. |
| `social-loafing` | inimesed | Tegevus pea kohta langeb, kui kaasmängijaid on rohkem. |
| `mixed-strategy` | inimesed | Valikud, mis peaksid olema ettearvamatud, muutuvad kindlaks mustriks: üks variant võidab rohkem või valikud käivad järjestustena. |
| `coordination` | inimesed | Liikmed tegutsevad sammu pidades ilma nähtavate käskudeta: sünkroonitud liikumine, ajastus ja valikud. |
| `contagion` | inimesed | Seisund liigub üksuselt üksusele kokkupuute või lähedusega ja levib üle kaardi. |
| `territoriality` | inimesed | Üksused hoiavad teineteisest distantsi ja püsivad oma alal. |
| `interaction-network` | inimesed | Kes võitleb, toetab ja järgib kedagi, moodustab võrgu, millel on keskused, rühmad ja sillad. |

### Mõisted (135) {#concepts-135}

| id | pealkiri | läätsed | mustrid | allikad |
|---|---|---|---|---|
| `concept.lanchester-square` | Lanchesterio ruudu seadus (sihitud tulistamine) | sõjandus, õhk, meri, e-sport | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Lanchesterio lineaarne seadus (pindtulistamine, üks ühele) | sõjandus, linn, e-sport | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Jõu koondamine (mass) | sõjandus, õhk, meri, e-sport | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Jõuvahekorrad ja 3:1 reegel | sõjandus | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Kaotuste vahetussuhe | sõjandus, õhk, e-sport, disain | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Lahingujõud ja selle kordajad | sõjandus | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Jõu kasutamise kaasaegne süsteem | sõjandus | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | OODA-tsükkel (vaatle, orienteeru, otsusta, tegutse) | sõjandus, õhk, e-sport | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Energia-manööverdusvõime teooria | õhk | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Hävitajate põhimanöövrid ja õhulahingu manööverdamine | õhk | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Maastikuanalüüs: OAKOC / KOCOA | sõjandus, disain, linn | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: missiooni muutujad | sõjandus | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Võti- ja otsustav maastik | sõjandus, disain, e-sport | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Vaatlus ja tulevälja | sõjandus, disain, e-sport, linn | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Kate ja peitmine | sõjandus, linn, disain | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Lähenemisteed ja liikumiskoridorid | sõjandus, disain | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Ületuskohad ja kitsad kohad | sõjandus, disain, e-sport | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Kokkupuuteala ja tapmistsoonid | sõjandus, linn, disain | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Tagumise nõlva kaitse ja varjamine | sõjandus, disain | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Kõrgendik | sõjandus, disain | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Sise- ja välisjooned | sõjandus | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Osade kaupa purustamine | sõjandus, e-sport | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Vastastikune toetus | sõjandus, õhk, e-sport | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Kombineeritud relvaliigid | sõjandus, disain | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Mahasurumine | sõjandus, linn | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Vaenlase õhutõrje mahasurumine ja hävitamine (SEAD/DEAD) | õhk, sõjandus | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Õhupatrull ja õhuülekaal (CAP) | õhk | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Nähtavusulatusest kaugemal kokkupuude (BVR) | õhk | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Kaudne lähenemine | sõjandus, e-sport, disain | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Haaramine ja ümbersaartamine | sõjandus | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Varitsus | sõjandus, e-sport, disain | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Sügavkaitse | sõjandus | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Hõõrdumine ja sõjasumu | sõjandus, e-sport | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Rünnaku kulminatsioonipunkt | sõjandus | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Üllatus | sõjandus, õhk, meri, e-sport | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Jõu säästlik kasutamine | sõjandus, e-sport | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Linnamaastik | linn, sõjandus, e-sport | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Merekontroll ja otsustav laevastikulahing | meri | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Hughesi salvomudel: esimesena löömine | meri, õhk | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Otsingu- ja tuvastusteooria | meri, õhk, sõjandus | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Operatsioonianalüüs: tõhususe mõõdikud | sõjandus, õhk, meri, disain | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Sõjamäng analüüsina | sõjandus, disain | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Manööversõda | sõjandus, e-sport | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Lahingukohesioon ja moraalitegur | sõjandus | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Raskuskese | sõjandus | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Otsustavad punktid | sõjandus, e-sport | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Operatsioonijooned | sõjandus | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Hävitamise ja ammendamise strateegiad | sõjandus | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Sügav lahing ja sügavoperatsioonid | sõjandus | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | sõjandus, õhk | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Missiooni juhtimine (Auftragstaktik) | sõjandus, e-sport | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Läbimurre ja ärakasutamine | sõjandus | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Tuli ja liikumine | sõjandus, e-sport | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Sammuline tulevalve | sõjandus, e-sport | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Luure-tõmme ja infiltratsioon | sõjandus, e-sport | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | Reserv | sõjandus, e-sport | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Elastne kaitse ja vastulöök | sõjandus | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | Tapaahel (leia, fikseeri, jälgi, sihi, kaasa, hinda) | sõjandus, õhk, meri | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Avastusulatus versus kokkupuutekaugus | õhk, meri, sõjandus | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Lahinguefektiivsuse väärtus (CEV) | sõjandus, e-sport | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Hajutatus lahinguväljal | sõjandus, e-sport | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Lähitoetus õhust (CAS) | õhk, sõjandus | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Õhuline keelamine (interdiction) | õhk, sõjandus | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Saatmine versus hävituspatrull | õhk | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Energiavõitlus versus pöördevõitlus | õhk | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Juhtiv, puhas ja jäljendav jälitus | õhk | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Thachi kõikumine | õhk | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Sõrmenelik ja võitlev paar | õhk | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Olemasolev laevastik | meri | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | T-ületamine | meri, sõjandus | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Konvoi | meri | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Ligipääsu takistamine ja alade keelamine | meri, õhk, sõjandus | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Kindluspunkt linnaalal | linn, sõjandus | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Hiireauk: liikumine läbi hoonete | linn, sõjandus, disain | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Piiramine | sõjandus, linn | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Sissisõda | sõjandus, linn | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Mässuvastane võitlus | sõjandus, linn | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Varjupaik | sõjandus, disain | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Eksitus (maskirovka) | sõjandus, e-sport | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Infoeelis | sõjandus, e-sport | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Majandusvoorud ja ressursi tempo | e-sport, disain | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Liikumisformatsioonid: joon, kolonn, kiil, eššelon | sõjandus, e-sport | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Frontaalrünnak | sõjandus | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Topeltümbritsemine (käärid) | sõjandus | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Ümbersaartamine ja kott | sõjandus | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Läbitungimine ja läbimurre | sõjandus | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Tagaajamine | sõjandus | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Taandumine: tagasitõmbumine, viivitus ja taganemine | sõjandus | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Eksitus ja demonstratsioon | sõjandus, e-sport | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Ekraan, valve ja kate: turvalisus enne põhijõudu | sõjandus | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Raketi eest kaitsmine: crank, notch, drag ja pump | õhk | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | BVR-formatsioonid: sein, juht-saba, grinder, käärid | õhk | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Nurkade ja energia võitlus | õhk | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Löögipakett ja mahasurumise järjestamine | õhk | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | Lahingujoon | meri | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | Surmav lehter | linn, sõjandus, e-sport, disain | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Ruumi puhastamine: üllatus, kiirus, kontrollitud vägivald | linn, sõjandus, e-sport | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Domineerimispunktid | linn, sõjandus, e-sport | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Nurkade läbivaatus: viilutamine | linn, sõjandus, e-sport | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Ristuline tuli ja läbivad tulevälja | sõjandus, linn, e-sport, disain | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Nähtavale liikuja eelis | e-sport, disain | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Mehe eelis elimineerimisvoorudes | e-sport, sõjandus | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Sisenemine ja avaduell | e-sport, linn | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Abivahendid enne sisenemist: vahk ja suits | e-sport, linn, sõjandus | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Jalakäijate liikumise sotsiaalse jõu mudel | disain, linn, sõjandus | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Radade moodustumine vastassuunalises voos | disain, linn | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Kiirem on aeglasem | disain, linn, sõjandus | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Rahvahulga põhidiagramm | disain, linn | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Radade teke ja soovijooned | disain, sõjandus | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Paanika on haruldane: kollektiivne vastupidavus | sõjandus, linn, disain | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boidid: eraldumine, joondumine, ühtekuuluvus | disain, sõjandus | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Korrastusparameeter ja kollektiivse liikumise algus | disain, sõjandus, õhk, meri | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Parv, pöörlemine ja polariseeritud seisundid | disain, sõjandus, meri | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Tõhus juhtimine ilma signaalideta | sõjandus, e-sport, disain | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Naabrid arvu, mitte kauguse järgi | õhk, sõjandus | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Parveintelligentsus | disain, e-sport, sõjandus | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Karjamine ja infokaskaadid | e-sport, disain, sõjandus | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Sotsiaalne laiskus | e-sport, disain, sõjandus | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Vastutuse hajumine | e-sport, sõjandus | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Esmane grupi ühtekuuluvus | sõjandus, e-sport | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Murdepunktid ja kaotuste piirid | sõjandus | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Mahasurumine: mida tuli teeb peale tapmise | sõjandus, linn | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Hirm ja stress lahingu otsustes | sõjandus, e-sport | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Kägistumine surve all | e-sport | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Väljavaadete teooria ja kaotusekartus | e-sport, disain | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Tasakaalupunkt ja kasumimõju | e-sport | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Tilt (kaotusest tingitud ärritus) | e-sport | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Kulunud kulu | e-sport, sõjandus | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | Kuum käsi ja selle eksitus | e-sport | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Segastrateegiad: ettearvamatuks olemine | e-sport, disain, sõjandus | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Jagatud mõttemudelid | e-sport, sõjandus | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Meeskonnatöö komponendid | e-sport, sõjandus | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Virtuaalmaailmad käitumislaboritena | disain, e-sport | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Isiklik ruum ja territoorium | disain, linn | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Suhtlusvõrgustikud: keskused ja nõrgad sidemed | e-sport, disain | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Meetodid (37) {#methods-37}

| id | pealkiri | mustrid | allikad |
|---|---|---|---|
| `method.lanchester-fit` | Lanchesteri kordajate sobitamine kokkupuute andmetele | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Vahetussuhe poole ja koha järgi | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Kohalik jõuvahekord igal surmal | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Nähtavusväli: sirgjoonelised tulevälja | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Konkreetne energia surmade ja kaotuste hetkel (õhk) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Kuumade kohtade püsivus mängude vahel | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Vahetuse määr (vastastikune toetus) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Kokkupuuted ja esimese surma eelis | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Surmade ruumiline autokorrelatsioon (Moran's I) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Määrad kaardi enda lähtetaseme suhtes koos FDR kontrolliga | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Lahinguvälja luureettevalmistus (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Paarikaupa võrdlevad reitingumudelid (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Võidutõenäosus ja tegevuse hindamine | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Ruumikontroll ja väljakukontroll | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Salvo võrrand kokkupuutes olevatele laevadele | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Lahinguefektiivsuse suhe üksuse tunni kohta tegevuses | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Avastamise ja kokkupuute vahemaad | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Tapaahela ajastus | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Hajutatus versus tapmise osa (jõu ajaline koondamine) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Kaotuse määr ja tapmised väljalennu kohta | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Vooru võidutõenäosuse mudel | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Tegevuse väärtus: lisatud võidutõenäosus | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Kohandatud plus-miinus ridge-regressiooniga (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Kokkutõmbumine: empiiriline Bayes | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Oodatavad tulemused: oodatavatest väravatest oodatavate duellideni | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Ettevalmistuste, rotatsioonide ja varitsuste mõõtmine | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Peegeldusprobleem: kopeerimine või ühine põhjus | herding, conformity | Manski 1993 |
| `method.streak-correction` | Seeriad lõpliku jada korrektsiooniga | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Polarisatsiooni ja tiirlemise korrastusparameetrid | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Juhid ajaliselt nihutatud suuna korrelatsioonist | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Marsruudikaskaadi test karjamise kohta | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Radade eraldamine ja rajapüsivus | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Mahajäänud üksuste oht | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Murdekõver | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Reaktsioon sissetulevale tulele | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Risk pärast kaotust või võitu | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Ostuvastavus (Fleissi kappa) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Ajaloolised juhtumid (277) {#historical-cases-277}

| id | juhtum | millal | mastaap | mustrid | allikad |
|---|---|---|---|---|---|
| `case.thermopylae` | Termopülae | 480 eKr | lahing | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamis | 480 eKr | lahing | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Marathon | 490 eKr | lahing | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuktra | 371 eKr | lahing | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331 eKr | lahing | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Trasimene järv | 217 eKr | lahing | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Cannae | 216 eKr | lahing | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Teutoburgi mets | 9 pKr | lahing | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | lahing | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Stirlingi sild | 1297 | lahing | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Agincourt | 1415 | lahing | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen | 1757 | lahing | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlitz | 1805 | lahing | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | lahing | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | lahing | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: Marye'i kõrgendik | 1862 | kokkupuude | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | kokkupuude | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: Picketti rünnak | 1863 | kokkupuude | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | lahing | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke'i Drift | 1879 | kokkupuude | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | kampaania | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | Somme, esimene päev | 1. juuli 1916 | lahing | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | kampaania | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jütland | 1916 | lahing | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939-40 | lahing | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan ja Ardennid | mai 1940 | kampaania | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Arrase'i vastulöök | 21. mai 1940 | kokkupuude | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Inglismaa lahing | juuli-okt 1940 | kampaania | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Atlandi lahing: konvoide operatsioonianalüüs | 1939-45 | kampaania | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | juuni 1942 | lahing | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Teine El Alamein | okt-nov 1942 | lahing | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Kasserine'i kuristik | veebr 1943 | lahing | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Stalingrad | aug 1942-veebr 1943 | kampaania | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kursk | juuli 1943 | kampaania | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prohhorovka | 12. juuli 1943 | kokkupuude | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13. juuni 1944 | kokkupuude | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Normandia hekkide-maastik | juuni-juuli 1944 | kampaania | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Operatsioon Cobra | juuli 1944 | kampaania | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Leyte'i laht | okt 1944 | lahing | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | dets 1944 | lahing | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Tsushima | mai 1905 | lahing | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Incheon | sept 1950 | kampaania | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | MiG-alleed | 1950-53 | kampaania | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | lahing | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | nov 1965 | kokkupuude | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operatsioon Bolo | 2. jaan 1967 | kokkupuude | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golan: pisarate org | okt 1973 | lahing | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Siinai: Hiina farm | okt 1973 | lahing | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Bekaa org (operatsioon Mole Cricket 19) | juuni 1982 | lahing | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Falklandi õhusõda | mai-juuni 1982 | kampaania | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Desert Stormi õhukampaania | jaan-veebr 1991 | kampaania | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26. veebr 1991 | kokkupuude | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadišu | okt 1993 | kokkupuude | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Groznõi | dets 1994-veebr 1995 | lahing | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hue | jaan-märts 1968 | lahing | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Kosovo õhukampaania | märts-juuni 1999 | kampaania | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Fallujah (operatsioon Al Fajr) | nov 2004 | lahing | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mosul | 2016-17 | kampaania | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Kadeš | u. 1274 eKr | lahing | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Issos | 333 eKr | lahing | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 eKr | lahing | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Carrhae | 53 eKr | lahing | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Pharsalos | 48 eKr | lahing | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianopol | 378 pKr | lahing | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Jarmuk | 636 pKr | lahing | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manzikert | 1071 | lahing | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hattin | 1187 | lahing | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburn | 1314 | lahing | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Crécy | 1346 | lahing | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Poitiers | 1356 | lahing | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunwald (Tannenberg) | 1410 | lahing | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeld | 1631 | lahing | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blenheim | 1704 | lahing | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Poltava | 1709 | lahing | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rossbach | 1757 | lahing | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | kampaania | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | lahing | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena-Auerstedt | 1806 | lahing | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodino | 1812 | lahing | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Leipzig | 1813 | lahing | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | lahing | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | lahing | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | kampaania | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadowa) | 1866 | lahing | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | lahing | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | lahing | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurman | 1898 | lahing | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | kokkupuude | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Gallipoli | 1915 | kampaania | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | nov 1917 | lahing | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Caporetto | okt-nov 1917 | kampaania | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Saksa kevadoffensiiv (operatsioon Michael) | märts-apr 1918 | kampaania | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | aug 1918 | lahing | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Halhin-Gol (Nomonhan) | aug 1939 | lahing | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | Poola kampaania | sept 1939 | kampaania | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut ja Gembloux | mai 1940 | lahing | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | mai 1940 | kokkupuude | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Dunkirki kaitseperimeeter | mai-juuni 1940 | kampaania | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operatsioon Compass ja Beda Fomm | dets 1940-veebr 1941 | kampaania | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Operatsioon Crusader ja Sidi Rezegh | nov-dets 1941 | kampaania | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | mai-juuni 1942 | lahing | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alam Halfa | aug-sept 1942 | lahing | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno-Brody | juuni 1941 | lahing | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Kiievi ümbersaartamine | sept 1941 | kampaania | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moskva | okt 1941-jaan 1942 | kampaania | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Rževi ja operatsioon Mars | 1942 | kampaania | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Teine Harkov | mai 1942 | lahing | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Kolmas Harkov (Mansteini tagahoop) | veebr-märts 1943 | kampaania | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operatsioon Bagration | juuni-aug 1944 | kampaania | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Korsun-Tšerkassõ kott | jaan-veebr 1944 | lahing | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Kamenets-Podolski kott | märts-apr 1944 | kampaania | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operatsioon Epsom | juuni 1944 | lahing | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operatsioon Goodwood | juuli 1944 | lahing | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operatsioon Totalize | aug 1944 | lahing | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | aug 1944 | lahing | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Falaise'i kott | aug 1944 | kampaania | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden ja Arnhem | sept 1944 | kampaania | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Aachen | okt 1944 | lahing | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Hürtgeni mets | sept 1944-veebr 1945 | kampaania | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | sept 1944 | lahing | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | St. Vith | dets 1944 | lahing | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Elsenborni hari | dets 1944 | lahing | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Seelow'i kõrgendikud | apr 1945 | lahing | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berliin | apr-mai 1945 | lahing | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operatsioon Spring Awakening | märts 1945 | lahing | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | dets 1943 | lahing | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Varssavi ülestõus | aug-okt 1944 | kampaania | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | nov 1943 | lahing | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | sept-nov 1944 | lahing | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | veebr-märts 1945 | lahing | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinawa | apr-juuni 1945 | kampaania | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manila | veebr-märts 1945 | lahing | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Mandžuuria (augustitorm) | aug 1945 | kampaania | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Busani kaitseperimeeter | aug-sept 1950 | kampaania | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Chosini veehoidla | nov-dets 1950 | kampaania | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Imjini jõgi | apr 1951 | lahing | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapjong | apr 1951 | lahing | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | apr ja juuli 1953 | kokkupuude | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | jaan-apr 1968 | lahing | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | nov 1967 | lahing | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburgeri mägi (Ap Bia Mountain) | mai 1969 | kokkupuude | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila-Um Katef | juuni 1967 | lahing | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailia | okt 1973 | lahing | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | juuni 1982 | kokkupuude | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Beiruti piiramine | juuni-aug 1982 | kampaania | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Liibanon 2006: Bint Jbeil ja tankitõrje oht | juuli-aug 2006 | kampaania | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Faw | veebr 1986 | lahing | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basra (Karbala-5) | jaan-veebr 1987 | lahing | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Khafji | jaan-veebr 1991 | lahing | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Objective Norfolk | 26.-27. veebr 1991 | lahing | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medina Ridge | 27. veebr 1991 | lahing | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Wadi al-Batini eksitused | veebr 1991 | kampaania | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nasiriyah | märts 2003 | lahing | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Objective Peach | apr 2003 | kokkupuude | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Thunder Runs | apr 2003 | lahing | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Debecka kuristik | apr 2003 | kokkupuude | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramadi | 2006-07 | kampaania | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadr City | märts-mai 2008 | lahing | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Operatsioon Anaconda | märts 2002 | lahing | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | juuli 2008 | kokkupuude | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | okt 2009 | kokkupuude | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala ja vahipunkti majad | 2006-07 | kampaania | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Alžiiri lahing | 1956-57 | kampaania | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Rhodesia tulejõud (Fireforce) | 1974-79 | kampaania | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Sarajevo piiramine | 1992-96 | kampaania | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Groznõi 1999-2000 | dets 1999-veebr 2000 | lahing | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Vene-Gruusia sõda | aug 2008 | kampaania | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillja | juuli 2014 | kokkupuude | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovaisk | aug 2014 | lahing | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debaltsevo | jaan-veebr 2015 | lahing | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Doneck lennujaam | sept 2014-jaan 2015 | lahing | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Hostomeli lennujaam | veebr 2022 | kokkupuude | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | Kiievi telg ja Brovary varitsus | märts 2022 | kokkupuude | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Mariupol ja Azovstal | veebr-mai 2022 | lahing | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Harkivi vastupealetung | sept 2022 | kampaania | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Siverski Doneci ületamine Bilohorivkas | mai 2022 | kokkupuude | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bahmut | aug 2022-mai 2023 | lahing | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Zaporižžja pealetung | juuni-nov 2023 | kampaania | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Mägi-Karabahhi sõda | sept-nov 2020 | kampaania | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Blitz | sept 1940-mai 1941 | kampaania | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: esimene päev õhus | 22. juuni 1941 | lahing | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Kreeta | mai 1941 | lahing | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Malta piiramine | 1940-1942 | kampaania | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Stalingradi õhusild | nov 1942-veebr 1943 | kampaania | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Õhulahingud Kubani kohal | apr-juuni 1943 | kampaania | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kursk õhus | juuli 1943 | lahing | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operatsioon Bagration õhus | juuni-aug 1944 | kampaania | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploiești (operatsioon Tidal Wave) | 1. aug 1943 | kokkupuude | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Tammide rünnak (operatsioon Chastise) | 16.-17. mai 1943 | kokkupuude | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hamburg (operatsioon Gomorrah) | juuli-aug 1943 | lahing | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt-Regensburg | 17. aug 1943 | lahing | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Teine Schweinfurt ("Mustne neljapäev") | 14. okt 1943 | kokkupuude | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Suur nädal (operatsioon Argument) | veebr 1944 | kampaania | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Nürnbergi rünnak | 30.-31. märts 1944 | kokkupuude | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operatsioon Bodenplatte | 1. jaan 1945 | lahing | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Bismarcki mere lahing | märts 1943 | lahing | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Rabauli neutraliseerimine | 1943-1944 | kampaania | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Filipiinide meri ("Marianas Turkey Shoot") | juuni 1944 | lahing | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Musta teisipäev Namsi kohal | 23. okt 1951 | kokkupuude | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operatsioon Rolling Thunder | 1965-1968 | kampaania | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Thanh Hoa sild | 1965-1972 | kokkupuude | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | Wild Weaselid | 1965-1973 | kampaania | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Ault'i aruanne ja Top Gun | 1968-1972 | kampaania | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operatsioon Linebacker | mai-okt 1972 | kampaania | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II ("üheteistpäevane sõda") | dets 1972 | kampaania | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operatsioon Focus (Moked) | 5. juuni 1967 | lahing | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Ammendamissõda: raketivöönd | 1969-1970 | kampaania | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | SAM-vihmavari kanali kohal | okt 1973 | lahing | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (operatsioon Opera) | 7. juuni 1981 | kokkupuude | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operatsioon El Dorado Canyon | 15. apr 1986 | kokkupuude | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Iraani-Iraagi õhusõda | 1980-1988 | kampaania | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Black Bucki rünnakud | mai-juuni 1982 | kokkupuude | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: Pärsia lahe õhukampaania planeerimine | aug 1990-jaan 1991 | kampaania | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: esimene Apache'i löök | 17. jaan 1991 | kokkupuude | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | Suur Scud-jaht | jaan-veebr 1991 | kampaania | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Mutla kuristik ("Surmatee") | 26.-27. veebr 1991 | kokkupuude | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operatsioon Anaconda: Apache'id Shahi-Kotis | märts 2002 | lahing | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | Karbala Apache'i rünnak | 24. märts 2003 | kokkupuude | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | Liibüa õhukampaania | märts-okt 2011 | kampaania | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Mägi-Karabah: droonid ja õhutõrje | sept-nov 2020 | kampaania | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ukraina: vaidlustatud õhuruum | 2022 | kampaania | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Hostomeli lennujaam | veebr 2022 | kokkupuude | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | veebr-märts 1971 | kampaania | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operatsioon Eagle Claw | apr 1980 | kokkupuude | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afganistan: Stinger | 1986-1989 | kampaania | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | lahing | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | Hispaania Armada | 1588 | kampaania | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Quiberoni laht | 1759 | lahing | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | Chesapeake (Virginia Capes) | 1781 | lahing | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Niilus (Aboukiri laht) | 1798 | lahing | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Kopenhaagen | 1801 | lahing | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | märts 1862 | kokkupuude | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lissa | 1866 | lahing | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Yalu | 1894 | lahing | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Manila laht | 1898 | lahing | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Helgolandi laht | aug 1914 | lahing | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel ja Falklandid | nov-dets 1914 | kampaania | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Doggeri pank | jaan 1915 | lahing | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | Río de la Plata | dets 1939 | lahing | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Taranto | nov 1940 | kokkupuude | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Matapani neem | märts 1941 | lahing | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Taani väin ja Bismarcki uppumine | mai 1941 | kampaania | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7. dets 1941 | kokkupuude | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales ja Repulse | 10. dets 1941 | kokkupuude | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Jaava meri | veebr 1942 | lahing | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Korallide meri | mai 1942 | lahing | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Savo saar | aug 1942 | lahing | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Idasaared | aug 1942 | lahing | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Cape Esperance | okt 1942 | lahing | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Santa Cruzi saared | okt 1942 | lahing | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Guadalcanali mereline lahing | 12.-15. nov 1942 | lahing | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | nov 1942 | kokkupuude | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | Kanalipõige | veebr 1942 | kokkupuude | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operatsioon Pedestal | aug 1942 | lahing | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Must mai | mai 1943 | kampaania | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Põhjaneem | dets 1943 | lahing | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | USA allveelaevade kampaania Jaapani vastu | 1941-1945 | kampaania | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Samari lähedal | 25. okt 1944 | lahing | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Surigao väin | 25. okt 1944 | lahing | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinawa: kamikaze-kampaania | apr-juuni 1945 | kampaania | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Eilati uppumine | okt 1967 | kokkupuude | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakia | okt 1973 | lahing | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | Generaal Belgrano uppumine | 2. mai 1982 | kokkupuude | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | HMS Sheffieldi kadu | 4. mai 1982 | kokkupuude | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17. mai 1987 | kokkupuude | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operatsioon Praying Mantis | 18. apr 1988 | lahing | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | aug 2004 | kokkupuude | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Bisu revolutsioon | märts 2007 | lahing | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | Dream Coil rahvusvahelisel 2013. aasta turniiril | aug 2013 | kokkupuude | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Fakeri Zed Ryu vastu | sept 2013 | kokkupuude | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Üleviigu tõuge | nov 2014 | kokkupuude | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | Hüppav AWP Mirage'il | apr 2016 | kokkupuude | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis ja utility-ajastu | 2018 | kampaania | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five vs OG | apr 2019 | lahing | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar jõuab grandmasteriks | 2019 | kampaania | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Vasak käpp (Desert Storm maaväe pealetung) | 24.-28. veebr 1991 | kampaania | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | Corrupted Blood'i juhtum | sept 2005 | kampaania | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Mängu- ja tasemedisain (17) {#game-and-level-design-17}

| id | pealkiri | mustrid | allikad |
|---|---|---|---|
| `design.chokepoint` | Ületuskohad tasemedisainis | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Külgmised teed ja alternatiivsed rajad | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Nägemisjooned ja kokkupuute kaugus | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Kattepaigutus ja rütm | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Tekkekohtade disain ja kaitse tekkekohas | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Sümmeetriliste ja asümmeetriliste kaartide tasakaal | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Klasside tasakaal ja vastandid | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Voog, silmused ja loetavad paigutused | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Mängude majandus ja tagasisideahelad | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Mängijate kokkupanek ja oskuste hajuvus | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | AI vastased kui taseme sondid | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Tähenduslik mäng ja valik | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Vahetused ja meeskonnamäng laskurmängudes | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Kaardi kontroll | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Soojuskaardid ja ruumiline telemeetria disainis | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Meisterlikkus, õppimine ja lõbu | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Vooruekonomikad ja ostuotsused | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Uuringud (113) {#studies-113}

| id | pealkiri | allikad |
|---|---|---|
| `study.engel-1954` | Engel: Lanchesteri ruudu seadus Iwo Jimas | Engel 1954 |
| `study.bracken-1995` | Bracken: Lanchesteri mudelid Ardennidel | Bracken 1995 |
| `study.fricker-1998` | Fricker: Ardennide ammendamismudelid uuesti vaadatud | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas ja Turkes: Kursk ja Ardennid | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley ja Helmbold: ruudu seaduse valideerimine | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | GIS-analüüs mängijate surmade kohta | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: võistleva käitumise visualiseerimine | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Tegevuste väärtustamine Counter-Strike'is | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Kokkupuudete tuvastamine e-spordis | Schubert et al. 2016 |
| `study.red-baron` | Project Red Baron: õhulahing Vietnami kohal | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: ajalooliste lahingute kvantifitseeritud hinnang | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: jõu kasutamine selgitab tulemusi | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Ülevaade mänguandmete visualiseerimisest | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Lanchester kolme sajandi maalahingute vastu | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: kuuskümmend Teise maailmasõja kokkupuudet | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: lahingumudelid ja USA kodusõda | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: statistiline mudel ammendamise andmetele | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: edasiliikumise kiirused maalahingus | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas ja Dinges: asjaolud on olulisemad kui seadus | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | Kursi andmebaas | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | Ardennide kampaania andmebaas | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson ja MacKay: Inglismaa lahing Lanchesteri andmetena | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte ja Schmidt: arvud võidavad endiselt lahinguid | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: lahinguhukkumiste korrapärasused | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Dupuy taktiline arvuline deterministlik mudel | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: sõda arvudes | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: võitlusjõud | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter ja Stam: demokraatiad sõjas | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: adaptiivne dünaamiline mudel | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester ja sissisõda | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: stohhastiline salvomudel | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: laevastiku taktika nurgakivid | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | 3:1 reegli arutelu | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: relvastatud konfliktide modelleerimine | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Ault'i aruanne: raketid, mis tulistati väljaspool oma ulatust | Ault 1969; Michel 1997 |
| `study.gwaps` | Pärsia lahe õhujõudude uuring (Gulf War Air Power Survey) | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Blackett'i tsirkus | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Sügavuslaengu seaded rannikukomandos | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Valged alumised küljed allveelaevavastastele lennukitele | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: soomusta seal, kus tagasipöördunud pommitajaid ei tabatud | Mangel & Samaniego 1984 |
| `study.optimal-search` | Optimaalne otsing: allveelaevadest AF447-ni | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: lahing põrgus | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Ligipääsu takistamine ja alade keelamine | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Kuidas mängijad huvi kaotavad | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Mängijakäitumise klasterdamine looduses | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Mängija frustratsiooni tuvastamine | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: telemeetriapaneelid tootmises | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: mängu visuaalne analüütika | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Avatari liikumine World of Warcrafti lahingväljadel | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: kasutajatestide instrumenteerimine suures mahus | Kim et al. 2008 |
| `study.game-data-science` | Mängude andmeteadus | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Tehisintellekt ja mängud | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Oskus ja meeskonna liikumine Dota 2-s | Drachen et al. 2014 |
| `study.yang-2014` | Lahingumustrid, mis ennustavad MOBA-võite | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Mängijarollid Dota 2-s | Eggert et al. 2015 |
| `study.semenov-2017` | Dota 2 tulemuste ennustamine draftidest | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Elavad võidu ennustused professionaalses e-spordis | Hodge et al. 2021 |
| `study.rioult-2014` | Mängijate asukohtade topoloogia | Rioult et al. 2014 |
| `study.bednarek-2017` | Mängijate hindamine meeskonnalaskurites | Bednárek et al. 2017 |
| `study.katona-2019` | Kes sureb järgmisena: ennustamine | Katona et al. 2019 |
| `study.block-2018` | Andmepõhised lood e-spordi publikule | Block et al. 2018 |
| `study.ggviz` | ggViz: mängu seisundite otsing suures mahus | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: suuremahuline tugevdusõpe Dota 2-s | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: grandmasteri tase StarCraft II-s | Vinyals et al. 2019 |
| `study.cervone-2016` | Oodatav valduse väärtus korvpallis | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: palli käes olevate tegevuste väärtustamine jalgpallis | Decroos et al. 2019 |
| `study.pitch-control` | Väljakukontroll ja ruumi loomine | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | Kaitseoskuse ruumiline struktuur | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Meeskonnarollid jälgimisandmetest | Lucey et al. 2013 |
| `study.shot-quality` | Oodatavad väravad ja lögi kvaliteet | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: ruumiline tabamise tõhusus | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Meeskonnaspordi ajaruumiline analüüs | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Ripley K: klasterdumine igal skaalal | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark ja Evans: lähima naabri hajutatus | Clark & Evans 1954 |
| `study.getis-ord` | Getis-Ordi kuumad kohad | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Kohalikud ruumilise seose näitajad | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | Ruumiline skaneerimisstatistika | Kulldorff 1997 |
| `study.kde` | Tuumikhinnang tihedusele | Silverman 1986 |
| `study.knox-1964` | Ruumi-aja interaktsioon | Knox 1964; Diggle 2013 |
| `study.maup` | Muudetava pindalaühiku probleem | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Isovistid ja nähtavusgraafid | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Ruumisüntaks | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Keskmine hõivatus (mean crowding) | Lloyd 1967 |
| `study.survival-analysis` | Elulemisanalüüs surmani kulunud aja kohta | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Üldistatud lineaarsed mudelid loendusandmetele | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap ja usaldusvahemikud | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey jt: viide ja nähtavale liikuja eelis | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee ja Chang: nurga taga tulistamine | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: viide ja mängija tegevused | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos jt: professionaalid ja amatöörid võidutõenäosuse kaudu | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos jt: majanduslikud otsused Counter-Strike'is | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: targad surmad ja väärtusetud kaotused | Maymin 2021 |
| `study.moba-live-prediction` | MOBA elava tulemuse ennustamine | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa jt: Valorant'i vooru taktilistest tunnustest | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv jt: rollid professionaalses Counter-Strike 2-s | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim jt: lähivõitluse treenimine | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Rahvahulga turbulents 2006. aasta hadžis | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Kõndivad grupid kujundavad rahvahulki | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Hierarhiline grupidünaamika tuvastelgede parvedes | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Sotsiaalne mõju muudab edu ebavõrdseks ja ettearvamatuks | Salganik et al. 2006 |
| `study.wisdom-undermined` | Sotsiaalne mõju õõnestab rahvahulkade tarkust | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | Rahvahulga tõmbejõud | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Kohanemine ühehäälse enamusega | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: lahingumotivatsioon Iraagis | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Ühtekuuluvus ja sooritus: metaanalüüsid | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Kaotushirm professionaalsete golfarite seas | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Kuum käsi pesapallis | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Penaltid: professionaalid mängivad minimaxi | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Minimaxi mäng Wimbledonis | Walker & Wooders 2001 |
| `study.collective-intelligence` | Meeskondade kollektiivne intelligentsus | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Veebimaailma sotsiaalvõrgustikud | Szell et al. 2010 |
| `study.team-networks` | Edasiandmise võrgustikud ja meeskonna sooritus | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Käitumine levib klasterdatud võrgustikes | Centola 2010 |

### Bibliograafia {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Ammianus Marcellinus (trans. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(kontrollitud 2026-11-15: olemasolu)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(kontrollitud 2026-11-15: olemasolu)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(kontrollitud 2026-11-15: olemasolu)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(kontrollitud 2026-11-15: olemasolu)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(kontrollitud 2026-11-15: olemasolu)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Caesar, G. J. (trans. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(kontrollitud 2026-11-15: olemasolu)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(kontrollitud 2026-11-15: olemasolu)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(kontrollitud 2026-11-15: olemasolu)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(kontrollitud 2026-11-15: olemasolu)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Delbrück, H. (trans. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(kontrollitud 2026-11-15: olemasolu)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(kontrollitud 2026-11-15: olemasolu)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(kontrollitud 2026-11-15: olemasolu)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(kontrollitud 2026-11-15: üksikasjalikult)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(kontrollitud 2026-11-15: olemasolu)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(kontrollitud 2026-11-15: üksikasjalikult)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(kontrollitud 2026-11-15: üksikasjalikult)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(kontrollitud 2026-11-15: üksikasjalikult)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(kontrollitud 2026-11-15: olemasolu)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Isserson, G. S. (trans. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(kontrollitud 2026-11-15: olemasolu)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(kontrollitud 2026-11-15: üksikasjalikult)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(kontrollitud 2026-11-15: olemasolu)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(kontrollitud 2026-11-15: olemasolu)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Livy (trans. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(kontrollitud 2026-11-15: olemasolu)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(kontrollitud 2026-11-15: üksikasjalikult)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(kontrollitud 2026-11-15: olemasolu)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Mao Tse-tung (trans. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(kontrollitud 2026-11-15: olemasolu)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(kontrollitud 2026-11-15: üksikasjalikult)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(kontrollitud 2026-11-15: üksikasjalikult)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(kontrollitud 2026-11-15: üksikasjalikult)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(kontrollitud 2026-11-15: olemasolu)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(kontrollitud 2026-11-15: olemasolu)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(kontrollitud 2026-11-15: olemasolu)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(kontrollitud 2026-11-15: olemasolu)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(kontrollitud 2026-11-15: olemasolu)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(kontrollitud 2026-11-15: olemasolu)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(kontrollitud 2026-11-15: olemasolu)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(kontrollitud 2026-11-15: üksikasjalikult)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(kontrollitud 2026-11-15: üksikasjalikult)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Plutarch (trans. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(kontrollitud 2026-11-15: üksikasjalikult)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(kontrollitud 2026-11-15: olemasolu)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(kontrollitud 2026-11-15: olemasolu)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(kontrollitud 2026-11-15: olemasolu)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(kontrollitud 2026-11-15: olemasolu)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(kontrollitud 2026-11-15: olemasolu)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(kontrollitud 2026-11-15: olemasolu)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(kontrollitud 2026-11-15: olemasolu)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(kontrollitud 2026-11-15: olemasolu)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(kontrollitud 2026-11-15: üksikasjalikult)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(kontrollitud 2026-11-15: olemasolu)*
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(kontrollitud 2026-11-15: üksikasjalikult)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Triandafillov, V. K. (trans. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(kontrollitud 2026-11-15: olemasolu)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(avalik domeen)* *(kontrollitud 2026-11-15: olemasolu)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(kontrollitud 2026-11-15: üksikasjalikult)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(kontrollitud 2026-11-15: olemasolu)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(kontrollitud 2026-11-15: olemasolu)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(kontrollitud 2026-11-15: olemasolu)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(kontrollitud 2026-11-15: olemasolu)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(kontrollitud 2026-11-15: olemasolu)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(avalik domeen)* *(kontrollitud 2026-11-15: üksikasjalikult)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(kontrollitud 2026-11-15: olemasolu)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(kontrollitud 2026-11-15: olemasolu)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(kontrollitud 2026-11-15: olemasolu)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(kontrollitud 2026-11-15: üksikasjalikult)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(kontrollitud 2026-11-15: üksikasjalikult)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(kontrollitud 2026-11-15: üksikasjalikult)*

<!-- kb:end -->
