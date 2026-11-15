---
title: "Entitats"
parent: "Filtres i eines"
nav_order: 3
lang: "ca"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entitats

Les **Entitats** et permeten triar un jugador (o alguns) per veure només on ha anat aquest jugador. Usa-les per seguir el teu propi moviment o un adversari.

El panell es mostra quan el conjunt de dades té una columna de persona. La seva capçalera mostra el nombre de persones, o `selected of total` mentre hi ha una selecció activa (una *persona* és un jugador o IA, vegeu el [glossari](glossary.md)).

## Triar un jugador {#pick-a-player}

1. Obre **Entitats** a la barra lateral.
2. Escriu part del nom a la caixa de cerca.
3. Marca el jugador. La capçalera diu, per exemple, `2 of 10`, i tota la resta desapareix.
4. **Esborra** torna a mostrar tothom.

![Entitats amb dos de deu jugadors seleccionats](../assets/img/en/entities-selected.webp)

La selecció mostra només les persones seleccionades, als modes de calor (punts, línies, diferència, calor per equips) i també a les traces, figures i rastres de la [repetició de figures](box-replay.md). Deixa-la buida per mostrar tothom; seleccionar tothom és el mateix que no seleccionar ningú.

## El panell {#the-panel}

| Part | Significat |
|---|---|
| Caixa de cerca | *Search N entities...*: filtra la llista per una subcadena del nom que no distingeix majúscules. Mostra `N matches`, o `N matches, showing the first 200`; *Nothing matches "..."* quan la cerca no troba res. |
| Llista | Fins a 200 persones (les primeres 200 que coincideixen), cadascuna amb una casella, una mostra del color de la persona, i el nom (*(unnamed)* per a un nom buit). |
| Indicació de joc | Quan el temps està en marxa, la llista conté les *en joc al capçal de reproducció*; una cerca les troba totes. |
| **AI (n)** | Un grup plegable amb les unitats controlades per IA, a part dels jugadors. |
| **Afegeix els mostrats** | Afegeix a la selecció tothom que hi ha ara a la llista. |
| **Només els mostrats** | Fa que la selecció siguin exactament les que hi ha a la llista. |
| **Esborra** | Buida la selecció. |

## Límits {#limits}

A la calor la selecció és un filtre i ocupa un dels quatre [espais de filtre](filters.md#rules). Quan els altres filtres ja n'usen els quatre, el panell diu *No s'aplica a la calor: tots els espais de filtre estan ocupats. La repetició de figures encara mostra només aquestes entitats. Esborra un filtre a Filtres per alliberar-ne un.* Esborra un filtre per alliberar un espai.

La selecció s'esborra a cada conjunt de dades nou. La pestanya Partida fixa la mateixa selecció quan es concentra en un jugador.

## Per als desenvolupadors {#for-developers}

La selecció es guarda com a filtre de *persones* ([Filtres](filters.md#for-developers)). La màscara del shader conté 65.536 ids de persona; una persona més enllà d'això no es dibuixa a la calor mentre hi ha una selecció activa.
