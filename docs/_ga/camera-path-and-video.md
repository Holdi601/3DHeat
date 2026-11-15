---
title: "Cosán ceamara agus físeán"
nav_order: 15
lang: "ga"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---


# Cosán ceamara agus físeán

Déan scannán de do chuid sonraí: cuireann tú an ceamara i roinnt spotaí agus eitlíonn an t-amharcóir idir iad agus sábhálann sé físeán. Tá gach fráma an-ghlan, gan gráin. Bogann an ceamara agus an ceannródaí le chéile, mar sin déanann an painéal céanna timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Déan eitilt thrasna {#make-a-flythrough}

1. Eitil go dtí an áit a dtosaíonn an scannán agus brúigh **Cuir eochairfhráma leis anseo** faoi **Cosán ceamara agus rindreáil**.
2. Eitil go dtí an chéad spota eile agus brúigh arís é. Déan an rud céanna do gach stad.
3. Cuir tic le **Réamhamharc feadh an chosáin** agus tarraing **Suíomh feadh an chosáin** chun an bogadh a sheiceáil.
4. Socraigh **Fad** (cé chomh fada is atá an físeán). Ní theastaíonn ach fad níos faide ó bhogadh atá ceart ach ró-thapa.
5. Brúigh **Rindreáil físeán**. Fan leis an líne dul chun cinn; íoslódáiltear an comhad nuair a chríochnaíonn sé.

![Painéal Cosán ceamara agus rindreáil le trí eochairfhráma, Idirshuí mín, 12 s, 30 fps agus 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Eochairfhrámaí {#keyframes}

| Rialú | Toradh |
|---|---|
| **Cuir eochairfhráma leis anseo** | Cuireann suíomh, giaw, pitse agus réimse radhairc an cheamara reatha leis mar eochairfhráma. |
| **Glan** | Baintear gach eochairfhráma. |
| Liosta eochairfhrámaí | Sraith amháin in aghaidh eochrach: a uimhir (cliceáil chun an ceamara a eitilt ann, ag socrú an réimse radhairc freisin), suíomh, `giaw° / pitse°`, agus **×** chun é a bhaint. |

Socraítear eochracha **go cothrom** feadh ais cosáin normalaithe ó 0 go 1 aon uair a chuirtear ceann leis nó a baintear ceann; sineann fad an aschuir ansin an bogadh ar fad, mar sin ní theastaíonn ach fad níos faide ó shíneadh atá ceart ach ró-thapa. Dírítear giaw idir eochracha ionas go gcasann an ceamara an bealach gearr.

Gan eochairfhrámaí, coinníonn rindreáil an ceamara reatha socair don chlip ar fad - timelapse foirfe.

## Socruithe an chosáin {#path-settings}

| Rialú | Réamhshocrú | Raon (jog) | Brí |
|---|---|---|---|
| **Idirshuí** (2+ eochair) | *Mín* | *Mín* / *Díreach* | *Mín*: cuar Hermite ciúbach trí na heochracha le tangents ó na heochracha comharsanacha, ionas go mbíonn an luas comhoiriúnach ar gach eochair agus nach bhfuil aon chroitheadh nuair a bhuaileann na bealaí. *Díreach*: línte díreacha idir eochracha, inmhianaithe, le cúinne infheicthe ag gach eochair. Idirshuítear réimse radhairc go líneach i gcónaí. |
| Líne taistil (2+ eochair) | | | `N aonad taistil - M sa soicind ag an bhfad seo`, nó nóta go bhfuil na heochracha go léir in aon áit amháin. |
| **Réamhamharc feadh an chosáin** (1+ eochair) | as | | Tiomáineann sé ceamara an fhuinneog as an gcosán, agus bogann sé an ceannródaí leis mar a dhéanann an rindreáil, ionas gur féidir an bogadh a mheas sula rindreáiltear. |
| **Suíomh feadh an chosáin** (le linn réamhamhairc) | 0% | 0-100% | Cá háit ar an gcosán le réamhamharc a dhéanamh. |
| **Fad** | 12 s | 1-120 s (3600) | Fad an fhíseáin. |
| **Ráta frámaí** | 30 fps | 6-60 (240) | |
| **Ráta giotán** | 16 Mbps | 1-60 Mbps, logartamach (400) | Bíonn grádáin teasa ag bindeadh go dona ag ráta giotán íseal: is beag mionsonraí ann le go gcuirfeadh códóir earráid ina cheilt. |
| **Uasteorainn fanachta an chóineasaithe** | 240 fráma | 2-600 (10,000) | An fad is faide a d'fhéadfadh fráma aschuir fanacht sula mbíonn sé beacht. Scríobhtar fráma a bhuaileann an teorainn fós, agus comhaireamh air. |
| Achoimre | | | `N fráma · fuinneog: carnadh/seasta/saol`, agus nuair a bhíonn an amlíne sa mhód Gach rud: *(athraíonn an rindreáil Gach rud go Seinn ionas go mbíonn brí leis an gceannródaí)*. |
| **Rindreáil físeán** / **Cealaigh** | | | Tosaíonn an rindreáil; agus í ar siúl taispeántar `fráma i / n · fanta w · X MB` agus cé mhéad fráma nach raibh beacht. Teastaíonn tacar sonraí. |

## Leideanna {#tips}

- Is é méid an aschuir méid an chanbháis i bpicteilíní feiste (cóimheas picteilíní an taispeántais, teoranta go 2). Athraigh méid fhuinneog an bhrabhsálaí chun é a athrú.
- Tógann stair charnach an teas suas thar an gclip; taispeánann stair fuinneoige nó saoil slice gluaiseach ama.
- Is comhordanáidí taispeána iad suíomhanna eochrach: le [ais dhomhain inbhéartaithe](camera.md#invert-world-axis), pointeálann eochracha a rinneadh sula ndearnadh an athrú in áiteanna eile tar éis an athraithe.

## Do fhorbróirí {#for-developers}

### Cad a dhéanann rindreáil {#what-a-render-does}

1. Tógann sé grianghraf tástála den fhráma chun méid cruinn an aschuir i bpicteilíní feiste a fháil.
2. Roghnaíonn sé códóir trí WebCodecs: **VP9** (`vp09.00.10.08`), murab ea **VP8**, ag an ráta giotán agus an ráta frámaí roghnaithe. Gan `VideoEncoder` stopann sé le *Níl VideoEncoder ag an mbrabhsálaí seo - tá WebCodecs riachtanach chun físeán a scríobh*; agus gan ceachtar códóra, *Níl códóir físe tacaithe ann (tástáladh VP9, VP8)*.
3. Glacann sé seilbh ar na socruithe a theastaíonn ó rindreáil: cuireann sé sioc ar an seinm, cuireann **buiséad oiriúnaitheach as**, **mionchoigeartú forásach air** agus an buiséad sprideanna go 64M in aghaidh an fhráma (ní hé an buiséad oiriúnaitheach a chosnaíonn ráta an fhráma anseo, cuspóir mícheart: léifeadh sé gach fráma mall nach ndéanann cóineas mar chúis le níos lú sraitheanna a sprioc, rud a éilíonn níos mó frámaí le cóineasú), agus athraíonn sé an amlíne ó **Gach rud** go **Seinn**. Fágtar socrú na staire (carnach, fuinneog, saol) mar atá: is é is brí le rindreáil ná an rud a bhfeicfeá, seinnte tríd agus scríofa síos.
4. Do gach fráma aschuir *f* de *n*, ag *u* = f / (n - 1):
   - cuireann sé an ceamara ag suíomh an chosáin ag *u* (más eochracha ann);
   - cuardaíonn sé an ceannródaí go dtí an chodán céanna *u* de raon na haimlíne (fad an seisin roghnaithe i athsheinm boscaí);
   - éilíonn sé meastachán úr, fiú nuair nár bhog an ceamara - dá n-oidhreodh sé carnadh an fhráma roimhe sin d'fhágfaí taibhse den fhuinneog roimhe;
   - fanann sé, fráma ar fhráma, go mbíonn an pictiúr beacht (gach sraith iarrthóireachta tarraingthe in aon fhráma amháin, nó an carnadh críochnaithe), suas go dtí an uasteorainn fanachta;
   - gabhann sé an fráma comhcheangailte agus ionchódaíonn sé é, le heochairfhráma gach 2 soicind d'aschur ionas gur féidir an comhad a chuardach.
5. Cuireann sé na frámaí isteach i gcomhad WebM ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) le stampaí ama roghnaithe ón ráta frámaí - ní bhaineann an t-am clog a ghlac gach fráma leis an gcás.
6. Athchóiríonn sé an buiséad, réimse an radhairc, mód na haimlíne, an ceannródaí agus an bhfuil sé ag seinm.
7. Íoslódálann sé an físeán mar `3dheat-<leithead>x<airde>-<frámaí>f.webm` agus tuairiscíonn sé `N fráma ag W×H, X MB - gach fráma beacht`, nó cé mhéad a bhuail an uasteorainn fanachta.

Stopann **Cealaigh** tar éis an fhráma reatha (*Cealaíodh an rindreáil.*) agus athchóiríonn sé na socruithe.
