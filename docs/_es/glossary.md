---
title: "Glosario"
nav_order: 21
lang: "es"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Glosario

Significados breves de las palabras que usa este sitio, en lenguaje sencillo. Cada entrada enlaza con la página que la explica por completo.

## Datos {#data}

**Fila.** Una línea de tus datos: una cosa que pasó en un lugar y un momento, por ejemplo «el jugador 7 estaba aquí en el segundo 12». El visor dibuja cada fila. [Formatos de datos](data-formats.md)

**Columna.** Un tipo de valor de las filas, como x, y, z, tiempo o equipo. El visor adivina qué columna es cuál, y tú puedes cambiar esa suposición. [Asignación de columnas](column-mapping.md)

**CSV.** Una tabla de texto plano: una fila por línea, con los valores separados por comas. Casi cualquier programa puede escribir una. [Carga de archivos](loading-files.md)

**Parquet.** Un archivo de tabla compacto que se lee rápido, incluso con millones de filas. Es el mejor formato para dárselo al visor. [Carga de archivos](loading-files.md)

**Evento.** Algo que ocurrió, como un disparo, un impacto, una baja o un despegue. Una fila puede ser un evento, o simplemente «yo estaba aquí». [Filtros](filters.md)

**Persona.** Quien generó las filas: un jugador, un piloto, un coche o un tanque. Una persona es una línea de posiciones a lo largo del tiempo. [Sesiones, personas y grupos](sessions-persons-groups.md)

**Grupo (equipo).** Un conjunto de personas que se muestra con el mismo color, por ejemplo Azul y Rojo. [Sesiones, personas y grupos](sessions-persons-groups.md)

**Sesión (partida, ronda).** Una partida del juego. Una partida o una ronda es una sesión. El visor puede mostrar una sesión o superponer muchas. [Sesiones, personas y grupos](sessions-persons-groups.md)

**Nivel.** El mapa 3D donde ocurrieron los datos: suelo, edificios, muros. Las filas aparecen donde ocurrieron, sobre el nivel. [Niveles y geometría de fondo](levels.md)

## Mirar los datos {#looking-at-the-data}

**Mapa de calor.** Una imagen en la que los lugares que tocan muchas filas brillan más. Los lugares fríos están tranquilos; los calientes, muy transitados. [Calor](heat.md)

**Calor.** Cuánto pasó en un punto. El visor suma el brillo de cada fila en cada lugar; la suma es el calor. [Calor](heat.md)

**Sprite.** La pequeña mancha luminosa que dibuja el visor por cada fila. Muchos sprites solapados se suman y forman calor. [Forma del sprite](sprite-shape.md)

**Exposición.** Cuán brillante es la imagen. Como en una cámara, demasiada exposición vuelve todo blanco, y muy poca oculta el detalle. [Color y exposición](colour-and-exposure.md)

**Saturación.** La cantidad de calor que cuenta como «tan caliente como llegan los colores». Bájala para que se vean los lugares tranquilos; súbela para ver solo lo más caliente. [Color y exposición](colour-and-exposure.md)

**Volumen.** Una caja o forma que colocas en la vista 3D. El visor cuenta lo que hay dentro y puede comparar volúmenes entre sí. [Volúmenes y comparación](volumes.md)

**Filtro.** Una regla que oculta las filas que no quieres, por ejemplo «solo bajas» o «solo el equipo Rojo». [Filtros](filters.md)

## Repetición {#replay}

**Figura.** Un pequeño modelo de un tanque, un avión, un coche o un soldado que se mueve donde los datos dicen que estuvo. [Figuras](figures.md)

**LOD (nivel de detalle).** Cada figura tiene una versión detallada, una más simple y una muy simple. Las cercanas usan la detallada y las lejanas la simple, así que se pueden dibujar miles a la vez. [Figuras](figures.md)

## Carreras {#racing}

**Vuelta.** Una vuelta completa al circuito, desde la línea hasta volver a la línea. [Carga de vueltas](race-loading-laps.md)

**Vuelta de referencia.** La vuelta con la que se comparan todas las demás. Las diferencias se muestran como «más rápido» o «más lento» que ella. [Carga de vueltas](race-loading-laps.md)

**Vértice.** El punto de una curva en el que el coche está más cerca del borde interior. [Análisis curva por curva](race-corner-analysis.md)

**Deslizamiento.** Cuánto se desliza un neumático. Un poco de deslizamiento da el máximo agarre; demasiado, y el coche derrapa. [Análisis de carrera: el método](race-analytics.md)

**Envolvente.** Lo que puede hacer un coche a cada velocidad: con cuánta fuerza puede girar, frenar y acelerar antes de deslizarse. [Análisis de carrera: el método](race-analytics.md)

## Cifras de aeronaves {#aircraft-numbers}

**ALT.** Altitud: la altura sobre el suelo o sobre el nivel del mar. [Repetición de partida](match-replay.md#labels-and-statistics)

**TAS.** Velocidad verdadera (true airspeed): a qué velocidad se mueve un avión por el aire. [Repetición de partida](match-replay.md#labels-and-statistics)

## Ordenador {#computer}

**GPU.** La tarjeta o el chip gráfico. Dibuja la imagen y es mucho más rápida que el procesador principal para dibujar millones de manchas. [Los dos backends](backends.md)

**WebGPU / WebGL2.** Las dos formas en que un navegador permite a una página usar la GPU. WebGPU es más reciente. El visor puede usar cualquiera de las dos y elige la mejor que tenga tu navegador. [Los dos backends](backends.md)

## Palabras de Counter-Strike {#counter-strike-words}

**Ronda.** Una pelea corta dentro de una partida. Un bando la gana, y la puntuación sube en uno.

**Eco, compra forzada, compra completa.** Cuánto dinero gasta un bando en armas al inicio de una ronda. Un eco ahorra dinero y compra casi nada (menos de 1.500 $ por jugador de media). Una compra forzada gasta lo que tiene (menos de 4.000 $). Una compra completa lo compra todo lo que puede. [Análisis de partida](match-analysis.md)

**Intercambio.** Una baja que devuelve una baja: te disparan, y un compañero dispara a tu asesino en menos de 5 segundos. [Análisis de partida](match-analysis.md)

**KAST.** La proporción de rondas en las que un jugador consiguió una baja, una asistencia, sobrevivió o fue parte de un intercambio. Un número más alto significa que el jugador ayudó en más rondas. [Análisis de partida](match-analysis.md)

**ADR.** Daño medio por ronda: cuánta salud quitó un jugador a los enemigos en cada ronda. [Análisis de partida](match-analysis.md)
