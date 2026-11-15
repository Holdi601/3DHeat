---
title: "Úrtak og mörk"
parent: "Innri hlutar myndvinnslu"
nav_order: 3
lang: "is"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Úrtak og mörk

Þegar of margir deplar eru til að teikna í einum ramma, teiknar skoðarinn jafnt úrtak og lætur hvern depil telja meira, svo myndin haldist rétt. Stýring stillir hversu marga hann teiknar svo skoðarinn haldi rammatíðni sinni.

## Stjórntæki árangursspjaldsins {#performance-panel-controls}

| Stilling | Sjálfgefið | Svið (sleði) |
|---|---|---|
| **Teikna allar raðir í hverjum ramma** | á | |
| **Aðlögunarhæf heimild** | á | |
| **Mark-FPS** | 60 | 20-240 (1000) |
| **Upphafsdeplar / ramma** (aðlögunarhæft) eða **Deplar / ramma** | 4,00M | 65.536-268.435.456, lógaritmískt (268.435.456) |
| **Hitaupplausn** | 100% | 25-100%, margfaldað með aðlöguðum kvarða annars þreps |
| **Stigvaxandi fínpússun** | á | Slökkt: hver rammi er ný ein-ramma áætlun (gagnlegt til að sjá hrátt úrtakið). |

Sjá einnig [Árangursspjald og tölfræðiyfirlag](performance-and-stats.md).

## Fyrir forritara {#for-developers}

### Frambjóðendaraðir {#candidate-rows}

Raðirnar eru geymdar í vaxandi tímaröð. Tímagluggi tímalínunnar [*lo*, *hi*] verður að röðabili með tveimur tvíundarleitum í tímadálkinum ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); án tímadálks er sérhver röð frambjóðandi. Þetta eru **Raðir í glugga** í tölfræðiyfirlaginu. Prófanir á hverri röð - síur, hópar, skipting, útilokun, sneið, líftími - fara fram síðar, í skyggingunni; röð sem fellur kostar eitt hnútakall og engin búthluta.

### Úrtaksáætlunin {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) skiptir frambjóðendabilinu í **blokkir með 4.096 samliggjandi röðum** og velur hversu margar á að teikna út frá spritekvóta rammans:

- Ef kvótinn nær yfir allar blokkirnar eru þær allar teiknaðar - rammi er nákvæmur.
- Annars eru blokkir teknar með jöfnu skrefi yfir bilið, hliðrað með titringi sem færist um gullna hlutfallið í hverjum ramma, svo samliggjandi rammar þekja mismunandi blokkir og samanlagt fyllist jafnt upp. Þetta er **lagskipt** úrtak: hver hluti tímabilsins er í hverjum ramma.

Hiti hverrar teiknaðrar raðar er margfaldaður með **frambjóðendur / sendir**, svo væntanlegur hiti rammans er nákvæmur við hvaða kvóta sem er; aðeins suðið fer eftir kvótanum. Raðir búa í bútum upp á 8.388.608 (sjá [Minnisnýting á GPU](gpu-memory.md)); blokk er skipt þar sem hún fer yfir bút, og hver bútur fær listann af blokkarbyrjunum sem hann á að teikna.

Ein áætlun getur borið mest 65.536 blokkir - 268.435.456 deplar - því báðir bakendar halda fastri 65.536-hólfa blokkarbyrjunarbuffer. Beiðni um meira er takmörkuð þar, og bilið birtist heiðarlega sem fleiri rammar til að ná samleitni.

### Teikna allar raðir í hverjum ramma {#draw-every-row-each-frame}

**Árangur → Teikna allar raðir í hverjum ramma** (sjálfgefið **á**): kvótinn verður gólf frekar en þak, og rammi sem byrjar nýtt mat teiknar sérhverja röð sem hann ber ábyrgð á (upp að 268M-takmörkinni).

Ástæðan: myndavélarhreyfing hendir uppsöfnuninni, svo hreyfður rammi er eitt mat þar sem suðið ræðst af því hversu stórum hluta gagnanna hann teiknaði - með fjórðungi teiknuðum sést fjórðungur þeirra í björtum vegnum deplum, og það er það sem lætur hreyfða sýn glitra. Að teikna allt gerir hvern ramma að fullgerðu myndinni. Kostnaðurinn er að rammatíminn fylgir nú stærð gagnanna í glugganum; stjórntækin eru þrengri tímagluggi, síur eða fjarlægðarútilokun, sem fækka frambjóðendunum í stað þess að sýna þá gisnara.

Slökktu á því á vélbúnaði sem ræður ekki við allt sviðið í einu: *Deplar / ramma* er þá raunveruleg takmörk, og sýnin nær samleitni á nokkrum kyrrum römmum í staðinn.

Hvað full áætlun kostar, mælt á háendaskjákorti við 4K striga með stóru borði, sprites með 1 m radíus (pixla eða tvo): um 100M deplar á ramma við 30 fps, 200M við 15 fps, og hámarkið 268M við um 12 fps. Með svo litlum spritum er hnútastigið allur kostnaðurinn, og hitaupplausn breytir engu; með stórum spritum er fyllingin kostnaðurinn: 8M sprites með 100 m radíus tóku 2,5 s á ramma við fulla hitaupplausn og 170 ms við 25%. **Teikna allar raðir í hverjum ramma** byrjar því á 67M og hækkar um fjórðung á ramma meðan rammar taka undir 150 ms, og helmingast meðan þeir taka yfir 400 ms, svo þung sýn geti ekki látið ramma fara yfir það sem vaktmaður skjákortsins leyfir.

### Aðlögunarhæf heimild {#the-adaptive-budget}

**Árangur → Aðlögunarhæf heimild** (sjálfgefið á) stillir spritekvótann þannig að hann haldi **Mark-FPS** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Hún er óvirk í kassaendurspilun og við myndbandsútflutning.

Inntakið er rammatíminn, sléttaður (90% fyrra gildi + 10% nýtt, með einstökum römmum takmörkuðum við 2 s), miðað við markið 1000 / max(15, mark-FPS) ms.

**Þrep eitt - sprites.** Í hverjum ramma er kvótinn margfaldaður með `1 + (target / frame - 1) × gain`, með gildinu 0,35 þegar of hægt er og 0,08 þegar svigrúm er, klemmt við stuðulinn 0,5-1,25 á ramma og við 65.536-268.435.456 deplum.

**Þrep tvö - upplausn.** Aðeins þegar kvótinn er þegar kominn á gólfið og rammar eru enn meira en 10% of hægir lækkar upplausn hitabuffersins, um 8% á ramma, niður í 25% af striganum; hún batnar um 4% á ramma meðan 30% svigrúm er. Kostnaður brotanna fellur með veldi upplausnarinnar, sem er nær ósýnilegt undir mjúkum skala. (Mælt á hugbúnaðarteikningu með 10M röðum og of stórum spritum: 141 ms → 17 ms á ramma.) Kvarðinn er námundaður í sextánda hluta; *Hitaupplausn* í yfirlaginu sýnir hann.

**Að gefast upp.** Hægur rammi lítur eins út hvort sem sprites ollu honum eða þungt borð - enginn tímamæling er fyrir hverja umferð. Ef kvótinn er á gólfinu og rammar eru áfram undir 70% af markinu í 30 ramma, voru sprites ekki kostnaðurinn: stjórnin skiptir yfir í **klifur**, margfaldar kvótann með 1,5 á hverja 14 ramma og endurheimtir upplausnina, svo lengi sem rammatíminn helst innan 1,5× þess sem hann var á gólfinu. Klifur sem gerir hlutina verri en það skiptir aftur í 60% og tekur upp venjulega stjórn; að ná markinu lýkur klifrinu.

Með slökkta aðlögunarhæfa heimild er kvótinn einfaldlega **Deplar / ramma**.

Með *Teikna allar raðir í hverjum ramma* á keyrir aðlögunarhæfa heimildin enn, en nákvæma reglan hækkar kvótann þannig að hann nær yfir allar frambjóðendaraðir, svo í reynd stjórnar hún aðeins upplausnarþrepinu og römmum sem byrja ekki nýtt mat.
