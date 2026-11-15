---
title: "Pozadie sveta"
parent: "Levely a geometria pozadia"
nav_order: 5
has_children: true
lang: "sk"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Skutočný svet ako pozadie

Pozadie sveta položí skutočný terén pod záznam letu: kopce, cesty, rieky, letiská a budovy, stiahnuté z voľných otvorených mapových dát. Použite ho vtedy, keď by sa záznam Tacview inak vznášal nad prázdnou mriežkou. Je to [level](glossary.md), takže teplo a figúrky stoja na ňom.

## Zostavte ho {#build-one}

1. Načítajte záznam letu, ktorý hovorí, kde na zemi sa nachádza (súbor Tacview `.acmi`), alebo nenačítajte nič a v kroku 3 vyberte bojisko. Pozri [Ako dostať dáta dnu](getting-data-in.md).
2. Otvorte **Pozadie / level** na bočnom paneli.
3. Stlačte **Skutočný svet ako pozadie**, aby sa pod vaše dáta zostavil terén. Alebo vyberte hernú mapu v **Bojisko** a stlačte **Zostaviť pozadie bojiska** (alebo **Streamovať bojisko**).
4. Počkajte. Panel ukazuje priebeh (*Dlaždice výšok*, *Dlaždice máp*, *Zostavovanie pozadia*); **Zrušiť** ho zastaví.
5. Preleťte sa. Riadok s uvedením zdroja mapových dát je zapísaný vpravo dole vo výhľade.

Prvé zostavenie stiahne niekoľko desiatok megabajtov. Prehliadač ich ponechá, takže druhé zostavenie tej istej oblasti nič nesťahuje. **Zabudnúť dlaždice máp** ich zmaže. Tlačidlo **Skutočný svet ako pozadie** sa zobrazí len vtedy, keď načítané dáta nesú geografický odkaz (nižšie).

Všetko sa zostavuje na pozadí v pracovnom vlákne ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Výsledok nahradí aktuálny level a správa sa ako ktorýkoľvek [3D level](model-levels.md): skrýva teplo za sebou, dá sa rozrezať rezom, má [ovládanie vzhľadu](level-appearance.md) a dá sa uložiť do [knižnice](level-library.md).

## Kde sú dáta: zemepisný odkaz {#where-the-data-is-the-geographic-reference}

Dátová sada dostane zemepisný odkaz len z zdroja, ktorý ho uvádza:

- **Záznam ACMI**: jeho hlavička `ReferenceLatitude` a `ReferenceLongitude` a pozície, ktoré čítač premietne na rovinu dotykajúcu sa elipsoidu WGS84 v tom mieste (X na východ, Y na sever, v metroch; výšky sú nadmorská výška záznamu). Odkaz sa zachová, keď mapovanie berie **X** a **Y** ako osi zeme - to robia vlastné nápovedy záznamu - a zahodí sa, keď zem pochádza z iného stĺpca, napríklad z plochého sveta hry, **U** a **V**.
- **Tabuľka Parquet, ktorej nápovedy `heat3d` obsahujú položku `geo`** - tabuľky DCS, MSFS, X-Plane a IL-2 (Tacview) z [Watchera](https://github.com/Holdi601/3DHeat-Watcher). Položka je popísaná v časti [Pre vývojárov](#for-developers).

Pri načítaní viacerých súborov sa odkaz zachová len vtedy, keď všetky zdieľajú ten istý. Každý iný načítač je nedotknutý a žiadny odkaz nemá.

Pozadie sa premieta rovnako a potom prejde cez mapovanie osí načítania, takže dopadne pod dáta bez ohľadu na to, aké prevrátenia alebo mierku mapovanie použije.

## Bojiská {#theatres}

Výber **Bojisko** ponúka reálne mapy DCS World (Kaukaz, Nevada, Normandia 2, Kanál, Sýria, Perzský záliv, Mariány, Mariány WWII, Južný Atlantik, Sinaj, Afganistan, Kola, Nemecko studenej vojny, Irak) a IL-2 Great Battles (Stalingrad, Moskva, Kubáň, Porýnie, Normandia, Prochorovka, Velikije Luki, Arras, Odessa, Fínsky záliv / Leningrad, Kórea), každé so svojím políčkom na zemi ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). Políčka DCS sú rozsahy, ktoré použili editori, vypočítané z uverejnených projekcií; políčka IL-2 a tie DCS, ktoré sú tak označené, sú odhady z uverejnených veľkostí máp a miest na ich okrajoch - panel hovorí, ktoré sú ktoré.

**Zostaviť pozadie bojiska** zostaví dve úrovne podrobnosti v jednej sieti:

| Úroveň | Oblasť | Terén | Mapa |
|---|---|---|---|
| Bojisko | celé políčko | najhlbšie priblíženie až do 10, ktoré potrebuje najviac 64 dlaždíc výšok (asi 3 km na vrchol nad Kaukazom, 1 km nad Normandiou) | more, jazerá, krytie terénu a diaľnice z najviac 64 vektorových dlaždíc pri priblížení 4 až 9 |
| Podrobná oblasť | **Pod dátami**, **Okolo bodu** (zemepisná šírka, dĺžka, 12 až 400 km), alebo žiadna | až do priblíženia 12 v najviac 100 dlaždiciach, najviac 500 000 vrcholov | všetko vyššie, z najviac 1 500 vektorových dlaždíc pri najhlbšom priblížení až do 14, ktoré sa zmestí |

Podrobná oblasť vyreže dieru do mriežky bojiska, rozšírenú na celé bunky, aby obe mriežky zdieľali svoje okrajové čiary, a tenká stena uzavrie šev tam, kde vzorkujú výšky inak.

Keď sú dáta načítané, bojisko sa zostaví v rovine dát, takže pod nimi dopadne tak, ako bolo zostavené. Bez dát sa zostaví okolo vlastného referenčného bodu bojiska (celé stupne pri jeho podrobnej oblasti). Dáta načítané neskôr na inom odkaze - záznam ACMI si uvádza vlastný - posunú pozadie pod seba: presný posun medzi oboma projekciami sa vypočíta na mriežke 256 × 256 nad pozadím a číta sa medzi uzlami, s odchýlkou jeden či dva metre na celom bojisku ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Pozadie uložené do knižnice si zachová svoje miesto a pri načítaní pod inými dátami sa posunie rovnako.

### Streamovanie bojiska {#streaming-a-theatre}

**Streamovať bojisko** ukazuje bojisko tak, ako mapový prehliadač simulátora letu: zem prichádza ako veľa malých dlaždíc okolo kamery, načítavajú sa počas letu a zahadzujú sa, keď sú mimo dosahu ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Kvadrantový strom dlaždíc Web Mercator.** Korene pri priblížení 5 pokrývajú 1 500 km okolo kamery, takže zem sahá za políčko bojiska až k horizontu. Dlaždica sa rozdelí na štyri deti, kým je kamera bližšie než 1,4-násobok jej šírky, až po priblíženie 15 (asi 1 km na dlaždicu, 15 m medzi vrcholmi terénu): podrobnosti klesajú so vzdialenosťou tak, ako klesajú na obrazovke.
- **Každá dlaždica má vlastnú sieť**, zostavenú v pracovnom vlákne ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): mriežka terénu 65 × 65 s okrajom okolo svojho kraja (aby sa susedia s inou podrobnosťou nikdy nezlomili), na nej namaľované krytie terénu a more, navrchu cesty, železnice, jazerá, rieky, letiská, zamerané dráhy a budovy, a voliteľne satelitný obraz svojho štvorca. Renderer kreslí dlaždice vzhľadom a pravidlami hĺbky levelu, takže skrývajú teplo za sebou ako ktorýkoľvek level.
- **Najprv hrubé.** Dlaždice sa žiadajú hrubé a blízke ako prvé, štyri sťahovania naraz na zdroj; kým sa načítavajú deti dlaždice, dlaždica ich zastupuje, takže výhľad sa hneď vyplní a potom sa zostrí.
- **Pamäť**: zostavené dlaždice sa držia do 600 MB, najskôr sa zahodí tá, ktorú kreslili najdávnejšie. **Sťahovania** zostávajú v cache dlaždíc, obmedzené na rozpočet 2 GB, najstaršie von ako prvé: prelet nad oblasťou, ktorú ste už videli, nič nestojí, a nie je tu žiadny limit na zostavenie.
- **Uložené do knižnice** ako to, čo sa streamuje - bojisko, jeho možnosti a jeho miesto na zemi - nie ako dlaždice: načítanie znova streamuje, z cache dlaždíc tam, kde ešte sú. Kliknutia a inšpektor zasiahnu dlaždice tak, ako zasiahnu ktorýkoľvek level.
- Obe renderery kreslia dlaždice: overené vedľa seba na skutočnej grafickej karte (WebGPU a WebGL2 na tej istej karte), vrátane tepla skrytého za hrebeňom.
- Keď sú dáta načítané, dlaždice sa zostavia v rovine dát; dáta načítané neskôr v inej rovine dlaždice prestavia tam (z cache).
- Namerané na syntetických letoch nad troma miestami (Normandia, Nevada, Sýria): asi 63, 45 a 24 MB pri prvej návšteve s obrazom; druhá návšteva nič nesťahuje.


## Čo sa zostavuje {#what-is-built}

| Časť | Zdroj | Ako |
|---|---|---|
| Obraz (streamované bojiská, voliteľné) | EOX Sentinel-2 cloudless 2016 | **Satelitný obraz** prekryje zem bezoblačnou mozaikou z roku 2016 (asi 10 m na pixel, priblíženie 14, hlbšie dlaždice ju zväčšia) namiesto namaľovaného krytia terénu; cesty, dráhy, budovy a názvy zostávajú navrchu. |
| Jemnejší obraz (USA, Francúzsko) | USGS National Map orthoimagery; IGN BD ORTHO | Keď je **Satelitný obraz** zapnutý, mapová dlaždica od priblíženia 13, ktorá leží celá vo vnútri súvislých USA alebo metropolitného Francúzska, vezme namiesto toho národnú ortofotomapu, o dve priblíženia hlbšie než dlaždica (šestnásť jej dlaždíc je zložených do jedného obrázka, asi 1 - 2 m na pixel zblízka). Inde EOX. |
| Terén (streamované bojiská) | Mapterhorn | Copernicus GLO-30 všade (asi 19 m na pixel pri priblížení 12), v mierke metrov tam, kde je vo výškomere krajiny vlastný prieskum (Francúzsko, USA a ďalšie); čítané o dve priblíženia hrubšie než každá dlaždica. AWS Terrain Tiles, ak sa Mapterhorn nedá dosiahnuť. |
| Terén | AWS Terrain Tiles (Terrarium PNG) | Mriežka výšok nad políčkom: priblíženie je najhlbšie až do 12 (asi 28 m na pixel pri 43° s. š.), ktoré potrebuje najviac 36 dlaždíc, a mriežka sa proredí na najviac 400 000 vrcholov. Kreslí sa ako zem s obvyklými tieňmi reliéfu. |
| Cesty, železnice | OpenFreeMap vektorové dlaždice, vrstva `transportation` | Ploché pásy prekryté na terénu, zhustené na rozostup terénu a zdvihnuté o niekoľko percent jeho výšky, aby sa s ním nebili. Šírky podľa triedy, od 16 m (diaľnica) po 3 m (chodník, železnica); nikdy užšie než uhlopriečka políčka / 5000. Chodníky, trajekty a tunely sa vynechajú. |
| Letiská | vrstva `aeroway` | Mnohouholníky dráhy, rolovacej dráhy, plochy a pristávacej plochy pre helikoptéry prekryté ako zem; čiary dráhy a rolovacej dráhy ako pásy 45 m a 18 m. |
| Voda | vrstva `water` | More ploché na 0 m, jazerá a rybníky ploché na svojom najnižšom brehu, rieky prekryté. Kreslené ako voda: plochotienované, bez vrstevníc. |
| Krytie terénu | vrstvy `landcover` a `landuse` | Namaľované na vlastné vrcholy terénu, bez ďalších trojuholníkov: lesy, trávniky a parky zelené, poľnohospodárska pôda slamová, mokrade, piesok, skala, ľad; obytné, priemyselné, komerčné, vojenské plochy a lomy v stlmených tónoch. Voda je namaľovaná aj pod vodnou hladinou, takže breh je čitateľný z ktorejkoľvek výšky. Holá zem dostane tichý výškový nádych (nížinná sivozelená, vrchovinná hnedá, sneh nad 3 000 m). Čitateľné pri rozlíšení terénu: asi 30 - 45 m v podrobnej oblasti, kilometre v bojisku. |
| Názvy miest | vrstvy `place` a `aerodrome_label` | Mestá, mestečká a dediny, a letiská s ich kódom ICAO, napísané nad výhľadom; ako ďaleko sa ukazuje každý druh, rastie s výškou kamery, najviac 70 naraz. |
| Zamerané dráhy | [OurAirports](https://ourairports.com/data/) `runways.csv` (verejná doména) | Voliteľné (**Pristávacie dráhy z OurAirports**, predvolene zapnuté): každá otvorená dráha s oboma koncami v zozname, od prahu k prahu v jej uvedenej šírke, s bočnými pruhmi, prerušovanou stredovou čiarou a prahovými pruhmi. Jeden zoznam 4 MB, stiahnutý raz a uložený v cache. |
| Budovy | vrstva `building` | Stopy vytlačené z `render_min_height` do `render_height` (6 m, ak chýba) nad najnižšou zemou pod nimi; časti `hide_3d` sa preskočia. Kreslené ako stavby. |

Vektorové dlaždice sa čítajú pri priblížení 14 (jediné s budovami), keď políčko potrebuje najviac 300 z nich, inak pri najhlbšom priblížení, ktoré to umožní, až po 8. Väčšia oblasť dostane len terén.

### Vzhľad {#look}

Pozadie sa spustí so zapnutou možnosťou **Zobraziť zachytenú farbu** - farba je to, čo odlíši svetlú cestu od šedej zeme, na ktorej leží, tmavú dráhu od jej plochy - s vypnutými hranami trojuholníkov zeme, pretože pravidelná mriežka nič nehovorí, s jemnými vrstevnicami, s nepriehľadným morom (podlaha pod ním by bojovala s hladinou o hĺbku z diaľky) a s budovami svetlosivými a takmer plnými, ako ich kreslí mapa. Otvorené more nedostane žiadne trojuholníky zeme. Všetko ostatné je predvolený vzhľad modelového levelu.

## Zápisy na plátne {#credits-on-the-canvas}

Kým je pozadie level, uvedenie zdrojov sa zapíše vpravo dole vo výhľade bez potreby kliknutia, aby ho niesli snímky obrazovky a vykreslené videá:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Elevation: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; and others

Každá časť odkazuje na stránku s uvedením zdroja (openstreetmap.org/copyright a [zoznam uvedení](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) Terrain Tiles). Pozadie uložené do knižnice si zachová svoje uvedenia a pri načítaní ich zobrazí znova. Text je preložený spolu s prehliadačom; názvy nie.
## Zdroje a ich podmienky {#sources-and-their-terms}

Každý zdroj, jeho licencia a to, ako pozadie zostáva v rámci podmienok: [Skutočný svet ako pozadie: zdroje a podmienky](world-backdrop-sources.md).

## Cache dlaždíc {#the-tile-cache}

Každá dlaždica a TileJSON vektorových dlaždíc sa uchováva v Cache API prehliadača pod `3dheat-world-tiles-v1`, podľa URL. Druhé zostavenie tej istej oblasti nerobí žiadne požiadavky a funguje offline: TileJSON sa pýta ako prvý a keď zlyhá, jeho uložená kópia pomenuje dlaždice, ktoré už sú držané. Dlaždice, ktoré server nemá (otvorené more, 404), sa tiež pamätajú ako chýbajúce.

URL vektorových dlaždíc nesú dátum zostavenia mapy, takže keď OpenFreeMap zverejní nové zostavenie, ďalšie pozadie stiahne čerstvé dlaždice a staré zostanú, kým sa nevymažú. Cache je obmedzená na 2 GB: keď ju prekročí, najskôr sa zmažú dlaždice uložené najdávnejšie. **Zabudnúť dlaždice máp** zmaže celú cache. Cache potrebuje zabezpečený pôvod (`https://` alebo `localhost`); inde každé zostavenie sťahuje znova.


## V porovnaní s Tacview {#compared-with-tacview}

Overené okom na jednom mieste na bojisko, so syntetickými záznamami: rozbehy pri vzlete ležia na stredových čiarach nakreslených dráh, prechody pobrežím padnú na pobrežie. Stránka Tacview je z jeho dokumentácie a jeho uverejnených snímok obrazovky (tacview.net, jeho stránka na Steame), nie z toho, že by sme ho tu spúšťali.

| | Tacview 1.9 | Toto pozadie, streamované |
|---|---|---|
| Rozsah | celý glóbus | 1 500 km okolo kamery, kdekoľvek je |
| Terén | ETOPO1 (asi 1,25 km) vstavaný; SRTM 25 - 75 m, ak používateľ nainštaluje súbory; terén DCS exportovaný z DCS | Copernicus GLO-30 (Mapterhorn), v mierke metrov vo Francúzsku a USA |
| Obraz | nič vstavané; textúry, ktoré si používateľ stiahne (Mapview, SAS Planet, doplnky ako VFR mapa Kaukazu) | EOX Sentinel-2 cloudless 2016, asi 10 m, streamovaný |
| Krytie terénu | žiadne, pokiaľ nie je v textúre | z OpenStreetMap, namaľované na terén (bez obrazu) |
| Cesty, železnice | žiadne, pokiaľ nie sú v textúre | každá trieda blízko kamery, hlavné cesty ďaleko |
| Budovy | žiadne | vytlačené stopy blízko kamery |
| Letiská | nápisy a dráhy ako ploché škatule, bez značení | dráhy z zameraných koncov s bočnými pruhmi, stredovou čiarou a prahovými pruhmi; rolovacie dráhy, plochy; názvy s kódmi ICAO |
| Názvy miest | niektoré nápisy dedín a miest | mestá, mestečká, dediny, letiská podľa vzdialenosti a výšky |

Kde ešte zaostáva:

- **Rozlíšenie obrazu**: mimo USA a Francúzska je satelitná mozaika s rozlíšením 10 m pod asi 2 km rozmazaná; Tacview s textúrou zoom 17, ktorú si nainštaluje používateľ, je tam ostrejší.
- **Terén vo vlastnom tvare DCS**: Tacview dokáže zobraziť terén, ktorý DCS sám exportuje; tu je to skutočná zem, ktorá sa líši od terénu DCS tam, kde ho tvorcovia máp zmenili.
- **Zakrivenie**: zem je plochá rovina, takže horizont nie je zakrivenej zeme; Tacview kreslí guľu.
- **Rýchlosť**: prvá návšteva miesta stiahne desiatky megabajtov, kým je ostré; v prehliadači s renderovaním na procesore (snímky obrazovky) kreslí pri niekoľkých stovkách dlaždíc niekoľko snímok za sekundu.

## Limity a čo príde neskôr {#limits-and-what-comes-later}

- **Rozlíšenie terénu**: najlepšie asi 30 m a na veľkých oblastiach hrubšie. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFF na AWS, bez kľúča, pevný text uvedenia) je lepší zdroj: 30 m všade, GLO-90 tam, kde GLO-30 má diery (Arménsko a Azerbajdžan, ktoré pokrýva DCS Caucasus). Potrebuje čítač GeoTIFF a zatiaľ sa nepoužíva.
- **Lepší terén**: Copernicus GLO-30 na AWS neposiela hlavičky CORS, takže prehliadač ho nedokáže čítať; zrkadlo OpenTopography sa dá čítať (CORS a rozsahy), ale ich podmienky pre beh verejnej aplikácie nie sú známe - pred akýmkoľvek použitím sa treba opýtať. Mapterhorn už GLO-30 nesie.
- **Zakrivenie**: zem je plochá rovina a výšky sa neznižujú pre zakrivenie zeme, čo zodpovedá tomu, ako sa záznamy umiestňujú (nadmorská výška ako výška); ďaleko od odkazu sa obe časti posúvajú spolu, o menej než tisícinu pri 100 km. Ohnutie len dlaždíc by ich od dát ďaleko oddelilo, preto sa neponúka. Zakrivený horizont potrebuje rovnaký pokles - štvorec vzdialenosti od kamery delený dvojnásobkom polomeru zeme - uplatnený v každom prechode, ktorý kreslí pozíciu (level, dlaždice, teplo, čiary, škatule, nápisy, výber) ako jedna spoločná premenná; skutočný glóbus potrebuje pozície dát so stredom v Zemi a vykresľovanie vzhľadom ku kamere. Oboje je naplánované s režimom glóbu.
- **Iba dnešný svet**: historické mapy DCS a IL-2 (Normandia 2, Kanál, Nemecko studenej vojny, každá mapa IL-2) sú kreslené so súčasnými mestami, cestami a pobrežnými stavbami; panel to hovorí. Obdobné letiská sa nekreslia.
- **Žiadny režim glóbu**: pozadie je plochý lokálny rovinný priestor. Pohľad na celú zem je naplánovaný.
- Cesty sa na veľkých oblastiach rozšíria, aby zostali viditeľné; zblízka sú širšie než v skutočnosti.
- Názvy bojísk DCS v tabuľkách Watchera sa párujú tak, ako ich dáva DCS v `mission.theatre`; názov, ktorý nie je v zozname, sa vráti k prvému bodu zaokrúhlenému na celé stupne a len k zemepisnej šírke a dĺžke.

## Historické mapy (zatiaľ nezostavené) {#historical-maps-not-built-yet}

Obdobné mapy by mohli neskôr obtiahnuť historické bojiská. Rad máp US Army Map Service (AMS) je dielo vlády USA, všeobecne považované za verejnú doménu (skontrolujte záznam každého skenu; mnohé sú dotlače britských GSGS alebo nemeckých originálov, ktorým sa koruná autorské práva alebo termín anonymného diela tiež už minul):

| Bojisko | Rad | Kde sú naskenované |
|---|---|---|
| IL-2 Stalingrad, Moskva, Kubáň, Velikie Luki, Prochorovka, Leningrad | AMS **N501**, Východná Európa 1:250 000 (zostavená v 50. rokoch z sovietskych a nemeckých máp) | UT Austin PCL; niektoré listy georeferencované na UT GeoData |
| IL-2 Normandia, DCS Normandia 2 a Kanál | AMS **M661** / GSGS 4250, Francúzsko 1:50 000 | UT Austin PCL, Princeton |
| IL-2 Porýnie | AMS **M501** 1:250 000 a **M841** 1:25 000 (Nemecko) | UT Austin PCL |
| IL-2 Kórea | AMS **L751** 1:50 000 (vydania z roku 1951) a **L552** 1:250 000 | ANU Open Research (listy L751, „copyright expired“), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | britské mapy zákopov z 1. svetovej vojny (nie AMS) | McMaster University; National Library of Scotland (nekomerčné podmienky) |

Listy AMS nesú značky zemepisnej šírky a dĺžky v rohoch, takže každý by sa umiestnil štvorrohým prispôsobením a obtiahol na terén ako textúra, zostavený a uložený lokálne ako dlaždice.

## Pre vývojárov {#for-developers}

### Položka `geo` v tabuľke Parquet {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` a `up` pomenúvajú stĺpce, ktoré držia metre na východ a na sever na tej istej dotykovej rovine v (`lat0`, `lon0`) a nadmorskú výšku. Načítanie nesie odkaz, keď jeho mapovanie berie presne tieto stĺpce (východ ako X, sever a výška ako Y a Z v ľubovoľnom poradí). Voliteľná položka `dcs` pomenúva vlastné metre tabuľky DCS (x sever, y hore, z východ) a jej bojisko: načítanie, ktoré mapuje tieto stĺpce, sa namiesto toho umiestni cez priečnu Mercatorovu projekciu bojiska ([Súradnice DCS](#dcs-coordinates)). Tabuľka bez `geo` sa číta ako predtým.

### Súradnice DCS {#dcs-coordinates}

Každé bojisko DCS je priečna Mercatorova projekcia (WGS84, mierka 0,9996) so svojím stredovým poludníkom a falošným počiatkom; x DCS je severný smer a z východný smer. Konštanty sú tie, ktoré uverejňuje projekt pydcs; matematika je Krügerov rad do šiesteho rádu (Karney 2011), prenesený do [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Pozadie pre metre DCS sa zostaví priamo v nich, takže tabuľka Watchera DCS mapovaná cez `dcs_x`/`dcs_y`/`dcs_z`, level, ktorý zapísal konvertor terénu DCS, a pozadie zdieľajú jeden rámec. Konštanty Iraku nie sú uverejnené; sú prispôsobené uverejneným referenčným bodom (4 cm stredná kvadratická odchýlka).

Tabuľky DCS Watchera ležia na dotykovej rovine v pevnom referenčnom bode bojiska (rovnaký bod, aký používa výber bojiska, nižšie), takže viaceré misie na jednom bojisku sa zlúčia so zachovaným referenciou a zarovnajú sa s bojiskovým pozadím bez toho, aby sa pohli.

### Zjednodušenie a rozpočet {#simplification-and-budget}

- Budovy pod 20 m² sa zahodia; 60 m², keď je políčko širšie než 30 km, 150 m² za 80 km. Ostatné sa pridávajú od najväčšej po najmenšiu, kým budovy nedosiahnu 1,5 M trojuholníkov.
- Vedľajšie cesty, servisné cesty a chodníky sa zahodia za 60 km šírky; za 150 km zostanú len diaľnice, hlavné, prvotné a druhotné cesty.
- Celé pozadie zostane pod asi 3 M trojuholníkmi. Poznámka pri importe hovorí, koľko budov sa vynechalo.
