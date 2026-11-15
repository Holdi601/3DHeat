---
title: "Repetición y escena 3D"
parent: "Análisis de carrera"
nav_order: 52
lang: "es"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Repetición y escena 3D

Repite tus vueltas juntas, como una carrera, y mira dónde se adelanta un coche. Aquí se describe todo lo que se ve en la vista 3D de la pestaña **Análisis de carrera**: las trazadas recorridas, los colores pintados en la pista, los coches y las etiquetas.

![Mapa de causas con los coches alineados 40 m antes de una curva: pista coloreada, dos coches y el poste de bandera](../assets/img/en/race-replay-lined-up.webp)

## El reloj de la repetición {#the-replay-clock}

Un solo reloj controla cada vuelta: segundos de la vuelta de **referencia**. El motor lo avanza en cada cuadro mientras se reproduce (por el tiempo del cuadro × la velocidad de repetición). Al final vuelve a 0 si **Bucle** está activado; si no, se para. El reloj no forma parte del almacén a propósito, para que la barra lateral no se vuelva a dibujar en cada cuadro. El HUD y las gráficas se suscriben a él y se actualizan como mucho una vez por cuadro.

**La duración de la repetición** es la de la vuelta que más dura en el reloj: el tiempo de cada vuelta (menos su desplazamiento en *Alineados*), o el tiempo de la referencia en *Lado a lado*.

## La barra de transporte {#the-transport-bar}

Debajo de la vista, de izquierda a derecha:

| Control | Hace |
|---|---|
| ⏮ | vuelve al inicio (también **Inicio**) |
| ▶ / ❚❚ | reproducir / pausa (también **K**) |
| velocidad | 0,25×, 0,5×, 1×, 2×, 4× |
| deslizador de búsqueda | fija el reloj directamente, en pasos de 0,01 s |
| reloj | `tiempo / duración · metros`: el reloj como tiempo de vuelta, la duración de la repetición, y cuánto ha avanzado por la referencia el coche de referencia |
| *Desde la salida* / *Alineados* / *Lado a lado* | el modo de repetición (abajo) |
| **Alinear aquí** | pone cada coche donde está la referencia ahora, y sigue desde ahí |
| **Bucle** | vuelve a empezar al final (activado por defecto) |
| **Ocultar gráficas** / **Mostrar gráficas** | las gráficas de distancia bajo la barra |

Los botones están desactivados hasta que hay vueltas cargadas (una vuelta basta para repetirla; las comparaciones necesitan dos).

## Modos de repetición {#replay-modes}

Cómo se deduce de este reloj el tiempo propio de cada vuelta:

| Modo | Tiempo de cada vuelta | Qué muestra |
|---|---|---|
| **Desde la salida** (`start`) | el propio reloj | cada vuelta desde su inicio: una carrera entre ellas, con la diferencia creciendo como creció en la pista |
| **Alineados** (`anchor`) | el reloj más el desplazamiento de la vuelta | cada coche en el mismo sitio en el mismo momento, y luego se suelta: lo que pasa desde ese punto en adelante, no desde el inicio de la vuelta |
| **Lado a lado** (`locked`) | el momento en que la vuelta llegó a la distancia actual de la referencia | cada coche mantenido a la distancia de la referencia durante toda la vuelta: velocidades y mandos comparados metro a metro |

Úsalo así:

- **Desde la salida**: quieres ver quién va delante y cómo crece la diferencia.
- **Alineados**: quieres saber qué pasa en una curva o en una recta, con todos partiendo igualados allí.
- **Lado a lado**: quieres comparar lo que hacen los pilotos con los pedales y el volante en el mismo punto del circuito.

**Desplazamientos en *Alineados*:** para un ancla en `s` metros a lo largo de la referencia, el desplazamiento de cada vuelta es su propio tiempo en `s` menos el tiempo de la referencia en `s`. Ambos se leen de las vueltas alineadas (véase [un eje de distancia](race-corner-analysis.md#one-distance-axis)). Una vuelta que no llega a `s` mantiene desplazamiento 0. Elegir *Alineados* desde los botones de modo ancla en la distancia actual de la referencia.

Un poste blanco con bandera (14 m de alto) marca el ancla en el modo *Alineados*.

### Alinear {#lining-up}

| Acción | Ancla | Reloj |
|---|---|---|
| **Alinear aquí** | donde está la referencia ahora | sin cambios |
| Mayús + clic en las gráficas | el metro en el que hiciste clic | 1,5 s antes de que la referencia llegue a él |
| un hallazgo en *Dónde mejorar*, una insignia numerada en la pista, una fila de *Curva a curva* con un hallazgo | 40 m antes de donde empieza la causa del hallazgo | 1,5 s antes de ese punto; luego reproduce |
| un evento de control del coche, la etiqueta de un golpe | 40 m antes del evento | 1,5 s antes; luego reproduce |
| una vuelta en las estadísticas del recorrido | como su hallazgo o evento | como arriba, con esa vuelta enfocada |

Mirar un hallazgo también lo encuadra con la cámara: una esfera alrededor del punto medio del rango del hallazgo, con un radio igual al mayor entre 40 m y la mitad de su longitud más 30 m (60 m para un evento), salvo que la cámara esté siguiendo a un coche.

### Cámara de seguimiento {#chase-camera}

⌖ en la lista de vueltas hace que la cámara siga a ese coche: a 2,5 + 4 × tamaño del coche metros por detrás, y a 0,9 + 1,1 × tamaño del coche metros por encima, mirando en su dirección de marcha e inclinada hacia abajo, hacia el coche. Se suaviza (un 20 % del camino en cada cuadro) para que no tiemble con cada sacudida. ⌖ otra vez la suelta. El coche seguido se dibuja un poco más claro, con un anillo blanco en el suelo, y su tarjeta se resalta.

## La sección Vista {#the-view-section}

| Control | Por defecto | Hace |
|---|---|---|
| **Líneas** / **Mapa de tiempo** / **Mapa de causas** / **Mapa de errores** | Mapa de tiempo | lo que se pinta a lo largo de la pista (abajo); *Líneas* no pinta nada |
| leyenda | - | *gana ↔ pierde* para el mapa de tiempo, los colores de causa para el mapa de causas, *pocas vueltas ↔ casi todas las vueltas* para el mapa de errores |
| **Trazadas recorridas** | activado | la trazada de cada vuelta visible, en su color |
| **Coches** | activado | los coches, y las fuentes de las tarjetas del HUD |
| **Neumáticos y suspensión** | activado | temperatura de los neumáticos, anillos de deslizamiento, varillas de suspensión y otros símbolos por rueda, y luces de techo en los coches |
| **Etiquetas** | activado | nombres de curvas, insignias numeradas, etiquetas de golpes y las etiquetas de curva del mapa de errores |
| **Pista a partir de las vueltas** | activado | una superficie de carretera para un circuito sin modelo extraído (oculta mientras hay un modelo del circuito cargado) |
| **Todos los valores en las tarjetas** | desactivado | cada canal listado en cada tarjeta del HUD |
| **Formas reales de coches** | activado | cada coche con la forma de su equivalente (véase [Los coches](#the-cars)); desactivado: el monoplaza abierto, que no oculta nada de la telemetría |
| **Tamaño del coche** | 1× | de 1× a 10× en pasos de 0,5; 1× es el tamaño real del coche, tan largo y ancho como en el juego. Solo este deslizador lo cambia |

## Trazadas recorridas {#driven-lines}

La trayectoria de cada vuelta visible a través de sus propias muestras, en su color, dibujada 0,12 m por debajo de la posición registrada. (La posición registrada de un coche es su punto de referencia, que en circuitos de Forza extraídos está de 0,28 a 0,47 m por encima de la carretera.) Se guarda un punto cada 1,5 m. Con más de 10 vueltas visibles, las que no se miran guardan uno cada 6 m, porque cada vértice va a la GPU en cada cuadro.

## Los mapas {#the-maps}

Los tres son cintas a lo largo de la trayectoria de **referencia**, 0,2 m por debajo de las posiciones registradas, con un cuadrilátero por cada paso de 2 m de la cuadrícula.

### Mapa de tiempo (`where`) {#time-map-where}

Para la vuelta enfocada: segundos ganados o perdidos por metro frente a la vuelta con la que se compara en ese punto (la mejor de su clase o, para la referencia, la vuelta más rápida en cada tramo). Se calcula a partir del cambio del delta alineado por paso de cuadrícula, suavizado en ±10 m. Rojo donde pierde tiempo, verde donde gana, gris en medio. La escala de color es el percentil 95 de los valores absolutos, así que los picos se recortan y la mayor parte de la vuelta queda en rango. 6 m de ancho.

### Mapa de causas (`why`) {#cause-map-why}

Para la vuelta enfocada: cada pérdida se pinta sobre el rango donde está su **causa** (no donde se ve el tiempo), coloreada por el grupo de la causa. Si dos se solapan, gana la más cara. Ancho `3 + 9·√(coste / coste mayor)` metros; donde no se perdió nada, una franja gris de 2 m. El hallazgo seleccionado en *Dónde mejorar* se pinta en blanco.

| Grupo | Color | Hallazgos |
|---|---|---|
| frenada | naranja | pérdidas de conducción en la fase de frenada |
| entrada | magenta | pérdidas de conducción al entrar y por el medio |
| salida | azul | pérdidas de conducción a la salida |
| recta | amarillo | pérdidas de conducción en la recta |
| coche | gris | lo que explica el coche |
| contexto | gris oscuro | la situación (una salida de carrera frente a una vuelta lanzada) |

### Mapa de errores {#mistake-map}

Cuántas de todas las vueltas (de las clases elegidas en las estadísticas del recorrido) cometieron un error en cada metro: de cualquier tipo, o solo del elegido en las estadísticas. Cada vuelta cuenta una vez por metro. El rango de cada error se ensancha 6 m a cada lado, para que uno corto se vea. Ancho `3 + 10·(vueltas / más vueltas)` metros, y un color que va del marrón apagado al naranja brillante; gris de 2 m donde ninguna vuelta cometió ninguno. Véase [Estadísticas del recorrido](race-course-statistics.md#the-mistake-map).

## Pista a partir de las vueltas {#track-from-the-laps}

Para un juego cuyo circuito no se ha extraído, se dibuja una carretera bajo las líneas: tan ancha como se reparten las vueltas a lo largo de la referencia (cuentan los desplazamientos laterales dentro de 25 m), más 2 m a cada lado, y al menos 4 m a cada lado de la línea de referencia. Se suaviza en ±8 puntos de cuadrícula (±16 m), en gris asfalto con líneas de borde claras, 0,3 m por debajo de las posiciones registradas. Está oculta mientras hay un modelo de circuito cargado en **Nivel**.

## Golpes y choques en la pista {#hits-and-crashes-on-the-track}

Los golpes y choques de cada vuelta visible (véase [Eventos de control del coche](race-control-events.md#hits-and-crashes)) se marcan donde ocurrieron, siempre que se dibujen las líneas o los coches: una estrella puntiaguda, roja para un choque y ámbar para un golpe, sobre un poste, con un anillo del color de la vuelta en su base. El tamaño sigue al del coche (los choques, más grandes). Cuando un coche pasa por el momento de un golpe, desde ahí se extiende un anillo de choque durante 0,8 s.

## Modo de ayuda {#help-mode}

**?** junto al selector de idioma, o la tecla **?** o **F1**, muestra una clave de cada color que hay en pantalla, en las tres pestañas ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). La elección se mantiene en este navegador.

- **La clave** en la esquina de la vista lista los colores de la pestaña y del modo en uso. Cada escala viene de donde la vista la toma, así que una escala de calor que hayas editado se muestra como editada. En la pestaña de carrera, solo aparece lo que traen las vueltas cargadas.
- **La tarjeta de cada coche** gana una tabla de lo que se dibuja en sus ruedas, por nombre, con el valor de cada rueda en el color con que se dibuja.
- **El coche enfocado** recibe una etiqueta junto a cada rueda que dice lo mismo, colocada hacia fuera, en las esquinas. Se oculta cuando el coche es tan pequeño en pantalla que no caben.

## Los coches {#the-cars}

**Cada coche con su propia forma**, en el color de su vuelta y a su tamaño real. Las formas vienen de un archivo de coches, que se hace una vez en la máquina en la que está el juego:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Sin ese archivo, cada coche se dibuja como **el coche propio del visor** de su tipo y época: berlina, cupé, compacto, familiar, deportivo, superdeportivo, muscle car, todoterreno, pickup, furgoneta o microcoche, cada uno como clásico (antes de 1980), de los años 80 y 90, o moderno ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Estos se construyen aquí a partir de proporciones generales: sin logotipos, sin nombres de modelo y sin nada de los archivos de ningún juego, así que vienen con el visor. El tipo sale del nombre del coche, y la época, del año que aparezca en él. Un coche sin ninguno de los dos toma su tipo de su clase. Se conocen unas cien generaciones reales por su longitud, anchura, altura y batalla publicadas ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); una línea por coche, redondeada), así que un BMW Serie 3 de los 90 tiene el tamaño y la postura de ese coche, aún como una forma sencilla, sin emblema ni parrilla.

El archivo de coches se hace en tu propia máquina, a partir de tu copia del juego. Contiene un modelo de bajo detalle de cada coche, de unos 900 triángulos, con sus posiciones de rueda (véase [el comando `cars` del extractor](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)).
**Cargar archivo de coches...** en los ajustes de la vista, o soltar el archivo en la pestaña de carrera, lo carga; se queda en este navegador. Contiene las formas del juego, así que no es algo para pasar a otros, y el visor no trae ninguno.

Qué coche hace de sustituto de los de una vuelta se calcula cada vez a partir de lo que está cargado, y nunca se guarda. Así, un coche que hoy no tiene equivalente recibe el suyo en cuanto un archivo más nuevo lo trae ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Coche de la vuelta | Se dibuja como |
|---|---|
| su número está en el archivo del mismo juego | ese mismo coche |
| misma marca, y una palabra del modelo en el nombre | ese modelo, el más cercano en años |
| misma marca, misma generación | el coche de esa marca más cercano en años |
| cualquier otro caso, con archivo de coches | el de la misma marca más cercano si lo hay; si no, el mismo tipo de carrocería, el más cercano en años |
| un monoplaza, por su nombre | el monoplaza de abajo |
| ninguno de los dos primeros, y el visor conoce el coche por su tamaño | el coche propio del visor al tamaño real de ese coche, con archivo o sin él |
| cualquier otro caso sin archivo | el coche propio del visor de ese tipo y época |

Así, una vuelta del BMW 1990 Serie 3 de otro juego muestra un BMW de más o menos ese año, y un coche más nuevo que el archivo muestra su pariente más cercano hasta que el archivo se vuelve a hacer. La información sobre herramientas de una vuelta, y la línea bajo el tamaño del coche de la vuelta enfocada, dicen cómo se dibuja y lo cerca que está.

Los coches propios del visor tienen ventanillas oscuras. Los modelos de un archivo de coches son de un solo color en toda su superficie, porque el archivo no tiene pintura ni cristales en los que basarse. Las ruedas, las luces traseras, los faros y los símbolos de telemetría de abajo se dibujan como en el monoplaza. La varilla de empuje sube por el exterior de la rueda, donde se puede ver, y los triángulos de suspensión se omiten.

**El monoplaza** es un monoplaza de ruedas descubiertas en el color de la vuelta, para que el frente se vea desde cualquier ángulo y nada tape las ruedas: chasis, cubierta del motor, pontones, cabina con casco, halo, suelo, alerones delantero y trasero; cuatro ruedas redondas, las delanteras giradas por el volante (hasta 0,5 rad a tope), cada una sobre dos triángulos de suspensión con su montante, barra de dirección (delante) o semieje (detrás), y una varilla de empuje. El modelo baja 0,3 m desde la posición registrada para que sus ruedas toquen la carretera, y se escala con **Tamaño del coche**.

**La carrocería se mueve sobre sus muelles**: cuando la vuelta trae los cuatro recorridos de suspensión, cada esquina baja según su recorrido (exagerado a 0,12 m desde el extremo de extensión hasta el de compresión para que se vea desde una cámara de seguimiento), y la carrocería se hunde, cabecea y se inclina sobre el plano que forman las cuatro.

**Lo que se dibuja a partir de la telemetría** (con *Neumáticos y suspensión* activado) sigue la [tabla de canales](race-charts-and-hud.md#the-channel-table):

| Símbolo | Desde | Dibujo |
|---|---|---|
| color del neumático | `tireTemp` | el neumático mismo, azul frío → cian → verde en trabajo → amarillo → rojo caliente, entre 40 y 130 °C |
| anillo de deslizamiento | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (el mayor) | un anillo en el suelo bajo la rueda: verde con agarre de sobra, ámbar en 0,66, rojo en 1 (el borde del agarre tal como lo informa el juego); tenue por debajo de 0,3 |
| barra de suspensión | `suspension` (0..1) | la varilla de empuje coloreada por el recorrido: azul extendida, blanca a medio recorrido, roja comprimida |
| brillo de freno | `brakeTemp` (100-900 °C) | un disco en la cara exterior de la rueda, de oscuro a naranja |
| banda de desgaste | `tireWear` (0..1) | una banda alrededor del borde de la banda de rodadura: blanca si está nuevo, roja si está gastado |
| barra de carga | `wheelLoad` (0-12 000 N) | un poste junto a la rueda tan alto como la carga |

Las luces de freno (la de lluvia y los extremos de alerón) se encienden con el pedal del freno. Cada canal `lamp` que está encendido (por encima de la mitad de su rango) enciende una luz sobre la caja de aire de su color: ABS activo, control de tracción activo, DRS, limitador de boxes, freno de mano, en el aire.

**En una multitud** (más de 10 visibles), los coches que no se miran se dibujan sencillos: carrocería, alerones, ruedas y luz de freno solamente.

## Etiquetas {#labels}

Fijadas a la pista y colocadas en cada cuadro según la proyección de la cámara (fuera de pantalla o detrás de la cámara, se ocultan). Con **Etiquetas** activado:

| Etiqueta | Dónde | Clic |
|---|---|---|
| nombres de curva (`T1`, `T2` …) | sobre el vértice de cada curva en la referencia | - |
| insignias numeradas 1-5 | las cinco mayores pérdidas de conducción de la vuelta enfocada, en el centro del rango de cada causa, con borde del color de la causa; al pasar el ratón, título y coste | alinea y repite ese hallazgo |
| etiquetas de golpe / choque | sobre cada estallido de la vuelta **enfocada**: «Choque −45 km/h» / «Golpe −12 km/h»; al pasar el ratón, la descripción completa y el consejo | alinea y repite el impacto |
| etiquetas de curva del mapa de errores (en lugar de los nombres de curva y las insignias, cuando el mapa es el de errores) | el vértice de cada curva: «T3 · 5/40 frenada temprana» (el error más común, vueltas que lo cometieron / vueltas que tomaron la curva), «T3 · 5/40» cuando se elige un tipo, «T3 · limpia» cuando no hay ninguno; al pasar el ratón, las pérdidas de la curva y sus cinco errores más comunes | abre o cierra esa curva en las estadísticas del recorrido |

## Mundos reflejados {#mirrored-worlds}

El mundo del visor es de mano derecha, con Y hacia arriba: visto desde arriba, un coche cuya dirección de marcha `atan2(dx, dz)` crece está girando a la izquierda. Un juego con mundo de mano izquierda (Forza entre ellos) sale reflejado: cada curva a derechas se dibuja como una a izquierdas, tanto el recorrido como las vueltas.

Las vueltas lo indican por sí mismas ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): recorriendo cada vuelta de 3 m en 3 m, el giro de su trazada se compara con la compresión de la suspensión exterior (`suspension.FR` menos `suspension.FL`) y, sin suspensión, con la dirección (positiva hacia la derecha en todos los adaptadores). Una vuelta que gira menos de π en total no dice nada; la evidencia cuenta cuando supera el 2 % del giro. Las vueltas votan, y un empate es «no se puede saber».

Cuando el veredicto de las vueltas no coincide con la inversión de ejes actual (un número impar de ejes invertidos en **Cámara y escena → Invertir un eje del mundo**), la sección **Vueltas** lo dice bajo la lista:

- el juego sale reflejado y no hay nada invertido: «Estas vueltas giran a la derecha donde el recorrido se dibuja girando a la izquierda…» con **Invertir X**;
- los ejes están invertidos pero las vueltas no salen reflejadas: «Los ejes invertidos dibujan estas vueltas reflejadas…» con **Restablecer los ejes**.

Solo cambia el dibujo: un reflejo incorporado a la matriz de vista. Los datos, el análisis y cada coordenada que muestran las herramientas siguen siendo los del juego. La inversión se guarda en el navegador. El análisis nombra las curvas a izquierdas o a derechas con la misma medida (un mundo desconocido se toma como reflejado, como el de Forza).

## Para desarrolladores {#for-developers}

Código: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Qué es un coche en un momento {#what-a-car-is-at-a-moment}

`stateAt` interpola cada canal entre las dos muestras que rodean el tiempo de la vuelta. Los canales que saltan (marcha, banderas) toman la muestra más cercana. Una vuelta que ya ha terminado se queda aparcada en la línea.

**Rumbo.** La dirección de marcha sale de posiciones separadas unos metros (al menos 2 m a cada lado, para que una sacudida no haga girar el coche). El rumbo de la carrocería sale de la guiñada del juego solo cuando está ajustada a la dirección de marcha (signo y desfase, por media circular de las muestras a más de 10 m/s, al menos 20), y solo si entonces coincide con ella (varianza circular por debajo de 0,05, unos 18° de dispersión). Si no, la carrocería apunta en la dirección de marcha. Así se ve un derrape (carrocería y trayectoria separadas) sin fiarse de la convención de ángulos de un juego.

**Dirección y lados.** Hacia qué lado gira el coche con una dirección positiva, y a qué lado pertenecen las ruedas derechas del juego, se miden a partir de la vuelta: la dirección frente al giro de la trazada, y qué lado de la suspensión se comprime en la parte exterior de las curvas (sin datos de suspensión, los juegos de Forza se toman como reflejados).
