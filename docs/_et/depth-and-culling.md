---
title: "Sügavus ja eemaldamine"
parent: "Soojusrežiimid"
nav_order: 4
lang: "et"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Sügavus ja kärpimine

Sügavus paneb künkad ja seinad peitma nende taha jääva soojuse, nagu päris sein peidab inimese. Kauguse järgi kärpimine jätab alles ainult soojuse, mis jääb kaamerast lähema ja kaugema kauguse vahele.

![Madal kaamera künka taga, Peida maastiku taha väljas (vasakul) ja sees (paremal)](../assets/img/en/depth-and-culling-terrain.webp)

![Kauguse järgi kärpimine, Kaugel 400 m ja Lõika ka taset sees: kaardi lõik kaamera ümber](../assets/img/en/depth-and-culling-far.webp)

Ilma sügavuseta on soojuskaart 3D [taseme](levels.md) peal lame ülekate: kõik, mis andmekogumis on, helendab iga seina kaudu täistugevusega, taseme antud sügavusvihjed tühistuvad ja hoone sees olev kuumkoht näeb välja samasugune nagu selle katusel oleva. Jaotis **Sügavus** paneb taseme peitma selle taha jäävat; **Kauguse järgi kärpimine** piirab soojust kaamera ümber oleva kesta või plaadiga; [Lõige](slice.md) lõikab maailmast plaadi välja. Kõik kolm kehtivad soojusrežiimidele ja muudavad, millised read panustavad, seega nende muutmine taaskäivitab akumulatsiooni.

## Sügavus {#depth}

Mõlemad juhtnupud vajavad [taset](levels.md) - kaardipilti või 3D mudelit. Ilma tasemeta pole midagi, mille taha peita, ja need ei tee midagi. Mõlemad on välja lülitatud, kui [Lameda maapinna tasandile](sprite-shape.md#flatten-onto-ground-plane) on sees.

### Peida maastiku taha {#hide-behind-terrain}

**Peida maastiku taha** (vaikimisi sees): andmepunkt, mille lähim pind kaamera suunas on *maapind* (mitte ehitis), visatakse täielikult välja, mitte ei tuhmistata.

Maastik ja seinad on läbipaistmatud erinevalt. Sa vaatad *läbi* seina tahtlikult, et näha, millisel korrusel liiklus oli; künka taha vaadata ei taha kunagi, sest selle taga on kaardi kaugem pool - mis kilomeetrite laiusel kaardil on enamik andmetest ja liidab horisondil ribaks, mis on heledam kui miski esiplaanil. Üks tuhmistaja ei sobi kahele, seega saab maastik piirangu ja seinad jätavad tuhmistaja alla.

### Peidetud geomeetria taha {#hidden-behind-geometry}

**Geomeetria taha peidetud** (vaikimisi 0,8): kui tugevalt surutakse maha andmepunkt taseme geomeetria taga. Väärtus loetakse *näitab läbi* 0 juures, *N% tuhmim* vahepeal (liugur asend, mitte mõõdetud tuhmistus), *täielikult peidetud* 1 juures.

Iga sein või põrand punkti ja kaamera vahel tuhmistab seda veelgi: üks sein jätab vaikeväärtusel mõne protsendi, ja iga lisapind poolitab, mis alles on, kuni neljani. Väärtusel 1 ei joonistata midagi geomeetria taga ja see on kõige odavam seade.

Vt ka [Taseme välimus](level-appearance.md).

## Kauguse järgi kärpimine {#distance-culling}

**Kauguse järgi kärpimine** (vaikimisi suletud) piirab soojust ridadega, mis jäävad kaamerast lähema ja kaugema piiri vahele. Pane kaugem piir, et lugeda tihedust hoone sees, ilma et kaardi kaugem pool selle peale liituks; pane lähem piir, et lennata kuumkoha *läbi*, mitte sellesse.

| Juhtnupp | Vaikimisi | Vahemik (hüppamisega) | Tähendus |
|---|---|---|---|
| **Lähedal** | väljas | 0,5-5000 m, logaritmiline; raja alumised 5% = väljas (200 000) | Lähemal olevad read jäetakse vahele. |
| **Kaugel** | väljas | 1-200 000 m, logaritmiline; põhi = väljas (10 000 000) | Kaugemal olevad read jäetakse vahele. |
| **Lõika tasandiga** | sees | | Mõõdab piire vaatesuunal, mitte silmast, nii et lõige on ekraaniga paralleelne tasand, mitte sinu ümber olev sfäär. Sfääri serv kaldub kaadris ära ja libiseb, kui pöörad; tasand jääb sinna, kuhu paigutad. |
| **Lõika ka taset** | sees | | Lõikab maapinna, ehitised ja vee samade piiridega. Kui tase jääb terveks, eemaldab lõige andmepunktid ja hoone jääb nende ette seisma; kui mõlemad on lõigatud, on see läbilõige läbi kaardi ja punktid asuvad oma seinte ja põrandate vastas. See ainult joonistab uuesti; see ei taaskäivita akumulatsiooni. |

### Klaviatuur {#keyboard}

Kaugem piir on juhtnupp, mida sa pühid - vii see läbi hoone ja vaata, millisel korrusel liiklus ilmub -, seega on see klaviatuuril, kui lendad ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Klahv | Mõju |
|---|---|
| `]` | Lükkab kaugemat piiri välja teguriga 1,12 (Shift: 1,35) |
| `[` | Tõmbab seda sama teguriga sisse |
| `\` | Lülitab kaugema piiri välja või sisse tagasi sellel kaugusel, kus see viimati oli (esimesel korral 6000) |

Sammud on geomeetrilised, sest kasulik vahemik ulatub nelja suurusjärgu võrra, toast kaardini. Klaviatuur hoiab kaugemat piiri vahemikus 100 kuni 400 000. Klahvid ei tee midagi, kui tekstikast või menüü on fookuses.

## Arendajatele {#for-developers}

### Peida maastiku taha {#hide-behind-terrain}

Ehitised joonistatakse oma sügavustekstuuri. Fragment, mis on stseeni sügavuse taga, kuid *mitte* ehitiste sügavuse taga, on maapinna taga ja visatakse ära. See maksab ühe sügavusläbiku ehitiste üle, mida vahele jäetakse, kui lüliti on välja.

### Peidetud geomeetria taha {#hidden-behind-geometry}

Seda loetakse **pinna kaupa**. Üks sügavusvõrdlus ütleb ainult "midagi on ees", seega punkt ühe seina taga ja punkt neljas toas hoone sees tuhmistuksid ühtmoodi ja interjöör loeks ühe nõrga udusena. Selle asemel **sügavuskooritakse** ehitiste geomeetriat kuni 3 täiendavasse kihti ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); iga fragment loeb, mitu pinda on tema ees (stseeni enda sügavus pluss koorutud kihid: kuni neli), ja tuhmistumine kumuleerub:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Liugur | 1 pind | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25% | 12,5% | 6,25% | 3,1% |
| 0,8 (vaikimisi) | 4% | 2% | 1% | 0,6% (põhi) |
| 1,0 | ei joonistata | ei joonistata | ei joonistata | ei joonistata |

Miks kaks tegurit: liugur on kalibreeritud nii, et üks sein jätab mõne protsendi - välimus, mis loetakse kui "midagi on ees" - ja mõne protsendi kumuleerimine oleks kolmanda seina juures nullilähedane; poolitamine iga lisapinna kohta hoiab neli eristatavat astet. Miks ruudus: lineaarne jättis küllastatud välja küllastatuks ka seina taga; neljas aste kustutas selle juba väärtusel 0,8. Miks põhi: varjatud soojuse täielik peitmine teeb toa täis peidetud liiklust tühjana toana, millel pole midagi, mis suunaks [Lõike](slice.md) poole. Ainult liugur kinnitatud väärtusele 1 peidab selle täielikult - ja see on kõige odavam seade, sest varjatud punktid visatakse siis ära.

Kuidas ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), punktisoojuse varjundid): võrdlus tehakse fragmendi kaupa stseeni sügavustekstuuri vastu, **akna sügavuses**, mitte maailma kauguses. Tipuetapi sügavustekstuuri lugemine loeb mõnel draiveril (sh ANGLE'i tarkvararenderdaja) kõik kui "kaugel", ja mõlema sügavuse teisendamine meetriteks kaotab eraldusvõime laia lähi- ja kaugpiiri juures. Nihe on üks spraidi raadius teisendatuna akna ühikutesse pluss mõned väikseimad bitid, nii et pinnal lebav andmepunkt ei varja iseennast.

Ehitised joonistatakse läbipaistvana, kuid need joonistatakse sügavusse, mida katmine loeb; taset, mille ehitised ei jõudnud sügavustekstuurini, katab ainult maastiku vastu.

### Kauguse järgi kärpimine {#distance-culling}

Mõlemad piirid arvutatakse tipuvarjundis, seega maksab kärbitud rida ühe tipu ja ühtegi fragmenti.
