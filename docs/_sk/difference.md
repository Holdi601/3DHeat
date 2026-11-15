---
title: "Rozdiel"
parent: "Režimy tepla"
nav_order: 5
lang: "sk"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: false
---

# Rozdiel

Červená tam, kde bol tím A viac, zelenomodrá tam, kde bol tím B, a nič tam, kde boli rovnako.

**Rozdiel** (klávesa 2) je teplo so znamienkom. Riadky jednej populácie pridávajú teplo; riadky inej ho odpočítavajú. Tam, kde sa obe prekrývajú rovnomerne, je výsledok nula a úplne priehľadný; tam, kde jedna prevláda, sa ukáže v jej farbách - predvolene teplých (priehľadná → červená → žltá → biela) pre stranu **+** a chladných (priehľadná → zelená → modrá → fialová) pre stranu **−**.

![Teplo rozdielu: červená tam, kde bola viac strana +, zelená a modrá tam, kde bola viac strana -](../assets/img/en/difference-split.webp)

## Ako to použiť {#how-to-use-it}

1. Stlačte `2` (alebo vyberte **Rozdiel** na lište režimov).
2. Otvorte v bočnom paneli **Rozdelenie rozdielu**.
3. Vyberte, čím sa rozdeľuje v **Rozdeliť podľa**: zvyčajne *Skupiny*.
4. Jednu skupinu (alebo hodnotu) dajte na **+** a inú na **−**.
5. Čítajte farby: teplá znamená stranu +, chladná stranu −. Panel upozorní, ak jedna strana nemá žiadne riadky (pozri [Správy, ktoré môžete vidieť](#messages-you-may-see)).

*Ktoré dve populácie* je celá otázka, takže rozdelenie môže byť podľa ľubovoľného ponechaného stĺpca, nielen podľa skupín. Riadky, ktoré padnú na **žiadnu** stranu, sa **vynechajú**, nepočítajú sa ako nula: práve to robí, že rozdelenie podľa dvoch z mnohých hodnôt porovnáva presne tie dve, a funguje to s [filtrami](filters.md) - sfiltrujte na jednu mapu a potom to rozdeľte podľa buildu.

Režim potrebuje dve strany: stĺpec skupiny s aspoň dvoma skupinami alebo rozdelenie podľa stĺpca ponechaného na filtrovanie. Pri dátach s menej než dvoma skupinami začne načítanie rozdelením podľa stĺpca - najprv stĺpec *Zdrojový súbor* pri načítaní viacerých súborov, inak prvý kategóriový stĺpec s dvoma hodnotami, inak prvý číselný stĺpec s rozpätím - takže *porovnanie dvoch načítaní* funguje aj na dátach bez akejkoľvek skupiny. Režim je nedostupný iba pri dátach bez oboch; to isté platí, ak rozdelenie zostane s prázdnou jednou stranou.

## Panel Rozdelenie rozdielu {#the-difference-split-panel}

Zobrazí sa v režime Rozdiel, pod panelmi tepla.

**Rozdeliť podľa** ponúka:

| Možnosť | Zobrazené ako | Pravidlo rozdelenia |
|---|---|---|
| Skupiny | *Skupina (N)* (keď existuje stĺpec skupiny) | Každá skupina na +, − alebo na žiadnej, nastavené v [Zozname tímov](teams-list.md) |
| Kategóriový stĺpec | *stĺpec (N hodnôt)* | Hodnoty na +, − alebo na žiadnej |
| Číselný stĺpec | *stĺpec (číselný)* | Rozsah hodnôt pre každú stranu |
| Súbor pôvodu | *Zdrojový súbor - porovnanie dvoch načítaní* (keď bolo načítaných viac súborov) | Súbory na +, − alebo na žiadnej |

Ponúkajú sa len stĺpce ponechané pod *Ponechať na filtrovanie* pri načítaní.

### Porovnávať podiely, nie počty {#compare-shares-not-counts}

**Porovnávať podiely, nie počty** (predvolene vypnuté) váži každú stranu jednou tretinou jej vlastného počtu riadkov, takže strana s päťkrát väčším počtom riadkov nevyhráva len číslami. Farba potom ukazuje, kde je každá strana pomerne častejšia než druhá. Použite to, keď majú strany veľmi rozdielne množstvo dát, napríklad dve relácie rozdielnej dĺžky.

### Správy, ktoré môžete vidieť {#messages-you-may-see}

Panel upozorní, keď obrázok nie je skutočný rozdiel:

| Správa | Význam |
|---|---|
| *N + / M −* (alebo *N + / M − / K nepoužitých*) | Koľko hodnôt je na každej strane (a koľko na žiadnej). |
| Žiadny riadok v okne nie je na strane **+** | Kreslí sa len strana **−**. Posuňte okno časovej osi alebo zmeňte rozdelenie. |
| Žiadny riadok v okne nie je na strane **−** | Kreslí sa len strana **+**. |
| Žiadna hodnota nie je na žiadnej strane | Rozdiel nič nekreslí. Dajte aspoň jednu hodnotu na **+** alebo **−**. |
| *stĺpec* sa týmto spôsobom nedá rozdeliť | Zvolený stĺpec nezodpovedá rozdeleniu. Zvoľte stĺpec znova. |
| Stĺpec rozdelenia sa nezmestil do pamäte GPU pre N z M častí | Tieto riadky sa nekreslia. Zvýšte rozpočet GPU v Výkon → Rozpočty zdrojov alebo načítajte menej riadkov. |

### Podľa skupín {#by-group}

Panel len ukazuje na [Zoznam tímov](teams-list.md), kde má každá skupina tlačidlá **+** a **−**. Pri každom načítaní sa prvá polovica skupín (zaokrúhlene nahor) dá na +, zvyšok na −; **Rozdeliť rovnomerne** v Zozname tímov urobí to isté znova. Skupina na žiadnej strane alebo skrytá svojím políčkom neprispieva.

### Podľa hodnôt kategórie {#by-category-values}

| Časť | Význam |
|---|---|
| `a + / b − / c nepoužitých` | Koľko hodnôt je na každej strane a koľko na žiadnej. |
| **Vymazať** | Dá každú hodnotu na žiadnu stranu. |
| Zoznam hodnôt | Každá hodnota s tlačidlami **+** a **−** (aktívne tlačidlo kliknutím znova zrušíte). Prázdna hodnota sa uvádza ako *(chýba)*. |
| Poznámka o limite | Zobrazí sa len prvých 200 hodnôt: *Zobrazených prvých 200 z N hodnôt. Stĺpec s toľkými hodnotami sa lepšie zúži filtrom, alebo sa rozdelí podľa rozsahu, ak sú jeho hodnoty usporiadané.* |

Pri výbere stĺpca sa jeho prvá hodnota dá na + a druhá na −. Ak žiadna strana nemá hodnotu, rozdelenie sa vráti na skupiny namiesto prázdneho obrázka. *Zdrojový súbor* funguje rovnako, jedna hodnota na súbor - takto sa porovnávajú dva exporty, dva testovacie behy alebo dva buildy.

### Podľa rozsahu {#by-range}

| Časť | Význam |
|---|---|
| Nápoveda | Minimum a maximum stĺpca. |
| **Kladný rozsah (+)**, **od** / **do** | Riadky s hodnotou v tomto rozsahu, vrátane oboch koncov, pridávajú. |
| **Záporný rozsah (−)**, **od** / **do** | Riadky v tomto rozsahu odpočítavajú. |
| **Rozdeliť v strede** | Nastaví + na [minimum, stred] a − na [stred, maximum] - to isté urobí aj výber stĺpca. |

Hodnota v oboch rozsahoch sa počíta ako +. Rozsahy nemusia pokrývať celý stĺpec; hodnoty mimo oboch sa vynechajú. *Prvé dve minúty proti posledným dvom* je rozdelenie podľa rozsahu na stĺpci podobnom času.

## Farby {#colours}

Sekcia **Farby tepla** v tomto režime ukazuje dva editory škál: **Kladná (pripočítavajúce tímy)** a **Záporná (odpočítavajúce tímy)**, každý s vlastným tlačidlom obnovenia (*Obnoviť na priehľadná → červená → žltá → biela*, *Obnoviť na priehľadná → zelená → modrá → fialová*). Zložené teplo berie absolútnu hodnotu čistého tepla cez [bod nasýtenia a odozvu](colour-and-exposure.md) a vyberie zápornú škálu tam, kde je čisté teplo pod nulou. Pozri [Farba a expozícia](colour-and-exposure.md#the-ramp-editor).

Použite lineárnu odozvu hustoty, keď záleží na veľkosti rozdielu: je to jediná odozva, pri ktorej rovnaká farba znamená rovnaký počet.

## Ako to funguje {#how-it-works}

Každý riadok dostane vo vertex shaderi znamienko +1, -1 alebo 0 ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); 0 odmietne riadok skôr, než sa nakreslí akýkoľvek fragment.

- Podľa skupiny pochádza znamienko zo tabuľky 4 096 položiek indexovanej id skupiny riadku (id skupiny je vo štvrtom kanáli texelu pozície riadku).
- Podľa kategórie pochádza znamienko z druhej tabuľky s 4 096 položkami, naplnenej pre každú hodnotu kategórie, a hodnota riadku sa číta z textúry filtra stĺpca; hodnota za koncom tabuľky sa odmietne na oboch backendoch.
- Podľa rozsahu sa hodnota riadku porovnáva s oboma rozsahmi.

Zmena rozdelenia reštartuje akumuláciu.

**Skryté skupiny zostanú skryté pri každom rozdelení.** Pri rozdelení podľa stĺpca tabuľka skupín už neobsahuje znamienka; drží 1 pre zobrazenú skupinu a 0 pre skrytú ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), a obe tabuľky sa dostanú do shaderu spoločne - dva riadky jednej textúry znamienok na WebGL2, dve polovice jedného storage buffera na WebGPU. Riadok sa kreslí len vtedy, keď je jeho skupina zobrazená *a* jeho hodnota stĺpca je na nejakej strane. Skupina odškrtnutá v [Zozname tímov](teams-list.md) alebo vynechaná zameraním strán na karte Zápas teda neprispieva bez ohľadu na to, ako je rozdelený rozdiel.
