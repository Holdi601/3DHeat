---
title: "Análisis curva a curva"
parent: "Análisis de carrera"
nav_order: 55
lang: "es"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Análisis curva a curva

Dos vueltas del mismo recorrido se comparan curva a curva. Para cada curva, el visor dice quién fue más rápido, cuánto tiempo valió y por qué (frenó demasiado pronto, pisó la potencia tarde, tomó una trazada más abierta), para que sepas qué practicar primero.

![Un hallazgo abierto en Dónde mejorar, junto a la tabla Curva a curva](../assets/img/en/race-corner-finding.webp)

Un ejemplo: en la curva 3, Driver A frena 20 m antes que Driver B y pierde 0,15 s al llegar, pero pisa el acelerador antes y gana 0,15 s a la salida. Neto: 0,00 s. La curva está igualada, y a nadie se le dice que frene más tarde.

## Qué ves {#what-you-see}

### Dónde mejorar {#where-to-improve}

La sección del panel lateral para la vuelta enfocada («Carga al menos dos vueltas de un mismo circuito.» hasta entonces).

**La cabecera:** «<vuelta> <tiempo> frente a <referencia> <tiempo>» y la diferencia de tiempo de vuelta; o, para la referencia, «frente a la vuelta más rápida de otra por cada curva (…)» y el total que perdió. Junto a ella, la pérdida dividida en *conducción* y *coche / contexto*.

**La barra de desglose:** el tiempo perdido por grupo de causa (frenada, entrada, salida, recta, coche, contexto), con los colores de las causas y una leyenda.

**Los hallazgos**, en tres listas:

1. Pérdidas de conducción, la más cara primero, como máximo **12**, o «Ningún punto donde conducir de otra forma haría ganar tiempo destaca.»
2. **Mostrar lo que costó el coche o la situación (X s)**: pérdidas del coche y del contexto, como máximo 8 (activo por defecto).
3. **Dónde <vuelta> es más rápida, o igualada de otra forma (N)**: ganancias y curvas igualadas, como máximo 10 (activo por defecto).

Cada hallazgo muestra su posición, el título (la curva y lo que pasó, con el coste si es una pérdida), la línea del veredicto, el coste (las ganancias con signo menos) con una barra, y una etiqueta: *frenada*, *entrada*, *salida*, *recta* (pérdidas de conducción, con «· coche X» cuando el coche explica 0,02 s o más), *coche*, *contexto*, *más rápida* o *igualada*. **Haz clic en uno** para alinear los coches 40 m antes, encuadrarlo, repetirlo y abrir sus medidas:

- **Frenada:** dónde frenó (o levantó) cada uno, a qué velocidad, y cuántos metros antes o después (desde 5 m);
- **Punto más lento:** la velocidad mínima de cada vuelta y dónde;
- **Acelerador a fondo:** dónde iba a fondo cada una, y cuánto antes o después;
- **Trazada:** diferencia en el giro, radios más cerrados, cuánto por dentro o por fuera, y la forma de la trazada y el vértice de cada vuelta;
- **Recta hasta la siguiente curva:** su longitud, ambas velocidades donde las dos iban a fondo, y lo que perdió o ganó y por qué: la velocidad de partida, el empuje más fuerte del otro, una levantada, la velocidad que se perdió sin necesidad, cómo se condujo (partes desde 0,02 s);
- **El coche:** cuánto de la pérdida es el coche, y de qué (empuje, agarre, frenos; cuando sea 0,02 s o más);

Luego viene el consejo, **Los coches:** (en coches distintos, véase [Perfiles de coche](race-car-profiles.md#what-the-cars-decide-in-a-corner)), y el consejo de trazada.

### Curva a curva {#corner-by-corner}

Una tabla (con dos o más vueltas), con una fila por tramo, de la clase de la vuelta enfocada cuando hay varias clases:

| Columna | Muestra |
|---|---|
| Curva | `T3`, `T11-T12` |
| Más rápida | la vuelta más rápida por él (su tiempo propio desde el inicio hasta el final del tramo) |
| por | su ventaja sobre la segunda más rápida, s |
| trazada | la forma y el vértice de la vuelta más rápida («V · tardío», «U/V · medio»); al pasar el ratón, sus radios más cerrados, de entrada y de salida; «ambos sentidos» para un complejo mixto |
| (la vuelta enfocada) | cuánto iba por detrás de la más rápida, o ✓ si era la más rápida |

Hacer clic en una fila abre allí el hallazgo de la vuelta enfocada (o alinea los coches 40 m antes del tramo). Debajo de la tabla, cuando cada curva tiene un tiempo: «La más rápida por cada curva, juntas: <tiempo> (± sobre la referencia / sobre la mejor de la clase X)». Son los mejores tramos más la vuelta más rápida hasta la primera curva, cuando es un tramo propio.

## Cómo se calcula {#how-it-is-worked-out}

La regla que lo gobierna: **una curva se juzga entera**, desde la zona de frenada de esa curva hasta la zona de frenada de la siguiente. Una vuelta que frena antes para girar el coche y poner la potencia antes recibe el crédito por la salida que compró, y no se le dice que frene más tarde.

## Un eje de distancia {#one-distance-axis}

Las vueltas se comparan por distancia, no por tiempo: un segundo de diferencia significa que dos vueltas están en curvas distintas. Tampoco se comparan por el cuentakilómetros de cada una, porque una trazada más cerrada recorre menos metros. La trazada recorrida por la **vuelta de referencia** es el eje:

- Los puntos de cada otra vuelta se **proyectan** sobre la trazada de referencia: cada punto recibe `s`, cuánto avanza por la referencia, y `d`, cuánto a la izquierda (positivo) o a la derecha. La búsqueda avanza desde la coincidencia anterior (de 8 tramos atrás a 40 adelante), así que una vuelta que se cruza por encima o por debajo de sí misma nunca salta al otro cruce. El primer punto se busca en el primer cuarto de la trazada (en un circuito, salida y meta coinciden). Cuando nada está a menos de 30 m, se toma el punto más cercano en cualquier parte que no esté detrás de la última coincidencia (tras un trompo o una salida de pista). `s` nunca disminuye: un punto que se proyecta detrás del anterior se mantiene.
- Cada canal se **remuestrea** sobre una misma cuadrícula, **cada 2 m**, de forma lineal; los canales que saltan (marcha, banderas) toman la muestra más cercana. Fuera del rango propio de una vuelta, los valores están vacíos.
- Las primeras y las últimas muestras de una vuelta se proyectan un poco dentro de los extremos de la referencia, así que cada vuelta se **prolonga hasta 15 m** más allá de sus extremos, a la velocidad que llevaba (el tiempo crece con la distancia dividida entre la velocidad, y lo demás se mantiene). Así su delta en la línea es su diferencia de tiempo de vuelta.
- `delta` = el tiempo de la vuelta en cada punto de la cuadrícula menos el de la referencia: la diferencia. `lateral` = `d` en la cuadrícula.

El tiempo que una vuelta tardó de más que otra entre dos puntos de la cuadrícula es la diferencia de sus deltas: `rel(s)`. Todo lo de abajo se construye sobre él.

## Curvas {#corners}

Se encuentran en la **referencia** (`findCorners`), con su velocidad suavizada en ±6 m y su curvatura (cambio de rumbo en ±5 muestras, suavizado en ±10 m):

1. **Mínimos de velocidad con relieve.** Un punto que es el más bajo en ±40 m, cuya caída desde la velocidad más alta a cada lado (antes de un mínimo más bajo) es de al menos `max(2,5 m/s, 6 % de la velocidad)`.
2. **Quiebros.** Un pico local de curvatura más cerrado que un radio de **300 m**, sin mínimo de velocidad a menos de 80 m: un quiebro tomado a fondo sigue siendo una curva que conducir.
3. **Fases.** Desde cada vértice hacia atrás mientras la referencia frena (> 0,1) o no va a fondo (< 0,95): la entrada; hacia delante mientras no va a fondo: la salida. Un quiebro tomado a fondo recibe ±30 m. Las curvas que se solapan se mantienen separadas, pero se hacen encajar para cubrir la vuelta.
4. Numeradas T1, T2 … en orden de vuelta; **izquierda o derecha** según el signo de la curvatura y según si el mundo está reflejado (lo desconocido cuenta como reflejado).

**La ventana de la curva** (donde gira la referencia): hacia fuera desde el punto más cerrado a ±40 m del vértice, mientras la curvatura se mantiene por encima de una sexta parte de su pico, más 10 m a cada lado. Su lado indica el signo de «por dentro».

## Tramos: de zona de frenada a zona de frenada {#segments-braking-zone-to-braking-zone}

Cada curva ocupa la carretera hasta la mitad de los vértices a cada lado. En ella:

- **El punto más lento de cada vuelta** es un bache real en su velocidad: nada más lento a menos de 6 m (3 puntos de cuadrícula) a cada lado, mirando más allá de los extremos del tramo, de modo que la salida de la curva anterior, que todavía acelera hacia ella, nunca se confunde con él. Se busca desde 15 m antes de la ventana de la curva hasta 10 m después. Una vuelta que nunca frenó allí se coloca en el vértice.
- **Dónde empezó una vuelta a frenar para ella** (`entryOf`): hacia atrás desde su punto más lento, por la frenada o la levantada, pasando por los toques de acelerador a fondo, hasta que tuvo el pie puesto (acelerador ≥ 0,95, freno ≤ 0,1) durante **10 m**. Un acelerador retomado en los últimos **30 m** antes del punto más lento sigue perteneciendo a la curva; a fondo todo el camino, el propio punto más lento. Una vuelta sin canal de acelerador, o que nunca tuvo el pie puesto desde la curva anterior, empieza en su punto más rápido entre medias.
- **El tramo empieza** en la primera de todas las vueltas que empezó a frenar para ella (4 m antes), y llega hasta el inicio del siguiente, de modo que toda la frenada de cada vuelta queda dentro de él y los tramos cubren la vuelta.

**Complejos.** Curvas consecutivas entre las que la referencia nunca va a fondo (menos de **40 m** de acelerador a fondo) forman un solo tramo, «T11-T12», conducido como uno. Un complejo tiene como máximo **tres** curvas: una sección sinuosa conducida sin ir nunca plana empieza un complejo nuevo. Un complejo que gira en ambos sentidos es *mixto*: no se mide ninguna forma de trazada única para él.

**En un circuito** (la referencia termina a menos de 50 m de donde empezó), la recta del último tramo sigue a través de la línea hasta el primer punto de frenada: la carrera desde la línea de una vuelta lanzada cuenta con la última curva. Una vuelta que empezó parada o en una salida de carrera (véase [La salida](#the-start)) mantiene ese tramo aparte.

### Adónde lleva una curva {#what-a-corner-leads-onto}

Se mide en la referencia: los metros a fondo después de la curva (desde su acelerador a fondo hasta el final del tramo, más la carrera a través de la línea) y antes de ella (el «después» del tramo anterior, o desde la salida).

| Tipo | Regla |
|---|---|
| **entre dos rectas** (`both`) | 200 m o más antes **y** 120 m o más después |
| **hacia una recta** | 200 m o más después, o 120 m o más después y al menos tanto como antes |
| **tras una recta** | 200 m o más antes |
| **enlace** | cualquier otro caso |

## Qué hizo cada vuelta en una curva {#what-each-lap-did-in-a-corner}

`cornerMetrics`, por vuelta y tramo, en la cuadrícula (paso de 2 m). Pedales: el freno cuenta por encima de 0,1; el acelerador a fondo es 0,95 y más.

| Medida | Regla |
|---|---|
| **punto de frenada** | el primer freno bajo el que se levantó el acelerador (por debajo de 0,5), o que duró **15 m**. Un toque del pie izquierdo con la potencia puesta no es donde empezó la frenada; si solo hubo toques, el primero |
| **levantada** | sin frenada, el primer punto en que el acelerador bajó de 0,8 |
| (sin pedales) | el punto donde la vuelta empezó a perder velocidad (arriba) |
| **soltar el freno** | el último freno hasta 30 m después del punto más lento |
| **velocidad en el punto de frenada**, **metros de frenada** | hasta el punto más lento |
| **frenada máxima**, **deceleración máxima** | en toda la zona de frenada (se ignoran las aceleraciones por encima de 45 m/s²) |
| **frenada en curva** | metros con freno por encima de 0,05 y \|volante\| por encima de 0,1 |
| **deslizamiento al bloquear** | la relación de deslizamiento de rueda más negativa de la zona (cuando la vuelta tiene deslizamiento) |
| **punto más lento**, **velocidad mínima** | como arriba |
| **acelerador puesto** | tras soltar el freno (o en el punto más lento), el primer acelerador por encima de 0,15 sin freno |
| **acelerador a fondo** | el primer punto después que se mantuvo en 0,95 o más durante 10 m |
| **inercia** | metros desde la suelta hasta el acelerador puesto, con freno y acelerador por debajo de 0,05 |
| **caídas de acelerador** | veces que el acelerador cayó más de 0,25 por debajo de su máximo corriente entre el acelerador puesto y el acelerador a fondo |
| **lateral máxima** | la mayor aceleración lateral desde 20 m antes de la suelta hasta el más tardío entre el acelerador a fondo y 20 m después del punto más lento |
| **marcha en el vértice** | en el punto más lento |
| **deslizamiento al acelerar** | la mayor relación de deslizamiento de las ruedas motrices entre el acelerador puesto y el acelerador a fondo |
| **equilibrio** | ángulo de deriva delantero menos trasero a través del medio (+ subviraje) |
| **recta a fondo** | la parte del tramo después del acelerador a fondo (y la carrera a través de la línea) con 0,95 o más; la mayor levantada en ella |
| **velocidad perdida sin necesidad** | la mayor velocidad perdida desde un punto alto con acelerador de 0,9 o más, sin freno, en el suelo |
| **deriva de entrada** | el mayor ángulo de deriva desde el punto de frenada hasta 5 m después del punto más lento, en el suelo |
| **freno de mano** | dónde se activó (por encima de 0,2), hasta 10 m después del punto más lento |
| **aire** | segundos en el aire sobre el tramo, y su vuelo más largo |

## Con quién se compara cada vuelta {#who-each-lap-is-compared-with}

- Una vuelta se compara con la **vuelta completa más rápida de su propia clase de rendimiento** (la referencia, en la clase de la referencia).
- Esa mejor vuelta de la clase (y la referencia) se compara, tramo a tramo, con **la otra vuelta de su clase que fue más rápida** en él; o con todas las vueltas, cuando va sola en su clase.

El mapa de tiempos, las diferencias en la lista de vueltas, los eventos de control del coche y la tabla de curvas siguen esta misma comparación.

## La cuenta de tiempo de una curva {#the-time-account-of-a-corner}

`compareCorner`, para una vuelta frente a la otra sobre un tramo:

- **neto** = `rel(fin) - rel(inicio)` (más la carrera a través de la línea en una vuelta lanzada): el veredicto. Más cerca de **0,03 s** es **igual**.
- **El reparto**: dónde dentro de la curva tomó la delantera el que iba primero. En el tramo desde el primer punto de frenada o el punto más lento de cualquiera de las dos vueltas, hasta el más tardío de sus puntos de acelerador a fondo y de punto más lento, el mayor vaivén que la vuelta devolvió o recuperó después, cuando ese vaivén supera **0,04 s**; si no, el más tardío de los dos puntos más lentos.
- **Hasta el vértice** = `rel(reparto) - rel(inicio)`; **después de él** = el neto menos eso. Cuando ambas son de al menos 0,04 s y de signo opuesto, la vuelta **tradeó** una cosa por otra.
- **Después del vértice** se vuelve a dividir donde las dos vueltas van a fondo: la **salida** (del reparto al acelerador a fondo más tardío) y la **recta** (desde ahí hasta el final).
- **La recta** se divide en tres:
  - *velocidad de salida* (`byExit`): medida, no modelada. El coche más lento pasa por la velocidad de partida del más rápido un poco más adelante en la recta, y desde ahí su propio registro es lo que habría hecho desde esa velocidad, con su propia relación de cambio, resistencia y pendiente. Retrasado hasta ese punto (y seguido a su velocidad final durante los metros que gana), es su tiempo desde la partida más rápida; la diferencia es el coste de la velocidad de salida. Cuando el coche más lento nunca llega a esa velocidad (o solo en las últimas 2 muestras), su propia aceleración a lo largo del tramo se devuelve como potencia (`a·v` constante), sin ser nunca más dura de lo que muestra su envolvente a esa velocidad (el doble de la aceleración medida, si no hay envolvente).
  - *el empuje de los coches* (`byPower`): solo en coches distintos. Ambos coches desde la misma velocidad sobre los mismos metros, a fondo, integrando la aceleración a fondo que ha mostrado cada uno a cada velocidad.
  - *cómo se condujo* (`driven`): el resto. Una levantada, o velocidad perdida sin necesidad con el acelerador a fondo.

  La velocidad de salida nunca explica más que el coste de la recta (y nunca con signo opuesto), salvo que una levantada o la velocidad perdida se llevaran parte. Una vuelta **levantó** en la recta cuando su parte a fondo está por debajo de 0,9 y además por debajo de la parte de la otra menos 0,05. La velocidad perdida sin necesidad cuenta cuando las dos difieren en más de 1 m/s. Una discrepancia de menos de 0,02 s en signo se pone a 0.

Cada neto de tramo suma la diferencia de tiempo de vuelta, y el «hasta el vértice» y el «después de él» de cada curva suman su neto (las pruebas lo comprueban).

### La parte del coche {#the-cars-share}

Solo cuando las vueltas son en **coches distintos** y la vuelta perdió tiempo (`carShare`):

- **empuje**: el empuje de los coches por la recta (arriba), hasta la pérdida;
- **agarre**: cuando la vuelta estaba en el límite de su coche (aceleración lateral en el medio de al menos un **90 %** de lo que su coche aguanta a esa velocidad) y el otro coche aguanta más de un **5 %** más: de la velocidad mínima más baja que no se explica por un radio más cerrado, la parte `½ ln(agarre_otro / agarre_mío) / ln(v_otro / v_mío)` de la pérdida restante;
- **frenos**: cuando la vuelta frenó (no levantó), el otro coche frena más de un **5 %** más fuerte, y la deceleración *media* de la vuelta en la zona fue de al menos un **80 %** de lo que puede su coche: desde `u` hasta `v` con `a1` frente a `a2`, acabando en el mismo punto, `(1/a1 - 1/a2)(u - v)² / 2u`, hasta lo que quede.

El coste del coche es la suma, como máximo la pérdida.

## El veredicto y el hallazgo {#the-verdict-and-the-finding}

`cornerFinding` escribe como máximo un hallazgo por vuelta y curva, probando en este orden:

| Caso | Hallazgo | Resultado |
|---|---|---|
| neto dentro de ±0,03 s, un tradeo, y el lado menor de **0,1 s** o más | **igual, dos maneras de pasar**: quién fue lento al entrar y rápido a la salida, y quién al revés. Con una recta después (hacia una recta, o entre dos), la manera de frenar poco y salir rápido es la que hay que construir: mantener su acelerador temprano, recuperar la entrada frenando más fuerte, no más tarde | igual |
| neto dentro de ±0,03 s en otro caso | no se dice nada | - |
| ganó, un tradeo, perdió hasta el vértice | **lento al entrar, rápido a la salida compensó**: mantenerlo, aquí la salida vale más | ganancia |
| ganó, un tradeo, ganó hasta el vértice | **más rápido al entrar**: la entrada es la correcta, un acelerador a fondo más temprano conservaría más | ganancia |
| ganó, y la otra vuelta tiene una pérdida aquí | **más rápido, por lo que hizo la otra**: su causa y su consejo, que dice «Para la otra vuelta: …» | ganancia |
| ganó de otro modo | **más rápido al entrar / salir**, según qué mitad ganó más (frenar más tarde, más velocidad en el medio; o llegar a fondo antes, con más empuje) | ganancia |
| perdió, y un **golpe o choque** costó al menos `max(0,05 s, 40 % de la pérdida)` | el impacto es la historia de la curva, antes que los coches | pérdida |
| perdió, y la **parte del coche** es el 60 % o más | **el coche**: su empuje por la recta, su agarre por el medio o sus frenos, la parte mayor; con la parte del conductor (≥ 0,03 s) dicha como «El otro X s: …» | pérdida |
| perdió, y un **fallo de control del coche** no compartido costó al menos `max(0,05 s, 40 %)` | ese fallo (véase abajo), con cómo se movió el tiempo a su alrededor | pérdida |
| perdió, y un **vuelo más largo** costó al menos `max(0,05 s, 40 %)` | el vuelo | pérdida |
| perdió, un tradeo, ganó hasta el vértice | **demasiado rápido al entrar, lento a la salida**: la causa de la salida; ceder algo de entrada para girar y llegar a fondo antes, con los puntos de freno y de acelerador a fondo de la otra vuelta. Su raíz (`cause`, lo que cuentan las [estadísticas](race-course-statistics.md)): frenar más tarde, cuando frenó unos cuantos metros más tarde que la otra; si no, la causa de la salida | pérdida |
| perdió, un tradeo, perdió hasta el vértice | **cedió más al entrar de lo que recuperó la salida**: la causa de la entrada, que también es su raíz (`cause`); mantener la salida, perder menos al entrar | pérdida |
| perdió, levantó en la recta, y la parte a fondo supera la mitad de la pérdida | **no iba a fondo en la recta**: su parte a fondo frente a la de la otra, dónde y cuánto duró la levantada | pérdida |
| perdió, el empuje de los coches supera el 60 % de la pérdida y la recta más de la mitad | **el empuje del coche por la recta** (con el empuje de ambos coches a 160 km/h) | pérdida |
| perdió de otro modo | la causa de la mitad que más perdió (hasta el vértice ≥ después de él: la de la entrada; si no, la de la salida). Si sale más lento solo porque va más lento por el medio (por más de 1 m/s), entonces la causa del medio | pérdida |

Un hallazgo de pérdida también puede terminar con **Además:** la velocidad perdida sin necesidad con el acelerador a fondo, o una levantada en la recta, cuando la parte conducida de la recta costó más de 0,04 s y no era ya la causa.

Los hallazgos se ordenan: primero las pérdidas, la más cara primero; después las ganancias y las curvas iguales.

### Causas a la entrada {#causes-on-the-way-in}

`entryCause`, la primera que se aplica (las diferencias de velocidad mínima van en m/s; «5 m» es el umbral para que un punto más temprano o más tardío cuente):

| n.º | Causa (error) | Regla |
|---|---|---|
| 1 | un golpe o choque al entrar | un impacto no compartido que empieza a menos de 10 m después del punto más lento |
| 2 | **casi parado** (incidente) | velocidad más lenta por debajo del **60 %** de lo que permite el agarre de este coche donde pasó la otra (`v_otro · √(agarre_mío / agarre_otro)` cuando el otro coche agarra más, si no, la velocidad del otro), con la otra vuelta por encima de 8 m/s: un trompo, un contacto o una curva perdida
| 3 | un fallo de control del coche al entrar | un bloqueo, empujón, trompo o derrape no compartido que no es con el acelerador, que empieza a menos de 10 m después del punto más lento, y cuesta 0,02 s o más |
| 4 | un vuelo más largo antes del punto más lento | véase [rally](#rally-rotation-and-flights) |
| 5 | **levantó** cuando la otra fue a fondo o levantó 5 m o más tarde | esta vuelta solo levantó |
| 6 | **frenó donde la otra solo levantó** o fue a fondo | y fue más de 0,5 m/s más lenta por el medio |
| 7 | **frenó suavemente** | frenó (no levantó), y tenía margen para frenar más fuerte: con datos de neumáticos, su deslizamiento al bloquear por debajo del **60 %** del deslizamiento en el que los frenos de este coche dan lo mejor; sin ellos, una deceleración máxima por debajo del **85 %** de lo que muestra a esa velocidad. El pedal por debajo de 0,95, y la deceleración máxima de la otra vuelta más de un **15 %** mayor |
| 8 | **frenó pronto**, o **los frenos del coche** | frenó más de 5 m antes que la otra. En otro coche cuyos frenos son más de un 5 % más fuertes, y con no más de 10 m de margen frente a la distancia que necesita este coche con su propia deceleración: los frenos del coche. Si no, frenó pronto, con «Frena más tarde: unos N m» (en otro coche, los metros de más que necesita) |
| 9 | **inercia** | más de 10 m sin ningún pedal, y 5 m más que la otra |
| 10 | **más lento por el medio** | más de 0,5 m/s más lento en el punto más lento; se reparte con `v² = a·R` (abajo) |
| 11 | **llegó más lento** | más de 1 m/s más lento en el punto de frenada, sin haber frenado pronto: se decide antes, por la curva anterior y el empuje del coche, o por un vuelo en la curva anterior que fue 0,2 s más largo. Es del coche cuando los coches son distintos |
| 12 | más lento hasta el vértice | en otro caso: soltar el freno más suavemente y llevar más velocidad al medio |

**Más lento por el medio** (`middleSplit`): el radio de cada vuelta en su punto más lento se mide desde su propia trazada (±8 m); su aceleración lateral es `v²/R`, y

`ln(v_otro / v_mío) = ½ ln(a_otro / a_mío) + ½ ln(R_otro / R_mío)`.

- El radio explica **la mitad o más**: **una trazada demasiado cerrada**: «usa más de la carretera», con los dos radios y la parte.
- En el límite del coche (derrapando más de 10° de deriva en asfalto / 20° en terreno suelto, o aceleración lateral de al menos el 90 % de lo que aguanta a esa velocidad) y el otro coche agarra más de un 5 % más: **el agarre del coche**; proteger la salida en su lugar.
- Derrapando por ahí (deriva por encima de 10° / 20°) y la otra vuelta no lo hizo (su deriva de entrada al menos 4° menor): **de lado**; más allá de su agarre, no por debajo de él; llegar un poco más despacio. Se dice que es del coche cuando este coche pierde la zaga al menos una vez por vuelta más que la otra.
- En otro coche que aguanta menos del **96 %** del agarre del otro, y la vuelta llevó a menos de 1 m/s de `v_otro · √(agarre_mío / agarre_otro)`: **el agarre del coche**; «frenar más tarde no lo va a cerrar».
- Si no, **agarre de sobra**: aceleración lateral frente a la del otro en un radio parecido, y lo que aguanta este coche; llevar más velocidad al vértice. Cuando la zaga de este coche se suelta antes de que se agote su agarre (sus derrapes empiezan por debajo del 85 % de su agarre, y la vuelta iba al 80 % de eso), buscar el resto en pequeños pasos.

### Causas a la salida {#causes-on-the-way-out}

`exitCause`, la primera que se aplica:

| n.º | Causa (error) | Regla |
|---|---|---|
| 1 | un fallo de control del coche a la salida | patinaje de rueda, trompo, derrape o impacto no compartido que termina en o después de 10 m antes del punto más lento |
| 2 | **velocidad perdida sin necesidad** | más de 1 m/s de velocidad perdida a fondo que la otra; por encima de **7 m/s (25 km/h)**, «más parecido a un contacto o un trompo que a un derrape» |
| 3 | **giró mal el coche** (terreno suelto) | véase [rally](#rally-rotation-and-flights) |
| 4 | **potencia más tarde** | acelerador puesto más de 5 m más tarde, contado también desde el propio punto más lento de cada vuelta (una vuelta cuyo punto más lento es más tardío no se culpa por un acelerador más tardío) |
| 5 | **dudó con el acelerador** | más caídas de acelerador que la otra |
| 6 | **se fue abierto y esperó** | más de 1,5 m por fuera de la otra donde ambas iban planas, y acelerador a fondo más de 5 m más tarde desde su propio punto más lento |
| 7 | **acelerador a fondo más tarde** | acelerador a fondo más de 5 m más tarde, también desde su propio punto más lento; con la aceleración del coche allí |
| 8 | **la conducción del coche** | en otro coche que empuja menos del 95 % de la otra a esa velocidad, y el empuje explicaba parte de la recta |
| 9 | **más lento al salir de la curva** | en otro caso: un vértice más tardío, para que el coche esté antes en recta |

Cuando las dos vueltas iban en marchas distintas en el punto más lento, la sugerencia termina con «Marcha N en el vértice; la otra usó M».

### Fallos de control del coche y golpes {#car-control-faults-and-impacts}

Un fallo de [Eventos de control del coche](race-control-events.md) como causa: un bloqueo es una causa de *frenada*; un patinaje de rueda o un derrape con el acelerador, una causa de *salida*; el resto, de *entrada*. Un impacto después del punto más lento es de *salida*; antes de él, de *entrada*. La sugerencia es la propia del evento, y luego «Costó unos X s hasta 40 m después» (o «hasta que el coche recuperó su velocidad» para un impacto). Un bloqueo con un punto de frenada más de 5 m antes que la otra añade que la vuelta también frenó pronto; con las ruedas girando, no lo habría necesitado.

### Rally: giro y vuelos {#rally-rotation-and-flights}

En **terreno suelto**, con ángulos de deriva en las dos vueltas, y cuando esta vuelta pisa la potencia (o va plana) más de 5 m más tarde:

- **Giró el coche menos**: la otra tuvo el coche girado **12°** o más en su punto más lento, y al menos **8°** más que esta vuelta. Consejo: levantar o dar un toque con el pie izquierdo en el freno al entrar, con el punto de freno de mano de la otra vuelta cuando solo ella lo usó, o con el freno de mano en una curva más lenta que 15 m/s (54 km/h).
- **Lo giró de más**: esta vuelta lo tuvo girado 12° o más, y al menos **12°** más que la otra: hubo que enderezarlo antes de poder bajar la potencia.

**Un vuelo más largo**: en el aire 0,2 s o más que la otra, y que cueste al menos 0,03 s desde 10 m antes del despegue hasta 40 m después del aterrizaje (o el final del tramo). Antes del punto más lento es una causa de entrada; se convierte en la historia de la curva cuando explica el 40 % o más. El consejo: mantener el acelerador en el despegue, y tomar la cresta un poco más despacio o con un toque de freno.

### La salida {#the-start}

Antes de la primera curva, en un sprint o cuando alguna de las dos vueltas empezó parada (por debajo de 5 m/s, cuando ambas son las primeras en el eje) o en una salida de carrera (por debajo del 60 % de la velocidad de la otra), el recorrido hasta el primer punto de frenada es su propio hallazgo (curva 0) cuando difiere en más de 0,03 s: *La arrancada*, *El inicio de la carrera* o *Hasta la primera curva*. Una pérdida ahí se atribuye a la situación (*contexto*) cuando una vuelta empezó en salida de carrera y la otra a velocidad; al coche cuando las vueltas son en coches distintos; y al piloto en otro caso. Consejos: en otro coche desde parado, «sobre todo el coche»; una salida parada con el mismo coche, arrancar con menos patinaje y cambiar en la parte alta de la banda de potencia; una salida de carrera, compararla con otra primera vuelta; una salida lanzada, una mejor salida de la última curva se arrastra hasta la línea.

## La trazada recorrida {#the-driven-line}

`lineMetrics`, por vuelta y tramo (no para complejos mixtos), solo con las posiciones (suavizadas ±2 muestras) sobre la ventana de la curva:

| Medida | Regla |
|---|---|
| curvatura | cambio de rumbo en ±8 m de la trazada propia de la vuelta |
| **radio más cerrado** | 1 / la curvatura máxima |
| **giro de entrada** / **salida de trazada** | donde la curvatura supera por primera / última vez una quinta parte de su máximo |
| **medio** | donde la vuelta había girado la mitad de su cambio de rumbo |
| radio de entrada / salida | metros recorridos sobre la mitad del cambio de rumbo, antes / después del medio |
| **forma** | radio más cerrado dividido entre el radio medio mientras gira: por debajo de **0,55** una **V**, por encima de **0,75** una **U**, entre medias «U/V» |
| **vértice** | radio de salida dividido entre el de entrada: por encima de **1,25** tardío, por debajo de **0,8** temprano, si no medio |
| **vértice de velocidad** | el punto más lento a más de **15 m** antes del medio: entrar lento, salir rápido; a más de 15 m después: sigue frenando pasado el medio |

Frente a la otra vuelta: cuánto fue por dentro (+) o por fuera al empezar a girar, a través de la parte más cerrada y donde ambas iban planas (se dice desde 1 m); dónde giró cada una (se dice desde 8 m).

### Qué trazada encaja aquí con este coche {#which-line-suits-this-car-here}

`lineFor`, a partir de a qué lleva la curva y del carácter del coche en esta curva:

- **potencia frente a agarre** = la aceleración a fondo del coche a la velocidad de salida, dividida entre su agarre en la velocidad mínima (de su envolvente). **Point and shoot** desde **0,45** en adelante; **impulso** con **0,25** o menos.
- **carga aerodinámica**: el agarre a 151-252 km/h dividido entre el agarre a 54-108 km/h de **1,15** o más, en una curva tomada a **144 km/h** (40 m/s) o más rápido: entonces es una curva de impulso, sea cual sea la potencia. No se juzga en terreno suelto.

| Tipo de curva | Coche | Trazada |
|---|---|---|
| tras una recta | point and shoot / otro | V / U, vértice en el medio: «la zona de frenada es el premio» |
| entre dos rectas | impulso / otro | U / V, vértice tardío |
| enlace | impulso / otro | U / V, vértice en el medio: «conduce pensando en la salida de la siguiente» |
| hacia una recta | impulso (o una curva rápida con carga aerodinámica) | U redonda y ancha, vértice algo tardío |
| hacia una recta | point and shoot | V: frenar recto, girar tarde, girar el coche en un medio corto y cerrado, recta pronto |
| hacia una recta | término medio | U con vértice tardío: entrar lento, salir rápido |

Donde importa la salida (hacia una recta, entre dos), el tren motriz añade una frase: **FWD** (tracción delantera): hacerlo girar con los frenos, dar potencia solo cuando la rueda se desenrolla; **RWD** (tracción trasera) con una potencia frente a agarre de 0,35 o más: enderezarlo antes del acelerador a fondo; **AWD** (tracción total): puede dar potencia mientras sigue girando. En terreno suelto, cada trazada añade: girar el coche al entrar.

La frase dice después lo que hizo la vuelta, y si encaja: *el punto más lento tardío ata la salida* o *un vértice temprano ata la salida* cuando se quería un vértice tardío y la vuelta no lo tuvo tardío ni fue la más lenta temprano; *más redonda de lo que quiere este coche* cuando se quería una V; *más cuadrada de lo que quiere este coche* cuando se quería una U; si no, *eso encaja*.

## Para desarrolladores {#for-developers}

Código: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
La razón y sus fuentes: [el método](race-analytics.md).
