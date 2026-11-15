---
title: "Muestreo y presupuestos"
parent: "Detalles del renderizado"
nav_order: 3
lang: "es"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Muestreo y presupuestos

Cuando hay demasiados puntos para dibujarlos en un fotograma, el visor dibuja una muestra uniforme y hace que cada punto cuente más, para que la imagen siga siendo correcta. Un controlador ajusta cuántos dibuja para que el visor mantenga su frecuencia de fotogramas.

## Controles del panel de rendimiento {#performance-panel-controls}

| Control | Por defecto | Rango (tirador) |
|---|---|---|
| **Dibujar todas las filas en cada fotograma** | activado | |
| **Presupuesto adaptativo** | activado | |
| **FPS objetivo** | 60 | 20-240 (1000) |
| **Sprites iniciales / fotograma** (adaptativo) o **Sprites / fotograma** | 4,00 M | 65.536-268.435.456, logarítmico (268.435.456) |
| **Resolución del calor** | 100 % | 25-100 %, multiplicada por la escala de la segunda etapa adaptativa |
| **Refinamiento progresivo** | activado | Desactivado: cada fotograma es una estimación nueva de un solo fotograma (útil para ver la muestra en bruto). |

Mira también [Panel de rendimiento y superposición de estadísticas](performance-and-stats.md).

## Para desarrolladores {#for-developers}

### Filas candidatas {#candidate-rows}

Las filas se guardan en orden de tiempo creciente. El intervalo de la línea de tiempo [*lo*, *hi*] se convierte en un rango de filas con dos búsquedas binarias sobre la columna de tiempo ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); sin columna de tiempo, cada fila es candidata. Estas son las **Filas en la ventana** de la superposición de estadísticas. Las pruebas por fila (filtros, grupos, división, recorte, corte, vida útil) se hacen después, en el shader; una fila que no pasa cuesta una invocación de vértice y ningún fragmento.

### El plan de muestreo {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) divide el rango de candidatas en **bloques de 4.096 filas consecutivas** y elige cuántos dibujar según el presupuesto de sprites del fotograma:

- Si el presupuesto cubre todos los bloques, se dibujan todos: el fotograma es exacto.
- Si no, los bloques se toman con un paso uniforme a lo largo del rango, desplazados por un temblor que avanza según la razón áurea en cada fotograma; así, los fotogramas sucesivos cubren bloques distintos y la unión se rellena de forma uniforme. Es una muestra **estratificada**: cada parte del rango de tiempo está representada en cada fotograma.

El calor de cada fila dibujada se multiplica por **candidatas / enviadas**, así que el calor esperado de un fotograma es exacto con cualquier presupuesto; solo el ruido depende del presupuesto. Las filas viven en trozos de 8.388.608 (mira [Residencia de memoria de la GPU](gpu-memory.md)); un bloque se parte cuando cruza un trozo, y cada trozo recibe la lista de inicios de bloque que debe dibujar.

Un plan puede llevar como máximo 65.536 bloques, es decir, 268.435.456 sprites, porque ambos backends tienen un búfer fijo de 65.536 ranuras para inicios de bloque. Una petición mayor se limita ahí, y la diferencia aparece de forma honesta como más fotogramas hasta converger.

### Dibujar todas las filas en cada fotograma {#draw-every-row-each-frame}

**Rendimiento → Dibujar todas las filas en cada fotograma** (por defecto **activado**): el presupuesto pasa a ser un mínimo en lugar de un máximo, y un fotograma que empieza una estimación nueva dibuja todas las filas de las que es responsable (hasta el límite de 268 M).

La razón: un movimiento de cámara descarta la acumulación, así que un fotograma en movimiento es una sola estimación cuyo ruido depende de cuántos datos dibujó. Con un cuarto dibujado, ves un cuarto en puntos brillantes ponderados, y eso es lo que hace que una vista en movimiento brille. Dibujarlo todo hace que cada fotograma sea la imagen terminada. El coste es que el tiempo de fotograma ahora depende del tamaño de los datos en la ventana; las palancas son una ventana de tiempo más estrecha, filtros o un recorte por distancia, que reducen las candidatas en lugar de muestrearlas más escasamente.

Desactívalo en un hardware que no puede permitirse el campo completo de una vez: *Sprites / fotograma* pasa entonces a ser un límite real, y la vista converge a lo largo de unos pocos fotogramas quietos.

Lo que cuesta un plan completo, medido en una GPU de escritorio de gama alta con un lienzo 4K y un nivel grande, con sprites de 1 m de radio (un píxel o dos): aproximadamente 100 M sprites por fotograma a 30 fps, 200 M a 15 fps, y el máximo de 268 M a unos 12 fps. Con sprites tan pequeños, todo el coste está en la etapa de vértices, y la resolución del calor no cambia nada; con sprites grandes, el coste está en el relleno: 8 M de sprites de 100 m de radio tardaban 2,5 s por fotograma con la resolución de calor completa y 170 ms al 25 %. **Dibujar todas las filas en cada fotograma** empieza por tanto en 67 M y sube un cuarto por fotograma mientras los fotogramas tardan menos de 150 ms, y se reduce a la mitad mientras tardan más de 400 ms, para que una vista pesada no haga que un fotograma supere lo que permite el watchdog de la GPU.

### El presupuesto adaptativo {#the-adaptive-budget}

**Rendimiento → Presupuesto adaptativo** (por defecto activado) ajusta el presupuesto de sprites para mantener los **FPS objetivo** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Está inactivo en la repetición de cajas y durante los renderizados de vídeo.

La entrada es el tiempo de fotograma, suavizado (90 % del anterior + 10 % del nuevo, con fotogramas individuales limitados a 2 s), frente a un objetivo de 1000 / max(15, FPS objetivo) ms.

**Etapa uno: sprites.** En cada fotograma el presupuesto se multiplica por `1 + (objetivo / fotograma - 1) × ganancia`, con una ganancia de 0,35 cuando va demasiado lento y de 0,08 cuando hay margen, limitado a un factor de 0,5-1,25 por fotograma y a 65.536-268.435.456 sprites.

**Etapa dos: resolución.** Solo cuando el presupuesto ya está en su mínimo y los fotogramas siguen más de un 10 % por encima del objetivo, la resolución del búfer de calor baja un 8 % por fotograma, hasta el 25 % del lienzo; se recupera un 4 % por fotograma mientras hay un 30 % de margen. El coste del fragmento cae con el cuadrado de la resolución, algo casi invisible con una rampa suave. (Medido con renderizado por software con 10 M de filas y sprites sobredimensionados: de 141 ms a 17 ms por fotograma.) La escala se redondea a dieciseisavos; el *Res. calor* de la superposición la muestra.

**Rendirse.** Un fotograma lento se ve igual lo cause los sprites o un nivel pesado: no hay medición de tiempo por pasada. Si el presupuesto está en su mínimo y los fotogramas siguen por debajo del 70 % del objetivo durante 30 fotogramas, los sprites no eran el coste: el controlador pasa a **subir**, multiplicando el presupuesto por 1,5 cada 14 fotogramas y restaurando la resolución, mientras el tiempo de fotograma se mantenga dentro de 1,5 veces lo que era en el mínimo. Una subida que empeora las cosas más que eso retrocede al 60 % y vuelve al control normal; alcanzar el objetivo termina la subida.

Con el presupuesto adaptativo desactivado, el presupuesto es simplemente **Sprites / fotograma**.

Con *Dibujar todas las filas en cada fotograma* activado, el presupuesto adaptativo sigue funcionando, pero la regla exacta sube el presupuesto para cubrir todas las filas candidatas; en la práctica, solo controla la etapa de resolución y los fotogramas que no empiezan una estimación nueva.
