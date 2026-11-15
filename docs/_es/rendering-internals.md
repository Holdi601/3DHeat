---
title: "Detalles del renderizado"
nav_order: 22
has_children: true
lang: "es"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Detalles del renderizado

El visor dibuja millones de puntos como manchas luminosas y las suma. Esta sección explica los trucos que mantienen eso rápido, y qué significan los números de la capa de estadísticas. Léala si el visor le parece lento o si quiere trabajar en el renderizador.

```
datos -> ventana de tiempo -> filtros de GPU -> plan de muestreo -> splat -> acumular -> color -> pantalla
```

Para ver cómo va su propio ordenador, mire la caja de estadísticas arriba a la derecha de la vista: [Panel de rendimiento y estadísticas](performance-and-stats.md). Las palabras nuevas (GPU, fila, sprite, mapa de calor) están en el [glosario](glossary.md).

## El problema central {#the-core-problem}

Una suma de rampas radiales que se solapan cuesta *N* × π*r*² fragmentos mezclados por fotograma. Con 100 millones de sprites de 8 px de radio, son 2 × 10¹⁰ fragmentos: alrededor de un segundo de trabajo en una GPU de gama alta. No se puede resolver por fuerza bruta en cada fotograma, así que el visor combina:

- **filas ordenadas por tiempo**: una ventana de la línea de tiempo son dos búsquedas binarias, y el coste de la reproducción sigue a las filas de la ventana, no al conjunto de datos;
- **nada por fila en la CPU en cada fotograma**: las filas viven en la memoria de la GPU, cuantizadas; los filtros, los signos de grupo, la prueba de vida útil, la ventana, el descarte y el corte se evalúan en el shader de vértices;
- **muestreo estratificado** con pesos compensatorios cuando un fotograma no puede dibujar todas las filas, y **acumulación progresiva** que converge a la respuesta exacta de todas las filas mientras la vista no cambia ([Muestreo y presupuestos](sampling-and-budgets.md), [Acumulación](accumulation.md));
- **un acelerador de dos etapas** que cambia sprites por fotograma, y después resolución del calor, por tasa de fotogramas ([Muestreo y presupuestos](sampling-and-budgets.md#the-adaptive-budget));
- **presupuestos de memoria forzados**, de modo que un conjunto de datos que no cabe se recorta a la vista en lugar de bloquear el programa ([Permanencia de memoria de GPU](gpu-memory.md)).

## Un fotograma {#one-frame}

El bucle de fotogramas es [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Todo lo que cambia a la tasa de fotogramas (cámara, cabezal de reproducción, presupuesto) vive en el motor, no en el estado de la aplicación, así que un fotograma no cuesta trabajo de React. El estado se lee una vez por fotograma y solo se escribe de vuelta para las lecturas de baja frecuencia.

1. **¿Datos nuevos?** Un conjunto de datos nuevo se anuncia (*Subiendo N filas a la GPU*) en un fotograma y se sube en el siguiente, para que el mensaje se pinte antes de que el trabajo bloquee el hilo. Un nivel nuevo se entrega al renderizador; las rutas de calor de línea se construyen o se liberan.
2. **El cabezal de reproducción** avanza (como máximo 0,1 s de tiempo real por fotograma), vuelve al principio o se para.
3. **La cámara** lee el teclado, el ratón y el mando; el espejo de ejes se incorpora a la matriz de vista; en WebGPU, una matriz de reasignación de profundidad convierte el rango de profundidad al estilo OpenGL de three.js al de WebGPU.
4. **Qué es visible**: el rango de tiempo de la línea de tiempo y del historial; la tabla de signos de grupo (visibilidad solo con un corte por una columna); hasta cuatro filtros: filtros de columna y la selección de Entidades; el corte por diferencia.
5. **Las tablas de color y de curvas** se reconstruyen si cambiaron sus ajustes.
6. **Presupuesto**: el controlador adaptativo fija el presupuesto de sprites y la resolución del calor de este fotograma; con *Dibujar todas las filas en cada fotograma* el presupuesto se sube para cubrir todas las filas candidatas.
7. **Las firmas** deciden qué significa todavía el búfer de acumulación: un cambio en algo que altere qué filas aportan o cómo (*geometría*), en la ventana de tiempo, o solo en cómo se colorea el resultado (*composición*). Véase [Acumulación](accumulation.md#what-restarts-it).
8. **Plan de muestreo**: qué bloques de filas dibujar ([Muestreo y presupuestos](sampling-and-budgets.md)).
9. **Modo de acumulación**: reiniciar, extender, media móvil, media acumulada o inactivo.
10. **Geometría de la repetición de cajas** (cubos, estelas) en la CPU, solo en ese modo y solo cuando no está inactivo.
11. **Dibujo**: el motor dibuja la escena (nivel, cuadrícula, ejes, cajas, estelas, regla), vierte el calor en el destino de calor, lo fusiona en el acumulador y compone el calor sobre la escena en el lienzo.
12. **La autoexposición** se dispara cuando su cuenta atrás llega a cero; la sonda de calor de la regla lee como máximo un píxel cada 120 ms; las lecturas se publican.

Un fotograma inactivo (convergido, sin cambios) se salta la escena y el splatting, pero aun así **vuelve a componer**: un lienzo WebGL creado sin `preserveDrawingBuffer` tiene un contenido indefinido después de componer, así que confiar en que siga mostrando el último fotograma no es seguro. La escena y los destinos de calor son los framebuffers propios del visor y sí conservan su contenido, así que un fotograma inactivo cuesta una sola pasada a pantalla completa.

## Páginas de esta sección {#pages-in-this-section}

- [Los dos motores](backends.md): WebGPU y WebGL2, cómo se elige uno, interruptores en la URL
- [Acumulación](accumulation.md): reiniciar, extender, media móvil, media acumulada
- [Muestreo y presupuestos](sampling-and-budgets.md): el muestreador estratificado, el modo exacto, el presupuesto adaptativo
- [Acumulación en media precisión](half-float-accumulation.md): rango y precisión en destinos de 16 bits
- [Permanencia de memoria de GPU](gpu-memory.md): almacenamiento de filas cuantizado y el presupuesto de GPU forzado
- [Detección de renderizado por software](software-rendering.md)
- [Panel de rendimiento y estadísticas](performance-and-stats.md)
