---
title: "Konverterare behåller allt"
parent: "Läsa in data"
nav_order: 8
lang: "sv"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Konverterare behåller allt

Du behöver inte den här sidan för att öppna en repris. Den är till för personer som skriver verktyg som gör spelfiler till 3DHeat-tabeller, och för alla som vill veta varför de tabellerna innehåller så mycket.

Varje verktyg som gör ett spels repris, demo, logg eller livetelemetri till något som visaren öppnar följer en regel:

> **Konvertera allt som källan innehåller och som kan läsas nu, och behåll resten helt, så att det kan läsas senare utan den ursprungliga filen.**

En repris är ofta borta efter en speluppdatering, en ominstallation eller en full disk, och ett livematat flöde är borta i samma ögonblick som det skickades. Det en konverterare tappar är förlorat för alltid; det den behåller helt kan avkodas den dag någon förstår det. En konverterare avgör därför aldrig vad som blir användbart: den avkodar det den kan, behåller varje annat meddelande, paket, händelse, egenskap eller rad oförändrat bredvid tabellen, och säger i sin egen utdata hur mycket av varje den läste och hur mycket den bara behöll.

Den här sidan är konventionen som alla konverterare delar: repriskonverterarna för War Thunder, World of Tanks, World of Warships och Squad, CS2-demokonverteraren, bevakningsprogrammet i bakgrunden (dess Dota-repriksavkodare och varje livadapter), spelinspelningsverktygets telemetriläsare och visarens egna importer (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Visarens egna läsare beskrivs i [Tacview-inspelningar](tacview-acmi.md) och [Läsa in filer](loading-files.md); formen med en fil är [En fil per match](container.md). En match blir en tabell, en `match.json` och sidofiler, valfritt packade till en `.3dheat`-fil. Varje verktygs README har ett avsnitt **Fullständighet** som listar, för just den källan, vad som läses, vad som behålls rått och vad som inte finns, och varför.

## Tre hem för varje post {#three-homes-for-every-item}

Allt en källa innehåller hamnar på exakt ett av tre ställen:

| Hem | Vad som hamnar där |
|---|---|
| **Avkodat** | Tabellen (en rad per prov eller händelse, de kolumner visaren läser, extra kolumner för varje annat värde som hör till en rad) och matchdokumentet `<match>.match.json` (allt som hör till matchen som helhet: inställningar, laguppställningar, resultat, resultattavlor, självkontrollen). |
| **Behållet rått** | En sidofil bredvid tabellen: varje post som inte är avkodad, eller bara delvis avkodad, helt och oförändrad, med sin typ, tid och den enhet eller entitet den hör till. |
| **Inte tillgängligt** | Nämnt i README:ns avsnitt Fullständighet med skälet: formatet bär inte det (en klientrepris har inte de andra spelarnas indata), källan skickar det aldrig, eller det är inte tillåtet att läsa det (en skyddad process, ett krypterat block vars nyckel inte är vår att använda). |

En post som **delvis** är avkodad är både avkodad *och* behållen rått: tabellen får det som förstås, sidofilen hela posten, så att en bättre avkodare senare inte behöver den ursprungliga filen.

Det finns inget fjärde ställe. Att släppa något för att det verkade oanvändbart, för att det var en dubblett ”troligen”, eller för att det var stort, är ett fel. Gallring är tillåten bara i tabellen (en kamera på 2 Hz i stället för 60), aldrig i sidofilen.

## Sidofiler {#sidecars}

En sidofil är en Parquet-fil bredvid tabellen, namngiven efter den:

```
<mapp>/<match>.parquet              tabellen
<mapp>/<match>.match.json           matchdokumentet
<mapp>/<match>.<vad>.parquet        en sidofil
```

`<vad>` är ett ord från den här listan. En ny konverterare väljer det ord som passar, eller lägger till ett nytt här **och** i `SIDECAR_PARQUET` i
[`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts),
så att visaren utelämnar den när en hel mapp läses in.

| `<vad>` | Innehåller | Används av |
|---|---|---|
| `messages` | paket, entitetsmetodanrop och egenskapsuppdateringar i ett nätverksflöde, helt | War Thunder, World of Tanks, World of Warships |
| `flight` | flygmodellposter per flygplan, helt | War Thunder |
| `packets` | hela bildrutor och nätverksmeddelanden, eller containerdelar, utanför entitetsflödet | CS2, Dota 2, Squad |
| `events` | spelhändelser med alla sina nycklar, så som parsern ger dem | CS2 |
| `entities` | entitets- och egenskapsuppdateringar, fjärranrop, kanaler som öppnats och stängts, med de exporter en avkodare behöver | Squad, Dota 2 |
| `props` | varje entitetsegenskap parsern läser, varje gång den ändrats | CS2 |
| `units` | tillståndet per enhet utanför positionstabellen | Dota 2 |
| `combatlog` | en stridslogg, varje post med varje fält | Dota 2 |
| `strings` | varje post i varje strängtabell | CS2, Dota 2 |
| `objectives` | fångstzoner och mål, varje ändring med sin tid | War Thunder |
| `raw` | ett livflöde: varje paket, rad, API-dokument eller minnesläsning som togs emot, helt | bevakningsprogrammets sessioner (`heat.raw.parquet`), spelinspelningsverktygets varvinspelare (`<stamp>_<game>.raw.parquet`), bevakningsprogrammets repriser för osu!, LoL och Valorant |

Visarens mappinläsning hoppar över varje `*.<vad>.parquet` i listan, och
varje `*.match.json`, `*.meta.json`, `*.summary.json` och de andra JSON-sidofilerna; att öppna en av dem på egen hand, genom att välja eller släppa just den filen, läser in den som vilken annan tabell som helst (se [Läsa in filer](loading-files.md)).

Det här är filerna så som en konverterare skriver dem med `--loose`. Som standard packar War Thunder-, CS2- och Tacview-konverterarna en matchs tabell, dokument och sidofiler i en fil, `<match>.3dheat`, under samma namn (se [En fil per match](container.md)); allt här gäller för varje medlem.

### Kolumner {#columns}

Varje rad i en sidofil är en post. Kolumnerna är, i den här ordningen, de som gäller:

| Kolumn | Typ | Vad |
|---|---|---|
| `time` | float64 | sekunder på samma klocka som tabellens `time` (eller `tick` där källan räknar tickar; då båda) |
| `type` | sträng (ordbok) | vad posten är, med källans egna begrepp: en pakettyp, ett meddelande-id, ett händelsenamn, en egenskapsväg, ett radprefix |
| `name` | sträng (ordbok) | dess namn där ett är känt (ett gemenskapsnamn, ett klassnamn), annars tomt |
| `entity` / `unit` / `uid` / `player` | heltal eller sträng | vem den hör till, med samma id:n som i tabellen, så att en rad i sidofilen kan kopplas till en bana |
| `decoded` | sträng (JSON) | det som förstås av den, där något förstås; annars tomt |
| `payload` | binär | postens bytes, hela och oförändrade (binära källor) |
| `text` | sträng | postens text, hel och oförändrad (textkällor: en loggrad, ett JSON-objekt, ett nyckel-värde-block) |

Fler kolumner är tillåtna (en bitförskjutning, en storlek, en kanal). Strängar som upprepas är ordbokskodade och filen skrivs med zstd, så att en sidofil förblir en bråkdel av repriens egen storlek.

En sidofil måste räcka till på egen hand: en avkodare som skrivs senare läser sidofilen, aldrig den ursprungliga repriset. Där en post inte kan förstås utan sammanhang (en entitets klass, en strängtabell, en nyckel som ett meddelande hänvisar till), läggs sammanhanget med i sidofilen också, eller i matchdokumentet.

### Livekällor {#live-sources}

Livadaptrar (UDP-telemetri, delat minne, en spelloggfil, ett lokalt API) har ingen fil att gå tillbaka till alls. De spelar in **varje fält källan skickar**, även de som ingenting använder ännu:

- ett paketflöde: varje paket helt, `payload` är bytesen, `type` dess paket-id eller format, i den takt det kommer;
- delat minne eller ett avfrågat API: varje fält i varje läsning, antingen som namngivna kolumner eller hela blocket som `payload`, i den takt adaptern läser;
- en logg: varje rad, `text` är raden, `type` är radens slag, även rader som adaptern inte agerar på.

Dessa hamnar i `<session>.raw.parquet` bredvid sessionens tabell. Storleken är priset för regeln; den hålls nere med zstd och ordboksinkodning, inte genom att utelämna saker.

## Självkontrollen {#the-self-check}

Varje konverterare skriver, i sitt matchdokument (eller sessionens `meta.json`, eller en sammanfattning där det inte finns något matchdokument), ett block `completeness` under `selfCheck`:

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

| Fält | Betydelse |
|---|---|
| `seen` | hur många poster av den här typen källan innehåller |
| `decoded` | lästa helt in i tabellen eller matchdokumentet |
| `partial` | lästa delvis in i tabellen eller dokumentet, och behållna hela i en sidofil |
| `raw` | behållna hela endast i en sidofil, inte avkodade |
| `lost` | `seen - decoded - partial - raw`: måste vara 0 |

Den översta `lost` är summan. En konverterares tester kräver att den är 0 på dess syntetiska prov, och README:n säger vad den var på verkliga. En `lost` som inte är noll är konverteraren som säger att den bröt regeln; den nämner typen, så att luckan kan hittas.

”Typerna” är källans egna: paket-typer, meddelande-id:n, händelsenamn, egenskapsgrupper, radslag. De räknas där konverteraren träffar på dem, inte från en lista över vad den väntar sig, så att en typ som ingen kände till visas med sin räkning i stället för att försvinna.

## README:ns avsnitt Fullständighet {#the-readmes-completeness-section}

Varje konverterares README har ett avsnitt med rubriken **Fullständighet**, med tre listor:

- **Läst**: vad som går in i tabellen och matchdokumentet, och hur varje nytt fält kontrollerades mot något oberoende (spelets egna tal, en andra källa, en inspelning gjord för ändamålet).
- **Behållet rått**: vad som finns i vilken sidofil, under vilken `type`, och vad som är känt om det hittills.
- **Inte tillgängligt**: vad källan inte bär eller inte får läsas, och varför.

Det länkar tillbaka hit.

## Var varje konverterare står {#where-each-converter-stands}

| Konverterare | Sidofiler | Dess avsnitt Fullständighet |
|---|---|---|
| War Thunder-repriser | `messages`, `flight` | [3DHeat-Ext-WarThunder README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (dess självkontrollsräkningar finns under `counts`; blocket `completeness` kommer senare) |
| World of Tanks-repriser | `messages` | [3DHeat-Ext-WoT README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World of Warships-repriser | `messages` | [3DHeat-Ext-WoWs README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squads serverdemon | `entities`, `packets` | [3DHeat-Ext-Squad README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2-demon | `events`, `props`, `strings`, `packets` | [3DHeat-CS2 README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota 2-repriser (bevakningsprogrammet) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota 2-repriser](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!-, LoL- och Valorant-repriser (bevakningsprogrammet) | `raw` | deras sidor i [bevakningsprogrammets dokumentation](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Livadaptrar (bevakningsprogrammet) | `raw` | varje spels sida i [bevakningsprogrammets dokumentation](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), och [utveckling](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) för `Session.raw` |
| Varvinspelare (spelinspelning) | `raw`, och `unparsed`-bytes inuti en Forza-varvfil | [3DHeat-GameCapture README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Visarens egna importer | ingen: se nedan | den här sidan |

### Visarens egna importer {#the-viewers-own-imports}

Tacview ACMI, OCAP och GPS-formaten läses i webbläsaren från användarens egen fil; visaren sparar inget av dem, så filen själv förblir protokollet. De läser ändå så mycket de kan:

- **Tacview ACMI** (`src/data/acmi.ts`): varje objektrad med en position är en rad med varje egenskap inspelningen bär, varje händelse en rad, varje borttagning en rad, inspelningens egna egenskaper (med headerns FileType och FileVersion) på varje rad som `RecordingInfo`; en kommentarsrad är en händelse `Comment`, ett objekt som aldrig får en position blir en rad `Unplaced` vid referenspunkten, och U/V är kolumner närhelst någon rad har dem. En egenskapsrad utan position läses delvis: dess värden når objektets nästa rad, inte vid sin egen tid. `AcmiTable.completeness` räknar filens rader efter slag.
- **OCAP** (`src/data/ocap.ts`): varje entitets bildrutor, skott, markörer, varje händelsesort (okända sorter som rader under ”Mission” med sin text) och dokumentets egna fält (`Info`). Ännu inte läst: entitetsfält och efterföljande positionselement utöver dem som listas i dess header (en nyare inspelares tillägg), och en död enhets upprepade bildrutor efter dess död (gallrade med avsikt: inget ändras i dem).
- **GPS-format** (`src/data/geoTracks.ts`): fixarna, deras tid, höjd, kurs och fart, och pulsfrekvens, kadens, effekt, temperatur, satelliter, HDOP och tryckhöjd där filen loggar dem. Ännu inte läst: andra GPX- och KML-tillägg, NMEA-meningar utöver positionsmeningarna, IGC-poster utöver fixar och deras tillägg, och FIT-meddelanden utöver poster (varv, pass, enhetsinformation).

Dessa luckor listas för att de ska täppas till, inte för att ursäkta dem; visarens export av en inläst inspelning (`src/data/exportRecording.ts`) skriver bara det som lästes.

## Lägga till en konverterare {#adding-a-converter}

1. Lista vad formatet innehåller, från dess dokumentation, dess egna strukturer, eller genom att räkna varje meddelandetyp i verkliga prov. Listan är självkontrollens `types`.
2. Avkoda det som kan kontrolleras nu. Varje nytt fält kontrolleras mot något oberoende innan det går in i tabellen; ett fält som inte kan kontrolleras än förblir rått.
3. Behåll resten helt i en sidofil med namn enligt ovan, med kolumnerna ovan.
4. Skriv blocket `completeness` och ett test som visar att `lost` är 0.
5. Skriv README:ns avsnitt Fullständighet och länka hit.
6. Om sidofilens `<vad>` är nytt, lägg till det i tabellen ovan och i `SIDECAR_PARQUET` i `src/data/filePick.ts`.

Konverterare är ren-rums-implementationer: de skrivs utifrån format, dokumentation och prov, aldrig från GPL- eller AGPL-kod. Prov av verkliga repriser stannar på den dator som gjorde dem; tester använder syntetiska filer.
