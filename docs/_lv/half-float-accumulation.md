---
title: "Pusprecizitātes uzkrāšana"
parent: "Renderēšanas iekšējā uzbūve"
nav_order: 4
lang: "lv"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Pusprecizitātes uzkrāšana

Dažas grafikas kartes var glabāt karstumu tikai mazos 16 bitu skaitļos, kas varētu nogriezt vai noapaļot karstākās vietas. Skatītājs skaitļus mērogo, lai tas neparādītos. Jums nekas nav jādara; šī lapa ir izstrādātājiem.

## Izstrādātājiem {#for-developers}

Ierīce, kas nevar sajaukties 32 bitu peldošā komata tekstūrās (WebGPU bez `float32-blendable` un `float32-filterable`, WebGL2 bez `EXT_float_blend`), saņem **16 bitu peldošā komata** (`r16float`) siltuma mērķi: maksimums 65 504 un 11 bitu mantisa. Blīvs lauks sasniedz vairākus simtus tūkstošu, tāpēc 16 bitu mērķis gan **apgriež**, gan **noapaļo**, un noapaļošanas kļūda aug līdz ar vērtību. Tas izpaužas ļoti konkrēti: blīvākās vietas izskatās daudz vēsākas, nekā tās patiesībā ir, bet retās vietas izskatās labi. Divi mehānismi to risina; attēls ir pareizs tikai tad, ja abi darbojas.

### Diapazons: pieaugums katram izlejumam {#range-a-gain-on-every-splat}

Katrs izlejums tiek reizināts ar **pieaugumu**, un kompozīcija to atkal dala. Tā lauks paliek skaitļu lielumā, ko pusprecizitātes skaitļi apstrādā labi ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = analytic saturation estimate for this dataset, radius and centre intensity
gain     = 2 ^ round(log2(2048 / estimate)),  exponent clamped to -20..20
```

2048 atstāj aptuveni 32× rezervi virs rampas augšdaļas līdz 65 504. Pieaugums ir **divu pakāpe**, tāpēc neliela novirze aplēsē to neatstāj nemainītu — un uzkrāto buferi nemainītu —, un tas ir daļa no [ģeometrijas paraksta](accumulation.md#what-restarts-it), tāpēc izmaiņa restartē uzkrāšanu.

Tas ir piesaistīts analītiskajai aplēsei un tīši **nav** piesaistīts piesātinājuma punktam. Piesātinājums tiek piemērots kompozīcijā tieši tāpēc, lai tā vilkšana nekad neatiestatītu konverģenci. Ja pieaugums pārvietotos kopā ar to, bufers joprojām saturētu vērtības, kas ierakstītas ar veco pieaugumu, kamēr kompozīcija dalītu ar jauno. Abas kļūdas precīzi atceltos, un slīdnis šķistu, ka nedara neko.

Pie 32 bitu mērķa pieaugums vienmēr ir 1.

### Precizitāte: daļējie kadri no nulles {#precision-partial-frames-from-zero}

Kadrs, kas sapludināts uzkrājējā ar svaru 1/n, vispirms tiek izzīmēts **palīgmērķī** no nulles un tikai tad sajaukts. Tas nenotiek tieši uzkrājējā ar svaru 1/n ([Uzkrāšana](accumulation.md#why-each)). Ja izzīmētu tieši, katra spraita ieguldījums būtu 1/n no skrienošās summas, kurai tas pievienojas, un pusprecizitātes skaitlis šos noapaļotu nulle. Jo blīvāks pikselis, jo sliktāk. No nulles katrs papildinājums ir salīdzināms ar summu, kurai tas pievienojas, un tā ir tā pati aritmētika, ko jau veic viens kadrs.

### Izmērītā ietekme {#measured-effect}

Blīvā sintētiskā ainā, lasot lauku saskaņotās vienībās:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32 bitu (atsauce) | 6051 | 60742 | 121199 | 232744 |
| 16 bitu pirms | 1372 | 6972 | 7840 | 7840 |
| 16 bitu pēc | 5996 | 59666 | 118824 | 210357 |

Virsotne pārgāja no 30× par zemu līdz 0,90×, un saliktais kadrs atbilst 32 bitu kadram līdz 0,1% no vidējās spilgtuma.

### Testēšana {#testing-it}

`?heat=f16` piespiež šo ceļu abos renderētājos. Bez slēdža aritmētika, ko izpilda tikai vājāki GPU, tiktu pārbaudīta tikai tad, kad to palaiž cilvēki. `npm run smoke:f16` palaiž visu pārlūka testu kopu ar to.

Nolasījumi atceļ pieaugumu: automātiskā ekspozīcija dala nolasīto lauku ar to, un `engine.readHeatProbe()` to nodod renderētājam. Tā arī tiek nolasīts [lineāla tiešais siltuma rādījums](measure.md#notes).
