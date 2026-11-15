---
title: "Otros juegos de carreras"
parent: "Análisis de carrera"
nav_order: 59
lang: "es"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Otros juegos de carreras en el visor

El visor lee vueltas de muchos juegos de carreras, no solo de uno. Esta página los enumera y explica cómo sacar una vuelta de cada uno.

## Los juegos {#the-games}

| Juego | Grabador | ¿Deslizamiento en el archivo? | ¿Mundo reflejado? | Notas |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out por UDP), o los archivos de vuelta de FH Companion más sus `.tele.gz` | sí, por rueda (normalizado) | sí (mundo zurdo) | el `.tele.gz` junto a cada archivo de vuelta de FH Companion da el deslizamiento de cada rueda; el archivo de vuelta por sí solo no lo da |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (memoria compartida) | sí, por rueda | medido en las vueltas | también la intervención del ABS y del control de tracción, las cargas de las ruedas y las temperaturas |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | no, se calcula a partir de la velocidad de las ruedas | medido en las vueltas | rally: el terreno suelto y los saltos se juzgan de otra manera |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | no | medido en las vueltas | sin velocidades de rueda |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (un mod) | no, se calcula a partir de la velocidad de las ruedas | medido en las vueltas | |
| Trackmania | el plugin de Openplanet, `telemetry --game trackmania --install` | un coeficiente de deslizamiento por rueda | medido en las vueltas | física arcade: los derrapes se juzgan de otra manera |
| iRacing | ninguno: su propio archivo `.ibt` | no (no se registra); se calcula a partir de la guiñada | no (basado en GPS) | active el registro en el coche con Alt+L |

## Cómo grabar una vuelta {#how-to-record-a-lap}

1. Elija su juego en la tabla y configúrelo como indica la página del grabador para ese juego (un ajuste del juego, un mod, o nada en el caso de iRacing). Los pasos cambian según el juego, así que están en los documentos de los grabadores: [GameCapture: juegos](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Inicie el grabador y conduzca. Escribe un archivo por vuelta.
3. En la pestaña **Análisis de carrera**, pulse **Cargar archivos de vuelta…** y elija dos o más vueltas del mismo circuito (vea [Cargar vueltas](race-loading-laps.md)).

En los juegos de rally, el grabador entrega un archivo por cada pasada por un tramo. En Forza, lo más fácil es empezar con la biblioteca de FH Companion y sus archivos `.tele.gz` junto a los archivos de vuelta.

## Lo que documentan los grabadores {#what-the-recorders-document}

Cómo se graba cada juego, qué envía, las fuentes de sus formatos y qué circuitos se pueden exportar de sus archivos es tarea de los grabadores documentarlo: [GameCapture: juegos](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (público, en [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). El archivo de vuelta que escribe cada grabador se describe en [GameCapture: el formato de vuelta](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Lo que hace el visor con ellos {#what-the-viewer-does-with-them}

Cada juego acaba en archivos `heat3d-lap` (o en un CSV de vueltas, o se lee directamente, como el `.ibt` de iRacing), con los nombres de canal canónicos de `src/race/schema.ts` y un bloque `meta` que indica qué significan sus números: cómo se escala su deslizamiento, si es circuito, rally o arcade, y la superficie cuando se conoce. Así la pestaña **Análisis de carrera** los trata a todos por igual. Cuando no hay un modelo de circuito cargado, la pestaña **Análisis de carrera** dibuja una carretera a partir de la dispersión de las propias vueltas, así que todos los juegos se pueden usar sin modelo.

Lo que ningún juego de rally envía —el deslizamiento de los neumáticos— lo calcula el visor: a partir del parche de contacto de cada rueda, o de su velocidad de superficie frente a la velocidad del coche, donde un juego envía una (`(rueda - coche) / coche`); o a partir de su rotación y de un radio de rodadura medido en la propia vuelta, donde solo envía la rotación. El ángulo de deriva sale de la velocidad propia del coche (Forza, los juegos AC, Trackmania, RBR), de la velocidad del mundo proyectada sobre los ejes del coche (EA WRC, DiRT, BeamNG), o del rumbo frente a la trayectoria. Si el coche está en el aire, se deduce del contacto, las cargas o la suspensión de sus ruedas. Véase `src/race/derive.ts`.

Cuando el mundo de un juego es zurdo (el de Forza lo es), el circuito sale reflejado en el visor. Las propias vueltas (la dirección y la suspensión) lo delatan, y la pestaña **Análisis de carrera** ofrece invertir un eje. Los juegos cuya lateralidad no está documentada (RBR, BeamNG, Trackmania) se tratan igual: se mide, no se supone.

Más allá de los canales de conducción, los grabadores guardan lo que añade cada juego: en los juegos AC, la intervención del ABS y del control de tracción, el reparto de frenada, el DRS, el limitador de boxes, la sobrealimentación y la vida de las pastillas y los discos de freno; en iRacing, los ajustes de ayudas, el reparto de frenada, el combustible, las temperaturas de aceite y de agua, y cada otro canal que registra con su propio nombre. El visor los dibuja desde su tabla de canales (indicadores luminosos, niveles, símbolos, gráficos), así que grabar más no requiere ningún cambio en el visor.
