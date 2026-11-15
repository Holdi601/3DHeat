---
title: "Sõidukiprofiilid ja võrdlus"
parent: "Sõiduanalüüs"
nav_order: 56
lang: "et"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Sõidukiprofiilid ja võrdlus

Auto saab pidurdada, keerata ja kiirendada ainult nii tugevasti. Vaataja mõõdab, kui tugevasti, sinu enda ringidelt, nii et see ei ütle kunagi midagi, mida su auto teha ei suuda. See selgitab ka, kui suur osa kaotatud sekundist oli auto süü ja mitte sinu oma.

![Autod võrdluses: kaks autot kõrvuti oma haarde, pidurduse ja tõmbega](../assets/img/en/race-cars-compared.webp)

Analüüs ütleb ringi kohta ainult, et tuleb pidurdada kõvemini, kanda rohkem kiirust või kiirendada varem seal, kus auto on näidanud, et saab; ja see võtab kaotusest välja selle, mida autod ise seletavad. Seetõttu mõõdetakse iga auto piire (tema *ümbrik*, allpool) ja iseloomu (tema *profiil*) iga tema laaditud ringi põhjal. See leht käsitleb ümbrikut, profiili, jaotist **Autode võrdlus** ja seda, mida autod iga kurvi puhul otsustavad.

**Üks auto** = ringid sama auto numbriga (või nimega, ilma numbrita) ja sama
jõudlusindeksiga: teine seadistus on teine auto.

## Ümbrik: mida auto suudab igal kiirusel {#the-envelope-what-the-car-can-do-at-each-speed}

Auto kohta, kõigilt tema laaditud ringidelt, **5 m/s kiirusvahemikes** (24 vahemikku, kuni 120 m/s). Õhus olevad proovid, maandumise järel 0,3 s rahunemine ja iga tabamuse eelne 0,1 s kuni 1 s pärast jäetakse välja; kiirendused 80 m/s² või rohkem ignoreeritakse (rohkem, kui peab mis tahes allavajutusjõuga auto).

| Ümbrik | Proovid | Väärtus vahemiku kohta | Vajab |
|---|---|---|---|
| **külgmine haarde** | külgkiirendus **hoitud pool sekundit** (absoluutväärtuse keskmine tsentreeritud 0,5 s aknas), ainult kus auto kurvis sõitis: vähemalt kolmandik kõigi selle 99. protsentiilist | 95. protsentiil | 6 proovi |
| **pidurdus** | pidur üle 0,3; pikikiirendus kui iga proovi ja tema kahe naabri mediaan | aeglustuse 95. protsentiil | 4 proovi |
| **täisgaasi tõmme** | gaas üle 0,95, pidur alla 0,05; sama kolme mediaan | 90. protsentiil | 4 proovi |

Miks hoitud pool sekundit: äärekivi, libisemise tagasipõrge ja auto püüdmine teevad kõik külgkiirenduse hetkeks piigiks, ja auto, mis seda sageli teeb, paistis haardekam, kui ta on. Miks kolme mediaan: viiemeetrise sammuga on üks proov kaugel, ja üksik piik on äärekivi, mügar või sein.

Ümbriku lugemine kiirusel interpoleerib vahemike keskpunktide vahel ja võtab lähima andmetega vahemiku, kui vahemik on tühi.

**Kahel tüüpi pinnal.** Kui auto ringid sõitsid vähemalt viiendiku oma proovidest nii asfaltil kui lahtisel pinnal, hoitakse iga pinna jaoks eraldi ümbrikut ning iga kurvi hinnatakse selle pinna järgi, mis auto all on tema kõige aeglasemas punktis.

**Ristumine.** Kiirus, millest tõmme langeb nagu `1/v` (võimsuspiiratud), mitte ei hoia tasemel (haardepiiratud): esimene vahemik, mille `a·v` on 15% piires kõrgeimast nähtud `a·v`-st.

## Profiil: mis tüüpi auto see on {#the-profile-what-kind-of-car-it-is}

`profile`, samadest ringidest (proovid maapinnal, ilma tabamuseta, kiiremini kui 8 m/s):

| Mõõdik | Kuidas |
|---|---|
| **hoitud haarde** (m/s²) | hoitud pool sekundit külgkiirenduse 95. protsentiil |
| **tõmme** kuni 50 km/h, 50–120, 120–200, üle 200 (m/s²) | ümbriku täisgaasi tõmbe keskmine vahemikes 3–14, 14–33, 33–56 ja 56–90 m/s, kiirustel, mida auto saavutas (kuni tema kiireim + 2 m/s), vähemalt kolmest 1 m/s sammust; ning kõige, mida ta näitas, ja kus |
| **pidurdus** (m/s²) | ümbriku pidurdus keskmistatud vahemikus 60–160 km/h (16,7–44,4 m/s), vahemik, mida võrdlus nimetab |
| **kiireim** | kõrgeim kiirus, mille ta saavutas |
| **tippu jõudis** | kus ta lakkas täisgaasil sirgel kiirust juurde võtmast (allpool) |
| **veel tõmbab oma kiireimal** | ümbriku tõmme tema kiireimal kiirusel: kui palju tal veel oli minna |
| **tagumine püütud, ringi kohta** | kordi ringi kohta, mil ta libises ja tuli püüda (allpool) |
| **osa gaasil** | nendest see osa, mis algas gaasiga üle 0,5 ja ilma pidurita |
| **laseb lahti kohas** | mediaan hoitud külgkiirendusest 0,15 s enne iga libisemise algust, osana haardest |
| **üle 10° triivi kõva kurvis** | proovidest, mis kurvis sõidavad vähemalt 60% oma haardest, osa, mis libiseb (10° asfaltil, 20° lahtisel); vajab 30 proovi |
| **mediaantriiv** | samadest proovidest |
| **tasakaal** | esi miinus tagumine libisemisnurk (nimipiiri kordades), kus kõvasti kurvis ja ei libise, vähemalt 30 proovi keskmine: + laiaks vajub |
| **pind** | üle 80% lahtiste proovide: lahtine; alla 20%: asfalt; muidu segane |

**Tippu jõudmine.** Proov loetakse, kui sekund selle ümber (±0,5 s, vähemalt 0,9 s andmeid) oli
kõik täisgaasil (> 0,95, ilma pidurita), maapinnal, sõidetud **sirgelt** (|külgsuunaline| alla suurema 4 m/s² ja
veerandi selle haardest), kiirust juurde võttes alla **0,35 m/s²**, kiiremini kui 25 m/s ja 90% piires ringi kiireimast –
täisgaas mäest üles või pika kurvi läbi lakkab samuti kiirust juurde võtmast, palju alla auto tippkiiruse. Kui kõigil ringidel kokku on vähemalt **üks
sekund** sellist platood, on nende kiiruste mediaan koht, kus ta tippu jõuab. Muidu tippkiirust pole: kus ükski sirge polnud piisavalt pikk, ütleb
*veel tõmbab oma kiireimal*, kui kaugel ta jäi. Ei mingit arvamust väljaspool seda, mida ringid näitavad – käigukast ja piirik lõpetavad auto tõmbe
palju enne, kui õhutakistus seda teeb.

**Tagumise kaotamine.** Loetakse seal, kus juht pidi selle püüdma: kurvis sõitmine vähemalt 60% haardest, libisemine (triiv üle 10° asfaltil, 20° lahtisel pinnal),
roolimine (üle 0,06) **vastu** kurvi. Millise roolimise märk nõustub millise kurvijõu märgiga, mõõdetakse iga ringi kohta (proovid, mis pöörlevad ilma libisemata).
Libisemine loetakse üks kord, kuni auto lakkab libisemast. Auto, mida tahtlikult natuke külili juhitakse, ei kaota midagi; see, mis vajab vastupidist rooli, kaotab.
Loetakse igale autole ühtemoodi, nii et kaks autot saab võrrelda. Vajab rooli ja triivinurka.

## Autode võrdlus {#cars-compared}

Külgriba jaotis on **Auto**, kui on üks auto, ja **Autode võrdlus**, kui neid on mitu.

**Tabel**: veerg auto kohta, rida mõõdiku kohta, millele mõnel autol on väärtus: Hoitud haarde; Tõmme kuni 50 km/h, 50–120, 120–200, üle 200; Pidurdus; Kiireim; Tippu jõudis ("veel tõmbab", kui ta ei jõudnud kunagi); Veel tõmbab oma kiireimal; Tagumine püütud, ringi kohta; Üle 10° triivi kõva kurvis. Kus autod erinevad rohkem kui 3%, on parem väärtus märgitud (haarde, tõmbe, pidurduse, kiiruste puhul kõrgem; tagumiste libisemiste puhul madalam).

**Üks auto üksi**: lauseid selle kohta, mida ringid näitavad – haare, mida ta hoiab (m/s² ja g), tema tõmme igas vahemikus, kus ta lakkas pikkadel sirgetel kiirust juurde võtmast (või et ta ei jõudnud kunagi tippu ja mida ta veel tõmbas oma kiireimal), kui sageli tema tagumine vajas püüdmist ("peaaegu mitte kunagi", kui alla kord ringis; "enamasti gaasil", kui 60% või rohkem algas seal).

**Kaks autot**: iga paari kohta lause kummaski, mis auto on teise vastu ("X kiirendab paremini, aga ei saa nii kõvasti keerata, vajab pikemalt peatumiseks ja kaotab tagumise kergemini"), tabel, iga selge erinevus suurimast esimesena, seejärel **Kummagagi sõites**. Kui paare on rohkem kui **3**, näidatakse ühte paari: fookusringi auto vastu, mis on valitud rippmenüüst (vaikimisi selle klassi parima ringi auto, muidu viite oma, muidu esimene teine).

Erinevust öeldakse ainult siis, kui ringid seda selgelt näitavad:

| Erinevus | Öeldakse alates | Lause |
|---|---|---|
| haarde | **4%** | "X hoiab kurvides N% rohkem haaret … see on M% rohkem kiirust iga kurvi keskel" (kiirus = √ haardesuhtest) |
| tõmme | **5%**, esimeses vahemikus, mis mõlemal autol on 120–200, 50–120, üle 200 km/h | "X kiirendab 120-st 200-ni N% jõulisemalt"; ka stardist väljas, või "kuigi Y tõuseb stardist jõulisemalt", kui start erineb 8% |
| tippkiirus | **4 km/h** | "X jõuab kõrgemale: ta lakkas kiirust juurde võtmast …" |
| tippkiirus, ainult ühel | üks auto jõudis tippu, teine ei jõudnud | "Y ei jõudnud enam tõmmet …; X võttis veel kiirust, kui pidurdas" |
| tippkiirus, kummalgi pole | kummski ei jõudnud tippu | mida kumbki veel oma kiireimal juurde võttis |
| pidurdus | **5%** | "X peatub N% jõulisemalt … Y peab varem pidurdama" |
| tagumise kaotamine | vähemalt üks kord ringis rohkem **ja** poolteist korda sagedamini | "X kaotab tagumise kergemini: ta libises piisavalt kaugele, et vajas vastupidist rooli N korda ringis vs. M …" – enamasti gaasil (60%+) või enamasti sissekeeramisel ja gaasi vabastamisel (30% või vähem), alates umbes P% oma haardest; lahtisel pinnal "osa sellest on see, kuidas auto keerab; püüdmine mitte" |
| külili liikumine | **12 protsendipunkti** kõvast kurvis triivi piirist üle | "X sõidab piiril rohkem külili" |
| esitasakaal | **0,3** nimipiirist | "X vajub esiotsaga laiaks … Tahab aeglustamist ja keeramist enne tippu" |

Kokkuvõtte omadused: *hoiab rohkem haaret* / *ei saa nii kõvasti keerata*,
*kiirendab paremini* / *tõmbab vähem*, *jõuab kõrgemale* / *jõuab madalamale*,
*tõmbab veel sirgete lõpus* / *lakkab tõmbamast*, *peatub kõvemini* / *vajab pikemalt peatumiseks*,
*on stabiilsem* / *kaotab tagumise kergemini* (*on palju libisevam …*, kui kaks korda sagedamini pluss üks; *vajab püüdmist sagedamini*
lahtisel pinnal), *vajub esiotsaga laiaks*. "Vähe vahet Y-ga nendel ringidel", kui pole ühtegi.

**Kummagagi sõites:**

- üks auto haarab rohkem ja teine tõmbab rohkem: kanna kiirust keskel laia ja ringjat joont pidi ("U") haardekal; pidurda sirgelt, pööra kitsas keskmes ja sirgista väljumisel ("V") tugeval;
- üks auto on kahes suhtes allpool: tema parim ring on kõige puhtam – pidura sirgelt, kõige laiem raadius, täisgaas nii vara, kui see hoiab;
- auto, mis kaotab tagumise kergemini: anna gaas sisse alles siis, kui roolimine lahti tuleb, ja lühikese vahetusega (libisemised gaasil), või vabasta pidur õrnalt ja hoia kesksel ühtlast gaasi (libisemised sisenemisel).

Jaotise all olev vihje kordab, kuidas kumbagi mõõdetakse.

## Mida autod kurvis otsustavad {#what-the-cars-decide-in-a-corner}

Kui ringid on erinevates autodes, lõpeb iga kaotatud kurvi leiu
**Autod:** – selle osa, mida autod otsustavad, ja kuidas sellest auto kohta kõige rohkem võtta (`carNote`):

- **Kesk-kurvis**, kui see auto hoiab alla 96% teise haardest, teine oli kõige aeglasemas punktis üle 0,5 m/s kiirem ning see ring ei jäänud kaugele alla sellest, mida tema haarde seletab (üle 70% sellest): teise auto joonel lubab selle auto haare `v_other · √(grip_mine / grip_other)`. Kui ring kandis seda (1 m/s täpsusega), on vahe auto ja ükski pidurdamispunkt seda ei muuda; kui vähem, siis kui palju on veel võita. Siis, kus aega saab võita: sirgele, kahe vahele või autosse, mis tõmbab 5% jõulisemalt – pärast tippu (pidura sirgelt, keera hiljem sisse, suuna väljumisele varakult); muidu kõige laiem raadius, mida tee lubab.
- **Tagumine, mis siin lahti läks** (jagamata libisemine või spinn, või triiv üle libisemise piiri sisenemisel), autos, mis seda kaotab vähemalt korra ringis rohkem ja poolteist korda sagedamini: mida teha selles autos – gaas sisse, kui ratas lahti tuleb (tema libisemised algavad 60% või rohkem ajast jõul), või pidur õrnalt vabaks, ilma tõstmata.
- **Järgnev sirge**: kui autode tõmme seletas 0,03 s või rohkem, teise auto tugevam tõmme samalt kiiruselt, mõlema auto tõmme 120-st 200-ni.
- **Tippkiirus**: kui see ring jõudis 98%-ni sellest, kuhu tema auto tippu jõuab 150 m pikkusel sirgel, ja teine läks 1,5 m/s kiiremini: see on auto tippkiirus, ja iga km/h rohkem kurvist aitab, kuni sinna jõutakse.
- **Pidurdus**: kui teine auto pidurdab 5% jõulisemalt ja see ring pidurdas üle 5 m varem, on osa varasemast pidurdamisest auto oma.

Auto osa võetakse maha ka ajast endast – vt [auto osa](race-corner-analysis.md#the-cars-share) –, ja kurv, kus auto seletab 60% või rohkem, pannakse autole.

## Arendajatele {#for-developers}

Kood: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` failis [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` failis [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
