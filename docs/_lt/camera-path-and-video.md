---
title: "Kameros kelias ir vaizdo įrašas"
nav_order: 15
lang: "lt"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Kameros kelias ir vaizdo įrašas

Sukurkite savo duomenų filmą: kamerą padedate keliose vietose, o peržiūra skrenda tarp jų ir išsaugo vaizdo įrašą. Kiekvienas kadras labai švarus, be grūdėtumo. Kamera ir grojimo žymeklis juda kartu, todėl tas pats skydelis daro ir laiko tėkmės įrašą ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Sukurti skrydį {#make-a-flythrough}

1. Nuskraidinkite ten, kur filmas prasideda, ir paspauskite **Pridėti pagrindinį kadrą čia** skiltyje **Kameros kelias ir atvaizdavimas**.
2. Nuskraidinkite į kitą vietą ir vėl paspauskite. Kartokite kiekvienai stotelei.
3. Pažymėkite **Peržiūra pagal kelią** ir vilkite **Padėtis kelyje**, kad patikrintumėte judesį.
4. Nustatykite **Trukmę** (kiek ilgas bus vaizdo įrašas). Teisingas, bet per greitas judesys reikalauja tik ilgesnės trukmės.
5. Paspauskite **Atvaizduoti vaizdo įrašą**. Palaukite progreso eilutės; failas parsisiunčia, kai baigiama.

![Skydelis Kameros kelias ir atvaizdavimas su trimis pagrindiniais kadrais, Glotni interpoliacija, 12 s, 30 fps ir 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Pagrindiniai kadrai {#keyframes}

| Valdiklis | Poveikis |
|---|---|
| **Pridėti pagrindinį kadrą čia** | Prideda dabartinę kameros padėtį, posūkį, polinkį ir vaizdo lauką kaip pagrindinį kadrą. |
| **Išvalyti** | Pašalina visus pagrindinius kadrus. |
| Pagrindinių kadrų sąrašas | Viena eilutė kiekvienam raktui: jo numeris (spustelėkite, kad kamera nuskristų ten, kartu nustatant ir vaizdo lauką), padėtis, `posūkis° / polinkis°` ir **×**, kad pašalintumėte. |

Raktai išdėstomi **tolygiai** palei normalizuotą kelio ašį nuo 0 iki 1, kai kuris nors pridedamas ar pašalinamas; išvesties trukmė tada ištempia visą judesį, todėl kadras, kuris teisingas, bet per greitas, reikalauja tik ilgesnės trukmės. Posūkis tarp raktų išvyniojamas, kad kamera pasisuktų trumpesniu keliu.

Be pagrindinių kadrų atvaizdavimas visą klipą palieka dabartinę kamerą nejudančią – visiškai tinkamas laiko tėkmės įrašas.

## Kelio nustatymai {#path-settings}

| Valdiklis | Numatytoji | Intervalas (vilkimas) | Reikšmė |
|---|---|---|---|
| **Interpoliacija** (2+ raktai) | *Glotni* | *Glotni* / *Tiesi* | *Glotni*: kubinė Hermito kreivė per raktus su liestinėmis iš gretimų raktų, todėl greitis sutampa per kiekvieną raktą ir nėra trūkčiojimo ten, kur susijungia atkarpos. *Tiesi*: tiesios linijos tarp raktų, nuspėjamos, su matomu kampu kiekviename rakte. Vaizdo laukas visada interpoliuojamas tiesiškai. |
| Kelionės linija (2+ raktai) | | | `N vienetų kelionės – M per sekundę šia trukme`, arba pastaba, kad visi raktai yra vienoje vietoje. |
| **Peržiūra pagal kelią** (1+ raktas) | išjungta | | Valdo rodinio kamerą pagal kelią ir kartu perkelia grojimo žymeklį, kaip daro atvaizdavimas, kad judesį būtų galima įvertinti prieš atvaizduojant. |
| **Padėtis kelyje** (peržiūros metu) | 0 % | 0–100 % | Kur kelyje peržiūrėti. |
| **Trukmė** | 12 s | 1–120 s (3600) | Vaizdo įrašo ilgis. |
| **Kadrų dažnis** | 30 fps | 6–60 (240) | |
| **Bitų sparta** | 16 Mbps | 1–60 Mbps, logaritminis (400) | Šilumos gradientai blogai dalijasi mažose bitų spartose: kodekas neturi kur paslėpti klaidos. |
| **Konvergavimo laukimo riba** | 240 kadrų | 2–600 (10 000) | Ilgiausias, kiek vienas išvesties kadras gali laukti, kol taps tikslus. Kadrai, pasiekę ribą, vis tiek įrašomi ir suskaičiuojami. |
| Santrauka | | | `N kadrų · langas: kaupiamasis/fiksuotas/gyvavimo`, o kai laiko juosta yra režime Viskas: *(atvaizdavimas perjungia Viską į Groti, kad grojimo žymeklis turėtų prasmę)*. |
| **Atvaizduoti vaizdo įrašą** / **Atšaukti** | | | Pradeda atvaizdavimą; jam veikiant rodo `kadras i / n · laukta w · X MB` ir kiek kadrų nebuvo tikslūs. Reikia duomenų rinkinio. |

## Patarimai {#tips}

- Išvesties dydis yra drobės dydis įrenginio pikseliais (ekrano pikselių santykis, ribotas 2). Pakeiskite naršyklės lango dydį, kad jį pakeistumėte.
- Kaupiamoji istorija sukuria šilumą per klipą; lango ar gyvavimo istorija rodo judantį laiko gabalą.
- Pagrindinių kadrų padėtys yra ekrano koordinatės: su [apverstu pasaulio ašimi](camera.md#invert-world-axis) raktai, sukurti prieš perjungiant, po to rodo į kitą pusę.

## Kūrėjams {#for-developers}

### Ką daro atvaizdavimas {#what-a-render-does}

1. Padaro bandomąjį kadro užfiksavimą, kad sužinotų tikslų išvesties dydį įrenginio pikseliais.
2. Pasirenka kodeką per WebCodecs: **VP9** (`vp09.00.10.08`), kitaip **VP8**, pasirinkta bitų sparta ir kadrų dažniu. Be `VideoEncoder` sustoja su pranešimu *Šioje naršyklėje nėra VideoEncoder – vaizdo įrašui rašyti reikalingas WebCodecs*; jei nėra nė vieno kodeko – *Nepalaikomas vaizdo kodekas (bandyta VP9, VP8)*.
3. Perima atvaizdavimui reikalingus nustatymus: sustabdo grojimą, išjungia **prisitaikantį biudžetą**, įjungia **laipsniškas tikslinimas** ir nustato spraitų biudžetą į 64M kadrui (prisitaikantis biudžetas saugo kadrų dažnį, o tai čia netinkamas tikslas: jis kiekvieną lėtai konverguojantį kadrą laikytų priežastimi piešti mažiau eilučių, o tai reikalauja daugiau kadrų konvergencijai), ir laiko juostą perjungia iš **Viskas** į **Groti**. Istorijos nustatymas (kaupiamasis, langas, gyvavimo) paliekamas kaip buvo: atvaizdavimas turi parodyti tai, ką jūs žiūrėjote, paleistą ir užrašytą.
4. Kiekvienam išvesties kadrui *f* iš *n*, kai *u* = f / (n - 1):
   - kamerą padeda pagal kelio pozą ties *u* (jei yra raktų);
   - grojimo žymeklį perkelia į tą pačią dalį *u* laiko juostos intervalo (pasirinktos sesijos trukmė dėžutės pakartojime);
   - priverčia naują įvertinimą, net jei kamera nejudėjo – paveldėjus ankstesnio kadro kaupimą liktų ankstesnio lango šmėklos;
   - kadrą po kadro laukia, kol vaizdas taps tikslus (visos kandidatinės eilutės nupieštos viename kadre arba kaupimas baigtas), iki laukimo ribos;
   - užfiksuoja sudėtinį kadrą ir jį koduoja, su raktiniu kadru kas 2 išvesties sekundes, kad failas būtų galima peržiūrėti.
5. Sujungia kadrus į WebM failą ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) su laiko žymėmis, parinktomis pagal kadrų dažnį – sieninis laikas, per kurį užtruko kiekvienas kadras, nesvarbus.
6. Atkuria biudžetą, vaizdo lauką, laiko juostos režimą, grojimo žymeklį ir tai, ar buvo grojama.
7. Parsisiunčia vaizdo įrašą kaip `3dheat-<width>x<height>-<frames>f.webm` ir praneša `N kadrų W×H, X MB – kiekvienas kadras tikslus`, arba kiek pasiekė laukimo ribą.

**Atšaukti** sustoja po dabartinio kadro (*Atvaizdavimas atšauktas.*) ir atkuria nustatymus.
