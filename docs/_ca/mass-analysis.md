---
title: "Anàlisi massiva"
nav_order: 8
lang: "ca"
source: "mass-analysis.md"
source_hash: "88fad1d761e0"
translated: true
outdated: false
---

# Anàlisi massiva: milers de partides alhora

L'**Anàlisi massiva** et mostra què sumen una carpeta sencera de partides: quin vehicle guanya més, quin bàndol té avantatge, on és l'acció. Usa-la quan tens moltes més partides de les que podries mirar.

Funciona a partir d'un petit resum de cada partida, així que milers o deu mil partides s'obren de pressa. Només carrega les files completes de les partides que cliques.

## Prova-ho {#try-it}

1. Obre **Anàlisi massiva** a la barra lateral del Mapa de calor.
2. Prem **Carpeta...** (o **Fitxers...**) i tria les teves partides `.3dheat`.
3. Espera mentre el panell llegeix els resums («Resums... n de N»).
4. Prem **Obre l'anàlisi**. S'obre una finestra amb pestanyes.
5. Defineix els filtres (Joc, Mapa, Mode, De, A) i després llegeix una pestanya, per exemple Equilibri.
6. Fes clic en una fila, en una cel·la o en una troballa: les seves partides es carreguen a la vista 3D, amb la càmera al lloc.

![La pestanya Equilibri: percentatge de victòries i morts per vehicle](../assets/img/en/mass-balance.webp)

```
carpeta de .3dheat -> resums -> finestra (pestanyes) -> clic en una fila -> partides obertes en 3D
```

Un fitxer `.3dheat` és una partida ([Un fitxer per partida](container.md)). Un *mapa de calor* i una *fila* s'expliquen al [glossari](glossary.md).

## Obtenir els resums {#getting-the-summaries}

No cal fer res per a la majoria de persones: el panell calcula ell mateix els resums que falten. Per preparar una carpeta gran una sola vegada, usa l'eina fora de línia de sota.

Cada partida `.3dheat` rep un resum (`src/mass/summarize.ts`), guardat dins del contenidor com el membre `<match>.summary.json` (rol `summary`, vegeu [Un fitxer per partida](container.md)). L'eina fora de línia els escriu, i un índex per carpeta. És una eina per a desenvolupadors; executa-la sobre una carpeta gran per estalviar feina al panell:

```
node tools/3dheat-summarize.mjs <carpeta>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Una partida ja resumida (mateixa versió de format) només es llegeix; `--force` la torna a calcular. `--no-write` deixa els contenidors intactes.
- Un fitxer canviat en els últims `--settle` minuts (10) queda fora: un convertidor pot encara estar-lo escrivint.
- `<carpeta>/3dheat-index.jsonl.gz`: una línia per partida - la seva ruta, mida, hora i resum sense la graella. `<carpeta>/3dheat-index.grids.jsonl.gz`: una línia per partida amb la seva graella.
- Executa-la a la màquina que té els fitxers, amb baixa prioritat (per exemple `nice -n 19 ionice -c3` a Linux).

El panell, per a cada partida, pren el primer que trobi: la línia d'índex de la carpeta (mateixa ruta i mida), la memòria cau del navegador (IndexedDB, pel nom, la mida i l'hora), el membre `summary` del contenidor, o un resum calculat en un grup de treballadors i guardat a la memòria cau. Així, una carpeta sense índex també funciona: la primera vegada a la velocitat de llegir les taules, després des de la memòria cau.

## El panell {#the-panel}

Tria una carpeta (o fitxers; **Afegeix carpeta...** n'afegeix una altra). La finestra té els filtres **Joc**, **Mapa**, **Mode**, **De** i **A**, una opció **Divideix per**, **Menys vides** i **Només jugadors**, i aquestes pestanyes. Tots els números surten dels resums, i un clic en una fila, una cel·la o una troballa carrega les seves partides a la vista com a superposició de moltes partides, amb els filtres que la mostren (vehicle, classe, arma, equip, jugador) i la càmera al lloc:

| Pestanya | Què |
|---|---|
| Resum general | partides, hores, jugadors, vides, files, dates; partides per dia; per joc, mapa, mode; totals d'esdeveniments; economia per moneda; quan dins de la partida passen les coses |
| Equilibri | per vehicle, classe, arma o equip; dividit per mapa, mode, nivell o joc: K/D amb el seu interval del ~95%, percentatge de victòries (Wilson), supervivència, morts i impactes per minut, guanys per minut, i q - la taxa de falsos descobriments de Benjamini-Hochberg de K/D i victòria contra la resta de la divisió. **Menys vides** amaga les files amb massa poques vides per fiar-se'n; **Només jugadors** deixa fora el que conduïa la IA de la missió |
| Tendències | ús (part de la presència), K/D o percentatge de victòries dels vehicles o classes principals per dia, setmana o mes |
| Jugadors | jugadors diferents, partides per jugador, jugadors per partida, els jugadors més freqüents |
| Bàndols | cada bàndol de cada mapa: partides guanyades contra una divisió igualada |
| Combat proper | dades de rondes: duels d'obertura per bàndol i la seva conversió, intercanvis, qui assoma contra qui està aguantant, creuaments, entrades cegades per flaix, punteria, plantes, avantatge d'homes i, **Per mapa**, els llocs que maten els jugadors que hi entren - cadascun com una part amb el seu interval de Wilson, a partir dels recomptes `cqb` dels resums ([Combat proper i rondes](close-quarters.md)) |
| Mapa | la graella sumada d'un mapa: presència, morts, baixes, K/D, qualsevol esdeveniment, flux, i **calent en quantes partides** (estabilitat); per equip, a 1, 2, 4 o 8 vegades la cel·la |
| Llocs | llocs que destaquen en els números però no en el mapa de calor (una àrea gran plena en conjunt, corredors, franges d'altura); **Troba llocs** |
| Nínxols | grups que van clarament millor o pitjor que la resta (un vehicle en un mapa, un sector a una altura); **Troba nínxols** |
| Troballes | els detectors massius i els detectors de mapa (a sota); **Copia l'informe (JSON)** dóna el JSON que llegeix un model de llenguatge |

## Troballes sobre moltes partides {#insights-over-many-matches}

La pestanya **Llocs** troba els llocs que destaquen en els números però no en el mapa de calor - una àrea gran plena en conjunt, un corredor, una franja d'altura, un lloc ple només en una part de la partida - marca com a **amagats** els que el mapa de calor simple no mostra, i els delimita a la vista 3D; **Carrega** hi vola amb les partides que tenia. La pestanya **Nínxols** troba grups (un vehicle en un mapa i un bàndol, un sector a una altura) que van clarament millor o pitjor que la resta; fes clic en un per veure els seus refinaments.

La pestanya **Troballes** troba, sobre totes les partides, vehicles que comercien o guanyen millor o pitjor que la resta, llocs calents en una part estable de partides, bàndols que guanyen més que una divisió igualada, vehicles l'ús dels quals canvia amb les dates, i parts de la partida que acumulen més morts que una distribució igual. Cada troballa porta els seus recomptes, efecte, interval i una taxa de falsos descobriments (mantinguda al 5%), i un clic carrega les seves partides. Detalls: [Per a desenvolupadors](#for-developers).

## Escala {#scale}

Pots repetir tu mateix una versió petita d'això: `node tools/demo-data.mjs` escriu 150 partides de tancs sintètiques a `tools/.shots/demo/mass` (unes 1.000 files cadascuna). Mesurat sobre aquestes 150 partides sintètiques de demostració de `tools/demo-data.mjs` en un ordinador de sobretaula (una partida real és molt més gran):

- `tools/3dheat-summarize.mjs` amb 4 treballadors: de 2,6 a 4,8 s per a les 150, de 8 a 21 ms per partida dins d'un treballador; una segona execució que només llegeix els resums triga uns 2 s.
- Obrir la carpeta al panell, amb l'índex present, fins que la finestra es mostra: de 0,9 a 1,6 s (la part del propi treballador, llegir les 150 línies d'índex, és de 20 a 40 ms).
- Canviar de pestanya, fins que la seva taula es dibuixa: Resum general de 10 a 30 ms, Equilibri de 30 a 70 ms, Tendències de 30 a 45 ms, Jugadors de 15 a 35 ms, Bàndols de 15 a 20 ms, Mapa de 55 a 130 ms.
- L'emmagatzematge guarda les 150 partides en uns 0,5 MB.

Obrir la finestra triga un fotograma curt: els fitxers triats van al treballador de 16 en 16, i els camps de data i la primera pestanya apareixen un fotograma després de la finestra.

L'emmagatzematge guarda uns 15 KB per partida, així que 10.000 partides ocupen uns 150 MB al treballador; les graelles mai no es mantenen més de l'que demana el mapa.

## Per a desenvolupadors {#for-developers}

### Troballes sobre moltes partides {#insights-over-many-matches}

`src/mass/detect.ts` - cada troballa amb els seus recomptes, efecte i interval, p i q (Benjamini-Hochberg sobre tot el que va provar el detector, mantingut al 5%), la desagregació que carrega les seves partides i una clau de frase amb els seus valors; l'informe (`heat3d.mass/1`) és el que `massReportForModel` lliura a un narrador, de la mateixa forma que l'informe d'una sola partida (`insights/seam.ts`).

| Detector | Troba |
|---|---|
| `balance` | un vehicle de jugador que comercia o guanya millor o pitjor que la resta en un mapa o en un mode |
| `hotspot` | llocs calents en una part estable de les partides que han arribat (partides calentes / partides vistes, contra les altres cel·les del mapa) - no només calents en suma |
| `side` | un bàndol d'un mapa que guanya més que una divisió igualada |
| `meta` | la part de les vides de jugadors d'un vehicle, o el seu K/D, que es mou entre la meitat anterior i la posterior de les dates, per mapa - prou gran per importar, en tendència sobre els trimestres, de la mateixa manera en la majoria de mapes (a continuació) |
| `phase` | una part de la durada de la partida que acumula més morts, impactes, llançaments... que una distribució igual |
| `place` | llocs que destaquen sobre moltes partides (Fase B, a continuació): la taxa d'una regió o la part de morts contra la de cada partida, cercles, corredors, zones crescudes, franges d'altura, fases; amagat quan la simple mapa de calor no els mostra |
| `niche` | grups que van clarament millor o pitjor (Fase B, a continuació) |
| `grid.*` | els detectors d'un sol conjunt de dades (posicions de potència, zones calentes i tranquil·les, llocs de classe) sobre les graelles sumades de cada mapa: `GridMerge.toInsightJob` omple les graelles de la passada de troballes a partir dels resums; els detectors que necessiten trajectòries se salten |

### El resum {#the-summary}

JSON simple (`src/mass/types.ts`), uns 5-30 KB comprimits per partida:

- la partida: joc, mapa, mode, missió, inici, durada, files, vides, jugadors,
  IA, equips (vides, jugadors, presència, morts, baixes, guanyat, diners), guanyador;
- per vehicle i per equip: classe, nivell, vides, vides de jugadors, presència, esdeveniments
  per tipus canònic, morts per classe de l'objectiu, victòries, diners;
- per jugador (per id d'usuari, si no pel nom): equip, vides, presència, morts, baixes,
  impactes, llançaments, guanyat, vehicles; per arma: esdeveniments per tipus;
- les columnes de l'economia (`cost_*`, `earn_*`) i els seus totals;
- fases: esdeveniments per tipus en 20 franges de la durada de la partida i per minut;
- comportament: les mesures de comportament col·lectiu de la partida (alineació, arrossegament
  de rutes, carrils, aglomeració, líders, rezagats, punt de ruptura, risc després de pèrdues,
  ratxes, acord de compra, supressió), cadascuna amb el seu propi model nul, p i q - vegeu [Comportament col·lectiu](collective-behaviour.md);
- la graella (a continuació).

Comptat com ho compta el visor: columnes trobades com les troba el carregador de moltes partides
(`leanSpec`), esdeveniments per `data/canonical.ts`; una mort que una arma del Tacview
puntua compta per al seu tirador; una mort dita dues vegades alhora (`dead`, `death`) compta una sola vegada.

#### La graella: sobre què construeix la Fase B {#the-grid-what-stage-b-builds-on}

La part espacial està feta per a estadístiques d'exploració sobre regions de qualsevol mida i forma, no només per a imatges de mapes de calor:

- **Una piràmide.** Les cel·les són potències de dos alineades en unitats del món (x, z tal com el visor les col·loca). El nivell `k` són les cel·les sumades per `ix >> k, iz >> k` - exacte, dins d'una partida i entre partides de mides de cel·la diferents - i qualsevol regió (una caixa, un corredor al llarg d'una línia, un anell) és una suma de cel·les. El nivell més fi s'ajusta a l'extensió robusta de la partida (les cel·les que contenen el 99% de la presència) en 128 cel·les; els valors fora queden guardats.
- **Exposició al costat de cada recompte.** Segons de presència per cel·la, per equip (`pt`), per classe de vehicle (`pc`) i per franja d'altura (`ph`), de manera que la taxa, l'expectativa i la raó d'una regió es calculen per a qualsevol subgrup.
- **Altura.** Franges per sobre del terra de la partida (el 1r percentil d'altura): menys de 3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, per sobre; un fitxer amb una columna `floor`/`storey`/`deck` les agrupa per les seves plantes. `y` és l'altura mitjana de cada cel·la, `y0` la més baixa (la seva planta, per a l'altura per sobre d'ella).
- **Esdeveniments** com a tuples `[cel·la, tipus, equip, classe, franja, recompte]`.
- **Llesques de temps** a un nivell gruixut (8 cel·les per costat), per minut des de l'inici de la partida: `[cx, cz, minut, tipus, valor]`, els segons de presència com a tipus `GRID_KINDS.length`; les fases de la partida són minuts sobre la durada.
- Dispers, recomptes enters, segons a una desena: limitat pel que ha passat.

### Fase B: llocs i nínxols {#stage-b-places-and-niches}

La Fase B busca el que destaca en els números sense cridar l'atenció: una àrea gran plena en conjunt sense cap cel·la calenta, una proporció estranya de morts entre mort i baixa en pocs esdeveniments, un corredor, una franja d'altura, un grup que només hi és en una part de la partida - i grups (un vehicle en un mapa en un bàndol, un sector a una altura) que van clarament millor o pitjor que la resta. Un sol **Troba llocs** / **Troba nínxols** / **Cerca conclusions** executa tots els detectors; les tres pestanyes comparteixen l'informe.

#### Llocs (`src/mass/scan.ts`) {#places-srcmassscants}

Les partides de cada mapa es llegeixen dues vegades, una partida a la vegada; la memòria guarda sumes en una graella de com a màxim 64 cel·les per costat (16 per a l'exploració espai-temps), mai les partides.

- **Mesures.** La taxa d'un esdeveniment per segon de presència - morts, baixes, impactes, llançaments, captures, per a totes les unitats, per classe (les 4 amb més esdeveniments), per franja d'altura - i la part de morts en baixes i morts (totes, per bàndol, per franja). Quines classes i bàndols surten dels caps (`planOf`).
- **Expectativa per partida.** La pròpia dispersió de la taxa de cada partida repartida sobre la seva pròpia presència en una cel·la és l'expectativa de la cel·la (una exploració de Kulldorff ajustada per covariables i estratificada per partida): unes quantes partides sagnants o un servidor molt ocupat no fan cap lloc.
- **Dispersió.** Les partides no coincideixen gens amb Poisson. Els residus de cada partida se sumen en blocs d'1, 2, 4, 8, 16 cel·les; la dispersió de cada mida de bloc (residus al quadrat sobre la variància nul·la, agrupats, deixant fora el 5% dels blocs pitjors) escala cada prova d'una regió d'aquella mida: un quocient de versemblança quasi, Poisson per a taxes, binomial per a parts.
- **Regions.** Cercles de 0,75 a 18 cel·les; el·lipses en sis angles, 3 i 6 vegades tan llargues com amples, de 3 a 18 cel·les (corredors; l'eix és el `place.path` de la troballa); zones crescudes cel·la a cel·la a partir de les cel·les Getis-Ord Gi* locals més fortes mentre creix l'z de la regió (formes irregulars) - crescudes en una meitat de les partides i provades en l'altra, perquè la llibertat del creixement no costi falsos llocs; cada franja d'altura contra les altres franges de la partida sobre tot el mapa (robusta als clústers); cilindres espai-temps: un cercle en un o dos cinquens de la durada de la partida, contra la pròpia dispersió de la partida dels seus esdeveniments en lloc i temps (l'exploració de permutació espai-temps).
- **Proves.** p a partir del quocient de versemblança quasi; Benjamini-Hochberg sobre cada regió provada en cada mapa (és habitual 700.000 en tres mapes) al 5%. El que passa es poda (una regió que està majoritàriament dins d'una de més forta de la seva mesura diu el mateix), es torna a llegir per a la seva **estabilitat** - partides que la van veure, partides on estava, la seva direcció en cinc particions de les partides - i es prova una vegada més amb la variància que les mateixes partides mostren (robusta als clústers, les partides com a clústers, mai sota Poisson), BH de nou. Els llocs tranquils sobre una base (2% o més dels naixements, enlairaments i aterratges del mapa) queden fora.
- **Efecte.** La raó de taxes (o d'odds), encongida per Bayes empíric (una a priori gamma ajustada als blocs 2x2 del mapa), amb un interval del ~95% a la dispersió; Gi* a 1, 2 i 4 cel·les i Moran local al centre.
- **Obvietat visual.** Quant ja es mostra la regió al mapa de calor simple del seu esdeveniment (escala logarítmica fins a la cel·la més brillant, tal com la dibuixen les vistes): el seu contrast amb un anell al voltant (una desena part de la paleta és difícil de veure, dues cinquenes parts, senzill) i un pic brillant que porta l'excés; una raó mai no la dibuixa el mapa de calor, així que una part compta la meitat. Per sota del 35% és **amagat**. La posició: força (efecte que se satura a 4 vegades, llocs tranquils a 0,7) per `1 - 0,7 x obvietat` per l'acord de les particions.

La pestanya **Llocs** els llista (només amagats per defecte; per mapa, forma, direcció), un clic delimita els llocs del mapa a la vista 3D (`placeLines.ts`: les línies superiors del motor, construïdes una vegada - magenta amagats, àmbar senzills, cian tranquils, el triat ple; una franja com a caixa des del seu terra fins al seu sostre) i al llenç de la pestanya Mapa; **Carrega** hi vola i carrega les 60 partides on més havia estat, filtrades pel seu esdeveniment (i classe).

#### Nínxols (`src/mass/niche.ts`) {#niches-srcmassnichets}

Cerca en feix (amplada 24, profunditat 3) sobre tres taules: **vides** (les vides dels jugadors: joc, mapa, mode, classe, vehicle, bàndol, nivell, trimestre de les dates, terç de les durades de les partides; K/D, victòria, mort una vida, morts per hora, guanys per minut), **llocs** (morts i baixes per mapa, mode, dates, sector del mapa 4 x 4, classe, bàndol, franja) i **fases** (sector i cinquè de la partida: K/D, morts per hora de presència). Un grup es prova contra el conjunt amb les partides com a clústers (la variància sandvitx dels seus residus per partida), el seu efecte és una raó d'odds o de taxes encongida per una a priori de 20 resultats; necessita 30 resultats en 8 partides, un refinament ha de ser un 10% més fort que el seu pare, i els grups on el resultat és ninguna o totes (no registrat per a ells) queden fora. Es queda: BH per sota del 5% sobre tots els grups avaluats, una raó encongida d'almenys 1,25 (o 1/1,25), quatre de cinc particions d'acord, i no un refinament que només repeteix el seu pare. La pestanya **Nínxols** els llista; un clic mostra cada refinament d'una condició del grup (l'explorador), **Carrega** carrega les seves partides. Els equipaments encara no són als resums.

#### Canvis del meta amb significació pràctica {#meta-shifts-with-practical-significance}

Sobre dates barrejades, la binomial sobre les vides marcava gairebé cada canvi com a significatiu. Ara `meta` prova de manera robusta als clústers (les vides de cada partida, un clúster), només conserva un canvi d'ús de 2 punts i almenys el 25%, un canvi de K/D d'1,3 vegades, els trimestres de les dates amb la mateixa tendència (tau de Kendall d'almenys 0,5) i, per a un vehicle en diversos mapes, la mateixa direcció en la majoria d'ells. Això deixa només uns quants canvis en un conjunt de prova on la prova simple n'havia marcat gairebé tots.

#### Per a un model {#for-a-model}

`massReportForModel` dona a cada lloc la seva `region` (forma, amagat, obvietat, altures, fase) i a cada nínxol les seves `conditions`, més quantes regions i grups s'han provat. La lent del coneixement pot llegir els llocs com a zones de mort i vies d'aproximació: els seus tipus són `place.*` i `niche.*`.

#### Comprovacions {#checks}

`scan.test.ts` planta una àrea difusa (1,6 vegades la taxa de morts sobre un cercle de 22 cel·les, feble en cada cel·la), un corredor, una franja d'altura i un clúster només de fase en 240 partides sintètiques amb dispersió - totes trobades, la difusa amagada - i executa vuit conjunts nuls de 60 partides: cap lloc. `niche.test.ts` troba un grup plantat de vehicle x mapa x bàndol i cap en cinc taules nul·les.
