---
title: "Myndavél og stýringar"
nav_order: 14
has_children: true
lang: "is"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Myndavél og stýringar

Þú flýgur um sviðið eins og fugl: **W A S D** til að hreyfa þig, dragðu músina til að líta í kring. Notaðu þessa síðu til að fljúga, til að stökkva í sýn ofan frá eða til hliðar, og til að lesa nákvæmlega hvar myndavélin er.

## Fljúgðu í 4 skrefum {#fly-in-4-steps}

1. Smelltu einu sinni á sýnina svo hún fái lyklaborðið.
2. Haltu inni **W** til að fljúga áfram, **S** aftur, **A** og **D** til hliðar, **Bil** upp, **Q** niður.
3. Haltu inni vinstri eða hægri músarhnappi og dragðu til að líta í kring.
4. Ýttu á **F** til að ramma inn gögnin aftur.

Myndavélin er frjáls myndavél með fjarvídd og samsíða vörpun, forstilltum sýnum, tilgreindri stöðu og dýptarskerpu. Stillingarnar eru í spjaldinu **Myndavél og sena** neðst á hliðarstikunni (birt líka í flipunum Kappakstursgreining og Leikur). Útfærslan er [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Flug {#flying}

| Inntak | Áhrif |
|---|---|
| `W` `A` `S` `D` eða örvatakkarnir | Áfram (eftir sýninni, þar með talinn hallinn), vinstri, aftur, hægri |
| `Space` eða `E` | Upp (upp í heimi) |
| `Q` eða vinstri `Ctrl` | Niður |
| `Shift` (haldið inni) | 6 sinnum hraðar |
| vinstri `Alt` (haldið inni) | 15% hraði |
| Drag með vinstri eða hægri músarhnappi | Líta í kring. Bendillinn er læstur meðan dregið er. |
| Músarhjól | Flughraði ×1,5 á hvern smell (fjarvídd); aðdráttur (samsíða) |
| `F` | Ramma inn gögnin |
| Smellur (án þess að draga) | Sýna hvað er undir bendlinum ([Skoða sýnina](#inspecting-the-view)) |
| `C` | Afrita stöðu myndavélarinnar, stefnuhorn og hallahorn |
| `G` | Fara á tilgreindan punkt |
| `Esc` | Loka valspjaldinu (og hætta að fylgja einingu) |

### Meðan fylgt er einingu {#while-following-a-unit}

Þegar myndavélin fylgir einingu í endurspilun ([Endurspilun leiks](match-replay.md)) gera flugtakkarnir annað:

| Inntak | Áhrif |
|---|---|
| Hjól, `W` / `S` | Nær einingunni / lengra frá henni (hærra / lægra í gervihnattarsýn) |
| `A` / `D`, `Q` / `E` | Hringsóla um einingu (elta- og hringsólusýn) |
| Drag | Líta í kring um einingu (stjórnklefi: líta um innan hans) |
| `V` / `Shift+V` | Næsta / fyrri sýn myndavélar |
| `Esc` | Hætta að horfa á seinni eininguna fyrst, og síðan hætta að fylgja |

Hreyfitakkarnir leggjast saman við [leikjafjarstýringu](gamepad.md); sjá [lyklaborðsyfirlitið](keyboard-reference.md) fyrir allt annað. Takkarnir eru hunsaðir meðan textareitur eða fellilisti hefur fókus. Hallinn er takmarkaður rétt undir beint upp og niður.

## Spjaldið Myndavél og sena {#camera--scene-panel}

![Spjaldið Myndavél og sena: Vörpun, forstilltar sýnir, hnappar fyrir sjónsvið, Flughraði og Staða](../assets/img/en/camera-panel.webp)

### Vörpun {#projection}

**Vörpun**: *Fjarvídd* (sjálfgefið) eða *Samsíða*.

*Samsíða* (hornrétt vörpun) fjarlægir styttingu, svo að tveir reitir af jöfnum þéttleika sýnast jafnstórir hvar sem er í myndinni - samanburðurinn sem hitakort korts er gert fyrir - og það er það sem gerir ísómetríska sýn að ísómetrískri. Í samsíða ham aðdregur músarhjólið (það er engin hreyfing áfram sem breytir kvarðanum) og [hraðasýningin](#fly-speed) er falin.

**Skipting heldur viðfanginu jafnstóru.** Samsíða vörpun hefur ekkert sjónsvið, svo rúmmálshæð hennar tengist ekki fjarlægð myndavélarinnar; ef henni er bara snúið við zoomar hún óstjórnlega eða sýnir ekkert. Þegar farið er í samsíða er rúmmálshæðin stillt á það sem fjarvíddar myndavélin nær yfir í fókusfjarlægð (2 × fjarlægð × tan(fov / 2), þar sem fókusfjarlægðin er fjarlægðin í síðustu rammainnfellingu). Þegar farið er til baka er fjarvíddarstaðan sem þú yfirgafst endurheimt, í sama sýnilega kvarða, í stað þess sem samsíða sýnin rataði á.

### Forstilltar sýnir {#preset-views}

| Hópur | Hnappar | Stefna |
|---|---|---|
| **Ísómetrískt** | **NA**, **NV**, **SA**, **SV** | Samsíða, halli -35,264° (= atan(1/√2), hornið þar sem allir þrír ásar varpast í sömu lengd), stefnuhorn -45°, 45°, -135°, 135°. Fjögur horn, því að eitt horn fela alltaf helming kortsins á bak við það sem er nær. |
| **Hliðarsýnir** | **Ofan**, **Neðan**, **Framan**, **Aftan**, **Vinstri**, **Hægri** | Samsíða. Ofan horfir beint niður (halli -89,9°), Neðan beint upp, Framan eftir -Z (stefnuhorn 0°), Aftan eftir +Z (180°), Vinstri eftir -X (-90°), Hægri eftir +X (90°). |
| | **Aftur í fjarvídd** | Snýr aftur í fjarvíddarstöðuna sem þú yfirgafst. Óvirkt í fjarvídd. |
| | **Sýn á ská** | Fjarvídd, stefnuhorn -35°, halli -28°. |

Sérhver forstilling skiptir sjálfri vörpuninni - í fjarvídd hverfur „sýn ofan frá“ enn að hverfipunkti og jafnir flatarmálar hætta að sýnast jafnir - og rammar gögnin inn frá þeirri stefnu.

### Sjónsvið {#field-of-view}

**Sjónsvið** - lóðrétta hornið. Sjálfgefið 65°, 10-140° á sleðanum (179° með handfanginu), með hnöppunum **Flatt 20°**, **Langt 35°**, **Venjulegt 50°**, **Vítt 65°**, **Mjög vítt 90°**. Þröngt flatar fjarvíddina og líkist meira samsíða vörpun; vítt ýkir dýpt og gerir fjarlægðir erfiðar að meta. Það er líka lifandi í samsíða ham, þar sem það stillir kvarðann sem skiptingin leysir úr og fjarlægðina sem **Ramma inn** notar.

### Flughraði {#fly-speed}

**Flughraði** - heimseiningar (metrar) á sekúndu á fullri inngjöf. Sjálfgefið 120; við hverja hleðslu er það lárétt útbreiðsla gagnanna / 12. Logaritmískt, 0,02-20.000 (200.000 með handfanginu; handfangið breytir honum eftir hlutföllum, ekki í skrefum). Músarhjólið margfaldar eða deilir honum með 1,5 á hvern smell, innan 0,02-200.000.

Sama gildi er sýnt neðst til hægri á sýninni (aðeins í fjarvídd): hraðinn í m/s eða km/s og tíminn sem tekur að fara yfir gögnin (eða borðið, þegar 3D borð er hlaðið) á þeim hraða. Dragðu það upp eða niður til að breyta hraðanum.

### Nær og fjær {#near-and-far}

**Nær** (sjálfgefið 0,5) og **Fjær** (sjálfgefið 40.000) eru skurðfjarlægðir. Báðar eru reiknaðar út frá gögnunum við hverja hleðslu (nær = max(0,05, útbreiðsla / 20.000), fjær = útbreiðsla × 12) og víkkaðar, aldrei þrengdar, af 3D borði sem er stærra ([Borð](levels.md#what-a-level-does-for-the-heat)). Hlutfall þeirra ákvarðar dýptarnákvæmnina sem huldun reiðir sig á, svo lítið nær og risastórt fjær veikir [huldun](depth-and-culling.md). Séð utan sviðsins eða hátt yfir jörðinni þess færist fleturinn sem er í raun notaður fyrir nær út í 2% af þeirri fjarlægð, svo að kort séð að ofan heldur nægri dýptarnákvæmni svo að vatn og strönd blikki ekki; kassinn sýnir samt gildið sem stillt var.

### Aðrar stillingar {#other-controls}

| Stilling | Sjálfgefið | Merking |
|---|---|---|
| **Snúa Y við** | slökkt | Snýr músarstýringu upp/niður við. |
| **Dýptarskerpa** | slökkt | Sjá hér að neðan. |
| **Leikjafjarstýring** | virkt | Sjá [Leikjafjarstýring og HOTAS](gamepad.md). |
| **Staða** | | Sjá hér að neðan. |
| **Skoða** | | Lestur myndavélar, smellival, stefnuhornsvenjan og *Fara á punkt*; sjá [Skoða sýnina](#inspecting-the-view). |
| **Ramma inn gagnasafn (F)** | | Fellir gögnin (í flipanum Kappakstursgreining: hringina) að sýninni og heldur núverandi stefnu. Myndavélin er sett í r / tan(fov / 2) frá miðjunni, þar sem r er helmingur hornalínu marka gagnanna. |
| **Hnitanet**, **Ásar** | kveikt, kveikt | Jarðarnet með bili 1/2/5 × 10ⁿ, um 1/40 af útbreiðslu gagnanna (nær út í 1,5 × gögnin, á milli 8 og 120 netreita), og litaðir ásar. |
| **Snúa heimsás við** X, Y, Z | slökkt | Sjá hér að neðan. |

### Staða {#pose}

Fimm talnareitir - **X**, **Y**, **Z** og **stefnuhorn °**, **hallahorn °** - sem fylgja myndavélinni meðan enginn þeirra hefur fókus. Skrifaðu gildi og ýttu á `Enter` (eða farðu úr reitnum) til að færa myndavélina þangað. **afrita** setur `pos X Y Z · yaw A · pitch B` á klippiborðið (með `(game yaw)` á eftir þegar sú venja er valin). Flug er það sem þú notar til að kanna; hnit eru það sem þú notar til að endurskapa sýn. Þetta eru sömu tölur og [lestur myndavélar](#camera-readout): eigin hnit gagnanna, líka þegar ás er snúið við, og stefnuhornið í völdu [venjunni](#yaw-conventions).

### Snúa heimsás við {#invert-world-axis}

**Snúa heimsás X / Y / Z við** teiknar heiminn með þeim ási snúið við. Leikur sem heldur vinstrihenda heimi kemur spegluðum út í þessum hægrihenda skoðara - hægri beygjur teiknaðar sem vinstri beygjur - og að snúa X eða Z við setur það aftur rétt. **Aðeins teikningin breytist**: gögnin, greiningin og öll hnit sem verkfærin sýna (staða, mælistika, sneið) eru áfram eigin hnit leiksins. Sýnin snýst á staðnum og heldur þér að horfa á sama stað. Þessi stilling er vistuð í vafranum (`localStorage`-lykillinn `heat3d.mirror`); berðu hana saman við [snúninga](axes-units-and-time.md#flips) við hleðslu, sem breyta gögnunum.

## Skoða sýnina {#inspecting-the-view}

Hvar myndavélin er, hvað er undir bendlinum, og að fara á punkt - **Skoða**-blokkin í spjaldinu Myndavél og sena, og tveir yfirlitsgluggar efst til vinstri á sýninni. Kóðinn er í [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) og [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Stilling | Sjálfgefið | Merking |
|---|---|---|
| **Staða myndavélar yfir sýninni** | kveikt | Lestur myndavélar, hér að neðan. Einnig lokað með **×**. |
| **Smellur sýnir hvað er þar** | kveikt | Smellival, hér að neðan. |
| **Venja stefnuhorns** | Skoðari | Hvaða stefnuhorn lesturinn, stöðureitirnir og stökkreiturinn sýna og lesa. |

Þessar þrjár eru vistaðar í vafranum (`localStorage`-lykillinn `heat3d.inspect`).

### Lestur myndavélar {#camera-readout}

Efst til vinstri á sýninni: **x**, **y**, **z**, **stefnuhorn** og **hallahorn** myndavélarinnar, í beinni, með merki sem nefnir venju stefnuhornsins. Hún sýnir sömu tölur og [Staða](#pose)-reitirnir og kostar ekkert meðan flogið er (hún er skrifuð á síðuna á rammaklukkunni, án þess að endurteikna spjöldin).

- **afrita** (eða `C` hvar sem er utan textareits) setur `x X y Y z Z yaw A pitch B (viewer yaw)` á klippiborðið, með `.` sem aukastafaskilju hvaða tungumál sem er - lína sem stökkreiturinn, og sérhvert skriftuforrit, les aftur.
- **fara á** (eða `G`) opnar reit undir henni: límdu punkt og ýttu á `Enter` til að líta á hann, eða límdu heila afritaða stöðu til að standa í þeirri sýn. `Esc` lokar reitnum.

### Hnit: eigin rammi gagnanna {#coordinates-the-datas-own-frame}

Sérhvert hnit sem skoðunarverkfærin sýna eða taka við er í **eigin ramma hlaðinna gagna**: [ásaskiptin](axes-units-and-time.md) við hleðsluna (lóðréttur ás, snúningar, skali) eru afturkölluð. Staða sem lesin er af sýninni er talan sem uppsprettutaflan geymir, og tala úr töflunni sem slegin er inn í stökkreitinn lendir á þeim stað. Þegar skiptingin breytir engu (Y-upp, óskalin hleðsla - sem er það sem upptökutólin og borðaútflytjendur skrifa) er þetta einfaldlega heimurinn; annars ber lesturinn merki um **gagnaramma**. Án gagnasafns eru hnit heimshnit. Stefnuhorn og hallahorn eru alltaf miðuð við heim skoðarans, með Y upp.

### Stefnuhornsvenjur {#yaw-conventions}

| Venja | Stefnuhorn 0° horfir eftir | Vex í átt að | Notuð af |
|---|---|---|---|
| **Skoðari** | -Z | -X | frjálsu myndavélinni, [forstilltum sýnum](#preset-views) |
| **Leikur / upptökutól** | +X | -Z | `yaw`-dálkum og stöðum upptökutólanna; í borði sem er flutt út í ramma skoðarans, eigin stefnuhorn leiksins |

Hallahorn er það sama í báðum: upp frá láréttu. Þau tvö eru ólík um fjórðung úr hring og ekkert annað:

> stefnuhorn skoðara = stefnuhorn leiks - 90°

Stefna `d` er `(cos p · cos y, sin p, -cos p · sin y)` í venju leiksins og `(-sin y · cos p, sin p, -cos y · cos p)` í venju skoðarans. Veldu **Leikur / upptökutól** til að slá stefnuhorn beint úr upptökutöflu, eða til að bera lesturinn saman við eitt slíkt.

### Að fara á punkt {#going-to-a-point}

**Fara á punkt**, í Skoða-blokkinni (og reitnum **fara á** í lestrinum):

- textareiturinn tekur `x, y, z` eða `x y z` (eða `x; y; z`), með aukastafapunkti eða aukastafakommu - `-321.6, 137.8, -59.9` og `-321,6 137,8 -59,9` eru sami punktur. Fimm tölur bæta við stefnuhorni og hallahorni, og staða sem afrituð er úr lestrinum eða stöðureitunum er lesin í heild, með merkjum og venju;
- **stefnuhorn °** og **hallahorn °** (valfrjálst) snúa myndavélinni, í völdu venjunni;
- **Horfa á** heldur stefnunni (hallað til að líta niður að minnsta kosti 20° ef hún horfði lárétt) og bakkar eftir henni í núverandi fjarlægð, haldið á milli 0,3% og 3% af breidd sviðsins - 6 til 60 m á tveggja kílómetra borði. Fókusfjarlægðin, rúmmálshæð samsíða sýnar og flughraði fylgja, svo að sýnin verður nothæf við komu;
- **Standa hér** setur myndavélina á punktinn, snúna í tilgreint stefnuhorn og hallahorn, eða eins og hún var.

Límd staða með eigið stefnuhorn og hallahorn stendur alltaf í þeirri sýn.

### Smellival {#click-to-pick}

Smellur á sýnina - ýtt niður og sleppt án þess að draga meira en 4 pixla; drag lítur enn í kring - sýnir spjald efst til vinstri með því sem er undir bendlinum. Meðan [mælistikan](measure.md) er kveikt fara smellir til mælistikunnar í staðinn.

**Teiknaður gagnapunktur vinnur.** Næsta sýni innan 8 pixla frá smellinum, af þeim sem raunverulega eru teiknuð: línurnar í tímagluggnum og líftímanum, sem standast [síurnar](filters.md), hóparnir sem eru sýndir, og skiptingin á mismuninum, innan fjarlægðarskurðarins og sneiðar sem klippir hitann. Í kassaendurspilun, kassi undir bendlinum (hvar sem er á honum). Spjaldið telur upp hvern dálk sem línan ber, undir eigin dálkaheitum uppsprettunnar - tími (veggklukka, eða sekúndur skrárinnar sjálfrar með `m:ss.ss`), persóna, hópur, seta, hvern varðveittan dálk, staðsetninguna og stefnuna sem horft er í - og fjarlægðina frá myndavélinni. Aðeins dálkar sem hleðslan geymdi eru í minni: dálkur sem ekki var valinn sem [síudálkur](column-mapping.md) er ekki sýndur.

**Annars yfirborð borðsins**: punkturinn þar sem geisli smellsins mætir raunverulegum þríhyrningum borðsins (ekki viðmiðsfleti mælistikunnar), með **hluta** sem hann tilheyrir (heiti útflytjandans, `structure:props`, `ground:terrain …`), **tegund** hans (jörð, mannvirki, vatn, kortamynd), hnitin og fjarlægðin. Rúmfræði sem sneið eða fjarlægðarskurðurinn felur er látin fara í gegn. Þar sem borðið hefur [leiðsögunet](model-levels.md#navigation-meshes) nefnir lína það og segir hvort staðurinn liggur á því (✓). Hlutaheiti með forskeytinu `≈` var giskað út frá afmörkunarkössum hlutanna, því að sá hluti borðsins var einfaldaður við hleðslu.

Spjaldið stendur þar til það er lokað (**×**, `Esc`), annar smellur svarar einhverju öðru, eða smellt er á tómt rými. Blágrænt kross er teiknaður á punktinn í senunni og hringur yfir honum á skjánum. Hnappar þess: **afrita** (hvert gildi, og hnitin sem `x, y, z`), **Horfa á**, og **Standa hér** (á gagnapunkti, horft í þá átt sem línan horfði þegar hún hefur stefnu; á yfirborði, 1,7 m ofan við það).

Borðið er skráð fyrir smellival við fyrsta smellinn sem þarf á því: rist af dálkum yfir fótspori þess, smíðuð nokkrar millisekúndur í einu milli ramma svo að sýnin stoppi aldrei (um sekúnda vinnu fyrir borð með nokkrar milljónir þríhyrninga), og geymd þar til borðið breytist. Þangað til segir spjaldið *Undirbý borðið fyrir smellival* með prósentu, og svarar smellinum þegar það er tilbúið. Leit að gagnapunkti yfir meira en fjórar milljónir teiknaðra lína er dreifð yfir ramma á sama hátt.

## Dýptarskerpa {#depth-of-field}

Samanfellanlegur hluti í Myndavél og sena, með titlinum *Dýptarskerpa - kveikt* meðan hún er virk. Slökkt sem sjálfgefið: þetta er framsetningaráhrif, og sjálfgefna sýnin á að sýna gögnin en ekki túlkun á þeim.

| Stilling | Sjálfgefið | Svið (hnykkur) | Merking |
|---|---|---|---|
| **Virkt** | slökkt | | |
| **Fókus á það sem var rammað inn** | kveikt | | Fókus á þeirri fjarlægð sem síðasta rammainnfelling notaði (*Fókus á N m.*). |
| **Fókusfjarlægð** | 1000 | 1-200.000, logaritmískt (10.000.000) | Sýnd þegar fókusinn er handvirkur. |
| **Ljósop** | ±35% | ±2% til ±200%, logaritmískt (±3200%) | Dýptin sem er áfram skörp, sem brot af fókusfjarlægðinni - hlutfallslegt en ekki f-tala, því að senur spanna frá herbergi upp í átta kílómetra kort. |
| **Hámarksóskýrleiki** | 12 px | 1-48 (256) | Mesti óskýrleikaradíus; kostnaðurinn vex með honum. |

Hún gerir **borðið, netið og kassana** óskýr - *ekki hitann*. Hiti í pixli er summa spjalda á mörgum dýptum, svo hann hefur enga eina dýpt til að vera úr fókus á; að gera hann óskýran eftir því hvaða rúmfræði liggur á bak við hann væri rangt hvar sem hann svífur fyrir framan. Skörp gögn yfir mýktu samhengi eru líka gagnlegri af þeim tveimur. Óskýrleikinn er 24 punkta samsöfnun í gullnu horni í samsetningarskrefinu, vegin svo að skarpur forgrunnur smitist ekki út á við af óskýra bakgrunninum á bak við hann. Breyting á henni teiknar aftur án þess að endurræsa uppsöfnun hitans.

## Upplausn striga {#canvas-resolution}

Strigann er teiknaður í pixlahlutfalli skjásins, takmarkað við 2. Hitabuffarinn getur verið teiknaður í lægri upplausn en það ([Upplausn hita](performance-and-stats.md)).

## Síður í þessum kafla {#pages-in-this-section}

- [Leikjafjarstýring og HOTAS](gamepad.md)
- [Lyklaborðs- og músarhandbók](keyboard-reference.md)
