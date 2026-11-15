---
title: "Žodynėlis"
nav_order: 21
lang: "lt"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: true
---

# Žodynėlis

Trumpos šioje svetainėje vartojamų žodžių reikšmės paprasta kalba. Kiekvienas įrašas veda į puslapį, kuriame paaiškinta visa.

## Duomenys {#data}

**Eilutė.** Viena jūsų duomenų eilutė: vienas įvykis vienoje vietoje ir laiku, pavyzdžiui, „žaidėjas 7 buvo čia 12-ą sekundę“. Peržiūros programa piešia kiekvieną eilutę. [Duomenų formatai](data-formats.md)

**Stulpelis.** Viena reikšmių rūšis eilutėse, pavyzdžiui, x, y, z, laikas ar komanda. Peržiūros programa spėja, koks stulpelis kuris, o spėjimą galite pakeisti. [Stulpelių priskyrimas](column-mapping.md)

**CSV.** Paprasta teksto lentelė: viena eilutė vienoje eilutėje, reikšmės atskirtos kableliais. Beveik kiekviena programa gali ją įrašyti. [Failų įkėlimas](loading-files.md)

**Parquet.** Kompaktiškas lentelės failas, kurį greita skaityti, net su milijonais eilučių. Tai geriausias formatas peržiūros programai. [Failų įkėlimas](loading-files.md)

**Įvykis.** Kas nors įvykęs, pavyzdžiui, šūvis, pataikymas, nužudymas ar pakilimas. Eilutė gali būti įvykis arba tiesiog „aš buvau čia“. [Filtrai](filters.md)

**Asmuo.** Tas, kuris sukūrė eilutes: žaidėjas, pilotas, automobilis ar tankas. Vienas asmuo – viena pozicijų eilutė per laiką. [Sesijos, asmenys ir grupės](sessions-persons-groups.md)

**Grupė (komanda).** Asmenų rinkinys, rodomas ta pačia spalva, pavyzdžiui, Blue ir Red. [Sesijos, asmenys ir grupės](sessions-persons-groups.md)

**Sesija (rungtynės, raundas).** Vienas žaidimo bandymas. Rungtynės arba raundas yra sesija. Peržiūros programa gali rodyti vieną sesiją arba sudėti daug viena ant kitos. [Sesijos, asmenys ir grupės](sessions-persons-groups.md)

**Lygis.** 3D žemėlapis, kuriame įvyko duomenys: žemė, pastatai, sienos. Eilutės rodomos ten, kur jos įvyko lygyje. [Lygiai ir fono geometrija](levels.md)

## Duomenų žiūrėjimas {#looking-at-the-data}

**Šilumos žemėlapis.** Paveikslėlis, kuriame vietos, kurias liečia daug eilučių, švyti stipriau. Šaltos vietos ramios, karštos – užimtos. [Šiluma](heat.md)

**Šiluma.** Kiek kas nors įvyko vietoje. Peržiūros programa sudeda kiekvienos eilutės švytėjimą kiekvienoje vietoje; suma yra šiluma. [Šiluma](heat.md)

**Spraitas.** Mažas švytintis taškas, kurį peržiūros programa piešia vienai eilutei. Daug persidengiančių spraitų susideda į šilumą. [Spraito forma](sprite-shape.md)

**Ekspozicija.** Kokia šviesi yra nuotrauka. Kaip fotoaparate: per daug ekspozicijos viską paverčia baltu, per mažai slepia detales. [Spalva ir ekspozicija](colour-and-exposure.md)

**Įsotinimas.** Šilumos kiekis, kuris laikomas „tiek karšta, kiek leidžia spalvos“. Sumažinkite, kad matytumėte ramias vietas; padidinkite, kad matytumėte tik karščiausias. [Spalva ir ekspozicija](colour-and-exposure.md)

**Tūris.** Dėžė arba forma, kurią dedate 3D vaizde. Peržiūros programa skaičiuoja, kas jos viduje, ir gali lyginti tūrius tarpusavyje. [Tūriai ir palyginimas](volumes.md)

**Filtras.** Taisyklė, kuri paslepia norimas nerodyti eilutes, pavyzdžiui, „tik nužudymai“ arba „tik komanda Red“. [Filtrai](filters.md)

## Pakartojimas {#replay}

**Figūra.** Mažas tanko, lėktuvo, automobilio ar kareivio modelis, kuris juda ten, kur duomenys sako, kad jis buvo. [Figūros](figures.md)

**LOD (detalumo lygis).** Kiekviena figūra turi detalią, paprastesnę ir labai paprastą versiją. Arti esančios naudoja detalią, toli esančios – paprastą, todėl galima nupiešti tūkstančius vienu metu. [Figūros](figures.md)

## Lenktynės {#racing}

**Ratas.** Vienas važiavimas aplink trasą nuo linijos iki linijos. [Ratų įkėlimas](race-loading-laps.md)

**Etalono ratas.** Ratas, su kuriuo lyginami visi kiti. Skirtumai rodomi kaip „greičiau“ arba „lėčiau“ už jį. [Ratų įkėlimas](race-loading-laps.md)

**Viršūnė.** Posūkio taškas, kuriame automobilis arčiausiai vidinio krašto. [Analizė posūkis po posūkio](race-corner-analysis.md)

**Slydimas.** Kiek padanga slysta. Nedidelis slydimas duoda daugiausia sukibimo; per daug – ir automobilis slysta į šoną. [Lenktynių analitika: metodas](race-analytics.md)

**Ribos.** Ką automobilis gali kiekvienu greičiu: kiek stipriai gali posukti, stabdyti ir greitėti, kol prasideda slydimas. [Lenktynių analitika: metodas](race-analytics.md)

## Orlaivių skaičiai {#aircraft-numbers}

**ALT.** Aukštis: aukštis virš žemės arba jūros lygio. [Rungtynių pakartojimas](match-replay.md#labels-and-statistics)

**TAS.** Tikrasis oro greitis: kaip greitai lėktuvas juda ore. [Rungtynių pakartojimas](match-replay.md#labels-and-statistics)

## Kompiuteris {#computer}

**GPU.** Vaizdo plokštė arba lustas. Jis piešia paveikslėlį ir yra daug greitesnis už pagrindinį procesorių piešiant milijonus taškų. [Abu varikliai](backends.md)

**WebGPU / WebGL2.** Du būdai, kaip naršyklė leidžia puslapiui naudoti GPU. WebGPU yra naujesnis. Peržiūros programa gali naudoti bet kurį ir parenka geriausią, kurį turi jūsų naršyklė. [Abu varikliai](backends.md)

## Counter-Strike žodžiai {#counter-strike-words}

**Raundas.** Viena trumpa kova rungtynėse. Vieną ją laimi viena pusė, o taškų skaičius padidėja vienu.

**Eco, priverstinis pirkimas, pilnas pirkimas.** Kiek pinigų pusė išleidžia ginklams raundo pradžioje. Eco taupo pinigus ir nupirkia beveik nieko (vidutiniškai mažiau nei 1 500 $ žaidėjui). Priverstinis pirkimas išleidžia visa, ką turi (mažiau nei 4 000 $). Pilnas pirkimas nuperka viską, ką gali. [Rungtynių analizė](match-analysis.md)

**Mainai.** Nužudymas, kuris atsilygina už nužudymą: jus nušauna, o komandos draugas nušauna jūsų žudiką per 5 sekundes. [Rungtynių analizė](match-analysis.md)

**KAST.** Raundų, kuriuose žaidėjas nužudė, padėjo nužudyti, išgyveno arba buvo atkeršyta, dalis. Didesnis skaičius reiškia, kad žaidėjas padėjo daugiau raundų. [Rungtynių analizė](match-analysis.md)

**ADR.** Vidutinė žala per raundą: kiek gyvybių žaidėjas per kiekvieną raundą atėmė iš priešininkų. [Rungtynių analizė](match-analysis.md)
