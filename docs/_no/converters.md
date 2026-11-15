---
title: "Konvertere tar med alt"
parent: "Få inn data"
nav_order: 8
lang: "no"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Konvertere tar med alt

Du trenger ikke denne siden for å åpne en reprise. Den er for folk som skriver verktøy som gjør spillfiler om til 3DHeat-tabeller, og for alle som vil vite hvorfor disse tabellene holder så mye.

Hvert verktøy som gjør en spills reprise, demo, logg eller live-telemetri om
til noe visningsprogrammet åpner, følger én regel:

> **Konverter alt kilden holder som kan leses nå, og behold resten helt, slik at det kan leses senere uten originalfilen.**

En reprise er ofte borte etter en spilloppdatering, en ny installasjon eller en full disk, og en live-strøm er borte i det øyeblikket den ble sendt. Det en konverterer dropper, er tapt for godt. Det den beholder helt, kan avkodes den dagen noen forstår det. Så en konverterer bestemmer aldri hva som blir nyttig: den avkoder det den kan, beholder hver annen melding, pakke, hendelse, egenskap eller linje uendret ved siden av tabellen, og sier i sin egen utdata hvor mye av hver den leste, og hvor mye den bare beholdt.

Denne siden er konvensjonen alle konverterere deler: reprise-konverterne for War Thunder, World of Tanks, World of Warships og Squad, CS2-demokonverteren, bakgrunnsovervåkeren (dens Dota-reprisedekoder og alle live-adaptere), spillopptaksverktøyets telemetrilesere, og visningsprogrammets egne importer (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Visningsprogrammets egne lesere er beskrevet i [Tacview-opptak](tacview-acmi.md) og [Laste inn filer](loading-files.md); enfilsformen er [Én fil per kamp](container.md). En kamp blir til en tabell, en `match.json` og sidecars, eventuelt pakket i én `.3dheat`-fil. Hvert verktøys README har en seksjon om **Fullstendighet** som lister, for den kilden, hva som leses, hva som beholdes rått, og hva som ikke er tilgjengelig, og hvorfor.

## Tre hjem for hvert element {#three-homes-for-every-item}

Alt en kilde holder havner på nøyaktig ett av tre steder:

| Hjem | Hva som havner der |
|---|---|
| **Avkodet** | Tabellen (én rad per prøve eller hendelse, kolonnene visningsprogrammet leser, og ekstra kolonner for hver annen verdi som hører til en rad) og kampdokumentet `<match>.match.json` (alt som hører til kampen som helhet: innstillinger, lagoppstillinger, resultater, resultattavler, selvkontrollen). |
| **Beholdt rått** | En sidecar ved siden av tabellen: hvert element som ikke er avkodet, eller bare delvis avkodet, helt og uendret, med sin type, tid og enheten eller entiteten det hører til. |
| **Ikke tilgjengelig** | Nevnt i README-ens seksjon om Fullstendighet, med begrunnelsen: formatet bærer det ikke (en klientreprise har ikke de andre spillernes inndata), kilden sender det aldri, eller det er ikke tillatt å lese det (en beskyttet prosess, en kryptert blokk der nøkkelen ikke er vår å bruke). |

Et element som er **delvis** avkodet, er avkodet *og* beholdt rått: tabellen får
det som forstås, sidecaren hele elementet, slik at en bedre dekoder senere ikke trenger originalfilen.

Det finnes ikke et fjerde sted. Å droppe noe fordi det virket ubrukelig,
fordi det var en duplikat "sannsynligvis", eller fordi det var stort, er en feil.
Fortynning er bare tillatt i tabellen (et kamera på 2 Hz i stedet for 60), aldri i sidecaren.

## Sidecars {#sidecars}

En sidecar er en Parquet-fil ved siden av tabellen, med navn etter den:

```
<mappe>/<match>.parquet              tabellen
<mappe>/<match>.match.json           kampdokumentet
<mappe>/<match>.<hva>.parquet        en sidecar
```

`<hva>` er ett ord fra denne listen. En ny konverterer velger ordet som passer,
eller legger til et nytt her **og** i `SIDECAR_PARQUET` i
[`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts),
slik at visningsprogrammet utelater den når en hel mappe lastes.

| `<hva>` | Holder | Brukes av |
|---|---|---|
| `messages` | pakker, kall av entitetsmetoder og egenskapsoppdateringer i en nettverksstrøm, hele | War Thunder, World of Tanks, World of Warships |
| `flight` | flymodell-oppføringer per fly, hele | War Thunder |
| `packets` | hele rammer og nettverksmeldinger, eller beholderbiter, utenfor entitetsstrømmen | CS2, Dota 2, Squad |
| `events` | spillhendelser med alle sine nøkler, slik parseren gir dem | CS2 |
| `entities` | entitets- og egenskapsoppdateringer, fjernkall, kanaler som åpnes og lukkes, med eksportene en dekoder trenger | Squad, Dota 2 |
| `props` | hver entitetsegenskap parseren leser, hver gang den endret seg | CS2 |
| `units` | tilstand per enhet utenfor posisjonstabellen | Dota 2 |
| `combatlog` | en kampdagbok, hver oppføring med alle felt | Dota 2 |
| `strings` | hver oppføring i hver strengtabell | CS2, Dota 2 |
| `objectives` | fangsonene og målene, hver endring med tid | War Thunder |
| `raw` | en live-strøm: hver pakke, linje, API-dokument eller minnelesing som ble mottatt, hele | overvåkerens økter (`heat.raw.parquet`), spillopptaksverktøyets lap-opptakere (`<stempel>_<spill>.raw.parquet`), overvåkerens osu!-, LoL- og Valorant-replayfiler |

Visningsprogrammets mappeinnlasting hopper over hver `*.<hva>.parquet` i denne
listen, og hver `*.match.json`, `*.meta.json`, `*.summary.json` og de andre JSON-sidecarene;
å åpne en av dem alene, ved å velge eller slippe bare den filen, laster den som
enhver annen tabell (se [Laste inn filer](loading-files.md)).

Dette er filene slik en konverterer skriver dem med `--loose`. Som standard
pakker War Thunder-, CS2- og Tacview-konverterne en kamps tabell, dokument og
sidecars i én fil, `<match>.3dheat`, under de samme navnene (se
[Én fil per kamp](container.md)); alt her gjelder for hvert medlem.

### Kolonner {#columns}

Hver sidecar-rad er ett element. Kolonnene er, i denne rekkefølgen, de som gjelder:

| Kolonne | Type | Hva |
|---|---|---|
| `time` | float64 | sekunder på samme klokke som tabellens `time` (eller `tick` der kilden teller ticks; da begge) |
| `type` | streng (ordbok) | hva elementet er, med kildens egne ord: en pakketype, meldings-id, hendelsesnavn, egenskapssti, linjeprefiks |
| `name` | streng (ordbok) | navnet der et er kjent (et fellesskapsnavn, et klassenavn), ellers tomt |
| `entity` / `unit` / `uid` / `player` | heltall eller streng | hvem det hører til, med de samme id-ene som tabellen, slik at en rad i sidecaren kan kobles til et spor |
| `decoded` | streng (JSON) | hva som forstås av det, der noe er forstått; ellers tomt |
| `payload` | binær | elementets bytes, hele og uendret (binære kilder) |
| `text` | streng | elementets tekst, hel og uendret (tekstkilder: en loglinje, et JSON-objekt, en nøkkel-verdi-blokk) |

Flere kolonner er tillatt (en bitforskyvning, en størrelse, en kanal). Strenger som gjentas
er ordbok-kodet, og filen skrives med zstd, så en sidecar blir en brøkdel av
replayets egen størrelse.

En sidecar må være nok på egen hånd: en dekoder skrevet senere leser sidecaren,
aldri den opprinnelige reprisen. Der et element ikke kan forstås uten kontekst (en entitets
klasse, en strengtabell, en nøkkel en melding viser til), legges konteksten også i sidecaren,
eller i kampdokumentet.

### Live-kilder {#live-sources}

Live-adaptere (UDP-telemetri, delt minne, en spills logg, et lokalt API) har
ingen fil å gå tilbake til i det hele tatt. De tar opp **hvert felt kilden sender**,
selv de ingen bruker ennå:

- en pakkestrøm: hver pakke hel, `payload` bytene, `type` pakke-id-en eller formatet, i den
  takten den kommer;
- delt minne eller et avspurt API: hvert felt i hver lesing, enten som navngitte
  kolonner eller hele blokken som `payload`, i den takten adapteren leser;
- en logg: hver linje, `text` linjen, `type` linjens slag, også linjer adapteren ikke handler på.

Disse går i `<økt>.raw.parquet` ved siden av øktens tabell. Størrelsen er prisen for
regelen; den holdes nede av zstd og ordbokkoding, ikke ved å utelate ting.

## Selvkontrollen {#the-self-check}

Hver konverterer skriver, inn i kampdokumentet (eller øktens
`meta.json`, eller et sammendrag der den ikke har et kampdokument), en
`completeness`-blokk under `selfCheck`:

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
| `seen` | hvor mange elementer av denne typen kilden holder |
| `decoded` | lest hele inn i tabellen eller kampdokumentet |
| `partial` | lest delvis inn i tabellen eller dokumentet, og beholdt helt i en sidecar |
| `raw` | beholdt helt bare i en sidecar, ikke avkodet |
| `lost` | `seen - decoded - partial - raw`: må være 0 |

Det øverste `lost` er summen. En konverterers tester hevder at det er 0 på
deres syntetiske prøver, og README sier hva det var på ekte. En `lost` som ikke er null, er konvertereren som sier at den brøt regelen; den navngir typen, slik at hullet kan finnes.

"Typene" er kildens egne: pakketyper, meldings-id-er, hendelsesnavn, egenskapsgrupper,
linjeslag. De telles der konvertereren møter dem, ikke fra en liste over hva den
forventer, så en type ingen kjente til, dukker opp med sitt antall i stedet for å forsvinne.

## README-ens seksjon om Fullstendighet {#the-readmes-completeness-section}

Hver konverterers README har en seksjon med overskriften **Fullstendighet**, med tre lister:

- **Lest**: hva som går inn i tabellen og kampdokumentet, og hvordan hvert nytt felt ble
  kontrollert mot noe uavhengig (spillets egne tall, en annen kilde, et opptak laget for formålet).
- **Beholdt rått**: hva som er i hvilken sidecar, under hvilken `type`, og hva som er kjent om det så langt.
- **Ikke tilgjengelig**: hva kilden ikke bærer eller ikke har lov til å lese, og hvorfor.

Den lenker tilbake hit.

## Hvor hver konverterer står {#where-each-converter-stands}

| Konverterer | Sidecars | Seksjonen Fullstendighet |
|---|---|---|
| War Thunder-reprise | `messages`, `flight` | [3DHeat-Ext-WarThunder README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (selvkontrollens tall er under `counts`; `completeness`-blokken kommer) |
| World of Tanks-reprise | `messages` | [3DHeat-Ext-WoT README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World of Warships-reprise | `messages` | [3DHeat-Ext-WoWs README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squad-serverdemoer | `entities`, `packets` | [3DHeat-Ext-Squad README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2-demoer | `events`, `props`, `strings`, `packets` | [3DHeat-CS2 README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota 2-reprise (overvåker) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota 2-reprise](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!-, LoL- og Valorant-reprise (overvåker) | `raw` | deres sider i [overvåkerens dokumentasjon](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Live-adaptere (overvåker) | `raw` | hvert spills side i [overvåkerens dokumentasjon](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), og [utvikling](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) for `Session.raw` |
| Lap-opptakere (spillopptak) | `raw`, og `unparsed`-bytes inne i en Forza lap-fil | [3DHeat-GameCapture README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Visningsprogrammets egne importer | ingen: se under | denne siden |

### Visningsprogrammets egne importer {#the-viewers-own-imports}

Tacview ACMI, OCAP og GPS-formatene leses i nettleseren fra brukerens egen fil. Visningsprogrammet lagrer ingenting av dem, så filen selv forblir opptaket. De leser likevel så mye de kan:

- **Tacview ACMI** (`src/data/acmi.ts`): hver objektlinje med en posisjon er en rad med hver egenskap opptaket har, hver hendelse er en rad, hver fjerning er en rad, opptakets egne egenskaper (med filhodets
  FileType og FileVersion) på hver rad som `RecordingInfo`; en kommentarlinje er en hendelse
  `Comment`, et objekt som aldri får en posisjon er en rad `Unplaced` ved referansepunktet, og U/V er kolonner når noen rad har dem. En egenskapslinje uten posisjon leses delvis: verdiene går til objektets neste rad, ikke til deres egen tid. `AcmiTable.completeness` teller filens linjer etter slag.
- **OCAP** (`src/data/ocap.ts`): hver entitets rammer, skudd og markører, hver hendelsestype (ukjente typer som rader av "Mission" med sin tekst) og dokumentets egne felt (`Info`). Ikke lest ennå: entitetsfelt og etterfølgende posisjonselementer utover de som står i headeren (en nyere opptakers tillegg), og en død enhets gjentatte rammer etter dødsfallet (fortynnet med vilje: ingenting endres i dem).
- **GPS-formater** (`src/data/geoTracks.ts`): posisjonene, deres tid, høyde, kurs og fart, og pulsfrekvens, frekvens, effekt, temperatur, satellitter, HDOP og trykkhøyde der filen logger dem. Ikke lest ennå: andre GPX- og KML-utvidelser, NMEA-setninger utover posisjonssetningene, IGC-poster utover posisjoner og deres utvidelser, og FIT-meldinger utover poster (runder, økter, enhetsinfo).

Disse hullene er listet for å bli lukket, ikke for å unnskyldes. Visningsprogrammets eksporter av et innlastet opptak (`src/data/exportRecording.ts`) skriver bare det som ble lest.

## Legge til en konverterer {#adding-a-converter}

1. List opp hva formatet holder, fra dets dokumentasjon, dets egne strukturer,
   eller ved å telle hver meldingstype i ekte prøver. Listen er selvkontrollens `types`.
2. Avkod det som kan kontrolleres nå. Hvert nytt felt kontrolleres mot
   noe uavhengig før det går inn i tabellen; et felt som ikke kan kontrolleres ennå, forblir rått.
3. Behold resten helt i en sidecar med navn som over, med kolonnene over.
4. Skriv `completeness`-blokken og en test på at den har `lost` 0.
5. Skriv README-ens seksjon om Fullstendighet og lenk hit.
6. Hvis sidecarens `<hva>` er nytt, legg det til i tabellen over og i
   `SIDECAR_PARQUET` i `src/data/filePick.ts`.

Konverterne er ren-rom: de er skrevet fra formater, dokumentasjon og
prøver, aldri fra GPL- eller AGPL-kode. Prøver av ekte reprisene blir på maskinen som laget dem; tester bruker syntetiske filer.
