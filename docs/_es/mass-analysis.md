---
title: "Análisis masivo"
nav_order: 8
lang: "es"
source: "mass-analysis.md"
source_hash: "e65b729b5928"
translated: true
outdated: false
---

# Análisis masivo: miles de partidas a la vez

El **análisis masivo** te muestra a qué suma una carpeta entera de partidas: qué vehículo gana más, qué bando sale favorecido, dónde está la acción. Úsalo cuando tienes muchas más partidas de las que podrías ver.

Trabaja con un resumen pequeño de cada partida, así que mil o diez mil partidas se abren rápido. Solo carga las filas completas de las partidas que pulsas.

## Pruébalo {#try-it}

1. Abre **Análisis masivo** en la barra lateral del Mapa de calor.
2. Pulsa **Carpeta...** (o **Archivos...**) y elige tus partidas `.3dheat`.
3. Espera mientras el panel lee los resúmenes ("Resúmenes... n de N").
4. Pulsa **Abrir análisis**. Se abre una ventana con pestañas.
5. Ajusta los filtros (Juego, Mapa, Modo, Desde, Hasta) y lee una pestaña, por ejemplo Equilibrio.
6. Haz clic en una fila, una celda o un hallazgo: sus partidas se cargan en la vista 3D, con la cámara en el lugar.

![La pestaña Equilibrio: porcentaje de victorias y bajas por muerte según el vehículo](../assets/img/en/mass-balance.webp)

```
carpeta de .3dheat -> resúmenes -> ventana (pestañas) -> clic en una fila -> las partidas se abren en 3D
```

Un archivo `.3dheat` es una partida ([Un archivo por partida](container.md)). Un *mapa de calor* y una *fila* se explican en el [glosario](glossary.md).

## Obtener los resúmenes {#getting-the-summaries}

La mayoría de la gente no tiene que hacer nada: el panel calcula por sí mismo los resúmenes que faltan. Para preparar una carpeta grande una sola vez, usa la herramienta sin conexión de más abajo.

Cada partida `.3dheat` recibe un resumen (`src/mass/summarize.ts`), que se guarda en el contenedor como el elemento `<match>.summary.json` (función `summary`, ver [Un archivo por partida](container.md)). La herramienta sin conexión los escribe, y un índice por carpeta. Es una herramienta de desarrollo; ejecútala sobre una carpeta grande para ahorrarle trabajo al panel:

```
node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Una partida ya resumida (con la misma versión de formato) solo se lee; `--force`
  la vuelve a calcular. `--no-write` deja los contenedores como están.
- Un archivo cambiado en los últimos `--settle` minutos (10) se deja fuera: un
  conversor puede seguir escribiéndolo.
- `<folder>/3dheat-index.jsonl.gz`: una línea por partida - su ruta, tamaño, hora
  y resumen sin la rejilla. `<folder>/3dheat-index.grids.jsonl.gz`: una línea por
  partida con su rejilla.
- Ejecútala en la máquina que tiene los archivos, con prioridad baja (por ejemplo `nice -n 19 ionice -c3` en Linux).

El panel toma, para cada partida, la primera opción disponible: la línea del índice de la carpeta (misma
ruta y tamaño), la caché del navegador (IndexedDB, por nombre, tamaño y hora), el
elemento `summary` del contenedor, o un resumen calculado en un grupo de trabajadores
y guardado en caché. Así, una carpeta sin índice también funciona: la primera vez a
la velocidad de leer las tablas, y después desde la caché.

## El panel {#the-panel}

Elige una carpeta (o archivos; **Añadir carpeta...** añade otra). La ventana tiene los filtros **Juego**, **Mapa**, **Modo**, **Desde** y **Hasta**, una opción **Dividir por**, **Menos vidas** y **Solo jugadores**, y estas pestañas. Cada número sale de los resúmenes, y un clic en una fila, una celda o un hallazgo carga sus partidas en la vista como la superposición de muchas partidas, con los filtros que lo muestran (vehículo, clase, arma, equipo, jugador) y la cámara en el lugar:

| Pestaña | Qué muestra |
|---|---|
| Resumen | partidas, horas, jugadores, vidas, filas, fechas; partidas por día; por juego, mapa, modo; totales de eventos; economía por moneda; cuándo pasan cosas en la partida |
| Equilibrio | por vehículo, clase, arma o equipo, dividido por mapa, modo, nivel o juego: K/D con su intervalo de ~95 %, porcentaje de victorias (Wilson), supervivencia, bajas y aciertos por minuto, ganancias por minuto, y q - la tasa de falsos descubrimientos de Benjamini-Hochberg del K/D y de la victoria frente al resto de la división. **Menos vidas** oculta las filas con muy pocas vidas para fiarse; **Solo jugadores** deja fuera lo que conducía la IA de la misión |
| Tendencias | uso (parte de la presencia), K/D o porcentaje de victorias de los vehículos o clases principales por día, semana o mes |
| Jugadores | jugadores distintos, partidas por jugador, jugadores por partida, los jugadores más frecuentes |
| Bandos | cada bando de cada mapa: partidas ganadas frente a un reparto igual |
| Combate cercano | datos de rondas: duelos de apertura por bando y su conversión, intercambios, quien se asoma frente a quien mantiene, fuegos cruzados, entradas cegadas, puntería, colocaciones de bomba, ventaja numérica y, **Por mapa**, los lugares que matan a los jugadores que entran en ellos - cada uno como una parte con su intervalo de Wilson, a partir de los recuentos `cqb` de los resúmenes ([Combate cercano y rondas](close-quarters.md)) |
| Superficies R6 | las marcas de Rainbow Six Siege en el nivel (impactos de bala y similares) por superficie del nivel: marcas, por ronda del mapa, la sala, la parte cuyo tirador se dedujo; un clic abre los tipos de marca, los operadores y las clases de arma de los tiradores, y en qué parte de la superficie están las marcas (un pequeño mapa de calor de celdas de un cuarto de metro); una superficie conserva su id entre las partidas de una misma versión del mapa. A partir de los recuentos `marks` de los resúmenes |
| Mapa | la rejilla sumada de un mapa: presencia, bajas, muertes, K/D, cualquier evento, flujo, y **activo en cuántas partidas** (estabilidad); por equipo, con la celda a 1, 2, 4 u 8 veces |
| Lugares | sitios que destacan en los números pero no en el mapa de calor (un área grande ocupada en conjunto, pasillos, bandas de altura), y sitios cuyos ocupantes ganan más o menos de sus rondas; **Buscar lugares** |
| Nichos | grupos que van claramente mejor o peor que el resto (un vehículo en un mapa, un sector a una altura), y grupos de rondas ganadas por encima de lo que su bando ganó en las mismas partidas; **Buscar nichos** |
| Hallazgos | los detectores masivos y los detectores de mapa (abajo); **Copiar informe (JSON)** da el JSON que lee un modelo de lenguaje |

## Hallazgos sobre muchas partidas {#insights-over-many-matches}

La pestaña **Lugares** encuentra sitios que destacan en los números pero no en el mapa de calor - un área grande ocupada en conjunto, un pasillo, una banda de altura, un sitio ocupado solo en una parte de la partida - marca como **ocultos** los que el mapa de calor normal no muestra, y los dibuja con borde en la vista 3D; **Cargar** vuela hasta allí con las partidas que contenía. La pestaña **Nichos** encuentra grupos (un vehículo en un mapa y un bando, un sector a una altura) que van claramente mejor o peor que el resto; haz clic en uno para ver sus precisiones.

### Quién ganó {#who-won}

Donde las partidas dicen quién ganó cada ronda (la [columna de resultado](data-formats.md#outcome-columns) `won`), el resultado es un objetivo propio:

- **Lugares: tasa de victoria.** Para cada bando, la parte de sus rondas en un lugar que ganó, frente a la parte que ganó en cualquier sitio de la misma partida - así el equilibrio del mapa, el del bando y el de la propia partida son la referencia, y solo destacan los lugares cuyos ocupantes ganan más (o menos) de sus rondas. Un ejemplo inventado: *«Dust: el bando T gana más de sus rondas cuando está aquí: 61 % de 412 ganadas, frente al 49 % esperado según su propia tasa en las mismas partidas (probabilidades 1,6x; mantenido en 31/48 partidas).»* La misma tasa de falsos descubrimientos y las mismas comprobaciones de estabilidad que cualquier lugar; **Cargar** carga las partidas en que se mantuvo, mostrando las posiciones de ese bando.
- **Nichos: victoria de ronda.** La tabla **Rondas** contiene la ronda de cada vida: el mapa, el bando, la parte de la partida (rondas 1-4, 5-8, ...), el vehículo (un operador, un agente), el arma que más usó, el lugar que mantuvo más tiempo, la compra (eco, force, full) y si su bando hizo la primera baja. Un grupo se juzga frente a lo que su bando ganó en las mismas partidas, así que *T en Dust con un AWP* solo es un nicho cuando esas rondas se ganaron más a menudo que las otras rondas de T en esas partidas. Un ejemplo inventado: *«m1 · T · AWP: gana el 80 % de 320 rondas, frente al 62 % esperado de los mismos bandos en las mismas partidas (probabilidades 2,3x; 40 partidas).»* Ordenados por la mejora por el soporte; **Cargar** carga las partidas cuyas rondas más lo muestran.

Ambos necesitan resúmenes de la versión 2 (ver [Obtener los resúmenes](#getting-the-summaries)): los más antiguos se vuelven a calcular.

La pestaña **Hallazgos** encuentra, sobre todas las partidas, vehículos que intercambian o ganan mejor o peor que el resto, sitios muy activos en una parte estable de las partidas, bandos que ganan más que un reparto igual, vehículos cuyo uso cambia con las fechas, y partes de la partida que concentran más bajas que un reparto uniforme. Cada hallazgo lleva sus recuentos, su efecto, su intervalo y una tasa de falsos descubrimientos (fijada en 5 %), y un clic carga sus partidas. Detalles: [Para desarrolladores](#for-developers).

## Escala {#scale}

Puedes repetir una versión pequeña de esto tú mismo: `node tools/demo-data.mjs` escribe 150 partidas sintéticas de tanques en `tools/.shots/demo/mass` (unas 1.000 filas cada una). Medido con esas 150 partidas sintéticas de demostración de `tools/demo-data.mjs` en un PC de escritorio (una partida real es mucho mayor):

- `tools/3dheat-summarize.mjs` con 4 trabajadores: de 2,6 a 4,8 s para las 150, de 8 a 21 ms por partida dentro de un trabajador; una segunda ejecución que solo lee los resúmenes tarda unos 2 s.
- Abrir la carpeta en el panel, con el índice presente, hasta que aparece la ventana: de 0,9 a 1,6 s (la parte del trabajador, leer las 150 líneas del índice, es de 20 a 40 ms).
- Cambiar a una pestaña, hasta que se dibuja su tabla: Resumen de 10 a 30 ms, Equilibrio de 30 a 70 ms, Tendencias de 30 a 45 ms, Jugadores de 15 a 35 ms, Bandos de 15 a 20 ms, Mapa de 55 a 130 ms.
- El almacén guarda las 150 partidas en unos 0,5 MB.

Abrir la ventana ocupa un solo fotograma corto: los archivos elegidos pasan al trabajador de 16 en 16, y los campos de fecha y la primera pestaña aparecen un fotograma después de la ventana.

El almacén guarda unos 15 KB por partida, así que 10.000 partidas ocupan unos ~150 MB en el trabajador; las rejillas nunca se guardan más tiempo del que pide el mapa.

## Para desarrolladores {#for-developers}

### Hallazgos sobre muchas partidas {#insights-over-many-matches}

`src/mass/detect.ts` - cada hallazgo con sus recuentos, efecto e intervalo,
p y q (Benjamini-Hochberg sobre todo lo que probó el detector, fijado en 5 %),
la exploración que carga sus partidas y una clave de frase con sus valores;
el informe (`heat3d.mass/1`) es lo que `massReportForModel` entrega a un narrador,
con la misma forma que el informe de una sola partida (`insights/seam.ts`).

| Detector | Encuentra |
|---|---|
| `balance` | un vehículo de jugador que intercambia o gana mejor o peor que el resto en un mapa o en un modo |
| `hotspot` | sitios activos en una parte estable de las partidas recibidas (partidas activas / partidas vistas, frente a las demás celdas del mapa) - no solo activos en total |
| `side` | un bando de un mapa que gana más que un reparto igual |
| `meta` | la parte de vidas de jugadores de un vehículo, o su K/D, que se mueve entre la primera y la segunda mitad de las fechas, por mapa - lo bastante grande como para importar, con tendencia a lo largo de los trimestres, del mismo modo en la mayoría de los mapas (abajo) |
| `phase` | una parte de la duración de la partida que concentra más bajas, impactos, lanzamientos... que un reparto uniforme |
| `place` | lugares que destacan en muchas partidas (Etapa B, abajo): la tasa de una región o su parte de bajas frente a la de cada partida, círculos, pasillos, zonas crecidas, bandas de altura, fases; oculto cuando el mapa de calor normal no lo muestra |
| `niche` | grupos que van claramente mejor o peor (Etapa B, abajo) |
| `grid.*` | los detectores de un solo conjunto de datos (posiciones de poder, zonas activas y tranquilas, lugares por clase) sobre las rejillas sumadas de cada mapa: `GridMerge.toInsightJob` rellena las rejillas de la pasada de hallazgos a partir de los resúmenes; los detectores que necesitan trayectorias se saltan |

### El resumen {#the-summary}

JSON simple (`src/mass/types.ts`), de unos 5-30 KB comprimido por partida:

- la partida: juego, mapa, modo, misión, inicio, duración, filas, vidas, jugadores,
  IA, equipos (vidas, jugadores, presencia, bajas, muertes, victoria, dinero), ganador;
- por vehículo y equipo: clase, nivel, vidas, vidas de jugador, presencia, eventos
  por tipo canónico, bajas por clase del objetivo, victorias, dinero;
- por jugador (por id de usuario, o si no por nombre): equipo, vidas, presencia, bajas, muertes,
  impactos, lanzamientos, victorias, vehículos; por arma: eventos por tipo;
- con una columna de resultado (versión 2): rondas ganadas y jugadas por equipo, vehículo
  (`rw`, una vida y una ronda cada uno), jugador y arma (las rondas en que un bando la usó);
  la ronda de cada vida (`outcome.u`: ronda, bando, vehículo, el arma más usada, el lugar
  mantenido más tiempo, la compra, ganada) y el número, el ganador y el bando de la primera
  baja de cada ronda (`outcome.r`);

- las columnas de la economía (`cost_*`, `earn_*`) y sus totales;
- fases: eventos por tipo en 20 franjas de la duración de la partida y por minuto;
- comportamiento: las medidas de comportamiento colectivo de la partida (alineación, manada en ruta, carriles, aglomeración, líderes, rezagados, punto de quiebre, riesgo tras pérdidas, rachas, acuerdo en las compras, supresión), cada una con su propio modelo nulo,
  p y q - ver [Comportamiento colectivo](collective-behaviour.md);
- la rejilla (abajo).

Contado como lo cuenta el visor: columnas halladas como las encuentra el cargador de muchas partidas (`leanSpec`), eventos por `data/canonical.ts`; una baja que un arma de Tacview anota suma al tirador; una muerte dicha dos veces a la vez (`dead`, `death`) cuenta una sola vez.

#### La rejilla: lo que construye la Etapa B {#the-grid-what-stage-b-builds-on}

La parte espacial está hecha para estadísticas de barrido sobre regiones de cualquier tamaño y forma, no solo para imágenes de mapa de calor:

- **Una pirámide.** Las celdas son potencias de dos alineadas en unidades del mundo (x, z como las coloca el visor). El nivel `k` son las celdas sumadas por `ix >> k, iz >> k` - exacto, dentro de una partida y entre partidas de otros tamaños de celda - y cualquier región (una caja, un pasillo a lo largo de una línea, un anillo) es una suma de celdas. El nivel más fino encaja la extensión robusta de la partida (las celdas que contienen el 99 % de la presencia) en 128 celdas; los puntos perdidos fuera de ella se conservan.
- **Exposición junto a cada recuento.** Segundos de presencia por celda, por equipo (`pt`), por clase de vehículo (`pc`) y por banda de altura (`ph`), así que la tasa, la esperanza y el cociente de una región se calculan para cualquier subgrupo.
- **Altura.** Bandas por encima del suelo de la partida (el percentil 1 de la altura): menos de 3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, más de eso; un archivo con una columna `floor`/`storey`/`deck` las agrupa por sus pisos. `y` es la altura media de cada celda, `y0` la más baja (su piso, para la altura por encima de ella).
- **Eventos** como tuplas `[celda, tipo, equipo, clase, banda, recuento]`.
- **Rondas por resultado** (versión 2, con una columna de resultado y dos rondas o
  más): `pw` como `[cell, team, rounds won, rounds lost]` - las rondas en que cada bando
  pasó un segundo o más en la celda, según su resultado en la ronda.
- **Cortes de tiempo** a un nivel grueso (8 celdas por lado), por minuto desde el inicio de la partida: `[cx, cz, minuto, tipo, valor]`, con los segundos de presencia como tipo `GRID_KINDS.length`; las fases de la partida son minutos sobre la duración.
- Dispersa, recuentos enteros, segundos con una décima: acotada por lo que pasó.

### Etapa B: lugares y nichos {#stage-b-places-and-niches}

La Etapa B busca lo que destaca en los números sin llamar la atención: un área grande ocupada en conjunto sin ninguna celda activa dentro, un cociente raro entre bajas y muertes con pocos eventos, un pasillo, una banda de altura, un grupo que solo está en una parte de la partida - y grupos (un vehículo en un mapa, en un bando, un sector a una altura) que van claramente mejor o peor que el resto. Un solo **Buscar lugares** / **Buscar nichos** / **Buscar hallazgos** ejecuta todos los detectores; las tres pestañas comparten el informe.

#### Lugares (`src/mass/scan.ts`) {#places-srcmassscants}

Las partidas de cada mapa se leen dos veces, una partida a la vez; la memoria guarda sumas en una cuadrícula de como máximo 64 celdas por lado (16 para el barrido espacio-tiempo), nunca las partidas.

- **Medidas.** La tasa de un evento por segundo de presencia - bajas, muertes,
  impactos, lanzamientos, capturas, para todas las unidades, por clase (las 4 con más
  eventos), por banda de altura - y la parte de bajas en bajas y muertes (todas,
  por bando, por banda), y la **tasa de victoria** de cada bando: sus rondas en la
  celda ganadas frente a perdidas (`pw`), donde 8 partidas del mapa o más cuentan
  rondas por resultado. Qué clases y bandos cuentan lo deciden las cabeceras (`planOf`).
- **Esperado por partida.** La tasa propia de cada partida repartida sobre su propia presencia en una celda es la esperanza de la celda (un barrido de Kulldorff ajustado por covariables, estratificado por partida): unas pocas partidas sangrientas o un servidor muy ocupado no crean un lugar. Para la tasa de victoria, la esperanza es la parte propia de rondas ganadas del bando en esa partida, así que el equilibrio del mapa y el del bando nunca son un lugar. Una ronda en varias celdas de una región cuenta en cada una; la dispersión medida al tamaño de la región lo recoge.
- **Dispersión.** Las partidas difieren mucho más de lo que dice Poisson. Los residuos de cada partida se suman en bloques de 1, 2, 4, 8, 16 celdas; la dispersión de cada tamaño de bloque (residuos al cuadrado sobre la varianza nula, agrupados, dejando fuera el 5 % peor de los bloques) escala cada prueba de una región de ese tamaño: un cociente de verosimilitud cuasi, Poisson para las tasas, binomial para las partes.
- **Regiones.** Círculos de 0,75 a 18 celdas; elipses en seis ángulos, de 3 y 6 veces su anchura, de 3 a 18 celdas (pasillos; el eje es el `place.path` del hallazgo); zonas que crecen celda a celda a partir de las celdas locales más fuertes de Getis-Ord Gi* mientras crece la z de la región (formas irregulares) - crecidas en una mitad de las partidas y probadas en la otra, así que la libertad de crecer no cuesta falsos lugares; cada banda de altura frente a las demás bandas de la partida en todo el mapa (robusto frente a agrupaciones); cilindros espacio-tiempo: un círculo en uno o dos quintos de la duración de la partida, frente a la dispersión propia de los eventos de la partida en lugar y tiempo (el barrido de permutación espacio-tiempo).
- **Pruebas.** p a partir de la verosimilitud cuasi; Benjamini-Hochberg sobre cada región probada en cada mapa (lo habitual son 700.000 en tres mapas) al 5 %. Lo que pasa se poda (una región que está sobre todo dentro de otra más fuerte de su medida dice lo mismo), se vuelve a leer para su **estabilidad** - partidas que la vieron, partidas en las que estaba activa, su dirección en cinco particiones de las partidas - y se prueba una vez más con la varianza que muestran las propias partidas (robusta frente a agrupaciones, partidas como grupos, nunca bajo Poisson), BH otra vez. Los lugares tranquilos sobre una base (2 % o más de las apariciones, despegues y aterrizajes del mapa) se dejan fuera.
- **Efecto.** El cociente de tasas (o de probabilidades), reducido por el método bayesiano empírico (una prior gamma ajustada a los bloques 2x2 del mapa), con un intervalo de ~95 % a la dispersión; Gi* a 1, 2 y 4 celdas y Moran local en el centro.
- **Lo evidente visualmente.** Cuánto muestra ya la región en el mapa de calor normal de su evento (escala logarítmica hasta la celda más brillante, como la dibujan las vistas): su contraste con un anillo a su alrededor (una décima parte de la paleta cuesta ver, dos quintos es claro) y un pico brillante que lleva el exceso; un cociente nunca lo dibuja el mapa de calor, así que una parte cuenta la mitad. Por debajo del 35 % es **oculto**. El rango: la fuerza (efecto que se satura a 4 veces, los lugares tranquilos a 0,7) por `1 - 0,7 x evidencia` por la concordancia de las particiones.

La pestaña **Lugares** los lista (ocultos solo por defecto; por mapa, forma, dirección); un clic dibuja los lugares del mapa en la vista 3D (`placeLines.ts`: las líneas superiores del motor, construidas una vez - magenta ocultos, ámbar normales, cian tranquilos, el elegido completo; una banda como caja desde su suelo hasta su techo) y en el lienzo de la pestaña Mapa; **Cargar** vuela hasta allí y carga las 60 partidas que más lo contenían, filtradas por su evento (y clase).

#### Nichos (`src/mass/niche.ts`) {#niches-srcmassnichets}

Búsqueda en haz (anchura 24, profundidad 3) sobre tres tablas: **vidas** (vidas de los jugadores: juego, mapa, modo, clase, vehículo, bando, nivel, trimestre de las fechas, tercio de la duración de las partidas; K/D, victoria, muerte por vida, bajas por hora, ganancias por minuto), **lugares** (bajas y muertes por mapa, modo, fechas, sector del mapa 4 x 4, clase, bando, banda) y **fases** (sector y quinto de la partida: K/D, muertes por hora de presencia). Un grupo se prueba frente al conjunto con las partidas como grupos (la varianza sándwich de sus residuos por partida), su efecto es un cociente de probabilidades o de tasas reducido por una prior de 20 resultados; necesita 30 resultados en 8 partidas, un refinamiento debe ser un 10 % más fuerte que su padre, y se dejan fuera los grupos donde el resultado es nada o todo (no registrado para ellos). Se conserva: BH por debajo del 5 % sobre cada grupo evaluado, un cociente reducido de 1,25 (o 1/1,25) como mínimo, cuatro de cinco particiones de acuerdo, y no un refinamiento que solo repita a su padre. La pestaña **Nichos** los lista; un clic muestra cada refinamiento de una condición del grupo (el explorador), **Cargar** carga sus partidas. Los equipamientos aún no están en los resúmenes.

La cuarta tabla, **rondas** (`roundsTable`), tiene como objetivo el resultado de la ronda: una fila por ronda de una vida - mapa, bando, parte de la partida (rondas 1-4, 5-8, ...), vehículo, el arma más usada, el lugar mantenido más tiempo, compra, primera baja o primera muerte - juzgada frente a la tasa de victoria de su propio bando en su propia partida (la esperanza estratificada de Mantel-Haenszel: el residuo es `won - e`, `e` la parte del bando en la partida), así que un nicho nunca es el equilibrio del mapa o del bando. Las partidas siguen siendo los conglomerados. Su z está calibrada: la misma búsqueda en haz se ejecuta ocho veces sobre los resultados barajados entre las rondas de cada bando de cada partida (se conserva la tasa del bando en cada partida), y la dispersión de esas z nulas más allá de una normal estándar - por número de condiciones, desde el centro (mediana / 0,674) y la cola (percentil 99 / 2,576), la mayor, nunca por debajo de 1 - divide las reales antes de su p y la tasa de falsos descubrimientos (un nulo empírico, Efron 2004). Los grupos más profundos reciben la escala mayor: el haz conserva refinamientos de grupos elegidos por su z grande. La base de un nicho es su propia esperanza, su mejora los puntos por encima, y se ordena por la mejora por la raíz cuadrada de sus rondas, sostenido por las pruebas y los pliegues (`wracc` es el soporte por la mejora). Lleva las partidas en que más se mostró (`matchIds`) y algunas de sus rondas (`rounds`, `[match, round]`) para el desglose.

#### Los cambios de tendencia con significado práctico {#meta-shifts-with-practical-significance}

Con fechas mezcladas, la binomial sobre las vidas marcaba casi todo cambio como significativo. `meta` ahora prueba de forma robusta frente a agrupaciones (las vidas de cada partida como grupo), y conserva un cambio de uso solo si es de 2 puntos y al menos un 25 %, un cambio de K/D de 1,3 veces, los trimestres de las fechas con una tendencia en el mismo sentido (tau de Kendall de al menos 0,5) y, para un vehículo en varios mapas, la misma dirección en la mayoría de ellos. Eso deja solo unos pocos cambios en un conjunto de prueba donde la prueba simple marcaba casi todos.

#### Para un modelo {#for-a-model}

`massReportForModel` da a cada lugar su `region` (forma, oculto, evidencia, alturas, fase) y a cada nicho sus `conditions`, además de cuántas regiones y grupos se probaron. El lente de conocimiento puede leer los lugares como zonas de muerte y vías de aproximación: sus tipos son `place.*` y `niche.*`.

#### Comprobaciones {#checks}

`scan.test.ts` planta un área difusa (1,6 veces la tasa de muertes sobre un círculo de 22 celdas, tenue en cada celda), un pasillo, una banda de altura y un grupo solo de fase en 240 partidas sintéticas con dispersión - todos encontrados, el difuso oculto - y ejecuta ocho conjuntos nulos de 60 partidas: ningún lugar. `niche.test.ts` encuentra un grupo plantado de vehículo x mapa x bando y nada en cinco tablas nulas. `outcome.test.ts` comprueba el resumen de la versión 2 (rondas ganadas por bando, unidad, jugador y arma, `pw`, las rondas por unidad); planta un carril cuyo bando gana el 70 % de sus rondas frente al 35 % (cada partida con su propio equilibrio) - encontrado - y ejecuta 20 conjuntos nulos de 50 partidas en que los carriles no dicen nada: ningún lugar de tasa de victoria; planta un AWP en un mapa que hace ganar las rondas de su bando 30 puntos más - encontrado, con sus partidas y rondas - y ejecuta 30 conjuntos nulos de 80 partidas, cada partida con su propio equilibrio y un bando más fuerte en un mapa: ningún nicho.
