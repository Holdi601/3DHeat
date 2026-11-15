---
title: "Sõidu analüütika: meetod"
parent: "Sõiduanalüüs"
nav_order: 58
lang: "et"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Sõidu analüütika: meetod

Lühidalt:

- Ringe võrreldakse **vahemaa** järgi, mitte aja järgi, nii et rajal sama koht joondub.
- Iga kurvi hinnatakse **tervikuna**, ühest pidurdustsoonist järgmiseni.
- Kaotatud aeg **jaotatakse** selle järgi, kus see kaoti (pidurdus, sisenemine, väljasõit, sirge), ja selle järgi, kui suure osa sellest auto selgitab.
- Põhjus **seletatakse sõnadega**, koos nõuandega.
- Kasutamiseks, mitte selle toimimise lugemiseks: vt [Sõiduanalüüs](race-analysis.md).

See on meetod, mis seisab **Sõiduanalüüsi** vaate taga: mida ta mõõdab, kuidas ta otsustab, kuhu aeg kadus, ja kuidas see muutub nõuandeks. See on specifikatsioon, mida analüüsikood (`src/race/`) järgib, nii et iga reegel siin on koodis vastena ja testiga, mis seda kinnitab.

## Mida professionaalsed tööriistad teevad {#what-the-professional-tools-do}

Tuntud tööriistad jõuavad samale tuumale ja erinevad peamiselt selle poolest, kui kaugele nad lähevad *põhjusteni*:

- **Kõike võrreldakse vahemaa, mitte aja järgi.** Kaks ringi ümbervõetakse ühele vahemaateljele. Jooksev aja vahe samal vahemaal on *delta* (MoTeC nimetab seda time variance, teised time slip või delta trace). Selle kalle ütleb, kust aega parasjagu kaotatakse: lame kalle on kiirendus, takistus või pidev haare; järsk kalle on pidurdamise või gaasi erinevus; üles-alla laine on kompromiss sisenemiskiiruse ja väljasõidu vahel.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [lõigu ajaanalüüs](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Iga kurv jaotatakse faasideks**: pidurdus, sisenemine, keskosa, väljasõit. Pidurdamispunkt, tippvõimsus pidurdusel ja vabastamine, miinimumkiirus ja kus see tekib, käik, gaasi peale võtmine, täisgaasi tagasisaamine ja väljasõidu kiirus.
  ([Driver61: kuus faasi](https://driver61.com/uni/corner-phases/),
  [iRacingi ringianalüüsi juhend](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Iga kurvi mini-sektorid ja teoreetiline parim aeg**, kokku pandud igast kiireimast lõigust. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps), [Overcut](https://overcut.gg/))
- **Sõidetud joont võrreldakse ka**, aga mitte kunagi eraldi: "joon pildil ei tähenda midagi enne, kui tead kaasamõjutavaid tegureid". Seda loetakse kiiruskõvera ja deltaga koos. ([Track Titan: kuidas telemeetriat analüüsida](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing), [Sim Racing Telemetry: sõidujooned](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Põhjus, mitte sümptom.** Kas kaotus sirgel on tõesti gaas, või sundis halb sisenemine gaasi hilja peale? Vead järjestatakse ringiaja kulu järgi ja selgitatakse lihtsas keeles. ([Track Titan: coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Mis läks esimeses versioonis valesti ja miks see loeb {#what-went-wrong-in-the-first-version-and-why-it-matters}

Esimene versioon arvestas iga *faasi* eraldi ja vaatas ainult kadusid. Ring, mis pidurdas varem, kaotas aega pidurdusfaasis ja talle öeldi pidurdada hiljem, isegi siis, kui see varasem pidurdamine pani auto kiiremini pöörde, võimsuse peale ja kurvist kiiremini välja, ning võitis kõik sirgel tagasi. Ühes testis öeldi ringile, kes nii tegi, et ta "pidurdaks palju hiljem". Teine ring, mis pidurdas hiljem, oli aga tipust mööda läinud, läinud laia ja kaotanud täpselt selle, mis oli võidetud. Aja andmed ütlesid, et kaks teed olid võrdsed, nõuanne ütles vastupidist.

Parandus on reegel, millega kõik ülalnimetatud allikad nõustuvad: **kurvi hinnatakse tervikuna**, pidurdustsoonist selle jaoks kuni järgmise kurvi pidurdustsoonini, sest "mõnikord mõne millisekundi loovutamine kurvis võib parandada kogu ringiaega, kuna lubab järgmistel lõikudel kiiremat sõitu" ([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Võidusõidu teadmised, mida reeglid kodeerivad {#racing-knowledge-the-rules-encode}

**Väljasõidu kiirus loeb rohkem kui sisenemiskiirus**, ja seda rohkem, mida pikem on järgnev sirge: "sirgetel veedetud aeg domineerib kurvides veedetud aega", ja väljasõidu kiiruse puudujääk kandub järgmise pidurdamispunktini. Kiireim viis läbi kurvi-ja-sirge on sageli kurvi sõita aeglasemalt, et gaas tuleks varem: *aeglane sisse, kiire välja*. ([Race & Track Driving: ringiaja parandamise järjekord](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/), [Driver61: kurvide järjestamine](https://driver61.com/uni/prioritising-corners/)) Miinimumaja planeerija, mida premeeritakse ka väljasõidu kiiruse eest, nihutab oma tippe hiljemaks ja saab *kiirema* ringi. Tasakaalustav preemia on `L / v²` väljasõidu kiiruse ühiku kohta pikkusega `L` sirgel kiirusel `v`: kiiruseerinevuse hind sirgel kasvab pikkusega ja langeb kiiruse ruuduga ([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Kurvid selle järgi, kuhu nad viivad.** Kurv, mis viib sirgele: maksimeeri väljasõidu kiirust, hiline tipp, võimsus tagasi nii kiiresti kui võimalik. Kurv sirge lõpus: maksimeeri sinna kantavat kiirust, pidurda nii hilja kui võimalik, varasem tipp on lubatav. Kurv kurvide vahel: kompromiss selle jaoks, mis on pärast seda oluline. Kurv, mis võib olla kumbki, käsitletakse nagu sirgele viiv. Kiiremad kurvid kaaluvad rohkem: kiirusel kiirendab auto nõrgalt ja kaotatud km/h ei tule tagasi. ([Allen Berg: kolm kurvitüüpi](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/), [Driver61: kurvide järjestamine](https://driver61.com/uni/prioritising-corners/), [Driver61: erinevad kurvid, erinevad tehnikad](https://driver61.com/uni/different-corner-technique/))

**Hõõrdeering.** Rehvil on üks haarde eelarve, mida kulutatakse pidurdamisele, pöördumisele ja kiirendamisele mis tahes segus. Kogu kiirendus on `sqrt(lat² + long²)`. Pidurdamine kurvis järgib selle serva: pidur vabastatakse, kui roolipööre ja külgkoormus kasvavad. ([hõõrdeering](https://www.yourdatadriven.com/friction-circle-introduction/), [g-g diagramm](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Veeremine**, kui kumbki pedaal ei ole all, on kõige aeglasem viis kiirust kaotada, ja on ise mõõdetav põhinäitaja. ([Racecar Engineering / OptimumG: veeremistegur](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Libisemine.** Pikisuunaline jõud tipneb libisemissuhtel umbes 10–20%, seejärel langeb. Sellest kaugemal lukustub ratas pidurdamisel või pöörleb gaasil. Forza annab libisemise normaliseerituna: 0 on täielik haarde, suurus üle 1 on haarde kaotus. ([pikisuunaline libisemine](https://www.sciencedirect.com/topics/engineering/longitudinal-slip), [Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Alastuur ja ülestuur.** Esi-libisemisnurk, mis on suurem kui tagumine, on alastuur; tagumine, mis on suurem kui esi, on ülestuur. Ilma libisemisnurkadeta: auto pöörab vähem, kui roolipööre nõuab (roolipööre üle Ackermanni nurga `L/R`, mida auto vajab madalal kiirusel). ([alastuur, ülevaade](https://www.sciencedirect.com/topics/engineering/understeer), [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Joone geomeetria {#the-geometry-of-a-line}

Kiirus, mida auto võib hoida raadiusel `R`, on `v = sqrt(a R)`, kus `a` on külgkiirendus, mida rehvid annavad (plus see, mida allasurve lisab ja mis kasvab `v²`-ga). Seega **kiirus kasvab raadiuse ruutjuurega**: keskelt läbiv joon 20% suurema raadiusega on seal umbes 10% kiirem. ([maksimaalne pöördekiirus](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html), [formula1-dictionary: pöörded](https://www.formula1-dictionary.net/cornering_tech.html))

**Geomeetriline joon** on suurim kaar läbi kurvi: väljumise servast, sisemist puudutades tipus, tagasi välimisse serva. Kurvi jaoks, mis pöörab nurga `θ` all ja tee laius on `w` (miinus auto laius), kaar, mis puudutab mõlemat välisserva ja sisemist nurka, on `R = w / (1 - cos(θ/2))` (plus sisemise serva enda raadius). Täisnurga puhul on see umbes `3,4 w`, hairpini puhul `w`. Seepärast loeb laiuse kasutamine kõige rohkem keskmistes kurvides ja kõige vähem hairpinides. ([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**Hiline tipp** pöörab hiljem ja sügavamale, esmalt kitsamal raadiusel, ning avab raadiuse väljumisel: keskel aeglasem, sirgele ja täisgaasile varem. "Veidi madalam miinimumkiirus, aga tugevam kiirendusprofiil väljumisel". **Varajane tipp** on vastupidine: kiirem sisse, ja raadius kitseneb väljumisel ning hoiab gaasi tagasi. See on suures osas viga, välja arvatud väga madala haarde korral, kus sisse kaotatud kiirust ei saa välja tagasi teha. ([Racing line](https://en.wikipedia.org/wiki/Racing_line), [Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/), [math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**"V" ja "U".** U on klassikaline ümmargune joon: laiaim raadius, vähim roolipöörde muutus. V pöörab varem, läheb sügavamale, pöörab auto keskel kiiresti ja joondab väljumise sirgemaks jooksuks. Pidurdus jääb sirgeks (nii saab olla hilisem), miinimumkiirus on madalam, kuid saavutatakse hiljem, täisgaas tuleb palju varem. ([Track Titan: V-joon](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Kõverus vahemaa vastu.** Kiireim joon on kompromiss lühima tee ja kõige vähem kõverdunud tee vahel. Raja laiuse juures loeb kõverus rohkem, ja miinimumkõveruse joon läheneb miinimumaja joonele kõikjal, kus auto on piiril. Lahkub sellest seal, kus auto võiks kiirendada. ([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2), [TUM: globaalne sõiduraja optimeerimine](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Järjestikused kurvid**, topelttipp või šikaan, on üks probleem: ühe väljasõidujoon on järgmise sisenemisjoon, ja neid sõidetakse tagurpidi sellest, mis viib sirgele. ([Driver61: erinevad kurvid, erinevad tehnikad](https://driver61.com/uni/different-corner-technique/))

## Milline joon sobib millisele autole {#which-line-suits-which-car}

Otsustab auto **võimsus versus haare** nendel kurvi kiirustel. "Hoog on haarde versus võimsuse suhe, suhteline asi". ([Ross Bentley: hoogautod](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/), [hoog üle hobujõu](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Auto selles kurvis | Joon | Miks |
|---|---|---|
| Kiirendab tugevalt oma haarde jaoks ("punkt ja lase") | V: pidurda sirgelt ja hilja, pöörle lühikeses kitsas keskel, sirgu ja tasane varakult | aeg võidetakse täisgaasiga, mitte miinimumkiirusega |
| Kiirendab nõrgalt oma haarde jaoks ("hoog") | lai U, veidi hiline tipp, hoia miinimumkiirus üleval | ta ei saa tagasi kiirust, mida maha kulutab |
| Vahepeal | aeglane sisse, kiire välja: hilise tipuga U | klassikaline kompromiss |
| Kiire kurv, ja veel enam allasurvega | U, lähedal geomeetrilisele joonele | kiirendus on kiirusel nõrk; allasurve haare kasvab `v²`-ga, nii et kiirus keskel maksab kaks korda |
| Väga madal haare (märg, lumi) | varasem tipp | sisse kaotatud kiirust ei saa välja tagasi teha |
| Võimsus palju üle haarde | joon loeb vähem | väljumist piirab veovõime, mitte joon |

"Mida kiirem kurv, seda lähemal geomeetrilisele joonele; mida aeglasem, seda rohkem muudad seda hilisema tipuga." ([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html), [math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/), [Track Titan: V-joon](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide), [Driver61: haarne](https://driver61.com/uni/grip/))

Veosüsteem muudab joone sõitmist rohkem kui joont ise. Esivedu auto pööratakse pidurdades (trail braking) ja antakse võimsust alles siis, kui ratas lahti tuleb, või see lendab laiale. Tugeva tagaveoga auto peab sirgenema enne täisgaasi, muidu tagumine astub välja. Nelikvedu võib anda võimsust ikka veel pöörates, nii et valib gaasi varem. ([FWD tehnika](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/), [RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/), [AWD vs RWD kurvides](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Vaataja mõõdab auto võimsus-haarde suhet igas kurvis oma sõidust: täisgaasi kiirendus väljasõidu kiirusel, jagatud külghaardega miinimumkiirusel. Seda nimetatakse "punkt ja lase" alates 0,45 ja üles ning "hoog" alla 0,25. Auto, mille haare 150–250 km/h on üle 15% kõrgem kui tema haare 55–110 km/h, töötab allasurve.

## Meetod {#the-method}

Allpool on arutluskäik. Koodi kasutatavad lävendid on igal lehel ühes kohas ja need lehed on võrdluseks, kui siin olev number erineb: [Kurv-kurvilt analüüs](race-corner-analysis.md), [Sõiduki juhtimise sündmused](race-control-events.md), [Sõidukiprofiilid ja võrdlus](race-car-profiles.md) ja [Raja statistika](race-course-statistics.md).

### 1. Üks vahemaatelg {#one-distance-axis}

Kiireim ring on võrdlusring, kui kasutaja ei vali teist. Selle sõidutee on telg: iga teise ringi proovid projitseeritakse sellele, andes igale proovile vahemaa mööda võrdlusringi `s` ja märgiga külgnihke `d`. Projitseerimine otsib ainult edasi eelmisest vastest, nii et ring, mis ristub iseendaga üle, ei hüppa kunagi silla vales pooles olevale teele. Seejärel ümbervõetakse ringid ühele ruudustikule, iga 2 m tagant, kõigi kanalite jaoks. Iga ring kantakse viimased paar meetrit edasi oma kiirusel, nii et tema delta joonel on tema ringiaja vahe.

### 2. Kurvid ja iga kurvi osa ringist {#corners-and-each-corners-share-of-the-lap}

Kuidas kurvid, segmendid ja kompleksid leitakse: [Kurv-kurvilt analüüs](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Kurvi ajaarvestus {#the-time-account-of-a-corner}

Netos, jaotus, väljasõidu kiirus ja autode tõmme: [Kurv-kurvilt analüüs](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Otsus ja põhjus {#the-verdict-and-the-cause}

Otsuste mustrid ning põhjused sisenemisel ja väljumisel: [Kurv-kurvilt analüüs](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Auto vastu juht {#the-car-against-the-driver}

Kui ringid on eri autodes, võetakse välja kaotus, mida auto selgitab, osade kaupa:

- **tõmme**: autod samalt kiiruselt sirgel alla, nagu ülal;
- **haarduvus**: madalaima miinimumkiiruse osa, mida ei selgita kitsam raadius, osa `½ ln(haarduvus_teine / haarduvus_minu) / ln(v_teine / v_minu)`, kui ring oli oma auto piiril (90% sellest, mida ta sel kiirusel on näidanud);
- **pidurid**: `u`-st `v`-ni aeglustusel `a1` vs `a2`, lõppedes samas punktis, maksab `(1/a1 - 1/a2)(u - v)² / 2u`. Seda ainult siis, kui ring pidurdas tsoonis keskmiselt peaaegu nii kõvasti kui tema auto suudab, mitte ainult tipus.

Auto võimed tulevad igast laaditud ringist: külghaarde, pidurdamise ja täisgaasi kiirenduse kohta iga 5 m/s kiiruse sagari kohta (95., 95. ja 90. protsentiil). Haarde all mõeldakse seda, mida auto **hoidis pool sekundit** (külgkiirendus, keskmistatud 0,5 s üle), mitte seda, mida üks proov puudutas. Kiviserv, libisemise tagasipööramine, auto püüdmine tekitavad kõik hetkeliselt tipu, ja auto, mis seda sageli teeb, paistab haaratum, kui ta on. (Kontrollitud kahe eri auto salvestatud ringide najal: proovipõhine mõõt tõi need kokku, pool sekundit hoituna eraldab need nii, nagu nende ringiajad teevad.) Pidurdamine ja tõmme võtavad iga proovi enda ja naabrite mediaanina. Õhus olekut, maandumisele järgnevat settimist ja iga lööki (jagu 6) kuni auto taastumiseni ei arvestata.

**Milline auto on mis tüüp** (`profile.ts`): samadest ringidest:

- **hoitud haarde**: selle pool-sekundilise külgkiirenduse 95. protsentiil;
- **tõmme** täisgaasil kuni 50 km/h, 50–120, 120–200 ja üle 200, ning kõige rohkem, mida ta näitas;
- **pidurdus** 60 kuni 160 km/h;
- **tippkiirus**: koht, kus see lakkas kiirenemast täisgaasil sekundi jooksul sirgel. Sõidetud sirgel, mitte pikal kurvil, mis sõideti tasaselt, kus auto kulutab kiirust iga võimsuse juures. Kui ükski sirge ei olnud piisavalt pikk, näitab tema tõmme kiireimal kohal, kui kaugel ta oli. Rohkem kui ringid näitavad, ei loeta: võimsuse sõltuvus kiirusest takistuse vastu sobitades pani tavalise auto 100 km/h oma tegelikust tippkiirusest kaugemale, sest käigukast ja piiraja lõpetavad auto tõmbe palju varem kui takistus.
- **tagumise kaotus**: mitu korda ring libises üle 10° triivi (lahtisel pinnal 20°), kui roolipööre oli kurvi vastas ja auto püüti vastuvuhtimisega tagasi; mitu neist algas gaasil ja mis osast haardest need algasid. Auto, mida sõidetakse tahtlikult natuke külje peal, ei kaota midagi; see, mida tuleb püüda, kaotab. Loetakse igale autole ühtemoodi, nii et kahte autot saab võrrelda;
- **tasakaal**, kui ringidel on libisemisnurgad: esi vs tagumine piiril.

**Autode võrdlus** paneb autod kõrvuti: tabel ja iga auto kohta lause, mis ütleb, mis ta on teise vastu ("X kiirendab paremini, aga ei saa nii kõvasti pöörata, vajab pidurdamiseks kauem ja kaotab tagumise kergemini"). Samuti iga selge erinevus (4% haardest, 5% tõmbest või pidurdusest, 4 km/h tippkiirusest, tagumine, mis püütakse vähemalt kord ringi kohta rohkem ja pool korda sagedamini), ning kuidas kumbagi sõita. Ühe auto korral ütleb see, mis see auto on.

**Igas kurvis**, kui ringid on eri autodes, ütleb leid, mida autod sellest otsustavad, ja kuidas sellest autost parimat võtta:

- **läbi keskosa**: teise auto joonel lubab selle auto haarus `v_teine · √(haarduvus_minu / haarduvus_teine)`. Kui ring seda kandis, on vahe auto, ja ükski pidurdamispunkt seda ei muuda. Seda öeldakse ja kurv pannakse autole, mitte juhile. Kui ring kandis vähem, on ülejäänu kättesaadav, ja öeldakse, kui palju. Siis seda, kus aega saab võita: sirgele või autole, mis tõmbab rohkem, pärast tippu. Pidurda sirgelt, pööra hiljem, saa see varakult väljumise suunas. Muidu, kõige laiem raadius, mida tee lubab, sest suurem raadius on ainus viis rohkema kiiruseni ilma rohkema haardeta;
- **tagumine, mis lahti läks**: siin, autos, mis kaotab selle kergemini kui teine: mida selle autoga teha, gaasi, mis antakse sisse nagu ratas lahti tuleb, või pidur, mis vabastatakse õrnalt ilma kurvi keskel gaasi võtmata, sõltuvalt sellest, kuidas tema libisemised algavad;
- **järgnev sirge**: mida teise auto tugevam tõmme samalt kiiruselt võttis ja kus see auto sirgel tõmbe otsa sai;
- **varasem pidurdamispunkt** autos, mis pidurdab vähem kõvasti.

Ring, mis libises läbi kurvi keskosa (üle 10° triivi asfaltil), oli oma haardest üle, mitte sellest puudu: talle ei öelda kunagi, et tal oleks seal haaret üle. Ja kui auto tagumine on selles ringis lahti läinud väiksema külgkiirenduse juures, kui kurv nõudis, ütleb "haarust üle" öelda väikeste sammudena seda leida.

### 6. Auto juhtimine: lukud, rattalibisemine, libisemised ja nihked, löögid ja kokkupõrked {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Iga ringi loetakse ka selle järgi, kuidas autot juhiti: kus ratas lukustus, kus veoratastel pöörles, kus tagumine välja astus, kus esi lendas laiale. Need on vead, mida üksi aeg ei nimeta. Kolm asja hoiavad selle paigal mängude ja pindade lõikes.

**Kus haare lõpeb, mõõdetakse auto enda sõidust.** Insenerid seavad lukustumise läve iga auto kohta libisemisele, mis andis kõige rohkem aeglustust (MoTeC kanalid OptimumG pidurdusseerias kasutavad ühe auto puhul -0,07), mitte raamatuväärtusele. Raamatuväärtused erinevad igatahes: jõud tipneb lubjal 5–20% libisemisel olenevalt rehvist ja mudelist, lumel 6% või 20–60% olenevalt allikast, ja ükski allikas ei anna killustikule ühte väärtust. Mängud skaleerivad libisemist veel erinevalt: Forza oma on "normaliseeritud", nii et üle 1 on haarde kaotus, kuid auto pidurid võivad anda parima tulemuse palju alla või palju üle selle, ja tavalised pidurdustsoonid võivad minna üle 1. Seega iga auto kohta, kõigi tema laaditud ringide üle, grupeeritakse tehtud jõud libisemise järgi, mida ta sõitis: aeglustus vs ratta libisemissuhe sirgjoonelisel pidurdamisel, kiirendus (osana sellest, mida auto sel kiirusel teeb) vs veorattad libisemine, kurvihaarde (osana auto haardest sel kiirusel) vs iga telje libisemisnurk. Piiriks on libisemine, mille taga jõud on langenud 8% parimast. Kõver, mis andmetes kunagi ei lange, nagu Forza Horizoni pöörde- ja veojõud, ei oma piiri, ja pelk libisemine seal midagi ei märgi. Liiga väikese andmehulga korral on piir poolteist korda nimilist tippu.

**Maapind on teada iga proovi kohta**, kui mäng seda ütleb. Forza raputab rehve killustikul, mullal ja rohul (vähe proove asfaldiringil, palju mullal ja maastikusõidus), Trackmania nimetab materjali iga ratta all, ja ralli lõigu maapind leitakse nii, nagu jaos 11 ütleb. Kõverad, triivi harjumused ja lävendid on lahus asfaldi ja lahtise pinna jaoks.

**Iga sündmus asetatakse teise ringi vastu samal vahemaal.** Killustikul, lumel, triivirohkes arkaadis on libisemine see, kuidas kurv sõidetakse: optimaalse juhtimise uuringud leiavad asfaldil "madala triivi" lahendused ja lahtisel pinnal "agressiivsed, kõrge triivi, isegi vastupidise roolipöördega" lahendused, ralli andmed näitavad rehve "hästi mittelineaarses piirkonnas", ja ratta lukustamine väga lahtisel pinnal võib auto isegi kiiremini peatada. Seega sündmus, mida ka teine ring tegi, 80% või rohkem, on see, kuidas kurv sõidetakse, mitte viga. Sündmus, mida teine ring ei teinud, on viga ainult siis, kui see maksis aega: kaotatud aeg algusest vahetult enne seda kuni 40 m pärast seda. Viga, mis selgitab kurvi kaotusest 40% või rohkem, saab selle kurvi põhjuseks.

Tuvastamise lävendid, teise ringi test, löögid ja kokkupõrked ning nõuandetekstid: [Sõiduki juhtimise sündmused](race-control-events.md).

### 6b. Palju ringe: raja statistika {#b-many-laps-the-courses-statistics}

Klasside võrdlus, mis loetakse veaks, statistika ja vigade kaart: [Raja statistika](race-course-statistics.md).

### 7. Sõidetud joon {#the-driven-line}

Iga ringi ja kurvi kohta, ainult asukohtade põhjal: kus ring hakkas pöörama (viiendik tema kitsaimast kõverusest), tema kitsaim raadius (üle ±8 m), keskmine raadius esimesel ja teisel poolel tema suuna muutusest, ja nii edasi:

- **kuju**: kitsaim raadius jagatud keskmisega alla 0,55 on V, üle 0,75 on U;
- **tipp**: väljumise raadius jagatud sisenemise raadiusega üle 1,25 on hilja, alla 0,8 varakult;
- **kiiruse tipp**: kui tema aeglaseim punkt on rohkem kui 15 m enne pöörde poolt, on aeglane sisse, kiire välja; rohkem kui 15 m pärast, aeglustub ta veel keskmise järel.

Teise ringi vastu: kui palju sees või väljas ta sõitis sisse pööramisel, läbi kõige kitsama osa ja seal, kus mõlemad olid tasasel, ning kus kumbki sisse pööras. Iga leid lõpeb joonega, mis sobib ringi auto jaoks selles kurvis (sellest, kuhu kurv viib, ja auto mõõdetud võimsus-haardest, allasurvest ja veosüsteemist), ja sellega, kas ring sõitis seda nii. Tabel "Kurv kurvi haaval" loetleb kiireima ringi igas kurvis koos tema joone kujuga, ja parimad kurvid kokku pandud.

### 8. Kaks kaarti {#two-maps}

- **Kus**: rada värvitud `dΔt/ds` järgi võrdlusringi vastu, punane seal, kus aega kaotatakse, roheline seal, kus võidetakse.
- **Miks**: iga kaotus joonistatud sinna, kus on tema põhjus, värvitud põhjuse rühma järgi – pidurdamine, sisenemine, väljasõit, sirge, auto – ja kallima kaotuse puhul laiem.

### 9. Kordus {#replay}

Üks kell, kolm viisi, kuidas see muutub iga ringi enda ajaks: stardijoonelt, joondatud (iga ring jõuab rajal ühe punkti samal hetkel, siis lastakse lahti) ja kõrvuti (iga ring peetakse võrdlusringi vahemaal).

### 10. Millises suunas maailm on {#which-way-round-the-world-is}

Vaataja maailm on parempoolne, Y üles. Mäng vasakukäelise maailmaga (seas Forza) tuleb selles peegeldatuna: iga paremkäe kurv joonistatakse vasakukäe kurvina, nii kursus kui ringid. Ringid ütlevad selle ise: positiivne roolipööre on igas adapteris paremale, ja kurvi väliskülje vedrustus surub kokku. Seega pakub sõiduvaade selle parandamist, ja **Kaamera ja stseen → Pööra maailma telg ümber** teeb seda: X, Y või Z joonistatakse tagurpidi. Muutub ainult joonistus, peegeldus on vaatemaatriksisse volditud. Kaamera lendab joonistatud maailmas, ja andmed, analüüs ja iga koordinaat, mida tööriistad näitavad, jäävad mängu enda omaks. Analüüs nimetab kurve vasakuks või paremaks sama mõõtmisega.

### 11. Ralli: libisemine, vasak jalg, õhk {#rally-the-slide-the-left-foot-the-air}

Ralli lõik ei ole ring, mida sõidetakse kehvemal haardel. Killustikul ja lumel on libisemine see, kuidas kurv võetakse: auto pööratakse sisse, nihutades kaalu – "pidurdamine viib auto kaalu ette ... esirehvid saavad haaret, tagarehvid kaotavad haarde ja auto pöördub kurvi sisse libisedes", ning seejärel tagasi gaasile, kui ta on "joondatud suunas, kuhu tahad minna" ([DirtFish: kuidas pidureid kasutada](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Vasak jalg teeb pidurdamise, nii et gaasi ja pidurit saab üksteise vastu mängida, käsipidur pöörab auto kitsastes kurvides ([RallySport Ontario: rallisõit, põhitõed](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), ja auto lahkub maapinnast. Jagu 6 loeb libisemisi juba teise ringi vastu; need reeglid katavad ülejäänu.

- **Maapind.** Mida ring ütleb (`meta.surface`, ralli salvestajate `--surface`), siis ürituse nimi: asfaldirallid (Hispaania, Horvaatia, Kesk-Euroopa, Saksamaa, Jaapan, Korsika, Ypres), talvised (lumi), Monte asfaltlõigud lume ja jääga peal (segatud), siis see, kuidas autot sõideti. Rally2 auto külgpiir on 0,7–0,9 g killustikul ja 1,3–1,4 g asfaltil ([grenzbereich, viitväärtused](https://github.com/GitCrush/grenzbereich)), ja killustikul sõidab ta palju rohkem triivi (jagu 6). Seega lõik, kus auto tõmbas 10 m/s² või rohkem (95. protsentiil, kiirusel, maapinnal), mediaanse triiviga alla 6 kraadi igal kohal, kus ta kurvis 70% sellest piires, on asfalt; kõik muu või liiga vähe, et öelda, on lahtine pind.
- **Mida auto suudab, sellel pinnal, millel ta seda tegi.** Haarre, pidurdamine ja tõmme (jagu 5) mõõdetakse asfaltil ja lahtisel pinnal eraldi, kui ringid sõitsid kummalgi vähemalt viiendiku proovidest, ja iga kurv hinnatakse maapinnaga auto all tema aeglaseimas punktis. Õhus olevad proovid ja 0,3 s pärast maandumist jäetakse välja kõigest, mis mõõdab autot: ümbrikud, rehvikõverad, lukud ja rattalibisemine. Maandumine raputab auto üle kõige, mida tema rehvid suudavad, ja õhus pööranud rattad ei ole rattalibisemine. Allasurvet lahtisel pinnal ei hinnata, sest lõigu kiired ja aeglased osad on erinevad teed.
- **Vasaku jala kerge puudutus ei ole pidurdus.** Pidurdamise kerge puudutus, kui gaas on veel pooleni või rohkem, mis kestab alla 15 m, paneb auto paika või pöörab selle; kus ring alustas kurvi pidurdamist, on esimene pidurdus, mille juures gaas maha võeti, või mis kestis kauem.
- **Auto pööratud sisse minnes.** Iga ringi ja kurvi kohta, suurim triivinurk pidurdamisest kuni 5 m pärast aeglaseimat punkti. Lahtisel pinnal, kui ring pööras autot 8 kraadi või rohkem vähem kui teine (kes pööras 12 või rohkem) ja sõitis gaasil või tasaselt hiljem, **pööras auto vähem**: nõuanne on võtta gaas või kergelt vasaku jala pidur, kui auto pöördub, nii et tagumine tuleb ringi – teise ringi käsipiduri punktiga, kui tema seda kasutas, või käsipiduriga kurvis, mis on aeglasem kui 54 km/h – ja olla sihis väljumise poole enne tippu. Kes pööras seda 12 kraadi või rohkem teisest rohkem ja sõitis ikka gaasil hiljem, **pööras liiga palju**: see tuli sirgeks ajada enne, kui võimsus sai minna. Kumbki on kurvi põhjus väljumisel pärast auto juhtimise viga.
- **Õhk.** Lend, mis on teise ringi omast 0,2 s või rohkem pikem ja maksis aega alates 10 m enne õhkutõusu kuni 40 m pärast maandumist (või kurvi lõpuni), on põhjus, kui see selgitab 40% või rohkem kurvi kaotusest, ja järgmine kurv, mis saabutakse aeglasemalt, ütleb seda. Õhus ei saa auto pöörata, pidurdada ega sõita. Nõuanne hoiab gaasi peal õhkutõusul – "ära õhkutõusul gaasilt tõuse", mis langetab nina – ja võtab tipu natuke aeglasemalt või kerge pidurduse abil, nii et auto jääb madalaks ([DirtFish: kuidas rallit hüpata](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Kompleksid kuni kolme kurviga.** Käänuline lõik, mida ei sõideta kunagi tasaselt, ei ole üks pikk kompleks: pärast kolme kurvi algab uus.

`src/race/rally.test.ts` hoiab analüüsi kõigi nende järgi lihtsa mudeliga sõidetud lõikudel: auto, mis pöörati vähem ja gaasi peale hiljem, pikem lend, vasaku jala puudutused, käänuline lõik, asfalt versus killustik.

## Andmed ja mida iga allikas lubab {#data-and-what-each-source-allows}

| Allikas | Sagedus | Kanalid | Lubab |
|---|---|---|---|
| FH Companioni ringifailid | ~5 m | asukoht, kiirus, gaas, pidur, roolipööre, külg-/pikikiirendus, käik | kõike peale auto juhtimise, mis vajab kõrvuti olevat telemeetriat |
| FH Companioni `.tele.gz` iga ringifaili kõrval | mängu 64 Hz (salvestaja, mis hoiab iga paketti, kirjutab umbes 110 sekundis; kordused jäetakse ära) | Forza kogu Data Out: iga ratta libisemissuhe, libisemisnurk, koondlibisemine, pöörlemine, vedrustus, pinna vibratsioon; auto raamis kiirus; pöörlemiskiirus | kõike, sealhulgas auto juhtimist |
| Forza Data Out, salvestatud `heat3d_capture telemetry` abil | 60 Hz | kõik eelmine, plus iga ratta kohta: rehvi temperatuur, libisemissuhe, libisemisnurk, koondlibisemine, vedrustuse käik, rattakiirus, vibratsiooniriba; RPM, võimsus, pöördemoment, pöörlemiskiirus | kõike |
| Assetto Corsa, ACC, AC EVO, AC Rally (jagatud mälu, `heat3d_capture telemetry --game ...`) | 60–333 Hz | ülehulk: rehvi südamik ning sise-, kesk- ja välisosa temperatuurid, rõhud, pidurite temperatuurid, rattakoormused, kallak, libisemissuhe ja -nurk; auto raamis kiirus; ABS ja TC töötavad (ACC, EVO, AC Rally) | kõike |
| iRacingi `.ibt`, loetud otse | 60 Hz | asukoht GPS-ist, pedaalid, roolipööre, g, pöörlemine, iga ratta kere temperatuur, amortisaatori läbivajumine, rõhk, kulumine | kõike; auto juhtimine triivinurga järgi (tema pööre sõidusuuna vastu) ja roolipöörde järgi, libisemist ei ole (ei logita) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | iga kaader; 100 Hz | asukoht, maailma kiirus ja auto teljed, iga ratta kontaktpunkti kiirus ja vedrustus, pedaalid, roolipööre, lõigu kell ja pikkus | kõike; libisemine ja triivinurk tuletatud |
| Richard Burns Rally (NGP UDP) | iga füüsikasamm | asukoht, auto enda kiirused, iga ratta vedru läbivajumine ja jõud, pedaalid | kõike, välja arvatud rattalibisemine |
| BeamNG.drive (`heat3d` protokolli mod) | kuni 100 Hz | asukoht, maailma kiirus ja teljed, iga ratta pinnakiirus, pöörlemine, koormus ja kontakt maaga | kõike; libisemine ja triivinurk tuletatud |
| Trackmania (Openplanet plugin) | iga kaader | asukoht, esi- ja küljekiirus, pedaalid (pidur sees/väljas), roolipööre, iga ratta libisemistegur ja lahtine pind, õhus | kõike; triivinurk küljekiirusest |

Iga allikas muudetakse üheks ringivorminguks, `heat3d-lap`, mille kanalitel on kanoonilised nimed (`speed`, `throttle`, `tireTemp[FL]` ...). Autoglüüf ja graafikud joonistavad kõik kanalid, mis ringil on.

## Allikad {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Lõikude ajad: time variance kujud](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (vahemaa-domeeni delta)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacingi ringianalüüsi juhend](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: sessiooni ringid](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: sõidujoonte analüüs](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: teoreetiline parim sektoritest](https://overcut.gg/)
- [Track Titan: kuidas telemeetriat analüüsida](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: pidurdusanalüüs, lukustumise ja stabiilsuse KPI-d (sept 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: gaasil (jaan 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: võidusõidujuhtide põhilised tulemusnäitajad (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Rehv-tee hõõrdemudelid ja optimaalne libisemine (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: rehv-teekatte hõõrdumine, libisemine tipul lumel ja jääl](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: rehvide hõõrdetegurid, tipp ja libisemine](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: pikisuunalised jõud](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: külgjõud](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Sõiduki stabiilsus, külgliugumise piirid (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rallisõit suure külgliuguga (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Minimaalse aja rallimanöövrid (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC viitepöörlemiskiirus (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Alastuuri ja ülestuuri tuvastamine roolipöörde ja pöörlemise võrdlusega (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: roolinurk, Ackermann ja alastuuri gradient](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: matemaatilised kanalid (Kus, koondg)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: alastuuri ja ülestuuri vidin](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Kadentspidurdus: lukustumine väga lahtistel pindadel](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: killustikuralli andmelogimine](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: kuidas pidureid kasutada](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: kuidas rallit hüpata](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rallisõit, põhitõed](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: rallisõiduki dünaamika, viitväärtused](https://github.com/GitCrush/grenzbereich)
- [Trackmania kiiruse-triivi treeneri plugin (konstandid)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania kiiruslibisemise kirjeldus](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: V-joon](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (väljasõidu kiirus vs miinimumaeg)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: ringiaja parandamise järjekord](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: kolm kurvitüüpi](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: kurvide järjestamine](https://driver61.com/uni/prioritising-corners/)
- [Driver61: erinevad kurvid, erinevad tehnikad](https://driver61.com/uni/different-corner-technique/)
- [Driver61: kurvi kuus faasi](https://driver61.com/uni/corner-phases/)
- [Driver61: haarne](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (väljavõte)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: mis on hoogauto](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [Hoog üle hobujõu arutelu](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Math on the racing line, osa 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, osa 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD tehnika](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD kurvides](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: pöördetehnika](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maksimaalne pöördekiirus](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Globaalne minimaalse aja trajektoori planeerimine, arvestades kõverust ja vahemaad](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: globaalne sõiduraja optimeerimine](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: veeremistegur](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Hõõrdeering](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g diagramm](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Pikisuunaline libisemine](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Alastuur, ülevaade](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out dokumentatsioon](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: veoga piiratud kiirendus](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: võimsusega piiratud kiirendus](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO jagatud mälu](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally telemeetria lugeja](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacingi IBT parsimine](https://github.com/teamjorge/ibt)
