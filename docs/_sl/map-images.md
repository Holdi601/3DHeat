---
title: "Slike zemljevidov"
parent: "Ravni in geometrija ozadja"
nav_order: 1
lang: "sl"
source: "map-images.md"
source_hash: "e7a4a651d75d"
translated: true
outdated: false
---

# Slike zemljevidov

Slika zemljevida je ploska slika – mini zemljevid, satelitski posnetek, tloris – položena pod vaše podatke, da vidite, kje je toplota. Pregledovalniku poveste, kam slika sodi, tako da na njej pripnete dve točki na dve mesti v svetu (»sidri«).

## Naložite in postavite sliko zemljevida {#load-and-place-a-map-image}

1. Najprej naložite svoje podatke ([Uvoz podatkov](getting-data-in.md)).
2. V razdelku **Ozadje / nivo** pritisnite **Slika zemljevida…** in izberite sliko. Raztegne se čez območje podatkov.
3. Pritisnite **Prilagodi mejam podatkov**, če je bila slika premaknjena. Sidro 1 gre v zgornji levi kot slike, sidro 2 v spodnji desni kot, na robova podatkov.
4. Če se toplota ne ujema s sliko, izberite dva orientacijska znaka, ki sta daleč narazen (na primer dva nasprotna vogala stavbe ali dve križišči). Preberite slikovno piko vsakega na sliki in njegov položaj v svetu (lebdite z [ravnilom](measure.md), da preberete **X** in **Z**).
5. Vpišite ju v **Postavitev**: za **Sidro 1** slikovni piki **px** in **py** ter **svet X** in **svet Z** orientacijskega znaka; enako za **Sidro 2**.
6. Preverite: sled ali vroča točka, za katero veste, da leži na cesti, bi zdaj morala ležati na tej cesti. Spreminjajte številke, dokler ne.

![Razdelek Postavitev z dvema sidroma in toploto, narisano na sliki zemljevida](../assets/img/en/map-images-placement.webp)

Oba orientacijska znaka se morata razlikovati v obeh stolpcih slikovnih pik in v vrsticah slikovnih pik, sicer plošča pokaže *Oba sidra delita vrstico ali stolpec slikovnih pik*.

## Nalaganje {#loading}

Katerikoli format slike, ki ga brskalnik zna dekodirati. Slika, katere daljši rob je nad **8192 px**, se pomanjša na 8192 (največji rob, ki ga GPU sprejme), plošča pa pokaže *Pomanjšano iz W×H na w×h*.

Ob nalaganju se slika raztegne čez mejo X-Z podatkov (ali ±1000 enot brez podatkov), sever zgoraj, na najnižji Y podatkov. Privzete vrednosti so **Neprosojnost** 100 %, **Svetlost** 0,7, **Razbarvaj** 100 %, **Obrni sever/jug** vklopljeno: razbarvano in zatemnjeno, ker je naloga ozadja, da vam omogoči najti vročo točko, ne pa da tekmuje z njo.

## Nastavitve {#controls}

| Nastavitev | Privzeto | Obseg | Pomen |
|---|---|---|---|
| **Neprosojnost** | 100 % | 0–100 % | |
| **Svetlost** | 0,7 | 0–2 (skok 64) | |
| **Razbarvaj** | 100 % | 0–100 % | Sivo ozadje, nasičena toplota. Barva na zemljevidu tekmuje z barvo v podatkih. |
| **Obrni sever/jug** | vklopljeno | | Katera vrstica slike je največji Z sveta. Če ga preklopite z naloženimi podatki, se sidra tudi ponovno prilagodijo mejam podatkov. |
| **Postavitev**: Sidro 1, Sidro 2 | vogali slike na mejah podatkov | | Vsako sidro je slikovna pika na sliki – **px** (od leve, 0 do širine) in **py** (od zgoraj, 0 do višine) – in svetovna koordinata, na kateri leži, **svet X** in **svet Z**. Merilo in zamik sledita iz para. |
| **Prilagodi mejam podatkov** | | | Postavi sidro 1 na zgornji levi kot slike, sidro 2 na spodnjega desnega, na meji X-Z podatkov. Začetna točka za natančno postavitev. Potrebuje podatke. |
| **Višina** | najnižji Y podatkov | min. Y podatkov − 500 do max. Y + 500 (skok max. Y + 100.000) | Višina ravnine zemljevida. Postavite jo tik pod podatke, da je ne zakrije nič. |

Vrstica z imenom prikazuje `širina×višina px · x × z m/px`, svetovno velikost ene slikovne pike vzdolž vsake osi.

## V prizoru {#in-the-scene}

Slika je en sam teksturiran pravokotnik na višini. Pri polni neprosojnosti piše globino, zato sodeluje pri [zakrivanju](depth-and-culling.md) kot tla; pod 100 % neprosojnosti se pomeša in ne piše globine, zato ničesar ne zakrije. [Ravnilo](measure.md) meri na njeni ravnini. [Knjižnica ravni](level-library.md) shrani ravan s sliko skupaj z njenimi sidri.

## Zemljevid Dota 2 {#dota-2-map}

Gumb **Zemljevid Dota 2** poleg **Slika zemljevida…** pridobi risbo trenutnega zemljevida Dota 2, ki jo [OpenDota](https://www.opendota.com) prikazuje na straneh svojih tekem, in jo postavi pod tabele, ki jih [Watcher](https://github.com/Holdi601/3DHeat-Watcher) zapiše iz posnetkov Dota 2 ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Slika se pridobi z opendota.com, ko pritisnete gumb, in ni del 3DHeat; risba najnovejše zaplate se vzame s seznama OpenDota, risba 7.40 pa takrat, ko seznama ni mogoče prebrati.

| | |
|---|---|
| Vir | `opendota.com/assets/images/dota2/map/detailed_<zaplata>.webp`, 900×900 px |
| Postavitev | Kalibracija OpenDota: slika sega od −8192 do 8064 enot sveta Dota na obeh oseh (celice po 128 enot od 64 do 191), sever zgoraj. Z osmi tabele posnetka (Z navzgor, Y obrnjen) to pomeni svet X od −8192 do 8064 in svet Z od −8064 do 8192. Približno 18 enot na slikovno piko. |
| Višina | 0. Junaki stojijo od 0 do približno 600. |
| Videz | Svetlost 0,8, razbarvanje 50 %. |

Preverjeno na posnetku javne tekme zaplate 7.40: vsaka pot junaka sledi narisanim linijam, stolpi, barake in starodavni, ki jih posnetek postavi, pa padejo na narisane baze. Pogled **Zgoraj** prikaže zemljevid s severom na dnu zaslona, kot prikaže vsako tabelo z Z navzgor in obrnjenim Y.

Risba je OpenDotina, zemljevid pa Valvov; Valve 3DHeat ne podpira.

### 3D zemljevid {#the-3d-map}

Z nameščeno igro Dota 2 Watcherjev ukaz [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) (`python -m heat3d_watch dota-map -o dota.glb`) naredi zemljevid v 3D iz datotek same igre: tla, pečine, vodo, drevesa in stavbe, v enotah in oseh tabel iz posnetkov. Datoteko enkrat naložite z **3D-model…**: pregledovalnik jo prepozna po njenih delih (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` v `dotaMap.ts`), jo takoj shrani v [knjižnico ravni](level-library.md), kjer nadomesti starejšo, in to sporoči. Od takrat **Zemljevid Dota 2** naloži ta 3D zemljevid iz knjižnice, namesto da prenese risbo; če ga v knjižnici ni, prenese risbo in pove, kako narediti 3D zemljevid. Datoteka izvira iz vaše lastne namestitve in ostane na vašem računalniku.

## Za razvijalce {#for-developers}

### Kako sidra postavijo sliko {#how-the-anchors-place-the-image}

Iz [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), s sidroma *a* in *b*:

```
merilo X = (b.svetX - a.svetX) / (b.px - a.px)
merilo Z = (b.svetZ - a.svetZ) / (b.py - a.py)
slikovna pika (0, 0) leži na  (a.svetX - a.px × merilo X,  a.svetZ - a.py × merilo Z)
```

Dve sidri določita merilo in zamik na vsaki osi neodvisno, zato je zemljevid mogoče raztegniti različno po X in Z, ne pa zavrteti. Sidra se morata razlikovati v **obeh** koordinatah slikovnih pik; kadar delita vrstico ali stolpec, merila ni mogoče izpeljati, zemljevid se ne nariše, plošča pa pokaže *Oba sidra delita vrstico ali stolpec slikovnih pik*.
