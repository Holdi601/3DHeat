---
title: "Residenza tal-memorja tal-GPU"
parent: "Id-dettalji tar-rendering"
nav_order: 5
lang: "mt"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# Residenza tal-memorja tal-GPU

Il-karta tal-grafika għandha biss ammont limitat ta' memorja. Jekk id-dejta tiegħek ma tidholx, il-viewer juri dak li jidhol u jgħid dan: fl-overlay tal-statistiċi jidher linja **Mhux residenti** f'kulur ambra bl-għadd tar-ringieli li tħalla barra. Dataset imqassar li jidher kompluti kien ikun l-agħar żball li jista' jagħmel għodda ta' analiżi, għalhekk din il-linja qatt ma tinħeba.

![L-overlay tal-statistiċi bil-linja ambra Mhux residenti](../assets/img/en/gpu-memory-not-resident.webp)

Biex tidħol aktar dejta, oġħla l-baġit tal-GPU taħt **Baġits tar-riżorsi** u erġa' tagħbi ([Memorja u baġits](memory-and-budgets.md#raising-the-gpu-budget)), oħroġ l-ewwel dejta aktar dejqa, jew uża karta b'aktar memorja.

## Għall-iżviluppaturi {#for-developers}

### Kif jinħażnu r-ringieli fuq il-GPU {#how-rows-are-stored-on-the-gpu}

Ir-ringieli jiġu uploaded darba, meta jasal dataset, f'**chunks** ta' 8,388,608 ringiela (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Kull chunk jiġi quantised kontra l-bounding box tiegħu stess u l-firxa taż-żmien tiegħu:

| Dejta | Format | Bytes għal kull ringiela |
|---|---|---|
| Pożizzjoni X, Y, Z u l-ID tal-grupp | erba' integers mingħajr sinjal ta' 16-bit (RGBA16UI fuq WebGL2); X, Y, Z fil-bounding box tal-chunk | 8 |
| Ħin u ħajja (meta d-dataset ikollu t-tnejn il-ħin u l-persuna) | tnejn integers mingħajr sinjal ta' 16-bit (RG16UI): il-ħin fil-firxa taż-żmien tal-chunk; il-ħajja b'65,535 li tfisser "l-ebda sample sussegwenti" | 4 |

Il-bounding boxes għal kull chunk huma dak li jagħmel 16-il bit biżżejjed: chunk ġeneralment jkopri frazzjoni tal-mappa, għalhekk il-pass tal-quantisation jinżel ferm taħt ċentimetru fuq mappa ta' kilometri, ferm taħt l-istorbju ta' telemetrija reali. L-ID tal-grupp li jgħix fir-raba' kanal ma jikkostax xejn - u għalhekk jista' jkun hemm mhux aktar minn 4,096 grupp ([Gruppi](sessions-persons-groups.md#limits)).

Fuq WebGL2 kull chunk huwa texture wiesgħa 8,192 texels, imtlija sa ringiela sħiħa tat-texture; ir-ringieli jintlaħqu minn `gl_VertexID` permezz ta' texture tal-indiċi tal-blokki għal kull frame. Fuq WebGPU huma buffers tal-ħażna.

Memorja oħra tal-GPU għal kull ringiela, allokata meta tintuża:

- kull [filtru](filters.md) attiv tal-kolonna: 4 bytes għal kull ringiela (valuri float ta' 32-bit jew ID-ijiet tal-kategoriji), uploaded għal kull chunk l-ewwel darba li jintuża l-filtru;
- [sħana tal-linji](line-heat.md): 8 bytes għal kull ringiela (il-bidu ta' kull segment, quantised fil-bounding box tad-dejta, u l-flags tiegħu) waqt li l-modalità Linji tkun mixgħula.

Miegħu jiġu t-targets tar-render: il-kulur tax-xena u l-fond, it-target tas-sħana u t-twin tiegħu tais-scratch (erba' kanali fi [Sħana tat-tim](team-heat.md)), u s-saffi tad-depth-peeling għall-[occlusion](depth-and-culling.md); u l-ġeometrija tal-livell.

### Il-baġit jiġi infurzat fl-upload {#the-budget-is-enforced-at-upload}

WebGL jaċċetta allokazzjonijiet li ma jistax jiġi servit, u mbagħad jew jitlef il-kuntest jew jaqa' għall-memorja tas-sistema b'kost ta' ħsara kbira, għalhekk il-baġit tal-GPU jiġi infurzat meta d-dataset jiġi uploaded ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- il-chunks jiġu uploaded fl-ordni (jiġifieri fl-ordni taż-żmien) sakemm jidholu;
- l-ewwel chunk li ma jidholx jiġi uploaded **parzjalment** - bħala l-għadd sħiħ ta' ringieli tat-texture li jidħlu fil-baġit li baqa' - minflok ma jiġix uploaded xejn, sabiex baġit li ma jistax iżomm chunk sħiħ juri kemm jista'; u peress li r-ringieli huma ordnati skont il-ħin, il-parti li tidher hija żmien koerenti;
- kull ma jiġi wara jkun **mhux residenti**.

It-tonqis mhuwiex moħbi: l-overlay tal-statistiċi juri linja **Mhux residenti** bl-għadd tar-ringieli li ma daħlux, f'kulur ambra, kull meta jkun ogħla minn zero. Dataset maqtugħ li jidher sħiħ huwa l-agħar falliment li jista' jkollu għodda ta' analiżi. L-[iċċekkjar tal-fit](memory-and-budgets.md#the-fit-check) qabel it-tagħbija huwa maħsub biex jipprevjeni dan il-każ.

Il-baġit li juża r-renderer huwa l-baġit tal-GPU minn **Baġits tar-riżorsi**, l-istess figura li juża l-iċċekkjar tal-fit - aktar mill-figura misjuba, sa massimu tal-slider (ara [Tlugħ il-baġit tal-GPU](memory-and-budgets.md#raising-the-gpu-budget)). Jiġi applikat meta jiġi uploaded dataset; jekk tbiddlu wara, jidħol fis-seħħ fl-iload li jmiss.
