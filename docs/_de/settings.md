---
title: "Einstellungen, Einheiten und Tasten"
nav_order: 19
lang: "de"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: false
---

# Einstellungen, Einheiten und Tasten

Die kleinen Regler oben in der Seitenleiste bestimmen, wie der Viewer mit dir spricht: die Sprache, die Einheiten (Meter oder Fuß, km/h oder Knoten) und einen Hilfemodus, der die Farben erklärt. Deine Wahl wird im Browser gemerkt.

## Die Kopfzeile {#the-header}

Oben in der Seitenleiste:

| Regler | Was er tut |
|---|---|
| **?** | Hilfemodus: was jede Farbe bedeutet (auch `?` oder `F1`) |
| Menü **Einheiten** | Metrisch, Imperial, Luftfahrt oder Nautisch |
| Schaltfläche **...** neben **Einheiten** | Öffnet „Wähle eine Einheit für jede Größe“: ein Auswahlmenü pro Größe |
| Menü **Sprache** | Die Sprache des Viewers: [40 Sprachen](languages.md) oder die des Browsers |

![Die Kopfzeile mit dem Menü Einheiten und dem geöffneten Fenster Einheit pro Größe](../assets/img/en/settings-units.webp)

Zahlen, die du in ein Feld tippst, dürfen einen Punkt oder ein Komma haben (`0.35` oder `0,35`). Der Viewer liest beides und zeigt Zahlen so, wie die Sprache des Viewers sie schreibt.

## Einheiten {#units}

1. Wähle eine Voreinstellung im Menü **Einheiten**. Alle Größen wechseln gemeinsam.
2. Um nur eine Größe zu ändern, klicke auf die Schaltfläche **...** daneben und wähle eine Einheit für diese Größe. Das Menü zeigt dann ein `*` hinter der Voreinstellung.
3. Eine Größe, die du nicht gesetzt hast, folgt der Voreinstellung. Wähle „Wie Voreinstellung“, um zurückzukehren.

| Größe | Metrisch (Voreinstellung) | Imperial | Luftfahrt | Nautisch |
|---|---|---|---|---|
| Entfernung | km | mi | NM | NM |
| Höhe, Länge | m | ft | ft | m |
| Geschwindigkeit | km/h | mph | kt | kt |
| Vertikalgeschwindigkeit | m/s | ft/min | ft/min | m/s |
| Temperatur | °C | °F | °C | °C |
| Druck | hPa | inHg | hPa | hPa |
| Masse, Treibstoff | kg, l | lb, gal | lb, gal | t, m³ |
| Winkel | Grad | Grad | Grad | Grad |

Weitere Einheiten, die du für eine Größe wählen kannst: Entfernung km, mi, NM; Geschwindigkeit km/h, m/s, kt, mph; Vertikalgeschwindigkeit m/s, ft/min, m/min; Temperatur °C, °F, K; Druck hPa, inHg, mmHg, psi; Masse kg, lb, t; Winkel Grad oder NATO-Mil (6400 auf den Kreis). Die Einheiten sind im ganzen Viewer gleich: Beschriftungen, Karten, Diagramme, Statistiken.

## Hilfemodus {#help-mode}

![Hilfemodus: was die Farben bedeuten](../assets/img/en/help.webp)

Drücke `?` oder `F1` oder klicke auf die Schaltfläche **?**. Es zeigt *Was die Farben bedeuten*: Legenden für die 3D-Ansicht, die Intensitätsverläufe, Teamfarben, die Farben des Levels, die Statusfarben der Panels, das Match-Panel und die Rennansicht. Er bleibt an, bis du ihn ausschaltest. Im Tab Match erklärt er auch die Farben des Match-Panels.

![Hilfemodus im Tab Match](../assets/img/en/settings-help-match.webp)

## Was der Browser sich merkt {#what-the-browser-remembers}

Diese Einstellungen bleiben zwischen Besuchen im Browser erhalten (nichts wird irgendwohin gesendet):

- die Sprache, die Einheiten und der Hilfemodus;
- die Einstellungen des Replays für Figur, Symbol, Beschriftung, Kamera und taktische Anzeige;
- die Wiedergabegeschwindigkeit und Spiegelung;
- Lesezeichen pro Aufnahme, Volumen pro Datensatz, Zielebenen;
- die Einstellungen der externen KI (der Schlüssel nur, wenn du *Merken* ankreuzt).

Intensitätseinstellungen, Filter und der Modus starten bei jedem Laden neu. Die vollständige, generierte Liste: [Gespeicherte Einstellungen](ref-settings-storage.md).

## Tasten, die der Viewer vom Browser übernimmt {#keys-the-viewer-keeps-from-the-browser}

Eine Sitzung mit großen Daten braucht Zeit zum Laden, daher verhindert der Viewer, dass der Browser sie versehentlich wegwirft:

- `Strg`/`Cmd` + Buchstaben, die drucken, speichern, öffnen, neu laden, schließen oder neue Fenster öffnen würden, tun außerhalb von Textfeldern nichts; `F1`, `F3`, `F5`, `F6` und `F7` tun nichts.
- Das Schließen oder Neuladen des Tabs mit geladenen Daten oder einem Level fragt zuerst nach.
- Im Vollbild sperrt der Viewer die Tasten, die er nutzt (W, T, N, S, R, P, Q, Esc), damit der Browser sie nicht übernimmt.

Die genaue Liste: [Browser-Tasten](ref-browser-keys.md). Alle eigenen Tasten des Viewers: [Tastatur- und Mausreferenz](keyboard-reference.md).
