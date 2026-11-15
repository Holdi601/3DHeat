---
title: "Økter, personer og grupper"
parent: "Få inn data"
nav_order: 4
lang: "no"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Økter, personer og grupper

En **person** er ett bevegelig objekt (en spiller, en bil). En **lag/gruppe** er siden de hører til. En **økt** er én kamp eller runde. Se [ordlisten](glossary.md).

En rad i en fil kan nevne alle tre:

| x | y | tid | spiller | lag | kamp |
|---|---|---|---|---|---|
| 10,5 | -30,2 | 12,0 | Blue 1 | Blue | Kamp 01 |

`spiller` er personen, `lag` er gruppen, `kamp` er økten.

Tre valgfrie kolonner beskriver *hvem* og *hvor i historien* en rad hører til. Hver kodes med ordbok ved innlasting: tekstverdiene blir små heltalls-ID-er per rad, pluss én liste med etiketter, delt over alle filene i innlastingen.

## Person {#person}

Kolonnen **Person-ID** nevner det bevegelige objektet en rad hører til: en spiller, en bot, en bil. Den lagres som en 32-bit ID per rad.

Med en person- og en tidskolonne regner innlastingen ut hver rads **levetid**: tiden til samme persons neste prøve *i samme økt*, eller «ingen» (en markør, -1) når det ikke finnes noen neste prøve – personen døde, forlot, eller loggen tok slutt. Levetider driver **Levetid**-historikken i [tidslinjen](timeline.md), interpolasjon og utdaterte posisjoner i [boksreprisen](box-replay.md), og rutebrudd i [linjevarme](line-heat.md). Hva en rad uten etterfølger gjør, er en visningsinnstilling (*Reserve-levetid*), ikke innbakt i dataene.

Hver person får gruppen til sin **første** rad i tid; den tildelingen farger boksen deres i boksreprisen og bestemmer hvilken gruppes synlighetsbryter som skjuler dem der. Varmemodiene bruker hver rads egen gruppe i stedet.

### Navn som flere ting bærer samtidig {#names-worn-by-several-things-at-once}

Et navn er ikke alltid én enhet: i noen eksporter logger hver bot i hver kamp under ett navn. Å sette sammen to prøver av en slik «person» – ved interpolasjon, et spor eller en rute – tegner en linje mellom to forskjellige skapninger over kartet.

Ved innlasting ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) markeres et navn som **delt** når to poster med det navnet

- er i samme økt,
- har samme tid,
- er av samme slag (hver beholdt kategorikolonne har samme verdi), og
- ligger lenger fra hverandre enn 1 % av diagonalen i dataenes utstrekning.

Delte navn tegnes som enkeltprøver – ingen interpolasjon, ingen spor, ingen linjevarmerute. Alt annet om dem (varmen deres) påvirkes ikke. Datasett-panelet lister hvor mange navn som ble markert, med opptil tre eksempler, og boksreprisens panel gjentar antallet.

## Økt {#session}

Kolonnen **Økt / kamp** sier hvilken kamp, raid, runde, løp eller runde en rad hører til. Det er den som gjør at en persons prøver blir ett sammenhengende spor: ekte telemetri flettes ofte sammen med samtidige kamper, og en spillers prøve rett før avspillingshodet og den rett etter kan være fra ulike kamper hundrevis av meter fra hverandre. Med en øktkolonne:

- interpolerer, sporer og linjevarmeruter aldri over en øktgrense;
- en rads levetid slutter ved slutten av sin egen økt;
- vises **Økt**-velgeren øverst i sidestolpen, under modusraden.

En øktkolonne er svært ofte et *tidsstempel* – kampens starttidspunkt, gjentatt på hver rad i kampen. Det er derfor den automatiske tilordningen ser etter øktnavn før person og gruppe ([Kolonnetilordning](column-mapping.md#session-person-group)). Et løp eller en stint i racing er også en økt: to runder av samme bil må ikke settes sammen til ett spor.

### Økt-velgeren {#the-session-picker}

![Økt-velgeren åpnet på en fil med ti kamper: Alle økter (10), Kamp 01, Kamp 02 og så videre](../assets/img/en/sessions-persons-groups-picker.webp)

*Ti kamper i én fil: velg én, eller se dem alle.*

Vises når datasettet har listede økter (se grensen under).

| Del | Betydning |
|---|---|
| Etikett til høyre | Den valgte øktens antall rader, eller *alle samtidig*. |
| Meny | *Alle økter (N)*, deretter hver økt, travleste først, som `etikett - N rader, spenn` (spenn i sekunder under 90 s, minutter under 90 min, timer over det). |
| Gul hint | Vises for *Alle økter*: posisjoner settes fortsatt aldri sammen over økter, men samtidige kamper legger urelaterte spillere sammen på kartet. |
| Hint | Vises i varmemodiene når én økt er valgt: valget flytter bare avspillingshodet. |

Ved innlasting velges den travleste økten. Å velge en økt flytter avspillingshodet til øktens start.

Hva valget endrer:

- I **[boksreprisen](box-replay.md)** avgjør det hvilken økt som spilles av: bare den øktens bokser og spor tegnes, og tidslinjens område blir øktens eget spenn.
- I **varmemodiene** begrenser det ikke varmen, og et hint under velgeren sier det: *I varmemodiene flytter dette bare avspillingshodet til øktens start; varmen teller fortsatt alle økter. Boksreprisen spiller bare den valgte økten.* For å begrense varmen til én økt, behold også øktkolonnen som filterkolonne (*Behold for filtrering*) og filtrer på den. En kolonne kan være både øktkolonnen og en filterkolonne: innleseren leser hver avkrysset filterkolonne for seg selv, uansett hvilken rolle den også spiller.

### For mange økter {#too-many-sessions}

Opptil **100 000** økter listes. Utover det er kolonnen egentlig en ID (en mappe med millioner av økter på noen få rader hver), og å sende så mange etiketter fra arbeideren til siden er det som får en fane til å gå tom for minne. Innlastingen beholder da øktens **ID-er** – så grensene håndheves fortsatt overalt – men dropper etikettene og velgeren, og datasett-panelet sier det.

## Gruppe {#group}

Kolonnen **Lag / gruppe** er enhver kolonne med få ulike verdier: et lag, en side, en tropp, en fraksjon, et spiller-mot-KI-flagg, en bilklasse. Den lagres som en 16-bit ID per rad og driver:

- [Lagliste](teams-list.md) (synlighet per gruppe, + / − for sider),
- [lagvarme](team-heat.md) (en fargetone per gruppe),
- [differansedelingen](difference.md) etter gruppe,
- boksfarger i [boksreprisen](box-replay.md) (en fargefamilie per gruppe, en nyanse per medlem).

### Grenser {#limits}

Høyst **4 096** ulike grupper. Gruppe-ID-en ligger i fjerde kanal i hver rads posisjonsbit på grafikkortet, og hver gruppe trenger en bit i fortegnstabellen på 4 096 bredde som skyggeren leser for å avgjøre *skjult*, *lagt til* eller *trukket fra*. En kolonne med flere ulike verdier er en ID, ikke en gruppe: **innlastingen beholder hver rad og dropper bare grupperingen**, med en advarsel på datasettet som foreslår å tilordne den som personkolonne i stedet, eller å beholde den som filterkolonne.

Den samme grensen på 4 096 gjelder for en beholdt *kategori*-filterkolonne; en bredere en beholdes ikke, og datasettet sier det. En numerisk kolonne (et tidsstempel, for eksempel) har ingen slik grense som *område*-filter.

Gruppeverdiene `0`, en tom verdi, `none`, `unknown`, `null` og `-1` (uten hensyn til store og små bokstaver) betyr «ingen gruppe» for [lagvarme](team-heat.md), som tegner dem nøytralt grå i stedet for en sikker farge.

## Enhetsstørrelse {#entity-size}

Hvor stort ett sporet objekt er – en spillers kollisjonsboks, en bil – avgjør hvor store boksene og blikkstrålene i [boksreprisen](box-replay.md) tegnes. Det finnes ikke noe felt for det i panelet; det kommer fra filens [`heat3d`-hint](data-formats.md#the-heat3d-hints) (`entity.size`, i filens egne enheter; CS2-konverteren skriver 32). Innlastingen ganger det med enhetsskalaen.

Ved hver innlasting ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), med *utstrekning* som det største av dataenes X- og Z-spenn:

| Innstilling | Med enhetsstørrelse | Uten |
|---|---|---|
| Kubestørrelse | enhetsstørrelse | utstrekning / 500 |
| Blikkstrålens lengde | enhetsstørrelse × 4 | utstrekning / 200 |
| Sprite-radius | utstrekning / 120 | utstrekning / 120 |
| Metningspunkt | analytisk estimat (deretter målt) | samme |
| Flyhastighet | utstrekning / 12 | samme |
| Fjernplan | utstrekning × 12 | samme |
| Nærplan | maks(0,05; utstrekning / 20 000) | samme |

## Datasett-panelet {#the-dataset-panel}

Under Kilde-panelet. Med et datasett lastet viser det:

- datasettets **navn** – utvalget, antall rader, antall filer, nedsamplingsfaktoren når en ble brukt;
- **`N lag · N personer · N s spenn`**;
- hver **advarsel** innlastingen ga, i gult, så lenge datasettet er lastet: grupper eller en filterkolonne droppet for mange verdier, økter som ikke listes, delte navn, manglende rader, hoppede filer;
- [den syntetiske generatoren](synthetic-generator.md);
- **Last ut**, som fjerner datasettet.

Radantallet vises i panelets overskrift.
