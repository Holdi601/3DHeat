---
title: "Ġeneratur sintetiku"
parent: "Kif tidħol id-data"
nav_order: 5
lang: "mt"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Ġeneratur sintetiku

M'għandekx dejta tiegħek? Agħfas buttuna waħda u 3DHeat jinvinta battalja finta għalik, kemm trid żgħira jew kbira.

1. Iftaħ il-pannell **Dataset** fis-sidebar tal-Heatmap (taħt **Sors**).
2. Imexxi 'l isfel sa **Ġeneratur sintetiku**.
3. Issettja **Ringieli (miljuni)**. Ipprova 1 l-ewwel: id-default ta' 8 miljun huwa tqil għal prova l-ewwel.
4. Agħfas **Iġġenera**.

![Miljun ringiela, 8 timijiet, mpinġija fis-Sħana tat-tim](../assets/img/en/synthetic-generator-team-heat.webp)

Il-pannell **Dataset** jista' jiġġenera dataset minflok ma jtella' wieħed. Huwa maħsub għal żewġ affarijiet: biex tipprova l-viewer mingħajr dejta tiegħek, u biex tiċċekkja jekk għadd partikolari ta' ringieli, raġġ tal-sprite u baġit iżommu frame-rate utilizzabbli fuq magna *qabel* ma tkun impenjat f'tagħbija reali kbira. Il-moviment tiegħu huwa ffurmat bħal logħba ta' battalja royale - it-timijiet jibdew imqassmin, imbagħad jingħabru flimkien - għax storbju uniformi jidher tajjeb f'kull baġit u jaħbi eżattament l-artifacts li jkun ta' min jinstab.

## Kontrolli {#controls}

| Kontroll | Default | Tifsira |
|---|---|---|
| **Ringieli (miljuni)** | 8 | Ringieli li jiġu ġġenerati. Jitnaqqsu għal numru sħiħ ta' tick għal kull plejer. |
| **Timijiet** | 8 | Għadd ta' gruppi (mill-inqas 1). |
| **Għal kull tim** | 12 | Plejers għal kull grupp (mill-inqas 1). |
| **Nofs id-daqs tal-mappa (m)** | 4000 | Nofs il-wisa' taż-żona li tista' tintlaħaq fuq X u Z. |
| Linja tal-istima | | "≈ X GB ta' RAM, Y GB fuq il-GPU wara l-quantisation." (madwar 26 bytes ta' RAM u 8 bytes fuq il-GPU għal kull ringiela). |
| **Iġġenera** | | Jiġġenera fil-worker tal-ingest, bil-progress, u jieħu post kull dataset mgħobbi. |

Il-ġenerazzjoni tieħu post fil-worker tal-isfond, għalhekk għexieren ta' miljuni ta' ringieli ma jiffrizzawx il-paġna.

## Dak li jiġġenera {#what-it-generates}

Minn [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Kolonni:** pożizzjoni, ħin, persuna (`P000`, `P001`, ...), grupp (`Team 1`, `Team 2`, ...), yaw u pitch, u l-ħajjiet. L-ebda kolonna ta' sessjoni u l-ebda kolonna ta' filtri.
- **Ħin:** kampjun wieħed għal kull plejer kull 0.25 s, mill-0 'il quddiem (ħin relattiv, l-ebda arloġġ tal-ħajt).
- **Moviment:** kull tim jibda f'settur tiegħu ta' ċirku f'55-95% tan-nofs tal-medda. Ċirku sikur iċċentrat ħdejn in-nofs (imdawwar każwalment sa kwart tan-nofs tal-medda) jitqallas sa 8% tan-nofs tal-medda f'sitt fażijiet b'plateaus; kull plejer jidbel lejn punt li jdur ġewwa fih, b'damping u storbju. L-għoli jitla' u jinżel bejn 0 u 220 m.
- **Direzzjoni tal-ħarsa:** yaw skont id-direzzjoni tal-moviment, pitch mill-veloċità vertikali.
- **Jerġa' jinħoloq bl-istess mod:** is-seed każwali huwa fiss (1337), għalhekk l-istess settings dejjem jagħtu l-istess dejta.

Kull mod tas-sħana, il-box replay u s-sħana tal-linji (traċċi sħaħ, għax m'hemm l-ebda kolonna ta' avvenimenti) jaħdmu fuqu. L-istorja tal-ħajja taħdem ukoll.
