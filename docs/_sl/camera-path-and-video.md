---
title: "Pot kamere in video"
nav_order: 15
lang: "sl"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Pot kamere in video

Posnemite film o svojih podatkih: kamero postavite na nekaj mest, pregledovalnik leti med njimi in shrani video. Vsaka sličica je zelo čista, brez zrnatosti. Kamera in glava predvajanja se premikata skupaj, zato isti razdelek naredi tudi časovni posnetek ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Naredite preletni posnetek {#make-a-flythrough}

1. Odletite tja, kjer se film začne, in v razdelku **Pot kamere in upodabljanje** pritisnite **Dodaj ključno sličico tukaj**.
2. Odletite do naslednjega mesta in ga spet pritisnite. Ponovite za vsako postajo.
3. Obkljukajte **Predogled vzdolž poti** in povlecite **Položaj na poti**, da preverite premik.
4. Nastavite **Trajanje** (kako dolg je video). Premik, ki je pravilen, a prehiter, potrebuje samo daljše trajanje.
5. Pritisnite **Upodobi video**. Počakajte na vrstico napredka; datoteka se prenese, ko je končano.

![Plošča Pot kamere in upodabljanje s tremi ključnimi sličicami, gladko interpolacijo, 12 s, 30 fps in 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Ključne sličice {#keyframes}

| Nastavitev | Učinek |
|---|---|
| **Dodaj ključno sličico tukaj** | Doda trenutni položaj kamere, zasuk, naklon in vidno polje kot ključno sličico. |
| **Počisti** | Odstrani vse ključne sličice. |
| Seznam ključnih sličic | Ena vrstica na ključ: njena številka (klik odleti kamero tja, pri tem nastavi tudi vidno polje), položaj, `zasuk° / naklon°` in **×** za odstranitev. |

Ključi so ob vsakem dodajanju ali odstranjevanju **enakomerno** razporejeni vzdolž normalizirane osi poti od 0 do 1; izhodno trajanje nato raztegne celoten premik, zato premik, ki je pravilen, a prehiter, potrebuje samo daljše trajanje. Zasuk se med ključi odvije, tako da se kamera obrne po krajši poti.

Brez ključnih sličic upodobitev drži trenutno kamero pri miru skozi ves posnetek – povsem dober časovni posnetek.

## Nastavitve poti {#path-settings}

| Nastavitev | Privzeto | Obseg (skok) | Pomen |
|---|---|---|---|
| **Interpolacija** (2 ali več ključev) | *Gladko* | *Gladko* / *Ravno* | *Gladko*: kubična Hermitova krivulja skozi ključe s tangentami iz sosednjih ključev, tako da se hitrost ujema čez vsak ključ in ni sunka, kjer se odseki srečajo. *Ravno*: ravne črte med ključi, predvidljivo, z vidnim kotom pri vsakem ključu. Vidno polje je vedno interpolirano linearno. |
| Črta potovanja (2 ali več ključev) | | | `N enot poti - M na sekundo pri tem trajanju` ali opomba, da so vsi ključi na enem mestu. |
| **Predogled vzdolž poti** (1 ali več ključev) | izklopljeno | | Vodi kamero pogleda iz poti in glavo predvajanja premika z njo, kot to naredi upodobitev, da lahko premik presodite pred upodobitvijo. |
| **Položaj na poti** (med predogledom) | 0 % | 0–100 % | Kje na poti je predogled. |
| **Trajanje** | 12 s | 1–120 s (3600) | Dolžina videa. |
| **Hitrost sličic** | 30 fps | 6–60 (240) | |
| **Bitna hitrost** | 16 Mbps | 1–60 Mbps, logaritemsko (400) | Gradienti toplote se pri nizkih bitnih hitrostih slabo razslojijo: za kodek je premalo podrobnosti, za katere bi lahko skril napako. |
| **Meja čakanja na konvergenco** | 240 sličic | 2–600 (10.000) | Najdaljši čas, ki ga ena izhodna sličica lahko čaka, da postane točna. Sličice, ki dosežejo mejo, se vseeno zapišejo in štejejo. |
| Povzetek | | | `N sličic · okno: kumulativno/fiksno/življenjska doba` in, kadar je časovnica v načinu Vse: *(upodobitev preklopi Vse na Predvajaj, da ima glava predvajanja smisel)*. |
| **Upodobi video** / **Prekliči** | | | Začne upodobitev; med delovanjem prikazuje `sličica i / n · čakal w · X MB` in koliko sličic ni bilo točnih. Potrebuje podatke. |

## Nasveti {#tips}

- Velikost izhoda je velikost platna v pikah naprave (razmerje pikslov zaslona, omejeno na 2). Za spremembo spremenite velikost okna brskalnika.
- Kumulativna zgodovina nabira toploto skozi posnetek; okno ali zgodovina življenjske dobe prikaže premikajoč se del časa.
- Položaji ključev so koordinate prikaza: pri [obrnjeni osi sveta](camera.md#invert-world-axis) ključi, narejeni pred preklopom, po preklopu kažejo nekam drugam.

## Za razvijalce {#for-developers}

### Kaj naredi upodobitev {#what-a-render-does}

1. Naredi preizkusni zajem sličice, da izve točno velikost izhoda v pikah naprave.
2. Izbere kodek prek WebCodecs: **VP9** (`vp09.00.10.08`), sicer **VP8**, pri izbrani bitni hitrosti in hitrosti sličic. Brez `VideoEncoder` se ustavi z *This browser has no VideoEncoder - WebCodecs is required to write a video*; brez obeh kodekov z *No supported video codec (tried VP9, VP8)*.
3. Prevzame nastavitve, ki jih upodobitev potrebuje: ustavi predvajanje, **izklopi prilagodljivi proračun**, **vklopi postopno izboljševanje** in proračun sprajtov nastavi na 64 M na sličico (prilagodljivi proračun varuje hitrost sličic, kar je tukaj napačen cilj: vsako počasno konvergirajočo sličico bi bral kot razlog, da s pikami poškropi manj vrstic, kar bi potrebovalo več sličic za konvergenco), časovnico pa preklopi z **Vse** na **Predvajaj**. Nastavitev zgodovine (kumulativno, okno, življenjska doba) ostane taka, kot je: upodobitev naj bo to, kar ste gledali, predvajano in zapisano.
4. Za vsako izhodno sličico *f* od *n*, pri *u* = f / (n - 1):
   - postavi kamero v držo poti pri *u* (če so ključi);
   - premakne glavo predvajanja na isti delež *u* razpona časovnice (izbrana seja v predvajanju škatel);
   - vsili novo oceno, tudi kadar se kamera ni premaknila – podedovanje kopičenja prejšnje sličice bi pustilo sled prejšnjega okna;
   - čaka, sličico za sličico, dokler slika ni točna (vse kandidatne vrstice narisane v eni sličici ali kopičenje končano), do meje čakanja;
   - zajame sestavljeno sličico in jo kodira, s ključno sličico na vsake 2 sekundi izhoda, da je datoteka iskalna.
5. Sličice združi v datoteko WebM ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) s časovnimi žigi, izbranimi iz hitrosti sličic – stenski čas, ki ga je vsaka sličica porabila, ni pomemben.
6. Obnovi proračun, vidno polje, način časovnice, glavo predvajanja in to, ali je predvajalo.
7. Prenese video kot `3dheat-<širina>x<višina>-<sličice>f.webm` in poroča `N sličic pri W×H, X MB - vsaka sličica točna`, ali koliko sličic je doseglo mejo čakanja.

**Prekliči** ustavi po trenutni sličici (*Upodabljanje preklicano.*) in obnovi nastavitve.
