---
title: "Vzorčenje in proračuni"
parent: "Notranjosti upodabljanja"
nav_order: 3
lang: "sl"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Vzorčenje in proračuni

Kadar je pik preveč, da bi jih narisali v eni sličici, pregledovalnik nariše enakomeren vzorec in naredi, da vsaka pika šteje za več, da slika ostane pravilna. Krmilnik prilagaja, koliko jih nariše, da pregledovalnik ohrani svojo hitrost sličic.

## Nastavitve plošče Zmogljivost {#performance-panel-controls}

| Nastavitev | Privzeto | Obseg (skok) |
|---|---|---|
| **Vsako vrstico nariši v vsaki sličici** | vklopljeno | |
| **Prilagodljiv proračun** | vklopljeno | |
| **Ciljni FPS** | 60 | 20–240 (1000) |
| **Začetni sprajti / sličico** (prilagodljivo) ali **Sprajti / sličico** | 4,00 M | 65.536–268.435.456, logaritemsko (268.435.456) |
| **Ločljivost toplote** | 100 % | 25–100 %, pomnoženo z merilom druge stopnje prilagodljivega proračuna |
| **Postopno izboljševanje** | vklopljeno | Izklopljeno: vsaka sličica je nova ocena ene sličice (uporabno za ogled surovega vzorca). |

Glejte tudi [Plošča zmogljivosti in prekrivanje statistike](performance-and-stats.md).

## Za razvijalce {#for-developers}

### Kandidatne vrstice {#candidate-rows}

Vrstice so shranjene po naraščajočem času. Časovno okno časovnice [*lo*, *hi*] postane razpon vrstic z dvema binarnima iskanjema po stolpcu časa ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); brez stolpca časa je vsaka vrstica kandidat. To so **Vrstice v oknu** v prekrivanju statistike. Preizkusi po vrsticah – filtri, skupine, delitev, izločanje, rezina, življenjska doba – se izvedejo pozneje, v senčilniku; vrstica, ki ne uspe, stane en klic vozlišča in nobenega fragmenta.

### Načrt vzorčenja {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) razdeli razpon kandidatov na **bloke po 4096 zaporednih vrstic** in iz proračuna sprajtov za sličico izbere, koliko jih nariše:

- Če proračun pokrije vse bloke, so vsi narisani – sličica je točna.
- Sicer se bloki vzamejo v enakomernem koraku čez razpon, zamaknjeni za tresljaj, ki se vsako sličico premakne za zlati rez; zaporedne sličice tako pokrijejo različne bloke in unija se enakomerno zapolni. To je **stratificiran** vzorec: vsak del časovnega razpona je zastopan v vsaki sličici.

Toplota vsake narisane vrstice se pomnoži s **kandidati / poslanimi**, tako da je pričakovana toplota sličice točna pri vsakem proračunu; od proračuna je odvisen samo šum. Vrstice so shranjene v kosih po 8.388.608 (glejte [Zadrževanje v pomnilniku GPU](gpu-memory.md)); blok se razdeli, kjer prečka kos, in vsak kos dobi seznam začetkov blokov, ki jih mora narisati.

En načrt lahko nosi največ 65.536 blokov – 268.435.456 sprajtov – ker oba zaledja držita fiksni medpomnilnik začetkov blokov s 65.536 režami. Zahteva za več je tam omejena, primanjkljaj pa se pokaže pošteno kot več sličic do konvergence.

### Nariši vsako vrstico v vsaki sličici {#draw-every-row-each-frame}

**Zmogljivost → Vsako vrstico nariši v vsaki sličici** (privzeto **vklopljeno**): proračun postane tla in ne strop, sličica, ki začne novo oceno, pa nariše vsako vrstico, za katero je odgovorna (do meje 268 M).

Razlog: premik kamere zavrže kopičenje, zato je premikajoča se sličica ena sama ocena, katere šum je določen s tem, koliko podatkov je narisala – če je narisana četrtina, vidite četrtino v svetlih uteženih pikah, zaradi česar se premikajoči pogled blešči. Če narišete vse, je vsaka sličica končana slika. Strošek je, da čas sličice zdaj sledi velikosti podatkov v oknu; vzvodi so ožje časovno okno, filtri ali izločanje po razdalji, ki zmanjšajo kandidate namesto da bi jih redčili z vzorčenjem.

Izklopite na strojni opremi, ki si cele polje naenkrat ne more privoščiti: *Sprajti / sličico* so nato prava meja, pogled pa konvergira v nekaj mirnih sličicah.

Koliko stane celoten načrt, izmerjeno na vrhunski namizni grafični kartici pri platnu 4K z veliko ravnjo, sprajti s polmerom 1 m (ena ali dve slikovni piki): približno 100 M sprajtov na sličico pri 30 fps, 200 M pri 15 fps in največjih 268 M pri približno 12 fps. Pri tako majhnih sprajtih je vsa cena v stopnji oglišč in ločljivost toplote ničesar ne spremeni; pri velikih sprajtih je polnjenje: 8 M sprajtov s polmerom 100 m je pri polni ločljivosti toplote vzelo 2,5 s na sličico, pri 25 % pa 170 ms. **Nariši vsako vrstico v vsaki sličici** zato začne pri 67 M in se vsako sličico poveča za četrtino, dokler so sličice krajše od 150 ms, in prepolovi, kadar so daljše od 400 ms, tako da težak pogled ne more presekati, kar dovoli čuvaj GPU.

### Prilagodljiv proračun {#the-adaptive-budget}

**Zmogljivost → Prilagodljiv proračun** (privzeto vklopljeno) prilagaja proračun sprajtov, da drži **Ciljni FPS** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). V predvajanju škatel in med upodabljanjem videa miruje.

Vhod je čas sličice, zglajen (90 % prejšnjega + 10 % novega, posamezne sličice omejene na 2 s), proti cilju 1000 / max(15, ciljni FPS) ms.

**Prva stopnja – sprajti.** Vsako sličico se proračun pomnoži z `1 + (cilj / sličica - 1) × ojačitev`, z ojačitvijo 0,35, kadar je prepočasi, in 0,08, kadar je rezerve; omejeno na faktor 0,5–1,25 na sličico in na 65.536–268.435.456 sprajtov.

**Druga stopnja – ločljivost.** Ločljivost medpomnilnika toplote pade – za 8 % na sličico, do 25 % platna – šele, ko je proračun že na svoji spodnji meji in so sličice še vedno več kot 10 % prepočasne; vrne se za 4 % na sličico, ko je 30 % rezerve. Strošek senčenja pade s kvadratom ločljivosti, kar je pod gladkim profilom skoraj nevidno. (Izmerjeno na programskem upodabljanju z 10 M vrsticami in preveliki sprajti: 141 ms → 17 ms na sličico.) Merilo je zaokroženo na šestnajstinke; prekrivanje *Ločljivost toplote* ga prikaže.

**Odstop.** Počasna sličica izgleda enako, ne glede na to, ali so jo povzročili sprajti ali težka raven – časovnega merjenja po prehodih ni. Če proračun obtiči na spodnji meji in so sličice 30 zaporednih sličic pod 70 % cilja, sprajti niso strošek: krmilnik preklopi na **plezanje**, ki proračun pomnoži z 1,5 vsakih 14 sličic in vrne ločljivost, dokler čas sličice ostane znotraj 1,5-kratnika tega, kar je bil na spodnji meji. Plezanje, ki stvari poslabša bolj kot to, se vrne na 60 % in nadaljuje z običajnim krmiljenjem; doseg cilja plezanje konča.

Ob izklopljenem prilagodljivem proračunu je proračun preprosto **Sprajti / sličico**.

Ko je *Vsako vrstico nariši v vsaki sličici* vklopljeno, prilagodljivi proračun še vedno teče, vendar točno pravilo dvigne proračun, da pokrije vse kandidatne vrstice, zato v praksi nadzoruje samo stopnjo ločljivosti in sličice, ki ne začnejo nove ocene.
