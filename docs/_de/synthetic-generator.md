---
title: "Synthetischer Generator"
parent: "Daten laden"
nav_order: 5
lang: "de"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Synthetischer Generator

Keine eigenen Daten? Drück eine Taste, und 3DHeat erfindet dir eine erfundene Schlacht, so klein oder groß, wie du willst.

1. Öffne das Fenster **Datensatz** in der Heatmap-Seitenleiste (unter **Quelle**).
2. Scrolle zu **Synthetischer Generator**.
3. Stelle **Zeilen (Millionen)** ein. Probiere zuerst 1: Der Standardwert von 8 Millionen ist für einen ersten Versuch zu schwer.
4. Drück **Erzeugen**.

![1 Million Zeilen, 8 Teams, gezeichnet in Team-Intensität](../assets/img/en/synthetic-generator-team-heat.webp)

Das Fenster **Datensatz** kann einen Datensatz erzeugen, statt einen zu laden. Es dient zwei Zwecken: den Viewer ohne eigene Daten zu testen, und zu prüfen, ob eine bestimmte Zahl von Zeilen, Sprite-Radius und Budget auf einem Rechner eine brauchbare Bildrate hält, *bevor* du eine große echte Datenmenge darauf lädst. Die Bewegung ist wie bei einer Battle-Royale-Partie geformt: Teams starten getrennt und werden dann zusammengedrängt. Gleichmäßiges Rauschen sieht bei jedem Budget gut aus und verdeckt genau die Artefakte, die man finden will.

## Steuerung {#controls}

| Steuerung | Standard | Bedeutung |
|---|---|---|
| **Zeilen (Millionen)** | 8 | Zu erzeugende Zeilen. Auf eine ganze Anzahl von Ticks für jeden Spieler abgerundet. |
| **Teams** | 8 | Anzahl der Gruppen (mindestens 1). |
| **Pro Team** | 12 | Spieler je Gruppe (mindestens 1). |
| **Halbe Kartenbreite (m)** | 4000 | Die halbe Breite des spielbaren Bereichs auf X und Z. |
| Schätzzeile | | „≈ X GB RAM, Y GB auf der GPU nach der Quantisierung.“ (etwa 26 Byte RAM und 8 Byte GPU je Zeile). |
| **Erzeugen** | | Erzeugt im Aufnahme-Worker, mit Fortschritt, und ersetzt jeden geladenen Datensatz. |

Die Erzeugung läuft im Hintergrund-Worker. Zehn Millionen Zeilen frieren deshalb die Seite nicht ein.

## Was erzeugt wird {#what-it-generates}

Aus [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Spalten:** Position, Zeit, Person (`P000`, `P001`, ...), Gruppe (`Team 1`, `Team 2`, ...), Gieren und Nicken sowie Lebensdauern. Keine Sitzungsspalte und keine Filterspalten.
- **Zeit:** eine Probe je Spieler alle 0,25 s, beginnend bei 0 (relative Zeit, keine Wanduhr).
- **Bewegung:** Jedes Team startet in seinem eigenen Sektor eines Rings bei 55-95 % der halben Ausdehnung. Ein sicherer Kreis nahe der Mitte (zufällig um bis zu einem Viertel der halben Ausdehnung verschoben) schrumpft in sechs Phasen mit Pausen auf 8 % der halben Ausdehnung. Jeder Spieler steuert auf einen wandernden Punkt darin zu, mit Dämpfung und Rauschen. Die Höhe schwankt zwischen 0 und 220 m.
- **Blickrichtung:** Gieren in Fahrtrichtung, Nicken aus der vertikalen Geschwindigkeit.
- **Wiederholbar:** Der Zufallsstartwert ist fest (1337). Dieselben Einstellungen erzeugen immer dieselben Daten.

Jeder Heatmap-Modus, die Box-Wiedergabe und die Linien-Heatmap (ganze Spuren, da es keine Ereignisspalte gibt) funktionieren damit. Auch der Lebensdauer-Verlauf funktioniert.
