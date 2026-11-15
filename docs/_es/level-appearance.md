---
title: "Apariencia del nivel"
parent: "Niveles y geometría de fondo"
nav_order: 3
lang: "es"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Apariencia del nivel

Estos controles cambian cómo se ve un nivel 3D, para que el calor destaque sobre él y aun así puedas leer el lugar. Nada de aquí cambia los datos.

## Inicio rápido {#quick-start}

1. Carga un nivel 3D ([Niveles 3D](model-levels.md)).
2. En **Fondo / nivel**, baja **Brillo** hasta que el calor sea lo más brillante de la pantalla.
3. Abre **Relieve del suelo** y sube **Sombreado por pendiente** o **Intensidad de las curvas de nivel** hasta distinguir una colina de una llanura.
4. Abre **Estructuras**. Baja **Opacidad de las caras** para ver dentro de los edificios, o activa **Textura de las estructuras** para verlos sólidos.
5. Si el suelo tiene una imagen pintada, prueba **Textura del suelo** desactivada y activada.

![Las secciones Relieve del suelo y Estructuras abiertas, con el nivel mostrado con pistas de relieve](../assets/img/en/level-appearance-sections.webp)

Con un [nivel 3D](model-levels.md) cargado, el panel Fondo / nivel muestra estos controles. Los valores por defecto son los que recibe un nivel recién importado ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Cambiarlos solo vuelve a dibujar la escena; la acumulación del calor se conserva.

## El nivel completo {#the-whole-level}

| Control | Por defecto | Rango | Significado |
|---|---|---|---|
| **Opacidad** | 100 % | 0-100 % | Por debajo de 100 % el nivel se mezcla y no escribe profundidad, así que ya no [oculta](depth-and-culling.md) el calor. |
| **Brillo** | 0,9 | 0-2 (tirador 64) | |

El nivel se dibuja desaturado: suelo gris, una cáscara con tinte. Así el calor es lo único saturado de la pantalla. A diferencia de una [imagen de mapa](map-images.md), un nivel 3D no tiene deslizador de Desaturar.

## Relieve del suelo {#ground-relief}

Desde lejos, una colina y una llanura se ven del mismo gris, así que el visor añade tres pistas. Cada una responde a un fallo distinto:

| Control | Por defecto | Significado |
|---|---|---|
| **Separación de las curvas de nivel** | según el rango de altura del suelo | Altura entre líneas de nivel, logarítmica de 1/4000 a 1/2 del rango de altura del nivel; el extremo inferior de la pista es *apagado*. Por defecto es 1/40 del rango de altura del suelo, redondeado a un paso 1/2/5: líneas de 10 m sirven para una ladera y no sirven en el fondo de una cantera. Cada 5.ª línea se dibuja más fuerte. Las curvas de nivel se dibujan en el espacio de pantalla, así que tienen un píxel de ancho a cualquier zoom, y son la única pista que sobrevive en un suelo tan poco inclinado que no se sombrea. |
| **Intensidad de las curvas de nivel** | 35 % | 0-100 % |
| **Sombreado por pendiente** | 55 % | Oscurece según la inclinación, así que los taludes y los acantilados se leen desde cualquier ángulo de cámara; a diferencia de una luz, que se aplana cuando la miras de frente. |
| **Rampa de elevación** | 50 % | El terreno bajo, más oscuro; el terreno alto, más claro, a lo largo del rango de altura del suelo: la forma a gran escala. |

El encabezado de la sección muestra el estado de las curvas: *cada N m*, la separación de las curvas, o *sin curvas de nivel* cuando la separación está apagada.

## Superficie del suelo {#ground-surface}

| Control | Por defecto | Se muestra cuando | Significado |
|---|---|---|---|
| **Agua** | activado | el nivel tiene agua | Lagos, ríos y mar, dibujados planos en gris azulado pálido: ninguna de las pistas del terreno se aplica a una superficie que es plana por definición. |
| **Opacidad del agua** | 60 % | el agua está activada | La costa y el suelo bajo las zonas poco profundas se ven a través del agua translúcida. |
| **Triángulos del suelo** | 30 % (0 en un nivel con texturas) | siempre | Los propios bordes del terreno, dibujados sobre la superficie sombreada, y que se desvanecen entre el 6 % y el 25 % del ancho del nivel desde la cámara. Muestra lo grueso que fue el muestreo del suelo y da a una pendiente algo con qué juzgar la distancia. Se construye al usarlo por primera vez, lo que tarda un momento en un nivel grande. |
| **Suelo solo en malla de alambre** | desactivado | siempre | Sustituye la superficie del terreno por sus aristas. Es totalmente esquemático: también renuncia al sombreado, a las curvas de nivel y a la oclusión, así que *Triángulos del suelo* suele ser mejor opción. |
| **Textura del suelo** | activado | el nivel tiene texturas | Dibuja el suelo con las texturas que trae el archivo (asfalto, arcén, hierba). La iluminación de la malla se aplica suavemente encima, porque la textura ya lleva su propio relieve fino. **Brillo** es la forma de atenuarla bajo el calor; Desaturar pertenece a las imágenes de mapa. |
| **Color capturado** | desactivado | el nivel tiene colores por vértice | Sombrea el suelo con el color que captó un escaneo en lugar de gris: una carretera reconstruida, si no, sería indistinguible del arcén. Las exportaciones de motores no traen ninguno; cuando falta, el panel dice *Este nivel no tiene color.* |

## Estructuras {#structures}

El encabezado **Estructuras** muestra el número de triángulos de estructura; la indicación de abajo dice cómo se dibujan (*dibujadas sólidas con sus propias texturas* o *dibujadas como una cáscara transparente para que veas el calor dentro*) y cuántas partes son estructuras.

| Control | Por defecto | Significado |
|---|---|---|
| **Textura de las estructuras** | activado cuando las estructuras traen texturas | Dibuja las estructuras sólidas, con sus propias texturas. Al activarlo, la opacidad de las caras pasa a 100 % y se apagan las aristas; al desactivarlo, vuelve a la cáscara con tinte y transparente al 25 %. Una estructura con textura se ilumina desde el lado que ve la cámara, porque un cartel son dos caras espalda con espalda, y cuál gana la prueba de profundidad depende del redondeo. |
| **Aristas de malla de alambre** | activado; desactivado por encima de 300.000 triángulos de estructura o cuando tiene texturas | Aristas sin duplicados de las estructuras, una línea por arista. |
| **Opacidad de las aristas** | 50 % | |
| **Caras de la carcasa** | activado | Una superficie tenue con un borde brillante de Fresnel, para que un edificio se lea como un volumen y no como una jaula o un banco de niebla. |
| **Opacidad de las caras** | 25 % (35 % por encima de 300.000 triángulos de estructura, 100 % con textura) | 0-60 % en la pista, hasta 100 % con el tirador. Mantenla baja: las estructuras sólidas ocultan los datos de dentro. |
| **Aristas vivas** | activado (desactivado con textura) | Sombrea cada triángulo según su propia normal, calculada en el shader de fragmentos a partir de las derivadas del espacio de pantalla. Los niveles exportados están soldados y traen normales promediadas, lo que redondea cada esquina de caja hasta parecer «lámina derretida»; separar cada vértice para arreglarlo multiplicaría el búfer de vértices. Desactívalo en un nivel cuyas superficies curvas importen más que sus esquinas. |
| **Tinte de las estructuras** | Cian | Un selector de color y los preajustes **Cian**, **Ámbar**, **Violeta**, **Blanco**. |
| **Mostrar la clasificación de partes (N)** | | Cada parte, su clase y el motivo; mira [Niveles 3D](model-levels.md#ground-structures-and-water). |

## Recortar el nivel {#cutting-the-level}

El [Corte](slice.md) y, con *Cortar también el nivel*, el [recorte por distancia](depth-and-culling.md#distance-culling) cortan el suelo, las estructuras y el agua en los mismos planos que el calor.
