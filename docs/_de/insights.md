---
title: "Erkenntnisse"
nav_order: 7
has_children: true
lang: "de"
source: "insights.md"
source_hash: "8232fe145807"
translated: true
outdated: false
---

# Erkenntnisse

**Erkenntnisse** durchsucht die geladenen Daten nach dem, was heraussticht – starke Positionen, tödlicher Boden, Spawn-Fallen, Engpässe, Spieler, die weit über ihren Mitspielern liegen – und sagt dir das, das Stärkste zuerst, mit den Belegen. Damit lernst du in einer Minute, wo ein Match gewonnen oder verloren wurde. Danach kann es eine Nachbesprechung schreiben, und bei einem einzelnen Replay kann es als Kommentator auftreten, der zu den großen Momenten springt.

Alles wird in deinem Browser gezählt. Nichts verlässt deinen Rechner, außer du schaltest eine externe KI ein (siehe [Externe KI](#external-ai)).

![Erkenntnisse zur Panzer-Demo: 14 Befunde, das Stärkste zuerst](../assets/img/en/insights.webp)

Der Bereich **Erkenntnisse** steht in der Seitenleiste der Tabs Heatmap und Match. Er hat drei Reiter: **Befunde**, **Nachbesprechung** und **Kommentator**.

## Befunde {#findings}

1. Lade Daten und öffne **Erkenntnisse**. Drücke **Erkenntnisse finden** („Zähle… n %“ zeigt den Fortschritt).
2. Lies die Liste. Jeder Befund hat einen Stärkebalken, einen Satz, wie gut die Belege sind (*Starke Belege*, *Gute Belege* oder *Einige Belege*), welcher Detektor ihn gefunden hat und, wo es wichtig ist, die Fahrzeugklasse.
3. **Klicke einen Befund an**: Der Viewer wendet seine Filter an, fliegt die Kamera zum Ort und springt zur Zeit, und öffnet die Details: die Wirkung mit ihrem 95-%-Intervall, die p- und q-Werte, die gezählten Belege und **Volumen hier**, das ein [Volumen](volumes.md) um den Ort zieht.
4. **Filter wiederherstellen** setzt deine Filter zurück. **JSON kopieren** kopiert den ganzen Bericht.

Gezählt wird mit den aktuellen Filtern, ausgeblendeten Gruppen und dem gewählten Match über den gesamten Zeitraum. Änderst du danach die Filter, weist ein Hinweis darauf hin; drücke **Neu zählen**.

Die Zeilen oben in der Liste (zum Beispiel die Geldsummen) fassen die gesamten Daten zusammen, bevor die Befunde kommen.

![Ein geöffneter Befund: die heiße Zone der abgegebenen Schüsse, ihre Zahlen und eine passende Stelle aus der Literatur](../assets/img/en/insights-finding.webp)

### Die Detektoren {#the-detectors}

| Detektor | Was er findet | Braucht in den Daten |
|---|---|---|
| **Power-Positionen** | Orte mit deutlich besseren Abschuss-zu-Tod-Verhältnissen als der Rest der Karte, und *sicheren Boden*, wo in der Zeit dort nur wenige sterben | Abschuss- und Todesereignisse |
| **Heiße und kalte Zonen** | Orte, an denen eine Ereignisart (Schüsse, Treffer, Eroberungen ...) weit öfter oder seltener passiert, als die dort verbrachte Zeit erwarten lässt | eine Ereignisspalte |
| **Offenes Gelände und Deckung** | Tode im Freien nahe bei Levelgeometrie und langsam bei schneller Bewegung | Tode; für den Geometrieteil ein 3D-Level |
| **Spawns** | Starke Spawns, Spawn-Fallen, sichere Spawns, Zeit bis zum ersten Kontakt | Zeit und Personen |
| **Klasse nach Ort** | Eine Fahrzeugklasse oder Spieler gegen KI, die in einem Bereich deutlich besser oder schlechter abschneiden | Abschüsse plus eine Fahrzeugklassen- oder Spieler/KI-Spalte |
| **Spieler** | Spieler, die weit mehr oder weniger abschießen oder sterben als andere in derselben Klasse | Personen und Abschüsse |
| **Engpässe und Flanken** | Engpässe (weit mehr Durchgänge als das Gelände drumherum) und Flankenrouten (selten genutzt, führen aber zu Abschüssen) | Personen |
| **Wert** | *Teurer Boden* und *Ertragreicher Boden* | [Wertspalten](value-weighting.md) |

Detektoren, die auf den Daten nicht laufen können, stehen unten mit dem Grund.

### So werden Befunde geordnet {#how-findings-are-ranked}

Jeder Ort und jede Gruppe wird gegen den Rest der Karte geprüft (exakte Binomial- oder Ratentests). Die Falsch-Entdeckungsrate wird bei 5 % gehalten (Benjamini-Hochberg). Zufall kann wie ein Muster aussehen; das hält Fehlalarme gering: Unter den gezeigten Befunden ist höchstens etwa einer von zwanzig als Zufall zu erwarten. Wirkungen aus wenigen Ereignissen werden vor dem Ordnen zu „keine Wirkung“ hingezogen. Höchstens 60 Befunde werden aufgelistet, und jeder Detektor bekommt ein paar Orte weit oben.

## Nachbesprechung {#debrief}

Der Reiter **Nachbesprechung** schreibt die Befunde als kurzen Text auf: einen Einstieg, den klarsten Befund, einen für Taktik, einen für Balance, die übrigen gruppiert nach Detektor, und wie viele auf schwächeren Belegen beruhen. Jeder Absatz hat nummerierte Schaltflächen, die seine Befunde zeigen. **Text kopieren** kopiert ihn.

![Die Nachbesprechung, geschrieben vom eingebauten Erzähler](../assets/img/en/debrief.webp)

Der eingebaute Erzähler arbeitet offline, in deiner Sprache. Der Auswahlschalter **Linse** darüber (siehe [Die Wissenslinse](knowledge.md)) bestimmt, welche Literatur die Absätze zitieren.

### Externe KI {#external-ai}

**KI-Einstellungen** lässt stattdessen ein KI-Modell deiner Wahl die Nachbesprechung schreiben:

| Einstellung | Bedeutung |
|---|---|
| **Anbieter** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (lokal), LM Studio (lokal), llama.cpp-Server (lokal) oder jeder OpenAI-kompatible Endpunkt |
| **Basis-URL**, **Modell** | Vom Anbieter ausgefüllt; **Modelle auflisten** fragt den Server |
| **API-Schlüssel** | Wird nur an die Basis-URL gesendet. Nie protokolliert, nie in Ansichten, Exporten oder `.3dheat`-Dateien gespeichert. Die meisten lokalen Server brauchen keinen. |
| **Schlüssel in diesem Browser merken** | Standardmäßig aus: Der Schlüssel wird vergessen, wenn die Seite geschlossen wird |
| **Eine externe KI verwenden** | Standardmäßig aus |
| **Spielernamen senden** | Standardmäßig aus: Spieler werden als P1, P2 ... gesendet |

Dann tippe optional eine Frage und drücke **Mit KI schreiben**. Gesendet werden nur die Befunde und ihre Zahlen – nie die Zeilen deiner Daten. Die Antwort kommt Stück für Stück, und zitierte Befunde werden zu Schaltflächen.

## Kommentator {#caster}

Für **ein Match** (wähle eines, wenn mehrere geladen sind) findet der **Kommentator** die Momente, die sich anzusehen lohnen: erstes Blut, Mehrfachabschüsse, Vergeltungen, Schlussspurts, Wechsel bei Zielen, Comebacks, herausragende Spieler, weite Schüsse.

![Die Momente des Kommentators für eine Runde der Shooter-Demo](../assets/img/en/caster.webp)

- Klicke einen Moment an: Die Ansicht wechselt ins Replay, springt kurz davor, fliegt dorthin und folgt dem Spieler.
- **Momente abspielen** spielt jeden bis zu seinem Ende und geht weiter; **Zurück** / **Weiter** blättern durch sie.
- Ist eine externe KI an, schreibt **Kommentar von KI** einen Kommentar aus der Momentliste (Arten, Zeiten, Namen oder Pseudonyme, Teams, Klassen, Entfernungen).

Er braucht Personen und Abschuss-/Todesereignisse (oder Eroberungen); eine Spalte `other`/`victim` macht Vergeltungen und weite Schüsse möglich.

## Wissenslinse {#knowledge-lens}

Ein Befund lässt sich durch eine **Linse** etablierten Wissens lesen: Militärdoktrin, Luft- und Seekampf, Stadtoperationen, Spieldesign und E-Sport (oder *Auto*, gewählt nach den Einheiten in den Daten). Ein geöffneter Befund zeigt dann den nächstliegenden Eintrag zu **Doktrin und Literatur** und eine **historische Parallele** mit Quellen, und **Linsen-Kennzahlen** berechnet aus dieser Literatur Maße auf den Daten (Lanchester-Anpassungen, Austauschverhältnisse, Kräfteverhältnisse, Wirkungsfelder, Schlüsselgelände, Vergeltungen, Initiative). Nachbesprechung und KI-Anweisung enthalten sie. Alles dazu: [Die Wissenslinse](knowledge.md).

Die Linsen-Kennzahlen messen außerdem, wie sich die Spieler als Menge und als Gruppe verhalten – Ausrichtung und Kreisen, Routenlenkung, Spuren und Pfade, Gedränge, Anführer und Folgende, Nachzügler, der Bruchpunkt bei Verlusten, Risiko nach einem verlorenen Leben, Serien, Übereinstimmung beim Kauf und die Reaktion auf eingehendes Feuer – jeweils gegen ein eigenes Nullmodell: [Kollektives Verhalten](collective-behaviour.md).

## Daten, mit denen Erkenntnisse funktionieren {#data-that-makes-insights-work}

- Positionen mit einer **Zeit**-, einer **Person**- und einer **Team**-Spalte;
- eine **Ereignis**-Spalte mit Abschüssen und Toden (`kill`, `death`) und weiteren (`hit`, `fire`, `capture` ...);
- eine Spalte **Gegenpartei** (`other`, `victim`) für Vergeltungen und Richtungen;
- eine **Fahrzeug**- oder **Typ**-Spalte für Klassen; eine Spalte `ai` für Spieler gegen KI;
- eine Spalte **Sitzung** / **Match** / **Runde**, wenn es mehrere Matches gibt.

Die [Demodaten](demo-data.md) haben alle davon.
