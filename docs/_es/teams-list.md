---
title: "Lista de equipos"
parent: "Filtros y herramientas"
nav_order: 2
lang: "es"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Lista de equipos

El panel **Equipos** le permite ocultar un equipo o ponerlo a un lado de una comparación. Úselo para mirar solo a Blue, o para preguntar «¿adónde va Blue que Red no va?».

Un *grupo* es un equipo o un bando, por ejemplo Blue y Red ([Grupos](sessions-persons-groups.md#group)). El panel se muestra cuando el conjunto de datos tiene una columna de grupo; el número de grupos aparece en su cabecera. En el modo Calor por equipo, la barra lateral tiene además una sección llamada **Visor de equipos** con sus propios ajustes; esta página trata la lista **Equipos**.

## Ocultar un equipo {#hide-a-team}

1. Abra **Equipos** en la barra lateral.
2. Desmarque la casilla (*Visible*) del equipo que quiere ocultar. La imagen se actualiza de inmediato.
3. Pulse **Mostrar todos** para devolver todos los equipos.

![La lista de equipos: Blue 5p, Red 5p, con Mostrar todos](../assets/img/en/teams-list.webp)

## Cada fila {#each-row}

| Parte | Significado |
|---|---|
| Casilla (*Visible*) | Muestra u oculta el grupo. |
| Muestra de color | El color del grupo: su color de [calor por equipo](team-heat.md) en el modo Calor por equipo, su color base en los demás modos. |
| Nombre | La etiqueta del grupo (la etiqueta completa al pasar el ratón). |
| **+** / **-** (modo Diferencia) | Pone el grupo en el lado positivo o negativo de la [diferencia](difference.md); pulse de nuevo el botón activo para dejarlo en ningún lado. |
| `Np` (otros modos) | El número de personas cuya primera fila está en este grupo. |

![Modo Diferencia: Blue en el lado +, Red en el lado -](../assets/img/en/teams-list-difference.webp)

## Botones {#buttons}

| Botón | Efecto |
|---|---|
| **Mostrar todos** | Vuelve a hacer visibles todos los grupos. |
| **Repartir por igual** (modo Diferencia) | La primera mitad de los grupos (redondeando hacia arriba) en +, el resto en -; el mismo reparto con el que empieza cada carga. |

## Qué hace ocultar un grupo {#what-hiding-a-group-does}

- En **Calor**, **Calor por equipo** y **Líneas**, las filas del grupo no aportan nada.
- En **Diferencia**, un grupo oculto no aporta nada esté en el lado que esté, también con un corte por otra columna (véase [Diferencia](difference.md#for-developers)).
- En la **superposición de figuras**, no se dibujan las personas cuya primera fila está en ese grupo.
- En **Calor por equipo**, los demás grupos conservan sus colores: los tonos se asignan según el número total de grupos, no según lo que está visible, así que dos imágenes siguen siendo comparables.

Cambiar la visibilidad reinicia la acumulación. En cada conjunto de datos nuevo, todos los grupos vuelven a ser visibles.

La pista del panel cambia según el modo: en Diferencia explica + y -; en Calor por equipo, que las muestras son los colores con que dibuja cada grupo.
