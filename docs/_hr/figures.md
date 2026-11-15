---
title: "Figure"
parent: "Reprodukcija"
nav_order: 3
has_children: true
lang: "hr"
source: "figures.md"
source_hash: "7040eba3b7ac"
translated: true
outdated: false
---

# Figure

**Figura** je mali 3D model onoga što jedinica zapravo jest: tenka, mlaznjaka, broda, vojnika. [Reprodukcija](match-replay.md) crta svaku jedinicu kao njezinu figuru u stvarnoj veličini, umjesto kao običnu kutiju.

Ima oko 2.000 imenovanih vozila, zrakoplova, brodova, oružja i vojnika, a sve ih je izgradio sam preglednik.

![Tenkovi iz demo podataka nacrtani kao vlastite figure](../assets/img/hr/replay-tanks.webp)

## Što je u katalogu {#what-is-in-the-catalogue}

| Domena | Primjeri |
|---|---|
| Ljudi | vojnik koji stoji, čuči, leži ničice; snajperist, protuoklopni, medicinar, posada |
| Kopno | tenkovi, oklopna borbena vozila, protuzračna obrana, topništvo, kamioni i automobili, vlakovi i tramvaji |
| Zrak | lovci, jurišni zrakoplovi, bombarderi, transporti, helikopteri, od dvokrilaca do modernih mlaznjaka |
| More | ratni brodovi po klasi, nosači zrakoplova, podmornice, čamci, trgovački brodovi |
| Oružje | rakete, projektili, bombe, torpeda, mamci (flare) i kutići za ometanje (chaff) |
| Oznake | dimne, bljeskalice i zapaljive granate, postavljene bombe, zastave, mjesta pojave, točke puta |
| Bliska borba | vojnici u nosačima ploča s jurišnom puškom, strojnicom, sačmaricom, DMR-om, LMG-om, pištoljem ili štitom; dronovi, kamere, bodljikava žica, štitovi, ojačanje zidova, barikade, punjenja za proboj, zamke, prozori, granate, defuser |

## Kako se figure prave {#how-the-figures-are-made}

- **Građene iz objavljenih dimenzija.** Većinu figura pravi vlastiti graditelj figura preglednika iz javnih brojeva: duljina, širina, visina, kotači na cesti, kupola i top, krila i rep. Njihov oblik se zatim podešava prema javnim fotografijama, crtežima i objavljenim dimenzijama. Nisu korišteni modeli nijedne igre.
- **Besplatni modeli.** Nekoliko figura koristi besplatne 3D modele (CC0 ili CC BY) tamo gdje su vjerniji, ponekad spojene s izgrađenim trupom. Autori djela CC BY navedeni su na [Zasluge za figure](figure-credits.md); djela CC0 ne traže navođenje i nisu tamo popisana.
- Svaka figura ima punu, grubu i daleku verziju (razine detalja, LOD), pa se tisuće mogu nacrtati odjednom.

## Koju figuru jedinica dobija {#which-figure-a-unit-gets}

Preglednik gleda vlastite stupce podataka:

1. **Nazivi** - stupci nazvani *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* ili *Figure* - uspoređuju se s katalogom: točno, kroz oko 4.000 aliasa (id-ovi jedinica iz više igara), po najdužem poznatom početku (`F-16C_50` je F-16C), ili po najkraćem nazivu figure koji počinje tim nizom.
2. Naziv čija figura ne odgovara **tipu** jedinice se ne koristi (kamion zvan *Typhoon* nije lovac).
3. **Tipovi** - stupci nazvani *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* ili *Domain* - daju figuru klase: Tacview oznake (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), oznake na karti ili obične riječi (tank, helicopter, infantry).
4. Podaci bez nijednog od toga su podaci o ljudima: svi su vojnici.

Zato je najlakši način da dobiješ prave figure stupac `vehicle` sa stvarnim nazivima ili stupac `type` s Tacview oznakama.

**Moja jedinica se prikazuje kao kutija ili vojnik.** Dodaj stupac `vehicle` sa stvarnim nazivom ili stupac `type` s Tacview oznakom. Pređi mišem preko jedinice da vidiš koji je naziv pronađen. Podaci koji imaju takve stupce, ali ne govore ništa o jedinici, ostavljaju je kao kutiju; podaci bez ijednog se crtaju kao vojnici.

## Figure za blisku borbu (Rainbow Six Siege) {#close-quarters-figures-rainbow-six-siege}

Tablice zapisane poput onih iz čitača snimki Rainbow Six Siege (stupci `operator`, `pawn`, `primaryClass`, `side`) dobivaju vlastite figure:

- **Igrači** su svoj operater: svaki od 78 operatera ima vlastitu figuru, visoku oko 1,8 m, u vlastitoj odjeći - dvije ili tri boje za jaknu, hlače i opremu prema njihovu uobičajenom javnom izgledu (crna, maslinasta, pješčana, gradska siva, bijela, mornarsko plava, s crvenom, narančastom ili tirkiznom opremom) - i s vlastitim oblicima, za trećinu većima od stvarnih ondje gdje se moraju vidjeti odozgo: pokrivalo za glavu (kacige, vizir ili teška kaciga, kape sa šiltom, pletene kape, beretke, široki šešir boonie ili krznena kapa, kapuljače, šalovi, kosa), lice (zaštitne naočale, plinska maska, naočale, maska, brada, naočale s tri leće), laka, srednja ili teška građa (teški su široki, s velikim pločama na ramenima i ovratnikom), dugi kaput ili odijelo, maskirno odijelo ghillie, ono što nose na leđima (čekić, punjenja, dronove, kanistre, spremnik goriva, cijev lansera, samostrel, ploče, ometač, štit) ili na ruci (lanser, metalnu ruku), vlastiti štit (visoki štit, policijski štit, štit sa svjetlima) i naglasna boja na ramenima. Drže klasu svog glavnog oružja. Operater kojeg preglednik ne poznaje običan je vojnik u nosaču ploča u boji tima.
- **Strana** se vidi odvojeno od odjeće: prsten na tlu ispod svakog operatera, **jantarni za napad, blijedo cijan za obranu**, s bojom tima unutra, te trake na ruci i glavi u istoj boji. Stupac `stance` (stand, crouch, prone) postavlja ih u položaj; bez njega stoje.
- **Razlikuju se na udaljenosti snimke:** iscrtani 48 piksela visoko odozgo i iz tri četvrtine, svaka se dva operatera na istoj strani razlikuju jasnom razlikom u boji ili drugačijim oblikom (provjereno testovima preglednika).
- **Oznake** navode igrača i operatera kojeg u tom trenutku igra, s ulogom operatera kao simbolom: ✸ tvrdi proboj, ⚒ meki proboj, ➤ ulaz, ✦ fragger, ✚ podrška, ⬟ štit, ◉ izviđanje, ◇ fleks, ↺ čuvanje boka, ⚓ sidro, ✕ postavljač zamki, ⇄ roamer, ↯ protiv naprava, ▣ protiv proboja.
- **Dronovi** su dron na dva kotača koji se baca, širok oko 30 cm, svaki svoj vlastiti trag nazvan po vlasniku („Ash · drone 2”).
- **Postavljene naprave** stoje ondje gdje su postavljene, od tada do kraja runde, svaka kao figura onoga što radi: kamera, bodljikava žica, postavljivi štit, punjenje za proboj, punjenje za tvrdi proboj, malo ljepljivo punjenje, podna zamka, claymore s laserskim okidačem, jednosmjerni prozor, oklopna ploča, granata, plinski kanister, ometač, senzor, laserska vrata, kutija sa zalihama. Jedna figura služi svakoj napravi koja obavlja isti posao. Naprava čiju vrstu podaci ne navode mali je uređaj sa svjetlom.
- **Defuser** stoji ondje gdje je postavljen, svojih 45 sekundi.

Svaki dron i naprava pri učitavanju datoteke postaje vlastiti trag, pa igračeva vlastita figura ostaje na njegovu tijelu. Operateri su pojednostavljeni oblici prema njihovim javnim opisima i ilustracijama (što nose, uređaj koji je njihova sposobnost), a naprave su oblikovane prema onome što rade. Sve su to vlastiti dizajni preglednika u stvarnoj veličini stvari (claymore širok oko 22 cm, ploča veličine vrata 1 m × 2,1 m), a ne modeli iz igre.

## Postavke {#settings}

Odjeljak **Figure** u bočnoj traci reprodukcije postavlja veličinu, najmanju veličinu na ekranu, u što se pretvaraju daleke jedinice (figura, strelica, simbol) i učinke koji se crtaju na njima. Vidi [Reprodukcija utakmice](match-replay.md#figures). Dim, vatra i drugi vremenski učinci: [Figure u preklapanju figura](figure-replay.md).

## Izborni lokalni paket figura {#an-optional-local-figure-pack}

Na svojem računalu možeš čuvati izborni paket vlastitih figura. Njegove figure zauzimaju mjesto figura iz kataloga s istim nazivima. Nikad nije dio repozitorija ni objavljene verzije; bez njega se ništa ne mijenja.
