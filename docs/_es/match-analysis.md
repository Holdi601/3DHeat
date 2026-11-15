---
title: "Análisis de partida (CS2)"
nav_order: 10
lang: "es"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: false
---

# Análisis de partida (Counter-Strike 2)

La pestaña **Partida** reproduce una grabación en forma de figuras, y en una partida de Counter-Strike 2 también muestra el marcador: quién ganó cada ronda, cómo, y quién consiguió las bajas. Úsala para revisar una partida ronda a ronda, y luego saltar al mismo momento en el mapa de calor.

La pestaña Partida reproduce cualquier grabación como figuras: una grabación de War Thunder o de Tacview, o una demo de CS2, listadas bajo **Partidas de la repetición** ([Repetición de partida](match-replay.md)). Un archivo `.match.json` de CS2 añade el marcador que se describe en esta página.

## Revisar una partida de CS2 {#review-a-cs2-match}

1. Convierte la demo ([abajo](#where-the-data-comes-from)) en un archivo `.parquet` y un `.match.json`.
2. En la pestaña **Mapa de calor**, carga el archivo `.parquet` bajo **Origen**.
3. Abre la pestaña **Partida** y pulsa **Cargar archivos de partida…**, o suelta el archivo `.match.json` sobre la vista.
4. Haz clic en una partida en **Resúmenes de partida**, luego en una celda de la tira de rondas para abrir esa ronda.
5. Pulsa **Mostrar ronda** para ver esa ronda en el mapa de calor, o **Repetir ronda** para verla como figuras.

![La pestaña Partida: tira de rondas con una ronda abierta, lista de bajas y Marcador](../assets/img/en/match-analysis-round.webp)

Palabras como KAST, ADR, eco, compra forzada y trade están en el [glosario](glossary.md#counter-strike-words).

## De dónde salen los datos {#where-the-data-comes-from}

El convertidor de demos de [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2)
convierte las demos en dos archivos por partida, en una carpeta por mapa:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Archivo | Se carga en | Contiene |
|---|---|---|
| `<match>.parquet` | la pestaña **Mapa de calor** (panel Origen, como cualquier Parquet - uno, varios o toda la carpeta) | la posición de cada jugador ocho veces por segundo, y cada evento donde ocurrió: baja, muerte, daño, disparo, lanzamiento, humo, destello, HE, molotov, señuelo, cegado, colocación, desactivación, explosión; con `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, dirección de mirada, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | la pestaña **Partida** | equipos, marcador, cada ronda (ganador, cómo, economía, la colocación, cada baja en orden, remontadas, supervivientes), la línea del marcador de cada jugador |

El pie del archivo Parquet lleva instrucciones de lectura (clave `heat3d`), así que se abre sin ajustar nada: el jugador como persona, el bando como grupo, cada ronda (`roundId`, "<partida> #NN") como sesión, la dirección de mirada activada, y el mundo en la orientación correcta (el mundo de CS2 es diestro con Z hacia arriba; leído con la asignación por defecto de Z hacia arriba saldría espejado). Ver [Asignación de columnas](column-mapping.md) y [Cargar archivos](loading-files.md).
`python -m heat3d_cs2 map <map>` exporta la geometría del mapa en el mismo marco, que se carga en **Nivel**.

Los criterios detrás de los números son los del convertidor (indicados en su README y guardados en cada resumen): una muerte es **tradeada** cuando quien la causó es abatido por uno de los compañeros de la víctima en **5 s**; **KAST** es la parte de rondas con una baja, una asistencia (una asistencia de destello cuenta), supervivencia o una muerte tradeada; el **daño** es la salud realmente perdida, solo de enemigos; una **remontada** es ser el último vivo de un bando con enemigos en pie, ganada cuando el bando gana; la **compra** por bando sale del valor medio del equipo al final del tiempo de congelación - la primera ronda de cada mitad reglamentaria es una ronda de pistola media (ninguna en la prórroga), luego por debajo de 1.500 $ es eco, por debajo de 4.000 $ compra forzada, y más que eso compra completa.

## La pestaña {#the-tab}

La barra lateral de la pestaña Partida tiene arriba el selector de modo del mapa de calor y el selector de sesión, luego las secciones de la partida, y después los paneles **Filtros**, **Nivel** y **Cámara** del mapa de calor - la vista es el mapa de calor de cualquier Parquet cargado en la pestaña Mapa de calor.

### Resúmenes de partida {#match-summaries}

| Control | Hace |
|---|---|
| **Cargar archivos de partida…** | elige archivos `.json` (varios a la vez): los resúmenes `.match.json` |
| soltar sobre la vista | los archivos JSON soltados sobre la vista con la pestaña Partida abierta se cargan igual (los demás se ignoran) |
| **Vaciar** | quita todas las partidas |
| **Todas las partidas** (con dos o más) | "N partidas · M rondas": las estadísticas de todas ellas |
| una fila de partida | "EquipoA 13 vs EquipoB 9", mapa · N rondas: abre esa partida |

Un archivo se acepta cuando es JSON con `"format": "heat3d-cs2-match"` y los arrays `rounds`, `players` y `teams`. Los errores aparecen bajo los botones: "<archivo>: no es JSON", "<archivo>: no es un resumen de partida de CS2 (heat3d-cs2-match)", "<archivo>: faltan rounds, players o teams". Una partida cargada de nuevo (mismo nombre `match`) sustituye a la anterior. Las partidas se ordenan por mapa y luego por nombre. Con exactamente una partida cargada se abre; si no, la selección se mantiene (todas las partidas por defecto).

Sin nada cargado, la sección lo explica: convierte con `python -m heat3d_cs2 demos`, carga aquí los archivos `.match.json` y los archivos `.parquet` en la pestaña Mapa de calor.

### Partida (una partida abierta) {#match-one-match-open}

**La cabecera:** los dos equipos con su marcador, el mapa, las mitades - "mitades 7-5, 6-6": rondas 1-12 y 13-24 (en juego premier y competitivo MR12; la longitud de mitad propia de un resumen cuando la indica, así que 1-15 y 16-30 para MR15) - luego, cuando la partida fue a prórroga, su marcador por separado: "prórroga 4-2", las rondas después de ambas mitades. Una ronda empatada no cuenta para ningún equipo. Y "N rondas cortadas en la demo" cuando el resumen lista rondas incompletas.

**La tira de rondas:** una celda por ronda, coloreada según el bando que ganó, con su número y una marca de cómo terminó. Una ronda empatada (sin ganador) es una celda gris neutra marcada con `=`, nunca con el color de un bando; su aviso dice "Ronda 30: empate - ningún bando la ganó".

| Marca | Terminó por |
|---|---|
| B | la bomba explotó |
| D | la bomba se desactivó |
| K | eliminados |
| T | se acabó el tiempo |
| S | rendición |
| = | empate |
| ? | otro |

Una línea divisoria marca el inicio de la segunda mitad (la ronda 13, o la ronda después de la longitud de mitad del resumen) y de cada mitad de prórroga de tres rondas (rondas 25, 28, 31, …). Pasa el cursor sobre una celda: "Ronda 7: EquipoA (T) - la bomba explotó, plantada en A" ("…, plantada, sitio desconocido" cuando el resumen no tiene sitio) y la compra y el valor del equipo de ambos bandos. Haz clic para abrir la ronda; haz clic otra vez para cerrarla ("Haz clic en una ronda para ver sus bajas, su economía y su repetición").

**La ronda:**

- "Ronda 7: <equipo> ganó - <cómo>" ("Ronda 30: empate - ningún bando la ganó" para un empate) y cuánto duró la ronda (del fin de congelación al desenlace, m:ss);
- la economía: el equipo de cada bando, la compra (pistola, eco, compra forzada, compra completa) y el valor del equipo ("4.350 $");
- la colocación: sitio, jugador y tiempo en la ronda (de cualquiera de las dos versiones del resumen); "Plantada por <jugador> a 1:05, sitio desconocido" cuando no se conoce el sitio;
- **la lista de bajas**, en orden: tiempo en la ronda, atacante (con el color de su bando; "mundo" si no hubo atacante), arma, y marcas - **HS** cabeza, **WB** a través de una pared, **SM** a través de humo; **abierta** la primera baja de la ronda, **trade** (vengó a un compañero en 5 s), **tradeada** (quien mató fue abatido en 5 s), **equipo** una baja de compañero (un suicidio no cuenta). Las bajas después de decidida la ronda aparecen atenuadas;
- las remontadas: "<jugador> (T) solo contra 3: ganó la remontada" / "la perdió";
- quién seguía vivo al final, por bando ("nadie");
- **Mostrar ronda**: todo lo de esta ronda, en el mapa de calor;
- **Repetir ronda**: reproduce la ronda como cajas, desde su inicio (abajo).

Botones **Mostrar en el mapa de calor** (ver [abajo](#show-in-the-heatmap)) para esta partida, o para la ronda abierta.

### Marcador {#scoreboard}

Una tabla por equipo, una fila por jugador:

| Columna | Es |
|---|---|
| K, D | bajas, muertes |
| A | asistencias, incluidas las de destello |
| ± | bajas menos muertes (verde por encima de 0, rojo por debajo) |
| ADR | daño por ronda, salud realmente perdida |
| KAST | % de rondas con una baja, una asistencia, una supervivencia o una muerte tradeada |
| HS | % de bajas de cabeza |
| Apertura | duelos de apertura ganados-perdidos |
| Rem | remontadas ganadas/jugadas |

Pasa el cursor sobre un jugador: bajas de trade, veces tradeado, asistencias de destello, enemigos cegados, daño de utilidad, y rondas con multibajas ("2×3k"). **Haz clic en un jugador** para ver sus bajas y muertes en el mapa de calor (de esta partida).

### Entre partidas (Todas las partidas) {#across-matches-all-matches}

Sobre cada partida cargada:

- "N partidas · M rondas · <mapas>", y "N rondas empatadas, ganadas por ningún bando" cuando hubo empates;
- **Rondas ganadas** por bando: en total, en rondas de **pistola** (las rondas de pistola del resumen), y en compras **eco**, **forzada** y **completa** (cada una como porcentaje con las rondas jugadas; pasa el cursor para "ganadas de jugadas"). Una ronda empatada la juegan ambos bandos y no la gana ninguno;
- **Bomba**: colocaciones por sitio, y con qué frecuencia el bando T siguió ganando esas rondas ("12 colocaciones en A (T ganó 67 %)"), colocaciones cuyo sitio el resumen no conoce por sí solo ("2 colocaciones en un sitio desconocido (T ganó 50 %)"), o "nunca se colocó"; cómo terminaron las rondas, la más común primero;
- "El bando que consiguió la primera baja ganó el N % de esas rondas." (un suicidio no es primera baja; una ronda empatada no convierte ninguna apertura);
- **Duelos de apertura, dónde**: los diez sitios con más bajas de apertura (según dónde estaba la víctima; los nombres de sitio del juego hechos legibles, "TopofMid" → "Top of Mid"), duelos y la parte que ganó el bando T;
- **Jugadores**: los quince mejores según bajas menos muertes, sumados en todas sus partidas (emparejados por Steam ID): partidas, K-D, ADR y KAST ponderados por las rondas jugadas, % de HS ponderado por bajas, duelos de apertura. **Haz clic en un jugador** para ver sus bajas y muertes en todas las partidas en el mapa de calor.

Los botones de Mostrar en el mapa de calor de todas las partidas cargadas están debajo.

## Mostrar en el mapa de calor {#show-in-the-heatmap}

Cada enlace fija los **filtros** propios del mapa de calor, así que lo que se muestra sigue visible y editable en el panel Filtros, y **Mostrar todos** los borra. Funcionan sobre la tabla del mapa de calor cargada en la pestaña Mapa de calor; la pestaña Partida nunca la carga por sí misma.

| Botón | Eventos que muestra |
|---|---|
| **Posiciones** | `position` - dónde estaban los jugadores, ocho veces por segundo |
| **Bajas** | `kill` - dónde estaba quien mató |
| **Muertes** | `death` - dónde cayó la víctima |
| **Aperturas** | `kill` y `death` con `opening` = 1 - la primera baja de cada ronda, dónde estaban ambos (solo se ofrece cuando la tabla tiene una columna `opening`) |
| **Humos** | `smoke` - dónde cayeron los humos |
| **Destellos** | `flash` - dónde estallaron los destellos |
| **Molotovs** | `molotov` - dónde ardieron los molotovs y las incendiarias |
| **HE** | `he` - dónde estallaron las granadas HE |
| **Colocaciones** | `plant` - dónde se colocó la bomba |
| **Disparos** | `shot` - desde dónde se dispararon los tiros |

Se acota según dónde estén los botones: todas las partidas cargadas, esta partida, o esta ronda ("Mostrar en el mapa de calor - ronda 7").

Lo que no se puede aplicar se dice bajo los botones, no se filtra en silencio hasta quedar en nada: "no se conserva ninguna columna de partida - partida no aplicada", "partida: X no está en los datos cargados", lo mismo para ronda y eventos, "jugador X no está en los datos cargados", "bando X no está en los datos cargados", "no hay datos de mapa de calor cargados: carga los archivos .parquet de las partidas en la pestaña Mapa de calor". Sin datos cargados, los enlaces también dicen "Carga los archivos .parquet de las partidas en la pestaña Mapa de calor para verlos en el mapa."

**Repetir ronda** además cambia el mapa de calor a **Repetición de cajas**, la línea de tiempo a modo *reproducir* con su ventana en *vida útil*, busca el inicio de la sesión de la ronda y reproduce. Cuando la ronda no es una sesión de los datos cargados: "esta ronda no es una sesión de los datos cargados: nada que repetir".

## Para desarrolladores {#for-developers}

Código: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Versiones de resumen {#summary-versions}

La pestaña lee resúmenes de la versión 1 y de la versión 2 (`"version"` en el archivo) uno al lado del otro, y los trata igual:

| | Versión 2 | Versión 1 |
|---|---|---|
| tiempo de colocación | segundos en la ronda, como las bajas | segundos de la partida; la pestaña resta el inicio de la ronda |
| sitio de colocación | `A` o `B`; vacío cuando la demo no lo dice | `A`, `B`, o un número de entidad - se lee como sitio desconocido |
| longitud de mitad | `halfLength`, desde donde los bandos cambian de lado por primera vez; 12 cuando es null | 12 (MR12) |
| rondas de pistola | `pistolRounds` (la ronda 1 y la primera después de la mitad) | las rondas cuya compra es `pistol` |
| ronda empatada | `winner` y `winnerTeam` vacíos | - |
| suicidio | `suicide` en la baja, nunca una baja de compañero | se deduce de que atacante y víctima son el mismo jugador |

El `noscope` y el `attackerBlind` de una baja (versión 2) no se muestran en la pestaña Partida, que tampoco muestra ningún lugar de la tabla del mapa de calor, así que un `place` vacío en una fila de granada no cambia nada aquí.

Cómo se convierte un foco en filtros (`focusFilters`):

- **partida** → un filtro de categoría sobre la columna `match`;
- **ronda** → un filtro de rango `round` = N sobre una columna numérica `round` (un filtro de categoría sobre una categórica), y la sesión de la ronda (`<partida> #NN`) se selecciona en el selector de sesiones;
- **eventos** → un filtro de categoría sobre la columna `event`;
- **jugador** → un filtro de persona sobre ese jugador;
- **bando** → un filtro de grupo.
