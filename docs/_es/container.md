---
title: "Un archivo por partida (.3dheat)"
parent: "Cargar datos"
nav_order: 9
lang: "es"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Un archivo por partida: `.3dheat`

Un archivo `.3dheat` es una partida entera en un solo archivo, para copiarla, guardarla o
compartirla. Para abrirlo, basta con soltar el archivo en el panel Origen.

```
partida.3dheat   (un archivo ZIP)
  manifest      qué es la partida, y la lista de todo lo que contiene
  table         las posiciones (Parquet)
  match.json    el documento de la partida
  sidecars      lo que el convertidor guardó completo (eventos, mensajes, ...)
```

Antes, una partida convertida eran varios archivos juntos: la tabla
`<partida>.parquet`, el documento de la partida `<partida>.match.json` y los auxiliares
`<partida>.<qué>.parquet` ([Los convertidores guardan todo](converters.md)). Un archivo
`.3dheat` los contiene todos en uno: una repetición, un archivo, para copiar, guardar o
compartir.

Está hecho para que cargar mil de ellos sea tan rápido como cargar las tablas sueltas, y
para que convertidores posteriores puedan meter mucho más en él sin un formato nuevo.

## Cargar uno {#loading-one}

Donde sea que se carga un archivo o una carpeta, también se carga un archivo `.3dheat`, y
una carpeta puede mezclar contenedores y archivos sueltos:

| Dónde | Qué se lee del contenedor |
|---|---|
| Panel Origen del **Mapa de calor** (archivos, carpeta, arrastrar y soltar) | sus tablas, como si fueran el `<partida>.parquet` suelto |
| **Mapa de calor → Muchas partidas a la vez** (Archivos, Carpeta, Añadir carpeta) | sus tablas, leídas en el mismo lugar por los workers del cargador |
| Pestaña **Partida** (Cargar, o soltar sobre la vista) | el documento de la partida |
| Pizarra de **Táctica**, telemetría | sus tablas |

Al abrir un contenedor se leen dos piezas pequeñas: su directorio, al final, y su manifiesto,
al principio; de una tabla no se lee nada hasta que el cargador la lee. Los auxiliares y el
documento de la partida solo se leen cuando algo los pide. Una carpeta que tiene la misma
partida dos veces, suelta y empaquetada, la carga una sola vez.

## Empaquetar y desempaquetar {#packing-and-unpacking}

Las conversiones nuevas escriben contenedores por defecto: el convertidor de War Thunder
(`heat3d-wt-replay`), el convertidor de CS2 (`heat3d_cs2 demos`) y la herramienta de Tacview
(`node tools/acmi-to-parquet.mjs`). `--loose` mantiene los archivos separados.

Las partidas convertidas antes, o por otras herramientas, se empaquetan con:

```
node tools/3dheat-pack.mjs <carpeta>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <carpeta|archivo.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <carpeta|archivo.3dheat>...
node tools/3dheat-pack.mjs update <archivo.3dheat> [--add <papel>[:<nombre>]=<archivo>]... [--remove <nombre>]...
node tools/3dheat-pack.mjs repack <carpeta|archivo.3dheat>...
```

- **pack** busca en las carpetas toda tabla `<partida>.parquet` con los archivos que le
  pertenecen, y escribe `<partida>.3dheat` junto a ellos. Una partida ya empaquetada se
  salta. Cada contenedor se vuelve a leer entero (el sha256, el tamaño, el CRC y el pie
  Parquet de cada miembro) antes de nada más; los archivos sueltos solo se borran con
  `--delete-loose`, y en una partida empaquetada antes solo cuando son exactamente byte a
  byte lo que guarda el contenedor. Una partida con un archivo cambiado en los últimos
  `--settle` minutos (10 por defecto) se deja en paz: un convertidor puede seguir
  escribiéndola.
- **unpack** escribe los miembros de vuelta como archivos sueltos junto al contenedor.
- **update** añade o sustituye miembros sin reescribir las tablas que ya tiene el contenedor
  (abajo).
- **repack** reescribe un contenedor entero, eliminando lo que dejaron las actualizaciones.

## El formato {#the-format}

Un archivo `.3dheat` es un archivo ZIP (cualquier herramienta ZIP lo abre), con estas reglas:

1. **`manifest.json` es el primer miembro** cuando se escribe un contenedor, y siempre está
   presente. Se encuentra a través del directorio central del ZIP, así que tras un `update`
   puede quedar más adelante en el archivo.
2. **Los miembros que se leen por rangos de bytes o que ya están comprimidos se guardan**
   (método ZIP 0): Parquet, Arrow, imágenes, modelos, audio, vídeo, blobs opacos. Un miembro
   guardado es un rango de bytes contiguo del contenedor, así que un lector lee el pie de una
   tabla y sus fragmentos de columna en su sitio, mediante `File.slice` en un navegador o una
   petición de rango HTTP, exactamente como leería el archivo suelto.
3. **El texto se comprime** (método 8): JSON, CSV, texto plano. Son pequeños y se leen enteros.
4. Los nombres son UTF-8 (bit 11 del indicador), relativos, separados por `/`, sin `..`; pueden
   incluir carpetas (`analysis/heat.json`). Un archivo suelto empaquetado conserva su propio
   nombre, así que al desempaquetar se recuperan los mismos archivos.
5. Los miembros de más de 4 GiB, o los contenedores de más de 65 535 miembros, usan ZIP64 como
   de costumbre. Los escritores no ponen descriptores de datos tras los miembros.

Los miembros que escriben hoy los convertidores, en este orden:

| Papel | Miembro | Guardado |
|---|---|---|
| `table` | `<partida>.parquet` | sí |
| `match` | `<partida>.match.json` | no (comprimido) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<partida>.<papel>.parquet` | sí |
| `summary` | `<partida>.summary.json`, el resumen del índice masivo ([Análisis masivo](mass-analysis.md)), añadido por `tools/3dheat-summarize.mjs` | no (comprimido) |

La tabla va justo después del manifiesto, así que la primera lectura del inicio del archivo
por parte del lector cubre a la vez el manifiesto y la cabecera local de la tabla.

### El manifiesto {#the-manifest}

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
   "sha256": "<64 dígitos hexadecimales>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| Campo | Significado |
|---|---|
| `format` | siempre `3dheat` |
| `format_version` | `mayor.menor` (abajo) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | qué es la partida y qué la hizo; `null` cuando se desconoce |
| `created`, `updated` | cuándo se escribió, cuándo se actualizó por última vez (`updated` aparece solo tras una actualización) |
| `roles` | cada papel con el nombre de su primer miembro: un índice rápido |
| `members` | cada miembro salvo el manifiesto: la lista completa, y la que un lector se fía |
| `matches` | opcional: las partidas de un contenedor que tiene varias (abajo) |
| `references` | opcional: archivos que el contenedor necesita pero no guarda |
| `extensions` | opcional: los metadatos propios de un convertidor |

Cada miembro:

| Campo | Significado |
|---|---|
| `name` | su ruta dentro del contenedor |
| `role` | para qué sirve (abajo) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` o `deflate` |
| `bytes` | su tamaño, sin comprimir |
| `sha256` | de sus bytes, sin comprimir |
| `rows` | el número de filas de una tabla |
| `schema` | la convención que sigue, `{ "id", "version" }`: el `format` y la `version` propios de un documento (`heat3d-wt-replay-match` 2), `heat3d-table` para una tabla que el visor lee por su pie `heat3d`, `heat3d-acmi-table` para la de la herramienta de Tacview |
| `match` | en un contenedor de varias partidas, el `matches[].id` al que pertenece |

### Pensado para crecer {#made-to-grow}

El formato está pensado para llevar repeticiones mucho más ricas que las de hoy sin romper lo
que las lee ahora:

- **Versiones.** `format_version` es `mayor.menor`. Un lector lee todas las versiones menores de
  su mayor e ignora cada campo que no conoce. El menor sube cuando se añade algo; el mayor solo
  cuando cambia el diseño de forma que un lector antiguo lo leería mal (un miembro que ya no se
  guarda, el manifiesto movido fuera del archivo). La convención de cada miembro tiene su propia
  versión, en su `schema`, así que un diseño nuevo de tabla o una versión nueva de documento no
  necesitan una versión nueva del contenedor. Los primeros contenedores escritos decían
  `"version": 1` en su lugar; los lectores lo toman como 1.0.
- **Los papeles están abiertos.** Un papel es cualquier cadena. Los lectores usan los papeles que
  conocen y conservan el resto: un papel desconocido se lista, nunca se rechaza, y `update` y
  `repack` lo transportan sin tocarlo. Un papel puede tener muchos miembros: varias tablas
  (pistas por unidad, telemetría a otras frecuencias), eventos, voz, sincronización de vídeo,
  referencias de nivel, sustituciones de figuras, resultados de análisis. Los nombres pueden
  incluir carpetas.
- **Cualquier medio.** Un miembro puede ser cualquier cosa con un tipo de medio: Parquet, JSON,
  Arrow, miniaturas PNG o JPEG, modelos glTF, audio, blobs sin procesar.
- **Varias partidas.** Una sesión o un torneo puede ir en un contenedor: `matches` las lista
  (`{ "id", "map", "mode", "started", ... }`) y cada miembro nombra su `match`. El visor carga
  cada miembro de papel `table`.
- **Referencias.** Los archivos que un contenedor necesita pero no guarda, un nivel por ejemplo,
  se listan en `references` por nombre y sha256
  (`{ "kind": "level", "name": "...", "sha256": "..." }`), así que se encuentra el archivo correcto
  y se comprueba sin copiarlo en cada partida.
- **Extensiones.** `extensions` guarda los metadatos de un convertidor bajo su propia clave,
  `"<proveedor>/<nombre>": { ... }`, así que dos convertidores nunca chocan y no hace falta añadir
  nada a los campos compartidos.
- **Actualizar en su sitio.** `update` añade o sustituye miembros sin reescribir las grandes tablas
  guardadas: los miembros nuevos y un manifiesto nuevo se añaden tras el final del contenedor,
  seguidos de un directorio central nuevo. Lo que se sustituyó queda como bytes sin referencia hasta
  `repack`. Se conserva cada miembro y cada campo del manifiesto, conocido o no. Una actualización que
  falla se deshace y el contenedor queda como estaba.

Los tests del visor lo comprueban: un contenedor de formato 1.7 con un papel desconocido, un campo de
miembro, una extensión y un miembro de audio en una carpeta se carga, y sobrevive a una actualización y
a un repack con todo intacto; un contenedor de mayor 2 se rechaza.

## Escritores {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (escribir, leer, verificar, actualizar, repack), usado por la herramienta de empaquetado y la de
  Tacview.
- Python: `container.py`, unas 140 líneas sobre el `zipfile` estándar, el mismo archivo en cada
  convertidor (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), así que ningún
  convertidor depende de otro. Un convertidor nuevo copia el archivo.
- El visor lee con
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
