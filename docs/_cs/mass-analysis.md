---
title: "Hromadná analýza"
nav_order: 8
lang: "cs"
source: "mass-analysis.md"
source_hash: "e65b729b5928"
translated: true
outdated: false
---

# Hromadná analýza: tisíce zápasů najednou

**Hromadná analýza** ukáže, co vyjde ze celé složky zápasů: který vůz vyhrává nejčastěji, která strana je zvýhodněna, kde se odehrává dění. Použijte ji, když máte mnohem víc zápasů, než byste stihli sledovat.

Pracuje z malého souhrnu každého zápasu, takže se tisíc nebo deset tisíc zápasů otevře rychle. Úplné řádky načte jen pro zápasy, na které kliknete.

## Vyzkoušejte to {#try-it}

1. Otevřete **Hromadnou analýzu** v postranním panelu Teplotní mapy.
2. Stiskněte **Složka…** (nebo **Soubory…**) a vyberte své zápasy `.3dheat`.
3. Počkejte, než panel načte souhrny („Souhrny… n z N“).
4. Stiskněte **Otevřít analýzu**. Otevře se okno s kartami.
5. Nastavte filtry (Hra, Mapa, Režim, Z, Do) a přečtěte kartu, například Vyváženost.
6. Klikněte na řádek, buňku nebo zjištění: jeho zápasy se načtou do 3D pohledu s kamerou na daném místě.

![Karta Vyváženost: míra výher a zabití na smrt podle vozidla](../assets/img/en/mass-balance.webp)

```
složka .3dheat -> souhrny -> okno (karty) -> klik na řádek -> zápasy se otevřou v 3D
```

Soubor `.3dheat` je jeden zápas ([Jeden soubor na zápas](container.md)). *Teplotní mapa* a *řádek* jsou vysvětleny ve [slovníčku](glossary.md).

## Získání souhrnů {#getting-the-summaries}

Většina lidí nemusí nic dělat: panel si chybějící souhrny dopočítá sám. Chcete-li jednou předem připravit velkou složku, použijte níže uvedený nástroj offline.

Každý zápas `.3dheat` dostane souhrn (`src/mass/summarize.ts`), uložený v kontejneru jako člen `<match>.summary.json` (role `summary`, viz [Jeden soubor na zápas](container.md)). Nástroj offline je zapíše a vytvoří index pro každou složku. Je to nástroj pro vývojáře; spusťte ho na velké složce, aby panel nemusel dělat tu práci:

```
node tools/3dheat-summarize.mjs <složka>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Zápas, který je už shrnutý (stejná verze formátu), se jen přečte; `--force` ho přepočítá. `--no-write` nechá kontejnery beze změny.
- Soubor změněný za posledních `--settle` minut (10) se vynechá: převodník ho možná ještě zapisuje.
- `<složka>/3dheat-index.jsonl.gz`: jeden řádek na zápas – jeho cesta, velikost, čas a souhrn bez mřížky. `<složka>/3dheat-index.grids.jsonl.gz`: jeden řádek na zápas s jeho mřížkou.
- Spusťte ho na počítači, který soubory drží, s nízkou prioritou (například `nice -n 19 ionice -c3` na Linuxu).

Panel vezme pro každý zápas první z možností: řádek indexu složky (stejná cesta a velikost), mezipaměť prohlížeče (IndexedDB, podle názvu, velikosti a času), člen `summary` v kontejneru, nebo souhrn spočítaný v bazénu pracovních procesů a uložený do mezipaměti. Složka bez indexu tedy také funguje: poprvé rychlostí čtení tabulek, potom z mezipaměti.

## Panel {#the-panel}

Vyberte složku (nebo soubory; **Přidat složku…** připojí další). Okno má filtry **Hra**, **Mapa**, **Režim**, **Z** a **Do**, volbu **Rozdělit podle**, **Nejméně životů** a **Jen hráči** a tyto karty. Každé číslo pochází ze souhrnů. Klik na řádek, buňku nebo zjištění načte jeho zápasy do pohledu jako překryv mnoha zápasů s filtry, které to ukazují (vozidlo, třída, zbraň, tým, hráč), a kamera je na daném místě:

| Karta | Co obsahuje |
|---|---|
| Přehled | zápasy, hodiny, hráči, životy, řádky, data; zápasy za den; podle hry, mapy, režimu; součty událostí; ekonomika podle měny; kdy během zápasu se věci dějí |
| Vyváženost | podle vozidla, třídy, zbraně nebo týmu, rozděleno podle mapy, režimu, úrovně nebo hry: K/D s jeho intervalem ~95 %, míra výher (Wilson), přežití, zabití a zásahy za minutu, výdělek za minutu, a q – míra falešných objevů Benjamini-Hochberga pro K/D a výhru proti zbytku rozdělení. **Nejméně životů** skryje řádky s málo životy, aby se daly věřit; **Jen hráči** vynechá, co řídila AI mise |
| Trendy | použití (podíl na přítomnosti), K/D nebo míra výher nejlepších vozidel nebo tříd za den, týden nebo měsíc |
| Hráči | různí hráči, zápasy na hráče, hráči na zápas, nejčastější hráči |
| Strany | každá strana každé mapy: zápasy vyhrané oproti rovnoměrnému rozdělení |
| Boj zblízka | data z kol: otevírací souboje podle strany a jejich přeměna, výměny, hráč na pozici proti držiteli, křížová palba, vstupy po zábleskech, míření, zakládání (plants), převaha v počtu a, **Podle mapy**, místa, která zabíjejí hráče, kteří do nich vstupují – každé jako podíl s jeho intervalem Wilson, z počtů `cqb` v souhrnech ([Boj zblízka a kola](close-quarters.md)) |
| Povrchy R6 | stopy Rainbow Six Siege na úrovni (díry po kulkách a podobně) podle povrchu úrovně: stopy, na kolo mapy, místnost, podíl s určeným střelcem; kliknutí otevře druhy stop, operátory a třídy zbraní střelců a to, kde na povrchu stopy jsou (malá teplotní mapa z buněk po čtvrt metru); povrch si drží své id napříč zápasy jedné verze mapy. Z počtů `marks` v souhrnech |
| Mapa | sečtená mřížka mapy: přítomnost, zabití, smrti, K/D, libovolná událost, tok a **horká v kolika zápasech** (stabilita); podle týmu, při 1, 2, 4 nebo 8násobku buňky |
| Místa | místa, která vynikají v číslech, ale ne v teplotní mapě (velká oblast, která je celkově rušná, koridory, výškové pásy), a místa, jejichž držitelé vyhrávají víc nebo méně svých kol; **Najít místa** |
| Niky | skupiny, které si vedou výrazně lépe nebo hůře než zbytek (vozidlo na jedné mapě, sektor v jedné výšce), a skupiny kol vyhraných nad to, co jejich strana vyhrála ve stejných zápasech; **Najít niky** |
| Zjištění | detektory přes mnoho zápasů a detektory map (níže); **Kopírovat zprávu (JSON)** dá JSON, který čte jazykový model |

## Zjištění přes mnoho zápasů {#insights-over-many-matches}

Karta **Místa** najde místa, která vynikají v číslech, ale ne v teplotní mapě: velkou oblast, která je celkově rušná, koridor, výškový pás, místo rušné jen v jedné části zápasu. Ta místa, která prostý tepelný obraz neukazuje, označí jako **skrytá** a obrysuje je v 3D pohledu. **Načíst** tam přeletí se zápasy, které v sobě drželo. Karta **Niky** najde skupiny (vozidlo na jedné mapě a straně, sektor v jedné výšce), které si vedou výrazně lépe nebo hůře než zbytek; kliknutím na jednu uvidíte její zpřesnění.

### Kdo vyhrál {#who-won}

Kde zápasy říkají, kdo vyhrál každé kolo ([sloupec výsledku](data-formats.md#outcome-columns) `won`), je výsledek samostatným cílem:

- **Místa: podíl výher.** Pro každou stranu podíl jejích kol na místě, která vyhrála, oproti podílu, který vyhrála kdekoli ve stejném zápase – takže vyváženost mapy, strany i samotného zápasu je základ, a vyniknou jen místa, jejichž držitelé vyhrávají víc (nebo méně) svých kol. Vymyšlený příklad: *„Dust: strana T vyhrává víc svých kol, když je tady: 61 % z 412 vyhraných, oproti 49 % očekávaným podle jejího vlastního podílu ve stejných zápasech (šance 1,6x; drženo v 31/48 zápasech).“* Stejná míra falešných objevů a stejné kontroly stability jako u každého místa; **Načíst** načte zápasy, ve kterých bylo drženo, a ukáže pozice té strany.
- **Niky: výhra kola.** Tabulka **Kola** obsahuje kolo každého života: mapu, stranu, část zápasu (kola 1–4, 5–8, ...), vozidlo (operátor, agent), zbraň, kterou použil nejvíc, místo, které držel nejdéle, nákup (eco, force, full) a to, zda jeho strana získala první zabití. Skupina se posuzuje podle toho, co její strana vyhrála ve stejných zápasech, takže *T na Dust s AWP* je nika jen tehdy, když se tato kola vyhrávala častěji než ostatní kola T v těch zápasech. Vymyšlený příklad: *„m1 · T · AWP: vyhrává 80 % z 320 kol, oproti 62 % očekávaným od stejných stran ve stejných zápasech (šance 2,3x; 40 zápasů).“* Řazeno podle nárůstu krát podpora; **Načíst** načte zápasy, jejichž kola to ukazují nejvíc.

Obojí potřebuje souhrny verze 2 (viz [Získání souhrnů](#getting-the-summaries)): starší se spočítají znovu.

Karta **Zjištění** najde přes všechny zápasy vozidla, která se vymění nebo vyhrají lépe či hůře než zbytek, místa horká v pravidelném podílu zápasů, strany, které vyhrávají víc než rovnoměrné rozdělení, vozidla, jejichž použití se mění s daty, a části zápasu, které drží víc zabití, než by byla rovnoměrně rozložena. Každé zjištění nese své počty, účinek, interval a míru falešných objevů (držená na 5 %). Klik načte jeho zápasy. Podrobnosti: [Pro vývojáře](#for-developers).

## Velikost {#scale}

Malou verzi tohoto můžete zkusit sami: `node tools/demo-data.mjs` zapíše 150 syntetických tankových zápasů do `tools/.shots/demo/mass` (asi 1 000 řádků na zápas). Změřeno na těchto 150 syntetických ukázkových zápasech z `tools/demo-data.mjs` na stolním počítači (skutečný zápas je mnohem větší):

- `tools/3dheat-summarize.mjs` se 4 pracovními procesy: 2,6 až 4,8 s pro všech 150, 8 až 21 ms na zápas uvnitř pracovního procesu; druhé spuštění, které jen čte souhrny, trvá asi 2 s.
- Otevření složky v panelu, když je index přítomen, dokud okno nic nezobrazí: 0,9 až 1,6 s (vlastní část pracovního procesu, čtení 150 řádků indexu, je 20 až 40 ms).
- Přepnutí karty, dokud se její tabulka nevykreslí: Přehled 10 až 30 ms, Vyváženost 30 až 70 ms, Trendy 30 až 45 ms, Hráči 15 až 35 ms, Strany 15 až 20 ms, Mapa 55 až 130 ms.
- Úložiště drží 150 zápasů asi na 0,5 MB.

Otevření okna zabere jeden krátký snímek: vybrané soubory jdou do pracovního procesu po 16, datová pole a první karta se objeví o snímek později.

Úložiště drží asi 15 KB na zápas, takže 10 000 zápasů zabere ~150 MB v pracovním procesu; mřížky se nikdy nedrží déle, než jak dlouho je potřebuje mapa.

## Pro vývojáře {#for-developers}

### Zjištění přes mnoho zápasů {#insights-over-many-matches}

`src/mass/detect.ts` – každé zjištění s jeho počty, účinkem a intervalem, p a q (Benjamini-Hochberg přes všechno, co detektor zkusil, držené na 5 %), postup, který načte jeho zápasy, a klíč věty s jeho hodnotami. Zpráva (`heat3d.mass/1`) je to, co `massReportForModel` předá vypravěči, ve stejném tvaru jako zpráva z jednoho zápasu (`insights/seam.ts`).

| Detektor | Najde |
|---|---|
| `balance` | vozidlo hráče, které se vymění nebo vyhrává lépe či hůře než zbytek na mapě nebo v režimu |
| `hotspot` | místa horká v pravidelném podílu zápasů, které přišly (horké zápasy / viděné zápasy, proti ostatním buňkám mapy) – ne jen horká v součtu |
| `side` | strana mapy, která vyhrává víc než rovnoměrné rozdělení |
| `meta` | podíl vozidla na životech hráčů nebo jeho K/D, které se mezi dřívější a pozdější polovinou dat pohnou – dost velké na to, aby to mělo význam, trend přes čtvrtletí, stejným směrem na většině map (níže) |
| `phase` | část délky zápasu, která drží víc zabití, zásahů, startů... než rovnoměrné rozložení |
| `place` | místa, která vynikají přes mnoho zápasů (Fáze B, níže): míra oblasti nebo podíl zabití proti každému zápasu zvlášť, kruhy, koridory, rostoucí zóny, výškové pásy, fáze; skryté, když je prostá teplotní mapa neukazuje |
| `niche` | skupiny, které si vedou výrazně lépe nebo hůře (Fáze B, níže) |
| `grid.*` | detektory jedné datové sady (pozice síly, horké a klidné zóny, místa tříd) na sečtených mřížkách každé mapy: `GridMerge.toInsightJob` naplní mřížky průchodu zjištění ze souhrnů; detektory, které potřebují stopy, přeskočí |

### Souhrn {#the-summary}

Prostý JSON (`src/mass/types.ts`), asi 5 až 30 KB komprimovaně na zápas:

- zápas: hra, mapa, režim, mise, začátek, délka, řádky, životy, hráči, AI, týmy (životy, hráči, přítomnost, zabití, smrti, výhra, peníze), vítěz;
- na vozidlo a tým: třída, úroveň, životy, životy hráčů, přítomnost, události podle kanonického druhu, zabití podle třídy cíle, výhry, peníze;
- na hráče (podle uživatelského ID, jinak podle jména): tým, životy, přítomnost, zabití, smrti, zásahy, starty, výhry, vozidla; na zbraň: události podle druhu;
- se sloupcem výsledku (verze 2): vyhraná a odehraná kola podle týmu, vozidla (`rw`,
  vždy jeden život a jedno kolo), hráče a zbraně (kola, ve kterých ji strana použila);
  kolo každého života (`outcome.u`: kolo, strana, vozidlo, nejpoužívanější zbraň, nejdéle
  držené místo, nákup, výhra) a číslo, vítěz a strana prvního zabití každého kola
  (`outcome.r`);

- sloupce ekonomiky (`cost_*`, `earn_*`) a jejich součty;
- fáze: události podle druhu ve 20 pásech délky zápasu a podle minuty;
- chování: měření kolektivního chování zápasu (shoda, stádní chování podle trasy, pruhy, shlukování, vůdci, opozdilci, bod zlomu, riziko po ztrátách, série, shoda na nákupech, potlačení), každé se svým vlastním nulovým modelem, p a q – viz [Kolektivní chování](collective-behaviour.md);
- mřížka (níže).

Počítáno tak, jak to počítá divák: sloupce se hledají tak, jak je najde načítač mnoha zápasů (`leanSpec`), události podle `data/canonical.ts`; zabití, které Tacview zbraň započítá, se přičte jejímu střelci; smrt řečená dvakrát najednou (`dead`, `death`) se počítá jednou.

#### Mřížka: na čem staví Fáze B {#the-grid-what-stage-b-builds-on}

Prostorová část je udělána pro statistiky skenování oblastí libovolné velikosti a tvaru, ne jen pro tepelné obrazy:

- **Pyramida.** Buňky jsou zarovnané mocniny dvou ve světových jednotkách (x, z tak, jak je divák umisťuje). Úroveň `k` je součet buněk `ix >> k, iz >> k` – přesný, uvnitř zápasu i napříč zápasy jiných velikostí buněk – a každá oblast (obdélník, koridor podél čáry, prstenec) je součtem buněk. Nejjemnější úroveň se vejde do robustního rozsahu zápasu (buňky, které drží 99 % přítomnosti) do 128 buněk; zatoulané mimo něj se ponechají.
- **Expozice vedle každého počtu.** Sekundy přítomnosti na buňku, na tým (`pt`), na třídu vozidla (`pc`) a na výškový pás (`ph`), takže míra, očekávání a poměr oblasti se spočítají pro libovolnou podskupinu.
- **Výška.** Pásy nad podlahou zápasu (1. percentil výšky): pod 3 m, 3–10, 10–30, 30–100, 100–300, 300–1000, 1000–3000, nad; soubor se sloupcem `floor`/`storey`/`deck` se pásmuje podle svých podlaží. `y` je průměrná výška každé buňky, `y0` její nejnižší bod (její podlaží, pro výšku nad ním).
- **Události** jako n-tice `[buňka, druh, tým, třída, pás, počet]`.
- **Kola podle výsledku** (verze 2, se sloupcem výsledku a dvěma nebo více koly):
  `pw` jako `[cell, team, rounds won, rounds lost]` – kola, ve kterých každá strana strávila
  v buňce sekundu nebo víc, podle jejího výsledku v kole.
- **Časové řezy** na hrubé úrovni (8 buněk na stranu), podle minuty od začátku zápasu: `[cx, cz, minuta, druh, hodnota]`, sekundy přítomnosti jako druh `GRID_KINDS.length`; fáze zápasu jsou minuty z délky.
- Řídké, počty celá čísla, sekundy na desetinu: omezeno tím, co se stalo.

### Fáze B: místa a niky {#stage-b-places-and-niches}

Fáze B hledá to, co v číslech vyniká, aniž by to upoutalo oko: velkou oblast, která je celkově rušná, bez horké buňky uvnitř; zvláštní poměr zabití a smrtí na málo událostech; koridor; výškový pás; shluk, který je tam jen v jedné části zápasu – a skupiny (vozidlo na jedné mapě na jedné straně, sektor v jedné výšce), které si vedou výrazně lépe nebo hůře než zbytek. Jedno tlačítko **Najít místa** / **Najít niky** / **Najít zjištění** spustí všechny detektory; tři karty sdílejí tutéž zprávu.

#### Místa (`src/mass/scan.ts`) {#places-srcmassscants}

Zápasy každé mapy se čtou dvakrát, jeden zápas po druhém. Paměť drží součty na rastru nejvýš 64 buněk na stranu (16 pro prostor-čas skenování), nikdy ne zápasy.

- **Míry.** Míra události na sekundu přítomnosti – zabití, smrti, zásahy, starty, zajetí, u všech jednotek, na třídu (4 s nejvíce událostmi), na výškový pás – a podíl zabití na zabitích a smrtích (všech, na stranu, na pás), a **podíl výher** každé strany: její kola v buňce vyhraná oproti prohraným (`pw`), kde 8 a více zápasů mapy počítá kola podle výsledku. Které třídy a strany se berou, určují hlavičky (`planOf`).
- **Očekávání podle zápasu.** Míra každého zápasu zvlášť, rozložená přes jeho vlastní přítomnost v buňce, je očekávání buňky (Kulldorffovo skenování upravené o kovariáty, stratifikované podle zápasu): několik krvavých zápasů nebo jeden přeplněný server nevytvoří žádné místo. Pro podíl výher je očekáváním vlastní podíl vyhraných kol strany v daném zápase, takže vyváženost mapy a strany nikdy není místem. Kolo ve více buňkách oblasti se počítá v každé z nich; rozptyl měřený ve velikosti oblasti to zohledňuje.
- **Rozptýlení.** Zápasy se od Poissona liší daleko víc. Rezidua každého zápasu se sečtou v blocích 1, 2, 4, 8, 16 buněk; rozptýlení každé velikosti bloku (čtverce reziduí / rozptyl při nulové hypotéze, sdružené, nejhorších 5 % bloků vynecháno) škáluje každý test oblasti té velikosti: poměr věrohodnosti kvazi, pro míry Poisson, pro podíly binomický.
- **Oblasti.** Kruhy o 0,75 až 18 buňkách; elipsy pod šesti úhly, 3 a 6krát delší než široké, 3 až 18 buněk (koridory; osa je `place.path` zjištění); zóny rostoucí po buňkách od nejsilnějších lokálních buněk Getis-Ord Gi\*, dokud roste výsledek oblasti (nepravidelné tvary) – rostou na jedné polovině zápasů a testují se na druhé, takže volnost růstu nestojí žádné falešné místo; každý výškový pás proti ostatním pásům zápasu přes celou mapu (robustní vůči shlukům); prostor-časové válce: kruh v jedné nebo dvou pětinách délky zápasu, proti vlastnímu rozptylu událostí zápasu v místě a čase (permutační skenování prostor-čas).
- **Testování.** p z kvazi věrohodnosti; Benjamini-Hochberg přes každou oblast zkoušenou na každé mapě (700 000 na třech mapách je obvyklé) na 5 %. Co projde, se pročistí (oblast z větší části uvnitř silnější oblasti stejné míry říká totéž), znovu se přečte pro svou **stabilitu** – zápasy, které ji viděly, zápasy, které ji držely, její směr v pěti foldech zápasů – a otestuje se ještě jednou při rozptylu, který samy zápasy ukazují (robustní vůči shlukům, zápasy jako shluky, nikdy ne pod Poissonem), znovu BH. Klidná místa na základně (2 % a víc spawnů, vzletů a přistání mapy) se vynechají.
- **Účinek.** Poměr míry (nebo šancí), smrštěný empirickým Bayesem (gama prior přizpůsobený 2×2 blokům mapy), s intervalem ~95 % při rozptylu; Gi\* na 1, 2 a 4 buňkách a lokální Moran ve středu.
- **Vizuální zřejmost.** Kolik oblast už ukazuje v prosté teplotní mapě jejího události (logaritmická stupnice k nejjasnější buňce, jak je pohledy kreslí): její kontrast s prstencem kolem ní (desetina palety se špatně vidí, dvě pětiny prostě) a jasný vrchol nesoucí přebytek; poměr teplotní mapa nikdy nekreslí, takže se počítá za polovinu. Pod 35 % je **skryté**. Pořadí: síla (účinek nasycený na 4násobku, klidná místa na 0,7) krát `1 - 0,7 × zřejmost` krát shoda foldů.

Karta **Místa** je vypíše (ve výchozím nastavení jen skrytá; podle mapy, tvaru, směru); klik obrysuje místa mapy v 3D pohledu (`placeLines.ts`: horní čáry enginu, postavené jednou – magenta skrytá, jantarová prostá, azurová klidná, vybraná celá; výškový pás jako krabice od podlahy ke stropu) a na plátně karty Mapa; **Načíst** tam přeletí a načte 60 zápasů, které v sobě drželo nejvíc, vyfiltrované na jeho událost (a třídu).

#### Niky (`src/mass/niche.ts`) {#niches-srcmassnichets}

Beam search (šířka 24, hloubka 3) přes tři tabulky: **životy** (životy hráčů: hra, mapa, režim, třída, vozidlo, strana, úroveň, čtvrtletí dat, třetina délek zápasů; K/D, výhra, smrt jako život, zabití za hodinu, výdělek za minutu), **místa** (zabití a smrti podle mapy, režimu, dat, sektoru mapy 4 × 4, třídy, strany, pásu) a **fáze** (sektor a pětina zápasu: K/D, smrti za hodinu přítomnosti). Skupina se testuje proti celku se zápasy jako shluky (sendvičový rozptyl jejích reziduí podle zápasu), její účinek je poměr šancí nebo míry smrštěný priorem 20 výsledků. Potřebuje 30 výsledků v 8 zápasech; zpřesnění musí být o 10 % silnější než jeho rodič; skupiny, kde je výsledek nula nebo všechno (u nich se to nezaznamenává), se vynechají. Ponecháno: BH pod 5 % přes každou vyhodnocenou skupinu, smrštěný poměr alespoň 1,25 (nebo 1/1,25), čtyři z pěti foldů souhlasí, a ne zpřesnění, které jen opakuje svého rodiče. Karta **Niky** je vypíše; klik ukáže každé zpřesnění skupiny o jedné podmínce (průzkumník), **Načíst** načte její zápasy. Výbavy zatím nejsou v souhrnech.

Čtvrtá tabulka, **kola** (`roundsTable`), má za cíl výsledek kola: jeden řádek na kolo jednoho života – mapa, strana, část zápasu (kola 1–4, 5–8, ...), vozidlo, nejpoužívanější zbraň, nejdéle držené místo, nákup, první zabití nebo první smrt – posuzovaný podle podílu výher vlastní strany ve vlastním zápase (stratifikované očekávání podle Mantela-Haenszela: reziduum je `won - e`, `e` podíl strany v zápase), takže nika nikdy není vyváženost mapy ani strany. Zápasy zůstávají shluky. Její z je kalibrované: stejné paprskové hledání běží osmkrát na výsledcích zamíchaných mezi koly každé strany každého zápasu (podíl strany v každém zápase zůstává zachován), a rozptyl těchto nulových z nad standardní normální rozdělení – podle počtu podmínek, ze středu (medián / 0,674) a z chvostu (99. percentil / 2,576), větší z nich, nikdy pod 1 – vydělí skutečná z před jejich p a mírou falešných objevů (empirická nula, Efron 2004). Hlubší skupiny dostanou větší měřítko: paprsek ponechává zpřesnění skupin vybraných pro jejich velké z. Základem niky je její vlastní očekávání, jejím nárůstem body nad ním, a řadí se podle nárůstu krát odmocnina z jejích kol, podepřená důkazy a částmi (`wracc` je podpora krát nárůst). Nese zápasy, kde se projevila nejvíc (`matchIds`), a několik jejich kol (`rounds`, `[match, round]`) pro podrobný pohled.

#### Úniky z meta s praktickou významností {#meta-shifts-with-practical-significance}

Na smíšených datech binomický test na životech označil skoro každou změnu za významnou. `meta` nyní testuje robustně vůči shlukům (životy každého zápasu jsou shluk), ponechá posun použití jen při 2 bodech a aspoň 25 %, posun K/D 1,3násobný, čtvrtletí dat, která se hýbou stejným směrem (Kendallovo tau alespoň 0,5), a u vozidla na více mapách stejný směr na většině z nich. Zůstane jen několik posunů na testovací sadě, kde prostý test označil skoro všechny.

#### Pro model {#for-a-model}

`massReportForModel` dá každému místu jeho `region` (tvar, skrytost, zřejmost, výšky, fáze) a každé nice její `conditions`, plus počet oblastí a skupin, které se zkusily. Vrstva znalostí může místa číst jako zóny smrti a přístupové cesty: jejich druhy jsou `place.*` a `niche.*`.

#### Kontroly {#checks}

`scan.test.ts` zasadí rozptýlenou oblast (1,6násobek míry smrti přes kruh 22 buněk, slabá v každé buňce), koridor, výškový pás a shluk jen v jedné fázi do 240 syntetických přerozptýlených zápasů – všechny se najdou, rozptýlená je skrytá – a spustí osm nulových sad po 60 zápasech: žádné místo. `niche.test.ts` najde zasazenou skupinu vozidlo × mapa × strana a v pěti nulových tabulkách nic. `outcome.test.ts` kontroluje souhrn verze 2 (vyhraná kola podle strany, jednotky, hráče a zbraně, `pw`, kola jednotek); zasadí koridor, jehož strana vyhrává 70 % svých kol oproti 35 % (každý zápas s vlastní vyvážeností) – nalezen – a spustí 20 nulových sad po 50 zápasech, kde koridory nic neříkají: žádné místo podílu výher; zasadí AWP na jednu mapu, která vyhrává kola své strany o 30 bodů častěji – nalezena, s jejími zápasy a koly – a spustí 30 nulových sad po 80 zápasech, každý zápas s vlastní vyvážeností a jednou stranou silnější na jedné mapě: žádná nika.
