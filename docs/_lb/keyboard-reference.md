---
title: "Referenz fir Tastatur a Maus"
parent: "Kamera a Steierung"
nav_order: 2
lang: "lb"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Tastatur- a Mausreferenz

All Tast- an Mausaktioun op enger Plaz, sou datt Dir déi fannt, déi Dir braucht. Klickt als Éischt op d'Usiicht, sou datt se d'Tastatur kritt. Tasten ginn ignoréiert, wann e Textfeld oder eng Opklapp-Lëscht den Fokus huet. Déi kuerz Versioun steet och ënnen lénks an der Usiicht.

Schnellsich:

| Ech well ... | Drëckt |
|---|---|
| fléien | `W A S D`, zéien fir ze kucken |
| alles gesinn | `F` |
| ofspillen oder pausen | `K` |
| réckwärts ofspillen | `J` (nach eng Kéier fir ze pausen), virwäerts `L` |
| gesinn, wat d'Faarwen bedeiten | `?` oder `F1` |
| am Reiter Taktik zrécknämmen | `Ctrl+Z` |

## Kamera {#camera}

Aus [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Input | Effekt |
|---|---|
| `W` / `↑` | No vir an d'Richtung vun der Siicht |
| `S` / `↓` | Zréck |
| `A` / `←` | Lénks zur Säit goen |
| `D` / `→` | Riets zur Säit goen |
| `Space` / `E` | No uewen |
| `Q` / lénks `Ctrl` | No ënnen |
| `Shift` (ee vun den zwou) | Gedréckt halen: 6× Geschwindegkeet |
| lénks `Alt` | Gedréckt halen: 15 % Geschwindegkeet |
| Lénks oder riets zéien op der Usiicht | Kucken (Zeigerwierk gespaart, solang d'Knäppche gedréckt ass) |
| Rad (perspektivesch) | Fluggeschwindegkeet ×1,5 pro Raschtung (héchstens 4 Raschtungen pro Radbewegung) |
| Rad (parallel) | Zoom |
| Rietsklick | Mécht iwwer der Usiicht kee Kontextmenü op |

## Global {#global}

Aus [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Tast | Effekt |
|---|---|
| `K` | [Zäitlinn](timeline.md) ofspillen / pausen |
| `F` | D'Daten astellen |
| `C` | D'Positioun, de Giering an d'Neigung vun der Kamera kopéieren ([Kamera-Ufuerderung](camera.md#camera-readout)) |
| `G` | Zu engem geschriwwene Punkt goen: mécht d'Këscht ënner der Kamera-Ufuerderung op |
| `Esc` | D'Kaart vum Pick zoumaachen; dann net méi op déi zweet Eenheet kucken; dann net méi eng Eenheet verfollegen |
| `T` | Taktesch Usiicht un oder aus ([Match-Replay](match-replay.md#display-style)) |
| `?` / `F1` | Hëllefmodus: wat d'Faarwen bedeiten ([Astellungen, Eenheeten a Tasten](settings.md#help-mode)) |
| `1` | [Hëtzt](heat.md) |
| `2` | [Differenz](difference.md) |
| `3` | [Team-Hëtzt](team-heat.md) |
| `4` | [Linnen](line-heat.md) |
| `]` | Déi weit Ofstandsgrenz erausdrécken ×1,12 (`Shift`: ×1,35) |
| `[` | Déi weit Ofstandsgrenz erafdrécken ÷1,12 (`Shift`: ÷1,35) |
| `\` | Weit Ofstandsgrenz aus / erëm un, wou se war ([Déift a Ofstandsgrenzen](depth-and-culling.md#keyboard)) |

De Modus **Figuren-Overlay** huet keng Zifferdaaschtaste; wielt en an der Modus-Leescht oder maacht de Reiter Match op. D'Zifferdaasten gi duerch déiselwecht Kontroll wéi d'Modus-Leescht: eng Tast fir e Modus, deen d'Leescht fir déi gelueden Daten als net verfügbar weist, mécht näischt.

## Match-Replay {#match-replay}

Am Modus Figuren-Overlay, deen de Reiter Match benotzt ([Match-Replay](match-replay.md)). Si funktionéieren, ob eng Eenheet verfollegt gëtt oder net, ausser wou anescht gesot:

| Tast | Effekt |
|---|---|
| `B` | E Lieszeechen derbäisetzen: de Moment an d'Kamera |
| `M` | 2D-Kaart: Eck, ganz Usiicht, aus |
| `V` / `Shift+V` | Nächst / vireg Kameraansiicht vun der verfollegter Eenheet |
| `H` | Head-up-Display an den Cockpit- an Padlock-Ansiichten |
| `Page Down` / `Page Up` | Nächst / viregt Evenement vun den Aarten, déi d'Evenementlëscht weist |
| `J` | Réckwärts ofspillen; nach eng Kéier, fir ze pausen |
| `L` | Virwäerts ofspillen; nach eng Kéier, fir ze pausen |
| `.` / `,` | Eng Sekonn vir / zréck, pausiert (`Shift`: zéng Sekonnen) |
| `Esc` | Éischt net méi op de Ziel kucken, dann net méi verfollegen |
| `Ctrl`+Klick oder `Alt`+Klick op eng Eenheet (an der Usiicht oder an der Eenheetslëscht) | Dorop kucken aus der verfollegter Eenheet (d'Zwou-Eenheeten-Usiicht); nach eng Kéier klicken, fir se ze läschen |
| `Shift`+Klick op zwou Eenheeten | Miessen tëscht hinnen: Peilung, Distanz, Héichtenënnerscheed |

`V` brauch eng verfollegt Eenheet. `M` ass hei d'2D-Kaart, an am Reiter Taktik heescht et "réckelen".

## Eng Eenheet verfollegen {#following-a-unit}

Wann d'Kamera eng Eenheet verfolgt, da steiert d'Rad an d'Fluchtasten ronderëm d'Eenheet, anstatt fräi ze fléien ([Kamera](camera.md#while-following-a-unit)):

| Input | Effekt |
|---|---|
| Rad, `W` / `S` | Méi no / méi wäit (méi héich / méi niddereg an der Satellitte-Ansiicht). Net am Cockpit an an der Padlock-Ansiicht. |
| `A` / `D`, `Q` / `E` | Ronderëm d'Eenheet kreesen (Verfolgungs- an Orbitansiicht) |
| Zéien | Ronderëm d'Eenheet kucken; am Cockpit dran eragekucken |
| `V` / `Shift+V` | Nächst / vireg Kameraansiicht |
| `H` | Head-up-Display (Cockpit- an Padlock-Ansiichten) |
| `Esc` | Net méi op déi zweet Eenheet kucken, dann net méi verfollegen |

## Taktikbrett {#tactics-board}

Am Reiter Taktik ([Taktikbrett](tactics-board.md)). `F`, `C`, `G` an `T` funktionéieren wéi uewen; d'Zifferdaasten maachen näischt.

| Tast | Effekt |
|---|---|
| `Ctrl+Z` | Zrécknämmen |
| `Ctrl+Y` oder `Ctrl+Shift+Z` | Nach eng Kéier maachen |
| `Enter` | D'Pfeil, deen gezeechent gëtt, ofschléissen (en Duebelklick oder en Rietsklick mécht dat selwecht) |
| `Esc` | Zéien ofbriechen; soss de Pfeil oder d'Beweegung, déi leeft, lassen; soss d'Auswiel ophiewen |
| `Delete` oder `Backspace` | D'Auswiel läschen |
| `W` / `E` / `R` | Réckelen / Dréien / Skaléieren-Gizmo fir d'Auswiel (Tastschema **W / E / R**) |
| `G` / `R` / `S` | Réckelen / Dréien / Skaléieren-Gizmo fir d'Auswiel (Tastschema **G / R / S**) |
| `R` | Ouni Auswiel: déi nächst Figur fir d'Plazéieren ëm 15° dréinen. `Shift+R` dréit se zréck. |
| `M` | Mat enger Figur ausgewielt: se bis zum nächste Klick réckelen |
| `K` | De Plang ofspillen oder pausen |
| Shift+Klick | Derbäi maachen oder ewechhuelen aus der Auswiel |
| Shift+Zéien | E Rechteck zéien, fir ze wielen, wat ausgewielt gëtt |
| `Ctrl` beim Zéie vun engem Griff | Aschnappen op de Raster oder op de Wénkelschrëtt |

D'Gizmo-Tasten funktionéieren nëmmen, wann eppes ausgewielt ass; ouni Auswiel fléien `W A S D` d'Kamera wéi gewinnlech.

## Klick-zum-Wielen {#click-to-pick}

Mat **Klick weist, wat do ass** un an dem Moossband aus ([Klick-zum-Wielen](camera.md#click-to-pick)):

| Input | Effekt |
|---|---|
| Lénksklick (ouni méi wéi 4 px ze zéien) | Den Dateepunkt weisen, oder soss d'Plaz um Level ënner dem Zeiger |

## Miessen {#measure}

Mat **Moossband aktiv** ([Miessen](measure.md)):

| Input | Effekt |
|---|---|
| Lénksklick (ouni méi wéi 4 px ze zéien) | E Punkt setzen |
| Rietsklick | De leschte Punkt ewechhuelen |

## Soss {#elsewhere}

| Wou | Input | Effekt |
|---|---|---|
| De Griff vun all Schieber (den Handgriff nieft der Zuel) | Zéien erop / erof | D'Wäert stänneg änneren, wat méi Dir zitt, wat méi séier; `Shift` gedréckt halen fir fein ze reguléieren. Lass lass, fir ze stoppen. |
| D'Geschwindegkeetsufuerderung iwwer der Usiicht | Zéien erop / erof | D'Fluggeschwindegkeet op déiselwecht Art änneren. |
| Positiounskëschten | `Enter` | D'geschriwwen Positioun oder Ausriichtung uwenden. |
| Kurveneditor | Duebelklick / Alt-Klick / Rietsklick | En Punkt derbäisetzen / en Punkt ewechhuelen ([Sprite-Form](sprite-shape.md#the-curve-editor)). |

## Reiter Rennanalyse {#race-analysis-tab}

Am Reiter Rennanalyse spillt `K` d'Rennopnam of a pauséiert, `Home` spuert se zréck, an d'Zifferdaasten maachen näischt. Kuckt [Rennanalyse](race-analysis.md).

## Tasten, déi d'Viewer vum Browser behält {#keys-the-viewer-keeps-from-the-browser}

E puer Browser-Tastekierzelen wäerte d'Säit zoumaachen oder nei lueden an eng gelueden Sessioun verléieren; de Viewer behält se fir sech selwer. D'Lëscht gëtt aus dem Code generéiert: [Browser-Tasten](ref-browser-keys.md).

## Gamepad {#gamepad}

Kuckt [Gamepad a HOTAS](gamepad.md).
