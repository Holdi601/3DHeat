---
title: "Sessioner, personer och grupper"
parent: "Läsa in data"
nav_order: 4
lang: "sv"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sessioner, personer och grupper

En **person** är en sak som rör sig (en spelare, en bil). En **lag/grupp** är sidan de tillhör. En **session** är en match eller ett varv. Se [ordlistan](glossary.md).

En rad i en fil kan ange alla tre:

| x | y | tid | player | team | match |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` är personen, `team` är gruppen, `match` är sessionen.

Tre valfria kolumner beskriver *vem* och *var i förloppet* en rad hör till. Var och en kodas som ordbok vid inläsningen: textvärdena blir små heltalsid per rad plus en lista med etiketter, delad över alla filer i inläsningen.

## Person {#person}

Kolumnen **Person-id** anger den rörliga sak som en rad hör till: en spelare, en bot, en bil. Den lagras som ett 32-bitars id per rad.

Med en person- och en tidskolumn räknar inläsningen fram varje rads **livstid**: tiden tills samma persons nästa sampling *i samma session*, eller "ingen" (ett värde, −1) när det inte finns någon nästa sampling – personen dog, lämnade eller loggen tog slut. Livstider driver historiken **Livstid** i [tidslinjen](timeline.md), interpolation och inaktualitet i [boxrepriset](box-replay.md) och rutt-avbrotten i [linjevärme](line-heat.md). Vad en rad utan efterträdare gör är en visningsinställning (*Reservlivstid*), inte inbakat i datan.

Varje person får gruppen för sin **första** rad i tid; den tilldelningen färgar deras låda i boxrepriset och avgör vilken grupps synlighetsväxling som döljer dem där. Värmelägena använder i stället varje rads egen grupp.

### Namn som bärs av flera saker samtidigt {#names-worn-by-several-things-at-once}

Ett namn är inte alltid en enda enhet: i en del exporter loggas varje bot i varje match under ett och samma namn. Om man kopplar ihop två samplingar av en sådan "person" – genom interpolation, ett spår eller en rutt – ritas en linje mellan två olika varelser över kartan.

Vid inläsningen ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) markeras ett namn som **delat** när två poster med det namnet

- ligger i samma session,
- har samma tid,
- är av samma slag (varje behållen kategorikolumn har samma värde), och
- ligger längre ifrån varandra än 1 % av datans utsträckningsdiagonal.

Delade namn ritas som enskilda samplingar – ingen interpolation, inget spår, ingen linjevärmerutt. Allt annat om dem (deras värme) påverkas inte. Panelen Datamängd listar hur många namn som markerades, med upp till tre exempel, och boxreprisets panel upprepar antalet.

## Session {#session}

Kolumnen **Session / match** säger vilken match, raid, runda, körning eller varv en rad hör till. Det är den som gör en persons samplingar till ett enda obrutet spår: verklig telemetri vävs ofta ihop med samtidiga matcher, och en spelares sampling strax före uppspelningshuvudet och den strax efter kan komma från olika matcher hundratals meter från varandra. Med en sessionskolumn:

- korsar interpolation, spår och linjevärmerutter aldrig en sessionsgräns;
- en rads livstid slutar vid slutet av sin egen session;
- väljaren **Session** visas överst i sidofältet, under lägesraden.

En sessionskolumn är mycket ofta en *tidsstämpel* – matchens starttidpunkt, upprepad på varje rad i matchen. Automappningen letar därför efter sessionsnamn före person och grupp ([Kolumnmappning](column-mapping.md#session-person-group)). Ett racingvarv eller en stint är också en session: två varv av samma bil får inte sammanfogas till ett spår.

### Väljaren Session {#the-session-picker}

![Väljaren Session öppen på en fil med tio matcher: Alla sessioner (10), Match 01, Match 02 och så vidare](../assets/img/en/sessions-persons-groups-picker.webp)

*Tio matcher i en fil: välj en, eller se alla.*

Visas när datamängden har listade sessioner (se gränsen nedan).

| Del | Betydelse |
|---|---|
| Etikett till höger | Den valda sessionens antal rader, eller *alla på en gång*. |
| Meny | *Alla sessioner (N)*, sedan varje session, mest aktiva först, som `etikett - N rader, spann` (spannet i sekunder under 90 s, minuter under 90 min, timmar över det). |
| Gul ledtråd | Visas för *Alla sessioner*: positioner kopplas fortfarande aldrig ihop över sessioner, men samtidiga matcher lägger orelaterade spelare på kartan tillsammans. |
| Ledtråd | Visas i värmelägena när en session är vald: valet flyttar bara uppspelningshuvudet. |

Vid inläsningen väljs den mest aktiva sessionen. Att välja en session flyttar uppspelningshuvudet till den sessionens start.

Vad valet ändrar:

- I **[boxrepriset](box-replay.md)** avgör det vilken session som spelas upp: bara den sessionens lådor och spår ritas, och tidslinjens intervall blir sessionens eget spann.
- I **värmelägena** begränsar det inte värmen, och en ledtråd under väljaren säger det: *I värmelägena flyttar det här bara uppspelningshuvudet till sessionens start; värmen räknar fortfarande alla sessioner. Boxrepriset spelar bara upp den valda sessionen.* För att begränsa värmen till en session, behåll även sessionskolumnen som filterkolumn (*Behåll för filtrering*) och filtrera på den. En kolumn kan vara både sessionskolumn och filterkolumn: inläsaren läser varje ikryssad filterkolumn för sig, oavsett vilken roll den också spelar.

### För många sessioner {#too-many-sessions}

Upp till **100 000** sessioner listas. Därutöver är kolumnen egentligen ett id (en mapp med miljontals sessioner med några rader var), och att skicka så många etiketter från arbetaren till sidan är vad som får en flik att ta slut på minne. Inläsningen behåller då sessions-**id:na** – så gränserna respekteras fortfarande överallt – men tar bort etiketterna och väljaren, och panelen Datamängd säger det.

## Grupp {#group}

Kolumnen **Lag / grupp** är vilken kolumn som helst med få olika värden: ett lag, en sida, en trupp, en fraktion, en flagga för spelare mot AI, en bilklass. Den lagras som ett 16-bitars id per rad och driver:

- [lagslistan](teams-list.md) (synlighet per grupp, + / − för sidor),
- [lagvärme](team-heat.md) (en nyans per grupp),
- [differensen](difference.md) uppdelad per grupp,
- lådfärger i [boxrepriset](box-replay.md) (en nyansfamilj per grupp, en ton per medlem).

### Gränser {#limits}

Högst **4 096** olika grupper. Grupp-id:t ligger i den fjärde kanalen i varje rads positionstexel på grafikkortet, och varje grupp behöver en texel i den 4 096 breda teckentabellen som shadern läser för att avgöra *dold*, *tillagd* eller *subtraherad*. En kolumn med fler olika värden är ett id, inte en grupp: **inläsningen behåller varje rad och tar bara bort grupperingen**, med en varning på datamängden som föreslår att kolumnen mappas som personkolumn i stället, eller behålls som filterkolumn.

Samma gräns på 4 096 gäller för en behållen *kategori*-filterkolumn; en bredare sådan behålls inte, och datamängden säger det. En numerisk kolumn (en tidsstämpel, till exempel) har ingen sådan gräns som *intervall*-filter.

Grupp-värdena `0`, ett tomt värde, `none`, `unknown`, `null` och `-1` (oberoende av versaler) betyder "ingen grupp" för [lagvärme](team-heat.md), som ritar dem neutralt grå i stället för som en säker färg.

## Enhetsstorlek {#entity-size}

Hur stor en spårad sak är – en spelares kollisionslåda, en bil – avgör hur stora boxarna och blickstrålarna i [boxrepriset](box-replay.md) ritas. Det finns inget fält för det i panelen; det kommer från filens [`heat3d`-tips](data-formats.md#the-heat3d-hints) (`entity.size`, i filens egna enheter; CS2-konverteraren skriver 32). Inläsningen multiplicerar det med enhetsskalan.

Vid varje inläsning ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), där *utsträckning* är det större av datans X- och Z-spann:

| Inställning | Med en enhetsstorlek | Utan |
|---|---|---|
| Kubstorlek | enhetsstorlek | utsträckning / 500 |
| Blickstrålens längd | enhetsstorlek × 4 | utsträckning / 200 |
| Sprite-radie | utsträckning / 120 | utsträckning / 120 |
| Mättnadspunkt | analytisk uppskattning (sedan mätt) | samma |
| Flyghastighet | utsträckning / 12 | samma |
| Fjärran-plan | utsträckning × 12 | samma |
| Närplan | max(0.05, utsträckning / 20 000) | samma |

## Panelen Datamängd {#the-dataset-panel}

Under panelen Källa. Med en datamängd inläst visar den:

- datamängdens **namn** – urvalet, antalet rader, antalet filer, gallringssteget när ett användes;
- **`N lag · N personer · Ns spann`**;
- varje **varning** som inläsningen gav, i gult, så länge datamängden är inläst: grupper eller en filterkolumn bortplockade för att de har för många värden, sessioner som inte listas, delade namn, saknade rader, överhoppade filer;
- [den syntetiska generatorn](synthetic-generator.md);
- **Ta bort**, som tar bort datamängden.

Antalet rader visas i panelens rubrik.
