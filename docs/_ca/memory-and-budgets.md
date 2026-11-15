---
title: "Memòria i pressupostos"
parent: "Carregar dades"
nav_order: 6
lang: "ca"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Memòria, pressupostos i comprovació d'encaix

El teu ordinador té memòria limitada. El 3DHeat suma el que necessiten els teus fitxers i t'avisa abans de **Carrega** si hi caben.

![L'Estimació de memòria dient que no hi cap, amb Carrega cada [N] files ja omplert i el botó Carrega dient Massa gran - redueix o decima](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Massa gran per a aquest ordinador? 3DHeat suggereix carregar cada N-èsima fila.*

Una pestanya del navegador que es queda sense memòria a mig càrrega es penja i perd minuts de feina, i una GPU a la qual se li demana més del que té perd el seu context o es fa molt lenta. Per això, abans que comenci una càrrega, el panell Origen diu quanta memòria necessita, la compara amb els pressupostos detectats per a aquesta màquina, i es nega - amb una sortida - quan no hi cabrà. El model és a [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## L'estimació de memòria {#the-memory-estimate}

Es mostra a sobre del botó **Carrega** quan les files ja s'han comptat.

| Línia | Significat |
|---|---|
| **Estimació de memòria** - *hi cap* / *just* / *no hi cap* | El veredicte, verd, ambre o vermell. |
| `N files · B B/fila` | Les files que es carregaran (després del pas) i els bytes constants per fila. |
| `RAM X resident, Y pic durant la càrrega` | Memòria que es manté un cop carregat, i el màxim durant la càrrega. |
| `GPU Z · càrrega estimada T` | Memòria de la GPU per a les files, i una durada estimada a 1,2 milions de files per segon. |
| Nom de la GPU | El nom del renderitzador, quan el controlador l'informa. |
| Missatges | Per què no hi cap, o que és just, i què fer. |
| **Carrega cada [N] files** | El pas de decimació (vegeu a sota). |
| `Pressupost: X RAM, Y GPU. Ajusta-ho a Rendiment → Pressupostos de recursos.` | Els pressupostos que va usar la comprovació. |

### Bytes per fila {#bytes-per-row}

| Columna | Constant (RAM) | Notes |
|---|---|---|
| Posició | 12 | Tres floats de 32 bits, sempre (un eix pla encara és una matriu) |
| Temps | 4 | Quan està assignat |
| Vida útil | 4 | Quan el temps i la persona estan assignats |
| Persona | 4 | Quan està assignada |
| Grup | 2 | Quan està assignat |
| Sessió | 4 | Quan està assignada |
| `Fitxer d'origen` | 4 | Quan es carrega més d'un fitxer |
| Cada columna de filtre | 4 | Per cada columna marcada *Guardar per filtrar* |

El **pic** afegeix el que la càrrega només necessita de manera transitòria - 8 bytes de temps de 64 bits durant la fusió, 12 bytes de claus d'ordenació i índexs, 4 bytes d'espai de treball de permutació (els tres quan el temps està assignat), i 4 bytes mentre la columna de grup encara és de 32 bits - i multiplica la suma per **2,0**. Aquest factor es va mesurar (una càrrega real de diversos fitxers va arribar a 1,9 vegades les matrius detallades, pel conjunt de treball del descodificador Parquet, les còpies que retallen cada columna a la seva longitud, i la memòria alliberada però encara no retornada) i es va arrodonir a l'alça, perquè una subestimació costa una pestanya penjada, i una sobrestimació només costa un pas innecessari.

A la **GPU** cada fila costa 8 bytes (posició i grup, 16 bits cadascun), més 4 bytes (temps i vida útil, 16 bits cadascun) quan tant el temps com la persona estan assignats. Vegeu [Residència de memòria de la GPU](gpu-memory.md). Les textures de filtre (4 bytes per fila per cada filtre actiu) i els inicis de segment de la calor de línies (8 bytes per fila mentre el mode Línies és actiu) no formen part d'aquesta estimació.

## La comprovació d'encaix {#the-fit-check}

Es comparen tres restriccions ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- el pic de RAM contra el **pressupost de RAM**,
- els bytes de la GPU contra el **pressupost de la GPU**,
- el nombre de files contra el **sostre d'ordenació** de 400.000.000 de files, quan hi ha una columna de temps assignada.

Mana la més desfavorable de les tres proporcions: fins al 70% *hi cap*, fins al 100% *just* (hauria de carregar-se, però serà lent), per sobre *no hi cap*. Quan no hi cap, el panell diu quina restricció ho limita i suggereix:

- carregar cada *N*-èsima fila, amb *N* = ⌈files / files que hi caben⌉, ja omplert a la caixa del pas;
- eliminar columnes de filtre, desassignar la columna de temps (que elimina l'ordenació i el seu sostre, a costa de la línia de temps), o augmentar el pressupost.

Quan el pressupost en si no és un fet del maquinari - el navegador ha limitat la xifra de RAM, el valor per defecte l'ha reduït el que està lliure ara mateix, o la xifra de la GPU és una suposició - el missatge ho diu, perquè no recorris a un pas que no necessites.

### Decimació {#decimation}

**Carrega cada [N] files** conserva una fila de cada *N*, comptada per fitxer. La calor és una mitjana, així que cada *N*-èsima fila dóna la mateixa distribució amb més soroll - el mateix intercanvi que ja fa el renderitzador a cada fotograma. La caixa comença a 1 (*fila (totes)*); quan la selecció no hi cap, s'omple prèviament amb el pas suggerit tret que hi hagis escrit alguna cosa. El botó Carrega llavors diu *Carrega N fitxers (1 de cada K)*, i el nom del conjunt de dades registra `cada K-èsima fila`.

### El sostre d'ordenació {#the-sort-ceiling}

El renderitzador necessita les files en ordre de temps ascendent, així que una columna de temps assignada vol dir ordenar cada fila, amb una ordenació radix sobre claus de 32 bits ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Per sobre de **400 milions** de files això es rebutja en lloc d'intentar-ho dins d'una pestanya. Es comprova abans de la càrrega, així que una selecció per sobre del límit es rebutja amb un suggeriment de pas en lloc de llegir-la sencera i fallar a l'últim pas. Prop del límit (*just*) el panell avisa que l'ordenació és un pas llarg sense progrés propi. Sense columna de temps no es fa cap ordenació i no s'aplica cap sostre.

## Pressupostos de recursos {#resource-budgets}

**Rendiment → Pressupostos de recursos** (una línia plegable a la part inferior del panell Rendiment, que diu `Pressupostos de recursos - RAM, GPU, nuclis`). Els pressupostos es detecten; la xifra detectada és el valor per defecte; i els lliscadors no van més amunt d'un **sostre** que és la xifra detectada excepte quan se sap que la detecció no és una mesura.

| Control | Rang | Significat |
|---|---|---|
| **RAM per a dades de files** | 256 MiB fins al sostre de RAM, logarítmic | El pressupost de RAM per a la comprovació d'encaix. Marcat *(per sobre del detectat)* quan supera el valor per defecte detectat, *(màx)* al sostre. |
| **GPU per a dades de files** | 128 MiB fins al sostre de la GPU, logarítmic | El pressupost de la GPU per a la comprovació d'encaix i per pujar les files. Marcat *(per sobre del detectat)* quan supera el valor per defecte detectat, *(màx)* al sostre. |
| **Fils d'anàlisi** | 1 fins al nombre de nuclis lògics | Quants fitxers analitza una càrrega alhora, cadascun en el seu propi treballador. Per defecte, nuclis - 2 (nuclis - 1 amb quatre nuclis o menys). Vegeu [Fils d'anàlisi](#parser-threads) (a Per a desenvolupadors). |
| Línia de fonts | | D'on ve cada xifra (`RAM: …. GPU: …. CPU: ….`). |
| **Torna a detectar** | | Demana al servidor de desenvolupament una lectura nova de memòria i recalcula cada pressupost. |
| Nom de la GPU | | El nom curt de l'adaptador; la cadena completa del renderitzador és el consell. |

### Augmentar el pressupost de la GPU {#raising-the-gpu-budget}

Un pressupost de la GPU per sobre de la xifra detectada s'aplica tal com s'ha fixat: la comprovació d'encaix i la pujada prenen la mateixa xifra d'una funció ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), que només la limita al sostre de la GPU on s'atura el lliscador. Així, una càrrega que la comprovació aprova es puja sencera. Per sobre de la xifra detectada el lliscador diu *(per sobre del detectat)*: el número és llavors el teu judici sobre la targeta, no una mesura, i fixar-lo més alt del que té la targeta comporta el risc de perdre el context o d'una lentitud extrema.

## Conjunts de dades enormes: les palanques {#huge-datasets-the-levers}

De la més barata a la més dràstica:

1. **Menys columnes de filtre.** Cada una costa 4 bytes per fila i un pas de descodificació.
2. **Un pas.** Cada *N*-èsima fila.
3. **Sense columna de temps.** Sense ordenació, sense sostre d'ordenació, sense 4-8 bytes per fila de temps i vida útil - i sense línia de temps.
4. **Augmenta els pressupostos**, quan sàpigues que la memòria hi és.

En el moment de renderitzar, els conjunts de dades grans es gestionen per mostreig i acumulació progressiva en lloc de reduir les dades; vegeu [Mostreig i pressupostos](sampling-and-budgets.md).

## Per a desenvolupadors {#for-developers}

### Fils d'anàlisi {#parser-threads}

Una càrrega de diversos fitxers analitza fins a **Fils d'anàlisi** d'ells alhora, cadascun en un treballador d'anàlisi iniciat pel treballador d'ingestió d'aquella càrrega ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Amb 1, o per a un sol fitxer, els fitxers s'analitzen un rere l'altre al propi treballador d'ingestió.

Executar-ne diversos a la vegada no afluixa la comprovació d'encaix:

- **El constructor es compta primer.** Les columnes fusionades es reserven per a tota la selecció abans de llegir el primer fitxer, així que els fitxers en curs només obtenen el que el pressupost de RAM deixa al costat (`parseHeadroom`): posició, temps de 64 bits, angles de mirada, persona, grup de 32 bits, sessió, columnes de filtre i `Fitxer d'origen`, per fila a carregar - multiplicat per 2,6 quan el nombre de files és una estimació de CSV, perquè una columna creixi fins a una de més gran.
- **Cada fitxer reserva el seu cost abans de començar** (`fileParseBytes`): les seves files (del peu del Parquet; la part d'un CSV de l'estimació segons la mida) per les mateixes columnes, per **8** - el bloc en si, la còpia al costat mentre s'eliminen les files sense posició, i el conjunt de treball del descodificador, que per a columnes de text és molt més gran que els seus identificadors. Un pas no ho redueix, perquè els fitxers es llegeixen sencers i després es decimen. El 8 és una marge fixat per mesura: amb 3, o amb 5, trenta fils d'anàlisi van fer superar a una pestanya el seu límit amb 86 milions de files amb noms de persona i de sessió; amb 8 no.
- **Un altre fitxer només comença si la seva reserva hi cap** en el que queda. Un fitxer que ha acabat però espera que un de anterior es fusioni conserva la seva reserva fins que es fusiona.
- **Un fitxer sempre s'executa.** Quan no hi ha res reservat, el següent fitxer comença costi el que costi - és la càrrega d'un en un que va admetre la comprovació d'encaix, així que un pressupost just hi recorre en lloc de rebutjar.

La xifra *pic durant la càrrega* és el pic d'una càrrega d'un en un, que arriba a l'ordenació, després que s'hagin llegit tots els fitxers. Els fitxers analitzats un al costat de l'altre poden ocupar més memòria que aquesta xifra mentre es llegeixen; les reserves la mantenen dins del pressupost de RAM, en la mesura que les estimacions de dalt siguin correctes.

L'ordre de fusió és l'ordre de la selecció, sigui quin sigui l'ordre en què acaben els fitxers, així que la numeració de persones, grups i sessions, les files i els valors de `Fitxer d'origen` són idèntics a una càrrega d'un en un. Un fitxer que no es pot llegir s'omet i es llista exactament com abans. Un treballador d'anàlisi que mor acaba tota la càrrega, com sempre ha fet la mort del treballador d'ingestió, i cada treballador d'anàlisi s'acaba quan acaba la càrrega, sigui com sigui. Si no es pot iniciar cap treballador d'anàlisi, els fitxers s'analitzen al treballador d'ingestió.

### Com es detecten les xifres {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) s'executa en arrencar, un altre cop quan el renderitzador ja existeix, i en **Torna a detectar**.

**RAM, amb el servidor de desenvolupament.** `start.bat` i `npm run dev` serveixen la pàgina des d'un procés que pot llegir la memòria de la màquina, a `/__host/memory` (es respon en menys de 1,5 s o s'ignora). El valor per defecte és el més petit entre el 60% de la RAM instal·lada i el 80% de la RAM lliure ara mateix; el sostre és el 60% de la instal·lada. Quan és la memòria lliure la que redueix el valor per defecte, el panell ho diu i suggereix tancar programes i prémer **Torna a detectar**.

**RAM, sense ell** (un desplegament estàtic): cap API del navegador informa de la memòria lliure, i `navigator.deviceMemory` s'arrodoneix a una potència de dos i Chrome i Edge el limiten a 8 GiB. El valor per defecte és el 60% de `deviceMemory`, limitat a més a 4 × l'heap JS lliure de la pestanya quan el navegador l'informa, o 4 GiB quan no n'informa res. Quan `deviceMemory` val exactament 8 (el límit), la xifra es marca com *limitada* i el sostre és 4 × el valor per defecte, amb una nota que per sobre del valor per defecte el número és la teva afirmació, no una mesura.

**De qualsevol de les dues maneres**, el valor per defecte i el sostre de RAM es limiten a **12 GiB**, la memòria de matrius tipades més gran que pot contenir una pestanya de Chrome sigui quina sigui la màquina (una pàgina va arribar a uns 15,75 GB i va fallar; 12 deixa espai per a tot la resta), i mai no baixen de 256 MiB.

**Memòria de la GPU.** Cap API web la informa.

- Amb el servidor de desenvolupament, la memòria de la targeta la llegeix `nvidia-smi` (l'adaptador més gran) o, a Windows, el valor del registre del adaptador de pantalla `HardwareInformation.qwMemorySize`. El valor per defecte és el 70% d'ella, el sostre el 90%.
- Sense una lectura, es dedueix: 2 GiB per defecte; 4 GiB quan la textura més gran és de 16.384 px o més (una targeta discreta), 1 GiB quan és més petita; o 8 × el `maxBufferSize` de WebGPU quan és més gran. El sostre és aleshores 8 × la xifra deduïda, perquè la deducció distingeix una part integrada d'una discreta i res de més fi. El panell diu que la xifra és deduïda.
- Mai no és inferior a 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4 quan no n'informa).
