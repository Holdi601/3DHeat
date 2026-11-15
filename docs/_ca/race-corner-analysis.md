---
title: "Anàlisi revolta a revolta"
parent: "Anàlisi de curses"
nav_order: 55
lang: "ca"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Anàlisi revolta a revolta

Dues voltes del mateix circuit es comparen revolta a revolta. Per a cada revolta, el visualitzador diu qui ha estat més ràpid, quant temps valia i per què (frenar massa d'hora, obrir l'accelerador tard, prendre una traçada més ampla), perquè sàpigues què cal practicar primer.

![Una troballa oberta a On millorar, al costat de la taula Revolta a revolta](../assets/img/en/race-corner-finding.webp)

Un exemple treballat: a la revolta 3, Driver A frena 20 m abans que Driver B i perd 0,15 s per arribar-hi, però té l'accelerador abans i guanya 0,15 s en la sortida. Net: 0,00 s. La revolta és igual, i no se li diu que freni més tard.

## Què es veu {#what-you-see}

### On millorar {#where-to-improve}

La secció de la barra lateral per a la volta enfocada ("Carrega almenys dues voltes del mateix circuit." fins que n'hi ha).

**La capçalera:** "<volta> <temps> contra <referència> <temps>" i la diferència de temps de volta; o, per a la referència, "contra la volta més ràpida de les altres en cada revolta (…)" i el total que ha perdut. Al costat, la pèrdua repartida entre *conducció* i *cotxe / context*.

**La barra del desglossament:** el temps perdut per grup de causa (frenada, entrada, sortida, recta, cotxe, context), amb els colors de causa i una llegenda.

**Les troballes**, en tres llistes:

1. Pèrdues de conducció, les més cares primer, com a màxim **12**; o "En cap lloc sobresurt que conduir de manera diferent guanyaria temps."
2. **Mostra què ha costat el cotxe o la situació (X s)**: pèrdues del cotxe i del context, com a màxim 8 (activat per defecte).
3. **On <volta> és més ràpida, o igual d'una altra manera (N)**: guanys i revoltes iguals, com a màxim 10 (activat per defecte).

Cada troballa mostra el seu rang, el títol (la revolta i què va passar, amb el cost per a una pèrdua), la línia del veredicte, el cost (els guanys amb un signe menys) amb una barra i una etiqueta: *frenada*, *entrada*, *sortida*, *recta* (pèrdues de conducció, amb "· cotxe X" quan el cotxe n'explica 0,02 s o més), *cotxe*, *context*, *més ràpid*, *igual*. **Fes-hi clic** per alinear els cotxes 40 m abans, enquadrar-la i repetir-la, i obrir-ne les mesures:

- **Frenada:** on frenava (o aixecava el peu) cadascun i a quina velocitat, i quants metres abans o després (a partir de 5 m);
- **El més lent:** la velocitat mínima de cada volta i on;
- **Acceleració total:** on anava a fons cadascun, i quant abans o després;
- **Traçada:** diferència d'entrada al vèrtex, radis més tancats, quant per dins o per fora, i la forma de la traçada i el vèrtex de cada volta;
- **Recta fins a la següent revolta:** la seva longitud, les dues velocitats on les dues anaven a fons, què ha perdut o guanyat i de què: la velocitat de partida, l'empenta més forta de l'altre, un aixecament de peu, velocitat rascada, i com s'ha conduït (parts des de 0,02 s);
- **El cotxe:** quanta part de la pèrdua és del cotxe, i de què (empenta, adherència, frens; quan és 0,02 s o més);

després el consell, **Els cotxes:** (en cotxes diferents, vegeu [Perfils de cotxe](race-car-profiles.md#what-the-cars-decide-in-a-corner)), i el consell de traçada.

### Revolta a revolta {#corner-by-corner}

Una taula (amb dues voltes o més), una fila per segment, de la classe de la volta enfocada quan n'hi ha diverses:

| Columna | Mostra |
|---|---|
| Revolta | `T3`, `T11-T12` |
| El més ràpid | la volta més ràpida per aquest tram (el seu temps propi, de l'inici a la fi del segment) |
| per | el seu avantatge sobre la segona més ràpida, s |
| traçada | la forma i el vèrtex de la volta més ràpida ("V · tard", "U/V · mitjà"); en passar-hi el ratolí, els seus radis més tancat, d'entrada i de sortida; "en tots dos sentits" per a un complex mixt |
| (la volta enfocada) | quant va quedar darrere de la més ràpida, o ✓ quan ella era la més ràpida |

Fer clic en una fila obre la troballa de la volta enfocada allà (o alinea els cotxes 40 m abans del segment). Sota la taula, quan totes les revoltes tenen un temps: "El més ràpid en cada revolta, tot junt: <temps> (± sobre la referència / sobre la millor de la classe X)": els millors segments més la volta més ràpida fins a la primera revolta quan aquest és un tram propi.

## Com es calcula {#how-it-is-worked-out}

La regla que governa: **una revolta es jutja sencera**, des de la zona de frenada per a ella fins a la zona de frenada de la següent. Una volta que frena abans per girar el cotxe i posar-lo abans en la potència és acreditada per la sortida que ha comprat, i no se li diu que freni més tard.

## Un eix de distància {#one-distance-axis}

Les voltes es comparen per distància, no per temps: un segon després, dues voltes són en revoltes diferents. Tampoc pel seu propi comptador de quilòmetres (una traçada més ajustada cobreix menys metres). La traçada recorreguda de la **referència** és l'eix:

- Les mostres de cada altra volta es **projecten** sobre la traçada de referència: cada mostra rep `s`, quant avança per la referència, i `d`, quant a l'esquerra (positiu) o a la dreta. La cerca només va endavant des de la coincidència anterior (8 segments de traçada enrere fins a 40 endavant), de manera que una volta que es creua per sobre o per sota de si mateixa mai no salta al creuament equivocat. La primera mostra es busca en el primer quart de la traçada (en un circuit, l'inici i la meta coincideixen); quan no hi ha res dins de 30 m, s'agafa el punt més proper en qualsevol lloc que no quedi enrere de l'última coincidència (després d'un trompo o d'una sortida de pista). `s` mai no disminueix: una mostra que es projecta darrere de l'anterior es manté.
- Cada canal es **remostreja** en una sola graella, **cada 2 m**, linealment; els canals per salts (marxa, indicadors) per la mostra més propera. Fora del rang propi d'una volta els valors estan buits.
- Les primeres i les últimes mostres d'una volta es projecten una mica dins dels extrems de la referència, de manera que cada volta es **porta fins a 15 m** més enllà dels seus extrems a la velocitat que tenia (el temps creix segons la distància dividida per la velocitat, la resta es manté), i així el seu delta a la línia és la diferència del seu temps de volta.
- `delta` = el temps de la volta en cada punt de la graella menys el de la referència: la diferència. `lateral` = `d` sobre la graella.

El temps que una volta ha trigat més que una altra entre dos punts de la graella és la diferència dels seus deltes: `rel(s)`. Tot el de sota es construeix sobre això.

## Revoltes {#corners}

Trobades sobre la **referència** (`findCorners`), amb la seva velocitat suavitzada ±6 m i la seva curvatura (canvi de rumb sobre ±5 mostres, suavitzat ±10 m):

1. **Mínims de velocitat amb prominència.** Un punt que és el més baix dins de ±40 m, i la caiguda des de la velocitat més alta a cada costat (abans d'un mínim més baix) és almenys `max(2,5 m/s, 6 % de la velocitat)`.
2. **Revolts de gir (kinks).** Un màxim local de curvatura més tancat que un radi de **300 m** sense cap mínim de velocitat dins de 80 m: un gir pres a fons encara és una revolta per conduir.
3. **Fases.** Des de cada vèrtex enrere mentre la referència frena (> 0,1) o no va a acceleració total (< 0,95): l'entrada; endavant mentre no va a acceleració total: la sortida. Un gir pres pla rep ±30 m. Les revoltes que es solapen es mantenen separades, però s'ajusten perquè cobreixin la volta.
4. Numerades T1, T2 … en ordre de volta; **esquerra o dreta** segons el signe de la curvatura i si el món està emmirallat (desconegut compta com a emmirallat).

**La finestra de la revolta** (on la referència gira): cap enfora des del punt més tancat dins de ±40 m del vèrtex mentre la curvatura es manté per sobre d'una sisena part del seu pic, més 10 m a cada costat. El seu costat dona el signe de "per dins".

## Segments: de zona de frenada a zona de frenada {#segments-braking-zone-to-braking-zone}

Cada revolta és propietària de la carretera a mig camí dels vèrtexs de cada costat. Dins:

- **El punt més lent de cada volta** és una baixada real de la seva velocitat: res més lent dins de 6 m (3 punts de la graella) a cada costat, mirant més enllà dels extrems del tram, de manera que la sortida de la revolta anterior, que encara accelera cap a ella, mai no es confon amb això; es cerca des de 15 m abans de la finestra de la revolta fins a 10 m després. Una volta que mai no va frenar allà es posa al vèrtex.
- **On una volta va començar a frenar per a ella** (`entryOf`): enrere des del seu punt més lent per la frenada o l'aixecament del peu, passant per petites entrades d'accelerador a fons, fins que tenia el peu a fons (accelerador ≥ 0,95, fre ≤ 0,1) durant **10 m**; un accelerador tornat a pujar en els últims **30 m** abans del punt més lent encara pertany a la revolta; si anava a fons tot el temps, el mateix punt més lent. Una volta sense canal d'accelerador, o que no ha tingut el peu a fons des de la revolta anterior, comença al seu punt més ràpid entremig.
- **El segment comença** al primer de tots els que han començat a frenar per a ella (4 m abans), i acaba a l'inici de la següent, de manera que tota la frenada de cada volta és dins i els segments cobreixen la volta.

**Complexos.** Les revoltes seguides entre les quals la referència mai no va a fons (menys de **40 m** d'acceleració total) són un sol segment, "T11-T12", conduït com un de sol; un complex té com a màxim **tres** corbes (una secció de moltes corbes conduïda sense anar mai a fons comença un de nou). Un complex que gira en tots dos sentits és *mixt*: no es mesura cap forma de traçada per a ell.

**En un circuit** (la referència acaba a menys de 50 m d'on va començar), la recta de l'últim segment continua a través de la meta fins al primer punt de frenada: una volta llançada des de la meta compta amb la darrera revolta. Una volta que va començar parada o en una sortida de cursa (vegeu [La sortida](#the-start)) manté aquest tram per separat.

### On porta una revolta {#what-a-corner-leads-onto}

Mesurat sobre la referència: metres a acceleració total després de la revolta (des del seu acceleració total fins a la fi del segment, més el tram a través de la meta) i abans (la part "després" del segment anterior, o des de l'inici).

| Tipus | Regla |
|---|---|
| **entre dues rectes** (`both`) | 200 m o més abans **i** 120 m o més després |
| **cap a una recta** | 200 m o més després, o 120 m o més després i almenys tant com abans |
| **després d'una recta** | 200 m o més abans |
| **enllaç** | qualsevol altra cosa |

## Què ha fet cada volta en una revolta {#what-each-lap-did-in-a-corner}

`cornerMetrics`, per volta i segment, sobre la graella (pas de 2 m). Pedals: la frenada compta per sobre de 0,1; l'acceleració total és 0,95 i més.

| Mesura | Regla |
|---|---|
| **punt de frenada** | el primer fre sota el qual l'accelerador es va aixecar (per sota de 0,5), o que va durar **15 m**: un toc del peu esquerre amb la potència connectada no és on va començar la frenada; només amb tocs, el primer toc |
| **aixecat** | sense frenada, el primer punt en què l'accelerador va baixar de 0,8 |
| (sense pedals) | el punt on la volta va començar a frenar (vegeu més amunt) |
| **alliberament del fre** | l'últim fre fins a 30 m després del punt més lent |
| **velocitat al punt de frenada**, **metres de frenada** | fins al punt més lent |
| **frenada màxima**, **desacceleració màxima** | sobre la zona de frenada (les acceleracions per sobre de 45 m/s² s'ignoren) |
| **frenada en gir** | metres amb fre > 0,05 i |direcció| > 0,1 |
| **lliscament per bloqueig** | el lliscament de roda negatiu més gran de la zona (quan la volta té lliscament) |
| **punt més lent**, **velocitat mínima** | com més amunt |
| **accelerador connectat** | després de l'alliberament (o del punt més lent), el primer accelerador > 0,15 sense fre |
| **acceleració total** | el primer punt després d'això mantingut a ≥ 0,95 durant 10 m |
| **sense pedals** | metres des de l'alliberament fins a l'accelerador connectat amb fre i accelerador sota 0,05 tots dos |
| **caigudes d'accelerador** | vegades que l'accelerador va baixar més de 0,25 per sota del seu màxim corrent entre l'accelerador connectat i l'acceleració total |
| **pic lateral** | l'acceleració lateral més gran des de 20 m abans de l'alliberament fins al més tardà entre l'acceleració total i 20 m després del punt més lent |
| **marxa al vèrtex** | al punt més lent |
| **lliscament en l'empenta** | el lliscament de roda motriu més gran entre l'accelerador connectat i l'acceleració total |
| **equilibri** | angle de lliscament davanter menys posterior a través del centre (+ subviratge) |
| **recta a acceleració total** | la part del segment després de l'acceleració total (i del tram a través de la meta) a ≥ 0,95; el levantament més llarg sobre ella |
| **velocitat rascada** | la pèrdua de velocitat més gran des d'un punt alt amb accelerador ≥ 0,9, sense fre, a terra |
| **entrada en deriva** | l'angle de deriva més gran des del punt de frenada fins a 5 m després del punt més lent, a terra |
| **fre de mà** | on es va activar (> 0,2), fins a 10 m després del punt més lent |
| **aire** | segons a l'aire sobre el segment, i el seu vol més llarg |

## Amb qui es compara cada volta {#who-each-lap-is-compared-with}

- Una volta es compara amb la **volta completa més ràpida de la seva pròpia classe de rendiment** (la referència, a la classe de la referència).
- Aquesta volta de la classe (i la referència) es compara, segment per segment, amb **la altra volta de la seva classe que ha estat més ràpida** per la revolta, o amb totes les voltes, quan és sola a la seva classe.

El mapa de temps, les diferències a la llista de voltes, els esdeveniments de control del cotxe i la taula de revoltes segueixen la mateixa comparació.

## El compte de temps d'una revolta {#the-time-account-of-a-corner}

`compareCorner`, per a una volta contra l'altra sobre un segment:

- **net** = `rel(fi) - rel(inici)` (més el tram a través de la meta en una volta llançada): el veredicte. Més proper que **0,03 s** és **igual**.
- **El repartiment**: on dins de la revolta va girar el que anava per davant: en el tram des del primer punt de frenada o punt més lent de qualsevol de les dues voltes fins al més tardà dels seus punts d'acceleració total i punt més lent, la oscil·lació més gran que la volta va retornar o va guanyar, quan aquesta oscil·lació és de més de **0,04 s**; si no, el més tardà dels dos punts més lents.
- **Fins al vèrtex** = `rel(repartiment) - rel(inici)`; **després** = net menys això. Quan totes dues són almenys 0,04 s i de signe contrari, la volta **ha venjat** una per l'altra.
- **Després** es torna a repartir on les dues van a fons: la **sortida** (repartiment fins a la més tardana acceleració total) i la **recta** (des d'allà fins a la fi).
- **La recta** es reparteix en tres:
  - *velocitat de sortida* (`byExit`) - mesurada, no modelada: el cotxe més lent passa per la velocitat de partida del més ràpid una mica més avall de la recta, i des d'allà la seva pròpia traça és el que faria a partir d'aquesta velocitat, amb la seva pròpia desmultiplicació, arrossegament i pendent. Desplaçada cap enrere a aquest punt (i avançada a la seva velocitat final pels metres que guanya) és el seu temps des de la sortida més ràpida; la diferència és el cost de la velocitat de sortida. Quan el cotxe més lent mai no arriba a aquella velocitat (o només en les 2 últimes mostres), la seva pròpia acceleració al llarg del tram es torna a posar com a potència (`a·v` mantingut), i mai més dura que la seva envolupant a aquella velocitat (el doble de l'acceleració mesurada sense envolupant).
  - *l'empenta dels cotxes* (`byPower`) - només en cotxes diferents: els dos cotxes des de la mateixa velocitat sobre els mateixos metres, a fons, integrant l'acceleració a acceleració total que cadascun ha mostrat a cada velocitat.
  - *com s'ha conduït* (`driven`) - la resta: un aixecament, velocitat rascada a acceleració total.

  La velocitat de sortida mai no explica més que el cost de la recta (i mai amb el signe contrari), tret que un aixecament o una velocitat rascada se n'emportin alguna part. Una volta **aixecada** a la recta quan la seva part a acceleració total és inferior tant a 0,9 com a la de l'altra menys 0,05. La velocitat rascada compta quan les dues es diferencien en més d'1 m/s. Un desacord de menys de 0,02 s en signe es posa a 0.

El net de cada segment suma la diferència de temps de la volta, i el fins al vèrtex i el després de cada revolta sumen el seu net (les proves ho comproven totes dues).

### La part del cotxe {#the-cars-share}

Només quan les voltes són en **cotxes diferents** i la volta ha perdut temps (`carShare`):

- **empenta**: l'empenta dels cotxes per la recta (més amunt), fins a la pèrdua;
- **adherència**: quan la volta era al límit del seu cotxe (acceleració lateral al mig com a mínim el **90 %** del que aquest cotxe aguanta a aquella velocitat) i l'altre cotxe aguanta més d'un **5 %** més: de la velocitat mínima més baixa no explicada per un radi més tancat, la part `½ ln(grip_other / grip_mine) / ln(v_other / v_mine)` de la pèrdua restant;
- **frens**: quan la volta frenava (no aixecava), l'altre cotxe frena més d'un **5 %** més fort, i la desacceleració *mitjana* de la volta sobre la zona era com a mínim el **80 %** del que pot fer el seu cotxe: de `u` a `v` amb `a1` contra `a2`, acabant al mateix punt, `(1/a1 - 1/a2)(u - v)² / 2u`, fins al que quedi.

El cost del cotxe és la suma, com a màxim la pèrdua.

## El veredicte i la troballa {#the-verdict-and-the-finding}

`cornerFinding` escriu com a màxim una troballa per volta i revolta, provant en aquest ordre:

| Cas | Troballa | Resultat |
|---|---|---|
| net dins de ±0,03 s, un venjat, el costat més petit ≥ **0,1 s** | **igual, de dues maneres** - qui ha estat lent a l'entrada i ràpid a la sortida, i qui al revés; amb una recta després (cap a una recta o entre dues), la manera lenta a l'entrada i ràpida a la sortida és la que cal construir-hi: mantén el seu accelerador avançat, recupera l'entrada frenant més fort, no més tard | igual |
| net dins de ±0,03 s en cas contrari | no es diu res | - |
| guanyat, un venjat, perdut fins al vèrtex | **lent a l'entrada, ràpid a la sortida ha funcionat**: mantén-ho, aquí la sortida val més | guany |
| guanyat, un venjat, guanyat fins al vèrtex | **més ràpid a l'entrada**: l'entrada és correcta, un acceleració total més d'hora en mantindria més | guany |
| guanyat, i l'altra volta té una pèrdua aquí | **més ràpid - per què ha fet l'altra**, la seva causa i el seu consell deien "Per a l'altra volta: …" | guany |
| guanyat en cas contrari | **més ràpid a l'entrada / sortida**, per quina meitat ha guanyat més (frenant més tard, més velocitat pel centre; o a fons abans, més empenta) | guany |
| perdut, i un **impacte o accident** costa com a mínim `max(0,05 s, 40 % de la pèrdua)` | l'impacte és la història de la revolta, abans que els cotxes | pèrdua |
| perdut, i la **part del cotxe** és del 60 % o més | **el cotxe**: la seva empenta per la recta, la seva adherència pel centre, o els seus frens: la part més gran; amb la part del conductor (≥ 0,03 s) dita com "Els altres X s: …" | pèrdua |
| perdut, i una **falta de control del cotxe** no compartida costa com a mínim `max(0,05 s, 40 %)` | aquella falta (vegeu més avall), amb com s'ha mogut el temps al seu voltant | pèrdua |
| perdut, i un **vol més llarg** costa com a mínim `max(0,05 s, 40 %)` | el vol | pèrdua |
| perdut, un venjat, guanyat fins al vèrtex | **massa ràpid a l'entrada, lent a la sortida**: la causa de la sortida; sacrifica una mica d'entrada per girar i anar a fons abans, amb els punts de frenada i d'acceleració total de l'altra volta. La seva arrel (`cause`, que compten les [estadístiques](race-course-statistics.md)): frenar més tard, quan ha frenat uns quants metres més tard que l'altra; la causa de la sortida en cas contrari | pèrdua |
| perdut, un venjat, perdut fins al vèrtex | **ha regalat més en entrar que el que la sortida ha recuperat**: la causa de l'entrada, que també és la seva arrel (`cause`); mantén la sortida, perd menys en entrar | pèrdua |
| perdut, aixecat a la recta, i la part conduïda més de la meitat de la pèrdua | **no a fons a la recta**: la part a acceleració total contra la de l'altra, on i quant de temps l'aixecament | pèrdua |
| perdut, l'empenta dels cotxes més del 60 % de la pèrdua i la recta més de la meitat | **l'empenta del cotxe per la recta** (amb l'empenta de tots dos cotxes a 160 km/h) | pèrdua |
| perdut en cas contrari | la causa de la meitat que ha perdut més (fins al vèrtex ≥ després: la de l'entrada; si no, la de la sortida). Només lenta a la sortida perquè era lenta pel centre (en més de 1 m/s): en lloc seu, la causa del centre | pèrdua |

Una troballa sobre una pèrdua també pot acabar amb **També:** - velocitat rascada en acceleració total, o un aixecament a la recta - quan la part conduïda de la recta ha costat més de 0,04 s i això no era ja la causa.

Les troballes es classifiquen: primer les pèrdues, les més cares primer; després els guanys i les revoltes iguals.

### Causes a l'entrada {#causes-on-the-way-in}

`entryCause`, la primera que s'aplica (les diferències de velocitat mínima són en m/s; "5 m" és el llindar perquè un punt més d'hora o més tard compti):

| # | Causa (error) | Regla |
|---|---|---|
| 1 | un impacte o accident en entrar | un impacte no compartit que comença com a màxim 10 m després del punt més lent |
| 2 | **gairebé aturat** (incident) | velocitat més lenta per sota del **60 %** del que permet l'adherència d'aquest cotxe on l'altre va passar (`v_other · √(grip_mine / grip_other)` quan l'altre cotxe té més adherència, si no la velocitat de l'altre), amb l'altra volta per sobre de 8 m/s: una pirueta, un contacte o una revolta perduda |
| 3 | una falta de control del cotxe en entrar | un bloqueig, empenyiment, pirueta o relliscada no compartits i no a l'accelerador, que comencen com a màxim 10 m després del punt més lent, cost ≥ 0,02 s |
| 4 | un vol més llarg abans del punt més lent | vegeu [ral·li](#rally-rotation-and-flights) |
| 5 | **aixecat** quan l'altre anava pla o aixecat 5 m o més tard | aquesta volta només ha aixecat |
| 6 | **frenat on l'altre només ha aixecat** o anava pla | i era més de 0,5 m/s més lenta pel centre |
| 7 | **frenat suaument** | ha frenat (no aixecat), tenia marge per frenar més fort - amb dades de pneumàtic, el seu lliscament per bloqueig per sota del **60 %** del lliscament on els frens d'aquest cotxe donen el seu millor; sense, una desacceleració màxima per sota del **85 %** del que mostra a aquella velocitat - el pedal per sota de 0,95, i la desacceleració màxima de l'altra volta més d'un **15 %** més alta |
| 8 | **frenat d'hora** - o **els frens del cotxe** | ha frenat més de 5 m abans que l'altra. En un altre cotxe amb els frens més de 5 % més forts, i sense més de 10 m de marge respecte a la distància que aquest cotxe necessita amb la seva pròpia desacceleració: els frens del cotxe. Si no, frenat d'hora, amb "Frena més tard - uns N m" (en un altre cotxe, els metres de més del que necessita) |
| 9 | **sense pedals** | més de 10 m sense cap pedal, i 5 m més que l'altra |
| 10 | **més lenta pel centre** | més de 0,5 m/s més lenta al punt més lent; repartida per `v² = a·R` (més avall) |
| 11 | **ha arribat més lenta** | més d'1 m/s més lenta al punt de frenada, sense frenar d'hora: decidit abans - per la revolta anterior i l'empenta del cotxe, o per un vol de la revolta anterior 0,2 s més llarg. La del cotxe quan els cotxes són diferents |
| 12 | més lenta fins al vèrtex | en cas contrari: alliberar el fre més suaument i portar més velocitat cap al centre |

**Més lenta pel centre** (`middleSplit`): el radi de cada volta al seu punt més lent es mesura des de la seva pròpia traçada (±8 m), la seva acceleració lateral com `v²/R`, i

`ln(v_other / v_mine) = ½ ln(a_other / a_mine) + ½ ln(R_other / R_mine)`.

- El radi explica **la meitat o més**: **una traçada massa tancada** - "fes servir més carretera", amb els dos radis i la part.
- Al límit del cotxe (derrapant més de 10° de deriva en asfalt / 20° en terreny solt, o acceleració lateral d'almenys el 90 % del que aguanta a aquella velocitat) i l'altre cotxe té més d'un 5 % més d'adherència: **l'adherència del cotxe**; protegeix la sortida.
- Derrapant pel centre (deriva per sobre de 10° / 20°) i l'altra volta no (la seva deriva d'entrada d'almenys 4° menys): **de costat** - més enllà de la seva adherència, no per sota; arriba una mica més lent. Es diu que és del cotxe quan aquest cotxe atrapa el darrere almenys una vegada per volta més que l'altre.
- En un altre cotxe que aguanta per sota del **96 %** de l'adherència de l'altre, i la volta porta dins d'1 m/s de `v_other · √(grip_mine / grip_other)`: **l'adherència del cotxe** - "frenar més tard no ho compensarà".
- En cas contrari, **adherència de sobra**: acceleració lateral comparada amb la de l'altre en un radi semblant, i el que aguanta aquest cotxe; porta més velocitat al vèrtex. Quan el darrere d'aquest cotxe es deixa anar abans que s'hagi usat tota l'adherència (les seves relliscades comencen per sota del 85 % de la seva adherència, i la volta anava al 80 % d'això), busca la resta en passos petits.

### Causes a la sortida {#causes-on-the-way-out}

`exitCause`, la primera que s'aplica:

| # | Causa (error) | Regla |
|---|---|---|
| 1 | una falta de control del cotxe a la sortida | patinatge de roda, pirueta, relliscada o impacte no compartits que acaben a 10 m abans del punt més lent o més tard |
| 2 | **velocitat rascada** | més d'1 m/s de velocitat perduda a acceleració total que l'altra; per sobre de **7 m/s (25 km/h)** "més aviat un contacte o una pirueta que una relliscada" |
| 3 | **ha girat el cotxe malament** (terreny solt) | vegeu [ral·li](#rally-rotation-and-flights) |
| 4 | **a la potència més tard** | accelerador connectat més de 5 m més tard, comptat també des del seu propi punt més lent (una volta amb el punt més lent més tard no és culpada per un accelerador més tard) |
| 5 | **dubtat amb l'accelerador** | més caigudes d'accelerador que l'altra |
| 6 | **ha eixit ample i ha esperat** | més de 1,5 m per fora de l'altra on les dues anaven planes, i acceleració total més de 5 m més tard des del seu propi punt més lent |
| 7 | **acceleració total més tard** | acceleració total més de 5 m més tard, també des del seu propi punt més lent; amb l'acceleració del cotxe en aquell lloc |
| 8 | **l'empenta del cotxe** | en un altre cotxe que empeny menys del 95 % de l'altre a aquella velocitat, i l'empenta explicava part de la recta |
| 9 | **més lenta en sortir de la revolta** | en cas contrari: un vèrtex més tard, de manera que el cotxe és recte abans |

Quan les dues voltes eren en marxes diferents al punt més lent, el consell acaba amb "Marxa N al vèrtex; l'altra n'ha usat M."

### Faltes de control del cotxe i impactes {#car-control-faults-and-impacts}

Una falta de [Esdeveniments de control del cotxe](race-control-events.md) com a causa: un bloqueig és una causa de *frenada*, el patinatge o una relliscada a l'accelerador una causa de *sortida*, la resta *entrada*; un impacte després del punt més lent és *sortida*, abans *entrada*. El consell és el propi de l'esdeveniment, i després "Va costar uns X s fins a 40 m després" (o "fins que el cotxe va recuperar la velocitat" per a un impacte). Un bloqueig amb un punt de frenada més de 5 m abans que l'altre afegeix que la volta també ha frenat d'hora: amb les rodes girant, no li hauria calgut.

### Ral·li: rotació i vols {#rally-rotation-and-flights}

En **terreny solt**, amb angles de deriva a les dues voltes, i aquesta volta a la potència (o plana) més de 5 m més tard:

- **Ha girat el cotxe menys**: l'altra l'havia girat **12°** o més fins al seu punt més lent, i almenys **8°** més que aquesta volta. Consell: aixecar o donar un toc de fre amb el peu esquerre en entrar al gir, amb el punt de fre de mà de l'altra volta quan només ella l'ha usat, o el fre de mà en una revolta més lenta de 15 m/s (54 km/h).
- **L'ha girat massa**: aquesta volta l'havia girat 12° o més i almenys **12°** més que l'altra: havia de ser redreçat abans que la potència pogués baixar.

**Un vol més llarg**: a l'aire 0,2 s o més que l'altra, i costant almenys 0,03 s des de 10 m abans de l'enlairament fins a 40 m després de l'aterratge (o la fi de la revolta). Abans del punt més lent és una causa d'entrada; es converteix en la història de la revolta quan explica el 40 % o més. El consell: mantén l'accelerador a l'enlairament, agafa la cresta una mica més lent o amb un toc de fre.

### La sortida {#the-start}

Abans de la primera revolta, en una sprint o quan una de les dues voltes ha començat parada (per sota de 5 m/s on les dues són les primeres a l'eix) o en una sortida de cursa (per sota del 60 % de la velocitat de l'altra), el tram fins al primer punt de frenada és una troballa pròpia (revolta 0) quan es diferencia en més de 0,03 s: *La sortida*, *La sortida de la cursa* o *Fins a la primera revolta*. Una pèrdua allà es posa a la situació (*context*) quan una volta ha començat en una sortida de cursa i l'altra a velocitat, al cotxe quan les voltes són en cotxes diferents, i al conductor en cas contrari. Consells: en un altre cotxe des de parat, "sobretot el cotxe"; una sortida parada en el mateix cotxe, surt amb menys patinatge i canvia al màxim de la banda de potència; una sortida de cursa, compara-la amb una altra primera volta; una sortida llançada, una millor sortida de l'última revolta es porta fins a la meta.

## La traçada recorreguda {#the-driven-line}

`lineMetrics`, per volta i segment (no per als complexos mixts), només a partir de les posicions (suavitzades ±2 mostres) sobre la finestra de la revolta:

| Mesura | Regla |
|---|---|
| curvatura | canvi de rumb sobre ±8 m de la pròpia traçada de la volta |
| **radi més tancat** | 1 / la curvatura màxima |
| **entrada al gir** / **sortida del gir** | on la curvatura supera per primer cop / per última vegada una cinquena part del seu pic |
| **mitjà** | on la volta havia girat la meitat del seu canvi de rumb |
| radi d'entrada / sortida | metres recorreguts sobre la meitat del canvi de rumb, abans / després del mitjà |
| **forma** | radi més tancat sobre el radi mitjà mentre gira: per sota de **0,55** una **V**, per sobre de **0,75** una **U**, entre mig "U/V" |
| **vèrtex** | radi de sortida sobre radi d'entrada: per sobre d'**1,25** tard, per sota de **0,8** d'hora, si no mitjà |
| **vèrtex de velocitat** | el punt més lent més de 15 m abans del mitjà: lenta a l'entrada, ràpida a la sortida; més de 15 m després: encara frenant passat el mitjà |

Contra l'altra volta: quant per dins (+) o per fora ha anat a l'entrada al gir, pel tram més tancat i on les dues anaven planes (dit des de 1 m); on ha entrat al gir cadascuna (dit des de 8 m).

### Quina traçada convé a aquest cotxe aquí {#which-line-suits-this-car-here}

`lineFor`, a partir de cap on porta la revolta i del caràcter del cotxe en aquesta revolta:

- **potència-adherència** = l'acceleració a acceleració total del cotxe a la velocitat de sortida dividida per la seva adherència a la velocitat mínima (a partir de la seva envolupant). **Point and shoot** a **0,45** i més; **momentum** a **0,25** i menys.
- **aerodinàmica**: adherència a 151-252 km/h dividida per l'adherència a 54-108 km/h de **1,15** o més, per a una revolta presa a **144 km/h** (40 m/s) o més ràpid: aleshores és una revolta de momentum, sigui quina sigui la potència. No es jutja en terreny solt.

| Tipus de revolta | Cotxe | Traçada |
|---|---|---|
| després d'una recta | point and shoot / altre | V / U, vèrtex al mig: "la zona de frenada és el premi" |
| entre dues rectes | momentum / altre | U / V, vèrtex tard |
| enllaç | momentum / altre | U / V, vèrtex al mig: "conduu-la per la sortida de la següent" |
| cap a una recta | momentum (o una revolta ràpida d'aerodinàmica) | U rodona i ampla, vèrtex una mica tard |
| cap a una recta | point and shoot | V: frenar recte, girar tard, fer rotar en un centre curt i tancat, recta i a fons aviat |
| cap a una recta | intermedi | U amb vèrtex tard: lent a l'entrada, ràpid a la sortida |

On la sortida importa (cap a una recta, entre dues), la transmissió afegeix una frase: **FWD** - fes-lo rotar amb els frens, afegeix potència només quan la roda es desenrotlla; **RWD** amb una potència-adherència de 0,35 o més - redreça'l abans de l'acceleració total; **AWD** - pot prendre potència encara girant. En terreny solt, cada traçada afegeix: gira el cotxe en entrar.

La frase diu després què ha conduït la volta, i si s'hi ajusta: *el més lent tard lliga la sortida* o *un vèrtex d'hora lliga la sortida* quan es volia un vèrtex tard i la volta ni el va fer tard ni va ser la més lenta d'hora; *més arrodonit del que aquest cotxe vol* quan es volia una V; *més quadrat del que aquest cotxe vol* quan es volia una U; en cas contrari, *això encaixa*.

## Per a desenvolupadors {#for-developers}

Codi: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
El raonament i les seves fonts: [el mètode](race-analytics.md).
