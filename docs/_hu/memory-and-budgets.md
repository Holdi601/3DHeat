---
title: "Memória és keretek"
parent: "Adatok betöltése"
nav_order: 6
lang: "hu"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Memória, keretek és illeszkedés-ellenőrzés

A számítógéped memóriája véges. A 3DHeat összeadja, mire van szükséged a fájljaidnak, és a **Betöltés** előtt megmondja, hogy beleférnek-e.

![A Memóriabecslés „nem fér el” állásban, a Betöltés minden [N]. sort előre kitöltve, a Betöltés gomb szövege: „Túl nagy – csökkentsd vagy ritkítsd”](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Túl nagy ehhez a számítógéphez? A 3DHeat ehelyett azt javasolja, hogy minden N. sort töltsön be.*

Egy böngészőfül, amely betöltés közben kifogy a memóriából, összeomlik, és percekig tartó munkát veszít el. Egy GPU, amelytől több kell, mint amennyi van, vagy elveszíti a kontextusát, vagy csigalassúvá lassul. Ezért a betöltés indulása előtt a Forrás panel megmondja, mennyi memória kell, összeveti a számítógéphez érzékelt keretekkel, és ha nem fér bele, megtagadja, de megmutatja a kiutat is. A modell itt van: [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## A memóriabecslés {#the-memory-estimate}

A **Betöltés** gomb fölött látszik, miután a sorokat megszámolták.

| Sor | Jelentés |
|---|---|
| **Memóriabecslés** – *fér* / *szoros* / *nem fér el* | Az ítélet: zölddel, sárgával vagy pirossal. |
| `N rows · B B/row` | A betöltendő sorok (a ritkítás után) és a soronkénti állandó bájtok. |
| `RAM X resident, Y peak while loading` | A betöltés után tartott memória, és a csúcs a betöltés alatt. |
| `GPU Z · est. load T` | A sorokhoz szükséges GPU-memória, és a becsült időtartam másodpercenként 1,2 millió soros sebességgel. |
| GPU neve | A renderelő neve, ha a driver megadja. |
| Üzenetek | Miért nem fér bele vagy szoros, és mit tegyél. |
| **Minden [N]. sor betöltése** | A ritkítási lépésköz (lent). |
| `Budget: X RAM, Y GPU. Adjust under Performance → Resource budgets.` | A keretek, amelyeket az ellenőrzés használt. Állítsd a Teljesítmény → Erőforráskeretek alatt. |

### Soronkénti bájtok {#bytes-per-row}

| Oszlop | Állandó (RAM) | Megjegyzések |
|---|---|---|
| Position | 12 | Három 32 bites lebegőpontos szám, mindig (egy lapos tengely is tömb) |
| Time | 4 | Ha le van képezve |
| Lifetime | 4 | Ha az idő és a személy le van képezve |
| Person | 4 | Ha le van képezve |
| Group | 2 | Ha le van képezve |
| Session | 4 | Ha le van képezve |
| `Source file` | 4 | Ha egynél több fájl van betöltve |
| Minden szűrőoszlop | 4 | Minden bejelölt *Megtartás szűréshez* oszlopnál |

A **csúcs** hozzáadja azt, amire a betöltésnek csak átmenetileg van szüksége: 8 bájt a 64 bites időből egyesítéskor, 12 bájt a rendezési kulcsoknak és indexeknek, 4 bájt a permutáció ideiglenes tárolójának (mindhárom, ha az idő le van képezve), és 4 bájt, amíg a csoportoszlop még 32 bites. Az összeget **2,0**-val szorozza. Ezt a tényezőt mérték: egy valódi, több fájlos betöltés a felsorolt tömbök 1,9-szeresénél tetőzött. Ez a Parquet-dekóder munkakészletéből, az oszlopokat hosszukra vágó másolatokból és a felszabadított, de még vissza nem adott memóriából jött. Felfelé kerekítették, mert egy alul-becslés összeomlott fület jelent, egy felül-becslés csak egy felesleges ritkítást.

A **GPU**-n soronként 8 bájtba kerül (a pozíció és a csoport, mindkettő 16 bites), plusz 4 bájt (az idő és az élettartam, mindkettő 16 bites), ha az idő és a személy is le van képezve. Lásd: [GPU-memória-rezidencia](gpu-memory.md). A szűrőtextúrák (aktív szűrőnként soronként 4 bájt) és a vonal-hőtérkép szegmenskezdetei (soronként 8 bájt, amíg a Vonalak mód be van kapcsolva) nem részei ennek a becslésnek.

## Az illeszkedés-ellenőrzés {#the-fit-check}

Három korlát hasonlítható össze ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- a csúcs RAM a **RAM-kerethez**,
- a GPU-bájtok a **GPU-kerethez**,
- a sorszám a **rendezési plafonhoz** (400 000 000 sor), ha az idő-oszlop le van képezve.

A három arány közül a legrosszabb dönt: 70%-ig *fér*, 100%-ig *szoros* (be kellene töltődnie, de lassú lesz), e fölött *nem fér el*. Ha nem fér bele, a panel megnevezi a legszorítóbb korlátot, és javasolja:

- minden *N*-edik sor betöltését, *N* = ⌈sorok / a beférő sorok⌉, a ritkítási mezőben előre kitöltve;
- szűrőoszlopok elhagyását, az idő-oszlop leképezésének megszüntetését (ez megszünteti a rendezést és annak plafonját, az idővonal árán), vagy a keret emelését.

Ha maga a keret nem a hardver ténye (a böngésző megszabta a RAM-értéket, az alapértéket az éppen szabad memória szorította le, vagy a GPU-érték tipp), az üzenet ezt kimondja. Így nem nyúlsz olyan lépésköz után, amelyre nincs szükséged.

### Ritkítás {#decimation}

A **Minden [N]. sor betöltése** fájlonként minden *N*-edik sort tart meg. A hőtérkép átlag, ezért minden *N*-edik sor ugyanazt az eloszlást adja nagyobb zajjal. Ez ugyanaz a kompromisszum, amelyet a renderelő már minden képkockán megköt. A doboz 1-gyel indul (*sor (mind)*). Ha a kiválasztás nem fér bele, a javasolt lépésközzel töltődik elő, kivéve, ha beleírtál valamit. A Betöltés gomb ekkor *N fájl betöltése (K-ból 1)* feliratot mutat, az adathalmaz neve pedig rögzíti: `every Kth row`.

### A rendezési plafon {#the-sort-ceiling}

A renderelőnek sorokra van szüksége növekvő idősorrendben, ezért a leképezett idő-oszlop minden sor rendezését jelenti, 32 bites kulcsokon futó radix-rendezéssel ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). **400 millió** sor fölött ezt nem próbálják meg egy fülön, hanem megtagadják. Ezt a betöltés előtt ellenőrzik, így a korláton felüli kiválasztást lépésköz-javaslattal utasítják el, ahelyett hogy az egészet beolvasnák, és az utolsó lépésnél buknának el. A korlát közelében (*szoros*) a panel figyelmeztet, hogy a rendezés hosszú menet, amelynek nincs saját haladásjelzője. Idő-oszlop nélkül nincs rendezés, és nincs plafon sem.

## Erőforráskeretek {#resource-budgets}

**Teljesítmény → Erőforráskeretek** (összecsukható sor a Teljesítmény panel alján, amely így szól: `Resource budgets - RAM, GPU, cores`). A kereteket érzékelik, az érzékelt érték az alapérték, a csúszkák pedig nem mennek a **plafonnál** magasabbra. Ez a plafon az érzékelt érték, kivéve ha tudjuk, hogy az érzékelés nem mérés.

| Vezérlő | Tartomány | Jelentés |
|---|---|---|
| **RAM a soradatokhoz** | 256 MiB a RAM-plafonig, logaritmikus | A RAM-keret az illeszkedés-ellenőrzéshez. Az érzékelt alapérték fölött *(az érzékeltnél nagyobb)*, a plafonnál *(max)* jelölést kap. |
| **GPU a soradatokhoz** | 128 MiB a GPU-plafonig, logaritmikus | A GPU-keret az illeszkedés-ellenőrzéshez és a sorok feltöltéséhez. Az érzékelt alapérték fölött *(az érzékeltnél nagyobb)*, a plafonnál *(max)* jelölést kap. |
| **Feldolgozó szálak** | 1-től a logikai magok számáig | Hány fájl dolgozódik fel egyszerre a betöltésben, mindegyik a saját munkásában. Alapérték: magok - 2 (négy vagy kevesebb magnál magok - 1). Lásd: [Feldolgozó szálak](#parser-threads) (a Fejlesztőknek részben). |
| Források sora | | Melyik forrásból jött minden érték (`RAM: …. GPU: …. CPU: ….`). |
| **Újraérzékelés** | | Friss memóriaolvasást kér a fejlesztői szervertől, és újraszámol minden keretet. |
| GPU neve | | Az adapter rövid neve; a teljes renderelő-szöveg a súgóban. |

### A GPU-keret emelése {#raising-the-gpu-budget}

Az érzékelt érték fölötti GPU-keret úgy érvényesül, ahogy beállítottad. Az illeszkedés-ellenőrzés és a feltöltés ugyanazt az értéket veszi egy függvényből ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), amely csak a csúszka végpontjában, a GPU-plafonnál vág le. Így a betöltés, amelyen az ellenőrzés átmegy, teljes egészében feltöltődik. Az érzékelt érték fölött a csúszka *(az érzékeltnél nagyobb)* jelzést mutat. Az érték ekkor a kártya megítélésed, nem mérés, és a kártyánál magasabbra állítva elveszett kontextus vagy csigalassúság a kockázat.

## Hatalmas adathalmazok: az emelők {#huge-datasets-the-levers}

A legolcsóbbtól a legdrasztikusabbig:

1. **Kevesebb szűrőoszlop.** Mindegyik soronként 4 bájt és egy dekódolási menet.
2. **Lépésköz.** Minden *N*-edik sor.
3. **Nincs idő-oszlop.** Nincs rendezés, nincs rendezési plafon, nincs soronként 4–8 bájt idő és élettartam, és nincs idővonal.
4. **Emeld a kereteket**, ha tudod, hogy a memória megvan.

Megjelenítéskor a nagy adathalmazokat mintavétellel és fokozatos akkumulálással kezelik, nem az adatok csökkentésével. Lásd: [Mintavétel és keretek](sampling-and-budgets.md).

## Fejlesztőknek {#for-developers}

### Feldolgozó szálak {#parser-threads}

Több fájl betöltése közben legfeljebb **Feldolgozó szálak** számú fájl dolgozódik fel egyszerre, mindegyik egy feldolgozó munkásban, amelyet a betöltésért felelős munkás indít ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). 1-nél, vagy egyetlen fájlnál a fájlok egymás után dolgozódnak fel magában a betöltő munkásban.

Egyszerre több futtatás sem lazítja az illeszkedés-ellenőrzést:

- **Az építőt előbb számolják.** Az egyesített oszlopok az egész kiválasztásra előre le vannak foglalva, mielőtt az első fájl beolvasódik. Így a folyamatban lévő fájlok csak azt kapják, amit a RAM-keret a mellettük hagy (`parseHeadroom`): pozíció, 64 bites idő, nézési szögek, személy, 32 bites csoport, munkamenet, szűrőoszlopok és `Source file`, soronként a betöltendő sorokra. Ezt 2,6-tal szorozzák, ha a sorszám CSV-becslés, mert egy oszlop nagyobbra nő.
- **Minden fájl a költségét lefoglalja, mielőtt elindul** (`fileParseBytes`): a sorai (a Parquet láblécéből; CSV esetén a becslés méret szerinti része) szorozva ugyanezekkel az oszlopokkal, szorozva **8**-cal. Ez maga a blokk, a mellette lévő másolat, amíg a pozíció nélküli sorok kikerülnek, és a dekóder munkakészlete, amely a szöveges oszlopoknál jóval nagyobb az azonosítóiknál. Egy lépésköz ezt nem csökkenti, mert a fájlokat teljes egészükben olvassák, és utána ritkítják. A 8 mérés alapján beállított keret: 3-nál vagy 5-nél harminc feldolgozó szál 86 millió soron, személy- és munkamenetnevekkel átlépte a fül határát; 8-nál nem.
- **Egy másik fájl csak akkor indul, ha a foglalása belefér** abba, ami megmaradt. Egy befejezett, de még egyesítésre váró fájl megtartja a foglalását, amíg össze nem fésülik.
- **Egy fájl mindig fut.** Ha semmi sincs lefoglalva, a következő fájl akkor is elindul, bármibe kerül. Ez az egyszerre-egy-fájl betöltés, amelyet az illeszkedés-ellenőrzés beengedett, így egy szűk keret erre esik vissza, ahelyett hogy elutasítaná.

A *csúcs betöltés közben* érték az egyszerre-egy-fájl betöltés csúcsa, amely a rendezésnél jön létre, miután minden fájl beolvasódott. Egymás mellett feldolgozott fájlok ennél magasabbra mehetnek olvasás közben. A foglalások a RAM-kereten belül tartják őket, amennyire a fenti becslések pontosak.

Az összefésülés sorrendje a kiválasztás sorrendje, bármilyen sorrendben fejeződnek is be a fájlok. Így a személy-, csoport- és munkamenetszámozás, a sorok és a `Source file` értékek megegyeznek az egyesével betöltéssel. Egy be nem olvasható fájl kimarad, és ugyanúgy kerül felsorolásra, mint eddig. Ha egy feldolgozó munkás meghal, az az egész betöltést leállítja, ahogy a betöltő munkás halála mindig is tette. Minden feldolgozó munkás leáll a betöltés végén, bárhogy ér véget. Ha feldolgozó munkásokat egyáltalán nem lehet indítani, a fájlokat a betöltő munkásban dolgozzák fel.

### Hogyan érzékelik a számokat {#how-the-figures-are-detected}

A [`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) indul az indításkor, újra, amint a renderelő létezik, és az **Újraérzékelés** gombnál.

**RAM, a fejlesztői szerverrel.** A `start.bat` és az `npm run dev` olyan folyamatból szolgálja ki az oldalt, amely olvasni tudja a gép memóriáját, a `/__host/memory` útvonalon (1,5 másodpercen belül válaszol, különben figyelmen kívül hagyják). Az alapérték a kisebbik a telepített RAM 60%-a és a jelenleg szabad RAM 80%-a közül. A plafon a telepített 60%-a. Ha a szabad memória szorítja le az alapértéket, a panel ezt kimondja, és azt javasolja, hogy zárj be programokat, és nyomd meg az **Újraérzékelés** gombot.

**RAM, nélküle** (statikus telepítésnél): egyetlen böngészős API sem jelzi a szabad memóriát. A `navigator.deviceMemory` a Chrome és az Edge szerint kettő hatványára lefelé kerekítve, 8 GiB-ra korlátozva. Az alapérték a `deviceMemory` 60%-a, tovább korlátozva a fül szabad JS-kupacának 4-szeresével, ahol a böngésző megadja. Ha nincs megadva semmi, 4 GiB. Ha a `deviceMemory` pontosan 8 (a korlát), az érték *korlátozott* jelzést kap, a plafon az alapérték 4-szerese, és megjegyzés mondja, hogy az alapérték fölött a szám a te állításod, nem mérés.

**Mindkét esetben** az alapérték és a plafon **12 GiB**-ra van korlátozva. Ez a legtöbb typed array memória, amelyet egy Chrome-fül tart, bármilyen gépen (egy oldal körülbelül 15,75 GB-ig jutott, majd elbukott; a 12 hagy helyet mindennek másnak). Soha nem megy 256 MiB alá.

**GPU-memória.** Egyetlen webes API sem jelenti.

- A fejlesztői szerverrel a kártya memóriáját az `nvidia-smi` olvassa (a legnagyobb adapter), vagy Windowson a kijelző-adapter `HardwareInformation.qwMemorySize` registry-értéke. Az alapérték a 70%-a, a plafon 90%.
- Olvasás nélkül következtetik: alapból 2 GiB. 4 GiB, ha a legnagyobb textúra 16 384 px vagy nagyobb (különálló kártya), 1 GiB, ha kisebb. Vagy 8 × a WebGPU `maxBufferSize`-a, ha az nagyobb. A plafon ekkor a következtetett érték 8-szorosa, mert a következtetés egy integrált és egy különálló egységet tud megkülönböztetni, finomabbat nem. A panel kimondja, hogy az érték következtetett.
- Soha nem 128 MiB alatt.

**CPU.** `navigator.hardwareConcurrency` (4, ha nincs megadva).
