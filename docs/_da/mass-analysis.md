---
title: "Masseanalyse"
nav_order: 8
lang: "da"
source: "mass-analysis.md"
source_hash: "e65b729b5928"
translated: true
outdated: false
---

# Masseanalyse: tusindvis af kampe på én gang

**Masseanalyse** viser dig, hvad en hel mappe med kampe giver i sum: hvilket køretøj der vinder mest, hvilken side der er favoriseret, hvor handlingen er. Brug den, når du har langt flere kampe, end du kan se.

Den arbejder ud fra et lille resumé af hver kamp, så tusind eller ti tusind kampe åbner hurtigt. Den indlæser de fulde rækker kun for de kampe, du klikker på.

## Prøv det {#try-it}

1. Åbn **Masseanalyse** i varmekortets sidepanel.
2. Tryk **Mappe …** (eller **Filer …**) og vælg dine `.3dheat`-kampe.
3. Vent, mens panelet læser resuméerne ("Resuméer … n af N").
4. Tryk **Åbn analyse**. Et vindue åbnes med faner.
5. Sæt filtrene (Spil, Kort, Tilstand, Fra, Til), og læs så en fane, for eksempel Balance.
6. Klik på en række, en celle eller en indsigt: dens kampe indlæses i 3D-visningen, med kameraet på stedet.

![Fanen Balance: vindrate og drab pr. død for hvert køretøj](../assets/img/en/mass-balance.webp)

```
mappe med .3dheat -> resuméer -> vindue (faner) -> klik på en række -> kampene åbnes i 3D
```

En `.3dheat`-fil er én kamp ([Én fil pr. kamp](container.md)). En *varmekortlag* og en *række* forklares i [ordlisten](glossary.md).

## Få resuméerne {#getting-the-summaries}

De fleste skal ikke gøre noget: panelet finder selv de resuméer, der mangler. For at forberede en stor mappe én gang kan du bruge det offline-værktøj nedenfor.

Hver `.3dheat`-kamp får et resumé (`src/mass/summarize.ts`), gemt i
containeren som medlemmet `<match>.summary.json` (rolle `summary`, se
[Én fil pr. kamp](container.md)). Det offline-værktøj skriver dem, og et
indeks pr. mappe. Det er et udviklerværktøj; kør det på en stor mappe for at spare panelet for arbejdet:

```
node tools/3dheat-summarize.mjs <mappe>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- En kamp, der allerede er resumeret (samme formatversion), bliver kun læst;
  `--force` udregner den igen. `--no-write` lader containerne være urørte.
- En fil, der er ændret inden for de sidste `--settle` minutter (10), springes over:
  en konverter kan stadig skrive til den.
- `<mappe>/3dheat-index.jsonl.gz`: en linje pr. kamp - dens sti, størrelse, tid
  og resumé uden gitteret. `<mappe>/3dheat-index.grids.jsonl.gz`: en linje pr.
  kamp med dens gitter.
- Kør det på maskinen, der har filerne, med lav prioritet (for eksempel `nice -n 19 ionice -c3` på Linux).

Panelet tager for hver kamp det første af: mappens indekslinje (samme
sti og størrelse), browserens cache (IndexedDB, efter navn, størrelse og tid),
containerens medlem `summary`, eller et resumé, der udregnes i en pulje af
arbejdere og gemmes i cachen. En mappe uden indeks virker altså også - første
gang i læsehastighed for tabellerne, derefter fra cachen.

## Panelet {#the-panel}

Vælg en mappe (eller filer; **Tilføj mappe…** tilføjer en anden). Vinduet har filtrene **Spil**, **Kort**, **Tilstand**, **Fra** og **Til**, et valg af **Opdel efter**, **Færrest liv** og **Kun spillere**, og disse faner. Alle tal kommer fra resuméerne, og et klik på en række, en celle eller en indsigt indlæser dens kampe i visningen som overlejringen for mange kampe, med de filtre der viser det (køretøj, klasse, våben, hold, spiller) og kameraet på stedet:

| Fane | Hvad |
|---|---|
| Overblik | kampe, timer, spillere, liv, rækker, datoer; kampe pr. dag; efter spil, kort, tilstand; hændelsessummer; økonomi efter valuta; hvornår i kampen tingene sker |
| Balance | efter køretøj, klasse, våben eller hold, opdelt efter kort, tilstand, niveau eller spil: K/D med dets ~95 % interval, vindrate (Wilson), overlevelse, drab og træf pr. minut, indtjening pr. minut, og q - Benjamini-Hochberg-falsk-opdagelsesraten for K/D og vinder mod resten af opdelingen. **Færrest liv** skjuler rækker med for få liv til at stole på; **Kun spillere** udelader det, missionens AI styrede |
| Tendenser | brug (andel af tilstedeværelse), K/D eller vindrate for de øverste køretøjer eller klasser pr. dag, uge eller måned |
| Spillere | forskellige spillere, kampe pr. spiller, spillere pr. kamp, de hyppigste spillere |
| Sider | hver side på hvert kort: kampe vundet mod en jævn fordeling |
| Tæt hold | rundedata: åbningsduelbeviser efter side og deres konvertering, byttehandler, udstikker mod holder, krydsild, blændede indgange, sigte, plantninger, mandefordel og, **Efter kort**, de steder, der dræber spillerne, som går ind i dem - hver en andel med sit Wilson-interval, ud fra resuméernes `cqb`-tal ([Tæt hold og runder](close-quarters.md)) |
| R6-flader | Rainbow Six Siege's mærker på banen (skudhuller og lignende) pr. banens flade: mærker, pr. runde på kortet, rummet, andelen, hvis skytte blev fundet; et klik åbner mærkernes slags, skytternes operatører og våbenklasser, og hvor på fladen mærkerne er (et lille varmekort af celler på en kvart meter); en flade beholder sit id på tværs af kampene i én kortversion. Ud fra resuméernes `marks`-tal |
| Kort | et kortets summerede gitter: tilstedeværelse, drab, dødsfald, K/D, enhver hændelse, strøm og **varm i hvor mange kampe** (stabilitet); efter hold, ved 1, 2, 4 eller 8 gange cellen |
| Steder | steder, der skiller sig ud i tallene, men ikke i varmekortet (et stort område der er travlt som helhed, korridorer, højdebånd), og steder, hvis holdere vinder flere eller færre af deres runder; **Find steder** |
| Nicher | grupper, der klarer sig mærkbart bedre eller dårligere end resten (et køretøj på ét kort, en sektor i én højde), og grupper af runder vundet ud over det, deres side vandt i de samme kampe; **Find nicher** |
| Indsigter | masse-detektorerne og kort-detektorerne (nedenfor); **Kopiér rapport (JSON)** giver den JSON, en sprogmodel læser |

## Indsigter over mange kampe {#insights-over-many-matches}

Fanen **Steder** finder steder, der skiller sig ud i tallene, men ikke i varmekortet - et stort område, der er travlt som helhed, en korridor, et højdebånd, et sted der kun er travlt i én del af kampen - og markerer dem, som det almindelige varmekort ikke viser, som **skjulte**, og tegner dem op i 3D-visningen; **Indlæs** flyver derhen med de kampe, det holdt. Fanen **Nicher** finder grupper (et køretøj på ét kort og én side, en sektor i én højde), der klarer sig mærkbart bedre eller dårligere end resten; klik på én for at se dens forfininger.

### Hvem vandt {#who-won}

Hvor kampene siger, hvem der vandt hver runde ([udfaldskolonnen](data-formats.md#outcome-columns) `won`), er resultatet et mål for sig:

- **Steder: vindrate.** For hver side andelen af dens runder på et sted, som den vandt, mod den andel, den vandt i samme kamp overalt - så kortets balance, sidens og kampens egen er grundlinjen, og kun steder, hvis holdere vinder flere (eller færre) af deres runder, skiller sig ud. Et opdigtet eksempel: *"Dust: side T vinder flere af sine runder, når den er her: 61 % af 412 vundet, mod 49 % forventet ud fra dens egen rate i de samme kampe (odds 1,6x; holdt i 31/48 kampe)."* Samme falsk-opdagelsesrate og stabilitetskontroller som for alle steder; **Indlæs** indlæser de kampe, det holdt i, og viser sidens positioner.
- **Nicher: rundesejr.** Tabellen **Runder** har hvert livs runde: kortet, siden, delen af kampen (runde 1-4, 5-8, ...), køretøjet (en operatør, en agent), det våben, den brugte mest, det sted, den holdt længst, købet (eco, force, full) og om dens side fik det første drab. En gruppe vurderes mod det, dens side vandt i de samme kampe, så *T på Dust med en AWP* er kun en niche, når de runder blev vundet oftere end T's andre runder i de kampe. Et opdigtet eksempel: *"m1 · T · AWP: vinder 80 % af 320 runder, mod 62 % forventet ud fra de samme sider i de samme kampe (odds 2,3x; 40 kampe)."* Rangeret efter løftet gange støtten; **Indlæs** indlæser de kampe, hvis runder viser det mest.

Begge kræver resuméer af version 2 (se [Få resuméerne](#getting-the-summaries)): ældre udregnes igen.

Fanen **Indsigter** finder over alle kampe køretøjer, der handler eller vinder bedre eller dårligere end resten, steder der er varme i en stabil andel af kampene, sider der vinder mere end en jævn fordeling, køretøjer, hvis brug flytter sig over datoerne, og dele af kampen, der har flere drab end en jævn spredning. Hver fund har sine tal, effekt, interval og en falsk-opdagelsesrate (holdt under 5 %), og et klik indlæser dens kampe. Detaljer: [Til udviklere](#for-developers).

## Skala {#scale}

Du kan selv gentage en lille version: `node tools/demo-data.mjs` skriver 150 syntetiske tankkampe til `tools/.shots/demo/mass` (cirka 1.000 rækker hver). Målt på de 150 syntetiske demokampe fra `tools/demo-data.mjs` på en stationær pc (en rigtig kamp er langt større):

- `tools/3dheat-summarize.mjs` med 4 arbejdere: 2,6 til 4,8 s for alle 150, 8 til 21 ms pr. kamp inde i en arbejder; en anden kørsel, der kun læser resuméerne, tager cirka 2 s.
- Åbning af mappen i panelet, med indekset til stede, indtil vinduet vises: 0,9 til 1,6 s (arbejderens egen del, læsning af de 150 indekslinjer, er 20 til 40 ms).
- Skift til en fane, indtil dens tabel er tegnet: Overblik 10 til 30 ms, Balance 30 til 70 ms, Tendenser 30 til 45 ms, Spillere 15 til 35 ms, Sider 15 til 20 ms, Kort 55 til 130 ms.
- Lageret holder de 150 kampe i cirka 0,5 MB.

Åbning af vinduet tager ét kort billede: de valgte filer sendes til arbejderen 16 ad gangen, og datofelterne og den første fane kommer et billede efter vinduet.

Lageret holder cirka 15 KB pr. kamp, så 10.000 kampe fylder ~150 MB i
arbejderen; gitre holdes aldrig længere, end kortet bad om.

## Til udviklere {#for-developers}

### Indsigter over mange kampe {#insights-over-many-matches}

`src/mass/detect.ts` - hvert fund med sine tal, effekt og interval,
p og q (Benjamini-Hochberg over alt, detektoren prøvede, holdt under 5 %),
gennemgangen, der indlæser dens kampe, og en sætningsnøgle med dens værdier;
rapporten (`heat3d.mass/1`) er det, `massReportForModel` giver en fortæller,
i samme form som enkeltkamp-rapporten (`insights/seam.ts`).

| Detektor | Finder |
|---|---|
| `balance` | et spillerkøretøj, der handler eller vinder bedre eller dårligere end resten på et kort eller i en tilstand |
| `hotspot` | steder, der er varme i en stabil andel af de kampe, der kom forbi (kampe varme / kampe set, mod kortets andre celler) - ikke bare varme i sum |
| `side` | en side på et kort, der vinder mere end en jævn fordeling |
| `meta` | et køretøjs andel af spillerliv eller dets K/D, der flytter sig mellem den tidligere og den senere halvdel af datoerne, pr. kort - stor nok til at betyde noget, med en tendens over kvartalerne, på samme måde på de fleste kort (nedenfor) |
| `phase` | en del af kamplængden med flere drab, træf, affyringer ... end en jævn spredning |
| `place` | steder, der skiller sig ud over mange kampe (Trin B, nedenfor): et områdes rate eller drabsandel mod hver kamps egen, cirkler, korridorer, udvidede zoner, højdebånd, faser; skjult, når det almindelige varmekort ikke viser dem |
| `niche` | grupper, der klarer sig mærkbart bedre eller dårligere (Trin B, nedenfor) |
| `grid.*` | de enkelt-datasæt-detektorer (kraftpositioner, varme og stille zoner, klassesteder) på hvert korts summerede gitre: `GridMerge.toInsightJob` fylder indsigtspassets gitre fra resuméerne; detektorerne, der kræver spor, springes over |

### Resuméet {#the-summary}

Almindelig JSON (`src/mass/types.ts`), cirka 5-30 KB komprimeret pr. kamp:

- kampen: spil, kort, tilstand, mission, start, længde, rækker, liv, spillere,
  AI, hold (liv, spillere, tilstedeværelse, drab, dødsfald, sejr, penge), vinder;
- pr. køretøj og hold: klasse, niveau, liv, spillerliv, tilstedeværelse, hændelser
  efter kanonisk slags, drab efter målets klasse, sejre, penge;
- pr. spiller (efter bruger-id, ellers navn): hold, liv, tilstedeværelse, drab, dødsfald,
  træf, affyringer, sejr, køretøjer; pr. våben: hændelser efter slags;
- med en resultatkolonne (version 2): runder vundet og spillet pr. hold, køretøj
  (`rw`, et liv og en runde hver), spiller og våben (de runder, en side brugte det
  i); hvert livs runde (`outcome.u`: runde, side, køretøj, det våben, den brugte
  mest, det sted, den holdt længst, købet, vundet) og hver rundes
  nummer, vinder og siden for dens første drab (`outcome.r`);
- økonomiens kolonner (`cost_*`, `earn_*`) og deres summer;
- faser: hændelser efter slags i 20 bidder af kamplængden og efter minut;
- adfærd: kampens kollektive adfærdsmål (justering, rutestyring, baner,
  trængsel, ledere, efterfølgere, brydepunkt, risiko efter tab, serier,
  købsenighed, undertrykkelse), hver med sin egen nulmodel,
  p og q - se [Kollektiv adfærd](collective-behaviour.md);
- gitteret (nedenfor).

Talt, som fremviseren tæller: kolonner fundet, som loaderen for mange kampe
finder dem (`leanSpec`), hændelser efter `data/canonical.ts`; et drab, et Tacview-våben
giver point til sin skytte; et dødsfald, der siges to gange på én gang (`dead`, `death`),
tæller én gang.

#### Gitteret: det Trin B bygger på {#the-grid-what-stage-b-builds-on}

Den rumlige del er lavet til scanningsstatistik over områder af enhver størrelse
og form, ikke kun til varmebilleder:

- **En pyramide.** Cellerne er rettede potenser af to i verdensenheder (x, z, som fremviseren placerer dem). Niveau `k` er cellerne summeret ved `ix >> k, iz >> k` - nøjagtigt, inden for en kamp og på tværs af kampe med andre cellestørrelser - og ethvert område (en boks, en korridor langs en linje, en ring) er en sum af celler. Det fineste niveau passer til kampens robuste udstrækning (cellerne, der har 99 % af tilstedeværelsen) i 128 celler; afvigere udenfor den holdes.
- **Eksponering ved siden af hver tælling.** Tilstedeværelsessekunder pr. celle, pr. hold (`pt`), pr. køretøjsklasse (`pc`) og pr. højdebånd (`ph`), så et områdes rate, forventning og forhold kan udregnes for enhver undergruppe.
- **Højde.** Bånd over kampens gulv (1. percentil af højden): under 3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, over; en fil med en kolonne `floor`/`storey`/`deck` deler i bånd efter sine etager i stedet. `y` er hver celles middelhøjde, `y0` dens laveste (dens etage, for højde over den).
- **Hændelser** som tupler `[celle, slags, hold, klasse, bånd, antal]`.
- **Runder efter resultat** (version 2, med en resultatkolonne og to runder eller flere): `pw` som `[cell, team, rounds won, rounds lost]` - de runder, hver side brugte et sekund eller mere i cellen, efter dens resultat i runden.
- **Tidsskiver** på et groft niveau (8 celler på hver side), efter minuttet fra kampstart: `[cx, cz, minut, slags, værdi]`, tilstedeværelsessekunder som slags `GRID_KINDS.length`; kampfaser er minutter over længden.
- Sparsomt, tællinger som hele tal, sekunder til en tiendedel: afgrænset af hvad der skete.

### Trin B: steder og nicher {#stage-b-places-and-niches}

Trin B leder efter det, der skiller sig ud i tallene uden at falde i øjnene:
et stort område, der er travlt som helhed uden nogen varm celle i sig, et
skævt drab-dødsforhold på få hændelser, en korridor, et højdebånd, en klynge, der kun
er der i én del af kampen - og grupper (et køretøj på ét kort på én side, en sektor i én
højde), der klarer sig mærkbart bedre eller dårligere end resten. Ét
**Find steder** / **Find nicher** / **Find indsigter** kører alle detektorerne;
de tre faner deler rapporten.

#### Steder (`src/mass/scan.ts`) {#places-srcmassscants}

Hvert korts kampe læses to gange, en kamp ad gangen; hukommelsen holder summer på et raster
på højst 64 celler pr. side (16 for rum-tids-scanningen), aldrig kampene.

- **Mål.** En hændelses rate pr. sekund tilstedeværelse - drab, dødsfald,
  træf, affyringer, erobringer, for alle enheder, pr. klasse (de 4 med flest
  hændelser), pr. højdebånd - og andelen af drab i drab og dødsfald (alle, pr. side, pr. bånd),
  og hver sides **vindrate**: dens runder i cellen vundet mod tabt (`pw`), hvor 8 kampe
  på kortet eller flere tæller runder efter resultat. Hvilke klasser og sider der gælder, kommer fra hovederne (`planOf`).
- **Forventning pr. kamp.** Hver kamps egen rate, spredt over dens egen
  tilstedeværelse i en celle, er cellens forventning (en kovariatjusteret
  Kulldorff-scanning, opdelt efter kamp): et par blodige kampe eller én travl
  server giver intet sted. For vindraten er forventningen sidens egen andel af
  vundne runder i den kamp, så kortets og sidens balance er aldrig et sted. En runde
  i flere celler af et område tæller i hver; spredningen målt ved områdets størrelse
  bærer det.
- **Spredning.** Kampene er uenige langt ud over Poisson. Hver kamps residualer
  summeres i blokke af 1, 2, 4, 8, 16 celler; spredningen for hver blokstørrelse
  (kvadrerede residualer over nulvariansen, samlet, de værste 5 % af blokkene udeladt)
  skalerer hver test af et område af den størrelse: et kvasi-likelihood-forhold,
  Poisson for rater, binomial for andele.
- **Områder.** Cirkler på 0,75 til 18 celler; ellipser i seks vinkler, 3 og 6
  gange så lange som brede, 3 til 18 celler (korridorer; aksen er insightens
  `place.path`); zoner, der vokser celle for celle fra de stærkeste lokale
  Getis-Ord Gi*-celler, mens områdets z vokser (uregelmæssige former) - voksede
  på den ene halvdel af kampene og testet på den anden, så vækstens frihed
  ikke koster falske steder; hvert højdebånd mod kortets andre bånd over hele kortet
  (klyngerobust); rum-tids-cylindre: en cirkel i en eller to femtedele af
  kamplængden, mod kampens egen spredning af dens hændelser over sted og tid
  (rum-tids-permutationsscanningen).
- **Test.** p fra kvasi-likelihooden; Benjamini-Hochberg over alle områder,
  der blev prøvet på hvert kort (700.000 på tre kort er normalt) ved 5 %. Det,
  der består, beskæres (et område, der for det meste ligger inde i et stærkere af
  samme mål, siger det samme), læses igen for sin **stabilitet** - kampe, der så
  det, kampe det holdt i, dets retning i fem folder af kampene - og testes en gang til
  ved den varians kampene selv viser (klyngerobust, kampene som klynger, aldrig under
  Poisson), BH igen. Stille steder på et grundlag (2 % eller mere af kortets spawns, afgange
  og landinger) udelades.
- **Effekt.** Rate- (eller odds-) forholdet, krympet ved empirisk Bayes (en gamma-
  prior tilpasset kortets 2x2-blokke), med et ~95 % interval ved spredningen; Gi* ved 1, 2
  og 4 celler og lokal Moran i centrum.
- **Visuel iøjnefaldenhed.** Hvor meget området allerede viser i det almindelige
  varmekort for sin hændelse (logaritmisk skala op til den klareste celle, som visningerne tegner den):
  dets kontrast med en ring omkring (en tiendedel af paletten er svær at se,
  to femtedele almindelig) og en lys top, der bærer overskuddet; et forhold tegnes
  aldrig af varmekortet, så en andel tæller halvt. Under 35 % er **skjult**.
  Rangordenen: styrke (effekt, der mættes ved 4 gange, stille steder ved 0,7) gange
  `1 - 0,7 x iøjnefaldenhed` gange foldernes enighed.

Fanen **Steder** lister dem (kun skjulte som standard; efter kort, form, retning), et
klik tegner kortets steder op i 3D-visningen (`placeLines.ts`: motorens øverste linjer, bygget én gang -
magenta skjult, gul almindelig, cyan stille, det valgte fuldt; et bånd som en boks fra sit gulv til sit loft)
og på kortfanens lærred; **Indlæs** flyver derhen og indlæser de 60 kampe, det holdt i
flest, filtreret til dens hændelse (og klasse).

#### Nicher (`src/mass/niche.ts`) {#niches-srcmassnichets}

Stråle-søgning (bredde 24, dybde 3) over tre tabeller: **liv** (spillernes liv:
spil, kort, tilstand, klasse, køretøj, side, niveau, kvartal af datoerne, tredjedel af
kampens længder; K/D, vinder, dødsfald pr. liv, drab i timen, indtjening pr.
minut), **steder** (drab og dødsfald efter kort, tilstand, datoer, sektor af kortet
4 x 4, klasse, side, bånd) og **faser** (sektor og femtedel af kampen: K/D,
dødsfald i timen af tilstedeværelse). En gruppe testes mod helheden med kampene som
klynger (sandwich-variansen af dens residualer pr. kamp), dens effekt et odds- eller ratio-forhold
krympet af en prior på 20 udfald; den kræver 30 udfald i 8 kampe, en forfining skal være 10 %
stærkere end sin forælder, og grupper, hvor udfaldet er ingen eller alle (ikke optaget for dem), udelades.
Beholdt: BH under 5 % over alle grupper vurderet, et krympet forhold på 1,25
(eller 1/1,25) mindst, fire af fem folder enige, ikke en forfining, der kun gentager sin forælder. Fanen **Nicher** lister dem; et klik viser hver
én-betingelses-forfining af gruppen (udforskeren), **Indlæs** indlæser dens kampe. Udstyr er endnu ikke i resuméerne.

Den fjerde tabel, **runder** (`roundsTable`), har rundens resultat som sit
mål: én række pr. livs runde - kort, side, del af kampen (runde 1-4,
5-8, ...), køretøj, det våben, der blev brugt mest, det sted, der blev holdt længst, køb, første
drab eller første dødsfald - vurderet mod sin egen sides vindrate i sin egen
kamp (den stratificerede forventning fra Mantel-Haenszel: residualen er
`won - e`, `e` sidens andel i kampen), så en niche er aldrig kortets
eller sidens balance. Kampene forbliver klyngerne. Dens z er kalibreret: den
samme stråle-søgning kører otte gange på resultaterne blandet mellem
runderne for hver side i hver kamp (sidens rate i hver kamp bevaret), og
spredningen af de nul-z ud over en standardnormal - pr. antal
betingelser, fra midten (median / 0,674) og halen (99. percentil /
2,576), den største, aldrig under 1 - dividerer de rigtige før deres p og
falsk-opdagelsesraten (en empirisk nul, Efron 2004). Dybere grupper får
den større skala: strålen beholder forfininger af grupper valgt for deres
store z. En niches basis er dens egen forventning, dens løft pointene over
den, og den rangeres efter løftet gange kvadratroden af dens runder, holdt af
evidensen og folderne (`wracc` er støtten gange løftet). Den
bærer de kampe, hvor den viste sig mest (`matchIds`), og nogle af deres
runder (`rounds`, `[match, round]`) til at bore ned.

#### Tendenser med praktisk betydning {#meta-shifts-with-practical-significance}

Ved blandede datoer fandt binomialet på liv næsten alle ændringer betydningsfulde. `meta` tester nu klyngerobust (hver kamps
liv er en klynge), beholder en brugsforskydning kun ved 2 point og mindst 25 %, en K/D-forskydning
på 1,3 gange, at datoernes kvartaler tendenser i samme retning (Kendalls
tau mindst 0,5), og for et køretøj på flere kort samme retning på
de fleste af dem. Det efterlader kun få forskydninger på et testsæt, hvor den almindelige test flaggede næsten alle.

#### For en model {#for-a-model}

`massReportForModel` giver hvert sted sin `region` (form, skjult,
iøjnefaldenhed, højder, fase) og hver nische sine `conditions`, plus hvor mange
områder og grupper der blev prøvet. Vidensobjektivet kan læse steder som dræbezoner og
angrebsakser: deres slags er `place.*` og `niche.*`.

#### Kontroller {#checks}

`scan.test.ts` planter et diffust område (1,6 gange dødsraten over en cirkel
af 22 celler, svagt i hver celle), en korridor, et højdebånd og en klynge kun i
én fase i 240 syntetiske overdispergerede kampe - alle fundet, det diffuse skjult - og
kører otte nulsæt på 60 kampe: intet sted. `niche.test.ts` finder en plantet køretøj x kort x side-gruppe og intet i
fem nul-tabeller. `outcome.test.ts` kontrollerer resuméet af version 2 (runder vundet
efter side, enhed, spiller og våben, `pw`, enhedsrunderne); planter en bane, hvis
side vinder 70 % af sine runder mod 35 % (hver kamp sin egen balance) - fundet -
og kører 20 nulsæt på 50 kampe, hvor banerne intet siger: intet vindrate-sted;
planter en AWP på ét kort, der vinder sin sides runder 30 point mere -
fundet, med sine kampe og runder - og kører 30 nulsæt på 80 kampe med
hver kamp sin egen balance og én side stærkere på ét kort: ingen niche.
