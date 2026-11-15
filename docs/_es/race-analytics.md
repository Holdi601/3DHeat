---
title: "Análisis de carreras: el método"
parent: "Análisis de carrera"
nav_order: 58
lang: "es"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Análisis de carreras: el método

En resumen:

- Las vueltas se comparan **por distancia**, no por tiempo, para que el mismo punto del circuito quede alineado.
- Cada curva se juzga **entera**, desde una zona de frenada hasta la siguiente.
- El tiempo perdido se **reparte** según dónde se perdió (frenada, entrada, salida, recta) y cuánto de ese tiempo explica el coche.
- La causa se **explica con palabras**, con consejos.
- Para usarlo, y no para leer cómo funciona, véase [Análisis de carrera](race-analysis.md).

Este es el método detrás de la pestaña **Análisis de carrera**: qué mide, cómo decide dónde se perdió el tiempo y cómo lo convierte en consejos. Es la especificación que sigue el código de análisis (`src/race/`), así que cada regla de esta página tiene su equivalente en ese código y una prueba que la fija.

## Lo que hacen las herramientas profesionales {#what-the-professional-tools-do}

Las herramientas establecidas coinciden en el mismo núcleo. Se diferencian sobre todo en hasta dónde llegan hacia las *causas*:

- **Todo se compara por distancia, no por tiempo.** Dos vueltas se remuestrean sobre un mismo eje de distancia. La diferencia acumulada de tiempo transcurrido a la misma distancia es el *delta* (MoTeC lo llama variación de tiempo; otras herramientas lo llaman diferencia de tiempo o curva delta). Su pendiente indica dónde se pierde tiempo en ese momento: una pendiente suave es aceleración, resistencia del aire o agarre sostenido; una pendiente empinada es una diferencia de frenada o de acelerador; una onda que sube y baja es un cambio entre velocidad de entrada y velocidad de salida.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [análisis del tiempo por sectores](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Cada curva se divide en fases**: frenada, entrada, medio y salida. Punto de frenada, frenada máxima y alivio, velocidad mínima y dónde ocurre, marcha, apertura del acelerador, vuelta al acelerador a fondo y velocidad de salida.
  ([Driver61: seis fases](https://driver61.com/uni/corner-phases/),
  [guía de análisis de vueltas de iRacing](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Minisectores por curva y una vuelta teórica de referencia** armada con lo mejor de cada uno. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **La trazada también se compara**, pero nunca por sí sola: «una línea sobre una imagen no significa nada hasta que conoces los factores que influyen». Se lee junto con la traza de velocidad y el delta.
  ([Track Titan: cómo analizar la telemetría](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: trazadas](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **La causa, no el síntoma.** ¿La pérdida en la recta es de verdad por el acelerador, o una mala entrada obligó a acelerar tarde? Los errores se ordenan por lo que cuestan en tiempo de vuelta y se explican con palabras sencillas.
  ([flujos de coaching de Track Titan](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Qué salió mal en la primera versión, y por qué importa {#what-went-wrong-in-the-first-version-and-why-it-matters}

La primera versión cargaba cada *fase* por separado y solo miraba las pérdidas. Una vuelta que frenaba antes perdía tiempo en la fase de frenada, y se le decía que frenara más tarde. Incluso cuando esa frenada anticipada hacía que el coche girara antes, acelerara antes y saliera de la curva más rápido, y lo recuperaba todo en la recta. En una prueba, le dijo a la vuelta que hizo eso que «frenara mucho más tarde», cuando la otra vuelta, que sí frenó más tarde, se había pasado del vértice, se había ido abierta y había perdido justo lo que había ganado. Los datos de tiempo decían que las dos trayectorias estaban igualadas. El consejo decía lo contrario.

La solución es la regla en la que coinciden todas las fuentes de arriba: **una curva se juzga entera**, desde la zona de frenada de esa curva hasta la zona de frenada de la siguiente. Porque «a veces, ceder unos milisegundos en una curva puede mejorar el tiempo total de la vuelta, si permite tramos más rápidos después»
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Conocimiento de carreras que codifican las reglas {#racing-knowledge-the-rules-encode}

**La velocidad de salida importa más que la de entrada**, y más cuanto más larga es la recta siguiente. «El tiempo en rectas domina al tiempo en curvas», y un déficit de velocidad a la salida se arrastra hasta el siguiente punto de frenada. La forma más rápida de pasar una curva y su recta suele ser tomar la curva más despacio para poder acelerar antes: *entrar lento, salir rápido*.
([Race & Track Driving: orden para mejorar el tiempo de vuelta](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: priorizar curvas](https://driver61.com/uni/prioritising-corners/))
Un planificador de tiempo mínimo que además recompensa la velocidad de salida mueve sus vértices más tarde y logra una vuelta *más rápida*. La recompensa que equilibra las dos cosas vale `L / v²` por unidad de velocidad de salida, para una recta de longitud `L` a velocidad `v`. Es decir: el tiempo que cuesta una diferencia de velocidad en una recta crece con su longitud y baja con el cuadrado de la velocidad
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Las curvas según a qué llevan.** Una que lleva a una recta: maximizar la velocidad de salida, vértice tardío, volver a dar gas cuanto antes. Una al final de una recta: maximizar la velocidad con la que se entra en ella, frenar lo más tarde posible; un vértice más temprano es aceptable. Una entre dos curvas: se hace un compromiso pensando en la que importa después. Una curva que podría ser de cualquiera de los dos tipos se trata como una que lleva a una recta. Las curvas rápidas pesan más: a alta velocidad el coche acelera poco y un km/h perdido no se recupera.
([Allen Berg: tres tipos de curvas](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: priorizar curvas](https://driver61.com/uni/prioritising-corners/),
[Driver61: distintas curvas, distintas técnicas](https://driver61.com/uni/different-corner-technique/))

**El círculo de fricción.** Un neumático tiene un solo presupuesto de agarre, que se gasta en frenar, en curvar y en acelerar, en cualquier mezcla. La aceleración total es `sqrt(lat² + long²)`. La frenada en curva sigue el borde de ese círculo: el freno se suelta a medida que el volante y la carga lateral aumentan.
([círculo de fricción](https://www.yourdatadriven.com/friction-circle-introduction/),
[diagrama g-g](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**La inercia** (sin pisar ningún pedal) es la forma más lenta de perder velocidad, y es un indicador clave que se mide por sí mismo.
([Racecar Engineering / OptimumG: factor de inercia](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**El deslizamiento.** La fuerza longitudinal alcanza su máximo con un deslizamiento de alrededor del 10-20 %, y luego cae. Más allá, la rueda se bloquea al frenar o patina al acelerar. Forza informa del deslizamiento normalizado: 0 es agarre total, y un valor absoluto por encima de 1 es agarre perdido.
([deslizamiento longitudinal](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Subviraje y sobreviraje.** Si el ángulo de deriva delantero es mayor que el trasero, hay subviraje. Si el trasero es mayor que el delantero, hay sobreviraje. Sin ángulos de deriva: el coche gira menos de lo que pide el volante (el giro del volante por encima del ángulo de Ackermann `L/R` que necesita un coche a baja velocidad).
([subviraje, visión general](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## La geometría de una trazada {#the-geometry-of-a-line}

La velocidad que un coche puede mantener en un radio `R` es `v = sqrt(a R)`, donde `a` es la aceleración lateral que dan sus neumáticos (más lo que añade la carga aerodinámica, que crece con `v²`). Así que **la velocidad crece con la raíz cuadrada del radio**: una trazada por el centro en un radio un 20 % mayor es alrededor de un 10 % más rápida en ese punto.
([velocidad máxima en curva](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: curvas](https://www.formula1-dictionary.net/cornering_tech.html))

**La trazada geométrica** es el arco más grande que cabe en una curva: sale del borde exterior, toca el interior en el vértice y vuelve al exterior. En una curva que gira `θ` en una carretera de ancho `w` (menos el ancho del coche), un arco tangente a los dos bordes exteriores y que toca la esquina interior tiene `R = w / (1 - cos(θ/2))` (más el radio propio del borde interior). Para un ángulo recto eso es unas `3,4 w`; para una horquilla, `w`. Por eso aprovechar el ancho importa sobre todo en las curvas medias y menos en las horquillas.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**El vértice tardío** entra más tarde y más hondo, con un radio al principio más cerrado, y abre el radio al salir: más lento por el centro, recta antes, llano antes. «Una velocidad mínima un poco menor, pero un perfil de aceleración más fuerte a la salida». **El vértice temprano** es lo contrario: más rápido al entrar, y un radio que se cierra al salir y retiene el acelerador. Casi siempre es un error, salvo con agarre muy bajo, cuando la velocidad perdida al entrar no se puede recuperar después.
([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[vocabulario de telemetría de carreras](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[matemáticas de la trazada](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**La "V" y la "U".** La U es la trazada redonda clásica: el radio más amplio y el menor cambio de volante. La V entra antes, va más hondo, gira el coche deprisa en el medio y alinea la salida para salir más recto: la frenada se mantiene recta (así puede ser más tardía), la velocidad mínima es más baja pero se alcanza más tarde, y el acelerador a fondo llega mucho antes.
([Track Titan: la línea en V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Curvatura frente a distancia.** La trazada más rápida es un compromiso entre el camino más corto y el menos curvado. En la anchura de un circuito, la curvatura pesa más. Una trazada de curvatura mínima se acerca a la de tiempo mínimo allí donde el coche está en su límite, y se separa de ella donde el coche podría acelerar.
([planificación global de trayectorias de tiempo mínimo](https://www.nature.com/articles/s41598-025-21211-2),
[optimización global de trayectorias de carrera de TUM](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Curvas seguidas**, como un doble vértice o una chicana, son un solo problema: la salida de una es la entrada de la siguiente, y se trazan hacia atrás desde la que lleva a una recta.
([Driver61: distintas curvas, distintas técnicas](https://driver61.com/uni/different-corner-technique/))

## Qué trazada encaja con cada coche {#which-line-suits-which-car}

Lo que decide es la **potencia frente al agarre** del coche a las velocidades de esa curva: «el impulso es agarre frente a potencia, una cuestión de proporción».
([Ross Bentley: coches de impulso](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[impulso frente a potencia](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Coche, en esta curva | Trazada | Por qué |
|---|---|---|
| Acelera con fuerza para su agarre («point and shoot») | V: frenar recto y tarde, girar en un medio corto y cerrado, recta y llano pronto | el tiempo se gana con el acelerador a fondo, no con la velocidad mínima |
| Acelera poco para su agarre («impulso») | U ancha, vértice algo tardío, mantener alta la velocidad mínima | no puede recuperar la velocidad que pierde |
| Término medio | entrar lento, salir rápido: U con vértice tardío | el compromiso clásico |
| Curva rápida, y más aún con carga aerodinámica | U, cerca de la trazada geométrica | la aceleración es débil a alta velocidad; el agarre por carga crece con `v²`, así que la velocidad en el medio rinde el doble |
| Agarre muy bajo (mojado, nieve) | vértice más temprano | la velocidad perdida al entrar no se puede recuperar después |
| Potencia muy por encima del agarre | la trazada importa menos | la tracción, no la trazada, limita la salida |

«Cuanto más rápida la curva, más cerca de la trazada geométrica; cuanto más lenta, más la cambia un vértice tardío.»
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[matemáticas de la trazada](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: la línea en V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: agarre](https://driver61.com/uni/grip/))

El tren motriz cambia la forma de trazar la curva más que la propia trazada. Un coche de tracción delantera se hace girar con los frenos (frenada en curva) y recibe potencia solo cuando la rueda se desenrolla, o se va abierto. Un coche potente de tracción trasera tiene que ir recto antes del acelerador a fondo, o la parte trasera se suelta. La tracción total puede dar potencia mientras sigue girando, así que recoge el acelerador antes.
([técnica de tracción delantera](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD frente a FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD frente a RWD en curva](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

El visor mide la proporción de potencia y agarre del coche en cada curva a partir de su propia conducción: la aceleración a fondo a la velocidad de salida, dividida entre el agarre lateral en la velocidad mínima. La llama «point and shoot» desde 0,45 en adelante y «impulso» con 0,25 o menos. Un coche cuyo agarre entre 150 y 250 km/h es más de un 15 % mayor que entre 55 y 110 km/h tiene la carga aerodinámica trabajando.

## El método {#the-method}

Las cifras de abajo son el razonamiento. Los umbrales que usa el código están cada uno en su propia página, y esas páginas son la referencia cuando una cifra de aquí no coincide: [Análisis curva a curva](race-corner-analysis.md), [Eventos de control del coche](race-control-events.md), [Perfiles de coche y comparación](race-car-profiles.md) y [Estadísticas del recorrido](race-course-statistics.md).

### 1. Un eje de distancia {#one-distance-axis}

La vuelta más rápida es la referencia, salvo que el usuario elija otra. Su trazada es el eje: los puntos de cada otra vuelta se proyectan sobre ella, y así cada punto recibe una distancia a lo largo de la referencia `s` y un desplazamiento lateral con signo `d`. La proyección busca solo hacia delante desde la última coincidencia, así que una vuelta que se cruza consigo misma nunca salta al lado equivocado de un puente. Después, las vueltas se remuestrean sobre una misma cuadrícula, cada 2 m, para cada canal. Cada vuelta se prolonga unos metros al final a la velocidad que llevaba, así que su delta en la línea es su diferencia de tiempo de vuelta.

### 2. Curvas, y la parte de la vuelta que tiene cada una {#corners-and-each-corners-share-of-the-lap}

Cómo se encuentran las curvas, los tramos y los complejos: [Análisis curva a curva](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. La cuenta de tiempo de una curva {#the-time-account-of-a-corner}

Neto, dividido, velocidad de salida y el empuje de los coches: [Análisis curva a curva](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. El veredicto, y la causa {#the-verdict-and-the-cause}

Los patrones del veredicto y las causas a la entrada y a la salida: [Análisis curva a curva](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. El coche frente al piloto {#the-car-against-the-driver}

Cuando las vueltas son en coches distintos, se quita la pérdida que explica el coche, por partes:

- **empuje**: los coches desde la misma velocidad por la recta, como arriba;
- **agarre**: de la velocidad mínima más baja que no se explica por un radio más cerrado, la parte `½ ln(agarre_otro / agarre_mío) / ln(v_otro / v_mío)`, cuando la vuelta estaba en el límite de su coche (90 % de lo que ha mostrado a esa velocidad);
- **frenos**: desde `u` hasta `v` con deceleración `a1` frente a `a2`, acabando en el mismo punto, cuesta `(1/a1 - 1/a2)(u - v)² / 2u`. Solo cuando la vuelta frenó casi tan fuerte como su coche puede en esa zona, de media, y no solo en un pico.

Lo que puede hacer un coche sale de todas las vueltas cargadas de ese coche: agarre lateral, frenada y aceleración a fondo por cada intervalo de 5 m/s de velocidad (percentiles 95, 95 y 90). El agarre es lo que el coche **mantuvo durante medio segundo**, es decir, la aceleración lateral promediada en 0,5 s, y no lo que tocó una sola muestra. Un bordillo, un deslizamiento que vuelve a su sitio o un coche que hay que corregir disparan la medida un instante, y un coche que hace eso a menudo parecía tener más agarre del que tiene. (Comprobado con vueltas grabadas de dos coches distintos: la medida por muestra los juntaba; con medio segundo los separa, igual que lo hacen sus tiempos de vuelta.) La frenada y el empuje toman cada muestra como la mediana de sí misma y de sus vecinas. El aire, el asentamiento tras un aterrizaje y cada golpe (sección 6) hasta que el coche se ha recuperado quedan fuera.

**Qué tipo de coche es cada uno** (`profile.ts`), a partir de las mismas vueltas:

- **agarre sostenido**: el percentil 95 de esa aceleración lateral de medio segundo;
- **empuje** a fondo hasta 50 km/h, de 50 a 120, de 120 a 200 y por encima de 200, y lo máximo que mostró;
- **frenada** de 60 a 160 km/h;
- **velocidad máxima**: donde dejó de ganar velocidad con el acelerador a fondo durante un segundo en una recta, conducida recta y no en una curva larga tomada plana, donde un coche pierde velocidad con cualquier potencia. Si ninguna recta fue lo bastante larga, lo que aún empujaba a su máxima velocidad indica cuánto le faltaba. No se supone nada más allá de lo que muestran las vueltas: un ajuste de potencia frente a velocidad contra la resistencia puso a un coche de carretera 100 km/h por encima de su velocidad real, porque la relación de cambio y el limitador acaban con el empuje de un coche mucho antes que la resistencia;
- **pérdida de la zaga**: cuántas veces por vuelta derrapó más de 10° (20° en terreno suelto) con el volante girado en contra de la curva, y se corrigió con contravolante; cuántas de esas empezaron con el acelerador, y con qué parte de su agarre empezaron. Un coche conducido un poco de lado a propósito no pierde nada; uno que hay que recoger, sí. Se cuenta igual para todos los coches, así que dos coches se pueden comparar;
- **equilibrio**, cuando las vueltas traen ángulos de deriva: delantero frente a trasero en el límite.

**Coches comparados** pone los coches uno junto al otro: una tabla, una frase por coche sobre lo que es frente al otro («X acelera mejor, pero no puede girar tan cerrado, necesita más distancia para frenar y pierde la zaga con más facilidad»), cada diferencia que es clara (4 % de agarre, 5 % de empuje o de frenada, 4 km/h de velocidad máxima, una pérdida de la zaga al menos una vez más por vuelta, y un 50 % más a menudo) y cómo conducir cada uno. Con un solo coche, dice qué es ese coche.

**En cada curva**, cuando las vueltas son en coches distintos, el veredicto dice qué parte de ella deciden los coches, y cómo sacar el máximo partido a este:

- **por el medio**: en la trazada del otro coche, el agarre de este coche permite `v_otro · √(agarre_mío / agarre_otro)`. Si la vuelta llevó esa velocidad, la diferencia es el coche, y ningún punto de frenada la cambia: se dice, y la curva se atribuye al coche y no al piloto. Si llevó menos, el resto está al alcance, y se dice cuánto. Después, dónde se puede ganar el tiempo en cambio: en la recta siguiente, o con un coche que empuja más, después del vértice (frenar recto, girar más tarde, apuntar pronto a la salida). Si no, el radio más amplio que permita la carretera, porque un radio mayor es la única forma de ir más rápido sin más agarre;
- **una zaga que se soltó** aquí, en un coche que la pierde con más facilidad que el otro: qué hacer en este coche (el acelerador se dosifica a medida que la rueda se desenrolla, o el freno se suelta suavemente y sin levantar el pie a mitad de curva), según cómo empiezan sus derrapes;
- **la recta siguiente**: lo que se llevó el empuje más fuerte del otro coche desde la misma velocidad, y dónde se quedó sin empuje este coche en ella;
- **un punto de frenada más temprano** en un coche que frena menos fuerte.

Una vuelta que derrapó por el medio de una curva (más de 10° de deriva en asfalto) estaba pasada de su agarre, no le faltaba: nunca se le dice que tenía agarre de sobra allí. Y si la zaga del coche se soltó en esta vuelta con menos aceleración lateral de la que pedía la curva, «agarre de sobra» dice que hay que buscarlo en pequeños pasos.

### 6. Control del coche: bloqueos, patinajes, derrapes y empujes, golpes y choques {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Cada vuelta también se lee por cómo se manejó el coche: dónde se bloqueó una rueda, dónde patinaron las ruedas motrices, dónde se soltó la zaga y dónde el eje delantero se fue abierto. Son los errores que el tiempo por sí solo no nombra. Tres cosas hacen que esto funcione en distintos juegos y superficies.

**Dónde termina el agarre se mide a partir de la propia conducción del coche.** Los ingenieros fijan un umbral de bloqueo por coche en el deslizamiento que dio la mayor deceleración (los canales de MoTeC de la serie de frenada de OptimumG usan -0,07 para un coche), no un valor de libro. Y los valores de libro no coinciden: la fuerza alcanza su máximo con un deslizamiento del 5-20 % en asfalto, según el neumático y el modelo; con un 6 % o entre un 20 y un 60 % en nieve, según la fuente; y ninguna fuente da uno para la grava. Los juegos escalan el deslizamiento de otra forma: el de Forza está «normalizado» de modo que más allá de 1 se pierde agarre. Pero los frenos de un coche pueden dar lo mejor muy por debajo o muy por encima de 1, y las zonas de frenada normales pueden pasar de 1. Así que, para cada coche y en todas sus vueltas cargadas, la fuerza que hizo se agrupa según el deslizamiento que llevaba: la deceleración frente a la relación de deslizamiento de las ruedas al frenar en línea recta; la aceleración (como parte de lo que el coche hace a esa velocidad) frente al deslizamiento de las ruedas motrices; y el agarre en curva (como parte del agarre del coche a esa velocidad) frente al ángulo de deriva de cada eje. El límite es el deslizamiento que hay después del mejor punto, donde la fuerza ha caído un 8 %. Una curva que nunca cae en los datos (el agarre en curva y la tracción de Forza Horizon) no tiene límite, y el deslizamiento solo no marca nada allí. Con muy pocos datos, el límite es una vez y media el pico nominal.

**El terreno se conoce muestra a muestra**, cuando el juego lo dice: Forza hace vibrar los neumáticos en la grava, la tierra y la hierba (pocas muestras en un circuito de asfalto, muchas en tierra y en recorridos campo a través); Trackmania indica el material bajo cada rueda; y el terreno de un tramo de rally se encuentra como dice la sección 11. Las curvas, los hábitos de deriva y los umbrales se mantienen separados para el asfalto y para el terreno suelto.

**Cada evento se compara con la otra vuelta sobre los mismos metros.** En grava, en nieve o en un arcade de mucha deriva, derrapar es la forma de tomar una curva. Los estudios de control óptimo encuentran soluciones de «poca deriva» en asfalto, y soluciones «agresivas, con mucha deriva, incluso con contravolante» fuera de carretera. Los datos de rally muestran neumáticos «bien dentro de la región no lineal», y bloquear una rueda en terreno muy suelto puede incluso frenar el coche antes. Así que un evento que la otra vuelta también hizo (el 80 % o más) es la forma de tomar la curva, no un error. Y uno que la otra vuelta no hizo es un fallo solo si costó tiempo: el tiempo perdido desde justo antes hasta 40 m después. Un fallo que explica el 40 % o más de la pérdida de una curva se convierte en la causa de esa curva.

Umbrales de detección, la prueba con la otra vuelta, golpes y choques, y los textos de consejos: [Eventos de control del coche](race-control-events.md).

### 6b. Muchas vueltas: las estadísticas del recorrido {#b-many-laps-the-courses-statistics}

Comparación por clases, qué cuenta como error, las estadísticas y el mapa de errores: [Estadísticas del recorrido](race-course-statistics.md).

### 7. La trazada recorrida {#the-driven-line}

Para cada vuelta y cada curva, solo con las posiciones: dónde empezó a girar (una quinta parte de su curvatura más cerrada), su radio más cerrado (sobre ±8 m), el radio medio en la primera y en la segunda mitad de su cambio de rumbo, y así:

- **forma**: si el radio más cerrado dividido entre el radio medio es menor que 0,55, es una V; por encima de 0,75, una U;
- **vértice**: el radio de salida dividido entre el de entrada, por encima de 1,25, es tardío; por debajo de 0,8, temprano;
- **vértice de velocidad**: si su punto más lento está a más de 15 m antes de la mitad de su giro, es entrar lento y salir rápido; si está a más de 15 m después, sigue frenando pasado el medio.

Frente a la otra vuelta: cuánto fue por dentro o por fuera al empezar a girar, a través de la parte más cerrada y donde ambas iban planas, y dónde giró cada una. Cada hallazgo termina con la trazada que encaja con el coche de esa vuelta en esa curva, según a qué lleva la curva, la potencia y el agarre medidos del coche, la carga aerodinámica y el tren motriz; y si la vuelta la tomó así. La tabla «Curva a curva» enumera la vuelta más rápida por cada curva, con la forma de su trazada, y las mejores curvas juntas.

### 8. Dos mapas {#two-maps}

- **Dónde**: el recorrido coloreado por `dΔt/ds` frente a la referencia, en rojo donde se pierde tiempo y en verde donde se gana.
- **Por qué**: cada pérdida dibujada donde está su causa, coloreada por el grupo de la causa (frenada, entrada, salida, recta, coche) y más ancha cuanto más cuesta.

### 9. Repetición {#replay}

Un solo reloj, tres formas de convertirlo en el tiempo propio de cada vuelta: desde la salida; alineadas (todas las vueltas llegan a un mismo punto de la pista en el mismo momento, y luego se sueltan); y lado a lado (cada vuelta se mantiene a la distancia de la referencia).

### 10. Hacia qué lado está el mundo {#which-way-round-the-world-is}

El mundo del visor es de mano derecha, con Y hacia arriba. Un juego con mundo de mano izquierda (Forza entre ellos) sale reflejado: cada curva a derechas se dibuja como una a izquierdas, tanto el recorrido como las vueltas. Las vueltas lo indican por sí mismas: la dirección positiva es hacia la derecha en todos los adaptadores, y la suspensión exterior de una curva se comprime. Por eso la pestaña de carrera ofrece corregirlo, y **Cámara y escena → Invertir un eje del mundo** lo hace: X, Y o Z se dibujan invertidos. Solo cambia el dibujo, un reflejo incorporado a la matriz de vista. La cámara vuela en el mundo dibujado, pero los datos, el análisis y cada coordenada que muestran las herramientas siguen siendo los del juego. El análisis nombra las curvas a izquierdas o a derechas con la misma medida.

### 11. Rally: el derrape, el pie izquierdo, el aire {#rally-the-slide-the-left-foot-the-air}

Un tramo de rally no es un circuito conducido con peor agarre. En grava y nieve, el derrape es la forma de tomar una curva: el coche se gira al entrar moviendo su peso («los frenos mueven el peso del coche hacia delante... las ruedas delanteras ganan agarre, las traseras lo pierden, y el coche rota derrapando hacia la curva»), y luego vuelve el acelerador cuando está «alineado en la dirección en la que quieres ir» ([DirtFish: cómo usar los frenos](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). El pie izquierdo hace la frenada, para que acelerador y freno se puedan jugar uno contra otro. El freno de mano gira el coche en las curvas cerradas ([RallySport Ontario: conducción de rally, lo básico](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/),
[giro escandinavo](https://en.wikipedia.org/wiki/Scandinavian_flick)), y el coche deja el suelo. La sección 6 ya lee los derrapes frente a la otra vuelta; estas reglas cubren el resto.

- **El terreno.** Lo que dice la vuelta (`meta.surface`, el `--surface` de los grabadores de rally); si no, el nombre del evento: los rallies de asfalto (España, Croacia, Europa Central, Alemania, Japón, Córcega, Ypres), los de invierno (nieve), y el asfalto del Monte con nieve y hielo encima (mixto); si no, cómo se condujo el coche. El límite lateral de un coche Rally2 es de 0,7-0,9 g en grava y de 1,3-1,4 g en asfalto ([grenzbereich, valores de referencia](https://github.com/GitCrush/grenzbereich)), y en grava lleva mucha más deriva (sección 6). Así que un tramo donde el coche empujó 10 m/s² o más (percentil 95, a velocidad, sobre el terreno) con una deriva mediana por debajo de 6 grados, en cada curva que tomó dentro del 70 % de ese valor, era asfalto. Cualquier otro caso, o datos insuficientes para decidir, es terreno suelto.
- **Lo que puede hacer el coche, en el terreno donde lo hizo.** El agarre, la frenada y el empuje (sección 5) se miden por separado en asfalto y en terreno suelto cuando las vueltas condujeron una quinta parte o más de sus muestras en cada uno, y cada curva se juzga con el terreno bajo el coche en su punto más lento. Las muestras en el aire y durante 0,3 s después de un aterrizaje se dejan fuera de todo lo que mide el coche (envolventes, curvas de neumáticos, bloqueos y patinajes de las ruedas): un aterrizaje sacude el coche más allá de lo que pueden hacer sus neumáticos, y las ruedas que giran en el aire no son patinajes. La carga aerodinámica no se juzga en terreno suelto, donde los tramos rápidos y lentos de una etapa son carreteras distintas.
- **Un toque del pie izquierdo no es frenada.** Un toque de freno con el acelerador todavía a la mitad o más, durante menos de 15 m, asienta el coche o lo gira. El punto donde una vuelta empezó a frenar para una curva es el primer frenazo tras el que se soltó el acelerador, o el que duró más.
- **El coche se giró al entrar.** Para cada vuelta y curva, el mayor ángulo de deriva desde su frenada hasta 5 m después de su punto más lento. En terreno suelto, una vuelta que giró el coche 8 grados o más menos que la otra (la otra lo giró 12 o más) y que pisó la potencia más tarde, **giró el coche menos**. El consejo es levantar o dar un toque con el pie izquierdo en el freno al entrar, para que la zaga gire; con el punto de freno de mano de la otra vuelta cuando la usó, o con el freno de mano en una curva más lenta que 54 km/h; y tener el coche apuntando a la salida antes del vértice. Una vuelta que lo giró 12 grados o más de más, y aun así pisó la potencia más tarde, **lo giró de más**: hubo que enderezarlo antes de poder bajar la potencia. Cualquiera de los dos es la causa de la curva a la salida, tras un fallo de control del coche. El consejo de trazada en terreno suelto dice lo mismo en todas las curvas.
- **El aire.** Un vuelo 0,2 s o más largo que el de la otra vuelta, que costó tiempo desde 10 m antes del despegue hasta 40 m después del aterrizaje (o el final de la curva), es la causa cuando explica el 40 % o más de la pérdida de la curva. La curva siguiente, alcanzada más despacio, lo dice. En el aire el coche no puede girar, frenar ni acelerar. El consejo mantiene el acelerador en el despegue («no levantar el acelerador durante el despegue», que hace bajar el morro) y toma la cresta un poco más despacio, o con un toque de freno, para que el coche se mantenga bajo ([DirtFish: cómo saltar con un coche de rally](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Complejos de como máximo tres curvas.** Un tramo lleno de curvas que nunca se conduce plano no es un complejo largo: a partir de tres curvas empieza uno nuevo.

`src/race/rally.test.ts` somete el análisis a todo esto en tramos hechos con un modelo sencillo: un coche que giró menos y pisó la potencia tarde, un vuelo más largo, toques de pie izquierdo, un tramo lleno de curvas, asfalto frente a grava.

## Datos, y lo que permite cada fuente {#data-and-what-each-source-allows}

| Fuente | Frecuencia | Canales | Permite |
|---|---|---|---|
| Archivos de vuelta de FH Companion | ~5 m | posición, velocidad, acelerador, freno, volante, aceleración lateral y longitudinal, marcha | todo salvo el control del coche, que necesita la telemetría junto a ellos |
| `.tele.gz` de FH Companion, junto a cada archivo de vuelta | los 64 Hz del juego (un grabador que guarda cada paquete escribe unos 110 por segundo; se descartan las repeticiones) | todo el Data Out de Forza: por rueda, relación de deslizamiento, ángulo de deriva, deslizamiento combinado, rotación, suspensión, vibración de la superficie; la velocidad en el marco del coche; la velocidad de guiñada | todo, incluido el control del coche |
| Forza Data Out, grabado con `heat3d_capture telemetry` | 60 Hz | todo lo anterior, y por rueda: temperatura del neumático, relación de deslizamiento, ángulo de deriva, deslizamiento combinado, recorrido de la suspensión, velocidad de la rueda, banda sonora; RPM, potencia, par, velocidad de guiñada | todo |
| Assetto Corsa, ACC, AC EVO, AC Rally (memoria compartida, `heat3d_capture telemetry --game ...`) | 60-333 Hz | un conjunto mayor: temperatura del núcleo del neumático y interior, medio y exterior; presiones; temperaturas de frenos; cargas de rueda; caída; relación de deslizamiento y ángulo; la velocidad en el marco del coche; ABS y control de tracción actuando (ACC, EVO, AC Rally) | todo |
| `.ibt` de iRacing, leído directamente | 60 Hz | posición por GPS, pedales, volante, g, guiñada, temperatura de la carcasa por rueda, recorrido del amortiguador, presión, desgaste | todo; control del coche a partir del ángulo de deriva (su guiñada frente a la dirección de marcha) y del volante, sin deslizamiento (no se registra) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | por cuadro; 100 Hz | posición, velocidad en el mundo y ejes del coche, por rueda velocidad en la huella del neumático y suspensión, pedales, volante, reloj de etapa y longitud | todo; deslizamiento y ángulo de deriva derivados |
| Richard Burns Rally (NGP UDP) | por paso de física | posición, velocidades propias del coche, por rueda deflexión y fuerza del muelle, pedales | todo salvo el deslizamiento de rueda |
| BeamNG.drive (la mod del protocolo `heat3d`) | hasta 100 Hz | posición, velocidad en el mundo y ejes, por rueda velocidad de superficie, rotación, carga y contacto con el suelo | todo; deslizamiento y ángulo de deriva derivados |
| Trackmania (el plugin de Openplanet) | por cuadro | posición, velocidad delantera y lateral, pedales (freno sí o no), volante, por rueda coeficiente de deslizamiento y terreno suelto, en el aire | todo; ángulo de deriva a partir de la velocidad lateral |

Cada fuente se convierte en un solo formato de vuelta, `heat3d-lap`, cuyos canales tienen nombres canónicos (`speed`, `throttle`, `tireTemp[FL]` ...). El icono del coche y las gráficas dibujan los canales que tenga cada vuelta.

## Fuentes {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Acelerar tus sectores: formas de la variación de tiempo](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (delta en el dominio de la distancia)](https://github.com/taishiliu25/lap-delta-analyzer)
- [Guía de análisis de vueltas de iRacing](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: vueltas de sesión](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: análisis de trazadas](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: vuelta teórica a partir de sectores](https://overcut.gg/)
- [Track Titan: cómo analizar la telemetría](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: análisis de frenada, bloqueo e indicadores de estabilidad (sept. 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: sobre el acelerador (ene. 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: indicadores clave de rendimiento de los pilotos de carreras (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Modelos de fricción neumático-carretera y deslizamiento óptimo (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: fricción neumático-pavimento, deslizamiento en el pico sobre nieve y hielo](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: coeficientes de fricción de neumáticos, pico y deslizamiento](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: fuerzas longitudinales](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: fuerzas laterales](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Estabilidad del vehículo, límites de deslizamiento de la carrocería (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Conducción de rally con mucho deslizamiento lateral (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Maniobras de rally de tiempo mínimo (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [Velocidad de guiñada de referencia del ESC (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Detección de subviraje y sobreviraje con el volante frente a la guiñada (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: ángulo de dirección, Ackermann y gradiente de subviraje](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: canales matemáticos (Kus, g combinada)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: widget de sobreviraje y subviraje](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Frenado por cadencia: bloqueo en superficies muy sueltas](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: registro de datos en rallies de grava](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: cómo usar los frenos](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: cómo saltar con un coche de rally](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: conducción de rally, lo básico](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Giro escandinavo](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: dinámica de vehículos de rally, valores de referencia](https://github.com/GitCrush/grenzbereich)
- [Plugin de entrenamiento de derrapes de Trackmania (constantes)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania: análisis del speedslide](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: flujos de coaching](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: la línea en V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (velocidad de salida frente a tiempo mínimo)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: orden para mejorar el tiempo de vuelta](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: los tres tipos de curvas](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: priorizar curvas](https://driver61.com/uni/prioritising-corners/)
- [Driver61: distintas curvas, distintas técnicas](https://driver61.com/uni/different-corner-technique/)
- [Driver61: las seis fases de una curva](https://driver61.com/uni/corner-phases/)
- [Driver61: agarre](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (extracto)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: qué es un coche de impulso](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [El debate impulso frente a caballos de potencia](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Matemáticas de la trazada, parte 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD frente a FWD, parte 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [Técnica de tracción delantera](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD frente a RWD en curva](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Trazada (racing line)](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: técnica en curva](https://www.formula1-dictionary.net/cornering_tech.html)
- [Velocidad máxima en curva](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Vocabulario de telemetría de carreras](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Planificación global de trayectorias de tiempo mínimo que considera la curvatura y la distancia](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: optimización global de trayectorias de carrera](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: el factor de inercia](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Introducción al círculo de fricción](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: diagrama g-g](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Deslizamiento longitudinal](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Subviraje, visión general](https://www.sciencedirect.com/topics/engineering/understeer)
- [Subviraje y sobreviraje](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Documentación de Forza Motorsport Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: aceleración limitada por tracción](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: aceleración limitada por potencia](https://hpwizard.com/accelerating-power-limit.html)
- [Memoria compartida de AC EVO](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [Lector de telemetría de AC Rally](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [Lectura de archivos IBT de iRacing](https://github.com/teamjorge/ibt)
