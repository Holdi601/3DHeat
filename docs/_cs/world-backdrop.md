---
title: "Pozadí světa"
parent: "Levely a geometrie pozadí"
nav_order: 5
has_children: true
lang: "cs"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Pozadí světa

Pozadí světa klade skutečný terén pod záznam letu: kopce, silnice, řeky, letiště a budovy, stažené z volných otevřených mapových dat. Použijte ho, když by záznam Tacview jinak plul nad prázdnou mřížkou. Je to [úroveň](glossary.md), takže teplo i figury leží na ní.

## Vytvoření {#build-one}

1. Načtěte záznam letu, který říká, kde na Zemi je (soubor Tacview `.acmi`). Nebo nenačítejte nic a v kroku 3 vyberte bojiště. Viz [Načítání dat](getting-data-in.md).
2. Otevřete v postranním panelu **Pozadí / úroveň**.
3. Stiskněte **Skutečný svět jako pozadí**, aby se postavil terén pod vašimi daty. Nebo vyberte herní mapu v **Bojiště** a stiskněte **Sestavit pozadí bojiště** (nebo **Streamovat bojiště**).
4. Počkejte. Panel ukazuje průběh (*Výškové dlaždice*, *Mapové dlaždice*, *Sestavuje se pozadí*). **Zrušit** to zastaví.
5. Létejte kolem. Řádek s uvedením zdroje mapových dat je vpravo dole v zobrazení.

První sestavení stáhne několik desítek megabajtů. Prohlížeč je drží, takže druhé sestavení stejné oblasti nestáhne nic. **Zapomenout dlaždice map** je smaže. Tlačítko **Skutečný svět jako pozadí** se ukáže jen tehdy, když načtená data nesou zeměpisnou vztažnou hodnotu (níže).

Vše se staví v pomocném procesu na pozadí ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Výsledek nahradí aktuální úroveň a chová se jako každá [3D úroveň](model-levels.md). Schovává za sebou teplo, je řezán řezem, má [ovládání vzhledu](level-appearance.md) a dá se uložit do [knihovny](level-library.md).

## Kde jsou data: zeměpisná vztažná hodnota {#where-the-data-is-the-geographic-reference}

Datová sada dostane zeměpisnou vztažnou hodnotu jen od zdroje, který ji uvádí:

- **Záznam ACMI**: jeho hlavička `ReferenceLatitude` a `ReferenceLongitude` a pozice, které čtečka promítne na rovinu dotýkající se elipsoidu WGS84 v tom místě (X na východ, Y na sever, v metrech; výšky jsou nadmořské výšky záznamu). Vztažná hodnota se zachová, když zobrazení bere **X** a **Y** jako osy země, jak to říkají vlastní nápovědy záznamu. Zahodí se, když země pochází z jiného sloupce, například z plochého světa hry, **U** a **V**.
- **Tabulka Parquet, jejíž nápovědy `heat3d` nesou položku `geo`**: tabulky DCS, MSFS, X-Plane a IL-2 (Tacview) z [Watcheru](https://github.com/Holdi601/3DHeat-Watcher). Položka je popsána v části [Pro vývojáře](#for-developers).

Načtení více souborů si vztažnou hodnotu ponechá, jen když všechny sdílejí tu stejnou. Každý jiný načítač je nezasažen a žádnou nenese.

Pozadí se promítá stejným způsobem a pak prochází mapováním os načtení. Přistane tak pod daty, ať mapování převrací nebo mění měřítko jakkoli.

## Bojiště {#theatres}

Výběr **Bojiště** vypisuje mapy reálného světa z DCS World (Kavkaz, Nevada, Normandie 2, Kanál, Sýrie, Perský záliv, Marianské ostrovy, Marianské ostrovy WWII, Jižní Atlantik, Sinaj, Afghánistán, Kola, Německo za studené války, Irák) a z IL-2 Great Battles (Stalingrad, Moskva, Kuban, Porýní, Normandie, Prochorovka, Velikije Luki, Arras, Oděsa, Finský záliv / Leningrad, Korea). Každé má svůj obdélník na Zemi ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). Obdélníky DCS jsou rozměry, které zveřejnili editoři, spočítané z publikovaných projekcí. Obdélníky IL-2 a ty DCS, které jsou tak označeny, jsou odhady z publikovaných velikostí map a z měst na jejich okrajích. Panel říká, které jsou které.

**Sestavit pozadí bojiště** postaví dvě úrovně podrobnosti v jedné síti:

| Úroveň | Oblast | Terén | Mapa |
|---|---|---|---|
| Bojiště | celý obdélník | nejhlubší přiblížení až do 10, které potřebuje nejvýš 64 výškových dlaždic (asi 3 km na vrchol nad Kavkazem, 1 km nad Normandií) | moře, jezera, pokryv půdy a dálnice z nejvýš 64 vektorových dlaždic při přiblížení 4 až 9 |
| Podrobná oblast | **Pod daty**, **Kolem bodu** (zeměpisná šířka, délka, 12 až 400 km), nebo žádná | až přiblížení 12 v nejvýš 100 dlaždicích, nejvýš 500 000 vrcholů | všechno níže, z nejvýš 1 500 vektorových dlaždic při nejhlubším přiblížení až 14, které se vejde |

Podrobná oblast vyřízne díru do mřížky bojiště. Rozšíří se na celé buňky, aby obě mřížky sdílely své okrajové čáry. Tenká stěna uzavře šev tam, kde vzorkují výšky jinak.

Když jsou data načtena, staví se bojiště v rovině dat, takže přistane pod nimi tak, jak bylo postaveno. Bez dat se staví kolem vlastního vztažného bodu bojiště (celé stupně u jeho podrobné oblasti). Data načtená později na jiné vztažné hodnotě (záznam ACMI si ji určuje sám) přesunou pozadí pod sebe. Přesný přesun mezi oběma projekcemi se počítá na mřížce 256 × 256 přes pozadí a čte se mezi uzly. Odchylka je metr nebo dva přes celé bojiště ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Pozadí uložené do knihovny si zachová své místo a při načtení pod jinými daty se přesune stejně.

### Streamování bojiště {#streaming-a-theatre}

**Streamovat bojiště** ukazuje bojiště tak, jak to dělá prohlížeč map simulátoru letu. Terén přichází jako mnoho malých dlaždic kolem kamery. Načítají se, jak se letí, a zahazují, když jsou mimo dosah ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Čtyřstromová síť dlaždic Web Mercator.** Kořeny při přiblížení 5 pokrývají 1 500 km kolem kamery, takže terén sahá za obdélník bojiště až k obzoru. Dlaždice se rozdělí na své čtyři potomky, zatímco je kamera blíž než 1,4násobek její šířky, až do přiblížení 15 (asi 1 km na dlaždici, 15 m mezi vrcholy terénu). Podrobnost klesá se vzdáleností, jako klesá na obrazovce.
- **Každá dlaždice vlastní síť**, postavenou v pomocném procesu ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): mřížka terénu 65 × 65 s lemem kolem okraje, aby sousedé s různou podrobností nikdy neukázali trhlinu. Na ní pokryv půdy a moře, nahoře silnice, železnice, jezera, řeky, letiště, zaměřené dráhy a budovy, a volitelně satelitní snímek jejího čtverce. Vykreslovač kreslí dlaždice se vzhledem a pravidly hloubky úrovně, takže schovávají teplo za sebou jako každá úroveň.
- **Nejdřív hrubě.** Dlaždice se žádají hrubě a blízko nejdřív, po čtyřech stažení naráz na zdroj. Dokud se načítají potomci dlaždice, dlaždice je zastupuje. Zobrazení se tak naplní hned a pak se ostří.
- **Paměť**: postavené dlaždice se drží do 600 MB, nejdřív se zahazují ty, které se kreslily naposledy. **Stažené soubory** zůstávají v mezipaměti dlaždic, omezené na rozpočet 2 GB, nejstarší ven první. Let zpátky nad oblastí nic nestojí a na jedno sestavení není žádný strop.
- **Uloženo do knihovny** jako to, co se streamuje: bojiště, jeho možnosti a jeho místo na Zemi, ne jako dlaždice. Načtení znovu streamuje, z mezipaměti dlaždic tam, kde dlaždice ještě jsou. Kliknutí a inspektor zasáhnou dlaždice stejně jako v jakékoli úrovni.
- Oba vykreslovače kreslí dlaždice. Porovnáno vedle sebe na skutečné grafické kartě (WebGPU a WebGL2 na stejné kartě), včetně tepla schovaného za hřbetem.
- S načtenými daty se dlaždice staví v rovině dat. Data načtená později na jiné rovině je přestaví tam (z mezipaměti).
- Naměřeno na syntetických letech nad třemi místy (Normandie, Nevada, Sýrie): asi 63, 45 a 24 MB při první návštěvě se snímky. Druhá návštěva nestáhne nic.


## Co se staví {#what-is-built}

| Část | Zdroj | Jak |
|---|---|---|
| Snímky (streamovaná bojiště, volitelné) | EOX Sentinel-2 cloudless 2016 | **Satelitní snímky** položí bezoblačnou mozaiku z roku 2016 (asi 10 m na pixel, přiblížení 14, hlubší dlaždice ji zvětší) přes terén místo malovaného pokryvu. Silnice, dráhy, budovy a názvy zůstávají nahoře. |
| Jemnější snímky (USA, Francie) | USGS National Map orthoimagery; IGN BD ORTHO | Když je **Satelitní snímky** zapnuto, mapová dlaždice z přiblížení 13, která leží celá uvnitř souvislých USA nebo metropolitní Francie, vezme místo toho národní ortofoto, o dvě přiblížení hlouběji než dlaždice (šestnáct jejích dlaždic složeno do jednoho obrázku, zblízka asi 1–2 m na pixel). Všude jinde EOX. |
| Terén (streamovaná bojiště) | Mapterhorn | Copernicus GLO-30 všude (asi 19 m na pixel při přiblížení 12), na metrovou úroveň tam, kde je v něm vlastní měření země (Francie, USA a další). Čte se o dvě přiblížení hruběji než každá dlaždice. Pokud Mapterhorn není dostupný, AWS Terrain Tiles. |
| Terén | AWS Terrain Tiles (Terrarium PNG) | Mřížka výšek nad obdélníkem. Přiblížení je nejhlubší až do 12 (asi 28 m na pixel při 43° s. š.), které potřebuje nejvýš 36 dlaždic, a mřížka se proředí na nejvýš 400 000 vrcholů. Kreslí se jako země s obvyklými náznaky reliéfu. |
| Silnice, železnice | vektorové dlaždice OpenFreeMap, vrstva `transportation` | Ploché pásy položené na terén, zahuštěné na rozestup terénu a zvednuté o několik procent jeho výšky, aby s ním nebojovaly. Šířka podle třídy, od 16 m (dálnice) do 3 m (cesta, železnice). Nikdy užší než úhlopříčka obdélníku / 5000. Cesty, trajekty a tunely se vynechávají. |
| Letiště | vrstva `aeroway` | Mnohoúhelníky drah, rulovacích drah, odbavovacích ploch a helipadů položené jako země. Čáry drah a rulovacích drah jako pásy 45 m a 18 m. |
| Voda | vrstva `water` | Moře ploše na 0 m, jezera a rybníky ploše na nejnižším břehu, řeky položené na terén. Kreslí se jako voda: ploché stínování, bez vrstevnic. |
| Pokryv půdy | vrstvy `landcover` a `landuse` | Namalováno na vlastní vrcholy terénu, bez dalších trojúhelníků: lesy, tráva a parky zeleně, pole slámově, mokřad, písek, skála, led. Obytné, průmyslové, komerční, vojenské a lomové plochy v tlumených tónech. Voda se maluje i pod hladinou vody, takže pobřeží čitelné z každé výšky. Holá země dostane tichý výškový odstín (nížina šedozelená, vrchovina hnědá, sníh nad 3 000 m). Čitelné v rozlišení terénu: asi 30–45 m v podrobné oblasti, kilometry v bojišti. |
| Názvy míst | vrstvy `place` a `aerodrome_label` | Města, městečka a vesnice a letiště s kódem ICAO, napsané nad zobrazení. Jak daleko se která druh ukazuje, roste s výškou kamery, nejvýš 70 najednou. |
| Zaměřené dráhy | [OurAirports](https://ourairports.com/data/) `runways.csv` (volné dílo) | Volitelné (**Přistávací dráhy z OurAirports**, ve výchozím nastavení zapnuto): každá otevřená dráha, jejíž oba konce jsou v seznamu, od prahu k prahu v uvedené šířce, s bočními pruhy, čárkovanou středovou čarou a prahovými pruhy. Jeden seznam o 4 MB, stažený jednou a uložený v mezipaměti. |
| Budovy | vrstva `building` | Půdorysy vytažené z `render_min_height` do `render_height` (když chybí, 6 m) nad nejnižší zemí pod nimi. Části `hide_3d` se přeskočí. Kreslí se jako stavby. |

Vektorové dlaždice se čtou při přiblížení 14 (jediné s budovami), když obdélník potřebuje nejvýš 300 z nich. Jinak se čtou při nejhlubším přiblížení, které to splní, až dolů na 8. Větší oblast dostane jen terén.

### Vzhled {#look}

Pozadí začíná se zapnutým **Zobrazit zachycenou barvu**. Barva je to, co odliší světlou silnici od šedé země, na které leží, a tmavou dráhu od odbavovací plochy. Hrany trojúhelníků terénu jsou vypnuté, protože pravidelná mřížka nic neříká. Vrstevnice jsou slabé, moře je neprůhledné (podlaha pod ním by v dálce bojovala s povrchem o hloubku), a budovy jsou světle šedé a skoro plné, jak je kreslí mapa. Otevřené moře nedostane žádné trojúhelníky terénu. Všechno ostatní má výchozí vzhled modelové úrovně.

## Kredity na plátně {#credits-on-the-canvas}

Dokud je pozadí úrovní, zapíše se kredit jeho zdrojů vpravo dole ve zobrazení, bez potřeby kliknutí. Snímky obrazovky a vykreslená videa ho tak nesou s sebou:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Výšky: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; a další

Každá část odkazuje na stránku s uvedením autorství svého zdroje (openstreetmap.org/copyright a [seznam uvedení autorství](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) Terrain Tiles). Pozadí uložené do knihovny si kredity zachová a při načtení je znovu ukáže. Text se překládá spolu s prohlížečem, názvy ne.

## Zdroje a jejich podmínky {#sources-and-their-terms}

Každý zdroj, jeho licence a to, jak pozadí zůstává v podmínkách: [Pozadí světa: zdroje a podmínky](world-backdrop-sources.md).

## Mezipaměť dlaždic {#the-tile-cache}

Každá dlaždice a TileJSON vektorových dlaždic se drží v Cache API prohlížeče pod `3dheat-world-tiles-v1`, podle URL. Druhé sestavení stejné oblasti nedělá žádný požadavek a funguje offline. TileJSON se nejdřív zkusí načíst a když to selže, jeho uložená kopie jmenuje dlaždice, které už jsou k dispozici. Dlaždice, které server nemá (otevřené moře, 404), se zapamatují také jako chybějící.

URL vektorových dlaždic nesou datum sestavení mapy. Když OpenFreeMap vydá nové sestavení, další pozadí stáhne čerstvé dlaždice a staré zůstanou, dokud se nevymažou. Mezipaměť je omezena na 2 GB: když ji přeroste, smažou se nejdřív dlaždice uložené nejdéle. **Zapomenout dlaždice map** smaže celou mezipaměť. Mezipaměť potřebuje zabezpečený původ (`https://` nebo `localhost`). Jinde se každé sestavení stahuje znovu.

## Srovnání s Tacview {#compared-with-tacview}

Ověřeno okem na jednom místě za bojiště se syntetickými záznamy. Startovní rozjezdy leží na středových čarách vykreslených drah a přechody pobřeží padají na pobřeží. Strana Tacview vychází z jeho dokumentace a zveřejněných snímků obrazovky (tacview.net, jeho stránka na Steamu), ne z toho, že by se zde spouštěl.

| | Tacview 1.9 | Toto pozadí, streamované |
|---|---|---|
| Rozsah | celý glóbus | 1 500 km kolem kamery, kdekoli je |
| Terén | ETOPO1 (asi 1,25 km) vestavěný; SRTM 25–75 m, pokud si uživatel soubory nainstaluje; terén DCS exportovaný z DCS | Copernicus GLO-30 (Mapterhorn), na metrovou úroveň ve Francii a USA |
| Snímky | žádné vestavěné; textury, které si uživatel stáhne (Mapview, SAS Planet, doplňky jako VFR mapa Kavkazu) | EOX Sentinel-2 cloudless 2016, asi 10 m, streamované |
| Pokryv půdy | žádný, pokud není v textuře | z OpenStreetMap, namalován na terén (bez snímků) |
| Silnice, železnice | žádné, pokud nejsou v textuře | každá třída poblíž kamery, hlavní silnice v dálce |
| Budovy | žádné | vytažené půdorysy poblíž kamery |
| Letiště | popisky a dráhy jako ploché kvádry, bez značení | dráhy z zaměřených konců s bočními pruhy, středovou čarou a prahovými pruhy; rulovací dráhy, odbavovací plochy; názvy s kódy ICAO |
| Názvy míst | některé popisky vesnic a měst | města, městečka, vesnice, letiště, podle vzdálenosti a výšky |

Kde to pořád zaostává:

- **Rozlišení snímků**: mimo USA a Francii je 10m satelitní mozaika pod asi 2 km měkká. Tacview s uživatelem nainstalovanou texturou na přiblížení 17 je tam ostřejší.
- **Terén ve tvaru samotného DCS**: Tacview umí ukázat terén, který DCS samo exportuje. Tady je to skutečná Země, která se od terénu DCS liší tam, kde ho modeláři map změnili.
- **Zakřivení**: země je plochá rovina, takže obzor není obzor zakřiveného povrchu. Tacview kreslí kouli.
- **Rychlost**: první návštěva místa stáhne desítky megabajtů, než je ostré. V prohlížeči s programovým vykreslováním (snímky obrazovky) se kreslí několika snímky za sekundu s několika stovkami dlaždic.

## Limity a co přijde později {#limits-and-what-comes-later}

- **Rozlišení terénu**: nejlépe asi 30 m, na velkých plochách hruběji. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFF na AWS, bez klíče, pevný text kreditu) je lepší zdroj: 30 m všude, GLO-90 tam, kde GLO-30 má mezery (Arménie a Ázerbájdžán, které pokrývá DCS Caucasus). Potřebuje čtečku GeoTIFF a zatím se nepoužívá.
- **Lepší terén**: Copernicus GLO-30 na AWS neposílá hlavičky CORS, takže ho prohlížeč nemůže číst. Zrcadlo OpenTopography se číst dá (CORS i rozsahy), ale jejich podmínky pro běh veřejné aplikace nejsou známy. Před jakýmkoli použitím se musí zeptat. Mapterhorn už GLO-30 nese.
- **Zakřivení**: země je plochá rovina a výšky se nesnižují podle zakřivení Země. Odpovídá to tomu, jak se záznamy umísťují (nadmořská výška jako výška). Daleko od vztažného bodu se obojí posouvá společně, o méně než promile na 100 km. Ohnout jen dlaždice by je od dat v dálce odtrhl, proto se to nenabízí. Zakřivený obzor potřebuje stejný pokles (druhá mocnina vzdálenosti od kamery děleno dvojnásobkem poloměru Země), použitý v každém průchodu, který kreslí pozici (úroveň, dlaždice, teplo, čáry, kvádry, popisky, výběr), jako jednu společnou uniformu. Skutečný glóbus potřebuje pozice data vztažené ke středu Země a vykreslování vůči kameře. Obojí je plánováno s režimem glóbu.
- **Jen současný svět**: historické mapy DCS a IL-2 (Normandie 2, Kanál, Německo za studené války, každá mapa IL-2) jsou kresleny se dnešními městy, silnicemi a pobřežními úpravami. Panel to říká. Dobová letiště se nekreslí.
- **Žádný režim glóbu**: pozadí je plochá místní rovina. Pohled na celou Zemi je plánován.
- Silnice se na velkých plochách rozšiřují, aby zůstaly vidět. Zblízka jsou širší, než jsou ve skutečnosti.
- Názvy bojišť DCS v tabulkách Watcheru se páruje tak, jak je DCS dává v `mission.theatre`. Název, který není v seznamu, se vrátí k prvnímu určení polohy zaokrouhlenému na celé stupně, a jen k zeměpisné šířce a délce.

## Historické mapy (zatím nesestaveno) {#historical-maps-not-built-yet}

Dobové mapy by mohly později potáhnout historická bojiště. Série US Army Map Service (AMS) jsou díla vládní agentury USA, obecně považovaná za volné dílo. Ověřte záznam každého skenu. Mnohé jsou dotisky britských GSGS nebo německých originálů, u nichž už vypršela i autorská práva Koruny nebo anonymních děl:

| Bojiště | Série | Kde je sken |
|---|---|---|
| IL-2 Stalingrad, Moskva, Kuban, Velikije Luki, Prochorovka, Leningrad | AMS **N501**, Východní Evropa 1:250 000 (sestaveno v 50. letech ze sovětských a německých map) | UT Austin PCL; některé listy georeferencované na UT GeoData |
| IL-2 Normandie, DCS Normandie 2 a Kanál | AMS **M661** / GSGS 4250, Francie 1:50 000 | UT Austin PCL, Princeton |
| IL-2 Porýní | AMS **M501** 1:250 000 a **M841** 1:25 000 (Německo) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50 000 (vydání z roku 1951) a **L552** 1:250 000 | ANU Open Research (listy L751, „copyright expired“), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | britské mapy zákopů z 1. světové války (ne AMS) | McMaster University; National Library of Scotland (nekomerční podmínky) |

Listy AMS nesou zeměpisnou šířku a délku v rozích, takže by se každý zařadil přiložením podle čtyř rohů a položil na terén jako textura. Stavěl by se a uchovával lokálně jako dlaždice.

## Pro vývojáře {#for-developers}

### Položka `geo` v tabulce Parquet {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` a `up` jmenují sloupce, které drží metry na východ a na sever na stejné tečné rovině v (`lat0`, `lon0`), a nadmořskou výšku. Načtení nese vztažnou hodnotu, když jeho mapování bere přesně tyto sloupce (východ jako X, sever a výška jako Y a Z, v jakémkoli pořadí). Volitelná položka `dcs` jmenuje metry tabulky DCS (x na sever, y nahoru, z na východ) a její bojiště. Načtení, které mapuje tyto sloupce, se pak umístí přes příčnou Mercatorovu projekci tohoto bojiště ([souřadnice DCS](#dcs-coordinates)). Tabulka bez `geo` se čte jako dřív.

### Souřadnice DCS {#dcs-coordinates}

Každé bojiště DCS je příčná Mercatorova projekce (WGS84, měřítko 0,9996) s vlastním středním poledníkem a falešným počátkem. DCS x je severní souřadnice a z východní. Konstanty jsou ty, které zveřejňuje projekt pydcs. Matematika je Krügerova řada šestého řádu (Karney 2011), přenesená do [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Pozadí v metrech DCS se staví přímo v nich. Tabulka Watcheru DCS mapovaná přes `dcs_x`/`dcs_y`/`dcs_z`, úroveň, kterou napsal převaděč terénu DCS, a pozadí tak sdílejí jeden rámec. Konstanty pro Irák nejsou zveřejněny. Jsou dopasovány na zveřejněné referenční body (střední kvadratická odchylka 4 cm).

Tabulky Watcheru DCS leží na tečné rovině v pevném referenčním bodu bojiště (stejný bod, jaký používá výběr bojiště, níže). Několik misí na jednom bojišti se proto spojí se zachovanou vztažnou hodnotou a zarovnají se s pozadím bojiště, aniž by se pozadí pohnulo.

### Zjednodušení a rozpočet {#simplification-and-budget}

- Budovy menší než 20 m² se zahodí. Při obdélníku širším než 30 km je to 60 m², za 80 km 150 m². Zbylé se přidávají od největší po nejmenší, dokud budovy nedosáhnou 1,5 M trojúhelníků.
- Vedlejší silnice, obslužné silnice a cesty se za 60 km šířky zahodí. Za 150 km zůstanou jen dálnice, hlavní, primární a sekundární silnice.
- Celé pozadí zůstává pod asi 3 M trojúhelníků. Poznámka k importu říká, kolik budov bylo vynecháno.
