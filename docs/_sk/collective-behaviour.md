---
title: "Kolektívne správanie"
parent: "Zistenia"
nav_order: 3
lang: "sk"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Kolektívne správanie: davy, kŕdle, stáda a rozhodnutia pod tlakom

Hráči v zápase sa správajú ako ľudia kdekoľvek: zhlukujú sa pri dverách, idú za tým, kto išiel prvý, držia sa spolu alebo zaostávajú, po ťažkých stratách ustupujú a po zlom živote berú väčšie riziko. **Miery optiky správania** merajú tieto vzorce metódami vedy o davoch, fyziky kolektívneho pohybu, behaviorálnej ekonómie a vojenskej psychológie, každú voči jej vlastnému nulovému modelu, a čítajú ich cez zodpovedajúce položky [znalostnej bázy](knowledge.md).

## Vyskúšajte to {#try-it}

1. Načítajte jeden alebo viac zápasov s časom, pozíciami a tímami.
2. Otvorte **Zistenia** a spustite ich.
3. Rozbaľte **Miery optiky**: miery správania sú uvedené spolu s ostatnými
   (Kolektívne zarovnanie, Stádové chodenie po trasách, Pruhy a stopy, Zhlukovanie,
   Vodcovia a nasledovníci, Súdržnosť a zaostávajúci, Zlomový bod, Riziko po
   stratách, Série, Zhoda nákupu, Potlačenie), každá s číslami, svojím testom
   a literatúrou, ktorá ju vysvetľuje.
4. **Zhrnutie** ich cituje; **Napísať pomocou AI** ich pošle spolu so správou.

## Miery {#the-measures}

Dráhy sa prevzorkujú na jeden bod každé 2 s (pozícia na konci intervalu a rýchlosť v jeho priebehu). Vzdialenosti sa škálujú typickým rozstupom dát samotných – mediánom vzdialenosti jednotky od jej najbližšieho spoluhráča – takže tá istá miera funguje pre pechotu, tanky aj lietadlá.

| Miera | Čo meria | Nulový model a test | Znalosti |
|---|---|---|---|
| Kolektívne zarovnanie | Polarizácia (dĺžka priemerného smeru jednotiek) pohybujúcich sa jednotiek každej strany každé 2 s, miešanie (rotácia okolo ťažiska), podiely času polarizovaného, miešania a roja, podľa fázy zápasu; v bojoch dvoch zarovnaných strán podiel zabití zarovnanejšej strany | Dráha každej jednotky posunutá v čase v rámci zápasu (zachová jej cestu, preruší súčasnosť); test prevrátenia znamienka v 60 s oknách | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Stádové chodenie po trasách | Ako často jednotka opustí miesto tak, ako to predtým spravil spoluhráč (do 30 s), pre ten istý spôsob vstupu, voči vlastným podielom výstupov miesta – a voči kopírovaniu predchádzajúceho prechodu nepriateľa | Výstupy premiešané v rámci miesta a vstupu; účinok je spoluhráč mínus kopírovanie nepriateľa (Manskeho problém odrazu: kopírovanie a plán, ktorý strana zdieľa, vyzerajú rovnako) | Banerjee 1992, Bikhchandani a kol. 1992, Manski 1993 |
| Pruhy a stopy | Bočné oddelenie oboch smerov na miestach s protiprúdom; podiel pohybu na najfrekventovanejších 10 % terénu, jeho Giniho koeficient a prekrytie najfrekventovanejšieho terénu zápasov | Smery premiešané medzi celými návštevami; dve mriežky posunuté o polovicu miesta, každá testovaná, Bonferroni | Helbing a kol. 1997, 2005 |
| Zhlukovanie | Rýchlosť (vzhľadom na vlastné tempo jednotky) a tok podľa počtu susedov do dvojnásobku typického rozstupu, pokles kapacity v najhustejšej triede, na najfrekventovanejšom teréne; smrti za hodinu v davoch; výstrely za minútu spoluhráčov v blízkosti (sociálne povaľovanie) | Vlastná korelácia rýchlosti a hustoty každej jednotky, prevrátenie znamienka cez jednotky, minimálny účinok ρ nad ±0,05; presné testy pomeru | Helbing a kol. 2000, Seyfried a kol. 2005, Latané a kol. 1979 |
| Vodcovia a nasledovníci | Pre spoluhráčov cestujúcich spolu časový posun (až 8 s), pri ktorom smer jedného najlepšie predpovedá smer druhého; graf vodcov, tranzitivita trojíc, miery smrti a zabití vodcov | Páry s jednou dráhou posunutou v čase dávajú 95% prah; binomický test voči 5 % | Nagy a kol. 2010, Couzin a kol. 2005 |
| Súdržnosť a zaostávajúci | Čas strávený za trojnásobkom typického rozstupu strany od najbližšieho spoluhráča; miera smrti tam voči tej v skupine; rozstup strany voči jej podielu na zabitiach v boji | Presný podmienený test dvoch Poissonových pomerov | Shils a Janowitz 1948, Siebold 2007 |
| Zlomový bod | Rýchlosť priblíženia k nepriateľovi (vo vlastnom tempe strany) podľa podielu strany stratenej za poslednú minútu; najnižšia úroveň strát, pri ktorej strany ustupujú | Jednostranný klastrový bootstrap voči ústupu o desatinu tempa (straty prichádzajú tam, kde sa strany stretnú, a strany, ktoré sa stretnú, prestanú sa približovať), Bonferroni cez úrovne | Dupuy 1987, Rowland 2006 |
| Riziko po stratách | Podiel nasledujúceho života strávený pred vlastnou stranou smerom k nepriateľovi, nad vlastným podielom strany a ostatnými vracajúcimi sa jednotkami v tom čase: po živote stratenom bez zabitia oproti po živote so zabitím; skorá smrť po skorej smrti (náklon) | Životy každej jednotky premiešané (prvý život zachovaný), takže konečnosť sekvencie je v nulovom modeli | Kahneman a Tversky 1979, Thaler a Johnson 1990 |
| Série | P(zabitie po k zabitiach) − P(zabitie po k smrtiach), k = 1..3 | Sekvencia každého hráča premiešaná 1 000-krát: odčíta sa skreslenie, ktoré ukázali Miller a Sanjurjo; Bonferroni cez k | Gilovich a kol. 1985, Miller a Sanjurjo 2018 |
| Zhoda nákupu | Fleissovo κ pásiem výbavy (eco, sila, plná; tercily mimo Counter-Strike) v kole strany | Hráčsko-kolové záznamy strany premiešané cez jej kolá | Fleiss 1971 |
| Potlačenie | Rýchlosť v 4 s po nesmrteľnom poškodení oproti 4 s pred ním, a výstrely v 10 s po oproti pred tým, pri zásahoch a pri pokojných chvíľach tej istej jednotky | Prevrátenie znamienka cez jednotky, minimálne účinky 0,05 tempa a jeden výstrel za minútu | Rowland 2006 |

Každá p-hodnota správy prechádza Benjamini-Hochbergovou mierou falošných objavov (`q`). Miera sa vynechá, keď ju dáta nevedia uniesť: na zhodu nákupu sú potrebné kolá a hodnoty vybavenia, na potlačenie udalosti poškodenia, na série a riziko zabitia a smrti pripísané jednotkám.

## V hromadnej analýze {#in-the-mass-analysis}

Každý súhrn zápasu (`<zápas>.summary.json`, pozri [Hromadná analýza](mass-analysis.md)) nesie tie isté miery pre daný zápas vo svojej sekcii `behaviour`, takže tisíce zápasov sa dajú porovnať bez toho, aby sa ich riadky čítali znova.

## Ako dobre to funguje {#how-well-it-works}

Na simulovaných bitkách s každým efektom vloženým do nich a na tých istých svetoch bez neho (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): každá miera nájde svoj zasadený účinok a nulové svety zostanú pod prahom falošných objavov. Riziko po stratách má najmenšiu silu; stádové chodenie po trasách nevie rozlíšiť kopírovanie od spoločného plánu (strana, ktorá zdieľa jeden cieľ, je touto mierou „stádová“).

## Pre vývojárov {#for-developers}

- `src/insights/behaviour/acc.ts` – akumulátor (preprzorkované dráhy, udalosti,
  kolá) a `finish`; `motion.ts` a `choice.ts` sú miery;
  `bstats.ts` pomocné funkcie permutácií, bootstrapu a kappa; `shows.ts` vzory
  a vety, ktoré optika číta (`lens.<miera>`).
- `feed.ts` ho napája z blokov pracovného procesu zistení; `summaryTap.ts` zo
  súhrnu zápasu pri jeho streamovaní tabuľky.
- Znalosti: `src/insights/knowledge/behaviour.ts` (položky),
  `patterns-behaviour.ts`, `refs-behaviour.ts` (odkazy, každý overený
  voči jeho záznamu v Crossref alebo Open Library).
- Popisky: `lens.metric.<miera>` v `locales/*/lens.json`.
