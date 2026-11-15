---
title: "Panel de rendimiento y estadísticas"
parent: "Detalles del renderizado"
nav_order: 7
lang: "es"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Panel de rendimiento y estadísticas

El recuadro de arriba a la derecha de la vista muestra lo duro que trabaja el visor: cuántos fotogramas por segundo, cuántos puntos dibuja y si todavía está afinando la imagen. El panel **Rendimiento** le permite cambiar calidad de imagen por velocidad.

## La capa de estadísticas {#the-stats-overlay}

El recuadro de arriba a la derecha de la vista en las pestañas Mapa de calor y Partida ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Lee los datos en vivo del motor en cada fotograma de animación.

![La capa de estadísticas sobre la escena de muchas partidas, con llamadas numeradas: 1 Backend, 2 FPS, 3 Fotograma, 4 Filas en la ventana, 5 Sprites / fotograma, 6 Presupuesto, 7 Resol. del calor, 8 Cobertura](../assets/img/en/performance-stats-overlay.webp)

| Línea | Significado |
|---|---|
| **Backend** | *WebGPU* o *WebGL2*. Pase el ratón por encima para ver el motivo por el que no se usó WebGPU, cuando no se usó. Véase [Los dos motores](backends.md). |
| **FPS** | Fotogramas por segundo, promediados durante al menos 0,4 s. |
| **Fotograma** | Tiempo de fotograma en ms, suavizado (90 % del anterior, 10 % del nuevo). Es el tiempo entre fotogramas, no el tiempo de GPU: no se mide el tiempo de GPU por pase. |
| **Filas en la ventana** | Filas candidatas: las filas de la ventana de tiempo actual, antes del filtrado por fila en el shader. |
| **Sprites / fotograma** | Sprites que envió el plan del último fotograma (se mantiene la cifra planificada en los fotogramas inactivos, que no dibujan nada). |
| **Presupuesto** | El presupuesto de sprites con el que se planificó este fotograma: el valor del controlador adaptativo, subido a todos los candidatos cuando se dibuja cada fila. |
| **Resol. del calor** | La resolución del búfer de calor como proporción del lienzo: el ajuste *Resolución del calor* multiplicado por la escala adaptativa de la segunda etapa. |
| **Cobertura** | Cuánto ha avanzado la acumulación progresiva hacia el uso de todas las filas: un porcentaje mientras converge (ámbar), *exacta* cuando termina. Un fotograma con ruido nunca se confunde con la imagen terminada. |
| **Cubos** | Cajas dibujadas en la [repetición de cajas](box-replay.md). |
| **No residente** | Solo se muestra cuando las filas no cupieron en el presupuesto de GPU: cuántas. Véase [Permanencia de memoria de GPU](gpu-memory.md). |

## La velocidad de vuelo {#the-speed-display}

Abajo a la derecha de la vista, solo en perspectiva: la velocidad de vuelo y el tiempo que tarda en cruzar los datos a esa velocidad. Arrástrela para cambiar la velocidad. Véase [Cámara y controles](camera.md#fly-speed).

## Si el visor va lento {#if-the-viewer-is-slow}

Mire la capa de estadísticas y después:

1. **Filas en la ventana muy superiores a Sprites / fotograma, y Cobertura por debajo del 100 %**: el fotograma no puede dibujarlo todo; converge en varios fotogramas cuando está parado. Estreche la ventana, filtre o descarte para reducir los candidatos; o acepte el muestreo.
2. **Sprites / fotograma igual a Filas en la ventana, y el fotograma sigue lento**: el coste es por sprite en pantalla. Baje el *Radio máximo en píxeles* ([Forma del sprite](sprite-shape.md#pixel-clamps)) o la *Resolución del calor*.
3. **Lento con pocas filas**: probablemente es el nivel, con muchas estructuras y los bordes activados, triángulos de suelo o profundidad de campo. Véase [Apariencia del nivel](level-appearance.md).
4. **Todo lento y un aviso rojo**: renderizado por software ([Detección de renderizado por software](software-rendering.md)).

## El panel Rendimiento {#the-performance-panel}

| Control | Por defecto | Efecto |
|---|---|---|
| Nota | | En cada fotograma se vierte un subconjunto aleatorio estratificado de las filas visibles, con un peso ajustado para compensar; así el calor esperado es exacto con cualquier presupuesto. Si la vista se mantiene quieta, se siguen fusionando fotogramas hasta que cada fila haya aportado. |
| **Dibujar todas las filas en cada fotograma** | activado | Cada fotograma que empieza una estimación nueva dibuja todas las filas candidatas (hasta unos 268 M); el presupuesto de abajo pasa a ser un mínimo. [Muestreo y presupuestos](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Presupuesto adaptativo** | activado | Ajusta los sprites por fotograma, y después la resolución del calor, para mantener la tasa de fotogramas objetivo; y deja de recortar cuando recortar no ayuda. [Muestreo y presupuestos](sampling-and-budgets.md#the-adaptive-budget) |
| **FPS objetivo** | 60 | 20-240 (1000 con la rueda de ajuste). Los valores por debajo de 15 se tratan como 15. |
| **Sprites iniciales / fotograma** / **Sprites / fotograma** | 4,00 M | 65.536-268.435.456, en escala logarítmica. Se llama *Iniciales* mientras el adaptativo está activado, porque el controlador lo mueve. |
| **Resolución del calor** | 100 % | 25-100 %. El coste de los fragmentos crece con el cuadrado: al 50 % el trabajo de mezcla se reduce a una cuarta parte, y el campo de calor es tan suave que apenas se nota. |
| **Refinamiento progresivo** | activado | Acumula entre fotogramas mientras la vista está quieta. Desactivado muestra la estimación de un solo fotograma en cada fotograma. [Acumulación](accumulation.md) |
| **Presupuestos de recursos** | detectados | Presupuestos de RAM, GPU e hilos del analizador. [Memoria y presupuestos](memory-and-budgets.md#resource-budgets) |

Nada de esto se guarda: al recargar vuelven los valores por defecto.
