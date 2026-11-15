---
title: "Referanse for dataformater"
nav_order: 19
lang: "no"
source: "data-formats.md"
source_hash: "3b120416f7a6"
translated: true
outdated: false
---

# Referanse for dataformater

Denne siden lister alle slags filer 3DHeat kan åpne, og hvordan en tabell inni dem må se ut. En tabell er rader og kolonner, som et regneark: hver rad sier hvor noe var og, hvis du har det, når og hvem.

Det som fanen Varmekart leser, kolonne for kolonne, og hintene en Parquet-fil kan bære. (Fanen Løpsanalyse leser rundefiler, og fanen Kamp leser kampoppsummeringer; se [Løpsanalyse](race-analysis.md) og [Kampanalyse](match-analysis.md).)

## Filer {#files}

Dette er den ene fullstendige listen over filer som kan lastes. Panelet **Kilde** (**Filer…**, **Mappe…**, eller dra og slipp) tar imot akkurat disse:

| Filendelse | Hva det er | Leses av |
|---|---|---|
| `.parquet`, `.pq` | Parquet-tabell | Parquet-leseren (under) |
| `.csv`, `.tsv`, `.txt` | Skilletegnstekst | tekstleseren (under) |
| `.3dheat` | Én kamp i én fil (en ZIP som holder tabellen og tilleggene) | lastes som tabellen den holder - [Én fil per kamp](container.md) |
| `.acmi` (også `.txt.acmi`, `.zip.acmi`) | Tacview-flyopptak | sin egen leser - [Tacview-opptak](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP-opptak (Arma-stil) | sin egen leser |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS-spor: GPX, KML/KMZ, NMEA-logger, IGC-seillogger, FIT-sportsfiler | sin egen leser; posisjoner kommer fra breddegrad og lengdegrad |

Ikke lastet som posisjoner: de små JSON-filene som ligger ved siden av en tabell og beskriver den (navn som slutter på `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), og en konverterers ekstra tabeller (`<kamp>.events.parquet` og lignende, se [Konvertere](converters.md)) med mindre du velger dem alene. Alt annet hoppes over med en grunn. Hvordan et valg filtreres, forklares i [Laste inn filer](loading-files.md#which-files-are-kept).

Tomme filer hoppes over. I et valg som inneholder `movement*.<ext>`-filer, lastes bare disse ([Laste inn filer](loading-files.md#which-files-are-kept)).

Dataene er **én rad per prøve**: en posisjon i et øyeblikk, eventuelt med hvem, hvilken gruppe, hvilken økt, hvor de så, og eventuelle flere kolonner. Hendelsesrader (en drap, en plassering, et skudd) kan ligge i samme tabell som posisjonsrader, og skilles ved en hendelseskolonne.

## Skilletegnstekst (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

En minste nyttig fil, tre rader:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Kolonnene knytter seg selv ([Kolonnekobling](column-mapping.md)).

Leses av en skanner på bytenivå som bare dekoder de kolonnene som er koblet ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Forhold | Regel |
|---|---|
| Overskrift | Den første ikke-tomme linjen holder kolonnenavnene. Et tomt navn blir `column_N`. |
| Skilletegn | Oppdages fra de første 20 ikke-tomme linjene i de første 1 MiB, blant komma, semikolon, tabulator og rørtegn, etter **konsistens**: skilletegnet som gir samme antall felt på hver prøvet linje vinner, deretter det som gir flest felt. Mellomrom oppdages aldri, men kan velges; ethvert enkelt tegn kan skrives inn ([Kolonnekobling](column-mapping.md#the-fields)). |
| Sitering | RFC 4180: felt kan være innpakket i doble anførselstegn, `""` inne i anførsler er et bokstavelig anførselstegn. |
| Mellomrom | Innledende og avsluttende mellomrom, tabulatorer og anførselstegn fjernes fra hvert felt. |
| Felt per rad | Høyst 4 096; flere er en feil (*er skilletegnet riktig?*). |
| Tall | Valgfritt fortegn, siffer, valgfri `.` og desimaler, valgfri eksponent (`1.5e-3`). En desimalkomma (`1,5`), tusenskilletegn eller etterfølgende enheter (`12 m`) leses ikke og regnes som manglende. Bruker filen din desimalkomma, erstatt dem med punktum før du laster inn (søk og erstatt i en tekstredigerer går bra). |
| Tallkolonne | En kolonne tilbys som tallkolonne når mer enn 90 % av de ikke-tomme verdiene i de første 50 radene leses som tall. |
| Antall rader | Anslås før innlasting fra gjennomsnittlig linjelengde i de første 1 MiB. |
| Tekstkoding | UTF-8. |

## Parquet {#parquet}

Leses med [hyparquet](https://github.com/hyparam/hyparquet), kolonneblokk for kolonneblokk inn i typede arrayer, og ber bare om kolonnene som er koblet ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Forhold | Regel |
|---|---|
| Antall rader | Nøyaktig, fra footeren, før innlasting. |
| Forhåndsvisning | De første 50 radene, dekodet som objekter; deres verdier avgjør hvilke kolonner som ser ut som tall. |
| Heltall | `INT32`, og `INT64` (dekodet som BigInt) blir tall. |
| Flyttall | `FLOAT`, `DOUBLE`. |
| Boolske verdier | 1 og 0. |
| Tekst | Brukes for person-, gruppe-, økt- og kategorikolonner; en tekst som ser ut som et tall, godtas for tallroller. |
| Logiske typer `TIMESTAMP`, `DATE` | Dekodes til tidspunkter (millisekunder siden 1970); brukt som tidsakse ignoreres enhetsinnstillingen. |
| Nøstede kolonner | Struct- og list-kolonner er ikke ment for noen rolle (de forhåndsvises som JSON-tekst); ikke testet. |
| Footer-metadata | Nøkkelen `heat3d` leses som kobling-hint (under). |

En posisjons-, tids- eller utseendekolonne som inneholder noe annet enn et tall, dekodes som manglende.

## Kolonneroller og typer {#column-roles-and-types}

| Rolle | Type i filen | Påkrevd | Lagret som | Grenser |
|---|---|---|---|---|
| X, Y, Z | tall | to av tre | 32-bit flyttall, etter [aksemappingen](axes-units-and-time.md) | En rad uten en brukbar posisjon droppes. |
| Tid | tall i en av [tidsenhetene](axes-units-and-time.md#time-units), Parquet-tidsstempel, eller ISO-8601-tekst | nei | 32-bit flyttall i sekunder fra den tidligste raden | Sortering nektes over 400 000 000 rader ([hvorfor](memory-and-budgets.md#the-sort-ceiling)). |
| Person | hva som helst; ordbokskodet | nei | 32-bit id | |
| Økt | hva som helst; ordbokskodet | nei | 32-bit id | Etiketter listes opp til 100 000 økter. |
| Gruppe | hva som helst; ordbokskodet | nei | 16-bit id | Opp til 4 096 grupper, ellers droppes grupperingen. |
| Gir, stigning | tall, grader eller radianer | nei | 32-bit flyttall i radianer | |
| Retning X, Y, Z | tall | nei (alle tre sammen) | gjort om til gir og stigning | |
| Filterkolonne, *område* | tall | nei | 32-bit flyttall | Opp til 4 filtre aktive samtidig. |
| Filterkolonne, *kategori* | hva som helst; ordbokskodet | nei | 32-bit id | Opp til 4 096 verdier, ellers beholdes ikke kolonnen. |

En Parquet-kolonne av typen `TIMESTAMP` som beholdes som filterkolonne, er et *område* av epoke-millisekunder - en skyveknapp, ikke en liste.

## Resultatkolonner {#outcome-columns}

Hvem som vant, på hver rad, så et sted, en rute eller et trekk kan bedømmes etter hvor ofte siden det hører til, endte med å vinne ([Seiersandel](win-rate.md)). Visningsprogrammet beholder disse kolonnene selv, viser dem først i [filtrene](filters.md) på visningsprogrammets språk og leser dem i [seiersandelskartet](win-rate.md), [oppdelingen](breakdown.md) og [volumstatistikken](volumes.md#statistics). En konverter for et rundebasert spill (CS2, Valorant, Rainbow Six Siege) eller et kampbasert (War Thunder) skriver alle fire; Tacview-konverteren skriver dem for en DCS-servers kampanjer der en rundefil sier hvem som vant ([DCS-servere](tacview-acmi.md#dcs-servers-who-won-and-how-each-sortie-ended)):

| Kolonne | Type | Betydning |
|---|---|---|
| `won` | 0/1 (tom der det er ukjent) | radens side (lag) vant **runden**; i et spill uten runder kampen |
| `matchWon` | 0/1 (tom der det er ukjent) | radens side (lag) vant **kampen**; tom der opptaket ikke viser slutten |
| `round` | heltall, fra 1 | runden raden hører til; 1 gjennom hele et kampbasert spill |
| `roundEndReason` | tekst | hvordan runden endte (i et kampbasert spill kampen), med ordene nedenfor |

`won` og `matchWon` hører til radens side: en T-spillers rader bærer T-sidens resultat, en AI-enhets rader lagets resultat; rader som ikke hører til noen side, lar dem stå tomme. En side som bytter ved pausen, beholder sin egen `matchWon` og tar hver rundes `won` slik den spilte den. Uavgjort er 0 for begge sider.

Sluttårsakene er felles for alle spill, så ett filter virker på alle (et spills eget ord kobles der det går, [`data/outcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/outcome.ts)):

| `roundEndReason` | Betydning | Spill |
|---|---|---|
| `elimination` | alle spillerne på én side er ute | CS2, Valorant, Rainbow Six Siege |
| `bomb` | bomben (spike, desarmererens mål) gikk av | CS2, Valorant, Rainbow Six Siege |
| `defuse` | bomben (spike) ble desarmert | CS2, Valorant, Rainbow Six Siege |
| `time` | rundens klokke gikk ut; War Thunder: avgjort med billetter igjen på begge sider | alle |
| `surrender` | en side ga opp | CS2, Valorant, Rainbow Six Siege |
| `draw` | ingen vinner | CS2 |
| `objective` | et mål tatt eller holdt (gissel hentet ut, område sikret) | Rainbow Six Siege |
| `capture` | gikk tom for billetter mens vinneren holdt erobringssoner; DCS: en vedvarende kampanje som ble vunnet ved å ta alle flyplasser og soner | War Thunder, DCS |
| `tickets` | billetter tapt til drap | War Thunder |
| `destruction` | de siste kjøretøyene tapt på én gang, ingen igjen til å spawne | War Thunder |
| `other` | alt annet | |

Oppgi dem også i `extra`-listen i `heat3d`-hintene, som enhver annen kolonne. Kolonnenavnene `win`, `round_won`, `match_won`, `end_reason` og `win_reason` leses som de samme kolonnene.

## `heat3d`-hintene {#the-heat3d-hints}

En Parquet-fil kan bære sine egne leseinstruksjoner i footerens nøkkel/verdi-metadata, under nøkkelen **`heat3d`**, som et JSON-objekt ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Visningsprogrammet bruker dem over sine egne gjetninger når filen er den første i et valg; hver oppføring er valgfri, og hvert resultat vises fortsatt og kan redigeres i panelet [Kolonnekobling](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Alt som ikke leses som et JSON-objekt, ignoreres.

### Skjema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          kolonnenavn for posisjonen
    "time": string,                                  tidskolonnen
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           filterkolonner å beholde, mest nyttige først
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  må være > 0
  },
  "entity": {
    "size": number                                   størrelsen på én sporet ting i filens enheter, > 0
  }
}
```

| Oppføring | Brukes når | Effekt |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | den navngitte kolonnen finnes i filen | Setter den rollen. |
| `columns.timeUnit` | den er en av de syv enhetene | Setter tidsenheten. |
| `columns.angleUnit` | `"degrees"` eller `"radians"` | Setter vinkelenheten. |
| `columns.lookMode` | `"vector"` med dirX, dirY og dirZ alle satt; `"yawPitch"` med yaw satt; `"none"` | Setter utseendemodusen. |
| `columns.extra` | den er en array | Erstatter den automatiske filterlisten, og beholder bare eksisterende kolonner som ingen rolle bruker; hver er *område* når den så ut som et tall i forhåndsvisningen, ellers *kategori*. Uten den beholdes den automatiske listen minus enhver kolonne et hint har gitt en rolle. |
| `axes.up` | `"y"` eller `"z"` | Oppakse. |
| `axes.flipX/Y/Z` | en boolsk verdi | Speiler. |
| `axes.scale` | et tall > 0 | Enhetsskala. |
| `entity.size` | et tall > 0 | [Enhetsstørrelse](sessions-persons-groups.md#entity-size) (ganget med enhetsskalaen ved innlasting). Den eneste måten å sette den på. |

### Eksempel {#example}

Et oppdiktet eksport fra et skytespill: Z opp, centimeter, en venstrehåndet verden, spillere omtrent 72 cm brede.

```json
{
  "columns": {
    "x": "pos_x", "y": "pos_y", "z": "pos_z",
    "time": "t", "timeUnit": "seconds",
    "personId": "player", "teamId": "side", "sessionId": "round_id",
    "lookMode": "yawPitch", "yaw": "view_yaw", "pitch": "view_pitch", "angleUnit": "degrees",
    "extra": ["event", "weapon", "map"]
  },
  "axes": { "up": "z", "flipY": true, "scale": 0.01 },
  "entity": { "size": 72 }
}
```

### Skrive den {#writing-it}

Med pyarrow skrives egendefinert skjemametadata til filens nøkkel/verdi-metadata:

```python
import json
import pyarrow as pa
import pyarrow.parquet as pq

table = pa.table({...})
hints = {"columns": {"x": "pos_x", "y": "pos_y", "z": "pos_z", "time": "t"}, "axes": {"up": "z"}}
meta = dict(table.schema.metadata or {})
meta[b"heat3d"] = json.dumps(hints).encode("utf-8")
pq.write_table(table.replace_schema_metadata(meta), "movement.parquet")
```

`npm run inspect -- file.parquet` skriver ut en fils skjema, som er en rask måte å sjekke kolonnenavnene hintene refererer til.

## Hva fanen Varmekart skriver {#what-the-heatmap-tab-writes}

Ingenting skrives tilbake til dataene. Resultatene er:

- videoer, som WebM (VP9 eller VP8) - [Kameraspor og video](camera-path-and-video.md);
- en kamerapositur, kopiert til utklippstavlen som tekst - [Kamera](camera.md#pose);
- nivåer lagret i nettleserens [nivåbibliotek](level-library.md).
