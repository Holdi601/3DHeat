---
title: "Prehranie a 3D scéna"
parent: "Analýza pretekov"
nav_order: 52
lang: "sk"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Prehrávanie a 3D scéna

Prehrajte svoje kolá spolu, ako závod, a sledujte, kde jedno auto odskočí. Všetko, čo vidíte vo 3D výhľade na karte **Analýza pretekov**, je tu opísané: odjazdené čiary, farby namaľované na trati, autá a popisky.

![Mapa príčin s autami zarovnanými 40 m pred zákrutou: farebná trať, dve autá a stĺpik s vlajkou](../assets/img/en/race-replay-lined-up.webp)

## Hodiny prehrávania {#the-replay-clock}

Jedny hodiny poháňajú každé kolo: sekundy kola **referencie**. Motor ich posúva každý snímok počas prehrávania (o čas snímku × rýchlosť prehrávania); na konci sa vrátia na 0, keď je zapnutá **Slučka**, inak sa zastavia. Hodiny zámerne nie sú súčasťou úložiska, aby sa bočný panel nevykresľoval znova každý snímok; HUD a grafy sa na ne prihlásia a aktualizujú sa najviac raz za snímok.

**Dĺžka prehrávania** je najdlhšie, čo ktorékoľvek kolo beží na hodinách: čas každého kola (mínus jeho posun v *Zoradené*), alebo čas referencie v *Bok po boku*.

## Panel prehrávania {#the-transport-bar}

Pod výhľadom, zľava doprava:

| Ovládací prvok | Robí |
|---|---|
| ⏮ | späť na začiatok (tiež **Home**) |
| ▶ / ❚❚ | prehrať / pozastaviť (tiež **K**) |
| rýchlosť | 0,25×, 0,5×, 1×, 2×, 4× |
| posuvník prechádzania | nastaví hodiny priamo, po krokoch 0,01 s |
| hodiny | `čas / dĺžka · metre`: hodiny ako čas kola, dĺžka prehrávania a ako ďaleko pozdĺž referencie je auto referencie |
| *Od štartu* / *Zoradené* / *Bok po boku* | režim prehrávania (nižšie) |
| **Zoradiť tu** | postaví každé auto tam, kde je teraz referencia, a pokračuje odtiaľ |
| **Slučka** | začať znova na konci (predvolene zapnuté) |
| **Skryť grafy** / **Zobraziť grafy** | grafy vzdialenosti pod panelom |

Tlačidlá sú nedostupné, kým nie sú načítané kolá (jedno kolo stačí na prehratie; porovnania potrebujú dve).

## Režimy prehrávania {#replay-modes}

Ako čas každého kola vyplýva z hodín:

| Režim | Čas každého kola | Čo ukazuje |
|---|---|---|
| **Od štartu** (`start`) | samotné hodiny | každé kolo od vlastného štartu: závod medzi nimi, rozdiel rastie tak, ako rástol na trati |
| **Zoradené** (`anchor`) | hodiny plus posun kola | každé auto na tom istom mieste v tom istom okamihu, potom sa pustí - čo sa stane od toho bodu ďalej, nie od štartu kola |
| **Bok po boku** (`locked`) | čas, v ktorom kolo dosiahlo súčasnú vzdialenosť referencie | každé auto držané na vzdialenosti referencie počas celého kola: rýchlosti a vstupy porovnané meter po metri |

Použite, keď:

- **Od štartu**: chcete vidieť, kto je vpredu a ako rastie rozdiel.
- **Zoradené**: chcete vedieť, čo sa stane v jednej zákrute alebo na jednej rovinke, keď všetci začínajú tam vyrovnane.
- **Bok po boku**: chcete porovnať, čo vodiči robia pedálmi a volantom na tom istom mieste trate.

**Posuny v *Zoradené*:** pre kotvu v `s` metroch pozdĺž referencie je posun každého kola jeho vlastný čas pri `s` mínus čas referencie pri `s`, obe čítané z zarovnaných kôl (pozri [jedna os vzdialenosti](race-corner-analysis.md#one-distance-axis)). Kolo, ktoré nepokrýva `s`, si ponechá posun 0. Výber *Zoradené* z tlačidiel režimu ukotví na súčasnú vzdialenosť referencie.

Biely stĺpik s vlajkou (14 m vysoký) označuje kotvu v režime *Zoradené*.

### Zoradenie {#lining-up}

| Akcia | Kotva | Hodiny |
|---|---|---|
| **Zoradiť tu** | kde je teraz referencia | nezmenené |
| Shift+klik na grafy | kliknutý meter | 1,5 s predtým, než ho referencia dosiahne |
| nález v *Kde sa zlepšiť*, očíslovaný odznak na trati, riadok *Zákruta po zákrute* s nálezom | 40 m pred miestom, kde začína príčina nálezu | 1,5 s pred tým bodom; potom sa prehráva |
| udalosť kontroly auta, popisok nárazu | 40 m pred udalosťou | 1,5 s predtým; potom sa prehráva |
| kolo v štatistikách trate | ako jeho nález alebo udalosť | ako vyššie, s tým kolom zameraným |

Pozretie sa na nález ho aj zarámuje kamerou - guľa okolo stredu rozsahu nálezu, polomer väčší z 40 m a polovice jeho dĺžky plus 30 m (60 m pre udalosť) - pokiaľ kamera nenasleduje auto.

### Kamera nasledovania {#chase-camera}

⌖ v zozname kôl núti kameru nasledovať to auto: 2,5 + 4 × veľkosť auta metrov za ním a 0,9 + 1,1 × veľkosť auta metrov nad ním, pozerajúc sa v smere jazdy, naklonená dole na auto, vyhladená (20 % cesty každý snímok), aby sa netriasla s každým kolísaním. ⌖ znova ju uvoľní. Nasledované auto sa vykreslí o niečo svetlejšie, s bielym krúžkom na zemi, a jeho karta sa zvýrazní.

## Sekcia Výhľad {#the-view-section}

| Ovládací prvok | Predvolene | Robí |
|---|---|---|
| **Čiary** / **Časová mapa** / **Mapa príčin** / **Mapa chýb** | Časová mapa | čo sa namaľuje pozdĺž trate (nižšie); *Čiary* nemaľuje nič |
| legenda | - | *zisky ↔ straty* pre časovú mapu, farby príčin pre mapu príčin, *málo kôl ↔ najviac kôl* pre mapu chýb |
| **Odjazdené stopy** | zapnuté | čiara každého viditeľného kola vo svojej farbe |
| **Autá** | zapnuté | autá a zdroje kariet HUD |
| **Pneumatiky a odpruženie** | zapnuté | teplota pneumatík, krúžky prešmykov, tyče odpruženia a ďalšie symboly pre každé koleso, a svetlá na streche áut |
| **Popisy** | zapnuté | názvy zákrut, očíslované odznaky, popisky nárazov, popisky zákrut mapy chýb |
| **Trať z kôl** | zapnuté | povrch cesty pre trať bez extrahovaného modelu (skryté, keď je načítaný model trate) |
| **Všetky hodnoty na kartách** | vypnuté | každý kanál uvedený na každej karte HUD |
| **Skutočné tvary áut** | zapnuté | každé auto v tvare jeho náprotivku (pozri [Autá](#the-cars)); vypnuté: otvorený jednomiestny vozeň, ktorý nič z telemetrie neskrýva |
| **Veľkosť áut** | 1× | 1× až 10× po krokoch 0,5; 1× je skutočná veľkosť auta, dlhé a široké tak, ako v hre. Nič okrem tohto posuvníka ju nemení |

## Odjazdené čiary {#driven-lines}

Dráha každého viditeľného kola cez jeho vlastné vzorky, vo jeho farbe, kreslená 0,12 m pod zaznamenanou pozíciou (zaznamenaná pozícia auta je jeho referenčný bod, 0,28 až 0,47 m nad cestou na extrahovaných tratiach Forza). Bod sa ponechá každých 1,5 m; keď je viditeľných viac než 10 kôl, kolá, na ktoré sa nepozerá, si ponechajú jeden bod každých 6 m (každý vrchol ide na GPU každý snímok).

## Mapy {#the-maps}

Všetky tri sú pásy pozdĺž dráhy **referencie**, 0,2 m pod zaznamenanými pozíciami, jeden štvorec na krok mriežky 2 m.

### Časová mapa (`where`) {#time-map-where}

Pre zvolené kolo: sekundy získané alebo stratené na meter voči kolu, s ktorým sa v tom bode porovnáva (najlepšie z jeho triedy, alebo pri referencii najrýchlejšie iné kolo cez každý úsek), z zmeny zarovnaných kôl
za krok mriežky, vyhladenej na ±10 m. Červená tam, kde stráca čas, zelená tam, kde ho získava, sivá medzi tým; farebná škála je 95. percentil absolútnych hodnôt, takže špičky sa orežú a väčšina kola je v rozsahu. Šírka 6 m.

### Mapa príčin (`why`) {#cause-map-why}

Pre zvolené kolo: každá strata namaľovaná cez rozsah, kde je jej **príčina** (nie kde sa čas ukazuje), zafarbená podľa skupiny príčiny, s najdrahším nálezom vyhrávajúcim, keď sa dve prekrývajú. Šírka `3 + 9·√(cena / najväčšia cena)` metrov; kde nič nebolo stratené, sivý pás 2 m. Nález vybraný v *Kde sa zlepšiť* je namaľovaný bielo.

| Skupina | Farba | Nálezy |
|---|---|---|
| brzdenie | oranžová | straty vodiča vo fáze brzdenia |
| vstup | purpurová | straty vodiča na ceste dnu a cez stred |
| výjazd | modrá | straty vodiča na ceste von |
| rovinka | žltá | straty vodiča na rovinke |
| auto | sivá | to, čo vysvetľuje auto |
| kontext | tmavosivá | situácia (štart závodu proti letiacemu kolu) |

### Mapa chýb {#mistake-map}

Koľko zo všetkých kôl (tried vybraných v štatistikách trate) urobilo chybu na každom metri - akéhokoľvek druhu, alebo len tú, ktorá je vybraná v štatistikách. Každé kolo sa počíta raz na meter; rozsah každej chyby sa rozšíri o 6 m na každú stranu, aby sa krátka ukázala. Šírka `3 + 10·(kolá / najviac kôl)` metrov a farba od tlmeného hnedej po jasnú oranžovú; sivé 2 m tam, kde žiadne kolo chybu neurobilo. Pozri [Štatistiky trate](race-course-statistics.md#the-mistake-map).

## Trať z kôl {#track-from-the-laps}

Pre hru, ktorej trať nebola extrahovaná, sa pod čiarami kreslí cesta: široká práve toľko, koľko sa kolá rozptýlia okolo referencie (bočné posuny do 25 m sa počítajú) plus 2 m na každú stranu, aspoň 4 m na každú stranu od referenčnej čiary, vyhladená cez ±8 bodov mriežky (±16 m), v asfaltovej sivej so svetlými okrajovými čiarami, 0,3 m pod zaznamenanými pozíciami. Skryté, keď je v **Level** načítaný model trate.

## Nárazy a havárie na trati {#hits-and-crashes-on-the-track}

Nárazy a havárie každého viditeľného kola (pozri [Udalosti kontroly auta](race-control-events.md#hits-and-crashes)) sú označené tam, kde sa stali, vždy, keď sa kreslia čiary alebo autá: špicatá hviezda - červená pri havárii, jantárová pri náraze - stojaca na stĺpiku, s krúžkom vo farbe kola pri jej päte, veľkosť podľa veľkosti auta (havárie väčšie). Keď auto prejde okamihom nárazu, z neho sa na 0,8 s rozšíri otrasový krúžok.

## Režim pomoci {#help-mode}

**?** vedľa výberu jazyka, alebo klávesa **?** či **F1**, zapne kľúč ku každej farbe na obrazovke, na všetkých troch kartách ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Voľba zostáva v tomto prehliadači.

- **Kľúč** v rohu výhľadu vypisuje farby pre kartu a režim v použití. Každá stupnica pochádza odkiaľ výhľad ju berie, takže upravená teplotná stupnica sa ukáže ako upravená. Na karte závodu sa vypisuje len to, čo načítané kolá nesú.
- **Karta každého auta** získa tabuľku toho, čo sa kreslí na jeho kolesách, podľa názvu, s hodnotou každého kolesa vo farbe, v ktorej sa kreslí.
- **Auto v zameraní** dostane popisok pri každom kolese, ktorý hovorí to isté, umiestnený von pri rohoch. Skrytý, keď je auto na obrazovke príliš malé, aby sa tam zmestili.

## Autá {#the-cars}

**Každé auto v svojom tvare**, vo farbe svojho kola a v skutočnej veľkosti. Tvary pochádzajú zo súboru áut, vytvoreného raz na počítači, na ktorom beží hra:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Bez neho sa každé auto kreslí ako **vlastné auto prehliadača** svojho druhu a éry: sedan, kupé, hatchback, kombi, športové auto, supercar, muscle car, terénne auto, pickup, dodávka alebo mikroauto, každé ako klasika (pred 1980), z 80. a 90. rokov, alebo moderné ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Tie sa tu postavia zo všeobecných proporcií: žiadne logá, žiadne názvy modelov a nič zo súborov žiadnej hry, takže sa dodávajú s prehliadačom. Druh pochádza z názvu auta, éra z roku v ňom; auto bez oboch sa berie podľa svojej triedy. Asi sto skutočných generácií je známych podľa ich uverejnenej dĺžky, šírky, výšky a rázvoru ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); riadok každé, zaokrúhlené), takže 3 séria z 90. rokov dostane veľkosť a postoj toho auta, stále ako prostý tvar bez znaku alebo mriežky.

Súbor áut sa vytvorí na vašom vlastnom počítači z vašej vlastnej kópie hry. Drží nízkodetailný model každého auta, asi 900 trojuholníkov, s jeho pozíciami kolies (pozri [príkaz `cars` extraktora](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)).
**Načítať súbor s autami...** vo voľbách výhľadu, alebo pustenie súboru na kartu závodu, ho načíta; zostáva v tomto prehliadači. Obsahuje tvary hry, takže sa nedá odovzdávať ďalej, a prehliadač žiadny nedodáva.

Ktoré auto zastupuje auto kola, sa počíta z toho, čo je načítané, zakaždým nanovo, a nikdy sa neukladá, takže auto bez náprotivku dnes dostane svoje vlastné, hneď ako novší súbor ho bude mať ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Auto kola | Kreslí sa ako |
|---|---|
| jeho číslo je v súbore pre tú istú hru | presne to auto |
| rovnaká značka a slovo modelu v názve | ten model, najbližší rokmi |
| rovnaká značka, rovnaká generácia | auto tej značky najbližšie rokmi |
| čokoľvek iné, so súborom áut | najbližšie auto tej istej značky, ak existuje, inak rovnaký druh karosérie, najbližšie rokmi |
| jednomiestne auto s otvorenými kolesami, podľa názvu | jednomiestny vozeň nižšie |
| ani jedno z prvých dvoch, a prehliadač pozná auto podľa jeho veľkosti | vlastné auto prehliadača v skutočnej veľkosti toho auta, so súborom alebo bez neho |
| čokoľvek iné bez súboru | vlastné auto prehliadača toho druhu a éry |

Takže kolo 1990 BMW 3 série z inej hry sa ukáže ako BMW z približne toho roku a auto novšie než súbor ukáže svojho najbližšieho príbuzného, kým sa súbor znova nevytvorí. Popis kola a riadok pod veľkosťou auta pre zamerané kolo hovoria, ako sa kreslí a aké blízko to je.

Vlastné autá prehliadača majú tmavé okná. Modely v súbore áut sú jednofarebné po celom aute, lebo súbor nemá lak ani sklo, z čoho by vychádzal. Kolesá, zadné svetlá, svetlomety a symboly telemetrie nižšie sa kreslia ako na jednomiestnom vozni; tyč odpruženia beží po vonkajšku kolesa, kde je vidieť, a ramená sa vynechávajú.

**Jednomiestny vozeň** je otvorené koleso v farbe kola, takže predok je zjavný z ktoréhokoľvek uhla a nič neskrýva kolesá: monokok, kryt motora, bočníky, kokpit s prilbou, halo, podlaha, predné a zadné krídla; štyri okrúhle kolesá, predné otočené riadením (až 0,5 rad pri plnom natočení), každé na dvoch ramenách s nápravou, tiahlo riadenia (predné) alebo hnací hriadeľ (zadné), a
každé na dvoch ramenách s nápravou, tiahlo riadenia (predné) alebo hnací hriadeľ (zadné), a tyč odpruženia. Model je spustený o 0,3 m oproti zaznamenanej pozícii, aby jeho kolesá stáli na ceste, a zmenšený alebo zväčšený podľa **Veľkosť áut**.

**Karoséria sa pohybuje na svojich pružinách**: keď kolo nesie všetky štyri zdvihy odpruženia, každý roh klesne o svoj zdvih (zveličený na 0,12 m od plného vysunutia po plné stlačenie, aby to bolo vidieť z kamery nasledovania), a karoséria sa potopí, naklápa a valí na rovine prechádzajúcej štyrmi bodmi.

**Čo sa kreslí z telemetrie** (keď je zapnuté *Pneumatiky a odpruženie*) nasleduje [tabuľku kanálov](race-charts-and-hud.md#the-channel-table):

| Symbol | Z | Kreslenie |
|---|---|---|
| farba pneumatiky | `tireTemp` | samotná pneumatika, modrá studená → azúrová → zelená pracovná → žltá → červená horúca, pri 40 - 130 °C |
| krúžok prešmyku | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (najväčší) | krúžok na zemi pod kolesom, zelený s priľnavosťou v rezerve, jantárový pri 0,66, červený pri 1 (hrana priľnavosti tak, ako ju hlási hra); slabý pod 0,3 |
| pruh odpruženia | `suspension` (0..1) | tyč odpruženia zafarbená podľa zdvihu: modrá vysunutá, biela v strede, červená stlačená |
| žiara brzdy | `brakeTemp` (100 - 900 °C) | kotúč na vonkajšej ploche kolesa, od tmavej po oranžovú |
| pás opotrebenia | `tireWear` (0..1) | pás okolo hrany dezénu, biela nová → červená opotrebovaná |
| pruh zaťaženia | `wheelLoad` (0 - 12 000 N) | stĺpik vedľa kolesa vysoký ako zaťaženie |

Brzdové svetlá (zadné svetlo do dažďa a koncové plochy krídla) sa rozsvietia s brzdovým pedálom. Každý kanál `lamp`, ktorý je zapnutý (nad polovicou svojho rozsahu), rozsvieti svetlo nad vzduchovým filtrom vo svojej farbe: pôsobí ABS, pôsobí trakčná kontrola, DRS, obmedzovač v pitoch, ručná brzda, vo vzduchu.

**V davu** (viac než 10 viditeľných), autá, na ktoré sa nepozerá, sa kreslia jednoducho: karoséria, krídla, kolesá a brzdové svetlo len.

## Popisky {#labels}

Pripnuté k trati a umiestnené každý snímok podľa projekcie kamery (mimo obrazovky alebo za kamerou, skryté). Keď je zapnuté **Popisky**:

| Popisok | Kde | Kliknutie |
|---|---|---|
| názvy zákrut (`T1`, `T2` …) | nad vrcholom každej zákruty na referencii | - |
| očíslované odznaky 1 - 5 | päť najväčších strát vodiča zvoleného kola, v strede rozsahu každej príčiny, orámované farbou príčiny; po nabehnutí myšou názov a cena | zoradiť a prehrať tento nález |
| popisky nárazov / havárií | nad každým výbuchom **zvoleného** kola: „Havária −45 km/h“ / „Náraz −12 km/h“; po nabehnutí myšou úplný popis a tip | zoradiť a prehrať náraz |
| popisky zákrut mapy chýb (namiesto názvov zákrut a odznakov, keď je mapa mapa chýb) | vrchol každej zákruty: „T3 · 5/40 skoré brzdenie“ (najčastejšia chyba, kolá, ktoré ju urobili / kolá, ktoré zákrutu jazdili), „T3 · 5/40“ keď je vybraný jeden druh, „T3 · čisté“ keď žiaden; po nabehnutí myšou straty zákruty a jej päť najčastejších chýb | otvoriť alebo zatvoriť túto zákrutu v štatistikách trate |

## Zrkadlené svety {#mirrored-worlds}

Svet prehliadača je pravotočivý s Y smerom hore: pohľadom zhora sa auto, ktorého smer jazdy `atan2(dx, dz)` rastie, zatáča doľava. Hra s ľavotočivým svetom - medzi nimi Forza - sa zobrazí zrkadlovo, každá zákruta doprava sa nakreslí ako zákruta doľava, trať aj kolá.

Kolá o tom hovoria samy
([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)):
každé kolo sa prechádza po niekoľkých metroch (3 m naraz), zatáčanie jeho dráhy sa porovnáva so stlačením vonkajšieho odpruženia (`suspension.FR` mínus `suspension.FL`) a, bez odpruženia, s riadením (kladné vpravo v každom adaptéri). Kolo, ktoré sa celkovo otočí o menej než π, nič nehovorí; dôkaz sa počíta, keď prekročí 2 % zatáčania. Kolá hlasujú; remíza je „nedá sa určiť“.

Keď sa verdikt kôl nezhoduje so súčasnou inverziou osí (nepárny počet obrátených osí v **Kamera a scéna → Obrátiť os sveta**), sekcia **Kolá** to povie pod zoznamom:

- hra je zrkadlená a nič nie je obrátené: „Tieto kolá riadia doprava tam, kde je trať nakreslená zatáčajúca doľava …“ s **Obrátiť X**;
- osi sú obrátené, ale kolá nie sú zrkadlené: „Obrátené osi kreslia tieto kolá zrkadlovo …“ s **Obnoviť osi**.

Mení sa len kreslenie - odraz zložený do matice pohľadu; dáta, analýza a každá súradnica, ktorú nástroje ukazujú, zostávajú hernými. Obrátenie sa uchováva v prehliadači. Analýza pomenúva zákruty doľava alebo doprava tým istým meraním (neznámy svet sa berie ako zrkadlený, ako Forzin).

## Pre vývojárov {#for-developers}

Kód: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Čo je auto v okamihu {#what-a-car-is-at-a-moment}

`stateAt` interpoluje každý kanál medzi dvoma vzorkami okolo času kola. Kanály, ktoré skáču (rýchlostný stupeň, vlajky), zoberú najbližšiu vzorku. Kolo, ktoré skončilo, zaparkuje na čiare.

**Smer.** Smer jazdy vyplýva z pozícií vzdialených niekoľko metrov (aspoň 2 m na každú stranu, aby kolísanie neotočilo auto). Smer karosérie vyplýva z uhla zatáčania hry len vtedy, keď je prispôsobený smeru jazdy - znamienko a odsadenie, kruhovým priemerom cez vzorky rýchlejšie než 10 m/s (aspoň 20) - a len keď sa s ním potom zhoduje (kruhový rozptyl pod 0,05, asi 18° rozptylu); inak karoséria smeruje pozdĺž smeru jazdy. To udrží šmyk viditeľný (karoséria a jazda od seba), bez dôvery v uhlovú konvenciu hry.

**Riadenie a strany.** Akým smerom kladné riadenie otáča auto a ktorej strane patria pravé kolesá hry, sa meria z kola: riadenie oproti zatáčaniu dráhy a ktoré odpruženie sa stláča na vonkajšej strane zákrut (bez údajov o odpružení sa hry Forza berú ako zrkadlené).
