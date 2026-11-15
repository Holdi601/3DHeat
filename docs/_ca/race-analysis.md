---
title: "Anàlisi de curses"
nav_order: 14
has_children: true
lang: "ca"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# Anàlisi de curses

Has conduït el mateix circuit dues vegades. La pestanya **Anàlisi de curses** reprodueix les dues conduccions juntes en 3D, mostra on una volta anava més lenta i t'explica per què. Encara no tens voltes? Prem **Voltes de demostració**.

![La pestanya Anàlisi de curses amb voltes de demostració: la barra lateral amb Voltes i On millorar, els cotxes sobre el circuit, els gràfics sota la vista](../assets/img/ca/race-analysis-overview.webp)

La pestanya compara dues o més voltes d'un mateix recorregut. Comparteix el llenç, la càmera i el model del recorregut carregat (**Fons / nivell**) amb el mapa de calor; tota la resta és seu: la seva pròpia barra lateral i la seva pròpia barra sota la vista. Paraules com *volta*, *referència* i *vèrtex* són al [glossari](glossary.md).

Aquesta pàgina és el mapa de la pestanya. Cada part té la seva pròpia pàgina:

| Pàgina | Què cobreix |
|---|---|
| [Carregar voltes](race-loading-laps.md) | cada format de fitxer, carpetes i recorreguts, noms de cotxe, voltes de demostració, la llista de voltes, la referència i el focus |
| [Repetició i l'escena 3D](race-replay-and-scene.md) | la barra de transport, els tres modes de repetició, alinear els cotxes, la càmera de persecució, les línies, els mapes, els cotxes, les etiquetes, els mons emmirallats |
| [Gràfics i HUD](race-charts-and-hud.md) | els gràfics de distància, el selector de gràfics, el pas del ratolí i el zoom, les fitxes dels cotxes, la taula de canals |
| [Esdeveniments de control del cotxe](race-control-events.md) | blocatges, patinatge de les rodes, sobreviratge, trompades, subviratge, impactes, xocs, ABS/TC, fre de mà, aire -com es detecta cada un, amb tots els llindars |
| [Anàlisi revolta a revolta](race-corner-analysis.md) | alineació per distància, revoltes i segments, el compte de temps d'una revolta, cada causa i l'ordre en què es proven, la forma de la línia i el consell |
| [Perfils de cotxe i comparació](race-car-profiles.md) | què pot fer cada cotxe, mesurat a partir de les seves voltes; *Cotxes comparats*; què decideix el cotxe a cada revolta |
| [Estadístiques del recorregut](race-course-statistics.md) | moltes voltes d'un mateix recorregut: errors per revolta i per tipus, el mapa d'errors, l'exportació del mapa de calor, els límits de rendiment |
| [Analítica de curses: el mètode](race-analytics.md) | la recerca darrere de les regles, amb fonts |
| [Altres jocs de curses](other-games.md) | què fa el visor amb les voltes de cada joc: lliscament i deriva calculats quan un joc no els envia, mons emmirallats, els canals extra |

## La pantalla {#the-screen}

**Barra lateral**, de dalt a baix (les seccions es poden plegar):

1. **Voltes** - carregar, llistar, mostrar/amagar, referència, focus, persecució.
   Vegeu [Carregar voltes](race-loading-laps.md).
2. **Estadístiques del recorregut** - només a partir de tres voltes carregades.
   Vegeu [Estadístiques del recorregut](race-course-statistics.md).
3. **On millorar** - les troballes de la volta enfocada, revolta a revolta.
   Vegeu [Anàlisi revolta a revolta](race-corner-analysis.md).
4. **Revolt a revolt** (o *Revolt a revolt - classe X* amb diverses classes) - la volta més ràpida per cada revolta i la seva línia. Es mostra amb dues o més voltes.
5. **Control del cotxe** - els blocatges, lliscades, empenyes i impactes de la volta enfocada.
   Vegeu [Esdeveniments de control del cotxe](race-control-events.md).
6. **Cotxes comparats** (o **El cotxe** amb un sol cotxe) - vegeu [Perfils de cotxe i comparació](race-car-profiles.md).
7. **Vista** - quin mapa es pinta sobre el circuit i què es dibuixa.
   Vegeu [Repetició i l'escena 3D](race-replay-and-scene.md).
8. Els panells compartits **Fons / nivell** i **Càmera i escena** (model del recorregut, inversió d'eixos, càmera) -documentats amb el mapa de calor i a [Càmera](camera.md).

**La vista** mostra el recorregut, les línies conduïdes, el mapa, els cotxes, les etiquetes fixades al circuit, i fins a sis fitxes de cotxe a dalt a l'esquerra (vegeu [Gràfics i HUD](race-charts-and-hud.md)). Sense voltes carregades diu «No hi ha voltes carregades - Deixa anar aquí dos o més fitxers de volta, o carrega les voltes de demostració des de la barra lateral.»

**La barra sota la vista** conté el transport de la repetició i, tret que s'amagui, els gràfics de distància.

## Inici ràpid {#quick-start}

1. Obre la pestanya **Anàlisi de curses** (al costat de **Mapa de calor** a la part superior de la barra lateral).
2. Carrega voltes. Prem **Voltes de demostració** per veure què fa la pestanya amb tres voltes inventades. Per a les teves pròpies voltes, grava-les primer ([formats de fitxer i gravadors](race-loading-laps.md#file-formats)), després prem **Carrega fitxers de volta…** o **Carpeta…**, o deixa caure fitxers o carpetes sobre la vista.
3. La volta completa més ràpida es converteix en la referència; la volta més lenta de les altres és la enfocada. Fes clic a qualsevol volta de la llista per enfocar-la; ★ fa que una volta sigui la referència.
4. Llegeix **On millorar**. Fes clic a una troballa: els cotxes s'alineen 40 m abans, la càmera l'enquadra, la repetició la reprodueix i s'obren les mesures.
5. Posa el ratolí sobre els gràfics per moure cada cotxe fins a aquell metre; Majúscules+clic per alinear-los allà.

## Teclat {#keyboard}

Mentre la pestanya de curses és oberta:

| Tecla | Fa |
|---|---|
| **K** | reprodueix / pausa la repetició |
| **Inici** | torna a l'inici de la repetició |
| tecles numèriques | res (al mapa de calor canvien de mode) |

Les tecles escrites en un camp de text o en un desplegable s'ignoren. Les tecles de càmera funcionen com al mapa de calor (**W A S D**, **Espai** amunt, **Q** avall, **Majúscules** més ràpid, **Alt** més lent, ratolí per mirar; tot a [Càmera](camera.md)); **F** enquadra les voltes carregades (com ho fa carregar voltes).

## Moltes voltes {#many-laps}

- Totes les voltes carregades s'analitzen i es compten; desenes triguen un o dos segons.
- A partir de **8** voltes (`SHOW_ALL_UP_TO`), les voltes afegides només es dibuixen quan són la referència, la volta enfocada o la millor volta de la classe de la volta enfocada. *Mostra-ho tot* / *Només les que es miren* ho canvien.
- A partir de **10** cotxes visibles (`PLAIN_PAST`), les voltes que no es miren (ni l'enfocada, ni el cotxe perseguit, ni la referència) es dibuixen amb línies aclarides a un punt cada 6 m en lloc de cada 1,5 m, i com a cotxes simples.
- Els gràfics dibuixen com a màxim **8** voltes; la HUD mostra com a màxim **6** fitxes.
- Les estadístiques del recorregut apareixen a partir de **3** voltes.

Detalls: [Estadístiques del recorregut](race-course-statistics.md#performance-with-many-laps).

## Configuració de vista per defecte {#default-view-settings}

| Configuració | Per defecte |
|---|---|
| Mapa | Mapa de temps |
| Línies conduïdes, Cotxes, Pneumàtics i suspensió, Etiquetes, Circuit a partir de les voltes | activat |
| Tots els valors de les fitxes | desactivat |
| Mida del cotxe | 1× |
| Gràfics | mostrats |
| Mode de repetició | Des de la línia |
| Velocitat de repetició | 1× |
| Bucle | activat |

Cap d'aquestes no es desa; en tornar a carregar, s'inicia amb els valors per defecte. Què es recorda al navegador: l'idioma, i els noms de cotxe après dels fitxers de volta (vegeu [Carregar voltes](race-loading-laps.md#car-names)).

## Per a desenvolupadors {#for-developers}

### Què passa quan es carreguen les voltes {#what-happens-when-laps-are-loaded}

Cada vegada que canvia el conjunt de voltes, la referència o l'idioma, es refà tota l'anàlisi (`analyse` a
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. S'afegeixen canals derivats a cada volta on el joc no els envia: angle de deriva, lliscament de les rodes a partir de les velocitats de les rodes, en l'aire, terreny solt, velocitat de guinyada ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. S'escull la referència i cada volta es projecta sobre el seu camí i es remostreja cada 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Es calcula a partir de les voltes si el món del joc és emmirallat ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Les revoltes es troben a la referència, i s'agrupen en segments d'una zona de frenada a la següent ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Per cotxe: la seva envolupant (adherència, frenada, tracció per velocitat), el seu perfil, les seves corbes de pneumàtic ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Per volta i segment: què ha fet (punt de frenada, punt més lent, accelerador a fons, ...) i la línia que ha conduït ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Per volta: els seus esdeveniments de control del cotxe, cadascun comparat amb la volta amb què es compara en aquell punt.
8. Per volta i segment: el compte de temps respecte de la seva volta de comparació i la troballa en paraules.
9. El mapa de temps i el mapa de causes per volta.

Els textos es produeixen en l'idioma actual; canviar d'idioma torna a fer l'anàlisi (i reanomena les voltes de demostració). Un error de l'anàlisi es mostra sota els botons de **Voltes** com a error i les voltes continuen carregades.

### Fitxers font {#source-files}

| Fitxer | Paper |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | lectura de fitxers de volta |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | el tipus de volta, els noms, les voltes de demostració |
| `src/race/derive.ts`, `handedness.ts` | canals derivats, mons emmirallats |
| `src/race/align.ts`, `segments.ts`, `line.ts` | eix de distància, revoltes, línies |
| `src/race/analysis.ts` | revoltes comparades, causes, troballes |
| `src/race/envelope.ts`, `profile.ts` | què pot fer un cotxe |
| `src/race/control.ts`, `impacts.ts` | control del cotxe, impactes i xocs |
| `src/race/stats.ts` | moltes voltes |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | repetició i dibuix |
| `src/race/schema.ts`, `graphs.ts` | la taula de canals, les files dels gràfics |
| `src/ui/race/*` | la barra lateral, els gràfics, la HUD, les etiquetes |
| `src/state/raceStore.ts` | l'estat de la pestanya i el rellotge de la repetició |
