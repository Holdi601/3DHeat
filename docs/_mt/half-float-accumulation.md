---
title: "Akkumulazzjoni half-float"
parent: "Id-dettalji tar-rendering"
nav_order: 4
lang: "mt"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Akkumulazzjoni half-float

Xi karti tal-grafika jistgħu jżommu s-sħana biss f'numri żgħar ta' 16-bit, li jistgħu jaqtgħu jew jagħmlu round għall-postijiet l-aktar sħan. Il-viewer jagħmel scale għan-numri biex dan ma jidhirx. Ma għandek bżonn tagħmel xejn; din il-paġna hija għall-iżviluppaturi.

## Għall-iżviluppaturi {#for-developers}

Apparat li ma jistax jagħmel blend f'textures float ta' 32-bit (mhux `float32-blendable` u `float32-filterable` fuq WebGPU, mhux `EXT_float_blend` fuq WebGL2) jieħu target tas-sħana ta' **16-bit float** (`r16float`): massimu ta' 65,504 u 11-il bit tal-mantissa. Qasam dens jilħaq mijiet ta' eluf, għalhekk target ta' 16-bit kemm **jaqta'** kif ukoll **jagħmel round**, u l-iżball tal-round jikber mal-valur - li jidher b'mod speċifiku ħafna: l-aktar postijiet densi jidhru ferm inqas sħan milli huma, filwaqt li l-postijiet ħfief jidhru tajbin. Żewġ mekkaniżmi jittrattawha; l-istampa tkun korretta biss jekk it-tnejn jaħdmu.

### Firxa: gain fuq kull splat {#range-a-gain-on-every-splat}

Kull splat jiġi mmultiplikat b'**gain**, u l-composite jaqsmu lura, għalhekk il-qasam jinsab fil-kobor li l-half floats jieħdu tajjeb magħhom ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = analytic saturation estimate for this dataset, radius and centre intensity
gain     = 2 ^ round(log2(2048 / estimate)),  exponent clamped to -20..20
```

2048 iħalli madwar 32× spazju 'il fuq mill-quċċata tal-ramp qabel 65,504. Il-gain huwa **power of two**, għalhekk bidla żgħira fl-istima tħallih - u l-buffer akkumulat - bla bidla, u huwa parti mill-[signature tal-ġeometrija](accumulation.md#what-restarts-it), għalhekk bidla terġa' tibda l-akkumulazzjoni.

Huwa mwaħħal mal-istima analitika u **mhux** mal-punt tas-saturazzjoni b'intenzjoni. Is-saturazzjoni tiġi applikata fil-composite apposta biex it-bidla tagħha qatt ma jerġa' jibda l-konverġenza; jekk il-gain jiċċaqlaq miegħu, il-buffer ikun għadu żomm valuri miktuba bil-gain l-antik filwaqt li l-composite jaqsam bil-ġdid, iż-żewġ żbalji jitħassru eżatt, u l-slider jidher li ma jagħmel xejn.

Fuq target ta' 32-bit il-gain huwa dejjem 1.

### Preċiżjoni: frames parzjali mill-zero {#precision-partial-frames-from-zero}

Frame li jitgħaqqad fl-accumulator bil-piż 1/n l-ewwel jiġi splatted f'**scratch target** mill-zero u mbagħad jitħallat, aktar milli jiġi splatted direttament fl-accumulator b'piż 1/n ([Akkumulazzjoni](accumulation.md#why-each)). Direttament, il-kontribuzzjoni ta' kull sprite tkun 1/n tad-daqs tat-total li qed jiżdied miegħu, u half float jgħamel round għal dawk; agħar ma jkun iktar dens il-pixel. Mill-zero, kull żieda tkun komparabbli mat-total li tingħaqad miegħu, l-istess aritmetika li frame wieħed diġà jagħmel.

### L-effett imkejjel {#measured-effect}

Fuq xena sintetika densa, billi naqraw il-qasam f'unitajiet ekwivalenti:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-bit (referenza) | 6051 | 60742 | 121199 | 232744 |
| 16-bit qabel | 1372 | 6972 | 7840 | 7840 |
| 16-bit wara | 5996 | 59666 | 118824 | 210357 |

Il-quċċata marret minn 30× baxxa għal 0.90×, u l-frame kkompożat jaqbel mal-frame 32-bit sa 0.1% tal-luma medju.

### Ittestjar {#testing-it}

`?heat=f16` iġiegħel dan il-mod fuq kwalunkwe backend - mingħajr switch, l-aritmetika li tiġri biss fuq GPUs iktar dgħajfa kienet tkun tiġi ttestjata biss mill-persuni li jużawhom. `npm run smoke:f16` iħaddem is-suite sħiħ tal-browser bih.

Ir-readbacks ineħħu l-gain: l-auto-exposure jaqsam il-qasam moqri bih, u `engine.readHeatProbe()` jgħaddih lir-renderer - u dan huwa wkoll kif jinqara l-[readout live tas-sħana tal-linjal](measure.md#notes).
