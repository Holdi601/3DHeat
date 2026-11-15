---
title: "Woordenlijst"
nav_order: 21
lang: "nl"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Woordenlijst

Korte betekenissen van de woorden die deze site gebruikt, in gewone taal. Elk item linkt naar de pagina die het volledig uitlegt.

## Data {#data}

**Rij.** Één regel van je data: één ding dat op één plek en tijd gebeurde, bijvoorbeeld "speler 7 was hier op seconde 12". De viewer tekent elke rij. [Dataformaten](data-formats.md)

**Kolom.** Eén soort waarde in de rijen, zoals x, y, z, tijd of team. De viewer raadt welke kolom welke is, en je kunt die raad wijzigen. [Kolomkoppeling](column-mapping.md)

**CSV.** Een gewone teksttabel: één rij per regel, waarden gescheiden door komma's. Bijna elk programma kan er één schrijven. [Bestanden laden](loading-files.md)

**Parquet.** Een compact tabelbestand dat snel te lezen is, ook met miljoenen rijen. Het is het beste formaat om aan de viewer te geven. [Bestanden laden](loading-files.md)

**Gebeurtenis.** Iets dat gebeurde, zoals een schot, een treffer, een kill of een opstijging. Een rij kan een gebeurtenis zijn, of gewoon "ik was hier". [Filters](filters.md)

**Persoon.** Degene die de rijen maakte: een speler, een piloot, een auto of een tank. Eén persoon is één regel van posities door de tijd. [Sessies, personen en groepen](sessions-persons-groups.md)

**Groep (team).** Een set personen die in dezelfde kleur worden getoond, bijvoorbeeld Blauw en Rood. [Sessies, personen en groepen](sessions-persons-groups.md)

**Sessie (match, ronde).** Eén keer spelen. Een match of een ronde is een sessie. De viewer kan één sessie tonen of er veel over elkaar leggen. [Sessies, personen en groepen](sessions-persons-groups.md)

**Niveau.** De 3D-kaart waarop de data gebeurde: grond, gebouwen, muren. Rijen verschijnen waar ze op het niveau gebeurden. [Niveaus en achtergrondgeometrie](levels.md)

## Naar de data kijken {#looking-at-the-data}

**Heatmap.** Een beeld waarin plekken die door veel rijen worden geraakt, heter gloeien. Koude plekken zijn rustig, hete plekken zijn druk. [Warmte](heat.md)

**Warmte.** Hoeveel er op een plek gebeurde. De viewer telt de gloed van elke rij op elke plek op; de som is de warmte. [Warmte](heat.md)

**Sprite.** Het kleine gloeiende vlekje dat de viewer voor één rij tekent. Veel overlappende sprites tellen op tot warmte. [Vorm van sprite](sprite-shape.md)

**Belichting.** Hoe helder het beeld is. Net als bij een camera maakt te veel belichting alles wit en verbergt te weinig de details. [Kleur en belichting](colour-and-exposure.md)

**Verzadiging.** De hoeveelheid warmte die telt als "even heet als de kleuren kunnen". Verlaag hem om rustige plekken zichtbaar te maken; verhoog hem om alleen het heetst te zien. [Kleur en belichting](colour-and-exposure.md)

**Volume.** Een doos of vorm die je in de 3D-weergave plaatst. De viewer telt wat erin zit en kan volumes met elkaar vergelijken. [Volumes en vergelijking](volumes.md)

**Filter.** Een regel die rijen verbergt die je niet wilt, bijvoorbeeld "alleen kills" of "alleen team Rood". [Filters](filters.md)

## Replay {#replay}

**Figuur.** Een klein model van een tank, vliegtuig, auto of soldaat dat beweegt waar de data zegt dat het was. [Figuren](figures.md)

**LOD (level of detail).** Elke figuur heeft een gedetailleerde, een eenvoudigere en een heel eenvoudige versie. Nabije figuren gebruiken de gedetailleerde en verre de eenvoudige, zodat er duizenden tegelijk getekend kunnen worden. [Figuren](figures.md)

## Racen {#racing}

**Ronde.** Eén tocht over het parcours, van de finishlijn terug naar de finishlijn. [Ronden laden](race-loading-laps.md)

**Referentieronde.** De ronde waarmee alle andere worden vergeleken. Verschillen worden getoond als "sneller" of "langzamer" dan die ronde. [Ronden laden](race-loading-laps.md)

**Apex.** Het punt van een bocht waar de auto het dichtst bij de binnenrand is. [Analyse bocht voor bocht](race-corner-analysis.md)

**Slip.** Hoeveel een band slipt. Een beetje slip geeft de meeste grip; te veel en de auto schuift weg. [Raceanalyse: de methode](race-analytics.md)

**Omhullende.** Wat een auto bij elke snelheid kan: hoe hard hij kan sturen, remmen en optrekken voordat hij wegglijdt. [Raceanalyse: de methode](race-analytics.md)

## Vliegtuigcijfers {#aircraft-numbers}

**ALT.** Hoogte: de hoogte boven de grond of het zeeniveau. [Wedstrijdreplay](match-replay.md#labels-and-statistics)

**TAS.** Ware luchtsnelheid: hoe snel een vliegtuig zich door de lucht beweegt. [Wedstrijdreplay](match-replay.md#labels-and-statistics)

## Computer {#computer}

**GPU.** De grafische kaart of chip. Hij tekent het beeld en is veel sneller dan de hoofdprocessor in het tekenen van miljoenen vlekjes. [De twee backends](backends.md)

**WebGPU / WebGL2.** De twee manieren waarop een browser een pagina de GPU laat gebruiken. WebGPU is nieuwer. De viewer kan beide gebruiken en kiest de beste die je browser heeft. [De twee backends](backends.md)

## Counter-Strike-woorden {#counter-strike-words}

**Ronde.** Eén korte strijd binnen een match. Eén kant wint hem, en de stand gaat één omhoog.

**Eco, force buy, full buy.** Hoeveel geld een kant aan wapens uitgeeft aan het begin van een ronde. Een eco spaart geld en koopt bijna niets (gemiddeld minder dan $1.500 per speler). Een force buy geeft uit wat er is (minder dan $4.000). Een full buy koopt alles wat kan. [Matchanalyse](match-analysis.md)

**Trade.** Een kill die een kill terugbetaalt: jij wordt geschoten, en een teamgenoot schiet je moordenaar binnen 5 seconden neer. [Matchanalyse](match-analysis.md)

**KAST.** Het aandeel van de rondes waarin een speler een kill, een assist had, overleefde, of getrade werd. Een hoger getal betekent dat de speler in meer rondes heeft geholpen. [Matchanalyse](match-analysis.md)

**ADR.** Gemiddelde schade per ronde: hoeveel gezondheid een speler per ronde van vijanden kreeg. [Matchanalyse](match-analysis.md)
