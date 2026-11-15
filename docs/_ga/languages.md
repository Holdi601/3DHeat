---
title: "Teangacha"
nav_order: 17
lang: "ga"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---


# Teangacha

Is féidir leis an amharcóir do theanga a labhairt: gach cnaipe, leid agus teachtaireacht, agus gach abairt den anailís rásaíochta agus cluiche, taispeántar iad sa teanga a roghnaíonn tú. Tá 40 teanga aige, agus tosaíonn sé i dteanga do bhrabhsálaí nuair a bhíonn sí aige.

Tá teangacha stáit na hEorpa go léir ann (na 24 de chuid an AE, agus Ioruais, Íoslainnis, Úcráinis, Rúisis, Bealarúisis, Seirbis, Boisnis, Macadóinis, Albáinis, Tuircis, Lucsamburgais agus Catalóinis), chomh maith le Seapáinis, Coréis, agus Sínis shimplithe agus thraidisiúnta. An liosta iomlán: [Liosta teangacha](ref-languages.md).

Is é Béarla an foinse a aistrítear gach teanga eile uaithi, agus is í an teanga a úsáidtear nuair a bhíonn teachtaireacht ar iarraidh.

## Athraigh an teanga {#change-the-language}

1. Oscail an liosta anuas in aice leis an ainm ag barr na cléibhe. Is é an chéad iontráil **Uathoibríoch - <teanga>** (theanga an bhrabhsálaí, mar a braithtear anois); ansin gach teanga lena hainm féin, ionas gur féidir leat do cheannsa a aimsiú fiú nuair nach féidir leat an ceann atá le feiceáil a léamh.
2. Roghnaigh ceann. Athraíonn sé láithreach agus coinnítear sa bhrabhsálaí seo é. Roghnaigh *Uathoibríoch* chun an rogha a dhearmad.

I bhfuinneog phríobháideach, nó nuair a bhíonn stóráil bactha, maireann an rogha go dtí go ndúntar an leathanach.

Seo mar a oibríonn an athrú:

- athrófar gach lipéad, leid agus teachtaireacht sa teanga nua;
- **déantar an anailís rásaíochta a oibriú amach arís** inti (ní aistrítear a habairtí as dhiaidh sin; tógtar iad ó na tomhaiseanna), athainmnítear na lapaí demo, agus athtarraingítear na cairteacha;
- leanann uimhreacha, liostaí agus iolraí an teanga nua.

## Cén teanga a thosaíonn sé inti {#which-language-it-starts-in}

1. An teanga **a roghnaíodh** sa bhrabhsálaí seo, más ann di (coinnithe i `localStorage` faoin ainm `heat3d.language`).
2. Ansin **teanga an bhrabhsálaí**: an chéad cheann de `navigator.languages` a labhraíonn an t-amharcóir. Meaitseáiltear clib de réir a chuid teanga (`de-AT` → `de`), leis na ailias seo: `nb` agus `nn` → Ioruais (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` agus aon chlib leis an script `Hant` → Sínis thraidisiúnta; `zh-Hans`, `zh-CN`, `zh-SG` agus `zh` eile → Sínis shimplithe; `cnr` (Montainéagrais) → Seirbis.
3. Ansin **Béarla**.

Socraítear `<html lang>` an leathanaigh go dtí an teanga a labhraítear.

## Uimhreacha, liostaí agus iolraí {#numbers-lists-and-plurals}

Scríobhtar uimhreacha, liostaí agus iolraí sa téacs den amharcóir ar an mbealach atá ag an teanga ("3.5" nó "3,5", "a, b agus c"). Briseann lipéid níos faide ná an Béarla ar an líne, agus fleasctar iad nuair a cheadaíonn an teanga é, in ionad rith as an gcléibh. Gearrtar ainmneacha sraitheanna cairte atá rófhada le hellipsis agus taispeántar go hiomlán iad nuair a bhogann tú an luch thairis.

Is féidir pointe nó camóg a úsáid i dtáscairí a scríobhann tú i mbosca.

## Do aistritheoirí agus forbróirí {#for-translators-and-developers}

Cód: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Conas a scríobhtar uimhreacha, liostaí agus iolraí {#how-numbers-lists-and-plurals-are-written}

- **Uimhreacha** le deachúlacha (`num`) úsáideann siad marc deachúlach na teanga agus **gan grúpáil digití** - fanann fad de 3108 m ina uimhir amháin i ngach teanga.
- **Uimhreacha slánuimhreacha atá ina gcomhaireamh nó ina méideanna** (`int`) úsáideann siad grúpáil digití na teanga.
- **Liostaí** (`list`) nascthe ar an mbealach atá ag an teanga: "a, b agus c", "a, b nó c", nó ceann i ndiaidh a chéile le deighilteoir na teanga féin (teachtaireacht `common.listSeparator`: ", " sa Bhéarla, "、" sa tSeapáinis agus sa dá Shínis).
- **Iolraí** leanann siad rialacha na teanga féin tríd `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- Is é clib na teanga an locale a iarrtar ar `Intl`, ach amháin nuair a thabharfadh an clib amháin rialacha tír eile: is é `pt-PT` an Phortaingéilis (ar mhaithe le hiolraí na Brasaíle a chomhaireamh 0 mar one), `nb` don Ioruais, `zh-CN` don tSínis shimplithe, `zh-TW` don tSínis thraidisiúnta.

### Na catalóga {#the-catalogs}

`src/i18n/locales/<teanga>/<cuid>.json`, comhad amháin do gach cuid den amharcóir, na cuid chéanna i ngach teanga.

Tá comhad amháin do gach cuid den amharcóir (30 faoi láthair, mar shampla `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), agus tá an tacar céanna ag gach teanga. Liostaíonn an fillteán iad go léir.

Is réad JSON simplí é gach comhad: an eochair scríofa amach go hiomlán (`"race.ui.laps.load"`), an teachtaireacht mar luach. Tá Béarla pacáistithe leis an amharcóir; faightear aon teanga eile nuair a roghnaítear í.

**Cuardach:** teachtaireacht na teanga reatha, nó ansin an Béarla, nó ansin an eochair féin (i bhforbairt scríobhann an consól "i18n: no message …"). Má theipeann ar theachtaireacht a fhormáidiú, úsáidtear an Béarla, ionas nach mbriseann aistriúchán lochtach an t-amharcóir riamh.

#### An chomhréir teachtaireachta {#the-message-syntax}

An chuid de chomhréir teachtaireachta ICU a úsáideann an t-amharcóir:

| Foirm | Sampla | Brí |
|---|---|---|
| `{ainm}` | `{file} has no rows` | luach a chuirtear isteach mar atá |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | an brainse don uimhir de réir rialacha iolrach na teanga, nó `=0`, `=1` … go beacht; scríobhtar `#` mar an uimhir ar an mbealach atá ag an teanga |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | an brainse don fhocal |

Tá brainsí neadaithe, agus ní mór brainse `other` a bheith ag gach `plural` agus `select`. Murab ionann agus ICU iomlán, **is cosán amháin é an cosán** - tá ainmneacha carr agus forainmneacha Béarla lán díobh - agus mar sin ní gá rud ar bith a fhriotal. Ní féidir `{` nó `}` liteartha a scríobh.

Teachtaireachtaí a bhfuil luachanna acu ar chóir don aistriúchán iad a choinneáil: is iad na hainmneacha sna lúibíní na luachanna a líonann an cód isteach; is iad focail `select` na rudaí a roghnaíonn an cód dóibh (`crash`, `onto-straight`, `yes`/`none`) agus ní mór iad a choinneáil mar atá sa Bhéarla; ach is féidir leis na catagóirí iolracha a bheith difriúil (úsáideann teanga a cuid féin: Polainnis `one`, `few`, `many`, `other`; Seapáinis `other` amháin).

### Conas a rinneadh na haistriúcháin, agus na tástálacha {#how-the-translations-were-made-and-the-tests}

Rinneadh na haistriúcháin le samhail AI ón mBéarla, le gluais de théarmaí rásaíochta, agus léadh téacsanna na rásaíochta arís le luachanna líonta isteach. Fáiltítear roimh cheartúcháin ó chainteoirí dúchais (thíos).

Seiceálann `src/i18n/i18n.test.ts`:

- go bhfuil gach teachtaireacht a iarrann an cód sa Bhéarla - gach glao `t('…')`, agus gach eochair a choinnítear i dtábla agus a dtugtar `t()` ina dhiaidh sin (eochracha a thosaíonn le hainm cuid, mar `app.` nó `heat.`);
- go bhfuil na teachtaireachtaí a thógann an cód ó chodanna ann: gach `label`, `short`, `count` agus `here` de mhíchleachtas, gach tréith comparáide carr, gach lipéad cainéil;
- go **bhfuil** gach teachtaireacht ar a chumas parsáil, i ngach teanga;
- go **gcoinníonn** gach aistriúchán luachanna agus roghanna na teachtaireachta Béarla (gan luach a chur leis nó a chailleadh; coinníonn gach `select` a fhocail);
- go bhfuil **gach** teachtaireacht Bhéarla ag gach teanga, agus go bhfuil tacar na dteangacha aistrithe díreach an liosta thuas;
- go ndeirtear teachtaireacht sa teanga roghnaithe agus go dtitear ar ais chuig an mBéarla.

### Ceartúchán aistriúcháin {#correcting-a-translation}

Fáiltítear roimh cheartúcháin ó chainteoir dúchais - is líne JSON amháin gach ceann.

1. Faigh an teachtaireacht: cuardaigh na catalóga Béarla (`src/i18n/locales/en/`) don téacs a fheiceann tú sa Bhéarla (athraigh an roghnóir go Béarla chun é a léamh), agus scríobh síos an eochair.
2. Oscail an chuid chéanna i do theanga, e.g. `src/i18n/locales/de/race-ui.json`, agus athraigh luach na heochrach sin. Coinnigh gach `{ainm}` ann, coinnigh focail an `select`, scríobh na brainsí iolracha a theastaíonn ó do theanga:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Rith `npm test` (nó `npx vitest run src/i18n` amháin): inneoidh na tástálacha duit má chaill luach nó rogha nó má theip ar pharsáil teachtaireachta.
4. Agus an freastalaí forbartha ag rith, feictear an athrú tar éis an teanga a athrú (nó an leathanach a athlódáil).

**Teachtaireacht a chur leis** (sa chód): cuir leis an gcuid Bhéarla ar dtús, ansin le gach teanga eile (teipeann ar na tástálacha go dtí go mbíonn sí ag gach ceann acu).

**Teanga a chur leis**: cuir leis `LANGUAGES` i `languages.ts` (a clib BCP 47 agus a hainm féin, agus ailias nó locale `Intl` más gá), agus fillteán `src/i18n/locales/<clib>/` leis na cuideanna go léir.
