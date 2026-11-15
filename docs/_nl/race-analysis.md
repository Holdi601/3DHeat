---
title: "Race-analyse"
nav_order: 14
has_children: true
lang: "nl"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# Race-analyse

Je reed twee keer dezelfde baan. Het tabblad **Race-analyse** speelt beide ritten samen af in 3D, toont waar één ronde langzamer was en vertelt je waarom. Nog geen rondes? Druk op **Demorondes**.

![Het tabblad Race-analyse met demorondes: de zijbalk met Rondes en Waar tijd te winnen is, de wagens op de baan, de grafieken onder de weergave](../assets/img/en/race-analysis-overview.webp)

Het tabblad vergelijkt twee of meer rondes van één baan. Het deelt het canvas, de camera en het geladen baanmodel (**Achtergrond / level**) met de warmtekaart; al het andere is eigen: de eigen zijbalk en de eigen balk onder de weergave. Woorden als *ronde*, *referentie* en *apex* staan in de [woordenlijst](glossary.md).

Deze pagina is de kaart van het tabblad. Elk onderdeel heeft zijn eigen pagina:

| Pagina | Wat het behandelt |
|---|---|
| [Rondes laden](race-loading-laps.md) | elk bestandsformaat, mappen en banen, wagennamen, demorondes, de ronde-lijst, referentie en focus |
| [Replay en de 3D-scène](race-replay-and-scene.md) | de transportbalk, de drie replaymodi, wagens op één lijn zetten, de achtervolgingscamera, lijnen, kaarten, wagens, labels, gespiegelde werelden |
| [Grafieken en de HUD](race-charts-and-hud.md) | de afstandsgrafieken, de grafiekkiezer, aanwijzen en zoomen, de wagenkaarten, de kanaaltabel |
| [Gebeurtenissen bij wagenbeheersing](race-control-events.md) | blokkeren, wielspin, overstuur, spins, ondersturen, treffers, crashes, ABS/TC, handrem, lucht - hoe elk gevonden wordt, met elke drempel |
| [Analyse bocht voor bocht](race-corner-analysis.md) | uitlijning op afstand, bochten en segmenten, de tijdsrekening van een bocht, elke oorzaak en de volgorde waarin ze geprobeerd worden, de vorm van de lijn en het advies |
| [Wagenprofielen en vergelijking](race-car-profiles.md) | wat elke wagen kan, gemeten uit zijn rondes; *Auto's vergeleken*; wat de wagen in elke bocht bepaalt |
| [Baanstatistieken](race-course-statistics.md) | veel rondes van één baan: fouten per bocht en per soort, de foutenkaart, de export van de warmtekaart, prestatiegrenzen |
| [Race-analyse: de methode](race-analytics.md) | het onderzoek achter de regels, met bronnen |
| [Andere racespellen](other-games.md) | wat de viewer doet met rondes van elk spel: slip en drift berekend waar een spel ze niet stuurt, gespiegelde werelden, de extra kanalen |

## Het scherm {#the-screen}

**Zijbalk**, van boven naar beneden (gedeelten kunnen worden ingeklapt):

1. **Rondes** - laden, lijst, tonen/verbergen, referentie, focus, achtervolgen.
   Zie [Rondes laden](race-loading-laps.md).
2. **Baanstatistieken** - alleen vanaf drie geladen rondes.
   Zie [Baanstatistieken](race-course-statistics.md).
3. **Waar tijd te winnen is** - de bevindingen van de gefocuste ronde, bocht voor bocht.
   Zie [Analyse bocht voor bocht](race-corner-analysis.md).
4. **Bocht voor bocht** (of *Bocht voor bocht - klasse X* bij meerdere
   klassen) - de snelste ronde door elke bocht en zijn lijn. Getoond bij twee
   of meer rondes.
5. **Autobeheersing** - de blokkeringen, slides, duwers en treffers van de gefocuste ronde.
   Zie [Gebeurtenissen bij wagenbeheersing](race-control-events.md).
6. **Auto's vergeleken** (of **De auto** bij één wagen) - zie
   [Wagenprofielen en vergelijking](race-car-profiles.md).
7. **Weergave** - welke kaart op de baan geschilderd wordt en wat getekend wordt.
   Zie [Replay en de 3D-scène](race-replay-and-scene.md).
8. De gedeelde panelen **Level** en **Camera & scène** (baanmodel, omkering
   van assen, camera) - gedocumenteerd bij de warmtekaart en [Camera](camera.md).

**De weergave** toont de baan, de gereden lijnen, de kaart, de wagens, labels
vastgezet aan de baan, en tot zes wagenkaarten linksboven (zie
[Grafieken en de HUD](race-charts-and-hud.md)). Zonder geladen rondes staat er
"Geen rondes geladen - Zet hier twee of meer rondebestanden neer, of laad de
demorondes uit de zijbalk."

**De balk onder de weergave** bevat de transportbediening van de replay en, tenzij verborgen,
de afstandsgrafieken.

## Snel begin {#quick-start}

1. Open het tabblad **Race-analyse** (naast **Heatmap** bovenaan de
   zijbalk).
2. Haal rondes binnen. Druk op **Demorondes** om te zien wat het tabblad doet
   met drie verzonnen rondes. Voor je eigen rondes neem je ze eerst op
   ([bestandsformaten en recorders](race-loading-laps.md#file-formats)), en
   druk daarna op **Rondebestanden laden…** of **Map…**, of zet bestanden of
   mappen op de weergave.
3. De snelste volledige ronde wordt de referentie; de langzaamste andere
   ronde wordt gefocust. Klik op een ronde in de lijst om haar te focussen; ★
   maakt een ronde de referentie.
4. Lees **Waar tijd te winnen is**. Klik op een bevinding: de wagens worden
   40 m ervoor op één lijn gezet, de camera brengt het in beeld, de replay
   speelt erdoorheen en de metingen worden geopend.
5. Wijs de grafieken aan om elke wagen naar die meter te verplaatsen;
   Shift+klik om ze daar op één lijn te zetten.

## Toetsenbord {#keyboard}

Terwijl het tabblad Race open is:

| Toets | Doet |
|---|---|
| **K** | replay afspelen / pauzeren |
| **Home** | terug naar het begin van de replay |
| cijfertoetsen | niets (in de warmtekaart schakelen ze de modi) |

Toetsen die in een tekstveld of keuzelijst getypt worden worden genegeerd. De
cameratoetsen werken zoals in de warmtekaart (**W A S D**, **Spatie** omhoog, **Q** omlaag, **Shift** sneller,
**Alt** langzamer, muis om te kijken; alles in [Camera](camera.md)); **F** brengt de
geladen rondes in beeld (zoals het laden van rondes doet).

## Veel rondes {#many-laps}

- Alle geladen rondes worden geanalyseerd en geteld; tientallen duren een
  seconde of twee.
- Voorbij **8** rondes (`SHOW_ALL_UP_TO`) worden toegevoegde rondes alleen
  getekend als ze de referentie zijn, de gefocuste ronde, of de beste ronde
  van de klasse van de gefocuste ronde. *Alles tonen* / *Alleen die bekeken* schakelen om.
- Voorbij **10** zichtbare wagens (`PLAIN_PAST`) worden de rondes die niet bekeken
  worden (niet de focus, de achtervolgde wagen of de referentie) getekend met lijnen
  uitgedund tot één punt per 6 m in plaats van 1,5 m, en met eenvoudige wagens.
- De grafieken tekenen hoogstens **8** rondes; de HUD toont hoogstens **6** kaarten.
- De baanstatistieken verschijnen vanaf **3** rondes.

Details: [Baanstatistieken](race-course-statistics.md#performance-with-many-laps).

## Standaard weergave-instellingen {#default-view-settings}

| Instelling | Standaard |
|---|---|
| Kaart | Tijdkaart |
| Gereden lijnen, Wagens, Banden & vering, Labels, Baan uit de rondes | aan |
| Alle waarden op de kaarten | uit |
| Wagengrootte | 1× |
| Grafieken | getoond |
| Replaymodus | Vanaf de lijn |
| Replaysnelheid | 1× |
| Herhalen | aan |

Geen van deze wordt bewaard; een herlaad start met de standaardwaarden. Wat in
de browser onthouden wordt: de taal, en de wagennamen die uit rondebestanden
geleerd zijn (zie [Rondes laden](race-loading-laps.md#car-names)).

## Voor ontwikkelaars {#for-developers}

### Wat er gebeurt als rondes geladen worden {#what-happens-when-laps-are-loaded}

Elke keer dat de set rondes, de referentie of de taal verandert, wordt de hele
analyse opnieuw gedaan (`analyse` in
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Afgeleide kanalen worden aan elke ronde toegevoegd waar het spel ze niet
   stuurt: slipwinkel, wielslip uit wielsnelheden, in de lucht, los terrein,
   gierhoeksnelheid ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. De referentie wordt gekozen en elke ronde wordt op haar pad geprojecteerd en
   elke 2 m opnieuw bemonsterd ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Uit de rondes wordt afgeleid of de wereld van het spel gespiegeld is
   ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Bochten worden op de referentie gevonden en gegroepeerd in segmenten van de
   ene remzone tot de volgende ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Per wagen: zijn envelop (grip, remmen, trek per snelheid), zijn profiel, zijn
   bandcurven ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Per ronde en segment: wat ze deed (rempunt, traagste punt, vol gas, ...) en
   de lijn die ze reed ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Per ronde: haar gebeurtenissen bij wagenbeheersing, elk naast de ronde
   waarmee het daar vergeleken wordt.
8. Per ronde en segment: de tijdsrekening ten opzichte van haar vergelijkingsronde
   en de bevinding in woorden.
9. De tijdkaart en de oorzaakkaart per ronde.

De teksten worden in de huidige taal gemaakt; een taalwissel draait de analyse
opnieuw (en hernoemt de demorondes). Een fout in de analyse wordt onder de
knoppen **Rondes** als fout getoond en de rondes blijven geladen.

### Bronbestanden {#source-files}

| Bestand | Rol |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | rondebestanden lezen |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | het rondetype, benoemen, demorondes |
| `src/race/derive.ts`, `handedness.ts` | afgeleide kanalen, gespiegelde werelden |
| `src/race/align.ts`, `segments.ts`, `line.ts` | afstandsas, bochten, lijnen |
| `src/race/analysis.ts` | vergeleken bochten, oorzaken, bevindingen |
| `src/race/envelope.ts`, `profile.ts` | wat een wagen kan |
| `src/race/control.ts`, `impacts.ts` | wagenbeheersing, treffers en crashes |
| `src/race/stats.ts` | veel rondes |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | replay en tekenen |
| `src/race/schema.ts`, `graphs.ts` | de kanaaltabel, de rijen van de grafieken |
| `src/ui/race/*` | de zijbalk, de grafieken, de HUD, de labels |
| `src/state/raceStore.ts` | de staat van het tabblad en de replayklok |
