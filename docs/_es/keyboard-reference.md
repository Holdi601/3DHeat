---
title: "Referencia de teclado y ratón"
parent: "Cámara y controles"
nav_order: 2
lang: "es"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Referencia de teclado y ratón

Todas las teclas y acciones del ratón en un solo lugar, para que encuentres la que necesitas. Primero haz clic en la vista para que tenga el teclado. Las teclas se ignoran mientras un cuadro de texto o un desplegable tiene el foco. La versión corta también aparece abajo a la izquierda de la vista.

Buscador rápido:

| Quiero ... | Pulsa |
|---|---|
| volar | `W A S D`, arrastra para mirar |
| ver todo | `F` |
| reproducir o pausar | `K` |
| reproducir hacia atrás | `J` (pulsa otra vez para pausar), hacia delante `L` |
| ver qué significan los colores | `?` o `F1` |
| deshacer en la pestaña Táctica | `Ctrl+Z` |

## Cámara {#camera}

De [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Entrada | Efecto |
|---|---|
| `W` / `↑` | Hacia delante, en la dirección de la vista |
| `S` / `↓` | Hacia atrás |
| `A` / `←` | Desplazarse a la izquierda |
| `D` / `→` | Desplazarse a la derecha |
| `Space` / `E` | Subir |
| `Q` / `Ctrl` izquierdo | Bajar |
| `Shift` (cualquiera) | Mantenido: velocidad ×6 |
| `Alt` izquierdo | Mantenido: 15 % de velocidad |
| Arrastrar con el botón izquierdo o derecho sobre la vista | Mirar (el puntero queda bloqueado mientras el botón está pulsado) |
| Rueda (perspectiva) | Velocidad de vuelo ×1,5 por muesca (como máximo 4 muescas por evento de rueda) |
| Rueda (paralela) | Zoom |
| Clic derecho | No abre el menú contextual sobre la vista |

## Global {#global}

De [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Tecla | Efecto |
|---|---|
| `K` | Reproducir / pausar la [línea de tiempo](timeline.md) |
| `F` | Encuadrar los datos |
| `C` | Copiar la posición de la cámara, la guiñada y el cabeceo ([lectura de la cámara](camera.md#camera-readout)) |
| `G` | Ir a un punto escrito: abre el cuadro bajo la lectura de la cámara |
| `Esc` | Cerrar la tarjeta de selección; luego dejar de mirar la segunda unidad; luego dejar de seguir una unidad |
| `T` | Activar o desactivar la vista de pantalla táctica ([Repetición de partida](match-replay.md#display-style)) |
| `?` / `F1` | Modo de ayuda: qué significan los colores ([Ajustes, unidades y teclas](settings.md#help-mode)) |
| `1` | [Calor](heat.md) |
| `2` | [Diferencia](difference.md) |
| `3` | [Calor por equipo](team-heat.md) |
| `4` | [Líneas](line-heat.md) |
| `]` | Alejar el límite de recorte lejano ×1,12 (`Shift`: ×1,35) |
| `[` | Acercar el límite de recorte lejano ÷1,12 (`Shift`: ÷1,35) |
| `\` | Desactivar el límite de recorte lejano / volver a activarlo donde estaba ([Profundidad y recorte](depth-and-culling.md#keyboard)) |

El modo **Figuras superpuestas** no tiene tecla numérica; elígelo en la barra de modos o abre la pestaña Partida. Las teclas numéricas pasan por la misma comprobación que la barra de modos: una tecla de un modo que la barra muestra como no disponible para los datos cargados no hace nada.

## Repetición de partida {#match-replay}

En el modo Figuras superpuestas, que usa la pestaña Partida ([Repetición de partida](match-replay.md)). Funcionan tanto si una unidad está seguida como si no, salvo donde se indique:

| Tecla | Efecto |
|---|---|
| `B` | Añadir un marcador: el momento y la cámara |
| `M` | Mapa 2D: esquina, vista completa, apagado |
| `V` / `Shift+V` | Siguiente / anterior vista de cámara de la unidad seguida |
| `H` | Pantalla de cabeza alta en las vistas de cabina y de padlock |
| `Av Pág` / `Re Pág` | Siguiente / anterior evento de los tipos que muestra la lista de eventos |
| `J` | Reproducir hacia atrás; otra vez, para pausar |
| `L` | Reproducir hacia delante; otra vez, para pausar |
| `.` / `,` | Un segundo adelante / atrás, en pausa (`Shift`: diez segundos) |
| `Esc` | Dejar primero de mirar el objetivo, luego dejar de seguir |
| `Ctrl`+clic o `Alt`+clic en una unidad (en la vista o en la lista de unidades) | Mirarla desde la unidad seguida (la vista de dos unidades); haz clic otra vez para quitarla |
| `Shift`+clic en dos unidades | Medir entre ellas: rumbo, distancia, diferencia de altura |

`V` necesita una unidad seguida. Aquí `M` es el mapa 2D, y «mover» en la pestaña Táctica.

## Seguir una unidad {#following-a-unit}

Mientras la cámara sigue una unidad, la rueda y las teclas de vuelo giran alrededor de la unidad en lugar de volar libremente ([Cámara](camera.md#while-following-a-unit)):

| Entrada | Efecto |
|---|---|
| Rueda, `W` / `S` | Más cerca / más lejos (más arriba / más abajo en la vista satélite). No en las vistas de cabina y de padlock. |
| `A` / `D`, `Q` / `E` | Orbitar alrededor de la unidad (vistas de persecución y de órbita) |
| Arrastrar | Mirar alrededor de la unidad; en la cabina, mirar alrededor dentro |
| `V` / `Shift+V` | Siguiente / anterior vista de cámara |
| `H` | Pantalla de cabeza alta (vistas de cabina y de padlock) |
| `Esc` | Dejar de mirar la segunda unidad, luego dejar de seguir |

## Pizarra táctica {#tactics-board}

En la pestaña Táctica ([Pizarra táctica](tactics-board.md)). `F`, `C`, `G` y `T` funcionan como arriba; las teclas numéricas no hacen nada.

| Tecla | Efecto |
|---|---|
| `Ctrl+Z` | Deshacer |
| `Ctrl+Y` o `Ctrl+Shift+Z` | Rehacer |
| `Enter` | Terminar la flecha que se está dibujando (un doble clic o un clic derecho hacen lo mismo) |
| `Esc` | Cancelar un arrastre; si no, quitar la flecha o el movimiento en curso; si no, deseleccionar |
| `Delete` o `Backspace` | Borrar la selección |
| `W` / `E` / `R` | Gizmo de mover / rotar / escalar para la selección (esquema de teclas **W / E / R**) |
| `G` / `R` / `S` | Gizmo de mover / rotar / escalar para la selección (esquema de teclas **G / R / S**) |
| `R` | Sin nada seleccionado: gira 15° la siguiente figura que vas a colocar. `Shift+R` la gira de vuelta. |
| `M` | Con una figura seleccionada: moverla al siguiente clic |
| `K` | Reproducir o pausar el plan |
| Shift+clic | Añadir o quitar de la selección |
| Shift+arrastrar | Dibujar un recuadro alrededor de lo que se quiere seleccionar |
| `Ctrl` mientras arrastras un tirador | Ajustar a la cuadrícula o al paso de ángulo |

Las teclas del gizmo funcionan solo cuando hay algo seleccionado; sin selección, `W A S D` mueven la cámara como de costumbre.

## Seleccionar con clic {#click-to-pick}

Con **Un clic muestra qué hay ahí** activado y la regla desactivada ([Seleccionar con clic](camera.md#click-to-pick)):

| Entrada | Efecto |
|---|---|
| Clic izquierdo (sin arrastrar más de 4 px) | Muestra el punto de datos, o si no, el lugar del nivel, bajo el puntero |

## Medir {#measure}

Con **Regla activa** ([Medir](measure.md)):

| Entrada | Efecto |
|---|---|
| Clic izquierdo (sin arrastrar más de 4 px) | Coloca un punto |
| Clic derecho | Quita el último punto |

## En otros lugares {#elsewhere}

| Dónde | Entrada | Efecto |
|---|---|---|
| El tirador de cualquier deslizador (el mango junto al número) | Arrastrar arriba / abajo | Cambia el valor de forma continua, más rápido cuanto más lejos arrastres; mantén `Shift` para ajustar con precisión. Suelta para parar. |
| La indicación de velocidad sobre la vista | Arrastrar arriba / abajo | Cambia la velocidad de vuelo de la misma forma. |
| Cuadros de pose | `Enter` | Aplica la posición u orientación escrita. |
| Editor de curvas | Doble clic / Alt+clic / clic derecho | Añade un punto / quita un punto ([Forma del sprite](sprite-shape.md#the-curve-editor)). |

## Pestaña Análisis de carrera {#race-analysis-tab}

En la pestaña Análisis de carrera, `K` reproduce y pausa la repetición de la carrera, `Inicio` la rebobina, y las teclas numéricas no hacen nada. Mira [Análisis de carrera](race-analysis.md).

## Teclas que el visor se queda del navegador {#keys-the-viewer-keeps-from-the-browser}

Algunos atajos del navegador cerrarían o recargarían la página y perderían una sesión cargada; el visor se los queda para sí. La lista se genera a partir del código: [Teclas del navegador](ref-browser-keys.md).

## Mando {#gamepad}

Mira [Mando y HOTAS](gamepad.md).
