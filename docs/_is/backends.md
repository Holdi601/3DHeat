---
title: "Bakendarnir tveir"
parent: "Innri hlutar myndvinnslu"
nav_order: 1
lang: "is"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Bakendarnir tveir

Vafri getur leyft síðu að nota skjákortið á tvo vegu, WebGPU (nýrra) og WebGL2. Skoðarinn getur notað bæði og velur það besta sjálfur, svo þú gerir venjulega ekkert. Sjáðu hvort þú ert á hvoru: **Bakendi** í tölfræðiglugganum (efst hægra megin á sýninni).

![Tölfræðigluggi: Backend, FPS, Frame, Rows in window, Sprites / frame, Budget, Heat res, Coverage](../assets/img/en/performance-stats-overlay.webp)

Skoðarinn hefur tvo fullbúna teiknara á bak við eitt viðmót ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) og **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Báðir teikna sömu mynd með sömu reikniaðferðum; skyggjarnir eru til í WGSL og GLSL ES 3.00 hlið við hlið. Fyrsta línan í tölfræðiglugganum, **Bakendi**, segir hvor er í gangi; ef þú heldur músinni yfir henni sérðu af hverju WebGPU var ekki notað, ef það var ekki notað.

## Fyrir forritara {#for-developers}

### Hvernig annar er valinn {#how-one-is-chosen}

Striga getur haldið aðeins einni tegund samhengis, svo valið er gert einu sinni, áður en nokkuð er teiknað ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Nema WebGL2 sé þvingað: ef `navigator.gpu` er til, biður um millistykki með `powerPreference: 'high-performance'` og tæki, og býr til WebGPU-teiknarann. Hver villa er geymd sem ástæðan.
2. Ef WebGPU var þvingað og mistókst, hættir þá: sýnin sýnir *Cannot initialise the renderer.* ásamt ástæðunni.
3. Annars býr til WebGL2-teiknarann (biður einnig um millistykkið með mikilli afköst). Ef WebGL2 er ekki til staðar, eða getur ekki teiknað í fleytitöflur (`EXT_color_buffer_float`), sýnir sýnin villuna.

`powerPreference: 'high-performance'` kemur í veg fyrir að fartölva með skiptanlega grafík gefi síðunni innbyggða skjákortið. Umfram það hefur síðan ekkert að segja: vélbúnaðarhröðun er stilling í vafranum.

### URL-rofar {#url-switches}

Bættu við slóð síðunnar, til dæmis `http://127.0.0.1:5273/?backend=webgl2`.

| Breyta | Áhrif |
|---|---|
| `?backend=webgpu` | Nota WebGPU eða mistakast. |
| `?backend=webgl2` | Nota WebGL2 jafnvel þar sem WebGPU er til - aðskilur „þetta teiknast rangt“ frá „þetta teiknast rangt á WebGPU“. |
| `?heat=f16` | Þvinga 16 bita hitasöfnunarleiðina á hvorum bakenda ([Hálffleytisöfnun](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: les GL-villur meðan á ramma stendur og birtir þær á `renderer.heatDebug`. Slökkt sjálfgefið því `getError` stöðvar pípuna. |
| `?occdebug=<n>` | WebGL2 hjálpartæki forritara: skiptir hitanum út fyrir villuleitargildi fyrir hulu. Ekki til venjulegrar notkunar. |

### Munur sem skiptir máli {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Geymsla lína | Geymslubuffar: vísir á línu er vísitala í fylki. Biður um stærsta geymslubuffa-bindingu millistykkisins og stærðir buffa. | Heiltöluáferðir (8.192 texel á breidd) sem eru ávarpaðar frá `gl_VertexID` í gegnum blokkavísa-áferð sem er endurnýjuð á hverjum ramma. |
| 32 bita hitasöfnun | Þegar millistykkið býður bæði `float32-blendable` og `float32-filterable` | Þegar `EXT_float_blend` er til staðar |
| Annars | 16 bita (`r16float`) | 16 bita (`R16F`) |
| Dýptarsvið | [0, 1]; vélin margfaldar fyrirfram með endurvörpun á [-1, 1] fylkjum three.js. Án hennar lendir samsíða varpun - sem hefur línulega dýpt - nánast öll undir 0 og er klippt burt þegjandi. | [-1, 1], notað eins og það er |
| Breytur (uniforms) | Hringrás af 256 bæta röðuðum raufum, ein fyrir hverja teikningu, bundin með versetu - `queue.writeBuffer` er raðað á biðröðina, svo ef einum buffa væri skrifað yfir fyrir hverja teikningu læsi hver teikning síðasta skrifinu. Breytublokk hitapassans er nákvæmlega ein 256 bæta rauf. | Venjulegar breytur |
| Hitamark undir upplausn striga | Fær sína eigin dýptaráferð (sérhver viðhengi í passa verða að vera jafnstór) | |
| Ramma-upptaka | `captureFrame()` teiknar samsetninguna aftur í utanskjástarget og les hana til baka (höfuðlaus Chromium teiknar WebGPU en setur ekki striga sinn saman) | Les sjálfgefna rammabuffann til baka í næsta teiknaða ramma |
| Lestur til baka | Biðminni fyrir uppsetningu geymd og endurnotuð; einn lesari í einu | `readPixels`, spyr driverinn hvaða snið/gerðarpar er leyfilegt |

Báðir bakendar senda inn lykilkúrvu-töfluna sem fleytitölur; `queue.writeTexture` í WebGPU afritar hrá bæti, svo gögnin eru fyrst kóðuð í binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Mörk áferða {#texture-limits}

`texStorage2D` umfram `MAX_TEXTURE_SIZE` kastar ekki villu: úthlutunin fellur niður, síðari innsendingar mistakast og sýnataka skilar núlli. Hjálparfallið [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) í WebGL2 athugar báðar víddir gegn mörkunum og kastar villu með stærðinni. Blokkavísa-áferðin er tvívídd (4.096 á breidd) svo hún getur ekki vaxið umfram mörk. `src/render/limits.test.ts` festir hverja áferðarvídd við þau mörk sem vert er að styðja. WebGL2-teiknarinn hafnar líka tæki þar sem hámarksstærð áferðar er minni en 8.192 breidd línu-áferðarinnar.

### Prófun á báðum {#testing-both}

`npm run smoke` keyrir raunverulega forritið í höfuðlausum Chromium á WebGL2 (sjálfgefið `http://127.0.0.1:5273/`); sendu `"http://127.0.0.1:5273/?backend=webgpu"` í `node tools/smoke.mjs` fyrir WebGPU, og `npm run smoke:f16` fyrir hálffleytileiðina. `tools/probe-webgpu.mjs` og `tools/probe-present.mjs` (skráð undir þróunartól í [Skipanalínutól](ref-tools.md)) greina hvort millistykki og birting eru tiltæk í höfuðlausum vöfrum.
