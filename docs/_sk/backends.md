---
title: "Dva backendy"
parent: "Vnútorné časti renderovania"
nav_order: 1
lang: "sk"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---


# Dva backendy

Prehliadač môže stránke dovoliť použiť grafickú kartu dvoma spôsobmi, WebGPU (novší) a WebGL2. Prehliadač oba podporuje a sám vyberie lepší, takže zvyčajne nemusíte nič robiť. Pozrite si, ktorý používate: **Backend** v prehľade štatistík (vpravo hore v zobrazení).

![Prehľad štatistík: Backend, FPS, Snímka, Riadky v okne, Sprity / snímka, Rozpočet, Rozlíšenie tepla, Pokrytie](../assets/img/en/performance-stats-overlay.webp)

Prehliadač má za jedným rozhraním ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)) dva úplné vykresľovače: **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) a **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Oba kreslia ten istý obraz rovnakými algoritmami; shadery existujú v WGSL aj v GLSL ES 3.00 vedľa seba. Prvý riadok prehľadu štatistík, **Backend**, hovorí, ktorý beží; keď nad ním podržíte myš, ukáže sa, prečo sa WebGPU nepoužilo, ak sa nepoužilo.

## Pre vývojárov {#for-developers}

### Ako sa jeden vyberie {#how-one-is-chosen}

Plátno môže držať len jeden druh kontextu, preto sa výber urobí raz, pred akýmkoľvek kreslením ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Ak nie je WebGL2 vynútené: ak existuje `navigator.gpu`, vyžiadajte adaptér s `powerPreference: 'high-performance'` a zariadenie a vytvorte vykresľovač WebGPU. Každé zlyhanie sa zapamätá ako dôvod.
2. Ak bolo WebGPU vynútené a zlyhalo, zastavte sa: zobrazenie ukáže *Vykresľovač sa nedá inicializovať.* s dôvodom.
3. Inak vytvorte vykresľovač WebGL2 (tiež s adaptérom pre vysoký výkon). Ak WebGL2 nie je k dispozícii, alebo nevie kresliť do float textúr (`EXT_color_buffer_float`), zobrazenie ukáže chybu.

`powerPreference: 'high-performance'` zabráni tomu, aby notebook s prepínateľnou grafikou dal stránke integrovanú kartu. Inak stránka nemá čo rozhodovať: hardvérové zrýchlenie je nastavenie prehliadača.

### Prepínače v adrese {#url-switches}

Pripíšte k adrese stránky, napríklad `http://127.0.0.1:5273/?backend=webgl2`.

| Parameter | Účinok |
|---|---|
| `?backend=webgpu` | Použiť WebGPU, alebo zlyhať. |
| `?backend=webgl2` | Použiť WebGL2, aj keď je WebGPU k dispozícii - oddelí „toto sa kreslí zle“ od „toto sa kreslí zle na WebGPU“. |
| `?heat=f16` | Vynútiť 16-bitovú cestu akumulácie tepla na ľubovoľnom backende ([Akumulácia v polovičnej presnosti](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: čítať chyby GL počas snímky a sprístupniť ich na `renderer.heatDebug`. Predvolene vypnuté, lebo `getError` núti čakať na prácu GPU. |
| `?occdebug=<n>` | Pomôcka pre vývojárov WebGL2: nahradí teplo ladiacimi hodnotami zakrytia. Nie na bežné použitie. |

### Rozdiely, na ktorých záleží {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Ukladanie riadkov | Storage buffery: index riadka je index poľa. Žiada najväčšiu veľkosť storage bufferu a veľkosti bufferov, ktoré adaptér ponúka. | Celočíselné textúry (8 192 texelov široké) adresované z `gl_VertexID` cez textúru indexov blokov na každú snímku. |
| 32-bitová akumulácia tepla | Keď adaptér ponúka `float32-blendable` aj `float32-filterable` | Keď je prítomné `EXT_float_blend` |
| Inak | 16-bitová (`r16float`) | 16-bitová (`R16F`) |
| Rozsah hĺbky | [0, 1]; engine predvynásobí prepočet matíc three.js z [-1, 1]. Bez neho paralelná projekcia - ktorej hĺbka je lineárna - skončí takmer celá pod 0 a bez hlásenia sa orezá. | [-1, 1], použité ako je |
| Uniformy | Kruh 256-bajtovo zarovnaných slotov, jeden na každé kreslenie, viazaný posunom - `queue.writeBuffer` sa radí v rade, takže keby sa jeden buffer prepisoval pri každom kreslení, každé kreslenie by čítalo posledný zápis. Blok uniforiem prechodu tepla je presne jeden 256-bajtový slot. | Bežné uniformy |
| Cieľ tepla pod rozlíšením plátna | Dostane vlastnú textúru hĺbky (každá príloha v prechode musí mať rovnakú veľkosť) | |
| Zachytenie snímky | `captureFrame()` vykreslí kompozíciu druhýkrát do mimoobrazovkového cieľa a prečíta ju späť (headless Chromium kreslí WebGPU, ale nikdy neskladá svoje plátno) | Prečíta predvolený framebuffer späť pri ďalšej vykreslenej snímke |
| Čítanie späť | Staging buffery sa držia a znovu použijú; naraz jeden čitateľ | `readPixels`, pričom sa ovládač pýta, ktorá dvojica formát/typ je povolená |

Oba backendy nahrávajú tabuľku krivky sprite ako polovičné float; `queue.writeTexture` vo WebGPU kopíruje surové bajty, preto sa dáta najprv zakódujú do binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Limity textúr {#texture-limits}

`texStorage2D` nad `MAX_TEXTURE_SIZE` nevyhodí chybu: alokácia sa zahodí, neskoršie nahrávania zlyhajú a vzorkovanie vráti nulu. Pomocná funkcia WebGL2 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) kontroluje oba rozmery voči limitu a pri prekročení vyhodí chybu s veľkosťou; textúra indexov blokov je dvojrozmerná (4 096 široká), takže nemôže prerásť limit; a `src/render/limits.test.ts` pripína každý rozmer textúry k limitom, ktoré stoja za podporu. Vykresľovač WebGL2 tiež odmietne zariadenie, ktorého maximálna veľkosť textúry je menšia ako šírka 8 192 textúry riadkov.

### Testovanie oboch {#testing-both}

`npm run smoke` spustí skutočnú aplikáciu v headless Chromiu na WebGL2 (predvolene `http://127.0.0.1:5273/`); pre WebGPU odovzdajte `"http://127.0.0.1:5273/?backend=webgpu"` do `node tools/smoke.mjs`, a pre cestu polovičnej presnosti `npm run smoke:f16`. `tools/probe-webgpu.mjs` a `tools/probe-present.mjs` (uvedené pod nástrojmi pre vývojárov v [Nástroje na príkazovom riadku](ref-tools.md)) diagnostikujú dostupnosť adaptéra a prezentácie v headless prehliadačoch.
