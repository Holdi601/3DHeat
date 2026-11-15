---
title: "Els convertidors ho conserven tot"
parent: "Carregar dades"
nav_order: 8
lang: "ca"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Els convertidors ho conserven tot

No necessites aquesta pàgina per obrir una repetició. És per a les persones que escriuen eines que converteixen fitxers de joc en taules del 3DHeat, i per a qui vol saber per què aquestes taules contenen tant.

Cada eina que converteix una repetició, una demo, un registre o la telemetria en directe d'un joc en quelcom que el visor obre segueix una regla:

> **Converteix tot el que la font conté i que es pugui llegir ara, i guarda la resta sencera, perquè es pugui llegir més tard sense el fitxer original.**

Una repetició sovint desapareix després d'una actualització del joc, d'una reinstal·lació o d'un disc ple, i una emissió en directe desapareix en el moment que s'envia. El que un convertidor descarta es perd per sempre; el que guarda sencer es pot descodificar el dia que algú l'entengui. Per això un convertidor mai no decideix què serà útil: descodifica el que pot, guarda cada altre missatge, paquet, esdeveniment, propietat o línia sense canvis al costat de la taula, i diu a la seva pròpia sortida quant de cada cosa ha llegit i quant només ha guardat.

Aquesta pàgina és la convenció que comparteixen tots els convertidors: els convertidors de repeticions de War Thunder, World of Tanks, World of Warships i Squad, el convertidor de demos de CS2, el vigilant de fons (el seu descodificador de repeticions de Dota i cada adaptador en directe), els lectors de telemetria de l'eina de captura de jocs, i les importacions pròpies del visor (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Els lectors propis del visor es descriuen a [Gravacions de Tacview](tacview-acmi.md) i [Carregar fitxers](loading-files.md); la forma d'un sol fitxer és [Un fitxer per partida](container.md). Una partida es converteix en una taula, un `match.json` i fitxers auxiliars, opcionalment empaquetats en un sol fitxer `.3dheat`. La secció **Completesa** del README de cada eina llista, per a aquella font, què es llegeix, què es guarda en brut i què no està disponible, i per què.

## Tres destinacions per a cada element {#three-homes-for-every-item}

Tot el que conté una font acaba en exactament un de tres llocs:

| Destinació | Què hi va |
|---|---|
| **Descodificat** | La taula (una fila per mostra o esdeveniment, les columnes que llegeix el visor, columnes addicionals per a cada altre valor que pertany a una fila) i el document de la partida `<match>.match.json` (tot el que pertany a la partida en conjunt: ajustos, alineacions, resultats, marcadors, l'autocomprovació). |
| **Guardat en brut** | Un fitxer auxiliar al costat de la taula: cada element que no està descodificat, o només parcialment descodificat, sencer i sense canvis, amb el seu tipus, temps i la unitat o entitat a la qual pertany. |
| **No disponible** | Anomenat a la secció Completesa del README amb el motiu: el format no ho porta (una repetició de client no té les entrades dels altres jugadors), la font mai no ho envia, o llegir-ho no està permès (un procés protegit, un bloc xifrat la clau del qual no és nostra per usar). |

Un element **parcialment** descodificat es descodifica *i* es guarda en brut: la taula rep el que s'entén, el fitxer auxiliar l'element sencer, perquè un descodificador millor més endavant no necessiti el fitxer original.

No hi ha una quarta destinació. Descartar alguna cosa perquè semblava inútil, perquè era un duplicat «probablement», o perquè era gran, és un error. Reduir només és permès a la taula (una càmera a 2 Hz en lloc de 60), mai al fitxer auxiliar.

## Fitxers auxiliars {#sidecars}

Un fitxer auxiliar és un fitxer Parquet al costat de la taula, amb el nom d'aquesta:

```
<carpeta>/<partida>.parquet              la taula
<carpeta>/<partida>.match.json           el document de la partida
<carpeta>/<partida>.<què>.parquet        un fitxer auxiliar
```

`<què>` és una paraula d'aquesta llista. Un convertidor nou tria la paraula que encaixa, o afegeix una paraula nova aquí **i** a `SIDECAR_PARQUET` a [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts), perquè el visor el deixi de banda quan es carrega una carpeta sencera.

| `<què>` | Conté | L'usen |
|---|---|---|
| `messages` | paquets, crides de mètodes d'entitats i actualitzacions de propietats d'un flux de xarxa, sencers | War Thunder, World of Tanks, World of Warships |
| `flight` | entrades del model de vol per avió, sencers | War Thunder |
| `packets` | trames i missatges de xarxa sencers, o fragments de contenidor, fora del flux d'entitats | CS2, Dota 2, Squad |
| `events` | esdeveniments del joc amb totes les seves claus, tal com els dona l'analitzador | CS2 |
| `entities` | actualitzacions d'entitats i propietats, crides remotes, canals oberts i tancats, amb les exportacions que necessita un descodificador | Squad, Dota 2 |
| `props` | cada propietat d'entitat que llegeix l'analitzador, cada vegada que ha canviat | CS2 |
| `units` | estat per unitat fora de la taula de posicions | Dota 2 |
| `combatlog` | un registre de combat, cada entrada amb cada camp | Dota 2 |
| `strings` | cada entrada de cada taula de cadenes | CS2, Dota 2 |
| `objectives` | zones de captura i objectius, cada canvi amb el seu temps | War Thunder |
| `raw` | un flux en directe: cada paquet, línia, document d'API o lectura de memòria rebuda, sencers | les sessions del vigilant (`heat.raw.parquet`), els registradors de voltes de l'eina de captura de jocs (`<segell>_<joc>.raw.parquet`), els fitxers de repetició d'osu!, LoL i Valorant del vigilant |

La càrrega de carpetes del visor omet cada `*.<què>.parquet` d'aquesta llista, i cada `*.match.json`, `*.meta.json`, `*.summary.json` i els altres fitxers auxiliars JSON; si n'obres un només, triant o deixant anar només aquell fitxer, es carrega com qualsevol altra taula (vegeu [Carregar fitxers](loading-files.md)).

Aquests són els fitxers tal com els escriu un convertidor amb `--loose`. Per defecte, els convertidors de War Thunder, CS2 i Tacview empaqueten la taula, el document i els fitxers auxiliars d'una partida en un sol fitxer, `<partida>.3dheat`, amb els mateixos noms (vegeu [Un fitxer per partida](container.md)); tot el que hi ha aquí es compleix per a cada membre.

### Columnes {#columns}

Cada fila del fitxer auxiliar és un element. Les columnes són, en aquest ordre, les que s'apliquen:

| Columna | Tipus | Què |
|---|---|---|
| `time` | float64 | segons en el mateix rellotge que el `time` de la taula (o `tick` quan la font compta ticks; aleshores totes dues) |
| `type` | string (diccionari) | què és l'element, en els propis termes de la font: un tipus de paquet, un identificador de missatge, un nom d'esdeveniment, un camí de propietat, un prefix de línia |
| `name` | string (diccionari) | el seu nom quan se'n coneix un (un nom de la comunitat, un nom de classe), si no buit |
| `entity` / `unit` / `uid` / `player` | enter o string | a qui pertany, amb els mateixos identificadors que la taula, perquè una fila del fitxer auxiliar es pugui unir a una trajectòria |
| `decoded` | string (JSON) | el que s'entén del seu contingut, quan hi ha alguna cosa; si no, buit |
| `payload` | binari | els bytes de l'element, sencers i sense canvis (fonts binàries) |
| `text` | string | el text de l'element, sencer i sense canvis (fonts de text: una línia de registre, un objecte JSON, un bloc clau-valor) |

Es permeten més columnes (un desplaçament de bits, una mida, un canal). Les cadenes que es repeteixen estan codificades per diccionari i el fitxer s'escriu amb zstd, de manera que un fitxer auxiliar és una fracció de la mida de la pròpia repetició.

Un fitxer auxiliar ha de bastar per si sol: un descodificador escrit més tard llegeix el fitxer auxiliar, mai la repetició original. Quan un element no es pot entendre sense context (la classe d'una entitat, una taula de cadenes, una clau a la qual es refereix un missatge), el context va també al fitxer auxiliar, o al document de la partida.

### Fonts en directe {#live-sources}

Els adaptadors en directe (telemetria UDP, memòria compartida, el registre d'un joc, una API local) no tenen cap fitxer al qual tornar. Registren **cada camp que envia la font**, fins i tot els que encara no fa servir ningú:

- un flux de paquets: cada paquet sencer, `payload` els bytes, `type` el seu identificador o format de paquet, a la velocitat a la qual arriba;
- memòria compartida o una API consultada per sondeig: cada camp de cada lectura, sigui com a columnes amb nom o com el bloc sencer en `payload`, a la velocitat a la qual l'adaptador llegeix;
- un registre: cada línia, `text` la línia, `type` el tipus de la línia, incloses les línies sobre les quals l'adaptador no actua.

Aquests van a `<sessió>.raw.parquet` al costat de la taula de la sessió. La mida és el preu de la regla; es manté baixa amb la codificació zstd i per diccionari, no deixant coses fora.

## L'autocomprovació {#the-self-check}

Cada convertidor escriu, al seu document de la partida (o al `meta.json` de la sessió, o a un resum quan no té document de partida), un bloc `completeness` sota `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Camp | Significat |
|---|---|
| `seen` | quants elements d'aquest tipus conté la font |
| `decoded` | llegits sencers a la taula o al document de la partida |
| `partial` | llegits en part a la taula o al document, i guardats sencers en un fitxer auxiliar |
| `raw` | guardats sencers només en un fitxer auxiliar, no descodificats |
| `lost` | `seen - decoded - partial - raw`: ha de ser 0 |

El `lost` de nivell superior és la suma. Les proves d'un convertidor afirmen que és 0 en les seves mostres sintètiques, i el README diu quant va ser en les reals. Un `lost` diferent de zero és el convertidor dient que ha trencat la regla; n'anomena el tipus, perquè es pugui trobar el forat.

Els «tipus» són els de la font: tipus de paquet, identificadors de missatge, noms d'esdeveniments, grups de propietats, tipus de línia. Es compten on el convertidor els troba, no a partir d'una llista del que espera, de manera que un tipus que ningú coneixia apareix amb el seu recompte en lloc de desaparèixer.

## La secció Completesa del README {#the-readmes-completeness-section}

El README de cada convertidor té una secció titulada **Completesa**, amb tres llistes:

- **Llegit**: què va a la taula i al document de la partida, i com s'ha comprovat cada camp nou contra alguna cosa independent (els números propis del joc, una segona font, una gravació feta amb aquest propòsit).
- **Guardat en brut**: què és a quin fitxer auxiliar, sota quin `type`, i què se sap fins ara.
- **No disponible**: què no porta la font o no es pot llegir, i per què.

Enllaça de tornada aquí.

## On es troba cada convertidor {#where-each-converter-stands}

| Convertidor | Fitxers auxiliars | La seva secció Completesa |
|---|---|---|
| Repeticions de War Thunder | `messages`, `flight` | [README de 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (els recomptes de la seva autocomprovació són sota `counts`; el bloc `completeness` és pendent) |
| Repeticions de World of Tanks | `messages` | [README de 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| Repeticions de World of Warships | `messages` | [README de 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Demos de servidor de Squad | `entities`, `packets` | [README de 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| Demos de CS2 | `events`, `props`, `strings`, `packets` | [README de 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Repeticions de Dota 2 (vigilant) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Repeticions de Dota 2](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| Repeticions d'osu!, LoL, Valorant (vigilant) | `raw` | les seves pàgines a la [documentació del vigilant](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Adaptadors en directe (vigilant) | `raw` | la pàgina de cada joc a la [documentació del vigilant](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), i [desenvolupament](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) per a `Session.raw` |
| Registradors de voltes (eina de captura) | `raw`, i bytes `unparsed` dins d'un fitxer de volta de Forza | [README de 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Les importacions pròpies del visor | cap: vegeu a sota | aquesta pàgina |

### Les importacions pròpies del visor {#the-viewers-own-imports}

Tacview ACMI, OCAP i els formats GPS es llegeixen al navegador a partir del fitxer propi de l'usuari; el visor no n'emmagatzema res, així que el propi fitxer continua sent el registre. Igualment llegeixen tot el que poden:

- **Tacview ACMI** (`src/data/acmi.ts`): cada línia d'objecte amb una posició és una fila amb cada propietat que porta la gravació, cada esdeveniment és una fila, cada eliminació és una fila, les propietats pròpies de la gravació (amb el FileType i FileVersion de la capçalera) en cada fila com a `RecordingInfo`; una línia de comentari és un esdeveniment `Comment`, un objecte que mai no rep una posició és una fila `Unplaced` al punt de referència, i U/V són columnes sempre que alguna fila les tingui. Una línia de propietat sense posició es llegeix en part: els seus valors arriben a la fila següent de l'objecte, no al seu propi temps. `AcmiTable.completeness` compta les línies del fitxer per tipus.
- **OCAP** (`src/data/ocap.ts`): els fotogrames, trets, marcadors de cada entitat, cada tipus d'esdeveniment (els tipus desconeguts com a files de «Mission» amb el seu text) i els camps propis del document (`Info`). Encara no es llegeix: els camps d'entitat i els elements de posició finals diferents dels llistats a la seva capçalera (les addicions d'un gravador més nou), i els fotogrames repetits d'una unitat morta després de la seva mort (reduïts a propòsit: no canvia res en ells).
- **Formats GPS** (`src/data/geoTracks.ts`): les posicions, el seu temps, altitud, rumb i velocitat, i freqüència cardíaca, cadència, potència, temperatura, satèl·lits, HDOP i altitud de pressió quan el fitxer els registra. Encara no es llegeix: altres extensions de GPX i KML, frases NMEA que no siguin les de posició, registres IGC que no siguin posicions i les seves extensions, i missatges FIT que no siguin registres (voltes, sessions, informació del dispositiu).

Aquestes mancances es llisten per tancar-les, no per excusar-les; les exportacions del visor d'una gravació carregada (`src/data/exportRecording.ts`) només escriuen el que es va llegir.

## Afegir un convertidor {#adding-a-converter}

1. Llista el que conté el format, a partir de la seva documentació, de les seves pròpies estructures, o comptant cada tipus de missatge en mostres reals. La llista són els `types` de l'autocomprovació.
2. Descodifica el que es pot comprovar ara. Cada camp nou es comprova contra alguna cosa independent abans d'anar a la taula; un camp que encara no es pot comprovar es queda en brut.
3. Guarda la resta sencera en un fitxer auxiliar amb un nom com el de dalt, amb les columnes de dalt.
4. Escriu el bloc `completeness` i una prova que tingui `lost` 0.
5. Escriu la secció Completesa del README i enllaça aquí.
6. Si el `<què>` del fitxer auxiliar és nou, afegeix-lo a la taula de dalt i a `SIDECAR_PARQUET` a `src/data/filePick.ts`.

Els convertidors són de clean-room: s'escriuen a partir de formats, documentació i mostres, mai a partir de codi GPL o AGPL. Les mostres de repeticions reals es queden a la màquina que les va fer; les proves usen fitxers sintètics.
