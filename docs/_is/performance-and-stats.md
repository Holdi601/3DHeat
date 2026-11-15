---
title: "Afkastaspjald og tölfræði"
parent: "Innri hlutar myndvinnslu"
nav_order: 7
lang: "is"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Frammistöðuspjald og tölfræðigluggi

Reiturinn efst hægra megin á sýninni sýnir hversu mikið skoðarinn vinnur: hversu marga ramma á sekúndu, hversu marga punkta hann teiknar, og hvort hann er enn að fínpússa myndina. Spjaldið **Afköst** leyfir þér að skipta gæðum myndarinnar fyrir hraða.

## Tölfræðigluggi {#the-stats-overlay}

Reiturinn efst hægra megin á sýninni á flipunum Heatmap og Match ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Hann les lifandi upplýsingar vélarinnar á hverjum hreyfiramma.

![Tölfræðigluggi á many-matches senunni, með númeruðum skýringum: 1 Backend, 2 FPS, 3 Frame, 4 Rows in window, 5 Sprites / frame, 6 Budget, 7 Heat res, 8 Coverage](../assets/img/en/performance-stats-overlay.webp)

| Lína | Merking |
|---|---|
| **Bakendi** | *WebGPU* eða *WebGL2*. Haltu músinni yfir til að sjá af hverju WebGPU var ekki notað, ef það var ekki notað. Sjá [Bakendarnir tveir](backends.md). |
| **FPS** | Rammar á sekúndu, meðaltal yfir að minnsta kosti 0,4 s. |
| **Rammi** | Rammatími í ms, mýktur (90% fyrri gildi, 10% nýtt). Þetta er tíminn milli ramma, ekki GPU-tími - enginn tími er mældur fyrir hverja umferð á GPU. |
| **Raðir í glugga** | Frambjóðandi línur: línurnar í núverandi tímaglugga, áður en síun á hverja línu fer fram í skyggjaranum. |
| **Deplar / ramma** | Deplar sem síðasta áætlun rammans sendi (haldið í áætluðu gildi á aðgerðalausum römmum, sem teikna ekkert). |
| **Heimild** | Deplaheimildin sem þessi ramminn var áætlaður með - gildi aðlögunarstýringarinnar, hækkað upp í alla frambjóðendur þegar allar línur eru teiknaðar. |
| **Hitaupplausn** | Upplausn hitabufferans sem hlutfall af striganum: stillingin *Heat resolution* margfölduð með aðlögunarkvarða annars þrepsins. |
| **Þekja** | Hversu langt stigvaxandi söfnunin er komin í að nota allar línur: prósenta meðan hún þéttist (gulbrún), *exact* þegar lokið er. Hávaðasamur rammi er aldrei tekinn fyrir fullunna mynd. |
| **Teningar** | Kassar teiknaðir í [box replay](box-replay.md). |
| **Ekki í minni** | Sést aðeins þegar línur komust ekki fyrir í GPU-heimildinni: hversu margar. Sjá [Minnisbúseta GPU](gpu-memory.md). |

## Hraðaskjárinn {#the-speed-display}

Neðst hægra megin á sýninni, aðeins í perspektífi: flughraðinn og tíminn sem tekur að fara yfir gögnin á þeim hraða. Dragðu hann til að breyta hraðanum. Sjá [Myndavél](camera.md#fly-speed).

## Ef skoðarinn er hægur {#if-the-viewer-is-slow}

Skoðaðu tölfræðigluggann, og síðan:

1. **Rows in window miklu stærra en Sprites / frame, Coverage undir 100%** - rammin getur ekki teiknað allt; hann þéttist yfir nokkra ramma þegar kyrrt er. Þrengdu gluggann, síaðu eða klipptu til að minnka frambjóðendur; eða sættu þig við sýnatökuna.
2. **Sprites / frame jafnt Rows in window, rammi samt hægur** - kostnaðurinn er á hvern sprita á skjánum: lækkaðu *Max pixel radius* ([Sprite-lögun](sprite-shape.md#pixel-clamps)) eða *Heat resolution*.
3. **Hægt með fáum línum** - líklega borðið: mikill fjöldi mannvirkja með brúnum kveikt, jarðþríhyrningar, dýptarskerpa. Sjá [Útlit borðs](level-appearance.md).
4. **Allt hægt, og rauður borði** - hugbúnaðarteikning ([Greining á hugbúnaðarteikningu](software-rendering.md)).

## Spjaldið Afköst {#the-performance-panel}

| Stýring | Sjálfgefið | Áhrif |
|---|---|---|
| Hint | | Hver ramminn sprautar slembiúrtaki af sýnilegum línum, lagskiptu, með vigt sem er kvörðuð til að bæta upp, svo væntanlegur hiti er nákvæmur við hvaða heimild sem er; ef sýninni er haldið kyrri heldur rammasamruninn áfram þar til hver lína hefur lagt sitt af mörkum. |
| **Teikna allar raðir í hverjum ramma** | á | Hver ramma sem byrjar nýtt mat teiknar allar frambjóðandi línur (allt að um 268M); heimildin hér fyrir neðan verður lágmark. [Sýnataka og heimildir](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Aðlögunarhæf heimild** | á | Stillir deplar á hvern ramma, síðan hitaupplausn, til að halda markrammahraðanum - og hættir að skera niður þegar það hjálpar ekki. [Sýnataka og heimildir](sampling-and-budgets.md#the-adaptive-budget) |
| **Mark-FPS** | 60 | 20-240 (1000 með handfanginu). Gildi undir 15 eru tekin sem 15. |
| **Upphafsdeplar / ramma** / **Deplar / ramma** | 4,00M | 65.536-268.435.456, lógaritmískt. Heitir *Starting* þegar aðlögunarhæf heimild er á, því stýringin færir hana. |
| **Hitaupplausn** | 100% | 25-100%. Kostnaður brotsins vex með fermetranum: 50% fjórðar blöndunarvinnuna, og hitasviðið er nógu slétt til að það sést varla. |
| **Stigvaxandi fínpússun** | á | Safnar yfir ramma á meðan sýnin er kyrr. Slökkt sýnir eins-ramma matið í hverjum ramma. [Söfnun](accumulation.md) |
| **Auðlindaheimildir** | greint | Heimildir fyrir vinnsluminni, GPU og þáttunarþráð. [Minni og heimildir](memory-and-budgets.md#resource-budgets) |

Engin af þessum stillingum er vistuð; endurhleðsla setur sjálfgefnu gildin aftur.
