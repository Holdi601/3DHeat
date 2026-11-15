---
title: "Estadístiques del recorregut"
parent: "Anàlisi de curses"
nav_order: 57
lang: "ca"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Estadístiques del recorregut

Carregueu moltes voltes d'un mateix recorregut i el visor compta els errors: quin revolt costa més temps, en quantes de les voltes s'hi va fer malament, i per què. Useu-lo per trobar el revolt que val la pena practicar.

Proveu-ho: **Voltes de demostració** dona tres voltes, prou perquè aquesta secció aparegui.

![Estadístiques del recorregut amb el mapa d'errors: la pista pintada segons quantes voltes perden temps en cada revolt, i la llista de revolts](../assets/img/en/race-course-mistake-map.webp)

Carregueu la carpeta sencera d'un recorregut -desenes de voltes, diversos cotxes, diverses classes de rendiment- i cada volta es jutja i després es compta. Aquesta pàgina tracta de la comparació per classe, de què es considera un error, de la secció **Estadístiques del recorregut**, del mapa d'errors, de l'exportació al mapa de calor, dels recorreguts de diverses pistes i dels límits de rendiment amb moltes voltes.

## Contra el millor de la seva pròpia classe {#against-the-best-of-its-own-class}

Una volta es compara revolt a revolt amb la **volta completa més ràpida de la seva
pròpia classe de rendiment** (la de referència, de la classe de la referència);
aquella mateixa volta amb qui de la seva classe va ser el més ràpid en cada revolt,
o amb totes les voltes quan és sola a la seva classe. Els cotxes s'agrupen per la
classe de rendiment del joc (en Forza, de la D a la X; la C i la S2 n'són dues).
El punt de frenada d'un cotxe de classe C comparat amb el d'un de S2 no diu res
sobre la conducció. El mapa de temps, les diferències a la llista de voltes i la
taula *Revolt a revolt* segueixen la mateixa comparació (vegeu [amb qui es compara
cada volta](race-corner-analysis.md#who-each-lap-is-compared-with)).

Les estadístiques es construeixen sobre l'anàlisi de cada volta, no al costat.

## Què es considera un error {#what-counts-as-a-mistake}

Una **ocurrència** és l'error d'una volta en un revolt (segment). Els errors d'una
volta en un revolt són:

1. **La causa de conducció** que l'anàlisi va trobar per a la seva pèrdua allà -una
   troballa que és una pèrdua, atribuïda al pilot (no al cotxe ni a la situació),
   que costa **0,05 s** o més respecte a la seva volta de comparació. El seu cost és
   la pèrdua del revolt.
2. **Cada fallada de control del cotxe** que va fer allà i que l'altra volta no va
   fer (no compartida), que costa **0,03 s** o més -bloqueig, patinada de les rodes,
   el darrere que es descontrola, empenta, trompada. El seu cost és el de
   l'esdeveniment mateix.
3. **Cada cop i cada xoc**, compartits o no, sigui quin sigui el cost.

En un mateix revolt poden haver-n'hi diversos; cada tipus es compta **una vegada per
volta i revolt**. Els guanys, la part del cotxe i una arribada més lenta decidida en
el revolt anterior no són errors.

### De les troballes als errors {#from-findings-to-mistakes}

| Troballa | Error |
|---|---|
| massa ràpid a l'entrada, lent a la sortida, per frenar més de pocs metres més tard que l'altra | Va frenar massa tard |
| va frenar aviat | Va frenar massa aviat |
| va frenar suaument | Va frenar massa suaument |
| un bloqueig com a causa | Va bloquejar una roda |
| va deixar rodar el cotxe | Va deixar rodar el cotxe |
| agafa grip de sobra, més lent fins al vèrtex, va frenar on l'altre només aixecava el peu | Massa lent pel mig |
| una línia massa tancada | Línia massa tancada |
| empès cap a fora | Empès cap a fora |
| va girar el cotxe menys / massa | Va girar el cotxe malament |
| va trepitjar l'accelerador més tard, a gas total més tard, va dubtar | Acceleració tardana |
| més lent en sortir del revolt | Més lent a la sortida |
| patinada de les rodes | Patinada de les rodes |
| el darrere es va descontrolar, de costat pel mig | El darrere es va descontrolar |
| va sortir de la trajectòria | Va sortir de la trajectòria |
| va perdre velocitat | Va perdre velocitat |
| va aixecar el peu (a l'entrada, o a la recta) | Va aixecar el peu |
| gairebé aturat, un trompo, un cop o un xoc com a causa | Va trompar / Va topar amb alguna cosa / Va xocar quan els esdeveniments de la volta allà ho diuen (primer xoc, després trompo, després cop); en cas contrari, Gairebé aturat |
| un vol més llarg | Va volar massa lluny |

Els dos patrons es compten per la causa que s'hi troba, segons la mateixa taula.
*Va cedir més a l'entrada del que la sortida va recuperar* és l'error de la seva
causa: frenar aviat és *Va frenar massa aviat*, un bloqueig *Va bloquejar una roda*,
deixar rodar *Va deixar rodar el cotxe*, grip sense usar *Massa lent pel mig*. *Massa
ràpid a l'entrada, lent a la sortida* és *Va frenar massa tard* quan la volta va
frenar més tard que l'altra; en cas contrari, l'error de la causa de la seva sortida
-*Acceleració tardana*, *Patinada de les rodes*, *El darrere es va descontrolar*, *Va
sortir de la trajectòria*, *Més lent a la sortida*. Un patró la causa del qual és el
cotxe, o una arribada més lenta, no es compta.

No es compten: l'arribada més lenta, la sortida, cada troballa del *cotxe* (tirada,
grip, frens, tracció) i cada guany o revolt de nivell.

### Els tipus, en el seu ordre {#the-kinds-in-their-order}

Frenada: *Va frenar massa tard*, *Va frenar massa aviat*, *Va frenar massa
suaument*, *Va bloquejar una roda*. Entrada: *Va deixar rodar el cotxe*, *Massa lent
pel mig*, *Línia massa tancada*, *Empès cap a fora*, *Va girar el cotxe malament*.
Sortida: *Acceleració tardana*, *Més lent a la sortida*, *Patinada de les rodes*, *El
darrere es va descontrolar*, *Va sortir de la trajectòria*, *Va perdre velocitat*.
Recta: *Va aixecar el peu*. Incidents: *Va trompar*, *Va topar amb alguna cosa*, *Va
xocar*, *Gairebé aturat*, *Va volar massa lluny*.

## La secció Estadístiques del recorregut {#the-course-statistics-section}

Es mostra a partir de **3** voltes, entre **Voltes** i **On millorar**.

- **El resum**: "40 voltes amb 9 cotxes, 3 classes: cada revolt jutjat contra la volta
  més ràpida de la seva pròpia classe." (els cotxes es compten pel número de cotxe, o
  pel nom).
- **Pastilles de classe** (amb diverses classes): **Tot** i una pastilla per classe,
  cadascuna amb el seu nombre de voltes, en l'ordre del joc (D, C, B, A, S1, S2, R, X, i
  després les altres). Feu clic en una classe per veure només les seves voltes;
  **Majúscules+clic** n'afegeix o n'lleva una. Tot el que hi ha a sota -les llistes, el
  mapa, l'exportació al mapa de calor- segueix les classes triades.
- **El que falla més**: cada tipus d'error, primer les voltes amb més (després les
  vegades, després el cost), com a màxim 8 (**Tots els N tipus** mostra la resta;
  **Menys** les amaga de nou). Cada fila: el seu nom, "N de M voltes", una barra d'aquella
  proporció, i "K vegades · uns X s · més a T3 (5), T7 (4), T1 (2)" -quantes vegades es
  va fer (per volta i revolt), quant va costar en total, i els tres revolts on més voltes
  el van fer. **Feu clic a una fila** per mostrar-la al mapa d'errors (i activar el mapa);
  feu clic de nou per veure tots els errors.
- **Revolt a revolt** (o *Revolt a revolt - <error>* amb un triat): per segment, "N de M
  van perdre temps · X s" -les voltes que van fer tot el revolt, les que hi van perdre
  **0,05 s** o més respecte a la millor de la seva classe, i tot el temps que hi van
  perdre. Plegat, enumera els tres errors més freqüents amb el nombre de voltes. **Feu
  clic en un revolt** per obrir-lo, enquadrar-lo amb la càmera i passar al mapa
  d'errors: per a cada error (o només el triat) una línia com "12 de 40 voltes van
  frenar massa aviat aquí. En 9 cotxes diferents -uns 0,21 s cada un-." i les voltes que
  el van fer, **la pitjor primer**, cadascuna amb el seu cost -com a màxim 8, "+N més"
  per a la resta. **Feu clic en una volta** per enfocar-la i repetir aquell error (alineat
  40 m abans).
- **Mostra al mapa de calor**: vegeu més avall. "Construint el mapa de calor…" mentre
  s'executa; desactivat quan no hi ha errors.

## El mapa d'errors {#the-mistake-map}

**Vista → Mapa d'errors** pinta al llarg del camí de referència quantes de les voltes
(de les classes triades) van fer un error a cada metre -de tots els tipus, o del triat
a les estadístiques. Cada volta compta una vegada per metre; el rang de cada
ocurrència (on hi era la seva causa o esdeveniment) s'amplia 6 m a cada costat perquè
una de curta es vegi. És més ample i més brillant on hi va haver més voltes: amplada
`3 + 10 · (voltes aquí / més voltes en qualsevol lloc)` metres, color de marró fosc a
taronja brillant; una franja grisa de 2 m on no n'hi va haver cap. Llegenda: *poques
voltes ↔ més voltes*.

Amb **Etiquetes** activades, el vèrtex de cada revolt porta el seu error més freqüent:
"T3 · 12/40 frenada aviat" (voltes que el van fer / voltes que van fer el revolt),
"T3 · 12/40" amb un tipus triat, "T3 · net" sense cap. Si passeu el ratolí per sobre
d'una etiqueta es llisten les pèrdues del revolt i els seus cinc errors més freqüents;
fer-hi clic obre o tanca aquell revolt a les estadístiques.

## Mostra al mapa de calor {#show-in-the-heatmap}

**Mostra al mapa de calor** passa el mateix a la pestanya de mapa de calor com a
conjunt de dades anomenat "Errors a <pista>" (o "Errors al recorregut"), de manera que
tot el conjunt d'eines del mapa de calor -modes de calor, filtres, la línia de temps,
les llesques- funciona sobre on les voltes s'equivoquen.

És un CSV construït a la memòria (`mistakeTable`), una fila per cada punt de la
quadrícula (cada 2 m) de cada ocurrència, a la **posició pròpia de la volta** en
aquell punt:

| Columna | Contingut |
|---|---|
| `x`, `y`, `z` | la posició de la volta en aquell metre (coordenades del joc) |
| `elapsed` | el temps de la volta allà, s |
| `lap` | l'etiqueta de la volta |
| `car` | el nom del cotxe (o "car 1234") |
| `mistake` | el nom de l'error, en l'idioma actual |
| `car_class` | la classe, `-` quan no n'hi ha |
| `corner` | l'etiqueta del revolt, `T3` |
| `cost` | el cost de l'ocurrència, s |

Es carrega amb el carregador propi del mapa de calor amb pistes d'assignació: Y amunt,
sense girs d'eixos, escala 1; el temps `elapsed` en segons; **persona** = `car`,
**grup** = `mistake`, **sessió** = `lap`; sense direcció de mirada; `car_class`,
`corner` i `cost` es conserven com a columnes de filtre. La pestanya passa després a
**Mapa de calor** i enquadra les dades. Només s'exporten les classes triades a les
estadístiques.

## Recorreguts de diverses pistes {#courses-from-several-tracks}

Les voltes s'analitzen **un recorregut cada vegada**. Una carpeta amb les voltes de
diversos recorreguts -tota la biblioteca de voltes- ofereix cada recorregut per
carregar-lo sol (amb el seu nombre de voltes, primer el de més); les voltes de curses
que mai no van acabar (`unfinished/` de FH Companion) van amb el seu recorregut, marcades
com a *parcials*. Les voltes de diverses pistes amb nom triades com a fitxers
s'ofereixen de la mateixa manera, i les voltes sense nom de pista van amb la que es triï.
Carregar voltes d'una altra pista amb nom que les carregades en substitueix les
existents. Detalls: [Carregar voltes](race-loading-laps.md#folders-and-courses).

## Rendiment amb moltes voltes {#performance-with-many-laps}

Desenes de voltes s'analitzen en un segon o dos (sempre totes). El que es dibuixa
està limitat perquè la vista es mantingui a la velocitat de fotogrames:

| Límit | Valor | Efecte |
|---|---|---|
| voltes dibuixades per defecte | 8 (`SHOW_ALL_UP_TO`) | a partir de 8 voltes carregades, les noves s'amaguen tret que siguin la referència, la volta enfocada o la millor de la seva classe. **Mostra-ho tot** les dibuixa totes; **Només les que mires** torna enrere. Enfocar una volta la fa tornar a mostrar, juntament amb la millor de la seva classe |
| cotxes simples i línies fines | més de 10 de visibles (`PLAIN_PAST`) | les voltes que no són el focus, el cotxe perseguit i la referència: un punt de línia cada 6 m (en lloc de cada 1,5 m), cotxes dibuixats sense detalls |
| voltes en gràfic | 8 (`CHART_LAPS`) | el focus, la millor de la seva classe i la referència primer; "+N més dibuixades, no en gràfic" |
| targetes del HUD | 6 | les sis primeres voltes visibles |
| estadístiques | a partir de 3 voltes | la secció s'amaga per sota d'aquest nombre |
| troballes llistades | 12 de pilot, 8 de cotxe/context, 10 de guanys | per volta enfocada |
| parelles de cotxes mostrades | 3 | a partir de 3 parelles, una parella amb un selector |

Les ocurrències d'errors es calculen una vegada per anàlisi i es guarden a la memòria
cau; la densitat del mapa d'errors es guarda a la memòria cau per selecció de classe i
per error.

## Per als desenvolupadors {#for-developers}

Codi: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` a [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
