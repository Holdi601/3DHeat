---
title: "Los dos motores"
parent: "Detalles del renderizado"
nav_order: 1
lang: "es"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Los dos motores

Un navegador puede dejar que una página use la tarjeta gráfica de dos formas: WebGPU (más nueva) y WebGL2. El visor puede usar las dos y elige él mismo la mejor, así que normalmente no tiene que hacer nada. Para ver cuál está usando, mire **Backend** en la capa de estadísticas (arriba a la derecha de la vista).

![La capa de estadísticas: Backend, FPS, Fotograma, Filas en la ventana, Sprites / fotograma, Presupuesto, Resol. del calor, Cobertura](../assets/img/en/performance-stats-overlay.webp)

El visor tiene dos renderizadores completos detrás de una misma interfaz ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) y **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Los dos dibujan la misma imagen con los mismos algoritmos; los shaders existen en WGSL y en GLSL ES 3.00, uno junto a otro. La primera línea de la capa de estadísticas, **Backend**, dice cuál está en marcha. Si pasa el ratón por encima, ve por qué no se usó WebGPU, cuando no se usó.

## Para desarrolladores {#for-developers}

### Cómo se elige {#how-one-is-chosen}

Un lienzo solo puede tener un tipo de contexto, así que la elección se hace una vez, antes de dibujar nada ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Salvo que WebGL2 esté forzado: si existe `navigator.gpu`, pide un adaptador con `powerPreference: 'high-performance'` y un dispositivo, y crea el renderizador WebGPU. Cualquier fallo se guarda como motivo.
2. Si WebGPU estaba forzado y falló, se para: la vista muestra *No se puede inicializar el renderizador.* con el motivo.
3. Si no, crea el renderizador WebGL2 (también pidiendo el adaptador de alto rendimiento). Si WebGL2 no está disponible, o no puede dibujar en texturas de coma flotante (`EXT_color_buffer_float`), la vista muestra el error.

`powerPreference: 'high-performance'` evita que un portátil con gráficos conmutables entregue a la página su GPU integrada. Más allá de eso, la página no decide nada: la aceleración por hardware es un ajuste del navegador.

### Interruptores en la dirección URL {#url-switches}

Añádalos a la dirección de la página, por ejemplo `http://127.0.0.1:5273/?backend=webgl2`.

| Parámetro | Efecto |
|---|---|
| `?backend=webgpu` | Usar WebGPU o fallar. |
| `?backend=webgl2` | Usar WebGL2 aunque WebGPU esté disponible: separa "esto se dibuja mal" de "esto se dibuja mal en WebGPU". |
| `?heat=f16` | Forzar la ruta de acumulación de calor de 16 bits en cualquiera de los dos motores ([Acumulación en media precisión](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: lee los errores de GL durante el fotograma y los muestra en `renderer.heatDebug`. Desactivado por defecto, porque `getError` es un punto de sincronización del cauce. |
| `?occdebug=<n>` | Ayuda para desarrolladores de WebGL2: sustituye el calor por valores de depuración de oclusión. No es para uso normal. |

### Diferencias que importan {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Almacenamiento de filas | Búferes de almacenamiento: un índice de fila es un subíndice de array. Pide el mayor enlace de búfer de almacenamiento del adaptador y los tamaños de búfer. | Texturas de enteros (8.192 texels de ancho) direccionadas desde `gl_VertexID` mediante una textura de índices de bloque por fotograma. |
| Acumulación de calor de 32 bits | Cuando el adaptador ofrece `float32-blendable` y `float32-filterable` | Cuando está presente `EXT_float_blend` |
| En otro caso | 16 bits (`r16float`) | 16 bits (`R16F`) |
| Rango de profundidad | [0, 1]; el motor premultiplica una reasignación de las matrices de three.js, que van de [-1, 1]. Sin ella, una proyección paralela (cuya profundidad es lineal) cae casi toda por debajo de 0 y se recorta en silencio. | [-1, 1], se usa tal cual |
| Uniforms | Un anillo de ranuras alineadas a 256 bytes, una por dibujo, enlazadas por desplazamiento. `queue.writeBuffer` se ordena en la cola, así que reescribir un solo búfer en cada dibujo haría que todos los dibujos leyeran la última escritura. El bloque de uniforms del pase de calor ocupa exactamente una ranura de 256 bytes. | Uniforms ordinarios |
| Destino de calor por debajo de la resolución del lienzo | Tiene su propia textura de profundidad (todos los adjuntos de un pase deben tener el mismo tamaño) | |
| Captura de fotograma | `captureFrame()` vuelve a dibujar la composición en un destino fuera de pantalla y la lee (Chromium sin cabeza dibuja WebGPU, pero nunca compone su lienzo) | Lee el framebuffer por defecto en el siguiente fotograma dibujado |
| Lectura | Búferes de descarga guardados y reutilizados; un lector en vuelo a la vez | `readPixels`, consultando al driver qué par formato/tipo es válido |

Los dos motores suben la tabla de curvas de los sprites como medias precisiones. El `queue.writeTexture` de WebGPU copia bytes en bruto, así que los datos se codifican antes a binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Límites de textura {#texture-limits}

`texStorage2D` por encima de `MAX_TEXTURE_SIZE` no lanza un error: la asignación se descarta, las subidas posteriores fallan y el muestreo devuelve cero. La función auxiliar de WebGL2 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) comprueba las dos dimensiones frente al límite y lanza un error con el tamaño. La textura de índices de bloque es bidimensional (4.096 de ancho), así que no puede superar un límite. `src/render/limits.test.ts` fija cada dimensión de textura frente a los límites que merece la pena soportar. El renderizador WebGL2 también rechaza un dispositivo cuyo tamaño máximo de textura sea menor que los 8.192 de ancho de la textura de filas.

### Probar los dos {#testing-both}

`npm run smoke` ejecuta la aplicación real en Chromium sin cabeza con WebGL2 (por defecto `http://127.0.0.1:5273/`). Pase `"http://127.0.0.1:5273/?backend=webgpu"` a `node tools/smoke.mjs` para WebGPU, y `npm run smoke:f16` para la ruta de media precisión. `tools/probe-webgpu.mjs` y `tools/probe-present.mjs` (listados en las herramientas de desarrollo de [Herramientas de línea de comandos](ref-tools.md)) diagnostican la disponibilidad de adaptador y de presentación en navegadores sin cabeza.
