---
title: "Acumulación"
parent: "Detalles del renderizado"
nav_order: 2
lang: "es"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Acumulación

Cuando el visor no puede dibujar cada punto en un solo fotograma, dibuja una parte, luego otra, y suma las imágenes mientras tú estás quieto. La imagen se vuelve más nítida, como una foto que se revela. Mover la cámara empieza de nuevo. La línea **Cobertura** de la superposición de estadísticas muestra cuánto ha avanzado.

![La superposición de estadísticas: Cobertura muestra un porcentaje mientras la imagen se revela, y *exacta* cuando está completa](../assets/img/en/performance-stats-overlay.webp)

## Para desarrolladores {#for-developers}

Cuando un fotograma no puede dibujar todas las filas, dibuja una muestra y la pondera al alza; la imagen es entonces una estimación sin sesgo pero ruidosa. La **acumulación** fusiona fotogramas sucesivos para que la estimación converja a la respuesta exacta mientras nada cambia. Cada fotograma elige uno de cinco modos ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); el último usado está en `engine.live.accumMode`.

| Modo | Cuándo | Qué le pasa al acumulador |
|---|---|---|
| **reset** | la cámara se ha movido, algo que cambia el campo ha cambiado, el refinamiento progresivo está desactivado, una ventana creciente está empezando (primer fotograma de la reproducción, tras un salto), o la línea de calor reproducida se ha movido | Se sustituye por la estimación de este fotograma. |
| **extend** | una ventana **Acumulada** que solo ha crecido desde el último fotograma | Este fotograma dibuja solo las filas que acaban de hacerse visibles, con peso completo, y las suma. Nada se atenúa. |
| **ema** | una ventana deslizante (**Ventana**, **Vida útil**) se ha movido | `acc = acc × (1 - 0,34) + frame × 0,34`: una media móvil exponencial de unos tres fotogramas. |
| **mean** | nada ha cambiado y la estimación no está completa | `acc = acc × (1 - 1/n) + frame × 1/n` en el fotograma *n*: una media corriente. |
| **skip** (en reposo) | ha convergido y nada ha cambiado | No se dibuja nada; el fotograma solo vuelve a componer. |

### Por qué cada uno {#why-each}

- **Media corriente, no suma.** Multiplicar el búfer por 1 - 1/n y sumar 1/n del nuevo fotograma es algebraicamente lo mismo que sumar y dividir por *n* al final, pero el búfer siempre contiene lo que vale un campo. Una suma llega a *n* veces el campo, y en un destino de 16 bits se satura en 65.504; con un divisor que sigue creciendo, una vista quieta se desvanecería cuanto más tiempo estuviera parada, mientras que una cámara en movimiento, que se reinicia en cada fotograma, parece perfectamente correcta. La suite de humo verifica que 16 fotogramas fusionados dan 1,00× de lo que da un solo fotograma.
- **Extender para la reproducción acumulada.** Las filas ya acumuladas siguen visibles, así que un fotograma solo necesita la fracción de segundo que acaba de llegar, que cabe en un fotograma y entra exacta. Volver a estimar iluminaría cada fotograma un subconjunto aleatorio distinto y lo desvanecería, lo que se vería como destellos que aparecen y desaparecen, y un fotograma en pausa seguiría rellenándose. La suite verifica que el total sube de forma monótona durante la reproducción y se mantiene dentro de un 0,02 % durante 2,5 s en pausa.
- **Media móvil para las ventanas deslizantes.** Estas cambian de verdad en cada fotograma. Un peso de mezcla fijo sigue a la ventana móvil (una media sobre todos los fotogramas desde que empezó la reproducción iría por detrás del cabezal) y es mucho más estable que empezar de nuevo.
- **Reinicio para las líneas reproducidas.** Las cabezas de las líneas de calor se mueven en cada fotograma; una media móvil las emborronaría en una estela, así que cada fotograma se dibuja entero y el desvanecimiento de la cola es el propio de la imagen.
- **Los fotogramas parciales pasan por un destino temporal.** Un fotograma fusionado a una fracción del peso completo se proyecta en un destino aparte desde cero y luego se mezcla en el acumulador, en lugar de proyectarse directamente con peso 1/n. Directamente, cada sprite se sumaría con 1/n del tamaño del total al que se une, algo que un destino de media precisión redondea a cero; el peor caso es donde más denso está ([Acumulación en media precisión](half-float-accumulation.md)).

### Convergencia {#convergence}

El plan de cada fotograma sabe cuántas filas candidatas hay y cuántas envía, así que el número de fotogramas necesarios para cubrir todas las filas es ⌈candidatas / enviadas⌉. Una vez fusionados ese número de fotogramas, la vista está **convergida**: la línea *Cobertura* de la superposición de estadísticas pasa de porcentaje a *exacta*, y los fotogramas siguientes quedan en reposo. Con **Dibujar todas las filas en cada fotograma** activado (por defecto), un solo fotograma suele cubrirlo todo, así que la convergencia es inmediata, y la maquinaria progresiva solo hace falta cuando la ventana contiene más filas de las que puede llevar un plan de dibujo (unos 67 millones).

### Qué la reinicia {#what-restarts-it}

Los ajustes se agrupan según lo que el búfer acumulado sigue significando después de cambiarlos:

| Grupo | Cambios | Efecto |
|---|---|---|
| **Geometría**: qué filas contribuyen y cuánto | modo de vista; rutas de línea; radio del sprite, intensidad del centro y del borde, caída, rampa suave, la curva, límites de píxeles, aplanado; recorte por distancia cercano, lejano y plano; oclusión y ocultar tras el terreno; el corte; tamaño del lienzo; resolución del calor; visibilidad y signos de grupo; la división de diferencia; Todo / Reproducir; el historial; los filtros de columna y la selección de Entidades; la ganancia de media precisión | Reinicio. |
| **Ventana**: el intervalo de tiempo | el cabezal que se mueve; la alternativa y el desvanecimiento de Vida útil | Extender (acumulado) o media móvil (deslizante). |
| **Composición**: solo el color | saturación, respuesta a la densidad, calor mínimo, las rampas de color; el corte del nivel; la cuadrícula y los ejes; los ajustes de la repetición de cajas y la sesión; profundidad de campo | Volver a dibujar sin tocar el calor. |

Un movimiento de cámara siempre reinicia. Así que arrastrar la saturación o la rampa es gratis; arrastrar el radio del sprite reinicia la convergencia en cada paso.
