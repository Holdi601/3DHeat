---
title: "Glosario"
nav_order: 21
lang: "es"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: true
---

# Glosario

Significados breves de las palabras que usa este sitio, en lenguaje sencillo. Cada entrada enlaza con la página que la explica en detalle.

## Datos {#data}

**Fila.** Una línea de tus datos: una cosa que pasó en un lugar y un momento, por ejemplo «el jugador 7 estuvo aquí en el segundo 12». El visor dibuja cada fila. [Formatos de datos](data-formats.md)

**Columna.** Un tipo de valor en las filas, como x, y, z, tiempo o equipo. El visor adivina qué columna es cada una, y puedes cambiar la suposición. [Asignación de columnas](column-mapping.md)

**CSV.** Una tabla de texto plano: una fila por línea, valores separados por comas. Casi cualquier programa puede escribir una. [Cargar archivos](loading-files.md)

**Parquet.** Un archivo de tabla compacto que se lee rápido, incluso con millones de filas. Es el mejor formato para dárselo al visor. [Cargar archivos](loading-files.md)

**Evento.** Algo que ocurrió, como un disparo, un impacto, una baja o un despegue. Una fila puede ser un evento, o solo «estuve aquí». [Filtros](filters.md)

**Persona.** Quien generó las filas: un jugador, un piloto, un coche o un tanque. Una persona es una línea de posiciones a lo largo del tiempo. [Sesiones, personas y grupos](sessions-persons-groups.md)

**Grupo (equipo).** Un conjunto de personas mostrado en el mismo color, por ejemplo Blue y Red. [Sesiones, personas y grupos](sessions-persons-groups.md)

**Sesión (partida, ronda).** Una ejecución del juego. Una partida o una ronda es una sesión. El visor puede mostrar una sesión o superponer muchas. [Sesiones, personas y grupos](sessions-persons-groups.md)

**Nivel.** El mapa 3D donde ocurrieron los datos: suelo, edificios, muros. Las filas aparecen donde ocurrieron sobre el nivel. [Niveles y geometría de fondo](levels.md)

## Mirar los datos {#looking-at-the-data}

**Mapa de calor.** Una imagen donde los lugares que tocan muchas filas brillan más. Los lugares fríos están tranquilos, los calientes están muy activos. [Calor](heat.md)

**Calor.** Cuánto ocurrió en un punto. El visor suma el brillo de cada fila en cada lugar; la suma es el calor. [Calor](heat.md)

**Sprite.** La pequeña mancha luminosa que el visor dibuja por cada fila. Muchos sprites solapados suman calor. [Forma del sprite](sprite-shape.md)

**Exposición.** Cuán brillante es la imagen. Como en una cámara, demasiada exposición lo vuelve todo blanco, y muy poca oculta el detalle. [Color y exposición](colour-and-exposure.md)

**Saturación.** La cantidad de calor que cuenta como «tan caliente como llegan los colores». Bájala para que se vean los lugares tranquilos; súbela para ver solo lo más caliente. [Color y exposición](colour-and-exposure.md)

**Volumen.** Una caja o forma que colocas en la vista 3D. El visor cuenta lo que hay dentro y puede comparar volúmenes entre sí. [Volúmenes y comparación](volumes.md)

**Filtro.** Una regla que oculta las filas que no quieres, por ejemplo «solo bajas» o «solo el equipo Red». [Filtros](filters.md)

## Repetición {#replay}

**Figura.** Un pequeño modelo de un tanque, avión, coche o soldado que se mueve donde dicen los datos que estuvo. [Figuras](figures.md)

**LOD (nivel de detalle).** Cada figura tiene una versión detallada, otra más sencilla y otra muy simple. Las cercanas usan la detallada y las lejanas la simple, así que se pueden dibujar miles a la vez. [Figuras](figures.md)

## Carreras {#racing}

**Vuelta.** Un recorrido completo del circuito, desde la línea de salida hasta la misma línea. [Cargar vueltas](race-loading-laps.md)

**Vuelta de referencia.** La vuelta con la que se comparan todas las demás. Las diferencias se muestran como «más rápido» o «más lento» que ella. [Cargar vueltas](race-loading-laps.md)

**Ápice.** El punto de una curva en el que el coche está más cerca del borde interior. [Análisis curva a curva](race-corner-analysis.md)

**Deslizamiento.** Cuánto desliza un neumático. Un poco de deslizamiento da el máximo agarre; demasiado y el coche derrapa. [Análisis de carreras: el método](race-analytics.md)

**Envolvente.** Lo que puede hacer un coche a cada velocidad: con qué fuerza puede girar, frenar y acelerar antes de deslizarse. [Análisis de carreras: el método](race-analytics.md)

## Números de aeronaves {#aircraft-numbers}

**ALT.** Altitud: la altura sobre el suelo o el nivel del mar. [Repetición de partida](match-replay.md#labels-and-statistics)

**TAS.** Velocidad verdadera del aire: a qué velocidad se mueve un avión por el aire. [Repetición de partida](match-replay.md#labels-and-statistics)

## Equipo informático {#computer}

**GPU.** La tarjeta o el chip gráfico. Dibuja la imagen y es mucho más rápida que el procesador principal para dibujar millones de manchas. [Los dos motores](backends.md)

**WebGPU / WebGL2.** Las dos formas en que un navegador deja a una página usar la GPU. WebGPU es más nueva. El visor puede usar cualquiera y elige la mejor que tenga tu navegador. [Los dos motores](backends.md)

## Palabras de Counter-Strike {#counter-strike-words}

**Ronda.** Una pelea corta dentro de una partida. Un bando la gana, y el marcador sube en uno.

**Eco, compra forzada, compra completa.** Cuánto dinero gasta un bando en armas al empezar una ronda. Un eco ahorra dinero y compra casi nada (menos de 1.500 $ por jugador de media). Una compra forzada gasta lo que tiene (menos de 4.000 $). Una compra completa compra todo lo que puede. [Análisis de partida](match-analysis.md)

**Intercambio.** Una baja que devuelve otra baja: te disparan, y un compañero de equipo dispara a tu asesino en 5 segundos. [Análisis de partida](match-analysis.md)

**KAST.** La proporción de rondas en las que un jugador consiguió una baja, una asistencia, sobrevivió o fue intercambiado. Un número más alto significa que el jugador ayudó en más rondas. [Análisis de partida](match-analysis.md)

**ADR.** Daño medio por ronda: cuánta salud le quitó un jugador a los enemigos en cada ronda. [Análisis de partida](match-analysis.md)
