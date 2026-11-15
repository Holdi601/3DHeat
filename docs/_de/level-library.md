---
title: "Level-Bibliothek"
parent: "Levels und Hintergrundgeometrie"
nav_order: 4
lang: "de"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Level-Bibliothek

Die Bibliothek bewahrt deine Level in diesem Browser auf, damit du sie nicht erneut laden und vereinfachen musst. **Wenn du die Daten der Seite im Browser löschst, wird die Bibliothek gelöscht, und es gibt keinen Export.** Bewahre deine Originaldateien auf.

Ein Level zu verarbeiten (Parsen, Klassifizieren, Verschweißen, Dezimieren, Texturen packen) ist langsam, und das Ergebnis ist jedes Mal dasselbe. Die **Bibliothek** unten im Fenster Hintergrund / Level behält verarbeitete Level in diesem Browser. So wird ein dezimiertes Netz nie zweimal gebaut ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Ein Level speichern und wieder laden {#save-and-reload-a-level}

1. Lade ein Kartenbild oder ein 3D-Modell und prüfe, ob es richtig aussieht.
2. Drück **In Bibliothek speichern**. Das Fenster sagt *Gespeichert. Beim nächsten Mal lädt es sofort.*
3. Öffne beim nächsten Mal die Liste **Bibliothek** und drück ▸ beim Level.
4. Drück ✕, um einen Eintrag zu löschen, den du nicht mehr brauchst.

## Benutzung {#using-it}

| Steuerung | Wirkung |
|---|---|
| **In Bibliothek speichern** | Speichert das aktuelle Level. Ein Kartenbild wird als PNG mit seinen zwei Ankern gespeichert, ein Modell als seine verarbeiteten Puffer. Das Fenster sagt *Gespeichert. Beim nächsten Mal lädt es sofort.* |
| Liste der Bibliothek | Eine Zeile je gespeichertem Level: Name (mit seiner gespeicherten Größe beim Darüberfahren), Dreiecke bei einem Modell oder Breite in Pixeln bei einem Bild. |
| ▸ (*Laden*) | Lädt den Eintrag als aktuelles Level. |
| ✕ (*Löschen*) | Entfernt den Eintrag. |
| Nutzungszeile | `Benutzt X von Y.` - die Speicherschätzung des Browsers für diese Seite. |

Ist nichts gespeichert, sagt die Liste *Leer. Lade eine Karte oder ein Modell und dann „In Bibliothek speichern“.*

## Was gespeichert wird {#what-is-stored}

| Art | Gespeichert | Nicht gespeichert |
|---|---|---|
| Kartenbild | Das Bild (PNG), seine Größe, seine Anker | Höhe, Spiegelung, Deckkraft, Helligkeit, Entsättigung - auf die Standardwerte zurückgesetzt (Höhe = das tiefste Y des aktuellen Datensatzes, Spiegelung an) |
| 3D-Level | Vertices, Vertex-Farben, Texturkoordinaten, ihre Kacheln und der Texturatlas, Boden-, Struktur- und Wasserdreiecke, Strukturkanten, Dreieckszahlen | Teilnamen und Gründe der Klassifizierung sowie jede Darstellungseinstellung - auf die Standardwerte eines frischen Imports zurückgesetzt |

Ein Modell aus der Bibliothek hat keine Teilliste. Seine Grenzen und die Band der Bodenhöhe werden aus seinen Vertices neu berechnet.

## Wo sie liegt {#where-it-lives}

In der IndexedDB des Browsers, Datenbank `3dheat`, Objektspeicher `levels`, für den Ursprung der Seite (die Adresse in der Adressleiste des Browsers). Sie gehört zu diesem Browserprofil. Ein anderer Browser, ein anderes Profil oder eine andere Adresse (zum Beispiel `localhost` statt `127.0.0.1`) sieht eine andere, leere Bibliothek. Löschst du die Daten der Seite im Browser, ist sie weg. Einträge, die ältere Versionen ohne Strukturen, Farben oder Wasser gespeichert haben, werden weiterhin geladen.
