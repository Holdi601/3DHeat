---
title: "Modos de calor"
nav_order: 4
has_children: true
lang: "es"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# Modos de calor

Cada punto añade un poco de brillo, los brillos se acumulan, y la acumulación se pinta con colores. Los modos son cinco formas de pintarla, y cada uno responde a una pregunta.

La barra de modos, en la parte superior de la barra lateral de la pestaña Mapa de calor, elige cómo se dibuja el [conjunto de datos](glossary.md). Las teclas 1-4 eligen Calor, Diferencia, Calor por equipo y Líneas. Figuras superpuestas no tiene tecla.

![La barra de modos con Calor, Diferencia, Calor por equipo, Figuras superpuestas y Líneas](../assets/img/en/heat-modes-bar.webp)

| Modo | Pregunta que responde |
|---|---|
| **Calor** | ¿Dónde pasó, y cuánto? |
| **Diferencia** | ¿Qué bando lo hizo más? |
| **Calor por equipo** | ¿De quién fue? |
| **Líneas** | ¿Por dónde fue la gente? |
| **Figuras superpuestas** | ¿Quién estaba dónde, y cuándo? |

![Los mismos datos en cuatro modos: Calor, Diferencia, Calor por equipo y Líneas](../assets/img/en/heat-modes-grid.webp)

| Modo (etiqueta de la barra) | Tecla | Qué dibuja | Necesita |
|---|---|---|---|
| **Calor** | 1 | Densidad aditiva: cada fila visible añade un sprite radial orientado a la cámara. [Calor](heat.md) | un conjunto de datos |
| **Diferencia** | 2 | Densidad con signo: una población suma y otra resta. [Diferencia](difference.md) | dos bandos: al menos dos grupos, o una división sobre una columna guardada |
| **Calor por equipo** | 3 | Densidad coloreada por grupo: un tono por grupo, mezclados donde los grupos se solapan. [Calor por equipo](team-heat.md) | una columna de grupo |
| **Figuras superpuestas** | - | Una figura (o caja) por persona, moviéndose a lo largo de la línea de tiempo: la repetición. [Figuras superpuestas](box-replay.md), [Repetición de partida](match-replay.md) | una columna de persona |
| **Líneas** | 4 | Calor de línea: una línea desde cada muestra de una persona hasta la siguiente, con el calor cayendo hacia los lados. [Calor de línea](line-heat.md) | una columna de persona y una de tiempo |

Un modo que los datos no pueden admitir aparece atenuado, y su información sobre herramientas indica el motivo, por ejemplo *No disponible: el modo Diferencia necesita dos grupos o una columna guardada para dividir; estos datos tienen un solo grupo.* Cuando un conjunto de datos nuevo no admite el modo actual, la vista vuelve a **Calor**.

Las teclas 1-4 se comprueban con los datos de la misma forma: una tecla de un modo atenuado no hace nada.

## Qué paneles muestra cada modo {#which-panels-each-mode-shows}

| Panel | Calor | Diferencia | Calor por equipo | Figuras superpuestas | Líneas |
|---|---|---|---|---|---|
| Rutas ([calor de línea](line-heat.md)) | | | | | sí |
| Forma del calor (con **Seguir la vista** y **Misma densidad con cualquier zoom**), Colores del calor, Límites de píxeles del sprite, Profundidad, Recorte por distancia | sí | sí | sí | | sí |
| Dirección ([calor direccional](directional-heat.md)), Valor ([ponderación de valores](value-weighting.md)) | sí | sí | sí | | sí |
| Visor de equipos ([figuras superpuestas](box-replay.md)) | | | | sí | |
| División por diferencia ([diferencia](difference.md)) | | sí | | | |
| [Equipos](teams-list.md), [Entidades](entities.md), [Filtros](filters.md), Fondo / nivel, [Corte](slice.md), [Medir](measure.md), Recorrido de cámara y render, Rendimiento, Cámara y escena | sí | sí | sí | sí | sí |

## Lo que comparten todos los modos de calor {#what-every-heat-mode-shares}

Los cuatro modos de calor (todos menos las figuras superpuestas) son la misma maquinaria con entradas distintas ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Qué filas.** La [línea de tiempo](timeline.md) selecciona un rango continuo de filas ordenadas por tiempo; los [filtros](filters.md), la visibilidad de grupos, la división por diferencia, el [recorte por distancia](depth-and-culling.md#distance-culling) y el [corte](slice.md) deciden, fila a fila, en el shader de vértices, si cada una aporta y con qué fuerza.
2. **Splatting.** Cada fila que aporta se dibuja como un sprite (o, en modo Líneas, como un segmento) en un **destino de calor** de coma flotante, sumando su valor de la escala. Cuando hay más filas de las que un fotograma puede asumir, se dibuja una muestra estratificada de ellas, ponderada para compensar. Véase [Muestreo y presupuestos](sampling-and-budgets.md).
3. **Acumulación.** Mientras nada cambia, los fotogramas se combinan hasta que cada fila ha aportado exactamente una vez. Véase [Acumulación](accumulation.md).
4. **Composición.** El valor acumulado en cada píxel se divide por el **punto de saturación**, se da forma con la **respuesta de densidad**, se eleva con el **calor mínimo** y se busca en la **escala de colores**, cuyo alfa lo mezcla sobre la escena. Véase [Color y exposición](colour-and-exposure.md).

Todo lo del paso 4 se aplica al componer, así que arrastrar esos controles nunca reinicia la acumulación; lo que afecte a los pasos 1-2 sí la reinicia.

## Páginas de esta sección {#pages-in-this-section}

- [Calor](heat.md) - el modo de calor básico, y la visión general de sus paneles
  - [Forma del sprite](sprite-shape.md) - radio, intensidades, caída, el editor de curvas, límites de píxeles, aplanado
  - [Color y exposición](colour-and-exposure.md) - editor de escala, punto de saturación, exposición automática, calor mínimo, respuesta de densidad
  - [Profundidad y descarte](depth-and-culling.md) - oclusión por el nivel, ocultación tras el terreno, recorte por distancia
- [Diferencia](difference.md) - la división por diferencia
- [Calor por equipo](team-heat.md)
- [Calor de línea](line-heat.md) - rutas
- [Figuras superpuestas](box-replay.md) - el modo de repetición (el archivo aún se llama box replay)
- [Calor direccional](directional-heat.md)
- [Ponderación de valores](value-weighting.md)
