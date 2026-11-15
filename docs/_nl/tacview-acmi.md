---
title: "Tacview-opnamen (ACMI)"
parent: "Gegevens binnenhalen"
nav_order: 7
lang: "nl"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Tacview-opnamen (ACMI)

Tacview is een programma dat vluchten in vluchtsimulators opneemt; de bestanden eindigen op `.acmi`. 3DHeat opent ze zodat je kunt zien waar elk vliegtuig heeft gevlogen.

Tacview-vluchtopnamen laden net als elke tabel: kies of sleep een `.acmi` (tekst, `.txt.acmi`, of gezipt, `.zip.acmi`) en druk op **Laden**. Je krijgt dan de warmte van alle vluchten, en op het tabblad **Match** een replay met figuren, sporen en een gebeurtenissenlijst ([Wedstrijdreplay](match-replay.md)). ACMI is het openbare bestandsformaat van Tacview ([documentatie](https://www.tacview.net/documentation/acmi/)); DCS (via de exporter van Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS en andere schrijven het, dus dit leest elk ervan.

## Wat een opname wordt {#what-a-recording-becomes}

Eén rij elke keer dat de positie van een object wordt geschreven, één rij per gebeurtenis op de plek van het object, en één rij wanneer een object verdwijnt (`Removed`, waar het voor het laatst was). Een gebeurtenis over een object dat nog niet is gezien - een bladwijzer, een bericht aan iedereen - is een rij van het object `(recording)` op het referentiepunt. De opname bevat zijn eigen leesinstructies, dus de koppelstap vult zichzelf in. De lezer schrijft deze kolommen: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, en daarna alle verdere eigenschappen die de opname heeft. Hun rollen:

| Kolom | Rol | Betekenis |
|---|---|---|
| Time | tijd | Seconden na de ReferenceTime van de opname; Unix-seconden als die er een heeft, zodat de klok de echte tijd toont. |
| X, Y | positie | Oost en noord, in meters, op een vlak dat de aarde raakt in het referentiepunt van de opname: afstanden en peilingen zijn er juist, en wijken op 100 km minder dan een duizendste af. Noord wordt de -Z van de wereld. |
| Altitude | positie (omhoog) | Meters. |
| Object | persoon | De piloot en de naam van het object met zijn id, bijvoorbeeld `Viper 1 (F-16C_50) #a01`; een onbemand object `(T-90A) #401`. |
| Coalition | team | De partij (of de kleur, als er geen coalitie is). |
| Heading, Pitch | kijkrichting | Graden; koers 0 is noord. |
| Recording | sessie | De Title van de opname, of de bestandsnaam: meerdere opnamen laden naast elkaar zonder dat hun sporen aan elkaar vastzitten. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filters | Bewaard voor filteren; Type en Name kiezen de [figuur](figures.md) van elk object, Event voedt de gebeurtenissenlijst van de nabespreking, Roll laat het vliegtuig kantelen. |
| U, V | | De eigen platte-wereldmeters van het spel, wanneer elk monster ze heeft (DCS schrijft ze). |
| EventObjects | filters | Elk object dat een gebeurtenis noemt (`Message|a01|b02|...`), op id. |
| RecordingInfo | | De eigen eigenschappen van de opname zoals ze op dat moment stonden - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - als JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filters | Elke andere numerieke eigenschap die de opname heeft. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filters | Elke andere teksteigenschap die de opname heeft; een eigenschap met een waarde die geen getal is, is tekst. |

Alle vier vormen van de positie van Tacview (`lon|lat|alt`, met `u|v`, met `roll|pitch|yaw`, en met alles plus een koers) worden gelezen; lege velden houden de laatste waarde. `-id` verwijdert een object, en een id dat daarna weer wordt gebruikt, is een nieuw object. Ge-escapete komma's en doorlopende regels worden verwerkt.

De posities worden altijd geprojecteerd vanuit breedte- en lengtegraad, nooit uit U/V, zodat opnamen van elk spel één projectie delen met een achtergrond van de echte wereld.

## DCS-servers: wie won, en hoe elke vlucht eindigde {#dcs-servers-who-won-and-how-each-sortie-ended}

Een DCS-multiplayerserver neemt zijn missies dag en nacht op met Tacview, en een persistente PvP-server speelt een campagne over veel daarvan: een kant wint door elk vliegveld, elke FARP en elke zone van de andere in te nemen, wat dagen en veel herstarts van de missie kost. De opnamen bevatten de vluchten, niet de campagne: geen bericht zegt wie wat innam, de vliegvelden worden één keer aan het begin geschreven, en geen enkel bericht zegt wie won. De Tacview-converter (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) voegt aan elke rij toe wat te weten is, en laat leeg wat niet te weten is - hij gokt nooit.

| Kolom | Betekenis |
|---|---|
| `server` | de server of de campagne, uit de kop van de opname (de Title, Author en Comments ervan noemen de bekende openbare servers - Blue Flag, SPS Contention, Growling Sidewinder; anders een Author die iemand noemt); `--server Name` geeft hem een naam voor een hele map. Een opname waarvan de kop geen server noemt - een Author zoals `Admin`, een Title en Comments die geen bekende server schrijft - blijft zonder toewijzing: `server` leeg, ook als ze gedownload is van de opnamepagina van een server, want die pagina kan ook missies van andere community's bevatten |
| `mission` | de Title van de opname zonder versie en campagnemaand: `Operation_Example_V7.7.99` wordt `Operation Example` |
| `campaign` | de campagneronde waar de opname bij hoort, naar server, kaart en nummer: `Example Server North 3`. Eén opname is één sessie (van herstart tot herstart); een ronde loopt over veel sessies, dagen of weken |
| `round` | het nummer van die ronde: dat van de server als die er een publiceert, anders de n-de geziene ronde van die server en die kaart; uit een rondebestand (hieronder), leeg zonder |
| `session` | de plaats van de opname tussen de sessies van de ronde, 1, 2, ...; `sessionStart` het echte begin ervan (Unix-seconden) |
| `heldRed`, `heldBlue` | de omstreden plekken die elke kant aan het begin van de sessie in handen had, uit een gekoppeld rondebestand (hieronder) |
| `won`, `matchWon` | 1 als de kant van de rij (de Color, Red of Blue) die campagne won, 0 als hij verloor; leeg waar geen rondebestand een winnaar noemt, en op neutrale rijen. Een campagne is tegelijk de ronde en de wedstrijd, dus beide bevatten hetzelfde |
| `roundEndReason` | `capture` voor een campagne die gewonnen is door alles in te nemen |
| `won`, `matchWon` op elke sessie van een ronde | de uitslag van de ronde, op elke opname ervan geschreven zodra het einde bekend is |
| `sortie` | op de rijen van een vliegtuig: zijn vlucht, 1, 2, ... van opstijgen tot opstijgen; de tijd aan de grond vóór het eerste opstijgen en na een landing telt mee voor de vlucht waar hij bij hoort |
| `sortieResult` | hoe die vlucht eindigde: `landed`, `landed damaged` (na een treffer in de lucht), `ejected`, `shot down`, `destroyed` (aan de grond), `crashed`, `despawned` (in de lucht verdwenen zonder zichtbare oorzaak - een speler die vertrekt), `airborne at end`, `no takeoff` |
| `sortieKills` | de kills die het vliegtuig in die vlucht toegeschreven kreeg |

Op een persistente server is de vlucht de eenheid die iets betekent: filter op `sortieResult` = `shot down` om te zien waar vluchten verloren gingen, of splits de warmte uit naar `sortieResult` of `server` in de [uitsplitsing](breakdown.md). Het opstijgen, landen, de schietstoelsprongen, kills en crashes waaruit hij bestaat, zijn de gebeurtenissen die de converter afleidt uit hoe de vliegtuigen bewegen (hierboven).

Plekken die tussen twee sessies van een ronde zijn ingenomen - bekend uit het rondebestand, hieronder - zijn `capture`-gebeurtenissen aan het begin van de latere opname: `Object` `(campaign)`, op de plek, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Een vliegveld of FARP dat van kant wisselt waar de opname het laat zien - opnieuw geschreven in de andere kleur, of verwijderd en binnen vijf minuten op zijn plek opnieuw geschreven in de andere - wordt een `capture`-gebeurtenis bij het platform: `Event` = `capture`, `Airfield` de naam ervan, `Detail` `Red to Blue`, `Coalition` de nieuwe kant. Een platform dat voor het eerst in een kleur wordt geschreven, is geen verovering. De servers die tot nu toe bekeken zijn, schrijven hun platforms maar één keer, dus hun opnamen bevatten geen veroveringen.

### Rondebestanden {#rounds-files}

Een rondebestand zegt per server welke campagnerondes er waren, wie ze won en welke sessies elke ronde had. Het komt uit wat de server publiceert, of uit de opnamen zelf (hieronder).

Wie een campagne won, publiceert de server - een campagnelogboek op zijn webpagina -, het staat niet in de opname. Een rondebestand draagt het, en de converter leest het met `--rounds file.json` (je mag er meer dan één opgeven):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

Een opname hoort bij de rondes van haar `server` waarvan de `title` (een reguliere expressie) bij haar Title past; elke rij hoort bij de ronde waarin haar echte tijd valt - de RecordingTime van de opname plus de seconden van de rij, niet de datum van de missie in het spel. Tijden zijn in UTC. Een ronde zonder winnaar (doorgeschoven, loopt nog) geeft haar rijen het rondenummer en een lege uitslag.

De tegenhanger in het wedstrijddocument, de voettekst `acmi`, zegt waar de uitslag vandaan kwam, zoals `result.source` bij een War Thunder-wedstrijd: `outcome.result` is `{ winner, round, endReason, source }`, met `source` de `source` van het rondebestand, of `null` als niets een winnaar noemde. `outcome` somt ook de rondes van de opname op, haar veroveringen en haar vluchten naar hoe ze eindigden:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Een rij van een piloot `Viper 1 (F-16C_50) #a01` aan de blauwe kant in die campagne luidt dan: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Rondes uit de opnamen zelf {#rounds-from-the-recordings-themselves}

Een persistente server houdt zijn campagne vast over herstarts heen, en elke opname begint met de grondeenheden en statische objecten van beide kanten waar de campagne ze heeft achtergelaten. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` leest de eerste minuten van elke opname ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), zet de opnamen van één kaart per server op volgorde van tijd en koppelt ze aan elkaar:

- **Plekken**: de grond in cellen van ongeveer 2 km; een cel is van een kant als driekwart van de eenheden daar aan het begin van een sessie van die kant is. *Omstreden* plekken zijn plekken die in handen van beide kanten gezien zijn.
- **Veroveringen**: een plek die aan het begin van de volgende sessie in handen van de andere kant is - ingenomen tussen de missies, of tijdens de eerdere.
- **Een nieuwe ronde**: een sessie waarvan de plekken in meer dan 60 % verschillen van die van de vorige - de beginopstelling van een nieuwe ronde, geen stap van de oude. Een ronde eindigt ook als de server naar een andere kaart overgaat (de sessies daarvan beginnen na de laatste en gaan door).
- **Wie won**: bij een afgelopen ronde de kant die aan het begin van haar laatste sessie elke plek in handen had (`capture`, betrouwbaarheid hoog), anders de kant die meer omstreden plekken in handen had (gemiddeld bij twee keer zoveel als de andere, anders laag; laag als de ronde eindigde met een kaartwissel). Een open ronde heeft geen winnaar, maar elke sessie zegt hoeveel plekken elke kant aan haar begin in handen had, zodat je ziet wie voorstond.
- Een server waarvan alle sessies hetzelfde beginnen, bewaart geen toestand tussen sessies: hij wordt niet gekoppeld.

Het begin van de laatste sessie kan uren vóór het einde van de ronde liggen, daarom telt de betrouwbaarheid. Getoetst aan een server die zijn winnaars publiceert: de koppeling vond elke nieuwe ronde in de sessie waarin de gepubliceerde ronde begon, en de kant die bij het laatste begin voorstond, was de gepubliceerde winnaar in elk van de 9 rondes die ze kon toetsen. `--official file.json` houdt de gepubliceerde rondes van zo'n server en voegt de sessies van de koppeling eraan toe; de `validation` van het bestand zegt hoe ver de koppeling overeenkwam. In een verzonnen campagne:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### Een campagneronde als reeks bekijken {#watching-a-campaign-round-as-a-series}

Laad de opnamen van één ronde samen - de bestanden met dezelfde `campaign` - en de viewer speelt ze af als één reeks: sessie na sessie in hun echte volgorde, met de uren of dagen tussen twee sessies ingekort tot een pauze van één minuut. De tijdlijn markeert het begin van elke sessie in geel en de pauzes als donkere banden, en de klok zegt welke sessie speelt en wat de echte datum is (`session 4/12 · 2026-11-02 12:38 UTC`). Warmte, de replay, filters en Inzichten werken op de hele reeks zoals op alle geladen gegevens. Het onderdeel **Campagneronde** op het tabblad Match toont de sessies met hun datum, hoeveel omstreden plekken elke kant bij elk begin in handen had - ook als grafiek over de ronde - en hoeveel er daarvoor zijn ingenomen; een klik gaat naar het begin van een sessie. Een opname die alleen geladen is, zegt daar welke ronde en sessie ze is. Opnamen van verschillende rondes die samen geladen zijn, vormen geen reeks: elke begint bij nul, zoals losse wedstrijden. De lader voor veel wedstrijden (**Veel wedstrijden tegelijk**) speelt een ronde ook als reeks af, gestreamd en afgestemd op de GPU, voor rondes van vele gigabytes.

De plekken die tijdens de ronde van eigenaar wisselden, worden op de kaart getekend als veroveringszones, gekleurd naar de kant die elke plek aan het begin van de spelende sessie in handen had, en ze wisselen op de grenzen tussen sessies; elke wissel is een verovering in de gebeurtenissenlijst van de replay. Ze worden afgeleid uit de geladen rijen - de grondeenheden en statische objecten van elke sessie in haar eerste minuten, in cellen van ongeveer 2 km, zoals de koppeling doet -, dus ze hebben de volledige lader nodig (de lader voor veel wedstrijden houdt van elke rij te weinig over).

**De hele ronde laden vanuit één van haar opnamen.** In een gewone browser kan de viewer geen bestanden openen die je niet zelf hebt gekozen: laad de bestanden van de ronde samen. Als de lokale viewerserver hem aanbiedt (`npm run dev` of `npm run preview`), kan hij het wel: geef het door git genegeerde `tools/local-data.json` een `campaigns`-item dat de map met rondebestanden en de mappen met geconverteerde opnamen noemt, en het onderdeel Campagneronde van een losse opname biedt **Hele ronde laden** aan, haalt de daar gevonden sessies van de ronde op en laadt ze met de lader voor veel wedstrijden:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Alleen de opnamen die een rondebestand noemt, worden aangeboden (`tools/campaign-files.mjs`); een sessie die niet in die mappen gevonden wordt, wordt geteld, niet geladen.

Wat de bekende servers publiceren:

| Server | Een ronde | Hoe een kant wint | Waar de winnaar te lezen is |
|---|---|---|---|
| SPS Contention | een campagne op één kaart en in één tijdperk (dagen), over veel herstarts | elk vliegveld, elke FARP en elk bolwerk ingenomen; een campagne die zonder winnaar eindigde, werd doorgeschoven | het openbare campagnelogboek van de server (winnaar, begin, einde per campagne) |
| Blue Flag | een campagneronde over veel missies van 5 uur; de `_YYYY_MM` in de Title schuift per herstart één maand op | elke vijandelijke stelling ingenomen; oudere rondes riepen de kant uit die na een vaste tijd het meest in handen had | tot nu toe in geen gevonden vorm gepubliceerd; de koppeling van de opnamen volgt elke ronde en wie bij elk begin hoeveel in handen heeft |
| Growling Sidewinder | een run (6 uur) van een open-conflictmissie | zones en vliegvelden ingenomen | de statistiekpagina toont piloten, geen uitslagen; elke sessie begint hetzelfde, dus geen ronde loopt over meerdere sessies: leeg |
| Missies tegen de AI (missies om zones te veroveren) | een run van de missie | de kant van de spelers tegen de AI van de missie: geen PvP-uitslag | leeg |
| Zonder toewijzing (kop noemt geen server) | - | - | leeg, `server` ook leeg |
