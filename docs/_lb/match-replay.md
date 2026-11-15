---
title: "Match-Replay"
nav_order: 9
has_children: true
lang: "lb"
source: "match-replay.md"
source_hash: "9d61f24a5a04"
translated: true
outdated: false
---

# Match-Replay

De Replay ass en Film vum Match, wou all Spiller als dat gezeechent gëtt, wat se gefuer hunn. Benotzt en, fir e Gefecht nach eng Kéier ze kucken, eng Eenheet ze verfollegen an ze gesinn, wien wien getraff huet.

Schéiss, Treffer, Bränn a Wracken ginn op den Eenheete an de Ziler um Level gezeechent. Kameraen, Beschrëftungen a eng taktesch Usiicht hëllefen, de Kampf ze liesen. Kennt Dir Tacview? [Tacview-Parittéit](tacview-parity.md) weist, wou all Werkzeug vun deem steet.

![Figuren-Replay vum Panzer-Demo: Panzer als eege Figuren, mat Numm-, Gefier- a Vitessbeschrëftungen](../assets/img/en/replay-overview.webp)

## E Replay starten {#start-a-replay}

1. Lued eng Opnam mat **Quell → Fichieren…** oder dréit se op de Quell-Panel (all Tabell mat enger **Persoun**- an enger **Zäit**-Kolonn, eng Tacview-Datei, en konvertéierte Replay, en [`.3dheat`](container.md)-Match). Kuckt [Daten astellen](getting-data-in.md).
2. Maacht den **Match**-Tab op a wielt **Figuren-Replay**, oder wielt **Figuren-Overlay** an der Modus-Leescht vum Heatmap-Tab.
3. Ënner **Matcher am Replay** wielt ee Match, alles op eemol, oder e puer.
4. Drëckt **Ofspillen** op der Zäitlinn (oder `K`). Zitt d'Zäitlinn, fir ze sprangen.

Figuren ersetzen d'Boxen fir all Eenheet, vun där de Numm oder den Typ bekannt ass (kuckt [Figuren](figures.md)). Daten ouni Numm- oder Typkolonn ginn als Zaldote gezeechent.

![Den Match-Tab: d'Matcher-Auswiel, d'Sektioun Figuren, d'Kameraansiichten, Ofspillen an d'Evenementlëscht](../assets/img/en/match-replay-tab.webp)

## Figuren {#figures}

![En brennende Panzer an der Orbit-Kamera, mat dem Schoss, dee en getraff huet](../assets/img/en/replay-tanks.webp)

| Astellung (Sektioun **Figuren**) | Standard | Wat et mécht |
|---|---|---|
| **Figuren amplaz Boxen** | un | Aus zeechent einfach Boxen. |
| **Figurengréisst** (mal richteg Gréisst) | 1 | 1 ass richteg Gréisst; 0.25 bis 20 mal (logarithmesch). Gréisser hëlleft vu wäit ewech. |
| **Klengste Figur um Écran** | 36 px | Wäit ewech Figuren wuessen, fir sou laang ze bleiwen, 0 bis 200 px; 0 hält d'richteg Gréisst. |
| **Op Distanz**: Figur, Pfeil, Symbol | Figur | Wat eng wäit Eenheet gëtt. |
| **Symboler** | NATO (APP-6) | NATO (APP-6), russesch taktesch Zeechen, **Spillkaart**-Symboler oder **Nëmme Formen (faarweblann-sécher)**. |
| **Symbolgréisst**, **Meng Säit**, **Feindlech / Neutral**, **Kursstrécher** | 28 px (12 bis 64), automatesch, feindlech, un | Wéi d'Symboler ausgesinn an wéi eng Säit fréndlech ass. |
| **Lotlinnen** | un | Eng Linn vun all Eenheet direkt erof op de Buedem, sou datt Héichten am 3D liesbar sinn. |
| **Lotlinnen an Etiketten u Waffen** | aus | Linnen op de Buedem an Etiketten op Raketen a Bomme. |
| **Bränn op Eenheeten** | un | Flammen vum Moment, wou eng Eenheet brennt, bis se ausgeléscht ass. |
| **Treffer op Eenheeten** | un | Marken, wou Schëss getraff hunn (ënnen). **Treffer bleiwen**: 1 bis 300 Sekonnen, oder **Ganzt Liewen**. **Schwiewend Markéierungen**: Marken, déi iwwer der Uewerfläch gezeechent ginn. |
| **Bléck- an Tuermlinnen** | aus | Gestréchelt: wou de Spiller kuckt; voll: wou d'Kanoun zielt. |
| **Gebaier** | voll | Voll oder duerchsiichteg Gebaier, wann de Level se molt. |

### Symboler op Distanz {#symbols-at-a-distance}

Wann eng Eenheet méi kleng wier wéi **Klengste Figur um Écran**, kann se e Symbol ginn, dat liesbar bleift. D'Form seet d'Aart (zum Beispill e ofgerënnte Kascht mat enger Kettemark fir Panzerung); d'Faarf seet d'Säit. Maacht d'**Symboler**-Menü op, fir de Stil z'änneren.

![Déiselwecht sechs Eenheete als NATO-Symboler, russesch taktesch Zeechen, Spillkaart-Symboler an nëmme Formen](../assets/img/en/match-replay-symbols-styles.webp)

### Treffermarken, Wracken a Bränn {#hit-marks-wrecks-and-fires}

- **Treffermarken** sëtzen op der Uewerfläch, déi de Schoss getraff huet, an der Gréisst vun der Figur. Hir Form seet, wat geschitt ass: e Lach (duerchgaang), e hellen Spritzer (net duerchgaang), e Kratzer (ofgeprallt), e Rußstär (Sprengschoss). E faarbege Ring seet, wat et gemaach huet: Ofschoss, Modul zerstéiert, kritesch, schwéier, Schued, kee Schued, Treffer. Fiert mat der Maus iwwer eng Marke, fir den Numm vun der Ronn ze gesinn.
- Eng zerstéiert Eenheet gëtt als **verkuelt** Wrack gezeechent vum Doud bis si erëmkënnt oder ewechgeholl gëtt; hiert Symbol ass duerchgestrach.
- **Bränn** brennen op enger Eenheet vum Moment, wou se Feier fänkt, bis se ausgeléscht ass.
- **Tuerm** dréinen sech dohin, wou d'Daten d'Kanoun weisen (oder, ouni dat, wou de Spiller kuckt).

### Waffen, Lockvugelen a Leuchtspuren {#weapons-decoys-and-tracers}

Mat **Waffen, Schëss an Treffer** un (Sektioun Equipenusiicht): Raketen, Bomme a Torpedoen fléien als hir eege Figuren mat enger Rauchspuer; Kugelen a Schëss sinn Leuchtspuren; Aschléi a Explosioune blécken. Eng Leuchtspur, déi **gestréchelt** gezeechent gëtt, gouf aus engem Treffer erausgerechent, well d'Daten kee Schoss hatten. Fackelen a Chaff ginn als Lockvugelen gezeechent; si sinn aus der Eenheetelëscht verstoppt, ausser *Lockvugelen a Schëss* ass ugehaakt.

## Kameraen {#cameras}

Klickt op eng Eenheet oder hir Beschrëftung, fir se ze **verfollegen**; d'Sektioun **Replay** bitt **Hannendrun**, **Orbit**, **Cockpit** (mat engem Head-up-Display, `H`), **Fix**, **Padlock**, **Zil** a **Satellit** un. `V` wiesselt duerch si, **Kameraofstand** setzt wéi wäit. Esc hält un.

- **Zwou-Eenheete-Usiicht**: wielt e **Zil** (oder Ctrl/Alt-Klick op eng Eenheet), fir se vun där verfollegter aus ze kucken; **Täuschen** wiesselt se.
- **Mooss**: Shift-Klick op zwou Eenheeten fir d'Peilung, d'Distanz an den Héichtenënnerscheed tëscht hinnen.
- **2D-Kaart** (`M`): Eck- oder Vollansiicht, mat Spuren an Nimm.
- **Lieszeechen** (`B`): späichert de Moment an d'Kamera; d'eege Ofschëss, Doudesfäll an Markéierungen vun der Opnam stinn och dra.
- **Evenementer**: all Evenement a Zäitreiefolleg; e Klick sprengt dohin. `Page Up` / `Page Down` sprangen tëscht Evenementer; **Pausen am Evenement** hält bei all engem.

## Taktesch Usiicht {#tactical-display}

![D'Loftdemo mat der taktescher Usiicht-Optik (T): Drahtmodell-Terrain, Ofschoss- an Evenementpanelen](../assets/img/en/replay-air-tactical.webp)

D'Sektioun **Taktesch Usiicht** zeechent, fir kee Eenheet, déi gewielte, all, oder eng Aart (Fligeren, Buedem, Schëffer, Waffen): Geschwindegkeetsvektoren an de Wee virun sech, Nues- an Auftriebslinnen, Radarkegelen, Schlässer, Datenverbindungen, Engagementzonen a -linnen, Siichtlinnen, wou d'Spiller kucken (Siichtkegelen), d'Tuermzil an déi opgeholl Kamera.

### Usiichtsstil {#display-style}

`T` (oder de Schalter **Als taktesch Usiicht weisen**) wiesselt d'Optik op e Radarschierm-Stil: Glanz, Ëmrëss, Héichtelinnen, en Miessraster, Scanlinnen, Distanzringe, Héichtelatten, Panelen mat Ofschëss an Evenementer, an e **Regisseur**, deen d'Kamera selwer zu Evenementer réckelt.

![Dee selwechte Loftkampf an der normaler Optik](../assets/img/en/replay-air.webp)

## Ziler {#objectives}

Wann e Match mat sengen Ziler kënnt, zeechent d'Sektioun **Ziler** se um Level: Eroberungszonen (mat Besëtzer a Fortschrëtt vun der Eroberung), Spawnen, Fligerhaff, Gebidder a Bombenzilen, all Schicht eenzel schaltbar, mat Beschrëftungen. Si ginn duerch de Buedem gesinn. Mat méi Spillmodi gelueden filtert **Modus** d'Matcher no Modus. Ziler kommen aus der Matchdatei vun engem Konverter nieft der Opnam oder an engem [`.3dheat`](container.md)-Container.

## Beschrëftungen a Statistiken {#labels-and-statistics}

- **Beschrëftungen**: Reegelen pro Aart (**Gewielt**, **Fligeren**, **Buedem**, **Schëffer**, **Waffen**, **KI**): gewisen oder net, wéi Wäerter, an eng **Prioritéit** fir wien de Plaz kritt, wann d'Beschrëftungen sech iwwerlappen. **Etiketten ausenanerhalen** réckelt eng Beschrëftung neven hir Eenheet, wann se eng aner iwwerdecke géif, a léisst se weg, wou kee Plaz ass. **Etikettegréisst** ass 60 bis 250 %. **Zréck op Numm, Gefier, Héicht a Vitess** setzt d'Reegelen zréck.
  - Buedem-Eenheeten fänken mat Numm, Gefier a Vitess un.
  - Fligeren fänken mat Numm, Gefier, Héicht a Vitess un.
  - Schëffer fänken mat Numm, Gefier, Vitess a Kurs un.
  - Fiert mat der Maus iwwer eng Eenheet, fir all Wäert ze gesinn, deen si huet.
- **Statistiken**: pro Team an Eenheet: Ofschëss, Doudesfäll, Schëss, Treffer, Trefferquot, Starter, Landungen, Zäit an der Loft, héchst Vitess, Héicht an G, Distanz. CSV-Export.
- **Diagrammer**: d'Wäerter vun enger Eenheet iwwer d'Zäit, zwou Eenheeten verglach, oder ee Wäert géint en aneren.

## Vill Matcher op eemol {#many-matches-at-once}

Fir Honnerte oder Dausende Matcher iwwereneen ze leeën, kuckt [Vill Matcher op eemol](many-matches.md). Figurendetailer (Rauch, Brand, aner zäitgebonne Effekter): [Figuren am Figuren-Overlay](figure-replay.md). D'Lëscht vun de Tacview-Funktiounen: [Tacview-Parittéit](tacview-parity.md), eng Ënnersäit vun dëser hei.
