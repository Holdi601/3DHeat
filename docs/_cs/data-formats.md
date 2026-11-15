---
title: "Přehled datových formátů"
nav_order: 19
lang: "cs"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: false
---

# Přehled datových formátů

Tato stránka uvádí každý druh souboru, který 3DHeat umí otevřít, a jak musí vypadat tabulka uvnitř něj. Tabulka je řádky a sloupce jako v tabulkovém procesoru. Každý řádek říká, kde něco bylo a případně kdy a kdo.

Co záložka Heatmap čte, sloupec po sloupci, a nápovědy, které může soubor Parquet nést. (Záložka Analýza závodu čte soubory kol a záložka Zápas souhrny zápasů. Viz [Analýza závodu](race-analysis.md) a [Analýza zápasů](match-analysis.md).)

## Soubory {#files}

Toto je jediný úplný seznam soubory, které lze načíst. Panel **Zdroj** (**Soubory…**, **Složka…**, nebo přetažení) přijme přesně tyto:

| Přípona | Co to je | Čte ho |
|---|---|---|
| `.parquet`, `.pq` | tabulka Parquet | čtečka Parquet (níže) |
| `.csv`, `.tsv`, `.txt` | text s oddělovači | čtečka textu (níže) |
| `.3dheat` | jeden zápas v jednom souboru (ZIP s tabulkou a jejími přílohami) | načte se jako tabulka, kterou drží: [Jeden soubor na zápas](container.md) |
| `.acmi` (také `.txt.acmi`, `.zip.acmi`) | záznam letu Tacview | vlastní čtečka: [Záznamy Tacview](tacview-acmi.md) |
| `.json`, `.json.gz` | záznam OCAP (ve stylu Arma) | vlastní čtečka |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS stopy: GPX, KML/KMZ, záznamy NMEA, záznamy plachtění IGC, sportovní soubory FIT | vlastní čtečka. Pozice se berou ze zeměpisné šířky a délky |

Jako pozice se nenačítají malé soubory JSON, které leží vedle tabulky a popisují ji (názvy končící na `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`). Nenačítají se ani přílohy převaděče (`<zápas>.events.parquet` a podobné, viz [Převaděče](converters.md)), pokud je nevyberete samostatně. Cokoli jiného se přeskočí s uvedením důvodu. Jak se výběr filtruje, je vysvětleno v [Načítání souborů](loading-files.md#which-files-are-kept).

Prázdné soubory se přeskočí. Ve výběru, který obsahuje soubory `movement*.<přípona>`, se načtou jen ty ([Načítání souborů](loading-files.md#which-files-are-kept)).

Data mají **jeden řádek na vzorek**: pozice v okamžiku, volitelně kdo, která skupina, která relace, kam se díval, a další sloupce. Řádky událostí (zabití, položení, výstřel) mohou být ve stejné tabulce jako řádky pozic. Odliší se podle sloupce události.

## Text s oddělovači (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Nejmenší užitečný soubor, tři řádky:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Sloupce se namapují samy ([Mapování sloupců](column-mapping.md)).

Čte to skener na úrovni bajtů, který dekóduje jen namapované sloupce ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Vlastnost | Pravidlo |
|---|---|
| Záhlaví | První neprázdný řádek drží názvy sloupců. Prázdný název se stane `column_N`. |
| Oddělovač | Pozná se z prvních 20 neprázdných řádků prvního 1 MiB, mezi čárkou, středníkem, tabulátorem a svislítkem, podle **konzistence**: vyhraje oddělovač, který dá na každém vzorkovaném řádku stejný počet polí, a pak ten, který dá víc polí. Mezera se nikdy nepozná, ale lze ji zvolit. Lze napsat libovolný jednotlivý znak ([Mapování sloupců](column-mapping.md#the-fields)). |
| Uvozovky | RFC 4180: pole mohou být v uvozovkách, `""` uvnitř uvozovek je doslovná uvozovka. |
| Bílé znaky | Počáteční a koncové mezery, tabulátory a uvozovky se z každého pole ořežou. |
| Pole na řádek | Nejvýš 4 096. Více je chyba (*je oddělovač správně?*). |
| Čísla | Volitelné znaménko, číslice, volitelná `.` a desetinná místa, volitelný exponent (`1.5e-3`). Desetinná čárka (`1,5`), oddělovače tisíců nebo koncové jednotky (`12 m`) se nepřečtou a počítají se jako chybějící. Pokud váš soubor používá desetinné čárky, nahraďte je před načtením tečkami (najít a nahradit v textovém editoru stačí). |
| Číselný sloupec | Sloupec se nabídne jako číselný, když více než 90 % neprázdných hodnot v prvních 50 řádcích se přečte jako čísla. |
| Počet řádků | Odhadne se před načtením z průměrné délky řádku prvního 1 MiB. |
| Kódování textu | UTF-8. |

## Parquet {#parquet}

Čte se knihovnou [hyparquet](https://github.com/hyparam/hyparquet), po blocích sloupců do typovaných polí. Žádají se jen namapované sloupce ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Vlastnost | Pravidlo |
|---|---|
| Počet řádků | Přesný, z patičky souboru, před načtením. |
| Náhled | Prvních 50 řádků, dekódovaných jako objekty. Jejich hodnoty rozhodují, které sloupce vypadají jako číselné. |
| Celá čísla | `INT32` a `INT64` (dekódované jako BigInt) se stanou čísly. |
| Desetinná čísla | `FLOAT`, `DOUBLE`. |
| Pravdivostní hodnoty | 1 a 0. |
| Řetězce | Použijí se pro sloupce osoby, skupiny, relace a kategorie. Řetězec vypadající jako číslo se přijme pro číselné role. |
| Logické typy `TIMESTAMP`, `DATE` | Dekódují se na okamžiky (milisekundy od roku 1970). Když se použijí jako časová osa, nastavení jednotky se ignoruje. |
| Vnořené sloupce | Sloupce struct a list nejsou určeny pro žádnou roli (v náhledu se ukážou jako text JSON). Netestováno. |
| Metadata patičky | Klíč `heat3d` se čte jako nápovědy mapování (níže). |

Sloupec pozice, času nebo pohledu, který drží něco jiného než číslo, se dekóduje jako chybějící.

## Role sloupců a typy {#column-roles-and-types}

| Role | Typ v souboru | Povinné | Uloženo jako | Limity |
|---|---|---|---|---|
| X, Y, Z | číslo | dva ze tří | 32bitové desetinné číslo, po [mapování os](axes-units-and-time.md) | Řádek bez použitelné pozice se zahodí. |
| Čas | číslo v jedné z [časových jednotek](axes-units-and-time.md#time-units), časová značka Parquet, nebo text ISO-8601 | ne | 32bitové desetinné číslo v sekundách od nejdřívějšího řádku | Řazení se odmítne nad 400 000 000 řádků ([proč](memory-and-budgets.md#the-sort-ceiling)). |
| Osoba | cokoli; kódováno slovníkem | ne | 32bitové id | |
| Relace | cokoli; kódováno slovníkem | ne | 32bitové id | Popisky se vypíší až pro 100 000 relací. |
| Skupina | cokoli; kódováno slovníkem | ne | 16bitové id | Až 4 096 skupin, jinak se seskupení zahodí. |
| Natočení (yaw), sklon (pitch) | číslo, stupně nebo radiány | ne | 32bitové desetinné číslo v radiánech | |
| Směr X, Y, Z | číslo | ne (všechny tři společně) | přepočteno na natočení a sklon | |
| Filtrační sloupec, *rozsah* | číslo | ne | 32bitové desetinné číslo | Až 4 filtry aktivní najednou. |
| Filtrační sloupec, *kategorie* | cokoli; kódováno slovníkem | ne | 32bitové id | Až 4 096 hodnot, jinak se sloupec nezachová. |

Sloupec `TIMESTAMP` z Parquetu, zachovaný jako filtrační sloupec, je *rozsah* epochálních milisekund. Je to posuvník, ne seznam.

## Nápovědy `heat3d` {#the-heat3d-hints}

Soubor Parquet může nést vlastní pokyny ke čtení v metadatech klíč–hodnota své patičky, pod klíčem **`heat3d`**, jako objekt JSON ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Prohlížeč je použije přes své vlastní odhady, když je soubor prvním z výběru. Každá položka je volitelná a každý výsledek se stále ukáže a dá se upravit v panelu [Mapování sloupců](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Cokoli, co se nepřečte jako objekt JSON, se ignoruje.

### Schéma {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          názvy sloupců pro pozici
    "time": string,                                  sloupec času
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           filtrační sloupce k ponechání, nejužitečnější první
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  musí být > 0
  },
  "entity": {
    "size": number                                   velikost jedné sledované věci v jednotkách souboru, > 0
  }
}
```

| Položka | Použije se, když | Účinek |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | pojmenovaný sloupec v souboru existuje | Nastaví tu roli. |
| `columns.timeUnit` | je jednou ze sedmi jednotek | Nastaví časovou jednotku. |
| `columns.angleUnit` | `"degrees"` nebo `"radians"` | Nastaví jednotku úhlu. |
| `columns.lookMode` | `"vector"` s nastavenými dirX, dirY i dirZ; `"yawPitch"` s nastaveným yaw; `"none"` | Nastaví režim pohledu. |
| `columns.extra` | je to pole | Nahradí automatický seznam filtrů. Ponechá jen existující sloupce, které nejsou použity pro roli. Každý je *rozsah*, když v náhledu vypadal jako číselný, jinak *kategorie*. Bez něj se automatický seznam ponechá bez sloupců, které nápověda přiřadila roli. |
| `axes.up` | `"y"` nebo `"z"` | Osa nahoru. |
| `axes.flipX/Y/Z` | logická hodnota | Převrácení. |
| `axes.scale` | číslo > 0 | Měřítko jednotek. |
| `entity.size` | číslo > 0 | [Velikost entity](sessions-persons-groups.md#entity-size) (při načtení se násobí měřítkem jednotek). Jediný způsob, jak ji nastavit. |

### Příklad {#example}

Vymyšlený export střílečky: osa Z nahoru, centimetry, levotočivý svět, hráči jsou asi 72 cm široké.

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

S pyarrow se vlastní schéma metadat zapíše do metadat klíč–hodnota souboru:

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

`npm run inspect -- file.parquet` vypíše schéma souboru. Je to rychlý způsob, jak zkontrolovat názvy sloupců, na které nápovědy odkazují.

## Co zapisuje záložka Heatmap {#what-the-heatmap-tab-writes}

Do dat se nic nezapisuje zpět. Výstupy jsou:

- videa ve formátu WebM (VP9 nebo VP8). Viz [Trasa kamery a video](camera-path-and-video.md);
- pozice kamery, zkopírovaná do schránky jako text. Viz [Kamera](camera.md#pose);
- úrovně uložené v [knihovně úrovní](level-library.md) prohlížeče.
