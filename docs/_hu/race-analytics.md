---
title: "Versenyelemzés: a módszer"
parent: "Versenyelemzés"
nav_order: 58
lang: "hu"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Versenyelemzés: a módszer

Röviden:

- A köröket **távolság szerint** hasonlítjuk össze, nem idő szerint, így a pálya ugyanaz a pontja egymás alá kerül.
- Minden kanyart **egészben** ítélünk meg, egyik fékezési zónától a következőig.
- Az elvesztett időt **szétbontjuk**: hol veszett el (fékezés, belépés, kijárat, egyenes), és mennyit magyaráz meg belőle az autó.
- Az okot **szavakkal magyarázzuk**, tanácsokkal együtt.
- Használathoz nem a működés olvasásához: lásd [Versenyelemzés](race-analysis.md).

Ez a módszer a **Versenyelemzés** fül mögött áll: mit mér, hogyan dönti el, hol veszett el az idő, és hogyan fordítja ezt tanácsokká. Ez az a specifikáció, amelyet az elemző kód (`src/race/`) követ, így minden szabálynak ott van a megfelelője és egy teszt, amely rögzíti.

## Amit a szakmai eszközök csinálnak {#what-the-professional-tools-do}

A bevált eszközök ugyanarra a magra jutnak, és főleg abban térnek el, mennyire mennek el az *okok* felé:

- **Mindent távolság szerint hasonlítanak össze, nem idő szerint.** Két kör egy közös távolságtengelyre kerül újramintavételezve; a futó időkülönbség ugyanazon a távolságon a *delta* (a MoTeC időeltérésnek hívja, mások időcsúszásnak vagy delta-görbének). Meredeksége megmondja, hol veszítünk most időt: a lapos szakasz gyorsítás, légellenállás vagy tartós tapadás; a meredek fékezési vagy gázkülönbség; a fel-le hullámzás a belépési sebesség és a kijárat közötti alkut jelenti.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [szakaszidő-elemzés](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Minden kanyar fázisokra oszlik**: fékezés, belépés, közép, kijárat – fékezési pont, a csúcsfék és az elengedés, a legkisebb sebesség és hol van, a fokozat, a gázra lépés, a visszatérés teljes gázra, a kijárati sebesség.
  ([Driver61: hat fázis](https://driver61.com/uni/corner-phases/),
  [iRacing körelemzési útmutató](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Minikörszakaszok kanyaronként, és elméleti legjobb**, amelyet mindegyik leggyorsabb részéből raknak össze.
  ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **A megtett ívet is összehasonlítják**, de sosem önmagában: „egy kép vonala nem jelent semmit, amíg nem ismered a közrejátszó tényezőket” – a sebességgörbével és a deltával együtt olvassák.
  ([Track Titan: hogyan elemezzük a telemetriát](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: versenyvonalak](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Kiváltó ok, nem tünet.** A veszteség az egyenesen valóban a gáz, vagy egy rossz belépés kényszerítette késői gázra? A hibákat a köridőre gyakorolt költségük szerint rangsorolják, és egyszerű nyelven magyarázzák.
  ([Track Titan edzési folyamatok](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Mi ment félre az első változatban, és miért számít {#what-went-wrong-in-the-first-version-and-why-it-matters}

Az első változat minden *fázist* külön terhelt, és csak a veszteségeket nézte. Az a kör, amely korábban fékezett, a fékezési fázisban veszített időt, és azt mondták neki, hogy később fékezzen – akkor is, ha a korábbi fékezés gyorsabban fordította be az autót, előbb került a gázra, és gyorsabban jött ki a kanyarból, és mindezt vissza is nyerte az egyenesen. Egy tesztben azt mondta annak a körnek, amely ezt tette, hogy „sokkal később fékezzen”, miközben a másik kör – amely később fékezett – elvétette a csúcspontot, túl széles lett, és éppen azt veszítette el, amit nyert. Az időadatok azt mutatták, hogy a két út szintén egyenlő; a tanács az ellenkezőjét mondta.

A javítás az a szabály, amelyben a fent felsorolt források mind egyetértenek: **a kanyart egészben ítéljük meg**, a hozzá tartozó fékezési zónától a következő fékezési zónáig, mert „néha néhány ezredmásodperc feláldozása egy kanyarban javíthatja a teljes köridőt, mert gyorsabb szakaszokat tesz lehetővé utána”
([Egy mesterséges versenyző vezetési stílusának torzítása](https://arxiv.org/abs/2504.12744)).

## A versenyzési tudás, amelyet a szabályok kódolnak {#racing-knowledge-the-rules-encode}

**A kijárati sebesség fontosabb a belépési sebességnél**, és annál inkább, minél hosszabb a következő egyenes: „az egyenesen töltött idő uralja a kanyarokban töltött időt”, a kijáratnál lévő sebességhiány pedig a következő fékezési pontba viszi át. A kanyarral és egyenessel együtt a leggyorsabb út gyakran az, ha lassabban kanyarodunk, hogy a gáz korábban jöjjön – *lassan be, gyorsan ki*.
([Race & Track Driving: sorrend a köridő javításához](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: a kanyarok sorrendje](https://driver61.com/uni/prioritising-corners/))
Egy minimális idejű tervező, amelyet a kijárati sebességért is jutalmaznak, a csúcspontjait később viszi, és *gyorsabb* kört kap; a kettőt egyensúlyba hozó jutalom egy `L` hosszú egyenesen `v` sebességnél, kijárati sebesség egységenként `L / v²`-et ér – egy sebességkülönbség egyenesen mért ára a hossz függvényében nő, és a sebesség négyzetével csökken
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**A kanyarok aszerint, mire vezetnek.** Egy egyenesbe vezető: maximalizáld a kijárati sebességet, késői csúcspont, a lehető leghamarabb vissza a gázra. Egy egyenes végén: maximalizáld az oda vitt sebességet, fékezz a lehető legkésőbb, a korábbi csúcspont elfogadható. Két kanyar között: az utána következő, fontosabb kanyarra kompromisszum. Ami bármelyik lehet, azt egyenesbe vezetőként kezeljük. A gyorsabb kanyarok többet nyomnak a latban: nagy sebességnél az autó gyengén gyorsul, és az elvesztett km/h-t nem nyeri vissza.
([Allen Berg: a három kanyartípus](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: a kanyarok sorrendje](https://driver61.com/uni/prioritising-corners/),
[Driver61: más kanyar, más technika](https://driver61.com/uni/different-corner-technique/))

**A súrlódási kör.** A gumi egy tapadási keretet kap, amelyet fékezésre, kanyarodásra és gyorsításra oszt el tetszőleges arányban; a teljes gyorsulás `sqrt(lat² + long²)`. A féklassítás (trail braking) ennek szélét követi: a fék a kormányzás és az oldalirányú terhelés nőttével együtt enged el.
([súrlódási kör](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**A gurulás** – egyik pedál sincs lenyomva – a leglassabb módja a sebesség elvesztésének, és önmagában is mért kulcsmutató.
([Racecar Engineering / OptimumG: gurulási tényező](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Csúszás.** A hosszirányú erő kb. 10–20%-os csúszási aránynál tetőzik, utána csökken; ezen túl a kerék blokkol fékezéskor, vagy megpörög hajtáskor. A Forza a csúszást normalizáltan adja: 0 a teljes tapadás, az 1 feletti abszolút érték tapadásvesztés.
([hosszirányú csúszás](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Alulkormányzás és túlkormányzás.** Ha az első csúszásszög nagyobb a hátsónál, alulkormányzás; ha a hátsó nagyobb az elsőnél, túlkormányzás. Csúszásszögek nélkül: az autó kevésbé fordul, mint amennyit a kormány kér (a kormányszög a `L/R` Ackermann-szög fölött, amelyre alacsony sebességnél szükség van).
([alulkormányzás, áttekintés](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Egy vonal geometriája {#the-geometry-of-a-line}

Az `R` sugarú íven tartható sebesség `v = sqrt(a R)`, ahol `a` az a oldalirányú gyorsulás, amelyet a gumik adnak (plusz amit a leszorítóerő hozzátesz, és ami `v²`-tel nő). Tehát **a sebesség a sugár négyzetgyökével nő**: a középen átmenő vonal 20%-kal nagyobb sugáron kb. 10%-kal gyorsabb ott.
([maximális kanyarodási sebesség](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: kanyarodás](https://www.formula1-dictionary.net/cornering_tech.html))

**A geometriai vonal** a kanyar legnagyobb íve: a külső szélről indul, a csúcsnál érinti a belső szegélyt, és visszatér a külsőre. Egy `θ` szöggel forduló, `w` széles úton (levonva az autó szélességét) egy mindkét külső szegélyt érintő, és a belső sarkot érintő ív `R = w / (1 - cos(θ/2))` sugarú (plusz a belső szegély saját sugara) – derékszögnél kb. `3,4 w`, hajtűkanyarnál `w`. Ezért számít a szélesség használata a közepes kanyarokban a legtöbbet, és a kanyarodókban a legkevesebbet.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**A késői csúcspont** később és mélyebben fordul be, először szorosabb sugáron, majd a kijövetelnél nyitja a sugarat: középen lassabb, hamarabb egyenes, hamarabb lapos – „kicsit alacsonyabb minimumsebesség, de erősebb gyorsulási profil a kijáratnál”. **A korai csúcspont** fordítottja: belül gyorsabb, és olyan sugár, amely a kijáratnál szorul és visszatartja a gázt – főleg hiba, kivéve nagyon kis tapadásnál, ahol a belül elvesztett sebesség kint nem pótolható.
([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[Racing telemetry szójegyzék](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[a versenyvonal matematikája](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**A „V” és az „U”.** Az U a klasszikus kerek vonal: a legszélesebb sugár, a legkevesebb kormányváltás. A V korábban fordul be, mélyebbre megy, a közepén gyorsan forgatja az autót, és a kijáratot úgy igazítja, hogy az egyenesebben fusson ki: a fékezés egyenes marad (így későbbre tehető), a minimumsebesség alacsonyabb, de később érjük el, a teljes gáz sokkal korábban jön.
([Track Titan: a V-vonal](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**A görbület a távolság függvényében.** A leggyorsabb vonal a legrövidebb út és a legkevésbé görbült között kompromisszum; egy versenypálya szélességén a görbület többet számít, és a minimális görbületű vonal ott közelíti meg a minimális idejű vonalat, ahol az autó a határán jár – ott tér el tőle, ahol az autó gyorsulhatna.
([Globális minimális idejű pályatervezés](https://www.nature.com/articles/s41598-025-21211-2),
[TUM globális versenypálya-optimalizálás](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Egymás utáni kanyarok** – dupla csúcspont, sikán – egy probléma: az egyik kijárati vonala a következő belépési vonala, és azt abból a kanyarból visszafelé vezetjük, amelyik egyenesbe visz.
([Driver61: más kanyar, más technika](https://driver61.com/uni/different-corner-technique/))

## Melyik vonal illik melyik autóhoz {#which-line-suits-which-car}

Ezt a döntést az autó **teljesítménye a tapadásához képest** adja azoknál a sebességeknél, amelyek ott a kanyarban jellemzők – „a lendület a tapadás és a teljesítmény viszonya, egy arány kérdése”.
([Ross Bentley: lendületes autók](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[lendület a lóerő felett](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Autó, ebben a kanyarban | Vonal | Miért |
|---|---|---|
| Erősen gyorsul a tapadásához képest („point and shoot”) | V: egyenesen és későn fékez, rövid, szoros középen fordul, korán egyenesedik és lapos lesz | az időt a teljes gáz nyeri, nem a minimumsebesség |
| Gyengén gyorsul a tapadásához képest („momentum”) | széles U, kicsit késői csúcspont, a minimumsebességet magasan tartja | nem tudja visszanyerni a sebességet, amit elvesztett |
| Között | lassan be, gyorsan ki: késői csúcspontú U | a klasszikus kompromisszum |
| Gyors kanyar, és még inkább leszorítóerővel | U, a geometriai vonal közelében | nagy sebességnél a gyorsulás gyenge; a leszorítóerős tapadás `v²`-tel nő, így a középen tartott sebesség kétszeresen megtérül |
| Nagyon kicsi tapadás (nedves, hó) | korábbi csúcspont | a bent elvesztett sebesség kint nem pótolható |
| A teljesítmény messze a tapadás felett | a vonal kevésbé számít | a kijáratot a tapadás korlátozza, nem a vonal |

„Minél gyorsabb a kanyar, annál közelebb van a geometriai vonalhoz; minél lassabb, annál jobban módosítjuk egy későbbi csúcsponttal.”
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[a versenyvonal matematikája](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: a V-vonal](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: tapadás](https://driver61.com/uni/grip/))

A hajtásrendszer inkább azt változtatja meg, hogyan vezetjük a vonalat, mint magát a vonalat: az elsőkerék-hajtású autót a fékeken keresztül forgatjuk (trail braking), és csak akkor adunk gázt, ahogy a kerék kiegyenesedik, különben kiszalad; egy erős hátsókerék-hajtású autónak egyenesnek kell lennie a teljes gáz előtt, különben a hátsó kicsúszik; az összkerékhajtás kormányzás közben is tud gázt venni, ezért korábban nyit.
([FWD technika](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD kanyarodás](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

A megjelenítő az autó teljesítmény–tapadás arányát minden kanyarban a saját vezetéséből méri: a teljes gázon mért gyorsulás a kijárati sebességnél osztva az oldalirányú tapadással a minimumsebességnél, és „point and shoot”-nak hívja 0,45 felett, „momentum”-nak 0,25 alatt. Ha egy autó tapadása 150–250 km/h között több mint 15%-kal nagyobb, mint 55–110 km/h között, a leszorítóerő dolgozik.

## A módszer {#the-method}

Az alábbi számok az érvelés. A kód által használt küszöbértékek mindegyike külön oldalon van, és ezek az oldalak a mérvadók, ha egy szám eltér itt: [Kanyarról kanyarra elemzés](race-corner-analysis.md), [Autóvezetési események](race-control-events.md), [Autóprofilok és összehasonlítás](race-car-profiles.md) és [Pályastatisztikák](race-course-statistics.md).

### 1. Egy távolságtengely {#one-distance-axis}

A leggyorsabb kör a referencia, hacsak a felhasználó másikat nem választ. Megtett útja a tengely: minden más kör mintáit erre vetítjük, így minden mintának lesz egy távolsága a referencia mentén, `s`, és egy előjeles oldalirányú eltérése, `d`. A vetítés csak az előző találattól előre keres, így egy kör, amely önmagát keresztezi, sosem ugrik a híd rossz oldalára. A köröket ezután egy rácsra mintavételezzük, 2 méterenként, minden csatornára. Minden kört az utolsó néhány méteren a megvolt sebességével viszünk tovább, így a vonalnál mért deltája a köridő-különbsége.

### 2. Kanyarok, és minden kanyar része a körből {#corners-and-each-corners-share-of-the-lap}

Hogyan találjuk meg a kanyarokat, szakaszokat és komplexeket: [Kanyarról kanyarra elemzés](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Egy kanyar időmérlege {#the-time-account-of-a-corner}

A nettó, a felbontás, a kijárati sebesség és az autók húzóereje: [Kanyarról kanyarra elemzés](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Az ítélet és az ok {#the-verdict-and-the-cause}

Az ítélet-minták és a belépésen és kijáratnál lévő okok: [Kanyarról kanyarra elemzés](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Az autó a vezetővel szemben {#the-car-against-the-driver}

Ha a körök különböző autókban vannak, az autó által megmagyarázott veszteséget kivesszük, részenként:

- **húzóerő**: az autók ugyanarról a sebességről az egyenesen, ahogy fent;
- **tapadás**: az alacsonyabb minimumsebességből, amelyet nem magyaráz szorosabb sugár, az a része, `½ ln(tapadás_más / tapadás_enyém) / ln(sebesség_más / sebesség_enyém)`, ha a kör az autója határán volt (az adott sebességnél mutatott érték 90%-án);
- **fékek**: `u`-ról `v`-re, `a1` lassulással szemben `a2`-vel, ugyanazon a ponton végezve, `(1/a1 - 1/a2)(u - v)² / 2u` veszteséget jelent – csak akkor, ha a kör átlagosan nagyjából olyan erősen fékezett a zónában, mint az autó képes, nem csak egy csúcson.

Egy autó képességeit az összes betöltött köréből kapjuk: oldalirányú tapadás, fékezés és teljes gázos gyorsulás 5 m/s-os sebességsávonként (95., 95. és 90. percentilis). A tapadás az, amit az autó **fél másodpercig tartott** – az oldalirányú gyorsulás fél másodpercre átlagolva –, nem az, amit egyetlen minta érintett: egy szegély, egy visszapattanó csúszás, egy utolérés mind egy pillanatra kiugrik, és egy autó, amely ezt gyakran csinálja, tapadósabbnak látszik, mint amilyen. (Két különböző autó felvett körein ellenőrizve: a mintánkénti mérték közel hozta őket egymáshoz; fél másodpercre tartva úgy választja szét, ahogy a köridejük is.) A fékezés és a húzóerő minden mintát a saját és a szomszédai mediánjaként veszi. A levegő, egy landolás utáni megülepedés és minden ütközés (6. szakasz), amíg az autó fel nem épül, kimarad.

**Milyen autó mit tud** (`profile.ts`): ugyanazokból a körökből,

- **tartott tapadás**: annak a fél másodperces oldalirányú gyorsulásnak a 95. percentilise;
- **húzóerő** teljes gázon 50 km/h-ig, 50–120, 120–200 és 200 felett, és a legnagyobb, amit mutatott;
- **fékezés** 60-ról 160 km/h-ra;
- **végsebesség**: ahol egy másodpercig teljes gázon már nem nyert sebességet egy egyenesen – egyenesen vezetve, nem hosszú, laposan vett kanyarban, ahol az autó bármilyen teljesítménynél veszít sebességet. Ahol nem volt elég hosszú egyenes, az mondja meg, mennyire volt messze, hogy a leggyorsabb pontjában még mit húzott. Semmi találgatás a köröken túl: egy teljesítmény–sebesség illesztés a légellenállás ellen egy utcai autót 100 km/h-val a valódi végsebessége fölé tett, mert a fokozatok és a sebességkorlátozó jóval a légellenállás előtt véget vetnek az autó húzóerejének;
- **a hátsó elengedése**: hányszor csúszott el egy körben 10°-nál nagyobb sodródásnál (laza talajon 20°-nál), a kormánnyal a kanyar ellen fordítva – ellenkormányzással elkapva –, ebből hányszor kezdődött gázon, és hogy a tapadásának mekkora részénél kezdődött. Az autó, amelyet szándékosan kicsit oldalt vezetnek, nem veszít semmit; az, amelyet el kell kapni, igen. Minden autóra ugyanúgy számolva, így két autó összehasonlítható;
- **egyensúly**, ahol a körök hordozzák a csúszásszögeket: elöl és hátul a határon.

Az **autók összehasonlítása** egymás mellé teszi az autókat – egy táblázat, mindegyikről egy mondat, hogy mi az autó a másikhoz képest („X jobban gyorsul, de nem tud olyan erősen kanyarodni, tovább kell fékeznia, és könnyebben veszíti el a hátsót”), minden egyértelmű különbség (4% tapadás, 5% húzóerő vagy fékezés, 4 km/h végsebesség, a hátsó legalább egy körönként egyszer több, és fél résszel gyakrabban elkapva), és hogyan vezessük mindegyiket. Egy autónál azt mondja, mi az az autó.

**Minden kanyarban**, ha a körök különböző autókban vannak, az ítélet megmondja, mit döntenek el az autók, és hogyan hozzuk ki a legtöbbet ebből az autóból:

- **a közepén**: a másik autó vonalán ennek az autónak a tapadása `v_más · √(tapadás_enyém / tapadás_más)` sebességet engedi. Ha a kör ezt tartotta, a különbség az autó, és semmilyen fékezési pont nem változtatja – ezt kimondjuk, és a kanyart az autónak tulajdonítjuk, nem a vezetőnek; ha kevesebbet tartott, a maradék nyerhető, és mondjuk, mennyi. Utána, hol lehet inkább az időt nyerni: egy egyenesbe, vagy egy erősebb húzóerejű autóval a csúcs után – egyenesen fékezni, később befordulni, korán a kijárat felé fordítani; különben a legszélesebb sugár, amit az út enged, mert nagyobb sugár az egyetlen mód több sebességre több tapadás nélkül;
- **egy elengedett hátsó** itt, egy autóban, amely könnyebben veszíti el, mint a másik: mit tegyünk ebben az autóban – a gázt a kerék kiegyenesedésével adjuk vissza, vagy a féket finoman engedjük el kanyarközépen gázelvétel nélkül, attól függően, hogyan kezdődnek a csúszásai;
- **az utána következő egyenes**: mit vett el a másik autó erősebb húzóereje ugyanarról a sebességről, és hol fogyott ki ennek az autónak a húzóereje rajta;
- **korábbi fékezési pont** egy autónál, amely kevésbé erősen fékez.

Egy kör, amely a kanyar közepén csúszott (10°-nál nagyobb sodródás aszfalton), a tapadásán túl volt, nem híjján volt; ezért sosem mondjuk neki, hogy ott tapadása maradt. Ha pedig az autó hátsója ebben a körben kisebb oldalirányú gyorsulásnál engedett el, mint amit a kanyar kért tőle, a „tapadás tartalék” azt mondja: keresd kis lépésekben.

### 6. Autókezelés: blokkolások, kerékpörgés, csúszások és alulkormányzások, ütközések és balesetek {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Minden kört arra is elolvasunk, hogyan kezelték az autót – hol blokkolt a kerék, hol pörgött a hajtott kerék, hol csúszott ki a hátsó, hol ment el az első –, mert ezek azok a hibák, amelyeket az idő önmagában nem nevez meg. Három dolog teszi, hogy ez játékokon és felületeken át is megálljon.

**A tapadás végét az autó saját vezetéséből mérjük.** A mérnökök autónként állítanak be blokkolási küszöböt a csúszásnál, amely a legnagyobb lassulást adta (az OptimumG fékezési sorozatának MoTeC-csatornái az egyik autónál -0,07-et használnak), nem könyvi értéket, és a könyvi értékek amúgy is eltérnek: az erő aszfalton 5–20%-os csúszásnál tetőzik, a gumi és a modell szerint; hón 6%-nál vagy 20–60%-nál, a forrástól függően; kavicsra pedig egy forrás sem ad. A játékok még másképp skálázzák a csúszást: a Forza „normalizált” értéke szerint 1 fölött a tapadás elveszett – mégis egy autó fékjei a legjobbat jóval 1 alatt vagy fölött adhatják, és a szokásos fékezési zónák mehetnek 1 fölé. Ezért autónként, az összes betöltött köréből, az általa kifejtett erőt a közben futott csúszás szerint csoportosítjuk – egyenes vonalú fékezésnél a lassulást a kerekek csúszási arányához, gyorsulást (az autó adott sebességnél elérhető részeként) a hajtott kerekek csúszásához, a kanyar-tapadást (az autó adott sebességnél mért tapadásának részeként) tengelyenként a csúszásszöghöz viszonyítva –, és a határ az a csúszás, amelyen túl a legjobb érték után az erő 8%-ot esett. Egy görbe, amely az adatokban sosem esik – a Forza Horizon kanyarodása és hajtása –, nincs határa, és a csúszás önmagában ott semmit sem jelez. Túl kevés adatnál a határ a névleges csúcs másfélszerese.

**A talaj mintánként ismert**, ahol a játék megmondja: a Forza kavicson, földön és füvön rezegteti a gumikat (kevés minta aszfaltos pályán, sok földön és terepversenyen), a Trackmania megnevezi az anyagot minden kerék alatt, és egy ralli-szakasz talaja a 11. szakasz szerint kerül meg. A görbéket, sodródási szokásokat és küszöbértékeket szét tartjuk aszfaltra és laza talajra.

**Minden eseményt a másik körrel szemben rakunk ugyanazokon a méterekön.** Kavicson, havon, egy drifthez sokat használó arcade versenyjátékban a csúszás az, ahogyan a kanyart vezetjük: az optimális szabályozási tanulmányok aszfalton „alacsony sodródású”, terepen „agresszív, nagy sodródású, sőt ellenkormányzásos” megoldásokat találnak, a ralli-adatok a gumikat „a nemlineáris tartomány jóval belsejében” mutatják, és nagyon laza talajon egy kerék blokkolása még meg is állíthatja az autót hamarabb. Ezért az az esemény, amelyet a másik kör is csinált – 80% vagy több –, ahogyan a kanyart vezetjük, nem hiba; és amelyet nem csinált, az akkor hiba, ha időt veszített vele: az attól közvetlenül előtti pillanattól 40 m-rel utána elveszett idő. Az a hiba, amely egy kanyar veszteségének 40% vagy több részét magyarázza, lesz a kanyar oka.

A detektálási küszöbök, a másik körös teszt, az ütközések és balesetek, és a tanácsszövegek: [Autóvezetési események](race-control-events.md).

### 6b. Sok kör: a pálya statisztikái {#b-many-laps-the-courses-statistics}

Osztályok összehasonlítása, mi számít hibának, a statisztikák és a hibatérkép: [Pályastatisztikák](race-course-statistics.md).

### 7. A megtett ív {#the-driven-line}

Minden körre és kanyarra, csak pozíciókból: hol kezdett fordulni (a legszorosabb görbületének egyötödénél), a legszorosabb sugara (±8 m-en), a sugár átlaga az irányváltozás első és második felében, és így tovább:

- **alak**: a legszorosabb és az átlagos sugár aránya 0,55 alatt V, 0,75 fölött U;
- **csúcspont**: a kijárati sugár osztva a belépési sugárral 1,25 fölött késői, 0,8 alatt korai;
- **sebesség-csúcspont**: ha a legkisebb sebessége a fordulása felezőpontja előtt több mint 15 m-rel van, az lassan be, gyorsan ki; ha utána több mint 15 m-rel, a közepén még lassul.

A másik körrel szemben: mennyire ment belül vagy kívül a befordulásnál, a legszorosabb részén és ahol mindkettő lapos volt, és hol fordult be mindegyik. Minden megállapítás a körének autójához illő vonallal zárul ennél a kanyarnál – ahhoz, hová visz a kanyar, és az autó mért teljesítmény–tapadás arányával, leszorítóerejével és hajtásrendszerével –, és azzal, hogy a kör így vezette-e. A „Kanyarról kanyarra” táblázat felsorolja az egyes kanyarokon áthaladó leggyorsabb kört a vonalának alakjával, és összerakja a legjobb kanyarokat.

### 8. Két térkép {#two-maps}

- **Hol**: a pálya színezve a referenciához képest `dΔt/ds` szerint, pirossal ahol időt veszítünk, zölddel ahol nyerünk.
- **Miért**: minden veszteség oda rajzolva, ahol az oka van, az ok csoportja szerint színezve – fékezés, belépés, kijárat, egyenes, autó –, és a drágább nagyobb.

### 9. Visszajátszás {#replay}

Egy óra, háromféle módon alakítva minden kör saját idejévé: a vonaltól, felsorakoztatva (minden kör egyszerre ér el a pálya egy pontjára, aztán elengedve) és egymás mellett (minden kör a referencia távolságán tartva).

### 10. Melyik irányba forog a világ {#which-way-round-the-world-is}

A megjelenítő világa jobbkezes, Y-nal felfelé. Egy balkezes világú játék (köztük a Forza) tükörképként jön ki belőle: minden jobbra kanyar balra rajzolódik, a pálya és a körök egyaránt. A körök maguk mondják meg: a pozitív kormányzás minden adapterben jobbra van, és a kanyar külső felfüggesztése összenyomódik – így a versenyfül felajánlja a javítást, és a **Kamera és jelenet → Világtengely megfordítása** megteszi: X, Y vagy Z fordítva rajzolva. Csak a rajzolás változik – a nézetmátrixba hajtott tükrözés; a kamera a rajzolt világban repül, az adatok, az elemzés és minden koordináta, amit az eszközök mutatnak, a játék saját marad. Az elemzés ugyanazzal a méréssel nevezi meg a balra vagy jobbra kanyart.

### 11. Ralli: a csúszás, a bal láb, a levegő {#rally-the-slide-the-left-foot-the-air}

A ralli-szakasz nem egy pálya, amelyet rosszabb tapadással vezetnek. Kavicson és havon a csúszás az, ahogyan a kanyart vesszük: az autót a befelé úton a súlya áthelyezésével fordítjuk – „a fékezés előre viszi az autó súlyát … az első gumik tapadást nyernek, a hátsók veszítenek, és az autó sodródva fordul be a kanyarba” –, aztán visszük a gázra, amint „abba az irányba áll, amerre menni akarsz” ([DirtFish: hogyan használd a féket](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). A bal láb fékez, hogy a gázt és a féket egymás ellen lehessen játszani; a kézifék szoros kanyarokban fordítja az autót ([RallySport Ontario: ralli-vezetés alapjai](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), és az autó elhagyja a talajt. A 6. szakasz már a másik körrel szemben olvassa a csúszásokat; ezek a szabályok a többit viszik.

- **A talaj.** Amit a kör mond (`meta.surface`, a ralli-rögzítők `--surface` kapcsolója), különben az esemény neve – az aszfaltos ralik (Spanyolország, Horvátország, Közép-Európa, Németország, Japán, Korzika, Ypres), a téli versenyek (hó), a Monte aszfaltja hóval és jéggel (vegyes) –, különben az, ahogyan az autót vezették. Egy Rally2 autó oldalirányú határa 0,7–0,9 g kavicson és 1,3–1,4 g aszfalton ([grenzbereich, referenciaértékek](https://github.com/GitCrush/grenzbereich)), és kavicson sokkal több sodródást enged (6. szakasz). Tehát az a szakasz, ahol az autó 10 m/s² vagy többet húzott (95. percentilis, sebességnél, a talajon), közben a sodródás mediánja 6 fok alatt volt, ahol csak a 70%-ánál kanyarodott – aszfalt; minden más, vagy ami túl kevés a megítéléshez, laza.
- **Mit tud az autó, azon a talajon, ahol vezette.** A tapadás, a fékezés és a húzóerő (5. szakasz) külön mérjük aszfaltra és laza talajra, ha a körök mintáinak egyötödét vagy többet mindkettőn vezették, és minden kanyart azzal a talajjal ítélünk meg, amely az autó alatt a leglassabb pontján volt. A levegőben és egy landolás után 0,3 másodpercig lévő mintákat minden kimarad, ami az autót méri – burkolók, gumigörbék, blokkolások és kerékpörgés: egy landolás az autót minden olyan határon túl rázza meg, amit a gumi bír, és a levegőben felpörgött kerekek nem kerékpörgések. Leszorítóerőt laza talajon nem ítélünk meg, ahol egy szakasz gyors és lassú részei más utak.
- **A bal láb egy érintése nem fék.** A fék finom érintése, amikor a gáz még fél vagy több, kevesebb mint 15 m-en, stabilizálja az autót vagy megfordítja; ahol a kör elkezdett fékezni egy kanyarhoz, az az első fék, amely alatt a gáz elengedésre került, vagy amely tovább tartott.
- **Az autó a befelé úton megfordult.** Minden körre és kanyarra a legnagyobb sodródási szög a fékezéstől 5 m-rel a leglassabb pontja után. Laza talajon az a kör, amelyben az autót 8 fokkal vagy többel kevésbé fordították el, mint a másikat (az 12-t vagy többet fordított), és később ment rá a gázra vagy lett lapos, **kevesebbet fordított az autón**: a tanács, hogy a befordulásnál engedjük el vagy a bal lábbal érintsük a féket, hogy a hátsó beforduljon – a másik kör kézifék-pontjával, ha az használt kéziféket, vagy a kézifékkel 54 km/h-nál lassabb kanyarban –, és hogy a kijáratra mutasson, mielőtt a csúcs jön. Az, amelyik 12 fokkal vagy többet fordított a másikhoz képest, és még később ment a gázra, **túl sokat fordított**: ki kellett egyenesíteni, mielőtt a gáz lemehetett. Mindkettő a kanyar oka a kijáratnál, egy autókezelési hiba után. A laza talajra vonatkozó vonaltanács minden kanyarra ugyanezt mondja.
- **A levegő.** Egy repülés, amely 0,2 s-mal vagy többel hosszabb a másik körénél, és a felszállás előtti 10 m-től a landolás utáni 40 m-ig (vagy a kanyar végéig) időt veszített, az ok, ha a kanyar veszteségének 40% vagy több részét magyarázza, és az utána következő kanyar, amelyet lassabban ér el, ezt mondja. A levegőben az autó nem tud fordulni, fékezni vagy hajtani. A tanács a felszállásnál a gázt rajta tartja – „ne vegyél le gázt a felszálláskor”, mert az orr lenyomódik –, és a dombtetőt egy kicsit lassabban veszi, vagy a fék finom érintésével, hogy az autó alacsonyan maradjon ([DirtFish: hogyan ugorj egy ralliautóval](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Legfeljebb három kanyarból álló komplexek.** Egy kanyargós szakasz, amelyet sosem vezetnek lapos állapotban, nem egy hosszú komplex: három kanyar után új kezdődik.

`src/race/rally.test.ts` mindezt tartja az elemzéshez egy egyszerű modellel futó szakaszokon: egy autó, amely kevesebbet és későn fordult a gázon, egy hosszabb repülés, bal lábas érintések, egy kanyargós szakasz, aszfalt szemben kaviccsal.

## Adatok, és mit enged meg minden forrás {#data-and-what-each-source-allows}

| Forrás | Ráta | Csatornák | Enged |
|---|---|---|---|
| FH Companion körfájlok | ~5 m | pozíció, sebesség, gáz, fék, kormány, hosszirányú és oldalirányú gyorsulás, fokozat | mindent, kivéve az autókezelést, amihez a mellettük lévő telemetria kell |
| FH Companion `.tele.gz`, minden körfájl mellett | a játék 64 Hz-e (a minden csomagot megtartó rögzítő kb. 110-et ír másodpercenként; az ismétlések kimaradnak) | a Forza teljes Data Out-ja: kerekenként csúszási arány, csúszásszög, kombinált csúszás, forgás, felfüggesztés, talajrezgés; a jármű-keretbeli sebesség; a yaw-sebesség | mindent, az autókezelést is |
| Forza Data Out, a `heat3d_capture telemetry` rögzítésével | 60 Hz | mindez, plusz kerekenként: gumihőmérséklet, csúszási arány, csúszásszög, kombinált csúszás, felfüggesztés-elmozdulás, kerékfordulat, rezgősáv; fordulatszám, teljesítmény, nyomaték, yaw-sebesség | mindent |
| Assetto Corsa, ACC, AC EVO, AC Rally (megosztott memória, `heat3d_capture telemetry --game ...`) | 60–333 Hz | egy szuperhalmaz: gumi magja és belső/közép/külső hőmérséklete, nyomások, féktárcsa-hőmérséklet, kerékterhelések, dőlés, csúszási arány és szög; a jármű-keretbeli sebesség; az ABS és a TC működése (ACC, EVO, AC Rally) | mindent |
| iRacing `.ibt`, közvetlenül olvasva | 60 Hz | pozíció GPS-ből, pedálok, kormány, g, yaw, kerekenként a gumitest hőmérséklete, lengéscsillapító-kitérés, nyomás, kopás | mindent; az autókezelés a sodródási szögből (yaw a haladási iránnyal szemben) és a kormányból, csúszás nélkül (nincs naplózva) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | képkockánként; 100 Hz | pozíció, világbeli sebesség és az autó tengelyei, kerekenként érintkezési folt sebessége és felfüggesztés, pedálok, kormány, szakaszóra és szakaszhossz | mindent; a csúszás és a sodródási szög származtatva |
| Richard Burns Rally (NGP UDP) | fizikai lépésenként | pozíció, az autó saját sebességei, kerekenként rugóelmozdulás és erő, pedálok | mindent, kivéve a kerék csúszását |
| BeamNG.drive (a `heat3d` protokoll-mod) | legfeljebb 100 Hz | pozíció, világbeli sebesség és tengelyek, kerekenként felületi sebesség, forgás, terhelés és talajérintkezés | mindent; a csúszás és a sodródási szög származtatva |
| Trackmania (az Openplanet bővítmény) | képkockánként | pozíció, első és oldalsó sebesség, pedálok (fék be/ki), kormány, kerekenként csúszási együttható és laza talaj, a levegőben | mindent; a sodródási szög az oldalsó sebességből |

Minden forrást egyetlen körformátumba, `heat3d-lap`-ba alakítunk, amelynek csatornái kanonikus neveket kapnak (`speed`, `throttle`, `tireTemp[FL]` ...). Az autójel és a diagramok azt rajzolják, amilyen csatornái egy körnek vannak.

## Források {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Szakaszok gyorsítása: időeltérés-alakzatok](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (távolságtartományú delta)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing körelemzési útmutató](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: session körök](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: versenyvonalak elemzése](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: elméleti legjobb szektorokból](https://overcut.gg/)
- [Track Titan: hogyan elemezzük a telemetriát](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: fékelemzés, blokkolás és stabilitási KPI-k (2019 szept.)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: a gázon (2020 jan.)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: versenyzők kulcsfontosságú teljesítménymutatói (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Gumi–útfelület súrlódási modellek és az optimális csúszás (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: gumi–útburkolat súrlódás, csúcsnál lévő csúszás hón és jégen](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: gumi súrlódási együtthatók, csúcs és csúszó](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: hosszirányú erők](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: oldalirányú erők](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Járműstabilitás, a test csúszási határai (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Ralli vezetés nagy oldalcsúszással (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Minimális idejű ralli-manőverek (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC referencia yaw-sebesség (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Alulkormányzás és túlkormányzás felismerése a kormány és a yaw szembeállításával (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: kormányszög, Ackermann és az alulkormányzási gradiens](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: matematikai csatornák (Kus, összetett g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: túlkormányzás és alulkormányzás műszer](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Pumpáló fékezés: blokkolás nagyon laza felületen](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: adatrögzítés kavicsos ralin](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: hogyan használd a féket](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: hogyan ugorj egy ralliautóval](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: ralli-vezetés alapjai](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: ralliautó-dinamika, referenciaértékek](https://github.com/GitCrush/grenzbereich)
- [Trackmania sebesség-sodródás edző bővítmény (állandók)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania sebességcsúszás-leírás](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: edzési folyamatok](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: a V-vonal](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Egy mesterséges versenyző vezetési stílusának torzítása (kijárati sebesség a minimumidővel szemben)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: sorrend a köridő javításához](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: a három kanyartípus](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: a kanyarok sorrendje](https://driver61.com/uni/prioritising-corners/)
- [Driver61: más kanyar, más technika](https://driver61.com/uni/different-corner-technique/)
- [Driver61: a kanyar hat fázisa](https://driver61.com/uni/corner-phases/)
- [Driver61: tapadás](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (részlet)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: mi a lendületes autó](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [A lendület a lóerő felett vita](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [A versenyvonal matematikája, 2. rész](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, 1. rész](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD technika](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD kanyarodás](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: kanyarodási technika](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximális kanyarodási sebesség](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Versenytelemetria szójegyzék](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Globális minimális idejű pályatervezés, a görbület és a távolság figyelembevételével](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: globális versenypálya-optimalizálás](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: a gurulási tényező](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Súrlódási kör bevezető](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Hosszirányú csúszás](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Alulkormányzás, áttekintés](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out dokumentáció](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: húzóerő-korlátozott gyorsulás](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: teljesítmény-korlátozott gyorsulás](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO megosztott memória](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally telemetriaolvasó](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT feldolgozás](https://github.com/teamjorge/ibt)
