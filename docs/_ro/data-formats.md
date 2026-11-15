---
title: "Referință pentru formatele de date"
nav_order: 19
lang: "ro"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: false
---

# Referință pentru formatele de date

Această pagină listează fiecare fel de fișier pe care îl poate deschide 3DHeat și cum trebuie să arate un tabel dintr-un asemenea fișier. Un tabel este format din rânduri și coloane, ca o foaie de calcul: fiecare rând spune unde se afla ceva și, dacă aveți informația, când și cine.

Ce citește fila Hartă termică, coloană cu coloană, și sugestiile pe care le poate avea un fișier Parquet. (Fila Analiză de cursă citește fișiere de tură, iar fila Meci citește sumarele meciurilor; vezi [Analiză de cursă](race-analysis.md) și [Analiza meciului](match-analysis.md).)

## Fișierele {#files}

Aceasta este singura listă completă a fișierelor care se pot încărca. Panoul **Sursă** (**Fișiere…**, **Dosar…**, sau tragere și plasare) acceptă exact acestea:

| Extensie | Ce este | Citit de |
|---|---|---|
| `.parquet`, `.pq` | tabel Parquet | cititorul Parquet (mai jos) |
| `.csv`, `.tsv`, `.txt` | text delimitat | cititorul de text (mai jos) |
| `.3dheat` | un meci într-un singur fișier (un ZIP care ține tabelul și anexele lui) | se încarcă drept tabelul pe care îl conține - [Un fișier pentru un meci](container.md) |
| `.acmi` (și `.txt.acmi`, `.zip.acmi`) | înregistrare de zbor Tacview | cititorul propriu - [Înregistrările Tacview](tacview-acmi.md) |
| `.json`, `.json.gz` | înregistrare OCAP (de tip Arma) | cititorul propriu |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | trasee GPS: GPX, KML/KMZ, jurnale NMEA, jurnale IGC de planorism, fișiere FIT sportive | cititorul propriu; pozițiile vin din latitudine și longitudine |

Nu se încarcă drept poziții: fișierele JSON mici care stau lângă un tabel ca să-l descrie (nume care se termină în `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`) și tabelele suplimentare ale unui convertor (`<meci>.events.parquet` și asemenea, vezi [Convertoare](converters.md)), decât dacă le alegeți singure. Orice altceva este sărit, cu un motiv. Cum se filtrează o selecție este explicat în [Încărcarea fișierelor](loading-files.md#which-files-are-kept).

Fișierele goale sunt sărite. Într-o selecție care conține fișiere `movement*.<ext>`, se încarcă doar acestea ([Încărcarea fișierelor](loading-files.md#which-files-are-kept)).

Datele sunt **un rând pentru fiecare eșantion**: o poziție într-un moment, opțional cu cine, ce grup, ce sesiune, unde se uita și orice coloane suplimentare. Rândurile de eveniment (o eliminare, o plantare, un foc) pot sta în același tabel cu rândurile de poziție, deosebite printr-o coloană de eveniment.

## Text delimitat (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Cel mai mic fișier util, trei rânduri:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Coloanele se asociază singure ([Maparea coloanelor](column-mapping.md)).

Analizat de un scanner la nivel de octet, care decodează doar coloanele mapate ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Aspect | Regula |
|---|---|
| Antet | Prima linie nevidă conține numele coloanelor. Un nume gol devine `column_N`. |
| Separator | Detectat din primele 20 de linii nevide din primul 1 MiB, între virgulă, punct și virgulă, tab și bară verticală, după **consecvență**: separatorul care dă același număr de câmpuri pe fiecare linie eșantionată câștigă, apoi cel care dă mai multe câmpuri. Spațiul nu se detectează niciodată, dar poate fi ales; orice caracter unic poate fi scris ([Maparea coloanelor](column-mapping.md#the-fields)). |
| Ghilimele | RFC 4180: câmpurile pot fi încadrate în ghilimele duble, `""` în interiorul ghilimelelor este o ghilimea literală. |
| Spații | Spațiile de la început și de la sfârșit, tab-urile și ghilimelele sunt tăiate din fiecare câmp. |
| Câmpuri pe rând | Cel mult 4 096; mai multe este eroare (*separatorul este corect?*). |
| Numere | Semn opțional, cifre, `.` opțional și zecimale, exponent opțional (`1.5e-3`). Virgula zecimală (`1,5`), separatorii de mii sau unitățile scrise după (`12 m`) nu se citesc și contează ca lipsă. Dacă fișierul dumneavoastră folosește virgule zecimale, înlocuiți-le cu puncte înainte de încărcare (găsiți și înlocuiți într-un editor de text funcționează). |
| Coloană numerică | O coloană se oferă ca numerică când peste 90% din valorile nevide din primele 50 de rânduri se citesc ca numere. |
| Număr de rânduri | Estimat înainte de încărcare din lungimea medie a liniilor din primul 1 MiB. |
| Codificarea textului | UTF-8. |

## Parquet {#parquet}

Citit cu [hyparquet](https://github.com/hyparam/hyparquet), bloc de coloane după bloc de coloane, în tablouri tipizate, cerând doar coloanele mapate ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Aspect | Regula |
|---|---|
| Număr de rânduri | Exact, din subsolul fișierului, înainte de încărcare. |
| Previzualizare | Primele 50 de rânduri, decodate ca obiecte; valorile lor decid care coloane arată numeric. |
| Întregi | `INT32`, iar `INT64` (decodat ca BigInt) devin numere. |
| Zecimale | `FLOAT`, `DOUBLE`. |
| Booleene | 1 și 0. |
| Șiruri | Folosite pentru coloanele de persoană, grup, sesiune și categorie; un șir care arată ca un număr este acceptat pentru rolurile numerice. |
| Tipurile logice `TIMESTAMP`, `DATE` | Se decodează în momente (milisecunde de la 1970); folosite ca axă a timpului, setarea unității este ignorată. |
| Coloane imbricate | Coloanele struct și list nu sunt făcute pentru niciun rol (se previzualizează ca text JSON); netestat. |
| Metadate din subsol | Cheia `heat3d` se citește ca sugestii de mapare (mai jos). |

O coloană de poziție, timp sau privire care conține altceva decât un număr se decodează ca lipsă.

## Rolurile și tipurile coloanelor {#column-roles-and-types}

| Rol | Tipul din fișier | Obligatoriu | Stocat ca | Limite |
|---|---|---|---|---|
| X, Y, Z | număr | două din trei | număr real pe 32 de biți, după [maparea axelor](axes-units-and-time.md) | Un rând fără poziție utilizabilă se elimină. |
| Timp | număr într-una dintre [unitățile de timp](axes-units-and-time.md#time-units), timestamp Parquet, sau text ISO-8601 | nu | secunde reale pe 32 de biți, de la cel mai timpuriu rând | Sortarea este refuzată peste 400 000 000 de rânduri ([de ce](memory-and-budgets.md#the-sort-ceiling)). |
| Persoană | orice; codificat prin dicționar | nu | id pe 32 de biți | |
| Sesiune | orice; codificat prin dicționar | nu | id pe 32 de biți | Etichete listate până la 100 000 de sesiuni. |
| Grup | orice; codificat prin dicționar | nu | id pe 16 biți | Până la 4 096 de grupuri, altfel gruparea se elimină. |
| Yaw, pitch | număr, grade sau radiani | nu | radiani reali pe 32 de biți | |
| Direcție X, Y, Z | număr | nu (toate trei împreună) | convertite în yaw și pitch | |
| Coloană de filtru, *interval* | număr | nu | număr real pe 32 de biți | Până la 4 filtre active odată. |
| Coloană de filtru, *categorie* | orice; codificat prin dicționar | nu | id pe 32 de biți | Până la 4 096 de valori, altfel coloana nu se păstrează. |

O coloană Parquet `TIMESTAMP` păstrată ca filtru este un *interval* de milisecunde epocale - un glisor, nu o listă.

## Sugestiile `heat3d` {#the-heat3d-hints}

Un fișier Parquet își poate purta propriile instrucțiuni de citire în metadatele cheie/valoare din subsol, sub cheia **`heat3d`**, ca obiect JSON ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Vizualizatorul le aplică peste propriile presupuneri când fișierul este primul dintr-o selecție; fiecare intrare este opțională, iar fiecare rezultat se arată și se poate edita în panoul [Maparea coloanelor](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Orice care nu se citește ca obiect JSON este ignorat.

### Schema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          numele coloanelor pentru poziție
    "time": string,                                  coloana de timp
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           coloane de filtru de păstrat, cele mai utile primele
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  trebuie să fie > 0
  },
  "entity": {
    "size": number                                   dimensiunea unui lucru urmărit, în unitățile fișierului, > 0
  }
}
```

| Intrare | Aplicată când | Efect |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | coloana numită există în fișier | Setează acel rol. |
| `columns.timeUnit` | este una dintre cele șapte unități | Setează unitatea de timp. |
| `columns.angleUnit` | `"degrees"` sau `"radians"` | Setează unitatea unghiului. |
| `columns.lookMode` | `"vector"` cu dirX, dirY și dirZ toate setate; `"yawPitch"` cu yaw setat; `"none"` | Setează modul de privire. |
| `columns.extra` | este un tablou | Înlocuiește lista automată de filtre, păstrând doar coloanele existente care nu sunt folosite de un rol; fiecare este *interval* când arăta numeric în previzualizare, altfel *categorie*. Fără ea, lista automată se păstrează minus orice coloană pe care o sugestie a atribuit-o unui rol. |
| `axes.up` | `"y"` sau `"z"` | Axa în sus. |
| `axes.flipX/Y/Z` | o valoare booleană | Întoarceri. |
| `axes.scale` | un număr > 0 | Scara unității. |
| `entity.size` | un număr > 0 | [Dimensiunea entității](sessions-persons-groups.md#entity-size) (înmulțită cu scara unității la încărcare). Singurul mod de a o seta. |

### Exemplu {#example}

Un export inventat al unui joc de tip shooter: Z în sus, centimetri, o lume cu sistem stâng, jucători de aproximativ 72 cm lățime.

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

### Cum se scrie {#writing-it}

Cu pyarrow, metadatele de schemă personalizate se scriu în metadatele cheie/valoare ale fișierului:

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

`npm run inspect -- file.parquet` afișează schema unui fișier, un mod rapid de a verifica numele coloanelor la care se referă sugestiile.

## Ce scrie fila Hartă termică {#what-the-heatmap-tab-writes}

Nimic nu se scrie înapoi în date. Rezultatele sunt:

- videoclipuri, ca WebM (VP9 sau VP8) - [Traiectoria camerei și videoclipul](camera-path-and-video.md);
- o poziție a camerei, copiată în clipboard ca text - [Cameră](camera.md#pose);
- niveluri salvate în [biblioteca de niveluri](level-library.md) a browserului.
