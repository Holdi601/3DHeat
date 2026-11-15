---
title: "Ravni in geometrija ozadja"
nav_order: 16
has_children: true
lang: "sl"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: false
---

# Ravni in geometrija ozadja

Raven je 3D prostor, kjer se je igra odvijala - zemljevid, mesto, proga. Če jo postavite za svoje podatke, vidite, *kje* je toplota. Plošča **Ozadje / nivo** (glejte [Slovar pojmov](glossary.md) za »raven«) vam da tri vrste konteksta:

- **slika zemljevida**, georeferencirana z dvema sidroma - glejte [Slike zemljevidov](map-images.md);
- **3D raven** - `.glb`, `.gltf`, `.obj`, `.stl` ali `.ply` - razdeljena na tla, konstrukcije in vodo ter poenostavljena ob uvozu - glejte [3D ravni](model-levels.md) in [Videz ravni](level-appearance.md);
- **ozadje sveta** - za posnetek, ki pove, kje na zemlji je (datoteka Tacview ACMI), resnični teren, ceste, vodo, letališča in stavbe, preneseni iz odprtih podatkov - glejte [Ozadje sveta](world-backdrop.md).

Brez naložene ničesar je prizor temen z mrežo in barvnimi osmi (**Mreža** in **Osi** v [Kamera in prizor](camera.md)), plošča pa pove *Ničesar ni naloženo - prizor kaže mrežo in osi. Dodajte sliko zemljevida ali mrežo ravni, da dobi toplota kontekst.*

Raven je deljena med vsemi tremi zavihki: proga, naložena v zavihku Analiza dirke, je ista raven, ki jo kaže toplotni zemljevid.

![Plošča Ozadje / nivo z naloženo ravnjo: gumbi Slika zemljevida in 3D-model, Resnični svet kot ozadje, Neprosojnost, Svetlost, Shrani v knjižnico in seznam Knjižnica](../assets/img/en/level-panel.webp)

## Postavite raven za svoje podatke {#put-a-level-behind-your-data}

1. Najprej naložite podatke ([Uvoz podatkov](getting-data-in.md)), da se raven prilagodi njim.
2. V stranski vrstici odprite **Ozadje / nivo**.
3. Pritisnite **Slika zemljevida…** za sliko ali **3D-model…** za 3D raven in izberite datoteko. Za posnetek iz resničnega sveta uporabite raje **Resnični svet kot ozadje** ali **Bojišče**.
4. Počakajte, da vrstica napredka konča. Velik model se najprej poenostavi (glejte **Cilj poenostavitve** spodaj).
5. Pritisnite **F** v pogledu, da uokvirite vse. Uporabljajte **Neprosojnost** in **Svetlost**, dokler toplota ne izstopa od ravni.
6. Pritisnite **Shrani v knjižnico**, če boste raven uporabljali znova ([Knjižnica ravni](level-library.md)).

## Kaj raven naredi za toploto {#what-a-level-does-for-the-heat}

- **Zakriva**: točke podatkov za njo so zatemnjene po površini, točke za terenom pa skrite ([Globina in izrezovanje](depth-and-culling.md)). Brez ravni ni zakrivanja.
- **Reže** jo [Rez](slice.md) in, z *Reži tudi nivo*, [izrezovanje razdalje](depth-and-culling.md#distance-culling), skupaj s toploto.
- Je edino, kar [globinska ostrina](camera.md#depth-of-field) zamegli, poleg mreže in škatel.
- 3D raven **razširi daljno ravnino kamere**, kadar je večja od podatkov: bližnja in daljna ravnina se umerita iz nabora podatkov, izvožen zemljevid, širok več kilometrov, pa bi sicer ležal popolnoma za daljno ravnino in pustil prazen pogled. Daljna ravnina postane 3 × vodoravni obseg ravni, kadar je to večje, bližnja se premakne z njo (vsaj daljna / 100.000), da ohrani natančnost globine, od katere je odvisno zakrivanje, hitrost letenja pa se dvigne na vsaj obseg / 12. Razširi se le, nikoli zoži.

## Plošča od zgoraj navzdol {#the-panel-top-to-bottom}

| Del | Podrobnosti |
|---|---|
| **Slika zemljevida…**, **3D-model…** | Naložite enega; zamenja trenutno raven. |
| **Resnični svet kot ozadje**, **Pozabi ploščice zemljevida** | Samo za nabor podatkov z geografsko referenco: zgradi resnični kraj pod njim kot raven ali izbriše prenesene ploščice. [Ozadje sveta](world-backdrop.md) |
| **Cilj poenostavitve** | Proračun trikotnikov za naslednji uvoz modela: *Polno - brez poenostavitve* (privzeto), *Visoko - 8M*, *Srednje - 3M*, *Nizko - 800k*, *Silhueta - 100k*. [3D ravni](model-levels.md#simplification) |
| Napredek in **Prekliči** | Med dekodiranjem ali uvozom. |
| Opomba o uvozu | Trikotniki pred in po, razdelitev na tla / konstrukcije / vodo, uporabljena stopnja podrobnosti. |
| Ime in velikost | `širina×višina px · x × z m/px` za sliko, `N trikotnikov (od M)` za model. |
| **Neprosojnost**, **Svetlost** | Obe vrsti. |
| Kontrole slike | **Razbarvaj**, **Obrni sever/jug**, **Postavitev** (dve sidri), **Prilagodi mejam podatkov**, **Višina**. [Slike zemljevidov](map-images.md) |
| Kontrole modela | Reliefi tal, voda, trikotniki tal, žična mreža, tekstura, zajeta barva, konstrukcije, razvrstitev delov. [Videz ravni](level-appearance.md) |
| **Shrani v knjižnico**, **Odstrani** | [Knjižnica ravni](level-library.md); Odstrani raven izprazni. |
| **Knjižnica** | Ravni, shranjene v tem brskalniku. [Knjižnica ravni](level-library.md) |

## Strani v tem razdelku {#pages-in-this-section}

- [Slike zemljevidov](map-images.md)
- [3D ravni](model-levels.md) - formati, deli, razvrščanje, poenostavitev, teksture
- [Videz ravni](level-appearance.md) - vsaka kontrola za 3D raven
- [Knjižnica ravni](level-library.md)
- [Ozadje sveta](world-backdrop.md) - resnični svet pod posnetkom, iz odprtih podatkov

Kako dobiti ravni iz iger in pogonov, je naloga ločenih orodij za izvoz (glejte [README](https://github.com/Holdi601/3DHeat/blob/main/README.md) repozitorija); pogodba, v katero pišejo, je povzeta v [3D ravni](model-levels.md#the-exporter-contract).
