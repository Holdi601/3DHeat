---
title: "Kanyarról kanyarra elemzés"
parent: "Versenyelemzés"
nav_order: 55
lang: "hu"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Kanyarról kanyarra elemzés

Ugyanazon pálya két körét hasonlítjuk össze kanyarról kanyarra. Minden kanyarnál a viewer megmondja, ki volt a gyorsabb, mennyi időt ért, és miért – túl korán fékezett, későn kapott gázt, szélesebb vonalat vett –, hogy tudd, mit gyakorolj először.

![Egy megállapítás, amely a Hol lehet javítani részben nyílt meg, a Kanyarról kanyarra táblázat mellett](../assets/img/en/race-corner-finding.webp)

Egy kidolgozott példa: a 3. kanyarban az A vezető 20 m-rel korábban fékez, mint a B vezető, és 0,15 s-ot veszít az odaérésen, de korábban kap gázt, és 0,15 s-ot nyer a kijáratnál. Nettó 0,00 s: a kanyar egyenlő, és senkinek sem mondjuk, hogy később fékezzen.

## Amit látsz {#what-you-see}

### Hol lehet javítani {#where-to-improve}

Az oldalsáv szakasza a fókuszált körhöz („Tölts be legalább két kört egy pályáról.” addig).

**A fejléc:** „<kör> <idő> a(z) <referencia> <idő> ellen” és a köridő-különbség – vagy a referenciánál „az egyes kanyarokban leggyorsabb másik körrel szemben (…)” és az összes veszteség. Mellette a veszteség *vezetésre* és *autóra / körülményekre* bontva.

**A bontási sáv:** a kanyarok okcsoportjai szerint elveszített idő (fékezés, belépés, kijárat, egyenes, autó, körülmények), az ok színeivel, jelmagyarázattal.

**A megállapítások**, három lista:

1. A vezetés okozta veszteségek, a legdrágább elöl, legfeljebb **12** – vagy „Nincs olyan hely, ahol más vezetéssel időt lehetne nyerni.”
2. **Mutasd, mibe került az autó vagy a helyzet (X s)** – az autó és a körülmények veszteségei, legfeljebb 8 (alapból bekapcsolva).
3. **Ahol <kör> gyorsabb, vagy másként egyenlő (N)** – nyereségek és egyenlő kanyarok, legfeljebb 10 (alapból bekapcsolva).

Minden megállapítás mutatja a sorszámát, a címét (a kanyar és mi történt, veszteségnél az ár), az ítélet sorát, az árat (nyereség mínusszal) egy sávval, és egy címkét: *fékezés*, *belépés*, *kijárat*, *egyenes* (a vezetés okozta veszteségeknél „· autó X” hozzáadva, ha az autó 0,02 s-ot vagy többet magyaráz), *autó*, *körülmények*, *gyorsabb*, *egyenlő*. **Kattints rá**, hogy az autók 40 m-rel előtte felsorakozzanak, bekeretezze és visszajátssza, és megnyisd a méréseit:

- **Fékezés:** hol fékezett (vagy engedett el) mindegyik, milyen sebességről, és hány méterrel korábban vagy később (5 m-től);
- **Leglassabb:** mindegyik kör minimumsebessége és hol;
- **Teljes gáz:** hol volt elengedve mindegyik, és mennyivel korábban vagy később;
- **Vonal:** a befordulási különbség, a legszorosabb sugarak, mennyire volt belül vagy kívül, és mindegyik kör vonalalakja és csúcspontja;
- **Egyenes a következő kanyarig:** a hossza, mindkét sebesség azon a ponton, ahol mindkettő lapos volt, mit vesztett vagy nyert és miből – a kiindulási sebesség, a másik erősebb húzása, egy levétel, elveszett sebesség, hogyan vezették (részek 0,02 s-tól);
- **Az autó:** mekkora része az veszteségnek az autó, és miből (húzóerő, tapadás, fékek; ha 0,02 s vagy több);

majd a tipp, **Az autók:** (különböző autóknál, lásd [Autóprofilok](race-car-profiles.md#what-the-cars-decide-in-a-corner)), és a vonaltanács.

### Kanyarról kanyarra {#corner-by-corner}

Egy táblázat (két vagy több körrel), soronként egy szakasz, a fókuszált kör osztályában, ha több osztály van:

| Oszlop | Mit mutat |
|---|---|
| Kanyar | `T3`, `T11-T12` |
| Leggyorsabb | a kör, amely a leggyorsabb volt rajta (a saját ideje a szakasz elejétől a végéig) |
| ennyivel | a második leggyorsabbhoz képesti előnye, s |
| vonal | a leggyorsabb kör alakja és csúcspontja („V · késői”, „U/V · közép”); egy fölé húzva a legszorosabb, a belépési és a kijárati sugár; „mindkét módon” egy vegyes komplexnél |
| (a fókuszált kör) | mennyivel maradt le a leggyorsabbtól, vagy ✓, ha ő volt a leggyorsabb |

Egy sorra kattintva ott megnyílik a fókuszált kör megállapítása (vagy a szakasz előtt 40 m-rel felsorakoztatja az autókat). A táblázat alatt, ha minden kanyarnak van ideje: „A leggyorsabb minden kanyarban, összerakva: <idő> (± a referencián / osztály legjobbján X)” – a legjobb szakaszok plusz a leggyorsabb futás az első kanyarig, ha az a saját szakasza.

## Hogyan dolgozzuk ki {#how-it-is-worked-out}

Az irányadó szabály: **a kanyart egészben ítéljük meg**, a hozzá tartozó fékezési zónától a következő fékezési zónáig. Az a kör, amely korábban fékez, hogy az autót hamarabb befordítsa és hamarabb ráadja a gázt, a megvásárolt kijáratot kapja jóváírva, és nem mondjuk neki, hogy később fékezzen.

## Egy távolságtengely {#one-distance-axis}

A köröket távolság szerint hasonlítjuk össze, nem idő szerint – egy másodperccel lemaradva két kör más kanyarban van. Nem is a saját kilométerszámlálójuk szerint (egy szorosabb vonal kevesebb métert tesz meg). A **referencia** kör megtett útja a tengely:

- Minden más kör mintáit a referencia útjára **vetítjük**: minden minta kap egy `s`-et, azt, hogy mennyire van a referencia mentén, és egy `d`-t, hogy mennyire van balra (pozitív) vagy jobbra. A keresés az előző találattól előre fut (8 szakasz visszafelé, 40 előre), így egy kör, amely keresztezi vagy alulról áthalad önmagán, sosem a másik keresztezésre ugrik. Az első mintát az út első negyedében keressük (pályán a start és a cél egybeesik); ha semmi nincs 30 m-en belül, akkor az utolsó találattól nem visszafelé eső legközelebbi pontot vesszük bárhol (egy pörgés vagy kisodródás után). Az `s` soha nem csökken: egy minta, amely az előzőtől visszafelé vetül, megtartja az értéket.
- Minden csatornát **újramintavételezzük** egy rácsra, **2 m-enként**, lineárisan; a lépcsős csatornákat (fokozat, zászlók) a legközelebbi mintával. A saját tartományán kívül az értékek üresek.
- Egy kör első és utolsó mintája kicsit a referencia végei előtt vetül, ezért minden kört **legfeljebb 15 m-rel** a végein túl visszük a megvolt sebességével (az idő a távolság osztva a sebességgel nő, a többi áll) – így a vonalnál mért deltája a köridő-különbsége.
- `delta` = egy kör ideje minden rácspontban mínusz a referenciáé: a lemaradás. `lateral` = `d` a rácson.

Az, hogy egy kör két rácspont között mennyivel tovább tartott, mint egy másik, a deltáik különbsége: `rel(s)`. Minden alábbi dolog erre épül.

## Kanyarok {#corners}

A **referencián** találjuk meg (`findCorners`), a sebességét ±6 m-en simítva, a görbületét (az irányváltozás ±5 mintán, ±10 m-en simítva):

1. **Sebességminimumok kiemelkedéssel.** Olyan pont, amely ±40 m-en belül a legalacsonyabb, és amelynek a sebességesése a legmagasabb sebességtől mindkét oldalon (egy alacsonyabb minimumig) legalább `max(2,5 m/s, a sebesség 6%-a)`.
2. **Törések.** A görbület helyi csúcsa, amelynek sugara **300 m**-nél szorosabb, és 80 m-en belül nincs sebességminimum: egy teljes gázzal vett törés is kanyar, amelyet vezetni kell.
3. **Fázisok.** Minden csúcstól visszafelé, amíg a referencia fékez (> 0,1) vagy nincs teljes gázon (< 0,95): a belépés; előre, amíg nincs teljes gázon: a kijárat. Egy lapos törés ±30 m-t kap. Az átfedő kanyarok külön maradnak, de úgy, hogy lefedjék a kört.
4. Számozva T1, T2 … a kör sorrendjében; **balra vagy jobbra** a görbület előjele szerint, és aszerint, hogy a világ tükrözött-e (az ismeretlen tükrözöttnek számít).

**A kanyar ablaka** (ahol a referencia fordul): a csúcs ±40 m-es körzetében lévő legszorosabb ponttól kifelé addig, amíg a görbület a csúcsa egyhatodánál magasabb marad, plusz 10 m mindkét oldalon. Az oldala adja a „belül” előjelét.

## Szakaszok: fékezési zónától fékezési zónáig {#segments-braking-zone-to-braking-zone}

Minden kanyar a két csúcsa közötti út felét birtokolja. Ebben:

- **Minden kör leglassabb pontja** a sebességének valódi mélypontja – nincs lassabb 6 m-en belül (3 rácspont) mindkét oldalon, a szakasz végein túlnézve, hogy az előző kanyar kijáratán még gyorsuló autó sosem tévesztődjön össze vele –, a kanyar ablakától 15 m-rel előtte, a kanyar után 10 m-ig keresve. Ahol egy kör nem lassult, ott a csúcsba kerül.
- **Ahol egy kör elkezdett lassulni érte** (`entryOf`): a leglassabb pontjától visszafelé a fékezésen vagy a levételen át, a teljes gázos rövid megszakításokon át, amíg **10 m**-en keresztül le nem tette a lábát (gáz ≥ 0,95, fék ≤ 0,1); a leglassabb ponttól visszafelé utolsó **30 m**-en újra felvett gáz még a kanyarhoz tartozik; teljes gázon végig: maga a leglassabb pont. Egy kör gázcsatorna nélkül, vagy amely az előző kanyar óta sosem tette le a lábát, a közbülső leggyorsabb pontjában kezd.
- **A szakasz kezdete** az első kör kezdete, amely elkezd lassulni érte (4 m-rel korábban), és a következő kezdetéig tart, így minden kör fékezése a szakaszban van, és a szakaszok lefedik a kört.

**Komplexek.** Egymást követő kanyarok, amelyek között a referencia sosem megy teljes gázon – kevesebb mint **40 m** teljes gáz –, egy szakasz, „T11-T12”, egyben vezetve; egy komplex legfeljebb **három** kanyart tartalmaz (egy kanyargós szakasz, amelyet sosem vezetnek lapos állapotban, új komplexet kezd). Az a komplex, amely mindkét irányba kanyarodik, *vegyes*: nincs rá egyetlen vonalalak mérve.

**Pályán** (a referencia 50 m-en belül ér véget onnan, ahol kezdődött), az utolsó szakasz egyenese átfut a célvonalon az első fékezési pontig: egy repülő kör futása a vonaltól az utolsó kanyarhoz számít. Az a kör, amely álló helyzetből vagy versenyrajtból indult (lásd [A rajt](#the-start)), ezt a futást külön tartja.

### Mire vezet egy kanyar {#what-a-corner-leads-onto}

A referencián mérve: a kanyar után teljes gázon megtett méterek (a teljes gáztól a szakasz végéig, plusz a futás a vonalon át), és előtte (az előző szakasz „utána” értéke, vagy a kezdettől).

| Típus | Szabály |
|---|---|
| **két egyenes között** (`both`) | előtte 200 m vagy több **és** utána 120 m vagy több |
| **egyenesbe vezető** | utána 200 m vagy több, vagy utána 120 m vagy több, és legalább annyi, mint előtte |
| **egyenes után** | előtte 200 m vagy több |
| **összekötő** | minden más |

## Mit csinált egy kör egy kanyarban {#what-each-lap-did-in-a-corner}

`cornerMetrics`, körönként és szakaszonként, a rácson (2 m-es lépés). Pedálok: a fék 0,1 felett számít, a teljes gáz 0,95 és afölött.

| Mérték | Szabály |
|---|---|
| **fékezési pont** | az első fék, amely alatt a gáz levétele történt (0,5 alatt), vagy amely **15 m**-ig tartott – a bal láb érintése gázon nem az, ahol a fékezés kezdődött; csak érintéseknél az első érintés |
| **levéve** | fék nélkül az első pont, ahol a gáz 0,8 alá ment |
| (nincs pedál) | a pont, ahol a kör elkezdett lassulni (fent) |
| **fék elengedése** | az utolsó fék, legfeljebb 30 m-rel a leglassabb pont után |
| **sebesség a fékezési pontnál**, **fékezési méterek** | a leglassabb pontig |
| **csúcsfék**, **csúcslassulás** | a fékezési zónán át (a 45 m/s²-nél nagyobb gyorsulásokat figyelmen kívül hagyjuk) |
| **féklassítás** (trail braking) | méterek, ahol fék > 0,05 és |kormány| > 0,1 |
| **blokkolási csúszás** | a legnagyobb negatív kerékcsúszási arány a zónában (ha a körnek van csúszása) |
| **leglassabb pont**, **minimumsebesség** | mint fent |
| **gáz be** | az elengedés (vagy a leglassabb pont) után az első gáz > 0,15 fék nélkül |
| **teljes gáz** | az első pont ezután, ahol 10 m-en át ≥ 0,95 volt |
| **gurulás** | méterek az elengedéstől a gáz beadásáig, ahol fék és gáz is 0,05 alatt |
| **gázdipek** | hányszor esett a gáz 0,25-tel a futó csúcsa alá a gáz be és a teljes gáz között |
| **oldalirányú csúcs** | a legnagyobb oldalirányú gyorsulás az elengedés előtt 20 m-től a későbbi teljes gázig, illetve a leglassabb pont után 20 m-ig |
| **fokozat a csúcsnál** | a leglassabb pontnál |
| **pörgési csúszás** | a legnagyobb hajtott kerék-csúszási arány a gáz be és a teljes gáz között |
| **egyensúly** | első mínusz hátsó csúszásszög a közepén (+ alulkormányzás) |
| **egyenes teljes gázon** | a szakasz része a teljes gáz után (és a vonalon átfutó futás) ≥ 0,95-ön; a leghosszabb levétel rajta |
| **elveszített sebesség** | a legtöbb sebesség, amit egy magas pontról elveszítünk, gázon ≥ 0,9, fék nélkül, a talajon |
| **belépési sódrift** | a legnagyobb sodródási szög a fékezési ponttól 5 m-rel a leglassabb pont után, a talajon |
| **kézifék** | ahol bekapcsolt (> 0,2), legfeljebb 10 m-rel a leglassabb pont után |
| **levegő** | másodpercek a levegőben a szakaszon, és a leghosszabb repülése |

## Kivel hasonlítjuk össze az egyes köröket {#who-each-lap-is-compared-with}

- Egy kört a **saját teljesítményosztályának leggyorsabb teljes köréhez** hasonlítunk (a referenciához a referencia osztályában).
- Maga az osztály legjobb köre (és a referencia) szakaszonként hasonlítva van ahhoz **az osztályának azon másik köréhez, amely a leggyorsabb volt rajta** – vagy mindegyik köréhez, ha egyedül van az osztályában.

Az időtérkép, a körlistában a hiányosságok, az autóvezetési események és a kanyartáblázat ugyanezt az összehasonlítást követik.

## Egy kanyar időmérlege {#the-time-account-of-a-corner}

`compareCorner`, egy körre a másik ellen egy szakaszon:

- **nettó** = `rel(vége) - rel(eleje)` (plusz a vonalon átfutás repülő körnél): az ítélet. **0,03 s**-nál közelebb: **egyenlő**.
- **A felbontás** – hogy a kanyarban belül hol fordult az előny: a mindkét kör első fékezési pontja vagy leglassabb pontja és a későbbi teljes gáz / leglassabb pont közötti szakaszon a legnagyobb lendület, amelyet a kör utána visszaadott vagy visszanyert, ha ez a lendület **0,04 s** fölött van; egyébként a két leglassabb pont közül a későbbi.
- **A csúcsig** = `rel(felbontás) - rel(eleje)`; **utána** = a nettó mínusz ez. Ha mindkettő legalább 0,04 s, és ellentétes előjelű, a kör az egyiket a másikra **cserélte**.
- **Utána** újra felbomlik, ahol mindkét kör teljes gázon van: a **kijárat** (a felbontástól a későbbi teljes gázig) és az **egyenes** (onnan a végéig).
- **Az egyenes** három részre oszlik:
  - *kijárati sebesség* (`byExit`) – mért, nem modellezett: a lassabb autó a gyorsabb autó kezdősebességét egy kicsit az egyenesen lefelé eléri, és onnan a saját nyoma az, amit ebből a sebességből csinálna, a saját fokozataival, légellenállásával és emelkedőjével együtt. Arra a pontra visszatolva (és a nyert méterekre a végsebességén futtatva) ez a gyorsabb indulás ideje; a különbség a kijárati sebesség ára. Ha a lassabb autó nem éri el azt a sebességet (vagy csak az utolsó 2 mintában), a szakaszon saját gyorsulását visszaadjuk teljesítményként (`a·v` tartva), sosem erősebben, mint amit a burkolója mutat ugyanazon a sebességen (a mért gyorsulás kétszerese burkoló nélkül).
  - *az autók húzóereje* (`byPower`) – csak különböző autóknál: mindkét autó ugyanarról a sebességről, ugyanazon a méteren, teljes gázon, integrálva minden sebességnél mutatott teljes gázos gyorsulását.
  - *hogyan vezették* (`driven`) – a maradék: egy levétel, teljes gázon elveszített sebesség.

  A kijárati sebesség sosem magyaráz többet, mint amennyibe az egyenes került (és sosem ellentétes előjellel), hacsak egy levétel vagy elveszített sebesség nem vett vissza belőle. Egy kör **levett** az egyenesen, ha teljes gázon mért részaránya 0,9 alatt van és a másik részaránya mínusz 0,05 alatt; az elveszített sebesség akkor számít, ha a két kör 1 m/s-nál többel tér el. A 0,02 s alatti előjel-eltérés 0-ra állítódik.

Minden szakasz nettói összeadódnak a köridő-különbséggel, és minden kanyar csúcsig és utána értékei összeadódnak a nettójával (a tesztek mindkettőt ellenőrzik).

### Az autó részesedése {#the-cars-share}

Csak akkor, ha a körök **különböző autókban** vannak, és a kör időt veszített (`carShare`):

- **húzóerő**: az autók húzóereje az egyenesen lefelé (fent), legfeljebb a veszteségig;
- **tapadás**: ha a kör az autója határán volt (oldalirányú gyorsulás a közepén legalább **90%**-a annak, amit az autó az adott sebességnél tart), a másik autó pedig **5%**-nál többet tart: az alacsonyabb minimumsebességből, amelyet nem magyaráz szorosabb sugár, a `½ ln(tapadás_más / tapadás_enyém) / ln(sebesség_más / sebesség_enyém)` részesedés a megmaradt veszteségből;
- **fékek**: ha a kör fékezett (nem levett), a másik autó **5%**-nál erősebben fékez, és a kör *átlagos* lassulása a zónában legalább **80%**-a annak, amit az autója képes: `u`-ról `v`-re `a1` lassulással szemben `a2`-vel, ugyanazon a ponton végezve, `(1/a1 - 1/a2)(u - v)² / 2u`, a maradékig.

Az autó költsége az összeg, legfeljebb a veszteségig.

## Az ítélet és a megállapítás {#the-verdict-and-the-finding}

A `cornerFinding` körönként és kanyaronként legfeljebb egy megállapítást ír, az alábbi sorrendben próbálgatva:

| Eset | Megállapítás | Eredmény |
|---|---|---|
| a nettó ±0,03 s-on belül, csere, és a kisebb oldal **0,1 s** vagy több | **egyenlő, két úton át** – ki volt lassan be és gyorsan ki, ki fordítva; ha utána egyenes jön (egyenesbe vezető, vagy kettő között), a lassan be, gyorsan ki út az, amelyre építeni kell: tartsd a korai gázt, a belépést inkább erősebb fékezéssel szerezd vissza, nem később | egyenlő |
| egyébként a nettó ±0,03 s-on belül | nincs mit mondani | - |
| nyert, csere, a csúcsig veszített | **a lassan be, gyorsan ki kifizetődött**: tartsd meg, itt többet ér a kijárat | nyereség |
| nyert, csere, a csúcsig nyert | **gyorsabb a bemenetnél**: a belépés helyes, egy korábbi teljes gáz többet tartana meg | nyereség |
| nyert, és a másik körnek itt vesztesége van | **gyorsabb – a másik tettének köszönhetően**, az okával és tippjével: „A másik körnek: …” | nyereség |
| egyébként nyert | **gyorsabb a bemenetnél / kimenetnél**, aszerint, melyik fél hozott többet (későbbi fékezés, több sebesség a közepén; vagy korábbi egyenesedés, erősebb húzóerő) | nyereség |
| veszített, és **baleset vagy ütközés** legalább `max(0,05 s, a veszteség 40%-a)` | a becsapódás a kanyar története, az autók előtt | veszteség |
| veszített, és az **autó részesedése** 60% vagy több | **az autó**: húzóereje az egyenesen, tapadása a közepén, vagy fékei – a legnagyobb rész; a vezető része (≥ 0,03 s) „A másik X s: …” formában | veszteség |
| veszített, és egy meg nem osztott **autókezelési hiba** legalább `max(0,05 s, 40%)` | ez a hiba (lent), azzal, ahogyan az idő mozgott körülötte | veszteség |
| veszített, és egy **hosszabb repülés** legalább `max(0,05 s, 40%)` | a repülés | veszteség |
| veszített, csere, a csúcsig nyert | **túl gyorsan be, lassan ki**: a kijárat oka; adj fel egy kis belépést, hogy hamarabb befordulj és lapos legyél, a másik kör fék- és teljes gázpontjaival. Gyökere (`cause`, amit a [statisztikák](race-course-statistics.md) számolnak): későbbi fékezés, ha néhány méternél többel később fékezett a másiknál; egyébként a kijárat oka | veszteség |
| veszített, csere, a csúcsig veszített | **többet adott a belépésben, mint amennyit a kijárat visszahozott**: a belépés oka, amely egyben a gyökere (`cause`); tartsd a kijáratot, és a belépésben kevesebbet veszíts | veszteség |
| veszített, az egyenesen levéve, és a vezetett rész a veszteség felénél több | **nincs teljes gázon az egyenesen**: a teljes gázon töltött része a másikéhoz képest, és hol és meddig tartó levétel | veszteség |
| veszített, az autók húzóereje a veszteség 60%-a fölött, és az egyenes felénél több | **az autó húzóereje az egyenesen** (mindkét autó húzóerejével 160 km/h-nál) | veszteség |
| egyébként veszített | a jobban veszítő fél oka (a csúcsig, ha ≥ utána: a belépésé; különben a kijáraté). Csak azért lassabb kijövetelkor, mert a közepén volt lassabb (1 m/s-nál többel): helyette a közép oka | veszteség |

Egy veszteségre vonatkozó megállapítás végződhet **Még:** résszel is – elveszített sebesség teljes gázon, vagy levétel az egyenesen –, ha az egyenes vezetett része 0,04 s-nál többe került, és ez nem volt már az ok.

A megállapítások úgy vannak rendezve, hogy előre jönnek a veszteségek, a legdrágább elöl; utána a nyereségek és az egyenlő kanyarok.

### Okok a belépésnél {#causes-on-the-way-in}

Az `entryCause`, az első, amely alkalmazható (a minimumsebesség-különbségek m/s-ban; az „5 m” az a küszöb, amellyel egy korábbi vagy későbbi pont számít):

| # | Ok (hiba) | Szabály |
|---|---|---|
| 1 | baleset vagy ütközés a belépésnél | egy meg nem osztott becsapódás, amely a leglassabb pont után 10 m-ig kezdődik |
| 2 | **majdnem megállt** (incidens) | a leglassabb sebesség a **60%**-a alatt annak, amit az autó tapadása enged ott, ahol a másik ment át (`v_más · √(tapadás_enyém / tapadás_más)`, ha a másik autó jobban tapad, különben a másik sebessége), a másik kör 8 m/s fölött – pörgés, érintkezés vagy elhibázott kanyar |
| 3 | autókezelési hiba a belépésnél | egy meg nem osztott blokkolás, tolás, pörgés vagy csúszás, amely nincs gázon, és a leglassabb pont után 10 m-ig kezdődik, költsége ≥ 0,02 s |
| 4 | hosszabb repülés a leglassabb pont előtt | lásd [ralli](#rally-rotation-and-flights) |
| 5 | **levett**, ahol a másik teljes gázon maradt, vagy legalább 5 m-rel később vett le | ez a kör csak levett |
| 6 | **fékezett**, ahol a másik csak levett vagy teljes gázon maradt | és a közepén több mint 0,5 m/s-mal lassabb volt |
| 7 | **gyengén fékezett** | fékezett (nem vett le), és lett volna hely erősebben fékezni – az adatokkal, a blokkolási csúszása a **60%**-a alatt annak a csúszásnak, ahol az autó fékjei a legjobbat adják; nélkülük a csúcs lassulása az adott sebességnél mutatott érték **85%**-a alatt – a pedál 0,95 alatt, és a másik kör csúcslassulása több mint **15%**-kal magasabb |
| 8 | **korán fékezett** – vagy **az autó fékei** | legalább 5 m-rel korábban fékezett a másiknál. Egy másik autóban, amelynek fékei 5%-nál erősebbek, és legfeljebb 10 m tartalékkal az autó saját lassulásával szükséges távolsághoz képest: az autó fékei. Egyébként korán fékezett, „Későbbi fékezés – kb. N m” tanáccsal (másik autóban az autó által szükségesnél többel) |
| 9 | **gurult** | több mint 10 m egyik pedál nélkül, és 5 m-rel több, mint a másik |
| 10 | **lassabb a közepén** | a leglassabb pontnál több mint 0,5 m/s-mal lassabb; felbontva `v² = a·R` szerint (lent) |
| 11 | **lassabban érkezett** | a fékezési pontnál több mint 1 m/s-mal lassabb, nem fékezett korán: előbb eldőlt – az előző kanyar és az autó húzóereje, vagy az előző kanyarban egy 0,2 s-mal hosszabb repülés szerint. Az autóé, ha az autók különböznek |
| 12 | lassabb a csúcsig | egyébként: a féket simábban engedd el, és gurulj több sebességet a közepére |

**Lassabb a közepén** (`middleSplit`): minden kör sugarát a leglassabb pontjánál a saját útjából mérjük (±8 m), oldalirányú gyorsulását `v²/R`-ként, és

`ln(v_más / v_enyém) = ½ ln(a_más / a_enyém) + ½ ln(R_más / R_enyém)`.

- A sugár **a felét vagy többet** magyarázza: **túl szűk vonal** – „használd többet az utat”, mindkét sugárral és a résszel.
- Az autó határán (aszfalton 10°-nál, lazán 20°-nál nagyobb csúszásnál, vagy oldalirányú gyorsulás legalább 90%-a annak, amit az adott sebességnél tart), és a másik autó több mint 5%-kal jobban tapad: **az autó tapadása**; ehelyett a kijáratot védd.
- Csúszva halad át rajta (sodródás 10° / 20° fölött), és a másik kör nem (a belépési sodródása legalább 4°-kal kisebb): **oldalirányban** – a tapadásán túl, nem híjján annak; érkezz kicsit lassabban. Az autóéként mondjuk, ha ez az autó legalább egy körönként eggyel többször kapja el a hátsóját, mint a másik.
- Másik autóban, amely a másikénak **96%**-a alatt tart, és a kör `v_más · √(tapadás_enyém / tapadás_más)` 1 m/s-on belül volt: **az autó tapadása** – „későbbi fékezéssel ezt nem lehet behozni”.
- Egyébként **tartalék tapadás**: oldalirányú gyorsulás a másikéhoz hasonló sugáron, és amit ez az autó tart; vigyél több sebességet a csúcsig. Ahol ennek az autónak a hátsója az utolsó tapadás előtt enged (csúszása a tapadásának 85%-a alatt kezdődik, és a kör ennek 80%-án volt), a maradékot kis lépésekben keresd.

### Okok a kijáratnál {#causes-on-the-way-out}

Az `exitCause`, az első, amely alkalmazható:

| # | Ok (hiba) | Szabály |
|---|---|---|
| 1 | autókezelési hiba a kijáratnál | meg nem osztott kerékpörgés, pörgés, csúszás vagy becsapódás, amely a leglassabb pont előtt 10 m-ig vagy később ér véget |
| 2 | **elveszített sebesség** | teljes gázon több mint 1 m/s-mal több sebességet veszít, mint a másik; **7 m/s (25 km/h)** fölött „inkább érintkezésre vagy pörgésre hasonlít, mint csúszásra” |
| 3 | **rosszul fordította az autót** (laza talaj) | lásd [ralli](#rally-rotation-and-flights) |
| 4 | **később ment gázra** | a gáz be több mint 5 m-rel később, a saját leglassabb pontjától számítva is (a később leglassabb kört nem hibáztatjuk a későbbi gázért) |
| 5 | **habozott a gázon** | több gázdip, mint a másiknál |
| 6 | **szélesen ment és várakozott** | több mint 1,5 m-rel kívül a másiktól, ahol mindkettő lapos volt, és a teljes gáz több mint 5 m-rel később, a saját leglassabb pontjától számítva |
| 7 | **később teljes gáz** | a teljes gáz több mint 5 m-rel később, a saját leglassabb pontjától is; az autó ottani gyorsulásával |
| 8 | **az autó hajtása** | másik autóban, amely ugyanazon a sebességen a másiknak 95%-a alatt húz, és a húzóerő magyarázott valamennyit az egyenesből |
| 9 | **lassabb a kanyarból kijövet** | egyébként: későbbi csúcs, így az autó hamarabb egyenesbe kerül |

Ha a két kör a leglassabb pontnál más fokozatban volt, a tipp végén ez áll: „A csúcsnál N. fokozat; a másik M-et használt.”

### Autókezelési hibák és becsapódások {#car-control-faults-and-impacts}

A [Autóvezetési események](race-control-events.md) egy hibája okként: a blokkolás *fékezési* ok, a pörgés vagy csúszás gázon *kijárati* ok, a többi *belépési*; a becsapódás a leglassabb pont után *kijárati*, előtte *belépési*. A tipp az esemény saját tippje, majd „Körülbelül X s-ba került, 40 m-rel utána” (vagy „amíg az autó vissza nem nyerte a sebességét” becsapódásnál). Ha egy blokkolás fékpontja 5 m-nél korábbi a másikénál, hozzáteszi, hogy a kör korán is fékezett – a kerekek forgásánál nem kellett volna.

### Ralli: forgás és repülések {#rally-rotation-and-flights}

**Laza talajon**, sodródási szögekkel mindkét körön, és ha ez a kör a gázon (vagy laposan) több mint 5 m-rel később van:

- **Kevesebbet fordította az autót**: a másik legalább **12°**-ot fordított rajta a leglassabb pontjáig, és legalább **8°**-kal többet, mint ez a kör. Tipp: levétel vagy a bal lábbal a fék érintése, ahogy befordul, a másik kör kézifék-pontjával, ha csak ő használta, vagy a kézifék 15 m/s-nál (54 km/h) lassabb kanyarban.
- **Túl sokat fordította**: ennél a körnél legalább **12°** volt, és legalább **12°**-kal több, mint a másiknál: ki kellett egyenesíteni, mielőtt a gáz lemehetett.

**Hosszabb repülés**: a levegőben 0,2 s-mal vagy többel hosszabb a másiknál, és legalább 0,03 s-ba kerül a felszállás előtti 10 m-től a landolás utáni 40 m-ig (vagy a szakasz végéig). A leglassabb pont előtt belépési ok; a kanyar története lesz, ha a veszteség 40%-át vagy többet magyaráz. A tipp: tartsd a gázt a felszálláskor, a dombtetőt kicsit lassabban vedd, vagy a fék érintésével.

### A rajt {#the-start}

Az első kanyar előtt, sprintnél vagy ha bármelyik kör álló helyzetből indult (5 m/s alatt, ha mindkettő először van a tengelyen), vagy versenyrajtnál (a másik sebességének 60%-a alatt), a futás az első fékezési pontig saját megállapítás (0. kanyar), ha 0,03 s-nál többel különbözik: *A rajt*, *A verseny rajtja* vagy *Az első kanyarig*. Egy ott keletkező veszteség a helyzetnek (*körülmények*) tudható be, ha az egyik kör versenyrajttal, a másik menet közben indult; az autónak, ha az autók különböznek; egyébként a vezetőnek. Tippek: másik autóban álló helyzetből „többnyire az autó”; állórajtnál ugyanazzal az autóval indulj kevesebb pörgéssel, és váltsd a teljesítménycsúcsnál; versenyrajtnál hasonlítsd össze egy másik első körrel; repülő rajtnál az utolsó kanyar jobb kijárata átviszi a vonalon.

## A megtett ív {#the-driven-line}

A `lineMetrics`, körönként és szakaszonként (vegyes komplexeknél nem), csak pozíciókból (±2 mintán simítva) a kanyar ablakán:

| Mérték | Szabály |
|---|---|
| görbület | az irányváltozás ±8 m-en a kör saját útján |
| **legszorosabb sugár** | 1 / a csúcsgörbület |
| **befordulás** / **kikanyarodás** | ahol a görbület először / utoljára meghaladja a csúcsának egyötödét |
| **közép** | ahol a kör az irányváltozása felét megfordult |
| sugár be / ki | a félig megtett irányváltozás előtt / után megtett méterek, a közép előtt / után |
| **alak** | legszorosabb sugár osztva az átlagos sugárral kanyarodás közben: **0,55** alatt egy **V**, **0,75** fölött egy **U**, közte „U/V” |
| **csúcspont** | kijárati sugár osztva belépési sugárral: **1,25** fölött késői, **0,8** alatt korai, egyébként közép |
| **sebesség-csúcspont** | ha a leglassabb pont több mint **15 m**-rel a közép előtt van: lassan be, gyorsan ki; több mint 15 m-rel utána: a közepén még lassul |

A másik körrel szemben: mennyire ment belül (+) vagy kívül a befordulásnál, a legszorosabb részén, és ahol mindkettő lapos volt (1 m-től mondva); hol fordult be mindegyik (8 m-től mondva).

### Melyik vonal illik ehhez az autóhoz itt {#which-line-suits-this-car-here}

A `lineFor`, abból, mire vezet a kanyar, és az autó jelleméből ennél a kanyarnál:

- **teljesítmény–tapadás** = az autó teljes gázos gyorsulása a kijárati sebességnél osztva a tapadásával a minimumsebességnél (a burkolóból). **Point and shoot** **0,45** felett és afölött; **momentum** **0,25** alatt és alatta.
- **leszorítóerő**: a tapadás 151–252 km/h között osztva a tapadással 54–108 km/h között, **1,15** vagy több, egy **144 km/h**-nál (40 m/s) vagy gyorsabban vett kanyarnál – akkor a teljesítménytől függetlenül momentum-kanyar. Laza talajon nem ítéljük meg.

| Kanyar típusa | Autó | Vonal |
|---|---|---|
| egyenes után | point and shoot / más | V / U, a csúcspont középen: „a fékezési zóna a jutalom” |
| két egyenes között | momentum / más | U / V, késői csúcspont |
| összekötő | momentum / más | U / V, csúcspont középen: „a következő kijáratára vezesd” |
| egyenesbe vezető | momentum (vagy egy gyors leszorítóerős kanyar) | széles, kerek U, kicsit késői csúcspont |
| egyenesbe vezető | point and shoot | V: egyenesen fékezz, későn fordulj be, rövid, szoros középen forgass, korán egyenesedj |
| egyenesbe vezető | a kettő között | U késői csúcsponttal: lassan be, gyorsan ki |

Ahol a kijárat számít (egyenesbe vezető, két között), a hajtásrendszer egy mondatot ad hozzá: **FWD** – a fékeken forgasd, a teljesítményt csak akkor add, ahogy a kerék kiegyenesedik; **RWD** 0,35-ös vagy nagyobb teljesítmény–tapadás mellett – egyenesítsd ki a teljes gáz előtt; **AWD** – még fordulás közben is tud gázt venni. Laza talajon minden vonalhoz hozzáadódik: fordítsd az autót befelé.

A mondat ezután azt mondja, mit vezetett a kör, és hogy illik-e: *a későn lassult csúcs megköti a kijáratot*, vagy *a korai csúcspont megköti a kijáratot*, ahol késői csúcspontot kellett volna; *kerekebb, mint amit ez az autó kíván*, ahol V-t kellett volna; *szögletesebb, mint amit ez az autó kíván*, ahol U-t kellett volna; egyébként *ez illik*.

## Fejlesztőknek {#for-developers}

Kód: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Az érvelés és a forrásai: [a módszer](race-analytics.md).
