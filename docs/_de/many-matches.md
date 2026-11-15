---
title: "Viele Matches auf einmal"
parent: "Replay"
nav_order: 2
lang: "de"
source: "many-matches.md"
source_hash: "a37a7b4cf8c2"
translated: true
outdated: false
---

# Viele Matches auf einmal

**Viele Matches auf einmal** spielt viele Matches übereinander, sodass du siehst, wohin jeder Spieler jedes Matches gewöhnlich geht. Nutze es, um Hunderte oder Tausende Matches in einem Bild zu vergleichen.

Jedes Match beginnt bei seinem eigenen Anfang, und seine Einheiten bewegen sich als Figuren. Die Dateien gehen direkt in die Grafikkarte, und es wird keine vollständige Tabelle aufgebaut. So läuft es flüssig, wo ein normales Laden den Speicher ausgehen ließe.

![Zehn Panzer-Matches übereinandergelegt, eine Farbe je Match](../assets/img/de/many-matches.webp)

## So benutzt du es {#how-to-use-it}

1. Öffne **Viele Matches auf einmal** in der Heatmap-Seitenleiste.
2. Drück **Dateien…** (wähle viele Dateien), **Ordner…** (ein Ordner und seine Unterordner) oder **Ordner hinzufügen…** (zu dem hinzufügen, was geladen ist).
3. Der Viewer wechselt zum Figuren-Overlay und beginnt am Anfang. Drück **Abspielen**.

Jede Datei ist ein Match (oder enthält mehrere). Parquet-Dateien und [`.3dheat`](container.md)-Container funktionieren. Eine Datei braucht eine Spalte für Position, Zeit und Einheit. Spalten für Name, Typ und Seite bleiben erhalten. Andere Dateien und die Begleitdateien der Konverter (Flug, Nachrichten, Ereignisse, Chat, Ziele) werden übersprungen. Für eine normale Tabelle siehe [Daten einlesen](getting-data-in.md).

## Einstellungen {#settings}

| Einstellung | Was sie tut |
|---|---|
| **Nach Team** / **Nach Match** | Färbt nach Seite oder eine Farbe je Match. |
| **Markieren, wo Einheiten starben** | Eine Markierung dort, wo jede Einheit starb, für 10 s, 30 s, 120 s oder alle bisherigen. |

Das Fenster zeigt, wie viele Matches, Einheiten, Zeilen und Positionen gelesen wurden, den genutzten Speicher und die Ladezeit. *Platz für* ist, wie viele weitere Positionen die Grafikkarte noch aufnehmen könnte. *Figuren ab* ist die Größe am Bildschirm, unter der eine Einheit als kleiner Pfeil statt als ihre Figur gezeichnet wird.

Das Aussehen der Figuren nutzt dieselben Steuerungen wie die [Match-Wiedergabe](match-replay.md#figures): **Figurengröße**, **Kleinste Figur am Bildschirm** und **In der Ferne**.

## Tipps {#tips}

- Passt alles nicht in den Speicher, werden die Positionen ausgedünnt (es bleibt nur eine Position alle paar Meter), und das Fenster sagt es.
- Die Heatmap-Modi funktionieren auch mit den Daten des Overlays.
- Für Statistiken über Tausende Matches, ohne sie zu zeichnen, siehe [Massenanalyse](mass-analysis.md).
