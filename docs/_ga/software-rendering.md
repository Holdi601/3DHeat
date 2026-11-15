---
title: "Brath rindreála bogearraí"
parent: "Inmheánacha rindreála"
nav_order: 6
lang: "ga"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Brath rindreála bogearraí

Má tharraingíonn do bhrabhsálaí ar an bpróiseálaí príomhúil in ionad an chárta grafaicí, tá an léirsitheoir go mór níos moille. Braitheann an léirsitheoir air seo agus taispeánann sé bosca dearg a deir cad atá le casadh air.

Nuair a bhíonn luasú crua-earraí as ag brabhsálaí, nó nuair a bhíonn a thiománaí ar an liosta dubh, tarraingíonn sé WebGL agus WebGPU ar an LPA. Oibríonn gach rud fós, i bhfad níos moille, agus is é an taithí "tá an léirsitheoir seo doshásúil de mhall le mo chuid sonraí" - comhartha a thugann le tuiscint gurb é an uirlis féin an fhadhb, ní lasc sa bhrabhsálaí. Mar sin féachann an léirsitheoir ar ainm an rindreálaí agus deir sé é ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## An meirge {#the-banner}

Nuair a aithnítear an rindreálaí go dearfach mar bhogearraí, tagann bosca dearg ag barr an bharra taobh (cluaisíní Teasmhapa agus Cluiche), os cionn an bharra módanna:

![An meirge dearg: Ag rith gan an cárta grafaicí](../assets/img/en/software-rendering-banner.webp)

> **Ag rith gan an cárta grafaicí.**
> Tá an brabhsálaí seo ag tarraingt ar an LPA in ionad an chárta grafaicí, rud atá go mór níos moille agus nach láimhseálfaidh tacair mhóra sonraí. Cas luasú crua-earraí air i socruithe an bhrabhsálaí (Chrome: Socruithe → Córas → "Úsáid luasú grafaicí nuair is féidir", ansin atosaigh), agus seiceáil go bhfuil tiománaí na grafaice nuashonraithe.

## Do fhorbróirí {#for-developers}

### Conas a chinneann sé {#how-it-decides}

Déantar sreang an rindreálaí - `UNMASKED_RENDERER_WEBGL` de WebGL2, nó díoltóir, ailtireacht agus gléas an oiriúntóra de WebGPU - a chur i litreacha beaga agus a rangú:

- **bogearraí** nuair a bhíonn `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` nó `generic renderer` inti;
- **crua-earraí** nuair a bhíonn díoltóir nó teaghlach GPU aitheanta inti (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **anaithnid** seachas sin.

Ardaíonn *bogearraí* amháin an meirge. Ní deir oiriúntóir gan aithint aon rud: is teip níos measa é duine a bhfuil GPU ag obair aige a chur ar ais chun a bhrabhsálaí a athchumrú ná cás a chailleadh.

### An t-ainm gearr {#the-short-name}

Gearrann an modúl céanna sreang an rindreálaí chun í a thaispeáint: ó shreang ANGLE mar `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` coinníonn sé an réimse gléis, scriosann sé id PCI agus an API agus leibhéal an shader ina dhiaidh, agus taispeánann sé `Vendor Model`. Taispeántar an t-ainm gearr i **Buiséid acmhainní**, leis an sreang iomlán mar leid; taispeánann an meastachán cuimhne an tsreang iomlán.
