---
title: "Šilumos režimai"
nav_order: 4
has_children: true
lang: "lt"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# Šilumos režimai

Kiekvienas taškas prideda šiek tiek švytėjimo, švytėjimai susikaupia, o susikaupimas nudažomas spalvomis. Yra penki būdai jį nudažyti, ir kiekvienas atsako į vieną klausimą.

Režimų juosta viršuje Šilumos žemėlapio skirtuko šoninėje juostoje parenka, kaip piešiamas [duomenų rinkinys](glossary.md). Klavišai 1–4 parenka Šilumą, Skirtumą, Komandų šilumą ir Linijas. Figūrų sutapdinimas klavišo neturi.

![Režimų juosta su Šiluma, Skirtumu, Komandų šiluma, Figūrų sutapdinimu ir Linijomis](../assets/img/en/heat-modes-bar.webp)

| Režimas | Klausimas, į kurį atsako |
|---|---|
| **Šiluma** | Kur tai įvyko ir kiek? |
| **Skirtumas** | Kuri pusė to padarė daugiau? |
| **Komandų šiluma** | Kieno tai buvo? |
| **Linijos** | Kuria kryptimi žmonės ėjo? |
| **Figūrų sutapdinimas** | Kas kur buvo ir kada? |

![Tie patys duomenys keturiais režimais: Šiluma, Skirtumas, Komandų šiluma ir Linijos](../assets/img/en/heat-modes-grid.webp)

| Režimas (juostos žymė) | Klavišas | Ką piešia | Reikia |
|---|---|---|---|
| **Šiluma** | 1 | Adityvus tankis: kiekviena matoma eilutė prideda į kamerą nukreiptą spindulinį spraitą. [Šiluma](heat.md) | duomenų rinkinio |
| **Skirtumas** | 2 | Ženklą turintis tankis: viena populiacija prideda, kita atima. [Skirtumas](difference.md) | dviejų pusių: bent dvi grupės arba išskaidymas pagal išsaugotą stulpelį |
| **Komandų šiluma** | 3 | Tankis, nudažytas pagal grupę: kiekvienai grupei – atspalvis, persidengiančiose vietose maišomas. [Komandų šiluma](team-heat.md) | grupės stulpelio |
| **Figūrų sutapdinimas** | - | Viena figūra (arba dėžutė) kiekvienam asmeniui, judanti pagal laiko juostą: pakartojimas. [Figūrų sutapdinimas](box-replay.md), [Rungtynių pakartojimas](match-replay.md) | asmens stulpelio |
| **Linijos** | 4 | Linijų šiluma: linija nuo kiekvieno asmens mėginio iki kito, šiluma silpsta į šonus. [Linijų šiluma](line-heat.md) | asmens ir laiko stulpelių |

Režimas, kurio duomenys nepalaiko, yra užpilkintas, o jo patarimas nurodo priežastį, pavyzdžiui, *Nepasiekiama – Skirtumo režimui reikia dviejų grupių arba išsaugoto stulpelio, pagal kurį skaidyti; šiuose duomenyse yra viena grupė.* Kai naujas duomenų rinkinys nepalaiko dabartinio režimo, vaizdas grįžta į **Šilumą**.

Klavišai 1–4 tikrinami su duomenimis taip pat: klavišas užpilkintam režimui nieko nedaro.

## Kurias skiltis kiekvienas režimas rodo {#which-panels-each-mode-shows}

| Skiltis | Šiluma | Skirtumas | Komandų šiluma | Figūrų sutapdinimas | Linijos |
|---|---|---|---|---|---|
| Maršrutai ([linijų šiluma](line-heat.md)) | | | | | taip |
| Šilumos forma (su **Sekti vaizdą** ir **Vienodas tankis bet kokiu mastu**), Šilumos spalvos, Spraito pikselių ribos, Gylis, Atstumo atrinkimas | taip | taip | taip | | taip |
| Kryptis ([krypties šiluma](directional-heat.md)), Reikšmė ([vertės svoriavimas](value-weighting.md)) | taip | taip | taip | | taip |
| Komandų peržiūra ([figūrų sutapdinimas](box-replay.md)) | | | | taip | |
| Skirtumo skaidymas ([skirtumas](difference.md)) | | taip | | | |
| [Komandos](teams-list.md), [Subjektai](entities.md), [Filtrai](filters.md), Fonas / lygis, [Pjūvis](slice.md), [Matas](measure.md), Kameros kelias ir atvaizdavimas, Našumas, Kamera ir scena | taip | taip | taip | taip | taip |

## Ką bendrai turi visi šilumos režimai {#what-every-heat-mode-shares}

Visi keturi šilumos režimai (išskyrus figūrų sutapdinimą) yra ta pati mašina su skirtingais įėjimais ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Kurios eilutės.** [Laiko juosta](timeline.md) parenka vientisą laiko tvarka surikiuotų eilučių ruožą; [filtrai](filters.md), grupių matomumas, skirtumo skaidymas, [atstumo atrinkimas](depth-and-culling.md#distance-culling) ir [pjūvis](slice.md) kiekvienai eilutei nusprendžia viršūnių šešėliuotuve, ar ir kaip stipriai ji prisideda.
2. **Spraitų dėliojimas.** Kiekviena prisidedanti eilutė nupiešiama kaip spraitas (arba, linijų režime, kaip atkarpa) į slankiojo kablelio **šilumos tikslą**, pridedant savo skalės reikšmę. Kai eilučių yra daugiau nei kadras gali sutalpinti, piešiama sluoksniuota eilučių imtis, o svoriai koreguojami. Žr. [Imtis ir biudžetai](sampling-and-budgets.md).
3. **Kaupimas.** Kol nieko nekeičiama, kadrai sujungiami, kol kiekviena eilutė prisidėjo tiksliai vieną kartą. Žr. [Kaupimas](accumulation.md).
4. **Sudėtis.** Sukauptą kiekvieno pikselio reikšmę padalijame iš **įsotinimo taško**, pakeičiame pagal **tankio atsaką**, pakeliame **mažiausios šilumos** dydžiu ir ieškome **spalvų skalėje**, kurios alfa maišo ją su scena. Žr. [Spalva ir ekspozicija](colour-and-exposure.md).

Viskas 4 žingsnyje taikoma sudėties metu, todėl tempiant tuos valdiklius kaupimas niekada nepradedamas iš naujo; bet kas 1–2 žingsniuose – pradedamas.

## Šio skyriaus puslapiai {#pages-in-this-section}

- [Šiluma](heat.md) – paprastas šilumos režimas ir jo skilčių apžvalga
  - [Spraito forma](sprite-shape.md) – spindulys, intensyvumai, slopimas, kreivės redaktorius, pikselių ribos, suplojimas
  - [Spalva ir ekspozicija](colour-and-exposure.md) – spalvų skalės redaktorius, įsotinimo taškas, automatinė ekspozicija, mažiausia šiluma, tankio atsakas
  - [Gylis ir atrinkimas](depth-and-culling.md) – slėpimas dėl lygio, slėpimas už reljefo, atstumo atrinkimas
- [Skirtumas](difference.md) – skirtumo skaidymas
- [Komandų šiluma](team-heat.md)
- [Linijų šiluma](line-heat.md) – maršrutai
- [Figūrų sutapdinimas](box-replay.md) – pakartojimo režimas (failas vis dar vadinasi box replay)
- [Krypties šiluma](directional-heat.md)
- [Vertės svoriavimas](value-weighting.md)
