---
title: "Autokontroll-Evenementer"
parent: "Course-Analys"
nav_order: 54
lang: "lb"
source: "race-control-events.md"
source_hash: "18fe9a0507bc"
translated: true
outdated: false
---

# Autokontroll-Evenementer

Den Viewer kuckt, wéi all Ronn gefuer gouf, a markéiert, wou de Fuerer de Auto léisst rutschen, dréien, géint eppes stéisst oder Gripp verléiert. Dat hëlleft, well en Feeler, deen Zäit kascht huet, ass dat Séierste fir ze reparéieren.

![Den Ofschnitt Autokontroll: wéi oft all Ronn e Rad blockéiert, gedréint oder no baussen gedréckt huet, an d'Lëscht vun de Feeler mat engem opgemaachten](../assets/img/en/race-control-table.webp)

## An einfache Wierder {#in-plain-words}

- **Blockéieren**: Dir bremst sou hart, datt e Rad stoe bleift a rutscht. De Wagen hält dann méi schlecht an kann net méi laenken.
- **Duerchdréien**: Dir drécken de Gaas sou staark, datt d'Antriebsräder méi séier dréien, wéi de Wagen fiert. Dir verléiert Kraaft.
- **Iwwersteieren**: Den Heck vum Wagen rutscht no baussen. Wann en ganz rëm dréint, ass dat e **Dréier**.
- **Ënnersteieren**: Den Dir vum Wagen rutscht no baussen („schiebt"); méi um Lenkrad drièn hëlleft net.
- **Treffer** an **Ofstuerz**: De Wagen huet eppes beréiert (en Treffer ass e Stuess oder en Kratzer, en Ofstuerz ass e haarden).
- **ABS**, **TC**: d'Hëllefsystemer vum Wagen, déi géint Blockéieren a Duerchdréien schaffen. Dat sinn keng Feeler.

## De Ofschnitt Autokontroll (wat Dir gesitt) {#the-car-control-section-what-you-see}

Fir d'Ronn, déi gewielt ass, zeigt en alles, wat d'Ronnen mat sech bréngen. Ouni Reifenschlupp an ouni Drift-Wénkel zeigt en trotzdem, wat nach fonnt ka ginn (ënnen).

**D'Tabell**: eng Zeil pro Aart, déi eng vun de Ronnen weist - Blockéierte Rieder, Duerchdréien, Heck rutscht (Iwwersteieren an Dréier), Nach baussen dréckt, Ofstuerzen, Treffer, ABS aktiv, Traktiounskontroll aktiv, Handbrems, An der Loft. All Zell heescht „Zuel · Sekonnen", fir d'gewielt Ronn an d'Ronn, mat där se verglach gëtt. Wann et e Drift-Wénkel gëtt, steet do och *Gréisste Drift-Wénkel* (den gréisste um Buedem).

**D'Lëscht**: hir Feeler, déi net vun beiden Ronnen gedeelt ginn an, mindestens 0,02 s kascht, déi deiersten als éischt, héchstens 12. All huet säin Titel an de Kascht (an de Chip vun der Aart). Klickt Dir op ee, gesitt Dir d'Tipp, stellt d'Autoen 40 m virdrun an. Dir kënnt en dann nach eng Kéier kucken. **Och wat béid Ronnen do gemaach hunn** weist all Feeler, och déi gedeelten (Chip „béid hunn et gemaach", Kascht „—" ënner 0,01 s). Wann et keng gëtt: „Wat X mat den Rieder gemaach huet, huet him keng Zäit gekascht, wat Y net gemaach huet."

**De Hiweis drënner** seet, mat wat d'Erkennung kucke konnt - „Aus dem Schlupp vun all Rad an dem Schlupfwénkel, an dem Drift-Wénkel vum Wagen." (oder Schlupp an Schlupfwénkel, Schlupp an Drift-Wénkel, nëmmen Schlupp, oder „Nëmmen aus dem Drift-Wénkel vum Wagen - dës Ronnen hunn kee Reifenschlupp."). Dobäi steet de Buedem, fir deen d'Grenzen gemooss goufen (Asphalt, lass, gemëscht: iwwer 80 % lass Muster ass lass, ënner 20 % Asphalt), op wéi enger Ronn d'Evenementer ugewannt goufen, an wéi de Kascht gezielt gëtt.

Wann **kee Reifenschlupp an kee Drift-Wénkel** do sinn (eng FH-Companion-Ronndatei ouni hir Telemetrie), gi Tabell an Lëscht trotzdem gewisen. De Hiweis seet, wat aus deem gefunnt gouf, wat d'Ronnen hunn: „Dës Ronnen hunn kee Reifenschlupp an kee Drift-Wénkel, dofir kënne Blockéierungen an Duerchdréien net erkannt ginn. Trotzdem fonnt: Dréckeen, aus dem Lenken géint de Wee; Treffer an Ofstuerzen, aus der Geschwindegkeet an der Beschleunegung." Rutscher aus der Gierrate ginn och genannt, wann d'Ronnen eng hunn; Dréckeen nëmmen, wann et Lenkdaten gëtt. De Saz iwwer d'Grenzen fir Schlupp an Drift fällt weg, an en zweete Hiweis seet: „Fir Forza Horizon wielt och d'Datei `.tele.gz` nieft all FH-Companion-Ronn: dat ass déi voll Telemetrie, all Rad sengen Schlupp 64 Mol pro Sekonn."

Dat **ganz** Kascht vun der Autokontroll vun enger Ronn (dat an den Zesummefaassungen benotzt gëtt) zielt sech iwwerlappend Feeler - e Blockéieren an de Rutsch, deen dodrop folgt, bannent 40 m - eemol, am héchsten Kascht vum Pak.

## Wéi d'Erkennung leeft {#how-it-is-detected}

De Rescht vun dëser Säit ass d'Regelbuch: all Aart, all Schwell.

Code: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
D'Iwwerleeungen an d'Literatur stinn an [der Method](race-analytics.md).

## D'Aarten {#the-kinds}

| Aart | Tabellezeil | En Feeler? | Kuerzsten, deen zielt |
|---|---|---|---|
| `lock` | Blockéierte Rieder | jo | 0,1 s |
| `wheelspin` | Duerchdréien | jo | 0,15 s |
| `oversteer` | Heck rutscht | jo | 0,2 s |
| `spin` | (mat Heck rutscht gezielt) | jo | 0,1 s |
| `understeer` | Nach baussen dréckt | jo | 0,25 s |
| `crash` | Ofstuerzen | jo | - |
| `hit` | Treffer | jo | - |
| `abs` | ABS aktiv | nee | 0,2 s |
| `tc` | Traktiounskontroll aktiv | nee | 0,2 s |
| `handbrake` | Handbrems | nee | 0,1 s |
| `airborne` | An der Loft | nee | 0,15 s |

Kuerz Sequenzen si Rauschen (e Bordstee, eng Bodelen, eng eenzeg Miessung). Sequenze vu Gitterpunkten (all 2 m), déi e Test passéieren, ginn iwwer Lücken vun bis zu 2 Punkten zesummegeholl. Nëmmen **Feeler** kënne Fehler sinn a kascht Zäit; déi anerer si dat, wat den Wagen an den Dréier gemaach hunn.

## Wat all Test brauch {#what-every-test-needs}

### Oflaaden Kanäl {#derived-channels}

Ier iergend eppes beurteelt gëtt, kritt all Ronn dat, wat hiert Spill net schéckt, ënner kanonesche Nimm (den eegene Wäert vum Spill gëtt ëmmer virgezunn):

| Kanal | Vun |
|---|---|
| `bodySlip` (Drift-Wénkel) | d'Geschwindegkeet am Wagerumfeld, `atan2(latVel, abs(longVel))`, wann d'Spill se schéckt (0 ënner 3 m/s); soss d'Richtung vum Wagen (dat Gier vum Spill, un d'Fahrrichtung ugepasst duerch Vorzeechen an Offset iwwer Proben, déi méi schnell wéi 10 m/s sinn, nëmmen ugeholl mat enger kreesfërmeger Varianz ënner 0,05) géint d'Fahrrichtung (Positiounen mindestens 2 m auserneen), bei Geschwindegkeeten iwwer 3 m/s |
| `yawRate` | d'Ännerung vum `yaw` iwwer d'Zäit, wann et eng Richtung gëtt, awer keng Rate |
| `airborne` | all Rad ouni Bodekontakt (≤ 0,5); soss all Rad mat manner wéi 5 % vu sengem Mëttelwäert Last; soss all Federweg bei oder ënner 0,02 (ganz ausgestreckt). Eng eenzeg verloossen Miessung ass kee Fluch |
| `slipRatio.<W>` | `(Radflächegeschwindegkeet - Wagengeschwindegkeet) / Wagengeschwindegkeet` iwwer 3 m/s, wann d'Spill d'Radflächegeschwindegkeet schéckt; oder aus Raddréiung × engem Rollradius, gemooss op der Ronn - de Mëttelwäert vun `Geschwindegkeet / Drehung`, wann de Wagen gerade rullt (Geschwindegkeet > 10 m/s, Gaas < 0,3, Bremse < 0,05, abs(Längsbeschleunegung) < 3 m/s², net an der Loft; all Miessung iwwer 10 m/s, wann et manner wéi 20 sinn), ugeholl tëscht 0,1 an 1 m. Markéiert `physical` |
| `loose` | Forza sengt Buedemrumpel op mindestens 2 Rieder (> 0,001) fir mindestens 0,33 s (e Bordstee ass méi kuerz), Lücke ënner 1 s iwwerbrécken |

### Um Buedem a beruegt {#on-the-ground-and-settled}

Näischt gëtt an der Loft beuerteelt oder **0,3 s no enger Landung** - d'Federung dréckt duerch, an d'Beschleunegunge spären op, dat ass kee Gripp, kee Bremsen an kee Schub. Eng Miessung muss och **a Bewegung** sinn: méi schnell wéi 5 m/s.

### De Buedem {#the-ground}

De Buedem vun all Miessung ass **lass**, wann de Kanal `loose` vun der Ronn dat sot (Forza säi Buedemrumpel, Trackmania seng Radmaterialien), soss d'Uewerfläch vun der Ronn (kuckt [Disziplin a Buedem](race-loading-laps.md#discipline-and-surface)): Asphalt, oder lass fir alles anert. Kurven, Drift-Gewunnechten a Grenzen sinn fir Asphalt an fir lass getrennt.

### Schlupp, als Vilfaches vum nominellen Spëtzewäert vum Reifen {#slip-as-a-multiple-of-the-tyres-nominal-peak}

D'Spiller skaléieren de Schlupp ënnerschiddlech; `meta.slip` seet, wéi, an all Schlupp gëtt duerch eng Skala gedeelt, sou datt ongeféier 1 de nominelle Spëtzewäert vum Reifen ass:

| `meta.slip` | Bedeitung | Gedeelt duerch |
|---|---|---|
| `peak` | vum Spill normaliséiert: iwwer 1 verléiert Dir Gripp (Forza Data Out) | 1 |
| `scaled` | kierperleche Schlupp gedeelt duerch en Asphalt-Spëtzewäert (den Kunos-Recorder) | den nominelle Spëtzewäert vum Buedem iwwer dee vum Asphalt |
| `index` | e 0..1-Miessmoss (SlipCoef vu Trackmania) | 0,5 |
| `physical` (oder onbekannt) | Schlupfverhältnis als Bréch, Schlupfwénkel a Radiant | den nominelle Spëtzewäert vum Buedem |

Nominell Spëtzewäerter, wann näischt Besseres bekannt ass:

| Buedem | Schlupfverhältnis | Schlupfwénkel |
|---|---|---|
| Asphalt | 0,12 | 8° |
| gemëscht | 0,18 | 12° |
| lass (Schotter) | 0,25 | 15° |
| Schnéi | 0,25 | 15° |
| Äis | 0,10 | 6° |

### Wou de Gripp ophält: d'Reifekurve vum all Wagen {#where-grip-ends-each-cars-tyre-curves}

Wou e Reifen ophält méi ze ginn, gëtt **pro Wagen** gemooss, aus all belaaschte Ronn vun him (`measureTyres`), getrennt fir Asphalt an lass Buedem:

| Kurve | Miessungen (Geschwindegkeet > 10 m/s, beruegt, Beschleunegunge ënner 45 m/s²) | Schlupp (x) | Kraaft (y) |
|---|---|---|---|
| Bremsen | Bremse > 0,3, Handbrems ≤ 0,2, gerade fueren (Querbeschleunegung ënner 30 % vum Héchsten) | abs(mëttlere Schlupfverhältnis vun de véier Rieder) | Verzögerung |
| Traktioun | Gaas > 0,8, Bremse ≤ 0,05, gerade, den Vollgaas-Schub vum Wagen bei där Geschwindegkeet > 0,5 m/s² | dat gréisste Schlupfverhältnis vun engem Antriebsrad | Beschleunegung als Undeel vum Schub |
| Vir | Querbeschleunegung iwwer 30 % vum Héchsten, de Gripp vum Wagen bei där Geschwindegkeet > 1 m/s² | de gréissere Schlupfwénkel vir | Quer-Beschleunegung als Undeel vum Gripp |
| Hannen | dat selwecht | de gréissere Schlupfwénkel hannen | dat selwecht |

„Dat Héchst" ass den 99. Perzentil vum abs(Querbeschleunegung) vun der Ronn op deem Buedem (ganze Buedem, wann et manner wéi 50 Miessungen sinn). De Triebstrang entscheet, wéi d'Antriebsräder sinn (Virderrad, Hannerrad, Allrad; onbekannt: all).

Vun mindestens **150 Miessungen** un gëtt de Schlupp a 6 bis 14 gläich grouss Gruppe geschnidden (eng pro 40 Miessungen). Dat Kraaft vun all Grupp ass dat Ober-Quartil (wat de Reifen gouf, wann de Fuerer et verlaangt huet), gegleet iwwer d'Nopesgruppen. Dat **Bescht** ass d'Grupp mat der gréisster Kraaft; d'**Grenz** ass déi éischt Grupp, wann d'Kraaft ëm **8 %** gefall ass. Eng Kurv, déi an de Daten ni fält, huet keng Grenz (onendlech) - iwwer den „Spëtzewäert" ze fueren kascht an deem Spill näischt, an eleng de Schlupp markéiert do näischt (Forza Horizon seng Kurve fir Kurven an Traktioun sinn esou). Mat ze wéinege Miessungen op engem Buedem, gi déi vum anere Buedem benotzt; mat ze wéinege insgesamt, d'**nominell** Grenz: 1,5 Mol den nominelle Spëtzewäert.

All Wagen kritt och:

- seng **Drift-Gewunnecht**: dat Ober-Quartil vu sengem Drift-Wénkel, wou hien mat 60 % vu sengem Héchsten oder méi an d'Kurve geet (brauch 100 Miessungen);
- seng **Lenkung pro Krümmung** (`steerGain`), pro 5-m/s-Geschwindegkeetsband: de Mëttelwäert vun abs(Lenkung) / Pfadkrümmung, wann hien fest an d'Kurv geet, awer gutt bannent sengem Gripp (30-60 % vu sengem Héchsten, Krümmung méi enk wéi 400 m Radius, Lenkung iwwer 0,02; 25 Miessungen pro Band). D'Krümmung vum Pad ass d'Gierrate duerch d'Geschwindegkeet, wou d'Spill eng Gierrate schéckt, soss aus den Positiounen ±5 m.

## Erkennung, Aart fir Aart {#detection-kind-by-kind}

| Aart | Test (bei beruegte Miessungen) | `peak` an `limit` |
|---|---|---|
| **lock** | Bremse > 0,05, Handbrems net iwwer 0,2, an all Rad säin Schlupfverhältnis ënner de Minus vun der Bremsgrenz | de negativste Schlupf (Vilfache vum nominelle Spëtzewäert); d'Grenz als negativ |
| **wheelspin** | Gaas > 0,2 (oder kee Gaaskanal), an e Antriebsrad säin Schlupfverhältnis iwwer der Traktiounsgrenz | de gréisste Antriebsschlupf; d'Grenz |
| **oversteer** (Drift-Wénkel) | den Drift-Wénkel iwwer dem Minimum vum Buedem an 1,5 × der Drift-Gewunnecht vum Wagen dort | de gréissten Drift-Wénkel, Radiant |
| **oversteer** (Schlupfwénkel, ouni Drift-Wénkel) | de gréissere Schlupfwénkel hannen iwwer der Hannergrenz an méi wéi 0,25 iwwer dem gréissere vir | de Schlupfwénkel hannen (Vilfache vum Spëtzewäert) |
| **oversteer** (ouni Drift-Wénkel, awer Gierrate an Querbeschleunegung) | d'„Attitude-Geschwindegkeet" - abs(Gierrate) minus abs(Querbeschleunegung) / Geschwindegkeet, iwwer 8 m/s - iwwer 0,2 rad/s, mat der Lenkung géint d'Kurv | rad/s; Grenz 0,2 |
| **spin** | en Iwwersteier-Lauf, dessen Drift-Wénkel iwwer **60°** gaang ass | wéi Iwwersteieren |
| **understeer** (Schlupfwénkel) | net am Rutschen, de gréissere Schlupfwénkel vir iwwer der Virgrenz an méi wéi 0,3 iwwer dem hannen | de Schlupfwénkel vir; d'Grenz |
| **understeer** (ouni Schlupfwénkel) | méi schnell wéi 12 m/s, net am Rutschen, net géint d'Lenkung, Querbeschleunegung iwwer der Halschent vum Héchsten (99. Perzentil), Pad méi enk wéi 300 m Radius, an d'Lenkung méi wéi **1,6 Mol** wat de Wagen seng eege Lenkung pro Krümmung fir de Pad brauch | d'Mol gebraucht Lenkung; Grenz 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` iwwer 0,5 | - |
| **handbrake** | `handbrake` iwwer 0,2 | - |
| **airborne** | `airborne` iwwer 0,5 | - |
| **hit**, **crash** | kuckt [Treffer an Ofstuerzen](#hits-and-crashes) | d'Geschwindegkeet, déi den Treffer geholl huet |

Drift-Wénkel-Minima no Buedem: Asphalt **7°**, gemëscht **10°**, lass an Schnéi **15°**, Äis **10°**. Si halen sech un d'Literatur: De Schlupfwénkel vun engem Pneu erreecht säi Maximum bei 3–10° op Asphalt, d'Stabilitéitsgrenz vun engem Stroossenauto beim Schwammwénkel läit bei ongeféier 12° op dréchenem Asphalt, wärend Rallye an Drift mat 30–50° gefuer ginn ([Rennanalys, Quellen](race-analytics.md#sources)). E Wagen, deen als Gewunnecht méi dréit - e Reifemodell fir d'Arcade, e Spezialist fir Schotter - huet säin eegenen, méi héijen Wäert aus sengen eegenen Ronnen (1,5 × seng Gewunnecht).

**An wéi enger Richtung de Wagen dréit** (fir „géint d'Kurv"): d'Ännerung vun der Richtung vum Pad vun der Ronn iwwer ±6 m (mindestens 2 Gitterpunkten); méi enk wéi 600 m Radius zielt als Kurv; riets oder lénks no deem, ob d'Welt gespigelt ass. D'Lenkung ass **géint** d'Kurv, wann abs(Lenkung) iwwer 0,05 ass an hiert Zeechen dem vun der Kurv entgéint ass - en Rutsch, deen **agefaangen** gëtt mat Géigenlenkung.

**D'Pedalen wéi et ugefaang huet** (`pedal`): *Bremsen*, wann d'Bremse iwwer 0,1 ass; *Gaas*, iwwer 0,3; *lass*, wann d'Gaas iwwer 0,5 war an den 8 Gitterpunkten (16 m) virdrun; soss *rullen*. (Oder och wann et keen Gaaskanal gëtt.)

## Géint déi aner Ronn gemooss {#laid-against-the-other-lap}

All Evenement gëtt géint déi Ronn gemooss, mat där d'gewielt Ronn an deem Ofschnëtt verglach gëtt (déi schnellst vun hirer Klass; fir d'Ronn selwer, wiem vu senger Klass am schnellsten duerch den Ofschnëtt war):

1. **Wéi wäit d'anerer Ronn gaangen ass** iwwer déi selwecht Meter, ±8 m: déi eegene Evenementer vun der anerer Ronn vun der selwechter Familljen (en Dréier zielt wéi Iwwersteieren, en Ofstuerz wéi en Treffer), an deenselwechte Eenheeten gemooss, ouni Grenzen, mat den Reifekurven vum anere Wagen.
2. **Gedeelt**, wann d'anerer Ronn **80 %** esou wäit oder méi gaangen ass: dat ass wéi d'Kurv gefuer gëtt, kee Feeler. Net-Feeler-Aarten sinn ëmmer „gedeelt".
3. **Kascht**, fir e net gedeelte Feeler: d'Zäit, déi d'gewielt Ronn géint déi anerer verluer huet, vun 5 m virum Evenement bis **40 m nom** Evenement (bei engem Treffer oder Ofstuerz bis de Wagen seng Geschwindegkeet erëm huet - d'Meter, fir se bei sengem eegenen Schub erëm ze kréien, 40 bis 400 m; ouni gemooss Schub, 5 m/s²). Ni negativ.
4. **Geschwindegkeet ofginn** bis zum Limit vum Wagen: bei engem Blockéieren d'Verzögerung, déi de Wagen bei där Geschwindegkeet kann, minus dat, wat hien gemaach huet, zesummegezielt iwwer de Evenement; bei Duerchdréien säin Vollgaas-Schub minus dat, wat hien gemaach huet; bei engem Opschlag d'Geschwindegkeet, déi hien geholl huet. Gesot, wann et iwwer 0,5 m/s (1,8 km/h) ass.

En Feeler, deen net gedeelt ass an mindestens **0,02 s** kascht, gëtt opgelëscht ([d'Course-Statistiken](race-course-statistics.md) zielen nëmmen Feeler vu **0,03 s** oder méi, sou datt e Feeler, dee bei ville Ronnen gezielt gëtt, en kloren ass), a kann d'Ursaach fir de Verloscht an enger Kurv ginn (kuckt [Kurv-fir-Kurv-Analys](race-corner-analysis.md#car-control-faults-and-impacts)).

## Treffer an Ofstuerzen {#hits-and-crashes}

`impacts.ts` liest Treffer aus de **eegenen Miessunge vun der Ronn**, ier se nei gerechent ginn - en Treffer ass a Honnertstel vun enger Sekonn fäerdeg. Reifen kënnen d'Kräfte vun engem Treffer net maachen, dofir gëtt en Treffer um eegene Wagen vun der Ronn gemooss:

- **Säin Gripp `G`**: de 99. Perzentil vu senger Waasserechter Beschleunegung `√(lat² + long²)` iwwer d'Ronn, um Buedem a méi schnell wéi 5 m/s. Ouni Beschleunegungs-Kanäl (oder ënner 3 m/s²), 15 m/s² - dat ass de Gripp vun engem Stroossewon.
- **Schwell**: `max(1,8 G, G + 18, 30)` m/s².
- **Gestoussen Miessung**: d'Waasserechter Beschleunegung iwwer der Schwell *an* an iwwer d'Hallschent vun `G` vun der leschter Miessung sprangen; **oder** d'Geschwindegkeet fällt bannent 0,1 s ëm méi wéi de Schwell an 0,1 s huele géif, plus 1,5 m/s. Nëmmen um Buedem a beruegt, a nëmmen, wann de Wagen méi wéi 5 m/s séier war.
- Gestoussen Miessunge bannent **0,4 s** sinn ee Opschlag.
- **Virdrun / Duerno**: déi héchst Geschwindegkeet an den 0,15 s virdrun; déi nidderegst bis 0,3 s nom leschte gestoussene Miessung.
- **Kee Opschlag**: Geschwindegkeet fort ouni Kraaft dohanner - déi héchst waasserrecht Beschleunegung bannent 0,1 s ënner dem Méi vum `G` an 25 m/s² ass d'Spill, dat de Wagen zréck spult oder zrécksetzt.
- **Ofstuerz**, wann e **30 km/h** oder méi geholl huet, oder de Wagen op manner wéi d'Halschent vu senger Geschwindegkeet hannerlooss huet; soss **Treffer** - e Stouss, en Kratzer laanscht eng Mauer.
- **Richtung**: d'Längsbeschleunegung méi grouss wéi d'Quer, a negativ: *vir-op*; positiv: *vun hanne*; d'Quer méi grouss: *laanscht d'Säit*. Ouni Beschleunegunge: vir-op.

Wat e Wagen ausmécht gëtt gemooss, mat allen Treffer ewechgelooss, vu 0,1 s virum Treffer bis 1 s nom Treffer (`struckMask`).

## D'Texter {#the-texts}

All Evenement gëtt gesot, mat Nimm vun béide Ronnen, mat wou (Meter laanscht d'Referenz), d'Geschwindegkeet, mat där et ugefaang huet, wéi wäit iwwer d'Grenz géint déi anerer Ronn, an e Tipp. De Tipp follegt aus der Aart a dem, wat gemooss gouf:

| Evenement | Tipp |
|---|---|
| Blockéieren, nëmmen vir | e blockéierte Virderrad kann net lenken: manner Drock um Ufank vun der Zone, eropgaang Drock an d'Kurv ofloossen |
| Blockéieren, nëmmen hannen | e blockéierte Hannerrad léisst de Wagen sech drénken: méi a grader Linn bremsen, an der Kurv d'Bremse méi lues loossen; wann et weider geschitt, d'Bremsverdeelung no vir verréckelen |
| Blockéieren, lass Buedem | e blockéiert Rad pflügt weider: ganz lues drécken, bis just virum Blockéieren |
| Blockéieren, soss | ze vill Pedal fir de Gripp: méi lues an offgebaut drécken |
| Duerchdréien | de Gaas dermat erabloossen, wann d'Lenkung sech lues ausdréint (op lasse Buedem: en héigerer Gang mécht den Drehmoment méi mëll) |
| Dréier / Iwwersteieren | no dem Pedal: ënner dem Bremsen (ze vill Trail-Bremsen, e Réck-Schalten ze fréi), ofgehuewen (Ofhiewen-Iwwersteieren: e stännege Gaas halen), um Gaas (ze vill, wann nach gedréint), keen vun deenen (ze séier an d'Kurv gaang); „mat Géigenlenkung agefaangen", wann Géigenlenkung gemaach gouf; op lasse Buedem oder bei engem Rally: „e Wénkel ass de séiere Wee ronderëm - dem anere säin Lauf war genuch" |
| Ënnersteieren | méi Lenkung hëlleft näischt, wann de Virderrad schonn ofgaangen ass: méi lues an d'Kurv kommen, e bëssen Bremsen zéien fir de Virderrad ze belueden, ofdréien; op lasse Buedem de Wagen mat engem Lift oder engem Dab mam lénksen Fouss drénken |
| Treffer / Ofstuerz | laanscht d'Säit: e Meter Rand kascht manner wéi de Kratzer; vun hanne: en anere Wagen oder réckwärts rutschen; e Frontal-Ofstuerz: fréier bremsen; e Stouss vir: eppes gestreift. „X huet do och getraff." wann gedeelt |

Bei Trackmania seet en Rutsch och: ënner ongeféier **400 km/h** (**300** op lasse Buedem: Dreck, Gras, Plastik) gëtt e Rutsch manner Drock wéi Gripp; driwwer gewënnt en Geschwindegkeetsrutsch mam richtegen Wénkel, an dësen huet Zäit gekascht, also war säin Wénkel falsch.

## Wat all Quell erlaabt {#what-each-source-allows}

| Ronne hunn | Blockéieren / Duerchdréien | Iwwersteieren / Dréier | Ënnersteieren |
|---|---|---|---|
| Schlupfverhältnis an Schlupfwénkel pro Rad, Wagengeschwindegkeet (Forza Data Out, d'AC-Spiller) | aus dem Schlupf | aus dem Drift-Wénkel, oder aus dem Schlupfwénkel hannen | aus den Schlupfwénkelen |
| Radgeschwindegkeeten, Weltgeschwindegkeet (Rally-Spiller, BeamNG) | aus dem gerechente Schlupf | aus dem gerechente Drift-Wénkel | aus der Lenkung pro Krümmung |
| Gier an Gierrate, kee Schlupf (iRacing) | - | aus dem Drift-Wénkel (dat ugepasst Gier géint d'Fahrrichtung); aus der Attitude-Geschwindegkeet mat Géigenlenkung nëmmen, wann dem Gier net ze trauen ass | aus der Lenkung pro Krümmung |
| nëmme Richtung | - | aus der Richtung géint de Wee | aus der Lenkung pro Krümmung |
| FH-Companion-Ronndatei eleng (kee Gier, kee Schlupf) | - | - | aus der Lenkung pro Krümmung (si hat Lenkung an Beschleunegungen) |

Treffer an Ofstuerzen brauchen nëmmen d'Geschwindegkeet (besser mat Beschleunegungen), dofir hunn all Quellen se. De **Ofschnitt Autokontroll** weist, wat all Quell erlaabt: bei enger FH-Companion-Ronndatei eleng seng Dréckeen aus der Lenkung, a seng Treffer, an de Hiweis, fir de Rescht de `.tele.gz` ze lueden.
