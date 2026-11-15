---
title: "Figūros figūrų sutapdinime"
parent: "Figūros"
grand_parent: "Pakartojimas"
nav_order: 2
lang: "lt"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figūros figūrų sutapdinime

Šis puslapis apie tai, kaip dėžutes paversti mažomis 3D figūromis, vaizduojančiomis tai, kuo kiekvienas vienetas iš tikrųjų buvo, ir apie dūmus bei gaisrą, kuriuos figūros palieka. Pakartojimo pačio valdikliai aprašyti [Rungtynių pakartojime](match-replay.md).

[Dėžių pakartojime](box-replay.md) ir skirtuko Rungtynės figūrų pakartojime **Figūros vietoj dėžučių** (pagal numatymą įjungta) piešia kiekvieną gyvą asmenį kaip figūrą to, kuo jis yra: pėstininką, tanką, kurį kažkas vairuoja, orlaivį, kurį vaizduoja Tacview trajektorija. Figūra turi dėžutės spalvą, vietą ir kryptį. Orlaiviams ir raketoms ji taip pat turi pakilimo kampą, o jei duomenyse yra Roll stulpelis – ir posvyrį. **Figūrų dydis** keičia jų mastelį; 1 kartas yra tikras dydis. Paspaudimai ant figūros atsako taip, kaip atsakytų į jos dėžutę.

## Kuri figūra {#which-figure}

Lemia paties duomenų pavadinimo ir tipo stulpeliai. Visos taisyklės, su stulpelių pavadinimais, aprašytos [Figūrose](figures.md#which-figure-a-unit-gets). Duomenys be nė vieno iš šių stulpelių yra žmonių duomenys: visi – kariai.

Atitikimas talpinamas podėlyje pagal žymą, todėl kadras kainuoja tik išdėstymą. Duomenų vienetas yra metras, nebent duomenys nurodo, koks didelis yra vienas sekamas objektas (CS2 eksportas nurodo, kad žaidėjas yra 32 vienetų pločio); figūros pritaikomos pagal tai.

Pasirinktinis jūsų pačių figūrų rinkinys gali pakeisti katalogo figūras jūsų kompiuteryje; žr. [Figūros](figures.md#an-optional-local-figure-pack).

## Efektai {#effects}

Įvykių eilutės, kurios kažką palieka ilgesniam laikui, piešiamos ten, kur įvyko, tiek laiko, kiek tai tęsiasi, tos spalvos, kokios buvo jas sukėlusio asmens: dūmai (apie 18 s), molotovas arba degi granata (7 s), blyksnis (apie sekundę) ir sprogimas HE (mažiau nei sekundę), apgavikas (15 s), pasodinta bomba (40 s). Jie ateina iš įvykių stulpelio (Event, Events), kurio žymė yra `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` arba `plant` – CS2 eksportas juos rašo sprogimo momentu.

## Rungtynių pakartojimas: Tacview įrankiai {#match-replay-tacviews-tools}

Kameros, žymės, taktinis rodinys, statistika, etiketės, **Vertikalios linijos**, įvykių sąrašas ir grafikų langas aprašyti [Rungtynių pakartojime](match-replay.md). [Tacview paritetas](tacview-parity.md) išvardija kiekvieną Tacview funkciją ir jos būklę.
