---
title: "Pamja e nivelit"
parent: "Nivelet dhe gjeometria e sfondit"
nav_order: 3
lang: "sq"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---


# Pamja e nivelit

Këto kontrolle e ndryshojnë mënyrën si duket një nivel 3D, që nxehtësia të dalë nga ai dhe ti të mund ta lexosh akoma vendin. Asgjë këtu nuk e ndryshon të dhënën.

## Nisja e shpejtë {#quick-start}

1. Ngarko një nivel 3D ([Nivelet 3D](model-levels.md)).
2. Te **Sfondi / niveli**, ul **Ndriçimin** derisa nxehtësia të jetë gjëja më e ndritshme në ekran.
3. Hap **Relievin e tokës** dhe ngri **Hijëzimin e pjerrësisë** ose **Fuqinë e izovijave** derisa të dallosh një kodër nga një fushë e sheshtë.
4. Hap **Strukturat**. Ul **Opacitetin e faqeve** për të parë brenda ndërtesave, ose ndiz **Teksturën e strukturave** për t'i parë të ngurta.
5. Nëse toka ka një figurë të pikturuar mbi të, provo **Teksturën e tokës** të fikur dhe të ndezur.

![Seksionet Relievi i tokës dhe Strukturat të hapura, me nivelin të shfaqur me shenja reliefi](../assets/img/en/level-appearance-sections.webp)

Me një [nivel 3D](model-levels.md) të ngarkuar, paneli Sfondi / niveli i shfaq këto kontrolle. Parazgjedhjet janë ato që merr një nivel i sapoimportuar ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Ndryshimi i tyre vetëm e vizaton sërish skenën; grumbullimi i nxehtësisë ruhet.

## I gjithë niveli {#the-whole-level}

| Kontrolli | Parazgjedhja | Diapazoni | Kuptimi |
|---|---|---|---|
| **Opaciteti** | 100% | 0-100% | Nën 100% niveli përzihet dhe nuk shkruan thellësi, kështu që nuk e [errëson](depth-and-culling.md) më nxehtësinë. |
| **Ndriçimi** | 0,9 | 0-2 (rrëshqitja 64) | |

Niveli vizatohet pa ngjyra — tokë gri, një guaskë e nuancuar — që nxehtësia të jetë e vetmja gjë me ngjyrë të fortë në ekran. Ndryshe nga një [imazh harte](map-images.md), një nivel 3D nuk ka rrëshqitës të heqjes së ngjyrave.

## Relievi i tokës {#ground-relief}

Nga larg një kodër dhe një fushë duken njëlloj gri, ndaj shikuesi shton tri shenja. Secila përgjigjet një gabimi tjetër:

| Kontrolli | Parazgjedhja | Kuptimi |
|---|---|---|
| **Hapësira mes izovijave** | nga diapazoni i lartësisë së tokës | Lartësia midis vijave të izovijave, logaritmike nga 1/4000 deri në 1/2 të diapazonit të lartësisë së nivelit; fundi i shiritit është *i fikur*. Parazgjedhja është 1/40 e diapazonit të lartësisë së tokës, e rrumbullakosur në një hap 1/2/5 — vijat prej 10 m i përshtaten një shpati dhe janë të padobishme në dyshemenë e një guroreje. Çdo vijë e 5-ta vizatohet më e fortë. Izovijat vizatohen në hapësirën e ekranit, kështu që mbeten një piksel të gjera në çdo zmadhim, dhe janë shenja e vetme që mbijeton kur toka është shumë e sheshtë për t'u hijëzuar fare. |
| **Fuqia e izovijave** | 35% | 0-100% |
| **Hijëzimi i pjerrësisë** | 55% | Errëson sipas pjerrësisë, kështu që bregjet dhe shkëmbinjtë lexohen nga çdo kënd kamere — ndryshe nga një dritë, që e sheshton kur ia kthen fytyrën. |
| **Shkalla e lartësisë** | 50% | Toka e ulët më e errët, toka e lartë më e çelët, përgjatë diapazonit të lartësisë së tokës: forma e madhe. |

Titulli i seksionit tregon gjendjen e izovijave: *çdo N m*, hapësira e izovijave, ose *pa izovija* kur hapësira është e fikur.

## Sipërfaqja e tokës {#ground-surface}

| Kontrolli | Parazgjedhja | Shfaqet kur | Kuptimi |
|---|---|---|---|
| **Uji** | i ndezur | niveli ka ujë | Liqenet, lumenjtë dhe deti, të vizatuar të sheshtë në blu-gri të zbehtë: asnjë shenjë terreni nuk zbatohet për një sipërfaqe që është e sheshtë me përkufizim. |
| **Opaciteti i ujit** | 60% | Uji është i ndezur | Vija bregdetare dhe toka nën ujërat e cekët shihen përmes ujit përshkues. |
| **Trekëndëshat e tokës** | 30% (0 për një nivel me tekstura) | gjithmonë | Skajet e vetë terrenit vizatohen mbi sipërfaqen e hijëzuar, duke u zbehur midis 6% dhe 25% të gjerësisë së nivelit nga kamera. Tregon sa trashë u mostrua toka dhe i jep një pjerrësie diçka me të cilën të gjykojë largësinë. Ndërtohet në përdorimin e parë, gjë që zgjat pak në një nivel të madh. |
| **Toka vetëm si kornizë teli** | i fikur | gjithmonë | Zëvendëson sipërfaqen e terrenit me skajet e tij. Plotësisht skematike — heq edhe hijëzimin, izovijat dhe errësimin, prandaj *Trekëndëshat e tokës* është zakonisht zgjedhja më e mirë. |
| **Teksturën e tokës** | i ndezur | niveli ka tekstura | Vizaton tokën me teksturat që mban skedari (asfalt, buzë rruge, bar). Ndriçimi i rrjetës zbatohet butë mbi to, sepse tekstura e mban vetë reliefin e vet të imët. **Ndriçimi** është mënyra për ta qetësuar nën nxehtësinë; Heqja e ngjyrave i takon hartave me imazhe. |
| **Ngjyra e kapur** | i fikur | niveli ka ngjyra kulmesh | Hijëzon tokën me ngjyrën që kapi skanimi në vend të gri — një rrugë e rindërtuar ndryshe nuk dallohet nga buza. Eksportet e motorëve nuk kanë asnjë; kur mungon, paneli thotë *Ky nivel nuk mban ngjyra.* |

## Strukturat {#structures}

Titulli **Strukturat** shfaq numrin e trekëndëshave të strukturave; këshilla më poshtë thotë si vizatohen (*vizatohen të ngurta në teksturat e veta* ose *vizatohen si guaskë përshkuese që të shohësh nxehtësinë brenda tyre*) dhe sa pjesë janë struktura.

| Kontrolli | Parazgjedhja | Kuptimi |
|---|---|---|
| **Teksturën e strukturave** | i ndezur kur strukturat mbajnë tekstura | Vizaton strukturat të ngurta, në teksturat e veta. Ndezja e vendos opacitetin e faqeve në 100% dhe i fik skajet; fikja e kthen në guaskën e nuancuar përshkuese në 25%. Një strukturë me tekstura ndriçohet nga ana që sheh kamera, sepse një tabelë është dy faqe shpinë më shpinë, dhe cila fiton testin e thellësisë varet nga rrumbullimi. |
| **Skajet e kornizës** | i ndezur; i fikur mbi 300 000 trekëndësha strukturash ose kur ka tekstura | Skajet e strukturave pa dublikata, një vijë për skaj. |
| **Opaciteti i skajeve** | 50% | |
| **Faqet e guaskës** | i ndezur | Një sipërfaqe e zbehtë me një buzë të ndritshme Fresnel, që një ndërtesë të lexohet si vëllim, jo si kafaz apo si re mjegulle. |
| **Opaciteti i faqeve** | 25% (35% mbi 300 000 trekëndësha strukturash, 100% me tekstura) | 0-60% në shirit, deri 100% me dorezën. Mbaje të ulët: strukturat e ngurta fshehin të dhënat brenda tyre. |
| **Skajet e mprehta** | i ndezur (i fikur kur ka tekstura) | Hijëzon çdo trekëndësh sipas normales së vet, e llogaritur në shader-in e fragmentit nga derivatet në hapësirën e ekranit. Nivelet e eksportuara janë të bashkuara dhe mbajnë normale të mesatarizuara, që rrumbullakos çdo qoshe kutie në "folje të shkrirë"; ndarja e çdo kulmi për ta rregulluar do të shumëfishonte bufferin e kulmeve. Fikeni për një nivel ku sipërfaqet e lakuara janë më të rëndësishme se qoshet e tij. |
| **Ngjyrimi i strukturave** | Cian | Zgjedhësi i ngjyrave dhe paracaktimet **Cian**, **Qelibar**, **Vjollcë**, **E bardhë**. |
| **Shfaq klasifikimin e pjesëve (N)** | | Çdo pjesë, klasa e saj dhe arsyeja; shih [Nivelet 3D](model-levels.md#ground-structures-and-water). |

## Prerja e nivelit {#cutting-the-level}

[Prerja](slice.md) dhe, me *Prit edhe nivelin*, [heqja sipas largësisë](depth-and-culling.md#distance-culling) i presin tokën, strukturat dhe ujin në të njëjtat rrafshe si nxehtësia.
