---
title: "Filtri in orodja"
nav_order: 6
has_children: true
lang: "sl"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filtri in orodja

Te plošče vam omogočajo izbrati, *katere* podatke gledate, in izmeriti, kar vidite. Uporabite jih, kadar je slika preveč zaposlena: pokažite eno ekipo, enega igralca, eno mesto ali eno nadstropje stavbe.

Vsaka plošča zoži podatke, delujejo pa skupaj: vrstica se nariše le, če prestane **vse** (IN).

```
all rows -> Filters -> Teams -> Entities -> Slice -> picture
              AND       AND       AND        AND
```

Primer: odkljukajte *Tank* pod Filtri, skrijte ekipo Red pod Ekipami in izberite enega igralca pod Entitetami. Vidite le netankovska gibanja tega igralca.

| Plošča | Kaj naredi | Načini toplote | Prekrivanje figur |
|---|---|---|---|
| [Filtri](filters.md) | Filtri razpona in kategorij na poljubnem stolpcu, ohranjenem ob nalaganju. | Da | Ne (samo filtri stolpcev) |
| [Delitev razlike](difference.md#the-difference-split-panel) | Katere vrstice prištevajo in katere odštevajo, v načinu Razlika. | Samo Razlika | Ne |
| [Ekipe](teams-list.md) | Pokaže ali skrije vsako ekipo; postavi ekipe na stran + ali −. | Da | Da |
| [Entitete](entities.md) | Izbere posamezne igralce. | Da | Da |
| [Rez](slice.md) | Izreže plast iz ravni in toplote, da pogledate v stavbe. | Da, in raven | Ne |
| [Merjenje](measure.md) | Ravnilo in vrednost toplote pod kazalcem. | Da | Da |
| [Prostornine in primerjava](volumes.md) | Riše 3D oblike in sprašuje, kaj se je zgodilo znotraj. Lahko tudi filtrira. | Da | Da |
| [Razčlenitev](breakdown.md) | Kateri vozilo, igralec ali orožje je najuspešnejši na nekem mestu. | ni za | ni za |

Analiza zadetkov ima svoj filter območja v zavihku **Vozila**: glejte [Analiza zadetkov](hit-analysis.md).

Izraze, kot so toplotni zemljevid, vrstica, oseba in skupina, razlaga [slovar pojmov](glossary.md).

## Kje so plošče {#where-the-panels-are}

Stranska vrstica zavihka Toplotni zemljevid, od zgoraj navzdol:

1. Vrstica načinov in izbirnik seje
2. Vir, Dodelitev stolpcev, Nabor podatkov
3. Trase (način Črte)
4. Plošče toplote ali Pregledovalnik ekip
5. Delitev razlike
6. Ekipe
7. Entitete
8. Filtri
9. Ozadje / nivo
10. Rez
11. Merjenje
12. Pot kamere in upodabljanje
13. Zmogljivost
14. Kamera in prizor

Zavihek Tekma prikazuje vrstico načinov, izbirnik seje, svojo ploščo, Filtre, Ozadje / nivo in Kamero in prizor.
