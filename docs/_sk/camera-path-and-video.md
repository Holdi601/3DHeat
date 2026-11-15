---
title: "Dráha kamery a video"
nav_order: 15
lang: "sk"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Dráha kamery a video

Natočte film o svojich dátach: kameru umiestnite na niekoľko miest, prehliadač medzi nimi preletí a video uloží. Každá snímka je veľmi čistá, bez zrnenia. Kamera a prehrávacia hlava sa hýbu spolu, takže tým istým panelom urobíte aj timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Vytvorte prelet {#make-a-flythrough}

1. Preletíte na miesto, kde film začína, a v **Dráha kamery a renderovanie** stlačte **Pridať kľúčovú snímku sem**.
2. Preletíte na ďalšie miesto a stlačte to znova. Zopakujte pre každú zastávku.
3. Zaškrtnite **Náhľad pozdĺž dráhy** a ťahajte **Poloha na dráhe**, aby ste pohyb skontrolovali.
4. Nastavte **Dĺžka** (ako dlhé video bude). Pohyb, ktorý je správny, ale príliš rýchly, potrebuje len dlhšiu dĺžku.
5. Stlačte **Renderovať video**. Počkajte na riadok priebehu; súbor sa stiahne, keď skončí.

![Panel Dráha kamery a renderovanie s tromi kľúčovými snímkami, plynulou interpoláciou, 12 s, 30 fps a 16 Mb/s](../assets/img/en/camera-path-panel.webp)

## Kľúčové snímky {#keyframes}

| Ovládací prvok | Účinok |
|---|---|
| **Pridať kľúčovú snímku sem** | Pripojí aktuálnu polohu kamery, odchýlku, sklon a zorný uhol ako kľúčovú snímku. |
| **Vymazať** | Odstráni všetky kľúčové snímky. |
| Zoznam kľúčových snímok | Jeden riadok na kľúč: jeho číslo (kliknutím preletíte kamerou tam, nastaví aj zorný uhol), poloha, `odchýlka° / sklon°`, a **×** na odstránenie. |

Kľúče sa pri každom pridaní alebo odobratí **rovnomerne** rozložia pozdĺž normalizovanej osi dráhy od 0 do 1; výstupná dĺžka potom natiahne celý pohyb, takže záber, ktorý je správny, ale príliš rýchly, potrebuje len dlhšiu dĺžku. Odchýlka sa medzi kľúčmi rozvinie, takže kamera sa otáča kratším smerom.

Bez kľúčových snímok render drží aktuálnu kameru nehybne počas celého klipu – úplne dobrý timelapse.

## Nastavenia dráhy {#path-settings}

| Ovládací prvok | Predvolené | Rozsah (posuv) | Význam |
|---|---|---|---|
| **Interpolácia** (2+ kľúče) | *Hladká* | *Hladká* / *Priama* | *Hladká*: kubická Hermitova krivka cez kľúče s dotyčnicami z susedných kľúčov, takže rýchlosť sa na každom kľúči zhoduje a nevzniká trhnutie tam, kde sa úseky stretávajú. *Priama*: priamky medzi kľúčmi, predvídateľné, s viditeľným rohom pri každom kľúči. Zorný uhol sa vždy interpoluje lineárne. |
| Čiara cesty (2+ kľúče) | | | `N jednotiek cesty – M za sekundu pri tejto dĺžke`, alebo poznámka, že všetky kľúče sú na jednom mieste. |
| **Náhľad pozdĺž dráhy** (1+ kľúč) | vypnuté | | Ovláda kameru výrezu podľa dráhy a posúva prehrávaciu hlavu spolu s ňou, ako to robí render, takže pohyb sa dá posúdiť pred renderom. |
| **Poloha na dráhe** (počas náhľadu) | 0 % | 0-100 % | Kde na dráhe sa robí náhľad. |
| **Dĺžka** | 12 s | 1-120 s (3600) | Dĺžka videa. |
| **Snímková frekvencia** | 30 fps | 6-60 (240) | |
| **Dátový tok** | 16 Mb/s | 1-60 Mb/s, logaritmicky (400) | Tepelné prechody sa pri nízkom dátovom toku zle pásujú: kodek nemá dosť detailu, za ktorý by mohol schovať chybu. |
| **Limit čakania na konvergenciu** | 240 snímok | 2-600 (10 000) | Najdlhšie, čo môže jedna výstupná snímka čakať, kým bude presná. Snímky, ktoré ho dosiahnu, sa aj tak zapíšu a spočítajú sa. |
| Súhrn | | | `N snímok · okno: kumulatívne/pevné/životnosť`, a keď je časová os v režime Všetko: *(render prepne Všetko na Prehrať, aby prehrávacia hlava niečo znamenala)*. |
| **Renderovať video** / **Zrušiť** | | | Spustí render; počas behu ukazuje `snímka i / n · čakanie w · X MB` a koľko snímok nebolo presných. Potrebuje dataset. |

## Tipy {#tips}

- Veľkosť výstupu je veľkosť plátna v pixeloch zariadenia (pomer pixelov displeja, najviac 2). Zmeňte veľkosť okna prehliadača, aby sa zmenila.
- Kumulatívna história nabuduje teplo počas klipu; história okna alebo životnosti ukazuje pohyblivý rez času.
- Polohy kľúčových snímok sú súradnice zobrazenia: pri [obrátenej osi sveta](camera.md#invert-world-axis) kľúče vytvorené pred prepnutím po prepnutí ukazujú inam.

## Pre vývojárov {#for-developers}

### Čo robí render {#what-a-render-does}

1. Urobí skúšobné zachytenie snímky, aby zistil presnú veľkosť výstupu v pixeloch zariadenia.
2. Vyberie kodek cez WebCodecs: **VP9** (`vp09.00.10.08`), inak **VP8**, pri zvolenom dátovom toku a snímkovej frekvencii. Bez `VideoEncoder` sa zastaví s hláškou *This browser has no VideoEncoder - WebCodecs is required to write a video*; bez oboch kodekov *No supported video codec (tried VP9, VP8)*.
3. Prevezme nastavenia, ktoré render potrebuje: pozastaví prehrávanie, vypne **adaptívny rozpočet**, zapne **postupné spresňovanie** a rozpočet spritov nastaví na 64 M na snímku (adaptívny rozpočet chráni snímkovú frekvenciu, čo je tu zlý cieľ: každú pomalú konvergujúcu snímku by čítal ako dôvod kresliť menej riadkov, čo potrebuje viac snímok na zbehnutie), a prepne časovú os z **Všetko** na **Prehrať**. Nastavenie histórie (kumulatívne, okno, životnosť) zostáva, ako je: render má byť to, na čo ste sa pozerali, prehraté a zapísané.
4. Pre každú výstupnú snímku *f* z *n*, pri *u* = f / (n - 1):
   - umiestni kameru do pozy dráhy pri *u* (ak sú kľúče);
   - posunie prehrávaciu hlavu na rovnaký zlomok *u* rozsahu časovej osi (rozsah vybranej relácie pri prehrávaní kociek);
   - vynúti nový odhad, aj keď sa kamera nehýbala – zdedenie nahromadenia predchádzajúcej snímky by zanechalo duch predchádzajúceho okna;
   - čaká, snímku po snímke, kým obraz nebude presný (všetky kandidátske riadky nakreslené v jednej snímke, alebo nahromadenie dokončené), až do limitu čakania;
   - zachytí zloženú snímku a zakóduje ju, s kľúčovou snímkou každé 2 sekundy výstupu, aby bol súbor pretáčateľný.
5. Zloží snímky do súboru WebM ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) s časovými značkami zvolenými podľa snímkovej frekvencie – nástenný čas, ktorý každá snímka trvala, nie je podstatný.
6. Obnoví rozpočet, zorný uhol, režim časovej osi, prehrávaciu hlavu a to, či sa prehrávalo.
7. Stiahne video ako `3dheat-<šírka>x<výška>-<snímky>f.webm` a nahlási `N snímok pri W×H, X MB – každá snímka presná`, alebo koľko ich dosiahlo limit čakania.

**Zrušiť** zastaví render po aktuálnej snímke (*Render zrušený.*) a obnoví nastavenia.
