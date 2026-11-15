---
title: "Muchas partidas a la vez"
parent: "Replay"
nav_order: 2
lang: "es"
source: "many-matches.md"
source_hash: "f2239cef5e91"
translated: true
outdated: true
---

# Muchas partidas a la vez

**Muchas partidas a la vez** reproduce muchas partidas superpuestas, para ver por dónde suelen ir los jugadores de todas ellas. Úsalo para comparar cientos o miles de partidas en una sola imagen.

Cada partida empieza en su propio inicio y sus unidades se mueven como figuras. Los archivos van directamente a la tarjeta gráfica y no se construye ninguna tabla completa, así que se reproduce con fluidez donde una carga normal se quedaría sin memoria.

![Diez partidas de tanques superpuestas, un color por partida](../assets/img/es/many-matches.webp)

## Cómo se usa {#how-to-use-it}

1. Abre **Muchas partidas a la vez** en la barra lateral de Mapa de calor.
2. Pulsa **Archivos…** (elige muchos archivos), **Carpeta…** (una carpeta y sus subcarpetas) o **Añadir carpeta…** (añade a lo que ya está cargado).
3. El visor pasa a la superposición de figuras y empieza al inicio. Pulsa **Reproducir**.

Cada archivo es una partida (o contiene varias). Funcionan los archivos Parquet y los contenedores [`.3dheat`](container.md). Un archivo necesita una columna de posición, de tiempo y de unidad; se conservan las columnas de nombre, tipo y bando. Los demás archivos, y los archivos auxiliares de los convertidores (vuelo, mensajes, eventos, chat, objetivos), se omiten. Para una tabla normal, véase [Cargar datos](getting-data-in.md).

## Ajustes {#settings}

| Ajuste | Qué hace |
|---|---|
| **Por equipo** / **Por partida** | Colorea por bando, o un color por partida. |
| **Marcar dónde murieron las unidades** | Una marca donde murió cada unidad, durante 10 s, 30 s, 120 s, o todas las vistas hasta ahora. |

El panel muestra cuántas partidas, unidades, filas y posiciones se leyeron, la memoria usada y el tiempo de carga. *Espacio para* es cuántas posiciones más podría admitir todavía la tarjeta gráfica. *Figuras desde* es el tamaño en pantalla por debajo del cual una unidad se dibuja como una pequeña flecha en lugar de su figura.

El aspecto de las figuras usa los mismos controles que la [repetición de partida](match-replay.md#figures): **Tamaño de figura**, **Figura más pequeña en pantalla** y **A distancia**.

## Consejos {#tips}

- Cuando todo no cabría en memoria, las posiciones se adelgazan (solo se conserva una posición cada pocos metros) y el panel lo indica.
- Los modos de calor también funcionan con los datos de la superposición.
- Para estadísticas de miles de partidas sin dibujarlas, véase [Análisis masivo](mass-analysis.md).
