---
title: "Dogodki vožnje avtomobila"
parent: "Analiza dirke"
nav_order: 54
lang: "sl"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: false
---

# Dogodki vožnje avtomobila

Gledalec preveri, kako je bil vsak krog voden, in označi mesta, kjer je voznik spravil avto v zdrs, zavrtel ga, udaril ali izgubil oprijem. To je uporabno, ker je napako, ki je stala čas, najhitreje popraviti.

![Razdelek Obvladovanje avta: kako pogosto je vsak krog zaklenil kolo, se zavrtel ali šel preširoko, in seznam napak z enim odprtim](../assets/img/en/race-control-table.webp)

## Z besedami preprosto {#in-plain-words}

- **Blokada**: zavirate tako močno, da se kolo ustavi in zdrsne. Avto slabše zavira in ne more zavijati.
- **Spodrsavanje koles**: pritisnete plin tako močno, da se pogonska kolesa vrtijo hitreje, kot se avto premika. Izgubite moč.
- **Nadkrmiljenje**: zadnji del avta zdrsne vstran. Če se avto zavrti do konca, je to **zavrtenje**.
- **Podkrmiljenje**: sprednji del avta zdrsne vstran ("potiskanje"); bolj obračanje volana ne pomaga.
- **Udarec** in **strmoglavljenje**: avto se je nečesa dotaknil (udarec je trk ali opraskanje, strmoglavljenje je močan trk).
- **ABS**, **TC**: pomožna sistema avta, ki delujeta proti blokadi in spodrsavanju. Nista napaki.

## Razdelek Obvladovanje avta (kaj vidite) {#the-car-control-section-what-you-see}

Za izbrani krog prikaže, kar koli krogi vsebujejo. Tudi brez drsenja gum in brez kota zdrsa prikaže vsaj to, kar je še mogoče najti (spodaj).

**Tabela**: ena vrstica za vsako vrsto, ki jo kaže vsaj eden od obeh krogov – Zaklenjena kolesa, Spodrsavanje koles, Zadnji del zdrsne (nadkrmiljenje in zavrtenja), Potiskanje vstran, Strmoglavljenja, Udarci, ABS deluje, Kontrola zdrsa deluje, Ročna zavora, V zraku. Vsaka celica je "število · sekunde", za izbrani krog in za krog, s katerim je primerjan; in *Največji kot zdrsa*, kadar je kot zdrsa na voljo (največji na tleh).

**Seznam**: njegove napake, ki niso skupne in stanejo vsaj 0,02 s, od najdražje do najcenejše, največ 12, vsaka z naslovom in ceno (ter značko svoje vrste). Kliknite jo, da preberete nasvet, poravnate avta 40 m pred njo in jo ponovno predvajate. **Tudi, kaj sta naredila oba kroga tam** doda vsako napako, tudi skupne (značka "oba sta to naredila", cena "—" pod 0,01 s). Če ni nobene: "Nič, kar X ni naredil z gumami, ga ni stalo časa, Y pa tega ni naredil."

**Namig pod njim** pove, s čim je zaznavanje lahko merilo – "Iz drsenja vsakega kolesa in kota zdrsa kolesa ter kota zdrsa avta." (ali drsenje in kot zdrsa, drsenje in kot zdrsa avta, samo drsenje, ali "Samo iz kota zdrsa avta – ti krogi nimajo drsenja koles.") – podlago, za katero so bile meje izmerjene (asfalt, rahla, mešana: nad 80 % vzorcev na rahli podlagi je rahla, pod 20 % asfalt), na kateri krog so dogodki postavljeni in kako se šteje cena.

Pri **brez drsenja koles in brez kota zdrsa** (datoteka kroga FH Companion brez njene telemetrije) sta tabela in seznam kljub temu prikazana, namig pa pove, kaj je bilo še vedno najdeno iz tega, kar krogi vsebujejo: "Ti krogi nimajo drsenja koles in ne kota zdrsa, zato blokad in spodrsavanja ni mogoče določiti. Še vedno najdeno: potiskanje, iz krmiljenja proti poti; udarci in strmoglavljenja, iz hitrosti in pospeškov." – zdrsi iz hitrosti vrtenja se imenujejo tudi tam, kjer jih krogi imajo, potiskanja pa samo tam, kjer je krmiljenje. Stavek o mejah drsenja in kota zdrsa je izpuščen, drugi namig pa pravi: "Za Forza Horizon izberite tudi datoteko `.tele.gz` poleg vsakega kroga FH Companion: je celotna telemetrija, drsenje vsakega kolesa 64-krat na sekundo."

**Skupni** nadzorni strošek kroga (uporabljen v povzetkih) šteje prekrivajoče se napake – blokado in zdrs, ki se začne z njo, v 40 m – enkrat, po najdražji napaki v gruči.

## Kako se zazna {#how-it-is-detected}

Preostanek te strani je pravilnik: vsaka vrsta, vsak prag.

Koda: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Razmislek in literatura sta v [metodi](race-analytics.md).

## Vrste {#the-kinds}

| Vrsta | Vrstica v tabeli | Napaka? | Najkrajši, ki šteje |
|---|---|---|---|
| `lock` | Zaklenjena kolesa | da | 0,1 s |
| `wheelspin` | Spodrsavanje koles | da | 0,15 s |
| `oversteer` | Zadnji del zdrsne | da | 0,2 s |
| `spin` | (šteto z Zadnji del zdrsne) | da | 0,1 s |
| `understeer` | Potiskanje vstran | da | 0,25 s |
| `crash` | Strmoglavljenja | da | - |
| `hit` | Udarci | da | - |
| `abs` | ABS deluje | ne | 0,2 s |
| `tc` | Kontrola zdrsa deluje | ne | 0,2 s |
| `handbrake` | Ročna zavora | ne | 0,1 s |
| `airborne` | V zraku | ne | 0,15 s |

Krajši odseki so šum (robnik, izboklina, en vzorec). Odseki točk mreže (vsake 2 m), ki preidejo preizkus, se združijo čez vrzeli do 2 točk. Samo **napake** so lahko napake in imajo ceno; druge so tisto, kar sta naredila avto in voznik.

## Kaj zahteva vsak preizkus {#what-every-test-needs}

### Izpeljani kanali {#derived-channels}

Preden se karkoli presodi, vsak krog dobi, česar njegova igra ne pošlje, pod kanonskimi imeni (lastna vrednost igre vedno zmaga):

| Kanal | Iz česa |
|---|---|
| `bodySlip` (kot zdrsa) | hitrost v koordinatah avta, `atan2(latVel, abs(longVel))`, kjer jo igra pošlje (0 pod 3 m/s); sicer smer (kot igre, prilagojen smeri vožnje po predznaku in odmiku čez vzorce hitrejše od 10 m/s, zaupan le pri krožni varianci pod 0,05) proti smeri vožnje (položaji vsaj 2 m narazen), pri hitrostih nad 3 m/s |
| `yawRate` | sprememba `yaw` skozi čas, kjer je smer, a ni hitrosti vrtenja |
| `airborne` | vsako kolo brez stika s podlago (≤ 0,5); sicer obremenitev vsakega kolesa pod 5 % njegove mediane; sicer vsak hod vzmeti pri ali pod 0,02 (popolnoma iztegnjeno). Posamezen naključni vzorec ni let |
| `slipRatio.<W>` | `(hitrost površine kolesa - hitrost avta) / hitrost avta` nad 3 m/s, kjer igra pošlje hitrosti površine koles; ali iz vrtenja kolesa × polmer kotaljenja, izmerjen na krogu – mediana `hitrost / vrtenje` med jadranjem naravnost (hitrost > 10 m/s, plin < 0,3, zavora < 0,05, abs(vzdolžni pospešek) < 3 m/s², ne v zraku; vsak vzorec nad 10 m/s, kadar je manj kot 20), sprejeto med 0,1 in 1 m. Označeno `physical` |
| `loose` | površinski ropot Forze na vsaj 2 kolesih (> 0,001) vsaj 0,33 s (robnik je krajši), vrzeli pod 1 s premoščene |

### Na tleh in umirjeno {#on-the-ground-and-settled}

Ničesar ne presojamo v zraku ali **0,3 s po pristanku** – vzmetenje se stisne do konca in pospeški poskočijo, kar ni oprijem, zaviranje ali pogon. Vzorec mora tudi **premikati se**: hitreje od 5 m/s.

### Podlaga {#the-ground}

Podlaga vsakega vzorca je **rahla**, kjer kanal `loose` kroga tako pravi (Forzin površinski ropot, materiali koles Trackmanie), sicer površina kroga (glej [disciplina in površina](race-loading-laps.md#discipline-and-surface)): asfalt ali, za vse drugo, rahla. Krivulje, navade zdrsa in pragovi so ločeni za asfalt in za rahlo podlago.

### Drsenje, kot večkratnik nazivnega vrha gume {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Igre drsenje merijo različno; `meta.slip` pove, kako, in vsako drsenje se deli z merilom, tako da je okoli 1 nazivni vrh gume:

| `meta.slip` | Pomen | Deljeno z |
|---|---|---|
| `peak` | normirano z igro: nad 1 se oprijem izgubi (Forza Data Out) | 1 |
| `scaled` | fizično drsenje, deljeno z vrhom za asfalt (snemalnik Kunos) | nazivni vrh podlage nad vrhom za asfalt |
| `index` | merilo drsenja od 0 do 1 (SlipCoef Trackmanie) | 0,5 |
| `physical` (ali neznano) | razmerje drsenja kot ulomek, kot drsenja v radianih | nazivni vrh podlage |

Nazivni vrhovi, kadar ni nič boljšega znano:

| Podlaga | Razmerje drsenja | Kot zdrsa |
|---|---|---|
| asfalt | 0,12 | 8° |
| mešana | 0,18 | 12° |
| rahla (gramoz) | 0,25 | 15° |
| sneg | 0,25 | 15° |
| led | 0,10 | 6° |

### Kje se oprijem konča: krivulje gum vsakega avta {#where-grip-ends-each-cars-tyre-curves}

Kje guma neha dajati več, se **meri za vsak avto** iz vsakega obremenjenega kroga (`measureTyres`), ločeno za asfalt in rahlo podlago:

| Krivulja | Vzorci (hitrost > 10 m/s, umirjeni, pospeški pod 45 m/s²) | Drsenje (x) | Sila (y) |
|---|---|---|---|
| zaviranje | zavora > 0,3, ročna zavora ≤ 0,2, vožnja naravnost (bočno pod 30 % najtrše) | abs(povprečno razmerje drsenja štirih koles) | pojemek |
| vleka | plin > 0,8, zavora ≤ 0,05, naravnost, polni plinski vlek avta pri tej hitrosti > 0,5 m/s² | največje razmerje drsenja pogonskega kolesa | pospešek kot delež tega vleka |
| sprednja | bočno nad 30 % najtrše, oprijem avta pri tej hitrosti > 1 m/s² | večji kot zdrsa sprednjih koles | bočni pospešek kot delež tega oprijema |
| zadnja | enako | večji kot zdrsa zadnjih koles | enako |

"Najtrše" je 99. percentil abs(bočnega pospeška) kroga na tej podlagi (vsa podlaga, kadar ima manj kot 50 vzorcev). Pogon določi pogonska kolesa (sprednja pri FWD, zadnja pri RWD, vsa pri AWD; neznano: vsa).

Od vsaj **150 vzorcev** naprej se drsenje razdeli na 6 do 14 enako napolnjenih razredov (po en na 40 vzorcev), sila vsakega razreda je njegov zgornji kvartil (kar je guma dala, ko je voznik zahteval), zglajen čez sosednje razrede. **Najboljši** je razred z največjo silo; **meja** je prvi razred, po katerem sila pade za **8 %**. Krivulja, ki v podatkih nikoli ne pade, nima meje (neskončna) – prekoračitev "vrha" v tej igri ne stane ničesar, in samo drsenje ne označi ničesar tam (tako je pri zavijanju in vleki Forza Horizon). Pri premalo vzorcih na eni podlagi se uporabijo vzorci druge; pri premalo vzorcih skupaj se uporabi **nazivna** meja: 1,5-kratnik nazivnega vrha.

Vsak avto dobi tudi:

- svojo **navado zdrsa**: zgornji kvartil njegovega kota zdrsa, kjerkoli zavija pri 60 % ali več svoje najtrše vrednosti (potrebuje 100 vzorcev);
- svoje **krmiljenje na ukrivljenost** (`steerGain`), za vsak pas hitrosti po 5 m/s: mediana abs(krmiljenje) / ukrivljenost poti, medtem ko zavija odločno, a precej znotraj svojega oprijema (30–60 % njegove najtrše vrednosti, ukrivljenost ožja od polmera 400 m, krmiljenje nad 0,02; 25 vzorcev na pas). Ukrivljenost poti je hitrost vrtenja, deljena s hitrostjo, kjer igra pošlje hitrost vrtenja, sicer iz položajev ±5 m.

## Zaznavanje, vrsta za vrsto {#detection-kind-by-kind}

| Vrsta | Preizkus (na gibajočih se, umirjenih vzorcih) | `peak` in `limit` |
|---|---|---|
| **lock** | zavora > 0,05, ročna zavora ne nad 0,2 in razmerje drsenja katerega koli kolesa pod negativno mejo zaviranja | najbolj negativno drsenje (večkratniki nazivnega vrha); meja kot negativna |
| **wheelspin** | plin > 0,2 (ali ni kanala za plin), in razmerje drsenja pogonskega kolesa nad mejo vleke | največje pogonsko drsenje; meja |
| **oversteer** (kot zdrsa) | kot zdrsa nad večjim od podlagine spodnje meje in 1,5 × navade zdrsa avta tam | največji kot zdrsa, radiani |
| **oversteer** (koti zdrsa, brez kota zdrsa avta) | večji zadnji kot zdrsa nad zadnjo mejo in za več kot 0,25 nad večjim sprednjim | zadnji kot zdrsa (večkratniki vrha) |
| **oversteer** (brez kota zdrsa, a s hitrostjo vrtenja in bočnim pospeškom) | "hitrost držanja" – abs(hitrost vrtenja) minus abs(bočni pospešek) / hitrost, nad 8 m/s – nad 0,2 rad/s, s krmiljenjem proti zavoju | rad/s; meja 0,2 |
| **spin** | odsek nadkrmiljenja, katerega kot zdrsa je dosegel vrh čez **60°** | kot pri nadkrmiljenju |
| **understeer** (koti zdrsa) | ne drsi, večji sprednji kot zdrsa nad sprednjo mejo in za več kot 0,3 nad zadnjim | sprednji kot zdrsa; meja |
| **understeer** (brez kotov zdrsa) | hitreje od 12 m/s, ne drsi, ne protikrmari, bočni pospešek nad polovico najtrše vrednosti kroga (99. percentil), pot ožja od polmera 300 m in krmiljenje več kot **1,6-kratnik** tistega, kar avtovo lastno krmiljenje na ukrivljenost pove, da je pot potrebovala | potrebno krmiljenje, pomnoženo; meja 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` nad 0,5 | - |
| **handbrake** | `handbrake` nad 0,2 | - |
| **airborne** | `airborne` nad 0,5 | - |
| **hit**, **crash** | glej [Udarci in strmoglavljenja](#hits-and-crashes) | hitrost, ki jo je udarec vzel |

Podlagine spodnje meje kota zdrsa: asfalt **7°**, mešana **10°**, rahla in sneg **15°**, led **10°**. Avto, ki se zdrsa več kot samo po sebi – model gume za arkado, specialist za gramoz – ima svoj, višji prag iz svojih lastnih krogov (1,5 × njegova navada).

**Na katero stran avto zavija** (za "proti zavoju"): sprememba smeri poti kroga čez ±6 m (vsaj 2 točki mreže); ožje od polmera 600 m šteje kot zavijanje; desno ali levo glede na to, ali je svet zrcaljen. Krmiljenje je **proti** zavoju, kadar je abs(krmiljenje) > 0,05 in njegov predznak nasproten zavoju – zdrs, ki je **ujet** z nasprotnim krmiljenjem.

**Pedala na začetku** (`pedal`): *zavora*, kadar je zavora nad 0,1; *plin* nad 0,3; *spuščen*, kadar je bil plin nad 0,5 v 8 točkah mreže (16 m) pred tem; sicer *jadranje* (ali brez kanala za plin).

## Postavljeno ob drugem krogu {#laid-against-the-other-lap}

Vsak dogodek se presodi glede na krog, s katerim je izbrani krog primerjan v tistem odseku (najboljši v svojem razredu; za sam ta krog tisti iz njegovega razreda, ki je bil v odseku najhitrejši):

1. **Kako daleč je šel drugi krog** na istih metrih, ±8 m: lastni dogodki drugega kroga iste družine (zavrtenje šteje kot nadkrmiljenje, strmoglavljenje kot udarec), izmerjeni v istih enotah, brez pragov, z gumijastimi krivuljami drugega avta.
2. **Skupno**, kadar je drugi krog šel **80 %** ali več: tako se ovinek vozi, to ni napaka. Vrste, ki niso napake, so vedno "skupne".
3. **Cena** za napako, ki ni skupna: čas, ki ga je ta krog izgubil proti drugemu od 5 m pred dogodkom do **40 m po** njem (pri udarcu ali strmoglavljenju, dokler avto ne dobi nazaj svoje hitrosti – metri, da jo povrne pri lastni vleki, 40 do 400 m; brez izmerjene vleke, 5 m/s²). Nikoli negativna.
4. **Hitrost, podarjena meji avta**: pri blokadi pojemek, ki ga avto pokaže, da zmore pri tej hitrosti, minus tistega, ki ga je dosegel, seštet čez dogodek; pri spodrsavanju njegova polna vleka minus tiste, ki jo je dosegel; pri udarcu hitrost, ki jo je vzel. Pove se, kadar je nad 0,5 m/s (1,8 km/h).

Napaka, ki ni skupna in stane vsaj **0,02 s**, je na seznamu ([statistika odsekov](race-course-statistics.md) šteje samo napake od **0,03 s** naprej, da je napaka, ki se šteje čez mnogo krogov, jasna), in lahko postane vzrok izgube na ovinku (glej [Analiza ovinkov po ovinkih](race-corner-analysis.md#car-control-faults-and-impacts)).

## Udarci in strmoglavljenja {#hits-and-crashes}

`impacts.ts` bere udarce iz **lastnih vzorcev kroga**, preden se ponovno vzorčijo – udarec se zgodi v stotinkah sekunde. Gume ne morejo ustvariti sil udarca, zato se udarec meri glede na lastni avto kroga:

- **Njegov oprijem `G`**: 99. percentil njegovega vodoravnega pospeška `√(lat² + long²)` čez krog, na tleh in hitreje od 5 m/s. Brez pospeškovnih kanalov (ali pod 3 m/s²) 15 m/s² – oprijem cestnega avtomobila.
- **Prag**: `max(1,8 G, G + 18, 30)` m/s².
- **Zadet vzorec**: vodoravni pospešek nad pragom *in* skok za več kot polovico `G` od prejšnjega vzorca; **ali** hitrost pade v 0,1 s za več, kot bi prag vzel v 0,1 s, plus 1,5 m/s. Samo na tleh in umirjeno ter samo kadar je bil avto hitrejši od 5 m/s.
- Zadeti vzorci v **0,4 s** so en udarec.
- **Pred / po**: najvišja hitrost v 0,15 s pred; najnižja do 0,3 s po zadnjem zadetem vzorcu.
- **Ni udarec**: hitrost izgine brez sile za njo – največji vodoravni pospešek v 0,1 s pod večjim od `G` in 25 m/s² – igra je avto prevrtela nazaj ali ponastavila.
- **Strmoglavljenje**, ko je vzelo **30 km/h** ali več ali je avtu vzelo več kot polovico hitrosti; sicer **udarec** – trk, opraskanje ob steno.
- **Smer**: vzdolžni pospešek večji od bočnega in negativen: *čelno*; pozitiven: *od zadaj*; bočni večji: *ob boku*. Brez pospeškov, čelno.

Kaj avto zmore, se meri z izpuščenimi vsemi udarci, od 0,1 s pred njim do 1 s po njem (`struckMask`).

## Besedila {#the-texts}

Vsak dogodek je opisan z imenovanjem obeh krogov, s kje (metri vzdolž reference), hitrostjo, s katero se je začel, za kolikor je presegel mejo proti drugemu krogu, in z namigom. Namig sledi iz vrste in izmerjenega:

| Dogodek | Namig |
|---|---|
| blokada, samo sprednja | zaklenjeno sprednje kolo ne more krmiliti: manj tlaka na vrhu cone, izpustite jo v ovinek |
| blokada, samo zadnja | zaklenjeno zadnje kolo pusti avto vrteti se: zavirajte bolj naravnost, v zavoju popustite; premaknite porazdelitev naprej, če se to ponavlja |
| blokada, rahla podlaga | zaklenjeno kolo orje naprej: stisnite do tik pred zaklepom |
| blokada, sicer | preveč pedala za oprijem: stiskajte bolj postopno |
| spodrsavanje koles | dodajte plin, ko se krmilo odvija, kratko prestavljajte, kjer vleka omejuje (na rahli podlagi: višja prestava omili navor) |
| zavrtenje / nadkrmiljenje | po pedalu: pod zavoro (prepozno zaviranje v zavoju, prezgodnje shajanje v nižjo prestavo), spuščeno (nadkrmiljenje ob spustu: držite enakomeren plin), na plinu (preveč, medtem ko je še obrnjen), nič (vstop prehitro); "ujet z nasprotnim krmiljenjem", kadar je protikrmaril; na rahli podlagi ali na reliju "neki kot je hitra pot – drugemu je zadostoval" |
| podkrmiljenje | več krmiljenja nič ne pomaga, ko je sprednji del šel: vstopite počasneje, vlecite malo zavore, da obremenite sprednji del, odvijte; na rahli podlagi obrnite avto s spustom ali dotikom z levo nogo |
| udarec / strmoglavljenje | ob boku: meter rezerve stane manj kot opraskanje; od zadaj: drugi avto ali drsenje nazaj; čelno strmoglavljenje: zavirajte prej; udarec na sprednjem delu: nekaj ste se dotaknili. "X je tudi tam zadel." kadar je skupno |

V Trackmanii zdrs pove še: pod približno **400 km/h** (**300** na rahli podlagi: umazanija, trava, plastika) zdrs da manj pogona kot oprijem; nad tem zdrs s pravim kotom pridobi, ta pa je stal čas, zato je bil njegov kot napačen.

## Kaj dovoli vsak vir {#what-each-source-allows}

| Krogi vsebujejo | Blokade / spodrsavanje | Nadkrmiljenje / zavrtenje | Podkrmiljenje |
|---|---|---|---|
| drsenje razmerja vsakega kolesa in kot zdrsa, hitrost avta (Forza Data Out, igre AC) | iz drsenja | iz kota zdrsa ali zadnjega kota zdrsa | iz kotov zdrsa |
| hitrosti koles, svetovna hitrost (rally igre, BeamNG) | iz izpeljanega drsenja | iz izpeljanega kota zdrsa | iz krmiljenja na ukrivljenost |
| odklon in hitrost vrtenja, brez drsenja (iRacing) | - | iz kota zdrsa (prilagojen odklon proti smeri vožnje); iz hitrosti držanja s protikrmiljenjem samo, kadar odklonu ni mogoče zaupati | iz krmiljenja na ukrivljenost |
| samo smer | - | iz smeri proti vožnji | iz krmiljenja na ukrivljenost |
| sama datoteka kroga FH Companion (brez odklona, brez drsenja) | - | - | iz krmiljenja na ukrivljenost (ima krmiljenje in pospeške) |

Udarci in strmoglavljenja potrebujejo samo hitrost (bolje s pospeški), zato jih ima vsak vir. Razdelek **Obvladovanje avta** prikaže, kaj dovoli vsak vir: z samo datoteko kroga FH Companion njegova potiskanja iz krmiljenja in njegove udarce ter namig, naj naloži `.tele.gz` za ostalo.

