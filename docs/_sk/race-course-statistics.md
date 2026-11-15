---
title: "Štatistiky trate"
parent: "Analýza pretekov"
nav_order: 57
lang: "sk"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Štatistiky trate

Načítajte mnoho kôl jednej trate a prehliadač spočíta chyby: ktorá zákruta stojí najviac času,
koľko kôl sa tam pokazilo a prečo. Použite to na nájdenie zákruty, ktorú sa oplatí trénovať.

Vyskúšajte: **Ukážkové kolá** dá tri kolá, čo stačí, aby sa táto časť zobrazila.

![Štatistiky trate s mapou chýb: trať vymaľovaná podľa toho, koľko kôl stratilo čas v každej zákrute, a zoznam zákrut](../assets/img/en/race-course-mistake-map.webp)

Načítajte celý priečinok trate - desiatky kôl, viac áut, viac výkonnostných tried - a každé kolo
sa ohodnotí, potom sa spočíta. Táto stránka popisuje porovnanie podľa triedy, čo sa počíta ako chyba,
sekciu **Štatistiky trate**, mapu chýb, export do heatmapy, trate z viacerých tratí
a výkonnostné limity pri mnohých kolách.

## Voči najlepšiemu vo vlastnej triede {#against-the-best-of-its-own-class}

Kolo sa porovnáva zákruta po zákrute s **najrýchlejším celým kolom svojej vlastnej výkonnostnej
triedy** (referenciou, v triede referencie); samo to kolo s tým, kto zo svojej triedy bol najrýchlejší
v každej zákrute, alebo zo všetkých kôl, ak je v triede samo. Autá sa zoskupujú podľa výkonnostnej
triedy hry (vo Forze D až X; C a S2 sú dve z nich). Brzdný bod auta triedy C voči autu S2
nič nehovorí o jazde. Mapa času, rozdiely v zozname kôl a tabuľka *Zákruta po zákrute* idú
podľa rovnakého porovnania (pozri [s kým sa každé kolo porovnáva](race-corner-analysis.md#who-each-lap-is-compared-with)).

Štatistiky sa stavajú na analýze každého kola, nie vedľa nej.

## Čo sa počíta ako chyba {#what-counts-as-a-mistake}

**Výskyt** je jedna chyba jedného kola v jednej zákrute (úseku). Chyby kola v zákrute sú:

1. **Príčina jazdy**, ktorú analýza tam našla pre jeho stratu - zistenie, ktoré je stratou a pripisuje
   sa vodičovi (nie autu alebo situácii), a stojí **0,05 s** alebo viac oproti jeho porovnávaciemu kolu.
   Jeho cena je strata zákruty.
2. **Každá chyba v ovládaní auta**, ktorú tam urobil a druhé kolo nie (nezdieľaná), a stojí
   **0,03 s** alebo viac - zablokovanie, prešmyk kolies, zadok, ktorý uletí, tlačenie, pretočenie.
   Jej cena je cena samotnej udalosti.
3. **Každý zásah a každá havária**, spoločná alebo nie, nech stojí čokoľvek.

V jednej zákrute ich môže byť viac; každý druh sa počíta **raz na kolo a zákrutu**. Zisky, podiel auta
a pomalší príchod, ktorý bol rozhodnutý v predchádzajúcej zákrute, nie sú chyby.

### Od zistení k chybám {#from-findings-to-mistakes}

| Zistenie | Chyba |
|---|---|
| príliš rýchlo dnu, pomaly von, od brzdenia o viac než pár metrov neskôr ako druhé | Brzdil príliš neskoro |
| brzdil skoro | Brzdil príliš skoro |
| brzdil jemne | Brzdil príliš jemne |
| zablokovanie ako príčina | Zablokoval koleso |
| dojazd bez brzdy | Dojazdil |
| rezerva priľnavosti, pomalšie k vrcholu, brzdil tam, kde druhé len uvoľnilo plyn | Príliš pomaly cez stred |
| príliš tesná línia | Príliš tesná línia |
| tlačený široko | Tlačený široko |
| otočil auto menej / príliš veľa | Otočil auto zle |
| na plyn neskôr, plný plyn neskôr, váhal | Plyn neskoro |
| pomalšie von zo zákruty | Pomalšie von |
| prešmyk kolies | Prešmyk kolies |
| zadok uletel, bokom cez stred | Zadok uletel |
| išiel široko | Išiel široko |
| stratil rýchlosť | Stratil rýchlosť |
| odľahčil (cestou dnu, alebo na rovinke) | Odľahčil |
| takmer zastavenie, pretočenie, zásah alebo havária ako príčina | Pretočil sa / Zasiahol niečo / Havaroval, keď udalosti kola tam hovoria, o čo ide (najprv havária, potom pretočenie, potom zásah); inak Takmer zastavil |
| dlhší let | Preletel príliš ďaleko |

Dva vzory sa počítajú ako príčina nájdená v nich, podľa tej istej tabuľky. *Dal viac, než
výstup vrátil* je chyba príčiny jeho vstupu: skoré brzdenie je *Brzdil príliš skoro*, zablokovanie
*Zablokoval koleso*, dojazd *Dojazdil*, nevyužitá rezerva priľnavosti *Príliš pomaly cez stred*.
*Príliš rýchlo dnu, pomaly von* je *Brzdil príliš neskoro* tam, kde kolo brzdilo neskoršie než
druhé; inak chyba príčiny jeho výstupu - *Plyn neskoro*, *Prešmyk kolies*, *Zadok uletel*,
*Išiel široko*, *Pomalšie von*. Vzor, ktorého príčina je v aute, alebo pomalší príchod, sa nepočíta.

Nepočíta sa: pomalší príchod, štart, každé zistenie o *aute* (ťah, priľnavosť, brzdy, pohon)
a každá zákruta so ziskom alebo rovná zákruta.

### Druhy, v ich poradí {#the-kinds-in-their-order}

Brzdenie: *Brzdil príliš neskoro*, *Brzdil príliš skoro*, *Brzdil príliš jemne*, *Zablokoval
koleso*. Vstup: *Dojazdil*, *Príliš pomaly cez stred*, *Príliš tesná línia*, *Tlačený široko*,
*Otočil auto zle*. Výstup: *Plyn neskoro*, *Pomalšie von*, *Prešmyk kolies*, *Zadok uletel*,
*Išiel široko*, *Stratil rýchlosť*. Rovinka: *Odľahčil*. Udalosti: *Pretočil sa*, *Zasiahol niečo*,
*Havaroval*, *Takmer zastavil*, *Preletel príliš ďaleko*.

## Sekcia Štatistiky trate {#the-course-statistics-section}

Zobrazí sa od **3** kôl, medzi **Kolá** a **Kde sa zlepšiť**.

- **Súhrn**: "40 kôl v 9 autách, 3 triedy: každá zákruta ohodnotená proti najrýchlejšiemu kolu
  svojej triedy." (autá sa počítajú podľa čísla auta, alebo podľa názvu).
- **Čipy tried** (pri viacerých triedach): **Všetko** a jeden čip na triedu,
  každý s počtom kôl, v poradí hry (D, C, B, A, S1, S2, R, X, potom ostatné). Kliknutie na triedu
  zobrazí len jej kolá; **Shift+klik** pridá alebo odoberie jednu. Všetko nižšie - zoznamy, mapa,
  export do heatmapy - sa riadi vybranými triedami.
- **Čo sa najčastejšie pokazí**: každý druh chyby, najprv kolá s ňou najviac (potom najviac
  výskytov, potom najvyššia cena), najviac 8 (**Všetky N druhov** ukáže zvyšok, **Menej** ich zase
  skryje). Každý riadok: jeho názov, "N z M kôl", pruh tohto podielu a "K-krát · asi X s · najviac v T3 (5), T7 (4), T1 (2)" -
  ako často sa urobila (kolo podľa zákruty), čo stála dokopy, a tri zákruty, kde ju najviac kôl urobilo.
  **Kliknutie na riadok** ju ukáže na mape chýb (a mapu zapne); ďalšie kliknutie ukáže všetky chyby.
- **Zákruta po zákrute** (alebo *Zákruta po zákrute - <chyba>* s jednou vybranou): pri každom úseku
  "N z M stratilo čas · X s" - kolá, ktoré prešli celú zákrutu, tie, ktoré tam stratili
  **0,05 s** alebo viac oproti najlepšiemu v triede, a všetok čas, ktorý stratili. Zbalené uvádza
  svoje tri najčastejšie chyby s počtom kôl. **Kliknutie na zákrutu** ju otvorí, zarámuje kamerou
  a prepne na mapu chýb: pre každú chybu (alebo len pre vybranú) riadok ako "12 z 40 kôl tu brzdilo
  príliš skoro. V 9 rôznych autách - asi 0,21 s každé." a kolá, ktoré ju urobili, **najhoršie
  prvé**, každé s cenou - najviac 8, "+N ďalších" pre zvyšok. **Kliknutie na kolo** ho zvýrazní
  a prehrá tú chybu (zarovnanú 40 m pred ňou).
- **Zobraziť v heatmape**: pozri nižšie. "Vytváram heatmapu…", kým beží; vypnuté, keď nie sú žiadne chyby.

## Mapa chýb {#the-mistake-map}

**Pohľad → Mapa chýb** vymaľuje pozdĺž referenčnej dráhy, koľko kôl (z vybraných tried) urobilo
chybu v každom metri - každého druhu, alebo tú jednu vybranú v štatistike. Každé kolo sa počíta raz
na meter; rozsah každého výskytu (kde bola jeho príčina alebo udalosť) sa rozšíri o 6 m na každú
stranu, aby sa krátky dal vidieť. Širšie a jasnejšie tam, kde urobilo kolá viac: šírka
`3 + 10 · (kolá tu / najviac kôl kdekoľvek)` metrov, farba od matnej hnedej po jasnú oranžovú;
sivý 2 m pás, kde nikto. Legenda: *málo kôl ↔ najviac kôl*.

Keď sú **Popisy** zapnuté, vrchol každej zákruty nesie jej najčastejšiu chybu:
"T3 · 12/40 skoré brzdenie" (kolá, ktoré ju urobili / kolá, ktoré prešli zákrutu),
"T3 · 12/40" pri jednom vybranom druhu, "T3 · čisté" pri žiadnom. Nad popisom sa po prejdení myšou
zobrazia straty zákruty a jej päť najčastejších chýb; kliknutím sa zákruta v štatistike otvorí alebo zatvorí.

## Zobraziť v heatmape {#show-in-the-heatmap}

**Zobraziť v heatmape** odovzdá to isté karte heatmapy ako dataset s názvom
"Chyby na <trať>" (alebo "Chyby na trati"), takže celá sada nástrojov heatmapy - režimy,
filtre, časová os, rezy - funguje na tom, kde kolá chybujú.

Je to CSV postavené v pamäti (`mistakeTable`), jeden riadok na každý bod mriežky (každé
2 m) každého výskytu, na **vlastnej pozícii kola** v tom mieste:

| Stĺpec | Obsah |
|---|---|
| `x`, `y`, `z` | pozícia kola v tom metri (herné súradnice) |
| `elapsed` | čas kola v tom mieste, s |
| `lap` | označenie kola |
| `car` | názov auta (alebo "car 1234") |
| `mistake` | názov chyby v aktuálnom jazyku |
| `car_class` | trieda, `-` keď žiadna |
| `corner` | označenie zákruty, `T3` |
| `cost` | cena výskytu, s |

Načíta sa cez vlastný načítavač heatmapy s nápovedami mapovania: Y smerom nahor, bez
prevrátenia osí, mierka 1; čas `elapsed` v sekundách; **person** = `car`,
**group** = `mistake`, **session** = `lap`; bez smeru pohľadu; `car_class`,
`corner` a `cost` zostanú ako filtračné stĺpce. Karta potom prepne na
**Heatmapa** a zarámuje dáta. Exportujú sa len triedy vybrané v štatistike.

## Trate z viacerých tratí {#courses-from-several-tracks}

Kolá sa analyzujú **jedna trať naraz**. Priečinok s kolami z viacerých tratí - celá knižnica kôl -
ponúkne každú trať na samostatné načítanie (s počtom kôl, najprv najviac); kolá behov, ktoré
sa nedokončili (`unfinished/` v FH Companion), patria k svojej trati a sú označené ako *čiastočné*.
Kolá z viacerých pomenovaných tratí vybraných ako súbory sa ponúknu rovnako; kolá bez názvu trate
patria k tej, ktorá je vybratá. Načítanie kôl inej pomenovanej trate, než tých, ktoré sú načítané,
ich nahradí. Podrobnosti: [Načítanie kôl](race-loading-laps.md#folders-and-courses).

## Výkon pri mnohých kolách {#performance-with-many-laps}

Desiatky kôl sa analyzujú za sekundu alebo dve (vždy všetky). To, čo sa kreslí, je obmedzené,
aby pohľad zostal na plynulej snímkovej frekvencii:

| Limit | Hodnota | Účinok |
|---|---|---|
| kreslené kolá v predvolenom nastavení | 8 (`SHOW_ALL_UP_TO`) | nad 8 načítaných kôl sú novo pridané kolá skryté, pokiaľ nie sú referenciou, zameraným kolom alebo najlepším v svojej triede. **Zobraziť všetky** nakreslí každé kolo; **Len skúmané** sa vráti späť. Zameranie kola ho odkryje a aj najlepšie v jeho triede |
| obyčajné autá a tenké čiary | nad 10 viditeľných (`PLAIN_PAST`) | kolá iné ako zameraté, prenasledované auto a referencia: bod čiary každých 6 m (namiesto 1,5 m), autá kreslené obyčajne |
| zobrazené kolá v grafe | 8 (`CHART_LAPS`) | najprv zameranie, jeho najlepšie v triede a referencia; "+N ďalších nakreslených, nie v grafe" |
| karty HUD | 6 | prvých šesť viditeľných kôl |
| štatistiky | od 3 kôl | sekcia je pod tým skrytá |
| zoznam zistení | 12 vodič, 8 auto/kontext, 10 ziskov | na zamerané kolo |
| zobrazené dvojice áut | 3 | nad 3 dvojice jedna dvojica s výberom |

Výskyty chýb sa vypočítajú raz na analýzu a uložia sa do pamäte; hustota mapy chýb sa ukladá
podľa výberu triedy a chyby.

## Pre vývojárov {#for-developers}

Kód: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` v [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
