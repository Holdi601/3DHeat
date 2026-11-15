---
title: "Altres jocs de curses"
parent: "Anàlisi de curses"
nav_order: 59
lang: "ca"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---


# Altres jocs de curses al visor

El visor llegeix voltes de molts jocs de curses, no només d'un. Aquesta pàgina els enumera i explica com treure una volta de cadascun.

## Els jocs {#the-games}

| Joc | Gravador | Lliscament al fitxer? | Món emmirallat? | Notes |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out per UDP), o els fitxers de volta de FH Companion més els seus `.tele.gz` | sí, per roda (normalitzat) | sí (món d'orientació esquerra) | el `.tele.gz` al costat de cada volta de FH Companion dóna el lliscament de cada roda; el fitxer de volta sol no el dóna |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (memòria compartida) | sí, per roda | mesurat des de les voltes | també l'ABS i el control de tracció en acció, càrregues de roda, temperatures |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | no, calculat a partir de la velocitat de les rodes | mesurat des de les voltes | ral·li: el terreny solt i els salts es jutgen de manera diferent |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | no | mesurat des de les voltes | sense velocitats de roda |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (un mod) | no, calculat a partir de la velocitat de les rodes | mesurat des de les voltes | |
| Trackmania | el connector d'Openplanet, `telemetry --game trackmania --install` | un coeficient de lliscament per roda | mesurat des de les voltes | física d'arcade: els relliscaments es jutgen de manera diferent |
| iRacing | cap: el seu propi fitxer `.ibt` | no (no es registra); calculat a partir del guinyament | no (basat en GPS) | activa el registre al cotxe amb Alt+L |

## Com gravar una volta {#how-to-record-a-lap}

1. Tria el teu joc a la taula i configura'l com indica la pàgina del gravador per a aquest joc (una opció del joc, un mod o res en absolut en el cas d'iRacing). Els passos canvien segons el joc, així que són als documents dels gravadors: [GameCapture: jocs](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Inicia el gravador i conduceix. Escriu un fitxer per volta.
3. A la pestanya **Anàlisi de curses** prem **Carrega fitxers de volta…** i tria dues o més voltes del mateix circuit (vegeu [Carregar voltes](race-loading-laps.md)).

Per als jocs de ral·li, el gravador dona un fitxer per cada tram. Per a Forza, la manera més fàcil de començar és la biblioteca de FH Companion amb els seus fitxers `.tele.gz` al costat dels fitxers de volta.

## Què documenten els gravadors {#what-the-recorders-document}

Com es grava cada joc, què envia, les fonts dels seus formats i quins circuits es poden exportar des dels seus fitxers ho documenten els gravadors: [GameCapture: jocs](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (públic, a [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). El fitxer de volta que escriu cada gravador és a [GameCapture: el format de volta](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Què fa el visor amb elles {#what-the-viewer-does-with-them}

Cada joc acaba en fitxers `heat3d-lap` (o en un CSV de volta, o es llegeix directament, com el `.ibt` d'iRacing), amb els noms de canal canònics de `src/race/schema.ts` i un bloc `meta` que explica què signifiquen els seus números: com s'escala el seu lliscament, circuit, ral·li o arcade, i la superfície quan es coneix. Així la pestanya **Anàlisi de curses** els tracta tots igual. Quan no hi ha cap model de circuit carregat, la pestanya **Anàlisi de curses** dibuixa una carretera a partir de la dispersió de les pròpies voltes, de manera que cada joc es pot usar sense model.

Allò que cap dels jocs de ral·li envia, el lliscament dels pneumàtics, el visor el calcula: a partir de la superfície de contacte o la velocitat de superfície de cada roda comparada amb la velocitat del cotxe quan un joc n'envia una (`(roda - cotxe) / cotxe`), i a partir de la seva rotació i d'un radi de rodolament mesurat a la mateixa volta quan només envia la rotació. L'angle de deriva surt de la pròpia velocitat del cotxe (Forza, els jocs AC, Trackmania, RBR), de la velocitat del món projectada sobre els eixos del cotxe (EA WRC, DiRT, BeamNG), o de l'orientació respecte al camí. Si el cotxe és a l'aire ho diuen el contacte de les rodes, les càrregues o la suspensió. Vegeu `src/race/derive.ts`.

Quan el món d'un joc és d'orientació esquerra, com el de Forza, el circuit surt emmirallat al visor; la direcció i la suspensió de les voltes ho delaten, i la pestanya **Anàlisi de curses** ofereix invertir un eix. Els jocs l'orientació dels quals no està documentada (RBR, BeamNG, Trackmania) es tracten de la mateixa manera: es mesura, no se suposa.

Més enllà dels canals de conducció, els gravadors guarden el que afegeix cada joc: l'ABS i el control de tracció dels jocs AC en acció, la distribució de frenada, el DRS, el limitador de pit, el turbo i la vida de les pastilles i dels discos de fre; les opcions d'ajuda d'iRacing, la distribució de frenada, el combustible, l'oli i les temperatures de l'aigua, i tots els altres canals que registra amb el seu propi nom. El visor els dibuixa des de la seva taula de canals (llums, nivells, glifs, gràfics), de manera que gravar més no requereix cap canvi al visor.
