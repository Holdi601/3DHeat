---
title: "Filtre și instrumente"
nav_order: 6
has_children: true
lang: "ro"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filtre și instrumente

Aceste panouri te lasă să alegi *ce* date vezi și să măsori ce vezi. Folosește-le când imaginea este prea aglomerată: arată o singură echipă, un singur jucător, un singur loc sau un singur etaj al unei clădiri.

Fiecare panou restrânge datele, iar ele lucrează împreună: un rând se desenează doar dacă trece prin **toate** (ȘI).

```
toate rândurile -> Filtre -> Echipe -> Entități -> Secțiune -> imagine
                    ȘI        ȘI        ȘI          ȘI
```

Exemplu: debifează *Tank* la Filtre, ascunde echipa Red la Echipe și alege un jucător la Entități. Vezi doar mișcările non-tanc ale acelui jucător.

| Panou | Ce face | Moduri de căldură | Suprapunerea figurilor |
|---|---|---|---|
| [Filtre](filters.md) | Filtre pe interval și pe categorie, pe orice coloană păstrată la încărcare. | Da | Nu (doar filtre pe coloane) |
| [Împărțire pentru diferență](difference.md#the-difference-split-panel) | Ce rânduri adună și ce rânduri scad, în modul Diferență. | Doar Diferență | Nu |
| [Echipe](teams-list.md) | Arată sau ascunde fiecare echipă; pune echipele pe partea + sau -. | Da | Da |
| [Entități](entities.md) | Alege jucători individuali. | Da | Da |
| [Secțiune](slice.md) | Taie o placă din nivel și din căldură, ca să vezi în interiorul clădirilor. | Da, și nivelul | Nu |
| [Măsurare](measure.md) | O riglă și valoarea căldurii sub cursor. | Da | Da |
| [Volume și comparație](volumes.md) | Desenează forme 3D și întreabă ce s-a întâmplat înăuntru. Poate filtra și el. | Da | Da |
| [Defalcare](breakdown.md) | Ce vehicul, jucător sau armă se descurcă cel mai bine într-un loc. | nu se aplică | nu se aplică |

Analiza lovirilor are propriul filtru de zonă în fila **Vehicule**: vezi [Analiza lovirilor](hit-analysis.md).

Termeni precum hartă termică, rând, persoană și grup sunt explicați în [glosar](glossary.md).

## Unde sunt panourile {#where-the-panels-are}

Bara laterală a filei Hartă termică, de sus în jos:

1. Bara de moduri și selectorul de sesiune
2. Sursă, Maparea coloanelor, Set de date
3. Trasee (modul Linii)
4. Panourile de căldură sau Vizualizarea echipelor
5. Împărțire pentru diferență
6. Echipe
7. Entități
8. Filtre
9. Fundal / nivel
10. Secțiune
11. Măsurare
12. Traseu cameră și randare
13. Performanță
14. Cameră și scenă

Fila Meci arată bara de moduri, selectorul de sesiune, panoul ei propriu, Filtrele, Fundal / nivel și Cameră și scenă.
