---
title: "Velocidades de movimiento"
parent: "Pizarra táctica"
nav_order: 1
lang: "es"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Velocidades de movimiento

¿Cuánto tarda un soldado, un tanque o un reactor en ir de A a B? Esta página dice a qué velocidad se mueve cada figura en la [pizarra táctica](tactics-board.md), y de dónde salen esos números, para que puedas fiarte de los tiempos de tu plan o cambiarlos.

La [pizarra táctica](tactics-board.md) calcula el tiempo de un plan a partir de la velocidad de cada figura. Las velocidades vienen de un archivo por juego en `src/tactics/speeds/`: una velocidad para cada modo de movimiento de cada clase (infantería, vehículos terrestres, barcos, aeronaves, helicópteros), más perfiles con nombre, como uno por cada arma de CS2 o uno por cada tipo de aeronave. Cada archivo enumera sus fuentes, y cada valor indica si es **oficial** (los datos propios del juego, o las cifras publicadas de un avión real) o **aproximado** (medido por la comunidad o un valor típico).

Son puntos de partida. **Cada figura puede cambiar sus velocidades en la pizarra**, así que un plan puede usar una velocidad medida, un soldado cargado de peso o un tanque dañado.

## Modos {#modes}

| Clase | Modos |
|---|---|
| Infantería | arrastrarse (tumbado), agachado, andar (el paseo lento y silencioso), correr (movimiento por defecto), sprint |
| Vehículos terrestres, barcos | arrastrarse, con cautela, normal (campo a través), a toda marcha (velocidad máxima en carretera) |
| Aeronaves, helicópteros | lenta (aproximación, espera, vuelo estacionario), crucero, combate (velocidad de esquina o pasada de ataque), máxima |

Un modo que el juego no tiene se deja vacío: CS2 y Valorant no tienen sprint ni tumbarse.

## Pendientes {#slopes}

Cada archivo también indica cómo trata el juego las pendientes. CS2, Valorant y Squad limitan la velocidad horizontal, así que una pendiente no frena al jugador. Arma frena a la infantería en las pendientes, así que su archivo y el genérico usan la función de excursionismo de Tobler. Battlefield y los simuladores de vehículos usan una penalización de desnivel simple.

## Por juego {#per-game}

**Counter-Strike 2** (unidades por segundo; una unidad se toma como una pulgada). **Oficial.** Las velocidades de carrera son los valores `m_flMaxSpeed` de las definiciones de armas del juego: el cuchillo y la C4 a 250, las granadas a 245, las pistolas a 240 (Desert Eagle 230, R8 180), los subfusiles de 220 a 240, los fusiles de 210 a 225, la AWP a 200, las ametralladoras ligeras a 195 y 150. La AWP con mira (100), el AUG y el SG 553 (150) y el G3SG1 y el SCAR-20 (120) tienen sus propios perfiles. Andar es carrera × 0,52 y agacharse es carrera × 0,34. Valve no publica estos dos multiplicadores, pero todas las armas los muestran en las grabaciones de demos. Para comprobar un plan contra un movimiento real, carga una demo del mismo mapa y compara las velocidades de los jugadores.

**Valorant** (m/s). El cuchillo corre a 6,75 m/s. Cada arma multiplica esa cifra por su multiplicador de velocidad de carrera de los datos del juego, lo que da las velocidades que muestra el Arsenal del juego: 5,73 para la mayoría de las pistolas y subfusiles, 5,4 para los fusiles, 5,13 para las armas pesadas y el Operador, 5,06 para las escopetas. Estas velocidades de carrera son exactas. Las velocidades de andar y agacharse son **estimaciones** (0,55 y 0,4 × carrera) porque Riot no las publica. Los perfiles de francotirador con mira también son estimaciones.

**Battlefield** (km/h). **Aproximado.** EA no publica cifras de movimiento. Infantería: unos 1 m/s tumbado, 2 agachado, 4 corriendo y 6,4 en sprint. Vehículos, aviones, helicópteros y barcos reciben velocidades típicas del juego para su clase.

**Squad** (km/h). **Aproximado.** La carrera (3,3 m/s) y el sprint (5,9 m/s) vienen de un texto de la comunidad sobre las mecánicas del juego. Arrastrarse, agacharse y andar lento son estimaciones, y lo mismo cada clase de vehículo y los helicópteros.

**Arma** (km/h). **Aproximado.** Los ritmos de infantería son tiempos de la comunidad: unos 5 km/h andando, 9 km/h en ritmo táctico agachado, 15 km/h trotando y unos 21 km/h en sprint. Las velocidades máximas de vehículos son los máximos configurados de los vehículos originales de Arma 3 de cada clase, según un listado de terceros. Los modos de vehículo más lentos son estimaciones.

**DCS / War Thunder / IL-2** (km/h). Cada avión y helicóptero de la paleta tiene su propio perfil. Las velocidades de crucero y máxima son las **cifras publicadas** de los aviones reales, que los simuladores modelan de cerca. La máxima es a nivel del mar para los reactores y a la altitud nominal para los aviones de hélice, y la nota de cada perfil indica cuál. Las velocidades lenta y de combate son valores típicos. Los vehículos terrestres usan las velocidades de carretera publicadas de los vehículos reales, redondeadas (**aproximado**). Los barcos usan las velocidades máximas publicadas de su clase.

**Otros** (m/s). Valores por defecto **aproximados** del mundo real: arrastrarse 0,5, agacharse 1,5, andar 1,4, correr 3,5, sprint 6.

## Fuentes {#sources}

Counter-Strike 2
- [Definiciones de armas de CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [Páginas de armas de CSDB](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com weapons (multiplicadores de velocidad de carrera)](https://valorant-api.com/v1/weapons)
- [VLR.gg: velocidad del cuchillo 6,75 m/s](https://vlr.gg/post/4240306)
- [Soporte de Riot: Walking, Running and Crouching](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [Foros de EA: velocidad de movimiento de Battlefield 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Guía de movimiento de Battlefield 6](https://deltiasgaming.com/?p=309455)
- [Informe previo al lanzamiento de un sprint de 6,4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: texto sobre las mecánicas del juego Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (no publica velocidades)

Arma
- [Foros de Bohemia: velocidad al andar](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Foros de Bohemia: ajuste de la velocidad de movimiento](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Rastreador de comentarios de Arma 3: velocidad de sprint](https://feedback.bistudio.com/T64047)
- [Manual de campo de Arma 3: controles de infantería](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Estadísticas de vehículos de Arma 3 por facción (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Las especificaciones de Wikipedia de cada tipo de avión y helicóptero, enlazadas desde cada perfil en `air.json`
- [Velocidades V](https://en.wikipedia.org/wiki/V_speeds), para las velocidades típicas de aproximación y de combate
- [Wiki de War Thunder](https://wiki.warthunder.com/), para los vehículos terrestres
- [Destructor clase Arleigh Burke](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), y las velocidades publicadas de las otras clases de barcos

Otros
- [Velocidad de paseo preferida](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Función de excursionismo de Tobler](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
