---
title: "Tastatur- und Mausreferenz"
parent: "Kamera und Steuerung"
nav_order: 2
lang: "de"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Tastatur- und Mausreferenz

Jede Taste und jede Mausaktion an einer Stelle, damit du die findest, die du brauchst. Klicke zuerst auf die Ansicht, damit sie die Tastatur bekommt. Tasten werden ignoriert, solange ein Textfeld oder ein Auswahlmenü den Fokus hat. Die Kurzfassung steht auch unten links in der Ansicht.

Schnellsuche:

| Ich möchte ... | Drücke |
|---|---|
| fliegen | `W A S D`, ziehen zum Umschauen |
| alles sehen | `F` |
| abspielen oder pausieren | `K` |
| rückwärts abspielen | `J` (noch einmal drücken zum Pausieren), vorwärts `L` |
| wissen, was die Farben bedeuten | `?` oder `F1` |
| im Tab Taktik rückgängig machen | `Strg+Z` |

## Kamera {#camera}

Aus [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Eingabe | Wirkung |
|---|---|
| `W` / `↑` | Vorwärts entlang der Blickrichtung |
| `S` / `↓` | Zurück |
| `A` / `←` | Nach links seitlich gleiten |
| `D` / `→` | Nach rechts seitlich gleiten |
| `Leertaste` / `E` | Nach oben |
| `Q` / linke `Strg` | Nach unten |
| `Umschalt` (eine beliebige) | Halten: 6× Geschwindigkeit |
| linke `Alt` | Halten: 15 % Geschwindigkeit |
| Ziehen mit links oder rechts auf der Ansicht | Umschauen (Zeiger ist festgesetzt, solange die Taste gedrückt ist) |
| Rad (perspektivisch) | Fluggeschwindigkeit ×1,5 pro Raste (höchstens 4 Rasten pro Radereignis) |
| Rad (parallel) | Zoomen |
| Rechtsklick | Öffnet über der Ansicht kein Kontextmenü |

## Global {#global}

Aus [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Taste | Wirkung |
|---|---|
| `K` | [Zeitleiste](timeline.md) abspielen / pausieren |
| `F` | Die Daten einrahmen |
| `C` | Position, Gier- und Nickwinkel der Kamera kopieren ([Kamera-Anzeige](camera.md#camera-readout)) |
| `G` | Zu einem eingetippten Punkt gehen: öffnet das Feld unter der Kamera-Anzeige |
| `Esc` | Die Auswahlkarte schließen; dann aufhören, auf die zweite Einheit zu schauen; dann aufhören, einer Einheit zu folgen |
| `T` | Taktische Darstellung ein- oder ausschalten ([Match-Replay](match-replay.md#display-style)) |
| `?` / `F1` | Hilfemodus: was die Farben bedeuten ([Einstellungen, Einheiten und Tasten](settings.md#help-mode)) |
| `1` | [Intensität](heat.md) |
| `2` | [Differenz](difference.md) |
| `3` | [Team-Intensität](team-heat.md) |
| `4` | [Linien](line-heat.md) |
| `]` | Ferne Culling-Grenze nach außen ×1,12 (`Umschalt`: ×1,35) |
| `[` | Ferne Culling-Grenze nach innen ÷1,12 (`Umschalt`: ÷1,35) |
| `\` | Ferne Culling-Grenze aus / wieder an, dort, wo sie war ([Tiefe und Culling](depth-and-culling.md#keyboard)) |

Der Modus **Figuren-Overlay** hat keine Zifferntaste; wähle ihn in der Modusleiste oder öffne den Tab Match. Die Zifferntasten gehen durch dieselbe Prüfung wie die Modusleiste: Eine Taste für einen Modus, den die Leiste für die geladenen Daten als nicht verfügbar zeigt, tut nichts.

## Match-Replay {#match-replay}

Im Modus Figuren-Overlay, den der Tab Match benutzt ([Match-Replay](match-replay.md)). Sie funktionieren, ob einer Einheit gefolgt wird oder nicht, außer wo es anders vermerkt ist:

| Taste | Wirkung |
|---|---|
| `B` | Ein Lesezeichen setzen: der Zeitpunkt und die Kamera |
| `M` | 2D-Karte: Ecke, ganze Ansicht, aus |
| `V` / `Umschalt+V` | Nächste / vorherige Kameraansicht der verfolgten Einheit |
| `H` | Head-up-Anzeige in der Cockpit- und Padlock-Ansicht |
| `Bild ab` / `Bild auf` | Nächstes / vorheriges Ereignis der Arten, die die Ereignisliste zeigt |
| `J` | Rückwärts abspielen; noch einmal, um zu pausieren |
| `L` | Vorwärts abspielen; noch einmal, um zu pausieren |
| `.` / `,` | Eine Sekunde vor / zurück, pausiert (`Umschalt`: zehn Sekunden) |
| `Esc` | Zuerst aufhören, auf das Ziel zu schauen, dann aufhören zu folgen |
| `Strg`+Klick oder `Alt`+Klick auf eine Einheit (in der Ansicht oder in der Einheitenliste) | Von der verfolgten Einheit aus auf sie schauen (die Zwei-Einheiten-Ansicht); noch einmal klicken, um sie loszulassen |
| `Umschalt`+Klick auf zwei Einheiten | Zwischen ihnen messen: Peilung, Entfernung, Höhenunterschied |

`V` braucht eine verfolgte Einheit. `M` ist hier die 2D-Karte, und im Tab Taktik ist es „verschieben“.

## Einer Einheit folgen {#following-a-unit}

Während die Kamera einer Einheit folgt, lenken das Rad und die Flugtasten um die Einheit herum, statt frei zu fliegen ([Kamera](camera.md#while-following-a-unit)):

| Eingabe | Wirkung |
|---|---|
| Rad, `W` / `S` | Näher / weiter weg (höher / tiefer in der Satellitenansicht). Nicht in der Cockpit- und Padlock-Ansicht. |
| `A` / `D`, `Q` / `E` | Um die Einheit kreisen (Verfolgungs- und Umlaufansicht) |
| Ziehen | Um die Einheit herum umschauen; im Cockpit im Innern umschauen |
| `V` / `Umschalt+V` | Nächste / vorherige Kameraansicht |
| `H` | Head-up-Anzeige (Cockpit- und Padlock-Ansicht) |
| `Esc` | Aufhören, auf die zweite Einheit zu schauen, dann aufhören zu folgen |

## Taktik-Board {#tactics-board}

Im Tab Taktik ([Taktik-Board](tactics-board.md)). `F`, `C`, `G` und `T` funktionieren wie oben; die Zifferntasten tun nichts.

| Taste | Wirkung |
|---|---|
| `Strg+Z` | Rückgängig |
| `Strg+Y` oder `Strg+Umschalt+Z` | Wiederholen |
| `Enter` | Den gerade gezeichneten Pfeil beenden (ein Doppelklick oder ein Rechtsklick tut dasselbe) |
| `Esc` | Ein Ziehen abbrechen; sonst den Pfeil oder die laufende Verschiebung loslassen; sonst die Auswahl aufheben |
| `Entf` oder `Rücktaste` | Die Auswahl löschen |
| `W` / `E` / `R` | Verschieben / Drehen / Skalieren-Griff für die Auswahl (Tastenschema **W / E / R**) |
| `G` / `R` / `S` | Verschieben / Drehen / Skalieren-Griff für die Auswahl (Tastenschema **G / R / S**) |
| `R` | Ohne Auswahl: die nächste zu setzende Figur um 15° drehen. `Umschalt+R` dreht sie zurück. |
| `M` | Bei ausgewählter Figur: sie zum nächsten Klick verschieben |
| `K` | Den Plan abspielen oder pausieren |
| Umschalt+Klick | Zur Auswahl hinzufügen oder daraus entfernen |
| Umschalt+Ziehen | Einen Rahmen um das ziehen, was ausgewählt werden soll |
| `Strg` beim Ziehen eines Griffs | Am Raster oder am Winkelschritt einrasten |

Die Griff-Tasten wirken nur, wenn etwas ausgewählt ist; ohne Auswahl fliegt `W A S D` die Kamera wie gewohnt.

## Klick-zum-Auswählen {#click-to-pick}

Mit eingeschaltetem **Klick zeigt, was dort ist** und ausgeschaltetem Lineal ([Klick-zum-Auswählen](camera.md#click-to-pick)):

| Eingabe | Wirkung |
|---|---|
| Linksklick (ohne mehr als 4 px zu ziehen) | Zeigt den Datenpunkt oder sonst die Stelle im Level unter dem Zeiger |

## Messen {#measure}

Mit **Lineal aktiv** ([Messen](measure.md)):

| Eingabe | Wirkung |
|---|---|
| Linksklick (ohne mehr als 4 px zu ziehen) | Einen Punkt setzen |
| Rechtsklick | Den letzten Punkt entfernen |

## Anderswo {#elsewhere}

| Wo | Eingabe | Wirkung |
|---|---|---|
| Der Griff jedes Reglers (der Anfasser neben der Zahl) | Nach oben / unten ziehen | Den Wert stufenlos ändern, je weiter du ziehst, desto schneller; halte `Umschalt` für die Feineinstellung. Loslassen, um aufzuhören. |
| Die Geschwindigkeitsanzeige über der Ansicht | Nach oben / unten ziehen | Die Fluggeschwindigkeit auf dieselbe Weise ändern. |
| Positionsfelder | `Enter` | Die eingetippte Position oder Ausrichtung übernehmen. |
| Kurven-Editor | Doppelklick / Alt-Klick / Rechtsklick | Einen Punkt hinzufügen / einen Punkt entfernen ([Sprite-Form](sprite-shape.md#the-curve-editor)). |

## Tab Rennanalyse {#race-analysis-tab}

Im Tab Rennanalyse spielt `K` die Rennwiedergabe ab und pausiert sie, `Pos1` spult sie zurück, und die Zifferntasten tun nichts. Siehe [Rennanalyse](race-analysis.md).

## Tasten, die der Viewer aus dem Browser behält {#keys-the-viewer-keeps-from-the-browser}

Einige Browser-Tastenkürzel würden die Seite schließen oder neu laden und eine geladene Sitzung verlieren; der Viewer behält sie für sich. Die Liste wird aus dem Code erzeugt: [Browser-Tasten](ref-browser-keys.md).

## Gamepad {#gamepad}

Siehe [Gamepad und HOTAS](gamepad.md).
