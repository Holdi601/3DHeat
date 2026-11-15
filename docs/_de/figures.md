---
title: "Figuren"
nav_order: 11
has_children: true
lang: "de"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figuren

Eine **Figur** ist ein kleines 3D-Modell dessen, was eine Einheit wirklich ist: ein Panzer, ein Jet, ein Schiff, ein Soldat. Das [Replay](match-replay.md) zeichnet jede Einheit als ihre Figur in wahrer Größe, statt als einfachen Quader.

Es gibt rund 2.000 benannte Fahrzeuge, Flugzeuge, Schiffe, Waffen und Soldaten, alle vom Viewer selbst gebaut.

![Panzer der Demo, als ihre eigenen Figuren gezeichnet](../assets/img/en/replay-tanks.webp)

## Was im Katalog steht {#what-is-in-the-catalogue}

| Bereich | Beispiele |
|---|---|
| Menschen | Soldat stehend, kniend, liegend; Scharfschütze, Panzerabwehr, Sanitäter, Besatzung |
| Boden | Panzer, Schützenpanzer, Luftverteidigung, Artillerie, Lkw und Autos, Züge und Straßenbahnen |
| Luft | Jäger, Erdkampfflugzeuge, Bomber, Transporter, Hubschrauber, vom Doppeldecker bis zum modernen Jet |
| See | Kriegsschiffe nach Klasse, Flugzeugträger, U-Boote, Boote, Handelsschiffe |
| Waffen | Lenkwaffen, Raketen, Bomben, Torpedos, Flares und Düppel |
| Marker | Rauch-, Blend- und Brandgranaten, gelegte Bomben, Flaggen, Spawns, Wegpunkte |

## Wie die Figuren entstehen {#how-the-figures-are-made}

- **Aus veröffentlichten Maßen gebaut.** Die meisten Figuren entstehen im eigenen Figurenbauer des Viewers aus öffentlichen Zahlen: Länge, Breite, Höhe, Laufrollen, Turm und Geschütz, Flügel und Leitwerk. Ihre Form wird dann an öffentlichen Fotos, Zeichnungen und veröffentlichten Maßen abgeglichen. Keine Spielmodelle werden verwendet.
- **Freie Modelle.** Einige Figuren nutzen freie 3D-Modelle (CC0 oder CC BY), wo diese wahrer sind, manchmal kombiniert mit dem gebauten Rumpf. Die Urheber von CC-BY-Werken sind auf [Figurennachweise](figure-credits.md) genannt; CC0-Werke brauchen keine Nennung und stehen dort nicht.
- Jede Figur hat eine volle, eine grobe und eine ferne Version (Detailstufen, LOD), damit Tausende gleichzeitig gezeichnet werden können.

## Welche Figur eine Einheit bekommt {#which-figure-a-unit-gets}

Der Viewer schaut auf die eigenen Spalten der Daten:

1. **Namen** – Spalten namens *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* oder *Figure* – werden mit dem Katalog abgeglichen: genau, über rund 4.000 Aliase (Einheiten-IDs mehrerer Spiele), über den längsten bekannten Anfang (`F-16C_50` ist die F-16C) oder über den kürzesten Figurennamen, der damit beginnt.
2. Ein Name, dessen Figur nicht zum **Typ** der Einheit passt, wird nicht genutzt (ein Lkw namens *Typhoon* ist nicht der Jäger).
3. **Typen** – Spalten namens *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* oder *Domain* – ergeben eine Klassenfigur: Tacview-Tags (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), Kartensymbole oder einfache Wörter (Panzer, Hubschrauber, Infanterie).
4. Daten mit keinem von beidem sind Menschendaten: Jeder ist ein Soldat.

Der einfachste Weg zu den richtigen Figuren ist also eine Spalte `vehicle` mit den echten Namen oder eine Spalte `type` mit Tacview-Tags.

**Meine Einheit erscheint als Quader oder als Soldat.** Füge eine Spalte `vehicle` mit dem echten Namen oder eine Spalte `type` mit einem Tacview-Tag hinzu. Fahre über die Einheit, um zu sehen, welcher Name zugeordnet wurde. Daten mit solchen Spalten, die aber nichts über eine Einheit sagen, lassen sie als Quader; Daten ganz ohne beides werden als Soldaten gezeichnet.

## Einstellungen {#settings}

Der Abschnitt **Figuren** der Replay-Seitenleiste legt die Größe fest, die kleinste Größe am Bildschirm, wozu ferne Einheiten werden (Figur, Pfeil, Symbol) und die Effekte, die auf ihnen gezeichnet werden. Siehe [Match-Replay](match-replay.md#figures). Rauch, Feuer und andere zeitgesteuerte Effekte: [Figuren im Figuren-Overlay](figure-replay.md).

## Ein optionales lokales Figurenpaket {#an-optional-local-figure-pack}

Du kannst auf deinem eigenen Rechner ein optionales Paket mit eigenen Figuren behalten. Seine Figuren ersetzen Katalogfiguren mit denselben Namen. Es ist nie Teil des Repositorys oder eines veröffentlichten Builds; ohne eines ändert sich nichts.
