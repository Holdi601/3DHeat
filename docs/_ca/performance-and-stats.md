---
title: "Panell de rendiment i estadístiques"
parent: "Detalls interns del renderitzat"
nav_order: 7
lang: "ca"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Panell de rendiment i capa d'estadístiques

El fotograma a dalt a la dreta de la vista mostra com de dur treballa el visor: quants fotogrames per segon, quants punts dibuixa, i si encara està refinant la imatge. El panell **Rendiment** et permet canviar qualitat d'imatge per velocitat.

## La capa d'estadístiques {#the-stats-overlay}

El fotograma a dalt a la dreta de la vista a les pestanyes Mapa de calor i Partida ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Llegeix l'indicador en directe del motor a cada fotograma d'animació.

![La capa d'estadístiques sobre l'escena de moltes partides, amb indicacions numerades: 1 Backend, 2 FPS, 3 Frame, 4 Rows in window, 5 Sprites / frame, 6 Budget, 7 Heat res, 8 Coverage](../assets/img/en/performance-stats-overlay.webp)

| Línia | Significat |
|---|---|
| **Backend** | *WebGPU* o *WebGL2*. Passa el ratolí per veure el motiu pel qual no s'ha usat WebGPU, quan no s'ha usat. Vegeu [Els dos backends](backends.md). |
| **FPS** | Fotogrames per segon, mitjana de com a mínim 0,4 s. |
| **Frame** | Temps de fotograma en ms, suavitzat (90 % l'anterior, 10 % el nou). És el temps entre fotogrames, no temps de GPU: no es mesura cap temporització de GPU per pas. |
| **Rows in window** | Files candidates: les files de la finestra de temps actual, abans del filtratge per fila al shader. |
| **Sprites / frame** | Sprites que va enviar el pla de l'últim fotograma (es manté al valor planificat en els fotogrames inactius, que no dibuixen res). |
| **Budget** | El pressupost de sprites amb què es va planificar aquest fotograma: el valor del controlador adaptatiu, pujat a tots els candidats quan es dibuixa cada fila. |
| **Heat res** | La resolució del buffer de calor com a part del canvas: el ajust *Resolució de la calor* multiplicat per l'escala adaptativa de la segona etapa. |
| **Coverage** | Fins on ha arribat l'acumulació progressiva a usar totes les files: un percentatge mentre convergeix (ambre), *exact* quan ha acabat. Un fotograma sorollós mai no es confon amb la imatge acabada. |
| **Cubes** | Caixes dibuixades a la [repetició de caixes](box-replay.md). |
| **Not resident** | Es mostra només quan les files no hi cabien al pressupost de la GPU: quantes. Vegeu [Permanència de memòria de la GPU](gpu-memory.md). |

## La visualització de velocitat {#the-speed-display}

A baix a la dreta de la vista, només en perspectiva: la velocitat de vol i el temps per travessar les dades a aquesta velocitat. Arrossega-la per canviar la velocitat. Vegeu [Càmera](camera.md#fly-speed).

## Si el visor va lent {#if-the-viewer-is-slow}

Mira la capa d'estadístiques i després:

1. **Rows in window molt més gran que Sprites / frame, Coverage per sota del 100 %**: el fotograma no pot dibuixar-ho tot; convergeix en diversos fotogrames quan està quiet. Estreny la finestra, filtra o retalla per reduir els candidats; o accepta el mostreig.
2. **Sprites / frame igual a Rows in window, el fotograma encara lent**: el cost és per sprite a la pantalla: baixa el *Radi màxim de píxels* ([Forma del sprite](sprite-shape.md#pixel-clamps)) o la *Resolució de la calor*.
3. **Lent amb poques files**: probablement el nivell: molts comptes d'estructures amb vores activades, triangles de terreny, profunditat de camp. Vegeu [Aspecte del nivell](level-appearance.md).
4. **Tot lent, i un bàner vermell**: renderitzat per programari ([Detecció de renderitzat per programari](software-rendering.md)).

## El panell de rendiment {#the-performance-panel}

| Control | Per defecte | Efecte |
|---|---|---|
| Suggeriment | | Cada fotograma fa splat d'un subconjunt aleatori estratificat de les files visibles, amb un pes escalat per compensar, de manera que la calor esperada és exacta a qualsevol pressupost; mantenir la vista quieta segueix fusionant fotogrames fins que cada fila hi ha contribuït. |
| **Dibuixa totes les files a cada fotograma** | activat | Cada fotograma que comença una estimació nova dibuixa totes les files candidates (fins a uns 268 M); el pressupost de sota esdevé un mínim. [Mostreig i pressupostos](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Pressupost adaptatiu** | activat | Ajusta els sprites per fotograma, després la resolució de calor, per mantenir la taxa de fotogrames objectiu; i deixa de retallar quan retallar no ajuda. [Mostreig i pressupostos](sampling-and-budgets.md#the-adaptive-budget) |
| **FPS objectiu** | 60 | 20-240 (1000 amb la maneta). Els valors per sota de 15 es tracten com a 15. |
| **Sprites / fotograma inicials** / **Sprites / fotograma** | 4,00 M | 65.536-268.435.456, logarítmic. S'anomena *Inicials* mentre l'adaptatiu és actiu, perquè el controlador el mou. |
| **Resolució de la calor** | 100 % | 25-100 %. El cost de fragments escala amb el quadrat: 50 % redueix a una quarta part la feina de barreja, i el camp de calor és prou suau perquè gairebé no es noti. |
| **Refinament progressiu** | activat | Acumula entre fotogrames mentre la vista està quieta. Desactivat mostra l'estimació d'un sol fotograma a cada fotograma. [Acumulació](accumulation.md) |
| **Pressupostos de recursos** | detectats | Pressupostos de RAM, de GPU i del fil d'anàlisi. [Memòria i pressupostos](memory-and-budgets.md#resource-budgets) |

Cap d'aquests no es desa; en recarregar es restauren els valors per defecte.
