---
title: "Kappakstursgreining: aðferðin"
parent: "Kappakstursgreining"
nav_order: 58
lang: "is"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Kappakstursgreining: aðferðin

Í stuttu máli:

- Hringir eru bornir saman **eftir vegalengd**, ekki eftir tíma, svo að sami staður á brautinni samsvari sér.
- Hver beygja er metin **í heild**, frá einu bremsusvæði að því næsta.
- Tapaði tíminn er **skiptur** eftir því hvar hann tapaðist (bremsun, innkeyrsla, útkeyrsla, beinn kafli) og hversu stóran hluta hans bíllinn skýrir.
- Orsökin er **útskýrð með orðum**, ásamt ráðleggingum.
- Til að nota aðferðina, ekki til að lesa um hvernig hún virkar: sjá [Kappakstursgreining](race-analysis.md).

Þetta er aðferðin á bak við flipann **Kappakstursgreining**: hvað hann mælir, hvernig hann ákveður hvar tíminn tapaðist og hvernig hann breytir því í ráðleggingar. Þetta er lýsingin sem greiningarkóðinn (`src/race/`) fylgir, þannig að sérhver regla hér á sér hliðstæðu þar og próf sem staðfestir hana.

## Hvað fagverkfærin gera {#what-the-professional-tools-do}

Viðurkennd verkfæri eru sammála um sama kjarna. Þau eru helst ólík í því hversu langt þau fara í átt að *orsökum*:

- **Allt er borið saman eftir vegalengd, ekki tíma.** Tveir hringir eru settir á einn vegalengdarás. Hlaupandi munurinn á liðnum tíma við sömu vegalengd er *deltan* (MoTeC kallar hana time variance, aðrir time slip eða delta trace). Hallinn segir til um hvar tími tapast núna: lítill halli er hröðun, loftmótstaða eða stöðugt grip; brattur halli er munur í bremsun eða inngjöf; bylgja upp og niður er skipti á milli innkomuhraða og útkomuhraða.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [section time analysis](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Sérhver beygja er skipt í fasa**: bremsun, innkeyrsla, miðja, útkeyrsla. Bremsupunktur, hámarksbremsun og slökun, lægsti hraði og hvar hann næst, gír, inngjafarupptaka, aftur full inngjöf, útkeyrsluhraði.
  ([Driver61: six phases](https://driver61.com/uni/corner-phases/),
  [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Smáhlutar í hverri beygju, og fræðilegur besti hringur** settur saman úr þeim hraðasta af hverjum. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Ekna línan er líka borin saman**, en aldrei ein og sér: „lína á mynd þýðir ekkert fyrr en þú þekkir þá þætti sem hafa áhrif“. Hún er lesin með hraðaferlinum og deltunni.
  ([Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Rótin, ekki einkennið.** Er tapið á beina kaflanum í raun inngjöfinni, eða neyddi slæm innkeyrsla til seinnar inngjafar? Mistök eru röðuð eftir kostnaði í hringtíma og útskýrð á einföldu máli.
  ([Track Titan coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Hvað fór úrskeiðis í fyrstu útgáfunni, og af hverju það skiptir máli {#what-went-wrong-in-the-first-version-and-why-it-matters}

Fyrsta útgáfan reiknaði hvern *fasa* fyrir sig og horfði aðeins á töp. Hringur sem bremsaði fyrr tapaði tíma í bremsufasanum og var sagt að bremsa seinna, jafnvel þótt fyrri bremsunin hafi snúið bílnum fyrr, fært hann fyrr á afl og komið honum hraðar út úr beygjunni, og hann hafi unnið allt til baka á beina kaflanum. Í einni prófun var hringnum sem gerði þetta sagt að „bremsa miklu seinna“, þótt hinn hringurinn, sem bremsaði seinna, hafi misst af apex, farið út á breiddina og tapað nákvæmlega því sem hann hafði unnið. Tímagögnin sögðu að leiðirnar tvær væru jafnar; ráðleggingarnar sögðu hið gagnstæða.

Lagfæringin er reglan sem allar heimildirnar hér að ofan eru sammála um: **beygja er metin í heild**, frá bremsusvæðinu fyrir hana að bremsusvæðinu fyrir þá næstu, því að „stundum getur það bætt heildarhringtímann að fórna nokkrum millisekúndum í beygju til að fá hraðari kafla á eftir“
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Kappakstursþekking sem reglurnar byggja á {#racing-knowledge-the-rules-encode}

**Útkomuhraði skiptir meira máli en innkomuhraði**, og meira eftir því sem beini kaflinn á eftir er lengri: „tíminn á beinum köflum ræður meiru en tíminn í beygjum“, og hraðatap við útkomu fer með yfir á næsta bremsupunkt. Oft er fljótlegast í gegnum beygju og beinan kafla að taka beygjuna hægar svo að inngjöfin komi fyrr: *hægt inn, hratt út*.
([Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/))
Ferðaáætlun sem lágmarkar tímann og fær líka verðlaun fyrir útkomuhraða færir apexana seinna og fær *hraðari* hring. Verðlaunin sem jafna þetta tvennt eru `L / v²` á hverja einingu útkomuhraða fyrir beinan kafla með lengd `L` á hraða `v`. Tíminn sem hraðamunur kostar á beinum kafla vex með lengd hans og minnkar með öðru veldi hraðans
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Beygjur eftir því hvert þær leiða.** Beygja sem leiðir inn á beinan kafla: hámarka útkomuhraða, seinn apex, aftur á afl sem fyrst. Beygja í enda beins kafla: hámarka hraðann sem er tekinn inn í hana, bremsa sem seinast, fyrri apex er ásættanlegur. Beygja á milli beygja: málamiðlun í þágu þeirrar sem skiptir máli á eftir. Beygja sem gæti verið hvort sem er er meðhöndluð eins og beygja inn á beinan kafla. Hraðari beygjur vega þyngra: á miklum hraða hraðar bíllinn sér hægt og tapaður km/h næst ekki aftur.
([Allen Berg: three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/),
[Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

**Núningshringurinn.** Dekk hefur eitt grip-kvóta sem er eytt í bremsun, beygju og hröðun í hvaða blöndu sem er. Heildarhröðunin er `sqrt(lat² + long²)`. Slóðabremsun fylgir jaðri hans: bremsan er slökuð þegar stýrið og hliðarálagið byggist upp.
([friction circle](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Án pedala** (hvorugur pedali niðri) er hægasta leiðin til að missa hraða, og mælanlegur lykilmælikvarði í sjálfu sér.
([Racecar Engineering / OptimumG: coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Rennsli.** Langsum kraftur nær hámarki við rennihlutfall upp á um 10-20%, og fellur síðan. Þar fyrir utan læsist hjólið við bremsun eða spólar undir afli. Forza sýnir rennsli staðlað: 0 er fullt grip, og gildi yfir 1 í tölugildi þýðir að grip hefur tapast.
([longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Undirstýring og yfirstýring.** Ef rennihornið að framan er stærra en að aftan er það undirstýring; ef það er stærra að aftan en framan er það yfirstýring. Án rennihorna: bíllinn snýst minna en stýrið biður um (stýrið umfram Ackermann-hornið `L/R` sem bíll þarf á lágum hraða).
([understeer, overview](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Rúmfræði línunnar {#the-geometry-of-a-line}

Hraðinn sem bíll getur haldið á radíus `R` er `v = sqrt(a R)`, þar sem `a` er hliðarhröðunin sem dekkin gefa (að viðbættu því sem niðurtogið bætir við, og vex með `v²`). Þannig að **hraðinn vex með kvaðratrót radíussins**: lína sem fer um miðjuna á 20% stærri radíus er um 10% hraðari þar.
([maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: cornering](https://www.formula1-dictionary.net/cornering_tech.html))

**Rúmfræðilega línan** er stærsti bogi í gegnum beygju: frá ytri jaðrinum, snerta innri hlutann í apex og aftur út á ytri jaðarinn. Fyrir beygju sem snýst um `θ` á vegi sem er `w` á breidd (að frádregnri breidd bílsins) hefur bogi sem snertir báða ytri jaðrana og snertir innra hornið `R = w / (1 - cos(θ/2))` (að viðbættum eigin radíus innri jaðarsins). Fyrir rétt horn er það um `3,4 w`, fyrir hárnál `w`. Þess vegna skiptir breiddin mestu máli í meðalbeygjum og minnstu í hárnálum.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**Seinn apex** snýr inn seinna og dýpra, á þrengri radíus í upphafi, og opnar radíusinn á útleiðinni: hægari í miðjunni, beinni og fyrr á beinum kafla, flatari fyrr. „Aðeins lægri lágmarkshraði en sterkari hröðunarferill við útkeyrslu“. **Fyrri apex** er öfugt: hraðari inn, og radíus sem þéttist á útleiðinni og heldur inngjöfinni aftur. Það er að mestu mistök, nema við mjög lítið grip, þar sem tapaður hraði inn í beygjuna verður ekki unninn til baka út úr henni.
([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**„V“ og „U“.** U er klassíska kringlótta línan: breiðasti radíusinn, minnsta stýrisbreytingin. V snýr inn fyrr, fer dýpra, snýr bílnum hratt í miðjunni og stillir útkeyrsluna upp fyrir beinni leið út: bremsan er beint (svo hún getur verið seinni), lægsti hraðinn er lægri en hann næst seinna, og full inngjöf kemur mun fyrr.
([Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Feriill á móti vegalengd.** Hraðasta línan er málamiðlun milli stystu leiðarinnar og þeirrar minnst bognu. Á breidd brautar skiptir ferillinn meira máli, og lína með lágmarksferli kemst nálægt lágmarkstímalínunni alls staðar þar sem bíllinn er á mörkum sínum. Hún víkur frá henni þar sem bíllinn gæti hraðað sér.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Beygjur í röð**, tvöfaldur apex eða chicane, eru eitt og sama vandamálið: útkeyrslulínan úr einni er innkeyrslulínan í þá næstu, og þær eru ekinar afturábak frá þeirri sem leiðir inn á beinan kafla.
([Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

## Hvaða lína hentar hvaða bíl {#which-line-suits-which-car}

Það sem ræður er **afl bílsins miðað við grip hans** á hraða þessarar beygju: „skriðþungi er grip á móti afli, hlutfall“.
([Ross Bentley: momentum cars](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum over horsepower](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Bíll, í þessari beygju | Lína | Af hverju |
|---|---|---|
| Hröðun mikil miðað við grip („point and shoot“) | V: bremsa beint og seint, snúa í stuttri þéttri miðju, beint og flatt snemma | tíminn næst með fullri inngjöf, ekki með lágmarkshraðanum |
| Hröðun lítil miðað við grip („momentum“) | breiður U, aðeins seinni apex, halda lágmarkshraðanum uppi | hann getur ekki unnið til baka hraðann sem hann tapar |
| Þar á milli | hægt inn, hratt út: U með seinni apex | klassísk málamiðlun |
| Hraðskreið beygja, og enn frekar með niðurtogi | U, nálægt rúmfræðilegu línunni | hröðunin er lítil á hraða; niðurtogsgripið vex með `v²`, svo hraði um miðjuna borgar sig tvöfalt |
| Mjög lítið grip (blautt, snjór) | fyrri apex | tapaður hraði inn í beygjuna verður ekki unninn til baka út úr henni |
| Afl langt umfram grip | línan skiptir minna máli | spólvörnin, ekki línan, takmarkar útkeyrsluna |

„Því hraðari sem beygjan er, því nær er hún rúmfræðilegu línunni; því hægari, því meira breytir maður henni með seinni apex.“
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: grip](https://driver61.com/uni/grip/))

Drifrásin breytir meira því hvernig línan er ekin en línunni sjálfri: bíll með framdrifi er snúinn á bremsunum (slóðabremsun) og fær afl fyrst þegar hjólið réttir úr sér, annars rennur hann út á breiddina. Öflugur bíll með afturdrifi þarf að vera beinn áður en full inngjöf kemur, annars missir afturendinn grip. Fjórhjóladrif getur tekið afl á meðan bíllinn snýst, svo það tekur inngjöfina fyrr.
([FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Skoðarinn mælir hlutfall afls og grips hjá bílnum í hverri beygju út frá eigin akstri: hröðun með fullri inngjöf á útkeyrsluhraða deilt með hliðargripi á lágmarkshraða. Hann kallar það „point and shoot“ við 0,45 og yfir, og „momentum“ við 0,25 og undir. Bíll sem hefur meira en 15% meira grip á 150-250 km/h en á 55-110 km/h er með niðurtog sem virkar.

## Aðferðin {#the-method}

Tölurnar hér fyrir neðan eru rökstuðningurinn. Þröskuldarnir sem kóðinn notar eru hver á sinni síðu, og þær síður eru viðmiðið ef tala hér er önnur: [Greining beygju fyrir beygju](race-corner-analysis.md), [Atburðir í stýringu bíls](race-control-events.md), [Bílasnið og samanburður](race-car-profiles.md) og [Tölfræði brautar](race-course-statistics.md).

### 1. Einn vegalengdarás {#one-distance-axis}

Hraðasti hringurinn er viðmiðið, nema notandinn velji annan. Ekna leiðin hans er ásinn: sýnum allra hinna hringjanna er varpað á hana, og hvert sýni fær vegalengd eftir viðmiðinu `s` og látlausan hliðarfrávik `d` með formerki. Varpunin leitar aðeins fram á við frá síðustu samsvörun, þannig að hringur sem fer yfir sjálfan sig stökkvi aldrei yfir á ranga hlið brúar. Hringirnir eru síðan endurteknir á eitt rist, á 2 m fresti, fyrir hverja rás. Hver hringur er látinn halda síðustu nokkrum metrunum á þeim hraða sem hann hafði, svo að deltan við ráslínuna sé munurinn á hringtímunum.

### 2. Beygjur, og hlutdeild hverrar beygju í hringnum {#corners-and-each-corners-share-of-the-lap}

Hvernig beygjur, kaflar og samstæður finnast: [Greining beygju fyrir beygju](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Tímareikningur beygju {#the-time-account-of-a-corner}

Nettó, skipting, útkeyrsluhraði og afl bílanna: [Greining beygju fyrir beygju](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Dómurinn og orsökin {#the-verdict-and-the-cause}

Dómsmynstrin og orsakirnar á leiðinni inn og út: [Greining beygju fyrir beygju](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Bíllinn á móti ökumanninum {#the-car-against-the-driver}

Þegar hringirnir eru á mismunandi bílum er tapið sem bíllinn skýrir dregið frá, eftir hlutum:

- **afl**: bílarnir frá sama hraða niður beinan kafla, eins og ofar;
- **grip**: af lægri lágmarkshraða sem er ekki skýrður með þrengri radíus, hlutdeildin `½ ln(grip_other / grip_mine) / ln(v_other / v_mine)`, þegar hringurinn var á mörkum bílsins (90% af því sem hann hefur sýnt á þeim hraða);
- **bremsur**: frá `u` niður í `v` með hraðaminnkun `a1` á móti `a2`, og endar á sama stað, kostar `(1/a1 - 1/a2)(u - v)² / 2u`. Aðeins þegar hringurinn bremsaði nokkurn veginn jafn fast og bíllinn getur yfir svæðið að meðaltali, ekki bara á tindi.

Það sem bíll getur gert kemur úr öllum hlöðnum hringjum hans: hliðargripi, bremsun og hröðun með fullri inngjöf á hvert 5 m/s hraðabil (95., 95. og 90. hundraðshluti). Grip er það sem bíllinn **hélt í hálfa sekúndu**, þ.e. hliðarhröðunin meðaltöluð yfir 0,5 s, en ekki það sem eitt sýni snerti: kantsteinn, rennsli sem réttir sig aftur, bíll sem er náð, allt þetta hleypur upp í eitt augnablik, og bíll sem gerir það oft virðist gripmeiri en hann er. (Prófað gegn skráðum hringjum tveggja ólíkra bíla: mælingin per sýni setti þá nærri hvor öðrum; haldið í hálfa sekúndu aðskildi þá eins og hringtímar þeirra gera.) Bremsun og afl taka hvert sýni sem miðgildi þess og nágranna þess. Loftið, jöfnunin eftir lendingu og hvert högg (kafli 6) þangað til bíllinn hefur jafnað sig eru undanskilin.

**Hvers konar bíll hver er** (`profile.ts`): úr sömu hringjum:

- **grip haldið**: 95. hundraðshluti þessarar hliðarhröðunar yfir hálfa sekúndu;
- **afl** með fullri inngjöf upp í 50 km/h, 50-120, 120-200 og yfir 200, og mesta sem það sýndi;
- **bremsun** frá 60 í 160 km/h;
- **hámarkshraði**: þar sem hann hætti að bæta við sig með fullri inngjöf í eina sekúndu á beinum kafla, ekinn beint, ekki löng beygja tekin flatt, þar sem bíll tapar hraða við hvaða afl sem er. Þar sem enginn kafli var nógu langur segir það sem hann var enn að toga á hraðast hversu langt frá hann var. Engin ágiskun umfram það sem hringirnir sýna: aðlögun á afli móti hraða með viðnámi setti venjulegan götubíl 100 km/h yfir raunverulegan hámarkshraða, því gírun og hraðatakmarkari enda afl bílsins löngu áður en viðnámið gerir það;
- **að missa afturendann**: hversu oft á hring hann rann framhjá 10° skriði (20° á lausu undirlagi) með stýrið snúið gegn beygjunni, tekinn með gagnstæðu stýri, hversu margir af þeim hófust á inngjöf, og við hvaða hlutdeild af gripi hans þeir hófust. Bíll sem er ekinn svolítið til hliðar viljandi er ekki að missa neitt; sá sem þarf að ná aftur er það. Talið eins fyrir alla bíla, svo að hægt sé að bera tvo bíla saman;
- **jafnvægi**, þar sem hringirnir bera rennihorn: framendi á móti afturenda við mörk.

**Bílar bornir saman** setur bílana hlið við hlið: töflu, eina setningu fyrir hvern um hvað bíllinn er miðað við hinn („X hraðar sér betur, en getur ekki snúið jafn hart, þarf lengri vegalengd til að stöðva og missir afturendann auðveldara“), hvern mun sem er skýr (4% grip, 5% afl eða bremsun, 4 km/h í hámarkshraða, afturendi tekinn að minnsta kosti einu sinni á hring oftar og helmingi oftar til viðbótar), og hvernig á að aka hvorum. Með einum bíl segir hún hvernig sá bíll er.

**Í hverri beygju**, þegar hringirnir eru á mismunandi bílum, segir niðurstaðan hvað af henni bílarnir ráða, og hvernig best er að nýta þennan bíl:

- **um miðjuna**: á línu hins bílsins leyfir grip þessa bíls `v_other · √(grip_mine / grip_other)`. Ef hringurinn hélt því er bilið bílnum að þakka, og engin bremsupunktur breytir því. Það er sagt, og beygjan er rakin til bílsins en ekki ökumannsins. Hafi hann haldið minna er afgangurinn til staðar, og sagt er hversu mikill hann er. Síðan hvar tíminn er hægt að vinna í staðinn: á beinum kafla, eða í bíl sem togar meira, eftir apex: bremsa beint, snúa seinna inn, koma honum fyrr í átt að útkeyrslunni. Annars hið breiðasta radíus sem vegurinn leyfir, því stærri radíus er eina leiðin að meiri hraða án meira gripi;
- **afturendi sem sleppti** hér, í bíl sem missir hann auðveldara en hinn: hvað á að gera í þessum bíl. Inngjöfin gefin inn þegar stýrið réttir úr sér, eða bremsan slökuð mjúklega án þess að létta á henni í miðri beygju, eftir því hvernig rennslin byrja;
- **beinn kafli á eftir**: það sem sterkari afl hins bílsins frá sama hraða tók, og hvar þessi bíll kláraði aflið sitt á honum.

- **an earlier braking point** í bíl sem stöðvar minna harkalega.

Hringur sem rann um miðja beygju (framhjá 10° skriði á malbiki) var kominn framhjá gripi sínu, ekki skammt frá því: honum er aldrei sagt að hann hafi átt grip til vara þar. Og þar sem afturendi bílsins hefur sleppt í þessum hring við minni hliðarhröðun en beygjan krafðist, segir „grip til vara“ að finna það í litlum skrefum.

### 6. Stjórn á bílnum: læsingar, spól, rennsli og ýtingar, högg og árekstrar {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Sérhver hringur er líka lesinn með tilliti til þess hvernig bílnum var stjórnað: hvar hjól læstist, hvar drifhjólin spóluðu, hvar afturendinn sleppti, hvar framendinn ýttist út á breiddina, því þetta eru mistökin sem tíminn einn og sér nefnir ekki. Þrjú atriði gera að verkum að þetta gildir yfir leiki og yfirborð.

**Hvar gripið endar er mælt út frá akstri bílsins sjálfs.** Verkfræðingar setja læsingarmörk fyrir hvern bíl við það rennihlutfall sem gaf mest hraðaminnkun (MoTeC-rásirnar í bremsuröð OptimumG nota -0,07 fyrir einn bíl), ekki gildi úr bók, og bókagildin eru hvort sem er ósammála: krafturinn nær hámarki við 5-20% renni á malbiki eftir dekki og gerð, við 6% eða 20-60% á snjó eftir heimild, og engin heimild gefur eitt gildi fyrir möl. Leikir skala rennið enn á annan hátt: rennið í Forza er „staðlað“ þannig að yfir 1 er grip tapað, en bremsur bíls geta skilað sem mestu langt undir eða langt yfir 1, og venjulegir bremsukaflar geta farið yfir 1. Þess vegna er fyrir hvern bíl, yfir alla hlaðna hringi hans, krafturinn sem hann skilaði settur í bil eftir renninu sem hann var á: hraðaminnkun á móti renni hjólanna við beina bremsun, hröðun (sem hlutfall af því sem bíllinn skilar á þeim hraða) á móti renni drifhjólanna, grip í beygju (sem hlutfall af gripi bílsins á þeim hraða) á móti skriðhorni hvers áss. Mörkin eru renni eftir þann besta þar sem krafturinn hefur fallið um 8%. Feill sem fellur aldrei í gögnunum, eins og grip í beygjum og spólvörn í Forza Horizon, hefur engin mörk, og renni eitt og sér merkir ekkert þar. Ef gögnin eru of lítil eru mörkin einn og hálfur sinnum nafnbundinn tindur.

**Undirlagið er þekkt fyrir hvert sýni**, þar sem leikurinn segir til um það: Forza nötrar dekkin á möl, mold og grasi (fá sýni á malbiksbraut, mörg á mold og utanvegabrautum), Trackmania nefnir efnið undir hverju hjóli, og undirlag rallsvæðis finnst eins og kafli 11 segir. Ferlar, akstursvenjur í rennsli og þröskuldar eru aðskildir fyrir malbik og laust undirlag.

**Sérhver atvik er lagt við hinn hringinn yfir sömu metrana.** Á möl, á snjó, í spennuspilakappakstri með miklu rennsli er rennsli það hvernig beygja er ekin: rannsóknir á bestustýringu finna „lágrennslislausnir“ á malbiki og „árásargjarnar, háar rennslislausnir, jafnvel gagnstýringu“ utan vega, gögn úr rallakstri sýna dekk „langt inni á ólínulega svæðinu“, og að læsa hjóli á mjög lausu undirlagi getur jafnvel stöðvað bílinn fyrr. Atvik sem hinn hringurinn gerði líka, 80% af því eða meira, er því hvernig beygjan er ekin, ekki mistök, og atvik sem hann gerði ekki er bilun aðeins ef það kostaði tíma: tímann sem tapaðist frá rétt áður en það varð til 40 m eftir það. Bilun sem skýrir 40% eða meira af tapi beygju verður orsök þeirrar beygju.

Greiningarþröskuldar, prófið á hinum hringnum, högg og árekstrar, og ráðleggingartextarnir: [Atburðir í stýringu bíls](race-control-events.md).

### 6b. Margir hringir: tölfræði brautarinnar {#b-many-laps-the-courses-statistics}

Flokkasamanburður, hvað telst mistök, tölfræðin og mistakakortið: [Tölfræði brautar](race-course-statistics.md).

### 7. Eknu línan {#the-driven-line}

Fyrir hvern hring og beygju, eingöngu út frá staðsetningum: hvar hann byrjaði að snúast (fimmtungur af hans þrengsta ferli), þrengsti radíus hans (yfir ±8 m), meðalradíus yfir fyrri og seinni helming stefnubreytingar hans, og svo framvegis.

- **lögun**: þrengsti á móti meðalradíus undir 0,55 er V, yfir 0,75 er U;
- **apex**: útkeyrsluradíus á móti innkeyrsluradíus yfir 1,25 er seinn, undir 0,8 er fyrri;
- **hraðaapex**: lægsti punktur hans meira en 15 m fyrir miðpunkt beygjunnar er hægt inn, hratt út; meira en 15 m eftir hann er hann enn að hægja á sér fram hjá miðjunni.

Á móti hinum hringnum: hversu langt innar eða utar hann ók við innsnúning, í gegnum þrengsta hlutann og þar sem báðir voru flatir, og hvar hvor um sig snerist inn. Hver niðurstaða endar á línunni sem hentar bíl hringsins í þessari beygju, eftir því hvað beygjan leiðir inn á og mældu hlutfalli afls og grips, niðurtogi og drifrás bílsins, og hvort hringurinn ók hana. Töflan „Beygja fyrir beygju“ telur upp hraðasta hringinn í gegnum hverja beygju ásamt lögun línu hans, og bestu beygjurnar settar saman.

### 8. Tvö kort {#two-maps}

- **Hvar**: brautin lituð eftir `dΔt/ds` á móti viðmiðinu, rautt þar sem tími tapast og grænt þar sem hann vinnst.
- **Af hverju**: hvert tap teiknað þar sem orsökin er, litað eftir hópi orsakarinnar (bremsun, innkeyrsla, útkeyrsla, beinn kafli, bíll), og breiðara fyrir dýrara tap.

### 9. Endurspilun {#replay}

Ein klukka, þrjár leiðir til að breyta henni í eigin tíma hvers hrings: frá línunni, stillt upp (hver hringur nær einum punkti brautarinnar á sama augnabliki, og síðan er sleppt) og hlið við hlið (hver hringur haldinn í vegalengd viðmiðsins).

### 10. Hvernig heimurinn snýr {#which-way-round-the-world-is}

Heimur skoðarans er hægri-handar með Y upp. Leikur með vinstri-handar heim (þar á meðal Forza) kemur speglaður í honum: sérhver beygja til hægri teiknuð sem beygja til vinstri, bæði braut og hringir. Hringirnir segja sjálfir til um það: jákvætt stýri er til hægri í hverjum millistykki, og ytri fjöðrunin í beygju þjappast saman. Þess vegna býður kappakstursflipinn að laga það, og **Myndavél og sena → Snúa heimsás við** gerir það: X, Y eða Z teiknað öfugt. Aðeins teikningin breytist: spegilmynd brotin inn í sýnisfylkið. Myndavélin flýgur í teiknaða heiminum, en gögnin, greiningin og öll hnit sem verkfærin sýna eru áfram leiksins eigin. Greiningin nefnir beygjur til vinstri eða hægri með sömu mælingu.

### 11. Rall: rennslið, vinstri fóturinn, loftið {#rally-the-slide-the-left-foot-the-air}

Rallsvæði er ekki braut ekin á verra gripi. Á möl og snjó er rennslið það hvernig beygja er tekin: bíllinn er snúinn þegar farið er inn með því að færa þyngdina — „bremsur færa þyngd bílsins fram ... framdekkin fá meira grip, afturdekkin tapa gripi, og bíllinn snýst og rennur inn í beygjuna“, síðan aftur á inngjöfina þegar hann er „stilltur í þá átt sem þú vilt fara“ ([DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Vinstri fóturinn sér um bremsun svo hægt sé að spila inngjöf og bremsu hvora á móti annarri, handbremsan snýr bílnum í þröngum beygjum ([RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), og bíllinn yfirgefur jörðina. Kafli 6 les þegar rennsli á móti hinum hringnum; þessar reglur bera rest.

- **Undirlagið.** Það sem hringurinn segir (`meta.surface`, `--surface` í rall-upptökutækjunum), annars nafn viðburðarins: malbiksrallin (Spánn, Króatía, Mið-Evrópa, Þýskaland, Japan, Korsíka, Ypres), vetrarrallin (snjór), malbikskaflar Monte með snjó og ís ofan á (blandað), annars hvernig bíllinn var ekinn. Hliðarmörk Rally2-bíls eru 0,7-0,9 g á möl og 1,3-1,4 g á malbiki ([grenzbereich, reference values](https://github.com/GitCrush/grenzbereich)), og á möl er mun meira rennsli (kafli 6). Þannig að kafli þar sem bíllinn náði 10 m/s² eða meira (95. hundraðshluti, á hraða, á undirlaginu) með miðgildi rennslis undir 6 gráðum hvar sem hann beygði innan 70% af því var malbik; allt annað, eða of lítið til að greina, er laust.
- **Hvað bíllinn getur, á því undirlagi sem hann ók á.** Grip, bremsun og afl (kafli 5) eru mæld á malbiki og lausu undirlagi sitt í hvoru lagi þegar hringirnir óku fimmtung eða meira af sýnum sínum á hvort, og sérhver beygja er metin með undirlagið undir bílnum á hægasta punkti hans. Sýni í loftinu og í 0,3 s eftir lendingu eru undanskilin úr öllu sem mælir bílinn: umslög, dekkjaferlar, læsingar og spól. Lending hristir bílinn umfram það sem dekkin ráða við, og hjól sem snúast í loftinu eru ekki spól. Niðurtog er ekki metið á lausu undirlagi, þar sem hraðir og hægir kaflar brautar eru ólíkir vegir.

- **Smá snerting á vinstri fætinum er ekki bremsun.** Létt snerting á bremsunni með inngjöfina enn í helmingi eða meira, á minna en 15 m, stillir bílinn eða snýr honum; þar sem hringur byrjaði að bremsa fyrir beygju er það fyrsta bremsan sem inngjöfin losnaði undir, eða sú sem entist lengur.
- **Bíllinn snerist á leiðinni inn.** Fyrir hvern hring og beygju, mesta skriðhornið frá bremsunni og 5 m framhjá hans hægasta punkti. Á lausu undirlagi: hringur sem lét bílinn snúast 8 gráðum eða meira minna en hinn (sem snerist honum um 12 eða meira) og fékk aflið eða var flatari seinna **snerist bílnum minna**. Ráðleggingin er að létta á inngjöfinni eða snerta vinstri fótar-bremsuna þegar hann snýst inn, svo að afturendinn komi á eftir, með handbremsupunkti hins hringsins þegar hann notaði einn, eða handbremsunni í beygju hægari en 54 km/h, og hafa hann vísandi í útkeyrsluna áður en apexinn kemur. Sá sem snerist honum 12 gráður eða meira umfram hinn og fékk aflið samt seinna **snerist honum of mikið**: það þurfti að rétta hann áður en aflið gat farið upp. Hvort sem er er orsök beygjunnar á útleiðinni, eftir bilun í stjórn bíls. Línuráðið á lausu undirlagi segir það sama fyrir hverja beygju.
- **Loftið.** Flug 0,2 s eða meira lengra en á hinum hringnum, sem kostaði tíma frá 10 m fyrir flugtak til 40 m eftir lendinguna (eða enda beygjunnar), er orsökin þegar það skýrir 40% eða meira af tapi beygjunnar, og beygjan þar á eftir, sem er náð hægar, segir það. Í loftinu getur bíllinn hvorki snúist, bremsað né ekið. Ráðleggingin heldur inngjöfinni á við flugtak („ekki slaka á inngjöfinni við flugtak“, sem lækkar nefið) og tekur hryggina aðeins hægar eða með snertingu á bremsunni svo að bíllinn haldist lágt ([DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Flokkar með mest þremur beygjum.** Krókóttur kafli sem er ekinn án þess að vera nokkurn tíma flatur er ekki ein löng flokkun: eftir þrjár beygjur byrjar ný.

`src/race/rally.test.ts` heldur greiningunni við allt þetta á köflum sem keyrðir eru með einföldu líkani: bíll sem snýst minna og seint á afli, lengra flug, snertingar á vinstri fæti, krókóttur kafli, malbik á móti möl.

## Gögn, og hvað hver heimild leyfir {#data-and-what-each-source-allows}

| Heimild | Tíðni | Rásir | Leyfir |
|---|---|---|---|
| FH Companion-hringjaskrár | ~5 m | staðsetning, hraði, inngjöf, bremsa, stýri, hlið- og langhröðun, gír | allt nema stjórn bíls, sem þarf mælingarnar við hliðina |
| `.tele.gz` FH Companion, við hlið hverrar hringjaskrár | 64 Hz leiksins (upptökutæki sem heldur hverjum pakka skrifar ~110 á sekúndu; endurtekningarnar eru felldar niður) | allt Data Out frá Forza: renni hvers hjóls, skriðhorn, samsett renni, snúningur, fjöðrun, undirlagsnötrun; hraði í rammanum á bílnum; snúningshraði | allt, þar með talin stjórn bíls |
| Forza Data Out, tekið upp með `heat3d_capture telemetry` | 60 Hz | allt ofangreint, auk fyrir hvert hjól: hitastig dekks, renni, skriðhorn, samsett renni, fjöðrunarslag, hjólhraði, hristirönd; RPM, afl, tog, snúningshraði | allt |
| Assetto Corsa, ACC, AC EVO, AC Rally (sameiginlegt minni, `heat3d_capture telemetry --game ...`) | 60-333 Hz | yfirmengi: kjarnahitastig dekks og innra/miðja/ytra hitastig, þrýstingur, hitastig bremsa, hjólaálag, hallahorn, renni og skriðhorn; hraði í rammanum á bílnum; ABS og TC í notkun (ACC, EVO, AC Rally) | allt |
| iRacing `.ibt`, lesið beint | 60 Hz | staðsetning úr GPS, pedalar, stýri, g, snúningur, hitastig hylsis hvers hjóls, dempaborð, þrýstingur, slit | allt; stjórn bíls út frá rennihorninu (snúningur hans á móti akstursstefnu) og stýrinu, ekkert renni (ekki skráð) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | eftir ramma; 100 Hz | staðsetning, hraði í heimi og ásar bílsins, hraði snertiflatar hvers hjóls og fjöðrun, pedalar, stýri, klukka og lengd kafla | allt; renni og rennihorn reiknuð út |
| Richard Burns Rally (NGP UDP) | eftir eðlisfræðiskref | staðsetning, hraðar bílsins sjálfs, gormaslag og kraftur hvers hjóls, pedalar | allt nema renni hjóla |
| BeamNG.drive (`heat3d`-viðbótin) | allt að 100 Hz | staðsetning, hraði og ásar í heimi, yfirborðshraði, snúningur, álag og snerting við jörð fyrir hvert hjól | allt; renni og rennihorn reiknuð út |
| Trackmania (Openplanet-viðbótin) | eftir ramma | staðsetning, framhraði og hliðarhraði, pedalar (bremsa á/af), stýri, renniþáttur og laust undirlag fyrir hvert hjól, í loftinu | allt; rennihornið út frá hliðarhraðanum |

Sérhver heimild er breytt í eitt hringjasnið, `heat3d-lap`, þar sem rásirnar hafa staðlaðar nöfn (`speed`, `throttle`, `tireTemp[FL]` ...). Bílatáknið og gröfin teikna hvaða rásir sem hringur hefur.

## Heimildir {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections: time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (distance-domain delta)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: session laps](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analysing racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: theoretical best from sectors](https://overcut.gg/)
- [Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: braking analysis, lock-up and stability KPIs (Sep 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: on the throttle (Jan 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: key performance indicators of race drivers (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Tyre-road friction models and optimal slip (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: tyre-pavement friction, slip at peak on snow and ice](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: tyre friction coefficients, peak and sliding](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: longitudinal forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: lateral forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Vehicle stability, body-slip limits (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rally driving at high sideslip (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Minimum-time rally manoeuvres (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC reference yaw rate (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Understeer and oversteer detection by steering against yaw (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: steering angle, Ackermann and the understeer gradient](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: math channels (Kus, combined g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: oversteer and understeer widget](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence braking: locking on very loose surfaces](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: gravel rally data logging](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: rally vehicle dynamics, reference values](https://github.com/GitCrush/grenzbereich)
- [Trackmania speed-drift trainer plugin (constants)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania speedslide write-up](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (exit speed against minimum time)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: the three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/)
- [Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/)
- [Driver61: the six phases of a corner](https://driver61.com/uni/corner-phases/)
- [Driver61: grip](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (excerpt)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: what is a momentum car](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [The momentum over horsepower debate](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Math on the racing line, part 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, part 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: cornering technique](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Global minimum-time trajectory planning considering curvature and distance](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: the coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Friction circle introduction](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Understeer, an overview](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out documentation](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: traction-limited acceleration](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: power-limited acceleration](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO shared memory](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally telemetry reader](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT parsing](https://github.com/teamjorge/ibt)
