---
title: "Eventos de control del coche"
parent: "Análisis de carrera"
nav_order: 54
lang: "es"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: false
---

# Eventos de control del coche

El visor mira cómo se condujo cada vuelta y marca dónde el piloto hizo deslizar el coche, trompear, chocar contra algo o perder agarre. Esto sirve mucho, porque un error que costó tiempo es lo más rápido de corregir.

![La sección Control del coche: cuántas veces cada vuelta bloqueó una rueda, patinó o se fue hacia fuera, y la lista de fallos con uno abierto](../assets/img/en/race-control-table.webp)

## En palabras sencillas {#in-plain-words}

- **Bloqueo**: frenas tan fuerte que una rueda deja de girar y se desliza. El coche frena peor y no puede girar.
- **Patinamiento**: pisas el acelerador tanto que las ruedas motrices giran más rápido de lo que avanza el coche. Pierdes tracción.
- **Sobreviraje**: la parte trasera del coche se desliza hacia fuera. Si da una vuelta completa, eso es un **trompo**.
- **Subviraje**: la parte delantera del coche se desliza hacia fuera ("empuja"). Girar más el volante no ayuda.
- **Impacto** y **estrellado**: el coche tocó algo. Un golpe es un empujón o un roce; un estrellado es uno fuerte.
- **ABS**, **TC**: las ayudas del propio coche, que actúan contra el bloqueo y el patinamiento. No son errores.

## La sección Control del coche (qué ves) {#the-car-control-section-what-you-see}

Para la vuelta elegida, con lo que traigan las vueltas: aunque no haya deslizamiento de neumáticos ni ángulo de deriva, muestra lo que aún se puede encontrar en lugar de nada (más abajo).

**La tabla**: una fila por tipo que muestre cualquiera de las dos vueltas: Ruedas bloqueadas, Patinamiento, Trasera que se va (sobreviraje y trompos), Empujando hacia fuera, Estrellados, Impactos, ABS activo, Control de tracción activo, Freno de mano, En el aire. Cada celda dice "número · segundos", para la vuelta elegida y para la vuelta con la que se compara. Y *Mayor ángulo de deriva* cuando hay un ángulo de deriva (el mayor, en el suelo).

**La lista**: sus fallos no compartidos que cuestan al menos 0,02 s, del más caro al más barato, como máximo 12. Cada uno tiene su título y su coste (y la etiqueta de su tipo). Haz clic en uno para leer su consejo, alinear los coches 40 m antes y repetirlo. **Qué hizo también cada vuelta allí** añade todos los fallos, incluidos los compartidos (etiqueta "ambos lo hicieron", coste "—" por debajo de 0,01 s). Si no hay ninguno: "Nada que X hiciera con los neumáticos le costó tiempo que Y no hiciera también."

**La pista debajo** dice con qué pudo ver la detección: "Según el deslizamiento de cada rueda y su ángulo de deslizamiento, y el ángulo de deriva del coche." (o deslizamiento y ángulo de deslizamiento, deslizamiento y ángulo de deriva, solo deslizamiento, o "Solo con el ángulo de deriva del coche: estas vueltas no traen deslizamiento de neumáticos."). También dice sobre qué superficie se midieron los límites (asfalto, suelto o mixto: más de 80 % de muestras sueltas es suelto, menos de 20 % es asfalto), a qué vuelta se compararon los eventos y cómo se cuenta el coste.

Con **ningún deslizamiento de neumáticos y ningún ángulo de deriva** (un archivo de vuelta de FH Companion sin su telemetría), la tabla y la lista se muestran igual, y la pista dice qué se encontró aún con lo que traen las vueltas: "Estas vueltas no traen deslizamiento de neumáticos ni ángulo de deriva, así que no se pueden distinguir bloqueos ni patinamiento. Aún se encuentran: empujes, a partir del volante frente a la trayectoria; impactos y estrellados, a partir de la velocidad y la aceleración." Los deslizamientos según la velocidad de giro también se nombran cuando las vueltas la tienen, y los empujes solo donde hay volante. La frase sobre los límites de deslizamiento y deriva se omite, y una segunda pista dice: "Para Forza Horizon, elige también el archivo `.tele.gz` junto a cada vuelta de FH Companion: es la telemetría completa, el deslizamiento de cada rueda 64 veces por segundo."

El **coste total** de control de la vuelta (que se usa en los resúmenes) cuenta una vez los fallos que se solapan: un bloqueo y el deslizamiento que empieza con él, dentro de 40 m. Se cuenta el más caro del grupo.

## Cómo se detecta {#how-it-is-detected}

El resto de esta página es el libro de reglas: cada tipo, cada umbral.

Código: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
El razonamiento y la bibliografía están en [el método](race-analytics.md).

## Los tipos {#the-kinds}

| Tipo | Fila de la tabla | ¿Un fallo? | Lo más corto que cuenta |
|---|---|---|---|
| `lock` | Ruedas bloqueadas | sí | 0,1 s |
| `wheelspin` | Patinamiento | sí | 0,15 s |
| `oversteer` | Trasera que se va | sí | 0,2 s |
| `spin` | (contado con Trasera que se va) | sí | 0,1 s |
| `understeer` | Empujando hacia fuera | sí | 0,25 s |
| `crash` | Estrellados | sí | - |
| `hit` | Impactos | sí | - |
| `abs` | ABS activo | no | 0,2 s |
| `tc` | Control de tracción activo | no | 0,2 s |
| `handbrake` | Freno de mano | no | 0,1 s |
| `airborne` | En el aire | no | 0,15 s |

Los tramos más cortos son ruido (un pianito, un bache, una sola muestra). Los tramos de puntos de la rejilla (cada 2 m) que pasan una prueba se unen si hay huecos de hasta 2 puntos. Solo los **fallos** pueden ser errores y tienen coste; los demás son lo que hicieron el coche y el piloto.

## Lo que necesita cada prueba {#what-every-test-needs}

### Canales derivados {#derived-channels}

Antes de juzgar nada, cada vuelta recibe lo que su juego no envía, con nombres canónicos (el valor propio de un juego siempre gana):

| Canal | De dónde sale |
|---|---|
| `bodySlip` (ángulo de deriva) | la velocidad en el marco del coche, `atan2(latVel, abs(longVel))`, donde el juego la envía (0 por debajo de 3 m/s); si no, el rumbo (la guiñada del juego, ajustada a la dirección de marcha por signo y desfase sobre muestras de más de 10 m/s, y solo válida con una varianza circular menor que 0,05) frente a la dirección de marcha (posiciones separadas al menos 2 m), a velocidades superiores a 3 m/s |
| `yawRate` | el cambio de `yaw` con el tiempo, cuando hay rumbo pero no velocidad de giro |
| `airborne` | el contacto de cada rueda con el suelo desactivado (≤ 0,5); si no, la carga de cada rueda por debajo del 5 % de su mediana; si no, cada recorrido de suspensión igual o menor que 0,02 (totalmente extendida). Una sola muestra suelta no es un vuelo |
| `slipRatio.<W>` | `(velocidad de superficie de la rueda - velocidad del coche) / velocidad del coche` por encima de 3 m/s, donde el juego envía las velocidades de superficie de las ruedas; o a partir del giro de la rueda × un radio de rodadura medido en la vuelta: la mediana de `speed / rotation` mientras el coche rueda sin acelerar en línea recta (velocidad > 10 m/s, acelerador < 0,3, freno < 0,05, abs(aceleración longitudinal) < 3 m/s², sin estar en el aire; todas las muestras por encima de 10 m/s cuando hay menos de 20), aceptado entre 0,1 y 1 m. Marcado `physical` |
| `loose` | el ruido de superficie de Forza en al menos 2 ruedas (> 0,001) durante al menos 0,33 s (un pianito es más corto), con huecos menores de 1 s unidos |

### En el suelo y estable {#on-the-ground-and-settled}

No se juzga nada en el aire ni durante **0,3 s después de un aterrizaje**. La suspensión toca fondo y las aceleraciones se disparan, y eso no es agarre, frenada ni tracción. Además, la muestra tiene que estar **en movimiento**: a más de 5 m/s.

### El suelo {#the-ground}

El suelo de cada muestra es **suelto** donde el canal `loose` de la vuelta lo dice (el ruido de superficie de Forza, los materiales de rueda de Trackmania); si no, la superficie de la vuelta (ver [disciplina y superficie](race-loading-laps.md#discipline-and-surface)): asfalto, o suelto para cualquier otra cosa. Las curvas, los hábitos de deriva y los umbrales se mantienen separados para el asfalto y el suelo suelto.

### Deslizamiento, como múltiplo del pico nominal del neumático {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Los juegos escalan el deslizamiento de forma distinta; `meta.slip` dice cómo, y cada deslizamiento se divide entre una escala para que alrededor de 1 sea el pico nominal del neumático:

| `meta.slip` | Significado | Se divide entre |
|---|---|---|
| `peak` | normalizado por el juego: pasado 1 se pierde agarre (Forza Data Out) | 1 |
| `scaled` | deslizamiento físico dividido entre un pico de asfalto (el grabador de Kunos) | el pico nominal del suelo entre el del asfalto |
| `index` | una medida de deslizamiento de 0 a 1 (SlipCoef de Trackmania) | 0,5 |
| `physical` (o desconocido) | deslizamiento de la rueda como fracción, ángulo de deslizamiento en radianes | el pico nominal del suelo |

Picos nominales, cuando no se sabe nada mejor:

| Superficie | Deslizamiento de rueda | Ángulo de deslizamiento |
|---|---|---|
| asfalto | 0,12 | 8° |
| mixto | 0,18 | 12° |
| suelto (grava) | 0,25 | 15° |
| nieve | 0,25 | 15° |
| hielo | 0,10 | 6° |

### Dónde se acaba el agarre: las curvas de neumático de cada coche {#where-grip-ends-each-cars-tyre-curves}

Dónde un neumático deja de dar más se **mide por coche**, a partir de cada vuelta cargada con él (`measureTyres`), por separado para el asfalto y el suelo suelto:

| Curva | Muestras (velocidad > 10 m/s, estable, aceleraciones menores de 45 m/s²) | Deslizamiento (x) | Fuerza (y) |
|---|---|---|---|
| frenada | freno > 0,3, freno de mano ≤ 0,2, en línea recta (lateral menor que el 30 % de lo máximo) | abs(media del deslizamiento de rueda de las cuatro ruedas) | deceleración |
| tracción | acelerador > 0,8, freno ≤ 0,05, recto, el tirón del coche a máximo gas a esa velocidad > 0,5 m/s² | el deslizamiento de rueda motriz mayor | aceleración como parte de ese tirón |
| delantera | lateral por encima del 30 % de lo máximo, el agarre del coche a esa velocidad > 1 m/s² | el mayor ángulo de deslizamiento delantero | aceleración lateral como parte de ese agarre |
| trasera | lo mismo | el mayor ángulo de deslizamiento trasero | lo mismo |

"Lo máximo" es el percentil 99 de abs(aceleración lateral) de la vuelta en ese suelo (todo el suelo, cuando tiene menos de 50 muestras). La transmisión decide las ruedas motrices (delanteras en tracción delantera, traseras en propulsión, las cuatro en AWD; desconocida: todas).

Desde al menos **150 muestras**, el deslizamiento se corta en 6 a 14 franjas de igual número de muestras (una por cada 40 muestras). La fuerza de cada franja es su cuartil superior (lo que dio el neumático cuando el piloto lo pidió), suavizada con las franjas vecinas. El **mejor** es la franja con más fuerza; el **límite** es la primera franja después de la cual la fuerza ha caído un **8 %**. Una curva que nunca cae en los datos no tiene límite (infinito): pasar del "pico" no cuesta nada en ese juego, y el deslizamiento solo no marca nada allí (las curvas de paso por curva y de tracción de Forza Horizon son así). Con muy pocas muestras en un suelo, se usan las del otro suelo; con muy pocas en total, el límite **nominal**: 1,5 veces el pico nominal.

Cada coche también recibe:

- su **hábito de deriva**: el cuartil superior de su ángulo de deriva en cada curva a 60 % de su máximo o más (necesita 100 muestras);
- su **dirección por curvatura** (`steerGain`), por cada banda de velocidad de 5 m/s: la mediana de abs(dirección) / curvatura de la trayectoria, tomando curvas con firmeza pero bien dentro de su agarre (30-60 % de su máximo, curvatura más cerrada que un radio de 400 m, dirección por encima de 0,02; 25 muestras por banda). La curvatura de la trayectoria es la velocidad de giro dividida entre la velocidad, donde el juego envía una velocidad de giro; si no, a partir de las posiciones ±5 m.

## Detección, tipo por tipo {#detection-kind-by-kind}

| Tipo | Prueba (con muestras en movimiento y estables) | `peak` y `limit` |
|---|---|---|
| **lock** | freno > 0,05, freno de mano no por encima de 0,2, y el deslizamiento de alguna rueda por debajo de menos el límite de frenada | el deslizamiento más negativo (múltiplos del pico nominal); el límite como negativo |
| **wheelspin** | acelerador > 0,2 (o sin canal de acelerador), y el deslizamiento de una rueda motriz por encima del límite de tracción | el mayor deslizamiento motriz; el límite |
| **oversteer** (ángulo de deriva) | el ángulo de deriva por encima del mayor entre el suelo mínimo de la superficie y 1,5 × el hábito de deriva del coche allí | el mayor ángulo de deriva, en radianes |
| **oversteer** (ángulos de deslizamiento, sin ángulo de deriva) | el mayor ángulo de deslizamiento trasero por encima del límite trasero y más de 0,25 por encima del delantero | el ángulo de deslizamiento trasero (múltiplos del pico) |
| **oversteer** (sin ángulo de deriva, pero con velocidad de giro y aceleración lateral) | la "velocidad de actitud" - abs(velocidad de giro) menos abs(aceleración lateral) / velocidad, por encima de 8 m/s - por encima de 0,2 rad/s, con la dirección contra la curva | rad/s; límite 0,2 |
| **spin** | un tramo de sobreviraje cuyo ángulo de deriva llegó a más de **60°** | como sobreviraje |
| **understeer** (ángulos de deslizamiento) | sin deslizarse, el mayor ángulo de deslizamiento delantero por encima del límite delantero y más de 0,3 por encima del trasero | el ángulo de deslizamiento delantero; el límite |
| **understeer** (sin ángulos de deslizamiento) | más rápido de 12 m/s, sin deslizarse, sin contravolante, aceleración lateral por encima de la mitad de lo máximo de la vuelta (percentil 99), trayectoria más cerrada que un radio de 300 m, y la dirección más de **1,6 veces** lo que la propia dirección por curvatura del coche dice que pedía la trayectoria | las veces que hacía falta dirección; límite 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` por encima de 0,5 | - |
| **handbrake** | `handbrake` por encima de 0,2 | - |
| **airborne** | `airborne` por encima de 0,5 | - |
| **hit**, **crash** | ver [Impactos y estrellados](#hits-and-crashes) | la velocidad que se perdió en el impacto |

Los suelos mínimos de ángulo de deriva por superficie: asfalto **7°**, mixto **10°**, suelto y nieve **15°**, hielo **10°**. Un coche que derrapa más de forma normal (un modelo de neumático arcade, un especialista en grava) tiene su propio umbral, más alto, a partir de sus propias vueltas (1,5 × su hábito).

**Hacia dónde gira el coche** (para "contra la curva"): el cambio de rumbo de la trayectoria de la vuelta en ±6 m (al menos 2 puntos de rejilla); más cerrado que un radio de 600 m cuenta como curva; derecha o izquierda según si el mundo está reflejado. La dirección está **contra** la curva cuando abs(dirección) > 0,05 y su signo es opuesto al de la curva: un deslizamiento que se **corrige** con contravolante.

**Los pedales al empezar** (`pedal`): *frenada* cuando el freno está por encima de 0,1; *acelerador* por encima de 0,3; *levantado* cuando el acelerador estuvo por encima de 0,5 dentro de los 8 puntos de rejilla (16 m) antes; *sin pedal* en otro caso (o sin canal de acelerador).

## Comparado con la otra vuelta {#laid-against-the-other-lap}

Cada evento se juzga frente a la vuelta con la que se compara la vuelta elegida en ese tramo (la mejor de su clase; para la propia vuelta, la más rápida de su clase en ese tramo):

1. **Hasta dónde llegó la otra vuelta** en los mismos metros, ±8 m: los propios eventos de la otra vuelta de la misma familia (un trompo cuenta como sobreviraje, un estrellado como impacto), medidos en las mismas unidades, sin umbrales, con las curvas de neumático del otro coche.
2. **Compartido** cuando la otra vuelta llegó al **80 %** o más de esa distancia: así se toma esa curva, no es un error. Los tipos que no son fallos siempre son "compartidos".
3. **Coste**, para un fallo no compartido: el tiempo que esta vuelta perdió frente a la otra desde 5 m antes del evento hasta **40 m después** (para un impacto o un estrellado, hasta que el coche recupera su velocidad: los metros que necesita para recuperarla con su propio tirón, de 40 a 400 m; sin un tirón medido, 5 m/s²). Nunca es negativo.
4. **Velocidad regalada** hasta el límite del coche: para un bloqueo, la deceleración que el coche demuestra que puede hacer a esa velocidad menos la que hizo, sumada durante el evento; para el patinamiento, su tirón a máximo gas menos el que hizo; para un impacto, la velocidad que se perdió. Se indica cuando supera 0,5 m/s (1,8 km/h).

Un fallo que no es compartido y cuesta al menos **0,02 s** se lista (las [estadísticas de recorrido](race-course-statistics.md) cuentan solo los fallos de **0,03 s** o más, para que un error contado en muchas vueltas sea uno claro), y puede convertirse en la causa de la pérdida de una curva (ver [Análisis curva por curva](race-corner-analysis.md#car-control-faults-and-impacts)).

## Impactos y estrellados {#hits-and-crashes}

`impacts.ts` lee los impactos de las **propias muestras** de la vuelta, antes de volver a muestrearlas: un impacto dura centésimas de segundo. Los neumáticos no pueden producir las fuerzas de un impacto, así que un impacto se mide contra el propio coche de la vuelta:

- **Su agarre `G`**: el percentil 99 de su aceleración horizontal `√(lat² + long²)` en la vuelta, en el suelo y a más de 5 m/s. Sin canales de aceleración (o por debajo de 3 m/s²), 15 m/s²: el agarre de un coche de carretera.
- **Umbral**: `max(1,8 G, G + 18, 30)` m/s².
- **Muestra golpeada**: la aceleración horizontal por encima del umbral *y* que salta más de la mitad de `G` desde la muestra anterior; **o** la velocidad que cae, dentro de 0,1 s, en más de lo que el umbral daría en 0,1 s más 1,5 m/s. Solo en el suelo y estable, y solo cuando el coche iba a más de 5 m/s.
- Las muestras golpeadas dentro de **0,4 s** son un solo impacto.
- **Antes / después**: la velocidad más alta en los 0,15 s anteriores; la más baja hasta 0,3 s después de la última muestra golpeada.
- **No es un impacto**: la velocidad perdida sin fuerza detrás - la aceleración horizontal máxima dentro de 0,1 s por debajo del mayor entre `G` y 25 m/s² - es el juego que rebobina o reinicia el coche.
- **Estrellado** cuando perdió **30 km/h** o más, o cuando dejó al coche por debajo de la mitad de su velocidad; **impacto** en otro caso: un empujón, un roce contra un muro.
- **Dirección**: la aceleración longitudinal mayor que la lateral, y negativa: *de frente*; positiva: *por detrás*; la lateral mayor: *por el costado*. Sin aceleraciones, de frente.

Lo que puede hacer un coche se mide con todos los impactos quitados, desde 0,1 s antes hasta 1 s después de cada uno (`struckMask`).

## Los textos {#the-texts}

Cada evento se dice nombrando las dos vueltas, con dónde (metros a lo largo de la referencia), la velocidad con la que empezó, cuánto se pasó del límite frente a la otra vuelta, y un consejo. El consejo sale del tipo y de lo que se midió:

| Evento | Consejo |
|---|---|
| bloqueo, solo delanteras | una delantera bloqueada no puede girar: menos presión al principio de la zona, suéltala al entrar en la curva |
| bloqueo, solo traseras | una trasera bloqueada deja que el coche rote: frena más en línea recta, suelta al girar; mueve el reparto hacia delante si sigue pasando |
| bloqueo, suelo suelto | una rueda bloqueada se hunde: aprieta hasta quedarte justo antes de bloquear |
| bloqueo, en otro caso | demasiado pedal para el agarre: aprieta más progresivamente |
| patinamiento | mete el acelerador a medida que el volante se desenrolla; cambia pronto donde la tracción es el límite (en suelo suelto: una marcha más alta suaviza el par) |
| trompo / sobreviraje | según el pedal: bajo frenada (trail braking demasiado fuerte, una reducción demasiado temprana), levantado (sobreviraje al soltar: mantén un acelerador constante), con el acelerador (demasiado mientras sigue girado), ninguno (entraste en la curva demasiado rápido); "corregido con contravolante" cuando se contravoleó; en suelo suelto o en rally, "algún ángulo es la forma rápida de dar la vuelta: el de la otra vuelta bastó" |
| subviraje | girar más el volante no sirve una vez que la delantera se ha ido: entra más despacio, mantén un poco de freno para cargar la delantera, desenrolla; en suelo suelto, gira el coche con un levantamiento o un toque con el pie izquierdo |
| impacto / estrellado | por el costado: un metro de margen cuesta menos que el roce; por detrás: otro coche o deslizarse hacia atrás; un estrellado de frente: frena antes; un golpe en la parte delantera: rozaste algo. "X también chocó allí." cuando es compartido |

En Trackmania, un deslizamiento también dice: por debajo de unos **400 km/h** (**300** en suelo suelto: tierra, hierba, plástico) un deslizamiento da menos tracción que el agarre; por encima, un speedslide al ángulo correcto gana tiempo, y este costó tiempo, así que su ángulo estaba mal.

## Lo que permite cada fuente {#what-each-source-allows}

| Las vueltas traen | Bloqueos / patinamiento | Sobreviraje / trompo | Subviraje |
|---|---|---|---|
| deslizamiento de rueda y ángulo de deslizamiento por rueda, velocidad del coche (Forza Data Out, los juegos de AC) | a partir del deslizamiento | a partir del ángulo de deriva, o del ángulo de deslizamiento trasero | a partir de los ángulos de deslizamiento |
| velocidades de rueda, velocidad en el mundo (juegos de rally, BeamNG) | a partir del deslizamiento derivado | a partir del ángulo de deriva derivado | a partir de la dirección por curvatura |
| guiñada y velocidad de guiñada, sin deslizamiento (iRacing) | - | a partir del ángulo de deriva (la guiñada ajustada frente a la dirección de marcha); a partir de la velocidad de actitud con contravolante solo cuando no se puede confiar en la guiñada | a partir de la dirección por curvatura |
| solo rumbo | - | a partir del rumbo frente al recorrido | a partir de la dirección por curvatura |
| solo el archivo de vuelta de FH Companion (sin guiñada, sin deslizamiento) | - | - | a partir de la dirección por curvatura (tiene dirección y aceleraciones) |

Los impactos y estrellados solo necesitan velocidad (mejor con aceleraciones), así que todas las fuentes los tienen. La sección **Control del coche** muestra lo que permite cada fuente: con un archivo de vuelta de FH Companion solo, sus empujes a partir de la dirección y sus impactos, y el consejo de cargar el `.tele.gz` para lo demás.
