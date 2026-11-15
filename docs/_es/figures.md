---
title: "Figuras"
nav_order: 11
has_children: true
lang: "es"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figuras

Una **figura** es un pequeño modelo 3D de lo que es realmente una unidad: un tanque, un avión a reacción, un barco, un soldado. La [repetición](match-replay.md) dibuja cada unidad como su figura a tamaño real, en vez de como una caja sencilla.

Hay unos 2.000 vehículos, aeronaves, barcos, armas y soldados con nombre, todos construidos por el propio visor.

![Tanques de la demo dibujados como sus propias figuras](../assets/img/en/replay-tanks.webp)

## Qué hay en el catálogo {#what-is-in-the-catalogue}

| Ámbito | Ejemplos |
|---|---|
| Personas | soldado de pie, agachado o tumbado; francotirador, antitanque, médico, tripulación |
| Terrestre | tanques, vehículos de combate de infantería, defensa antiaérea, artillería, camiones y coches, trenes y tranvías |
| Aire | cazas, aviones de ataque, bombarderos, transportes, helicópteros, desde biplanos hasta reactores modernos |
| Mar | buques de guerra por clase, portaaviones, submarinos, lanchas, mercantes |
| Armas | misiles, cohetes, bombas, torpedos, bengalas y *chaff* |
| Marcadores | granadas de humo, destello e incendio, bombas colocadas, banderas, apariciones, puntos de paso |

## Cómo se hacen las figuras {#how-the-figures-are-made}

- **Construidas a partir de dimensiones publicadas.** La mayoría de las figuras las hace el propio constructor de figuras del visor a partir de cifras públicas: longitud, anchura, altura, ruedas de rodaje, torreta y cañón, alas y cola. Su forma se ajusta después con fotografías, dibujos y dimensiones publicadas. No se usa ningún modelo de ningún juego.
- **Modelos libres.** Algunas figuras usan modelos 3D libres (CC0 o CC BY) cuando son más fieles, a veces combinados con el casco construido. Los autores de obras CC BY se acreditan en [Créditos de las figuras](figure-credits.md); las obras CC0 no requieren crédito y no se listan allí.
- Cada figura tiene una versión completa, una simplificada y una lejana (niveles de detalle, LOD), para poder dibujar miles a la vez.

## Qué figura recibe cada unidad {#which-figure-a-unit-gets}

El visor mira las columnas propias de los datos:

1. **Nombres**: las columnas llamadas *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* o *Figure* se comparan con el catálogo: exactamente, mediante unos 4.000 alias (ids de unidad de varios juegos), por el inicio conocido más largo (`F-16C_50` es el F-16C), o por el nombre de figura más corto que empiece igual.
2. Un nombre cuya figura no encaja con el **tipo** de la unidad no se usa (un camión llamado *Typhoon* no es el caza).
3. **Tipos**: las columnas llamadas *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* o *Domain* dan una figura de clase: etiquetas de Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), iconos de mapa o palabras sencillas (tank, helicopter, infantry).
4. Los datos sin ninguna de las dos cosas son datos de personas: todos son soldados.

Así que la forma más sencilla de obtener las figuras correctas es una columna `vehicle` con los nombres reales, o una columna `type` con etiquetas de Tacview.

**Mi unidad aparece como caja o como soldado.** Añade una columna `vehicle` con el nombre real, o una columna `type` con una etiqueta de Tacview. Pasa el ratón sobre la unidad para ver qué nombre se encontró. Los datos que tienen esas columnas pero no dicen nada de una unidad dejan la caja; los datos sin ninguna se dibujan como soldados.

## Ajustes {#settings}

La sección **Figuras** de la barra lateral de la repetición fija el tamaño, el tamaño mínimo en pantalla, en qué se convierten las unidades lejanas (figura, flecha, símbolo) y los efectos que se dibujan sobre ellas. Véase [Repetición de partida](match-replay.md#figures). Humo, fuego y otros efectos temporizados: [Figuras en la superposición de figuras](figure-replay.md).

## Un paquete local de figuras opcional {#an-optional-local-figure-pack}

Puedes guardar en tu propio equipo un paquete opcional de figuras propias. Sus figuras ocupan el lugar de las del catálogo con los mismos nombres. Nunca forma parte del repositorio ni de una versión publicada; sin él, nada cambia.
