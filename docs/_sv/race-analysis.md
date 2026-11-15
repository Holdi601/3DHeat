---
title: "Racinganalys"
nav_order: 14
has_children: true
lang: "sv"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# Racinganalys

Du körde samma bana två gånger. Fliken **Racinganalys** spelar upp båda körningarna tillsammans i 3D, visar var ett varv var långsammare och berättar varför. Inga varv än? Tryck **Demovarv**.

![Fliken Racinganalys med demovarv: sidofältet med Varv och Var det finns tid att hämta, bilarna på banan och graferna under vyn](../assets/img/en/race-analysis-overview.webp)

Fliken jämför två eller fler varv på en och samma bana. Den delar duken, kameran och banmodellen (**Bakgrund / nivå**) med värmekartan. Allt annat är eget: egen sidopanel och eget fält under vyn. Ord som *lap*, *reference* och *apex* förklaras i [ordlistan](glossary.md).

Den här sidan är kartan över fliken. Varje del har sin egen sida:

| Sida | Vad den omfattar |
|---|---|
| [Läsa in varv](race-loading-laps.md) | alla filformat, mappar och banor, bilnamn, demovarv, varvlistan, referens och fokus |
| [Repris och 3D-scenen](race-replay-and-scene.md) | transportfältet, de tre reprislägena, att ställa upp bilarna, jaktkameran, linjer, kartor, bilar, etiketter, speglade världar |
| [Diagram och HUD](race-charts-and-hud.md) | avståndsdiagrammen, grafväljaren, hovring och zoom, bilkorten, kanaltabellen |
| [Bilkontrollhändelser](race-control-events.md) | blockeringar, hjulspinn, översvängning, snurrar, understyrning, träffar, krascher, ABS/TC, handbroms, luft: hur var och en upptäcks, med varje tröskelvärde |
| [Kurva för kurva-analys](race-corner-analysis.md) | justering efter avstånd, kurvor och segment, kurvans tidsräkning, varje orsak och i vilken ordning de prövas, linjeformen och rådet |
| [Bilprofiler och jämförelse](race-car-profiles.md) | vad varje bil kan, uppmätt från dess varv; *Bilarna jämförda*; vad bilen avgör i varje kurva |
| [Banstatistik](race-course-statistics.md) | många varv på en bana: misstag per kurva och per slag, misstagskartan, värmekarteexporten, prestandagränser |
| [Racinganalys: metoden](race-analytics.md) | forskningen bakom reglerna, med källor |
| [Andra racingspel](other-games.md) | vad visaren gör med varv från varje spel: slip och drift räknas ut där spelet inte skickar dem, speglade världar, de extra kanalerna |

## Skärmen {#the-screen}

**Sidofältet**, uppifrån och ned (avsnitt kan fällas ihop):

1. **Varv**: läs in, lista, visa/dölj, referens, fokus, jakt. Se [Läsa in varv](race-loading-laps.md).
2. **Banstatistik**: först från tre inlästa varv. Se [Banstatistik](race-course-statistics.md).
3. **Var det finns tid att hämta**: det fokuserade varvets fynd, kurva för kurva. Se [Kurva för kurva-analys](race-corner-analysis.md).
4. **Kurva för kurva** (eller *Kurva för kurva – klass X* med flera klasser): det snabbaste varvet genom varje kurva och dess linje. Visas med två eller fler varv.
5. **Bilkontroll**: det fokuserade varvets blockeringar, glidningar, översvängningar och träffar. Se [Bilkontrollhändelser](race-control-events.md).
6. **Bilarna jämförda** (eller **Bilen** med en bil): se [Bilprofiler och jämförelse](race-car-profiles.md).
7. **Vy**: vilken karta som målas på banan och vad som ritas. Se [Repris och 3D-scenen](race-replay-and-scene.md).
8. De gemensamma panelerna **Bakgrund / nivå** och **Kamera & scen** (banmodell, axelinvertering, kamera). De dokumenteras med värmekartan och i [Kamera](camera.md).

**Vyn** visar banan, de körda linjerna, kartan, bilarna, etiketter fästa vid banan och upp till sex bilkort uppe till vänster (se [Diagram och HUD](race-charts-and-hud.md)). Utan inlästa varv står det: ”Inga varv inlästa – släpp två eller fler varvfiler här, eller läs in demovarven från sidofältet.”

**Fältet under vyn** innehåller transportfältet för repriset och, om det inte är dolt, avståndsdiagrammen.

## Snabbstart {#quick-start}

1. Öppna fliken **Racinganalys** (bredvid **Värmekarta** överst i sidofältet).
2. Få in varv. Tryck **Demovarv** för att se vad fliken gör med tre påhittade varv. För egna varv spelar du först in dem ([filformat och inspelare](race-loading-laps.md#file-formats)). Tryck sedan **Läs in varvfiler…** eller **Mapp…**, eller släpp filer eller mappar på vyn.
3. Det snabbaste kompletta varvet blir referensen, och det långsammaste övriga varvet blir det fokuserade. Klicka på ett varv i listan för att fokusera det. ★ gör ett varv till referens.
4. Läs **Var det finns tid att hämta**. Klicka på ett fynd: bilarna ställs upp 40 m före det, kameran ramar in det, repriset spelar upp genom det och mätningarna öppnas.
5. Håll musen över graferna för att flytta varje bil till just den metern. Shift+klick ställer upp dem där.

## Tangentbord {#keyboard}

Medan fliken Racinganalys är öppen:

| Tangent | Gör |
|---|---|
| **K** | spela / pausa repriset |
| **Home** | tillbaka till början av repriset |
| sifferknapparna | ingenting (i värmekartan växlar de lägen) |

Tangenter som skrivs i ett textfält eller en rullgardinsmeny ignoreras. Kameratangenterna fungerar som i värmekartan (**W A S D**, **Mellanslag** upp, **Q** ned, **Shift** snabbare, **Alt** långsammare, musen för att titta; allt i [Kamera](camera.md)). **F** ramar in de inlästa varven, precis som när varv läses in.

## Många varv {#many-laps}

- Alla inlästa varv analyseras och räknas. Dussintals tar en sekund eller två.
- Efter **8** varv (`SHOW_ALL_UP_TO`) ritas tillagda varv bara när de är referensen, det fokuserade varvet eller det bästa varvet i det fokuserade varvets klass. *Visa alla* / *Bara de jag tittar på* växlar.
- Efter **10** synliga bilar (`PLAIN_PAST`) ritas varv som inte tittas på (inte fokus, den jagade bilen eller referensen) med linjer gallrade till en punkt var 6 m i stället för var 1,5 m, och med enkla bilar.
- Graferna ritar högst **8** varv. HUD:en visar högst **6** kort.
- Banstatistiken visas från **3** varv.

Detaljer: [Banstatistik](race-course-statistics.md#performance-with-many-laps).

## Standardvärden för vyn {#default-view-settings}

| Inställning | Standard |
|---|---|
| Karta | Tidskarta |
| Körda linjer, Bilar, Däck och fjädring, Etiketter, Bana från varven | på |
| Alla värden på korten | av |
| Bilstorlek | 1× |
| Diagram | visas |
| Reprisläge | Från linjen |
| Repristempo | 1× |
| Upprepa | på |

Inget av detta sparas. En omladdning startar från standardvärdena. Det som kommer ihåg i webbläsaren är språket och bilnamnen som lärts från varvfiler (se [Läsa in varv](race-loading-laps.md#car-names)).

## För utvecklare {#for-developers}

### What happens when laps are loaded {#what-happens-when-laps-are-loaded}

Every time the set of laps, the reference or the language changes, the whole
analysis is redone (`analyse` in
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Derived channels are added to each lap where the game does not send them:
   drift angle, wheel slip from wheel speeds, in the air, loose ground, yaw
   rate ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. The reference is chosen and every lap is projected onto its path and
   resampled every 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Whether the game's world is mirrored is worked out from the laps
   ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Corners are found on the reference, and grouped into segments from one
   braking zone to the next ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Per car: its envelope (grip, braking, pull per speed), its profile, its
   tyre curves ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Per lap and segment: what it did (brake point, slowest point, full
   throttle, ...) and the line it drove ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Per lap: its car-control events, each laid against the lap it is compared
   with there.
8. Per lap and segment: the time account against its comparison lap and the
   finding in words.
9. The time map and the cause map per lap.

The texts are produced in the current language; switching language runs the
analysis again (and renames the demo laps). A failure in the analysis is
shown under the **Laps** buttons as an error and the laps stay loaded.

### Source files {#source-files}

| File | Role |
| --- | --- |
| `src/race/adapters.ts`, `ibt.ts` | reading lap files |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | the lap type, naming, demo laps |
| `src/race/derive.ts`, `handedness.ts` | derived channels, mirrored worlds |
| `src/race/align.ts`, `segments.ts`, `line.ts` | distance axis, corners, lines |
| `src/race/analysis.ts` | corners compared, causes, findings |
| `src/race/envelope.ts`, `profile.ts` | what a car can do |
| `src/race/control.ts`, `impacts.ts` | car control, hits and crashes |
| `src/race/stats.ts` | many laps |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | replay and drawing |
| `src/race/schema.ts`, `graphs.ts` | the channel table, the charts' rows |
| `src/ui/race/*` | the sidebar, the charts, the HUD, the labels |
| `src/state/raceStore.ts` | the tab's state and the replay clock |
