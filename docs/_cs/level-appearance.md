---
title: "Vzhled levelu"
parent: "Levely a geometrie pozadí"
nav_order: 3
lang: "cs"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Vzhled levelu

Tyto ovládací prvky mění, jak 3D level vypadá, aby teplo z něj vynikalo a místo jste pořád mohli číst. Nic tady nemění data.

## Rychlý start {#quick-start}

1. Načtěte 3D level ([3D levely](model-levels.md)).
2. V **Pozadí / úroveň** snižte **Jas**, dokud teplo nebude nejjasnější věc na obrazovce.
3. Otevřete **Reliéf terénu** a zvyšte **Stínování sklonu** nebo **Výraznost vrstevnic**, dokud nepoznáte kopec od roviny.
4. Otevřete **Stavby**. Snižte **Krytí ploch**, abyste viděli dovnitř budov, nebo zapněte **Textura staveb**, aby byly plné.
5. Pokud je na terénu namalovaný obrázek, zkuste **Textura terénu** vypnout a zapnout.

![Otevřené sekce Reliéf terénu a Stavby, level s podněty reliéfu](../assets/img/en/level-appearance-sections.webp)

Když je načtený [3D level](model-levels.md), panel Pozadí / úroveň ukazuje tyto ovládací prvky. Výchozí hodnoty jsou ty, které dostane čerstvě naimportovaný level ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Změna jich jen překreslí scénu; akumulace tepla se zachová.

## Celý level {#the-whole-level}

| Ovládací prvek | Výchozí | Rozsah | Význam |
|---|---|---|---|
| **Krytí** | 100 % | 0–100 % | Pod 100 % se level mísí a nezapisuje hloubku, takže už [nezakrývá](depth-and-culling.md) teplo. |
| **Jas** | 0,9 | 0–2 (posun 64) | |

Level se kreslí odbarvený – šedá země, nádech skořepiny –, takže teplo je jediná sytá věc na obrazovce. Na rozdíl od [obrázku mapy](map-images.md) nemá 3D level posuvník Odbarvit.

## Reliéf terénu {#ground-relief}

Z dálky vypadají kopec a rovina stejně šedě, takže prohlížeč přidává tři nápovědy. Každá odpovídá jinému selhání:

| Ovládací prvek | Výchozí | Význam |
|---|---|---|
| **Rozestup vrstevnic** | podle rozsahu výšek terénu | Výška mezi vrstevnicemi, logaritmicky od 1/4000 do 1/2 rozsahu výšek levelu; spodek dráhy je *vypnuto*. Výchozí je 1/40 rozsahu výšek terénu zaokrouhlená na krok 1/2/5 – čáry po 10 m se hodí na svah a na dně lomu jsou k ničemu. Každá 5. čára se kreslí silněji. Vrstevnice se kreslí v prostoru obrazovky, takže zůstávají jeden pixel široké při každém přiblížení, a jsou to jediný podnět, který přežije terén příliš mělký na jakékoli stínování. |
| **Výraznost vrstevnic** | 35 % | 0–100 % | |
| **Stínování sklonu** | 55 % | Ztmaví podle strmosti, takže svahy a útesy se čtou z jakéhokoli úhlu kamery – na rozdíl od světla, které se zploští, kdykoli se k němu otočíte. | |
| **Škála výšky** | 50 % | Nízký terén tmavší, vysoký světlejší, přes rozsah výšek terénu: velký tvar. | |

Záhlaví sekce ukazuje stav vrstevnic: *každých N m*, rozestup vrstevnic, nebo *bez vrstevnic*, když je rozestup vypnutý.

## Povrch terénu {#ground-surface}

| Ovládací prvek | Výchozí | Zobrazí se, když | Význam |
|---|---|---|---|
| **Voda** | zapnuto | level má vodu | Jezera, řeky a moře, kreslené placatě v bledé modrošedé: žádný podnět terénu se na povrch, který je ze své podstaty rovný, nevztahuje. |
| **Krytí vody** | 60 % | voda je zapnutá | Pobřeží a země pod mělčinami prosvítají průhlednou vodou. |
| **Trojúhelníky terénu** | 30 % (0 u levelu s texturami) | vždy | Vlastní hrany terénu nakreslené přes stínovaný povrch, mizející mezi 6 % a 25 % šířky levelu od kamery. Ukazuje, jak hrubě byla země vzorkována, a dává svahu něco, podle čeho posoudit vzdálenost. Vytvoří se při prvním použití, což na velkém levelu chvíli trvá. |
| **Terén jen jako drátový model** | vypnuto | vždy | Nahradí povrch terénu jeho hranami. Je to zcela schematické – vzdá se i stínování, vrstevnic a zakrytí, takže *Trojúhelníky terénu* jsou obvykle lepší volba. |
| **Textura terénu** | zapnuto | level má textury | Kreslí zemi v texturách, které soubor nese (asfalt, krajnice, tráva). Osvětlení sítě se na to jemně položí navrch, protože textura už nese vlastní jemný reliéf. **Jas** je způsob, jak ji pod teplem ztlumit; Odbarvit patří k obrázkům map. |
| **Zachycená barva** | vypnuto | level má barvy vrcholů | Stíní zemi barvou, kterou zachytil sken, místo šedé – zrekonstruovaná silnice by jinak byla k nerozeznání od krajnice. Exporty z enginů žádné nemají; když chybí, panel říká *Tento level nenese barvu.* |

## Stavby {#structures}

Záhlaví **Stavby** ukazuje počet trojúhelníků staveb; nápověda pod ním říká, jak se kreslí (*kreslené plné ve vlastních texturách*, nebo *kreslené jako průhledná skořepina, abyste viděli teplo uvnitř*) a kolik částí jsou stavby.

| Ovládací prvek | Výchozí | Význam |
|---|---|---|
| **Textura staveb** | zapnuto, když stavby nesou textury | Kreslí stavby plné, ve vlastních texturách. Zapnutí nastaví krytí ploch na 100 % a vypne hrany; vypnutí se vrátí k zatónované průhledné skořepině na 25 %. Texturovaná stavba je osvětlena ze strany, kterou kamera vidí, protože cedule jsou dvě plochy zády k sobě a to, která vyhraje test hloubky, závisí na zaokrouhlení. |
| **Hrany drátového modelu** | zapnuto; vypnuto nad 300 000 trojúhelníky staveb nebo u texturovaných | Deduplikované hrany staveb, jedna čára na hranu. |
| **Krytí hran** | 50 % | |
| **Plochy slupky** | zapnuto | Slabý povrch s jasným Fresnelovým lemem, takže budova se čte jako objem, ne jako klec nebo mlžný útvar. |
| **Krytí ploch** | 25 % (35 % nad 300 000 trojúhelníky staveb, 100 % s texturou) | 0–60 % na dráze, až 100 s rukojetí. Držte nízko: plné stavby schovávají data uvnitř. |
| **Ostré hrany** | zapnuto (vypnuto u textur) | Stíní každý trojúhelník jeho vlastní normálou, počítanou ve fragment shaderu z derivací v prostoru obrazovky. Exportované levely jsou svařené a nesou zprůměrované normály, které každý roh krabice zaoblí do „roztaveného plechu“; rozdělit každý vrchol, aby se to spravilo, by násobilo vyrovnávací paměť vrcholů. Vypněte to u levelu, jehož zakřivené plochy jsou důležitější než jeho rohy. |
| **Tónování staveb** | azurová | Výběr barvy a předvolby **Azurová**, **Jantarová**, **Fialová**, **Bílá**. |
| **Zobrazit zařazení částí (N)** | | Každá část, její třída a důvod; viz [3D levely](model-levels.md#ground-structures-and-water). |

## Řez levelem {#cutting-the-level}

[Řez](slice.md) a s *Řezat i úroveň* také [ořezávání podle vzdálenosti](depth-and-culling.md#distance-culling) řežou zemi, stavby a vodu ve stejných rovinách jako teplo.
