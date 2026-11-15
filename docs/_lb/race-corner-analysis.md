---
title: "Kurv-fir-Kurv-Analys"
parent: "Course-Analys"
nav_order: 55
lang: "lb"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analys Kurv fir Kurv

Zwou Ronnen vum selwechte Parcours ginn Kurv fir Kurv verglach. Fir all Kurv seet de Betrachter, wien méi séier war, wéi vill Zäit et wäert war, an firwat - ze spéit gebremst, de Gas ze spéit kritt, eng méi breet Linn geholl - sou datt Dir wësst, wat Dir als Éischt üben sollt.

![En Befund, deen am Ofschnëtt Wou ze verbesseren opgemaach ass, nieft der Tabell Kurv fir Kurv](../assets/img/en/race-corner-finding.webp)

E Beispill: an Kurv 3 bremst Fuerer A 20 m fréi wéi Fuerer B a verléiert 0,15 s beim Dohinner, mee hie kritt de Gas méi fréi a gewënnt 0,15 s op der Ausfahrt. Netto 0,00 s: d'Kurv ass gläich, a kee gesäit gesot, e soll méi spéit bremsen.

## Wat Dir gesitt {#what-you-see}

### Wou ze verbesseren {#where-to-improve}

D'Sektioun an der Säitelleescht fir déi fokusséiert Ronn ("Lued mindestens zwou Ronnen vun engem Parcours." bis dohinner).

**De Kapp:** "<Ronn> <Zäit> géint <Referenz> <Zäit>" an den Ofstand vun de Rondenzäiten - oder, bei der Referenz, "géint déi schnellst aner Ronn duerch all Kurv (…)" an de Gesamtverléscht. Nieft dem Kapp de Verléscht opgedeelt an *Fueren* an *Auto / Situatioun*.

**De Balken vun der Opdeelung:** d'Zäit, déi pro Ursaachgrupp verluer gaangen ass (Bremsen, Eragang, Ausgank, Riichtstreck, Auto, Kontext), a den Ursaachfaarwen, mat enger Legend.

**D'Befunder**, dräi Lëschten:

1. Verléschter vum Fuerer, déi meescht Zäit kascht als éischt, héchstens **12** - oder "Nergens, wou anescht Fueren Zäit géif gewannen, stécht eraus."
2. **Weisen, wat den Auto oder d'Situatioun kascht (X s)** - Verléschter vum Auto an der Situatioun, héchstens 8 (standardméisseg un).
3. **Wou <Ronn> méi séier ass, oder op anerer Manéier gläich ass (N)** - Gewënn a gläich Kurven, héchstens 10 (standardméisseg un).

All Befund weist säin Rang, säi Titel (d'Kurv an dat, wat geschitt ass, mat der Kaschtezuel bei engem Verléscht), d'Urteilszeil, d'Kaschten (Gewënn mat engem Minus) mat engem Balken, an e Chip: *Bremsen*, *Eragang*, *Ausgank*, *Riichtstreck* (Verléschter vum Fuerer, mat "· Auto X", wann den Auto 0,02 s oder méi erkläert), *Auto*, *Kontext*, *schneller*, *gläich*. **Klickt een drop**, fir d'Autoen 40 m virdrun opzestellen, et ze rahmen an ze replayen, an seng Miessungen opzemaachen:

- **Bremsen:** wou jiddereen gebremst (oder de Fouss vum Gas geholl) huet a mat wéi enger Geschwindegkeet, a wéivill Meter méi fréi oder méi spéit (vun 5 m un);
- **Luesten:** all Ronn hir Mindestgeschwindegkeet a wou;
- **Vollen Gas:** wou jiddereen de Gas voll hat, a wéi vill méi fréi oder méi spéit;
- **Linn:** Unterscheed beim Anlenken, engste Radien, wéi wäit dovun dran oder dobaussen, an all Ronn hir Linnform an Scheitelpunkt;
- **Riichtstreck bis zur nächster Kurv:** seng Längt, béid Geschwindegkeeten wou béid voll Gas haten, wat et verluer oder gewonnen huet an vu wat - d'Startgeschwindegkeet, den aneren stäerkere Ruck, en Ëmmer-Lass, verluerene Geschwindegkeet, wéi et gefuer gouf (Deeler vun 0,02 s un);
- **Den Auto:** wéivill vum Verléscht den Auto ass, an vu wat (Zuch, Gripp, Bremsen; wann 0,02 s oder méi);

dann den Tipp, **D'Autoen:** (bei verschiddene Autoen, kuckt [Autoprofiler](race-car-profiles.md#what-the-cars-decide-in-a-corner)), an de Rot zur Linn.

### Kurv fir Kurv {#corner-by-corner}

Eng Tabell (bei zwou oder méi Ronnen), eng Zeil pro Segment, bei der fokusséierter Ronn hirer Klass, wann et méi Klassen gëtt:

| Kolonn | Weist |
|---|---|
| Kurv | `T3`, `T11-T12` |
| Schnellst | d'Ronn, déi duerch d'Kurv am schnellsten war (hir eegen Zäit vum Segmentstart bis zum Enn) |
| vum | hire Virsprong op déi zweet-schnellst, s |
| Linn | d'Form an de Scheitelpunkt vun der schnellster Ronn ("V · spéit", "U/V · Mëtt"); driwwerfueren fir hir engste, Eragangs- an Ausgangsradien; "a béide Richtungen" bei engem gemëschten Komplex |
| (fokusséiert Ronn) | wéi wäit hannendrun se hannert der schnellster war, oder ✓, wann se déi schnellst war |

En Klick op eng Zeil mécht do de Befund vun der fokusséierter Ronn op (oder stellt d'Autoen 40 m virun dem Segment op). Ënnert der Tabell, wann all Kurv eng Zäit huet: "Déi schnellst duerch all Kurv, zesummegesat: <Zäit> (± op der Referenz / op deem Bescht vun der Klass X)" - d'bescht Segmenter plus déi schnellst Fuert bis zur éischter Kurv, wann dat säi eegene Stéck ass.

## Wéi et ausgerechent gëtt {#how-it-is-worked-out}

D'Haaptregel: **eng Kurv gëtt als Ganzes beuerteelt**, vun der Bremszon fir se bis zur Bremszon fir déi nächst. Eng Ronn, déi méi fréi bremst, fir de Wagen méi fréi ëm d'Kurv ze kréien a méi fréi op d'Kraaft ze kommen, kritt d'Ausfahrt gutgeschriwwen, déi se domat kaaft huet, a gëtt net gesot, méi spéit ze bremsen.

## Eng Distanzachs {#one-distance-axis}

D'Ronnen ginn no der Distanz verglach, net no der Zäit - eng Sekonn hannendrun sinn zwou Ronnen bei verschiddene Kurven. Och net no der eegener Kilometerzuel vun all Ronn (eng engere Linn deckt manner Meter of). D'gefuerene Wee vun der **Referenz**-Ronn ass d'Achs:

- All aner Ronn hir Samples ginn op de Referenzwee **projizéiert**: all Sample kritt `s`, wéi wäit et laanscht der Referenz ass, an `d`, wéi wäit lénks (positiv) oder riets. D'Sich geet vum viregte Match aus viru (8 Wegsegmenter zréck bis 40 virun), sou datt eng Ronn, déi sech selwer iwwerkräizt oder ënnerkräizt, ni op de falsche Kräiz sprénkelt. Dat éischt Sample gëtt am éischte Véierel vum Wee gesicht (op engem Circuit fale Start an Ziel zesummen); wann näischt bannent 30 m ass, gëtt de nootsten Punkt iwwerall geholl, deen net hannendrun ass (no engem Drehen oder engem Ausflug). `s` geet ni zréck: e Sample, dat hannert dem virdrun projizéiert, gëtt festgehalen.
- All Kanal gëtt op ee Gitter **gemëttelt**, **all 2 m**, linear; Kanäl, déi springen (Gank, Fändelen), mam nootsten Sample. Ausserhalb vum eegenen Beräich vun enger Ronn sinn d'Wäerter eidel.
- Dat éischt an dat lescht Sample vun enger Ronn projizéiere bëssen innerhalb vun den Enden der Referenz, sou datt all Ronn **bis zu 15 m** iwwer hir Enn mat der Geschwindegkeet weidergefouert gëtt, déi se hat (d'Zäit wiisst mat der Distanz duerch Geschwindegkeet, de Rescht bleift) - sou datt hire Delta an der Linn hiren Zäitënnerscheed ass.
- `delta` = d'Zäit vun der Ronn op all Gitterpunkt minus d'Zäit vun der Referenz: den Ofstand. `lateral` = `d` op dem Gitter.

D'Zäit, déi eng Ronn méi wéi eng aner tëscht zwee Gitterpunkten brauch, ass den Ënnerscheed vun hiren Deltaen: `rel(s)`. Alles hei ënnen baut dorop op.

## Kurven {#corners}

Fonnt op der **Referenz** (`findCorners`), mat hirer Geschwindegkeet gegleet iwwer ±6 m an hirer Krümmung (Richtungswiessel iwwer ±5 Samples, gegleet iwwer ±10 m):

1. **Geschwindegkeetsminima mat Prominenz.** E Punkt, deen den niddregsten bannent ±40 m ass, an deem den Ofstand vum héchste Geschwindegkeet op all Säit (virun engem méi nidderegen Minimum) mindestens `max(2,5 m/s, 6 % vun der Geschwindegkeet)` ass.
2. **Knicker.** E lokalen Héichpunkt vun der Krümmung mat engem Radius méi enk wéi **300 m**, ouni Geschwindegkeetsminimum bannent 80 m: e vollgas geholte Knicker ass trotzdem eng Kurv, déi ee fiere muss.
3. **Phasen.** Vun all Scheitelpunkt zréck, sou laang wéi d'Referenz bremst (> 0,1) oder de Gas net voll ass (< 0,95): den Eragang; vir, sou laang wéi de Gas net voll ass: den Ausgang. E Knicker, dee voll gedréckt gëtt, kritt ±30 m. Iwwerlappend Kurven bleiwe getrennt, ginn awer sou gemaach, datt se d'Ronn zesummen ausfëllen.
4. Nummeréiert T1, T2 … an der Ronnreiefolleg; **lénks oder riets** no dem Vorzeechen vun der Krümmung an ob d'Welt gespigelt ass (eng onbekannt Welt gëtt als gespigelt geholl).

**Den Kurvenberäich** (wou d'Referenz sech dréint): vum engste Punkt bannent ±40 m vum Scheitelpunkt no vir, sou laang wéi d'Krümmung iwwer engem Sechstel vun hirem Maximum bleift, plus 10 m op all Säit. Seng Säit gëtt d'Vorzeeche vun "bannen".

## Segmenter: vu Bremszon bis Bremszon {#segments-braking-zone-to-braking-zone}

All Kurv besëtzt d'Strooss hallwechs bis zu de Scheitelpunkte op all Säit. Dodran:

- **De luesten Punkt vun all Ronn** ass en echte Knick an hirer Geschwindegkeet - näischt méi lues bannent 6 m (3 Gitterpunkten) op all Säit, mat Bléck iwwer d'Enn vum Stéck, sou datt de Gasausgang vun der vireger Kurv, deen nach an d'Kurv hinneneleeft, ni fir hien gehale gëtt - gesicht vun 15 m virun dem Kurvenberäich bis 10 m no him. Eng Ronn, déi sech dort ni verlangsamt huet, gëtt op de Scheitelpunkt gesat.
- **Wou eng Ronn fir se ugefaang huet lues ze ginn** (`entryOf`): vum luesten Punkt zréck duerch d'Bremsen oder d'Lassgoen, iwwer kuerz Gas-Ëmmerkommen, bis se de Fouss erofgedréckt hat (Gas ≥ 0,95, Bremse ≤ 0,1) fir **10 m**; e Gas, dat an de lescht **30 m** virun dem luesten Punkt nees ugeholl gouf, gehéiert nach zur Kurv; de ganzen Wee voll Gas: de luesten Punkt selwer. Eng Ronn ouni Gasrufs oder déi zënter der Kurv virdrun ni de Fouss erofgedréckt hat, fänkt bei hirem séierste Punkt tëscht deenen un.
- **D'Segment fänkt bei der éischter vun all de Ronnen un, déi fir d'Kurv ugefaang hunn lues ze ginn** (4 m méi fréi), a geet bis zum Ufank vun der nächster, sou datt all Ronn hir Bremsen dran ass an d'Segmenter d'Ronn ausfëllen.

**Komplexer.** Opeenanerfolgend Kurven, tëscht deenen d'Referenz ni voll Gas fiert - manner wéi **40 m** voll Gas - sinn ee Segment, "T11-T12", a Ganzes gefuer; en Komplex hält héchstens **dräi** Kéiren (e kurvegräicht Stéck, dat ni voll Gas gefuer gëtt, fänkt en neien un). E Komplex, dee an béide Richtungen dréint, ass *gemëscht*: fir hien gëtt keng eenzeg Linnfform gemooss.

**Op engem Circuit** (d'Referenz endet bannent 50 m vun deem, wou se ugefaang huet), leeft de lescht Segment säi Riichtstreck iwwer d'Linn bis zum éischte Bremspunkt: dem Fluch vun enger fléien Ronn sinn dat Stéck vun der Linn un zum leschte Kurv gezielt. Eng Ronn, déi aus engem Stand oder bei engem Rennstart ugefaang huet (kuckt [De Start](#the-start)), hält dat Stéck getrennt.

### Wouhin eng Kurv féiert {#what-a-corner-leads-onto}

Op der Referenz gemooss: Meter mat vollem Gas no der Kurv (vu sengem vollen Gas bis zum Segmentenn, plus d'Stéck iwwer d'Linn) an virun der Kurv (dat "no" vum virdrunnen Segment, oder vum Start aus).

| Typ | Regel |
|---|---|
| **tëscht zwee Riichtstreck** (`both`) | 200 m oder méi virdrun **an** 120 m oder méi duerno |
| **op e Riichtstreck** | 200 m oder méi duerno, oder 120 m oder méi duerno an mindestens sou vill wéi virdrun |
| **no engem Riichtstreck** | 200 m oder méi virdrun |
| **Verbindung** | alles anescht |

## Wat all Ronn an enger Kurv gemaach huet {#what-each-lap-did-in-a-corner}

`cornerMetrics`, pro Ronn a Segment, op dem Gitter (Schrëtt 2 m). Pedaler: Bremsen zielt iwwer 0,1, voll Gas ass 0,95 an hanner.

| Miessung | Regel |
|---|---|
| **Bremspunkt** | déi éischt Bremse, an där de Gas erofkoum (ënner 0,5), oder déi **15 m** gedauert huet - en Dab mam lénksen Fouss mat der Kraaft un ass net de Punkt, wou gebremst ugefaang huet; nëmmen mat Dabs den éischten Dab |
| **gelooss** | ouni Bremsen den éischte Punkt, wou de Gas ënner 0,8 fiel |
| (ouni Pedaler) | de Punkt, wou d'Ronn ugefaang huet lues ze ginn (uewen) |
| **Bremsloss** | déi lescht Bremse bis 30 m no dem luesten Punkt |
| **Geschwindegkeet beim Bremspunkt**, **Bremsmeter** | bis zum luesten Punkt |
| **Spëtzebremse**, **Spëtzenverzögerung** | iwwer d'Bremszon (Beschleunegungen iwwer 45 m/s² ginn ignoréiert) |
| **Bremsen mat Kurvenzuch** | Meter mat Bremse > 0,05 an \|Lenkung\| > 0,1 |
| **Radschlupp beim Bremsen** | dat negativst Rad-Schlupfverhältnis an der Zone (wann d'Ronn Schlupf huet) |
| **luesten Punkt**, **Mindestgeschwindegkeet** | wéi uewen |
| **Gas un** | nom Loosgoen (oder dem luesten Punkt), den éischte Gas iwwer 0,15 ouni Bremse |
| **Voll Gas** | den éischte Punkt duerno, deen 10 m laang bei ≥ 0,95 bliwwen ass |
| **Rullen** | Meter vum Loosgoen bis Gas-un, mat Bremse an Gas bäid ënner 0,05 |
| **Gas-Dips** | Mol, wou de Gas méi wéi 0,25 ënner seng laafend Héchst fiel, tëscht Gas-un an Voll Gas |
| **Querbeschleunegung am Spëtz** | déi gréisst Querbeschleunegung vun 20 m virun dem Loosgoen bis zum spéideren vu Voll Gas an 20 m no dem luesten Punkt |
| **Gang am Scheitelpunkt** | beim luesten Punkt |
| **Schleuderschlupf** | dat gréissten Antriebsrad-Schlupfverhältnis tëscht Gas-un an Voll Gas |
| **Gläichgewiicht** | Schräglaufwénkel vir minus hannen duerch d'Mëtt (+ Ënnersteieren) |
| **Riichtstreck mat vollem Gas** | den Undeel vum Segment nom Voll Gas (an dem Stéck iwwer d'Linn) bei ≥ 0,95; dat längst Lassgoen dorënner |
| **Geschwindegkeetsverloscht** | déi gréisste Geschwindegkeet, déi vun engem héijen Punkt mat Gas ≥ 0,9, ouni Bremse, um Buedem verluer gaangen ass |
| **Eragangsdrift** | de gréisste Driftwénkel vum Bremspunkt bis 5 m no dem luesten Punkt, um Buedem |
| **Handbrems** | wou se un ass (> 0,2), bis 10 m no dem luesten Punkt |
| **Loft** | Sekonnen an der Loft iwwer dem Segment, an de längsten Fluch |

## Mat wiem all Ronn verglach gëtt {#who-each-lap-is-compared-with}

- Eng Ronn gëtt mat der **schnellster komplett Ronn vun hirer eegener Leeschtungsklass** verglach (der Referenz, an der Klass vun der Referenz).
- Déi Klasse-bescht Ronn selwer (an d'Referenz) gëtt, Segment fir Segment, mat **där anerer Ronn vun hirer Klass, déi duerch se am schnellsten war** verglach - oder mat all Ronnen, wann se eleng an hirer Klass ass.

D'Zäitkaart, d'Lücke an der Ronnelëscht, d'Autosstüerungs-Evenementer an d'Kurvetabell follegen dem selwechte Verglach.

## D'Zäitrechnung vun enger Kurv {#the-time-account-of-a-corner}

`compareCorner`, fir eng Ronn géint déi aner iwwer e Segment:

- **Netto** = `rel(Enn) - rel(Start)` (plus d'Stéck iwwer d'Linn bei enger fléier Ronn): d'Urteil. Méi no wéi **0,03 s** ass **gläich**.
- **D'Opdeelung** - wou an der Kurv de Virsprong gedréint huet: am Stéck vum éischte Bremspunkt oder luesten Punkt vun enger vun den zwou Ronnen bis zum spéideren vun hiren Vollgas- an luesten Punkten, dee gréisste Schwong, deen d'Ronn dann zréckgëtt oder zréckgewënnt, wann de Schwong iwwer **0,04 s** ass; soss den spéideren vun den zwee luesten Punkten.
- **Bis zum Scheitelpunkt** = `rel(Opdeelung) - rel(Start)`; **duerno** = Netto minus dat. Wann béid mindestens 0,04 s sinn an Géigevorzeechen hunn, huet d'Ronn **getradet** - een fir deen aneren.
- **Duerno** deelt sech nach eng Kéier, wou béid Ronnen voll Gas sinn: den **Ausgank** (Opdeelung bis zum spéideren Vollgas) an den **Riichtstreck** (vun do bis zum Enn).
- **Den Riichtstreck** deelt sech an dräi:
  - *Ausgangsgeschwindegkeet* (`byExit`) - gemooss, net modelléiert: den lues Auto fiert no e puer Meter op dem Riichtstreck duerch d'Startgeschwindegkeet vum schnellere, an vun do aus ass seng eegen Spuer wat et vun där Geschwindegkeet aus géif maachen, mat sengem eegenen Iwwersetzung, Widderstand an Hang dran. Zréckgeschuewen op dee Punkt (a bei senger Endgeschwindegkeet weiderlaf fir d'Meter, déi se gewënnt), ass et seng Zäit ab dem schnellere Start; den Ënnerscheed ass de Käschte vun der Ausgangsgeschwindegkeet. Wann dat lues Auto dës Geschwindegkeet ni erreecht (oder nëmmen an de lescht 2 Samples), gëtt seng eege Beschleunegung laanscht de Stéck als Kraaft zréckgesat (`a·v` gehalen), ni méi haart wéi seng Hëllechkurve bei där Geschwindegkeet weist (zweemol déi gemooss Beschleunegung ouni Hëllechkurve).
  - *d'Kraaft vun den Autoen* (`byPower`) - nëmme bei verschiddene Autoen: béid Autoen aus der selwechter Geschwindegkeet iwwer déiselwecht Meter, voll Gas, an d'Beschleunegung bei voller Gasgëff integréieren, déi all bei all Geschwindegkeet gewisen huet.
  - *wéi et gefuer gouf* (`driven`) - de Rescht: e Gas-Lassgoen, verluerene Geschwindegkeet bei vollem Gas.

  D'Ausgangsgeschwindegkeet erkläert ni méi wéi de Riichtstreck-Käschte (an ni mat dem Géigevorzeechen), ausser e Lassgoen oder verluerene Geschwindegkeet huet e Stéck zréckgeholl. Eng Ronn **liess lass** op dem Riichtstreck, wann hiren Undeel bei vollem Gas ënner béiden 0,9 an dem vun dem anere minus 0,05 ass. Verluerene Geschwindegkeet zielt, wann déi zwee ëm méi wéi 1 m/s differéieren. E Stéck Ënnerscheed ënner 0,02 s am Vorzeechen gëtt op 0 gesat.

All Netto vun engem Segment addéiert sech op den Zäitënnerscheed vun der Ronn, an all Kurv hir Bis-zum-Scheitelpunkt an duerno addéiere sech op hiren Netto (d'Tester kontrolléieren béides).

### Den Undeel vum Auto {#the-cars-share}

Nëmmen wann d'Ronnen in **verschiddene Autoen** sinn an d'Ronn Zäit verluer huet (`carShare`):

- **Zuch**: d'Zuch vun den Autoen laanscht de Riichtstreck (uewen), bis zum Verléscht;
- **Gripp**: wann d'Ronn um Limit vum Auto war (Querbeschleunegung an der Mëtt op d'mannst **90 %** vun deem, wat de Auto bei där Geschwindegkeet hält) an deen anere Auto **méi wéi 5 %** méi hält: vun der nidderegerer Mindestgeschwindegkeet, déi net duerch en enken Radius erkläert ass, den Undeel `½ ln(Gripp_anerer / Gripp_mengem) / ln(v_anerer / v_mengem)` vum verbleiwende Verléscht;
- **Bremsen**: wann d'Ronn gebremst huet (net gelooss), bremst den anere Auto **méi wéi 5 %** haarder, an d'*duerchschnëttlech* Verzögerung vun der Ronn iwwer d'Zone war op d'mannst **80 %** vun deem, wat hire Auto kann: vun `u` bis `v` mat `a1` géint `a2`, mat engem Enn um selwechte Punkt, `(1/a1 - 1/a2)(u - v)² / 2u`, bis zu deem, wat bleift.

Den Auto sein Käschte ass d'Summ, héchstens de Verléscht.

## Urteil an Befund {#the-verdict-and-the-finding}

`cornerFinding` schreift héchstens ee Befund pro Ronn an Kurv, a dëser Rei no probéiert:

| Fall | Befund | Resultat |
|---|---|---|
| netto bannent ±0,03 s, e Tausch, kleng Säit ≥ **0,1 s** | **gläich, zwou Weeër duerch** - wien lues eragaang an séier erausgaang ass, an de Géigendeel; mat engem Riichtstreck duerno (op e Riichtstreck oder tëscht zwee), ass de Wee lues eragoen a séier ausgaang deen, op deem ee baue soll: säin fréie Gas behalen, de Verloscht am Eragang mat méi haarder Bremse zréckgewannen, net méi spéit | gläich |
| netto bannent ±0,03 s soss | nach näischt gesot | - |
| gewonnen, e Tausch, gouf bis zum Scheitelpunkt verluer | **lues eragoen, séier erausgaang huet sech bezuelt**: behalen, hei ass den Ausgank méi wäert | Gewënn |
| gewonnen, e Tausch, gewonnen bis zum Scheitelpunkt | **schneller beim Eragang**: den Eragang ass richteg, en fréiere Vollgas géif méi behalen | Gewënn |
| gewonnen, an d'aner Ronn huet hei e Verléscht | **schneller - wéinst deem, wat den anere gemaach huet**, seng Ursaach an sen Tipp steet "Fir déi aner Ronn: …" | Gewënn |
| soss gewonnen | **schneller beim Eragang / Ausgang**, no deem Halschent méi gewonnen huet (méi spéit bremsen, méi Geschwindegkeet duerch d'Mëtt; oder fréi gläich, méi staark Zuch) | Gewënn |
| verluer, an e **Stouss oder Kraach** huet mindestens `max(0,05 s, 40 % vum Verléscht)` gekascht | den Impakt ass d'Geschicht vun der Kurv, virun den Autoen | Verléscht |
| verluer, an den **Undeel vum Auto** ass 60 % oder méi | **den Auto**: säi Zuch laanscht de Riichtstreck, säi Gripp an der Mëtt, oder seng Bremsen - dee gréisste Undeel; mam Undeel vum Fuerer (≥ 0,03 s) als "Den anere X s: …" gesot | Verléscht |
| verluer, an ee net gedeelte **Auto-Kontrollfeeler** huet mindestens `max(0,05 s, 40 %)` gekascht | dee Feeler (kuckt hei ënnen), mat wéi d'Zäit ronderëm him sech geréckelt huet | Verléscht |
| verluer, an e **méi laange Fluch** huet mindestens `max(0,05 s, 40 %)` gekascht | de Fluch | Verléscht |
| verluer, e Tausch, gewonnen bis zum Scheitelpunkt | **ze schnell eragoen, lues ausgaang**: d'Ursaach vum Ausgank; e Stéck Eragang opginn, fir fréi gedréint a gläich ze sinn, mat de Bremspunkten an de Vollgas-Punkten vun der anerer Ronn. Hir Wuerzel (`cause`, déi d'[Statistiken](race-course-statistics.md) zielen): méi spéit bremsen, wann se e puer Meter méi spéit wéi déi aner gebremst huet; soss d'Ursaach vum Ausgank | Verléscht |
| verluer, e Tausch, verluer bis zum Scheitelpunkt | **huet beim Eragang méi ofgeginn, wéi den Ausgank zréckgewonnen huet**: d'Ursaach vum Eragang, déi och hir Wuerzel (`cause`) ass; de Ausgank behalen, beim Eragang manner verléieren | Verléscht |
| verluer, am Riichtstreck gelooss, an de gefuerene Stéck méi wéi d'Halschent vum Verléscht | **net voll Gas um Riichtstreck**: Undeel vun deem bei vollem Gas géint deen vun der anerer, wou a wéi laang d'Lassgoen war | Verléscht |
| verluer, de Zuch vun den Autoen méi wéi 60 % vum Verléscht an de Riichtstreck méi wéi d'Halschent | **den Zuch vum Auto laanscht de Riichtstreck** (mat dem Zuch vun béiden Autoen bei 160 km/h) | Verléscht |
| soss verluer | d'Ursaach vun der Halschent, déi méi verluer huet (bis zum Scheitelpunkt ≥ duerno: dee vum Eragang; soss dee vum Ausgank). Nëmmen spéider eraus, well méi lues an der Mëtt (ëm méi wéi 1 m/s): stattdessen d'Ursaach vun der Mëtt | Verléscht |

Un engem Verléscht kann och mat **Och:** ophalen - Geschwindegkeet verluer bei vollem Gas, oder e Lassgoen op dem Riichtstreck - wann den gefuerene Stéck vum Riichtstreck méi wéi 0,04 s kascht huet an dat net schonn d'Ursaach war.

Befunder ginn sortéiert: Verléschter als éischt, déi deiersten als éischt; dann Gewënn an gläich Kurven.

### Ursaachen am Eragang {#causes-on-the-way-in}

`entryCause`, dee éischte, deen zoutrëfft (Geschwindegkeetsënnerscheeder sinn a m/s; "5 m" ass d'Schwell, ab där e spéiderer oder fréiere Punkt zielt):

| # | Ursaach (Feeler) | Regel |
|---|---|---|
| 1 | e Stouss oder Kraach beim Eragang | e net gedeelten Impakt, deen 10 m no dem luesten Punkt ufänkt |
| 2 | **bal stoen bliwwen** (Zwëschefall) | luesten Geschwindegkeet ënner **60 %** vun deem, wat de Gripp vun dësem Auto erlaabt, wou den anere duerchgefuer ass (`v_anerer · √(Gripp_mengem / Gripp_anerer)`, wann den anere Auto méi Gripp huet, soss d'Geschwindegkeet vum anere), an déi aner Ronn iwwer 8 m/s - e Dréiwen, e Kontakt oder eng verpasst Kurv |
| 3 | e Auto-Kontrollfeeler beim Eragang | e net gedeelten Blockéieren, Dréck, Dréinen oder Rutschen net um Gas, dat 10 m no dem luesten Punkt ufänkt, Käschte ≥ 0,02 s |
| 4 | e méi laange Fluch virum luesten Punkt | kuckt [Rally](#rally-rotation-and-flights) |
| 5 | **lass** wou déi aner flaach bliwwen oder 5 m oder méi spéider gelooss huet | dës Ronn huet nëmmen gelooss |
| 6 | **gebremst wou déi aner nëmmen gelooss oder flaach bliwwen ass** | an war méi wéi 0,5 m/s méi lues an der Mëtt |
| 7 | **liicht gebremst** | si huet gebremst (net gelooss), a konnt méi haart bremsen - mat Reifedaten: hire Blockéier-Schlupf ënner **60 %** vum Schlupf, wou d'Bremsen vum Auto am besten sinn; ouni, eng Spëtzenverzögerung ënner **85 %** vun deem, wat se bei där Geschwindegkeet weist - de Pedal ënner 0,95, an d'Spëtzenverzögerung vun der anerer Ronn méi wéi **15 %** méi héich |
| 8 | **zu fréi gebremst** - oder **d'Bremsen vum Auto** | méi wéi 5 m virun der anerer gebremst. An engem anere Auto, deem seng Bremsen iwwer 5 % stäerker sinn, an mat nëmmen 10 m Rand géint d'Distanz, déi dësen Auto bei senger eegener Verzögerung brauch: d'Bremsen vum Auto. Soss zu fréi gebremst, mat "Méi spéit bremsen - ongeféier N m" (an engem anere Auto d'Meter iwwer dat, wat et brauch) |
| 9 | **gerullt** | méi wéi 10 m ouni Pedal, an 5 m méi wéi déi aner |
| 10 | **an der Mëtt méi lues** | méi wéi 0,5 m/s méi lues am luesten Punkt; opgedeelt mat `v² = a·R` (hei ënnen) |
| 11 | **méi lues ukomm** | iwwer 1 m/s méi lues beim Bremspunkt, net zu fréi gebremst: virdrun entscheet - vun der Kurv virdrun an dem Zuch vum Auto, oder vun engem Fluch an där Kurv virdrun, dee 0,2 s méi laang war. Dem Auto seng, wann d'Autoen sech ënnerscheeden |
| 12 | méi lues bis zum Scheitelpunkt | soss: d'Bremse méi lues loossen an méi Geschwindegkeet an d'Mëtt rollen |

**Méi lues an der Mëtt** (`middleSplit`): den Radius vun all Ronn bei hirem luesten Punkt gëtt aus hirem eegene Wee gemooss (±8 m), hir Querbeschleunegung als `v²/R`, an

`ln(v_anerer / v_mengem) = ½ ln(a_anerer / a_mengem) + ½ ln(R_anerer / R_mengem)`.

- De Radius erkläert **d'Halschent oder méi**: **ze enge Linn** - "huelt méi vun der Strooss", mat béide Radien an dem Undeel.
- Um Limit vum Auto (rutscht iwwer 10° Drift op Asphalt / 20° op locker, oder Querbeschleunegung op d'mannst 90 % vun dem, wat se bei där Geschwindegkeet hält), an deen anere Auto hält iwwer 5 % méi Gripp: **dem Auto säin Gripp**; liiwer de Duerchgang schützen.
- Duerch d'Kurv gerutscht (Drift iwwer 10° / 20°), an déi aner Ronn net (hire Drift am Eragang op d'mannst 4° méi kleng): **zur Säit** - iwwer hirem Gripp, net ënnert et; e bëssen méi lues ukommen. Gesot als dem Auto seng, wann dësen Auto d'Hënnerrad mindestens eemol pro Ronn méi wéi den anere faange fëlt.
- An engem anere Auto, deen **ënner 96 %** vum Gripp vum anere hält, an d'Ronn bannent 1 m/s vun `v_anerer · √(Gripp_mengem / Gripp_anerer)` gefouert gouf: **dem Auto säin Gripp** - "méi spéit bremsen wäert dat net zoumaachen".
- Soss **Gripp ze spueren**: Querbeschleunegung géint déi vum anere bei engem ähnleche Radius, an wat dësen Auto hält; méi Geschwindegkeet an de Scheitelpunkt huelen. Wou d'Hënnerrad vun dësem Auto lass léisst, ier säi Gripp ausgeschöpft ass (seng Rutsch fänken ënner 85 % vu sengem Gripp un, an d'Ronn war bei 80 % dovun), de Rescht a klenge Schrëtt fannen.

### Ursaachen am Ausgank {#causes-on-the-way-out}

`exitCause`, dee éischte, deen zoutrëfft:

| # | Ursaach (Feeler) | Regel |
|---|---|---|
| 1 | e Auto-Kontrollfeeler am Ausgank | net gedeelten Raddréiwen, Dréien, Rutschen oder Impakt, deen 10 m virun dem luesten Punkt oder méi spéit ophält |
| 2 | **verluerene Geschwindegkeet** | méi wéi 1 m/s méi Geschwindegkeet bei vollem Gas verluer wéi déi aner; iwwer **7 m/s (25 km/h)** "éischter wéi e Kontakt oder e Dréien wéi e Rutsch" |
| 3 | **de Wagen falsch gedréint** (locker Buedem) | kuckt [Rally](#rally-rotation-and-flights) |
| 4 | **ze spéit am Gas** | Gas-un méi wéi 5 m méi spéit, vun der eegener luesten Punkt vun all Ronn aus gezielt (eng Ronn, déi méi spéit luesten war, gëtt net fir spéit Gas beschëllegt) |
| 5 | **am Gas gezéiert** | méi Gas-Dips wéi déi aner |
| 6 | **ass ze wäit erausgefuer a gewaart** | méi wéi 1,5 m dobaussen vun der anerer, wou béid voll Gas haten, an d'Vollgas méi wéi 5 m spéit vun hirem eegenen luesten Punkt |
| 7 | **spéit voll Gas** | voll Gas méi wéi 5 m spéit, och vun hirem eegenen luesten Punkt; mat der Beschleunegung vum Auto dert |
| 8 | **d'Fuerung vum Auto** | an engem anere Auto, deen bei där Geschwindegkeet ënner 95 % vum anere zitt, an de Zuch e Stéck vum Riichtstreck erkläert huet |
| 9 | **lues aus der Kurv eraus** | soss: en spéideren Scheitelpunkt, dann ass de Auto séier geradeaus |

Wann déi zwee Ronnen am luesten Punkt a verschiddene Gäng waren, endet de Tipp mat "Gang N am Scheitelpunkt; déi aner huet M benotzt."

### Auto-Kontrollfeeler an Impakter {#car-control-faults-and-impacts}

En Feeler vu [Autosstüerungs-Evenementer](race-control-events.md) als Ursaach: e Blockéieren ass eng *Bremsen*-Ursaach, Raddréiwen oder en Rutsch um Gas eng *Ausgank*-Ursaach, dat Rescht *Eragang*; e Stouss nom luesten Punkt ass *Ausgank*, virdrun *Eragang*. Den Tipp ass dee vum Evenement selwer, dann "Et huet ongeféier X s gekascht bis 40 m no him" (oder "bis den Auto seng Geschwindegkeet erëm hat" bei engem Impakt). E Blockéieren mat engem Bremspunkt méi wéi 5 m méi fréi wéi bei der anerer seet derbäi, datt d'Ronn och zu fréi gebremst huet - mat de Rieder, déi sech dréinen, hätt se dat net gebraucht.

### Rally: Dréien an Fluchen {#rally-rotation-and-flights}

Op **lockerem Buedem**, mat Driftwénkelen op béiden Ronnen, an dës Ronn am Gas (oder flaach) méi wéi 5 m méi spéit:

- **Huet den Auto manner gedréint**: déi aner huet den Auto bis zu hirem luesten Punkt **12°** oder méi gedréint an op d'mannst **8°** méi wéi dës Ronn. Tipp: e Lassgoen oder en Dab mam lénksen Fouss beim Anlenken, mat dem Handbremspunkt vun der anerer Ronn, wann nëmmen déi d'Handbrems benotzt huet, oder d'Handbrems an enger Kurv méi lues wéi 15 m/s (54 km/h).
- **Huet en ze wäit gedréint**: dës Ronn huet en 12° oder méi gedréint an op d'mannst **12°** méi wéi déi aner: en huet missen opgeriicht ginn, ier de Gas kënne fëlle.

**E méi laange Fluch**: 0,2 s oder méi méi laang an der Loft wéi déi aner, a kascht op d'mannst 0,03 s vun 10 m virum Ofsprong bis 40 m no der Landung (oder dem Segmentenn). Virun dem luesten Punkt ass et eng Eragangs-Ursaach; et gëtt d'Geschicht vun der Kurv, wann et 40 % oder méi erkläert. Den Tipp: de Gas beim Ofsprong ouni Ënnerbriechung halen, de Kamm e bëssen lues oder mat engem Dab vun der Bremse huelen.

### De Start {#the-start}

Virun der éischter Kurv, bei engem Sprint oder wann eng vun den Ronnen aus engem Stand ugefaang huet (ënner 5 m/s wou béid als éischt an der Achs sinn) oder bei engem Rennstart (ënner 60 % vun der Geschwindegkeet vum anere), ass de Wee bis zum éischte Bremspunkt en eegene Befund (Kurv 0), wann en 0,03 s oder méi vum anere ofwäicht: *De Start*, *De Rennstart* oder *Bis zur éischter Kurv*. E Verléscht do gëtt der Situatioun (*Kontext*) zougeschriwwen, wann eng Ronn bei engem Rennstart an déi aner am Vollgas ugefaang huet, dem Auto, wann d'Ronnen a verschiddene Autoen sinn, a soss dem Fuerer. Tipps: an engem anere Auto aus engem Stand, "meeschtens den Auto"; en Stopp-Start an demselwechten Auto, mat manner Raddréien lassfueren an bei der Spëtze vum Zuchbereich schalten; e Rennstart, mat enger anerer éischter Ronn vergläichen; e fléien Start, e besseren Ausgank aus der leschter Kurv gëtt iwwer d'Linn gedroen.

## D'gefuer Linn {#the-driven-line}

`lineMetrics`, pro Ronn a Segment (net fir gemëschte Komplexer), nëmmen aus de Positiounen (gegleet ±2 Samples) iwwer den Kurvenberäich:

| Miessung | Regel |
|---|---|
| Krümmung | Richtungswiessel iwwer ±8 m vum eegene Wee vun der Ronn |
| **engste Radius** | 1 / der Spëtzekrümmung |
| **Anlenken** / **Ausfueren** | wou d'Krümmung als éischt / lescht een Fënnefel vun hirer Spëtz iwwerschreit |
| **Mëtt** | wou d'Ronn d'Halschent vun hirem Richtungswiessel gedréint hat |
| Radius eran / eraus | Meter, gefuer iwwer déi Halschent vum Richtungswiessel, virun / nom der Mëtt |
| **Form** | engste Radius iwwer dem Duerchschnëttsradius beim Dréien: ënner **0,55** en **V**, iwwer **0,75** en **U**, dertëscht "U/V" |
| **Scheitelpunkt** | Radius eraus iwwer Radius eran: iwwer **1,25** spéit, ënner **0,8** fréi, soss Mëtt |
| **Geschwindegkeetsscheitel** | de luesten Punkt méi wéi **15 m** virun der Mëtt: lues eragoen, séier erausgoen; méi wéi 15 m no der Mëtt: nach ëmmer bremsen iwwer d'Mëtt |

Géint déi aner Ronn: wéi wäit dovun dran (+) oder dobaussen et beim Anlenken war, duerch de engste Bereich an wou béid flaach waren (gesot ab 1 m); wou all eent Anlenke gemaach huet (gesot ab 8 m).

### Wéi eng Linn zu dësem Auto hei passt {#which-line-suits-this-car-here}

`lineFor`, aus dem, wouhin d'Kurv féiert an dem Charakter vum Auto bei dëser Kurv:

- **Kraaft-zu-Gripp** = d'Beschleunegung vum Auto bei vollem Gas bei der Ausgangsgeschwindegkeet iwwer sengem Gripp bei der Mindestgeschwindegkeet (aus senger Hëllechkurve). **Point and shoot** bei **0,45** an dodriwwer; **Momentum** bei **0,25** an doronner.
- **Downforce**: Gripp bei 151-252 km/h iwwer Gripp bei 54-108 km/h vun **1,15** oder méi, bei enger Kurv mat **144 km/h** (40 m/s) oder méi séier - dann ass et eng Momentum-Kurv, egal wéi d'Kraaft ass. Net op locker Buedem beuerteelt.

| Kurventyp | Auto | Linn |
|---|---|---|
| no engem Riichtstreck | point and shoot / anerer | V / U, Scheitelpunkt an der Mëtt: "d'Bremszon ass de Präis" |
| tëscht zwee Riichtstrecken | momentum / anerer | U / V, spéiden Scheitelpunkt |
| Verbindung | momentum / anerer | U / V, Scheitelpunkt an der Mëtt: "fuer se fir den Ausgank vun der nächster" |
| op e Riichtstreck | momentum (oder eng séier Downforce-Kurv) | breet rond U, liicht spéiden Scheitelpunkt |
| op e Riichtstreck | point and shoot | V: direkt bremsen, spéit anlenken, an der kuerzer enger Mëtt drehen, fréi geradeaus |
| op e Riichtstreck | dertëscht | U mat spéiden Scheitelpunkt: lues eragoen, séier erausgoen |

Wou de Ausgank zielt (op e Riichtstreck, tëscht zwee), gëtt de Triebstrang e Satz derbäi: **FWD** - beim Bremsen eendrehen, nëmme Kraaft dobäi wann d'Rad sech ausdréit; **RWD** mat engem Kraaft-zu-Gripp vun 0,35 oder méi - virun dem volle Gas gerade maachen; **AWD** - et kann Kraaft huelen, wann et nach dréit. Op locker Buedem gëtt jiddwer Linn e Satz derbäi: de Auto am Eragang eindrehen.

De Saz seet dann, wat d'Ronn gefuer huet, an ob dat passt: *lues an der Mëtt, spéit, dat bindt den Ausgank* oder *en fréien Scheitelpunkt bindt den Ausgank*, wou e spéiden Scheitelpunkt gebraucht gouf, an d'Ronn weder spéit gescheitelt huet nach fréi lues war; *méi rond wéi dëse Auto wëll* wou en V gebraucht gouf; *méi eckeg wéi dëse Auto wëll* wou e U gebraucht gouf; soss *dat passt*.

## Fir Entwéckler {#for-developers}

Code: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
D'Iwwerleeungen an hir Quellen: [d'Method](race-analytics.md).
