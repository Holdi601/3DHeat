---
title: "Pooltäpne akumulatsioon"
parent: "Renderdamise sisemine tööpõhimõte"
nav_order: 4
lang: "et"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Pooltäpne akumulatsioon

Mõned graafikakaardid suudavad soojust hoida ainult väikestes 16-bitistes arvudes, mis võiksid kõige kuumemad kohad ära lõigata või ümardada. Vaataja skaleerib arve, nii et seda ei paista. Sul pole midagi teha; see leht on arendajatele.

## Arendajatele {#for-developers}

Seade, mis ei suuda blendida 32-bitistesse ujukomatekstuuridesse (WebGPU-l pole `float32-blendable` ja `float32-filterable`, WebGL2-l pole `EXT_float_blend`), saab **16-bitise ujukomaga** (`r16float`) soojussihtmärgi: maksimum 65 504 ja 11 bitti mantissi. Tihe väli jõuab mitmesaja tuhandeni, seega 16-bitine sihtmärk nii **lõikab** kui ka **ümardab**, ja ümardusviga kasvab väärtusega. See avaldub väga konkreetselt: kõige tihedamad alad näivad palju jahedamad, kui nad tegelikult on, samal ajal kui hõredad alad näevad korras välja. Kaks mehhanismi tegelevad sellega; pilt on õige ainult siis, kui mõlemad töötavad.

### Ulatus: võimendus igal splatil {#range-a-gain-on-every-splat}

Iga splat korrutatakse **võimendusega** ja komposiit jagab selle tagasi, nii et väli asub suurusjärgus, mida pooltäpsed arvud hästi käsitlevad ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = selle andmestiku, raadiuse ja keskme intensiivsuse analüütiline küllastushinnang
gain     = 2 ^ round(log2(2048 / estimate)),  eksponent piiratud vahemikku -20..20
```

2048 jätab skaala tipust umbes 32× varu enne 65 504. Võimendus on **kahe aste**, nii et väike triiv hinnangus jätab selle ja kogutud puhvri muutmata. See on osa [geomeetria signatuurist](accumulation.md#what-restarts-it), seega muutus taaskäivitab akumulatsiooni.

Võimendus on seotud analüütilise hinnanguga ja tahtlikult **mitte** küllastuspunktiga. Küllastus rakendatakse komposiidis just selleks, et selle lohistamine ei taaskäivitaks koondumist. Kui võimendus liiguks koos sellega, sisaldaks puhver ikka vanal võimendusel kirjutatud väärtusi, samal ajal kui komposiit jagaks uue võimendusega. Need kaks viga tühistaksid täpselt teineteise ja liugur näiks, et ei tee midagi.

32-bitisel sihtmärgil on võimendus alati 1.

### Täpsus: osalised kaadrid nullist {#precision-partial-frames-from-zero}

Kaader, mis liidetakse kogujasse kaaluga 1/n, splatitakse kõigepealt **abipuhvrisse** nullist ja alles siis segatakse sisse. Seda tehakse selle asemel, et splatida otse kogujasse kaaluga 1/n ([Akumulatsioon](accumulation.md#why-each)). Otse korral oleks iga spraidi panus 1/n selle jooksva summa suurusest, millele see liidetakse, ja pooltäpne arv ümardab need ära, seda rohkem, mida tihedam on pikslil. Nullist alates on iga liidetav võrreldav summaga, millega ta liitub. See on sama aritmeetika, mida üks kaader juba teeb.

### Mõõdetud mõju {#measured-effect}

Tihedal sünteetilisel stseenil, väljal lugemisel ühtsetes ühikutes:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-bitine (viide) | 6051 | 60742 | 121199 | 232744 |
| 16-bitine enne | 1372 | 6972 | 7840 | 7840 |
| 16-bitine pärast | 5996 | 59666 | 118824 | 210357 |

Tipp läks 30× liiga madalast 0,90×-ni, ja komposiitkaader vastab 32-bitisele 0,1% täpsusega keskmisest heledusest.

### Testimine {#testing-it}

`?heat=f16` sunnib selle tee kummalegi taustsüsteemile. Ilma selle lüliti oleks aritmeetikat, mida ainult nõrgemad GPU-d jooksutavad, testitud ainult nende inimeste poolt, kes neid jooksutavad. `npm run smoke:f16` käivitab kogu brauseritesti selle lülitiga.

Lugemised võtavad võimenduse tagasi: automaatne säritus jagab loetud välja selle järgi, ja `engine.readHeatProbe()` annab selle renderdajale. Nii loetakse ka [joonlaua elava soojuse näit](measure.md#notes).
