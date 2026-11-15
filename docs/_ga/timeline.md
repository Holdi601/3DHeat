---
title: "Amlíne agus athsheinm"
nav_order: 5
lang: "ga"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Amlíne agus athsheinm

Tá an barra faoin bpictiúr cosúil le seinnteoir físe: is féidir na sonraí a sheinm mar scannán, iad a stopadh, léim tríothu agus an luas a athrú.

![Barra na hamlíne: 1 Gach rud/Seinn, 2 cnaipí iompair, 3 clog, 4 Luas, 5 Stair, agus Fuinneog agus Réise de 30 s](../assets/img/en/timeline-bar.webp)

Is é an barra faoin radharc an amlíne ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Cinneann sé cé na sraitheanna infheicthe ag am ar bith. Teastaíonn colún ama uaidh; gan é díchumasaítear an barra ar fad, fanann an radharc sa mhód **Gach rud**, agus deir an bharra taoibh *Níl colún ama sna sonraí seo - tá an amlíne díchumasaithe agus taispeántar gach pointe sonraí ag an am céanna.*

## Gach rud agus Seinn {#all-and-play}

Dhá mhód barr-leibhéil, toisc go bhfreagraíonn siad ceisteanna difriúla.

- **Gach rud** (an réamhshocrú ar gach lódáil) neamhaird ar an gceannaire go hiomlán agus taispeánann sé gach sraith a théann tríd na scagairí. Is é an radharc "cá tharlaíonn seo" é, agus ní hionann é agus scrúdú go dtí an deireadh. Díchumasaítear an scrúdaire agus léann an clog `gach rud · <span> sonraí`.
- **Seinn** ritheann na sonraí mar amscaleán. Tagann an scrúdaire, an t-iompar agus na socruithe stair chun cinn.

Má roghnaítear **Gach rud** stopann sé athsheinm freisin.

## Na rialuithe {#the-controls}

| Rialú | Réamhshocrú | Ciall |
|---|---|---|
| Scrúdaire | an tús | An ceannaire. Tarraing chun cuardach; 20,000 céim ar fud an raoin. |
| **Gach rud** / **Seinn** | Gach rud | Féach thuas. |
| ▶ / ❚❚ | stoptha | Seinn nó stop; `K` freisin. |
| ◀ **Seinn ar gcúl (J)** | | Seinneann na sonraí ar gcúl. Taispeántar é sa mhód **Forleagan figiúirí** amháin; oibríonn an eochair `J` ansin freisin (féach [Méarchlár](#keyboard)). |
| ⏮ | | Ar ais go tús an raoin. |
| Clog | | `caite / iomlán` mar `mm:ss.s` (nó `h:mm:ss`), agus, nuair is stampa ama iomlán é an colún ama, am an lae de chuid an cheannaire mar `HH:MM:SSZ` (UTC). |
| **Luas** | 1× | Soicindí sonraí in aghaidh na soicind fíor. Tá 17 chéim sa roghchlár ó 0.01× go 1800× (0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), plus **Saincheaptha…**: clóscríobh aon luas ó 0.001× go 3600× (mar shampla 0.3 nó 12) agus brúigh Enter; coinníonn Esc an luas reatha. Cuimhnítear ar an luas deiridh don chuairt eile (féach [Socruithe stóráilte](ref-settings-storage.md)). |
| **Stair** | Carnach | Cad a chuntar mar infheicthe ag an gceannaire: *Carnach*, *Fuinneog* nó *Saolré* (thíos). |
| **Réise** (Fuinneog; sa mhód Línte freisin Saolré) | 30 s | Fad na fuinneoige a chríochnaíonn ag an gceannaire; 0.01 s ar a laghad. I [Teas líne](line-heat.md#playback) is é fad an eireabaill é. |
| **Saolré chúltaca** (Saolré amháin, ní sa mhód Línte) | 10 s | Cé chomh fada is a fhanann pointe sonraí nach bhfuil sampla eile dá imreoir aige infheicthe. |
| **Céimniú** (Saolré amháin, ní sa mhód Línte) | 0.4 | Cuid de shaolré gach pointe sonraí a chaitear ag céimniú amach, 0-1. |
| **Lúb** | air | Ag an deireadh, tosaíonn sé arís; as stopann sé ag an deireadh. |
| Taobh deas | | Ainm na sonraí. |

Is é an **raon** raon ama na sonraí - nó, sa [fhorleagan figiúr](box-replay.md) nuair a roghnaítear seisiún, raon an tseisiúin sin.

## Stair {#history}

I mód Seinn:

- **Carnach** - gach rud ó thús an raoin go dtí an ceannaire. Tógann teas suas de réir mar a sheinntear.
- **Fuinneog** - raon seasta stair a chríochnaíonn ag an gceannaire (*Réise*).
- **Saolré** - maireann gach pointe sonraí go dtí **an chéad sampla eile den imreoir céanna** (sa seisiún céanna), ionas nach bhfuil ach suíomh amháin in aghaidh an imreora reatha ag gach nóiméad. Ní bhíonn pointe sonraí nach dtagann an t-imreoir arís air - bás, dícheangal, deireadh an logá - ag an gcéad sampla eile, agus maireann sé ar feadh an *tSaolré chúltaca* in ionad imeacht láithreach nó maireachtáil go deo. **Céimníonn** pointí sonraí amach thar an gcuid dheiridh den saolré *Céimniú* in ionad imeacht as radharc go tobann: le sampla amháin beo in aghaidh an imreora, pointe sonraí a imíonn ó fhráma amháin go ceann eile, cuireann sé an páirc iomlán ar bhrú ag ráta an tsampla. Tugann *Céimniú* 0 ar ais an gearradh crua.

Teastaíonn colún imreora chomh maith le colún ama ó Shaolré; gan é titeann an stair ar ais go Carnach ag an lódáil. I [Teas líne](line-heat.md#playback) socraíonn an stair cé chomh fada is a fhanann eireaball bealaigh infheicthe; sa [fhorleagan figiúr](box-replay.md) is é an *Saolré chúltaca* cé chomh fada is a coinnítear imreoir gan sampla eile.

## Iompar an athsheinm {#playback-behaviour}

Ón lúb fráma ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- Bogann an ceannaire ar aghaidh de réir *am fráma × luas*. Teorannaítear am an fhráma ag 0.1 s, ionas nach dtiomáineann athrú cluaisíní an ceannaire trasna an radharc.
- Brúigh seinn ag deireadh iomlán an raoin, tosaíonn sé ón tús, mar a dhéanann seinnteoir meán. Ag gach lódáil cuirtear an ceannaire ag an tús, ionas go seinneann an chéad bhrú ar seinn.
- Ag deireadh an raoin léimeann an ceannaire ar ais go dtí an tús (Lúb ar siúl) nó stopann sé ansin agus críochnaíonn an athsheinm (Lúb as).
- Léann an scrúdaire an ceannaire go díreach ón innil gach fráma; nuashonraítear stát an iarratais ag cuardaigh, tosanna, stadanna agus lúba.
- Nuair a roghnaítear seisiún sa roghnóir Seisiún, cuardaíonn sé go tús an tseisiúin sin.

## Cén fáth a bhfuil an athsheinm réidh, agus saor {#why-playback-is-smooth-and-cheap}

Stóráiltear sraitheanna sórtáilte de réir ama, mar sin is é fuinneog ama dhá chuardach dhénártha ar cholún an ama: bogann an ceannaire a dhá shlánuimhir agus ní bhaineann sé le sraith ar bith. Leanann costas an athsheinm líon na sraitheanna sa fhuinneog, ní méid an tacair sonraí.

Conas a choinnítear an teas seasmhach de réir mar a bhogann an fhuinneog ag brath ar an stair ([Carnadh](accumulation.md)):

- **Carnach** ní fhásann sé ach riamh, mar sin cuireann gach fráma na sraitheanna a tháinig infheicthe ó shin leis, ag meáchan iomlán. Tógann an páirc monatónach agus ní athraíonn stop rud ar bith, mar níl rud ar bith fágtha le teacht. (Dá ndéanfaí athmheas ina ionad sin, dhéanfadh gach fráma fo-thacar randamach difriúil a shoilsiú agus ansin a dhí-shoilsiú, rud a léitear mar bhriseadh a bhlaiseann agus a imíonn.)
- **Fuinneog** agus **Saolré** athraíonn siad gach fráma go fíor, agus athmheastar iad, measctha mar mheán gluaiseach easpónantúil (meáchan 0.34 ar an bhfráma nua), rud atá neamhchlaonta sa staid chobhsaí agus i bhfad níos ciúine ná tosú arís.
- I mód Saolré is iad sin na sraitheanna a d'fhéadfadh a bheith infheicthe ó *ceannaire - max(an bhearna is faide sna sonraí, Saolré chúltaca)* suas go dtí an ceannaire; ansin scoireann an shader gach sraith a bhfuil a saolré féin críochnaithe aici agus cuireann sé an céimniú i bhfeidhm.

Athrú idir Gach rud agus Seinn, nó athrú ar an stair, athshocraíonn an carnadh.

## Méarchlár {#keyboard}

| Eochair | Éifeacht |
|---|---|
| `K` | Seinn / stop |
| `J` | Seinn ar gcúl; brúigh arís é chun stop a chur leis (Forleagan figiúirí amháin) |
| `L` | Seinn ar aghaidh; brúigh arís é chun stop a chur leis (Forleagan figiúirí amháin) |

Cuireann `J` agus `L` an amlíne ar **Seinn** freisin. Déantar neamhaird ar na heochracha nuair a bhíonn bosca téacs nó roghchlár faoi fhócas. Sa chluaisín Anailís rása tiománann `K` athsheinm an chluaisín sin féin ina ionad.
