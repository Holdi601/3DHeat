---
title: "Diferencia"
parent: "Modos de calor"
nav_order: 5
lang: "es"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: false
---

# Diferencia

Rojo donde el equipo A estuvo más, azul-verde donde estuvo más el equipo B, nada donde estaban igualados.

**Diferencia** (tecla 2) es calor con signo. Las filas de una población suman calor; las de otra lo restan. Donde los dos se solapan por igual, el resultado es cero y totalmente transparente; donde uno domina, se muestra con los colores de ese bando - por defecto cálidos (transparente → rojo → amarillo → blanco) para el lado **+** y fríos (transparente → verde → azul → morado) para el lado **−**.

![Calor de diferencia: rojo donde el lado + estuvo más, verde y azul donde el lado - estuvo más](../assets/img/en/difference-split.webp)

## Cómo se usa {#how-to-use-it}

1. Pulsa `2` (o elige **Diferencia** en la barra de modos).
2. Abre **División por diferencia** en la barra lateral.
3. Elige por qué **Dividir por**: normalmente *Grupos*.
4. Pon un grupo (o valor) en **+** y otro en **−**.
5. Lee los colores: el cálido indica el lado +, el frío el lado −. El panel avisa si un lado no tiene filas (véase [Mensajes que puedes ver](#messages-you-may-see)).

*Cuáles* son las dos poblaciones es toda la cuestión, así que la división puede ser cualquier columna guardada, no solo grupos. Las filas que caen en **ninguno** de los lados se **dejan fuera**, no se cuentan como cero: eso hace que una división sobre dos de muchos valores compare exactamente esos dos, y se combina con los [filtros](filters.md) - filtra a un mapa y divide después por versión.

El modo necesita dos lados: una columna de grupo con al menos dos grupos, o una división sobre una columna guardada para filtrar. En datos con menos de dos grupos, una carga empieza con una división por columna - la columna *Archivo de origen* de una carga de varios archivos primero, si no la primera columna categórica con dos valores, si no la primera columna numérica con un rango - así que *comparar dos cargas* funciona sin grupos. Solo los datos sin nada de eso dejan el modo no disponible; tampoco lo está una división por columna que deja un lado vacío.

## El panel División por diferencia {#the-difference-split-panel}

Se muestra en el modo Diferencia, debajo de los paneles de calor.

**Dividir por** ofrece:

| Opción | Se muestra como | Regla de división |
|---|---|---|
| Grupos | *Grupo (N)* (cuando hay columna de grupo) | Cada grupo en +, − o en ninguno, fijado en la [lista de Equipos](teams-list.md) |
| Una columna categórica | *columna (N valores)* | Valores en +, − o en ninguno |
| Una columna numérica | *columna (numérica)* | Un rango de valores para cada lado |
| El archivo de origen | *Archivo de origen - comparar dos cargas* (cuando se cargaron varios archivos) | Archivos en +, − o en ninguno |

Solo se ofrecen las columnas marcadas como *Conservar para filtrar* al cargar.

### Comparar proporciones, no recuentos {#compare-shares-not-counts}

**Comparar proporciones, no recuentos** (por defecto desactivado) pondera cada lado por uno dividido entre su propio número de filas, así que un lado con cinco veces más filas no gana solo por número. El color muestra entonces dónde cada lado es proporcionalmente más común que el otro. Úsalo cuando los dos lados tienen cantidades de datos muy distintas, por ejemplo dos sesiones de duración diferente.

### Mensajes que puedes ver {#messages-you-may-see}

El panel avisa cuando la imagen no es una diferencia real:

| Mensaje | Significado |
|---|---|
| *N + / M −* (o *N + / M − / K sin usar*) | Cuántos valores hay en cada lado (y en ninguno). |
| Ninguna fila de la ventana está en el lado **+** | Solo se dibuja el lado **−**. Mueve la ventana de la línea de tiempo o cambia la división. |
| Ninguna fila de la ventana está en el lado **−** | Solo se dibuja el lado **+**. |
| Ningún valor está en ningún lado | La diferencia no dibuja nada. Pon al menos un valor en **+** o **−**. |
| *columna* no se puede dividir así | La columna elegida no encaja con la división. Vuelve a elegir la columna. |
| La columna de división no cupo en la memoria de GPU en N de M fragmentos | Esas filas no se dibujan. Sube el presupuesto de GPU en Rendimiento → Presupuestos de recursos, o carga menos filas. |

### Por grupo {#by-group}

El panel solo remite a la [lista de Equipos](teams-list.md), donde cada grupo tiene un botón **+** y otro **−**. En cada carga, la primera mitad de los grupos (redondeando hacia arriba) se pone en +, y el resto en −; **Repartir por igual** en la lista de Equipos hace lo mismo otra vez. Un grupo en ninguno de los lados, o oculto con su casilla, no aporta nada.

### Por valores de categoría {#by-category-values}

| Parte | Significado |
|---|---|
| `a + / b − / c sin usar` | Cuántos valores hay en cada lado y en ninguno. |
| **Vaciar** | Pone cada valor en ninguno de los lados. |
| Lista de valores | Cada valor con un botón **+** y otro **−** (pulsa de nuevo el activo para quitarlo de ese lado). Un valor vacío aparece como *(falta)*. |
| Nota de límite | Solo se listan los primeros 200 valores: *Mostrando los primeros 200 de N valores. Una columna tan ancha se reduce mejor con un filtro antes, o dividiendo por rango si sus valores están ordenados.* |

Al elegir la columna, su primer valor va a + y el segundo a −. Cuando ningún lado tiene valores, la división recurre a los grupos en lugar de mostrar un marco vacío. *Archivo de origen* funciona igual, un valor por archivo - así se comparan dos exportaciones, dos pruebas o dos versiones.

### Por rango {#by-range}

| Parte | Significado |
|---|---|
| Pista | El mínimo y el máximo de la columna. |
| **Rango positivo (+)**, **desde** / **hasta** | Las filas con un valor en este rango, incluidos ambos extremos, suman. |
| **Rango negativo (−)**, **desde** / **hasta** | Las filas en este rango restan. |
| **Dividir en el punto medio** | Pone + en [mínimo, medio] y − en [medio, máximo] - también lo que hace elegir la columna. |

Un valor en ambos rangos cuenta como +. Los rangos no tienen que cubrir la columna; los valores en ninguno quedan fuera. *Los dos primeros minutos contra los dos últimos* es una división por rango sobre una columna de tipo tiempo.

## Colores {#colours}

La sección **Colores del calor** muestra en este modo dos editores de escala: **Positivo (equipos aditivos)** y **Negativo (equipos sustractivos)**, cada uno con su propio botón de restablecer (*Restablecer a transparente → rojo → amarillo → blanco*, *Restablecer a transparente → verde → azul → morado*). La composición toma el valor absoluto del calor neto a través del [punto de saturación y la respuesta](colour-and-exposure.md), y elige la escala negativa donde el neto es menor que cero. Véase [Color y exposición](colour-and-exposure.md#the-ramp-editor).

Usa la respuesta de densidad *Lineal* cuando importa el tamaño de la diferencia: es la única respuesta en la que el mismo color significa el mismo recuento.

## Cómo funciona {#how-it-works}

Cada fila recibe un signo de +1, -1 o 0 en el shader de vértices ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); un 0 descarta la fila antes de dibujar cualquier fragmento.

- Por grupo, el signo viene de una tabla de grupos de 4.096 entradas indexada por el id de grupo de la fila (el id de grupo viaja en el cuarto canal del texel de posición de la fila).
- Por categoría, el signo viene de una segunda tabla de 4.096 entradas, rellenada por cada valor de categoría, y el valor de la fila se lee de la textura de filtro de la columna; un valor más allá del final de la tabla se descarta en ambos motores.
- Por rango, el valor de la fila se compara con los dos rangos.

Cambiar la división reinicia la acumulación.

**Los grupos ocultos siguen ocultos con cualquier división.** Con una división por columna, la tabla de grupos ya no lleva signos; contiene 1 para un grupo visible y 0 para uno oculto ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), y ambas tablas llegan al shader juntas - dos filas de una misma textura de signos en WebGL2, dos mitades de un mismo búfer de almacenamiento en WebGPU. Una fila solo se dibuja si su grupo es visible *y* su valor de columna está en un lado. Así, un grupo desmarcado en la [lista de Equipos](teams-list.md), o dejado fuera por el enfoque de bando de la pestaña Partida, no aporta nada sea cual sea la forma de dividir la diferencia.
