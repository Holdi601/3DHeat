---
title: "Íomhánna léarscáile"
parent: "Leibhéil agus geoiméadracht chúlra"
nav_order: 1
lang: "ga"
source: "map-images.md"
source_hash: "f0bbaa4b019e"
translated: true
outdated: false
---


# Íomhánna léarscáile

Is pictiúr comhthreomhar é íomhá léarscáile - mionléarscáil, grianghraf satailíte, plean urláir - a leagtar faoi do shonraí ionas gur féidir leat a fheiceáil cá bhfuil an teas. Insíonn tú don amharcóir cá háit a bhaineann an pictiúr trí dhá phointe air a phionósú in dhá áit sa domhan (na "ancaireacha").

## Luchtaigh agus socraigh íomhá léarscáile {#load-and-place-a-map-image}

1. Luchtaigh do chuid sonraí ar dtús ([Sonraí a fháil isteach](getting-data-in.md)).
2. Faoi **Cúlra / leibhéal**, brúigh **Íomhá léarscáile…** agus roghnaigh an pictiúr. Sínetar é thar limistéar na sonraí.
3. Brúigh **Oiriúnaigh do theorainneacha na sonraí** má bogadh an pictiúr. Téann ancaire 1 go cúinne barr-chlé an phictiúir, ancaire 2 go dtí a chúinne bun-dheas, ag imeall na sonraí.
4. Mura ndéanann an teas líne suas leis an bpictiúr, roghnaigh dhá thírchuimhne atá i bhfad óna chéile (mar shampla dhá chúinne contrártha foirgnimh nó dhá chros-bhóthar). Léigh picteilín gach ceann ar an bpictiúr agus a shuíomh domhain (bí ag crochadh thar an [rialóir](measure.md) chun **X** agus **Z** a léamh).
5. Clóscríobh iad isteach sa **Socrúchán**: d'**Ancaire 1** an **px** agus **py** den tírchuimhne, agus an **X domhanda**, an **Z domhanda**; mar an gcéanna d'**Ancaire 2**.
6. Seiceáil: ba cheart rian nó buaicphointe a bhfuil a fhios agat go bhfuil sé ar bhóthar a bheith ar an mbóthar sin anois. Coigeartaigh na huimhreacha go dtí go bhfuil.

![Alt an tSocrúcháin le dhá ancaire agus teas tarraingthe ar íomhá léarscáile](../assets/img/en/map-images-placement.webp)

Caithfidh an dá thírchuimhne a bheith difriúil sa dá cholún picteilíní agus sa dá ró picteilíní, nó deir an painéal *Tá an dá ancaire ag roinnt ró nó colúin picteilíní*.

## Luchtú {#loading}

Aon fhormáid íomhá a dhéanfaidh an brabhsálaí a dhíchódú. Laghdaítear íomhá a bhfuil a fad is faide os cionn **8192 px** go 8192 (an imeall is mó a iarrtar ar an GPU a shealbhú), agus deir an painéal *Laghdaithe ó W×H go w×h*.

Ar luchtú sínetar an íomhá thar theorainneacha X-Z na sonraí (nó ±1000 aonad gan tacar sonraí), an tuaisceart suas, ag airde Y is ísle na sonraí. Is iad na réamhshocruithe **Teimhneacht** 100%, **Gile** 0.7, **Díshaithiú** 100%, **Iompaigh thuaidh/theas** air: díshaturated agus dorcha, mar is é post an chúlra ligean duit buaicphointe a aimsiú, gan dul san iomaíocht leis.

## Rialuithe {#controls}

| Rialú | Réamhshocrú | Raon | Brí |
|---|---|---|---|
| **Teimhneacht** | 100% | 0-100% | |
| **Gile** | 0.7 | 0-2 (jog 64) | |
| **Díshaithiú** | 100% | 0-100% | Cúlra liath, teas sáithithe. Iomaíonn dath sa léarscáil le dath sna sonraí. |
| **Iompaigh thuaidh/theas** | air | | Cé acu ró den íomhá atá ag an Z uasta domhanda. Má athraítear é agus tacar sonraí luchtaithe, athoiriúnaítear na hancaireacha do theorainneacha na sonraí freisin. |
| **Socrúchán**: Ancaire 1, Ancaire 2 | cúinní an phictiúir ar theorainneacha na sonraí | | Is picteilín ar an íomhá gach ancaire - **px** (ó chlé, 0 go dtí an leithead) agus **py** (ó bharr, 0 go dtí an airde) - agus an comhordanáid dhomhanda ar a suíonn sé, **X domhanda** agus **Z domhanda**. Leanann scála agus fritháireamh ón mbeirt. |
| **Oiriúnaigh do theorainneacha na sonraí** | | | Cuireann ancaire 1 ar chúinne barr-chlé na híomhá agus ancaire 2 ar a chúinne bun-dheas, ag teorainneacha X-Z na sonraí. Pointe tosaigh le haghaidh socrúcháin bheacht. Teastaíonn tacar sonraí. |
| **Airde** | Y is ísle na sonraí | Y íosta sonraí - 500 go Y uasta + 500 (jog Y uasta + 100,000) | Airde an phlána léarscáile. Cuir faoi bhun na sonraí go díreach é ionas nach gcuirfear rud ar bith i bhfolach ag an bplána. |

Taispeánann líne an ainm `leithead×airde px · x × z m/px`, méid domhanda picteilín amháin feadh gach ais.

## Sa radharc {#in-the-scene}

Is ceathairshleasán uigeachta amháin é an íomhá ag an airde. Ag teimhneacht iomlán scríobhann sí doimhneacht, agus mar sin glacann sí páirt i [folú](depth-and-culling.md) mar thalamh; faoi 100% teimhneacht measctar í agus ní scríobhann sí doimhneacht, agus mar sin ní fholaíonn sí rud ar bith. Tomhaiseann an [rialóir](measure.md) ar a plána. Stórálann an [leabharlann leibhéal](level-library.md) leibhéal íomhá lena ancaireacha.

## Léarscáil Dota 2 {#dota-2-map}

Faigheann **Léarscáil Dota 2** in aice le **Íomhá léarscáile…** an líníocht de léarscáil reatha Dota 2 a thaispeánann [OpenDota](https://www.opendota.com) ar a leathanaigh chluichí, agus cuireann sé faoi thábla a scríobhann an [Watcher](https://github.com/Holdi601/3DHeat-Watcher) ó athsheinmeanna Dota 2 ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Faightear an íomhá ó opendota.com nuair a bhrúitear an cnaipe agus ní cuid de 3DHeat í; tógtar líníocht an phaisce is nuaí ó liosta féin OpenDota, agus líníocht 7.40 nuair nach féidir an liosta a léamh.

| | |
|---|---|
| Foinse | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Socrúchán | Calabrú OpenDota: sínneann an íomhá aonaid domhain Dota -8192 go 8064 ar an dá ais (cealla 128-aonad 64 go 191), an tuaisceart ag barr. Le haiseanna tábla an athsheinm (Z suas, Y casta) sin is X domhanda -8192 go 8064 agus Z domhanda -8064 go 8192. Thart ar 18 aonad in aghaidh picteilín. |
| Airde | 0. Seasann laochra ag 0 go thart ar 600. |
| Cuma | Gile 0.8, díshaithiú 50%. |

Seiceáilte ar athsheinm cluiche poiblí de phaiste 7.40: leanann rian gach laoch na lánaí tarraingthe, agus titeann na túir, na barraicí agus na Ársaí a chuireann an athsheinm ar na bunanna tarraingthe. Taispeánann an radharc **Barr** an léarscáil le tuaisceart ag bun an scáileáin, mar a thaispeánann sé aon tábla Z-suas le Y casta.

Is le OpenDota an líníocht, de léarscáil Valve; ní fhaomhann Valve 3DHeat.

### An léarscáil 3T {#the-3d-map}

Le Dota 2 suiteáilte, déanann an uirlis ar leith [3DHeat Dota](https://holdi601.github.io/3DHeat-Ext-Dota/) (`heat3d-dota-maps level -o dota.glb`; ritheann ordú [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) an Watcher í freisin) an léarscáil i 3T ó chomhaid an chluiche féin: talamh, aillte, uisce, crainn agus foirgnimh, in aonaid agus in aiseanna tháblaí na n-athsheinmeanna. Lódáil an comhad uair amháin le **Samhail 3T…**: aithníonn an breathnóir é ar a chodanna (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` in `dotaMap.ts`), cuireann sé sa [leabharlann leibhéal](level-library.md) láithreach é in áit cinn níos sine, agus deir sé amhlaidh. Ón uair sin, lódálann **Léarscáil Dota 2** an léarscáil 3T sin ón leabharlann in ionad an líníocht a íoslódáil; mura bhfuil ceann sa leabharlann, íoslódálann sé an líníocht agus insíonn sé conas an léarscáil 3T a dhéanamh. Is ó do shuiteáil féin a thagann an comhad agus fanann sé ar do ríomhaire.

## Do fhorbróirí {#for-developers}

### Conas a socraíonn na hancaireacha an íomhá {#how-the-anchors-place-the-image}

Ó [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), le hancaireacha *a* agus *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
suíonn picteilín (0, 0) ag  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Socraíonn dhá ancaire an scála agus an fritháireamh ar gach ais go neamhspleách, mar sin is féidir léarscáil a shíneadh go difriúil ar X agus Z ach ní féidir í a rothlú. Caithfidh na hancaireacha a bheith difriúil sa **dá** chomhordanáid phicteilíní; nuair a roinneann siad ró nó colún, ní féidir scála a dhíorthú, ní tarraingítear an léarscáil, agus deir an painéal *Tá an dá ancaire ag roinnt ró nó colúin picteilíní*.
