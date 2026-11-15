---
title: "Boj na blízko a kola"
parent: "Zjištění"
nav_order: 2
lang: "cs"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Boj zblízka a kola

U střílecích her hraných po kolech (nejdřív Counter-Strike, jakákoli data s koly, stranami a vyřazeními) Zjištění měří, jak se boje vyhrály: kdo získal úvodní souboje a co byly stát, zda se smrti vyměnily, zda hráč vykukující za roh porazil toho, kdo ho drží, zda se vyplatila křížová palba a záblesky, jak se šance na výhru kola měnila s každým vyřazením a které dveře zabíjely hráče, kteří jimi vstupovali. Slouží k tomu, abyste viděli, proč se kola vyhrála, ne jen kdo získal vyřazení.

Měření pocházejí z doktríny čištění místností a městského boje (smrtící nálevka, body dominance, křížová palba) a z e-sportovní a sportovní analytiky (pravděpodobnost výhry, hodnota akcí, upravený plus-minus). Každé se čte přes [čočku znalostí](knowledge.md) a cituje se.

## Vyzkoušejte to {#try-it}

1. Načtěte jeden nebo více zápasů s koly (konverze CS2 má všechno, co potřebuje).
2. Otevřete **Zjištění** a stiskněte **Najít zjištění**.
3. Pod **Měřítka optiky** čtěte řádky od *Pravděpodobnost výhry kola* po *Vliv hráče*; každý má svá čísla, svůj 95% interval, svou hodnotu q a zdroje, které sleduje.
4. Zvolte optiku **E-sport** nebo **Městský**, abyste je četli přes tu literaturu; **Napsat pomocí AI** je pošle s přehledem.

## Co to měří {#what-it-measures}

| Měření | Co říká | Jak |
|---|---|---|
| Pravděpodobnost výhry kola | Jak pravděpodobné bylo, že která strana kolo vyhraje, v každém okamžiku | Logistická regrese na hráče naživu na každé straně, bombu nebo cíl a jeho čas, kolový časomír a nákup, přizpůsobená načteným datům; kalibrace ověřená mimo vzorek podle kola (Brierovo skóre a dovednost, logaritmická ztráta, kalibrační chyba přes deset přihrádek, sklon rekalibrace, AUC) |
| Hodnota akcí | Kolik vyřazení, úvodní vyřazení, výměna, vyřazení za zábleskem, položení bomby nebo záblesk změnily šanci strany na výhru | Pravděpodobnost výhry po minus před; výměny, úvodní a vyřazení za zábleskem testované proti ostatním vyřazením permutací |
| Úvodní souboje | Která strana vyhraje první souboj, jak často tím vyhraje kolo, a kde jedna strana vyhrává úvody daleko nad svůj průměr | Wilsonovy intervaly; místa přesným binomickým testem proti podílu strany, q přes místa |
| Výměny | Smrti, na které odpoví vyřazení spoluhráčem zabijáka do 5 s, čas, který to trvalo, a kola vyhraná, když byla první smrt vyměněna | Fisherův přesný test, Newcombeho interval |
| Vykukující proti držiteli | Souboje, kde se jeden hráč pohnul do boje (1,5 m/s nebo víc za poslední sekundu) a druhý stál (0,75 m/s nebo méně): podíl vykukujícího | Přesný binomický test proti polovině |
| Mířené před soubojem | Pohled každého hráče proti úhlu k druhému 0,75 s před vyřazením; kdo byl lépe namířen a jak často ten hráč vyhrál; držitelé na svém úhlu (do 15°) proti mimo něj; dosahy vyřazení | Přesný binomický test; Fisher |
| Křížová palba | Držitelé s nehybným spoluhráčem do 25 m od vykukujícího, jehož čára na něj je o 35° nebo víc mimo jejich vlastní, proti držitelům samotným | Fisher, Newcombe |
| Pomůcky do vstupů | Vykukující za záblesk vlastní strany (do 3 s a 15 m) nebo kouř (do 18 s) proti suchým vykukům; úvodní souboje se záblesky jen na jedné straně; oslepené oběti | Fisher, binomický |
| Výhoda v počtu | Pro každý stav žijících hráčů (5v4, 4v5, 2v1...) poprvé dosažený v kole podíl kol vyhraných z něj | Wilsonovy intervaly |
| Zvraty | Kola, kde strana zůstala posledním hráčem: výhry proti očekávaným výhrám modelu podle počtu soupeřů | Normální test pozorovaného proti očekávanému |
| Nakupení, rotace, číhání | Největší skupina do 10 m při úvodním souboji (3 nebo víc: nakupení); hráči přes 30 m od prvního boje nebo položeného cíle a jak rychle se dostanou do 12 m; čas a poměr vyřazení ku smrtem více než 30 m od každého spoluhráče | Fisher; poměr šancí s Woolfovým intervalem |
| Po položení a znovudobytí | Kola vyhraná stranou, která bombu položila, podle čísel při položení, a její podíl na soubojích po položení | Wilsonovy intervaly |
| Smrtící nálevky | Vstupy do každého místa (změna sloupce místa, jinak buňky 8 m) a smrti do 2,5 s po vstupu, proti míře mapy | Přesný binomický test, q přes místa; poměr stažený s 20 vstupy na míru mapy |
| Vliv hráče | Pravděpodobnost výhry přidaná na kolo každým hráčem (vyřazení, smrti, položení), stažená empirickým Bayesem; hřebenový upravený plus-minus výsledků kol proti startu modelu; hodnota vyřazení podle místa a zbraně, stažená | Penalizace zvolená pětinásobnou křížovou validací |

Všechny testy jedné analýzy sdílejí jednu míru falešných objevů (Benjamini-Hochberg), započítává se každé vyzkoušené místo, ne jen ta zobrazená; zobrazené q je přes všechna. Model a jeho kalibrace se přizpůsobí načteným datům, takže popisují tu populaci: profesionální model špatně soudí hru pro zábavu a naopak.

Ověřeno na syntetických kolech se zakotvenými efekty (výhoda vykukujícího, křížová palba, záblesky, jedna smrtící nálevka, přesnější míření vyhrává), a na 100 datových sadách těchže kol bez nich, kde musí míra falešných objevů testů zakotvených efektů zůstat na nominálních 5 % (v pásmu) (`src/insights/cqb/cqb.test.ts`); na asi tisíci skutečných kolech model dosáhl Brierova skóre 0,14 proti 0,25 pro základní míru, kalibrační chyby 0,03 a sklonu rekalibrace 1,0.

## Data, která potřebuje {#data-it-needs}

- sloupce **time**, **player**, **side** a **round** (relace) a vyřazení a smrti ve sloupci událostí; kola, kde nikdo nezemře dvakrát, se berou jako eliminační kola (výhoda v počtu, zvraty a model je potřebují);
- sloupec **druhé strany** (`other`, `victim`, `killer`, `attacker`), který při vyřazení pojmenuje oběť a při smrti zabijáka (bez něj se vyřazení a smrti ve stejném okamžiku páruje);
- **směr pohledu** pro měření míření;
- surový sloupec `event`, který jmenuje `flash`, `smoke`, `he`, `molotov`, `plant` a `defuse` pro pomůcky a položení;
- `won` (strana řádku vyhrála kolo), `place` (hlášení místa), `weapon`, `buy` a `state_flashed`, kde je data mají.

Pozice by se měly vzorkovat několikrát za sekundu; rychlosti, míření a křížová palba čtou poslední dvě sekundy před každou smrtí.

## V rozpadu {#in-the-breakdown}

[Rozpad](breakdown.md) měří čtyři situace jako faktory, s a bez: *oslepen*, *smrt vyměněna*, *úvodní souboj* a počty (*přesila*, *vyrovnané počty*, *nedostatek*), každou u K/D, vyhraných kol, přežití a vyřazení za minutu.

## Mnoho zápasů {#many-matches}

Každý souhrn zápasu z [hromadné analýzy](mass-analysis.md) dat se sloupcem kola nese stejná měření jako počty (`cqb` v souhrnu): úvodní souboje, výměny, vykukování, křížovou palbu, vstupy za zábleskem, míření, výhodu v počtu, položení a 40 nejčastěji vstupovaných míst s jejich vstupy a smrtmi. Počty se sčítají přes zápasy, takže tisíc zápasů dá stejné podíly jako jedna velká analýza. Záložka **Boj zblízka** panelu je ukazuje jako podíly s jejich intervaly, přes všechny mapy nebo podle mapy; kliknutí na řádek načte zápasy, ze kterých pocházel.

## Pro vývojáře {#for-developers}

`src/insights/cqb/`: `walk.ts` (jeden průchod řádky v pořadí času, kola oddělená, souboje zaznamenané s jejich stavem), `finish.ts` (měření a počty na zápas), `model.ts` (logistická regrese metodou IRLS, kalibrace, hřeben metodou sdružených gradientů, empirický Bayes, Fisher, Newcombe, permutační testy), `run.ts` a `worker.ts` (prohlížeč: vlastní worker vedle průchodu zjištění), `summary.ts` (sběratel souhrnu mnoha zápasů), `factors.ts` (situace rozpadu), `shows.ts` (co čte čočka), `synth.ts` (testovací kola). Položky znalostí jsou v `src/insights/knowledge/cqb.ts`, vzory v `patterns-cqb.ts`. Výsledky jdou do přehledu jako `lens.cqb`.
