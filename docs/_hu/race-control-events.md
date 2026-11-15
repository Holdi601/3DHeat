---
title: "Autóvezetési események"
parent: "Versenyelemzés"
nav_order: 54
lang: "hu"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: true
---

# Autóirányítási események

A nézegető azt figyeli, hogyan lett megvezetve minden kör, és megjelöli, hol csúszott az autó, hol pördült meg, hol ütközött valamibe, és hol pazarolta a tapadást a versenyző. Ez hasznos, mert az a hiba javítható a leggyorsabban, amelyik időbe került.

![Az Autóirányítás rész: hányszor blokkolt kereket, pördült meg vagy tolt kifelé minden kör, és a hibák listája, egy kinyitott tétellel](../assets/img/en/race-control-table.webp)

## Egyszerűen fogalmazva {#in-plain-words}

- **Blokkolás**: annyira erősen fékezel, hogy egy kerék megáll, és megcsúszik. Az autó rosszabbul lassul, és nem tud kormányozni.
- **Kipörgés**: annyira erősen nyomod a gázt, hogy a hajtott kerekek gyorsabban pörögnek, mint ahogy az autó halad. Elveszíted a húzóerőt.
- **Túlkormányzás**: az autó hátulja messzire kicsúszik. Ha teljesen körbefordul, az egy **megpördülés**.
- **Alulkormányzás**: az autó eleje csúszik messzire kifelé („tolja” az autót); a kormány további forgatása nem segít.
- **Koccanás** és **baleset**: az autó hozzáért valamihez (a koccanás egy ütés vagy horzsolás, a baleset egy erős ütközés).
- **ABS**, **TC**: az autó saját segédrendszerei, amelyek a blokkolás és a kipörgés ellen dolgoznak. Nem hibák.

## Az Autóirányítás rész (amit látsz) {#the-car-control-section-what-you-see}

A kiválasztott körre: amit a körök hordoznak, azt mutatja. Ha nincs gumicsúszás és nincs driftszög, akkor sem üres: azt mutatja, ami így is megtalálható (lent).

**A táblázat**: soronként egy fajta, amelyet a két kör legalább az egyike mutat – Blokkoló kerekek, Kipörgés, Kitörő far (túlkormányzás és megpördülések), Kifelé tolás, Balesetek, Koccanások, ABS beavatkozik, Kipörgésgátló beavatkozik, Kézifék, A levegőben. Minden cella: „darab · másodperc”, a kiválasztott körre és arra a körre, amellyel össze van hasonlítva. Ha van driftszög, megjelenik a *Legnagyobb driftszög* is (a legnagyobb a talajon).

**A lista**: a nem megosztott hibák, amelyek legalább 0,02 másodpercbe kerültek, a legdrágábbtól kezdve, legfeljebb 12, mindegyik címével és költségével (és a fajtája jelvényével). Kattints egyre, hogy elolvasd a tippjét, állítsd a két autót sorba 40 méterrel előtte, és játszd le újra. Az **Az is, amit ott mindkét kör csinált** lehetőség minden hibát hozzáad, a megosztottakat is (jelvény: „mindkettő csinálta”, költség „—”, ha 0,01 másodperc alatt van). Ha nincs hiba, ez áll: „X semmi olyat nem csinált a gumikkal, ami időbe került, és amit Y ne csinált volna szintén.”

**A táblázat alatti tipp** megmondja, mivel tudta a felismerés dolgozni: „Az egyes kerekek csúszásából és csúszási szögéből, valamint az autó driftszögéből.” (vagy: csúszás és csúszási szög; csúszás és driftszög; csak csúszás; vagy: „Csak az autó driftszögéből – ezek a körök nem tartalmaznak gumicsúszást.”). Azt is mondja, melyik talajra készültek a határok (aszfalt, laza talaj, vegyes: 80% fölött laza mintán laza, 20% alatt aszfalt), melyik körhöz vetették össze az eseményeket, és hogyan számítják a költséget.

**Gumicsúszás és driftszög nélkül** (egy FH Companion körfájl a telemetria nélkül) a táblázat és a lista ugyanúgy látszik. A tipp pedig megmondja, mi került így is megtalálásra a körök alapján: „Ezek a körök nem tartalmaznak gumicsúszást és driftszöget, így a blokkolás és a kipörgés nem ismerhető fel. Továbbra is felismerhetők: a kifelé tolás, a kormányzásból a pályához képest; a koccanások és balesetek, a sebességből és a gyorsulásból.” A csúszások is megnevezésre kerülnek a legyezési sebességből, ahol a körökben van ilyen, a kifelé tolás pedig csak ott, ahol van kormányadat. A csúszási és driftszög-határokról szóló mondat kimarad. A második tipp így szól: „Forza Horizon esetén minden FH Companion-kör mellé válaszd ki a `.tele.gz` fájlt is: ez a teljes telemetria, minden kerék csúszása másodpercenként 64-szer.”

A kör **összes** irányítási költsége (az összefoglalókban használt) az átfedő hibákat egyszer számolja. Ilyen például egy blokkolás és az általa kezdett csúszás, ha 40 méteren belül van: ezt a csoport legdrágább tagjánál számítja.

## Hogyan ismerjük fel {#how-it-is-detected}

Az oldal hátralevő része a szabálykönyv: minden fajta, minden küszöb.

Kód: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Az indoklás és a szakirodalom a [módszerben](race-analytics.md) található.

## A fajták {#the-kinds}

| Fajta | Táblázat sora | Hiba? | Legrövidebb, ami számít |
|---|---|---|---|
| `lock` | Blokkoló kerekek | igen | 0,1 s |
| `wheelspin` | Kipörgés | igen | 0,15 s |
| `oversteer` | Kitörő far | igen | 0,2 s |
| `spin` | (a Kitörő farral együtt számolva) | igen | 0,1 s |
| `understeer` | Kifelé tolás | igen | 0,25 s |
| `crash` | Balesetek | igen | - |
| `hit` | Koccanások | igen | - |
| `abs` | ABS beavatkozik | nem | 0,2 s |
| `tc` | Kipörgésgátló beavatkozik | nem | 0,2 s |
| `handbrake` | Kézifék | nem | 0,1 s |
| `airborne` | A levegőben | nem | 0,15 s |

A rövidebb szakaszok zaj (egy szegélykő, egy egyenetlenség, egyetlen minta). A rácspontok (2 méterenként) azon szakaszait, amelyek átmennek egy teszten, legfeljebb 2 pontos hézagon át összekapcsolják. Csak a **hibák** lehetnek hibák, és csak nekik van költségük. A többi az, amit az autó és a versenyző csinált.

## Minden teszthez szükséges {#what-every-test-needs}

### Származtatott csatornák {#derived-channels}

Mielőtt bármit megítélnének, minden kör megkapja azt, amit a játéka nem küld, egységes nevek alatt (a játék saját értéke mindig nyer):

| Csatorna | Forrás |
|---|---|
| `bodySlip` (driftszög) | az autó koordinátarendszerének sebessége, `atan2(latVel, abs(longVel))`, ahol a játék küldi (3 m/s alatt 0); egyébként a fejirány (a játék legyezése, amelyet előjel és eltolás szerint illesztenek a haladási irányhoz a 10 m/s-nál gyorsabb mintákon, és csak 0,05 alatti körszórás esetén megbízható) a haladási iránnyal szemben (pozíciók legalább 2 m-enként), 3 m/s feletti sebességnél |
| `yawRate` (legyezési sebesség) | a `yaw` változása időben, ahol van fejirány, de nincs legyezési sebesség |
| `airborne` | minden kerék talajérintkezése megszűnt (≤ 0,5); különben minden kerék terhelése a mediánjának 5%-a alatt; különben minden felfüggesztési út 0,02 vagy az alatt (teljesen kinyújtva). Egyetlen kóborló minta nem repülés |
| `slipRatio.<W>` | `(a kerék felületi sebessége - az autó sebessége) / az autó sebessége` 3 m/s felett, ahol a játék küldi a kerekek felületi sebességét; vagy a kerékforgásból × a körön mért gördülősugár, vagyis a `speed / rotation` mediánja, miközben egyenesen gurul (sebesség > 10 m/s, gáz < 0,3, fék < 0,05, abs(hosszirányú gyorsulás) < 3 m/s², nincs a levegőben; ha 20-nál kevesebb van, minden 10 m/s feletti minta), 0,1 és 1 m között elfogadva. `physical` jelöléssel |
| `loose` | a Forza felületének zörgése legalább 2 keréken (> 0,001), legalább 0,33 másodpercig (a szegélykő rövidebb); az 1 másodpercnél rövidebb hézagok áthidalva |

### A földön és stabilan {#on-the-ground-and-settled}

A levegőben, vagy a **landolás utáni 0,3 másodpercben** semmit sem ítélnek meg. A felfüggesztés ilyenkor leüt, a gyorsulások megugranak, ami nem tapadás, fékezés vagy hajtás. Egy mintának **mozognia** is kell: 5 m/s-nál gyorsabban.

### A talaj {#the-ground}

Minden minta talaja **laza**, ahol a kör `loose` csatornája ezt jelzi (a Forza felületi zörgése, a Trackmania kerékanyagai). Különben a kör felülete a mérvadó (lásd: [versenyszám és felület](race-loading-laps.md#discipline-and-surface)): aszfalt, vagy laza bármi más. A kanyarokat, a driftszokásokat és a küszöböket külön tartják az aszfaltra és a laza talajra.

### A csúszás a gumi névleges csúcsának többszöröseként {#slip-as-a-multiple-of-the-tyres-nominal-peak}

A játékok másként skálázzák a csúszást. A `meta.slip` megmondja, hogyan, és minden csúszást egy skálával osztanak el, hogy a gumi névleges csúcsa körülbelül 1 legyen:

| `meta.slip` | Jelentés | Ezzel osztva |
|---|---|---|
| `peak` | a játék normalizálja: 1 felett elvész a tapadás (Forza Data Out) | 1 |
| `scaled` | fizikai csúszás, elosztva egy aszfaltcsúccsal (a Kunos-rögzítő) | a talaj névleges csúcsa osztva az aszfalt csúcsával |
| `index` | 0..1 közötti csúszásmérték (a Trackmania SlipCoef) | 0,5 |
| `physical` (vagy ismeretlen) | csúszási arány törtként, csúszási szög radiánban | a talaj névleges csúcsa |

Névleges csúcsok, ha nincs jobb adat:

| Talaj | Csúszási arány | Csúszási szög |
|---|---|---|
| aszfalt | 0,12 | 8° |
| vegyes | 0,18 | 12° |
| laza (kavics) | 0,25 | 15° |
| hó | 0,25 | 15° |
| jég | 0,10 | 6° |

### Hol ér véget a tapadás: minden autó gumigörbéi {#where-grip-ends-each-cars-tyre-curves}

Azt, hogy hol szűnik meg a gumi több erőt adni, **autónként mérik**, a betöltött körök mindegyikéből (`measureTyres`), külön az aszfaltra és a laza talajra:

| Görbe | Minták (sebesség > 10 m/s, stabil, gyorsulások 45 m/s² alatt) | Csúszás (x) | Erő (y) |
|---|---|---|---|
| fékezés | fék > 0,3, kézifék ≤ 0,2, egyenesen haladva (oldalirányú a legkeményebb 30%-a alatt) | abs(a négy kerék átlagos csúszási aránya) | lassulás |
| húzás | gáz > 0,8, fék ≤ 0,05, egyenesen, és az autó teljes gázos húzóereje ezen a sebességen > 0,5 m/s² | a legnagyobb hajtott kerék csúszási aránya | gyorsulás e húzóerő részeként |
| első | oldalirányú a legkeményebb 30%-a felett, és az autó tapadása ezen a sebességen > 1 m/s² | a nagyobb első csúszási szög | oldalirányú gyorsulás ennek a tapadásnak a részeként |
| hátsó | ugyanaz | a nagyobb hátsó csúszási szög | ugyanaz |

„A legkeményebb” a kör abs(oldalirányú gyorsulás) értékének 99. percentilise azon a talajon (ha 50-nél kevesebb a minta, akkor minden talaj). A hajtáslánc dönti el a hajtott kerekeket: elsőkerék-hajtásnál az elülső, hátsókerék-hajtásnál a hátsó, összkerék-hajtásnál mind. Ha ismeretlen, mind.

**150 mintától** a csúszást 6–14 azonos számú sávra vágják (sávonként 40 minta). Minden sáv erője a felső kvartilise, vagyis az, amit a gumi adott, amikor a versenyző kérte. A sávok simítva vannak a szomszédaikkal. A **legjobb** az a sáv, ahol a legnagyobb az erő. A **határ** az első sáv utána, ahol az erő **8%-kal** esett. Az a görbe, amely az adatokban soha nem esik, nincs határa (végtelen). Ilyenkor a „csúcs” túllépése abban a játékban nem kerül semmibe, és a csúszás önmagában ott nem jelöl meg semmit. (A Forza Horizon kanyar- és húzógörbéi ilyenek.) Ha az egyik talajon kevés a minta, a másik talajé használatos. Ha összességében kevés, akkor a **névleges** határ: 1,5-szöröse a névleges csúcsnak.

Minden autó emellett kap:

- a **driftszokását**: a driftszöge felső kvartilisét mindenhol, ahol a legkeményebb 60%-ánál vagy annál erősebben kanyarodik (100 minta kell);
- a **kormányzását görbületenként** (`steerGain`), 5 m/s-os sebességsávonként: az abs(kormány) / pályagörbület mediánját, miközben határozottan, de tapadásán jóval belül kanyarodik (a legkeményebb 30–60%-a, 400 m-nél szorosabb sugár, kormány 0,02 felett; sávonként 25 minta). A pálya görbülete a legyezési sebesség osztva a sebességgel, ahol a játék küld legyezési sebességet. Ha nem, akkor a ±5 m-es pozíciókból számítják.

## Felismerés fajtánként {#detection-kind-by-kind}

| Fajta | Teszt (mozgó, stabil mintákon) | `peak` és `limit` |
|---|---|---|
| **blokkolás** | fék > 0,05, kézifék nem több 0,2-nél, és valamelyik kerék csúszási aránya a fékezési határ mínusza alatt | a legnegatívabb csúszás (a névleges csúcs többszörösei); a határ negatívként |
| **kipörgés** | gáz > 0,2 (vagy nincs gázcsatorna), és egy hajtott kerék csúszási aránya a húzási határ felett | a legnagyobb hajtott csúszás; a határ |
| **túlkormányzás** (driftszög) | a driftszög a talaj alsó határa és az autó driftszokásának 1,5-szerese közül a nagyobb felett | a legnagyobb driftszög, radiánban |
| **túlkormányzás** (csúszási szögek, driftszög nélkül) | a nagyobb hátsó csúszási szög a hátsó határ felett, és 0,25-tel több, mint az egyébként nagyobb első szög | a hátsó csúszási szög (a csúcs többszörösei) |
| **túlkormányzás** (driftszög nélkül, de van legyezési sebesség és oldalirányú gyorsulás) | a „helyzetsebesség” – abs(legyezési sebesség) mínusz abs(oldalirányú gyorsulás) / sebesség, 8 m/s felett – 0,2 rad/s felett, a kormány a kanyarral szemben | rad/s; határ 0,2 |
| **megpördülés** | olyan túlkormányzási szakasz, amelynek driftszöge **60°** fölé ment | mint a túlkormányzásnál |
| **alulkormányzás** (csúszási szögek) | nem csúszik; a nagyobb első csúszási szög az első határ felett, és 0,3-mal több a hátsónál | az első csúszási szög; a határ |
| **alulkormányzás** (csúszási szögek nélkül) | 12 m/s-nál gyorsabb, nem csúszik, nem ellenkormányoz; az oldalirányú gyorsulás a kör legkeményebb (99. percentilis) felét meghaladja; a pálya 300 m sugárnál szorosabb; és a kormány **1,6-szorosa** annak, amit az autó saját kormányzása görbületenként szerint a pályához kellett volna | a szükséges kormány többszöröse; határ 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` 0,5 felett | - |
| **kézifék** | `handbrake` 0,2 felett | - |
| **levegőben** | `airborne` 0,5 felett | - |
| **koccanás**, **baleset** | lásd: [Koccanások és balesetek](#hits-and-crashes) | az ütközés által elvett sebesség |

A driftszög alsó határai talajonként: aszfalt **7°**, vegyes **10°**, laza és hó **15°**, jég **10°**. Az az autó, amely eleve többet csúszik (egy arcade gumimodell, egy kavicsspecialista), a saját köreiből saját, magasabb küszöböt kap: 1,5-szerest a driftszokásából.

**Melyik irányba fordul az autó** (a „kanyarral szemben” kifejezéshez): a kör saját pályájának fejirány-változása ±6 m-en (legalább 2 rácspont). A 600 m-nél szorosabb sugár kanyarnak számít. Jobbra vagy balra aszerint, hogy a világ tükrözött-e. A kormány **a kanyarral szemben** áll, ha abs(kormány) > 0,05, és az előjele a kanyarral ellentétes. Ilyenkor a csúszást **ellenkormányzással** fogják meg.

**A pedálok a kezdetén** (`pedal`): *fékezés*, ha a fék 0,1 felett van; *gáz*, ha a gáz 0,3 felett; *elengedve*, ha a gáz 0,5 felett volt az előző 8 rácspontban (16 m); különben *gurulás* (vagy ha nincs gázcsatorna).

## Összevetve a másik körrel {#laid-against-the-other-lap}

Minden eseményt ahhoz a körhöz hasonlítva ítélnek meg, amellyel a kiválasztott kört az adott szakaszban összevetik. Ez az osztályának legjobbja. Magára a körre nézve az osztályából az a kör, amelyik a szakaszon a leggyorsabb volt.

1. **Meddig ment a másik kör** ugyanazon a méteren, ±8 m: a másik kör saját, azonos családba tartozó eseményei (a megpördülés túlkormányzásnak, a baleset koccanásnak számít), ugyanazokban a mértékegységekben mérve, küszöbök nélkül, a másik autó gumigörbéit használva.
2. **Megosztott**, ha a másik kör **80%**-ot vagy többet ment. Ez azt jelenti, hogy így kell a kanyart vezetni, nem hiba. A nem hiba fajták mindig „megosztottak”.
3. **Költség** a nem megosztott hibánál: az az idő, amelyet ez a kör a másikhoz képest elveszített, az eseménytől 5 m-rel korábban egészen **40 m-rel utána**. Koccanásnál vagy balesetnél addig számít, amíg az autó vissza nem nyeri a sebességét: a méterek, amíg saját húzóerejével visszanyeri, 40 és 400 m között. Mért húzóerő nélkül 5 m/s². Soha nem negatív.
4. **Kiadott sebesség** az autó határáig. Blokkolásnál az a lassulás, amelyet az autó ezen a sebességen képes lenne elérni, mínusz az, amit ténylegesen elért, az eseményen összegezve. Kipörgésnél a teljes gázos húzóereje mínusz az, amit tett. Ütközésnél az elvett sebesség. Akkor mondjuk ki, ha 0,5 m/s (1,8 km/h) fölött van.

Az a hiba, amely nem megosztott, és legalább **0,02 s**be került, szerepel a listán. A [pályastatisztikák](race-course-statistics.md) csak a **0,03 s** vagy annál nagyobb hibákat számolják, hogy a sok körön át számolt hiba egyértelmű legyen. Egy ilyen hiba okozhatja egy kanyar elvesztését (lásd: [Kanyarról kanyarra elemzés](race-corner-analysis.md#car-control-faults-and-impacts)).

## Koccanások és balesetek {#hits-and-crashes}

Az `impacts.ts` a koccanásokat a kör **saját mintáiból** olvassa ki, mielőtt újramintavételezik őket. Egy koccanás a századmásodpercek alatt lezajlik. A gumik nem tudják előidézni egy koccanás erőit, ezért a koccanást a kör saját autójához mérik:

- **A tapadása `G`**: a vízszintes gyorsulása, `√(lat² + long²)`, 99. percentilise a körön, a földön és 5 m/s-nál gyorsabban. Gyorsulási csatornák nélkül (vagy 3 m/s² alatt): 15 m/s², ami egy közúti autó tapadása.
- **Küszöb**: `max(1.8 G, G + 18, 30)` m/s².
- **Ütött minta**: a vízszintes gyorsulás a küszöb felett *és* az előző mintához képest `G` fele felett ugrik; **vagy** a sebesség 0,1 másodpercen belül több csökken, mint amennyit a küszöb 0,1 másodperc alatt elvenne, plusz 1,5 m/s. Csak a földön és stabilan, és csak akkor, ha az autó 5 m/s-nál gyorsabb volt.
- Az **0,4 másodpercen** belüli ütött minták egy koccanást alkotnak.
- **Előtte / utána**: a legnagyobb sebesség a 0,15 másodperccel korábban; a legkisebb az utolsó ütött mintától 0,3 másodpercig.
- **Nem koccanás**: ha a sebesség erő nélkül tűnik el (a vízszintes gyorsulás csúcsa 0,1 másodpercen belül a `G` és a 25 m/s² közül a nagyobb alatt), akkor a játék visszatekeri vagy visszaállítja az autót.
- **Baleset**, ha **30 km/h** vagy több sebességet vett el, vagy az autó a sebessége felénél kevesebbel maradt. Különben **koccanás**: egy ütés, egy horzsolás a falon végig.
- **Irány**: ha a hosszirányú gyorsulás nagyobb az oldalirányúnál, és negatív: *szembe*; ha pozitív: *hátulról*; ha az oldalirányú a nagyobb: *oldalról*. Gyorsulások nélkül: szembe.

Azt, hogy mire képes az autó, minden koccanás nélkül mérik, a koccanás előtt 0,1 másodperctől az után 1 másodpercig (`struckMask`).

## A szövegek {#the-texts}

Minden eseményt úgy mondanak ki, hogy mindkét kört megnevezik. Megadják, hol van (méter a referencián belül), milyen sebességgel kezdődött, mennyivel lépte túl a határt a másik körhöz képest, és adnak egy tippet. A tipp a fajtából és a mért adatokból következik:

| Esemény | Tipp |
|---|---|
| blokkolás, csak az elsők | a blokkolt első nem tud kormányozni: kevesebb nyomás a zóna elején, és a kanyarba menéskor lazíts |
| blokkolás, csak a hátsók | a blokkolt hátsó az autót forgatni engedi: a fékezést egyenesen erősítsd, a kanyarba menéskor engedj; ha ismétlődik, a fékerő-elosztást tedd előrébb |
| blokkolás, laza talaj | a blokkolt kerék tovább szántja a talajt: nyomd rá úgy, hogy éppen ne blokkoljon |
| blokkolás, egyébként | túl sok pedál a tapadáshoz: fokozatosabban nyomd |
| kipörgés | a gázt akkor add rá, ahogy a kormány visszatekeredik; húzóerő-korlátnál korán válts (laza talajon: a magasabb fokozat tompítja a nyomatékot) |
| megpördülés / túlkormányzás | a pedál szerint: fékezés közben (túl erős átmenő fékezés, túl korai visszaváltás), elengedve (elengedési túlkormányzás: tarts állandó gázt), gázon (túl sok, miközben még kanyarodik), egyik sem (túl gyorsan kanyarodtál be); „ellenkormánnyal megfogva”, ha ellenkormányoztak; laza talajon vagy ralin: „egy bizonyos szög a gyors út – a másik kör szöge elég volt” |
| alulkormányzás | ha az első már kicsúszott, több kormány nem segít: érkezz lassabban, egy kis átmenő fékkel terheld az elsőt, és tekerj vissza; laza talajon fordítsd az autót egy elengedéssel vagy egy bal lábas fékezéssel |
| koccanás / baleset | oldalról: egy méter biztonsági táv olcsóbb, mint a horzsolás; hátulról: másik autó vagy hátrafelé csúszás; szembe balesetnél: korábban fékezz; elöl egy ütés: valamit megérintettél. „X ott is koccant.” megosztott esetben |

A Trackmaniában a csúszás még ezt is mondja: körülbelül **400 km/h** alatt (laza talajon: **300**; föld, fű, műanyag) a csúszás kevesebb hajtást ad, mint a tapadás. Felette a megfelelő szögű sebességcsúszás nyer. Ez a csúszás időbe került, mert a szöge rossz volt.

## Mit enged meg az egyes forrás {#what-each-source-allows}

| A körök hordoznak | Blokkolás / kipörgés | Túlkormányzás / megpördülés | Alulkormányzás |
|---|---|---|---|
| kerekenkénti csúszási arány és csúszási szög, az autó sebessége (Forza Data Out, az AC-játékok) | csúszásból | driftszögből, vagy hátsó csúszási szögből | csúszási szögekből |
| kerékfordulatszámok, világsebesség (ralijátékok, BeamNG) | származtatott csúszásból | származtatott driftszögből | kormányzásból görbületenként |
| legyezés és legyezési sebesség, csúszás nincs (iRacing) | - | a driftszögből (az illesztett legyezés a haladási iránnyal szemben); a „helyzetsebességből” ellenkormánnyal csak akkor, ha a legyezésben nem lehet megbízni | kormányzásból görbületenként |
| csak fejirány | - | fejirány és haladás összevetéséből | kormányzásból görbületenként |
| csak egy FH Companion körfájl (nincs legyezés, nincs csúszás) | - | - | kormányzásból görbületenként (van kormány és gyorsulás) |

A koccanásokhoz és balesetekhez csak sebesség kell (gyorsulásokkal jobb), ezért minden forrásban megvannak. Az **Autóirányítás** rész mutatja, mit enged meg az egyes forrás. Csak egy FH Companion körfájllal a kormányzásból adódó kifelé tolásokat és a koccanásokat látod, a többihez pedig a tippet, hogy töltsd be a `.tele.gz` fájlt.
