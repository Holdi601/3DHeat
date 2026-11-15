---
title: "Kurv-kurvilt analüüs"
parent: "Sõiduanalüüs"
nav_order: 55
lang: "et"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Kurv-kurvilt analüüs

Kahte sama raja ringi võrreldakse kurv kurvi haaval. Iga kurvi kohta ütleb vaataja, kes oli kiirem, kui palju aega see väärt oli ja miks: liiga vara pidurdatud, võimsus peale liiga hilja või võetud laiem joon. Nii tead, mida esimesena harjutada.

![Leid avatud jaotises Mida parandada, kõrval tabel Kurv kurvi haaval](../assets/img/en/race-corner-finding.webp)

Näide: kurvis 3 pidurdab juht A 20 m varem kui juht B ja kaotab sinna jõudmisel 0,15 s. Ta on aga gaasil varem ja võidab väljumisel 0,15 s. Netos 0,00 s: kurv on võrdne ja kedagi ei öelda pidurdama hiljem.

## Mis sa näed {#what-you-see}

### Mida parandada {#where-to-improve}

Külgriba jaotis fookuses olevale ringile ("Laadi vähemalt kaks sama raja ringi." seni).

**Pealkiri:** "<ring> <aeg> võrreldes <võrdlusring> <aeg>" ja ringiaja vahe. Või võrdlusringi puhul "võrreldes iga kurvi kiireima teise ringiga (…)" ja kogu kadu. Selle kõrval on kadu jaotatud *sõitmise* ning *auto / olukorra* vahel.

**Jaotusriba:** kaotatud aeg põhjuse rühmade kaupa (pidurdamine, sisenemine, väljasõit, sirge, auto, kontekst) põhjuse värvides, koos legendiga.

**Leiud** on kolm loendit:

1. Juhi kaod, kallimad esimesena, kõige rohkem **12**. Või "Kohti, kus teistmoodi sõit aega võidaks, ei paista silma."
2. **Näita, mida auto või olukord maksis (X s)**: auto ja olukorra kaod, kõige rohkem 8 (vaikimisi sees).
3. **Kus <ring> on kiirem või on muul viisil sama (N)**: võidud ja sama jäänud kurvid, kõige rohkem 10 (vaikimisi sees).

Iga leid näitab oma järjekohta, pealkirja (kurv ja mis juhtus, kaotuse korral koos kuluga), otsusrida ja kulu (võidud miinusega) koos ribaga ning märki: *pidurdus*, *sisenemine*, *väljasõit*, *sirge* (juhi kaod; koos "· auto X", kui auto selgitab 0,02 s või rohkem), *auto*, *kontekst*, *kiirem* või *sama*. **Klõps leiul** joondab autod 40 m enne seda, raamib ja mängib selle uuesti ning avab selle mõõtmised:

- **Pidurdus:** kus kumbki pidurdas (või võttis gaasi) ja mis kiiruselt, ning mitu meetrit varem või hiljem (alates 5 m);
- **Aeglaseim:** iga ringi miinimumkiirus ja kus see oli;
- **Täisgaas:** kus kumbki oli täisgaasil ja kui palju varem või hiljem;
- **Joon:** pöördumise erinevus, kõige tihedamad raadiused, kui palju sees või väljas, ning iga ringi joone kuju ja tipp;
- **Sirge järgmise kurvini:** selle pikkus, mõlema kiirused seal, kus mõlemad olid täisgaasil, mida ta kaotas või võitis ja mille arvel: alguskiirus, teise tugevam tõmme, gaasi võtmine, maha kulutatud kiirus, kuidas sõideti (osad alates 0,02 s);
- **Auto:** kui suur osa kaost on auto ja mille arvel (tõmme, haarduvus, pidurid; kui 0,02 s või rohkem);

seejärel vihje, **Autod:** (erinevates autodes, vt [Sõidukiprofiilid ja võrdlus](race-car-profiles.md#what-the-cars-decide-in-a-corner)) ja joonenõuanne.

### Kurv kurvi haaval {#corner-by-corner}

Tabel (kahe või enama ringi korral), üks rida segmendi kohta, fookusringi klassi järgi, kui klasse on mitu:

| Veerg | Näitab |
|---|---|
| Kurv | `T3`, `T11-T12` |
| Kiireim | ring, mis on sellest kõige kiirem (oma aeg segmendi algusest lõpuni) |
| kellega | tema ülekaal teise kiireima ees, s |
| joon | kiireima ringi kuju ja tipp ("V · hilja", "U/V · keskel"); hõljutades tema kõige kitsamad, sisenemise ja väljasõidu raadiused; segakompleksi puhul "mõlemat moodi" |
| (fookusring) | kui palju ta jäi kiireimast maha, või ✓, kui ta oli kiireim |

Rea klõps avab fookusringi leiu seal (või joondab autod 40 m enne segmenti). Tabeli all, kui igal kurvil on aeg: "Kiireim läbi iga kurvi kokku: <aeg> (± võrdlusringil / klassi parimal X-l)". See on parimad segmendid kokku, pluss kiireim sõit esimese kurvini, kui see on oma lõik.

## Kuidas see välja arvutatakse {#how-it-is-worked-out}

Põhireegel: **kurvi hinnatakse tervikuna**, pidurdustsoonist selle kurvi jaoks kuni järgmise kurvi pidurdustsoonini. Ring, mis pidurdab varem, et auto saaks kiiremini pöörde ja võimsuse peale, saab krediidi väljasõidu eest, mille ta ostis. Teda ei öelda pidurdama hiljem.

## Üks vahemaatelg {#one-distance-axis}

Ringe võrreldakse vahemaa, mitte aja järgi: sekund taga olles on kaks ringi eri kurvides. Ka mitte iga ringi enda odomeetri järgi, sest kitsam joon katab vähem meetreid. **Võrdlusringi** sõidutee on telg:

- Iga teise ringi proovid **projitseeritakse** võrdlusteele. Igal proovil on `s`, kui kaugel see on mööda võrdlusringi, ja `d`, kui kaugel vasakule (positiivne) või paremale. Otsing käib edasi eelmisest vasteist (8 teelõigu tagasi kuni 40 ette), nii et ring, mis ristub iseendaga kas üle või alt, ei klammerdu teise ristumiskohta. Esimest proovi otsitakse tee esimeselt veerandilt (ringrajal langevad start ja finiš kokku). Kui 30 m piires ei ole midagi, võetakse lähim punkt igalt poolt, mis ei ole viimase vaste taga (pärast pöörlemist või kõrvalekallet). `s` ei kahane kunagi: proov, mis projitseerub eelmisest tagapool, hoitakse paigal.
- Iga kanal **ümberproovitakse** ühele ruudustikule **iga 2 m** tagant lineaarselt. Astmelised kanalid (käik, lipud) võetakse lähima proovi järgi. Ringi enda vahemikust väljaspool on väärtused tühjad.
- Ringi esimesed ja viimased proovid projitseeruvad veidi võrdlusringi otste sisse, nii et iga ringi **kantakse kuni 15 m** oma otstest kaugemale, tema kiirusel (aeg kasvab vahemaa jagatud kiirusega, ülejäänu jääb samaks). Seega on tema delta joonel sama, mis ringiaja vahe.
- `delta` = ringi aeg igal ruudustiku punktil miinus võrdlusringi oma, ehk vahe. `lateral` = `d` ruudustikul.

Aeg, mille üks ring kulutas rohkem kui teine kahe ruudustikupunkti vahel, on nende deltade vahe: `rel(s)`. Kõik allpool on sellele üles ehitatud.

## Kurvid {#corners}

Leitakse **võrdlusringilt** (`findCorners`), kus kiirus on silutud ±6 m ja kõverus (suuna muutus ±5 proovi üle, silutud ±10 m) järgi:

1. **Kiiruse miinimumid väljapaistvusega.** Punkt, mis on madalaim ±40 m piires ja mille langus kõrgeimast kiirusest kummalgi pool (enne madalamat miinimumi) on vähemalt `max(2,5 m/s; 6% kiirusest)`.
2. **Nurgad (kinks).** Kõveruse kohalik tipp, mis on kitsam kui **300 m** raadius, ilma kiiruse miinimumita 80 m piires. Täisgaasil võetud nurk on ikka kurv, mida sõita.
3. **Faasid.** Igast tipust tagasi, kuni võrdlusring pidurdab (> 0,1) või ei ole täisgaasil (< 0,95): sisenemine. Edasi, kuni ei ole täisgaasil: väljasõit. Täisgaasil võetud nurk saab ±30 m. Kattuvaid kurve hoitakse eraldi, kuid need on seatud katma ringi.
4. Nummerdatud T1, T2 … ringi järjekorras. **Vasak või parem** kõveruse märgi järgi ja selle järgi, kas maailm on peegeldatud (teadmata loetakse peegeldatuks).

**Kurvi aken** (kus võrdlusring pöörab): väljaspool kõige kitsamat punkti ±40 m piires tipust, kuni kõverus on üle kuuendiku oma tipust, pluss 10 m kummalegi poolele. Selle pool annab märgi "sissepoole".

## Segmendid: pidurdustsoonist pidurdustsoonini {#segments-braking-zone-to-braking-zone}

Iga kurv omab teed poolel teel naaberkurvide tippudeni kummalegi poolele. Selles:

- **Iga ringi aeglaseim punkt** on tegelik langus tema kiiruses. Selle lähedal ei ole midagi aeglasemat 6 m (3 ruudustikupunkti) piires kummalgi pool. Otsitakse lõigu otstest üle vaadates, nii et eelmise kurvi väljasõit, mis veel kiirendab, ei eksitata selle punktiga. Otsing käib 15 m enne kurvi akent kuni 10 m pärast seda. Ring, mis seal ei aeglustanud, paigutatakse tipule.
- **Kus ring hakkas selle jaoks aeglustama** (`entryOf`): tagasi oma aeglaseimast punktist läbi pidurdamise või gaasi võtmise, üle täisgaasi kõikumiste, kuni tal oli jalg all (gaas ≥ 0,95, pidur ≤ 0,1) **10 m** jooksul. Gaas, mis võeti uuesti viimase **30 m** jooksul enne aeglaseimat punkti, kuulub ikka kurvile. Täisgaasil kogu tee: aeglaseim punkt ise. Ring ilma gaasikanalita või see, kellel ei olnud jalga all pärast eelmist kurvi, algab kiireimast punktist vahepeal.
- **Segment algab** esimesest punktist, kus kõik ringid hakkasid sellele aeglustama (4 m varem), ja kulgeb järgmise segmendi alguseni. Nii on iga ringi pidurdus segmendi sees ja segmendid katavad ringi.

**Kompleksid.** Järjestikused kurvid, mille vahel võrdlusring ei sõida kunagi täisgaasil (vähem kui **40 m** täisgaasi), on üks segment, "T11-T12", ja seda sõidetakse ühena. Kompleks sisaldab kõige rohkem **kolme** kurvi: käänuline lõik, mida ei sõideta kunagi täisgaasil, alustab uue. Kompleks, mis pöörab mõlemale poolele, on *segatud*. Selle jaoks ei mõõdeta ühtegi joone kuju.

**Ringrajal** (võrdlusring lõpeb 50 m piires sellest, kus ta algas) jookseb viimase segmendi sirge üle joone esimese pidurdus-punktini. Lendava ringi jooks joonest loetakse viimase kurvi juurde. Ring, mis algas seisult või stardist (vt [Start](#the-start)), hoiab selle jooksu eraldi.

### Kuhu kurv viib {#what-a-corner-leads-onto}

Mõõdetud võrdlusringil: meetrid täisgaasil pärast kurvi (oma täisgaasist segmendi lõpuni, pluss joone ületav jooks) ja enne seda (eelmise segmendi "pärast" või algusest).

| Tüüp | Reegel |
|---|---|
| **kahe sirge vahel** (`both`) | 200 m või rohkem enne **ja** 120 m või rohkem pärast |
| **sirgele** | 200 m või rohkem pärast; või 120 m või rohkem pärast ja vähemalt sama palju kui enne |
| **pärast sirget** | 200 m või rohkem enne |
| **ühendus** (link) | kõik muu |

## Mida iga ring kurvis tegi {#what-each-lap-did-in-a-corner}

`cornerMetrics`, iga ringi ja segmendi kohta ruudustikul (samm 2 m). Pedaalid: pidurdus loetakse üle 0,1, täisgaas on 0,95 ja rohkem.

| Mõõdik | Reegel |
|---|---|
| **pidurdamispunkt** | esimene pidurdus, mille juures gaas maha võeti (alla 0,5), või mis kestis **15 m**. Vasaku jala kerge puudutus võimsusega ei ole koht, kus pidurdamine algas. Kui on ainult puudutusi, siis esimene puudutus |
| **gaasi võtmine** | kui pidurdust ei olnud, esimene punkt, kus gaas langes alla 0,8 |
| (pedaale ei ole) | punkt, kus ring hakkas aeglustama (ülal) |
| **pidurdusest vabanemine** | viimane pidurdus kuni 30 m pärast aeglaseimat punkti |
| **kiirus pidurdamispunktis**, **pidurdusmeetrid** | kuni aeglaseima punktini |
| **tippvõimsus pidurdusel**, **tipp-aeglustus** | pidurdustsooni üle (kiirendused üle 45 m/s² ei arvestata) |
| **pidurdus kurvis** (trail braking) | meetrid, kus pidur > 0,05 ja |roolipööre| > 0,1 |
| **rataste libisemine pidurdusel** | kõige negatiivsem rattalibisemise suhe tsoonis (kui ringil on libisemise andmed) |
| **aeglaseim punkt**, **miinimumkiirus** | nagu ülal |
| **gaas peale** | pärast vabanemist (või aeglaseimat punkti) esimene punkt, kus gaas > 0,15 ja pidur puudub |
| **täisgaas** | esimene punkt pärast seda, kus hoitakse ≥ 0,95 vähemalt 10 m jooksul |
| **veeremine** | meetrid vabanemisest gaasi peale, kus pidur ja gaas mõlemad alla 0,05 |
| **gaasikõikumised** | kui mitu korda gaas langes rohkem kui 0,25 võrra allapoole oma jooksvat tippu gaasi peale ja täisgaasi vahel |
| **külgkiirenduse tipp** | suurim külgkiirendus alates 20 m enne vabanemist kuni hilisema hetkeni: täisgaas või 20 m pärast aeglaseimat punkti |
| **käik tipus** | aeglaseimas punktis |
| **libisemine tõmbel** | suurim veorattalibisemise suhe gaasi peale ja täisgaasi vahel |
| **tasakaal** | esi- miinus tagumine libisemisnurk keskel (+ alastuur) |
| **sirge täisgaasil** | osa lõigust pärast täisgaasi (ja joont ületavat jooksu), kus gaas ≥ 0,95; sellel sirgel pikim gaasi võtmine |
| **maha kulutatud kiirus** | suurim kaotatud kiirus kõrgest punktist, kui gaas ≥ 0,9, pidurit ei ole ja auto on maapinnal |
| **sisenemise triiv** | suurim triivinurk pidurdamispunktist kuni 5 m pärast aeglaseimat punkti, maapinnal |
| **käsipidur** | kus see tuli peale (> 0,2), kuni 10 m pärast aeglaseimat punkti |
| **õhus** | sekundid õhus lõigu kohal ja selle pikaim lend |

## Kellega iga ringi võrreldakse {#who-each-lap-is-compared-with}

- Ringi võrreldakse **oma jõudlusklassi kiireima täieliku ringiga** (võrdlusringiga võrdlusringi klassis).
- See klassi parim ring ise (ja võrdlusring) võrreldakse segmendi kaupa **selle klassi ülejäänud ringiga, mis selles kohas oli kiireim**, või kõigi ringidega, kui ta on oma klassis üksi.

Ajakaart, vahed ringide nimekirjas, auto juhtimise sündmused ja kurvitabel järgivad sama võrdlust.

## Kurvi ajaarvestus {#the-time-account-of-a-corner}

`compareCorner`, ühe ringi võrdlus teisega segmendi kohta:

- **Netos** = `rel(lõpp) - rel(algus)` (ringrajal pluss joont ületav jooks lendaval ringil): otsus. Lähemal kui **0,03 s** on **sama**.
- **Jaotus**: kus kurvi sees esimene ring pöördus. Lõigul, mis algab kummagi ringi esimesest pidurdamispunktist või aeglaseimast punktist ja lõpeb hilisema neist, täisgaasi või aeglaseima punkti kohal, on suurim kõikumine, mille ring siis kas andis tagasi või võitis tagasi, kui see kõikumine on üle **0,04 s**. Muidu on see hilisem kahest aeglaseimast punktist.
- **Tipuni** = `rel(jaotus) - rel(algus)`; **pärast seda** = netos miinus see.
  Kui mõlemad on vähemalt 0,04 s ja vastupidise märgiga, siis ring **trade'is** ühte teise vastu.
- **Pärast seda** jaguneb uuesti kohas, kus mõlemad ringid on täisgaasil: **väljasõit** (jaotus kuni hilisema täisgaasi punktini) ja **sirge** (sealt lõpuni).
- **Sirge** jaguneb kolmeks:
  - *väljasõidu kiirus* (`byExit`): mõõdetud, mitte modelleeritud. Aeglasem auto läbib kiirema auto alguskiiruse veidi sirge peal, ja sealt on tema enda jälg see, mis ta oleks teinud sellelt kiiruselt, oma käigukasti, takistuse ja kaldega. Nihutatuna tagasi sellesse punkti (ja sõidetuna edasi lõppkiirusel meetrite jooksul, mida ta võidab) on see tema aeg kiiremast algusest; vahe on väljasõidu kiiruse hind. Kui aeglasem auto ei jõua seda kiirust (või ainult viimastel 2 proovil), pannakse tema enda kiirendus sirgel tagasi võimsusena (`a·v` hoitud), mitte kunagi rohkem, kui tema ümbrik näitab sellel kiirusel (ilma ümbrikuta kaks korda mõõdetud kiirendus).
  - *autode tõmme* (`byPower`): ainult erinevates autodes: mõlemad autod samalt kiiruselt samal vahemaal, täisgaasil, integreerides täisgaasi kiirenduse, mida kumbki on igal kiirusel näidanud.
  - *kuidas sõideti* (`driven`): ülejäänu, gaasi võtmine, täisgaasil maha kulutatud kiirus.

  Väljasõidu kiirus ei selgita kunagi rohkem kui sirge kulu (ega kunagi vastupidise märgiga), välja arvatud juhul, kui gaasi võtmine või maha kulutatud kiirus võtsid osa tagasi. Ring **võttis gaasi** sirgel, kui tema osa täisgaasil on alla nii 0,9 kui ka teise osa miinus 0,05. Maha kulutatud kiirus loetakse, kui kaks erinevad rohkem kui 1 m/s. Lahkarvamus, mis on märgilt alla 0,02 s, seatakse nulliks.

Iga segmendi netos liidetakse ringiaja vahega kokku ja iga kurvi tipuni ning pärast seda liituvad netosse (testid kontrollivad mõlemat).

### Auto osa {#the-cars-share}

Ainult siis, kui ringid on **erinevates autodes** ja ring kaotas aega (`carShare`):

- **tõmme**: autode tõmme sirgel (ülal), kuni kaona ulatuseni;
- **haarduvus**: kui ring oli oma auto piiril (külgkiirendus keskel vähemalt **90%** sellest, mida tema auto sel kiirusel hoiab) ja teine auto hoiab rohkem kui **5%** rohkem: madalaima miinimumkiiruse osa, mida ei seleta kitsam raadius, osa `½ ln(haarduvus_teine / haarduvus_minu) / ln(v_teine / v_minu)` alles jäänud kaost;
- **pidurid**: kui ring pidurdas (ei võtnud gaasi), pidurdab teine auto üle **5%** tugevamalt ja ringi *keskmine* aeglustus tsoonis oli vähemalt **80%** sellest, mida tema auto suudab: kiirusest `u` kuni `v` kiirendustel `a1` vs `a2`, lõppedes samas punktis, `(1/a1 - 1/a2)(u - v)² / 2u`, kuni alles jäänud kaotuseni.

Auto kulu on summa, kuni kaona ulatuseni.

## Otsus ja leid {#the-verdict-and-the-finding}

`cornerFinding` kirjutab kõige rohkem ühe leiu ringi ja kurvi kohta, proovides selles järjekorras:

| Juhtum | Leid | Tulemus |
|---|---|---|
| netos ±0,03 s piires, trade, väiksem pool vähemalt **0,1 s** | **sama, kaks teed läbi** – kes oli aeglane sisse ja kiire välja, kes vastupidi; kui sirge tuleb järele (sirgele või kahe vahele), on aeglane sisse ja kiire välja see tee, millele ehitada: hoia selle varajane gaas, võida sisenemine tagasi pidurdades kõvemini, mitte hiljem | sama |
| netos ±0,03 s piires muidu | ei öelda midagi | - |
| võidetud, trade, kaotatud tipuni | **aeglane sisse, kiire välja tasus end ära**: hoia see, siin on väljasõit rohkem väärt | võit |
| võidetud, trade, võidetud tipuni | **sisenemisel kiirem**: sisenemine on õige, varasem täisgaas hoiaks rohkem | võit |
| võidetud ja teisel ringil on siin kadu | **kiirem – teise tegemise tõttu**, tema põhjus ja vihje ütlesid "Teisele ringile: …" | võit |
| võidetud muidu | **kiirem sisenemisel / väljumisel**, sõltuvalt sellest, kumb pool võitis rohkem (hiljem pidurdades, rohkem kiirust keskel; või varem sirgeks, tugevam tõmme) | võit |
| kaotatud, ja **kokkupõrke või õnnetuse** kulu vähemalt `max(0,05 s; 40% kaost)` | löök on kurvi lugu, enne autosid | kadu |
| kaotatud ja **auto osa** on 60% või rohkem | **auto**: tema tõmme sirgel, haarduvus keskel või pidurid, suurim osa; juhi osa (≥ 0,03 s) öeldakse kui "Muu X s: …" | kadu |
| kaotatud ja üks jagamata **auto juhtimise viga** maksis vähemalt `max(0,05 s; 40%)` | see viga (vt allpool), kus aeg selle ümber liikus | kadu |
| kaotatud ja **pikem lend** maksis vähemalt `max(0,05 s; 40%)` | lend | kadu |
| kaotatud, trade, tipuni võidetud | **liiga kiire sisse, aeglane välja**: väljasõidu põhjus; loobu mõnest sisenemisest, et saada varem pöörata ja täisgaasile, teise ringi pidurdus- ja täisgaasipunktidega. Selle juur (`cause`, mida [statistika](race-course-statistics.md) loeb): hilisem pidurdamine, kui ta pidurdas mitu meetrit hiljem kui teine; muidu väljasõidu põhjus | kadu |
| kaotatud, trade, tipuni kaotatud | **andis sisenemisel rohkem ära, kui väljasõit tagasi võitis**: sisenemise põhjus, mis on ühtlasi tema juur (`cause`); hoia väljasõit, kaota vähem sisenemisel | kadu |
| kaotatud, sirgel gaasi võetud ja sõidetud osa on üle poole kaost | **sirgel ei sõidetud täisgaasil**: osa täisgaasil võrreldes teisega, kus ja kui kaua gaasi võeti | kadu |
| kaotatud, autode tõmme üle 60% kaost ja sirge üle poole | **auto tõmme sirgel** (mõlema auto tõmme 160 km/h juures) | kadu |
| kaotatud muidu | põhjus poolest, mis kaotas rohkem (tipuni ≥ pärast seda: sisenemise oma; muidu väljasõidu oma). Aeglasem välja ainult seetõttu, et keskel aeglasem (rohkem kui 1 m/s): selle asemel keskosa põhjus | kadu |

Kadu leidel võib lõppeda ka **Veel:** – maha kulutatud kiirus täisgaasil või gaasi võtmine sirgel – kui sõidetud osa sirgest maksis rohkem kui 0,04 s ja seda ei olnud juba põhjusena öeldud.

Leiud sorteeritakse: esmalt kaotused, kallimad esimesena; siis võidud ja sama jäänud kurvid.

### Sissepoole minemise põhjused {#causes-on-the-way-in}

`entryCause`, esimene, mis kehtib (miinimumkiiruste erinevused on m/s-des; "5 m" on lävi, millest alates hilisem või varasem punkt loeb):

| # | Põhjus (viga) | Reegel |
|---|---|---|
| 1 | löök või kokkupõrge sisenemisel | jagamata löök, mis algab 10 m jooksul pärast aeglaseimat punkti |
| 2 | **peaaegu seisma jäi** (intsident) | aeglaseim kiirus alla **60%** sellest, mida selle auto haarduvus lubab sel kohal, kus teine läbis (`v_teine · √(haarduvus_minu / haarduvus_teine)`, kui teine auto haarab rohkem, muidu teise kiirus), teine ring üle 8 m/s: pöörlemine, kontakt või kurvist mööda sõit |
| 3 | auto juhtimise viga sisenemisel | jagamata lukk, tõuge, pöörlemine või libisemine, mitte gaasil, algab 10 m jooksul pärast aeglaseimat punkti, kulu ≥ 0,02 s |
| 4 | pikem lend enne aeglaseimat punkti | vt [ralli](#rally-rotation-and-flights) |
| 5 | **gaasi võetud**, kui teine jäi täisgaasile või võttis gaasi 5 m või rohkem hiljem | ainult see ring võttis gaasi |
| 6 | **pidurdas, kus teine ainult võttis gaasi** või jäi täisgaasile | ja oli keskel rohkem kui 0,5 m/s aeglasem |
| 7 | **pidurdas kergelt** | pidurdas (ei võtnud gaasi), oleks saanud pidurdada kõvemini – rehvide andmetega: tema lukustumisel libisemine alla **60%** libisemisest, kus selle auto pidurid annavad parima tulemuse; ilma nendeta: tipp-aeglustus alla **85%** sellest, mida ta sel kiirusel näitab – pedaal alla 0,95 ja teise ringi tipp-aeglustus üle **15%** kõrgem |
| 8 | **pidurdas varakult** – või **auto pidurid** | pidurdas rohkem kui 5 m enne teist. Teises autos, mille pidurid on üle 5% tugevamad, ja kui vajalik vahemaa selle auto aeglustusel on vähem kui 10 m varuga: auto pidurid. Muidu varakult pidurdatud, koos "Pidurda hiljem – umbes N m" (teises autos meetrid, mis ületavad vajaliku) |
| 9 | **veeres** | rohkem kui 10 m ilma kummagi pedaalita ja 5 m rohkem kui teisel |
| 10 | **keskel aeglasem** | rohkem kui 0,5 m/s aeglasem aeglaseimas punktis; jagatud `v² = a·R` järgi (allpool) |
| 11 | **saabus aeglasemana** | üle 1 m/s aeglasem pidurdamispunktis, ei pidurdanud varakult: otsustati varem – eelmise kurvi ja auto tõmbe järgi või lennu järgi eelmises kurvis, mis oli 0,2 s pikem. Auto oma, kui autod erinevad |
| 12 | aeglasem tipuni | muidu: vabasta pidur sujuvamalt ja veereta keskele rohkem kiirust |

**Keskel aeglasem** (`middleSplit`): iga ringi raadius aeglaseimas punktis mõõdetakse tema enda rajalt (±8 m), tema külgkiirendus `v²/R`, ja

`ln(v_teine / v_minu) = ½ ln(a_teine / a_minu) + ½ ln(R_teine / R_minu)`.

- Raadius selgitab **pooled või rohkem**: **liiga kitsas joon**: "kasuta rohkem teed", koos mõlema raadiuse ja osaga.
- Auto piiril (libisemas üle 10° triivi asfaltil / 20° lahtisel pinnal, või külgkiirendus vähemalt 90% sellest, mida ta sel kiirusel hoiab) ja teine auto haarab üle 5% rohkem: **auto haarduvus**; kaitse hoopis väljasõitu.
- Libisemas läbi (triiv üle 10° / 20°) ja teine ring ei libisenud (tema sisenemise triiv vähemalt 4° vähem): **küljeliikumine**, haaratuse piirist üle, mitte sellest allpool; saabu veidi aeglasemana. Öeldakse auto omana, kui see auto tabab oma tagumise ratta vähemalt ühe korra ringi kohta rohkem kui teine.
- Teises autos, mis hoiab alla **96%** teise haarduvusest, ja ring kandis kiirust 1 m/s piires `v_teine · √(haarduvus_minu / haarduvus_teine)`: **auto haarduvus** – "pidurdamine hiljem seda ei paranda".
- Muidu **haaratust üle**: külgkiirendus võrreldes teisega sarnasel raadiusel ja see, mida see auto hoiab; kanna rohkem kiirust tipuni. Kui selle auto tagumine ratas lahti läheb enne, kui haaratust on ära kasutatud (libisemised algavad alla 85% haaratusest ja ring oli 80% sellest juures), leia ülejäänu väikeste sammudena.

### Väljumise põhjused {#causes-on-the-way-out}

`exitCause`, esimene, mis kehtib:

| # | Põhjus (viga) | Reegel |
|---|---|---|
| 1 | auto juhtimise viga väljumisel | jagamata rattalibisemine, pöörlemine, libisemine või löök, mis lõppeb 10 m enne aeglaseimat punkti või pärast seda |
| 2 | **maha kulutatud kiirus** | täisgaasil kaotatud kiirus rohkem kui 1 m/s kui teisel; üle **7 m/s (25 km/h)** "rohkem kokkupõrke või pöörlemise moodi kui libisemise" |
| 3 | **pööras auto valesti** (lahtisel pinnal) | vt [ralli](#rally-rotation-and-flights) |
| 4 | **gaas peale hiljem** | gaas peale rohkem kui 5 m hiljem, arvestatuna ka igast ringi enda aeglaseimast punktist (hiljem aeglaseimat punkti omav ring ei saa hilisema gaasi eest süüdi olla) |
| 5 | **vabatas gaasiga** | rohkem gaasikõikumisi kui teisel |
| 6 | **sõitis laia ja ootas** | rohkem kui 1,5 m väljaspool teist, kui mõlemad olid täisgaasil, ja täisgaas rohkem kui 5 m hiljem oma aeglaseimast punktist |
| 7 | **täisgaas hiljem** | täisgaas rohkem kui 5 m hiljem, ka oma aeglaseimast punktist; auto kiirendusega sel kohal |
| 8 | **auto sõit** | teises autos, mis tõmbab sel kiirusel alla 95% teisest, ja tõmme selgitas osa sirgest |
| 9 | **aeglasem kurvist väljudes** | muidu: hilisem tipp, nii et auto on varem sirgel |

Kui kaks ringi olid aeglaseimas punktis eri käikudes, lõpeb vihje: "Käik N tipus; teine kasutas M."

### Auto juhtimise vead ja löögid {#car-control-faults-and-impacts}

[Sõiduki juhtimise sündmuste](race-control-events.md) viga põhjusena: lukk on *pidurdamise* põhjus, tagarataste pööramine või libisemine gaasil on *väljumise* põhjus, ülejäänu *sisenemise*; löök pärast aeglaseimat punkti on *väljumine*, enne seda *sisenemine*. Vihje on sündmuse enda oma, siis "See maksis umbes X s 40 m pärast seda" (või "kuni auto sai kiiruse tagasi" löögi puhul). Lukk, mille pidurdamispunkt on rohkem kui 5 m varem kui teisel, lisab, et ring pidurdas ka varakult; kui rattad pöörlevad, ei oleks seda vaja olnud.

### Ralli: pööramine ja lennud {#rally-rotation-and-flights}

**Lahtisel pinnal**, kui mõlemal ringil on triivinurgad ja see ring on gaasil (või tasasel) rohkem kui 5 m hiljem:

- **Pööras auto vähem**: teisel oli auto pööratud **12°** või rohkem oma aeglaseimas punktis ja vähemalt **8°** rohkem kui sel ringil. Vihje: gaasi võtmine või vasaku jala kerge pidurdus, kui auto pöördub sisse, teise ringi käsipiduri punktiga, kui ainult tema kasutas seda, või käsipidur kurvis, mis on aeglasem kui 15 m/s (54 km/h).
- **Pööras liiga palju**: sel ringil oli auto pööratud 12° või rohkem ja vähemalt **12°** rohkem kui teisel: see tuli sirgeks ajada enne, kui võimsus sai alla minna.

**Pikem lend**: õhus 0,2 s või rohkem kauem kui teisel, maksab vähemalt 0,03 s alates 10 m enne õhkutõusu kuni 40 m pärast maandumist (või segmendi lõpuni). Enne aeglaseimat punkti on see sisenemise põhjus; see saab kurvi looks, kui selgitab 40% või rohkem. Vihje: hoia gaas tõusul peal, võta hari natuke aeglasemalt või kerge pidurdusega.

### Start {#the-start}

Enne esimest kurvi, sprindil või kui kumbki ring algas seisult (alla 5 m/s, kui mõlemad on telje alguses) või stardist (alla 60% teise kiirusest), on jooks esimese pidurdamispunktini oma leid (kurv 0), kui see erineb rohkem kui 0,03 s: *Start*, *Võidusõidu start* või *Esimese kurvini*. Kaotus seal pannakse olukorra arvele (*kontekst*), kui üks ring algas võidusõidu startist ja teine kiirusel; autole, kui ringid on eri autodes; ja juhile muidu. Vihjed: teises autos seisult, "enamasti auto"; samas autos seisult stardi puhul käivita vähema rattalibisemisega ja vaheta võimsusvahemiku tipus; võidusõidu start, võrdle seda teise esimese ringiga; lendav start, parem väljumine viimasest kurvist viiakse joone üle.

## Sõidetud joon {#the-driven-line}

`lineMetrics`, iga ringi ja segmendi kohta (segatud kompleksidele mitte), ainult asukohtadest (silutud ±2 proovi) kurvi akna üle:

| Mõõdik | Reegel |
|---|---|
| kõverus | suuna muutus ±8 m jooksul ringi enda rajal |
| **kitsaim raadius** | 1 / kõveruse tipp |
| **sisse pööramine** / **välja pööramine** | kus kõverus esimest korda / viimast korda ületab viiendiku oma tipust |
| **keskel** | kus ring oli pöördunud pool oma suuna muutusest |
| raadius sisse / välja | meetrid, mis sõidetud üle poole suuna muutuse, enne / pärast keskkohta |
| **kuju** | kitsaim raadius jagatud keskmise raadiusega pöörde ajal: alla **0,55** on **V**, üle **0,75** on **U**, vahepeal "U/V" |
| **tipp** | väljumise raadius jagatud sisenemise raadiusega: üle **1,25** hilja, alla **0,8** varakult, muidu keskel |
| **kiiruse tipp** | aeglaseim punkt rohkem kui **15 m** enne keskkohta: aeglane sisse, kiire välja; rohkem kui 15 m pärast: aeglustub veel pärast keskkohta |

Teise ringi vastu: kui palju sisse (+) või väljas ta sõitis sisse pööramisel, läbi kitsaima osa ja kus mõlemad olid tasasel (öeldakse alates 1 m); kus kumbki sisse pööras (öeldakse alates 8 m).

### Milline joon sobib sellele autole siin {#which-line-suits-this-car-here}

`lineFor`, sellest, kuhu kurv viib ja auto iseloomust selles kurvis:

- **võimsus-haarduvus** = auto täisgaasi kiirendus väljasõidu kiirusel jagatud tema haaratusega miinimumkiirusel (oma ümbrikust). **Punkt ja lase** alates **0,45**; **hoog** kuni **0,25**.
- **allasurve**: haaratus 151–252 km/h jagatud haaratusega 54–108 km/h juures on vähemalt **1,15**, kurvi puhul, mis võetakse **144 km/h** (40 m/s) või kiiremini: siis on see hoogkurv, olenemata võimsusest. Lahtisel pinnal ei hinnata.

| Kurvi tüüp | Auto | Joon |
|---|---|---|
| pärast sirget | punkt ja lase / muu | V / U, tipp keskel: "pidurdustsoon on auhind" |
| kahe sirge vahel | hoog / muu | U / V, hiline tipp |
| ühendus | hoog / muu | U / V, tipp keskel: "sõida seda järgmise väljasõidu nimel" |
| sirgele | hoog (või kiire allasurvega kurv) | lai ümmargune U, veidi hiline tipp |
| sirgele | punkt ja lase | V: pidurda sirgelt, pööra sisse hilja, pöörlemine lühikeses kitsas keskel, sirgeks varakult |
| sirgele | vahepealne | U hilise tipuga: aeglane sisse, kiire välja |

Kus väljasõit loeb (sirgele, kahe vahele), lisab veosüsteem lause: **FWD**: pööra see pidurdades, lisa võimsust alles siis, kui ratas lahti tuleb; **RWD**, kui võimsus-haarduvus on 0,35 või rohkem: sirgenda enne täisgaasi; **AWD**: see võib võtta võimsust veel pöörates. Lahtisel pinnal lisab iga joon: pööra auto sisse juba sisenemisel.

Lause ütleb siis, mida ring sõitis, ja kas see sobib: *hilisem aeglaseim seob väljasõidu* või *varajane tipp seob väljasõidu*, kui hiljem tipp oleks tahetud ja ring ei tipnud hilja ega olnud varakult aeglaseim; *ümaram kui see auto tahab*, kui V oleks tahetud; *kandilisem kui see auto tahab*, kui U oleks tahetud; muidu *see sobib*.

## Arendajatele {#for-developers}

Kood: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts), [`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts), [`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts), [`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts), [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx). Põhjendused ja nende allikad: [meetod](race-analytics.md).
