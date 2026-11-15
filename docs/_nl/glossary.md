---
title: "Woordenlijst"
nav_order: 24
lang: "nl"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: false
---

# Woordenlijst

Korte betekenissen van de woorden die deze site gebruikt, in gewone taal. Elk lemma linkt naar de pagina die het volledig uitlegt.

## Data {#data}

**Rij.** Eén regel van je data: één ding dat op één plek en tijd gebeurde, bijvoorbeeld "speler 7 was hier op seconde 12". De viewer tekent elke rij. [Gegevensformaten](data-formats.md)

**Kolom.** Één soort waarde in de rijen, zoals x, y, z, tijd of team. De viewer raadt welke kolom welke is, en je kunt de gok wijzigen. [Kolomtoewijzing](column-mapping.md)

**CSV.** Een tabel in gewone tekst: één rij per regel, waarden gescheiden door komma's. Bijna elk programma kan er één schrijven. [Bestanden laden](loading-files.md)

**Parquet.** Een compact tabelbestand dat snel te lezen is, zelfs met miljoenen rijen. Het is het beste formaat om aan de viewer te geven. [Bestanden laden](loading-files.md)

**Gebeurtenis.** Iets dat gebeurde, zoals een schot, een treffer, een kill of een opstijging. Een rij kan een gebeurtenis zijn, of gewoon "ik was hier". [Filters](filters.md)

**Persoon.** Degene die de rijen maakte: een speler, een piloot, een auto of een tank. Eén persoon is één lijn van posities door de tijd. [Sessies, personen en groepen](sessions-persons-groups.md)

**Groep (team).** Een verzameling personen die in dezelfde kleur getoond worden, bijvoorbeeld Blauw en Rood. [Sessies, personen en groepen](sessions-persons-groups.md)

**Sessie (wedstrijd, ronde).** Eén keer spelen. Een wedstrijd of een ronde is een sessie. De viewer kan één sessie tonen of er veel over elkaar leggen. [Sessies, personen en groepen](sessions-persons-groups.md)

**Niveau.** De 3D-kaart waar de data zich afspeelde: grond, gebouwen, muren. Rijen verschijnen waar ze op het niveau gebeurden. [Niveaus en achtergrondgeometrie](levels.md)

## De data bekijken {#looking-at-the-data}

**Heatmap.** Een beeld waarin plekken die door veel rijen geraakt worden feller gloeien. Koude plekken zijn rustig, hete plekken zijn druk. [Warmte](heat.md)

**Warmte.** Hoeveel er op een plek gebeurde. De viewer telt de gloed van elke rij op elke plek op; de som is de warmte. [Warmte](heat.md)

**Sprite.** De kleine gloeiende vlek die de viewer voor één rij tekent. Veel overlappende sprites tellen op tot warmte. [Vorm van sprite](sprite-shape.md)

**Belichting.** Hoe helder het beeld is. Net als bij een camera maakt te veel belichting alles wit en verbergt te weinig de details. [Kleur en belichting](colour-and-exposure.md)

**Verzadiging.** De hoeveelheid warmte die telt als "even heet als de kleuren kunnen". Verlaag hem om rustige plekken zichtbaar te maken; verhoog hem om alleen het heetst te zien. [Kleur en belichting](colour-and-exposure.md)

**Volume.** Een doos of vorm die je in de 3D-weergave plaatst. De viewer telt wat erin zit en kan volumes met elkaar vergelijken. [Volumes en vergelijking](volumes.md)

**Filter.** Een regel die rijen verbergt die je niet wilt, bijvoorbeeld "alleen kills" of "alleen team Rood". [Filters](filters.md)

## Replay {#replay}

**Figuur.** Een klein model van een tank, vliegtuig, auto of soldaat dat beweegt waar de data zegt dat het was. [Figuren](figures.md)

**LOD (detailniveau).** Elke figuur heeft een gedetailleerde, een eenvoudigere en een heel eenvoudige versie. Nabije gebruiken de gedetailleerde en verre de eenvoudige, zodat er duizenden tegelijk getekend kunnen worden. [Figuren](figures.md)

## Racen {#racing}

**Ronde.** Eén tocht over de baan, van de finishlijn terug naar de finishlijn. [Rondes laden](race-loading-laps.md)

**Referentieronde.** De ronde waarmee alle andere vergeleken worden. Verschillen worden getoond als "sneller" of "langzamer" dan die. [Rondes laden](race-loading-laps.md)

**Apex.** Het punt van een bocht waar de wagen het dichtst bij de binnenkant is. [Analyse bocht voor bocht](race-corner-analysis.md)

**Slip.** Hoeveel een band slipt. Een beetje slip geeft de meeste grip; te veel en de wagen schuift weg. [Race-analyse: de methode](race-analytics.md)

**Envelop.** Wat een wagen bij elke snelheid kan: hoe hard hij kan sturen, remmen en versnellen voordat hij slipt. [Race-analyse: de methode](race-analytics.md)

## Vliegtuiggetallen {#aircraft-numbers}

**ALT.** Hoogte: de hoogte boven de grond of zeeniveau. [Wedstrijdreplay](match-replay.md#labels-and-statistics)

**TAS.** Ware luchtsnelheid: hoe snel een vliegtuig door de lucht beweegt. [Wedstrijdreplay](match-replay.md#labels-and-statistics)

## Computer {#computer}

**GPU.** De videokaart of chip. Hij tekent het beeld en is veel sneller dan de hoofdprocessor in het tekenen van miljoenen vlekken. [De twee backends](backends.md)

**WebGPU / WebGL2.** De twee manieren waarop een browser een pagina de GPU laat gebruiken. WebGPU is nieuwer. De viewer kan beide gebruiken en kiest de beste die je browser heeft. [De twee backends](backends.md)

## Counter-Strike-woorden {#counter-strike-words}

**Ronde.** Eén korte strijd binnen een wedstrijd. Eén kant wint hem, en de score gaat met één omhoog.

**Eco, force buy, full buy.** Hoeveel geld een kant aan het begin van een ronde aan wapens uitgeeft. Een eco spaart geld en koopt bijna niets (onder $1.500 per speler gemiddeld). Een force buy besteedt wat er is (onder $4.000). Een full buy koopt alles wat het kan. [Wedstrijdanalyse](match-analysis.md)

**Ruil.** Een kill die een kill terugbetaalt: jij wordt geschoten, en een teamgenoot schiet je moordenaar binnen 5 seconden neer. [Wedstrijdanalyse](match-analysis.md)

**KAST.** Het aandeel rondes waarin een speler een kill, een assist had, overleefde, of geruild werd. Een hoger getal betekent dat de speler in meer rondes heeft geholpen. [Wedstrijdanalyse](match-analysis.md)

**ADR.** Gemiddelde schade per ronde: hoeveel gezondheid een speler per ronde van vijanden kreeg. [Wedstrijdanalyse](match-analysis.md)
