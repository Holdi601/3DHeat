---
title: "Calor"
parent: "Modos de calor"
nav_order: 1
lang: "es"
source: "heat.md"
source_hash: "0d84cc318ef8"
translated: true
outdated: false
---

# Calor

El calor pinta los lugares donde ocurrieron muchas cosas: rojo donde pasó un poco, blanco ardiente donde pasó mucho. Responde a «dónde ocurre esto, y cuánto».

**Calor** (tecla 1) es el modo por defecto. Cada [fila](glossary.md) visible aporta un [sprite](glossary.md) redondo orientado a la cámara; los sprites que se solapan se suman en un búfer de coma flotante; la suma se transforma con una escala de colores - por defecto transparente → rojo → amarillo → blanco - y se dibuja sobre la escena.

![Calor en un nivel 3D: puntos calientes dentro y encima de los edificios](../assets/img/en/shooter-heat.webp)

La imagen muestra el calor de una ronda de disparos en un nivel con edificios: los puntos calientes están en las habitaciones y en las escaleras, no solo en el suelo.

## Cómo se usa {#how-to-use-it}

1. Carga datos y pulsa `1` (o elige **Calor** en la barra de modos).
2. Si todo está blanco o vacío, pulsa **Autoexposición a partir del campo** en la sección **Forma del calor**.
3. Cambia el **Radio del sprite** hasta que los puntos vecinos se fundan en bandas: más pequeño muestra puntos sueltos, más grande muestra zonas.
4. Abre **Colores del calor** para cambiar los colores, o **Profundidad** para que colinas y muros oculten el calor tras ellos.

![Las secciones Forma del calor y Colores del calor de la barra lateral, ambas abiertas](../assets/img/en/heat-panel.webp)

Los mismos paneles dan forma a [Diferencia](difference.md), [Calor por equipo](team-heat.md) y [Calor de línea](line-heat.md); se diferencian en lo que se suma (con signo, coloreado o a lo largo de líneas), no en cómo.

## Los paneles y sus valores por defecto {#the-panels-and-their-defaults}

Cada control de abajo corresponde a un parámetro del shader, así que cambiarlo no cuesta nada más que volver a dibujar. Los deslizadores tienen una casilla para escribir un valor y un tirador (el pequeño agarre a la derecha: arrastra arriba o abajo; cuanto más lejos, más rápido; Shift para ajustar fino). Cuando el recorrido de un deslizador termina antes de un límite real, el tirador puede pasar de él hasta el *techo de arrastre* indicado aquí. Los valores marcados como *al cargar* se recalculan para cada conjunto de datos nuevo.

### Forma del calor (abierto) {#heat-shape-open}

| Control | Por defecto | Rango (techo de arrastre) | Detalles |
|---|---|---|---|
| **Radio del sprite** | 6 m; al cargar, extensión / 120 | 0,05-2000 m, logarítmico (50.000) | [Forma del sprite](sprite-shape.md#sprite-radius) |
| **Intensidad en el centro** | 1 | 0-10 (1000) | [Forma del sprite](sprite-shape.md#centre-and-edge-intensity) |
| **Intensidad en el borde** | 0 | -2-10 (1000) | [Forma del sprite](sprite-shape.md#centre-and-edge-intensity) |
| **Forma de la rampa** | *Caída* | *Caída* / *Curva* | [Forma del sprite](sprite-shape.md#ramp-shape-falloff-or-curve) |
| **Caída** (solo con Caída) | 1,6 | 0,1-8 (64) | [Forma del sprite](sprite-shape.md#falloff) |
| **Rampa suave** (solo con Caída) | activado | | [Forma del sprite](sprite-shape.md#falloff) |
| Editor de curvas (solo con Curva) | preajuste *Suave* | | [Forma del sprite](sprite-shape.md#the-curve-editor) |
| **Punto de saturación** | 24; al cargar, una estimación y luego medido | 0,1-4000, logarítmico (10.000.000) | [Color y exposición](colour-and-exposure.md#saturation-point) |
| **Calor mínimo** | desactivado (0) | 0-100 % | [Color y exposición](colour-and-exposure.md#minimum-heat) |
| **Respuesta a la densidad** | *Saturante* | *Saturante* / *Lineal* / *Log* | [Color y exposición](colour-and-exposure.md#density-response) |
| **Autoexposición a partir del campo** | | botón | [Color y exposición](colour-and-exposure.md#auto-exposure) |
| **Seguir la vista** | activado | | Vuelve a medir la exposición cada vez que la cámara se detiene, así que una región a la que vuelas usa toda la escala de colores. Los cambios pequeños se ignoran y la escala se desliza. Desmárcalo, o arrastra **Punto de saturación**, para fijar la escala y comparar lugares en una misma escala. [Color y exposición](colour-and-exposure.md#follow-the-view) |
| **Misma densidad con cualquier zoom** | activado | | Un color significa el mismo número de filas por área de suelo, por cerca que estés. Un sprite que los límites de píxeles agrandan (de lejos) o reducen (de cerca) conserva el calor que sumaría a su tamaño real, así que una imagen expuesta desde lejos no se apaga al volar hacia ella. Desactivado, un sprite limitado suma todo su peso con su tamaño limitado. [Forma del sprite](sprite-shape.md#pixel-clamps) |
| **Aplanar sobre el plano del suelo** | desactivado | | [Forma del sprite](sprite-shape.md#flatten-onto-ground-plane) |

### Colores del calor (cerrado) {#heat-colours-closed}

| Control | Por defecto | Detalles |
|---|---|---|
| Muestras de grupo y **Separación de color** (solo Calor por equipo) | 1,4 | [Calor por equipo](team-heat.md) |
| Editor de la **Rampa de calor** (*Positivo (equipos aditivos)* en Diferencia, *Rampa de opacidad* en Calor por equipo) | transparente → rojo → amarillo → blanco | [Color y exposición](colour-and-exposure.md#the-ramp-editor) |
| **Restablecer a transparente → rojo → amarillo → blanco** | | |
| Rampa de **Negativo (equipos sustractivos)** (solo Diferencia) | transparente → verde → azul → morado | [Diferencia](difference.md#colours) |

### Límites de píxeles del sprite (cerrado) {#sprite-pixel-clamps-closed}

| Control | Por defecto | Rango (techo de arrastre) | Detalles |
|---|---|---|---|
| **Radio mínimo en píxeles** | 1 px | 0-16 (512) | [Forma del sprite](sprite-shape.md#pixel-clamps) |
| **Radio máximo en píxeles** | 96 px | 2-1024, logarítmico (8192) | [Forma del sprite](sprite-shape.md#pixel-clamps) |

### Profundidad (abierto) {#depth-open}

| Control | Por defecto | Detalles |
|---|---|---|
| **Ocultar tras el terreno** | activado | [Profundidad y descarte](depth-and-culling.md#hide-behind-terrain) |
| **Oculto tras la geometría** | 0,8 (*80 % más oscuro*) | [Profundidad y descarte](depth-and-culling.md#hidden-behind-geometry) |

### Recorte por distancia (cerrado) {#distance-culling-closed}

| Control | Por defecto | Rango (techo de arrastre) | Detalles |
|---|---|---|---|
| **Cerca** | desactivado (0) | 0,5-5000 m, logarítmico; el extremo inferior de la pista = desactivado (200.000) | [Profundidad y descarte](depth-and-culling.md#distance-culling) |
| **Lejos** | desactivado (0) | 1-200.000 m, logarítmico; extremo inferior = desactivado (10.000.000) | [Profundidad y descarte](depth-and-culling.md#distance-culling) |
| **Cortar con un plano** | activado | | [Profundidad y descarte](depth-and-culling.md#distance-culling) |
| **Cortar también el nivel** | activado | | [Profundidad y descarte](depth-and-culling.md#distance-culling) |

Teclas: `[` y `]` acercan y alejan el límite lejano, `\` lo activa y desactiva ([Profundidad y descarte](depth-and-culling.md#keyboard)).

### Dirección y Valor {#direction-and-value}

Dos secciones más aparecen debajo de Forma del calor. **Dirección** dibuja cada fila como una cuña y añade flechas: véase [Calor direccional](directional-heat.md). **Valor** pondera el calor por lo que costó o rindió cada fila: véase [Ponderación de valores](value-weighting.md).

## Qué se guarda {#what-is-saved}

Los ajustes de calor de arriba no se guardan entre sesiones: al recargar la página se restauran los valores por defecto. En el navegador se guardan dos cosas: la última velocidad de reproducción (`heat3d.speed`, véase [Línea de tiempo](timeline.md)) y los ajustes de las figuras lejanas de la [superposición de figuras](box-replay.md) (estilo de símbolo, tamaño, marcas de impacto, etc.). También se guardan el idioma, los [ejes del mundo invertidos](camera.md#invert-world-axis), los nombres de coche recordados de la pestaña de carrera y la [biblioteca de niveles](level-library.md). La lista completa está en [Ajustes guardados](ref-settings-storage.md).
