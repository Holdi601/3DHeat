---
title: "Kaks renderdajat"
parent: "Renderdamise sisemine tööpõhimõte"
nav_order: 1
lang: "et"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Kaks taustsüsteemi

Brauser saab lehele anda grafikakaardi kasutamise kahel viisil: WebGPU (uuem) ja WebGL2. Vaataja oskab mõlemat ja valib ise parema, nii et tavaliselt pole sul midagi teha. Vaata, millist kasutad: **Taustsüsteem** statistikakattes (vaate paremas ülanurgas).

![Statistikakate: Taustsüsteem, FPS, Kaader, Read aknas, Spraite / kaader, Eelarve, Soojuse lahutus, Katvus](../assets/img/en/performance-stats-overlay.webp)

Vaatajal on kaks täielikku renderdajat ühe liidese taga ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) ja **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Mõlemad joonistavad sama pildi samade algoritmidega; shaderid on olemas WGSL ja GLSL ES 3.00 keeles kõrvuti. Statistikakatte esimene rida, **Taustsüsteem**, ütleb, milline töötab. Kui seda hiirega üle viia, näed, miks WebGPU-d ei kasutatud, kui seda ei kasutatud.

## Arendajatele {#for-developers}

### Kuidas üks valitakse {#how-one-is-chosen}

Canvas'il saab olla ainult üht tüüpi kontekst, seega valik tehakse üks kord enne mis tahes joonistamist ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Kui WebGL2 ei ole sunnitud: kui `navigator.gpu` on olemas, küsi adapterit parameetriga `powerPreference: 'high-performance'` ja seadet ning loo WebGPU renderdaja. Iga tõrge jäetakse meelde põhjusena.
2. Kui WebGPU oli sunnitud ja ebaõnnestus, peatu: vaates on kiri *Renderdajat ei saa lähtestada.* koos põhjusega.
3. Muidu loo WebGL2 renderdaja (küsides samuti kõrge jõudlusega adapterit). Kui WebGL2 pole saadaval või ei saa renderdada ujukomatekstuuridesse (`EXT_color_buffer_float`), näitab vaade tõrget.

`powerPreference: 'high-performance'` takistab, et ümberlülitatava graafikaga sülearvuti annaks lehele integreeritud GPU. Muus osas lehel sõnaõigust pole: riistvaraline kiirendus on brauseri seade.

### URL-i lülitid {#url-switches}

Lisa lehe aadressile, näiteks `http://127.0.0.1:5273/?backend=webgl2`.

| Parameeter | Mõju |
|---|---|
| `?backend=webgpu` | Kasuta WebGPU-d või ebaõnnestu. |
| `?backend=webgl2` | Kasuta WebGL2-d isegi siis, kui WebGPU on saadaval. See eraldab "see renderdab valesti" väitest "see renderdab WebGPU-l valesti". |
| `?heat=f16` | Sunni 16-bitise soojuse kogumise tee kummalegi taustsüsteemile ([Pooltäpne akumulatsioon](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: loe kaadri ajal GL-vead ja näita neid `renderer.heatDebug`-is. Vaikimisi väljas, sest `getError` on torujuhtme sünkroonimise punkt. |
| `?occdebug=<n>` | WebGL2 arendaja abivahend: asendab soojuse varjestuse silumisväärtustega. Pole tavakasutuseks. |

### Erinevused, mis loevad {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Ridade salvestus | Storage-puhvrid: rea indeks on massiivi alamindeks. Küsib adapteri suurimat storage-puhvri sidumist ja puhvrite suurusi. | Täisarvtekstuurid (8192 texelit laiad), millele pääseb `gl_VertexID` kaudu kaadripõhise plokiindeksi tekstuuri abil. |
| 32-bitine soojuse kogumine | Kui adapter pakub nii `float32-blendable` kui `float32-filterable` | Kui `EXT_float_blend` on olemas |
| Muidu | 16-bitine (`r16float`) | 16-bitine (`R16F`) |
| Sügavusvahemik | [0, 1]. Mootor korrutab ette three.js-i [-1, 1] maatriksite ümbervormingu. Ilma selleta kaob paralleelprojektsioon, mille sügavus on lineaarne, peaaegu täielikult alla 0 ja lõigatakse vaikselt ära. | [-1, 1], kasutatakse nii nagu on |
| Ühtsed muutujad (uniform) | Rõngas 256-baidise joondusega pesasid, üks iga joonistuse kohta, seotud nihke järgi. `queue.writeBuffer` on järjekorras, seega kui üks puhver kirjutataks iga joonistuse jaoks ümber, loeks iga joonistus viimast kirjutust. Soojuspassi ühtne plokk on täpselt üks 256-baidine pesa. | Tavalised uniform-muutujad |
| Soojussihtmärk alla canvase resolutsiooni | Saab oma sügavustekstuuri (igal passi manusel peab olema sama suurus) | |
| Kaadri salvestamine | `captureFrame()` renderdab komposiidi teist korda eraldi sihtmärki ja loeb selle tagasi (peata Chromium renderdab WebGPU-d, aga ei komponeeri oma canvase'i) | Loeb vaikimisi kaadripuhvri tagasi järgmisel renderdatud kaadril |
| Tagasilugemine | Puhvrid hoitakse alles ja neid taaskasutatakse; korraga on lennus üks lugeja | `readPixels`, küsides draiverilt, milline formaadi ja tüübi paar on lubatud |

Mõlemad taustsüsteemid laadivad spraitide kõvera tabeli üles poolujukomadena. WebGPU `queue.writeTexture` kopeerib toorbaidid, seega andmed kodeeritakse enne binary16-ks ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Tekstuuri piirid {#texture-limits}

`texStorage2D` üle `MAX_TEXTURE_SIZE` ei viska viga: eraldamine kukub ära, hilisemad üleslaadimised ebaõnnestuvad ja proovivõtt tagastab nulli. WebGL2 abifunktsioon [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) kontrollib mõlemat mõõtmet piiri vastu ja viskab vea koos suurusega. Plokiindeksi tekstuur on kahemõõtmeline (4096 lai), seega ei saa see piirist välja kasvada. `src/render/limits.test.ts` kinnitab iga tekstuuri mõõtme vastu piire, mida on mõtet toetada. WebGL2 renderdaja keeldub ka seadmest, mille maksimaalne tekstuuri suurus on alla rea tekstuuri 8192 laiuse.

### Mõlema testimine {#testing-both}

`npm run smoke` käivitab päris rakenduse peata Chromiumis WebGL2-l (vaikimisi `http://127.0.0.1:5273/`). WebGPU jaoks anna `node tools/smoke.mjs`-ile `"http://127.0.0.1:5273/?backend=webgpu"`, poolujukoma tee jaoks kasuta `npm run smoke:f16`. `tools/probe-webgpu.mjs` ja `tools/probe-present.mjs` (arendajatööriistade all loetletud lehel [Käsurea tööriistad](ref-tools.md)) diagnoosivad adapteri ja esitlemise saadavust peata brauserites.
