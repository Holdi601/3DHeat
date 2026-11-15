---
title: "Failide laadimine"
parent: "Andmete sisselugemine"
nav_order: 1
lang: "et"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Failide laadimine

See lehekülg näitab, kuidas anda 3DHeat'ile oma failid ja mis ta nendega teeb. Lohista kaust
sisse, ja ta valib failid, millel on asukohad, ning ühendab need üheks pildiks.

1. Ava **Allikas** soojuskaardi külgriba ülaosas.
2. Lohista failid või kaust lohistusalale või vajuta **Failid…** või **Kaust…**.
3. Loe valiku rida ja **Mäluhinnangut** (vt pilti allpool).
4. Vajuta **Laadi**.

![Allikapaneel pärast kümne matsi kausta lohistamist: 1 valiku rida, 2 Mäluhinnang kohta "mahub" ja 3 Laadi 10 faili](../assets/img/en/loading-files-source.webp)

*Pärast kausta lohistamist ütleb 3DHeat, mida ta leidis ja kas see mahub.*

Failid laaditakse soojuskaardi vahekaardi külgriba ülaosas olevas paneelis **Allikas**. Kõik
korraga valitu saab **ühe** andmestiku.

## Failide valimine {#choosing-files}

| Juhtnupp | Mida see teeb |
|---|---|
| **Lohista failid või kaust siia** (lohistusala) | Lohista mis tahes segu faile ja kaustu. Kaustu läbitakse rekursiivselt. Lohistusalale klõpsamine avab sama valija nagu **Failid…**. |
| **Üks fail…** | Failivalija ühe faili jaoks. |
| **Failid…** | Failivalija, mis võtab mitu faili. |
| **Kaust…** | Kaustavalija (brauseri `webkitdirectory` valija); igat faili kausta puus pakutakse. |

Valijad võtavad vastu failitüüpe, mis on [laaditavate failide loendis](data-formats.md#files).
Lühidalt: `.parquet`/`.pq` loetakse Parquet'ina, `.csv`/`.tsv`/`.txt` eraldajatega tekstina,
`.acmi` (Tacview), OCAP `.json`/`.json.gz` ja GPS-vormingud (GPX, KML, KMZ, NMEA, IGC, FIT) käivad
oma lugejate kaudu, ning `.3dheat` matšikonteinerid laaditakse nende sisaldatud tabelitena
([Üks fail matši kohta](container.md)). Konteiner, mida ei saa lugeda, jäetakse vahele kui *ei ole
csv/parquet fail*.

Lohistatud kaustu läbitakse kuni 12 taseme sügavuseni ja kõige rohkem 20 000 faili, et kaitsta
sümlinkide tsüklite ja lõpmatute puude eest.

## Milliseid faile hoitakse {#which-files-are-kept}

Enne lugemist filtreeritakse valik ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Fail teise laiendiga jäetakse vahele: *ei ole csv/parquet fail*.
- 0-baidine fail jäetakse vahele: *tühi (0 baiti)*.
- **Konverteri lisafailid** - toorandmed, mida konverter hoiab matši tabeli kõrval,
  `<matš>.messages.parquet`, `.events.parquet`, `.raw.parquet` ja teised, mis on loetletud
  jaotises [Konverterid hoiavad kõike](converters.md) - jäetakse vahele: *konverteri lisafail*.
  Et ühte avada, vali või lohista see eraldi (või ainult lisafailid): valik, mis koosneb ainult
  lisafailidest, laadib need nagu iga tabeli. Tabeli kõrval olev JSON (`.match.json`, `.course.json`,
  `.level.json`, `.meta.json`, `.summary.json`, `.session.json` ja `.hints.json`) ei ole kunagi
  pakutud asukohtadena.
- **Liikumisfaili reegel.** Kui mõni fail valikus on nimega `movement*.parquet`, `movement*.csv` (ja
  teised laiendid) - `movement.parquet`, `movement_1.parquet` ja nii edasi -, siis jäetakse vahele
  iga teine andmefail: *mitte liikumisfail, ja selles kaustas on liikumisfaile*. Telemeetria
  eksportides on sageli üks positsioonide tabel kümnete positsioonideta tabelite kõrval, ja joonistada
  saab ainult esimest. Kaust ilma ühegi liikumisfailita laadib kõik oma andmefailid. Näide: kaust
  `movement_1.parquet`, `kills.parquet` ja `shop.parquet` laadib `movement_1.parquet`; ülejäänud kaks
  on loetletud vahelejäetuna. Näide: kaust `movement_1.parquet`, `kills.parquet` ja `shop.parquet`
  laadib `movement_1.parquet`; ülejäänud kaks on loetletud vahelejäetuna.
- Alles jäänud failid sorteeritakse nende tee järgi valikus, nii et sama kaust annab alati sama
  andmestiku ja samad värvid.

Paneel näitab siis valikut (ühe faili nime või `kaust (N faili)`, kasutades pikimat ühist kausta),
failide arvu, nende kogusuuruse ja ridade koguarvu - täpne, kui kõik failid on Parquet, märgitud `≈`-ga,
kui mõni on CSV. Vahelejäetud failid on loetletud põhjusega, esimesed neli nime järgi.

## Skeemi lugemine {#reading-the-schema}

Valiku **esimene** fail avatakse skeemi kirjeldamiseks ("Skeemi lugemine"): selle veergude nimed, selle
esimesed 50 andmerida, milliseid veerge peetakse arvuliseks ja Parquet'i puhul iga veeru loogiline
tüüp ning `heat3d` jaluse kirje. Ühe tabeli eksportide kaust jagab ühte skeemi, nii et üks fail esindab
kõiki. Seejärel mõõdetakse iga faili ("Ridade lugemine"): Parquet'i jalus annab täpse arvu ühe väikese
lugemisega; CSV arv hinnatakse tema esimese megabaidi keskmisest rea pikkusest.

[Veergude seostamise](column-mapping.md) paneel avaneb automaatselt pakutud oletustega ja [mäluhinnang](memory-and-budgets.md)
ilmub nupu **Laadi** kohale.

## Sõnumid enne laadimist {#messages-before-loading}

Valiku all loetleb paneel [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts) järgi:

- **Vead** (punased) - laadimine ei saa alata: vähem kui kaks positsioonitelge, sama veerg kahel teljel,
  seostatud veerg, mida failis ei ole, positsioonveerg, mis ei näi arvuline, ajaveerg, mille proovitud
  väärtused on tekst, kui ühik on arv (iga rida loetaks NaN-ina ja jõuaks ajale 0), ajaveerg, mis on
  seatud ISO-8601-ks ja mille ühtegi proovitud väärtust ei saa kuupäevana lugeda, ja ühiku skaala 0.
- **Hoiatused** (kollased) - laadimine toimub, aga tõenäoliselt mitte nii, nagu mõeldud: grupiveerg, mis
  võtab enamikus proovitud ridades eraldiseisva väärtuse (see on siis ID, mitte grupp), `DATE`-ajaveerg
  (iga päeva rida jagab ühte hetke), vaatesuund seatud ilma oma veergudeta.
- **Märkused** - mida seostamine tähendab: joonistamine tasandil, kui üks telg on seostamata, ajajoont
  ei ole ilma ajaveergu, jälgi ei ole ilma isikuveerguta, ja ilma grupiveerguta on kõik ühes värvis ning
  vahe saab jaguneda ainult veeru järgi, mis on jäetud filtrite jaoks.

## Laadimine {#loading}

Nupp **Laadi** loeb *Laadi fail*, *Laadi N faili* või *Laadi N faili (1 / K)*, kui on seatud
[decimeerimise samm](memory-and-budgets.md#decimation). See loeb *Liiga suur - vähenda või decimeeri* ja
on keelatud, kui [mahutavuse kontroll](memory-and-budgets.md#the-fit-check) ütleb, et laadimine ei mahu; see
on keelatud ka siis, kui seostamisel on vead või kui teine laadimine käib.

Laadimise ajal näitab paneel praegust sammu (ees `[fail/failid]`, kui on mitu faili), loetud ridu, edenemisriba
ja **Tühista**. Tühista lõpetab sisestustöötaja ja koos sellega kõik parsimistöötajad, mille ta alustas.

Leht joonistab laadimise ajal edasi, sest töö käib taustal. Näed praegust sammu, loetud ridu, edenemisriba
ja **Tühista**. Viimase faili järel näitab paneel samme *Ridade paigutamine ajalises järjekorras*,
*Veergude ümberjärjestamine (n / m)*, *Ulatuse mõõtmine*, *Koosseisu koostamine*, *Seansside kokkuvõte* ja
*Ridade üleslaadimine GPU-le: N rida* ühe kaadri jaoks, et pikka ülesslaadimist ei võetaks kunagi külmumiseks.

### Kuidas see töötab {#how-it-works}

Laadimine käib veebitöötajas ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)).
Mitme faili ja rohkem kui ühe [parsimislõime](memory-and-budgets.md#parser-threads) korral parsitakse
korraga kuni nii palju faile, igaüks oma parsimistöötajas ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)),
niikaua kui RAM-i eelarves on ruumi; need ühendatakse ikka ühekaupa valiku järjekorras, nii et andmestik on
sama, mis ühekaupa laadimisel. Kui mitu on lennus, nimetab edenemisrida faili, mis viimati teatas, ja riba ning
ridade arv liidavad kõik lennus olevad failid. Ühe lõimega või ühe failiga parsitakse failid üksteise järel
sisestustöötajas endas. Loetakse ainult veerud, mida seostamine nimetab: seostamata veerg Parquet-failis ei
maksa midagi; CSV-d skannitakse baidi kaupa, kuid dekodeeritakse ainult seostatud väljad.

## Mitu faili saavad üheks andmestikuks {#several-files-become-one-dataset}

Kui on laaditud rohkem kui üks fail ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts),
[`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Üks koosseis.** Isikud, grupid, seansid ja kategooriaväärtused on sõnastikud, mida jagavad kõik failid, nii et
  sama mängija kahes eksportis on üks isik ühe rajaga.
- **Üks ajaalgus.** Ajad hoitakse 64-bitiste sekunditena ühendamise ajal ja nihutatakse *kogu* valiku varaseimale
  ajale, seejärel salvestatakse 32-bitiste sekunditena sellest algusest. Neli eksporti neljast pärastlõunast
  paigutatakse nende tegelikku järjekorda, mitte ükshaaval üksteise peale.
- **Üks ajajärjestus.** Kõik failide read sorteeritakse ajaliselt radix-sorteerimisega (vt [sorteerimise
  piirang](memory-and-budgets.md#the-sort-ceiling)).
- **Veerg `Source file`.** Iga rida mäletab, millisest failist ta tuli, kategooriaveerguna nimega `Source file`.
  See ilmub [Filtrites](filters.md) ja nimena *Source file - compare two loads* [vahe jaotuses](difference.md).
  Ühe faili laadimine seda ei saa - konstantne veerg maksaks iga rea kohta 4 baiti, et midagi mitte öelda.
- **Puuduvad veerud.** Fail, millelt puudub üks *filtri* veergudest, lihtsalt ei anna sellele väärtusi. Fail, millelt
  puudub seostatud *rolli* veerg (X, aeg, isik, ...), ebaõnnestub teatega *failil pole veergu "name"*; mitme faili
  laadimisel jäetakse see fail vahele ja ülejäänud laaditakse ikka, ning vahelejäetud failid on loetletud andmestikul.
  Ühe faili laadimine, mis ebaõnnestub, teatab veast.
- **Puuduse hoiatus.** Kui laaditud ridu on vähem kui 95% eelnevalt loetud ridadest, kannab andmestik hoiatust
  puuduva osa protsendiga - loetamatutest failidest või ridadest ilma kasutatava positsioonita, mis jäetakse
  sisselaadimisel välja.

## Pärast laadimist {#after-loading}

Uus andmestik asendab eelmise. Igal laadimisel ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- tühjendatakse kõik filtrid ja grupi nähtavus;
- lähtestatakse grupi järgi vahe jaotus: esimene pool gruppe (ülespoole ümardatud) positiivne, ülejäänud negatiivne;
- osakese raadius seatakse horisontaalsele ulatusele / 120 ja küllastus analüütilisele hinnangule; kuubi suurus,
  vaatekiirte pikkus, lennukiirus ja lähi/kaugtasandid seatakse ulatuse järgi (vt [Seansid, isikud ja grupid](sessions-persons-groups.md#entity-size));
- replay-seanss seatakse seansile, millel on kõige rohkem ridu;
- joonesoojuse marsruudid arvutatakse uuesti ([Joonesoojus](line-heat.md));
- vaaterežiim langeb tagasi **Soojusele**, kui praegune režiim ei ole uuel andmel toetatud; ajajoon langeb tagasi **Kõigile**
  ilma ajaveergu ja ajalugu **Kumulatiivsele** ilma elutsükliteta;
- mängupea pannakse algusesse ja taasesitus peatub;
- kaamera kaadrib kogu andmestiku vaikesuunast (vaadates mööda -Z, kallutatud alla umbes 36°).

Paneel **Andmestik** näitab siis andmestiku nime (valik, ridade ja failide arv ning samm, kui seda kasutati),
`N meeskonda · N isikut · N s ulatus` ja iga laadimise hoiatust kollasena, kui andmestik on laaditud. Selle
paneeli **Eemalda** eemaldab andmestiku.
