---
title: "Generador sintético"
parent: "Cargar datos"
nav_order: 5
lang: "es"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Generador sintético

¿No tiene datos propios? Pulse un botón y 3DHeat inventa para usted una batalla de mentira, tan pequeña o tan grande como quiera.

1. Abra el panel **Conjunto de datos** en la barra lateral de Mapa de calor (debajo de **Origen**).
2. Desplácese hasta **Generador sintético**.
3. Ponga **Filas (millones)**. Pruebe primero con 1: el valor por defecto de 8 millones es pesado para una primera prueba.
4. Pulse **Generar**.

![1 millón de filas, 8 equipos, dibujados en Calor por equipo](../assets/img/en/synthetic-generator-team-heat.webp)

El panel **Conjunto de datos** puede generar un conjunto de datos en lugar de cargarlo. Sirve para dos cosas: probar el visor sin datos propios, y comprobar si un número dado de filas, un radio de sprite y un presupuesto mantienen una tasa de fotogramas utilizable en un equipo *antes* de cargarle encima un conjunto real grande. Su movimiento tiene la forma de una partida de battle royale: los equipos empiezan separados y luego se van apretando, porque el ruido uniforme se ve bien con cualquier presupuesto y oculta justo los artefactos que vale la pena detectar.

## Controles {#controls}

| Control | Por defecto | Significado |
|---|---|---|
| **Filas (millones)** | 8 | Filas a generar. Se redondea hacia abajo a un número entero de ticks por jugador. |
| **Equipos** | 8 | Número de grupos (al menos 1). |
| **Por equipo** | 12 | Jugadores por grupo (al menos 1). |
| **Semiextensión del mapa (m)** | 4.000 | La mitad de la anchura de la zona jugable en X y Z. |
| Línea de estimación | | «≈ X GB de RAM, Y GB en la GPU tras la cuantización.» (unos 26 bytes de RAM y 8 bytes de GPU por fila). |
| **Generar** | | Genera en el trabajador de carga, con progreso, y sustituye cualquier conjunto de datos cargado. |

La generación se ejecuta en el trabajador de segundo plano, así que decenas de millones de filas no bloquean la página.

## Qué genera {#what-it-generates}

De [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Columnas:** posición, tiempo, persona (`P000`, `P001`, ...), grupo (`Team 1`, `Team 2`, ...), guiñada y cabeceo, y vidas útiles. Sin columna de sesión y sin columnas de filtro.
- **Tiempo:** una muestra por jugador cada 0,25 s, empezando en 0 (tiempo relativo, sin reloj de pared).
- **Movimiento:** cada equipo empieza en su propio sector de un anillo a un 55-95 % de la semiextensión. Un círculo seguro centrado cerca del medio (desplazado al azar hasta un cuarto de la semiextensión) se encoge hasta el 8 % de la semiextensión en seis fases con mesetas; cada jugador se dirige hacia un punto errante dentro de él, con amortiguación y ruido. La altura oscila entre 0 y 220 m.
- **Dirección de la mirada:** guiñada según la dirección de marcha, cabeceo a partir de la velocidad vertical.
- **Repetible:** la semilla aleatoria es fija (1337), así que los mismos ajustes siempre producen los mismos datos.

Todos los modos de calor, la repetición de cajas y el calor de línea (trayectorias completas, ya que no hay columna de eventos) funcionan con él. El historial de vida útil también funciona.
