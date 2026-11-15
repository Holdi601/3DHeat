---
title: "Manévre"
parent: "Zistenia"
nav_order: 4
lang: "sk"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manévre: ako sa skupiny pohybujú

**Zistenia → Manévre** sleduje, ako sa jednotky každej strany pohybujú *ako skupiny*,
a pomenúva manévre, ktoré robia - obchvat, kliešte, prielom, zálohu, ústup, obranu
pred raketami, prekríženie T - pri každom uvádza, ako veľmi je si istý, čísla, na ktorých
stojí, či sa to vyplatilo, a jeho paralely v doktríne a histórii. **Hromadná analýza → Manévre**
ich spočíta naprieč tisícmi zápasov: ako často sa každý robí na mape, v režime a na
strane, a ako často sa vyplatí.

Všetko sa počíta vo vašom prehliadači, vo vlastnom worker-i
(`src/insights/maneuver`); zápas s niekoľkými stovkami jednotiek trvá 10-500 ms,
dvojhodinová vzdušná vojna s tisíckami objektov asi sekundu.

## Použitie {#using-it}

- Otvorte **Zistenia**, karta **Manévre**. Pri prvom otvorení sa spočíta; po zmene filtrov
  použite **Nájsť znova**.
- **Isté / Pravdepodobné / Možné** nastavuje zvolenú istotu (štandardne Pravdepodobné).
- **Časová os** má pruh pre každú stranu a jeden stĺpec pre každý manéver; **zoznam**
  pod ňou ukazuje to isté podľa času. Kliknutie prepne na prehrávanie na jeho začiatku,
  presunie kameru tam a vykreslí ho v 3D: cestu každej skupiny ako šípku (dve ramená
  kliešťí sú jej oblúky), obrysy skupín v kľúčovom okamihu (nepriateľ vo farbe svojej strany),
  čelo nepriateľa ako bielu čiaru. **Vykresliť všetko v 3D** pridá ostatné manévre zápasu,
  bledo. Čiary sa posielajú na grafickú kartu raz, keď sa výber zmení, nie
  každý snímok: pri 480 manévroch vykreslených počas prehrávania sú časy snímkov na
  skutočnej GPU (WebGL2 a WebGPU, p99 18,0-18,5 ms, max 19,5-20,8 ms) rovnaké ako bez nich.
- Otvorený manéver ukazuje svoj výsledok (straty nepriateľa a vlastné straty jednotiek,
  ktoré ho robili, počas jeho behu a tesne po ňom, v porovnaní s výmenou strany za celý
  zápas), svoje dôkazy a záznamy z znalostnej základne - doktrínu a historické paralely
  (Cannae pre kliešte, Sedan 1940 pre prielom, Cušima pre prekríženie T, Operation Bolo
  pre fintu...).
- Malá tabuľka na konci: podľa druhu a strany, urobené a vyplatené.

![Kliešte na syntetickom ukážkovom zápase: šípky oboch ramien, telo nepriateľa a jeho čelo](../assets/img/en/maneuvers.webp)

## Ako sa nachádzajú skupiny {#how-groups-are-found}

Každá jednotka sa umiestni na spoločnú časovú os (krok 1 s pešo, inak 2 s, pri veľmi
veľkých súboroch dlhší), pri smrti zostane na mieste, aby pri oživení nevznikla čiara
cez mapu. V každom kroku sa jednotky strany a druhu (lietadlá, vozidlá, lode, pechota)
spájajú, keď sú blízko - 18 m pešo, 170 m pre vozidlá, 3 km pre lode, 5 km pre lietadlá -
a pohybujú sa rovnako (rýchlosti do polovice rýchlejšej z nich, alebo obe stoja).
Zhluk si ponechá identifikátor skupiny, v ktorej bola väčšina jeho členov. Jednotka bez
triedy sa zaradí podľa rýchlosti: pešo, vo vozidle alebo vo vzduchu.

**Tvar** skupiny sa číta vzhľadom na jej smer: stĺpec alebo línia podľa rozptylu pozdĺž
a naprieč, klin tam, kde vedie stred, ešelón tam, kde sa členovia stiahnu na jednu stranu,
škatuľa tam, kde držia rohy.

Všetko sa posudzuje v mierke samotného zápasu: **rozsah stretu** `R` je 75. percentil
vzdialenosti medzi zabijakom a jeho obeťou (orezaný na rozsah domény), a časy manévru sa
škálujú podľa druhu jednotky (pechota tretinu terénu).

## Čo nachádza {#what-it-finds}

| Manéver | Nájde sa, keď |
|---|---|
| Formácia | skupina drží jeden tvar na 60 % svojich pohybových krokov počas 30 s |
| Čelný útok | skupina sa priblíži zo vzdialenosti mimo dosahu až ku kontaktu, na ¾ R alebo viac, zo smeru do 35° od toho, kam nepriateľ smeruje |
| Útok na bok | to isté z 50-130° (zozadu za 130°); istý len s priateľskou *pevnou silou*, ktorá tam bojuje s nepriateľom (zabitia oboma smermi) |
| Kliešte | dva útoky na bok jednej strany na to isté telo nepriateľa, z protiľahlých strán (100° alebo viac od seba), do 90 s; istý, keď jeho ramená bojujú |
| Obkľúčenie | kompaktná skupina nepriateľa, ktorú obklopuje aspoň toľko protivníkov, koľko je jej členov, do 1,5 R, z dvoch alebo viacerých skupín, bez medzery väčšej ako 100°, na minútu, odrezaná od svojej strany; istý, keď sa kruh zavrel na ½ R a bojoval vo vrecku |
| Prienik | skupina prejde cez držanú líniu (nepriatelia stoja 30 s naľavo aj napravo od nej, stred ich strany za nimi); istý, keď sa dostane o ½ R ďalej, zostane 20 s a bojuje tam; prielom o ďalších R ďalej |
| Krytá postupová palba | v malej skupine sa časť hýbe, kým ostatní stoja, úlohy sa vymieňajú štyrikrát alebo viackrát, s krycou paľbou zo stojacej časti |
| Sústredenie / rozptyl | podiel strany blízko jej najhustejšieho bodu stúpne z 35 % na 60 % (jednotky prichádzajú o 1,5 R alebo viac, potom kontakt) - alebo klesne, keď sa strana rozprestrie |
| Fingovaný útok | malý prvok v kontakte vytiahne dva alebo viacerých nepriateľov z iného miesta; väčšia skupina potom udrie štyri vzdialenosti odtiaľ, kde je nepriateľa menej |
| Ústup / prenasledovanie | skupina v kontakte sa otočí a odíde a medzi ňou a miestom boja vznikne R; istý, keď tam nepriateľ práve zabil jedného z nej a skupina sa dostala na 2 R od toho zabijaka (nikdy pešo: pozri nižšie); nepriatelia pohybujúci sa rovnakým smerom a držiaci krok prenasledujú |
| Obrana do hĺbky | stojace jednotky v dvoch alebo viacerých pásmach naprieč osou nepriateľa, do hĺbky R, nepriateľ postupuje, paľba z pásiem |
| Reverzný svah | tri alebo viac zabití na krátky dosah stojacimi jednotkami obetí, ktoré prišli cez hrebeň |
| Záloha | pohybujúca sa skupina narazí na nepriateľov, ktorí stáli 45 s; oni strieľajú prví a pohybujúci sa stratia dve jednotky alebo polovicu skupiny |
| Clona | jedna alebo dve jednotky idú pred telom troch alebo viacerých a prvé stretnú nepriateľa |
| Vnútorné línie | skupiny strany sú blízko seba medzi skupinami protivníka a jej jednotky sa medzi nimi presúvajú |
| Tempo | strana reaguje na kontakt (otočenie, zmena rýchlosti, prvý výstrel) 1,5-krát rýchlejšie, Mann-Whitneyho p pod 0,05 |
| Kľuka, zárez, ťah, pumpa | cieľ raketového odpálenia otočí strelca o 35-70°, 75-105°, za 140°, alebo ho ťahá a potom otáča späť |
| Vzdušné kliešte, stena, vedúci-zadný, mlynček | dvojica sa rozdeľuje na jedného nepriateľa; traja vedľa seba proti nepriateľovi; prvok 5-20 km za iným; dvaja krúžia okolo jedného bodu vo vzdialenosti jedného bodu |
| Bojová vzdušná hliadka | krúži okolo stanice tri minúty |
| Boj o energiu / uhly | v blízkom boji - kurzy 30° od seba, každý v rade drží druhého pred nosom, alebo medzi nimi padne zabitie - využíva výšku a stúpa, alebo letí naplocho a ostro sa otáča pri spomaľovaní; istý, keď jeden zabil druhého |
| Úderný balík, SEAD | vzdušná skupina zmiešaných úloh, z ktorých niektoré zasiahnu zem; zabitia protivzdušnej obrany skôr než väčšina ostatných pozemných zabití |
| Línia bitky, prekríženie T | tri lode v kolóne; kolóna štvorcovo napríč pred hlavou kolóny nepriateľa |

Každý manéver uvádza, ktoré **vzory** zo znalostnej základne ukazuje
(`patterns-maneuver.ts`: formácia, čelný útok, dvojité obkľúčenie, obkľúčenie, prienik,
palba a manéver, fingovaný útok, ústup, prenasledovanie, obrana do hĺbky, clonenie,
rozptyl, obrana pred raketami, boj o uhly, bojová vzdušná hliadka, úderný balík, línia
bitky, prekríženie T) a záznamy, ktoré treba prečítať ako prvé; staršie záznamy prenášajú
nové vzory cez `knowledge/maneuver-tags.ts`. Pozri [Šošovka znalostí](knowledge.md).

**Vyplatilo sa** porovnáva výmenu jednotiek počas behu (a minútu po ňom) s výmenou ich
strany za celý zápas: ústup sa vyplatí, keď po otočení stratil menej jednotiek ako pred ním,
obrana pred raketami, keď lietadlo prežije minútu, obkľúčenie, keď vrecko stratí polovicu.

## Naprieč mnohými zápasmi {#over-many-matches}

Súhrn každého zápasu (`src/mass/summarize.ts`, pozri [Hromadná analýza](mass-analysis.md))
obsahuje malú sekciu `maneuvers`: podľa druhu a strany - urobené (na Pravdepodobné alebo
vyššie), vyplatené, nevyplatené, zabitia a straty. **Hromadná analýza → Manévre** ich
sčíta naprieč zápasmi, ktoré filter ponechá - podľa mapy a režimu, alebo spolu - s
Wilsonovým intervalom miery vyplatenia; riadok načíta zápasy, v ktorých bol urobený.
Súhrny zapísané pred vznikom tejto sekcie ju nemajú: spustite
`node tools/3dheat-summarize.mjs <folder> --force`, aby ju pridali.

## Ako je si istý {#how-sure-it-is}

Syntetické zápasy s vloženými manévrami (`synth.ts`, spúšťa `maneuver.test.ts`): všetkých
28 vložených druhov sa nájde na Pravdepodobné alebo vyššie; z 50 nahlásených manévrov je
31 vloženého druhu a ďalších 19 tam naozaj je (formácia pohybujúcej sa skupiny, čelný
prístup prenikajúcej kolóny); žiadny nie je zlý. Na 30 nulových zápasoch - náhodné
prechádzky oddelene a zmiešane, jednotky stojace náhodne, lietadlá na priamych trasách,
dav, ktorý sa potulá - sa na Pravdepodobné alebo vyššie nenahlási nič.

Na reálnych dátach (desiatky pozemných bitiek, niekoľko dlhých misií vzdušnej vojny,
tucet zápasov streľby): čelné útoky, boky, prieniky a obkľúčenia v tankových bitkách,
formácie a blízke boje vo vzduchu, obrany pred raketami, bojové vzdušné hliadky a dvojice
vedúci-zadný v misiách vzdušnej vojny, čelné popravy, kolóny a niekoľko záloh a dvojíc
v pohybe v streľbe. Prahy sú tvary doktríny v mierke hry; jedno nájdenie čítajte s jeho
dôkazmi a miery z hromadnej tabuľky s ich intervalmi.

### Proti nulovým modelom tých istých zápasov {#against-null-models-of-the-same-matches}

Detektor môže zmiasť terén a dav: v zmätenej bitke má každá skupina nepriateľov všade okolo.
Preto sa každý druh spúšťa aj na **nulových modeloch** postavených z tých istých zápasov
(`nulls.ts`), kde sa strany už nestretávajú tak, ako v skutočnosti: časová os jednej strany
sa otočí o tretinu až dve tretiny zápasu (*posun*), alebo jej trasy sa otočia okolo stredu
mapy (*otočenie*); a označenia tímov sa pomiešajú (*tímy*, čo konštrukčne zachová asi polovicu
skutočných bojov). Boje sa počítajú len ako zabitia spárované s ich smrťami, zabijak do 2 R
a obeť na mieste - nulový model tieto väzby rozbíja. Nájdenia na Pravdepodobné alebo vyššie,
skutočné oproti nulovým modelom (30 tankových bitiek; 12 zápasov streľby):

| Druh | Tankové bitky: skutočné / posun / otočenie | Streľba: skutočné / posun / otočenie |
|---|---|---|
| Obkľúčenie | 0 / 0 / 0 (bolo 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Prienik | 0,03 / 0,02 / 0,05 (bolo 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Bok | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Čelný útok | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Ústup | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (preto pešo nikdy istý) |
| Záloha | - | 0,17 / 0,04 / 0,04 |
| Boj o energiu | 1,2 / 0,1 / 0,85 | - |
| Boj o uhly | 0,6 / 0,07 / 0,3 | - |

Blízke boje vo vzduchu nad stredom bojiska prežijú otočenie okolo tohto stredu, takže
stĺpec otočenia im prikrášľuje menej než pozemným druhom. Druhy v rámci jednej strany -
formácia, bojová vzdušná hliadka, mlynček, úderný balík, SEAD, pohyb v páre, clona -
nezávisia od druhej strany a takto sa netestujú. `maneuver.test.ts` kontroluje, že nulové
modely odstránia vložený bok, kliešte, obkľúčenie, prienik, záloha a ústup zo syntetických zápasov.

## Limity {#limits}

- Skupiny potrebujú pozície v čase; súbor len udalostí žiadne nemá.
- Smer nie je čítaný z dát: čelo nepriateľa je tam, kde ho pevná sila zapája, inak tam, kam
  sa pohybuje, inak tam, odkiaľ prišiel útočník.
- Terén sa číta z výšok samotných jednotiek (reverzný svah); nie je tu test videnia.
- Veľmi veľké súbory sa vzorkujú dlhšími krokmi; krátke vzdušné manévre v nich sa stále
  čítajú z krokov 2-4 s.
