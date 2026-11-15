---
title: "Analitika dirke: metoda"
parent: "Analiza dirke"
nav_order: 58
lang: "sl"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Analitika dirke: metoda

Na kratko:

- Krogi se primerjajo **po razdalji**, ne po času, zato se isto mesto na progi poravna.
- Vsak ovinek se oceni **kot celota**, od ene cone zaviranja do naslednje.
- Izgubljeni čas se **razdeli** na to, kje je bil izgubljen (zaviranje, vstop, izhod, ravnina), in kolikšen del tega pojasni avto.
- Vzrok je **razložen z besedami**, z nasvetom.
- Če želite orodje uporabljati, ne pa brati, kako deluje: glejte [Analiza dirke](race-analysis.md).

To je metoda, na kateri temelji zavihek **Analiza dirke**: kaj meri, kako odloči, kje je šel čas, in kako to pretvori v nasvet. Je specifikacija, ki ji sledi analitična koda (`src/race/`), zato ima vsako pravilo tukaj ustrezen del v kodi in test, ki ga potrjuje.

## Kaj počnejo strokovna orodja {#what-the-professional-tools-do}

Uveljavljena orodja se držijo istega jedra in se razlikujejo predvsem v tem, kako daleč gredo proti *vzrokom*:

- **Vse se primerja po razdalji, ne po času.** Dva kroga se preslikata na skupno os razdalje; tekoča razlika časa pri isti razdalji je *delta* (MoTeC jo imenuje time variance, drugi pa časovni zamik ali krivulja delte). Njen naklon pove, kje se čas trenutno izgublja: položen naklon je pospeševanje, upor ali stalen oprijem; strm naklon pomeni razliko pri zaviranju ali plinu; valovita krivulja gor in dol pa je kompromis med hitrostjo ob vstopu in izhodu.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [analiza časa odseka](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Vsak ovinek je razdeljen na faze**: zaviranje, vstop, sredina, izhod – točka zaviranja, največja zavora in sprostitev, najmanjša hitrost in kje se zgodi, prestava, prijem plina, vrnitev na polni plin, hitrost ob izhodu.
  ([Driver61: šest faz](https://driver61.com/uni/corner-phases/),
  [iRacing vodnik za analizo kroga](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-odseki na ovinek in teoretično najboljši krog**, sestavljen iz najhitrejših delov. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Vožena linija se primerja tudi**, a nikoli sama zase: "črta na sliki ne pomeni nič, dokler ne poznaš dejavnikov, ki k njej prispevajo" – bere se ob krivulji hitrosti in delte.
  ([Track Titan: kako analizirati telemetrijo](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: dirkalne linije](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Vzrok, ne simptom.** Je izguba na ravnini res zaradi plina, ali je slab vstop prisilil k poznemu plinu? Napake se razvrstijo po stroških v času kroga in razložijo v preprostem jeziku.
  ([Track Titan: tokovi trenerjev](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Kaj je šlo narobe v prvi različici in zakaj je to pomembno {#what-went-wrong-in-the-first-version-and-why-it-matters}

Prva različica je vsako *fazo* obravnavala posebej in gledala le izgube. Krog, ki je zavrl prej, je izgubil čas v fazi zaviranja in dobil nasvet, naj zavira kasneje – tudi takrat, ko ga je zgodnejše zaviranje obrnilo hitreje, prej dalo plin in ga hitreje izvleklo iz ovinka, tako da je ves čas nadoknadil na ravnini. V enem testu je krogu, ki je tako ravnal, rekla, naj "zavira veliko kasneje", medtem ko je drugi krog, ki je res zaviral kasneje, zgrešil vrh ovinka, zapeljal preširoko in izgubil prav toliko, kolikor je bil prej pridobil. Podatki o času so pokazali, da sta bili obe poti enaki; nasvet je trdil nasprotno.

Popravek je pravilo, s katerim se strinjajo vsi zgornji viri: **ovinek se ocenjuje kot celota**, od cone zaviranja zanj do cone zaviranja za naslednjega, ker "včasih lahko odrekanje nekaj milisekund na enem ovinku izboljša skupni čas kroga, saj omogoča hitrejše odseke za njim"
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Dirkaško znanje, ki ga pravila vsebujejo {#racing-knowledge-the-rules-encode}

**Hitrost ob izhodu je pomembnejša od hitrosti ob vstopu**, in tem bolj, čim daljša je ravnina za njim: "čas na ravninah prevlada nad časom v ovinkih", hitrostni primanjkljaj ob izhodu pa se prenese na naslednjo točko zaviranja. Najhitrejši način skozi ovinek in ravnino je pogosto, da ovinek vzameš počasneje, da plin pride prej – *počasi noter, hitro ven*.
([Race & Track Driving: zaporedje za izboljšanje časa kroga](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: določanje prioritet ovinkov](https://driver61.com/uni/prioritising-corners/))
Planer najkrajšega časa, ki je nagrajen tudi za hitrost ob izhodu, premakne svoje vrhove kasneje in dobi *hitrejši* krog; nagrada, ki obe stvari uravnoteži, je vredna `L / v²` na enoto hitrosti ob izhodu za ravnino dolžine `L` pri hitrosti `v` – čas, ki ga stane hitrostna razlika na ravnini, raste z njeno dolžino in pada s kvadratom hitrosti
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Ovinki glede na to, kam vodijo.** Ovinek, ki vodi na ravnino: največja hitrost ob izhodu, pozen vrh, čim prej nazaj na moč. Ovinek na koncu ravnine: čim večja hitrost, prenesena vanj, zaviranje čim kasneje, zgodnejši vrh je sprejemljiv. Ovinek med dvema ovinkoma: kompromis zaradi tistega, ki je pomembnejši za naslednjega. Ovinek, ki bi lahko bil eden ali drug, obravnavamo kot tistega, ki vodi na ravnino. Hitrejši ovinki štejejo več: pri hitrosti avto slabo pospešuje, izgubljenega km/h pa ni mogoče nadoknaditi.
([Allen Berg: tri vrste ovinkov](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: določanje prioritet ovinkov](https://driver61.com/uni/prioritising-corners/),
[Driver61: različni ovinki, različne tehnike](https://driver61.com/uni/different-corner-technique/))

**Krog trenja.** Pnevmatika ima en proračun oprijema, ki se porablja za zaviranje, zavijanje in pospeševanje v poljubni mešanici; skupni pospešek je `sqrt(lat² + long²)`. Zaviranje v ovinku sledi njegovemu robu: zavora se sprošča, ko se krmilo in bočna obremenitev povečujeta.
([krog trenja](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Kotaljenje** – nobena pedala ni pritisnjena – je najpočasnejši način izgubljanja hitrosti in samo po sebi merjen kazalnik učinkovitosti.
([Racecar Engineering / OptimumG: faktor kotaljenja](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Zdrs.** Vzdolžna sila doseže vrh pri razmerju zdrsa okoli 10–20 %, nato pade; onkraj tega se kolo pri zaviranju zaklene ali pri pospeševanju zavrti. Forza poroča zdrs normaliziran: 0 je poln oprijem, velikost nad 1 pomeni izgubljen oprijem.
([vzdolžni zdrs](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Podkrmiljenje in nadkrmiljenje.** Če je zdrsni kot sprednje osi večji od zadnjega, gre za podkrmiljenje; če je zadnji večji od sprednjega, za nadkrmiljenje. Brez zdrsnih kotov: avto se zavije manj, kot krmilo zahteva (krmiljenje nad Ackermannovim kotom `L/R`, ki ga avto pri nizkih hitrostih potrebuje).
([podkrmiljenje, pregled](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Geometrija linije {#the-geometry-of-a-line}

Hitrost, ki jo avto zdrži na polmeru `R`, je `v = sqrt(a R)`, kjer je `a` bočni pospešek, ki ga dajejo pnevmatike (plus tisto, kar doda pritisna sila, ki raste z `v²`). Torej **hitrost raste s korenom polmera**: linija skozi sredino na 20 % večjem polmeru je tam približno 10 % hitrejša.
([največja hitrost v ovinku](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: ovinki](https://www.formula1-dictionary.net/cornering_tech.html))

**Geometrijska linija** je največji lok skozi ovinek: od zunanjega roba, dotika notranjega v vrhu in nazaj do zunanjega roba. Za ovinek, ki se obrne za kot `θ` na cesti širine `w` (minus širina avta), lok, ki se dotika obeh zunanjih robov in notranjega kota, pomeni `R = w / (1 - cos(θ/2))` (plus polmer notranjega roba) – za pravi kot približno `3,4 w`, za serpentino `w`. Zato je uporaba širine najpomembnejša v srednje ostrih ovinkih in najmanj v serpentinah.
([Dirkalna linija](https://en.wikipedia.org/wiki/Racing_line))

**Pozni vrh** se zavije kasneje in globlje, sprva na ožjem polmeru, na izhodu pa polmer odpre: skozi sredino počasneje, prej ravno, prej do polnega plina – "nekoliko nižja najmanjša hitrost, a močnejši profil pospeševanja na izhodu". **Zgodnji vrh** je obraten: hitreje noter, polmer se na izhodu zoži in zadrži plin – večinoma napaka, razen pri zelo majhnem oprijemu, kjer hitrosti, izgubljene pri vstopu, ni mogoče nadoknaditi na izhodu.
([Dirkalna linija](https://en.wikipedia.org/wiki/Racing_line),
[Vokabular dirkaške telemetrije](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[matematika dirkalne linije](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**"V" in "U".** U je klasična okrogla linija: najširši polmer, najmanj spreminjanja krmiljenja. V se zavije prej, gre globlje, hitro zavrti avto na sredini in pripravi izhod za bolj raven izvoz: zaviranje ostane ravno (zato ga lahko zaviraš pozneje), najmanjša hitrost je nižja, a dosežena kasneje, polni plin pa pride veliko prej.
([Track Titan: V-linija](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Ukrivljenost proti razdalji.** Najhitrejša linija je kompromis med najkrajšo potjo in najmanj ukrivljeno; na širini dirkališča je ukrivljenost pomembnejša, linija z najmanjšo ukrivljenostjo pa se povsod, kjer je avto na meji, približa liniji najkrajšega časa – od nje se loči tam, kjer bi avto lahko pospeševal.
([globalno planiranje poti za najkrajši čas](https://www.nature.com/articles/s41598-025-21211-2),
[TUM: globalna optimizacija dirkalne trajektorije](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Zaporedni ovinki** – dvojni vrh, šikana – so en sam problem: izhodna linija prvega je vstopna linija drugega, vozijo pa se nazaj od tistega, ki vodi na ravnino.
([Driver61: različni ovinki, različne tehnike](https://driver61.com/uni/different-corner-technique/))

## Katera linija ustreza kateremu avtu {#which-line-suits-which-car}

Odloča **razmerje med močjo in oprijemom** avta pri hitrostih tega ovinka – "zagon je razmerje med oprijemom in močjo".
([Ross Bentley: zagonski avti](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[zagon nad konjsko močjo](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Avto pri tem ovinku | Linija | Zakaj |
|---|---|---|
| Močno pospešuje glede na svoj oprijem ("point and shoot") | V: zavirati naravnost in pozno, zavrteti v kratki ostri sredini, ravno in zgodaj na ravnino | čas se dobi s polnim plinom, ne z najmanjšo hitrostjo |
| Šibko pospešuje glede na svoj oprijem ("momentum") | širok U, malo pozen vrh, najmanjšo hitrost ohranjaj visoko | ne more nadoknaditi hitrosti, ki jo izgubi |
| Vmes | počasi noter, hitro ven: U s poznim vrhom | klasičen kompromis |
| Hiter ovinek, še bolj z pritisno silo | U, blizu geometrijske linije | pospeševanje je pri hitrosti šibko; oprijem s pritisno silo raste z `v²`, zato se hitrost skozi sredino splača dvakrat |
| Zelo majhen oprijem (mokro, sneg) | zgodnejši vrh | hitrosti, izgubljene pri vstopu, ni mogoče nadoknaditi na izhodu |
| Moč daleč presega oprijem | linija manj šteje | vleka, ne linija, omejuje izhod |

"Hitrejši ovinek, bližje geometrijski liniji; počasnejši, bolj ga spreminjaš s poznejšim vrhom."
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[matematika dirkalne linije](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: V-linija](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: oprijem](https://driver61.com/uni/grip/))

Pogon bolj spremeni, kako se linija vozi, kot sama linija: avto s pogonom na sprednja kolesa se na zavorah zavija (trail braking) in dobi moč šele, ko se kolo odvija, sicer preširi; močan avto z zadnjim pogonom mora biti raven, preden gre na polni plin, sicer zadnji del odnese; pogon na vsa kolesa lahko prenese moč tudi med zavijanjem, zato plin pritisne prej.
([tehnika za FWD](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD proti FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD proti RWD v ovinkih](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Pogled meri razmerje med močjo in oprijemom avta pri vsakem ovinku iz lastne vožnje – polni pospešek pri hitrosti ob izhodu čez bočni oprijem pri najmanjši hitrosti – in ga imenuje "point and shoot" pri 0,45 in več, "momentum" pri 0,25 in manj.

Avto, katerega oprijem pri 150–250 km/h presega oprijem pri 55–110 km/h za več kot 15 %, ima delujočo pritisno silo.

## Metoda {#the-method}

Številke spodaj so razmislek. Pragovi, ki jih uporablja koda, so zapisani vsak na svoji strani, in te strani so merilo, če se številka tukaj razlikuje: [Ovinek za ovinkom](race-corner-analysis.md), [Dogodki nadzora avta](race-control-events.md), [Profili in primerjava avtov](race-car-profiles.md) in [Statistika proge](race-course-statistics.md).

### 1. Ena os razdalje {#one-distance-axis}

Najhitrejši krog je referenca, razen če uporabnik izbere drugega. Njegova vožena pot je os: vzorci vseh drugih krogov se preslikajo nanjo, tako da dobi vsak vzorec razdaljo vzdolž reference `s` in predznačen bočni odmik `d`. Iskanje projekcije gre naprej samo od zadnjega zadetka, zato krog, ki se križa sam s seboj, nikoli ne skoči na napačno stran mostu. Krogi se nato preslikajo na skupno mrežo, na vsakih 2 m, za vsak kanal. Vsak krog se zadnjih nekaj metrov nese s hitrostjo, ki jo je imel, zato je njegova delta na črti kar razlika v času kroga.

### 2. Ovinki in delež vsakega ovinka v krogu {#corners-and-each-corners-share-of-the-lap}

Kako se najdejo ovinki, odseki in kompleksi: [Ovinek za ovinkom](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Časovni račun ovinka {#the-time-account-of-a-corner}

Neto, razdelitev, hitrost ob izhodu in moč avtov: [Ovinek za ovinkom](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Sodba in vzrok {#the-verdict-and-the-cause}

Vzorci sodb in vzroki pri vstopu in izhodu: [Ovinek za ovinkom](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Avto proti vozniku {#the-car-against-the-driver}

Kadar so krogi v različnih avtih, se izguba, ki jo pojasni avto, odvzame po delih:

- **moč**: avti od iste hitrosti na ravnini navzdol, kot zgoraj;
- **oprijem**: od nižje najmanjše hitrosti, ki je ni pojasnil ožji polmer, delež `½ ln(oprijem_drugi / oprijem_moj) / ln(v_drugi / v_moj)`, kadar je bil krog na meji svojega avta (90 % tega, kar je pokazal pri tej hitrosti);
- **zavore**: od `u` do `v` pri zaviranju `a1` proti `a2`, s koncem na isti točki, stane `(1/a1 - 1/a2)(u - v)² / 2u` – samo če je krog zaviral približno tako močno, kot ga avto zmore čez cono v povprečju, ne le na vrhu.

Kaj avto zmore, prihaja iz vsakega naloženega kroga tega avta: bočni oprijem, zaviranje in pospeševanje pri polnem plinu na vsak razred hitrosti po 5 m/s (95., 95. in 90. percentil). Oprijem je tisto, kar je avto **držal pol sekunde** – bočni pospešek, povprečen čez 0,5 s – ne tisto, česar se je dotaknil en sam vzorec: robnik, zdrs, ki se vrne nazaj, ali ujetje avta vsi za trenutek zvišajo vrednost, in avto, ki to dela pogosto, izgleda oprijemljivejši, kot je. (Preverjeno na posnetih krogih dveh različnih avtov: mera po vzorcih ju je postavila blizu skupaj; držan pol sekunde ju loči tako, kot ju ločijo časi krogov.) Zaviranje in moč vsak vzorec vzamejo kot mediano samega sebe in svojih sosedov. Zrak, umirjanje po pristanku in vsak zadetek (oddelek 6), dokler se avto ne opomore, so izpuščeni.

**Kakšen avto je vsak** (`profile.ts`): iz istih krogov:

- **držan oprijem**: 95. percentil tega polsekundnega bočnega pospeška;
- **moč** pri polnem plinu do 50 km/h, 50–120, 120–200 in nad 200, in največ, kar je pokazal;
- **zaviranje** od 60 do 160 km/h;
- **najvišja hitrost**: kjer je nehal pridobivati pri polnem plinu za sekundo na ravnini – vožena naravnost, ne dolg ovinek, prevožen z ravnim plinom, kjer avto pri vsaki moči izgublja hitrost. Kjer ni bilo dovolj dolge ravnine, pove, kako daleč je bil od nje, to, pri čem je bil še v najhitrejšem delu. Brez ugibanj čez to, kar kažejo krogi: prilagoditev moči čez hitrost proti uporu je postavila cestni avto 100 km/h nad njegovo resnično najvišjo hitrostjo, ker prestave in omejevalnik končajo moč avta veliko prej kot upor;
- **izguba zadka**: kolikokrat na krog je zdrsnil čez 10° zdrsa (na rahli podlagi 20°) z zavitim kolesom v nasprotno smer ovinka – ujet z nasprotnim zavijanjem – koliko teh zdrsov se je začelo na plinu in pri kakšnem deležu svojega oprijema so se začeli. Avto, ki ga namerno malo zanese, ne izgublja nič; tistega, ki ga je treba ujeti, pa je. Šteto enako za vsak avto, zato sta lahko dva avta primerjana;
- **ravnotežje**, kjer krogi nosijo zdrsne kote: sprednji proti zadnjemu na meji.

**Primerjava avtov** postavi avte drug ob drugega – tabelo, po en stavek o tem, kaj je avto v primerjavi z drugim ("X bolje pospešuje, a se ne zna zaviti tako ostro, potrebuje več poti do ustavitve in lažje izgubi zadek"), vsako razliko, ki je jasna (4 % oprijema, 5 % moči ali zaviranja, 4 km/h najvišje hitrosti, zadek ujet vsaj enkrat na krog več in še enkrat tolikokrat), in kako voziti vsakega. Če je en sam avto, pove, kaj ta avto je.

**V vsakem ovinku**, kadar so krogi v različnih avtih, sodba pove, kaj od tega odločajo avti, in kako kar najbolje izkoristiti tega:

- **skozi sredino**: na drugačni liniji avta dovoljuje njegov oprijem `v_drugi · √(oprijem_moj / oprijem_drugi)`. Če je krog to nesel, je razlika avto in nobena točka zaviranja je ne spremeni – to se pove, ovinek pa se pripiše avtu, ne vozniku; če je nesel manj, je ostanek na voljo, in pove se, koliko. Nato, kje se čas lahko pridobi namesto tega: na ravnino ali v avtu, ki močneje pospešuje, po vrhu – zavirati naravnost, se zavijati pozneje, zgodaj usmeriti proti izhodu; sicer največji polmer, ki ga cesta dovoli, saj je večji polmer edina pot do več hitrosti brez več oprijema;
- **zadek, ki je popustil** tukaj, v avtu, ki ga lahko lažje izgubi kot drugi: kaj storiti v tem avtu – plin dodajati, ko se kolo odvija, ali zavoro nežno sprostiti brez odjemanja na sredini ovinka, glede na to, kako se zdrsi začnejo;
- **ravnina za njim**: kaj je vzelo močnejše pospeševanje drugega avta od iste hitrosti, in kje je ta avto na njej zmanjkal moči;
- **zgodnejša točka zaviranja** v avtu, ki se ustavlja manj ostro.

Krog, ki je zdrsnil skozi sredino ovinka (čez 10° zdrsa na asfaltu), je bil onkraj svojega oprijema, ne pod njim: nikoli se mu ne reče, da je tam imel oprijema na pretek. In če je zadek avta v tem krogu popustil pri manjšem bočnem pospešku, kot ga je ovinek zahteval, "oprijem na pretek" pove, naj ga išče v majhnih korakih.

### 6. Nadzor avta: blokade, prostotek, zdrsi in potiski, zadetki in trki {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Vsak krog se prebere tudi za to, kako je bil avto voden – kje je kolo blokiralo, kje so se gonilna kolesa vrtela, kje je zadek ušel, kje je sprednji del odnesel na široko – ker so to napake, ki jih sam čas ne poimenuje. Tri stvari poskrbijo, da to drži med igrami in podlagami.

**Kje se oprijem konča, se meri iz lastne vožnje avta.** Inženirji nastavijo prag blokade za vsak avto pri zdrsu, ki je dal največ upočasnitve (kanali MoTeC v zaporedju zaviranja OptimumG uporabljajo −0,07 za en avto), ne pri knjižni vrednosti, knjižne vrednosti pa se tako ali tako ne ujemajo: sila doseže vrh pri 5–20 % zdrsa na asfaltu, odvisno od pnevmatike in modela, pri 6 % ali 20–60 % na snegu, odvisno od vira, in noben vir je ne da za pesek. Igre zdrs merijo še drugače: pri Forzi je "normaliziran", tako da je po 1 oprijem izgubljen – vendar lahko zavore avta dajo svoj najboljši rezultat precej pod 1 ali precej nad 1, običajne cone zaviranja pa lahko gredo čez 1. Zato se za vsak avto, čez vse naložene kroge tega avta, sila, ki jo je ustvaril, razvrsti glede na zdrs, pri katerem je tekel – upočasnitev proti razmerju zdrsa koles pri zaviranju naravnost, pospeševanje (kot delež tistega, kar avto ustvari pri tej hitrosti) proti zdrsu gonilnih koles, oprijem v ovinku (kot delež oprijema avta pri tej hitrosti) proti zdrsnemu kotu vsake osi – in meja je zdrs za najboljšo točko, kjer je sila padla za 8 %. Krivulja, ki v podatkih nikoli ne pade – bočni in vlečni oprijem v Forza Horizon – nima meje, zdrs sam tam ničesar ne označi. Pri premalo podatkih je meja enkrat in pol nazivnega vrha.

**Podlaga je znana za vsak vzorec**, kjer to igra pove: Forza tresoče orodi kolesa na pesku, produ in travi (malo vzorcev na asfaltnem krogu, veliko na peščenih in terenskih progah), Trackmania poimenuje material pod vsakim kolesom, podlaga rallyjevske proge pa se najde, kot pove oddelek 11. Krivulje, navade zdrsa in pragovi so za asfalt in rahlo podlago ločeni.

**Vsak dogodek je položen čez drugi krog na istih metrih.** Na produ, na snegu, v arkadni dirki, ki veliko zdrsa, je zdrs način, kako se ovinek vozi: študije optimalnega krmiljenja najdejo rešitve z "malo zdrsa" na asfaltu in "agresivne, z veliko zdrsa, celo protikrmiljenja" zunaj nje, rallyjevski podatki kažejo pnevmatike "precej znotraj nelinearnega območja", blokiranje kolesa na zelo rahli podlagi pa lahko celo ustavi avto hitreje. Zato je dogodek, ki ga je naredil tudi drugi krog – 80 % ali več – način, kako se ovinek vozi, ne napaka, dogodek, ki ga drugi krog ni naredil, pa je napaka samo, če je stal čas: izgubljen čas od tik pred njim do 40 m za njim. Napaka, ki pojasni 40 % ali več izgube ovinka, postane vzrok tega ovinka.

Pragovi zaznavanja, preizkus z drugim krogom, zadetki in trki ter besedila nasvetov: [Dogodki nadzora avta](race-control-events.md).

### 6b. Veliko krogov: statistika proge {#b-many-laps-the-courses-statistics}

Primerjava razredov, kaj šteje kot napaka, statistika in zemljevid napak: [Statistika proge](race-course-statistics.md).

### 7. Vožena linija {#the-driven-line}

Za vsak krog in ovinek, samo iz položajev: kje je začel zavijati (petina njegove največje ukrivljenosti), njegov najožji polmer (čez ±8 m), povprečni polmer na prvi in drugi polovici spremembe smeri ter tako naprej:

- **oblika**: najožji proti povprečnemu polmeru pod 0,55 je V, nad 0,75 je U;
- **vrh**: polmer ob izhodu proti polmeru ob vstopu nad 1,25 je pozen, pod 0,8 zgoden;
- **hitrostni vrh**: njegova najpočasnejša točka več kot 15 m pred polovico zavoja je počasi noter, hitro ven; več kot 15 m za njo, še vedno zavira čez sredino.

Proti drugemu krogu: kako daleč znotraj ali zunaj je tekel pri zavijanju, skozi najožji del in tam, kjer sta bila oba ravna, in kje je vsak začel zavijati. Vsaka ugotovitev se zaključi z linijo, ki ustreza avtu kroga pri tem ovinku – glede na to, kam ovinek vodi, izmerjeno razmerje moči in oprijema avta, pritisno silo in pogon – in s tem, ali jo je krog vozil. Tabela "Ovinek za ovinkom" navede najhitrejši krog skozi vsak ovinek s obliko njegove linije, in najboljše ovinke, sestavljene skupaj.

### 8. Dva zemljevida {#two-maps}

- **Kje**: proga, obarvana z `dΔt/ds` glede na referenco, rdeče tam, kjer se čas izgublja, in zeleno tam, kjer se pridobi.
- **Zakaj**: vsaka izguba je narisana tam, kjer je njen vzrok, obarvana z skupino vzroka – zaviranje, vstop, izhod, ravnina, avto – in širša pri dražji.

### 9. Predvajanje {#replay}

Ena ura, tri načini, kako jo spremeniti v lasten čas vsakega kroga: od črte, poravnano (vsak krog doseže eno točko proge ob istem trenutku, nato se spusti) in drug ob drugem (vsak krog je držan na razdalji reference).

### 10. Katera smer je svet {#which-way-round-the-world-is}

Svet v pogledu je desnosučen, z Y navzgor. Igra z levosučnim svetom (med njimi Forza) se v njem prikaže zrcaljeno: vsak desni ovinek je narisan kot levi, tako proga kot krogi. Krogi to povedo sami – pozitiven zasuk krmila je v vsakem vmesniku na desno in zunanje vzmetenje ovinka se stisne – zato zavihek dirke ponudi popravek, **Kamera in prizor → Obrni os sveta** pa to naredi: X, Y ali Z se nariše obrnjen. Spremeni se le risba – zrcaljenje, vloženo v pogledno matriko; kamera leti v narisanem svetu, podatki, analiza in vsaka koordinata, ki jo kažejo orodja, pa ostanejo igrini. Analiza zavoje imenuje levo ali desno z isto meritvijo.

### 11. Rally: zdrs, leva noga, zrak {#rally-the-slide-the-left-foot-the-air}

Rallyjevska proga ni dirkališče, ki se vozi s slabšim oprijemom. Na produ in snegu je zdrs način, kako se ovinek vzame: avto se v ovinek zasuka s premikanjem teže – "zavore premaknejo težo avta naprej ... sprednje pnevmatike dobijo oprijem, zadnje ga izgubijo, avto se zavrti in zdrsne v ovinek", nato nazaj na plin, ko je "poravnan v smer, v katero želiš iti" ([DirtFish: kako uporabljati zavore](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Leva noga zavira, da se plin in zavora lahko igrata drug proti drugemu; ročna zavora zasuka avto v ostrih ovinkih ([RallySport Ontario: rally vožnja, osnove](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [skandinavski flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), avto pa se odlepi od tal. Oddelek 6 že bere zdrse glede na drug krog; ta pravila nosijo ostalo.

- **Podlaga.** Kar pove krog (`meta.surface`, `--surface` rallyjevskih snemalnikov), sicer ime dogodka – asfaltni rallyji (Španija, Hrvaška, Srednja Evropa, Nemčija, Japonska, Korzika, Ypres), zimski (sneg), asfaltni del Monte z snegom in ledom (mešano) – sicer kako je bil avto voden. Bočna meja Rally2 avta je 0,7–0,9 g na produ in 1,3–1,4 g na asfaltu ([grenzbereich, referenčne vrednosti](https://github.com/GitCrush/grenzbereich)), na produ pa teče veliko več driftanja (oddelek 6). Zato je odsek, kjer je avto pospeševal 10 m/s² ali več (95. percentil, pri hitrosti, na podlagi) s srednjim driftom pod 6 stopinj, kjerkoli je zavijal znotraj 70 % tega, asfalt; vse drugo ali premalo podatkov, da bi se odločilo, je rahlo.
- **Kaj avto zmore, na podlagi, na kateri je to naredil.** Oprijem, zaviranje in moč (oddelek 5) se merijo ločeno za asfalt in rahlo podlago, kadar so krogi na vsaki vozili petino ali več svojih vzorcev, vsak ovinek pa se oceni s podlago pod avtom na njegovi najpočasnejši točki. Vzorci v zraku in 0,3 s po pristanku so izpuščeni iz vsega, kar meri avto – ovojnice, krivulje pnevmatik, blokade in prostotek: pristanek sunkovito premaga vse, kar lahko pnevmatike zmorejo, kolesa, ki so se v zraku zavrtela, pa niso prostotek. Pritisna sila se na rahli podlagi ne ocenjuje, kjer so hitri in počasni deli odseka različne ceste.
- **Dotik leve noge ni zaviranje.** Rahel dotik zavore, ko je plin še na polovici ali več, na manj kot 15 m, avto umiri ali zasuka; kje je krog začel zavirati za ovinek, je prva zavora, pod katero je plin odjenjal, ali tista, ki je trajala dlje.
- **Avto zasukan na vstopu.** Za vsak krog in ovinek največji kot drifta od njegove zavore do 5 m za njegovo najpočasnejšo točko. Na rahli podlagi krog, ki je imel avto zasukan za 8 stopinj ali več manj kot drugi (ki ga je zasukal za 12 ali več) in na plin prišel pozneje ali ravno, **je avto zasukal manj**: nasvet je, da se ob zasuku odjame ali dotakne leve noge na zavori, da se zadek obrne – z točko ročne zavore drugega kroga, če jo je uporabil, ali ročno zavoro v ovinku, počasnejšem od 54 km/h – in da je obrnjen v izhod še pred vrhom. Tisti, ki ga je zasukal za 12 stopinj ali več čez drugega in je še vedno prišel na plin pozneje, **ga je zasukal preveč**: moral ga je poravnati, preden je lahko šel plin dol. Oboje je vzrok ovinka na izhodu, po napaki pri nadzoru avta. Nasvet o liniji na rahli podlagi pove isto za vsak ovinek.
- **Zrak.** Let za 0,2 s ali več daljši od drugega kroga, ki je stal čas od 10 m pred vzletom do 40 m po pristanku (ali konca ovinka), je vzrok, kadar pojasni 40 % ali več izgube ovinka; ovinek za njim, dosežen počasneje, to pove. V zraku avto ne more zavijati, zavirati ali voziti. Nasvet ohranja plin ob vzletu – "ne odjemati plina med vzletom", ker to povesi nos – in greben vzame nekoliko počasneje ali z rahlim dotikom zavore, da avto ostane nizko ([DirtFish: kako skočiti z rally avtom](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Skupine do treh ovinkov.** Kvrgav odsek, ki se nikoli ne vozi ravno, ni ena sama dolga skupina: po treh ovinkih se začne nova.

`src/race/rally.test.ts` drži analizo na vseh teh pravilih na odsekih, ki so vožena po preprostem modelu: avto, zasukan manj in pozno na plinu, daljši let, dotiki leve noge, kvrgav odsek, asfalt proti produ.

## Podatki in kaj dovoljuje vsak vir {#data-and-what-each-source-allows}

| Vir | Frekvenca | Kanali | Dovoljuje |
|---|---|---|---|
| Datoteke krogov FH Companion | ~5 m | položaj, hitrost, plin, zavora, krmilo, vzdolžni in bočni pospešek, prestava | vse, razen nadzora avta, ki potrebuje telemetrijo ob njih |
| `.tele.gz` FH Companion, ob vsaki datoteki kroga | 64 Hz igre (snemalnik, ki hrani vsak paket, jih zapiše okoli 110 na sekundo; ponovitve se zavržejo) | ves Data Out Forze: zdrs koles, zdrsni kot, kombinirani zdrs, vrtenje, vzmetenje, tresenje podlage; hitrost v okvirju avta; hitrost zasuka | vse, vključno z nadzorom avta |
| Forza Data Out, posnet z `heat3d_capture telemetry` | 60 Hz | vse zgoraj, plus za vsako kolo: temperatura pnevmatike, zdrs, zdrsni kot, kombinirani zdrs, hod vzmeti, hitrost kolesa, tresoči pas; vrtljaji, moč, navor, hitrost zasuka | vse |
| Assetto Corsa, ACC, AC EVO, AC Rally (deljen pomnilnik, `heat3d_capture telemetry --game ...`) | 60–333 Hz | nadmnožica: temperatura jedra pnevmatike in notranje/srednje/zunanje, tlaki, temperature zavor, obremenitve koles, kamber, zdrs in kot; hitrost v okvirju avta; ABS in TC v delovanju (ACC, EVO, AC Rally) | vse |
| iRacing `.ibt`, neposredno branje | 60 Hz | položaj iz GPS, pedala, krmilo, g, zasuk, za vsako kolo temperatura ogrodja, odklon amortizerja, tlak, obraba | vse; nadzor avta iz kota drifta (njegov zasuk proti smeri vožnje) in krmila, brez zdrsa (ni zapisan) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | na okvir; 100 Hz | položaj, svetovna hitrost in osi avta, za vsako kolo hitrost stične ploskve in vzmetenje, pedala, krmilo, ura etape in dolžina | vse; zdrs in kot drifta izpeljana |
| Richard Burns Rally (NGP UDP) | na fizikalni korak | položaj, lastne hitrosti avta, za vsako kolo odklon vzmeti in sila, pedala | vse, razen zdrsa koles |
| BeamNG.drive (modifikacija s protokolom `heat3d`) | do 100 Hz | položaj, svetovna hitrost in osi, za vsako kolo hitrost površine, vrtenje, obremenitev in stik s podlago | vse; zdrs in kot drifta izpeljana |
| Trackmania (vtičnik Openplanet) | na okvir | položaj, sprednja in stranska hitrost, pedala (zavora vklopljena/izklopljena), krmilo, za vsako kolo koeficient zdrsa in rahla podlaga, v zraku | vse; kot drifta iz stranske hitrosti |

Vsak vir se pretvori v en format kroga, `heat3d-lap`, katerega kanali imajo kanonična imena (`speed`, `throttle`, `tireTemp[FL]` ...). Simbol avta in grafi narišejo kakršne koli kanale, ki jih krog ima.

## Viri {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections: time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (delta v domeni razdalje)](https://github.com/taishiliu25/lap-delta-analyzer)
- [vodnik za analizo kroga iRacing](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: krogi seje](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analiza dirkalnih linij](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: teoretično najboljši iz odsekov](https://overcut.gg/)
- [Track Titan: kako analizirati telemetrijo](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: KPI-ji zaviranja, blokade in stabilnosti (sep. 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: na plinu (jan. 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: ključni kazalniki uspešnosti dirkačev (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Modeli trenja pnevmatika-cesta in optimalni zdrs (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: trenje pnevmatika-podlaga, zdrs na vrhu na snegu in ledu](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: koeficienti trenja pnevmatik, vrh in drsenje](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: vzdolžne sile](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: bočne sile](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Stabilnost vozila, meje zdrsa karoserije (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Vožnja rally pri velikem bočnem zdrsu (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Manevri rally za najkrajši čas (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC referenčna hitrost zasuka (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Zaznavanje podkrmiljenja in nadkrmiljenja z zasukom krmila proti zasuku (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: kot krmila, Ackermann in gradient podkrmiljenja](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: matematični kanali (Kus, skupni g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: pripomoček za nadkrmiljenje in podkrmiljenje](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Ritmično zaviranje: blokiranje na zelo rahlih podlagah](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: beleženje podatkov na rally produ](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: kako uporabljati zavore](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: kako skočiti z rally avtom](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rally vožnja, osnove](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Skandinavski flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: dinamika rally vozil, referenčne vrednosti](https://github.com/GitCrush/grenzbereich)
- [Trackmania: vtičnik za trening speed-drift (konstante)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania: opis speedslide](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: tokovi trenerjev](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: V-linija](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (hitrost ob izhodu proti najkrajšemu času)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: zaporedje za izboljšanje časa kroga](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: tri vrste ovinkov](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: določanje prioritet ovinkov](https://driver61.com/uni/prioritising-corners/)
- [Driver61: različni ovinki, različne tehnike](https://driver61.com/uni/different-corner-technique/)
- [Driver61: šest faz ovinka](https://driver61.com/uni/corner-phases/)
- [Driver61: oprijem](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (odlomek)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: kaj je zagonski avto](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [Razprava o zagonu nad konjsko močjo](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Matematika dirkalne linije, 2. del](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD proti FWD, 1. del](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [Tehnika FWD](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD proti RWD v ovinkih](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Dirkalna linija](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: tehnika ovinkov](https://www.formula1-dictionary.net/cornering_tech.html)
- [Največja hitrost v ovinku](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Vokabular dirkaške telemetrije](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Globalno planiranje poti za najkrajši čas ob upoštevanju ukrivljenosti in razdalje](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: globalna optimizacija dirkalne trajektorije](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: faktor kotaljenja](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Uvod v krog trenja](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Vzdolžni zdrs](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Podkrmiljenje, pregled](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport: dokumentacija Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: pospeševanje, omejeno z oprijemom](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: pospeševanje, omejeno z močjo](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO deljen pomnilnik](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [Bralnik telemetrije AC Rally](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [Razčlenjevanje iRacing IBT](https://github.com/teamjorge/ibt)
