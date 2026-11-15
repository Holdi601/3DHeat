---
title: "Žaidimų pultas ir HOTAS"
parent: "Kamera ir valdymas"
nav_order: 1
lang: "lt"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Žaidimų pultas ir HOTAS

Kamerą galite valdyti Xbox tipo pulteliu vietoj klaviatūros. Naudokite jį, kai norite atsisėsti ir apsidairyti didelėje scenoje. Jo įvestis **papildo** klaviatūros įvestį, todėl galite naudoti abu vienu metu.

## Prijungti pultelį {#connect-a-controller}

1. Prijunkite pultelį (arba susiekite jį).
2. Spustelėkite vaizdą ir paspauskite bet kurį pultelio mygtuką. Naršyklės parodo pultelį tik po pirmos įvesties.
3. Atidarykite **Kamera ir scena → Žaidimų pultas**. Įrenginių sąraše jis pažymėtas `●`.
4. Stumkite kairę svirtelę, kad skristumėte, dešinę – kad žiūrėtumėte. Jei kamera slenka, kai svirtelės centre, padidinkite **Negyvoji zona**.

Veikia bet koks įrenginys, kurį naršyklė priskiria standartiniam žaidimų pultelio išdėstymui. Skraidymo svirtis arba droselis (HOTAS) pagal numatymą ignoruojami; žr. žemiau.

## Susiejimas {#mapping}

| Valdiklis | Poveikis |
|---|---|
| Kairė svirtelė | Judėjimas: pirmyn/atgal ir šoniškai |
| Dešinė svirtelė | Žvilgsnis: sukimas ir pakėlimas, *Žvilgsnio greitis* laipsnių per sekundę visu nukreipimu |
| `RT` / `LT` (analoginiai) | Aukštyn / žemyn; lygiagrečioje projekcijoje – artinti / tolinti |
| `RB` (laikant) | 6 kartus greičiau |
| `LB` (laikant) | 15 % greičio |
| `A` (laikant) | 3 kartus greičiau bėgti (derinasi su RB/LB) |
| `Y` (paspaudus) | Įrėminti duomenis |

Mygtukų numeriai atitinka standartinį išdėstymą: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; svirtelės ašyse 0–1 (kairė) ir 2–3 (dešinė).

## Žaidimų pultelio nustatymai {#the-gamepad-settings}

Skiltyje **Kamera ir scena → Žaidimų pultas**. **Nustatymai** / **Slėpti** atveria derinimo valdiklius.

| Valdiklis | Numatytoji reikšmė | Ribos (slinkimas) | Reikšmė |
|---|---|---|---|
| **Įjungta** | įjungta | | |
| Įrenginio būsena | | | Kiekvienas prijungtas įrenginys: `●`, kai sekamas, `○`, kai ne, o nestandartiniams įrenginiams – *- ne XInput pultas, ignoruojamas* arba *- ne XInput pultas, vis tiek naudojamas*. Jei nėra nė vieno: *Pultelis nerastas. Naršyklės parodo pultelį tik po pirmos įvesties – paspauskite jo mygtuką.* |
| **Naudoti įrenginį** | *Tik XInput pultai (rekomenduojama)* | | Rodoma, kai prijungtas nestandartinis įrenginys. Pasirinkite įrenginį pagal pavadinimą, kad sektumėte būtent jį. |
| **Žvilgsnio greitis** | 150°/s | 20–540 (5000) | Sukimosi greitis, kai dešinė svirtelė visiškai nukreipta. |
| **Negyvoji zona** | 12 % | 0–50 % (95 %) | Radialinė: įstrižas stūmimas niekada nepaveikia vienos ašies. Padidinkite, jei kamera slenka, kai svirtelės centre. |
| **Svirtelės kreivė** | x² | nuo tiesinės (1) iki x⁴ (16) | Atsako laipsnis po negyvosios zonos: smulkesnis valdymas arti centro, vis dar pilnas greitis kraštuose. |
| **Apversti svirtelės Y** | išjungta | | |
| **Sukeisti svirteles** | išjungta | | Judėjimas dešine svirtele, žvilgsnis kaire. |

Svirtelės formavimas: esant nukreipimui *m* (svirtelės vektoriaus ilgis) ir negyvajai zonai *d*, išvestis = ((m - d) / (1 - d)) ^ kreivė pagal svirtelės kryptį, o negyvosios zonos viduje – 0.

## Kodėl pagal numatymą tik standartiniai pultai {#why-only-standard-pads-by-default}

Žaidimų pultelio API praneša **apie kiekvieną** HID įrenginį su ašimis – skraidymo svirtis, droselius, pedalus, vairus – o tie įrenginiai nesustoja centre: sukimo ašis arba droselio svirtis stovi visu nukreipimu, kai niekas jos neliečia. Jei tai skaitoma kaip svirtis, atsiranda nuolatinė pilno greičio įvestis, kurios joks negyvosios zonos nuslopinti negali, ir kamera pati sukasi nuo tos akimirkos, kai puslapis įkeliamas (ir visi šilumos režimai atrodo sugedę, nes judanti kamera kiekvieną kadrą paleidžia kaupimą iš naujo).

Todėl įrenginys sekamas tik tada, kai naršyklė praneša `mapping: "standard"` – tai reiškia „XInput tipo pultas, kurio ašys ten, kur tikitės“. Kiti įrenginiai išvardijami ir pažymimi kaip ignoruojami, o **Naudoti įrenginį** leidžia pasirinkti vieną aiškiai – pavyzdžiui, kamerai valdyti HOTAS. Kai pultas jau sekamas, kamera lieka su juo, todėl du pultai nesikonfliktuoja dėl kameros priklausomai nuo įrenginių eilės tvarkos.

**HOTAS:** skaitomos tik ašys 0–3 (dvi svirtelės) ir standartiniai mygtukai. Droselis ar pedalai kitose ašyse nieko nedaro, o svirtis ar droselis, kurio ašys nestovi centre, gali reikalauti didesnės **Negyvosios zonos**.

Naršyklės paslepia pultelį, kol jis neatsiunčia pirmos įvesties, todėl prijungtas, bet neliestas pultelis puslapiui dar neegzistuoja.
