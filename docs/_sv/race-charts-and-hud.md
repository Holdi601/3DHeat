---
title: "Diagram och HUD"
parent: "Racinganalys"
nav_order: 53
lang: "sv"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Diagram och HUD

Diagrammen lägger dina varv på rad meter för meter, så att du kan se var en förare bromsade senare eller släppte gasen tidigare. Korten uppe till vänster i vyn visar vad varje bil och förare gör just nu.

![Diagram under vyn: rader för gapet, hastighet, gas, broms och styrning för två varv, tids- och orsakremsorna överst, och markören med korten](../assets/img/en/race-charts-rows.webp)

## Diagrammen {#the-charts}

Varje varv på en gemensam sträckaxel – meter längs referensen (se [en gemensam sträckaxel](race-corner-analysis.md#one-distance-axis)) – så att samma x är samma plats på banan för varje varv. Ett varv ritas på egen hand (och spelas upp); ett andra varv på samma bana ritas mot det. Utan inlästa varv (eller när analysen misslyckades) står det i området: "Diagrammen visas när ett varv har lästs in; läs in ett till på samma bana för att jämföra dem."

### Vad som finns på dem {#what-is-on-them}

- **Teckenförklaringen**: varje ritat varvs färg och etikett, referensen märkt "(referens)"; "+N till ritade, inte i diagrammen" när fler varv är synliga än som ritas; **Grafer (N) ▾**; **Hela varvet** när man zoomat; en rad med tips.
- **Två remsor** överst, för det fokuserade varvet:
  - *tid*: [tidskartan](race-replay-and-scene.md#time-map-where) som en remsa, röd när den förlorar, grön när den vinner;
  - *orsak*: var och en av dess förluster som en stapel över där orsaken finns, i orsakens färg; håll musen över en stapel för dess rubrik och kostnad.
- **Kurvband**: ett skuggat band från varje kurvas inbromsning till utgång (som hittats på referensen) och dess namn (`T1` …) under axeln vid scheiteln.
- **Det valda fyndet**: ett band i dess orsaks färg över dess sträcka.
- **Raderna** (grafer), en per vald kanal, var och en med sitt namn och det övre och nedre värdet för sitt spann till vänster, och en nolllinje där spannet korsar noll. Varje varv är en linje i sin färg: det fokuserade varvet 2 px brett och helt ogenomskinligt, referensen ogenomskinlig, de andra 1,5 px vid 75 %. Gapraden utelämnar referensen (den är noll mot sig själv).
- **Markören**: en lodrät linje där referensbilen är (eller där pekaren är), och en prick per bil på varje rad utom gapet – vid markören är varje bil på samma meter; annars varje bils egen sträcka vid reprisklockan.

Högst **8** varv ritas: det fokuserade varvet, det bästa i sin klass och referensen först, sedan de andra i inläsningsordning.

### Raderna och deras höjder {#rows-and-their-heights}

Raderna delar diagrammets höjd efter vikt, ingen lägre än 16 px:

| Rad | Vikt |
|---|---|
| Gap (mot referensen, sekunder, med tecken) | 1,7 |
| Hastighet (km/h) | 1,7 |
| ett pedalreglage (gas, broms, koppling) | 1 |
| styrning | 1,1 |
| växel | 0,8 |
| en lampa (handbroms, ABS …) | 0,55 |
| allt annat | 1 |

En kanal med ett fast visningsspann i tabellen (pedalerna 0–100 %) använder det; andra anpassas till den synliga delen av varven. Ett radnamn som är för långt för utrymmet (ett långt ord på ett annat språk) flyttar det övre värdet ner en rad där raden är tillräckligt hög, och klipps med tre punkter där den inte är det; hela namnet visas som verktygstips.

### Standardgraferna {#the-default-graphs}

Tills grafer valts: **gapet**, sedan varje kanal som tabellen markerar `graph` och som varven har – gas, broms, koppling, handbroms, styrning, växel, hastighet – utom att en pedal- eller lampkanal utelämnas om inte något varv rör den över 0,02 (en koppling som aldrig trycks ner är ingen graf). Ordningen är tabellens.

### Grafväljaren {#the-graph-picker}

**Grafer (N) ▾** öppnar en panel ovanför knappen:

- en filterruta (matchar en kanals namn eller id);
- **Standard** (tillbaka till standarduppsättningen; dess verktygstips säger hur många) och **Stäng**;
- *Gap mot referensen*, sedan varje kanal som de ritade varven har, grupperade (rörelse, **Förarreglage**, motor, hjälpmedel, däck, bromsar, fjädring, hjul, övrigt, tid, position), en kryssruta var; en kanal per hjul är en rad med en bricka per hjul (FL, FR, RL, RR).

Kryssar du i behåller den tabellens ordning, oavsett i vilken ordning du kryssade i. Valet gäller tills du trycker **Standard** eller laddar om. Kanaler som tabellen inte känner till erbjuds under *övrigt*, med namn från deras egna id ("brakeLinePress" → "Brake line press").

### Hovra, hjul, zoom, klick {#hover-wheel-zoom-click}

| Åtgärd | Gör |
|---|---|
| hovra | varje bil, dess kort och dess reglage flyttar till den metern; en stolpe markerar den på banan; en tabell visar varje ritat varvs värde på varje rad där (gapet visas som "ref" för referensen); ovanför korten står "vid N m – diagrammens markör". När man lämnar grafytan återgår det till repriset |
| hjul | stegar repriset längs varvet med 1/200 av det synliga spannet per klick (Shift: 5×), och pausar repriset; när man zoomat följer vyn markören |
| Ctrl+hjul (Cmd+hjul) | zoomar sträckaxeln kring pekaren, 1,25× ut / 0,8× in per klick, aldrig smalare än 40 m; zoomar man ut till hela varvet upphör zoomen |
| sidled på hjulet | panorerar när man zoomat (10 % av spannet per 100 enheter rullning) |
| dubbelklick, **Hela varvet** | zooma ut |
| klick | hoppar repriset dit referensen når den metern |
| Shift+klick | ställer upp bilarna där (se [uppställning](race-replay-and-scene.md#lining-up)) |

Diagrammen ritas om på det aktuella språket när det ändras.

Tipsraden i teckenförklaringen säger samma sak kort: "Hovra: alla bilar där · hjul: stega längs varvet · Ctrl+hjul: zooma · klick: hoppa · Shift+klick: ställ upp".

## Bilkorten (HUD) {#the-car-cards-hud}

Uppe till vänster i vyn, ett kort per synligt varv – högst **6**, de sex första synliga varven i inläsningsordning – för det ögonblick som repriset (eller diagrammens markör) står på.

**Rubriken:** varvets färg och etikett; det levande gapet – det här varvets tid för att nå dess nuvarande sträcka minus referensens tid för att nå samma sträcka, "+0,48 s" – eller "referens"; **⋯** för att visa eller dölja alla övriga värden (samma som *Alla värden på korten*). Kortet för den jagade bilen är markerat.

**Bilen uppifrån:** kontur av karossen i varvets färg med en pil längst fram, fyra däck (framhjulen vridna upp till 28° med styrningen), vart och ett färgat efter sin temperatur, med samma symboler som 3D-bilen ritas med platt: slipring, fjäderstag, bromsglöd, slitageband, lastmätare.

**Avläsningar:** hastighet i km/h, varvets egen tid, dess sträcka längs referensen.

**Förarreglage:**

- ett ratt som vrids av styrningen (fullt utslag ritas som 180°) med procenten under sig;
- ett stapelmätare per pedal, från vänster till höger som i en pedallåda – koppling, broms, gas – var och en med sin procent och korta namn, i sin färg (bara de pedaler varvet har);
- växeln (R för back, N för neutral);
- en liten lampa per på/av-kanal som varvet har – handbroms, ABS, TC, DRS, depåbegränsare, i luften – tänd i sin färg när den är på (över hälften av sitt spann);
- en avläsning per nivåkanal: bromsbalans, ABS- och TC-inställningar, boost, bränsle.

**Reglagespåret:** de senaste **6 sekunderna** av varje pedal (ett fält, var och en i sin färg) och styrningen (eget fält, centrerat), och slutar i just detta ögonblick – vad föraren gjorde på väg in i det. Upp till 160 punkter.

**Alla värden** (⋯ eller *Alla värden på korten*): varje annan skalärvärde som varvet har i det här ögonblicket, sedan varje kanal per hjul som fyra värden (FL FR RL RR), med namn från kanaltabellen eller från kanalens eget namn, sorterade efter grupp.

## För utvecklare {#for-developers}

Kod: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Kanaltabellen {#the-channel-table}

`CHANNELS` i [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) är det enda stället där en kanal beskrivs: dess enhet, om den är ett värde per sampel eller ett per hjul (lagrad som `name.FL` …), dess grupp, ett visningsspann, hur den ritas på bilen (`glyph`), hur den syns på kortet (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), om den är en standardgraf, om den hoppar i steg i stället för att blandas (växel, flaggor), och hur den visas (skala, enhet, decimaler). Etiketter och korta namn är meddelanden på varje språk (`race.channel.<name>.label` / `.short`).

Kanaler med en ritning eller en standardgraf:

| Kanal | Enhet | Ritas som | Standardgraf |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedal (grön, röd, …), visas i % | ja |
| `handbrake` | 0..1 | lampa | ja |
| `steer` | -1..1, höger positiv | ratt | ja |
| `gear` | - | växel | ja |
| `speed` | m/s, visas km/h | - | ja |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | lampa | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | nivåavläsning | - |
| `tireTemp` (per hjul) | °C, visning 40–130 | däckfärg | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (per hjul) | så spelet skalar den, visning ±1,5 | slipring | - |
| `combinedSlip`, `slipIndex` (per hjul) | visning 0–1,5, 0–1 | slipring | - |
| `suspension` (per hjul) | 0..1 | fjäderstag | - |
| `brakeTemp` (per hjul) | °C, visning 100–900 | bromsglöd | - |
| `tireWear` (per hjul) | 0..1 | slitageband | - |
| `wheelLoad` (per hjul) | N, visning 0–12 000 | lastmätare | - |

Andra i tabellen (grafer och listade, inte ritade): `latAcc`, `longAcc`, `vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`, `vertVel`, `bodySlip` (driftvinkel), `loose`, `lateral` (förskjutning från referensen), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`, `tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`, `wheelSpeed`, `wheelSurfaceSpeed`, samt `time`, `distance`, `x`, `y`, `z`.

**En kanal som inte finns i tabellen** läses fortfarande in, ritas som graf (under *övrigt*) och listas på korten, med namn från sitt eget id. **För att ge den ett riktigt namn, en enhet och en ritning**, lägg till en post i tabellen (och dess etikettmeddelande i varje `src/i18n/locales/<språk>/race-channels.json`). En ny *sorts* hjulritning är en post i `WHEEL_GLYPHS` (glyph.ts) och dess platta tvilling `CARD_GLYPHS` (RaceHud.tsx); båda är typade efter sorten, så bygget misslyckas tills båda finns. `src/race/extensible.test.ts` kontrollerar att okända kanaler når graferna, att varje symbol i tabellen kan ritas och att lamporna tänds.
