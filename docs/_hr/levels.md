---
title: "Razine i geometrija pozadine"
nav_order: 16
has_children: true
lang: "hr"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: false
---

# Razine i geometrija pozadine

Razina je 3D mjesto na kojem se igra odigrala - karta, grad, staza. Stavite jednu iza svojih podataka i vidite *gdje* je toplina. Panel **Pozadina / razina** (vidi [Pojmovnik](glossary.md) za „razina”) daje tri vrste konteksta:

- **slika karte**, georeferencirana dvjema sidrima - vidi [Slike karata](map-images.md);
- **3D razina** - `.glb`, `.gltf`, `.obj`, `.stl` ili `.ply` - podijeljena na tlo, građevine i vodu te pojednostavljena pri uvozu - vidi [3D razine](model-levels.md) i [Izgled razine](level-appearance.md);
- **pozadina svijeta** - za snimku koja kaže gdje je na Zemlji (Tacview ACMI datoteka), stvarni teren, ceste, vodu, zračne luke i zgrade, preuzeti iz otvorenih podataka - vidi [Pozadina svijeta](world-backdrop.md).

Bez ičega učitanog scena je tamna s mrežom i obojenim osima (**Mreža** i **Osi** u [Kamera i scena](camera.md)), a panel kaže *Ništa nije učitano - scena prikazuje mrežu i osi. Dodajte sliku karte ili model razine da toplina dobije kontekst.*

Razina je zajednička svim trima karticama: staza učitana na kartici Analiza utrke je ista razina koju prikazuje toplinska karta.

![Panel Pozadina / razina s učitanom razinom: gumbi Slika karte i 3D model, Ratište, Neprozirnost, Svjetlina, Spremi u biblioteku i popis Biblioteke](../assets/img/en/level-panel.webp)

## Stavite razinu iza svojih podataka {#put-a-level-behind-your-data}

1. Prvo učitajte podatke ([Unos podataka](getting-data-in.md)), da se razina prilagodi njima.
2. Otvorite **Pozadina / razina** u bočnoj traci.
3. Pritisnite **Slika karte…** za sliku ili **3D model…** za 3D razinu i odaberite datoteku. Za snimku iz stvarnog svijeta koristite **Stvarni svijet kao pozadina** ili **Ratište**.
4. Pričekajte da redak napretka završi. Veliki model se prvo pojednostavljuje (vidi **Cilj pojednostavljivanja** dolje).
5. Pritisnite **F** u prikazu da uokvirite sve. Koristite **Neprozirnost** i **Svjetlinu** dok toplina ne iskoči iz razine.
6. Pritisnite **Spremi u biblioteku** ako ćete razinu ponovno koristiti ([Biblioteka razina](level-library.md)).

## Što razina radi za toplinu {#what-a-level-does-for-the-heat}

- Ona **zaklanja**: redci iza nje se zatamnjuju po površini, a redci iza terena su skriveni ([Dubina i odbacivanje](depth-and-culling.md)). Bez razine nema zaklanjanja.
- **Reže** je [Presjek](slice.md) i, uz *Reži i razinu*, [odbacivanje po udaljenosti](depth-and-culling.md#distance-culling), zajedno s toplinom.
- To je jedina stvar koju [dubina polja](camera.md#depth-of-field) zamućuje, osim mreže i kutija.
- 3D razina **proširuje daleku ravninu kamere** kad je veća od podataka: bliska i daleka ravnina baždare se prema skupu podataka, a izvezena karta široka nekoliko kilometara inače bi sjedila u cijelosti iza daleke ravnine i ostavila prazan prikaz. Daleka ravnina postaje 3 × vodoravni opseg razine kad je to veće, bliska ravnina se pomiče s njom (najmanje daleka / 100.000) da se očuva preciznost dubine o kojoj ovisi zaklanjanje, a brzina letenja se diže na najmanje opseg / 12. Ona se samo širi, nikad sužava.

## Panel, odozgo prema dolje {#the-panel-top-to-bottom}

| Dio | Pojedinosti |
|---|---|
| **Slika karte…**, **3D model…** | Učitajte jedno; zamjenjuje trenutnu razinu. |
| **Stvarni svijet kao pozadina**, **Zaboravi pločice karte** | Samo za skup podataka sa zemljopisnom referencom: izgradi stvarno mjesto pod njim kao razinu, ili obriše preuzete pločice. [Pozadina svijeta](world-backdrop.md) |
| **Cilj pojednostavljivanja** | Proračun trokuta za sljedeći uvoz modela: *Puno - bez pojednostavljivanja* (zadano), *Visoko - 8M*, *Srednje - 3M*, *Nisko - 800k*, *Siluveta - 100k*. [3D razine](model-levels.md#simplification) |
| Napredak i **Odustani** | Dok se dekodira ili uvozi. |
| Bilješka o uvozu | Trokuti prije i poslije, podjela na tlo / građevine / vodu, korištena razina detalja. |
| Naziv i veličina | `širina×visina px · x × z m/px` za sliku, `N trokuta (od M)` za model. |
| **Neprozirnost**, **Svjetlina** | Za obje vrste. |
| Kontrole slike | **Smanji zasićenost**, **Zamijeni sjever/jug**, **Položaj** (dva sidra), **Prilagodi granicama podataka**, **Visina**. [Slike karata](map-images.md) |
| Kontrole modela | Reljef tla, voda, trokuti tla, žičani okvir, tekstura, uhvaćena boja, građevine, klasifikacija dijelova. [Izgled razine](level-appearance.md) |
| **Spremi u biblioteku**, **Ukloni** | [Biblioteka razina](level-library.md); Ukloni iskrcava razinu. |
| **Biblioteka** | Razine pohranjene u ovom pregledniku. [Biblioteka razina](level-library.md) |

## Stranice u ovom odjeljku {#pages-in-this-section}

- [Slike karata](map-images.md)
- [3D razine](model-levels.md) - formati, dijelovi, klasifikacija, pojednostavljivanje, teksture
- [Izgled razine](level-appearance.md) - svaka kontrola za 3D razinu
- [Biblioteka razina](level-library.md)
- [Pozadina svijeta](world-backdrop.md) - stvarni svijet pod snimkom, iz otvorenih podataka

Kako se razine izvlače iz igara i engine-a stvar je zasebnih alata za izvoz (vidi [README](https://github.com/Holdi601/3DHeat/blob/main/README.md) repozitorija); ugovor u koji pišu sažet je u [3D razine](model-levels.md#the-exporter-contract).
