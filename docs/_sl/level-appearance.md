---
title: "Videz ravni"
parent: "Ravni in geometrija ozadja"
nav_order: 3
lang: "sl"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Videz ravni

Te nastavitve spremenijo, kako izgleda 3D raven, da toplota izstopa iz nje in da mesto še vedno lahko preberete. Nič tukaj ne spremeni podatkov.

## Hitri začetek {#quick-start}

1. Naložite 3D ravan ([3D ravni](model-levels.md)).
2. V razdelku **Ozadje / nivo** znižajte **Svetlost**, dokler toplota ni najsvetlejša stvar na zaslonu.
3. Odprite **Relief tal** in povišajte **Senčenje naklona** ali **Moč plastnic**, dokler ne razločite hriba od ravnine.
4. Odprite **Strukture**. Znižajte **Neprosojnost ploskev**, da vidite v stavbe, ali vklopite **Teksturo struktur**, da so videti trdne.
5. Če je na tleh naslikana slika, poskusite **Teksturo tal** izklopiti in vklopiti.

![Odprta razdelka Relief tal in Strukture, raven je prikazana z znaki reliefa](../assets/img/en/level-appearance-sections.webp)

Ko je naložena [3D raven](model-levels.md), plošča Ozadje / nivo prikazuje te nastavitve. Privzete vrednosti so tiste, ki jih dobi sveže uvožena raven ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Spreminjanje jih samo ponovno nariše prizor; kopičenje toplote ostane.

## Celotna raven {#the-whole-level}

| Nastavitev | Privzeto | Obseg | Pomen |
|---|---|---|---|
| **Neprosojnost** | 100 % | 0–100 % | Pod 100 % se raven pomeša in ne zapisuje globine, zato ne [zakriva](depth-and-culling.md) toplote več. |
| **Svetlost** | 0,9 | 0–2 (skok 64) | |

Raven je narisana razbarvano – siva tla, obarvana lupina –, da je toplota edina nasičena stvar na zaslonu. Za razliko od [slike zemljevida](map-images.md) ima 3D raven drsnik za razbarvanje.

## Relief tal {#ground-relief}

Od daleč so hrib in ravnina videti enako siva, zato pregledovalnik doda tri namige. Vsak odgovarja na drugo težavo:

| Nastavitev | Privzeto | Pomen |
|---|---|---|
| **Razmik plastnic** | iz razpona višin tal | Višina med plastnicami, logaritemsko od 1/4000 do 1/2 razpona višin ravni; spodnji konec proge je *izklopljeno*. Privzeto je 1/40 razpona višin tal, zaokroženo na korak 1/2/5 – črte na 10 m so primerne za pobočje in neuporabne na dnu kamnoloma. Vsaka peta črta je narisana močneje. Plastnice se rišejo v prostoru zaslona, zato so pri vsaki povečavi široke eno slikovno piko, in so edini znak, ki preživi tla, ki so preveč položna, da bi jih sploh senčili. |
| **Moč plastnic** | 35 % | 0–100 % |
| **Senčenje naklona** | 55 % | Zatemni po strmini, zato se bregovi in pečine berejo z vsakega kota kamere – za razliko od luči, ki se splošči, kadar ji obrnete proti. |
| **Višinska lestvica** | 50 % | Nizka tla temnejša, visoka svetlejša, čez razpon višin tal: velika oblika. |

Glava razdelka prikazuje stanje plastnic: *vsakih N m*, razmik plastnic ali *brez plastnic*, kadar je razmik izklopljen.

## Površina tal {#ground-surface}

| Nastavitev | Privzeto | Prikazano, kadar | Pomen |
|---|---|---|---|
| **Voda** | vklopljeno | raven ima vodo | Jezera, reke in morje, narisani ploski v bledo modro-sivi barvi: nobeden od znakov terena ne velja za površino, ki je po definiciji ravna. |
| **Neprosojnost vode** | 60 % | Voda je vklopljena | Obala in tla pod plitvinami so vidni skozi prosojno vodo. |
| **Trikotniki tal** | 30 % (0 za raven s teksturami) | vedno | Lastni robovi terena, narisani čez senčeno površino, ki bledijo med 6 % in 25 % širine ravni od kamere. Pokažejo, kako grobo so bila tla vzorčena, in dajo naklonu nekaj, po čemer lahko presodite razdaljo. Zgradijo se ob prvi uporabi, kar na veliki ravni traja trenutek. |
| **Tla samo kot žični model** | izklopljeno | vedno | Površino terena nadomesti z njenimi robovi. Popolnoma shematsko – opusti tudi senčenje, plastnice in zakrivanje, zato je navadno boljša izbira *Trikotniki tal*. |
| **Tekstura tal** | vklopljeno | raven ima teksture | Nariše tla v teksturah, ki jih nosi datoteka (asfalt, bankina, trava). Osvetlitev mreže se nanese nežno čez to, ker tekstura že nosi svoj fini relief. **Svetlost** je način, kako jo utišate pod toploto; razbarvanje pripada slikam zemljevidov. |
| **Zajeta barva** | izklopljeno | raven ima barve oglišč | Senči tla z barvo, ki jo je zajel skener, namesto s sivo – rekonstruirana cesta bi sicer ne bila ločljiva od bankine. Izvozi iz pogona jih nimajo; če jih ni, plošča pokaže *Ta raven nima barve.* |

## Strukture {#structures}

Glava **Strukture** prikazuje število trikotnikov struktur; namig pod njo pove, kako so narisane (*narisane trdne v lastnih teksturah* ali *narisane kot prosojna lupina, da lahko vidite toploto v njih*) in koliko delov je strukture.

| Nastavitev | Privzeto | Pomen |
|---|---|---|
| **Tekstura struktur** | vklopljeno, kadar strukture nosijo teksture | Nariše strukture trdne, v lastnih teksturah. Vklop nastavi neprosojnost ploskev na 100 % in izklopi robove; izklop se vrne na obarvano prosojno lupino pri 25 %. Strukturo s teksturo osvetli stran, ki jo vidi kamera, ker je znak dve ploskvi drug ob drugem in katera zmaga pri preizkusu globine, je odvisno od zaokroževanja. |
| **Robovi žičnega modela** | vklopljeno; izklopljeno nad 300.000 trikotniki struktur ali pri teksturah | Podvojeni robovi struktur, ena črta na rob. |
| **Neprosojnost robov** | 50 % | |
| **Ploskve lupine** | vklopljeno | Mehka površina s svetlim Fresnelovim robom, zato stavba izgleda kot prostornina, ne kot kletka ali megla. |
| **Neprosojnost ploskev** | 25 % (35 % nad 300.000 trikotniki struktur, 100 % s teksturo) | 0–60 % na progi, do 100 % z ročico. Naj bo nizka: trdne strukture skrijejo podatke v njih. |
| **Ostri robovi** | vklopljeno (izklopljeno pri teksturah) | Senči vsak trikotnik po njegovi lastni normali, izračunani v senčilniku fragmentov iz odvodov v prostoru zaslona. Izvožene ravni so zlite in nosijo povprečne normale, kar vsak vogal škatle zaokroži v »stopljeno folijo«; razdelitev vsakega oglišča, da bi to popravili, bi pomnožila medpomnilnik oglišč. Izklopite za raven, pri kateri so ukrivljene površine pomembnejše od njenih vogalov. |
| **Odtenek struktur** | Cian | Izbirnik barve in predloge **Cian**, **Jantarna**, **Vijolična**, **Bela**. |
| **Pokaži razvrstitev delov (N)** | | Vsak del, njegov razred in razlog; glejte [3D ravni](model-levels.md#ground-structures-and-water). |

## Rezanje ravni {#cutting-the-level}

[Rezina](slice.md) in, pri *Reži tudi nivo*, [izločanje po razdalji](depth-and-culling.md#distance-culling) režeta teren, strukture in vodo pri istih ravninah kot toploto.
