---
title: "Cónaí cuimhne GPU"
parent: "Inmheánacha rindreála"
nav_order: 5
lang: "ga"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# Cónaí cuimhne GPU

Níl ach an oiread cuimhne ag cárta grafaicí. Mura gcuirtear do shonraí ina n-iomlán ann, taispeánann an léirsitheoir cad a fhéadfaidh sé a thaispeáint agus deir sé é: faigheann taispeántas staitisticí líne ambairt **Ní sa chuimhne** leis an líon sraitheanna a fágadh ar lár. Is é an earráid is measa is féidir le huirlis anailíse tacar sonraí gearrtha a chur i láthair mar iomlán, mar sin ní cheiltear an líne seo riamh.

![An taispeántas staitisticí leis an líne ambairt Ní sa chuimhne](../assets/img/en/gpu-memory-not-resident.webp)

Chun níos mó a fhorghabháil, ardaigh buiséad GPU faoi **Buiséid acmhainní** agus lódáil arís ([Cuimhne agus buiséid](memory-and-budgets.md#raising-the-gpu-budget)), cúngaigh na sonraí ar dtús, nó úsáid cárta a bhfuil níos mó cuimhne aige.

## Do fhorbróirí {#for-developers}

### Conas a stóráiltear sraitheanna ar an GPU {#how-rows-are-stored-on-the-gpu}

Uaslódáiltear sraitheanna uair amháin, nuair a thagann tacar sonraí, i **bpíosaí** de 8,388,608 sraith (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Cainníochtaítear gach píosa i gcoinne a bhosca teorann féin agus a raon ama:

| Sonraí | Formáid | Bearta in aghaidh an tsraith |
|---|---|---|
| Suíomh X, Y, Z agus id an ghrúpa | ceithre shlánuimhir 16-bit gan chomhartha (RGBA16UI ar WebGL2); X, Y, Z laistigh de bhosca teorann an phíosa | 8 |
| Am agus saol (nuair a bhíonn am agus duine ag an tacar sonraí araon) | dhá shlánuimhir 16-bit gan chomhartha (RG16UI): am laistigh de raon ama an phíosa; saol agus 65,535 ciallaíonn sé "gan sampla ar aghaidh" | 4 |

Is iad boscaí teorann in aghaidh an phíosa a fhágann go leor 16 giotán: clúdaíonn píosa de ghnáth cuid den léarscáil, mar sin tagann an céim chainníochtaithe i bhfad faoi lár méadair ar léarscáil atá cileiméadair ar leithead, i bhfad faoin torann i dtomhaiseanna fíora. Tá id an ghrúpa sa cheathrú cainéal saor - agus sin é an fáth nach féidir níos mó ná 4,096 grúpa a bheith ann ([Grúpaí](sessions-persons-groups.md#limits)).

Ar WebGL2 is uigeacht 8,192 texel ar leithead gach píosa, padaithe go sraitheanna uigeachta iomlána; sroichtear sraitheanna ó `gl_VertexID` trí uigeacht innéacs bloic in aghaidh an fhráma. Ar WebGPU is maolán stórála iad.

Cuimhne GPU eile in aghaidh an tsraith, leithdháilte ar úsáid:

- gach [scagaire](filters.md) colúin gníomhach: 4 bhearta in aghaidh an tsraith (luachanna snámhphointe 32-bit nó id catagóire), uaslódáilte in aghaidh an phíosa an chéad uair a úsáidtear an scagaire;
- [teas líne](line-heat.md): 8 bearta in aghaidh an tsraith (tús gach sleasa, cainníochtaithe laistigh de bhosca teorann na sonraí, agus a bhratacha) agus mód Línte ar siúl.

Chomh maith leis sin na spriocanna rindreála: dath agus doimhneacht an radhairc, an sprioc teasa agus a leathanach scrataigh (ceithre chainéal in [Teas foirne](team-heat.md)), agus na sraitheanna doimhneachta-bhaint le haghaidh [dofhálaithe](depth-and-culling.md); agus geoiméadracht an leibhéil.

### Cuirtear an buiséad i bhfeidhm ag uaslódáil {#the-budget-is-enforced-at-upload}

Glacann WebGL le leithdháiltí nach féidir leis a sheirbheáil agus ansin cailleann sé an comhthéacs nó titeann sé siar ar chuimhne an chórais ar chostas millteach, mar sin cuirtear buiséad GPU i bhfeidhm nuair a uaslódáiltear an tacar sonraí ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- uaslódáiltear píosaí in ord (is é sin, in ord ama) fad a fhéadann siad dul isteach;
- uaslódáiltear an chéad phíosa nach dtagann isteach **go páirteach** - an oiread sraitheanna uigeachta iomlána agus a choinníonn an buiséad fágtha - in ionad gan é a uaslódáil ar chor ar bith, ionas go dtaispeánann buiséad nach féidir píosa iomlán a shealbhú an oiread agus is féidir leis; agus de bharr go bhfuil na sraitheanna ordaithe de réir ama is píosa comhleanúnach ama an chuid a thaispeántar;
- tá gach rud ina dhiaidh **ní sa chuimhne**.

Ní cheiltear an easnamh: taispeánann an taispeántas staitisticí líne **Ní sa chuimhne** leis an líon sraitheanna nár tháinig isteach, in ambairt, aon uair is mó ná nialas é. Is é tacar sonraí gearrtha a fhéachann iomlán an earráid is measa a bheadh ag uirlis anailíse. Tá [seiceáil oiriúnachta](memory-and-budgets.md#the-fit-check) roimh an lódáil ceaptha chun an cás seo a chosc.

Is é an buiséad a úsáideann an rindreálaí buiséad GPU ó **Buiséid acmhainní**, an figiúr céanna a úsáideann an seiceáil oiriúnachta - os cionn an fhigiúir braite freisin, suas go huasteorainn an sleamháin ([Buiséad GPU a ardú](memory-and-budgets.md#raising-the-gpu-budget)). Cuirtear i bhfeidhm é nuair a uaslódáiltear tacar sonraí; athraíonn sé ar an lódáil dar gcionn má athraítear é ina dhiaidh sin.
