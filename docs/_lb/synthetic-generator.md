---
title: "Synthetesche Generator"
parent: "Daten astellen"
nav_order: 5
lang: "lb"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---


# Synthetesche Generator

Keng eege Daten? Drécken Dir op ee Knäppchen, an 3DHeat erfënnt fir Iech e Scheinkampf, sou kleng oder sou grouss wéi Dir wëllt.

1. Maacht de Panel **Datesaz** an der Heatmap-Säitelëscht op (ënner **Quell**).
2. Scrollt bis zu **Synthetesche Generator**.
3. Setzt **Zeilen (Milliounen)**. Probéiert éischt 1: de Standard vun 8 Milliounen ass fir en éischten Versuch ze schwéier.
4. Dréckt **Generéieren**.

![1 Million Zeilen, 8 Teams, gezeechent am Equipen-Heat](../assets/img/en/synthetic-generator-team-heat.webp)

De Panel **Datesaz** kann en Datesaz generéieren, anstatt een ze lueden. Hie dient zwee Saachen: fir d'Visualisatioun ze probéieren ouni eege Daten, an fir ze kucken, ob eng gewëssen Zuel vu Zeilen, Sprite-Radius a Budget op engem Rechner eng brauchbar Bildfrequenz hält, *ier* Dir eng grouss richteg Last drop leet. Seng Bewegung ass wéi bei engem Battle-Royale-Match geformt - d'Teams fänken wäit auserneen un an da ginn se zesummegedréckt -, well eenheetleche Lärm bei all Budget gutt ausgesäit a genau d'Artefakter verstoppt, déi et wäert ass ze fänken.

## Steierungen {#controls}

| Steierung | Standard | Bedeitung |
|---|---|---|
| **Zeilen (Milliounen)** | 8 | Zeilen, déi generéiert ginn. Fir jiddereen Spiller op eng ganz Zuel vu Schrëtt erofgerënnt. |
| **Teams** | 8 | Zuel vun de Gruppen (mindestens 1). |
| **Pro Equipe** | 12 | Spiller pro Gruppe (mindestens 1). |
| **Hallef Kaartebreet (m)** | 4000 | Déi halleft Breet vum spillbare Beräich op X an Z. |
| Schätzungslinn | | "≈ X GB RAM, Y GB op der GPU nom Quantiséieren." (ongeféier 26 Byte RAM an 8 Byte GPU pro Zeil). |
| **Generéieren** | | Generéiert am Lieser-Hannergrond mat Fortschrëtt an ersetzt all gelueden Datesaz. |

D'Generatioun leeft am Hannergrond-Worker, sou datt zéng Milliounen Zeilen d'Säit net afréieren.

## Wat generéiert gëtt {#what-it-generates}

Aus [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Kolonnen:** Positioun, Zäit, Persoun (`P000`, `P001`, ...), Gruppe (`Team 1`, `Team 2`, ...), Gier an Neigung, an Liewensdauer. Keng Sitzungskolonn a keng Filterkolonnen.
- **Zäit:** eng Probe pro Spiller all 0,25 s, ugefaangen bei 0 (relativ Zäit, keng Wanduhr).
- **Bewegung:** all Team fänkt a sengem eegene Sektor vun engem Ring u, op 55-95 % vun der halwer Breet. E sécheren Krees, dee bei der Mëtt sëtzt (zoufälleg versat bis zu engem Véierel vun der halwer Breet), schrumpft a sechs Phasen op 8 % vun der halwer Breet, mat Plateauen; all Spiller steuert op e wanderen Punkt dran, mat Dämpfung a Lärm. D'Héicht wellt sech tëscht 0 an 220 m.
- **Blécksrichtung:** Gier no der Fuerrichtung, Neigung aus der senkrechter Geschwindegkeet.
- **Widderhuelbar:** de Zoufallssamen ass fest (1337), dofir ginn déiselwecht Astellungen ëmmer déiselwecht Daten.

All Heat-Modus, Box-Replay an Linn-Heat (ganz Spuere, well et keng Eventkolonn gëtt) funktionéiere mat deenen. Och d'Liewensdauer-Geschicht funktionéiert.
