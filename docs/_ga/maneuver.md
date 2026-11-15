---
title: "Lúbthacha"
parent: "Léargais"
nav_order: 4
lang: "ga"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Ainlithe: conas a bhogann grúpaí

**Léargais → Ainlithe** leanann conas a bhogann aonaid gach taobh *mar ghrúpaí* agus ainmníonn sé na hainlithe a dhéanann siad - ionsaí ar thaobh, pionsa, briseadh amach, luíochán, cúlú, cosaint ar mhisíl, trasnú an T - gach ceann lena bhfuil de chinnteacht aige, na huimhreacha taobh thiar de, an d'íoc sé, agus a chosúlachtaí sa teagasc agus sa stair. **Anailís mhais → Ainlithe** comhaireamh iad thar na mílte cluiche: cé chomh minic a dhéantar gach ceann in aghaidh an léarscátha, an mhódha agus an taobh, agus cé chomh minic a íocann sé.

Déantar gach rud a ríomh i do bhrabhsálaí, in oibrí féin (`src/insights/maneuver`); cluiche de chúpla céad aonad a thógann 10-500 ms, agus cogadh aeir dhá uair an chloig le mílte réad thart ar shoicind.

## Ag úsáid é {#using-it}

- Oscail **Léargais**, cluaisín **Ainlithe**. Comhaireamh sé nuair a osclaítear den chéad uair; **Aimsigh arís** tar éis scagairí a athrú.
- **Cinnte / Is dócha / Féidir** socraíonn an mhuinín atá liostaithe (Is dócha de réir réamhshocraithe).
- Tá lána ag an **amlíne** do gach taobh agus barra do gach ainlithe; tá an **liosta** faoi, an rud céanna de réir ama. Nuair a chliceáiltear, athraíonn sé go dtí an athsheinm ag a thosach, cuireann an ceamara ann é agus tarraingíonn 3D é: bealach gach grúpa mar shaighead (is iad lúbanna an dá ghéag de phionsa), imlínte na ngrúpaí ag an nóiméad tábhachtach (imlíne an namhaid ina dath a thaoibh), aghaidh an namhaid mar líne bhán. Cuireann **Tarraing gach ceann i 3D** ainlithe eile an chluiche leis, go halainn. Téann na línte chuig cárta grafaicí uair amháin, nuair a athraíonn an rogha, ní gach fráma. Le 480 ainlithe tarraingthe le linn athsheinm, is ionann amanna an fhráma ar fhíor-GPU (WebGL2 agus WebGPU, p99 18.0-18.5 ms, uasmhéid 19.5-20.8 ms) agus gan iad.
- Taispeánann ainlithe oscailte a thoradh (básanna agus caillteanais na n-aonad a rinne é, le linn é a reáchtáil agus díreach ina dhiaidh, i gcomparáid le malartú a thaoibh thar an gcluiche), a fhianaise, agus iontrálacha na bunachar eolais dó - an teagasc agus na cosúlachtaí stairiúla (Cannae do phionsa, Sedan 1940 do bhriseadh amach, Tsushima do thrasnú an T, Operation Bolo do bhréagionsaí...).
- An tábla bheag ag an deireadh: de réir cineáil agus taobh, déanta agus íoctha.

![Pionsa ar an gcluiche sampla sintéiseach: saigheada an dá ghéag, comhlacht an namhaid agus a aghaidh](../assets/img/en/maneuvers.webp)

## Conas a aimsítear grúpaí {#how-groups-are-found}

Cuirtear gach aonad ar amlíne choiteann (céim de 1 s de chois, 2 s eile, níos faide do chomhaid an-mhóra), agus coinnítear socair thar bhás é ionas nach dtarraingíonn athbheochan líne trasna an léarscátha. Ag gach céim nasctar aonaid taobh agus cineáil amháin (aerárthaigh, feithicí, longa, coisí) nuair a bhíonn siad gar - 18 m de chois, 170 m do fheithiclí, 3 km do longa, 5 km d'aerárthaigh - agus nuair a bhogann siad mar a chéile (luasanna laistigh de leath luas an luaithe, nó iad beirt ina seasamh). Coinníonn bunch aitheantas an ghrúpa inar bhain formhór a chuid ball. Cuirtear aonad gan aicme de chois, i bhfeithicil nó san aer de réir a luais.

Léitear **cruth** grúpa i gcoinne a threo: colbhán nó líne de réir a leathadh feadh agus trasna, fleasc nuair a bhíonn an lár chun cinn, éicealón nuair a chéimníonn na baill siar go taobh amháin, bosca nuair a shealbhaíonn siad na cúinní.

Déantar gach rud a mheas ar scála an chluiche féin: is é **raon an chomhraic** `R` an 75ú céatadán den fhad idir marbhóir agus a íospartach (teoranta do bhrí an domhain), agus scálaíonn amanna ainlithe de réir cineáil an aonaid (ag coisí, trian de na talún).

## Cad a aimsíonn sé {#what-it-finds}

| Ainlithe | Aimsítear nuair |
|---|---|
| Foirmiú | coinníonn grúpa cruth amháin ar 60% dá chéimeanna gluaiseachta ar feadh 30 s |
| Ionsaí aghaidhe | druideann grúpa ó lasmuigh den raon go teagmháil, ¾ R nó níos mó, ó laistigh de 35° ó threo aghaidh an namhaid |
| Ionsaí ar thaobh | an rud céanna ó 50-130° (an cúl níos faide); cinnte ach amháin le *fórsa seasta* cairdiúil ag troid leis an namhaid ansin (básanna sa dá threo) |
| Pionsa | dhá ionsaí ar thaobh de thaobh amháin ar chomhlacht céanna namhaid, ó thaobhanna contrártha (100° nó níos mó óna chéile), laistigh de 90 s; cinnte nuair a throideann na géaga é |
| Timthriall | grúpa dlúth namhaid agus an oiread ar a laghad den taobh eile timpeall air laistigh de 1.5 R, ó dhá ghrúpa nó níos mó, gan bhearna thar 100°, ar feadh nóiméad, gearrtha óna thaobh féin; cinnte nuair a dhún an fáinne isteach de ½ R agus gur throid sé an póca |
| Treá | téann grúpa trí líne sheasta (naimhde ina seasamh 30 s ar a lámh chlé agus a lámh dheas, lár a dtaoibh taobh thiar díobh); cinnte nuair a shroicheann sé ½ R taobh thall, fanann 20 s, agus troideann ann; briseadh amach R eile níos faide |
| Faire chúlaithe ag leanúint a chéile | i ngrúpa beag, bogann cuid agus seasann an chuid eile, na róil ag malartú ceithre huaire nó níos mó, le tine chumhdaigh ón gcuid atá ina seasamh |
| Dlúthchruinniú / scaipeadh | ardaíonn scair taoibh gar dá phointe is dlúithe ó 35% go 60% (aonaid ag teacht 1.5 R nó níos mó, ansin teagmháil) - nó titeann sé nuair a scaipeann an taobh amach |
| Bréagionsaí | tarraingíonn eilimint bheag i dteagmháil dhá namhaid nó níos mó ó áit eile; ansin buaileann grúpa níos mó ceithre raon ar shiúl, áit a bhfuil níos lú ag an namhaid |
| Cúlú / ruaig | casann grúpa i dteagmháil uaidh agus oscailtear R ón áit ar throid sé; cinnte nuair a mharaigh namhaid ann duine dá chuid díreach roimhe agus gur fhág an grúpa 2 R ón marbhóir sin (ní riamh de chois: féach thíos); ruaigeann naimhde a bhogann sa treo céanna agus a choinníonn suas |
| Cosaint doimhne | aonaid ina seasamh i ndá chrios nó níos mó trasna ais an namhaid, R doimhne, an namhaid ag teacht ar aghaidh, tine ó na criosanna |
| Fána droim ar ais | trí bhás nó níos mó ag raon gearr ó aonaid ina seasamh de na híospartaigh a tháinig thar bharr |
| Luíochán | tagann grúpa gluaiseachta ar naimhde a sheas 45 s; scaoileann siad ar dtús agus cailleann na gluaiseoirí beirt nó leath an ghrúpa |
| Scáthán | aonad nó dhó ag bogadh chun tosaigh ar chorp trí cinn nó níos mó, ag casadh leis an namhaid ar dtús |
| Línte inmheánacha | grúpaí taoibh atá gar dá chéile idir grúpaí an taoibh eile, a aonaid ag bogadh eatarthu |
| Luas | taobh a fhreagraíonn teagmháil (casadh, athrú luais, an chéad urchar) 1.5 uair níos tapúla, Mann-Whitney p faoi 0.05 |
| Crank, notch, drag, pump | casann sprioc urchair seolta an lámhaigh go 35-70°, 75-105°, thar 140°, nó tarraingíonn sí agus casann ar ais |
| Pionsa aeir, balla, lead-trail, grinder | péire ag scoilt ar naimhde amháin; trí ina líne in aghaidh an namhaid; eilimint 5-20 km taobh thiar d'eile; beirt ag fithisiú pointe amháin scartha óna chéile |
| Faireachán aeir comhraic | fithisíonn timpeall stáisiúin ar feadh trí nóiméad |
| Troid fuinnimh / uillinneacha | i troid ghar - treonna 30° óna chéile, gach ceann ag coinneáil an ceann eile ina shrón ina dhiaidh sin, nó marú eatarthu - airde in úsáid agus ag dreapadh, nó cothrom agus ag casadh go crua agus ag moilliú; cinnte nuair a mharaigh ceann amháin an ceann eile |
| Pacáiste ionsaí, SEAD | grúpa aeir de róil mheasctha, cuid acu ag bualadh na talún; básanna cosanta aeir roimh fhormhór na mbásanna talún eile |
| Líne catha, trasnú an T | trí long i gcolbhán; colbhán cearnógach trasna ceann colbhán namhaid |

Deir gach ainlithe cé na **patrúin** eolais bhunaithe a léiríonn sé (`patterns-maneuver.ts`: foirmiú, ionsaí aghaidhe, imshaobh dúbailte, timthriall, treá, tine agus gluaiseacht, bréagionsaí, cúlú, ruaig, cosaint doimhne, scáthú, scaipeadh, cosaint ar mhisíl, troid uillinneacha, faireachán aeir comhraic, pacáiste ionsaí, líne catha, trasnú an T) agus na hiontrálacha ba chóir a léamh ar dtús; coinníonn iontrálacha níos sine na patrúin nua trí `knowledge/maneuver-tags.ts`. Féach [An lionsa eolais](knowledge.md).

**D'íoc sé** comparáid idir malartú na n-aonad le linn é a reáchtáil (agus nóiméad ina dhiaidh) agus malartú a dtaoibh thar an gcluiche; íocann cúlú nuair a chaill sé níos lú aonad tar éis dó casadh ná roimhe, cosaint ar mhisíl nuair a mhaireann an t-aerárthach nóiméad, timthriall nuair a chailleann an póca leath.

## Thar go leor cluichí {#over-many-matches}

Cuimsíonn achoimre gach cluiche (`src/mass/summarize.ts`, féach [Anailís mhais](mass-analysis.md)) rannóg bheag `maneuvers`: de réir cineáil agus taoibh, déanta (ag Is dócha nó níos airde), íoctha, nár íocadh, básanna agus caillteanais. **Anailís mhais → Ainlithe** cuireann ar a chéile iad thar na cluichí a choinníonn an scagaire - de réir léarscátha agus mhódha, nó thar gach ceann - leis an eatramh Wilson de ráta na n-íoctha; osclaíonn líne an chluiche ina ndearnadh é. Níl an rannóg ag achoimrí a scríobhadh sular cruthaíodh í: rith `node tools/3dheat-summarize.mjs <folder> --force` chun í a chur leo.

## Cé chomh cinnte is atá sé {#how-sure-it-is}

Cluichí sintéiseacha le hainlithe leagtha iontu (`synth.ts`, rite ag `maneuver.test.ts`): aimsítear na 28 cineál leagtha go léir ag Is dócha nó níos airde; as 50 ainlithe tuairiscithe, is é an cineál leagtha 31 acu agus tá an 19 eile ann i ndáiríre freisin (foirmiú an ghrúpa ghluaiseachta, an ionsaí aghaidhe ón gcolbhán a dhéanann treá); níl ceann mícheart. Ar 30 cluiche nialach - siúlóidí randamacha ar leithligh agus measctha, aonaid ina seasamh go randamach, aerárthaigh ar chosáin dhíreacha, slua ag bailiú thart - ní thuairiscítear rud ar bith ag Is dócha nó níos airde.

Ar shonraí fíor (dásachtaí cathanna talún, roinnt misean fada cogaidh aeir, dosaen cluichí lámhaigh): ionsaithe aghaidhe, taobhanna, treáanna agus timthrialla sna cathanna tancanna; foirmithe agus troideanna gar san aer; cosaintí misile, fithisiú CAP agus péirí lead-trail i misin chogaidh aeir; ionsaithe aghaidhe cur i gcrích, colbhánna agus roinnt luíochán agus péirí bounding sa lámhaigh. Is cruthanna dochtríne iad na tairseacha ag scála an chluiche; léigh aimsiú amháin lena fhianaise, agus ráta an tábla mhais lena eatraimh.

### In aghaidh samhlacha nialacha den chluiche chéanna {#against-null-models-of-the-same-matches}

Is féidir le brathadóir a bheith mealltach faoin talamh agus faoin slua: i gcaismirt bíonn gach grúpa ag naimhde ar gach taobh. Mar sin ritear gach cineál freisin ar **samhlacha nialacha** a tógadh ón gcluiche céanna (`nulls.ts`), nuair nach dtagann na taobhanna le chéile mar a rinne siad: amlíne taoibh amháin casta thart ar an treas go dhá thrian den chluiche (*sciobadh*), nó a rianta casta thart ar lár an léarscátha (*rothlú*); agus lipéid na bhfoirne curtha trí chéile (*foirne*, a choinníonn de réir dearaidh thart ar leath de na cathanna fíora). Ní chuntar troideanna ach mar bháis a chuplaítear lena mbásanna, an marbhóir laistigh de 2 R agus an íospartach ag an áit - briseann samhlacha nialacha iad sin. Aimsítear ag Is dócha nó níos airde, fíor in aghaidh na samhlacha nialacha, an méid seo (30 cath tancanna; 12 chluiche lámhaigh):

| Cineál | Cathanna tancanna: fíor / sciobadh / rothlú | Lámhaigh: fíor / sciobadh / rothlú |
|---|---|---|
| Timthriall | 0 / 0 / 0 (bhí 1.3 / 1.2 / 0.8) | 0 / 0 / 0 |
| Treá | 0.03 / 0.02 / 0.05 (bhí 1.6 / 1.8 / 1.4) | 0 / 0 / 0 |
| Ionsaí ar thaobh | 0.33 / 0.07 / 0.10 | 1.0 / 0.08 / 0.21 |
| Ionsaí aghaidhe | 0.87 / 0.47 / 0.12 | 14.4 / 6.5 / 4.3 |
| Cúlú | 0.03 / 0 / 0.02 | 0.08 / 0.08 / 0.5 (mar sin ní cinnte riamh de chois) |
| Luíochán | - | 0.17 / 0.04 / 0.04 |
| Troid fuinnimh | 1.2 / 0.1 / 0.85 | - |
| Troid uillinneacha | 0.6 / 0.07 / 0.3 | - |

Maireann troideanna gaoithe gar do lár an réimse cath casadh thart ar an lár sin, mar sin ní thaitníonn an colún rothlaithe leo chomh mór le cineálacha talún. Ní bhraitheann cineálacha laistigh de thaobh amháin - foirmiú, faireachán aeir comhraic, grinder, pacáiste ionsaí, SEAD, bounding, scáthán - ar an taobh eile agus ní thástáiltear ar an mbealach seo iad. Seiceálann `maneuver.test.ts` go mbaineann na samhlacha nialacha an ionsaí ar thaobh, an pionsa, an timthriall, an treá, an luíochán agus an cúlú leagtha as na cluichí sintéiseacha.

## Teorainneacha {#limits}

- Teastaíonn suímh thar am ó ghrúpaí; níl aon cheann ag comhad imeachtaí amháin.
- Ní léitear treo aghaidhe ón sonraí: is í aghaidh an namhaid an áit a dtroideann fórsa seasta leis ann, nó ansin an áit a bhogann sé, nó ansin an áit as ar tháinig an t-ionsaitheoir.
- Léitear an talamh ó airde féin na n-aonad (an fána droim ar ais); níl aon tástáil radhairc.
- Déantar comhaid an-mhóra a shampláil ag céimeanna níos faide; léitear ainlithe gaoithe gearra iontu fós ó chéimeanna 2-4 s.
