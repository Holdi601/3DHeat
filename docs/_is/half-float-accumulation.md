---
title: "Söfnun með hálfri nákvæmni"
parent: "Innri hlutar myndvinnslu"
nav_order: 4
lang: "is"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Hálffleytisöfnun

Sum skjákort geta aðeins geymt hita í litlum 16 bita tölum, sem gætu skorið af eða námundað heitustu staðina. Skoðarinn skalar tölurnar svo þetta sjáist ekki. Þú þarft ekki að gera neitt; þessi síða er fyrir forritara.

## Fyrir forritara {#for-developers}

Tæki sem getur ekki blandað í 32 bita fleytiáferðir (enginn `float32-blendable` og `float32-filterable` á WebGPU, enginn `EXT_float_blend` á WebGL2) fær **16 bita fleytimark** (`r16float`) fyrir hita: hámark 65.504 og 11 bita mantissu. Þétt svæði fara upp í nokkur hundruð þúsund, svo 16 bita mark bæði **klippir** og **námundar**, og námundunarskekkjan vex með gildinu - sem birtist mjög sérstaklega: þéttustu svæðin mælast miklu kaldari en þau eru, en strjál svæði líta vel út. Tvær aðferðir taka á þessu; myndin er aðeins rétt ef hvor tveggja virkar.

### Svið: ávinningur á hverja sprautun {#range-a-gain-on-every-splat}

Hver sprautun er margfölduð með **ávinningi**, og samsetningin deilir honum aftur út, svo sviðið liggur í þeirri stærðargráðu sem hálffleytitölur ráða vel við ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = analytic saturation estimate for this dataset, radius and centre intensity
gain     = 2 ^ round(log2(2048 / estimate)),  exponent clamped to -20..20
```

2048 skilur eftir um 32× svigrúm yfir efsta hluta hallans áður en 65.504 er náð. Ávinningurinn er **veldi af tveimur**, svo lítil hliðrun á matinu skilur hann - og safnaða bufferinn - óbreyttan, og hann er hluti af [rúmfræðiundirskriftinni](accumulation.md#what-restarts-it), svo breyting endurræsir söfnunina.

Hann er festur við analytíska matið og viljandi **ekki** við mettunarpunktinn. Mettunin er beitt við samsetningu einmitt til þess að það að draga hana endurræsi aldrei samþjöppun; ef ávinningurinn hreyfðist með henni héldi bufferinn enn gildum sem skrifuð voru með gamla ávinningnum á meðan samsetningin deilir með þeim nýja, villurnar tvær myndu hætta nákvæmlega við hvor aðra, og sleðinn virtist gera ekkert.

Á 32 bita marki er ávinningurinn alltaf 1.

### Nákvæmni: hlutrammar frá núlli {#precision-partial-frames-from-zero}

Rammi sem er sameinaður söfnuninni með vigt 1/n er fyrst sprautaður inn á **vinnumark** frá núlli og síðan blandaður inn, frekar en sprautaður beint í söfnunina með vigt 1/n ([Söfnun](accumulation.md#why-each)). Beint myndi framlag hvers sprita vera 1/n af stærð keyrandi summunnar sem það bætist við, og hálffleytitala námundar þau burt - því verr sem pixillinn er þéttari. Frá núlli er hver viðbót sambærileg við summuna sem hún bætist við, sama reikningsaðgerð og einn rammi framkvæmir nú þegar.

### Mæld áhrif {#measured-effect}

Á þéttri tilbúinni senu, þegar sviðið er lesið í samanburðarhæfum einingum:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32 bita (viðmið) | 6051 | 60742 | 121199 | 232744 |
| 16 bita áður | 1372 | 6972 | 7840 | 7840 |
| 16 bita eftir | 5996 | 59666 | 118824 | 210357 |

Toppgildið fór úr 30× of lágu í 0,90×, og samsetti ramminn samsvarar 32 bita rammanum innan 0,1% af meðalbirtu.

### Prófun á þessu {#testing-it}

`?heat=f16` þvingar þessa leið á hvorum bakenda - án rofans væri reikningurinn, sem aðeins veikari GPU keyra, aðeins prófaður af fólkinu sem keyrir þá. `npm run smoke:f16` keyrir allan vafraprófunarsvítuna með henni.

Lestur til baka afturkallar ávinninginn: sjálfvirk lýsing deilir lesna sviðinu með honum, og `engine.readHeatProbe()` sendir hann til teiknarans - sem er líka hvernig [lifandi hitalestur reglustikunnar](measure.md#notes) er lesinn.
