---
title: "Žodynėlis"
nav_order: 21
lang: "lt"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Žodynėlis

Trumpos šioje svetainėje vartojamų žodžių reikšmės paprasta kalba. Kiekvienas įrašas nukreipia į puslapį, kuris jį išaiškina visa apimtimi.

## Duomenys {#data}

**Eilutė.** Viena jūsų duomenų eilutė: vienas įvykis vienoje vietoje ir laiku, pavyzdžiui, „žaidėjas 7 buvo čia sekundę 12“. Peržiūra piešia kiekvieną eilutę. [Duomenų formatų nuoroda](data-formats.md)

**Stulpelis.** Viena vertės rūšis eilutėse, pavyzdžiui, x, y, z, laikas ar komanda. Peržiūra spėja, koks stulpelis yra koks, o spėjimą galite pakeisti. [Stulpelių priskyrimas](column-mapping.md)

**CSV.** Paprasta teksto lentelė: viena eilutė vienam įrašui, reikšmės atskirtos kableliais. Beveik kiekviena programa gali ją parašyti. [Failų įkėlimas](loading-files.md)

**Parquet.** Kompaktiškas lentelės failas, kurį greitai nuskaityti, net ir su milijonais eilučių. Tai geriausias formatas peržiūrai. [Failų įkėlimas](loading-files.md)

**Įvykis.** Kas nors, kas įvyko, pavyzdžiui, šūvis, pataikymas, nužudymas ar pakilimas. Eilutė gali būti įvykis arba tiesiog „buvau čia“. [Filtrai](filters.md)

**Asmuo.** Tas, kuris sukūrė eilutes: žaidėjas, lakūnas, automobilis ar tankas. Vienas asmuo yra viena padėčių eilutė laike. [Sesijos, asmenys ir grupės](sessions-persons-groups.md)

**Grupė (komanda).** Asmenų rinkinys, rodomas ta pačia spalva, pavyzdžiui, Mėlyna ir Raudona. [Sesijos, asmenys ir grupės](sessions-persons-groups.md)

**Sesija (rungtynės, raundas).** Vienas žaidimo bėgimas. Rungtynės ar raundas yra sesija. Peržiūra gali rodyti vieną sesiją arba sudėti daugelį viena ant kitos. [Sesijos, asmenys ir grupės](sessions-persons-groups.md)

**Lygis.** 3D žemėlapis, kuriame įvyko duomenys: žemė, pastatai, sienos. Eilutės rodomos ten, kur jos įvyko lygyje. [Lygiai ir fono geometrija](levels.md)

## Duomenų žiūrėjimas {#looking-at-the-data}

**Šilumos žemėlapis.** Paveikslėlis, kuriame vietos, kurias liečia daug eilučių, šviečia karščiau. Šaltos vietos ramios, karštos – užimtos. [Šiluma](heat.md)

**Šiluma.** Kiek kas nors įvyko vietoje. Peržiūra sudeda kiekvienos eilutės švytėjimą kiekvienoje vietoje; suma ir yra šiluma. [Šiluma](heat.md)

**Spraitas.** Mažas švytintis dėmuo, kurį peržiūra piešia vienai eilutei. Daug persidengiančių spraitų susideda į šilumą. [Spraito forma](sprite-shape.md)

**Ekspozicija.** Kiek šviesus vaizdas. Kaip fotoaparate: per didelė ekspozicija viską paverčia balta, per maža paslepia detales. [Spalva ir ekspozicija](colour-and-exposure.md)

**Įsotinimas.** Šilumos kiekis, kuris skaičiuojamas kaip „tiek karštas, kiek spalvos gali būti“. Sumažinkite, kad matytumėte ramias vietas; padidinkite, kad matytumėte tik karščiausias. [Spalva ir ekspozicija](colour-and-exposure.md)

**Tūris.** Dėžutė ar forma, kurią įdedate į 3D vaizdą. Peržiūra suskaičiuoja, kas jos viduje, ir gali palyginti tūrius tarpusavyje. [Tūriai ir palyginimas](volumes.md)

**Filtras.** Taisyklė, kuri paslepia nepageidaujamas eilutes, pavyzdžiui, „tik nužudymai“ ar „tik komanda Raudona“. [Filtrai](filters.md)

## Pakartojimas {#replay}

**Figūra.** Mažas tanko, lėktuvo, automobilio ar kario modelis, judantis ten, kur duomenys sako, kad jis buvo. [Figūros](figures.md)

**LOD (detalumo lygis).** Kiekviena figūra turi detalią, paprastesnę ir labai paprastą versiją. Arti esančios naudoja detalią, toli esančios – paprastą, todėl galima nupiešti tūkstančius vienu metu. [Figūros](figures.md)

## Lenktynės {#racing}

**Ratas.** Viena kelionė aplink trasą, nuo linijos iki linijos. [Ratų įkėlimas](race-loading-laps.md)

**Atskaitos ratas.** Ratas, su kuriuo lyginami visi kiti. Skirtumai rodomi kaip „greičiau“ ar „lėčiau“ už jį. [Ratų įkėlimas](race-loading-laps.md)

**Viršūnė.** Posūkio taškas, kuriame automobilis arčiausiai vidinio krašto. [Analizė posūkis po posūkio](race-corner-analysis.md)

**Slydimas.** Kiek padanga slysta. Šiek tiek slydimo duoda daugiausiai sukibimo; per daug – automobilis slysta į šoną. [Lenktynių analitika: metodas](race-analytics.md)

**Ribinė riba.** Ką automobilis gali nuveikti kiekvienu greičiu: kiek stipriai gali sukti, stabdyti ir greitėti, kol prasideda slydimas. [Lenktynių analitika: metodas](race-analytics.md)

## Orlaivių skaičiai {#aircraft-numbers}

**ALT.** Aukštis: aukštis virš žemės ar jūros lygio. [Rungtynių pakartojimas](match-replay.md#labels-and-statistics)

**TAS.** Tikrasis oro greitis: kaip greitai lėktuvas juda ore. [Rungtynių pakartojimas](match-replay.md#labels-and-statistics)

## Kompiuteris {#computer}

**GPU.** Grafikos kortelė ar lustas. Jis piešia vaizdą ir piešdamas milijonus dėmių yra daug greitesnis už pagrindinį procesorių. [Abu varikliai](backends.md)

**WebGPU / WebGL2.** Du būdai, kuriais naršyklė leidžia puslapiui naudoti GPU. WebGPU yra naujesnis. Peržiūra gali naudoti bet kurį ir parenka geriausią, kurį turi jūsų naršyklė. [Abu varikliai](backends.md)

## Counter-Strike žodžiai {#counter-strike-words}

**Raundas.** Viena trumpa kova rungtynių viduje. Vienas pusė ją laimi, o rezultatas padidėja vienu.

**Ekonomija, jėgos pirkimas, pilnas pirkimas.** Kiek pinigų pusė išleidžia ginklams raundo pradžioje. Ekonomija taupo pinigus ir nuperka beveik nieko (vidutiniškai mažiau nei 1 500 $ vienam žaidėjui). Jėgos pirkimas išleidžia tai, ką turi (mažiau nei 4 000 $). Pilnas pirkimas nupērka viską, ką gali. [Rungtynių analizė (CS2)](match-analysis.md)

**Keitimas.** Nužudymas, kuris atsilygina už nužudymą: jus nušauna, o komandos draugas nušauna jūsų žudiką per 5 sekundes. [Rungtynių analizė (CS2)](match-analysis.md)

**KAST.** Raundų, kuriuose žaidėjas nužudė, padėjo nužudyti, išgyveno ar buvo atsilygintas, dalis. Didesnis skaičius reiškia, kad žaidėjas padėjo daugiau raundų. [Rungtynių analizė (CS2)](match-analysis.md)

**ADR.** Vidutinė žala per raundą: kiek sveikatos žaidėjas per kiekvieną raundą prarado nuo priešų. [Rungtynių analizė (CS2)](match-analysis.md)
