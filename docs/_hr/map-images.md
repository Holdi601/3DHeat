---
title: "Slike karata"
parent: "Razine i geometrija pozadine"
nav_order: 1
lang: "hr"
source: "map-images.md"
source_hash: "f0bbaa4b019e"
translated: true
outdated: false
---

# Slike karata

Slika karte je ravna slika - mini karta, satelitska fotografija, tlocrt - položena ispod vaših podataka da vidite gdje toplina leži. Prikazu kažete gdje slika pripada tako da na njoj zakačite dvije točke na dva mjesta u svijetu (to su "sidra").

## Učitavanje i postavljanje slike karte {#load-and-place-a-map-image}

1. Najprije učitajte podatke ([Učitavanje podataka](getting-data-in.md)).
2. U **Pozadina / razina** pritisnite **Slika karte…** i odaberite sliku. Rastegne se preko područja podataka.
3. Pritisnite **Prilagodi granicama podataka** ako je slika pomaknuta. Sidro 1 ide u gornji lijevi kut slike, sidro 2 u donji desni, na rubove podataka.
4. Ako se toplina ne poklapa sa slikom, odaberite dva orijentira koji su daleko jedan od drugog (na primjer dva suprotna kuta zgrade ili dvije raskrižja). Pročitajte piksel svakog na slici i njegov položaj u svijetu (prijeđite mišem s [ravnalom](measure.md) da pročitate **X** i **Z**).
5. Upišite ih u **Položaj**: za **Sidro 1** **px** orijentira, **py**, **svijet X**, **svijet Z**; isto za **Sidro 2**.
6. Provjerite: putanja ili vruća točka za koju znate da leži na cesti sada bi trebala ležati na toj cesti. Podešavajte brojeve dok ne bude tako.

![Odjeljak Položaj s dva sidra i toplinom nacrtanom na slici karte](../assets/img/en/map-images-placement.webp)

Dva orijentira moraju se razlikovati i u stupcu i u retku piksela, inače panel kaže *Dva sidra dijele piksel-redak ili stupac*.

## Učitavanje {#loading}

Bilo koji format slike koji preglednik može dekodirati. Slika čija je dulja stranica iznad **8192 px** smanjuje se na 8192 (najveća stranica koju GPU mora držati), a panel kaže *Smanjeno s W×H na w×h*.

Pri učitavanju slika se rastegne preko X-Z granica skupa podataka (ili ±1000 jedinica bez skupa podataka), sjever gore, na najnižoj Y vrijednosti skupa podataka. Zadano je **Neprozirnost** 100%, **Svjetlina** 0,7, **Smanji zasićenost** 100%, **Zamijeni sjever/jug** uključeno: bez boje i zatamnjeno, jer je posao pozadine da vam pomogne pronaći vruću točku, a ne da se natječe s njom.

## Kontrole {#controls}

| Kontrola | Zadano | Raspon | Značenje |
|---|---|---|---|
| **Neprozirnost** | 100% | 0–100% | |
| **Svjetlina** | 0,7 | 0–2 (klizanje 64) | |
| **Smanji zasićenost** | 100% | 0–100% | Pozadina sivo, toplina zasićeno. Boja na karti natječe se s bojom u podacima. |
| **Zamijeni sjever/jug** | uključeno | | Koji redak slike je najveći Z svijeta. Ako ga uključite ili isključite uz učitan skup podataka, sidra se ponovno prilagođavaju granicama podataka. |
| **Položaj**: Sidro 1, Sidro 2 | rubovi slike na granicama podataka | | Svako sidro je piksel na slici - **px** (od lijeve strane, 0 do širine) i **py** (od vrha, 0 do visine) - i koordinata svijeta na kojoj se nalazi, **svijet X** i **svijet Z**. Mjerilo i pomak slijede iz para. |
| **Prilagodi granicama podataka** | | | Stavlja sidro 1 na gornji lijevi kut slike, a sidro 2 na donji desni, na X-Z granice podataka. Polazna točka za točan položaj. Treba skup podataka. |
| **Visina** | najniža Y vrijednost skupa podataka | min Y podataka - 500 do max Y + 500 (klizanje max Y + 100.000) | Visina ravnine karte. Stavite je tik ispod podataka da ništa ne bude njome skriveno. |

Redak s imenom pokazuje `širina×visina px · x × z m/px`, veličinu svijeta jednog piksela po svakoj osi.

## U sceni {#in-the-scene}

Slika je jedan teksturirani četverokut na visini. Pri punoj neprozirnosti piše dubinu, pa sudjeluje u [zakrivanju](depth-and-culling.md) kao tlo; ispod 100% neprozirnosti miješa se i ne piše dubinu, pa ništa ne zakriva. [Ravnalo](measure.md) mjeri na njezinoj ravnini. [Biblioteka razina](level-library.md) sprema razinu slike zajedno s njezinim sidrima.

## Dota 2 karta {#dota-2-map}

**Karta Dote 2** uz **Slika karte…** dohvaća crtež trenutne Dota 2 karte koji [OpenDota](https://www.opendota.com) prikazuje na svojim stranicama mečeva i stavlja ga ispod tablica koje [Watcher](https://github.com/Holdi601/3DHeat-Watcher) piše iz Dota 2 snimki ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Slika se dohvaća s opendota.com kad se pritisne gumb i nije dio 3DHeata; crtež najnovije zakrpe uzima se s OpenDotina vlastitog popisa, a crtež 7.40 kad se popis ne može pročitati.

| | |
|---|---|
| Izvor | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Položaj | OpenDotina kalibracija: slika obuhvaća Dota jedinice svijeta od -8192 do 8064 na obje osi (ćelije od 128 jedinica, 64 do 191), sjever gore. S osima tablice snimke (Z gore, Y okrenut) to je svijet X od -8192 do 8064 i svijet Z od -8064 do 8192. Oko 18 jedinica po pikselu. |
| Visina | 0. Heroji stoje na 0 do oko 600. |
| Izgled | Svjetlina 0,8, smanji zasićenost 50%. |

Provjereno na javnoj snimci meča zakrpe 7.40: putanja svakog heroja prati nacrtane trake, a tornjevi, kasarne i drevnici koje snimka postavlja padaju na nacrtane baze. Pogled **Odozgo** prikazuje kartu sa sjeverom na dnu zaslona, kao što prikazuje svaku tablicu Z-gore s okrenutim Y.

Crtež je OpenDotin, Valveove karte; Valve ne odobrava 3DHeat.

### 3D karta {#the-3d-map}

Uz instaliranu Dotu 2, zaseban alat [3DHeat Dota](https://holdi601.github.io/3DHeat-Ext-Dota/) (`heat3d-dota-maps level -o dota.glb`; pokreće ga i Watcherova naredba [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html)) izrađuje kartu u 3D-u iz vlastitih datoteka igre: tlo, litice, voda, drveće i zgrade, u jedinicama i osima tablica iz snimki. Učitajte datoteku jednom putem **3D model…**: preglednik je prepoznaje po dijelovima (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` u `dotaMap.ts`), odmah je sprema u [biblioteku razina](level-library.md), zamjenjujući stariju, i to javlja. Od tada **Karta Dote 2** učitava tu 3D kartu iz biblioteke umjesto da preuzima crtež; ako je u biblioteci nema, preuzima crtež i kaže kako izraditi 3D kartu. Datoteka dolazi iz vaše vlastite instalacije i ostaje na vašem računalu.

## Za razvojne programere {#for-developers}

### Kako sidra postavljaju sliku {#how-the-anchors-place-the-image}

Iz [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), uz sidra *a* i *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Dva sidra određuju i mjerilo i pomak na svakoj osi zasebno, pa karta može biti rastegnuta različito na X i Z, ali ne i rotirana. Sidra se moraju razlikovati u **obje** koordinate piksela; kad dijele redak ili stupac, mjerilo se ne može izvesti, karta se ne crta, a panel kaže *Dva sidra dijele piksel-redak ili stupac*.
