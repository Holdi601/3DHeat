---
title: "3D levely"
parent: "Levely a geometrie pozadí"
nav_order: 2
lang: "cs"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: true
---

# 3D levely

3D level je model místa – kopce, ulice, budovy – ve kterém vaše data leží. Umožní vidět, na kterém patře, kopci nebo střeše je teplota. Prohlížeč ho rozdělí na zemi (plnou), stavby (průhledné, abyste se dovnitř mohli podívat) a vodu.

## Načtení 3D levelu {#load-a-3d-level}

1. Nejdřív načtěte svá data ([Jak dostat data dovnitř](getting-data-in.md)). Model musí používat stejný světový prostor a jednotku jako data, Y nahoru.
2. V **Pozadí / úroveň** zvolte **Cíl zjednodušení**. Ponechte *Plný – bez zjednodušení*, pokud model není obrovský.
3. Stiskněte **3D model…** a vyberte soubor `.glb`, `.gltf`, `.obj`, `.stl` nebo `.ply`.
4. Počkejte na řádek průběhu. **Zrušit** ho zastaví.
5. Stiskněte **F** v pohledu. Země je plná, stavby jsou průhledné skořepiny, voda je plochá.
6. Doladěte vzhled v [Vzhled úrovně](level-appearance.md). Stiskněte **Uložit do knihovny**, abyste výsledek ponechali ([Knihovna úrovní](level-library.md)).

![Načtený 3D level: neprůhledná země s vrstevnicemi, průhledné budovy, plochá voda](../assets/img/en/model-levels-loaded.webp)

**3D model…** načte síť levelu. Zpracuje se, zařadí a zjednoduší na pozadí ve workeru ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) s řádkem průběhu a tlačítkem **Zrušit**: *Čtu model*, *Zpracovávám soubor*, *Balím N textur*, *Zařazuji N částí*, *Zjednodušuji zemi (N trojúhelníků)*, *Zjednodušuji stavby (N trojúhelníků)*, *Sestavuji drátový model*.

## Formáty {#formats}

| Formát | Co se čte | Limity |
|---|---|---|
| `.glb` | Každá síťová primitiva s `mode` 4 (trojúhelníky) nebo bez režimu, s aplikovanou světovou transformací každého uzlu; `POSITION`; `COLOR_0` (vec3 nebo vec4) jako barva vrcholu; `baseColorTexture` materiálu a jeho `TEXCOORD_n` jako textura; názvy uzlů a sítí jako názvy částí. | Čáry a body se přeskakují. |
| `.gltf` | Totéž. | Jen s vloženými buffery: glTF, které odkazuje na externí `.bin`, se odmítne hláškou *Exportujte jako jeden soubor .glb, aby byla geometrie vložena.* |
| `.obj` | Plochy, s bloky `o` a `g` jako částmi. | Jen geometrie (bez materiálů). |
| `.stl` | Binární i ASCII (`solid …`). | Jedna část. |
| `.ply` | Jen ASCII. | Binární PLY se odmítne hláškou *Převeďte do .glb nebo binárního .stl.* |

Jen geometrie: pozice, normály a trojúhelníky sloučené do jednoho bufferu, plus barvy a texturové souřadnice, kde jsou ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Model bez trojúhelníků se odmítne. Model musí být ve stejném světovém prostoru a jednotce jako data (Y nahoru): nic se nepřetváří, aby sedělo.

## Země, stavby a voda {#ground-structures-and-water}

Level se při importu rozdělí do tří tříd, protože chtějí opačné zacházení ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Země** – kreslená neprůhledně a stínovaná s reliéfními náznaky (sklon, vrstevnice, barevný přechod výšky), aby se podle ní dala číst poloha.
- **Stavby** – budovy a rekvizity stojí mezi kamerou a teplotou uvnitř sebe, takže se kreslí jako **průhledná skořepina** (slabé plochy s jasným okrajem a odstraněnými duplicitními hranami) – nebo, když mají textury, plné ve svých texturách.
- **Voda** – plochá, bez terénních náznaků: vrstevnice přes jezero je nesmysl.

Každá část (uzel glTF, objekt OBJ nebo skupina) se zařadí sama, podle prvního pravidla, které platí:

1. **Štítek exportéru.** Název začínající `ground:`, `structure:` nebo `water:` (nebo s `|` místo `:`) se vezme doslova. Exportéry projektu takto označují každou část.
2. **Názvy vody.** `water` jako slovo (ne *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Názvy země.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Názvy staveb.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometrie.** Část, která pokrývá víc než 25 % plochy X-Z mapy a víc než 60 % plochy svých trojúhelníků směřuje nahoru, je země. Část, u které méně než 45 % směřuje nahoru, nebo která je vyšší než 15 % výšky levelu a pokrývá méně než 10 % jeho plochy, je stavba. Podíl směřující nahoru se váží plochou, takže dům se neoznačí za plochý kvůli střeše.
6. **Jinak země** – nejasná část je ve výchozím stavu země, protože výchozí téměř neviditelná skořepina by dělala dojem, že level je chyba vykreslování.

Model, který je jedinou částí zařazenou jako stavba, se místo toho udělá zemí (*jediná nepojmenovaná síť – bere se jako země*).

### Navigační sítě {#navigation-meshes}

Část pojmenovaná `nav:…` (`nav:walkable` z exportéru levelu) je navigační síť: místo, kde může voják stát. Je zařazena jako země (*navigační síť – nekreslí se, protože leží na zemi; kliknutí ji přesto najdou*), ale **nekreslí se**. Je přetažena přes zemi, ze které vznikla, a je s ní rovinná na centimetry, a kdyby se kreslila jako země, dvě plochy by se o každý pixel přetahovaly: na levelu s vypečenou texturou země se celá hratelná plocha ukázala jako ostře ohraničené skvrny šedé a béžové, jedna na každý trojúhelník sítě. Zůstává nezjednodušená, aby [výběr kliknutím](camera.md#click-to-pick) mohl říct, zda je místo pochůzné. Položky knihovny ji neuchovávají.

**Zobrazit zařazení částí (N)** v panelu (ukazuje se u modelů s více než jednou částí) vypíše každou část s její třídou a důvodem – *označeno exportérem*, *název odpovídá vzoru*, *pokrývá X % mapy, Y % směřuje nahoru*, *Y % směřuje nahoru, Z % výšky levelu*, *nejednoznačné – zařazeno jako země*. Chcete-li jednu změnit, přejmenujte část ve zdrojovém modelu a importujte znovu: rozdělení je zapečeno do indexových bufferů.

## Zjednodušení {#simplification}

**Cíl zjednodušení** nastaví rozpočet trojúhelníků pro další import ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Nastavení | Trojúhelníky |
|---|---|
| *Plný – bez zjednodušení* (výchozí) | všechny |
| *Vysoký – 8M trojúhelníků* | 8 000 000 |
| *Střední – 3M trojúhelníků* | 3 000 000 |
| *Nízký – 800k trojúhelníků* | 800 000 |
| *Silueta – 100k trojúhelníků* | 100 000 |

Rozpočet se rozdělí **60 % na stavby a 40 % na zemi**, zjednodušují se odděleně – stavby ztrácejí tvar nejrychleji při decimaci. Voda se nezjednodušuje. Zjednodušení je zmenšování hran s kvadratickými metrikami chyby ([meshoptimizer](https://github.com/zeux/meshoptimizer), přes WebAssembly), po sloučení splývajících vrcholů, takže siluety a ostré hrany přežijí. Poznámka k importu hlásí `zdroj → nyní trojúhelníků, odchylka X %`, rozdělení na zem / stavby / vodu přes části a – když se použil *Plný* u modelu nad 8M trojúhelníků – navrhne *Vysoký* (až 30M), nebo *Střední* (nad to). Bez WebAssembly zjednodušovač není k dispozici a import to řekne.

Levely z vlastních exportérů projektu už mají rozpočet; cíl existuje pro surová umělecká data bez rozpočtu.

## Textury {#textures}

`.glb`, jehož části nesou textury základní barvy, se kreslí v nich – například export závodní trati nese jednu na každou dlaždici terénu a jednu na každý umístěný model.

Textura země se ve výchozím stavu zobrazí, je-li přítomna; stavby, které nesou textury, začínají **plné, ve vlastních texturách** (obrubníky, svodidla, pneumatikové zdi a značky jsou okraje silnice, ne budovy, do kterých se dá dívat), s vypnutým drátovým modelem a vypnutým plochým stínováním. Viz [Vzhled úrovně](level-appearance.md).

## Velké levely {#large-levels}

- Nad **300 000** trojúhelníky staveb se hrany staveb na začátku vypnou a neprůhlednost ploch se nastaví na 35 %: s hranou v každém pixelu čtvrť působí jako plochá bílá.
- Daleká rovina kamery se rozšíří tak, aby se vešla úroveň ([Levely](levels.md#what-a-level-does-for-the-heat)).

## Pro vývojáře {#for-developers}

### Atlas textur {#texture-atlas}

Každá textura se zabalí do **jednoho atlasu** ve workeru importu ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), takže úroveň zůstává jedním vykreslením, jedním vzorkovačem a jedním atributem texturových souřadnic na obou backendech:

- balí se do pásů v každém obrázku jeho vlastní velikosti, zmenšuje se jen tehdy, když by se sada nevešla do **8192 px** v žádném směru (výchozí limit velikosti textury WebGPU);
- **16pixelový okraj** kolem každého obrázku a jen 5 úrovní mipů, které ten okraj chrání, takže vzdálená značka nikdy nevzorkuje texturu svého souseda;
- **opakující se textury** zůstávají opakující se. Obrázek, jehož vzorkovač glTF se opakuje (výchozí v glTF) a jehož texturové souřadnice vybíhají z 0..1 – zeď z cihel, jejíž UV běží podél ní od 0 do 40 – se stane *dlaždicí*: její vrcholy si ponechají vlastní souřadnice a 16bitové číslo dlaždice, a shadery obalí souřadnici do obdélníku dlaždice pro každý pixel, s úrovní mipu z neobaleného souřadnice, aby švy nebyly vidět. Okraj dlaždice drží svou vlastní protilehlou hranu. Osa, jejíž vzorkovač svírá, se sevře; obrázek, jehož souřadnice zůstávají v 0..1, se kreslí jako dřív. Level s dlaždicemi stojí o 4 bajty na vrchol víc.

### Smlouva s exportérem {#the-exporter-contract}

Co prohlížeč od levelu potřebuje, ať ho vytvořil kdokoli:

- jeden soběstačný `.glb`;
- `POSITION` float32, primitiva trojúhelníků;
- názvy uzlů `ground:*`, `structure:*` a `water:*` (cokoli jiného se zařadí podle pravidel výše) a `nav:*` pro navigační síť, která se uchovává, ale nekreslí;
- souřadnice ve světovém prostoru, **Y nahoru**, ve stejné jednotce jako telemetrie, takže data sedí na levelu bez jakéhokoli kroku umisťování.
