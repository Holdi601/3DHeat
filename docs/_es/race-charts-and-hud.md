---
title: "Gráficos y HUD"
parent: "Análisis de carrera"
nav_order: 53
lang: "es"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Gráficos y HUD

Los gráficos alinean tus vueltas metro a metro, para que veas dónde un conductor
frenó más tarde o levantó antes. Las tarjetas de la parte superior izquierda de la
vista muestran lo que hace cada coche y cada conductor en este momento.

![Gráficos bajo la vista: filas de diferencia, velocidad, acelerador, freno y dirección para dos vueltas, las franjas de tiempo y causa arriba, y el cursor con las tarjetas](../assets/img/en/race-charts-rows.webp)

## Los gráficos {#the-charts}

Todas las vueltas en un mismo eje de distancia: metros a lo largo de la referencia
(véase [un eje de distancia](race-corner-analysis.md#one-distance-axis)), así que la
misma x es el mismo lugar de la pista para cada vuelta. Una vuelta se grafica sola
(y se reproduce); una segunda del mismo recorrido se grafica frente a ella. Sin
vueltas cargadas (o si el análisis falló), la zona dice "Los gráficos aparecen
cuando se carga una vuelta; carga otra del mismo recorrido para comparar las dos".

### Qué hay en ellos {#what-is-on-them}

- **La leyenda**: el color y la etiqueta de cada vuelta graficada, la referencia
  marcada como "(referencia)"; "+N más dibujadas, sin gráfico" cuando hay más
  vueltas visibles que graficadas; **Gráficos (N) ▾**; **Vuelta entera** mientras
  hay zoom; una línea de ayuda.
- **Dos franjas** arriba, para la vuelta enfocada:
  - *tiempo*: el [mapa de tiempos](race-replay-and-scene.md#time-map-where) como
    franja, en rojo cuando se pierde, en verde cuando se gana;
  - *causa*: cada una de sus pérdidas como una barra sobre el lugar de su causa, en
    el color de la causa; pasa el ratón por una barra para ver su título y su coste.
- **Bandas de curva**: una banda sombreada desde la entrada hasta la salida de cada
  curva (tal como se encuentra en la referencia) y su nombre (`T1` …) bajo el eje, en
  el vértice.
- **El hallazgo seleccionado**: una banda en el color de su causa sobre su tramo.
- **Las filas** (gráficos), una por canal elegido, cada una con su nombre y el valor
  superior e inferior de su rango a la izquierda, y una línea de cero donde el rango
  cruza el cero. Cada vuelta es una línea en su color: la vuelta enfocada de 2 px de
  ancho y opaca, la referencia opaca, las demás de 1,5 px al 75%. La fila de
  diferencia deja fuera la referencia (que vale cero frente a sí misma).
- **El cursor**: una línea vertical donde está el coche de referencia (o donde está
  el puntero), y un punto por coche en cada fila salvo la de diferencia - en el
  cursor, todos los coches están en el mismo metro; si no, la distancia propia de
  cada coche en el reloj de la repetición.

Se grafican **8** vueltas como máximo: primero la enfocada, la mejor de su clase y la
referencia; luego las demás, en orden de carga.

### Filas y sus alturas {#rows-and-their-heights}

Las filas comparten la altura del gráfico según su peso, ninguna menor de 16 px:

| Fila | Peso |
|---|---|
| Diferencia (con la referencia, segundos, con signo) | 1,7 |
| Velocidad (km/h) | 1,7 |
| un pedal (acelerador, freno, embrague) | 1 |
| dirección | 1,1 |
| marcha | 0,8 |
| un piloto (freno de mano, ABS …) | 0,55 |
| cualquier otro | 1 |

Un canal con un rango de visualización fijo en la tabla (pedales 0-100 %) lo usa;
los demás se ajustan al tramo visible de las vueltas. Un nombre de fila demasiado
largo para el espacio (una palabra larga en otro idioma) baja el valor superior una
línea cuando la fila es lo bastante alta, y se corta con puntos suspensivos cuando
no lo es; el nombre completo aparece como información al pasar el ratón.

### Los gráficos predeterminados {#the-default-graphs}

Hasta que se elijan gráficos: la **diferencia**, luego cada canal que la tabla marca
como `graph` y que las vueltas tienen - acelerador, freno, embrague, freno de mano,
dirección, marcha, velocidad - salvo que un canal de pedal o de piloto se deja fuera
a menos que alguna vuelta lo mueva más allá de 0,02 (un embrague que nunca se pisa no
es un gráfico). El orden es el de la tabla.

### El selector de gráficos {#the-graph-picker}

**Gráficos (N) ▾** abre un panel sobre el botón:

- un cuadro de filtro (busca por el nombre o el id de un canal);
- **Predeterminadas** (vuelve al conjunto por defecto; su información indica cuántos
  son) y **Cerrar**;
- *Diferencia con la referencia*, luego cada canal que llevan las vueltas graficadas,
  agrupado (movimiento, mandos, motor, ayudas, neumáticos, frenos, suspensión,
  ruedas, otros, cronometraje, posición), con una casilla para cada uno; un canal por
  rueda es una línea con una ficha por rueda (FL, FR, RL, RR).

Marcar mantiene el orden de la tabla, sea cual sea el orden en que se marcó. La
elección se mantiene hasta que se pulse **Predeterminadas** o se recargue la página.
Los canales que la tabla no conoce se ofrecen bajo *otros*, con el nombre de su propio
id ("brakeLinePress" → "Brake line press").

### Pasar el ratón, rueda, zoom, clic {#hover-wheel-zoom-click}

| Entrada | Qué hace |
|---|---|
| pasar el ratón | cada coche, su tarjeta y sus mandos se mueven a ese metro; un poste lo marca en la pista; una tabla lista el valor de cada vuelta graficada en cada fila en ese punto (la diferencia aparece como "ref" para la referencia); sobre las tarjetas, "a N m - el cursor de los gráficos". Al salir del gráfico, vuelve a la repetición |
| rueda | avanza la repetición por la vuelta 1/200 del tramo visible por muesca (Mayús: 5×), pausando la repetición; con zoom, la vista sigue al cursor |
| Ctrl+rueda (Cmd+rueda) | hace zoom sobre el eje de distancia alrededor del puntero, 1,25× al alejar / 0,8× al acercar por muesca, nunca más estrecho que 40 m; alejar hasta la vuelta entera termina el zoom |
| rueda lateral | desplaza mientras hay zoom (10 % del tramo por cada 100 unidades de desplazamiento) |
| doble clic, **Vuelta entera** | aleja el zoom |
| clic | salta la repetición a donde la referencia alcanza ese metro |
| Mayús+clic | alinea los coches allí (véase [alinear](race-replay-and-scene.md#lining-up)) |

Los gráficos se vuelven a dibujar en el idioma actual cuando cambia.

La línea de ayuda de la leyenda dice lo mismo en breve: "Pasar el ratón: cada coche
allí · rueda: avanzar por la vuelta · Ctrl+rueda: zoom · clic: saltar · Mayús+clic:
alinear".

## Las tarjetas de coche (HUD) {#the-car-cards-hud}

Arriba a la izquierda de la vista, una tarjeta por vuelta visible - como máximo **6**,
las seis primeras vueltas visibles en orden de carga - para el momento en que está la
repetición (o el cursor de los gráficos).

**Cabecera:** el color y la etiqueta de la vuelta; la diferencia en vivo - el tiempo
de esta vuelta para llegar a su distancia actual menos el tiempo de la referencia para
llegar a la misma distancia, "+0,48 s" - o "referencia"; **⋯** para mostrar u ocultar
todos los demás valores (lo mismo que *Todos los valores en las tarjetas*). La tarjeta
del coche perseguido se resalta.

**El coche desde arriba:** el contorno de la carrocería en el color de la vuelta, con
una flecha en la parte delantera, cuatro neumáticos (los delanteros giran hasta 28°
con la dirección), cada uno coloreado según su temperatura, con los mismos símbolos
que el coche 3D dibujado plano: anillo de deslizamiento, barra de suspensión, brillo de
freno, banda de desgaste, barra de carga.

**Lecturas:** velocidad en km/h, el tiempo propio de la vuelta, su distancia a lo largo
de la referencia.

**Mandos:**

- un volante que gira con el mando de dirección (el giro completo se dibuja como 180°),
  con el porcentaje debajo;
- una barra por pedal, de izquierda a derecha como en una caja de pedales - embrague,
  freno, acelerador -, cada una con su porcentaje y su nombre corto, en su color (solo
  los pedales que tiene la vuelta);
- la marcha (R para marcha atrás, N para punto muerto);
- una pequeña luz por cada canal de encendido/apagado que tiene la vuelta - freno de
  mano, ABS, control de tracción, DRS, limitador de boxes, en el aire - encendida en su
  color mientras está activa (por encima de la mitad de su rango);
- una lectura por cada canal de nivel: reparto de frenada, ajustes de ABS y control de
  tracción, sobrealimentación, combustible.

**La traza de mandos:** los últimos **6 segundos** de cada pedal (una franja, cada una
en su color) y la dirección (su propia franja, centrada), terminando en este momento -
lo que hizo el conductor al entrar en él. Hasta 160 puntos.

**Todos los valores** (⋯ o *Todos los valores en las tarjetas*): cada otro valor escalar
que tiene la vuelta en este momento, y luego cada canal por rueda como cuatro valores
(FL FR RL RR), con nombre tomado de la tabla de canales o del propio nombre del canal,
ordenados por grupo.

## Para desarrolladores {#for-developers}

Código: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### La tabla de canales {#the-channel-table}

`CHANNELS` en [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts)
es el único lugar donde se describe un canal: su unidad, si es un valor por muestra o
uno por rueda (guardado como `name.FL` …), su grupo, un rango de visualización, cómo se
dibuja en el coche (`glyph`), cómo aparece en la tarjeta (`input`: `pedal`, `steering`,
`gear`, `lamp`, `level`), si es un gráfico predeterminado, si salta en vez de mezclarse
(marcha, banderas) y cómo se muestra (escala, unidad, cifras). Las etiquetas y los
nombres cortos son mensajes en cada idioma (`race.channel.<name>.label` / `.short`).

Canales con dibujo o gráfico predeterminado:

| Canal | Unidad | Se dibuja como | Gráfico predeterminado |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedal (verde, rojo, …), mostrado en % | sí |
| `handbrake` | 0..1 | piloto | sí |
| `steer` | -1..1, positivo a la derecha | volante | sí |
| `gear` | - | marcha | sí |
| `speed` | m/s, mostrado en km/h | - | sí |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | piloto | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | lectura de nivel | - |
| `tireTemp` (por rueda) | °C, visualización 40-130 | color del neumático | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (por rueda) | como lo escala el juego, visualización ±1,5 | anillo de deslizamiento | - |
| `combinedSlip`, `slipIndex` (por rueda) | visualización 0-1,5, 0-1 | anillo de deslizamiento | - |
| `suspension` (por rueda) | 0..1 | barra de suspensión | - |
| `brakeTemp` (por rueda) | °C, visualización 100-900 | brillo de freno | - |
| `tireWear` (por rueda) | 0..1 | banda de desgaste | - |
| `wheelLoad` (por rueda) | N, visualización 0-12 000 | barra de carga | - |

Otros de la tabla (en gráfico y listados, no dibujados): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (ángulo de deriva), `loose`, `lateral` (desplazamiento
respecto de la referencia), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, además de `time`, `distance`, `x`, `y`, `z`.

**Un canal que no está en la tabla** se sigue leyendo, se grafica (bajo *otros*) y se
lista en las tarjetas, con la etiqueta tomada de su propio nombre. **Para darle un
nombre, una unidad y un dibujo propios**, añade una entrada a la tabla (y su mensaje de
etiqueta a cada `src/i18n/locales/<idioma>/race-channels.json`). Un *tipo* nuevo de
dibujo de rueda es una entrada en `WHEEL_GLYPHS` (glyph.ts) y su gemela plana
`CARD_GLYPHS` (RaceHud.tsx); ambas están tipadas por el tipo, así que la compilación
falla hasta que existan las dos. `src/race/extensible.test.ts` comprueba que los canales
desconocidos llegan a los gráficos, que cada símbolo de la tabla se puede dibujar y que
las luces se encienden.
