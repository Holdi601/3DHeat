---
title: "Návígi og lotur"
parent: "Innsýn"
nav_order: 2
lang: "is"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Návígi og umferðir

Fyrir skotleiki sem byggjast á umferðum (Counter-Strike fyrst, hvaða gögn sem er með umferðum, hliðum og drápum) mælir Innsýn hvernig viðureignirnar unnust: hver tók opnunareinvígin og hvers virði þau voru, hvort dauðsföll voru skipt, hvort leikmaðurinn sem kíkir inn í horn vann þann sem heldur því, hvort krossskot og blossar borguðu sig, hvernig líkurnar á sigri í umferð hreyfðust með hverju drápi, og hvaða dyr drápu leikmennina sem fóru inn um þær. Notaðu þetta til að sjá *af hverju* umferðir unnust, ekki bara hver fékk drápin.

Mælingarnar koma frá herfræði við hreinsun herbergja og borgarhernaði (banvæna trektin, yfirráðapunktar, krossskot) og frá rafíþrótta- og íþróttagreiningu (líkur á sigri, virði aðgerða, leiðrétt plús/mínus). Hver er lesin í gegnum [þekkingarlinsuna](knowledge.md) og vitnað í hana.

## Prófaðu {#try-it}

1. Hladdu einum eða fleiri leikjum með umferðum (CS2-breyting hefur allt sem þarf).
2. Opnaðu **Innsýn** og ýttu á **Finna innsýn**.
3. Undir **Mælingar linsunnar** lestu línurnar frá *Líkur á sigri í umferð* til *Áhrif leikmanns*; hver hefur sínar tölur, 95% bil, q-gildi og heimildirnar sem hún fylgir.
4. Veldu linsuna **Rafíþróttir** eða **Borgarhernaður** til að lesa þær í gegnum þær bókmenntir; **Skrifa með gervigreind** sendir þær með skýrslunni.

## Hvað er mælt {#what-it-measures}

| Mæling | Hvað hún segir | Hvernig |
|---|---|---|
| Líkur á sigri í umferð | Hversu líklegt hvort lið var til að vinna umferðina á hverju augnabliki | Lógistísk aðhvarfsgreining á leikmönnum á lífi í hvorri hlið, sprengjunni eða markmiðinu og tíma þess, umferðarklukkunni og innkaupunum, aðlöguð að gögnunum sem eru hlaðin; kvörðun prófuð utan úrtaks eftir umferð (Brier-stig og færni, log loss, kvörðunarvilla yfir tíu bil, endurkvörðunarhalli, AUC) |
| Virði aðgerða | Hversu mikið dráp, opnunardráp, skipti, dráp á bak við blossa, uppsetning sprengju eða blossi breytti líkum liðsins á sigri | Líkur á sigri eftir mínus fyrir; skipti, opnunardráp og dráp undir blossa prófuð á móti hinum drápunum með umröðun |
| Opnunareinvígi | Hvaða lið vinnur fyrsta einvígið, hversu oft það vinnur umferðina á eftir, og hvar annað liðið vinnur opnanir langt umfram eigið meðaltal | Wilson-bil; staðir með nákvæmu tvíliðaprófi gegn hlutdeild liðsins, q yfir staði |
| Skipti | Dauðsföll svöruð með drápi liðsfélaga á drápsmanninum innan 5 s, tíminn sem það tók, og umferðir unnar þegar fyrsta dauðsfallið var skipt | Nákvæmt próf Fishers, bil Newcombes |
| Kíkjandi gegn haldara | Einvígi þar sem einn leikmaður fór inn í bardagann (1,5 m/s eða meira á síðustu sekúndu) og hinn stóð kyrr (0,75 m/s eða minna): hlutdeild kíkjandans | Nákvæmt tvíliðapróf gegn helmingi |
| Miðun fyrir einvígi | Sjónarhorn hvers leikmanns gagnvart stefnunni að hinum 0,75 s fyrir drápið; hver var betur miðaður og hversu oft sá leikmaður vann; haldarar á horni sínu (innan 15°) gegn utan þess; drægi drápa | Nákvæmt tvíliðapróf; Fisher |
| Krossskot | Haldarar með kyrran liðsfélaga innan 25 m frá kíkjandanum sem lína á hann er 35° eða meira frá þeirra eigin, gegn haldurum einum | Fisher, Newcombe |
| Hjálparbúnaður inn í innkomur | Kíkjandar á bak við blossa eigin liðs (innan 3 s og 15 m) eða reyk (innan 18 s) gegn þurrum kíkjum; opnunareinvígi með blossa á annarri hliðinni einni; fórnarlömb blinduð | Fisher, tvíliða |
| Mannlegt forskot | Fyrir hvert ástand leikmanna á lífi (5v4, 4v5, 2v1...) sem náðist fyrst í umferð, hlutdeild umferða unnum frá því | Wilson-bil |
| Klemmur | Umferðir þar sem lið endaði með síðasta leikmanninn: sigrar miðað við væntanlega sigra líkansins, eftir fjölda andstæðinga | Normalpróf á athugað gegn væntanlegu |
| Hópar, snúningar, felumenn | Stærsti hópurinn innan 10 m við opnunareinvígið (3 eða fleiri: hlaðið); leikmenn meira en 30 m frá fyrsta bardaganum eða uppsettu markmiði og hversu hratt þeir koma innan 12 m; tími og drápslíkur meira en 30 m frá öllum liðsfélögum | Fisher; oddahlutfall með bili Woolfs |
| Eftir uppsetningu og endurheimt | Umferðir unnar af liðinu sem setti upp, eftir tölunum við uppsetninguna, og hlutdeild þess í einvígjum eftir uppsetningu | Wilson-bil |
| Banvænar trektir | Innkomur á hvern stað (breyting á staðadálkinum, annars á 8 m reit) og dauðsföll innan 2,5 s frá innkomu, samanborið við hlutfall kortsins | Nákvæmt tvíliðapróf, q yfir staði; hlutfall minnkað með 20 innkomum á hlutfalli kortsins |
| Áhrif leikmanns | Líkur á sigri bættar við í umferð af hverjum leikmanni (dráp, dauðsföll, uppsetningar), minnkað með reynslu-Bayes; ridge-leiðrétt plús/mínus á niðurstöðum umferða miðað við upphaf líkansins; virði drápa eftir stað og vopni, minnkað | Refsing valin með fimmfaldri krosssannprófun |

Öll prófin í einni greiningu deila einni falskrar uppgötvunartíðni (Benjamini-Hochberg), þar sem hver staður sem var reyndur er talinn með, ekki aðeins þeir sem sýndir eru; q sem sýnt er er yfir þá alla. Líkanið og kvörðun þess eru aðlöguð að gögnunum sem eru hlaðin, svo þau lýsa þeim hópi: atvinnulíkan metur rangt hefðbundinn leik og öfugt.

Prófað á gervi-umferðum með sett áhrif (forskot kíkjanda, krossskot, blossar, ein banvæn trekt, betri miðun vinnur), og á 100 gagnasöfnum með sömu umferðum án þeirra, þar sem falskrar uppgötvunartíðni prófanna með settu áhrifunum verður að halda sig við nafnvirðið 5% (innan bands) (`src/insights/cqb/cqb.test.ts`); á um þúsund raunverulegum umferðum fékk líkanið Brier-stig 0,14 á móti 0,25 fyrir grunnhlutfallið, kvörðunarvillu 0,03 og endurkvörðunarhalla 1,0.

## Gögnin sem það þarf {#data-it-needs}

- dálkana **time**, **player**, **side** og **round** (lotan), og dráp og dauðsföll í atburðadálkinum; umferðir þar sem enginn deyr tvisvar eru meðhöndlaðar sem útsláttarumferðir (mannlegt forskot, klemmur og líkanið þurfa þær);
- dálk **annars aðila** (`other`, `victim`, `killer`, `attacker`) sem nefnir fórnarlambið í drápi og drepandann í dauðsfalli (án hans eru dráp og dauðsföll á sama augnabliki pöruð);
- **horfstefnu** fyrir miðunarmælingarnar;
- hráan `event`-dálk sem nefnir `flash`, `smoke`, `he`, `molotov`, `plant` og `defuse` fyrir hjálparbúnað og uppsetningar;
- `won` (lið raðarinnar vann umferðina), `place` (köll), `weapon`, `buy` og `state_flashed` þar sem gögnin hafa þau.

Staðsetningar ættu að vera teknar nokkrum sinnum á sekúndu; hraði, miðun og krossskot lesa síðustu tvær sekúndurnar fyrir hvert dauðsfall.

## Í sundurliðuninni {#in-the-breakdown}

[Sundurliðunin](breakdown.md) mælir fjórar aðstæður sem þætti, með og án: *blinduð*, *dauðsfall skipt*, *opnunareinvígi* og tölurnar (*maður upp*, *jafnir fjöldi*, *maður niður*), hver á K/D, unnum umferðum, lifun og drápum á mínútu.

## Margir leikir {#many-matches}

Sérhver leikjasamantekt [fjöldagreiningarinnar](mass-analysis.md) á gögnum með umferðardálki ber sömu mælingar sem tölur (`cqb` í samantektinni): opnunareinvígi, skipti, kíkingar, krossskot, blossainnkomur, miðun, mannlegt forskot, uppsetningar og þá 40 stöðum sem oftast eru farnir inn á, með innkomum sínum og dauðsföllum. Tölurnar leggjast saman yfir leiki, svo þúsund leikir gefa sömu hlutdeildir og ein stór greining. Flipinn **Návígi** í spjaldinu sýnir þær sem hlutdeildir með bilum sínum, yfir öll kort eða eftir korti; smellur á röð hleður leikjunum sem hún kom úr.

## Fyrir forritara {#for-developers}

`src/insights/cqb/`: `walk.ts` (ein yfirferð yfir raðir í tímaröð, umferðir haldnar aðskildum, einvígi skráð með sínu ástandi), `finish.ts` (mælingarnar og tölurnar á hvern leik), `model.ts` (lógistísk aðhvarfsgreining með IRLS, kvörðun, ridge með samtengdum halla, reynslu-Bayes, Fisher, Newcombe, umröðunarpróf), `run.ts` og `worker.ts` (skoðunartækið: eigin vinnsluferli, við hlið innsýnaryfirferðarinnar), `summary.ts` (safnari fjöldasamantektarinnar), `factors.ts` (aðstæður sundurliðunarinnar), `shows.ts` (það sem linsan les), `synth.ts` (prófunarumferðirnar). Þekkingarfærslurnar eru í `src/insights/knowledge/cqb.ts`, mynstrin í `patterns-cqb.ts`. Niðurstöðurnar fara í skýrsluna sem `lens.cqb`.
