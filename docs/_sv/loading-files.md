---
title: "Läsa in filer"
parent: "Läsa in data"
nav_order: 1
lang: "sv"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Läsa in filer

Den här sidan visar hur du ger 3DHeat dina filer och vad den gör med dem. Släpp en mapp, så plockar den ut de filer som har positioner och slår ihop dem till en bild.

1. Öppna **Källa** överst i värmekartans sidofält.
2. Släpp filer eller en mapp på släppytan, eller tryck på **Filer…** eller **Mapp…**.
3. Läs urvalsraden och **Minnesuppskattningen** (se bilden nedan).
4. Tryck på **Läs in**.

![Panelen Källa efter att en mapp med tio matcher släppts: 1 urvalsraden, 2 minnesuppskattningen på passar, och 3 Läs in 10 filer](../assets/img/en/loading-files-source.webp)

*Efter att du släppt en mapp berättar 3DHeat vad den hittade och om det ryms.*

Filer läses in i panelen **Källa** överst i värmekartfliken. Allt som väljs samtidigt blir **en** datamängd.

## Välja filer {#choosing-files}

| Kontroll | Vad den gör |
|---|---|
| **Släpp filer eller en mapp här** (släppytan) | Släpp valfri blandning av filer och mappar. Mappar går igenom rekursivt. Ett klick på släppytan öppnar samma väljare som **Filer…**. |
| **En fil…** | En filväljare för en enda fil. |
| **Filer…** | En filväljare som tar emot flera filer. |
| **Mapp…** | En mapp-väljare (webbläsarens `webkitdirectory`-väljare); varje fil i mappträdet erbjuds. |

Väljarna tar emot filtyperna i [listan över filer som kan läsas in](data-formats.md#files). Kort sagt: `.parquet`/`.pq` läses som Parquet, `.csv`/`.tsv`/`.txt` som text med avgränsare, `.acmi` (Tacview), OCAP `.json`/`.json.gz` och GPS-formaten (GPX, KML, KMZ, NMEA, IGC, FIT) går genom sina egna läsare, och `.3dheat`-matchbehållare läses in som de tabeller de innehåller ([En fil per match](container.md)). En behållare som inte kan läsas hoppas över som *inte en csv/parquet-fil*.

Släppta mappar går igenom till ett djup av 12 nivåer och högst 20 000 filer, som skydd mot symboliska länkloopar och okontrollerade träd.

## Vilka filer som behålls {#which-files-are-kept}

Innan något läses filtreras urvalet ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- En fil med annan ändelse hoppas över: *inte en csv/parquet-fil*.
- En fil på 0 byte hoppas över: *tom (0 byte)*.
- **Konverterarnas sidofiler** – den råa data en konverterare sparar bredvid en matchs tabell, `<match>.messages.parquet`, `.events.parquet`, `.raw.parquet` och de andra som listas i [Konverterare behåller allt](converters.md) – hoppas över: *en konverterares sidofil*. För att öppna en väljer eller släpper du den ensam (eller bara sidofiler): ett urval av enbart sidofiler läses in som vilken tabell som helst. JSON-filen bredvid en tabell (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` och `.hints.json`) erbjuds aldrig som positioner.
- **Regeln för rörelsefiler.** Om någon fil i urvalet heter `movement*.parquet`, `movement*.csv` (och de andra ändelserna) – `movement.parquet`, `movement_1.parquet` och så vidare – hoppas alla andra datafiler över: *inte en rörelsefil, och mappen har rörelsefiler*. Telemetriexporter har ofta en tabell med positioner bredvid dussintals tabeller utan positioner, och bara den förstnämnda kan ritas. En mapp utan någon rörelsefil läser in alla sina datafiler. Exempel: en mapp med `movement_1.parquet`, `kills.parquet` och `shop.parquet` läser in `movement_1.parquet`; de två andra listas som överhoppade. Exempel: en mapp med `movement_1.parquet`, `kills.parquet` och `shop.parquet` läser in `movement_1.parquet`; de två andra listas som överhoppade.
- De filer som behålls sorteras efter deras sökväg i urvalet, så att samma mapp alltid ger samma datamängd och samma färger.

Panelen visar sedan urvalet (en enskild fils namn, eller `mapp (N filer)` med den längsta gemensamma mappen), antalet filer, deras totala storlek och det totala antalet rader – exakt när alla filer är Parquet, märkt `≈` när någon är CSV. Överhoppade filer listas med sin orsak, de fyra första med namn.

## Läsa schemat {#reading-the-schema}

Den **första** filen i urvalet öppnas för att beskriva schemat ("Läser schema"): dess kolumnnamn, dess första 50 datarader, vilka kolumner som ser numeriska ut och, för Parquet, varje kolumns logiska typ och posten `heat3d` i fotern. En mapp med exporter av en tabell delar ett schema, så en fil står för alla. Sedan mäts varje fil ("Räknar rader"): en Parquet-fot ger det exakta antalet i en liten läsning; en CSV:s antal uppskattas från den genomsnittliga radlängden i dess första megabyte.

[Kolumnmappning](column-mapping.md)-panelen öppnas med de automatiskt mappade gissningarna, och [minnesuppskattningen](memory-and-budgets.md) visas ovanför knappen **Läs in**.

## Meddelanden före inläsning {#messages-before-loading}

Under urvalet listar panelen, från [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Fel** (röda) – inläsningen kan inte börja: färre än två positionsaxlar, samma kolumn på två axlar, en mappad kolumn som inte finns i filen, en positionskolumn som inte ser numerisk ut, en tidskolumn vars samplade värden är text medan enheten är ett tal (varje rad skulle bli NaN och hamna vid tid 0), en tidskolumn satt till ISO-8601 där inget samplat värde går att tolka som datum, en enhetsskala på 0.
- **Varningar** (gula) – den läses in, men troligen inte som avsett: en gruppkolumn som har ett eget värde på de flesta samplade raderna (så det är ett id, inte en grupp), en tidskolumn av typen `DATE` (varje rad på en dag delar samma tidpunkt), blickriktning satt utan sina kolumner.
- **Noteringar** – vad mappningen innebär: ritning på ett plan när en axel inte är mappad, ingen tidslinje utan tidskolumn, inga spår utan en personkolumn, och utan en gruppkolumn en färg för allt och en differens som bara kan delas på en kolumn som behållits för filtrering.

## Läsa in {#loading}

Knappen **Läs in** säger *Läs in fil*, *Läs in N filer*, eller *Läs in N filer (1 av K)* när ett [gallringssteg](memory-and-budgets.md#decimation) är satt. Den säger *För stor – minska eller gallra* och är inaktiverad när [passningskontrollen](memory-and-budgets.md#the-fit-check) säger att inläsningen inte ryms; den är också inaktiverad medan mappningen har fel eller en annan inläsning pågår.

Under inläsningen visar panelen det aktuella steget (med `[fil/filer]` framför när det är flera filer), de rader som lästs hittills, en förloppsstapel och **Avbryt**. Avbryt stoppar inläsningsarbetaren, och med den alla tolkningsarbetare den startat.

Sidan fortsätter att ritas medan den läser in, eftersom arbetet sker i bakgrunden. Du ser det aktuella steget, raderna som lästs, en förloppsstapel och **Avbryt**. Efter den sista filen visar panelen stegen *Lägger raderna i tidsordning*, *Ordnar om kolumnerna (n av m)*, *Mäter omfånget*, *Bygger listan*, *Sammanfattar sessioner* och *Beräknar livslängder*, och sedan *Laddar upp N rader till grafikkortet* under en bildruta, så att en lång uppladdning aldrig förväxlas med att programmet har hängt sig.

### Så fungerar det {#how-it-works}

Inläsningen körs i en webbarbetare ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Med flera filer och fler än en [tolkningstråd](memory-and-budgets.md#parser-threads) tolkas upp till så många filer **samtidigt**, var och en i en egen tolkningsarbetare ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), så långt RAM-budgeten ger utrymme; de slås ihop en i taget i urvalets ordning, så datamängden blir densamma som vid en inläsning en i taget. Medan flera är igång nämner förloppsraden filen som senast rapporterade, och stapeln och radantalet adderar varje fil som är igång. Med en tråd, eller en enda fil, tolkas filerna en efter en i själva inläsningsarbetaren. Bara de kolumner som mappningen nämner läses: en omappad kolumn i en Parquet-fil kostar ingenting; en CSV skannas byte för byte men bara de mappade fälten avkodas.

## Flera filer blir en datamängd {#several-files-become-one-dataset}

När mer än en fil läses in ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **En lista.** Personer, grupper, sessioner och kategorivärden är ordböcker som delas av alla filer, så samma spelare i två exporter är en person med ett spår.
- **Ett tidsursprung.** Tider hålls som 64-bitars sekunder medan de slås ihop och räknas om till den tidigaste tiden i *hela* urvalet, och lagras sedan som 32-bitars sekunder från det ursprunget. Fyra exporter från fyra eftermiddagar placeras i sin verkliga ordning, inte staplade ovanpå varandra.
- **En tidsordning.** Rader från alla filer sorteras efter tid med en radixsortering (se [sorteringsgränsen](memory-and-budgets.md#the-sort-ceiling)).
- **En kolumn `Source file`.** Varje rad minns vilken fil den kom från, som en kategorikolumn med namnet `Source file`. Den syns i [Filter](filters.md) och som *Source file – jämför två inläsningar* i [differensuppdelningen](difference.md). En inläsning av en enda fil får den inte – en konstant kolumn skulle kosta 4 byte per rad för att säga ingenting.
- **Saknade kolumner.** En fil som saknar en av *filter*-kolumnerna bidrar helt enkelt inga värden för den. En fil som saknar en mappad *roll*-kolumn (X, tid, person ...) misslyckas med *filen har ingen kolumn "namn"*; vid en inläsning av flera filer hoppas den filen över och de andra läses fortfarande in, och de överhoppade filerna listas på datamängden. En inläsning av en enda fil som misslyckas rapporterar felet.
- **Varning för underskott.** När de inlästa raderna är färre än 95 % av de radantal som räknades i förväg, bär datamängden en varning med den saknade andelen – från oläsbara filer eller från rader utan en användbar position, som släpps på vägen in.

## Efter inläsningen {#after-loading}

Den nya datamängden ersätter en tidigare. Vid varje inläsning ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- rensas alla filter och gruppsynligheter;
- nollställs differensuppdelningen per grupp: den första halvan av grupperna (avrundat uppåt) positiv, resten negativ;
- sätts punktradien till den horisontella utsträckningen / 120 och mättnaden till en analytisk uppskattning; kubstorlek, blickstrålens längd, flyghastighet och de när/fjärran-planen sätts från utsträckningen (se [Sessioner, personer och grupper](sessions-persons-groups.md#entity-size));
- sätts boxrepriset till sessionen med flest rader;
- gissas linjevärmens rutter på nytt ([Linjevärme](line-heat.md));
- faller vylägt tillbaka till **Värme** om det aktuella läget inte stöds av den nya datan; tidslinjen faller tillbaka till **Alla** utan en tidskolumn och historiken till **Kumulativt** utan livslängder;
- parkeras uppspelningshuvudet vid starten och uppspelningen stoppas;
- ramar kameran in hela datamängden från standardriktningen (tittar längs −Z, lutad nedåt cirka 36°).

Panelen **Datamängd** visar sedan datamängdens namn (urvalet, antalen rader och filer, och gallringssteget när ett användes), `N lag · N personer · Ns spann`, och varje varning som inläsningen gav, i gult, så länge datamängden är inläst. **Ta bort** i panelen tar bort datamängden.
