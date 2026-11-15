---
title: "Perfils de cotxe i comparació"
parent: "Anàlisi de curses"
nav_order: 56
lang: "ca"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Perfils de cotxe i comparació

Un cotxe només pot frenar, girar i accelerar amb una certa força. El visor mesura quina força a partir de les teves pròpies voltes, així que mai no et diu que facis alguna cosa que el teu cotxe no pot fer. Això també explica quina part d'un segon perdut va ser culpa del cotxe i no teva.

![Cotxes comparats: dos cotxes un al costat de l'altre amb la seva adherència, frenada i empenta](../assets/img/en/race-cars-compared.webp)

L'anàlisi només diu a una volta que freni més fort, que porti més velocitat o que accelerI abans quan el seu cotxe ho ha demostrat, i treu d'una pèrdua el que els propis cotxes en expliquen. Per això els límits de cada cotxe (la seva *envolupant*, a sota) i el seu caràcter (el seu *perfil*) es mesuren a partir de cada volta carregada del cotxe. Aquesta pàgina tracta l'envolupant, el perfil, la secció **Cotxes comparats**, i què decideixen els cotxes a cada revolt.

**Un cotxe** = les voltes amb el mateix número de cotxe (o nom, sense número) i el mateix índex de rendiment: un ajust diferent és un cotxe diferent.

## L'envolupant: què pot fer el cotxe a cada velocitat {#the-envelope-what-the-car-can-do-at-each-speed}

Per cotxe, sobre cada volta carregada, en **franges de velocitat de 5 m/s** (24 franges, fins a 120 m/s). Les mostres a l'aire, l'assentament durant 0,3 s després d'un aterratge, i des de 0,1 s abans de cada impacte fins a 1 s després, queden fora, i les acceleracions de 80 m/s² o més s'ignoren (per sobre del que aguanta qualsevol cotxe amb càrrega aerodinàmica).

| Envolupant | Mostres | Valor per franja | Necessita |
|---|---|---|---|
| **adherència lateral** | l'acceleració lateral **mantinguda durant mig segon** (la mitjana del seu valor absolut sobre una finestra centrada de 0,5 s), només quan el cotxe prenia una corba: almenys una tercera part del percentil 99 de tot ell | percentil 95 | 6 mostres |
| **frenada** | fre > 0,3; l'acceleració longitudinal com la mediana de cada mostra i els seus dos veïns | percentil 95 de la desacceleració | 4 mostres |
| **empenta a accelerador total** | accelerador > 0,95, fre per sota de 0,05; la mateixa mediana de tres | percentil 90 | 4 mostres |

Per què mantinguda durant mig segon: una vora, un lliscament que es recupera de cop, un cotxe que es corregeix, tots fan pujar l'acceleració lateral un moment, i un cotxe que ho fa sovint semblava més adherent del que és. Per què la mediana de tres: amb una separació de cinc metres una mostra és molt de camí, i un pic d'una sola mostra és una vora, un bony o un mur.

Llegir l'envolupant a una velocitat interpola entre els centres de les franges, i pren la franja més propera amb dades quan una franja és buida.

**Sobre dos tipus de terreny.** Quan les voltes d'un cotxe van conduir una cinquena part o més de les seves mostres sobre asfalt i també sobre terreny solt, es guarda una envolupant separada per a cadascun, i cada corba es jutja amb el terreny sota el cotxe en el seu punt més lent.

**Creuament.** La velocitat a partir de la qual l'empenta cau com `1/v` (limitada per potència) en lloc de mantenir-se plana (limitada per tracció): la primera franja on el seu `a·v` està dins del 15% del `a·v` més alt vist.

## El perfil: quin tipus de cotxe és {#the-profile-what-kind-of-car-it-is}

`profile`, a partir de les mateixes voltes (mostres a terra, no impactades, més de pressa de 8 m/s):

| Mesura | Com |
|---|---|
| **adherència mantinguda** (m/s²) | percentil 95 de l'acceleració lateral mantinguda de mig segon |
| **empenta** fins a 50 km/h, 50-120, 120-200, per sobre de 200 (m/s²) | la mitjana de l'empenta a accelerador total de l'envolupant entre 3-14, 14-33, 33-56 i 56-90 m/s, a les velocitats que el cotxe va arribar (fins a la seva més ràpida + 2 m/s), a partir d'almenys tres passos d'1 m/s; i la més gran que va mostrar, i on |
| **frenada** (m/s²) | la frenada de l'envolupant, mitjana entre 60 i 160 km/h (16,7-44,4 m/s), la banda que nomena la comparació |
| **més ràpid** | la velocitat més alta que va arribar |
| **toca sostre a** | on va deixar de guanyar a accelerador total en una recta (a sota) |
| **encara empenyent a la més ràpida** | l'empenta de l'envolupant a la seva velocitat més alta: quant li quedava encara |
| **cua agafada, per volta** | vegades per volta que va lliscar i s'havia de corregir (a sota) |
| **part amb accelerador** | d'aquelles, la part que va començar amb accelerador > 0,5 i sense fre |
| **deixa anar a** | la mediana de l'acceleració lateral mantinguda 0,15 s abans de cada lliscament, com a part de l'adherència |
| **per sobre de 10° de deriva, en revolts forts** | de les mostres en revolt a un 60% de la seva adherència o més, la part que llisca (10° en asfalt, 20° en solt); cal 30 mostres |
| **deriva mitjana** | sobre les mateixes mostres |
| **equilibri** | angle de lliscament davanter menys posterior (múltiples del pic nominal) en revolts forts i sense lliscar, mitjana d'almenys 30 mostres: + empeny cap enfora |
| **superfície** | sobre el 80% de mostres soltes: solt; per sota del 20%: asfalt; si no, mixt |

**Tocar sostre.** Una mostra compta quan el segon al seu voltant (±0,5 s, almenys 0,9 s de dades) va ser tot a accelerador total (> 0,95, sense fre), a terra, i conduïda **recta** (|lateral| per sota del més gran entre 4 m/s² i un quart de la seva adherència), guanyant menys de **0,35 m/s²**, més de pressa de 25 m/s i dins del 90% de la més ràpida de la volta - l'accelerador a fons per una costa o per una corba llarga també deixa de guanyar, molt per sota de la velocitat punta del cotxe. Amb almenys **un segon** d'aquest plafó sobre totes les voltes, la mediana d'aquelles velocitats és on toca sostre. Si no, no hi ha velocitat punta: quan cap recta no era prou llarga, *encara empenyent a la més ràpida* diu com de lluny estava. Cap suposició més enllà del que mostren les voltes: el desenvolupament i el limitador acaben l'empenta d'un cotxe molt abans que l'arrossegament.

**Perdre la cua.** Es compta quan el pilot l'havia de corregir: revoltant a un 60% de la seva adherència o més, lliscant (deriva per sobre de 10° en asfalt, 20° en terreny solt), amb el volant (per sobre de 0,06) girat **en contra** de la corba. Quin signe del volant concorda amb quin signe de la força de la corba es mesura per volta (mostres que giren sense lliscar). Un lliscament es compta una vegada fins que el cotxe deixa de lliscar. Un cotxe conduït una mica de costat a propòsit no perd res; un que necessita contravolant sí. Es compta igual per a cada cotxe, perquè dos cotxes es puguin comparar. Necessita volant i un angle de deriva.

## Cotxes comparats {#cars-compared}

La secció de la barra lateral és **El cotxe** amb un cotxe, **Cotxes comparats** amb diversos.

**La taula**: una columna per cotxe, una fila per cada mesura que algun cotxe té un valor: Adherència mantinguda; Empenta fins a 50 km/h, 50-120, 120-200, per sobre de 200; Frenada; Més ràpid; Toca sostre a («encara empenyent» quan mai no el va tocar); Encara empenyent a la més ràpida; Cua agafada, per volta; Per sobre de 10° de deriva, en revolts forts. Quan els cotxes es diferencien en més d'un 3%, es marca el millor valor (més alt per a adherència, empenta, frenada, velocitats; més baix per a lliscaments de cua).

**Un sol cotxe**: frases sobre el que les voltes mostren que és - l'adherència que manté (m/s² i g), la seva empenta a cada banda, on va deixar de guanyar a les rectes llargues (o que mai no va tocar sostre, i què encara empenyia a la més ràpida), i amb quina freqüència la seva cua necessitava correcció («gairebé mai» per sota d'una vegada per volta, «sobretot amb accelerador» quan el 60% o més hi començava).

**Dos cotxes**: per a cada parella, una frase per cada cotxe sobre com és respecte a l'altre («X accelera millor, però no pot girar tan fort, triga més a parar i perd la cua més fàcilment»), la taula, cada diferència clara més gran primer, i després **Com pilotar cadascun**. Amb més de **3** parelles, es mostra una sola: el cotxe de la volta seleccionada contra un cotxe triat d'un desplegable (per defecte el cotxe de la millor volta de la seva classe, si no el de la referència, si no el primer altre).

Una diferència només es diu quan les voltes la mostren clarament:

| Diferència | Dita a partir de | Frase |
|---|---|---|
| adherència | **4%** | «X manté un N% més d'adherència a les corbes … això és un M% més de velocitat pel mig de cada corba» (velocitat = √ de la proporció d'adherència) |
| empenta | **5%**, en la primera banda que tots dos cotxes tenen de 120-200, 50-120, per sobre de 200 km/h | «X accelera un N% més fort de 120 a 200 km/h»; també a la sortida, o «tot i que Y surt de la línia amb més força», quan la sortida difereix un 8% |
| velocitat punta | **4 km/h** | «X toca sostre més alt: va deixar de guanyar a …» |
| velocitat punta, només un | un cotxe va tocar sostre, l'altre no | «Y es va quedar sense empenta a …; X encara guanyava quan va frenar» |
| velocitat punta, cap | cap dels dos no toca sostre | a què guanyava encara cadascun a la seva més ràpida |
| frenada | **5%** | «X para un N% més fort … Y ha de frenar abans» |
| perdre la cua | almenys una vegada per volta més **i** la meitat de vegades més sovint | «X perd la cua més fàcilment: va lliscar prou per necessitar contravolant N vegades per volta contra M …» - sobretot amb accelerador (60% o més) o sobretot girant i alleugerint (30% o menys), des d'aproximadament P% de la seva adherència; en terreny solt «part d'això és com es gira un cotxe; la correcció no» |
| de costat | **12 punts percentuals** de revolts forts per sobre del llindar de deriva | «X circula més de costat al límit» |
| equilibri davanter | **0,3** del pic nominal | «X empeny més pel davant … Cal alentir-lo i girar-lo abans del vèrtex» |

Els trets del resum: *manté més adherència* / *no pot girar tan fort*, *accelera millor* / *empeny menys*, *toca sostre més alt* / *toca sostre més baix*, *encara empeny al final de les rectes* / *es queda sense empenta*, *frena més fort* / *triga més a parar*, *és més estable* / *perd la cua més fàcilment* (*és molt més relliscós …* amb el doble de vegades més una; *cal corregir-lo més sovint* en terreny solt), *empeny pel davant*. «Poc a dir-ne respecte a Y en aquestes voltes» quan no n'hi ha cap.

**Com pilotar cadascun:**

- un cotxe té més adherència i l'altre més empenta: porta velocitat pel mig en una línia ampla i rodona (la «U») amb el cotxe adherent; frena en línia recta, gira-la en un mig curt i tancat i endreça la sortida (la «V») amb el fort;
- un cotxe va per darrere en tots dos: la seva millor volta és la més neta - frena recte, el radi més ampli, accelerador a fons tan aviat com aguanti;
- un cotxe que perd la cua més fàcilment: dosifica l'accelerador només a mesura que el volant es desfà i fes marxes curtes (lliscaments amb accelerador), o deixa anar el fre amb suavitat i mantén un accelerador estable pel mig (lliscaments a l'entrada).

La pista sota la secció repeteix com es mesura cadascuna.

## Què decideixen els cotxes en una corba {#what-the-cars-decide-in-a-corner}

Quan les voltes són en cotxes diferents, la conclusió de cada corba perduda acaba amb **Els cotxes:** - què en decideixen els cotxes, i com treure'n el màxim d'aquest (`carNote`):

- **Pel mig**, quan aquest cotxe manté menys del 96% de l'adherència de l'altre, l'altre anava més de 0,5 m/s més de pressa en el seu punt més lent, i aquesta volta no estava gaire per sota del que explica la seva adherència (per sobre del 70% d'ella): a la línia de l'altre cotxe, l'adherència d'aquest permet `v_altre · √(adherència_meva / adherència_altre)`. Si la volta la va dur (dins d'1 m/s) la diferència és el cotxe, i cap punt de frenada la canvia; si menys, quant encara hi ha per guanyar. Després, on es pot guanyar el temps en canvi: a una recta, entre dues, o en un cotxe que empeny un 5% més fort - després del vèrtex (frena recte, gira més tard, apunta cap a la sortida aviat); si no, el radi més ampli que permet la carretera.
- **Una cua que es va escapar aquí** (un lliscament o un trompo no compartit, o una deriva per sobre del llindar de lliscament a l'entrada), en un cotxe que la perd almenys una vegada per volta més i la meitat de vegades més sovint: què fer en aquest cotxe - l'accelerador dosificat a mesura que el volant es desfà (els seus lliscaments comencen amb potència el 60% o més del temps) o el fre deixat anar amb suavitat sense alleugerir.
- **La recta després**: quan l'empenta dels cotxes explicava 0,03 s o més, l'empenta més forta de l'altre cotxe des de la mateixa velocitat, amb l'empenta dels dos cotxes de 120 a 200 km/h.
- **Velocitat punta**: quan aquesta volta va arribar al 98% d'on toca sostre el seu cotxe en una recta de més de 150 m, i l'altre va anar 1,5 m/s més de pressa: aquesta és la velocitat punta del cotxe, i cada km/h més a la sortida de la corba encara ajuda fins a arribar-hi.
- **Frenada**: quan l'altre cotxe frena un 5% més fort i aquesta volta va frenar més de 5 m abans, que part de la frenada anticipada és del cotxe.

La part del cotxe també es treu del propi temps - vegeu [la part del cotxe](race-corner-analysis.md#the-cars-share) - i una corba on el cotxe explica el 60% o més s'atribueix al cotxe.

## Per a desenvolupadors {#for-developers}

Codi: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` a [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` a [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
