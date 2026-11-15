---
title: "Minni og mörk"
parent: "Hvernig gögn eru sett inn"
nav_order: 6
lang: "is"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Minni, mörk og athugun á því hvort passar

Tölvan þín hefur takmarkað minni. 3DHeat leggur saman það sem skrárnar þínar þurfa og segir þér áður en þú ýtir á **Hlaða** hvort þær passi.

![Minnismatið segir passar ekki, með Hlaða hverja [N] línu forfyllt og hnappinn Hlaða sem segir Of stórt - minnkaðu eða taktu annan hvern](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Of stórt fyrir þessa tölvu? 3DHeat stingur upp á að hlaða hverri N-ustu línu í staðinn.*

Vafraflipi sem klárar minnið í miðri hleðslu hrynur og tapar mínútum af vinnu, og skjákort sem er beðið um meira en það á annað hvort týnir samhenginu sínu eða hægir á sér niður í skrið. Þess vegna segir Uppruna-spjaldið áður en hleðsla hefst hversu mikið minni hún þarf, ber það saman við mörk sem greind eru fyrir þessa vél, og neitar - með útleið - þegar hún passar ekki. Líkanið er í [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Minnismatið {#the-memory-estimate}

Sýnt fyrir ofan hnappinn **Hlaða** þegar línurnar hafa verið taldar.

| Lína | Merking |
|---|---|
| **Minnismat** - *passar* / *þröngt* / *passar ekki* | Niðurstaðan, græn, gulbrún eða rauð. |
| `N línur · B B/línu` | Línur sem verða hlaðnar (eftir skrefið) og varanleg bæti á hverja línu. |
| `RAM X í notkun, Y hámark við hleðslu` | Minni sem er haldið þegar hlaðið er, og hámarksgildið meðan á hleðslunni stendur. |
| `GPU Z · áætluð hleðsla T` | Skjáminni fyrir línurnar, og áætlaður tími á 1,2 milljón línum á sekúndu. |
| Heiti skjákorts | Heiti birtibúnaðarins, þegar rekillinn gefur það upp. |
| Skilaboð | Af hverju þetta passar ekki, eða er þröngt, og hvað á að gera. |
| **Hlaða hverja [N] línu** | Skrefið sem tekur línur (sjá hér að neðan). |
| `Mörk: X RAM, Y GPU. Stilltu undir Afköst → Auðlindamörk.` | Mörkin sem athugunin notaði. |

### Bæti á hverja línu {#bytes-per-row}

| Dálkur | Varanlegt (RAM) | Athugasemdir |
|---|---|---|
| Staða | 12 | Þrjár 32 bita fleytitölur, alltaf (flatur ás er samt fylki) |
| Tími | 4 | Þegar kortlagður |
| Líftími | 4 | Þegar tími og persóna eru kortlögð |
| Persóna | 4 | Þegar kortlögð |
| Hópur | 2 | Þegar kortlagður |
| Seta | 4 | Þegar kortlögð |
| `Upprunaskrá` | 4 | Þegar fleiri en ein skrá er hlaðin |
| Hver síudálkur | 4 | Fyrir hvern dálk sem er hakaður við *Geyma fyrir síun* |

**Hámarkið** bætir við það sem hleðslan þarf aðeins í stutta stund - 8 bæti af 64 bita tíma meðan sameinað er, 12 bæti af röðunarlyklum og vísum, 4 bæti af umröðunarvinnusvæði (öll þrjú þegar tími er kortlagður), og 4 bæti meðan hópdálkurinn er enn 32 bita - og margfaldar summuna með **2,0**. Þessi stuðull var mældur (raunveruleg hleðsla margra skráa náði 1,9 sinnum fleiri bætum en sundurliðuðu fylkin, vegna vinnusvæðis Parquet-afkóðarans, afritanna sem stytta hvern dálk í rétta lengd, og minnis sem hefur verið losað en ekki skilað enn) og var hækkaður, því að vanmat kostar hrunið flipa en ofmat kostar aðeins óþarft skref.

Á **skjákortinu** kostar hver lína 8 bæti (staða og hópur, 16 bitar hvort), auk 4 bæta (tími og líftími, 16 bitar hvort) þegar bæði tími og persóna eru kortlögð. Sjá [Viðvera skjákorts](gpu-memory.md). Síuáferð (4 bæti á línu fyrir hverja virka síu) og upphaf hluta línuhita (8 bæti á línu meðan Línuhamur er kveiktur) eru ekki hluti af þessu mati.

## Athugunin á því hvort passar {#the-fit-check}

Þrjú takmörk eru borin saman ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- hámarks RAM á móti **RAM-mörkum**,
- GPU-bæti á móti **GPU-mörkum**,
- fjöldi lína á móti **raðþakinu** upp á 400.000.000 línur, þegar tímadálkur er kortlagður.

Versta af hlutföllunum þremur ræður: allt að 70% *passar*, allt að 100% *þröngt* (það ætti að hlaðast, en búast við að það sé hægt), yfir því *passar ekki*. Þegar það passar ekki nefnir spjaldið takmörkin sem ráða og stingur upp á:

- að hlaða hverri *N*-ustu línu, með *N* = ⌈línur / línur sem passa⌉, forfyllt í skrefareitnum;
- að sleppa síudálkum, afkortleggja tímadálkinn (sem fjarlægir röðunina og þakið hennar, á kostnað tímalínunnar), eða að hækka mörkin.

Þegar mörkin sjálf eru ekki staðreynd um vélbúnaðinn - vafrinn takmarkaði RAM-töluna, sjálfgefna gildið var haldið niðri af því sem er laust núna, eða GPU-talan er ágiskun - segir skilaboðin það, svo að þú teygir þig ekki í skref sem þú þarft ekki.

### Grisjun {#decimation}

**Hlaða hverja [N] línu** heldur einni línu af *N*, talið fyrir hverja skrá. Hiti er meðaltal, svo að hver *N*-ta lína gefur sömu dreifingu með meiri hávaða - sama skiptin og birtibúnaðurinn gerir nú þegar á hverjum ramma. Reiturinn byrjar á 1 (*lína (allar)*); þegar valið passar ekki er hann forfylltur með stungna skrefinu nema þú hafir slegið inn í hann. Hleðsluhnappurinn segir þá *Hlaða N skrár (1 af hverjum K)*, og heiti gagnasafnsins skráir `every Kth row`.

### Raðþakið {#the-sort-ceiling}

Birtibúnaðurinn þarf línur í hækkandi tímaröð, svo kortlagður tímadálkur þýðir að raða hverri línu, með radix-röðun á 32 bita lyklum ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Yfir **400 milljón** línur er það hafnað í stað þess að reyna það í flipa. Þetta er athugað fyrir hleðsluna, svo að val yfir mörkin er hafnað með tillögu um skref í stað þess að vera lesið allt og klárast í síðasta skrefi. Nærri mörkunum (*þröngt*) varar spjaldið við því að röðunin sé löng umferð án framvindu sinnar. Án tímadálks er engin röðun og ekkert þak gildir.

## Auðlindamörk {#resource-budgets}

**Afköst → Auðlindamörk** (lína sem hægt er að fella saman neðst á spjaldinu Afköst, sem segir `Auðlindamörk - RAM, GPU, kjarnar`). Mörkin eru greind; greindi talan er sjálfgefna gildið; og sleðarnir fara ekki hærra en **þak** sem er greinda talan nema þar sem vitað er að greiningin er ekki mæling.

| Stilling | Svið | Merking |
|---|---|---|
| **Vinnsluminni fyrir raðagögn** | 256 MiB upp í RAM-þakið, logaritmískt | RAM-mörkin fyrir athugunina á því hvort passar. Merkt *(yfir greindu)* fyrir ofan greinda sjálfgefna gildið, *(hámark)* við þakið. |
| **Skjákort fyrir raðagögn** | 128 MiB upp í GPU-þakið, logaritmískt | GPU-mörkin fyrir athugunina á því hvort passar og fyrir upphleðslu lína. Merkt *(yfir greindu)* fyrir ofan greinda sjálfgefna gildið, *(hámark)* við þakið. |
| **Þáttunarþræðir** | 1 upp í fjölda rökrænna kjarna | Hversu margar skrár hleðsla þáttar í einu, hver í sínum vinnsluþræði. Sjálfgefið kjarnar - 2 (kjarnar - 1 á fjórum kjörnum eða færri). Sjá [Þáttunarþræðir](#parser-threads) (undir Fyrir forritara). |
| Línan Heimildir | | Hvaðan hver tala kom (`RAM: …. GPU: …. CPU: ….`). |
| **Greina aftur** | | Biður þróunarþjóninn um nýja minnisálestur og reiknar öll mörk upp á nýtt. |
| Heiti skjákorts | | Stutt heiti rekilsins; allt birtingarstrengurinn er í ábendingunni. |

### Hækkun á GPU-mörkum {#raising-the-gpu-budget}

GPU-mörk yfir greindu tölunni gilda eins og stillt: athugunin á því hvort passar og upphleðslan taka sömu tölu úr einu falli ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), sem takmarkar hana aðeins við GPU-þakið sem sleðinn stoppar við. Hleðsla sem athugunin samþykkir er því hlaðin upp að fullu. Umfram greindu töluna segir sleðinn *(yfir greindu)*: talan er þá þitt mat á kortinu, ekki mæling, og ef þú setur hana hærri en kortið hefur er hætta á að samhengið glatist eða að allt hægist niður í skrið.

## Risastór gagnasöfn: stjórntækin {#huge-datasets-the-levers}

Frá ódýrustu til róttækustu:

1. **Færri síudálkar.** Hver er 4 bæti á línu og ein afkóðunarumferð.
2. **Skref.** Hver *N*-ta lína.
3. **Enginn tímadálkur.** Engin röðun, ekkert raðþak, engir 4-8 bæti á línu af tíma og líftíma - og engin tímalína.
4. **Hækka mörkin**, þegar þú veist að minnið er til staðar.

Við birtingu eru risastór gagnasöfn meðhöndluð með sýnatöku og stigvaxandi uppsöfnun, frekar en með því að minnka gögnin; sjá [Sýnataka og mörk](sampling-and-budgets.md).

## Fyrir forritara {#for-developers}

### Þáttunarþræðir {#parser-threads}

Hleðsla nokkurra skráa þáttar allt að **Þáttunarþráðum** þeirra í einu, hver í þáttunarvinnsluþræði sem innlestrarvinnsluþráðurinn ræsir fyrir þá hleðslu ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Við 1, eða fyrir eina skrá, eru skrár þáttaðar hver á eftir annarri í innlestrarvinnsluþræðinum sjálfum.

Að keyra nokkrar í einu slakar ekki á athuguninni á því hvort passar:

- **Smiðurinn er talinn fyrst.** Sameinuðu dálkarnir eru úthlutaðir fyrir allt valið áður en fyrsta skráin er lesin, svo að skrárnar sem eru á ferð fá aðeins það sem RAM-mörkin skilja eftir hjá þeim (`parseHeadroom`): staða, 64 bita tími, sjónarhorn, persóna, 32 bita hópur, seta, síudálkar og `Upprunaskrá`, á hverja línu sem á að hlaða - sinnum 2,6 þegar línufjöldinn er CSV-áætlun, fyrir dálk sem vex í stærri dálk.
- **Hver skrá tekur frá kostnað sinn áður en hún byrjar** (`fileParseBytes`): línur hennar (úr fóti Parquet-skrárinnar; hlutdeild CSV í áætluninni eftir stærð) sinnum sömu dálkar, sinnum **8** - blokkin sjálf, afritið við hliðina meðan línur án staðsetningar eru felldar burt, og vinnusvæði afkóðarans, sem fyrir textadálka er miklu stærra en auðkenni þeirra. Skref lækkar þetta ekki, því að skrár eru lesnar í heild og grisjaðar á eftir. Talan 8 er svigrúm sem var sett með mælingu: með 3, eða 5, sprengdu þrjátíu þáttunarþræðir flipa yfir mörk sín á 86 milljónum lína með nöfnum persóna og seta; með 8 gerðu þeir það ekki.
- **Önnur skrá byrjar aðeins ef úthlutun hennar passar** í það sem eftir er. Skrá sem er búin en bíður eftir að fyrri skrá sé sameinuð heldur úthlutun sinni þar til hún er sameinuð.
- **Ein skrá keyrir alltaf.** Þegar ekkert er tekið frá byrjar næsta skrá hvað sem hún kostar - það er hleðslan ein í einu sem athugunin á því hvort passar leyfði, svo að þröngt mark fellur aftur á hana í stað þess að hafna.

Talan *hámark við hleðslu* er hámark hleðslu ein í einu, sem kemur við röðunina, eftir að allar skrár hafa verið lesnar. Skrár þáttaðar hlið við hlið geta tekið meira minni en þá tölu meðan þær eru lesnar; úthlutanirnar halda því innan RAM-markanna, svo langt sem áætlanirnar hér að ofan standast.

Sammengingarröðin er röð valsins, hvernig sem skrárnar klárast, svo að númerun persóna, hópa og setna, línurnar og gildi `Upprunaskrá` eru eins og við hleðslu ein í einu. Skrá sem ekki er hægt að lesa er sleppt og skráð nákvæmlega eins og áður. Vinnsluþráður sem deyr endar alla hleðsluna, eins og dauði innlestrarvinnsluþráðarins gerði alltaf, og hver þáttunarvinnsluþráður er stöðvaður þegar hleðslunni lýkur, hvernig sem hún endar. Ef þáttunarvinnsluþræðir geta ekki verið ræstir yfirhöfuð, eru skrárnar þáttaðar í innlestrarvinnsluþræðinum í staðinn.

### Hvernig tölurnar eru greindar {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) keyrir við ræsingu, aftur þegar birtibúnaðurinn er til, og við **Greina aftur**.

**RAM, með þróunarþjóninum.** `start.bat` og `npm run dev` þjóna síðunni úr ferli sem getur lesið minni vélarinnar, á `/__host/memory` (svarað innan 1,5 s, annars hunsað). Sjálfgefið er það minna af 60% af uppsettu RAM og 80% af RAM sem er laust núna; þakið er 60% af uppsettu. Þegar laust minni er það sem heldur sjálfgefna gildinu niðri segir spjaldið það og stingur upp á að loka forritum og ýta á **Greina aftur**.

**RAM, án hans** (kyrrstæð útgáfa): enginn vafra-API segir frá lausu minni, og `navigator.deviceMemory` er ávalt niður að veldi tveggja og takmarkað við 8 GiB af Chrome og Edge. Sjálfgefið er 60% af `deviceMemory`, enn takmarkað við 4 × lausa JS-haug flipans þar sem vafrinn gefur hann upp, eða 4 GiB þegar ekkert er gefið upp. Þegar `deviceMemory` er nákvæmlega 8 (takmarkið) er talan merkt sem *takmörkuð* og þakið er 4 × sjálfgefna gildið, með athugasemd um að yfir sjálfgefna gildinu sé talan þín fullyrðing, ekki mæling.

**Hvort sem er**, eru RAM-sjálfgefna gildið og þakið takmörkuð við **12 GiB**, mesta minni fyrir typed arrays sem einn Chrome-flipi getur haldið hvað sem vélin hefur (síða náði um 15,75 GB og brást; 12 skilur eftir pláss fyrir allt annað), og fara aldrei niður fyrir 256 MiB.

**Skjáminni.** Ekkert vef-API gefur það upp.

- Með þróunarþjóninum er minni kortsins lesið með `nvidia-smi` (stærsti millistykkið) eða, á Windows, úr skrárgildinu `HardwareInformation.qwMemorySize` fyrir skjámillistykkið. Sjálfgefið er 70% af því, þakið 90%.
- Án lesturs er það metið: 2 GiB sjálfgefið; 4 GiB þegar stærsta áferð er 16.384 px eða stærri (sjálfstætt kort), 1 GiB þegar minni; eða 8 × `maxBufferSize` WebGPU þegar það er stærra. Þakið er þá 8 × metna talan, því að matið greinir samþætta einingu frá sjálfstæðri en ekkert nákvæmar. Spjaldið segir að talan sé metin.
- Aldrei undir 128 MiB.

**Örgjörvi.** `navigator.hardwareConcurrency` (4 þegar ekkert er gefið upp).
