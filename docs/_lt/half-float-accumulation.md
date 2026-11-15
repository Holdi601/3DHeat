---
title: "Pusiau tikslusis kaupimas"
parent: "Atvaizdavimo vidus"
nav_order: 4
lang: "lt"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Pusiau tikslusis kaupimas

Kai kurios grafikos kortelės gali laikyti šilumą tik mažuose 16 bitų skaičiuose, todėl karščiausios vietos galėtų būti nukirstos arba suapvalintos. Peržiūros programa skaičius keičia masteliu, kad to nesimatytų. Jums nieko daryti nereikia; šis puslapis skirtas kūrėjams.

## Kūrėjams {#for-developers}

Įrenginys, kuris negali maišyti į 32 bitų slankiojo kablelio tekstūras (WebGPU nėra `float32-blendable` ir `float32-filterable`, WebGL2 nėra `EXT_float_blend`), gauna **16 bitų slankiojo kablelio** (`r16float`) šilumos tikslą: daugiausia 65 504 ir 11 mantisos bitų. Tankus laukas pasiekia kelis šimtus tūkstančių, todėl 16 bitų tikslas ir **nukerta**, ir **suapvalina**, o suapvalinimo paklaida auga kartu su reikšme – tai pasireiškia labai konkrečiai: tankiausios vietos atrodo gerokai šaltesnės, nei yra, o retos – atrodo gerai. Tam tvarkyti yra du mechanizmai; vaizdas teisingas tik tada, kai veikia abu.

### Intervalas: stiprinimas kiekvienam išsklaidymui {#range-a-gain-on-every-splat}

Kiekvienas išsklaidymas padauginamas iš **stiprinimo**, o kompozitas jį padalija atgal, todėl laukas patenka į dydžių diapazoną, kurį pusiau tikslieji skaičiai tvarko gerai ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = analitinis soties įvertinimas šiam duomenų rinkiniui, spinduliui ir centro intensyvumui
gain     = 2 ^ round(log2(2048 / estimate)), eksponentas apribotas -20..20
```

2048 palieka maždaug 32 kartus rezervo virš skalės viršaus iki 65 504. Stiprinimas yra **dvejeto laipsnis**, todėl nedidelis įvertinimo poslinkis jo nepakeičia – nei kaupiklio buferio; jis yra [geometrijos parašo](accumulation.md#what-restarts-it) dalis, todėl pasikeitimas paleidžia kaupimą iš naujo.

Jis susietas su analitiniu įvertinimu, o ne su soties tašku, sąmoningai. Sotis taikoma kompozito tikslume, kad, tempiant soties slankiklį, konvergencija niekada nebūtų paleidžiama iš naujo; jei stiprinimas judėtų kartu su juo, buferis vis dar turėtų reikšmes, įrašytas su senu stiprinimu, o kompozitas dalytų iš naujo – abi paklaidos tiksliai susinaikintų, ir slankiklis atrodytų, kad nieko nedaro.

32 bitų tikslui stiprinimas visada 1.

### Tikslumas: dalinai kadrai nuo nulio {#precision-partial-frames-from-zero}

Kadras, sujungtas į kaupiklį su svoriu 1/n, pirmiausia išsklaidomas į **laikinąjį tikslą** nuo nulio, o paskui sumaišomas, o ne išsklaidomas tiesiai į kaupiklį su 1/n svoriu ([Kaupimas](accumulation.md#why-each)). Tiesiogiai kiekvieno spraito indėlis būtų 1/n dydžio nuo bėgančios sumos, prie kurios jis pridedamas, o pusiau tikslusis skaičius tuos dydžius suapvalina iki nulio – ir kuo tankesnis pikselis, tuo blogiau. Nuo nulio kiekvienas narys yra palyginamas su suma, prie kurios jis prisijungia, o tai yra ta pati aritmetika, kurią jau atlieka vienas kadras.

### Išmatuotas poveikis {#measured-effect}

Ant tankios sintetinės scenos, nuskaičius lauką suderintais vienetais:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32 bitai (nuoroda) | 6051 | 60742 | 121199 | 232744 |
| 16 bitų prieš | 1372 | 6972 | 7840 | 7840 |
| 16 bitų po | 5996 | 59666 | 118824 | 210357 |

Viršūnė pakito nuo 30 kartų per maža iki 0,90 karto, o sudarytas kadras sutampa su 32 bitų kadru 0,1 % nuo vidutinio ryškumo.

### Kaip tai patikrinti {#testing-it}

`?heat=f16` priverčia šį kelią bet kurioje sąsajoje – be jungiklio aritmetika, kurią vykdo tik silpnesni GPU, būtų bandoma tik tų, kurie jais naudojasi. `npm run smoke:f16` paleidžia visą naršyklės testų rinkinį su juo.

Nuskaitymai panaikina stiprinimą: automatinė ekspozicija nuskaitytą lauką dalija iš jo, o `engine.readHeatProbe()` perduoda jį atvaizdavimo sistemai – taip pat taip nuskaitomas [liniuotės gyvas šilumos rodmuo](measure.md#notes).
