---
title: "Carregar fitxers"
parent: "Carregar dades"
nav_order: 1
lang: "ca"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Carregar fitxers

Aquesta pàgina mostra com donar fitxers a 3DHeat i què en fa. Deixeu anar una carpeta, i tria els fitxers que tenen posicions i els fusiona en una sola imatge.

1. Obriu **Origen** a dalt de la barra lateral de la pestanya Mapa de calor.
2. Deixeu anar fitxers o una carpeta a la zona de deixar anar, o premeu **Fitxers…** o **Carpeta…**.
3. Llegiu la línia de selecció i l'**Estimació de memòria** (vegeu la imatge de sota).
4. Premeu **Carrega**.

![El panell Origen després de deixar anar una carpeta de deu partides: 1 la línia de selecció, 2 l'Estimació de memòria a encaixa, i 3 Carrega 10 fitxers](../assets/img/en/loading-files-source.webp)

*Després de deixar anar una carpeta, 3DHeat us diu què ha trobat i si hi cap.*

Els fitxers es carreguen al panell **Origen**, a dalt de la barra lateral de la
pestanya de mapa de calor. Tot el que se selecciona de cop esdevé **un** sol conjunt de
dades.

## Triar fitxers {#choosing-files}

| Control | Què fa |
|---|---|
| **Deixa anar aquí fitxers o una carpeta** (la zona de deixar anar) | Deixeu anar qualsevol barreja de fitxers i carpetes. Les carpetes es recorren de manera recursiva. Fer clic a la zona de deixar anar obre el mateix selector que **Fitxers…**. |
| **Un fitxer…** | Un selector de fitxers per a un sol fitxer. |
| **Fitxers…** | Un selector de fitxers que accepta diversos fitxers. |
| **Carpeta…** | Un selector de carpetes (el selector `webkitdirectory` del navegador); s'ofereix cada fitxer de l'arbre de la carpeta. |

Els selectors accepten els tipus de fitxer de la [llista de fitxers carregables](data-formats.md#files).
En resum: `.parquet`/`.pq` es llegeixen com a Parquet, `.csv`/`.tsv`/`.txt` com a text
delimitat, `.acmi` (Tacview), els `.json`/`.json.gz` d'OCAP i els formats GPS (GPX, KML,
KMZ, NMEA, IGC, FIT) passen pels seus propis lectors, i els contenidors de partida `.3dheat`
es carreguen com les taules que contenen ([Un fitxer per partida](container.md)). Un
contenidor que no es pot llegir s'omet com a *no és un fitxer csv/parquet*.

Les carpetes deixades anar es recorren fins a una profunditat de 12 nivells i com a
màxim 20.000 fitxers, com a protecció contra bucles d'enllaços simbòlics i arbres
desbocats.

## Quins fitxers es mantenen {#which-files-are-kept}

Abans de llegir res, la selecció es filtra ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Un fitxer amb una altra extensió s'omet: *no és un fitxer csv/parquet*.
- Un fitxer de 0 bytes s'omet: *buit (0 bytes)*.
- **Els fitxers auxiliars dels convertidors** -les dades en brut que un convertidor guarda al costat de la taula d'una partida, `<partida>.messages.parquet`, `.events.parquet`, `.raw.parquet` i els altres que llista [Els convertidors ho conserven tot](converters.md)- s'ometen: *fitxer auxiliar d'un convertidor*. Per obrir-ne un, trieu-lo o deixeu-lo anar sol (o només auxiliars): una selecció formada només per auxiliars els carrega com qualsevol taula. El JSON al costat d'una taula (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` i `.hints.json`) mai no s'ofereix com a posicions.
- **La regla del fitxer de moviment.** Si algun fitxer de la selecció es diu `movement*.parquet`, `movement*.csv` (i les altres extensions) -`movement.parquet`, `movement_1.parquet` i així successivament- aleshores s'omet tot altre fitxer de dades: *no és un fitxer de moviment, i aquesta carpeta té fitxers de moviment*. Les exportacions de telemetria sovint tenen una taula de posicions al costat de desenes de taules sense posicions, i només la primera es pot dibuixar. Una carpeta sense cap fitxer de moviment carrega tots els seus fitxers de dades. Exemple: una carpeta amb `movement_1.parquet`, `kills.parquet` i `shop.parquet` carrega `movement_1.parquet`; els altres dos s'enumeren com a omesos. Exemple: una carpeta amb `movement_1.parquet`, `kills.parquet` i `shop.parquet` carrega `movement_1.parquet`; els altres dos s'enumeren com a omesos.
- Els fitxers que es mantenen s'ordenen pel seu camí dins de la selecció, de manera que la mateixa carpeta sempre produeix el mateix conjunt de dades i els mateixos colors.

El panell mostra després la selecció (el nom d'un sol fitxer, o `carpeta (N fitxers)` fent
servir la carpeta comuna més llarga), el nombre de fitxers, la seva mida total i el nombre
total de files -exacte quan tots els fitxers són Parquet, marcat amb `≈` quan algun és
CSV. Els fitxers omesos s'enumeren amb el motiu, els quatre primers pel nom.

## Llegir l'esquema {#reading-the-schema}

El **primer** fitxer de la selecció s'obre per descriure l'esquema ("Llegint l'esquema"):
els noms de les seves columnes, les seves primeres 50 files de dades, quines columnes
semblen numèriques i, per a Parquet, el tipus lògic de cada columna i l'entrada del peu
`heat3d`. Una carpeta d'exportacions d'una taula comparteix un sol esquema, així que un
fitxer representa tots els altres. Després es mesura cada fitxer ("Comptant files"): el
peu d'un Parquet dona el recompte exacte en una lectura petita; el recompte d'un CSV
s'estima a partir de la longitud mitjana de la línia del seu primer megabyte.

El panell [Assignació de columnes](column-mapping.md) s'obre amb les suposicions
assignades automàticament, i l'[estimació de memòria](memory-and-budgets.md) apareix a
sobre del botó **Carrega**.

## Missatges abans de carregar {#messages-before-loading}

Sota la selecció, el panell llista, des de [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Errors** (vermell) -la càrrega no pot començar: menys de dos eixos de posició, la
  mateixa columna en dos eixos, una columna assignada que no és al fitxer, una columna de
  posició que no sembla numèrica, una columna de temps els valors mostrejats de la qual són
  text mentre la unitat és un nombre (cada fila es llegiria com a NaN i aniria al temps 0),
  una columna de temps posada a ISO-8601 de la qual cap valor mostrejat no es pot analitzar
  com a data, una escala d'unitats de 0.
- **Avisos** (ambre) -es carregarà, però probablement no com es vol: una columna de grup
  que pren un valor diferent a la majoria de files mostrejades (així és un identificador, no
  un grup), una columna de temps `DATE` (cada fila d'un dia comparteix el mateix instant),
  una direcció de mirada posada sense les seves columnes.
- **Notes** -què implica l'assignació: dibuixar en un pla quan un eix no està assignat, cap
  línia de temps sense columna de temps, cap pista sense columna de persona, i sense columna
  de grup un sol color per a tot i una diferència que només es pot dividir per una columna
  guardada per filtrar.

## Carregar {#loading}

El botó **Carrega** diu *Carrega el fitxer*, *Carrega N fitxers*, o *Carrega N fitxers (1 de cada K)*
quan hi ha un [pas de decimació](memory-and-budgets.md#decimation) definit. Diu *Massa gran: redueix o decima*
i queda desactivat quan la [comprovació d'encaix](memory-and-budgets.md#the-fit-check)
diu que la càrrega no hi cabrà; també queda desactivat mentre l'assignació té errors o
mentre s'executa una altra càrrega.

Mentre carrega, el panell mostra el pas actual (amb `[fitxer/fitxers]` davant quan n'hi ha
diversos), les files llegides fins ara, una barra de progrés i **Cancel·la**. Cancel·la
atura el treballador d'ingestió, i amb ell qualsevol treballador d'anàlisi que hagi iniciat.

La pàgina continua dibuixant mentre carrega, perquè el treball es fa en segon pla. Veieu el
pas actual, les files llegides, una barra de progrés i **Cancel·la**. Després de l'últim
fitxer, el panell mostra els passos *Posant les files en ordre de temps*, *Reordenant les
columnes (n de m)*, *Mesurant l'extensió*, *Construint la llista*, *Resumint les sessions* i
*Calculant els temps de vida*, i després *Pujant N files a la GPU* durant un fotograma, de
manera que una pujada llarga no es confongui mai amb un bloqueig.

### Com funciona {#how-it-works}

La càrrega s'executa en un Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)).
Amb diversos fitxers i més d'un [fil d'anàlisi](memory-and-budgets.md#parser-threads),
fins a aquest nombre de fitxers s'analitzen **alhora**, cadascun en un treballador
d'anàlisi propi ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)),
mentre el pressupost de RAM deixi espai; encara es fusionen d'un en un, en l'ordre de la
selecció, de manera que el conjunt de dades és el mateix que en una càrrega un a un. Mentre
n'hi ha diversos en curs, la línia de progrés anomena el fitxer que va informar l'últim, i la
barra i el recompte de files sumen tots els fitxers en curs. Amb un sol fil, o un sol fitxer,
els fitxers s'analitzen un rere l'altre al mateix treballador d'ingestió. Només es llegeixen
les columnes que nomena l'assignació: una columna no assignada d'un fitxer Parquet no costa
res; un CSV es recorre byte a byte però només es decodifiquen els camps assignats.

## Diversos fitxers esdevenen un sol conjunt de dades {#several-files-become-one-dataset}

Quan es carrega més d'un fitxer ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Una sola llista.** Les persones, els grups, les sessions i els valors de categoria són diccionaris compartits entre tots els fitxers, de manera que el mateix jugador en dues exportacions és una persona amb una sola pista.
- **Un sol origen de temps.** Els temps es guarden com a segons de 64 bits mentre es fusionen i es recalculen a partir del temps més antic de tota la selecció, i després s'emmagatzemen com a segons de 32 bits des d'aquell origen. Quatre exportacions de quatre tardes es col·loquen en el seu ordre real, no apilades una sobre l'altra.
- **Un sol ordre de temps.** Les files de tots els fitxers s'ordenen per temps amb un radix sort (vegeu [el límit d'ordenació](memory-and-budgets.md#the-sort-ceiling)).
- **Una columna `Source file`.** Cada fila recorda de quin fitxer ve, com una columna de categoria anomenada `Source file`. Apareix a [Filtres](filters.md) i com a *Source file - compara dues càrregues* a la [divisió de diferència](difference.md). Una càrrega d'un sol fitxer no en té -una columna constant costaria 4 bytes per fila per no dir res.
- **Columnes que falten.** Un fitxer que no té una de les columnes de *filtre* simplement no aporta valors per a ella. Un fitxer que no té una columna de *rol* assignada (X, temps, persona, ...) falla amb *el fitxer no té la columna "nom"*; en una càrrega de diversos fitxers aquell fitxer s'omet i les altres es carreguen igualment, i els fitxers omesos s'enumeren al conjunt de dades. Una càrrega d'un sol fitxer que falla informa de l'error.
- **Avís de falta.** Quan les files carregades són menys del 95 % de les files comptades abans, el conjunt de dades porta un avís amb la part que falta -per fitxers il·legibles o per files sense una posició utilitzable, que es descarten en entrar.

## Després de carregar {#after-loading}

El nou conjunt de dades substitueix l'anterior. A cada càrrega ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- es netegen tots els filtres i la visibilitat dels grups;
- la divisió de diferència per grup es reinicia: la primera meitat dels grups (arrodonida cap amunt) positiva, la resta negativa;
- el radi de les figures es fixa a l'extensió horitzontal / 120 i la saturació a una estimació analítica; la mida del cub, la longitud del raig de mirada, la velocitat de vol i els plans proper i llunyà es fixen a partir de l'extensió (vegeu [Sessions, persones i grups](sessions-persons-groups.md#entity-size));
- la sessió de la repetició de caixa es fixa a la sessió amb més files;
- les rutes del calor de línia es tornen a suposar des de zero ([Calor de línia](line-heat.md));
- el mode de vista torna a **Calor** si el mode actual no és compatible amb les noves dades; la línia de temps torna a **Tot** sense columna de temps, i l'historial a **Acumulat** sense temps de vida;
- el capçal de reproducció es posa a l'inici i la reproducció s'atura;
- la càmera enquadra tot el conjunt de dades des de la direcció per defecte (mirant al llarg de -Z, inclinada cap avall uns 36°).

El panell **Conjunt de dades** mostra després el nom del conjunt de dades (la selecció, els
recomptes de files i fitxers, i el pas quan se n'ha usat un), `N equips · N persones · Ns
d'abast`, i tots els avisos que ha produït la càrrega, en ambre, mentre el conjunt de dades
estigui carregat. **Descarrega** en aquell panell n'elimina el conjunt de dades.
