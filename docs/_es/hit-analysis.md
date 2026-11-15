---
title: "Análisis de impactos (pestaña Vehículos)"
parent: "Replay"
nav_order: 4
lang: "es"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Análisis de impactos

La pestaña **Vehículos** muestra dónde recibió impactos un tanque, un barco o un soldado, y quién se los dio. Úsala para ver qué lado de un tanque recibe disparos, o qué enemigo hace el daño.

## Pruébalo {#try-it}

1. Carga una partida que tenga impactos (la tabla de abajo indica qué juegos los dan).
2. Abre la pestaña **Vehículos**, arriba.
3. En **Vehículo**, elige una unidad, por ejemplo un tipo de tanque. El número entre corchetes es cuántos impactos recibió.
4. Lee la figura: cada marca es un impacto, colocado donde golpeó.
5. Abre **Quién la alcanzó** para ver a los tiradores, las armas o los vehículos tiradores, con impactos, daño, bajas y distancia.

![La pestaña Vehículos: un tanque de demostración con marcas de impacto, y Quién la alcanzó abierto](../assets/img/en/hit-analysis-tank.webp)

Si no hay nada cargado, o los datos no tienen impactos sobre vehículos, la pestaña dice qué falta y qué conversor usar.

```
        shooter ----> o  hit mark on the figure
        shooter ----> o
  [ tank figure ]
```

La figura muestra los impactos donde los datos dan un punto o una parte del cuerpo. El desglose (quién la alcanzó, con qué, con cuánta fuerza, desde qué distancia) funciona con todas las fuentes.

## Qué da cada fuente {#what-each-source-gives}

| Fuente | Punto en la unidad | Tirador | Arma | Daño / resultado |
|---|---|---|---|---|
| War Thunder | sí, en el marco de la unidad, con el sentido del disparo | sí | el vehículo del tirador | crítico, grave, módulos destruidos, disparo mortal |
| CS2 | parte del cuerpo (hitgroup) | sí | sí | daño, blindaje, salud restante |
| World of Tanks | sí (caja del componente, entrada y salida) | sí | - | daño o ninguno (rebote, sin penetración) |
| World of Warships | sí, en el marco del barco | sí | tipo de impacto | - |
| Squad | vehículos: sí, el impacto colocado en el marco del vehículo desde su propia posición y rumbo | no (los datos no nombran ninguno) | el tipo de daño | la caída de la salud del vehículo en ese momento, destruido |
| Soldados de Squad | no: el conversor guarda los resultados del impacto (hueso y punto de impacto) en bruto; las filas `impact` con `hitBone` se leen en cuanto las escribe | | | heridas y muertes solamente |
| Arma (OCAP, el grabador de Arma 3) | no: OCAP registra quién hirió o mató a quién, con qué y desde qué distancia, no dónde | sí | sí | impacto o muerte, distancia |
| Tacview ACMI | sí, cuando un objeto de arma termina a menos de 30 m de una unidad (no su lanzador): su último lugar en el marco de la unidad (rumbo, cabeceo, alabeo), llegando por el camino que siguió | el `Parent` del arma | el nombre del arma, o el AmmoType de un Timeout | Outcome de Timeout, caídas de `Health`, `Destroyed`; sin arma, una muerte o daño sin punto |
| Telemetría de IL-2 (Watcher) | sí: los eventos `hit` / `damage` llevan el punto en el marco del propio avión del jugador (tomado como x adelante, y arriba, z derecha) | no | no | la fuerza |
| Dota 2 | no: el registro de combate no tiene lugar sobre un héroe | la unidad atacante | la habilidad o el objeto (ninguno: un ataque) | daño, la muerte del héroe |
| Battlefield 6 (GameCapture) | no: la captura lee el registro de bajas (bajas, muertes, indicador de tiro en la cabeza), no impactos | | | |
| Fuentes en directo de DCS y otras de Watcher | no hay eventos de impacto más allá de lo que contienen sus grabaciones de Tacview | | | |

Cuando ningún impacto de la unidad tiene punto, la figura no muestra marcas y el desglose **Quién la alcanzó** se abre solo: por tirador, arma o vehículo del tirador, cada uno con sus impactos, daño y bajas, y la distancia mediana y la mayor.

## Limitar a una zona {#restrict-to-an-area}

La sección **Área** limita el análisis a los impactos que ocurrieron en un lugar del mapa.

1. Pulsa **Dibujar rectángulo** o **Dibujar polígono**, y dibuja sobre el suelo 3D o sobre el mapa táctico.
2. Elige **Víctima dentro** (cuenta un impacto cuando la unidad alcanzada estaba en la zona) o **Tirador dentro** (cuando estaba quien disparó).
3. Pulsa **Usarlas como filtro**. Las fichas muestran «{n} de {total} impactos en la zona».
4. **Restablecer zona** quita todas las zonas.

Cada zona es un [volumen](volumes.md), así que las mismas formas también filtran el mapa de calor y la repetición. Una zona puede incluir o excluir (una zona que excluye deja fuera sus impactos, y se muestra como «{n} de {total} impactos fuera de la zona»). Cada zona aparece como una ficha con cuántos impactos de la unidad había dentro; la × de una ficha la quita. Los recuentos, la figura, el desglose y las listas de filtro siguen todos ese cambio.

Los lugares de un impacto: la fila de la que procede guarda el de una de las partes (la de la víctima para un daño o un golpe, la del tirador para un disparo); el de la otra es la muestra propia de esa unidad más cercana en el tiempo (a menos de 5 s). Un impacto cuyo lugar no se conoce se deja fuera mientras una zona filtra, y el panel dice cuántos son («Excluidos, sin lugar conocido»).

## Para desarrolladores {#for-developers}

Cualquier conversor puede añadir impactos: una fila de la víctima (`hit`, `impact`, `hurt`, `wounded`) con `hitBone` (un hueso del esqueleto, una selección de Arma, una zona de impacto de Reforger, asignada a cabeza, pecho, abdomen, brazos y piernas) o `hitLocalX/Y/Z` (metros, x adelante, y arriba, z derecha), con `other` el tirador y `damage`.
