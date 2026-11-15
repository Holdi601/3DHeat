---
title: "Memoria y presupuestos"
parent: "Cargar datos"
nav_order: 6
lang: "es"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Memoria, presupuestos y comprobación de cabida

Tu ordenador tiene memoria limitada. 3DHeat suma lo que necesitan tus archivos y te avisa antes de **Cargar** si caben.

![La Estimación de memoria en No cabe, con Cargar cada [N] filas ya rellenado y el botón Cargar diciendo Demasiado grande - reduce o diezma](../assets/img/en/memory-and-budgets-wont-fit.webp)

*¿Demasiado grande para este ordenador? 3DHeat sugiere cargar cada N filas.*

Una pestaña del navegador que se queda sin memoria a mitad de una carga se bloquea y pierde minutos de trabajo, y una GPU a la que se pide más de lo que tiene pierde su contexto o se arrastra hasta casi parar. Por eso, antes de que empiece una carga, el panel Origen dice cuánta memoria necesita, la compara con los presupuestos detectados para esta máquina, y se niega - con una salida - cuando no va a caber. El modelo está en [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## La estimación de memoria {#the-memory-estimate}

Se muestra encima del botón **Cargar** una vez contadas las filas.

| Línea | Significado |
|---|---|
| **Estimación de memoria** - *cabe* / *justo* / *no cabe* | El veredicto, verde, ámbar o rojo. |
| `N filas · B B/fila` | Las filas que se cargarán (tras el paso) y los bytes fijos por fila. |
| `RAM X residente, Y en el pico durante la carga` | Memoria ocupada una vez cargado, y el máximo durante la carga. |
| `GPU Z · carga est. T` | Memoria de GPU para las filas, y una duración estimada a 1,2 millones de filas por segundo. |
| Nombre de la GPU | El nombre del renderizador, cuando el controlador lo informa. |
| Mensajes | Por qué no cabe, o va justo, y qué hacer. |
| **Cargar cada [N] filas** | El paso de diezmado (ver abajo). |
| `Presupuesto: X RAM, Y GPU. Ajusta en Rendimiento → Presupuestos de recursos.` | Los presupuestos que usó la comprobación. |

### Bytes por fila {#bytes-per-row}

| Columna | Fijo (RAM) | Notas |
|---|---|---|
| Posición | 12 | Tres números de coma flotante de 32 bits, siempre (un eje plano sigue siendo un array) |
| Tiempo | 4 | Cuando está asignado |
| Vida útil | 4 | Cuando están asignados tiempo y persona |
| Persona | 4 | Cuando está asignada |
| Grupo | 2 | Cuando está asignado |
| Sesión | 4 | Cuando está asignada |
| `Archivo de origen` | 4 | Cuando se carga más de un archivo |
| Cada columna de filtro | 4 | Por cada columna marcada *Conservar para filtrar* |

El **pico** añade lo que la carga necesita solo de forma transitoria - 8 bytes de tiempo de 64 bits al combinar, 12 bytes de claves de orden e índices, 4 bytes de trabajo para la permutación (los tres cuando el tiempo está asignado), y 4 bytes mientras la columna de grupo sigue en 32 bits - y multiplica la suma por **2,0**. Ese factor se midió (una carga real de varios archivos llegó a 1,9 veces los arrays detallados, por el conjunto de trabajo del decodificador Parquet, las copias que recortan cada columna a su longitud, y la memoria liberada pero no devuelta todavía) y se redondeó al alza, porque una subestimación cuesta una pestaña bloqueada y una sobreestimación solo cuesta un paso innecesario.

En la **GPU** cada fila cuesta 8 bytes (posición y grupo, 16 bits cada uno), más 4 bytes (tiempo y vida útil, 16 bits cada uno) cuando están asignados tiempo y persona. Ver [Residencia de la memoria de GPU](gpu-memory.md). Las texturas de filtro (4 bytes por fila por cada filtro activo) y los inicios de segmento del calor de líneas (8 bytes por fila mientras el modo Líneas está activo) no forman parte de esta estimación.

## La comprobación de cabida {#the-fit-check}

Se comparan tres restricciones ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- el pico de RAM frente al **presupuesto de RAM**,
- los bytes de GPU frente al **presupuesto de GPU**,
- el número de filas frente al **techo de ordenación** de 400.000.000 de filas, cuando hay una columna de tiempo asignada.

Decide el peor de los tres cocientes: hasta el 70 % *cabe*, hasta el 100 % *justo* (debería cargar, pero espera que vaya lento), por encima *no cabe*. Cuando no cabe, el panel nombra la restricción que manda y sugiere:

- cargar cada *N*-ésima fila, con *N* = ⌈filas / filas que caben⌉, ya puesto en la casilla de paso;
- quitar columnas de filtro, desasignar la columna de tiempo (lo que quita la ordenación y su techo, a costa de la línea de tiempo), o subir el presupuesto.

Cuando el presupuesto en sí no es un dato del hardware - el navegador limitó la cifra de RAM, el valor por defecto lo redujo lo que está libre ahora mismo, o la cifra de GPU es una suposición -, el mensaje lo dice, para que no recurras a un paso que no necesitas.

### Diezmado {#decimation}

**Cargar cada [N] filas** conserva una fila de cada *N*, contadas por archivo. El calor es un promedio, así que cada *N*-ésima fila da la misma distribución con más ruido - la misma compensación que ya hace el renderizador en cada fotograma. La casilla empieza en 1 (*fila (todas)*); cuando la selección no cabe, se rellena con el paso sugerido salvo que hayas escrito en ella. El botón Cargar entonces dice *Cargar N archivos (1 de cada K)*, y el nombre del conjunto de datos registra `cada K-ésima fila`.

### El techo de ordenación {#the-sort-ceiling}

El renderizador necesita las filas en orden ascendente de tiempo, así que una columna de tiempo asignada obliga a ordenar cada fila, con una ordenación radix sobre claves de 32 bits ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Por encima de **400 millones** de filas eso se rechaza en lugar de intentarse en una pestaña. Se comprueba antes de la carga, así que una selección por encima del límite se rechaza con una sugerencia de paso, en lugar de leerse entera y fallar en el último paso. Cerca del límite (*justo*) el panel avisa de que la ordenación es una pasada larga sin progreso propio. Sin columna de tiempo no hay ordenación y no se aplica ningún techo.

## Presupuestos de recursos {#resource-budgets}

**Rendimiento → Presupuestos de recursos** (una línea plegable al final del panel Rendimiento, que dice `Presupuestos de recursos - RAM, GPU, núcleos`). Los presupuestos se detectan; la cifra detectada es el valor por defecto; y los deslizadores no llegan más allá de un **techo** que es la cifra detectada salvo cuando se sabe que la detección no es una medición.

| Control | Rango | Significado |
|---|---|---|
| **RAM para datos de filas** | 256 MiB hasta el techo de RAM, logarítmico | El presupuesto de RAM para la comprobación de cabida. Marcado *(por encima de lo detectado)* más allá del valor por defecto detectado, *(máx)* en el techo. |
| **GPU para datos de filas** | 128 MiB hasta el techo de GPU, logarítmico | El presupuesto de GPU para la comprobación de cabida y para subir filas. Marcado *(por encima de lo detectado)* más allá del valor por defecto detectado, *(máx)* en el techo. |
| **Hilos del analizador** | 1 hasta el número de núcleos lógicos | Cuántos archivos analiza una carga a la vez, cada uno en un trabajador propio. Por defecto núcleos - 2 (núcleos - 1 con cuatro núcleos o menos). Ver [Hilos del analizador](#parser-threads) (en Para desarrolladores). |
| Línea de fuentes | | De dónde salió cada cifra (`RAM: …. GPU: …. CPU: ….`). |
| **Volver a detectar** | | Pide al servidor de desarrollo una lectura nueva de memoria y recalcula todos los presupuestos. |
| Nombre de la GPU | | El nombre corto del adaptador; la cadena completa del renderizador está en la información emergente. |

### Subir el presupuesto de GPU {#raising-the-gpu-budget}

Un presupuesto de GPU por encima de la cifra detectada se aplica tal como lo fijas: la comprobación de cabida y la subida toman la misma cifra de una sola función ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), que solo la limita al techo de GPU donde se detiene el deslizador. Así, una carga que la comprobación aprueba se sube entera. Por encima de la cifra detectada, el deslizador dice *(por encima de lo detectado)*: el número es entonces tu juicio sobre la tarjeta, no una medición, y ponerlo más alto de lo que tiene la tarjeta arriesga perder el contexto o un arrastre hasta casi parar.

## Conjuntos de datos enormes: las palancas {#huge-datasets-the-levers}

De la más barata a la más drástica:

1. **Menos columnas de filtro.** Cada una cuesta 4 bytes por fila y una pasada de decodificación.
2. **Un paso.** Cada *N*-ésima fila.
3. **Sin columna de tiempo.** Sin ordenación, sin techo de ordenación, sin 4-8 bytes por fila de tiempo y vida útil - y sin línea de tiempo.
4. **Subir los presupuestos**, cuando sabes que la memoria está ahí.

En el momento de dibujar, los conjuntos grandes se manejan con muestreo y acumulación progresiva en lugar de reducir los datos; ver [Muestreo y presupuestos](sampling-and-budgets.md).

## Para desarrolladores {#for-developers}

### Hilos del analizador {#parser-threads}

Una carga de varios archivos analiza hasta **Hilos del analizador** de ellos a la vez, cada uno en un trabajador analizador que arranca el trabajador de ingesta de esa carga ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Con 1, o con un solo archivo, los archivos se analizan uno tras otro en el propio trabajador de ingesta.

Analizar varios a la vez no afloja la comprobación de cabida:

- **El constructor se cuenta primero.** Las columnas combinadas se reservan para toda la selección antes de leer el primer archivo, así que los archivos en vuelo solo reciben lo que deja el presupuesto de RAM a su lado (`parseHeadroom`): posición, tiempo de 64 bits, ángulos de mirada, persona, grupo de 32 bits, sesión, columnas de filtro y `Archivo de origen`, por fila que se va a cargar - multiplicado por 2,6 cuando el número de filas es una estimación de CSV, para una columna que crece hasta otra más grande.
- **Cada archivo reserva su coste antes de empezar** (`fileParseBytes`): sus filas (del pie de Parquet; la parte de un CSV de la estimación por tamaño) por las mismas columnas, por **8** - el bloque en sí, la copia a su lado mientras se quitan las filas sin posición, y el conjunto de trabajo del decodificador, que para las columnas de texto es mucho mayor que sus ids. Un paso no reduce esto, porque los archivos se leen enteros y se diezman después. El 8 es una holgura fijada por medición: con 3, o con 5, treinta hilos analizadores llevaron una pestaña por encima de su límite con 86 millones de filas con nombres de persona y sesión; con 8 no lo hicieron.
- **Otro archivo arranca solo si su reserva cabe** en lo que queda. Un archivo que ya terminó pero espera a que se combine uno anterior conserva su reserva hasta que se combine.
- **Un archivo siempre se ejecuta.** Cuando no hay nada reservado, el siguiente archivo arranca cueste lo que cueste - esa es la carga de uno en uno que admitió la comprobación de cabida, así que un presupuesto justo recurre a ella en lugar de rechazar.

La cifra de *pico durante la carga* es el pico de una carga de uno en uno, que llega en la ordenación, tras leer todos los archivos. Los archivos analizados en paralelo pueden ocupar más memoria que esa cifra mientras se leen; las reservas la mantienen dentro del presupuesto de RAM, en la medida en que las estimaciones de arriba sean correctas.

El orden de combinación es el orden de la selección, sea cual sea el orden en que terminan los archivos, así que la numeración de persona, grupo y sesión, las filas y los valores de `Archivo de origen` son idénticos a los de una carga de uno en uno. Un archivo que no se puede leer se omite y se lista igual que antes. Un trabajador analizador que muere termina toda la carga, como siempre ocurrió con la muerte del trabajador de ingesta, y cada trabajador analizador se termina cuando acaba la carga, sea cual sea su final. Si los trabajadores analizadores no pueden arrancar en absoluto, los archivos se analizan en el trabajador de ingesta.

### Cómo se detectan las cifras {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) se ejecuta al arrancar, otra vez cuando existe el renderizador, y en **Volver a detectar**.

**RAM, con el servidor de desarrollo.** `start.bat` y `npm run dev` sirven la página desde un proceso que puede leer la memoria de la máquina, en `/__host/memory` (responde en 1,5 s o se ignora). El valor por defecto es el menor entre el 60 % de la RAM instalada y el 80 % de la RAM libre en ese momento; el techo es el 60 % de la instalada. Cuando la memoria libre es lo que reduce el valor por defecto, el panel lo dice y sugiere cerrar programas y pulsar **Volver a detectar**.

**RAM, sin él** (un despliegue estático): ninguna API del navegador informa de la memoria libre, y `navigator.deviceMemory` se redondea a la baja a una potencia de dos y lo limita Chrome y Edge a 8 GiB. El valor por defecto es el 60 % de `deviceMemory`, limitado además a 4 veces el montón JS libre de la pestaña donde el navegador lo informa, o a 4 GiB cuando no se informa nada. Cuando `deviceMemory` marca exactamente 8 (el tope), la cifra se marca como *limitada*, y el techo es 4 veces el valor por defecto, con una nota de que por encima del valor por defecto el número es tu afirmación, no una medición.

**En cualquier caso**, el valor por defecto y el techo de RAM se limitan a **12 GiB**, la memoria de arrays tipados más grande que puede tener una pestaña de Chrome sea cual sea la máquina (una página llegó a unos 15,75 GB y falló; 12 deja sitio para lo demás), y nunca bajan de 256 MiB.

**Memoria de GPU.** Ninguna API web la informa.

- Con el servidor de desarrollo, la memoria de la tarjeta la lee `nvidia-smi` (el adaptador mayor) o, en Windows, el valor del registro del adaptador de pantalla `HardwareInformation.qwMemorySize`. El valor por defecto es el 70 % de ella, el techo el 90 %.
- Sin lectura, se infiere: 2 GiB por defecto; 4 GiB cuando la textura más grande es de 16.384 px o más (una tarjeta dedicada), 1 GiB cuando es menor; o 8 veces el `maxBufferSize` de WebGPU cuando eso es mayor. El techo es entonces 8 veces la cifra inferida, porque la inferencia distingue una pieza integrada de una dedicada y nada más fino. El panel dice que la cifra es inferida.
- Nunca por debajo de 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4 cuando no se informa).
