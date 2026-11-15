---
title: "Niveluri și geometria fundalului"
nav_order: 13
has_children: true
lang: "ro"
source: "levels.md"
source_hash: "1283adc1548a"
translated: true
outdated: false
---

# Niveluri și geometria fundalului

Un nivel este locul 3D în care s-a petrecut jocul - o hartă, un oraș, un circuit. Pune unul în spatele datelor tale și vezi *unde* este căldura. Panoul **Fundal / nivel** (vezi [Glosarul](glossary.md) pentru „nivel”) îți dă trei feluri de context:

- o **imagine de hartă**, georeferențiată prin două ancore - vezi [Imagini de hartă](map-images.md);
- un **nivel 3D** - `.glb`, `.gltf`, `.obj`, `.stl` sau `.ply` - împărțit în teren, structuri și apă și simplificat la import - vezi [Niveluri 3D](model-levels.md) și [Aspectul nivelului](level-appearance.md).
- un **fundal al lumii** - pentru o înregistrare care spune unde este pe pământ (un fișier Tacview ACMI), terenul real, drumurile, apa, aerodromurile și clădirile, descărcate din date deschise - vezi [Fundalul lumii](world-backdrop.md).

Fără nimic încărcat, scena este întunecată, cu o grilă și axe colorate (**Grilă** și **Axe** din [Cameră și scenă](camera.md)), iar panoul spune *Nimic încărcat - scena arată o grilă și axe. Adaugă o imagine de hartă sau o mască de nivel ca să dai căldurii context.*

Nivelul este comun tuturor celor trei file: un traseu încărcat în fila Analiza cursei este același nivel pe care îl arată harta de căldură.

![Panoul Fundal / nivel cu un nivel încărcat: butoanele Imagine de hartă și Model 3D, Teatru, Opacitate, Luminozitate, Salvează în bibliotecă și lista Bibliotecii](../assets/img/ro/level-panel.webp)

## Pune un nivel în spatele datelor {#put-a-level-behind-your-data}

1. Încarcă mai întâi datele ([Încărcarea datelor](getting-data-in.md)), ca nivelul să fie potrivit pe ele.
2. Deschide **Fundal / nivel** în bara laterală.
3. Apasă **Imagine de hartă…** pentru o poză sau **Model 3D…** pentru un nivel 3D și alege fișierul. Pentru o înregistrare din lumea reală, folosește în schimb **Fundalul lumii** sau **Teatru**.
4. Așteaptă ca linia de progres să se termine. Un model mare este mai întâi simplificat (vezi **Ținta simplificării** mai jos).
5. Apasă **F** în vedere ca să încadrezi tot. Folosește **Opacitate** și **Luminozitate** până când căldura iese în evidență față de nivel.
6. Apasă **Salvează în bibliotecă** dacă vei folosi din nou nivelul ([Biblioteca de niveluri](level-library.md)).

## Ce face un nivel pentru căldură {#what-a-level-does-for-the-heat}

- **Ocluzionează**: punctele de date din spatele lui sunt estompate pe suprafață, iar punctele din spatele terenului sunt ascunse ([Adâncime și eliminarea fețelor](depth-and-culling.md)). Fără nivel, nu există ocluzie.
- Este **tăiat** de [Felie](slice.md) și, cu *Taie și nivelul*, de [eliminarea după distanță](depth-and-culling.md#distance-culling), împreună cu căldura.
- Este singurul lucru pe care îl estompează [adâncimea de câmp](camera.md#depth-of-field), în afară de grilă și cuburi.
- Un nivel 3D **lărgește planul îndepărtat al camerei** când este mai mare decât datele: aproape și departe sunt calibrate din setul de date, iar o hartă exportată de câțiva kilometri altfel ar sta complet în spatele planului îndepărtat și ar lăsa o vedere goală. Planul îndepărtat devine 3 × extinderea orizontală a nivelului când aceasta este mai mare, planul apropiat se mișcă odată cu el (cel puțin departe / 100.000) ca să păstreze precizia adâncimii de care depinde ocluzia, iar viteza de zbor este ridicată la cel puțin extindere / 12. Este doar lărgit, niciodată îngustat.

## Panoul, de sus în jos {#the-panel-top-to-bottom}

| Parte | Detalii |
|---|---|
| **Imagine de hartă…**, **Model 3D…** | Încarcă unul; înlocuiește nivelul actual. |
| **Fundalul lumii**, **Uită dalele de hartă** | Doar pentru un set de date cu referință geografică: construiește locul real de sub el ca nivel, sau șterge dalele descărcate. [Fundalul lumii](world-backdrop.md) |
| **Ținta simplificării** | Bugetul de triunghiuri pentru următorul import de model: *Completă - fără simplificare* (implicit), *Înaltă - 8M*, *Medie - 3M*, *Scăzută - 800k*, *Siluetă - 100k*. [Niveluri 3D](model-levels.md#simplification) |
| Progresul și **Anulează** | În timpul decodării sau importului. |
| Nota de import | Triunghiurile înainte și după, împărțirea teren / structuri / apă, nivelul de detaliu folosit. |
| Numele și mărimea | `lățime×înălțime px · x × z m/px` pentru o imagine, `N triunghiuri (din M)` pentru un model. |
| **Opacitate**, **Luminozitate** | Pentru ambele tipuri. |
| Comenzile imaginii | **Desaturare**, **Inversează nord/sud**, **Plasare** (două ancore), **Potrivește la limitele datelor**, **Altitudine**. [Imagini de hartă](map-images.md) |
| Comenzile modelului | Relieful solului, apa, triunghiurile solului, wireframe, textura, culoarea capturată, structurile, clasificarea părților. [Aspectul nivelului](level-appearance.md) |
| **Salvează în bibliotecă**, **Elimină** | [Biblioteca de niveluri](level-library.md); Elimină descarcă nivelul. |
| **Bibliotecă** | Niveluri păstrate în acest browser. [Biblioteca de niveluri](level-library.md) |

## Pagini din această secțiune {#pages-in-this-section}

- [Imagini de hartă](map-images.md)
- [Niveluri 3D](model-levels.md) - formate, părți, clasificare, simplificare, texturi
- [Aspectul nivelului](level-appearance.md) - fiecare comandă pentru un nivel 3D
- [Biblioteca de niveluri](level-library.md)
- [Fundalul lumii](world-backdrop.md) - lumea reală de sub o înregistrare, din date deschise

Cum se scot niveluri din jocuri și motoare este treaba uneltelor separate de export (vezi [README-ul](https://github.com/Holdi601/3DHeat/blob/main/README.md) depozitului); contractul în care scriu este rezumat în [Niveluri 3D](model-levels.md#the-exporter-contract).
