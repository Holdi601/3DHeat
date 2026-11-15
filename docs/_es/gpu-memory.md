---
title: "Permanencia de memoria de GPU"
parent: "Detalles del renderizado"
nav_order: 5
lang: "es"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# Permanencia de memoria de GPU

La tarjeta gráfica tiene solo una cierta cantidad de memoria. Si sus datos no caben, el visor muestra lo que cabe y lo dice: la capa de estadísticas recibe una línea ámbar **No residente** con el número de filas que quedaron fuera. Un conjunto de datos recortado que pareciera completo sería el peor error que puede cometer una herramienta de análisis, así que esta línea nunca se oculta.

![La capa de estadísticas con la línea ámbar No residente](../assets/img/en/gpu-memory-not-resident.webp)

Para que quepa más, suba el presupuesto de GPU en **Presupuestos de recursos** y vuelva a cargar ([Memoria y presupuestos](memory-and-budgets.md#raising-the-gpu-budget)), estreche primero los datos, o use una tarjeta con más memoria.

## Para desarrolladores {#for-developers}

### Cómo se guardan las filas en la GPU {#how-rows-are-stored-on-the-gpu}

Las filas se suben una sola vez, cuando llega un conjunto de datos, en **fragmentos** de 8.388.608 filas (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Cada fragmento se cuantiza frente a su propia caja envolvente y su propio intervalo de tiempo:

| Datos | Formato | Bytes por fila |
|---|---|---|
| Posición X, Y, Z y el id de grupo | cuatro enteros sin signo de 16 bits (RGBA16UI en WebGL2); X, Y, Z dentro de la caja envolvente del fragmento | 8 |
| Tiempo y vida útil (cuando el conjunto de datos tiene tiempo y persona) | dos enteros sin signo de 16 bits (RG16UI): tiempo dentro del intervalo de tiempo del fragmento; vida útil, donde 65.535 significa «sin muestra siguiente» | 4 |

Las cajas envolventes por fragmento son lo que hace que 16 bits basten: un fragmento suele cubrir una fracción del mapa, así que el paso de cuantización queda muy por debajo de un centímetro en un mapa de kilómetros de ancho, muy por debajo del ruido de la telemetría real. El id de grupo que va en el cuarto canal no cuesta nada, y por eso puede haber como máximo 4.096 grupos ([Grupos](sessions-persons-groups.md#limits)).

En WebGL2 cada fragmento es una textura de 8.192 texels de ancho, rellenada hasta completar filas de textura; se llega a las filas desde `gl_VertexID` mediante una textura de índices de bloque por fotograma. En WebGPU son búferes de almacenamiento.

Más memoria de GPU por fila, asignada al usarla:

- cada [filtro](filters.md) de columna activo: 4 bytes por fila (valores de coma flotante de 32 bits o ids de categoría), subido por fragmento la primera vez que se usa el filtro;
- [Calor de línea](line-heat.md): 8 bytes por fila (el inicio de cada segmento, cuantizado dentro de la caja envolvente de los datos, y sus indicadores) mientras el modo Líneas está activado.

Y además los destinos de renderizado: color y profundidad de la escena, el destino de calor y su gemelo de trabajo (cuatro canales en [Calor por equipo](team-heat.md)), las capas de *depth peeling* para la [oclusión](depth-and-culling.md), y la geometría del nivel.

### El presupuesto se aplica al subir {#the-budget-is-enforced-at-upload}

WebGL acepta asignaciones que no puede atender y luego pierde el contexto o pasa a la memoria del sistema con un coste ruinoso, así que el presupuesto de GPU se aplica cuando se sube el conjunto de datos ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- los fragmentos se suben en orden (es decir, en orden temporal) mientras quepan;
- el primer fragmento que no cabe se sube **parcialmente**, tantas filas de textura completas como quepan en el presupuesto restante, en lugar de no subirse; así, un presupuesto que no puede contener un fragmento entero muestra todo lo que puede, y como las filas van ordenadas por tiempo, la parte mostrada es un tramo de tiempo coherente;
- todo lo que viene después es **no residente**.

El déficit no se oculta: la capa de estadísticas muestra una línea **No residente**, en ámbar, con el número de filas que no cupieron, siempre que sea mayor que cero. Un conjunto de datos truncado que parece completo es el peor fallo que puede tener una herramienta de análisis. La [comprobación de ajuste](memory-and-budgets.md#the-fit-check), antes de cargar, está pensada para evitar este caso.

El presupuesto que usa el renderizador es el de GPU de **Presupuestos de recursos**, la misma cifra que usa la comprobación de ajuste, por encima de la cifra detectada también, hasta el máximo del deslizador (véase [Subir el presupuesto de GPU](memory-and-budgets.md#raising-the-gpu-budget)). Se aplica cuando se sube un conjunto de datos; si se cambia después, surte efecto en la siguiente carga.
