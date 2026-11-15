---
title: "Kamerapfad und Video"
nav_order: 15
lang: "de"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Kamerapfad und Video

Mach einen Film aus deinen Daten: Du setzt die Kamera an ein paar Stellen, und der Viewer fliegt zwischen ihnen und speichert ein Video. Jedes Bild ist sehr sauber, ohne Körnung. Kamera und Abspielkopf bewegen sich zusammen, deshalb macht dasselbe Feld auch einen Zeitraffer ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Einen Überflug machen {#make-a-flythrough}

1. Fliege dorthin, wo der Film beginnt, und drücke **Keyframe hier hinzufügen** in **Kamerapfad & Rendern**.
2. Fliege zur nächsten Stelle und drücke den Knopf erneut. Wiederhole das für jeden Halt.
3. Setze das Häkchen bei **Vorschau entlang des Pfads** und ziehe **Position auf dem Pfad**, um die Bewegung zu prüfen.
4. Stelle die **Dauer** ein (wie lang das Video ist). Eine Bewegung, die richtig, aber zu schnell ist, braucht nur eine längere Dauer.
5. Drücke **Video rendern**. Warte auf die Fortschrittszeile; die Datei wird heruntergeladen, wenn sie fertig ist.

![Das Feld Kamerapfad & Rendern mit drei Keyframes, weicher Interpolation, 12 s, 30 fps und 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Keyframes {#keyframes}

| Regler | Wirkung |
|---|---|
| **Keyframe hier hinzufügen** | Hängt die aktuelle Kameraposition, Gier, Nick und das Sichtfeld als Keyframe an. |
| **Leeren** | Entfernt alle Keyframes. |
| Keyframe-Liste | Eine Zeile pro Keyframe: seine Nummer (anklicken, um die Kamera dorthin zu fliegen, auch mit dem Sichtfeld), Position, `Gier° / Nick°`, und **×** zum Entfernen. |

Die Keys werden **gleichmäßig** entlang einer normierten Pfadachse von 0 bis 1 verteilt, sobald einer hinzugefügt oder entfernt wird; die Ausgabedauer dehnt dann die ganze Bewegung, so dass eine Einstellung, die richtig, aber zu schnell ist, nur eine längere Dauer braucht. Der Gierwinkel wird zwischen den Keys entrollt, damit sich die Kamera den kurzen Weg dreht.

Ohne Keyframes hält ein Rendern die aktuelle Kamera für den ganzen Clip still - ein durchaus brauchbarer Zeitraffer.

## Pfad-Einstellungen {#path-settings}

| Regler | Standard | Bereich (Schrittweite) | Bedeutung |
|---|---|---|---|
| **Interpolation** (2+ Keys) | *Weich* | *Weich* / *Gerade* | *Weich*: eine kubische Hermite-Kurve durch die Keys, mit Tangenten aus den Nachbar-Keys, so dass die Geschwindigkeit an jedem Key übereinstimmt und es an den Übergängen kein Ruckeln gibt. *Gerade*: gerade Linien zwischen den Keys, vorhersehbar, mit einer sichtbaren Ecke an jedem Key. Das Sichtfeld wird immer linear interpoliert. |
| Reiseweg (2+ Keys) | | | `N Einheiten Weg - M pro Sekunde bei dieser Dauer`, oder ein Hinweis, dass alle Keys an einem Ort liegen. |
| **Vorschau entlang des Pfads** (1+ Keys) | aus | | Steuert die Kamera des Ausschnitts entlang des Pfads und bewegt den Abspielkopf mit, wie es das Rendern tut, so dass die Bewegung vor dem Rendern beurteilt werden kann. |
| **Position auf dem Pfad** (während der Vorschau) | 0 % | 0-100 % | Wo auf dem Pfad die Vorschau ist. |
| **Dauer** | 12 s | 1-120 s (3600) | Länge des Videos. |
| **Bildrate** | 30 fps | 6-60 (240) | |
| **Bitrate** | 16 Mbps | 1-60 Mbps, logarithmisch (400) | Heatmap-Verläufe bekommen bei niedrigen Bitraten Streifen: Es gibt zu wenig Details, hinter denen ein Codec Fehler verstecken könnte. |
| **Wartegrenze für Konvergenz** | 240 Bilder | 2-600 (10.000) | Die längste Zeit, die ein Ausgabebild auf Genauigkeit warten darf. Bilder, die die Grenze erreichen, werden trotzdem geschrieben und gezählt. |
| Zusammenfassung | | | `N Bilder · Fenster: kumulativ/fest/Lebensdauer`, und wenn die Zeitleiste im Modus Alle ist: *(das Rendern schaltet Alle auf Abspielen, damit der Abspielkopf etwas bedeutet)*. |
| **Video rendern** / **Abbrechen** | | | Startet das Rendern; während es läuft, zeigt es `Bild i / n · gewartet w · X MB` und wie viele Bilder nicht genau waren. Braucht einen Datensatz. |

## Tipps {#tips}

- Die Ausgabegröße ist die Größe der Leinwand in Geräte-Pixeln (das Pixelverhältnis des Displays, auf 2 begrenzt). Ändere die Größe des Browserfensters, um sie zu ändern.
- Eine kumulative Historie baut die Heatmap über den Clip auf; ein Fenster oder eine Lebensdauer zeigt einen wandernden Zeitausschnitt.
- Keyframe-Positionen sind Anzeigekoordinaten: Bei einer [invertierten Weltachse](camera.md#invert-world-axis) zeigen Keys, die vor dem Umschalten gesetzt wurden, danach woanders hin.

## Für Entwickler {#for-developers}

### Was ein Rendern tut {#what-a-render-does}

1. Macht eine Testaufnahme des Bildes, um die genaue Ausgabegröße in Geräte-Pixeln zu erfahren.
2. Wählt einen Codec über WebCodecs: **VP9** (`vp09.00.10.08`), sonst **VP8**, bei der gewählten Bitrate und Bildrate. Ohne `VideoEncoder` bricht es mit *Dieser Browser hat keinen VideoEncoder - WebCodecs wird zum Schreiben eines Videos benötigt* ab; ohne einen der beiden Codecs mit *Kein unterstützter Video-Codec (versucht: VP9, VP8)*.
3. Übernimmt die Einstellungen, die ein Rendern braucht: hält die Wiedergabe an, schaltet das **adaptive Budget aus**, **progressive Verfeinerung an** und setzt das Sprite-Budget auf 64 Mio. pro Bild (das adaptive Budget schützt die Bildrate, und das ist hier das falsche Ziel: Es würde jedes langsame, konvergierende Bild als Grund lesen, weniger Zeilen zu zeichnen, was mehr Bilder zur Konvergenz braucht), und schaltet die Zeitleiste von **Alle** auf **Abspielen**. Die Einstellung der Historie (kumulativ, Fenster, Lebensdauer) bleibt, wie sie ist: Ein Rendern soll das sein, was du gerade angeschaut hast, abgespielt und festgehalten.
4. Für jedes Ausgabebild *f* von *n*, bei *u* = f / (n - 1):
   - stellt die Kamera auf die Pose des Pfads bei *u* (falls es Keys gibt);
   - setzt den Abspielkopf auf denselben Anteil *u* des Zeitbereichs (die Spanne der gewählten Session beim Box-Replay);
   - erzwingt eine neue Schätzung, auch wenn sich die Kamera nicht bewegt hat - die Akkumulation des vorigen Bildes zu übernehmen würde einen Geist des vorigen Fensters hinterlassen;
   - wartet Bild für Bild, bis das Bild genau ist (alle Kandidatenzeilen in einem Bild gezeichnet, oder die Akkumulation abgeschlossen), höchstens bis zur Wartegrenze;
   - erfasst das zusammengesetzte Bild und kodiert es, mit einem Keyframe alle 2 Sekunden Ausgabe, damit die Datei durchsuchbar ist.
5. Packt die Bilder in eine WebM-Datei ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) mit Zeitstempeln aus der Bildrate - wie lange ein Bild wirklich gebraucht hat, spielt keine Rolle.
6. Stellt Budget, Sichtfeld, Zeitleisten-Modus, Abspielkopf und ob gerade abgespielt wurde wieder her.
7. Lädt das Video als `3dheat-<Breite>x<Höhe>-<Bilder>f.webm` herunter und meldet `N Bilder bei B×H, X MB - jedes Bild genau`, oder wie viele die Wartegrenze erreichten.

**Abbrechen** stoppt nach dem aktuellen Bild (*Rendern abgebrochen.*) und stellt die Einstellungen wieder her.
