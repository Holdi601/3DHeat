---
title: "Zeitleiste und Wiedergabe"
nav_order: 5
lang: "de"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Zeitleiste und Wiedergabe

Die Leiste unter dem Bild ist wie ein Videoplayer: Du kannst die Daten wie einen Film abspielen, anhalten, springen und das Tempo ändern.

![Die Zeitleiste: 1 Alle/Abspielen, 2 Bedienknöpfe, 3 Uhr, 4 Tempo, 5 Verlauf, mit Fenster und einem Zeitraum von 30 s](../assets/img/en/timeline-bar.webp)

Die Leiste unter der Ansicht ist die Zeitleiste ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Sie bestimmt, welche Zeilen in jedem Moment sichtbar sind. Sie braucht eine Zeitspalte; ohne sie ist die ganze Leiste deaktiviert, die Ansicht bleibt im Modus **Alle**, und die Seitenleiste sagt *Keine Zeitspalte in diesen Daten – die Zeitleiste ist deaktiviert, und jeder Datenpunkt wird sofort gezeigt.*

## Alle und Abspielen {#all-and-play}

Zwei Hauptmodi, weil sie verschiedene Fragen beantworten.

- **Alle** (die Voreinstellung bei jedem Laden) ignoriert den Abspielkopf völlig und zeigt jede Zeile, die die Filter besteht. Es ist die Ansicht „wo passiert das“ und nicht dasselbe wie das Vorspulen bis zum Ende. Der Regler ist deaktiviert, und die Uhr zeigt `alle · <span> der Daten`.
- **Abspielen** spielt die Daten als Zeitraffer ab. Der Regler, die Bedienknöpfe und die Verlaufseinstellungen erscheinen.

Die Wahl von **Alle** stoppt auch die Wiedergabe.

## Die Bedienelemente {#the-controls}

| Bedienelement | Voreinstellung | Bedeutung |
|---|---|---|
| Regler | der Anfang | Der Abspielkopf. Ziehen zum Springen; 20.000 Schritte über den Bereich. |
| **Alle** / **Abspielen** | Alle | Siehe oben. |
| ▶ / ❚❚ | angehalten | Abspielen oder anhalten; auch `K`. |
| ◀ **Rückwärts abspielen (J)** | | Spielt die Daten rückwärts. Nur im Modus **Figuren-Overlay** angezeigt; dieselbe Taste `J` funktioniert auch dort (siehe [Tastatur](#keyboard)). |
| ⏮ | | Zurück zum Anfang des Bereichs. |
| Uhr | | `verstrichen / gesamt` als `mm:ss.s` (oder `h:mm:ss`) und, wenn die Zeitspalte ein absoluter Zeitstempel ist, die Uhrzeit des Abspielkopfs als `HH:MM:SSZ` (UTC). |
| **Tempo** | 1× | Sekunden der Daten pro echte Sekunde. Das Menü hat 17 Stufen von 0,01× bis 1800× (0,01, 0,02, 0,05, 0,1, 0,25, 0,5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), dazu **Eigene…**: Gib ein beliebiges Tempo von 0,001× bis 3600× ein (zum Beispiel 0,3 oder 12) und drücke Enter; Esc behält das aktuelle Tempo. Das zuletzt gewählte Tempo wird beim nächsten Besuch gemerkt (siehe [Gespeicherte Einstellungen](ref-settings-storage.md)). |
| **Verlauf** | Kumulativ | Was am Abspielkopf als sichtbar zählt: *Kumulativ*, *Fenster* oder *Lebensdauer* (unten). |
| **Zeitraum** (Fenster; im Modus Linien auch Lebensdauer) | 30 s | Länge des Fensters, das am Abspielkopf endet; mindestens 0,01 s. In [Linien-Intensität](line-heat.md#playback) ist es die Länge des Schweifs. |
| **Ersatz-Lebensdauer** (nur Lebensdauer, nicht im Modus Linien) | 10 s | Wie lange ein Datenpunkt ohne nächste Probe seiner Person sichtbar bleibt. |
| **Ausblenden** (nur Lebensdauer, nicht im Modus Linien) | 0,4 | Anteil der Lebensdauer jedes Datenpunkts, in dem er ausblendet, 0-1. |
| **Schleife** | ein | Am Ende wieder von vorn; aus hält am Ende an. |
| Rechte Seite | | Der Name des Datensatzes. |

Der **Bereich** ist die Zeitspanne des Datensatzes – oder im [Figuren-Overlay](box-replay.md), wenn eine Sitzung gewählt ist, die Spanne dieser Sitzung.

## Verlauf {#history}

Im Modus Abspielen:

- **Kumulativ** – alles vom Anfang des Bereichs bis zum Abspielkopf. Die Intensität baut sich beim Abspielen auf.
- **Fenster** – eine feste Spanne Verlauf, die am Abspielkopf endet (*Zeitraum*).
- **Lebensdauer** – jeder Datenpunkt lebt, bis die **nächste Probe derselben Person** (in derselben Sitzung) kommt, sodass zu jedem Zeitpunkt genau eine Position pro Person aktuell ist. Ein Datenpunkt, dessen Person nie wieder erscheint – ein Tod, eine Verbindungstrennung, das Ende des Protokolls –, hat keine nächste Probe und lebt für die *Ersatz-Lebensdauer*, statt sofort zu verschwinden oder ewig zu bleiben. Datenpunkte **blenden aus** über den letzten Anteil *Ausblenden* ihrer Lebensdauer, statt abrupt zu verschwinden: Mit einer lebenden Probe pro Person würde ein Datenpunkt, der zwischen zwei Frames verschwindet, das ganze Feld im Takt der Proben flackern lassen. *Ausblenden* 0 stellt den harten Schnitt wieder her.

Die Lebensdauer braucht eine Personenspalte zusätzlich zur Zeitspalte; ohne sie fällt der Verlauf beim Laden auf Kumulativ zurück. In der [Linien-Intensität](line-heat.md#playback) bestimmt der Verlauf, wie lange der Schweif eines Weges sichtbar bleibt; im [Figuren-Overlay](box-replay.md) ist die *Ersatz-Lebensdauer* die Zeit, die eine Person ohne weitere Proben festgehalten wird.

## Verhalten der Wiedergabe {#playback-behaviour}

Aus der Bildschleife ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- Der Abspielkopf läuft um *Frame-Zeit × Tempo* weiter. Die Frame-Zeit ist auf 0,1 s begrenzt, damit ein Tabwechsel den Abspielkopf nicht springen lässt.
- Drückst du Abspielen ganz am Ende des Bereichs, startet es vom Anfang, wie ein Medienplayer. Bei jedem Laden wird der Abspielkopf auf den Anfang gesetzt, sodass der erste Druck auf Abspielen abspielt.
- Am Ende des Bereichs springt der Abspielkopf zurück zum Anfang (Schleife ein) oder bleibt dort stehen, und die Wiedergabe endet (Schleife aus).
- Der Regler liest den Abspielkopf der Engine bei jedem Frame direkt; der Anwendungszustand wird bei Sprüngen, Starts, Stopps und Schleifen aktualisiert.
- Die Wahl einer Sitzung im Sitzungsauswahl springt zum Start dieser Sitzung.

## Warum die Wiedergabe flüssig und günstig ist {#why-playback-is-smooth-and-cheap}

Zeilen sind nach Zeit sortiert gespeichert, daher ist ein Zeitfenster zwei binäre Suchen über die Zeitspalte: Das Weiterschalten des Abspielkopfs bewegt zwei Ganzzahlen und berührt keine Zeile, und der Aufwand der Wiedergabe richtet sich nach der Zahl der Zeilen im Fenster, nicht nach der Größe des Datensatzes.

Wie die Intensität stabil bleibt, während sich das Fenster bewegt, hängt vom Verlauf ab ([Akkumulation](accumulation.md)):

- **Kumulativ** wächst nur, daher fügt jeder Frame nur die Zeilen hinzu, die seit dem letzten sichtbar wurden, mit vollem Gewicht. Das Feld baut sich monoton auf, und Anhalten ändert nichts, weil nichts mehr ankommt. (Neu zu schätzen würde bei jedem Frame eine andere zufällige Teilmenge leuchten lassen und sie dann ausblenden, was wie aufflammende und verschwindende Ausbrüche wirkt.)
- **Fenster** und **Lebensdauer** ändern sich wirklich in jedem Frame und werden neu geschätzt, als gleitender Mittelwert mit exponentieller Gewichtung (Gewicht 0,34 für den neuen Frame), der im eingeschwungenen Zustand unverzerrt und deutlich ruhiger ist als ein Neubeginn.
- Im Modus Lebensdauer sind die Kandidatenzeilen jene von *Abspielkopf − max(längste Lücke in den Daten, Ersatz-Lebensdauer)* bis zum Abspielkopf; der Shader verwirft dann jede Zeile, deren eigene Lebensdauer abgelaufen ist, und wendet das Ausblenden an.

Der Wechsel zwischen Alle und Abspielen oder das Ändern des Verlaufs startet die Akkumulation neu.

## Tastatur {#keyboard}

| Taste | Wirkung |
|---|---|
| `K` | Abspielen / Anhalten |
| `J` | Rückwärts abspielen; erneutes Drücken hält an (nur Figuren-Overlay) |
| `L` | Vorwärts abspielen; erneutes Drücken hält an (nur Figuren-Overlay) |

`J` und `L` schalten die Zeitleiste außerdem auf **Abspielen**. Die Tasten werden ignoriert, solange ein Textfeld oder Menü den Fokus hat. Im Tab Rennanalyse steuert `K` stattdessen das eigene Replay dieses Tabs.
