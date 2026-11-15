---
title: "Trefferanalyse (Tab Fahrzeuge)"
parent: "Replay"
nav_order: 4
lang: "de"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Trefferanalyse

Der Tab **Fahrzeuge** zeigt, wo ein Panzer, ein Schiff oder ein Soldat getroffen wurde und von wem. Benutze ihn, um zu sehen, welche Seite eines Panzers beschossen wird oder welcher Gegner den Schaden macht.

## Ausprobieren {#try-it}

1. Lade ein Match mit Treffern (die Tabelle unten zeigt, welche Spiele Treffer liefern).
2. Öffne oben den Tab **Fahrzeuge**.
3. Wähle unter **Fahrzeug** eine Einheit, zum Beispiel einen Panzertyp. Die Zahl in Klammern ist, wie viele Treffer sie bekommen hat.
4. Lies die Figur: Jede Markierung ist ein Treffer, dort platziert, wo er einschlug.
5. Öffne **Wer traf** und sieh die Schützen, Waffen oder Schützen-Fahrzeuge mit Treffern, Schaden, Abschüssen und Entfernung.

![Der Tab Fahrzeuge: ein Demo-Panzer mit Trefferzeichen, und Wer traf geöffnet](../assets/img/en/hit-analysis-tank.webp)

Ist nichts geladen oder hat der Datensatz keine Treffer auf Fahrzeugen, sagt der Tab, was fehlt und welcher Konverter zu nehmen ist.

```
        Schütze ----> o  Trefferzeichen auf der Figur
        Schütze ----> o
  [ Panzerfigur ]
```

Die Figur zeigt die Treffer dort, wo die Daten einen Punkt oder ein Körperteil angeben. Die Aufschlüsselung (wer traf, womit, wie stark, aus welcher Entfernung) funktioniert für jede Quelle.

## Was jede Quelle liefert {#what-each-source-gives}

| Quelle | Punkt an der Einheit | Schütze | Waffe | Schaden / Ergebnis |
|---|---|---|---|---|
| War Thunder | ja, im Bezugssystem der Einheit, mit der Flugrichtung des Schusses | ja | das Fahrzeug des Schützen | kritisch, schwer, Module zerstört, tödlicher Treffer |
| CS2 | Körperteil (Trefferzone) | ja | ja | Schaden, Panzerung, übrige Gesundheit |
| World of Tanks | ja (Komponenten-Box, Eintritt und Austritt) | ja | - | Schaden oder keiner (Abprall, kein Durchschlag) |
| World of Warships | ja, im Bezugssystem des Schiffs | ja | Trefferart | - |
| Squad | Fahrzeuge: ja - der Einschlag, im Bezugssystem des Fahrzeugs aus seiner eigenen Position und Richtung platziert | nein (die Daten nennen keinen) | die Schadensart | der Abfall der Gesundheit des Fahrzeugs in diesem Moment, zerstört |
| Squad-Soldaten | nein: Die Trefferergebnisse (Knochen und Einschlagpunkt) bleiben im Konverter roh; Zeilen `impact` mit `hitBone` werden gelesen, sobald er sie schreibt | | | nur Verwundungen und Tode |
| Arma (OCAP, der Aufzeichner von Arma 3) | nein: OCAP erfasst, wer wen getroffen oder getötet hat, womit und aus welcher Entfernung, nicht wo | ja | ja | Treffer oder Abschuss, Entfernung |
| Tacview ACMI | ja, wo ein Waffenobjekt innerhalb von 30 m einer Einheit endet (nicht ihr Werfer): sein letzter Ort im Bezugssystem der Einheit (Richtung, Nick, Rollen), aus der Richtung, aus der es flog | das `Parent` der Waffe | der Name der Waffe, oder der AmmoType eines Timeouts | Outcome eines Timeouts, Abfälle von `Health`, `Destroyed`; ohne Waffe ein Abschuss oder Schaden ohne Punkt |
| IL-2-Telemetrie (Watcher) | ja: die Ereignisse `hit` / `damage` tragen den Punkt im Bezugssystem des eigenen Flugzeugs des Spielers (als x vorwärts, y oben, z rechts genommen) | nein | nein | die Kraft |
| Dota 2 | nein: das Kampfprotokoll hat keinen Ort auf einem Helden | die angreifende Einheit | die Fähigkeit oder der Gegenstand (keiner: ein Angriff) | Schaden, der Tod des Helden |
| Battlefield 6 (GameCapture) | nein: Die Aufnahme liest den Kill-Feed (Abschüsse, Tode, Kopftreffer-Markierung), nicht die Treffer | | | |
| DCS / andere Live-Quellen des Watchers | keine Trefferereignisse über das hinaus, was ihre Tacview-Aufzeichnungen enthalten | | | |

Hat kein Treffer der Einheit einen Punkt, zeigt die Figur keine Markierungen, und die Aufschlüsselung **Wer traf** öffnet sich von selbst: nach Schütze, Waffe oder Fahrzeug des Schützen, jeweils mit seinen Treffern, seinem Schaden und seinen Abschüssen, sowie dem Median und der weitesten Entfernung.

## Auf einen Bereich begrenzen {#restrict-to-an-area}

Der Abschnitt **Fläche** begrenzt die Analyse auf Treffer, die an einer Stelle der Karte passierten.

1. Drücke **Rechteck zeichnen** oder **Polygon zeichnen** und zeichne auf dem 3D-Boden oder der taktischen Karte.
2. Wähle **Opfer darin** (ein Treffer zählt, wenn die getroffene Einheit im Bereich war) oder **Schütze darin** (wenn der Schütze darin war).
3. Drücke **Als Filter verwenden**. Die Marken zeigen „{n} von {total} Treffern im Bereich“.
4. **Bereich zurücksetzen** entfernt alle Bereiche.

Jeder Bereich ist ein [Volumen](volumes.md), also filtern dieselben Formen auch die Heatmap und das Replay. Ein Bereich kann einschließen oder ausschließen (ein ausschließender Bereich lässt seine Treffer weg, angezeigt als „{n} von {total} Treffern außerhalb des Bereichs“). Jeder Bereich erscheint als Marke mit der Anzahl der Treffer der Einheit darin; das × auf einer Marke entfernt sie. Die Zählungen, die Figur, die Aufschlüsselung und die Filterlisten folgen alle.

Die Orte eines Treffers: Die Zeile, aus der er stammt, hält den Ort einer Partei (des Opfers bei einem Schaden oder Treffer, des Schützen bei einem Schuss); der der anderen ist der eigene Messwert dieser Einheit, der der Zeit am nächsten liegt (innerhalb von 5 s). Ein Treffer, dessen Ort der Partei nicht bekannt ist, wird ausgelassen, während ein Bereich filtert, und das Feld sagt, wie viele („Ausgelassen, kein bekannter Ort“).

## Für Entwickler {#for-developers}

Jeder Konverter kann Treffer hinzufügen: eine Zeile des Opfers (`hit`, `impact`, `hurt`, `wounded`) mit `hitBone` (ein Skelettknochen, eine Arma-Auswahl, eine Reforger-Trefferzone - zugeordnet zu Kopf, Brust, Bauch, Armen und Beinen) oder `hitLocalX/Y/Z` (Meter, x vorwärts, y oben, z rechts), mit `other` als Schütze und `damage`.
