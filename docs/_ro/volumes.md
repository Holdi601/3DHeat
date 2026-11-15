---
title: "Volume și comparație"
parent: "Filtre și instrumente"
nav_order: 6
lang: "ro"
source: "volumes.md"
source_hash: "25cc132dbe25"
translated: true
outdated: false
---

# Volume și comparație

Un **volum** este o cutie invizibilă (sau un cilindru, sau o sferă) pe care o desenezi în jurul unui loc, ca să întrebi: ce s-a întâmplat aici? Folosește-l ca să numeri eliminările la un pod, ca să compari două dealuri sau ca să arăți doar activitatea dintr-o zonă.

```
 vedere de sus           Desenezi o formă ->  vizualizatorul numără
 +------------+          ce este înăuntru:
 |   ( A )    |           rânduri, jucători, eliminări, timp ...
 |        [B] |          Compară A cu B, unul lângă altul.
 +------------+
```

![Trei volume pe valea demonstrativă: două cilindri în jurul dealurilor, o cutie în jurul satului](../assets/img/en/volumes.webp)

Volumele măsoară ce se întâmplă în interiorul lor, filtrează vizualizarea după ele, își exportă rândurile și pot fi comparate unul lângă altul. Vezi și [glosarul](glossary.md) pentru rând, persoană și meci.

## Desenează un volum {#draw-a-volume}

1. Deschide **Volume** în bara laterală.
2. Alege un instrument și desenează în vizualizarea 3D sau pe harta 2D. Podeaua și tavanul pornesc de la date, de dedesubt. Esc anulează.
3. Dă clic pe volum ca să-l selectezi; apar **Statistici** lui.

| Instrument | Cum se desenează |
|---|---|
| **Cutie** | Trage un dreptunghi (Shift: un pătrat). Un clic pune o cutie implicită. |
| **n-gon** | Trage din centru (Shift îl păstrează regulat). *Colțuri* alege n, de la 3 la 64 (implicit 8, deci butonul arată **8-gon**). |
| **Poligon** | Dă clic pe colțuri; închide cu dublu clic, Enter sau un clic pe primul colț. Backspace șterge ultimul colț. |
| **Cilindru** | Trage raza. |
| **Sferă** | Trage raza; se sprijină pe sol. |

## Editare {#edit}

- Dă clic pe un volum ca să-l selectezi. Trage de corpul lui ca să-l muți, de colțuri ca să-i schimbi forma (Shift pe un colț scalează).
- Mânerele **galbene** stabilesc podeaua și tavanul, mânerul **cyan** îl rotește.
- Alt+trage copiază, Del șterge, Ctrl+Z / Ctrl+Y anulează și refac, Ctrl+D dublează. **Elimină tot** șterge fiecare volum.
- Valori exacte: Podea, Tavan, Rotație / Tangaj / Ruliu (cutii), Rază (sfere, cilindri).

Fiecare rând de volum are o bifă de afișare, o culoare, un nume, **include** sau **exclude**, dublare și ștergere. Volumele se salvează în browser pentru fiecare set de date, iar **Salvare...** / **Încarcă...** scriu și citesc un fișier `volumes.json`.

## Filtrează vizualizarea {#filter-the-view}

| Filtru | Efect |
|---|---|
| **Arată tot** (implicit) | Volumele doar măsoară. |
| **Doar în interior** | Căldura, reluarea și [analiza lovirilor](hit-analysis.md) desenează doar ce este în volumele incluse și în afara celor excluse. |
| **Ascunde interiorul** | Invers. |

Filtrul GPU ia până la 8 volume cu 64 de puncte de contur în total; un „!” marchează un volum peste această limită. Statisticile și exportul îl numără în continuare.

## Statistici {#statistics}

Zona **Statistici** urmează filtrele, fereastra de timp și grupurile ascunse. *Selectat* arată volumul ales, *Compară tot* pune fiecare volum unul lângă altul. Arată:

- **Rânduri în interior (afișate)** și **Rânduri în interior (toate datele)**, **Jucători**, **Echipe**, **Meciuri**, **Timp în interior**, **Intrări / ieșiri**, **Căldură maximă**, **Căldură medie**, **Volum / amprentă** și o histogramă **Când**;
- pentru fiecare coloană: categorii cu **Lift** (ponderea din interior împărțită la ponderea din toate datele afișate) și numere cu interval, mediană și percentilele 5-95.

**Statistici ca CSV / JSON** le salvează. **Exportă datele din interior** scrie rândurile din interior ca CSV sau Parquet (*Doar rândurile afișate* pornit implicit), pentru un volum sau pentru toate, cu o coloană care spune ce volum conține fiecare rând.

## Compară volumele {#compare-volumes}

Cu două sau mai multe volume vizibile, apasă **Compară...**.

1. Desenează trei volume, de exemplu Dealul de vest, Dealul de est și Satul.
2. Apasă **Compară...** sub Statistici.
3. La **Tabel**, citește diferența fiecărei valori față de primul volum.
4. Trece la **Bare** ca să vezi ponderile ca bare.

![Tabelul Compară volumele: rânduri, timp în interior, jucători și altele pentru fiecare volum, cu diferența față de primul](../assets/img/en/compare.webp)

| Vedere | Arată |
|---|---|
| **Tabel** | Rânduri, timp în interior, jucători, meciuri, echipe, intrări, ieșiri, vizite, lungimea vizitelor, eliminări, morți, eliminări la moarte, eliminări pe minut, timp pe jucător, coloane de valoare; grupate după evenimente, clasa vehiculului, jucător sau IA, echipă și direcție. Fiecare valoare arată diferența ei față de primul volum și o mărime a efectului (neglijabil, mic, mediu, mare). Dă clic pe antetul unui volum ca să sortezi după distanța față de primul. |
| **Bare** | Numere sau ponderi după eveniment, clasă, actor, echipă sau direcție. Dă clic pe o bară ca să filtrezi vizualizarea după ea. |
| **Pe parcursul meciului** | Un grafic pentru fiecare volum peste minutele meciului: prezență, rânduri sau eliminări. Dă clic ca să sari acolo. |
| **Vizite** | Grafice tip cutie și violon cu cât durează vizitele (scară logaritmică). |
| **Flux** | Unde merg traseele după ce ies din fiecare volum: o matrice de tranziții sau panglici de flux. |

![Vederea Bare: tipurile de evenimente pe volum, ca ponderi](../assets/img/en/compare-bars.webp)

## Sfaturi {#tips}

- Pornește de la o constatare: în [Observații](insights.md), **Volum aici** adaugă un cilindru în jurul locului constatării.
- **Defalcare...** deschide [Defalcarea](breakdown.md) pentru volumul ales: cine și ce se descurcă cel mai bine înăuntru.
- [Căldura direcțională](directional-heat.md) poate reprezenta grafic direcțiile din interiorul volumului ales.
- [Fila Vehicule](hit-analysis.md#restrict-to-an-area) folosește aceleași volume ca filtru de zonă.
