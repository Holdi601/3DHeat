---
title: "Difríocht"
parent: "Modhanna teasa"
nav_order: 5
lang: "ga"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: true
---

# Difríocht

Dearg san áit a raibh foireann A níos mó, gorm-glas san áit a raibh foireann B, aon rud san áit a raibh siad comhionann.

Is teas comharthaithe é **Difríocht** (eochair 2). Cuireann sraitheanna de dhaonra amháin teas leis; baineann sraitheanna de dhaonra eile uaidh. Sa limistéar ina bhforlapann an bheirt go cothrom is nialas an toradh agus tá sé trédhearcach go hiomlán; san áit a bhfuil ceann amháin i gceannas taispeántar é i ndathanna an taobh sin - de réir réamhshocraithe te (trédhearcach → dearg → buí → bán) don taobh **+** agus fuar (trédhearcach → glas → gorm → corcra) don taobh **−**.

![Teas difríochta: dearg san áit a raibh an taobh + níos mó, glas agus gorm san áit a raibh an taobh - níos mó](../assets/img/ga/difference-split.webp)

## Conas é a úsáid {#how-to-use-it}

1. Brúigh `2` (nó roghnaigh **Difríocht** sa bharra na modhanna).
2. Oscail **Scoilt difríochta** sa bharra taoibh.
3. Roghnaigh cad a **Scoilt de réir**: de ghnáth *Grúpaí*.
4. Cuir grúpa amháin (nó luach) ar **+** agus grúpa eile ar **−**.
5. Léigh na dathanna: ciallaíonn te an taobh +, ciallaíonn fuar an taobh −. Tugann an painéal rabhadh mura bhfuil sraitheanna ag taobh amháin (féach [Teachtaireachtaí a d'fhéadfá a fheiceáil](#messages-you-may-see)).

*Cé na dhá dhaonra* is ceist iomlán í, mar sin is féidir leis an scoilt aon cholún coinnithe a bheith, ní grúpaí amháin. Ní chuirtear sraitheanna nach dtagann ar **aon** taobh san áireamh mar nialas: is é sin a fhágann go ndéanann scoilt thar dhá luach de go leor luachanna comparáid díreach ar an dá luach sin, agus go gcomhcheanglaíonn sé leis na [scagairí](filters.md) - scag go dtí léarscáil amháin, agus roinn ansin é de réir leagan.

Teastaíonn dhá thaobh ón mhód: colún grúpa le dhá ghrúpa ar a laghad, nó scoilt thar cholún coinnithe le scagadh. Ar shonraí le níos lú ná dhá ghrúpa tosaíonn lódáil le scoilt colúin - colún **Comhad foinse** de lódáil il-chomhad ar dtús, ansin an chéad cholún catagóire le dhá luach, nó an chéad cholún uimhriúil le raon - ionas go n-oibríonn *comparáid dhá lódáil* ar shonraí gan aon ghrúpaí. Ní fhágtar an mód as fáil ach ar shonraí nach bhfuil ceachtar acu; fágtar as fáil é freisin nuair a fhágann scoilt colúin rud ar bith ar thaobh amháin.

## Painéal Scoilt na Difríochta {#the-difference-split-panel}

Taispeántar é i mód na Difríochta, faoi na painéil teasa.

**Scoilt de réir** tairgeann:

| Rogha | Taispeántar mar | Riail na scoilte |
|---|---|---|
| Grúpaí | *Grúpa (N)* (nuair a bhíonn colún grúpa ann) | Gach grúpa ar +, − nó ar aon cheann, socraithe sa [Liosta foirne](teams-list.md) |
| Colún catagóire | *colún (N luach)* | Luachanna ar +, − nó ar aon cheann |
| Colún uimhriúil | *colún (uimhriúil)* | Raon luacha do gach taobh |
| An comhad tionscnaimh | *Comhad foinse - comparáid dhá lódáil* (nuair a lódáladh roinnt comhad) | Comhaid ar +, − nó ar aon cheann |

Ní thairgtear ach colúin a choinnítear faoi *Coinnigh le haghaidh scagtha* ag am an lódála.

### Comparáid codanna, ní líonta {#compare-shares-not-counts}

Meáchanaíonn **Cuir codanna i gcomparáid, ní líonta** (réamhshocraithe as) gach taobh de réir a haonaid thar líon a shraitheanna féin, ionas nach mbuann taobh a bhfuil cúig huaire níos mó sraitheanna de amháin ar líon. Ansin taispeánann an dath an áit a bhfuil gach taobh níos coitianta go comhréireach ná an taobh eile. Úsáid é nuair a bhfuil méideanna an-difriúla sonraí ag an dá thaobh, mar shampla dhá sheisiún de fhaid difriúil.

### Teachtaireachtaí a d'fhéadfá a fheiceáil {#messages-you-may-see}

Tugann an painéal rabhadh nuair nach difríocht fhíor an pictiúr:

| Teachtaireacht | Brí |
|---|---|
| *N + / M −* (nó *N + / M − / K gan úsáid*) | Cé mhéad luach atá ar gach taobh (agus ar aon cheann). |
| Níl sraith sa fhuinneog ar an taobh **+** | Ní tharraingítear ach an taobh **−**. Bog fuinneog an amlíne nó athraigh an scoilt. |
| Níl sraith sa fhuinneog ar an taobh **−** | Ní tharraingítear ach an taobh **+**. |
| Níl luach ar aon taobh | Ní tharraingíonn an difríocht rud ar bith. Cuir luach amháin ar a laghad ar **+** nó **−**. |
| *colún* ní féidir a scoilt sa chaoi seo | Ní oireann an colún roghnaithe don scoilt. Roghnaigh an colún arís. |
| Níor fhóir colún na scoilte i gcuimhne an GPU do N as M de smutáin | Ní tharraingítear na sraitheanna sin. Ardaigh buiséad an GPU faoi Feidhmíocht → Buiséid acmhainní, nó lódáil níos lú sraitheanna. |

### De réir grúpa {#by-group}

Ní dhéanann an painéal ach tagairt don [Liosta foirne](teams-list.md), áit a bhfuil cnaipe **+** agus cnaipe **−** ag gach grúpa. Ag gach lódáil cuirtear leath na ngrúpaí (suimithe suas) ar +, agus an chuid eile ar −; déanann **Roinn go cothrom** sa Liosta foirne an rud céanna arís. Ní chuireann grúpa ar aon taobh, nó a bhfuil sé folaithe lena ticbhosca, le rud ar bith.

### De réir luachanna catagóire {#by-category-values}

| Cuid | Brí |
|---|---|
| `a + / b − / c gan úsáid` | Cé mhéad luach atá ar gach taobh agus ar aon cheann. |
| **Glan** | Cuireann gach luach ar aon taobh. |
| Liosta luachanna | Gach luach le cnaipe **+** agus cnaipe **−** (cliceáil an ceann gníomhach arís chun é a bhaint den taobh sin). Liostaítear luach folamh mar *(ar iarraidh)*. |
| Nóta teorann | Ní liostaítear ach na chéad 200 luach: *Ag taispeáint na gcéad 200 as N luach. Is fearr colún chomh leathan seo a chúngú le scagaire ar dtús, nó a scoilt de réir raoin mura bhfuil a luachanna ordaithe.* |

Nuair a roghnaítear an colún cuirtear a chéad luach ar + agus a dara luach ar −. Nuair nach bhfuil luach ar aon taobh, titeann an scoilt ar ais go grúpaí in ionad fráma folamh a thaispeáint. Oibríonn *Comhad foinse* ar an mbealach céanna, luach amháin in aghaidh an chomhaid - is mar sin a chomparáidtear dhá easpórtáil, dhá rith tástála nó dhá leagan.

### De réir raoin {#by-range}

| Cuid | Brí |
|---|---|
| Leid | An t-íosmhéid agus an t-uasmhéid den cholún. |
| **Raon dearfach (+)**, **ó** / **go** | Cuireann sraitheanna a bhfuil luach sa raon seo acu leis, ar an dá cheann. |
| **Raon diúltach (−)**, **ó** / **go** | Baineann sraitheanna sa raon seo uaidh. |
| **Scoilt ag an lárphointe** | Socraíonn + go [íos, lár] agus − go [lár, uas] - is é sin freisin a tharlaíonn nuair a roghnaítear an colún. |

Is le + a chuntar luach atá i dhá raon. Ní gá go gclúdaíonn na raonta an colún; fágtar luachanna nach bhfuil i gceachtar ar lár. Is scoilt raoin ar cholún ama-chosúil é *An chéad dhá nóiméad i gcoinne an dá nóiméad dheiridh*.

## Dathanna {#colours}

Taispeánann an chuid **Dathanna teasa** dhá eagarthóir grádáin sa mhód seo: **Dearfach (foirne suimitheacha)** agus **Diúltach (foirne dealaitheacha)**, gach ceann lena chnaipe athshocraithe féin (*Athshocraigh go trédhearcach → dearg → buí → bán*, *Athshocraigh go trédhearcach → glas → gorm → corcra*). Glacann an comhdhéanamh luach iomlán an teasa líonta trí an [pointe sáithithe agus an fhreagairt](colour-and-exposure.md), agus roghnaíonn sé an grádán diúltach san áit a bhfuil an líonta faoi nialas. Féach [Dath agus nochtadh](colour-and-exposure.md#the-ramp-editor).

Bain úsáid as freagairt dhlúis *Líneach* nuair a bhíonn méid na difríochta tábhachtach: is í an t-aon fhreagairt ina gciallaíonn dath comhionann líon comhionann.

## Conas a oibríonn sé {#how-it-works}

Faigheann gach sraith comhartha +1, -1 nó 0 sa vertex shader ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); diúltaíonn 0 don tsraith sula dtarraingítear aon fragment.

- De réir grúpa, tagann an comhartha ó tábla grúpa de 4,096 iontráil atá innéacsaithe ag aitheantas grúpa na sraithe (rianann aitheantas an ghrúpa sa cheathrú cainéal de phictiúrelement suímh na sraithe).
- De réir catagóire, tagann an comhartha ó dhara tábla 4,096 iontráil, líonta do gach luach catagóire, agus léitear luach na sraithe ó uigeacht scagaire an cholúin; diúltaítear do luach atá thar deireadh an tábla ar an dá chúltaca.
- De réir raoin, déantar luach na sraithe a chur i gcomparáid leis na raonta beirt.

Cuireann athrú ar an scoilt an carnadh arís ag tosú.

**Fanann grúpaí folaithe folaithe le gach scoilt.** Faoi scoilt de réir colúin ní iompraíonn an tábla grúpa comharthaí níos mó; coinníonn sé 1 do ghrúpa taispeánta agus 0 do cheann folaithe ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), agus sroicheann an dá tábla an shader le chéile - dhá shraith de uigeacht comhartha amháin ar WebGL2, dhá leath de bhufair stórála amháin ar WebGPU. Tarraingítear sraith ach amháin nuair a thaispeántar a grúpa *agus* nuair a bhíonn a luach colúin ar thaobh. Mar sin, ní chuireann grúpa a bhfuil a ticbhosca bainte sa [Liosta foirne](teams-list.md), nó a fágadh ar lár le fócas taobh cluaisín Cluiche, rud ar bith leis, is cuma cén bealach a roinntear an difríocht.
