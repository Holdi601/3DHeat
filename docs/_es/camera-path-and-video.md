---
title: "Trayectoria de cámara y vídeo"
nav_order: 15
lang: "es"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Recorrido de cámara y vídeo

Haz una película de tus datos: colocas la cámara en unos pocos puntos, el visor vuela entre ellos y guarda un vídeo. Cada fotograma sale muy limpio, sin grano. La cámara y el cabezal de reproducción se mueven juntos, así que el mismo panel sirve para hacer un timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Hacer un vuelo {#make-a-flythrough}

1. Vuela al lugar donde empieza la película y pulsa **Añadir fotograma clave aquí** en **Recorrido de cámara y render**.
2. Vuela al siguiente punto y púlsalo otra vez. Repite para cada parada.
3. Marca **Previsualizar a lo largo del recorrido** y arrastra **Posición en el recorrido** para comprobar el movimiento.
4. Ajusta la **Duración** (lo que dura el vídeo). Un movimiento que está bien pero es demasiado rápido solo necesita una duración mayor.
5. Pulsa **Renderizar vídeo**. Espera a la línea de progreso; el archivo se descarga al terminar.

![El panel Recorrido de cámara y render con tres fotogramas clave, interpolación Suave, 12 s, 30 fps y 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Fotogramas clave {#keyframes}

| Control | Efecto |
|---|---|
| **Añadir fotograma clave aquí** | Añade la posición actual de la cámara, la guiñada, el cabeceo y el campo de visión como fotograma clave. |
| **Vaciar** | Quita todos los fotogramas clave. |
| Lista de fotogramas clave | Una fila por clave: su número (haz clic para llevar la cámara allí, ajustando también el campo de visión), la posición, `guiñada° / cabeceo°`, y **×** para quitarla. |

Las claves se reparten **de forma uniforme** a lo largo de un eje normalizado de recorrido, de 0 a 1, cada vez que se añade o se quita una. La duración de salida estira entonces todo el movimiento, así que un plano que está bien pero es demasiado rápido solo necesita una duración mayor. La guiñada se desenrolla entre claves para que la cámara gire por el camino corto.

Sin fotogramas clave, un render mantiene la cámara actual quieta durante todo el clip: un timelapse perfectamente válido.

## Ajustes del recorrido {#path-settings}

| Control | Por defecto | Rango (tirador) | Significado |
|---|---|---|---|
| **Interpolación** (2 o más claves) | *Suave* | *Suave* / *Recto* | *Suave*: una curva de Hermite cúbica que pasa por las claves, con tangentes tomadas de las claves vecinas, así que la velocidad coincide en cada clave y no hay sacudidas donde se unen los tramos. *Recto*: líneas rectas entre claves, predecible, con un vértice visible en cada clave. El campo de visión siempre se interpola de forma lineal. |
| Línea de recorrido (2 o más claves) | | | `N unidades de recorrido - M por segundo con esta duración`, o una nota de que todas las claves están en el mismo sitio. |
| **Previsualizar a lo largo del recorrido** (1 o más claves) | desactivado | | Lleva la cámara de la vista según el recorrido, y mueve el cabezal de reproducción con ella como lo hace el render, para poder juzgar el movimiento antes de renderizar. |
| **Posición en el recorrido** (mientras se previsualiza) | 0 % | 0-100 % | Dónde del recorrido se previsualiza. |
| **Duración** | 12 s | 1-120 s (3600) | Longitud del vídeo. |
| **Fotogramas por segundo** | 30 fps | 6-60 (240) | |
| **Tasa de bits** | 16 Mbps | 1-60 Mbps, logarítmico (400) | Los degradados de calor se revientan en bandas con tasas bajas: hay poco detalle tras el que el códec pueda esconder el error. |
| **Límite de espera de convergencia** | 240 fotogramas | 2-600 (10.000) | Lo máximo que puede esperar un fotograma de salida para ser exacto. Los fotogramas que llegan a este límite se escriben igualmente, y se cuentan. |
| Resumen | | | `N fotogramas · ventana: acumulada/fija/vida útil`, y cuando la línea de tiempo está en modo Todo: *(el render cambia Todo a Reproducir para que el cabezal signifique algo)*. |
| **Renderizar vídeo** / **Cancelar** | | | Inicia el render; mientras corre, muestra `fotograma i / n · esperado w · X MB` y cuántos fotogramas no fueron exactos. Necesita un conjunto de datos. |

## Consejos {#tips}

- El tamaño de salida es el tamaño del lienzo en píxeles del dispositivo (la razón de píxeles de la pantalla, con un máximo de 2). Cambia el tamaño de la ventana del navegador para cambiarlo.
- Un historial acumulado va construyendo el calor a lo largo del clip; un historial de ventana o de vida útil muestra una porción móvil del tiempo.
- Las posiciones de los fotogramas clave son coordenadas de pantalla: con un [eje del mundo invertido](camera.md#invert-world-axis), las claves hechas antes de cambiarlo apuntan a otro sitio después.

## Para desarrolladores {#for-developers}

### Qué hace un render {#what-a-render-does}

1. Toma una captura de prueba del fotograma para averiguar el tamaño exacto de salida en píxeles del dispositivo.
2. Elige un códec mediante WebCodecs: **VP9** (`vp09.00.10.08`), y si no, **VP8**, con la tasa de bits y los fotogramas por segundo elegidos. Sin `VideoEncoder` se detiene con *Este navegador no tiene VideoEncoder - se necesita WebCodecs para escribir un vídeo*; sin ninguno de los dos códecs, *No hay códec de vídeo compatible (se probó VP9, VP8)*.
3. Toma el control de los ajustes que necesita un render: pausa la reproducción, desactiva el **presupuesto adaptativo**, activa el **refinamiento progresivo** y fija el presupuesto de sprites en 64 M por fotograma (el presupuesto adaptativo protege la frecuencia de fotogramas, que aquí es el objetivo equivocado: interpretaría cada fotograma lento que converge como una razón para dibujar menos filas, lo que necesita más fotogramas para converger), y cambia la línea de tiempo de **Todo** a **Reproducir**. El ajuste de historial (acumulado, ventana, vida útil) se deja como está: un render pretende ser lo que estabas mirando, reproducido y puesto por escrito.
4. Para cada fotograma de salida *f* de *n*, con *u* = f / (n - 1):
   - coloca la cámara en la pose del recorrido en *u* (si hay claves);
   - lleva el cabezal de reproducción a la misma fracción *u* del rango de la línea de tiempo (el intervalo de la sesión seleccionada en la repetición de cajas);
   - fuerza una estimación nueva, incluso cuando la cámara no se ha movido: heredar la acumulación del fotograma anterior dejaría un fantasma de la ventana anterior;
   - espera, fotograma a fotograma, a que la imagen sea exacta (todas las filas candidatas dibujadas en un solo fotograma, o la acumulación completa), hasta el límite de espera;
   - captura el fotograma compuesto y lo codifica, con un fotograma clave cada 2 segundos de salida para que el archivo admita búsqueda.
5. Empaqueta los fotogramas en un archivo WebM ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) con marcas de tiempo elegidas a partir de los fotogramas por segundo; el tiempo de reloj que tardó cada fotograma no importa.
6. Restaura el presupuesto, el campo de visión, el modo de la línea de tiempo, el cabezal de reproducción y si estaba reproduciéndose.
7. Descarga el vídeo como `3dheat-<ancho>x<alto>-<fotogramas>f.webm` e informa `N fotogramas en W×H, X MB - todos los fotogramas exactos`, o cuántos llegaron al límite de espera.

**Cancelar** se detiene después del fotograma actual (*Render cancelado.*) y restaura los ajustes.
