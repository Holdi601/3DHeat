---
title: "Combate cercano y rondas"
parent: "Hallazgos"
nav_order: 2
lang: "es"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Combate cercano y rondas

En los tiradores por rondas (Counter-Strike primero, cualquier dato con rondas, bandos y bajas), Hallazgos mide cómo se
ganaron los combates: quién se llevó los duelos de apertura y lo que valían, si las muertes se intercambiaron, si el
jugador que se asoma a un ángulo venció al que lo mantiene, si los fuegos cruzados y los destellos dieron resultado, cómo
se movieron las probabilidades de la ronda con cada baja, y qué puertas mataron a los jugadores que entraban por ellas.
Úsalo para ver por qué se ganaron las rondas, no solo quién hizo las bajas.

Las medidas vienen de la doctrina de limpieza de habitaciones y de combate urbano (el embudo mortal, los puntos de
dominio, el fuego cruzado) y de la analítica del deporte y de los deportes electrónicos (probabilidad de ganar, valor de las
acciones, plus-minus ajustado). Cada una se lee a través de la [lente de conocimiento](knowledge.md) y se cita.

## Pruébalo {#try-it}

1. Carga una o más partidas con rondas (una conversión de CS2 tiene todo lo necesario).
2. Abre **Hallazgos** y pulsa **Buscar hallazgos**.
3. En **Métricas de la lente**, lee las líneas desde *Probabilidad de ganar la ronda* hasta *Impacto del jugador*; cada una
   tiene sus números, su intervalo del 95 %, su valor q y las fuentes que sigue.
4. Elige la lente **Esports** o **Urbano** para leerlas a través de esa literatura; **Escribir con IA** las envía con el
   informe.

## Qué mide {#what-it-measures}

| Medida | Qué dice | Cómo |
|---|---|---|
| Probabilidad de ganar la ronda | Cuán probable era que cada bando ganara la ronda en cada momento | Regresión logística sobre los jugadores vivos de cada bando, la bomba o el objetivo y su tiempo, el reloj de la ronda y la compra, ajustada a los datos cargados; calibración comprobada fuera de la muestra por ronda (puntuación de Brier y habilidad, pérdida logarítmica, error de calibración en diez intervalos, pendiente de recalibración, AUC) |
| Valor de las acciones | Cuánto cambió la probabilidad de ganar de un bando una baja, una baja de apertura, un intercambio, una baja tras un destello, una colocación o un destello | Probabilidad de ganar después menos antes; intercambios, aperturas y bajas con destello contrastados con las otras bajas por permutación |
| Duelos de apertura | Qué bando gana el primer duelo, con qué frecuencia eso gana la ronda, y dónde un bando gana aperturas muy por encima de su promedio | Intervalos de Wilson; lugares por prueba binomial exacta frente a la proporción del bando, q sobre los lugares |
| Intercambios | Muertes respondidas por una baja de un compañero al asesino en 5 s, el tiempo que tardó, y rondas ganadas cuando la primera muerte se intercambió | Prueba exacta de Fisher, intervalo de Newcombe |
| Quien se asoma frente a quien mantiene | Duelos en los que un jugador entró en el combate (1,5 m/s o más en el último segundo) y el otro se quedó quieto (0,75 m/s o menos): la proporción del que se asomó | Prueba binomial exacta frente a una mitad |
| Puntería antes del duelo | La vista de cada jugador frente al rumbo hacia el otro 0,75 s antes de la baja; quién apuntaba mejor y con qué frecuencia ganó ese jugador; los que mantienen su ángulo (dentro de 15°) frente a los que no; alcances de las bajas | Prueba binomial exacta; Fisher |
| Fuego cruzado | Los que mantienen con un compañero quieto a 25 m del que se asoma cuya línea hacia él se aparta 35° o más de la suya, frente a los que mantienen solos | Fisher, Newcombe |
| Utilidad en las entradas | Los que se asoman tras un destello de su propio bando (dentro de 3 s y 15 m) o un humo (dentro de 18 s) frente a los asomos sin ayuda; duelos de apertura con un destello en un solo lado; víctimas cegadas | Fisher, binomial |
| Ventaja numérica | Para cada estado de jugadores vivos (5v4, 4v5, 2v1...) alcanzado por primera vez en una ronda, la proporción de rondas ganadas desde él | Intervalos de Wilson |
| Remontadas | Rondas en que un bando quedó con su último jugador: victorias frente a las victorias esperadas por el modelo, por número de rivales | Prueba normal de lo observado frente a lo esperado |
| Apilados, rotaciones, acechos | El grupo más grande a 10 m en el duelo de apertura (3 o más: apilados); jugadores a más de 30 m del primer combate o del objetivo colocado y lo deprisa que llegan a 12 m; tiempo y probabilidad baja-muerte a más de 30 m de cada compañero | Fisher; razón de probabilidades con el intervalo de Woolf |
| Después de la colocación y la recuperación | Rondas ganadas por el bando que colocó, según los números en la colocación, y su proporción de duelos tras la colocación | Intervalos de Wilson |
| Embudos mortales | Entradas a cada lugar (un cambio en la columna de lugar, si no, en una celda de 8 m) y muertes dentro de 2,5 s tras entrar, frente a la tasa del mapa | Prueba binomial exacta, q sobre los lugares; razón contraída con 20 entradas a la tasa del mapa |
| Impacto del jugador | Probabilidad de ganar añadida por ronda por cada jugador (bajas, muertes, colocaciones), contraída por Bayes empírico; plus-minus ajustado por cresta de los resultados de ronda frente al inicio del modelo; valor de baja por lugar y arma, contraído | Penalización elegida por validación cruzada de cinco pliegues |

Todas las pruebas de un análisis comparten una misma tasa de falsos descubrimientos (Benjamini-Hochberg), contando todos
los lugares probados, no solo los mostrados; el q mostrado es sobre todos ellos. El modelo y su calibración se ajustan a los
datos cargados, así que describen esa población: un modelo profesional juzga mal el juego casual, y al revés.

Se comprobó con rondas sintéticas con efectos plantados (la ventaja de quien se asoma, fuegos cruzados, destellos, un embudo
mortal, la buena puntería que gana), y con 100 conjuntos de datos de las mismas rondas sin ellos, donde la tasa de falsos
descubrimientos de las pruebas de efectos plantados debe quedarse en el 5 % nominal (dentro de una banda)
(`src/insights/cqb/cqb.test.ts`); en unas mil rondas reales el modelo obtuvo una puntuación de Brier de 0,14 frente a 0,25 de la
tasa base, un error de calibración de 0,03 y una pendiente de recalibración de 1,0.

## Datos que necesita {#data-it-needs}

- Las columnas **tiempo**, **jugador**, **bando** y **ronda** (la sesión), y las bajas y muertes en la columna de eventos; las
  rondas en las que nadie muere dos veces se tratan como rondas de eliminación (la ventaja numérica, las remontadas y el modelo
  las necesitan);
- una columna de **otra parte** (`other`, `victim`, `killer`, `attacker`) que nombre a la víctima en una baja y al asesino en una
  muerte (sin ella, las bajas y muertes en el mismo instante se emparejan);
- una **dirección de mirada** para las medidas de puntería;
- una columna de `event` sin procesar que nombre `flash`, `smoke`, `he`, `molotov`, `plant` y `defuse` para la utilidad y las
  colocaciones;
- `won` (el bando de la fila ganó la ronda), `place` (avisos de posición), `weapon`, `buy` y `state_flashed` cuando los datos los tienen.

Las posiciones deberían muestrearse varias veces por segundo; las velocidades, la puntería y los fuegos cruzados leen los dos
últimos segundos antes de cada muerte.

## En el desglose {#in-the-breakdown}

El [desglose](breakdown.md) mide cuatro de las situaciones como factores, con y sin: *cegado*, *muerte intercambiada*, *duelo de
apertura* y los números (*ventaja numérica*, *números iguales*, *desventaja numérica*), cada uno sobre K/D, rondas ganadas,
supervivencia y bajas por minuto.

## Muchas partidas {#many-matches}

Cada resumen de partida del [análisis de muchas partidas](mass-analysis.md) de datos con una columna de ronda lleva las mismas
medidas como recuentos (`cqb` en el resumen): duelos de apertura, intercambios, asomadas, fuegos cruzados, entradas con destello,
puntería, ventaja numérica, colocaciones y los 40 lugares más frecuentados con sus entradas y muertes. Los recuentos se suman
entre partidas, así que mil partidas dan las mismas proporciones que un análisis grande. La pestaña **Combate cercano** del panel
las muestra como proporciones con sus intervalos, en todos los mapas o por mapa; un clic en una fila carga las partidas de las que
venía.

## Para desarrolladores {#for-developers}

`src/insights/cqb/`: `walk.ts` (una pasada sobre las filas en orden temporal, rondas separadas, duelos registrados con su estado),
`finish.ts` (las medidas y los recuentos por partida), `model.ts` (regresión logística por IRLS, calibración, regresión de cresta por
gradientes conjugados, Bayes empírico, Fisher, Newcombe, pruebas de permutación), `run.ts` y `worker.ts` (el visor: su propio worker,
junto a la pasada de hallazgos), `summary.ts` (el colector del resumen de muchas partidas), `factors.ts` (las situaciones del
desglose), `shows.ts` (lo que lee la lente), `synth.ts` (las rondas de prueba). Las entradas de conocimiento están en
`src/insights/knowledge/cqb.ts`, los patrones en `patterns-cqb.ts`. Los resultados entran en el informe como `lens.cqb`.
