---
title: "Grabaciones de Tacview (ACMI)"
parent: "Cargar datos"
nav_order: 7
lang: "es"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Grabaciones de Tacview (ACMI)

Tacview es un programa que graba vuelos en simuladores de vuelo; sus archivos terminan en `.acmi`. 3DHeat los abre para que vea dónde voló cada avión.

Las grabaciones de vuelo de Tacview se cargan como cualquier tabla: elija o arrastre un `.acmi` (texto, `.txt.acmi`, o comprimido, `.zip.acmi`) y pulse **Cargar**. Así obtiene el calor de todos los vuelos, y en la pestaña **Partida**, una repetición con figuras, trayectorias y una lista de eventos ([Repetición de partida](match-replay.md)). ACMI es el formato de archivo público de Tacview ([documentación](https://www.tacview.net/documentation/acmi/)); DCS (a través del exportador de Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS y otros lo escriben, así que esto lee cualquiera de ellos.

## Lo que se convierte en una grabación {#what-a-recording-becomes}

Una fila cada vez que se escribe la posición de un objeto, una fila por evento en el lugar del objeto, y una fila cuando un objeto desaparece (`Removed`, donde estaba por última vez). Un evento sobre un objeto que aún no se ha visto —un marcador, un mensaje a todos— es una fila del objeto `(recording)` en el punto de referencia. La grabación lleva sus propias instrucciones de lectura, así que el paso de asignación se rellena solo. El lector escribe estas columnas: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, y después cualquier otra propiedad que tenga la grabación. Sus funciones:

| Columna | Función | Significado |
|---|---|---|
| Time | tiempo | Segundos después de la ReferenceTime de la grabación; segundos Unix cuando la tiene, así el reloj muestra la hora real. |
| X, Y | posición | Este y norte, en metros, sobre un plano que toca la tierra en el punto de referencia de la grabación: las distancias y los rumbos son reales cerca de él, y se desvían menos de una parte por mil a 100 km. El norte pasa a ser el -Z del mundo. |
| Altitude | posición (arriba) | Metros. |
| Object | persona | El piloto y el nombre del objeto con su id, p. ej. `Viper 1 (F-16C_50) #a01`; un objeto sin tripulación `(T-90A) #401`. |
| Coalition | equipo | El bando (o el color, cuando no hay coalición). |
| Heading, Pitch | mirada | Grados; el rumbo 0 es el norte. |
| Recording | sesión | El Title de la grabación, o el nombre del archivo: varias grabaciones se cargan una junto a otra sin que sus trayectorias se unan. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtros | Se guardan para filtrar; Type y Name eligen la [figura](figures.md) de cada objeto, Event alimenta la lista de eventos del análisis, Roll inclina el avión. |
| U, V | | Los metros planos propios del juego, cuando todas las muestras los tienen (DCS los escribe). |
| EventObjects | filtros | Todos los objetos que nombra un evento (`Message|a01|b02|...`), por id. |
| RecordingInfo | | Las propiedades propias de la grabación tal como estaban en ese momento —DataSource, DataRecorder, Author, Category, Briefing, Comments, ...— en JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtros | Cualquier otra propiedad numérica que tenga la grabación. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtros | Cualquier otra propiedad de texto que tenga la grabación; una propiedad cuyo valor no es un número es texto. |

Se leen las cuatro formas de posición de Tacview (`lon|lat|alt`, con `u|v`, con `roll|pitch|yaw`, y con todas ellas y un rumbo). Los campos vacíos conservan el último valor; `-id` elimina un objeto, y un id usado de nuevo después es un objeto nuevo. Se tratan las comas escapadas y las líneas continuadas.

Las posiciones se proyectan siempre a partir de la latitud y la longitud, nunca de U/V, así que las grabaciones de todos los juegos comparten una proyección con un fondo del mundo real.

## Servidores de DCS: quién ganó y cómo terminó cada salida {#dcs-servers-who-won-and-how-each-sortie-ended}

Un servidor multijugador de DCS graba sus misiones con Tacview a todas horas, y un servidor PvP persistente lleva una campaña a lo largo de muchas de ellas: un bando gana tomando todos los aeródromos, FARP y zonas del otro, lo que lleva días y muchos reinicios de misión. Las grabaciones contienen los vuelos, no la campaña: ningún mensaje dice quién tomó qué, los aeródromos se escriben una vez al principio, y ninguno dice quién ganó. El conversor de Tacview (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) añade a cada fila lo que se puede saber y deja vacío lo que no - nunca adivina.

| Columna | Significado |
|---|---|
| `server` | el servidor o la campaña, según la cabecera de la grabación (su Title, Author y Comments nombran los servidores públicos conocidos - Blue Flag, SPS Contention, Growling Sidewinder; si no, un Author que nombra a alguien); `--server Name` lo nombra para toda una carpeta. Una grabación cuya cabecera no nombra ningún servidor - un Author como `Admin`, un Title y unos Comments que no escribe ningún servidor conocido - queda sin atribuir: `server` vacío, aunque se haya descargado de la página de grabaciones de un servidor, ya que esa página puede contener también misiones de otras comunidades |
| `mission` | el Title de la grabación sin su versión ni su mes de campaña: `Operation_Example_V7.7.99` pasa a ser `Operation Example` |
| `campaign` | la ronda de campaña a la que pertenece la grabación, por servidor, mapa y número: `Example Server North 3`. Una grabación es una sesión (de reinicio a reinicio); una ronda dura muchas sesiones, días o semanas |
| `round` | el número de esa ronda: el del servidor si publica uno, si no la n-ésima ronda vista de ese servidor y ese mapa; sale de un archivo de rondas (abajo), vacío sin él |
| `session` | el lugar de la grabación entre las sesiones de la ronda, 1, 2, ...; `sessionStart` su inicio real (segundos Unix) |
| `heldRed`, `heldBlue` | los lugares disputados que cada bando tenía al inicio de la sesión, según un archivo de rondas encadenado (abajo) |
| `won`, `matchWon` | 1 cuando el bando de la fila (su Color, Red o Blue) ganó esa campaña, 0 cuando la perdió; vacío donde ningún archivo de rondas nombra un ganador, y en las filas neutrales. Una campaña es a la vez la ronda y la partida, así que ambas tienen el mismo valor |
| `roundEndReason` | `capture` para una campaña ganada tomándolo todo |
| `won`, `matchWon` en cada sesión de una ronda | el resultado de la ronda, escrito en cada una de sus grabaciones en cuanto se conoce su final |
| `sortie` | en las filas de un avión: su vuelo, 1, 2, ... de despegue a despegue; el tiempo en tierra antes del primer despegue y después de un aterrizaje cuenta para el vuelo al que pertenece |
| `sortieResult` | cómo terminó ese vuelo: `landed`, `landed damaged` (tras un impacto en el aire), `ejected`, `shot down`, `destroyed` (en tierra), `crashed`, `despawned` (desaparecido en el aire sin causa visible - un jugador que se va), `airborne at end`, `no takeoff` |
| `sortieKills` | los derribos atribuidos al avión en ese vuelo |

En un servidor persistente, la salida es la unidad que tiene sentido: filtre por `sortieResult` = `shot down` para ver dónde se perdieron vuelos, o desglose el calor por `sortieResult` o por `server` en el [desglose](breakdown.md). Los despegues, aterrizajes, eyecciones, derribos y accidentes que la componen son los eventos que el conversor deduce de cómo se mueven los aviones (arriba).

Los lugares tomados entre dos sesiones de una ronda - conocidos por el archivo de rondas, abajo - son eventos `capture` al inicio de la grabación posterior: `Object` `(campaign)`, en el lugar, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Un aeródromo o un FARP que cambia de bando donde la grabación lo muestra - escrito de nuevo en el otro color, o eliminado y escrito de nuevo en su sitio en el otro en menos de cinco minutos - se convierte en un evento `capture` en la pista: `Event` = `capture`, `Airfield` su nombre, `Detail` `Red to Blue`, `Coalition` su nuevo bando. Una pista escrita por primera vez en un color no es una captura. Los servidores examinados hasta ahora escriben sus pistas una sola vez, así que sus grabaciones no contienen capturas.

### Archivos de rondas {#rounds-files}

Un archivo de rondas indica, por servidor, sus rondas de campaña, quién las ganó y las sesiones de cada una. Sale de lo que publica el servidor, o de las propias grabaciones (abajo).

Quién ganó una campaña lo publica el servidor - un registro de campañas en su página web -, no está en la grabación. Un archivo de rondas lo lleva, y el conversor lo lee con `--rounds file.json` (se puede dar más de uno):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

Una grabación pertenece a las rondas de su `server` cuyo `title` (una expresión regular) coincide con su Title; cada fila, a la ronda en la que cae su hora real - el RecordingTime de la grabación más los segundos de la fila, no la fecha de la misión dentro del juego. Las horas están en UTC. Una ronda sin ganador (rotada, aún en curso) da a sus filas el número de ronda y un resultado vacío.

El equivalente en el documento de la partida, el pie `acmi`, dice de dónde vino el resultado, como lo hace `result.source` en una partida de War Thunder: `outcome.result` es `{ winner, round, endReason, source }`, siendo `source` la `source` del archivo de rondas, o `null` cuando nada nombró un ganador. `outcome` también enumera las rondas de la grabación, sus capturas y sus salidas según cómo terminaron:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Una fila de un piloto `Viper 1 (F-16C_50) #a01` del bando azul en esa campaña dice entonces: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Rondas a partir de las propias grabaciones {#rounds-from-the-recordings-themselves}

Un servidor persistente conserva su campaña entre reinicios, y cada grabación empieza con las unidades terrestres y los objetos estáticos de ambos bandos donde los dejó la campaña. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` lee los primeros minutos de cada grabación ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), ordena por tiempo las grabaciones de un mismo mapa de cada servidor y las encadena:

- **Lugares**: el terreno en celdas de unos 2 km; una celda es de un bando cuando tres cuartas partes de las unidades que hay allí al inicio de una sesión son suyas. Los lugares *disputados* son los que se han visto en manos de ambos bandos.
- **Capturas**: un lugar en manos del otro bando al inicio de la sesión siguiente - tomado entre las misiones, o durante la anterior.
- **Una ronda nueva**: una sesión cuyos lugares difieren de los de la anterior en más del 60 % - la disposición inicial de una ronda nueva, no un paso de la antigua. Una ronda también termina cuando el servidor pasa a otro mapa (sus sesiones empiezan después de la última y siguen).
- **Quién ganó**: en una ronda terminada, el bando que tenía todos los lugares al inicio de su última sesión (`capture`, confianza alta); si no, el bando que tenía más lugares disputados (media si tenía el doble que el otro, si no baja; baja cuando terminó con un cambio de mapa). Una ronda abierta no tiene ganador, pero cada sesión dice cuántos lugares tenía cada bando a su inicio, así que se ve quién iba por delante.
- Un servidor cuyas sesiones empiezan todas igual no guarda estado entre ellas: no se encadena.

El inicio de la última sesión puede estar horas antes del final de la ronda, por eso importa la confianza. Comprobada con un servidor que publica sus ganadores, la cadena encontró cada ronda nueva en la sesión en la que empezaba la ronda publicada, y el bando que iba por delante en el último inicio fue el ganador publicado en cada una de las 9 rondas que pudo comprobar. `--official file.json` conserva las rondas publicadas de un servidor así y les añade las sesiones de la cadena; el `validation` del archivo dice hasta qué punto coincidió la cadena. En una campaña inventada:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### Ver una ronda de campaña como una serie {#watching-a-campaign-round-as-a-series}

Cargue juntas las grabaciones de una ronda - los archivos con la misma `campaign` - y el visor las reproduce como una sola serie: sesión tras sesión en su orden real, con las horas o días entre dos sesiones reducidos a una pausa de un minuto. La línea de tiempo marca en amarillo el inicio de cada sesión y las pausas como bandas oscuras, y el reloj dice qué sesión se está reproduciendo y su fecha real (`session 4/12 · 2026-11-02 12:38 UTC`). El calor, la repetición, los filtros y los Hallazgos funcionan sobre toda la serie como sobre cualquier dato cargado. La sección **Ronda de campaña** de la pestaña Partida enumera las sesiones con sus fechas, cuántos lugares disputados tenía cada bando en cada inicio - también como gráfico a lo largo de la ronda - y cuántos se tomaron antes; un clic lleva al inicio de una sesión. Una grabación cargada sola dice allí qué ronda y qué sesión es. Grabaciones de rondas distintas cargadas juntas no son una serie: cada una empieza en cero, como partidas separadas. El cargador de muchas partidas (**Muchas partidas a la vez**) también reproduce una ronda como serie, por streaming y ajustada a la GPU, para rondas de muchos gigabytes.

Los lugares que cambiaron de manos durante la ronda se dibujan en el mapa como zonas de captura, coloreadas según el bando que tenía cada uno al inicio de la sesión en curso, y cambian en los límites entre sesiones; cada cambio es una captura en la lista de eventos de la repetición. Se deducen de las filas cargadas - las unidades terrestres y los objetos estáticos de cada sesión en sus primeros minutos, en celdas de unos 2 km, como hace la cadena -, así que necesitan el cargador completo (el cargador de muchas partidas guarda demasiado poco de cada fila).

**Cargar la ronda entera desde una de sus grabaciones.** En un navegador normal, el visor no puede abrir archivos que usted no haya elegido: cargue juntos los archivos de la ronda. Servido por el servidor local del visor (`npm run dev` o `npm run preview`), sí puede: dé al archivo `tools/local-data.json`, ignorado por git, una entrada `campaigns` que nombre la carpeta de archivos de rondas y las carpetas de grabaciones convertidas, y la sección Ronda de campaña de una grabación suelta ofrece **Cargar la ronda entera**, obtiene las sesiones de la ronda que encuentra allí y las carga con el cargador de muchas partidas:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Solo se sirven las grabaciones que nombra un archivo de rondas (`tools/campaign-files.mjs`); una sesión que no se encuentra en esas carpetas se cuenta, no se carga.

Lo que publican los servidores conocidos:

| Servidor | Una ronda | Cómo gana un bando | Dónde se puede leer el ganador |
|---|---|---|---|
| SPS Contention | una campaña en un mapa y una época (días), a lo largo de muchos reinicios | todos los aeródromos, FARP y bastiones tomados; una campaña que terminó sin ganador fue rotada | el registro público de campañas del servidor (ganador, inicio y fin de cada campaña) |
| Blue Flag | una ronda de campaña a lo largo de muchas misiones de 5 horas; el `_YYYY_MM` del Title avanza un mes en cada reinicio | todas las posiciones enemigas tomadas; las rondas más antiguas daban como ganador al bando que tenía más tras un tiempo fijo | no publicado en ninguna forma encontrada hasta ahora; la cadena de las grabaciones sigue cada ronda y quién tiene cuánto en cada inicio |
| Growling Sidewinder | una ejecución (6 horas) de una misión de conflicto abierto | zonas y aeródromos tomados | su página de estadísticas muestra pilotos, no resultados; cada sesión empieza igual, así que ninguna ronda abarca varias sesiones: vacío |
| Misiones contra la IA (misiones de capturar zonas) | una ejecución de la misión | el bando de los jugadores contra la IA de la misión: sin resultado PvP | vacío |
| Sin atribuir (la cabecera no nombra ningún servidor) | - | - | vacío, `server` también vacío |
