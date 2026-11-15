---
title: "Indlæsning af filer"
parent: "Indlæs data"
nav_order: 1
lang: "da"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Indlæs filer

Denne side viser, hvordan du giver 3DHeat dine filer, og hvad den gør med dem. Slip en mappe, og den finder de filer, der har positioner, og samler dem i ét billede.

1. Åbn **Kilde** øverst i heatmappets sidepanel.
2. Slip filer eller en mappe på slipzonen, eller tryk på **Filer …** eller **Mappe …**.
3. Læs valglinjen og **Hukommelsesoverslaget** (se billedet nedenfor).
4. Tryk på **Indlæs**.

![Kilde-panelet efter at en mappe med ti kampe er sluppet: 1 valglinjen, 2 Hukommelsesoverslaget ved passer, og 3 Indlæs 10 filer](../assets/img/en/loading-files-source.webp)

*Efter du har sluppet en mappe, fortæller 3DHeat dig, hvad den fandt, og om det passer.*

Filer indlæses i panelet **Kilde** øverst i heatmap-fanens sidepanel. Alt, der vælges på én gang, bliver til **ét** datasæt.

## Vælg filer {#choosing-files}

| Styring | Hvad den gør |
|---|---|
| **Slip filer eller en mappe her** (slipzonen) | Slip en blanding af filer og mapper. Mapper gennemgås rekursivt. Et klik på slipzonen åbner den samme vælger som **Filer …**. |
| **Én fil …** | En filvælger til en enkelt fil. |
| **Filer …** | En filvælger, der tager flere filer. |
| **Mappe …** | En mappevælger (browserens `webkitdirectory`-vælger); hver fil i mappetræet tilbydes. |

Vælgerne tager de filtyper, der står på [listen over filer, der kan indlæses](data-formats.md#files). Kort fortalt: `.parquet`/`.pq` læses som Parquet, `.csv`/`.tsv`/`.txt` som tekst med skilletegn, `.acmi` (Tacview), OCAP `.json`/`.json.gz` og GPS-formaterne (GPX, KML, KMZ, NMEA, IGC, FIT) går gennem deres egne læsere, og `.3dheat`-kampcontainere indlæses som de tabeller, de holder ([En fil pr. kamp](container.md)). En container, der ikke kan læses, springes over som *ikke en csv/parquet-fil*.

Slippede mapper gennemgås til en dybde på 12 niveauer og højst 20.000 filer, som vagt mod symlink-løkker og løbske træer.

## Hvilke filer beholdes {#which-files-are-kept}

Før noget læses, filtreres valget ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- En fil med en anden endelse springes over: *ikke en csv/parquet-fil*.
- En fil på 0 bytes springes over: *tom (0 bytes)*.
- **Konverter-sidevogne** - de rå data, en konverter gemmer ved siden af en kamps tabel, `<kamp>.messages.parquet`, `.events.parquet`, `.raw.parquet` og de andre, der står i [Konvertere gemmer alt](converters.md) - springes over: *en konverters sidevogn*. For at åbne en, vælg eller slip den alene (eller kun sidevogne): et valg af kun sidevogne indlæser dem som enhver tabel. JSON ved siden af en tabel (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` og `.hints.json`) tilbydes aldrig som positioner.
- **Bevægelsesfil-reglen.** Hvis en fil i valget hedder `movement*.parquet`, `movement*.csv` (og de andre endelser) - `movement.parquet`, `movement_1.parquet` og så videre - så springes alle andre datafiler over: *ikke en bevægelsesfil, og denne mappe har bevægelsesfiler*. Telemetri-eksporter har ofte én tabel med positioner ved siden af snesevis af tabeller uden positioner, og kun den førstnævnte kan tegnes. En mappe uden nogen bevægelsesfil indlæser alle sine datafiler. Eksempel: en mappe med `movement_1.parquet`, `kills.parquet` og `shop.parquet` indlæser `movement_1.parquet`; de to andre listes som sprunget over. Eksempel: en mappe med `movement_1.parquet`, `kills.parquet` og `shop.parquet` indlæser `movement_1.parquet`; de to andre listes som sprunget over.
- De filer, der beholdes, sorteres efter deres sti inde i valget, så samme mappe altid giver samme datasæt og samme farver.

Panelet viser så valget (en enkelt fils navn, eller `mappe (N filer)` med den længste fælles mappe), antal filer, deres samlede størrelse og det samlede antal rækker - nøjagtigt, når alle er Parquet, markeret med `≈`, når en er CSV. Sprungne filer listes med årsag, de første fire med navn.

## Læs skemaet {#reading-the-schema}

Den **første** fil i valget åbnes for at beskrive skemaet ("Læser skema"): dens kolonnenavne, dens første 50 datarækker, hvilke kolonner der ser numeriske ud, og for Parquet hver kolonnes logiske type og posten `heat3d` i footeren. En mappe med eksporter af én tabel deler ét skema, så én fil står for alle. Derefter måles hver fil ("Tæller rækker"): en Parquet-footer giver det nøjagtige antal i én lille læsning; en CSV's antal estimeres ud fra gennemsnitslængden af linjerne i dens første megabyte.

[Kolonnekortlægning](column-mapping.md)-panelet åbner med de auto-kortlagte gæt, og [hukommelsesoverslaget](memory-and-budgets.md) vises over knappen **Indlæs**.

## Meddelelser før indlæsning {#messages-before-loading}

Under valget lister panelet fra [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Fejl** (røde) - indlæsningen kan ikke starte: færre end to positionsakser, samme kolonne på to akser, en kortlagt kolonne, der ikke er i filen, en positionskolonne, der ikke ser numerisk ud, en tidskolonne, hvis prøvede værdier er tekst, mens enheden er et tal (hver række ville blive læst som NaN og havne ved tid 0), en tidskolonne sat til ISO-8601, hvor ingen af de prøvede værdier kan læses som dato, en enhedsskala på 0.
- **Advarsler** (gule) - den indlæses, men sandsynligvis ikke som tiltænkt: en gruppekolonne, der har en særskilt værdi på de fleste prøvede rækker (så den er et id, ikke en gruppe), en `DATE`-tidskolonne (hver række på en dag deler ét øjeblik), kig-retning sat uden sine kolonner.
- **Noter** - hvad kortlægningen indebærer: tegning på et plan, når en akse ikke er kortlagt, ingen tidslinje uden en tidskolonne, ingen spor uden en personkolonne, og uden en gruppekolonne én farve for alt og en forskel, der kun kan dele på en kolonne, der er beholdt til filtrering.

## Indlæsning {#loading}

Knappen **Indlæs** læser *Indlæs fil*, *Indlæs N filer* eller *Indlæs N filer (1 ud af K)*, når et [nedsamplingsspring](memory-and-budgets.md#decimation) er sat. Den læser *For stor - reducer eller nedsampl* og er slået fra, når [passetesten](memory-and-budgets.md#the-fit-check) siger, at indlæsningen ikke passer; den er også slået fra, mens kortlægningen har fejl, eller en anden indlæsning kører.

Mens der indlæses, viser panelet det aktuelle trin (med `[fil/filer]` foran, når der er flere filer), de rækker, der er læst indtil nu, en fremskridtsbjælke og **Annullér**. Annullér stopper indlæsningsworkeren og med den eventuelle parser-workers, den har startet.

Siden bliver ved med at tegne, mens den indlæser, fordi arbejdet sker i baggrunden. Du ser det aktuelle trin, de læste rækker, en fremskridtsbjælke og **Annullér**. Efter den sidste fil viser panelet trinene *Sætter rækker i tidsorden*, *Omordner kolonner (n af m)*, *Måler udstrækning*, *Bygger listen*, *Opsummerer sessioner* og *Beregner levetider*, derefter *Uploader N rækker til GPU'en* i ét billede, så en lang upload aldrig forveksles med et frys.

### Sådan virker det {#how-it-works}

Indlæsningen kører i en Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Med flere filer og mere end én [parser-tråd](memory-and-budgets.md#parser-threads) parses op til så mange filer **samtidig**, hver i sin egen parser-worker ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), så længe RAM-budgettet har plads; de flettes stadig ind én ad gangen i valgets rækkefølge, så datasættet er det samme som ved en indlæsning én ad gangen. Mens flere er i gang, nævner fremskridtslinjen den fil, der sidst meldte sig, og bjælken og rækketallet lægger alle filer i gang sammen. Med én tråd, eller én enkelt fil, parses filerne efter hinanden i selve indlæsningsworkeren. Kun de kolonner, kortlægningen nævner, læses: en ukortlagt kolonne i en Parquet-fil koster intet; en CSV scannes byte for byte, men kun kortlagte felter afkodes.

## Flere filer bliver til ét datasæt {#several-files-become-one-dataset}

Når mere end én fil indlæses ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Én liste.** Personer, grupper, sessioner og kategoriværdier er ordbøger delt over alle filer, så samme spiller i to eksporter er én person med ét spor.
- **Ét tidsudgangspunkt.** Tider holdes som 64-bit sekunder under sammenfletningen og flyttes til det tidligste tidspunkt i *hele* valget, derefter gemmes de som 32-bit sekunder fra dette udgangspunkt. Fire eksporter fra fire eftermiddage placeres i deres rigtige rækkefølge, ikke stablet oven på hinanden.
- **Én tidsorden.** Rækker fra alle filer sorteres efter tid med en radix-sortering (se [sorteringsloftet](memory-and-budgets.md#the-sort-ceiling)).
- **En kolonne `Source file`.** Hver række husker, hvilken fil den kom fra, som en kategorikolonne ved navn `Source file`. Den vises i [Filtre](filters.md) og som *Source file - sammenlign to indlæsninger* i [forskelsdelingen](difference.md). En indlæsning af én fil får den ikke - en konstant kolonne ville koste 4 bytes pr. række for at sige ingenting.
- **Manglende kolonner.** En fil, der mangler en af *filter*-kolonnerne, bidrager blot ingen værdier for den. En fil, der mangler en kortlagt *rolle*-kolonne (X, tid, person ...), fejler med *fil har ingen kolonne "navn"*; i en indlæsning af flere filer springes den fil over, og de andre indlæses stadig, og de sprungne filer listes på datasættet. En indlæsning af en enkelt fil, der fejler, melder fejlen.
- **Advarsel om mangel.** Når de indlæste rækker er færre end 95 % af de rækker, der blev talt på forhånd, bærer datasættet en advarsel med den manglende andel - fra filer, der ikke kan læses, eller fra rækker uden en brugbar position, som frasorteres undervejs.

## Efter indlæsning {#after-loading}

Det nye datasæt erstatter et eventuelt tidligere. Ved hver indlæsning ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- nulstilles alle filtre og gruppesynlighed;
- nulstilles forskelsdelingen efter gruppe: den første halvdel af grupperne (rundet op) positiv, resten negativ;
- sættes sprite-radius til den vandrette udstrækning / 120 og mætningen til et analytisk overslag; kubestørrelse, kig-strålens længde, flyvehastighed og nær/fjern-planerne sættes ud fra udstrækningen (se [Sessioner, personer og grupper](sessions-persons-groups.md#entity-size));
- sættes kampreplay-sessionen til den session med flest rækker;
- gættes linje-varme-ruterne på ny ([Linje-varme](line-heat.md));
- falder visningstilstanden tilbage til **Varme**, hvis den nuværende tilstand ikke understøttes af de nye data; tidslinjen falder tilbage til **Alle** uden en tidskolonne, og historikken til **Kumulativt** uden levetider;
- parkeres afspilningshovedet ved starten, og afspilningen stopper;
- indrammer kameraet hele datasættet fra standardretningen (kigger langs -Z, hældet ned ca. 36°).

Panelet **Datasæt** viser så datasættets navn (valget, antal rækker og filer, og springet når et var brugt), `N hold · N personer · Ns spænd`, og hver advarsel indlæsningen gav, i gult, så længe datasættet er indlæst. **Fjern fra hukommelsen** i det panel fjerner datasættet.
