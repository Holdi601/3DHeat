---
title: "Leibhéil agus geoiméadracht chúlra"
nav_order: 16
has_children: true
lang: "ga"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: false
---

# Leibhéil agus geoiméadracht chúlra

Is é leibhéal an áit 3D inar tharla an cluiche - léarscáil, baile, rian. Cuir ceann taobh thiar de do shonraí agus is féidir leat a fheiceáil *cá* bhfuil an teas. Tugann an painéal **Cúlra / leibhéal** (féach an [gluais](glossary.md) le haghaidh "leibhéal") trí chineál comhthéacs duit:

- **íomhá léarscáile**, geo-thagartha ag dhá ancaire - féach [Íomhánna léarscáile](map-images.md);
- **leibhéal 3D** - `.glb`, `.gltf`, `.obj`, `.stl` nó `.ply` - roinnte ina talamh, struchtúir agus uisce agus simplithe ar iompórtáil - féach [Leibhéil 3D](model-levels.md) agus [Cuma an leibhéil](level-appearance.md);
- **cúlra domhanda** - le haghaidh taifeadta a deir cá bhfuil sé ar an domhan (comhad Tacview ACMI), an tír-raon fíor, bóithre, uisce, aerpháirceanna agus foirgnimh, íoslódáilte ó shonraí oscailte - féach [Cúlra domhanda](world-backdrop.md).

Gan aon rud lódáilte, tá an radharc dorcha le greille agus aiseanna datha (**Greille** agus **Aiseanna** sa [Ceamara agus radharc](camera.md)), agus deir an painéal *Níl aon rud lódáilte — taispeánann an radharc greille agus aiseanna. Cuir íomhá léarscáile nó mogalra leibhéil leis chun comhthéacs a thabhairt don teas.*

Tá an leibhéal roinnte ag na trí chluaisín: is é an leibhéal céanna é a thaispeánann an teas más cúrsa é a lódáladh i gcluaisín Anailís rása.

![Painéal an Chúlra / leibhéil le leibhéal lódáilte: cnaipí Íomhá léarscáile agus Samhail 3T, Láthair chatha, Teimhneacht, Gile, Sábháil sa leabharlann agus liosta na Leabharlainne](../assets/img/ga/level-panel.webp)

## Cuir leibhéal taobh thiar de do shonraí {#put-a-level-behind-your-data}

1. Lódáil do shonraí ar dtús ([Sonraí a iontráil](getting-data-in.md)), ionas go bhfeistítear an leibhéal orthu.
2. Oscail **Cúlra / leibhéal** sa bharra taoibh.
3. Brúigh **Íomhá léarscáile…** le haghaidh pictiúir nó **Samhail 3T…** le haghaidh leibhéil 3D, agus roghnaigh an comhad. Le haghaidh taifeadta fíorshaoil, úsáid **An fíorshaol mar chúlra** nó **Láthair chatha** ina ionad.
4. Fan go gcríochnaíonn an líne dul chun cinn. Simplítear samhail mhór ar dtús (féach **Sprioc simplithe** thíos).
5. Brúigh **F** sa radharc chun gach rud a fhrámú. Úsáid **Teimhneacht** agus **Gile** go dtí go seasann an teas amach ón leibhéal.
6. Brúigh **Sábháil sa leabharlann** má úsáidfidh tú an leibhéal arís ([Leabharlann leibhéal](level-library.md)).

## Cad a dhéanann leibhéal don teas {#what-a-level-does-for-the-heat}

- Déanann sé **folach**: déantar sonraí taobh thiar de a dhorchú de réir dromchla, agus folaítear sonraí taobh thiar den tír-raon ([Doimhne agus baint](depth-and-culling.md)). Gan leibhéal, níl folach ar bith.
- Gearrtar é ag an [Sliseadh](slice.md) agus, le *Gearr an leibhéal freisin*, ag [baint faoi fhad](depth-and-culling.md#distance-culling), in éineacht leis an teas.
- Is é an t-aon rud a mhaolaíonn [doimhneacht réimse](camera.md#depth-of-field) ar a seachas an greille agus na boscaí.
- Leathnaíonn leibhéal 3D **plána i gcéin an cheamara** nuair is mó é ná na sonraí: calabraítear gar agus i gcéin ón tacar sonraí, agus murach sin bheadh léarscáil easpórtáilte a bhfuil cúpla ciliméadar ar leithead uile taobh thiar de phlána i gcéin, agus dhéanfaí radharc folamh de. Éiríonn an plána i gcéin 3 × fhad chothrománach an leibhéil nuair is mó é sin, bogann an plána gar leis (ar a laghad i gcéin / 100,000) chun an beachtas doimhneachta a choinneáil a bhraitheann an folach air, agus ardaítear luas eitilte go ar a laghad fad / 12. Ní leathnaítear é ach, ní chúngaítear riamh é.

## An painéal, ó bharr go bun {#the-panel-top-to-bottom}

| Cuid | Sonraí |
|---|---|
| **Íomhá léarscáile…**, **Samhail 3T…** | Lódáil ceann; cuireann sé an leibhéal reatha in ionad. |
| **An fíorshaol mar chúlra**, **Déan dearmad ar thíleanna léarscáile** | Le haghaidh tacair sonraí le tagairt gheografach amháin: an áit fhíor faoi a thógáil mar leibhéal, nó na tíleanna íoslódáilte a scriosadh. [Cúlra domhanda](world-backdrop.md) |
| **Sprioc simplithe** | An buiséad triantán don iompórtáil samhla eile: *Iomlán — gan simpliú* (réamhshocrú), *Ard — 8M triantán*, *Meánach — 3M triantán*, *Íseal — 800k triantán*, *Scáthchruth — 100k triantán*. [Leibhéil 3D](model-levels.md#simplification) |
| Dul chun cinn agus **Cealaigh** | Le linn díchódála nó iompórtála. |
| Nóta iompórtála | Triantáin roimh agus tar éis, roinnt talamh / struchtúir / uisce, an leibhéal mionsonraí a úsáideadh. |
| Ainm agus méid | `leithead×airde px · x × z m/px` do phictiúr, `N triantán (ó M)` do shamhail. |
| **Teimhneacht**, **Gile** | An dá chineál. |
| Rialuithe íomhá | **Díshaithiú**, **Iompaigh thuaidh/theas**, **Socrúchán** (dhá ancaire), **Oiriúnaigh do theorainneacha na sonraí**, **Airde**. [Íomhánna léarscáile](map-images.md) |
| Rialuithe samhla | Athrú talún, uisce, triantáin talún, creatlach, eireabhaill, struchtúir, aicmiú páirteanna. [Cuma an leibhéil](level-appearance.md) |
| **Sábháil sa leabharlann**, **Bain** | [Leabharlann leibhéal](level-library.md); baineann Bain an leibhéal. |
| **Leabharlann** | Leibhéil stóráilte sa bhrabhsálaí seo. [Leabharlann leibhéal](level-library.md) |

## Leathanaigh sa chuid seo {#pages-in-this-section}

- [Íomhánna léarscáile](map-images.md)
- [Leibhéil 3D](model-levels.md) - formáidí, páirteanna, aicmiú, simpliú, uigeachtaí
- [Cuma an leibhéil](level-appearance.md) - gach rialú le haghaidh leibhéil 3D
- [Leabharlann leibhéal](level-library.md)
- [Cúlra domhanda](world-backdrop.md) - an fíorshaol faoi thaifeadadh, ó shonraí oscailte

Conas leibhéil a fháil as cluichí agus innill is é gnó na n-uirlisí easpórtála ar leithligh (féach [léamh-liom](https://github.com/Holdi601/3DHeat/blob/main/README.md) an stórais); tá an conradh a scríobhann siad chuige achoimrithe i [Leibhéil 3D](model-levels.md#the-exporter-contract).
