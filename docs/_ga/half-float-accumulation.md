---
title: "Carnadh leath-snámhphointe"
parent: "Inmheánacha rindreála"
nav_order: 4
lang: "ga"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Carnadh leathsnámhphointe

Ní féidir le cuid de chárta grafaicí teas a choinneáil ach i uimhreacha 16-bit beaga, rud a d'fhéadfadh na háiteanna is teo a ghearradh nó a fhoirceannadh. Scálaíonn an léirsitheoir na huimhreacha ionas nach léireofar é sin. Ní gá duit aon rud a dhéanamh; tá an leathanach seo do fhorbróirí.

## Do fhorbróirí {#for-developers}

Gléas nach féidir leis measctha isteach i uigeachtaí snámhphointe 32-bit (gan `float32-blendable` agus `float32-filterable` ar WebGPU, gan `EXT_float_blend` ar WebGL2) faigheann sé sprioc teasa **snámhphointe 16-bit** (`r16float`): uasmhéid 65,504 agus 11 giotán mantissa. Sroicheann réimse dlúth na céadanna mílte, mar sin **gearrann** sprioc 16-bit agus **foirceannann** sí; agus méadaíonn an earráid foirceannta leis an luach. Léirítear é sin go sonrach: léitear na háiteanna is dlúithe i bhfad níos fuaire ná mar atá siad, agus is cosúil go bhfuil na háiteanna tanaí ceart. Láimhseálann dhá mheicníocht é; níl an pictiúr ceart ach má oibríonn an dá cheann.

### Raon: gnóthachan ar gach splat {#range-a-gain-on-every-splat}

Iolraítear gach splat faoi **gnóthachan**, agus baintear amach arís é ag an gcomhdhéanamh, ionas go bhfuil an réimse sa mhéid a láimhseálann leathsnámhphointí go maith ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = meastachán analaíoch ar sháithiú don tacar sonraí seo, don ga agus don déine lárnach
gain     = 2 ^ round(log2(2048 / estimate)),  easponant teorannaithe -20..20
```

Fágann 2048 thart ar 32× spás os cionn bharr an ghrádáin sula sroicheann sé 65,504. Is **cumhacht de dhó** é an gnóthachan, mar sin ní athraíonn sé - ná an maolán carnta - má shleamhnaíonn an meastachán beagán. Is cuid den [síniú geoiméadrach](accumulation.md#what-restarts-it) é freisin, ionas go dtosaíonn an carnadh as an nua nuair a athraíonn sé.

Ceangailte leis an meastachán analaíoch atá sé, **agus ní** leis an bpointe sáithithe d'aon ghnó. Cuirtear an sáithiú i bhfeidhm ag an gcomhdhéanamh d'fhonn nach dtosaíonn an comhthiomsú arís riamh nuair a tharraingítear é; dá bogfadh an gnóthachan leis, bheadh luachanna sa mhaolán fós scríofa ag an sean-ghnóthachan agus roinnfeadh an comhdhéanamh faoin nua, bheadh an dá earráid ag cealú a chéile go beacht, agus bheadh an sleamhnán ar aon ghníomh.

Ar sprioc 32-bit is 1 an gnóthachan i gcónaí.

### Beachtas: fráma páirteach ó nialas {#precision-partial-frames-from-zero}

Cuirtear fráma a chumasctar isteach sa charnadóir ag meáchan 1/n ar dtús ar **sprioc scrataigh** ó nialas, agus ansin measctar isteach é, in ionad splatáil go díreach isteach sa charnadóir ag meáchan 1/n ([Carnadh](accumulation.md#why-each)). Dá splatálfaí go díreach, bheadh ranníocaíocht gach spriote 1/n den suim reatha a chuirtear léi, agus bainfeadh leathsnámhphointe iad sin - is measa an pictiúr dá dlúithe an picteilín. Ó nialas, tá gach suimeanna comparáideach leis an iomlán a bhaineann siad, an rud céanna a dhéanann fráma aonair cheana féin.

### An éifeacht tomhaiste {#measured-effect}

Ar radharc sintéiseach dlúth, ag léamh an réimse in aonaid chomhoiriúnacha:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-bit (tagartha) | 6051 | 60742 | 121199 | 232744 |
| 16-bit roimhe | 1372 | 6972 | 7840 | 7840 |
| 16-bit ina dhiaidh | 5996 | 59666 | 118824 | 210357 |

Tháinig an buaic ó 30× ro-íseal go 0.90×, agus tá an fráma comhdhéanta comhionann leis an 32-bit laistigh de 0.1% den luma meánach.

### Ag tástáil é {#testing-it}

Cuireann `?heat=f16` an conair seo i bhfeidhm ar an dá chúlchóras - gan lasc, ní bheadh an uimhríocht a rithfeadh GPUanna níos laige ach ag na daoine a rithfeadh iad féin. Rithfidh `npm run smoke:f16` an tsvít brabhsálaí iomlán leis.

Cuireann léamha ar ais an gnóthachan ar ceal: scaiptear an réimse léite ag an múchadh uathoibríoch leis, agus pasann `engine.readHeatProbe()` chuig an rindreálaí é - an bealach a léitear [léamh beo teasa an rialóra](measure.md#notes) freisin.
