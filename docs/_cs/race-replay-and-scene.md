---
title: "Přehrání a 3D scéna"
parent: "Analýza závodu"
nav_order: 52
lang: "cs"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Přehrání a 3D scéna

Přehrajte si svá kola dohromady, jako závod, a sledujte, kde jeden vůz získává náskok. Tady je popsáno všechno, co vidíte ve 3D zobrazení záložky **Analýza závodu**: projeté stopy, barvy na trati, vozy a popisky.

![Mapa příčin se seřazenými vozy 40 m před zatáčkou: barevná trať, dva vozy a praporová tyč](../assets/img/en/race-replay-lined-up.webp)

## Hodiny přehrávání {#the-replay-clock}

Jedny hodiny řídí každé kolo: sekundy kola **reference**. Motor je při přehrávání posouvá v každém snímku (o čas snímku × rychlost přehrávání). Na konci se vrátí na 0, když je zapnutá **Smyčka**. Jinak se zastaví. Hodiny záměrně nejsou součástí úložiště, aby se postranní panel nepřekreslovával každý snímek. HUD a grafy se na ně napojí a aktualizují se nejvýš jednou za snímek.

**Délka přehrávání** je nejdelší doba, kterou některé kolo běží na hodinách: čas každého kola (minus jeho posun v *Seřazené*), nebo čas reference v *Vedle sebe*.

## Ovládací lišta {#the-transport-bar}

Pod zobrazením, zleva doprava:

| Ovládací prvek | Dělá |
|---|---|
| ⏮ | zpět na začátek (také **Home**) |
| ▶ / ❚❚ | přehrát / pozastavit (také **K**) |
| rychlost | 0,25×, 0,5×, 1×, 2×, 4× |
| posuvník | nastaví hodiny přímo, v krocích po 0,01 s |
| hodiny | `čas / délka · metry`: hodiny jako čas kola, délka přehrávání a jak daleko po referenci je referenční vůz |
| *Od startovní čáry* / *Seřazené* / *Vedle sebe* | režim přehrávání (níže) |
| **Seřadit zde** | postaví každý vůz tam, kde je teď reference, a pokračuje odtud |
| **Smyčka** | začne znovu na konci (ve výchozím nastavení zapnuto) |
| **Skrýt grafy** / **Zobrazit grafy** | grafy vzdálenosti pod lištou |

Tlačítka jsou nedostupná, dokud nejsou načtena kola. Jedno kolo stačí k přehrání, porovnání potřebují dvě.

## Režimy přehrávání {#replay-modes}

Jak čas každého kola vyplývá z hodin:

| Režim | Čas každého kola | Co ukazuje |
|---|---|---|
| **Od startovní čáry** (`start`) | samotné hodiny | každé kolo od svého startu: závod mezi nimi, s mezerou, která roste tak, jak rostla na trati |
| **Seřazené** (`anchor`) | hodiny plus posun kola | každý vůz na stejném místě ve stejný okamžik, pak se pustí. Ukazuje, co se stane od tohoto bodu dál, ne od startu kola |
| **Vedle sebe** (`locked`) | čas, v němž kolo dosáhlo aktuální vzdálenosti reference | každý vůz držen na vzdálenosti reference po celé kolo: rychlosti a vstupy srovnány metr po metru |

Použijte, když:

- **Od startovní čáry**: chcete vidět, kdo je vpředu a jak mezera roste.
- **Seřazené**: chcete vědět, co se děje v jedné zatáčce nebo na jedné rovince, s výchozím stavem pro všechny stejným.
- **Vedle sebe**: chcete srovnat, co řidiči dělají s pedály a volantem na stejném místě tratě.

**Posuny v *Seřazené*:** u kotvy v `s` metrech podél reference je posun každého kola jeho vlastní čas v `s` minus čas reference v `s`. Oba se čtou ze zarovnaných kol (viz [jedna osa vzdálenosti](race-corner-analysis.md#one-distance-axis)). Kolo, které `s` nepokrývá, zůstane s posunem 0. Když zvolíte *Seřazené* z tlačítek režimu, kotva se usadí na aktuální vzdálenost reference.

Bílý sloupek s vlajkou (14 m vysoký) označuje kotvu v režimu *Seřazené*.

### Seřazení {#lining-up}

| Akce | Kotva | Hodiny |
|---|---|---|
| **Seřadit zde** | kde je teď reference | beze změny |
| Shift+klik na grafy | kliknutý metr | 1,5 s před tím, než ho reference dosáhne |
| nález v *Kde se zlepšit*, číslovaný štítek na trati, řádek *Zatáčku po zatáčce* s nálezem | 40 m před místem, kde začíná příčina nálezu | 1,5 s před tímto bodem; pak se přehrává |
| událost ovládání vozu, popisek nárazu | 40 m před událostí | 1,5 s před ní; pak se přehrává |
| kolo ve statistikách tratě | jako jeho nález nebo událost | jako výše, s tímto kolem v zaměření |

Když se díváte na nález, kamera ho také zarámuje. Koule kolem středu rozsahu nálezu, s poloměrem větším z těchto dvou: 40 m, nebo polovina jeho délky plus 30 m (u události 60 m). To neplatí, když kamera sleduje vůz.

### Kamera za vozem {#chase-camera}

⌖ v seznamu kol nechá kameru sledovat ten vůz: 2,5 + 4 × velikost vozu metrů za ním a 0,9 + 1,1 × velikost vozu metrů nad ním. Dívá se ve směru jízdy, naklopená dolů k vozu, a plynule se pohybuje (20 % cesty v každém snímku), aby se netřásla při každém zakolísání. ⌖ znovu ji uvolní. Sledovaný vůz je kreslen o něco světleji, s bílým kroužkem na zemi, a jeho karta je zvýrazněna.

## Oddíl Zobrazení {#the-view-section}

| Ovládací prvek | Výchozí | Dělá |
|---|---|---|
| **Čáry** / **Mapa času** / **Mapa příčin** / **Mapa chyb** | Mapa času | co se maluje podél tratě (níže). *Čáry* nemaluje nic |
| legenda | - | *zisky ↔ ztráty* pro mapu času, barvy příčin pro mapu příčin, *málo kol ↔ nejvíc kol* pro mapu chyb |
| **Projeté stopy** | zapnuto | čára každého viditelného kola v jeho barvě |
| **Vozy** | zapnuto | vozy a zdroje karet HUD |
| **Pneumatiky a odpružení** | zapnuto | teplota pneumatik, kroužky prokluzu, tyče odpružení a další symboly u jednotlivých kol, a na vozech střešní světla |
| **Popisky** | zapnuto | názvy zatáček, číslované štítky, popisky nárazů, popisky zatáček na mapě chyb |
| **Trať z kol** | zapnuto | povrch vozovky pro tratě bez vytaženého modelu (skryto, když je načten model tratě) |
| **Všechny hodnoty na kartách** | vypnuto | každý kanál vypsaný na každé kartě HUD |
| **Skutečné tvary aut** | zapnuto | každý vůz v tvaru svého protějšku (viz [Vozy](#the-cars)). Vypnuto: otevřený jednomístný vůz, který nic z telemetrie neskrývá |
| **Velikost vozů** | 1× | 1× až 10× po krocích 0,5. 1× je skutečná velikost vozu, tak dlouhý a široký, jak je ve hře. Nic jiného ji nemění než tento posuvník |

## Projeté stopy {#driven-lines}

Dráha každého viditelného kola přes vlastní vzorky, v jeho barvě, kreslená 0,12 m pod zaznamenanou pozicí. Zaznamenaná pozice vozu je jeho vztažný bod, 0,28 až 0,47 m nad vozovkou u vytažených tratí Forzy. Bod se bere každých 1,5 m. Když je viditelných více než 10 kol, kola, na která se nehledí, drží jeden bod každých 6 m. Každý vrchol jde na grafickou kartu v každém snímku.

## Mapy {#the-maps}

Všechny tři jsou pásy podél dráhy **reference**, 0,2 m pod zaznamenanými pozicemi, jeden čtyřúhelník na každý krok mřížky po 2 m.

### Mapa času (`where`) {#time-map-where}

Pro zaměřené kolo: sekundy získané nebo ztracené na metr proti kolu, s nímž se v tom místě porovnává (nejlepšímu ve své třídě, nebo u reference nejrychlejšímu jinému kolu v každém úseku). Počítá se ze změny zarovnané delty na každý krok mřížky, vyhlazené přes ±10 m. Červeně tam, kde se ztrácí čas, zeleně tam, kde se získává, šedě mezi tím. Barevná škála je 95. percentil absolutních hodnot, takže špičky se oříznou a většina kola je v rozsahu. Šířka 6 m.

### Mapa příčin (`why`) {#cause-map-why}

Pro zaměřené kolo: každá ztráta se maluje přes rozsah, kde je její **příčina** (ne tam, kde se čas ukazuje). Barva podle skupiny příčiny, a když se dva překrývají, vyhrává nejdražší nález. Šířka `3 + 9·√(cena / největší cena)` metrů. Tam, kde se nic neztratilo, šedý pás 2 m. Nález vybraný v *Kde se zlepšit* je namalován bíle.

| Skupina | Barva | Nálezy |
|---|---|---|
| brzdění | oranžová | ztráty řidiče ve fázi brzdění |
| vjezd | purpurová | ztráty řidiče na vjezdu a středem |
| výjezd | modrá | ztráty řidiče na výjezdu |
| rovinka | žlutá | ztráty řidiče na rovince |
| vůz | šedá | co vysvětluje vůz |
| okolnosti | tmavě šedá | situace (start závodu proti letmému kolu) |

### Mapa chyb {#mistake-map}

Kolik ze všech kol (z tříd vybraných ve statistikách tratě) udělalo chybu na každém metru: chybu libovolného druhu, nebo jen toho, který je vybrán ve statistikách. Každé kolo se počítá jednou na metr. Rozsah každé chyby se rozšíří o 6 m na každou stranu, aby se i krátká ukázala. Šířka `3 + 10·(kola / nejvíc kol)` metrů a barva od tlumené hnědé po jasně oranžovou. Šedé 2 m tam, kde žádné kolo chybu neudělalo. Viz [Statistiky tratě](race-course-statistics.md#the-mistake-map).

## Trať z kol {#track-from-the-laps}

U hry, jejíž tratě nebyly vytaženy, se pod čárami kreslí silnice. Je tak široká, jak se kola rozprostírají přes referenci (počítají se boční odchylky do 25 m), plus 2 m na každou stranu, nejméně 4 m na každou stranu od referenční čáry. Vyhlazeno přes ±8 bodů mřížky (±16 m), v šedé barvě asfaltu se světlými okrajovými čarami, 0,3 m pod zaznamenanými pozicemi. Skryto, když je v **Úrovni** načten model tratě.

## Nárazy a nehody na trati {#hits-and-crashes-on-the-track}

Nárazy a nehody každého viditelného kola (viz [Události ovládání vozu](race-control-events.md#hits-and-crashes)) jsou označeny tam, kde se staly, kdykoli se kreslí čáry nebo vozy. Je to hvězda s hroty, červená pro nehodu a jantarová pro náraz, stojící na sloupku, s kroužkem v barvě kola u paty. Velikost se řídí velikostí vozu, nehody jsou větší. Jakmile vůz projede okamžikem nárazu, z něj se 0,8 s šíří nárazový kruh.

## Režim nápovědy {#help-mode}

**?** vedle výběru jazyka, nebo klávesa **?** či **F1**, zapne klíč ke každé barvě na obrazovce, na všech třech záložkách ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Volba zůstane v tomto prohlížeči.

- **Klíč** v rohu zobrazení vypíše barvy pro záložku a režim, které se právě používají. Každá škála pochází z místa, odkud ji zobrazení bere. Tepelná škála, kterou jste upravili, se tedy ukáže jako upravená. Na záložce závodu se vypíše jen to, co načtená kola nesou.
- **Karta každého vozu** dostane tabulku toho, co je kresleno na jeho kolech, podle názvu, s hodnotou každého kola v barvě, ve které je kreslena.
- **Vůz v zaměření** dostane popisek u každého kola se stejným obsahem, umístěný ven k rohům. Skryto, když je vůz na obrazovce příliš malý, aby se do něj vešly.

## Vozy {#the-cars}

**Každý vůz ve vlastním tvaru**, v barvě svého kola a ve skutečné velikosti. Tvary pocházejí ze souboru s vozy, který se vytvoří jednou na počítači, kde je hra:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Bez něj se každý vůz kreslí jako **vlastní vůz prohlížeče** svého druhu a éry: sedan, kupé, hatchback, kombi, sportovní vůz, supervůz, muscle car, terénní vůz, pickup, dodávka nebo mikrovůz. Každý je klasický (před rokem 1980), z 80. a 90. let, nebo moderní ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Ty se sestavují tady z obecných proporcí: žádná loga, žádné názvy modelů a nic ze souborů žádné hry, takže jsou součástí prohlížeče. Druh se bere z názvu vozu, éra z roku v něm. Vůz, který nemá ani jedno, se bere podle třídy. Zná se asi sto skutečných generací podle jejich zveřejněné délky, šířky, výšky a rozvoru ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts), řádek na každou, zaokrouhleno). Takže 3 series z 90. let dostane velikost a postoj toho vozu, ale stále jako prostý tvar bez znaku nebo masky.

Soubor s vozy se vytvoří na vašem vlastním počítači z vaší vlastní kopie hry. Drží model každého vozu v nízkém detailu, asi 900 trojúhelníků, s polohami kol (viz [příkaz `cars` extraktoru](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Načíst soubor s auty…** v nastavení zobrazení, nebo přetažení souboru na záložku závodu, ho načte. Zůstává v tomto prohlížeči. Drží tvary hry, takže se nemá předávat dál, a prohlížeč žádné nedodává.

Který vůz zastupuje vůz kola, se určuje z toho, co je načteno, pokaždé znovu. Nikdy se neukládá. Vůz, který dnes nemá protějšek, dostane vlastní, jakmile novější soubor ho bude mít ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Vůz kola | Kreslen jako |
|---|---|
| jeho číslo je v souboru pro tutéž hru | ten přesný vůz |
| stejná značka a slovo modelu v názvu | ten model, nejblíž v letech |
| stejná značka, stejná generace | vůz té značky nejblíž v letech |
| cokoli jiného, se souborem s vozy | nejbližší vůz téže značky, pokud existuje, jinak stejný druh karoserie, nejblíž v letech |
| otevřený vůz, podle názvu | jednomístný vůz níže |
| ani jedno z prvních dvou, a prohlížeč zná vůz podle velikosti | vlastní vůz prohlížeče ve skutečné velikosti toho vozu, se souborem nebo bez něj |
| cokoli jiného bez souboru | vlastní vůz prohlížeče toho druhu a éry |

Takže kolo z jiné hry, BMW 3 series z roku 1990, ukáže BMW zhruba z toho roku. Vůz novější než soubor ukáže svého nejbližšího příbuzného, dokud se soubor znovu nevytvoří. Popisek kola a řádek pod velikostí vozu u zaměřeného kola říkají, jak je vůz kreslen a jak blízko je to ke skutečnosti.

Vlastní vozy prohlížeče mají tmavá okna. Modely ze souboru s vozy jsou jednobarevné, protože soubor nemá barvu ani sklo, podle čeho by se řídil. Kola, zadní světla, světlomety a symboly telemetrie jsou kresleny jako u jednomístného vozu. Tyč odpružení vede po vnější straně kola, kde je vidět, a trojúhelníková ramena se vynechávají.

**Jednomístný vůz** je otevřenokolý vůz v barvě kola, takže přední část je zřejmá z každého úhlu a nic nezakrývá kola. Skelet, kryt motoru, boční nádrže, kokpit s přilbou, halo, podlaha, přední a zadní křídlo; čtyři kulatá kola, přední natočená řízením (až 0,5 rad při plném vytočení), každé na dvou trojúhelníkových ramenech s nábojem, spojovací tyčí (vpředu) nebo hnací hřídelí (vzadu) a tyčí odpružení. Model je spuštěn o 0,3 m pod zaznamenanou pozici, aby kola stála na silnici, a škáluje se podle **Velikosti vozů**.

**Karoserie se pohybuje na svých pružinách.** Když kolo nese všechny čtyři zdvihy odpružení, každý roh klesne o svůj zdvih. Zveličeno je to na 0,12 m od plného odlehčení po plné stlačení, aby to bylo vidět z kamery za vozem. Karoserie se propadá, naklání a kolébá v rovině procházející všemi čtyřmi.

**Co se kreslí z telemetrie** (při zapnutých *Pneumatikách a odpružení*) se řídí [tabulkou kanálů](race-charts-and-hud.md#the-channel-table):

| Symbol | Z čeho | Vykreslení |
|---|---|---|
| barva pneumatiky | `tireTemp` | samotná pneumatika, modrá studená → azurová → zelená pracovní → žlutá → červená horká, v rozsahu 40–130 °C |
| kroužek prokluzu | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (největší) | kroužek na zemi pod kolem: zelený s přilnavostí v rezervě, jantarový při 0,66, červený při 1 (okraj přilnavosti, jak ji hlásí hra). Slabý pod 0,3 |
| pruh odpružení | `suspension` (0..1) | tyč odpružení obarvená podle zdvihu: modrá vysunutá, bílá uprostřed, červená stlačená |
| záře brzdy | `brakeTemp` (100–900 °C) | kotouč na vnější straně kola, tmavý až oranžový |
| pás opotřebení | `tireWear` (0..1) | pás kolem okraje běhounu, bílý nová → červený opotřebená |
| pruh zatížení | `wheelLoad` (0–12 000 N) | sloupek vedle kola, vysoký jako zatížení |

Brzdová světla (světlo deště a koncovky křídla) svítí se pedálem brzdy. Každý kanál `lamp`, který je zapnutý (nad polovinou svého rozsahu), rozsvítí světlo nad sacím kolektorem ve své barvě: ABS v činnosti, trakční kontrola v činnosti, DRS, omezovač pitu, ruční brzda, ve vzduchu.

**V davu** (více než 10 viditelných) se vozy, na které se nehledí, kreslí prostě: karoserie, křídla, kola a brzdové světlo.

## Popisky {#labels}

Připnuté k trati a umísťované v každém snímku podle projekce kamery (mimo obrazovku nebo za kamerou se skryjí). S zapnutými **Popisky**:

| Popisek | Kde | Klik |
|---|---|---|
| názvy zatáček (`T1`, `T2` …) | nad apexem každé zatáčky na referenci | - |
| číslované štítky 1–5 | pět největších ztrát řidiče zaměřeného kola, uprostřed rozsahu každé příčiny, orámované barvou příčiny; najetím název a cena | seřadit a přehrát ten nález |
| popisky nárazů a nehod | nad každým výbuchem **zaměřeného** kola: „Nehoda −45 km/h“ / „Náraz −12 km/h“; najetím celý popis a rada | seřadit a přehrát náraz |
| popisky zatáček na mapě chyb (místo názvů zatáček a štítků, když je mapou mapa chyb) | u apexu každé zatáčky: „T3 · 5/40 brzdění brzy“ (nejčastější chyba, kola, která ji udělala / kola, která zatáčkou projela), „T3 · 5/40“, když je vybrán jeden druh, „T3 · čistě“, když žádný; najetím ztráty zatáčky a její pět nejčastějších chyb | otevřít nebo zavřít tu zatáčku ve statistikách tratě |

## Zrcadlené světy {#mirrored-worlds}

Svět prohlížeče je pravotočivý s osou Y nahoru: při pohledu shora vůz, jehož směr jízdy `atan2(dx, dz)` roste, zatáčí doleva. Hra s levotočivým světem (mezi nimi Forza) se zobrazí zrcadlově. Každá zatáčka doprava se nakreslí jako zatáčka doleva, trať i kola stejně.

Kola to sama říkají ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)). Prochází se každé kolo po několika metrech (3 m) a stáčení jeho dráhy se porovnává se stlačením vnějšího odpružení (`suspension.FR` minus `suspension.FL`). Bez odpružení se porovnává s řízením (kladné doprava u každého adaptéru). Kolo, které se v součtu natočí o méně než π, nic neříká. Důkaz se počítá, když přesáhne 2 % natočení. Kola hlasují. Remíza je „nelze určit“.

Když se verdikt kol neshoduje s aktuální inverzí os (lichý počet převrácených os v **Kamera a scéna → Převrátit osu světa**), oddíl **Kola** to pod seznamem řekne:

- hra je zrcadlená a nic není převráceno: „Tato kola řídí doprava, kde se tratě kreslí doleva …“ s **Převrátit X**;
- osy jsou převrácené, ale kola nejsou zrcadlená: „Převrácené osy kreslí tato kola zrcadlově …“ s **Obnovit osy**.

Mění se jen kreslení, a to zrcadlení vložené do matice pohledu. Data, analýza a každá souřadnice, kterou nástroje ukazují, zůstávají takové, jaké je poslala hra. Inverze se uchovává v prohlížeči. Analýza pojmenovává zatáčky doleva nebo doprava stejným měřením. Neznámý svět se bere jako zrcadlený, jako Forzin.

## Pro vývojáře {#for-developers}

Kód: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Co je vůz v daném okamžiku {#what-a-car-is-at-a-moment}

`stateAt` interpoluje každý kanál mezi dvěma vzorky kolem času kola. Kanály, které skáčou (rychlostní stupeň, vlajky), berou nejbližší vzorek. Kolo, které skončilo, zaparkuje na čáře.

**Směr.** Směr jízdy se bere z pozic několik metrů od sebe (aspoň 2 m na každou stranu, aby zakolísání nezatočilo vozem). Směr karoserie se bere z natočení hry (yaw) teprve tehdy, když je přiložen ke směru jízdy: znaménko a posun, kruhovým průměrem přes vzorky rychlejší než 10 m/s (aspoň 20). A jen tehdy, když pak souhlasí (kruhový rozptyl pod 0,05, asi 18° rozptylu). Jinak karoserie míří podél směru jízdy. Tak zůstane smyk vidět (karoserie a směr jsou od sebe), aniž by se musela věřit úhlové konvenci hry.

**Řízení a strany.** Na které straně kladné řízení natáčí vůz a ke které straně herních pravých kol patří, se měří z kola. Měří se řízení proti stáčení dráhy a to, která strana odpružení se stlačuje na vnější straně zatáček. Bez dat o odpružení se hry Forza berou jako zrcadlené.
