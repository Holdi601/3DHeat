---
title: "Analiza ovinek za ovinkom"
parent: "Analiza dirke"
nav_order: 55
lang: "sl"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analiza ovinek za ovinkom

Dva kroga iste proge se primerjata ovinek za ovinkom. Za vsak ovinek gledalec pove, kdo je bil hitrejši, koliko časa je to vredno in zakaj – prezgodaj zaviral, prepozno dal plin, vzel širšo linijo –, da veš, kaj vaditi najprej.

![Ugotovitev, odprta v razdelku Kje se izboljšati, ob tabeli Ovinek za ovinkom](../assets/img/en/race-corner-finding.webp)

Delovni primer: pri ovinku 3 Voznik A zavira 20 m prej kot Voznik B in pri tem izgubi 0,15 s, a je prej na plinu in na izhodu pridobi 0,15 s. Neto 0,00 s: ovinek je izenačen in nikomur ne reče, naj zavira pozneje.

## Kaj vidiš {#what-you-see}

### Kje se izboljšati {#where-to-improve}

Razdelek v stranski vrstici za izbrani krog ("Naloži vsaj dva kroga ene proge." dokler ni tako).

**Glava:** "<krog> <čas> proti <referenca> <čas>" in razlika v času kroga – ali, za referenco, "proti najhitrejšemu drugemu krogu skozi vsak ovinek (…)" in skupno izgubo. Poleg tega izguba, razdeljena na *vožnjo* in *avto / okoliščine*.

**Vrstica razčlenitve:** izgubljen čas po skupinah vzrokov (zaviranje, vstop, izhod, ravnina, avto, okoliščine), v barvah vzrokov, z legendo.

**Ugotovitve**, tri sezname:

1. Izgube pri vožnji, najdražje najprej, največ **12** – ali "Nikjer, kjer bi drugačna vožnja prinesla čas, ne izstopa."
2. **Pokaži, koliko sta stala avto ali situacija (X s)** – izgube avtov in okoliščin, največ 8 (privzeto vklopljeno).
3. **Kje je <krog> hitrejši ali drugače izenačen (N)** – pridobitve in izenačeni ovinki, največ 10 (privzeto vklopljeno).

Vsaka ugotovitev prikaže svoj vrstni red, naslov (ovinek in kaj se je zgodilo, pri izgubi s stroškom), stavek o sodbi, strošek (pridobitve z minusom) s stolpcem in oznako: *zaviranje*, *vstop*, *izhod*, *ravnina* (izgube pri vožnji, z "· avto X", kadar avto pojasni 0,02 s ali več), *avto*, *okoliščine*, *hitreje*, *izenačeno*. **Klikni eno**, da poravnaš avta 40 m pred njo, jo uokviriš in predvajaš ter odpreš njene meritve:

- **Zaviranje:** kje je vsak zavrl (ali odjenjal) in pri kateri hitrosti, ter za koliko metrov prej ali pozneje (od 5 m);
- **Najpočasnejši:** najmanjša hitrost vsakega kroga in kje;
- **Polni plin:** kje je bil vsak ravno, in za koliko prej ali pozneje;
- **Linija:** razlika pri vstopu v zavoj, najožji polmeri, za koliko je bil znotraj ali zunaj, ter oblika linije in vrh vsakega kroga;
- **Ravnina do naslednjega ovinka:** njena dolžina, obe hitrosti tam, kjer sta bila oba ravna, kaj je izgubil ali pridobil in zakaj – začetna hitrost, močnejša moč drugega, odjem plina, odnesena hitrost, kako je bila vožena (deli od 0,02 s naprej);
- **Avto:** koliko izgube je avto in zaradi česa (moč, oprijem, zavore; kadar 0,02 s ali več);

nato nasvet, **Avti:** (pri različnih avtih, glej [Profili avtov](race-car-profiles.md#what-the-cars-decide-in-a-corner)) in nasvet glede linije.

### Ovinek za ovinkom {#corner-by-corner}

Tabela (pri dveh ali več krogih), ena vrstica na odsek, za razred izbranega kroga, kadar je razredov več:

| Stolpec | Pokaže |
|---|---|
| Ovinek | `T3`, `T11-T12` |
| Najhitrejši | krog, ki je bil skozenj najhitrejši (njegov lastni čas od začetka do konca odseka) |
| za | njegova prednost pred drugim najhitrejšim, s |
| linija | oblika in vrh najhitrejšega kroga ("V · pozen", "U/V · sredina"); ob premiku z miško njegovi najožji, vstopni in izstopni polmeri; "oba načina" za mešano skupino |
| (izbrani krog) | za kolikšen čas je zaostajal za najhitrejšim, ali ✓, če je bil najhitrejši |

Klik na vrstico tam odpre ugotovitev izbranega kroga (ali poravna avta 40 m pred odsekom). Pod tabelo, kadar ima vsak ovinek čas: "Najhitrejši skozi vsak ovinek, sestavljen skupaj: <čas> (± na referenci / na najboljšem iz razreda X)" – najboljši odseki in najhitrejša vožnja do prvega ovinka, kadar je to njen lastni del proge.

## Kako se izračuna {#how-it-is-worked-out}

Vodilno pravilo: **ovinek se oceni kot celota**, od cone zaviranja zanj do cone zaviranja za naslednjega. Krog, ki zavira prej, da avto hitreje obrne in prej dobi plin, dobi priznan izhod, ki ga je kupil, in se mu ne reče, naj zavira pozneje.

## Ena os razdalje {#one-distance-axis}

Krogi se primerjajo po razdalji, ne po času – sekundo za drugim sta dva kroga na različnih ovinkih. Tudi ne po lastnem števcu kilometrov vsakega kroga (ožja linija prevozi manj metrov). Os je vožena pot **referenčnega** kroga:

- Vzorci vseh drugih krogov se **projicirajo** na referenčno pot: vsak vzorec dobi `s`, kako daleč vzdolž reference je, in `d`, kako daleč levo (pozitivno) ali desno. Iskanje gre naprej od zadnjega zadetka (od 8 odsekov poti nazaj do 40 naprej), zato krog, ki se križa sam s seboj, nikoli ne skoči na drugo križišče. Prvi vzorec se išče v prvi četrtini poti (na krogu se začetek in cilj stikata); ko ni nič znotraj 30 m, se vzame najbližja točka kjerkoli, ki ni za zadnjim zadetkom (po zdrsu ali izletu). `s` nikoli ne pade: vzorec, ki se projicira za prejšnjim, se zadrži.
- Vsak kanal se **preslika** na skupno mrežo, **na vsakih 2 m**, linearno; kanali, ki skačejo (prestava, zastavice), z najbližjim vzorcem. Zunaj lastnega razpona kroga so vrednosti prazne.
- Prvi in zadnji vzorec kroga se projicirata nekoliko znotraj konca reference, zato je vsak krog **nesen do 15 m** čez svoja konca s hitrostjo, ki jo je imel (čas raste z razdaljo, deljeno s hitrostjo, ostalo ostane) – zato je njegova delta na črti kar razlika v času kroga.
- `delta` = čas kroga v vsaki točki mreže minus čas reference: razmik. `lateral` = `d` na mreži.

Čas, ki ga je en krog porabil več kot drugi med dvema točkama mreže, je razlika njunih delt: `rel(s)`. Vse spodaj temelji na tem.

## Ovinki {#corners}

Najdeni na **referenci** (`findCorners`), z njeno hitrostjo, zglajeno čez ±6 m, in njeno ukrivljenostjo (sprememba smeri čez ±5 vzorcev, zglajena čez ±10 m):

1. **Najmanjše hitrosti z izstopanjem.** Točka, ki je najnižja znotraj ±40 m, katere padec z najvišje hitrosti na vsaki strani (preden pride nižji minimum) je vsaj `max(2,5 m/s, 6 % hitrosti)`.
2. **Zavoji.** Lokalni vrh ukrivljenosti, ožji od polmera **300 m**, brez najmanjše hitrosti v 80 m: zavoj, ki gre z drsnim plinom, je še vedno ovinek za vožnjo.
3. **Faze.** Od vsakega vrha nazaj, dokler referenca zavira (> 0,1) ali ni na polnem plinu (< 0,95): vstop; naprej, dokler ni na polnem plinu: izhod. Zavoj, prevožen ravno, dobi ±30 m. Prekrivajoči se ovinki ostanejo ločeni, vendar so razporejeni, da pokrivajo krog.
4. Oštevilčeni T1, T2 … po vrstnem redu kroga; **levo ali desno** po predznaku ukrivljenosti in tem, ali je svet zrcaljen (neznano se šteje kot zrcaljeno).

**Okno ovinka** (kjer se referenca zavija): ven od najožje točke znotraj ±40 m od vrha, dokler ukrivljenost ostaja nad eno šestino svojega vrha, plus 10 m na vsako stran. Njegova stran da predznak za "znotraj".

## Odseki: od cone zaviranja do cone zaviranja {#segments-braking-zone-to-braking-zone}

Vsak ovinek obsega cesto do polovice poti do vrhov na obeh straneh. V njej:

- **Najpočasnejša točka vsakega kroga** je pravi padec hitrosti – nič počasnejšega v 6 m (3 točke mreže) na vsaki strani, pri čemer se gleda čez konce odseka, tako da izhod prejšnjega ovinka, ki še pospešuje vanj, nikoli ni zamenjan zanjo – iskana od 15 m pred oknom ovinka do 10 m za njim. Krog, ki tam ni nikoli upočasnil, je postavljen na vrh.
- **Kje je krog začel upočasnjevati zanj** (`entryOf`): nazaj od njegove najpočasnejše točke skozi zaviranje ali odjem, čez kratke sunke polnega plina, dokler ni imel noge dol (plin ≥ 0,95, zavora ≤ 0,1) **10 m**; plin, ki je bil spet dodan v zadnjih **30 m** pred najpočasnejšo točko, še vedno pripada ovinku; ves čas na polnem plinu, sama najpočasnejša točka. Krog brez kanala za plin ali ki od prejšnjega ovinka nikoli ni imel noge dol, se začne na svoji najhitrejši točki vmes.
- **Odsek se začne** pri prvem od vseh krogov, ki začne upočasnjevati zanj (4 m prej), in teče do začetka naslednjega, tako da je vsako zaviranje vsakega kroga znotraj njega in odseki pokrijejo krog.

**Skupine.** Zaporedni ovinki, med katerimi referenca nikoli ne vozi na polnem plinu – manj kot **40 m** polnega plina – so en odsek, "T11-T12", voženi kot enota; skupina ima največ **tri** ovinke (kvrgav odsek, ki se nikoli ne vozi ravno, začne novo). Skupina, ki se zavija na obe strani, je *mešana*: zanjo se ne meri nobena oblika linije.

**Na krogu** (referenca se konča znotraj 50 m od kraja, kjer se je začela) se ravnina zadnjega odseka nadaljuje čez črto do prve točke zaviranja: vožnja leteče kroga od črte se šteje k zadnjemu ovinku. Krog, ki se je začel iz mirovanja ali z zagonom na štartu (glej [Štart](#the-start)), to vožnjo ohrani ločeno.

### Kam vodi ovinek {#what-a-corner-leads-onto}
Meri se na referenci: metri pri polnem plinu za ovinkom (od njegovega polnega plina do konca odseka, plus vožnja čez črto) in pred njim ("za" prejšnjega odseka ali od začetka).

| Vrsta | Pravilo |
|---|---|
| **med dvema ravninama** (`both`) | 200 m ali več pred **in** 120 m ali več za |
| **na ravnino** | 200 m ali več za, ali 120 m ali več za in vsaj toliko kot pred |
| **za ravnino** | 200 m ali več pred |
| **povezava** | vse drugo |

## Kaj je vsak krog storil v ovinku {#what-each-lap-did-in-a-corner}

`cornerMetrics`, na krog in odsek, na mreži (korak 2 m). Pedala: zavora se šteje nad 0,1, polni plin je 0,95 in več.

| Meritev | Pravilo |
|---|---|
| **točka zaviranja** | prva zavora, pod katero je plin odjenjal (pod 0,5), ali ki je trajala **15 m** – rahel dotik leve noge z vklopljeno močjo ni tam, kjer se je začelo zaviranje; ob samih dotikih prvi dotik |
| **odjem** | brez zaviranja, prva točka, kjer je plin padel pod 0,8 |
| (brez pedal) | točka, kjer je krog začel upočasnjevati (zgoraj) |
| **sprostitev zavore** | zadnja zavora do 30 m za najpočasnejšo točko |
| **hitrost pri točki zaviranja**, **metri zaviranja** | do najpočasnejše točke |
| **največja zavora**, **največja upočasnitev** | čez cono zaviranja (pospeški nad 45 m/s² se zavržejo) |
| **zaviranje z drsenjem** | metri z zavoro > 0,05 in |krmilo| > 0,1 |
| **zdrs pri blokadi** | najbolj negativno razmerje zdrsa kolesa v coni (kadar krog nosi zdrs) |
| **najpočasnejša točka**, **najmanjša hitrost** | kot zgoraj |
| **plin vklopljen** | po sprostitvi (ali najpočasnejši točki) prvi plin > 0,15 brez zavore |
| **polni plin** | prva točka za tem, ki se je držala ≥ 0,95 za 10 m |
| **kotaljenje** | metri od sprostitve do vklopljenega plina z zavoro in plinom pod 0,05 |
| **padci plina** | kolikokrat je plin padel za več kot 0,25 pod svoj tekoči vrh med vklopom plina in polnim plinom |
| **največja bočna sila** | največji bočni pospešek od 20 m pred sprostitvijo do poznejšega od polnega plina in 20 m za najpočasnejšo točko |
| **prestava pri vrhu** | pri najpočasnejši točki |
| **zdrs pri pogonu** | največje razmerje zdrsa gonilnega kolesa med vklopom plina in polnim plinom |
| **ravnotežje** | sprednji minus zadnji zdrsni kot skozi sredino (+ podkrmiljenje) |
| **ravnina pri polnem plinu** | delež odseka po polnem plinu (in vožnje čez črto) pri ≥ 0,95; največji odjem na njej |
| **odnesena hitrost** | največja izguba hitrosti z visoke točke pri plinu ≥ 0,9, brez zavore, na podlagi |
| **vstopni drift** | največji kot drifta od točke zaviranja do 5 m za najpočasnejšo točko, na podlagi |
| **ročna zavora** | kjer se je vklopila (> 0,2), do 10 m za najpočasnejšo točko |
| **zrak** | sekunde v zraku čez odsek in njegov najdaljši let |

## S kom se vsak krog primerja {#who-each-lap-is-compared-with}

- Krog se primerja z **najhitrejšim popolnim krogom lastnega razreda zmogljivosti** (referenca, v razredu reference).
- Ta najboljši krog razreda sam (in referenca) se primerja, odsek za odsekom, z **katerim koli drugim krogom razreda, ki je bil skozenj najhitrejši** – ali z vsemi krogi, kadar je sam v svojem razredu.

Časovni zemljevid, razlike v seznamu krogov, dogodki nadzora avta in tabela ovinkov sledijo isti primerjavi.

## Časovni račun ovinka {#the-time-account-of-a-corner}

`compareCorner`, za krog proti drugemu čez odsek:

- **neto** = `rel(konec) - rel(začetek)` (plus vožnja čez črto na letečem krogu): sodba. Bližje kot **0,03 s** je **izenačeno**.
- **Razdelitev** – kje v ovinku je vodilni zavil: na odseku od prve točke zaviranja ali najpočasnejše točke katerega koli kroga do poznejše od njunih točk polnega plina in najpočasnejše točke, največji nihaj, ki ga je krog nato vrnil ali nadoknadil, kadar je ta nihaj nad **0,04 s**; sicer poznejša od obeh najpočasnejših točk.
- **Do vrha** = `rel(razdelitev) - rel(začetek)`; **po njem** = neto minus to. Kadar sta oba vsaj 0,04 s in nasprotnega predznaka, je krog **zamenjal** enega za drugega.
- **Po njem** se spet razdeli tam, kjer sta oba krogi na polnem plinu: **izhod** (razdelitev do poznejšega polnega plina) in **ravnina** (od tam do konca).
- **Ravnina** se razdeli na tri dele:
  - *hitrost ob izhodu* (`byExit`) – izmerjena, ne modelirana: počasnejši avto prehiti začetno hitrost hitrejšega avta malo po ravnini, od tam dalje je njegova lastna sled tisto, kar bi naredil od te hitrosti, z vsemi svojimi prestavami, uporom in naklonom vred. Premaknjena nazaj do te točke (in vožena naprej s končno hitrostjo za metre, ki jih pridobi) je to njegov čas od hitrejšega začetka; razlika je strošek hitrosti ob izhodu. Kadar počasnejši avto te hitrosti nikoli ne doseže (ali le v zadnjih 2 vzorcih), se njegovo lastno pospeševanje po odseku vrne kot moč (`a·v` ohranjeno), nikoli močneje, kot kaže njegova ovojnica pri tej hitrosti (dvakrat izmerjeni pospešek brez ovojnice).
  - *moč avtov* (`byPower`) – samo pri različnih avtih: oba avta od iste hitrosti na istih metrih, na polnem plinu, z integriranjem polnega pospeška, ki ga je vsak pokazal pri vsaki hitrosti.
  - *kako je bila vožena* (`driven`) – ostalo: odjem, odnesena hitrost pri polnem plinu.

  Hitrost ob izhodu nikoli ne pojasni več kot strošek ravnine (in nikoli z nasprotnim predznakom), razen če je odjem ali odnesena hitrost kaj vzela nazaj. Krog je na ravnini **odjemal**, kadar je njegov delež pri polnem plinu pod obema vrednostma 0,9 in deležem drugega minus 0,05. Odnesena hitrost šteje, kadar se oba razlikujeta za več kot 1 m/s. Nesoglasje pod 0,02 s v predznaku je nastavljeno na 0.

Neto vsakega odseka se sešteje v razliko časa kroga, do vrha in po njem vsakega ovinka pa v neto tega ovinka (preverjajo to testi).

### Delež avta {#the-cars-share}

Samo kadar so krogi v **različnih avtih** in je krog izgubil čas (`carShare`):

- **moč**: moč avtov po ravnini (zgoraj), do izgube;
- **oprijem**: kadar je bil krog na meji svojega avta (bočni pospešek sredi ovinka vsaj **90 %** tega, kar avto drži pri tej hitrosti) in drugi avto drži več kot **5 %** več: od nižje najmanjše hitrosti, ki je ni pojasnil ožji polmer, delež `½ ln(oprijem_drugi / oprijem_moj) / ln(v_drugi / v_moj)` preostale izgube;
- **zavore**: kadar je krog zaviral (ni odjemal), drugi avto zavira za več kot **5 %** močneje, in je bila povprečna upočasnitev kroga čez cono vsaj **80 %** tega, kar avto zmore: od `u` do `v` pri `a1` proti `a2`, s koncem na isti točki, `(1/a1 - 1/a2)(u - v)² / 2u`, do tistega, kar ostane.

Strošek avta je vsota, največ do izgube.

## Sodba in ugotovitev {#the-verdict-and-the-finding}

`cornerFinding` zapiše največ eno ugotovitev na krog in ovinek, preizkušeno v tem vrstnem redu:

| Primer | Ugotovitev | Izid |
|---|---|---|
| neto v ±0,03 s, zamenjava, manjša stran ≥ **0,1 s** | **izenačeno, dve poti** – kdo je bil počasen vstopno in hiter izstopno, kdo obratno; s ravnino za njim (na ravnino ali med dvema) je pot počasen vstop, hiter izhod tista, na kateri se gradi: ohrani njen zgodnji plin, vrni vstop z močnejšim zaviranjem, ne z poznejšim | izenačeno |
| neto v ±0,03 s sicer | nič ne pove | - |
| pridobljeno, zamenjava, izgubljeno do vrha | **počasi noter, hitro ven se je izplačalo**: ohrani, tu je izhod vreden več | pridobitev |
| pridobljeno, zamenjava, pridobljeno do vrha | **hitreje pri vhodu**: vstop je pravilen, zgodnejši polni plin bi ohranil več | pridobitev |
| pridobljeno, drugi krog tu izgublja | **hitreje – zaradi tega, kar je naredil drugi**, njegov vzrok in nasvet pravita "Za drugi krog: …" | pridobitev |
| pridobljeno sicer | **hitreje pri vstopu / izstopu**, glede na to, katera polovica je pridobila več (pozneje zavirati, več hitrosti skozi sredino; ali prej ravno, močnejša moč) | pridobitev |
| izgubljeno, in **zadetek ali trk** stane vsaj `max(0,05 s, 40 % izgube)` | udarec je zgodba ovinka, pred avtoma | izguba |
| izgubljeno, in **delež avta** je 60 % ali več | **avto**: njegova moč po ravnini, njegov oprijem skozi sredino ali njegove zavore – največji del; z delom voznika (≥ 0,03 s), rečenim kot "Drugi X s: …" | izguba |
| izgubljeno, in ena nedeljena **napaka pri nadzoru avta** stane vsaj `max(0,05 s, 40 %)` | ta napaka (glej spodaj), s tem, kako se je čas premaknil okoli nje | izguba |
| izgubljeno, in **daljši let** stane vsaj `max(0,05 s, 40 %)` | let | izguba |
| izgubljeno, zamenjava, pridobljeno do vrha | **preveč hitro noter, počasi ven**: vzrok izhoda; žrtvuj nekaj vstopa, da se hitreje obrneš in prej ravno, z točkami zaviranja in polnega plina drugega kroga. Njegov koren (`cause`, kar štejejo [statistike](race-course-statistics.md)): pozneje zaviranje, kadar je zaviral nekaj metrov pozneje kot drugi; sicer vzrok izhoda | izguba |
| izgubljeno, zamenjava, izgubljeno do vrha | **dal je več pri vstopu, kot je izhod vrnil**: vzrok vstopa, ki je hkrati njegov koren (`cause`); obdrži izhod, izgubi manj pri vstopu | izguba |
| izgubljeno, odjem na ravnini in vožena polovica čez polovico izgube | **na ravnini ni na polnem plinu**: delež pri polnem plinu v primerjavi z drugim, kje in kako dolgo je bil odjem | izguba |
| izgubljeno, moč avtov nad 60 % izgube in ravnina nad polovico | **moč avta po ravnini** (z močjo obeh avtov pri 160 km/h) | izguba |
| izgubljeno sicer | vzrok polovice, ki je izgubila več (do vrha ≥ po njem: vstopni; sicer izhodni). Počasnejši na izhodu samo zato, ker je bil počasnejši skozi sredino (za več kot 1 m/s): namesto tega vzrok sredine | izguba |

Ugotovitev o izgubi se lahko konča tudi z **Tudi:** – odnesena hitrost pri polnem plinu ali odjem na ravnini – kadar je vožena polovica ravnine stala več kot 0,04 s in to ni bil že vzrok.

Ugotovitve so urejene: najprej izgube, najdražje najprej; nato pridobitve in izenačeni ovinki.

### Vzroki pri vstopu {#causes-on-the-way-in}

`entryCause`, prvi, ki velja (razlike v najmanjši hitrosti so v m/s; "5 m" je prag, da se zgodnejša ali poznejša točka šteje):

| # | Vzrok (napaka) | Pravilo |
|---|---|---|
| 1 | zadetek ali trk pri vstopu | nedeljen udarec, ki se začne do 10 m za najpočasnejšo točko |
| 2 | **skoraj ustavljen** (incident) | najpočasnejša hitrost pod **60 %** tega, kar oprijem tega avta dovoljuje tam, kjer je šel drugi skozi (`v_drugi · √(oprijem_moj / oprijem_drugi)`, kadar drugi avto drži več, sicer hitrost drugega), drugi krog nad 8 m/s – zdrs, stik ali zgrešen ovinek |
| 3 | napaka pri nadzoru avta pri vstopu | nedeljena blokada, potisk, zdrs ali drsenje brez plina, ki se začne do 10 m za najpočasnejšo točko, strošek ≥ 0,02 s |
| 4 | daljši let pred najpočasnejšo točko | glej [reli](#rally-rotation-and-flights) |
| 5 | **odjem**, kjer je drugi ostal na plinu ali odjemal 5 m ali več pozneje | ta krog je samo odjemal |
| 6 | **zaviral, kjer je drugi samo odjemal** ali ostal na plinu | in je bil skozi sredino več kot 0,5 m/s počasnejši |
| 7 | **zaviral nežno** | zaviral (ni odjemal), je imel prostor za močnejše zaviranje – s podatki o pnevmatikah, njegov zdrs pri blokadi pod **60 %** zdrsa, pri katerem dajejo zavore tega avta svoj najboljši rezultat; brez njih, največja upočasnitev pod **85 %** tega, kar kaže pri tej hitrosti – pedal pod 0,95 in največja upočasnitev drugega kroga za več kot **15 %** višja |
| 8 | **zaviral zgodaj** – ali **zavore avta** | zaviral za več kot 5 m pred drugim. V drugem avtu, katerega zavore so za več kot 5 % močnejše, in z največ 10 m rezerve glede na razdaljo, ki jo ta avto potrebuje pri svoji upočasnitvi: zavore avta. Sicer zaviral zgodaj, z "Zavirati pozneje – približno N m" (v drugem avtu, metri več, kot jih potrebuje) |
| 9 | **kotalil** | več kot 10 m brez nobene pedala, in 5 m več kot drugi |
| 10 | **počasnejši skozi sredino** | več kot 0,5 m/s počasnejši v najpočasnejši točki; razdeljeno z `v² = a·R` (spodaj) |
| 11 | **prišel počasneje** | za več kot 1 m/s počasnejši pri točki zaviranja, ni zaviral zgodaj: odločeno že prej – s prejšnjim ovinkom in močjo avta ali z letom v prejšnjem ovinku, ki je bil 0,2 s daljši. Avto, kadar se avti razlikujejo |
| 12 | počasnejši do vrha | sicer: bolj gladko sprostiti zavoro in v sredino prinesti več hitrosti |

**Počasnejši skozi sredino** (`middleSplit`): polmer vsakega kroga na njegovi najpočasnejši točki se izmeri iz njegove lastne poti (±8 m), njegov bočni pospešek kot `v²/R`, in

`ln(v_drugi / v_moj) = ½ ln(a_drugi / a_moj) + ½ ln(R_drugi / R_moj)`.

- Polmer pojasni **polovico ali več**: **preozka linija** – "izkoristi več ceste", z obema polmeroma in deležem.
- Na meji avta (drsenje čez 10° drifta na asfaltu / 20° na rahli podlagi, ali bočni pospešek vsaj 90 % tega, kar avto drži pri tej hitrosti) in drugi avto drži več kot 5 % več: **oprijem avta**; raje zaščiti izhod.
- Drsenje skozenj (drift čez 10° / 20°), drugi krog pa ni (njegov vstopni drift vsaj 4° manjši): **na stran** – čez svoj oprijem, ne pod njim; prispe malo počasneje. Pove se kot avtov, kadar ta avto ujame zadek vsaj enkrat na krog bolj kot drugi.
- V drugem avtu, ki drži pod **96 %** oprijema drugega, in krog je nesel v 1 m/s od `v_drugi · √(oprijem_moj / oprijem_drugi)`: **oprijem avta** – "zaviranje pozneje tega ne bo nadoknadilo".
- Sicer **oprijem na pretek**: bočni pospešek v primerjavi z drugim pri podobnem polmeru in tem, kar ta avto drži; nesi več hitrosti do vrha. Kjer zadek tega avta popusti, preden je oprijem porabljen (njegovi zdrsi se začnejo pod 85 % oprijema, krog pa je bil pri 80 % tega), išči preostanek v majhnih korakih.

### Vzroki pri izhodu {#causes-on-the-way-out}

`exitCause`, prvi, ki velja:

| # | Vzrok (napaka) | Pravilo |
|---|---|---|
| 1 | napaka pri nadzoru avta pri izhodu | nedeljeno prostotek, zavrtenje, zdrs ali udarec, ki se konča ob ali po 10 m pred najpočasnejšo točko |
| 2 | **odnesena hitrost** | več kot 1 m/s več hitrosti izgubljene pri polnem plinu kot drugi; nad **7 m/s (25 km/h)** "bolj kot zdrs spominja na stik ali zavrtenje" |
| 3 | **avto zasukal narobe** (rahla podlaga) | glej [reli](#rally-rotation-and-flights) |
| 4 | **na plinu pozneje** | vklop plina več kot 5 m pozneje, šteto tudi od najpočasnejše točke vsakega kroga (krogu, ki je najpočasnejši pozneje, se ne očita poznejši plin) |
| 5 | **oklevanje s plinom** | več padcev plina kot drugi |
| 6 | **zapeljal preširoko in čakal** | več kot 1,5 m zunaj drugega, kjer sta bila oba ravna, in polni plin več kot 5 m pozneje od lastne najpočasnejše točke |
| 7 | **poln plin pozneje** | polni plin več kot 5 m pozneje, tudi od lastne najpočasnejše točke; z pospeškom avta tam |
| 8 | **pogon avta** | v drugem avtu, ki pri tej hitrosti vleče manj kot 95 % drugega, in moč je pojasnila nekaj ravnine |
| 9 | **počasneje iz ovinka** | sicer: pozneje vrh, zato je avto prej ravno |

Kadar sta bila kroga pri najpočasnejši točki v različnih prestavah, se nasvet konča z "Prestava N pri vrhu; drugi je uporabil M."

### Napake pri nadzoru avta in udarci {#car-control-faults-and-impacts}

Napaka iz [Dogodki nadzora avta](race-control-events.md) kot vzrok: blokada je vzrok *zaviranja*, prostotek ali zdrs na plinu vzrok *izhoda*, ostalo *vstopa*; udarec po najpočasnejši točki je *izhod*, pred njo *vstop*. Nasvet je dogodkov lastni, nato "Stalo je približno X s do 40 m za njim" (ali "do trenutka, ko je avto spet dobil hitrost", pri udarcu). Blokada s točko zaviranja več kot 5 m prej kot pri drugem doda, da je krog zaviral tudi zgodaj – s kolesi, ki se vrtijo, tega ne bi bilo treba.

### Reli: zasuk in leti {#rally-rotation-and-flights}

Na **rahli podlagi**, z zdrsnimi koti na obeh krogih, in ta krog je na plinu (ali ravno) več kot 5 m pozneje:

- **Avto je zasukal manj**: drugi je imel avto zasukan **12°** ali več do svoje najpočasnejše točke in vsaj **8°** več kot ta krog. Nasvet: odjem ali dotik leve noge na zavori, ko se zavija vanj, s točko ročne zavore drugega kroga, kadar jo je uporabil samo on, ali ročno zavoro v ovinku, počasnejšem od 15 m/s (54 km/h).
- **Zasukal ga je preveč**: ta krog ga je imel zasukanega za 12° ali več in vsaj za **12°** več kot drugi: moral ga je poravnati, preden je lahko šel plin dol.

**Daljši let**: v zraku 0,2 s ali več dlje kot drugi, stane vsaj 0,03 s od 10 m pred vzletom do 40 m po pristanku (ali konca odseka). Pred najpočasnejšo točko je vzrok vstopa; postane zgodba ovinka, kadar pojasni 40 % ali več. Nasvet: ohrani plin ob vzletu, greben vzemi malo počasneje ali z rahlim dotikom zavore.

### Štart {#the-start}

Pred prvim ovinkom, na sprintu ali kadar je kateri koli krog začel iz mirovanja (pod 5 m/s, kjer sta oba prva na osi) ali na štartu dirke (pod 60 % hitrosti drugega), je vožnja do prve točke zaviranja samostojna ugotovitev (ovinek 0), kadar se razlikuje za več kot 0,03 s: *Štart*, *Štart dirke* ali *Do prvega ovinka*. Izguba tam se pripiše okoliščinam (*okoliščine*), kadar je en krog začel na štartu dirke in drugi v hitrosti, avtu, kadar so krogi v različnih avtih, in sicer vozniku. Nasveti: v drugem avtu iz mirovanja "večinoma avto"; zagon na mestu v istem avtu – speljati z manj prostotka in prestavljati na vrhu moči; štart dirke – primerjaj z drugim prvim krogom; leteči štart – boljši izhod iz zadnjega ovinka se prenese čez črto.

## Vožena linija {#the-driven-line}

`lineMetrics`, na krog in odsek (ne za mešane skupine), samo iz položajev (zglajeno ±2 vzorca) čez okno ovinka:

| Meritev | Pravilo |
|---|---|
| ukrivljenost | sprememba smeri čez ±8 m lastne poti kroga |
| **najožji polmer** | 1 / največja ukrivljenost |
| **vstop v zavoj** / **izstop iz zavoja** | kje ukrivljenost prvič / zadnjič preseže petino svojega vrha |
| **sredina** | kjer je krog zavil polovico svoje spremembe smeri |
| polmer pri vstopu / izstopu | metri, vožene čez polovico spremembe smeri, pred / po sredini |
| **oblika** | najožji polmer proti povprečnemu polmeru med zavijanjem: pod **0,55** **V**, nad **0,75** **U**, vmes "U/V" |
| **vrh** | polmer pri izhodu proti polmeru pri vstopu: nad **1,25** pozen, pod **0,8** zgoden, sicer sredina |
| **hitrostni vrh** | najpočasnejša točka več kot **15 m** pred sredino: počasi noter, hitro ven; več kot 15 m za njo: še vedno upočasnjuje čez sredino |

Proti drugemu krogu: kako daleč znotraj (+) ali zunaj je tekel pri vstopu v zavoj, skozi najožji del in tam, kjer sta bila oba ravna (povedano od 1 m); kje je vsak vstopil v zavoj (povedano od 8 m).

### Katera linija ustreza temu avtu tukaj {#which-line-suits-this-car-here}

`lineFor`, iz tega, kam ovinek vodi, in značaja avta pri tem ovinku:

- **razmerje moč proti oprijemu** = pospešek avta pri polnem plinu pri hitrosti ob izhodu, deljen z njegovim oprijemom pri najmanjši hitrosti (iz njegove ovojnice). **Point and shoot** pri **0,45** in več; **momentum** pri **0,25** in manj.
- **pritisna sila**: oprijem pri 151–252 km/h, deljen z oprijemom pri 54–108 km/h, **1,15** ali več, za ovinek, prevožen pri **144 km/h** (40 m/s) ali hitreje – takrat je momentum ovinek ne glede na moč. Na rahli podlagi se ne ocenjuje.

| Vrsta ovinka | Avto | Linija |
|---|---|---|
| za ravnino | point and shoot / drugo | V / U, vrh na sredini: "cona zaviranja je nagrada" |
| med dvema ravninama | momentum / drugo | U / V, pozen vrh |
| povezava | momentum / drugo | U / V, vrh na sredini: "pelji ga za izhod naslednjega" |
| na ravnino | momentum (ali hiter ovinek s pritisno silo) | širok zaokrožen U, malo pozen vrh |
| na ravnino | point and shoot | V: zavirati naravnost, zavijati pozno, zavrteti v kratki ostri sredini, na ravnini zgodaj |
| na ravnino | vmes | U s poznim vrhom: počasi noter, hitro ven |

Kjer je pomemben izhod (na ravnino, med dvema), pogon doda stavek: **FWD** – zavrteti na zavorah, moč dodati šele, ko se kolo odvija; **RWD** z razmerjem moč proti oprijemu 0,35 ali več – poravnati pred polnim plinom; **AWD** – lahko prenese moč, medtem ko se še zavija. Na rahli podlagi vsaka linija doda: zasukaj avto ob vstopu.

Stavek potem pove, kaj je krog vozil, in ali ustreza: *najpočasnejši pozno zaveže izhod* ali *zgodnji vrh zaveže izhod*, kjer je bil želen pozen vrh in krog ni imel poznega vrha in ni bil zgodaj najpočasnejši; *bolj okrogel, kot ta avto želi*, kjer je bil želen V; *bolj oglat, kot ta avto želi*, kjer je bil želen U; sicer *to ustreza*.

## Za razvijalce {#for-developers}

Koda: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Razmislek in njegovi viri: [metoda](race-analytics.md).
