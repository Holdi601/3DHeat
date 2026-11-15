---
title: "Analitika utrka: metoda"
parent: "Analiza utrke"
nav_order: 58
lang: "hr"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Analitika utrke: metoda

Ukratko:

- Krugovi se uspoređuju **po udaljenosti**, a ne po vremenu, pa se isto mjesto na stazi poklapa.
- Svaki zavoj se ocjenjuje **cjelovito**, od jedne zone kočenja do sljedeće.
- Izgubljeno vrijeme se **raščlanjuje** na to gdje je izgubljeno (kočenje, ulazak, izlazak, ravnina) i koliki dio gubitka automobil objašnjava.
- Uzrok se **objašnjava riječima**, uz savjet.
- Za korištenje, a ne za čitanje o tome kako radi: vidi [Analiza utrke](race-analysis.md).

Ovo je metoda iza kartice **Analiza utrke**: što mjeri, kako odlučuje gdje je otišlo vrijeme i kako to pretvara u savjet. To je specifikacija koju slijedi kod za analizu (`src/race/`), pa svako pravilo ovdje ima svoj pandan u kodu i test koji ga potvrđuje.

## Što rade profesionalni alati {#what-the-professional-tools-do}

Ustaljeni alati se slažu oko iste osnove, a razlikuju se uglavnom po tome koliko daleko idu prema *uzrocima*:

- **Sve se uspoređuje po udaljenosti, a ne po vremenu.** Dva kruga se prilagođavaju na zajedničku os udaljenosti; trenutna razlika proteklog vremena na istoj udaljenosti je *delta* (MoTeC je zove vremenska varijacija, drugi vremenski zaostatak ili trag delte). Njezin nagib pokazuje gdje se upravo gubi vrijeme: plitak nagib znači ubrzanje, otpor ili stalnu prionljivost; strm nagib razliku u kočenju ili gasu; valovita krivulja gore-dolje zamjenu između brzine ulaska i izlaska.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [analiza vremena dionice](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Svaki zavoj se dijeli na faze**: kočenje, ulazak, sredina, izlazak - točka kočenja, najveći pritisak kočnice i otpuštanje, najmanja brzina i gdje se ona postiže, mjenjač, početak dodavanja gasa, povratak na pun gas, brzina na izlasku.
  ([Driver61: šest faza](https://driver61.com/uni/corner-phases/),
  [iRacing vodič za analizu kruga](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-sektori po zavoju i teorijski najbolji krug** sastavljen od najbržih dijelova svakog sektora.
  ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Vožena linija se također uspoređuje**, ali nikad sama: „linija na slici ne znači ništa dok ne znate čimbenike koji doprinose” - čita se uz trag brzine i deltu.
  ([Track Titan: kako analizirati telemetriju](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: linije vožnje](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Uzrok, a ne simptom.** Je li gubitak na ravnini zaista gas, ili je loš ulazak prisilio kasni gas? Greške se rangiraju po cijeni u vremenu kruga i objašnjavaju jednostavnim jezikom.
  ([Track Titan tijekovi treniranja](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Što je pošlo po zlu u prvoj verziji i zašto je to važno {#what-went-wrong-in-the-first-version-and-why-it-matters}

Prva verzija je svaku *fazu* naplaćivala zasebno i gledala samo gubitke. Krug koji je ranije kočio gubio je vrijeme u fazi kočenja i dobivao savjet da koči kasnije - čak i kad je to ranije kočenje automobil ranije okrenulo, ranije ga vratilo na snagu i izvelo iz zavoja brže, pa je sve to nadoknadio na ravnini. U jednom testu je takvom krugu rekla da „koči mnogo kasnije”, iako je drugi krug - koji je zaista kočio kasnije - promašio točku apeksa, izašao šire i izgubio upravo ono što je dobio. Podaci o vremenu su pokazivali da su dva puta izjednačena; savjet je tvrdio suprotno.

Popravak je pravilo na kojem se slažu svi gore navedeni izvori: **zavoj se ocjenjuje cjelovito**, od zone kočenja za njega do zone kočenja za sljedeći, jer „ponekad žrtvovanje nekoliko milisekundi na zavoju može poboljšati ukupno vrijeme kruga jer omogućuje brže dionice poslije”
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Vozačka znanja koja pravila sadrže {#racing-knowledge-the-rules-encode}

**Brzina na izlasku važnija je od brzine na ulasku**, a sve više što je duža sljedeća ravnina: „vrijeme provedeno na ravninama nadjačava vrijeme provedeno u zavojima”, a manjak brzine na izlasku nosi se do sljedeće točke kočenja. Najbrži put kroz zavoj i ravninu često je ući u zavoj sporije, kako bi se gas ranije dodao - *sporo unutra, brzo van*.
([Race & Track Driving: redoslijed za poboljšanje vremena kruga](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: određivanje prioriteta zavoja](https://driver61.com/uni/prioritising-corners/))
Planer najkraćeg vremena koji je također nagrađen za brzinu na izlasku pomiče svoje apekse kasnije i dobiva *brži* krug; nagrada koja ta dva uravnotežuje vrijedi `L / v²` po jedinici brzine na izlasku za ravninu duljine `L` pri brzini `v` - vrijeme koje razlika u brzini košta na ravnini raste s duljinom i pada s kvadratom brzine
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Zavoji prema tome kamo vode.** Onaj koji vodi na ravninu: maksimizirati brzinu na izlasku, kasni apeks, što ranije natrag na snagu. Onaj na kraju ravnine: maksimizirati brzinu koja se nosi u nju, kočiti što kasnije, raniji apeks je prihvatljiv. Onaj između dva zavoja: kompromis zbog onoga koji je poslije važniji. Zavoj koji može biti i jedno i drugo tretira se kao onaj koji vodi na ravninu. Brži zavoji nose više težine: pri velikoj brzini automobil slabo ubrzava, a izgubljeni km/h se ne nadoknađuje lako.
([Allen Berg: tri vrste zavoja](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: određivanje prioriteta zavoja](https://driver61.com/uni/prioritising-corners/),
[Driver61: različiti zavoji, različite tehnike](https://driver61.com/uni/different-corner-technique/))

**Krug prionljivosti.** Guma ima jedan proračun prionljivosti, potrošen na kočenje, zaokret i ubrzanje u bilo kojoj mješavini; ukupno ubrzanje je `sqrt(lat² + long²)`. Kočenje u zaokretu prati rub tog kruga: kočnica se otpušta dok se upravljanje i bočno opterećenje grade.
([krug prionljivosti](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g dijagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Kotrljanje** - ni jedno pedalu pritisnuto - najsporiji je način gubljenja brzine i zasebno mjerljiv pokazatelj učinka.
([Racecar Engineering / OptimumG: faktor kotrljanja](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Klizanje.** Uzdužna sila dostiže vrhunac pri omjeru klizanja od oko 10-20%, pa pada; iza toga kotač se blokira pod kočenjem ili proklizava pod snagom. Forza prijavljuje klizanje normalizirano: 0 je puna prionljivost, veća vrijednost od 1 znači izgubljenu prionljivost.
([uzdužno klizanje](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Podupravljivost i nadupravljivost.** Kad je kut klizanja prednjih kotača veći od stražnjih, to je podupravljivost; kad je stražnjih veći od prednjih, nadupravljivost. Bez kutova klizanja: automobil se okreće manje nego što upravljanje traži (upravljanje iznad Ackermannova kuta `L/R` koji automobil treba pri maloj brzini).
([podupravljivost, pregled](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Geometrija linije {#the-geometry-of-a-line}

Brzina koju automobil može držati na polumjeru `R` je `v = sqrt(a R)`, gdje je `a` bočno ubrzanje koje daju njegove gume (uz to što doda aerodinamička sila prižimanja, koja raste s `v²`). Dakle **brzina raste s korijenom polumjera**: linija kroz sredinu na polumjeru koji je 20% veći tamo je oko 10% brža.
([najveća brzina u zavoju](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: zaokret](https://www.formula1-dictionary.net/cornering_tech.html))

**Geometrijska linija** je najveći luk kroz zavoj: od vanjskog ruba, dodiruje unutarnji u apeksu, pa natrag na vanjski. Za zavoj koji skreće za `θ` na cesti širine `w` (umanjenoj za širinu automobila), luk koji tangira oba vanjska ruba i dodiruje unutarnji kut ima `R = w / (1 - cos(θ/2))` (uz polumjer samog unutarnjeg ruba) - za pravi kut oko `3,4 w`, za zavoj tipa „U” `w`. Zato korištenje širine najviše važi u srednjim zavojima, a najmanje u zavojima tipa „U”.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**Kasni apeks** ulazi kasnije i dublje, prvo na užem polumjeru, a na izlasku ga širi: kroz sredinu sporije, ranije na ravninu, ranije ravno - „malo niža najmanja brzina, ali jači profil ubrzanja na izlasku”. **Rani apeks** je obrnut: brže unutra, a polumjer se na izlasku sužava i zadržava gas - uglavnom greška, osim kod vrlo male prionljivosti, gdje se brzina izgubljena unutra ne može nadoknaditi van.
([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**„V” i „U”.** U je klasična okrugla linija: najširi polumjer, najmanja promjena upravljanja. V ulazi ranije, ide dublje, brzo okreće automobil u sredini i usmjerava izlazak za ravniji izlaz: kočenje ostaje ravno (pa može biti kasnije), najmanja brzina je niža, ali se postiže kasnije, pun gas dolazi znatno ranije.
([Track Titan: V-linija](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Zakrivljenost naspram udaljenosti.** Najbrža linija je kompromis između najkraćeg puta i najmanje zakrivljenog; na širini staze zakrivljenost je važnija, a linija najmanje zakrivljenosti približava se liniji najkraćeg vremena svuda gdje je automobil na granici - od nje se odvaja tamo gdje bi automobil mogao ubrzavati.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Zavoji jedan za drugim** - dvostruki apeks, šikana - jedan su problem: izlazna linija jednog je ulazna linija sljedećeg, a vozi se unatrag od onoga koji vodi na ravninu.
([Driver61: različiti zavoji, različite tehnike](https://driver61.com/uni/different-corner-technique/))

## Koja linija pristaje kojem automobilu {#which-line-suits-which-car}

O tome odlučuje **snaga naspram prionljivosti** automobila pri brzinama tog zavoja - „zamah je prionljivost naspram snage, stvar omjera”.
([Ross Bentley: automobili na zamah](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[zamah nad konjskim snagama](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Automobil, na tom zavoju | Linija | Zašto |
|---|---|---|
| Jako ubrzava za svoju prionljivost („point and shoot”) | V: kočiti ravno i kasno, okrenuti se u kratkoj uskoj sredini, rano ravno i pri punom gasu | vrijeme se dobiva punim gasom, a ne najmanjom brzinom |
| Slabo ubrzava za svoju prionljivost („zamah”) | širok U, malo kasniji apeks, održati najmanju brzinu što višom | ne može nadoknaditi brzinu koju troši |
| Između | sporo unutra, brzo van: U s kasnijim apeksom | klasičan kompromis |
| Brz zavoj, a više s aerodinamičkom silom prižimanja | U, blizu geometrijske linije | ubrzanje je slabo pri brzini; prionljivost od prižimanja raste s `v²`, pa brzina kroz sredinu donosi dvostruko |
| Vrlo mala prionljivost (mokro, snijeg) | raniji apeks | brzina izgubljena unutra ne može se nadoknaditi van |
| Snaga daleko veća od prionljivosti | linija manje važi | vuča, a ne linija, ograničava izlazak |

„Što je zavoj brži, to je bliže geometrijskoj liniji; što je sporiji, to ga više mijenjate kasnijim apeksom.”
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: V-linija](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: prionljivost](https://driver61.com/uni/grip/))

Pogon mijenja način na koji se linija vozi više nego sama linija: automobil s pogonom na prednje kotače se okreće kočnicom (kočenje u zavoju) i dobiva snagu tek dok se kotač odmotava, inače širi zavoj; snažan automobil s pogonom na stražnje kotače mora biti ravan prije punog gasa, inače mu stražnji dio izađe; pogon na sva četiri kotača može preuzeti snagu dok se još okreće, pa gas dodaje ranije.
([FWD tehnika](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Preglednik mjeri omjer snage i prionljivosti automobila na svakom zavoju iz vlastite vožnje - ubrzanje pri punom gasu na brzini izlaska podijeljeno s bočnom prionljivošću pri najmanjoj brzini - i naziva ga „point and shoot” pri 0,45 i više, a „zamah” pri 0,25 i manje. Automobil čija je prionljivost pri 150-250 km/h više od 15% iznad njegove prionljivosti pri 55-110 km/h ima aerodinamičku silu prižimanja na djelu.

## Metoda {#the-method}

Brojevi u nastavku su obrazloženje. Pragovi koje kod koristi zapisani su na po jednoj stranici, i te stranice su referenca kad se neki broj ovdje razlikuje: [Analiza zavoj po zavoj](race-corner-analysis.md), [Događaji kontrole automobila](race-control-events.md), [Profili automobila i usporedba](race-car-profiles.md) i [Statistika staze](race-course-statistics.md).

### 1. Jedna os udaljenosti {#one-distance-axis}

Najbrži krug je referenca, osim ako korisnik ne odabere drugi. Njegova vožena putanja je os: uzorci svakog drugog kruga projiciraju se na nju, pa svaki uzorak dobiva udaljenost duž reference `s` i predznačeni bočni pomak `d`. Projekcija traži samo unaprijed od prethodnog podudaranja, pa krug koji sam sebe presijeca nikad ne skoči na krivu stranu mosta. Krugovi se zatim preuzorkuju na jednu mrežu, svaka 2 m, za svaki kanal. Svaki krug se posljednjih nekoliko metara nosi brzinom koju je imao, pa je njegova delta na liniji jednaka razlici vremena kruga.

### 2. Zavoji i udio svakog zavoja u krugu {#corners-and-each-corners-share-of-the-lap}

Kako se pronalaze zavoji, dionice i sklopovi: [Analiza zavoj po zavoj](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Vremenski obračun zavoja {#the-time-account-of-a-corner}

Neto, raščlanjeno, brzina na izlasku i vuča automobila: [Analiza zavoj po zavoj](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Ocjena i uzrok {#the-verdict-and-the-cause}

Obrasci ocjene i uzroci na ulasku i izlasku: [Analiza zavoj po zavoj](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Automobil naspram vozača {#the-car-against-the-driver}

Kad su krugovi u različitim automobilima, gubitak koji automobil objašnjava oduzima se, po dijelovima:

- **vuča**: automobili od iste brzine niz ravninu, kao gore;
- **prionljivost**: od niže najmanje brzine koja nije objašnjena užim polumjerom, udio `½ ln(prionljivost_drugog / prionljivost_mog) / ln(v_drugog / v_mog)`, kad je krug bio na granici svog automobila (90% onoga što je pokazao pri toj brzini);
- **kočnice**: od `u` do `v` pri usporavanju `a1` naspram `a2`, s krajem u istoj točki, koštaju `(1/a1 - 1/a2)(u - v)² / 2u` - samo kad je krug kočio otprilike koliko njegov automobil može u cijeloj zoni u prosjeku, a ne samo na vrhuncu.

Što automobil može proizlazi iz svakog učitanog kruga tog automobila: bočna prionljivost, kočenje i ubrzanje pri punom gasu po pojasu brzine od 5 m/s (95., 95. i 90. percentil). Prionljivost je ono što je automobil **držao pola sekunde** - bočno ubrzanje prosječeno kroz 0,5 s - a ne ono čega se dotaknuo jedan uzorak: rubnjak, klizanje koje se vraća, automobil koji se stiže sve to na trenutak podigne, a automobil koji to radi često izgleda prionljiviji nego jest. (Provjereno na snimljenim krugovima dva različita automobila: mjera po uzorku stavila ih je blizu jedan drugome; držano pola sekunde, razdvaja ih onako kako to čine njihova vremena krugova.) Kočenje i vuča uzimaju svaki uzorak kao medijan njega samog i njegovih susjeda. Zrak, slijeganje nakon doskoka i svaki udarac (odjeljak 6) dok se automobil ne oporavi ispuštaju se.

**Kakav je koji automobil** (`profile.ts`): iz istih krugova,

- **držana prionljivost**: 95. percentil tog polusekundnog bočnog ubrzanja;
- **vuča** pri punom gasu do 50 km/h, 50-120, 120-200 i iznad 200, te najviše što je pokazao;
- **kočenje** od 60 do 160 km/h;
- **najveća brzina**: mjesto gdje je prestao dobivati brzinu pri punom gasu jednu sekundu na ravnini - vožena ravno, a ne duga krivina prijeđena ravno, gdje automobil u bilo kojoj snazi gubi brzinu. Gdje nijedna ravnina nije bila dovoljno duga, ono što je još vukao pri najvećoj brzini pokazuje koliko je bio daleko. Nema nagađanja iznad onoga što pokazuju krugovi: prilagodba snage po brzini prema otporu stavila je cestovni automobil 100 km/h iznad njegove stvarne najveće brzine, jer prijenosni odnosi i ograničavač prekidaju vuču automobila mnogo prije nego što to učini otpor;
- **gubitak stražnjeg dijela**: koliko je puta u krugu kliznuo preko 10° drifta (20° na rastresitoj podlozi) s kotačem okrenutim protiv zavoja - uhvaćen protuupravljanjem - koliko je od toga počelo na gasu i pri kojem udjelu svoje prionljivosti je počelo. Automobil koji se namjerno malo vozi postrance ništa ne gubi; onaj kojeg treba uhvatiti - gubi. Broji se isto za svaki automobil, pa se dva automobila mogu usporediti;
- **ravnoteža**, gdje krugovi nose kutove klizanja: prednji naspram stražnjeg na granici.

**Usporedba automobila** stavlja automobile jedan uz drugi - tablicu, po jednu rečenicu o tome što je automobil u odnosu na drugi („X bolje ubrzava, ali ne može skretati tako oštro, treba duže da stane i lakše gubi stražnji dio”), svaku razliku koja je jasna (4% prionljivosti, 5% vuče ili kočenja, 4 km/h najveće brzine, stražnji dio uhvaćen barem jednom po krugu više i za pola češće), te kako voziti svaki. Uz jedan automobil kaže što je taj automobil.

**U svakom zavoju**, kad su krugovi u različitim automobilima, ocjena kaže što od gubitka odlučuju automobili, i kako iskoristiti najviše od ovog:

- **kroz sredinu**: na liniji drugog automobila, prionljivost ovog automobila dopušta `v_drugi · √(prionljivost_moja / prionljivost_drugog)`. Ako je krug to držao, razlika je u automobilu i nijedna točka kočenja je ne mijenja - tako se kaže, a zavoj se pripisuje automobilu, a ne vozaču; ako je držao manje, ostatak se može dobiti, i kaže se koliko. Zatim gdje se vrijeme može dobiti umjesto toga: na ravnini, ili u automobilu koji jače vuče, poslije apeksa - kočiti ravno, ući kasnije, ranije usmjeriti prema izlasku; inače, najširi polumjer koji cesta dopušta, jer je veći polumjer jedini način za više brzine bez više prionljivosti;
- **stražnji dio koji je popustio** ovdje, u automobilu koji ga lakše gubi od drugog: što raditi u ovom automobilu - gas dodavati dok se kotač odmotava, ili kočnicu nježno otpuštati bez podizanja usred zavoja, ovisno o tome kako klizanja počinju;
- **ravnina poslije**: što je jača vuča drugog automobila s iste brzine oduzela, i gdje je ovom automobilu ponestalo vuče na njoj;
- **raniju točku kočenja** u automobilu koji koči manje jako.

Krug koji je kliznuo kroz sredinu zavoja (preko 10° drifta na asfaltu) bio je iza svoje prionljivosti, a ne ispod nje: nikad mu se ne govori da je tamo imao prionljivosti na pretek. A kad je stražnji dio automobila u ovom krugu popustio pri manjem bočnom ubrzanju nego što ga je zavoj tražio, „prionljivost na pretek” kaže da je treba tražiti u malim koracima.

### 6. Kontrola automobila: blokade, proklizavanja, klizanja i potiskivanja, udarci i sudari {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Svaki krug se također čita po tome kako je automobil bio vođen - gdje je kotač blokiran, gdje su pogonski kotači proklizali, gdje je stražnji dio izašao, gdje je prednji dio širio zavoj - jer to su greške koje sâmo vrijeme ne imenuje. Tri stvari čine da to vrijedi u različitim igrama i na različitim podlogama.

**Gdje prionljivost prestaje mjeri se iz vlastite vožnje automobila.** Inženjeri postavljaju prag blokade po automobilu pri klizanju koje je dalo najviše usporavanja (MoTeC kanali u OptimumG-ovoj seriji kočenja koriste -0,07 za jedan automobil), a ne knjižnu vrijednost, a knjižne vrijednosti se ionako razilaze: sila vrhuncu dolazi pri 5-20% klizanja na asfaltu ovisno o gumi i modelu, pri 6% ili 20-60% na snijegu ovisno o izvoru, a nijedan izvor ne daje jednu vrijednost za šljunak. Igre klizanje dodatno drukčije skaliraju: Forzino je „normalizirano” tako da se iznad 1 prionljivost gubi - no kočnice automobila mogu dati najbolje rezultate znatno ispod ili iznad 1, a obične zone kočenja mogu preći 1. Zato se za svaki automobil, kroz svaki učitani krug, sila koju je stvorio grupira po klizanju koje je imao - usporavanje naspram omjera klizanja kotača pri kočenju po ravnoj liniji, ubrzanje (kao udio onoga što automobil daje pri toj brzini) naspram klizanja pogonskih kotača, bočna prionljivost u zavoju (kao udio prionljivosti automobila pri toj brzini) naspram kuta klizanja svake osovine - a granica je klizanje iza najboljeg mjesta, tamo gdje je sila pala 8%. Krivulja koja se u podacima nikad ne spušta - bočna prionljivost i vuča u Forza Horizonu - nema granicu, a samo klizanje tu ništa ne označava. Uz premalo podataka, granica je jedan i pol puta nazivni vrhunac.

**Podloga je poznata po uzorku**, gdje to igra kaže: Forza tutnji gumama na šljunku, zemlji i travi (malo uzoraka na asfaltnoj stazi, mnogo na zemljanim i cross-country stazama), Trackmania imenuje materijal ispod svakog kotača, a podloga rally dionice nalazi se kako kaže odjeljak 11. Krivulje, navike driftanja i pragovi odvojeni su za asfalt i rastresitu podlogu.

**Svaki događaj se stavlja uz drugi krug preko istih metara.** Na šljunku, na snijegu, u arkadnoj igri s puno driftanja, klizanje je način na koji se zavoj vozi: studije optimalnog upravljanja nalaze rješenja „niskog drifta” na asfaltu, a „agresivna, s puno drifta, čak i protuupravljanje” van ceste; podaci s rallyja pokazuju gume „daleko unutar nelinearnog područja”, a blokiranje kotača na vrlo rastresitoj podlozi može čak zaustaviti automobil ranije. Zato događaj koji je napravio i drugi krug - 80% ili više - jest način na koji se zavoj vozi, a ne greška; onaj koji nije napravio jest greška samo ako je koštao vremena: vrijeme izgubljeno od tik prije njega do 40 m poslije. Greška koja objašnjava 40% ili više gubitka zavoja postaje uzrok tog zavoja.

Pragovi otkrivanja, provjera drugog kruga, udarci i sudari te tekstovi savjeta: [Događaji kontrole automobila](race-control-events.md).

### 6b. Mnogo krugova: statistika staze {#b-many-laps-the-courses-statistics}

Usporedba klasa, što se smatra greškom, statistika i karta grešaka: [Statistika staze](race-course-statistics.md).

### 7. Vožena linija {#the-driven-line}

Za svaki krug i zavoj, samo iz položaja: gdje je počeo skretati (petina njegove najoštrije zakrivljenosti), njegov najuži polumjer (preko ±8 m), prosječni polumjer u prvoj i u drugoj polovici promjene smjera, i tako dalje:

- **oblik**: najuži naspram prosječnog polumjera manji od 0,55 je V, veći od 0,75 je U;
- **apeks**: polumjer na izlasku naspram polumjera na ulasku veći od 1,25 je kasni, manji od 0,8 je rani;
- **brzinski apeks**: njegova najsporija točka više od 15 m prije polovice skretanja znači sporo unutra, brzo van; više od 15 m poslije znači da se još usporava iza sredine.

Naspram drugog kruga: koliko je išao unutra ili vani pri ulasku u zavoj, kroz najuži dio i gdje su oba bila ravna, te gdje je koji ušao u zavoj. Svaka ocjena završava linijom koja pristaje automobilu tog kruga na tom zavoju - prema tome kamo zavoj vodi i izmjerenom omjeru snage i prionljivosti, aerodinamičkoj sili prižimanja i pogonu - te je li krug tu liniju i vozio. Tablica „Zavoj po zavoj” navodi najbrži krug kroz svaki zavoj s oblikom njegove linije, te najbolje zavoje složene zajedno.

### 8. Dvije karte {#two-maps}

- **Gdje**: staza obojena prema `dΔt/ds` naspram reference, crveno gdje se vrijeme gubi, a zeleno gdje se dobiva.
- **Zašto**: svaki gubitak nacrtan je tamo gdje mu je uzrok, obojen prema grupi uzroka - kočenje, ulazak, izlazak, ravnina, automobil - i širi za skuplji.

### 9. Ponavljanje {#replay}

Jedan sat, tri načina da se pretvori u vlastito vrijeme svakog kruga: od linije, poravnato (svaki krug stiže u istu točku staze u isti trenutak, pa se pusti) i jedan uz drugi (svaki krug zadržan na udaljenosti reference).

### 10. Kojim smjerom je svijet okrenut {#which-way-round-the-world-is}

Svijet preglednika je desnoruk, s Y prema gore. Igra s lijevoruko postavljenim svijetom (među njima Forza) prikazuje se u njemu zrcaljeno: svaki zavoj udesno nacrtan je kao zavoj ulijevo, i staza i krugovi. Sami krugovi to kažu - pozitivno upravljanje je udesno u svakom adapteru, a vanjski ovjes zavoja se sabija - pa kartica utrke nudi da to popravi, a to radi **Kamera i scena → Obrni os svijeta**: X, Y ili Z nacrtan obrnuto. Mijenja se samo crtanje - zrcaljenje ugrađeno u matricu pogleda; kamera leti u nacrtanom svijetu, a podaci, analiza i svaka koordinata koju alati prikazuju ostaju igrine vlastite. Analiza imenuje zavoje ulijevo ili udesno istim mjerenjem.

### 11. Rally: klizanje, lijeva noga, zrak {#rally-the-slide-the-left-foot-the-air}

Dionica rallyja nije staza vožena na lošijoj prionljivosti. Na šljunku i snijegu klizanje je način na koji se zavoj uzima: automobil se pri ulasku okreće pomicanjem težine - „kočnice pomiču težinu automobila naprijed ... prednje gume dobivaju prionljivost, stražnje je gube, a automobil se okreće klizeći u zavoj”, a zatim se vraća na gas kad je „poravnat u smjeru u koji želite ići” ([DirtFish: kako koristiti kočnice](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Lijeva noga koči da se gas i kočnica mogu igrati jedno protiv drugoga, ručna kočnica okreće automobil u uskim zavojima
([RallySport Ontario: rally vožnja, osnove](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/),
[Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)),
a automobil se odvaja od tla. Odjeljak 6 već čita klizanja uz drugi krug; ova pravila nose ostatak.
- **Podloga.** Ono što kaže sam krug (`meta.surface`, `--surface` kod rally snimača), inače naziv događaja - rallyji na asfaltu (Španjolska, Hrvatska, Srednja Europa, Njemačka, Japan, Korzika, Ypres), zimski (snijeg), asfaltna dionica Monte Carla sa snijegom i ledom (mješovito) - inače kako je automobil vožen. Granica bočnog ubrzanja Rally2 automobila je 0,7-0,9 g na šljunku i 1,3-1,4 g na asfaltu ([grenzbereich, referentne vrijednosti](https://github.com/GitCrush/grenzbereich)), a na šljunku se drift javlja puno češće (odjeljak 6). Zato je dionica na kojoj je automobil vukao 10 m/s² ili više (95. percentil, pri brzini, na podlozi) s medijanom driftanja ispod 6 stupnjeva gdje god je zavijao unutar 70% te vrijednosti - asfalt; sve ostalo, ili premalo za odluku, jest rastresito.
- **Što automobil može, na podlozi na kojoj je to učinio.** Prionljivost, kočenje i vuča (odjeljak 5) mjere se zasebno za asfalt i rastresitu podlogu kad su krugovi vozili petinu ili više svojih uzoraka na svakoj od njih, a svaki zavoj se ocjenjuje s podlogom ispod automobila u njegovoj najsporijoj točki. Uzorci u zraku i 0,3 s nakon doskoka izostavljaju se iz svega što mjeri automobil - ovojnica, krivulje guma, blokade i proklizavanja: doskok udari automobil preko svega što gume mogu, a kotači koji su se okretali u zraku nisu proklizavanje. Prižimanje se ne ocjenjuje na rastresitoj podlozi, gdje se brži i sporiji dijelovi dionice odvijaju na različitim cestama.
- **Dodir lijeve noge nije kočenje.** Lagani dodir kočnice dok je gas još na pola ili više, u razmaku manjem od 15 m, smiruje automobil ili ga okreće; točka u kojoj krug počinje kočiti za zavoj je prva kočnica pod kojom je gas otpušten, ili ona koja je trajala duže.
- **Automobil je okrenut na ulasku.** Za svaki krug i zavoj, najveći kut driftanja od njegova kočenja do 5 m poslije njegove najsporije točke. Na rastresitoj podlozi, krug kojem je automobil okrenut za 8 stupnjeva ili više manje od drugog (koji ga je okrenuo za 12 ili više) i koji je kasnije došao do snage **okrenuo je automobil manje**: savjet je podići gas ili nježno dodirnuti lijevu nogu na kočnici dok automobil ulazi u zavoj, da se stražnji dio okrene - s točkom ručne kočnice drugog kruga kad ju je koristio, ili ručnom kočnicom u zavoju sporijem od 54 km/h - i da bude usmjeren prema izlasku prije apeksa. Onaj koji ga je okrenuo za 12 stupnjeva ili više nego drugi, a ipak je kasnije došao do snage, **okrenuo ga je previše**: morao se ispraviti prije nego što se snaga može spustiti. Oba su uzrok zavoja na izlasku, nakon greške u kontroli automobila. Savjet o liniji na rastresitoj podlozi kaže isto za svaki zavoj.
- **Zrak.** Let od 0,2 s ili više duži od onog drugog kruga, koji je koštao vremena od 10 m prije poletanja do 40 m poslije doskoka (ili kraja zavoja), uzrok je kad objašnjava 40% ili više gubitka zavoja, a zavoj poslije njega, dosegnut sporije, to kaže. U zraku automobil ne može skretati, kočiti ni voziti. Savjet zadržava gas uključen pri poletanju - „ne podizati gas pri poletanju”, jer to spušta nos - i prelazi greben malo sporije ili uz dodir kočnice, tako da automobil ostane nisko ([DirtFish: kako preskočiti rally automobil](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Kompleksi od najviše tri zavoja.** Kriviljasta dionica koja se nikad ne vozi ravno nije jedan dugi kompleks: nakon tri zavoja počinje novi.

`src/race/rally.test.ts` drži analizu uz sve ovo na dionicama koje idu jednostavnim modelom: automobil okrenut manje i kasno na snazi, duži let, dodiri lijevom nogom, kriviljasta dionica, asfalt naspram šljunka.

## Podaci i što koji izvor dopušta {#data-and-what-each-source-allows}

| Izvor | Brzina | Kanali | Dopušta |
|---|---|---|---|
| FH Companion lap files | ~5 m | položaj, brzina, gas, kočnica, upravljanje, bočno i uzdužno ubrzanje, mjenjač | sve osim kontrole automobila, koja treba telemetriju uz njih |
| `.tele.gz` od FH Companiona, uz svaku datoteku kruga | 64 Hz igre (snimač koji čuva svaki paket piše oko 110 u sekundi; ponavljanja se odbacuju) | cijeli Forza Data Out: po kotaču omjer klizanja, kut klizanja, kombinirano klizanje, rotacija, ovjes, tutnjanje podloge; brzina u okviru automobila; brzina zakretanja | sve, uključujući kontrolu automobila |
| Forza Data Out, snimljen s `heat3d_capture telemetry` | 60 Hz | sve gore navedeno, plus po kotaču: temperatura gume, omjer klizanja, kut klizanja, kombinirano klizanje, hod ovjesa, brzina kotača, traka tutnjanja; o/min, snaga, moment, brzina zakretanja | sve |
| Assetto Corsa, ACC, AC EVO, AC Rally (dijeljena memorija, `heat3d_capture telemetry --game ...`) | 60-333 Hz | nadskup: temperatura jezgre gume i unutarnja, srednja i vanjska temperatura, tlakovi, temperature kočnica, opterećenja kotača, nagib kotača, omjer i kut klizanja; brzina u okviru automobila; ABS i TC aktivni (ACC, EVO, AC Rally) | sve |
| iRacing `.ibt`, čitano izravno | 60 Hz | položaj iz GPS-a, pedale, upravljanje, g, zakretanje, po kotaču temperatura karkase, otklon amortizera, tlak, habanje | sve; kontrola automobila iz kuta driftanja (njegovo zakretanje naspram smjera kretanja) i upravljanja, bez klizanja (nije zabilježeno) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | po okviru; 100 Hz | položaj, svjetska brzina i osi automobila, po kotaču brzina kontaktne površine i ovjes, pedale, upravljanje, sat dionice i duljina | sve; klizanje i kut driftanja izvedeni |
| Richard Burns Rally (NGP UDP) | po koraku fizike | položaj, vlastite brzine automobila, po kotaču otklon i sila opruge, pedale | sve osim klizanja kotača |
| BeamNG.drive (`heat3d` protokol mod) | do 100 Hz | položaj, svjetska brzina i osi, po kotaču brzina površine, rotacija, opterećenje i dodir s tlom | sve; klizanje i kut driftanja izvedeni |
| Trackmania (Openplanet dodatak) | po okviru | položaj, prednja i bočna brzina, pedale (kočnica uključena ili isključena), upravljanje, po kotaču koeficijent klizanja i rastresita podloga, u zraku | sve; kut driftanja iz bočne brzine |

Svaki izvor pretvara se u jedan format kruga, `heat3d-lap`, čiji kanali imaju kanonske nazive (`speed`, `throttle`, `tireTemp[FL]` ...). Oznaka automobila i grafovi crtaju koje god kanale krug ima.

## Izvori {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Ubrzavanje dionica: oblici vremenske varijacije](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (delta u domeni udaljenosti)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing vodič za analizu kruga](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: krugovi sesije](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analiza linija vožnje](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: teorijski najbolji iz dionica](https://overcut.gg/)
- [Track Titan: kako analizirati telemetriju](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: analiza kočenja, blokada i pokazatelji stabilnosti (rujan 2019.)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: na gasu (siječanj 2020.)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: ključni pokazatelji učinka vozača utrka (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Modeli trenja guma i ceste te optimalno klizanje (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: trenje gume i kolnika, klizanje pri vrhuncu na snijegu i ledu](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: koeficijenti trenja guma, vrhunac i klizanje](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: uzdužne sile](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: bočne sile](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Stabilnost vozila, granice klizanja karoserije (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Vožnja rallyja pri velikom bočnom klizanju (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Manevri rallyja u najkraćem vremenu (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC referentna brzina zakretanja (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Otkrivanje podupravljivosti i nadupravljivosti upravljanjem naspram zakretanja (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: kut upravljanja, Ackermann i gradijent podupravljivosti](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: matematički kanali (Kus, kombinirani g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: widget za nadupravljivost i podupravljivost](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Kočenje u taktovima: blokiranje na vrlo rastresitim podlogama](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: bilježenje podataka rallyja na šljunku](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: kako koristiti kočnice](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: kako preskočiti rally automobil](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rally vožnja, osnove](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: dinamika rally vozila, referentne vrijednosti](https://github.com/GitCrush/grenzbereich)
- [Trackmania dodatak za trening brzinskog driftanja (konstante)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania opis brzinskog klizanja](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: tijekovi treniranja](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: V-linija](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (brzina na izlasku naspram najkraćeg vremena)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: redoslijed za poboljšanje vremena kruga](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: tri vrste zavoja](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: određivanje prioriteta zavoja](https://driver61.com/uni/prioritising-corners/)
- [Driver61: različiti zavoji, različite tehnike](https://driver61.com/uni/different-corner-technique/)
- [Driver61: šest faza zavoja](https://driver61.com/uni/corner-phases/)
- [Driver61: prionljivost](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (odlomak)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: što je automobil na zamah](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [Rasprava o zamahu naspram konjske snage](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Matematika linije vožnje, 2. dio](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD naspram FWD, 1. dio](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD tehnika](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD naspram RWD u zavojima](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: tehnika zaokreta](https://www.formula1-dictionary.net/cornering_tech.html)
- [Najveća brzina u zavoju](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Rječnik telemetrije utrka](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Globalno planiranje putanje najkraćeg vremena uzimajući u obzir zakrivljenost i udaljenost](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: globalna optimizacija putanje utrke](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: faktor kotrljanja](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Uvod u krug prionljivosti](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g dijagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Uzdužno klizanje](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Podupravljivost, pregled](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Dokumentacija Forza Motorsport Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: ubrzanje ograničeno vučom](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: ubrzanje ograničeno snagom](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO shared memory](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally čitač telemetrije](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [Raščlanjivanje iRacing IBT](https://github.com/teamjorge/ibt)
