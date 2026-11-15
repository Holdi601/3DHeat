---
title: "Sessioner, personer og grupper"
parent: "Indlæs data"
nav_order: 4
lang: "da"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sessioner, personer og grupper

En **person** er én bevægelig ting (en spiller, en bil). Et **hold/gruppe** er den side, de hører til. En **session** er én kamp eller omgang. Se [ordlisten](glossary.md).

Én række i en fil kan navngive alle tre:

| x | y | tid | spiller | hold | kamp |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` er personen, `team` er gruppen, `match` er sessionen.

Tre valgfri kolonner beskriver *hvem* og *hvor i forløbet* en række hører til. Hver kodes med ordbog ved indlæsning: tekstværdierne bliver til små heltals-id'er pr. række plus én liste med etiketter, delt over alle filer i indlæsningen.

## Person {#person}

Kolonnen **Person-id** navngiver den bevægelige ting, en række hører til: en spiller, en bot, en bil. Den gemmes som et 32-bit id pr. række.

Med en person- og en tidskolonne beregner indlæsningen hver rækkes **levetid**: tiden, til den samme persons næste prøve *i samme session*, eller "ingen" (en vagtværdi, -1), når der ingen næste prøve er - personen døde, forlod, eller loggen sluttede. Levetider driver **Levetid**-historikken i [tidslinjen](timeline.md), interpolation og forældelse i [kassereplay](box-replay.md), og rutebrydningerne i [linje-varme](line-heat.md). Hvad en række uden efterfølger gør, er en visningsindstilling (*Reservelevetid*), ikke indbygget i dataene.

Hver person får gruppen fra deres **første** række i tid; den tildeling farver deres boks i kassereplay og afgør, hvilken gruppes synlighedskontakt skjuler dem der. Varmetilstande bruger i stedet hver rækkes egen gruppe.

### Navne båret af flere ting på én gang {#names-worn-by-several-things-at-once}

Et navn er ikke altid én enhed: i nogle eksporter logger hver bot i hver kamp under ét navn. At forbinde to prøver af en sådan "person" - ved interpolation, et spor eller en rute - tegner en linje mellem to forskellige væsener hen over kortet.

Ved indlæsning ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) markeres et navn som **delt**, når to af dets poster

- er i samme session,
- har samme tid,
- er af samme slags (hver beholdt kategorikolonne har samme værdi), og
- ligger længere fra hinanden end 1 % af diagonalen i dataenes udstrækning.

Delte navne tegnes som enkelte prøver - ingen interpolation, intet spor, ingen linje-varme-rute. Alt andet om dem (deres varme) er uberørt. Datasæt-panelet lister, hvor mange navne der blev markeret, med op til tre eksempler, og kassereplay-panelet gentager tallet.

## Session {#session}

Kolonnen **Session / kamp** siger, hvilken kamp, raid, runde, løb eller omgang en række hører til. Det er den, der gør en persons prøver til ét sammenhængende spor: rigtig telemetri flettes ofte sammen med samtidige kampe, og en spillers prøve lige før afspilningshovedet og den lige efter kan være fra forskellige kampe hundredvis af meter væk. Med en sessionskolonne:

- går interpolation, spor og linje-varme-ruter aldrig over et sessionsskifte;
- ender en rækkes levetid ved enden af sin egen session;
- vises vælgeren **Session** øverst i sidepanelet, under tilstandslinjen.

En sessionskolonne er meget ofte et *tidsstempel* - kampens starttidspunkt, gentaget på hver række i kampen. Den automatiske tilknytning leder efter sessionsnavne før person og gruppe af den grund ([Kolonnetilknytning](column-mapping.md#session-person-group)). En racerrunde eller et stint er også en session: to omgange af samme bil må ikke sammenføjes til ét spor.

### Sessionsvælgeren {#the-session-picker}

![Sessionsvælgeren åben på en fil med ti kampe: Alle sessioner (10), Match 01, Match 02 og så videre](../assets/img/en/sessions-persons-groups-picker.webp)

*Ti kampe i én fil: vælg én, eller se dem alle.*

Vises, når datasættet har listede sessioner (se grænsen nedenfor).

| Del | Betydning |
|---|---|
| Etiket til højre | Den valgte sessions antal rækker, eller *alle på én gang*. |
| Menu | *Alle sessioner (N)*, derefter hver session, mest travl først, som `etiket - N rækker, spænd` (spænd i sekunder under 90 s, minutter under 90 min, timer over det). |
| Gult tip | Vises for *Alle sessioner*: positioner sammenføjes stadig aldrig på tværs af sessioner, men samtidige kampe sætter urelaterede spillere sammen på kortet. |
| Tip | Vises i varmetilstandene, når én session er valgt: valget flytter kun afspilningshovedet. |

Ved indlæsning vælges den mest travle session. Et valg af en session søger afspilningshovedet til den sessions start.

Hvad valget ændrer:

- I **[kassereplay](box-replay.md)** bestemmer det, hvilken session der afspilles: kun den sessions bokse og spor tegnes, og tidslinjens område bliver sessionens eget spænd.
- I **varmetilstandene** begrænser det ikke varmen, og et tip under vælgeren siger det: *I varmetilstandene flytter dette kun afspilningshovedet til sessionens start; varmen tæller stadig alle sessioner. Kassereplay afspiller kun den valgte session.* For at begrænse varmen til én session, behold også sessionskolonnen som filterkolonne (*Behold til filtrering*) og filtrer på den. En kolonne kan både være sessionskolonnen og en filterkolonne: indlæseren læser hver afkrydset filterkolonne for sig, uanset hvilken rolle den også spiller.

### For mange sessioner {#too-many-sessions}

Op til **100.000** sessioner listes. Derover er kolonnen egentlig et id (en mappe med millioner af sessioner på hver en håndfuld rækker), og at sende så mange etiketter fra workeren til siden er det, der får en fane til at løbe tør for hukommelse. Indlæsningen beholder så sessions-**id'erne** - så grænser håndhæves stadig overalt - men dropper etiketterne og vælgeren, og datasæt-panelet siger det.

## Gruppe {#group}

Kolonnen **Hold / gruppe** er enhver kolonne med lav kardinalitet: et hold, en side, en trop, en fraktion, et flag for spiller mod AI, en bilklasse. Den gemmes som et 16-bit id pr. række og driver:

- [Holdlisten](teams-list.md) (synlighed pr. gruppe, + / − sider),
- [holdvarme](team-heat.md) (en nuance pr. gruppe),
- [forskellen](difference.md) delt efter gruppe,
- boksfarver i [kassereplay](box-replay.md) (en nuancefamilie pr. gruppe, en tone pr. medlem).

### Grænser {#limits}

Højst **4.096** særskilte grupper. Gruppe-id'et sidder i den fjerde kanal af hver rækkes positionstexel på GPU'en, og hver gruppe behøver en texel i sign-tabellen på 4.096 bredde, som shaderen læser for at afgøre *skjult*, *tilføjet* eller *trukket fra*. En kolonne med flere særskilte værdier er et id, ikke en gruppe: **indlæsningen beholder hver række og dropper kun grupperingen**, med en advarsel på datasættet, der foreslår at kortlægge den som personkolonnen i stedet, eller behold den som filterkolonne.

Den samme grænse på 4.096 gælder for en beholdt *kategori*-filterkolonne; en bredere en beholdes ikke, og datasættet siger det. En numerisk kolonne (et tidsstempel, for eksempel) har ingen sådan grænse som *interval*-filter.

Gruppeværdierne `0`, en tom værdi, `none`, `unknown`, `null` og `-1` (uden forskel på store og små bogstaver) betyder "ingen gruppe" for [holdvarme](team-heat.md), som tegner dem neutralt grå i stedet for som en sikker farve.

## Enhedsstørrelse {#entity-size}

Hvor stor én sporet ting er - en spillers kollisionsboks, en bil - afgør, hvor store boksene og blikstrålerne i [kassereplay](box-replay.md) tegnes. Der er intet felt til det i panelet; det kommer fra filens [`heat3d`-tips](data-formats.md#the-heat3d-hints) (`entity.size`, i filens egne enheder; CS2-konverteren skriver 32). Indlæsningen ganger den med enhedsskalaen.

Ved hver indlæsning ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), hvor *udstrækning* er det største af dataenes X- og Z-spænd:

| Indstilling | Med en enhedsstørrelse | Uden |
|---|---|---|
| Kubestørrelse | enhedsstørrelse | udstrækning / 500 |
| Blikstrålens længde | enhedsstørrelse × 4 | udstrækning / 200 |
| Sprite-radius | udstrækning / 120 | udstrækning / 120 |
| Mætningspunkt | analytisk overslag (derefter målt) | samme |
| Flyvehastighed | udstrækning / 12 | samme |
| Fjernplan | udstrækning × 12 | samme |
| Nærplan | max(0,05; udstrækning / 20.000) | samme |

## Datasæt-panelet {#the-dataset-panel}

Under Kilde-panelet. Når et datasæt er indlæst, viser det:

- datasættets **navn** - valget, antal rækker, antal filer, springet når et var brugt;
- **`N hold · N personer · Ns spænd`**;
- hver **advarsel** indlæsningen gav, i gult, så længe datasættet er indlæst: grupper eller en filterkolonne droppet pga. for mange værdier, sessioner ikke listet, delte navne, manglende rækker, filer sprunget over;
- den [syntetiske generator](synthetic-generator.md);
- **Fjern fra hukommelsen**, som fjerner datasættet.

Antallet af rækker vises i panelets overskrift.
