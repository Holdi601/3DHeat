---
title: "Interna des Renderings"
nav_order: 22
has_children: true
lang: "de"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Interna des Renderings

Der Viewer zeichnet Millionen Punkte als leuchtende Flecken und addiert sie. Dieser Abschnitt erklärt die Tricks, die das schnell halten, und was die Zahlen im Statistik-Overlay bedeuten. Lies ihn, wenn der Viewer sich langsam anfühlt oder du am Renderer arbeiten willst.

```
Daten -> Zeitfenster -> GPU-Filter -> Abtastplan -> Splat -> Akkumulation -> Farbe -> Bildschirm
```

Wie dein eigener Computer arbeitet, siehst du im Statistikkasten oben rechts in der Ansicht: [Leistungsfenster und Statistik-Overlay](performance-and-stats.md). Neue Begriffe (GPU, Zeile, Sprite, Heatmap) stehen im [Glossar](glossary.md).

## Das Kernproblem {#the-core-problem}

Eine Summe überlappender radialer Verläufe kostet *N* × π*r*² verschmolzene Fragmente pro Bild. Bei 100 Millionen Sprites mit 8 px Radius sind das 2 × 10¹⁰ Fragmente, also etwa eine Sekunde Arbeit auf einer High-End-GPU. Das kann man nicht jedes Bild mit Gewalt rechnen. Deshalb kombiniert der Viewer:

- **nach Zeit sortierte Zeilen**: ein Zeitfenster sind zwei binäre Suchen, und die Kosten der Wiedergabe folgen den Zeilen im Fenster, nicht dem ganzen Datensatz;
- **keine Arbeit pro Zeile auf der CPU je Bild**: Zeilen liegen quantisiert im GPU-Speicher. Filter, Gruppenvorzeichen, der Lebensdauertest, das Fenster, das Culling und der Schnitt werden im Vertex-Shader ausgewertet;
- **geschichtete Stichproben** mit ausgleichenden Gewichten, wenn ein Bild nicht jede Zeile zeichnen kann, und **progressive Akkumulation**, die zum exakten Ergebnis aller Zeilen konvergiert, solange die Ansicht ruhig bleibt ([Abtastung und Budgets](sampling-and-budgets.md), [Akkumulation](accumulation.md));
- **eine zweistufige Drossel**, die Sprites pro Bild und dann die Heatmap-Auflösung gegen Bildrate tauscht ([Abtastung und Budgets](sampling-and-budgets.md#the-adaptive-budget));
- **erzwungene Speicherbudgets**, sodass ein Datensatz, der nicht passt, sichtbar gekürzt wird statt abzustürzen ([GPU-Speicherbelegung](gpu-memory.md)).

## Ein Bild {#one-frame}

Die Bildschleife ist [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Alles, was sich mit der Bildrate ändert, also Kamera, Abspielkopf und Budget, lebt in der Engine und nicht im Anwendungszustand. Ein Bild kostet deshalb keine React-Arbeit. Der Zustand wird einmal pro Bild gelesen und nur für selten aktualisierte Anzeigen zurückgeschrieben.

1. **Neue Daten?** Ein neuer Datensatz wird in einem Bild angekündigt (*Lade N Zeilen auf die GPU*) und im nächsten hochgeladen. So wird die Meldung gemalt, bevor die Arbeit den Thread blockiert. Ein neuer Level wird an den Renderer übergeben. Linien-Heatmap-Routen werden erzeugt oder freigegeben.
2. **Abspielkopf** läuft weiter (höchstens 0,1 s Wandzeit pro Bild), springt zurück oder hält an.
3. **Kamera** liest Tasten, Maus und Gamepad. Die Achsenspiegelung wird in die Ansichtsmatrix eingerechnet. Unter WebGPU wandelt eine Tiefen-Umrechnungsmatrix den OpenGL-artigen Tiefenbereich von three.js in den von WebGPU um.
4. **Was sichtbar ist**: der Zeitbereich aus Zeitleiste und Verlauf, die Gruppenvorzeichen-Tabelle (Sichtbarkeit nur bei einem Schnitt nach einer Spalte), bis zu vier Filter (Spaltenfilter und die Auswahl der Entitäten) und der Differenzschnitt.
5. **Farb- und Kurventabellen** werden neu gebaut, wenn sich ihre Einstellungen geändert haben.
6. **Budget**: der adaptive Regler setzt das Sprite-Budget und die Heatmap-Auflösung für dieses Bild. Bei *Jede Zeile in jedem Frame zeichnen* wird das Budget so hoch gesetzt, dass alle Kandidatenzeilen gedeckt sind.
7. **Signaturen** entscheiden, was die Akkumulation noch bedeutet. Eine Änderung an allem, was Zeilen beiträgt oder wie sie beitragen (*Geometrie*), am Zeitfenster oder nur an der Einfärbung des Ergebnisses (*Komposit*). Siehe [Akkumulation](accumulation.md#what-restarts-it).
8. **Abtastplan**: welche Blöcke von Zeilen gezeichnet werden ([Abtastung und Budgets](sampling-and-budgets.md)).
9. **Akkumulationsmodus**: zurücksetzen, erweitern, gleitender Mittelwert, laufender Mittelwert oder Leerlauf.
10. **Geometrie der Box-Wiedergabe** (Würfel, Spuren) auf der CPU, nur in diesem Modus und nur wenn nicht im Leerlauf.
11. **Rendern**: das Backend zeichnet die Szene (Level, Raster, Achsen, Boxen, Spuren, Lineal), trägt die Heatmap in ihr Ziel ein, verschmilzt sie mit dem Akkumulator und setzt die Heatmap über die Szene in das Canvas.
12. **Auto-Belichtung** läuft, wenn ihr Countdown null erreicht. Die Heat-Sonde des Lineals liest höchstens alle 120 ms einen Pixel. Anzeigen werden veröffentlicht.

Ein Leerlaufbild, also konvergiert und unverändert, überspringt die Szene und das Eintragen der Heatmap, komponiert aber trotzdem **neu**. Ein WebGL-Canvas, das ohne `preserveDrawingBuffer` erzeugt wurde, hat nach dem Komponieren undefinierte Inhalte. Darauf zu vertrauen, dass es das letzte Bild weiter zeigt, ist nicht sicher. Die Szene und die Heatmap-Ziele sind eigene Framebuffer des Viewers und behalten ihren Inhalt. Ein Leerlaufbild kostet deshalb nur einen Durchgang über den ganzen Bildschirm.

## Seiten in diesem Abschnitt {#pages-in-this-section}

- [Die zwei Backends](backends.md): WebGPU und WebGL2, wie eines gewählt wird, URL-Schalter
- [Akkumulation](accumulation.md): zurücksetzen, erweitern, gleitender Mittelwert, laufender Mittelwert
- [Abtastung und Budgets](sampling-and-budgets.md): der geschichtete Sampler, der exakte Modus, das adaptive Budget
- [Halbfloat-Akkumulation](half-float-accumulation.md): Bereich und Genauigkeit auf 16-Bit-Zielen
- [GPU-Speicherbelegung](gpu-memory.md): quantisierte Zeilenspeicherung und das erzwungene GPU-Budget
- [Erkennung von Software-Rendering](software-rendering.md)
- [Leistungsfenster und Statistik-Overlay](performance-and-stats.md)
