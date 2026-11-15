---
title: "Mando y HOTAS"
parent: "Cámara y controles"
nav_order: 1
lang: "es"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Mando y HOTAS

Puede volar la cámara con un mando de estilo Xbox en lugar del teclado. Úselo cuando quiera recostarse y mirar alrededor de una escena grande. Su entrada **se suma** a la del teclado, así que puede usar los dos a la vez.

## Conectar un mando {#connect-a-controller}

1. Conecte el mando (o empareje).
2. Pulse la vista y apriete cualquier botón del mando. Los navegadores solo muestran un mando después de su primera entrada.
3. Abra **Cámara y escena → Mando**. La lista de dispositivos lo muestra con `●`.
4. Empuje el stick izquierdo para volar y el derecho para mirar. Si la cámara se desplaza con los sticks centrados, suba la **Zona muerta**.

Funciona cualquier dispositivo que el navegador asigne a la disposición estándar de mando. Un stick de vuelo o un acelerador (HOTAS) se ignoran por defecto; véase más abajo.

## Asignación {#mapping}

| Control | Efecto |
|---|---|
| Stick izquierdo | Mover: adelante y atrás, y deslizarse de lado |
| Stick derecho | Mirar: guiñada y cabeceo, a *Velocidad de mirada* grados por segundo con el stick a fondo |
| `RT` / `LT` (analógicos) | Subir / bajar; en la proyección paralela, acercar / alejar |
| `RB` (mantenido) | 6 veces más rápido |
| `LB` (mantenido) | 15 % de velocidad |
| `A` (mantenido) | Sprint 3 veces (se combina con RB/LB) |
| `Y` (pulsar) | Encuadrar los datos |

Los números de botón siguen la disposición estándar: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; los sticks van en los ejes 0-1 (izquierdo) y 2-3 (derecho).

## Los ajustes del Mando {#the-gamepad-settings}

En **Cámara y escena → Mando**. **Ajustes** / **Ocultar** abre y cierra los controles de ajuste.

| Control | Por defecto | Rango (rueda de ajuste) | Significado |
|---|---|---|---|
| **Activada** | activado | | |
| Estado de los dispositivos | | | Cada dispositivo conectado, con `●` si se sigue y `○` si no. En los dispositivos no estándar aparece *- no es un mando XInput, se ignora* o *- no es un mando XInput, se usa igualmente*. Sin ninguno: *No se detecta ningún mando. Los navegadores solo muestran un mando después de que envíe su primera entrada: pulse un botón en él.* |
| **Usar dispositivo** | *Solo mandos XInput (recomendado)* | | Se muestra cuando hay conectado un dispositivo no estándar. Elija un dispositivo por su nombre para seguirlo en su lugar. |
| **Velocidad de mirada** | 150°/s | 20-540 (5000) | Velocidad de giro con el stick derecho a fondo. |
| **Zona muerta** | 12 % | 0-50 % (95 %) | Radial: un empuje en diagonal nunca pasa a un solo eje. Súbala si la cámara se desplaza con los sticks centrados. |
| **Curva del stick** | x² | lineal (1) a x⁴ (16) | Exponente de respuesta tras la zona muerta: control más fino cerca del centro, y aun así velocidad máxima en el borde. |
| **Invertir Y del stick** | no | | |
| **Intercambiar sticks** | no | | Mover con el stick derecho y mirar con el izquierdo. |

La forma del stick: con desplazamiento *m* (la longitud del vector del stick) y zona muerta *d*, la salida es ((m - d) / (1 - d)) ^ curva, en la dirección del stick, y 0 dentro de la zona muerta.

## Por qué, por defecto, solo mandos estándar {#why-only-standard-pads-by-default}

La API de Gamepad informa de **todos** los dispositivos HID con ejes (sticks de vuelo, aceleradores, pedales, volantes), y esos no descansan en el centro: un eje de giro o una palanca de gases están a fondo cuando nadie los toca. Leídos como un stick, eso es una entrada permanente a máxima velocidad que ninguna zona muerta puede suprimir, y la cámara gira sola desde que se carga la página (y todos los modos de calor también parecen rotos, porque una cámara en movimiento reinicia la acumulación en cada fotograma).

Por eso un dispositivo solo se sigue cuando el navegador informa de `mapping: "standard"`, su forma de decir «un mando de estilo XInput con los ejes donde se espera». Los demás dispositivos aparecen en la lista marcados como ignorados, y **Usar dispositivo** permite elegir uno de forma explícita, por ejemplo para volar la cámara con un HOTAS. Una vez que se sigue un mando, la cámara se queda con él, así que dos mandos no se pelean por la cámara según el orden de enumeración.

**HOTAS:** solo se leen los ejes 0-3 (dos sticks) y los botones estándar. Un acelerador o unos pedales en otros ejes no hacen nada, y un stick o acelerador cuyos ejes no descansen en el centro puede necesitar una **Zona muerta** mayor.

Los navegadores ocultan un mando hasta que ha enviado su primera entrada; así que un mando conectado que nadie ha tocado todavía no existe para la página.
