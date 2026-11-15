---
title: "Comportamiento colectivo"
parent: "Hallazgos"
nav_order: 3
lang: "es"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Comportamiento colectivo: multitudes, bandadas, manadas y decisiones bajo presión

Los jugadores de una partida se comportan como las personas en cualquier lugar: se agrupan en las puertas, siguen a quien fue primero, se mantienen juntos o se dispersan, retroceden tras grandes pérdidas y asumen más riesgo después de una mala vida. Las **métricas de la lente de comportamiento** miden estos patrones con los métodos de la ciencia de multitudes, la física del movimiento colectivo, la economía del comportamiento y la psicología militar, cada una frente a su propio modelo nulo, y las interpretan con las entradas correspondientes de la [base de conocimiento](knowledge.md).

## Pruébalo {#try-it}

1. Carga una o más partidas con tiempo, posiciones y equipos.
2. Abre **Hallazgos** y ejecútalo.
3. Despliega **Métricas de la lente**: las medidas de comportamiento aparecen junto a las demás (Alineación colectiva, Manadas por rutas, Carriles y estelas, Aglomeración, Líderes y seguidores, Cohesión y rezagados, Punto de quiebre, Riesgo tras pérdidas, Rachas, Acuerdo de compra, Supresión), cada una con sus números, su prueba y la bibliografía que la explica.
4. El **Resumen** las cita; **Escribir con IA** las envía junto con el informe.

## Las medidas {#the-measures}

Las trayectorias se remuestrean a un punto cada 2 s (la posición al final del intervalo y la velocidad a lo largo de él). Las distancias se escalan por la separación típica de los datos, es decir, la mediana de la distancia de una unidad a su compañera más cercana, así que la misma medida funciona para infantería, tanques y aeronaves.

| Medida | Qué mide | Modelo nulo y prueba | Conocimiento |
|---|---|---|---|
| Alineación colectiva | Polarización (longitud del rumbo medio de las unidades) de las unidades en movimiento de cada bando cada 2 s, el giro (rotación alrededor del centroide), las proporciones de tiempo polarizado, en giro y en enjambre, por fase de la partida; en combates entre dos bandos alineados, la parte de bajas del bando más alineado | La trayectoria propia de cada unidad desplazada en el tiempo dentro de la partida (conserva su camino, rompe la simultaneidad); prueba de cambio de signo en ventanas de 60 s | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Manadas por rutas | Con qué frecuencia una unidad sale de un lugar por donde salió antes su compañera (en 30 s), para la misma entrada, frente a las proporciones de salida propias del lugar, y frente a copiar un paso anterior del enemigo | Salidas barajadas dentro de cada lugar y entrada; el efecto es la copia del compañero menos la del enemigo (problema de reflexión de Manski: copiar y un plan compartido por el bando se parecen) | Banerjee 1992, Bikhchandani et al. 1992, Manski 1993 |
| Carriles y estelas | Segregación lateral de las dos direcciones en lugares con flujo contrario; parte del movimiento en el 10 % del terreno más transitado, su Gini, y el solapamiento del terreno más transitado de las partidas | Direcciones barajadas entre visitas completas; dos cuadrículas desplazadas medio lugar, cada una probada, con Bonferroni | Helbing et al. 1997, 2005 |
| Aglomeración | Velocidad (relativa al ritmo propio de la unidad) y flujo según el número de vecinos a menos del doble de la separación típica, la caída de capacidad en la clase más densa, en el terreno más transitado; muertes por hora en aglomeraciones; disparos por minuto de compañeros cercanos (holgazanería social) | Correlación velocidad-densidad propia de cada unidad, cambio de signo entre unidades, efecto mínimo ρ por encima de ±0,05; pruebas exactas de tasas | Helbing et al. 2000, Seyfried et al. 2005, Latané et al. 1979 |
| Líderes y seguidores | Para compañeros que viajan juntos, el retardo (hasta 8 s) en el que el rumbo de uno predice mejor el del otro; grafo de liderazgo, transitividad de los tríos, tasas de muerte y de bajas de los líderes | Pares con una trayectoria desplazada en el tiempo dan el umbral del 95 %; prueba binomial frente al 5 % | Nagy et al. 2010, Couzin et al. 2005 |
| Cohesión y rezagados | Tiempo pasado a más de tres veces la separación típica del bando respecto al compañero más cercano; tasa de muerte allí frente a la del grupo; la separación de un bando frente a su parte de bajas en un combate | Prueba condicional exacta de dos tasas de Poisson | Shils y Janowitz 1948, Siebold 2007 |
| Punto de quiebre | Velocidad de aproximación hacia el enemigo (al ritmo del propio bando) según la parte del bando perdida en el último minuto; el nivel de pérdidas más bajo en el que los bandos se retiran | Bootstrap de clúster unilateral frente a una retirada de una décima parte del ritmo (las pérdidas se dan donde los bandos se encuentran, y los bandos que se encuentran dejan de acercarse), con Bonferroni entre niveles | Dupuy 1987, Rowland 2006 |
| Riesgo tras pérdidas | Parte de la siguiente vida pasada por delante del propio bando hacia el enemigo, por encima de la parte del bando y de otras unidades que regresan en ese momento: tras una vida perdida sin baja frente a tras una con baja; muerte temprana tras muerte temprana (inclinación) | Vidas de cada unidad barajadas (se conserva la primera vida), así que el sesgo de secuencia finita forma parte del nulo | Kahneman y Tversky 1979, Thaler y Johnson 1990 |
| Rachas | P(baja tras k bajas) − P(baja tras k muertes), k = 1..3 | Secuencia de cada jugador barajada 1.000 veces: se resta el sesgo que mostraron Miller y Sanjurjo; Bonferroni entre k | Gilovich et al. 1985, Miller y Sanjurjo 2018 |
| Acuerdo de compra | Kappa de Fleiss de las bandas de equipamiento (eco, fuerza, completo; terciles fuera de Counter-Strike) dentro de una ronda del bando | Rondas-jugador del bando barajadas entre sus rondas | Fleiss 1971 |
| Supresión | Velocidad en los 4 s siguientes al daño no letal frente a los 4 s anteriores, y disparos en los 10 s siguientes frente a los anteriores, en impactos y en los momentos tranquilos de la misma unidad | Cambio de signo entre unidades, efectos mínimos de 0,05 del ritmo y un disparo por minuto | Rowland 2006 |

Cada valor p del informe pasa por el control de la tasa de falsos descubrimientos de Benjamini-Hochberg (`q`). Una medida se omite cuando los datos no pueden sostenerla: el acuerdo de compra necesita rondas y valores de equipamiento; la supresión, eventos de daño; y las rachas y el riesgo, bajas y muertes atribuidas a unidades.

## En el análisis masivo {#in-the-mass-analysis}

Cada resumen de partida (`<match>.summary.json`, mira [Análisis masivo](mass-analysis.md)) lleva las mismas medidas de esa partida en su sección `behaviour`, así que se pueden comparar miles de partidas sin volver a leer sus filas.

## Qué tan bien funciona {#how-well-it-works}

Con batallas simuladas en las que cada efecto está incorporado, y los mismos mundos sin él (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): cada medida encuentra el efecto que se le ha introducido, y los mundos nulos se quedan por debajo del umbral de falsos descubrimientos. El riesgo tras pérdidas tiene la menor potencia; las manadas por rutas no pueden distinguir la copia de un plan compartido (un bando que comparte un solo objetivo «hace manada» según esta medida).

## Para desarrolladores {#for-developers}

- `src/insights/behaviour/acc.ts`: el acumulador (trayectorias remuestreadas, eventos, rondas) y `finish`; `motion.ts` y `choice.ts`, las medidas; `bstats.ts`, los auxiliares de permutación, bootstrap y kappa; `shows.ts`, los patrones y las frases que lee la lente (`lens.<measure>`).
- `feed.ts` la alimenta con los fragmentos del worker de hallazgos; `summaryTap.ts`, desde un resumen de partida mientras se va leyendo la tabla.
- Conocimiento: `src/insights/knowledge/behaviour.ts` (entradas), `patterns-behaviour.ts`, `refs-behaviour.ts` (referencias, cada una comprobada contra su registro en Crossref o Open Library).
- Etiquetas: `lens.metric.<measure>` en `locales/*/lens.json`.
