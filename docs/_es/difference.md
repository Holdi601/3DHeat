---
title: "Diferencia"
parent: "Modos de calor"
nav_order: 5
lang: "es"
source: "difference.md"
source_hash: "12fc27dc0616"
translated: true
outdated: false
---

# Diferencia

Rojo donde el equipo A estuvo más, verde-azulado donde estuvo el equipo B, y nada donde estuvieron igual.

**Diferencia** (tecla 2) es calor con signo. Las filas de una población suman calor; las de otra lo restan.
Donde las dos se superponen por igual, el resultado es cero y totalmente transparente; donde domina una, se
muestra en los colores de ese lado - por defecto cálidos (transparente → rojo → amarillo → blanco) para el lado
**+** y fríos (transparente → verde → azul → morado) para el lado **−**.

![Calor de diferencia: rojo donde el lado + estuvo más, verde y azul donde el lado - estuvo más](../assets/img/es/difference-split.webp)

## Cómo se usa {#how-to-use-it}

1. Pulsa `2` (o elige **Diferencia** en la barra de modos).
2. Abre **División por diferencia** en la barra lateral.
3. Elige qué **Dividir por**: normalmente *Grupos*.
4. Pon un grupo (o valor) en **+** y otro en **−**.
5. Lee los colores: lo cálido significa el lado +, lo frío el lado −. El panel avisa si un lado no tiene filas
   (véase [Mensajes que puedes ver](#messages-you-may-see)).

*Cuáles* son las dos poblaciones es toda la cuestión, así que la división puede ser cualquier columna conservada, no
solo grupos. Las filas que caen en **ningún** lado se **dejan fuera**, no se cuentan como cero: eso es lo que hace que
una división sobre dos de muchos valores compare exactamente esos dos, y se combina con los [filtros](filters.md) -
filtra hasta un solo mapa, y luego divide eso por versión.

El modo necesita dos lados: una columna de grupo con al menos dos grupos, o una división sobre una columna conservada
para filtrar. En datos con menos de dos grupos, una carga empieza con una división por columna - primero la columna
*Source file* de una carga de varios archivos, si no, la primera columna de categoría con dos valores, si no, la primera
columna numérica con un rango - así que *comparar dos cargas* funciona con datos sin grupos. Solo los datos sin nada de
eso dejan el modo no disponible; también lo deja no disponible una división por columna que se queda sin nada en un lado.

## El panel División por diferencia {#the-difference-split-panel}

Se muestra en el modo Diferencia, bajo los paneles de calor.

**Dividir por** ofrece:

| Opción | Se muestra como | Regla de división |
|---|---|---|
| Grupos | *Grupo (N)* (cuando hay una columna de grupo) | Cada grupo en +, − o ninguno, fijado en la [Lista de equipos](teams-list.md) |
| Una columna de categoría | *columna (N valores)* | Valores en +, − o ninguno |
| Una columna numérica | *columna (numérica)* | Un rango de valores para cada lado |
| El archivo de origen | *Source file - comparar dos cargas* (cuando se cargaron varios archivos) | Archivos en +, − o ninguno |

Solo se ofrecen las columnas conservadas con *Conservar para filtrar* al cargar.

### Comparar proporciones, no recuentos {#compare-shares-not-counts}

**Comparar proporciones, no recuentos** (por defecto desactivado) pesa cada lado por uno dividido entre su propio
número de filas, así que un lado con cinco veces las filas no gana solo por cantidad. El color muestra entonces dónde
cada lado es proporcionalmente más común que el otro. Úsalo cuando los dos lados tienen cantidades de datos muy
distintas, por ejemplo dos sesiones de distinta duración.

### Mensajes que puedes ver {#messages-you-may-see}

El panel avisa cuando la imagen no es una diferencia real:

| Mensaje | Significado |
|---|---|
| *N + / M −* (o *N + / M − / K sin usar*) | Cuántos valores hay en cada lado (y en ninguno). |
| Ninguna fila de la ventana está en el lado **+** | Solo se dibuja el lado **−**. Mueve la ventana de la línea de tiempo o cambia la división. |
| Ninguna fila de la ventana está en el lado **−** | Solo se dibuja el lado **+**. |
| Ningún valor está en ningún lado | La diferencia no dibuja nada. Pon al menos un valor en **+** o **−**. |
| *columna* no se puede dividir así | La columna elegida no encaja con la división. Vuelve a elegir la columna. |
| La columna de división no cupo en la memoria de la GPU en N de M fragmentos | Esas filas no se dibujan. Sube el presupuesto de GPU en Rendimiento → Presupuestos de recursos, o carga menos filas. |

### Por grupo {#by-group}

El panel solo apunta a la [Lista de equipos](teams-list.md), donde cada grupo tiene un botón **+** y uno **−**. En
cada carga, la primera mitad de los grupos (redondeando hacia arriba) se pone en +, y el resto en −; **Repartir por
igual** en la Lista de equipos hace lo mismo otra vez. Un grupo en ningún lado, u oculto con su casilla, no aporta nada.

### Por valores de categoría {#by-category-values}

| Parte | Significado |
|---|---|
| `a + / b − / c sin usar` | Cuántos valores hay en cada lado y en ninguno. |
| **Vaciar** | Pone cada valor en ningún lado. |
| Lista de valores | Cada valor con un botón **+** y uno **−** (pulsa el activo otra vez para quitarlo de ese lado). Un valor vacío aparece como *(falta)*. |
| Nota de límite | Solo se listan los primeros 200 valores: *Mostrando los primeros 200 de N valores. Una columna tan ancha se acota mejor primero con un filtro, o se divide por rango si sus valores están ordenados.* |

Al elegir la columna, su primer valor va a + y el segundo a −. Cuando ningún lado tiene valores, la división vuelve a
los grupos en lugar de mostrar un marco vacío. *Source file* funciona igual, un valor por archivo - así se comparan dos
exportaciones, dos pruebas o dos versiones.

### Por rango {#by-range}

| Parte | Significado |
|---|---|
| Pista | El mínimo y el máximo de la columna. |
| **Rango positivo (+)**, **desde** / **hasta** | Las filas con un valor en este rango, incluidos ambos extremos, suman. |
| **Rango negativo (−)**, **desde** / **hasta** | Las filas en este rango restan. |
| **Dividir en el punto medio** | Pone + en [mínimo, medio] y − en [medio, máximo] - también lo que hace elegir la columna. |

Un valor en los dos rangos cuenta como +. Los rangos no tienen que cubrir la columna; los valores en ninguno se dejan
fuera. *Los dos primeros minutos frente a los dos últimos* es una división por rango sobre una columna parecida a un tiempo.

## Colores {#colours}

La sección **Colores del calor** muestra en este modo dos editores de rampa: **Positivo (equipos aditivos)** y
**Negativo (equipos sustractivos)**, cada uno con su propio botón de restablecer (*Restablecer a transparente → rojo →
amarillo → blanco*, *Restablecer a transparente → verde → azul → morado*). El compuesto toma el valor absoluto del calor
neto a través del [punto de saturación y la respuesta](colour-and-exposure.md), y elige la rampa negativa donde el neto
es menor que cero. Véase [Color y exposición](colour-and-exposure.md#the-ramp-editor).

Usa la respuesta de densidad *Lineal* cuando importa el tamaño de la diferencia: es la única respuesta en la que un mismo
color significa un mismo recuento.

## Para desarrolladores {#for-developers}

Cada fila recibe un signo de +1, -1 o 0 en el sombreador de vértices ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts));
un 0 rechaza la fila antes de dibujar ningún fragmento.

- Por grupo, el signo sale de una tabla de grupos de 4 096 entradas indexada por el id de grupo de la fila (el id de grupo
  viaja en el cuarto canal del texel de posición de la fila).
- Por categoría, el signo sale de una segunda tabla de 4 096 entradas, rellenada por valor de categoría, y el valor de la
  fila se lee de la textura de filtro de la columna; un valor más allá del final de la tabla se rechaza en ambos backends.
- Por rango, el valor de la fila se compara con los dos rangos.

Cambiar la división reinicia la acumulación.

**Los grupos ocultos siguen ocultos con cada división.** Con una división por columna, la tabla de grupos ya no lleva signos;
guarda 1 para un grupo mostrado y 0 para uno oculto ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)),
y ambas tablas llegan al sombreador juntas - dos filas de una textura de signos en WebGL2, dos mitades de un mismo buffer de
almacenamiento en WebGPU. Una fila se dibuja solo cuando su grupo se muestra *y* su valor de columna está en un lado. Así,
un grupo desmarcado en la [Lista de equipos](teams-list.md), o dejado fuera por el enfoque de lado de la pestaña Partida,
no aporta nada, sea cual sea la forma en que se divida la diferencia.
