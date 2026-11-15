---
title: "Filtros y herramientas"
nav_order: 6
has_children: true
lang: "es"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filtros y herramientas

Estos paneles te permiten elegir *qué* datos miras y medir lo que ves. Úsalos cuando la imagen está demasiado cargada: muestra un equipo, un jugador, un lugar o una planta de un edificio.

Cada panel reduce los datos, y trabajan juntos: una fila se dibuja solo si pasa **todos** (Y).

```
todas las filas -> Filtros -> Equipos -> Entidades -> Corte -> imagen
                    Y         Y          Y            Y
```

Ejemplo: desmarca *Tanque* en Filtros, oculta el equipo Red en Equipos y elige un jugador en Entidades. Solo verás los movimientos de ese jugador que no son de tanque.

| Panel | Qué hace | Modos de calor | Figuras superpuestas |
|---|---|---|---|
| [Filtros](filters.md) | Filtros de rango y de categoría sobre cualquier columna guardada al cargar. | Sí | No (solo filtros de columna) |
| [División por diferencia](difference.md#the-difference-split-panel) | Qué filas suman y cuáles restan, en el modo Diferencia. | Solo Diferencia | No |
| [Equipos](teams-list.md) | Muestra u oculta cada equipo; pon equipos en el lado + o -. | Sí | Sí |
| [Entidades](entities.md) | Elige jugadores individuales. | Sí | Sí |
| [Corte](slice.md) | Recorta una franja del nivel y del calor, para mirar dentro de los edificios. | Sí, y el nivel | No |
| [Medir](measure.md) | Una regla, y el valor de calor bajo el cursor. | Sí | Sí |
| [Volúmenes y comparación](volumes.md) | Dibuja formas 3D y pregunta qué ocurrió dentro. También puede filtrar. | Sí | Sí |
| [Desglose](breakdown.md) | Qué vehículo, jugador o arma funciona mejor en un lugar. | n/d | n/d |

El análisis de impactos tiene su propio filtro de zona en la pestaña **Vehículos**: véase [Análisis de impactos](hit-analysis.md).

Términos como mapa de calor, fila, persona y grupo se explican en el [glosario](glossary.md).

## Dónde están los paneles {#where-the-panels-are}

La barra lateral de la pestaña Mapa de calor, de arriba abajo:

1. Barra de modos y selector de sesión
2. Origen, Asignación de columnas, Conjunto de datos
3. Rutas (modo Líneas)
4. Los paneles de calor, o el Visor de equipos
5. División por diferencia
6. Equipos
7. Entidades
8. Filtros
9. Fondo / nivel
10. Corte
11. Medir
12. Recorrido de cámara y render
13. Rendimiento
14. Cámara y escena

La pestaña Partida muestra la barra de modos, el selector de sesión, su propio panel, Filtros, Fondo / nivel y Cámara y escena.
