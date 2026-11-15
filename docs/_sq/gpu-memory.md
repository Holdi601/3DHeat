---
title: "Qëndrimi i kujtesës së GPU"
parent: "Brendësitë e vizatimit"
nav_order: 5
lang: "sq"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# Qëndrimi i kujtesës së GPU

Karta grafike ka vetëm aq memorie. Nëse të dhënat e tua nuk hyjnë, shikuesi shfaq atë që hyn dhe e thotë këtë: kutia e statistikave merr një rresht qelibari **Not resident** me numrin e rreshtave që u lanë jashtë. Një grup i shkurtuar që dukej i plotë do të ishte gabimi më i keq që mund të bëjë një mjet analize, prandaj ky rresht kurrë nuk fshihet.

![Kutia e statistikave me rreshtin qelibar Not resident](../assets/img/en/gpu-memory-not-resident.webp)

Për të futur më shumë, ngri buxhetin e GPU te **Buxhetet e burimeve** dhe ngarko përsëri ([Kujtesa dhe buxhetet](memory-and-budgets.md#raising-the-gpu-budget)), ngushto të dhënat më parë, ose përdor një kartë me më shumë memorie.

## Për zhvilluesit {#for-developers}

### Si ruhen rreshtat në GPU {#how-rows-are-stored-on-the-gpu}

Rreshtat ngarkohen një herë, kur mbërrin një grup të dhënash, në **copa** prej 8.388.608 rreshtash (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Çdo copë kuantizohet kundrejt kutisë së vet kufizuese dhe intervalit të vet kohor:

| Të dhënat | Formati | Bajtë për rresht |
|---|---|---|
| Pozicioni X, Y, Z dhe ID-ja e grupit | katër numra të plotë pa shenjë 16-bit (RGBA16UI në WebGL2); X, Y, Z brenda kutisë kufizuese të copës | 8 |
| Koha dhe jetëgjatësia (kur grupi i të dhënave ka si kohë ashtu edhe person) | dy numra të plotë pa shenjë 16-bit (RG16UI): koha brenda intervalit kohor të copës; jetëgjatësia, ku 65.535 do të thotë "nuk ka mostër të radhës" | 4 |

Kutitë kufizuese për copë janë ajo që e bën 16 bit të mjaftueshëm: një copë zakonisht mbulon një pjesë të hartës, kështu që hapi i kuantizimit bie shumë nën një centimetër në një hartë me kilometra gjerësi, shumë nën zhurmën e telemetrisë reale. ID-ja e grupit që mbart në kanalin e katërt është falas - dhe kjo është arsyeja pse mund të ketë më së shumti 4.096 grupe ([Grupet](sessions-persons-groups.md#limits)).

Në WebGL2 çdo copë është një tekstur 8.192 texel e gjerë, e mbushur deri në rreshta të plotë teksturë; rreshtat arrihen nga `gl_VertexID` përmes një teksture blloku-indeksi për kornizë. Në WebGPU ato janë buffer-a ruajtjeje.

Memorie e mëtejshme GPU për rresht, e alokuar kur përdoret:

- çdo [filtër](filters.md) aktiv kolone: 4 bajtë për rresht (vlera me pikë lundruese 32-bit ose ID-të e kategorive), i ngarkuar për copë herën e parë që përdoret filtri;
- [nxehtësia e vijave](line-heat.md): 8 bajtë për rresht (fillimi i çdo segmenti, i kuantizuar brenda kutisë kufizuese të të dhënave, dhe flamujt e tij) ndërsa modaliteti Vija është i ndezur.

Plus objektivat e vizatimit: ngjyra dhe thellësia e skenës, objektivi i nxehtësisë dhe binjaku i tij i përkohshëm (katër kanale te [Nxehtësia e ekipit](team-heat.md)), shtresat e heqjes së thellësisë për [mbivendosjen](depth-and-culling.md); dhe gjeometria e nivelit.

### Buxheti zbatohet në ngarkim {#the-budget-is-enforced-at-upload}

WebGL pranon alokime që nuk mund t'i shërbejë, dhe pastaj ose e humbet kontekstin ose kalon në memorien e sistemit me kosto shkatërruese, prandaj buxheti i GPU zbatohet kur ngarkohet grupi i të dhënave ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- copat ngarkohen me radhë (domethënë me radhë kohore) ndërsa hyjnë;
- copa e parë që nuk hyn ngarkohet **pjesërisht** - aq rreshta të plotë teksture sa mban buxheti i mbetur - në vend që të mos ngarkohet fare, kështu që një buxhet që nuk mban dot një copë të plotë shfaq sa mundet; dhe meqenëse rreshtat janë të renditur sipas kohës, pjesa e shfaqur është një shtrirje e koherentë kohore;
- çdo gjë pas saj është **jo në memorie**.

Mungesa nuk fshihet: kutia e statistikave shfaq një rresht **Not resident** me numrin e rreshtave që nuk hynë, me ngjyrë qelibari, sa herë që është mbi zero. Një grup i shkurtuar që duket i plotë është gabimi më i keq që mund të ketë një mjet analize. [Kontrolli i përshtatjes](memory-and-budgets.md#the-fit-check) para ngarkimit synon ta parandalojë këtë rast.

Buxheti që përdor vizatuesi është buxheti i GPU nga **Buxhetet e burimeve**, e njëjta shifër që përdor kontrolli i përshtatjes - mbi shifrën e zbuluar gjithashtu, deri te kufiri i rrëshqitësit ([Ngritja e buxhetit të GPU](memory-and-budgets.md#raising-the-gpu-budget)). Zbatohet kur ngarkohet një grup të dhënash; ndryshimi i tij më pas hyn në fuqi në ngarkimin e radhës.
