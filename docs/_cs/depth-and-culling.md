---
title: "Hloubka a vyřazování"
parent: "Režimy tepla"
nav_order: 4
lang: "cs"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Hloubka a vyřazování

Hloubka způsobí, že kopce a zdi schovají teplo za sebou, stejně jako skutečná zeď schová člověka. Ořezávání podle vzdálenosti nechá jen teplo mezi bližší a vzdálenější mezí od kamery.

![Nízká kamera za kopcem, s vypnutým (vlevo) a zapnutým (vpravo) Skrýt za terénem](../assets/img/en/depth-and-culling-terrain.webp)

![Ořezávání podle vzdálenosti s Daleko na 400 m a zapnutým Řezat i úroveň: řez mapou kolem kamery](../assets/img/en/depth-and-culling-far.webp)

Bez hloubky je teplotní mapa nad 3D [levelem](levels.md) plochý překryv: všechno, co datová sada obsahuje, prosvítá každou zdí plnou silou, podněty hloubky, které level nabízí, se ruší a horké místo uvnitř budovy vypadá stejně jako to na střeše. Sekce **Hloubka** způsobí, že level schová, co je za ním; **Ořezávání podle vzdálenosti** omezí teplo na slupku nebo desku kolem kamery; [Řez](slice.md) vyřízne desku ze světa. Všechny tři se uplatní na režimy tepla a mění, které řádky přispívají, takže když je změníte, akumulace se restartuje.

## Hloubka {#depth}

Obě ovládací prvky potřebují [level](levels.md) – obrázek mapy nebo 3D model. Když žádný level není načtený, není za čím být schovaný, a nic nedělají. Obě jsou vypnuté, dokud je zapnuté [Zploštit na rovinu země](sprite-shape.md#flatten-onto-ground-plane).

### Skrýt za terénem {#hide-behind-terrain}

**Skrýt za terénem** (výchozí zapnuto): datový bod, jehož nejbližší povrch směrem ke kameře je *země* (ne stavba), se zahodí úplně, ne jen ztmaví.

Terén a zdi jsou neprůhledné různým způsobem. Díváte se *skrz* zeď schválně, abyste viděli, na kterém patře byla doprava; skrz kopec se nikdy dívat nechcete, protože za ním je vzdálená strana mapy – a na mapě dlouhé kilometry je to většina dat, která se v horizontu sečte do pásu jasnějšího než cokoli v popředí. Jeden ztmavovač nemůže sloužit oběma účelům, proto dostane terén hranici a zdi zůstanou u ztmavování níže.

### Skryté za geometrií {#hidden-behind-geometry}

**Skryté za geometrií** (výchozí 0,8): jak silně se potlačí datový bod za geometrií levelu. Hodnota znamená *prosvítá* při 0, *o N % ztmavené* mezi tím (je to poloha posuvníku, ne naměřené ztmavení), *úplně skryté* při 1.

Každá zeď nebo podlaha mezi bodem a kamerou ho ztmaví ještě víc: jedna zeď při výchozí hodnotě nechá několik procent, a každá další plocha zbytek zhruba půlí, až do čtyř ploch. Při 1 se nic za geometrií nekreslí, a to je nejlevnější nastavení.

Viz také [Vzhled levelu](level-appearance.md).

## Ořezávání podle vzdálenosti {#distance-culling}

**Ořezávání podle vzdálenosti** (výchozí zavřeno) omezí teplo na řádky mezi bližší a vzdálenější mezí od kamery. Nastavte vzdálenější mez, když chcete číst hustotu uvnitř budovy, aniž by se na ni navrch sčítala vzdálená strana mapy; nastavte bližší mez, když chcete letět *skrz* horké místo místo do něj.

| Ovládací prvek | Výchozí | Rozsah (posun) | Význam |
|---|---|---|---|
| **Blízko** | vypnuto | 0,5–5000 m, logaritmicky, spodních 5 % posuvu = vypnuto (200 000) | Řádky bližší než toto se přeskočí. |
| **Daleko** | vypnuto | 1–200 000 m, logaritmicky, spodek = vypnuto (10 000 000) | Řádky vzdálenější než toto se přeskočí. |
| **Řezat rovinou** | zapnuto | | Měří meze podle osy pohledu místo od oka, takže řez je rovina rovnoběžná s obrazovkou, a ne koule kolem vás. Okraj koule se v rámu zakřivuje a posouvá, kdykoli se otočíte; rovina zůstane tam, kam jste ji dali. |
| **Řezat i úroveň** | zapnuto | | Řeže zemi, stavby a vodu se stejnými mezemi. Když zůstane level celý, řez odstraní datové body a budova stojí před nimi; když jsou řezány oba, je to řez mapou a body sedí u svých zdí a podlah. Tohle jen překreslí; akumulaci nerestartuje. |

### Klávesnice {#keyboard}

Vzdálenější mez je ovládací prvek, který procházíte – projděte s ní budovou a sledujte, na kterém patře se doprava objevuje – proto je na klávesnici, když létáte ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Klávesa | Účinek |
|---|---|
| `]` | Posune vzdálenější mez ven o faktor 1,12 (Shift: 1,35) |
| `[` | Stáhne ji dovnitř o stejný faktor |
| `\` | Vypne vzdálenější mez, nebo ji znovu zapne ve vzdálenosti, kde zůstala (poprvé 6000) |

Kroky jsou geometrické, protože užitečný rozsah sahá přes čtyři řády, od místnosti po mapu. Klávesnice drží vzdálenější mez mezi 100 a 400 000. Klávesy nedělají nic, když má fokus textové pole nebo nabídka.

## Pro vývojáře {#for-developers}

### Skrýt za terénem {#hide-behind-terrain}

Stavby se kreslí do vlastní textury hloubky. Fragment, který je za hloubkou scény, ale *ne* za hloubkou staveb, je za zemí a zahodí se. Stojí to jeden průchod hloubky přes stavby, který se přeskočí, když je přepínač vypnutý.

### Skryté za geometrií {#hidden-behind-geometry}

Počítá se **na každou plochu**. Jediné porovnání hloubky umí říct jen „něco je před tím“, takže bod za jednou zdí a bod čtyři místnosti hluboko v budově by se ztmavily stejně a interiér by se četl jako jeden slabý rozmazaný flek. Místo toho se geometrie staveb **odlupuje po hloubce** až do 3 dalších vrstev ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); každý fragment spočítá, kolik ploch je před ním (vlastní hloubka scény plus odloupnuté vrstvy: nejvýš čtyři), a ztmavení se násobí:

```
síla          = 1 - (1 - posuvník)²                (posuvník 1 → 1)
viditelnost   = (1 - síla) × 0,5 ^ (plochy - 1)
viditelnost   = max(viditelnost, 0,006)            (bez dolní meze při posuvníku 1)
```

| Posuvník | 1 plocha | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25 % | 12,5 % | 6,25 % | 3,1 % |
| 0,8 (výchozí) | 4 % | 2 % | 1 % | 0,6 % (dolní mez) |
| 1,0 | nekresleno | nekresleno | nekresleno | nekresleno |

Proč dva činitele: posuvník je nakalibrovaný tak, aby jedna zeď nechala několik procent – vzhled, který se čte jako „je to za něčím“ – a několik procent složených dohromady by do třetí zdi nebylo nic; půlení na každou další plochu udrží čtyři rozlišitelné stupně. Proč na druhou: lineárně zůstalo nasycené pole za zdí pořád nasycené; čtvrtá mocnina ho při 0,8 vymazala. Proč dolní mez: úplné skrytí zakrytého tepla dělá z místnosti plné skrytého provozu prázdnou místnost, bez čehokoli, co by naznačilo sáhnout po [Řezu](slice.md). Jen posuvník přibitý na 1 to skryje úplně – a je to nejlevnější nastavení, protože zakryté body se pak zahodí.

Jak to funguje ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), shadery bodového tepla): porovnání se dělá na fragment, proti texturě hloubky scény, v **okenní hloubce**, a ne ve světové vzdálenosti. Čtení textury hloubky ve fázi vertexů na některých ovladačích vrací „daleko“ všude (mezi nimi softwarový rasterizér ANGLE) a převod obou hloubek na metry ztratí oddělení kvůli přesnosti při širokém rozsahu blízko/daleko. Předsazení je jeden poloměr sprite převedený do okenních jednotek plus několik nejméně významných bitů, takže datový bod ležící na povrchu se nezastíní sám.

Stavby se kreslí průhledně, ale kreslí se do hloubky, ze které čte zakrytí; level, jehož stavby se do textury hloubky nedostanou, by se zakrýval jen proti terénu.

### Ořezávání podle vzdálenosti {#distance-culling}

Obě meze se vyhodnocují v shaderu vertexů, takže oříznutý řádek stojí jeden vertex a žádné fragmenty.
