---
title: "Bílasnið og samanburður"
parent: "Kappakstursgreining"
nav_order: 56
lang: "is"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Bílasnið og samanburður

Bíll getur bara hemlað, beygt og hraðað svo fast. Skoðarinn mælir hversu fast út frá þínum eigin hringjum, svo að hann segir þér aldrei að gera eitthvað sem bíllinn þinn getur ekki gert. Þetta útskýrir líka hversu stór hluti glataðrar sekúndu var bílnum að kenna en ekki þér.

![Bílar bornir saman: tveir bílar hlið við hlið með grip, bremsun og afl](../assets/img/en/race-cars-compared.webp)

Greiningin segir hring aðeins að hemla fastar, bera meiri hraða eða hraða fyrr þar sem bíllinn hans hefur sýnt að hann getur það, og hún tekur úr tapi það sem bílarnir sjálfir skýra. Þess vegna eru takmörk hvers bíls (*umslag* hans, hér að neðan) og eðli hans (*snið* hans) mæld út frá hverjum hlöðnum hring hans. Þessi síða fjallar um umslagið, sniðið, hlutann **Bílar bornir saman**, og hvað bílarnir ráða í hverri beygju.

**Einn bíll** = hringir með sama bílnúmeri (eða nafni, án númers) og sömu frammistöðuvísitölu: önnur stilling er annar bíll.

## Umslagið: hvað bíllinn getur gert á hverjum hraða {#the-envelope-what-the-car-can-do-at-each-speed}

Fyrir hvern bíl, yfir alla hlaðna hringi hans, í **5 m/s hraðabilum** (24 bil, upp í 120 m/s). Sýni í lofti, stillingin í 0,3 s eftir lendingu, og frá 0,1 s fyrir hvert högg til 1 s eftir það eru skilin eftir, og hröðun upp á 80 m/s² eða meira er hunsuð (fyrir ofan það sem nokkur bíll með niðurkrafti heldur).

| Umslag | Sýni | Gildi í hverju bili | Þarf |
|---|---|---|---|
| **hliðargrip** | hliðarhröðunin **haldin í hálfa sekúndu** (meðaltal absolútgildis hennar yfir miðjaðan 0,5 s glugga), aðeins þar sem bíllinn beygði: að minnsta kosti þriðjungur 99. hundraðshluta alls hennar | 95. hundraðshluti | 6 sýni |
| **bremsun** | bremsun > 0,3; langsum hröðunin sem miðgildi hvers sýnis og tveggja nágranna þess | 95. hundraðshluti hraðaminnkunarinnar | 4 sýni |
| **afl á fullri inngjöf** | inngjöf > 0,95, bremsun undir 0,05; sama miðgildi af þremur | 90. hundraðshluti | 4 sýni |

Af hverju haldið í hálfa sekúndu: kantsteinn, skrið sem snýst til baka, eða bíll sem er gripinn valda allir toppi í hliðarhröðun í augnablik, og bíll sem gerir það oft virtist gripmeiri en hann er. Af hverju miðgildi af þremur: með fimm metra bili er eitt sýni langt í burtu, og stakur toppur í einu sýni er kantsteinn, hola eða veggur.

Lestur umslagsins á hraða interpólerar milli miðja bilanna, og tekur næsta bil með gögnum þar sem bil er tómt.

**Um tvær tegundir undirlags.** Þegar hringir bílsins óku fimmtung eða meira af sýnum sínum á bæði malbiki og lausu undirlagi, er sérstakt umslag geymt fyrir hvort, og hver beygja er metin út frá undirlaginu undir bílnum á hægasta punkti sínum.

**Skipting.** Hraðinn sem aflið fellur frá sem `1/v` (takmarkað af afli) í stað þess að haldast flatt (takmarkað af drifi): fyrsta bilið þar sem `a·v` er innan 15% af hæsta `a·v` sem sást.

## Sniðið: hvers konar bíll þetta er {#the-profile-what-kind-of-car-it-is}

`profile`, úr sömu hringjum (sýni á jörðinni, ekki höggin, hraðar en 8 m/s):

| Mælikvarði | Hvernig |
|---|---|
| **grip haldið** (m/s²) | 95. hundraðshluti haldinnar hliðarhröðunar í hálfa sekúndu |
| **afl** upp í 50 km/klst, 50-120, 120-200, yfir 200 (m/s²) | meðaltal afls umslagsins á fullri inngjöf yfir 3-14, 14-33, 33-56 og 56-90 m/s, á hraða sem bíllinn náði (allt að hans hraðasta + 2 m/s), úr að minnsta kosti þremur 1 m/s þrepum; og mesta sem hann sýndi, og hvar |
| **bremsun** (m/s²) | bremsun umslagsins meðaltalin frá 60 til 160 km/klst (16,7-44,4 m/s), bilið sem samanburðurinn nefnir |
| **hraðast** | mesti hraðinn sem hann náði |
| **náði hámarki við** | þar sem hann hætti að bæta við sig á fullri inngjöf á beinum kafla (hér að neðan) |
| **dregur enn á hraðasta** | afl umslagsins á hans hraðasta hraða: hve langt hann átti enn eftir |
| **afturhlutinn gripinn, á hring** | skipti á hring sem hann rann og þurfti að grípa (hér að neðan) |
| **hlutdeild á inngjöf** | af þeim, hlutdeildin sem byrjaði með inngjöf > 0,5 og enga bremsun |
| **sleppir við** | miðgildi haldinnar hliðarhröðunar 0,15 s áður en hvert skrið hófst, sem hlutdeild af gripinu |
| **yfir 10° rek, í harðri beygju** | af sýnum sem beygja á 60% gripsins eða meira, hlutdeild sem rennur (10° á malbiki, 20° á lausu); þarf 30 sýni |
| **miðgildi reks** | yfir sömu sýni |
| **jafnvægi** | framskriðhorn mínus afturskriðhorn (margfeldi nafnhámarks) þar sem beygt er hart og ekki runnið, meðaltal af að minnsta kosti 30 sýnum: + ýtir út á við |
| **undirlag** | yfir 80% lausra sýna: laust; undir 20%: malbik; annars blandað |

**Að ná hámarki.** Sýni telst með ef sekúnda í kringum það (±0,5 s, að minnsta kosti 0,9 s af gögnum) var öll á fullri inngjöf (> 0,95, engin bremsun), á jörðinni, ekið **beint** (|hliðar| undir því hærra af 4 m/s² og fjórðungi gripsins), með aukningu undir **0,35 m/s²**, hraðar en 25 m/s og innan 90% af hraðasta hring hringsins - full inngjöf upp brekku eða í gegnum langa beygju hættir líka að bæta við sig, langt undir hámarkshraða bílsins. Með að minnsta kosti **einni sekúndu** af slíkri sléttu yfir alla hringi er miðgildi þessara hraða þar sem hann nær hámarki. Annars er enginn hámarkshraði: þar sem enginn beinn kafli var nógu langur segir *dregur enn á hraðasta* hve langt frá honum hann var. Engin ágiskun umfram það sem hringirnir sýna - gírahlutföll og takmarkari enda afl bíls löngu áður en loftmótstaða gerir það.

**Að missa afturhlutann.** Talið þar sem ökumaðurinn þurfti að grípa hann: beygt á 60% gripsins eða meira, runnið (rek yfir 10° á malbiki, 20° á lausu), með stýrinu (yfir 0,06) snúnu **á móti** beygjunni. Hvaða formerki stýrisins samsvarar hvaða formerki beygjukraftsins er mælt á hverjum hring (sýni sem beygja án þess að renna). Skrið er talið einu sinni þar til bíllinn hættir að renna. Bíll sem er ekið svolítið til hliðar viljandi er ekki að missa neitt; sá sem þarf móstýringu er það. Talið eins fyrir alla bíla, svo að hægt sé að bera tvo bíla saman. Þarf stýri og rekhorn.

## Bílar bornir saman {#cars-compared}

Hliðarstikuhlutinn heitir **Bíllinn** með einum bíl, **Bílar bornir saman** með fleiri.

**Taflan**: dálkur fyrir hvern bíl, röð fyrir hvern mælikvarða sem einhver bíll hefur gildi fyrir: Grip haldið; Afl upp í 50 km/klst, 50-120, 120-200, yfir 200; Bremsun; Hraðast; Náði hámarki við („dregur enn“ þar sem hann gerði það aldrei); Dregur enn á hraðasta; Afturhlutinn gripinn, á hring; Yfir 10° rek, í harðri beygju. Þar sem bílarnir eru meira en 3% frá hvor öðrum er betra gildið merkt (hærra fyrir grip, afl, bremsun, hraða; lægra fyrir afturrennsli).

**Einn bíll einn**: setningar um það sem hringirnir sýna að hann er - gripið sem hann heldur (m/s² og g), afl hans í hverju bili, hvar hann hætti að bæta við sig á löngu beinu köflunum (eða að hann náði aldrei hámarki, og hvað hann dró enn á hraðasta), og hversu oft þurfti að grípa afturhlutann ("varla nokkurn tíma" undir einu sinni á hring, "aðallega á inngjöf" þegar 60% eða meira byrjuðu þar).

**Tveir bílar**: fyrir hvert par, ein setning fyrir hvorn um það hvað bíllinn er á móti hinum („X hraðar sér betur, en getur ekki beygt eins hart, þarf lengri vegalengd til að stöðva og missir afturhlutann auðveldar“), taflan, hver skýr munur stærstur fyrst, og síðan **Akstur hvers bíls**. Með fleiri en **3** pörum er eitt par sýnt: bíll hringsins í fókus á móti bíl sem valinn er úr fellilista (sjálfgefið bíll besta hrings flokks hans, annars viðmiðsins, annars fyrsti annar bíll).

Munur er aðeins sagður þegar hringirnir sýna hann greinilega:

| Munur | Sagt út frá | Setning |
|---|---|---|
| grip | **4%** | „X heldur N% meira gripi í beygjunum … það er M% meiri hraði um miðja hverja beygju“ (hraði = √ af gríphlutfallinu) |
| afl | **5%**, í fyrsta bili sem bæði hafa af 120-200, 50-120, yfir 200 km/klst | „X hraðar sér N% harðar frá 120 upp í 200 km/klst“; líka af stað, eða „þó Y komist hraðar af stað“, þegar ræsingin er 8% ólík |
| hámarkshraði | **4 km/klst** | „X nær hærri hámarki: hann hætti að bæta við sig við …“ |
| hámarkshraði, aðeins annar | annar bíllinn náði hámarki, hinn ekki | „Y þraut aflið við …; X var enn að bæta við sig þegar hann hemlaði“ |
| hámarkshraði, hvorugur | hvorugur náði hámarki | hvað hvor var enn að bæta við sig á hraðasta |
| bremsun | **5%** | „X stöðvar N% harðar … Y þarf að hemla fyrr“ |
| missa afturhlutann | að minnsta kosti einu sinni á hring oftar **og** helmingi oftar til viðbótar | „X missir afturhlutann auðveldar: hann rann svo langt að þurfti móstýringu N sinnum á hring á móti M …“ - aðallega á inngjöf (60%+) eða aðallega við beygju inn og á slökun (30% eða minna), frá um P% af gripi sínu; á lausu undirlagi „er hluti af þessu hvernig bíll er beygður; gripið er það ekki“ |
| til hliðar | **12 prósentustig** af harðri beygju yfir rekþröskuldinum | „X rennur meira til hliðar á mörkunum“ |
| framjafnvægi | **0,3** af nafnhámarki | „X ýtir meira að framan … Hann vill vera hægður og beygður áður en komið er að toppnum“ |

Eiginleikarnir í yfirlitinu: *heldur meira gripi* / *getur ekki beygt eins hart*, *hraðar sér betur* / *dregur minna afl*, *nær hærri hámarki* / *nær lægri hámarki*, *dregur enn á hraðasta í lok beinu kaflanna* / *þrýtur aflið*, *stöðvar harðar* / *þarf lengri vegalengd til að stöðva*, *er stöðugri* / *missir afturhlutann auðveldar* (*er miklu meira til hliðar …* þegar tvöfalt oftar plús einn; *þarf að grípa oftar* á lausu undirlagi), *ýtir að framan*. „Lítið til að greina hann frá Y á þessum hringjum“ þegar enginn munur er.

**Akstur hvers bíls:**

- einn bíll hefur meira grip og hinn meira afl: haltu hraða um miðjuna á breiðri, hringlaga línu („U“) í gripbílnum; hemlaðu beint, snúðu honum í stuttri, þéttri miðju og réttu úr útgangi („V“) í þeim sterka;
- einn bíll er undir í báðu: besti hringur hans er sá hreinasti - hemlaðu beint, breiðasti radíusinn, full inngjöf eins snemma og hún heldur;
- bíll sem missir afturhlutann auðveldar: gefðu inngjöf inn aðeins þegar stýrið losnar og skiptu snemma upp (skrið á inngjöfinni), eða slepptu hemlinum varlega og haltu jafnri inngjöf um miðjuna (skrið við innkomu).

Ábendingin undir hlutanum endurtekur hvernig hvert er mælt.

## Það sem bílarnir ráða í beygju {#what-the-cars-decide-in-a-corner}

Þegar hringirnir eru á mismunandi bílum endar hvert niðurstaða um tapaða beygju á **Bílarnir:** - hvað af henni bílarnir ráða, og hvernig hægt er að hámarka af þessum (`carNote`):

- **Um miðjuna**, þegar þessi bíll heldur undir 96% af gripi hins, hinn var yfir 0,5 m/s hraðari á hægasta punkti, og þessi hringur var ekki langt undir því sem grip hans skýrir (yfir 70% af því): á línu hins bílsins leyfir grip þessa bíls `v_annar · √(grip_minn / grip_annar)`. Ef hringurinn náði því (innan 1 m/s) er bilið bíllinn, og enginn bremsunarpunktur breytir því; ef minna, hve mikið er enn eftir að vinna. Þá hvar tíminn má vinnast í staðinn: á beinan kafla, milli tveggja, eða í bíl sem dregur 5% harðar - eftir toppinn (hemlaðu beint, beygðu seinna inn, beindu honum að útganginum snemma); annars breiðasti radíus sem vegurinn leyfir.
- **Afturhluti sem sleppti hér** (óhlutdeilt skrið eða snúningur, eða rek umfram rennuþröskuldinn á leið inn), í bíl sem missir hann að minnsta kosti einu sinni á hring oftar og helmingi oftar til viðbótar: hvað á að gera í þessum bíl - inngjöfin gefin inn þegar stýrið losnar (skrið hans byrja á afli í 60% tilvika eða oftar) eða hemlinn slepptur varlega án slökunar.
- **Beini kaflinn á eftir**: þegar afl bílanna skýrði 0,03 s eða meira, sterkara afl hins bílsins frá sama hraða, með afli beggja bíla frá 120 upp í 200 km/klst.
- **Hámarkshraði**: þegar þessi hringur náði 98% af því þar sem bíll hans nær hámarki á beinum kafla yfir 150 m löngum, og hinn fór 1,5 m/s hraðar: þetta er hámarkshraði bílsins, og sérhver km/klst meira út úr beygjunni hjálpar þar til hann nær honum.
- **Bremsun**: þegar hinn bíllinn hemlar 5% harðar og þessi hringur hemlaði meira en 5 m fyrr, að hluti af fyrri bremsuninni sé bílsins.

Hlutdeild bílsins er líka dregin frá tímanum sjálfum - sjá [hlutdeild bílsins](race-corner-analysis.md#the-cars-share) - og beygja þar sem bíllinn skýrir 60% eða meira er rakin til bílsins.

## Fyrir forritara {#for-developers}

Kóði: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` í [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` í [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
