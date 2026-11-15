---
title: "Analitika utrka: metoda"
parent: "Analiza utrke"
nav_order: 58
lang: "bs"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Analitika utrke: metoda

Ukratko:

- Krugovi se upoređuju **po rastojanju**, a ne po vremenu, pa isto mjesto na stazi ostaje poravnato.
- Svaka krivina se ocjenjuje **kao cjelina**, od jedne zone kočenja do sljedeće.
- Izgubljeno vrijeme se **dijeli** na to gdje je izgubljeno (kočenje, ulazak, izlaz, pravac) i koliko ga automobil objašnjava.
- Uzrok se **objašnjava riječima**, uz savjet.
- Za korištenje, a ne za čitanje o tome kako radi: vidi [Analiza utrke](race-analysis.md).

Ovo je metoda iza kartice **Analiza utrke**: šta se mjeri, kako odlučuje gdje je otišlo vrijeme, i kako to pretvara u savjet. To je specifikacija koju slijedi kod za analizu (`src/race/`), pa svako pravilo ovdje ima svoj dio u kodu i test koji ga provjerava.

## Šta rade profesionalni alati {#what-the-professional-tools-do}

Priznati alati se slažu oko istog jezgra, a razlikuju se uglavnom po tome koliko idu ka *uzrocima*:

- **Sve se upoređuje po rastojanju, a ne po vremenu.** Dva kruga se ponovo uzorkuju na jednu osu rastojanja; tekuća razlika u proteklom vremenu na istom rastojanju je *delta* (MoTeC je zove vremenska varijansa, drugi vremenski zaostatak ili trag delte). Njen nagib pokazuje gdje se trenutno gubi vrijeme: blag nagib je ubrzanje, otpor ili stalno prianjanje; strm je razlika u kočenju ili gasu; talasasta linija gore-dolje je razmjena između brzine na ulasku i izlaza. ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/), [vrijeme dionice](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html), [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Svaka krivina se dijeli na faze**: kočenje, ulazak, sredina, izlaz – tačka kočenja, najveće kočenje i otpuštanje, najmanja brzina i gdje se javlja, stepen prenosa, podizanje gasa, povratak na pun gas, brzina na izlazu. ([Driver61: šest faza](https://driver61.com/uni/corner-phases/), [vodič za analizu kruga u iRacingu](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-dionice po krivini i teorijski najbolji krug** sastavljen od najbržeg iz svake. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps), [Overcut](https://overcut.gg/))
- **Vožena linija se takođe upoređuje**, ali nikad sama: „linija na slici ne znači ništa dok ne znate faktore koji doprinose“ – čita se uz trag brzine i deltu. ([Track Titan: kako analizirati telemetriju](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing), [Sim Racing Telemetry: vožene linije](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Uzrok, a ne simptom.** Da li je gubitak na pravcu zaista zbog gasa, ili je loš ulazak natjerao kasan gas? Greške se rangiraju po cijeni u vremenu kruga i objašnjavaju jednostavnim jezikom. ([Track Titan: tokovi coachinga](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Šta je pošlo po zlu u prvoj verziji, i zašto je to važno {#what-went-wrong-in-the-first-version-and-why-it-matters}

Prva verzija je svaku *fazu* posebno naplaćivala i gledala samo gubitke. Krug koji je ranije kočio gubio je vrijeme u fazi kočenja, i dobijao savjet da koči kasnije – čak i kada je to ranije kočenje dovelo automobil ranije u krivinu, ranije na gas i brže iz krivine, pa je sve to vratio na pravcu. U jednom testu je krugu koji je tako vozio rečeno da „koči mnogo kasnije“, dok je drugi krug – koji je kočio kasnije – promašio tjeme, izašao preširoko i izgubio upravo ono što je dobio. Podaci o vremenu su govorili da su dva načina vožnje izjednačena; savjet je govorio suprotno.

Ispravka je pravilo oko kojeg se slažu svi izvori iznad: **krivina se ocjenjuje kao cjelina**, od zone kočenja za nju do zone kočenja za sljedeću, jer „ponekad žrtvovanje nekoliko milisekundi na krivini može poboljšati ukupno vrijeme kruga jer omogućava brže dionice poslije“ ([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Znanje o vožnji koje pravila sadrže {#racing-knowledge-the-rules-encode}

**Brzina na izlazu važi više nego brzina na ulazu**, i više što je duži pravac koji slijedi: „vrijeme provedeno na pravcima dominira vremenom provedenim u krivinama“, a manjak brzine na izlazu nosi se do sljedeće tačke kočenja. Najbrži način kroz krivinu i pravac je često da se u krivinu uđe sporije, pa da gas dođe ranije – *sporo unutra, brzo van*. ([Race & Track Driving: redoslijed za poboljšanje vremena kruga](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/), [Driver61: određivanje prioriteta krivina](https://driver61.com/uni/prioritising-corners/)) Planer minimalnog vremena koji je nagrađen i za brzinu na izlazu pomjera tjemena kasnije i dobija *brži* krug; nagrada koja ta dva balansira vrijedi `L / v²` po jedinici brzine na izlazu za pravac dužine `L` pri brzini `v` – vrijeme koje razlika brzine košta na pravcu raste sa njegovom dužinom i opada sa kvadratom brzine ([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Krivine prema tome šta vode.** Ona koja vodi na pravac: maksimizirati brzinu na izlazu, kasno tjeme, što prije nazad na snagu. Ona na kraju pravca: maksimizirati brzinu koja se nosi u nju, kočiti što kasnije, raniji tjeme je prihvatljiv. Ona između krivina: kompromis za onu koja je važna poslije nje. Krivina koja može biti bilo koja tretira se kao ona koja vodi na pravac. Brže krivine imaju veću težinu: pri brzini automobil slabo ubrzava, a izgubljeni km/h se ne vraća. ([Allen Berg: tri tipa krivina](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/), [Driver61: određivanje prioriteta krivina](https://driver61.com/uni/prioritising-corners/), [Driver61: različite krivine, različite tehnike](https://driver61.com/uni/different-corner-technique/))

**Krug trenja.** Guma ima jedan budžet prianjanja, koji se troši na kočenje, skretanje i ubrzanje u bilo kojoj mješavini; ukupno ubrzanje je `sqrt(bočno² + uzdužno²)`. Kočenje u krivini ide po njegovom rubu: kočnica se otpušta dok se volan okreće i dok bočno opterećenje raste. ([krug trenja](https://www.yourdatadriven.com/friction-circle-introduction/), [g-g dijagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Kotrljanje** – ni jedna pedala pritisnuta – je najsporiji način da se izgubi brzina, i zasebna mjerljiva ključna metrika. ([Racecar Engineering / OptimumG: koeficijent kotrljanja](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Klizanje.** Uzdužna sila dostiže vrh pri odnosu klizanja od oko 10-20%, pa opada; poslije toga točak blokira pri kočenju ili proklizava pod snagom. Forza prijavljuje klizanje normalizovano: 0 je puno prianjanje, a veličina iznad 1 je izgubljeno prianjanje. ([uzdužno klizanje](https://www.sciencedirect.com/topics/engineering/longitudinal-slip), [Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Podupravljanje i nadupravljanje.** Ugao klizanja prednje osovine veći od zadnje je podupravljanje; zadnji veći od prednjeg je nadupravljanje. Bez uglova klizanja: automobil skreće manje nego što volan traži (volan iznad Ackermannovog ugla `L/R` koji automobil treba pri maloj brzini). ([podupravljanje, pregled](https://www.sciencedirect.com/topics/engineering/understeer), [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Geometrija linije {#the-geometry-of-a-line}

Brzina koju automobil može održati na radijusu `R` je `v = sqrt(a R)`, gdje je `a` bočno ubrzanje koje daju njegove gume (plus ono što donosi aerodinamički pritisak, koji raste sa `v²`). Dakle **brzina raste sa kvadratnim korijenom radijusa**: linija kroz sredinu na radijusu 20% većem je tamo oko 10% brža. ([maksimalna brzina u krivini](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html), [formula1-dictionary: krivine](https://www.formula1-dictionary.net/cornering_tech.html))

**Geometrijska linija** je najveći luk kroz krivinu: od spoljne ivice, dodiruje unutrašnjost u tjemenu, pa nazad do spoljne ivice. Za krivinu koja skreće za `θ` na putu širine `w` (umanjenoj za širinu automobila), luk tangentan na obje spoljne ivice i dodiruje unutrašnji ugao ima `R = w / (1 - cos(θ/2))` (plus sopstveni radijus unutrašnje ivice) – za pravi ugao oko `3,4 w`, za serpentinu `w`. Zato je korištenje širine najvažnije u srednjim krivinama, a najmanje u serpentinama. ([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**Kasno tjeme** se skreće kasnije i dublje, u početku na užem radijusu, i širi radijus na izlazu: sporije kroz sredinu, ranije na pravcu, ranije na punom gasu – „malo niža najmanja brzina, ali jači profil ubrzanja na izlazu“. **Rano tjeme** je obrnuto: brže unutra, a radijus se sužava na izlazu i zadržava gas – uglavnom greška, osim na vrlo maloj prionljivosti, gdje brzina izgubljena na ulazu ne može da se nadoknadi na izlazu. ([Racing line](https://en.wikipedia.org/wiki/Racing_line), [rječnik telemetrije](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/), [matematika linije](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**„V“ i „U“.** U je klasična okrugla linija: najširi radijus, najmanje promjene volana. V skreće ranije, ide dublje, brzo okreće automobil u sredini i priprema izlaz za ravniji prolaz: kočenje ostaje pravo (pa može biti kasnije), najmanja brzina je niža ali se postiže kasnije, pun gas dolazi mnogo ranije. ([Track Titan: V-linija](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Zakrivljenost naspram rastojanja.** Najbrža linija je kompromis između najkraćeg puta i one sa najmanje zakrivljenosti; na širini staze zakrivljenost važi više, a linija sa najmanjom zakrivljenošću se približava liniji najmanjeg vremena svuda gdje je automobil na granici – odvaja se od nje tamo gdje bi automobil mogao da ubrzava. ([Globalno planiranje trajektorije minimalnog vremena](https://www.nature.com/articles/s41598-025-21211-2), [TUM globalna optimizacija trke](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Krivine jedna za drugom** – dvostruko tjeme, šikana – su jedan problem: izlazna linija jedne je ulazna linija sljedeće, i obrađuju se unazad od one koja vodi na pravac. ([Driver61: različite krivine, različite tehnike](https://driver61.com/uni/different-corner-technique/))

## Koja linija odgovara kojem automobilu {#which-line-suits-which-car}

Odlučuje **snaga naspram prianjanja** automobila pri brzinama te krivine – „zamah je prianjanje naspram snage, stvar odnosa“. ([Ross Bentley: zamah automobili](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/), [zamah nad konjskim snagama](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Automobil, na ovoj krivini | Linija | Zašto |
|---|---|---|
| Jako ubrzava za svoje prianjanje („gas i pucanj“) | V: kočiti pravo i kasno, zarotirati u kratkoj uskoj sredini, pravac i pun gas rano | vrijeme se dobija punim gasom, a ne najmanjom brzinom |
| Slabo ubrzava za svoje prianjanje („zamah“) | širok U, malo kasno tjeme, održati najmanju brzinu | ne može da vrati brzinu koju je izgubio |
| Između | sporo unutra, brzo van: U sa kasnim tjemenom | klasičan kompromis |
| Brza krivina, a više sa aerodinamičkim pritiskom | U, blizu geometrijske linije | ubrzanje je slabo pri brzini; prianjanje od pritiska raste sa `v²`, pa brzina kroz sredinu vrijedi dvostruko |
| Vrlo malo prianjanje (mokro, snijeg) | raniji tjeme | brzina izgubljena na ulazu ne može da se nadoknadi na izlazu |
| Snaga daleko veća od prianjanja | linija manje važi | vuča, a ne linija, ograničava izlaz |

„Što je krivina brža, to je bliže geometrijskoj liniji; što je sporija, više je mijenjate kasnijim tjemenom.“ ([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html), [matematika linije](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/), [Track Titan: V-linija](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide), [Driver61: prianjanje](https://driver61.com/uni/grip/))

Pogon više mijenja način na koji se linija vozi nego samu liniju: automobil sa pogonom na prednje točkove se zarotira kočnicama (trail braking) i dobija snagu tek kako se točak odmotava, inače „plovi“ preširoko; snažan automobil sa pogonom na zadnje točkove mora biti ravan prije punog gasa, inače zadnji kraj iskoči; pogon na sva četiri točka može primiti snagu dok se još skreće, pa gas dodaje ranije. ([FWD tehnika](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/), [RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/), [AWD vs RWD u krivinama](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Pregled mjeri odnos snage i prianjanja automobila u svakoj krivini iz njegove vlastite vožnje – ubrzanje na punom gasu pri brzini izlaza podijeljeno sa bočnim prianjanjem pri najmanjoj brzini – i zove ga „gas i pucanj“ pri 0,45 i više, „zamah“ pri 0,25 i manje. Automobil čije prianjanje pri 150-250 km/h je više od 15% iznad njegovog prianjanja pri 55-110 km/h ima aerodinamički pritisak u radu.

## Metoda {#the-method}

Brojevi ispod su obrazloženje. Pragovi koje kod koristi su zabilježeni na po jednoj stranici, a te stranice su referenca kada se broj ovdje razlikuje: [Analiza krivina po krivini](race-corner-analysis.md), [Događaji kontrole automobila](race-control-events.md), [Profili automobila i poređenje](race-car-profiles.md) i [Statistika staze](race-course-statistics.md).

### 1. Jedna osa rastojanja {#one-distance-axis}

Najbrži krug je referenca, osim ako korisnik ne izabere drugi. Njen vozeni put je osa: uzorci svakog drugog kruga se projektuju na nju, pa svaki uzorak dobija rastojanje duž reference `s` i označeni bočni pomak `d`. Projekcija traži unaprijed samo od prethodnog poklapanja, pa krug koji se vraća preko samog sebe nikad ne skoči na pogrešnu stranu mosta. Krugovi se zatim ponovo uzorkuju na jednu mrežu, svakih 2 m, za svaki kanal. Svaki krug se nosi posljednjih nekoliko metara brzinom koju je imao, pa je njegova delta na liniji njegova razlika vremena kruga.

### 2. Krivine, i udio svake krivine u krugu {#corners-and-each-corners-share-of-the-lap}

Kako se nalaze krivine, dionice i kompleksi: [Analiza krivina po krivini](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Vremenski račun krivine {#the-time-account-of-a-corner}

Neto, podjela, brzina na izlazu i potisak automobila: [Analiza krivina po krivini](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Ocjena i uzrok {#the-verdict-and-the-cause}

Obrasci ocjene i uzroci na ulazu i izlazu: [Analiza krivina po krivini](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Automobil naspram vozača {#the-car-against-the-driver}

Kada su krugovi u različitim automobilima, gubitak koji objašnjava automobil se izdvaja, po dijelovima:

- **potisak**: automobili iz iste brzine niz pravac, kao gore;
- **prianjanje**: od nižeg minimuma brzine koji nije objašnjen užim radijusom, udio `½ ln(prianjanje_drugog / prianjanje_moje) / ln(brzina_drugog / brzina_moje)`, kada je krug bio na granici svog automobila (90% onoga što je pokazao pri toj brzini);
- **kočnice**: od `u` do `v` pri usporenju `a1` naspram `a2`, završavajući na istoj tački, košta `(1/a1 - 1/a2)(u - v)² / 2u` – samo kada je krug kočio otprilike koliko jako može njegov automobil kroz zonu u prosjeku, a ne samo u vrhu.

Šta automobil može da radi dolazi iz svakog učitanog kruga u kojem je vožen: bočno prianjanje, kočenje i ubrzanje na punom gasu po binu brzine od 5 m/s (95., 95. i 90. percentil). Prianjanje je ono što je automobil **držao pola sekunde** – bočno ubrzanje osrednjeno preko 0,5 s – a ne ono čega se jedan uzorak dotakao: ivičnjak, povratak klizanja, uhvaćen automobil svi za trenutak naprave skok, a automobil koji to često radi izgleda kao da ima više prianjanja nego što ima. (Provjereno na snimljenim krugovima dva različita automobila: mjera po uzorku ih je stavila blizu; držana pola sekunde, razdvaja ih onako kako to rade njihova vremena krugova.) Kočenje i potisak uzimaju svaki uzorak kao medijanu njega i njegovih susjeda. Vazduh, slijeganje poslije slijetanja i svaki udarac (dio 6) dok se automobil ne oporavi se izostavljaju.

**Kakav je koji automobil** (`profile.ts`): iz istih krugova:

- **držano prianjanje**: 95. percentil tog pola-sekundnog bočnog ubrzanja;
- **potisak** na punom gasu do 50 km/h, 50-120, 120-200 i iznad 200, i najviše što je pokazao;
- **kočenje** od 60 do 160 km/h;
- **najveća brzina**: gdje je prestao da dobija na punom gasu tokom jedne sekunde na pravcu – vožen ravno, a ne duga krivina uzeta ravno, gdje automobil gubi brzinu pri bilo kojoj snazi. Gdje nijedan pravac nije bio dovoljno dug, ono što je još vukao pri najvećoj brzini pokazuje koliko je bio daleko. Nema nagađanja izvan onoga što krugovi pokazuju: prilagođavanje snage naspram brzine sa otporom vazduha stavilo je automobil za cestu 100 km/h iznad njegove stvarne najveće brzine, jer prenos i ograničavač prekidaju potisak automobila mnogo prije nego što to učini otpor;
- **gubitak zadnjeg kraja**: koliko je puta u krugu klizao preko 10° skretanja (20° na rastresitoj podlozi) sa točkom okrenutim suprotno od krivine – uhvaćen suprotnim volanom – koliko je od toga počelo na gasu, i pri kom udjelu svog prianjanja su počeli. Automobil koji se namjerno malo vozi postrance ništa ne gubi; onaj kojeg treba uhvatiti, gubi. Računa se isto za svaki automobil, pa se dva automobila mogu porediti;
- **ravnoteža**, gdje krugovi nose uglove klizanja: prednji naspram zadnjeg na granici.

**Upoređeni automobili** stavlja automobile jedan pored drugog – tabelu, rečenicu za svaki o tome šta je automobil u odnosu na drugi („X bolje ubrzava, ali ne može tako tvrdo da skrene, treba mu duže da stane i lakše gubi zadnji kraj“), svaku razliku koja je jasna (4% prianjanja, 5% potiska ili kočenja, 4 km/h najveće brzine, zadnji kraj uhvaćen najmanje jednom više po krugu i upola češće), i kako se vozi svaki. Sa jednim automobilom kaže šta je taj automobil.

**U svakoj krivini**, kada su krugovi u različitim automobilima, nalaz kaže šta od toga odlučuju automobili, i kako iskoristiti najviše od ovog: 

- **kroz sredinu**: na liniji drugog automobila, prianjanje ovog automobila dozvoljava `v_drugi · √(prianjanje_moje / prianjanje_drugog)`. Ako je krug to nosio, razlika je automobil, i nijedna tačka kočenja to ne mijenja – kaže se, a krivina se pripisuje automobilu, a ne vozaču; ako je nosio manje, ostatak se može dobiti, i kaže se koliko. Zatim gdje se vrijeme može dobiti umjesto toga: na pravac, ili u automobilu koji jače vuče, poslije tjemena – kočiti pravo, uvesti kasnije, rano usmjeriti ka izlazu; inače, najširi radijus koji put dozvoljava, jer veći radijus je jedini način za više brzine bez više prianjanja;
- **zadnji kraj koji je popustio** ovdje, u automobilu koji ga lakše gubi od drugog: šta raditi u ovom automobilu – gas dodavan kako se volan odmotava, ili kočnica otpuštena nježno bez otpuštanja usred krivine, prema tome kako počinju njegova klizanja;
- **pravac poslije**: šta je jači potisak drugog automobila od iste brzine oduzeo, i gdje je ovaj automobil ostao bez potiska na njemu;
- **raniju tačku kočenja** u automobilu koji ne koči tako tvrdo.

Krug koji je kližao kroz sredinu krivine (preko 10° skretanja na asfaltu) bio je preko svog prianjanja, a ne ispod njega: nikad mu se ne kaže da je tu imao prianjanja na raspolaganju. A ako je zadnji kraj automobila popustio u ovom krugu pri manjem bočnom ubrzanju nego što je krivina tražila, „prianjanje na raspolaganju“ kaže da ga treba tražiti u malim koracima.

### 6. Kontrola automobila: blokade, proklizavanja, klizanja i guranja, udarci i sudari {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Svaki krug se takođe čita po tome kako je automobil vožen – gdje je točak blokirao, gdje su pogonski točkovi proklizali, gdje je zadnji kraj iskočio, gdje je prednji plovio preširoko – jer su to greške koje vrijeme samo po sebi ne imenuje. Tri stvari to drže ispravnim preko igara i podloga.

**Gdje prianjanje prestaje mjeri se iz vlastite vožnje automobila.** Inženjeri postavljaju prag blokade po automobilu na klizanje koje je dalo najviše usporenja (MoTeC kanali u OptimumG-ovoj seriji o kočenju koriste -0,07 za jedan automobil), a ne knjižnu vrijednost, a knjižne vrijednosti se ionako razlikuju: sila dostiže vrh pri 5-20% klizanja na asfaltu zavisno od gume i modela, pri 6% ili 20-60% na snijegu zavisno od izvora, a nijedan izvor ne daje jednu za šljunak. Igre dodatno drugačije skaliraju klizanje: Forzino je „normalizovano“ tako da iza 1 nastaje gubitak prianjanja – pa ipak, kočnice automobila mogu dati najbolje rezultate daleko ispod ili daleko iznad 1, a obični zoni kočenja mogu preći 1. Zato se za svaki automobil, preko svakog učitanog kruga, sila koju je proizveo grupiše prema klizanju kojim je vožen – usporenje naspram klizanja odnosa točkova pri kočenju pravo naprijed, ubrzanje (kao udio onoga što automobil daje pri toj brzini) naspram klizanja pogonskih točkova, bočno prianjanje (kao udio prianjanja automobila pri toj brzini) naspram ugla klizanja svake osovine – a granica je klizanje iza najboljeg mjesta gdje je sila pala za 8%. Kriva koja u podacima nikad ne opada – Forza Horizon-ovo bočno prianjanje i vuča – nema granicu, a samo klizanje tu ništa ne označava. Sa premalo podataka, granica je jedan i pola puta nominalni vrh.

**Teren je poznat po uzorku**, gdje igra to kaže: Forza tutnji gume na šljunku, blatu i travi (malo uzoraka na asfaltnoj stazi, mnogo na blatu i vanjskim stazama), Trackmania imenuje materijal ispod svakog točka, a teren etape relija se nalazi kako kaže dio 11. Krive, navike klizanja i pragovi su odvojeni za asfalt i rastresitu podlogu.

**Svaki događaj se stavlja naspram drugog kruga preko istih metara.** Na šljunku, na snijegu, u arkadnoj trci punoj klizanja, klizanje je način na koji se krivina vozi: studije optimalnog upravljanja nalaze rješenja „niskog klizanja“ na asfaltu i „agresivna, visokog klizanja, čak i protivupravljanje“ van puta, podaci sa relija pokazuju gume „daleko unutar nelinearne oblasti“, a blokiranje točka na vrlo rastresitoj podlozi može čak zaustaviti automobil brže. Zato događaj koji je napravio i drugi krug – 80% ili više – jeste način na koji se krivina vozi, a ne greška, a onaj koji nije napravio jeste greška samo ako je koštao vremena: izgubljeno vrijeme od neposredno prije njega do 40 m poslije. Greška koja objašnjava 40% ili više gubitka krivine postaje uzrok te krivine.

Pragovi otkrivanja, test drugog kruga, udarci i sudari, i tekstovi savjeta: [Događaji kontrole automobila](race-control-events.md).

### 6b. Mnogo krugova: statistika staze {#b-many-laps-the-courses-statistics}

Poređenje klasa, šta se računa kao greška, statistika i mapa grešaka: [Statistika staze](race-course-statistics.md).

### 7. Vožena linija {#the-driven-line}

Za svaki krug i krivinu, iz samih pozicija: gdje je počeo da skreće (petina njegove najveće zakrivljenosti), njegov najuži radijus (preko ±8 m), prosječni radijus preko prve i druge polovine promjene pravca, i tako dalje

- **oblik**: najuži kroz prosječni radijus ispod 0,55 je V, iznad 0,75 je U;
- **tjeme**: radijus izlaza kroz radijus ulaza iznad 1,25 je kasno, ispod 0,8 rano;
- **tjeme brzine**: najsporija tačka više od 15 m prije polovine skretanja je sporo unutra, brzo van; više od 15 m poslije, još usporava pored sredine.

Naspram drugog kruga: koliko je unutra ili vani vozio na ulazu, kroz najuži dio i tamo gdje su oba bila bez gasa, i gdje je svaki ušao u krivinu. Svaki nalaz se završava linijom koja odgovara automobilu tog kruga na toj krivini – prema tome na šta krivina vodi i izmjerenom odnosu snage i prianjanja, pritisku i pogonu – i da li ju je krug vozio tako. Tabela „Krivina po krivini“ navodi najbrži krug kroz svaku krivinu sa oblikom njegove linije, i najbolje krivine spojene zajedno.

### 8. Dvije mape {#two-maps}

- **Gdje**: staza obojena sa `dΔt/ds` naspram reference, crveno gdje se gubi vrijeme, zeleno gdje se dobija.
- **Zašto**: svaki gubitak nacrtan tamo gdje je njegov uzrok, obojen grupom uzroka – kočenje, ulazak, izlaz, pravac, automobil – i širi za skuplji.

### 9. Reprodukcija {#replay}

Jedan sat, tri načina da se pretvori u vrijeme svakog kruga: od starta, poravnato (svaki krug stigne do jedne tačke staze u isto vrijeme, pa se pusti) i jedan uz drugi (svaki krug zadržan na rastojanju reference).

### 10. Na koju stranu je svijet okrenut {#which-way-round-the-world-is}

Svijet u pregledu je desnoruk sa Y prema gore. Igra sa lijevoruk svijet (među njima Forza) u njemu se prikazuje ogledalski: svaka desna krivina nacrtana kao lijeva, i staza i krugovi. Krugovi sami to kažu – pozitivan volan je desno u svakom adapteru, a spoljašnje vješanje u krivini se sabija – pa kartica za utrku nudi da to popravi, a **Kamera i scena → Obrni osu svijeta** to radi: X, Y ili Z nacrtano obrnuto. Mijenja se samo crtanje – refleksija složena u matricu pogleda; kamera leti u nacrtanom svijetu, a podaci, analiza i svaka koordinata koju alati prikazuju ostaju igrini sopstveni. Analiza imenuje krivine lijevo ili desno istim mjerenjem.

### 11. Reli: klizanje, lijeva noga, vazduh {#rally-the-slide-the-left-foot-the-air}

Etapa relija nije staza vožena sa lošijim prianjanjem. Na šljunku i snijegu klizanje je način na koji se krivina uzima: automobil se okreće na ulazu pomjeranjem težine – „kočnice pomjeraju težinu automobila naprijed ... prednje gume dobijaju prianjanje, zadnje ga gube, i automobil se rotira klizeći u krivinu“, pa nazad na gas kada je „poravnat u smjeru kojim želite da idete“ ([DirtFish: kako koristiti kočnice](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Lijeva noga koči da se gas i kočnica mogu igrati jedno protiv drugog, ručna kočnica okreće automobil u uskim krivinama ([RallySport Ontario: vožnja relija, osnove](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), a automobil se odvaja od tla. Dio 6 već čita klizanja naspram drugog kruga; ova pravila nose ostatak.

- **Teren.** Šta kaže krug (`meta.surface`, `--surface` relijskih snimača), zatim naziv događaja – asfaltni relije (Španija, Hrvatska, Centralna Evropa, Njemačka, Japan, Korzika, Ypres), zimski (snijeg), asfalt sa snijegom i ledom na Montea (mješovito) – zatim kako je automobil vožen. Granica bočne sile Rally2 automobila je 0,7-0,9 g na šljunku i 1,3-1,4 g na asfaltu ([grenzbereich, referentne vrijednosti](https://github.com/GitCrush/grenzbereich)), a na šljunku ide daleko više driftovanja (dio 6). Zato etapa gdje je automobil imao 10 m/s² ili više ubrzanja u krivini (95. percentil, pri brzini, na terenu), sa medijanom driftovanja ispod 6 stepeni gdje god je skretao unutar 70% toga, je asfalt; sve ostalo, ili premalo da se kaže, je rastresita podloga.
- **Šta automobil može, na terenu na kojem je to radio.** Prianjanje, kočenje i potisak (dio 5) mjere se odvojeno za asfalt i rastresitu podlogu kada su krugovi vozili petinu ili više svojih uzoraka na svakoj, a svaka krivina se ocjenjuje sa terenom ispod automobila u njegovoj najsporijoj tački. Uzorci u vazduhu i 0,3 s poslije slijetanja izostavljaju se iz svega što mjeri automobil – ovojnice, krive guma, blokade i proklizavanja: slijetanje trese automobil preko onoga što gume mogu, a točkovi koji se okreću u vazduhu nisu proklizavanje. Aerodinamički pritisak se ne ocjenjuje na rastresitoj podlozi, gdje su brze i spore dionice etape različiti putevi.
- **Lagan dodir lijeve noge nije kočenje.** Dodir kočnice sa gasom još na polovini ili više, preko manje od 15 m, smiri automobil ili ga okrene; gdje je krug počeo da koči za krivinu je prva kočnica pri kojoj je gas bio otpušten, ili ona koja je trajala duže.
- **Automobil okrenut na ulazu.** Za svaki krug i krivinu, najveći ugao klizanja od njegovog kočenja do 5 m poslije njegove najsporije tačke. Na rastresitoj podlozi, krug koji je imao automobil okrenut za 8 stepeni ili više manje od drugog (koji ga je okrenuo za 12 ili više) i dobio gas ili bez gasa kasnije **je okrenuo automobil manje**: savjet je otpustiti gas ili lagano dodirnuti lijevu nogu na kočnici dok ulazi u krivinu, da se zadnji kraj zaokrene – sa tačkom ručne kočnice drugog kruga kada ju je koristio, ili ručnom kočnicom u krivini sporijoj od 54 km/h – i da bude usmjeren ka izlazu prije tjemena. Onaj koji ga je okrenuo za 12 stepeni ili više više od drugog, a i dalje dobio gas kasnije **je okrenuo previše**: morao je da se ispravi prije nego što gas može da se spusti. Bilo koje od toga je uzrok krivine na izlazu, poslije greške kontrole automobila. Savjet o liniji na rastresitoj podlozi kaže isto za svaku krivinu.
- **Vazduh.** Let duži za 0,2 s ili više od drugog kruga, koji je koštao vremena od 10 m prije poletanja do 40 m poslije slijetanja (ili kraja krivine), uzrok je kada objašnjava 40% ili više gubitka krivine, a krivina poslije njega, dostignuta sporije, to kaže. U vazduhu automobil ne može da skreće, koči niti vozi. Savjet drži gas uključen pri poletanju – „ne otpuštati gas pri poletanju“, što spušta nos – i uzima greben malo sporije ili uz dodir kočnice da automobil ostane nisko ([DirtFish: kako preskočiti reli automobil](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Kompleksi od najviše tri krivine.** Vijugav dio koji se vozi bez ikakvog trenutka bez gasa nije jedan dugi kompleks: poslije tri krivine počinje novi.

`src/race/rally.test.ts` drži analizu uz sve to na etapama vožnim po jednostavnom modelu: automobil koji je okrenut manje i dobio gas kasno, duži let, dodiri lijevom nogom, vijugav dio, asfalt naspram šljunka.

## Podaci, i šta svaki izvor dozvoljava {#data-and-what-each-source-allows}

| Izvor | Brzina | Kanali | Dozvoljava |
|---|---|---|---|
| FH Companion datoteke krugova | ~5 m | pozicija, brzina, gas, kočnica, volan, bočno/uzdužno ubrzanje, prenos | sve osim kontrole automobila, koja treba telemetriju uz njih |
| FH Companion `.tele.gz`, uz svaku datoteku kruga | 64 Hz igre (snimač koji čuva svaki paket piše ~110 u sekundi; ponavljanja se odbacuju) | cijeli Forza Data Out: klizanje odnosa po točku, ugao klizanja, kombinovano klizanje, rotacija, ovjes, tutnjanje terena; brzina u okviru automobila; brzina skretanja | sve, uključujući kontrolu automobila |
| Forza Data Out, snimljen sa `heat3d_capture telemetry` | 60 Hz | sve iznad, plus po točku: temperatura gume, odnos klizanja, ugao klizanja, kombinovano klizanje, hod ovjesa, brzina točka, tutnjanje; o/min, snaga, obrtni moment, brzina skretanja | sve |
| Assetto Corsa, ACC, AC EVO, AC Rally (dijeljena memorija, `heat3d_capture telemetry --game ...`) | 60-333 Hz | nadskup: temperatura jezgra gume i unutrašnja/srednja/spoljna, pritisci, temperature kočnica, opterećenja točkova, nagib, odnos klizanja i ugao; brzina u okviru automobila; ABS i TC u radu (ACC, EVO, AC Rally) | sve |
| iRacing `.ibt`, čitan direktno | 60 Hz | pozicija iz GPS-a, pedale, volan, g, skretanje, po točku temperatura karkasa, otklon amortizera, pritisak, habanje | sve; kontrola automobila iz ugla driftovanja (njegovo skretanje naspram smjera kretanja) i volana, bez klizanja (nije zabilježeno) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | po okviru; 100 Hz | pozicija, brzina u svijetu i ose automobila, po točku brzina kontaktne površine i ovjes, pedale, volan, sat etape i dužina | sve; klizanje i ugao driftovanja izvedeni |
| Richard Burns Rally (NGP UDP) | po koraku fizike | pozicija, sopstvene brzine automobila, po točku otklon opruge i sila, pedale | sve osim klizanja točka |
| BeamNG.drive (`heat3d` protokol mod) | do 100 Hz | pozicija, brzina u svijetu i ose, po točku brzina površine, rotacija, opterećenje i kontakt sa tlom | sve; klizanje i ugao driftovanja izvedeni |
| Trackmania (Openplanet dodatak) | po okviru | pozicija, prednja i bočna brzina, pedale (kočnica uključena/isključena), volan, po točku koeficijent klizanja i rastresita podloga, u vazduhu | sve; ugao driftovanja iz bočne brzine |

Svaki izvor se pretvara u jedan format kruga, `heat3d-lap`, čiji kanali imaju kanonske nazive (`speed`, `throttle`, `tireTemp[FL]` ...). Ikona automobila i grafikoni crtaju koje god kanale krug ima.

## Izvori {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Ubrzavanje dionica: oblici vremenske varijanse](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (delta u domenu rastojanja)](https://github.com/taishiliu25/lap-delta-analyzer)
- [Vodič za analizu kruga u iRacingu](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: krugovi sesije](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analiza vozenih linija](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: teorijski najbolji iz dionica](https://overcut.gg/)
- [Track Titan: kako analizirati telemetriju](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: KPI-ovi kočenja, blokade i stabilnosti (sep 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: na gasu (jan 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: ključni pokazatelji performansi vozača trke (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Modeli trenja guma i optimalno klizanje (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: trenje guma i asfalta, klizanje pri vrhu na snijegu i ledu](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: koeficijenti trenja guma, vrh i klizanje](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: uzdužne sile](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: bočne sile](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Stabilnost vozila, granice klizanja karoserije (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Vožnja relija pri velikom bočnom klizanju (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Manevri relija minimalnog vremena (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC referentna brzina skretanja (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Otkrivanje podupravljanja i nadupravljanja upravljanjem protiv skretanja (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: ugao volana, Ackermann i gradijent podupravljanja](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: matematički kanali (Kus, kombinovani g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: widget za nadupravljanje i podupravljanje](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Kadentno kočenje: blokiranje na vrlo rastresitim površinama](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: snimanje podataka na šljunčanom reliju](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: kako koristiti kočnice](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: kako preskočiti reli automobil](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: vožnja relija, osnove](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: dinamika reli vozila, referentne vrijednosti](https://github.com/GitCrush/grenzbereich)
- [Trackmania dodatak za trening brzog driftovanja (konstante)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania opis brzog klizanja](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: tokovi coachinga](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: V-linija](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (brzina na izlazu naspram minimalnog vremena)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: redoslijed za poboljšanje vremena kruga](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: tri tipa krivina](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: određivanje prioriteta krivina](https://driver61.com/uni/prioritising-corners/)
- [Driver61: različite krivine, različite tehnike](https://driver61.com/uni/different-corner-technique/)
- [Driver61: šest faza krivine](https://driver61.com/uni/corner-phases/)
- [Driver61: prianjanje](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (izvod)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: šta je zamah automobil](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [Debata o zamahu nad konjskim snagama](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Matematika racing linije, dio 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, dio 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD tehnika](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD u krivinama](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: tehnika krivina](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maksimalna brzina u krivini](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Rječnik telemetrije trke](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Globalno planiranje trajektorije minimalnog vremena uz zakrivljenost i rastojanje](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: globalna optimizacija trke trajektorije](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: koeficijent kotrljanja](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Uvod u krug trenja](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g dijagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Uzdužno klizanje](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Podupravljanje, pregled](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out dokumentacija](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: ubrzanje ograničeno vučom](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: ubrzanje ograničeno snagom](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO dijeljena memorija](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally čitač telemetrije](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT parsiranje](https://github.com/teamjorge/ibt)
