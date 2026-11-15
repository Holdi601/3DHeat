---
title: "Teplo"
parent: "Režimy tepla"
nav_order: 1
lang: "cs"
source: "heat.md"
source_hash: "0d84cc318ef8"
translated: true
outdated: false
---

# Teplo

Teplo maluje místa, kde se stalo hodně věcí: červeně tam, kde se stalo trochu, bíle rozžhaveně tam, kde se stalo hodně. Odpovídá na otázku „kde se to děje a kolik toho je“.

**Teplo** (klávesa 1) je výchozí režim. Každý viditelný [řádek](glossary.md) přispívá kulatým [spritem](glossary.md) natočeným ke kameře; překrývající se sprite se sčítají v bufferu v plovoucí desetinné čárce; součet se převede přes škálu barev - ve výchozím nastavení průhledná → červená → žlutá → bílá - a nakreslí se přes scénu.

![Teplo na 3D levelu: horká místa uvnitř budov i na jejich střechách](../assets/img/en/shooter-heat.webp)

Obrázek ukazuje teplo jednoho kola střelce na levelu s budovami: horká místa leží v místnostech a na schodech, ne jen na zemi.

## Jak to použít {#how-to-use-it}

1. Načtěte data a stiskněte `1` (nebo vyberte **Teplo** v liště režimů).
2. Pokud je všechno bílé nebo prázdné, stiskněte v sekci **Tvar tepla** tlačítko **Automatická expozice z pole**.
3. Měňte **Poloměr spritu**, dokud se sousední tečky nesloučí do pásů: menší ukáže jednotlivé body, větší ukáže plochy.
4. Otevřete **Barvy tepla**, chcete-li změnit barvy, nebo **Hloubku**, aby kopce a zdi skryly teplo za sebou.

![Sekce Tvar tepla a Barvy tepla v postranním panelu, obě otevřené](../assets/img/en/heat-panel.webp)

Stejné panely tvarují [Rozdíl](difference.md), [Týmové teplo](team-heat.md) a [Čárové teplo](line-heat.md); liší se tím, co se přidává (se znaménkem, obarvené nebo podél čar), ne tím, jak.

## Panely a jejich výchozí hodnoty {#the-panels-and-their-defaults}

Každé ovládání níže odpovídá parametru shaderu, takže jeho změna nestojí nic kromě překreslení. Posuvníky mají vedle sebe číselné pole a úchyt pro tažení (malý úchyt vpravo: tažení nahoru nebo dolů, dál je rychleji, Shift pro jemné nastavení); kde trať posuvníku končí dřív, než je skutečná mez, může úchyt posunout hodnotu až do *stropu tažení* uvedeného zde. Hodnoty označené *při načtení* se přepočítají pro každou novou datovou sadu.

### Tvar tepla (otevřeno) {#heat-shape-open}

| Ovládání | Výchozí | Rozsah (strop tažení) | Podrobnosti |
|---|---|---|---|
| **Poloměr spritu** | 6 m; při načtení rozsah / 120 | 0,05-2000 m, logaritmicky (50 000) | [Tvar sprite](sprite-shape.md#sprite-radius) |
| **Intenzita ve středu** | 1 | 0-10 (1000) | [Tvar sprite](sprite-shape.md#centre-and-edge-intensity) |
| **Intenzita na okraji** | 0 | -2-10 (1000) | [Tvar sprite](sprite-shape.md#centre-and-edge-intensity) |
| **Tvar útlumu** | *Útlum* | *Útlum* / *Křivka* | [Tvar sprite](sprite-shape.md#ramp-shape-falloff-or-curve) |
| **Útlum** (jen pro Útlum) | 1,6 | 0,1-8 (64) | [Tvar sprite](sprite-shape.md#falloff) |
| **Hladký útlum** (jen pro Útlum) | zapnuto | | [Tvar sprite](sprite-shape.md#falloff) |
| Editor křivky (jen pro Křivku) | předvolba *Hladká* | | [Tvar sprite](sprite-shape.md#the-curve-editor) |
| **Bod nasycení** | 24; při načtení odhad, pak změřeno | 0,1-4000, logaritmicky (10 000 000) | [Barva a expozice](colour-and-exposure.md#saturation-point) |
| **Minimální teplo** | vypnuto (0) | 0-100 % | [Barva a expozice](colour-and-exposure.md#minimum-heat) |
| **Odezva na hustotu** | *Saturující* | *Saturující* / *Lineární* / *Logaritmická* | [Barva a expozice](colour-and-exposure.md#density-response) |
| **Automatická expozice z pole** | | tlačítko | [Barva a expozice](colour-and-exposure.md#auto-exposure) |
| **Sledovat pohled** | zapnuto | | Znovu změří expozici pokaždé, když se kamera zastaví, takže oblast, do které vletíte, využije celou škálu barev. Malé změny se ignorují a měřítko plynule klouže. Odškrtněte to nebo táhněte **Bod nasycení**, abyste měřítko zamkli a porovnávali místa na jedné stupnici. [Barva a expozice](colour-and-exposure.md#follow-the-view) |
| **Stejná hustota při každém přiblížení** | zapnuto | | Barva znamená stejný počet řádků na plochu země, ať jste jakkoli blízko. Sprite, které omezení pixelů zvětší (zdaleka) nebo zmenší (zblízka), si zachová teplo, které by přidal ve své skutečné velikosti, takže obraz exponovaný zdaleka nezmizí, když do něj vletíte. Vypnuto, omezený sprite přidá svou plnou váhu ve své omezené velikosti. [Tvar sprite](sprite-shape.md#pixel-clamps) |
| **Zploštit na rovinu země** | vypnuto | | [Tvar sprite](sprite-shape.md#flatten-onto-ground-plane) |

### Barvy tepla (zavřeno) {#heat-colours-closed}

| Ovládání | Výchozí | Podrobnosti |
|---|---|---|
| Vzorky skupin a **Oddělení barev** (jen Týmové teplo) | 1,4 | [Týmové teplo](team-heat.md) |
| Editor **Škála tepla** (*Kladná (přičítající týmy)* u Rozdílu, *Škála krytí* u Týmového tepla) | průhledná → červená → žlutá → bílá | [Barva a expozice](colour-and-exposure.md#the-ramp-editor) |
| **Obnovit na průhledná → červená → žlutá → bílá** | | |
| Škála **Záporná (odečítající týmy)** (jen Rozdíl) | průhledná → zelená → modrá → fialová | [Rozdíl](difference.md#colours) |

### Omezení pixelů sprite (zavřeno) {#sprite-pixel-clamps-closed}

| Ovládání | Výchozí | Rozsah (strop tažení) | Podrobnosti |
|---|---|---|---|
| **Min. poloměr v pixelech** | 1 px | 0-16 (512) | [Tvar sprite](sprite-shape.md#pixel-clamps) |
| **Max. poloměr v pixelech** | 96 px | 2-1024, logaritmicky (8192) | [Tvar sprite](sprite-shape.md#pixel-clamps) |

### Hloubka (otevřeno) {#depth-open}

| Ovládání | Výchozí | Podrobnosti |
|---|---|---|
| **Skrýt za terénem** | zapnuto | [Hloubka a vyřazování](depth-and-culling.md#hide-behind-terrain) |
| **Skryté za geometrií** | 0,8 (*o 80 % ztmavené*) | [Hloubka a vyřazování](depth-and-culling.md#hidden-behind-geometry) |

### Vyřazení podle vzdálenosti (zavřeno) {#distance-culling-closed}

| Ovládání | Výchozí | Rozsah (strop tažení) | Podrobnosti |
|---|---|---|---|
| **Blízko** | vypnuto (0) | 0,5-5000 m, logaritmicky, dolní konec trati = vypnuto (200 000) | [Hloubka a vyřazování](depth-and-culling.md#distance-culling) |
| **Daleko** | vypnuto (0) | 1-200 000 m, logaritmicky, dolní konec = vypnuto (10 000 000) | [Hloubka a vyřazování](depth-and-culling.md#distance-culling) |
| **Řezat rovinou** | zapnuto | | [Hloubka a vyřazování](depth-and-culling.md#distance-culling) |
| **Řezat i úroveň** | zapnuto | | [Hloubka a vyřazování](depth-and-culling.md#distance-culling) |

Klávesy: `[` a `]` posouvají vzdálenou mez dovnitř a ven, `\` ji přepíná ([Hloubka a vyřazování](depth-and-culling.md#keyboard)).

### Směr a Hodnota {#direction-and-value}

Pod sekcí Tvar tepla jsou ještě dvě sekce. **Směr** kreslí každý řádek jako výseč a přidává šipky: viz [Směrové teplo](directional-heat.md). **Hodnota** váží teplo podle toho, co každý řádek stál nebo vydělal: viz [Vážení hodnotou](value-weighting.md).

## Co se ukládá {#what-is-saved}

Výše uvedená nastavení tepla se mezi relacemi neukládají: načtení stránky obnoví výchozí hodnoty. V prohlížeči se uchovávají dvě věci: poslední rychlost přehrávání (`heat3d.speed`, viz [Časová osa](timeline.md)) a nastavení vzdálených figur [překryvu figur](box-replay.md) (styl symbolů, velikost, značky zásahů a podobně). Stejně tak jazyk, [převrácené osy světa](camera.md#invert-world-axis), zapamatovaná jména vozů na kartě závodů a [knihovna levelů](level-library.md). Úplný seznam je na stránce [Uložená nastavení](ref-settings-storage.md).
