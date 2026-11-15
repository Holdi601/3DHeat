---
title: "Entitäten"
parent: "Filter und Werkzeuge"
nav_order: 3
lang: "de"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entitäten

Mit **Entitäten** wählst du einen Spieler (oder einige wenige) aus und siehst nur, wohin dieser Spieler gegangen ist. Nutze es, um deine eigene Bewegung oder einen Gegner zu verfolgen.

Das Fenster wird angezeigt, wenn der Datensatz eine Personenspalte hat. Seine Kopfzeile zeigt die Anzahl der Personen oder `ausgewählt von insgesamt`, solange eine Auswahl aktiv ist. (Eine *Person* ist ein Spieler oder eine KI, siehe [Glossar](glossary.md).)

## Einen Spieler auswählen {#pick-a-player}

1. Öffne **Entitäten** in der Seitenleiste.
2. Gib einen Teil des Namens in das Suchfeld ein.
3. Setze den Haken bei dem Spieler. Die Kopfzeile zeigt zum Beispiel `2 von 10`, und alles andere verschwindet.
4. **Leeren** zeigt wieder alle.

![Entitäten mit zwei von zehn ausgewählten Spielern](../assets/img/en/entities-selected.webp)

Die Auswahl zeigt nur die ausgewählten Personen, in den Heatmap-Modi (Punkte, Linien, Differenz, Team-Intensität) ebenso wie in den Spuren, Figuren und Schweifen der [Figuren-Wiedergabe](box-replay.md). Lass die Auswahl leer, um alle zu zeigen. Alle auszuwählen ist dasselbe wie niemanden auszuwählen.

## Das Fenster {#the-panel}

| Teil | Bedeutung |
|---|---|
| Suchfeld | *N Entitäten durchsuchen...* - filtert die Liste nach einem Teil des Namens, ohne Unterschied zwischen Groß- und Kleinschreibung. Zeigt `N Treffer` oder `N Treffer, die ersten 200 werden angezeigt`; *Nichts passt zu „...“*, wenn die Suche nichts findet. |
| Liste | Bis zu 200 Personen (die ersten 200 Treffer), jede mit einer Checkbox, einem Farbfeld in der Farbe der Person und dem Namen (*(ohne Namen)* bei einem leeren Namen). |
| Hinweis „im Spiel“ | Läuft die Zeit, enthält die Liste die Personen *im Spiel am Abspielkopf*. Eine Suche findet alle. |
| **KI (n)** | Eine einklappbare Gruppe mit den von der KI gesteuerten Einheiten, getrennt von den Spielern. |
| **Gelistete hinzufügen** | Fügt alle aktuell gelisteten Personen zur Auswahl hinzu. |
| **Nur Gelistete** | Macht die Auswahl genau zu den gelisteten Personen. |
| **Leeren** | Leert die Auswahl. |

## Grenzen {#limits}

In der Intensität ist die Auswahl ein Filter und belegt einen der vier [Filterplätze](filters.md#rules). Sind die anderen Filter bereits alle vier Plätze belegt, sagt das Fenster *Nicht auf die Intensität angewendet: alle Filterplätze sind belegt. Die Figuren-Wiedergabe zeigt trotzdem nur diese Entitäten. Entferne einen Filter unter Filter, um einen Platz frei zu machen.* Entferne einen Filter, um einen Platz frei zu machen.

Die Auswahl wird bei jedem neuen Datensatz geleert. Der Tab Match setzt dieselbe Auswahl, wenn er einen Spieler in den Fokus nimmt.

## Für Entwickler {#for-developers}

Die Auswahl wird als Filter *Personen* gespeichert ([Filter](filters.md#for-developers)). Die Maske des Shaders hält 65.536 Personen-IDs. Eine Person darüber wird in der Intensität nicht gezeichnet, solange eine Auswahl aktiv ist.
