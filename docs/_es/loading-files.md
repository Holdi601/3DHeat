---
title: "Cargar archivos"
parent: "Cargar datos"
nav_order: 1
lang: "es"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Cargar archivos

Esta página muestra cómo darle tus archivos a 3DHeat y qué hace con ellos. Suelta
una carpeta, y el programa elige los archivos que tienen posiciones y los une en una
sola imagen.

1. Abre **Origen** arriba, en la barra lateral de la pestaña Mapa de calor.
2. Suelta archivos o una carpeta en la zona de soltar, o pulsa **Archivos…** o
   **Carpeta…**.
3. Lee la línea de selección y la **Estimación de memoria** (véase la imagen de
   abajo).
4. Pulsa **Cargar**.

![El panel Origen tras soltar una carpeta de diez partidas: 1 la línea de selección, 2 la Estimación de memoria en "cabe", y 3 Cargar 10 archivos](../assets/img/en/loading-files-source.webp)

*Tras soltar una carpeta, 3DHeat te dice qué ha encontrado y si cabe.*

Los archivos se cargan en el panel **Origen**, arriba de la barra lateral de la
pestaña Mapa de calor. Todo lo que se selecciona de una vez se convierte en **un**
conjunto de datos.

## Elegir archivos {#choosing-files}

| Control | Qué hace |
|---|---|
| **Suelta archivos o una carpeta aquí** (la zona de soltar) | Suelta cualquier mezcla de archivos y carpetas. Las carpetas se recorren de forma recursiva. Al hacer clic en la zona de soltar se abre el mismo selector que **Archivos…** |
| **Un archivo…** | Un selector de archivos para un único archivo. |
| **Archivos…** | Un selector de archivos que acepta varios. |
| **Carpeta…** | Un selector de carpetas (el selector `webkitdirectory` del navegador); se ofrece cada archivo del árbol de la carpeta. |

Los selectores aceptan los tipos de archivo de la [lista de archivos cargables](data-formats.md#files).
En resumen: `.parquet`/`.pq` se leen como Parquet, `.csv`/`.tsv`/`.txt` como texto
delimitado, `.acmi` (Tacview), `.json`/`.json.gz` de OCAP y los formatos GPS (GPX,
KML, KMZ, NMEA, IGC, FIT) pasan por sus propios lectores, y los contenedores
`.3dheat` de partidas se cargan como las tablas que contienen (véase [Un archivo por
partida](container.md)). Un contenedor que no se puede leer se omite como *no es un
archivo csv/parquet*.

Las carpetas soltadas se recorren hasta 12 niveles de profundidad y como máximo 20 000
archivos, como protección contra bucles de enlaces simbólicos y árboles
descontrolados.

## Qué archivos se conservan {#which-files-are-kept}

Antes de leer nada, la selección se filtra ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Un archivo con otra extensión se omite: *no es un archivo csv/parquet*.
- Un archivo de 0 bytes se omite: *vacío (0 bytes)*.
- **Los archivos auxiliares del convertidor** - los datos sin procesar que un
  convertidor guarda junto a la tabla de una partida, `<partida>.messages.parquet`,
  `.events.parquet`, `.raw.parquet` y los demás de la lista en [Los convertidores
  guardan todo](converters.md) - se omiten: *un archivo auxiliar del convertidor*.
  Para abrir uno, elígelo o suéltalo solo (o solo con auxiliares): una selección hecha
  solo de auxiliares los carga como cualquier tabla. El JSON que acompaña a una tabla
  (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`,
  `.session.json` y `.hints.json`) nunca se ofrece como posiciones.
- **La regla del archivo de movimiento.** Si algún archivo de la selección se llama
  `movement*.parquet`, `movement*.csv` (y las demás extensiones) - `movement.parquet`,
  `movement_1.parquet` y así sucesivamente -, entonces se omite cualquier otro archivo
  de datos: *no es un archivo de movimiento, y esta carpeta tiene archivos de
  movimiento*. Las exportaciones de telemetría suelen tener una tabla de posiciones
  junto a decenas de tablas sin posiciones, y solo la primera se puede dibujar. Una
  carpeta sin ningún archivo de movimiento carga todos sus archivos de datos. Ejemplo:
  una carpeta con `movement_1.parquet`, `kills.parquet` y `shop.parquet` carga
  `movement_1.parquet`; los otros dos aparecen como omitidos. Ejemplo: una carpeta con
  `movement_1.parquet`, `kills.parquet` y `shop.parquet` carga `movement_1.parquet`;
  los otros dos aparecen como omitidos.
- Los archivos conservados se ordenan por su ruta dentro de la selección, así que la
  misma carpeta siempre produce el mismo conjunto de datos y los mismos colores.

El panel muestra entonces la selección (el nombre de un único archivo, o `carpeta (N
archivos)` usando la carpeta común más larga), el número de archivos, su tamaño total y
el número total de filas - exacto cuando todos los archivos son Parquet, marcado con `≈`
cuando alguno es CSV. Los archivos omitidos aparecen con su motivo, los cuatro primeros
por nombre.

## Leer el esquema {#reading-the-schema}

El **primer** archivo de la selección se abre para describir el esquema ("Leyendo el
esquema"): sus nombres de columna, sus primeras 50 filas de datos, qué columnas parecen
numéricas y, en Parquet, el tipo lógico de cada columna y la entrada `heat3d` del pie
del archivo. Una carpeta de exportaciones de una misma tabla comparte un esquema, así
que un archivo representa a todos. Después se mide cada archivo ("Contando filas"): el
pie de un Parquet da el recuento exacto en una lectura pequeña; el recuento de un CSV se
estima a partir de la longitud media de línea de su primer megabyte.

El panel de [Asignación de columnas](column-mapping.md) se abre con las suposiciones
automáticas, y la [estimación de memoria](memory-and-budgets.md) aparece encima del
botón **Cargar**.

## Mensajes antes de cargar {#messages-before-loading}

Bajo la selección, el panel lista, desde [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Errores** (rojo): la carga no puede empezar: menos de dos ejes de posición, la
  misma columna en dos ejes, una columna asignada que no está en el archivo, una
  columna de posición que no parece numérica, una columna de tiempo cuyos valores
  muestreados son texto mientras la unidad es un número (cada fila se leería como NaN y
  caería en el tiempo 0), una columna de tiempo en ISO-8601 cuyos valores muestreados no
  se pueden leer como fecha, una escala de unidad de 0.
- **Avisos** (ámbar): se cargará, pero probablemente no como se pretendía: una columna de
  grupo que toma un valor distinto en la mayoría de las filas muestreadas (así que es un
  id, no un grupo), una columna de tiempo `DATE` (cada fila de un día comparte un mismo
  instante), una dirección de mirada puesta sin sus columnas.
- **Notas**: lo que implica la asignación: dibujo en un plano cuando un eje no está
  asignado, sin línea de tiempo sin columna de tiempo, sin trayectorias sin columna de
  persona, y sin columna de grupo un solo color para todo y una diferencia que solo puede
  dividirse por una columna guardada para filtrar.

## Cargar {#loading}

El botón **Cargar** lee *Cargar archivo*, *Cargar N archivos*, o *Cargar N archivos (1 de
cada K)* cuando hay un [paso de submuestreo](memory-and-budgets.md#decimation). Lee
*Demasiado grande - reduce o submuestrea* y está desactivado cuando la [comprobación de
ajuste](memory-and-budgets.md#the-fit-check) dice que la carga no cabe; también lo está
mientras la asignación tenga errores o mientras otra carga esté en marcha.

Mientras carga, el panel muestra el paso actual (con `[archivo/archivos]` delante cuando
hay varios), las filas leídas hasta ahora, una barra de progreso y **Cancelar**. Cancelar
termina el worker de ingesta y, con él, los workers de análisis que haya lanzado.

La página sigue dibujando mientras carga, porque el trabajo ocurre en segundo plano. Ves
el paso actual, las filas leídas, una barra de progreso y **Cancelar**. Tras el último
archivo, el panel muestra los pasos *Poniendo las filas en orden temporal*, *Reordenando
columnas (n de m)*, *Midiendo la extensión*, *Construyendo la lista*, *Resumiendo las
sesiones* y *Calculando las duraciones de vida*, y luego *Subiendo N filas a la GPU* durante
un cuadro, para que una subida larga nunca se confunda con un bloqueo.

### Cómo funciona {#how-it-works}

La carga se ejecuta en un Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)).
Con varios archivos y más de un [hilo de análisis](memory-and-budgets.md#parser-threads),
se analizan **a la vez** hasta ese número de archivos, cada uno en su propio worker de
análisis ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)),
hasta donde deje espacio el presupuesto de RAM; aun así se unen de uno en uno, en el orden
de la selección, así que el conjunto de datos es el mismo que con una carga uno a uno.
Mientras varios están en curso, la línea de progreso nombra el archivo que informó por
última vez, y la barra y el recuento de filas suman todos los archivos en curso. Con un
solo hilo, o con un solo archivo, los archivos se analizan uno tras otro en el propio
worker de ingesta. Solo se leen las columnas que nombra la asignación: una columna no
asignada de un archivo Parquet no cuesta nada; un CSV se recorre byte a byte, pero solo
se decodifican los campos asignados.

## Varios archivos forman un conjunto de datos {#several-files-become-one-dataset}

Cuando se carga más de un archivo ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Una sola lista.** Las personas, grupos, sesiones y valores de categoría son diccionarios
  compartidos por todos los archivos, así que el mismo jugador en dos exportaciones es una
  persona con una sola trayectoria.
- **Un solo origen de tiempo.** Los tiempos se guardan como segundos de 64 bits al unir y se
  reubican sobre el tiempo más temprano de *toda* la selección; luego se guardan como
  segundos de 32 bits desde ese origen. Cuatro exportaciones de cuatro tardes se colocan en
  su orden real, no apiladas unas sobre otras.
- **Un solo orden temporal.** Las filas de todos los archivos se ordenan por tiempo con una
  ordenación radix (véase [el límite de ordenación](memory-and-budgets.md#the-sort-ceiling)).
- **Una columna `Source file`.** Cada fila recuerda de qué archivo viene, como una columna de
  categoría llamada `Source file`. Aparece en [Filtros](filters.md) y como *Source file -
  comparar dos cargas* en la [división de diferencia](difference.md). Una carga de un solo
  archivo no la tiene: una columna constante costaría 4 bytes por fila para no decir nada.
- **Columnas que faltan.** Un archivo que no tiene una de las columnas de *filtro* simplemente
  no aporta valores para ella. Un archivo que no tiene una columna de *papel* asignada (X,
  tiempo, persona, ...) falla con *el archivo no tiene la columna "nombre"*; en una carga de
  varios archivos ese archivo se omite y los demás se cargan igualmente, y los archivos
  omitidos aparecen en el conjunto de datos. Una carga de un solo archivo que falla informa
  del error.
- **Aviso de faltantes.** Cuando las filas cargadas son menos del 95 % de las filas contadas
  antes, el conjunto de datos lleva un aviso con la proporción que falta - por archivos
  ilegibles o por filas sin una posición utilizable, que se descartan al entrar.

## Después de cargar {#after-loading}

El nuevo conjunto de datos reemplaza al anterior. En cada carga ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- se borran todos los filtros y la visibilidad de los grupos;
- la división de diferencia por grupo se reinicia: la primera mitad de los grupos (redondeando
  hacia arriba) positiva, el resto negativo;
- el radio de los sprites se fija en la extensión horizontal / 120 y la saturación en una
  estimación analítica; el tamaño del cubo, la longitud del rayo de mirada, la velocidad de
  vuelo y los planos cercano y lejano se fijan según la extensión (véase [Sesiones, personas y
  grupos](sessions-persons-groups.md#entity-size));
- la sesión de la repetición de caja se fija en la sesión con más filas;
- las rutas de calor de línea se vuelven a suponer ([Calor de línea](line-heat.md));
- el modo de vista vuelve a **Calor** si el modo actual no lo admiten los nuevos datos; la línea de
  tiempo vuelve a **Todo** sin columna de tiempo, y el historial a **Acumulado** sin duraciones
  de vida;
- el cabezal de reproducción se coloca al inicio y la reproducción se detiene;
- la cámara encuadra todo el conjunto de datos desde la dirección por defecto (mirando a lo
  largo de -Z, inclinada unos 36° hacia abajo).

El panel **Conjunto de datos** muestra entonces el nombre del conjunto (la selección, el número
de filas y de archivos, y el paso si se usó uno), `N equipos · N personas · N s de extensión`,
y cada aviso que produjo la carga, en ámbar, mientras el conjunto esté cargado. **Descargar**
en ese panel quita el conjunto de datos.
