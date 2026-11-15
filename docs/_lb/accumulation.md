---
title: "Akkumulatioun"
parent: "Rendering-Interna"
nav_order: 2
lang: "lb"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Accumulatioun

Wann de Viewer net all Punkt an enger eenzeger Bild zeechne kann, zeechent en e Stéck dovun, dann en anert Stéck, a leet d'Biller zesummen, wéi Dir stëll hält. D'Bild gëtt méi kloer, wéi e Foto, dat sech entwéckelt. Wann Dir d'Kamera beweegt, fänkt et vir vir. D'Zeil **Ofdeckung** am Statistiken-Overlay weist, wéi wäit et ass.

![D'Statistiken-Overlay: Ofdeckung weist en Prozentsaz, wärend d'Bild sech entwéckelt, an *exakt*, wann et fäerdeg ass](../assets/img/en/performance-stats-overlay.webp)

## Fir Entwéckler {#for-developers}

Wann eng Bild net all Zeil zeechne kann, zeechent se eng Probe a gewiicht se erop; d'Bild ass dann eng onbiased, awer geräischeg Schätzung. **Accumulatioun** verbënnt openeranerfolgend Biller, sou datt d'Schätzung zur exakter Äntwert konvergéiert, sou laang sech näischt ännert. All Bild wielt ee vu fënnef Modi ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); de leschte benotzte steet op `engine.live.accumMode`.

| Modus | Wann | Wat mam Akkumulator geschitt |
|---|---|---|
| **reset** | d'Kamera ass beweegt, eppes, wat d'Feld ännert, ass geännert, progressiv Verfeinerung ass aus, en wuessend Fënster fänkt un (éischt Bild vun der Wiedergab, nom Sprangen), oder eng gespillte Linn-Hëtzt huet sech bewegt | Ersat duerch d'Schätzung vun dësem Bild. |
| **extend** | e **Kumulativ**-Fënster, dat nëmmen zanter dem leschte Bild gewuess ass | Dëst Bild zeechent nëmmen d'Zeilen, déi grad sichtbar ginn, am volle Gewiicht, an addéiert se. Näischt geet of. |
| **ema** | e gläidend Fënster (**Fënster**, **Liewensdauer**) huet sech bewegt | `acc = acc × (1 - 0,34) + frame × 0,34` - e exponentielle gläidende Mëttelwäert vun ongeféier dräi Bilder. |
| **mean** | näischt huet sech geännert, an d'Schätzung ass net fäerdeg | `acc = acc × (1 - 1/n) + frame × 1/n` beim *n*-ten Bild: e lafende Mëttelwäert. |
| **skip** (waart) | konvergéiert, an näischt huet sech geännert | Näischt gëtt gezeechent; dat Bild setzt nëmmen nei zesummen. |

### Firwat jiddereen {#why-each}

- **Lafende Mëttelwäert, keng Summ.** D'Pufferskala mat 1 - 1/n an 1/n vum neie Bild derbäi ass algebraesch dat selwecht wéi d'Summ ze huelen a bis zum Schluss duerch *n* ze deelen, awer de Puffer hält ëmmer ee Feld. Eng Summ kënnt op *n*-mol d'Feld, a bei engem 16-Bit-Zil stëtzt se op 65.504; mat engem Divisor, dee ëmmer wiisst, géif eng stëll Usiicht ëmsou méi verbléichen, jee méi laang se stoung - wärend eng beweegt Kamera, déi bei all Bild zréckgesat gëtt, perfekt richteg ausgesäit. D'Rauchsuite behaapt, datt 16 zesummegeluechte Bilder 1,00× vun deem halen, wat ee Bild hält.
- **Extend bei kumulativer Wiedergab.** D'Zeilen, déi schonn accumuléiert sinn, sinn nach ëmmer sichtbar, sou datt en Bild nëmmen de Bréchdeel vun enger Sekonn brauch, dee grad ukomm ass - wat an ee Bild passt, gëtt dofir exakt derbäi gesat. Nei schätzen géif bei all Bild en anere zoufällegen Undeel uschalten a fueren, a wéi Ausbréch liesen, déi opflammen a verschwannen, an e pausen Bild géif weiderhin fëllen. D'Suite behaapt, datt d'Gesamtzuel bei der Wiedergab monoton klëmmt an sech bei 2,5 s Paus bannent 0,02 % hält.
- **Gläidende Mëttelwäert bei gläidende Fënstere.** Déi ännere sech wierklech bei all Bild. E fixe Mëschgewiicht follegt dem bewegte Fënster (e Mëttelwäert iwwer all Bild zënter der Wiedergab géif hannerhier dem Zeiger hänken) a ass vill rouer wéi vun Null unzefänken.
- **Reset bei gespillte Linnen.** D'Linn-Hëtzt-Käppe beweege sech bei all Bild; en gläidende Mëttelwäert géif all eng an e Streifen verschmieren, dofir gëtt all Bild ganz gezeechent, an d'Verbleechung um Enn ass d'eegen vum Bild.
- **Deelbilder ginn duerch en Zwëscheschpäicher.** E Bild, dat zu engem Bréch vum vollen Gewiicht zesummegeluecht gëtt, gëtt vun Null an en eegene Zil gesat an dann an den Akkumulator gemëscht, anstatt direkt mat 1/n Gewiicht gesat ze ginn. Direkt géif all Sprite mat 1/n vun der Gréisst vun der Summ, zu där et derbäikënnt, derbäi gesat ginn, wat e Halfloat-Zil wegrënnt - am schlëmmsten, wou et am dichtsten ass ([Halfloat-Akkumulatioun](half-float-accumulation.md)).

### Konvergenz {#convergence}

De Plang fir all Bild weess, wéi vill Kandidatezeilen et gëtt an wéi vill et ofschéckt, also ass d'Zuel vun de Bilder, déi gebraucht ginn, fir all Zeil ze decken, ⌈Kandidaten / ofgeschéckt⌉. Wann esou vill Bilder zesummegeluecht sinn, ass d'Usiicht **konvergéiert**: d'Zeil *Ofdeckung* am Statistiken-Overlay gëtt vun engem Prozentsaz op *exakt*, a weider Bilder waarden. Mat **All Zeil all Frame zeechnen** un (Standard) deckt en eenzegt Bild normalerweis alles, sou datt d'Konvergenz direkt ass; de progressive Mechanismus brauch een nëmmen, wann d'Fënster méi Zeilen huet, wéi een eenzegen Zeechnungsplang droe kann (ongeféier 67 Millioune).

### Wat en nei ufänkt {#what-restarts-it}

D'Astellunge falen an dräi Gruppen, jee nodeem wat de Puffer nach heescht, nodeems se sech geännert hunn:

| Gruppe | Ännert | Effekt |
|---|---|---|
| **Geometrie** - wéi Zeilen mitzielen a wéi vill | Usichtsmodus; Linn-Weeër; Sprite-Radius, Intensitéit an der Mëtt an um Rand, Ofnam, gläidende Verlaf, d'Kurv, Pixelgrenzen, Flaachmaachen; Ofstandsgrenzen no bannen, wäit an an der Fläch; Verdeckung an *Hannert dem Terrain verstoppen*; den Schnitt; d'Gréisst vun der Leinwand; Hëtzt-Opléisung; Gruppesichtbarkeet a Vorzeechen; den Ënnerscheed-Split; Alles / Ofspillen; d'Geschicht; d'Spalten-Filteren an d'Entitéiten-Auswiel; de Halfloat-Gewënn | Zrécksetzen. |
| **Fënster** - de Zäitberäich | d'Zäitlinnstelle, déi sech beweegt; d'Liewensdauer-Ersatz an d'Verbleechung | Verlängeren (kumulativ) oder gläidende Mëttelwäert (gläidend). |
| **Komposit** - nëmmen d'Faarwen | Sättegung, Dichtereaktioun, Minimal Heat, d'Faarfverlaf; de Level schneiden; Raster an Achsen; Astellunge vun der Box-Wiedergab an der Sessioun; Tiefeschäerf | Nei zeechnen ouni d'Hëtzt unzefaassen. |

Eng Kamerabewegung setzt ëmmer zréck. Dofir ass et gratis, d'Sättegung oder den Verlaf ze zéien; wann Dir den Sprite-Radius zitt, fänkt d'Konvergenz bei all Schrëtt nei un.
