---
title: "Teamwarmte"
parent: "Warmtemodi"
nav_order: 6
lang: "nl"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: false
---

# Teamwarmte

Teamwarmte toont waar elk team was, elk team in zijn eigen kleur. Waar teams overlappen mengen de kleuren.

**Teamwarmte** (toets 3) is het dichtheidsveld van [Warmte](heat.md) met aan elke [groep](glossary.md) een eigen tint. Waar groepen overlappen mengen hun tinten; een gelijke strijd komt neutraal uit. De dekking draagt de dichtheid nog precies zoals in de andere modi, dus het beeld antwoordt tegelijk op *hoeveel* en *van wie*. Het heeft een groepskolom nodig.

![Teamwarmte: elke kant in zijn eigen kleur; waar ze overlappen mengen de kleuren](../assets/img/en/heat-teams.webp)

Het is niet de [figurenoverlay](box-replay.md): die tekent één figuur per persoon; dit is een warmteveld dat met dezelfde kolom gekleurd is.

## Zo gebruik je het {#how-to-use-it}

1. Druk op `3` (of kies **Teamwarmte** in de modusbalk).
2. Open **Heatmapkleuren**. De stalen tonen de kleur van elke groep; wijs een staal aan voor de naam van het team.
3. Als alles grijs lijkt, verhoog dan **Kleurscheiding**.
4. Vink een groep uit in de [Teamlijst](teams-list.md) om haar weg te halen; de andere kleuren blijven waar ze waren.

## Regelaars {#controls}

In het gedeelte **Heatmapkleuren**:

| Regelaar | Standaard | Betekenis |
|---|---|---|
| Stalen | | De kleur van elke groep, voor de eerste 12 groepen, daarna *+N meer*. Wijs aan voor de groepsnaam en de kleur. |
| **Kleurscheiding** | 1,4 | Hoe ver een mengsel van neutraal weggeduwd wordt, 0-4. 0 maakt alles grijs; 1 is het echte gemiddelde; voorbij ongeveer 2 verlaten de helderste mengsels het weergeefbare bereik en worden ze per kanaal afgekapt, wat hun tint verschuift. |
| **Dekkingsverloop (de kleur komt van de groep)** | het standaard warmteverloop | Alleen de **alfa** van het verloop wordt hier gebruikt: transparant waar niets is, ondoorzichtig bovenaan. De kleuren ervan worden genegeerd. |

Alle andere warmteregelaars - vorm, verzadiging, respons, minimale intensiteit, diepte, culling - werken zoals in [Warmte](heat.md).

De [Teamlijst](teams-list.md) toont in deze modus de teamwarmtekleur van elke groep als staal. Het verbergen van een groep laat de kleur van elke andere groep waar ze was: tinten komen uit het totale aantal groepen, niet uit wat aan staat, zodat twee beelden vergelijkbaar blijven.

## Het palet {#the-palette}

Uit [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Kleuren leven op het **Oklab**-kleurvlak bij een vaste helderheid (0,7) en chroma (0,115), zodat elke groep even helder is en een rode groep niet heter lijkt dan een blauwe.
- Bij *n* groepen wordt de tintencirkel in *n* gelijke delen verdeeld en krijgt groep *i* het **midden** van zijn deel, `(i + 0,5) / n` van een omwenteling. Elke twee groepen liggen zo ver uit elkaar als het aantal toelaat, en tegenovergestelden blijven tegenovergesteld, wat het aantal ook is.
- Er worden hoogstens **16** verschillende tinten gebruikt. Bij meer groepen worden id's geplaatst door herhaald halveren (bit-omgekeerde id's: 0, ½, ¼, ¾, ⅛, …) zodat buurgroepen geen tint delen; groepen voorbij 16 delen er noodzakelijk een.
- Een groep waarvan het label "geen groep" betekent - `0`, leeg, `none`, `unknown`, `null` of `-1`, ongeacht hoofdletters - wordt **neutraal grijs** getekend in plaats van een plak van de cirkel te nemen. Alleen het eerste zo'n label in de groepslijst wordt zo behandeld.

De standaardscheiding is 1,4 in plaats van 1, omdat bij 1 een mengsel van vijf gelijkmatig verspreide tinten *grijs* is: correct en onleesbaar. Iets boven 1 houdt gelijke stand eerlijk en maakt toch een verdeling van 60/40 zichtbaar.

## Hoe het werkt {#how-it-works}

Het warmtedoel heeft in deze modus vier kanalen. Elke sprite telt zijn dichtheid *v* op bij het eerste kanaal en *v* × de Oklab-coördinaten *a* en *b* van de groep bij het tweede en derde. Bij het samenstellen is het mengsel van een pixel het door dichtheid gewogen gemiddelde: *a* = G / R, *b* = B / R, geschaald met de kleurscheiding en omgezet naar sRGB bij de helderheid van het palet. Delen door de geaccumuleerde dichtheid houdt de tint onafhankelijk van hoeveel data er is, en daarom blijft elke dichtheidsregelaar alleen op de dekking werken.

Het doel met vier kanalen kost bij dezelfde resolutie vier keer zoveel GPU-geheugen als het warmtedoel met één kanaal.
