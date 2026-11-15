---
title: "Žemėlapio vaizdai"
parent: "Lygiai ir fono geometrija"
nav_order: 1
lang: "lt"
source: "map-images.md"
source_hash: "f0bbaa4b019e"
translated: true
outdated: false
---

# Žemėlapio vaizdai

Žemėlapio vaizdas yra plokščias paveikslėlis – mini žemėlapis, palydovinė nuotrauka, plano schema – padėtas po jūsų duomenimis, kad matytumėte, kur sutelkta šiluma. Peržiūrai nurodote, kur vaizdas turi būti, prisegdami du jo taškus prie dviejų vietų pasaulyje („inkarai“).

## Įkelti ir išdėstyti žemėlapio vaizdą {#load-and-place-a-map-image}

1. Pirmiausia įkelkite duomenis ([Duomenų įkėlimas](getting-data-in.md)).
2. Skiltyje **Fonas / lygis** paspauskite **Žemėlapio vaizdas…** ir pasirinkite paveikslėlį. Jis ištempiamas per duomenų plotą.
3. Jei paveikslėlis buvo perkeltas, paspauskite **Pritaikyti prie duomenų ribų**. Inkaras 1 atsiduria ties paveikslėlio viršutiniu kairiuoju kampu, inkaras 2 – ties apatiniu dešiniuoju, duomenų kraštuose.
4. Jei šiluma nesutampa su paveikslėliu, pasirinkite du orientyrus, kurie yra toli vienas nuo kito (pavyzdžiui, dviejų pastato priešingus kampus arba dvi sankryžas). Nuskaitykite kiekvieno pikselį paveikslėlyje ir jo pasaulio padėtį (užvedę pelę su [liniuote](measure.md) nuskaitykite **X** ir **Z**).
5. Įveskite juos į **Išdėstymas**: inkarui 1 – orientyro **px**, **py**, **pasaulio X**, **pasaulio Z**; tas pats inkarui 2.
6. Patikrinkite: trajektorija ar karštas taškas, kurį žinote esant ant kelio, dabar turi būti ant to kelio. Koreguokite skaičius, kol taip bus.

![Skyrius Išdėstymas su dviem inkarais ir šiluma, nupiešta ant žemėlapio paveikslėlio](../assets/img/en/map-images-placement.webp)

Abu orientyrai privalo skirtis ir pikselių stulpeliu, ir pikselių eilute, kitaip skydelis rodo *Abu inkarai dalijasi tą pačią pikselių eilutę ar stulpelį*.

## Įkėlimas {#loading}

Bet koks vaizdo formatas, kurį naršyklė gali atkoduoti. Vaizdas, kurio ilgesnė kraštinė didesnė nei **8192 px**, sumažinamas iki 8192 (didžiausia kraštinė, kurią GPU prašoma laikyti), ir skydelis rodo *Sumažinta iš W×H į w×h*.

Įkėlus vaizdas ištempiamas per duomenų rinkinio X-Z ribas (arba ±1000 vienetų be duomenų rinkinio), šiaurė viršuje, duomenų rinkinio žemiausiame Y. Numatytosios reikšmės yra **Nepermatomumas** 100 %, **Šviesumas** 0,7, **Nubluktinti** 100 %, **Apversti šiaurę / pietus** įjungta: nubluktinta ir prigesinta, nes fono paskirtis – leisti rasti karštą vietą, o ne varžytis su ja.

## Valdikliai {#controls}

| Valdiklis | Numatytoji | Intervalas | Reikšmė |
|---|---|---|---|
| **Nepermatomumas** | 100 % | 0–100 % | |
| **Šviesumas** | 0,7 | 0–2 (vilkimas 64) | |
| **Nubluktinti** | 100 % | 0–100 % | Pilkas fonas, sodri šiluma. Žemėlapio spalva konkuruotų su duomenų spalva. |
| **Apversti šiaurę / pietus** | įjungta | | Kuri paveikslėlio eilutė yra didžiausia pasaulio Z. Perjungus, kai įkeltas duomenų rinkinys, inkarai iš naujo pritaikomi prie duomenų ribų. |
| **Išdėstymas**: Inkaras 1, Inkaras 2 | paveikslėlio kampai ties duomenų ribomis | | Kiekvienas inkaras yra paveikslėlio pikselis – **px** (nuo kairės, nuo 0 iki pločio) ir **py** (nuo viršaus, nuo 0 iki aukščio) – ir pasaulio koordinatė, kurioje jis yra, **pasaulio X** ir **pasaulio Z**. Mastelis ir poslinkis išvedami iš poros. |
| **Pritaikyti prie duomenų ribų** | | | Inkarą 1 uždeda ant paveikslėlio viršutinio kairiojo kampo, inkarą 2 – ant apatinio dešiniojo, duomenų X-Z ribose. Pradinis taškas tiksliam išdėstymui. Reikia duomenų rinkinio. |
| **Aukštis** | duomenų rinkinio žemiausias Y | duomenų mažiausias Y - 500 iki didžiausio Y + 500 (vilkimas didžiausias Y + 100 000) | Žemėlapio plokštumos aukštis. Nustatykite tiesiog po duomenimis, kad jie nebūtų paslėpti. |

Pavadinimo eilutėje rodoma `plotis×aukštis px · x × z m/px` – pasaulio dydis vienam pikseliui kiekvienoje ašyje.

## Scenoje {#in-the-scene}

Vaizdas yra vienas tekstūruotas keturkampis aukštyje. Esant visiškam nepermatomumui jis rašo gylį, todėl dalyvauja [užslėpime](depth-and-culling.md) kaip žemė; esant mažesniam nei 100 % nepermatomumui jis susimaišo ir gylio nerašo, todėl nieko neužslepia. [Liniuotė](measure.md) matuoja savo plokštumoje. [Lygių biblioteka](level-library.md) išsaugo vaizdo lygį su jo inkarais.

## Dota 2 žemėlapis {#dota-2-map}

**Dota 2 žemėlapis** šalia **Žemėlapio vaizdas…** parsisiunčia dabartinio Dota 2 žemėlapio brėžinį, kurį [OpenDota](https://www.opendota.com) rodo savo rungtynių puslapiuose, ir padeda jį po lentelėmis, kurias [Watcher](https://github.com/Holdi601/3DHeat-Watcher) rašo iš Dota 2 pakartojimų ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Vaizdas parsisiunčia iš opendota.com, kai paspaudžiamas mygtukas, ir nėra 3DHeat dalis; naujausio leidimo brėžinys imamas iš paties OpenDota sąrašo, o 7.40 brėžinys – kai sąrašo nepavyksta perskaityti.

| | |
|---|---|
| Šaltinis | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Išdėstymas | OpenDota kalibravimas: vaizdas apima Dota pasaulio vienetus nuo -8192 iki 8064 abiem ašims (128 vienetų langeliai nuo 64 iki 191), šiaurė viršuje. Su pakartojimo lentelės ašimis (Z aukštyn, Y apverstas) tai yra pasaulio X nuo -8192 iki 8064 ir pasaulio Z nuo -8064 iki 8192. Maždaug 18 vienetų vienam pikseliui. |
| Aukštis | 0. Herojai stovi nuo 0 iki maždaug 600. |
| Išvaizda | Šviesumas 0,8, nubluktinimas 50 %. |

Patikrinta viešų rungtynių pakartojime 7.40 leidimo: kiekvienos herojaus trajektorija seka nubrėžtas linijas, o bokštai, kareivinės ir senieji, kuriuos pakartojimas talpina, nukrenta ant nubrėžtų bazių. Vaizdas **Viršus** rodo žemėlapį su šiaure ekrano apačioje, kaip ir bet kurią Z aukštyn lentelę su apverstu Y.

Brėžinys yra OpenDota, Valve žemėlapio; Valve nepritaria 3DHeat.

### 3D žemėlapis {#the-3d-map}

Įdiegus Dota 2, atskiras įrankis [3DHeat Dota](https://holdi601.github.io/3DHeat-Ext-Dota/) (`heat3d-dota-maps level -o dota.glb`; jį paleidžia ir Watcher komanda [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html)) iš paties žaidimo failų sukuria žemėlapį 3D: žemę, uolas, vandenį, medžius ir pastatus, pakartojimų lentelių vienetais ir ašimis. Vieną kartą įkelkite failą per **3D modelis…**: peržiūros programa atpažįsta jį pagal dalis (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` faile `dotaMap.ts`), iš karto įdeda į [lygių biblioteką](level-library.md), pakeisdama senesnį, ir tai praneša. Nuo tada **Dota 2 žemėlapis** įkelia šį 3D žemėlapį iš bibliotekos, užuot atsisiuntęs piešinį; jei bibliotekoje jo nėra, atsisiunčia piešinį ir paaiškina, kaip sukurti 3D žemėlapį. Failas gaunamas iš jūsų pačių diegimo ir lieka jūsų kompiuteryje.

## Kūrėjams {#for-developers}

### Kaip inkarai išdėsto vaizdą {#how-the-anchors-place-the-image}

Iš [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), su inkarais *a* ir *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pikselis (0, 0) yra ties  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Du inkarai nustato ir mastelį, ir poslinkį kiekvienoje ašyje atskirai, todėl žemėlapis gali būti ištemptas skirtingai X ir Z, bet nesukamas. Inkarai privalo skirtis **abiem** pikselių koordinatėmis; kai jie dalijasi eilutę ar stulpelį, mastelio nustatyti neįmanoma, žemėlapis nepiešiamas, o skydelis rodo *Abu inkarai dalijasi tą pačią pikselių eilutę ar stulpelį*.
