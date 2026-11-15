---
title: "Udalosti ovládania auta"
parent: "Analýza pretekov"
nav_order: 54
lang: "sk"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: true
---

# Udalosti ovládania auta

Prehliadač sleduje, ako sa jazdilo každé kolo, a označí miesta, kde vodič nechal auto šmyknúť, otočiť sa, do niečoho narazilo alebo zbytočne stratilo priľnavosť. To je užitočné, lebo chyba, ktorá stála čas, je to najrýchlejšie na opravu.

![Sekcia Ovládanie auta: ako často každé kolo zablokovalo koleso, otočilo sa alebo tlačilo do šírky, a zoznam chýb s jednou otvorenou](../assets/img/en/race-control-table.webp)

## Jednoducho {#in-plain-words}

- **Zablokovanie**: brzdíte tak silno, že koleso prestane sa otáčať a šmýka sa. Auto zastavuje horšie a nedá sa riadiť.
- **Pretáčanie kolies**: šliapete na plyn tak silno, že hnacie kolesá sa točia rýchlejšie, než sa auto hýbe. Strácate ťah.
- **Pretáčavosť**: zadok auta vybehne do strany. Ak sa auto otočí úplne dokola, je to **otočka**.
- **Nedotáčavosť**: predok auta vybehne do strany („tlačí“); ďalšie točenie volantom nepomáha.
- **Zásah** a **havária**: auto sa čohosi dotklo (zásah je úder alebo zadretie, havária je tvrdý náraz).
- **ABS**, **TC**: pomocníci auta, ktorí zasahujú proti zablokovaniu a pretáčaniu kolies. Nie sú to chyby.

## Sekcia Ovládanie auta (čo vidíte) {#the-car-control-section-what-you-see}

Pri zameranom kole, s tým, čo kolá obsahujú - bez šmyku pneumatík a bez uhla driftu zobrazí, čo sa ešte dá nájsť, namiesto ničoho (nižšie).

**Tabuľka**: jeden riadok na každý druh, ktorý ukazuje ktorékoľvek z kôl - Zablokované kolesá, Pretáčanie kolies, Zadok vybieha (pretáčavosť a otočky), Tlačí do šírky, Havárie, Zásahy, Pôsobí ABS, Pôsobí trakčná kontrola, Ručná brzda, Vo vzduchu - každá bunka „počet · sekundy“, pre zamerané kolo a kolo, s ktorým sa porovnáva; a *Najväčší uhol driftu*, keď je uhol driftu dostupný (najväčší na zemi).

**Zoznam**: jeho nezdieľané chyby, ktoré stoja aspoň 0,02 s, od najdrahšej, najviac 12, každá s názvom a cenou (a odznakom svojho druhu). Kliknutím na jednu si prečítate jej tip, zarovnáte autá 40 m pred ňou a prehráte ju. **Čo obe kolá tam urobili** pridá každú chybu vrátane zdieľaných (odznak „obaja to urobili“, cena „—“ pod 0,01 s). Keď žiadna nie je: „Nič, čo X urobil s pneumatikami, ho nestálo čas, ktorý Y nestratil tiež.“

**Nápoveda pod ňou** povie, čím detekcia mohla vidieť - „Z šmyku každého kolesa a jeho uhla šmyku a uhla driftu auta.“ (alebo šmyk a uhol šmyku, šmyk a uhol driftu, len šmyk, alebo „Len z uhla driftu auta - tieto kolá nemajú šmyk pneumatík.“) - podložie, pre ktoré sa merali limity (asfalt, nespevnený, zmiešané: nad 80 % vzoriek nespevnených je nespevnený, pod 20 % asfalt), ku ktorému kolu sa udalosti kladú, a ako sa počíta cena.

Pri **žiadnom šmyku pneumatík a žiadnom uhle driftu** (súbor kola FH Companion bez svojej telemetrie) sa tabuľka a zoznam zobrazia tak či tak a nápoveda povie, čo sa z toho, čo kolá obsahujú, ešte našlo: „Tieto kolá nemajú šmyk pneumatík ani uhol driftu, takže sa nedajú rozlíšiť zablokovania a pretáčanie kolies. Stále sa nachádzajú: tlačenia, z riadenia voči dráhe; zásahy a havárie, z rýchlosti a zrýchlenia.“ - šmyky z rýchlosti otáčania sa tiež pomenujú, kde ich kolá majú, tlačenia len tam, kde majú riadenie. Veta o limitoch šmyku a driftu sa vynechá a druhá nápoveda hovorí: „Pre Forza Horizon vyberte aj súbor `.tele.gz` vedľa každého kola FH Companion: je to úplná telemetria, šmyk každého kolesa 64-krát za sekundu.“

**Celková** cena ovládania kola (používaná v súhrnoch) počíta prekrývajúce sa chyby - zablokovanie a šmyk, ktorý začne, do 40 m - raz, a to podľa najdrahšej v zhluku.

## Ako sa to zisťuje {#how-it-is-detected}

Zvyšok tejto stránky je pravidlá: každý druh, každý prah.

Kód: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Zdôvodnenie a literatúra sú v [metóde](race-analytics.md).

## Druhy {#the-kinds}

| Druh | Riadok tabuľky | Chyba? | Najkratšie, ktoré sa počíta |
|---|---|---|---|
| `lock` | Zablokované kolesá | áno | 0,1 s |
| `wheelspin` | Pretáčanie kolies | áno | 0,15 s |
| `oversteer` | Zadok vybieha | áno | 0,2 s |
| `spin` | (počíta sa so Zadok vybieha) | áno | 0,1 s |
| `understeer` | Tlačí do šírky | áno | 0,25 s |
| `crash` | Havárie | áno | - |
| `hit` | Zásahy | áno | - |
| `abs` | Pôsobí ABS | nie | 0,2 s |
| `tc` | Pôsobí trakčná kontrola | nie | 0,2 s |
| `handbrake` | Ručná brzda | nie | 0,1 s |
| `airborne` | Vo vzduchu | nie | 0,15 s |

Kratšie úseky sú šum (obrubník, výmol, jedna vzorka). Úseky bodov mriežky (každé 2 m), ktoré prejdú testom, sa spoja cez medzery do 2 bodov. Len **chyby** môžu byť chybami a niesť cenu; ostatné sú to, čo auto a vodič urobili.

## Čo potrebuje každý test {#what-every-test-needs}

### Odvodené kanály {#derived-channels}

Skôr než sa čokoľvek posúdi, každé kolo dostane to, čo jeho hra neposiela, pod kanonickými názvami (vlastná hodnota hry má vždy prednosť):

| Kanál | Z čoho |
|---|---|
| `bodySlip` (uhol driftu) | rýchlosť v súradniciach auta, `atan2(latVel, abs(longVel))`, tam, kde ju hra posiela (0 pod 3 m/s); inak smer (uhol otočenia hry, prispôsobený smeru jazdy podľa znamienka a posunu cez vzorky rýchlejšie než 10 m/s, dôveryhodný len s kruhovým rozptylom pod 0,05) voči smeru jazdy (pozície aspoň 2 m od seba), pri rýchlostiach nad 3 m/s |
| `yawRate` | zmena `yaw` v čase, tam, kde je smer, ale nie rýchlosť |
| `airborne` | každý kontakt kolesa so zemou vypnutý (≤ 0,5); inak zaťaženie každého kolesa pod 5 % jeho mediánu; inak každý zdvih odpruženia na alebo pod 0,02 (plne vysunuté). Jedna náhodná vzorka nie je let |
| `slipRatio.<W>` | `(povrchová rýchlosť kolesa - rýchlosť auta) / rýchlosť auta` nad 3 m/s, tam, kde hra posiela povrchové rýchlosti kolies; alebo z otáčania kolesa × valcový polomer nameraný na kole - medián `rýchlosť / otáčanie` pri voľnobehu rovno (rýchlosť > 10 m/s, plyn < 0,3, brzda < 0,05, abs(pozdĺžne zrýchlenie) < 3 m/s², nie vo vzduchu; každá vzorka nad 10 m/s, keď je ich menej ako 20), prijaté medzi 0,1 a 1 m. Označené `physical` |
| `loose` | povrchové vibrovanie Forzy na aspoň 2 kolesách (> 0,001) aspoň 0,33 s (obrubník je kratší), medzery pod 1 s sa preklenú |

### Na zemi a ustálené {#on-the-ground-and-settled}

Nič sa nehodnotí vo vzduchu ani **0,3 s po pristátí** - odpruženie dosiahne dno a zrýchlenia vystrelia, čo nie je priľnavosť, brzdenie ani pohon. Vzorka musí byť aj **v pohybe**: rýchlejšie než 5 m/s.

### Podložie {#the-ground}

Podložie každej vzorky je **nespevnené**, kde to kanál `loose` kola hovorí (povrchové vibrovanie Forzy, materiály kolies Trackmanie), inak povrch kola (pozri [disciplína a povrch](race-loading-laps.md#discipline-and-surface)): asfalt, alebo nespevnený pre všetko ostatné. Zákruty, návyky driftu a prahy sa držia oddelene pre asfalt a nespevnený povrch.

### Šmyk ako násobok menovitého maxima pneumatiky {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Hry škálujú šmyk rozdielne; `meta.slip` hovorí ako, a každý šmyk sa delí mierkou tak, aby približne 1 bolo menovité maximum pneumatiky:

| `meta.slip` | Význam | Delí sa |
|---|---|---|
| `peak` | normalizované hrou: nad 1 sa priľnavosť stráca (Forza Data Out) | 1 |
| `scaled` | fyzikálny šmyk delený maximom na asfalte (záznamník Kunos) | menovité maximum podložia nad maximom na asfalte |
| `index` | meranie kĺzania 0..1 (SlipCoef Trackmanie) | 0,5 |
| `physical` (alebo neznáme) | pomer šmyku ako zlomok, uhol šmyku v radiánoch | menovité maximum podložia |

Menovité maximá, keď sa nič lepšie nevie:

| Povrch | Pomer šmyku | Uhol šmyku |
|---|---|---|
| asfalt | 0,12 | 8° |
| zmiešané | 0,18 | 12° |
| nespevnený (štrk) | 0,25 | 15° |
| sneh | 0,25 | 15° |
| ľad | 0,10 | 6° |

### Kde končí priľnavosť: krivky pneumatík každého auta {#where-grip-ends-each-cars-tyre-curves}

Miesto, kde pneumatika prestane dávať viac, sa **meria pre každé auto** zo všetkých jeho načítaných kôl (`measureTyres`), oddelene pre asfalt a nespevnený povrch:

| Krivka | Vzorky (rýchlosť > 10 m/s, ustálené, zrýchlenia pod 45 m/s²) | Šmyk (x) | Sila (y) |
|---|---|---|---|
| brzdenie | brzda > 0,3, ručná brzda ≤ 0,2, jazda rovno (bočné pod 30 % najtvrdšieho) | abs(priemerný pomer šmyku štyroch kolies) | spomalenie |
| trakcia | plyn > 0,8, brzda ≤ 0,05, rovno, plný ťah auta pri tej rýchlosti > 0,5 m/s² | pomer šmyku najväčšieho hnaného kolesa | zrýchlenie ako podiel na tomto ťahu |
| predok | bočné nad 30 % najtvrdšieho, priľnavosť auta pri tej rýchlosti > 1 m/s² | väčší uhol šmyku predných kolies | bočné zrýchlenie ako podiel tejto priľnavosti |
| zadok | to isté | väčší uhol šmyku zadných kolies | to isté |

„Najtvrdšie“ je 99. percentil abs(bočného zrýchlenia) kola na tom podloží (všetko podložie, keď má menej ako 50 vzoriek). Pohon rozhodne, ktoré kolesá sú hnané (predné pri FWD, zadné pri RWD, všetky pri AWD; neznáme: všetky).

Pri aspoň **150 vzorkách** sa šmyk rozdelí do 6 až 14 rovnako početných pásiem (jedno na 40 vzoriek), sila každého pásma je jeho horný kvartil (čo pneumatika dala, keď vodič žiadal), vyhladená cez susedné pásma. **Najlepšie** je pásmo s najväčšou silou; **limit** je prvé pásmo za ním, kde sila klesla o **8 %**. Krivka, ktorá v dátach nikdy neklesne, nemá limit (nekonečno) - prekročenie „maxima“ v tej hre nič nestojí a šmyk sám tam nič neoznačí (zákrutové a trakčné krivky Forza Horizon sú takéto). Pri príliš malom počte vzoriek na jednom podloží sa použijú krivky druhého podložia; pri príliš malom počte celkovo **menovitý** limit: 1,5-násobok menovitého maxima.

Každé auto tiež dostane:

- svoj **návyk driftu**: horný kvartil jeho uhla driftu všade tam, kde zatáča pri 60 % svojho najtvrdšieho alebo viac (potrebuje 100 vzoriek);
- svoje **riadenie na zakrivenie** (`steerGain`), na každé pásmo rýchlosti po 5 m/s: medián abs(riadenie) / zakrivenie dráhy pri pevnom zatáčaní, ale dobre vnútri svojej priľnavosti (30-60 % jeho najtvrdšieho, zakrivenie užšie než polomer 400 m, riadenie nad 0,02; 25 vzoriek na pásmo). Zakrivenie dráhy je rýchlosť otáčania delená rýchlosťou tam, kde hra posiela rýchlosť otáčania, inak z pozícií ±5 m.

## Detekcia, druh po druhu {#detection-kind-by-kind}

| Druh | Test (na vzorkách v pohybe a ustálených) | `peak` a `limit` |
|---|---|---|
| **lock** | brzda > 0,05, ručná brzda nie nad 0,2 a ktorékoľvek kolesového šmyku pomer pod záporným limitom brzdenia | najzápornejší šmyk (násobky menovitého maxima); limit ako záporný |
| **wheelspin** | plyn > 0,2 (alebo bez kanála plynu) a pomer šmyku hnaného kolesa nad limitom trakcie | najväčší hnaný šmyk; limit |
| **oversteer** (uhol driftu) | uhol driftu nad väčším z dolného prahu podložia a 1,5-násobku návyku driftu auta tam | najväčší uhol driftu, radiány |
| **oversteer** (uhly šmyku, bez uhla driftu) | väčší uhol šmyku zadných kolies nad zadným limitom a o viac než 0,25 nad väčším predným | uhol šmyku zadných kolies (násobky maxima) |
| **oversteer** (bez uhla driftu, ale s rýchlosťou otáčania a bočným zrýchlením) | „rýchlosť postoja“ - abs(rýchlosť otáčania) mínus abs(bočné zrýchlenie) / rýchlosť, nad 8 m/s - nad 0,2 rad/s, s riadením proti zákrute | rad/s; limit 0,2 |
| **spin** | beh pretáčavosti, ktorého uhol driftu dosiahol vrchol nad **60°** | ako pretáčavosť |
| **understeer** (uhly šmyku) | nešmýka sa, väčší predný uhol šmyku nad predným limitom a o viac než 0,3 nad zadným | predný uhol šmyku; limit |
| **understeer** (bez uhlov šmyku) | rýchlejšie než 12 m/s, nešmýka sa, nekontrariuje, bočné zrýchlenie nad polovicou najtvrdšieho zrýchlenia kola (99. percentil), dráha užšia než polomer 300 m a riadenie viac než **1,6-násobok** toho, čo riadenie auta na zakrivenie hovorí, že dráha potrebovala | násobok potrebného riadenia; limit 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` nad 0,5 | - |
| **handbrake** | `handbrake` nad 0,2 | - |
| **airborne** | `airborne` nad 0,5 | - |
| **hit**, **crash** | pozri [Zásahy a havárie](#hits-and-crashes) | rýchlosť, ktorú náraz odniesol |

Prahy driftu podľa povrchu: asfalt **7°**, zmiešané **10°**, nespevnený a sneh **15°**, ľad **10°**. Auto, ktoré sa samozrejme šmýka viac - model pneumatík typu arkáda, špecialista na štrk - má vlastný, vyšší prah z vlastných kôl (1,5-násobok svojho návyku).

**Ktorým smerom sa auto otáča** (pre „proti zákrute“): zmena smeru vlastnej dráhy kola cez ±6 m (aspoň 2 body mriežky); užšie než polomer 600 m sa počíta ako zatáčanie; doprava alebo doľava podľa toho, či je svet zrkadlový. Riadenie je **proti** zákrute, keď abs(riadenie) > 0,05 a jeho znamienko je opačné k zákrute - šmyk **zachytený** opačným natočením volantu.

**Pedále na začiatku** (`pedal`): *brzdenie*, keď je brzda nad 0,1; *plyn* nad 0,3; *odľahčenie*, keď bol plyn nad 0,5 v 8 bodoch mriežky (16 m) pred tým; inak *voľnobeh* (alebo bez kanála plynu).

## Kladené na druhé kolo {#laid-against-the-other-lap}

Každá udalosť sa posudzuje voči kolu, s ktorým sa zamerané kolo porovnáva v tom úseku (najlepšie z jeho triedy; pre to kolo samotné, ktorýkoľvek z jeho triedy bol cez úsek najrýchlejší):

1. **Ako ďaleko išlo druhé kolo** na tých istých metroch, ±8 m: vlastné udalosti druhého kola tej istej rodiny (otočka sa počíta ako pretáčavosť, havária ako zásah) merané v tých istých jednotkách, bez prahov, s použitím kriviek pneumatík druhého auta.
2. **Zdieľané**, keď druhé kolo išlo **80 %** tak ďaleko alebo viac: takto sa zákruta jazdí, nie chyba. Nechybové druhy sú vždy „zdieľané“.
3. **Cena** za nezdieľanú chybu: čas, ktorý toto kolo stratilo voči druhému od 5 m pred udalosťou po **40 m za ňou** (pri zásahu alebo havárii, kým auto nezíska späť svoju rýchlosť - metre na jej nadobudnutie pri vlastnom ťahu, 40 až 400 m; bez nameraného ťahu 5 m/s²). Nikdy záporná.
4. **Rýchlosť odovzdaná limitu auta**: pri zablokovaní spomalenie, ktoré auto dokáže pri tej rýchlosti, mínus to, čo urobilo, sčítané cez udalosť; pri pretáčaní kolies jeho plný ťah mínus to, čo urobilo; pri náraze rýchlosť, ktorú náraz odniesol. Uvádza sa, keď je nad 0,5 m/s (1,8 km/h).

Nezdieľaná chyba, ktorá stála aspoň **0,02 s**, sa uvedie v zozname ([štatistiky trate](race-course-statistics.md) počítajú len chyby **0,03 s** alebo viac, aby chyba, počítaná cez mnohé kolá, bola jasná), a môže sa stať príčinou straty v zákrute (pozri [Analýza zákruta po zákrute](race-corner-analysis.md#car-control-faults-and-impacts)).

## Zásahy a havárie {#hits-and-crashes}

`impacts.ts` číta zásahy z **vlastných vzoriek kola**, ešte pred ich prevzorkovaním - zásah sa skončí v stotinách sekundy. Pneumatiky nedokážu vyvolať sily zásahu, takže zásah sa meria voči vlastnému autu kola:

- **Jeho priľnavosť `G`**: 99. percentil jeho horizontálneho zrýchlenia `√(lat² + long²)` cez kolo, na zemi a rýchlejšie než 5 m/s. Bez kanálov zrýchlenia (alebo pod 3 m/s²) 15 m/s² - priľnavosť cestného auta.
- **Prah**: `max(1,8 G, G + 18, 30)` m/s².
- **Zasiahnutá vzorka**: horizontálne zrýchlenie nad prahom *a zároveň* skok o viac než polovicu `G` oproti predchádzajúcej vzorke; **alebo** pokles rýchlosti do 0,1 s o viac, než by prah predstavoval za 0,1 s plus 1,5 m/s. Len na zemi a ustálené a len keď auto išlo rýchlejšie než 5 m/s.
- Zasiahnuté vzorky do **0,4 s** sú jeden náraz.
- **Pred / po**: najvyššia rýchlosť 0,15 s pred; najnižšia do 0,3 s po poslednej zasiahnutej vzorke.
- **Nie je to náraz**: rýchlosť zmizla bez sily za ňou - špička horizontálneho zrýchlenia do 0,1 s pod väčším z `G` a 25 m/s² - je to hra, ktorá auto pretočila alebo resetovala.
- **Havária**, keď odniesla **30 km/h** alebo viac, alebo auto zanechala pod polovicou svojej rýchlosti; inak **zásah** - úder, zadretie o stenu.
- **Smer**: pozdĺžne zrýchlenie väčšie než bočné a záporné: *čelne*; kladné: *zozadu*; bočné väčšie: *pozdĺž boku*. Bez zrýchlení čelne.

Čo auto dokáže, sa meria so všetkými nárazmi vynechanými, od 0,1 s pred ním do 1 s po ňom (`struckMask`).

## Texty {#the-texts}

Každá udalosť sa vysloví s menovaním oboch kôl, s miestom (metre pozdĺž referencie), rýchlosťou, pri ktorej začala, koľko prekročila limit voči druhému kolu, a tipom. Tip vyplýva z druhu a toho, čo sa namerali:

| Udalosť | Tip |
|---|---|
| zablokovanie, len predné | zablokovaný predok nemôže riadiť: menej tlaku na vrchole zóny, uvoľniť ho do zákruty |
| zablokovanie, len zadné | zablokovaný zadok nechá auto sa otáčať: brzdite viac rovno, uvoľnite pri vstupe do zákruty; ak sa to opakuje, posuňte rozdelenie brzdy dopredu |
| zablokovanie, nespevnený povrch | zablokované koleso sa zarýva: stlačte tesne pred zablokovaním |
| zablokovanie, inak | príliš veľa pedála na priľnavosť: stláčajte postupnejšie |
| pretáčanie kolies | plyn pridávajte, keď sa volant vracia do stredu, pri trakcii na hranici krátko preraďte (na nespevnenom povrchu: vyšší prevod zmäkčí krútiaci moment) |
| otočka / pretáčavosť | podľa pedála: pri brzdení (príliš tvrdé brzdenie v zákrute, príliš skoré zaradenie nižšieho prevodu), pri odľahčení (pretáčavosť pri odľahčení: držte stály plyn), na plyne (príliš veľa, keď ešte stále ste zatočení), žiadne (zatočili ste príliš rýchlo); „zachytené opačným natočením“, keď sa kontrariovalo; na nespevnenom povrchu alebo v rallye „nejaký uhol je rýchla cesta okolo - druhému stačil“ |
| nedotáčavosť | viac natočenia nepomôže, keď predok odišiel: prichádzajte pomalšie, nechajte mierne brzdiť, aby sa predok zaťažil, a rozviňte; na nespevnenom povrchu otočte auto odľahčením alebo ľahkým dotykom ľavej nohy |
| zásah / havária | pozdĺž boku: meter rezervy stojí menej než zadretie; zozadu: iné auto alebo šmyk dozadu; havária čelne: brzdite skôr; úder vpredu: niečo ste zachytili. „X zasiahol tam tiež.“, keď je zdieľané |

V Trackmanii šmyk ešte hovorí: pod približne **400 km/h** (**300** na nespevnenom povrchu: hlina, tráva, plast) šmyk dáva menej pohonu než priľnutie; nad tým speedslide v správnom uhle získava, a tento stál čas, takže jeho uhol bol zlý.

## Čo každý zdroj umožňuje {#what-each-source-allows}

| Kolá obsahujú | Zablokovania / pretáčanie kolies | Pretáčavosť / otočka | Nedotáčavosť |
|---|---|---|---|
| šmyk pomeru a uhla šmyku na koleso, rýchlosť auta (Forza Data Out, hry AC) | zo šmyku | z uhla driftu, alebo uhla šmyku zadných | z uhlov šmyku |
| rýchlosti kolies, svetová rýchlosť (rally hry, BeamNG) | z odvodeného šmyku | z odvodeného uhla driftu | z riadenia na zakrivenie |
| yaw a rýchlosť yaw, bez šmyku (iRacing) | - | z uhla driftu (prispôsobený yaw voči smeru jazdy); z rýchlosti postoja s kontrariovaním len vtedy, keď yaw nie je dôveryhodný | z riadenia na zakrivenie |
| len smer | - | zo smeru voči jazde | z riadenia na zakrivenie |
| samotný súbor kola FH Companion (bez yaw, bez šmyku) | - | - | z riadenia na zakrivenie (má riadenie a zrýchlenia) |

Zásahy a havárie potrebujú len rýchlosť (lepšie so zrýchleniami), takže ich má každý zdroj. Sekcia **Ovládanie auta** ukazuje, čo každý zdroj umožňuje: so samotným súborom kola FH Companion jeho tlačenia z riadenia a jeho zásahy, a nápoveda na načítanie `.tele.gz` pre zvyšok.
