---
title: "Id-dettalji tar-rendering"
nav_order: 22
has_children: true
lang: "mt"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Id-dettalji tar-rendering

Il-viewer jpinġi miljuni ta' tikkiet bħala blobs illuminati u jgħaqqadhom. Din it-taqsima tispjega t-trikki li jżommu dan malajr, u x'tfissir għandhom in-numri fl-overlay tal-statistiċi. Aqraha jekk il-viewer jidher bil-mod, jew jekk trid taħdem fuq ir-renderer.

```
data -> time window -> GPU filters -> sampling plan -> splat -> accumulate -> colour -> screen
```

Biex tara kif qed jaħdem il-kompjuter tiegħek, ara l-kaxxa tal-istatistiċi fil-lemin ta' fuq tal-view: [Pannell tal-prestazzjoni u statistiċi](performance-and-stats.md). Kliem ġdid (GPU, ringiela, sprite, heatmap) hemm fil-[glossarju](glossary.md).

## Il-problema ewlenija {#the-core-problem}

Somma ta' ramps radjali li jaqgħu fuq xulxin tiswa *N* × π*r*² fragments imħalltin għal kull frame. B'100 miljun sprite ta' raġġ ta' 8 px dan huwa 2 × 10¹⁰ fragments - madwar sekonda ta' xogħol fuq GPU tal-aqwa. Ma jistax jiġi mqabbad bil-quwwa kull frame, għalhekk il-viewer jgħaqqad:

- **ringieli ordnati skont il-ħin** - tieqa tal-ħin hija żewġ tfittxijiet binarji, u l-kost tal-playback jsegwi r-ringieli fit-tieqa, mhux is-sett tad-dejta kollu;
- **xejn għal kull ringiela fuq is-CPU għal kull frame** - ir-ringieli jgħixu fil-memorja tal-GPU, quantised; il-filtri, is-sinjali tal-gruppi, it-test tal-ħajja, it-tieqa, il-culling u l-qatgħa kollha jiġu evalwati fil-vertex shader;
- **sampling stratifikat** b'piżijiet kumpensanti meta frame ma jkunx jista' jpinġi kull ringiela, u **akkumulazzjoni progressiva** li tikkonverġi għat-tweġiba eżatta ta' kull ringiela waqt li l-view ikun għadu ([Sampling u baġits](sampling-and-budgets.md), [Akkumulazzjoni](accumulation.md));
- **throttle f'żewġ stadji** li jbiddel is-sprites għal kull frame, imbagħad ir-riżoluzzjoni tas-sħana, għal rata ta' frames ([Sampling u baġits](sampling-and-budgets.md#the-adaptive-budget));
- **baġits tal-memorja infurzati**, għalhekk dataset li ma jidholx jiġi maqtugħ b'mod viżibbli minflok ma jiġix crashed ([Residenza tal-memorja tal-GPU](gpu-memory.md)).

## Frame wieħed {#one-frame}

Il-loop tal-frame huwa [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Kull ma jinbidel bir-rata tal-frame - il-kamera, il-playhead, il-baġit - jgħix fl-engine, mhux fl-istat tal-applikazzjoni, għalhekk frame ma jiswa l-ebda xogħol ta' React; l-istat jinqara darba għal kull frame u jerġa' jinkiteb biss għal qari b'frekwenza baxxa.

1. **Dejta ġdida?** Dataset ġdid jiġi mħabbar (*Uploading N rows to the GPU*) f'frame wieħed u jiġi uploaded fil-frame li jmiss, sabiex il-messaġġ jinżamm qabel ix-xogħol jblokka l-thread. Livell ġdid jingħata lir-renderer; ir-routes tas-sħana tal-linji jinbnew jew jitneħħew.
2. **Il-playhead** jimxi 'l quddiem (limitat għal 0.1 s ta' ħin tal-arloġġ għal kull frame), jerġa' jibda jew jieqaf.
3. **Il-kamera** taqra l-buttuni, il-maws u l-gamepad; il-mirror tal-assi jiġi miżjud mal-matriċi tal-view; fuq WebGPU matriċi ta' remap tal-fond tgħaddi l-firxa tal-fond ta' three.js li tuża OpenGL għal dik ta' WebGPU.
4. **Dak li jidher**: il-firxa tal-ħin mit-timeline u mill-istorja; it-tabella tas-sinjali tal-gruppi (viżibbiltà biss meta jkun hemm qsim b'kolonna); sa erba' filtri - filtri tal-kolonni u l-għażla tal-Entitajiet; il-qsim tad-differenza.
5. **It-tabelli tal-kuluri u tal-curves** jerġa' jinbnew jekk l-issettjar tagħhom inbidel.
6. **Baġit**: il-kontrollur adattiv jissettja l-baġit tal-sprites ta' dan il-frame u r-riżoluzzjoni tas-sħana; bl-*Draw every row each frame* il-baġit jitla' biex jkopri kull ringiela kandidata.
7. **Is-signatures** jiddeċiedu x'jfisser għadu l-buffer tal-akkumulazzjoni: bidla f'xi ħaġa li tbiddel liema ringieli jikkontribwixxu jew kif (*geometry*), għall-firxa tal-ħin, jew biss għal kif jiġi kkuluriat ir-riżultat (*composite*). Ara [Akkumulazzjoni](accumulation.md#what-restarts-it).
8. **Pjan tas-sampling**: liema blokki ta' ringieli jitpinġew ([Sampling u baġits](sampling-and-budgets.md)).
9. **Mod tal-akkumulazzjoni**: reset, extend, moving average, running mean, jew idle.
10. **Ġeometrija tal-box replay** (kubi, traċċi) fuq is-CPU, biss f'dak il-mod u biss meta mhux idle.
11. **Render**: il-backend jpinġi x-xena (il-livell, il-grid, l-assi, il-boxes, it-traċċi, ir-riga), iżaqżaq is-sħana fit-target tas-sħana, jgħaqqadha fl-accumulator u jikkompożixxi s-sħana fuq ix-xena għall-canvas.
12. **L-auto-exposure** jaħdem meta l-countdown tiegħu jasal għal zero; il-probe tas-sħana tar-riga jaqra pixel wieħed kull 120 ms fil-massimu; ir-readouts jiġu ppubblikati.

Frame idle - konverġut, u xejn ma nbidel - jaqbeż ix-xena u l-splatting imma xorta **jikkompożixxi mill-ġdid**: canvas tal-WebGL maħluq mingħajr `preserveDrawingBuffer` ikollu kontenut mhux definit wara l-kompożizzjoni, għalhekk li tafdah li jibqa' juri l-aħħar frame mhux sigur. Ix-xena u t-targets tas-sħana huma l-framebuffers tal-viewer stess, u jibqgħu jiġu miżmuma, għalhekk frame idle jiswa pass fullscreen wieħed.

## Paġni f'din it-taqsima {#pages-in-this-section}

- [Iż-żewġ backends](backends.md) - WebGPU u WebGL2, kif wieħed jintgħażel, l-switches tal-URL
- [Akkumulazzjoni](accumulation.md) - reset, extend, moving average, running mean
- [Sampling u baġits](sampling-and-budgets.md) - is-sampler stratifikat, il-mod eżatt, il-baġit adattiv
- [Akkumulazzjoni half-float](half-float-accumulation.md) - firxa u preċiżjoni fuq targets ta' 16-bit
- [Residenza tal-memorja tal-GPU](gpu-memory.md) - ħażna kwantizzata tar-ringieli u l-baġit tal-GPU infurzat
- [Identifikazzjoni tar-rendering bis-software](software-rendering.md)
- [Pannell tal-prestazzjoni u statistiċi](performance-and-stats.md)
