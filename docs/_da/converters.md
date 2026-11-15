---
title: "Konvertere beholder alt"
parent: "Indlæs data"
nav_order: 8
lang: "da"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Konvertere beholder alt

Du behøver ikke denne side for at åbne et replay. Den er for folk, der skriver værktøjer, der laver spilfiler om til 3DHeat-tabeller, og for alle, der vil vide, hvorfor de tabeller holder så meget.

Hvert værktøj, der laver et spils replay, en demo, en log eller live-telemetri om til
noget, fremviseren kan åbne, følger én regel:

> **Konverter alt, kilden holder, som kan læses nu, og behold resten helt, så det kan læses senere uden den originale fil.**

Et replay er ofte væk efter en spilopdatering, en geninstallation eller en fuld disk, og en live-strøm er væk i samme øjeblik, den er sendt. Det en konverter smider væk, er tabt for altid; det den beholder helt, kan afkodes den dag, nogen forstår det. Så en konverter afgør aldrig, hvad der bliver nyttigt: den afkoder det, den kan, beholder hver anden besked, pakke, hændelse, egenskab eller linje uændret ved siden af tabellen, og den siger i sit eget output, hvor meget af hver den læste, og hvor meget den kun beholdt.

Denne side er den konvention, alle konvertere deler: replay-konverterne til War Thunder, World of Tanks, World of Warships og Squad, CS2-demokonverteren, baggrundsovervågeren (dens Dota-replay-afkoder og alle live-adaptere), spilfangst-værktøjets telemetrilæsere og fremviserens egne importer (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Fremviserens egne læsere er beskrevet i [Tacview-optagelser](tacview-acmi.md) og [Indlæsning af filer](loading-files.md); enfilsformen er [Én fil pr. kamp](container.md). Én kamp bliver til en tabel, en `match.json` og sidecars, eventuelt pakket i én `.3dheat`-fil. Hvert værktøjs README har et afsnit **Fuldstændighed**, der for den kilde lister, hvad der læses, hvad der beholdes råt, og hvad der ikke er tilgængeligt, og hvorfor.

## Tre hjem for hvert element {#three-homes-for-every-item}

Alt, en kilde holder, ender på præcis et af tre steder:

| Hjem | Hvad der hører hjemme der |
|---|---|
| **Afkodet** | Tabellen (én række pr. prøve eller hændelse, de kolonner fremviseren læser, ekstra kolonner for hver anden værdi, der hører til en række) og kampdokumentet `<match>.match.json` (alt, der hører til kampen som helhed: indstillinger, opstillinger, resultater, resultattavler, selvkontrollen). |
| **Beholdt råt** | En sidecar ved siden af tabellen: hvert element, der ikke er afkodet, eller kun delvist afkodet, helt og uændret, med sin type, tid og den enhed eller entitet, det hører til. |
| **Ikke tilgængelig** | Nævnt i README'ens afsnit Fuldstændighed med grunden: formatet bærer det ikke (et klient-replay har ikke de andre spilleres input), kilden sender det aldrig, eller det må ikke læses (en beskyttet proces, en krypteret blok, hvis nøgle ikke er vores at bruge). |

Et element, der er **delvist** afkodet, er afkodet *og* beholdt råt: tabellen får det,
der forstås, sidecaren hele elementet, så en bedre afkoder senere ikke har brug for
den originale fil.

Der er ikke et fjerde sted. At smide noget væk, fordi det virkede ubrugeligt,
fordi det var en dublet "sandsynligvis", eller fordi det var stort, er en fejl.
Udtynding er kun tilladt i tabellen (et kamera på 2 Hz i stedet for 60), aldrig i
sidecaren.

## Sidecars {#sidecars}

En sidecar er en Parquet-fil ved siden af tabellen, navngivet efter den:

```
<mappe>/<kamp>.parquet              tabellen
<mappe>/<kamp>.match.json           kampdokumentet
<mappe>/<kamp>.<hvad>.parquet       en sidecar
```

`<hvad>` er ét ord fra denne liste. En ny konverter vælger det ord, der passer,
eller tilføjer et nyt ord her **og** i `SIDECAR_PARQUET` i
[`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts),
så fremviseren springer den over, når en hel mappe indlæses.

| `<hvad>` | Indeholder | Bruges af |
|---|---|---|
| `messages` | pakker, entitetsmetodekald og egenskabsopdateringer fra en netværksstrøm, hele | War Thunder, World of Tanks, World of Warships |
| `flight` | poster for hvert flys flyvemodel, hele | War Thunder |
| `packets` | hele billeder og netværksbeskeder, eller containerblokke, uden for entitetsstrømmen | CS2, Dota 2, Squad |
| `events` | spilhændelser med alle deres nøgler, som parseren giver dem | CS2 |
| `entities` | entitets- og egenskabsopdateringer, fjernkald, kanaler åbnet og lukket, med de eksporter en afkoder har brug for | Squad, Dota 2 |
| `props` | hver entitetsegenskab, parseren læser, hver gang den ændrede sig | CS2 |
| `units` | tilstand pr. enhed uden for positionstabellen | Dota 2 |
| `combatlog` | en kamplog, hver post med hvert felt | Dota 2 |
| `strings` | hver post i hver strengtabel | CS2, Dota 2 |
| `objectives` | erobringszoner og mål, hver ændring med sit tidspunkt | War Thunder |
| `raw` | en live-strøm: hver pakke, linje, API-dokument eller hukommelseslæsning, der er modtaget, hel | watcherens sessioner (`heat.raw.parquet`), spilfangst-værktøjets lap-optagere (`<stempel>_<spil>.raw.parquet`), watcherens osu!-, LoL- og Valorant-replayfiler |

Fremviserens mappeindlæsning springer hver `*.<hvad>.parquet` på denne liste over,
og hver `*.match.json`, `*.meta.json`, `*.summary.json` og de andre JSON-sidecars; åbner man en af
dem alene, ved at vælge eller slippe netop den fil, indlæses den som enhver anden
tabel (se [Indlæsning af filer](loading-files.md)).

Det er filerne, som en konverter skriver dem med `--loose`. Som standard pakker War Thunder-,
CS2- og Tacview-konverterne en kamps tabel, dokument og sidecars i én fil,
`<kamp>.3dheat`, under de samme navne (se [Én fil pr. kamp](container.md));
alt her gælder for hvert medlem.

### Kolonner {#columns}

Hver sidecar-række er ét element. Kolonnerne er, i denne rækkefølge, dem der
gælder:

| Kolonne | Type | Hvad |
|---|---|---|
| `time` | float64 | sekunder på samme ur som tabellens `time` (eller `tick`, hvor kilden tæller ticks; så begge) |
| `type` | string (ordbog) | hvad elementet er, i kildens egne termer: en pakketype, besked-id, hændelsesnavn, egenskabssti, linjeprefiks |
| `name` | string (ordbog) | dets navn, hvor et er kendt (et fællesskabsnavn, et klassenavn), ellers tomt |
| `entity` / `unit` / `uid` / `player` | heltal eller tekst | hvem det hører til, med de samme id'er som i tabellen, så en sidecar-række kan forbindes til et spor |
| `decoded` | string (JSON) | hvad der forstås af det, hvor der er noget; ellers tomt |
| `payload` | binær | elementets bytes, hele og uændrede (binære kilder) |
| `text` | string | elementets tekst, hel og uændret (tekstkilder: en logglinje, et JSON-objekt, en nøgle-værdi-blok) |

Yderligere kolonner er tilladt (en bitforskydning, en størrelse, en kanal). Gentagne strenge
er ordbogskodet, og filen skrives med zstd, så en sidecar forbliver en brøkdel af
replayets egen størrelse.

En sidecar skal kunne klare sig alene: en afkoder skrevet senere læser sidecaren,
aldrig det originale replay. Hvor et element ikke kan forstås uden kontekst (en entitets
klasse, en strengtabel, en nøgle en besked henviser til), kommer konteksten også i
sidecaren eller i kampdokumentet.

### Live-kilder {#live-sources}

Live-adaptere (UDP-telemetri, delt hukommelse, et spils log, et lokalt API) har
slet ingen fil at gå tilbage til. De optager **hvert felt, kilden sender**,
også dem intet bruger endnu:

- en pakkestrøm: hver pakke hel, `payload` er bytes, `type` dens pakke-id eller format, med den hastighed den kommer i;
- delt hukommelse eller et API, der bliver spurgt: hvert felt i hver læsning, enten som navngivne kolonner eller hele blokken som `payload`, med den hastighed adapteren læser;
- en log: hver linje, `text` er linjen, `type` linjens slags, herunder linjer adapteren ikke handler på.

Disse går i `<session>.raw.parquet` ved siden af sessionens tabel. Størrelsen er prisen for
reglen; den holdes nede af zstd og ordbogskodning, ikke ved at udelade ting.

## Selvkontrollen {#the-self-check}

Hver konverter skriver, i sit kampdokument (eller sessionens
`meta.json`, eller et resumé, hvor den ikke har et kampdokument), et
blok `completeness` under `selfCheck`:

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

| Felt | Betydning |
|---|---|
| `seen` | hvor mange elementer af denne type kilden holder |
| `decoded` | læst helt ind i tabellen eller kampdokumentet |
| `partial` | læst delvist ind i tabellen eller dokumentet, og beholdt helt i en sidecar |
| `raw` | beholdt helt i en sidecar alene, ikke afkodet |
| `lost` | `seen - decoded - partial - raw`: skal være 0 |

Det øverste `lost` er summen. En konverters tests kræver, at det er 0 på dens syntetiske
prøver, og README'en siger, hvad det var på rigtige. En `lost` forskellig fra nul er
konverteren, der siger, at den brød reglen; den navngiver typen, så hullet kan findes.

"Typerne" er kildens egne: pakketyper, besked-id'er, hændelsesnavne, egenskabsgrupper,
linjeslags. De tælles der, hvor konverteren møder dem, ikke ud fra en liste over, hvad den
forventer, så en type ingen kendte til viser sig med sit antal i stedet for at forsvinde.

## README'ens afsnit Fuldstændighed {#the-readmes-completeness-section}

Hver konverters README har et afsnit med overskriften **Fuldstændighed** med tre lister:

- **Læst**: hvad der går ind i tabellen og kampdokumentet, og hvordan hvert nyt felt blev kontrolleret mod noget uafhængigt (spillets egne tal, en anden kilde, en optagelse lavet til formålet).
- **Beholdt råt**: hvad der er i hvilken sidecar, under hvilken `type`, og hvad der er kendt om det indtil nu.
- **Ikke tilgængelig**: hvad kilden ikke bærer, eller ikke må læses, og hvorfor.

Det linker tilbage hertil.

## Hvor hver konverter står {#where-each-converter-stands}

| Konverter | Sidecars | Dens afsnit Fuldstændighed |
|---|---|---|
| War Thunder-replays | `messages`, `flight` | [3DHeat-Ext-WarThunder README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (dens selvkontroltal står under `counts`; blokken `completeness` kommer senere) |
| World of Tanks-replays | `messages` | [3DHeat-Ext-WoT README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World of Warships-replays | `messages` | [3DHeat-Ext-WoWs README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squad-serverdemoer | `entities`, `packets` | [3DHeat-Ext-Squad README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2-demoer | `events`, `props`, `strings`, `packets` | [3DHeat-CS2 README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota 2-replays (watcher) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota 2-replays](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!-, LoL- og Valorant-replays (watcher) | `raw` | deres sider i [watcherens dokumentation](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Live-adaptere (watcher) | `raw` | hvert spils side i [watcherens dokumentation](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), og [udvikling](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) for `Session.raw` |
| Lap-optagere (spilfangst) | `raw`, og `unparsed`-bytes inde i en Forza lap-fil | [3DHeat-GameCapture README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Fremviserens egne importer | ingen: se nedenfor | denne side |

### Fremviserens egne importer {#the-viewers-own-imports}

Tacview ACMI, OCAP og GPS-formaterne læses i browseren fra brugerens egen fil; fremviseren gemmer intet af dem, så filen selv forbliver optagelsen. De læser stadig så meget, de kan:

- **Tacview ACMI** (`src/data/acmi.ts`): hver objektlinje med en position er en række med hver egenskab, optagelsen bærer, hver hændelse er en række, hver fjernelse er en række, optagelsens egne egenskaber (med headerens FileType og FileVersion) står på hver række som `RecordingInfo`; en kommentarlinje er en hændelse `Comment`, et objekt, der aldrig får en position, er en række `Unplaced` ved referencepunktet, og U/V er kolonner, når en række har dem. En egenskabslinje uden position læses delvist: dens værdier når objektets næste række, ikke på deres eget tidspunkt. `AcmiTable.completeness` tæller filens linjer efter slags.
- **OCAP** (`src/data/ocap.ts`): hver enheds billeder, skud, markører, hver hændelsesslags (ukendte slags som rækker under "Mission" med deres tekst) og dokumentets egne felter (`Info`). Ikke læst endnu: enhedsfelter og efterfølgende positionselementer ud over dem, der står i dens header (en nyere optagers tilføjelser), og en død enheds gentagne billeder efter dens død (udtyndet med vilje: intet ændrer sig i dem).
- **GPS-formater** (`src/data/geoTracks.ts`): fixene, deres tid, højde, kurs og fart, og puls, kadence, effekt, temperatur, satellitter, HDOP og trykhøjde, hvor filen logger dem. Ikke læst endnu: andre GPX- og KML-udvidelser, NMEA-sætninger ud over positionssætningerne, IGC-poster ud over fixene og deres udvidelser, og FIT-beskeder ud over poster (omgange, sessioner, enhedsoplysninger).

Disse huller er listet, så de bliver lukket, ikke for at undskylde dem; fremviserens eksporter af en indlæst optagelse (`src/data/exportRecording.ts`) skriver kun det, der blev læst.

## Tilføj en konverter {#adding-a-converter}

1. List, hvad formatet holder, ud fra dets dokumentation, dets egne strukturer, eller ved at tælle hver beskedtype i rigtige prøver. Listen er selvkontrollens `types`.
2. Afkod det, der kan kontrolleres nu. Hvert nyt felt kontrolleres mod noget uafhængigt, før det går ind i tabellen; et felt, der ikke kan kontrolleres endnu, forbliver råt.
3. Behold resten helt i en sidecar, navngivet som ovenfor, med kolonnerne ovenfor.
4. Skriv blokken `completeness` og en test, at den har `lost` 0.
5. Skriv README'ens afsnit Fuldstændighed og link hertil.
6. Hvis sidecarens `<hvad>` er nyt, tilføj det til tabellen ovenfor og til `SIDECAR_PARQUET` i `src/data/filePick.ts`.

Konvertere er clean-room: de skrives ud fra formater, dokumentation og prøver, aldrig ud fra GPL- eller AGPL-kode. Prøver af rigtige replays bliver på den maskine, der lavede dem; tests bruger syntetiske filer.
