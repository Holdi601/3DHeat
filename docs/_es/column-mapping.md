---
title: "Asignación de columnas"
parent: "Cargar datos"
nav_order: 2
lang: "es"
source: "column-mapping.md"
source_hash: "9d5e1f5e0c62"
translated: true
outdated: false
---

# Asignación de columnas

Un archivo es una tabla, y 3DHeat tiene que saber qué columna guarda la posición de este a
oeste, cuál guarda el tiempo, cuál el nombre del jugador, y así sucesivamente. Este panel es
donde se dice qué ha supuesto, y donde se corrige una suposición errónea.

![El panel Asignación de columnas tras cargar un archivo Parquet: todas las casillas ya rellenas - 1 X, 2 Y, 3 Z, 4 Tiempo, 5 Id. de persona, 6 Sesión / partida, 7 Equipo / grupo](../assets/img/en/column-mapping-panel.webp)

*El archivo nombró sus propias columnas, así que todas las casillas ya están rellenas.*

Por ejemplo, un CSV con la cabecera `x,y,z,t,player,team` se asigna solo: x, y y z pasan a ser la
posición, `t` el tiempo, `player` la [persona](glossary.md) y `team` el [grupo](glossary.md).

Después de elegir archivos, el panel **Asignación de columnas** se abre bajo el panel Origen. Dice
qué columna cumple qué papel. Se rellena automáticamente, y cada campo se puede cambiar antes de pulsar
**Cargar**; la asignación se lee al cargar, así que cambiarla después exige volver a cargar.

## Los campos {#the-fields}

Todos los menús de columna listan cada columna del primer archivo, más *- ninguna -*.

| Campo | Papel | Notas |
|---|---|---|
| **Separador** | Solo CSV: el delimitador de campos. | Menú: *Coma ,*, *Punto y coma ;*, *Tabulador*, *Barra vertical \|*, *Espacio*; o escribe cualquier carácter único en *o escribe un carácter*. Se detecta automáticamente (véase abajo). Cambiarlo vuelve a ejecutar la asignación automática, así que se pierden las ediciones previas. |
| **X**, **Y**, **Z** | Posición. | Se necesitan al menos dos; un tercer eje sin asignar vale 0 (los datos están en un plano). La misma columna en dos ejes es un error. |
| **Eje vertical en el origen** | Qué eje del origen apunta hacia arriba. | *Z es vertical (la mayoría de motores de juego)* o *Y es vertical (convención gráfica)*. Véase [Ejes, unidades y tiempo](axes-units-and-time.md). |
| **Escala de unidades** | Multiplica cada posición. | Botones *1 (m)* y *0,01 (cm→m)*, o escribe un valor. |
| **Invertir X / Invertir Y / Invertir Z** | Niega un eje del origen. | Se aplica a las posiciones y a los vectores de dirección de la mirada. |
| **Tiempo** | El eje de tiempo. | Opcional. Sin él no hay línea de tiempo. |
| **Unidad de tiempo** | Cómo leer la columna de tiempo. | Siete unidades; véase [Ejes, unidades y tiempo](axes-units-and-time.md#time). Se ignora en las columnas Parquet `TIMESTAMP`/`DATE`, lo que el panel indica. |
| **Id. de persona** | A quién o a qué pertenece una fila. | Opcional. Hace posibles las trayectorias, las duraciones de vida, la repetición de caja y el calor de línea. |
| **Sesión / partida** | A qué partida, incursión, ronda, carrera o vuelta pertenece una fila. | Opcional. Las posiciones nunca se interpolan, no dejan estela ni se unen en una ruta a través de un cambio de sesión. Véase [Sesiones, personas y grupos](sessions-persons-groups.md). |
| **Equipo / grupo** | Cualquier columna de pocos valores distintos. | Opcional. Gobierna los colores de grupo, el calor por equipo y la división de diferencia por grupo. |
| **Dirección de la mirada** | *Ninguna*, *Columnas de guiñada / cabeceo* o *Columnas de vector de dirección*. | Con guiñada/cabeceo: **Guiñada**, **Cabeceo** y **Unidad de ángulo** (*Grados* / *Radianes*). Con un vector: **Dir X**, **Dir Y**, **Dir Z**. Se usa para los rayos de mirada de la [repetición de caja](box-replay.md). |
| **Conservar para filtrar** | Columnas extra que se guardan en memoria. | Una casilla por columna, y para cada marcada, *rango* (numérica) o *categoría*. Cada una cuesta 4 bytes por fila y una pasada de decodificación al cargar. Solo las columnas conservadas pueden [filtrarse](filters.md), usarse para una [división de diferencia](difference.md) o como columna de eventos del [calor de línea](line-heat.md). |
| **Mostrar filas de ejemplo** | Una tabla con las primeras 12 filas muestreadas, todas las columnas. | Para comprobar las suposiciones. |

Una columna de filtro marcada que no se fija explícitamente se lee como *rango*; una columna de id con
aspecto numérico suele ser más útil como *categoría*. Solo 4 filtros pueden estar activos a la vez
([Filtros](filters.md)).

## Cómo adivina la asignación automática {#how-the-auto-mapping-guesses}

La adivinación está en [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts).
Mira los nombres de columna, qué columnas son numéricas en las filas muestreadas (más del 90 % de los
valores no vacíos se leen como números), cuántos valores distintos toma cada columna en la muestra y los
tipos lógicos de Parquet. Los patrones de nombre se prueban en orden, sin distinguir mayúsculas, y gana el
primer patrón que coincide con alguna columna todavía libre.

### Posición {#position}

| Eje | Patrones de nombre, en orden (solo columnas numéricas) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Si un eje sigue vacío, las primeras columnas numéricas libres (ignorando `filename`, `level`, `year`,
`month`, `day`, `hour`, `location`) lo rellenan en orden. Una suposición errónea se ve enseguida en
pantalla; una vacía dejaría la vista vacía.

### Tiempo {#time}

- **Primero las columnas de marca de tiempo de Parquet.** Entre las columnas cuyo tipo lógico es `TIMESTAMP`
  o `DATE`, se elige la mejor por puntuación: +10 000 si el nombre coincide con un patrón de tiempo, -5 000
  para una `DATE` simple, más el número de valores distintos en la muestra. Una fecha de día completo y un
  inicio de sesión constante tienen casi ningún valor distinto, así que gana el instante del evento. La
  unidad es entonces *marca de tiempo Unix (ms)*.
- **Si no, por nombre:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`,
  `when`, `tick`, `…frame…`, y después nombres de tiempo transcurrido (`gdur`, `g_duration`, `…duration…`,
  `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`).
  La unidad se adivina entonces a partir de los valores: ISO-8601 cuando un valor parece `AAAA-MM-DDT…` o
  `AAAA-MM-DD …`; si no, por la mayor magnitud: por encima de 10^17 nanosegundos, por encima de 10^14
  microsegundos, por encima de 10^11 milisegundos Unix, por encima de 10^8 segundos Unix, por encima de 10^6
  milisegundos, si no segundos.

Cuando se elige una columna de tiempo transcurrido, el panel indica que cada sesión se alinea entonces con
su propio inicio: bueno para superponer partidas, no para verlas en secuencia real.

### Sesión, persona, grupo {#session-person-group}

La sesión se reclama **después** del eje de tiempo y **antes** que persona y grupo, porque una columna de
sesión suele ser una marca de tiempo (el instante de inicio de la partida en cada fila de la partida).

| Papel | Patrones de nombre, en orden |
|---|---|
| Sesión | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (cada uno exacto, opcionalmente con `_id`) |
| Persona | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, luego `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (datos de carreras: el coche es lo que se mueve) |
| Grupo | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Grupo, de reserva | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result`, `event_env`, `playtest_id` |

Un candidato a grupo que toma un valor distinto en la mayoría de las filas muestreadas (más de max(48, el 60 %
de la muestra)) es un id, no un grupo: pasa a ser la columna de persona si no se encontró ninguna, y no se
usa como grupo. Si no se encontró ninguna columna de grupo, se usa la columna no numérica con menos valores
distintos entre 2 y 12.

### Dirección de la mirada {#look-direction}

Una columna numérica llamada `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` o `rot_z` / `rotation_z`
cambia la dirección de la mirada a guiñada/cabeceo; el cabeceo se busca como `pitch`, `…rot…pitch…`,
`…elevation…angle…`, `…view…pitch…`. Se supone grados cuando alguna guiñada muestreada supera 7 en valor
absoluto, y radianes en otro caso. Un vector de dirección nunca se adivina; viene de las pistas de abajo o de ti.

### Columnas de filtro {#filter-columns}

Se conservan automáticamente como máximo **6** columnas, ordenadas:

1. `region`, `sessionMode`, `actor` - columnas que existen para filtrar por ellas (puntuación 1200);
2. columnas de categoría que varían en la muestra, primero las de menos valores distintos (1000 menos el número);
3. una columna constante en la muestra, pero solo cuando se cargan varios archivos - puede cambiar entre archivos,
   como una región o un id de prueba (600);
4. columnas numéricas (500).

No se ofrecen automáticamente las columnas que ya desempeñan un papel, los nombres de ruido de arriba, las
columnas constantes en una carga de un solo archivo, ni las columnas de texto libre (más de max(16, la mitad de
la muestra) valores distintos). Cualquier columna se puede marcar a mano.

### Eje vertical {#up-axis}

Con los tres ejes asignados, el eje con menor dispersión de Y y Z en la muestra se toma como vertical (un mapa es
mucho más ancho que alto); si no, se supone Z vertical.

## Las pistas `heat3d` en el pie de un Parquet {#the-heat3d-hints-in-a-parquet-footer}

Un archivo Parquet puede decir cómo debe leerse. Si los metadatos clave/valor de su pie tienen una
entrada con la clave **`heat3d`**, su valor se analiza como JSON y se superpone a las suposiciones
([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). El convertidor de
demos de CS2 escribe una entrada así, de modo que sus tablas se abren con el jugador como persona, el
bando como grupo, cada ronda como sesión, la dirección de la mirada activada y el mundo en el sentido
correcto.

Solo se lee el **primer** archivo de una selección para las pistas. Cada entrada es opcional, y cada
valor indicado aparece igualmente en el panel y puede cambiarse. Una descripción completa del esquema,
con un ejemplo y cómo escribirlo, está en la [referencia de formatos de datos](data-formats.md#the-heat3d-hints).

Las reglas, brevemente:

- Una columna nombrada por una pista solo se aplica si el archivo tiene esa columna.
- `lookMode: "vector"` surte efecto solo cuando `dirX`, `dirY` y `dirZ` están todas fijadas; `"yawPitch"`
  solo cuando `yaw` está fijada.
- `extra`, cuando está presente, sustituye la lista automática de filtros (los nombres desconocidos y las
  columnas que ya desempeñan un papel se descartan); el tipo rango/categoría de cada una sigue a si parecía
  numérica. Cuando no está, se conserva la lista automática menos cualquier columna a la que una pista dio
  un papel.
- `axes.up` debe ser `"y"` o `"z"`, las inversiones deben ser booleanos, `scale` debe ser positivo.
- `entity.size`, cuando es positivo, es el tamaño de una cosa rastreada en las unidades del archivo
  ([tamaño de entidad](sessions-persons-groups.md#entity-size)); es la única forma de fijarlo.

## Problema conocido: cambiar el separador del CSV {#known-issue-overriding-the-csv-separator}

Cuando cambias el separador por uno distinto del detectado, la lista de columnas y las filas de ejemplo no
cambian (la vista previa sigue dividiendo con el separador detectado). El separador elegido sigue usándose
para la carga en sí. Si el separador detectado es erróneo:

1. Abre el archivo en un editor de texto.
2. Sustituye el separador por una coma en todas partes (y las comas decimales por puntos).
3. Guarda y vuelve a cargar el archivo.

La causa está en [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
