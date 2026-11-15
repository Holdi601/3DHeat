---
title: "Liðahiti"
parent: "Hitastillingar"
nav_order: 6
lang: "is"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: true
---


# Liðahiti

Liðahiti sýnir hvar hvert lið var, hvert lið í sínum eigin lit. Þar sem lið skarast blandast litirnir.

**Liðahiti** (takki 3) er þéttleikasviðið úr [Hita](heat.md) með sérhverjum [hópi](glossary.md) gefnum sinn eigin litatón. Þar sem hópar skarast blandast litatónar þeirra; jöfn keppni verður hlutlaus. Gegnsæi ber samt þéttleikann nákvæmlega eins og í hinum stillingunum, svo myndin svarar bæði *hversu mikið* og *hvers* í einu. Hann þarfnast hópdálks.

![Liðahiti: hvor hlið í sínum lit; þar sem þær skarast blandast litirnir](../assets/img/is/heat-teams.webp)

Þetta er ekki [fígúruyfirlögnin](box-replay.md): hún teiknar eina fígúru á hverja manneskju; þetta er hitasvið litað eftir sama dálki.

## Hvernig á að nota hann {#how-to-use-it}

1. Ýttu á `3` (eða veldu **Liðahiti** á mótastikunni).
2. Opnaðu **Hitalitir**. Sýnishornin sýna lit hvers hóps; færðu bendilinn yfir sýnishorn til að sjá heiti liðsins.
3. Ef allt virðist grátt, hækkaðu **Litaaðgreining**.
4. Taktu hak af hópi í [Listi yfir lið](teams-list.md) til að taka hann út; hinir litirnir haldast þar sem þeir voru.

## Stýringar {#controls}

Í hlutanum **Hitalitir**:

| Stjórn | Sjálfgildi | Merking |
|---|---|---|
| Sýnishorn | | Litur hvers hóps, fyrir fyrstu 12 hópana, síðan *+N til viðbótar*. Færðu bendilinn yfir til að sjá heiti hópsins og litinn. |
| **Litaaðgreining** | 1,4 | Hversu langt blöndu er ýtt frá hlutleysi, 0-4. 0 gerir allt grátt; 1 er hið sanna meðaltal; yfir um 2 fara björtustu blöndurnar út fyrir birtanlegt svið og eru klipptar fyrir hverja rás, sem hliðrar litatóni þeirra. |
| **Ógegnsæisskali (liturinn kemur frá hópnum)** | sjálfgefni hitaskalinn | Aðeins **alfa** skalans er notuð hér: gegnsætt þar sem ekkert er, ógegnsætt efst. Litir hans eru hunsaðir. |

Allar hinar hitastýringarnar - lögun, mettun, svörun, lágmarkshiti, dýpt, útilokun - virka eins og í [Hita](heat.md).

[Listi yfir lið](teams-list.md) sýnir lit hvers hóps fyrir liðahita sem sýnishorn í þessari stillingu. Að fela hóp skilur alla hina hópana eftir á sínum lit: litatónar koma úr heildarfjölda hópa, ekki úr því sem er kveikt á, svo tvær myndir haldast sambærilegar.

## Litapallettan {#the-palette}

Úr [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Litir búa á **Oklab**-litaplaninu við fasta birtu (0,7) og litstyrk (0,115), svo sérhver hópur er jafnbjartur og rauður hópur les sig ekki heitari en blár.
- Með *n* hópum er litahringnum skipt í *n* jafna hluta og hópur *i* tekur **miðju** hluta síns, `(i + 0,5) / n` af hring. Sérhverjir tveir hópar eru eins langt hvor frá öðrum og fjöldinn leyfir, og andstæður haldast andstæður hvað sem fjöldinn er.
- Mest **16** ólíkir litatónar eru notaðir. Með fleiri hópum eru auðkenni sett með endurtekinni helmingun (auðkenni með snúnum bitum: 0, ½, ¼, ¾, ⅛, …) svo nágrannaauðkenni deili ekki litatóni; hópar umfram 16 deila hlutum óhjákvæmilega.
- Hópur sem heitið merkir "enginn hópur" - `0`, tómt, `none`, `unknown`, `null` eða `-1`, án tillits til stórra og smárra stafa - er teiknaður í **hlutlausu gráu** í stað þess að taka sneið af hringnum. Aðeins fyrsta slíka merkið í hóplistanum er meðhöndlað þannig.

Sjálfgefin aðgreining er 1,4 frekar en 1 því við 1 er blanda fimm jafnt dreifðra litatóna *grá*: rétt og ólæsilegt. Örlítið yfir 1 heldur jöfnum rétt en gerir 60/40-skiptingu sýnilega.

## Hvernig þetta virkar {#how-it-works}

Hitamarkið hefur fjórar rásir í þessari stillingu. Sérhver depill leggur þéttleika *v* sinn við fyrstu rásina og *v* × Oklab-hnit *a* og *b* hóps síns við aðra og þriðju rásina. Við samsetningu er blanda pixlans þyngdaða meðaltalið eftir þéttleika: *a* = G / R, *b* = B / R, skalað með litaaðgreiningunni og breytt í sRGB við birtu pallettunnar. Með því að deila með söfnuðum þéttleika helst litatónninn óháður því hversu mikil gögnin eru, og þess vegna virkar hver þéttleikastjórn áfram aðeins á gegnsæið.

Fjögurra rása markið kostar fjórfalt skjákortsminni miðað við eins rása hitamarkið í sömu upplausn.
