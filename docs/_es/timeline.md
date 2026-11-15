---
title: "Línea de tiempo y reproducción"
nav_order: 5
lang: "es"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Línea de tiempo y reproducción

La barra debajo de la imagen funciona como un reproductor de vídeo: puedes reproducir los datos como una película, pausarlos, saltar de un punto a otro y cambiar la velocidad.

![La barra de la línea de tiempo: 1 Todo/Reproducir, 2 botones de transporte, 3 reloj, 4 Velocidad, 5 Historial, con Ventana y un Intervalo de 30 s](../assets/img/en/timeline-bar.webp)

La barra debajo de la vista es la línea de tiempo ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Decide qué filas son visibles en cada momento. Necesita una columna de tiempo; sin ella toda la barra queda desactivada, la vista se queda en **Todo**, y la barra lateral indica *No hay columna de tiempo en estos datos: la línea de tiempo está desactivada y cada dato se muestra a la vez.*

## Todo y Reproducir {#all-and-play}

Dos modos principales, porque responden a preguntas distintas.

- **Todo** (el valor por defecto en cada carga) ignora por completo el cabezal de reproducción y muestra cada fila que pasa los filtros. Es la vista de «dónde ocurre esto», y no es lo mismo que avanzar hasta el final. El deslizador está desactivado y el reloj muestra `todo · <intervalo> de datos`.
- **Reproducir** ejecuta los datos como un timelapse. Aparecen el deslizador, el transporte y los ajustes de historial.

Elegir **Todo** también detiene la reproducción.

## Los controles {#the-controls}

| Control | Por defecto | Significado |
|---|---|---|
| Deslizador | el inicio | El cabezal de reproducción. Arrastra para buscar; 20.000 pasos a lo largo del rango. |
| **Todo** / **Reproducir** | Todo | Véase arriba. |
| ▶ / ❚❚ | en pausa | Reproducir o pausar; también `K`. |
| ◀ **Reproducir hacia atrás (J)** | | Reproduce los datos en orden inverso. Solo se muestra en el modo **Figuras superpuestas**; la tecla `J` también funciona allí (véase [Teclado](#keyboard)). |
| ⏮ | | Vuelve al inicio del rango. |
| Reloj | | `transcurrido / total` como `mm:ss.s` (o `h:mm:ss`), y, cuando la columna de tiempo es una marca absoluta, la hora del día del cabezal como `HH:MM:SSZ` (UTC). |
| **Velocidad** | 1× | Segundos de datos por segundo real. El menú tiene 17 pasos de 0,01× a 1800× (0,01, 0,02, 0,05, 0,1, 0,25, 0,5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), más **Personalizada…**: escribe cualquier velocidad de 0,001× a 3600× (por ejemplo 0,3 o 12) y pulsa Enter; Esc mantiene la velocidad actual. La última velocidad se recuerda para la siguiente visita (véase [Ajustes guardados](ref-settings-storage.md)). |
| **Historial** | Acumulado | Qué cuenta como visible en el cabezal: *Acumulado*, *Ventana* o *Vida útil* (abajo). |
| **Intervalo** (Ventana; en modo Líneas también Vida útil) | 30 s | Longitud de la ventana que termina en el cabezal; al menos 0,01 s. En [Calor de línea](line-heat.md#playback) es la longitud de la cola. |
| **Vida de reserva** (solo Vida útil, no en modo Líneas) | 10 s | Cuánto tiempo sigue visible un dato sin una siguiente muestra de su persona. |
| **Fundido** (solo Vida útil, no en modo Líneas) | 0,4 | Fracción de la vida de cada dato dedicada a desvanecerse, 0-1. |
| **Bucle** | activado | Al final, vuelve a empezar; desactivado, se detiene al final. |
| Lado derecho | | El nombre del conjunto de datos. |

El **rango** es el intervalo de tiempo del conjunto de datos - o, en la [superposición de figuras](box-replay.md) con una sesión seleccionada, el intervalo de esa sesión.

## Historial {#history}

En modo Reproducir:

- **Acumulado** - todo desde el inicio del rango hasta el cabezal. El calor se va acumulando mientras se reproduce.
- **Ventana** - un intervalo fijo de historial que termina en el cabezal (*Intervalo*).
- **Vida útil** - cada dato vive hasta la **siguiente muestra de la misma persona** (en la misma sesión), así que exactamente una posición por persona está vigente en cada instante. Un dato cuya persona no vuelve a aparecer - una muerte, una desconexión, el final del registro - no tiene siguiente muestra, y vive la *Vida de reserva* en lugar de desaparecer de golpe o quedarse para siempre. Los datos se **desvanecen** durante la última fracción *Fundido* de su vida en lugar de saltar: con una muestra viva por persona, un dato que desaparece entre un fotograma y el siguiente hace parpadear todo el campo a la frecuencia de muestreo. *Fundido* 0 restablece el corte brusco.

Vida útil necesita una columna de persona además de la de tiempo; sin ella, el historial vuelve a Acumulado al cargar. En [Calor de línea](line-heat.md#playback) el historial fija cuánto tiempo permanece visible la cola de una ruta; en la [superposición de figuras](box-replay.md) la *Vida de reserva* es cuánto se mantiene a una persona sin más muestras.

## Comportamiento de la reproducción {#playback-behaviour}

Desde el bucle de fotogramas ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- El cabezal avanza según *tiempo de fotograma × velocidad*. El tiempo de fotograma se limita a 0,1 s, así que cambiar de pestaña no teletransporta el cabezal.
- Pulsar reproducir en el final absoluto del rango empieza desde el principio, como hace un reproductor multimedia. En cada carga el cabezal se coloca al inicio, así que la primera pulsación de reproducir sí reproduce.
- Al final del rango, el cabezal vuelve al inicio (Bucle activado) o se detiene allí y la reproducción termina (Bucle desactivado).
- El deslizador lee el cabezal del motor directamente en cada fotograma; el estado de la aplicación se actualiza al buscar, arrancar, detener y al hacer bucle.
- Elegir una sesión en el Selector de sesión salta al inicio de esa sesión.

## Por qué la reproducción es fluida y barata {#why-playback-is-smooth-and-cheap}

Las filas se guardan ordenadas por tiempo, así que una ventana temporal son dos búsquedas binarias sobre la columna de tiempo: avanzar el cabezal mueve dos enteros y no toca ninguna fila, y el coste de la reproducción depende del número de filas en la ventana, no del tamaño del conjunto de datos.

Cómo se mantiene estable el calor mientras la ventana se mueve depende del historial ([Acumulación](accumulation.md)):

- **Acumulado** solo crece, así que cada fotograma añade solo las filas que se han vuelto visibles desde el anterior, con peso completo. El campo se construye de forma monótona y pausar no cambia nada, porque no queda nada por llegar. (Volver a estimar haría que cada fotograma iluminara un subconjunto aleatorio distinto y luego lo desvaneciera, lo que se ve como ráfagas que se encienden y se apagan.)
- **Ventana** y **Vida útil** cambian de verdad en cada fotograma y se vuelven a estimar, mezclados como media móvil exponencial (peso 0,34 para el fotograma nuevo), que es insesgada en estado estable y mucho más silenciosa que empezar de nuevo.
- En modo Vida útil, las filas candidatas son las de *cabezal - máx(mayor hueco de los datos, Vida de reserva)* hasta el cabezal; el shader descarta después cada fila cuya vida ya terminó y aplica el fundido.

Cambiar entre Todo y Reproducir, o cambiar el historial, reinicia la acumulación.

## Teclado {#keyboard}

| Tecla | Efecto |
|---|---|
| `K` | Reproducir / pausar |
| `J` | Reproducir hacia atrás; pulsarla de nuevo pausa (solo Figuras superpuestas) |
| `L` | Reproducir hacia delante; pulsarla de nuevo pausa (solo Figuras superpuestas) |

`J` y `L` también ponen la línea de tiempo en **Reproducir**. Las teclas se ignoran mientras un cuadro de texto o un menú tenga el foco. En la pestaña Análisis de carrera, `K` controla en cambio la repetición propia de esa pestaña.
