---
title: "Načítanie súborov"
parent: "Ako dostať dáta dnu"
nav_order: 1
lang: "sk"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Načítavanie súborov

Táto stránka ukazuje, ako dať 3DHeat svoje súbory a čo s nimi robí. Pustite priečinok a vyberie
súbory, ktoré obsahujú pozície, a spojí ich do jedného obrazu.

1. Otvorte **Zdroj** hore v bočnom paneli Heatmapy.
2. Pustite súbory alebo priečinok do oblasti na pustenie, alebo stlačte **Súbory…** alebo **Priečinok…**.
3. Prečítajte riadok výberu a **Odhad pamäte** (pozri obrázok nižšie).
4. Stlačte **Načítať**.

![Panel Zdroj po pustení priečinka desiatich zápasov: 1 riadok výberu, 2 Odhad pamäte pri fits a 3 Načítať 10 súborov](../assets/img/en/loading-files-source.webp)

*Keď pustíte priečinok, 3DHeat vám povie, čo našiel a či sa to zmestí.*

Súbory sa načítavajú v paneli **Zdroj** hore v bočnom paneli karty Heatmapa. Všetko vybrané naraz sa stane
**jednou** dátovou sadou.

## Výber súborov {#choosing-files}

| Ovládací prvok | Čo robí |
|---|---|
| **Pustite sem súbory alebo priečinok** (oblasť na pustenie) | Pustite ľubovoľnú zmes súborov a priečinkov. Priečinky sa prechádzajú rekurzívne. Kliknutie na oblasť na pustenie otvorí rovnaký výber ako **Súbory…**. |
| **Jeden súbor…** | Výber súboru pre jeden súbor. |
| **Súbory…** | Výber súborov, ktorý prijme viacero súborov. |
| **Priečinok…** | Výber priečinka (výber `webkitdirectory` prehliadača); ponúkne sa každý súbor v strome priečinka. |

Výbery prijímajú typy súborov z [zoznamu načítateľných súborov](data-formats.md#files). Stručne: `.parquet`/`.pq` sa čítajú ako Parquet,
`.csv`/`.tsv`/`.txt` ako text s oddeľovačmi, `.acmi` (Tacview), OCAP `.json`/`.json.gz` a formáty GPS (GPX, KML, KMZ, NMEA, IGC, FIT)
idú cez svoje vlastné čítačky, a kontajnery zápasov `.3dheat` sa načítajú ako tabuľky, ktoré obsahujú ([Jeden súbor zápasu](container.md)).
Kontajner, ktorý sa nedá prečítať, sa preskočí ako *nie je csv/parquet súbor*.

Pustené priečinky sa prechádzajú do hĺbky 12 úrovní a najviac 20 000 súborov, ako ochrana pred slučkami symbolických odkazov
a nekontrolovateľne veľkými stromami.

## Ktoré súbory sa ponechajú {#which-files-are-kept}

Predtým, než sa niečo prečíta, sa výber prefiltruje ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Súbor s inou príponou sa preskočí: *nie je csv/parquet súbor*.
- Súbor s veľkosťou 0 bajtov sa preskočí: *prázdny (0 bajtov)*.
- **Pomocné súbory konvertora** - surové dáta, ktoré konvertor drží vedľa tabuľky zápasu, `<match>.messages.parquet`, `.events.parquet`, `.raw.parquet`
  a ďalšie uvedené v [Konvertory uchovávajú všetko](converters.md) - sa preskočia: *pomocný súbor konvertora*. Ak chcete jeden otvoriť, vyberte
  alebo pustite ho samostatne (alebo len pomocné súbory): výber len pomocných súborov ich načíta ako ktorúkoľvek inú tabuľku. JSON vedľa tabuľky
  (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` a `.hints.json`) sa nikdy neponúka ako pozície.
- **Pravidlo súboru pohybu.** Ak sa niektorý súbor vo výbere volá `movement*.parquet`, `movement*.csv` (a ďalšie prípony) - `movement.parquet`,
  `movement_1.parquet` a tak ďalej - potom sa preskočí každý ďalší dátový súbor: *nie je súbor pohybu a tento priečinok má súbory pohybu*.
  Exporty telemetrie často obsahujú jednu tabuľku pozícií vedľa desiatok tabuliek bez pozícií a kresliť sa dá len tá prvá.
  Priečinok bez akéhokoľvek súboru pohybu načíta všetky dátové súbory. Príklad: priečinok s `movement_1.parquet`, `kills.parquet` a `shop.parquet`
  načíta `movement_1.parquet`; ostatné dva sú uvedené ako preskočené. Príklad: priečinok s `movement_1.parquet`, `kills.parquet` a `shop.parquet`
  načíta `movement_1.parquet`; ostatné dva sú uvedené ako preskočené.
- Ponechané súbory sa zoradia podľa ich cesty vo výbere, takže ten istý priečinok vždy vytvorí tú istú dátovú sadu a tie isté farby.

Panel potom ukáže výber (názov jedného súboru, alebo `priečinok (N súborov)` podľa najdlhšieho spoločného priečinka), počet súborov,
ich celkovú veľkosť a celkový počet riadkov - presný, keď sú všetky súbory Parquet, označený `≈`, keď je niektorý CSV. Preskočené súbory sú
uvedené s dôvodom, prvé štyri podľa názvu.

## Čítanie schémy {#reading-the-schema}

**Prvý** súbor výberu sa otvorí, aby sa opísala schéma ("Čítam schému"): názvy jeho stĺpcov, prvých 50 riadkov dát, ktoré stĺpce
vyzerajú číselne a pri Parquet logický typ každého stĺpca a položka `heat3d` v pätičke. Priečinok exportov jednej tabuľky zdieľa jednu
schému, takže jeden súbor zastupuje všetky. Potom sa meria každý súbor ("Počítam riadky"): pätička Parquet dá presný počet v jednom malom čítaní;
počet CSV sa odhaduje podľa priemernej dĺžky riadka z prvého megabajtu.

Panel [Mapovanie stĺpcov](column-mapping.md) sa otvorí s automaticky navrhnutými odhadmi a [odhad pamäte](memory-and-budgets.md) sa zobrazí nad
tlačidlom **Načítať**.

## Správy pred načítaním {#messages-before-loading}

Pod výberom panel uvádza z [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Chyby** (červené) - načítanie sa nemôže začať: menej ako dve osi pozície, ten istý stĺpec na dvoch osiach, namapovaný stĺpec,
  ktorý nie je v súbore, stĺpec pozície, ktorý nevyzerá číselne, časový stĺpec, ktorého vzorkované hodnoty sú text, zatiaľ čo jednotka je číslo
  (každý riadok by bol NaN a skončil by v čase 0), časový stĺpec nastavený na ISO-8601, z ktorého žiadna vzorkovaná hodnota sa nedá prečítať ako dátum,
  mierka jednotky 0.
- **Upozornenia** (oranžové) - načíta sa, ale pravdepodobne nie tak, ako sa myslelo: stĺpec skupiny, ktorý nadobúda inú hodnotu na väčšine
  vzorkovaných riadkov (takže je to identifikátor, nie skupina), stĺpec času `DATE` (každý riadok jedného dňa zdieľa jeden okamih), smer pohľadu
  nastavený bez svojich stĺpcov.
- **Poznámky** - čo mapovanie znamená: kreslenie v rovine, keď jedna os nie je namapovaná, žiadna časová os bez stĺpca času, žiadne stopy bez
  stĺpca osoby, a bez stĺpca skupiny jedna farba pre všetko a rozdiel, ktorý sa môže rozdeliť len podľa stĺpca ponechaného na filtrovanie.

## Načítanie {#loading}

Tlačidlo **Načítať** číta *Načítať súbor*, *Načítať N súborov*, alebo *Načítať N súborov (1 z K)*, keď je nastavený [krok decimácie](memory-and-budgets.md#decimation).
Číta *Príliš veľké - zmenšite alebo decimujte* a je vypnuté, keď [kontrola zmestenia](memory-and-budgets.md#the-fit-check) hovorí, že sa načítanie nezmestí;
je tiež vypnuté, kým mapovanie má chyby alebo beží iné načítanie.

Počas načítania panel ukazuje aktuálny krok (s `[súbor/súbory]` pred ním, keď je súborov viac), prečítané riadky, priebežný ukazovateľ a **Zrušiť**.
Zrušenie ukončí worker príjmu a s ním aj všetky parsery, ktoré spustil.

Stránka sa počas načítania stále prekresľuje, lebo práca prebieha na pozadí. Vidíte aktuálny krok, prečítané riadky, priebežný ukazovateľ a **Zrušiť**.
Po poslednom súbore panel ukáže kroky *Radím riadky podľa času*, *Preusporiadavam stĺpce (n z m)*, *Meriam rozsah*, *Zostavujem zoznam*,
*Súhrn relácií* a *Výpočet životností*, potom *Nahrávam N riadkov do GPU* na jeden snímok, aby sa dlhé nahrávanie nezamenilo s zamrznutím.

### Ako to funguje {#how-it-works}

Načítanie beží vo Web Workeri ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Pri viacerých súboroch
a viac ako jednom [vlákne parsera](memory-and-budgets.md#parser-threads) sa až toľko súborov parsuje **naraz**, každý v jeho vlastnom parser workeri
([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), pokiaľ rozpočet RAM nechá priestor; spájajú sa stále
jeden po druhom v poradí výberu, takže dátová sada je rovnaká ako pri načítaní jeden po druhom. Keď je v behu niekoľko, riadok priebehu
pomenúva súbor, ktorý naposledy nahlásil, a ukazovateľ a počet riadkov sčítajú každý súbor v behu. Pri jednom vlákne alebo jednom súbore sa
súbory parsujú jeden za druhým priamo v ingest workeri. Číta sa len stĺpce, ktoré mapovanie uvádza: nemapovaný stĺpec súboru Parquet nestojí nič;
CSV sa prechádza bajt po bajte, ale dekódujú sa len mapované polia.

## Viacero súborov sa stane jednou dátovou sadou {#several-files-become-one-dataset}

Keď sa načíta viac ako jeden súbor ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Jeden zoznam.** Osoby, skupiny, relácie a hodnoty kategórií sú slovníky zdieľané medzi všetkými súbormi, takže ten istý hráč v dvoch exportoch je jedna osoba s jednou stopou.
- **Jeden začiatok času.** Časy sa počas spájania držia ako 64-bitové sekundy a prepočítajú sa na najskorší čas *celého* výberu, potom sa uložia
  ako 32-bitové sekundy od tohto začiatku. Štyri exporty zo štyroch popoludní sa zoradia v ich skutočnom poradí, nie naukladané na seba.
- **Jedno časové poradie.** Riadky zo všetkých súborov sa zoradia podľa času radix triedením (pozri [strop triedenia](memory-and-budgets.md#the-sort-ceiling)).
- **Stĺpec `Source file`.** Každý riadok si pamätá, z ktorého súboru pochádza, ako stĺpec kategórie s názvom `Source file`. Objaví sa v [Filtroch](filters.md)
  a ako *Source file - porovnať dve načítania* v [rozdelení rozdielu](difference.md). Načítanie jedného súboru ho nedostane - konštantný stĺpec by stál
  4 bajty na riadok a nič by nehovoril.
- **Chýbajúce stĺpce.** Súbor, ktorému chýba jeden zo stĺpcov *filtra*, jednoducho neprispieva hodnotami. Súbor, ktorému chýba namapovaný stĺpec
  *role* (X, čas, osoba, ...), zlyhá s *súbor nemá stĺpec "názov"*; pri načítaní viacerých súborov sa tento súbor preskočí, ostatné sa načítajú
  a preskočené súbory sú uvedené na dátovej sade. Načítanie jedného súboru, ktoré zlyhá, nahlási chybu.
- **Upozornenie na nedostatok.** Keď je načítaných riadkov menej ako 95 % riadkov spočítaných vopred, dátová sada nesie upozornenie s podielom chýbajúcich -
  z nečitateľných súborov alebo z riadkov bez použiteľnej pozície, ktoré sa pri vstupe zahodia.

## Po načítaní {#after-loading}

Nová dátová sada nahradí predchádzajúcu. Pri každom načítaní ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- všetky filtre a viditeľnosť skupín sa vynulujú;
- rozdelenie rozdielu podľa skupiny sa resetuje: prvá polovica skupín (zaokrúhlená nahor) kladná, zvyšok záporný;
- polomer sprite sa nastaví na horizontálny rozsah / 120 a saturácia na analytický odhad; veľkosť kocky, dĺžka lúča pohľadu, rýchlosť letu
  a blízka/ďaleká rovina sa nastavia podľa rozsahu (pozri [Relácie, osoby a skupiny](sessions-persons-groups.md#entity-size));
- relácia box replay sa nastaví na reláciu s najväčším počtom riadkov;
- trasy line heat sa odhadnú nanovo ([Line heat](line-heat.md));
- režim pohľadu sa vráti na **Teplo**, ak aktuálny režim nové dáta nepodporujú; časová os sa vráti na **Všetko** bez stĺpca času a história
  na **Kumulatívne** bez životností;
- prehrávacia hlava sa zaparkuje na začiatok a prehrávanie sa zastaví;
- kamera zarámuje celú dátovú sadu zo štandardného smeru (pozerá pozdĺž -Z, naklonená asi o 36° nadol).

Panel **Dátová sada** potom ukáže názov dátovej sady (výber, počty riadkov a súborov a krok, ak sa použil), `N tímov · N osôb · N s rozpätie`
a každé upozornenie, ktoré načítanie vyvolalo, oranžovo, kým je dátová sada načítaná. **Uvoľniť** v tom paneli odstráni dátovú sadu.
