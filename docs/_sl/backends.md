---
title: "Dve izvedbi upodabljanja"
parent: "Notranjosti upodabljanja"
nav_order: 1
lang: "sl"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Dva zaledja

Brskalnik lahko stran uporablja grafično kartico na dva načina, WebGPU (novejši) in WebGL2. Pregledovalnik lahko uporablja oba in sam izbere boljšega, zato običajno ne naredite ničesar. Preverite, na katerem ste: **Zaledje** v prekrivnem prikazu statistike (zgoraj desno v pogledu).

![Prekrivni prikaz statistike: Zaledje, FPS, Sličica, Vrstice v oknu, Sprajti / sličico, Proračun, Ločljivost toplote, Pokritost](../assets/img/en/performance-stats-overlay.webp)

Pregledovalnik ima za enim vmesnikom dva popolna upodabljalnika ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) in **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Oba narišeta isto sliko z enakimi algoritmi; senčilniki obstajajo v WGSL in GLSL ES 3.00 drug ob drugem. Prva vrstica prekrivnega prikaza statistike, **Zaledje**, pove, kateri teče; če se z miško ustavite nad njo, se prikaže, zakaj WebGPU ni bil uporabljen, če ni bil.

## Za razvijalce {#for-developers}

### Kako se izbere {#how-one-is-chosen}

Platno lahko drži samo eno vrsto konteksta, zato se izbira opravi enkrat, pred vsakim risanjem ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Če WebGL2 ni vsiljen: če `navigator.gpu` obstaja, zahtevaj adapter z `powerPreference: 'high-performance'` in napravo ter ustvari upodabljalnik WebGPU. Vsaka napaka se zapomni kot razlog.
2. Če je bil WebGPU vsiljen in je odpovedal, ustavi se: pogled prikaže *Upodabljalnika ni mogoče zagnati.* z razlogom.
3. Sicer ustvari upodabljalnik WebGL2 (prav tako zahteva adapter z visoko zmogljivostjo). Če WebGL2 ni na voljo ali ne more risati v plavajoče teksture (`EXT_color_buffer_float`), pogled prikaže napako.

`powerPreference: 'high-performance'` prepreči, da bi prenosnik s preklopno grafiko stranki dal svoj vgrajeni GPU. Poleg tega stran nima vpliva: strojno pospeševanje je nastavitev brskalnika.

### Stikala v naslovu URL {#url-switches}

Dodajte na naslov strani, na primer `http://127.0.0.1:5273/?backend=webgl2`.

| Parameter | Učinek |
|---|---|
| `?backend=webgpu` | Uporabi WebGPU ali odpovej. |
| `?backend=webgl2` | Uporabi WebGL2 tudi tam, kjer je WebGPU na voljo – loči »to se napačno riše« od »to se napačno riše na WebGPU«. |
| `?heat=f16` | Vsili 16-bitno pot seštevanja toplote na katerem koli zaledju ([Seštevanje v polovični plavajoči vejici](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: med sličico bere napake GL in jih izpostavi v `renderer.heatDebug`. Privzeto izklopljeno, ker je `getError` točka sinhronizacije cevovoda. |
| `?occdebug=<n>` | Razvijalsko pomagalo za WebGL2: toploto nadomesti z vrednostmi za odpravljanje napak zakritja. Ni za običajno uporabo. |

### Razlike, ki so pomembne {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Shramba vrstic | Medpomnilniki za shranjevanje: indeks vrstice je indeks v polju. Zahteva največjo velikost vezave medpomnilnika za shranjevanje in velikosti medpomnilnikov adapterja. | Teksture s celimi števili (8.192 texelov široko), naslovljene iz `gl_VertexID` prek bločne teksture indeksov, ki se obnovi vsako sličico. |
| 32-bitno seštevanje toplote | Če adapter ponuja `float32-blendable` in `float32-filterable` | Če je prisotna `EXT_float_blend` |
| Sicer | 16-bitno (`r16float`) | 16-bitno (`R16F`) |
| Obseg globine | [0, 1]; motor pred tem uporabi preslikavo matrik three.js z [-1, 1]. Brez nje se vzporedna projekcija – katere globina je linearna – skoraj v celoti znajde pod 0 in tiho odreže. | [-1, 1], uporabljeno kot je |
| Enotne vrednosti (uniforms) | Krožni niz rež, poravnanih na 256 bajtov, ena na risanje, vezanih z odmikom – `queue.writeBuffer` je urejen v vrsti naprave, zato bi en medpomnilnik, prepisan pri vsakem risanju, pomenil, da vsako risanje prebere zadnji zapis. Blok enotnih vrednosti prehoda toplote je točno ena reža po 256 bajtov. | Navadne enotne vrednosti |
| Cilj toplote pod ločljivostjo platna | Dobi svojo teksturo globine (vsaka priponka v prehodu mora imeti isto velikost) | |
| Zajem sličice | `captureFrame()` še enkrat upodobi sestavljeno sliko v zunanji cilj in jo prebere nazaj (brezglavi Chromium upodablja WebGPU, vendar nikoli ne sestavi svojega platna) | Prebere privzeti medpomnilnik sličice nazaj ob naslednji upodobljeni sličici |
| Branje nazaj | Medpomnilniki za vmesno shranjevanje se ohranijo in ponovno uporabijo; hkrati je v teku največ en bralnik | `readPixels`, ki od gonilnika zahteva veljaven par format/tip |

Oba zaledja naložita tabelo krivulj senc kot polovične plavajoče vejice; `queue.writeTexture` v WebGPU kopira surove bajte, zato se podatki najprej zakodirajo v binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Omejitve tekstur {#texture-limits}

`texStorage2D` nad `MAX_TEXTURE_SIZE` ne vrže napake: dodelitev se zavrže, poznejša nalaganja odpovejo in vzorčenje vrne nič. Pomagalna funkcija WebGL2 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) preveri obe dimenziji glede na omejitev in vrže napako z velikostjo; tekstura indeksov bloka je dvodimenzionalna (4.096 široka), zato ne more preseči omejitve; `src/render/limits.test.ts` pa pripne vsako dimenzijo teksture na omejitve, ki se splača podpirati. Upodabljalnik WebGL2 prav tako zavrne napravo, katere največja velikost teksture je manjša od širine 8.192 teksture vrstic.

### Preizkus obeh {#testing-both}

`npm run smoke` požene pravo aplikacijo v brezglavem Chromiumu na WebGL2 (privzeto `http://127.0.0.1:5273/`); za WebGPU podajte `"http://127.0.0.1:5273/?backend=webgpu"` ukazu `node tools/smoke.mjs`, za pot polovične plavajoče vejice pa `npm run smoke:f16`. `tools/probe-webgpu.mjs` in `tools/probe-present.mjs` (navedeni med razvijalskimi orodji v [Ukazne vrstice orodij](ref-tools.md)) preverjata razpoložljivost adapterja in predstavitve v brezglavih brskalnikih.
