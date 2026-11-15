---
title: "Maniobras"
parent: "Hallazgos"
nav_order: 4
lang: "es"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Maniobras: cómo se mueven los grupos

**Hallazgos → Maniobras** sigue cómo se mueven las unidades de cada bando
*como grupos* y nombra las maniobras que hacen: un flanqueo, una pinza, una
ruptura, una emboscada, una retirada, una defensa antimisiles, cruzar la T.
Cada una indica qué tan segura es, los números que hay detrás, si rindió y
sus paralelos en la doctrina y en la historia. **Análisis masivo → Maniobras**
las cuenta en miles de partidas: cuántas veces se hace cada una por mapa, modo
y bando, y cuántas veces rinde.

Todo se calcula en tu navegador, en su propio worker
(`src/insights/maneuver`). Una partida de unas cuantas cientos de unidades
tarda entre 10 y 500 ms; una guerra aérea de dos horas con miles de objetos,
alrededor de un segundo.

## Cómo se usa {#using-it}

- Abre **Hallazgos**, pestaña **Maniobras**. Cuenta al abrirla por primera
  vez; tras cambiar los filtros, usa **Buscar de nuevo**.
- **Seguro / Probable / Posible** fija la confianza que se muestra (Probable
  por defecto).
- La **línea de tiempo** tiene una franja por bando y una barra por maniobra;
  la **lista** debajo muestra lo mismo, por tiempo. Al hacer clic, se cambia a
  la repetición en su inicio, la cámara vuela hasta allí y la maniobra se dibuja
  en 3D: el recorrido de cada grupo como una flecha (los dos brazos de una pinza
  son sus arcos), los contornos de los grupos en el momento clave (el enemigo
  en el color de su bando) y el frente enemigo como una línea blanca.
  **Dibujar todas en 3D** añade las demás maniobras de la partida, tenues. Las
  líneas se envían a la tarjeta gráfica una vez, cuando cambia la selección, y
  no en cada cuadro: con 480 maniobras dibujadas durante la reproducción, los
  tiempos de cuadro en una GPU real (WebGL2 y WebGPU, p99 de 18,0-18,5 ms, máximo
  de 19,5-20,8 ms) son iguales a los que se obtienen sin ellas.
- Una maniobra abierta muestra su resultado (bajas y pérdidas de las unidades
  que la hicieron, mientras duró y justo después, frente al intercambio de su
  bando durante la partida), sus pruebas y las entradas de la base de
  conocimiento sobre ella: la doctrina y los paralelos históricos (Cannas para
  una pinza, Sedán 1940 para una ruptura, Tsushima para cruzar la T, la
  Operación Bolo para una finta...).
- La tabla pequeña al final: por tipo y bando, cuántas se hicieron y cuántas
  rindieron.

![Una pinza en la partida sintética de demostración: las flechas de los dos brazos, el cuerpo enemigo y su frente](../assets/img/en/maneuvers.webp)

## Cómo se encuentran los grupos {#how-groups-are-found}

Cada unidad se coloca en una línea de tiempo común (un paso de 1 s a pie, de
2 s en otros casos, más largo en archivos muy grandes), y se mantiene quieta
al morir, para que un reaparecer no trace una línea en el mapa. En cada paso,
se unen las unidades de un bando y de un tipo (aviones, vehículos, barcos,
infantería) cuando están cerca - 18 m a pie, 170 m para vehículos, 3 km para
barcos, 5 km para aviones - y se mueven de forma parecida (velocidades dentro
de la mitad de la más rápida, o ambas quietas). Un grupo conserva el id del
grupo en el que estaban la mayoría de sus miembros. Una unidad sin clase se
clasifica como a pie, en vehículo o en el aire según su velocidad.

La **forma** de un grupo se lee respecto de su rumbo: una columna o una línea
según su dispersión a lo largo y a lo ancho; una cuña cuando el centro va
delante; un escalón cuando los miembros se retrasan hacia un lado; una caja
cuando ocupan las esquinas.

Todo se juzga a la escala de la propia partida: el **alcance de combate** `R`
es el percentil 75 de la distancia entre un asesino y su víctima (acotado al
sentido del dominio), y los tiempos de una maniobra se escalan según el tipo
de unidad (en la infantería, un tercio de los del terreno).

## Qué encuentra {#what-it-finds}

| Maniobra | Se encuentra cuando |
|---|---|
| Formación | un grupo mantiene una forma en el 60% de sus pasos en movimiento durante 30 s |
| Asalto frontal | un grupo se acerca desde fuera de alcance hasta el contacto, ¾ R o más, desde dentro de 35° del rumbo que mira el enemigo |
| Ataque de flanco | lo mismo desde 50-130° (la retaguardia más allá); seguro solo con una *fuerza de fijación* propia que combate al enemigo allí (bajas en ambos sentidos) |
| Pinza | dos ataques de flanco de un bando sobre el mismo cuerpo enemigo, desde lados opuestos (100° o más de separación), en 90 s; seguro cuando los brazos combaten |
| Cerco | un grupo enemigo compacto con al menos tantos del otro bando alrededor, a 1,5 R, de dos grupos o más, sin hueco mayor de 100°, durante un minuto, aislado de los suyos; seguro cuando el anillo se cerró a ½ R y combatió el bolsón |
| Penetración | un grupo atraviesa una línea mantenida (enemigos quietos 30 s a su izquierda y a su derecha, el centro de su bando más allá); seguro cuando llega a ½ R más allá, se queda 20 s y combate allí; una ruptura a otro R más allá |
| Avance escalonado con cobertura | en un grupo pequeño, una parte avanza mientras el resto está quieto, con los papeles intercambiándose cuatro veces o más, y con fuego de cobertura de la parte quieta |
| Concentración / dispersión | la parte de un bando cerca de su punto más denso sube del 35% al 60% (unidades que llegan a 1,5 R o más, y luego contacto), o baja cuando el bando se extiende |
| Finta | un elemento pequeño en contacto atrae a dos o más enemigos desde otro lugar; luego un grupo mayor golpea a cuatro alcances de distancia, donde el enemigo tiene menos |
| Retirada / persecución | un grupo en contacto da la vuelta y abre R desde donde combatió; seguro cuando un enemigo de allí acababa de matar a uno de sus miembros y el grupo se alejó 2 R de ese asesino (nunca a pie: ver más abajo); los enemigos que se mueven en la misma dirección y siguen el ritmo persiguen |
| Defensa en profundidad | unidades quietas en dos o más franjas a través del eje enemigo, a R de profundidad, con el enemigo avanzando y fuego desde las franjas |
| Pendiente inversa | tres o más bajas a corta distancia por unidades quietas contra víctimas que llegaron por encima de una cresta |
| Emboscada | un grupo en movimiento se encuentra con enemigos que llevaban 45 s quietos; ellos disparan primero y los que se mueven pierden dos o la mitad del grupo |
| Pantalla | una o dos unidades que avanzan delante de un cuerpo de tres o más, encontrando primero al enemigo |
| Líneas interiores | los grupos de un bando, cerca unos de otros, entre los del otro, con sus unidades cambiando entre ellos |
| Ritmo | un bando que responde al contacto (giro, cambio de velocidad, primer disparo) 1,5 veces más rápido, con p de Mann-Whitney menor que 0,05 |
| Manivela, muesca, arrastre, bombeo | el objetivo de un lanzamiento de misil gira al tirador a 35-70°, 75-105°, más allá de 140°, o lo arrastra y vuelve a girar |
| Pinza aérea, muro, cola-guía, triturador | un par que se separa hacia un enemigo; tres en línea hacia el enemigo; un elemento a 5-20 km detrás de otro; dos que orbitan un mismo punto, separados a un paso el uno del otro |
| Patrulla aérea de combate | orbita alrededor de una estación durante tres minutos |
| Combate por energía / ángulos | en un combate cerrado - rumbos a 30° de diferencia, cada uno teniendo al otro en el morro por turnos, o una baja entre ellos - se usa la altura y se sube, o se vira cerrado y se pierde velocidad; seguro cuando uno mató al otro |
| Paquete de ataque, SEAD | un grupo aéreo de funciones mixtas, algunos de los cuales atacan el suelo; las bajas de defensa antiaérea antes que la mayoría de las demás bajas en tierra |
| Línea de batalla, cruzar la T | tres barcos en columna; una columna que cruza a escuadra la cabeza de una columna enemiga |

Cada maniobra indica qué **patrones** de la base de conocimiento muestra
(`patterns-maneuver.ts`: formación, asalto frontal, doble envolvimiento,
cerco, penetración, fuego y maniobra, finta, retirada, persecución, defensa en
profundidad, pantalla, dispersión, defensa antimisiles, combate de ángulos,
patrulla aérea de combate, paquete de ataque, línea de batalla, cruzar la T) y
las entradas que conviene leer primero; las entradas antiguas llevan los nuevos
patrones a través de `knowledge/maneuver-tags.ts`. Véase [La lente de
conocimiento](knowledge.md).

**Rindió** compara el intercambio de las unidades mientras duró (y un minuto
después) con el de su bando durante la partida; una retirada rinde cuando
perdió menos unidades después de girar que antes, una defensa antimisiles
cuando el avión sobrevive un minuto, un cerco cuando el bolsón pierde la mitad.

## En muchas partidas {#over-many-matches}

El resumen de cada partida (`src/mass/summarize.ts`, véase [Análisis
masivo](mass-analysis.md)) lleva una pequeña sección `maneuvers`: por tipo y
bando, cuántas se hicieron (en Probable o más), cuántas rindieron, cuántas no,
bajas y pérdidas. **Análisis masivo → Maniobras** las suma en las partidas que
mantiene el filtro - por mapa y modo, o en todas - con el intervalo de Wilson
de la tasa de las que rindieron; una fila carga las partidas en las que se
hizo. Los resúmenes escritos antes de que existiera la sección no la tienen:
ejecuta `node tools/3dheat-summarize.mjs <carpeta> --force` para añadirla.

## Qué tan seguro es {#how-sure-it-is}

Partidas sintéticas con maniobras plantadas (`synth.ts`, ejecutadas por
`maneuver.test.ts`): se encuentran las 28 clases plantadas en Probable o más;
de 50 maniobras informadas, 31 son de la clase plantada y las otras 19 también
están realmente ahí (la formación del grupo que se mueve, la aproximación
frontal de la columna que penetra); ninguna es errónea. En 30 partidas nulas -
caminatas aleatorias separadas y mezcladas, unidades quietas al azar, aviones
en tramos rectos, una multitud que deambula - no se informa nada en Probable o
más.

Con datos reales (decenas de batallas terrestres, unas cuantas misiones
aéreas largas, una docena de partidas de tirador): asaltos frontales, flancos,
penetraciones y cercos en las batallas de tanques; formaciones y combates
cerrados en el aire; defensas antimisiles, órbitas de patrulla aérea y pares
de cola-guía en las misiones de guerra aérea; ejecuciones frontales,
columnas y algunas emboscadas y pares de avance en el tirador. Los umbrales
son las formas de la doctrina a escala de juego; lee un hallazgo suelto con
sus pruebas, y las tasas de la tabla masiva con sus intervalos.

### Contra modelos nulos de las mismas partidas {#against-null-models-of-the-same-matches}

Un detector puede engañarse con el terreno y la multitud: en una refriega cada
grupo tiene enemigos por todos lados. Por eso cada clase también se ejecuta
sobre **modelos nulos** construidos a partir de las mismas partidas
(`nulls.ts`), en los que los bandos ya no se encuentran como lo hacían: la
línea de tiempo de un bando girada por un tercio a dos tercios de la partida
(*desplazamiento*), o sus trayectorias giradas alrededor del centro del mapa
(*rotación*); y las etiquetas de equipo barajadas (*equipos*, que por
construcción conserva cerca de la mitad de los combates reales). Los combates
solo se cuentan como bajas emparejadas con sus muertes, el asesino a menos de
2 R y la víctima en el lugar; un modelo nulo rompe esas parejas. Hallazgos en
Probable o más, reales frente a los modelos nulos (30 batallas de tanques; 12
partidas de tirador):

| Clase | Batallas de tanques: real / desplazamiento / rotación | Tirador: real / desplazamiento / rotación |
|---|---|---|
| Cerco | 0 / 0 / 0 (antes 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Penetración | 0,03 / 0,02 / 0,05 (antes 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Flanco | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Asalto frontal | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Retirada | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (por eso nunca es segura a pie) |
| Emboscada | - | 0,17 / 0,04 / 0,04 |
| Combate por energía | 1,2 / 0,1 / 0,85 | - |
| Combate de ángulos | 0,6 / 0,07 / 0,3 | - |

Los combates aéreos cerrados sobre el centro de un campo de batalla sobreviven
a un giro alrededor de ese centro, así que la columna de rotación los favorece
menos de lo que favorece a las clases terrestres. Las clases dentro de un
bando - formación, patrulla aérea de combate, triturador, paquete de ataque,
SEAD, avance, pantalla - no dependen del otro bando y no se prueban de esta
manera. `maneuver.test.ts` comprueba que los modelos nulos eliminan el flanco,
la pinza, el cerco, la penetración, la emboscada y la retirada plantados en las
partidas sintéticas.

## Límites {#limits}

- Los grupos necesitan posiciones a lo largo del tiempo; un archivo de solo
  eventos no tiene ninguna.
- La orientación no se lee de los datos: el frente del enemigo está donde la
  fuerza de fijación lo combate; si no, donde se mueve; si no, de donde llegó
  el atacante.
- El terreno se lee de las alturas propias de las unidades (la pendiente
  inversa); no hay prueba de línea de visión.
- Los archivos muy grandes se muestrean con pasos más largos; las maniobras
  aéreas cortas en ellos se leen igualmente con pasos de 2-4 s.
