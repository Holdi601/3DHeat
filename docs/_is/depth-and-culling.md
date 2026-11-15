---
title: "Dýpt og útilokun"
parent: "Hitastillingar"
nav_order: 4
lang: "is"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Dýpt og útilokun

Dýpt lætur hæðir og veggi fela hitann á bak við sig, eins og raunverulegur veggur felur manneskju. Fjarlægðarafskurður heldur aðeins hitanum á milli nær- og fjærmarka frá myndavélinni.

![Lág myndavél á bak við hæð, með Fela á bak við landslag slökkt (vinstri) og kveikt (hægri)](../assets/img/en/depth-and-culling-terrain.webp)

![Fjarlægðarafskurður með Fjær við 400 m og Skera borðið líka á: sneið af kortinu í kringum myndavélina](../assets/img/en/depth-and-culling-far.webp)

Án dýptar er hitakort yfir þrívíðu [borði](levels.md) flatt yfirlag: allt sem gagnasafnið geymir glóir í gegnum hvern vegg á fullum styrk, dýptarvísbendingarnar sem borðið gefur eru ógiltar, og heitur blettur inni í byggingu lítur eins út og sá á þakinu. **Dýpt**-hlutinn lætur borðið fela það sem er á bak við það; **Fjarlægðarafskurður** takmarkar hitann við skel eða plötu í kringum myndavélina; [Sneiðin](slice.md) sker plötu út úr heiminum. Allt þrennt gildir um hitastillingarnar og breytir hvaða raðir telja með, svo að breyta þeim endurræsir uppsöfnunina.

## Dýpt {#depth}

Báðar stillingarnar þurfa [borð](levels.md) - myndarborð eða þrívíddarlíkan. Án borðs er ekkert á bak við að fela, og þær gera ekkert. Báðar eru slökktar meðan [Fletja út á jarðarflöt](sprite-shape.md#flatten-onto-ground-plane) er kveikt.

### Fela á bak við landslag {#hide-behind-terrain}

**Fela á bak við landslag** (sjálfgefið á): gagnapunkti þar sem næsta yfirborð í átt að myndavélinni er *jörðin* (ekki mannvirki) er hent út alveg, ekki bara dempaður.

Landslag og veggir eru ógegnsæ á ólíkan hátt. Þú horfir *í gegnum* vegg af ásettu ráði, til að sjá á hvaða hæð umferðin var; þú vilt aldrei horfa í gegnum hæð, því á bak við hana er hin hliðin á kortinu - sem á korti sem er kílómetrar á breidd er mest af gögnunum, og leggst saman við sjóndeildarhringinn í bönd sem er bjartara en allt í forgrunninum. Ein dempun getur ekki þjónað hvoru tveggja, svo landslagið fær mörk og veggirnir halda dempuninni fyrir neðan.

### Falið á bak við rúmfræði {#hidden-behind-geometry}

**Falið á bak við rúmfræði** (sjálfgefið 0,8): hversu mikið gagnapunktur á bak við rúmfræði borðsins er bældur. Gildið þýðir *sést í gegnum* við 0, *N% dekkra* þar á milli (staða sleðans, ekki mæld dempun), og *alveg falið* við 1.

Sérhver veggur eða gólf milli punkts og myndavélar dempar hann enn frekar: einn veggur skilur eftir nokkur prósent við sjálfgefna gildið, og hvert auka yfirborð helmingar það sem eftir er, upp í fjögur yfirborð. Við 1 er ekkert á bak við rúmfræðina teiknað, og það er ódýrasta stillingin.

Sjá einnig [Útlit borðs](level-appearance.md).

## Fjarlægðarafskurður {#distance-culling}

**Fjarlægðarafskurður** (sjálfgefið lokuð) takmarkar hitann við raðir á milli nær- og fjærmarka frá myndavélinni. Settu fjærmark til að lesa þéttleika inni í byggingu án þess að fjarlæga hlið kortsins leggist ofan á hann; settu nærmark til að fljúga *í gegnum* heitan blett í stað þess að fljúga inn í hann.

| Stilling | Sjálfgefið | Svið (sleði) | Merking |
|---|---|---|---|
| **Nær** | slökkt | 0,5-5000 m, lógaritmískt, neðstu 5% sleðans = slökkt (200.000) | Raðir nær en þetta eru sleppt. |
| **Fjær** | slökkt | 1-200.000 m, lógaritmískt, neðst = slökkt (10.000.000) | Raðir fjær en þetta eru sleppt. |
| **Skera við flöt** | á | | Mælir mörkin eftir sjónásnum í stað frá auganu, svo skurðurinn er flötur samsíða skjánum en ekki kúla um þig. Brún kúlu bognar frá yfir rammann og rennur til þegar þú snýrð; flötur situr þar sem þú settir hann. |
| **Skera borðið líka** | á | | Sker jörðina, mannvirki og vatn við sömu mörk. Með borðið heilt fjarlægir skurðurinn gagnapunktana og lætur bygginguna standa fyrir framan þá; þegar bæði eru skorin er það sneiðmynd í gegnum kortið og punktarnir liggja upp við veggi sína og gólf. Þessi stilling teiknar aðeins upp aftur; hún endurræsir ekki uppsöfnunina. |

### Lyklaborð {#keyboard}

Fjærmarkið er stilling sem þú rennir - gakktu með það í gegnum byggingu og fylgstu með á hvaða hæð umferðin birtist - svo það er á lyklaborðinu meðan þú flýgur ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Lykill | Áhrif |
|---|---|
| `]` | Ýtir fjærmarkinu út um stuðulinn 1,12 (Shift: 1,35) |
| `[` | Dregur það inn um sama stuðul |
| `\` | Slekkur á fjærmarkinu, eða kveikir aftur á því í þeirri fjarlægð sem það var skilið eftir í (6000 í fyrsta sinn) |

Skrefin eru margfeldisleg því gagnlegt svið spannar fjórar stærðargráður, frá herbergi upp í kort. Lyklaborðið heldur fjærmarkinu á milli 100 og 400.000. Lyklarnir gera ekkert meðan textareitur eða valmynd hefur fókus.

## Fyrir forritara {#for-developers}

### Fela á bak við landslag {#hide-behind-terrain}

Mannvirkin eru teiknuð í sína eigin dýptaráferð. Búthluti sem er á bak við dýpt senunnar en *ekki* á bak við dýpt mannvirkjanna er á bak við jörðina, og er hent. Það kostar eina dýptarumferð yfir mannvirkin, sem er sleppt þegar rofinn er slökktur.

### Falið á bak við rúmfræði {#hidden-behind-geometry}

Það er talið **fyrir hvert yfirborð**. Ein dýptarsamanburður getur aðeins sagt „eitthvað er fyrir framan“, svo punktur á bak við einn vegg og punktur fjórum herbergjum inn í byggingu myndu dofna eins og innréttingin yrði einn daufur smurningur. Í staðinn er rúmfræði mannvirkjanna **dýptarflögnuð** í allt að 3 lög til viðbótar ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); hver búthluti telur hversu mörg yfirborð eru fyrir framan hann (dýpt senunnar sjálfrar auk flögnuðu laganna: allt að fjögur), og dempunin margfaldast:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Sleði | 1 yfirborð | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25% | 12,5% | 6,25% | 3,1% |
| 0,8 (sjálfgefið) | 4% | 2% | 1% | 0,6% (gólf) |
| 1,0 | ekki teiknað | ekki teiknað | ekki teiknað | ekki teiknað |

Af hverju tveir þættir: sleðinn er kvarðaður þannig að einn veggur skilur eftir nokkur prósent - útlitið sem lesst sem „á bak við eitthvað“ - og nokkur prósent margfölduð saman yrðu ekkert við þriðja vegg; helmingun fyrir hvert auka yfirborð heldur fjórum greinanlegum þrepum. Af hverju í öðru veldi: línulegt lét mettað svið haldast mettað á bak við vegg; fjórða veldi þurrkaði það út við 0,8. Af hverju gólf: að fela alveg dulinn hita gerir herbergi fullt af falinni umferð að tómu herbergi, án nokkurs sem bendi á [Sneiðina](slice.md). Aðeins sleði sem er fastur í 1 felur það alveg - og er ódýrasta stillingin, því dulnir punktar eru þá hentir.

Hvernig ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), punkthitaskyggingarnar): samanburðurinn er gerður fyrir hvern búthluta, við dýptaráferð senunnar, í **gluggadýpt** frekar en heimsfjarlægð. Dýptaráferðarsókn í hnútastiginu skilar „fjarri“ alls staðar á sumum rekla (meðal annars hugbúnaðarrastara ANGLE), og að línuvæða báðar dýptirnar í metra tapar aðgreiningunni vegna nákvæmni þegar nær/fjær-bilið er breitt. Skekkjan er einn punktaradíus umreiknaður í gluggaeiningar auk nokkurra minnst gildandi bita, svo gagnapunktur sem hvílir á yfirborði skyggi ekki á sjálfan sig.

Mannvirkin eru teiknuð hálfgegnsæ, en þau eru teiknuð inn í dýptina sem útilokunin les; borð þar sem mannvirkin næðu ekki í dýptaráferðina myndi aðeins útiloka gegn landslaginu.

### Fjarlægðarafskurður {#distance-culling}

Bæði mörkin eru metin í hnútaskyggingunni, svo útilokuð röð kostar einn hnút og engin búthluta.
