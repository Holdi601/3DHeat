---
title: "Kolonnekobling"
parent: "Få inn data"
nav_order: 2
lang: "no"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Kolonnetilordning

En fil er en tabell, og 3DHeat må vite hvilken kolonne som holder øst–vest-posisjonen, hvilken som holder tiden, hvilken som holder spillerens navn, og så videre. Dette panelet er der den sier hva den gjettet, og der du retter en feil gjetning.

![Kolonnetilordning-panelet etter at en Parquet-fil ble lastet: alle feltene er allerede fylt ut – 1 X, 2 Y, 3 Z, 4 Tid, 5 Person-ID, 6 Økt / kamp, 7 Lag / gruppe](../assets/img/en/column-mapping-panel.webp)

*Filen ga sine egne kolonner navn, så alle feltene er allerede fylt ut.*

For eksempel tilordner en CSV med overskriften `x,y,z,t,player,team` seg selv: x, y og z blir posisjonen, `t` tiden, `player` [personen](glossary.md) og `team` [gruppen](glossary.md).

Etter at filer er valgt, åpnes panelet **Kolonnetilordning** under Kilde-panelet. Det sier hvilken kolonne som spiller hvilken rolle. Det fylles ut automatisk, og hvert felt kan endres før du trykker **Last inn**; tilordningen leses når innlastingen starter, så endrer du den etterpå, må du laste inn på nytt.

## Feltene {#the-fields}

Alle kolonnemenyene lister hver kolonne i den første filen, pluss *– ingen –*.

| Felt | Rolle | Merknader |
|---|---|---|
| **Skilletegn** | Bare CSV: feltskilletegnet. | Meny: *Komma ,*, *Semikolon ;*, *Tabulator*, *Rør \|*, *Mellomrom*; eller skriv inn et hvilket som helst enkelt tegn i *eller skriv ett tegn*. Oppdages automatisk (se under). Endres det, kjøres den automatiske tilordningen på nytt, så tidligere endringer går tapt. |
| **X**, **Y**, **Z** | Posisjon. | Minst to kreves; en ikke-tilordnet tredje akse er 0 (dataene ligger på et plan). Samme kolonne på to akser er en feil. |
| **Opp-akse i kilden** | Hvilken kildeakse som peker opp. | *Z er opp (de fleste spillmotorer)* eller *Y er opp (grafikkonvensjon)*. Se [Akser, enheter og tid](axes-units-and-time.md). |
| **Enhetsskala** | Ganger hver posisjon. | Knappene *1 (m)* og *0,01 (cm→m)*, eller skriv inn en verdi. |
| **Snu X / Snu Y / Snu Z** | Negerer en kildeakse. | Brukes på posisjoner og på retningsvektorer for blikket. |
| **Tid** | Tidsaksen. | Valgfri. Uten den finnes ingen tidslinje. |
| **Tidsenhet** | Hvordan tidskolonnen leses. | Syv enheter; se [Akser, enheter og tid](axes-units-and-time.md#time). Ignoreres for Parquet-kolonner av typen `TIMESTAMP`/`DATE`, som panelet sier fra om. |
| **Person-ID** | Hvem eller hva en rad tilhører. | Valgfri. Gjør spor, levetider, boksrepriser og linjevarme mulig. |
| **Økt / kamp** | Hvilken kamp, raid, runde, løp eller runde en rad tilhører. | Valgfri. Posisjoner interpoleres, trekkes eller settes sammen til en rute aldri over en øktgrense. Se [Økter, personer og grupper](sessions-persons-groups.md). |
| **Lag / gruppe** | Enhver kolonne med få ulike verdier. | Valgfri. Styrer gruppefarger, lagvarme og differansedelingen etter gruppe. |
| **Blikkretning** | *Ingen*, *Yaw- / pitch-kolonner* eller *Retningsvektor-kolonner*. | Med yaw/pitch: **Yaw**, **Pitch** og **Vinkelenhet** (*Grader* / *Radianer*). Med en vektor: **Retning X**, **Retning Y**, **Retning Z**. Brukes til blikkstrålene i [boksrepriser](box-replay.md). |
| **Behold for filtrering** | Ekstra kolonner som holdes i minnet. | En avkrysningsboks per kolonne, og for hver avkrysset én *område* (numerisk) eller *kategori*. Hver koster 4 byte per rad og en dekodingsrunde ved innlasting. Bare beholdte kolonner kan [filtreres](filters.md), brukes til en [differansedeling](difference.md) eller som hendelseskolonne for [linjevarme](line-heat.md). |
| **Vis eksempelrader** | En tabell med de første 12 prøvde radene, alle kolonner. | For å sjekke gjetningene. |

En avkrysset filterkolonne som ikke er satt eksplisitt, leses som *område*; en numerisk ID-kolonne er ofte mer nyttig som *kategori*. Bare 4 filtre kan være aktive samtidig ([Filtre](filters.md)).

## Slik gjetter den automatiske tilordningen {#how-the-auto-mapping-guesses}

Gjettingen ligger i [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Den ser på kolonnenavn, på hvilke kolonner som er numeriske i de prøvde radene (mer enn 90 % av de ikke-tomme verdiene kan tolkes som tall), på hvor mange ulike verdier hver kolonne tar i utvalget, og på Parquets logiske typer. Navnemønstre prøves i rekkefølge, uten hensyn til store og små bokstaver, og det første mønsteret som passer en ennå ledig kolonne, vinner.

### Posisjon {#position}

| Akse | Navnemønstre, i rekkefølge (bare numeriske kolonner) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Er en akse fortsatt tom, fyller de første ledige numeriske kolonnene (uten `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) den i rekkefølge. En feil gjetning er tydelig på skjermen; en tom ville gitt en tom visning.

### Tid {#time}

- **Først Parquet-tidsstempelkolonner.** Blant kolonner med logisk type `TIMESTAMP` eller `DATE` velges den beste etter poengsum: +10 000 hvis navnet passer et tidsmønster, -5 000 for en ren `DATE`, pluss antallet ulike verdier i utvalget. En hel dagsdato og en konstant øktstart tar nesten ingen ulike verdier, så hendelsestidspunktet vinner. Enheten settes da til *Unix-tidsstempel (ms)*.
- **Ellers etter navn:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, deretter navn for forløpt tid (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Enheten gjettes så fra verdiene: ISO-8601 når en verdi ser ut som `ÅÅÅÅ-MM-DDT…` eller `ÅÅÅÅ-MM-DD …`; ellers etter størrelsen: over 10^17 nanosekunder, over 10^14 mikrosekunder, over 10^11 Unix-millisekunder, over 10^8 Unix-sekunder, over 10^6 millisekunder, ellers sekunder.

Når en kolonne for forløpt tid velges, noterer panelet at hver økt da justeres til sin egen start – godt for å legge kamper over hverandre, ikke for å se dem i virkelig rekkefølge.

### Økt, person, gruppe {#session-person-group}

Økten tas **etter** tidsaksen og **før** person og gruppe, fordi en øktkolonne ofte er et tidsstempel (kampens starttidspunkt på hver rad i kampen).

| Rolle | Navnemønstre, i rekkefølge |
|---|---|
| Økt | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (hver nøyaktig, eventuelt med `_id`) |
| Person | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, deretter `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (løpsdata: det er bilen som beveger seg) |
| Gruppe | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Gruppe, reserve | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

En gruppekandidat som tar en egen verdi på de fleste prøvde radene (mer enn max(48, 60 % av utvalget)) er en ID, ikke en gruppe: den blir personkolonne hvis ingen ble funnet, og brukes ikke som gruppe. Fant ingen gruppekolonne i det hele tatt, brukes den ikke-numeriske kolonnen med færrest ulike verdier mellom 2 og 12.

### Blikkretning {#look-direction}

En numerisk kolonne kalt `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` eller `rot_z` / `rotation_z` slår blikkretningen over til yaw/pitch; pitch letes etter som `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Grader antas når en prøvd yaw er over 7 i størrelse, ellers radianer. En retningsvektor gjettes aldri; den kommer fra hintene under eller fra deg.

### Filterkolonner {#filter-columns}

Høyst **6** kolonner beholdes automatisk, rangert:

1. `region`, `sessionMode`, `actor` – kolonner som finnes for å filtreres på (poeng 1200);
2. kategorikolonner som varierer i utvalget, færrest ulike verdier først (1000 minus antallet);
3. en kolonne som er konstant i utvalget, men bare når flere filer lastes inn – den kan variere mellom filene, som en region eller en testkjøring-id (600);
4. numeriske kolonner (500).

Kolonner som allerede har en rolle, støynavnene over, kolonner som er konstante i en innlasting av én fil, og fritekstkolonner (mer enn max(16, halvparten av utvalget) ulike verdier) tilbys ikke automatisk. Enhver kolonne kan fortsatt krysses av for hånd.

### Opp-akse {#up-axis}

Med alle tre aksene tilordnet tas aksen med minst spredning av Y og Z i utvalget som opp (et kart er langt bredere enn det er høyt); ellers antas Z opp.

## `heat3d`-hintene i en Parquet-fotnote {#the-heat3d-hints-in-a-parquet-footer}

En Parquet-fil kan si hvordan den bør leses. Hvis filens fotnote-nøkkel/verdi-metadata har en oppføring med nøkkelen **`heat3d`**, parses verdien som JSON og legges over gjettingene ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). CS2-demokonverteren skriver en slik oppføring, så tabellene åpnes med spilleren som person, siden som gruppe, hver runde som økt, blikkretning på, og verden riktig vendt.

Bare den **første** filen i et utvalg leses for hint. Hver oppføring er valgfri, og hver hintet verdi vises fortsatt i panelet og kan endres. En fullstendig beskrivelse av skjemaet, med et eksempel og hvordan det skrives, står i [Dataformat-referansen](data-formats.md#the-heat3d-hints).

Reglene, kort:

- En kolonne som et hint nevner, brukes bare når filen har den kolonnen.
- `lookMode: "vector"` virker bare når `dirX`, `dirY` og `dirZ` er satt alle sammen; `"yawPitch"` bare når `yaw` er satt.
- `extra`, når den finnes, erstatter den automatiske filterlisten (ukjente navn og kolonner som allerede har en rolle, fjernes); hver enkelt får type område/kategori etter om den så numerisk ut. Når den mangler, beholdes den automatiske listen, minus kolonner et hint har gitt en rolle.
- `axes.up` må være `"y"` eller `"z"`, snu-verdier må være boolske, `scale` må være positiv.
- `entity.size`, når den er positiv, er størrelsen på ett sporet objekt i filens enheter ([enhetsstørrelse](sessions-persons-groups.md#entity-size)); det er den eneste måten å sette den på.

## Kjent feil: overstyring av CSV-skilletegnet {#known-issue-overriding-the-csv-separator}

Når du endrer skilletegnet til et annet enn det oppdagede, endres ikke kolonnelisten og eksempelradene (forhåndsvisningen deler fortsatt med det oppdagede skilletegnet). Det valgte skilletegnet brukes fortsatt til selve innlastingen. Hvis det oppdagede skilletegnet er feil:

1. Åpne filen i en tekstredigerer.
2. Erstatt skilletegnet med komma overalt (og desimalkommaer med punktum).
3. Lagre, og last deretter inn filen på nytt.

Årsaken ligger i [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
