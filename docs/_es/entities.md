---
title: "Entidades"
parent: "Filtros y herramientas"
nav_order: 3
lang: "es"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entidades

Las **Entidades** le permiten elegir un jugador (o unos pocos) para ver solo adónde fue ese jugador. Úselo para seguir su propio movimiento o el de un rival.

El panel se muestra cuando el conjunto de datos tiene una columna de persona. Su cabecera muestra el número de personas, o `seleccionadas de total` mientras hay una selección activa (una *persona* es un jugador o una IA, véase el [glosario](glossary.md)).

## Elegir un jugador {#pick-a-player}

1. Abra **Entidades** en la barra lateral.
2. Escriba parte del nombre en el cuadro de búsqueda.
3. Marque el jugador. La cabecera dice, por ejemplo, `2 de 10`, y todo lo demás desaparece.
4. **Vaciar** vuelve a mostrar a todos.

![Entidades con dos de diez jugadores seleccionados](../assets/img/en/entities-selected.webp)

La selección muestra solo las personas seleccionadas, en los modos de calor (puntos, líneas, diferencia, calor por equipo) y también en las trayectorias, figuras y estelas de la [repetición de figuras](box-replay.md). Déjela vacía para mostrar a todos; seleccionar a todos es lo mismo que no seleccionar a nadie.

## El panel {#the-panel}

| Parte | Significado |
|---|---|
| Cuadro de búsqueda | *Buscar N entidades...*: filtra la lista por una subcadena del nombre, sin distinguir mayúsculas. Muestra `N coincidencias`, o `N coincidencias, mostrando las primeras 200`; *Ninguna coincidencia para «...»* cuando la búsqueda no encuentra nada. |
| Lista | Hasta 200 personas (las primeras 200 que coinciden), cada una con una casilla, una muestra del color de la persona y el nombre (*(sin nombre)* si está vacío). |
| Pista de en juego | Cuando el tiempo avanza, la lista contiene las personas *en juego en el cabezal de reproducción*; una búsqueda las encuentra todas. |
| **IA (n)** | Un grupo plegable con las unidades controladas por la IA, aparte de los jugadores. |
| **Añadir lo mostrado** | Añade a la selección a todos los que aparecen ahora en la lista. |
| **Solo lo mostrado** | Hace que la selección sea exactamente la de la lista. |
| **Vaciar** | Vacía la selección. |

## Límites {#limits}

En el calor, la selección es un filtro y usa una de las cuatro [ranuras de filtro](filters.md#rules). Cuando los demás filtros ya usan las cuatro, el panel dice *No se aplica al calor: todas las ranuras de filtro están ocupadas. La repetición de figuras sigue mostrando solo estas entidades. Quite un filtro en Filtros para liberar una.* Quite un filtro para liberar una ranura.

La selección se borra con cada conjunto de datos nuevo. La pestaña Partida fija la misma selección cuando se centra en un jugador.

## Para desarrolladores {#for-developers}

La selección se guarda como un filtro de *personas* ([Filtros](filters.md#for-developers)). La máscara del shader contiene 65.536 ids de persona; una persona por encima de ese número no se dibuja en el calor mientras hay una selección activa.
