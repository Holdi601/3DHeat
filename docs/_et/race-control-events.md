---
title: "Sõiduki juhtimise sündmused"
parent: "Sõiduanalüüs"
nav_order: 54
lang: "et"
source: "race-control-events.md"
source_hash: "18fe9a0507bc"
translated: true
outdated: false
---

# Sõiduki juhtimise sündmused

Vaataja vaatab, kuidas iga ring sõideti, ja märgib kohad, kus juht pani auto libisema, keerlema, millegi vastu põrkama või raiskas haarde. See on kasulik, sest viga, mis maksis aega, on kõige kiiremini parandatav.

![Jaotis Auto valitsemine: kui sageli iga ring lukustas ratta, keerles või vajus laiaks, ning vigade loend, millest üks on avatud](../assets/img/en/race-control-table.webp)

## Lihtsalt öeldes {#in-plain-words}

- **Blokeerumine**: pidurdad nii tugevasti, et ratas seisab ja libiseb. Auto peatub halvemini ega saa pöörata.
- **Buksimine**: vajutad gaasi nii tugevalt, et veorattad keerlevad kiiremini, kui auto liigub. Kaotad tõmbejõu.
- **Ülejuhitavus**: auto tagaots libiseb laiali. Kui see keerab täies ringis, on see **spinn**.
- **Alajuhitavus**: auto esiots libiseb laiali („vajub laiaks“). Rooli rohkem keeramine ei aita.
- **Löök** ja **allakukkumine**: auto puudutas midagi (löök on koputus või kriim, allakukkumine on tugev).
- **ABS**, **TC**: auto enda abilised, mis töötavad blokeerumise ja buksimise vastu. Need ei ole vead.

## Auto valitsemise jaotis (mida näed) {#the-car-control-section-what-you-see}

Valitud ringi puhul näitab jaotis seda, mida ringid parasjagu sisaldavad. Kui rehvide libisemist ega triivinurka pole, näitab ta seda, mis veel leitakse, mitte midagi (vt allpool).

**Tabel**: üks rida iga liigi kohta, mida kumbki ring näitab – Blokeerunud rattad, Buksimine, Tagaots libiseb välja (ülejuhitavus ja spinnid), Esiots vajub laiaks, Avariid, Löögid, ABS sekkub, Veojõukontroll sekkub, Käsipidur, Õhus. Iga lahter on „arv · sekundid“ valitud ringi ja selle ringi kohta, millega seda võrreldakse. Ning *Suurim triivinurk*, kui triivinurk on olemas (kõige suurem maapinnal).

**Loend**: valitud ringi vead, mida teine ring ei jaga ja mis maksavad vähemalt 0,02 s, kallimad ees, kõige rohkem 12. Igaühel on pealkiri, hind ja oma liigi silt. Klõpsa ühel, et lugeda selle vihjet, joonda autod 40 m enne seda ja vaata uuesti. **Ka see, mida mõlemad ringid seal tegid** lisab iga vea, ka ühiste (silt „mõlemad tegid seda“, hind „—“ alla 0,01 s). Kui vigu pole: „Rehvidega ei teinud {name} midagi, mis oleks maksnud aega ja mida {other} poleks samuti teinud.“

**Vihje selle all** ütleb, millega tuvastamine nägi: „Iga ratta libisemise ja libisemisnurga ning auto triivinurga põhjal.“ (või „Iga ratta libisemise ja libisemisnurga põhjal.“, „Iga ratta libisemise ja auto triivinurga põhjal.“, „Iga ratta libisemise põhjal.“ või „Ainult auto triivinurga põhjal – neis ringides pole rehvide libisemist.“). Samuti ütleb see, mille jaoks piirid mõõdeti (asfalt, lahtine pinnas, segapinnas: üle 80% lahtisi proove on lahtine pinnas, alla 20% asfalt), millise ringiga sündmused paigutati ja kuidas kulu arvestatakse.

Kui **rehvide libisemist ega triivinurka pole** (FH Companion ring ilma oma telemeetriata), näidatakse tabelit ja loendit ikkagi. Vihje ütleb: „Neis ringides pole rehvide libisemist ega triivinurka, seega ei saa blokeerumisi ega buksimist eristada. Endiselt leitakse: alajuhitavus, rooli ja raja võrdlusest; löögid ja allakukkumised, kiiruse ja kiirenduse põhjal.“ Libisemised pöörlemiskiirusest nimetatakse samuti, kui ringidel see on. Alajuhitavust nimetatakse ainult siis, kui on roolisisend. Lause libisemise ja triivinurga piiride kohta jäetakse ära. Teine vihje ütleb: „Forza Horizoni puhul vali iga FH Companion ringi kõrvale ka `.tele.gz` fail: see on täielik telemeetria, iga ratta libisemine 64 korda sekundis.“

Ringi **koguline** juhtimiskulu (kokkuvõtetes kasutatud) loeb kattuvaid vigu – blokeerumise ja libisemise, millest see algab, 40 m piires – üks kord, kalleima järgi klastris.

## Kuidas seda tuvastatakse {#how-it-is-detected}

Ülejäänud leht on reeglikogu: iga liik, iga piir.

Kood: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Põhjendus ja kirjandus on [meetodis](race-analytics.md).

## Liigid {#the-kinds}

| Liik | Tabeli rida | Viga? | Lühim, mis loeb |
|---|---|---|---|
| `lock` | Blokeerunud rattad | jah | 0,1 s |
| `wheelspin` | Buksimine | jah | 0,15 s |
| `oversteer` | Tagaots libiseb välja | jah | 0,2 s |
| `spin` | (loetakse koos tagaotsa libisemisega) | jah | 0,1 s |
| `understeer` | Esiots vajub laiaks | jah | 0,25 s |
| `crash` | Avariid | jah | - |
| `hit` | Löögid | jah | - |
| `abs` | ABS sekkub | ei | 0,2 s |
| `tc` | Veojõukontroll sekkub | ei | 0,2 s |
| `handbrake` | Käsipidur | ei | 0,1 s |
| `airborne` | Õhus | ei | 0,15 s |

Lühemad jooksud on müra (äärekivi, kühm, üks proov). Ruudustiku punktidest (iga 2 m), mis läbivad testi, ühendatakse jooksud kuni 2 punkti vahedega. Ainult **vead** võivad olla eksimused ja neil on hind. Teised on see, mida auto ja juht tegid.

## Mida iga test vajab {#what-every-test-needs}

### Tuletatud kanalid {#derived-channels}

Enne hindamist saab iga ring selle, mida tema mäng ei saada, kanoonilistel nimedel (mängu enda väärtus võidab alati):

| Kanal | Allikas |
|---|---|
| `bodySlip` (triivinurk) | autokaadri kiirusvektor, `atan2(latVel, abs(longVel))`, kui mäng seda saadab (alla 3 m/s on 0). Muidu pea­suund (mängu `yaw`, sobitatud sõidusuunaga märgi ja nihke järgi proovidest kiirusega üle 10 m/s, usaldatud ainult ringikujulise dispersiooni korral alla 0,05) võrreldes sõidusuunaga (asukohad vähemalt 2 m vahel), kiirustel üle 3 m/s |
| `yawRate` | `yaw` muutus ajas, kui on pea­suund, aga mitte pöörlemiskiirust |
| `airborne` | iga ratta maapinnakontakt on väljas (≤ 0,5); muidu iga ratta koormus alla 5% oma mediaanist; muidu iga vedrustuse käik alla või võrdne 0,02-ga (täielikult välja sirutatud). Üks juhuslik proov ei ole lend |
| `slipRatio.<W>` | `(ratta pinnakiirus - auto kiirus) / auto kiirus` üle 3 m/s, kus mäng saadab ratta pinnakiirusi. Või ratta pöörlemine × veerematkimise raadius, mõõdetud ringil: mediaan `kiirus / pöörlemine`, kui veereb otse (kiirus üle 10 m/s, gaas alla 0,3, pidur alla 0,05, abs(pikikiirendus) alla 3 m/s², mitte õhus; iga proov üle 10 m/s, kui neid on alla 20). Vastu võetud 0,1 kuni 1 m vahel. Märgitud `physical` |
| `loose` | Forza pinna rumble vähemalt 2 rattal (> 0,001) vähemalt 0,33 s (äärekivi on lühem), alla 1 s vahed ühendatud |

### Maapinnal ja rahunenud {#on-the-ground-and-settled}

Midagi ei hinnata õhus ega **0,3 s** jooksul pärast maandumist. Vedrustus jõuab põhja ja kiirendused hüppavad, mis ei ole haarde, pidurduse ega jõu näitaja. Proov peab ka **liikuma**: kiiremini kui 5 m/s.

### Maapind {#the-ground}

Iga proovi maapind on **lahtine pinnas**, kui ringi `loose` kanal nii ütleb (Forza pinna rumble, Trackmania rataste materjalid). Muidu on see ringi pind (vt [distsipliin ja pind](race-loading-laps.md#discipline-and-surface)): asfalt või muu lahtine pinnas. Kõverad, triivi harjumused ja piirid on asfaltil ja lahtisel pinnal eraldi.

### Libisemine kui mitu rehvi nimipiirist {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Mängud skaleerivad libisemist erinevalt. `meta.slip` ütleb, kuidas, ja iga libisemine jagatakse skaalaga, nii et umbes 1 on rehvi nimipiir:

| `meta.slip` | Tähendus | Jagatakse |
|---|---|---|
| `peak` | mäng normaliseeris: üle 1 haarde kaob (Forza Data Out) | 1 |
| `scaled` | füüsiline libisemine jagatud asfalti piiriga (Kunose salvestaja) | pinna nimipiir üle asfalti oma |
| `index` | 0..1 libisemismõõt (Trackmania SlipCoef) | 0,5 |
| `physical` (või tundmatu) | libisemise suhe murdosana, libisemisnurk radiaanides | pinna nimipiir |

Nimipiirid, kui midagi paremat ei ole teada:

| Pind | Libisemise suhe | Libisemisnurk |
|---|---|---|
| asfalt | 0,12 | 8° |
| segane | 0,18 | 12° |
| lahtine (kruus) | 0,25 | 15° |
| lumi | 0,25 | 15° |
| jää | 0,10 | 6° |

### Kus haarde lõpeb: iga auto rehvikõverad {#where-grip-ends-each-cars-tyre-curves}

Koht, kus rehv enam rohkem ei anna, **mõõdetakse iga auto kohta** kõigilt koormatud ringidelt (`measureTyres`), asfaltil ja lahtisel pinnal eraldi:

| Kõver | Proovid (kiirus üle 10 m/s, rahunenud, kiirendused alla 45 m/s²) | Libisemine (x) | Jõud (y) |
|---|---|---|---|
| pidurdus | pidur üle 0,3, käsipidur kuni 0,2, sõit sirgelt (külgsuunaline alla 30% kõige karmimast) | abs(nelja ratta keskmine libisemise suhe) | aeglustus |
| tõmme | gaas üle 0,8, pidur kuni 0,05, sirgelt, auto täisgaasi tõmme sellel kiirusel üle 0,5 m/s² | suurima juhitava ratta libisemise suhe | kiirendus osana selle kiirusel olevast tõmbest |
| esi | külgsuunaline üle 30% kõige karmimast, auto haarde kiirus üle 1 m/s² | suurim esi libisemisnurk | külgkiirendus osana selle kiirusel olevast haardest |
| tagumine | sama | suurim tagumine libisemisnurk | sama |

„Kõige karmim“ on ringi abs(külgkiirenduse) 99. protsentiil sellel pinnal (kogu pind, kui sellel on alla 50 proovi). Ajam otsustab juhitavad rattad (esirattad FWD, tagarattad RWD, kõik AWD; tundmatu: kõik).

Alates vähemalt **150 proovist** lõigatakse libisemine 6 kuni 14 võrdse arvuga vahemikku (üks iga 40 proovi kohta). Iga vahemiku jõud on tema ülemine kvartiil (mida rehv andis, kui juht küsis), silutud naabrite järgi. **Parim** on vahemik suurima jõuga. **Piir** on esimene vahemik pärast seda, kus jõud on langenud **8%** võrra. Kõver, mis andmetes kunagi ei lange, ei oma piiri (lõpmatu). Tipust üle sõit ei maksa selles mängus midagi ja ainuüksi libisemine ei märgi seal midagi (Forza Horizoni nurga- ja tõmbekõverad on sellised). Kui ühel pinnal on liiga vähe proove, kasutatakse teise pinna omi. Kui kokku on liiga vähe, kasutatakse **nimipiiri**: 1,5 korda nimipiir.

Igal autol on ka:

- oma **triivi harjumus**: triivinurga ülemine kvartiil seal, kus ta kurvi läbib vähemalt 60% kõige karmimast või rohkem (vajab 100 proovi);
- oma **roolimine kõvera kohta** (`steerGain`), iga 5 m/s kiirusvahemiku kohta: mediaan abs(roolimine) / raja kõverus, kui ta kurvi keerab kindlalt, kuid hästi oma haardest allpool (30–60% kõige karmimast, kõverus kitsam kui 400 m raadius, roolimine üle 0,02; 25 proovi vahemiku kohta). Raja kõverus on pöörlemiskiirus jagatud kiirusega, kus mäng seda saadab, muidu asukohtadest ±5 m.

## Tuvastamine liigi kaupa {#detection-kind-by-kind}

| Liik | Test (liikuvatel, rahunenud proovidel) | `peak` ja `limit` |
|---|---|---|
| **lock** | pidur üle 0,05, käsipidur mitte üle 0,2 ja mõne ratta libisemise suhe alla miinus pidurduspiiri | kõige negatiivsem libisemine (nimipiirist kordades); piir negatiivsena |
| **wheelspin** | gaas üle 0,2 (või gaasikanal puudub) ja juhitava ratta libisemise suhe üle tõmbepiiri | suurim juhitav libisemine; piir |
| **oversteer** (triivinurk) | triivinurk üle suurema pinna põhjapiiri ja 1,5 × auto triivi harjumus seal | suurim triivinurk, radiaanides |
| **oversteer** (libisemisnurgad, triivinurka pole) | suurim tagumine libisemisnurk üle tagumise piiri ja rohkem kui 0,25 üle suurema esimese | tagumine libisemisnurk (nimipiirist kordades) |
| **oversteer** (triivinurka pole, aga pöörlemiskiirus ja külgkiirendus on) | "hoiakukiirus" – abs(pöörlemiskiirus) miinus abs(külgkiirendus) / kiirus, üle 8 m/s – üle 0,2 rad/s, roolimine vastu pööret | rad/s; piir 0,2 |
| **spin** | ülejuhitavuse jooks, mille triivinurk tippus üle **60°** | nagu ülejuhitavus |
| **understeer** (libisemisnurgad) | ei libise, suurem esi libisemisnurk üle esipiiri ja rohkem kui 0,3 üle tagumise | esi libisemisnurk; piir |
| **understeer** (libisemisnurki pole) | kiiremini kui 12 m/s, ei libise, ei roolita vastu, külgkiirendus üle poole ringi karmimast (99. protsentiil), raja raadius kitsam kui 300 m ja roolimine üle **1,6 korra** selle, mida auto enda roolimine kõvera kohta ütleb, et rada nõudis | vajalik roolimine korda; piir 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` üle 0,5 | - |
| **handbrake** | `handbrake` üle 0,2 | - |
| **airborne** | `airborne` üle 0,5 | - |
| **hit**, **crash** | vt [Löögid ja allakukkumised](#hits-and-crashes) | löögi võetud kiirus |

Triivinurga põhjad pinna järgi: asfalt **7°**, segapinnas **10°**, lahtine pinnas ja lumi **15°**, jää **10°**. Need järgivad kirjandust: rehvi libisemisnurk saavutab asfaldil tipu 3–10° juures ja tavaauto kere libisemisnurga stabiilsuspiir on kuival asfaldil umbes 12°, samas kui ralli ja triiv sõidavad 30–50° juures ([Sõidu analüütika, allikad](race-analytics.md#sources)). Auto, mis libiseb rohkem iseenesestmõistetavalt (arkaadne rehvimudel, kruusaspetsialist), saab oma kõrgema läve oma ringidelt (1,5 × tema harjumus).

**Mis suunas auto pöörab** (pööre "vastu"): raja enda peasuuna muutus ±6 m jooksul (vähemalt 2 ruudustiku punkti). Kitsam kui 600 m raadius loeb pööramiseks. Parem või vasak sõltub sellest, kas maailm on peegeldatud. Roolimine on **vastu** pööret, kui abs(roolimine) on üle 0,05 ja märk on pöördega vastupidine. See on libisemine, mida **püütakse kinni** vastupidise rooliga.

**Pedaalid alguses** (`pedal`): *pidurdus*, kui pidur on üle 0,1; *gaas*, kui üle 0,3; *lahti*, kui gaas oli üle 0,5 8 ruudustiku punktis (16 m) enne; muidu *veeremine* (või kui gaasikanal puudub).

## Teise ringiga võrdluses {#laid-against-the-other-lap}

Iga sündmust hinnatakse selle ringi järgi, millega valitud ring selles lõigus võrreldakse (oma klassi parim; enda ringi puhul see, kes oma klassist oli lõigus kiireim):

1. **Kui kaugele teine ring läks** samal teel, ±8 m: teise ringi enda samad sündmused samast perekonnast (spinn loeb ülejuhitavusena, allakukkumine löögina) samades ühikutes, ilma lävedeta, kasutades teise auto rehvikõveraid.
2. **Ühine**, kui teine ring läks **80%** nii kaugele või kaugemale. See on, kuidas kurv sõidetakse, mitte viga. Mitte-vea liigid on alati „ühine“.
3. **Kulu** ühisele veale: aeg, mille valitud ring teise vastu kaotas 5 m enne sündmust kuni **40 m pärast** seda. Löögi või allakukkumise puhul kuni auto saab oma kiiruse tagasi (meetrid, mis kulub selle tagasivõtmiseks oma tõmbega, 40–400 m; ilma mõõdetud tõmbeta 5 m/s²). Ei ole kunagi negatiivne.
4. **Kiirus, mis anti ära** auto piirini: blokeerumise puhul aeglustus, mida auto näitab, et ta sellel kiirusel suudab, miinus see, mida ta tegi, liidetuna üle sündmuse. Buksimise puhul täisgaasi tõmme miinus see, mida ta tegi. Löögi puhul löögi võetud kiirus. Öeldakse, kui üle 0,5 m/s (1,8 km/h).

Viga, mis ei ole ühine ja maksab vähemalt **0,02 s**, on loendis ning võib saada nurga kaotuse põhjuseks (vt [Kurv-kurvilt analüüs](race-corner-analysis.md#car-control-faults-and-impacts)). [Rajastatistika](race-course-statistics.md) loeb ainult vigu **0,03 s** või rohkem, et mitme ringi peale kokku loetud viga oleks selge.

## Löögid ja allakukkumised {#hits-and-crashes}

`impacts.ts` loeb löögid ringi **enda proovidelt**, enne nende ümberpaigutamist. Löök on lõppenud sajandikega mõõdetavas ajas. Rehvid ei saa tekitada löögi jõude, seega mõõdetakse löök ringi enda auto järgi:

- **Tema haardumus `G`**: 99. protsentiil auto horisontaalsest kiirendusest `√(lat² + long²)` üle ringi, maapinnal ja kiiremini kui 5 m/s. Ilma kiirendussignaalita (või alla 3 m/s²) on see 15 m/s², tavalise maantee auto haardumus.
- **Lävi**: `max(1.8 G, G + 18, 30)` m/s².
- **Tabamusproov**: horisontaalne kiirendus on üle läve *ja* hüppab rohkem kui poole `G`-st eelmisest proovist; **või** kiirus langeb 0,1 s jooksul rohkem, kui lävi võtaks 0,1 s jooksul pluss 1,5 m/s. Ainult maapinnal ja rahunenud, ja ainult siis, kui auto sõitis kiiremini kui 5 m/s.
- Tabamusproovid 0,4 s jooksul on üks löök.
- **Enne / pärast**: kõrgeim kiirus 0,15 s enne; madalaim kuni 0,3 s pärast viimast tabatud proovi.
- **Ei ole löök**: kiiruse kadu ilma jõuta. Tipphorisontaalne kiirendus 0,1 s jooksul alla suuremate `G` ja 25 m/s² on mängu tagasikerimine või auto lähtestamine.
- **Allakukkumine**, kui see võttis **30 km/h** või rohkem või jättis auto alla poole oma kiirusest. Muidu on see **löök**: koputus, kriim mööda seina.
- **Suund**: kui pikikiirendus on suurem kui külgsuunaline ja negatiivne, siis *otsapidi*. Kui positiivne, siis *tagant*. Kui külgsuunaline on suurem, siis *mööda külge*. Ilma kiirendusteta otsapidi.

Mida auto suudab, mõõdetakse kõigi löökide välja jätmisega, 0,1 s enne kuni 1 s pärast neid (`struckMask`).

## Tekstid {#the-texts}

Iga sündmus öeldakse nii, et nimetatakse mõlemad ringid, koos kohaga (meetrid mööda viidet), kiirusega, millest alustati, sellega, kui kaugel üle piiri teise ringi vastu, ja vihjega. Vihje järgneb liigist ja sellest, mis mõõdeti:

| Sündmus | Vihje |
|---|---|
| blokeerumine, ainult esirattad | lukus esiratas ei saa rooli keerata: vähem survet tsooni ülaosas, lase see kurvi sisse maha |
| blokeerumine, ainult tagarattad | lukus tagaratas laseb autol pöörelda: pidura rohkem sirgjooneliselt, leevenda pööramisel; liiguta eesmist jaotust ettepoole, kui see kordub |
| blokeerumine, lahtine pind | lukus ratas kündab: pigista just enne lukustumist |
| blokeerumine, muidu | liiga palju pedaali haardumise jaoks: pigista järk-järgult |
| buksimine | lase gaas sisse, kui roolimine lahti tuleb; lühike vahetus, kus tõmme piirab (lahtisel pinnal: kõrgem käik pehmendab pöördemomenti) |
| spinn / ülejuhitavus | pedaali järgi: pidurduse all (liiga tugev pidurdus kurvis, liiga vara allavahetus), lahti (ülejuhitavus gaasi vabastamisel: hoia ühtlast gaasi), gaasil (liiga palju, kui on veel pööratud), ei ühtegi (sisse keeratud liiga kiiresti). „Püütud vastupidise rooliga“, kui roolitud vastu. Lahtisel pinnal või rallis: „mõni nurk on kiire viis ringi – teise ringi oma oli piisav“ |
| alajuhitavus | rohkem rooli ei aita, kui esi on juba ära läinud: sisene aeglasemalt, tõmba natuke pidurit, et esi koormuks, keera lahti. Lahtisel pinnal keera auto lahtiöötamise või vasaku jala kerge puudutusega |
| löök / allakukkumine | mööda külge: meeter varu maksab vähem kui kriimustus. Tagant: teine auto või tagurpidi libisemine. Otsapidi allakukkumine: pidura varem. Esiotsa koputus: midagi kergelt puudutatud. „X lõi seal samuti.“, kui ühine |

Trackmanias ütleb libisemine veel: alla umbes **400 km/h** (**300** lahtisel pinnal: muld, rohi, plastik) annab libisemine vähem tõmmet kui haardumine. Kõrgemal annab õige nurgaga kiirlibisemine kasu. See siin maksis aega, seega tema nurk oli vale.

## Mida iga allikas lubab {#what-each-source-allows}

| Ringid sisaldavad | Blokeerumised / buksimine | Ülejuhitavus / spinn | Alajuhitavus |
|---|---|---|---|
| ratta kaupa libisemise suhe ja libisemisnurk, auto kiirusvektor (Forza Data Out, AC mängud) | libisemisest | triivinurgast või tagumisest libisemisnurgast | libisemisnurkadest |
| ratta kiirused, maailma kiirusvektor (rallimängud, BeamNG) | tuletatud libisemisest | tuletatud triivinurgast | roolimisest kõvera kohta |
| pöörlemine ja pöörlemiskiirus, libisemist pole (iRacing) | - | triivinurgast (sobitatud pöörlemine vs. sõidusuund); hoiakukiirusest vastu-roolimisega ainult siis, kui pöörlemist ei saa usaldada | roolimisest kõvera kohta |
| ainult peasuund | - | peasuund vs. sõidusuund | roolimisest kõvera kohta |
| ainult FH Companion ringi fail (pöörlemist ega libisemist pole) | - | - | roolimisest kõvera kohta (on roolimine ja kiirendused) |

Löögid ja allakukkumised vajavad ainult kiirust (paremini kiirendustega), seega on need igal allikal. **Auto valitsemise** jaotis näitab, mida iga allikas lubab. Ainult FH Companion ringi failiga on tema alajuhitavused roolimisest ja löögid, ning vihje ütleb laadida `.tele.gz` ülejäänu jaoks.
