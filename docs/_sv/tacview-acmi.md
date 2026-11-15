---
title: "Tacview-inspelningar (ACMI)"
parent: "Läsa in data"
nav_order: 7
lang: "sv"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Tacview-inspelningar (ACMI)

Tacview är ett program som spelar in flygningar i flygsimulatorer. Dess filer slutar på `.acmi`. 3DHeat öppnar dem så att du kan se var varje flygplan flög.

Tacview-inspelningar läses in som vilken tabell som helst: välj eller släpp en `.acmi` (text, `.txt.acmi`, eller zippad, `.zip.acmi`) och tryck på **Läs in**. Du får då värmen från alla flygningar, och på fliken **Match** en uppspelning med figurer, spår och en händelselista ([Matchrepris](match-replay.md)). ACMI är Tacviews öppna filformat ([dokumentation](https://www.tacview.net/documentation/acmi/)). DCS (via Tacviews exportör), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS och andra skriver det, så den här läser vilken av dem som helst.

## Vad en inspelning blir {#what-a-recording-becomes}

En rad varje gång ett objekts position skrivs. En rad per händelse vid objektets plats. Och en rad när ett objekt lämnar (`Removed`, där det senast var). En händelse som inte hör till något objekt som setts ännu, som ett bokmärke eller ett meddelande till alla, blir en rad för objektet `(recording)` vid referenspunkten. Inspelningen bär sina egna läsanvisningar, så kartläggningssteget fyller i sig självt. Läsaren skriver dessa kolumner: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, och sedan eventuella andra egenskaper som inspelningen har. Deras roller:

| Kolumn | Roll | Betydelse |
|---|---|---|
| Time | tid | Sekunder efter inspelningens ReferenceTime. Unix-sekunder när den har en, så att klockan visar riktig tid. |
| X, Y | position | Öst och norr, i meter, på ett plan som tangerar jorden vid inspelningens referenspunkt. Avstånd och bäringar är sanna nära den och avviker med under en tusendel vid 100 km. Norr blir världens -Z. |
| Altitude | position (upp) | Meter. |
| Object | person | Piloten och objektets namn med dess id, till exempel `Viper 1 (F-16C_50) #a01`. Ett obemannat objekt får till exempel `(T-90A) #401`. |
| Coalition | lag | Sidan (eller färgen, när det inte finns någon koalition). |
| Heading, Pitch | blick | Grader. Kurs 0 är norr. |
| Recording | session | Inspelningens Title, eller filnamnet. Flera inspelningar läses in sida vid sida utan att deras spår förenas. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filter | Behålls för filtrering. Type och Name väljer varje objekts [figur](figures.md), Event matar debriefens händelselista, och Roll lutar flygplanet. |
| U, V | | Spelets egna platta världsmeter, när varje prov har dem. DCS skriver dem. |
| EventObjects | filter | Varje objekt som en händelse nämner (`Message|a01|b02|...`), med id. |
| RecordingInfo | | Inspelningens egna egenskaper så som de var vid det ögonblicket (DataSource, DataRecorder, Author, Category, Briefing, Comments, ...), som JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filter | Andra numeriska egenskaper som inspelningen bär. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filter | Andra textegenskaper som inspelningen bär. En egenskap vars värde inte är ett tal är text. |

Alla fyra formerna av Tacviews position (`lon|lat|alt`, med `u|v`, med `roll|pitch|yaw`, och med alla dem plus en kurs) läses. Tomma fält behåller det senaste värdet. `-id` tar bort ett objekt, och ett id som används igen efter det är ett nytt objekt. Escapade kommatecken och fortsatta rader hanteras.

Positionerna projiceras alltid från latitud och longitud, aldrig från U/V. Därför delar inspelningar från alla spel en projektion, med en bakgrund av den verkliga världen.

## DCS-servrar: vem som vann, och hur varje flygning slutade {#dcs-servers-who-won-and-how-each-sortie-ended}

En DCS-flerspelarserver spelar in sina uppdrag med Tacview dygnet runt, och en beständig PvP-server driver en kampanj över många av dem: en sida vinner genom att ta alla den andra sidans flygfält, FARP:ar och zoner, vilket tar dagar och många omstarter av uppdraget. Inspelningarna innehåller flygningarna, inte kampanjen: inget meddelande säger vem som tog vad, flygfälten skrivs en gång vid starten, och inget säger vem som vann. Tacview-konverteraren (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) lägger till det som går att veta på varje rad och lämnar tomt det som inte går - den gissar aldrig.

| Kolumn | Betydelse |
|---|---|
| `server` | servern eller kampanjen, från inspelningens header (dess Title, Author och Comments nämner de kända offentliga servrarna - Blue Flag, SPS Contention, Growling Sidewinder; annars en Author som nämner någon); `--server Name` namnger den för en hel mapp. En inspelning vars header inte nämner någon server - en Author som `Admin`, en Title och Comments som ingen känd server skriver - förblir utan tillhörighet: `server` tom, även när den laddades ner från en servers inspelningssida, eftersom sidan kan innehålla andra gemenskapers uppdrag också |
| `mission` | inspelningens Title utan version eller kampanjmånad: `Operation_Example_V7.7.99` blir `Operation Example` |
| `campaign` | den kampanjrunda som inspelningen hör till, efter server, karta och nummer: `Example Server North 3`. En inspelning är en session (från omstart till omstart); en runda pågår över många sessioner, dagar eller veckor |
| `round` | rundans nummer: serverns eget där den publicerar ett, annars den n:te rundan som setts från den servern och kartan; från en rundfil (nedan), tom utan en |
| `session` | inspelningens plats bland rundans sessioner, 1, 2, ...; `sessionStart` dess verkliga start (Unix-sekunder) |
| `heldRed`, `heldBlue` | de omstridda platser som varje sida höll vid sessionens start, från en kedjad rundfil (nedan) |
| `won`, `matchWon` | 1 när radens sida (dess Color, Red eller Blue) vann kampanjen, 0 när den förlorade; tom där ingen rundfil nämner en vinnare, och på neutrala rader. En kampanj är rundan och matchen på en gång, så båda har samma värde |
| `roundEndReason` | `capture` för en kampanj som vanns genom att ta allt |
| `won`, `matchWon` på varje session i en runda | rundans resultat, skrivet på varje inspelning av den när dess slut är känt |
| `sortie` | på ett flygplans rader: dess flygning, 1, 2, ... från start till start; tiden på marken före den första starten och efter en landning räknas till den flygning den hör till |
| `sortieResult` | hur flygningen slutade: `landed`, `landed damaged` (efter en träff i luften), `ejected`, `shot down`, `destroyed` (på marken), `crashed`, `despawned` (borta i luften utan synlig orsak - en spelare som lämnar), `airborne at end`, `no takeoff` |
| `sortieKills` | de nedskjutningar som flygplanet fick tillgodo under den flygningen |

På en beständig server är flygningen den enhet som betyder något: filtrera på `sortieResult` = `shot down` för att se var flygningar gick förlorade, eller dela upp värmen efter `sortieResult` eller `server` i [uppdelningen](breakdown.md). Starterna, landningarna, utskjutningarna, nedskjutningarna och haverierna som den består av är de händelser som konverteraren räknar ut från hur flygplanen rör sig (ovan).

Platser som togs mellan två sessioner i en runda - kända från rundfilen, nedan - är `capture`-händelser vid starten av den senare inspelningen: `Object` `(campaign)`, vid platsen, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Ett flygfält eller en FARP som byter sida där inspelningen visar det - skrivet igen i den andra färgen, eller borttaget och skrivet igen på sin plats i den andra inom fem minuter - blir en `capture`-händelse vid platsen: `Event` = `capture`, `Airfield` dess namn, `Detail` `Red to Blue`, `Coalition` dess nya sida. En plats som först skrivs i en färg är ingen erövring. De servrar som har undersökts hittills skriver sina platser en gång, så deras inspelningar innehåller inga erövringar.

### Rundfiler {#rounds-files}

En rundfil anger för varje server dess kampanjrundor, vem som vann dem och varje rundas sessioner. Den kommer från det som servern publicerar, eller från inspelningarna själva (nedan).

Vem som vann en kampanj är det som servern publicerar - en kampanjlogg på dess webbsida - inte något i inspelningen. En rundfil bär det, och konverteraren läser den med `--rounds file.json` (fler än en kan anges):

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

En inspelning hör till de rundor under dess `server` vars `title` (ett reguljärt uttryck) matchar dess Title; varje rad till den runda som dess verkliga tid faller i - inspelningens RecordingTime plus radens sekunder, inte uppdragets datum i spelet. Tider är i UTC. En runda utan vinnare (roterad, pågår fortfarande) ger sina rader rundnumret och ett tomt resultat.

Matchdokumentets motsvarighet, `acmi`-sidfoten, säger var resultatet kom ifrån, som en War Thunder-matchs `result.source` gör: `outcome.result` är `{ winner, round, endReason, source }`, `source` rundfilens `source`, eller `null` när inget nämnde en vinnare. `outcome` listar också inspelningens rundor, dess erövringar och dess flygningar efter hur de slutade:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

En rad för en pilot `Viper 1 (F-16C_50) #a01` på Blue-sidan i den kampanjen lyder då: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Rundor från inspelningarna själva {#rounds-from-the-recordings-themselves}

En beständig server behåller sin kampanj över omstarter, och varje inspelning börjar med båda sidornas markenheter och statiska objekt där kampanjen lämnade dem. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` läser de första minuterna av varje inspelning ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), ställer varje servers inspelningar av en karta i tidsordning och kedjar ihop dem:

- **Platser**: marken i celler på ungefär 2 km; en cell tillhör en sida när tre fjärdedelar av enheterna där vid en sessions start är dess. *Omstridda* platser är de som setts hållas av båda sidor.
- **Erövringar**: en plats som den andra sidan håller vid nästa sessions start - tagen mellan uppdragen eller under det tidigare.
- **En ny runda**: en session vars platser skiljer sig från den förras i mer än 60 % av dem - startuppställningen för en ny runda, inte ett steg i den gamla. En runda slutar också när servern byter till en annan karta (dess sessioner börjar efter den sista och fortsätter).
- **Vem som vann**: i en runda som slutade, den sida som höll alla platser vid starten av dess sista session (`capture`, hög säkerhet), annars den sida som höll flest av de omstridda platserna (medel vid dubbelt så många som den andra, annars låg; låg när den slutade med ett kartbyte). En öppen runda har ingen vinnare, men varje session säger hur många platser varje sida höll vid dess start, så det syns vem som låg före.
- En server vars sessioner alla börjar likadant sparar inget tillstånd mellan dem: den kedjas inte.

Den sista sessionens start kan ligga timmar före rundans slut, så säkerheten spelar roll. Kontrollerat mot en server som publicerar sina vinnare: kedjan hittade varje ny runda vid den session där den publicerade rundan började, och den sida som låg före vid den sista starten var den publicerade vinnaren i var och en av de 9 rundor den kunde kontrollera. `--official file.json` behåller en sådan servers publicerade rundor och lägger till kedjans sessioner i dem; filens `validation` säger hur långt kedjan stämde överens. I en påhittad kampanj:

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

### Titta på en kampanjrunda som en serie {#watching-a-campaign-round-as-a-series}

Läs in inspelningarna från en runda tillsammans - filerna med samma `campaign` - så spelar visaren upp dem som en serie: session efter session i deras verkliga ordning, med timmarna eller dagarna mellan två nedkortade till en paus på en minut. Tidslinjen markerar varje sessions start i gult och pauserna som mörka band, och klockan säger vilken session som spelas och dess verkliga datum (`session 4/12 · 2026-11-02 12:38 UTC`). Värme, uppspelningen, filter och Insikter fungerar på hela serien som på alla inlästa data. Avsnittet **Kampanjrunda** på fliken Match listar sessionerna med deras datum, hur många omstridda platser varje sida höll vid varje start - också som ett diagram över rundan - och hur många som togs före den; ett klick går till en sessions start. En inspelning som läses in ensam säger där vilken runda och session den är. Inspelningar från olika rundor som läses in tillsammans är ingen serie: var och en börjar på noll, som separata matcher gör. Inläsaren för många matcher (**Många matcher på en gång**) spelar också upp en runda som en serie, strömmad och anpassad till GPU:n, för rundor på många gigabyte.

De platser som bytte ägare under rundan ritas på kartan som erövringszoner, färgade efter den sida som höll var och en vid starten av den session som spelas, och de byter vid sessionsgränserna; varje byte är en erövring i uppspelningens händelselista. De räknas ut från de inlästa raderna - varje sessions markenheter och statiska objekt under dess första minuter, i celler på ungefär 2 km, som kedjan gör - så de kräver den fullständiga inläsaren (inläsaren för många matcher behåller för lite av varje rad).

**Läsa in hela rundan från en av dess inspelningar.** I en vanlig webbläsare kan visaren inte öppna filer som du inte har valt: läs in rundans filer tillsammans. När den körs från den lokala visarservern (`npm run dev` eller `npm run preview`) kan den det: ge den git-ignorerade `tools/local-data.json` en `campaigns`-post som nämner mappen med rundfiler och mapparna med konverterade inspelningar, så erbjuder avsnittet Kampanjrunda för en enskild inspelning **Läs in hela rundan**, hämtar de av rundans sessioner som finns där och läser in dem med inläsaren för många matcher:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Bara de inspelningar som en rundfil nämner levereras (`tools/campaign-files.mjs`); en session som inte finns under de mapparna räknas, men läses inte in.

Vad de kända servrarna publicerar:

| Server | En runda | Hur en sida vinner | Var vinnaren kan läsas |
|---|---|---|---|
| SPS Contention | en kampanj på en karta och en era (dagar), över många omstarter | alla flygfält, FARP:ar och fästen tagna; en kampanj som slutade utan vinnare roterades | serverns offentliga kampanjlogg (vinnare, start, slut för varje kampanj) |
| Blue Flag | en kampanjrunda över många uppdrag på 5 timmar; `_YYYY_MM` i Title går fram en månad per omstart | alla fientliga positioner tagna; äldre rundor utsåg den sida som höll mest efter en fast tid | inte publicerat i en form som hittats hittills; kedjan av inspelningarna följer varje runda och vem som håller hur mycket vid varje start |
| Growling Sidewinder | en körning (6 timmar) av ett uppdrag med öppen konflikt | zoner och flygfält tagna | dess statistiksida visar piloter, inte resultat; varje session börjar likadant, så ingen runda sträcker sig över flera sessioner: tom |
| Uppdrag mot AI:n (uppdrag där zoner ska erövras) | en körning av ett uppdrag | spelarnas sida mot uppdragets AI: inget PvP-resultat | tom |
| Utan tillhörighet (headern nämner ingen server) | - | - | tom, `server` också tom |
