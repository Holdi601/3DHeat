---
title: "Abas renderēšanas metodes"
parent: "Renderēšanas iekšējā uzbūve"
nav_order: 1
lang: "lv"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Abas renderēšanas metodes

Pārlūks var ļaut lapai izmantot grafikas karti divos veidos: WebGPU (jaunāks) un WebGL2. Skatītājs var izmantot abus un pats izvēlas labāko, tāpēc parasti nekas nav jādara. Lai redzētu, kuru izmantojat: **Renderētājs** statistikas pārklājumā (skata augšējā labajā stūrī).

![Statistikas pārklājums: Renderētājs, FPS, Kadrs, Rindas logā, Spraiti / kadrs, Budžets, Siltuma izšķ., Pārklājums](../assets/img/en/performance-stats-overlay.webp)

Skatītājam ir divi pilnīgi renderētāji aiz vienas saskarnes ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) un **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Abi zīmē to pašu attēlu ar tiem pašiem algoritmiem; shaderi pastāv gan WGSL, gan GLSL ES 3.00 valodā. Statistikas pārklājuma pirmā rinda, **Renderētājs**, parāda, kurš darbojas; uzvedot virsū, redzams, kāpēc WebGPU netika izmantots, ja tas netika.

## Izstrādātājiem {#for-developers}

### Kā tiek izvēlēts {#how-one-is-chosen}

Audekls var turēt tikai vienu konteksta veidu, tāpēc izvēle tiek izdarīta vienreiz, pirms kaut kas tiek zīmēts ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Ja vien WebGL2 nav piespiests: ja `navigator.gpu` eksistē, pieprasa adapteri ar `powerPreference: 'high-performance'` un ierīci, un izveido WebGPU renderētāju. Katra kļūda tiek atcerēta kā iemesls.
2. Ja WebGPU bija piespiests un neizdevās, apstājas: skats rāda *Nevar inicializēt renderētāju.* un iemeslu.
3. Citādi izveido WebGL2 renderētāju (arī pieprasot augstas veiktspējas adapteri). Ja WebGL2 nav pieejams vai nevar zīmēt uz float tekstūrām (`EXT_color_buffer_float`), skats rāda kļūdu.

`powerPreference: 'high-performance'` ir tas, kas neļauj klēpjdatoram ar pārslēdzamu grafiku nodot lapai tā integrēto GPU. Citādi lapai nav ietekmes: aparatūras paātrinājums ir pārlūka iestatījums.

### URL slēdži {#url-switches}

Pievienojiet lapas adresei, piemēram, `http://127.0.0.1:5273/?backend=webgl2`.

| Parametrs | Iedarbība |
|---|---|
| `?backend=webgpu` | Izmantot WebGPU vai neizdoties. |
| `?backend=webgl2` | Izmantot WebGL2 arī tur, kur WebGPU ir pieejams. Tas atdala "šis zīmē nepareizi" no "šis zīmē nepareizi WebGPU". |
| `?heat=f16` | Piespiest 16 bitu siltuma uzkrāšanas ceļu abos renderētājos ([Pusprecizitātes uzkrāšana](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: nolasīt GL kļūdas kadra laikā un padarīt tās redzamas `renderer.heatDebug`. Izslēgts pēc noklusējuma, jo `getError` ir cauruļvada sinhronizācijas punkts. |
| `?occdebug=<n>` | WebGL2 izstrādātāja palīglīdzeklis: aizvieto siltumu ar aizsegšanas atkļūdošanas vērtībām. Nav paredzēts parastai lietošanai. |

### Būtiskās atšķirības {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Rindu glabāšana | Krātuves bufferi: rindas indekss ir masīva apakšindekss. Pieprasa adaptera lielāko krātuves bufera piesaisti un bufera izmērus. | Veselu skaitļu tekstūras (8192 texeļi platumā), adresētas no `gl_VertexID` caur kadra bloku indeksa tekstūru. |
| 32 bitu siltuma uzkrāšana | Kad adapteris piedāvā gan `float32-blendable`, gan `float32-filterable` | Kad ir `EXT_float_blend` |
| Citādi | 16 bitu (`r16float`) | 16 bitu (`R16F`) |
| Dziļuma diapazons | [0, 1]; dzinējs iepriekš reizina three.js [-1, 1] matricu ar remap. Bez tā paralēlā projekcija, kuras dziļums ir lineārs, gandrīz pilnībā nokrīt zem 0 un tiek nemanāmi nogriezta. | [-1, 1], izmantots kā ir |
| Uniformi | Gredzens ar 256 baitu izlīdzinātiem slotiem, viens katram zīmējumam, piesaistīts pēc nobīdes. `queue.writeBuffer` ir sakārtots pēc rindas, tāpēc viens buferis, kas tiek pārrakstīts katram zīmējumam, liktu katram zīmējumam nolasīt pēdējo rakstījumu. Siltuma cikla uniformu bloks ir tieši viens 256 baitu slots. | Parastie uniformi |
| Siltuma mērķis zem audekla izšķirtspējas | Iegūst savu dziļuma tekstūru (katram pielikumam vienā cikla kārtā jābūt vienāda izmēra) | |
| Kadra uztveršana | `captureFrame()` renderē kompozīciju otrreiz ārpus ekrāna mērķī un to nolasa (bezgalvas Chromium renderē WebGPU, bet nekad nekompozē savu audeklu) | Nolasa noklusējuma kadra bufferi nākamajā renderētajā kadrā |
| Nolasīšana | Stagēšanas buferi tiek saglabāti un pārlietoti; vienlaikus lidojumā ir tikai viens lasītājs | `readPixels`, pajautājot draiverim, kurš formāta un tipa pāris ir likumīgs |

Abi renderētāji augšupielādē spraitu līknes tabulu kā pusprecizitātes skaitļus. WebGPU `queue.writeTexture` kopē neapstrādātus baitus, tāpēc dati vispirms tiek kodēti binary16 formātā ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Tekstūru ierobežojumi {#texture-limits}

`texStorage2D` pārsniedzot `MAX_TEXTURE_SIZE` neizmet kļūdu: piešķiršana tiek atmesta, vēlākās augšupielādes neizdodas un paraugu ņemšana atgriež nulli. WebGL2 palīgs [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) pārbauda abus izmērus pret ierobežojumu un met kļūdu ar izmēru. Kadra bloku indeksa tekstūra ir divdimensiju (4096 platumā), tāpēc tā nevar izaugt pāri ierobežojumam. `src/render/limits.test.ts` piesprauž katru tekstūras izmēru pret tiem ierobežojumiem, kas ir vērti atbalsta. WebGL2 renderētājs arī noraida ierīci, kuras maksimālais tekstūras izmērs ir zemāks par rindu tekstūras 8192 platumu.

### Testēšana abos {#testing-both}

`npm run smoke` palaiž reālu lietotni bezgalvas Chromium uz WebGL2 (pēc noklusējuma `http://127.0.0.1:5273/`). WebGPU režīmam nododiet `"http://127.0.0.1:5273/?backend=webgpu"` `node tools/smoke.mjs`, bet pusprecizitātes ceļam izmantojiet `npm run smoke:f16`. `tools/probe-webgpu.mjs` un `tools/probe-present.mjs` (uzskaitīti izstrādātāju rīkos lapā [Komandrindas rīki](ref-tools.md)) diagnosticē adaptera un prezentācijas pieejamību bezgalvas pārlūkos.
