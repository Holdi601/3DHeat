---
title: "Knjižnica ravni"
parent: "Ravni in geometrija ozadja"
nav_order: 4
lang: "sl"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Knjižnica ravni

Knjižnica hrani vaše ravni v tem brskalniku, zato jih vam ni treba znova nalagati in poenostavljati. **Če v brskalniku izbrišete podatke strani, se knjižnica izbriše, izvoza ni.** Ohranite svoje izvirne datoteke.

Obdelava ravni – razčlenjevanje, razvrščanje, varjenje, redčenje, pakiranje tekstur – je počasna, rezultat pa je vsakič enak. **Knjižnica** na dnu plošče Ozadje / raven hrani obdelane ravni v tem brskalniku, zato se poenostavljena mreža nikoli ne gradi dvakrat ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Shranite in ponovno naložite raven {#save-and-reload-a-level}

1. Naložite sliko zemljevida ali 3D model in preverite, ali je videti prav.
2. Pritisnite **Shrani v knjižnico**. Plošča pove *Shranjeno. Naslednjič se naloži takoj.*
3. Naslednjič odprite seznam **Knjižnica** in pritisnite ▸ ob ravni.
4. Pritisnite ✕, da izbrišete vnos, ki ga ne potrebujete več.

## Uporaba {#using-it}

| Kontrola | Učinek |
|---|---|
| **Shrani v knjižnico** | Shrani trenutno raven. Slika zemljevida se shrani kot PNG z obema sidroma; model kot njegovi obdelani medpomnilniki. Plošča pove *Shranjeno. Naslednjič se naloži takoj.* |
| Seznam knjižnice | Ena vrstica na shranjeno raven: ime (z njeno shranjeno velikostjo ob ustavitvi miške), trikotniki za model ali širina v slikovnih pikah za sliko. |
| ▸ (*Naloži*) | Naloži vnos kot trenutno raven. |
| ✕ (*Izbriši*) | Odstrani vnos. |
| Vrstica porabe | `Uporabljeno X od Y.` – ocena shrambe brskalnika za to spletno mesto. |

Če ni nič shranjeno, seznam pove *Prazno. Naložite zemljevid ali model, nato »Shrani v knjižnico«.*

## Kaj je shranjeno {#what-is-stored}

| Vrsta | Shranjeno | Ni shranjeno |
|---|---|---|
| Slika zemljevida | Slika (PNG), njena velikost, njena sidra | Višina, zrcaljenje, prosojnost, svetlost, razbarvanje – vrnjeno na privzete vrednosti (višina = najnižji Y trenutne podatkovne množice, zrcaljenje vklopljeno) |
| 3D raven | Oglišča, barve oglišč, koordinate tekstur, njihove ploščice in atlas tekstur, trikotniki tal / struktur / vode, robovi struktur, števila trikotnikov | Imena delov in razlogi za razvrstitev ter vse nastavitve videza – vrnjene na privzete vrednosti sveže uvoze |

Model, naložen iz knjižnice, nima seznama delov, njegove meje in pas višine tal pa se ponovno izračunata iz njegovih oglišč.

## Kje je shranjeno {#where-it-lives}

V IndexedDB brskalnika, baza `3dheat`, objektna shramba `levels`, za izvor strani (naslov v vrstici brskalnika). Velja samo za ta profil brskalnika: drug brskalnik, drug profil ali drug naslov (na primer `localhost` namesto `127.0.0.1`) vidi drugačno, prazno knjižnico. Če v brskalniku izbrišete podatke strani, se izbriše tudi ona. Vnosi, shranjeni s starejšimi različicami brez struktur, barv ali vode, se še vedno naložijo.
