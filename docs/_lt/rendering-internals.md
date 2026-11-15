---
title: "Atvaizdavimo vidus"
nav_order: 22
has_children: true
lang: "lt"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Atvaizdavimo vidus

Peržiūros programa piešia milijonus taškų kaip švytinčius burbuliukus ir juos sudeda. Šis skyrius paaiškina triukus, kurie tai daro greitai, ir ką reiškia skaičiai statistikos perdangoje. Skaitykite, jei peržiūra atrodo lėta arba norite dirbti su atvaizdavimo sistema.

```
duomenys -> laiko langas -> GPU filtrai -> imties planas -> išsklaidymas -> kaupimas -> spalva -> ekranas
```

Kaip sekasi jūsų kompiuteriui, žiūrėkite statistikos langelyje viršuje dešinėje vaizde: [Našumo skydelis ir statistikos perdanga](performance-and-stats.md). Naujus žodžius (GPU, eilutė, spraitas, šilumos žemėlapis) rasite [žodynėlyje](glossary.md).

## Pagrindinė problema {#the-core-problem}

Kelių persidengiančių radialinių nuolydžių suma kainuoja *N* × π*r*² maišomų fragmentų kadre. Esant 100 milijonų 8 px spindulio spraitų, tai 2 × 10¹⁰ fragmentų – maždaug sekundė darbo aukštos klasės GPU. Kiekviename kadre to neįmanoma atlikti jėga, todėl peržiūros programa sujungia:

- **laiko tvarka surikiuotas eilutes** – laiko juostos langas yra du dvejetainiai paieškos žingsniai, o atkūrimo kaina priklauso nuo eilučių lange, o ne nuo visos duomenų aibės;
- **nieko kiekvienai eilutei CPU kiekviename kadre** – eilutės gyvena GPU atmintyje, kvantuotos; filtrai, grupių ženklai, gyvavimo trukmės patikra, langas, atrinkimas ir pjūvis skaičiuojami viršūnių šešėliavime;
- **stratifikuotą imtį** su kompensuojančiais svoriais, kai kadras negali nupiešti kiekvienos eilutės, ir **laipsnišką kaupimą**, kuris, kol vaizdas dar nepasikeitęs, konverguoja į tikslų visų eilučių atsakymą ([Imtis ir biudžetai](sampling-and-budgets.md), [Kaupimas](accumulation.md));
- **dviejų pakopų sklendę**, kuri aukoja spraitus kadre, o paskui šilumos raišką, kad gautų kadrų dažnį ([Imtis ir biudžetai](sampling-and-budgets.md#the-adaptive-budget));
- **įvykdytus atminties biudžetus**, kad duomenys, kurie netelpa, būtų matomai apkarpyti, o ne nulūžtų programa ([GPU atminties laikymas](gpu-memory.md)).

## Vienas kadras {#one-frame}

Kadro ciklas yra [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Viskas, kas keičiasi kadro dažniu – kamera, grojimo galvutė, biudžetas – gyvena variklyje, o ne programos būsenoje, todėl kadras nekainuoja jokio React darbo; būsena nuskaitoma kartą per kadrą ir įrašoma atgal tik žemo dažnio rodmenims.

1. **Nauji duomenys?** Naujas duomenų rinkinys paskelbiamas (*Keliami N eilučių į GPU*) viename kadre ir įkeliamas kitame, todėl pranešimas nupiešiamas prieš tai, kai darbas užblokuoja giją. Naujas lygis perduodamas atvaizdavimo sistemai; linijų šilumos maršrutai sukuriami arba atlaisvinami.
2. **Grojimo galvutė** juda (ribojama 0,1 s realaus laiko kadrui), kartojasi arba sustoja.
3. **Kamera** skaito klavišus, pelę ir žaidimų pultą; ašių veidrodis įskaičiuojamas į vaizdo matricą; WebGPU sistemoje gylio perskaičiavimo matrica paverčia three.js OpenGL stiliaus gylio intervalą į WebGPU intervalą.
4. **Kas matoma**: laiko intervalas iš laiko juostos ir istorijos; grupių ženklų lentelė (matomumas tik skaidant pagal stulpelį); iki keturių filtrų – stulpelių filtrai ir objektų pasirinkimas; skirtumo skaidymas.
5. **Spalvų ir kreivių lentelės** perskaičiuojamos, jei pasikeitė jų nustatymai.
6. **Biudžetas**: prisitaikantis valdiklis nustato šio kadro spraitų biudžetą ir šilumos raišką; su *Piešti kiekvieną eilutę kiekviename kadre* biudžetas padidinamas, kad apimtų kiekvieną kandidatę eilutę.
7. **Parašai** nusprendžia, ką kaupimo buferis dar reiškia: pasikeitimas, kuris keičia, kokios eilutės prisideda ar kaip (*geometrija*), laiko langą arba tik tai, kaip rezultatas nuspalvinamas (*kompozitas*). Žr. [Kaupimas](accumulation.md#what-restarts-it).
8. **Imties planas**: kurie eilučių blokai piešiami ([Imtis ir biudžetai](sampling-and-budgets.md)).
9. **Kaupimo režimas**: nustatyti iš naujo, pratęsti, slenkantis vidurkis, tekantis vidurkis arba neveiklumas.
10. **Box replay geometrija** (kubai, pėdsakai) skaičiuojama CPU, tik tame režime ir tik tada, kai nėra neveiklumo.
11. **Atvaizdavimas**: sistema piešia sceną (lygį, tinklelį, ašis, dėžes, pėdsakus, liniuotę), išsklaido šilumą į šilumos tikslą, sujungia ją su kaupikliu ir sudėlioja šilumą virš scenos į drobę.
12. **Automatinė ekspozicija** įsijungia, kai jos atskaitos laikas pasiekia nulį; liniuotės šilumos zondas nuskaito daugiausia vieną tašką kas 120 ms; rodmenys paskelbiami.

Neveiklus kadras – konverguota, nieko nepasikeitė – praleidžia sceną ir išsklaidymą, bet vis tiek **perkomponuoja**: WebGL drobė, sukurta be `preserveDrawingBuffer`, po kompozicijos turi neapibrėžtą turinį, todėl pasitikėti, kad ji rodys paskutinį kadrą, nesaugu. Scenos ir šilumos tikslai yra paties peržiūros programos kadrų buferiai ir jie išlieka, todėl neveiklus kadras kainuoja vieną viso ekrano perėjimą.

## Šio skyriaus puslapiai {#pages-in-this-section}

- [Abu varikliai](backends.md) – WebGPU ir WebGL2, kaip pasirenkama viena, URL jungikliai
- [Kaupimas](accumulation.md) – nustatyti iš naujo, pratęsti, slenkantis vidurkis, tekantis vidurkis
- [Imtis ir biudžetai](sampling-and-budgets.md) – stratifikuotas imties ėmiklis, tikslusis režimas, prisitaikantis biudžetas
- [Pusiau tikslusis kaupimas](half-float-accumulation.md) – intervalas ir tikslumas 16 bitų tiksluose
- [GPU atminties laikymas](gpu-memory.md) – kvantuota eilučių saugykla ir įvykdytas GPU biudžetas
- [Programinio atvaizdavimo aptikimas](software-rendering.md)
- [Našumo skydelis ir statistikos perdanga](performance-and-stats.md)
