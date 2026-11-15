---
title: "Acumulare în semiprecizie"
parent: "Detalii interne ale randării"
nav_order: 4
lang: "ro"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Acumulare în jumătate de float

Unele plăci grafice pot ține căldura doar în numere mici pe 16 biți, care ar putea tăia sau rotunji cele mai fierbinți locuri. Vizualizatorul scalează numerele ca asta să nu se vadă. Nu trebuie să faci nimic; pagina aceasta este pentru dezvoltatori.

## Pentru dezvoltatori {#for-developers}

Un dispozitiv care nu poate amesteca în texturi float pe 32 de biți (fără `float32-blendable` și `float32-filterable` pe WebGPU, fără `EXT_float_blend` pe WebGL2) primește o țintă de căldură **float pe 16 biți** (`r16float`): un maxim de 65.504 și 11 biți de mantisă. Un câmp dens ajunge la câteva sute de mii, deci o țintă pe 16 biți **taie** și **rotunjește**, iar eroarea de rotunjire crește odată cu valoarea - ceea ce se vede foarte precis: cele mai dense zone arată mult mai reci decât sunt, în timp ce zonele rare arată bine. Două mecanisme se ocupă de asta; imaginea este corectă doar dacă funcționează amândouă.

### Interval: un câștig pe fiecare împrăștiere {#range-a-gain-on-every-splat}

Fiecare împrăștiere este înmulțită cu un **câștig**, iar compozitul îl împarte la loc, deci câmpul stă în mărimea pe care semi-float-urile o gestionează bine ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimare = estimarea analitică de saturație pentru acest set de date, rază și intensitate la centru
câștig   = 2 ^ round(log2(2048 / estimare)), exponent limitat la -20..20
```

2048 lasă aproximativ de 32 de ori marjă peste vârful rampei înainte de 65.504. Câștigul este o **putere a lui doi**, deci o mică derivă în estimare nu îl schimbă - nici bufferul acumulat -, iar el face parte din [semnătura geometriei](accumulation.md#what-restarts-it), deci o schimbare repornește acumularea.

Este ancorat de estimarea analitică și, deliberat, **nu** de punctul de saturație. Saturația se aplică la compozit tocmai ca să nu repornească convergența când tragi de ea; dacă câștigul s-ar mișca odată cu ea, bufferul ar conține încă valori scrise la vechiul câștig, în timp ce compozitul ar împărți la cel nou, cele două erori s-ar anula exact, iar cursorul ar părea că nu face nimic.

Pe o țintă de 32 de biți câștigul este mereu 1.

### Precizie: cadre parțiale pornind de la zero {#precision-partial-frames-from-zero}

Un cadru unit în acumulator cu greutatea 1/n este mai întâi împrăștiat într-o **țintă de lucru** de la zero și abia apoi amestecat, în loc să fie împrăștiat direct în acumulator cu greutatea 1/n ([Acumulare](accumulation.md#why-each)). Direct, contribuția fiecărui sprite ar fi 1/n din mărimea totalului curent la care se adaugă, iar un semi-float rotunjește acele valori - cu atât mai rău cu cât pixelul este mai dens. De la zero, fiecare adendă este comparabilă cu totalul la care se alătură, adică aceeași aritmetică pe care o face deja un singur cadru.

### Efectul măsurat {#measured-effect}

Pe o scenă sintetică densă, citind câmpul în unități potrivite:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32 de biți (referință) | 6051 | 60742 | 121199 | 232744 |
| 16 biți înainte | 1372 | 6972 | 7840 | 7840 |
| 16 biți după | 5996 | 59666 | 118824 | 210357 |

Vârful a trecut de la de 30 de ori prea mic la 0,90×, iar cadrul compus se potrivește cu cel de 32 de biți până la 0,1% din luminozitatea medie.

### Testarea {#testing-it}

`?heat=f16` forțează această cale pe oricare backend - fără un comutator, aritmetica pe care o rulează doar GPU-urile mai slabe ar fi testată doar de oamenii care le rulează. `npm run smoke:f16` rulează întreaga suită de browser cu el.

Citirile anulează câștigul: auto-expunerea împarte câmpul citit la el, iar `engine.readHeatProbe()` îl trece randatorului - și așa se citește și [valoarea live de căldură a riglei](measure.md#notes).
