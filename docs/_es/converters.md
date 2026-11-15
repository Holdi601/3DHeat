---
title: "Los convertidores lo conservan todo"
parent: "Cargar datos"
nav_order: 8
lang: "es"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Los convertidores lo conservan todo

No necesitas esta página para abrir una repetición. Es para quienes escriben herramientas que convierten archivos de juego en tablas de 3DHeat, y para quien quiera saber por qué esas tablas guardan tanto.

Toda herramienta que convierte la repetición, la demo, el registro o la telemetría en vivo de un juego en algo que el visor abre sigue una sola regla:

> **Convierte todo lo que el origen contiene y que se pueda leer ahora, y guarda el resto íntegro, para poder leerlo más tarde sin el archivo original.**

Una repetición a menudo desaparece tras una actualización del juego, una reinstalación o un disco lleno, y una señal en vivo desaparece en el momento en que se envía. Lo que un convertidor descarta se pierde para siempre; lo que guarda íntegro se puede decodificar el día que alguien lo entienda. Así que un convertidor nunca decide qué será útil: decodifica lo que puede, guarda cada mensaje, paquete, evento, propiedad o línea sin cambios junto a la tabla, y dice en su propia salida cuánto de cada cosa leyó y cuánto solo guardó.

Esta página es la convención que comparten todos los convertidores: los convertidores de repeticiones de War Thunder, World of Tanks, World of Warships y Squad, el convertidor de demos de CS2, el vigilante de segundo plano (su decodificador de repeticiones de Dota y cada adaptador en vivo), los lectores de telemetría de la herramienta de captura del juego, y las importaciones propias del visor (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Los lectores propios del visor se describen en [Grabaciones de Tacview](tacview-acmi.md) y [Cargar archivos](loading-files.md); la forma de un solo archivo está en [Un archivo por partida](container.md). Una partida se convierte en una tabla, un `match.json` y archivos auxiliares, opcionalmente empaquetados en un solo archivo `.3dheat`. La sección **Completeness** del README de cada herramienta enumera, para ese origen, qué se lee, qué se guarda sin decodificar y qué no está disponible, y por qué.

## Tres destinos para cada elemento {#three-homes-for-every-item}

Todo lo que contiene un origen acaba en exactamente uno de tres sitios:

| Destino | Qué va ahí |
|---|---|
| **Decodificado** | La tabla (una fila por muestra o evento, las columnas que lee el visor, columnas extra para cada otro valor que pertenece a una fila) y el documento de la partida `<match>.match.json` (todo lo que pertenece a la partida en conjunto: ajustes, alineaciones, resultados, marcadores, la autocomprobación). |
| **Guardado en bruto** | Un archivo auxiliar junto a la tabla: cada elemento que no se decodifica, o que solo se decodifica en parte, íntegro y sin cambios, con su tipo, su tiempo y la unidad o entidad a la que pertenece. |
| **No disponible** | Nombrado en la sección Completeness del README con el motivo: el formato no lo trae (una repetición de cliente no tiene las entradas de los demás jugadores), el origen nunca lo envía, o leerlo no está permitido (un proceso protegido, un bloque cifrado cuya clave no es nuestra para usar). |

Un elemento que se decodifica **en parte** se decodifica *y* se guarda en bruto: la tabla recibe lo que se entiende, el auxiliar el elemento completo, para que un decodificador mejor más adelante no necesite el archivo original.

No hay un cuarto destino. Descartar algo porque parecía inútil, porque era un duplicado "probablemente", o porque era grande, es un fallo. Solo se permite reducir en la tabla (una cámara a 2 Hz en vez de 60), nunca en el auxiliar.

## Archivos auxiliares {#sidecars}

Un archivo auxiliar es un Parquet junto a la tabla, con su mismo nombre:

```
<folder>/<match>.parquet              la tabla
<folder>/<match>.match.json           el documento de la partida
<folder>/<match>.<what>.parquet       un auxiliar
```

`<what>` es una palabra de esta lista. Un convertidor nuevo elige la palabra que encaje, o añade una nueva aquí **y** a `SIDECAR_PARQUET` en [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts), para que el visor la deje fuera al cargar una carpeta completa.

| `<what>` | Contiene | Lo usan |
|---|---|---|
| `messages` | paquetes, llamadas a métodos de entidades y actualizaciones de propiedades de un flujo de red, íntegros | War Thunder, World of Tanks, World of Warships |
| `flight` | entradas del modelo de vuelo por aeronave, íntegras | War Thunder |
| `packets` | tramas y mensajes de red íntegros, o fragmentos de contenedor, fuera del flujo de entidades | CS2, Dota 2, Squad |
| `events` | eventos del juego con todas sus claves, tal como los da el analizador | CS2 |
| `entities` | actualizaciones de entidades y de propiedades, llamadas remotas, canales abiertos y cerrados, con las exportaciones que necesita un decodificador | Squad, Dota 2 |
| `props` | cada propiedad de entidad que lee el analizador, cada vez que cambió | CS2 |
| `units` | estado de unidades fuera de la tabla de posiciones | Dota 2 |
| `combatlog` | un registro de combate, cada entrada con cada campo | Dota 2 |
| `strings` | cada entrada de cada tabla de cadenas | CS2, Dota 2 |
| `objectives` | zonas de captura y objetivos, cada cambio con su tiempo | War Thunder |
| `raw` | una señal en vivo: cada paquete, línea, documento de API o lectura de memoria recibido, íntegro | las sesiones del vigilante (`heat.raw.parquet`), los grabadores de vuelta de la herramienta de captura del juego (`<stamp>_<game>.raw.parquet`), los archivos de repetición de osu!, LoL y Valorant del vigilante |

El visor, al cargar una carpeta, salta cada `*.<what>.parquet` de esta lista, y cada `*.match.json`, `*.meta.json`, `*.summary.json` y los demás auxiliares JSON; si abres uno de ellos por sí solo, eligiéndolo o soltándolo, se carga como cualquier otra tabla (ver [Cargar archivos](loading-files.md)).

Estos son los archivos tal como los escribe un convertidor con `--loose`. Por defecto, los convertidores de War Thunder, CS2 y Tacview empaquetan la tabla, el documento y los auxiliares de una partida en un solo archivo, `<match>.3dheat`, con los mismos nombres (ver [Un archivo por partida](container.md)); todo lo de aquí vale para cada miembro.

### Columnas {#columns}

Cada fila de un auxiliar es un elemento. Las columnas son, en este orden, las que correspondan:

| Columna | Tipo | Qué es |
|---|---|---|
| `time` | float64 | segundos en el mismo reloj que el `time` de la tabla (o `tick` cuando el origen cuenta ticks; entonces ambos) |
| `type` | cadena (diccionario) | qué es el elemento, en los términos propios del origen: un tipo de paquete, un id de mensaje, un nombre de evento, una ruta de propiedad, un prefijo de línea |
| `name` | cadena (diccionario) | su nombre cuando se conoce (un nombre de comunidad, un nombre de clase); si no, vacío |
| `entity` / `unit` / `uid` / `player` | entero o cadena | a quién pertenece, con los mismos ids que la tabla, para que una fila del auxiliar se pueda unir a una trayectoria |
| `decoded` | cadena (JSON) | lo que se entiende de él, cuando hay algo; si no, vacío |
| `payload` | binario | los bytes del elemento, íntegros y sin cambios (fuentes binarias) |
| `text` | cadena | el texto del elemento, íntegro y sin cambios (fuentes de texto: una línea de registro, un objeto JSON, un bloque clave-valor) |

Se permiten más columnas (un desplazamiento de bits, un tamaño, un canal). Las cadenas que se repiten van codificadas en diccionario y el archivo se escribe con zstd, así que un auxiliar ocupa una fracción del tamaño de la repetición.

Un auxiliar tiene que bastar por sí solo: un decodificador escrito más tarde lee el auxiliar, nunca la repetición original. Cuando un elemento no se puede entender sin contexto (la clase de una entidad, una tabla de cadenas, una clave a la que se refiere un mensaje), el contexto va también al auxiliar, o al documento de la partida.

### Fuentes en vivo {#live-sources}

Los adaptadores en vivo (telemetría UDP, memoria compartida, el registro de un juego, una API local) no tienen un archivo al que volver. Registran **cada campo que envía la fuente**, incluso los que todavía nada usa:

- un flujo de paquetes: cada paquete íntegro, `payload` los bytes, `type` su id o formato de paquete, a la velocidad a la que llega;
- memoria compartida o una API consultada periódicamente: cada campo de cada lectura, como columnas con nombre o el bloque entero como `payload`, a la velocidad a la que lo lee el adaptador;
- un registro: cada línea, `text` la línea, `type` el tipo de línea, incluidas las líneas que el adaptador no usa.

Estos van a `<session>.raw.parquet` junto a la tabla de la sesión. El tamaño es el precio de la regla; se mantiene a raya con zstd y la codificación de diccionario, no dejando cosas fuera.

## La autocomprobación {#the-self-check}

Cada convertidor escribe, en su documento de la partida (o en el `meta.json` de la sesión, o en un resumen cuando no tiene documento de partida), un bloque `completeness` bajo `selfCheck`:

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

| Campo | Significado |
|---|---|
| `seen` | cuántos elementos de este tipo contiene el origen |
| `decoded` | leídos íntegros en la tabla o en el documento de la partida |
| `partial` | leídos en parte en la tabla o el documento, y guardados íntegros en un auxiliar |
| `raw` | guardados íntegros solo en un auxiliar, sin decodificar |
| `lost` | `seen - decoded - partial - raw`: tiene que ser 0 |

El `lost` de primer nivel es la suma. Las pruebas de un convertidor afirman que vale 0 en sus muestras sintéticas, y el README dice cuánto valió en las reales. Un `lost` distinto de cero es el convertidor diciendo que ha incumplido la regla; nombra el tipo, para que el hueco se pueda encontrar.

Los "tipos" son los del propio origen: tipos de paquete, ids de mensaje, nombres de evento, grupos de propiedades, tipos de línea. Se cuentan donde el convertidor los encuentra, no a partir de una lista de lo que espera, así que un tipo que nadie conocía aparece con su recuento en lugar de desaparecer.

## La sección Completeness del README {#the-readmes-completeness-section}

El README de cada convertidor tiene una sección titulada **Completeness**, con tres listas:

- **Read** (Leído): lo que va a la tabla y al documento de la partida, y cómo se comprobó cada campo nuevo frente a algo independiente (los números propios del juego, una segunda fuente, una grabación hecha con ese fin).
- **Kept raw** (Guardado en bruto): qué hay en cada auxiliar, con qué `type`, y lo que se sabe de él hasta ahora.
- **Not available** (No disponible): lo que el origen no trae o no se puede leer, y por qué.

Enlaza de vuelta a esta página.

## Estado de cada convertidor {#where-each-converter-stands}

| Convertidor | Auxiliares | Su sección Completeness |
|---|---|---|
| Repeticiones de War Thunder | `messages`, `flight` | [README de 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (sus recuentos de autocomprobación están bajo `counts`; el bloque `completeness` está por llegar) |
| Repeticiones de World of Tanks | `messages` | [README de 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| Repeticiones de World of Warships | `messages` | [README de 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Demos de servidor de Squad | `entities`, `packets` | [README de 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| Demos de CS2 | `events`, `props`, `strings`, `packets` | [README de 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Repeticiones de Dota 2 (vigilante) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Repeticiones de Dota 2](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| Repeticiones de osu!, LoL, Valorant (vigilante) | `raw` | sus páginas en los [documentos del vigilante](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Adaptadores en vivo (vigilante) | `raw` | la página de cada juego en los [documentos del vigilante](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), y [desarrollo](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) para `Session.raw` |
| Grabadores de vuelta (captura del juego) | `raw`, y bytes `unparsed` dentro de un archivo de vuelta de Forza | [README de 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Las importaciones propias del visor | ninguno: ver abajo | esta página |

### Las importaciones propias del visor {#the-viewers-own-imports}

Tacview ACMI, OCAP y los formatos GPS se leen en el navegador desde el archivo propio del usuario; el visor no guarda nada de ellos, así que el propio archivo sigue siendo el registro. Aun así leen todo lo que pueden:

- **Tacview ACMI** (`src/data/acmi.ts`): cada línea de objeto con posición es una fila con cada propiedad que trae la grabación, cada evento es una fila, cada eliminación es una fila, y las propiedades propias de la grabación (con FileType y FileVersion de la cabecera) aparecen en cada fila como `RecordingInfo`; una línea de comentario es un evento `Comment`, un objeto que nunca recibe posición es una fila `Unplaced` en el punto de referencia, y U/V son columnas siempre que alguna fila las tenga. Una línea de propiedad sin posición se lee en parte: sus valores llegan a la siguiente fila del objeto, no a su propio tiempo. `AcmiTable.completeness` cuenta las líneas del archivo por tipo.
- **OCAP** (`src/data/ocap.ts`): los fotogramas, disparos y marcadores de cada entidad, cada tipo de evento (los tipos desconocidos como filas de "Mission" con su texto) y los campos propios del documento (`Info`). Aún no se leen: los campos de entidad y los elementos de posición finales distintos de los que enumera su cabecera (añadidos de un grabador más nuevo), ni los fotogramas repetidos de una unidad muerta tras su muerte (reducidos a propósito: en ellos nada cambia).
- **Formatos GPS** (`src/data/geoTracks.ts`): las posiciones, su tiempo, altitud, rumbo y velocidad, y frecuencia cardiaca, cadencia, potencia, temperatura, satélites, HDOP y altitud de presión cuando el archivo los registra. Aún no se leen: otras extensiones de GPX y KML, sentencias NMEA distintas de las de posición, registros IGC distintos de las posiciones y sus extensiones, y mensajes FIT distintos de los de registro (vueltas, sesiones, información del dispositivo).

Estas carencias se enumeran para cerrarlas, no para justificarlas; las exportaciones del visor de una grabación cargada (`src/data/exportRecording.ts`) escriben solo lo que se leyó.

## Añadir un convertidor {#adding-a-converter}

1. Enumera lo que contiene el formato, a partir de su documentación, de sus propias estructuras, o contando cada tipo de mensaje en muestras reales. La lista es el `types` de la autocomprobación.
2. Decodifica lo que se pueda comprobar ahora. Cada campo nuevo se comprueba frente a algo independiente antes de entrar en la tabla; un campo que todavía no se puede comprobar se queda en bruto.
3. Guarda el resto íntegro en un auxiliar con el nombre indicado arriba, con las columnas de arriba.
4. Escribe el bloque `completeness` y una prueba de que tiene `lost` 0.
5. Escribe la sección Completeness del README y enlaza aquí.
6. Si el `<what>` del auxiliar es nuevo, añádelo a la tabla de arriba y a `SIDECAR_PARQUET` en `src/data/filePick.ts`.

Los convertidores son de sala limpia: se escriben a partir de formatos, documentación y muestras, nunca a partir de código GPL o AGPL. Las muestras de repeticiones reales se quedan en la máquina que las hizo; las pruebas usan archivos sintéticos.
