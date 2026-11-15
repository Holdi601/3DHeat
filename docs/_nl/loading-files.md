---
title: "Bestanden laden"
parent: "Gegevens binnenhalen"
nav_order: 1
lang: "nl"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Bestanden laden

Deze pagina laat zien hoe je 3DHeat je bestanden geeft en wat het ermee doet. Zet een map neer, en het kiest de bestanden met posities en voegt die samen tot één beeld.

1. Open **Bron** bovenaan de zijbalk van de Heatmap.
2. Zet bestanden of een map op het sleepvlak, of druk op **Bestanden…** of **Map…**.
3. Lees de selectieregel en de **Geheugenschatting** (zie de afbeelding hieronder).
4. Druk op **Laden**.

![Het deel Bron na het neerzetten van een map met tien matches: 1 de selectieregel, 2 de Geheugenschatting op past, en 3 Laad 10 bestanden](../assets/img/en/loading-files-source.webp)

*Na het neerzetten van een map laat 3DHeat zien wat het vond en of het past.*

Bestanden worden geladen in het deel **Bron** bovenaan de zijbalk van het tabblad Heatmap. Alles wat tegelijk gekozen wordt, wordt **één** dataset.

## Bestanden kiezen {#choosing-files}

| Bediening | Wat het doet |
|---|---|
| **Sleep bestanden of een map hierheen** (het sleepvlak) | Zet elke mix van bestanden en mappen neer. Mappen worden recursief doorlopen. Klikken op het sleepvlak opent dezelfde kiezer als **Bestanden…**. |
| **Eén bestand…** | Een bestandskiezer voor één bestand. |
| **Bestanden…** | Een bestandskiezer die meerdere bestanden aanneemt. |
| **Map…** | Een mapkiezer (de `webkitdirectory`-kiezer van de browser); elk bestand in de mapboom wordt aangeboden. |

De kiezers nemen de buitenlandse bestandstypen uit de [lijst met laadbare bestanden](data-formats.md#files). Kort samengevat: `.parquet`/`.pq` worden als Parquet gelezen, `.csv`/`.tsv`/`.txt` als gescheiden tekst, `.acmi` (Tacview), OCAP `.json`/`.json.gz` en de GPS-formaten (GPX, KML, KMZ, NMEA, IGC, FIT) gaan elk via hun eigen lezers, en `.3dheat`-matchcontainers worden geladen als de tabellen die ze bevatten ([Eén bestand per wedstrijd](container.md)). Een container die niet gelezen kan worden, wordt overgeslagen als *geen csv/parquet-bestand*.

Gesleepte mappen worden tot een diepte van 12 niveaus doorlopen, met hoogstens 20.000 bestanden, als bescherming tegen symlink-lussen en wegloopbomen.

## Welke bestanden worden bewaard {#which-files-are-kept}

Voordat er iets gelezen wordt, wordt de selectie gefilterd ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Een bestand met een andere extensie wordt overgeslagen: *geen csv/parquet-bestand*.
- Een bestand van 0 bytes wordt overgeslagen: *leeg (0 bytes)*.
- **Bijbestanden van converters** - de ruwe data die een converter naast de tabel van een match bewaart, `<match>.messages.parquet`, `.events.parquet`, `.raw.parquet` en de andere die vermeld staan in [Converters bewaren alles](converters.md) - worden overgeslagen: *een bijbestand van een converter*. Om er één te openen, kies of zet hem alleen neer (of alleen bijbestanden): een selectie met niets dan bijbestanden laadt ze net als elke tabel. De JSON naast een tabel (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` en `.hints.json`) wordt nooit als posities aangeboden.
- **De bewegingsbestandsregel.** Als een bestand in de selectie `movement*.parquet`, `movement*.csv` (en de andere extensies) heet - `movement.parquet`, `movement_1.parquet` enzovoort - dan wordt elk ander databestand overgeslagen: *geen bewegingsbestand, en deze map heeft bewegingsbestanden*. Telemetrie-exports bevatten vaak één tabel met posities naast tientallen tabellen zonder posities, en alleen de eerste kan getekend worden. Een map zonder bewegingsbestand laadt alle databestanden. Voorbeeld: een map met `movement_1.parquet`, `kills.parquet` en `shop.parquet` laadt `movement_1.parquet`; de andere twee staan als overgeslagen vermeld. Voorbeeld: een map met `movement_1.parquet`, `kills.parquet` en `shop.parquet` laadt `movement_1.parquet`; de andere twee staan als overgeslagen vermeld.
- De bewaarde bestanden worden gesorteerd op hun pad binnen de selectie, zodat dezelfde map altijd dezelfde dataset en dezelfde kleuren oplevert.

Het paneel toont daarna de selectie (de naam van één bestand, of `map (N bestanden)` met de langste gemeenschappelijke map), het aantal bestanden, hun totale grootte en het totale aantal rijen - exact als alle bestanden Parquet zijn, gemarkeerd met `≈` als er één CSV bij zit. Overgeslagen bestanden staan vermeld met hun reden, de eerste vier met naam.

## Het schema lezen {#reading-the-schema}

Het **eerste** bestand van de selectie wordt geopend om het schema te beschrijven ("Schema lezen"): zijn kolomnamen, zijn eerste 50 datarijen, welke kolommen numeriek lijken en, voor Parquet, het logische type van elke kolom en het `heat3d`-voetregelitem. Een map met exports van één tabel deelt één schema, dus één bestand staat voor allemaal. Daarna wordt elk bestand gemeten ("Rijen tellen"): een Parquet-voet geeft het exacte aantal in één kleine lezing; het aantal van een CSV wordt geschat uit de gemiddelde regellengte van zijn eerste megabyte.

Het paneel [Kolomtoewijzing](column-mapping.md) opent met de automatisch gedane gissingen, en de [geheugenschatting](memory-and-budgets.md) verschijnt boven de knop **Laden**.

## Meldingen voor het laden {#messages-before-loading}

Onder de selectie toont het paneel, uit [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Fouten** (rood) - het laden kan niet beginnen: minder dan twee positieassen, dezelfde kolom op twee assen, een toegewezen kolom die niet in het bestand staat, een positiekolom die niet numeriek lijkt, een tijdkolom waarvan de gesamplede waarden tekst zijn terwijl de eenheid een getal is (elke rij zou als NaN gelezen worden en op tijd 0 terechtkomen), een tijdkolom ingesteld op ISO-8601 waarvan geen enkele gesamplede waarde als datum te lezen is, een eenheidsschaal van 0.
- **Waarschuwingen** (oranje) - het laadt, maar waarschijnlijk niet zoals bedoeld: een groepskolom die op de meeste gesamplede rijen een andere waarde heeft (dus het is een id, geen groep), een `DATE`-tijdkolom (elke rij van een dag deelt één moment), kijkrichting ingesteld zonder zijn kolommen.
- **Opmerkingen** - wat de toewijzing inhoudt: tekenen op een vlak als één as niet is toegewezen, geen tijdlijn zonder tijdkolom, geen sporen zonder een persoonskolom, en zonder een groepskolom één kleur voor alles en een verschil dat alleen kan splitsen op een kolom die bewaard is voor filteren.

## Laden {#loading}

De knop **Laden** leest *Bestand laden*, *N bestanden laden*, of *N bestanden laden (1 op K)* wanneer een [decimatiestap](memory-and-budgets.md#decimation) is ingesteld. Hij leest *Te groot - verklein of decimeer* en is uitgeschakeld als de [pasvormcontrole](memory-and-budgets.md#the-fit-check) zegt dat het laden niet past; hij is ook uitgeschakeld zolang de toewijzing fouten heeft of een ander laden loopt.

Tijdens het laden toont het paneel de huidige stap (met `[bestand/bestanden]` ervoor als er meerdere zijn), de tot nu toe gelezen rijen, een voortgangsbalk en **Annuleren**. Annuleren stopt de ingestworker, en daarmee elke parserworker die die gestart heeft.

De pagina blijft tekenen tijdens het laden, omdat het werk op de achtergrond gebeurt. Je ziet de huidige stap, de gelezen rijen, een voortgangsbalk en **Annuleren**. Na het laatste bestand toont het paneel de stappen *Rijen in tijdsvolgorde zetten*, *Kolommen herordenen (n van m)*, *Omvang meten*, *Het register opbouwen*, *Sessies samenvatten* en *Levensduur berekenen*, en daarna *N rijen naar de GPU uploaden* voor één beeld, zodat een lange upload nooit voor een bevriezing wordt aangezien.

### Hoe het werkt {#how-it-works}

Het laden draait in een Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Bij meerdere bestanden en meer dan één [parserthread](memory-and-budgets.md#parser-threads) worden tot zoveel bestanden **tegelijk** geparseerd, elk in een eigen parserworker ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), voor zover het RAM-budget ruimte laat; ze worden nog steeds één voor één samengevoegd in de volgorde van de selectie, dus de dataset is dezelfde als bij een laden één voor één. Terwijl er meerdere onderweg zijn, noemt de voortgangsregel het bestand dat het laatst meldde, en tellen de balk en het aantal rijen elk bestand onderweg op. Met één thread, of bij één bestand, worden bestanden na elkaar in de ingestworker zelf geparseerd. Alleen de kolommen die de toewijzing noemt, worden gelezen: een niet-toegewezen kolom van een Parquet-bestand kost niets; een CSV wordt byte voor byte doorzocht, maar alleen de toegewezen velden worden gedecodeerd.

## Meerdere bestanden worden één dataset {#several-files-become-one-dataset}

Wanneer meer dan één bestand geladen wordt ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Één register.** Personen, groepen, sessies en categoriewaarden zijn woordenlijsten die over alle bestanden gedeeld worden, dus dezelfde speler in twee exports is één persoon met één spoor.
- **Één tijdoorsprong.** Tijden worden tijdens het samenvoegen als 64-bits seconden bewaard en verschoven naar het vroegste tijdstip van de *hele* selectie, en daarna als 32-bits seconden vanaf die oorsprong opgeslagen. Vier exports van vier middagen worden in hun echte volgorde geplaatst, niet op elkaar gestapeld.
- **Één tijdvolgorde.** Rijen van alle bestanden worden op tijd gesorteerd met een radixsort (zie [de sorteergrens](memory-and-budgets.md#the-sort-ceiling)).
- **Een kolom `Source file`.** Elke rij onthoudt uit welk bestand hij kwam, als categoriekolom met de naam `Source file`. Die verschijnt in [Filters](filters.md) en als *Source file - twee laadacties vergelijken* in de [verschilverdeling](difference.md). Een load van één bestand krijgt hem niet - een constante kolom zou 4 bytes per rij kosten om niets te zeggen.
- **Ontbrekende kolommen.** Een bestand dat een van de *filter*kolommen mist, levert gewoon geen waarden voor die kolom. Een bestand dat een toegewezen *rol*kolom mist (X, tijd, persoon, ...) faalt met *bestand heeft geen kolom "naam"*; bij een load van meerdere bestanden wordt dat bestand overgeslagen en laden de andere nog steeds, en de overgeslagen bestanden staan vermeld op de dataset. Een load van één bestand die faalt, meldt de fout.
- **Waarschuwing voor tekort.** Als de geladen rijen minder zijn dan 95% van de vooraf geteld rijen, krijgt de dataset een waarschuwing met het ontbrekende aandeel - van onleesbare bestanden, of van rijen zonder bruikbare positie, die onderweg worden weggelaten.

## Na het laden {#after-loading}

De nieuwe dataset vervangt elke eerdere. Bij elk laden ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- worden alle filters en de zichtbaarheid van groepen gewist;
- wordt de verschilverdeling per groep teruggezet: de eerste helft van de groepen (naar boven afgerond) positief, de rest negatief;
- wordt de straal van de sprites gezet op de horizontale omvang / 120 en de verzadiging op een analytische schatting; de kubusgrootte, de lengte van de kijkstraal, de vliegsnelheid en de nabije/verre vlakken worden uit de omvang gezet (zie [Sessies, personen en groepen](sessions-persons-groups.md#entity-size));
- wordt de sessie van de doosreplay gezet op de sessie met de meeste rijen;
- worden de routes van de lijnwarmte opnieuw geraden ([Lijnwarmte](line-heat.md));
- valt de weergavemodus terug op **Warmte** als de huidige modus niet door de nieuwe data wordt ondersteund; valt de tijdlijn terug op **Alles** zonder tijdkolom en de geschiedenis op **Cumulatief** zonder levensduur;
- wordt de afspeelkop aan het begin gezet en stopt het afspelen;
- kadert de camera de hele dataset vanuit de standaardrichting (kijkend langs -Z, ongeveer 36° naar beneden gekanteld).

Het paneel **Dataset** toont dan de naam van de dataset (de selectie, het aantal rijen en bestanden, en de stap als er een gebruikt is), `N teams · N personen · Ns bereik`, en elke waarschuwing die het laden gaf, in oranje, zolang de dataset geladen is. **Verwijderen uit geheugen** in dat paneel verwijdert de dataset.
