---
title: "Grumbullimi me gjysmë-pikë lundruese"
parent: "Brendësitë e vizatimit"
nav_order: 4
lang: "sq"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Grumbullimi me gjysmë-pikë lundruese

Disa karta grafike mund të mbajnë nxehtësinë vetëm në numra të vegjël 16-bit, që mund ta presin ose rrumbullosin pikën më të nxehtë. Shikuesi i shkallëzon numrat, kështu që kjo nuk duket. Nuk ke nevojë të bësh asgjë; kjo faqe është për zhvilluesit.

## Për zhvilluesit {#for-developers}

Një pajisje që nuk mund të përzierë në tekstura me pikë lundruese 32-bit (nuk ka `float32-blendable` dhe `float32-filterable` në WebGPU, nuk ka `EXT_float_blend` në WebGL2) merr një objektiv nxehtësie me **pikë lundruese 16-bit** (`r16float`): maksimumi 65.504 dhe 11 bite mantisë. Një fushë e dendur arrin disa qindra mijëra, kështu që një objektiv 16-bit **pritet** dhe **rrumbullohet**, dhe gabimi i rrumbullimit rritet me vlerën - gjë që duket shumë specifike: zonat më të dendura lexohen shumë më të ftohta se sa janë, ndërsa zonat e rralla duken në rregull. Dy mekanizma e trajtojnë; figura është e saktë vetëm nëse të dy funksionojnë.

### Gama: një fitim në çdo përhapje {#range-a-gain-on-every-splat}

Çdo përhapje shumëzohet me një **fitim**, dhe përbërja e pjesëton përsëri, kështu që fusha qëndron në madhësinë që gjysma-pikat i trajtojnë mirë ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = analytic saturation estimate for this dataset, radius and centre intensity
gain     = 2 ^ round(log2(2048 / estimate)),  exponent clamped to -20..20
```

2048 lë rreth 32× rezervë mbi majën e shkallës përpara 65.504. Fitimi është **fuqi e dyshe**, kështu që një lëvizje e vogël në vlerësim e lë atë - dhe buffer-in e grumbulluar - të pandryshuar, dhe është pjesë e [nënshkrimit të gjeometrisë](accumulation.md#what-restarts-it), kështu që një ndryshim rinis grumbullimin.

Është i lidhur me vlerësimin analitik dhe qëllimisht **jo** me pikën e ngopjes. Ngopja zbatohet në përbërje pikërisht që tërheqja e saj të mos rinisë kurrë konvergjencën; nëse fitimi lëvizte me të, buffer-i do të mbante ende vlera të shkruara me fitimin e vjetër ndërsa përbërja pjesëtonte me të riun, dy gabimet do të anuloheshin saktësisht, dhe rrëshqitësi do të dukej sikur nuk bën asgjë.

Në një objektiv 32-bit fitimi është gjithmonë 1.

### Saktësia: korniza të pjesshme nga zero {#precision-partial-frames-from-zero}

Një kornizë e bashkuar në grumbullues me peshë 1/n fillimisht përhapet në një **objektiv të përkohshëm** nga zero dhe pastaj përzihet, në vend që të përhapet drejtpërdrejt në grumbullues me peshë 1/n ([Grumbullimi](accumulation.md#why-each)). Drejtpërdrejt, kontributi i çdo sprite-i do të ishte 1/n e madhësisë së totalit në ecje ku shtohet, dhe një gjysmë-pikë i rrumbullos ato - aq më keq sa më i dendur të jetë piksel. Nga zero, çdo shtesë është e krahasueshme me totalin ku bashkohet, që është e njëjta aritmetikë që bën tashmë një kornizë e vetme.

### Efekti i matur {#measured-effect}

Në një skenë sintetike të dendur, duke lexuar fushën në njësi të krahasueshme:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-bit (referencë) | 6051 | 60742 | 121199 | 232744 |
| 16-bit para | 1372 | 6972 | 7840 | 7840 |
| 16-bit pas | 5996 | 59666 | 118824 | 210357 |

Maksimumi shkoi nga 30× shumë i ulët në 0,90×, dhe korniza e përbërë përputhet me atë 32-bit deri në 0,1% të ndriçimit mesatar.

### Testimi {#testing-it}

`?heat=f16` e detyron këtë rrugë në çdo backend - pa një çelës, aritmetika që e ekzekutojnë vetëm GPU-të më të dobëta do të testohej vetëm nga njerëzit që i ekzekutojnë. `npm run smoke:f16` e ekzekuton të gjithë paketën e shfletuesit me të.

Leximet e kthejnë fitimin mbrapsht: ekspozimi automatik e pjesëton fushën e lexuar me të, dhe `engine.readHeatProbe()` ia kalon vizatuesit - gjë që është edhe mënyra si lexohet [leximi i drejtpërdrejtë i nxehtësisë së vizores](measure.md#notes).
