---
title: "Nivoi i geometrija pozadine"
nav_order: 16
has_children: true
lang: "bs"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: false
---

# Nivoi i geometrija pozadine

Nivo je 3D mjesto na kojem se igra odvijala - mapa, grad, staza. Stavite ga iza svojih podataka i možete vidjeti *gdje* je toplota. Panel **Pozadina / nivo** (vidi [Rječnik pojmova](glossary.md) za „nivo”) daje tri vrste konteksta:

- **slika mape**, georeferencirana s dvije tačke - vidi [Slike mapa](map-images.md);
- **3D nivo** - `.glb`, `.gltf`, `.obj`, `.stl` ili `.ply` - podijeljen na tlo, strukture i vodu i pojednostavljen pri uvozu - vidi [3D nivoi](model-levels.md) i [Izgled nivoa](level-appearance.md);
- **pozadina svijeta** - za snimak koji kaže gdje je na Zemlji (Tacview ACMI datoteka), stvarni teren, putevi, voda, aerodromi i zgrade, preuzeti iz otvorenih podataka - vidi [Pozadina svijeta](world-backdrop.md).

Kada ništa nije učitano, scena je tamna s mrežom i obojenim osama (**Mreža** i **Ose** u [Kamera i scena](camera.md)), a panel kaže *Ništa nije učitano - scena prikazuje mrežu i ose. Dodajte sliku mape ili 3D model nivoa da toplota dobije kontekst.*

Nivo dijele sve tri kartice: kurs učitan u kartici Analiza utrke je isti nivo koji prikazuje toplotna mapa.

![Panel Pozadina / nivo s učitanim nivoom: dugmad Slika mape i 3D model, Ratište, Neprozirnost, Svjetlina, Spremi u biblioteku i spisak Biblioteke](../assets/img/en/level-panel.webp)

## Stavite nivo iza svojih podataka {#put-a-level-behind-your-data}

1. Prvo učitajte svoje podatke ([Unos podataka](getting-data-in.md)), da se nivo uklopi u njih.
2. Otvorite **Pozadina / nivo** u bočnoj traci.
3. Pritisnite **Slika mape…** za sliku ili **3D model…** za 3D nivo, i izaberite datoteku. Za snimak iz stvarnog svijeta, koristite **Stvarni svijet kao pozadina** ili **Ratište** umjesto toga.
4. Sačekajte da se red napretka završi. Veliki model se prvo pojednostavljuje (vidi **Cilj pojednostavljivanja** dolje).
5. Pritisnite **F** u prikazu da uokvirite sve. Koristite **Neprozirnost** i **Svjetlinu** dok toplota ne izbije iz nivoa.
6. Pritisnite **Spremi u biblioteku** ako ćete nivo ponovo koristiti ([Biblioteka nivoa](level-library.md)).

## Šta nivo radi za toplotu {#what-a-level-does-for-the-heat}

- **Zaklanja.** Tačke podataka iza njega se priguše po površini, a tačke iza terena se sakrivaju ([Dubina i culling](depth-and-culling.md)). Bez nivoa nema zaklanjanja.
- **Presijeca** ga [Presjek](slice.md) i, uz *Sijeci i nivo*, [culling po udaljenosti](depth-and-culling.md#distance-culling), zajedno s toplotom.
- To je jedina stvar koju [dubina polja](camera.md#depth-of-field) zamućuje, pored mreže i kutija.
- 3D nivo **proširuje daleku ravan kamere** kada je veći od podataka: bliska i daleka ravan se kalibriše iz skupa podataka, a izvezena mapa široka nekoliko kilometara inače bi cijela ostala iza daleke ravni i ostavila prazan prikaz. Daleka ravan postaje 3 × horizontalni opseg nivoa kada je to veće, bliska ravan se pomjera s njom (najmanje daleka / 100.000) da bi se očuvala preciznost dubine od koje zavisi zaklanjanje, a brzina leta se podiže na najmanje opseg / 12. Ravan se nikada ne sužava, samo proširuje.

## Panel, od vrha prema dnu {#the-panel-top-to-bottom}

| Dio | Detalji |
|---|---|
| **Slika mape…**, **3D model…** | Učitava jedan; zamjenjuje trenutni nivo. |
| **Stvarni svijet kao pozadina**, **Zaboravi pločice mape** | Samo za skup podataka s geografskom referencom: gradi stvarno mjesto ispod kao nivo, ili briše preuzete pločice. [Pozadina svijeta](world-backdrop.md) |
| **Cilj pojednostavljivanja** | Budžet trouglova za sljedeći uvoz modela: *Puno - bez pojednostavljivanja* (podrazumijevano), *Visoko - 8M*, *Srednje - 3M*, *Nisko - 800k*, *Silueta - 100k*. [3D nivoi](model-levels.md#simplification) |
| Napredak i **Otkaži** | Dok se dekodira ili uvozi. |
| Napomena o uvozu | Trouglovi prije i poslije, podjela na tlo / strukture / vodu, korišteni nivo detalja. |
| Naziv i veličina | `širina×visina px · x × z m/px` za sliku, `N trouglova (od M)` za model. |
| **Neprozirnost**, **Svjetlina** | Oba tipa. |
| Kontrole slike | **Smanji zasićenost**, **Obrni sjever/jug**, **Postavljanje** (dvije tačke), **Prilagodi granicama podataka**, **Visina**. [Slike mapa](map-images.md) |
| Kontrole modela | Reljef tla, voda, trouglovi tla, žičani prikaz, tekstura, uhvaćena boja, strukture, klasifikacija dijelova. [Izgled nivoa](level-appearance.md) |
| **Spremi u biblioteku**, **Ukloni** | [Biblioteka nivoa](level-library.md); Ukloni izbacuje nivo. |
| **Biblioteka** | Nivoi sačuvani u ovom pregledniku. [Biblioteka nivoa](level-library.md) |

## Stranice u ovom odjeljku {#pages-in-this-section}

- [Slike mapa](map-images.md)
- [3D nivoi](model-levels.md) - formati, dijelovi, klasifikacija, pojednostavljivanje, teksture
- [Izgled nivoa](level-appearance.md) - svaka kontrola za 3D nivo
- [Biblioteka nivoa](level-library.md)
- [Pozadina svijeta](world-backdrop.md) - stvarni svijet ispod snimka, iz otvorenih podataka

Kako dobiti nivoe iz igara i motora pitanje je za zasebne alate izvoznike (vidi [README](https://github.com/Holdi601/3DHeat/blob/main/README.md) repozitorijuma); ugovor u koji pišu sažet je u [3D nivoi](model-levels.md#the-exporter-contract).
