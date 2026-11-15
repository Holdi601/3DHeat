---
title: "Plošča zmogljivosti in statistika"
parent: "Notranjosti upodabljanja"
nav_order: 7
lang: "sl"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Plošča za zmogljivost in prekrivni prikaz statistike

Okvirček v zgornjem desnem kotu pogleda pokaže, kako močno dela pregledovalnik: koliko sličic na sekundo, koliko pik riše in ali še izboljšuje sliko. Plošča **Zmogljivost** vam omogoča, da kakovost slike zamenjate za hitrost.

## Prekrivni prikaz statistike {#the-stats-overlay}

Okvirček v zgornjem desnem kotu pogleda na zavihkih Toplotna karta in Tekma ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Ob vsaki sličici animacije prebere živo vrednost motorja.

![Prekrivni prikaz statistike na prizoru mnogih tekem, z oštevilčenimi oznakami: 1 Zaledje, 2 FPS, 3 Sličica, 4 Vrstice v oknu, 5 Sprajti / sličico, 6 Proračun, 7 Ločljivost toplote, 8 Pokritost](../assets/img/en/performance-stats-overlay.webp)

| Vrstica | Pomen |
|---|---|
| **Zaledje** | *WebGPU* ali *WebGL2*. Če se z miško ustavite nad njo, izveste, zakaj WebGPU ni bil uporabljen, če ni bil. Glejte [Dva zaledja](backends.md). |
| **FPS** | Sličice na sekundo, povprečene vsaj 0,4 s. |
| **Sličica** | Čas sličice v ms, zglajen (90 % prejšnje, 10 % novo). To je čas med sličicami, ne čas GPU – čas posameznih prehodov GPU se ne meri. |
| **Vrstice v oknu** | Kandidatne vrstice: vrstice v trenutnem časovnem oknu, pred filtriranjem posamezne vrstice v senčilniku. |
| **Sprajti / sličico** | Sprajti, ki jih je poslal načrt zadnje sličice (na mirujočih sličicah, ki nič ne rišejo, ostane načrtovana vrednost). |
| **Proračun** | Proračun sprajtov, s katerim je bila ta sličica načrtovana – vrednost prilagodljivega krmilnika, dvignjena na vse kandidate, kadar riše vsako vrstico. |
| **Ločljivost toplote** | Ločljivost medpomnilnika toplote kot delež platna: nastavitev *Ločljivost toplote*, pomnožena z lestvico prilagodljive druge stopnje. |
| **Pokritost** | Kako daleč je postopno seštevanje prišlo do uporabe vsake vrstice: odstotek med zbliževanjem (jantarno), *natančno*, ko je končano. Šumna sličica se nikoli ne zamenja za končno sliko. |
| **Kocke** | Škatle, narisane v [predvajanju škatel](box-replay.md). |
| **Ni v pomnilniku** | Prikaže se samo, kadar vrstice niso šle v proračun GPU: koliko jih je. Glejte [Rezidenca v pomnilniku GPU](gpu-memory.md). |

## Prikaz hitrosti {#the-speed-display}

Spodaj desno v pogledu, samo v perspektivi: hitrost letenja in čas, ki ga pri tej hitrosti potrebujete, da preletite podatke. Povlecite jo, da spremenite hitrost. Glejte [Kamera](camera.md#fly-speed).

## Če je pregledovalnik počasen {#if-the-viewer-is-slow}

Poglejte prekrivni prikaz statistike, nato:

1. **Vrstice v oknu veliko večje od Sprajti / sličico, Pokritost pod 100 %** – sličica ne more narisati vsega; ko miruje, se zbliža v več sličicah. Zožite okno, filtrirajte ali odrežite, da zmanjšate kandidate; ali sprejmite vzorčenje.
2. **Sprajti / sličico enako Vrstice v oknu, sličica še vedno počasna** – strošek je na sprajt na zaslonu: znižajte *Največji polmer v pikah* ([Oblika sprajta](sprite-shape.md#pixel-clamps)) ali *Ločljivost toplote*.
3. **Počasno pri malo vrsticah** – verjetno raven: veliko število struktur z vključenimi robovi, talna trikotnika, globinska ostrina. Glejte [Videz ravni](level-appearance.md).
4. **Vse počasno in rdeč prapor** – programsko upodabljanje ([Zaznavanje programskega upodabljanja](software-rendering.md)).

## Plošča Zmogljivost {#the-performance-panel}

| Kontrola | Privzeto | Učinek |
|---|---|---|
| Namig | | Vsaka sličica razprši stratificirano naključno podmnožico vidnih vrstic z utežjo, ki je povečana za nadomestilo, zato je pričakovana toplota natančna pri vsakem proračunu; če pogled držite pri miru, sličice še naprej združujejo, dokler ni vsaka vrstica prispevala. |
| **V vsaki sličici nariši vse vrstice** | vklopljeno | Vsaka sličica, ki začne nov oceno, nariše vsako kandidatno vrstico (do približno 268 M); spodnji proračun postane najnižja vrednost. [Vzorčenje in proračuni](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Prilagodljiv proračun** | vklopljeno | Uglasi sprajte na sličico, nato ločljivost toplote, da zadrži ciljno hitrost sličic – in neha zmanjševati, kadar zmanjševanje ne pomaga. [Vzorčenje in proračuni](sampling-and-budgets.md#the-adaptive-budget) |
| **Ciljni FPS** | 60 | 20–240 (1000 z ročico). Vrednosti pod 15 se obravnavajo kot 15. |
| **Začetni sprajti / sličico** / **Sprajti / sličico** | 4,00 M | 65.536–268.435.456, logaritemsko. Imenuje se *Začetni*, ko je prilagodljivo vklopljeno, ker ga krmilnik premika. |
| **Ločljivost toplote** | 100 % | 25–100 %. Strošek prekrivanja raste s kvadratom: 50 % zmanjša delo mešanja na četrtino, toplotno polje pa je dovolj gladko, da se to komaj vidi. |
| **Postopno izboljševanje** | vklopljeno | Seštevaj preko sličic, medtem ko pogled miruje. Če je izklopljeno, se ocena ene sličice prikaže na vsaki sličici. [Seštevanje](accumulation.md) |
| **Proračuni virov** | zaznano | Proračuni za RAM, GPU in nit razčlenjevalnika. [Pomnilnik in proračuni](memory-and-budgets.md#resource-budgets) |

Nobena od teh nastavitev se ne shrani; ob ponovnem nalaganju se vrnejo privzete vrednosti.
