---
title: "Kolonnetilknytning"
parent: "Indlæs data"
nav_order: 2
lang: "da"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Kolonnetilknytning

En fil er en tabel, og 3DHeat skal vide, hvilken kolonne der holder position øst-vest, hvilken der holder tiden, hvilken der holder spillerens navn og så videre. Dette panel er, hvor den siger, hvad den gættede, og hvor du retter et forkert gæt.

![Panelet Kolonnetilknytning efter indlæsning af en Parquet-fil: hver boks allerede udfyldt - 1 X, 2 Y, 3 Z, 4 Tid, 5 Person-id, 6 Session / kamp, 7 Hold / gruppe](../assets/img/en/column-mapping-panel.webp)

*Filen navngav selv sine kolonner, så hver boks er allerede udfyldt.*

For eksempel: en CSV med overskriften `x,y,z,t,player,team` tilknytter sig selv: x, y og z bliver positionen, `t` tiden, `player` [personen](glossary.md) og `team` [gruppen](glossary.md).

Når filer er valgt, åbnes panelet **Kolonnetilknytning** under Kilde-panelet. Det siger, hvilken kolonne der spiller hvilken rolle. Det udfyldes automatisk, og hvert felt kan ændres, før du trykker på **Indlæs**; tilknytningen læses ved indlæsning, så ændrer du den bagefter, skal du indlæse igen.

## Felterne {#the-fields}

Alle kolonnemenuer lister hver kolonne i den første fil plus *- ingen -*.

| Felt | Rolle | Noter |
|---|---|---|
| **Skilletegn** | Kun CSV: feltseparatoren. | Menu: *Komma ,*, *Semikolon ;*, *Tab*, *Lodret streg \|*, *Mellemrum*; eller skriv et enkelt tegn i *eller skriv ét tegn*. Registreres automatisk (se nedenfor). Ændring kører den automatiske tilknytning igen, så tidligere rettelser går tabt. |
| **X**, **Y**, **Z** | Position. | Mindst to kræves; en ikke-tilknyttet tredje akse er 0 (dataene ligger på et plan). Samme kolonne på to akser er en fejl. |
| **Opad-akse i kilden** | Hvilken kildeakse der peger op. | *Z er op (de fleste spilmotorer)* eller *Y er op (grafikkonvention)*. Se [Akser, enheder og tid](axes-units-and-time.md). |
| **Enhedsskala** | Ganger hver position. | Knapperne *1 (m)* og *0,01 (cm→m)*, eller skriv en værdi. |
| **Vend X / Vend Y / Vend Z** | Negerer en kildeakse. | Anvendes på positioner og på blikretningsvektorer. |
| **Tid** | Tidsaksen. | Valgfri. Uden den er der ingen tidslinje. |
| **Tidsenhed** | Hvordan tidskolonnen læses. | Syv enheder; se [Akser, enheder og tid](axes-units-and-time.md#time). Ignoreres for Parquet-kolonner af typen `TIMESTAMP`/`DATE`, hvilket panelet siger. |
| **Person-id** | Hvem eller hvad en række hører til. | Valgfri. Gør spor, levetider, kampreplay og linje-varme mulige. |
| **Session / kamp** | Hvilken kamp, raid, runde, løb eller omgang en række hører til. | Valgfri. Positioner interpoleres, sporer eller samles aldrig til en rute på tværs af et sessionsskifte. Se [Sessioner, personer og grupper](sessions-persons-groups.md). |
| **Hold / gruppe** | Enhver kolonne med lav kardinalitet. | Valgfri. Styrer gruppefarver, holdvarme og forskelsdelingen efter gruppe. |
| **Blikretning** | *Ingen*, *Yaw- / pitch-kolonner* eller *Retningsvektor-kolonner*. | Med yaw/pitch: **Yaw**, **Pitch** og **Vinkelenhed** (*Grader* / *Radianer*). Med en vektor: **Dir X**, **Dir Y**, **Dir Z**. Bruges til blikstrålerne i [kassereplay](box-replay.md). |
| **Behold til filtrering** | Ekstra kolonner, der holdes i hukommelsen. | En afkrydsning pr. kolonne, og for hver afkrydset *interval* (numerisk) eller *kategori*. Hver koster 4 bytes pr. række og et afkodningspas ved indlæsning. Kun beholdte kolonner kan [filtreres](filters.md), bruges til en [forskelsdeling](difference.md) eller som hændelseskolonne i [linje-varme](line-heat.md). |
| **Vis eksempelrækker** | En tabel over de første 12 prøvede rækker, alle kolonner. | Til at kontrollere gættene. |

En afkrydset filterkolonne, der ikke er sat udtrykkeligt, læses som *interval*; en id-kolonne, der ser numerisk ud, er ofte mere nyttig som *kategori*. Kun 4 filtre kan være aktive på én gang ([Filtre](filters.md)).

## Hvordan den automatiske tilknytning gætter {#how-the-auto-mapping-guesses}

Gætteriet ligger i [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Det kigger på kolonnenavne, på hvilke kolonner der er numeriske i de prøvede rækker (mere end 90 % af de ikke-tomme værdier kan læses som tal), på hvor mange forskellige værdier hver kolonne har i prøven, og på Parquets logiske typer. Navnemønstre prøves i rækkefølge, uden forskel på store og små bogstaver, og det første mønster, der passer på en endnu ledig kolonne, vinder.

### Position {#position}

| Akse | Navnemønstre, i rækkefølge (kun numeriske kolonner) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Hvis en akse stadig er tom, udfylder de første ledige numeriske kolonner (ignorerer `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) den i rækkefølge. Et forkert gæt er tydeligt på skærmen; en tom ville efterlade et tomt billedfelt.

### Tid {#time}

- **Først Parquet-tidsstempelkolonner.** Blandt kolonner, hvis logiske type er `TIMESTAMP` eller `DATE`, vælges den bedste efter score: +10.000, hvis navnet passer et tidsmønster, -5.000 for en simpel `DATE`, plus antallet af forskellige værdier i prøven. En hel-dags-dato og en konstant sessionsstart tager næsten ingen forskellige værdier, så hændelsestidspunktet vinder. Enheden er så *Unix-tidsstempel (ms)*.
- **Ellers efter navn:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, derefter navne for forløbet tid (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Enheden gættes så ud fra værdierne: ISO-8601, når en værdi ligner `YYYY-MM-DDT…` eller `YYYY-MM-DD …`; ellers efter den største størrelse: over 10^17 nanosekunder, over 10^14 mikrosekunder, over 10^11 Unix-millisekunder, over 10^8 Unix-sekunder, over 10^6 millisekunder, ellers sekunder.

Når en kolonne for forløbet tid vælges, noterer panelet, at hver session så flugtes til sin egen start - godt til at lægge kampe oven på hinanden, ikke til at se dem i rigtig rækkefølge.

### Session, person, gruppe {#session-person-group}

Sessionen tages **efter** tidsaksen og **før** person og gruppe, fordi en sessionskolonne ofte er et tidsstempel (kampens starttidspunkt på hver række i kampen).

| Rolle | Navnemønstre, i rækkefølge |
|---|---|
| Session | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (hver præcis, valgfrit med `_id`) |
| Person | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, derefter `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (løbsdata: det er bilen, der bevæger sig) |
| Gruppe | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Gruppe, reserve | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

En gruppekandidat, der har en særskilt værdi på de fleste prøvede rækker (mere end max(48, 60 % af prøven)), er et id, ikke en gruppe: den bliver personkolonnen, hvis ingen blev fundet, og den bruges ikke som gruppe. Hvis der slet ikke blev fundet en gruppekolonne, bruges den ikke-numeriske kolonne med færrest forskellige værdier mellem 2 og 12.

### Blikretning {#look-direction}

En numerisk kolonne ved navn `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` eller `rot_z` / `rotation_z` skifter blikretning til yaw/pitch; pitch søges som `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Grader antages, når en prøvet yaw overstiger 7 i størrelse, ellers radianer. En retningsvektor gættes aldrig; den kommer fra tipsene nedenfor eller fra dig.

### Filterkolonner {#filter-columns}

Højst **6** kolonner beholdes automatisk, rangeret:

1. `region`, `sessionMode`, `actor` - kolonner, der findes for at blive filtreret på (score 1200);
2. kategorikolonner, der varierer i prøven, færrest forskellige værdier først (1000 minus antallet);
3. en kolonne, der er konstant i prøven, men kun når flere filer indlæses - den kan variere mellem filer, som en region eller et testkørsels-id (600);
4. numeriske kolonner (500).

Kolonner, der allerede spiller en rolle, de støjende navne ovenfor, kolonner, der er konstante ved en indlæsning af én fil, og fritekstkolonner (mere end max(16, halvdelen af prøven) forskellige værdier) tilbydes ikke automatisk. Enhver kolonne kan stadig afkrydses i hånden.

### Opad-akse {#up-axis}

Når alle tre akser er kortlagt, tages den akse, der har den mindste spredning af Y og Z i prøven, som op (et kort er langt bredere end det er højt); ellers antages Z op.

## `heat3d`-tipsene i en Parquet-footer {#the-heat3d-hints-in-a-parquet-footer}

En Parquet-fil kan sige, hvordan den skal læses. Hvis filens footer-nøgle/værdi-metadata har en post med nøglen **`heat3d`**, læses dens værdi som JSON og lægges oven på gætterierne ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). CS2-demokonverteren skriver sådan en post, så dens tabeller åbner med spilleren som person, siden som gruppe, hver runde som session, blikretning slået til og verden vendt den rigtige vej.

Kun den **første** fil i et valg læses for tips. Hver post er valgfri, og hver tippet værdi vises stadig i panelet og kan ændres. En fuld beskrivelse af skemaet, med et eksempel og hvordan man skriver det, står i [referencen for dataformater](data-formats.md#the-heat3d-hints).

Reglerne, kort:

- En kolonne, et tip navngiver, anvendes kun, når filen har den kolonne.
- `lookMode: "vector"` træder kun i kraft, når `dirX`, `dirY` og `dirZ` alle er sat; `"yawPitch"` kun når `yaw` er sat.
- `extra`, når den findes, erstatter den automatiske filterliste (ukendte navne og kolonner, der allerede spiller en rolle, droppes); hver enkelts interval/kategori-type følger, om den så numerisk ud. Når den mangler, beholdes den automatiske liste minus enhver kolonne, et tip gav en rolle.
- `axes.up` skal være `"y"` eller `"z"`, vend-værdier skal være booleske, `scale` skal være positiv.
- `entity.size`, når den er positiv, er størrelsen på én sporet ting i filens enheder ([enhedsstørrelse](sessions-persons-groups.md#entity-size)); det er den eneste måde at sætte den.

## Kendt fejl: overskrivning af CSV-skilletegnet {#known-issue-overriding-the-csv-separator}

Når du ændrer skilletegnet til et andet end det registrerede, ændrer kolonnelisten og eksempelrækkerne sig ikke (forhåndsvisningen deler stadig med det registrerede skilletegn). Det valgte skilletegn bruges stadig til selve indlæsningen. Hvis det registrerede skilletegn er forkert:

1. Åbn filen i en teksteditor.
2. Erstat skilletegnet med et komma overalt (og decimalkommaer med punktummer).
3. Gem, og indlæs filen igen.

Årsagen ligger i [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
