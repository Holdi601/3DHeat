---
title: "Anàlisi de partides (CS2)"
nav_order: 10
lang: "ca"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: false
---

# Anàlisi de partides (Counter-Strike 2)

La pestanya **Partida** reprodueix una gravació com a figures, i per a una partida de Counter-Strike 2 també mostra el marcador: qui va guanyar cada ronda, com, i qui va fer les baixes. Usa-la per revisar una partida ronda a ronda, i després salta al mateix moment al mapa de calor.

La pestanya Partida reprodueix qualsevol gravació com a figures: una gravació de War Thunder o de Tacview, o una demo de CS2, llistada sota **Partides de la repetició** ([Repetició de partida](match-replay.md)). Un fitxer `.match.json` de CS2 afegeix el marcador que es descriu en aquesta pàgina.

## Revisar una partida de CS2 {#review-a-cs2-match}

1. Converteix la demo ([a sota](#where-the-data-comes-from)) a un fitxer `.parquet` i a un fitxer `.match.json`.
2. A la pestanya **Mapa de calor**, carrega el fitxer `.parquet` sota **Origen**.
3. Obre la pestanya **Partida** i fes clic a **Carrega fitxers de partida…**, o deixa anar el fitxer `.match.json` sobre la vista.
4. Fes clic en una partida a **Resums de partida**, i després en una cel·la de la franja de rondes per obrir aquella ronda.
5. Fes clic a **Mostra la ronda** per veure aquella ronda al mapa de calor, o a **Repeteix la ronda** per veure-la com a figures.

![La pestanya Partida: franja de rondes amb una ronda oberta, fil de baixes i Marcador](../assets/img/en/match-analysis-round.webp)

Paraules com KAST, ADR, eco, compra de força i trade són al [glossari](glossary.md#counter-strike-words).

## D'on surten les dades {#where-the-data-comes-from}

El convertidor de demos de [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2) converteix les demos en dos fitxers per partida, en una carpeta per mapa:

```bash
python -m heat3d_cs2 demos <fitxers o carpetes de demo> -o out
```

| Fitxer | Carregat a | Conté |
|---|---|---|
| `<partida>.parquet` | la pestanya **Mapa de calor** (panell Origen, com qualsevol Parquet - un fitxer, diversos, o la carpeta sencera) | la posició de cada jugador vuit cops per segon, i cada esdeveniment on va passar: baixa, mort, ferit, tret, llançament, fum, flaix, HE, molotov, parany, cegament, plantada, desactivació, explosió; amb `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, direcció de mirada, `weapon`, `place`, `opening`, `traded`... |
| `<partida>.match.json` | la pestanya **Partida** | equips, puntuació, cada ronda (guanyador, com, economia, la plantada, cada baixa en ordre, clutches, supervivents), la línia del marcador de cada jugador |

El peu del fitxer Parquet porta les instruccions de lectura (clau `heat3d`), així que s'obre sense haver de configurar res: el jugador com a persona, el bàndol com a grup, cada ronda (`roundId`, «<partida> #NN») com a sessió, la direcció de mirada activada, i el món en el sentit correcte (el món de CS2 és dretà amb Z amunt; llegit amb l'assignació Z amunt per defecte sortiria emmirallat). Vegeu [Assignació de columnes](column-mapping.md) i [Carregar fitxers](loading-files.md). `python -m heat3d_cs2 map <mapa>` exporta la geometria del mapa al mateix marc, que es carrega a **Nivell**.

Les convencions darrere dels números són les del convertidor (indicades al seu README i incloses en cada resum): una mort és **venjada** quan el seu assassí és mort per un dels companys de la víctima dins de **5 s**; **KAST** és la part de rondes amb una baixa, una assistència (una assistència de flaix compta), supervivència o una mort venjada; el **dany** és la salut realment perduda, només els enemics; un **clutch** és ser l'últim viu d'un bàndol amb enemics en peu, guanyat quan guanya el bàndol; la **compra** de cada bàndol surt del valor mitjà de l'equip al final del temps congelat - la primera ronda de cada meitat reglamentària és una ronda de pistola de mig valor (cap en pròrroga), després per sota de 1.500 $ un eco, per sota de 4.000 $ una compra de força, i qualsevol cosa més una compra completa.

## La pestanya {#the-tab}

La barra lateral de la pestanya Partida té a la part superior el selector de mode del mapa de calor i el selector de sessions, després les seccions de la partida, i després els panells **Filtres**, **Nivell** i **Càmera** del mapa de calor - la vista és el mapa de calor de qualsevol Parquet carregat a la pestanya Mapa de calor.

### Resums de partida {#match-summaries}

| Control | Fa |
|---|---|
| **Carrega fitxers de partida…** | tria fitxers `.json` (diversos alhora): els resums `.match.json` |
| deixar anar sobre la vista | els fitxers JSON deixats sobre la vista mentre la pestanya Partida és oberta es carreguen de la mateixa manera (els altres fitxers s'ignoren) |
| **Esborra** | elimina totes les partides |
| **Totes les partides** (amb dues o més) | «N partides, M rondes»: les estadístiques de totes elles |
| una fila de partida | «EquipA 13 contra EquipB 9», mapa · N rondes: obre aquella partida |

S'accepta un fitxer quan és JSON amb `"format": "heat3d-cs2-match"` i les matrius `rounds`, `players` i `teams`. Els errors es llisten sota els botons: «<fitxer>: no és JSON», «<fitxer>: no és un resum de partida de CS2 (heat3d-cs2-match)», «<fitxer>: falten rounds, players o teams». Una partida carregada de nou (mateix nom `match`) substitueix l'anterior. Les partides s'ordenen per mapa i després pel nom. Amb una sola partida carregada, s'obre; si no, la selecció es manté (totes les partides per defecte).

Sense res carregat, la secció explica: converteix amb `python -m heat3d_cs2 demos`, carrega aquí els fitxers `.match.json` i els fitxers `.parquet` a la pestanya Mapa de calor.

### Partida (una partida oberta) {#match-one-match-open}

**La capçalera:** els dos equips amb la seva puntuació, el mapa, les meitats - «meitats 7-5, 6-6»: rondes 1-12 i 13-24 (el joc competitiu i premier és MR12; la durada pròpia de la meitat del resum quan n'indica una, així que 1-15 i 16-30 per a MR15) - després, quan la partida va anar a pròrroga, la seva puntuació per separat: «pròrroga 4-2», les rondes després de les dues meitats. Una ronda empatada no compta per a cap equip. I «N rondes tallades a la demo» quan el resum llista rondes incompletes.

**La franja de rondes:** una cel·la per ronda, de color del bàndol que va guanyar, amb el seu número i una marca de com va acabar. Una ronda empatada (sense guanyador) és una cel·la gris neutra marcada `=`, mai del color d'un bàndol; la seva descripció diu «Ronda 30: empat - cap dels dos bàndols no la va guanyar».

| Marca | Acabada per |
|---|---|
| B | la bomba va explotar |
| D | la bomba es va desactivar |
| K | eliminat |
| T | s'acabà el temps |
| S | rendició |
| = | empat |
| ? | altre |

Una línia divisòria marca l'inici de la segona meitat (ronda 13, o la ronda després de la durada de meitat del resum) i de cada meitat de pròrroga de tres rondes (rondes 25, 28, 31, ...). Passa el cursor per sobre d'una cel·la: «Ronda 7: EquipA (T) - bomba explotada, plantada A» («…, plantada, lloc desconegut» quan el resum no té lloc) i la compra i el valor de l'equip de tots dos bàndols. Fes clic per obrir la ronda; fes-hi clic de nou per tancar-la («Fes clic en una ronda per veure'n les baixes, l'economia i la repetició.»).

**La ronda:**

- «Ronda 7: <equip> va guanyar - <com>» («Ronda 30: empat - cap dels dos bàndols no la va guanyar» per a un empat) i quant va durar la ronda (del final del temps congelat fins a la decisió, m:ss);
- l'economia: l'equip de cada bàndol, la compra (pistola, eco, compra de força, compra completa) i el valor de l'equip («4.350 $»);
- la plantada: el lloc, el jugador i el temps dins de la ronda (de qualsevol versió del resum); «Plantada per <jugador> a 1:05, lloc desconegut» quan no se sap el lloc;
- **el fil de baixes**, en ordre: el temps dins de la ronda, l'atacant (de color del bàndol; «món» quan no hi ha atacant), l'arma, i les marques - **HS** tret al cap, **WB** a través d'una paret, **FM** a través del fum; **obertura** la primera baixa de la ronda, **trade** (ha venjat un company dins de 5 s), **venjat** (l'assassí va ser mort dins de 5 s), **equip** una baixa d'equip (un suïcidi no n'és cap). Les baixes després que la ronda estigués decidida es mostren atenuades;
- els clutches: «<jugador> (T) sol contra 3: va guanyar el clutch» / «el va perdre»;
- qui estava viu al final, per bàndol («ningú»);
- **Mostra la ronda**: tot el que hi ha en aquesta ronda, al mapa de calor;
- **Repeteix la ronda**: reprodueix la ronda com a caixes, des del seu inici (a sota).

Els botons **Mostra al mapa de calor** (vegeu [a sota](#show-in-the-heatmap)) per a aquesta partida, o per a la ronda oberta.

### Marcador {#scoreboard}

Una taula per equip, una fila per jugador:

| Columna | És |
|---|---|
| K, D | baixes, morts |
| A | assistències, incloses les assistències de flaix |
| ± | baixes menys morts (verd per sobre de 0, vermell per sota) |
| ADR | dany per ronda, salut realment perduda |
| KAST | % de rondes amb una baixa, una assistència, supervivència o una mort venjada |
| HS | % de baixes amb tret al cap |
| Obertura | duels d'obertura guanyats-perduts |
| Cl | clutches guanyats/jugats |

Passa el cursor per sobre d'un jugador: baixes de trade, vegades venjat, assistències de flaix, enemics encegats, dany d'utilitat, i rondes de múltiples baixes («2×3k»). **Fes clic en un jugador** per veure les seves baixes i morts al mapa de calor (d'aquesta partida).

### Entre partides (Totes les partides) {#across-matches-all-matches}

Sobre totes les partides carregades:

- «N partides · M rondes · <mapes>», i «N rondes empatades, guanyades per cap bàndol» quan n'hi va haver;
- **Rondes guanyades** per bàndol: en total, en rondes de **pistola** (les rondes de pistola del resum), i en compres **eco**, de **força** i **plenes** (cadascuna com un percentatge amb les rondes jugades; passa el cursor per veure «guanyades de les jugades»). Una ronda empatada la juguen tots dos bàndols i no la guanya cap;
- **Bomba**: plantades per lloc, i amb quina freqüència el bàndol T va acabar guanyant aquestes rondes («12 plantades a A (T va guanyar el 67%)»), plantades el lloc de les quals el resum no coneix per si sol («2 plantades en un lloc desconegut (T va guanyar el 50%)»), o «mai no es va plantar»; com van acabar les rondes, la més comuna primer;
- «El bàndol que va fer la primera baixa va guanyar el N% d'aquestes rondes.» (un suïcidi no és una primera baixa; una ronda empatada no converteix cap obertura);
- **Duels d'obertura, on**: els deu llocs amb més baixes d'obertura (segons on era la víctima; els noms de lloc del joc fets llegibles, «TopofMid» → «Top of Mid»), els duels i la part que va guanyar el bàndol T;
- **Jugadors**: els quinze millors per baixes menys morts, combinats sobre totes les seves partides (identificats per l'ID de Steam): partides, K-D, ADR i KAST ponderats per les rondes jugades, HS% ponderat per baixes, duels d'obertura. **Fes clic en un jugador** per veure les seves baixes i morts en totes les partides al mapa de calor.

Els botons Mostra al mapa de calor de totes les partides carregades es troben sota.

## Mostra al mapa de calor {#show-in-the-heatmap}

Cada enllaç posa els **filtres** del propi mapa de calor, així que el que es mostra es queda visible i editable al panell Filtres, i **Mostra-ho tot** els esborra. Funcionen sobre la taula del mapa de calor carregada a la pestanya Mapa de calor; la pestanya Partida mai no la carrega per si mateixa.

| Botó | Esdeveniments mostrats |
|---|---|
| **Posicions** | `position` - on eren els jugadors, vuit cops per segon |
| **Baixes** | `kill` - on era l'assassí |
| **Morts** | `death` - on va caure la víctima |
| **Obertures** | `kill` i `death` amb `opening` = 1 - la primera baixa de cada ronda, on eren els dos (només s'ofereix quan la taula té una columna `opening`) |
| **Fums** | `smoke` - on van caure els fums |
| **Flaixos** | `flash` - on van esclatar els flaixos |
| **Molotovs** | `molotov` - on van cremar els molotovs i les incendiàries |
| **HE** | `he` - on van explotar les granades HE |
| **Plantades** | `plant` - on es va plantar la bomba |
| **Trets** | `shot` - des d'on es van disparar els trets |

Limitat per on són els botons: totes les partides carregades, aquesta partida, o aquesta ronda («Mostra al mapa de calor - ronda 7»).

Allò que no es pot aplicar es diu sota els botons, no es filtra en silenci fins a no res: «no s'ha conservat cap columna de partida - partida no aplicada», «partida: X no és a les dades carregades», el mateix per a la ronda i els esdeveniments, «jugador X no és a les dades carregades», «bàndol X no és a les dades carregades», «no hi ha dades de mapa de calor carregades: carrega els fitxers .parquet de les partides a la pestanya Mapa de calor». Sense dades carregades, els enllaços també diuen «Carrega els fitxers .parquet de les partides a la pestanya Mapa de calor per veure'ls al mapa.»

**Repeteix la ronda** a més canvia el mapa de calor a **Repetició de caixes**, la línia de temps a mode *reproduir* amb la finestra posada a *durada de vida*, va al començament de la sessió de la ronda i reprodueix. Quan la ronda no és una sessió de les dades carregades: «aquesta ronda no és una sessió de les dades carregades: res per repetir».

## Per a desenvolupadors {#for-developers}

Codi: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Versions del resum {#summary-versions}

La pestanya llegeix els resums de la versió 1 i de la versió 2 (`"version"` al fitxer) un al costat de l'altre, i els tracta igual:

| | Versió 2 | Versió 1 |
|---|---|---|
| temps de plantada | segons dins de la ronda, com les baixes | segons de partida; la pestanya resta l'inici de la ronda |
| lloc de plantada | `A` o `B`; buit quan la demo no ho diu | `A`, `B`, o un número d'entitat - llegit com a lloc desconegut |
| durada de la meitat | `halfLength`, des d'on els bàndols canvien per primera vegada; 12 quan és null | 12 (MR12) |
| rondes de pistola | `pistolRounds` (la ronda 1 i la primera ronda després de la meitat) | les rondes amb compra `pistol` |
| ronda empatada | `winner` i `winnerTeam` buits | - |
| suïcidi | `suicide` a la baixa, mai una baixa d'equip | indicat quan l'atacant i la víctima són el mateix jugador |

El `noscope` i l'`attackerBlind` d'una baixa (versió 2) no es mostren a la pestanya Partida, que tampoc mostra cap lloc de la taula del mapa de calor, així que el `place` buit d'una fila de granada allà no canvia res aquí.

Com un focus esdevé filtres (`focusFilters`):

- **match** → un filtre de categoria sobre la columna `match`;
- **round** → un filtre de rang `round` = N sobre una columna numèrica `round` (un filtre de categoria sobre una de categòrica), i la sessió de la ronda (`<partida> #NN`) es selecciona al selector de sessions;
- **events** → un filtre de categoria sobre la columna `event`;
- **player** → un filtre de persona sobre aquell jugador;
- **side** → un filtre de grup.
