---
title: "Assignació de columnes"
parent: "Carregar dades"
nav_order: 2
lang: "ca"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Assignació de columnes

Un fitxer és una taula, i 3DHeat ha de saber quina columna té la posició est-oest, quina té el temps, quina té el nom del jugador, i així successivament. Aquest panell és on diu què ha endevinat, i on corregiu una suposició errònia.

![El panell Assignació de columnes després de carregar un fitxer Parquet: totes les caselles ja omplertes - 1 X, 2 Y, 3 Z, 4 Temps, 5 Id de persona, 6 Sessió / partida, 7 Equip / grup](../assets/img/en/column-mapping-panel.webp)

*El fitxer ha posat els seus propis noms de columna, així que totes les caselles ja estan omplertes.*

Per exemple, un CSV amb la capçalera `x,y,z,t,player,team` s'assigna sol: x, y i z
esdevenen la posició, `t` el temps, `player` la [persona](glossary.md) i `team` el
[grup](glossary.md).

Després de triar els fitxers, el panell **Assignació de columnes** s'obre sota el panell
Origen. Diu quina columna fa quin paper. S'omple automàticament i es pot canviar cada camp
abans de premer **Carrega**; l'assignació es llegeix en el moment de carregar, de manera que
canviar-la després vol dir tornar a carregar.

## Els camps {#the-fields}

Tots els menús de columnes enumeren cada columna del primer fitxer, més *- cap -*.

| Camp | Paper | Notes |
|---|---|---|
| **Separador** | Només CSV: el delimitador de camps. | Menú: *Coma ,*, *Punt i coma ;*, *Tabulador*, *Barra vertical \|*, *Espai*; o escriviu qualsevol caràcter únic a *o escriu un caràcter*. Es detecta automàticament (vegeu més avall). Canviar-lo torna a executar l'assignació automàtica, de manera que es perden els canvis fets abans. |
| **X**, **Y**, **Z** | Posició. | Calen com a mínim dos; un tercer eix sense assignar és 0 (la dada es troba en un pla). La mateixa columna en dos eixos és un error. |
| **Eix vertical a l'origen** | Quin eix de l'origen apunta amunt. | *Z és amunt (la majoria de motors de joc)* o *Y és amunt (convenció gràfica)*. Vegeu [Eixos, unitats i temps](axes-units-and-time.md). |
| **Escala d'unitats** | Multiplica cada posició. | Botons *1 (m)* i *0,01 (cm→m)*, o escriviu un valor. |
| **Inverteix X / Inverteix Y / Inverteix Z** | Nega un eix de l'origen. | S'aplica a les posicions i als vectors de direcció de la mirada. |
| **Temps** | L'eix de temps. | Opcional. Sense ell no hi ha línia de temps. |
| **Unitat de temps** | Com llegir la columna de temps. | Set unitats; vegeu [Eixos, unitats i temps](axes-units-and-time.md#time). S'ignora per a les columnes `TIMESTAMP`/`DATE` de Parquet, cosa que el panell diu. |
| **Id de persona** | A qui o a què pertany una fila. | Opcional. Fa possibles les pistes, els temps de vida, la repetició de caixa i el calor de línia. |
| **Sessió / partida** | A quina partida, incursió, ronda, cursa o volta pertany una fila. | Opcional. Mai no es fan interpolacions, rastres ni unions en una ruta a través d'un canvi de sessió. Vegeu [Sessions, persones i grups](sessions-persons-groups.md). |
| **Equip / grup** | Qualsevol columna de poca cardinalitat. | Opcional. Dirigeix els colors de grup, el calor per equips i la divisió de diferència per grup. |
| **Direcció de la mirada** | *Cap*, *Columnes de guinyada / capcineig* o *Columnes de vector de direcció*. | Amb guinyada/capcineig: **Guinyada**, **Capcineig** i **Unitat d'angle** (*Graus* / *Radians*). Amb un vector: **Dir X**, **Dir Y**, **Dir Z**. S'usa per als raigs de mirada de la [repetició de caixa](box-replay.md). |
| **Conserva per filtrar** | Columnes extra guardades a la memòria. | Una casella per columna, i per a cada una marcada, *rang* (numèric) o *categoria*. Cada una costa 4 bytes per fila i una passada de descodificació en carregar. Només les columnes guardades es poden [filtrar](filters.md), usar en una [divisió de diferència](difference.md) o com a columna d'esdeveniments del [calor de línia](line-heat.md). |
| **Mostra files d'exemple** | Una taula de les 12 primeres files mostrejades, totes les columnes. | Per comprovar les suposicions. |

Una columna de filtre marcada que no es defineix explícitament es llegeix com a *rang*; una
columna d'id que sembla numèrica sovint és més útil com a *categoria*. Només 4 filtres poden
estar actius alhora ([Filtres](filters.md)).

## Com endevina l'assignació automàtica {#how-the-auto-mapping-guesses}

L'endevinació és a [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts).
Mira els noms de les columnes, quines columnes són numèriques a les files mostrejades (més del
90 % dels valors no buits s'analitzen com a nombres), quants valors diferents pren cada
columna a la mostra, i els tipus lògics de Parquet. Els patrons de nom es proven en ordre,
sense distingir majúscules, i guanya el primer patró que coincideix amb qualsevol columna
encara lliure.

### Posició {#position}

| Eix | Patrons de nom, en ordre (només columnes numèriques) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Si un eix encara és buit, les primeres columnes numèriques lliures (ignorant `filename`,
`level`, `year`, `month`, `day`, `hour`, `location`) l'omplen en ordre. Una suposició errònia
és òbvia a la pantalla; una de buida deixaria una vista buida.

### Temps {#time}

- **Primer les columnes de marca de temps de Parquet.** Entre les columnes amb tipus lògic
  `TIMESTAMP` o `DATE`, la millor es tria per puntuació: +10.000 si el nom coincideix amb un
  patró de temps, -5.000 per a un `DATE` simple, més el nombre de valors diferents de la mostra.
  Una data de dia sencer i un inici de sessió constant tenen gairebé cap valor diferent, de
  manera que guanya l'instant de l'esdeveniment. La unitat és aleshores *Marca de temps Unix (ms)*.
- **Si no, pel nom:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`,
  `when`, `tick`, `…frame…`, i després noms de temps transcorregut (`gdur`, `g_duration`,
  `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`,
  `…since start…`, `age`). La unitat aleshores s'endevina pels valors: ISO-8601 quan un valor sembla
  `AAAA-MM-DDT…` o `AAAA-MM-DD …`; si no, per la magnitud més gran: per sobre de 10^17 nanosegons,
  per sobre de 10^14 microsegons, per sobre de 10^11 mil·lisegons Unix, per sobre de 10^8 segons
  Unix, per sobre de 10^6 mil·lisegons, si no segons.

Quan es tria una columna de temps transcorregut, el panell fa constar que cada sessió s'alinea
aleshores amb el seu propi inici: bo per superposar partides, no per veure-les en seqüència real.

### Sessió, persona, grup {#session-person-group}

La sessió es reclama **després** de l'eix de temps i **abans** de persona i grup, perquè una
columna de sessió sovint és una marca de temps (l'instant d'inici de la partida en cada fila de
la partida).

| Paper | Patrons de nom, en ordre |
|---|---|
| Sessió | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (cadascun exactament, opcionalment amb `_id`) |
| Persona | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, després `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (dades de curses: el cotxe és el que es mou) |
| Grup | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Grup, de reserva | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Una candidata a grup que pren un valor diferent a la majoria de files mostrejades (més de
max(48, el 60 % de la mostra)) és un identificador, no un grup: es converteix en la columna de
persona si no n'hi havia cap, i no s'usa com a grup. Si no es troba cap columna de grup, s'usa la
columna no numèrica amb menys valors diferents entre 2 i 12.

### Direcció de la mirada {#look-direction}

Una columna numèrica anomenada `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` o
`rot_z` / `rotation_z` canvia la direcció de la mirada a guinyada/capcineig; el capcineig es busca
com a `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Se suposen graus quan algun
guinyada mostrejat supera 7 en magnitud, radians en cas contrari. Un vector de direcció mai no
s'endevina; ve de les pistes de més avall o de vosaltres.

### Columnes de filtre {#filter-columns}

Com a màxim **6** columnes es guarden automàticament, ordenades:

1. `region`, `sessionMode`, `actor` -columnes que existeixen per filtrar-les (puntuació 1200);
2. columnes de categoria que varien a la mostra, primer les de menys valors diferents (1000 menys el recompte);
3. una columna constant a la mostra, però només quan es carreguen diversos fitxers -pot diferir entre fitxers, com una regió o un id d'execució de prova (600);
4. columnes numèriques (500).

Les columnes que ja fan un paper, els noms de soroll de dalt, les columnes constants en una càrrega
d'un sol fitxer, i les columnes de text lliure (més de max(16, la meitat de la mostra) valors
diferents) no s'ofereixen automàticament. Qualsevol columna encara es pot marcar a mà.

### Eix vertical {#up-axis}

Amb els tres eixos assignats, l'eix amb la dispersió més petita de Y i Z a la mostra es pren com a
amunt (un mapa és molt més ample que alt); si no, se suposa Z amunt.

## Les pistes `heat3d` en un peu de Parquet {#the-heat3d-hints-in-a-parquet-footer}

Un fitxer Parquet pot dir com s'ha de llegir. Si les metadades clau/valor del peu del fitxer tenen
una entrada amb la clau **`heat3d`**, el seu valor s'analitza com a JSON i es posa per sobre de les
suposicions ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). El
convertidor de demos de CS2 escriu aquesta entrada, de manera que les seves taules s'obren amb el
jugador com a persona, el bàndol com a grup, cada ronda com a sessió, la direcció de la mirada activada
i el món en el sentit correcte.

Només es llegeix el **primer** fitxer d'una selecció per a les pistes. Cada entrada és opcional, i
cada valor indicat encara apareix al panell i es pot canviar. Una descripció completa de l'esquema,
amb un exemple i com escriure'l, és a [Referència de formats de dades](data-formats.md#the-heat3d-hints).

Les regles, en resum:

- Una columna anomenada per una pista només s'aplica quan el fitxer té aquella columna.
- `lookMode: "vector"` només té efecte quan `dirX`, `dirY` i `dirZ` estan tots definits; `"yawPitch"` només quan `yaw` està definit.
- `extra`, quan hi és, reemplaça la llista de filtres automàtica (els noms desconeguts i les columnes que ja fan un paper s'eliminen); el tipus rang/categoria de cada una segueix si semblava numèrica. Quan no hi és, es manté la llista automàtica menys qualsevol columna a la qual una pista hagi donat un paper.
- `axes.up` ha de ser `"y"` o `"z"`, les inversions han de ser booleanes, `scale` ha de ser positiu.
- `entity.size`, quan és positiu, és la mida d'una cosa seguida en les unitats del fitxer ([mida de l'entitat](sessions-persons-groups.md#entity-size)); és l'única manera de fixar-la.

## Problema conegut: canviar el separador del CSV {#known-issue-overriding-the-csv-separator}

Quan canvieu el separador per un de diferent del detectat, la llista de columnes i les files d'exemple
no canvien (la vista prèvia encara divideix amb el separador detectat). El separador triat encara
s'usa per a la càrrega en si. Si el separador detectat és erroni:

1. Obriu el fitxer en un editor de text.
2. Substituïu el separador per una coma a tot arreu (i les comes decimals per punts).
3. Deseu i torneu a carregar el fitxer.

La causa és a [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
