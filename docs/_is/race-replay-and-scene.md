---
title: "Endurspilun og þrívíð sviðsmynd"
parent: "Kappakstursgreining"
nav_order: 52
lang: "is"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Endurspilun og þrívíð sviðsmynd

Spilaðu hringina þína saman til baka, eins og keppni, og sjáðu hvar einn bíll nær á undan. Allt sem þú sérð í þrívíðu sýninni í flipanum **Kappakstursgreining** er lýst hér: eknu línurnar, litirnir á brautinni, bílarnir og merkingarnar.

![Orsakakort með bílunum stilltum upp 40 m fyrir beygju: litað braut, tveir bílar og flaggstöngin](../assets/img/en/race-replay-lined-up.webp)

## Klukka endurspilunarinnar {#the-replay-clock}

Ein klukka stýrir öllum hringjum: sekúndur af **viðmiðshringnum**. Vélin færir hana áfram í hverjum ramma meðan spilað er (um tíma rammans × hraða endurspilunar); í lokin fer hún aftur í 0 þegar **Endurtaka** er kveikt, annars stöðvast hún. Klukkan er viljandi ekki hluti af geymslunni, þannig að hliðarstikan birtist ekki aftur í hverjum ramma; HUD-ið og gröfin gerast áskrifendur að henni og uppfærast í mesta lagi einu sinni á hvern ramma.

**Lengd endurspilunarinnar** er lengsta tíminn sem nokkur hringur nær á klukkunni: tími hvers hrings (að frádregnu forskoti hans í *Stillt upp*), eða tími viðmiðsins í *Hlið við hlið*.

## Stjórnstikan {#the-transport-bar}

Undir sýninni, frá vinstri til hægri:

| Stjórntæki | Gerir |
|---|---|
| ⏮ | aftur á upphafið (einnig **Home**) |
| ▶ / ❚❚ | spila / gera hlé (einnig **K**) |
| hraði | 0,25×, 0,5×, 1×, 2×, 4× |
| rennistika | setur klukkuna beint, í 0,01 s skrefum |
| klukka | `tími / lengd · metrar`: klukkan sem hringtími, lengd endurspilunarinnar og hversu langt á viðmiðinu viðmiðsbíllinn er |
| *Frá ráslínu* / *Stillt upp* / *Hlið við hlið* | endurspilunarhamurinn (að neðan) |
| **Stilla upp hér** | setur alla bíla þar sem viðmiðið er núna og heldur áfram þaðan |
| **Endurtaka** | byrjar aftur í lokin (kveikt sjálfgefið) |
| **Fela gröf** / **Sýna gröf** | vegalengdargröfin undir stikunni |

Hnapparnir eru óvirkir þangað til hringir eru hlaðnir (einn hringur nægir til að endurspila hann; samanburður þarf tvo).

## Endurspilunarhamir {#replay-modes}

Hvernig tími hvers hrings fylgir af klukkunni:

| Hamur | Tími hvers hrings | Hvað hann sýnir |
|---|---|---|
| **Frá ráslínu** (`start`) | klukkan sjálf | hver hringur frá eigin upphafi: keppni á milli þeirra, bilið vex eins og það gerði á brautinni |
| **Stillt upp** (`anchor`) | klukkan auk forskots hringsins | hver bíll á sama stað á sama augnabliki, og síðan sleppt – það sem gerist frá þeim punkti, ekki frá upphafi hringsins |
| **Hlið við hlið** (`locked`) | tíminn þegar hringurinn náði núverandi vegalengd viðmiðsins | hver bíll haldinn við vegalengd viðmiðsins allan hringinn: hraðar og innsláttur bornir saman metra fyrir metra |

Notaðu þetta þegar:

- **Frá ráslínu**: þú vilt sjá hver er á undan og hvernig bilið vex.
- **Stillt upp**: þú vilt vita hvað gerist í einni beygju eða á einum beinum kafla, með öllum jafnir þar.
- **Hlið við hlið**: þú vilt bera saman hvað ökumennirnir gera með pedölum og stýri á sama stað á brautinni.

**Forskot í *Stillt upp*:** fyrir akkeri við `s` metra eftir viðmiðinu er forskot hvers hrings eigin tími við `s` mínus tími viðmiðsins við `s`, lesið úr samræddu hringjunum (sjá [ein vegalengdarás](race-corner-analysis.md#one-distance-axis)). Hringur sem nær ekki yfir `s` heldur forskotinu 0. Þegar *Stillt upp* er valið úr hamhnöppunum er akkerið sett á núverandi vegalengd viðmiðsins.

Hvítur staur með flaggi (14 m hár) merkir akkerið í *Stillt upp*-ham.

### Stilla upp {#lining-up}

| Aðgerð | Akkeri | Klukka |
|---|---|---|
| **Stilla upp hér** | þar sem viðmiðið er núna | óbreytt |
| Shift+smellur á gröfin | smellti metrinn | 1,5 s áður en viðmiðið nær honum |
| niðurstaða í *Hvar má bæta sig*, númerað merki á brautinni, röð í *Beygja fyrir beygju* með niðurstöðu | 40 m fyrir þar sem orsök niðurstöðunnar byrjar | 1,5 s áður en sá punktur er; síðan spilar |
| atvik í stýringu bíls, merki á höggi | 40 m fyrir atvikið | 1,5 s áður; síðan spilar |
| hringur í tölfræði brautar | eins og niðurstaða hans eða atvik | eins og að ofan, með þeim hring í brennidepli |

Að skoða niðurstöðu rammar hana líka inn með myndavélinni – kúla um miðju bils niðurstöðunnar, með radíus sem er það stærra af 40 m og helmingi lengdar hennar auk 30 m (60 m fyrir atvik) – nema myndavélin elti bíl.

### Eltingarmyndavél {#chase-camera}

⌖ í hringjalistanum lætur myndavélina elta þann bíl: 2,5 + 4 × stærð bíls metrar fyrir aftan hann og 0,9 + 1,1 × stærð bíls metrar fyrir ofan, horfir eftir akstursstefnu hans, hallað niður að bílnum, mýkt (20% af leiðinni í hverjum ramma) þannig að hún skjálfi ekki við hvern hnykk. ⌖ aftur sleppir henni. Bíllinn sem er eltur er dreginn aðeins ljósari, með hvítum hring á jörðinni, og spjald hans er auðkennt.

## Skjáhlutinn {#the-view-section}

| Stjórntæki | Sjálfgefið | Gerir |
|---|---|---|
| **Línur** / **Tímakort** / **Orsakakort** / **Mistakakort** | Tímakort | hvað er málað eftir brautinni (að neðan); *Línur* málar ekkert |
| skýring | - | *græðir ↔ tapar* fyrir tímakortið, orsakalitirnir fyrir orsakakortið, *fáir hringir ↔ flestir hringir* fyrir mistakakortið |
| **Eknar línur** | kveikt | lína hvers sýnilegs hrings í hans lit |
| **Bílar** | kveikt | bílarnir, og uppruni HUD-spjaldanna |
| **Dekk og fjöðrun** | kveikt | hitastig dekkja, rennihringir, fjöðrunarstangir og önnur tákn fyrir hvert hjól, og þakljós á bílunum |
| **Merkingar** | kveikt | heiti beygja, númeruð merki, merki högga, merki beygjanna á mistakakortinu |
| **Braut út frá hringjunum** | kveikt | vegyfirborð fyrir braut án útdreginnar gerðar (falið meðan brautarlíkan er hlaðin) |
| **Öll gildi á spjöldunum** | slökkt | hver rás skráð á hverju HUD-spjaldi |
| **Raunveruleg lögun bíla** | kveikt | hver bíll í lögun samsvarandi bíls (sjá [Bílar](#the-cars)); slökkt: opni einssætisbíllinn, sem felur ekkert af mælingunum |
| **Stærð bíla** | 1× | 1× til 10× í 0,5 skrefum; 1× er raunveruleg stærð bílsins, eins löng og breið og hann er í leiknum. Ekkert nema þessi rennistika breytir henni |

## Eknar línur {#driven-lines}

Leið hvers sýnilegs hrings í gegnum eigin sýni, í hans lit, teiknuð 0,12 m undir skráðri staðsetningu (skráð staðsetning bíls er viðmiðspunktur hans, 0,28 til 0,47 m yfir veginum á útdregnum Forza-brautum). Punktur er geymdur á 1,5 m fresti; með fleiri en 10 hringjum sýnilegum halda þeir hringir sem ekki er horft á einum punkti á 6 m fresti (hver hnútur fer á GPU í hverjum ramma).

## Kortin {#the-maps}

Öll þrjú eru bönd eftir **viðmiðsleiðinni**, 0,2 m undir skráðum staðsetningum, einn ferhyrningur fyrir hvert 2 m skref á ristinni.

### Tímakort (`where`) {#time-map-where}

Fyrir hringinn í brennidepli: sekúndur unnar eða tapaðar á metra miðað við hringinn sem hann er borinn saman við á þeim punkti (sá besti í sínum flokki, eða fyrir viðmiðið sá fljótasti annar hringur í gegnum hvern kafla), út frá breytingu samræddu deltunnar á hvert ristskref, sléttaðri yfir ±10 m. Rautt þar sem hann tapar tíma, grænt þar sem hann vinnur, grátt þar á milli; litakvarðinn er 95. hundraðshluti alginna gilda, þannig að toppar eru klipptir og flest allur hringurinn er innan sviðs. 6 m breiður.

### Orsakakort (`why`) {#cause-map-why}

Fyrir hringinn í brennidepli: sérhvert tap málað yfir bilið þar sem **orsökin** er (ekki þar sem tíminn sést), litað eftir hópi orsakarinnar, dýrasta niðurstaðan vinnur þar sem tvær skarast. Breidd `3 + 9·√(kostnaður / mesti kostnaður)` metrar; þar sem ekkert tapaðist, grár 2 m strimill. Niðurstaðan sem er valin í *Hvar má bæta sig* er máluð hvít.

| Hópur | Litur | Niðurstöður |
|---|---|---|
| bremsun | appelsínugult | tap ökumanns í bremsufasanum |
| innkeyrsla | magenta | tap ökumanns á leiðinni inn og í gegnum miðjuna |
| útkeyrsla | blátt | tap ökumanns á leiðinni út |
| beinn kafli | gult | tap ökumanns á beina kaflanum |
| bíll | grátt | það sem bíllinn skýrir |
| aðstæður | dökkgrátt | aðstæðurnar (keppnisræsing á móti hringja á ferð) |

### Mistakakort {#mistake-map}

Hversu margir af öllum hringjunum (af þeim flokkum sem valdir eru í tölfræði brautar) gerðu mistök á hverjum metra – af hvaða gerð sem er, eða aðeins þeirri sem valin er í tölfræðinni. Hver hringur telur einu sinni á hvern metra; bil hvers mistaks er víkkað um 6 m hvorum megin svo stutt mistök sjáist. Breidd `3 + 10·(hringir / flestir hringir)` metrar og litur frá dauflegu brúnu í bjartan appelsínugult; grátt 2 m þar sem enginn hringur gerði mistök. Sjá [Tölfræði brautar](race-course-statistics.md#the-mistake-map).

## Braut út frá hringjunum {#track-from-the-laps}

Fyrir leik sem brautin hefur ekki verið dregin út úr er vegur teiknaður undir línunum: jafnbreiður og hringirnir dreifast yfir viðmiðið (hliðarfrávik innan 25 m telja) auk 2 m hvorum megin, að minnsta kosti 4 m hvorum megin við viðmiðslínuna, sléttaður yfir ±8 ristpunkta (±16 m), í malbiksgráu með ljósum kantlínum, 0,3 m undir skráðum staðsetningum. Falinn meðan braut er hlaðin í **Borð**.

## Högg og árekstrar á brautinni {#hits-and-crashes-on-the-track}

Högg og árekstrar hvers sýnilegs hrings (sjá [Atburðir í stýringu bíls](race-control-events.md#hits-and-crashes)) eru merkt þar sem þau urðu, hvenær sem línur eða bílar eru teiknaðir: broddótt stjarna – rauð fyrir árekstur, gulbrún fyrir högg – sem stendur á staur, með hring í lit hringsins við fótinn, stærð eftir stærð bílsins (árekstrar stærri). Þegar bíll fer um augnablik höggs breiðist höggbylgjuhringur út frá því í 0,8 s.

## Hjálparhamur {#help-mode}

**?** við hliðina á tungumálaveljaranum, eða takkarnir **?** eða **F1**, kveikir á lykli að hverjum lit á skjánum, á öllum þremur flipunum ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Valið helst í þessum vafra.

- **Lykillinn** í horninu á sýninni listar litina fyrir flipann og hamin sem er í notkun. Hver litaskali kemur þaðan sem sýnin fær hann, þannig að hitaskali sem þú breyttir sýnir sig sem breyttur. Á kappakstursflipanum er aðeins það sem hlaðnir hringir bera skráð.
- **Spjald hvers bíls** fær töflu yfir það sem er teiknað á hjólunum hans, eftir heiti, með gildi hvers hjóls í þeim lit sem það er teiknað í.

- **Bíllinn í brennidepli** fær merki við hvert hjól sem segir það sama, sett út við hornin. Falið þegar bíllinn er of lítill á skjánum til að þau passi.

## Bílar {#the-cars}

**Hver bíll í sinni eigin lögun**, í lit hringsins og í raunverulegri stærð. Lögunin kemur úr bílaskrá, búinni til einu sinni á tölvunni sem leikurinn er á:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Án skrár er hver bíll teiknaður sem **eigin bíll skoðarans** af sinni gerð og tímabili: fólksbíll, coupé, hlaðbakur, station, sportbíll, ofurbíll, vöðvabíll, jeppi, pallbíll, sendibíll eða örbíll, hver sem klassík (fyrir 1980), frá 9. áratugnum eða níunda og tíunda, eða nútímalegur ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Þeir eru byggðir hér út frá almennum hlutföllum: engin merki, engin gerðarheiti og ekkert úr skrám neins leiks, þannig að þeir fylgja skoðaranum. Gerðin kemur af nafni bílsins, tímabilið af árinu í því; bíll án hvors tveggja fær flokk sinn. Um hundrað raunverulegar kynslóðir eru þekktar af útgefinni lengd, breidd, hæð og hjólhafi ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); ein lína hver, námundað), þannig að 3-línan frá 1990 fær stærð og stöðu þess bíls, enn sem venjulegt form án merkis eða grills.

Bílaskráin er búin til á þinni eigin tölvu úr þínu eigin eintaki af leiknum. Hún geymir lágupplausnarlíkan af hverjum bíl, um 900 þríhyrninga, með staðsetningu hjólanna (sjá [skipun útdráttarforritsins `cars`](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Hlaða bílaskrá...** í stillingum sýnarinnar, eða að sleppa skránni á kappakstursflipann, hleður henni; hún helst í þessum vafra. Hún geymir lögun leiksins, þannig að hana á ekki að dreifa, og skoðarinn fylgir engri.

Hvaða bíll stendur fyrir bíl hrings er reiknað út frá því sem er hlaðið í hvert skipti og aldrei geymt, þannig að bíll án hliðstæðu í dag fær sinn eigin um leið og nýrri skrá hefur hann ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Bíll hringsins | Teiknaður sem |
|---|---|
| númer hans er í skránni fyrir sama leik | þessi tiltekni bíll |
| sama framleiðandi, og orð úr gerðinni í nafninu | sú gerð, næst í árum |
| sami framleiðandi, sama kynslóð | bíll þess framleiðanda næstur í árum |
| annað, með bílaskrá | næsti bíll sama framleiðanda ef hann er til, annars sama tegund yfirbyggingar, næst í árum |
| opinn hjólabíll, eftir nafni | einssætisbíllinn hér að neðan |
| hvorki hið fyrra né annað, og skoðarinn þekkir bílinn á stærð hans | eigin bíll skoðarans í raunverulegri stærð þess bíls, með eða án skrár |
| annað án skrár | eigin bíll skoðarans af þeirri gerð og tímabili |

Þannig að hringur á 1990 BMW 3-línu úr öðrum leik birtist sem BMW frá um því ári, og bíll nýrri en skráin sýnir næsta skyldmenni sitt þar til skráin er gerð aftur. Vísbending hrings, og línan undir stærð bíls fyrir hringinn í brennidepli, segja hvernig hann er teiknaður og hversu nálægt það er.

Eigin bílar skoðarans hafa dökkar rúður. Líkön bílaskrár eru í einum lit allt yfir, því skráin hefur enga málningu eða gler að styðjast við. Hjólin, afturljósin, ljós og mælitákn fyrir fjarmælingar eru teiknuð eins og á einssætisbílnum; stangirnar fyrir fjöðrunina ganga upp utan á hjólinu, þar sem þær sjást, og armarnir eru látnir falla niður.

**Einssætisbíllinn** er opinn hjólabíll í lit hringsins, þannig að framendinn sést úr hvaða horni sem er og ekkert hylur hjólin: grind, vélarhlíf, hliðarlofttúður, stýrishús með hjálmi, hlíf yfir höfði, botn, framvængur og afturvængur; fjögur kringlótt hjól, framhjólin snúin af stýrinu (allt að 0,5 rad í fullu stýri), hvert á tveimur örmum með stýrisstöng (framan) eða drifskafti (aftan), og stöng fyrir fjöðrunina. Líkanið er lækkað um 0,3 m frá skráðri staðsetningu þannig að hjólin standi á veginum, og stækkað eða minnkað með **Stærð bíla**.

**Yfirbyggingin hreyfist á gormunum sínum**: þegar hringurinn ber allar fjórar fjöðrunarhreyfingarnar sígur hvert horn um sína hreyfingu (ýkt í 0,12 m frá fullri útsveiflu til fullrar inntaks svo það sjáist úr eltingarmyndavél), og yfirbyggingin sígur, hallar fram og aftur og veltist á fletinum í gegnum allt fjögur.

**Það sem er teiknað úr fjarmælingunum** (með *Dekk og fjöðrun* kveikt) fylgir [rásatöflunni](race-charts-and-hud.md#the-channel-table):

| Tákn | Úr | Teikning |
|---|---|---|
| litur dekks | `tireTemp` | dekkið sjálft, blátt kalt → blágrænt → grænt vinnandi → gult → rautt heitt, yfir 40-130 °C |
| rennihringur | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (það stærsta) | hringur á jörðinni undir hjólinu, grænn með grip í hendi, gulbrúnn við 0,66, rauður við 1 (brún gripsins eins og leikurinn skráir hana); daufur undir 0,3 |
| fjöðrunarstöng | `suspension` (0..1) | stöngin fyrir fjöðrunina lituð eftir hreyfingu: blá útþanin, hvít miðja, rauð þjöppuð |
| bremsuglóð | `brakeTemp` (100-900 °C) | diskur á ytri fleti hjólsins, dökkur í appelsínugulan |
| slitband | `tireWear` (0..1) | band um slitbrún slitlagsins, hvítt nýtt → rautt slitið |
| álagsstika | `wheelLoad` (0-12 000 N) | staur við hjólið jafnhár álaginu |

Bremsuljósin (regnljós og endaplötur vængs) kvikna með bremsupedalanum. Sérhver `lamp`-rás sem er á (yfir helmingi sviðs síns) kveikir ljós yfir loftinntakinu í sínum lit: ABS að virka, spólvörn að virka, DRS, hraðatakmarkari í bílskúr, handbremsa, í loftinu.

**Í þvögu** (fleiri en 10 sýnilegir) eru bílarnir sem ekki er horft á teiknaðir einfalt: yfirbygging, vængir, hjól og bremsuljós einungis.

## Merkingar {#labels}

Festar við brautina og settar í hvern ramma út frá vörpun myndavélarinnar (utan skjásins eða bak við myndavélina, faldar). Með **Merkingar** kveikt:

| Merki | Hvar | Smellur |
|---|---|---|
| heiti beygja (`T1`, `T2` …) | yfir apex hverrar beygju á viðmiðinu | - |
| númeruð merki 1-5 | fimm stærstu tap ökumanns hringsins í brennidepli, í miðju bils hverrar orsakar, með kanti í lit orsakarinnar; hafðu músina yfir fyrir titil og kostnað | stilla upp og endurspila þá niðurstöðu |
| merki högga / árekstra | yfir hverjum hnykk **hringsins í brennidepli**: „Árekstur −45 km/h“ / „Högg −12 km/h“; hafðu músina yfir fyrir alla lýsinguna og ábendinguna | stilla upp og endurspila höggið |
| merki beygja á mistakakortinu (í stað heita beygja og merkja þegar kortið er mistakakortið) | apex hverrar beygju: „T3 · 5/40 snemmbúin bremsun“ (algengasta mistakið, hringir sem gerðu það / hringir sem óku beygjuna), „T3 · 5/40“ þegar ein gerð er valin, „T3 · hreint“ þegar engin; hafðu músina yfir fyrir töp beygjunnar og fimm algengustu mistök hennar | opna eða loka þeirri beygju í tölfræði brautar |

## Speglaðir heimar {#mirrored-worlds}

Heimur skoðarans er hægri-handar með Y upp: séð ofan frá er bíll sem stefnir þannig að `atan2(dx, dz)` vex að beygja til vinstri. Leikur með vinstri-handar heim – Forza þar á meðal – kemur speglaður: sérhver beygja til hægri teiknuð sem beygja til vinstri, bæði braut og hringir.

Hringirnir segja það sjálfir ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): þegar hver hringur er genginn nokkra metra (3 m) í einu er beygjan á ferli hans borin saman við þjöppun yttri fjöðrunarinnar (`suspension.FR` mínus `suspension.FL`) og, án fjöðrunar, við stýrið (jákvætt til hægri í hverjum millistykki). Hringur sem beygir minna en π samtals segir ekkert; sönnunargögn telja þegar þau fara yfir 2% af beygjunni. Hringirnir greiða atkvæði; jafntefli er „get ekki sagt til um“.

Þegar niðurstaða hringjanna er ósammála núverandi snúningi ása (oddatala snúinna ása í **Myndavél og sena → Snúa heimsás við**), segir hlutinn **Hringir** það undir listanum:

- leikurinn er speglaður og ekkert er snúið: „Þessir hringir stýra til hægri þar sem brautin er teiknuð beygjast til vinstri …“ með **Snúa X við**;
- ásar eru snúnir en hringirnir eru ekki speglaðir: „Snúnu ásarnir teikna þessa hringi speglaða …“ með **Endurstilla ásana**.

Aðeins teikningin breytist – spegilmynd brotin inn í sýnisfylkið; gögnin, greiningin og öll hnit sem verkfærin sýna eru áfram leiksins eigin. Snúningurinn er geymdur í vafranum. Greiningin nefnir beygjur til vinstri eða hægri með sömu mælingu (heimur sem er óþekktur er talinn speglaður, eins og heimur Forza er).

## Forritarar {#for-developers}

Kóði: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Hvað bíll er á tilteknu augnabliki {#what-a-car-is-at-a-moment}

`stateAt` millifærir hverja rás á milli sýnanna tveggja í kringum tíma hringsins. Rásir sem stökkva (gír, fánar) taka næsta sýni. Hringur sem er lokið leggst við endamarkið.

**Stefna.** Akstursstefnan kemur af staðsetningum sem eru nokkra metra á milli (að minnsta kosti 2 m hvorum megin, þannig að hnykkur snúi ekki bílnum). Stefna yfirbyggingarinnar kemur af hefðbundnum snúningi leiksins aðeins þegar hann er felldur að akstursstefnunni – formerki og frávik, með hringmeðaltali yfir sýni hraðari en 10 m/s (að minnsta kosti 20) – og aðeins ef hann samþykkir hana þá (hringdreifing undir 0,05, um 18° dreifing); annars vísar yfirbyggingin eftir akstursstefnunni. Það heldur rennsli sýnilegu (yfirbygging og akstur sitt í hvoru lagi) án þess að treysta hornavenju leiks.

**Stýri og hliðar.** Hvaða leið jákvætt stýri snýr bílnum, og á hvorri hlið hjól hægri hliðar leiksins eru, er mælt út frá hringnum: stýrið á móti beygju ferilsins, og hvaða hlið fjöðrunarinnar þjappast saman á ytri hluta beygja (án fjöðrunargagna er Forza-leikjum talið speglað).
