---
title: "Estadísticas del recorrido"
parent: "Análisis de carrera"
nav_order: 57
lang: "es"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Estadísticas del recorrido

Carga muchas vueltas de un mismo recorrido y el visor cuenta los errores: en
qué curva se pierde más tiempo, en cuántas vueltas se falló allí y por qué.
Úsalo para encontrar la curva que merece la pena practicar.

Pruébalo: **Vueltas de demostración** da tres vueltas, suficientes para que
aparezca esta sección.

![Estadísticas del recorrido con el mapa de errores: la pista pintada según cuántas vueltas perdieron tiempo en cada curva, y la lista de curvas](../assets/img/en/race-course-mistake-map.webp)

Carga la carpeta completa de un recorrido - decenas de vueltas, varios coches,
varias clases de rendimiento - y se juzga cada vuelta y luego se cuenta. Esta
página trata la comparación por clase, qué cuenta como error, la sección
**Estadísticas del recorrido**, el mapa de errores, la exportación al mapa de
calor, los recorridos de varias pistas y los límites de rendimiento con muchas
vueltas.

## Frente a la mejor de su propia clase {#against-the-best-of-its-own-class}

Cada vuelta se compara curva a curva con la **vuelta completa más rápida de su
propia clase de rendimiento** (la referencia, dentro de la clase de la
referencia); esa misma vuelta se compara con el más rápido de su clase en cada
curva, o con todas las vueltas cuando está sola en su clase. Los coches se
agrupan por la clase de rendimiento del juego (en Forza, de D a X; C y S2 son
dos de ellas). El punto de frenada de un coche de clase C frente al de uno de
S2 no dice nada sobre la conducción. El mapa de tiempos, las diferencias en la
lista de vueltas y la tabla *Curva a curva* siguen la misma comparación (véase
[con quién se compara cada vuelta](race-corner-analysis.md#who-each-lap-is-compared-with)).

Las estadísticas se construyen sobre el análisis de cada vuelta, no al lado de él.

## Qué cuenta como error {#what-counts-as-a-mistake}

Una **aparición** es el error de una vuelta en una curva (segmento). Los
errores de una vuelta en una curva son:

1. **La causa de conducción** que el análisis encontró para su pérdida allí -
   un hallazgo que es una pérdida, atribuido al conductor (no al coche ni a la
   situación), que cuesta **0,05 s** o más frente a su vuelta de comparación.
   Su coste es la pérdida de la curva.
2. **Cada fallo de control del coche** que cometió allí y que la otra vuelta no
   (no compartido), que cuesta **0,03 s** o más - bloqueo, patinaje de la rueda,
   la parte trasera que se va, empuje, trompo. Su coste es el del propio evento.
3. **Cada golpe y choque**, compartido o no, cueste lo que cueste.

Una curva puede tener varios; cada tipo se cuenta **una vez por vuelta y
curva**. Las ganancias, la parte que corresponde al coche y una llegada más lenta
decidida en la curva anterior no son errores.

### De los hallazgos a los errores {#from-findings-to-mistakes}

| Hallazgo | Error |
|---|---|
| demasiado rápido al entrar, lento al salir, por frenar más de unos metros más tarde que la otra | Frenó demasiado tarde |
| frenó pronto | Frenó demasiado pronto |
| frenó suavemente | Frenó con demasiada suavidad |
| un bloqueo como causa | Bloqueó una rueda |
| rodó sin frenar ni acelerar | Rodó sin acelerar |
| agarre de sobra, más lento hasta el vértice, frenó donde la otra solo levantó | Demasiado lento en la mitad de la curva |
| una trazada demasiado cerrada | Trazada demasiado cerrada |
| empujó hacia fuera | Empujó hacia fuera |
| giró el coche menos / demasiado | Giró mal el coche |
| acelerar más tarde a fondo, dudó | Acelerar tarde |
| más lento al salir de la curva | Más lento al salir |
| patinaje de la rueda | Patinaje de la rueda |
| la parte trasera se fue, de lado en mitad de la curva | Se fue la parte trasera |
| se salió hacia fuera | Se salió hacia fuera |
| perdió velocidad sin necesidad | Perdió velocidad |
| levantó (al entrar, o en la recta) | Levantó el pie |
| casi parado, trompo, golpe o choque como causa | Trompo / Golpeó algo / Chocó cuando los eventos de la vuelta allí lo dicen (primero choque, luego trompo, luego golpe); si no, Casi parado |
| un vuelo más largo | Voló demasiado lejos |

Los dos patrones se cuentan como la causa que hay dentro de ellos, según la
misma tabla. *Cedió más al entrar de lo que recuperó la salida* es el error de
la causa de su entrada: frenar pronto es *Frenó demasiado pronto*, un bloqueo
*Bloqueó una rueda*, rodar sin frenar *Rodó sin acelerar*, el agarre no usado
*Demasiado lento en la mitad de la curva*. *Demasiado rápido al entrar, lento
al salir* es *Frenó demasiado tarde* cuando la vuelta frenó más tarde que la
otra; si no, el error de la causa de su salida - *Acelerar tarde*, *Patinaje de
la rueda*, *Se fue la parte trasera*, *Se salió hacia fuera*, *Más lento al
salir*. Un patrón cuya causa es del coche, o una llegada más lenta, no se cuenta.

No se cuentan: la llegada más lenta, la salida, cada hallazgo *del coche*
(tirón, agarre, frenos, tracción) y cada curva de ganancia o de nivel.

### Los tipos, en su orden {#the-kinds-in-their-order}

Frenada: *Frenó demasiado tarde*, *Frenó demasiado pronto*, *Frenó con
demasiada suavidad*, *Bloqueó una rueda*. Entrada: *Rodó sin acelerar*,
*Demasiado lento en la mitad de la curva*, *Trazada demasiado cerrada*,
*Empujó hacia fuera*, *Giró mal el coche*. Salida: *Acelerar tarde*, *Más lento
al salir*, *Patinaje de la rueda*, *Se fue la parte trasera*, *Se salió hacia
fuera*, *Perdió velocidad*. Recta: *Levantó el pie*. Incidentes: *Trompo*,
*Golpeó algo*, *Chocó*, *Casi parado*, *Voló demasiado lejos*.

## La sección Estadísticas del recorrido {#the-course-statistics-section}

Se muestra desde **3** vueltas en adelante, entre **Vueltas** y **Dónde mejorar**.

- **El resumen**: "40 vueltas en 9 coches, 3 clases: cada curva juzgada frente a
  la vuelta más rápida de su propia clase." (los coches se cuentan por número de
  coche o por nombre).
- **Fichas de clase** (con varias clases): **Todo** y una ficha por clase, cada
  una con su número de vueltas, en el orden del juego (D, C, B, A, S1, S2, R, X y
  después las demás). Haz clic en una clase para ver solo sus vueltas;
  **Shift+clic** añade o quita una. Todo lo de abajo - las listas, el mapa, la
  exportación al mapa de calor - sigue las clases elegidas.
- **Lo que más falla**: cada tipo de error, primero el de más vueltas (luego el
  de más veces, luego el de más coste), hasta 8 (**Todos los N tipos** muestra el
  resto; **Menos** los vuelve a ocultar). Cada fila: su nombre, "N de M vueltas",
  una barra con esa proporción y "K veces · unos X s · más en T3 (5), T7 (4), T1
  (2)" - cuántas veces se cometió (vuelta por curva), cuánto costó en total y las
  tres curvas en las que más vueltas lo cometieron. **Haz clic en una fila** para
  mostrarla en el mapa de errores (y activar el mapa); haz clic de nuevo para ver
  todos los errores.
- **Curva a curva** (o *Curva a curva - <error>* con uno elegido): por segmento,
  "N de M perdieron tiempo · X s" - las vueltas que recorrieron la curva entera,
  las que perdieron **0,05 s** o más allí frente al mejor de su clase, y todo el
  tiempo que perdieron. Plegada, lista sus tres errores más comunes con el número
  de vueltas de cada uno. **Haz clic en una curva** para abrirla, enfocarla con la
  cámara y pasar al mapa de errores: para cada error (o solo el elegido) aparece
  una línea como "12 de 40 vueltas frenaron demasiado pronto aquí. En 9 coches
  distintos - unos 0,21 s cada una." y las vueltas que lo cometieron, **las peores
  primero**, cada una con su coste - hasta 8, "+N más" para el resto. **Haz clic en
  una vuelta** para enfocarla y reproducir ese error (alineada 40 m antes).
- **Mostrar en el mapa de calor**: véase más abajo. "Generando el mapa de
  calor…" mientras se ejecuta; desactivado cuando no hay errores.

## El mapa de errores {#the-mistake-map}

**Vista → Mapa de errores** pinta a lo largo de la trayectoria de referencia
cuántas de las vueltas (de las clases elegidas) cometieron un error en cada
metro - de todos los tipos, o del elegido en las estadísticas. Cada vuelta cuenta
una vez por metro; el tramo de cada aparición (donde estaban su causa o su evento)
se ensancha 6 m a cada lado para que una corta se vea. Más ancho y más brillante
donde más vueltas pasaron: anchura `3 + 10 · (vueltas aquí / máximo de vueltas en
cualquier sitio)` metros, color de marrón apagado a naranja brillante; una franja
gris de 2 m donde ninguna. Leyenda: *pocas vueltas ↔ más vueltas*.

Con **Etiquetas** activadas, el vértice de cada curva lleva su error más común:
"T3 · 12/40 frenada temprana" (vueltas que lo cometieron / vueltas que recorrieron
la curva), "T3 · 12/40" con un tipo elegido, "T3 · limpia" sin ninguno. Al pasar
el ratón sobre una etiqueta se listan las pérdidas de la curva y sus cinco errores
más comunes; al hacer clic en ella se abre o cierra esa curva en las estadísticas.

## Mostrar en el mapa de calor {#show-in-the-heatmap}

**Mostrar en el mapa de calor** pasa lo mismo a la pestaña de mapa de calor como
un conjunto de datos llamado "Errores en <pista>" (o "Errores en el recorrido"),
para que todo el conjunto de herramientas del mapa de calor - modos de calor,
filtros, la línea de tiempo, los cortes - funcione sobre dónde se falla.

Es un CSV creado en memoria (`mistakeTable`), una fila por punto de la rejilla
(cada 2 m) de cada aparición, en la **posición propia de esa vuelta** allí:

| Columna | Contenido |
|---|---|
| `x`, `y`, `z` | la posición de la vuelta en ese metro (coordenadas del juego) |
| `elapsed` | el tiempo de la vuelta allí, s |
| `lap` | la etiqueta de la vuelta |
| `car` | el nombre del coche (o "coche 1234") |
| `mistake` | el nombre del error, en el idioma actual |
| `car_class` | la clase, `-` cuando no hay ninguna |
| `corner` | la etiqueta de la curva, `T3` |
| `cost` | el coste de la aparición, s |

Se carga con el cargador propio del mapa de calor y con pistas de mapeo: Y hacia
arriba, sin inversión de ejes, escala 1; el tiempo `elapsed` en segundos;
**persona** = `car`, **grupo** = `mistake`, **sesión** = `lap`; sin dirección de
mirada; `car_class`, `corner` y `cost` se conservan como columnas de filtro. La
pestaña pasa entonces a **Mapa de calor** y encuadra los datos. Solo se exportan
las clases elegidas en las estadísticas.

## Recorridos de varias pistas {#courses-from-several-tracks}

Las vueltas se analizan **un recorrido cada vez**. Una carpeta con vueltas de
varios recorridos - toda la biblioteca de vueltas - ofrece cada recorrido para
cargarlo por separado (con su número de vueltas, primero el de más); las vueltas
de carreras que nunca terminaron (`unfinished/` de FH Companion) van con su
recorrido, marcadas como *parcial*. Las vueltas de varias pistas con nombre
elegidas como archivos se ofrecen igual, y las que no nombran pista van con la que
esté elegida. Cargar vueltas de otra pista con nombre distinta de las ya cargadas
reemplaza a estas. Detalles: [Cargar vueltas](race-loading-laps.md#folders-and-courses).

## Rendimiento con muchas vueltas {#performance-with-many-laps}

Decenas de vueltas se analizan en uno o dos segundos (todas, siempre). Lo que se
dibuja está limitado para que la vista se mantenga a la velocidad de cuadro:

| Límite | Valor | Efecto |
|---|---|---|
| vueltas dibujadas por defecto | 8 (`SHOW_ALL_UP_TO`) | a partir de 8 vueltas cargadas, las vueltas nuevas se ocultan salvo que sean la referencia, la vuelta enfocada o la mejor de su clase. **Mostrar todos** dibuja cada vuelta; **Solo las que se miran** vuelve atrás. Enfocar una vuelta la vuelve a mostrar, junto con la mejor de su clase |
| coches simples y líneas finas | más de 10 visibles (`PLAIN_PAST`) | las vueltas distintas de la enfocada, el coche perseguido y la referencia: un punto de línea cada 6 m (en lugar de cada 1,5 m), coches dibujados sin detalle |
| vueltas en gráfico | 8 (`CHART_LAPS`) | primero la enfocada, la mejor de su clase y la referencia; "+N más dibujadas, sin gráfico" |
| tarjetas del HUD | 6 | las seis primeras vueltas visibles |
| estadísticas | desde 3 vueltas | la sección se oculta por debajo de eso |
| hallazgos listados | 12 del conductor, 8 del coche/contexto, 10 ganancias | por vuelta enfocada |
| parejas de coches mostradas | 3 | a partir de 3 parejas, una pareja con selector |

Las apariciones de errores se calculan una vez por análisis y se guardan en caché;
la densidad del mapa de errores se guarda en caché por selección de clase y error.

## Para desarrolladores {#for-developers}

Código: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` en [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
