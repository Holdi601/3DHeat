---
title: "Diagrammer an d'HUD"
parent: "Course-Analys"
nav_order: 53
lang: "lb"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Diagrammer an d'HUD

Diagrammer leeën Är Ronnen Meter fir Meter nieft eneen, sou datt Dir gesitt, wou ee Fuerer méi spéit gebremst oder méi fréi vum Gas geholl huet. D'Kaarten uewe lénks an der Usiicht weisen, wat all Auto an all Fuerer grad mécht.

![Diagrammer ënner der Usiicht: Reien fir Ofstand, Vitess, Gas, Brems a Lenkung fir zwou Ronnen, uewen d'Zäit- an Ursaachsstreifen, an de Cursor mat de Kaarten](../assets/img/en/race-charts-rows.webp)

## D'Diagrammer {#the-charts}

All Ronnen op enger Distanzachs - Meter laanscht d'Referenz (kuckt [eng Distanzachs](race-corner-analysis.md#one-distance-axis)) - sou datt dat selwecht x fir all Ronn dee selwechte Platz op der Strecke ass. Eng Ronn gëtt eleng gezeechent (a spillt of); eng zweet Ronn vun der selwechter Strecke gëtt mat där verglach. Wann keng Ronnen gelueden sinn (oder d'Analys net geklappt huet), steet an der Fläch: "Diagrammer erschéngen, soubal eng Ronn gelueden ass; ladet eng aner vun der selwechter Strecke, fir déi zwee ze vergläichen."

### Wat drop ass {#what-is-on-them}

- **D'Legend**: d'Faarf an de Numm vun all gezeechent Ronn, d'Referenz mat "(Referenz)" markéiert; "+N méi gemoolt, net am Diagramm", wann méi Ronnen sichtbar sinn, wéi am Diagramm stinn; **Graphen (N) ▾**; **Ganz Ronn**, wann gezoomt ass; eng Zeil Hiweis.
- **Zwee Streifen** uewen, fir d'fokusséiert Ronn:
  - *Zäit*: d'[Zäitkaart](race-replay-and-scene.md#time-map-where) als Streifen, rout wann een verléiert, gréng wann een gewënnt;
  - *Ursaach*: all Verloscht vun hir als Balken iwwer dem Plaz, wou hir Ursaach ass, an der Faarf vun der Ursaach; fuert mat der Moss iwwer e Balken fir säin Titel an d'Käschten.
- **Kurvenbänner**: en schattéierte Bann vun all Kurv hirem Ufank bis zum Ausgang (wéi op der Referenz gefonnt) an hire Numm (`T1` …) ënner der Achs um Scheitelpunkt.
- **De gewielte Ergebnis**: en Bann a senger Ursaachsfaarf iwwer senger Reechweit.
- **D'Reien** (Graphen), eng pro gewielter Kanal, mat hirem Numm an dem uewen a ënnen Wäert vun hirer Reechweit lénks, eng Nulllinn, wou d'Reechweit duerch Null geet. All Ronn ass eng Linn a senger Faarf: d'fokusséiert Ronn 2 px breet an voll, d'Referenz voll, déi aner 1,5 px a 75 %. D'Ofstandsrei léisst d'Referenz eraus (si ass mat sech selwer null).
- **De Cursor**: eng senkrecht Linn, wou d'Referenz-Auto ass (oder wou d'Zeiger ass), a jidde Punkt pro Auto op all Rei ausser dem Ofstand - um Cursor ass all Auto um selwechte Meter; soss d'eegen Distanz vun all Auto bei der Replay-Auer.

Héchstens **8** Ronnen ginn gezeechent: d'fokusséiert Ronn, de Beschten vun hirer Klass an d'Referenz als éischt, dann déi aner an der Ladereiefolleg.

### Reien an hir Héicht {#rows-and-their-heights}

D'Reien deelen d'Héicht vum Diagramm no hirem Gewiicht, keng méi kleng wéi 16 px:

| Rei | Gewiicht |
|---|---|
| Ofstand (zur Referenz, Sekonnen, mat Virzeechen) | 1,7 |
| Vitess (km/h) | 1,7 |
| e Pedal (Gas, Brems, Koppelung) | 1 |
| Lenkung | 1,1 |
| Gank | 0,8 |
| eng Lampe (Handbrems, ABS …) | 0,55 |
| alles anescht | 1 |

E Kanal mat enger fester Unzeegereechweit an der Tabell (Pedale 0-100 %) benotzt déi; déi aner ginn un de sichtbare Stéck vun de Ronnen ugepasst. En Reinumm, deen ze laang fir de Plaz ass (e laange Wuert an enger anerer Sprooch), rekt de uewen Wäert eng Zeil no ënnen, wann d'Rei héich genuch ass, a gëtt mat enger Ellipse ofgeschnidden, wann net; de ganze Numm steet am Tooltip.

### D'Standardgraphen {#the-default-graphs}

Bis Dir Graphen auswielt: den **Ofstand**, dann all Kanal, dee d'Tabell als `graph` markéiert an deen d'Ronnen hunn - Gas, Brems, Koppelung, Handbrems, Lenkung, Gank, Vitess - ausser en Pedal- oder Lampekanal bleift weg, ausser eng Ronn bewegt en iwwer 0,02 (eng Koppelung, déi ni gedréckt gëtt, ass kee Graph). D'Rei ass die vun der Tabell.

### D'Graphe-Auswiel {#the-graph-picker}

**Graphen (N) ▾** mécht e Panel iwwer dem Knäppchen op:

- e Filterfeld (passt op den Numm oder d'ID vun engem Kanal);
- **Standard** (zréck op de Standardsaz; den Tooltip seet, wéivill) an **Zoumaachen**;
- *Ofstand zur Referenz*, dann all Kanal, dee d'gezeechent Ronnen hunn, gruppéiert (Bewegung, Agaben, Motor, Hëllefen, Pneien, Brems, Federung, Rieder, Anerer, Zäit, Positioun), mat engem Kästchen all; e Kanal pro Rad ass eng Zeil mat engem Chip fir all Rad (FL, FR, RL, RR).

Wat Dir ukreest, bleift an der Reiefolleg vun der Tabell, egal an wéi enger Reiefolleg Dir se ukreest. D'Auswiel hält, bis Dir **Standard** drécke oder neilueden. Kanäl, déi d'Tabell net kennt, ginn ënner *anerer* ugebueden, mat hirer eegener ID als Numm ("brakeLinePress" → "Brake line press").

### Hovern, Rad, Zoom, Klick {#hover-wheel-zoom-click}

| Agab | Mécht |
|---|---|
| Hoveren | all Auto, seng Kaart an seng Agaben réckelen op deen Meter; e Pfosten markéiert en op der Strecke; eng Tabell weist all gezeechent Ronn säi Wäert op all Rei do (Ofstand als "ref" bei der Referenz); iwwer de Kaarten "bei N m - de Cursor vun de Diagrammer". Wann Dir d'Moss vum Plot fortbréngt, gëtt et zréck un d'Replay |
| Scrollrad | setzt d'Replay laanscht d'Ronn um 1/200 vun der sichtbarer Spann pro Rascht weider (Shift: 5×), hält d'Replay un; wann gezoomt ass, follegt d'Usiicht dem Cursor |
| Ctrl+Scrollrad (Cmd+Scrollrad) | zoomt d'Distanzachs ëm de Zeiger, 1,25× eraus / 0,8× eran pro Rascht, ni méi enk wéi 40 m; ronderëm erauszoomen op d'ganz Ronn ophält de Zoom |
| Scrollrad zur Säit | schwenkt, wann gezoomt ass (10 % vum Spann pro 100 Eenheeten Scroll) |
| Duebelklick, **Ganz Ronn** | zoomt eraus |
| Klick | spréngt d'Replay op de Plaz, wou d'Referenz deen Meter erreecht |
| Shift+Klick | stellt d'Autoen do nieft eneen (kuckt [nieft eneen stellen](race-replay-and-scene.md#lining-up)) |

D'Diagrammer zeechnen sech nei an der aktueller Sprooch, wann se sech ännert.

D'Hiweiszeil an der Legend seet dat selwecht kuerz: "Hovern: all Auto do · Scrollrad: laanscht d'Ronn goen · Ctrl+Scrollrad: zoomen · Klick: sprangen · Shift+Klick: nieft eneen stellen".

## D'Autokaarten (HUD) {#the-car-cards-hud}

Uewe lénks an der Usiicht, eng Kaart pro sichtbarer Ronn - héchstens **6**, déi éischt sechs sichtbar Ronnen an der Ladereiefolleg - fir de Moment, wou d'Replay (oder de Cursor vun de Diagrammer) steet.

**Kopf:** d'Faarf an de Numm vun der Ronn; de Live-Ofstand - d'Zäit vun dëser Ronn fir hir aktuell Distanz z'erreechen, minus d'Zäit vun der Referenz fir déi selwecht Distanz, "+0,48 s" - oder "Referenz"; **⋯** fir all anere Wäerter ze weisen oder ze verstoppen (dat selwecht wéi *All Wäerter op den Kaarten*). D'Kaart vum Auto, dat verfollegt gëtt, ass higelait.

**Den Auto vu uewen:** d'Ëmrëss vum Kierper an der Faarf vun der Ronn mat engem Pfeil vir, véier Pneien (déi vir sech mat der Lenkung bis 28° dréinen), all a senger Temperaturfaarf, mat deenselwechte Symboler wéi de 3D-Auto, flaach gezeechent: Schlupfring, Federungsbalken, Brems-Glühen, Verschleessband, Laaschtbalken.

**Ablesungen:** Vitess a km/h, d'eegen Zäit vun der Ronn, hir Distanz laanscht d'Referenz.

**Agaben:**

- e Lenkrad, dat mat der Lenkungsagab gedréint gëtt (voller Ausschlag als 180° gezeechent), mat dem Prozentsaz drënner;
- e Balken pro Pedal, vu lénks no riets wéi an enger Pedalbox - Koppelung, Brems, Gas - all mat sengem Prozentsaz a kuerzem Numm, a senger Faarf (nëmmen d'Pedale, déi d'Ronn hunn);
- de Gank (R fir Réckwäerts, N fir Neutral);
- eng kleng Lampe pro Ein/Aus-Kanal, dee d'Ronn hunn - Handbrems, ABS, TC, DRS, Boxenbegrenzer, an der Loft - an hirer Faarf ugemaach, wann se un ass (iwwer der Hallschent vun hirer Reechweit);
- eng Ablesung pro Niveau-Kanal: Bremsbalance, ABS- a TC-Astellungen, Turbo, Brennstoff.

**Den Agabeverlaf:** déi lescht **6 Sekonnen** vun all Pedal (eng Spur, all a senger Faarf) an d'Lenkung (hir eegen Spur, mëtt-zentréiert), déi bei dësem Moment ophalen - wat den Fuerer gemaach huet, bis dohinner. Bis zu 160 Punkten.

**All Wäerter** (⋯ oder *All Wäerter op den Kaarten*): all aner Skalar, deen d'Ronn bei dësem Moment huet, dann all Kanal pro Rad als véier Wäerter (FL FR RL RR), mat hiren Nimm aus der Kanaltabell oder aus dem eegenen Numm vum Kanal, no Grupp gerechent.

## Fir d'Entwéckler {#for-developers}

Code: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### D'Kanaltabell {#the-channel-table}

`CHANNELS` an [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts)
ass déi eenzeg Plaz, wou e Kanal beschriwwe gëtt: seng Eenheet, ob et ee Wäert pro Probe oder ee pro Rad ass (als `name.FL` … gespäichert), seng Grupp, eng Unzeegereechweit, wéi en um Auto gezeechent gëtt (`glyph`), wéi en an der Kaart erschéngt (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), ob en en Standardgraph ass, ob en springt statt ze verlafen (Gank, Flaggen), an wéi en gewise gëtt (Skala, Eenheet, Stellen). Nimm a kuerz Nimm sinn Texter a jeder Sprooch (`race.channel.<name>.label` / `.short`).

Kanäl mat enger Zeechnung oder engem Standardgraph:

| Kanal | Eenheet | Gezeechent als | Standardgraph |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | Pedal (gréng, rout, …), a % gewisen | jo |
| `handbrake` | 0..1 | Lampe | jo |
| `steer` | -1..1, riets positiv | Lenkrad | jo |
| `gear` | - | Gank | jo |
| `speed` | m/s, a km/h gewisen | - | jo |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | Lampe | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | Niveau-Ablesung | - |
| `tireTemp` (pro Rad) | °C, Unzeeg 40-130 | Pneufaarf | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (pro Rad) | sou wéi d'Spill et skaléiert, Unzeeg ±1,5 | Schlupfring | - |
| `combinedSlip`, `slipIndex` (pro Rad) | Unzeeg 0-1,5, 0-1 | Schlupfring | - |
| `suspension` (pro Rad) | 0..1 | Federungsbalken | - |
| `brakeTemp` (pro Rad) | °C, Unzeeg 100-900 | Brems-Glühen | - |
| `tireWear` (pro Rad) | 0..1 | Verschleessband | - |
| `wheelLoad` (pro Rad) | N, Unzeeg 0-12 000 | Laaschtbalken | - |

Anerer an der Tabell (als Graph a Lëscht, net gezeechent): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (Driftwénkel), `loose`, `lateral` (Offset zur Referenz), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, dozou `time`, `distance`, `x`, `y`, `z`.

**E Kanal, deen net an der Tabell steet**, gëtt trotzdem gelies, gegraphen (ënner *anerer*) a op de Kaarten gelëscht, mat sengem eegenen Numm als Bezeechnung. **Fir him en richtegen Numm, eng Eenheet a eng Zeechnung ze ginn**, setzt een ee Element an d'Tabell (an seng Nimm-Texter an all `src/i18n/locales/<Sprooch>/race-channels.json`). Eng nei *Aart* vu Radzeechnung ass een Element an `WHEEL_GLYPHS` (glyph.ts) an dat flaachen Gegestéck `CARD_GLYPHS` (RaceHud.tsx); béid sinn no der Aart getippt, sou datt de Bau feelt, bis béid do sinn. `src/race/extensible.test.ts` kontrolléiert, datt onbekannte Kanäl an d'Graphen kommen, datt all Symbol an der Tabell gezeechent ka ginn an datt d'Lampe liichten.
