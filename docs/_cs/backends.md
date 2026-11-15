---
title: "Dva backendy"
parent: "Vnitřní fungování vykreslování"
nav_order: 1
lang: "cs"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Dva backendy

Prohlížeč může stránce dát použít grafickou kartu dvěma způsoby, WebGPU (novější) a WebGL2. Prohlížeč umí oba a sám vybere lepší, takže obvykle nemusíte dělat nic. Který běží, zjistíte v **Backend** v přehledu statistik (vpravo nahoře v zobrazení).

![Přehled statistik: Backend, FPS, Snímek, Řádky v okně, Sprity / snímek, Rozpočet, Rozliš. tepla, Pokrytí](../assets/img/en/performance-stats-overlay.webp)

Prohlížeč má dva úplné renderery za jedním rozhraním ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) a **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Oba kreslí stejný obrázek stejnými algoritmy; shadery existují v WGSL i v GLSL ES 3.00 vedle sebe. První řádek přehledu statistik, **Backend**, říká, který běží. Když na něj najedete myší, ukáže se, proč WebGPU nebyl použit, pokud nebyl.

## Pro vývojáře {#for-developers}

### Jak se jeden vybere {#how-one-is-chosen}

Plátno může držet jen jeden druh kontextu, takže se volba udělá jednou, ještě před jakýmkoli kreslením ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Pokud není vynucen WebGL2 a existuje `navigator.gpu`, vyžádá se adaptér s `powerPreference: 'high-performance'` a zařízení, a vytvoří se renderer WebGPU. Každé selhání se zapamatuje jako důvod.
2. Byl-li WebGPU vynucen a selhal, skončí se: zobrazení ukáže *Renderer nelze inicializovat.* s důvodem.
3. Jinak se vytvoří renderer WebGL2 (také s žádostí o adaptér s vysokým výkonem). Pokud WebGL2 není k dispozici, nebo nemůže kreslit do float textur (`EXT_color_buffer_float`), zobrazení ukáže chybu.

`powerPreference: 'high-performance'` brání tomu, aby notebook s přepínatelnou grafikou dal stránce integrovanou kartu. Jinak stránka nemá co rozhodovat: hardwarová akcelerace je nastavení prohlížeče.

### Přepínače v adrese {#url-switches}

Připište k adrese stránky, například `http://127.0.0.1:5273/?backend=webgl2`.

| Parametr | Účinek |
|---|---|
| `?backend=webgpu` | Použít WebGPU, nebo selhat. |
| `?backend=webgl2` | Použít WebGL2, i kde je WebGPU k dispozici. Oddělí „tohle se kreslí špatně“ od „tohle se kreslí špatně na WebGPU“. |
| `?heat=f16` | Vynutit 16bitovou cestu akumulace tepla na obou backendech ([Akumulace v half-float](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: číst chyby GL během snímku a zpřístupnit je v `renderer.heatDebug`. Ve výchozím stavu vypnuto, protože `getError` zastavuje pipeline. |
| `?occdebug=<n>` | Pomůcka pro vývojáře WebGL2: nahradí teplo ladicími hodnotami okluze. Není pro běžné použití. |

### Rozdíly, na kterých záleží {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Uložení řádků | Storage buffery: index řádku je index pole. Žádá si největší velikost storage bufferu, kterou adaptér dovolí, a velikosti bufferů. | Celočíselné textury (8 192 texelů široké) adresované z `gl_VertexID` přes texturu indexů bloků, která se mění každý snímek. |
| 32bitová akumulace tepla | Když adaptér nabízí `float32-blendable` i `float32-filterable` | Když je přítomno `EXT_float_blend` |
| Jinak | 16bitová (`r16float`) | 16bitová (`R16F`) |
| Rozsah hloubky | [0, 1]; engine před sebe násobí přemapování matic three.js z [-1, 1]. Bez něj by paralelní projekce, jejíž hloubka je lineární, skoro celá spadla pod 0 a byla by tiše oříznuta. | [-1, 1], použito beze změny |
| Uniformy | Kruh slotů zarovnaných na 256 bajtů, jeden na každé kreslení, vázaný posunem. `queue.writeBuffer` se řadí ve frontě, takže kdyby se jeden buffer přepisoval při každém kreslení, každé kreslení by četlo poslední zápis. Uniform blok průchodu teplem je přesně jeden 256bajtový slot. | Obyčejné uniformy |
| Cíl tepla pod rozlišením plátna | Dostane vlastní hloubkovou texturu (všechny přílohy průchodu musí mít stejnou velikost) | |
| Zachycení snímku | `captureFrame()` vykreslí složení znovu do mimoobrazovkového cíle a přečte ho (headless Chromium renderuje WebGPU, ale svou plochu nikdy nesloží) | Přečte výchozí framebuffer při dalším vykresleném snímku |
| Čtení zpět | Staging buffery se drží a znovu používají; jeden čtenář v letu najednou | `readPixels`, který se ptá ovladače, které dvojice formát/typ jsou povolené |

Oba backendy nahrávají tabulku křivek sprite jako half floaty; `queue.writeTexture` ve WebGPU kopíruje surové bajty, takže se data nejprve zakódují do binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Limity textur {#texture-limits}

`texStorage2D` nad `MAX_TEXTURE_SIZE` nevyhodí chybu: alokace se zahodí, pozdější nahrávání selže a vzorkování vrátí nulu. Pomocná funkce WebGL2 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) kontroluje oba rozměry proti limitu a vyhodí chybu s velikostí. Textura indexů bloků je dvourozměrná (4 096 široká), takže nemůže limit přerůst. `src/render/limits.test.ts` připíná každý rozměr textury k limitům, které stojí za podporu. Renderer WebGL2 také odmítne zařízení, jehož maximální velikost textury je menší než 8 192 šířka řádkové textury.

### Testování obou {#testing-both}

`npm run smoke` ovládá skutečnou aplikaci v headless Chromium na WebGL2 (ve výchozím nastavení `http://127.0.0.1:5273/`). Pro WebGPU předejte `"http://127.0.0.1:5273/?backend=webgpu"` do `node tools/smoke.mjs`, pro cestu half-float `npm run smoke:f16`. `tools/probe-webgpu.mjs` a `tools/probe-present.mjs` (uvedené mezi vývojářskými nástroji v [Nástroje příkazové řádky](ref-tools.md)) diagnostikují dostupnost adaptéru a prezentace v headless prohlížečích.
