---
title: "An dá chúltaca"
parent: "Inmheánacha rindreála"
nav_order: 1
lang: "ga"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# An dá chúltaca

Is féidir le brabhsálaí ligean do leathanach an cárta grafaicí a úsáid ar dhá bhealach, WebGPU (níos nuaí) agus WebGL2. Is féidir leis an léirsitheoir an dá cheann a úsáid agus roghnaíonn sé an ceann is fearr é féin, mar sin de ghnáth ní dhéanann tú rud ar bith. Chun a fheiceáil cé acu atá á úsáid agat: **Cúlchóras** i ngach thaispeántas staitisticí (barr ar dheis an amhairc).

![An taispeántas staitisticí: Cúlchóras, FPS, Frame, Rows in window, Sprites / frame, Budget, Heat res, Coverage](../assets/img/en/performance-stats-overlay.webp)

Tá dhá rindreálaí iomlána ag an léirsitheoir taobh thiar de chomhéadan amháin ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) agus **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Tarraingíonn an bheirt an pictiúr céanna leis na halgartaim chéanna; tá na sceidealáin sa dá theanga, WGSL agus GLSL ES 3.00, taobh le taobh. Deir an chéad líne den taispeántas staitisticí, **Cúlchóras**, cé acu atá ag rith; má chuireann tú an luch air taispeántar cén fáth nár úsáideadh WebGPU, nuair nár úsáideadh é.

## Do fhorbróirí {#for-developers}

### Conas a roghnaítear ceann {#how-one-is-chosen}

Ní féidir le canbhás ach cineál amháin comhthéacs a shealbhú, mar sin déantar an rogha uair amháin, sula dtarraingítear rud ar bith ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Mura bhfuil WebGL2 éigeantaithe: má tá `navigator.gpu` ann, iarr oiriúntóir le `powerPreference: 'high-performance'` agus gléas, agus cruthaigh an rindreálaí WebGPU. Cuimhnítear ar aon teip mar an chúis.
2. Má bhí WebGPU éigeantaithe agus gur theip air, stop: taispeánann an amharc *Ní féidir an rindreálaí a thosú.* leis an gcúis.
3. Seachas sin cruthaigh an rindreálaí WebGL2 (ag iarraidh an oiriúntóra ardfheidhmíochta freisin). Mura bhfuil WebGL2 ar fáil, nó mura féidir leis rindreáil go huimhreacha snámhphointe (`EXT_color_buffer_float`), taispeánann an amharc an earráid.

Is é `powerPreference: 'high-performance'` a chosnaíonn ó ríomhaire glúine le grafaic inathraithe an leathanach a thabhairt an GPU lárnach dó. Seachas sin níl aon rud le rá ag an leathanach: is socrú brabhsálaí é luasú crua-earraí.

### Lasca URL {#url-switches}

Cuir leis an seoladh an leathanaigh, mar shampla `http://127.0.0.1:5273/?backend=webgl2`.

| Paraiméadar | Éifeacht |
|---|---|
| `?backend=webgpu` | Úsáid WebGPU nó teip. |
| `?backend=webgl2` | Úsáid WebGL2 fiú nuair a bhíonn WebGPU ar fáil - scarann sé "rindreálann seo go mícheart" ó "rindreálann seo go mícheart ar WebGPU". |
| `?heat=f16` | Cuir an conair teasmhaithe 16-bit i bhfeidhm ar an dá chúlchóras ([Carnadh leathsnámhphointe](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: léann earráidí GL le linn an fhráma agus taispeánann siad iad ar `renderer.heatDebug`. As ar bun mar go bhfuil `getError` ina phointe sioncronaithe don phíblíne. |
| `?occdebug=<n>` | Cabhair do fhorbróirí WebGL2: cuireann sé luachanna dífhabhtaithe díothaithe in ionad an teasa. Ní le haghaidh úsáide gnáthaí. |

### Difríochtaí a bhfuil tábhacht leo {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Stóráil sraitheanna | Maolán stórála: is foscríbhinn eagair uimhir sraithe. Iarrann sé an ceangal maolán stórála is mó den oiriúntóir agus méideanna na maolán. | Uigeacha slánuimhire (8,192 texel ar leithead) seolta ó `gl_VertexID` trí uigeacht innéacs bloic in aghaidh an fhráma. |
| Carnadh teasa 32-bit | Nuair a thairgeann an t-oiriúntóir `float32-blendable` agus `float32-filterable` araon | Nuair a bhíonn `EXT_float_blend` i láthair |
| Seachas sin | 16-bit (`r16float`) | 16-bit (`R16F`) |
| Raon doimhneachta | [0, 1]; réamh-iolraíonn an innill athmhapáil ar mhaitricí [-1, 1] three.js. Gan é, líonann tionscadal comhthreomhar - a bhfuil a dhoimhneacht líneach - ar fad faoi 0 agus gearrtar as go ciúin é. | [-1, 1], úsáidte mar atá |
| Uniformeanna | Fáinne de slotaí 256-bheart ailínithe, ceann in aghaidh tarraingthe, ceangailte de réir fritheala - ordaítear `queue.writeBuffer` ar an scuaine, mar sin dá ndéanfaí maolán amháin a athscríobh in aghaidh tarraingthe léifeadh gach tarraingt an scríobh deiridh. Is slot 256-bheart amháin go díreach bloc uniform an phaiss teasa. | Uniformeanna gnácha |
| Sprioc teasa faoi rezolúiniú an canbháis | Faigheann sí a uigeacht doimhneachta féin (caithfidh gach ceangal i bpas a bheith ar an méid céanna) | |
| Gabháil fráma | Rindreálann `captureFrame()` an comhthiomsú an dara huair i sprioc as-líne agus léann siad ar ais é (ní thugann Chromium gan cheann éifeacht do chanbhás WebGPU) | Léann an frámbhufear réamhshocraithe ar ais ar an bhfráma rindreáilte ar lár |
| Léamh ar ais | Maolán foirceannta coinnithe agus athúsáidte; léitheoir amháin ar eitilt ag an am | `readPixels`, ag fiafraí den tiománaí cén péire formáid/cineál is dlisteanach |

Uaslódálann an dá chúlchóras tábla an chuair spriotaí mar leathshnámhphointí; kopaíonn `queue.writeTexture` WebGPU bheart amha, mar sin códaítear na sonraí go binary16 ar dtús ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Teorainneacha uigeachta {#texture-limits}

Ní chuireann `texStorage2D` os cionn `MAX_TEXTURE_SIZE` earráid as: cailltear an leithdháileadh, teipeann ar uaslódálacha ina dhiaidh sin agus tugann samplú nialas. Seiceálann cuidiú WebGL2 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) an dá thomhas i gcoinne na teorann agus caitheann sé earráid leis an méid, tá uigeacht innéacs bloic dhá-thomhaiseach (4,096 ar leithead) agus mar sin ní féidir léi an teorainn a sháraíonn, agus pionnaíonn `src/render/limits.test.ts` gach tomhas uigeachta i gcoinne na dteorannta is fiú tacú leo. Diúltaíonn rindreálaí WebGL2 freisin gléas a bhfuil a uasmhéid uigeachta níos lú ná leithead 8,192 uigeacht na sraitheanna.

### Tástáil an dá cheann {#testing-both}

Tiománann `npm run smoke` an fíor-aip i Chromium gan cheann ar WebGL2 (de réir réamhshocraithe `http://127.0.0.1:5273/`); pas `"http://127.0.0.1:5273/?backend=webgpu"` chuig `node tools/smoke.mjs` le haghaidh WebGPU, agus `npm run smoke:f16` don chonair leathsnámhphointe. Déanann `tools/probe-webgpu.mjs` agus `tools/probe-present.mjs` (liostaithe faoi uirlisí forbróra i [Uirlisí líne ordaithe](ref-tools.md)) diagnóis ar an oiriúntóir agus ar láithreacht an taispeána i mbrabhsálaithe gan cheann.
