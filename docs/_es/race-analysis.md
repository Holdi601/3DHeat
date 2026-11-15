---
title: "Análisis de carrera"
nav_order: 14
has_children: true
lang: "es"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# Análisis de carrera

Recorriste el mismo circuito dos veces. La pestaña **Análisis de carrera** reproduce las dos vueltas juntas en 3D, muestra dónde una vuelta fue más lenta y te dice por qué. ¿Aún no tienes vueltas? Pulsa **Vueltas de demostración**.

![La pestaña Análisis de carrera con vueltas de demostración: la barra lateral con Vueltas y Dónde mejorar, los coches en el circuito, los gráficos debajo de la vista](../assets/img/en/race-analysis-overview.webp)

La pestaña compara dos o más vueltas de un mismo circuito. Comparte el lienzo, la cámara y el modelo del circuito cargado (**Fondo / nivel**) con el mapa de calor; todo lo demás es propio: su propia barra lateral y su propia barra debajo de la vista. Palabras como *vuelta*, *referencia* y *ápice* están en el [glosario](glossary.md).

Esta página es el mapa de la pestaña. Cada parte tiene su propia página:

| Página | Qué cubre |
|---|---|
| [Cargar vueltas](race-loading-laps.md) | cada formato de archivo, carpetas y circuitos, nombres de coches, vueltas de demostración, la lista de vueltas, referencia y enfoque |
| [Repetición y escena 3D](race-replay-and-scene.md) | la barra de transporte, los tres modos de repetición, alinear coches, la cámara de persecución, líneas, mapas, coches, etiquetas, mundos espejados |
| [Gráficos y HUD](race-charts-and-hud.md) | los gráficos de distancia, el selector de gráficos, el cursor y el zoom, las tarjetas de coche, la tabla de canales |
| [Eventos de control del coche](race-control-events.md) | bloqueos, patinaje de ruedas, sobreviraje, trompos, subviraje, impactos, choques, ABS/TC, freno de mano, aire: cómo se detecta cada uno, con cada umbral |
| [Análisis curva a curva](race-corner-analysis.md) | alineación por distancia, curvas y tramos, la cuenta de tiempo de una curva, cada causa y el orden en que se prueban, la forma de la trazada y el consejo |
| [Perfiles de coche y comparación](race-car-profiles.md) | lo que puede hacer cada coche, medido en sus vueltas; *Coches comparados*; lo que decide el coche en cada curva |
| [Estadísticas del circuito](race-course-statistics.md) | muchas vueltas de un mismo circuito: errores por curva y por tipo, el mapa de errores, la exportación del mapa de calor, límites de rendimiento |
| [Análisis de carreras: el método](race-analytics.md) | la investigación detrás de las reglas, con fuentes |
| [Otros juegos de carreras](other-games.md) | qué hace el visor con las vueltas de cada juego: deslizamiento y derrape deducidos donde un juego no los envía, mundos espejados, los canales extra |

## La pantalla {#the-screen}

**Barra lateral**, de arriba abajo (las secciones pueden plegarse):

1. **Vueltas** - cargar, listar, mostrar/ocultar, referencia, enfoque, persecución.
   Véase [Cargar vueltas](race-loading-laps.md).
2. **Estadísticas del circuito** - solo desde tres vueltas cargadas.
   Véase [Estadísticas del circuito](race-course-statistics.md).
3. **Dónde mejorar** - los hallazgos de la vuelta enfocada, curva a curva.
   Véase [Análisis curva a curva](race-corner-analysis.md).
4. **Curva a curva** (o *Curva a curva - clase X* con varias clases) - la vuelta más rápida por cada curva y su trazada. Se muestra con dos o más vueltas.
5. **Control del coche** - los bloqueos, derrapes, empujones e impactos de la vuelta enfocada.
   Véase [Eventos de control del coche](race-control-events.md).
6. **Coches comparados** (o **El coche** con un solo coche) - véase [Perfiles de coche y comparación](race-car-profiles.md).
7. **Vista** - qué mapa se pinta sobre el circuito y qué se dibuja.
   Véase [Repetición y escena 3D](race-replay-and-scene.md).
8. Los paneles compartidos **Nivel** y **Cámara y escena** (modelo del circuito, inversión de ejes, cámara) - documentados con el mapa de calor y en [Cámara](camera.md).

**La vista** muestra el circuito, las trazadas recorridas, el mapa, los coches, las etiquetas fijadas al circuito, y hasta seis tarjetas de coche arriba a la izquierda (véase [Gráficos y HUD](race-charts-and-hud.md)). Sin vueltas cargadas dice: «No hay vueltas cargadas - Suelta aquí dos o más archivos de vuelta, o carga las vueltas de demostración desde la barra lateral.»

**La barra debajo de la vista** contiene el transporte de la repetición y, salvo que se oculten, los gráficos de distancia.

## Inicio rápido {#quick-start}

1. Abre la pestaña **Análisis de carrera** (junto a **Mapa de calor** en la parte superior de la barra lateral).
2. Carga vueltas. Pulsa **Vueltas de demostración** para ver lo que hace la pestaña con tres vueltas ficticias. Para tus propias vueltas, grábalas antes ([formatos de archivo y grabadoras](race-loading-laps.md#file-formats)), y después pulsa **Cargar archivos de vuelta…** o **Carpeta…**, o suelta archivos o carpetas sobre la vista.
3. La vuelta completa más rápida se convierte en la referencia; la vuelta más lenta de las demás queda enfocada. Pulsa cualquier vuelta de la lista para enfocarla; ★ convierte una vuelta en referencia.
4. Lee **Dónde mejorar**. Pulsa un hallazgo: los coches se alinean 40 m antes, la cámara lo encuadra, la repetición lo recorre y se abren las medidas.
5. Pasa el ratón sobre los gráficos para llevar cada coche a ese metro; Shift + clic para alinearlos allí.

## Teclado {#keyboard}

Mientras la pestaña de carrera está abierta:

| Tecla | Hace |
|---|---|
| **K** | reproducir / pausar la repetición |
| **Home** | volver al inicio de la repetición |
| teclas numéricas | nada (en el mapa de calor cambian de modo) |

Las teclas escritas en un campo de texto o en un desplegable se ignoran. Las teclas de cámara funcionan como en el mapa de calor (**W A S D**, **Space** arriba, **Q** abajo, **Shift** más rápido, **Alt** más lento, ratón para mirar; todo en [Cámara](camera.md)); **F** encuadra las vueltas cargadas (como hace al cargar vueltas).

## Muchas vueltas {#many-laps}

- Todas las vueltas cargadas se analizan y cuentan; decenas tardan uno o dos segundos.
- Más allá de **8** vueltas (`SHOW_ALL_UP_TO`), las vueltas añadidas solo se dibujan cuando son la referencia, la vuelta enfocada, o la mejor vuelta de la clase de la vuelta enfocada. *Mostrar todas* / *Solo las que se miran* alternan.
- Más allá de **10** coches visibles (`PLAIN_PAST`), las vueltas que no se miran (ni el foco, ni el coche perseguido, ni la referencia) se dibujan con líneas adelgazadas a un punto cada 6 m en lugar de cada 1,5 m, y con coches sencillos.
- Los gráficos dibujan como máximo **8** vueltas; el HUD muestra como máximo **6** tarjetas.
- Las estadísticas del circuito aparecen desde **3** vueltas.

Detalles: [Estadísticas del circuito](race-course-statistics.md#performance-with-many-laps).

## Ajustes de vista por defecto {#default-view-settings}

| Ajuste | Por defecto |
|---|---|
| Mapa | Mapa de tiempo |
| Trazadas recorridas, Coches, Neumáticos y suspensión, Etiquetas, Circuito de las vueltas | activado |
| Todos los valores en las tarjetas | desactivado |
| Tamaño del coche | 1× |
| Gráficos | visibles |
| Modo de repetición | Desde la línea |
| Velocidad de repetición | 1× |
| Bucle | activado |

Nada de esto se guarda; al recargar se empieza con los valores por defecto. Lo que se recuerda en el navegador: el idioma, y los nombres de coche aprendidos de los archivos de vuelta (véase [Cargar vueltas](race-loading-laps.md#car-names)).

## Para desarrolladores {#for-developers}

### What happens when laps are loaded {#what-happens-when-laps-are-loaded}

Every time the set of laps, the reference or the language changes, the whole
analysis is redone (`analyse` in
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Derived channels are added to each lap where the game does not send them:
   drift angle, wheel slip from wheel speeds, in the air, loose ground, yaw
   rate ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. The reference is chosen and every lap is projected onto its path and
   resampled every 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Whether the game's world is mirrored is worked out from the laps
   ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Corners are found on the reference, and grouped into segments from one
   braking zone to the next ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Per car: its envelope (grip, braking, pull per speed), its profile, its
   tyre curves ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Per lap and segment: what it did (brake point, slowest point, full
   throttle, ...) and the line it drove ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Per lap: its car-control events, each laid against the lap it is compared
   with there.
8. Per lap and segment: the time account against its comparison lap and the
   finding in words.
9. The time map and the cause map per lap.

The texts are produced in the current language; switching language runs the
analysis again (and renames the demo laps). A failure in the analysis is
shown under the **Laps** buttons as an error and the laps stay loaded.

### Source files {#source-files}

| File | Role |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | reading lap files |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | the lap type, naming, demo laps |
| `src/race/derive.ts`, `handedness.ts` | derived channels, mirrored worlds |
| `src/race/align.ts`, `segments.ts`, `line.ts` | distance axis, corners, lines |
| `src/race/analysis.ts` | corners compared, causes, findings |
| `src/race/envelope.ts`, `profile.ts` | what a car can do |
| `src/race/control.ts`, `impacts.ts` | car control, hits and crashes |
| `src/race/stats.ts` | many laps |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | replay and drawing |
| `src/race/schema.ts`, `graphs.ts` | the channel table, the charts' rows |
| `src/ui/race/*` | the sidebar, the charts, the HUD, the labels |
| `src/state/raceStore.ts` | the tab's state and the replay clock |
