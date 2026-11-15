---
title: "Analytika závodov: metóda"
parent: "Analýza pretekov"
nav_order: 58
lang: "sk"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Analytika pretekov: metóda

Stručne:

- Kolá sa porovnávajú **podľa vzdialenosti**, nie podľa času, takže to isté miesto na trati sa zarovná.
- Každá zákruta sa posudzuje **celá**, od jednej brzdnej zóny po druhú.
- Stratený čas sa **rozdelí** na to, kde sa stratil (brzdenie, vstup, výjazd, rovinka), a na to, koľko z neho vysvetľuje auto.
- Príčina sa **vysvetlí slovami**, s radou.
- Na používanie, nie na čítanie o tom, ako to funguje: pozri [Analýza pretekov](race-analysis.md).

Toto je metóda za kartou **Analýza pretekov**: čo meria, ako rozhoduje, kde sa čas stratil, a ako to premieňa na radu. Je to špecifikácia, ktorú nasleduje kód analýzy (`src/race/`), takže každé pravidlo tu má zodpovedajúcu časť v kóde a test, ktorý ho pevne drží.

## Čo robia profesionálne nástroje {#what-the-professional-tools-do}

Zavedené nástroje sa zhodujú na tom istom jadre a líšia sa hlavne v tom, ako ďaleko siahajú k *príčinám*:

- **Všetko sa porovnáva podľa vzdialenosti, nie času.** Dve kolá sa prepočítajú na jednu os vzdialenosti; bežiaci rozdiel uplynulého času pri rovnakej vzdialenosti je *delta* (MoTeC to volá časová odchýlka, iní časový posun alebo stopa delty). Jej sklon hovorí, kde sa čas práve stráca: plytký sklon je zrýchlenie, odpor alebo trvalé priľnavosť; strmý rozdiel brzdenia alebo plynu; vlna hore a dole je kompromis medzi rýchlosťou vstupu a výjazdom.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [analýza časov úsekov](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Každá zákruta sa rozdelí na fázy**: brzdenie, vstup, stred, výjazd - bod brzdenia, špička brzdy a jej uvoľnenie, minimálna rýchlosť a kde sa dosiahne, rýchlostný stupeň, nábeh plynu, návrat na plný plyn, rýchlosť na výjazde.
  ([Driver61: šesť fáz](https://driver61.com/uni/corner-phases/),
  [iRacing sprievodca analýzou kola](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-úseky na zákrutu a teoretické najlepšie kolo** zložené z najrýchlejšieho z každého. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Odjazdená stopa sa tiež porovnáva**, ale nikdy samostatne: „čiara na obrázku nič neznamená, kým nepoznáte prispievajúce faktory“ - číta sa spolu s stopou rýchlosti a deltou.
  ([Track Titan: ako analyzovať telemetriu](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Koreň problému, nie príznak.** Je strata na rovinke naozaj plynom, alebo zlý vstup prinútil neskorý plyn? Chyby sa radia podľa ceny v čase kola a vysvetľujú sa jednoducho.
  ([Track Titan koučovacie toky](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Čo sa pokazilo v prvej verzii a prečo na tom záleží {#what-went-wrong-in-the-first-version-and-why-it-matters}

Prvá verzia účtovala každú *fázu* zvlášť a pozerala sa len na straty. Kolo, ktoré brzdilo skôr, stratilo čas vo fáze brzdenia a dostalo radu brzdiť neskôr - aj keď to skoršie brzdenie dostalo auto skôr do zákruty, skôr na plyn a z zákruty rýchlejšie, a všetko to vybehalo späť na rovinke. V jednom teste povedala kolu, ktoré takto jazdilo, aby „brzdilo oveľa neskôr“, hoci druhé kolo - ktoré brzdilo neskôr - minulo vrchol zákruty, vyšlo von širokým oblúkom a stratilo presne to, čo získalo. Časové dáta hovorili, že obe cesty sú vyrovnané; rada hovorila opak.

Oprava je pravidlo, na ktorom sa zhodujú všetky vyššie uvedené zdroje: **zákruta sa posudzuje celá**, od brzdnej zóny pre ňu po brzdnú zónu pre ďalšiu, pretože „niekedy výmena niekoľkých milisekúnd v zákrute môže zlepšiť celkový čas kola tým, že umožní rýchlejšie úseky za ňou“
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Závodné poznatky, ktoré pravidlá kódujú {#racing-knowledge-the-rules-encode}

**Rýchlosť na výjazde záleží viac než rýchlosť na vstupe**, a tým viac, čím dlhšia je nasledujúca rovinka: „čas strávený na rovinkách dominuje času strávenému v zákrutách“, a rýchlostný deficit na výjazde sa prenesie do ďalšieho bodu brzdenia. Najrýchlejší spôsob cez zákrutu a rovinku je často zatočiť pomalšie, aby plyn prišiel skôr - *pomaly dnu, rýchlo von*.
([Race & Track Driving: postup na zlepšenie času kola](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: uprednostňovanie zákrut](https://driver61.com/uni/prioritising-corners/))
Plánovač minimálneho času, ktorý je navyše odmenený za rýchlosť na výjazde, posunie svoje vrcholy neskôr a dostane *rýchlejšie* kolo; odmena, ktorá oba vyvažuje, stojí `L / v²` na jednotku rýchlosti na výjazde pre rovinku dĺžky `L` pri rýchlosti `v` - čas, ktorý rozdiel rýchlosti stojí na rovinke, rastie s jej dĺžkou a klesá s druhou mocninou rýchlosti
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Zákruty podľa toho, čo vedú na.** Zákruta, za ktorou nasleduje rovinka: maximalizovať rýchlosť na výjazde, neskorý vrchol, čo najskôr späť na výkon. Zákruta na konci rovinky: maximalizovať rýchlosť, s ktorou sa do nej vstúpi, brzdiť čo najneskôr; skorší vrchol je prijateľný. Zákruta medzi zákrutami: kompromis pre tú, na ktorej záleží po nej. Zákruta, ktorá môže byť ktorýkoľvek z týchto typov, sa berie ako zákruta pred rovinkou. Rýchlejšie zákruty váhia viac: pri rýchlosti auto zrýchľuje slabo a stratený km/h sa už nedobehne.
([Allen Berg: tri typy zákrut](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: uprednostňovanie zákrut](https://driver61.com/uni/prioritising-corners/),
[Driver61: iné zákruty, iné techniky](https://driver61.com/uni/different-corner-technique/))

**Krúžok trenia.** Pneumatika má jeden rozpočet priľnavosti, ktorý sa minie na brzdenie, zatáčanie a zrýchľovanie v akejkoľvek kombinácii; celkové zrýchlenie je `sqrt(lat² + long²)`. Brzdenie v zákrute sleduje jeho okraj: brzda sa uvoľní, keď sa zvyšuje riadenie a bočné zaťaženie.
([krúžok trenia](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Rolovanie** - žiadny pedál stlačený - je najpomalší spôsob, ako stratiť rýchlosť, a sám o sebe meraný kľúčový ukazovateľ výkonu.
([Racecar Engineering / OptimumG: koeficient rolovania](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Prešmyk.** Pozdĺžna sila dosiahne vrchol pri pomere prešmyku asi 10 - 20 %, potom klesá; za ním sa koleso pri brzdení zablokuje alebo pri plyne preklzne. Forza hlási prešmyk normalizovaný: 0 je plná priľnavosť, veľkosť nad 1 je stratená priľnavosť.
([pozdĺžny prešmyk](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Podotáčanie a preťahovanie.** Predný uhol driftu väčší než zadný je podotáčanie; zadný väčší než predný preťahovanie. Bez uhlov driftu: auto sa otáča menej, než riadenie žiada (riadenie nad Ackermannovým uhlom `L/R`, ktorý auto potrebuje pri nízkej rýchlosti).
([podotáčanie, prehľad](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Geometria čiary {#the-geometry-of-a-line}

Rýchlosť, ktorú auto dokáže udržať na polomere `R`, je `v = sqrt(a R)`, kde `a` je bočné zrýchlenie, ktoré mu dajú pneumatiky (plus to, čo pridá prítlak, ktorý rastie s `v²`). Takže **rýchlosť rastie s odmocninou polomeru**: čiara cez stred na o 20 % väčšom polomere je tam asi o 10 % rýchlejšia.
([maximálna rýchlosť v zákrute](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: zákruty](https://www.formula1-dictionary.net/cornering_tech.html))

**Geometrická čiara** je najväčší oblúk cez zákrutu: z vonkajšej hrany, dotyk vnútornej hrany vo vrchole, späť na vonkajšiu. Pre zákrutu, ktorá sa otáča o `θ` na ceste širokej `w` (mínus šírka auta), oblúk dotýkajúci sa oboch vonkajších hrán a dotýkajúci sa vnútorného rohu má `R = w / (1 - cos(θ/2))` (plus vlastný polomer vnútornej hrany) - pre pravý uhol asi `3,4 w`, pre serpentínu `w`. Preto využitie šírky záleží najviac v stredných zákrutách a najmenej v serpentínach.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**Neskorý vrchol** sa otočí neskôr a hlbšie, na najprv užšom polomere, a na ceste von polomer rozširuje: pomalšie cez stred, skôr rovno, skôr naplno - „o niečo nižšia minimálna rýchlosť, ale silnejší profil zrýchlenia na výjazde“. **Skorý vrchol** je opak: rýchlejšie dnu a polomer, ktorý sa na ceste von sťahuje a plyn drží späť - z veľkej časti chyba, okrem veľmi nízkej priľnavosti, kde rýchlosť stratená dnu sa von už nedá dobehnúť.
([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[matematika racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**„V“ a „U“.** U je klasická okrúhla čiara: najširší polomer, najmenšia zmena riadenia. V sa otočí skôr, ide hlbšie, rýchlo natočí auto v strede a nastaví výjazd na rovnejší beh von: brzdenie zostáva rovné (takže môže byť neskoršie), minimálna rýchlosť je nižšia, ale dosiahne sa neskôr, plný plyn príde oveľa skôr.
([Track Titan: čiara V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Krivosť voči vzdialenosti.** Najrýchlejšia čiara je kompromis medzi najkratšou cestou a najmenej zakrivenou; na šírke pretekárskej trate záleží krivosť viac, a čiara s minimálnou krivosťou sa blíži čiare s minimálnym časom všade tam, kde je auto na svojom limite - odchýli sa od nej tam, kde by auto mohlo zrýchliť.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Zákruty za sebou** - dvojitý vrchol, šikana - sú jeden problém: výjazdová čiara jednej je vstupnou čiarou ďalšej a jazdí sa spätne od tej, ktorá vedie na rovinku.
([Driver61: iné zákruty, iné techniky](https://driver61.com/uni/different-corner-technique/))

## Ktorá čiara sa hodí ktorému autu {#which-line-suits-which-car}

O tom rozhoduje **výkon voči priľnavosti** auta pri rýchlostiach tej zákruty - „hybnosť je priľnavosť oproti výkonu, je to pomer“.
([Ross Bentley: autá na hybnosť](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[hybnosť nad výkonom](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Auto, v tejto zákrute | Čiara | Prečo |
|---|---|---|
| Silno zrýchľuje na svoju priľnavosť („point and shoot“) | V: brzdiť rovno a neskoro, natočiť v krátkom tesnom strede, rovno a skoro naplno | čas sa vyhráva plným plynom, nie minimálnou rýchlosťou |
| Slabo zrýchľuje na svoju priľnavosť („momentum“) | široké U, mierne neskorý vrchol, udržať minimálnu rýchlosť vysoko | nedokáže dobehnúť rýchlosť, ktorú stráca |
| Medzi tým | pomaly dnu, rýchlo von: U s neskorým vrcholom | klasický kompromis |
| Rýchla zákruta, a tým viac s prítlakom | U, blízko geometrickej čiary | zrýchlenie pri rýchlosti je slabé; priľnavosť od prítlaku rastie s `v²`, takže rýchlosť cez stred sa vyplatí dvakrát |
| Veľmi nízka priľnavosť (mokro, sneh) | skorší vrchol | rýchlosť stratená dnu sa von nedá dobehnúť |
| Výkon ďaleko nad priľnavosťou | čiara záleží menej | trakcia, nie čiara, obmedzuje výjazd |

„Čím rýchlejšia zákruta, tým bližšie ku geometrickej čiare; čím pomalšia, tým viac ju meníte neskorším vrcholom.“
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[matematika racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: čiara V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: priľnavosť](https://driver61.com/uni/grip/))

Pohon mení, ako sa čiara jazdí, viac než samotná čiara: auto s pohonom na prednú nápravu sa natočí brzdou (trail braking) a dostane výkon, až keď sa koleso odvinie, inak sa zosype širokým oblúkom; výkonné auto s pohonom zadnej nápravy musí byť rovno pred plným plynom, inak zadok vyskočí; pohon všetkých kolies môže dávať výkon aj pri zatáčaní, takže plyn príde skôr.
([technika FWD](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD v zákrutách](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Prehliadač meria pomer výkonu k priľnavosti auta pri každej zákrute z jeho vlastnej jazdy - zrýchlenie naplno pri rýchlosti výjazdu voči bočnej priľnavosti pri minimálnej rýchlosti - a volá to „point and shoot“ pri 0,45 a vyššie, „momentum“ pri 0,25 a nižšie. Auto, ktorého priľnavosť pri 150 - 250 km/h je o viac než 15 % vyššia než jeho priľnavosť pri 55 - 110 km/h, má pracujúci prítlak.

## Postup {#the-method}

Čísla nižšie sú odôvodnenie. Prahy, ktoré kód používa, sú uvedené každý na svojej stránke, a tie stránky sú referencia, keď sa tu číslo líši: [Analýza zákruta po zákrute](race-corner-analysis.md), [Udalosti kontroly auta](race-control-events.md), [Profily a porovnanie áut](race-car-profiles.md) a [Štatistiky trate](race-course-statistics.md).

### 1. Jedna os vzdialenosti {#one-distance-axis}

Najrýchlejšie kolo je referencia, pokiaľ používateľ nevyberie iné. Jeho odjazdená dráha je os: vzorky každého ďalšieho kola sa premietnu na ňu, takže každá vzorka dostane vzdialenosť pozdĺž referencie `s` a so znamienkom bočný posun `d`. Premietanie hľadá dopredu len od predchádzajúcej zhody, takže kolo, ktoré sa kríži so sebou, nikdy neskočí na zlú stranu mosta. Kolá sa potom prepočítajú na jednu mriežku, po 2 m, pre každý kanál. Každé kolo sa posledných pár metrov nesie rýchlosťou, akú malo, takže jeho delta na čiare je rozdiel jeho času kola.

### 2. Zákruty a podiel každej zákruty na kole {#corners-and-each-corners-share-of-the-lap}

Ako sa nájdu zákruty, úseky a komplexy: [Analýza zákruta po zákrute](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Časový účet zákruty {#the-time-account-of-a-corner}

Čistý čas, rozdelenie, rýchlosť na výjazde a ťah áut: [Analýza zákruta po zákrute](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Verdikt a príčina {#the-verdict-and-the-cause}

Vzory verdiktov a príčiny pri vstupe a výjazde: [Analýza zákruta po zákrute](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Auto proti vodičovi {#the-car-against-the-driver}

Keď sú kolá v rôznych autách, strata, ktorú vysvetľuje auto, sa odpočíta po častiach:

- **ťah**: autá od rovnakej rýchlosti na rovinke, ako vyššie;
- **priľnavosť**: z nižšej minimálnej rýchlosti, ktorá sa nevysvetľuje užším polomerom, podiel `½ ln(priľnavosť_iného / priľnavosť_moja) / ln(v_iného / v_moja)`, keď bolo kolo na limite svojho auta (90 % toho, čo ukázalo pri tej rýchlosti);
- **brzdy**: z `u` na `v` pri spomalení `a1` oproti `a2`, končiac v tom istom bode, stojí `(1/a1 - 1/a2)(u - v)² / 2u` - len vtedy, keď kolo brzdilo približne tak tvrdo, ako auto dokáže v tej zóne priemerne, nie len v špičke.

Čo auto dokáže, vychádza zo všetkých načítaných kôl s ním: bočná priľnavosť, brzdenie a zrýchlenie naplno na každý interval rýchlosti 5 m/s (95., 95. a 90. percentil). Priľnavosť je to, čo auto **držalo pol sekundy** - bočné zrýchlenie spriemerované za 0,5 s - nie to, čoho sa dotkla jedna vzorka: obrubník, pošmyknutie, ktoré sa vráti späť, alebo auto, ktoré sa dobieha, na chvíľu vyhodia hodnotu do špičky, a auto, ktoré to robí často, vyzeralo priľnavejšie, než je. (Overené na zaznamenaných kolách dvoch rôznych áut: meranie na vzorku ich dalo blízko seba; držané pol sekundy ich oddelí tak, ako ich oddeľujú ich časy kôl.) Brzdenie a ťah berú každú vzorku ako medián seba a svojich susedov. Vzduch, usadanie po pristátí a každý náraz (oddiel 6), kým sa auto nespamätá, sa vynechajú.

**Čo je ktoré auto** (`profile.ts`): z tých istých kôl:

- **držaná priľnavosť**: 95. percentil tohto bočného zrýchlenia za pol sekundy;
- **ťah** pri plnom plyne do 50 km/h, 50 - 120, 120 - 200 a nad 200, a najviac, čo ukázal;
- **brzdenie** z 60 na 160 km/h;
- **najvyššia rýchlosť**: kde prestalo nabierať pri plnom plyne počas sekundy na rovinke - jazdené rovno, nie dlhá zákruta prejdená naplno, kde auto na akomkoľvek výkone spomaľuje. Kde nebola žiadna rovinka dosť dlhá, hovorí to, čím ešte ťahalo pri najvyššej rýchlosti, ako ďaleko bolo od cieľa. Žiadny odhad nad to, čo ukazujú kolá: prispôsobenie výkonu voči rýchlosti proti odporu postavilo cestné auto 100 km/h nad jeho skutočnú najvyššiu rýchlosť, lebo prevodovka a obmedzovač končia ťah auta oveľa skôr než odpor;
- **strata zadnej nápravy**: koľkokrát na kolo šmykla za 10° driftu (20° na nespevnenom povrchu) s kolesom natočeným proti zákrute - chytená protiriadením - koľko z toho sa začalo na plyne a pri akom podiele svojej priľnavosti sa začali. Auto, ktoré jazdí trochu bokom úmyselne, nič nestráca; to, ktoré treba chytať, áno. Počíta sa rovnako pre každé auto, takže sa dajú porovnať dve autá;
- **vyváženosť**, kde kolá nesú uhly driftu: predná voči zadnej na limite.

**Porovnanie áut** postaví autá vedľa seba - tabuľku, po jednej vete o tom, aké je auto oproti tomu druhému („X zrýchľuje lepšie, ale nedokáže sa otočiť tak prudko, dlhšie brzdí a ľahšie stráca zadok“), každý rozdiel, ktorý je jasný (4 % priľnavosti, 5 % ťahu alebo brzdenia, 4 km/h najvyššej rýchlosti, zadná náprava chytená aspoň o jedno kolo viac a o polovicu častejšie), a ako jazdiť každým. S jedným autom hovorí, aké je to auto.

**V každej zákrute**, keď sú kolá v rôznych autách, nález povie, čo z toho určujú autá, a ako čo najlepšie využiť tohto:

- **cez stred**: na čiare druhého auta dovoľuje priľnavosť tohto auta `v_iného · √(priľnavosť_moja / priľnavosť_iného)`. Ak to kolo dosiahlo, rozdiel je auto a žiadny bod brzdenia ho nezmení - povie sa to a zákruta sa pripíše autu, nie vodičovi; ak dosiahlo menej, zvyšok sa dá získať, a povie sa koľko. Potom kde sa čas dá získať namiesto toho: na rovinku alebo v aute, ktoré ťahá silnejšie, po vrchole - brzdiť rovno, otočiť neskôr, skoro namieriť na výjazd; inak najširší polomer, aký cesta dovolí, lebo väčší polomer je jediný spôsob, ako získať viac rýchlosti bez väčšej priľnavosti;
- **zadná náprava, ktorá sa pustila**, tu, v aute, ktoré ju stráca ľahšie než to druhé: čo robiť v tomto aute - plyn pridávaný, keď sa koleso odvinie, alebo brzda jemne uvoľnená bez odľahčenia uprostred zákruty, podľa toho, ako šmyky začínajú;
- **rovinka po nej**: čo zobralo silnejšie ťah druhého auta z tej istej rýchlosti a kde tomuto autu na nej došiel ťah;
- **skorší bod brzdenia** v aute, ktoré brzdí menej tvrdo.

Kolo, ktoré šmyklo cez stred zákruty (za 10° driftu na asfalte), bolo za svojou priľnavosťou, nie pod ňou: nikdy sa mu nehovorí, že tam mal priľnavosti nazvyš. A kde zadná náprava tohto kola pustila pri menšom bočnom zrýchlení, než zákruta od nej žiadala, „priľnavosť nazvyš“ hovorí, aby ju hľadal v malých krokoch.

### 6. Ovládanie auta: zámky, prešmyk kolies, šmyky a podtáčanie, nárazy a havárie {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Každé kolo sa tiež číta z hľadiska toho, ako sa s autom narábalo - kde sa koleso zablokovalo, kde sa hnacie kolesá roztočili, kde zadok vyskočil, kde predok vyšiel širokým oblúkom - pretože to sú chyby, ktoré samotný čas nepomenuje. Tri veci zabezpečujú, že to drží naprieč hrami a povrchmi.

**Kde priľnavosť končí, sa meria z vlastnej jazdy auta.** Inžinieri nastavujú prah zablokovania pre každé auto pri prešmyku, ktorý dal najväčšie spomalenie (kanály MoTeC v brzdovej sérii OptimumG používajú pre jedno auto -0,07), nie podľa knižnej hodnoty, a knižné hodnoty sa aj tak nezhodujú: sila dosiahne vrchol pri prešmyku 5 - 20 % na asfalte podľa pneumatiky a modelu, pri 6 % alebo pri 20 - 60 % na snehu podľa zdroja, a žiaden zdroj nedáva hodnotu pre štrk. Hry škálujú prešmyk ešte inak: Forza ho má „normalizovaný“ tak, že nad 1 je priľnavosť stratená - no brzdy auta môžu dať svoj najlepší výkon hlboko pod alebo hlboko nad 1 a bežné brzdné zóny môžu ísť nad 1. Takže pre každé auto sa cez každé jeho načítané kolo sila, ktorú vyvinulo, roztriedi podľa prešmyku, pri ktorom bežalo - spomalenie oproti prešmykovému pomeru kolies pri brzdení rovno, zrýchlenie (ako podiel toho, čo auto pri tej rýchlosti vyvinie) oproti prešmyku hnacích kolies, priľnavosť v zákrute (ako podiel priľnavosti auta pri tej rýchlosti) oproti uhlu driftu každej nápravy - a limit je prešmyk za vrcholom, kde sila klesla o 8 %. Krivka, ktorá sa v dátach nikdy nezníži - zákrutová a trakčná priľnavosť Forza Horizon - nemá limit a prešmyk tam sám nič neoznačí. Pri príliš malom množstve dát je limit jeden a pol násobok menovitého vrcholu.

**Podklad je známy pre každú vzorku**, kde to hra hovorí: Forza otrasie kolesá na štrku, prachu a tráve (málo vzoriek na asfaltovom okruhu, veľa na prachu a terénnych tratiach), Trackmania pomenúva materiál pod každým kolesom a podklad rally etapy sa nájde tak, ako hovorí oddiel 11. Krivky, zvyky driftu a prahy sa držia oddelene pre asfalt a nespevnený povrch.

**Každá udalosť sa položí proti druhému kolu cez tie isté metre.** Na štrku, na snehu, v arkádovej hre plnej driftov sa zákruta jazdí šmykom: štúdie optimálneho riadenia nachádzajú „riešenia s malým driftom“ na asfalte a „agresívne, s veľkým driftom, aj protiriadenie“ mimo cesty, údaje z rally ukazujú pneumatiky „ďaleko vnútri nelineárnej oblasti“ a zablokovanie kolesa na veľmi uvoľnenom povrchu môže dokonca zastaviť auto skôr. Takže udalosť, ktorú urobilo aj druhé kolo - 80 % alebo viac - je spôsob, akým sa zákruta jazdí, nie chyba, a udalosť, ktorú druhé kolo neurobilo, je chyba len vtedy, ak stála čas: čas stratený od tesne pred ňou po 40 m za ňou. Chyba, ktorá vysvetľuje 40 % alebo viac straty zákruty, sa stane príčinou tej zákruty.

Prahy detekcie, test voči druhému kolu, nárazy a havárie a texty rád: [Udalosti kontroly auta](race-control-events.md).

### 6b. Veľa kôl: štatistiky trate {#b-many-laps-the-courses-statistics}

Porovnanie tried, čo sa počíta ako chyba, štatistiky a mapa chýb: [Štatistiky trate](race-course-statistics.md).

### 7. Odjazdená čiara {#the-driven-line}

Pre každé kolo a zákrutu, len z pozícií: kde sa začalo zatáčať (pätina jeho najužšej krivosti), jeho najužší polomer (cez ±8 m), priemerný polomer v prvej a druhej polovici jeho zmeny smeru a tak ďalej

- **tvar**: najužší ku priemernému polomeru pod 0,55 je V, nad 0,75 je U;
- **vrchol**: výjazdový polomer ku vstupnému polomeru nad 1,25 je neskorý, pod 0,8 skorý;
- **vrchol rýchlosti**: jeho najpomalší bod viac než 15 m pred polovicou jeho zákruty je pomaly dnu, rýchlo von; viac než 15 m za ňou, stále spomaľuje za stredom.

Proti druhému kolu: ako ďaleko vnútri alebo vonku bežalo pri vstupe do zákruty, cez najužšiu časť a tam, kde boli obe rovné, a kde sa každé natočilo. Každý nález sa končí čiarou, ktorá sa hodí na auto kola v tej zákrute - podľa toho, na čo zákruta vedie, a podľa nameraného pomeru výkonu k priľnavosti auta, prítlaku a pohonu - a tým, či ju kolo jazdilo. Tabuľka „Zákruta po zákrute“ uvádza najrýchlejšie kolo cez každú zákrutu s tvarom jeho čiary a dokopy najlepšie zákruty.

### 8. Dve mapy {#two-maps}

- **Kde**: trať zafarbená podľa `dΔt/ds` voči referencii, červená tam, kde sa čas stráca, zelená tam, kde sa získava.
- **Prečo**: každá strata nakreslená tam, kde je jej príčina, zafarbená podľa skupiny príčiny - brzdenie, vstup, výjazd, rovinka, auto - a širšia pri drahšej.

### 9. Prehrávanie {#replay}

Jeden čas, tri spôsoby, ako ho premeniť na vlastný čas každého kola: z čiary, zarovnané (každé kolo dosiahne jeden bod trate v ten istý okamih, potom sa pustí) a bok po boku (každé kolo sa podrží na vzdialenosti referencie).

### 10. Ktorým smerom je svet otočený {#which-way-round-the-world-is}

Svet prehliadača je pravotočivý s Y smerom hore. Hra s ľavotočivým svetom (medzi nimi Forza) sa v ňom zobrazí zrkadlovo: každá zákruta doprava sa nakreslí ako zákruta doľava, trať aj kolá. Kolá o tom hovoria samy - kladné riadenie je doprava v každom adaptéri a vonkajšie odpruženie zákruty sa stlačí - takže karta závodu ponúkne opravu a **Kamera a scéna → Obrátiť os sveta** to urobí: X, Y alebo Z sa kreslí obrátene. Mení sa len kreslenie - odraz zložený do matice pohľadu; kamera lieta v nakreslenom svete, a dáta, analýza a každá súradnica, ktorú nástroje ukazujú, zostávajú hernými. Analýza pomenúva zákruty doľava alebo doprava tým istým meraním.

### 11. Rally: šmyk, ľavá noha, vzduch {#rally-the-slide-the-left-foot-the-air}

Rally etapa nie je okruh jazdený na horšej priľnavosti. Na štrku a snehu je šmyk spôsob, ako sa zákruta berie: auto sa pri vstupe natočí presunom váhy - „brzdy presúvajú váhu auta dopredu ... predné pneumatiky získajú priľnavosť, zadné ju stratia, a auto sa otáča šmykom do zákruty“, potom späť na plyn, keď je „zoradené v smere, kam chcete ísť“ ([DirtFish: ako používať brzdy](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Ľavá noha brzdí, aby sa plyn a brzda dali hrať proti sebe; ručná brzda točí auto v tesných zákrutách ([RallySport Ontario: rally jazda, základy](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/),
[Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), a auto sa odlepí od zeme. Oddiel 6 už číta šmyky oproti druhému kolu; tieto pravidlá nesú zvyšok.

- **Podklad.** Čo hovorí kolo (`meta.surface`, `--surface` rally záznamníkov), inak názov podujatia - asfaltové rally (Španielsko, Chorvátsko, Stredná Európa, Nemecko, Japonsko, Korzika, Ypres), zimné (sneh) a asfalt Monte s snehom a ľadom na ňom (zmiešaný) - inak to, ako sa auto jazdilo. Bočný limit auta Rally2 je 0,7 - 0,9 g na štrku a 1,3 - 1,4 g na asfalte ([grenzbereich, referenčné hodnoty](https://github.com/GitCrush/grenzbereich)), a na štrku beží oveľa viac driftu (oddiel 6). Takže etapa, kde auto ťahalo 10 m/s² alebo viac (95. percentil, pri rýchlosti, na podklade), s mediánom driftu pod 6 stupňov všade, kde zabočilo v rámci 70 % tej hodnoty, bola asfalt; všetko ostatné alebo príliš málo na rozhodnutie je nespevnené.
- **Čo auto dokáže, na podklade, na ktorom to urobilo.** Priľnavosť, brzdenie a ťah (oddiel 5) sa merajú oddelene pre asfalt a nespevnený povrch, keď kolá jazdili pätinu alebo viac svojich vzoriek na každom, a každá zákruta sa posudzuje s podkladom pod autom v jeho najpomalšom bode. Vzorky vo vzduchu a 0,3 s po pristátí sa vynechajú zo všetkého, čo meria auto - obálky, krivky pneumatík, zámky a prešmyk kolies: pristátie otrasie autom nad to, čo pneumatiky zvládnu, a kolesá roztočené vo vzduchu nie sú prešmyk kolies. Prítlak sa nehodnotí na nespevnenom povrchu, kde sú rýchle a pomalé úseky etapy inými cestami.
- **Dotyk ľavou nohou nie je brzdenie.** Dotyk brzdy, keď je plyn stále na polovici alebo viac, na menej než 15 m, auto usadí alebo ním otočí; kde kolo začalo brzdiť pre zákrutu, je prvá brzda, pri ktorej sa plyn odobral, alebo ktorá trvala dlhšie.
- **Auto sa otočilo pri vstupe.** Pre každé kolo a zákrutu najväčší uhol driftu od jeho brzdenia po 5 m za jeho najpomalším bodom. Na nespevnenom povrchu kolo, ktoré auto otočilo o 8 stupňov alebo viac menej než druhé (to otočilo o 12 alebo viac) a dostalo sa na výkon neskôr alebo naplno, **otočilo auto menej**: rada je odľahčiť alebo jemne dotknúť brzdy ľavou nohou, keď sa auto otáča, aby sa zadok otočil - s bodom ručnej brzdy druhého kola, ak ju použilo, alebo ručnou brzdou v zákrute pomalšej než 54 km/h - a mať ho namierené na výjazd pred vrcholom. Kolo, ktoré ho otočilo o 12 stupňov alebo viac nad druhé a aj tak dostalo výkon neskôr, **otočilo ho príliš**: muselo sa vyrovnať, skôr než mohol ísť výkon dolu. Obe sú príčinou zákruty pri výjazde, po chybe ovládania auta. Rada k čiare na nespevnenom povrchu hovorí to isté pre každú zákrutu.
- **Vzduch.** Let o 0,2 s alebo viac dlhší než u druhého kola, ktorý stál čas od 10 m pred odrazom po 40 m za pristátím (alebo koniec zákruty), je príčina, keď vysvetľuje 40 % alebo viac straty zákruty, a zákruta za ňou, dosiahnutá pomalšie, to hovorí. Vo vzduchu auto nemôže zatáčať, brzdiť ani poháňať. Rada drží plyn zapnutý pri odraze - „neodľahčovať plyn pri odraze“, lebo to spustí predok - a prejde hrebeň o niečo pomalšie alebo s jemným dotykom brzdy, aby auto zostalo nízko ([DirtFish: ako preskočiť rally auto](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Zložky najviac troch zákrut.** Zákrutový úsek jazdený bez toho, aby bol niekedy rovný, nie je jeden dlhý komplex: po troch zákrutách začne nový.

`src/race/rally.test.ts` drží analýzu na všetko toto na etapách jazdených jednoduchým modelom: auto otočené menej a neskoro na výkone, dlhší let, dotyky ľavou nohou, zákrutový úsek, asfalt oproti štrku.

## Dáta a čo každý zdroj umožňuje {#data-and-what-each-source-allows}

| Zdroj | Frekvencia | Kanály | Umožňuje |
|---|---|---|---|
| Súbory kôl FH Companion | ~5 m | pozícia, rýchlosť, plyn, brzda, riadenie, pozdĺžne/bočné zrýchlenie, rýchlostný stupeň | všetko okrem ovládania auta, ktoré potrebuje telemetriu vedľa nich |
| `.tele.gz` FH Companion, vedľa každého súboru kola | 64 Hz hry (záznamník, ktorý drží každý paket, zapíše asi 110 za sekundu; opakovania sa zahodia) | celý Forza Data Out: pre každé koleso prešmyk, uhol driftu, kombinovaný prešmyk, otáčanie, odpruženie, otrasy povrchu; rýchlosť v rámci auta; rýchlosť zatáčania | všetko, vrátane ovládania auta |
| Forza Data Out, zaznamenaný `heat3d_capture telemetry` | 60 Hz | všetko vyššie uvedené, plus pre každé koleso: teplota pneumatiky, prešmyk, uhol driftu, kombinovaný prešmyk, zdvih odpruženia, rýchlosť kolesa, pásy otrasov; otáčky, výkon, krútiaci moment, rýchlosť zatáčania | všetko |
| Assetto Corsa, ACC, AC EVO, AC Rally (zdieľaná pamäť, `heat3d_capture telemetry --game ...`) | 60 - 333 Hz | nadmnožina: jadro pneumatiky a vnútorná/stredná/vonkajšia teplota, tlaky, teploty bŕzd, zaťaženia kolies, záklon, prešmyk a uhol; rýchlosť v rámci auta; pôsobenie ABS a TC (ACC, EVO, AC Rally) | všetko |
| iRacing `.ibt`, čítané priamo | 60 Hz | pozícia z GPS, pedále, riadenie, g, zatáčanie, pre každé koleso teplota kostry, výchylka tlmiča, tlak, opotrebenie | všetko; ovládanie auta z uhla driftu (jeho zatáčanie voči smeru jazdy) a riadenia, bez prešmyku (nezaznamenáva sa) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | za snímok; 100 Hz | pozícia, rýchlosť vo svete a osi auta, pre každé koleso rýchlosť kontaktnej plochy a odpruženie, pedále, riadenie, stopky etapy a jej dĺžka | všetko; prešmyk a uhol driftu sa odvodia |
| Richard Burns Rally (NGP UDP) | za krok fyziky | pozícia, vlastné rýchlosti auta, pre každé koleso výchylka pružiny a sila, pedále | všetko okrem prešmyku kolies |
| BeamNG.drive (modifikácia protokolu `heat3d`) | až 100 Hz | pozícia, rýchlosť a osi vo svete, pre každé koleso rýchlosť povrchu, otáčanie, zaťaženie a kontakt so zemou | všetko; prešmyk a uhol driftu sa odvodia |
| Trackmania (plugin Openplanet) | za snímok | pozícia, predná a bočná rýchlosť, pedále (brzda zapnutá/vypnutá), riadenie, pre každé koleso koeficient prešmyku a nespevnený povrch, vo vzduchu | všetko; uhol driftu z bočnej rýchlosti |

Každý zdroj sa prevedie do jedného formátu kola, `heat3d-lap`, ktorého kanály majú kanonické názvy (`speed`, `throttle`, `tireTemp[FL]` ...). Symbol auta a grafy kreslia akékoľvek kanály, ktoré kolo má.

## Zdroje {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections: time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (delta v doméne vzdialenosti)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing sprievodca analýzou kola](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: kolá v relácii](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analýza racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: teoretické najlepšie kolo zo sektorov](https://overcut.gg/)
- [Track Titan: ako analyzovať telemetriu](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: analýza brzdenia, KPI zablokovania a stability (sep 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: na plyne (jan 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: kľúčové ukazovatele výkonu pretekárov (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Modely trenia pneumatika-vozovka a optimálny prešmyk (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: trenie pneumatika-povrch, prešmyk pri vrchole na snehu a ľade](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: súčinitele trenia pneumatík, vrchol a šmyk](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: pozdĺžne sily](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: bočné sily](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Stabilita vozidla, limity uhla driftu (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rally jazda pri vysokom bočnom šmyku (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Manévre s minimálnym časom v rally (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [Referenčná rýchlosť zatáčania ESC (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Detekcia podotáčania a preťahovania riadením proti zatáčaniu (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: uhol riadenia, Ackermann a gradient podotáčania](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: matematické kanály (Kus, kombinované g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: widget preťahovania a podotáčania](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence braking: zablokovanie na veľmi uvoľnenom povrchu](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: záznam dát z rally na štrku](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: ako používať brzdy](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: ako preskočiť rally auto](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rally jazda, základy](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: dynamika rally vozidiel, referenčné hodnoty](https://github.com/GitCrush/grenzbereich)
- [Trackmania trénér speed-driftu, plugin (konštanty)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania popis speedslide](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: koučovacie toky](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: čiara V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (výjazdová rýchlosť voči minimálnemu času)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: postup na zlepšenie času kola](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: tri typy zákrut](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: uprednostňovanie zákrut](https://driver61.com/uni/prioritising-corners/)
- [Driver61: iné zákruty, iné techniky](https://driver61.com/uni/different-corner-technique/)
- [Driver61: šesť fáz zákruty](https://driver61.com/uni/corner-phases/)
- [Driver61: priľnavosť](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (výňatok)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: čo je auto na hybnosť](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [Debata o hybnosti nad výkonom](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Matematika racing line, časť 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, časť 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD technika](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD v zákrutách](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: technika zákrut](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximálna rýchlosť v zákrute](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Globálne plánovanie trajektórie s minimálnym časom s ohľadom na krivosť a vzdialenosť](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: globálna optimalizácia trajektórie pretekov](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: koeficient rolovania](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Úvod do krúžku trenia](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Understeer, prehľad](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out, dokumentácia](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: zrýchlenie obmedzené trakciou](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: zrýchlenie obmedzené výkonom](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO shared memory](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally čítačka telemetrie](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [Čítanie iRacing IBT](https://github.com/teamjorge/ibt)
