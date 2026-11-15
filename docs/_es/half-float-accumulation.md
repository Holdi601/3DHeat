---
title: "Acumulación en media precisión"
parent: "Detalles del renderizado"
nav_order: 4
lang: "es"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Acumulación en media precisión

Algunas tarjetas gráficas solo pueden guardar el calor en números pequeños de 16 bits, que podrían cortar o redondear los puntos más calientes. El visor escala los números para que esto no se note. Usted no tiene que hacer nada; esta página es para desarrolladores.

## Para desarrolladores {#for-developers}

Un dispositivo que no puede mezclar en texturas de coma flotante de 32 bits (sin `float32-blendable` y `float32-filterable` en WebGPU, sin `EXT_float_blend` en WebGL2) recibe un destino de calor de **coma flotante de 16 bits** (`r16float`): un máximo de 65.504 y 11 bits de mantisa. Un campo denso llega a cientos de miles, así que un destino de 16 bits **recorta** y **redondea**, y el error de redondeo crece con el valor. Eso se manifiesta de una forma muy concreta: las zonas más densas se ven mucho más frías de lo que son, mientras que las zonas dispersas se ven bien. Dos mecanismos lo resuelven; la imagen solo es correcta si funcionan los dos.

### Rango: una ganancia en cada splat {#range-a-gain-on-every-splat}

Cada splat se multiplica por una **ganancia**, y la composición la divide de nuevo, así que el campo queda en la magnitud que los medios flotantes manejan bien ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = estimación analítica de saturación para este conjunto de datos, radio e intensidad central
gain     = 2 ^ round(log2(2048 / estimate)),  exponente limitado a -20..20
```

2.048 deja unas 32 veces de margen por encima de lo alto de la rampa antes de 65.504. La ganancia es una **potencia de dos**, así que una pequeña deriva de la estimación no la cambia, ni cambia el búfer acumulado; y forma parte de la [firma de geometría](accumulation.md#what-restarts-it), así que un cambio reinicia la acumulación.

Está anclada a la estimación analítica y deliberadamente **no** al punto de saturación. La saturación se aplica en la composición precisamente para que arrastrarla nunca reinicie la convergencia; si la ganancia se moviera con ella, el búfer seguiría con valores escritos con la ganancia antigua mientras la composición dividiría por la nueva, los dos errores se anularían exactamente, y el deslizador parecería no hacer nada.

En un destino de 32 bits la ganancia es siempre 1.

### Precisión: fotogramas parciales desde cero {#precision-partial-frames-from-zero}

Un fotograma que se fusiona en el acumulador con peso 1/n se vierte primero en un **destino de trabajo** desde cero, y después se mezcla, en lugar de verterse directamente en el acumulador con peso 1/n ([Acumulación](accumulation.md#why-each)). Directamente, la aportación de cada sprite sería 1/n del tamaño del total acumulado al que se suma, y un medio flotante redondea esas cantidades; y cuanto más denso es el píxel, peor. Desde cero, cada sumando es comparable al total al que se une, que es la misma aritmética que ya hace un solo fotograma.

### Efecto medido {#measured-effect}

En una escena sintética densa, leyendo el campo en unidades comparables:

| | p50 | p90 | p99 | máx. |
|---|---|---|---|---|
| 32 bits (referencia) | 6.051 | 60.742 | 121.199 | 232.744 |
| 16 bits, antes | 1.372 | 6.972 | 7.840 | 7.840 |
| 16 bits, después | 5.996 | 59.666 | 118.824 | 210.357 |

El pico pasó de estar 30 veces demasiado bajo a 0,90×, y el fotograma compuesto coincide con el de 32 bits en un 0,1 % de la luminancia media.

### Probarlo {#testing-it}

`?heat=f16` fuerza esta ruta en cualquiera de los dos motores: sin un interruptor, la aritmética que solo ejecutan las GPU más débiles solo se probaría en las personas que las usan. `npm run smoke:f16` ejecuta todo el conjunto de pruebas del navegador con ella.

Las lecturas deshacen la ganancia: la autoexposición divide el campo leído entre ella, y `engine.readHeatProbe()` se la pasa al renderizador, que es también como se lee la [lectura de calor en vivo de la regla](measure.md#notes).
