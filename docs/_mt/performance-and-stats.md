---
title: "Pannell tal-prestazzjoni u statistiċi"
parent: "Id-dettalji tar-rendering"
nav_order: 7
lang: "mt"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Pannell tal-prestazzjoni u statistiċi

Il-kaxxa fil-lemin ta' fuq tal-view turi kemm qed jaħdem il-viewer bil-qawwa: kemm frames fis-sekonda, kemm tikkiet juri, u jekk għadux jerfa' l-immaġni. Il-pannell **Prestazzjoni** jħallik tbiddel il-kwalità tal-immaġni għal veloċità.

## L-overlay tal-statistiċi {#the-stats-overlay}

Il-kaxxa fil-lemin ta' fuq tal-view fit-tabs Heatmap u Match ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Taqra l-qari live tal-engine f'kull frame tal-animazzjoni.

![L-overlay tal-statistiċi fuq ix-xena ta' Ħafna logħbiet f'daqqa, bil-kuntrasenji nnumerati: 1 Backend, 2 FPS, 3 Frame, 4 Ringieli fit-tieqa, 5 Sprites / frame, 6 Baġit, 7 Riż. tas-sħana, 8 Kopertura](../assets/img/en/performance-stats-overlay.webp)

| Linja | Tfisser |
|---|---|
| **Backend** | *WebGPU* jew *WebGL2*. Ħalli l-mouse fuqha għar-raġuni għalfejn ma nżammx WebGPU, meta ma nżammx. Ara [Iż-żewġ backends](backends.md). |
| **FPS** | Frames fis-sekonda, medji fuq mill-inqas 0.4 s. |
| **Frame** | Ħin tal-frame f'ms, lixx (90% tal-qadim, 10% tal-ġdid). Dan huwa l-ħin bejn il-frames, mhux il-ħin tal-GPU - ma titkejjel l-ebda ħin tal-GPU għal kull pass. |
| **Ringieli fit-tieqa** | Ringieli kandidati: ir-ringieli fit-tieqa tal-ħin attwali, qabel il-filtrar għal kull ringiela fis-shader. |
| **Sprites / frame** | Is-sprites li ppjana l-frame l-aħħar għamel submit (jinżamm fuq il-figura ppjanata f'frames idle, li ma jpingu xejn). |
| **Baġit** | Il-baġit tas-sprites li bih ġie ppjanat dan il-frame - il-valur tal-kontrollur adattiv, mitla' għall-kandidati kollha meta jkun qed jinpinġa kull ringiela. |
| **Riż. tas-sħana** | Ir-riżoluzzjoni tal-buffer tas-sħana bħala sehem tal-canvas: is-setting *Riżoluzzjoni tas-sħana* imdawwar bil-fattur adattiv tat-tieni stadju. |
| **Kopertura** | Kemm wasal l-akkumulazzjoni progressiva biex tuża kull ringiela: perċentwal waqt li tikkonverġi (kulur ambra), *exact* meta tkun lesta. Frame bl-istorbju qatt ma jinftiehem bħala l-istampa lesta. |
| **Kubi** | Boxes mpinġija fil-[box replay](box-replay.md). |
| **Mhux residenti** | Jidher biss meta r-ringieli ma daħlux fil-baġit tal-GPU: kemm huma. Ara [Residenza tal-memorja tal-GPU](gpu-memory.md). |

## Il-wiri tal-veloċità {#the-speed-display}

Fil-lemin t'isfel tal-view, fil-perspettiva biss: il-veloċità tat-tajran u l-ħin biex taqsam id-dejta b'dik il-veloċità. Iġbed biex tbiddel il-veloċità. Ara [Kamera](camera.md#fly-speed).

## Jekk il-viewer ikun bil-mod {#if-the-viewer-is-slow}

Ara l-overlay tal-statistiċi, imbagħad:

1. **Ringieli fit-tieqa ferm akbar minn Sprites / frame, Kopertura taħt 100%** - il-frame ma jistax jpinġi kollox; jikkonverġi fuq diversi frames meta jkun wieqaf. Agħmel it-tieqa iktar dejqa, ifiltra, jew aqta' biex tnaqqas il-kandidati; jew aċċetta s-sampling.
2. **Sprites / frame ugwali għal Ringieli fit-tieqa, il-frame għadu bil-mod** - il-kost huwa għal kull sprite fuq l-iskrin: naqqas il-*Max pixel radius* ([Forma tal-sprite](sprite-shape.md#pixel-clamps)) jew ir-*Riżoluzzjoni tas-sħana*.
3. **Bil-mod b'ftit ringieli** - probabbilment il-livell: għadd kbir ta' strutturi bil-bordijiet mixgħula, art bil-trijangoli, depth of field. Ara [Id-dehra tal-livell](level-appearance.md).
4. **Kollox bil-mod, u banner aħmar** - rendering bis-software ([Identifikazzjoni tar-rendering bis-software](software-rendering.md)).

## Il-pannell tal-Prestazzjoni {#the-performance-panel}

| Kontroll | Default | Effett |
|---|---|---|
| Hint | | Kull frame jixxerred sett każwali stratifikat tar-ringieli viżibbli b'piż mkabbar biex jikkumpensa, ħalli s-sħana mistennija tkun eżatta f'kull baġit; iż-żamma tal-view wieqaf iżomm jgħaqqad frames sakemm kull ringiela tkun ikkontribwixxiet. |
| **Pinġi kull ringiela f'kull frame** | on | Kull frame li jibda stima ġdida jpinġi kull ringiela kandidata (sa madwar 268M); il-baġit hawn taħt isir minimu. [Sampling u baġits](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Baġit adattiv** | on | Ittawwal is-sprites għal kull frame, imbagħad ir-riżoluzzjoni tas-sħana, biex iżomm ir-rata tal-frames immirata - u jieqaf jaqta' meta l-qtugħ ma jgħinx. [Sampling u baġits](sampling-and-budgets.md#the-adaptive-budget) |
| **FPS immirati** | 60 | 20-240 (1000 bil-handle). Valuri taħt 15 jitqiesu bħala 15. |
| **Sprites / frame tal-bidu** / **Sprites / frame** | 4.00M | 65,536-268,435,456, logaritmiku. Jismu *Tal-bidu* meta l-adattiv ikun on, għax il-kontrollur iċċaqlaqha. |
| **Riżoluzzjoni tas-sħana** | 100% | 25-100%. Il-kost tal-fragments jiskala mal-kwadru: 50% jaqsam il-ħidma tal-blend b'erba', u l-qasam tas-sħana huwa lixx biżżejjed li bilkemm jidher. |
| **Raffinament progressiv** | on | Akkumula fuq frames waqt li l-view ikun wieqaf. Mitfi juri l-istima ta' frame wieħed f'kull frame. [Akkumulazzjoni](accumulation.md) |
| **Baġits tar-riżorsi** | misjuba | Baġits tar-RAM, tal-GPU u tal-thread tal-parser. [Memorja u baġits](memory-and-budgets.md#resource-budgets) |

Xejn minn dawn ma jinżamm; reload jerġa' jpoġġi d-defaults.
