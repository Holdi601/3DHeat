---
title: "Referencia de formatos de datos"
nav_order: 19
lang: "es"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: true
---

# Referencia de formatos de datos

Esta página lista cada tipo de archivo que 3DHeat puede abrir, y cómo debe ser una tabla dentro de él. Una tabla son filas y columnas, como una hoja de cálculo: cada fila dice dónde estuvo algo y, si lo tienes, cuándo y quién.

Lo que lee la pestaña Mapa de calor, columna por columna, y las pistas que puede llevar un archivo Parquet. (La pestaña Análisis de carrera lee archivos de vuelta, y la pestaña Partida lee los resúmenes de partida; véase [Análisis de carrera](race-analysis.md) y [Análisis de partida](match-analysis.md).)

## Archivos {#files}

Esta es la lista completa de archivos que se pueden cargar. El panel **Origen** (**Archivos…**, **Carpeta…**, o arrastrar y soltar) acepta exactamente estos:

| Extensión | Qué es | Lo lee |
|---|---|---|
| `.parquet`, `.pq` | tabla Parquet | el lector Parquet (abajo) |
| `.csv`, `.tsv`, `.txt` | texto delimitado | el lector de texto (abajo) |
| `.3dheat` | una partida en un solo archivo (un ZIP que contiene la tabla y sus extras) | se carga como la tabla que contiene - [Un archivo por partida](container.md) |
| `.acmi` (también `.txt.acmi`, `.zip.acmi`) | grabación de vuelo de Tacview | su propio lector - [Grabaciones de Tacview](tacview-acmi.md) |
| `.json`, `.json.gz` | grabación OCAP (al estilo de Arma) | su propio lector |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | trazas GPS: GPX, KML/KMZ, registros NMEA, registros de vuelo sin motor IGC, archivos deportivos FIT | su propio lector; las posiciones salen de la latitud y la longitud |

No se cargan como posiciones los pequeños archivos JSON que acompañan a una tabla para describirla (nombres que terminan en `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), ni las tablas extra de un conversor (`<partida>.events.parquet` y similares, véase [Conversores](converters.md)), salvo que los elijas por separado. Cualquier otro archivo se salta, con un motivo. Cómo se filtra una selección se explica en [Cargar archivos](loading-files.md#which-files-are-kept).

Los archivos vacíos se saltan. En una selección que contiene archivos `movement*.<ext>`, solo se cargan esos ([Cargar archivos](loading-files.md#which-files-are-kept)).

Los datos son **una fila por muestra**: una posición en un momento, opcionalmente con quién, qué grupo, qué sesión, hacia dónde miraba, y cualquier columna adicional. Las filas de eventos (una baja, una colocación, un disparo) pueden estar en la misma tabla que las filas de posición, distinguidas por una columna de evento.

## Texto delimitado (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Un archivo mínimo útil, de tres filas:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Las columnas se asignan solas ([Asignación de columnas](column-mapping.md)).

Lo lee un analizador a nivel de bytes que decodifica solo las columnas asignadas ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Aspecto | Regla |
|---|---|
| Cabecera | La primera línea no vacía contiene los nombres de columna. Un nombre vacío pasa a ser `column_N`. |
| Separador | Se detecta a partir de las primeras 20 líneas no vacías de los primeros 1 MiB, entre coma, punto y coma, tabulador y barra vertical, por **consistencia**: gana el separador que da el mismo número de campos en cada línea muestreada y, si hay empate, el que da más campos. El espacio nunca se detecta, pero puede elegirse; se puede escribir cualquier carácter suelto ([Asignación de columnas](column-mapping.md#the-fields)). |
| Comillas | RFC 4180: los campos pueden ir entre comillas dobles; `""` dentro de las comillas es una comilla literal. |
| Espacios | Los espacios, tabuladores y comillas al principio y al final de cada campo se quitan. |
| Campos por fila | Como máximo 4096; más es un error (*¿está bien el separador?*). |
| Números | Signo opcional, dígitos, `.` y decimales opcionales, exponente opcional (`1.5e-3`). Una coma decimal (`1,5`), separadores de miles o unidades al final (`12 m`) no se leen y cuentan como datos que faltan. Si tu archivo usa comas decimales, cámbialas por puntos antes de cargarlo (buscar y reemplazar en un editor de texto sirve). |
| Columna numérica | Una columna se ofrece como numérica cuando más del 90 % de los valores no vacíos de las primeras 50 filas se leen como números. |
| Número de filas | Se estima antes de cargar, a partir de la longitud media de línea de los primeros 1 MiB. |
| Codificación de texto | UTF-8. |

## Parquet {#parquet}

Se lee con [hyparquet](https://github.com/hyparam/hyparquet), fragmento de columna a fragmento de columna, en arrays tipados, pidiendo solo las columnas asignadas ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Aspecto | Regla |
|---|---|
| Número de filas | Exacto, desde el pie del archivo, antes de cargar. |
| Vista previa | Las primeras 50 filas, decodificadas como objetos; sus valores deciden qué columnas parecen numéricas. |
| Enteros | `INT32`, y `INT64` (decodificado como BigInt) pasan a ser números. |
| Decimales | `FLOAT`, `DOUBLE`. |
| Booleanos | 1 y 0. |
| Textos | Se usan para las columnas de persona, grupo, sesión y categoría; un texto que parece número se acepta para los papeles numéricos. |
| Tipos lógicos `TIMESTAMP`, `DATE` | Se decodifican a instantes (milisegundos desde 1970); usados como eje de tiempo, se ignora el ajuste de unidad. |
| Columnas anidadas | Las columnas struct y list no están pensadas para ningún papel (en la vista previa aparecen como texto JSON); sin probar. |
| Metadatos del pie | La clave `heat3d` se lee como pistas de asignación (abajo). |

Una columna de posición, tiempo o mirada que contiene algo que no es un número se decodifica como dato que falta.

## Papeles y tipos de columna {#column-roles-and-types}

| Papel | Tipo en el archivo | Obligatorio | Se guarda como | Límites |
|---|---|---|---|---|
| X, Y, Z | número | dos de tres | decimal de 32 bits, tras la [asignación de ejes](axes-units-and-time.md) | Una fila sin posición utilizable se descarta. |
| Tiempo | número en una de las [unidades de tiempo](axes-units-and-time.md#time-units), marca de tiempo Parquet, o texto ISO-8601 | no | segundos en decimal de 32 bits desde la fila más temprana | Ordenar se rechaza por encima de 400 000 000 filas ([por qué](memory-and-budgets.md#the-sort-ceiling)). |
| Persona | cualquiera; codificada por diccionario | no | id de 32 bits | |
| Sesión | cualquiera; codificada por diccionario | no | id de 32 bits | Se listan etiquetas de hasta 100 000 sesiones. |
| Grupo | cualquiera; codificada por diccionario | no | id de 16 bits | Hasta 4096 grupos; si no, se descarta la agrupación. |
| Guiñada, cabeceo | número, grados o radianes | no | decimal de 32 bits en radianes | |
| Dirección X, Y, Z | número | no (las tres juntas) | convertida a guiñada y cabeceo | |
| Columna de filtro, *rango* | número | no | decimal de 32 bits | Hasta 4 filtros activos a la vez. |
| Columna de filtro, *categoría* | cualquiera; codificada por diccionario | no | id de 32 bits | Hasta 4096 valores; si no, la columna no se conserva. |

Una columna `TIMESTAMP` de Parquet usada como columna de filtro es un *rango* de milisegundos desde la época: un deslizador, no una lista.

## Las pistas `heat3d` {#the-heat3d-hints}

Un archivo Parquet puede llevar sus propias instrucciones de lectura en los metadatos clave-valor de su pie, bajo la clave **`heat3d`**, como objeto JSON ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). El visor las aplica por encima de sus propias suposiciones cuando el archivo es el primero de una selección. Cada entrada es opcional, y cada resultado se sigue mostrando y puede editarse en el panel [Asignación de columnas](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Lo que no se lee como objeto JSON se ignora.

### Esquema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          column names for the position
    "time": string,                                  the time column
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           filter columns to keep, most useful first
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  must be > 0
  },
  "entity": {
    "size": number                                   size of one tracked thing in file units, > 0
  }
}
```

| Entrada | Se aplica cuando | Efecto |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | la columna indicada existe en el archivo | Fija ese papel. |
| `columns.timeUnit` | es una de las siete unidades | Fija la unidad de tiempo. |
| `columns.angleUnit` | `"degrees"` o `"radians"` | Fija la unidad de ángulo. |
| `columns.lookMode` | `"vector"` con dirX, dirY y dirZ todas fijadas; `"yawPitch"` con yaw fijada; `"none"` | Fija el modo de mirada. |
| `columns.extra` | es un array | Sustituye la lista automática de filtros, conservando solo las columnas existentes que no usa un papel. Cada una es *rango* si parecía numérica en la vista previa, y si no, *categoría*. Sin ella, se mantiene la lista automática menos las columnas que una pista asignó a un papel. |
| `axes.up` | `"y"` o `"z"` | Eje vertical. |
| `axes.flipX/Y/Z` | un booleano | Volteos. |
| `axes.scale` | un número > 0 | Escala de unidad. |
| `entity.size` | un número > 0 | [Tamaño de entidad](sessions-persons-groups.md#entity-size) (multiplicado por la escala de unidad al cargar). Es la única forma de fijarlo. |

### Ejemplo {#example}

Una exportación inventada de un juego de disparos: Z hacia arriba, centímetros, un mundo de mano izquierda, jugadores de unos 72 cm de ancho.

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

### Cómo escribirlo {#writing-it}

Con pyarrow, los metadatos de esquema propios se escriben en los metadatos clave-valor del archivo:

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

`npm run inspect -- file.parquet` muestra el esquema de un archivo, una forma rápida de comprobar los nombres de columna a los que se refieren las pistas.

## Lo que escribe la pestaña Mapa de calor {#what-the-heatmap-tab-writes}

No se escribe nada de vuelta en los datos. Las salidas son:

- vídeos, en WebM (VP9 o VP8) - [Ruta de cámara y vídeo](camera-path-and-video.md);
- una pose de cámara, copiada al portapapeles como texto - [Cámara](camera.md#pose);
- niveles guardados en la [biblioteca de niveles](level-library.md) del navegador.
