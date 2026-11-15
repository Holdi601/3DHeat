---
title: "Hromadná analýza"
nav_order: 8
lang: "sk"
source: "mass-analysis.md"
source_hash: "e65b729b5928"
translated: true
outdated: false
---

# Hromadná analýza: tisíce zápasov naraz

**Hromadná analýza** vám ukáže, čo celý priečinok zápasov znamená: ktoré vozidlo vyhráva najviac, ktorá strana má výhodu, kde sa odohráva akcia. Použite ju, keď máte oveľa viac zápasov, než by ste stihli pozrieť.

Pracuje z malého súhrnu každého zápasu, takže tisíc alebo desaťtisíc zápasov sa otvorí rýchlo. Celé riadky načíta len pre zápasy, na ktoré kliknete.

## Vyskúšajte to {#try-it}

1. Otvorte **Hromadná analýza** v bočnom paneli Heatmapa.
2. Stlačte **Priečinok...** (alebo **Súbory...**) a vyberte svoje zápasy `.3dheat`.
3. Počkajte, kým panel prečíta súhrny („Súhrny... n z N“).
4. Stlačte **Otvoriť analýzu**. Otvorí sa okno s kartami.
5. Nastavte filtre (Hra, Mapa, Režim, Z, Do) a potom si prečítajte kartu, napríklad Vyváženosť.
6. Kliknite na riadok, bunku alebo zistenie: ich zápasy sa načítajú do 3D zobrazenia s kamerou na tomto mieste.

![Karta Vyváženosť: miera výhier a zabití na smrť podľa vozidla](../assets/img/en/mass-balance.webp)

```
priečinok .3dheat -> súhrny -> okno (karty) -> kliknutie na riadok -> zápasy sa otvoria v 3D
```

Súbor `.3dheat` je jeden zápas ([Jeden súbor na zápas (.3dheat)](container.md)). *Heatmapa* a *riadok* sú vysvetlené v [slovníku](glossary.md).

## Získanie súhrnov {#getting-the-summaries}

Väčšina ľudí nemusí nič robiť: panel si chýbajúce súhrny spočíta sám. Ak chcete veľký priečinok pripraviť raz, použite offline nástroj nižšie.

Každý zápas `.3dheat` dostane súhrn (`src/mass/summarize.ts`), uchovaný v kontajneri ako člen `<match>.summary.json` (rola `summary`, pozri [Jeden súbor na zápas (.3dheat)](container.md)). Offline nástroj ich zapíše, a aj index pre každý priečinok. Je to nástroj pre vývojárov; spustite ho na veľkom priečinku, aby panelu ušetril prácu:

```
node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Zápas, ktorý je už zhrnutý (rovnaká verzia formátu), sa len prečíta; `--force`
  ho spočíta znova. `--no-write` nechá kontajnery na pokoji.
- Súbor zmenený za posledných `--settle` minút (10) sa vynechá: konvertor ho
  môže ešte zapisovať.
- `<folder>/3dheat-index.jsonl.gz`: jeden riadok na zápas - jeho cesta, veľkosť, čas
  a súhrn bez mriežky. `<folder>/3dheat-index.grids.jsonl.gz`: jeden riadok na zápas
  s jeho mriežkou.
- Spustite ho na počítači, ktorý drží súbory, s nízkou prioritou (napríklad `nice -n 19 ionice -c3` na Linuxe).

Panel pre každý zápas vezme prvé dostupné z: riadok indexu priečinka (rovnaká cesta
a veľkosť), vyrovnávaciu pamäť prehliadača (IndexedDB, podľa názvu, veľkosti a času),
člena `summary` v kontajneri, alebo súhrn spočítaný v skupine pracovných procesov
a uložený do pamäte. Takže aj priečinok bez indexu funguje - prvýkrát rýchlosťou
čítania tabuliek, potom z pamäte.

## Panel {#the-panel}

Vyberte priečinok (alebo súbory; **Pridať priečinok...** pridá ďalší). Okno má filtre **Hra**, **Mapa**, **Režim**, **Z** a **Do**, voľbu **Rozdeliť podľa**, **Najmenej životov** a **Len hráči**, a tieto karty. Každé číslo pochádza zo súhrnov a klik na riadok, bunku alebo zistenie načíta ich zápasy do zobrazenia ako prekrytie viacerých zápasov s filtrami, ktoré ich ukazujú (vozidlo, trieda, zbraň, tím, hráč), a kamera sa postaví na toto miesto:

| Karta | Čo |
|---|---|
| Prehľad | zápasy, hodiny, hráči, životy, riadky, dátumy; zápasy za deň; podľa hry, mapy, režimu; súčty udalostí; ekonomika podľa meny; kedy v zápase sa veci dejú |
| Vyváženosť | podľa vozidla, triedy, zbrane alebo tímu, rozdelené podľa mapy, režimu, úrovne alebo hry: K/D s jeho ~95 % intervalom, miera výhier (Wilson), prežitie, zabitia a zásahy za minútu, zárobok za minútu, a q - Benjamini-Hochbergova miera falošných objavov K/D a výhry voči zvyšku rozdelenia. **Najmenej životov** skryje riadky s príliš málo životmi na dôveru; **Len hráči** vynechá to, čo riadilo AI misie |
| Trendy | podiel použitia (podiel na prítomnosti), K/D alebo miera výhier najlepších vozidiel alebo tried za deň, týždeň alebo mesiac |
| Hráči | rozlíšení hráči, zápasy hráča, hráči v zápase, najčastejší hráči |
| Strany | každá strana každej mapy: zápasy vyhraté oproti rovnomernému rozdeleniu |
| Súboje na blízko | dáta kôl: úvodné súboje podľa strany a ich premena, výmeny, nahliadač oproti držiteľovi, krížové paľby, vstupy po oslepení, mierenie, položenia bomby, prevaha mužov a, **Podľa mapy**, miesta, ktoré zabíjajú hráčov vstupujúcich do nich - každé ako podiel s jeho Wilsonovým intervalom, z počtov `cqb` v súhrnoch ([Súboje na blízko a kolá](close-quarters.md)) |
| Povrchy R6 | stopy Rainbow Six Siege na leveli (diery po guľkách a podobne) podľa povrchu levelu: stopy, stopy na kolo mapy, miestnosť, podiel stôp so zisteným strelcom; kliknutie otvorí druhy stôp, operátorov a triedy zbraní strelcov a miesta na povrchu, kde stopy sú (malá heatmapa z buniek po štvrť metra); povrch si ponechá svoje id naprieč zápasmi jednej verzie mapy. Z počtov `marks` v súhrnoch |
| Mapa | súčtová mriežka mapy: prítomnosť, zabitia, smrti, K/D, ľubovoľná udalosť, tok a **horúca v koľkých zápasoch** (stabilita); podľa tímu, pri 1, 2, 4 alebo 8-násobku bunky |
| Miesta | miesta, ktoré vyčnievajú v číslach, ale nie v heatmape (veľká oblasť plná aktivity ako celok, koridory, výškové pásma) a miesta, ktorých držitelia vyhrávajú viac alebo menej svojich kôl; **Nájsť miesta** |
| Niky | skupiny, ktoré si výrazne vedú lepšie alebo horšie ako ostatné (vozidlo na jednej mape, sektor v jednej výške) a skupiny kôl vyhratých nad rámec toho, čo ich strana vyhrala v tých istých zápasoch; **Nájsť niky** |
| Zistenia | hromadné detektory a detektory mapy (nižšie); **Kopírovať správu (JSON)** dá JSON, ktorý číta jazykový model |

## Zistenia cez mnohé zápasy {#insights-over-many-matches}

Karta **Miesta** nájde miesta, ktoré vyčnievajú v číslach, ale nie v heatmape - veľkú oblasť plnú aktivity ako celok, koridor, výškové pásmo, miesto plné aktivity len v jednej časti zápasu - označí tie, ktoré obyčajná heatmapa neukazuje, ako **skryté**, a obrysuje ich v 3D zobrazení; **Načítať** tam preletí so zápasmi, ktoré držala. Karta **Niky** nájde skupiny (vozidlo na jednej mape a strane, sektor v jednej výške), ktoré si výrazne vedú lepšie alebo horšie ako ostatné; kliknutím na jednu uvidíte jej spresnenia.

### Kto vyhral {#who-won}

Kde zápasy hovoria, kto vyhral každé kolo ([stĺpec výsledku](data-formats.md#outcome-columns) `won`), je výsledok samostatným cieľom:

- **Miesta: podiel výhier.** Pre každú stranu podiel jej kôl na mieste, ktoré vyhrala, oproti podielu, ktorý vyhrala kdekoľvek v tom istom zápase - takže základom je vyváženosť mapy, strany aj samotného zápasu a vyčnievajú len miesta, ktorých držitelia vyhrávajú viac (alebo menej) svojich kôl. Vymyslený príklad: *„Dust: strana T vyhráva viac svojich kôl, keď je tu: vyhraté 61 % z 412, oproti 49 % očakávaným podľa vlastnej úspešnosti v rovnakých zápasoch (šance 1,6×; držané v 31/48 zápasoch).“* Rovnaká miera falošných objavov a kontroly stability ako pri každom mieste; **Načítať** načíta zápasy, v ktorých platilo, a ukáže pozície tej strany.
- **Niky: výhra kola.** Tabuľka **Kolá** drží kolo každého života: mapu, stranu, časť zápasu (kolá 1-4, 5-8, ...), vozidlo (operátora, agenta), zbraň, ktorú použil najviac, miesto, ktoré držal najdlhšie, nákup (eco, force, full) a či jeho strana získala prvé zabitie. Skupina sa posudzuje voči tomu, čo jej strana vyhrala v tých istých zápasoch, takže *T na Dust s AWP* je nika len vtedy, keď sa tie kolá vyhrávali častejšie než ostatné kolá T v tých zápasoch. Vymyslený príklad: *„m1 · T · AWP: vyhráva 80 % z 320 kôl, oproti 62 % očakávaným od rovnakých strán v rovnakých zápasoch (šance 2,3×; 40 zápasov).“* Radené podľa nárastu krát podpora; **Načítať** načíta zápasy, ktorých kolá to ukazujú najviac.

Obe potrebujú súhrny verzie 2 (pozri [Získanie súhrnov](#getting-the-summaries)): staršie sa vypočítajú znova.

Karta **Zistenia** nájde naprieč všetkými zápasmi vozidlá, ktoré sa vymieňajú alebo vyhrávajú lepšie alebo horšie než ostatné, miesta horúce v stabilnom podiele zápasov, strany, ktoré vyhrávajú viac než rovnomerné rozdelenie, vozidlá, ktorých použitie sa mení v čase, a časti zápasu, ktoré držia viac zabití, než by bolo rovnomerne rozložené. Každé zistenie nesie svoje počty, účinok, interval a mieru falošných objavov (udržanú na 5 %), a kliknutie načíta jeho zápasy. Podrobnosti: [Pre vývojárov](#for-developers).

## Rozsah {#scale}

Malú verziu tohto si môžete zopakovať sami: `node tools/demo-data.mjs` zapíše 150 syntetických tankových zápasov do `tools/.shots/demo/mass` (asi 1 000 riadkov každý). Namerané na týchto 150 syntetických demo zápasoch z `tools/demo-data.mjs` na stolnom počítači (skutočný zápas je oveľa väčší):

- `tools/3dheat-summarize.mjs` so 4 pracovnými procesmi: 2,6 až 4,8 s pre všetkých 150, 8 až 21 ms na zápas v pracovnom procese; druhé spustenie, ktoré len číta súhrny, trvá asi 2 s.
- Otvorenie priečinka v paneli, s prítomným indexom, až kým okno zobrazí obsah: 0,9 až 1,6 s (vlastná časť pracovného procesu, čítanie 150 riadkov indexu, je 20 až 40 ms).
- Prepnutie na kartu, až kým sa jej tabuľka vykreslí: Prehľad 10 až 30 ms, Vyváženosť 30 až 70 ms, Trendy 30 až 45 ms, Hráči 15 až 35 ms, Strany 15 až 20 ms, Mapa 55 až 130 ms.
- Úložisko drží 150 zápasov asi na 0,5 MB.

Otvorenie okna trvá jeden krátky snímok: vybrané súbory idú do pracovného procesu po 16, a polia dátumov a prvá karta sa zobrazia o snímok neskôr ako okno.

Úložisko drží asi 15 KB na zápas, takže 10 000 zápasov zaberie v pracovnom procese ~150 MB; mriežky sa nikdy nedržia dlhšie, než koľko mapa vyžiada.

## Pre vývojárov {#for-developers}

### Zistenia cez mnohé zápasy {#insights-over-many-matches}

`src/mass/detect.ts` - každé zistenie s jeho počtami, účinkom a intervalom, p a q (Benjamini-Hochberg cez všetko, čo detektor skúsil, udržané na 5 %), vnorené zobrazenie, ktoré načíta jeho zápasy, a kľúč vety s jej hodnotami; správa (`heat3d.mass/1`) je to, čo `massReportForModel` dá rozprávačovi, v rovnakom tvare ako správa jedného zápasu (`insights/seam.ts`).

| Detektor | Nájde |
|---|---|
| `balance` | vozidlo hráča, ktoré sa vymieňa alebo vyhráva lepšie alebo horšie než ostatné na mape alebo v režime |
| `hotspot` | miesta horúce v stabilnom podiele zápasov, ktoré prišli (horúce zápasy / videné zápasy, oproti ostatným bunkám mapy) - nielen horúce v súčte |
| `side` | strana mapy, ktorá vyhráva viac než rovnomerné rozdelenie |
| `meta` | podiel životov hráčov vozidla alebo jeho K/D, ktorý sa pohybuje medzi skoršou a neskoršou polovicou dátumov, na mapu - dosť veľký na to, aby záležal, trendujúci cez štvrťroky, rovnakým spôsobom na väčšine máp (nižšie) |
| `phase` | časť dĺžky zápasu, ktorá drží viac zabití, zásahov, štartov... než rovnomerné rozloženie |
| `place` | miesta, ktoré vyčnievajú cez mnohé zápasy (Etapa B, nižšie): pomer oblasti alebo podiel zabití oproti každému vlastnému zápasu, kruhy, koridory, zväčšené zóny, výškové pásma, fázy; skryté, keď ich obyčajná heatmapa neukazuje |
| `niche` | skupiny, ktoré si výrazne vedú lepšie alebo horšie (Etapa B, nižšie) |
| `grid.*` | detektory jedného datasetu (pozície moci, horúce a tiché zóny, miesta tried) na súčtových mriežkach každej mapy: `GridMerge.toInsightJob` naplní mriežky prechodu zistení zo súhrnov; detektory, ktoré potrebujú stopy, preskočia |

### Súhrn {#the-summary}

Prostý JSON (`src/mass/types.ts`), asi 5-30 KB komprimovaný na zápas:

- zápas: hra, mapa, režim, misia, začiatok, dĺžka, riadky, životy, hráči,
  AI, tímy (životy, hráči, prítomnosť, zabitia, smrti, výhra, peniaze), víťaz;
- na vozidlo a tím: trieda, úroveň, životy, životy hráčov, prítomnosť, udalosti
  podľa kanonického druhu, zabitia podľa triedy cieľa, výhry, peniaze;
- na hráča (podľa id používateľa, inak podľa mena): tím, životy, prítomnosť, zabitia, smrti,
  zásahy, štarty, výhry, vozidlá; na zbraň: udalosti podľa druhu;
- so stĺpcom výsledku (verzia 2): vyhraté a odohrané kolá na tím, vozidlo
  (`rw`, každý život a kolo), hráča a zbraň (kolá, v ktorých ju strana použila);
  kolo každého života (`outcome.u`: kolo, strana, vozidlo, najviac použitá
  zbraň, najdlhšie držané miesto, nákup, výhra) a číslo, víťaz a strana prvého
  zabitia každého kola (`outcome.r`);
- stĺpce ekonomiky (`cost_*`, `earn_*`) a ich súčty;
- fázy: udalosti podľa druhu v 20 pásmach dĺžky zápasu a podľa minúty;
- správanie: merania kolektívneho správania zápasu (zarovnanie, hnanie trasou,
  pruhy, zhromažďovanie, vodcovia, zaostávajúci, bod zlomu, riziko po
  stratách, série, zhoda nákupov, potláčanie), každé so svojím nulovým modelom,
  p a q - pozri [Kolektívne správanie](collective-behaviour.md);
- mriežka (nižšie).

Počítané tak, ako ich počíta prehliadač: stĺpce nájdené tak, ako ich nájde načítač
mnohých zápasov (`leanSpec`), udalosti podľa `data/canonical.ts`; zabitie zbraňou
Tacview počíta pre svojho strelca; smrť povedaná dvakrát naraz (`dead`, `death`)
sa počíta raz.

#### Mriežka: na čom stavia Etapa B {#the-grid-what-stage-b-builds-on}

Priestorová časť je urobená pre štatistiky skenovania oblastí ľubovoľnej veľkosti
a tvaru, nielen pre obrazy heatmapy:

- **Pyramída.** Bunky sú zarovnané mocniny dvoch vo svetových jednotkách (x, z tak, ako ich
  umiestňuje prehliadač). Úroveň `k` sú bunky súčtované podľa `ix >> k, iz >> k` -
  presne, v rámci zápasu a naprieč zápasmi s inými veľkosťami buniek - a každá
  oblasť (box, koridor pozdĺž čiary, prstenec) je súčet buniek. Najjemnejšia úroveň
  sa zmestí do robustného rozsahu zápasu (bunky držiace 99 % prítomnosti) v 128
  bunkách; odľahlé mimo neho sa uchovajú.
- **Expozícia vedľa každého počtu.** Sekundy prítomnosti na bunku, na tím (`pt`),
  na triedu vozidla (`pc`) a na výškové pásmo (`ph`), takže pomer, očakávanie a pomer
  oblasti sa dajú vypočítať pre ľubovoľnú podskupinu.
- **Výška.** Pásma nad podlahou zápasu (1. percentil výšky): pod 3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, nad; súbor so stĺpcom `floor`/`storey`/`deck` ich rozdelí podľa poschodí. `y` je priemerná výška každej bunky, `y0` jej najnižšia (jej podlažie, pre výšku nad ňou).
- **Udalosti** ako dvojice `[cell, kind, team, class, band, count]`.
- **Kolá podľa výsledku** (verzia 2, so stĺpcom výsledku a aspoň dvoma kolami):
  `pw` ako `[cell, team, rounds won, rounds lost]` - kolá, v ktorých každá strana
  strávila v bunke sekundu alebo viac, podľa jej výsledku v kole.
- **Časové rezy** v hrubej úrovni (8 buniek na stranu), podľa minúty od začiatku
  zápasu: `[cx, cz, minute, kind, value]`, sekundy prítomnosti ako druh
  `GRID_KINDS.length`; fázy zápasu sú minúty cez dĺžku.
- Riedke, počty celé čísla, sekundy na desatinu: ohraničené tým, čo sa stalo.

### Etapa B: miesta a niky {#stage-b-places-and-niches}

Etapa B hľadá to, čo v číslach vyčnieva bez toho, aby to upútalo pozornosť: veľkú
oblasť plnú aktivity ako celok bez horúcej bunky v nej, zvláštny pomer zabití a smrtí
pri málo udalostiach, koridor, výškové pásmo, zhluk, ktorý je tam len v jednej časti
zápasu - a skupiny (vozidlo na jednej mape na jednej strane, sektor v jednej výške),
ktoré si výrazne vedú lepšie alebo horšie než ostatné. Jedno **Nájsť miesta** /
**Nájsť niky** / **Nájsť zistenia** spustí všetky detektory; tri karty zdieľajú správu.

#### Miesta (`src/mass/scan.ts`) {#places-srcmassscants}

Zápasy každej mapy sa prečítajú dvakrát, po jednom zápase; pamäť drží súčty na
rastri najviac 64 buniek na stranu (16 pre skenovanie priestor-čas), nikdy nie
zápasy.

- **Merania.** Miera udalosti na sekundu prítomnosti - zabitia, smrti,
  zásahy, štarty, zachytenia, pre všetky jednotky, na triedu (4 s najviac
  udalosťami), na výškové pásmo - a podiel zabití na zabitiach a smrtiach
  (všetky, na stranu, na pásmo) a **podiel výhier** každej strany: jej kolá v bunke
  vyhraté oproti prehraným (`pw`), kde sa pri 8 alebo viac zápasoch mapy počítajú
  kolá podľa výsledku. Ktoré triedy a strany sa berú, určia hlavy (`planOf`).
- **Očakávanie podľa zápasu.** Vlastná miera každého zápasu rozložená cez vlastnú
  prítomnosť v bunke je očakávanie bunky (Kulldorffovo skenovanie upravené o
  kovariáty, stratifikované podľa zápasu): niekoľko krvavých zápasov alebo jeden
  vyťažený server nevytvoria miesto. Pre podiel výhier je očakávaním vlastný
  podiel vyhratých kôl strany v tom zápase, takže vyváženosť mapy a strany nikdy
  nie je miesto. Kolo v niekoľkých bunkách oblasti sa počíta v každej; zohľadní
  to rozptyl meraný pri veľkosti oblasti.
- **Rozptyl.** Zápasy sa rozchádzajú ďaleko za Poissonom. Rezidua každého zápasu sa
  sčítajú v blokoch 1, 2, 4, 8, 16 buniek; rozptyl každej veľkosti bloku (štvorce reziduí
  nad nulovým rozptylom, spojené, najhorších 5 % blokov vynechaných) škáluje každý
  test oblasti tej veľkosti: pomer kvázi-vierohodnosti, Poisson pre miery, binomický pre podiely.
- **Oblasti.** Kruhy 0,75 až 18 buniek; elipsy v šiestich uhloch, 3- a 6-krát dlhšie než široké,
  3 až 18 buniek (koridory; os je `place.path` zistenia); zóny narastajúce bunka po bunke
  z najsilnejších lokálnych buniek Getis-Ord Gi*, kým rastie z-skóre oblasti (nepravidelné tvary) -
  narastené na jednej polovici zápasov a testované na druhej, takže voľnosť narastania
  nestojí žiadne falošné miesta; každé výškové pásmo proti ostatným pásmam zápasu
  cez celú mapu (odolné voči zhlukom); valce priestor-čas: kruh v jednej alebo dvoch pätinách
  dĺžky zápasu, oproti vlastnému rozloženiu udalostí zápasu v mieste a čase (permutačné
  skenovanie priestor-čas).
- **Testovanie.** p z kvázi-vierohodnosti; Benjamini-Hochberg cez každú oblasť skúšanú na každej
  mape (700 000 na troch mapách je bežné) na 5 %. Čo prejde, sa vyčistí (oblasť väčšinou vnútri
  silnejšej z jej merania hovorí to isté), znova sa prečíta pre svoju **stabilitu** - zápasy, ktoré ju
  videli, zápasy, ktoré ju držali, jej smer v piatich záhyboch zápasov - a ešte raz sa testuje
  pri rozptyle, ktorý ukazujú samotné zápasy (odolné voči zhlukom, zápasy ako zhluky,
  nikdy pod Poissonom), BH znova. Tiché miesta na základni (2 % alebo viac z
  nábehov, štartov a pristátí mapy) sa vynechajú.
- **Účinok.** Pomer miery (alebo šancí), zmenšený empirickým Bayesom (gama apriórne rozdelenie
  prispôsobené 2x2 blokom mapy), s ~95 % intervalom pri rozptyle; Gi* pri 1, 2 a 4 bunkách a lokálny Moran v strede.
- **Vizuálna zjavnosť.** Koľko oblasť už ukazuje v obyčajnej heatmape svojej udalosti (logaritmická
  škála po najjasnejšiu bunku, ako ju kreslia pohľady): jej kontrast s prstencom okolo nej (desatina
  palety je ťažko viditeľná, dve pätiny obyčajne) a jasný vrchol niesúci prebytok; pomer heatmapa
  nikdy nekreslí, takže podiel sa počíta polovicou. Pod 35 % je **skryté**. Poradie: sila (účinok
  nasýtený na 4-násobku, tiché miesta na 0,7) krát `1 - 0,7 × zjavnosť` krát zhoda záhybov.

Karta **Miesta** ich vypíše (skryté len predvolene; podľa mapy, tvaru,
smeru); klik obrysuje miesta mapy v 3D zobrazení (`placeLines.ts`: horné čiary
motora, postavené raz - magenta skryté, jantárové obyčajné, tyrkysové tiché,
vybrané plné; pásmo ako kváder od podlahy po strop) a na plátne karty Mapa;
**Načítať** tam preletí a načíta 60 zápasov, ktoré držalo najčastejšie, filtrovaných na svoju udalosť (a triedu).

#### Niky (`src/mass/niche.ts`) {#niches-srcmassnichets}

Vyhľadávanie lúčom (šírka 24, hĺbka 3) cez tri tabuľky: **životy** (životy hráčov:
hra, mapa, režim, trieda, vozidlo, strana, úroveň, štvrťrok dátumov, tretina
dĺžok zápasu; K/D, výhra, smrť život, zabitia za hodinu, zárobok za
minútu), **miesta** (zabitia a smrti podľa mapy, režimu, dátumov, sektora mapy
4 x 4, triedy, strany, pásma) a **fázy** (sektor a pätina zápasu: K/D, smrti za
hodinu prítomnosti). Skupina sa testuje voči celku so zápasmi ako zhlukmi (sendvičový
rozptyl jej reziduí podľa zápasu), jej účinok je pomer šancí alebo miery zmenšený apriórom
20 výsledkov; potrebuje 30 výsledkov v 8 zápasoch, spresnenie musí byť o 10 % silnejšie než jej rodič,
skupiny, kde je výsledok žiadny alebo všetky (pre nich nezaznamenaný), sa vynechajú. Ponechané: BH pod 5 %
cez každú vyhodnotenú skupinu, zmenšený pomer aspoň 1,25 (alebo 1/1,25), štyri z piatich záhybov
súhlasia, nie spresnenie, ktoré len opakuje svojho rodiča. Karta **Niky** ich vypíše; klik
ukáže každé spresnenie skupiny o jednej podmienke (prieskumník), **Načítať** načíta jej
zápasy. Výbavy zatiaľ nie sú v súhrnoch.

Štvrtá tabuľka, **kolá** (`roundsTable`), má za cieľ výsledok kola: jeden riadok
je kolo jedného života - mapa, strana, časť zápasu (kolá 1-4, 5-8, ...), vozidlo,
najviac použitá zbraň, najdlhšie držané miesto, nákup, prvé zabitie alebo prvá
smrť - posudzované voči podielu výhier vlastnej strany vo vlastnom zápase
(stratifikované očakávanie Mantel-Haenszel: reziduum je `won - e`, `e` je podiel
strany v zápase), takže nika nikdy nie je vyváženosť mapy alebo strany. Zhlukmi
zostávajú zápasy. Jej z je kalibrované: to isté vyhľadávanie lúčom beží osemkrát
na výsledkoch zamiešaných medzi kolami každej strany každého zápasu (podiel strany
v každom zápase zostáva) a rozptyl týchto nulových z nad štandardné normálne
rozdelenie - pre každý počet podmienok, zo stredu (medián / 0,674) a z chvosta
(99. percentil / 2,576), väčší z nich, nikdy pod 1 - delí skutočné z pred ich p a
mierou falošných objavov (empirická nula, Efron 2004). Hlbšie skupiny dostanú
väčšiu mierku: lúč ponecháva spresnenia skupín vybraných pre ich veľké z. Základ
niky je jej vlastné očakávanie, jej nárast sú body nad ním a radí sa podľa nárastu
krát odmocnina z počtu jej kôl, pri splnení dôkazov a záhybov (`wracc` je podpora
krát nárast). Nesie zápasy, kde sa prejavila najviac (`matchIds`), a niekoľko ich
kôl (`rounds`, `[match, round]`) na podrobný pohľad.

#### Zmeny metagry s praktickým významom {#meta-shifts-with-practical-significance}

Pri zmiešaných dátumoch binomický test nad životmi označil takmer každú zmenu za významnú. `meta` teraz testuje odolne voči zhlukom (životy každého zápasu sú zhluk), ponechá zmenu použitia len ak je aspoň 2 body a 25 %, zmenu K/D 1,3-násobnú, štvrťroky dátumov trendujú rovnakým smerom (Kendallovo tau aspoň 0,5) a pre vozidlo na viacerých mapách rovnaký smer na väčšine z nich. Tak zostane len niekoľko zmien na testovacej množine, kde obyčajný test označil takmer všetky.

#### Pre model {#for-a-model}

`massReportForModel` dá každému miestu jeho `region` (tvar, skryté,
zjavnosť, výšky, fáza) a každému nikovi jeho `conditions`, plus koľko
oblastí a skupín sa skúšalo. Šošovka znalostí môže čítať miesta ako zóny zabíjania a
prístupové cesty: ich druhy sú `place.*` a `niche.*`.

#### Kontroly {#checks}

`scan.test.ts` zasadí difúznu oblasť (1,6-násobok miery smrti nad kruhom
22 buniek, slabá v každej bunke), koridor, výškové pásmo a zhluk len vo fáze
do 240 syntetických zápasov s nadmernou disperziou - všetko nájdené, difúzna skrytá - a spustí
osem nulových súborov po 60 zápasoch: žiadne miesto. `niche.test.ts` nájde zasadenú
skupinu vozidlo x mapa x strana a nič v piatich nulových tabuľkách. `outcome.test.ts`
kontroluje súhrn verzie 2 (vyhraté kolá podľa strany, jednotky, hráča a zbrane,
`pw`, kolá jednotiek); zasadí pruh, ktorého strana vyhrá 70 % svojich kôl oproti
35 % (každý zápas s vlastnou vyváženosťou) - nájdený - a spustí 20 nulových
súborov po 50 zápasoch, kde pruhy nič nehovoria: žiadne miesto podielu výhier;
zasadí AWP na jednej mape, ktorá vyhrá kolá svojej strany o 30 bodov viac -
nájdená, s jej zápasmi a kolami - a spustí 30 nulových súborov po 80 zápasoch,
kde má každý zápas vlastnú vyváženosť a jedna strana je silnejšia na jednej mape:
žiadna nika.
