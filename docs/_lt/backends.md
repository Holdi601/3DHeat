---
title: "Abu varikliai"
parent: "Atvaizdavimo vidus"
nav_order: 1
lang: "lt"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Dvi grafikos sąsajos

Naršyklė gali leisti puslapiui naudoti grafikos kortą dvejais būdais: WebGPU (naujesnė) ir WebGL2. Peržiūros programa gali naudoti abi ir pati pasirenka geriausią, todėl paprastai nieko daryti nereikia. Pamatyti, kurią naudojate: **Backend** (sąsaja) statistikos perdangoje (viršuje dešinėje vaizde).

![Statistikos perdanga: Sąsaja, FPS, Kadras, Eilutės lange, Spraitai / kadrą, Biudžetas, Šilumos raiška, Padengimas](../assets/img/en/performance-stats-overlay.webp)

Peržiūros programa turi dvi pilnas atvaizdavimo sistemas už vienos sąsajos ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) ir **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Abi piešia tą patį vaizdą su tais pačiais algoritmais; šešėliavimo programos parašytos WGSL ir GLSL ES 3.00 kalbomis šalia viena kitos. Pirmoji statistikos perdangos eilutė, **Backend** (sąsaja), parodo, kuri veikia; užvedus pelę ant jos, matyti, kodėl WebGPU nebuvo naudojama, jei nebuvo.

## Kūrėjams {#for-developers}

### Kaip pasirenkama {#how-one-is-chosen}

Drobė gali turėti tik vieno tipo kontekstą, todėl pasirinkimas daromas vieną kartą, prieš bet kokį piešimą ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Jei WebGL2 nepriverstinai įjungtas: jei yra `navigator.gpu`, prašoma adapterio su `powerPreference: 'high-performance'` ir įrenginio, ir sukuriama WebGPU sistema. Bet kuri klaida įsimenama kaip priežastis.
2. Jei WebGPU buvo priverstinai įjungtas ir nepavyko, sustojama: rodinys parodo *Nepavyksta paleisti atvaizdavimo sistemos.* ir priežastį.
3. Kitu atveju sukuriama WebGL2 sistema (taip pat prašant adapterio su aukštu našumu). Jei WebGL2 nepasiekiamas arba negali piešti į slankiojo kablelio tekstūras (`EXT_color_buffer_float`), rodinys parodo klaidą.

`powerPreference: 'high-performance'` užkerta kelią, kad nešiojamasis kompiuteris su perjungiama grafika puslapiui neatiduotų integruotos grafikos. Kitaip puslapis nieko nenusprendžia: aparatinis pagreitis yra naršyklės nustatymas.

### URL jungikliai {#url-switches}

Pridėkite prie puslapio adreso, pavyzdžiui, `http://127.0.0.1:5273/?backend=webgl2`.

| Parametras | Poveikis |
|---|---|
| `?backend=webgpu` | Naudoti WebGPU arba nepavyks. |
| `?backend=webgl2` | Naudoti WebGL2 net ten, kur WebGPU yra – atskiria „šis neteisingai piešia“ nuo „šis neteisingai piešia WebGPU“. |
| `?heat=f16` | Priversti 16 bitų šilumos kaupimo kelią bet kurioje sąsajoje ([Pusiau tikslusis kaupimas](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: skaityti GL klaidas kadro metu ir rodyti jas `renderer.heatDebug`. Išjungta pagal numatymą, nes `getError` sustabdo konvejerį. |
| `?occdebug=<n>` | WebGL2 kūrėjo pagalba: šilumą pakeičia užslėpimo derinimo reikšmėmis. Ne įprastam naudojimui. |

### Skirtumai, kurie svarbūs {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Eilučių saugykla | Saugojimo buferiai: eilutės indeksas yra masyvo indeksas. Prašo didžiausio adapterio saugojimo buferio susiejimo ir buferių dydžių. | Sveikųjų skaičių tekstūros (8 192 texelių pločio), adresuojamos iš `gl_VertexID` per kiekvieno kadro bloko indeksų tekstūrą. |
| 32 bitų šilumos kaupimas | Kai adapteris siūlo ir `float32-blendable`, ir `float32-filterable` | Kai yra `EXT_float_blend` |
| Kitu atveju | 16 bitų (`r16float`) | 16 bitų (`R16F`) |
| Gylio intervalas | [0, 1]; variklis prieš tai padaro three.js [-1, 1] matricų perskaičiavimą. Be jo lygiagretinė projekcija – kurios gylis tiesinis – beveik visa patenka žemiau 0 ir tyliai nukērpama. | [-1, 1], naudojamas kaip yra |
| Vienodieji kintamieji | 256 baitų lygiavimo lizdų žiedas, po vieną kiekvienam piešimui, susiejamas pagal poslinkį – `queue.writeBuffer` veikia eilės tvarka, todėl vienas buferis, perrašomas kiekvienam piešimui, verstų kiekvieną piešimą skaityti paskutinį įrašą. Šilumos etapo vienodųjų kintamųjų blokas yra lygiai vienas 256 baitų lizdas. | Įprasti vienodieji kintamieji |
| Šilumos tikslas žemiau drobės raiškos | Gauna savo gylio tekstūrą (kiekvienas priedas viename etape turi būti tokio paties dydžio) | |
| Kadro fiksavimas | `captureFrame()` dar kartą atvaizduoja kompozitą į ne ekrano tikslą ir nuskaito jį (be galvos Chromium piešia WebGPU, bet nesujungia savo drobės) | Nuskaito numatytąjį kadro buferį kitame atvaizduotame kadre |
| Nuskaitymas | Laikinieji buferiai saugomi ir naudojami pakartotinai; vienu metu skaitomas tik vienas | `readPixels`, klausiant tvarkyklės, koks formato/tipo pora yra leistina |

Abi sąsajos įkelia spraito kreivės lentelę kaip pusiau tikslius slankiojo kablelio skaičius; WebGPU `queue.writeTexture` kopijuoja neapdorotus baitus, todėl duomenys pirma užkoduojami į binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Tekstūrų ribos {#texture-limits}

`texStorage2D` viršijus `MAX_TEXTURE_SIZE`, klaidos nemeta: skyrimas tiesiog numetamas, vėlesni įkėlimai nepavyksta, o tekstūros skaitymas grąžina nulį. WebGL2 pagalbinė funkcija [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) patikrina abu matmenis pagal ribą ir meta klaidą su dydžiu; bloko indeksų tekstūra yra dvimatė (4 096 pločio), todėl ji negali išeiti už ribos; o `src/render/limits.test.ts` užfiksuoja kiekvieną tekstūros matmenį pagal ribas, kurias verta palaikyti. WebGL2 sistema taip pat atsisako įrenginio, kurio didžiausias tekstūros dydis yra mažesnis už eilučių tekstūros 8 192 plotį.

### Abiejų testavimas {#testing-both}

`npm run smoke` paleidžia tikrą programą be galvos Chromium naršyklėje su WebGL2 (pagal numatymą `http://127.0.0.1:5273/`); norint WebGPU, `node tools/smoke.mjs` perduokite `"http://127.0.0.1:5273/?backend=webgpu"`, o slankiojo kablelio 16 bitų kelio testui – `npm run smoke:f16`. `tools/probe-webgpu.mjs` ir `tools/probe-present.mjs` (išvardyti kūrėjų įrankiuose [Komandinės eilutės įrankiai](ref-tools.md)) diagnozuoja adapterių ir pateikimo galimybes be galvos naršyklėse.
