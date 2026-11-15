---
title: "Calor"
parent: "Modes de calor"
nav_order: 1
lang: "ca"
source: "heat.md"
source_hash: "0d84cc318ef8"
translated: true
outdated: false
---

# Calor

La calor pinta els llocs on han passat moltes coses: vermell on ha passat una mica, blanc candent on ha passat molt. Respon a la pregunta «on passa això, i quant».

**Calor** (tecla 1) és el mode per defecte. Cada [fila](glossary.md) visible aporta un [sprite](glossary.md) rodó orientat cap a la càmera; els sprites que se solapen se sumen en un buffer de coma flotant; la suma es transforma amb una rampa de colors -per defecte transparent → vermell → groc → blanc- i es dibuixa sobre l'escena.

![Calor en un nivell 3D: punts calents dins i a sobre dels edificis](../assets/img/en/shooter-heat.webp)

La imatge mostra la calor d'una ronda de tiroteig en un nivell amb edificis: els punts calents són a les sales i a les escales, no només a terra.

## Com s'usa {#how-to-use-it}

1. Carrega dades i prem `1` (o tria **Calor** a la barra de modes).
2. Si tot és blanc o en blanc, prem **Exposició automàtica a partir del camp** a la secció **Forma de la calor**.
3. Canvia **Radi dels sprites** fins que els punts veïns es fonguin en bandes: més petit mostra punts individuals, més gran mostra àrees.
4. Obre **Colors de la calor** per canviar els colors, o **Profunditat** perquè els turons i les parets amaguin la calor que hi ha darrere.

![Les seccions Forma de la calor i Colors de la calor de la barra lateral, totes dues obertes](../assets/img/en/heat-panel.webp)

Els mateixos panells donen forma a [Diferència](difference.md), [Calor per equips](team-heat.md) i [Calor de línia](line-heat.md); es diferencien en el que s'afegeix (amb signe, acolorit, o al llarg de línies), no en com.

## Els panells i els seus valors per defecte {#the-panels-and-their-defaults}

Cada control de sota correspon a un paràmetre del shader, així que canviar-lo no costa res més que tornar a dibuixar. Els lliscadors tenen una caixa escrita al costat i un mànec d'arrossegar (la petita agafadora de la dreta: arrossega amunt o avall, com més lluny més ràpid, Majúscules per a ajust fi); quan la pista d'un lliscador acaba abans d'un límit real, el mànec pot passar-lo fins al *sostre de l'ajust* indicat aquí. Els valors marcats com *en carregar* es recalculen per a cada conjunt de dades nou.

### Forma de la calor (oberta) {#heat-shape-open}

| Control | Per defecte | Interval (sostre de l'ajust) | Detalls |
|---|---|---|---|
| **Radi dels sprites** | 6 m; en carregar, extensió / 120 | 0,05-2000 m, logarítmic (50.000) | [Forma de l'sprite](sprite-shape.md#sprite-radius) |
| **Intensitat al centre** | 1 | 0-10 (1000) | [Forma de l'sprite](sprite-shape.md#centre-and-edge-intensity) |
| **Intensitat a la vora** | 0 | -2-10 (1000) | [Forma de l'sprite](sprite-shape.md#centre-and-edge-intensity) |
| **Forma de la rampa** | *Atenuació* | *Atenuació* / *Corba* | [Forma de l'sprite](sprite-shape.md#ramp-shape-falloff-or-curve) |
| **Atenuació** (només en Atenuació) | 1,6 | 0,1-8 (64) | [Forma de l'sprite](sprite-shape.md#falloff) |
| **Rampa suau** (només en Atenuació) | activada | | [Forma de l'sprite](sprite-shape.md#falloff) |
| Editor de corbes (només en Corba) | predefinit *Suau* | | [Forma de l'sprite](sprite-shape.md#the-curve-editor) |
| **Punt de saturació** | 24; en carregar, una estimació, després mesurat | 0,1-4000, logarítmic (10.000.000) | [Color i exposició](colour-and-exposure.md#saturation-point) |
| **Calor mínima** | desactivada (0) | 0-100% | [Color i exposició](colour-and-exposure.md#minimum-heat) |
| **Resposta a la densitat** | *Saturant* | *Saturant* / *Lineal* / *Log* | [Color i exposició](colour-and-exposure.md#density-response) |
| **Exposició automàtica a partir del camp** | | botó | [Color i exposició](colour-and-exposure.md#auto-exposure) |
| **Segueix la vista** | activada | | Torna a mesurar l'exposició cada vegada que la càmera queda quieta, així que una regió on entres fa servir tota la rampa de colors. Els canvis petits s'ignoren i l'escala es desplaça suaument. Desmarca-ho, o arrossega **Punt de saturació**, per bloquejar l'escala i comparar llocs en una mateixa escala. [Color i exposició](colour-and-exposure.md#follow-the-view) |
| **Mateixa densitat a qualsevol zoom** | activada | | Un color vol dir el mateix nombre de files per àrea de terreny, per a prop que estiguis. Un sprite que els límits de píxels augmenten (de lluny) o redueixen (de prop) manté la calor que sumaria la seva mida real, així que una imatge exposada de lluny no s'esvaeix quan hi entres volant. Desactivat, un sprite limitat suma tot el seu pes amb la seva mida limitada. [Forma de l'sprite](sprite-shape.md#pixel-clamps) |
| **Aplana sobre el pla del terra** | desactivat | | [Forma de l'sprite](sprite-shape.md#flatten-onto-ground-plane) |

### Colors de la calor (tancada) {#heat-colours-closed}

| Control | Per defecte | Detalls |
|---|---|---|
| Mostres dels grups i **Separació de colors** (només Calor per equips) | 1,4 | [Calor per equips](team-heat.md) |
| Editor de la **Rampa de calor** (*Positiva (equips que sumen)* en Diferència, *Rampa d'opacitat* en Calor per equips) | transparent → vermell → groc → blanc | [Color i exposició](colour-and-exposure.md#the-ramp-editor) |
| **Restableix a transparent → vermell → groc → blanc** | | |
| Rampa **Negativa (equips que resten)** (només Diferència) | transparent → verd → blau → lila | [Diferència](difference.md#colours) |

### Límits de radi en píxels dels sprites (tancada) {#sprite-pixel-clamps-closed}

| Control | Per defecte | Interval (sostre de l'ajust) | Detalls |
|---|---|---|---|
| **Radi mínim en píxels** | 1 px | 0-16 (512) | [Forma de l'sprite](sprite-shape.md#pixel-clamps) |
| **Radi màxim en píxels** | 96 px | 2-1024, logarítmic (8192) | [Forma de l'sprite](sprite-shape.md#pixel-clamps) |

### Profunditat (oberta) {#depth-open}

| Control | Per defecte | Detalls |
|---|---|---|
| **Amaga darrere del terreny** | activada | [Profunditat i retallada](depth-and-culling.md#hide-behind-terrain) |
| **Amagat darrere de la geometria** | 0,8 (*80% més fosc*) | [Profunditat i retallada](depth-and-culling.md#hidden-behind-geometry) |

### Retallada per distància (tancada) {#distance-culling-closed}

| Control | Per defecte | Interval (sostre de l'ajust) | Detalls |
|---|---|---|---|
| **Proper** | desactivat (0) | 0,5-5000 m, logarítmic, el fons de la pista = desactivat (200.000) | [Profunditat i retallada](depth-and-culling.md#distance-culling) |
| **Llunyà** | desactivat (0) | 1-200.000 m, logarítmic, el fons = desactivat (10.000.000) | [Profunditat i retallada](depth-and-culling.md#distance-culling) |
| **Talla en un pla** | activada | | [Profunditat i retallada](depth-and-culling.md#distance-culling) |
| **Talla també el nivell** | activada | | [Profunditat i retallada](depth-and-culling.md#distance-culling) |

Tecles: `[` i `]` empenyen el límit llunyà cap a dins i cap a fora, `\` l'activa o desactiva ([Profunditat i retallada](depth-and-culling.md#keyboard)).

### Direcció i Valor {#direction-and-value}

Hi ha dues seccions més sota Forma de la calor. **Direcció** dibuixa cada fila com una falca i afegeix fletxes: vegeu [Calor direccional](directional-heat.md). **Valor** pondera la calor segons el que cadascuna fila va costar o va guanyar: vegeu [Ponderació de valors](value-weighting.md).

## Què es desa {#what-is-saved}

Els valors de calor de dalt no es guarden entre sessions: en tornar a carregar la pàgina es restableixen els valors per defecte. Dues coses es guarden al navegador: l'última velocitat de reproducció (`heat3d.speed`, vegeu [Línia de temps](timeline.md)) i la configuració de les figures llunyanes de la [superposició de figures](box-replay.md) (estil de símbol, mida, marques d'impacte, etc.). També ho són l'idioma, els [eixos del món invertits](camera.md#invert-world-axis), els noms de cotxe recordats de la pestanya de curses i la [biblioteca de nivells](level-library.md). La llista completa és a [Configuració desada](ref-settings-storage.md).
