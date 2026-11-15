---
title: "Kamerapfad a Video"
nav_order: 15
lang: "lb"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Kamerawee a Video

Maacht en Film vun Ären Daten: Dir setzt d'Kamera op e puer Plazen, a fléien tëscht hinnen, a spuert en Video. All Bild ass ganz propper, ouni Kär. D'Kamera an d'Zäitlinn beweegen sech zesummen, also mécht dat selwecht Panel en Zäitraffer ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## E Flugwee maachen {#make-a-flythrough}

1. Fléi dohin, wou de Film ufänkt, a drëckt **Keyframe hei derbäisetzen** am **Kamerawee & Rendering**.
2. Fléi op déi nächst Plaz a drëckt et nach eng Kéier. Wiederhuelt dat fir all Stopp.
3. Hakt **Virschau laanscht de Wee** un a zitt **Positioun um Wee**, fir d'Beweegung ze kontrolléieren.
4. Setzt d'**Dauer** (wéi laang de Video ass). Eng Beweegung, déi richteg ass, awer ze séier, brauch nëmmen eng méi laang Dauer.
5. Drëckt **Video renderen**. Waart op d'Fortschrëttslinn; d'Datei gëtt erofgelueden, wann et fäerdeg ass.

![Den Kamerawee- & Rendering-Panel mat dräi Keyframen, weecher Interpolatioun, 12 s, 30 fps a 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Keyframen {#keyframes}

| Reglage | Effekt |
|---|---|
| **Keyframe hei derbäisetzen** | Hänkt d'aktuell Kameraposition, de Giering, d'Neigung an d'Gesichtsfeld als Keyframe un. |
| **Läschen** | Läscht all Keyframen. |
| Keyframe-Lëscht | Eng Zeil pro Keyframe: seng Nummer (klickt, fir d'Kamera dohin ze fléien, a dat Gesichtsfeld mat ze setzen), d'Positioun, `Giering° / Neigung°`, an **×** fir en ewechzehuelen. |

Keyframen ginn **gläichméisseg** op enger normaliséierter Wegachs vun 0 bis 1 verdeelt, wann een derbäigesat oder ewechgeholl gëtt; d'Ausgabe-Dauer streckt dann déi ganz Beweegung, sou datt eng Opnam, déi richteg ass, awer ze séier, nëmmen eng méi laang Dauer brauch. Den Giering gëtt tëscht de Keyframen entwéckelt, sou datt sech d'Kamera deen kuerzen Wee dréint.

Ouni Keyframen hält e Rendering d'aktuell Kamera fir de ganze Clip still - e richtegen gudde Zäitraffer.

## Wegastellungen {#path-settings}

| Reglage | Standard | Beräich (Schiebe) | Bedeitung |
|---|---|---|---|
| **Interpolatioun** (2+ Keyframen) | *Weech* | *Weech* / *Riicht* | *Weech*: eng kubesch Hermite-Kurv duerch d'Keyframen, mat Tangenten aus den Nopesch-Keyframen, sou datt d'Geschwindegkeet iwwer all Keyframe passt a keen Ruck do ass, wou d'Segmenter zesummestoussen. *Riicht*: riicht Linnen tëscht den Keyframen, viraussiichtlech, mat engem sichtbaren Eck bei all Keyframe. D'Gesichtsfeld gëtt ëmmer linear interpoléiert. |
| Fuerlinn (2+ Keyframen) | | | `N Eenheeten Fuert - M pro Sekonn bei dëser Dauer`, oder eng Notiz, datt d'Keyframen all op enger Plaz sinn. |
| **Virschau laanscht de Wee** (1+ Keyframen) | aus | | Steiert d'Kamera vum Viewport aus dem Wee, a réckt d'Zäitlinn mat, wéi et d'Rendering mécht, sou datt d'Beweegung virum Rendering beuerteelt ka ginn. |
| **Positioun um Wee** (wärend der Virschau) | 0 % | 0-100 % | Wou um Wee virgekuckt gëtt. |
| **Dauer** | 12 s | 1-120 s (3600) | Länge vum Video. |
| **Framerate** | 30 fps | 6-60 (240) | |
| **Bitrate** | 16 Mbps | 1-60 Mbps, logaritmesch (400) | Hëtzt-Verléiwe bandéieren schlecht bei nidderegen Bitraten: et gëtt wéineg Detail, wou e Codec e Feeler verstoppe kann. |
| **Waardegrenz fir d'Konvergenz** | 240 Bilder | 2-600 (10.000) | Déi lëngst Zäit, déi en Ausgabebild wardt, bis et exakt ass. Bilder, déi d'Grenz erreechen, ginn trotzdeem geschriwwen a gezielt. |
| Zesummefaassung | | | `N Bilder · Fënster: kumulativ/fix/Liewensdauer`, an wann d'Zäitlinn am Modus Alles ass: *(de Rendering schalt Alles op Ofspillen, sou datt d'Zäitlinnstelle eppes bedeit)*. |
| **Video renderen** / **Ofbriechen** | | | Fänkt d'Rendering un; wärend se leeft, weist se `Bild i / n · gewaart w · X MB` a wéivill Bilder net exakt waren. Brauch en Datesaz. |

## Tipps {#tips}

- D'Ausgabegréisst ass d'Gréisst vun der Leinwand a Gerätepixelen (d'Pixelverhältnis vum Display, héchstens 2). Ännert d'Gréisst vum Browserfënster, fir se z'änneren.
- Eng kumulativ Geschicht baut d'Hëtzt iwwer de Clip op; eng Fënster- oder Liewensdauer-Geschicht weist eng beweeglech Schiicht vun der Zäit.
- D'Positioune vun de Keyframen sinn Koordinaten vum Display: mat enger [ëmgedréinter Weltachs](camera.md#invert-world-axis) weisen Keyframen, déi virun der Ëmschalt gemaach goufen, duerno op eng aner Plaz.

## Fir Entwéckler {#for-developers}

### Wat e Rendering mécht {#what-a-render-does}

1. Mécht eng Testopnam vum Bild, fir d'exakt Ausgabegréisst a Gerätepixelen ze liesen.
2. Wielt e Codec iwwer WebCodecs: **VP9** (`vp09.00.10.08`), soss **VP8**, mat der gewielter Bitrate an Framerate. Ouni `VideoEncoder` hält et mat *Dëse Browser huet kee VideoEncoder - WebCodecs ass néideg, fir e Video ze schreiwen* un; mat kengem vun den zwee Codecs mat *Kee ënnerstëtzten Videocodec (VP9, VP8 probéiert)*.
3. Iwwerhëlt d'Astellungen, déi e Rendering brauch: hält d'Ofspillen un, schalt **adaptiv Budget aus**, **progressiv Verfeinerung un** an d'Sprite-Budget op 64 Mio. pro Bild (dat adaptiv Budget schützt d'Bildrate, dat ass hei dat falscht Zil: et géif all lues konvergéierend Bild als Grond liesen, weniger Zeilen ze zeechnen, wat méi Bilder bräicht, bis et konvergéiert), a schaltet d'Zäitlinn vun **Alles** op **Ofspillen**. D'Geschichts-Astellung (kumulativ, Fënster, Liewensdauer) bleift wéi se ass: e Rendering soll d'Saach sinn, déi Dir kuckt hutt, duerchgespillt a festgehalen.
4. Fir all Ausgabebild *f* vu *n*, bei *u* = f / (n - 1):
   - setzt d'Kamera op d'Positioun vum Wee bei *u* (wann et Keyframen gëtt);
   - sicht d'Zäitlinn op den selwechte Bruchdeel *u* vun der Zäitlinn-Spann (d'Spann vun der gewielter Sitzung bei der Box-Wiedergab);
   - zwéngt eng frësch Schätzung, och wann d'Kamera sech net beweegt huet - d'Accumulatioun vum leschten Bild ze iwwerhuelen, géif e Gespenst vun der fréiere Fënster hannerloossen;
   - waart Bild fir Bild, bis d'Bild exakt ass (all Kandidatezeilen an engem Bild gezeechent, oder d'Accumulatioun fäerdeg), bis zur Wartegrenz;
   - hëlt de zesummegesate Bild a kodéiert en, mat engem Keyframe all 2 Sekonnen Ausgabe, sou datt d'Datei suchbar ass.
5. Packt d'Bilder an eng WebM-Datei ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)), mat Zäitstempel aus der Framerate - d'Wanduerzäit, déi all Bild gebraucht huet, spillt keng Roll.
6. Stellt d'Budget, d'Gesichtsfeld, den Zäitlinnmodus, d'Zäitlinnstelle an ob et gespillt gouf erëm her.
7. Lued de Video als `3dheat-<width>x<height>-<frames>f.webm` erof a mellt `N Bilder bei W×H, X MB - all Bild exakt`, oder wéivill d'Wartegrenz erreecht hunn.

**Ofbriechen** hält nom aktuelle Bild un (*Rendering ofgebrach.*) an stellt d'Astellunge wieder her.
