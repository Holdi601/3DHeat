---
title: "Statistikat e pistës"
parent: "Analiza e garës"
nav_order: 57
lang: "sq"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Statistikat e pistës

Ngarkoni shumë xhiro të një piste dhe shikuesi numëron gabimet: cila kthesë kushton më shumë kohë, sa nga xhirot shkuan keq aty, dhe pse. Përdoreni për të gjetur kthesën që vlen të stërvitesh.

Provojeni: **Xhiro demo** jep tre xhiro, mjaftueshëm që ky seksion të shfaqet.

![Statistikat e pistës me hartën e gabimeve: pista e lyer sipas sa xhiro humbën kohë në çdo kthesë, dhe lista e kthesave](../assets/img/en/race-course-mistake-map.webp)

Ngarkoni dosjen e plotë të një piste - dhjetëra xhiro, disa makina, disa klasa performance - dhe çdo xhiro gjykohet, pastaj numërohet. Kjo faqe mbulon krahasimin sipas klasës, çfarë llogaritet si gabim, seksionin **Statistikat e pistës**, hartën e gabimeve, eksportimin në hartën e nxehtësisë, pista nga disa gara, dhe kufijtë e performancës me shumë xhiro.

## Kundër më të miri të klasës së vet {#against-the-best-of-its-own-class}

Një xhiro krahasohet kthesë pas kthese me **xhiron më të shpejtë të plotë të
klasës së vet të performancës** (referenca, në klasën e referencës); xhiron
vetë me atë nga klasa e vet që ishte më e shpejtë në çdo kthesë, ose me çdo
xhiro kur është e vetme në klasën e vet. Makinat grupohen sipas klasës së
performancës të lojës (në Forza, nga D deri në X; C dhe S2 janë dy prej tyre).
Pika e frenimit e një makine klasë C krahasuar me atë të një makine S2 nuk
thotë asgjë për vozitjen. Harta e kohës, hendekët në listën e xhiros dhe tabela
*Kthesë pas kthese* ndjekin të njëjtin krahasim (shih [me kë krahasohet secila
xhiro](race-corner-analysis.md#who-each-lap-is-compared-with)).

Statistikat ndërtohen mbi analizën e çdo xhiro, jo përkrah saj.

## Çfarë llogaritet si gabim {#what-counts-as-a-mistake}

Një **rast** është gabimi i një xhiro në një kthesë (segment). Gabimet e një
xhiro në një kthesë janë:

1. **Shkaku i vozitjes** që analiza gjeti për humbjen e saj aty - një gjetje që
   është humbje, e atribuar vozitësit (jo makinës ose situatës), që kushton
   **0.05 s** ose më shumë krahasuar me xhiron e krahasimit. Kostoja e saj është
   humbja e kthesës.
2. **Çdo gabim i kontrollit të makinës** që bëri aty dhe që xhiro tjetër nuk e bëri
   (të pandarë), që kushton **0.03 s** ose më shumë - bllokim, rrotullim i kotë,
   prapa që del jashtë, shtytje, rrotullim (spin). Kostoja e saj është e ngjarjes
   vetë.
3. **Çdo goditje dhe përplasje**, të ndara ose jo, sado që kushtoi.

Një kthesë mund të mbajë disa; çdo lloj numërohet **një herë për xhiro dhe
kthesë**. Fitimet, pjesa e makinës dhe një mbërritje më e ngadaltë e vendosur
në kthesën para nuk janë gabime.

### Nga gjetjet te gabimet {#from-findings-to-mistakes}

| Gjetja | Gabimi |
|---|---|
| shumë shpejt në hyrje, ngadalë në dalje, nga frenimi më vonë se tjetra me disa metra | Frenoi shumë vonë |
| frenoi herët | Frenoi shumë herët |
| frenoi butë | Frenoi shumë butë |
| një bllokim si shkak | Bllokoi një rrotë |
| u lëshua gazi | Lëshoi gazin |
| mbetet aderencë, më ngadalë deri te maja, frenoi aty ku tjetra vetëm e lëshoi gazin | Shumë ngadalë në mes |
| një linjë shumë e ngushtë | Linjë shumë e ngushtë |
| u shty jashtë | U shty jashtë |
| ektheu makinën më pak / shumë | Ektheu makinën gabim |
| gazi në dalje më vonë, gaz i plotë më vonë, u hezitua | Gazi vonë |
| më ngadalë në dalje nga kthesa | Më ngadalë në dalje |
| rrotullim i kotë i rrotave | Rrotullim i kotë |
| prapa u largua, anash në mes | Prapa doli jashtë |
| doli jashtë rrugës | Doli jashtë |
| shpejtësia u fshi | Shpejtësia u fshi |
| u lëshua (në hyrje, ose në drejtëz) | U lëshua |
| pothuajse ndaloi, rrotullim, goditje ose përplasje si shkak | Rrotullua / Goditi diçka / U përplas kur ngjarjet e xhiros aty thonë kështu (përplasja e pari, pastaj rrotullimi, pastaj goditja); përndryshe Pothuajse ndaloi |
| një fluturim më i gjatë | Fluturoi shumë larg |

Dy modelet numërohen si shkaku që gjendet brenda tyre, sipas së njëjtës tabelë.
*Humbi më tepër në hyrje sesa rimori dalja* është gabimi i shkakut të hyrjes së
vet: frenimi herët është *Frenoi shumë herët*, një bllokim *Bllokoi një rrotë*,
lëshimi i gazit *Lëshoi gazin*, aderenca e pashfrytëzuar *Shumë ngadalë në mes*.
*Shumë shpejt në hyrje, ngadalë në dalje* është *Frenoi shumë vonë* kur xhiro
frenoi më vonë se tjetra; përndryshe gabimi i shkakut të daljes së tij - *Gazi
vonë*, *Rrotullim i kotë*, *Prapa doli jashtë*, *Doli jashtë*, *Më ngadalë në
dalje*. Një model shkaku i të cilit është i makinës, ose një mbërritje më e
ngadaltë, nuk numërohet.

Nuk numërohet: mbërritja më e ngadaltë, nisja, çdo gjetje e *makinës* (tërheqja,
aderenca, frenat, drejtimi) dhe çdo fitim ose kthesë e nivelit.

### Llojet, sipas radhës së tyre {#the-kinds-in-their-order}

Frenimi: *Frenoi shumë vonë*, *Frenoi shumë herët*, *Frenoi shumë butë*, *Bllokoi
një rrotë*. Hyrja: *Lëshoi gazin*, *Shumë ngadalë në mes*, *Linjë shumë e
ngushtë*, *U shty jashtë*, *Ektheu makinën gabim*. Dalja: *Gazi vonë*, *Më
ngadalë në dalje*, *Rrotullim i kotë*, *Prapa doli jashtë*, *Doli jashtë*,
*Shpejtësia u fshi*. Drejtëza: *U lëshua*. Incidentet: *Rrotullua*, *Goditi
diçka*, *U përplas*, *Pothuajse ndaloi*, *Fluturoi shumë larg*.


## Seksioni Statistikat e pistës {#the-course-statistics-section}

Shfaqet nga **3** xhiro e tutje, midis **Xhirot** dhe **Ku të përmirësohesh**.

- **Përmbledhja**: "40 xhiro në 9 makina, 3 klasa: çdo kthesë gjykohet kthesë pas
  kthese kundrejt xhiros më të shpejtë të klasës së vet." (makinat numërohen sipas
  numrit të makinës, ose sipas emrit).
- **Çipat e klasave** (kur ka disa klasa): **Të gjitha** dhe një çip për çdo klasë,
  secili me numrin e xhiros së vet, sipas radhës së lojës (D, C, B, A, S1, S2, R, X,
  pastaj të tjerat). Klikoni një klasë për xhirot e saj vetëm; **Shift+klik** shton ose
  heq një. Gjithçka më poshtë - listat, harta, eksportimi në hartën e nxehtësisë -
  ndjek klasat e zgjedhura.
- **Çfarë shkon keq më shpesh**: çdo lloj gabimi, me xhirot më të shumta të parat (pastaj
  më shumë herë, pastaj më shumë kosto), deri në 8 të tilla (**Të gjitha N llojet** shfaq
  pjesën tjetër, **Më pak** i fshehin përsëri). Çdo rresht: emri i tij, "N nga M xhiro",
  një shirit i kësaj pjese, dhe "K herë · rreth X s · më shumë në T3 (5), T7 (4), T1 (2)" -
  sa shpesh u bë (xhiro për kthesë), sa kushtoi gjithsej, dhe tri kthesat ku
  shumica e xhirove e bënë. **Klikoni një rresht** për ta shfaqur në hartën e gabimeve
  (dhe ta ndezni hartën); klikoni përsëri për çdo gabim.
- **Kthesë pas kthese** (ose *Kthesë pas kthese - <gabimi>* kur zgjidhet një): për çdo
  segment, "N nga M humbën kohë · X s" - xhiro që e kaluan gjithë kthesën, ato që
  humbën **0.05 s** ose më shumë aty kundrejt më të mirit të klasës së tyre, dhe gjithë
  kohën që humbën. E palosur, liston tre gabimet e saj më të shpeshta me numrin e
  xhirove. **Klikoni një kthesë** për ta hapur, ta kornizoni me kamerën dhe ta kaloni
  në hartën e gabimeve: për çdo gabim (ose vetëm atë të zgjedhurin) një rresht si "12 nga
  40 xhiro frenuan shumë herët këtu. Në 9 makina të ndryshme - rreth 0.21 s secila." dhe
  xhirot që e bënë, **më të keqet e para**, secila me kostonë e vet - deri në 8, "+N
  të tjera" për pjesën tjetër. **Klikoni një xhiro** për ta fokusuar dhe për ta riluajtur
  atë gabim (e vendosur 40 m para tij).
- **Shfaq në hartën e nxehtësisë**: shih më poshtë. "Duke ndërtuar hartën e nxehtësisë…"
  ndërsa punon; i çaktivizuar kur nuk ka gabime.

## Harta e gabimeve {#the-mistake-map}

**Pamja → Harta e gabimeve** vizaton përgjatë shtegut të referencës sa nga xhiro
(të klasave të zgjedhura) bënë gabim në çdo metër - nga çdo lloj, ose ai i zgjedhur
te statistikat. Çdo xhiro numërohet një herë për metër; diapazoni i çdo rasti (ku
ishte shkaku ose ngjarja e tij) zgjerohet me 6 m nga secila anë, që një i shkurtër
të duket. Më i gjerë dhe më i ndritshëm aty ku bënë më shumë xhiro: gjerësia
`3 + 10 · (xhiro këtu / xhiro më të shumta kudo)` metra, ngjyra nga kafe e zbehtë
deri portokalli i ndritshëm; një shirit gri 2 m aty ku s'bëri askush. Legjenda:
*pak xhiro ↔ më shumë xhiro*.

Me **Etiketat** të ndezura, maja e çdo kthese mban gabimin e vet më të shpeshtë:
"T3 · 12/40 frenim i herët" (xhiro që e bënë / xhiro që e kaluan kthesën), "T3 · 12/40"
me një lloj të zgjedhur, "T3 · pa gabime" me asnjë. Kalimi i miut mbi një etiketë liston
humbjet e kthesës dhe pesë gabimet e saj më të shpeshta; klikimi e hap ose mbyll atë
kthesë te statistikat.

## Shfaq në hartën e nxehtësisë {#show-in-the-heatmap}

**Shfaq në hartën e nxehtësisë** ia jep të njëjtën skedës së hartës së nxehtësisë si
grup të dhënash me emrin "Gabime në <pista>" (ose "Gabime në pistë"), që i tërë
grupi i mjeteve të hartës së nxehtësisë - mënyrat e nxehtësisë, filtrat, kronologjia,
prerja - të punojë mbi vendin ku xhirot shkojnë keq.

Është një CSV i ndërtuar në memorie (`mistakeTable`), një rresht për çdo pikë rrjete
(çdo 2 m) të çdo rasti, te **pozicioni i vetë xhiros** atje:

| Kolona | Përmbajtja |
|---|---|
| `x`, `y`, `z` | pozicioni i xhiros në atë metër (koordinatat e lojës) |
| `elapsed` | koha e xhiros atje, s |
| `lap` | etiketa e xhiros |
| `car` | emri i makinës (ose "car 1234") |
| `mistake` | emri i gabimit, në gjuhën aktuale |
| `car_class` | klasa, `-` kur nuk ka |
| `corner` | etiketa e kthesës, `T3` |
| `cost` | kostoja e rastit, s |

Ngarkohet përmes ngarkuesit vetjak të hartës së nxehtësisë me sugjerime hartëzimi:
Y lart, pa kthim boshtesh, shkallë 1; koha `elapsed` në sekonda; **person** = `car`,
**group** = `mistake`, **session** = `lap`; pa drejtim shikimi; `car_class`, `corner`
dhe `cost` mbahen si kolona filtrimi. Skeda kalon pastaj te **Harta e nxehtësisë** dhe e
kornizon të dhënat. Eksportohen vetëm klasat e zgjedhura te statistikat.

## Pista nga disa gara {#courses-from-several-tracks}

Xhirot analizohen **një pistë në një herë**. Një dosje që mban xhiro të disa pistave -
gjithë biblioteka e xhirove - ofron secilën pistë të ngarkohet veç e veç (me numrin e
xhirove të saj, më të shumtat e para); xhirot e garave që nuk u mbaruan (`unfinished/`
i FH Companion) shkojnë me pistën e tyre, të shënuara *të pjesshme*. Xhirot e disa
pistave me emër të zgjedhura si skedarë ofrohen po kështu, ndërsa xhirot pa emër pisteje
shkojnë me atë që është zgjedhur. Ngarkimi i xhirove të një piste tjetër me emër nga ato
të ngarkuara i zëvendëson ato. Detaje:
[Ngarkimi i xhirove](race-loading-laps.md#folders-and-courses).

## Performanca me shumë xhiro {#performance-with-many-laps}

Dhjetëra xhiro analizohen në një ose dy sekonda (të gjitha, gjithmonë). Ajo që vizatohet
kufizohet që pamja të mbetet në shpejtësinë e kornizës:

| Kufiri | Vlera | Efekti |
|---|---|---|
| xhiro të vizatuara si parazgjedhje | 8 (`SHOW_ALL_UP_TO`) | pas 8 xhiroje të ngarkuara, xhirot e reja të shtuara fshihen, përveç nëse janë referenca, xhiroja e fokusuar ose më e mira e klasës së vet. **Shfaq të gjitha** vizaton çdo xhiro; **Vetëm ato që shihen** kthehet mbrapa. Fokusimi i një xhiroje e zbulon atë dhe më të mirën e klasës së vet |
| makina të thjeshta dhe vija të holla | mbi 10 të dukshme (`PLAIN_PAST`) | xhirot përveç fokusit, makinës së ndjekur dhe referencës: një pikë vije çdo 6 m (në vend të 1.5 m), makinat e vizatuara të thjeshta |
| xhiro në grafik | 8 (`CHART_LAPS`) | fokusi, më i miri i klasës së tij dhe referenca të parat; "+N të tjera të vizatuara, jo në grafik" |
| kartat e HUD | 6 | gjashtë xhirot e para të dukshme |
| statistikat | nga 3 xhiro | seksioni fshihet nën atë numër |
| gjetjet e listuara | 12 të vozitësit, 8 të makinës/kontekstit, 10 fitime | për xhiron e fokusuar |
| çifte makinash të shfaqura | 3 | pas 3 çifteve, një çift me zgjedhës |

Rastet e gabimeve llogariten një herë për analizë dhe ruhen në memorie; dendësia e
hartës së gabimeve ruhet në memorie sipas zgjedhjes së klasës dhe gabimit.

## Për zhvilluesit {#for-developers}

Kodi: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` te [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
