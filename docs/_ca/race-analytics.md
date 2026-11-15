---
title: "Analítica de curses: el mètode"
parent: "Anàlisi de curses"
nav_order: 58
lang: "ca"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Analítica de curses: el mètode

En resum:

- Les voltes es comparen **per distància**, no per temps, perquè el mateix lloc del circuit quedi alineat.
- Cada revolta es jutja **sencera**, des d'una zona de frenada fins a la següent.
- El temps perdut es **reparteix** entre on s'ha perdut (frenada, entrada, sortida, recta) i quanta part en explica el cotxe.
- La causa s'**explica amb paraules**, amb consells.
- Per fer-la servir, no per llegir com funciona: vegeu [Anàlisi de curses](race-analysis.md).

Aquest és el mètode que hi ha darrere de la pestanya **Anàlisi de curses**: què mesura, com decideix on s'ha perdut el temps i com ho converteix en consells. És l'especificació que segueix el codi d'anàlisi (`src/race/`), de manera que cada regla d'aquí té una part equivalent allà i una prova que la comprova.

## Què fan les eines professionals {#what-the-professional-tools-do}

Les eines establertes coincideixen en el mateix nucli, i es diferencien sobretot en el grau en què arriben a les *causes*:

- **Tot es compara per distància, no per temps.** Dues voltes es remostregen sobre un mateix eix de distància; la diferència acumulada de temps transcorregut a la mateixa distància és el *delta* (MoTeC l'anomena variació de temps; d'altres, diferència de temps o traça del delta). La seva pendent indica on es perd temps ara mateix: una pendent suau és acceleració, arrossegament o adherència sostinguda; una de pronunciada, una diferència de frenada o d'accelerador; una ona que puja i baixa, un compromís entre la velocitat d'entrada i la de sortida.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [anàlisi del temps per sectors](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Cada revolta es divideix en fases**: frenada, entrada, part central, sortida. Punt de frenada, frenada màxima i alliberament, velocitat mínima i on es produeix, marxa, recuperació de l'accelerador, tornada a l'acceleració total i velocitat de sortida.
  ([Driver61: sis fases](https://driver61.com/uni/corner-phases/),
  [guia d'anàlisi de voltes d'iRacing](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Minisectors per revolta, i una volta teòrica millor** unida a partir de la més ràpida de cada un.
  ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **La traçada també es compara**, però mai per si sola: "una línia en una imatge no vol dir res fins que coneixes els factors que hi contribueixen". Es llegeix al costat de la traça de velocitat i del delta.
  ([Track Titan: com analitzar la telemetria](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: traçades](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Causa arrel, no símptoma.** La pèrdua a la recta és realment per l'accelerador, o una mala entrada va obligar a accelerar tard? Els errors es classifiquen pel cost en temps de volta i s'expliquen en llenguatge senzill.
  ([Track Titan: fluxos de coaching](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Què va sortir malament a la primera versió, i per què importa {#what-went-wrong-in-the-first-version-and-why-it-matters}

La primera versió carregava cada *fase* per separat i només mirava les pèrdues. Una volta que frenava abans perdia temps a la fase de frenada, i se li deia que frenés més tard, encara que aquella frenada anticipada posés abans el cotxe en gir, l'accelerador abans i la sortida més ràpida de la revolta, i ho recuperés tot a la recta. En una prova, va dir a la volta que havia fet això que "frenés molt més tard", quan l'altra volta, que sí que havia frenat més tard, s'havia passat del vèrtex, havia eixit ampla i havia perdut exactament el que havia guanyat. Les dades de temps deien que les dues maneres de fer-ho eren iguals; el consell deia el contrari.

La correcció és la regla en què coincideixen totes les fonts anteriors: **una revolta es jutja sencera**, des de la zona de frenada per a ella fins a la zona de frenada de la següent, perquè "de vegades cedir uns quants mil·lisegons en una revolta pot millorar el temps total de volta si permet trams posteriors més ràpids"
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Coneixement de conducció que codifiquen les regles {#racing-knowledge-the-rules-encode}

**La velocitat de sortida importa més que la d'entrada**, i més com més llarga és la recta següent: "el temps passat en rectes domina el temps passat en revoltes". Un dèficit de velocitat a la sortida es porta fins al següent punt de frenada. La manera més ràpida de passar una revolta i una recta sovint és girar més lentament perquè l'accelerador arribi abans: *lent a l'entrada, ràpid a la sortida*.
([Race & Track Driving: seqüència per millorar el temps de volta](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: prioritzar revoltes](https://driver61.com/uni/prioritising-corners/))
Un planificador de temps mínim que també es recompensa per la velocitat de sortida mou els seus vèrtexs més tard i obté una volta *més ràpida*. La recompensa que equilibra les dues coses val `L / v²` per unitat de velocitat de sortida, en una recta de longitud `L` a velocitat `v`: el temps que costa una diferència de velocitat en una recta creix amb la seva longitud i disminueix amb el quadrat de la velocitat
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Les revoltes segons on porten.** Una que porta a una recta: maximitzar la velocitat de sortida, vèrtex tard, tornar a la potència com més aviat millor. Una al final d'una recta: maximitzar la velocitat que s'hi porta, frenar com més tard millor; un vèrtex més primerenc és acceptable. Una entre revoltes: compromesa per a la que importa després. Una revolta que podria ser de les dues es tracta com una que porta a una recta. Les revoltes ràpides pesen més: a gran velocitat un cotxe accelera poc, i un km/h perdut no es recupera.
([Allen Berg: tres tipus de revoltes](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: prioritzar revoltes](https://driver61.com/uni/prioritising-corners/),
[Driver61: revoltes diferents, tècniques diferents](https://driver61.com/uni/different-corner-technique/))

**El cercle de fricció.** Un pneumàtic té un sol pressupost d'adherència, que es gasta en frenar, en girar i en accelerar en qualsevol barreja; l'acceleració total és `sqrt(lat² + long²)`. La frenada en gir segueix la vora d'aquest cercle: es deixa anar el fre a mesura que creix la càrrega lateral en girar el volant.
([cercle de fricció](https://www.yourdatadriven.com/friction-circle-introduction/),
[diagrama g-g](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**La roda lliure** (coasting), sense cap pedal premut, és la manera més lenta de perdre velocitat, i un indicador de rendiment mesurable per si mateix.
([Racecar Engineering / OptimumG: factor de roda lliure](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Lliscament.** La força longitudinal arriba al màxim amb un lliscament d'uns 10-20 %, i després baixa; més enllà, la roda es bloqueja en frenar o patina amb potència. Forza informa del lliscament normalitzat: 0 és adherència total, i un valor absolut per sobre de 1 vol dir que s'ha perdut adherència.
([lliscament longitudinal](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Subviratge i sobreviratge.** Un angle de lliscament davanter més gran que el del darrere és subviratge; el del darrere més gran que el davanter, sobreviratge. Sense angles de lliscament: el cotxe gira menys del que demana el volant (el volant per sobre de l'angle d'Ackermann `L/R` que necessita un cotxe a poca velocitat).
([subviratge, visió general](https://www.sciencedirect.com/topics/engineering/understeer),
[Subviratge i sobreviratge](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## La geometria d'una traçada {#the-geometry-of-a-line}

La velocitat que un cotxe pot mantenir en un radi `R` és `v = sqrt(a R)`, amb `a` l'acceleració lateral que donen els pneumàtics (més el que afegeix l'aerodinàmica, que creix amb `v²`). Així, **la velocitat creix amb l'arrel quadrada del radi**: una traçada pel centre en un radi un 20 % més gran és uns 10 % més ràpida en aquell punt.
([velocitat màxima en gir](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: cornering](https://www.formula1-dictionary.net/cornering_tech.html))

**La traçada geomètrica** és l'arc més gran possible en una revolta: des de la vora exterior, tocant l'interior al vèrtex, de nou cap a la vora exterior. Per a una revolta que gira `θ` en una carretera d'amplada `w` (menys l'amplada del cotxe), un arc tangent a les dues vores exteriors i que toca el racó interior té `R = w / (1 - cos(θ/2))` (més el radi propi de la vora interior): per a un angle recte, uns `3,4 w`; per a una revolta tancada, `w`. Per això utilitzar l'amplada importa sobretot en les revoltes mitjanes i menys en les tancades.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**El vèrtex tard** gira més tard i més a fons, primer amb un radi més tancat, i obre el radi a la sortida: més lent pel centre, recta abans, acceleració total abans; "un mínim de velocitat una mica més baix però un perfil d'acceleració més fort a la sortida". **El vèrtex d'hora** és el contrari: més ràpid a l'entrada, i un radi que es tanca a la sortida i reté l'accelerador; en gran part és un error, excepte amb molt poca adherència, on la velocitat perduda a dins no es pot recuperar a fora.
([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[vocabulari de telemetria de curses](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[matemàtica de la traçada](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**La "V" i la "U".** La U és la traçada rodona clàssica: el radi més ampli, el canvi de volant més petit. La V gira abans, va més a fons, fa rotar el cotxe ràpidament pel centre i alinea la sortida per a un recorregut més recte: la frenada es manté recta (i pot ser més tardana), el mínim de velocitat és més baix però s'arriba més tard, i l'acceleració total arriba molt abans.
([Track Titan: la traçada en V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Curvatura contra distància.** La traçada més ràpida és un compromís entre el camí més curt i el que té menys curvatura; en l'amplada d'un circuit, la curvatura pesa més, i una traçada de curvatura mínima s'acosta a la de temps mínim allà on el cotxe és al límit: s'hi separa on el cotxe podria accelerar.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Revoltes seguides**: un doble vèrtex, una xicana, són un sol problema: la traçada de sortida d'una és la d'entrada de la següent, i es treballen enrere des de la que porta a una recta.
([Driver61: revoltes diferents, tècniques diferents](https://driver61.com/uni/different-corner-technique/))

## Quina traçada convé a quin cotxe {#which-line-suits-which-car}

El que decideix és la **potència en relació amb l'adherència** del cotxe a les velocitats d'aquella revolta: "el momentum és adherència contra potència, una qüestió de proporció".
([Ross Bentley: cotxes de momentum](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum sobre potència](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Cotxe, en aquesta revolta | Traçada | Per què |
|---|---|---|
| Accelera fort per a la seva adherència ("point and shoot") | V: frenar recte i tard, girar en un centre curt i tancat, recta i a fons aviat | el temps es guanya amb l'acceleració total, no amb el mínim de velocitat |
| Accelera poc per a la seva adherència ("momentum") | U ampla, vèrtex una mica tard, mantenir alt el mínim de velocitat | no pot recuperar la velocitat que perd |
| Entremig | lent a l'entrada, ràpid a la sortida: U amb vèrtex tard | el compromís clàssic |
| Revolta ràpida, i més amb aerodinàmica | U, a prop de la traçada geomètrica | l'acceleració és feble a gran velocitat; l'adherència de l'aerodinàmica creix amb `v²`, així que la velocitat pel centre paga dues vegades |
| Adherència molt baixa (mullat, neu) | vèrtex més d'hora | la velocitat perduda a dins no es pot recuperar a fora |
| Potència molt per sobre de l'adherència | la traçada importa menys | la tracció, no la traçada, limita la sortida |

"Com més ràpida la revolta, més a prop de la traçada geomètrica; com més lenta, més la modifiques amb un vèrtex més tard."
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[matemàtica de la traçada](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: la traçada en V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: adherència](https://driver61.com/uni/grip/))

La transmissió canvia més la manera de conduir la traçada que la traçada mateixa: un cotxe amb tracció davantera es fa girar amb el fre (frenada en gir) i rep potència només quan la roda es desenrotlla, o s'eixampla; un cotxe potent amb tracció posterior ha d'estar recte abans de l'acceleració total o el darrere s'escapa; la tracció total pot donar potència mentre encara gira, així que recupera l'accelerador abans.
([tècnica FWD](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD en revolta](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

La visualització mesura la relació potència-adherència del cotxe a cada revolta a partir de la seva pròpia conducció (l'acceleració a acceleració total a la velocitat de sortida, dividida per l'adherència lateral a la velocitat mínima), i l'anomena "point and shoot" a partir de 0,45 i "momentum" a 0,25 o menys. Un cotxe l'adherència del qual a 150-250 km/h és més d'un 15 % superior a la seva adherència a 55-110 km/h té aerodinàmica en funcionament.

## El mètode {#the-method}

Els números d'aquí són el raonament. Els llindars que fa servir el codi es recullen en una pàgina cadascun, i aquestes pàgines són la referència quan un número d'aquí és diferent: [Anàlisi revolta a revolta](race-corner-analysis.md), [Esdeveniments de control del cotxe](race-control-events.md), [Perfils de cotxe i comparació](race-car-profiles.md) i [Estadístiques del circuit](race-course-statistics.md).

### 1. Un eix de distància {#one-distance-axis}

La volta més ràpida és la referència, tret que l'usuari en triï una altra. La seva traçada és l'eix: les mostres de cada altra volta es projecten sobre ella, i cada mostra rep una distància al llarg de la referència `s` i un desplaçament lateral amb signe `d`. La projecció només busca cap endavant des de la coincidència anterior, de manera que una volta que es creua amb si mateixa mai salta a la banda equivocada d'un pont. Després les voltes es remostregen sobre una mateixa graella, cada 2 m, per a cada canal. Cada volta es porta els últims metres a la velocitat que tenia, de manera que el seu delta a la línia és la diferència del seu temps de volta.

### 2. Revoltes, i la part de cada revolta en la volta {#corners-and-each-corners-share-of-the-lap}

Com es troben les revoltes, els segments i els complexos: [Anàlisi revolta a revolta](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. El compte de temps d'una revolta {#the-time-account-of-a-corner}

Net, repartiment, velocitat de sortida i l'arrossegament dels cotxes: [Anàlisi revolta a revolta](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. El veredicte, i la causa {#the-verdict-and-the-cause}

Els patrons del veredicte i les causes a l'entrada i a la sortida: [Anàlisi revolta a revolta](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. El cotxe contra el pilot {#the-car-against-the-driver}

Quan les voltes són en cotxes diferents, es descompta la pèrdua que explica el cotxe, per parts:

- **arrossegament**: els cotxes des de la mateixa velocitat per la recta, com més amunt;
- **adherència**: de la velocitat mínima més baixa no explicada per un radi més tancat, la part `½ ln(grip_other / grip_mine) / ln(v_other / v_mine)`, quan la volta era al límit del seu cotxe (90 % del que ha mostrat a aquella velocitat);
- **frens**: de `u` a `v` amb desacceleració `a1` contra `a2`, acabant al mateix punt, costa `(1/a1 - 1/a2)(u - v)² / 2u`; només quan la volta va frenar gairebé tan fort com pot el seu cotxe en la zona, de mitjana, i no només en un pic.

El que un cotxe pot fer surt de totes les voltes carregades d'aquest cotxe: adherència lateral, frenada i acceleració a acceleració total per cada interval de 5 m/s de velocitat (percentils 95, 95 i 90). L'adherència és el que el cotxe **va mantenir durant mig segon**, és a dir, l'acceleració lateral mitjana en 0,5 s, i no el que va tocar una sola mostra: un bordó, una relliscada que es recupera, un cotxe que es fa agafar, pugen un pic durant un instant, i un cotxe que fa això sovint semblava tenir més adherència de la que té. (Comprovat amb voltes gravades de dos cotxes diferents: la mesura per mostra els posava gairebé junts; mantinguda mig segon, els separa com ho fan els seus temps de volta.) La frenada i l'arrossegament prenen cada mostra com la mediana d'ella mateixa i de les seves veïnes. Queden fora l'aire, l'assentament després d'un salt i cada impacte (secció 6) fins que el cotxe es recupera.

**Quin tipus de cotxe és cada un** (`profile.ts`): a partir de les mateixes voltes,

- **adherència mantinguda**: el percentil 95 d'aquella acceleració lateral de mig segon;
- **arrossegament** a acceleració total fins a 50 km/h, de 50 a 120, de 120 a 200 i per sobre de 200, i el màxim que va mostrar;
- **frenada** de 60 a 160 km/h;
- **velocitat punta**: on va deixar de guanyar a acceleració total durant un segon en una recta, conduïda recta, no en una corba llarga presa a fons, on un cotxe perd velocitat a qualsevol potència. Quan cap recta era prou llarga, el que encara tirava a la seva velocitat més alta diu quant hi havia d'arribar. Cap conjectura més enllà del que mostren les voltes: un ajust de potència sobre velocitat contra l'arrossegament va posar un cotxe de carrer 100 km/h per sobre de la seva velocitat punta real, perquè la desmultiplicació i el limitador acaben la potència d'un cotxe molt abans que ho faci l'arrossegament;
- **perdre el darrere**: quantes vegades per volta va lliscar més de 10° de deriva (20° en terreny solt) amb la roda girada en contra de la revolta (contravolant), quantes d'aquestes van començar amb l'accelerador, i a quina part de la seva adherència van començar. Un cotxe conduït una mica de costat a propòsit no perd res; un que necessita ser agafat sí. Es compta igual per a tots els cotxes, perquè dos cotxes es puguin comparar;
- **equilibri**, quan les voltes porten els angles de lliscament: davanter contra darrere al límit.

**Cotxes comparats** posa els cotxes un al costat de l'altre: una taula, una frase per cada un sobre què és el cotxe en relació amb l'altre ("X accelera millor, però no pot girar tan fort, necessita més per frenar i perd el darrere més fàcilment"), cada diferència que és clara (4 % d'adherència, 5 % d'arrossegament o de frenada, 4 km/h de velocitat punta, un darrere agafat almenys una vegada més per volta i la meitat de vegades més), i com conduir cada un. Amb un sol cotxe, diu què és aquest cotxe.

**En cada revolta**, quan les voltes són en cotxes diferents, la troballa diu què en decideixen els cotxes, i com treure el màxim de profit d'aquest:

- **pel centre**: a la traçada de l'altre cotxe, l'adherència d'aquest cotxe permet `v_other · √(grip_mine / grip_other)`. Si la volta portava aquesta velocitat, la diferència és el cotxe, i cap punt de frenada la canvia: es diu i la revolta s'atribueix al cotxe i no al pilot; si en portava menys, la resta es pot guanyar, i es diu quant. Després, on es pot guanyar el temps en el seu lloc: cap a una recta, o en un cotxe que tira més fort, després del vèrtex: frenar recte, girar més tard, dirigir-lo cap a la sortida d'hora; altrament, el radi més ampli que permet la carretera, ja que un radi més gran és l'única manera de més velocitat sense més adherència;
- **un darrere que s'ha escapat** aquí, en un cotxe que el perd més fàcilment que l'altre: què fer en aquest cotxe, l'accelerador donat a poc a poc a mesura que la roda es desenrotlla, o el fre alliberat suaument sense aixecar el peu a mig gir, segons com comencen les seves relliscades;
- **la recta després**: què va costar a la velocitat de partida la potència més gran de l'altre cotxe, i on aquest cotxe es va quedar sense potència;
- **un punt de frenada més d'hora** en un cotxe que frena menys fort.

Una volta que va lliscar pel centre d'una revolta (més de 10° de deriva en asfalt) estava més enllà de la seva adherència, no per sota: mai se li diu que hi tenia adherència sobrant. I si el darrere del cotxe s'ha escapat en aquesta volta amb menys acceleració lateral que la que demanava la revolta, "adherència sobrant" diu que s'ha de trobar en passos petits.

### 6. Control del cotxe: bloquejos, patinatge, relliscades i empenyiments, impactes i accidents {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Cada volta també es llegeix per veure com s'ha dut el cotxe: on s'ha bloquejat una roda, on han patinat les rodes motrius, on s'ha escapat el darrere, on el davanter ha eixit ample. Són els errors que el temps sol no anomena. Tres coses fan que això es mantingui entre jocs i superfícies.

**On acaba l'adherència es mesura amb la conducció del propi cotxe.** Els enginyers fixen un llindar de bloqueig per cotxe al lliscament que donava més desacceleració (els canals MoTeC de la sèrie de frenada d'OptimumG fan servir -0,07 per a un cotxe), i no un valor de manual; i de tota manera els valors de manual no coincideixen: la força arriba al màxim amb un lliscament del 5-20 % en asfalt, segons el pneumàtic i el model; amb un 6 % o entre un 20 i un 60 % en neu, segons la font; i cap font en dóna un per a la grava. Els jocs escalen el lliscament de manera diferent: el de Forza és "normalitzat", de manera que per sobre d'1 s'ha perdut adherència; però els frens d'un cotxe poden donar el seu millor molt per sota o molt per sobre d'1, i les zones de frenada habituals poden passar d'1. Així, per a cada cotxe, sobre totes les voltes carregades d'ell, la força que va fer es classifica segons el lliscament que va tenir: la desacceleració contra el lliscament de les rodes en frenada recta; l'acceleració (com a part del que el cotxe fa a aquella velocitat) contra el lliscament de les rodes motrius; l'adherència en gir (com a part de l'adherència del cotxe a aquella velocitat) contra l'angle de lliscament de cada eix. El límit és el lliscament més enllà del millor on la força ha caigut un 8 %. Una corba que mai no cau en les dades (l'adherència en gir i la tracció de Forza Horizon) no té límit, i el lliscament sol no assenyala res allà. Amb massa poques dades, el límit és una vegada i mitja el pic nominal.

**El terreny es coneix mostra a mostra**, quan el joc ho diu: Forza fa vibrar els pneumàtics en grava, terra i herba (poques mostres en un circuit d'asfalt, moltes en trams de terra i de campo a través), Trackmania indica el material sota cada roda, i el terreny d'un tram de ralli es troba com diu la secció 11. Les corbes, els hàbits de deriva i els llindars es mantenen separats per a l'asfalt i per al terreny solt.

**Cada esdeveniment se situa al costat de l'altra volta, sobre els mateixos metres.** En grava, en neu, en un joc d'arcade amb molta deriva, lliscar és com es fa una revolta: els estudis de control òptim troben solucions de "poca deriva" en asfalt i solucions "agressives, amb molta deriva i fins i tot contravolant" fora de pista; les dades de ralli mostren pneumàtics "ben dins de la regió no lineal", i bloquejar una roda en terreny molt solt pot fins i tot aturar el cotxe abans. Així, un esdeveniment que també ha fet l'altra volta (el 80 % o més) és la manera com es fa la revolta, no un error; i un que ella no ha fet és una falta només si ha costat temps: el temps perdut des de poc abans fins a 40 m després. Una falta que explica el 40 % o més de la pèrdua d'una revolta esdevé la causa d'aquella revolta.

Llindars de detecció, prova de l'altra volta, impactes i accidents, i els textos dels consells: [Esdeveniments de control del cotxe](race-control-events.md).

### 6b. Moltes voltes: les estadístiques del circuit {#b-many-laps-the-courses-statistics}

Comparació per classes, què compta com a error, les estadístiques i el mapa d'errors: [Estadístiques del circuit](race-course-statistics.md).

### 7. La traçada recorreguda {#the-driven-line}

Per a cada volta i cada revolta, només a partir de les posicions: on va començar a girar (una cinquena part de la seva curvatura més tancada), el seu radi més tancat (sobre ±8 m), el radi mitjà en la primera i la segona meitat del seu canvi de rumb, i així

- **forma**: el més tancat sobre el radi mitjà per sota de 0,55 és una V, per sobre de 0,75 una U;
- **vèrtex**: el radi de sortida sobre el radi d'entrada per sobre d'1,25 és tard, per sota de 0,8 és d'hora;
- **vèrtex de velocitat**: si el seu punt més lent és més de 15 m abans de la meitat del seu gir, és lent a l'entrada i ràpid a la sortida; si és més de 15 m després, encara frena passat el centre.

Contra l'altra volta: quant d'interior o d'exterior ha fet en la inscripció, pel punt més tancat i on les dues anaven planes, i on ha començat a girar cada una. Cada troballa acaba amb la traçada que convé al cotxe de la volta en aquella revolta (segons on porta la revolta i la potència en relació amb l'adherència mesurada, l'aerodinàmica i la transmissió) i si la volta l'ha seguida. La taula "Revolta a revolta" mostra la volta més ràpida per cada revolta amb la forma de la seva traçada, i les millors revoltes juntes.

### 8. Dos mapes {#two-maps}

- **On**: el circuit pintat per `dΔt/ds` contra la referència, en vermell on es perd temps i en verd on se n'hi guanya.
- **Per què**: cada pèrdua dibuixada on és la seva causa, pintada pel grup de la causa (frenada, entrada, sortida, recta, cotxe) i més ampla si és més cara.

### 9. Repetició {#replay}

Un sol rellotge, tres maneres de convertir-lo en el temps propi de cada volta: des de la línia, alineats (cada volta arriba a un mateix punt de la pista al mateix moment, i després es deixa anar) i colze a colze (cada volta es manté a la distància de la referència).

### 10. Per quin costat és el món {#which-way-round-the-world-is}

El món del visualitzador és de mà dreta amb Y cap amunt. Un joc amb un món de mà esquerra (Forza entre ells) surt emmirallat: cada corba cap a la dreta es dibuixa com una cap a l'esquerra, tant el circuit com les voltes. Les mateixes voltes ho diuen: el gir positiu del volant és cap a la dreta en cada adaptador, i la suspensió exterior d'una corba es comprimeix; per això la pestanya de curses ofereix corregir-ho, i **Càmera i escena → Inverteix un eix del món** ho fa: X, Y o Z dibuixats al revés. Només canvia el dibuix (una reflexió plegada a la matriu de vista); la càmera vola pel món dibuixat, i les dades, l'anàlisi i cada coordenada que mostren les eines segueixen sent les del joc. L'anàlisi anomena les corbes a l'esquerra o a la dreta amb la mateixa mesura.

### 11. Ralli: el relliscament, el peu esquerre, l'aire {#rally-the-slide-the-left-foot-the-air}

Un tram de ralli no és un circuit conduït amb menys adherència. En grava i neu, el relliscament és com es pren una corba: el cotxe es gira en entrar movent el seu pes, "els frens desplacen el pes del cotxe cap endavant ... els pneumàtics davanters guanyen adherència, els del darrere en perden, i el cotxe gira relliscant cap a la corba", i després es torna a l'accelerador quan està "alineat en la direcció on vols anar" ([DirtFish: com fer servir els frens](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). El peu esquerre fa la frenada perquè l'accelerador i el fre es puguin combinar, el fre de mà fa girar el cotxe en les revoltes tancades ([RallySport Ontario: conducció de ralli, les bases](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/),
[gir escandinau](https://en.wikipedia.org/wiki/Scandinavian_flick)), i el cotxe deixa el terra. La secció 6 ja llegeix les relliscades contra l'altra volta; aquestes regles porten la resta.

- **El terreny.** El que diu la volta (`meta.surface`, el `--surface` dels enregistradors de ralli), si no, el nom de la prova: els ralis d'asfalt (Espanya, Croàcia, Europa Central, Alemanya, Japó, Còrsega, Ypres), els d'hivern (neu), el d'asfalt de Monte amb neu i gel (mixt); si no, com s'ha conduït el cotxe. Un cotxe de Rally2 té un límit lateral de 0,7-0,9 g en grava i de 1,3-1,4 g en asfalt ([grenzbereich, valors de referència](https://github.com/GitCrush/grenzbereich)), i en grava fa molta més deriva (secció 6). Així, un tram on el cotxe va tirar 10 m/s² o més (percentil 95, a velocitat, sobre el terreny) amb una deriva mediana per sota de 6 graus allà on va girar a menys del 70 % d'això, era d'asfalt; qualsevol altra cosa, o massa poca informació per decidir-ho, és solt.
- **Què pot fer el cotxe, sobre el terreny on ho ha fet.** Adherència, frenada i tracció (secció 5) es mesuren a part en asfalt i en terreny solt quan les voltes van conduir una cinquena part o més de les seves mostres en cada un, i cada revolta es jutja amb el terreny sota el cotxe en el seu punt més lent. Les mostres a l'aire i durant 0,3 s després d'un salt queden fora de tot el que mesura el cotxe (envolupants, corbes dels pneumàtics, bloquejos i patinatge): un aterratge sacseja el cotxe més enllà del que poden fer els pneumàtics, i les rodes que giren a l'aire no són patinatge. L'aerodinàmica no es jutja en terreny solt, on els trams ràpids i lents d'un tram són carreteres diferents.
- **Un toc del peu esquerre no és frenar.** Un toc de fre amb l'accelerador encara a la meitat o més, durant menys de 15 m, assenta el cotxe o el fa girar; on una volta va començar a frenar per a una revolta és el primer fre amb el qual l'accelerador es va aixecar, o el que va durar més.
- **El cotxe girat en entrar.** Per a cada volta i revolta, el major angle de deriva des de la frenada fins a 5 m després del seu punt més lent. En terreny solt, una volta que tenia el cotxe girat 8 graus o més menys que l'altra (i que el va girar 12 o més) i que va pujar a la potència o va anar a fons més tard, **ha girat el cotxe menys**: el consell és aixecar o donar un toc al fre amb el peu esquerre en entrar en el gir perquè el darrere giri, amb el punt de fre de mà de l'altra volta quan ella l'ha fet servir, o el fre de mà en una revolta més lenta de 54 km/h, i tenir-lo apuntant a la sortida abans del vèrtex. Una que l'ha girat 12 graus o més per sobre de l'altra i que, tot i això, va pujar a la potència més tard, **l'ha girat massa**: s'havia de redreçar abans que la potència pogués baixar. Qualsevol de les dues és la causa de la revolta a la sortida, després d'una falta de control del cotxe. El consell de traçada en terreny solt diu el mateix per a cada revolta.
- **L'aire.** Un salt de 0,2 s o més més llarg que el de l'altra volta, que va costar temps des de 10 m abans de la sortida fins a 40 m després de l'aterratge (o el final de la revolta), és la causa quan explica el 40 % o més de la pèrdua de la revolta; i la revolta següent, arribada més lenta, ho diu. A l'aire el cotxe no pot girar, frenar ni conduir. El consell manté l'accelerador a fons en la sortida del salt ("no aixequis l'accelerador durant la sortida", que fa baixar el morro), i agafa la cresta una mica més lent o amb un toc de fre perquè el cotxe es mantingui baix ([DirtFish: com saltar amb un cotxe de ralli](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Complexos de tres corbes com a màxim.** Un tram de moltes corbes conduït sense anar mai a fons no és un sol complex llarg: passades tres corbes, en comença un de nou.

`src/race/rally.test.ts` sotmet l'anàlisi a tot això, en trams conduïts amb un model senzill: un cotxe que gira menys i que puja tard a la potència, un salt més llarg, toc de peu esquerre, un tram de moltes corbes, asfalt contra grava.

## Dades, i què permet cada font {#data-and-what-each-source-allows}

| Font | Freqüència | Canals | Permet |
|---|---|---|---|
| Fitxers de volta de FH Companion | ~5 m | posició, velocitat, accelerador, fre, volant, acceleració longitudinal i lateral, marxa | tot excepte el control del cotxe, que necessita la telemetria al costat |
| `.tele.gz` de FH Companion, al costat de cada fitxer de volta | els 64 Hz del joc (un enregistrador que guarda cada paquet en fa uns 110 per segon; es descarten les repeticions) | tota la Data Out de Forza: lliscament per roda, angle de lliscament, lliscament combinat, rotació, suspensió, vibració del terreny; la velocitat en el marc del cotxe; velocitat de guinyada | tot, inclòs el control del cotxe |
| Forza Data Out, enregistrada per `heat3d_capture telemetry` | 60 Hz | tot l'anterior, més per roda: temperatura del pneumàtic, lliscament, angle de lliscament, lliscament combinat, recorregut de la suspensió, velocitat de la roda, banda sonora; rpm, potència, parell, velocitat de guinyada | tot |
| Assetto Corsa, ACC, AC EVO, AC Rally (memòria compartida, `heat3d_capture telemetry --game ...`) | 60-333 Hz | un conjunt més ampli: temperatura del nucli i de l'interior, mig i exterior del pneumàtic, pressions, temperatures dels frens, càrregues de les rodes, caiguda, lliscament i angle; la velocitat en el marc del cotxe; ABS i TC en funcionament (ACC, EVO, AC Rally) | tot |
| iRacing `.ibt`, llegit directament | 60 Hz | posició pel GPS, pedals, volant, g, guinyada, temperatura de la carcassa per roda, recorregut de l'amortidor, pressió, desgast | tot; el control del cotxe a partir de l'angle de deriva (la seva guinyada contra la direcció de marxa) i el volant, sense lliscament (no registrat) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | per fotograma; 100 Hz | posició, velocitat al món i eixos del cotxe, velocitat del punt de contacte per roda i suspensió, pedals, volant, rellotge i longitud del tram | tot; lliscament i angle de deriva derivats |
| Richard Burns Rally (NGP UDP) | per pas de física | posició, velocitats pròpies del cotxe, deformació i força per molla de cada roda, pedals | tot excepte el lliscament de les rodes |
| BeamNG.drive (el mod de protocol `heat3d`) | fins a 100 Hz | posició, velocitat i eixos al món, velocitat de superfície per roda, rotació, càrrega i contacte amb el terra | tot; lliscament i angle de deriva derivats |
| Trackmania (el connector d'Openplanet) | per fotograma | posició, velocitat frontal i lateral, pedals (fre sí/no), volant, coeficient de lliscament per roda i terreny solt, a l'aire | tot; l'angle de deriva a partir de la velocitat lateral |

Cada font es converteix en un sol format de volta, `heat3d-lap`, els canals del qual tenen noms canònics (`speed`, `throttle`, `tireTemp[FL]` ...). El símbol del cotxe i els gràfics dibuixen els canals que tingui cada volta.

## Fonts {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections: time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (delta en el domini de distància)](https://github.com/taishiliu25/lap-delta-analyzer)
- [guia d'anàlisi de voltes d'iRacing](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: voltes de sessió](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: anàlisi de traçades](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: volta teòrica a partir de sectors](https://overcut.gg/)
- [Track Titan: com analitzar la telemetria](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: anàlisi de frenada, bloqueig i KPI d'estabilitat (set. 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: a l'accelerador (gen. 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: indicadors clau de rendiment dels pilots de curses (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Models de fricció pneumàtic-calçada i lliscament òptim (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: fricció pneumàtic-paviment, lliscament al pic sobre neu i gel](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: coeficients de fricció del pneumàtic, pic i lliscament](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: forces longitudinals](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: forces laterals](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Estabilitat del vehicle, límits de l'angle de lliscament (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Conducció de ralli a gran lliscament lateral (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Manevres de ralli de temps mínim (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [Velocitat de guinyada de referència de l'ESC (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Detecció de subviratge i sobreviratge per volant contra guinyada (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: angle de volant, Ackermann i gradient de subviratge](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: canals matemàtics (Kus, g combinada)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: estri de subviratge i sobreviratge](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Frenada cadenciada: bloqueig en superfícies molt soltes](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: registre de dades en rallis de grava](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: com fer servir els frens](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: com saltar amb un cotxe de ralli](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: conducció de ralli, les bases](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Gir escandinau](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: dinàmica de vehicles de ralli, valors de referència](https://github.com/GitCrush/grenzbereich)
- [Connector d'entrenament de deriva de velocitat de Trackmania (constants)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Descripció de la deriva de velocitat a Trackmania](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: fluxos de coaching](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: la traçada en V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (velocitat de sortida contra temps mínim)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: seqüència per millorar el temps de volta](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: els tres tipus de revoltes](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: prioritzar revoltes](https://driver61.com/uni/prioritising-corners/)
- [Driver61: revoltes diferents, tècniques diferents](https://driver61.com/uni/different-corner-technique/)
- [Driver61: les sis fases d'una revolta](https://driver61.com/uni/corner-phases/)
- [Driver61: adherència](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (fragment)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: què és un cotxe de momentum](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [El debat del momentum sobre la potència](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Matemàtica de la traçada, part 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, part 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [Tècnica FWD](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD en revolta](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: tècnica en revolta](https://www.formula1-dictionary.net/cornering_tech.html)
- [Velocitat màxima en revolta](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Vocabulari de telemetria de curses](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Planificació de trajectòria de temps mínim global tenint en compte la curvatura i la distància](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: optimització global de trajectòries de curses](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: el factor de roda lliure](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Introducció al cercle de fricció](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: diagrama g-g](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Lliscament longitudinal](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Subviratge, visió general](https://www.sciencedirect.com/topics/engineering/understeer)
- [Subviratge i sobreviratge](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Documentació de Forza Motorsport Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: acceleració limitada per tracció](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: acceleració limitada per potència](https://hpwizard.com/accelerating-power-limit.html)
- [Memòria compartida d'AC EVO](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [Lector de telemetria d'AC Rally](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [Anàlisi d'IBT d'iRacing](https://github.com/teamjorge/ibt)
