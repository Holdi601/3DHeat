---
title: "Rennanalyse"
nav_order: 14
has_children: true
lang: "de"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# Rennanalyse

Du bist dieselbe Strecke zweimal gefahren. Der Tab **Rennanalyse** spielt beide Fahrten zusammen in 3D ab, zeigt, wo eine Runde langsamer war, und sagt dir, warum. Noch keine Runden? Drücke **Demo-Runden**.

![Der Tab Rennanalyse mit Demo-Runden: die Seitenleiste mit Runden und Wo Zeit zu holen ist, die Autos auf der Strecke, die Diagramme unter der Ansicht](../assets/img/de/race-analysis-overview.webp)

Der Tab vergleicht zwei oder mehr Runden einer Strecke. Er teilt sich Zeichenfläche, Kamera und das geladene Streckenmodell (**Hintergrund / Level**) mit der Heatmap; alles andere gehört ihm allein: seine eigene Seitenleiste und seine eigene Leiste unter der Ansicht. Begriffe wie *Runde*, *Referenz* und *Scheitelpunkt* stehen im [Glossar](glossary.md).

Diese Seite ist die Landkarte des Tabs. Jeder Teil hat seine eigene Seite:

| Seite | Was sie behandelt |
|---|---|
| [Runden laden](race-loading-laps.md) | jedes Dateiformat, Ordner und Strecken, Autonamen, Demo-Runden, die Rundenliste, Referenz und Fokus |
| [Replay und die 3D-Szene](race-replay-and-scene.md) | die Transportleiste, die drei Replay-Modi, Autos ausrichten, die Verfolgerkamera, Linien, Karten, Autos, Beschriftungen, gespiegelte Welten |
| [Diagramme und HUD](race-charts-and-hud.md) | die Distanzdiagramme, die Diagrammauswahl, Zeigen und Zoomen, die Autokarten, die Kanaltabelle |
| [Fahrzeugkontroll-Ereignisse](race-control-events.md) | Blockieren, Radschlupf, Übersteuern, Drehen, Untersteuern, Treffer, Unfälle, ABS/TC, Handbremse, Luft – wie jedes erkannt wird, mit jeder Schwelle |
| [Analyse Kurve für Kurve](race-corner-analysis.md) | Ausrichtung nach Distanz, Kurven und Abschnitte, die Zeitbilanz einer Kurve, jede Ursache und die Reihenfolge, in der sie geprüft werden, die Linienform und der Rat |
| [Fahrzeugprofile und Vergleich](race-car-profiles.md) | was jedes Auto kann, gemessen an seinen Runden; *Autos im Vergleich*; was das Auto in jeder Kurve entscheidet |
| [Streckenstatistik](race-course-statistics.md) | viele Runden einer Strecke: Fehler pro Kurve und pro Art, die Fehlerkarte, der Export der Heatmap, Leistungsgrenzen |
| [Rennanalyse: die Methode](race-analytics.md) | die Forschung hinter den Regeln, mit Quellen |
| [Andere Rennspiele](other-games.md) | was der Viewer mit Runden aus jedem Spiel tut: Schlupf und Driften, wo ein Spiel sie nicht sendet, gespiegelte Welten, die zusätzlichen Kanäle |

## Der Bildschirm {#the-screen}

**Seitenleiste**, von oben nach unten (Abschnitte lassen sich einklappen):

1. **Runden** – laden, auflisten, ein-/ausblenden, Referenz, Fokus, Verfolgung.
   Siehe [Runden laden](race-loading-laps.md).
2. **Streckenstatistik** – erst ab drei geladenen Runden.
   Siehe [Streckenstatistik](race-course-statistics.md).
3. **Wo Zeit zu holen ist** – die Befunde der fokussierten Runde, Kurve für Kurve.
   Siehe [Analyse Kurve für Kurve](race-corner-analysis.md).
4. **Kurve für Kurve** (oder *Kurve für Kurve – Klasse X*, bei mehreren Klassen) – die schnellste Runde durch jede Kurve und ihre Linie. Wird ab zwei oder mehr Runden angezeigt.
5. **Fahrzeugkontrolle** – Blockieren, Rutschen, Schieben und Treffer der fokussierten Runde.
   Siehe [Fahrzeugkontroll-Ereignisse](race-control-events.md).
6. **Autos im Vergleich** (oder **Das Auto** bei einem Auto) – siehe
   [Fahrzeugprofile und Vergleich](race-car-profiles.md).
7. **Ansicht** – welche Karte auf die Strecke gemalt wird und was gezeichnet wird.
   Siehe [Replay und die 3D-Szene](race-replay-and-scene.md).
8. Die gemeinsamen Panels **Level** und **Kamera & Szene** (Streckenmodell, Achsen-Umkehr, Kamera) – dokumentiert mit der Heatmap und der [Kamera](camera.md).

**Die Ansicht** zeigt die Strecke, die gefahrenen Linien, die Karte, die Autos, Beschriftungen am Streckenrand und oben links bis zu sechs Autokarten (siehe [Diagramme und HUD](race-charts-and-hud.md)). Ohne geladene Runden steht dort „Keine Runden geladen – ziehe eine oder mehrere Rundendateien hierher oder lade die Demo-Runden aus der Seitenleiste.“

**Die Leiste unter der Ansicht** enthält die Transportleiste des Replays und, wenn nicht ausgeblendet, die Distanzdiagramme.

## Schnellstart {#quick-start}

1. Öffne den Tab **Rennanalyse** (neben **Heatmap** oben in der Seitenleiste).
2. Hole Runden herein. Drücke **Demo-Runden**, um zu sehen, was der Tab mit drei ausgedachten Runden macht. Für eigene Runden nimm sie zuerst auf ([Dateiformate und Aufnahmeprogramme](race-loading-laps.md#file-formats)), dann drücke **Rundendateien laden…** oder **Ordner…** oder ziehe Dateien oder Ordner auf die Ansicht.
3. Die schnellste vollständige Runde wird zur Referenz; die langsamste andere Runde wird fokussiert. Klicke eine Runde in der Liste an, um sie zu fokussieren; ★ macht eine Runde zur Referenz.
4. Lies **Wo Zeit zu holen ist**. Klicke einen Befund an: Die Autos werden 40 m davor ausgerichtet, die Kamera rahmt ihn, das Replay spielt ihn ab, und die Messwerte öffnen sich.
5. Fahre über die Diagramme, um jedes Auto an diesen Meter zu bringen; Umschalt+Klick richtet sie dort aus.

## Tastatur {#keyboard}

Solange der Tab Rennanalyse offen ist:

| Taste | Wirkung |
|---|---|
| **K** | Replay abspielen / anhalten |
| **Pos1** | zurück zum Anfang des Replays |
| Zifferntasten | nichts (in der Heatmap wechseln sie die Modi) |

Tasten in einem Textfeld oder einem Auswahlmenü werden ignoriert. Die Kameratasten funktionieren wie in der Heatmap (**W A S D**, **Leertaste** nach oben, **Q** nach unten, **Umschalt** schneller, **Alt** langsamer, Maus zum Schauen; alles in [Kamera](camera.md)); **F** rahmt die geladenen Runden (wie es das Laden von Runden tut).

## Viele Runden {#many-laps}

- Alle geladenen Runden werden analysiert und gezählt; Dutzende brauchen eine oder zwei Sekunden.
- Über **8** Runden (`SHOW_ALL_UP_TO`) werden hinzugefügte Runden nur gezeichnet, wenn sie die Referenz, die fokussierte Runde oder die beste Runde der Klasse der fokussierten Runde sind. *Alle zeigen* / *Nur die angesehenen* schalten um.
- Über **10** sichtbare Autos (`PLAIN_PAST`) werden die nicht angesehenen Runden (nicht der Fokus, das verfolgte Auto oder die Referenz) mit Linien gezeichnet, die alle 6 m statt alle 1,5 m auf einen Punkt ausgedünnt sind, und als schlichte Autos.
- Die Diagramme zeichnen höchstens **8** Runden; das HUD zeigt höchstens **6** Karten.
- Die Streckenstatistik erscheint ab **3** Runden.

Details: [Streckenstatistik](race-course-statistics.md#performance-with-many-laps).

## Voreinstellungen der Ansicht {#default-view-settings}

| Einstellung | Voreinstellung |
|---|---|
| Karte | Zeitkarte |
| Gefahrene Linien, Autos, Reifen & Federung, Beschriftungen, Strecke aus den Runden | ein |
| Alle Werte auf den Karten | aus |
| Autogröße | 1× |
| Diagramme | angezeigt |
| Replay-Modus | Ab der Linie |
| Replay-Tempo | 1× |
| Schleife | ein |

Nichts davon wird gespeichert; ein Neuladen startet mit den Voreinstellungen. Im Browser gemerkt werden: die Sprache und die Autonamen, die aus Rundendateien gelernt wurden (siehe [Runden laden](race-loading-laps.md#car-names)).

## Für Entwickler {#for-developers}

### Was passiert, wenn Runden geladen werden {#what-happens-when-laps-are-loaded}

Jedes Mal, wenn sich die Menge der Runden, die Referenz oder die Sprache ändert, wird die ganze Analyse neu gemacht (`analyse` in [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Abgeleitete Kanäle werden jeder Runde hinzugefügt, wo das Spiel sie nicht sendet: Driftwinkel, Radschlupf aus den Raddrehzahlen, in der Luft, loser Untergrund, Gierrate ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Die Referenz wird gewählt, und jede Runde wird auf deren Weg projiziert und alle 2 m neu abgetastet ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Aus den Runden wird ermittelt, ob die Welt des Spiels gespiegelt ist ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Kurven werden auf der Referenz gefunden und zu Abschnitten gruppiert, von einer Bremszone bis zur nächsten ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Pro Auto: seine Hüllkurve (Grip, Bremsen, Zug je Geschwindigkeit), sein Profil und seine Reifenkurven ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts), [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts), [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Pro Runde und Abschnitt: was sie getan hat (Bremspunkt, langsamster Punkt, Vollgas, ...) und die Linie, die sie gefahren ist ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Pro Runde: ihre Ereignisse der Fahrzeugkontrolle, jedes dort der Runde gegenübergestellt, mit der sie verglichen wird.
8. Pro Runde und Abschnitt: die Zeitbilanz gegen ihre Vergleichsrunde und der Befund in Worten.
9. Die Zeitkarte und die Ursachenkarte pro Runde.

Die Texte entstehen in der aktuellen Sprache; ein Sprachwechsel führt die Analyse erneut aus (und benennt die Demo-Runden um). Ein Fehler in der Analyse wird unter den Schaltflächen **Runden** als Fehler angezeigt, und die Runden bleiben geladen.

### Quelldateien {#source-files}

| Datei | Aufgabe |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | Lesen der Rundendateien |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | der Rundentyp, Benennung, Demo-Runden |
| `src/race/derive.ts`, `handedness.ts` | abgeleitete Kanäle, gespiegelte Welten |
| `src/race/align.ts`, `segments.ts`, `line.ts` | Distanzachse, Kurven, Linien |
| `src/race/analysis.ts` | verglichene Kurven, Ursachen, Befunde |
| `src/race/envelope.ts`, `profile.ts` | was ein Auto kann |
| `src/race/control.ts`, `impacts.ts` | Fahrzeugkontrolle, Treffer und Unfälle |
| `src/race/stats.ts` | viele Runden |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | Replay und Zeichnen |
| `src/race/schema.ts`, `graphs.ts` | die Kanaltabelle, die Zeilen der Diagramme |
| `src/ui/race/*` | die Seitenleiste, die Diagramme, das HUD, die Beschriftungen |
| `src/state/raceStore.ts` | Zustand des Tabs und die Replay-Uhr |
