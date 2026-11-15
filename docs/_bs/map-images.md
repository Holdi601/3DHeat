---
title: "Slike mapa"
parent: "Nivoi i geometrija pozadine"
nav_order: 1
lang: "bs"
source: "map-images.md"
source_hash: "d56614ef6bd1"
translated: true
outdated: false
---

# Slike karte

Slika karte je ravna slika - mini-karta, satelitska fotografija, plan sprata - položena ispod tvojih podataka da vidiš gdje toplota stoji. Viewer saznaje gdje slika pripada tako što na njoj označiš dvije tačke i povežeš ih s dva mjesta u svijetu („sidra“).

## Učitaj i postavi sliku karte {#load-and-place-a-map-image}

1. Prvo učitaj podatke ([Unos podataka](getting-data-in.md)).
2. U **Pozadina / nivo** pritisni **Slika karte…** i izaberi sliku. Rasteže se preko područja podataka.
3. Pritisni **Prilagodi granicama podataka** ako je slika pomjerena. Sidro 1 ide na gornji lijevi ugao slike, sidro 2 na donji desni, na ivicama podataka.
4. Ako toplota ne odgovara slici, izaberi dva orijentira koja su daleko jedan od drugog (na primjer dva suprotna ugla zgrade ili dvije raskrsnice). Pročitaj piksel svakog na slici i njegov položaj u svijetu (pređi mišem s [ravnalom](measure.md) da očitaš **X** i **Z**).
5. Upiši ih u **Postavljanje**: za **Sidro 1** orijentirov **px**, **py**, **svijet X**, **svijet Z**; isto za **Sidro 2**.
6. Provjeri: putanja ili žarišna tačka za koju znaš da leži na putu sada treba da leži na tom putu. Podešavaj brojeve dok ne bude tako.

![Odjeljak Postavljanje s dva sidra i toplotom nacrtanom na slici karte](../assets/img/en/map-images-placement.webp)

Dva orijentira moraju se razlikovati i u kolonama piksela i u redovima piksela, inače panel kaže *Dva sidra dijele red ili kolonu piksela*.

## Učitavanje {#loading}

Bilo koji format slike koji browser može dekodirati. Slika čija je duža ivica iznad **8192 px** smanjuje se na 8192 (najveća ivica koju GPU treba da drži), a panel kaže *Smanjeno s W×H na w×h*.

Pri učitavanju slika se rasteže preko X-Z granica skupa podataka (ili ±1000 jedinica bez skupa podataka), sjever gore, na najnižoj Y vrijednosti skupa podataka. Zadano je **Neprozirnost** 100%, **Svjetlina** 0,7, **Smanji zasićenost** 100%, **Obrni sjever/jug** uključeno: smanjeno zasićenje i zatamnjeno, jer posao pozadine je da ti pomogne da nađeš žarišnu tačku, a ne da se takmiči s njom.

## Kontrole {#controls}

| Kontrola | Zadano | Opseg | Značenje |
|---|---|---|---|
| **Neprozirnost** | 100% | 0-100% | |
| **Svjetlina** | 0,7 | 0-2 (klizač 64) | |
| **Smanji zasićenost** | 100% | 0-100% | Siva pozadina, zasićena toplota. Boja na karti bi se takmičila s bojom u podacima. |
| **Obrni sjever/jug** | uključeno | | Koji red slike je najveći Z svijeta. Kada je uključeno/isključeno dok su podaci učitani, ponovo se prilagođavaju sidra granicama podataka. |
| **Postavljanje**: Sidro 1, Sidro 2 | uglovi slike na granicama podataka | | Svako sidro je piksel na slici - **px** (od lijeve strane, 0 do širine) i **py** (od vrha, 0 do visine) - i koordinata svijeta na kojoj stoji, **svijet X** i **svijet Z**. Razmjera i pomak slijede iz para. |
| **Prilagodi granicama podataka** | | | Stavlja sidro 1 na gornji lijevi ugao slike, a sidro 2 na donji desni, na granicama X-Z podataka. Početna tačka za tačno postavljanje. Traži skup podataka. |
| **Visina** | najniži Y skupa podataka | min Y podataka - 500 do max Y + 500 (klizač max Y + 100.000) | Visina ravni karte. Stavi je tik ispod podataka da ništa ne bude sakriveno njome. |

Red naziva pokazuje `širina×visina px · x × z m/px`, veličinu jednog piksela u svijetu duž svake ose.

## U sceni {#in-the-scene}

Slika je jedan teksturisani četverougao na visini. Pri punoj neprozirnosti piše dubinu, pa učestvuje u [zaklanjanju](depth-and-culling.md) kao tlo; ispod 100% neprozirnosti se miješa i ne piše dubinu, pa ništa ne zaklanja. [Ravnalo](measure.md) mjeri na njenoj ravni. [Biblioteka nivoa](level-library.md) čuva nivo sa slikom i njenim sidrima.

## Mapa Dota 2 {#dota-2-map}

**Mapa Dota 2** pored **Slika karte…** preuzima crtež trenutne mape Dota 2 koji [OpenDota](https://www.opendota.com) prikazuje na stranicama svojih mečeva, i postavlja ga ispod tabela koje [Watcher](https://github.com/Holdi601/3DHeat-Watcher) piše iz replaya Dota 2 ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Slika se preuzima s opendota.com kad se pritisne dugme i nije dio 3DHeat-a; crtež najnovije zakrpe se uzima sa OpenDotinog sopstvenog spiska, a crtež 7.40 kada spisak ne može da se pročita.

| | |
|---|---|
| Izvor | `opendota.com/assets/images/dota2/map/detailed_<zakrpa>.webp`, 900×900 px |
| Postavljanje | OpenDotina kalibracija: slika obuhvata Dota jedinice svijeta od -8192 do 8064 na obje ose (ćelije od 128 jedinica 64 do 191), sjever gore. Uz ose tabele replaya (Z gore, Y okrenut) to je X svijeta od -8192 do 8064 i Z svijeta od -8064 do 8192. Oko 18 jedinica po pikselu. |
| Visina | 0. Heroji stoje od 0 do otprilike 600. |
| Izgled | Svjetlina 0,8, smanjenje zasićenja 50%. |

Provjereno na javnom replayu meča zakrpe 7.40: putanja svakog heroja prati nacrtane trake, a tornjevi, kasarne i drevni koje replay postavlja padaju na nacrtane baze. Prikaz **Odozgo** pokazuje kartu sa sjeverom na dnu ekrana, kao što prikazuje svaku tabelu s Z-gore i okrenutim Y.

Crtež je OpenDotin, a mapa Valvea; Valve ne podržava 3DHeat. 3D mapa Dote zahtijeva instaliranu igru: vidi Watcherove napomene o replayima Dota 2.

## Za programere {#for-developers}

### Kako sidra postavljaju sliku {#how-the-anchors-place-the-image}

Iz [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), sa sidrima *a* i *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
piksel (0, 0) je na  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Dva sidra fiksiraju i razmjeru i pomak na svakoj osi nezavisno, pa se karta može rastegnuti različito na X i Z, ali ne i rotirati. Sidra moraju da se razlikuju u **obje** piksel-koordinate; kada dijele red ili kolonu, nijedna razmjera se ne može izvesti, karta se ne crta, a panel kaže *Dva sidra dijele red ili kolonu piksela*.
