---
title: "Notranjosti upodabljanja"
nav_order: 22
has_children: true
lang: "sl"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Notranjost upodabljanja

Pregledovalnik riše na milijone pik kot žareče kroglice in jih sešteva. Ta razdelek razloži trike, ki to ohranjajo hitro, in kaj pomenijo števila v prekrivnem prikazu statistike. Preberite ga, če se vam zdi pregledovalnik počasen ali če želite delati na upodabljalniku.

```
podatki -> časovno okno -> filtri GPU -> načrt vzorčenja -> razpršitev -> seštevanje -> barva -> zaslon
```

Da vidite, kako je z vašim računalnikom, poglejte okvirček s statistiko v zgornjem desnem kotu pogleda: [Plošča za zmogljivost in prekrivni prikaz statistike](performance-and-stats.md). Nove besede (GPU, vrstica, sprajt, toplotna karta) so v [slovarju](glossary.md).

## Osrednji problem {#the-core-problem}

Vsota prekrivajočih se radialnih prehodov stane *N* × π*r*² zmešanih fragmentov na sličico. Pri 100 milijonih sprajtov s polmerom 8 slikovnih pik je to 2 × 10¹⁰ fragmentov – približno sekundo dela na zmogljivi grafični kartici. Vsake sličice ni mogoče izračunati s silo, zato pregledovalnik združuje:

- **vrstice, urejene po času** – časovno okno je dve binarni iskanji, strošek predvajanja pa sledi vrsticam v oknu, ne celotnemu naboru podatkov;
- **nič po vrsticah na CPE na sličico** – vrstice so v pomnilniku GPU, kvantizirane; filtri, predznaki skupin, preizkus življenjske dobe, okno, izrezovanje in rez se ovrednotijo v senčilniku oglišč;
- **stratificirano vzorčenje** z uravnoteženimi utežmi, kadar sličica ne more narisati vseh vrstic, in **postopno seštevanje**, ki se zbližuje k natančnemu rezultatu vseh vrstic, dokler je pogled odprt ([Vzorčenje in proračuni](sampling-and-budgets.md), [Seštevanje](accumulation.md));
- **dvostopenjsko zaviranje**, ki zamenja sprajte na sličico, nato ločljivost toplote, za hitrost sličic ([Vzorčenje in proračuni](sampling-and-budgets.md#the-adaptive-budget));
- **uveljavljeni pomnilniški proračuni**, zato podatkovna množica, ki se ne prilega, vidno odreže vsebino, namesto da bi sesula program ([Rezidenca v pomnilniku GPU](gpu-memory.md)).

## Ena sličica {#one-frame}

Zanka sličic je [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Vse, kar se spreminja s hitrostjo sličic – kamera, predvajalna glava, proračun – je v motorju, ne v stanju aplikacije, zato sličica ne stane nobenega dela Reacta; stanje se prebere enkrat na sličico in se zapiše nazaj le za redkejše prikaze.

1. **Novi podatki?** Nova podatkovna množica se napove (*Nalaganje N vrstic v GPU*) na eni sličici in naloži na naslednji, tako da je sporočilo izrisano, preden delo blokira nit. Nova raven se preda upodabljalniku; poti toplotne črte se zgradijo ali sprostijo.
2. **Predvajalna glava** napreduje (največ 0,1 s stenske ure na sličico), se zanka ali ustavi.
3. **Kamera** prebere tipke, miško in igralni plošček; zrcalna os se vključi v matriko pogleda; pri WebGPU matrika preslikave globine pretvori obseg globine v slogu OpenGL iz three.js v obseg WebGPU.
4. **Kaj je vidno**: časovni obseg iz časovnice in zgodovine; tabela predznakov skupin (vidnost samo pri razdelitvi po stolpcu); do štirje filtri – filtri stolpcev in izbira Entitet; razdelitev razlike.
5. **Tabeli barv in krivulj** se obnovita, če so se njune nastavitve spremenile.
6. **Proračun**: prilagodljiv krmilnik nastavi proračun sprajtov in ločljivost toplote za to sličico; pri *Riši vsako vrstico na vsaki sličici* se proračun dvigne, da pokrije vsako kandidatno vrstico.
7. **Podpisi** odločajo, kaj vmesnik za seštevanje še pomeni: sprememba, ki spremeni, kaj vrstice prispevajo ali kako (*geometrija*), časovno okno ali samo način barvanja rezultata (*sestava*). Glejte [Seštevanje](accumulation.md#what-restarts-it).
8. **Načrt vzorčenja**: kateri bloki vrstic se narišejo ([Vzorčenje in proračuni](sampling-and-budgets.md)).
9. **Način seštevanja**: ponastavi, razširi, drseče povprečje, tekoče povprečje ali miruj.
10. **Geometrija predvajanja škatel** (kocke, sledi) na CPE, samo v tem načinu in samo kadar ni mirovanja.
11. **Upodobitev**: zaledje nariše prizor (raven, mreža, osi, škatle, sledi, ravnilo), razprši toploto v cilj toplote, jo združi v seštevalnik in sestavi toploto nad prizorom na platno.
12. **Samodejna osvetlitev** se sproži, ko odštevanje doseže nič; sonda toplote ravnila prebere največ eno slikovno piko na 120 ms; prikazi se objavijo.

Mirujoča sličica – konvergirana, nič se ni spremenilo – preskoči prizor in razprševanje, vendar še vedno **ponovno sestavi**: platno WebGL, ustvarjeno brez `preserveDrawingBuffer`, ima po sestavljanju nedoločeno vsebino, zato ne smemo zaupati, da bo še kazalo zadnjo sličico. Prizor in cilji toplote so lastni medpomnilniki okvirja pregledovalnika in se ohranijo, zato mirujoča sličica stane en celozaslonski prehod.

## Strani v tem razdelku {#pages-in-this-section}

- [Dva zaledja](backends.md) – WebGPU in WebGL2, kako se izbere, stikala v naslovu URL
- [Seštevanje](accumulation.md) – ponastavi, razširi, drseče povprečje, tekoče povprečje
- [Vzorčenje in proračuni](sampling-and-budgets.md) – stratificirani vzorčevalnik, natančen način, prilagodljivi proračun
- [Seštevanje v polovični plavajoči vejici](half-float-accumulation.md) – obseg in natančnost na 16-bitnih ciljih
- [Rezidenca v pomnilniku GPU](gpu-memory.md) – kvantizirana shramba vrstic in uveljavljeni proračun GPU
- [Zaznavanje programskega upodabljanja](software-rendering.md)
- [Plošča za zmogljivost in prekrivni prikaz statistike](performance-and-stats.md)
