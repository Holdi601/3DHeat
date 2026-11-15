---
title: "Acumulació en mitja precisió"
parent: "Detalls interns del renderitzat"
nav_order: 4
lang: "ca"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Acumulació de coma flotant de 16 bits

Algunes targetes gràfiques només poden guardar la calor en números petits de 16 bits, que podrien tallar o arrodonir els llocs més calents. El visor escala els números perquè això no es vegi. No has de fer res; aquesta pàgina és per als desenvolupadors.

## Per als desenvolupadors {#for-developers}

Un dispositiu que no pot barrejar en textures de coma flotant de 32 bits (sense `float32-blendable` i `float32-filterable` a WebGPU, sense `EXT_float_blend` a WebGL2) rep un objectiu de calor de **coma flotant de 16 bits** (`r16float`): un màxim de 65.504 i 11 bits de mantissa. Un camp dens arriba a diversos centenars de milers, així que un objectiu de 16 bits **talla** i **arrodoneix**, i l'error d'arrodoniment creix amb el valor. Això es presenta de manera molt específica: les zones més denses es veuen molt més fredes del que són, mentre que les zones disperses es veuen bé. Hi ha dos mecanismes que ho tracten; la imatge només és correcta si tots dos funcionen.

### Rang: un guany a cada splat {#range-a-gain-on-every-splat}

Cada splat es multiplica per un **guany**, i la composició el torna a dividir, de manera que el camp es queda en la magnitud que els mitjans de coma flotant gestionen bé ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimació = estimació analítica de saturació per a aquest conjunt de dades, radi i intensitat central
guany     = 2 ^ round(log2(2048 / estimació)), exponent limitat a -20..20
```

2048 deixa uns 32× de marge per sobre del cim de la rampa abans de 65.504. El guany és una **potència de dos**, de manera que una petita deriva de l'estimació el deixa —i el buffer acumulat— sense canvis, i forma part de la [signatura de geometria](accumulation.md#what-restarts-it), de manera que un canvi reinicia l'acumulació.

S'ancora a l'estimació analítica i deliberadament **no** al punt de saturació. La saturació s'aplica a la composició precisament perquè arrossegar-la mai no reinici la convergència; si el guany es mogués amb ella, el buffer encara tindria valors escrits amb el guany antic mentre la composició els dividiria pel nou, els dos errors es cancel·larien exactament, i el control lliscant semblaria que no fa res.

En un objectiu de 32 bits el guany sempre és 1.

### Precisió: fotogrames parcials des de zero {#precision-partial-frames-from-zero}

Un fotograma fusionat a l'acumulador amb pes 1/n primer es fa splat en un **objectiu auxiliar** des de zero i després es barreja, en lloc de fer splat directament a l'acumulador amb pes 1/n ([Acumulació](accumulation.md#why-each)). Directament, la contribució de cada sprite seria 1/n de la mida del total corrent al qual s'afegeix, i un mig de coma flotant les arrodoneix; i pitjor com més dens és el píxel. Des de zero, cada sumand és comparable al total al qual s'uneix, que és la mateixa aritmètica que ja fa un sol fotograma.

### Efecte mesurat {#measured-effect}

En una escena sintètica densa, llegint el camp en unitats equivalents:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32 bits (referència) | 6051 | 60742 | 121199 | 232744 |
| 16 bits abans | 1372 | 6972 | 7840 | 7840 |
| 16 bits després | 5996 | 59666 | 118824 | 210357 |

El pic va passar de 30× massa baix a 0,90×, i el fotograma compost coincideix amb el de 32 bits fins al 0,1 % de la lluminositat mitjana.

### Provar-ho {#testing-it}

`?heat=f16` força aquest camí en qualsevol dels dos backends: sense un interruptor, l'aritmètica que només executen les GPU més febles només es provaria mai per les persones que les executen. `npm run smoke:f16` executa tota la suite del navegador amb ell.

Les lectures desfan el guany: l'auto-exposició divideix el camp llegit per ell, i `engine.readHeatProbe()` el passa al renderitzador —que també és com es llegeix la [lectura de calor en directe del regle](measure.md#notes).
