---
title: "Profundidad y descarte"
parent: "Modos de calor"
nav_order: 4
lang: "es"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Profundidad y recorte

La profundidad hace que colinas y muros oculten el calor que hay detrás, igual que un muro real oculta a una persona. El recorte por distancia deja solo el calor entre una distancia cercana y una lejana a la cámara.

![Una cámara baja detrás de una colina, con Ocultar tras el terreno desactivado (izquierda) y activado (derecha)](../assets/img/en/depth-and-culling-terrain.webp)

![Recorte por distancia con Lejos a 400 m y Cortar también el nivel activado: una porción del mapa alrededor de la cámara](../assets/img/en/depth-and-culling-far.webp)

Sin profundidad, un mapa de calor sobre un [nivel](levels.md) 3D es una capa plana: todo lo que contiene el conjunto de datos brilla a través de cada muro con toda su fuerza, las pistas de profundidad que da el nivel se anulan, y un punto caliente dentro de un edificio se ve igual que uno en su tejado. La sección **Profundidad** hace que el nivel oculte lo que queda detrás de él; **Recorte por distancia** restringe el calor a una cáscara o losa alrededor de la cámara; el [Corte](slice.md) saca una losa del mundo. Los tres se aplican a los modos de calor y cambian qué filas contribuyen, así que al cambiarlos se reinicia la acumulación.

## Profundidad {#depth}

Los dos controles necesitan un [nivel](levels.md): una imagen de mapa o un modelo 3D. Sin nivel cargado no hay nada detrás que ocultar, y no hacen nada. Ambos están apagados mientras [Aplanar sobre el plano del suelo](sprite-shape.md#flatten-onto-ground-plane) está activado.

### Ocultar tras el terreno {#hide-behind-terrain}

**Ocultar tras el terreno** (activado por defecto): un punto de datos cuya superficie más cercana hacia la cámara es el *suelo* (no una estructura) se elimina por completo, no se atenúa.

El terreno y los muros son opacos de maneras distintas. Miras *a través* de un muro a propósito, para ver en qué piso estaba el tráfico; nunca quieres mirar a través de una colina, porque detrás de ella está el lado lejano del mapa. En un mapa de kilómetros, eso es la mayor parte de los datos, y se suma a lo largo del horizonte formando una franja más brillante que cualquier cosa del primer plano. Un solo atenuador no puede servir para ambos casos, así que el terreno tiene un corte y los muros conservan el atenuador de abajo.

### Oculto tras la geometría {#hidden-behind-geometry}

**Oculto tras la geometría** (por defecto 0,8): cuánto se atenúa un punto de datos que está detrás de la geometría del nivel. El valor se lee como *se ve a través* en 0, *N % más oscuro* en los valores intermedios (la posición del deslizador, no el atenuado medido), y *totalmente oculto* en 1.

Cada muro o suelo entre un punto y la cámara lo atenúa más: un muro deja unos pocos por ciento con el valor por defecto, y cada superficie adicional reduce a la mitad lo que queda, hasta cuatro superficies. Con 1 no se dibuja nada detrás de la geometría, y ese es el ajuste más barato.

Mira también [Apariencia del nivel](level-appearance.md).

## Recorte por distancia {#distance-culling}

**Recorte por distancia** (cerrado por defecto) restringe el calor a las filas comprendidas entre un límite cercano y uno lejano desde la cámara. Pon un límite lejano para leer la densidad dentro de un edificio sin que el lado lejano del mapa se sume encima; pon un límite cercano para volar *a través* de un punto caliente en lugar de hacia él.

| Control | Por defecto | Rango (tirador) | Significado |
|---|---|---|---|
| **Cerca** | apagado | 0,5-5000 m, logarítmico; el 5 % inferior de la pista = apagado (200.000) | Las filas más cercanas que esto se omiten. |
| **Lejos** | apagado | 1-200.000 m, logarítmico; inferior = apagado (10.000.000) | Las filas más lejanas que esto se omiten. |
| **Cortar con un plano** | activado | | Mide los límites a lo largo del eje de la vista en lugar de desde el ojo, así que el corte es un plano paralelo a la pantalla y no una esfera a tu alrededor. El borde de una esfera se curva al alejarse en el encuadre y se desliza cada vez que giras; un plano se queda donde lo pusiste. |
| **Cortar también el nivel** | activado | | Corta el suelo, las estructuras y el agua con los mismos límites. Si el nivel se deja entero, el corte elimina los puntos de datos y deja el edificio de pie delante de ellos; si se cortan los dos, es una sección del mapa y los puntos quedan apoyados contra sus muros y suelos. Este solo vuelve a dibujar; no reinicia la acumulación. |

### Teclado {#keyboard}

El límite lejano es un control que se barre: lo recorres por un edificio y miras en qué piso aparece el tráfico. Por eso está en el teclado mientras vuelas ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Tecla | Efecto |
|---|---|
| `]` | Aleja el límite lejano con un factor de 1,12 (Shift: 1,35) |
| `[` | Lo acerca con el mismo factor |
| `\` | Desactiva el límite lejano, o lo vuelve a activar a la distancia en que se dejó (6000 la primera vez) |

Los pasos son geométricos porque el rango útil abarca cuatro órdenes de magnitud, desde una habitación hasta un mapa. El teclado mantiene el límite lejano entre 100 y 400.000. Las teclas no hacen nada mientras un cuadro de texto o un menú tiene el foco.

## Para desarrolladores {#for-developers}

### Ocultar tras el terreno {#hide-behind-terrain}

Las estructuras se dibujan en una textura de profundidad propia. Un fragmento que está detrás de la profundidad de la escena, pero *no* detrás de la profundidad de las estructuras, está detrás del suelo, y se descarta. Cuesta una pasada de profundidad sobre las estructuras, que se omite cuando el interruptor está apagado.

### Oculto tras la geometría {#hidden-behind-geometry}

Se cuenta **por superficie**. Una sola comparación de profundidad solo puede decir «hay algo delante», así que un punto detrás de un muro y un punto a cuatro habitaciones dentro de un edificio se atenuarían igual, y el interior se vería como una sola mancha tenue. En su lugar, la geometría de las estructuras se **pela por profundidad** en hasta 3 capas adicionales ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Cada fragmento cuenta cuántas superficies tiene delante (la profundidad propia de la escena más las capas peladas: hasta cuatro), y la atenuación se compone:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Deslizador | 1 superficie | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25 % | 12,5 % | 6,25 % | 3,1 % |
| 0,8 (por defecto) | 4 % | 2 % | 1 % | 0,6 % (suelo) |
| 1,0 | no se dibuja | no se dibuja | no se dibuja | no se dibuja |

Por qué dos factores: el deslizador está calibrado para que un muro deje unos pocos por ciento (el aspecto que se lee como «detrás de algo»), y unos pocos por ciento compuestos no serían nada al tercer muro; reducir a la mitad por cada superficie adicional mantiene cuatro escalones distinguibles. Por qué al cuadrado: con una respuesta lineal, un campo saturado seguía saturado detrás de un muro; una cuarta potencia lo borraba con 0,8. Por qué un suelo: ocultar por completo el calor tapado hace que una habitación llena de tráfico oculto parezca una habitación vacía, sin nada que sugiera usar el [Corte](slice.md). Solo un deslizador fijado en 1 lo oculta del todo, y es el ajuste más barato, porque los puntos tapados se descartan.

Cómo ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), los shaders de calor de puntos): la comparación se hace por fragmento, contra la textura de profundidad de la escena, en **profundidad de ventana** y no en distancia en el mundo. Una lectura de la textura de profundidad en la etapa de vértices devuelve «lejos» en todas partes en algunos drivers (entre ellos el rasterizador por software de ANGLE), y linealizar ambas profundidades a metros pierde la separación por precisión con un rango cercano/lejano amplio. El sesgo es un radio de sprite convertido a unidades de ventana más unos pocos bits menos significativos, así que un punto de datos apoyado en una superficie no se sombrea a sí mismo.

Las estructuras se dibujan translúcidas, pero se dibujan en la profundidad que lee la oclusión; un nivel cuyas estructuras no llegaran a la textura de profundidad solo ocluiría contra el terreno.

### Recorte por distancia {#distance-culling}

Los dos límites se evalúan en el shader de vértices, así que una fila recortada cuesta un vértice y ningún fragmento.
