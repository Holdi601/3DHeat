---
title: "Konverterid säilitavad kõik"
parent: "Andmete sisselugemine"
nav_order: 8
lang: "et"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Konverterid säilitavad kõik

Matši avamiseks ei pea sa seda lehte vajama. See on neile, kes kirjutavad tööriistu, mis muudavad mängufailid 3DHeati tabeliteks, ja neile, kes tahavad teada, miks need tabelid nii palju sisaldavad.

Iga tööriist, mis muudab mängu kordusefaili, demo, logi või otsese telemeetria
vaatajas avatavaks, järgib ühte reeglit:

> **Konverteeri kõik, mida allikas sisaldab ja mida saab praegu lugeda, ning hoia
> ülejäänu tervena, et seda saaks hiljem lugeda ilma algse failita.**

Kordus kaob sageli mängu uuendamise, uuesti paigaldamise või täis ketta tõttu,
otsene voog on kadunud hetkel, kui see saadeti. Mida konverter maha jätab, on
igaveseks kadunud; mida ta tervena hoiab, saab dekodeerida päeval, mil keegi selle
aru saab. Seega konverter ei otsusta kunagi, mis on kasulik: ta dekodeerib, mida
suudab, hoiab iga muu sõnumi, paketi, sündmuse, omaduse või rea muutmata tabeli
kõrval ning ütleb oma väljundis, kui palju igast ta luges ja kui palju ainult hoidis.

See leht on konvertereid ühendav kokkulepe: War Thunderi, World of Tanksi, World of
Warshipsi ja Squadi kordusekonverterid, CS2 demokonverter, taustal töötav
vaataja (tema Dota kordusedekooder ja iga otsese voo adapter), mänguvõtte tööriista
telemeetria lugejad ja vaatleja enda importimised (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA).
Vaatleja enda lugejad on kirjeldatud lehtedel [Tacview salvestised](tacview-acmi.md) ja
[Failide laadimine](loading-files.md); ühe faili vorm on [Üks fail matši kohta](container.md).
Üks matš muutub tabeliks, `match.json`-iks ja külgfailideks, valikuliselt pakitud
ühte `.3dheat` faili. Iga tööriista README-l on jaotis **Completeness** (täielikkus), mis
loetleb selle allika kohta, mis loetakse, mis hoitakse tervena ja mis pole
kättesaadav, ning miks.

## Kolm kodu iga kirje jaoks {#three-homes-for-every-item}

Kõik, mida allikas sisaldab, lõpeb täpselt ühes kolmest kohast:

| Kodu | Mis sinna läheb |
|---|---|
| **Dekodeeritud** | Tabel (üks rida proovi või sündmuse kohta, vaatleja loetavad veerud, lisaveerud iga muu väärtuse jaoks, mis kuulub reale) ja matši dokument `<match>.match.json` (kõik, mis kuulub matšile tervikuna: seaded, koosseisud, tulemused, tulemustabelid, enesekontroll). |
| **Hoitud tervena** | Külgfail tabeli kõrval: iga kirje, mida ei dekodeerita või mida dekodeeritakse ainult osaliselt, tervena ja muutmata, koos tüübi, aja ning üksuse või olemiga, kuhu see kuulub. |
| **Pole kättesaadav** | Nimetatud README jaotises Completeness koos põhjusega: vorming seda ei kanna (kliendi kordusel pole teiste mängijate sisendeid), allikas seda ei saada või selle lugemine pole lubatud (kaitstud protsess, krüpteeritud plokk, mille võti pole meie kasutada). |

Kirje, mis on **osaliselt** dekodeeritud, on dekodeeritud *ja* hoitud tervena: tabel
saab arusaadava osa, külgfail terve kirje, nii et hilisem parem dekoodner ei vaja algset faili.

Neljandat kohta pole. Midagi maha jätta, sest see tundus kasutu, sest see oli
"tõenäoliselt" duplikaat või sest see oli suur, on viga. Vähendamine on lubatud ainult
tabelis (kaamera 2 Hz asemel 60 Hz), mitte kunagi külgfailis.

## Külgfailid {#sidecars}

Külgfail on Parquet-fail tabeli kõrval, nime järgi:

```
<folder>/<match>.parquet              tabel
<folder>/<match>.match.json           matši dokument
<folder>/<match>.<what>.parquet       külgfail
```

`<what>` on üks sõna sellest loendist. Uus konverter valib sobiva sõna või lisab uue
siia **ja** faili [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)
muutujasse `SIDECAR_PARQUET`, et vaataja jätaks selle välja, kui laaditakse terve kaust.

| `<what>` | Sisaldab | Kasutab |
|---|---|---|
| `messages` | võrguvoo paketid, olemimeetodite väljakutsed ja omaduste uuendused, tervena | War Thunder, World of Tanks, World of Warships |
| `flight` | lennuki lennumudeli kirjed, tervena | War Thunder |
| `packets` | terved kaadrid ja võrgusõnumid või konteineri tükid, olemi voost väljas | CS2, Dota 2, Squad |
| `events` | mängu sündmused kõigi võtmetega, nagu parser need annab | CS2 |
| `entities` | olemi ja omaduste uuendused, kaugkõned, avatud ja suletud kanalid koos eksportidega, mida dekoodner vajab | Squad, Dota 2 |
| `props` | iga olemi omadus, mille parser loeb, iga kord, kui see muutus | CS2 |
| `units` | üksuse olek väljaspool positsioonitabelit | Dota 2 |
| `combatlog` | lahingulogi, iga kirje iga väljaga | Dota 2 |
| `strings` | iga stringitabeli iga kirje | CS2, Dota 2 |
| `objectives` | vallutustsoonid ja eesmärgid, iga muutus koos ajaga | War Thunder |
| `raw` | otsene voog: iga pakett, rida, API dokument või mälu lugemine, mis vastu võeti, tervena | vaatleja seansid (`heat.raw.parquet`), mänguvõtte tööriista ringisalvestajad (`<stamp>_<game>.raw.parquet`), vaatleja osu!, LoL ja Valorant kordusefailid |

Vaataja kausta laadimine jätab vahele iga selle loendi `*.<what>.parquet` ja iga
`*.match.json`, `*.meta.json`, `*.summary.json` ning teised JSON-külgfailid; kui avad
ühe neist eraldi, valides või lohistades ainult selle faili, laaditakse see nagu iga
teine tabel (vt [Failide laadimine](loading-files.md)).

Need on failid, nagu konverter need kirjutab käsuga `--loose`. Vaikimisi pakivad War
Thunderi, CS2 ja Tacview konverterid matši tabeli, dokumendi ja külgfailid ühte faili,
`<match>.3dheat`, samade nimedega (vt [Üks fail matši kohta](container.md)); kõik siin
kehtib iga liikme kohta.

### Veerud {#columns}

Iga külgfaili rida on üks kirje. Veerud on selles järjekorras, need, mis kehtivad:

| Veerg | Tüüp | Mis |
|---|---|---|
| `time` | float64 | sekundid samal kellal, mis tabeli `time` (või `tick`, kui allikas loeb ticke; siis mõlemad) |
| `type` | string (sõnastik) | mis kirje on allika enda mõistes: paketi tüüp, sõnumi ID, sündmuse nimi, omaduse tee, rea eesliide |
| `name` | string (sõnastik) | selle nimi, kui see on teada (kogukonna nimi, klassi nimi), muidu tühi |
| `entity` / `unit` / `uid` / `player` | täisarv või string | kellele see kuulub, samade ID-dega nagu tabelis, nii et külgfaili rida saab liita rajaga |
| `decoded` | string (JSON) | mis sellest on arusaadav, kui midagi on; muidu tühi |
| `payload` | binaarne | kirje baidid, tervena ja muutmata (binaarallikad) |
| `text` | string | kirje tekst, tervena ja muutmata (tekstiallikad: logirida, JSON-objekt, võtme-väärtuse plokk) |

Lisaveerud on lubatud (bitinihe, suurus, kanal). Korduvad stringid on sõnastikuna
kodeeritud ja fail kirjutatakse zstd-ga, nii et külgfail on ainult murdosa kordusefaili
enda suurusest.

Külgfail peab üksi piisama: hiljem kirjutatud dekoodner loeb külgfaili, mitte kunagi
algset kordust. Kus kirjet ei saa mõista ilma kontekstita (olemi klass, stringitabel,
võti, millele sõnum viitab), lisatakse kontekst samuti külgfaili või matši dokumenti.

### Otsesed allikad {#live-sources}

Otsesed adapterid (UDP-telemeetria, jagatud mälu, mängu logi, kohalik API) ei
oma faili, mille juurde tagasi minna. Nad salvestavad **iga välja, mida allikas saadab**,
isegi neid, mida miski veel ei kasuta:

- paketivoog: iga pakett tervena, `payload` on baidid, `type` on paketi ID või formaat, sel kiirusel, millega see saabub;
- jagatud mälu või küsitav API: iga väli iga lugemisest, kas nimetatud veergudena või terve plokk `payload`-ina, sel kiirusel, millega adapter loeb;
- logi: iga rida, `text` on rida, `type` on rea liik, kaasa arvatud read, millele adapter ei reageeri.

Need lähevad faili `<session>.raw.parquet` seansi tabeli kõrvale. Suurus on reegli
hind; seda hoiab all zstd ja sõnastiku kodeerimine, mitte asjade jätmine välja.

## Enesekontroll {#the-self-check}

Iga konverter kirjutab oma matši dokumenti (või seansi `meta.json`-i, või kokkuvõtte,
kui sellel pole matši dokumenti) ploki `completeness` jaotises `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Väli | Tähendus |
|---|---|
| `seen` | mitu seda tüüpi kirjet allikas sisaldab |
| `decoded` | loetud tervena tabelisse või matši dokumenti |
| `partial` | loetud osaliselt tabelisse või dokumenti ja hoitud tervena külgfailis |
| `raw` | hoitud tervena ainult külgfailis, dekodeerimata |
| `lost` | `seen - decoded - partial - raw`: peab olema 0 |

Ülemine `lost` on summa. Konverteri testid kinnitavad, et see on 0 nende sünteetilistel
näidetel, ja README ütleb, mis see oli päris näidetel. Nullist erinev `lost` on
konverteri teade, et ta rikkus reeglit; see nimetab tüübi, nii et lünk saab üles leida.

"Tüübid" on allika enda: paketi tüübid, sõnumi ID-d, sündmuste nimed, omaduste
rühmad, rea liigid. Neid loetakse kokku seal, kus konverter neid kohtab, mitte
nimekirjast, mida ta oodata oskab, nii et tundmatu tüüp ilmub oma loendiga, mitte ei kao.

## README jaotis Completeness {#the-readmes-completeness-section}

Iga konverteri README-l on jaotis pealkirjaga **Completeness**, kolme loendiga:

- **Read** (loetud): mis läheb tabelisse ja matši dokumenti ning kuidas iga uut välja
  kontrolliti millegi sõltumatu vastu (mängu enda arvud, teine allikas, selleks tehtud salvestis).
- **Kept raw** (hoitud tervena): mis on millises külgfailis, mille `type` all ja mida
  sellest seni teatakse.
- **Not available** (pole kättesaadav): mida allikas ei kanna või mida ei tohi lugeda, ja miks.

See viitab tagasi sellele lehele.

## Kus iga konverter seisab {#where-each-converter-stands}

| Konverter | Külgfailid | Tema jaotis Completeness |
|---|---|---|
| War Thunderi kordused | `messages`, `flight` | [3DHeat-Ext-WarThunder README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (enesekontrolli arvud on jaotises `counts`; plokk `completeness` tuleb hiljem) |
| World of Tanksi kordused | `messages` | [3DHeat-Ext-WoT README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World of Warshipsi kordused | `messages` | [3DHeat-Ext-WoWs README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squadi serverite demod | `entities`, `packets` | [3DHeat-Ext-Squad README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2 demod | `events`, `props`, `strings`, `packets` | [3DHeat-CS2 README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota 2 kordused (vaatleja) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota 2 kordused](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!, LoL, Valorant kordused (vaatleja) | `raw` | nende lehed [vaatleja dokumentatsioonis](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Otsesed adapterid (vaatleja) | `raw` | iga mängu leht [vaatleja dokumentatsioonis](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) ja [arendus](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) `Session.raw` jaoks |
| Ringisalvestajad (mänguvõte) | `raw`, ja `unparsed` baidid Forza ringifailis | [3DHeat-GameCapture README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Vaataja enda importimised | pole: vt allpool | see leht |

### Vaataja enda importimised {#the-viewers-own-imports}

Tacview ACMI, OCAP ja GPS-vormingud loetakse brauseris kasutaja enda failist; vaataja
ei salvesta neist midagi, seega jääb fail ise salvestuseks. Nad loevad siiski nii
palju, kui suudavad:

- **Tacview ACMI** (`src/data/acmi.ts`): iga objektirida asukohaga on rida iga
  omadusega, mida salvestis kannab; iga sündmus on rida; iga eemaldamine on rida;
  salvestise enda omadused (koos päise FileType ja FileVersion väärtustega) on igal
  real veerus `RecordingInfo`; kommentaririda on sündmus `Comment`, objekt, mis ei saa
  kunagi asukohta, on rida `Unplaced` viitepunktis, ning U ja V on veerud, kui mõnel real
  neid on. Omadusrida ilma asukohata loetakse osaliselt: selle väärtused jõuavad objekti
  järgmise reani, mitte oma ajal. `AcmiTable.completeness` loeb faili read liikide kaupa.
- **OCAP** (`src/data/ocap.ts`): iga olemi kaadrid, laskud, markerid, iga sündmuse liik
  (tundmatud liigid ridadena "Mission" oma tekstiga) ja dokumendi enda väljad (`Info`).
  Veel loetud pole: olemi väljad ja päises loetletust erinevad lõpupositsiooni elemendid
  (uuema salvestaja lisandid) ning surnud üksuse korduvad kaadrid pärast surma (tahtlikult
  hõredamaks tehtud: midagi ei muutu neis).
- **GPS-vormingud** (`src/data/geoTracks.ts`): fiksid, nende aeg, kõrgus, kurss ja kiirus
  ning südamerütm, kadents, võimsus, temperatuur, satelliidid, HDOP ja rõhukõrgus, kus
  fail neid logib. Veel loetud pole: muud GPX- ja KML-laiendused, NMEA laused peale
  asukohalausete, IGC kirjed peale fiksite ja nende laienduste ning FIT sõnumid peale
  kirjete (ringid, seansid, seadme info).

Need puudused on loetletud selleks, et neid kõrvaldada, mitte vabanduseks; vaataja
laetud salvestise eksport (`src/data/exportRecording.ts`) kirjutab ainult selle, mis loeti.

## Konverteri lisamine {#adding-a-converter}

1. Loetle, mida vorming sisaldab, selle dokumentatsioonist, selle enda struktuuridest
   või loendades iga sõnumi tüüpi päris näidetes. Loend on enesekontrolli `types`.
2. Dekodeeri see, mida saab praegu kontrollida. Iga uut välja kontrollitakse millegi
   sõltumatu vastu enne, kui see läheb tabelisse; väli, mida ei saa veel kontrollida,
   jääb tervena.
3. Hoia ülejäänu tervena külgfailis, nimetatud nagu eespool, ülaltoodud veergudega.
4. Kirjuta plokk `completeness` ja test, et `lost` on 0.
5. Kirjuta README jaotis Completeness ja viita siia.
6. Kui külgfaili `<what>` on uus, lisa see ülaltoodud tabelisse ja faili
   `src/data/filePick.ts` muutujasse `SIDECAR_PARQUET`.

Konverterid on puhta toaga (clean-room): need kirjutatakse vormingutest, dokumentatsioonist
ja näidetest, mitte kunagi GPL- ega AGPL-koodist. Päris kordustest pärit näidised jäävad
nende tegemise masinasse; testid kasutavad sünteetilisi faile.
