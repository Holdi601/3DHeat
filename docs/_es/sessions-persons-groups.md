---
title: "Sesiones, personas y grupos"
parent: "Cargar datos"
nav_order: 4
lang: "es"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sesiones, personas y grupos

Una **persona** es una cosa que se mueve (un jugador, un coche). Un **equipo/grupo** es el
bando al que pertenecen. Una **sesión** es una partida o una vuelta. Véase el [glosario](glossary.md).

Una fila de un archivo puede nombrar las tres:

| x | y | tiempo | jugador | equipo | partida |
|---|---|---|---|---|---|
| 10,5 | -30,2 | 12,0 | Blue 1 | Blue | Partida 01 |

`jugador` es la persona, `equipo` es el grupo, `partida` es la sesión.

Tres columnas opcionales describen *quién* y *en qué parte de la historia* pertenece una fila. Cada una
se codifica como diccionario al cargar: los valores de texto pasan a ser pequeños ids enteros por fila
más una sola lista de etiquetas, compartida por todos los archivos de la carga.

## Persona {#person}

La columna **Id. de persona** indica a qué cosa que se mueve pertenece una fila: un jugador, un bot, un
coche. Se guarda como un id de 32 bits por fila.

Con una columna de persona y una de tiempo, la carga calcula la **duración de vida** de cada fila: el tiempo
hasta la siguiente muestra de la misma persona *en la misma sesión*, o "ninguna" (un centinela, -1) cuando no
hay siguiente muestra - la persona murió, se fue o el registro terminó. Las duraciones de vida dan el
historial **Duración de vida** de la [línea de tiempo](timeline.md), la interpolación y el envejecimiento en la
[repetición de caja](box-replay.md), y las roturas de ruta del [calor de línea](line-heat.md). Lo que hace
una fila sin sucesora es un ajuste de visualización (*Vida de reserva*), no algo fijado en los datos.

A cada persona se le asigna el grupo de su **primera** fila en el tiempo; esa asignación colorea su caja en la
repetición de caja y decide qué casilla de visibilidad de grupo la oculta allí. Los modos de calor usan en
cambio el grupo de cada fila.

### Nombres que llevan varias cosas a la vez {#names-worn-by-several-things-at-once}

Un nombre no siempre es una sola entidad: en algunas exportaciones, cada bot de cada partida registra con un
mismo nombre. Unir dos muestras de tal "persona" - por interpolación, una estela o una ruta - dibuja una línea
entre dos criaturas distintas a través del mapa.

Al cargar ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) un nombre se
marca como **compartido** cuando dos registros suyos

- están en la misma sesión,
- tienen el mismo tiempo,
- son del mismo tipo (cada columna de categoría conservada tiene el mismo valor), y
- están más separados que el 1 % de la diagonal de la extensión de los datos.

Los nombres compartidos se dibujan como muestras sueltas: sin interpolación, sin estela, sin ruta de calor de
línea. Todo lo demás de ellos (su calor) no cambia. El panel Conjunto de datos indica cuántos nombres se
marcaron, con hasta tres ejemplos, y el panel de repetición de caja repite el recuento.

## Sesión {#session}

La columna **Sesión / partida** indica a qué partida, incursión, ronda, carrera o vuelta pertenece una fila.
Es lo que hace de las muestras de una persona una sola pista continua: la telemetría real a menudo entrelaza
partidas simultáneas, y una muestra de un jugador justo antes del cabezal y la siguiente justo después pueden
ser de partidas distintas, a cientos de metros. Con una columna de sesión:

- la interpolación, las estelas y las rutas de calor de línea nunca cruzan un cambio de sesión;
- la duración de vida de una fila termina al final de su propia sesión;
- el selector de **Sesión** aparece arriba de la barra lateral, bajo la barra de modos.

Una columna de sesión es muy a menudo una *marca de tiempo* - el instante de inicio de la partida, repetido en
cada fila de esa partida. Por eso el asignador automático busca los nombres de sesión antes que los de persona
y grupo ([Asignación de columnas](column-mapping.md#session-person-group)). Una vuelta o un turno de carrera
también es una sesión: dos vueltas del mismo coche no deben unirse en una sola pista.

### El selector de sesión {#the-session-picker}

![El selector de sesión abierto en un archivo de diez partidas: Todas las sesiones (10), Partida 01, Partida 02 y así sucesivamente](../assets/img/en/sessions-persons-groups-picker.webp)

*Diez partidas en un archivo: elige una o mira todas.*

Se muestra cuando el conjunto de datos tiene sesiones listadas (véase el límite más abajo).

| Parte | Significado |
|---|---|
| Etiqueta a la derecha | El número de filas de la sesión elegida, o *todas a la vez*. |
| Menú | *Todas las sesiones (N)*, y luego cada sesión, la más activa primero, como `etiqueta - N filas, duración` (duración en segundos por debajo de 90 s, en minutos por debajo de 90 min, en horas por encima). |
| Aviso en ámbar | Aparece con *Todas las sesiones*: las posiciones nunca se unen entre sesiones, pero las partidas simultáneas ponen en el mapa a jugadores sin relación. |
| Aviso | Aparece en los modos de calor cuando se elige una sesión: la elección solo mueve el cabezal al inicio de la sesión. |

Al cargar se elige la sesión más activa. Elegir una sesión lleva el cabezal al inicio de esa sesión.

Lo que cambia la selección:

- En la **[repetición de caja](box-replay.md)** decide qué sesión se reproduce: solo se dibujan las cajas y
  estelas de esa sesión, y el rango de la línea de tiempo pasa a ser el tramo propio de la sesión.
- En los **modos de calor** no limita el calor, y un aviso bajo el selector lo dice: *En los modos de calor esto
  solo mueve el cabezal al inicio de la sesión; el calor sigue contando todas las sesiones. La repetición de caja
  reproduce solo la sesión elegida.* Para limitar el calor a una sesión, conserva también la columna de sesión como
  columna de filtro (*Conservar para filtrar*) y filtra por ella. Una columna puede ser a la vez la columna de sesión
  y una columna de filtro: el cargador lee cada columna de filtro marcada por separado, sea cual sea el papel que
  desempeñe además.

### Demasiadas sesiones {#too-many-sessions}

Se listan hasta **100 000** sesiones. Más allá de eso, la columna es en realidad un id (una carpeta con millones de
sesiones de unas pocas filas cada una), y enviar tantas etiquetas del worker a la página es lo que deja sin memoria
una pestaña. La carga entonces conserva los **ids** de sesión - así los límites se siguen aplicando en todas partes -
pero descarta las etiquetas y el selector, y el panel Conjunto de datos lo indica.

## Grupo {#group}

La columna **Equipo / grupo** es cualquier columna de pocos valores distintos: un equipo, un bando, un escuadrón, una
facción, un indicador jugador-contra-IA, una clase de coche. Se guarda como un id de 16 bits por fila y gobierna:

- la [Lista de equipos](teams-list.md) (visibilidad por grupo, bandos + / −),
- el [calor por equipo](team-heat.md) (un tono por grupo),
- la división de la [diferencia](difference.md) por grupo,
- los colores de caja en la [repetición de caja](box-replay.md) (una familia de tonos por grupo, una sombra por miembro).

### Límites {#limits}

Como máximo **4 096** grupos distintos. El id de grupo viaja en el cuarto canal del texel de posición de cada fila
en la GPU, y cada grupo necesita un texel en la tabla de signos de 4 096 de ancho que lee el sombreador para decidir
*oculto*, *sumado* o *restado*. Una columna con más valores distintos es un id, no un grupo: **la carga conserva cada
fila y solo descarta la agrupación**, con un aviso en el conjunto de datos que sugiere asignarla como columna de persona
o conservarla como columna de filtro.

El mismo límite de 4 096 se aplica a una columna de filtro de *categoría* conservada; una más ancha no se conserva y el
conjunto de datos lo dice. Una columna numérica (una marca de tiempo, por ejemplo) no tiene ese límite como filtro de
*rango*.

Los valores de grupo `0`, un valor vacío, `none`, `unknown`, `null` y `-1` (sin distinguir mayúsculas) significan "sin
grupo" para el [calor por equipo](team-heat.md), que los dibuja en gris neutro en lugar de con un color seguro.

## Tamaño de entidad {#entity-size}

El tamaño de una cosa rastreada - la caja de colisión de un jugador, un coche - decide cuán grandes se dibujan las cajas y
los rayos de mirada de la [repetición de caja](box-replay.md). No hay un campo para ello en el panel; viene de las
[pistas `heat3d`](data-formats.md#the-heat3d-hints) del archivo (`entity.size`, en las unidades propias del archivo; el
convertidor de CS2 escribe 32). La carga lo multiplica por la escala de unidades.

En cada carga ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), siendo *extensión* el
mayor de los tramos de X y Z de los datos:

| Ajuste | Con un tamaño de entidad | Sin él |
|---|---|---|
| Tamaño del cubo | tamaño de entidad | extensión / 500 |
| Longitud del rayo de mirada | tamaño de entidad × 4 | extensión / 200 |
| Radio del sprite | extensión / 120 | extensión / 120 |
| Punto de saturación | estimación analítica (luego medida) | lo mismo |
| Velocidad de vuelo | extensión / 12 | lo mismo |
| Plano lejano | extensión × 12 | lo mismo |
| Plano cercano | max(0,05, extensión / 20 000) | lo mismo |

## El panel Conjunto de datos {#the-dataset-panel}

Bajo el panel Origen. Con un conjunto de datos cargado muestra:

- el **nombre** del conjunto - la selección, el número de filas, el número de archivos, el paso si se usó uno;
- **`N equipos · N personas · N s de extensión`**;
- cada **aviso** que produjo la carga, en ámbar, mientras el conjunto esté cargado: grupos o una columna de filtro
  descartados por tener demasiados valores, sesiones no listadas, nombres compartidos, filas que faltan, archivos omitidos;
- el [generador sintético](synthetic-generator.md);
- **Descargar**, que quita el conjunto de datos.

El número de filas aparece en la cabecera del panel.
