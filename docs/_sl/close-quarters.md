---
title: "Boj z bližine in krogi"
parent: "Vpogledi"
nav_order: 2
lang: "sl"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Boj od blizu in runde

Za strelske igre na runde (najprej Counter-Strike, vsi podatki z rundami, stranmi in ubitimi) Ugotovitve izmerijo, kako so bili boji dobljeni: kdo je dobil uvodne dvoboje in koliko so bili vredni, ali so bile smrti zamenjane, ali je igralec, ki je pokukal v kot, premagal tistega, ki ga drži, ali so se križni ognji in bliski obrestovali, kako so se kvote runde spreminjale z vsakim kill-om in katera vrata so ubila igralce, ki so vstopali vanje. Uporabite ga, da vidite, zakaj so bile runde dobljene, ne samo kdo je dobil kille.

Meritve izhajajo iz doktrine čiščenja sob in urbanega boja (usodni lijak, točke prevlade, križni ogenj) ter iz e-športa in športne analitike (verjetnost zmage, vrednost dejanj, prilagojeni plus-minus). Vsako je prebrano skozi [lečo znanja](knowledge.md) in navedeno.

## Poskusite {#try-it}

1. Naložite eno ali več tekem z rundami (pretvorba CS2 ima vse, kar potrebuje).
2. Odprite **Ugotovitve** in pritisnite **Poišči ugotovitve**.
3. Pod **Meritve leče** preberite vrstice od *Verjetnost zmage v rundi* do *Vpliv igralca*; vsaka ima svoje številke, 95-odstotni interval, svojo q vrednost in vire, ki jim sledi.
4. Izberite lečo **E-šport** ali **Urbani boj**, da jih preberete skozi to literaturo; **Napiši z AI** jih pošlje s poročilom.

## Kaj meri {#what-it-measures}

| Meritev | Kaj pove | Kako |
|---|---|---|
| Verjetnost zmage v rundi | Kako verjetno je bilo, da bo vsaka stran zmagala v rundi v vsakem trenutku | Logistična regresija na igralce, živeče na vsaki strani, bombo ali cilj in njegov čas, uro runde in nakup, prilagojena naloženim podatkom; kalibracija preverjena izven zavihka po rundah (Brierjev rezultat in spretnost, logaritemska izguba, napaka kalibracije na desetih predalih, naklon rekalibracije, AUC) |
| Vrednost dejanj | Koliko je kill, uvodni kill, menjava, kill za bliskom, postavitev bombe ali bliskavica spremenila možnost strani, da zmaga | Verjetnost zmage po minus pred; menjave, uvodni in kille z bliskom preizkušeni proti drugim killom s permutacijo |
| Uvodni dvoboji | Katera stran dobi prvi dvoboj, kako pogosto to zmaga rundo in kje ena stran dobi uvode daleč nad svojim povprečjem | Wilsonovi intervali; mesta z natančnim binomskim preizkusom proti deležu strani, q čez mesta |
| Menjave | Smrti, na katere odgovori kill soigralca nad ubijalcem v 5 s, čas, ki ga je to vzelo, in runde, dobljene, ko je bila prva smrt zamenjana | Fisherjev natančni test, Newcombov interval |
| Igralec, ki pokuka, proti tistemu, ki drži | Dvoboji, kjer se je en igralec premaknil v boj (1,5 m/s ali več v zadnji sekundi), drugi pa je stal (0,75 m/s ali manj): delež tistega, ki je pokukal | Natančni binomski test proti polovici |
| Tarnost pred dvobojem | Pogled vsakega igralca proti smeri drugega 0,75 s pred killom; kdo je bil bolje tarnan in kako pogosto je ta igralec zmagal; držalci na svojem kotu (znotraj 15°) proti tistim izven njega; dosegi kilov | Natančni binomski test; Fisher |
| Križni ogenj | Držalci z mirujočim soigralcem v 25 m od igralca, ki pokuka, katerega črta do njega je 35° ali več od njihove lastne, proti držalcem samim | Fisher, Newcombe |
| Pripomočki v vstopih | Igralci, ki pokukajo za bliskom svoje strani (v 3 s in 15 m) ali za dimom (v 18 s), proti suhim pokukom; uvodni dvoboji z bliskom samo na eni strani; oslepljene žrtve | Fisher, binomski |
| Prednost v številu | Za vsako stanje živih igralcev (5v4, 4v5, 2v1 ...), prvič doseženo v rundi, delež rund, dobljenih iz njega | Wilsonovi intervali |
| Zaključni boji | Runde, kjer je stran prišla do zadnjega igralca: zmage v primerjavi s pričakovanimi zmagami modela, po številu nasprotnikov | Normalni test opazovanega proti pričakovanemu |
| Skladanja, rotacije, prežanje | Največja skupina znotraj 10 m ob uvodnem dvoboju (3 ali več: nakopičeno); igralci več kot 30 m od prvega boja ali postavljenega cilja in kako hitro pridejo znotraj 12 m; čas in kvote ubojev proti smrtim več kot 30 m od vsakega soigralca | Fisher; razmerje kvot z Woolfovim intervalom |
| Po postavitvi in obnovi | Runde, ki jih je dobila stran, ki je postavila bombo, glede na številke ob postavitvi, in njen delež dvobojev po postavitvi | Wilsonovi intervali |
| Usodni lijaki | Vstopi na vsako mesto (sprememba stolpca mesta, sicer celica 8 m) in smrti znotraj 2,5 s od vstopa, proti stopnji zemljevida | Natančni binomski test, q čez mesta; razmerje skrčeno z 20 vstopi po stopnji zemljevida |
| Vpliv igralca | Verjetnost zmage, dodana na rundo s strani vsakega igralca (kill, smrt, postavitev), skrčena z empiričnim Bayesom; prilagojen plus-minus grebena rezultatov rund proti začetku modela; vrednost kilov po mestu in orožju, skrčena | Kazen izbrana s petkratnim navzkrižnim preverjanjem |

Vsi preizkusi ene analize delijo eno stopnjo lažnih odkritij (Benjamini-Hochberg), vštevši vsa preizkušena mesta, ne samo prikazanih; prikazana q vrednost je čez vsa. Model in njegova kalibracija sta prilagojena naloženim podatkom, zato opisujeta to populacijo: profesionalni model napačno presoja igro za zabavo in obratno.

Preverjeno na sintetičnih rundah z vnesenimi učinki (prednost igralca, ki pokuka, križni ognji, bliski, en usodni lijak, boljša tarnost, ki zmaga), in na 100 naborih istih rund brez njih, kjer mora stopnja lažnih odkritij preizkusov z vnesenim učinkom ostati pri nazivnih 5 % (v pasu) (`src/insights/cqb/cqb.test.ts`); na približno tisoč pravih rundah je model dosegel Brierjev rezultat 0,14 proti 0,25 za osnovno stopnjo, napako kalibracije 0,03 in naklon rekalibracije 1,0.

## Podatki, ki jih potrebuje {#data-it-needs}

- stolpci **čas**, **igralec**, **stran** in **runda** (seja), ter killi in smrti v stolpcu dogodkov; runde, kjer nihče ne umre dvakrat, se obravnavajo kot runde izločanja (prednost v številu, zaključni boji in model jih potrebujejo);
- stolpec **druga stranka** (`other`, `victim`, `killer`, `attacker`), ki pri killu imenuje žrtev, pri smrti pa ubijalca (brez njega se killi in smrti v istem trenutku povežejo v pare);
- **smer pogleda** za meritve tarnosti;
- surov stolpec `event`, ki imenuje `flash`, `smoke`, `he`, `molotov`, `plant` in `defuse` za pripomočke in postavitve;
- `won` (stran vrstice je zmagala v rundi), `place` (klici), `weapon`, `buy` in `state_flashed`, kjer jih podatki imajo.

Položaje je treba vzorčiti večkrat na sekundo; hitrosti, tarnost in križni ognji se preberejo iz zadnjih dveh sekund pred vsako smrtjo.

## V razčlenitvi {#in-the-breakdown}

[Razčlenitev](breakdown.md) meri štiri situacije kot dejavnike, z in brez: *oslepljen*, *smrt zamenjana*, *uvodni dvoboj* in številke (*človek več*, *enaka števila*, *človek manj*), vsako pri K/D, rundah, dobljenih, preživetju in killih na minuto.

## Mnogo tekem {#many-matches}

Vsak povzetek tekme [analize mnogih tekem](mass-analysis.md) podatkov s stolpcem runde nosi iste meritve kot števila (`cqb` v povzetku): uvodne dvoboje, menjave, pokukanja, križne ognje, vstope z bliskom, tarnost, prednost v številu, postavitve in 40 najbolj vstopanih mest z njihovimi vstopi in smrtmi. Števila se seštevajo čez tekme, tako da tisoč tekem da iste deleže kot ena velika analiza. Zavihek **Boj od blizu** plošče prikaže te kot deleže z njihovimi intervali, čez vse zemljevide ali po zemljevidu; klik na vrstico naloži tekme, iz katerih izhaja.

## Za razvijalce {#for-developers}

`src/insights/cqb/`: `walk.ts` (en prehod čez vrstice po času, runde ločene, dvoboji zabeleženi s svojim stanjem), `finish.ts` (meritve in števila po tekmi), `model.ts` (logistična regresija z IRLS, kalibracija, greben s konjugiranimi gradienti, empirični Bayes, Fisher, Newcombe, permutacijski testi), `run.ts` in `worker.ts` (pregledovalnik: lasten delavec, poleg prehoda ugotovitev), `summary.ts` (zbiralnik povzetka mnogih tekem), `factors.ts` (situacije razčlenitve), `shows.ts` (kar bere leča), `synth.ts` (testne runde). Vnosi znanja so v `src/insights/knowledge/cqb.ts`, vzorci v `patterns-cqb.ts`. Rezultati gredo v poročilo kot `lens.cqb`.
