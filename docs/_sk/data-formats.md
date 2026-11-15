---
title: "Referencia dátových formátov"
nav_order: 19
lang: "sk"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: false
---

# Referencia dátových formátov

Táto stránka uvádza každý druh súboru, ktorý 3DHeat dokáže otvoriť, a ako musí tabuľka vnútri vyzerať. Tabuľka je riadky a stĺpce, ako v tabuľkovom hárku: každý riadok hovorí, kde niečo bolo a, ak to viete, kedy a kto.

Čo karta Heatmapa číta, stĺpec po stĺpci, a tipy, ktoré môže niesť súbor Parquet. (Karta Analýza pretekov číta súbory kôl a karta Zápas súhrny zápasov; pozri [Analýza pretekov](race-analysis.md) a [Analýza zápasu (CS2)](match-analysis.md).)

## Súbory {#files}

Toto je jediný úplný zoznam súborov, ktoré sa dajú načítať. Panel **Zdroj** (**Súbory…**, **Priečinok…**, alebo pretiahnutie myšou) prijme presne tieto:

| Prípona | Čo to je | Číta to |
|---|---|---|
| `.parquet`, `.pq` | tabuľka Parquet | čítač Parquet (nižšie) |
| `.csv`, `.tsv`, `.txt` | text s oddeľovačmi | čítač textu (nižšie) |
| `.3dheat` | jeden zápas v jednom súbore (ZIP, ktorý drží tabuľku a jej prílohy) | načíta sa ako tabuľka, ktorú obsahuje - [Jeden súbor na zápas (.3dheat)](container.md) |
| `.acmi` (tiež `.txt.acmi`, `.zip.acmi`) | záznam letu Tacview | vlastný čítač - [Nahrávky Tacview (ACMI)](tacview-acmi.md) |
| `.json`, `.json.gz` | záznam OCAP (ako v Arme) | vlastný čítač |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS stopy: GPX, KML/KMZ, záznamy NMEA, záznamy klzákov IGC, športové súbory FIT | vlastný čítač; pozície sa berú zo zemepisnej šírky a dĺžky |

Ako pozície sa nenačítavajú: malé súbory JSON, ktoré stoja vedľa tabuľky a popisujú ju (názvy končiace na `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), a ďalšie tabuľky konvertora (`<zápas>.events.parquet` a podobne, pozri [Konvertory zachovajú všetko](converters.md)), pokiaľ ich nevyberiete samostatne. Všetko ostatné sa preskočí s uvedením dôvodu. Ako sa výber filtruje, je vysvetlené v [Načítanie súborov](loading-files.md#which-files-are-kept).

Prázdne súbory sa preskočia. Vo výbere, ktorý obsahuje súbory `movement*.<prípona>`, sa načítajú len tie ([Načítanie súborov](loading-files.md#which-files-are-kept)).

Dáta sú **jeden riadok na vzorku**: pozícia v okamihu, voliteľne s tým, kto, ktorá skupina, ktorá relácia, kam sa pozeralo, a ďalšie stĺpce. Riadky udalostí (zostrel, položenie, výstrel) môžu byť v tej istej tabuľke ako riadky pozícií; rozlíšia sa podľa stĺpca udalostí.

## Text s oddeľovačmi (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Najmenší užitočný súbor, tri riadky:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Stĺpce sa namapujú samy ([Mapovanie stĺpcov](column-mapping.md)).

Spracuje ich skener na úrovni bajtov, ktorý dekóduje len namapované stĺpce ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Oblasť | Pravidlo |
|---|---|
| Hlavička | Prvý neprázdny riadok obsahuje názvy stĺpcov. Prázdny názov sa zmení na `column_N`. |
| Oddeľovač | Zisťuje sa z prvých 20 neprázdnych riadkov prvého 1 MiB, medzi čiarkou, bodkočiarkou, tabulátorom a zvislou čiarou, podľa **konzistencie**: vyhrá oddeľovač, ktorý dáva rovnaký počet polí na každom vzorkovanom riadku, potom ten, ktorý dáva viac polí. Medzera sa nikdy nezistí, ale dá sa vybrať; dá sa napísať ľubovoľný jediný znak ([Mapovanie stĺpcov](column-mapping.md#the-fields)). |
| Úvodzovky | RFC 4180: polia môžu byť v dvojitých úvodzovkách, `""` vnútri úvodzoviek je doslovná úvodzovka. |
| Medzery | Úvodné a koncové medzery, tabulátory a úvodzovky sa z každého poľa odstránia. |
| Polia na riadok | Najviac 4 096; viac je chyba (*je správny oddeľovač?*). |
| Čísla | Voliteľné znamienko, číslice, voliteľná `.` a desatinné miesta, voliteľný exponent (`1.5e-3`). Desatinná čiarka (`1,5`), oddeľovače tisícov ani jednotky za číslom (`12 m`) sa nedajú prečítať a počítajú sa ako chýbajúce. Ak váš súbor používa desatinné čiarky, pred načítaním ich nahraďte bodkami (funguje nájdi a nahraď v textovom editore). |
| Číselný stĺpec | Stĺpec sa ponúkne ako číselný, keď sa viac než 90 % neprázdnych hodnôt v prvých 50 riadkoch dá prečítať ako čísla. |
| Počet riadkov | Odhadne sa pred načítaním z priemernej dĺžky riadku prvého 1 MiB. |
| Kódovanie textu | UTF-8. |

## Parquet {#parquet}

Číta sa knižnicou [hyparquet](https://github.com/hyparam/hyparquet), blok stĺpca po bloku stĺpca do typovaných polí, pričom sa žiadajú len namapované stĺpce ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Oblasť | Pravidlo |
|---|---|
| Počet riadkov | Presný, z pätičky, pred načítaním. |
| Náhľad | Prvých 50 riadkov, dekódovaných ako objekty; ich hodnoty rozhodnú, ktoré stĺpce vyzerajú ako číselné. |
| Celé čísla | `INT32` a `INT64` (dekódované ako BigInt) sa stanú číslami. |
| Desatinné čísla | `FLOAT`, `DOUBLE`. |
| Logické hodnoty | 1 a 0. |
| Reťazce | Používajú sa pre stĺpce osôb, skupín, relácií a kategórií; číselne vyzerajúci reťazec sa prijme pre číselné úlohy. |
| Logické typy `TIMESTAMP`, `DATE` | Dekódujú sa na okamihy (milisekundy od roku 1970); ak sa použijú ako časová os, nastavenie jednotky sa ignoruje. |
| Vnorené stĺpce | Stĺpce struct a list nie sú určené pre žiadnu úlohu (v náhľade sa zobrazia ako text JSON); netestované. |
| Metadáta v pätičke | Kľúč `heat3d` sa číta ako nápovedy na mapovanie (nižšie). |

Pozícia, čas alebo stĺpec pohľadu, ktorý obsahuje niečo iné než číslo, sa dekóduje ako chýbajúci.

## Úlohy a typy stĺpcov {#column-roles-and-types}

| Úloha | Typ v súbore | Povinné | Uložené ako | Limity |
|---|---|---|---|---|
| X, Y, Z | číslo | dve z troch | 32-bitové desatinné číslo, po [mapovaní osí](axes-units-and-time.md) | Riadok bez použiteľnej pozície sa zahodí. |
| Čas | číslo v jednej z [jednotiek času](axes-units-and-time.md#time-units), časová značka Parquet alebo text ISO-8601 | nie | 32-bitové desatinné číslo v sekundách od najskoršieho riadku | Triedenie sa odmietne nad 400 000 000 riadkov ([prečo](memory-and-budgets.md#the-sort-ceiling)). |
| Osoba | ľubovoľný; slovníkovo kódovaný | nie | 32-bitové id | |
| Relácia | ľubovoľný; slovníkovo kódovaný | nie | 32-bitové id | Názvy sa vypíšu až pre 100 000 relácií. |
| Skupina | ľubovoľný; slovníkovo kódovaný | nie | 16-bitové id | Až 4 096 skupín, inak sa členenie zahodí. |
| Yaw, pitch | číslo, stupne alebo radiány | nie | 32-bitové desatinné číslo v radiánoch | |
| Smer X, Y, Z | číslo | nie (všetky tri naraz) | prevedie sa na yaw a pitch | |
| Filtračný stĺpec, *rozsah* | číslo | nie | 32-bitové desatinné číslo | Naraz najviac 4 aktívne filtre. |
| Filtračný stĺpec, *kategória* | ľubovoľný; slovníkovo kódovaný | nie | 32-bitové id | Až 4 096 hodnôt, inak sa stĺpec neuchová. |

Stĺpec `TIMESTAMP` v Parquet, ktorý sa ponechá ako filtračný stĺpec, je *rozsah* milisekúnd epochy - posuvník, nie zoznam.

## Nápovedy `heat3d` {#the-heat3d-hints}

Súbor Parquet môže niesť vlastné pokyny na čítanie v metadátach kľúč/hodnota v pätičke, pod kľúčom **`heat3d`**, ako objekt JSON ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Prehliadač ich použije namiesto vlastných odhadov, keď je súbor prvý vo výbere; každá položka je voliteľná a každý výsledok sa stále ukáže a dá sa upraviť v paneli [Mapovanie stĺpcov](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Čokoľvek, čo sa nedá prečítať ako objekt JSON, sa ignoruje.

### Schéma {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          názvy stĺpcov pre pozíciu
    "time": string,                                  stĺpec času
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           filtračné stĺpce na ponechanie, najužitočnejšie prvé
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  musí byť > 0
  },
  "entity": {
    "size": number                                   veľkosť jednej sledovanej veci v jednotkách súboru, > 0
  }
}
```

| Položka | Použije sa, keď | Účinok |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | pomenovaný stĺpec v súbore existuje | Nastaví túto úlohu. |
| `columns.timeUnit` | je jednou zo siedmich jednotiek | Nastaví jednotku času. |
| `columns.angleUnit` | `"degrees"` alebo `"radians"` | Nastaví jednotku uhla. |
| `columns.lookMode` | `"vector"` so všetkými dirX, dirY a dirZ nastavenými; `"yawPitch"` s nastaveným yaw; `"none"` | Nastaví režim pohľadu. |
| `columns.extra` | je to pole | Nahradí automatický zoznam filtrov a ponechá len existujúce stĺpce, ktoré nepoužíva žiadna úloha; každý je *rozsah*, ak v náhľade vyzeral ako číselný, inak *kategória*. Bez tejto položky sa automatický zoznam ponechá bez stĺpcov, ktoré nápoveda priradila k úlohe. |
| `axes.up` | `"y"` alebo `"z"` | Zvislá os. |
| `axes.flipX/Y/Z` | logická hodnota | Otočenia. |
| `axes.scale` | číslo > 0 | Mierka jednotiek. |
| `entity.size` | číslo > 0 | [Veľkosť entity](sessions-persons-groups.md#entity-size) (pri načítaní sa násobí mierkou jednotiek). Jediný spôsob, ako ju nastaviť. |

### Príklad {#example}

Vymyslený export strieľačky: os Z smerom hore, centimetre, svet v ľavotočivej sústave, hráči asi 72 cm široki.

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

### Zápis {#writing-it}

S pyarrow sa vlastné metadáta schémy zapíšu do metadát kľúč/hodnota súboru:

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

`npm run inspect -- file.parquet` vypíše schému súboru, čo je rýchly spôsob, ako skontrolovať názvy stĺpcov, na ktoré sa nápovede odkazujú.

## Čo zapisuje karta Heatmapa {#what-the-heatmap-tab-writes}

Do dát sa nič nezapisuje späť. Výstupy sú:

- videá vo formáte WebM (VP9 alebo VP8) - [Dráha kamery a video](camera-path-and-video.md);
- pohľad kamery, skopírovaný do schránky ako text - [Kamera](camera.md#pose);
- levely uložené v prehliadači v [knižnici levelov](level-library.md).
