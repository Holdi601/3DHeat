---
title: "Lenktynių analitika: metodas"
parent: "Lenktynių analizė"
nav_order: 58
lang: "lt"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Lenktynių analitika: metodas

Trumpai:

- Ratai lyginami **pagal atstumą**, ne pagal laiką, todėl ta pati kurso vieta susilygiuoja.
- Kiekvienas posūkis vertinamas **visas**, nuo vienos stabdymo zonos iki kitos.
- Prarastas laikas **suskaidomas** pagal tai, kur jis prarastas (stabdymas, įvažiavimas, išvažiavimas, tiesioji), ir kiek jo paaiškina automobilis.
- Priežastis **paaiškinama žodžiais**, su patarimais.
- Jei norite tik naudotis, o ne skaityti, kaip tai veikia: žr. [Lenktynių analizė](race-analysis.md).

Tai metodas, slypintis už **Lenktynių analizė** skirtuko: ką jis matuoja, kaip nusprendžia, kur dingo laikas, ir kaip tai paverčia patarimais. Tai specifikacija, kurios laikosi analizės kodas (`src/race/`), todėl kiekviena čia nurodyta taisyklė turi atitikmenį ten ir testą, kuris ją patvirtina.

## Ką daro profesionalūs įrankiai {#what-the-professional-tools-do}

Įsitvirtinę įrankiai sutampa pagrindine dalimi ir skiriasi daugiausia tuo, kiek toli eina link *priežasčių*:

- **Viskas lyginama pagal atstumą, ne laiką.** Du ratai perskaičiuojami į vieną atstumo ašį; einamasis laiko skirtumas tuo pačiu atstumu yra *delta* (MoTeC vadina tai laiko variacija, kiti – laiko poslinkiu ar delta kreive). Jo nuolydis parodo, kur laikas dabar prarandamas: lėkštas nuolydis – pagreitis, pasipriešinimas ar nuolatinis sukibimas; stačias – stabdymo ar dujų skirtumas; banga aukštyn ir žemyn – kompromisas tarp įėjimo greičio ir išėjimo. ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/), [sekcijos laiko analizė](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html), [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Kiekvienas posūkis suskaidomas į fazes**: stabdymas, įvažiavimas, vidurys, išvažiavimas – stabdymo taškas, didžiausias stabdymas ir atleidimas, mažiausias greitis ir kur jis įvyksta, pavara, dujų įjungimas, grįžimas į pilnas dujas, išvažiavimo greitis. ([Driver61: šešios fazės](https://driver61.com/uni/corner-phases/), [iRacing rato analizės vadovas](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini sekcijos kiekviename posūkyje ir teorinis geriausias ratas**, surinktas iš greičiausių kiekvienos dalies. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps), [Overcut](https://overcut.gg/))
- **Vairuojama linija taip pat lyginama**, bet niekada atskirai: „linija ant paveikslėlio nieko nereiškia, kol nežinote prisidedančių veiksnių“ – ji skaitoma kartu su greičio kreive ir delta. ([Track Titan: kaip analizuoti telemetriją](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing), [Sim Racing Telemetry: lenktynių linijos](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Priežastis, o ne simptomas.** Ar nuostolis tiesiojoje tikrai dėl dujų, ar blogas įėjimas privertė vėliau įjungti dujas? Klaidos rikiuojamos pagal rato laiko kainą ir paaiškinamos paprasta kalba. ([Track Titan treniravimo srautai](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Ką pirmoje versijoje padarėme negerai ir kodėl tai svarbu {#what-went-wrong-in-the-first-version-and-why-it-matters}

Pirmoji versija apmokestindavo kiekvieną *fazę* atskirai ir žiūrėjo tik į nuostolius. Ratas, kuris stabdė anksčiau, prarasdavo laiko stabdymo fazėje, ir jam būdavo liepiama stabdyti vėliau – net tada, kai tas ankstesnis stabdymas automobilį greičiau pasukdavo, anksčiau įjungdavo galią ir išvažiuodavo greičiau, o tiesiojoje viską susigrąžindavo. Viename bandyme taip elgiasi ratui buvo liepiama „stabdyti daug vėliau“, nors kitas ratas – kuris stabdė vėliau – buvo praleidęs viršūnę, nuvažiavęs plačiai ir prarado tiksliai tiek, kiek buvo laimėjęs. Laiko duomenys sakė, kad abu keliai yra lygūs; patarimas sakė priešingai.

Pataisymas – taisyklė, į kurią sutinka visi aukščiau nurodyti šaltiniai: **posūkis vertinamas visas**, nuo jo stabdymo zonos iki kito posūkio stabdymo zonos, nes „kartais keli milisekundžių nuostoliai posūkyje gali pagerinti bendrą rato laiką, leisdami vėliau važiuoti greitesnėmis atkarpomis“ ([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Lenktynių žinios, kurias koduoja taisyklės {#racing-knowledge-the-rules-encode}

**Išvažiavimo greitis svarbesnis nei įėjimo greitis**, ir tuo labiau, kuo ilgesnė sekanti tiesioji: „laikas tiesiosiose dominuoja prieš laiką posūkiuose“, o greičio deficitas išvažiavime nešamas iki kito stabdymo taško. Greičiausias būdas įveikti posūkį ir tiesiąją dažnai yra įveikti posūkį lėčiau, kad dujos įsijungtų anksčiau – *lėtai įeiti, greitai išeiti*. ([Race & Track Driving: rato laiko gerinimo seka](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/), [Driver61: posūkių prioritetai](https://driver61.com/uni/prioritising-corners/)) Minimalaus laiko planuotojas, kuris taip pat atlyginamas už išvažiavimo greitį, perkelia savo viršūnes vėliau ir gauna *greitesnį* ratą; atlygis, kuris subalansuoja abu, yra vertas `L / v²` už vieneto išvažiavimo greičio, kai tiesioji yra `L` ilgio ir važiuojama greičiu `v` – laikas, kurį greičio skirtumas kainuoja tiesiojoje, auga kartu su jos ilgiu ir krinta su greičio kvadratu ([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Posūkiai pagal tai, į ką jie veda.** Vienas į tiesiąją: maksimizuoti išvažiavimo greitį, vėlyva viršūnė, kuo anksčiau grįžti prie galios. Vienas tiesiosios gale: maksimizuoti į jį įnešamą greitį, stabdyti kuo vėliau, anksti viršūnė priimtina. Vienas tarp posūkių: kompromisas dėl to, kuris po jo svarbesnis. Posūkis, kuris gali būti bet koks, traktuojamas kaip vedantis į tiesiąją. Greitesni posūkiai sveria daugiau: dideliu greičiu automobilis greitėja silpnai, o prarasto km/h nebepavyks susigrąžinti. ([Allen Berg: trys posūkių tipai](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/), [Driver61: posūkių prioritetai](https://driver61.com/uni/prioritising-corners/), [Driver61: skirtingi posūkiai, skirtingos technikos](https://driver61.com/uni/different-corner-technique/))

**Trinties ratas.** Padanga turi vieną sukibimo biudžetą, kurį išleidžia stabdymui, posūkiui ir pagreičiui bet kokiu mišiniu; bendras pagreitis yra `sqrt(lat² + long²)`. Stabdymas posūkyje seka jo kraštą: stabdis atleidžiamas, kai vairas ir šoninė apkrova auga. ([trinties ratas](https://www.yourdatadriven.com/friction-circle-introduction/), [g-g diagrama](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Riedėjimas** – nė vienas pedalas nespaustas – yra lėčiausias būdas prarasti greitį ir pats savaime matuojamas pagrindinis veiklos rodiklis. ([Racecar Engineering / OptimumG: riedėjimo koeficientas](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Slydimas.** Išilginė jėga pasiekia maksimumą esant slydimo santykiui apie 10–20 %, paskui krinta; praėjus jam ratas blokuojasi stabdant arba sukasi variant. Forza praneša normalizuotą slydimą: 0 – pilnas sukibimas, didesnis nei 1 modulis – prarastas sukibimas. ([išilginis slydimas](https://www.sciencedirect.com/topics/engineering/longitudinal-slip), [Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Nepakankamas ir perteklinis vairavimas.** Priekinio slydimo kampas didesnis nei galinio – nepakankamas vairavimas (understeer); galinis didesnis nei priekinis – perteklinis vairavimas (oversteer). Be slydimo kampų: automobilis pasisuka mažiau, nei prašo vairas (vairas, viršijantis Ackermann kampą `L/R`, kurio automobiliui reikia mažu greičiu). ([nepakankamas vairavimas, apžvalga](https://www.sciencedirect.com/topics/engineering/understeer), [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Linijos geometrija {#the-geometry-of-a-line}

Greitis, kurį automobilis gali išlaikyti spinduliu `R`, yra `v = sqrt(a R)`, kur `a` – šoninis pagreitis, kurį duoda padangos (plius tai, ką prideda prispaudimas, kuris auga su `v²`). Taigi **greitis auga kaip spindulio kvadratinė šaknis**: linija per vidurį 20 % didesniu spinduliu ten yra maždaug 10 % greitesnė. ([maksimalus posūkio greitis](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html), [formula1-dictionary: posūkiai](https://www.formula1-dictionary.net/cornering_tech.html))

**Geometrinė linija** yra didžiausias lankas per posūkį: nuo išorinio krašto, liečiant vidinį viršūnėje, atgal į išorinį. Posūkiui, kurio kampas `θ` kelyje, kurio plotis `w` (atėmus automobilio plotį), lankas, liečiantis abu išorinius kraštus ir liečiantis vidinį kampą, turi `R = w / (1 - cos(θ/2))` (pridėjus vidinio krašto paties spindulį) – stačiam kampui apie `3,4 w`, kilpai `w`. Todėl plotį panaudoti svarbiausia vidutiniuose posūkiuose, o mažiausiai – kilpose. ([Lenktynių linija](https://en.wikipedia.org/wiki/Racing_line))

**Vėlyva viršūnė** įsisuka vėliau ir giliau, iš pradžių siauresniu spinduliu, ir išėjime spindulį atveria: lėčiau per vidurį, anksčiau tiesiai, anksčiau pilnomis dujomis – „šiek tiek žemesnis mažiausias greitis, bet stipresnis pagreičio profilis išvažiuojant“. **Ankstyva viršūnė** yra atvirkščiai: greičiau įėjus, o spindulys išėjime susiaurėja ir sulaiko dujas – iš esmės klaida, išskyrus labai mažo sukibimo atvejus, kai greitis, prarastas įėjime, išvažiuojant nebeatsiimamas. ([Lenktynių linija](https://en.wikipedia.org/wiki/Racing_line), [lenktynių telemetrijos žodynas](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/), [lenktynių linijos matematika](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**„V“ ir „U“.** U yra klasikinė apvali linija: plačiausias spindulys, mažiausias vairo pakeitimas. V įsisuka anksčiau, eina giliau, greitai pasuka automobilį per vidurį ir paruošia išvažiavimą tiesesniam važiavimui: stabdymas lieka tiesus (todėl gali būti vėlesnis), mažiausias greitis žemesnis, bet pasiekiamas vėliau, pilnos dujos įjungiamos daug anksčiau. ([Track Titan: V linija](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Kreivumas prieš atstumą.** Greičiausia linija yra kompromisas tarp trumpiausio kelio ir mažiausiai išlenkto; lenktynių trasos plotyje kreivumas svarbesnis, o minimalaus kreivumo linija labai arti minimalaus laiko linijos bet kur, kur automobilis ribinėje būsenoje – nuo jos atsiskiria ten, kur automobilis galėtų greitėti. ([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2), [TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Posūkiai iš eilės** – dvigubą viršūnė, šikana – yra viena problema: vieno išėjimo linija yra kito įėjimo linija, ir jie važiuojami atgal nuo to, kuris veda į tiesiąją. ([Driver61: skirtingi posūkiai, skirtingos technikos](https://driver61.com/uni/different-corner-technique/))

## Kuri linija tinka kuriam automobiliui {#which-line-suits-which-car}

Lemia automobilio **galia prieš sukibimą** tų posūkio greičių metu – „impulsas yra sukibimas prieš galią, santykio reikalas“. ([Ross Bentley: impulso automobiliai](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/), [impulsas virš arklio galių](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Automobilis, šiame posūkyje | Linija | Kodėl |
|---|---|---|
| Stipriai greitėja pagal savo sukibimą („taikyk ir spausk“) | V: stabdyti tiesiai ir vėlai, pasukti trumpame, siaurame viduryje, anksti tiesiai ir plokščiai | laikas laimimas pilnomis dujomis, o ne mažiausiu greičiu |
| Silpnai greitėja pagal savo sukibimą („impulsas“) | plati U, šiek tiek vėlyva viršūnė, mažiausią greitį palaikyti aukštai | negali susigrąžinti greičio, kurį nuslopino |
| Tarpinis | lėtai įėjus, greitai išėjus: U su vėlyva viršūne | klasikinis kompromisas |
| Greitas posūkis, ir dar labiau su prispaudimu | U, arti geometrinės linijos | pagreitis greityje silpnas; prispaudimo sukibimas auga su `v²`, todėl greitis per vidurį atsiperka du kartus |
| Labai mažas sukibimas (šlapia, sniegas) | ankstesnė viršūnė | greitis, prarastas įėjime, nebepasiimamas išėjime |
| Galia toli viršija sukibimą | linija mažiau svarbi | išėjimą riboja trauka, o ne linija |

„Kuo greitesnis posūkis, tuo arčiau geometrinės linijos; kuo lėtesnis, tuo labiau ją keičiate vėlyva viršūne.“ ([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html), [lenktynių linijos matematika](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/), [Track Titan: V linija](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide), [Driver61: sukibimas](https://driver61.com/uni/grip/))

Pavarų sistema keičia, kaip linija važiuojama, labiau nei pati linija: priekinių ratų varomas automobilis pasukamas stabdžiais (stabdymas posūkyje) ir gauna galią tik tada, kai ratas atsisuka, arba plačiai nuplaukia; galingas galinių ratų varomas automobilis turi būti tiesus prieš pilnas dujas, arba galas išslysta; visų ratų pavara gali imti galią, vis dar sukdamasi, todėl dujas įjungia anksčiau. ([FWD technika](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/), [RWD prieš FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/), [AWD prieš RWD posūkiuose](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Peržiūros programa išmatuoja automobilio galios prieš sukibimą santykį kiekviename posūkyje pagal jo paties važiavimą – pilno dujų pagreitį išvažiavimo greičiu, padalytą iš šoninio sukibimo mažiausiu greičiu – ir vadina „taikyk ir spausk“ nuo 0,45 ir daugiau, „impulsu“ – 0,25 ir mažiau. Automobilis, kurio sukibimas 150–250 km/h yra daugiau nei 15 % didesnis nei jo sukibimas 55–110 km/h, turi veikiantį prispaudimą.

## Metodas {#the-method}

Žemiau pateikti skaičiai yra samprotavimas. Kodo naudojamos ribos kiekvienam puslapyje laikomos atskirai, ir tie puslapiai yra nuoroda, kai čia pateiktas skaičius skiriasi: [Posūkis po posūkio analizė](race-corner-analysis.md), [Automobilio valdymo įvykiai](race-control-events.md), [Automobilių profiliai ir palyginimas](race-car-profiles.md) ir [Kurso statistika](race-course-statistics.md).

### 1. Viena atstumo ašis {#one-distance-axis}

Greičiausias ratas yra etalonas, nebent naudotojas pasirenka kitą. Jo nuvažiuotas kelias yra ašis: kiekvieno kito rato mėginiai projektuojami ant jo, ir kiekvienas mėginys gauna atstumą palei etaloną `s` ir su ženklu paimtą šoninį poslinkį `d`. Projektavimas ieško tik pirmyn nuo ankstesnio sutapimo, todėl ratas, kuris kerta pats save, niekada nepersoka į neteisingą tilto pusę. Tada ratai perskaičiuojami į vieną tinklelį, kas 2 m, kiekvienam kanalui. Kiekvienas ratas paskutinius kelis metrus nešamas tuo greičiu, kokį turėjo, todėl jo delta linijoje yra rato laiko skirtumas.

### 2. Posūkiai ir kiekvieno posūkio dalis rate {#corners-and-each-corners-share-of-the-lap}

Kaip randami posūkiai, atkarpos ir kompleksai: [Posūkis po posūkio analizė](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Posūkio laiko apskaita {#the-time-account-of-a-corner}

Grynasis, pasidalijimas, išvažiavimo greitis ir automobilių trauka: [Posūkis po posūkio analizė](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Sprendimas ir priežastis {#the-verdict-and-the-cause}

Sprendimo schemos ir priežastys įėjime bei išėjime: [Posūkis po posūkio analizė](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Automobilis prieš vairuotoją {#the-car-against-the-driver}

Kai ratai yra skirtinguose automobiliuose, nuostolis, kurį paaiškina automobilis, išskaičiuojamas dalimis:

- **trauka**: automobiliai nuo to paties greičio tiesiojoje, kaip aukščiau;
- **sukibimas**: iš žemesnio mažiausio greičio, nepaaiškinto siauresniu spinduliu, dalis `½ ln(grip_other / grip_mine) / ln(v_other / v_mine)`, kai ratas buvo ties savo automobilio riba (90 % to, ką jis parodė tuo greičiu);
- **stabdžiai**: nuo `u` iki `v` esant lėtėjimui `a1` prieš `a2`, baigiant tame pačiame taške, kainuoja `(1/a1 - 1/a2)(u - v)² / 2u` – tik kai ratas stabdė vidutiniškai beveik taip stipriai, kaip gali jo automobilis zonoje, o ne tik pikuose.

Ką automobilis gali, nustatoma iš visų jo įkeltų ratų: šoninis sukibimas, stabdymas ir pilno dujų pagreitis kiekvienoje 5 m/s greičio juostoje (95-as, 95-as ir 90-as procentiliai). Sukibimas yra tai, ką automobilis **laikė pusę sekundės** – šoninis pagreitis, vidurkintas per 0,5 s – o ne tai, ką palietė vienas mėginys: bordiūras, slydimo atšokimas, automobilio gaudymas visi trumpam jį išstumia, o automobilis, kuris tai daro dažnai, atrodytų sukibęs labiau, nei yra. (Patikrinta pagal įrašytus dviejų skirtingų automobilių ratus: mėginio matas juos suartino; pusės sekundės laikymas – jie atsiskiria taip, kaip atsiskiria jų rato laikai.) Stabdymas ir trauka kiekvieną mėginį ima kaip savo ir kaimynų medianą. Oras, nusileidimo nusistovėjimas ir kiekvienas smūgis (6 skyrius), kol automobilis atsigauna, paliekami nuošalyje.

**Koks kiekvienas automobilis yra** (`profile.ts`): iš tų pačių ratų:

- **laikomas sukibimas**: 95-asis procentilis to pusės sekundės šoninio pagreičio;
- **trauka** pilnomis dujomis iki 50 km/h, 50–120, 120–200 ir virš 200, ir didžiausia, kurią rodė;
- **stabdymas** nuo 60 iki 160 km/h;
- **didžiausias greitis**: kur jis nustojo įgauti greičio pilnomis dujomis per sekundę tiesiojoje – važiuojant tiesiai, o ne ilgame posūkyje, paimtame pilnomis, kur automobilis nuslopina greitį bet kokia galia. Kur nė viena tiesioji nebuvo pakankamai ilga, tai, ką jis dar traukė didžiausiu greičiu, parodo, kiek toli nuo jo buvo. Jokių spėjimų daugiau nei rodo ratai: galios nuo greičio pritaikymas prie pasipriešinimo nustatė automobilį 100 km/h per didelį greitį, nes pavaros dėžė ir ribotuvas automobilio trauką nutraukia gerokai anksčiau nei pasipriešinimas;
- **galo praradimas**: kiek kartų per ratą automobilis slydo daugiau nei 10° dreifo (20° biriame kelyje) su ratu, pasuktu prieš posūkį – pagautas priešingu vairu – kiek iš tų slydimų prasidėjo su dujomis ir kokioje sukibimo dalyje jie prasidėjo. Automobilis, kurį tyčia šiek tiek nuvairuoja į šoną, nieko neprarado; tas, kurį reikia gaudyti – prarado. Skaičiuojama vienodai kiekvienam automobiliui, todėl du automobiliai gali būti palyginti;
- **balansas**, kur ratai turi slydimo kampus: priekinis prieš galinį ribinėje būsenoje.

**Lyginami automobiliai** sudeda automobilius šalia – lentelę, kiekvieno sakinį apie tai, koks automobilis yra palyginti su kitu („X greitėja geriau, bet negali taip stipriai pasisukti, reikia ilgiau sustoti ir lengviau praranda galą“), kiekvieną aiškų skirtumą (4 % sukibimo, 5 % traukos ar stabdymo, 4 km/h didžiausio greičio, galas pagautas bent kartą per ratą dažniau ir dar pusę kartų dažniau) ir kaip vairuoti kiekvieną. Su vienu automobiliu sakoma, koks tas automobilis yra.

**Kiekviename posūkyje**, kai ratai yra skirtinguose automobiliuose, radinys sako, kiek jo lemia automobiliai, ir kaip geriausiai išnaudoti šį:

- **per vidurį**: kito automobilio linijoje šio automobilio sukibimas leidžia `v_other · √(grip_mine / grip_other)`. Jei ratas tai išlaikė, atotrūkis yra automobilis, o jo nepakeis joks stabdymo taškas – tai pasakoma, ir posūkis priskiriamas automobiliui, o ne vairuotojui; jei išlaikė mažiau, likusi dalis yra pasiekiama, ir sakoma, kiek. Tada – kur laiko galima laimėti: į tiesiąją arba automobilyje, kuris traukia stipriau, po viršūnės – stabdyti tiesiai, įsukti vėliau, anksti nukreipti į išvažiavimą; kitaip – didžiausias spindulys, kurį leidžia kelias, nes didesnis spindulys yra vienintelis būdas gauti daugiau greičio be daugiau sukibimo;
- **galas, kuris paleido**: čia, automobilyje, kuris jį praranda lengviau nei kitas: ką daryti šiame automobilyje – dujos įleidžiamos, kai ratas atsisuka, arba stabdis atleidžiamas švelniai, be atleidimo posūkio viduryje, pagal tai, kaip prasideda jo slydimai;
- **tiesioji po jo**: ką atėmė stipresnė kito automobilio trauka nuo to paties greičio ir kur šis automobilis tiesiojoje išseko traukos;
- **ankstesnis stabdymo taškas** automobiliui, kuris stabdo mažiau stipriai.

Ratas, kuris posūkio viduryje slydo (asfalte daugiau nei 10° dreifo), buvo už savo sukibimo ribos, o ne trūkdamas jo: jam niekada nesakoma, kad ten turėjo sukibimo atsargos. O jei automobilio galas šiame rate paleido esant mažesniam šoniniam pagreičiui, nei posūkis reikalavo, „sukibimo atsarga“ sako rasti jį mažais žingsneliais.

### 6. Automobilio valdymas: blokavimai, sukimasis, slydimai ir stūmimai, smūgiai ir avarijos {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Kiekvienas ratas taip pat skaitomas pagal tai, kaip automobilis buvo valdomas – kur ratas užblokavosi, kur varomieji ratai sukosi, kur galas išslydo, kur priekis nuplaukė plačiai – nes tai klaidos, kurių vien laikas nenurodo. Trys dalykai leidžia tai išlaikyti skirtinguose žaidimuose ir paviršiuose.

**Kur baigiasi sukibimas, matuojama iš paties automobilio važiavimo.** Inžinieriai nustato kiekvieno automobilio užblokavimo ribą prie slydimo, kuris davė didžiausią lėtėjimą (MoTeC kanalai OptimumG stabdymo serijoje vienam automobiliui naudoja -0,07), o ne prie knygos vertės, ir knygų vertės vis tiek nesutampa: jėga asfalte pasiekia maksimumą esant 5–20 % slydimui priklausomai nuo padangos ir modelio, sniege – esant 6 % arba 20–60 % priklausomai nuo šaltinio, o žvyrui nė vienas šaltinis neduoda vienos vertės. Žaidimai slydimą skaliuoja dar kitaip: Forza slydimas „normalizuotas“, taip kad viršijus 1 sukibimas prarandamas – tačiau automobilio stabdžiai gali duoti geriausią rezultatą gerokai žemiau ar aukščiau už 1, o įprastos stabdymo zonos gali viršyti 1. Todėl kiekvienam automobiliui, per visus jo įkeltus ratus, jėga, kurią jis sukūrė, sugrupuojama pagal slydimą, kuriuo jis važiavo – lėtėjimas prieš ratų slydimo santykį tiesiai stabdant, pagreitis (kaip dalis to, ką automobilis sukuria tuo greičiu) prieš varomųjų ratų slydimą, posūkio sukibimas (kaip dalis automobilio sukibimo tuo greičiu) prieš kiekvienos ašies slydimo kampą – ir riba yra slydimas už geriausio taško, kur jėga nukrito 8 %. Kreivė, kuri duomenyse niekada nenukrenta – Forza Horizon posūkio ir traukos – neturi ribos, ir vien slydimas ten nieko nežymi. Su per mažai duomenų riba yra pusantro karto nominalaus maksimumo.

**Žemė žinoma kiekvienam mėginiui**, kai žaidimas tai sako: Forza purto padangas žvyre, purve ir žolėje (asfalto trasoje mažai mėginių, o purve ir kirtimo trasose – daug), Trackmania nurodo medžiagą po kiekvienu ratu, o ralio etapo žemė nustatoma, kaip sako 11 skyrius. Kreivės, dreifo įpročiai ir ribos laikomos atskirai asfaltui ir biriam paviršiui.

**Kiekvienas įvykis dedamas prieš kitą ratą tais pačiais metrais.** Biriame žvyre, sniege, dreifų kupinose arkadinėse lenktynėse slydimas yra tai, kaip važiuojamas posūkis: optimalaus valdymo tyrimai randa „mažo dreifo“ sprendimus asfalte ir „agresyvius, didelio dreifo, net priešpriešinio vairo“ sprendimus už kelio ribų; ralio duomenys rodo padangas „gerokai ribotoje netiesinėje srityje“, o užblokavus ratą labai biriame paviršiuje automobilis gali net sustoti anksčiau. Todėl įvykis, kurį padarė ir kitas ratas – 80 % ar daugiau – yra tai, kaip važiuojamas posūkis, o ne klaida; o tas, kurio jis nepadarė, yra klaida tik tada, jei kainavo laiko: laikas, prarastas nuo tuoj prieš jį iki 40 m po jo. Klaida, kuri paaiškina 40 % ar daugiau posūkio nuostolio, tampa to posūkio priežastimi.

Aptikimo ribos, kito rato testas, smūgiai ir avarijos bei patarimų tekstai: [Automobilio valdymo įvykiai](race-control-events.md).

### 6b. Daug ratų: kurso statistika {#b-many-laps-the-courses-statistics}

Klasių palyginimas, kas laikoma klaida, statistika ir klaidų žemėlapis: [Kurso statistika](race-course-statistics.md).

### 7. Vairuojama linija {#the-driven-line}

Kiekvienam ratui ir posūkiui, vien iš padėčių: kur jis pradėjo sukti (penktadalis jo siauriausio kreivumo), jo siauriausias spindulys (per ±8 m), vidutinis spindulys per pirmąją ir antrąją krypties pokyčio pusę ir taip toliau:

- **forma**: siauriausias spindulys, padalytas iš vidutinio, žemiau 0,55 – V, virš 0,75 – U;
- **viršūnė**: išėjimo spindulys, padalytas iš įėjimo spindulio, virš 1,25 – vėlyva, žemiau 0,8 – ankstyva;
- **greičio viršūnė**: jo lėčiausias taškas daugiau nei 15 m prieš pusę posūkio – lėtai įėjus, greitai išėjus; daugiau nei 15 m po – dar lėtėja per vidurį.

Palyginus su kitu ratu: kiek vidun ar išorėn jis važiavo įsukant, per siauriausią dalį ir kur abu buvo su pilnomis dujomis, ir kur kiekvienas įsuko. Kiekvienas radinys baigiasi linija, kuri tinka ratui automobiliui tame posūkyje – pagal tai, į ką posūkis veda, ir automobilio išmatuotą galios prieš sukibimą, prispaudimą ir varymo sistemą – ir tuo, ar ratas taip važiavo. Lentelėje „Posūkis po posūkio“ išvardijamas greičiausias ratas per kiekvieną posūkį su jo linijos forma, o geriausi posūkiai sudedami kartu.

### 8. Du žemėlapiai {#two-maps}

- **Kur**: trasa nuspalvinta pagal `dΔt/ds` palyginus su etalonu, raudona ten, kur prarandama laiko, žalia – kur laimima.
- **Kodėl**: kiekvienas nuostolis nubrėžtas ten, kur yra jo priežastis, nuspalvintas pagal priežasties grupę – stabdymas, įvažiavimas, išvažiavimas, tiesioji, automobilis – ir platesnis už brangesnį.

### 9. Pakartojimas {#replay}

Vienas laikrodis ir trys būdai, kaip jį paversti kiekvieno rato laiku: nuo starto linijos; sulygiuoti (kiekvienas ratas pasiekia vieną trasos tašką tuo pačiu momentu, tada paleidžiamas); greta (kiekvienas ratas laikomas etalono atstumu).

### 10. Kuria puse pasaulis apverstas {#which-way-round-the-world-is}

Peržiūros programos pasaulis yra dešiniarankis, su Y aukštyn. Žaidimas su kairiarankiu pasauliu (tarp jų Forza) atvaizduojamas veidrodiškai: kiekvienas dešiniojo lenkimo posūkis nupiešiamas kaip kairysis, tiek kursas, tiek ratai. Ratai tai sako patys – teigiamas vairas į dešinę kiekviename adapteryje, o posūkio išorinė pakaba suspaudžiama – todėl lenktynių skirtukas siūlo tai ištaisyti, o **Camera & scene → Invert world axis** tai ir daro: X, Y ar Z nupiešiami atvirkščiai. Keičiamas tik piešimas – atspindys įdėtas į vaizdo matricą; kamera skrenda nupieštu pasauliu, o duomenys, analizė ir kiekviena koordinatė, kurią rodo įrankiai, lieka žaidimo paties. Analizė posūkius pavadina kairiaisiais ar dešiniaisiais tuo pačiu matavimu.

### 11. Ralis: slydimas, kairė koja, oras {#rally-the-slide-the-left-foot-the-air}

Ralio etapas nėra trasa, važiuojama prastesniu sukibimu. Biriame žvyre ir sniege slydimas yra tai, kaip imamas posūkis: automobilis pasukamas įvažiuojant perkeliant svorį – „stabdžiai perkelia automobilio svorį į priekį ... priekinės padangos įgauna sukibimo, galinės jį praranda, ir automobilis sukasi slysdamas į posūkį“, paskui vėl dujos, kai jis „ištiesintas kryptimi, kuria norite važiuoti“ ([DirtFish: kaip naudoti stabdžius](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Kairė koja stabdo, kad dujos ir stabdis galėtų būti derinami vienas su kitu, rankinis stabdys pasuka automobilį siauruose posūkiuose ([RallySport Ontario: ralio vairavimas, pagrindai](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), o automobilis atitrūksta nuo žemės. 6 skyrius jau nagrinėja slydimus, lyginant su kitu ratu; šios taisyklės tęsia likusį.

- **Žemė.** Ką sako ratas (`meta.surface`, ralio įrašymo programų `--surface`), kitaip – etapo pavadinimas: asfalto ralis (Ispanija, Kroatija, Vidurio Europa, Vokietija, Japonija, Korsika, Ypres), žiemos (sniegas), Monte asfalto dalis su sniegu ir ledu (mišri) – kitaip pagal tai, kaip automobilis vairuotas. Rally2 automobilio šoninė riba yra 0,7–0,9 g žvyre ir 1,3–1,4 g asfalte ([grenzbereich, nuorodinės vertės](https://github.com/GitCrush/grenzbereich)), o žvyre jis labiau slysta (6 skyrius). Taigi etapas, kuriame automobilis traukė 10 m/s² ar daugiau (95-as procentilis, greityje, ant žemės) su mediana dreifu mažesniu nei 6 laipsniai, kur tik posūkiavo iki 70 % to, buvo asfaltas; viskas kita arba per mažai, kad būtų galima nustatyti, yra biri danga.
- **Ką automobilis gali, toje žemėje, kurioje tai padarė.** Sukibimas, stabdymas ir trauka (5 skyrius) matuojami asfalte ir biriame paviršiuje atskirai, kai ratai kiekviename iš jų važiavo bent penktadalį savo mėginių, o kiekvienas posūkis vertinamas su žeme po automobiliu jo lėčiausiame taške. Mėginiai ore ir 0,3 s po nusileidimo paliekami nuošalyje visame, kas matuoja automobilį – ribinėse kreivėse, padangų kreivėse, blokavimuose ir sukimosi slydime: nusileidimas sukrečia automobilį labiau, nei jo padangos gali, o ore sukiniai ratai nėra sukimosi slydimas. Prispaudimas nevertinamas biriame paviršiuje, kur greitos ir lėtos etapo dalys yra skirtingi keliai.
- **Kairės kojos prisilietimas nėra stabdymas.** Stabdžio prisilietimas, kai dujos vis dar bent per pusę, trumpesnis nei 15 m, nusistovina automobilį arba jį pasuka; kur ratas pradėjo stabdyti posūkiui – tai pirmas stabdis, po kurio dujos buvo nuimtos, arba tas, kuris tęsėsi ilgiau.
- **Automobilis pasuktas įvažiuojant.** Kiekvienam ratui ir posūkiui – didžiausias dreifo kampas nuo jo stabdymo iki 5 m po lėčiausio taško. Biriame paviršiuje ratas, kuriame automobilis pasuktas 8 laipsniais ar daugiau mažiau nei kitame (kuris jį pasuko 12 ar daugiau), ir kuris su dujomis ar pilnomis vėliau, **pasuko automobilį mažiau**: patarimas – pakelti ar prisiliesti kairės kojos stabdžiu įsukant, kad galas apsisuktų – su kito rato rankinio stabdžio tašku, kai jis naudojo, arba rankiniu stabdžiu lėtesniame nei 54 km/h posūkyje – ir turėti jį nukreiptą į išvažiavimą prieš viršūnę. Tas, kuris pasuko 12 laipsnių ar daugiau labiau nei kitas, bet vis tiek su dujomis vėliau, **pasuko per daug**: reikėjo ištiesinti, kol galima nuleisti galią. Bet kuris iš jų yra posūkio priežastis išvažiavime, po automobilio valdymo klaidos. Patarimas biriame paviršiuje apie kiekvieną posūkį sako tą patį.
- **Oras.** Skrydis, 0,2 s ar daugiau ilgesnis nei kito rato, kuris kainavo laiko nuo 10 m prieš pakilimą iki 40 m po nusileidimo (ar posūkio galo), yra priežastis, kai paaiškina 40 % ar daugiau posūkio nuostolio, o po jo einantis posūkis, pasiektas lėčiau, tai pasako. Ore automobilis negali pasukti, stabdyti ar varyti. Patarimas – palaikyti dujas pakilimo metu („nenuimkite dujų pakilimo metu“, nes priekis nusileistų) ir įveikti kalvagūbrį šiek tiek lėčiau arba su stabdžio prisilietimu, kad automobilis liktų žemai ([DirtFish: kaip peršokti ralio automobilį](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Kompleksai iki trijų lenkimų.** Vingiuotas ruožas, važiuojamas niekada nebuvus pilnomis dujomis, nėra vienas ilgas kompleksas: po trijų lenkimų prasideda naujas.

`src/race/rally.test.ts` tikrina analizę visame tame, kas aprašyta, etapuose, paleistuose paprastu modeliu: automobilis pasuktas mažiau ir vėliau su dujomis, ilgesnis skrydis, kairės kojos prisilietimai, vingiuotas ruožas, asfaltas prieš žvyrą.

## Duomenys ir ką leidžia kiekvienas šaltinis {#data-and-what-each-source-allows}

| Šaltinis | Dažnis | Kanalai | Leidžia |
|---|---|---|---|
| FH Companion ratų failai | ~5 m | padėtis, greitis, dujos, stabdis, vairas, šoninis ir išilginis pagreitis, pavara | viską, išskyrus automobilio valdymą, kuriam reikia šalia esančios telemetrijos |
| FH Companion `.tele.gz`, šalia kiekvieno ratų failo | žaidimo 64 Hz (įrašymo programa, išsaugojusi kiekvieną paketą, rašo apie 110 per sekundę; pasikartojimai išmetami) | visas Forza Data Out: kiekvieno rato slydimo santykis, slydimo kampas, bendras slydimas, sukimasis, pakaba, paviršiaus dribsnis; automobilio rėmo greitis; posūkio greitis | viską, įskaitant automobilio valdymą |
| Forza Data Out, įrašytas `heat3d_capture telemetry` | 60 Hz | visa tai, plius kiekvienam ratui: padangos temperatūra, slydimo santykis, slydimo kampas, bendras slydimas, pakabos eiga, rato greitis, dribsnio juosta; aps./min., galia, sukimo momentas, posūkio greitis | viską |
| Assetto Corsa, ACC, AC EVO, AC Rally (bendra atmintis, `heat3d_capture telemetry --game ...`) | 60–333 Hz | visų dalykų viršaibis: padangos branduolio ir vidinė, vidurinė ir išorinė temperatūros, slėgiai, stabdžių temperatūros, ratų apkrovos, kampas, slydimo santykis ir kampas; automobilio rėmo greitis; ABS ir TC veikia (ACC, EVO, AC Rally) | viską |
| iRacing `.ibt`, skaitomas tiesiogiai | 60 Hz | padėtis iš GPS, pedalai, vairas, g, posūkis, kiekvieno rato karkaso temperatūra, amortizatoriaus nusileidimas, slėgis, nusidėvėjimas | viską; automobilio valdymas pagal dreifo kampą (jo posūkis prieš judėjimo kryptį) ir vairą, be slydimo (neįrašomas) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | kiekvienas kadras; 100 Hz | padėtis, pasaulio greitis ir automobilio ašys, kiekvieno rato kontakto ploto greitis ir pakaba, pedalai, vairas, etapo laikrodis ir ilgis | viską; slydimas ir dreifo kampas išvedami |
| Richard Burns Rally (NGP UDP) | kiekvienas fizikos žingsnis | padėtis, automobilio paties greičiai, kiekvieno rato spyruoklės nusileidimas ir jėga, pedalai | viską, išskyrus rato slydimą |
| BeamNG.drive (`heat3d` protokolo modifikacija) | iki 100 Hz | padėtis, pasaulio greitis ir ašys, kiekvieno rato paviršiaus greitis, sukimasis, apkrova ir kontaktas su žeme | viską; slydimas ir dreifo kampas išvedami |
| Trackmania (Openplanet papildinys) | kiekvienas kadras | padėtis, priekinis ir šoninis greitis, pedalai (stabdis įjungtas / išjungtas), vairas, kiekvieno rato slydimo koeficientas ir biri žemė, ore | viską; dreifo kampas iš šoninio greičio |

Kiekvienas šaltinis paverčiamas į vieną ratų formatą, `heat3d-lap`, kurio kanalai turi kanoninius pavadinimus (`speed`, `throttle`, `tireTemp[FL]` ...). Automobilio ženklas ir grafikai piešia visus kanalus, kuriuos turi ratas.

## Šaltiniai {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Sekcijų greičio didinimas: laiko variacijos kreivės](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (delta atstumo srityje)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing rato analizės vadovas](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: sesijos ratai](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: lenktynių linijų analizė](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: teorinis geriausias ratas iš sektorių](https://overcut.gg/)
- [Track Titan: kaip analizuoti telemetriją](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: stabdymo analizė, blokavimo ir stabilumo KPI (2019 m. rugsėjis)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: ant dujų (2020 m. sausis)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: lenktynininkų pagrindiniai veiklos rodikliai (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Padangos ir kelio trinties modeliai ir optimalus slydimas (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: padangos ir dangos trintis, slydimas maksimume sniege ir ledu](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: padangų trinties koeficientai, maksimalus ir slystant](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: išilginės jėgos](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: šoninės jėgos](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Automobilio stabilumas, kėbulo slydimo ribos (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Ralio vairavimas dideliu šoniniu slydimu (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Minimalaus laiko ralio manevrai (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC nuorodinis posūkio greitis (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Nepakankamo ir perteklinio vairavimo aptikimas lyginant vairą su posūkiu (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: vairo kampas, Ackermann ir nepakankamo vairavimo gradientas](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: matematiniai kanalai (Kus, bendras g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: perteklinio ir nepakankamo vairavimo valdiklis](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Stabdymas pulsuojant: blokavimas labai biriuose paviršiuose](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: ralio žvyre duomenų įrašymas](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: kaip naudoti stabdžius](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: kaip peršokti ralio automobilį](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: ralio vairavimas, pagrindai](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: ralio automobilio dinamika, nuorodinės vertės](https://github.com/GitCrush/grenzbereich)
- [Trackmania greičio dreifo treniruoklio papildinys (konstantos)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania greičio slydimo aprašas](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: treniravimo srautai](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: V linija](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Dirbtinio lenktynininko vairavimo stiliaus šališkumas (išėjimo greitis prieš minimalų laiką)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: rato laiko gerinimo seka](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: trys posūkių tipai](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: posūkių prioritetai](https://driver61.com/uni/prioritising-corners/)
- [Driver61: skirtingi posūkiai, skirtingos technikos](https://driver61.com/uni/different-corner-technique/)
- [Driver61: šešios posūkio fazės](https://driver61.com/uni/corner-phases/)
- [Driver61: sukibimas](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (ištrauka)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: kas yra impulso automobilis](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [Impulsas prieš arklio galias: diskusija](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Lenktynių linijos matematika, 2 dalis](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD prieš FWD, 1 dalis](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD technika](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD prieš RWD posūkiuose](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Lenktynių linija](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: posūkio technika](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maksimalus posūkio greitis](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Lenktynių telemetrijos žodynas](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Minimalaus laiko trajektorijos planavimas, atsižvelgiant į kreivumą ir atstumą](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: visos lenktynių trajektorijos optimizavimas](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: riedėjimo koeficientas](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Trinties rato įvadas](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g diagrama](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Išilginis slydimas](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Nepakankamas vairavimas, apžvalga](https://www.sciencedirect.com/topics/engineering/understeer)
- [Nepakankamas ir perteklinis vairavimas](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out dokumentacija](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: traukos ribota spartėjimas](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: galios ribota spartėjimas](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO bendra atmintis](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally telemetrijos skaitytuvas](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT skaitymas](https://github.com/teamjorge/ibt)
