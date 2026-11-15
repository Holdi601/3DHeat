---
title: "Kolumnmappning"
parent: "Läsa in data"
nav_order: 2
lang: "sv"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Kolumnmappning

En fil är en tabell, och 3DHeat måste veta vilken kolumn som har öst–väst-positionen, vilken som har tiden, vilken som har spelarens namn och så vidare. Den här panelen är där den säger vad den gissade, och där du rättar en felaktig gissning.

![Panelen Kolumnmappning efter inläsning av en Parquet-fil: alla rutor redan ifyllda – 1 X, 2 Y, 3 Z, 4 Tid, 5 Person-id, 6 Session / match, 7 Lag / grupp](../assets/img/en/column-mapping-panel.webp)

*Filen angav själv sina kolumner, så alla rutor är redan ifyllda.*

Till exempel mappar en CSV med rubriken `x,y,z,t,player,team` sig själv: x, y och z blir positionen, `t` tiden, `player` [personen](glossary.md) och `team` [gruppen](glossary.md).

När filer har valts öppnas panelen **Kolumnmappning** under panelen Källa. Den säger vilken kolumn som spelar vilken roll. Den fylls i automatiskt, och varje fält kan ändras innan du trycker på **Läs in**; mappningen läses vid inläsningen, så om du ändrar den efteråt måste du läsa in igen.

## Fälten {#the-fields}

Alla kolumnmenyer listar varje kolumn i den första filen, plus *– ingen –*.

| Fält | Roll | Anteckningar |
|---|---|---|
| **Avgränsare** | Bara CSV: fältavgränsaren. | Meny: *Komma ,*, *Semikolon ;*, *Tabb*, *Pipe \|*, *Mellanslag*; eller skriv ett enda tecken i *eller skriv ett tecken*. Identifieras automatiskt (se nedan). Om du ändrar den körs automappningen om, så tidigare ändringar försvinner. |
| **X**, **Y**, **Z** | Position. | Minst två krävs; en omappad tredje axel är 0 (datan ligger på ett plan). Samma kolumn på två axlar är ett fel. |
| **Uppåtaxel i källan** | Vilken källaxel som pekar uppåt. | *Z är upp (de flesta spelmotorer)* eller *Y är upp (grafikkonvention)*. Se [Axlar, enheter och tid](axes-units-and-time.md). |
| **Enhetsskala** | Multiplicerar varje position. | Knapparna *1 (m)* och *0,01 (cm→m)*, eller skriv ett värde. |
| **Vänd X / Vänd Y / Vänd Z** | Negerar en källaxel. | Tillämpas på positioner och på blickriktningsvektorer. |
| **Tid** | Tidsaxeln. | Valfri. Utan den finns ingen tidslinje. |
| **Tidsenhet** | Hur tidskolumnen ska läsas. | Sju enheter; se [Axlar, enheter och tid](axes-units-and-time.md#time). Ignoreras för Parquet-kolumnerna `TIMESTAMP`/`DATE`, vilket panelen säger. |
| **Person-id** | Vem eller vad en rad hör till. | Valfri. Gör spår, livstider, boxrepris och linjevärme möjliga. |
| **Session / match** | Vilken match, raid, runda, körning eller varv en rad hör till. | Valfri. Positioner interpoleras, spåras eller sammanfogas aldrig till en rutt över en sessionsgräns. Se [Sessioner, personer och grupper](sessions-persons-groups.md). |
| **Lag / grupp** | Valfri kolumn med få olika värden. | Valfri. Styr gruppfärger, lagvärme och differensuppdelningen per grupp. |
| **Blickriktning** | *Ingen*, *Gir- / nickkolumner* eller *Riktningsvektorkolumner*. | Med gir/nick: **Gir**, **Nick** och **Vinkelenhet** (*Grader* / *Radianer*). Med en vektor: **Riktning X**, **Riktning Y**, **Riktning Z**. Används för blickstrålarna i [boxrepriset](box-replay.md). |
| **Behåll för filtrering** | Extra kolumner som hålls i minnet. | En kryssruta per kolumn, och för varje ikryssad *intervall* (numerisk) eller *kategori*. Varje kostar 4 byte per rad och ett avkodningspass vid inläsningen. Bara behållna kolumner kan [filtreras](filters.md), användas för en [differensuppdelning](difference.md) eller som händelsekolumn i [linjevärme](line-heat.md). |
| **Visa exempelrader** | En tabell med de första 12 samplade raderna, alla kolumner. | För att kontrollera gissningarna. |

En ikryssad filterkolumn som inte satts uttryckligen läses som *intervall*; en id-kolumn som ser numerisk ut är ofta mer användbar som *kategori*. Bara 4 filter kan vara aktiva samtidigt ([Filter](filters.md)).

## Hur automappningen gissar {#how-the-auto-mapping-guesses}

Gissningen finns i [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Den tittar på kolumnnamn, på vilka kolumner som är numeriska i de samplade raderna (mer än 90 % av de icke-tomma värdena tolkas som tal), på hur många olika värden varje kolumn har i samplet, och på Parquets logiska typer. Namnmönster prövas i ordning, utan skillnad på stora och små bokstäver, och det första mönster som matchar någon ännu ledig kolumn vinner.

### Position {#position}

| Axel | Namnmönster, i ordning (bara numeriska kolumner) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Om en axel fortfarande är tom fyller de första lediga numeriska kolumnerna (utan `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) i den i ordning. En felaktig gissning syns tydligt på skärmen; en tom skulle lämna en tom vy.

### Tid {#time}

- **Parquets tidsstämpelkolumner först.** Bland kolumner vars logiska typ är `TIMESTAMP` eller `DATE` väljs den bästa efter poäng: +10 000 om namnet matchar ett tidsmönster, −5 000 för en vanlig `DATE`, plus antalet olika värden i samplet. Ett datum för en hel dag och en konstant sessionsstart har nästan inga olika värden, så händelsens tidpunkt vinner. Enheten blir då *Unix-tidsstämpel (ms)*.
- **Annars efter namn:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, sedan namn för förfluten tid (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Enheten gissas sedan från värdena: ISO-8601 när ett värde ser ut som `ÅÅÅÅ-MM-DDT…` eller `ÅÅÅÅ-MM-DD …`; annars efter den största storleken: över 10^17 nanosekunder, över 10^14 mikrosekunder, över 10^11 Unix-millisekunder, över 10^8 Unix-sekunder, över 10^6 millisekunder, annars sekunder.

När en kolumn för förfluten tid väljs noterar panelen att varje session då justeras till sin egen start – bra för att lägga matcher över varandra, inte för att se dem i verklig följd.

### Session, person, grupp {#session-person-group}

Sessionen tas **efter** tidsaxeln och **före** person och grupp, eftersom en sessionskolumn ofta är en tidsstämpel (matchens starttidpunkt på varje rad i matchen).

| Roll | Namnmönster, i ordning |
|---|---|
| Session | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (var och en exakt, eventuellt med `_id`) |
| Person | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, sedan `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (racingdata: bilen är det som rör sig) |
| Grupp | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Grupp, reserv | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

En gruppkandidat som har ett eget värde på de flesta samplade raderna (fler än max(48, 60 % av samplet)) är ett id, inte en grupp: den blir personkolumn om ingen hittades, och används inte som grupp. Om ingen gruppkolumn hittades alls används den icke-numeriska kolumnen med färst olika värden mellan 2 och 12.

### Blickriktning {#look-direction}

En numerisk kolumn som heter `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` eller `rot_z` / `rotation_z` växlar blickriktningen till gir/nick; nick letas efter som `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Grader antas när något samplat gir är större än 7 i belopp, annars radianer. En riktningsvektor gissas aldrig; den kommer från tipsen nedan eller från dig.

### Filterkolumner {#filter-columns}

Högst **6** kolumner behålls automatiskt, rangordnade:

1. `region`, `sessionMode`, `actor` – kolumner som finns för att filtreras på (poäng 1200);
2. kategorikolumner som varierar i samplet, med färst olika värden först (1000 minus antalet);
3. en kolumn som är konstant i samplet, men bara när flera filer läses in – den kan skilja sig mellan filerna, till exempel en region eller ett testkörnings-id (600);
4. numeriska kolumner (500).

Kolumner som redan spelar en roll, bruskolumnerna ovan, kolumner som är konstanta vid en inläsning av en enda fil, och fritextkolumner (fler än max(16, hälften av samplet) olika värden) erbjuds inte automatiskt. Vilken kolumn som helst kan ändå kryssas i för hand.

### Uppåtaxel {#up-axis}

Med alla tre axlarna mappade tas den axel med den mindre spridningen av Y och Z i samplet som upp (en karta är mycket bredare än den är hög); annars antas Z uppåt.

## Tipsen `heat3d` i en Parquet-fot {#the-heat3d-hints-in-a-parquet-footer}

En Parquet-fil kan säga hur den ska läsas. Om filens nyckel-värde-metadata i foten har en post med nyckeln **`heat3d`** tolkas dess värde som JSON och läggs ovanpå gissningarna ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). CS2-demokonverteraren skriver en sådan post, så dess tabeller öppnas med spelaren som person, sidan som grupp, varje runda som en session, blickriktning på och världen rätt vänd.

Bara den **första** filen i ett urval läses för tips. Varje post är valfri, och varje tippat värde syns fortfarande i panelen och kan ändras. En fullständig beskrivning av schemat, med ett exempel och hur man skriver det, finns i [referensen för dataformat](data-formats.md#the-heat3d-hints).

Reglerna, kortfattat:

- En kolumn som ett tips anger tillämpas bara när filen har den kolumnen.
- `lookMode: "vector"` gäller bara när `dirX`, `dirY` och `dirZ` är satta alla tre; `"yawPitch"` bara när `yaw` är satt.
- `extra`, när den finns, ersätter den automatiska filterlistan (okända namn och kolumner som redan spelar en roll tas bort); varje typ intervall/kategori följer om den såg numerisk ut. När den saknas behålls den automatiska listan minus kolumner som ett tips gav en roll.
- `axes.up` måste vara `"y"` eller `"z"`, vändningar måste vara booleska värden, `scale` måste vara positiv.
- `entity.size`, när den är positiv, är storleken på en spårad sak i filens enheter ([enhetsstorlek](sessions-persons-groups.md#entity-size)); det är det enda sättet att sätta den.

## Känt problem: att ändra CSV-avgränsaren {#known-issue-overriding-the-csv-separator}

När du ändrar avgränsaren till en annan än den identifierade ändras inte kolumnlistan och exempelraderna (förhandsvisningen delar fortfarande med den identifierade avgränsaren). Den valda avgränsaren används ändå vid själva inläsningen. Om den identifierade avgränsaren är fel:

1. Öppna filen i en textredigerare.
2. Ersätt avgränsaren med ett komma överallt (och decimalkommatecken med punkter).
3. Spara och läs sedan in filen igen.

Orsaken finns i [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
