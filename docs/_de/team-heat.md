---
title: "Team-Intensität"
parent: "Intensitätsmodi"
nav_order: 6
lang: "de"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: false
---

# Team-Intensität

Team-Intensität zeigt, wo jedes Team war, jedes Team in seiner eigenen Farbe. Wo sich Teams überlappen, mischen sich die Farben.

**Team-Intensität** (Taste 3) ist das Dichtefeld von [Intensität](heat.md), bei dem jede [Gruppe](glossary.md) einen eigenen Farbton bekommt. Wo sich Gruppen überlappen, mischen sich ihre Farbtöne; ein ausgeglichener Kampf wird neutral. Die Deckkraft trägt die Dichte weiterhin genau wie in den anderen Modi, sodass das Bild zugleich *wie viel* und *wessen* beantwortet. Sie braucht eine Gruppenspalte.

![Team-Intensität: jede Seite in ihrer eigenen Farbe; wo sie sich überlappen, mischen sich die Farben](../assets/img/en/heat-teams.webp)

Sie ist nicht das [Figuren-Overlay](box-replay.md): Das zeichnet eine Figur pro Person; dies ist ein Intensitätsfeld, eingefärbt nach derselben Spalte.

## So benutzt du es {#how-to-use-it}

1. Drücke `3` (oder wähle **Team-Intensität** in der Modusleiste).
2. Öffne **Heatmap-Farben**. Die Farbfelder zeigen die Farbe jeder Gruppe; fahre über ein Farbfeld für den Teamnamen.
3. Sieht alles grau aus, erhöhe die **Farbtrennung**.
4. Wähle eine Gruppe in der [Teamliste](teams-list.md) ab, um sie herauszunehmen; die Farben der anderen bleiben, wo sie waren.

## Regler {#controls}

Im Abschnitt **Heatmap-Farben**:

| Regler | Voreinstellung | Bedeutung |
|---|---|---|
| Farbfelder | | Die Farbe jeder Gruppe, für die ersten 12 Gruppen, danach *+N weitere*. Fahre darüber für den Gruppennamen und die Farbe. |
| **Farbtrennung** | 1,4 | Wie weit eine Mischung von Neutral weggedrückt wird, 0-4. 0 macht alles grau; 1 ist der wahre Durchschnitt; über etwa 2 verlassen die hellsten Mischungen den darstellbaren Bereich und werden je Kanal begrenzt, wodurch sich ihr Farbton verschiebt. |
| **Deckkraftverlauf (die Farbe kommt von der Gruppe)** | der Standard-Intensitätsverlauf | Hier wird nur das **Alpha** des Verlaufs genutzt: transparent, wo nichts ist, deckend oben. Seine Farben werden ignoriert. |

Alle anderen Intensitätsregler – Form, Sättigung, Reaktion, Mindestintensität, Tiefe, Culling – funktionieren wie in [Intensität](heat.md).

Die [Teamliste](teams-list.md) zeigt in diesem Modus die Team-Intensitätsfarbe jeder Gruppe als Farbfeld. Eine ausgeblendete Gruppe lässt die Farbe jeder anderen Gruppe, wo sie war: Die Farbtöne richten sich nach der Gesamtzahl der Gruppen, nicht nach dem, was eingeschaltet ist, sodass zwei Bilder vergleichbar bleiben.

## Die Palette {#the-palette}

Aus [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Die Farben liegen auf der **Oklab**-Ebene bei fester Helligkeit (0,7) und Buntheit (0,115), sodass jede Gruppe gleich hell ist und eine rote Gruppe nicht heißer wirkt als eine blaue.
- Bei *n* Gruppen wird der Farbkreis in *n* gleiche Teile geteilt, und Gruppe *i* nimmt die **Mitte** ihres Teils, `(i + 0,5) / n` einer Umdrehung. Zwei Gruppen liegen so weit auseinander, wie es die Anzahl erlaubt, und Gegensätze bleiben Gegensätze, egal wie die Anzahl ist.
- Höchstens **16** verschiedene Farbtöne werden genutzt. Bei mehr Gruppen werden die IDs durch wiederholtes Halbieren verteilt (bit-umgekehrte IDs: 0, ½, ¼, ¾, ⅛, …), damit benachbarte IDs keinen Farbton teilen; Gruppen über 16 teilen sich zwangsläufig einen.
- Eine Gruppe, deren Bezeichnung „keine Gruppe“ bedeutet – `0`, leer, `none`, `unknown`, `null` oder `-1`, ohne Beachtung der Groß-/Kleinschreibung –, wird **neutral grau** gezeichnet, statt ein Stück des Kreises zu bekommen. Nur die erste solche Bezeichnung in der Gruppenliste wird so behandelt.

Die Standardtrennung ist 1,4 statt 1, weil bei 1 eine Mischung aus fünf gleichmäßig verteilten Farbtönen *tatsächlich* grau ist: korrekt und unlesbar. Ein wenig über 1 hält Gleichstände ehrlich und macht zugleich eine Aufteilung 60/40 sichtbar.

## So funktioniert es {#how-it-works}

Das Intensitätsziel hat in diesem Modus vier Kanäle. Jeder Sprite addiert seine Dichte *v* zum ersten Kanal und *v* × die Oklab-Koordinaten *a* und *b* der Gruppe zum zweiten und dritten. Bei der Komposition ist die Mischung eines Pixels der dichtegewichtete Mittelwert: *a* = G / R, *b* = B / R, skaliert mit der Farbtrennung und bei der Helligkeit der Palette in sRGB umgewandelt. Das Teilen durch die akkumulierte Dichte macht den Farbton unabhängig davon, wie viele Daten da sind – und deshalb wirken alle Dichteregler nur auf die Deckkraft.

Das Ziel mit vier Kanälen kostet bei gleicher Auflösung das Vierfache an GPU-Speicher wie das Intensitätsziel mit einem Kanal.
