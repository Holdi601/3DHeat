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

![La pestaña Análisis de carrera con vueltas de demostración: la barra lateral con Vueltas y Dónde mejorar, los coches en el circuito, los gráficos debajo de la vista](../assets/img/es/race-analysis-overview.webp)

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
| [Estadísticas del recorrido](race-course-statistics.md) | muchas vueltas de un mismo circuito: errores por curva y por tipo, el mapa de errores, la exportación del mapa de calor, límites de rendimiento |
| [Análisis de carreras: el método](race-analytics.md) | la investigación detrás de las reglas, con fuentes |
| [Otros juegos de carreras](other-games.md) | qué hace el visor con las vueltas de cada juego: deslizamiento y derrape deducidos donde un juego no los envía, mundos espejados, los canales extra |

## La pantalla {#the-screen}

**Barra lateral**, de arriba abajo (las secciones pueden plegarse):

1. **Vueltas** - cargar, listar, mostrar/ocultar, referencia, enfoque, persecución.
   Véase [Cargar vueltas](race-loading-laps.md).
2. **Estadísticas del recorrido** - solo desde tres vueltas cargadas.
   Véase [Estadísticas del recorrido](race-course-statistics.md).
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

Las teclas escritas en un campo de texto o en un desplegable se ignoran. Las teclas de cámara funcionan como en el mapa de calor (**W A S D**, **Espacio** arriba, **Q** abajo, **Shift** más rápido, **Alt** más lento, ratón para mirar; todo en [Cámara](camera.md)); **F** encuadra las vueltas cargadas (como hace al cargar vueltas).

## Muchas vueltas {#many-laps}

- Todas las vueltas cargadas se analizan y cuentan; decenas tardan uno o dos segundos.
- Más allá de **8** vueltas (`SHOW_ALL_UP_TO`), las vueltas añadidas solo se dibujan cuando son la referencia, la vuelta enfocada, o la mejor vuelta de la clase de la vuelta enfocada. *Mostrar todas* / *Solo las que se miran* alternan.
- Más allá de **10** coches visibles (`PLAIN_PAST`), las vueltas que no se miran (ni el foco, ni el coche perseguido, ni la referencia) se dibujan con líneas adelgazadas a un punto cada 6 m en lugar de cada 1,5 m, y con coches sencillos.
- Los gráficos dibujan como máximo **8** vueltas; el HUD muestra como máximo **6** tarjetas.
- Las estadísticas del recorrido aparecen desde **3** vueltas.

Detalles: [Estadísticas del recorrido](race-course-statistics.md#performance-with-many-laps).

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

### Qué ocurre al cargar vueltas {#what-happens-when-laps-are-loaded}

Cada vez que cambian el conjunto de vueltas, la referencia o el idioma, todo el análisis se rehace (`analyse` en [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. A cada vuelta se añaden canales derivados allí donde el juego no los envía: ángulo de deriva, deslizamiento de rueda a partir de la velocidad de las ruedas, en el aire, terreno suelto y velocidad de guiñada ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Se elige la referencia, y cada vuelta se proyecta sobre su trazado y se remuestrea cada 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Se deduce a partir de las vueltas si el mundo del juego está espejado ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Las curvas se encuentran en la referencia y se agrupan en tramos, desde una zona de frenada hasta la siguiente ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Por coche: su envolvente (agarre, frenada y empuje por velocidad), su perfil y sus curvas de neumáticos ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts), [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts), [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Por vuelta y tramo: lo que hizo (punto de frenada, punto más lento, acelerador a fondo, ...) y la trazada que siguió ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Por vuelta: sus eventos de control del coche, cada uno puesto frente a la vuelta con la que se compara allí.
8. Por vuelta y tramo: la cuenta de tiempo frente a su vuelta de comparación, y el hallazgo en palabras.
9. El mapa de tiempo y el mapa de causas de cada vuelta.

Los textos se producen en el idioma actual; cambiar de idioma vuelve a ejecutar el análisis (y renombra las vueltas de demostración). Un fallo del análisis se muestra debajo de los botones **Vueltas** como error, y las vueltas siguen cargadas.

### Archivos de código {#source-files}

| Archivo | Función |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | lectura de archivos de vuelta |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | el tipo de vuelta, los nombres, las vueltas de demostración |
| `src/race/derive.ts`, `handedness.ts` | canales derivados, mundos espejados |
| `src/race/align.ts`, `segments.ts`, `line.ts` | eje de distancia, curvas, trazadas |
| `src/race/analysis.ts` | curvas comparadas, causas, hallazgos |
| `src/race/envelope.ts`, `profile.ts` | lo que puede hacer un coche |
| `src/race/control.ts`, `impacts.ts` | control del coche, impactos y choques |
| `src/race/stats.ts` | muchas vueltas |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | repetición y dibujo |
| `src/race/schema.ts`, `graphs.ts` | la tabla de canales, las filas de los gráficos |
| `src/ui/race/*` | la barra lateral, los gráficos, el HUD, las etiquetas |
| `src/state/raceStore.ts` | el estado de la pestaña y el reloj de la repetición |
