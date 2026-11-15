---
title: "Izgled nivoa"
parent: "Nivoi i geometrija pozadine"
nav_order: 3
lang: "bs"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Izgled nivoa

Ove kontrole mijenjaju kako izgleda 3D nivo, da se toplota ističe iz njega i da i dalje možeš čitati mjesto. Ništa ovdje ne mijenja podatke.

## Brzi početak {#quick-start}

1. Učitaj 3D nivo ([3D nivoi](model-levels.md)).
2. U **Pozadina / nivo** spusti **Svjetlinu** dok toplota ne bude najsvjetlija stvar na ekranu.
3. Otvori **Reljef tla** i pojačaj **Sjenčenje nagiba** ili **Jačinu izohipsi** dok ne možeš razlikovati brdo od ravnice.
4. Otvori **Strukture**. Spusti **Neprozirnost ploha** da vidiš unutrašnjost zgrada, ili uključi **Teksturu struktura** da ih vidiš čvrste.
5. Ako je na tlu nacrtana slika, probaj **Teksturu tla** isključeno i uključeno.

![Otvoreni odjeljci Reljef tla i Strukture, s nivoom prikazanim s tragovima reljefa](../assets/img/en/level-appearance-sections.webp)

Kada je 3D [nivo](model-levels.md) učitan, panel Pozadina / nivo prikazuje ove kontrole. Zadane vrijednosti su one koje dobija svježe uvezeni nivo ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Promjena ih samo ponovo iscrta scenu; akumulacija toplote se čuva.

## Cijeli nivo {#the-whole-level}

| Kontrola | Zadano | Opseg | Značenje |
|---|---|---|---|
| **Neprozirnost** | 100% | 0-100% | Ispod 100% nivo se miješa i ne upisuje dubinu, pa više ne [zaklanja](depth-and-culling.md) toplotu. |
| **Svjetlina** | 0,9 | 0-2 (klizač 64) | |

Nivo se crta bez zasićenja - siva tla, nijansirana ljuska - pa je toplota jedina zasićena stvar na ekranu. Za razliku od [slike karte](map-images.md), 3D nivo nema klizač Odzasićenje.

## Reljef tla {#ground-relief}

Izdaleka se brdo i ravnica vide kao ista siva, pa prikaz dodaje tri nagovještaja. Svaki rješava drugi problem:

| Kontrola | Zadano | Značenje |
|---|---|---|
| **Razmak izohipsi** | iz opsega visina tla | Visina između linija izohipsi, logaritamski od 1/4000 do 1/2 opsega visina nivoa; donji kraj staze je *isključeno*. Zadano je 1/40 opsega visine tla zaokruženo na korak 1/2/5 - linije na 10 m pristaju padini i beskorisne su na dnu kamenoloma. Svaka peta linija se crta jače. Izohipse se crtaju u prostoru ekrana, pa ostaju širine piksela pri svakom zumu, i one su jedini nagovještaj koji preživi tlo koje je previše položeno da bi se uopšte sjenčilo. |
| **Jačina izohipsi** | 35% | 0-100% |
| **Sjenčenje nagiba** | 55% | Potamnjuje po strmini, pa obale i litice čitaju se iz svakog ugla kamere - za razliku od svjetla, koje spljošti kad god gledaš prema njemu. |
| **Skala nadmorske visine** | 50% | Nisko tlo tamnije, visoko svjetlije, kroz opseg visina tla: velik oblik. |

Zaglavlje odjeljka pokazuje stanje izohipsi: *svakih N m*, razmak izohipsi, ili *bez izohipsi* kada je razmak isključen.

## Površina tla {#ground-surface}

| Kontrola | Zadano | Prikazuje se kada | Značenje |
|---|---|---|---|
| **Voda** | uključeno | nivo ima vodu | Jezera, rijeke i more, nacrtani ravno u blijedoj plavo-sivoj: nijedan nagovještaj terena ne važi za površinu koja je po definiciji ravna. |
| **Neprozirnost vode** | 60% | Voda je uključena | Obala i tlo pod plićacima se vide kroz prozirnu vodu. |
| **Trokuti tla** | 30% (0 za nivo s teksturama) | uvijek | Vlastite ivice terena nacrtane preko osjenčene površine, koje nestaju između 6% i 25% širine nivoa od kamere. Pokazuje koliko je grubo tlo uzorkovano i daje nagibu nešto po čemu se može suditi daljina. Gradi se pri prvoj upotrebi, što traje na velikom nivou. |
| **Tlo samo kao žičani model** | isključeno | uvijek | Zamjenjuje površinu terena njenim ivicama. Potpuno šematski - odriče se i sjenčenja, izohipsi i zaklanjanja, pa je *Trokuti tla* obično bolji izbor. |
| **Tekstura tla** | uključeno | nivo ima teksture | Crta tlo u teksturama koje datoteka nosi (asfalt, bankina, trava). Osvjetljenje mreže se nježno primjenjuje preko, jer tekstura već nosi svoj fini reljef. **Svjetlina** je način da je utišaš pod toplotom; Odzasićenje pripada slikama karte. |
| **Snimljena boja** | isključeno | nivo ima boje vrhova | Osjenčava tlo bojom koju je skener snimio umjesto sive - rekonstruisani put bi inače bio nerazlučiv od bankine. Izvozi motora ne nose ništa; kada ih nema, panel kaže *Ovaj nivo nema boju.* |

## Strukture {#structures}

Zaglavlje **Strukture** pokazuje broj trouglova strukture; napomena ispod kaže kako se crtaju (*crtaju se čvrsto u vlastitim teksturama* ili *crtaju se kao prozirna ljuska da vidiš toplotu unutra*) i koliko je dijelova strukture.

| Kontrola | Zadano | Značenje |
|---|---|---|
| **Tekstura struktura** | uključeno kada strukture nose teksture | Crta strukture čvrsto, u vlastitim teksturama. Uključivanje postavlja neprozirnost ploha na 100% i isključuje ivice; isključivanje vraća nijansiranu prozirnu ljusku na 25%. Struktura s teksturom se osvjetljava s strane koju kamera vidi, jer je znak dvije plohe leđa uz leđa, a koja pobijedi test dubine zavisi od zaokruživanja. |
| **Ivice žičanog modela** | uključeno; isključeno iznad 300.000 trouglova strukture ili kada su teksturisane | Ponovo iskorištene ivice struktura, jedna linija po ivici. |
| **Neprozirnost ivica** | 50% | |
| **Plohe ljuske** | uključeno | Blijeda površina sa svijetlim Frenelovim rubom, pa zgrada čitljiva kao zapremina, a ne kao kavez ili magla. |
| **Neprozirnost ploha** | 25% (35% iznad 300.000 trouglova strukture, 100% sa teksturom) | 0-60% na stazi, do 100% s ručicom. Drži nisko: čvrste strukture skrivaju podatke unutar sebe. |
| **Oštre ivice** | uključeno (isključeno kada je teksturisano) | Osjenčava svaki trougao prema sopstvenoj normali, izračunatoj u shaderu fragmenta iz izvoda u prostoru ekrana. Izvezeni nivoi su zavareni i nose usrednjene normale, što svaki ugao kutije zaokruži u „otopljenu foliju"; razdvajanje svakog vrha da se to popravi bi umnožilo bafer vrhova. Isključi za nivo čije zakrivljene površine važe više od njegovih uglova. |
| **Nijansa struktura** | Cijan | Birač boja i zadane vrijednosti **Cijan**, **Jantar**, **Ljubičasta**, **Bijela**. |
| **Prikaži klasifikaciju dijelova (N)** | | Svaki dio, njegova klasa i razlog; vidi [3D nivoe](model-levels.md#ground-structures-and-water). |

## Presijecanje nivoa {#cutting-the-level}

[Presjek](slice.md) i, uz *Sijeci i nivo*, [odsijecanje po udaljenosti](depth-and-culling.md#distance-culling) presijecaju tlo, strukture i vodu istim ravnima kao toplotu.
