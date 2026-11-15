---
title: "Gamepad dhe HOTAS"
parent: "Kamera dhe kontrollet"
nav_order: 1
lang: "sq"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Gamepad dhe HOTAS

Mund ta fluturosh kamerën me një kontroller stilit Xbox në vend të tastierës. Përdore kur do të mbështetesh pas dhe të shikosh përreth në një skenë të madhe. Hyrja e tij **shton** në atë të tastierës, kështu që mund t'i përdorësh të dyja njëkohësisht.

## Lidh një kontroller {#connect-a-controller}

1. Fute kontrollerin (ose çifto).
2. Kliko pamjen dhe shtyp çdo buton të kontrollerit. Shfletuesit e shfaqin një kontroller vetëm pasi ai dërgon hyrjen e parë.
3. Hap **Kamera dhe skena → Gamepad**. Lista e pajisjeve e tregon me `●`.
4. Shtyje levën e majtë për të fluturuar, të djathtën për të shikuar. Nëse kamera lëviz vetë me levat në qendër, ngrije **Zonën e vdekur**.

Çdo pajisje që shfletuesi e lidh me paraqitjen standarde të gamepad-it funksionon. Një levë fluturimi ose gazi (HOTAS) injorohet si parazgjedhje; shih më poshtë.

## Lidhja e butonave {#mapping}

| Kontrolli | Efekti |
|---|---|
| Leva e majtë | Lëviz: përpara/prapa dhe anash |
| Leva e djathtë | Shiko: rrotullim dhe lartësi, me *Shpejtësinë e shikimit* gradë në sekondë me devijim të plotë |
| `RT` / `LT` (analog) | Lart / poshtë; në projeksionin paralel, zmadho / zvogëlo |
| `RB` (i mbajtur) | 6× më shpejt |
| `LB` (i mbajtur) | 15% shpejtësi |
| `A` (i mbajtur) | 3× sprint (bashkohet me RB/LB) |
| `Y` (shtypje) | Kornizo të dhënat |

Numrat e butonave ndjekin paraqitjen standarde: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; levat te boshtet 0-1 (e majta) dhe 2-3 (e djathta).

## Cilësimet e gamepad-it {#the-gamepad-settings}

Te **Kamera dhe skena → Gamepad**. **Cilësimet** / **Fshih** hap kontrollet e rregullimit.

| Kontrolli | Parazgjedhja | Gama (kërcim) | Kuptimi |
|---|---|---|---|
| **Aktive** | aktive | | |
| Gjendja e pajisjes | | | Çdo pajisje e lidhur, `●` kur ndiqet, `○` kur jo, me *- not an XInput pad, ignored* ose *- not an XInput pad, used anyway* për pajisje jo standarde. Pa asnjë: *No pad detected. Browsers only reveal a controller after it sends its first input - press a button on it.* |
| **Përdor pajisjen** | *Vetëm XInput pads (e rekomanduar)* | | Shfaqet kur është lidhur një pajisje jo standarde. Zgjidh një pajisje sipas emrit për ta ndjekur atë në vend të kësaj. |
| **Shpejtësia e shikimit** | 150°/s | 20-540 (5000) | Shpejtësia e kthimit me devijim të plotë të levës së djathtë. |
| **Zona e vdekur** | 12% | 0-50% (95%) | Radiale: një shtytje diagonale nuk rrjedh kurrë në një bosht vetëm. Ngrije nëse kamera lëviz me levat në qendër. |
| **Kurba e levës** | x² | linear (1) deri x⁴ (16) | Eksponenti i përgjigjes pas zonës së vdekur: kontroll më i imët afër qendrës, shpejtësi e plotë në skaj. |
| **Përmbys Y të levës** | joaktive | | |
| **Ndërro levat** | joaktive | | Lëviz me levën e djathtë, shiko me atë të majtë. |

Formësimi i levës: me devijimin *m* (gjatësia e vektorit të levës) dhe zonën e vdekur *d*, dalja = ((m - d) / (1 - d)) ^ kurba përgjatë drejtimit të levës, dhe 0 brenda zonës së vdekur.

## Pse vetëm gamepad-et standarde si parazgjedhje {#why-only-standard-pads-by-default}

Gamepad API raporton **çdo** pajisje HID me bosht - levat e fluturimit, gazet, pedalet, timonët - dhe ato nuk qëndrojnë në qendër: një bosht përdredhjeje ose një levë gazi qëndron në devijim të plotë kur askush nuk e prek. Lexuar si levë, kjo është një hyrje e përhershme me shpejtësi të plotë që asnjë zonë e vdekur nuk mund ta pengojë, dhe kamera rrotullohet vetvetiu që nga hapja e faqes (dhe çdo modalitet nxehtësie duket i prishur, sepse një kamerë në lëvizje rinis grumbullimin çdo kornizë).

Prandaj një pajisje ndiqet vetëm kur shfletuesi raporton `mapping: "standard"`, mënyra e tij për të thënë "një gamepad stilit XInput me boshtet aty ku pret". Pajisjet e tjera listohen dhe shënohen si të injoruara, dhe **Përdor pajisjen** zgjedh një të tillë hapur - për shembull për të fluturuar kamerën me një HOTAS. Pasi një gamepad ndiqet, kamera mbetet me të, kështu që dy kontrollerë nuk përplasen për kamerën sipas renditjes.

**HOTAS:** lexohen vetëm boshtet 0-3 (dy levat) dhe butonat standardë. Një gaz ose pedale në boshte të tjera nuk bën asgjë, dhe një levë ose gaz, boshtet e të cilës nuk qëndrojnë në qendër, mund të kërkojë një **Zonë të vdekur** më të madhe.

Shfletuesit e fshehin një kontroller derisa ai të dërgojë hyrjen e parë, kështu që një gamepad i lidhur që nuk është prekur ende nuk ekziston për faqen.
