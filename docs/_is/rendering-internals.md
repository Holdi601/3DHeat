---
title: "Innri hlutar myndvinnslu"
nav_order: 22
has_children: true
lang: "is"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Innviðir teiknunar

Skoðarinn teiknar milljónir punkta sem glóandi bletti og leggur þá saman. Þessi hluti útskýrir brellurnar sem halda því hröðu, og hvað tölurnar í tölfræðiglugganum þýða. Lestu hann ef skoðarinn finnst hægur, eða ef þú vilt vinna í teiknaranum.

```
data -> time window -> GPU filters -> sampling plan -> splat -> accumulate -> colour -> screen
```

Til að sjá hvernig tölvan þín stendur sig, skoðaðu tölfræðireitinn efst hægra megin á sýninni: [Frammistöðuspjald og tölfræðigluggi](performance-and-stats.md). Nýju orðin (GPU, lína, sprite, hitakort) eru í [orðasafninu](glossary.md).

## Kjarnavandinn {#the-core-problem}

Summa skarandi geislamyndaðra halla kostar *N* × π*r*² blandaða bita á hvern ramma. Með 100 milljónum sprita og 8 px radíus eru það 2 × 10¹⁰ bitar, um sekúnda af vinnu á afkastamiklu GPU. Ekki er hægt að beita hráafli á þetta í hverjum ramma, svo skoðarinn sameinar:

- **línur raðaðar eftir tíma** - tímagluggi er tvær tvíundarleitir, og kostnaður spilunar fylgir línunum í glugganum, ekki gagnasafninu;
- **engin vinna á hverja línu á CPU á hverjum ramma** - línur liggja í GPU-minni, kvarðaðar; síur, hópamerki, líftímaprófið, glugginn, klipping og sneiðin eru reiknuð í hnútaskyggjaranum;
- **lagskipt sýnataka** með jöfnunarvigtum þegar ramminn getur ekki teiknað allar línur, og **framsækin söfnun** sem þéttist á nákvæmu svari allra lína á meðan sýnin er óbreytt ([Sýnataka og heimildir](sampling-and-budgets.md), [Söfnun](accumulation.md));
- **tveggja þrepa inngjöf** sem skiptir á milli sprita á hverjum ramma, og síðan hitaupplausnar, fyrir rammahraða ([Sýnataka og heimildir](sampling-and-budgets.md#the-adaptive-budget));
- **framfylgt minnisheimildir**, svo gagnasafn sem passar ekki er klippt sýnilega í stað þess að hrynja ([Minnisbúseta GPU](gpu-memory.md)).

## Einn rammi {#one-frame}

Rammalykkjan er [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Allt sem breytist á rammahraða - myndavél, spilunarhaus, heimild - býr í vélinni, ekki í forritsástandinu, svo rammi kostar enga React-vinnu. Ástandið er lesið einu sinni á hvern ramma og skrifað aftur aðeins fyrir lághraða upplýsingar.

1. **Ný gögn?** Nýtt gagnasafn er tilkynnt (*Uploading N rows to the GPU*) á einum ramma og sent inn á þeim næsta, svo skilaboðin birtast áður en vinnan stöðvar þráðinn. Nýju stigi er afhent teiknaranum; hitaleiðir línanna eru byggðar eða losaðar.
2. **Spilunarhaus** fer áfram (takmarkað við 0,1 s af raunverulegum tíma á hverjum ramma), endurtekur sig eða stöðvast.
3. **Myndavél** les lyklaborð, mús og stýripinna; speglun ássins er felld inn í sýnfylkið; á WebGPU breytir dýptarendurvörpunarfylki dýptarsviði three.js í stíl OpenGL yfir í WebGPU.
4. **Það sem er sýnilegt**: tímabilið úr tímalínunni og sögunni; hópmerkjatafla (sýnileiki aðeins undir skiptingu eftir dálki); allt að fjórar síur - dálkasíur og valið í Entities; skipting mismunar.
5. **Lita- og kúrvutöflur** eru endurbyggðar ef stillingar þeirra breyttust.
6. **Heimild**: aðlögunarstýringin ákvarðar sprita-heimild þessa ramma og hitaupplausn; með *Draw every row each frame* er heimildin hækkuð til að ná yfir allar frambjóðandi línur.
7. **Undirskriftir** ákvarða hvað söfnunarbufferinn merkir enn: breyting á einhverju sem breytir því hvaða línur leggja til eða hvernig (*geometry*), á tímaglugganum, eða aðeins á því hvernig niðurstaðan er lituð (*composite*). Sjá [Söfnun](accumulation.md#what-restarts-it).
8. **Sýnatökuáætlun**: hvaða línublokkir eru teiknaðar ([Sýnataka og heimildir](sampling-and-budgets.md)).
9. **Söfnunarhamur**: endurstilla, lengja, hlaupandi meðaltal, keyrandi meðaltal, eða aðgerðalaus.
10. **Rúmfræði Box replay** (teningar, slóðir) á CPU, aðeins í þeim ham og aðeins þegar ekki er aðgerðalaust.
11. **Teikning**: bakendinn teiknar senuna (stig, grind, ásar, kassar, slóðir, reglustika), sprautar hitanum inn á hitamarkið, sameinar því í söfnunarbufferinn og setur hita yfir senu á striga.
12. **Sjálfvirk lýsing** fer í gang þegar niðurtalningin nær núlli; hitamæling reglustikunnar les mest einn pixel á 120 ms fresti; upplýsingar eru birtar.

Aðgerðalaus rammi - samþjappaður, ekkert breyttist - sleppir senunni og sprautuninni en **setur samt saman aftur**: WebGL-striga sem er búinn til án `preserveDrawingBuffer` hefur óskilgreint innihald eftir samsetningu, svo það er ekki öruggt að treysta á að hann sýni síðasta ramma áfram. Senu- og hitamörkin eru eigin rammabufferar skoðarans og halda gögnunum, svo aðgerðalaus rammi kostar eina skjáfylla yfirferð.

## Síður í þessum hluta {#pages-in-this-section}

- [Bakendarnir tveir](backends.md) - WebGPU og WebGL2, hvernig annar er valinn, URL-rofar
- [Söfnun](accumulation.md) - endurstilla, lengja, hlaupandi meðaltal, keyrandi meðaltal
- [Sýnataka og heimildir](sampling-and-budgets.md) - lagskipti sýnatakinn, nákvæmur hamur, aðlögunarheimildin
- [Hálffleytisöfnun](half-float-accumulation.md) - svið og nákvæmni á 16 bita mörkum
- [Minnisbúseta GPU](gpu-memory.md) - kvörðuð geymsla lína og framfylgd GPU-heimild
- [Greining á hugbúnaðarteikningu](software-rendering.md)
- [Frammistöðuspjald og tölfræðigluggi](performance-and-stats.md)
