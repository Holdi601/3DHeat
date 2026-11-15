---
title: "Hreyfingar"
parent: "Innsýn"
nav_order: 4
lang: "is"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Hreyfingar: hvernig hópar hreyfast

**Innsýn → Hreyfingar** fylgist með því hvernig einingar hvorrar hliðar hreyfast *sem hópar* og nefnir hreyfingarnar sem þeir gera: hliðarárás, töng, gegnumbrot, fyrirsát, undanhald, varnir gegn eldflaug, að krossa T-ið. Hver hreyfing fær líka sitt mat á vissu, tölurnar sem liggja að baki henni, hvort hún borgaði sig og hliðstæður í kenningum og sögu. **Fjöldagreining → Hreyfingar** telur þær í þúsundum leikja: hversu oft hver hreyfing er gerð á hverju korti, í hverri spilun og hjá hverri hlið, og hversu oft hún borgar sig.

Allt er reiknað út í vafranum þínum, í sínum eigin vinnsluferli (`src/insights/maneuver`). Leikur með nokkur hundruð einingar tekur 10-500 ms. Tveggja klukkustunda loftstríð með þúsundum hluta tekur um eina sekúndu.

## Notkun {#using-it}

- Opnaðu **Innsýn**, flipann **Hreyfingar**. Hann telur þegar hann er opnaður í fyrsta sinn. Eftir að síum er breytt notarðu **Leita aftur**.
- **Viss / Líkleg / Möguleg** velur hversu viss hreyfingin þarf að vera (sjálfgefið Líkleg).
- **Tímalínan** hefur braut fyrir hvora hlið og stiku fyrir hverja hreyfingu. **Listinn** fyrir neðan sýnir sömu hreyfingar, raðaðar eftir tíma. Smellur skiptir yfir í endursýninguna við upphaf hreyfingarinnar, flýgur myndavélinni þangað og teiknar hana í 3D: leið hvers hóps sem ör (tvo arma tangar sýna bogar þeirra), útlínur hópanna á lykilaugnablikinu (óvinurinn í lit síns liðs) og framlína óvinarins sem hvít lína. **Teikna allar í 3D** bætir hinum hreyfingum leiksins við, daufum. Línurnar fara til skjákortsins einu sinni, þegar valið breytist, en ekki í hverjum ramma. Með 480 hreyfingum teiknuðum við spilun eru rammatímarnir á alvöru skjákorti (WebGL2 og WebGPU, p99 18,0-18,5 ms, hámark 19,5-20,8 ms) þeir sömu og án þeirra.
- Opnuð hreyfing sýnir niðurstöðu sína (felldir og töp þeirra eininga sem gerðu hana, meðan hún stóð og rétt á eftir, samanborið við skiptahlutfall hliðarinnar yfir leikinn), gögnin sem hún byggir á og færslur þekkingargrunnsins um hana: kenningu og sögulegar hliðstæður (Cannae fyrir töng, Sedan 1940 fyrir gegnumbrot, Tsushima fyrir að krossa T-ið, Operation Bolo fyrir gerviárás...).
- Litla taflan í lokin sýnir fyrir hverja gerð og hlið hversu margar hreyfingar voru gerðar og hversu margar borguðu sig.

![Tangarárás á gervileiknum: örvar beggja arma, líkami óvinarins og framlína hans](../assets/img/en/maneuvers.webp)

## Hvernig hópar finnast {#how-groups-are-found}

Hver eining er sett á sameiginlega tímalínu (skref upp á 1 s fótgangandi, 2 s annars, lengra í mjög stórum skrám). Eining sem deyr er höfð kyrr, svo að endurlífgun teikni enga línu yfir kortið. Á hverju skrefi eru einingar hvorrar hliðar og gerðar (loftför, farartæki, skip, fótgöngulið) tengdar saman þegar þær eru nálægt - 18 m fótgangandi, 170 m fyrir farartæki, 3 km fyrir skip og 5 km fyrir loftför - og hreyfast eins (hraðar innan helmings hraða þess hraðari, eða báðar standa kyrrar). Þyrping heldur auðkenni þess hóps sem flestir meðlimir hennar tilheyrðu. Eining án flokks er sett fótgangandi, á farartæki eða í loft eftir hraða sínum.

**Lögun** hóps er lesin miðað við stefnu hans. Súla eða lína ræðst af dreifingu meðfram og þvert á stefnuna. Fleygur er þar sem miðjan er fremst. Stallur er þar sem meðlimirnir raðast til hliðar. Kassi er þar sem þeir halda hornunum.

Allt er metið í mælikvarða leiksins sjálfs. **Bardagadrægið** `R` er 75. hundraðshluti fjarlægðar milli þess sem felldi og þess sem var felldur (takmarkað við svið lénsins). Tímalengdir hreyfingar taka mið af gerð eininga (fótgöngulið þarf þriðjung af tímanum sem landið þarf).

## Hvað er fundið {#what-it-finds}

| Hreyfing | Fundin þegar |
|---|---|
| Fylking | hópur heldur einni lögun í 60% af hreyfiskrefum sínum í 30 s |
| Framárás | hópur nálgast úr fjarlægð utan drægis þar til snertingu er náð, ¾ R eða meira, innan 35° frá þeirri átt sem óvinurinn snýr að |
| Hliðarárás | sama frá 50-130° (aftan við það meira); aðeins viss með vinveitt *festiliði* sem berst við óvininn þar (felldir í báðar áttir) |
| Töng | tvær hliðarárásir sömu hliðar á sama óvinarlíkamann, frá gagnstæðum hliðum (100° eða meira á milli), innan 90 s; viss þegar armarnir berjast við hann |
| Umkringing | þéttur óvinahópur með að minnsta kosti jafn marga úr hinni hliðinni í kringum sig innan 1,5 R, frá tveimur hópum eða fleiri, án bils yfir 100°, í eina mínútu, skorinn frá eigin liði; viss þegar hringurinn þrengdist um ½ R og barðist um vasann |
| Gegnumbrot | hópur fer í gegnum haldna línu (óvinir standa í 30 s bæði vinstra og hægra megin við hann, miðja hliðarinnar handan þeirra); viss þegar hann kemst ½ R lengra, stendur í 20 s og berst þar; gegnumbrot er enn eitt R lengra |
| Framsókn í stökkum með vernd | í litlum hópi fer hluti áfram meðan hinir standa, hlutverkin skiptast fjórum sinnum eða oftar, með skothríð úr þeim sem standa |
| Samþjöppun / dreifing | hlutfall hliðar nálægt þéttasta punkti hennar hækkar úr 35% í 60% (einingar koma 1,5 R eða meira, síðan snerting) - eða fellur þegar hliðin dreifist |
| Gerviárás | lítill hluti í snertingu dregur tvo óvini eða fleiri frá öðrum stað; stærri hópur ræðst þá á fjórföldu drægi í burtu þar sem óvinurinn er fámennari |
| Undanhald / eftirför | hópur í snertingu snýr undan og fær R bil frá þeim stað þar sem hann barðist; viss þegar óvinur þar hafði nýlega fellt einn úr honum og hópurinn fékk 2 R frá þeim sem felldi (aldrei fótgangandi: sjá neðar); óvinir sem fara sömu leið og halda í við eru í eftirför |
| Vörn í dýpt | kyrrstæðar einingar í tveimur beltum eða fleiri þvert á ás óvinarins, R djúpt, óvinurinn kemur, skothríð úr beltunum |
| Bakhalli | þrjú dráp eða fleiri á stuttu færi af kyrrstæðum einingum þeirra sem voru felldir eftir að hafa komið yfir hrygg |
| Fyrirsát | hreyfanlegur hópur hittir óvini sem stóðu í 45 s; þeir skjóta fyrst og hreyfanlegu liðið tapar tveimur eða helmingi hópsins |
| Skjöldur | ein eða tvær einingar sem fara á undan meginliði þriggja eða fleiri og mæta óvininum fyrst |
| Innri línur | hópar hliðar eru nálægt hver öðrum á milli hópa hinnar hliðarinnar og færa einingar sínar á milli þeirra |
| Taktur | hlið svarar snertingu (beygja, breyting á hraða, fyrsta skot) 1,5 sinnum hraðar, Mann-Whitney p undir 0,05 |
| Crank, notch, drag, pump | skotmark flugskeytaskots snýr skotmanninum í 35-70°, 75-105°, yfir 140°, eða dregur hann og snýr til baka |
| Lofttöng, veggur, lead-trail, grinder | par sem skiptist á einn óvin; þrjú hlið við hlið gegn óvininum; eining 5-20 km á eftir annarri; tvö sem hringsóla hvort í sinni fjarlægð frá einum punkti |
| Loftvörn í lofti (CAP) | hringsólar um stöð í þrjár mínútur |
| Orku- og hornabardagi | í návígi - stefnur 30° á milli, hvor um sig heldur hinum fyrir framan sig til skiptis, eða dráp á milli þeirra - hæð nýtt og klifrað, eða flatt og beygt hart meðan hraðinn minnkar; viss þegar annað felldi hitt |
| Árásarpakki, SEAD | loftsveit með blönduð hlutverk, þar sem sum þeirra ráðast á jörðu; dráp loftvarna fyrst, áður en flest önnur dráp á jörðu |
| Orrustulína, að krossa T-ið | þrjú skip í röð; súla sem liggur þvert á höfuð óvinarsúlu |

Hver hreyfing segir hvaða **mynstur** úr þekkingargrunninum hún sýnir (`patterns-maneuver.ts`: fylking, framárás, tvöföld umkringing, umkringing, gegnumbrot, eldur og hreyfing, gerviárás, undanhald, eftirför, vörn í dýpt, skjöldun, dreifing, varnir gegn eldflaugum, hornabardagi, loftvörn í lofti, árásarpakki, orrustulína, að krossa T-ið) og þær færslur sem á að lesa fyrst. Eldri færslur fá nýju mynstrin í gegnum `knowledge/maneuver-tags.ts`. Sjá [Þekkingarlinsan](knowledge.md).

**Borgaði sig** ber saman skiptahlutfall einingana meðan hreyfingin stóð (og mínútu á eftir) við skiptahlutfall hliðarinnar yfir leikinn. Undanhald borgar sig þegar það missti færri einingar eftir að hafa snúið en áður. Varnir gegn eldflaugum borga sig þegar loftfarið lifir í eina mínútu. Umkringing borgar sig þegar vasinn missir helminginn.

## Yfir marga leiki {#over-many-matches}

Samantekt hvers leiks (`src/mass/summarize.ts`, sjá [Fjöldagreining](mass-analysis.md)) hefur lítinn kafla `maneuvers`: fyrir hverja gerð og hlið, gerðar (á Líklega eða hærra), borguðu sig, borguðu ekki, felldir og töp. **Fjöldagreining → Hreyfingar** leggur þetta saman yfir leikina sem síurnar halda eftir, eftir korti og ham eða yfir þá alla, með Wilson-vikmörkum á hlutfalli þeirra sem borguðu sig. Hver lína í töflunni opnar leikina sem hún var gerð í. Samantektir skrifaðar áður en kaflinn var til hafa engan slíkan kafla: keyrðu `node tools/3dheat-summarize.mjs <folder> --force` til að bæta honum við.

## Hversu viss hún er {#how-sure-it-is}

Gervileikir með settum hreyfingum (`synth.ts`, keyrðir af `maneuver.test.ts`): allar 28 settu gerðirnar finnast á Líklega eða hærra. Af 50 hreyfingum sem skráðar eru eru 31 af settu gerðinni og hinar 19 eru líka raunverulega til staðar (fylking hópsins sem hreyfist, framárásin á gegnumbrotsstrókinn). Engin er röng. Á 30 núlllíkönum - slembigöngur sundur og saman, einingar sem standa af handahófi, loftför á beinum leiðum, fjöldi sem reikar um - er ekkert skráð á Líklega eða hærra.

Á raungögnum (tugir bardaga á landi, nokkur löng loftstríðsverkefni, tugur skotleikja): framárásir, hliðar, gegnumbrot og umkringingar í skriðdrekabardögum; fylkingar og návígi í lofti; varnir gegn eldflaugum, CAP-hringsólur og lead-trail-pör í loftstríðsverkefnunum; framárásir fótgönguliðs, súlur og fáar fyrirsátir og stökkpör í skotleikjunum. Þröskuldarnir eru lögun úr kenningu hernaðar, mæld í mælikvarða leiksins. Lestu hverja staka niðurstöðu með gögnunum sem liggja að baki henni, og hlutfall taflnanna með vikmörkum þeirra.

### Gegn núlllíkönum af sömu leikjum {#against-null-models-of-the-same-matches}

Greinirinn getur blekkst af landinu og fjöldanum: í slag er sérhver hópur umkringdur óvinum. Því er hver gerð líka keyrð á **núlllíkönum** byggðum á sömu leikjum (`nulls.ts`), þar sem liðin mætast ekki lengur eins og áður: tímalína annarrar hliðar er snúin um þriðjung til tvo þriðju hluta leiksins (*shift*), eða slóðir hennar snúnar um miðju kortsins (*rotate*). Liðamerkjum er líka blandað saman (*teams*, sem heldur í grundvallaratriðum um helmingi raunverulegra bardaga). Bardagar eru aðeins taldir sem dráp tengd dauðsföllunum: sá sem felldi innan 2 R og fórnarlambið á staðnum. Núlllíkan rýfur þessi tengsl. Hreyfingar sem finnast á Líklega eða hærra, raunverulegar gegn núlllíkönunum (30 skriðdrekabardagar; 12 skotleikir):

| Gerð | Skriðdrekabardagar: raunverulegt / shift / rotate | Skotleikir: raunverulegt / shift / rotate |
|---|---|---|
| Umkringing | 0 / 0 / 0 (var 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Gegnumbrot | 0,03 / 0,02 / 0,05 (var 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Hlið | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Framárás | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Undanhald | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (svo aldrei viss fótgangandi) |
| Fyrirsát | - | 0,17 / 0,04 / 0,04 |
| Orkubardagi | 1,2 / 0,1 / 0,85 | - |
| Hornabardagi | 0,6 / 0,07 / 0,3 | - |

Loftbardagar nærri miðju vígvallar lifa af snúning um þá miðju, svo rotate-dálkurinn gerir þá síður vel úr garði en landgerðirnar. Hreyfingar innan einnar hliðar - fylking, CAP, grinder, árásarpakki, SEAD, stökk, skjöldur - ráðast ekki af hinni hliðinni og eru ekki prófaðar á þennan hátt. `maneuver.test.ts` athugar að núlllíkönin fjarlægi settar hliðarárásir, tangir, umkringingar, gegnumbrot, fyrirsátir og undanhald úr gervileikjunum.

## Takmarkanir {#limits}

- Hópar þurfa staðsetningar yfir tíma. Skrá með aðeins atburðum hefur þær ekki.
- Stefnan er ekki lesin úr gögnunum. Framlína óvinarins er þar sem festiliðið berst við hann, annars þar sem hann hreyfist, annars þar sem árásarliðið kom frá.
- Landið er lesið úr hæðum eininganna sjálfra (bakhallinn). Engin sjónlínuprófun er gerð.
- Mjög stórar skrár eru teknar úr sýni með lengri skrefum. Stuttar loftarhreyfingar í þeim eru þó enn lesnar úr 2-4 s skrefum.
