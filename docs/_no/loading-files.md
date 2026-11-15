---
title: "Laste inn filer"
parent: "Få inn data"
nav_order: 1
lang: "no"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Laste inn filer

Denne siden viser hvordan du gir 3DHeat filene dine, og hva den gjør med dem. Slipp en mappe, så velger den filene som har posisjoner, og slår dem sammen til ett bilde.

1. Åpne **Kilde** øverst i sidestolpen for Varmekart.
2. Slipp filer eller en mappe på slippsonen, eller trykk **Filer…** eller **Mappe…**.
3. Les utvalgslinjen og **Minneestimat** (se bildet under).
4. Trykk **Last inn**.

![Kilde-panelet etter at en mappe med ti kamper er sluppet: 1 utvalgslinjen, 2 minneestimatet på passer, og 3 Last inn 10 filer](../assets/img/en/loading-files-source.webp)

*Etter at du har sluppet en mappe, forteller 3DHeat deg hva den fant og om det passer.*

Filer lastes inn i panelet **Kilde** øverst i sidestolpen til fanen Varmekart. Alt som velges samtidig, blir **ett** datasett.

## Velge filer {#choosing-files}

| Kontroll | Hva den gjør |
|---|---|
| **Slipp filer eller en mappe her** (slippsonen) | Slipp en blanding av filer og mapper. Mapper gjennomsøkes rekursivt. Å klikke på slippsonen åpner den samme velgeren som **Filer…**. |
| **Én fil…** | En filvelger for en enkelt fil. |
| **Filer…** | En filvelger som tar imot flere filer. |
| **Mappe…** | En mappevelger (nettleserens `webkitdirectory`-velger); hver fil i mappetreet tilbys. |

Velgerne tar imot filtypene i [listen over filer som kan lastes](data-formats.md#files). Kort fortalt: `.parquet`/`.pq` leses som Parquet, `.csv`/`.tsv`/`.txt` som skilletegnstekst, `.acmi` (Tacview), OCAP `.json`/`.json.gz` og GPS-formatene (GPX, KML, KMZ, NMEA, IGC, FIT) går gjennom hver sin leser, og `.3dheat`-kampbeholdere lastes inn som tabellene de inneholder ([En fil per kamp](container.md)). En beholder som ikke kan leses, hoppes over som *ikke en csv/parquet-fil*.

Slippte mapper gjennomsøkes til 12 nivåer dypt og høyst 20 000 filer, som vern mot symbollenke-løkker og ukontrollerte trær.

## Hvilke filer som beholdes {#which-files-are-kept}

Før noe leses, filtreres utvalget ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- En fil med en annen filendelse hoppes over: *ikke en csv/parquet-fil*.
- En fil på 0 byte hoppes over: *tom (0 byte)*.
- **Konverterer-sidefiler** – rådataene en konverterer beholder ved siden av en kamps tabell, `<kamp>.messages.parquet`, `.events.parquet`, `.raw.parquet` og de andre som står i [Konvertere beholder alt](converters.md) – hoppes over: *konverterens sidefil*. For å åpne en av dem, velg eller slipp den alene (eller bare sidefiler): et utvalg av bare sidefiler lastes inn som vanlige tabeller. JSON-filen ved siden av en tabell (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` og `.hints.json`) tilbys aldri som posisjoner.
- **Bevegelsesfil-regelen.** Hvis en fil i utvalget heter `movement*.parquet`, `movement*.csv` (og de andre endelsene) – `movement.parquet`, `movement_1.parquet` og så videre – hoppes alle andre datafiler over: *ikke en bevegelsesfil, og denne mappen har bevegelsesfiler*. Telemetrieksporter har ofte én tabell med posisjoner ved siden av dusinvis av tabeller uten posisjoner, og bare den førstnevnte kan tegnes. En mappe uten noen bevegelsesfil laster inn alle sine datafiler. Eksempel: en mappe med `movement_1.parquet`, `kills.parquet` og `shop.parquet` laster inn `movement_1.parquet`; de to andre listes som hoppet over. Eksempel: en mappe med `movement_1.parquet`, `kills.parquet` og `shop.parquet` laster inn `movement_1.parquet`; de to andre listes som hoppet over.
- De beholdte filene sorteres etter sin sti i utvalget, så samme mappe alltid gir samme datasett og samme farger.

Panelet viser så utvalget (en enkelt fils navn, eller `mappe (N filer)` med den lengste felles mappen), antall filer, samlet størrelse og samlet antall rader – nøyaktig når alle filene er Parquet, merket `≈` når noen er CSV. Hoppede filer listes med årsak, de fire første med navn.

## Lese skjemaet {#reading-the-schema}

Den **første** filen i utvalget åpnes for å beskrive skjemaet («Leser skjema»): kolonnenavnene, de første 50 datarådene, hvilke kolonner som ser numeriske ut, og for Parquet hver kolonnes logiske type og `heat3d`-oppføringen i fotnoten. En mappe med eksporter av én tabell deler ett skjema, så én fil står for alle. Deretter måles hver fil («Teller rader»): en Parquet-fotnote gir det nøyaktige antallet i én liten lesing; en CSVs antall anslås fra gjennomsnittlig linjelengde i den første megabyten.

[Kolonnetilordning](column-mapping.md)-panelet åpnes med de automatisk foreslåtte gjettene, og [minneestimatet](memory-and-budgets.md) vises over **Last inn**-knappen.

## Meldinger før innlasting {#messages-before-loading}

Under utvalget lister panelet, fra [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Feil** (røde) – innlastingen kan ikke starte: færre enn to posisjonsakser, samme kolonne på to akser, en tilordnet kolonne som ikke finnes i filen, en posisjonskolonne som ikke ser numerisk ut, en tidskolonne der de prøvde verdiene er tekst mens enheten er et tall (hver rad ville lest som NaN og havnet på tid 0), en tidskolonne satt til ISO-8601 der ingen av de prøvde verdiene kan tolkes som dato, en enhetsskala på 0.
- **Advarsler** (gule) – den lastes inn, men sannsynligvis ikke slik den er ment: en gruppekolonne som har en egen verdi på de fleste prøvde rader (så den er en ID, ikke en gruppe), en `DATE`-tidskolonne (hver rad på en dag deler ett øyeblikk), blikkretning satt uten sine kolonner.
- **Merknader** – hva tilordningen innebærer: tegning på et plan når én akse ikke er tilordnet, ingen tidslinje uten en tidskolonne, ingen spor uten en personkolonne, og uten en gruppekolonne én farge for alt og en differanse som bare kan dele etter en kolonne som beholdes for filtrering.

## Innlasting {#loading}

Knappen **Last inn** leser *Last inn fil*, *Last inn N filer*, eller *Last inn N filer (1 av K)* når en [nedsamplingsfaktor](memory-and-budgets.md#decimation) er satt. Den leser *For stor – reduser eller ned-samplet* og er deaktivert når [passformsjekken](memory-and-budgets.md#the-fit-check) sier at innlastingen ikke får plass; den er også deaktivert mens tilordningen har feil, eller en annen innlasting kjører.

Mens det lastes, viser panelet det gjeldende steget (med `[fil/filer]` foran når det er flere filer), radene lest så langt, en fremdriftslinje og **Avbryt**. Avbryt stopper innleserarbeideren, og med den eventuelle parser-arbeidere den startet.

Siden fortsetter å tegne mens den laster, fordi arbeidet skjer i bakgrunnen. Du ser det gjeldende steget, radene som er lest, en fremdriftslinje og **Avbryt**. Etter den siste filen viser panelet stegene *Setter rader i tidsrekkefølge*, *Omordner kolonner (n av m)*, *Måler utstrekning*, *Bygger deltakerlisten*, *Oppsummerer økter* og *Beregner levetider*, deretter *Laster N rader opp til grafikkortet* i ett bilde, slik at en lang opplasting aldri forveksles med et hengt program.

### Slik virker det {#how-it-works}

Innlastingen kjører i en Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Med flere filer og mer enn én [parsertråd](memory-and-budgets.md#parser-threads) parses opptil så mange filer **samtidig**, hver i sin egen parser-worker ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), så langt RAM-budsjettet gir plass; de slås fortsatt sammen én om gangen i utvalgets rekkefølge, så datasettet er det samme som ved innlasting én fil om gangen. Mens flere er i gang, nevner fremdriftslinjen filen som sist meldte fra, og linjen og radtellingen legger sammen alle filene i gang. Med én tråd, eller en enkelt fil, parses filene etter hverandre i selve innleserarbeideren. Bare kolonnene tilordningen nevner, leses: en ikke-tilordnet kolonne i en Parquet-fil koster ingenting; en CSV skannes byte for byte, men bare tilordnede felt dekodes.

## Flere filer blir ett datasett {#several-files-become-one-dataset}

Når mer enn én fil lastes ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Én deltakerliste.** Personer, grupper, økter og kategoriverdier er ordbøker delt over alle filene, så samme spiller i to eksporter er én person med ett spor.
- **Ett tidsutgangspunkt.** Tider holdes som 64-bit sekunder under sammenslåingen og settes om til det tidligste tidspunktet i *hele* utvalget, og lagres deretter som 32-bit sekunder fra det utgangspunktet. Fire eksporter fra fire ettermiddager settes i sin virkelige rekkefølge, ikke oppå hverandre.
- **Én tidsrekkefølge.** Rader fra alle filene sorteres etter tid med en radix-sortering (se [sorteringsgrensen](memory-and-budgets.md#the-sort-ceiling)).
- **En `Source file`-kolonne.** Hver rad husker hvilken fil den kom fra, som en kategorikolonne kalt `Source file`. Den vises i [Filtre](filters.md) og som *Source file – sammenlign to innlastinger* i [differansedelingen](difference.md). En innlasting av én fil får den ikke – en konstant kolonne ville kostet 4 byte per rad for å si ingenting.
- **Manglende kolonner.** En fil som mangler en av *filter*-kolonnene, bidrar bare ingen verdier for den. En fil som mangler en tilordnet *rolle*-kolonne (X, tid, person …) feiler med *filen har ingen kolonne «navn»*; i en innlasting av flere filer hoppes den filen over og de andre lastes fortsatt, og de hoppede filene listes på datasettet. En innlasting av én fil som feiler, viser feilen.
- **Advarsel om mangler.** Når radene som ble lastet er færre enn 95 % av radene som ble talt på forhånd, får datasettet en advarsel med den manglende andelen – fra filer som ikke kunne leses, eller fra rader uten en brukbar posisjon, som forkastes underveis.

## Etter innlasting {#after-loading}

Det nye datasettet erstatter et eventuelt tidligere. Ved hver innlasting ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- nullstilles alle filtre og gruppesynlighet;
- nullstilles differansedelingen etter gruppe: den første halvdelen av gruppene (avrundet opp) positiv, resten negativ;
- settes sprite-radiusen til horisontal utstrekning / 120 og metningen til et analytisk estimat; kubestørrelse, blikkstrålens lengde, flyhastighet og nær-/fjernplanene settes ut fra utstrekningen (se [Økter, personer og grupper](sessions-persons-groups.md#entity-size));
- settes boksreprisens økt til økten med flest rader;
- gjettes linjevarmens ruter på nytt ([Linjevarme](line-heat.md));
- faller visningsmodusen tilbake til **Varme** hvis gjeldende modus ikke støttes av de nye dataene; tidslinjen faller tilbake til **Alle** uten en tidskolonne, og historikken til **Kumulativ** uten levetider;
- parkeres avspillingshodet ved starten, og avspillingen stopper;
- rammer kameraet inn hele datasettet fra standardretningen (ser langs -Z, neset ned omtrent 36°).

**Datasett**-panelet viser så datasettets navn (utvalget, antall rader og filer, og nedsamplingsfaktoren når en ble brukt), `N lag · N personer · N s spenn`, og hver advarsel innlastingen ga, i gult, så lenge datasettet er lastet. **Last ut** i det panelet fjerner datasettet.
