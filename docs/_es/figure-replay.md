---
title: "Figuras en el modo de figuras superpuestas"
parent: "Figuras"
grand_parent: "Replay"
nav_order: 2
lang: "es"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figuras en el modo de figuras superpuestas

Esta página trata de convertir las cajas en pequeñas figuras 3D de lo que era realmente cada unidad, y del humo y el fuego que dejan las figuras. Los controles de la propia repetición están en [Repetición de partida](match-replay.md).

En la [repetición de cajas](box-replay.md) y en la repetición de figuras de la pestaña Partida, **Figuras en vez de cajas** (activado por defecto) dibuja cada persona viva como la figura de lo que es: un soldado a pie, el tanque que conduce alguien, el avión que es una trayectoria de Tacview. La figura tiene el color, el lugar y el rumbo de la caja. En aviones y misiles también tiene cabeceo y, si los datos tienen una columna Roll, inclinación. **Tamaño de figura** las escala; 1 vez es el tamaño real. Los clics sobre una figura responden igual que los clics sobre su caja.

## Qué figura {#which-figure}

Mandan las columnas propias de nombre y tipo de los datos. Las reglas completas, con los nombres de las columnas, están en [Figuras](figures.md#which-figure-a-unit-gets). Los datos sin ninguno de los dos tipos de columna son datos de personas: todos son soldados.

La partida se guarda en caché por etiqueta, así que un fotograma solo cuesta la colocación. Una unidad de datos es un metro, salvo que los datos digan cuánto mide un objeto seguido (la exportación de CS2 dice que un jugador mide 32 unidades de ancho); las figuras se escalan para que coincida.

Un paquete opcional de figuras propias puede sustituir en su equipo a las figuras del catálogo; véase [Figuras](figures.md#an-optional-local-figure-pack).

## Efectos {#effects}

Las filas de eventos que dejan algo durante un tiempo se dibujan donde ocurrieron durante todo ese tiempo, con el color de quien los causó: un humo (unos 18 s), un molotov o incendiario (7 s), un destello (alrededor de un segundo) y una explosión de HE (menos de un segundo), un señuelo (15 s), una bomba colocada (40 s). Vienen de una columna de eventos (Event, Events) cuya etiqueta es `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` o `plant`; la exportación de CS2 las escribe en el momento de la detonación.

## Repetición de partida: las herramientas de Tacview {#match-replay-tacviews-tools}

Las cámaras, los marcadores, la visualización táctica, las estadísticas, las etiquetas, las **Líneas verticales**, la lista de eventos y la ventana de gráficos se describen en [Repetición de partida](match-replay.md). [Paridad con Tacview](tacview-parity.md) enumera cada función de Tacview y en qué punto está.
