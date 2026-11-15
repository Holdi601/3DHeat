---
title: "Pregled podatkovnih formatov"
nav_order: 19
lang: "sl"
source: "data-formats.md"
source_hash: "23c1890ce185"
translated: true
outdated: false
---

# Pregled podatkovnih formatov

Ta stran navaja vsako vrsto datoteke, ki jo 3DHeat lahko odpre, in kako mora biti videti tabela znotraj nje. Tabela so vrstice in stolpci, kot v preglednici: vsaka vrstica pove, kje je bilo nekaj in, če to imate, kdaj in kdo.

Kaj zavihek Toplotna karta bere, stolpec za stolpcem, in namigi, ki jih lahko nosi datoteka Parquet. (Zavihek Analiza dirke bere datoteke krogov, zavihek Tekma pa povzetke tekem; glejte [Analiza dirke](race-analysis.md) in [Analiza tekme](match-analysis.md).)

## Datoteke {#files}

To je edini popoln seznam datotek, ki jih je mogoče naložiti. Plošča **Vir** (**Datoteke…**, **Mapa…** ali povleci in spusti) sprejme natanko te:

| Končnica | Kaj je | Bere |
|---|---|---|
| `.parquet`, `.pq` | tabela Parquet | bralnik Parquet (spodaj) |
| `.csv`, `.tsv`, `.txt` | besedilo z ločili | bralnik besedila (spodaj) |
| `.3dheat` | ena tekma v eni datoteki (ZIP, ki hrani tabelo in njene dodatke) | se naloži kot tabela, ki jo hrani – [Ena datoteka za tekmo](container.md) |
| `.acmi` (tudi `.txt.acmi`, `.zip.acmi`) | posnetek leta Tacview | lastni bralnik – [Posnetki Tacview](tacview-acmi.md) |
| `.json`, `.json.gz` | posnetek OCAP (v slogu Arme) | lastni bralnik |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | sledi GPS: GPX, KML/KMZ, dnevniki NMEA, dnevniki jadralnega letenja IGC, športne datoteke FIT | lastni bralnik; položaji pridejo iz zemljepisne širine in dolžine |

Niso naložene kot položaji: majhne datoteke JSON, ki stojijo ob tabeli in jo opisujejo (imena, ki se končajo na `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), in dodatne tabele pretvornika (`<tekma>.events.parquet` in podobne, glejte [Pretvorniki](converters.md)), razen če jih izberete posebej. Vse drugo se preskoči z razlogom. Kako se izbor filtrira, je razloženo v [Nalaganje datotek](loading-files.md#which-files-are-kept).

Prazne datoteke se preskočijo. V izboru, ki vsebuje datoteke `movement*.<ext>`, se naložijo samo te ([Nalaganje datotek](loading-files.md#which-files-are-kept)).

Podatki so **ena vrstica na vzorec**: položaj ob trenutku, po želji s kom, katera skupina, katera seja, kam je gledal in morebitni dodatni stolpci. Dogodkovne vrstice (ubitje, postavitev, strel) so lahko v isti tabeli kot vrstice položajev, ločene s stolpcem dogodka.

## Besedilo z ločili (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Najmanjša koristna datoteka, tri vrstice:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Stolpci se sami preslikajo ([Preslikava stolpcev](column-mapping.md)).

Razčleni jo skener na ravni bajtov, ki dekodira samo preslikane stolpce ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Vidik | Pravilo |
|---|---|
| Glava | Prva neprazna vrstica vsebuje imena stolpcev. Prazno ime postane `column_N`. |
| Ločilo | Zazna se iz prvih 20 neprazni vrstic prvega 1 MiB, med vejico, podpičjem, tabulatorjem in navpično črto, po **skladnosti**: ločilo, ki da isto število polj v vsaki vzorčeni vrstici, zmaga, nato tisto, ki da več polj. Presledek se nikoli ne zazna, lahko pa se izbere; vpisati je mogoč kateri koli posamezen znak ([Preslikava stolpcev](column-mapping.md#the-fields)). |
| Narekovaji | RFC 4180: polja so lahko obdana z dvojnimi narekovaji, `""` znotraj narekovajev je dobesedni narekovaj. |
| Presledki | Začetni in končni presledki, tabulatorji in narekovaji se odstranijo iz vsakega polja. |
| Polja na vrstico | Največ 4.096; več je napaka (*je ločilo pravilno?*). |
| Števila | Neobvezen predznak, števke, neobvezna `.` in decimalke, neobvezen eksponent (`1.5e-3`). Decimalna vejica (`1,5`), ločila tisočev ali končne enote (`12 m`) se ne razčlenijo in štejejo kot manjkajoče. Če vaša datoteka uporablja decimalne vejice, jih pred nalaganjem zamenjajte s pikami (deluje iskanje in zamenjava v urejevalniku besedila). |
| Numerični stolpec | Stolpec se ponudi kot numeričen, kadar se več kot 90 % neprazni vrednosti v prvih 50 vrsticah razčleni v števila. |
| Število vrstic | Oceni se pred nalaganjem iz povprečne dolžine vrstice prvega 1 MiB. |
| Kodiranje besedila | UTF-8. |

## Parquet {#parquet}

Bere se s [hyparquet](https://github.com/hyparam/hyparquet), kos stolpca za kosom v tipizirane nize, pri čemer se zahtevajo samo preslikani stolpci ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Vidik | Pravilo |
|---|---|
| Število vrstic | Natančno, iz noge datoteke, pred nalaganjem. |
| Predogled | Prvih 50 vrstic, dekodiranih kot predmeti; njihove vrednosti določijo, kateri stolpci izgledajo numerično. |
| Cela števila | `INT32` in `INT64` (dekodirano kot BigInt) postaneta števili. |
| Decimalna števila | `FLOAT`, `DOUBLE`. |
| Logične vrednosti | 1 in 0. |
| Nizi | Uporabljajo se za stolpce osebe, skupine, seje in kategorije; niz, ki izgleda kot število, se sprejme za numerične vloge. |
| Logična tipa `TIMESTAMP`, `DATE` | Dekodirata se v trenutke (milisekunde od 1970); uporabljeta se kot časovna os, nastavitev enote se prezre. |
| Gnezdeni stolpci | Stolpci struct in list niso namenjeni nobeni vlogi (predogledajo se kot besedilo JSON); neoverjeno. |
| Metapodatki noge | Ključ `heat3d` se prebere kot namigi za preslikavo (spodaj). |

Stolpec položaja, časa ali pogleda, ki vsebuje kaj drugega kot število, se dekodira kot manjkajoč.

## Vloge stolpcev in tipi {#column-roles-and-types}

| Vloga | Tip v datoteki | Obvezno | Shranjeno kot | Omejitve |
|---|---|---|---|---|
| X, Y, Z | število | dva od treh | 32-bitna plavajoča vejica, po [preslikavi osi](axes-units-and-time.md) | Vrstica brez uporabnega položaja se zavrže. |
| Čas | število v eni od [časovnih enot](axes-units-and-time.md#time-units), časovni žig Parquet ali besedilo ISO-8601 | ne | 32-bitne plavajoče sekunde od najzgodnejše vrstice | Razvrščanje je zavrnjeno nad 400.000.000 vrsticami ([zakaj](memory-and-budgets.md#the-sort-ceiling)). |
| Oseba | karkoli; s slovarskim kodiranjem | ne | 32-bitni id | |
| Seja | karkoli; s slovarskim kodiranjem | ne | 32-bitni id | Oznake navedene do 100.000 sej. |
| Skupina | karkoli; s slovarskim kodiranjem | ne | 16-bitni id | Do 4.096 skupin, sicer se združevanje opusti. |
| Zasuk, nagib | število, stopinje ali radiani | ne | 32-bitna plavajoča vejica v radianih | |
| Smer X, Y, Z | število | ne (vse tri skupaj) | pretvorjeno v zasuk in nagib | |
| Filtrirni stolpec, *razpon* | število | ne | 32-bitna plavajoča vejica | Največ 4 aktivni filtri hkrati. |
| Filtrirni stolpec, *kategorija* | karkoli; s slovarskim kodiranjem | ne | 32-bitni id | Do 4.096 vrednosti, sicer stolpec ni ohranjen. |

Stolpec `TIMESTAMP` Parquet, ohranjen kot filtrirni stolpec, je *razpon* milisekund
epohe – drsnik, ne seznam.

## Stolpci izida {#outcome-columns}

Kdo je zmagal, v vsaki vrstici, da lahko mesto, pot ali potezo ocenite po tem, kako pogosto je njena stran nato zmagala ([Delež zmag](win-rate.md)). Pregledovalnik te stolpce obdrži sam, jih navede prve v [filtrih](filters.md) v jeziku pregledovalnika in jih bere v [zemljevidu deleža zmag](win-rate.md), v [razčlenitvi](breakdown.md) in v [statistiki prostornin](volumes.md#statistics). Pretvornik za igro s krogi (CS2, Valorant, Rainbow Six Siege) ali s tekmami (War Thunder) zapiše vse štiri:

| Stolpec | Tip | Pomen |
|---|---|---|
| `won` | 0/1 (prazno, kjer ni znano) | stran (ekipa) vrstice je zmagala **krog**; v igri brez krogov tekmo |
| `matchWon` | 0/1 (prazno, kjer ni znano) | stran (ekipa) vrstice je zmagala **tekmo**; prazno, kjer posnetek ne pokaže konca |
| `round` | celo število, od 1 | krog, h kateremu spada vrstica; v igri s tekmami povsod 1 |
| `roundEndReason` | besedilo | kako se je krog končal (v igri s tekmami tekma), z besedami spodaj |

`won` in `matchWon` pripadata strani vrstice: vrstice igralca T nosijo izid strani T, vrstice enote AI izid njene ekipe; vrstice, ki ne pripadajo nobeni strani, ju pustijo prazna. Stran, ki ob polčasu zamenja stran, obdrži svoj `matchWon` in vzame `won` vsakega kroga tako, kot ga je igrala. Neodločen izid je 0 za obe strani.

Razlogi za konec so skupni vsem igram, da en filter deluje na vseh (lastna beseda igre se preslika, kjer se da, [`data/outcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/outcome.ts)):

| `roundEndReason` | Pomen | Igre |
|---|---|---|
| `elimination` | izpadli so vsi igralci ene strani | CS2, Valorant, Rainbow Six Siege |
| `bomb` | bomba (spike, cilj razoroževalca) je eksplodirala | CS2, Valorant, Rainbow Six Siege |
| `defuse` | bomba (spike) je razorožena | CS2, Valorant, Rainbow Six Siege |
| `time` | čas kroga je potekel; War Thunder: odločeno, ko sta obe strani še imeli vstopnice | vse |
| `surrender` | stran se je predala | CS2, Valorant, Rainbow Six Siege |
| `draw` | brez zmagovalca | CS2 |
| `objective` | cilj zavzet ali zadržan (talec izpeljan, območje zavarovano) | Rainbow Six Siege |
| `capture` | vstopnice so pošle, medtem ko je zmagovalec držal cone za zavzetje | War Thunder |
| `tickets` | vstopnice izgubljene zaradi ubojev | War Thunder |
| `destruction` | zadnja vozila izgubljena naenkrat, nihče ne more več vstopiti | War Thunder |
| `other` | karkoli drugega | |

Navedite jih tudi v seznamu `extra` v namigih `heat3d`, kot vsak drug stolpec. Imena stolpcev `win`, `round_won`, `match_won`, `end_reason` in `win_reason` se berejo kot isti stolpci.

## Namigi `heat3d` {#the-heat3d-hints}

Datoteka Parquet lahko nosi lastna navodila za branje v metapodatkih ključ/vrednost
noge pod ključem **`heat3d`**, kot predmet JSON ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Pregledovalnik jih uporabi čez lastne ugibe, kadar je datoteka prva v izboru; vsak vnos je neobvezen in vsak rezultat se še vedno prikaže in ureja na plošči [Preslikava stolpcev](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Vse, kar se ne razčleni kot predmet JSON, se prezre.

### Shema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          imena stolpcev za položaj
    "time": string,                                  časovni stolpec
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           filtrirni stolpci za ohranitev, najkoristnejši najprej
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  mora biti > 0
  },
  "entity": {
    "size": number                                   velikost enega sledenega predmeta v enotah datoteke, > 0
  }
}
```

| Vnos | Uporabi se, ko | Učinek |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | navedeni stolpec obstaja v datoteki | Nastavi to vlogo. |
| `columns.timeUnit` | je ena od sedmih enot | Nastavi časovno enoto. |
| `columns.angleUnit` | `"degrees"` ali `"radians"` | Nastavi enoto kota. |
| `columns.lookMode` | `"vector"`, ko so dirX, dirY in dirZ vsi nastavljeni; `"yawPitch"`, ko je nastavljen yaw; `"none"` | Nastavi način pogleda. |
| `columns.extra` | je polje | Nadomesti samodejni seznam filtrov in ohrani samo obstoječe stolpce, ki jih nobena vloga ne uporablja; vsak je *razpon*, kadar je v predogledu izgledal numerično, sicer *kategorija*. Brez tega se samodejni seznam ohrani brez stolpcev, ki jih je namig dodelil vlogi. |
| `axes.up` | `"y"` ali `"z"` | Os navzgor. |
| `axes.flipX/Y/Z` | logična vrednost | Obrnitve. |
| `axes.scale` | število > 0 | Merilo enote. |
| `entity.size` | število > 0 | [Velikost entitete](sessions-persons-groups.md#entity-size) (pri nalaganju pomnožena z merilom enote). Edini način, kako jo nastaviti. |

### Primer {#example}

Izmišljen izvoz strelske igre: Z navzgor, centimetri, levosučni svet, igralci široki okoli 72 cm.

```json
{
  "columns": {
    "x": "pos_x", "y": "pos_y", "z": "pos_z",
    "time": "t", "timeUnit": "seconds",
    "personId": "player", "teamId": "side", "sessionId": "round_id",
    "lookMode": "yawPitch", "yaw": "view_yaw", "pitch": "view_pitch", "angleUnit": "degrees",
    "extra": ["event", "weapon", "map"]
  },
  "axes": { "up": "z", "flipY": true, "scale": 0.01 },
  "entity": { "size": 72 }
}
```

### Pisanje {#writing-it}

S pyarrow se metapodatki sheme po meri zapišejo v metapodatke ključ/vrednost datoteke:

```python
import json
import pyarrow as pa
import pyarrow.parquet as pq

table = pa.table({...})
hints = {"columns": {"x": "pos_x", "y": "pos_y", "z": "pos_z", "time": "t"}, "axes": {"up": "z"}}
meta = dict(table.schema.metadata or {})
meta[b"heat3d"] = json.dumps(hints).encode("utf-8")
pq.write_table(table.replace_schema_metadata(meta), "movement.parquet")
```

`npm run inspect -- file.parquet` izpiše shemo datoteke, kar je hiter način za preverjanje imen stolpcev, na katera se nanašajo namigi.

## Kaj zapiše zavihek Toplotna karta {#what-the-heatmap-tab-writes}

Nič se ne zapiše nazaj v podatke. Izhodi so:

- videi kot WebM (VP9 ali VP8) – [Pot kamere in video](camera-path-and-video.md);
- položaj kamere, kopiran v odložišče kot besedilo – [Kamera](camera.md#pose);
- nivoji, shranjeni v [knjižnici nivojev](level-library.md) brskalnika.
