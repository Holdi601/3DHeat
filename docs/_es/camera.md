---
title: "Cámara y controles"
nav_order: 14
has_children: true
lang: "es"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Cámara y controles

Vuelas por la escena como un pájaro: **W A S D** para moverte, arrastra el ratón para mirar. Usa esta página para volar, para saltar a una vista desde arriba o de lado, y para leer exactamente dónde está la cámara.

## Volar en 4 pasos {#fly-in-4-steps}

1. Haz clic una vez en la vista para que tenga el teclado.
2. Mantén **W** para volar hacia delante, **S** hacia atrás, **A** y **D** a los lados, **Espacio** hacia arriba, **Q** hacia abajo.
3. Mantén pulsado el botón izquierdo o el derecho del ratón y arrastra para mirar alrededor.
4. Pulsa **F** para encuadrar otra vez todos los datos.

La cámara es una cámara libre de vuelo con proyección en perspectiva y paralela, vistas predefinidas, una pose escrita a mano y profundidad de campo. Sus ajustes están en el panel **Cámara y escena**, al final de la barra lateral (también se ve en las pestañas Análisis de carrera y Partida). La implementación está en [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Volar {#flying}

| Entrada | Efecto |
|---|---|
| `W` `A` `S` `D` o las teclas de flecha | Hacia delante (a lo largo de la vista, incluido su cabeceo), izquierda, atrás, derecha |
| `Espacio` o `E` | Arriba (arriba del mundo) |
| `Q` o `Ctrl` izquierdo | Abajo |
| `Mayús` (mantenida) | 6 veces más rápido |
| `Alt` izquierdo (mantenido) | 15 % de velocidad |
| Arrastrar con el botón izquierdo o derecho del ratón | Mirar alrededor. El puntero se bloquea mientras arrastras. |
| Rueda del ratón | Velocidad de vuelo ×1,5 por muesca (perspectiva); zoom (paralela) |
| `F` | Encuadrar los datos |
| Clic (sin arrastrar) | Mostrar lo que hay bajo el puntero ([Inspeccionar la vista](#inspecting-the-view)) |
| `C` | Copiar la posición, la guiñada y el cabeceo de la cámara |
| `G` | Ir a un punto escrito |
| `Esc` | Cerrar la tarjeta de selección (y dejar de seguir una unidad) |

### Mientras sigues una unidad {#while-following-a-unit}

Cuando la cámara sigue una unidad en una repetición ([Repetición de partida](match-replay.md)), las teclas de vuelo hacen otra cosa:

| Entrada | Efecto |
|---|---|
| Rueda, `W` / `S` | Más cerca de la unidad / más lejos (más arriba / más abajo en la vista satélite) |
| `A` / `D`, `Q` / `E` | Orbitar alrededor de la unidad (vistas de persecución y órbita) |
| Arrastrar | Mirar alrededor de la unidad (cabina: mirar dentro) |
| `V` / `Mayús+V` | Vista de cámara siguiente / anterior |
| `Esc` | Primero deja de mirar a la segunda unidad, luego deja de seguir |

Las teclas de movimiento se suman con un [mando](gamepad.md); mira la [referencia de teclado](keyboard-reference.md) para todo lo demás. Las teclas se ignoran mientras un cuadro de texto o una lista desplegable tiene el foco. El cabeceo se limita justo antes de mirar recto arriba o abajo.

## Panel Cámara y escena {#camera--scene-panel}

![El panel Cámara y escena: Proyección, Vistas predefinidas, botones de Campo de visión, Velocidad de vuelo y Pose](../assets/img/en/camera-panel.webp)

### Proyección {#projection}

**Proyección**: *Perspectiva* (por defecto) o *Paralela*.

*Paralela* (ortográfica) quita el escorzo, así que dos puntos calientes de la misma densidad se leen del mismo tamaño en cualquier parte del encuadre - la comparación para la que existe un mapa de calor - y es lo que hace isométrica una vista isométrica. En modo paralelo la rueda del ratón hace zoom (no hay movimiento hacia delante que cambie la escala) y la [indicación de velocidad](#fly-speed) se oculta.

**Cambiar mantiene el mismo tamaño del objeto.** Una proyección paralela no tiene campo de visión, así que su altura de tronco no tiene relación con la distancia de la cámara; cambiar a lo bruto hace un zoom salvaje o no muestra nada. Al pasar a paralela, la altura del tronco se fija a lo que la cámara en perspectiva abarca a la distancia de enfoque (2 × distancia × tan(fov / 2), siendo la distancia de enfoque la del último encuadre). Al volver, se restaura la pose en perspectiva que dejaste, con la misma escala aparente, en lugar de donde hubiera ido la vista paralela.

### Vistas predefinidas {#preset-views}

| Grupo | Botones | Orientación |
|---|---|---|
| **Isométrica** | **NE**, **NO**, **SE**, **SO** | Paralela, cabeceo -35,264° (= atan(1/√2), el ángulo en el que los tres ejes se proyectan con la misma longitud), guiñada -45°, 45°, -135°, 135°. Cuatro esquinas, porque una sola siempre oculta la mitad del mapa detrás de lo que está más cerca. |
| **Alzados** | **Superior**, **Inferior**, **Frontal**, **Trasera**, **Izquierda**, **Derecha** | Paralela. Superior mira recto hacia abajo (cabeceo -89,9°), Inferior recto hacia arriba, Frontal a lo largo de -Z (guiñada 0°), Trasera a lo largo de +Z (180°), Izquierda a lo largo de -X (-90°), Derecha a lo largo de +X (90°). |
| | **Volver a perspectiva** | Vuelve a la pose en perspectiva que dejaste. Desactivado en perspectiva. |
| | **Vista de tres cuartos** | Perspectiva, guiñada -35°, cabeceo -28°. |

Cada vista predefinida cambia la propia proyección - en perspectiva, una "vista superior" sigue convergiendo hacia un punto de fuga y las áreas iguales dejan de leerse como iguales - y encuadra los datos desde esa dirección.

### Campo de visión {#field-of-view}

**Campo de visión** - el ángulo vertical. Por defecto 65°, de 10 a 140° en la barra (179° con la manija), con los botones **Plano 20°**, **Largo 35°**, **Normal 50°**, **Amplio 65°**, **Muy amplio 90°**. Un campo estrecho aplana la perspectiva y se parece más a una proyección paralela; uno amplio exagera la profundidad y hace difícil juzgar las distancias. Sigue activo en modo paralelo, donde fija la escala que resuelve el cambio de vuelta y la distancia que usa **Encuadrar**.

### Velocidad de vuelo {#fly-speed}

**Velocidad de vuelo** - unidades del mundo (metros) por segundo a plena potencia. Por defecto 120; en cada carga, la extensión horizontal de los datos / 12. Logarítmica, de 0,02 a 20.000 (200.000 con la manija; la manija la cambia por proporciones, no por cantidades). La rueda del ratón la multiplica o divide por 1,5 por muesca, dentro de 0,02 a 200.000.

El mismo valor aparece abajo a la derecha de la vista (solo en perspectiva): la velocidad en m/s o km/s y el tiempo que tarda en cruzar los datos (o el nivel, cuando hay un nivel 3D cargado) a esa velocidad. Arrástrala hacia arriba o hacia abajo para cambiar la velocidad.

### Cerca y lejos {#near-and-far}

Las distancias de recorte **Cerca** (por defecto 0,5) y **Lejos** (por defecto 40.000). Ambas se recalculan a partir de los datos en cada carga (cerca = max(0,05; extensión / 20.000), lejos = extensión × 12) y se amplían, nunca se estrechan, por un nivel 3D más grande ([Niveles](levels.md#what-a-level-does-for-the-heat)). Su relación fija la precisión de profundidad en la que se apoya la oclusión, así que un cerca muy pequeño con un lejos enorme debilita la [oclusión](depth-and-culling.md). Vista desde fuera de la escena o desde muy arriba de su suelo, el plano cercano usado de verdad se aleja hasta el 2 % de esa distancia, para que un mapa visto desde muy arriba conserve suficiente precisión de profundidad y el agua y la orilla no parpadeen; el cuadro sigue mostrando el valor fijado.

### Otros controles {#other-controls}

| Control | Por defecto | Significado |
|---|---|---|
| **Invertir Y** | desactivado | Invierte el mirar del ratón arriba/abajo. |
| **Profundidad de campo** | desactivado | Ver abajo. |
| **Mando** | activado | Ver [Mando y HOTAS](gamepad.md). |
| **Pose** | | Ver abajo. |
| **Inspeccionar** | | La lectura de la cámara, el clic para elegir, la convención de guiñada e *Ir a un punto*; ver [Inspeccionar la vista](#inspecting-the-view). |
| **Encuadrar datos (F)** | | Ajusta los datos (en la pestaña Análisis de carrera: las vueltas) a la vista, manteniendo la dirección actual. La cámara se coloca a r / tan(fov / 2) del centro, siendo r la mitad de la diagonal de los límites de los datos. |
| **Cuadrícula**, **Ejes** | activada, activados | Una cuadrícula en el suelo con un espaciado 1/2/5 × 10ⁿ de alrededor de 1/40 de la extensión de los datos (llega hasta 1,5 veces los datos, entre 8 y 120 pasos de cuadrícula), y ejes de colores. |
| **Invertir eje del mundo** X, Y, Z | desactivados | Ver abajo. |

### Pose {#pose}

Cinco cuadros numéricos - **X**, **Y**, **Z** y **guiñada °**, **cabeceo °** - que siguen a la cámara mientras ninguno tiene el foco. Escribe un valor y pulsa `Enter` (o sal del cuadro) para mover la cámara allí. **copiar** pone `pos X Y Z · guiñada A · cabeceo B` en el portapapeles (con `(guiñada del juego)` detrás cuando se elige esa convención). Volar es la forma de explorar; las coordenadas son la forma de reproducir una vista. Son los mismos números que la [lectura de la cámara](#camera-readout): las coordenadas propias de los datos, también cuando un eje está invertido, y la guiñada en la [convención](#yaw-conventions) elegida.

### Invertir eje del mundo {#invert-world-axis}

**Invertir eje del mundo X / Y / Z** dibuja el mundo con ese eje al revés. Un juego que mantiene un mundo zurdo sale espejado en este visor derecho - curvas a la derecha dibujadas como curvas a la izquierda - e invertir X o Z lo devuelve. **Solo cambia el dibujo**: los datos, el análisis y cada coordenada que muestran las herramientas (pose, regla, corte) siguen siendo los del juego. La vista se voltea en su sitio, manteniéndote mirando el mismo punto. Este ajuste se recuerda en el navegador (clave `localStorage` `heat3d.mirror`); compáralo con los [volteos](axes-units-and-time.md#flips) al cargar, que sí cambian los datos.

## Inspeccionar la vista {#inspecting-the-view}

Dónde está la cámara, qué hay bajo el puntero y cómo ir a un punto - el bloque **Inspeccionar** del panel Cámara y escena, y dos capas en la esquina superior izquierda de la vista. El código está en [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) e [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Control | Por defecto | Significado |
|---|---|---|
| **Posición de la cámara sobre la vista** | activada | La lectura de la cámara, abajo. Se cierra también con su **×**. |
| **El clic muestra lo que hay** | activado | Elegir con clic, abajo. |
| **Convención de guiñada** | Visor | Qué guiñada muestran y leen la lectura, los cuadros de pose y el cuadro de salto. |

Estos tres se recuerdan en el navegador (clave `localStorage` `heat3d.inspect`).

### Lectura de la cámara {#camera-readout}

En la esquina superior izquierda de la vista: la **x**, **y**, **z**, **guiñada** y **cabeceo** de la cámara, en vivo, con una etiqueta que nombra la convención de guiñada. Muestra los mismos números que los cuadros de [Pose](#pose) y no cuesta nada al volar (se escribe en la página con el reloj de fotogramas, sin volver a dibujar los paneles).

- **copiar** (o `C` en cualquier sitio fuera de un cuadro de texto) pone `x X y Y z Z guiñada A cabeceo B (guiñada del visor)` en el portapapeles, con decimales `.` sea cual sea el idioma - una línea que el cuadro de salto, y cualquier script, puede leer de vuelta.
- **ir a** (o `G`) abre un cuadro debajo: pega un punto y pulsa `Enter` para mirarlo, o pega una pose completa copiada para situarte en esa vista. `Esc` cierra el cuadro.

### Coordenadas: el marco propio de los datos {#coordinates-the-datas-own-frame}

Cada coordenada que muestran o aceptan las herramientas de inspección está en el **marco propio de los datos cargados**: se deshace la [asignación de ejes](axes-units-and-time.md) de la carga (eje vertical, volteos, escala). Una posición leída de la vista es el número que guarda la tabla de origen, y un número de la tabla escrito en el cuadro de salto cae en ese punto. Cuando la asignación no cambia nada (una carga con Y hacia arriba y sin escalar - que es lo que escriben las herramientas de captura y los exportadores de niveles) es simplemente el mundo; si no, la lectura lleva una etiqueta **marco de datos**. Sin un conjunto de datos, las coordenadas son las del mundo. La guiñada y el cabeceo son siempre respecto al mundo del visor, con Y hacia arriba.

### Convenciones de guiñada {#yaw-conventions}

| Convención | La guiñada 0° mira a lo largo de | Crece hacia | La usan |
|---|---|---|---|
| **Visor** | -Z | -X | la cámara de vuelo, las [vistas predefinidas](#preset-views) |
| **Juego / herramientas de captura** | +X | -Z | las columnas `yaw` y las poses de las herramientas de captura; en un nivel exportado en el marco del visor, la guiñada propia del juego |

El cabeceo es el mismo en ambas: hacia arriba desde la horizontal. Las dos se diferencian en un cuarto de vuelta y nada más:

> guiñada del visor = guiñada del juego - 90°

Una dirección `d` es `(cos p · cos y, sen p, -cos p · sen y)` en la convención del juego y `(-sen y · cos p, sen p, -cos y · cos p)` en la del visor. Elige **Juego / herramientas de captura** para escribir una guiñada tal cual sale de una tabla de captura, o para comparar la lectura con una.

### Ir a un punto {#going-to-a-point}

**Ir a un punto**, en el bloque Inspeccionar (y en el cuadro **ir a** de la lectura):

- el cuadro de texto acepta `x, y, z` o `x y z` (o `x; y; z`), con punto decimal o coma decimal - `-321.6, 137.8, -59.9` y `-321,6 137,8 -59,9` son el mismo punto. Cinco números añaden una guiñada y un cabeceo, y una pose copiada de la lectura o de los cuadros de pose se lee completa, con etiquetas y convención incluidas;
- **guiñada °** y **cabeceo °** (opcionales) giran la cámara, en la convención elegida;
- **Mirar a** conserva el rumbo (inclinado para mirar hacia abajo al menos 20° si miraba de frente) y retrocede a lo largo de él hasta la distancia actual, manteniéndose entre el 0,3 % y el 3 % de la anchura de la escena - de 6 a 60 m en un nivel de dos kilómetros. La distancia de enfoque, la altura de la vista paralela y la velocidad de vuelo se ajustan, para que la vista llegue utilizable;
- **Ponerse aquí** coloca la cámara en el punto, girada a la guiñada y el cabeceo dados, o como estaba.

Una pose pegada con su propia guiñada y cabeceo siempre se sitúa en esa vista.

### Elegir con clic {#click-to-pick}

Un clic en la vista - pulsar y soltar sin arrastrar más de 4 píxeles; un arrastre sigue mirando alrededor - muestra una tarjeta arriba a la izquierda con lo que hay bajo el puntero. Mientras la [regla](measure.md) está activa, los clics van a la regla.

**Un punto de datos dibujado gana.** La muestra más cercana a menos de 8 píxeles del clic, entre las realmente dibujadas: las filas de la ventana de tiempo y la vida útil, que pasan los [filtros](filters.md), los grupos mostrados y la división de diferencias, dentro del recorte por distancia y un corte que recorta el calor. En la repetición de cajas, una caja bajo el puntero (en cualquier parte de ella). La tarjeta lista cada columna que lleva la fila, con los nombres de columna propios de la fuente - tiempo (hora de reloj, o los segundos propios del archivo con `m:ss.ss`), persona, grupo, sesión, cada columna conservada, la posición y la dirección de mirada - y la distancia desde la cámara. En memoria solo están las columnas que la carga conservó: una columna no elegida como [columna de filtro](column-mapping.md) no se muestra.

**Si no, la superficie del nivel**: el punto donde el rayo del clic toca los triángulos reales del nivel (no el plano de referencia de la regla), con la **parte** a la que pertenece (el nombre del exportador, `structure:props`, `ground:terrain …`), su **tipo** (suelo, estructura, agua, imagen de mapa), las coordenadas y la distancia. La geometría oculta por un corte o por el recorte por distancia se deja pasar. Cuando el nivel tiene una [malla de navegación](model-levels.md#navigation-meshes), una línea la nombra y dice si el lugar está sobre ella (✓). Un nombre de parte con el prefijo `≈` se adivinó a partir de las cajas envolventes de las partes, porque esa parte del nivel se simplificó al cargarlo.

La tarjeta se queda hasta que la cierras (**×**, `Esc`), otro clic responde a otra cosa, o un clic en un espacio vacío. En la escena se dibuja una cruz cian en el punto y, sobre la pantalla, un anillo encima. Sus botones: **copiar** (cada valor, y las coordenadas como `x, y, z`), **Mirar a**, y **Ponerse aquí** (en un punto de datos, mirando como miraba la fila cuando tiene una dirección de mirada; en una superficie, a 1,7 m por encima).

El nivel se indexa para elegir en el primer clic que lo necesita: una cuadrícula de columnas sobre su huella, construida unos milisegundos cada vez entre fotogramas para que la vista nunca se detenga (cerca de un segundo de trabajo para un nivel de varios millones de triángulos), y se conserva hasta que cambia el nivel. Hasta entonces la tarjeta dice *Preparando el nivel para elegir* con un porcentaje, y responde al clic cuando está listo. Una búsqueda de punto de datos sobre más de cuatro millones de filas dibujadas se reparte entre fotogramas de la misma forma.

## Profundidad de campo {#depth-of-field}

Una sección plegable en Cámara y escena, titulada *Profundidad de campo - activada* mientras está activa. Desactivada por defecto: es un efecto de presentación, y la vista por defecto debe mostrar los datos y no una interpretación de ellos.

| Control | Por defecto | Rango (manija) | Significado |
|---|---|---|---|
| **Activada** | desactivada | | |
| **Enfocar lo encuadrado** | activado | | Enfoca a la distancia que usó el último encuadre (*Enfocado a N m.*). |
| **Distancia de enfoque** | 1000 | 1-200.000, logarítmica (10.000.000) | Se muestra cuando el enfoque es manual. |
| **Apertura** | ±35 % | ±2 % a ±200 %, logarítmica (±3200 %) | La profundidad que se mantiene nítida, como fracción de la distancia de enfoque - relativa y no un número f, porque las escenas van de una habitación a un mapa de ocho kilómetros. |
| **Desenfoque máximo** | 12 px | 1-48 (256) | El radio de desenfoque más grande; el coste crece con él. |

Desenfoca el **nivel, la cuadrícula y las cajas** - *no el calor*. El calor en un píxel es la suma de sprites a muchas profundidades, así que no tiene una única profundidad en la que estar desenfocado; desenfocarlo según la geometría que hay detrás sería incorrecto donde flote delante. Además, los datos nítidos sobre un contexto suavizado son lo más útil de las dos cosas. El desenfoque es una recogida de 24 muestras en ángulo áureo en el paso de composición, ponderada para que un primer plano nítido no se corra hacia fuera por el fondo borroso que hay detrás. Cambiarlo vuelve a dibujar sin reiniciar la acumulación de calor.

## Resolución del lienzo {#canvas-resolution}

El lienzo se dibuja a la relación de píxeles de la pantalla, con un tope de 2. El búfer de calor puede dibujarse a una resolución menor que esa ([Resolución del calor](performance-and-stats.md)).

## Páginas de esta sección {#pages-in-this-section}

- [Mando y HOTAS](gamepad.md)
- [Referencia de teclado y ratón](keyboard-reference.md)
