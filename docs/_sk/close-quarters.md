---
title: "Súboje na blízko a kolá"
parent: "Zistenia"
nav_order: 2
lang: "sk"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Boj zblízka a kolá

Pri strieľačkách založených na kolách (najprv Counter-Strike, akékoľvek dáta s kolami, stranami a zabitiami) Zistenia merajú, ako sa súboje vyhrávali: kto vzal
otváracie súboje a čo stáli, či sa smrti vymieňali, či hráč, ktorý sa vysúval do uhla, porazil toho, kto ho držal, či sa krížová paľba a záblesky vyplatili,
ako sa kurzy na kolo pohli s každým zabitím, a ktoré dvere zabíjali hráčov, ktorí ich vchádzali. Použite to na zistenie, prečo sa kolá vyhrali, nielen kto
získal zabitia.

Miery pochádzajú z doktríny čistenia miestností a boja v meste (smrteľný lievik, body dominancie, krížová paľba) a z analytiky e-športu a športu
(pravdepodobnosť výhry, hodnota akcií, upravený plus-mínus). Každá sa číta cez [znalostnú optiku](knowledge.md) a je citovaná.

## Vyskúšajte to {#try-it}

1. Načítajte jeden alebo viac zápasov s kolami (konverzia CS2 má všetko, čo potrebuje).
2. Otvorte **Zistenia** a stlačte **Nájsť zistenia**.
3. Pod **Miery optiky** si prečítajte riadky od *Pravdepodobnosť výhry kola* po *Vplyv hráča*; každý má svoje čísla, svoj 95 % interval, svoju hodnotu q a zdroje, ktoré sleduje.
4. Vyberte optiku **E-šport** alebo **Mestský boj**, aby ste ich čítali cez danú literatúru; **Napísať pomocou AI** ich odošle spolu so správou.

## Čo meria {#what-it-measures}

| Miera | Čo hovorí | Ako |
|---|---|---|
| Pravdepodobnosť výhry kola | Ako pravdepodobné bolo, že strana kolo vyhrá, v každom okamihu | Logistická regresia nad hráčmi živými na každej strane, bombou alebo cieľom a ich časom, časom kola a nákupom, fitovaná na načítané dáta; kalibrácia overená mimo vzorky podľa kola (Brierovo skóre a zručnosť, log loss, chyba kalibrácie v desiatich košoch, sklon rekalibrácie, AUC) |
| Hodnota akcií | O koľko zabitie, otvárací zabitie, výmena, zabitie za zábleskom, položenie bomby alebo zábleskom zmenilo šancu strany vyhrať | Pravdepodobnosť výhry po mínus pred; výmeny, otvárajúce a zábleskové zabitia testované oproti ostatným zabitiam permutáciou |
| Otvárací súboje | Ktorá strana vyhrá prvý súboj, ako často to vyhrá kolo, a kde jedna strana vyhráva otvorenia ďaleko nad svoj vlastný priemer | Wilsonove intervaly; miesta exaktným binomickým testom proti podielu strany, q cez miesta |
| Výmeny | Smrti zodpovedané zabitím vykonaným spoluhráčom na zabijaka do 5 s, čas, ktorý to trvalo, a kolá vyhraté, keď sa prvá smrť vymenila | Fisherov exaktný test, Newcombeho interval |
| Vysúvajúci sa proti držiteľovi | Súboje, kde sa jeden hráč vysunul do boja (1,5 m/s alebo viac za poslednú sekundu) a druhý stál (0,75 m/s alebo menej): podiel vysúvajúceho sa | Exaktný binomický test proti jednej polovici |
| Mierenie pred súbojom | Pohľad každého hráča oproti smeru k druhému 0,75 s pred zabitím; kto mieril lepšie a ako často tento hráč vyhral; držitelia na svojom uhle (do 15°) oproti mimo neho; dosahy zabití | Exaktný binomický test; Fisher |
| Krížová paľba | Držitelia s nehybným spoluhráčom do 25 m od vysúvajúceho sa, ktorého línia naň je 35° alebo viac mimo ich vlastnej, oproti držiteľom samým | Fisher, Newcombe |
| Pomôcky do vstupov | Vysúvajúci sa za zábleskom vlastnej strany (do 3 s a 15 m) alebo dymovnicou (do 18 s) oproti suchým vysunutiam; otvárajúce súboje so zábleskom na jednej strane; oslepené obete | Fisher, binomický |
| Prevaha v počte | Pre každý stav živých hráčov (5v4, 4v5, 2v1...) prvýkrát dosiahnutý v kole, podiel kôl vyhraných z neho | Wilsonove intervaly |
| Clutche | Kolá, kde strana skončila s posledným hráčom: výhry oproti očakávaným výhram modelu, podľa počtu protivníkov | Normálny test pozorovaného voči očakávanému |
| Nahromadenie, rotácie, číhanie | Najväčšia skupina do 10 m pri otváracom súboji (3 alebo viac: nahromadení); hráči viac ako 30 m od prvého boja alebo položeného cieľa a ako rýchlo sa dostanú do 12 m; čas a pomer zabití ku smrtiam viac ako 30 m od každého spoluhráča | Fisher; pomer šancí s Woolfovým intervalom |
| Po položení a retake | Kolá vyhraté stranou, ktorá položila bombu, podľa počtov pri položení, a jej podiel na súbojoch po položení | Wilsonove intervaly |
| Smrteľné lieviky | Vstupy do každého miesta (zmena stĺpca miesta, inak 8 m bunky) a smrti do 2,5 s od vstupu, oproti miere mapy | Exaktný binomický test, q cez miesta; pomer stiahnutý 20 vstupmi pri miere mapy |
| Vplyv hráča | Pridaná pravdepodobnosť výhry na kolo od každého hráča (zabitia, smrti, položenia), stiahnutá empirickým Bayesom; hrebeňový upravený plus-mínus výsledkov kôl oproti štartu modelu; hodnota zabití podľa miesta a zbrane, stiahnutá | Penalizácia zvolená päťnásobnou krížovou validáciou |

Všetky testy jednej analýzy zdieľajú jednu mieru falošných objavov (Benjamini-Hochberg), započítané sú všetky vyskúšané miesta, nielen tie zobrazené;
zobrazené q je nad všetkými. Model a jeho kalibrácia sa fitujú na načítané dáta, takže popisujú tú populáciu: profesionálny model sa mýli pri
bežnej hre a naopak.

Overené na syntetických kolách s vloženými efektmi (výhoda vysúvajúceho sa, krížová paľba, záblesky, jeden smrteľný lievik, lepšie mierenie vyhrávajúce),
a na 100 dátových sadách tých istých kôl bez nich, kde miera falošných objavov testov s vloženými efektmi musí zostať na nominálnych 5 % (v pásme)
(`src/insights/cqb/cqb.test.ts`); na asi tisíc reálnych kolách mal model Brierovo skóre 0,14 oproti 0,25 pre základnú mieru, chybu kalibrácie 0,03
a sklon rekalibrácie 1,0.

## Dáta, ktoré potrebuje {#data-it-needs}

- stĺpce **time**, **player**, **side** a **round** (relácia), a zabitia a smrti v stĺpci udalostí; kolá, kde nikto nezomrie dvakrát, sa berú ako eliminačné kolá (prevaha v počte, clutche a model ich potrebujú);
- stĺpec **iná strana** (`other`, `victim`, `killer`, `attacker`), ktorý pri zabití pomenúva obeť a pri smrti zabijaka (bez neho sa zabitia a smrti v tom istom okamihu párujú);
- **smer pohľadu** pre miery mierenia;
- surový stĺpec `event`, ktorý pomenúva `flash`, `smoke`, `he`, `molotov`, `plant` a `defuse` pre pomôcky a položenia;
- `won` (strana riadku vyhrala kolo), `place` (volania), `weapon`, `buy` a `state_flashed` tam, kde ich dáta majú.

Pozície by mali byť vzorkované niekoľkokrát za sekundu; rýchlosti, mierenie a krížová paľba čítajú posledné dve sekundy pred každou smrťou.

## V rozpise {#in-the-breakdown}

[Rozpis](breakdown.md) meria štyri situácie ako faktory, s a bez: *oslepený*, *smrť vymenená*, *otvárací súboj* a počty (*máme prevahu*, *rovnaké počty*, *máme nedostatok*),
každé pri K/D, vyhratých kolách, prežití a zabitiach za minútu.

## Mnoho zápasov {#many-matches}

Každý súhrn zápasu z [analýzy mnohých zápasov](mass-analysis.md) dát so stĺpcom kola nesie tie isté miery ako počty (`cqb` v súhrne): otváracie súboje,
výmeny, vysunutia, krížová paľba, vstupy so zábleskom, mierenie, prevaha v počte, položenia a 40 najčastejšie vstupovaných miest s ich vstupmi a smrťami.
Počty sa sčítavajú naprieč zápasmi, takže tisíc zápasov dá rovnaké podiely ako jedna veľká analýza. Záložka **Boj zblízka** v paneli ich ukazuje ako podiely
s ich intervalmi, za všetky mapy alebo podľa mapy; kliknutie na riadok načíta zápasy, z ktorých pochádza.

## Pre vývojárov {#for-developers}

`src/insights/cqb/`: `walk.ts` (jeden prechod cez riadky v poradí času, kolá oddelené, súboje zaznamenané s ich stavom), `finish.ts` (miery a počty na zápas),
`model.ts` (logistická regresia cez IRLS, kalibrácia, hrebeňová regresia cez konjugované gradienty, empirický Bayes, Fisher, Newcombe, permutačné testy),
`run.ts` a `worker.ts` (prehliadač: vlastný worker vedľa prechodu zisťovaním), `summary.ts` (zberač súhrnu mnohých zápasov), `factors.ts` (situácie rozpisu),
`shows.ts` (čo optika číta), `synth.ts` (testové kolá). Záznamy znalostí sú v `src/insights/knowledge/cqb.ts`, vzory v `patterns-cqb.ts`. Výsledky idú do správy ako `lens.cqb`.
