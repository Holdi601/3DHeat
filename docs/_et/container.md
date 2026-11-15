---
title: "Üks fail matši kohta (.3dheat)"
parent: "Andmete sisselugemine"
nav_order: 9
lang: "et"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Üks fail matši kohta: `.3dheat`

`.3dheat` fail on terve matš ühes failis, et seda kopeerida, alles hoida või jagada. Avamiseks lohista
fail lihtsalt allikapaneelile.

```
match.3dheat   (ZIP-fail)
  manifest      mis matš on ja loend kõigest, mis sees on
  table         positsioonid (Parquet)
  match.json    matši dokument
  sidecars      mida konverter hoidis tervena (sündmused, sõnumid, ...)
```

Konverditud matš oli varem mitu kõrvuti asuvat faili: tabel
`<match>.parquet`, matši dokument `<match>.match.json` ja lisafailid
`<match>.<mis>.parquet` ([Konverterid hoiavad kõike](converters.md)). Fail
`.3dheat` hoiab neid kõiki ühes: üks replay, üks fail, mida kopeerida, alles
hoida või jagada.

See on tehtud nii, et tuhande sellise laadimine on sama kiire kui lahtiste
tabelite laadimine, ja nii, et hilisemad konverterid saavad sinna palju rohkem
panna ilma uue vormingu vajaduseta.

## Ühe laadimine {#loading-one}

Kõikjal, kus fail või kaust laaditakse, laaditakse ka `.3dheat` fail, ning kaust
võib segada konteinereid ja lahtisi faile:

| Kus | Mida konteinerist loetakse |
|---|---|
| **Soojuskaardi** allikapaneel (failid, kaust, lohistamine) | selle tabelid, nagu oleksid need lahtine `<match>.parquet` |
| **Soojuskaart → Mitu matši korraga** (Failid, Kaust, Lisa kaust) | selle tabelid, loetakse kohapeal laaduri töötajate poolt |
| **Matš** sakk (Laadi, või lohista vaatele) | matši dokument |
| **Taktika** tahvli telemeetria | selle tabelid |

Konteineri avamisel loetakse selle kaks väikest osa, tema kataloog lõpus ja
manifest alguses; tabeli ühtegi osa ei loeta enne, kui laadur seda loeb.
Lisafaile ja matši dokumenti loetakse ainult siis, kui keegi neid nõuab. Kaust,
mis hoiab sama matši kaks korda, lahtisena ja pakituna, laadib selle ühe korra.

## Pakkimine ja lahtipakkimine {#packing-and-unpacking}

Uued konverteerimised kirjutavad vaikimisi konteinerid: War Thunderi konverter
(`heat3d-wt-replay`), CS2 konverter (`heat3d_cs2 demos`) ja Tacview tööriist
(`node tools/acmi-to-parquet.mjs`). `--loose` hoiab eraldi failid alles.

Varem või teiste tööriistadega konverditud matšid pakitakse käsuga:

```
node tools/3dheat-pack.mjs <kaust>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <kaust|fail.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <kaust|fail.3dheat>...
node tools/3dheat-pack.mjs update <fail.3dheat> [--add <roll>[:<nimi>]=<fail>]... [--remove <nimi>]...
node tools/3dheat-pack.mjs repack <kaust|fail.3dheat>...
```

- **pack** leiab kaustade alt iga tabeli `<match>.parquet` koos failidega, mis
  sellele kuuluvad, ja kirjutab `<match>.3dheat` nende kõrvale. Juba pakitud
  matš jäetakse vahele. Iga konteiner loetakse enne kõike terviklikult tagasi
  (iga liikme sha256, suurus, CRC ja Parquet'i jalus); lahtised failid
  kustutatakse ainult käsuga `--delete-loose`, ning varem pakitud matši puhul
  ainult siis, kui need on baitide kaupa täpselt see, mida konteiner hoiab.
  Matš, mille fail on muutunud viimasel `--settle` minutil (vaikimisi 10), jäetakse
  puutumata: konverter võib seda veel kirjutada.
- **unpack** kirjutab liikmed tagasi lahtiste failidena konteineri kõrvale.
- **update** lisab või asendab liikmeid, kirjutamata ümber konteinerisse juba
  jäänud tabeleid (allpool).
- **repack** kirjutab konteineri tervena uuesti, jättes välja, mis uuendused maha jätsid.

## Vorming {#the-format}

`.3dheat` fail on ZIP-arhiiv (iga ZIP-tööriist avab selle), järgmiste reeglitega:

1. **`manifest.json` on esimene liige**, kui konteiner kirjutatakse, ja on alati olemas.
   Seda leitakse ZIP-i keskkataloogi kaudu, nii et pärast `update`-i võib see asuda
   failis hiljem.
2. **Liikmed, mida loetakse baitivahemiku järgi või mis on juba pakitud, salvestatakse**
   (ZIP-meetod 0): Parquet, Arrow, pildid, mudelid, heli, video, läbipaistmatud
   plokid. Salvestatud liige on konteineri üks järjestikune baitivahemik, nii et lugeja
   loeb tabeli jaluse ja selle veeruosad kohapeal, brauseris `File.slice` abil või HTTP
   vahemikupäringuga, täpselt nii nagu loeks lahtist faili.
3. **Tekst on deflateeritud** (meetod 8): JSON, CSV, lihttekst. Need on väikesed ja
   loetakse tervena.
4. Nimed on UTF-8 (lipik bitt 11), suhtelised, `/`-ga eraldatud, ilma `..`-ta; need
   võivad sisaldada kaustu (`analysis/heat.json`). Pakitud lahtine fail säilitab oma
   nime, nii et lahtipakkimine annab tagasi samad failid.
5. Liikmed suuremad kui 4 GiB või konteinerid rohkem kui 65 535 liikmega kasutavad
   tavapäraselt ZIP64-d. Kirjutajad ei pane liikmete järele andmekirjeldajaid.

Liikmed, mida konverterid praegu kirjutavad, selles järjekorras:

| Roll | Liige | Salvestatud |
|---|---|---|
| `table` | `<match>.parquet` | jah |
| `match` | `<match>.match.json` | ei (deflateeritud) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<roll>.parquet` | jah |
| `summary` | `<match>.summary.json`, massindeksi kokkuvõte ([Massanalüüs](mass-analysis.md)), lisab `tools/3dheat-summarize.mjs` | ei (deflateeritud) |

Tabel tuleb kohe pärast manifesti, nii et lugeja esimene lugemine faili algusest katab nii manifesti kui ka tabeli kohaliku päise.

### Manifest {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<map>_RB_<date>_<session>",
 "map": "<map>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<match>.parquet", "match": "<match>.match.json", "flight": "<match>.flight.parquet" },
 "members": [
  {
   "name": "<match>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 hex digits>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| Väli | Tähendus |
|---|---|
| `format` | alati `3dheat` |
| `format_version` | `major.minor` (allpool) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | mis matš on ja mis selle tegi; `null`, kui teada ei ole |
| `created`, `updated` | millal kirjutati, millal viimati uuendati (`updated` ilmub ainult pärast uuendust) |
| `roles` | iga roll selle esimese liikme nimeni: kiire register |
| `members` | kõik liikmed, välja arvatud manifest: täielik loend, ja see, mida lugeja usaldab |
| `matches` | valikuline: mitme matši konteineri matšid (allpool) |
| `references` | valikuline: failid, mida konteiner vajab, aga ei hoia |
| `extensions` | valikuline: konverteri enda metaandmed |

Iga liige:

| Väli | Tähendus |
|---|---|
| `name` | tee konteineris |
| `role` | milleks see on (allpool) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` või `deflate` |
| `bytes` | selle suurus, pakkimata |
| `sha256` | selle baitide oma, pakkimata |
| `rows` | tabeli ridade arv |
| `schema` | konventsioon, mida ta järgib, `{ "id", "version" }`: dokumendi enda `format` ja `version` (`heat3d-wt-replay-match` 2), `heat3d-table` tabeli jaoks, mida vaatur loeb oma `heat3d` jaluse järgi, `heat3d-acmi-table` Tacview tööriista omale |
| `match` | mitme matši konteineris `matches[].id`, kuhu see kuulub |

### Loodud kasvama {#made-to-grow}

Vorming on mõeldud kandma palju rikkalikumaid replay'sid kui praegu, ilma et see
murraks seda, mis neid praegu loeb:

- **Versioonimine.** `format_version` on `major.minor`. Lugeja loeb kõiki oma major-versiooni
  minor-versioone ja ignoreerib iga välja, mida ei tunne. Minor tõuseb, kui midagi lisatakse;
  major ainult siis, kui paigutus muutub nii, et vanem lugeja loeks seda valesti (liige ei ole
  enam salvestatud, manifest on arhiivist välja viidud). Iga liikme enda konventsioon on
  eraldi versioonitud tema `schema`-s, nii et uus tabelipaigutus või uus dokumendiversioon ei
  vaja uut konteinerversiooni. Esimesed kirjutatud konteinerid ütlesid selle asemel `"version": 1`;
  lugejad võtavad seda kui 1.0.
- **Rollid on avatud.** Roll on mis tahes string. Lugejad kasutavad rolle, mida tunnevad, ja
  hoiavad ülejäänud alles: tundmatu roll on loetletud, mitte kunagi tagasi lükatud, ning `update`
  ja `repack` kannavad selle puutumata edasi. Rollil võib olla palju liikmeid: mitu tabelit
  (üksuste kaupa rajad, telemeetria teistes sagedustes), sündmused, hääl, video sünkroonimine,
  taseme viited, kujude ülekirjutused, analüüsi tulemused. Nimed võivad sisaldada kaustu.
- **Mis tahes meedia.** Liige võib olla mis tahes meediatüübiga: Parquet, JSON, Arrow, PNG või
  JPEG pisipildid, glTF mudelid, heli, tooreid plokke.
- **Mitu matši.** Seanss või turniir võib minna ühte konteinerisse: `matches` loetleb need
  (`{ "id", "map", "mode", "started", ... }`) ja iga liige nimetab oma `match`-i. Vaatur laadib
  iga rolli `table` liikme.
- **Viited.** Failid, mida konteiner vajab, aga ei hoia, näiteks ühe matši taset, on loetletud
  `references`-is nime ja sha256 järgi (`{ "kind": "level", "name": "...", "sha256": "..." }`), nii
  et õige fail leitakse ja kontrollitakse ilma seda igasse matši kopeerimata.
- **Laiendused.** `extensions` hoiab konverteri enda metaandmeid tema enda võtme all,
  `"<tootja>/<nimi>": { ... }`, nii et kaks konverterit ei põrka kunagi kokku ja jagatud välju ei
  pea midagi lisama.
- **Uuendamine kohapeal.** `update` lisab või asendab liikmeid, kirjutamata ümber suuri salvestatud
  tabeleid: uued liikmed ja uus manifest lisatakse konteineri lõpule, millele järgneb uus keskkataloog.
  See, mis asendati, jääb viitamata baitidena alles kuni `repack`-ini. Iga liige ja iga manifesti väli,
  tuntud või mitte, säilib. Ebaõnnestunud uuendus lõigatakse tagasi konteinerile, nagu see oli.

Vaaturi testid hoiavad seda nõudeid: formaadi 1.7 konteiner tundmatu rolli, liikme välja, laiendi ja heliliikmega
kaustas laaditakse ja jääb uuenduse ja repacki järel tervena; major 2 konteiner lükatakse tagasi.

## Kirjutajad {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (kirjutab, loeb, kontrollib, uuendab, repackib), mida kasutavad pakkimistööriist ja Tacview tööriist.
- Python: `container.py`, umbes 140 rida standardsel `zipfile`-il, sama fail igas konverteris
  (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), nii et ükski konverter ei sõltu
  teisest. Uus konverter kopeerib selle.
- Vaatur loeb failiga
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
