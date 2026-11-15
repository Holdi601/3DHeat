---
title: "Teamliste"
parent: "Filter und Werkzeuge"
nav_order: 2
lang: "de"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Teamliste

Mit dem Fenster **Teams** kannst du ein Team ausblenden oder es auf eine Seite eines Vergleichs setzen. Nutze es, um nur Blau anzusehen, oder um zu fragen: „Wohin geht Blau, wohin Rot nicht geht?“.

Eine *Gruppe* ist ein Team oder eine Seite, zum Beispiel Blau und Rot ([Gruppen](sessions-persons-groups.md#group)). Das Fenster wird angezeigt, wenn der Datensatz eine Gruppenspalte hat. Die Anzahl der Gruppen steht in seiner Kopfzeile. Im Modus Team-Intensität hat die Seitenleiste außerdem einen Abschnitt namens **Team-Ansicht** mit eigenen Einstellungen. Diese Seite behandelt die **Teamliste**.

## Ein Team ausblenden {#hide-a-team}

1. Öffne **Teams** in der Seitenleiste.
2. Entferne den Haken der Checkbox (*Sichtbar*) des Teams, das du ausblenden willst. Das Bild ändert sich sofort.
3. Drück **Alle zeigen**, um jedes Team wieder einzublenden.

![Die Teamliste: Blau 5p, Rot 5p, mit Alle zeigen](../assets/img/en/teams-list.webp)

## Jede Zeile {#each-row}

| Teil | Bedeutung |
|---|---|
| Checkbox (*Sichtbar*) | Zeigt die Gruppe oder blendet sie aus. |
| Farbfeld | Die Farbe der Gruppe: ihre [Team-Intensitäts](team-heat.md)-Farbe im Modus Team-Intensität, sonst ihre Grundfarbe. |
| Name | Die Bezeichnung der Gruppe (volle Bezeichnung beim Darüberfahren). |
| **+** / **-** (Modus Differenz) | Setzt die Gruppe auf die positive oder negative Seite der [Differenz](difference.md). Klickst du den aktiven Knopf erneut, liegt die Gruppe auf keiner Seite. |
| `Np` (andere Modi) | Die Anzahl der Personen, deren erste Zeile in dieser Gruppe liegt. |

![Modus Differenz: Blau auf der + Seite, Rot auf der - Seite](../assets/img/en/teams-list-difference.webp)

## Knöpfe {#buttons}

| Knopf | Wirkung |
|---|---|
| **Alle zeigen** | Macht jede Gruppe wieder sichtbar. |
| **Gleichmäßig aufteilen** (Modus Differenz) | Die erste Hälfte der Gruppen (aufgerundet) auf +, den Rest auf -. Dieselbe Aufteilung beginnt bei jedem Laden. |

## Was das Ausblenden einer Gruppe bewirkt {#what-hiding-a-group-does}

- In **Intensität**, **Team-Intensität** und **Linien** tragen die Zeilen der Gruppe nichts bei.
- Im Modus **Differenz** trägt eine ausgeblendete Gruppe nichts bei, egal auf welcher Seite sie liegt, auch bei einem Schnitt nach einer anderen Spalte (siehe [Differenz](difference.md#for-developers)).
- Im **Figuren-Overlay** werden Personen nicht gezeichnet, deren erste Zeile in dieser Gruppe liegt.
- In **Team-Intensität** behalten die anderen Gruppen ihre Farben. Die Farbtöne werden aus der Gesamtzahl der Gruppen vergeben, nicht aus dem, was eingeschaltet ist. So bleiben zwei Bilder vergleichbar.

Eine Änderung der Sichtbarkeit startet die Akkumulation neu. Bei jedem neuen Datensatz ist jede Gruppe wieder sichtbar.

Der Hinweis des Fensters ändert sich mit dem Modus: Im Modus Differenz erklärt er + und -. Im Modus Team-Intensität sagt er, dass die Farbfelder die Farben sind, in denen jede Gruppe gezeichnet wird.
