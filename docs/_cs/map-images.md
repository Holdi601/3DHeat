---
title: "Obrázky map"
parent: "Levely a geometrie pozadí"
nav_order: 1
lang: "cs"
source: "map-images.md"
source_hash: "d56614ef6bd1"
translated: true
outdated: false
---

# Obrázky map

Obrázek mapy je plochý obrázek – mini mapa, satelitní snímek, půdorys –, který se položí pod vaše data, abyste viděli, kde teplo leží. Řeknete prohlížeči, kam obrázek patří, tím že na něj připnete dva body ke dvěma místům ve světě (kotvy).

## Načtení a umístění obrázku mapy {#load-and-place-a-map-image}

1. Nejdřív načtěte svá data ([Načítání dat](getting-data-in.md)).
2. V **Pozadí / úroveň** stiskněte **Obrázek mapy…** a vyberte obrázek. Natáhne se přes oblast dat.
3. Stiskněte **Přizpůsobit rozsahu dat**, když byl obrázek posunutý. Kotva 1 se umístí do levého horního rohu obrázku, kotva 2 do pravého dolního, na okraje dat.
4. Když teplo nesedí s obrázkem, vyberte dva orientační body, které jsou daleko od sebe (například dva protilehlé rohy budovy nebo dvě křižovatky). Přečtěte pixel každého na obrázku a jeho pozici ve světě (najetím [měřítkem](measure.md) přečtete **X** a **Z**).
5. Napište je do **Umístění**: pro **Kotvu 1** **px** a **py** orientačního bodu, **svět X**, **svět Z**; totéž pro **Kotvu 2**.
6. Zkontrolujte: dráha nebo horké místo, o kterém víte, že leží na silnici, by teď měla ležet na té silnici. Upravujte čísla, dokud tam neleží.

![Sekce Umístění se dvěma kotvami a teplem nakresleným na obrázku mapy](../assets/img/en/map-images-placement.webp)

Dva orientační body se musí lišit v obou sloupcích pixelů i v řádcích pixelů, jinak panel hlásí *Dvě kotvy sdílejí řádek nebo sloupec pixelů*.

## Načítání {#loading}

Jakýkoli formát obrázku, který prohlížeč umí dekódovat. Obrázek, jehož delší strana je nad **8192 px**, se zmenší na 8192 (největší strana, kterou GPU smí držet), a panel napíše *Zmenšeno z W×H na w×h*.

Po načtení se obrázek natáhne přes rozsah X-Z dat (nebo ±1000 jednotek bez dat), sever nahoře, na nejnižší Y dat. Výchozí hodnoty jsou **Krytí** 100 %, **Jas** 0,7, **Odbarvení** 100 %, **Převrátit sever/jih** zapnuto: odbarveno a ztlumeno, protože úkolem pozadí je pomoct vám najít horké místo, ne soupeřit s ním.

## Ovládací prvky {#controls}

| Ovládací prvek | Výchozí | Rozsah | Význam |
|---|---|---|---|
| **Krytí** | 100 % | 0–100 % | |
| **Jas** | 0,7 | 0–2 (posun 64) | |
| **Odbarvení** | 100 % | 0–100 % | Šedé pozadí, sytě teplo. Barva v mapě by soupeřila s barvou v datech. |
| **Převrátit sever/jih** | zapnuto | | Který řádek obrázku je maximální Z světa. Přepnutí, když jsou data načtená, také znovu přizpůsobí kotvy rozsahu dat. |
| **Umístění**: Kotva 1, Kotva 2 | rohy obrázku na mezích dat | | Každá kotva je pixel na obrázku – **px** (zleva, 0 až šířka) a **py** (shora, 0 až výška) – a souřadnice světa, na které leží, **svět X** a **svět Z**. Měřítko a posun vyplynou z dvojice. |
| **Přizpůsobit rozsahu dat** | | | Položí kotvu 1 do levého horního rohu obrázku a kotvu 2 do pravého dolního, na meze X-Z dat. Výchozí bod pro přesné umístění. Potřebuje data. |
| **Výška** | nejnižší Y dat | min. Y dat − 500 až max. Y + 500 (posun max. Y + 100 000) | Výška roviny mapy. Dejte ji těsně pod data, aby ji nic nezakrývalo. |

Řádek názvu ukazuje `šířka×výška px · x × z m/px`, světovou velikost jednoho pixelu podél každé osy.

## Ve scéně {#in-the-scene}

Obrázek je jeden texturovaný čtyřúhelník ve výšce levelu. Při plném krytí zapisuje hloubku, takže se účastní [zakrytí](depth-and-culling.md) jako země; při krytí pod 100 % se mísí a hloubku nezapisuje, takže nic nezakrývá. [Měřítko](measure.md) měří na jeho rovině. [Knihovna levelů](level-library.md) ukládá obrazový level i s jeho kotvami.

## Dota 2 mapa {#dota-2-map}

**Dota 2 mapa** vedle **Obrázek mapy…** načte kresbu aktuální mapy Dota 2, kterou [OpenDota](https://www.opendota.com) ukazuje na stránkách zápasů, a položí ji pod tabulky, které [Watcher](https://github.com/Holdi601/3DHeat-Watcher) zapisuje z replayů Dota 2 ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Obrázek se načte z opendota.com, když stisknete tlačítko, a není součástí 3DHeat; kresba nejnovějšího patche se vezme ze seznamu samotné OpenDota, a kresba 7.40, když seznam nejde přečíst.

| | |
|---|---|
| Zdroj | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Umístění | Kalibrace OpenDota: obrázek se rozprostírá přes světové jednotky Dota -8192 až 8064 na obou osách (buňky po 128 jednotkách 64 až 191), sever nahoře. S osami tabulky replayu (Z nahoře, Y převrácené) je to svět X -8192 až 8064 a svět Z -8064 až 8192. Zhruba 18 jednotek na pixel. |
| Výška | 0. Hrdinové stojí na 0 až zhruba 600. |
| Vzhled | Jas 0,8, odbarvení 50 %. |

Ověřeno na replayu veřejného zápasu v patchi 7.40: dráha každého hrdiny sleduje nakreslené pruhy a věže, kasárna a ancienti, které replay umisťuje, padnou na nakreslené základny. Pohled **Shora** ukazuje mapu se severem dole na obrazovce, jak ukazuje jakoukoli tabulku s Z nahoře a převráceným Y.

Kresba je od OpenDota, mapy od Valve; Valve 3DHeat neschvaluje. 3D mapa Dota potřebuje nainstalovanou hru: viz poznámky Watcheru o replayích Dota 2.

## Pro vývojáře {#for-developers}

### Jak kotvy umisťují obrázek {#how-the-anchors-place-the-image}

Z [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), s kotvami *a* a *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) leží na  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Dvě kotvy pevně určují měřítko i posun na každé ose zvlášť, takže lze mapu natáhnout jinak na X a Z, ale ne otočit. Kotvy se musí lišit v **obou** souřadnicích pixelů; když sdílejí řádek nebo sloupec, nelze odvodit žádné měřítko, mapa se nekreslí a panel hlásí *Dvě kotvy sdílejí řádek nebo sloupec pixelů*.
