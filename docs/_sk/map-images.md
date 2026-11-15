---
title: "Obrázky máp"
parent: "Levely a geometria pozadia"
nav_order: 1
lang: "sk"
source: "map-images.md"
source_hash: "e7a4a651d75d"
translated: true
outdated: false
---

# Obrázky máp

Obrázok mapy je plochý obrázok – minimapa, satelitná snímka, pôdorys – položený pod vaše dáta, aby ste videli, kde teplo leží. Prehliadaču poviete, kam obrázok patrí, tak, že na ňom pripnete dva body k dvom miestam vo svete (kotvy).

## Načítanie a umiestnenie obrázka mapy {#load-and-place-a-map-image}

1. Najprv načítajte dáta ([Získavanie dát](getting-data-in.md)).
2. V **Pozadie / level** stlačte **Obrázok mapy…** a vyberte obrázok. Natiahne sa cez oblasť dát.
3. Ak bol obrázok posunutý, stlačte **Prispôsobiť hraniciam dát**. Kotva 1 pôjde do ľavého horného rohu obrázka, kotva 2 do pravého dolného, na okraje dát.
4. Ak teplo nesedí s obrázkom, vyberte dva orientačné body, ktoré sú ďaleko od seba (napríklad dva protiľahlé rohy budovy alebo dve križovatky). Odčítajte pixel každého z nich na obrázku a jeho svetovú polohu (ak nad ním podržíte [pravítko](measure.md), uvidíte **X** a **Z**).
5. Napíšte ich do **Umiestnenie**: pre **Kotvu 1** **px**, **py** orientačného bodu, **svet X**, **svet Z**; to isté pre **Kotvu 2**.
6. Skontrolujte: dráha alebo horúci bod, o ktorom viete, že leží na ceste, by teraz mal ležať na tej ceste. Upravujte čísla, kým to nebude.

![Sekcia Umiestnenie s dvoma kotvami a teplom nakresleným na obrázku mapy](../assets/img/en/map-images-placement.webp)

Dva orientačné body sa musia líšiť v oboch stĺpcoch pixelov aj v riadkoch pixelov, inak panel hovorí *Dve kotvy zdieľajú pixelový riadok alebo stĺpec*.

## Načítanie {#loading}

Akýkoľvek formát obrázka, ktorý prehliadač dokáže dekódovať. Obrázok, ktorého dlhší okraj je nad **8192 px**, sa zmenší na 8192 (najväčší okraj, ktorý GPU dostane držať), a panel hovorí *Zmenšené z W×H na w×h*.

Pri načítaní sa obrázok natiahne cez osi X-Z dát (alebo ±1000 jednotiek bez dát), sever hore, na najnižšiu Y dát. Predvolené hodnoty sú **Nepriehľadnosť** 100 %, **Jas** 0,7, **Odfarbiť** 100 %, **Prevrátiť sever/juh** zapnuté: odfarbené a stmavené, lebo úlohou pozadia je umožniť nájsť horúci bod, nie konkurovať mu.

## Ovládacie prvky {#controls}

| Ovládací prvok | Predvolené | Rozsah | Význam |
|---|---|---|---|
| **Nepriehľadnosť** | 100 % | 0-100 % | |
| **Jas** | 0,7 | 0-2 (posuv 64) | |
| **Odfarbiť** | 100 % | 0-100 % | Sivé pozadie, sýte teplo. Farba v mape súperí s farbou v dátach. |
| **Prevrátiť sever/juh** | zapnuté | | Ktorý riadok obrázka je maximum Z sveta. Prepnutie s načítanými dátami tiež znova prispôsobí kotvy hraniciam dát. |
| **Umiestnenie**: Kotva 1, Kotva 2 | rohy obrázka na hraniciach dát | | Každá kotva je pixel na obrázku – **px** (zľava, 0 až šírka) a **py** (zhora, 0 až výška) – a svetová súradnica, na ktorej leží, **svet X** a **svet Z**. Mierka a posun sa odvodia z dvojice. |
| **Prispôsobiť hraniciam dát** | | | Dá kotvu 1 na ľavý horný roh obrázka a kotvu 2 na pravý dolný, na hranice X-Z dát. Východiskový bod pre presné umiestnenie. Potrebuje dáta. |
| **Výška** | najnižšia Y dát | min. Y dát - 500 až max. Y + 500 (posuv max. Y + 100 000) | Výška roviny mapy. Dajte ju tesne pod dáta, aby ju nič nezakrývalo. |

Riadok s názvom ukazuje `šírka×výška px · x × z m/px`, svetovú veľkosť jedného pixela pozdĺž každej osi.

## V scéne {#in-the-scene}

Obrázok je jeden texturovaný štvorec vo výške. Pri plnej nepriehľadnosti zapisuje hĺbku, takže sa zúčastňuje [zakrývania](depth-and-culling.md) ako zem; pod 100 % nepriehľadnosťou sa mieša a hĺbku nezapisuje, takže nič nezakrýva. [Pravítko](measure.md) meria v jeho rovine. [Knižnica levelov](level-library.md) ukladá level s obrázkom spolu s jeho kotvami.

## Mapa Dota 2 {#dota-2-map}

Tlačidlo **Mapa Dota 2** vedľa **Obrázok mapy…** stiahne kresbu aktuálnej mapy Dota 2, ktorú [OpenDota](https://www.opendota.com) zobrazuje na svojich stránkach zápasov, a umiestni ju pod tabuľky, ktoré [Watcher](https://github.com/Holdi601/3DHeat-Watcher) píše z replayov Dota 2 ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Obrázok sa sťahuje z opendota.com, keď sa stlačí tlačidlo, a nie je súčasťou 3DHeat; kresba najnovšieho patchu sa vezme zo zoznamu samotného OpenDota a kresba 7.40, keď sa zoznam nedá prečítať.

| | |
|---|---|
| Zdroj | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Umiestnenie | Kalibrácia OpenDota: obrázok zaberá jednotky sveta Dota od -8192 do 8064 na oboch osiach (bunky po 128 jednotkách 64 až 191), sever hore. S osami tabuľky replayu (Z hore, Y prevrátené) je to svet X od -8192 do 8064 a svet Z od -8064 do 8192. Asi 18 jednotiek na pixel. |
| Výška | 0. Hrdinovia stoja od 0 do asi 600. |
| Vzhľad | Jas 0,8, odfarbenie 50 %. |

Overené na verejnom replayi zápasu patchu 7.40: dráha každého hrdinu nasleduje nakreslené pruhy a veže, kasárne a starí sa nachádzajú tam, kde replay ich kladie, na nakreslených základniach. Pohľad **Zhora** ukazuje mapu so severom dole na obrazovke, ako ukazuje každú tabuľku Z-hore s prevráteným Y.

Kresba je od OpenDota, z mapy Valve; Valve 3DHeat neschvaľuje.

### 3D mapa {#the-3d-map}

S nainštalovanou hrou Dota 2 vytvorí príkaz [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) z Watchera (`python -m heat3d_watch dota-map -o dota.glb`) mapu v 3D z vlastných súborov hry: terén, útesy, vodu, stromy a budovy, v jednotkách a osiach tabuliek zo záznamov. Načítajte súbor raz cez **3D model…**: prehliadač ho spozná podľa jeho častí (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` v `dotaMap.ts`), hneď ho uloží do [knižnice levelov](level-library.md), kde nahradí staršiu, a oznámi to. Odvtedy **Mapa Dota 2** načítava túto 3D mapu z knižnice namiesto sťahovania kresby; ak v knižnici žiadna nie je, stiahne kresbu a povie, ako 3D mapu vytvoriť. Súbor pochádza z vašej vlastnej inštalácie a zostáva na vašom počítači.

## Pre vývojárov {#for-developers}

### Ako kotvy umiestňujú obrázok {#how-the-anchors-place-the-image}

Z [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), pri kotvách *a* a *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Dve kotvy určia mierku aj posun na každej osi nezávisle, takže mapa sa dá natiahnuť inak na X a Z, ale nedá sa otočiť. Kotvy sa musia líšiť v **oboch** pixelových súradniciach; keď zdieľajú riadok alebo stĺpec, nedá sa odvodiť žiadna mierka, mapa sa nenakreslí a panel hovorí *Dve kotvy zdieľajú pixelový riadok alebo stĺpec*.
