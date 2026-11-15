---
title: "Mostreig i pressupostos"
parent: "Detalls interns del renderitzat"
nav_order: 3
lang: "ca"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Mostreig i pressupostos

Quan hi ha massa punts per dibuixar en un sol fotograma, el visor en dibuixa una mostra uniforme i fa que cada punt compti més, perquè la imatge continuï sent correcta. Un controlador ajusta quants en dibuixa perquè el visor mantingui la seva taxa de fotogrames.

## Controls del panell de rendiment {#performance-panel-controls}

| Control | Per defecte | Rang (roda) |
|---|---|---|
| **Dibuixa totes les files a cada fotograma** | activat | |
| **Pressupost adaptatiu** | activat | |
| **FPS objectiu** | 60 | 20-240 (1000) |
| **Sprites / fotograma inicials** (adaptatiu) o **Sprites / fotograma** | 4,00M | 65.536-268.435.456, logarítmic (268.435.456) |
| **Resolució de la calor** | 100% | 25-100%, multiplicat per l'escala de l'etapa dos adaptativa |
| **Refinament progressiu** | activat | Desactivat: cada fotograma és una estimació nova d'un sol fotograma (útil per veure la mostra en brut). |

Mira també [Panell de rendiment i superposició d'estadístiques](performance-and-stats.md).

## Per a desenvolupadors {#for-developers}

### Files candidates {#candidate-rows}

Les files s'emmagatzemen en ordre ascendent de temps. La finestra de la línia de temps [*lo*, *hi*] es converteix en un interval de files amb dues cerques binàries sobre la columna de temps ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); sense columna de temps, cada fila és candidata. Són les **Files a la finestra** de la superposició d'estadístiques. Les proves per fila - filtres, grups, divisió, retall, tall, temps de vida - es fan després, al shader; una fila que falla costa una invocació de vèrtex i cap fragment.

### El pla de mostreig {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) divideix l'interval candidat en **blocs de 4.096 files consecutives** i tria quantes dibuixar a partir del pressupost de sprites del fotograma:

- Si el pressupost cobreix tots els blocs, es dibuixen tots - el fotograma és exacte.
- Si no, els blocs es prenen a un pas uniforme a través de l'interval, desplaçats per una vibració que avança segons la raó àuria a cada fotograma, de manera que els fotogrames successius cobreixen blocs diferents i la unió s'omple uniformement. És una mostra **estratificada**: cada part de l'interval de temps està representada a cada fotograma.

La calor de cada fila dibuixada es multiplica per **candidates / enviades**, de manera que la calor esperada d'un fotograma és exacta a qualsevol pressupost; només el soroll depèn del pressupost. Les files viuen en trossos de 8.388.608 (mira [Residència de la memòria de la GPU](gpu-memory.md)); un bloc es divideix quan creua un tros, i cada tros rep la llista d'inicis de bloc que ha de dibuixar.

Un pla pot portar com a màxim 65.536 blocs - 268.435.456 sprites - perquè els dos backends tenen un buffer fix de 65.536 posicions d'inici de bloc. Una petició de més queda limitada aquí, i la diferència es mostra honestament com més fotogrames per convergir.

### Dibuixa totes les files a cada fotograma {#draw-every-row-each-frame}

**Rendiment → Dibuixa totes les files a cada fotograma** (per defecte **activat**): el pressupost es converteix en un mínim en lloc d'un màxim, i un fotograma que comença una estimació nova dibuixa cada fila de la qual és responsable (fins al límit de 268M).

La raó: un moviment de càmera descarta l'acumulació, de manera que un fotograma en moviment és una sola estimació el soroll de la qual el fixa quanta part de les dades ha dibuixat - amb un quart dibuixat, en veus un quart en punts ponderats i brillants, que és el que fa que una vista en moviment centelleegi. Dibuixar-ho tot fa que cada fotograma sigui la imatge acabada. El cost és que el temps de fotograma ara segueix la mida de les dades de la finestra; les palanques són una finestra de temps més estreta, els filtres, o un retall per distància, que redueixen els candidats en lloc de mostrejar-los més dispersament.

Desactiva-ho en maquinari que no es pot permetre el camp sencer de cop: *Sprites / fotograma* és aleshores un límit real, i la vista convergeix en uns quants fotogrames quiets.

Quant costa un pla complet, mesurat en una GPU d'escriptori d'alta gamma amb un llenç de 4K i un nivell gran, amb sprites de radi 1 m (un o dos píxels): aproximadament 100M sprites per fotograma a 30 fps, 200M a 15 fps, i el màxim de 268M a uns 12 fps. Amb sprites tan petits, l'etapa de vèrtexs és tot el cost, i la resolució de la calor no canvia res; amb sprites grans el cost és l'ompliment: 8M sprites de radi 100 m van trigar 2,5 s per fotograma a resolució de calor completa i 170 ms al 25%. **Dibuixa totes les files a cada fotograma** per tant comença a 67M i puja un quart per fotograma mentre els fotogrames triguen menys de 150 ms, i es redueix a la meitat mentre triguen més de 400 ms, de manera que una vista pesada no pot fer que un fotograma superi el que permet el watchdog de la GPU.

### El pressupost adaptatiu {#the-adaptive-budget}

**Rendiment → Pressupost adaptatiu** (per defecte activat) ajusta el pressupost de sprites per mantenir els **FPS objectiu** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Està inactiu a la repetició de caixes i durant les renderitzacions de vídeo.

L'entrada és el temps de fotograma, suavitzat (90% l'anterior + 10% el nou, amb els fotogrames individuals limitats a 2 s), contra un objectiu de 1000 / max(15, FPS objectiu) ms.

**Etapa u - sprites.** A cada fotograma el pressupost es multiplica per `1 + (objectiu / fotograma - 1) × guany`, amb un guany de 0,35 quan va massa lent i 0,08 quan hi ha marge, limitat a un factor de 0,5-1,25 per fotograma i a 65.536-268.435.456 sprites.

**Etapa dos - resolució.** Només quan el pressupost ja és al seu mínim i els fotogrames encara són més d'un 10% massa lents, la resolució del buffer de calor baixa, un 8% per fotograma, fins al 25% del llenç; es recupera un 4% per fotograma mentre hi ha un 30% de marge. El cost de l'ompliment baixa amb el quadrat de la resolució, cosa gairebé invisible sota una rampa suau. (Mesurat amb renderització per programari amb 10M de files i sprites massa grans: 141 ms → 17 ms per fotograma.) L'escala s'arrodoneix a setzens; el *Res. calor* de la superposició la mostra.

**Rendició.** Un fotograma lent es veu igual si el van causar els sprites o un nivell pesat - no hi ha cap temporització per passada. Si el pressupost queda al seu mínim i els fotogrames es mantenen per sota del 70% de l'objectiu durant 30 fotogrames, els sprites no eren el cost: el controlador passa a **pujada**, multiplicant el pressupost per 1,5 cada 14 fotogrames i restaurant la resolució, mentre el temps de fotograma es mantingui dins de 1,5 vegades el que era al mínim. Una pujada que empitjora les coses més que això es retalla al 60% i reprèn el control normal; arribar a l'objectiu acaba la pujada.

Amb el pressupost adaptatiu desactivat, el pressupost és simplement **Sprites / fotograma**.

Amb *Dibuixa totes les files a cada fotograma* activat, el pressupost adaptatiu encara s'executa, però la regla exacta puja el pressupost per cobrir totes les files candidates, de manera que en la pràctica només controla l'etapa de resolució i els fotogrames que no comencen una estimació nova.
