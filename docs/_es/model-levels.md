---
title: "Niveles 3D"
parent: "Niveles y geometría de fondo"
nav_order: 2
lang: "es"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: true
---

# Niveles 3D

Un nivel 3D es un modelo del lugar - colinas, calles, edificios - en el que están tus datos. Te permite ver en qué piso, colina o tejado está el mapa de calor. El visor divide el modelo en suelo (sólido), estructuras (transparentes, para que puedas mirar dentro) y agua.

## Cargar un nivel 3D {#load-a-3d-level}

1. Carga primero tus datos ([Cómo meter datos](getting-data-in.md)). El modelo debe usar el mismo espacio del mundo y la misma unidad que los datos, con Y hacia arriba.
2. En **Fondo / nivel**, elige un **Objetivo de simplificación**. Déjalo en *Completo - sin simplificar* salvo que el modelo sea enorme.
3. Pulsa **Modelo 3D...** y elige un archivo `.glb`, `.gltf`, `.obj`, `.stl` o `.ply`.
4. Espera la línea de progreso. **Cancelar** lo detiene.
5. Pulsa **F** en la vista. El suelo es sólido, las estructuras son cáscaras transparentes y el agua es plana.
6. Ajusta el aspecto en [Apariencia del nivel](level-appearance.md). Pulsa **Guardar en la biblioteca** para conservar el resultado ([Biblioteca de niveles](level-library.md)).

![Un nivel 3D cargado: suelo opaco con curvas de nivel, edificios transparentes, agua plana](../assets/img/en/model-levels-loaded.webp)

**Modelo 3D...** carga la malla del nivel. Se analiza, se clasifica y se simplifica en un trabajador de segundo plano ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) con una línea de progreso y **Cancelar**: *Leyendo el modelo*, *Analizando el archivo*, *Empaquetando N texturas*, *Clasificando N partes*, *Simplificando el suelo (N triángulos)*, *Simplificando estructuras (N triángulos)*, *Creando la malla de alambre*.

## Formatos {#formats}

| Formato | Qué se lee | Límites |
|---|---|---|
| `.glb` | Cada primitiva de malla con `mode` 4 (triángulos) o sin modo, con la transformación del mundo de cada nodo aplicada; `POSITION`; `COLOR_0` (vec3 o vec4) como color de vértice; la `baseColorTexture` del material y su `TEXCOORD_n` como textura; los nombres de nodo y de malla como nombres de partes. | Las líneas y los puntos se omiten. |
| `.gltf` | Lo mismo. | Solo con los búferes incrustados: un glTF que apunta a un `.bin` externo se rechaza con *Exporta como un único .glb para que la geometría vaya incrustada.* |
| `.obj` | Caras, con los bloques `o` y `g` como partes. | Solo geometría (sin materiales). |
| `.stl` | Binario y ASCII (`solid …`). | Una parte. |
| `.ply` | Solo ASCII. | El PLY binario se rechaza con *Conviértelo a .glb o a .stl binario.* |

Solo geometría: posiciones, normales y triángulos soldados en un búfer, además de colores y coordenadas de textura cuando existen ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Un modelo sin triángulos se rechaza. El modelo debe estar en el mismo espacio del mundo y la misma unidad que los datos (Y hacia arriba): nada se transforma para encajar.

## Suelo, estructuras y agua {#ground-structures-and-water}

Un nivel se divide al importarlo en tres clases, porque piden tratos opuestos ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Suelo** - se dibuja opaco y con sombras de relieve (pendiente, curvas de nivel, una rampa de altura) para poder leer la posición sobre él.
- **Estructuras** - edificios y elementos que se interponen entre la cámara y el calor de dentro, así que se dibujan como una **cáscara transparente** (caras tenues con un borde brillante, más aristas sin duplicados) - o, si tienen textura, sólidas con sus texturas.
- **Agua** - plana, sin pistas del terreno: una curva de nivel que cruza un lago no tiene sentido.

Cada parte (nodo de glTF, objeto de OBJ o grupo) se clasifica por sí misma, según la primera regla que se aplique ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

1. **La etiqueta del exportador.** Un nombre que empieza por `ground:`, `structure:` o `water:` (o con `|` en lugar de `:`) se toma tal cual. Los exportadores propios del proyecto etiquetan cada parte así.
2. **Nombres de agua.** `water` como palabra (no *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Nombres de suelo.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Nombres de estructura.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometría.** Una parte que cubre más del 25 % del área X-Z del mapa, con más del 60 % del área de sus triángulos mirando hacia arriba, es suelo. Una parte con menos del 45 % mirando hacia arriba, o más alta que el 15 % de la altura del nivel mientras cubre menos del 10 % de su área, es una estructura. La parte que mira hacia arriba se pondera por área, así que una casa no se considera plana por tener tejado.
6. **Si no, suelo** - una parte ambigua se toma como suelo, porque una cáscara casi invisible por defecto haría que el nivel pareciera un fallo de dibujo.

Un modelo que es una sola parte clasificada como estructura pasa a ser suelo (*malla única sin nombre - tratada como suelo*).

### Mallas de navegación {#navigation-meshes}

Una parte llamada `nav:…` (por ejemplo `nav:walkable` de un exportador de niveles) es una malla de navegación: dónde puede estar de pie un soldado. Se lista como suelo (*malla de navegación - no se dibuja, porque está sobre el suelo; los clics aún la encuentran*), pero **no se dibuja**. Va colocada sobre el suelo del que se generó, coplanar con él a centímetros, y si se dibujara como suelo las dos superficies pelearían por cada píxel: en un nivel con una textura de suelo horneada, toda el área jugable se veía como parches grises y beige de bordes duros, uno por triángulo de navegación. Se conserva sin simplificar, para que [elegir con clic](camera.md#click-to-pick) pueda decir si un punto es transitable. Las entradas de la biblioteca no la conservan.

**Mostrar la clasificación de partes (N)** en el panel (visible para modelos con más de una parte) lista cada parte con su clase y el motivo - *etiquetada por el exportador*, *el nombre coincide con un patrón*, *cubre X % del mapa, Y % mirando hacia arriba*, *Y % mirando hacia arriba, Z % de la altura del nivel*, *ambigua - se tomó como suelo*. Para cambiar una, renombra la parte en el modelo de origen e importa de nuevo; la división queda fijada en los búferes de índices.

## Simplificación {#simplification}

**Objetivo de simplificación** fija el presupuesto de triángulos para la siguiente importación ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Ajuste | Triángulos |
|---|---|
| *Completo - sin simplificar* (por defecto) | todos |
| *Alto - 8M triángulos* | 8.000.000 |
| *Medio - 3M triángulos* | 3.000.000 |
| *Bajo - 800k triángulos* | 800.000 |
| *Silueta - 100k triángulos* | 100.000 |

El presupuesto se reparte **60 % para las estructuras y 40 % para el suelo**, y se simplifican por separado: las estructuras pierden su forma más rápido con la decimación. El agua no se simplifica. La simplificación es un colapso de aristas con métricas de error cuadrático ([meshoptimizer](https://github.com/zeux/meshoptimizer), mediante WebAssembly), tras soldar los vértices coincidentes, así que las siluetas y los bordes duros se conservan. La nota de importación informa de `origen → triángulos ahora, desviación X %`, del reparto suelo / estructuras / agua entre las partes, y - cuando se usó *Completo* en un modelo de más de 8M triángulos - sugiere *Alto* (hasta 30M) o *Medio* (más). Sin WebAssembly el simplificador no está disponible, y la importación lo dice.

Los niveles de los exportadores propios del proyecto ya tienen presupuesto; el objetivo existe para arte en bruto sin presupuesto detrás.

## Texturas {#textures}

Un `.glb` cuyas partes llevan texturas de color base se dibuja con ellas: una exportación de un circuito de carreras, por ejemplo, trae una por cada baldosa del terreno y una por cada modelo colocado.

La textura del suelo se muestra por defecto cuando existe; las estructuras que llevan texturas empiezan **sólidas, con sus propias texturas** (bordillos, guardarraíles, muros de neumáticos y señales son los bordes de una carretera, no edificios para mirar dentro), con la malla de alambre apagada y el sombreado plano apagado. Ver [Apariencia del nivel](level-appearance.md).

## Niveles grandes {#large-levels}

- Por encima de **300.000** triángulos de estructura, los bordes de las estructuras empiezan apagados y la opacidad de las caras en 35 %: con un borde en cada píxel, el distrito se ve como blanco plano.
- El plano lejano de la cámara se ensancha para ajustarse al nivel ([Niveles](levels.md#what-a-level-does-for-the-heat)).

## Para desarrolladores {#for-developers}

### Atlas de texturas {#texture-atlas}

Cada textura se empaqueta en **un solo atlas** en el trabajador de importación ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), así que el nivel sigue siendo un solo dibujado, un solo muestreador y un solo atributo de coordenadas de textura en ambos backends:

- empaquetado en estantes con el tamaño propio de cada imagen, reducido solo si el conjunto no cabe en **8192 px** en ninguna dirección (el límite de tamaño de textura por defecto de WebGPU);
- un **margen de 16 píxeles** alrededor de cada imagen, y solo los 5 niveles de mip que ese margen protege, para que un letrero lejano nunca muestree la textura de su vecino;
- las **texturas repetidas** siguen repitiéndose. Una imagen cuyo muestreador glTF repite (el valor por defecto de glTF) y cuyas coordenadas de textura salen de 0..1 - una pared de ladrillo cuyo UV va de 0 a 40 a lo largo - pasa a ser una *baldosa*: sus vértices conservan sus propias coordenadas y un número de baldosa de 16 bits, y los sombreadores envuelven la coordenada en el rectángulo de la baldosa píxel a píxel, tomando el nivel de mip de la coordenada sin envolver para que no se vean las costuras. El margen de una baldosa contiene su propio borde opuesto. Un eje cuyo muestreador recorta se recorta; una imagen cuyas coordenadas se quedan dentro de 0..1 se dibuja como antes. Un nivel con baldosas cuesta 4 bytes más por vértice.

### El contrato del exportador {#the-exporter-contract}

Lo que el visor necesita de un nivel, sea cual sea su origen:

- un `.glb` único y autocontenido;
- `POSITION` en float32, primitivas de triángulos;
- nombres de nodo `ground:*`, `structure:*` y `water:*` (cualquier otro se clasifica por las reglas de arriba), y `nav:*` para una malla de navegación, que se conserva pero no se dibuja;
- coordenadas del mundo, **Y hacia arriba**, en la misma unidad que la telemetría, para que los datos queden sobre el nivel sin ningún paso de colocación.
