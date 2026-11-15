---
title: "Referència de formats de dades"
nav_order: 19
lang: "ca"
source: "data-formats.md"
source_hash: "3b120416f7a6"
translated: true
outdated: false
---

# Referència de formats de dades

Aquesta pàgina enumera cada mena de fitxer que 3DHeat pot obrir, i com ha de ser una taula dins seu. Una taula són files i columnes, com un full de càlcul: cada fila diu on era una cosa i, si ho tens, quan i qui.

Què llegeix la pestanya Mapa de calor, columna per columna, i les pistes que pot portar un fitxer Parquet. (La pestanya Anàlisi de curses llegeix fitxers de volta, i la pestanya Partida els resums de partida; vegeu [Anàlisi de curses](race-analysis.md) i [Anàlisi de partides](match-analysis.md).)

## Fitxers {#files}

Aquesta és l'única llista completa de fitxers que es poden carregar. El panell **Origen** (**Fitxers…**, **Carpeta…**, o arrossegar i deixar anar) accepta exactament aquests:

| Extensió | Què és | Llegit per |
|---|---|---|
| `.parquet`, `.pq` | taula Parquet | el lector Parquet (més avall) |
| `.csv`, `.tsv`, `.txt` | text delimitat | el lector de text (més avall) |
| `.3dheat` | una partida en un fitxer (un ZIP que conté la taula i els seus extres) | es carrega com la taula que conté - [Un fitxer per partida](container.md) |
| `.acmi` (també `.txt.acmi`, `.zip.acmi`) | gravació de vol de Tacview | el seu lector propi - [Gravacions de Tacview](tacview-acmi.md) |
| `.json`, `.json.gz` | gravació OCAP (estil Arma) | el seu lector propi |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | traces GPS: GPX, KML/KMZ, registres NMEA, registres de vol a vela IGC, fitxers FIT d'esport | el seu lector propi; les posicions surten de la latitud i la longitud |

No es carreguen com a posicions: els petits fitxers JSON que van al costat d'una taula per descriure-la (noms acabats en `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), ni les taules addicionals d'un convertidor (`<partida>.events.parquet` i similars, vegeu [Convertidors](converters.md)), tret que els triï un per separat. Qualsevol altra cosa s'omet amb un motiu. Com es filtra una selecció s'explica a [Carregar fitxers](loading-files.md#which-files-are-kept).

Els fitxers buits s'ometen. En una selecció que conté fitxers `movement*.<ext>`, només es carreguen aquells ([Carregar fitxers](loading-files.md#which-files-are-kept)).

Les dades són **una fila per mostra**: una posició en un moment, opcionalment amb qui, quin grup, quina sessió, on mirava, i qualsevol columna addicional. Les files d'esdeveniments (una mort, un plantat, un tret) poden estar a la mateixa taula que les files de posició, distingides per una columna d'esdeveniment.

## Text delimitat (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Un fitxer mínim útil, de tres files:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Les columnes s'assignen automàticament ([Mapatge de columnes](column-mapping.md)).

Analitzat per un escàner a nivell de bytes que només descodifica les columnes assignades ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Aspecte | Regla |
|---|---|
| Capçalera | La primera línia no buida conté els noms de les columnes. Un nom buit es converteix en `column_N`. |
| Separador | Es detecta a partir de les primeres 20 línies no buides dels primers 1 MiB, entre coma, punt i coma, tabulador i barra vertical, per **consistència**: guanya el separador que dona el mateix nombre de camps a cada línia mostrejada i, si no, el que en dona més. L'espai mai no es detecta però es pot triar; es pot escriure qualsevol caràcter ([Mapatge de columnes](column-mapping.md#the-fields)). |
| Cometes | RFC 4180: els camps poden anar entre cometes dobles; `""` dins de les cometes és una cometa literal. |
| Espais | Els espais inicials i finals, els tabuladors i les cometes es treuen de cada camp. |
| Camps per fila | Com a màxim 4.096; més és un error (*el separador és correcte?*). |
| Números | Signe opcional, dígits, `.` opcional i decimals, exponent opcional (`1.5e-3`). La coma decimal (`1,5`), els separadors de milers o les unitats finals (`12 m`) no es analitzen i compten com a absents. Si el fitxer fa servir comes decimals, substitueix-les per punts abans de carregar-lo (cerca i substitució en un editor de text funciona). |
| Columna numèrica | Una columna s'ofereix com a numèrica quan més del 90 % dels valors no buits de les primeres 50 files s'analitzen com a números. |
| Nombre de files | S'estima abans de carregar a partir de la longitud mitjana de les línies dels primers 1 MiB. |
| Codificació del text | UTF-8. |

## Parquet {#parquet}

Llegit amb [hyparquet](https://github.com/hyparam/hyparquet), tros de columna a tros de columna en vectors tipats, demanant només les columnes assignades ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Aspecte | Regla |
|---|---|
| Nombre de files | Exacte, del peu del fitxer, abans de carregar. |
| Vista prèvia | Les primeres 50 files, descodificades com a objectes; els seus valors decideixen quines columnes semblen numèriques. |
| Enters | `INT32`, i `INT64` (descodificat com a BigInt) passen a nombres. |
| Decimals | `FLOAT`, `DOUBLE`. |
| Booleans | 1 i 0. |
| Cadenes | Es fan servir per a columnes de persona, grup, sessió i categoria; una cadena que sembla numèrica s'accepta per als papers numèrics. |
| Tipus lògics `TIMESTAMP`, `DATE` | Es descodifiquen com a instants (mil·lisegons des de 1970); quan es fan servir com a eix de temps, el paràmetre d'unitat s'ignora. |
| Columnes niades | Les columnes d'estructura i de llista no es pensen per a cap paper (en vista prèvia es mostren com a text JSON); sense provar. |
| Metadades del peu | La clau `heat3d` es llegeix com a pistes de mapatge (més avall). |

Una columna de posició, de temps o de mirada que conté quelcom que no és un número es descodifica com a absent.

## Papers i tipus de columna {#column-roles-and-types}

| Paper | Tipus al fitxer | Obligatori | Emmagatzemat com | Límits |
|---|---|---|---|---|
| X, Y, Z | número | dos de tres | decimal de 32 bits, després del [mapatge d'eixos](axes-units-and-time.md) | Una fila sense una posició utilitzable es descarta. |
| Temps | número en una de les [unitats de temps](axes-units-and-time.md#time-units), marca de temps Parquet, o text ISO-8601 | no | segons decimals de 32 bits des de la fila més antiga | L'ordenació es refusa per sobre de 400.000.000 de files ([per què](memory-and-budgets.md#the-sort-ceiling)). |
| Persona | qualsevol; codificat per diccionari | no | identificador de 32 bits | |
| Sessió | qualsevol; codificat per diccionari | no | identificador de 32 bits | Es llisten les etiquetes de fins a 100.000 sessions. |
| Grup | qualsevol; codificat per diccionari | no | identificador de 16 bits | Fins a 4.096 grups; si no, s'elimina l'agrupament. |
| Guinyada, capcineig | número, graus o radians | no | decimal de 32 bits en radians | |
| Direcció X, Y, Z | número | no (les tres juntes) | convertit a guinyada i capcineig | |
| Columna de filtre, *rang* | número | no | decimal de 32 bits | Fins a 4 filtres actius alhora. |
| Columna de filtre, *categoria* | qualsevol; codificat per diccionari | no | identificador de 32 bits | Fins a 4.096 valors; si no, la columna no es conserva. |

Una columna Parquet `TIMESTAMP` conservada com a columna de filtre és un *rang* de mil·lisegons d'època: un control lliscant, no una llista.

## Columnes de resultat {#outcome-columns}

Qui va guanyar, a cada fila, perquè un lloc, una ruta o una jugada es pugui jutjar per la freqüència amb què el seu bàndol va acabar guanyant ([Taxa de victòria](win-rate.md)). El visor conserva aquestes columnes pel seu compte, les mostra primer als [filtres](filters.md) en l'idioma del visor i les llegeix al [mapa de taxa de victòria](win-rate.md), al [desglossament](breakdown.md) i a les [estadístiques dels volums](volumes.md#statistics). Un convertidor per a un joc per rondes (CS2, Valorant, Rainbow Six Siege) o per partides (War Thunder) les escriu totes quatre; el convertidor de Tacview les escriu per a les campanyes d'un servidor de DCS on un fitxer de rondes diu qui va guanyar ([Servidors de DCS](tacview-acmi.md#dcs-servers-who-won-and-how-each-sortie-ended)):

| Columna | Tipus | Significat |
|---|---|---|
| `won` | 0/1 (buida si no se sap) | el bàndol (equip) de la fila va guanyar **la ronda**; en un joc sense rondes, la partida |
| `matchWon` | 0/1 (buida si no se sap) | el bàndol (equip) de la fila va guanyar **la partida**; buida si l'enregistrament no mostra el final |
| `round` | nombre enter, des d'1 | la ronda a què pertany la fila; 1 durant tota una partida en un joc per partides |
| `roundEndReason` | text | com va acabar la ronda (en un joc per partides, la partida), amb les paraules de sota |

`won` i `matchWon` són del bàndol de la fila: les files d'un jugador T porten el resultat del bàndol T, les d'una unitat d'IA el del seu equip; les files que no pertanyen a cap bàndol les deixen buides. Un bàndol que canvia a la mitja part conserva el seu propi `matchWon` i pren el `won` de cada ronda tal com la va jugar. Un empat és 0 per als dos bàndols.

Els motius de final, compartits per tots els jocs perquè un sol filtre funcioni en tots (la paraula pròpia d'un joc s'hi fa correspondre quan es pot, [`data/outcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/outcome.ts)):

| `roundEndReason` | Significat | Jocs |
|---|---|---|
| `elimination` | tots els jugadors d'un bàndol fora | CS2, Valorant, Rainbow Six Siege |
| `bomb` | la bomba (spike, l'objectiu del desactivador) va esclatar | CS2, Valorant, Rainbow Six Siege |
| `defuse` | la bomba (spike) desactivada | CS2, Valorant, Rainbow Six Siege |
| `time` | el rellotge de la ronda es va acabar; War Thunder: decidida amb tiquets als dos bàndols | tots |
| `surrender` | un bàndol es va rendir | CS2, Valorant, Rainbow Six Siege |
| `draw` | cap guanyador | CS2 |
| `objective` | un objectiu pres o mantingut (ostatge extret, zona assegurada) | Rainbow Six Siege |
| `capture` | sense tiquets mentre el guanyador mantenia zones de captura; DCS: una campanya persistent guanyada prenent tots els aeròdroms i zones | War Thunder, DCS |
| `tickets` | tiquets perduts per baixes | War Thunder |
| `destruction` | els últims vehicles perduts alhora, ningú no queda per reaparèixer | War Thunder |
| `other` | qualsevol altra cosa | |

Anomena-les també a la llista `extra` de les pistes `heat3d`, com qualsevol altra columna. Els noms de columna `win`, `round_won`, `match_won`, `end_reason` i `win_reason` es llegeixen com aquestes mateixes columnes.

## Les pistes `heat3d` {#the-heat3d-hints}

Un fitxer Parquet pot portar les seves pròpies instruccions de lectura a les metadades clau/valor del seu peu, sota la clau **`heat3d`**, com un objecte JSON ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). El visualitzador les aplica per sobre de les seves pròpies suposicions quan el fitxer és el primer d'una selecció; cada entrada és opcional i cada resultat es mostra igualment i es pot editar al panell [Mapatge de columnes](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Qualsevol cosa que no s'analitzi com un objecte JSON s'ignora.

### Esquema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          noms de columna per a la posició
    "time": string,                                  la columna de temps
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           columnes de filtre a conservar, les més útils primer
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  ha de ser > 0
  },
  "entity": {
    "size": number                                   mida d'una cosa seguida en unitats del fitxer, > 0
  }
}
```

| Entrada | S'aplica quan | Efecte |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | la columna indicada existeix al fitxer | Fixa aquell paper. |
| `columns.timeUnit` | és una de les set unitats | Fixa la unitat de temps. |
| `columns.angleUnit` | `"degrees"` o `"radians"` | Fixa la unitat d'angle. |
| `columns.lookMode` | `"vector"` amb dirX, dirY i dirZ tots fixats; `"yawPitch"` amb yaw fixat; `"none"` | Fixa el mode de mirada. |
| `columns.extra` | és una matriu | Substitueix la llista de filtres automàtica, conservant només les columnes existents que no fa servir cap paper; cadascuna és *rang* quan semblava numèrica a la vista prèvia, si no *categoria*. Sense ella, es conserva la llista automàtica menys qualsevol columna que una pista hagi assignat a un paper. |
| `axes.up` | `"y"` o `"z"` | Eix vertical. |
| `axes.flipX/Y/Z` | un booleà | Girs. |
| `axes.scale` | un número > 0 | Escala d'unitat. |
| `entity.size` | un número > 0 | [Mida de l'entitat](sessions-persons-groups.md#entity-size) (multiplicada per l'escala d'unitat en carregar). L'única manera de fixar-la. |

### Exemple {#example}

L'exportació inventada d'un shooter: Z amunt, centímetres, un món de mà esquerra, jugadors d'uns 72 cm d'amplada.

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

### Escriure-ho {#writing-it}

Amb pyarrow, les metadades d'esquema personalitzades s'escriuen a les metadades clau/valor del fitxer:

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

`npm run inspect -- file.parquet` imprimeix l'esquema d'un fitxer, que és una manera ràpida de comprovar els noms de columna als quals es refereixen les pistes.

## Què escriu la pestanya Mapa de calor {#what-the-heatmap-tab-writes}

No s'escriu res de tornada a les dades. Les sortides són:

- vídeos, en WebM (VP9 o VP8) - [Trajectòria de càmera i vídeo](camera-path-and-video.md);
- una posició de càmera, copiada al porta-retalls com a text - [Càmera](camera.md#pose);
- nivells guardats a la [biblioteca de nivells](level-library.md) del navegador.
