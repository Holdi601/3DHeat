---
title: "Converters bewaren alles"
parent: "Gegevens binnenhalen"
nav_order: 8
lang: "nl"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Converters bewaren alles

Je hebt deze pagina niet nodig om een replay te openen. Hij is voor mensen die hulpmiddelen schrijven die spelbestanden omzetten in 3DHeat-tabellen, en voor wie wil weten waarom die tabellen zoveel bevatten.

Elk hulpmiddel dat de replay, demo, log of live telemetrie van een spel omzet in iets dat de viewer opent, volgt één regel:

> **Zet alles om wat de bron bevat en dat nu gelezen kan worden, en bewaar de rest heel, zodat het later gelezen kan worden zonder het oorspronkelijke bestand.**

Een replay is na een spelupdate, een herinstallatie of een volle schijf vaak weg. Een live feed is weg zodra hij is verzonden. Wat een converter weglaat, is voorgoed verloren. Wat hij heel bewaart, kan worden gedecodeerd op de dag dat iemand het begrijpt. Een converter beslist dus nooit wat nuttig zal zijn. Hij decodeert wat hij kan, bewaart elk ander bericht, pakket, gebeurtenis, eigenschap of regel ongewijzigd naast de tabel, en zegt in zijn eigen uitvoer hoeveel van elk hij heeft gelezen en hoeveel hij alleen heeft bewaard.

Deze pagina beschrijft de conventie die alle converters delen: de converters voor replays van War Thunder, World of Tanks, World of Warships en Squad, de CS2-democonverter, de achtergrondwatcher (de Dota-replaydecoder en elke live-adapter), de telemetrielezers van de game-opnametool, en de eigen imports van de viewer (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). De eigen lezers van de viewer staan beschreven in [Tacview-opnames](tacview-acmi.md) en [Bestanden laden](loading-files.md). De vorm in één bestand is [Eén bestand per match](container.md). Eén match wordt een tabel, een `match.json` en sidecars, eventueel samengevoegd tot één `.3dheat`-bestand. De README van elk hulpmiddel heeft een sectie **Completeness** die voor die bron opsomt wat gelezen wordt, wat ruw bewaard blijft en wat niet beschikbaar is, en waarom.

## Drie plekken voor elk item {#three-homes-for-every-item}

Alles wat een bron bevat, komt op precies één van drie plekken terecht:

| Plek | Wat er komt |
|---|---|
| **Gedecodeerd** | De tabel (één rij per sample of gebeurtenis, de kolommen die de viewer leest, extra kolommen voor elke andere waarde die bij een rij hoort) en het matchdocument `<match>.match.json` (alles wat bij de match als geheel hoort: instellingen, opstellingen, uitslagen, scorebord, de zelfcontrole). |
| **Ruw bewaard** | Een sidecar naast de tabel: elk item dat niet, of maar gedeeltelijk, gedecodeerd is, heel en ongewijzigd, met zijn type, tijd en de eenheid of entiteit waartoe het hoort. |
| **Niet beschikbaar** | Genoemd in de sectie Completeness van de README, met de reden: het formaat bevat het niet (een replay van de client heeft geen invoer van andere spelers), de bron stuurt het nooit, of het lezen is niet toegestaan (een beschermd proces, een versleuteld blok waarvan de sleutel niet van ons is). |

Een item dat **gedeeltelijk** gedecodeerd is, wordt zowel gedecodeerd *als* ruw bewaard. De tabel krijgt wat begrepen wordt, de sidecar het hele item. Zo hoeft een latere, betere decoder het oorspronkelijke bestand niet meer te hebben.

Er is geen vierde plek. Iets weglaten omdat het nutteloos leek, omdat het "waarschijnlijk" een dubbele was, of omdat het groot was, is een fout. Uitdunnen mag alleen in de tabel (een camera op 2 Hz in plaats van 60), nooit in de sidecar.

## Sidecars {#sidecars}

Een sidecar is een Parquet-bestand naast de tabel, met dezelfde naam:

```
<map>/<match>.parquet              de tabel
<map>/<match>.match.json           het matchdocument
<map>/<match>.<wat>.parquet        een sidecar
```

`<wat>` is één woord uit deze lijst. Een nieuwe converter kiest het woord dat past, of voegt hier een nieuw woord toe **en** aan `SIDECAR_PARQUET` in
[`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts),
zodat de viewer het overslaat wanneer een hele map wordt geladen.

| `<wat>` | Bevat | Gebruikt door |
|---|---|---|
| `messages` | pakketten, entiteitsmethodeaanroepen en eigenschapsupdates van een netwerkstroom, heel | War Thunder, World of Tanks, World of Warships |
| `flight` | vliegmodelgegevens per vliegtuig, heel | War Thunder |
| `packets` | hele frames en netwerkberichten, of containerblokken, buiten de entiteitsstroom | CS2, Dota 2, Squad |
| `events` | spelgebeurtenissen met al hun sleutels, zoals de parser ze geeft | CS2 |
| `entities` | entiteits- en eigenschapsupdates, externe aanroepen, kanalen die geopend en gesloten zijn, met de exports die een decoder nodig heeft | Squad, Dota 2 |
| `props` | elke entiteitseigenschap die de parser leest, telkens als ze veranderde | CS2 |
| `units` | staat per eenheid buiten de positietabel | Dota 2 |
| `combatlog` | een gevechtslog, elke regel met elk veld | Dota 2 |
| `strings` | elk item van elke stringtabel | CS2, Dota 2 |
| `objectives` | veroveringszones en doelen, elke wijziging met zijn tijd | War Thunder |
| `raw` | een live feed: elk pakket, elke regel, elk API-document of geheugenlezing die is ontvangen, heel | de sessies van de watcher (`heat.raw.parquet`), de rondeopnemers van de game-opnametool (`<stempel>_<spel>.raw.parquet`), de replaybestanden van de watcher voor osu!, LoL en Valorant |

Het laden van een map in de viewer slaat elk `*.<wat>.parquet` uit deze lijst over, en elk
`*.match.json`, `*.meta.json`, `*.summary.json` en de andere JSON-sidecars. Opent men er één apart, door alleen dat bestand te kiezen of te slepen, dan wordt het geladen als elke andere tabel (zie [Bestanden laden](loading-files.md)).

Dit zijn de bestanden zoals een converter ze schrijft met `--loose`. Standaard bundelen de converters voor War Thunder, CS2 en Tacview de tabel, het document en de sidecars van een match in één bestand, `<match>.3dheat`, onder dezelfde namen (zie [Eén bestand per match](container.md)). Alles hier geldt voor elk onderdeel daarvan.

### Kolommen {#columns}

Elke rij van een sidecar is één item. De kolommen staan in deze volgorde, voor zover ze van toepassing zijn:

| Kolom | Type | Wat |
|---|---|---|
| `time` | float64 | seconden op dezelfde klok als de `time` van de tabel (of `tick` waar de bron ticks telt; dan beide) |
| `type` | string (woordenboek) | wat het item is, in de eigen termen van de bron: een pakkettype, berichtnummer, gebeurtenisnaam, eigenschapspad, regelvoorvoegsel |
| `name` | string (woordenboek) | de naam waar die bekend is (een naam uit de community, een klassenaam), anders leeg |
| `entity` / `unit` / `uid` / `player` | geheel getal of string | aan wie het hoort, in dezelfde id's als de tabel, zodat een rij van de sidecar aan een spoor gekoppeld kan worden |
| `decoded` | string (JSON) | wat ervan begrepen wordt, als er iets begrepen wordt; anders leeg |
| `payload` | binair | de bytes van het item, heel en ongewijzigd (binaire bronnen) |
| `text` | string | de tekst van het item, heel en ongewijzigd (tekstbronnen: een logregel, een JSON-object, een sleutel-waardeblok) |

Er mogen meer kolommen bij (een bitoffset, een grootte, een kanaal). Strings die zich herhalen worden met een woordenboek gecodeerd en het bestand wordt met zstd geschreven. Zo blijft een sidecar een fractie van de grootte van de eigen replay.

Een sidecar moet op zichzelf genoeg zijn. Een decoder die later wordt geschreven, leest de sidecar en nooit de originele replay. Waar een item niet begrepen kan worden zonder context (de klasse van een entiteit, een stringtabel, een sleutel waarnaar een bericht verwijst), gaat die context ook in de sidecar, of in het matchdocument.

### Live bronnen {#live-sources}

Live adapters (UDP-telemetrie, gedeeld geheugen, de log van een spel, een lokale API) hebben helemaal geen bestand om naar terug te gaan. Ze leggen **elk veld vast dat de bron stuurt**, ook de velden die nog niets gebruikt:

- een pakketstroom: elk pakket heel, `payload` de bytes, `type` zijn pakket-id of formaat, op het tempo waarin het binnenkomt;
- gedeeld geheugen of een gepolde API: elk veld van elke lezing, als benoemde kolommen of het hele blok als `payload`, op het tempo waarin de adapter leest;
- een log: elke regel, `text` de regel, `type` de soort regel, ook regels waar de adapter niets mee doet.

Die gaan in `<sessie>.raw.parquet` naast de tabel van de sessie. De grootte is de prijs van de regel. Ze wordt beperkt door zstd en woordenboekcodering, niet door dingen weg te laten.

## De zelfcontrole {#the-self-check}

Elke converter schrijft in zijn matchdocument (of in de `meta.json` van de sessie, of in een samenvatting waar er geen matchdocument is) een blok `completeness` onder `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Veld | Betekenis |
|---|---|
| `seen` | hoeveel items van dit type de bron bevat |
| `decoded` | heel gelezen in de tabel of het matchdocument |
| `partial` | gedeeltelijk gelezen in de tabel of het document, en heel bewaard in een sidecar |
| `raw` | alleen heel bewaard in een sidecar, niet gedecodeerd |
| `lost` | `seen - decoded - partial - raw`: moet 0 zijn |

Het `lost` op het hoogste niveau is de som. De tests van een converter controleren dat het 0 is bij hun synthetische voorbeelden, en de README zegt wat het bij echte voorbeelden was. Een `lost` die niet 0 is, is de converter die zegt dat hij de regel heeft gebroken. Hij noemt het type, zodat het gat gevonden kan worden.

De "types" zijn van de bron zelf: pakkettypen, berichtnummers, gebeurtenisnamen, eigenschapsgroepen, soorten regels. Ze worden geteld waar de converter ze tegenkomt, niet uit een lijst van wat hij verwacht. Zo verschijnt een type dat niemand kende met zijn aantal, in plaats van te verdwijnen.

## De sectie Completeness van de README {#the-readmes-completeness-section}

De README van elke converter heeft een sectie met de kop **Completeness**, met drie lijsten:

- **Gelezen**: wat in de tabel en het matchdocument komt, en hoe elk nieuw veld is gecontroleerd tegen iets onafhankelijks (de eigen getallen van het spel, een tweede bron, een opname die daarvoor is gemaakt).
- **Ruw bewaard**: wat in welke sidecar zit, onder welk `type`, en wat er tot nu toe van bekend is.
- **Niet beschikbaar**: wat de bron niet bevat of wat niet gelezen mag worden, en waarom.

Ze verwijst terug naar deze pagina.

## Waar elke converter staat {#where-each-converter-stands}

| Converter | Sidecars | Zijn sectie Completeness |
|---|---|---|
| War Thunder-replays | `messages`, `flight` | [README 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (zijn zelfcontrolegetallen staan onder `counts`; het blok `completeness` komt nog) |
| World of Tanks-replays | `messages` | [README 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World of Warships-replays | `messages` | [README 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squad-serverdemo's | `entities`, `packets` | [README 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2-demo's | `events`, `props`, `strings`, `packets` | [README 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota 2-replays (watcher) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota 2-replays](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!-, LoL- en Valorant-replays (watcher) | `raw` | hun pagina in de [documentatie van de watcher](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Live adapters (watcher) | `raw` | de pagina van elk spel in de [documentatie van de watcher](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), en [ontwikkeling](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) voor `Session.raw` |
| Rondeopnemers (game-opname) | `raw`, en `unparsed`-bytes in een Forza-rondebestand | [README 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| De eigen imports van de viewer | geen: zie hieronder | deze pagina |

### De eigen imports van de viewer {#the-viewers-own-imports}

Tacview ACMI, OCAP en de GPS-formaten worden in de browser gelezen uit het eigen bestand van de gebruiker. De viewer bewaart er niets van, dus het bestand zelf blijft de registratie. Toch lezen ze zoveel als ze kunnen:

- **Tacview ACMI** (`src/data/acmi.ts`): elke objectregel met een positie is een rij met elke eigenschap die de opname bevat, elke gebeurtenis is een rij, elke verwijdering is een rij, en de eigen eigenschappen van de opname (met FileType en FileVersion uit de kop) staan op elke rij als `RecordingInfo`. Een opmerkingsregel is een gebeurtenis `Comment`, een object dat nooit een positie krijgt is een rij `Unplaced` op het referentiepunt, en U/V zijn kolommen zodra een rij ze heeft. Een eigenschapsregel zonder positie wordt gedeeltelijk gelezen: de waarden komen bij de volgende rij van het object, niet op hun eigen tijd. `AcmiTable.completeness` telt de regels van het bestand per soort.
- **OCAP** (`src/data/ocap.ts`): alle frames, schoten en markeringen van elke entiteit, elke soort gebeurtenis (onbekende soorten als rijen van "Mission" met hun tekst), en de eigen velden van het document (`Info`). Nog niet gelezen: entiteitsvelden en volgende positie-elementen die niet in zijn kop staan (toevoegingen van een nieuwere recorder), en de herhaalde frames van een gesneuveld eenheid na haar dood (bewust uitgedund: er verandert niets in).
- **GPS-formaten** (`src/data/geoTracks.ts`): de fixes, hun tijd, hoogte, koers en snelheid, en hartslag, cadans, vermogen, temperatuur, satellieten, HDOP en drukhoogte waar het bestand die logt. Nog niet gelezen: andere GPX- en KML-extensies, NMEA-zinnen anders dan de positiezinnen, IGC-records anders dan fixes en hun extensies, en FIT-berichten anders dan records (rondes, sessies, apparaatinformatie).

Deze hiaten staan er om ze te sluiten, niet om ze te excuseren. De exports van de viewer van een geladen opname (`src/data/exportRecording.ts`) schrijven alleen wat gelezen is.

## Een converter toevoegen {#adding-a-converter}

1. Maak een lijst van wat het formaat bevat, uit de documentatie, de eigen structuren, of door elk berichttype in echte voorbeelden te tellen. De lijst is de `types` van de zelfcontrole.
2. Decodeer wat nu gecontroleerd kan worden. Elk nieuw veld wordt gecontroleerd tegen iets onafhankelijks voordat het in de tabel komt. Een veld dat nog niet gecontroleerd kan worden, blijft ruw.
3. Bewaar de rest heel in een sidecar met de naam hierboven, met de kolommen hierboven.
4. Schrijf het blok `completeness` en een test die controleert dat `lost` 0 is.
5. Schrijf de sectie Completeness van de README en verwijs naar deze pagina.
6. Als het `<wat>` van de sidecar nieuw is, voeg het toe aan de tabel hierboven en aan `SIDECAR_PARQUET` in `src/data/filePick.ts`.

Converters worden clean-room geschreven: ze komen uit formaten, documentatie en voorbeelden, nooit uit GPL- of AGPL-code. Voorbeelden van echte replays blijven op de computer waarop ze zijn gemaakt. Tests gebruiken synthetische bestanden.
