---
title: "Replay an d'3D-Szen"
parent: "Course-Analys"
nav_order: 52
lang: "lb"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Replay an d'3D-Szen

Spillt Är Ronnen zesumme zréck, wéi e Rennen, a kuckt, wou ee Auto vir zitt. Alles, wat Dir an der 3D-Usiicht vum Tab **Course-Analys** gesitt, gëtt hei beschriwwen: déi gefuerene Linnen, d'Faarwen op der Streck, d'Autoen an d'Beschrëftungen.

![Ursaachekaart mat den Autoen opgestallt 40 m vor enger Kurv: faarwege Streck, zwee Autoen an de Fändelpost](../assets/img/en/race-replay-lined-up.webp)

## D'Replay-Auer {#the-replay-clock}

Eng Auer steiert all Ronn: Sekonnen vun der **Referenz**-Ronn. D'Maschinn zielt se bei all Bild weider, wann gespillt gëtt (no der Bildzäit × Replay-Geschwindegkeet); um Enn fänkt se bei 0 un, wann **Endlosschleif** un ass, soss stoppt se. D'Auer ass bewosst net am Späicher, sou datt d'Säitelleescht sech net bei all Bild nei opbaut; de HUD an d'Diagrammer hunn se abonnéiert a aktualiséiere sech héchstens eemol pro Bild.

**D'Längt vum Replay** ass déi längst Zäit, déi eng Ronn op der Auer leeft: all Ronn hir Zäit (minus hire Versatz bei *Opgestallt*), oder d'Zäit vun der Referenz bei *Niewenteneen*.

## D'Transportleescht {#the-transport-bar}

Ënner der Usiicht, vu lénks no riets:

| Steierung | Mécht |
|---|---|
| ⏮ | zréck op den Ufank (och **Home**) |
| ▶ / ❚❚ | spillen / paus (och **K**) |
| Geschwindegkeet | 0,25×, 0,5×, 1×, 2×, 4× |
| Schiebereglerbalken | setzt d'Auer direkt, a 0,01-s-Schrëtt |
| Auer | `Zäit / Längt · Meter`: d'Auer als Rondenzäit, d'Längt vum Replay, an wéi wäit d'Referenzrenner op der Referenz ass |
| *Vum Start* / *Opgestallt* / *Niewenteneen* | den Replay-Modus (hei ënnen) |
| **Hei opstellen** | setzt all Auto do, wou d'Referenz jeeztert ass, a fiert vun do weider |
| **Endlosschleif** | fänkt um Enn vir vir (standardméisseg un) |
| **Diagrammer verstoppen** / **Diagrammer weisen** | d'Distanzdiagrammer ënner der Leescht |

D'Knäppercher sinn deaktivéiert, bis Ronnen gelueden sinn (eng Ronn reicht fir se ze spillen; Verglächer brauchen zwou).

## Replay-Modi {#replay-modes}

Wéi d'eege Zäit vun all Ronn aus der Auer kënnt:

| Modus | Zäit vun all Ronn | Wat gewisen gëtt |
|---|---|---|
| **Vum Start** (`start`) | d'Auer selwer | all Ronn vun hirem eegenen Start: e Rennen tëscht hinnen, d'Ofstänn wuessen, wéi se op der Streck gewuess sinn |
| **Opgestallt** (`anchor`) | d'Auer plus de Versatz vun der Ronn | all Autoen op der selwechter Plaz zur selwechter Zäit, dann lassen se lass - wat vun deem Punkt un geschitt, net vum Ufank vun der Ronn |
| **Niewenteneen** (`locked`) | d'Zäit, zu där d'Ronn d'aktuell Distanz vun der Referenz erreecht huet | all Autoen op der Distanz vun der Referenz gehalen de ganze Lap: Geschwindegkeeten an Steierungen Meter fir Meter verglach |

Benotzt en, wann:

- **Vum Start**: Dir wëllt gesinn, wie vir ass a wéi d'Ofstand wiisst.
- **Opgestallt**: Dir wëllt wëssen, wat an enger Kurv oder op engem Geroudstéck geschitt, mat jidderengem gläich ugefaang do.
- **Niewenteneen**: Dir wëllt vergläichen, wat d'Fuerer mat Pedalen a Vollekrees op der selwechter Plaz vum Parcours maachen.

**Versaatz bei *Opgestallt*:** fir en Ankerpunkt bei `s` Meter laanges der Referenz ass d'Versaatz vun all Ronn hir eegen Zäit bei `s` minus d'Zäit vun der Referenz bei `s`, beides aus den ausgeriichte Ronnen gelies (kuckt [eng Distanzachs](race-corner-analysis.md#one-distance-axis)). Eng Ronn, déi `s` net ofdeckt, behält de Versaatz 0. Wann Der *Opgestallt* aus de Modusknäppercher wielt, ankert et bei der aktueller Distanz vun der Referenz.

E wäisse Pfosten mat enger Fändel (14 m héich) markéiert den Ankerpunkt am Modus *Opgestallt*.

### Opstellen {#lining-up}

| Aktioun | Ankerpunkt | Auer |
|---|---|---|
| **Hei opstellen** | wou d'Referenz jeeztert ass | onverännert |
| Shift+Klick op d'Diagrammer | de geklickte Meter | 1,5 s ier d'Referenz en erreecht |
| e Befund an *Wou ze verbesseren*, eng nummeréiert Markéierung op der Streck, eng Zeil vun *Kurv fir Kurv* mat engem Befund | 40 m virun de Start vun der Ursaach vum Befund | 1,5 s virun dësem Punkt; dann spillt et |
| e Autosstüerungs-Evenement, d'Beschrëftung vun engem Zesummestouss | 40 m virun dem Evenement | 1,5 s virdrun; dann spillt et |
| eng Ronn an den Parcoursstatistiken | wéi hire Befund oder Evenement | wéi uewen, mat där Ronn fokusséiert |

Wann Dir en Befund ukuckt, rahmt d'Kamera en och - eng Kugel ronderëm d'Mëtt vum Befundberäich, mat engem Radius vum Gréisste vun 40 m an der Halschent vu senger Längt plus 30 m (60 m bei engem Evenement) - ausser d'Kamera verfollegt e Auto.

### Verfollegungskamera {#chase-camera}

⌖ an der Ronnelëscht léisst d'Kamera dat Auto verfollegen: 2,5 + 4 × Autogréisst Meter hannendrun an 0,9 + 1,1 × Autogréisst Meter uewendrdriwwer, de Blick an déi Fuerrichtung, no ënnen op d'Auto geneicht, a sanft (20 % vum Wee pro Bild), sou datt se mat all Wackel net zidderen. Nach eng Kéier ⌖ léisst se lass. Dat verfollegte Auto gëtt e bësse méi hell gezeechent, mat engem wäisse Ring um Buedem, an seng Kaart ass markéiert.

## D'Usiicht-Sektioun {#the-view-section}

| Steierung | Standard | Mécht |
|---|---|---|
| **Linnen** / **Zäitkaart** / **Ursaachekaart** / **Feelerkaart** | Zäitkaart | wat laanscht d'Streck gemoolt gëtt (hei ënnen); *Linnen* moolt näischt |
| Legend | - | *gewënnt ↔ verléiert* bei der Zäitkaart, d'Ursaachefaarwen bei der Ursaachekaart, *wéineg Ronnen ↔ meescht Ronnen* bei der Feelerkaart |
| **Gefuer Linnen** | un | d'Linn vun all sichtbarer Ronn a senger Faarf |
| **Autoen** | un | d'Autoen, an d'Quelle vun den HUD-Kaarten |
| **Pneuen & Fiederung** | un | d'Rifentemperatur, d'Rutschringen, d'Fiederungsstäbercher an anerer Zeechen pro Rad, an d'Dachlampen op den Autoen |
| **Beschrëftungen** | un | d'Kurvennimm, nummeréiert Markéierungen, d'Zesummestoussbeschrëftungen, d'Kurvebeschrëftungen vun der Feelerkaart |
| **Streck aus de Ronnen** | un | eng Stroossenuewerfläch fir e Parcours ouni extrahéiert Modell (verstoppt, wann e Parcoursmodell gelueden ass) |
| **All Wäerter op de Kaarten** | aus | all Kanal, deen op all HUD-Kaart steet |
| **Reell Autosformen** | un | all Auto a Form vu sengem Gegestéck (kuckt [D'Autoen](#the-cars)); aus: de oppenen Einsitzer, deen näischt vun der Telemetrie verstächt |
| **Autogréisst** | 1× | 1× bis 10× an Schrëtt vun 0,5; 1× ass d'richteg Gréisst vum Auto, sou laang a breet wéi et am Spill ass. Nëmmen dësen Schieber ännert et |

## Gefuer Linnen {#driven-lines}

De Wee vun all sichtbarer Ronn duerch hir eegen Samples, an hirer Faarf, gezeechent 0,12 m ënner der opgeholler Positioun (d'Positioun vun engem Auto ass säi Referenzpunkt, 0,28 bis 0,47 m iwwer der Strooss bei extrahierte Forza-Parcoursen). Ee Punkt gëtt all 1,5 m behalen; mat méi wéi 10 sichtbaren Ronnen behalen d'Ronnen, déi net ukuckt ginn, all 6 m een (all Eckpunkt geet all Bild an d'GPU).

## D'Kaarten {#the-maps}

All dräi sinn Bänner laanscht de Wee vun der **Referenz**, 0,2 m ënner den opgehollte Positiounen, ee Viereck pro 2-m-Gitterschrëtt.

### Zäitkaart (`where`) {#time-map-where}

Fir déi fokusséiert Ronn: Sekonnen gewonnen oder verluer pro Meter géint d'Ronn, mat där se a deem Punkt verglach gëtt (déi bescht vun hirer Klass, oder fir d'Referenz déi schnellst aner Ronn duerch all Segment), aus der Ännerung vum ausgeriichte Deltawäert pro Gitterschrëtt, gegleet iwwer ±10 m. Rout, wou se Zäit verléiert, gréng, wou se gewënnt, gro dertëscht; d'Faarfskala ass d'95-Perzentil vun den absolute Wäerter, sou datt Spëtzen ofgeschnidde ginn an de gréissten Deel vun der Ronn am Beräich ass. 6 m breet.

### Ursaachekaart (`why`) {#cause-map-why}

Fir déi fokusséiert Ronn: all Verloscht gemoolt iwwer de Beräich, wou seng **Ursaach** ass (net wou d'Zäit ugewise gëtt), gefaarwt no der Grupp vun der Ursaach, wou de deierste Befund gewënnt, wann zwee sech iwwerlappen. Breet `3 + 9·√(Käschte / gréissten Käschten)` Meter; wou näischt verluer gouf, e gro 2-m-Streifen. De Befund, dee bei *Wou ze verbesseren* gewielt ass, gëtt wäiss gemoolt.

| Grupp | Faarf | Befunde |
|---|---|---|
| Bremsen | orange | Verléschter vum Fuerer an der Bremsphase |
| Ariedung | magenta | Verléschter vum Fuerer op dem Wee eran a mat der Mëtt duerch |
| Ausfahrt | blo | Verléschter vum Fuerer op dem Wee eraus |
| Geroudstéck | giel | Verléschter vum Fuerer op dem Geroudstéck |
| Auto | grau | wat d'Auto erkläert |
| Kontext | donkelgrau | d'Situatioun (e Rennstart géint eng fléien Ronn) |

### Feelerkaart {#mistake-map}

Wéivill vun all de Ronnen (vun de Klassen, déi an de Parcoursstatistiken gewielt sinn) e Feeler mécht bei all Meter - vun all Aart, oder nëmmen deen, dee an de Statistiken gewielt ass. All Ronn zielt een Mol pro Meter; de Beräich vun all Feeler gëtt op allen Säite ëm 6 m verbreet, sou datt e kuerze Feeler gesi gëtt. Breet `3 + 10·(Ronnen / meescht Ronnen)` Meter, an eng Faarf vun donkelbrong bis hell orange; gro 2 m, wou keng Ronn e gemaach huet. Kuckt [Parcoursstatistiken](race-course-statistics.md#the-mistake-map).

## Streck aus de Ronnen {#track-from-the-laps}

Fir e Spill, dessen Parcours net extrahéiert ass, gëtt eng Strooss ënner de Linnen gezeechent: sou breet wéi d'Ronnen iwwer der Referenz gestreet sinn (Querverschibungen bannent 25 m zielen) plus 2 m op all Säit, op d'mannst 4 m op all Säit vun der Referenzlinn, iwwer ±8 Gitterpunkten (±16 m) gegleet, a Asphaltgro mat liichte Randlinnen, 0,3 m ënner den opgehollte Positiounen. Verstoppt, wann e Parcoursmodell an **Level** gelueden ass.

## Zesummestéiss a Kraachen op der Streck {#hits-and-crashes-on-the-track}

All Zesummestéiss a Kraachen vun all sichtbarer Ronn (kuckt [Autosstüerungs-Evenementer](race-control-events.md#hits-and-crashes)) sinn do markéiert, wou se geschitt sinn, ëmmer wann Linnen oder Autoen gezeechent ginn: e gezackten Stär - rout fir en Kraach, orange fir en Zesummestouss - op engem Pfosten, mat engem Ring an der Faarf vun der Ronn um Fouss, a menger Gréisst wéi d'Autogréisst (Kraachen méi grouss). Wann e Auto de Moment vun engem Zesummestouss passéiert, breet sech 0,8 s laang e Schockring vun do aus.

## Hëllef-Modus {#help-mode}

**?** nieft dem Sproochewiel, oder d'Tast **?** oder **F1**, schalt en Schlëssel fir all Faarf um Bildschierm an, op all dräi Tabs ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). D'Wiel bleift an dësem Browser.

- **Den Schlëssel** an der Eck vun der Usiicht listt d'Faarwen fir de Tab an de Modus, an deem Der sidd. All Faarfskala kënnt vun do, wou d'Usiicht se kritt, sou datt eng Hitz-Skala, déi Der geännert hutt, als geännert gëtt. Um Rennen-Tab stinn nëmmen d'Saachen drop, déi d'geluede Ronnen hunn.
- **D'Kaart vun all Auto** kritt eng Tabell vun deem, wat op sengen Rieder gezeechent gëtt, mat Nimm, all Rad sengem Wäert an der Faarf, an där et gezeechent gëtt.
- **D'Auto am Fokus** kritt bei all Rad eng Beschrëftung mat dem Selwechten, an de Eck gesat. Verstoppt, wann d'Auto op der Usiicht ze kleng ass, fir datt se passen.

## D'Autoen {#the-cars}

**All Auto a senger eegener Form**, an der Faarf vu senger Ronn an a senger richteger Gréisst. D'Forme kommen aus enger Autosdatei, eemol op der Maschinn gemaach, wou d'Spill op ass:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Ouni eng, gëtt all Auto als **Auto vum Betrachter selwer** vu sengem Typ an Zäit gezeechent: Limousine, Coupé, Hatchback, Break, Sportauto, Supercar, Muscle-Car, Geländewoo, Pickup, Transporter oder Microcar, jiddwer als klassesch (virun 1980), vun den 80er an 90er oder modern ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Déi ginn hei aus allgemengen Proportiounen gemaach: ouni Logoen, ouni Modellnimm an ouni näischt aus de Fichieren vun engem Spill, sou datt se mam Betrachter kommen. Den Typ kënnt vum Numm vum Auto, d'Zäit vum Joer dran; e Auto ouni dat beschtëmmt seng Klass. Ronn honnert richteg Generatiounen si bekannt duerch hir publizéiert Längt, Breet, Héicht an Radstand ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); eng Zeil pro Auto, gerënnt), sou datt e 3er BMW aus den 90er déi Gréisst an d'Haltung vun deem Auto kritt, nach ëmmer als eng einfach Form ouni Emblem oder Kiischtegitter.

D'Autosdatei gëtt op Ärer eegener Maschinn aus Ärer eegener Kopie vum Spill gemaach. Si enthält e Modell mat wéineg Detailer vun all Auto, ongeféier 900 Dräiecker, mat hiren Radpositiounen (kuckt [de `cars`-Befehl vum Extraktor](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Autosdatei lueden...** an den Usiichtseestellungen, oder d'Fichier op den Tab falen loossen, lued se; si bleift an dësem Browser. Si enthält d'Forme vum Spill, dofir ass et näischt fir weiderzeginn, an de Betrachter liwwert kee mat.

Wéi een Auto fir d'Ronn steet, gëtt all Kéier aus deem ausgerechent, wat gelueden ass, a gëtt ni gespäichert. Sou kritt e Auto ouni Gegestéck haut een eegent, soubal eng neiere Fichier et huet ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Auto vun der Ronn | Gezeechent als |
|---|---|
| seng Nummer steet an der Fichier fir dat selwecht Spill | dat genau Auto |
| selwer Hersteller, an e Wuert vum Modell am Numm | dat Modell, dat an de Joren am nootsten ass |
| selwer Hersteller, selwer Generatioun | dat Auto vum Hersteller, dat an de Joren am nootsten ass |
| soss, mat enger Autosdatei | dat nootsten Auto vum selwechte Hersteller, wann et een hëlt, soss déiselwecht Karosseriform, an de Joren am nootsten |
| e Formel-Auto, un sengem Numm | den Einsitzer hei ënnen |
| kee vun de éischten zwee, an de Betrachter kennt d'Auto un senger Gréisst | dem Betrachter säi eegent Auto an der richteger Gréisst vun deem richtege Auto, mat oder ouni Fichier |
| soss ouni Fichier | dem Betrachter säi eegent Auto vum selwechte Typ an Zäit |

Also zeechent eng Ronn vun engem BMW 3er vun 1990 aus engem anere Spill e BMW vun ongeféier deem Joer, an en Auto, dat méi nei ass wéi d'Fichier, zeechent säi nootsten Verwandten, bis d'Fichier nees gemaach gëtt. De Tooltip vun enger Ronn an d'Zeil ënner der Autogréisst fir déi fokusséiert Ronn soen, wéi et gezeechent gëtt an wéi nooft dat ass.

D'eege Autoen vum Betrachter hunn donkel Fënsteren. E Modell aus enger Autosdatei ass iwwerall eng Faarf, well d'Fichier kee Lack an kee Glas huet, wouriwwer ee sech richte kann. D'Rieder, d'Rücklichter, d'Lampen an d'Telemetriezeechen ënnen ginn gezeechent wéi um Einsitzer; de Stäb fir d'Fiederung leeft un der Ausseséit vum Rad hoch, wou en ze gesinn ass, a d'Dräieckslenker bleiwen weg.

**De Einsitzer** ass en oppen Auto mat Rieder ausserhalb mat der Faarf vun der Ronn, sou datt d'Front vun iwwerall kloer ass an näischt d'Rieder verstecht: Wanne, Motorofdeckung, Säitekanäl, Cockpit mat engem Helm, Halo, Buedem, Front- a Heckflilleg; véier rond Rieder, d'Front vun der Lenkung gedréint (bis 0,5 rad beim vollen Aschlag), jiddwer op zwee Dräieckslenker mat Stiel, Spuerstang (vir) oder Antriebswell (hannen), an engem Stäb. D'Modell gëtt 0,3 m ënner d'opgeholl Positioun gesat, sou datt seng Rieder op der Strooss stinn, an duerch **Autogréisst** skaléiert.

**De Kierper beweegt sech op senge Fiederen**: wann d'Ronn all véier Fiederweeër huet, sënkt sech all Eck ëm seng Weeër (iwwerdriwwen op 0,12 m vun ganz erof bis ganz erop, sou datt et vun enger Verfollegungskamera gesinn ass), an de Kierper sénkt sech, neigt sech no vir an rullt sech op der Eben duerch déi véier.

**Wat aus der Telemetrie gezeechent gëtt** (bei *Pneuen & Fiederung* un) follegt der [Kanaltabell](race-charts-and-hud.md#the-channel-table):

| Zeechen | Vun | Zeechnung |
|---|---|---|
| Rifefaarf | `tireTemp` | de Rif selwer, blo kal → cyan → gréng am Betrib → giel → rout waarm, iwwer 40-130 °C |
| Rutschring | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (de gréissten) | e Ring um Buedem ënner dem Rad, gréng mat Gripp an der Hand, orange bei 0,66, rout bei 1 (d'Grenz vum Gripp, wéi d'Spill et mellt); schwaach ënner 0,3 |
| Fiederungsstang | `suspension` (0..1) | de Stäb, no Wee gefaarwt: blo ausgefuer, wäiss an der Mëtt, rout zesummegedréckt |
| Bremsglanz | `brakeTemp` (100-900 °C) | eng Scheif op der Ausseséit vum Rad, donkel bis orange |
| Verschleessband | `tireWear` (0..1) | e Band ronderëm de Profilrand, wäiss neit → rout verschloss |
| Laaschtbalken | `wheelLoad` (0-12 000 N) | e Pfosten nieft dem Rad sou héich wéi d'Laascht |

D'Bremslichter (Reenlicht a Flilleg-Endplaten) leuchten mam Bremspedal. All `lamp`-Kanal, dee un ass (iwwer der Hallschent vu sengem Beräich), mécht eng Lamp iwwer dem Loftkasten a senger Faarf un: ABS aktiv, Traktiounskontroll aktiv, DRS, Boxenbegrenzer, Handbrems, an der Loft.

**An enger Mass** (méi wéi 10 sichtbar), gi d'Autoen, déi net ukuckt ginn, eng einfach gezeechent: Kierper, Flilleger, Rieder an nëmmen d'Bremslicht.

## Beschrëftungen {#labels}

Un de Parcours gehaft a bei all Bild vun der Kamera aus projizéiert (ausserhalb vum Bild oder hanner der Kamera, verstoppt). Mat **Beschrëftungen** un:

| Beschrëftung | Wou | Klick |
|---|---|---|
| Kurvennimm (`T1`, `T2` …) | iwwer dem Scheitelpunkt vun all Kurv op der Referenz | - |
| nummeréiert Markéierunge 1-5 | déi fënnef gréissten Fuerer-Verléschter vun der fokusséierter Ronn, an der Mëtt vum Beräich vun all Ursaach, mat Rand an der Ursaachfaarf; driwwerfueren fir Titel an Käschten | opstellen a dësen Befund spillen |
| Zesummestouss- / Kraachbeschrëftungen | iwwer all Ausbroch vun der **fokusséierter** Ronn: "Kraach −45 km/h" / "Zesummestouss −12 km/h"; driwwerfueren fir d'ganz Beschreiwung an e Tipp | opstellen an den Zesummestouss spillen |
| Beschrëftungen vun der Feelerkaart (amplaz vun Kurvennimm a Markéierungen, wann d'Kaart d'Feelerkaart ass) | um Scheitelpunkt vun all Kurv: "T3 · 5/40 fréi bremsen" (de heefegste Feeler, Ronnen, déi en gemaach hunn / Ronnen, déi d'Kurv gefuer sinn), "T3 · 5/40", wann eng Aart gewielt ass, "T3 · propper", wann keng; driwwerfueren fir d'Verléschter vun der Kurv an hir fënnf heefegste Feeler | déi Kurv an den Parcoursstatistiken opmaachen oder zoumaachen |

## Gespigelt Welten {#mirrored-worlds}

D'Welt vum Betrachter ass rietshänneg mat Y no uewen: vun uewen gesinn, dréint en Auto, dessen Fuerrichtung `atan2(dx, dz)` wiisst, no lénks. E Spill mat enger lénkshänneger Welt - Forza ënner hinnen - kënnt gespigelt eraus: jiddwer rietsgaang Kurv gëtt als linksgaang gezeechent, bei Parcours an Ronnen zesummen.

D'Ronnen soen dat selwer ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): wann all Ronn e puer Meter (3 m) op eemol gaangen gëtt, gëtt d'Drehung vum Wee mat der Kompriméierung vun der Ausseséit-Fiederung (`suspension.FR` minus `suspension.FL`) verglach, a - ouni Fiederungsdaten - mat der Lenkung (positiv no riets bei all Adapter). Eng Ronn, déi sech insgesamt manner wéi π dréint, seet näischt; e Beweis zielt, wann e méi wéi 2 % vun der Drehung ausmécht. D'Ronnen stëmmen of; ee Gläichstand ass "kann net gesot ginn".

Wann dat Urteil vun den Ronnen net mat der aktueller Achsenëmkéierung passt (eng ongerued Zuel vun ëmgedréinten Achsen an **Kamera & Szen → Weltachs ëmdréinen**), seet d'Sektioun **Ronnen** dat ënner der Lëscht:

- d'Spill ass gespigelt an näischt ass ëmgedréint: "Dës Ronnen lenken no riets, wou de Parcours no lénks gezeechent ass …" mat **X ëmdréinen**;
- Achsen sinn ëmgedréint, mä d'Ronnen sinn net gespigelt: "D'ëmgedréinte Achsen zeechnen dës Ronnen gespigelt …" mat **D'Achsen zrécksetzen**.

Nëmme d'Zeechnung ännert sech - eng Spigelung an d'Usiichtmatrix gefaltt; d'Donnéeën, d'Analys an all Koordinaten, déi d'Tools weisen, bleiwen d'Spill seng eege. D'Ëmkéierung bleift am Browser. D'Analys nennt Kurven lénks oder riets mat derselwechter Miessung (eng onbekannt Welt gëtt als gespigelt geholl, wéi bei Forza).

## Fir Entwéckler {#for-developers}

Code: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Wat e Auto an engem Moment ass {#what-a-car-is-at-a-moment}

`stateAt` interpoléiert all Kanal tëscht den zwee Samples ëm d'Zäit vun der Ronn. Kanäl, déi sprangen (Gank, Fändelen), huelen de nootsten Sample. Eng Ronn, déi fäerdeg ass, parkéiert op der Linn.

**Richtung.** D'Fuerrichtung kënnt aus Positiounen e puer Meter ausernee (op d'mannst 2 m op all Säit, sou datt e Wackel de Auto net dréint). D'Kierperrichtung kënnt vum Yaw vum Spill nëmmen, wann en un d'Fuerrichtung ugepasst ass - Vorzeechen an Offset, duerch de kreesfërmege Mëttelwäert iwwer Samples méi séier wéi 10 m/s (op d'mannst 20) - an nëmme wann en dann mat där averstanen ass (kreesfërmeg Varianz ënner 0,05, ongeféier 18° Streuung); soss weist de Kierper laanscht d'Fuerrichtung. Sou bleift e Rutsch sichtbar (Kierper a Fuer ausernee), ouni dem Winkelgebrauch vun engem Spill ze vertrauen.

**Lenkung a Säiten.** An wéi enger Richtung eng positiv Lenkung d'Auto dréint, an op wéi enger Säit d'rietshänneg Rieder vum Spill sinn, gëtt aus der Ronn gemooss: d'Lenkung géint d'Drehung vum Wee, a wéi eng Säit vun der Fiederung an de Kéiren aussen zesummegedréckt gëtt (ouni Fiederungsdaten gëtt Forza als gespigelt geholl).
