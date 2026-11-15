---
title: "Manöver"
parent: "Erkenntnisser"
nav_order: 4
lang: "lb"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manöver: wéi Gruppen sech beweegen

**Erkenntnisser → Manöveren** verfollegt, wéi d'Eenheeten vun all Säit sech *als Gruppen* beweegen. Et benennt d'Manöver, déi si maachen: e Flankenugrëff, eng Zang, e Duerchbroch, e Hannerhalt, e Récktrëtt, eng Verteidegung géint Raketen, d'T-Positioun iwwerschneiden. Bei all Manöver steet, wéi sécher et ass, d'Zuelen dahannert, ob et sech gelount huet, an d'Parallelen an der Doktrin an an der Geschicht. **Massenanalys → Manöveren** zielt se iwwer Dausende Matcher: wéi oft all Manöver pro Kaart, Modus a Säit gemaach gëtt, an wéi oft et sech lount.

Alles gëtt an Ärem Browser ausgerechent, an engem eegenen Worker (`src/insights/maneuver`). En Match mat e puer honnert Eenheeten brauch 10-500 ms, en zwee-Stonnen-Loftkrich mat Dausende Objekter ongeféier eng Sekonn.

## Benotzen {#using-it}

- Maacht **Erkenntnisser** op, Tab **Manöveren**. Et zielt, wann Dir et fir d'éischt opmaacht. Nodeems Dir d'Filteren geännert hutt, klickt **Nei sichen**.
- **Sécher / Wahrscheinlech / Méiglech** setzt d'Sécherheet, déi gewisen gëtt (standardméisseg Wahrscheinlech).
- D'**Zäitlinn** huet eng Spur pro Säit an en Balken pro Manöver. D'**Lëscht** drënner zeigt dat selwecht, nom Zäit. Ee Klick spréngt an d'Replay um Ufank vum Manöver, fiert d'Kamera do hin a zeechent et an 3D: de Wee vun all Gruppe als Feil (déi zwee Äerm vun enger Zang si hir Bogen), d'Ëmrëss vun de Gruppen am Schlësselmoment (dee vum Gegner a senger Säitenfaarf), d'Front vum Gegner als wäiss Linn. **All an 3D zeechnen** setzt déi aner Manöver vum Match derbäi, blass. D'Linnen ginn eemol op d'Grafikkaart geschéckt, wann d'Auswiel sech ännert, net all Frame. Mat 480 Manöver, déi beim Ofspillen gezeechent ginn, sinn d'Frame-Zäiten op enger richteger GPU (WebGL2 an WebGPU, p99 18,0-18,5 ms, max 19,5-20,8 ms) déiselwecht wéi ouni.
- En opgemaachte Manöver weist säin Ausgank (d'Ofschëss a Verloschter vun de Eenheeten, déi en gemaach hunn, während et lafen ass a kuerz duerno, am Verglach mam Austausch vun der Säit iwwer de ganze Match), seng Beweiser an d'Eventer aus der Wëssensbank dofir: d'Doktrin an d'historesch Parallelen (Cannae fir eng Zang, Sedan 1940 fir e Duerchbroch, Tsushima fir d'T-Positioun, Operation Bolo fir eng Finte ...).
- D'kleng Tabell um Enn: pro Aart a Säit, gemaach a gelount.

![Eng Zang op dem synthetesche Demo-Match: béid Äerm mat hire Feilen, de Gegner-Kierper a seng Front](../assets/img/en/maneuvers.webp)

## Wéi Gruppen gefonnt ginn {#how-groups-are-found}

All Eenheet gëtt op eng gemeinsam Zäitlinn gesat (e Schratt vun 1 s zu Fouss, 2 s soss, méi laang bei ganz grousse Dateien). Iwwer engem Doud bleift si stoen, sou datt en Nei-Erscheinen keng Linn iwwer d'Kaart zitt. Bei all Schratt ginn d'Eenheeten vun enger Säit an enger Aart (Loft, Gefierer, Schëffer, Infanterie) matenee verbonnen, wann se no beieneen sinn. Dat ass 18 m zu Fouss, 170 m fir Gefierer, 3 km fir Schëffer an 5 km fir Loft. Si musse sech och gläich beweegen (d'Geschwindegkeete bleiwen bannent der Hallschent vun der schnellerer, oder béid stinn). E Cluster behält d'ID vun der Gruppe, an där déi meescht vun de Member waren. Eng Eenheet ouni Klass gëtt zu Fouss, an engem Gefier oder an der Loft gesat, jee nodeem wéi séier se ass.

D'**Form** vun enger Gruppe gëtt géint hir Richtung gelies. Eng Kolonn oder eng Linn gëtt no hiren Ofstänn laanscht an quer erkannt. E Keil ass, wann d'Mëtt vir ass. Eng Staffelung ass, wann d'Member zu enger Säit zréckbleiwen. E Karree ass, wann si d'Ecken hunn.

Alles gëtt un der eegener Skala vum Match gemooss. D'**Engagementsdistanz** `R` ass de 75. Perzentil vun der Distanz tëschen engem Killer a sengem Affer (begrenzt op de Sënn vun der Domän). D'Zäiten vun engem Manöver richten sech no der Aart vun der Eenheet (Infanterie ee Drëttel vun deem um Buedem).

## Wat gefonnt gëtt {#what-it-finds}

| Manöver | Gefonnt, wann |
|---|---|
| Formatioun | eng Gruppe hält 30 s laang op 60 % vun hire bewegten Schrëtt eng Form |
| Frontalugrëff | eng Gruppe kënnt aus der Rei bis zum Kontakt, ¾ R oder méi, aus 35° vun der Richtung, an där de Gegner steet |
| Flankenugrëff | dat Selwecht aus 50-130° (hannen méi wéi 130°); sécher nëmmen mat enger eegener *Fixéierungskraaft*, déi do de Gegner bekämpft (Ofschëss a béide Richtungen) |
| Zang | zwee Flankenugrëffe vun enger Säit op deeselwechten Gegner-Kierper, vun entgéint gesate Säiten (100° oder méi auserneen), bannent 90 s; sécher, wann d'Äerm kämpfen |
| Akesselung | eng kompakt Gegner-Gruppe mat op d'mannst esou vill vun der anerer Säit bannent 1,5 R, aus zwee oder méi Gruppen, ouni Lück iwwer 100°, eng Minutt laang, vun hirer eegener Säit ofgeschnidden; sécher, wann de Ring sech um ½ R zougemaach huet an d'Tasch bekämpft |
| Duerchbroch | eng Gruppe passéiert eng gehalen Linn (Gegner, déi 30 s laang lenks an rechts vun hir stinn, an d'Mëtt vun hirer Säit dohanter); sécher, wann se ½ R dervun eraus kënnt, 20 s do bleift an do kämpft; e Duerchbroch ass et, wann se nach eng R weider kënnt |
| Sprongweis Virgoen ënner Iwwerwaachung | an enger klenger Gruppe beweegt sech een Deel, wärend den Rescht stitt, d'Rollen tauschen véier Mol oder méi, mat Deckungsfeier vun deem Deel, dat stitt |
| Konzentratioun / Opléisung | den Undeel vun enger Säit no bei hirem dichtste Punkt steigt vun 35 % op 60 % (Eenheeten kommen 1,5 R oder méi, duerno Kontakt) - oder fält, wann si sech ausbreet |
| Finte | e klenge Bestanddeel am Kontakt zitt zwee oder méi Gegner vun anerswo weg; eng méi grouss Gruppe schléit dann véier Distanzen weider zou, wou de Gegner manner huet |
| Récktrëtt / Verfollegung | eng Gruppe am Kontakt dréint sech ewech a mécht R Ofstand vun der Stell, wou se gekämpft huet; sécher, wann e Gegner do grad eng vun hir ëmbruecht hat an d'Gruppe 2 R vun deem Killer fortkoum (nie zu Fouss: kuckt ënnen); Gegner, déi an déiselwecht Richtung goen an dran bleiwen, verfollegen |
| Verteidegung an der Déift | stitzend Eenheeten a zwou oder méi Gürtel iwwer d'Achs vum Gegner, R déif, de Gegner kënnt mat, Feier vun de Gürtel |
| Hannerhangstellung | dräi oder méi Ofschëss op kuerzer Distanz vu stitzende Eenheeten, déi op Affer vun iwwer engem Kamm kommen |
| Hannerhalt | eng bewegt Gruppe trëfft op Gegner, déi 45 s gestanen hunn; si schéisse fir d'éischt, an d'Bewegten verléieren zwou oder d'Halschent vun der Gruppen |
| Sécherung virun der Haaptkraaft | ee oder zwee Eenheeten, déi virun engem Kierper vun dräi oder méi bewegen, a sinn als éischt beim Gegner |
| Bannenzeg Linnen | d'Gruppe vun enger Säit leien enk zesummen tëscht deene vun der anerer, a hir Eenheeten wiesselen tëscht hinnen |
| Tempo | eng Säit reagéiert op Kontakt (Dréiung, Geschwindegkeetswiessel, éischte Schoss) 1,5 Mol méi séier, Mann-Whitney p ënner 0,05 |
| Crank, Notch, Drag, Pump | d'Zil vun engem Raketenschoss dréint de Schëtzen op 35-70°, 75-105° oder iwwer 140°, oder et zitt an dréint zréck |
| Loftzang, Mauer, Lead-trail, Grinder | e Puer, dat sech op ee Gegner opdeelt; dräi nieweneneen um Gegner; e Element 5-20 km hanner engem anere; zwee kreesen ëm e Punkt, eng Distanz auserneen |
| Loftraumpatrull (CAP) | kreest dräi Minutte laang ëm eng Statioun |
| Energie- / Wénkelkampf | an engem enken Kampf - Kursen 30° auserneen, jiddereen hält deen anere bei der Nues, oder en Ofschoss tëscht hinnen - Héicht benotzt an klammen, oder flach a schaarf dréien an dobäi bremsen; sécher, wann een den anere ëmbruecht huet |
| Streikpak, SEAD | eng Loftgrupp mat gemëschten Rollen, vun deenen e puer den Buedem treffen; Loftofwier-Ofschëss viru de meeschte anere Buedem-Ofschëss |
| Schluechtlinn, T-Positioun | dräi Schëffer an enger Kolonn; eng Kolonn quer iwwer de Kapp vun enger Gegner-Kolonn |

All Manöver seet, wéi eng Muster aus der Wëssensbank et weist (`patterns-maneuver.ts`: Formatioun, Frontalugrëff, duebel Ëmfaassung, Akesselung, Duerchbroch, Feier a Manöver, Finte, Récktrëtt, Verfollegung, Verteidegung an der Déift, Sécherung, Zerstreiung, Verteidegung géint Raketen, Wénkelkampf, Loftraumpatrull, Streikpak, Schluechtlinn, T-Positioun), an déi Eventer, déi een als éischt liest. Eeler Eventer droen déi nei Muster iwwer `knowledge/maneuver-tags.ts` duerch. Kuckt [D'Wëssenslens](knowledge.md).

**Hat sech gelount** vergläicht den Austausch vun den Eenheeten, wärend d'Manöver gelaf huet (an eng Minutt duerno), mat deem vun hirer Säit iwwer de ganze Match. Ee Récktrëtt huet sech gelount, wann d'Eenheeten nom Drehen manner verluer hunn wéi virdrun. Eng Verteidegung géint Raketen huet sech gelount, wann de Fligger eng Minutt lieft. Eng Akesselung huet sech gelount, wann d'Tasch d'Hallschent verléiert.

## Iwwer vill Matcher {#over-many-matches}

D'Zesummefassung vun all Match (`src/mass/summarize.ts`, kuckt [Massenanalys](mass-analysis.md)) huet e klenge Abschnitt `maneuvers`: pro Aart a Säit, gemaach (op Wahrscheinlech oder méi), gelount, net gelount, Ofschëss a Verloschter. **Massenanalys → Manöveren** zielt dat iwwer d'Matcher zesummen, déi de Filter hält, pro Kaart a Modus oder iwwerall, mat dem Wilson-Intervall vun der Quot vum Gelounen. Eng Zeil lued d'Matcher, an deenen de Manöver gemaach gouf. Zesummefassungen, déi virdrun geschriwwe goufen, hunn keen Abschnitt: fir en dobäi ze setzen, leeft `node tools/3dheat-summarize.mjs <folder> --force`.

## Wéi sécher et ass {#how-sure-it-is}

Synthetesch Matcher mat agebaute Manöver (`synth.ts`, gelaf vum `maneuver.test.ts`): all 28 agebaute Aarte ginn op Wahrscheinlech oder méi fonnt. Vun 50 gemellten Manöver sinn 31 d'agebaute Aart, an déi aner 19 sinn wierklech och do (d'Formatioun vun der bewegter Gruppe, den Frontalugrëff vun der dorchbriechender Kolonn). Keen ass falsch. Bei 30 Null-Matcher - Zoufallswanderungen getrennt a gemëscht, Eenheeten, déi zoufälleg stinn, Fligger op gerader Linn, eng Mass, déi hin an hir schwätzt - gëtt bei Wahrscheinlech oder méi näischt gemellt.

Bei echten Date (dotzenden Bodenkämpfer, e puer laang Loftkrichs-Missiounen, e Dotzen Schütze-Matcher): Frontalugrëffer, Flanken, Duerchbréch an Akesselungen bei de Panzerschluechten, Formatioune an enke Kämpfer an der Loft, Raketenverteidegungen, CAP-Kreesen a Lead-trail-Paren bei de Loftkrichs-Missiounen, Frontal-Hinrichtungen, Kolonnen a e puer Hannerhälter a bewegt Paren bei de Schütze. D'Schwelle sinn d'Formen aus der Doktrin am Spillmoosstab. Liest all eenzelnen Fund mat sengen Beweiser, an d'Quoten an der Massentabell mat hiren Intervallen.

### Géint Null-Modeller vun deenen selwechte Matcher {#against-null-models-of-the-same-matches}

E Detektor kann vum Terrain an der Mass verwiert ginn: an engem Gewurtz huet all Gruppe Gegner ronderëm. Dofir gëtt all Aart och op **Null-Modeller** gelaf, gebaut aus deenen selwechte Matcher (`nulls.ts`). Do treffen sech d'Säiten net, wéi se et gemaach hunn. Eng vun de Säiten hiert Zäitlinn gëtt ëm en Drëttel bis zwee Drëttel vum Match gedréint (*Verréckelen*), oder hir Spuren ëm d'Mëtt vun der Kaart gedréint (*Dréinen*). An d'Teamnimm ginn duercherneen gemëscht (*Teams*, wat vun der Konstruktioun hëlleft, ongeféier d'Hallschent vun de richtege Kämpf ze halen). Kämpf ginn nëmmen als Ofschëss gezielt, déi mat hire Doudesfäll gepaart sinn: de Killer bannent 2 R an d'Affer um Plaz. En Null-Modell brécht dës Paarung. Gefonnt bei Wahrscheinlech oder méi, echt géint d'Null-Modeller (30 Panzerschluechten; 12 Schütze-Matcher):

| Aart | Panzerschluechten: echt / verréckelt / gedréint | Schütze: echt / verréckelt / gedréint |
|---|---|---|
| Akesselung | 0 / 0 / 0 (war 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Duerchbroch | 0,03 / 0,02 / 0,05 (war 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Flank | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Frontalugrëff | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Récktrëtt | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (also zu Fouss ni sécher) |
| Hannerhalt | - | 0,17 / 0,04 / 0,04 |
| Energiekampf | 1,2 / 0,1 / 0,85 | - |
| Wénkelkampf | 0,6 / 0,07 / 0,3 | - |

Enk Loftkämpf iwwer der Mëtt vum Schluechtfeld iwwerliewen eng Dréiung ronderëm dës Mëtt. D'Spalt "Dréinen" hëlleft hinnen dofir manner wéi bei de Bodenaarten. Aarte bannent enger Säit - Formatioun, Loftraumpatrull, Mauer, Streikpak, SEAD, Bewegung, Sécherung - hänke vun der anerer Säit net of a ginn esou net getest. `maneuver.test.ts` prüft, datt d'Null-Modeller d'agebaut Flank, Zang, Akesselung, Duerchbroch, Hannerhalt an Récktrëtt aus den synthetesche Matcher huelen.

## Grenzen {#limits}

- Gruppen brauchen Positiounen iwwer d'Zäit. Eng Datei mat nëmmen Eventer huet keng.
- D'Richtung gëtt aus den Daten net gelies. D'Front vum Gegner ass do, wou d'Fixéierungskraaft hie bekämpft, soss wou hie sech bewegt, soss wou den Ugräifer hier kënnt.
- D'Terrain gëtt aus de Héichten vun den Eenheeten selwer gelies (d'Hannerhangstellung). Et gëtt kee Siicht-Test.
- Ganz grouss Dateien ginn a méi lange Schrëtt gelies. Kuerz Loftmanöver dran ginn awer nach aus 2-4-s-Schrëtt gelies.
