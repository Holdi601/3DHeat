---
title: "Mismunur"
parent: "Hitastillingar"
nav_order: 5
lang: "is"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: true
---


# Mismunur

Rautt þar sem lið A var meira, grænblátt þar sem lið B var meira, ekkert þar sem þau voru jöfn.

**Mismunur** (takki 2) er hiti með formerki. Línur úr einu þýði bæta við hita; línur úr öðru draga hann frá. Þar sem þær tvær skarast jafnt verður útkoman núll og alveg gegnsæ; þar sem önnur hliðin ræður ræður litur hennar - sjálfgefið hlýr (gegnsætt → rautt → gult → hvítt) fyrir **+**-hliðina og kaldur (gegnsætt → grænt → blátt → fjólublátt) fyrir **−**-hliðina.

![Mismunarhiti: rautt þar sem +-hliðin var meira, grænt og blátt þar sem --hliðin var meira](../assets/img/is/difference-split.webp)

## Hvernig á að nota hann {#how-to-use-it}

1. Ýttu á `2` (eða veldu **Mismunur** á mótastikunni).
2. Opnaðu **Mismunaskipting** í hliðarstikunni.
3. Veldu hvað á að **Skipta eftir**: yfirleitt *Hópar*.
4. Settu einn hóp (eða gildi) á **+** og annan á **−**.
5. Lestu litina: hlýtt þýðir +-hliðina, kalt þýðir −-hliðina. Spjaldið varar við ef önnur hliðin hefur engar línur (sjá [Skilaboð sem þú gætir séð](#messages-you-may-see)).

*Hvaða* tvö þýði um ræðir er öll spurningin, svo skiptingin getur verið hvaða geymdi dálkur sem er, ekki bara hópar. Línur sem lenda **hvorugu megin** eru **sleppt**, ekki taldar sem núll: það er það sem gerir að skipting yfir tvö af mörgum gildum ber saman nákvæmlega þessi tvö, og hún vinnur með [síunum](filters.md) - síaðu niður á eitt kort, og skiptu því síðan eftir útgáfu.

Stillingin þarf tvær hliðar: hópadálk með að minnsta kosti tveimur hópum, eða skiptingu yfir dálk sem geymdur er til síunar. Á gögnum með færri en tvo hópa byrjar hleðsla með dálkaskiptingu - dálkinn *Source file* í hleðslu úr mörgum skrám fyrst, annars fyrsta flokksdálkinn með tveimur gildum, annars fyrsta talnadálkinn með bili - svo *bera saman tvær hleðslur* virkar á gögnum án hópa. Aðeins gögn án hvors tveggja gera stillinguna óvirka; það gerir líka skipting dálks sem skilur eftir ekkert á annarri hliðinni.

## Spjaldið Mismunaskipting {#the-difference-split-panel}

Birtist í stillingunni Mismunur, undir hitaspjöldunum.

**Skipta eftir** býður upp á:

| Valkostur | Birtist sem | Skiptingarregla |
|---|---|---|
| Hópar | *Hópur (N)* (þegar til er hópdálkur) | Hver hópur á +, − eða hvorugu, stillt í [Listi yfir lið](teams-list.md) |
| Flokksdálkur | *dálkur (N gildi)* | Gildi á +, − eða hvorugu |
| Talnadálkur | *dálkur (tala)* | Gildisbil fyrir hvora hlið |
| Upprunaskráin | *Source file - compare two loads* (þegar margar skrár voru hlaðnar) | Skrár á +, − eða hvorugu |

Aðeins dálkar sem geymdir voru undir *Halda fyrir síun* við hleðslu eru í boði.

### Bera saman hlutföll, ekki fjölda {#compare-shares-not-counts}

**Bera saman hlutföll, ekki fjölda** (sjálfgefið slökkt) vegur hvora hlið með einum deilt með eigin línufjölda, svo hlið með fimmfalt fleiri línur vinnur ekki bara á tölunni. Liturinn sýnir þá hvar hvor hlið er hlutfallslega algengari en hin. Notaðu þetta þegar hliðarnar hafa mjög ólíkt magn gagna, til dæmis tvær lotur af ólíkri lengd.

### Skilaboð sem þú gætir séð {#messages-you-may-see}

Spjaldið varar við þegar myndin er ekki raunverulegur mismunur:

| Skilaboð | Merking |
|---|---|
| *N + / M −* (eða *N + / M − / K ónotuð*) | Hversu mörg gildi eru á hvorri hlið (og á hvorugri). |
| Engin lína í glugganum er á **+**-hliðinni | Aðeins **−**-hliðin er teiknuð. Færðu tímalínugluggann eða breyttu skiptingunni. |
| Engin lína í glugganum er á **−**-hliðinni | Aðeins **+**-hliðin er teiknuð. |
| Ekkert gildi er á annarri hvorri hliðinni | Mismunurinn teiknar ekkert. Settu að minnsta kosti eitt gildi á **+** eða **−**. |
| *dálkur* er ekki hægt að skipta svona | Valinn dálkur passar ekki við skiptinguna. Veldu dálkinn aftur. |
| Skiptidálkurinn komst ekki í skjákortsminnið fyrir N af M hlutum | Þær línur eru ekki teiknaðar. Hækkaðu fjárhagsáætlun skjákortsins undir Afköst → Auðlindaheimildir, eða hladdu færri línum. |

### Eftir hópi {#by-group}

Spjaldið vísar bara á [Listi yfir lið](teams-list.md), þar sem hver hópur er með **+**- og **−**-hnapp. Við hverja hleðslu er fyrri helmingur hópanna (námundaður upp) settur á +, hinir á −; **Skipta jafnt** í Listi yfir lið gerir það aftur. Hópur sem er á hvorugri hlið, eða er falinn með gátreitnum sínum, leggur ekkert til.

### Eftir gildum flokks {#by-category-values}

| Hluti | Merking |
|---|---|
| `a + / b − / c ónotuð` | Hversu mörg gildi eru á hvorri hlið og á hvorugri. |
| **Hreinsa** | Setur hvert gildi hvorugu megin. |
| Gildalisti | Hvert gildi með **+**- og **−**-hnapp (smelltu aftur á virka hnappinn til að taka hann af þeirri hlið). Tómt gildi er skráð sem *(vantar)*. |
| Athugasemd um hámark | Aðeins fyrstu 200 gildin eru skráð: *Sýni fyrstu 200 af N gildum. Svo breiðan dálk er betra að þrengja fyrst með síu, eða skipta eftir bili ef gildin eru raðað.* |

Þegar dálkurinn er valinn fer fyrsta gildi hans á + og annað á −. Þegar hvorug hlið hefur gildi fellur skiptingin aftur á hópa frekar en að sýna tóman ramma. *Source file* virkar eins, eitt gildi á hverja skrá - þannig eru tveir útflutningar, tvær prófunarkeyrslur eða tvær útgáfur bornar saman.

### Eftir bili {#by-range}

| Hluti | Merking |
|---|---|
| Vísbending | Lágmark og hámark dálksins. |
| **Jákvætt bil (+)**, **frá** / **til** | Línur með gildi í þessu bili, með báðum endapunktum innifalda, bæta við. |
| **Neikvætt bil (−)**, **frá** / **til** | Línur í þessu bili draga frá. |
| **Skipta við miðpunktinn** | Setur + á [lágmark, miðju] og − á [miðju, hámark] - það sem valið á dálkinum gerir líka. |

Gildi í báðum bilum telst sem +. Bilin þurfa ekki að þekja dálkinn; gildi á hvorugu eru sleppt. *Fyrstu tvær mínúturnar á móti síðustu tveimur* er bilskipting á tímalíkum dálki.

## Litir {#colours}

Hlutinn **Hitalitir** sýnir tvo skalaritla í þessari stillingu: **Jákvæður (samlögð lið)** og **Neikvæður (frádregin lið)**, hvor með sinn endurstillingarhnapp (*Endurstilla á gegnsætt → rautt → gult → hvítt*, *Endurstilla á gegnsætt → grænt → blátt → fjólublátt*). Samsetningin tekur algildi nettóhitans í gegnum [mettunarpunktinn og svörunina](colour-and-exposure.md), og velur neikvæða skalann þar sem nettóið er undir núlli. Sjá [Litir og lýsing](colour-and-exposure.md#the-ramp-editor).

Notaðu *Línulega* þéttleikasvörun þegar stærð mismunarins skiptir máli: það er eina svörunin þar sem sami litur þýðir sama fjölda.

## Hvernig þetta virkar {#how-it-works}

Sérhver lína fær formerkið +1, -1 eða 0 í hnútaskyggingunni ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); 0 hafnar línunni áður en nokkur brot er teiknað.

- Eftir hópi kemur formerkið úr 4.096 færslna hóptöflu sem er flettað upp eftir auðkenni hóps línunnar (auðkenni hópsins situr í fjórðu rás staðsetningarteksturs línunnar).
- Eftir flokki kemur formerkið úr annarri 4.096 færslna töflu, fylltri fyrir hvert flokksgildi, og gildi línunnar er lesið úr síutexta dálksins; gildi sem er handan enda töflunnar er hafnað á báðum bakendum.
- Eftir bili er gildi línunnar borið saman við bilin tvö.

Breyting á skiptingunni endurræsir söfnunina.

**Faldir hópar haldast faldir í hvaða skiptingu sem er.** Undir skiptingu eftir dálki ber hóptaflan ekki lengur formerki; hún geymir 1 fyrir sýndan hóp og 0 fyrir falinn ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), og báðar töflurnar ná í skyggingina saman - tvær raðir af einni formerkjatextúru á WebGL2, tveir helmingar af einum geymsluflöt á WebGPU. Lína er aðeins teiknuð þegar hópur hennar er sýndur *og* gildi dálksins er á annarri hliðinni. Hópur sem er tekinn af í [Listi yfir lið](teams-list.md), eða sleppt með hliðarvali flipans Leikur, leggur því ekkert til hvernig sem mismunurinn er skiptur.
