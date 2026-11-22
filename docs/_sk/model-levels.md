---
title: "3D levely"
parent: "Levely a geometria pozadia"
nav_order: 2
lang: "sk"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: true
---

# 3D levely

3D level je model miesta - kopcov, ulíc, budov - v ktorom sa nachádzajú vaše dáta. Vďaka nemu vidíte, na ktorom poschodí, kopci alebo streche je teplo. Prehliadač rozdeľuje level na zem (plná), objekty (priehľadné, aby ste vnútro videli) a vodu.

## Načítanie 3D levelu {#load-a-3d-level}

1. Najprv načítajte svoje dáta ([Ako dostať dáta dnu](getting-data-in.md)). Model musí používať rovnaký svetový priestor a jednotku ako dáta, s osou Y smerom nahor.
2. V **Pozadie / level** vyberte **Cieľ zjednodušenia**. Nechajte *Plný – bez zjednodušenia*, iba ak je model veľmi veľký.
3. Stlačte **3D model…** a vyberte súbor `.glb`, `.gltf`, `.obj`, `.stl` alebo `.ply`.
4. Počkajte na riadok priebehu. **Zrušiť** ho zastaví.
5. V zobrazení stlačte **F**. Zem je plná, objekty sú priehľadné škrupiny, voda je plochá.
6. Vzhľad doladíte v [Vzhľad levelu](level-appearance.md). Stlačte **Uložiť do knižnice**, ak výsledok chcete uchovať ([Knižnica levelov](level-library.md)).

![3D level načítaný: nepriehľadná zem s vrstevnicami, priehľadné budovy, plochá voda](../assets/img/en/model-levels-loaded.webp)

**3D model…** načíta sieť levelu. Spracuje sa, roztriedi a zjednoduší na pozadí v pracovnom procese ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) s riadkom priebehu a tlačidlom **Zrušiť**: *Načítavanie modelu*, *Spracovanie súboru*, *Balenie N textúr*, *Triedenie N častí*, *Zjednodušovanie zeme (N trojuholníkov)*, *Zjednodušovanie objektov (N trojuholníkov)*, *Vytváranie drôtového modelu*.

## Formáty {#formats}

| Formát | Čo sa načíta | Limity |
|---|---|---|
| `.glb` | Každá sieťová časť s `mode` 4 (trojuholníky) alebo bez `mode`, s použitím svetovej transformácie každého uzla; `POSITION`; `COLOR_0` (vec3 alebo vec4) ako farba vrcholov; `baseColorTexture` materiálu a jeho `TEXCOORD_n` ako textúra; názvy uzlov a sietí ako názvy častí. | Čiary a body sa preskočia. |
| `.gltf` | To isté. | Len s vloženými dátovými blokmi: glTF, ktoré odkazuje na externý `.bin`, sa odmietne hlásením *Exportujte ako jeden súbor .glb, aby geometria bola vložená.* |
| `.obj` | Plochy, bloky `o` a `g` ako časti. | Len geometria (bez materiálov). |
| `.stl` | Binárny a ASCII (`solid …`). | Jedna časť. |
| `.ply` | Len ASCII. | Binárny PLY sa odmietne hlásením *Prevedte na .glb alebo binárny .stl.* |

Len geometria: pozície, normály a trojuholníky zlúčené do jedného buffera, plus farby a súradnice textúr, ak sú k dispozícii ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Model bez trojuholníkov sa odmietne. Model musí byť v rovnakom svetovom priestore a jednotke ako dáta (Y smerom nahor): nič sa netransformuje, aby sedel.

## Zem, objekty a voda {#ground-structures-and-water}

Pri importe sa level delí na tri triedy, pretože každá sa musí zobraziť inak ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Zem** - kreslí sa nepriehľadne a tieňuje s reliéfnymi znakmi (sklon, vrstevnice, farebný prechod podľa výšky), aby sa dala poloha čítať voči nej.
- **Objekty** - budovy a rekvizity stoja medzi kamerou a teplom v nich, preto sa kreslia ako **priehľadná škrupina** (slabé plochy s jasným okrajom plus zdvojené hrany odstránené) - alebo, ak sú textúrované, ako plné v svojich textúrach.
- **Voda** - plochá, bez terénnych znakov: vrstevnica cez jazero nedáva zmysel.

Každá časť (uzol glTF, objekt OBJ alebo skupina) sa triedi samostatne, podľa prvého pravidla, ktoré platí:

1. **Označenie od exportéra.** Názov začínajúci na `ground:`, `structure:` alebo `water:` (alebo na `|` namiesto `:`) sa berie doslova. Exportéry projektu označujú každú časť takto.
2. **Názvy vody.** `water` ako samostatné slovo (nie *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Názvy zeme.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Názvy objektov.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometria.** Časť, ktorá pokrýva viac ako 25 % plochy X-Z mapy a z ktorej viac ako 60 % plochy trojuholníkov smeruje nahor, je zem. Časť, ktorej je menej ako 45 % smerujúcich nahor, alebo je vyššia ako 15 % výšky levelu a pokrýva menej ako 10 % jeho plochy, je objekt. Podiel smerujúci nahor sa počíta podľa plochy, takže dom sa nepovažuje za plochý len preto, že má strechu.
6. **Inak zem** - nejednoznačná časť sa predvolene berie ako zem, lebo takmer neviditeľná škrupina by spravila dojem, že level sa nevykreslil správne.

Model, ktorý je jednou časťou zaradenou ako objekt, sa namiesto toho urobí zemou (*jediná nepomenovaná sieť - berie sa ako zem*).

### Navigačné siete {#navigation-meshes}

Časť s názvom `nav:…` (napríklad `nav:walkable` od exportéra levelu) je navigačná sieť: miesto, kde môže vojak stáť. Zobrazuje sa ako zem (*navigačná sieť - nekreslí sa, pretože leží na zemi; kliknutia ju stále nájdu*), ale **nekreslí sa**. Je položená na zem, z ktorej vznikla, a leží s ňou v rovine s presnosťou na centimetre. Ak by sa kreslila ako zem, dva povrchy by sa pre každý pixel prali: na leveli s vypálenou textúrou zeme by sa celá hrateľná plocha ukazovala ako ostro ohraničené škvrny sivej a béžovej, jedna pre každý trojuholník siete. Ponecháva sa nezjednodušená, aby [výber kliknutím](camera.md#click-to-pick) vedel povedať, či je miesto priechodné. Položky knižnice ju neuchovávajú.

**Zobraziť triedenie častí (N)** na paneli (zobrazí sa pri modeloch s viac ako jednou časťou) vypíše každú časť s jej triedou a dôvodom - *označené exportérom*, *názov zodpovedá vzoru*, *pokrýva X % mapy, Y % smeruje nahor*, *Y % smeruje nahor, Z % výšky levelu*, *nejednoznačné - predvolene zem*. Ak chcete niektorú zmeniť, premenujte časť v zdrojovom modeli a importujte znova; rozdelenie je zapečené do indexových buferov.

## Zjednodušenie {#simplification}

**Cieľ zjednodušenia** nastavuje rozpočet trojuholníkov pre ďalší import ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Nastavenie | Trojuholníky |
|---|---|
| *Plný – bez zjednodušenia* (predvolené) | všetky |
| *Vysoký – 8 mil. trojuholníkov* | 8 000 000 |
| *Stredný – 3 mil. trojuholníkov* | 3 000 000 |
| *Nízky – 800 tis. trojuholníkov* | 800 000 |
| *Silueta – 100 tis. trojuholníkov* | 100 000 |

Rozpočet sa rozdelí **60 % na objekty a 40 % na zem**, zjednodušujú sa samostatne - objekty strácajú tvar najrýchlejšie pri decimácii. Voda sa nezjednodušuje. Zjednodušenie je kolaps hrán s kvadratickou chybovou metrikou ([meshoptimizer](https://github.com/zeux/meshoptimizer), cez WebAssembly), po zlúčení splývajúcich vrcholov, takže siluety a ostré hrany zostanú zachované. Poznámka k importu uvádza `zdroj → teraz trojuholníkov, odchýlka X %`, rozdelenie zeme / objektov / vody medzi časti a - ak sa použilo *Plný* na modeli nad 8 mil. trojuholníkov - navrhne *Vysoký* (až 30 mil.) alebo *Stredný* (viac). Bez WebAssembly zjednodušovač nie je k dispozícii a import to oznámi.

Levely z exportérov projektu už majú rozpočet nastavený; cieľ existuje pre surové umelecké diela bez rozpočtu.

## Textúry {#textures}

`.glb`, ktorého časti nesú textúry základnej farby, sa kreslí s nimi - napríklad export pretekárskej trate má jednu na každú dlaždicu terénu a jednu na každý umiestnený model.

Textúra zeme sa zobrazuje predvolene, ak je prítomná; objekty s textúrami začínajú **plné, vo svojich textúrach** (obrubníky, zvodidlá, pneumatikové steny a značky sú okraje cesty, nie budovy, do ktorých by ste nazerali), s vypnutým drôtovým modelom a vypnutým plochým tieňovaním. Pozri [Vzhľad levelu](level-appearance.md).

## Veľké levely {#large-levels}

- Nad **300 000** trojuholníkmi objektov sa okraje objektov na začiatku vypnú a nepriehľadnosť plôch sa nastaví na 35 %: keď je hrana v každom pixeli, štvrť sa javí ako plošne biela.
- Vzdialená rovina kamery sa rozšíri, aby sa zmestil celý level ([Levely](levels.md#what-a-level-does-for-the-heat)).

## Pre vývojárov {#for-developers}

### Atlas textúr {#texture-atlas}

Každá textúra sa zabalí do **jedného atlasu** v importnom pracovnom procese ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), takže level zostáva jedným vykreslením, jedným vzorkovačom a jedným atribútom súradníc textúry na oboch backendoch:

- balí sa do radov pri vlastnej veľkosti každého obrázka, zmenší sa len vtedy, ak sa set nezmestí do **8192 px** na žiadnu stranu (predvolený limit veľkosti textúry vo WebGPU);
- **16-pixelový okraj** okolo každého obrázka a len 5 úrovní mipmap, ktoré tento okraj chráni, aby vzdialený nápis nikdy nevzorkoval textúru suseda;
- **opakujúce sa textúry** zostávajú opakujúce. Obrázok, ktorého vzorkovač glTF opakuje (predvolené v glTF) a ktorého súradnice textúry presahujú 0..1 - tehlová stena, ktorej UV beží od 0 do 40 pozdĺž nej - sa stáva *dlaždicou*: jej vrcholy si ponechajú svoje súradnice a 16-bitové číslo dlaždice a shadery obalia súradnicu do obdĺžnika dlaždice pre každý pixel, s úrovňou mipmap z neobaleného súradnice, aby sa švy nezobrazovali. Okraj dlaždice drží svoju vlastnú opačnú hranu. Os, ktorej vzorkovač orezáva, sa orezáva; obrázok, ktorého súradnice zostávajú v rozsahu 0..1, sa kreslí ako doteraz. Level s dlaždicami stojí o 4 bajty viac na vrchol.

### Zmluva s exportérom {#the-exporter-contract}

Čo prehliadač od levelu potrebuje, bez ohľadu na to, kto ho vytvoril:

- jeden samostatný `.glb`;
- `POSITION` float32, primitíva trojuholníkov;
- názvy uzlov `ground:*`, `structure:*` a `water:*` (všetko ostatné sa triedi podľa pravidiel vyššie) a `nav:*` pre navigačnú sieť, ktorá sa ponecháva, ale nekreslí;
- súradnice vo svetovom priestore, **Y smerom nahor**, v rovnakej jednotke ako telemetria, takže dáta sedia na leveli bez akéhokoľvek umiestňovania.
