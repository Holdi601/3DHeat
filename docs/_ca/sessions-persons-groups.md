---
title: "Sessions, persones i grups"
parent: "Carregar dades"
nav_order: 4
lang: "ca"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sessions, persones i grups

Una **persona** és una cosa que es mou (un jugador, un cotxe). Un **equip/grup** és el bàndol al qual pertanyen. Una **sessió** és una partida o una volta. Vegeu el [glossari](glossary.md).

Una fila d'un fitxer pot anomenar les tres coses:

| x | y | temps | player | team | match |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` és la persona, `team` és el grup, `match` és la sessió.

Tres columnes opcionals descriuen *qui* i *on dins de la història* pertany una fila. Cadascuna es codifica com a diccionari en carregar: els valors de text es converteixen en petits identificadors enters per fila, més una llista d'etiquetes, compartida entre tots els fitxers de la càrrega.

## Persona {#person}

La columna **Id de persona** anomena la cosa que es mou a la qual pertany una fila: un jugador, un bot, un cotxe. S'emmagatzema com un identificador de 32 bits per fila.

Amb una columna de persona i una de temps, la càrrega calcula el **temps de vida** de cada fila: el temps fins a la següent mostra de la mateixa persona *a la mateixa sessió*, o "cap" (un valor sentinella, -1) quan no hi ha cap mostra següent -la persona va morir, va marxar, o el registre s'ha acabat. Els temps de vida alimenten la història **Temps de vida** de la [línia de temps](timeline.md), la interpolació i l'obsolescència de la [repetició de caixa](box-replay.md), i les interrupcions de ruta del [calor de línia](line-heat.md). Què fa una fila sense successora és un ajust de visualització (*Vida de reserva*), no està fixat a les dades.

Cada persona rep el grup de la seva **primera** fila en el temps; aquesta assignació pinta la seva caixa a la repetició de caixa i decideix quin interruptor de visibilitat de grup l'amaga allà. Els modes de calor usen el grup de cada fila pròpia.

### Noms portats per diverses coses alhora {#names-worn-by-several-things-at-once}

Un nom no és sempre una sola entitat: en algunes exportacions, cada bot de cada partida es registra amb un mateix nom. Unir dues mostres d'aquesta "persona" -per interpolació, un rastre o una ruta- dibuixa una línia entre dues criatures diferents a través del mapa.

En carregar ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) un nom es marca **compartit** quan dos registres seus

- són a la mateixa sessió,
- tenen el mateix temps,
- són del mateix tipus (cada columna de categoria guardada té el mateix valor), i
- estan més allunyats que l'1 % de la diagonal de l'extensió de les dades.

Els noms compartits es dibuixen com a mostres individuals -sense interpolació, sense rastre, sense ruta de calor de línia. La resta de coses sobre ells (el seu calor) no es veu afectada. El panell Conjunt de dades enumera quants noms s'han marcat, amb fins a tres exemples, i el panell de la repetició de caixa repeteix el recompte.

## Sessió {#session}

La columna **Sessió / partida** diu a quina partida, incursió, ronda, cursa o volta pertany una fila. És el que fa que les mostres d'una persona siguin una sola pista contínua: la telemetria real sovint entrellaça partides simultànies, i la mostra d'un jugador just abans del capçal de reproducció i la que ve just després poden ser de partides diferents, a centenars de metres. Amb una columna de sessió:

- la interpolació, els rastres i les rutes de calor de línia mai no creuen un canvi de sessió;
- el temps de vida d'una fila acaba al final de la seva pròpia sessió;
- el selector de **Sessió** apareix a dalt de la barra lateral, sota la barra de mode.

Una columna de sessió sovint és una *marca de temps* -l'instant d'inici de la partida, repetit en cada fila d'aquella partida. L'assignació automàtica busca els noms de sessió abans que els de persona i grup per això ([Assignació de columnes](column-mapping.md#session-person-group)). Una volta de cursa o un torn també és una sessió: dues voltes del mateix cotxe no s'han d'unir en una sola pista.

### El selector de sessió {#the-session-picker}

![El selector de sessió obert sobre un fitxer de deu partides: Totes les sessions (10), Match 01, Match 02 i així successivament](../assets/img/en/sessions-persons-groups-picker.webp)

*Deu partides en un fitxer: trieu-ne una o veu-les totes.*

Es mostra quan el conjunt de dades té sessions enumerades (vegeu el límit més avall).

| Part | Significat |
|---|---|
| Etiqueta a la dreta | El nombre de files de la sessió triada, o *tot alhora*. |
| Menú | *Totes les sessions (N)*, i després cada sessió, la més concorreguda primer, com a `etiqueta - N files, durada` (durada en segons per sota de 90 s, en minuts per sota de 90 min, en hores per sobre). |
| Indicació ambre | Mostrada per a *Totes les sessions*: les posicions encara mai no s'uneixen entre sessions, però les partides simultànies posen junts al mapa jugadors sense relació. |
| Indicació | Mostrada en els modes de calor quan s'ha triat una sessió: la tria només mou el capçal de reproducció. |

En carregar, se selecciona la sessió més concorreguda. Triar una sessió porta el capçal de reproducció a l'inici d'aquella sessió.

Què canvia la selecció:

- A la **[repetició de caixa](box-replay.md)** decideix quina sessió es reprodueix: només es dibuixen les caixes i els rastres d'aquella sessió, i el rang de la línia de temps passa a ser la durada pròpia de la sessió.
- En els **modes de calor** no restringeix el calor, i una indicació sota el selector ho diu: *En els modes de calor això només mou el capçal de reproducció a l'inici de la sessió; el calor encara compta totes les sessions. La repetició de caixa reprodueix només la sessió triada.* Per restringir el calor a una sola sessió, mantingueu també la columna de sessió com a columna de filtre (*Conserva per filtrar*) i filtreu-la. Una columna pot ser alhora la columna de sessió i una columna de filtre: el carregador llegeix cada columna de filtre marcada per separat, sigui quin sigui el paper que també tingui.

### Massa sessions {#too-many-sessions}

Es llisten fins a **100.000** sessions. Més enllà, la columna és realment un identificador (una carpeta amb milions de sessions de poques files cadascuna), i enviar tantes etiquetes des del treballador a la pàgina és el que deixa una pestanya sense memòria. La càrrega aleshores guarda els **identificadors** de sessió -així els límits es continuen aplicant a tot arreu- però descarta les etiquetes i el selector, i el panell Conjunt de dades ho diu.

## Grup {#group}

La columna **Equip / grup** és qualsevol columna de poca cardinalitat: un equip, un bàndol, un esquadró, una facció, un indicador de jugador contra IA, una classe de cotxe. S'emmagatzema com un identificador de 16 bits per fila i impulsa:

- la [Llista d'equips](teams-list.md) (visibilitat per grup, bàndols + / −),
- el [calor per equips](team-heat.md) (un to per grup),
- la divisió per grup de la [diferència](difference.md),
- els colors de caixa de la [repetició de caixa](box-replay.md) (una família de tons per grup, una ombra per membre).

### Límits {#limits}

Com a màxim **4.096** grups diferents. L'identificador de grup viatja al quart canal del texel de posició de cada fila a la GPU, i cada grup necessita un texel a la taula de signes de 4.096 amplades que el shader llegeix per decidir *amagat*, *afegit* o *restat*. Una columna amb més valors diferents és un identificador, no un grup: **la càrrega manté cada fila i només descarta l'agrupació**, amb un avís al conjunt de dades que suggereix mapejar-la com a columna de persona, o guardar-la com a columna de filtre.

El mateix límit de 4.096 s'aplica a una columna de filtre de *categoria* guardada; una més ampla no es guarda, i el conjunt de dades ho diu. Una columna numèrica (una marca de temps, per exemple) no té aquest límit com a filtre de *rang*.

Els valors de grup `0`, un valor buit, `none`, `unknown`, `null` i `-1` (sense distingir majúscules) volen dir "sense grup" per al [calor per equips](team-heat.md), que els dibuixa en gris neutre en lloc d'un color amb confiança.

## Mida de l'entitat {#entity-size}

La mida d'una cosa seguida -la caixa de col·lisió d'un jugador, un cotxe- decideix quant grans es dibuixen les caixes i els raigs de mirada de la [repetició de caixa](box-replay.md). No hi ha cap camp per a això al panell; ve de les [pistes `heat3d`](data-formats.md#the-heat3d-hints) del fitxer (`entity.size`, en les unitats propies del fitxer; el convertidor de CS2 escriu 32). La càrrega el multiplica per l'escala d'unitats.

En cada càrrega ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), amb *extensió* la més gran de les dimensions X i Z de les dades:

| Ajust | Amb una mida d'entitat | Sense |
|---|---|---|
| Mida del cub | mida de l'entitat | extensió / 500 |
| Longitud del raig de mirada | mida de l'entitat × 4 | extensió / 200 |
| Radi de la figura | extensió / 120 | extensió / 120 |
| Punt de saturació | estimació analítica (i després mesurada) | igual |
| Velocitat de vol | extensió / 12 | igual |
| Pla llunyà | extensió × 12 | igual |
| Pla proper | max(0,05, extensió / 20.000) | igual |

## El panell Conjunt de dades {#the-dataset-panel}

Sota el panell Origen. Amb un conjunt de dades carregat mostra:

- el **nom** del conjunt de dades -la selecció, el nombre de files, el nombre de fitxers, el pas quan se n'ha usat un;
- **`N equips · N persones · Ns d'abast`**;
- cada **avís** que ha produït la càrrega, en ambre, mentre el conjunt de dades estigui carregat: grups o una columna de filtre descartats per tenir massa valors, sessions no llistades, noms compartits, files que falten, fitxers omesos;
- el [generador sintètic](synthetic-generator.md);
- **Descarrega**, que elimina el conjunt de dades.

El nombre de files es mostra a la capçalera del panell.
