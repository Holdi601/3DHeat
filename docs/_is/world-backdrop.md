---
title: "Bakgrunnur heimsins"
parent: "Borð og bakgrunnsform"
nav_order: 5
has_children: true
lang: "is"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---


# Bakgrunnur heimsins

Raunheimur sem bakgrunnur setur raunverulegt landslag undir flugupptöku: hæðir, vegi, ár, flugvelli og hús, sótt úr ókeypis opnum kortagögnum. Notaðu hann þegar Tacview-upptaka myndi annars svífa yfir auðu neti. Hann er [borð](glossary.md), þannig að hitinn og táknmyndirnar standa á honum.

## Búðu til einn {#build-one}

1. Hlaðaðu flugupptöku sem segir hvar á jörðinni hún er (Tacview `.acmi` skrá), eða hlaðaðu engu og veldu vígvöll í skrefi 3. Sjá [Hleðsla gagna](getting-data-in.md).
2. Opnaðu **Bakgrunnur / borð** í hliðarstikunni.
3. Ýttu á **Raunheimur sem bakgrunnur** til að byggja landslagið undir gögnunum þínum. Eða veldu kortaleiksins í **Vígvöllur** og ýttu á **Byggja bakgrunn vígvallar** (eða **Streyma vígvellinum**).
4. Bíddu. Spjaldið sýnir framvinduna (*Hæðarreitir*, *Kortareitir*, *Bygging bakgrunnsins*); **Hætta við** stöðvar hana.
5. Flugðu um. Heimildarlínan fyrir kortagögnin er skrifuð neðst í hægra horninu á sýninni.

Fyrsta smíðin sækir nokkra tugi megabæta. Vafrinn geymir þá, þannig að önnur smíði sama svæðis sækir ekkert. **Gleyma kortareitum** eyðir þeim. Hnappurinn **Raunheimur sem bakgrunnur** birtist aðeins þegar hlaðnu gögnin bera landfræðilega tilvísun (hér að neðan).

Allt er smíðað í bakgrunnsvinnsluferli ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Niðurstaðan kemur í stað núverandi borðs og hegðar sér eins og hvert [þrívítt borð](model-levels.md): hitinn á bak við hana er falinn, hún er skorin af sneiðinni, hefur [útlitsstýringarnar](level-appearance.md) og má vista í [safninu](level-library.md).

## Hvar gögnin eru: landfræðilega tilvísunin {#where-the-data-is-the-geographic-reference}

Gagnasafn fær landfræðilega tilvísun aðeins frá uppsprettu sem gefur hana upp:

- **ACMI-upptaka**: `ReferenceLatitude` og `ReferenceLongitude` í haus hennar, og staðsetningar sem lesandinn varpar á flötinn sem snertir WGS84-sporöskjuna þar (X austur, Y norður, í metrum; hæðir eru hæð upptökunnar yfir sjávarmáli). Tilvísunin helst þegar varpunin tekur **X** og **Y** sem landásana – eins og vísbendingar upptökunnar sjálfrar gera – og hverfur þegar landið kemur úr öðrum dálki, eins og flatheimsdálkunum **U** og **V** í leik.
- **Parquet-tafla sem `heat3d`-vísbendingarnar bera `geo`-færslu** – DCS-, MSFS-, X-Plane- og IL-2 (Tacview) töflur [Watcher](https://github.com/Holdi601/3DHeat-Watcher). Færslan er lýst undir [Fyrir forritara](#for-developers).

Hleðsla á nokkrum skrám heldur tilvísuninni aðeins þegar þær deila allar sömu. Sérhver annar lesari er óbreyttur og ber enga.

Bakgrunnurinn er varpaður á sama hátt og síðan færður í gegnum ásavarpun hleðslunnar, þannig að hann lendir undir gögnunum hvaða snúningur eða kvarði sem varpunin beitir.

## Vígvellir {#theatres}

**Vígvallar**-valið sýnir raunheimskort DCS World (Kákasus, Nevada, Normandí 2, Ermarsundið, Sýrland, Persaflói, Marianaeyjar, Marianaeyjar WWII, Suður-Atlantshaf, Sínaí, Afganistan, Kola, Þýskaland í kalda stríðinu, Írak) og IL-2 Great Battles (Stalíngrad, Moskva, Kúban, Rínarlönd, Normandí, Prokhorovka, Velikie Luki, Arras, Odessa, Finnska flóinn / Leníngrad, Kórea), hvert með sínum reit á jörðinni ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). DCS-reitirnir eru útbreiðsla ritstjóranna reiknuð út frá birtum varpunum; IL-2-reitirnir, og þeir DCS-reitir sem eru merktir þannig, eru áætlanir út frá birtum stærðum kortanna og bæjunum við jaðra þeirra – spjaldið segir hvaða er hvað.

**Byggja bakgrunn vígvallar** smíðar tvö smáatriðastig í einu neti:

| Stig | Svæði | Landslag | Kort |
|---|---|---|---|
| Vígvöllur | allur reiturinn | dýpsta aðdráttarstig upp í 10 sem þarf í mesta lagi 64 hæðarreiti (um 3 km á hnúta yfir Kákasus, 1 km yfir Normandí) | hafið, vötn, landþekja og hraðbrautir úr í mesta lagi 64 vigurreitum á aðdráttarstigum 4 til 9 |
| Smáatriðasvæði | **Undir gögnunum**, **Umhverfis punkt** (breiddargráða, lengdargráða, 12 til 400 km), eða ekkert | allt að aðdráttarstigi 12 inn í í mesta lagi 100 reitum, í mesta lagi 500.000 hnútum | allt hér að ofan, úr í mesta lagi 1.500 vigurreitum á dýpsta aðdráttarstigi upp í 14 sem passar |

Smáatriðasvæðið sker gat í net vígvallarins, víkkað út í heilar reitir svo bæði netin deili jaðarlínum sínum, og þunnur veggur lokar sauminum þar sem þau sýna hæðirnar með ólíkum hætti.

Með gögnum hlaðin er vígvöllurinn smíðaður á fleti gagnanna, þannig að hann lendir undir þeim eins og hann er smíðaður. Án gagna er hann smíðaður umhverfis eigin viðmiðspunkt vígvallarins (heilar gráður nærri smáatriðasvæðinu). Gögn sem eru hlaðin síðar á annarri tilvísun – ACMI-skrá nefnir sína eigin – færa bakgrunninn undir sig: nákvæma færslan á milli varpananna tveggja er reiknuð á 256 × 256 neti yfir bakgrunninum og lesin á milli hnútanna, innan metra eða tveggja yfir heilan vígvöll ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Bakgrunnur sem er vistaður í safninu heldur stað sínum og færist eins þegar hann er hlaðinn undir öðrum gögnum.

### Streymi vígvallar {#streaming-a-theatre}

**Streyma vígvellinum** sýnir vígvöllinn eins og kortaskoðari flughermis gerir: landið kemur sem margir litlir reitir umhverfis myndavélina, hlaðnir þegar flogið er og slepptir þegar þeir eru utan seilingar ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Fjórtré Web Mercator-reita.** Rætur á aðdráttarstigi 5 þekja 1.500 km umhverfis myndavélina, þannig að landið nær handan reits vígvallarins til sjóndeildarhrings. Reitur er klofinn í fjögur börn sín meðan myndavélin er nær honum en 1,4 sinnum breidd hans, niður á aðdráttarstig 15 (um 1 km á reit, 15 m milli landhnúta): smáatriðin dofna með fjarlægðinni eins og þau dofna á skjánum.
- **Hver reitur sitt eigið net**, smíðað í vinnsluferli ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): 65 × 65 landnet með pilsi um jaðarinn (þannig að nágrannar á ólíkum smáatriðum sýna aldrei sprungu), landþekja og hafið máluð á það, vegir, járnbrautir, vötn, ár, flugvellir, mældar flugbrautir og hús ofan á, og valfrjálst gervihnattamynd af reitnum. Birtingarvélin teiknar reitina með útliti og dýptarreglum borðsins, þannig að þeir fela hitann á bak við sig eins og hvert borð.
- **Gróft fyrst.** Reitirnir eru pantaðir grófir og nærri fyrst, fjögur niðurhöl í einu fyrir hverja uppsprettu; meðan börn reits hlaðast stendur reiturinn í þeirra stað, þannig að sýnin fyllist strax og skerpist.
- **Minni**: smíðaðir reitir eru geymdir upp í 600 MB, þeir sem voru teiknaðir síðast fyrst fjarlægðir. **Niðurhöl** eru geymd í reitaskyndiminninu, takmörkuð við 2 GB kostnaðarramma, þeir elstu fyrst út: að fljúga aftur yfir svæði kostar ekkert, og engin þak er á hverri smíði.
- **Vistað í safninu** sem það sem það streymir – vígvöllurinn, valkostir hans og staður hans á jörðinni – ekki sem reitir: hleðsla streymir aftur, úr reitaskyndiminninu þar sem reitirnir eru enn til. Smellir og skoðarinn hitta reitina eins og þeir hitta hvert borð.
- Báðar birtingarvélarnar teikna reitina: prófað hlið við hlið á alvöru GPU (WebGPU og WebGL2 á sama korti), þar með talið hiti sem er falinn á bak við hrygg.
- Með gögnum hlaðin eru reitirnir smíðaðir á fleti gagnanna; gögn sem eru hlaðin síðar á öðrum fleti smíða þá upp á nýtt þar (úr skyndiminninu).
- Mælt á hermiflugum yfir þremur stöðum (Normandí, Nevada, Sýrland): um 63, 45 og 24 MB í fyrstu heimsókn með myndum; önnur heimsókn sækir ekkert.

## Hvað er smíðað {#what-is-built}

| Hluti | Uppspretta | Hvernig |
|---|---|---|
| Myndir (streymdir vígvellir, valfrjálst) | EOX Sentinel-2 cloudless 2016 | **Gervihnattamyndir** leggja skýjalausa 2016-samsetninguna (um 10 m á pixla, aðdráttarstig 14, dýpri reitir stækka hana) yfir landið í stað málaðrar landþekju; vegir, flugbrautir, hús og nöfn eru áfram ofan á. |
| Skarpari myndir (BNA, Frakkland) | USGS National Map orthoimagery; IGN BD ORTHO | Með **Gervihnattamyndir** kveikt tekur kortareitur á aðdráttarstigi 13 sem liggur alveg innan samliggjandi Bandaríkjanna eða stórborgarsvæðis Frakklands loftmynd þjóðarinnar í staðinn, tveimur aðdráttarstigum dýpra en reiturinn (sextán reitir hans lagðir í eina mynd, um 1-2 m á pixla þegar nærri er). EOX alls staðar annars staðar. |
| Landslag (streymdir vígvellir) | Mapterhorn | Copernicus GLO-30 alls staðar (um 19 m á pixla á aðdráttarstigi 12), metra-skali þar sem eigin landmæling lands er með (Frakkland, BNA og fleiri); lesið tveimur aðdráttarstigum grófara en hver reitur. AWS Terrain Tiles ef ekki næst í Mapterhorn. |
| Landslag | AWS Terrain Tiles (Terrarium PNG) | Hæðanet yfir reitinn: aðdráttarstigið er það dýpsta upp í 12 (um 28 m á pixla við 43° N) sem þarf í mesta lagi 36 reiti, og netið er grisjað í mesta lagi 400.000 hnúta. Teiknað sem land með venjulegum léttiskilum. |
| Vegir, járnbrautir | OpenFreeMap vigurreitir, `transportation`-lag | Flatar bönd lögð yfir landslagið, þétt upp í bil landslagsins og lyft nokkur prósent af því svo þau berjist ekki við það. Breidd eftir flokki, frá 16 m (hraðbraut) niður í 3 m (slóð, járnbraut); aldrei mjórri en ská reitsins / 5000. Stígar, ferjur og göng eru látin falla niður. |
| Flugvellir | `aeroway`-lag | Flugbrautar-, akbrautar-, flugvélastæðis- og þyrlupallamargfeldi lögð sem land; braut- og akbrautarlínur sem 45 m og 18 m bönd. |
| Vatn | `water`-lag | Hafið flatt í 0 m, vötn og tjarnir flöt í lægstu strönd sinni, ár lögð yfir. Teiknað sem vatn: flatskyggt, engar hæðarlínur. |
| Landþekja | `landcover`- og `landuse`-lög | Máluð á eigin hnúta landslagsins, engir aukaþríhyrningar: skógar, gras og garðar grænt, akrar strágult, votlendi, sandur, grjót, ís; íbúðar-, iðnaðar-, verslunar-, hernaðar- og grjótnámusvæði í daufum tónum. Vatn er líka málað undir vatnsyfirborðinu, þannig að ströndin sést úr hvaða hæð sem er. Ber jörð fær rólegan hæðarlit (láglendi grágrænt, hálendi brúnt, snjór yfir 3.000 m). Læsilegt í upplausn landslagsins: um 30-45 m á smáatriðasvæðinu, kílómetrar í vígvellinum. |
| Staðanöfn | `place`- og `aerodrome_label`-lög | Borgir, bæir og þorp, og flugvellir með ICAO-kóða sínum, skrifuð yfir sýnina; hversu langt hver tegund sést vex með hæð myndavélarinnar, í mesta lagi 70 í einu. |
| Mældar flugbrautir | [OurAirports](https://ourairports.com/data/) `runways.csv` (almenningseign) | Valfrjálst (**Flugbrautir frá OurAirports**, kveikt sjálfgefið): sérhver opin flugbraut með báða enda á listanum, frá þröskuldi til þröskulds í skráðri breidd sinni, með hliðarrönd, strikaðri miðlínu og þröskuldsstikum. Einn 4 MB listi, sóttur einu sinni og geymdur í skyndiminninu. |
| Hús | `building`-lag | Grunnflatir þrýstir upp frá `render_min_height` til `render_height` (6 m þegar það vantar) yfir lægsta landið undir þeim; hlutar með `hide_3d` sleppt. Teiknuð sem mannvirki. |

Vigurreitir eru lesnir á aðdráttarstigi 14 (eina stigið með húsum) þegar reiturinn þarf í mesta lagi 300 þeirra, annars á dýpsta stigi sem það passar við, niður í 8. Stærra svæði fær aðeins landslag.

### Útlit {#look}

Bakgrunnur byrjar með **Sýna tekinn lit** kveikt – liturinn er það sem greinir ljósan veg frá gráu landinu sem hann liggur á, dökka flugbraut frá flugvélastæðinu sínu – með þríhyrningsjöðrum landsins slökkt, því reglulegt net segir ekkert, daufum hæðarlínum, ógagnsæju hafi (gólf undir því myndi berjast við yfirborðið um dýptina langt í burtu), og húsum ljósgrá og nær föst, eins og kort teiknar þau. Opið hafið fær engin þríhyrninga á landinu. Allt annað er sjálfgefið útlit líkanaborðs.

## Heimildir á striganum {#credits-on-the-canvas}

Á meðan bakgrunnur er borðið er heimildarlína uppsprettna hans skrifuð neðst í hægra horninu á sýninni, án þess að smella þurfi, þannig að skjámyndir og myndbönd sem eru búin til beri hana:

> OpenFreeMap © OpenMapTiles · Gögn © OpenStreetMap contributors · Hæð: Terrain Tiles – SRTM, GMTED2010, 3DEP með leyfi bandarísku jarðfræðistofnunarinnar (USGS); ETOPO1: NOAA; og fleiri

Hver hluti tengist eignarsíðu uppsprettu sinnar (openstreetmap.org/copyright og [listi yfir eignarskrár](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) Terrain Tiles). Bakgrunnur sem er vistaður í safninu geymir heimildir sínar og sýnir þær aftur þegar hann er hlaðinn. Textinn er þýddur með skoðaranum; nöfnin eru það ekki.

## Heimildir og skilmálar þeirra {#sources-and-their-terms}

Sérhver uppspretta, leyfi hennar og hvernig bakgrunnurinn helst innan skilmálanna: [Bakgrunnur heimsins: heimildir og skilmálar](world-backdrop-sources.md).

## Reitaskyndiminnið {#the-tile-cache}

Sérhver reitur, og TileJSON vigurreitanna, er geymdur í Cache API vafrans undir `3dheat-world-tiles-v1`, eftir slóð. Önnur smíði sama svæðis gerir engar beiðnir og virkar án nettengingar: TileJSON er beðið um fyrst og, ef það bregst, nefnir afrit þess í skyndiminninu reitina sem þegar eru til. Reitir sem þjónninn á ekki (opið haf, 404) eru líka munaðir sem fjarverandi.

Vigurreitaslóðir bera útgáfudag kortsins, þannig að eftir að OpenFreeMap birtir nýja útgáfu sækir næsti bakgrunnur ferska reiti og þeir gömlu standa þangað til þeim er eytt. Skyndiminnið er takmarkað við 2 GB: fari það yfir það eru þeir reitir sem geymdir hafa verið lengst eyddir fyrst. **Gleyma kortareitum** eyðir öllu skyndiminninu. Skyndiminnið þarf öruggan uppruna (`https://` eða `localhost`); annars sækir hver smíði aftur.

## Borið saman við Tacview {#compared-with-tacview}

Athugað með auga á einum stað á hvern vígvöll, með gervi-upptökum: flugtaksbrunin liggja á miðlínum teiknuðu flugbrautanna, og strandyfirferðir falla á ströndina. Hlutur Tacview er úr skjölum hans og birtum skjámyndum (tacview.net, Steam-síða hans), ekki úr keyrslu hér.

| | Tacview 1.9 | Þessi bakgrunnur, streymdur |
|---|---|---|
| Umfang | öll hnötturinn | 1.500 km umhverfis myndavélina, hvar sem hún er |
| Landslag | ETOPO1 (um 1,25 km) innbyggt; SRTM 25-75 m ef notandinn setur skrárnar upp; DCS-landslag flutt út úr DCS | Copernicus GLO-30 (Mapterhorn), metra-skali í Frakklandi og BNA |
| Myndir | engar innbyggðar; áferðir sem notandinn sækir (Mapview, SAS Planet, viðbætur eins og VFR-kort af Kákasus) | EOX Sentinel-2 cloudless 2016, um 10 m, streymt |
| Landþekja | engin, nema í áferð | úr OpenStreetMap, máluð á landslagið (án mynda) |
| Vegir, járnbrautir | engir, nema í áferð | sérhver flokkur nærri myndavélinni, helstu vegir langt í burtu |
| Hús | engin | þrýstir grunnfletir nærri myndavélinni |
| Flugvellir | merkingar og flugbrautir sem flatir kassar, engar merkingar | flugbrautir úr mældum endum með hliðarröndum, miðlínu og þröskuldsstikum; akbrautir, flugvélastæði; nöfn með ICAO-kóðum |
| Staðanöfn | nokkur þorps- og borgarmerki | borgir, bæir, þorp, flugvellir, eftir fjarlægð og hæð |

Þar sem hann nær enn ekki:

- **Upplausn mynda**: utan BNA og Frakklands er 10 m gervihnattasamsetningin mjúk undir um 2 km; Tacview með áferð sem notandinn setur upp í aðdráttarstigi 17 er skarpari þar.
- **Landslag í lögun DCS**: Tacview getur sýnt landslagið sem DCS flytur út sjálft; hér er það hin raunverulega jörð, sem er frábrugðin landslagi DCS þar sem líkanasmiðir kortanna breyttu því.
- **Sveigja**: landið er flatt plan, þannig að sjóndeildarhringurinn er ekki sveigður jarðar; Tacview teiknar kúlu.
- **Hraði**: fyrsta heimsókn á stað sækir tugi megabæta áður en hann verður skarpur; í hugbúnaðarteiknuðum vafra (skjámyndirnar) teiknar hann nokkra ramma á sekúndu með nokkur hundruð reitum.

## Takmarkanir og það sem kemur síðar {#limits-and-what-comes-later}

- **Upplausn landslags**: um 30 m í besta falli, og grófara á stórum svæðum. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFF á AWS, enginn lykill, fastur eignartexti) er betri uppspretta: 30 m alls staðar, GLO-90 þar sem GLO-30 hefur eyður (Armenía og Aserbaísjan, sem DCS Kákasus nær yfir). Hún þarf GeoTIFF-lesara og er ekki notuð enn.
- **Betra landslag**: Copernicus GLO-30 á AWS sendir engin CORS-haus, þannig að vafri getur ekki lesið það; spegill OpenTopography er lesanlegur (CORS og svið), en skilmálar þeirra fyrir keyrslu opinberrar vefforrits eru óþekktir – það þarf að spyrja áður en það er notað. Mapterhorn er nú þegar með GLO-30.
- **Sveigja**: landið er flatt plan og hæðirnar eru ekki lækkaðar vegna sveigju jarðar, sem passar við hvernig upptökurnar eru settar (hæð sem hæð); langt frá tilvísuninni reka þær saman, um minna en eitt þúsundasta við 100 km. Að beygja aðeins reitina myndi slíta þá frá gögnunum langt í burtu, þannig að það er ekki boðið. Bogadreginn sjóndeildarhringur þarf sama fall – fjarlægð frá myndavélinni í öðru veldi deilt með tvöföldum radíus jarðar – beitt í hverri umferð sem teiknar staðsetningu (borð, reiti, hita, línur, kassa, merkingar, val) sem eina sameiginlega einingu; alvöru hnöttur þarf jarðmiðjaðar staðsetningar fyrir gögnin líka og myndavélateikningu miðaða við myndavélina. Hvort tveggja er á áætlun með hnattarhamnum.
- **Aðeins heimur nútímans**: söguleg kort DCS og IL-2 (Normandí 2, Ermarsundið, Þýskaland í kalda stríðinu, öll IL-2-kortin) eru teiknuð með bæjum, vegum og strandmannvirkjum dagsins í dag; spjaldið segir það. Tímabilsflugvellir eru ekki teiknaðir.
- **Enginn hnattarhamur**: bakgrunnur er flatt staðbundið plan. Sýn yfir alla jörðina er áformuð.
- Vegir eru breikkaðir á stórum svæðum svo þeir sjáist áfram; nálægt eru þeir breiðari en í raunveruleikanum.
- Heiti vígvalla DCS í töflum Watcher eru pöruð eins og DCS gefur þau í `mission.theatre`; heiti sem er ekki á listanum fellur til fyrstu staðarákvörðunar námundaðrar í heilar gráður, og aðeins breiddar- og lengdargráðu.

## Söguleg kort (ekki smíðuð enn) {#historical-maps-not-built-yet}

Tímabilskort gætu sett áferð á söguleg vígvelli síðar. Kortaseríur bandaríska herkortastofnunarinnar (AMS) eru verk bandarísku alríkisstjórnarinnar, og yfirleitt taldar almenningseign (athugaðu skráningu hvers skanna; mörg eru endurútgáfur af breskum GSGS- eða þýskum frumritum, en krúnuhöfundarréttur þeirra eða réttur óþekkts verks er líka útrunninn):

| Vígvöllur | Sería | Hvar skannað |
|---|---|---|
| IL-2 Stalíngrad, Moskva, Kúban, Velikie Luki, Prokhorovka, Leníngrad | AMS **N501**, Austur-Evrópa 1:250.000 (tekið saman á 6. áratugnum úr sovéskum og þýskum kortum) | UT Austin PCL; sum blöð staðsett á UT GeoData |
| IL-2 Normandí, DCS Normandí 2 og Ermarsundið | AMS **M661** / GSGS 4250, Frakkland 1:50.000 | UT Austin PCL, Princeton |
| IL-2 Rínarlönd | AMS **M501** 1:250.000 og **M841** 1:25.000 (Þýskaland) | UT Austin PCL |
| IL-2 Kórea | AMS **L751** 1:50.000 (útgáfur 1951) og **L552** 1:250.000 | ANU Open Research (L751-blöð, „copyright expired“), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | brein skotgrafakort frá fyrri heimsstyrjöld (ekki AMS) | McMaster University; National Library of Scotland (skilmálar um óviðskiptalega notkun) |

AMS-blöð bera breiddar- og lengdargráðumerki á hornum sínum, þannig að hvert þeirra væri staðsett með fjórhyrningsfitting og lagt yfir landslagið sem áferð, smíðað og geymt á staðnum eins og reitirnir.

## Forritarar {#for-developers}

### `geo`-færslan í Parquet-töflu {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` og `up` nefna dálkana sem halda austur- og norðurmetrum á sama snertiplani í (`lat0`, `lon0`) og hæðinni. Hleðslan ber tilvísunina þegar varpun hennar tekur nákvæmlega þessa dálka (austur sem X, norður og hæð sem Y og Z, í hvora áttina sem er). Valfrjálsa `dcs`-færslan nefnir eigin metra DCS-töflu (x norður, y upp, z austur) og vígvöll hennar: hleðsla sem varpar þeim dálkum er staðsett í gegnum þverlægu Mercator-varpun vígvallarins í staðinn ([DCS-hnit](#dcs-coordinates)). Tafla án `geo` er lesin eins og áður.

### DCS-hnit {#dcs-coordinates}

Sérhver DCS-vígvöllur er þverlæg Mercator-varpun (WGS84, kvarði 0,9996) með sinn eigin miðbaug og falsa upphafspunkt, þar sem DCS x er norðurfærslan og z austurfærslan. Fastarnir eru þeir sem pydcs-verkefnið birtir; stærðfræðin er röð Krügers af sjötta stigi (Karney 2011), flutt yfir í [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Bakgrunnur fyrir DCS-metra er smíðaður beint í þeim, þannig að DCS-tafla Watcher sem er varpað á `dcs_x`/`dcs_y`/`dcs_z`, borð sem DCS-landsbreytirinn skrifaði og bakgrunnurinn deila allir sama ramma. Fastar Íraks eru ekki birtir; þeir eru felldir að birtum viðmiðspunktum (4 cm rótarmeðalkvaðrat).

DCS-töflur Watcher eru á snertiplani í föstum viðmiðspunkti vígvallarins (sami punktur og vígvallarvalið notar, hér að neðan), þannig að nokkur verkefni á sama vígvelli sameinast með tilvísun sinni óskertri og falla saman við vígvallarbakgrunn án þess að hreyfast.

### Einföldun og fjárhagsáætlun {#simplification-and-budget}

- Hús undir 20 m² eru felld niður; 60 m² þegar reiturinn er yfir 30 km þvert, 150 m² umfram 80 km. Afgangurinn er bætt við stærst fyrst þar til húsin ná 1,5 milljón þríhyrninga.
- Smáir vegir, þjónustuvegir og slóðar eru felldir niður umfram 60 km þvert; umfram 150 km eru aðeins hraðbrautir, stofnvegir, aðalvegir og tengivegir eftir.
- Allur bakgrunnurinn helst undir um 3 milljónum þríhyrninga. Innflutningsskýringin segir hversu mörg hús voru skilin eftir úti.
