---
title: "Course-Analys"
nav_order: 14
has_children: true
lang: "lb"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# Course-Analys

Dir hutt déiselwecht Strecke zweemol gefuer. De Tab **Course-Analys** spillt béid Fuerten zesumme am 3D of, weist, wou eng Ronn méi lues war, a seet Iech firwat. Nach keng Ronnen? Drëckt **Demo-Ronnen**.

![De Tab Course-Analys mat Demo-Ronnen: d'Säitelleescht mat Ronnen a Wou et ze verbesseren ass, d'Autoen op der Strecke, d'Diagrammer ënner der Usiicht](../assets/img/en/race-analysis-overview.webp)

De Tab vergläicht zwou oder méi Ronnen vun engem Kurs. Hie deelt sech mat der Heatmap d'Zeechenfläch, d'Kamera an de gelueden Streckemodell (**Hannergrond / Level**); alles anerescht ass säin eegent: seng eegen Säitelleescht an seng eegen Leescht ënner der Usiicht. Wierder wéi *Ronn*, *Referenz* an *Scheitelpunkt* stinn am [Glossar](glossary.md).

Dës Säit ass d'Kaart vum Tab. All Deel huet seng eege Säit:

| Säit | Wat se deckt |
|---|---|
| [Ronnen lueden](race-loading-laps.md) | all Dateiformat, Dossieren a Strecken, Autosnimm, Demo-Ronnen, d'Ronnelëscht, Referenz an Fokus |
| [Replay an d'3D-Szen](race-replay-and-scene.md) | d'Transportleescht, déi dräi Replay-Modi, d'Autoen opstellen, d'Verfolgungskamera, Linnen, Kaarten, Autoen, Beschrëftungen, gespigelt Welten |
| [Diagrammer an d'HUD](race-charts-and-hud.md) | d'Distanzdiagrammer, d'Diagrammwiel, Hoveren a Zoom, d'Autokaarten, d'Kanaltabell |
| [Autokontroll-Evenementer](race-control-events.md) | Bremsen blockéieren, Radspin, Iwwersteierung, Dréien, Ënnersteierung, Treffer, Crashen, ABS/TC, Handbremse, Loft - wéi jeds fonnt gëtt, mat all Schwell |
| [Kurv-fir-Kurv-Analys](race-corner-analysis.md) | Ausriichtung no Distanz, Kurven a Segmenter, d'Zäitrechnung vun enger Kurv, all Ursaach a wéi d'Reiefolleg, an där se geprüwwt ginn, d'Linnenform an de Rot |
| [Autosprofiler an Verglach](race-car-profiles.md) | wat all Auto kann, gemoosse aus senge Ronnen; *Autoen am Verglach*; wat d'Auto an all Kurv entscheet |
| [Streckestatistik](race-course-statistics.md) | vill Ronnen vun engem Kurs: Feeler pro Kurv an no Aart, d'Feelerkaart, den Heatmap-Export, d'Leeschtungsgrenzen |
| [Rennanalys: d'Method](race-analytics.md) | d'Fuerschung hannert de Reegelen, mat Quellen |
| [Aner Rennspiller](other-games.md) | wat den Viewer mat Ronnen vun all Spill mécht: Schlupp an Drift, déi erausgerechent ginn, wou e Spill se net schéckt, gespigelt Welten, d'Extra-Kanäl |

## D'Usiicht {#the-screen}

**Säitelleescht**, vun uewen no ënnen (Sektiounen kënnen ageklappt ginn):

1. **Ronnen** - lueden, Lëscht, weisen/verstoppen, Referenz, Fokus, Verfolgung.
   Kuckt [Ronnen lueden](race-loading-laps.md).
2. **Streckestatistik** - nëmmen ab dräi gelueden Ronnen.
   Kuckt [Streckestatistik](race-course-statistics.md).
3. **Wou et ze verbesseren ass** - d'Resultater vun der fokusséierter Ronn, Kurv fir Kurv.
   Kuckt [Kurv-fir-Kurv-Analys](race-corner-analysis.md).
4. **Kurv fir Kurv** (oder *Kurv fir Kurv - Klass X*, wann et méi Klassen sinn) - déi schnellst Ronn duerch all Kurv an hir Linn. Gewise mat zwou oder méi Ronnen.
5. **Autokontroll** - d'Bremsblockaden, Rutschen, Drécken a Treffer vun der fokusséierter Ronn.
   Kuckt [Autokontroll-Evenementer](race-control-events.md).
6. **Autoen am Verglach** (oder **Den Auto** mat engem eenzege Auto) - kuckt
   [Autosprofiler an Verglach](race-car-profiles.md).
7. **Usiicht** - wéi eng Kaart op d'Strecke gemoolt gëtt an wat gezeechent gëtt.
   Kuckt [Replay an d'3D-Szen](race-replay-and-scene.md).
8. D'gedeelte Panelen **Level** an **Kamera & Zeen** (Streckemodell, Achsen-Ëmkehrung, Kamera) - mat der Heatmap a mat [Kamera](camera.md) dokumentéiert.

**D'Usiicht** weist d'Strecke, d'gefuerene Linnen, d'Kaart, d'Autoen, Beschrëftungen op der Strecke festgemaach, an bis zu sechs Autokaarten an der oberer lénker Eck (kuckt [Diagrammer an d'HUD](race-charts-and-hud.md)). Ouni gelueden Ronnen seet se "No laps loaded - Drop two or more lap files here, or load the demo laps from the sidebar." (Keng Ronnen gelueden - zéckt zwou oder méi Ronnedateien hei rëms, oder lued d'Demo-Ronnen aus der Säitelleescht.)

**D'Leescht ënner der Usiicht** hält d'Replay-Transport an, wann se net verstoppt ass, d'Distanzdiagrammer.

## Schnellen Ufank {#quick-start}

1. Maacht de Tab **Course-Analys** op (nieft **Heatmap** uewen an der Säitelleescht).
2. Kritt Ronnen eran. Drëckt **Demo-Ronnen**, fir ze gesinn, wat de Tab mat dräi erfonnte Ronnen mécht. Fir Är eege Ronnen nëmmen, nëmmen se als éischt opnee ([Dateiformater a Rekorder](race-loading-laps.md#file-formats)), da drëckt **Ronnefichiere lueden…** oder **Dossier…**, oder werft Dateien oder Dossieren op d'Usiicht.
3. D'schnellst komplett Ronn gëtt d'Referenz; d'lues-ste aner Ronn ass fokusséiert. Klickt op all Ronn an der Lëscht, fir se ze fokusséieren; ★ mécht eng Ronn zur Referenz.
4. Liest **Wou et ze verbesseren ass**. Klickt op e Resultat: d'Autoen ginn 40 m virun et opgestallt, d'Kamera riicht et aus, de Replay spillt doduerch, an d'Miessunge gi op.
5. Hovert iwwer d'Diagrammer, fir all Auto op deen Meter ze réckelen; Shift+Klick stellt se dort op.

## Tastatur {#keyboard}

Wann de Course-Analys-Tab op ass:

| Tast | Mécht |
|---|---|
| **K** | Replay ofspillen / pausen |
| **Pos1** | Zréck op den Ufank vum Replay |
| Zifferentasten | näischt (an der Heatmap wiesselen se d'Modi) |

Tasten, déi an e Textfeld oder eng Dropdown-Lëscht getippt ginn, ginn ignoréiert. D'Kamera-Tasten funktionéiere wéi bei der Heatmap (**W A S D**, **Space** erop, **Q** erof, **Shift** méi séier, **Alt** méi lues, d'Maus fir ze kucken; all am [Kamera](camera.md)); **F** riicht d'gelueden Ronnen aus (wéi d'Lueden vun Ronnen et mécht).

## Vill Ronnen {#many-laps}

- All gelueden Ronnen ginn analyséiert angezielt; zwou Dotzend brauche eng Sekonn oder zwou.
- Ab **8** Ronnen (`SHOW_ALL_UP_TO`) ginn derbäi gesat Ronnen nëmmen gezeechent, wann se d'Referenz sinn, d'fokusséiert Ronn, oder déi bescht Ronn an der Klass vun der fokusséierter Ronn. *All weisen* / *Nëmmen déi gekuckt* wiesselen.
- Ab **10** sichtbare Autoen (`PLAIN_PAST`) ginn d'Ronnen, déi net ugekuckt ginn (net de Fokus, net de verfollegte Auto, net d'Referenz), mat Linnen gezeechent, déi all 6 m op e Punkt ausgedënnt sinn amplaz all 1,5 m, a mat eenfache Autoen.
- D'Diagrammer zeechnen héchstens **8** Ronnen; den HUD weist héchstens **6** Kaarten.
- D'Streckestatistik erschéngt ab **3** Ronnen.

Detailer: [Streckestatistik](race-course-statistics.md#performance-with-many-laps).

## Standard-Usiichtastellungen {#default-view-settings}

| Astellung | Standard |
|---|---|
| Kaart | Zäitkaart |
| Gefuer Linnen, Autoen, Reifen a Fiederung, Beschrëftungen, Strecke aus den Ronnen | un |
| All Wäerter op de Kaarten | aus |
| Autogréisst | 1× |
| Diagrammer | gewise |
| Replay-Modus | Vun der Linn aus |
| Replay-Geschwindegkeet | 1× |
| Endlosschleif | un |

Nëmmen eng vun dësen Astellungen gëtt gespäichert: wann Dir d'Säit neu lueden, fänkt et mat den Standarde vir. Am Browser bleiwen d'Sprooch an d'Autonimm, déi aus Ronnedateien geléiert goufen (kuckt [Ronnen lueden](race-loading-laps.md#car-names)).

## Fir Entwéckler {#for-developers}

### Wat geschitt, wann Ronnen gelueden ginn {#what-happens-when-laps-are-loaded}

Jiddereen Mol wann d'Zuel vun de Ronnen, d'Referenz oder d'Sprooch sech ännert, gëtt déi ganz Analyse nei gemaach (`analyse` an
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Abgeleed Kanäl ginn all Ronn derbäi, wou d'Spill se net schécken: Driftwénkel, Radschlupp aus de Radgeschwindegkeeten, in der Loft, lockeren Buedem, Gierrate ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. D'Referenz gëtt gewielt, an all Ronn gëtt op hire Wee projizéiert an all 2 m nei ofgetast ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Ob d'Welt vum Spill gespigelt ass, gëtt aus den Ronnen erausgeschafft ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Kurven ginn op der Referenz fonnt a vun enger Bremszon bis zur nächster a Segmenter gruppéiert ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Pro Auto: seng Hëllecker (Griff, Bremsen, Zuch pro Vitess), säi Profil, seng Reifekurven ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Pro Ronn an Segment: wat et gemaach huet (Bremspunkt, lues-ste Punkt, voll Gas, ...) an d'Linn, déi et gefuer huet ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Pro Ronn: seng Autokontroll-Evenementer, jiddereen géint d'Ronn gestallt, mat där et do verglach gëtt.
8. Pro Ronn an Segment: d'Zäitrechnung géint seng Vergläichsronn an de Resultat a Wieder.
9. D'Zäitkaart an d'Ursaachekaart pro Ronn.

D'Texter ginn an der aktueller Sprooch gemaach; e Sprooch-Wiessel leeft d'Analyse nach eng Kéier (a benennt d'Demo-Ronnen ëm). E Fehler an der Analyse gëtt ënner de **Ronnen**-Knäppchen als Feeler gewisen, an d'Ronnen bleiwen gelueden.

### Quelldateien {#source-files}

| Datei | Roll |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | Ronnedateien liesen |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | den Ronn-Typ, d'Benennung, d'Demo-Ronnen |
| `src/race/derive.ts`, `handedness.ts` | abgeleed Kanäl, gespigelt Welten |
| `src/race/align.ts`, `segments.ts`, `line.ts` | d'Distanzachs, d'Kurven, d'Linnen |
| `src/race/analysis.ts` | d'Kurven verglach, d'Ursaachen, d'Resultater |
| `src/race/envelope.ts`, `profile.ts` | wat e Auto kann |
| `src/race/control.ts`, `impacts.ts` | Autokontroll, Treffer a Crashen |
| `src/race/stats.ts` | vill Ronnen |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | Replay a Zeechnen |
| `src/race/schema.ts`, `graphs.ts` | d'Kanaltabell, d'Zeilen vun de Diagrammer |
| `src/ui/race/*` | d'Säitelleescht, d'Diagrammer, den HUD, d'Beschrëftungen |
| `src/state/raceStore.ts` | den Zoustand vum Tab an d'Replay-Auer |
