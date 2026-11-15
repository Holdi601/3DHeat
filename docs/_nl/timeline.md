---
title: "Tijdlijn en afspelen"
nav_order: 5
lang: "nl"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Tijdlijn en afspelen

De balk onder het beeld werkt als een videospeler: je kunt de data als film afspelen, pauzeren, springen en de snelheid wijzigen.

![De tijdlijnbalk: 1 Alles/Afspelen, 2 bedieningsknoppen, 3 klok, 4 Snelheid, 5 Geschiedenis, met Venster en een Periode van 30 s](../assets/img/en/timeline-bar.webp)

De balk onder de weergave is de tijdlijn ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Die bepaalt welke rijen op elk moment zichtbaar zijn. Er is een tijdkolom nodig; zonder die is de hele balk uitgeschakeld, blijft de weergave in **Alles**, en de zijbalk zegt *Geen tijdkolom in deze data - de tijdlijn is uitgeschakeld en elk datapunt wordt tegelijk getoond.*

## Alles en Afspelen {#all-and-play}

Twee hoofdmodi, omdat ze verschillende vragen beantwoorden.

- **Alles** (de standaard bij elke lading) negeert de afspeelkop volledig en toont elke rij die de filters passeert. Het is de weergave "waar gebeurt dit", en het is niet hetzelfde als naar het einde schuiven. De schuiver is uitgeschakeld en de klok toont `alles · <span> aan data`.
- **Afspelen** speelt de data af als tijdvertraagde film. De schuiver, de bediening en de geschiedenisinstellingen verschijnen.

Kiezen van **Alles** stopt ook het afspelen.

## De regelaars {#the-controls}

| Regelaar | Standaard | Betekenis |
|---|---|---|
| Schuiver | het begin | De afspeelkop. Slepen om te zoeken; 20.000 stappen over het bereik. |
| **Alles** / **Afspelen** | Alles | Zie hierboven. |
| ▶ / ❚❚ | gepauzeerd | Afspelen of pauzeren; ook `K`. |
| ◀ **Achteruit afspelen (J)** | | Speelt de data in omgekeerde richting af. Alleen zichtbaar in de modus **Figurenoverlay**; dezelfde toets `J` werkt daar ook (zie [Toetsenbord](#keyboard)). |
| ⏮ | | Terug naar het begin van het bereik. |
| Klok | | `verstreken / totaal` als `mm:ss.s` (of `u:mm:ss`), en, wanneer de tijdkolom een absoluut tijdstempel is, de kloktijd van de afspeelkop als `UU:MM:SSZ` (UTC). |
| **Snelheid** | 1× | Datasecondes per echte seconde. Het menu heeft 17 stappen van 0,01× tot 1800× (0,01, 0,02, 0,05, 0,1, 0,25, 0,5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), plus **Aangepast…**: typ elke snelheid van 0,001× tot 3600× (bijvoorbeeld 0,3 of 12) en druk op Enter; Esc houdt de huidige snelheid. De laatste snelheid wordt onthouden voor het volgende bezoek (zie [Opgeslagen instellingen](ref-settings-storage.md)). |
| **Geschiedenis** | Cumulatief | Wat zichtbaar telt bij de afspeelkop: *Cumulatief*, *Venster* of *Levensduur* (hieronder). |
| **Periode** (Venster; in de modus Lijnen ook Levensduur) | 30 s | Lengte van het venster dat bij de afspeelkop eindigt; minstens 0,01 s. In [Lijnwarmte](line-heat.md#playback) is het de lengte van de staart. |
| **Standaardlevensduur** (alleen Levensduur, niet in de modus Lijnen) | 10 s | Hoe lang een datapunt zonder volgend monster van zijn persoon zichtbaar blijft. |
| **Fade** (alleen Levensduur, niet in de modus Lijnen) | 0,4 | Het deel van de levensduur van elk datapunt dat wegfadeert, 0-1. |
| **Herhalen** | aan | Aan het eind weer van voren af aan; uit stopt aan het eind. |
| Rechterkant | | De naam van de dataset. |

Het **bereik** is de tijdsspanne van de dataset - of, in de [figurenoverlay](box-replay.md) met een geselecteerde sessie, de spanne van die sessie.

## Geschiedenis {#history}

In de modus Afspelen:

- **Cumulatief** - alles vanaf het begin van het bereik tot de afspeelkop. De warmte bouwt zich op terwijl het speelt.
- **Venster** - een vaste spanne van geschiedenis die bij de afspeelkop eindigt (*Periode*).
- **Levensduur** - elk datapunt leeft tot het **volgende monster van dezelfde persoon** (in dezelfde sessie), zodat precies één positie per persoon op elk moment actueel is. Een datapunt waarvan de persoon nooit meer verschijnt - een dood, een verbroken verbinding, het einde van het logboek - heeft geen volgend monster, en leeft de *Standaardlevensduur* in plaats van meteen te verdwijnen of voor altijd te blijven. Datapunten **faden weg** over het laatste deel *Fade* van hun levensduur in plaats van weg te springen: met één levend monster per persoon zou een datapunt dat tussen twee beelden verdwijnt het hele veld laten flikkeren op de monsterfrequentie. *Fade* 0 herstelt de harde knip.

Levensduur heeft naast een tijdkolom ook een kolom met personen nodig; zonder die valt de geschiedenis bij het laden terug op Cumulatief. In [Lijnwarmte](line-heat.md#playback) bepaalt de geschiedenis hoe lang de staart van een route zichtbaar blijft; in de [figurenoverlay](box-replay.md) is de *Standaardlevensduur* hoe lang een persoon zonder verdere monsters wordt vastgehouden.

## Gedrag bij afspelen {#playback-behaviour}

Uit de beeldlus ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- De afspeelkop loopt op *beeldtijd × snelheid*. De beeldtijd is begrensd op 0,1 s, zodat wisselen van tabblad de afspeelkop niet laat springen.
- Op play drukken aan het allerlaatste eind van het bereik start vanaf het begin, zoals een mediaspeler dat doet. Bij elke lading staat de afspeelkop op het begin, zodat de eerste druk op afspelen speelt.
- Aan het eind van het bereik springt de afspeelkop terug naar het begin (Herhalen aan) of stopt daar en eindigt het afspelen (Herhalen uit).
- De schuiver leest de afspeelkop van de engine elk beeld direct; de applicatiestatus wordt bijgewerkt bij zoeken, starten, stoppen en herhalen.
- Een sessie kiezen in de sessiekiezer zoekt naar het begin van die sessie.

## Waarom afspelen soepel en zuinig is {#why-playback-is-smooth-and-cheap}

Rijen zijn op tijd gesorteerd opgeslagen, dus een tijdvenster is twee binaire zoekacties op de tijdkolom: de afspeelkop verplaatsen verzet twee gehele getallen en raakt geen enkele rij aan; de kosten van het afspelen volgen het aantal rijen in het venster, niet de omvang van de dataset.

Hoe de warmte stabiel blijft terwijl het venster beweegt hangt af van de geschiedenis ([Accumulatie](accumulation.md)):

- **Cumulatief** groeit alleen maar, dus elk beeld voegt alleen de rijen toe die sinds het vorige zichtbaar zijn geworden, met volle weging. Het veld bouwt monotoon op en pauzeren verandert niets, omdat er niets meer aankomt. (Opnieuw schatten zou elk beeld een andere willekeurige deelverzameling laten oplichten en dan laten wegfaden, wat leest als uitbarstingen die oplaaien en verdwijnen.)
- **Venster** en **Levensduur** veranderen werkelijk elk beeld en worden opnieuw geschat, als voortschrijdend exponentieel gemiddelde gemengd (gewicht 0,34 voor het nieuwe beeld), dat in stationaire toestand onbevooroordeeld is en veel rustiger dan opnieuw beginnen.
- In de modus Levensduur zijn de kandidaatrijen die van *afspeelkop - max(langste gat in de data, Standaardlevensduur)* tot de afspeelkop; de shader laat daarna elke rij vallen waarvan de eigen levensduur voorbij is en past de fade toe.

Wisselen tussen Alles en Afspelen, of wijzigen van de geschiedenis, start de accumulatie opnieuw.

## Toetsenbord {#keyboard}

| Toets | Effect |
|---|---|
| `K` | Afspelen / pauzeren |
| `J` | Achteruit afspelen; nogmaals drukken pauzeert (alleen Figurenoverlay) |
| `L` | Vooruit afspelen; nogmaals drukken pauzeert (alleen Figurenoverlay) |

`J` en `L` zetten de tijdlijn ook op **Afspelen**. De toetsen worden genegeerd terwijl een tekstvak of menu de focus heeft. In het tabblad Race-analyse bestuurt `K` in plaats daarvan de eigen replay van dat tabblad.
