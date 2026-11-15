---
title: "Modes de calor"
nav_order: 4
has_children: true
lang: "ca"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# Modes de calor

Cada punt afegeix una mica de brillantor, les brillantors s'acumulen, i l'acumulat es pinta amb colors. Els modes són cinc maneres de pintar-ho, i cadascun respon a una pregunta.

La barra de modes, a la part superior de la barra lateral de la pestanya Mapa de calor, tria com es dibuixa el [conjunt de dades](glossary.md). Les tecles 1-4 trien Calor, Diferència, Calor per equips i Línies. Figures superposades no té tecla.

![La barra de modes amb Calor, Diferència, Calor per equips, Figures superposades i Línies](../assets/img/en/heat-modes-bar.webp)

| Mode | Pregunta a la qual respon |
|---|---|
| **Calor** | On ha passat, i quant? |
| **Diferència** | Quin bàndol n'ha fet més? |
| **Calor per equips** | De qui era? |
| **Línies** | Per on anava la gent? |
| **Figures superposades** | Qui era on, i quan? |

![Les mateixes dades en quatre modes: Calor, Diferència, Calor per equips i Línies](../assets/img/en/heat-modes-grid.webp)

| Mode (etiqueta de la barra) | Tecla | Què dibuixa | Necessita |
|---|---|---|---|
| **Calor** | 1 | Densitat additiva: cada fila visible afegeix un sprite radial orientat cap a la càmera. [Calor](heat.md) | un conjunt de dades |
| **Diferència** | 2 | Densitat amb signe: una població suma i una altra resta. [Diferència](difference.md) | dos bàndols: com a mínim dos grups, o una divisió sobre una columna retinguda |
| **Calor per equips** | 3 | Densitat acolorida per grup: un to per grup, barrejats on els grups es solapen. [Calor per equips](team-heat.md) | una columna de grup |
| **Figures superposades** | - | Una figura (o una caixa) per persona, que es mou al llarg de la línia de temps: la repetició. [Figures superposades](box-replay.md), [Repetició de partida](match-replay.md) | una columna de persona |
| **Línies** | 4 | Calor de línia: una línia des de cada mostra d'una persona fins a la següent, amb la calor que s'esvaeix a banda i banda. [Calor de línia](line-heat.md) | una columna de persona i una de temps |

Un mode que les dades no poden admetre apareix en gris, i el seu text en passar-hi el ratolí en dona la raó, per exemple *No disponible - el mode Diferència necessita dos grups o una columna retinguda per dividir; aquestes dades tenen un sol grup.* Quan un conjunt de dades nou no pot admetre el mode actual, la vista torna a **Calor**.

Les tecles 1-4 es comproven amb les dades de la mateixa manera: una tecla d'un mode en gris no fa res.

## Quins panells mostra cada mode {#which-panels-each-mode-shows}

| Panell | Calor | Diferència | Calor per equips | Figures superposades | Línies |
|---|---|---|---|---|---|
| Rutes ([calor de línia](line-heat.md)) | | | | | sí |
| Forma de la calor (amb **Segueix la vista** i **Mateixa densitat a qualsevol zoom**), Colors de la calor, Radi mínim i màxim en píxels, Profunditat, Retallada per distància | sí | sí | sí | | sí |
| Direcció ([calor direccional](directional-heat.md)), Valor ([ponderació de valors](value-weighting.md)) | sí | sí | sí | | sí |
| Visor d'equips ([figures superposades](box-replay.md)) | | | | sí | |
| Divisió de diferència ([diferència](difference.md)) | | sí | | | |
| [Equips](teams-list.md), [Entitats](entities.md), [Filtres](filters.md), Fons / nivell, [Llesca](slice.md), [Mesurar](measure.md), Recorregut de càmera i renderització, Rendiment, Càmera i escena | sí | sí | sí | sí | sí |

## Què comparteixen tots els modes de calor {#what-every-heat-mode-shares}

Els quatre modes de calor (tots menys les figures superposades) són la mateixa màquina amb entrades diferents ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Quines files.** La finestra de la [línia de temps](timeline.md) tria un interval continu de files ordenades pel temps; els [filtres](filters.md), la visibilitat dels grups, la divisió de diferència, la [retallada per distància](depth-and-culling.md#distance-culling) i la [llesca](slice.md) decideixen, per fila, al vertex shader, si cadascuna contribueix i amb quina força.
2. **Splatting.** Cada fila que contribueix es dibuixa com un sprite (o, en mode Línies, un segment) dins d'un **objectiu de calor** de coma flotant, sumant-hi el seu valor de la rampa. Es dibuixa una mostra estratificada de les files quan n'hi ha més de les que un fotograma pot permetre, ponderada per compensar. Vegeu [Mostreig i pressupostos](sampling-and-budgets.md).
3. **Acumulació.** Mentre res no canvia, els fotogrames es fusionen fins que cada fila ha contribuït exactament una vegada. Vegeu [Acumulació](accumulation.md).
4. **Composició.** El valor acumulat de cada píxel es divideix pel **punt de saturació**, es modela amb la **resposta a la densitat**, s'eleva amb la **calor mínima**, i es busca a la **rampa de colors**, l'alfa de la qual el barreja amb l'escena. Vegeu [Color i exposició](colour-and-exposure.md).

Tot el del pas 4 s'aplica en el moment de compondre, així que arrossegar aquests controls mai reinicia l'acumulació; el que toca els passos 1-2 sí.

## Pàgines d'aquesta secció {#pages-in-this-section}

- [Calor](heat.md) - el mode de calor simple, i la visió general dels seus panells
  - [Forma de l'sprite](sprite-shape.md) - radi, intensitats, atenuació, l'editor de corbes, límits de píxels, aplanament
  - [Color i exposició](colour-and-exposure.md) - editor de la rampa, punt de saturació, exposició automàtica, calor mínima, resposta a la densitat
  - [Profunditat i retallada](depth-and-culling.md) - oclusió pel nivell, amagar darrere del terreny, retallada per distància
- [Diferència](difference.md) - la divisió de diferència
- [Calor per equips](team-heat.md)
- [Calor de línia](line-heat.md) - rutes
- [Figures superposades](box-replay.md) - el mode de repetició (el fitxer encara es diu repetició de caixes)
- [Calor direccional](directional-heat.md)
- [Ponderació de valors](value-weighting.md)
