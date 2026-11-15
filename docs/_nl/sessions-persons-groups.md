---
title: "Sessies, personen en groepen"
parent: "Gegevens binnenhalen"
nav_order: 4
lang: "nl"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sessies, personen en groepen

Een **persoon** is één bewegend ding (een speler, een auto). Een **team/groep** is de kant waar ze bij horen. Een **sessie** is één match of ronde. Zie de [woordenlijst](glossary.md).

Eén rij van een bestand kan alle drie noemen:

| x | y | tijd | speler | team | match |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` is de persoon, `team` is de groep, `match` is de sessie.

Drie optionele kolommen beschrijven *wie* en *waar in het verhaal* een rij bij hoort. Elk wordt bij het laden als woordenlijst gecodeerd: de tekstwaarden worden per rij kleine gehele id's, plus één lijst met labels, gedeeld over elk bestand van de load.

## Persoon {#person}

De kolom **Persoons-ID** noemt het bewegende ding waar een rij bij hoort: een speler, een bot, een auto. Het wordt per rij als 32-bits id opgeslagen.

Met een persoons- en een tijdkolom berekent de load de **levensduur** van elke rij: de tijd tot het volgende monster van dezelfde persoon *in dezelfde sessie*, of "geen" (een markering, -1) als er geen volgend monster is - de persoon stierf, vertrok, of het logboek eindigde. Levensduren drijven de geschiedenis **Levensduur** van de [tijdlijn](timeline.md), interpolatie en verouderen in de [boxreplay](box-replay.md), en de routebreuken van [lijnwarmte](line-heat.md). Wat een rij zonder opvolger doet, is een weergave-instelling (*Terugvalduur*), niet vastgelegd in de data.

Elke persoon krijgt de groep van zijn **eerste** rij in de tijd; die toewijzing kleurt zijn vak in de boxreplay en bepaalt welke zichtbaarheidsschakelaar van een groep hem daar verbergt. De warmtemodi gebruiken in plaats daarvan de eigen groep van elke rij.

### Namen die door meerdere dingen tegelijk gedragen worden {#names-worn-by-several-things-at-once}

Een naam is niet altijd één entiteit: in sommige exports logt elke bot van elke match onder één naam. Het verbinden van twee monsters van zo'n "persoon" - door interpolatie, een spoor of een route - trekt een lijn tussen twee verschillende wezens over de kaart.

Bij het laden ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) wordt een naam als **gedeeld** gemarkeerd wanneer twee records ervan

- in dezelfde sessie zitten,
- dezelfde tijd hebben,
- van dezelfde soort zijn (elke bewaarde categoriekolom heeft dezelfde waarde), en
- verder uit elkaar liggen dan 1% van de diagonaal van de omvang van de data.

Gedeelde namen worden getekend als losse monsters - geen interpolatie, geen spoor, geen route van lijnwarmte. Al het andere over hen (hun warmte) blijft ongewijzigd. Het paneel Dataset toont hoeveel namen zo gemarkeerd zijn, met tot drie voorbeelden, en het paneel boxreplay herhaalt het aantal.

## Sessie {#session}

De kolom **Sessie / match** zegt bij welke match, raid, ronde, run of rondje een rij hoort. Daardoor vormen de monsters van een persoon één doorlopend spoor: echte telemetrie laat vaak gelijktijdige matches door elkaar lopen, en een monster van een speler net vóór de afspeelkop en dat net erna kunnen uit verschillende matches honderden meters uit elkaar komen. Met een sessiekolom:

- kruisen interpolatie, sporen en routes van lijnwarmte nooit een sessiewissel;
- eindigt de levensduur van een rij aan het einde van zijn eigen sessie;
- verschijnt de **Sessie**-kiezer bovenaan de zijbalk, onder de modusbalk.

Een sessiekolom is heel vaak een *tijdstempel* - het startmoment van de match, herhaald op elke rij van die match. De automatische toewijzing zoekt om die reden sessienamen vóór persoon en groep ([Kolomtoewijzing](column-mapping.md#session-person-group)). Een racerondje of een stint is ook een sessie: twee rondes van dezelfde auto mogen niet tot één spoor worden samengevoegd.

### De sessiekiezer {#the-session-picker}

![De sessiekiezer open op een bestand van tien matches: Alle sessies (10), Match 01, Match 02 en zo verder](../assets/img/en/sessions-persons-groups-picker.webp)

*Tien matches in één bestand: kies er één of bekijk ze allemaal.*

Wordt getoond als de dataset vermelde sessies heeft (zie de grens hieronder).

| Onderdeel | Betekenis |
|---|---|
| Label rechts | Het aantal rijen van de gekozen sessie, of *allemaal tegelijk*. |
| Menu | *Alle sessies (N)*, dan elke sessie, drukste eerst, als `label - N rijen, bereik` (bereik in seconden onder 90 s, minuten onder 90 min, uren daarboven). |
| Oranje hint | Getoond bij *Alle sessies*: posities worden nog steeds nooit over sessies heen verbonden, maar gelijktijdige matches zetten niet-verwante spelers samen op de kaart. |
| Hint | Getoond in de warmtemodi als één sessie gekozen is: de keuze verplaatst alleen de afspeelkop. |

Bij het laden wordt de drukste sessie gekozen. Een sessie kiezen zet de afspeelkop op het begin van die sessie.

Wat de keuze verandert:

- In de **[boxreplay](box-replay.md)** bepaalt ze welke sessie wordt afgespeeld: alleen de vakken en sporen van die sessie worden getekend, en het bereik van de tijdlijn wordt het eigen bereik van de sessie.
- In de **warmtemodi** beperkt ze de warmte niet, en een hint onder de kiezer zegt dat: *In de warmtemodi verplaatst dit alleen de afspeelkop naar het begin van de sessie; de warmte telt nog steeds elke sessie mee. Boxreplay speelt alleen de gekozen sessie af.* Om de warmte tot één sessie te beperken, houd je de sessiekolom ook als filterkolom (*Bewaren om te filteren*) en filter je erop. Een kolom mag zowel de sessiekolom als een filterkolom zijn: de lader leest elke aangevinkte filterkolom op zichzelf, welke rol die ook verder speelt.

### Te veel sessies {#too-many-sessions}

Tot **100.000** sessies worden vermeld. Daarboven is de kolom eigenlijk een id (een map met miljoenen sessies van elk een handvol rijen), en zoveel labels van de worker naar de pagina sturen is wat een tabblad het geheugen laat opgebruiken. De load houdt dan de sessie-**id's** - zodat de grenzen nog steeds overal gelden - maar laat de labels en de kiezer weg, en het paneel Dataset zegt dat.

## Groep {#group}

De kolom **Team / groep** is elke kolom met weinig verschillende waarden: een team, een kant, een squad, een factie, een speler-tegen-AI-vlag, een autoklasse. Ze wordt per rij als 16-bits id opgeslagen en stuurt:

- de [Teamlijst](teams-list.md) (zichtbaarheid per groep, + / − kanten),
- [teamwarmte](team-heat.md) (een tint per groep),
- de [verschilverdeling](difference.md) per groep,
- de vakkleuren in de [boxreplay](box-replay.md) (een tintenfamilie per groep, een schakering per lid).

### Grenzen {#limits}

Hoogstens **4.096** verschillende groepen. Het groeps-id zit in het vierde kanaal van het positietexel van elke rij op de GPU, en elke groep heeft een texel nodig in de tekentabel van 4.096 breed die de shader leest om te beslissen *verborgen*, *opgeteld* of *afgetrokken*. Een kolom met meer verschillende waarden is een id, geen groep: **de load houdt elke rij en laat alleen de groepering weg**, met een waarschuwing bij de dataset die voorstelt die kolom als persoonskolom toe te wijzen, of als filterkolom te bewaren.

Dezelfde grens van 4.096 geldt voor een bewaarde *categorie*-filterkolom; een bredere wordt niet bewaard en de dataset zegt dat. Een numerieke kolom (bijvoorbeeld een tijdstempel) heeft zo'n grens niet als *bereik*-filter.

De groepswaarden `0`, een lege waarde, `none`, `unknown`, `null` en `-1` (hoofdletterongevoelig) betekenen voor [teamwarmte](team-heat.md) "geen groep": die worden neutraal grijs getekend in plaats van in een zelfverzekerde kleur.

## Entiteitsgrootte {#entity-size}

Hoe groot één gevolgd ding is - de botsingsdoos van een speler, een auto - bepaalt hoe groot de vakken en kijkstralen van de [boxreplay](box-replay.md) getekend worden. Er is geen veld voor in het paneel; het komt uit de [`heat3d`-hints](data-formats.md#the-heat3d-hints) van het bestand (`entity.size`, in de eigen eenheden van het bestand; de CS2-converter schrijft 32). De load vermenigvuldigt het met de eenheidsschaal.

Bij elke load ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), met *omvang* de grootste van de X- en Z-spanne van de data:

| Instelling | Met een entiteitsgrootte | Zonder |
|---|---|---|
| Kubusgrootte | entiteitsgrootte | omvang / 500 |
| Lengte kijkstraal | entiteitsgrootte × 4 | omvang / 200 |
| Spritestraal | omvang / 120 | omvang / 120 |
| Verzadigingspunt | analytische schatting (daarna gemeten) | hetzelfde |
| Vliegsnelheid | omvang / 12 | hetzelfde |
| Verre vlak | omvang × 12 | hetzelfde |
| Nabije vlak | max(0,05; omvang / 20.000) | hetzelfde |

## Het paneel Dataset {#the-dataset-panel}

Onder het paneel Bron. Met een geladen dataset toont het:

- de **naam** van de dataset - de selectie, het aantal rijen, het aantal bestanden, de stap als er een gebruikt is;
- **`N teams · N personen · Ns bereik`**;
- elke **waarschuwing** die de load gaf, in oranje, zolang de dataset geladen is: groepen of een filterkolom weggelaten wegens te veel waarden, sessies niet vermeld, gedeelde namen, ontbrekende rijen, overgeslagen bestanden;
- de [synthetische generator](synthetic-generator.md);
- **Verwijderen uit geheugen**, dat de dataset verwijdert.

Het aantal rijen wordt getoond in de kop van het paneel.
