---
title: "GPU-memória tartózkodása"
parent: "Renderelés belső működése"
nav_order: 5
lang: "hu"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# GPU-memória-rezidencia

A grafikus kártyának csak ennyi memóriája van. Ha az adatod nem fér bele, a nézegető azt mutatja, ami belefér, és ezt ki is mondja: a statisztikai átfedésen megjelenik egy borostyánsárga **Nincs a memóriában** sor a kihagyott sorok számával. Egy csonkított adathalmaz, amely teljesnek látszik, a legrosszabb hiba, amit egy elemzőeszköz elkövethet, ezért ezt a sort soha nem rejtjük el.

![A statisztikai átfedés a borostyánsárga Nincs a memóriában sorral](../assets/img/en/gpu-memory-not-resident.webp)

Több adat férjen el: emeld a GPU-keretet a **Erőforráskeretek** alatt, és töltsd újra ([Memória és keretek](memory-and-budgets.md#raising-the-gpu-budget)), vagy előbb szűkítsd az adatot, vagy használj több memóriával rendelkező kártyát.

## Fejlesztőknek {#for-developers}

### Hogyan tárolódnak a sorok a GPU-n {#how-rows-are-stored-on-the-gpu}

A sorokat egyszer töltjük fel, amikor egy adathalmaz megérkezik, **darabokban**, egyenként 8 388 608 soros (2²³) egységekben ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Minden darab a saját határoló dobozához és időtartamához van kvantálva:

| Adat | Formátum | Bájt soronként |
|---|---|---|
| X, Y, Z pozíció és a csoportazonosító | négy 16 bites előjel nélküli egész (RGBA16UI WebGL2-n); X, Y, Z a darab határoló dobozán belül | 8 |
| Idő és élettartam (ha az adathalmaznak van idő és személy is) | két 16 bites előjel nélküli egész (RG16UI): idő a darab időtartamán belül; élettartam, ahol a 65 535 azt jelenti: „nincs következő minta” | 4 |

A darabonkénti határoló dobozok teszik elegendővé a 16 bitet: egy darab általában a térkép egy töredékét fedi le, így a kvantálási lépés a kilométeres térkép esetében is jóval egy centiméter alatt marad, messze a valódi telemetria zaja alatt. A negyedik csatornán utazó csoportazonosító ingyenes - ezért lehet legfeljebb 4 096 csoport ([Csoportok](sessions-persons-groups.md#limits)).

WebGL2-n minden darab 8 192 texel széles textúra, teljes textúrasorokra kiegészítve; a sorokat a `gl_VertexID`-ről érjük el egy képkockánként frissülő blokkindex-textúrán keresztül. WebGPU-n tárolópufferek.

További soronkénti GPU-memória, használatkor foglalva:

- minden aktív oszlopszűrő [szűrő](filters.md): 4 bájt soronként (32 bites lebegőpontos értékek vagy kategóriaazonosítók), darabonként feltöltve, az első használatkor;
- [vonalhő](line-heat.md): 8 bájt soronként (minden szakasz kezdete, a adat határoló dobozán belül kvantálva, és a jelzői), amíg a Vonalak mód be van kapcsolva.

Ehhez jönnek a renderelési célok: a jelenet színe és mélysége, a hőcél és annak másodpéldánya (négy csatorna a [Csapat hő](team-heat.md) oldalon), a mélységhámozási rétegek a [takarásért](depth-and-culling.md); valamint a pálya geometriája.

### A keretet a feltöltéskor kényszerítjük ki {#the-budget-is-enforced-at-upload}

A WebGL olyan foglalásokat is elfogad, amelyeket nem tud kiszolgálni, és ilyenkor vagy elveszíti a kontextust, vagy irreálisan drágán a rendszermemóriára vált, ezért a GPU-keretet az adathalmaz feltöltésekor kényszerítjük ki ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- a darabok sorrendben töltődnek fel (vagyis időrendben), amíg férnek;
- az első darab, amely nem fér bele, **részlegesen** töltődik fel - annyi teljes textúrasorral, amennyit a maradék keret tartani tud -, és nem egyáltalán, így egy olyan keret, amely egész darabot nem tud tartani, is annyit mutat, amennyit tud; és mivel a sorok időrendben vannak, a látott rész összefüggő időszakasz;
- minden utána következő sor **nincs a memóriában**.

A hiányt nem rejtjük el: a statisztikai átfedés egy borostyánsárga **Nincs a memóriában** sort mutat a be nem férő sorok számával, ha az nagyobb nullánál. Egy csonkított adathalmaz, amely teljesnek látszik, egy elemzőeszköz legrosszabb hibája. A betöltés előtti [illeszkedésvizsgálat](memory-and-budgets.md#the-fit-check) ezt az esetet hivatott megelőzni.

A renderelő által használt keret az **Erőforráskeretek** GPU-kerete, ugyanaz a szám, amelyet az illeszkedésvizsgálat használ - a felismert érték fölött is, egészen a csúszka felső határáig (lásd: [A GPU-keret emelése](memory-and-budgets.md#raising-the-gpu-budget)). A feltöltéskor lép életbe; ha később változtatod, a következő betöltésnél érvényesül.
