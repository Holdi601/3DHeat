---
title: "Akumulace"
parent: "Vnitřní fungování vykreslování"
nav_order: 2
lang: "cs"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Akumulace

Když prohlížeč nemůže nakreslit každou tečku v jednom snímku, nakreslí jednu část, pak další část, a když stojíte bez hnutí, obrázky sečte. Obraz se zjasňuje jako fotografie, která se vyvíjí. Pohyb kamerou začne znovu od začátku. Řádek **Pokrytí** v přehledu statistik ukazuje, jak daleko to je.

![Přehled statistik: Pokrytí ukazuje procenta, dokud se obraz vyvíjí, a *přesné*, když je hotovo](../assets/img/en/performance-stats-overlay.webp)

## Pro vývojáře {#for-developers}

Když jeden snímek nemůže nakreslit každý řádek, nakreslí vzorek a zváží ho; obraz je pak nezkreslený, ale zašuměný odhad. **Akumulace** slučuje po sobě jdoucí snímky, takže odhad konverguje k přesné odpovědi, dokud se nic nemění. Každý snímek volí jeden z pěti režimů ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); naposledy použitý je v `engine.live.accumMode`.

| Režim | Kdy | Co se stane s akumulátorem |
|---|---|---|
| **reset** | kamera se pohnula, něco, co mění pole, se změnilo, postupné zpřesňování je vypnuté, začíná rostoucí okno (první snímek přehrávání, po přeskoku), nebo se pohnula přehraná čára tepla | Nahrazeno odhadem tohoto snímku. |
| **extend** | **Kumulativní** okno, které od posledního snímku jen vzrostlo | Tento snímek nakreslí jen řádky, které se právě staly viditelnými, v plné váze, a přičte je. Nic se nerozkládá. |
| **ema** | posuvné okno (**Okno**, **Životnost**) se pohnulo | `acc = acc × (1 - 0,34) + snímek × 0,34` – exponenciální klouzavý průměr zhruba tří snímků. |
| **mean** | nic se nezměnilo a odhad není úplný | `acc = acc × (1 - 1/n) + snímek × 1/n` na *n*tém snímku: běžící průměr. |
| **skip** (nečinný) | zkonvergováno a nic se nezměnilo | Nic se nekreslí; snímek se jen znovu složí. |

### Proč každý {#why-each}

- **Běžící průměr, ne součet.** Přeškálovat buffer na 1 - 1/n a přičíst 1/n nového snímku je algebraicky totéž co sečíst a na konci vydělit *n*, ale buffer vždy drží hodnotu jednoho pole. Součet by dosáhl *n*násobku pole, a na 16bitovém cíli by se nasytil na 65 504; s dělitelem, který pořád roste, by statický pohled zeslábl čím déle stál – zatímco pohybující se kamera, která se resetuje každý snímek, vypadá dokonale správně. Testy dýmu tvrdí, že 16 sloučených snímků drží 1,00× toho, co jeden snímek.
- **Extend pro kumulativní přehrávání.** Řádky, které se už nahromadily, jsou pořád vidět, takže snímek potřebuje jen zlomek sekundy, který právě přišel – což se vejde do jednoho snímku, takže se vloží přesně. Přepočítávání by naopak rozsvítilo v každém snímku jinou náhodnou podmnožinu a zase ji zhaslo, což se čte jako záblesky, které vzplanou a zmizí, a pozastavený snímek by stále doplňoval. Testy tvrdí, že celkový součet během přehrávání roste monotónně a při pozastavení na 2,5 s zůstává v rozmezí 0,02 %.
- **Klouzavý průměr pro posuvná okna.** Ta se opravdu mění v každém snímku. Pevná váha míchání sleduje pohyblivé okno (průměr přes všechny snímky od začátku přehrávání by za hlavou přehrávání zaostával) a je mnohem klidnější než začínat od nuly.
- **Reset pro přehrávané čáry.** Hlavy čar tepla se hýbou v každém snímku; klouzavý průměr by z každé udělal pruh, takže se každý snímek kreslí celý a doznívání ocasu je vlastní vzhled obrazu.
- **Částečné snímky jdou přes pracovní cíl.** Snímek sloučený na zlomku plné váhy se nakreslí do odděleného cíle od nuly a pak se smíchá do akumulátoru, místo aby se nakreslil přímo s váhou 1/n. Přímo by se každý sprite přičetl v 1/n velikosti součtu, do kterého se připojuje, a půlplovoucí cíl by to zaokrouhlil pryč – nejhůř tam, kde je pole nejhustší ([Akumulace v půlplovoucí čárce](half-float-accumulation.md)).

### Konvergence {#convergence}

Plán každého snímku ví, kolik je kandidátních řádků a kolik jich odešle, takže počet snímků potřebný k pokrytí každého řádku je ⌈kandidáti / odeslané⌉. Jakmile je tolik snímků sloučeno, pohled je **zkonvergovaný**: řádek *Pokrytí* v přehledu statistik se mění z procent na *přesné* a další snímky jsou nečinné. Se zapnutým **Kreslit každý řádek v každém snímku** (výchozí) obvykle jeden snímek pokryje vše, takže konvergence je okamžitá; postupný mechanismus je potřeba jen tehdy, když okno drží víc řádků, než jeden plán kreslení unese (zhruba 67 milionů).

### Co to restartuje {#what-restarts-it}

Nastavení spadají do tří skupin podle toho, co akumulovaný buffer ještě znamená, když se změní:

| Skupina | Změny | Účinek |
|---|---|---|
| **Geometrie** – které řádky přispívají a kolik | režim pohledu; trasy čar; poloměr spritu, intenzita ve středu a na okraji, útlum, hladký útlum, křivka, omezení pixelů, zploštění; ořezání podle vzdálenosti blízko, daleko a rovinou; zakrytí a skrytí za terénem; řez; velikost plátna; rozlišení tepla; viditelnost skupin a znaménka; rozdělení rozdílu; Vše / Přehrát; historie; filtry sloupců a výběr entit; zisk půlplovoucí čárky | Reset. |
| **Okno** – časový rozsah | pohyb hlavy přehrávání; záložní životnost a doznívání | Extend (kumulativní), nebo klouzavý průměr (posuvný). |
| **Složení** – jen barvení | nasycení, odezva na hustotu, minimální teplo, barevné škály; řez levelem; mřížka a osy; nastavení přehrání krychlí a relace; hloubka ostrosti | Překreslení bez zásahu do tepla. |

Pohyb kamery vždy resetuje. Tažení za nasycení nebo škálu je tedy zadarmo; tažení za poloměr spritu restartuje konvergenci při každém kroku.
