---
title: "Filteren a Werkzeich"
nav_order: 6
has_children: true
lang: "lb"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filteren a Werkzeich

Dës Panelen loosse Iech wielen, *wéi eng* Daten Dir kuckt, an dat miessen, wat Dir gesitt. Benotzt se, wann d'Bild ze voll ass: weist eng Equipe, eng Persoun, eng Plaz oder ee Stack vun engem Gebai.

All Panel schränkt d'Daten an, an se schaffen zesummen: eng Zeil gëtt nëmmen gezeechent, wann se **all** dës Tester passéiert (AND).

```
all rows -> Filters -> Teams -> Entities -> Slice -> picture
              AND       AND       AND        AND
```

Beispill: hakt *Tank* ënner Filteren of, verstoppt d'Rout Equipe ënner Teams, a wielt eng Persoun ënner Entitéiten. Dir gesitt nëmmen dës Persoun hir Beweegungen ausser de Panzer.

| Panel | Wat et mécht | Hëtztmodi | Figuren-Overlay |
|---|---|---|---|
| [Filteren](filters.md) | Beräich- an Kategoriefilter op all Kolonn, déi beim Lueden behalen ass. | Jo | Nee (nëmmen Kolonnefilter) |
| [Ënnerscheedsopdeelung](difference.md#the-difference-split-panel) | Wéi Zeilen addéieren an wéi se ofzéien, am Ënnerscheed-Modus. | Nëmmen Ënnerscheed | Nee |
| [Teams](teams-list.md) | All Equipe weisen oder verstoppen; Equipen op déi + oder - Säit setzen. | Jo | Jo |
| [Entitéiten](entities.md) | Eenzel Spiller wielen. | Jo | Jo |
| [Schnëtt](slice.md) | En Dall aus dem Level an der Hëtzt ausschneiden, fir an Gebaier ze kucken. | Jo, an de Level | Nee |
| [Mooss](measure.md) | En Miessband, an d'Hëtztwäert ënnert dem Zeiger. | Jo | Jo |
| [Volumen a Verglach](volumes.md) | 3D-Forme zéechnen a froen, wat dra geschitt ass. Kann och filteren. | Jo | Jo |
| [Opschlësselung](breakdown.md) | Wéi Gefier, Spiller oder Waff an enger Plaz am beschte ass. | n/a | n/a |

D'Treffer-Analys huet hiren eegene Gebitsfilter am **Gefierer**-Tab: kuckt [Treffer-Analys](hit-analysis.md).

Begrëffer wéi Heatmap, Zeil, Persoun a Grupp sinn am [Glossar](glossary.md) erkläert.

## Wou d'Panelen sinn {#where-the-panels-are}

D'Säitelleescht vum Heatmap-Tab, vun uewen no ënnen:

1. Modus-Leescht a Sessiounswiel
2. Quell, Kolonnenzouweisung, Datesaz
3. Weeër (Linnen-Modus)
4. D'Hëtzt-Panelen, oder d'Equipenusiicht
5. Ënnerscheedsopdeelung
6. Teams
7. Entitéiten
8. Filteren
9. Hannergrond / Level
10. Schnëtt
11. Mooss
12. Kamerapfad & Rendering
13. Leeschtung
14. Kamera & Zeen

De Match-Tab weist d'Modus-Leescht, de Sessiounswiel, säin eegent Panel, Filteren, Hannergrond / Level an Kamera & Zeen.
