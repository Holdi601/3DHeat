---
title: "Calor per equips"
parent: "Modes de calor"
nav_order: 6
lang: "ca"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: false
---

# Calor per equips

La calor per equips mostra on era cada equip, cadascun amb el seu color. On els equips es solapen, els colors es barregen.

**Calor per equips** (tecla 3) és el camp de densitat de [Calor](heat.md) amb cada [grup](glossary.md) amb el seu propi to. On els grups es solapen, els seus tons es barregen; una disputa igualada surt neutra. L'opacitat encara porta la densitat exactament com en els altres modes, així que la imatge respon *quant* i *de qui* alhora. Necessita una columna de grup.

![Calor per equips: cada bàndol amb el seu color; on es solapen, els colors es barregen](../assets/img/en/heat-teams.webp)

No és la [superposició de figures](box-replay.md): aquella dibuixa una figura per persona; això és un camp de calor acolorit per la mateixa columna.

## Com s'usa {#how-to-use-it}

1. Prem `3` (o tria **Calor per equips** a la barra de modes).
2. Obre **Colors de la calor**. Les mostres mostren el color de cada grup; posa el ratolí sobre una mostra per veure el nom de l'equip.
3. Si tot es veu gris, apuja **Separació de colors**.
4. Desmarca un grup a la [Llista d'equips](teams-list.md) per treure'l; els altres colors es queden on eren.

## Controls {#controls}

A la secció **Colors de la calor**:

| Control | Per defecte | Significat |
|---|---|---|
| Mostres | | El color de cada grup, per als primers 12 grups, i després *+N més*. Posa el ratolí a sobre per veure el nom del grup i el color. |
| **Separació de colors** | 1,4 | Quant s'empeny una barreja lluny del neutre, 0-4. 0 ho fa tot gris; 1 és la mitjana real; a partir d'uns 2 les barreges més brillants surten del rang visualitzable i es retallen per canal, cosa que canvia el seu to. |
| **Rampa d'opacitat (el color ve del grup)** | la rampa de calor per defecte | Aquí només s'usa l'**alfa** de la rampa: transparent on no hi ha res, opac a dalt. Els seus colors s'ignoren. |

Tots els altres controls de calor -forma, saturació, resposta, calor mínima, profunditat, retallada- funcionen com a [Calor](heat.md).

La [Llista d'equips](teams-list.md) mostra el color de calor per equips de cada grup com la seva mostra en aquest mode. Amagar un grup deixa el color de cada altre grup on era: els tons surten del nombre total de grups, no del que està activat, així que dues imatges es mantenen comparables.

## La paleta {#the-palette}

De [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Els colors viuen al pla de colors **Oklab** a una lluminositat fixa (0,7) i una croma fixa (0,115), així que cada grup és igual de brillant i un grup vermell no es llegeix com més calent que un de blau.
- Amb *n* grups, el cercle de tons es divideix en *n* parts iguals, i el grup *i* pren el **centre** de la seva part, `(i + 0,5) / n` d'una volta. Dos grups qualssevol estan tan lluny com permet el nombre, i els oposats segueixen sent oposats amb qualsevol nombre.
- S'usen com a màxim **16** tons diferents. Amb més grups, els ids es col·loquen per divisions repetides (ids amb els bits invertits: 0, ½, ¼, ¾, ⅛, …) perquè els ids veïns no comparteixin to; els grups a partir del 16 necessàriament comparteixen.
- Un grup l'etiqueta del qual vol dir «cap grup» -`0`, buit, `none`, `unknown`, `null` o `-1`, sense distingir majúscules- es dibuixa **gris neutre** en lloc de prendre una porció del cercle. Només la primera etiqueta així de la llista de grups es tracta d'aquesta manera.

La separació per defecte és 1,4 i no 1, perquè amb 1 una barreja de cinc tons igualment repartits *és* gris: correcte i il·legible. Una mica per sobre de 1 manté honestos els empats i fa visible una divisió 60/40.

## Com funciona {#how-it-works}

L'objectiu de calor té quatre canals en aquest mode. Cada sprite suma la seva densitat *v* al primer canal i *v* × les coordenades Oklab *a* i *b* del grup al segon i al tercer. En el moment de compondre, la barreja del píxel és la mitjana ponderada per densitat: *a* = G / R, *b* = B / R, escalada per la separació de colors i convertida a sRGB a la lluminositat de la paleta. Dividir per la densitat acumulada fa que el to no depengui de quantes dades hi ha, i per això tots els controls de densitat continuen actuant només sobre l'opacitat.

L'objectiu de quatre canals costa quatre vegades la memòria de la GPU de l'objectiu de calor d'un sol canal a la mateixa resolució.
