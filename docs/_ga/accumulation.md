---
title: "Carnadh"
parent: "Inmheánacha rindreála"
nav_order: 2
lang: "ga"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---


# Carnadh

Nuair nach féidir leis an amharcóir gach ponc a tharraingt i bhfráma amháin, tarraingíonn sé cuid acu, ansin cuid eile, agus cuireann sé na pictiúir le chéile fad is a fhanann tú socair. Éiríonn an pictiúr níos soiléire, cosúil le grianghraf ag forbairt. Tosaíonn sé arís nuair a bhogann tú an ceamara. Taispeánann líne an **Clúdaigh** den fhorleagan staitisticí cé chomh fada is atá sé.

![An forleagan staitisticí: taispeánann Clúdach céatadán agus an pictiúr ag forbairt, agus *beacht* nuair a bhíonn sé críochnaithe](../assets/img/en/performance-stats-overlay.webp)

## Do fhorbróirí {#for-developers}

Nuair nach féidir le fráma amháin gach sraith a tharraingt, tarraingíonn sé samplach agus meáchanann sé suas é; is meastachán neamhchlaonta ach torannach é an pictiúr ansin. **Carnadh** cumaisc fráma i ndiaidh a chéile ionas go dtagann an meastachán go dtí an freagra beacht fad nach n-athraíonn aon rud. Roghnaítear ceann de chúig mhód do gach fráma ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); coinnítear an ceann is déanaí a úsáideadh ar `engine.live.accumMode`.

| Mód | Nuair | Cad a tharlaíonn don charnóir |
|---|---|---|
| **athshocraigh** | bhog an ceamara, athraigh rud éigin a athraíonn an réimse, tá athchóiriú forásach as, tosaíonn fuinneog fhásúil (an chéad fhráma de sheinm, tar éis cuardaigh), nó bhog líne teasa seinnte | Ionadaítear é leis an meastachán den fhráma seo. |
| **leathnaigh** | fuinneog **Carnach** nach bhfuil ag fás ach ón bhfráma deireanach | Tarraingíonn an fráma seo na sraitheanna a tháinig chun solais díreach, ag meáchan iomlán, agus cuireann sé leo. Ní dhíghrádaíonn aon rud. |
| **ema** | bhog fuinneog shleamhnach (**Fuinneog**, **Saolré**) | `acc = acc × (1 - 0.34) + fráma × 0.34` - meán sleamhnach easpónantúil thart ar thrí fhráma. |
| **meán** | níor athraigh aon rud agus níl an meastachán iomlán | `acc = acc × (1 - 1/n) + fráma × 1/n` ar an *n*ú fráma: meán reatha. |
| **scipeáil** (neamhghníomhach) | tá sé comhtháite agus níor athraigh aon rud | Ní tharraingítear aon rud; ní dhéanann an fráma ach comhdhéanamh arís. |

### Cén fáth gach ceann {#why-each}

- **Meán reatha, ní suim.** Is é an rud céanna algebrach an maolán a scálú faoi 1 - 1/n agus 1/n den fhráma nua a chur leis agus suim a dhéanamh agus a roinnt ar *n* ag an deireadh, ach coinníonn an maolán i gcónaí luach réimse amháin. Sroicheann suim *n* uair an réimse, agus ar sprioc 16-giotach sáithíonn sé ag 65,504; le roinnteoir a dhéanann fás seasta, dhéanfadh radharc socair ídiú de réir mar a fhanann sé níos faide - cé go bhfuil an ceamara gluaiseach, a athshocraíonn gach fráma, ceart go foirfe. Dearbhaíonn an tsraith tástála go bhfuil an rud céanna ag 16 fhráma cumaisc is atá ag fráma amháin, 1.00×.
- **Leathnaigh le haghaidh seinnte carnaí.** Tá na sraitheanna a carnadh cheana féin infheicthe fós, agus mar sin níl ag teastáil ó fhráma ach an cuid de shoicind a tháinig díreach - a fhóireann i bhfráma amháin, agus mar sin téann sé isteach go beacht. Dá n-athmheasfaí ina ionad sin, dhéanfadh gach fráma fo-thacar randamach difriúil a shoilsiú agus é a dhíghrádú, agus léifí mar phléascanna ag lasadh agus ag imeacht, agus leanfadh fráma stadta ag líonadh. Dearbhaíonn an tsraith go n-ardaíonn an t-iomlán go monatónach le linn seinnte, agus go bhfanann sé laistigh de 0.02% thar 2.5 s stadta.
- **Meán bogtha le haghaidh fuinneoga sleamhnacha.** Athraíonn siad sin i ndáiríre gach fráma. Leanann meáchan measctha seasta an fhuinneog bhogtha (ghlacfadh meán thar gach fráma ó thosaigh an seinm moill ar an gceannródaí) agus is i bhfad níos ciúine é ná tosú arís.
- **Athshocraigh le haghaidh línte seinnte.** Bogann ceanna líne teasa gach fráma; dhéanfadh meán bogtha smear de gach ceann ina stríoc, mar sin tarraingítear gach fráma ina iomláine agus is é dul i léig na heireaball pictiúr féin.
- **Téann fráimí páirteacha trí sprioc scrathaigh.** Scaiptear fráma a chumasctar ag cuid den mheáchan iomlán isteach i sprioc ar leith ó nialas agus ansin measctar isteach sa charnóir é, in ionad é a scaipeadh go díreach ag meáchan 1/n. Go díreach, chuirfí gach spriorad leis ag 1/n den mhéid den iomlán a bhaineann sé leis, rud a bhaineann maolán leath-snámhphointe as - is measa san áit is dlúithe ([Carnadh leath-snámhphointe](half-float-accumulation.md)).

### Cóineasú {#convergence}

Tá a fhios ag an bplean do gach fráma cé mhéad sraith iarrthóireachta atá ann agus cé mhéad a chuirtear isteach, mar sin is é líon na bhfrámaí a theastaíonn chun gach sraith a chlúdach ⌈iarrthóirí / curtha isteach⌉. Nuair a bhíonn an oiread sin fráma cumaisc, tá an radharc **cóineasaithe**: athraíonn líne an *Chlúdaigh* den fhorleagan staitisticí ó chéatadán go *beacht*, agus bíonn frámaí breise scíthe. Le **Tarraing gach ró i ngach fráma** ar siúl (an réamhshocrú) clúdaíonn fráma amháin de ghnáth gach rud, mar sin tá an cóineasú láithreach, agus níl ag teastáil ón meicníocht forásach ach nuair a bhíonn níos mó sraitheanna sa fhuinneog ná mar is féidir le plean tarraingte amháin a iompar (thart ar 67 milliún).

### Cad a athshocraíonn é {#what-restarts-it}

Tagann na socruithe i dtrí ghrúpa, de réir cad a chiallaíonn an maolán carnta fós tar éis iad a athrú:

| Grúpa | Athraíonn | Toradh |
|---|---|---|
| **Geoiméadracht** - na sraitheanna a chuireann leis agus cé mhéad | mód radharc; bealaí teasa líne; ga spriorad, déine lár agus imeall, titim, grádán mín, an cuar, teanntáin picteilíní, leacadh; baint faid gar, i gcéin agus pléine; folú agus folaigh taobh thiar den tír-raon; an stiall; méid an chanbháis; taifeach an teasa; infheictheacht grúpa agus comharthaí; an scaoileadh difríochta; Gach rud / Seinn; an stair; scagairí colún agus roghnú Aonán; gnóthachan leath-snámhphointe | Athshocraigh. |
| **Fuinneog** - an raon ama | an ceannródaí ag bogadh; an saolré mar chúltaca agus a dul i léig | Leathnaigh (carnach) nó meán bogtha (sleamhnach). |
| **Comhdhéanamh** - an dathú amháin | sáithiú, freagairt an dlúis, teas íosta, na ramhair dath; leibhéal á ghearradh; grid agus aiseanna; socruithe athsheinm bhosca agus seisiún; doimhneacht réimse | Athtarraingt gan an teas a chur isteach. |

Athshocraíonn gluaiseacht ceamara i gcónaí. Mar sin tá sé saor an sáithiú nó an ramhar a tharraingt; athshocraíonn an ga spriorad a tharraingt an cóineasú ag gach céim.
