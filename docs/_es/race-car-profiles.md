---
title: "Perfiles de coche y comparación"
parent: "Análisis de carrera"
nav_order: 56
lang: "es"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Perfiles de coche y comparación

Un coche solo puede frenar, girar y acelerar hasta cierto punto. El visor mide hasta dónde con tus propias vueltas, así que nunca te dice que hagas algo que tu coche no puede hacer. Esto también explica cuánto de un segundo perdido fue culpa del coche y no tuya.

![Coches comparados: dos coches uno al lado del otro con su agarre, frenada y tirón](../assets/img/en/race-cars-compared.webp)

El análisis solo le dice a una vuelta que frene más fuerte, que lleve más velocidad o que acelere antes donde su coche ha demostrado que puede hacerlo, y quita de una pérdida lo que los propios coches explican. Por eso los límites de cada coche (su *envolvente*, abajo) y su carácter (su *perfil*) se miden a partir de cada vuelta cargada de ese coche. Esta página trata de la envolvente, el perfil, la sección **Coches comparados**, y lo que deciden los coches en cada curva.

**Un coche** = vueltas con el mismo número de coche (o el mismo nombre, sin número) y el mismo índice de rendimiento: un ajuste distinto es otro coche.

## La envolvente: lo que puede hacer el coche a cada velocidad {#the-envelope-what-the-car-can-do-at-each-speed}

Por coche, sobre cada vuelta cargada de él, en **franjas de velocidad de 5 m/s** (24 franjas, hasta 120 m/s). Se dejan fuera las muestras en el aire, la estabilización de 0,3 s tras un aterrizaje, y desde 0,1 s antes de cada impacto hasta 1 s después; y se ignoran las aceleraciones de 80 m/s² o más (por encima de lo que aguanta cualquier coche con carga aerodinámica).

| Envolvente | Muestras | Valor por franja | Necesita |
|---|---|---|---|
| **agarre lateral** | la aceleración lateral **sostenida medio segundo** (la media de su valor absoluto en una ventana centrada de 0,5 s), solo donde el coche tomaba una curva: al menos un tercio del percentil 99 de toda ella | percentil 95 | 6 muestras |
| **frenada** | freno > 0,3; la aceleración longitudinal como mediana de cada muestra y sus dos vecinas | percentil 95 de la deceleración | 4 muestras |
| **tirón a máximo gas** | acelerador > 0,95, freno por debajo de 0,05; la misma mediana de tres | percentil 90 | 4 muestras |

Por qué sostenida medio segundo: un pianito, un deslizamiento que vuelve de golpe, un coche que se recupera, todo dispara la aceleración lateral durante un momento, y un coche que hace eso a menudo parecía tener más agarre del que tiene. Por qué mediana de tres: con separación de cinco metros, una muestra es mucho trecho, y un pico de una sola muestra es un pianito, un bache o un muro.

Leer la envolvente a una velocidad interpola entre los centros de las franjas, y toma la franja con datos más cercana cuando una franja está vacía.

**Sobre dos tipos de suelo.** Cuando las vueltas de un coche recorrieron una quinta parte o más de sus muestras en asfalto y en suelo suelto, se guarda una envolvente aparte para cada uno, y cada curva se juzga con el suelo bajo el coche en su punto más lento.

**Cruce.** La velocidad a partir de la cual el tirón cae como `1/v` (limitado por potencia) en lugar de mantenerse plano (limitado por tracción): la primera franja cuyo `a·v` está a 15 % del `a·v` más alto visto.

## El perfil: qué tipo de coche es {#the-profile-what-kind-of-car-it-is}

`profile`, a partir de las mismas vueltas (muestras en el suelo, no golpeadas, a más de 8 m/s):

| Medida | Cómo |
|---|---|
| **agarre sostenido** (m/s²) | percentil 95 de la aceleración lateral sostenida medio segundo |
| **tirón** hasta 50 km/h, 50-120, 120-200, más de 200 (m/s²) | la media del tirón a máximo gas de la envolvente en 3-14, 14-33, 33-56 y 56-90 m/s, a las velocidades que alcanzó el coche (hasta su más rápida + 2 m/s), a partir de al menos tres pasos de 1 m/s; y el mayor que mostró, y dónde |
| **frenada** (m/s²) | la frenada de la envolvente promediada de 60 a 160 km/h (16,7-44,4 m/s), la banda que nombra la comparación |
| **más rápido** | la velocidad más alta que alcanzó |
| **se queda en** | dónde dejó de ganar a máximo gas en una recta (abajo) |
| **aún tira a su máxima** | el tirón de la envolvente a su velocidad más alta: cuánto le quedaba por ir |
| **trasera atrapada, por vuelta** | veces por vuelta que se deslizó y hubo que corregirla (abajo) |
| **parte con el acelerador** | de esas, la parte que empezó con acelerador > 0,5 y sin freno |
| **suelta a** | la mediana de la aceleración lateral sostenida 0,15 s antes de que empezara cada deslizamiento, como parte del agarre |
| **más de 10° de deriva, en curva dura** | de las muestras en curva al 60 % de su agarre o más, la parte que se desliza (10° en asfalto, 20° en suelo suelto); necesita 30 muestras |
| **deriva mediana** | sobre las mismas muestras |
| **equilibrio** | ángulo de deslizamiento delantero menos trasero (múltiplos del pico nominal) en curva dura y sin deslizarse, media de al menos 30 muestras: + empuja hacia fuera |
| **superficie** | con más del 80 % de muestras sueltas: suelto; con menos del 20 %: asfalto; si no, mixto |

**Se queda en.** Cuenta una muestra cuando el segundo a su alrededor (±0,5 s, con al menos 0,9 s de datos) estuvo todo a máximo gas (> 0,95, sin freno), en el suelo, conducido **en recto** (|lateral| por debajo del mayor entre 4 m/s² y una cuarta parte de su agarre), ganando menos de **0,35 m/s²**, a más de 25 m/s y dentro del 90 % de la vuelta más rápida - a máximo gas subiendo una cuesta o por una curva larga también deja de ganar, muy por debajo de la velocidad punta del coche. Con al menos **un segundo** de esa meseta sobre todas las vueltas, la mediana de esas velocidades es donde se queda. Si no, no hay velocidad punta: donde ninguna recta fue lo bastante larga, *aún tira a su máxima* dice cuánto le faltó. Ninguna suposición más allá de lo que muestran las vueltas: la relación de cambio y el limitador acaban con el tirón de un coche mucho antes que la resistencia del aire.

**Perder la trasera.** Se cuenta donde el piloto tuvo que corregirla: tomando una curva al 60 % de su agarre o más, deslizándose (deriva por encima de 10° en asfalto, 20° en suelo suelto), con el volante (por encima de 0,06) girado **en contra** de la curva. Qué signo del volante concuerda con qué signo de la fuerza en curva se mide por vuelta (muestras que giran sin deslizarse). Un deslizamiento se cuenta una vez hasta que el coche deja de deslizarse. Un coche conducido un poco de lado a propósito no pierde nada; uno que necesita contravolante, sí. Se cuenta igual para cada coche, así que se pueden comparar dos. Necesita volante y un ángulo de deriva.

## Coches comparados {#cars-compared}

La sección de la barra lateral es **El coche** con un coche, **Coches comparados** con varios.

**La tabla**: una columna por coche, una fila por medida que tenga valor en algún coche: Agarre sostenido; Tirón hasta 50 km/h, 50-120, 120-200, más de 200; Frenada; Más rápido; Se queda en ("aún tira" cuando nunca lo hizo); Aún tira a su máxima; Trasera atrapada, por vuelta; Más de 10° de deriva, en curva dura. Cuando los coches difieren en más de un 3 %, se marca el mejor valor (más alto para agarre, tirón, frenada, velocidades; más bajo para deslizamientos de trasera).

**Un coche solo**: frases sobre lo que muestran las vueltas: el agarre que sostiene (m/s² y g), su tirón en cada banda, dónde dejó de ganar en las rectas largas (o que nunca se quedó, y cuánto tiraba aún a su máxima), y con qué frecuencia hubo que corregir su trasera ("casi nunca" con menos de una vez por vuelta, "sobre todo con el acelerador" cuando el 60 % o más empezaron así).

**Dos coches**: para cada par, una frase cada uno sobre lo que es el coche frente al otro ("X acelera mejor, pero no puede girar tan fuerte, necesita más distancia para frenar y pierde la trasera más fácilmente"), la tabla, cada diferencia clara la más grande primero, y luego **Cómo pilotar cada uno**. Con más de **3** pares, se muestra un par: el coche de la vuelta elegida frente a un coche elegido en una lista desplegable (por defecto el coche de la mejor vuelta de su clase; si no, el de la referencia; si no, el primer otro).

Una diferencia se dice solo cuando las vueltas la muestran con claridad:

| Diferencia | Se dice desde | Frase |
|---|---|---|
| agarre | **4 %** | "X mantiene N % más de agarre en las curvas … eso son M % más de velocidad por el centro de cada curva" (velocidad = √ de la relación de agarre) |
| tirón | **5 %**, en la primera banda que ambos coches tienen de 120-200, 50-120, más de 200 km/h | "X acelera N % más fuerte de 120 a 200 km/h"; también en la salida parada, o "aunque Y sale más fuerte del punto de partida", cuando la salida difiere en un 8 % |
| velocidad punta | **4 km/h** | "X alcanza más velocidad: dejó de ganar en …" |
| velocidad punta, solo uno | un coche se quedó y el otro no | "Y se quedó sin tirón en …; X seguía ganando cuando frenó" |
| velocidad punta, ninguno | ninguno se quedó | lo que ganaba cada uno a su máxima |
| frenada | **5 %** | "X frena N % más fuerte … Y tiene que frenar antes" |
| perder la trasera | al menos una vez por vuelta más **y** la mitad más de veces | "X pierde la trasera más fácilmente: se deslizó lo bastante como para necesitar contravolante N veces por vuelta frente a M …" - sobre todo con el acelerador (60 % o más) o sobre todo al entrar girando y levantando (30 % o menos), desde unos P % de su agarre; en suelo suelto "parte de eso es cómo se gira un coche; la corrección no lo es" |
| de lado | **12 puntos porcentuales** de curva dura por encima del umbral de deriva | "X va más de lado al límite" |
| equilibrio delantero | **0,3** del pico nominal | "X empuja más de delante … Quiere frenar y girar antes del vértice" |

Los rasgos del resumen: *tiene más agarre* / *no puede girar tan fuerte*, *acelera mejor* / *tira menos*, *alcanza más velocidad* / *alcanza menos*, *aún tira al final de las rectas* / *se queda sin tirón*, *frena más fuerte* / *necesita más distancia para frenar*, *es más estable* / *pierde la trasera más fácilmente* (*es mucho más resbaladizo …* al doble de veces más uno; *necesita corregirse más a menudo* en suelo suelto), *empuja de delante*. "Poco que distinguirlos de Y en estas vueltas" cuando no hay ninguna.

**Cómo pilotar cada uno:**

- un coche tiene más agarre y el otro tira más: lleva velocidad por el centro en una línea ancha y redonda (la "U") con el que tiene más agarre; frena en recto, gira el coche en un centro corto y cerrado y endereza la salida (la "V") con el que tiene más tirón;
- un coche va por debajo en ambas cosas: su mejor vuelta es la más limpia - frena en recto, el radio más amplio, acelerador a fondo en cuanto lo aguanta;
- un coche que pierde la trasera más fácilmente: mete el acelerador solo a medida que el volante se desenrolla y cambia pronto (deslizamientos con el acelerador), o suelta el freno suavemente y mantén un acelerador constante por el centro (deslizamientos al entrar).

El texto bajo la sección repite cómo se mide cada cosa.

## Lo que deciden los coches en una curva {#what-the-cars-decide-in-a-corner}

Cuando las vueltas son en coches distintos, cada hallazgo de una curva perdida termina con **Los coches:** - lo que de ello deciden los coches, y cómo sacar más partido a este (`carNote`):

- **Por el centro**, cuando este coche tiene menos del 96 % del agarre del otro, el otro iba más de 0,5 m/s más rápido en el punto más lento, y esta vuelta no quedó muy por debajo de lo que explica su agarre (por encima del 70 %): en la línea del otro coche, el agarre de este permite `v_otro · √(agarre_mío / agarre_otro)`. Si la vuelta lo llevó (dentro de 1 m/s), la diferencia es el coche, y ningún punto de frenada la cambia; si llevó menos, cuánto queda por ganar. Luego, dónde se puede ganar el tiempo: en una recta, entre dos, o en un coche que tira un 5 % más fuerte - después del vértice (frena en recto, gira más tarde, apunta pronto a la salida); si no, el radio más amplio que permita la carretera.
- **Una trasera que se soltó aquí** (un deslizamiento o trompo no compartido, o una deriva por encima del umbral de deslizamiento al entrar), en un coche que la pierde al menos una vez por vuelta más y la mitad más de veces: qué hacer con este coche - el acelerador metido a medida que se desenrolla el volante (sus deslizamientos empiezan con potencia el 60 % o más de las veces) o el freno soltado suavemente sin levantar.
- **La recta después**: cuando el tirón de los coches explicaba 0,03 s o más, el tirón más fuerte del otro coche desde la misma velocidad, con el tirón de ambos de 120 a 200 km/h.
- **Velocidad punta**: cuando esta vuelta alcanzó el 98 % de donde se queda su coche en una recta de más de 150 m, y la otra fue 1,5 m/s más rápido: esa es la velocidad punta del coche, y cada km/h más a la salida de la curva ayuda hasta llegar allí.
- **Frenada**: cuando el otro coche frena un 5 % más fuerte y esta vuelta frenó más de 5 m antes, que parte de la frenada anticipada es del coche.

La parte del coche también se quita del propio tiempo - ver [la parte del coche](race-corner-analysis.md#the-cars-share) - y una curva donde el coche explica el 60 % o más se atribuye al coche.

## Para desarrolladores {#for-developers}

Código: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` en [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` en [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
