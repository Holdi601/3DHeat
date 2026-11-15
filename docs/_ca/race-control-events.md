---
title: "Esdeveniments de control del cotxe"
parent: "Anàlisi de curses"
nav_order: 54
lang: "ca"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: false
---

# Esdeveniments de control del cotxe

El visor mira com es va conduir cada volta i marca on el pilot va fer que el cotxe llisqués, giressin, topés amb alguna cosa o perdés adherència. És útil perquè un error que costa temps és la cosa més ràpida de corregir.

![La secció Control del cotxe: amb quina freqüència cada volta va bloquejar una roda, va girar o va anar massa ampla, i la llista de faltes amb una oberta](../assets/img/en/race-control-table.webp)

## Amb paraules senzilles {#in-plain-words}

- **Bloqueig**: frenes tan fort que una roda deixa de girar i llisca. El cotxe frena pitjor i no pot girar.
- **Patinatge de rodes**: prems tant l'accelerador que les rodes motrius giren més de pressa del que avança el cotxe. Perds empenta.
- **Sobreviratge**: la part de darrere del cotxe llisca cap enfora. Si gira del tot, això és una **baldufa**.
- **Subviratge**: la part davantera del cotxe llisca cap enfora («empenyent»); girar més el volant no ajuda.
- **Cop** i **estavellat**: el cotxe ha tocat alguna cosa (un cop és un petit cop o un roçament, un estavellat és fort).
- **ABS**, **TC**: els ajuts del cotxe que actuen contra el bloqueig i el patinatge de rodes. No són errors.

## La secció Control del cotxe (què veus) {#the-car-control-section-what-you-see}

Per a la volta seleccionada, amb el que portin les voltes - sense lliscament de pneumàtics i sense angle de deriva, mostra el que encara es pot trobar en lloc de no mostrar res (a sota).

**La taula**: una fila per cada tipus que mostri alguna de les dues voltes - Rodes bloquejades, Patinatge de rodes, Darrere que es desplaça (sobreviratge i baldufes), Empenyent cap enfora, Accidents, Cops, ABS actiu, Control de tracció actiu, Fre de mà, A l'aire - cada cel·la «nombre · segons», per a la volta seleccionada i per a la volta amb què es compara; i *Angle de deriva màxim* quan hi ha angle de deriva (el més gran a terra).

**La llista**: les seves faltes no compartides que costin almenys 0,02 s, les més cares primer, com a màxim 12, cadascuna amb el seu títol i cost (i l'etiqueta del seu tipus). Fes clic en una per llegir-ne el consell, alinear els cotxes 40 m abans i reproduir-la. **També el que van fer les dues voltes** afegeix totes les faltes, també les compartides (etiqueta «ho van fer tots dos», cost «—» per sota de 0,01 s). Si no n'hi ha cap: «Res que X va fer amb els pneumàtics no li va costar temps que Y no fes també.»

**La pista de sota** indica amb què podia veure la detecció - «Des del lliscament de cada roda i el seu angle de lliscament, i l'angle de deriva del cotxe.» (o lliscament i angle de lliscament, lliscament i angle de deriva, només lliscament, o «Només de l'angle de deriva del cotxe - aquestes voltes no porten lliscament de pneumàtics.») - el terreny per al qual es van mesurar els límits (asfalt, solt, mixt: més del 80% de mostres soltes és solt, menys del 20% és asfalt), a quina volta es van situar els esdeveniments i com es calcula el cost.

Amb **cap lliscament de pneumàtics i cap angle de deriva** (un fitxer de volta de FH Companion sense la seva telemetria) la taula i la llista es mostren igualment, i la pista diu què encara es va trobar a partir del que porten les voltes: «Aquestes voltes no porten lliscament de pneumàtics ni angle de deriva, així que no es poden distingir els bloquejos ni el patinatge de rodes. Encara es troben: empenyiments, a partir del volant contra el traçat; cops i estavellats, a partir de la velocitat i l'acceleració.» - també es diuen els lliscaments a partir de la velocitat de guinyada quan les voltes en porten una, i els empenyiments només quan hi ha volant. La frase sobre els límits de lliscament i deriva s'omet, i una segona pista diu: «Per a Forza Horizon, tria també el fitxer `.tele.gz` al costat de cada volta de FH Companion: és la telemetria completa, el lliscament de cada roda 64 vegades per segon.»

El **cost total** de control de la volta (usat als resums) compta una sola vegada les faltes que se solapen - un bloqueig i el lliscament que l'inicia, dins de 40 m - al cost més alt del grup.

## Com es detecta {#how-it-is-detected}

La resta d'aquesta pàgina és el llibre de regles: cada tipus, cada llindar.

Codi: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
El raonament i la bibliografia són a [el mètode](race-analytics.md).

## Els tipus {#the-kinds}

| Tipus | Fila de la taula | És una falta? | El més curt que compta |
|---|---|---|---|
| `lock` | Rodes bloquejades | sí | 0,1 s |
| `wheelspin` | Patinatge de rodes | sí | 0,15 s |
| `oversteer` | Darrere que es desplaça | sí | 0,2 s |
| `spin` | (comptat amb Darrere que es desplaça) | sí | 0,1 s |
| `understeer` | Empenyent cap enfora | sí | 0,25 s |
| `crash` | Accidents | sí | - |
| `hit` | Cops | sí | - |
| `abs` | ABS actiu | no | 0,2 s |
| `tc` | Control de tracció actiu | no | 0,2 s |
| `handbrake` | Fre de mà | no | 0,1 s |
| `airborne` | A l'aire | no | 0,15 s |

Els trams més curts són soroll (una vora, un bony, una sola mostra). Els trams de punts de la quadrícula (cada 2 m) que passen una prova s'uneixen sobre buits de fins a 2 punts. Només les **faltes** poden ser errors i tenen cost; les altres són el que van fer el cotxe i el pilot.

## Què exigeix cada prova {#what-every-test-needs}

### Canals derivats {#derived-channels}

Abans de jutjar res, cada volta rep el que el seu joc no envia, amb noms canònics (el valor propi del joc sempre guanya):

| Canal | A partir de |
|---|---|
| `bodySlip` (angle de deriva) | la velocitat en marc del cotxe, `atan2(latVel, abs(longVel))`, quan el joc l'envia (0 per sota de 3 m/s); si no, el rumb (el `yaw` del joc, ajustat a la direcció de marxa per signe i desplaçament sobre mostres de més de 10 m/s, i només de confiança amb una variància circular per sota de 0,05) comparat amb la direcció de marxa (posicions separades almenys 2 m), a velocitats per sobre de 3 m/s |
| `yawRate` | el canvi de `yaw` en el temps, quan hi ha rumb però no velocitat |
| `airborne` | el contacte de terra de totes les rodes apagat (≤ 0,5); si no, la càrrega de totes les rodes per sota del 5% de la seva mediana; si no, el recorregut de suspensió de totes les rodes igual o per sota de 0,02 (completament estès). Una sola mostra aïllada no és un vol |
| `slipRatio.<W>` | `(velocitat superficial de la roda - velocitat del cotxe) / velocitat del cotxe` per sobre de 3 m/s, quan el joc envia velocitats superficials de roda; o a partir de la rotació de la roda × un radi de rodolament mesurat a la volta - la mediana de `velocitat / rotació` mentre es roda en línia recta sense accelerar (velocitat > 10 m/s, accelerador < 0,3, fre < 0,05, abs(acceleració longitudinal) < 3 m/s², no a l'aire; totes les mostres per sobre de 10 m/s quan n'hi ha menys de 20), acceptat entre 0,1 i 1 m. Marcat com `physical` |
| `loose` | el soroll de superfície de Forza en almenys 2 rodes (> 0,001) durant almenys 0,33 s (un bordó és més curt), buits de menys d'1 s units |

### A terra i estabilitzat {#on-the-ground-and-settled}

No es jutja res a l'aire ni durant **0,3 s després d'un aterratge** - la suspensió toca fons i les acceleracions es disparen, que no és adherència, frenada ni tracció. Una mostra també ha d'estar **en moviment**: més de pressa de 5 m/s.

### El terreny {#the-ground}

El terreny de cada mostra és **solt** quan el canal `loose` de la volta ho diu (el soroll de superfície de Forza, els materials de les rodes de Trackmania), altrament la superfície de la volta (vegeu [disciplina i superfície](race-loading-laps.md#discipline-and-surface)): asfalt, o solt per a qualsevol altra cosa. Les corbes, els hàbits de deriva i els llindars es mantenen separats per a l'asfalt i el terreny solt.

### Lliscament, com a múltiple del pic nominal del pneumàtic {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Els jocs escalen el lliscament de manera diferent; `meta.slip` diu com, i cada lliscament es divideix per una escala perquè al voltant d'1 sigui el pic nominal del pneumàtic:

| `meta.slip` | Significat | Dividit per |
|---|---|---|
| `peak` | normalitzat pel joc: després d'1 es perd adherència (Forza Data Out) | 1 |
| `scaled` | lliscament físic dividit per un pic d'asfalt (el registrador de Kunos) | el pic nominal del terreny sobre el de l'asfalt |
| `index` | una mesura de lliscament de 0..1 (SlipCoef de Trackmania) | 0,5 |
| `physical` (o desconegut) | relació de lliscament com a fracció, angle de lliscament en radians | el pic nominal del terreny |

Pics nominals, quan no se'n sap res de millor:

| Superfície | Relació de lliscament | Angle de lliscament |
|---|---|---|
| asfalt | 0,12 | 8° |
| mixt | 0,18 | 12° |
| solt (grava) | 0,25 | 15° |
| neu | 0,25 | 15° |
| gel | 0,10 | 6° |

### On acaba l'adherència: les corbes del pneumàtic de cada cotxe {#where-grip-ends-each-cars-tyre-curves}

On un pneumàtic deixa de donar més es **mesura per cada cotxe**, a partir de cada volta carregada (`measureTyres`), separadament per a l'asfalt i el terreny solt:

| Corba | Mostres (velocitat > 10 m/s, estabilitzades, acceleracions per sota de 45 m/s²) | Lliscament (x) | Força (y) |
|---|---|---|---|
| frenada | fre > 0,3, fre de mà ≤ 0,2, anant recte (lateral per sota del 30% del més fort) | abs(relació de lliscament mitjana dels quatre pneumàtics) | desacceleració |
| tracció | accelerador > 0,8, fre ≤ 0,05, recte, l'empenta a accelerador total del cotxe en aquella velocitat > 0,5 m/s² | la relació de lliscament de la roda motriu més alta | acceleració com a part d'aquesta empenta |
| davant | lateral per sobre del 30% del més fort, l'adherència del cotxe a aquella velocitat > 1 m/s² | l'angle de lliscament davanter més gran | acceleració lateral com a part d'aquesta adherència |
| darrere | el mateix | l'angle de lliscament posterior més gran | el mateix |

«El més fort» és el percentil 99 de l'abs(acceleració lateral) de la volta en aquell terreny (tot el terreny quan té menys de 50 mostres). La transmissió decideix les rodes motrius (davanteres en tracció davantera, posteriors en tracció posterior, totes en tracció total; desconeguda: totes).

A partir de almenys **150 mostres**, el lliscament es talla en 6 a 14 franges d'igual recompte (una per cada 40 mostres), la força de cada franja és el seu quartil superior (el que va donar el pneumàtic quan el pilot ho va demanar), suavitzat entre franges veïnes. El **millor** és la franja amb més força; el **límit** és la primera franja després d'aquesta on la força ha baixat un **8%**. Una corba que mai no baixa a les dades no té límit (infinit) - anar més enllà del «pic» no costa res en aquest joc, i el lliscament sol no marca res allà (les corbes de tracció i de gir de Forza Horizon són així). Amb massa poques mostres en un terreny, s'usen les de l'altre terreny; amb massa poques en total, el límit **nominal**: 1,5 vegades el pic nominal.

Cada cotxe també rep:

- el seu **hàbit de deriva**: el quartil superior del seu angle de deriva allà on pren una corba al 60% del seu màxim o més (necessita 100 mostres);
- el seu **gir per curvatura** (`steerGain`), per cada banda de velocitat de 5 m/s: la mediana de abs(gir) / curvatura del traçat mentre pren una corba amb fermesa però ben dins del seu agafament (del 30 al 60% del seu màxim, curvatura més tancada que un radi de 400 m, gir per sobre de 0,02; 25 mostres per banda). La curvatura del traçat és el rumb de guinyada dividit per la velocitat quan el joc envia una velocitat de guinyada; si no, a partir de les posicions ±5 m.

## Detecció, tipus per tipus {#detection-kind-by-kind}

| Tipus | Prova (sobre mostres en moviment i estabilitzades) | `peak` i `limit` |
|---|---|---|
| **bloqueig** | fre > 0,05, fre de mà no per sobre de 0,2, i la relació de lliscament de qualsevol roda per sota del límit de frenada en negatiu | el lliscament més negatiu (múltiples del pic nominal); el límit en negatiu |
| **patinatge de rodes** | accelerador > 0,2 (o sense canal d'accelerador), i la relació de lliscament d'una roda motriu per sobre del límit de tracció | el lliscament motriu més gran; el límit |
| **sobreviratge** (angle de deriva) | l'angle de deriva per sobre del més gran entre el terra de la superfície i 1,5 × l'hàbit de deriva del cotxe en aquell punt | l'angle de deriva més gran, en radians |
| **sobreviratge** (angles de lliscament, sense angle de deriva) | l'angle de lliscament posterior més gran per sobre del límit posterior i més de 0,25 per sobre del davanter més gran | l'angle de lliscament posterior (múltiples del pic) |
| **sobreviratge** (sense angle de deriva, però amb velocitat de guinyada i acceleració lateral) | la «velocitat d'actitud» - abs(velocitat de guinyada) menys abs(acceleració lateral) / velocitat, per sobre de 8 m/s - per sobre de 0,2 rad/s, amb el volant en contra del gir | rad/s; límit 0,2 |
| **baldufa** | una execució de sobreviratge el pic de l'angle de deriva de la qual va passar els **60°** | igual que sobreviratge |
| **subviratge** (angles de lliscament) | sense lliscar, l'angle de lliscament davanter més gran per sobre del límit davanter i més de 0,3 per sobre del posterior | l'angle de lliscament davanter; el límit |
| **subviratge** (sense angles de lliscament) | més de pressa de 12 m/s, sense lliscar, sense contravolant, acceleració lateral per sobre de la meitat del més fort de la volta (percentil 99), traçat més tancat que un radi de 300 m, i volant més d'**1,6 vegades** del que diu el gir per curvatura del propi cotxe que el traçat necessitava | les vegades de volant necessàries; límit 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` per sobre de 0,5 | - |
| **fre de mà** | `handbrake` per sobre de 0,2 | - |
| **airborne** (a l'aire) | `airborne` per sobre de 0,5 | - |
| **cop**, **estavellat** | vegeu [Cops i estavellats](#hits-and-crashes) | la velocitat que va perdre l'impacte |

Els mínims d'angle de deriva per terreny: asfalt **7°**, mixt **10°**, solt i neu **15°**, gel **10°**. Un cotxe que deriva més com a cosa normal - un model de pneumàtic arcade, un especialista en grava - té el seu propi llindar, més alt, a partir de les seves pròpies voltes (1,5 × el seu hàbit).

**Cap a quina banda gira el cotxe** (per a «en contra del gir»): el canvi de rumb del traçat propi de la volta sobre ±6 m (almenys 2 punts de la quadrícula); més tancat que un radi de 600 m compta com a giro; dreta o esquerra segons si el món està reflectit. El volant és **en contra** del gir quan abs(gir) > 0,05 i el seu signe és contrari al del gir - un lliscament que es **frena** amb el volant contrari.

**Els pedals en començar** (`pedal`): *frenada* quan el fre està per sobre de 0,1; *accelerador* per sobre de 0,3; *alleugerit* quan l'accelerador era per sobre de 0,5 dins de les 8 posicions de la quadrícula (16 m) anteriors; *rodant* en cas contrari (o sense canal d'accelerador).

## Comparat amb l'altra volta {#laid-against-the-other-lap}

Cada esdeveniment es jutja contra la volta amb què es compara la volta seleccionada en aquell tram (la millor de la seva classe; per a la mateixa volta, la que sigui més ràpida de la seva classe en aquell tram):

1. **Quant va anar més lluny l'altra volta** en els mateixos metres, ±8 m: els propis esdeveniments de l'altra volta de la mateixa família (una baldufa compta com a sobreviratge, un estavellat com a cop) mesurats en les mateixes unitats, sense llindars, amb les corbes de pneumàtic de l'altre cotxe.
2. **Compartit** quan l'altra volta va anar **80%** tan lluny o més: així es pren la corba, no és un error. Els tipus que no són faltes sempre són «compartits».
3. **Cost**, per a una falta no compartida: el temps que aquesta volta va perdre respecte a l'altra des de 5 m abans de l'esdeveniment fins a **40 m després** (en un cop o un estavellat, fins que el cotxe recupera la seva velocitat - els metres per recuperar-la amb la seva pròpia empenta, de 40 a 400 m; sense empenta mesurada, 5 m/s²). Mai no és negatiu.
4. **Velocitat cedida** al límit del cotxe: per a un bloqueig, la desacceleració que el cotxe demostra que pot fer a aquella velocitat menys la que va fer, sumada durant l'esdeveniment; per al patinatge de rodes, la seva empenta a accelerador total menys la que va fer; per a un impacte, la velocitat que va perdre. S'indica quan és per sobre de 0,5 m/s (1,8 km/h).

Una falta que no és compartida i costa almenys **0,02 s** es llista (les [estadístiques del circuit](race-course-statistics.md) només compten faltes de **0,03 s** o més, perquè un error comptat en moltes voltes sigui clarament un error), i pot ser la causa de la pèrdua d'una corba (vegeu [Anàlisi corba per corba](race-corner-analysis.md#car-control-faults-and-impacts)).

## Cops i estavellats {#hits-and-crashes}

`impacts.ts` llegeix els cops a partir de les **pròpies mostres** de la volta, abans de tornar-les a mostrejar - un cop acaba en centèsimes de segon. Els pneumàtics no poden produir les forces d'un cop, així que un cop es mesura contra el propi cotxe de la volta:

- **La seva adherència `G`**: el percentil 99 de la seva acceleració horitzontal `√(lat² + long²)` durant la volta, a terra i a més de 5 m/s. Sense canals d'acceleració (o per sota de 3 m/s²), 15 m/s² - l'adherència d'un cotxe de carretera.
- **Llindar**: `max(1,8 G, G + 18, 30)` m/s².
- **Mostra colpejada**: l'acceleració horitzontal per sobre del llindar *i* que salta més de la meitat de `G` respecte a la mostra anterior; **o** la velocitat que baixa, dins de 0,1 s, en més del que el llindar prendria en 0,1 s més 1,5 m/s. Només a terra i estabilitzada, i només quan el cotxe anava més de pressa de 5 m/s.
- Les mostres colpejades dins de **0,4 s** són un sol impacte.
- **Abans / després**: la velocitat més alta en els 0,15 s anteriors; la més baixa fins a 0,3 s després de l'última mostra colpejada.
- **No és un impacte**: velocitat perduda sense força al darrere - la acceleració horitzontal màxima dins de 0,1 s per sota del més gran entre `G` i 25 m/s² - és el joc que retrocedeix o reinicia el cotxe.
- **Estavellat** quan va perdre **30 km/h** o més, o va deixar el cotxe per sota de la meitat de la seva velocitat; **cop** en cas contrari - un petit cop, un roçament contra una paret.
- **Direcció**: l'acceleració longitudinal més gran que la lateral, i negativa: *de cara*; positiva: *des de darrere*; la lateral més gran: *pel costat*. Sense acceleracions, de cara.

El que pot fer un cotxe es mesura amb tots els impactes exclosos, des de 0,1 s abans fins a 1 s després (`struckMask`).

## Els textos {#the-texts}

Cada esdeveniment es diu nomenant les dues voltes, amb on (metres al llarg de la referència), la velocitat amb què va començar, quant es va passar del límit comparat amb l'altra volta, i un consell. El consell es deriva del tipus i del que es va mesurar:

| Esdeveniment | Consell |
|---|---|
| bloqueig, només davanters | un davanter bloquejat no pot girar: menys pressió a la part alta de la zona, deixa-la anar cap a la corba |
| bloqueig, només posteriors | un posterior bloquejat deixa el cotxe girar: frena més en línia recta, alleugereix en entrar a la corba; mou el repartiment cap endavant si es repeteix |
| bloqueig, terreny solt | una roda bloquejada llaura: prem fins just abans de bloquejar |
| bloqueig, la resta | massa pedal per a l'adherència: prem més de manera progressiva |
| patinatge de rodes | dosifica l'accelerador a mesura que el volant es desfà; a la marxa més curta quan estàs limitat per tracció (en terreny solt: una marxa més alta suavitza el parell) |
| baldufa / sobreviratge | pel pedal: sota frenada (frenar en corba massa fort, una reducció massa aviat), alleugerit (sobreviratge en alleugerir: mantén un accelerador estable), amb l'accelerador (massa mentre encara estàs girat), cap dels dos (entrar en corba massa de pressa); «frenat amb volant contrari» quan es va contravolant; en terreny solt o en un ral·li, «algun angle és la manera ràpida de girar - el de l'altra volta va ser prou» |
| subviratge | girar més el volant no fa res una vegada el davanter ha marxat: arriba més lent, deixa anar una mica de fre per carregar el davanter, desfer el volant; en terreny solt, gira el cotxe amb un alleugeriment o un toc amb el peu esquerre |
| cop / estavellat | pel costat: un metre de marge costa menys que el roçament; des de darrere: un altre cotxe o un lliscament enrere; un estavellat de cara: frena abans; un petit cop al davant: has tocat alguna cosa. «X també hi va topar.» quan és compartit |

A Trackmania, un lliscament també diu: per sota d'uns **400 km/h** (**300** en terreny solt: terra, herba, plàstic) un lliscament dona menys tracció que agafar-se; per sobre, un *speedslide* a l'angle adequat guanya, i aquest va costar temps, així que el seu angle estava malament.

## Què permet cada font {#what-each-source-allows}

| Les voltes porten | Bloqueigs / patinatge de rodes | Sobreviratge / baldufa | Subviratge |
|---|---|---|---|
| lliscament de cada roda i angle de lliscament, velocitat del cotxe (Forza Data Out, els jocs d'AC) | a partir del lliscament | a partir de l'angle de deriva, o de l'angle de lliscament posterior | a partir dels angles de lliscament |
| velocitats de roda, velocitat del món (jocs de ral·li, BeamNG) | a partir del lliscament derivat | a partir de l'angle de deriva derivat | a partir del gir per curvatura |
| guinyada i velocitat de guinyada, sense lliscament (iRacing) | - | a partir de l'angle de deriva (la guinyada ajustada contra la direcció de marxa); a partir de la velocitat d'actitud amb contravolant només quan no es pot confiar en la guinyada | a partir del gir per curvatura |
| només rumb | - | a partir del rumb contra el recorregut | a partir del gir per curvatura |
| només un fitxer de volta de FH Companion (sense guinyada, sense lliscament) | - | - | a partir del gir per curvatura (té volant i acceleracions) |

Els cops i els estavellats només necessiten la velocitat (millor amb acceleracions), així que totes les fonts els tenen. La secció **Control del cotxe** mostra què permet cada font: amb només un fitxer de volta de FH Companion, els seus empenyiments a partir del volant i els seus cops, i el consell de carregar el `.tele.gz` per a la resta.
