---
title: "Figuras"
parent: "Replay"
nav_order: 3
has_children: true
lang: "es"
source: "figures.md"
source_hash: "e86483d60237"
translated: true
outdated: false
---

# Figuras

Una **figura** es un pequeño modelo 3D de lo que es realmente una unidad: un tanque, un caza, un barco, un soldado. La [repetición](match-replay.md) dibuja cada unidad como su figura a tamaño real, en lugar de una caja simple.

Hay unos 2.000 vehículos, aviones, barcos, armas y soldados con nombre, todos construidos por el propio visor.

![Tanques de los datos de demostración dibujados como sus propias figuras](../assets/img/es/replay-tanks.webp)

## Qué hay en el catálogo {#what-is-in-the-catalogue}

| Ámbito | Ejemplos |
|---|---|
| Personas | soldado de pie, agachado o tumbado; francotirador, antitanque, sanitario, tripulación |
| Tierra | tanques, vehículos de combate de infantería, defensa antiaérea, artillería, camiones y coches, trenes y tranvías |
| Aire | cazas, aviones de ataque, bombarderos, transportes, helicópteros, desde biplanos hasta reactores modernos |
| Mar | buques de guerra por clase, portaaviones, submarinos, lanchas, mercantes |
| Armas | misiles, cohetes, bombas, torpedos, bengalas y chaff |
| Marcadores | granadas de humo, de destello y de fuego, bombas colocadas, banderas, puntos de aparición, puntos de ruta |

## Cómo se hacen las figuras {#how-the-figures-are-made}

- **Construidas a partir de dimensiones publicadas.** La mayoría de las figuras las hace el propio constructor de figuras del visor, a partir de cifras públicas: longitud, anchura, altura, ruedas de rodadura, torreta y cañón, alas y cola. Después, su forma se ajusta con fotografías, planos y dimensiones públicas. No se usan modelos de ningún juego.
- **Modelos libres.** Algunas figuras usan modelos 3D libres (CC0 o CC BY) cuando son más fieles, a veces combinados con el casco construido. Los autores de las obras CC BY se acreditan en [Créditos de las figuras](figure-credits.md); las obras CC0 no necesitan crédito y no se listan allí.
- Cada figura tiene una versión completa, una simplificada y una lejana (niveles de detalle, LOD), para que se puedan dibujar miles a la vez.

## Qué figura recibe una unidad {#which-figure-a-unit-gets}

El visor mira las columnas propias de los datos:

1. **Nombres**: las columnas llamadas *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* o *Figure* se comparan con el catálogo: exactamente, mediante unos 4.000 alias (ids de unidad de varios juegos), por el inicio conocido más largo (`F-16C_50` es el F-16C), o por el nombre de figura más corto que empieza igual.
2. Un nombre cuya figura no encaja con el **tipo** de la unidad no se usa (un camión llamado *Typhoon* no es el caza).
3. **Tipos**: las columnas llamadas *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* o *Domain* dan una figura de clase: etiquetas de Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), iconos de mapa o palabras sueltas (tank, helicopter, infantry).
4. Los datos sin ninguna de las dos cosas son datos de personas: todos son soldados.

Así que la forma más fácil de obtener las figuras correctas es una columna `vehicle` con los nombres reales, o una columna `type` con etiquetas de Tacview.

**Mi unidad aparece como una caja o un soldado.** Añada una columna `vehicle` con el nombre real, o una columna `type` con una etiqueta de Tacview. Pase el ratón sobre la unidad para ver qué nombre se encontró. Los datos que tienen columnas así pero no dicen nada de una unidad la dejan como caja; los datos sin ninguna de ellas se dibujan como soldados.

## Ajustes {#settings}

La sección **Figuras** de la barra lateral de la repetición fija el tamaño, el tamaño mínimo en pantalla, en qué se convierten las unidades lejanas (figura, flecha, símbolo) y los efectos que se dibujan sobre ellas. Véase [Repetición de partida](match-replay.md#figures). Humo, fuego y otros efectos temporizados: [Figuras en el modo de figuras superpuestas](figure-replay.md).

## Un paquete local de figuras opcional {#an-optional-local-figure-pack}

Puede guardar en su propio equipo un paquete opcional de figuras propias. Sus figuras ocupan el lugar de las figuras del catálogo con los mismos nombres. Nunca forma parte del repositorio ni de una versión publicada; sin él, no cambia nada.
