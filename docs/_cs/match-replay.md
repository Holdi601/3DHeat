---
title: "Přehrání zápasu"
nav_order: 9
has_children: true
lang: "cs"
source: "match-replay.md"
source_hash: "9d61f24a5a04"
translated: true
outdated: false
---

# Přehrání zápasu

Přehrání je film zápasu, v němž je každý hráč nakreslen jako to, čím řídil. Slouží k tomu, abyste znovu sledovali souboj, šli za jednou jednotkou a viděli, kdo koho zasáhl.

Výstřely, zásahy, požáry a vraky se kreslí na jednotkách a cílech na levelu. Kamery, popisky a taktický displej vám pomohou souboj číst. Znáte Tacview? [Parita s Tacview](tacview-parity.md) ukazuje, kde je každý jeho nástroj.

![Přehrání figur ukázky tanků: tanky jako vlastní figury, s popisky jména, vozidla a rychlosti](../assets/img/en/replay-overview.webp)

## Spuštění přehrání {#start-a-replay}

1. Načtěte záznam přes **Zdroj → Soubory…** nebo přetažením na panel Zdroj (jakákoli tabulka se sloupcem **osoby** a **času**, soubor Tacview, převedený replay, zápas [`.3dheat`](container.md)). Viz [Jak nahrát data](getting-data-in.md).
2. Otevřete kartu **Zápas** a vyberte **Přehrávání figur**, nebo vyberte **Překryv figur** v liště režimů karty Teplotní mapa.
3. Pod **Zápasy v záznamu** vyberte jeden zápas, všechny najednou, nebo několik.
4. Stiskněte **Přehrát** na časové ose (nebo `K`). Tažením časové osy přeskočíte.

Figury nahrazují krychle u každé jednotky, jejíž jméno nebo typ je znám (viz [Figury](figures.md)). Data bez sloupce jména nebo typu se kreslí jako vojáci.

![Karta Zápas: výběr zápasů, sekce Figury, pohledy kamer, Přehrát a seznam událostí](../assets/img/en/match-replay-tab.webp)

## Figury {#figures}

![Hořící tank v orbitální kameře se zásahem, který ho zasáhl](../assets/img/en/replay-tanks.webp)

| Nastavení (sekce **Figury**) | Výchozí | Co dělá |
|---|---|---|
| **Figury místo krychlí** | zapnuto | Vypnuto kreslí prosté krychle. |
| **Velikost figur** (násobek skutečné velikosti) | 1 | 1 je skutečná velikost; 0,25 až 20násobek (logaritmická stupnice). Větší pomáhá zdaleka. |
| **Nejmenší figura na obrazovce** | 36 px | Figury zdaleka zvětší, aby zůstaly tak velké, 0 až 200 px; 0 ponechá skutečnou velikost. |
| **Na dálku**: Figura, Šipka, Symbol | Figura | Čím se stane vzdálená jednotka. |
| **Symboly** | NATO (APP-6) | NATO (APP-6), ruské taktické značky, ikony **Herní mapa**, nebo **Jen tvary (pro barvoslepé)**. |
| **Velikost symbolu**, **Moje strana**, **Nepřátelská / Neutrální**, **Značky kurzu** | 28 px (12 až 64), automaticky, nepřátelská, zapnuto | Jak symboly vypadají a která strana je přátelská. |
| **Svislé čáry** | zapnuto | Čára od každé jednotky přímo dolů k zemi, aby se výšky daly v 3D číst. |
| **Svislice a popisky u zbraní** | vypnuto | Čáry k zemi a popisky na střelách a bombách. |
| **Požáry na jednotkách** | zapnuto | Plameny od okamžiku, kdy jednotka začne hořet, dokud se neuhasí. |
| **Zásahy jednotek** | zapnuto | Značky, kam zasáhly výstřely (níže). **Zásahy zůstávají**: 1 až 300 sekund, nebo **Celý život**. **Plovoucí značky**: značky kreslené nad povrchem. |
| **Čáry pohledu a věže** | vypnuto | Přerušovaně: kam hráč kouká; plně: kam směřuje zbraň. |
| **Budovy** | plné | Plné nebo průhledné budovy, když je level maluje. |

### Symboly na dálku {#symbols-at-a-distance}

Když by jednotka byla menší než **Nejmenší figura na obrazovce**, může se stát symbolem, který zůstane čitelný. Tvar říká druh (například zaoblený kvádr s pásovou značkou pro obrněné vozidlo); barva říká stranu. Otevřete nabídku **Symboly**, abyste změnili styl.

![Týchž šest jednotek jako symboly NATO, ruské taktické značky, ikony herní mapy a jen tvary](../assets/img/en/match-replay-symbols-styles.webp)

### Značky zásahů, vraky a požáry {#hit-marks-wrecks-and-fires}

- **Značky zásahů** sedí na povrchu, kam výstřel dopadl, v měřítku figury. Jejich vzhled říká, co se stalo: díra (prošlo), světlý třísk (neprošlo), rýha (odrazilo se), hvězda od sazí (výbušný náboj). Barevný kroužek říká, co udělal: smrtící zásah, modul zničen, kritický, vážný, poškození, bez poškození, zásah. Najetím na značku uvidíte jméno náboje.
- Zničená jednotka se kreslí **zuhelnatělá** jako vrak od své smrti, dokud se neobjeví znovu nebo se neodstraní; její symbol je přeškrtnutý.
- **Požáry** hoří na jednotce od okamžiku, kdy se vznítí, dokud se neuhasí.
- **Věže** se otáčejí tam, kam data říkají, že směřuje zbraň (nebo, bez toho, kam se hráč dívá).

### Zbraně, návnady a stopy {#weapons-decoys-and-tracers}

Se zapnutým **Zbraně, výstřely a zásahy** (sekce Týmové zobrazení): rakety, střely, bomby a torpéda letí jako vlastní figury s kouřovou stopou; kulky a granáty jsou stopy; dopady a výbuchy blýsknou. Stopa nakreslená **přerušovaně** byla odvozena ze zásahu, protože data neměla výstřel. Světlice a plevy se kreslí jako návnady; v seznamu jednotek jsou skryté, pokud není zaškrtnuto *Návnady a granáty*.

## Kamery {#cameras}

Klikněte na jednotku nebo její popisek, abyste ji **sledovali**; sekce **Přehrávání** nabízí **Zezadu**, **Orbita**, **Kokpit** (s průhledným displejem, `H`), **Pevná**, **Zámek**, **Cíl** a **Satelit**. `V` je prochází, **Vzdálenost kamery** nastavuje, jak daleko. Esc zastaví.

- **Pohled na dvě jednotky**: vyberte **Cíl** (nebo Ctrl/Alt-klik na jednotku), abyste ji viděli z té sledované; **Prohodit** je vymění.
- **Míra**: Shift-klik na dvě jednotky ukáže směr, vzdálenost a výškový rozdíl mezi nimi.
- **2D mapa** (`M`): rohový nebo celý pohled, se stopami a jmény.
- **Záložky** (`B`): uloží okamžik a kameru; vypisují se i vlastní zabití, smrti a značky záznamu.
- **Události**: každá událost v časovém pořadí; kliknutím tam přeskočíte. `Page Up` / `Page Down` přeskakují mezi událostmi; **Pauza při události** se zastaví u každé.

## Taktický displej {#tactical-display}

![Ukázka letectva s taktickým vzhledem (T): drátěný terén, panely zabití a událostí](../assets/img/en/replay-air-tactical.webp)

Sekce **Taktický displej** kreslí pro žádnou jednotku, pro vybrané, pro všechny, nebo pro jeden druh (letadla, pozemní, lodě, zbraně): vektory rychlosti a dráhu před sebou, čáry nosu a vztlaku, radarové kužely, zámky, datová spojení, zóny a čáry zapojení, zorné čáry, kam hráči hledí (kužely pohledu), míření věží a zaznamenanou kameru.

### Styl zobrazení {#display-style}

`T` (nebo přepínač **Zobrazit jako taktický displej**) přepne vzhled na styl radarové obrazovky: záře, obrysy, vrstevnice, měřicí mřížka, skenovací čáry, kroužky dosahu, výškové žebříky, panely se zabitími a událostmi a **Režisér**, který kameru přesouvá k událostem sám.

![Stejný letecký souboj v běžném vzhledu](../assets/img/en/replay-air.webp)

## Cíle {#objectives}

Když zápas přichází se svými cíli, sekce **Cíle** je kreslí na levelu: zóny dobytí (s vlastníkem a postupem dobývání), spawny, letiště, oblasti a bombardovací cíle, každou vrstvu lze přepnout, s popisky. Vidí se skrz zem. Při načtení více herních režimů filtruje **Režim** zápasy podle režimu. Cíle pocházejí ze souboru zápasu převodníku vedle záznamu nebo uvnitř kontejneru [`.3dheat`](container.md).

## Popisky a statistiky {#labels-and-statistics}

- **Popisky**: pravidla pro každý druh (**Vybrané**, **Letadla**, **Pozemní**, **Lodě**, **Zbraně**, **AI**): zobrazit nebo ne, které hodnoty, a **Priorita** pro to, kdo dostane místo, když se popisky překrývají. **Nepřekrývat popisky** přesune popisek vedle jeho jednotky, když by zakryl jinou, a vynechá ho tam, kde není místo. **Velikost popisků** je 60 až 250 %. **Zpět na jméno, vozidlo, výšku a rychlost** pravidla vrátí na výchozí.
  - Pozemní jednotky začínají jménem, vozidlem a rychlostí.
  - Letadla začínají jménem, vozidlem, výškou a rychlostí.
  - Lodě začínají jménem, vozidlem, rychlostí a kurzem.
  - Najetím na jednotku uvidíte všechny její hodnoty.
- **Statistiky**: pro každý tým a jednotku: zabití, smrti, výstřely, zásahy, poměr zásahů, vzlety, přistání, čas ve vzduchu, nejvyšší rychlost, výška a G, vzdálenost. Export do CSV.
- **Grafy**: hodnoty jednotky v čase, dvě jednotky porovnané, nebo jedna hodnota proti jiné.

## Mnoho zápasů najednou {#many-matches-at-once}

Pro položení stovek nebo tisíců zápasů přes sebe viz [Mnoho zápasů najednou](many-matches.md). Podrobnosti o figurách (kouř, oheň, jiné časované efekty): [Figury v překryvu figur](figure-replay.md). Seznam funkcí Tacview: [Parita s Tacview](tacview-parity.md), podstránka této stránky.
