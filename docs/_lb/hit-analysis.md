---
title: "Treffer-Analys (Gefierer-Tab)"
parent: "Replay"
nav_order: 4
lang: "lb"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Trefferanalyse

De Reiter **Gefierer** weist, wou en eenzelen Panzer, Schëff oder Zaldot getraff gouf, an vun wiem. Benotzt en, fir ze gesinn, op wéi enger Säit en Panzer geschoss gëtt, oder wéi e Feind de Schued mécht.

## Probéiert et {#try-it}

1. Lued e Match, dee Treffer huet (kuckt d'Tabell ënnen, fir ze gesinn, a wéi Spiller se ginn).
2. Maacht uewen de Reiter **Gefierer** op.
3. Ënner **Gefier** wielt eng Eenheet, zum Beispill eng Panzerart. D'Zuel an de Klammeren ass, wéivill Treffer se kritt huet.
4. Kuckt d'Figur un: all Markéierung ass e Treffer, do gesat, wou en ageschlon huet.
5. Maacht **Wien huet getraff** op, fir d'Schëtzen, d'Waffen oder d'Schéissgefierer ze gesinn, mat Treffer, Schued, Killen an Distanz.

![De Reiter Gefierer: e Demo-Panzer mat Trefferzeechen, an Wien huet getraff ass op](../assets/img/en/hit-analysis-tank.webp)

Wann näischt gelueden ass, oder d'Daten keng Treffer op Gefierer hunn, seet de Reiter, wat feelt, a wéi Konverter ze benotzen ass.

```
        Schütz ----> o  Trefferzeechen op der Figur
        Schütz ----> o
  [ Panzerfigur ]
```

D'Figur weist d'Treffer, wou d'Daten e Punkt oder e Kierperdeel ginn. D'Opschlësselung (wien getraff huet, mat wat, wéi hart, vun wéi wäit) funktionéiert fir all Quell.

## Wat jiddereng Quell gëtt {#what-each-source-gives}

| Quell | Punkt op der Eenheet | Schëtz | Waff | Schued / Resultat |
|---|---|---|---|---|
| War Thunder | jo, am Rahmen vun der Eenheet, mat dem Wee vum Schoss | jo | den Gefier vum Schëtzen | kritesch, schwéier, Module zerstéiert, Doudesschoss |
| CS2 | Kierperdeel (hitgroup) | jo | jo | Schued, Panzerung, Gesondheet iwwreg |
| World of Tanks | jo (Komponentekëscht, Asiedlung a Austrëtt) | jo | - | Schued oder keen (Ofprall, keng Duerchschlag) |
| World of Warships | jo, am Rahmen vum Schiff | jo | Trefferart | - |
| Squad | Gefierer: jo - den Impakt am Rahmen vum Gefier, aus senger eegener Positioun a Richtung gesat | nee (d'Daten nennen keen) | d'Schuedensart | de Fall vun der Gesondheet vum Gefier an deem Moment, zerstéiert |
| Squad-Zaldoten | nee: d'Trefferresultater (Knach an Impaktpunkt) bleiwen vum Konverter roh; Zeilen `impact` mat `hitBone` ginn gelies, sobald en se schreift | | | nëmmen Verwonnungen an Doudesfäll |
| Arma (OCAP, den Arma-3-Recorder) | nee: OCAP hält fest, wien wien getraff oder ëmbruecht huet, mat wat, vun wéi wäit, net wou | jo | jo | Treffer oder Kill, Distanz |
| Tacview ACMI | jo, wou en Waffenobjekt bannent 30 m vun enger Eenheet ophält (net säin Werfer): säi leschte Plaz am Rahmen vun der Eenheet (Richtung, Neigung, Rollen), vun der Richtung, wou et geflu ass | de `Parent` vun der Waff | den Numm vun der Waff, oder en AmmoType vun engem Timeout | Timeout sengem `Outcome`, Fäll vum `Health`, `Destroyed`; ouni Waff en Kill oder Schued ouni Punkt |
| IL-2-Telemetrie (Watcher) | jo: `hit`- / `damage`-Eventer droen de Punkt am Rahmen vum eegene Fliger vum Spiller (als x no vir, y no uewen, z no riets geholl) | nee | nee | d'Kraaft |
| Dota 2 | nee: de Kampfloggbuch huet kee Plaz op engem Held | d'attackéierend Eenheet | d'Fäegkeet oder de Géigestand (keen: en Attack) | Schued, de Doud vum Held |
| Battlefield 6 (GameCapture) | nee: d'Erfaassung liest de Killfeed (Killen, Doudesfäll, Kopfschoss-Flagg), net d'Treffer | | | |
| DCS / aner Watcher-Live-Quellen | keng Trefferevenementer ausser deem, wat hir Tacview-Opnamen hunn | | | |

Wou kee Treffer vun der Eenheet e Punkt huet, weist d'Figur keng Markéierungen, an d'Opschlësselung **Wien huet getraff** geet vun alleng op: no Schëtz, Waff oder dem Gefier vum Schëtzen, jee mat sengen Treffer, Schued a Killen, an dem Mëttelwäert an dem weitste Ofstand.

## Op e Gebitt aschränken {#restrict-to-an-area}

De Bereich **Gebitt** beschränkt d'Analyse op Treffer, déi op enger Plaz op der Kaart geschitt sinn.

1. Drëckt **Rechteck zeechnen** oder **Polygon zeechnen**, a zeechent op dem 3D-Buedem oder op der taktescher Kaart.
2. Wielt **Affer dobannen** (en Treffer zielt, wann d'Eenheet, déi getraff gouf, am Gebitt war) oder **Schütz dobannen** (wann deen, deen geschoss huet, do war).
3. Drëckt **Als Filter benotzen**. D'Chips weisen "{n} vun {total} Treffer am Gebitt".
4. **Beräich zrécksetzen** läscht all Gebidder.

All Gebitt ass e [Volumen](volumes.md), sou datt déiselwecht Formen och d'Hëtzt an d'Wiedergab filteren. E Gebitt kann dobäi huelen oder ausschléissen (en ausschléissende Gebitt léisst seng Treffer eraus, gewisen als "{n} vun {total} Treffer ausserhalb vum Gebitt"). All Gebitt weist sech als Chip mat der Zuel vun den Treffer vun der Eenheet, déi dra waren; dat × op engem Chip läscht en. D'Zuelen, d'Figur, d'Opschlësselung a Filterlëschten follegen all.

D'Plazen vun engem Treffer: d'Zeil, vun där en eraus koum, hält d'Plaz vun enger Partei (dem Affer bei enger Verletzung oder engem Getraffen, dem Schëtzen bei engem Schoss); d'Plaz vun der anerer ass déi eegen Probe vun där Eenheet, déi an der Zäit um nootgelegensten ass (bannent 5 s). E Treffer, dee keng bekannte Plaz vun enger Partei huet, bleift draussen, während e Gebitt filtert, a d'Panel seet, wéivill ("Eraus gelooss, keng bekannte Plaz").

## Fir Entwéckler {#for-developers}

All Konverter kann Treffer derbäisetzen: eng Zeil vum Affer (`hit`, `impact`, `hurt`, `wounded`) mat `hitBone` (e Skelettknach, eng Arma-Auswiel, eng Reforger-Trefferzon - gemappt op Kapp, Broscht, Mo a Been) oder `hitLocalX/Y/Z` (Meter, x no vir, y no uewen, z no riets), mat `other` fir de Schëtzen an `damage`.
