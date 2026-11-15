---
title: "Kolektivní chování"
parent: "Zjištění"
nav_order: 3
lang: "cs"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Kolektivní chování: davy, hejna, stáda a rozhodování pod tlakem

Hráči v zápase se chovají jako lidé kdekoli: shlukují se u dveří, jdou za tím, kdo šel první, drží pohromadě, nebo se táhnou, po těžkých ztrátách ustupují a po špatném životě berou víc rizik. **Měřítka chování optiky** tyto vzorce měří metodami vědy o davech, fyziky kolektivního pohybu, behaviorální ekonomie a vojenské psychologie, každé proti vlastnímu nulovému modelu, a čtou je přes odpovídající položky [znalostní báze](knowledge.md).

## Vyzkoušejte to {#try-it}

1. Načtěte jeden nebo více zápasů s časem, pozicemi a týmy.
2. Otevřete **Zjištění** a spusťte to.
3. Rozbalte **Měřítka optiky**: měření chování jsou uvedena s ostatními (Kolektivní zarovnání, Směrové stádo, Pruhy a stopy, Shlukování, Vůdci a následovníci, Soudržnost a opozdilci, Bod zlomu, Riziko po ztrátách, Série, Shoda nákupů, Potlačení), každé se svými čísly, svým testem a literaturou, která je vysvětluje.
4. **Shrnutí** je cituje; **Napsat pomocí AI** je pošle spolu se zprávou.

## Měření {#the-measures}

Dráhy se převzorkují na jeden bod každé 2 s (pozice na konci intervalu a rychlost v jeho průběhu). Vzdálenosti se měří podle obvyklé vzdálenosti v datech samotných – mediánu vzdálenosti jednotky od jejího nejbližšího spoluhráče – takže stejné měření funguje pro pěchotu, tanky i letadla.

| Měření | Co měří | Nulový model a test | Znalosti |
|---|---|---|---|
| Kolektivní zarovnání | Polarizace (délka průměrného směru jednotek) pohyblivých jednotek každé strany každé 2 s, víření (rotace kolem těžiště), podíly času polarizovaného, vířivého a rojového pohybu, podle fáze zápasu; v bojích dvou zarovnaných stran podíl zabití té více zarovnané strany | Dráha každé jednotky posunutá v čase v rámci zápasu (zachová svou cestu, zruší současnost); test překlopení znaménka přes okna po 60 s | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Směrové stádo | Jak často jednotka opustí místo stejným způsobem, jakým ho opustil spoluhráč před ní (do 30 s), pro stejný vstup – a proti kopírování dřívějšího průchodu nepřítele | Výstupy zamíchané v rámci místa a vstupu; účinek je kopírování spoluhráčů mínus kopírování nepřítele (Manskeho problém odrazu: kopírování a plán, který strana sdílí, vypadají podobně) | Banerjee 1992, Bikhchandani a kol. 1992, Manski 1993 |
| Pruhy a stopy | Boční oddělení dvou směrů na místech s protiproudem; podíl pohybu na nejrušnějších 10 % terénu, jeho Giniho koeficient a překryv nejrušnějšího terénu zápasů | Směry zamíchané mezi celými návštěvami; dvě mřížky posunuté o půl místa, každá testována, Bonferroni | Helbing a kol. 1997, 2005 |
| Shlukování | Rychlost (vzhledem k vlastnímu tempu jednotky) a tok podle počtu sousedů do dvojnásobku obvyklé vzdálenosti, pokles kapacity v nejhustší třídě, na nejrušnějším terénu; úmrtí za hodinu v davech; výstřely za minutu spoluhráčů poblíž (sociální lenost) | Korelace rychlosti a hustoty každé jednotky zvlášť, překlopení znaménka přes jednotky, minimální účinek ρ mimo ±0,05; přesné testy poměru | Helbing a kol. 2000, Seyfried a kol. 2005, Latané a kol. 1979 |
| Vůdci a následovníci | U spoluhráčů cestujících spolu časový posun (až 8 s), při kterém směr jednoho nejlépe předpovídá směr druhého; graf vedení, tranzitivita trojic, míry úmrtí a zabití vůdců | Dvojice s jednou dráhou posunutou v čase dají 95% práh; binomický test proti 5 % | Nagy a kol. 2010, Couzin a kol. 2005 |
| Soudržnost a opozdilci | Čas strávený dál než třikrát obvyklá vzdálenost strany od nejbližšího spoluhráče; míra úmrtí tam oproti úmrtím ve skupině; vzdálenost strany oproti jejímu podílu na zabitích v boji | Přesný podmíněný test dvou Poissonových poměrů | Shils a Janowitz 1948, Siebold 2007 |
| Bod zlomu | Rychlost přibližování k nepříteli (v tempu strany) podle podílu strany ztraceného v poslední minutě; nejnižší úroveň ztrát, při které strany ustupují | Jednostranný bootstrap přes shluky proti ústupu o desetinu tempa (ztráty přicházejí tam, kde se strany setkají, a strany, které se setkají, přestanou se přibližovat), Bonferroni přes úrovně | Dupuy 1987, Rowland 2006 |
| Riziko po ztrátách | Podíl dalšího života strávený před vlastní stranou směrem k nepříteli, nad vlastním podílem strany a jinými vracejícími se jednotkami v tu dobu: po životě ztraceném bez zabití proti po životě se zabitím; brzká smrt po brzké smrti (náklon) | Životy každé jednotky zamíchány (první život zůstane), takže zkreslení konečné posloupnosti je v nulovém modelu | Kahneman a Tversky 1979, Thaler a Johnson 1990 |
| Série | P(zabití po k zabitích) − P(zabití po k úmrtích), k = 1..3 | Posloupnost každého hráče zvlášť zamíchána 1 000krát: odečte se zkreslení, které ukázali Miller a Sanjurjo; Bonferroni přes k | Gilovich a kol. 1985, Miller a Sanjurjo 2018 |
| Shoda nákupů | Fleissovo κ pásem výbavy (eco, vynucený, plný; tercily mimo Counter-Strike) v kole strany | Hráčská kola strany zamíchána přes její kola | Fleiss 1971 |
| Potlačení | Rychlost ve 4 s po nesmrtelném poškození oproti 4 s před ním a výstřely v 10 s po oproti před tím, u zásahů a u klidných okamžiků téže jednotky | Překlopení znaménka přes jednotky, minimální účinky 0,05 tempa a jeden výstřel za minutu | Rowland 2006 |

Každá p-hodnota zprávy prochází přes Benjaminiho-Hochbergovu míru falešných objevů (`q`). Měření se vynechá, když data nemohou nést: pro shodu nákupů jsou potřeba kola a hodnoty vybavení, pro potlačení události poškození, pro série a riziko zabití a úmrtí připsaná jednotkám.

## V analýze hromadných dat {#in-the-mass-analysis}

Každé shrnutí zápasu (`<zápas>.summary.json`, viz [Analýza hromadných dat](mass-analysis.md)) nese tatáž měření pro tento zápas ve své sekci `behaviour`, takže lze tisíce zápasů porovnat, aniž by se jejich řádky znovu četly.

## Jak dobře to funguje {#how-well-it-works}

Na simulovaných bitvách s každým efektem vloženým dovnitř a na stejných světech bez nich (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): každé měření najde svůj vložený účinek a nulové světy zůstanou pod prahem falešných objevů. Riziko po ztrátách má nejmenší sílu; směrové stádo nedokáže rozlišit kopírování od sdíleného plánu (strana, která sdílí jeden cíl, je tímto měřením „stádo“).

## Pro vývojáře {#for-developers}

- `src/insights/behaviour/acc.ts` – akumulátor (převzorkované dráhy, události, kola) a `finish`; `motion.ts` a `choice.ts` měření; `bstats.ts` pomocné funkce permutací, bootstrapu a κ; `shows.ts` vzorce a věty, které optika čte (`lens.<měření>`).
- `feed.ts` ho plní z částí workeru zjištění; `summaryTap.ts` ze shrnutí zápasu, jak proudí tabulkou.
- Znalosti: `src/insights/knowledge/behaviour.ts` (položky), `patterns-behaviour.ts`, `refs-behaviour.ts` (odkazy, každý ověřený proti svému záznamu v Crossref nebo Open Library).
- Popisky: `lens.metric.<měření>` v `locales/*/lens.json`.
