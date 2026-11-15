---
title: "Match-Replay"
parent: "Replay"
nav_order: 1
has_children: true
lang: "de"
source: "match-replay.md"
source_hash: "b02fd1676a6f"
translated: true
outdated: false
---

# Match-Replay

Das Replay ist ein Film des Matches, in dem jeder Spieler als das gezeichnet wird, was er gefahren hat. Benutze es, um einen Kampf noch einmal anzusehen, eine Einheit zu verfolgen und zu sehen, wer wen getroffen hat.

Schüsse, Treffer, Brände und Wracks werden auf den Einheiten und Zielen im Level gezeichnet. Kameras, Beschriftungen und eine taktische Anzeige helfen dir, den Kampf zu lesen. Kennst du Tacview? [Tacview-Parität](tacview-parity.md) zeigt, wo jedes seiner Werkzeuge zu finden ist.

![Figuren-Replay der Panzer-Demo: Panzer als eigene Figuren, mit Beschriftungen für Name, Fahrzeug und Geschwindigkeit](../assets/img/de/replay-overview.webp)

## Ein Replay starten {#start-a-replay}

1. Lade eine Aufnahme mit **Quelle → Dateien…** oder indem du sie auf das Feld Quelle ziehst (jede Tabelle mit einer **Person**- und einer **Zeit**-Spalte, eine Tacview-Datei, ein konvertiertes Replay, ein [`.3dheat`](container.md)-Match). Siehe [Daten einlesen](getting-data-in.md).
2. Öffne den Tab **Match** und wähle **Figuren-Replay**, oder wähle **Figuren-Overlay** in der Modusleiste des Tabs Heatmap.
3. Wähle unter **Matches im Replay** ein Match, alle auf einmal oder mehrere.
4. Drücke **Abspielen** auf der Zeitleiste (oder `K`). Ziehe die Zeitleiste, um zu springen.

Figuren ersetzen Kästen für jede Einheit, deren Name oder Typ bekannt ist (siehe [Figuren](figures.md)). Daten ohne Name- oder Typspalte werden als Soldaten gezeichnet.

![Der Tab Match: die Auswahl der Matches, der Abschnitt Figuren, die Kameraansichten, Abspielen und die Ereignisliste](../assets/img/de/match-replay-tab.webp)

## Figuren {#figures}

![Ein brennender Panzer in der Umlaufkamera, mit dem Treffer, der ihn getroffen hat](../assets/img/de/replay-tanks.webp)

| Einstellung (Abschnitt **Figuren**) | Standard | Was sie tut |
|---|---|---|
| **Figuren statt Boxen** | an | Aus zeichnet einfache Kästen. |
| **Figurengröße** (mal wahre Größe) | 1 | 1 ist wahre Größe; 0,25 bis 20-fach (logarithmisch). Größer hilft aus der Ferne. |
| **Kleinste Figur am Bildschirm** | 36 px | Weit entfernte Figuren wachsen, damit sie so lang bleiben, 0 bis 200 px; 0 behält die wahre Größe. |
| **In der Ferne**: Figur, Pfeil, Symbol | Figur | Was eine entfernte Einheit wird. |
| **Symbole** | NATO (APP-6) | NATO (APP-6), russische taktische Zeichen, Symbole der **Spielkarte** oder **Nur Formen (farbenblind-sicher)**. |
| **Symbolgröße**, **Meine Seite**, **Feindlich / Neutral**, **Kursstriche** | 28 px (12 bis 64), automatisch, feindlich, an | Wie Symbole aussehen und welche Seite die eigene ist. |
| **Lotlinien** | an | Eine Linie von jeder Einheit senkrecht zum Boden, damit Höhen in 3D lesbar sind. |
| **Lotlinien und Beschriftungen an Waffen** | aus | Linien zum Boden und Beschriftungen an Raketen und Bomben. |
| **Brände an Einheiten** | an | Flammen vom Moment an, in dem eine Einheit brennt, bis das Feuer gelöscht ist. |
| **Treffer an Einheiten** | an | Markierungen, wo Schüsse einschlugen (unten). **Treffer bleiben**: 1 bis 300 Sekunden, oder **Ganzes Leben**. **Schwebende Marker**: Markierungen, die über der Oberfläche gezeichnet werden. |
| **Blick- und Turmlinien** | aus | Gestrichelt: wohin der Spieler schaut; durchgezogen: wohin das Geschütz zeigt. |
| **Gebäude** | massiv | Massive oder durchsichtige Gebäude, wenn das Level sie bemalt. |

### Symbole in der Ferne {#symbols-at-a-distance}

Ist eine Einheit kleiner als **Kleinste Figur am Bildschirm**, kann sie zu einem Symbol werden, das lesbar bleibt. Die Form zeigt die Art (zum Beispiel ein abgerundeter Kasten mit einer Kettenspur für Panzerung); die Farbe zeigt die Seite. Öffne das Menü **Symbole**, um den Stil zu ändern.

![Dieselben sechs Einheiten als NATO-Symbole, russische taktische Zeichen, Symbole der Spielkarte und nur Formen](../assets/img/de/match-replay-symbols-styles.webp)

### Treffermarken, Wracks und Brände {#hit-marks-wrecks-and-fires}

- **Treffermarken** sitzen auf der Oberfläche, auf die der Schuss traf, im Maßstab der Figur. Ihr Aussehen zeigt, was geschah: ein Loch (durchgeschlagen), ein heller Spritzer (nicht durchgeschlagen), eine Furche (abgeprallt), ein Rußstern (Sprengladung). Ein farbiger Ring sagt, was er bewirkt hat: tödlicher Treffer, Modul zerstört, kritisch, schwer, Schaden, kein Schaden, Treffer. Fahre über ein Zeichen, um den Namen der Munition zu sehen.
- Eine zerstörte Einheit wird vom Tod an als **verkohltes** Wrack gezeichnet, bis sie wieder erscheint oder entfernt wird; ihr Symbol ist durchgestrichen.
- **Brände** brennen an einer Einheit vom Moment an, in dem sie Feuer fängt, bis es gelöscht ist.
- **Türme** drehen sich dorthin, wohin die Daten das Geschütz zeigen (oder, ohne diese, wohin der Spieler schaut).

### Waffen, Köder und Leuchtspuren {#weapons-decoys-and-tracers}

Mit **Waffen, Schüsse und Treffer** an (Abschnitt Team-Ansicht) fliegen Raketen, Geschosse, Bomben und Torpedos als eigene Figuren mit einer Rauchspur; Kugeln und Granaten sind Leuchtspuren; Einschläge und Explosionen blitzen auf. Eine Leuchtspur, die **gestrichelt** gezeichnet ist, wurde aus einem Treffer abgeleitet, weil die Daten keinen Schuss hatten. Leuchtraketen und Düppel werden als Köder gezeichnet; sie sind in der Einheitenliste verborgen, solange *Köder und Granaten* nicht angehakt ist.

## Kameras {#cameras}

Klicke auf eine Einheit oder ihre Beschriftung, um ihr zu **folgen**; der Abschnitt **Replay** bietet **Verfolgen**, **Umlauf**, **Cockpit** (mit Head-up-Anzeige, `H`), **Fest**, **Padlock**, **Ziel** und **Satellit**. `V` schaltet sie durch, **Kameraabstand** legt fest, wie weit weg. Esc hört auf.

- **Zwei-Einheiten-Ansicht**: Wähle ein **Ziel** (oder Strg-/Alt-Klick auf eine Einheit), um sie aus der verfolgten heraus anzuschauen; **Tauschen** vertauscht sie.
- **Messen**: Umschalt-Klick auf zwei Einheiten zeigt Peilung, Entfernung und Höhenunterschied zwischen ihnen.
- **2D-Karte** (`M`): Ecke oder ganze Ansicht, mit Spuren und Namen.
- **Lesezeichen** (`B`): speichert den Moment und die Kamera; die eigenen Abschüsse, Tode und Markierungen der Aufnahme werden ebenfalls aufgelistet.
- **Ereignisse**: jedes Ereignis in zeitlicher Reihenfolge; ein Klick springt dorthin. `Bild auf` / `Bild ab` springen zwischen Ereignissen; **Pause bei Ereignis** hält an jedem an.

## Taktische Anzeige {#tactical-display}

![Die Luft-Demo mit der taktischen Anzeige (T): Gelände als Drahtgitter, Abschuss- und Ereignisfelder](../assets/img/de/replay-air-tactical.webp)

Der Abschnitt **Taktische Anzeige** zeichnet, für keine Einheit, die gewählten, alle oder eine Art (Luftfahrzeuge, Boden, Schiffe, Waffen): Geschwindigkeitsvektoren und die Bahn voraus, Nasen- und Auftriebslinien, Radarkegel, Aufschaltungen, Datenverbindungen, Wirkungszonen und -linien, Sichtlinien, wohin Spieler schauen (Sichtkegel), das Zielen des Turms und die aufgezeichnete Kamera.

### Darstellungsstil {#display-style}

`T` (oder der Schalter **Als taktische Anzeige darstellen**) schaltet die Optik auf einen Radarschirm-Stil: Glühen, Umrisse, Höhenlinien, ein Messraster, Scanlinien, Entfernungsringe, Höhenleitern, Felder mit Abschüssen und Ereignissen und eine **Regie**, die die Kamera von selbst zu Ereignissen bewegt.

![Derselbe Luftkampf in der normalen Optik](../assets/img/de/replay-air.webp)

## Ziele {#objectives}

Kommt ein Match mit seinen Zielen, zeichnet der Abschnitt **Ziele** sie auf das Level: Eroberungszonen (mit Besitzer und Eroberungsfortschritt), Spawns, Flugplätze, Gebiete und Bombenziele, jede Ebene einzeln umschaltbar, mit Beschriftungen. Sie sind durch den Boden hindurch zu sehen. Sind mehrere Spielmodi geladen, filtert **Modus** die Matches nach Modus. Die Ziele kommen aus der Match-Datei eines Konverters neben der Aufnahme oder aus einem [`.3dheat`](container.md)-Container.

Rainbow-Six-Siege-Matches bringen ihre Bombenplätze mit: Die zwei Räume jedes Platzes werden als Umrisse mit ihren Namen auf ihren Boden gezeichnet, ermittelt daraus, wo die Spieler standen, während das Spiel den Raum nannte; ein Platz der Karte, der im Match nicht gespielt wurde, kommt als Kreis aus der Platztabelle des Konverters. Im Replay leuchtet der Platz der Runde am Abspielkopf bernsteinfarben, die anderen bleiben grau. Sie gehören zur Ebene der Eroberungszonen.

## Beschriftungen und Statistik {#labels-and-statistics}

- **Beschriftungen**: Regeln pro Art (**Gewählte**, **Luftfahrzeuge**, **Boden**, **Schiffe**, **Waffen**, **KI**): angezeigt oder nicht, welche Werte, und eine **Priorität**, wer den Platz bekommt, wenn sich Beschriftungen überlappen. **Beschriftungen auseinanderhalten** verschiebt eine Beschriftung neben ihre Einheit, wenn sie eine andere verdecken würde, und lässt sie weg, wo kein Platz ist. **Beschriftungsgröße** liegt bei 60 bis 250 %. **Zurück zu Name, Fahrzeug, Höhe und Tempo** setzt die Regeln zurück.
  - Bodeneinheiten beginnen mit Name, Fahrzeug und Geschwindigkeit.
  - Luftfahrzeuge beginnen mit Name, Fahrzeug, Höhe und Geschwindigkeit.
  - Schiffe beginnen mit Name, Fahrzeug, Geschwindigkeit und Kurs.
  - Fahre über eine Einheit, um jeden Wert zu sehen, den sie hat.
- **Statistik**: pro Team und Einheit: Abschüsse, Tode, Schüsse, Treffer, Trefferquote, Starts, Landungen, Zeit in der Luft, Höchstgeschwindigkeit, Höhe und G, Entfernung. CSV-Export.
- **Diagramme**: die Werte einer Einheit über die Zeit, zwei Einheiten im Vergleich, oder ein Wert gegen einen anderen.

## Viele Matches auf einmal {#many-matches-at-once}

Um Hunderte oder Tausende Matches übereinanderzulegen, siehe [Viele Matches auf einmal](many-matches.md). Figurendetails (Rauch, Feuer, andere zeitgesteuerte Effekte): [Figuren im Figuren-Overlay](figure-replay.md). Die Liste der Tacview-Funktionen: [Tacview-Parität](tacview-parity.md), eine Unterseite dieser Seite.
