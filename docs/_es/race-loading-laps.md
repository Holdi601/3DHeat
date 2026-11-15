---
title: "Cargar vueltas"
parent: "Análisis de carrera"
nav_order: 51
lang: "es"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Cargar vueltas

Un archivo de vuelta es una grabación de una conducción: dónde estaba el coche y qué hizo el piloto, muchas veces por segundo. Carga dos o más vueltas del mismo circuito y la pestaña **Análisis de carrera** puede compararlas.

![La sección Vueltas de la pestaña Análisis de carrera, con tres vueltas de demostración cargadas: lista de vueltas, estrella de referencia y enfoque](../assets/img/en/race-loading-laps-list.webp)

## Tus primeras vueltas {#your-first-laps}

1. Abre la pestaña **Análisis de carrera**.
2. ¿Solo quieres mirar? Pulsa **Vueltas de demostración** (véase [Vueltas de demostración](#demo-laps)).
3. Tus propias vueltas: grábalas en el juego con un grabador (véase [Formatos de archivo](#file-formats)). El grabador escribe un archivo por vuelta.
4. Pulsa **Cargar archivos de vuelta…** y elige dos o más archivos del mismo circuito, o pulsa **Carpeta…** y elige la carpeta que los contiene. También puedes soltar archivos o carpetas sobre la vista 3D.
5. Haz clic en una vuelta de la lista para ver dónde pierde tiempo.

**Aviso: las vueltas se comparan de un circuito en cada vez.** Cargar una vuelta de otro circuito con nombre vacía las vueltas que ya estaban cargadas.

## Los botones {#the-buttons}

| Control | Hace |
|---|---|
| **Cargar archivos de vuelta…** | un selector de archivos para `.json`, `.csv`, `.txt`, `.ibt`, `.gz` y `.h3dcars`, varios a la vez (`.h3dcars` es un archivo de coche, véase [Coches](race-replay-and-scene.md#the-cars)) |
| **Carpeta…** | un selector de carpetas: cada archivo de vuelta de la carpeta y de sus subcarpetas |
| **Vueltas de demostración** | tres vueltas inventadas de un circuito inventado (véase [Vueltas de demostración](#demo-laps)) |
| **Vaciar** | quita todas las vueltas (aparece cuando hay vueltas cargadas) |
| soltar sobre la vista | los archivos y carpetas soltados sobre la vista 3D se cargan de la misma forma |

Las vueltas se **añaden** a las ya cargadas, **salvo que sean de otro circuito con nombre: entonces primero se vacían las vueltas cargadas** (las vueltas se comparan de un circuito en cada vez). Los archivos que no se pueden leer aparecen bajo los botones, una línea por cada uno; los demás se cargan igual.

## Formatos de archivo {#file-formats}

El formato se reconoce por el contenido, no por el nombre del archivo. En pocas palabras:

- **heat3d-lap** es el archivo que escribe el grabador de 3DHeat para la mayoría de los juegos.
- **FH Companion** es una herramienta gratuita que graba vueltas de Forza Horizon. Escribe un archivo de vuelta y, junto a él, un archivo `.json.tele.gz` (la misma vuelta con los datos de cada neumático, comprimida con gzip). Elige los dos juntos.
- **`.ibt` de iRacing** es el archivo de telemetría propio de iRacing. Activa el registro en el coche con Alt+L y carga el archivo tal cual.
- Una **CSV de vuelta** es una tabla sencilla, con una fila por instante.

| Formato | Origen típico | Lo lee |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon y Motorsport por Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| `.json` de vuelta de FH Companion | la biblioteca de vueltas de FH Companion | `fromFhCompanion` |
| `.json.tele.gz` de telemetría de FH Companion | junto a cada archivo de vuelta de FH Companion | `readForzaTelemetry` |
| `.ibt` de iRacing | los archivos de telemetría propios de iRacing (registro activado con Alt+L en el coche) | `readIbt` |
| CSV de vuelta | `heat3d_capture laps`, el plugin de Trackmania, o cualquier CSV con `x`, `z`, una columna de tiempo y, opcionalmente, una columna `lap` | `fromCsv` |

Cómo se graba cada juego y qué envía lo documentan los grabadores:
[GameCapture: juegos](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
y [GameCapture: el formato de vuelta](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Véase también [Otros juegos de carreras](other-games.md).

## Carpetas y circuitos {#folders-and-courses}

**Carpeta…**, o una carpeta soltada, trae todos los archivos que hay dentro. Dentro de una carpeta solo se miran los archivos que terminan en `.json`, `.csv`, `.txt`, `.ibt` o `.tele.gz`, y un `.json` que no es una vuelta (el archivo propio de un circuito, su mapa) se salta sin error.

**Varios circuitos en una sola elección.** La biblioteca de vueltas de FH Companion guarda cada circuito en una carpeta llamada `<nombre del circuito> (course_<x>_<z>_to_<x>_<z>)` (o un simple `course_...` para un circuito sin nombre). Cuando los archivos elegidos están en más de una de esas carpetas de circuito, no se carga nada. En su lugar, la sección **Vueltas** dice «Estas son vueltas de N circuitos, y las vueltas se comparan de un circuito en cada vez. Elige uno:» y enumera cada circuito con su número de vueltas (archivos que terminan en `.json`, `.csv` o `.ibt`, sin contar `course.json`), con más vueltas primero. Al hacer clic en uno se cargan los archivos de ese circuito.

Un circuito se identifica por su nombre y su punto de **inicio**, no por el final. Las carreras que nunca terminaron las guarda FH Companion con el mismo nombre e inicio (en `unfinished/`), con el punto donde se pararon como final; van con su circuito, marcadas como **parcial** en la lista.

**Varios trazados entre los archivos elegidos.** Cuando los archivos elegidos directamente (no desde carpetas de circuito) son vueltas de más de un trazado con nombre, se ofrece la misma elección por trazado. Las vueltas que no dan ningún nombre de trazado van con el trazado que se elija.

## Nombres de coche {#car-names}

Una vuelta se llama por el nombre completo de su coche, como lo da el juego. Cuando el archivo de vuelta no nombra el coche:

1. **La carpeta.** La biblioteca de FH Companion guarda las vueltas en `<circuito>/<clase>/<nombre del coche> '<yy> (car<número>)/<puesta a punto>/<etiqueta>/<vuelta>.json`. La carpeta más interna que coincida con `<nombre> (car<número>)` da el nombre y el número; una que coincida con `car<número>` da solo el número. Solo las elecciones de carpetas y las carpetas soltadas traen esta ruta.
2. **Otra vuelta del mismo coche.** Cuando alguna vuelta ya nombra un coche, a cada vuelta con el mismo juego y el mismo número de coche se le da ese nombre: las vueltas cargadas juntas, y las que se carguen después en este navegador. Los nombres se guardan en `localStorage` bajo `heat3d.carNames` (con la clave `<juego>:<número de coche>`). En una ventana privada duran lo mismo que las vueltas.
3. Si no, «car 1234» por su número, o «car».

**Etiquetas.** En la lista de vueltas, cada vuelta muestra el nombre de su coche; varias vueltas del mismo coche se numeran como «Nombre #1», «Nombre #2». Las frases del análisis usan las mismas etiquetas cuando son únicas. Si no, usan el nombre del coche con el tiempo de vuelta, «Nombre (1:29.616)» (tiempos de ejemplo), y se numeran más si sigue sin ser único.

**Agrupación.** Las vueltas son del mismo coche (para envolventes, perfiles y comparaciones) cuando su número de coche (o su nombre, si no hay número) y su índice de rendimiento son iguales (`carKey`). El mismo modelo con otra puesta a punto es otro coche.

**Clases.** La clase de rendimiento de una vuelta es la del juego (Forza D..X, el nombre corto de clase de iRacing). Las estadísticas las ordenan D, C, B, A, S1, S2, R, X, y luego las demás por orden alfabético.

## Vueltas de demostración {#demo-laps}

**Vueltas de demostración** carga tres vueltas de un circuito inventado (cuatro rectas y cuatro curvas a derechas), hechas con un modelo de vehículo sencillo ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): la velocidad limitada por el agarre de cada curva, una pasada de aceleración hacia delante y una pasada de frenada hacia atrás, como hace un simulador de vueltas.

| Vuelta | Coche | Fallos |
|---|---|---|
| limpia | Coche de agarre | ninguno |
| con errores | Coche de agarre | frena 35 m pronto en T2, pisa el acelerador 30 m tarde a la salida de T3, toma T4 a 0,88 de su velocidad, conduce 1,2 m hacia un lado |
| otro coche | Coche de potencia | ninguno; conduce 1,2 m hacia el otro lado |

| Coche (número) | Agarre | Frenada | Tracción | Potencia/masa | Resistencia |
|---|---|---|---|---|---|
| Coche de agarre (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Coche de potencia (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

La vuelta con los errores es la enfocada. El circuito está dibujado como Forza guarda su mundo (de mano izquierda), así que, igual que con una vuelta real de Forza, sale reflejado y la pestaña ofrece **Invertir X**. Las tres vueltas llevan datos por rueda, así que cada parte de la pestaña tiene algo que mostrar.

## La lista de vueltas {#the-lap-list}

Cada fila, de izquierda a derecha:

| Elemento | Hace |
|---|---|
| ● / ○ | muestra u oculta la vuelta (líneas, coche, tarjeta, gráficas); las vueltas ocultas siguen analizándose |
| trazo de color | el color de la vuelta |
| nombre y etiquetas | haz clic para **enfocar** la vuelta; pasa el ratón para ver su archivo de origen y su coche (nombre · clase PI · tracción) |
| ⌖ | sigue a este coche con la cámara (haz clic otra vez para parar) |
| ★ | compara todo con esta vuelta (la convierte en referencia); desactivado en la referencia |
| × | quita la vuelta |

**Etiquetas:** *referencia*; *la mejor de X* (o *la mejor de su clase*) en la vuelta más rápida de una clase, cuando hay varias clases; *parcial* en una carrera que no llegó a la meta.

**La segunda línea:** la clase (solo con varias clases), el tiempo de vuelta (`1:29.616`), la diferencia con la vuelta con la que se compara (la mejor de su clase, o la referencia) como `+0.512` (ejemplo), y *sale tarde* cuando la vuelta empieza más de 10 m después del inicio de la referencia.

Con más de 8 vueltas, una línea «N de M dibujadas» ofrece **Mostrar todos** (dibuja cada vuelta: más lento, y un enredo) y **Solo las que se miran** (la referencia, la vuelta enfocada y la mejor de su clase; las estadísticas cuentan cada vuelta de todos modos).

Debajo de la lista: la nota de espejo cuando las vueltas dicen que el dibujo sale reflejado (véase [mundos reflejados](race-replay-and-scene.md#mirrored-worlds)), y con dos o más vueltas la nota «Haz clic en una vuelta para ver dónde pierde tiempo…». Además, con varias clases, se indica que cada vuelta se compara con la más rápida de su propia clase.

### Referencia y enfoque {#reference-and-focus}

- **Referencia:** la vuelta a la que se alinean todas las demás y, por defecto, con la que se comparan. Es la vuelta **completa** más rápida, salvo que ★ elija otra (la primera vuelta cargada, cuando ninguna está completa). Quitar la vuelta de referencia vuelve a la elección automática.
- **Enfoque:** la vuelta cuyos hallazgos, control del coche y mapas se muestran. Se queda donde la puso el usuario; si no, es la **más lenta** que no es la referencia («lo que más hay que aprender»). Enfocar una vuelta también la muestra, y muestra la mejor de su clase. Enfocar la referencia la compara con la otra vuelta que fue más rápida en cada curva.
- **Clases:** con vueltas de varias clases de rendimiento, cada vuelta se compara con la vuelta completa más rápida de su propia clase (la referencia, en la clase de la referencia). Véase [Estadísticas del recorrido](race-course-statistics.md).

### Colores {#colours}

Cada vuelta tiene su propio color, según su lugar en el orden de carga, así que una vuelta conserva su color cuando otras están ocultas. Los tonos se reparten por la rueda de color igual que el modo de equipos del mapa de calor reparte los grupos. Para cada puesto, la luminosidad (de 0,52 a 0,66 en OKLCH) y la saturación (de 0,12 a 0,18) se eligen para quedar lo más lejos posible de los puestos vecinos (y el último del primero), con visión normal, protan y deutan, y cada uno con al menos 3:1 frente a la superficie oscura de la gráfica.

## Para desarrolladores {#for-developers}

Código: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Cómo se lee cada formato {#how-each-format-is-read}

Cada formato acaba en un solo `LapTrace`: canales con nombres canónicos (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., véase la [tabla de canales](race-charts-and-hud.md#the-channel-table)), el coche, el tiempo de vuelta, si es una vuelta completa y un bloque `meta`. En todos los formatos, `time` y `distance` se desplazan para empezar en 0. Cuando una fuente no trae `speed`, se calcula como distancia dividida entre tiempo, a partir de las muestras vecinas.

#### heat3d-lap JSON {#heat3d-lap-json}

Un objeto JSON con `"format": "heat3d-lap"`. Campos que se leen:

| Campo | Uso |
|---|---|
| `channels` | un objeto de arrays, uno por canal, por nombre canónico; los canales por rueda como `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` y `z` son obligatorios |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | el coche: id, nombre, índice de clase de Forza (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), índice de rendimiento y código de tracción (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | el tiempo de vuelta; si falta, el último valor de `time` |
| `lap.complete` | `false` marca una carrera parcial; cualquier otro valor es completa |
| `game`, `track` | nombres; `game` decide la disciplina (véase abajo) |
| `units.slipRatio` / `units.slipAngle` | cómo se escala el deslizamiento: una unidad que contiene `raw` significa `scaled`, `normalised` significa `peak`, y cualquier otra, `physical` |
| `meta` | `slip`, `surface`, `discipline` tal como se den anulan lo anterior |

Sin un canal `distance`, la distancia se suma a partir de las posiciones 3D.

#### FH Companion lap files {#fh-companion-lap-files}

Un objeto JSON con un objeto `Lap` que contiene un array `samples` (una muestra cada 5 m aproximadamente). Campos asignados:

| FH Companion | Canal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (desplazados para que la vuelta empiece en 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | lo mismo, en minúsculas |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², a pesar del nombre) |
| `Puddle` | `puddle` |

El coche sale de `Lap.carOrdinal`, `Lap.carName` (solo en archivos nuevos), `Class` (o `Lap.carClass` como índice de clase de Forza), `Lap.performanceIndex`, `Lap.drivetrain` y `Lap.peakKilowatts`; el tiempo, de `Lap.lapSeconds`; una carrera con `EndedAtFinish: false` es parcial. El juego es `forza-horizon`.

Estos archivos no traen datos de neumáticos ni rumbo, así que los bloqueos, los patinajes y los derrapes no se pueden juzgar solo con ellos. Los empujes (a partir del volante frente a la trazada) y los golpes y choques sí se pueden. Elige también el `.tele.gz` junto a cada uno para el resto.

#### FH Companion telemetry (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

JSON comprimido con gzip, `{ version, columns, data }`: el Data Out completo de Forza para una vuelta, una fila por paquete, con los nombres de campo propios del juego. Las columnas se buscan por nombre, nunca por posición. El formato 2 guarda cada paquete (unos 110 por segundo, frente a los 64 ticks del juego). Una fila idéntica a la anterior en todo salvo en el reloj propio del grabador (`t`, `metres`) se descarta, así que una vuelta se lee a las 64 filas por segundo del juego. (El aviso del botón de carga lo dice: «para el deslizamiento de cada neumático a 64 Hz».)

| Campo de Data Out | Canal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (marco del coche: x a la derecha, y arriba, z hacia delante) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, escalados de 0..255 a 0..1 |
| `Steer` | `steer`, escalado de -127..127 a -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, convertido de Fahrenheit a °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` por rueda |

`<Wheel>` es `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` → `FL`, `FR`, `RL`, `RR`. El deslizamiento se marca como `peak` (el deslizamiento normalizado de Forza: más allá de 1, el neumático ha soltado).

**Emparejamiento.** Un archivo de vuelta `<vuelta>.json` y su `<vuelta>.json.tele.gz`, elegidos o soltados juntos (misma ruta, salvo por `.tele.gz`), forman **una sola** vuelta: los canales de la telemetría, con el coche, la clase, el tiempo, el trazado y la marca de parcial del archivo de vuelta. El nombre del coche del archivo de telemetría prevalece cuando lo tiene. Un `.tele.gz` solo también se carga: los archivos de formato 2 traen `car` (`ordinal`, `name`, `class`, `pi`), `track` y `lapSeconds`. Sin ellos, el tiempo de vuelta es la duración propia de la telemetría y el coche es desconocido.

#### iRacing `.ibt` {#iracing-ibt}

El archivo de telemetría de iRacing se lee directamente (en el navegador, sin conversión): la cabecera de 112 bytes, la subcabecera de disco de 32 bytes, la tabla de variables (144 bytes por canal) y el YAML de la sesión.

- **Canales obligatorios:** `SessionTime`, `Lap`, `Lat`, `Lon`. Sin ellos: «… no tiene los canales SessionTime, Lap, Lat y Lon; ¿es un archivo de telemetría de iRacing?»
- **Posiciones:** latitud y longitud se colocan en metros sobre un plano tangente a la primera posición no nula (radio de la Tierra 6 371 008,8 m): x hacia el este, z hacia el sur, y la altitud (`Alt`). Así, con el rumbo por defecto de la cámara, el norte queda arriba en la pantalla. No es el marco propio del circuito: un modelo de circuito extraído no encajaría.
- **Vueltas:** la sesión se divide donde cambia `Lap`. Una vuelta se conserva cuando tiene más de 60 muestras, empieza por debajo del 5 % de `LapDistPct` y termina por encima del 95 %. Las vueltas parciales se descartan. Si no queda ninguna: «… no tiene ninguna vuelta completa del circuito de N km» (longitud del circuito, del YAML) o «… no tiene ninguna vuelta completa».
- **Distancia:** `LapDist` desde el inicio de la vuelta; si no, sumada a partir de las posiciones.
- **Coche:** de `DriverInfo`: el `CarScreenName` del jugador, `CarID` (como número de coche) y `CarClassShortName` (como clase). Circuito: `TrackDisplayName`; si no, `TrackName`.

Canales asignados:

| iRacing | Canal | Conversión |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | mismos nombres | - |
| `Clutch` | `clutch` | `1 - v` (iRacing cuenta el enganche; el nuestro es el pedal) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radianes en sentido antihorario a -1..1, derecha positiva; máximo de al menos 0,1, π si falta) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | lo mismo, en minúsculas | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | dividido entre 100 cuando supera 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | temperatura central de la carcasa |
| `LFshockDefl` ... | `suspensionM.FL` ... | deflexión del amortiguador, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa a psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Prefijos de rueda: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Cada otro** canal con un valor por muestra (que no sea de tipo campo de bits) se pasa con su propio nombre, y por rueda cuando empieza por un prefijo de rueda (`RRspeed` pasa a `speed.RR`). Así las gráficas y las listas de valores de las tarjetas los ofrecen todos. iRacing no registra el deslizamiento de los neumáticos: el control del coche se juzga por el ángulo de deriva (`Yaw`, ajustado a la dirección de marcha, frente a hacia dónde va el coche) y por el volante frente a la trazada. La guiñada frente a la aceleración lateral se usa solo cuando no se puede ajustar el rumbo, así que en ese caso no hay ángulo de deriva (véase [Eventos de control del coche](race-control-events.md)).

Errores: «… es demasiado corto para ser un archivo .ibt», «… no tiene una cabecera de telemetría de iRacing», «… no tiene posiciones GPS».

#### CSV de vuelta {#lap-csv}

Una fila por muestra. Muchas vueltas en un solo archivo se distinguen por una columna `lap`. El separador se detecta a partir de las cinco primeras líneas. Una primera línea opcional `# { ...json... }` describe la carrera: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Columna (sin distinguir mayúsculas) | Canal |
|---|---|
| `x`, `y`, `z` | posición (`x` y `z` obligatorias) |
| `elapsed` o `time` | `time` (obligatoria por vuelta) |
| `metres` o `distance` | `distance` (si no, sumada a partir de las posiciones) |
| `speed_ms` o `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | lo mismo |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| cualquier nombre de canal canónico, p. ej. `latVel`, `slipIndex.FL` | el mismo |
| `lap` | a qué vuelta pertenece una fila |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | tiempo de vuelta, número de coche, clase, PI, circuito (de la primera fila de cada vuelta) |

Sin descripción, el juego se toma como `forza-horizon` y cada vuelta como completa. El origen de una vuelta se muestra como `<archivo> · <vuelta>` cuando el archivo tiene varias. Errores: «… no tiene filas», «… no tiene columnas x y z», «… no tiene vueltas con una columna de tiempo».

#### Disciplina y superficie {#discipline-and-surface}

Lo que el análisis supone de una vuelta cuando la vuelta no lo dice (`lap.ts`):

- **Disciplina:** `meta.discipline`; si no, un nombre de juego que coincida con `rally|wrc|dirt|rbr` es **rally**; `trackmania` es **arcade**; cualquier otro, **circuito**.
- **Superficie:** `meta.surface`; si no, a partir del nombre del circuito y de la fuente. Un rally llamado `monte` es **mixto**; `snow|ice|winter|arctic|sweden`, **nieve**; los rallies de asfalto (Spain/España/Catalunya/Costa Daurada, Croatia/Hrvatska, Europa Central, Germany/Deutschland, Japón, Corsica/Corse, Ypres, o las palabras tarmac/asphalt) son **asfalto**; cualquier nombre con `scramble|trail|cross country|dirt|gravel` es **suelto**. Cualquier otro tramo de rally se juzga por cómo se condujo el coche: sobre las muestras a más de 12 m/s y en el suelo (al menos 200), un percentil 95 de aceleración lateral de 10 m/s² o más, junto con una deriva mediana por debajo de 6° (tomada donde el coche tomó la curva al 70 % de eso o más, con al menos 30 muestras), es asfalto. Cualquier otro caso, o datos insuficientes para decidir, es suelto. Un nombre que no es de rally pero contiene `rally` es suelto; todo lo demás, asfalto.
- Por muestra, un canal `loose` (la vibración de la superficie de Forza, los materiales de Trackmania; véase [Eventos de control del coche](race-control-events.md#the-ground)) anula la superficie de la vuelta.
