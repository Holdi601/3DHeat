---
title: "Anailís cluiche (CS2)"
nav_order: 10
lang: "ga"
source: "match-analysis.md"
source_hash: "0b9ab06a759f"
translated: true
outdated: false
---

# Anailís cluiche (Counter-Strike 2)

Taispeánann cluaisín **Cluiche** athsheinm taifid mar figiúirí, agus le cluiche Counter-Strike 2 taispeánann sé an scórchlár freisin: cé a bhuaigh gach babhta, conas, agus cé a fuair na maruithe. Bain úsáid as chun cluiche a athbhreithniú babhta ar bhabhta, agus ansin léim go dtí an nóiméad céanna sa léarscáil teasa.

Athsheinneann cluaisín Cluiche aon taifead mar fhigiúirí: taifead War Thunder nó Tacview, nó demo CS2, a liostaítear faoi **Cluichí san athsheinm** ([Athsheinm cluiche](match-replay.md)). Cuireann comhad `.match.json` CS2 an scórchlár a dtuairiscítear ar an leathanach seo leis.

## Athbhreithnigh cluiche CS2 {#review-a-cs2-match}

1. Tiontaigh an demo ([thíos](#where-the-data-comes-from)) ina chomhad `.parquet` agus `.match.json`.
2. Sa chluaisín **Léarscáil teasa**, lódáil an comhad `.parquet` faoi **Foinse**.
3. Oscail an cluaisín **Cluiche** agus cliceáil **Lódáil comhaid chluiche…**, nó scaoil an comhad `.match.json` ar an radharc.
4. Cliceáil cluiche in **Achoimrí cluiche**, ansin cill de stiall na mbabhtaí chun an babhta sin a oscailt.
5. Cliceáil **Taispeáin an babhta** chun an babhta sin a fheiceáil sa léarscáil teasa, nó **Athsheinn an babhta** chun é a fhéachaint mar figiúirí.

![Cluaisín Cluiche: stiall babhtaí le babhta oscailte, sruth maruithe agus Scórchlár](../assets/img/en/match-analysis-round.webp)

Tá focail mar KAST, ADR, eco, ceannach force agus trade sa [ghluais](glossary.md#counter-strike-words).

## Cá dtagann na sonraí ó {#where-the-data-comes-from}

Tiontaíonn tiontaire demo [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2) demonstrations ina dhá chomhad in aghaidh an chluiche, i bhfillteán in aghaidh an léarscáile:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Comhad | Lódáiltear sa | Coinníonn |
|---|---|---|
| `<match>.parquet` | cluaisín **Léarscáil teasa** (painéal Foinse, mar aon Parquet - comhad amháin, roinnt, nó an fillteán iomlán) | suíomh gach imreora ocht n-uaire sa soicind, agus gach imeacht san áit a tharla sé: maruithe, básanna, gortú, lámhach, caitheamh, deatach, splanc, HE, molotov, decoy, dall, plandáil, dí-phlandáil, pléasc; le `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, treo féachana, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | cluaisín **Cluiche** | foirne, scór, gach babhta (buaiteoir, conas, eacnamaíocht, an phlandáil, gach mharú in ord, clutches, marthanóirí), líne scórchláir gach imreora |

Tá treoracha léite (eochair `heat3d`) i bhfoot an chomhaid Parquet, mar sin oscailtear é gan aon rud a shocrú: an imreoir mar an duine, an taobh mar an grúpa, gach babhta (`roundId`, "<match> #NN") mar sheisiún, an treo féachana air, agus an domhan ar an dtaobh ceart (is domhan láimh dheis é domhan CS2 le Z suas; léite mar mhapáil réamhshocraithe Z-suas thiocfadh sé amach scáthaithe). Féach [Mapáil colún](column-mapping.md) agus [Comhaid a lódáil](loading-files.md). Easpórtálann `python -m heat3d_cs2 map <map>` geoiméadracht an léarscáile sa fhráma céanna, lódáilte i **Leibhéal**.

Is iad na coinbhinsiúin taobh thiar de na huimhreacha ag an tiontaire (luaite ina README agus iompraithe ina achoimre gach cluiche): déantar bás a **thrádáil** nuair a mharaítear a mharaitheoir ag duine de chomhimreoirí an íospartaigh laistigh de **5 s**; is é **KAST** scair na mbabhtaí a bhfuil marú, cúnamh (cúnamh splainc san áireamh), marthanas nó bás trádáilte ann; is é **damáiste** an sláinte a caillte i ndáiríre, naimhde amháin; is **clutch** a bheith ar an duine deireanach beo ar thaobh le naimhde ina seasamh, buaite nuair a bhuann an taobh; **ceannach** de réir taobh ón meán luach trealaimh ag deireadh am reoite - an chéad babhta de gach leath rialta ina babhta piostail (aon cheann san fhad-am) - faoi $1,500 eco, faoi $4,000 ceannach force, aon rud níos mó ceannach lán.

## An cluaisín {#the-tab}

Tá lasc an mhódha teasa agus roghnóir an tseisiúin ag barr barra taobh an chluaisín Cluiche, ansin na hearnálacha cluiche thíos, agus ansin painéil **Scagairí**, **Leibhéal** agus **Ceamara** na léarscáile teasa - is í an léarscáil teasa de cibé Parquet atá lódáilte sa chluaisín Léarscáil teasa an radharc.

### Achoimrí cluiche {#match-summaries}

| Rialtán | Déanann |
|---|---|
| **Lódáil comhaid chluiche…** | roghnaíonn comhaid `.json` (roinnt ag an am céanna): na hachoimrí `.match.json` |
| scaoil ar an radharc | comhaid JSON a scaoiltear ar an radharc agus an cluaisín Cluiche oscailte, lódálann siad mar an gcéanna (déantar neamhaird de chomhaid eile) |
| **Glan** | baintear gach cluiche |
| **Gach cluiche** (le dhá cheann nó níos mó) | "N cluiche, M babhta": na staitisticí thar gach ceann acu |
| sraith cluiche | "TeamA 13 vs TeamB 9", léarscáil · N babhta: oscailtear an cluiche sin |

Glactar le comhad nuair is JSON é le `"format": "heat3d-cs2-match"` agus eagair `rounds`, `players` agus `teams`. Liostaítear earráidí faoi na cnaipí: "<comhad>: ní JSON é", "<comhad>: ní achoimre cluiche CS2 é (heat3d-cs2-match)", "<comhad>: babhta, imreoirí nó foirne ar iarraidh". Cuireann cluiche a lódáiltear arís (an t-ainm `match` céanna) an ceann roimhe in ionad. Socraítear cluichí de réir léarscáile, agus ansin de réir ainm. Nuair nach lódáiltear ach cluiche amháin, osclaítear é; seachas sin fanann an roghnú (gach cluiche de réir réamhshocraithe).

Gan aon rud lódáilte míníonn an earnáil: tiontaigh le `python -m heat3d_cs2 demos`, lódáil na comhaid `.match.json` anseo agus na comhaid `.parquet` sa chluaisín Léarscáil teasa.

### Cluiche (cluiche amháin oscailte) {#match-one-match-open}

**An ceanntásc:** an dá fhoireann lena scór, an léarscáil, na leatha - "leatha 7-5, 6-6": babhtaí 1-12 agus 13-24 (imirt phríomha agus iomaíochta MR12; fad leatha an achoimre féin nuair a dheimhníonn sí é, mar sin 1-15 agus 16-30 do MR15) - ansin, nuair a chuaigh an cluiche chuig fad-am, a scór ar a shon féin: "fad-am 4-2", na babhtaí tar éis an dá leath. Ní áiríonn babhta cothrom do cheachtar foireann. Agus "N babhta gearrtha sa demo" nuair a liostaíonn an achoimre babhtaí neamhiomlána.

**Stiall na mbabhtaí:** cill in aghaidh babhta, daite de réir an taobh a bhuaigh, lena uimhir agus marc maidir leis an gcaoi a chríochnaigh sé. Is cill liath neodrach é babhta cothrom (gan buaiteoir) marcáilte `=`, riamh i ndath taobh; deir a tooltip "Babhta 30: cothrom - níor bhuaigh aon taobh é".

| Marc | Críochnaithe ag |
|---|---|
| B | pléasc an bhuama |
| D | dí-phlandáil an bhuama |
| K | díothaíodh |
| T | ritheadh an t-am amach |
| S | géilleadh |
| = | cothrom |
| ? | eile |

Marcann roinnteoir tús an dara leath (babhta 13, nó an babhta tar éis fad leatha an achoimre) agus gach leath fad-ama trí-babhta (babhtaí 25, 28, 31, …). Tar os cionn cille: "Babhta 7: TeamA (T) - pléasc an buama, plandáladh A" ("…, plandáladh, suíomh anaithnid" nuair nach bhfuil suíomh ag an achoimre) agus ceannach agus luach trealaimh an dá thaobh. Cliceáil chun an babhta a oscailt; cliceáil arís chun é a dhúnadh ("Cliceáil babhta chun a mharuithe, a eacnamaíocht agus a athsheinm a fheiceáil.").

**An babhta:**

- "Babhta 7: <foireann> bhuaigh - <conas>" ("Babhta 30: cothrom - níor bhuaigh aon taobh é" le haghaidh cothroime) agus cé chomh fada is a mhair an babhta (deireadh an reoite go socraithe, m:ss);
- an eacnamaíocht: foireann gach taobh, ceannach (piostal, eco, ceannach force, ceannach lán) agus luach trealaimh ("$4,350");
- an phlandáil: suíomh, imreoir agus am isteach sa bhabhta (ó leagan ar bith den achoimre); "Plandáladh ag <imreoir> ag 1:05, suíomh anaithnid" nuair nach bhfuiltear ar an suíomh;
- **an sruth maruithe**, in ord: am isteach sa bhabhta, ionsaitheoir (i dathanna an taobh; "world" gan ionsaitheoir), arm, agus bratacha - **HS** ceann-lámhach, **WB** tríd an mballa, **SM** tríd an deatach; **tús** an chéad mharú sa bhabhta, **trade** (díoladh comhimreoir laistigh de 5 s), **traded** (maraíodh an marú laistigh de 5 s), **team** marú foirne (is ea féinmharú nach ea). Dorchaítear maruithe tar éis an babhta a bheith cinnte;
- na clutches: "<imreoir> (T) ina aonar in aghaidh 3: bhuaigh an clutch" / "chaill é";
- cé a bhí beo ag deireadh, de réir taobh ("duine ar bith");
- **Taispeáin an babhta**: gach rud sa bhabhta seo, sa léarscáil teasa;
- **Athsheinn an babhta**: athsheinneann an babhta mar bhosca, ó thosach.

Cnaipí **Taispeáin sa léarscáil teasa** (féach [thíos](#show-in-the-heatmap)) don chluiche seo, nó don bhabhta oscailte.

### Scórchlár {#scoreboard}

Tábla in aghaidh foirne, líne in aghaidh imreora:

| Colún | Is |
|---|---|
| K, D | maruithe, básanna |
| A | cúnaimh, cúnaimh splainc san áireamh |
| ± | maruithe lúide básanna (glas os cionn 0, dearg faoi bhun) |
| ADR | damáiste in aghaidh an bhabhta, an sláinte a caillte i ndáiríre |
| KAST | % de na babhtaí a bhfuil marú, cúnamh, marthanas nó bás trádáilte ann |
| HS | % de mharuithe ceann-lámhach |
| Open | céadchomhraic buaite-caillte |
| Cl | clutches buaite/imeartha |

Tar os cionn imreora: maruithe trade, uaireanta traded, cúnaimh splainc, naimhde splancáilte, damáiste fóntais, agus babhtaí il-mharuithe ("2×3k"). **Cliceáil ar imreoir** chun a maruithe agus a básanna sa léarscáil theas a fheiceáil (an cluiche seo).

### Thar chluichí (Gach cluiche) {#across-matches-all-matches}

Thar gach cluiche lódáilte:

- "N cluiche · M babhta · <léarscáileanna>", agus "N babhta cothrom, nár bhuaigh taobh ar bith iad" nuair a bhí cothromaíochtaí ann;
- **Babhtaí buaite** de réir taobh: iomlán, ar bhabhtaí **piostail** (babhtaí piostail na hachoimrí), agus ar cheannaigh **eco**, **force** agus **lán** (gach ceann mar chéatadán leis na babhtaí imeartha; tar os cionn le haghaidh "buaite de imeartha"). Imríonn an dá thaobh babhta cothrom agus ní bhuann ceachtar taobh é;
- **Buama**: plandálacha de réir suímh, agus cé chomh minic a lean taobh T ag buachan na mbabhtaí sin ("12 plandáil ar A (bhuaigh T 67%)"), plandálacha a bhfuil suíomh nach eol don achoimre dóibh féin ("2 phlandáil ar shuíomh anaithnid (bhuaigh T 50%)"), nó "níor plandáladh riamh"; conas a chríochnaigh babhtaí, is coitianta ar dtús;
- "Bhuaigh an taobh a ghlac an céad mharú ag tús N% de na babhtaí sin." (ní tús é féinmharú; ní thiontaíonn babhta cothrom aon tús);
- **Céadchomhraic, cá háit**: an deich áit a bhfuil na céadmharuithe is mó iontu (de réir cá raibh an íospartach; ainmneacha áiteanna an chluiche inléite, "TopofMid" → "Top of Mid"), comhraic agus an scair a bhuaigh taobh T;
- **Imreoirí**: an cúigear déag is fearr de réir maruithe lúide básanna, comhcheangailte thar a gcluichí go léir (meaitseáilte de réir Steam ID): cluichí, K-D, ADR agus KAST meáite de réir babhtaí imeartha, HS% meáite de réir maruithe, céadchomhraic. **Cliceáil ar imreoir** chun a maruithe agus a básanna thar gach cluiche sa léarscáil teasa a fheiceáil.

Suíonn cnaipí Taispeáin sa léarscáil teasa do gach cluiche lódáilte faoi.

## Cad a chinn na babhtaí {#what-decided-the-rounds}

Comhaireann an cluaisín; míníonn [Léargais](insights.md#who-won-what-decided-the-rounds). Nuair atá tábla léarscáil teasa cluiche lódáilte (tá an colún `won` ann), roinneann **Léargais** babhtaí gach taoibh de réir an méid a tharla iontu - an céadchomhrac, an ceannach, an chéad bhás trádáilte, an cur, áiseanna, an chéad teagmháil luath, gach áit coinnithe agus gach áit bainte amach sna chéad 25 s - agus deir sé cé acu a rinne an difríocht, le difríocht na rátaí buaite, a heatramh 95% agus q, agus *beagán babhtaí* nuair atá níos lú ná ocht mbabhta i lámh. Ainmníonn sé na pointí casaidh (na maruithe agus na cuir a d'athraigh dóchúlacht an bhua is mó) agus na himreoirí agus na háiteanna a chuir an méid is mó leis nó a chaill an méid is mó, agus tosaíonn an **Achoimre** agus an **Tráchtaire** leo. Sampla cumtha:

> Bhuaigh T 79% de na 19 mbabhta inar choinnigh sé Mid, i gcomparáid le 24% de 21 gan é (55 pointe, 95% ó 26 go 74) - q 0.004.
>
> Pointí casaidh: babhta 17 ag 48 s, d'athraigh marú ag CT ag suíomh B a sheans ó 31% go 58%, agus bhuaigh sé an babhta.

Tá níos lú ná 30 babhta i gcluiche amháin, mar sin tagann a dhóchúlachtaí bua ó mhúnla réamhshocraithe seasta de na fir beo, an cur agus an clog; deir an téacs é sin. Thar go leor cluichí cuireann an [anailís mhais](mass-analysis.md#who-won) na ceisteanna céanna.

## Taispeáin sa léarscáil teasa {#show-in-the-heatmap}

Socraíonn gach nasc **scagairí** féin na léarscáile teasa, mar sin fanann an rud a thaispeántar infheicthe agus in-athraithe sa phainéal Scagairí, agus glanann **Taispeáin iad uile** iad. Oibríonn siad ar an tábla léarscáile teasa lódáilte sa chluaisín Léarscáil teasa; ní lódálann an cluaisín Cluiche é riamh é féin.

| Cnaipe | Imeachtaí a thaispeántar |
|---|---|
| **Suímh** | `position` - cá raibh na himreoirí, ocht n-uaire sa soicind |
| **Maruithe** | `kill` - cá raibh an marú-ionsaitheoir ina sheasamh |
| **Básanna** | `death` - cá dtit an t-íospartach |
| **Céadmharuithe** | `kill` agus `death` le `opening` = 1 - an chéad mharú de gach babhta, nuair a bhí an bheirt ina seasamh (ní thairgtear ach nuair a bhíonn colún `opening` sa tábla) |
| **Deatach** | `smoke` - cá ndeachaigh deatach i dtalamh |
| **Splancanna** | `flash` - cá bpléasc splancanna |
| **Molotov** | `molotov` - cá ndeachaigh molotov agus incendiaries trí thine |
| **HE** | `he` - cá ndeachaigh grionátaí HE i bpléasc |
| **Plandálacha** | `plant` - cá ndearnadh an buama a phlandáil |
| **Lámhaigh** | `shot` - cá lámhadh urchair |

Scóipeáilte de réir cá bhfuil na cnaipí: gach cluiche lódáilte, an cluiche seo, nó an babhta seo ("Taispeáin sa léarscáil teasa - babhta 7").

Deirtear faoi na cnaipí cad nach féidir a chur i bhfeidhm, seachas a scagadh go ciúin go neamhní: "níl colún cluiche coinnithe - níor cuireadh an cluiche i bhfeidhm", "cluiche: X nach bhfuil sna sonraí lódáilte", an rud céanna do bhabhta agus d'imeachtaí, "imreoir X nach bhfuil sna sonraí lódáilte", "taobh X nach bhfuil sna sonraí lódáilte", "níl sonraí léarscáile teasa lódáilte: lódáil comhaid .parquet na gcluichí sa chluaisín Léarscáil teasa". Gan sonraí lódáilte deir na naisc freisin "Lódáil comhaid .parquet na gcluichí sa chluaisín Léarscáil teasa chun iad a fheiceáil ar an léarscáil."

**Athsheinn an babhta** aistríonn sé freisin an léarscáil teasa go **Athsheinm bhosca**, an amlíne go mód *seinn* lena fuinneog socraithe go *saol*, téann sé go tosach sheisiún an bhabhta agus seinneann. Nuair nach seisiún de na sonraí lódáilte é an babhta: "ní seisiún de na sonraí lódáilte é an babhta seo: níl aon rud le hathsheinm".

## Do fhorbróirí {#for-developers}

Cód: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Leaganacha achoimre {#summary-versions}

Léann an cluaisín achoimrí de leagan 1 agus de leagan 2 (`"version"` sa chomhad) taobh le taobh, agus déileálann sé leo mar an gcéanna:

| | Leagan 2 | Leagan 1 |
|---|---|---|
| am plandála | soicindí isteach sa bhabhta, mar na maruithe | soicindí cluiche; baineann an cluaisín tús an bhabhta |
| suíomh plandála | `A` nó `B`; folamh nuair nach ndeir an demo é | `A`, `B`, nó uimhir eintitis - léite mar shuíomh anaithnid |
| fad leatha | `halfLength`, ón áit a malartaíonn na taobhanna den chéad uair; 12 nuair is null é | 12 (MR12) |
| babhtaí piostail | `pistolRounds` (babhta 1 agus an chéad babhta tar éis an leath) | na babhtaí a bhfuil a gceannach `pistol` |
| babhta cothrom | `winner` agus `winnerTeam` folamh | - |
| féinmharú | `suicide` ar an marú, riamh marú foirne | insithe ag ionsaitheoir agus íospartach a bheith an imreoir céanna |

Ní thaispeántar `noscope` agus `attackerBlind` marú (leagan 2) sa chluaisín Cluiche, ná ní thaispeánann sé suíomh ar bith ón tábla léarscáile teasa, mar sin ní athraíonn líne ghréine-ghránáide le `place` folamh ansin rud ar bith anseo.

Conas a éiríonn fócas ina scagairí (`focusFilters`):

- **cluiche** → scagaire catagóire ar cholún `match`;
- **babhta** → scagaire raoin `round` = N ar cholún uimhriúil `round` (scagaire catagóire ar cholún catagóirithe), agus roghnaítear seisiún an bhabhta (`<match> #NN`) sa roghnóir seisiúin;
- **imeachtaí** → scagaire catagóire ar cholún `event`;
- **imreoir** → scagaire duine ar an imreoir sin;
- **taobh** → scagaire grúpa.
