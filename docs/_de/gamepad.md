---
title: "Gamepad und HOTAS"
parent: "Kamera und Steuerung"
nav_order: 1
lang: "de"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Gamepad und HOTAS

Du kannst die Kamera mit einem Controller im Xbox-Stil statt mit der Tastatur fliegen. Nimm ihn, wenn du dich zurücklehnen und eine große Szene betrachten willst. Seine Eingabe **kommt zu** der der Tastatur hinzu, du kannst also beides gleichzeitig nutzen.

## Einen Controller verbinden {#connect-a-controller}

1. Stecke den Controller ein (oder kopple ihn).
2. Klicke in die Ansicht und drücke eine beliebige Taste am Controller. Browser zeigen einen Controller erst nach seiner ersten Eingabe.
3. Öffne **Kamera & Szene → Gamepad**. Die Geräteliste zeigt ihn mit `●`.
4. Drücke den linken Stick zum Fliegen, den rechten zum Umsehen. Driftet die Kamera, wenn die Sticks in der Mitte stehen, erhöhe die **Totzone**.

Jedes Gerät, das der Browser auf das Standard-Gamepad-Layout abbildet, funktioniert. Ein Flightstick oder Schubhebel (HOTAS) wird standardmäßig ignoriert. Siehe unten.

## Belegung {#mapping}

| Steuerung | Wirkung |
|---|---|
| Linker Stick | Bewegen: vor und zurück und seitlich |
| Rechter Stick | Umsehen: Gieren und Nicken, mit *Blickgeschwindigkeit* Grad pro Sekunde bei voller Auslenkung |
| `RT` / `LT` (analog) | Hoch / runter; in der Parallelprojektion hinein- / herauszoomen |
| `RB` (gehalten) | 6-mal schneller |
| `LB` (gehalten) | 15 % Tempo |
| `A` (gehalten) | 3-facher Sprint (kombiniert sich mit RB/LB) |
| `Y` (drücken) | Daten einrahmen |

Die Tastennummern folgen dem Standard-Layout: A 0, Y 3, LB 4, RB 5, LT 6, RT 7. Die Sticks liegen auf den Achsen 0-1 (links) und 2-3 (rechts).

## Die Gamepad-Einstellungen {#the-gamepad-settings}

Unter **Kamera & Szene → Gamepad**. **Einstellungen** / **Ausblenden** öffnet die Feineinstellungen.

| Steuerung | Standard | Bereich (Jog) | Bedeutung |
|---|---|---|---|
| **Aktiviert** | an | | |
| Gerätestatus | | | Jedes verbundene Gerät, `●` wenn es verfolgt wird, `○` wenn nicht, mit *- kein XInput-Pad, wird ignoriert* oder *- kein XInput-Pad, wird trotzdem verwendet* bei Nicht-Standardgeräten. Ohne Gerät: *Kein Pad erkannt. Browser zeigen einen Controller erst, nachdem er seine erste Eingabe gesendet hat. Drücke eine Taste darauf.* |
| **Gerät verwenden** | *Nur XInput-Pads (empfohlen)* | | Erscheint, wenn ein Nicht-Standardgerät verbunden ist. Wähle ein Gerät nach Namen, um stattdessen dem zu folgen. |
| **Blickgeschwindigkeit** | 150°/s | 20-540 (5000) | Drehgeschwindigkeit bei voller Auslenkung des rechten Sticks. |
| **Totzone** | 12 % | 0-50 % (95 %) | Radial: ein diagonales Drücken läuft nie nur in eine Achse. Erhöhe sie, wenn die Kamera bei Sticks in der Mitte driftet. |
| **Stick-Kurve** | x² | linear (1) bis x⁴ (16) | Antwortexponent nach der Totzone: feinere Steuerung nahe der Mitte, voller Tempo am Rand. |
| **Stick-Y invertieren** | aus | | |
| **Sticks tauschen** | aus | | Bewegen mit dem rechten Stick, Umsehen mit dem linken. |

Die Formung des Sticks: Bei Auslenkung *m* (der Länge des Stick-Vektors) und Totzone *d* ist die Ausgabe ((m - d) / (1 - d)) ^ Kurve entlang der Richtung des Sticks und 0 innerhalb der Totzone.

## Warum standardmäßig nur Standard-Pads {#why-only-standard-pads-by-default}

Die Gamepad-API meldet **jedes** HID-Gerät mit Achsen: Flightsticks, Schubhebel, Pedale, Lenkräder. Die stehen nicht in der Mitte. Eine Drehachse oder ein Gashebel liegt bei voller Auslenkung, wenn niemand sie berührt. Als Stick gelesen, ist das eine dauerhafte Vollgas-Eingabe, die keine Totzone unterdrücken kann. Die Kamera dreht sich dann von selbst, sobald die Seite lädt. Und jeder Hitzemodus wirkt kaputt, weil eine bewegte Kamera die Akkumulation bei jedem Bild neu startet.

Deshalb wird ein Gerät nur verfolgt, wenn der Browser `mapping: "standard"` meldet. Das heißt: ein Pad im XInput-Stil, dessen Achsen dort liegen, wo man sie erwartet. Andere Geräte werden aufgelistet und als ignoriert markiert. **Gerät verwenden** wählt eines bewusst aus, zum Beispiel um die Kamera mit einem HOTAS zu fliegen. Sobald ein Pad verfolgt wird, bleibt die Kamera bei ihm. So streiten sich zwei Controller nicht um die Kamera, je nach Reihenfolge der Aufzählung.

**HOTAS:** Gelesen werden nur die Achsen 0-3 (zwei Sticks) und die Standardtasten. Ein Schubhebel oder Pedale auf anderen Achsen tun nichts. Ein Stick oder Schubhebel, dessen Achsen nicht in der Mitte ruhen, braucht womöglich eine größere **Totzone**.

Browser verbergen einen Controller, bis er seine erste Eingabe gesendet hat. Ein angeschlossenes Pad, das niemand berührt hat, existiert für die Seite also noch nicht.
