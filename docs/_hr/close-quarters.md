---
title: "Borba iz blizine i krugovi"
parent: "Uvidi"
nav_order: 2
lang: "hr"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Borba iz blizine i krugovi

Za pucačine po rundama (Counter-Strike prvi, svaki podatak s rundama, stranama i ubojstvima), Uvidi mjere kako su borbe dobivene: tko je uzeo uvodne dvoboje i koliko su vrijedili, jesu li smrti zamijenjene, je li igrač koji je provirivao u kut pobijedio onoga koji ga je držao, jesu li se unakrsne vatre i bljeskalice isplatile, kako su se kvote runde mijenjale s svakim ubojstvom i koja su vrata ubijala igrače koji su ulazili. Koristite to da vidite zašto su runde dobivene, a ne samo tko je imao ubojstva.

Mjere dolaze iz doktrine čišćenja prostorija i urbanog ratovanja (fatalna lijevka, točke dominacije, unakrsna vatra) te iz analitike e-sporta i sporta (vjerojatnost pobjede, vrijednost akcija, prilagođeni plus-minus). Svaka se čita kroz [leću znanja](knowledge.md) i citirana je.

## Isprobajte {#try-it}

1. Učitajte jednu ili više utakmica s rundama (pretvorba CS2 ima sve što treba).
2. Otvorite **Uvide** i pritisnite **Pronađi uvide**.
3. Pod **Mjere leće** pročitajte retke od *Vjerojatnost pobjede runde* do *Utjecaj igrača*. Svaki ima svoje brojke, svoj 95 % interval, svoju q vrijednost i izvore koje slijedi.
4. Odaberite leću **E-sport** ili **Urbana borba** da ih pročitate kroz tu literaturu. **Napiši uz UI** šalje ih uz izvještaj.

## Što mjeri {#what-it-measures}

| Mjera | Što kaže | Kako |
|---|---|---|
| Vjerojatnost pobjede runde | Koliko je vjerojatno svaka strana pobijedila rundu u svakom trenutku | Logistička regresija na igračima živima na svakoj strani, bombi ili cilju i njegovu vremenu, odbrojavanju runde i kupnji, prilagođena na učitane podatke; kalibracija provjerena izvan uzorka po rundi (Brierov rezultat i vještina, logaritamski gubitak, pogreška kalibracije kroz deset binova, nagib rekalibracije, AUC) |
| Vrijednost akcija | Koliko su ubojstvo, uvodno ubojstvo, zamjena, ubojstvo iza bljeskalice, postavljanje ili bljeskalica promijenili šansu strane za pobjedu | Vjerojatnost pobjede poslije minus prije; zamjene, uvodna i ubojstva zasljepljenih testirana su naspram ostalih ubojstava permutacijom |
| Uvodni dvoboji | Koja strana dobiva prvi dvoboj, koliko često to dobiva rundu i gdje jedna strana dobiva uvode daleko iznad svog prosjeka | Wilsonovi intervali; mjesta točnim binomnim testom naspram udjela strane, q preko mjesta |
| Zamjene | Smrti na koje je suigrač odgovorio ubojstvom ubojice unutar 5 s, koliko je vremena trebalo i runde dobivene kad je prva smrt zamijenjena | Fisherov točan test, Newcombeov interval |
| Provirivač naspram držatelja | Dvoboji u kojima se jedan igrač pomaknuo u borbu (1,5 m/s ili više u posljednjoj sekundi), a drugi stajao (0,75 m/s ili manje): udio provirivača | Točan binomni test naspram jedne polovice |
| Nišanjenje prije dvoboja | Pogled svakog igrača naspram smjera prema drugome 0,75 s prije ubojstva; tko je bolje nišanio i koliko je često taj igrač pobijedio; držatelji na svom kutu (unutar 15°) naspram izvan njega; domet ubojstava | Točan binomni test; Fisher |
| Unakrsna vatra | Držatelji s nepomičnim suigračem unutar 25 m od provirivača čija je linija prema njemu 35° ili više izvan njihove vlastite, naspram držatelja sami | Fisher, Newcombe |
| Pomoćna sredstva u ulascima | Provirivači iza bljeskalice vlastite strane (unutar 3 s i 15 m) ili dima (unutar 18 s) naspram suhih proviranja; uvodni dvoboji s bljeskalicom na samo jednoj strani; zasljepljene žrtve | Fisher, binomni |
| Prednost u broju | Za svako stanje živih igrača (5v4, 4v5, 2v1...) prvi put dosegnuto u rundi, udio runda dobivenih iz njega | Wilsonovi intervali |
| Završnice | Runde u kojima je strana došla do svog zadnjeg igrača: pobjede naspram očekivanih pobjeda modela, po broju protivnika | Normalni test promatranog naspram očekivanog |
| Nakupine, rotacije, vrebanja | Najveća grupa unutar 10 m na uvodnom dvoboju (3 ili više: nagomilani); igrači više od 30 m od prve borbe ili postavljenog cilja i koliko brzo dolaze unutar 12 m; vrijeme i kvote ubojstvo-prema-smrti na više od 30 m od svakog suigrača | Fisher; omjer kvota s Woolfovim intervalom |
| Nakon postavljanja i ponovno osvajanje | Runde dobivene stranom koja je postavila, prema brojkama pri postavljanju, i njezin udio u dvobojima nakon postavljanja | Wilsonovi intervali |
| Fatalne lijevke | Ulasci na svako mjesto (promjena stupca mjesta, inače ćelije od 8 m) i smrti unutar 2,5 s od ulaska, naspram stope karte; q preko mjesta; omjer smanjen s 20 ulazaka po stopi karte | Točan binomni test, q preko mjesta |
| Utjecaj igrača | Dodana vjerojatnost pobjede po rundi za svakog igrača (ubojstva, smrti, postavljanja), smanjena empirijskim Bayesom; grebenom prilagođeni plus-minus rezultata runde naspram početka modela; vrijednost ubojstva po mjestu i oružju, smanjena | Kazna odabrana unakrsnom provjerom s pet preklopa |

Svi testovi jedne analize dijele jednu stopu lažnih otkrića (Benjamini-Hochberg), uključujući svako isprobano mjesto, a ne samo prikazana. Prikazani q je preko svih njih. Model i njegova kalibracija prilagođeni su učitanim podacima, pa opisuju tu populaciju: profesionalni model pogrešno procjenjuje amatersku igru i obrnuto.

Provjereno na sintetičkim rundama s ugrađenim učincima (prednost provirivača, unakrsne vatre, bljeskalice, jedna fatalna lijevka, bolje nišanjenje koje pobjeđuje), i na 100 skupova podataka istih rundi bez njih, gdje stopa lažnih otkrića testova s ugrađenim učincima mora ostati na nominalnih 5 % (unutar pojasa) (`src/insights/cqb/cqb.test.ts`). Na otprilike tisuću stvarnih rundi model je postigao Brierov rezultat 0,14 naspram 0,25 za osnovnu stopu, pogrešku kalibracije 0,03 i nagib rekalibracije 1,0.

## Podaci koji su mu potrebni {#data-it-needs}

- stupci **vrijeme**, **igrač**, **strana** i **runda** (sesija), te ubojstva i smrti u stupcu događaja; runde u kojima nitko ne umire dvaput tretiraju se kao runde eliminacije (prednost u broju, završnice i model ih trebaju);
- stupac **druge strane** (`other`, `victim`, `killer`, `attacker`) koji imenuje žrtvu pri ubojstvu i ubojicu pri smrti (bez njega se ubojstva i smrti u istom trenutku uparuju);
- **smjer pogleda** za mjere nišanjenja;
- sirovi stupac `event` koji imenuje `flash`, `smoke`, `he`, `molotov`, `plant` i `defuse` za pomoćna sredstva i postavljanja;
- `won` (strana retka je pobijedila rundu), `place` (oznake mjesta), `weapon`, `buy` i `state_flashed` gdje ih podaci imaju.

Položaje treba uzorkovati nekoliko puta u sekundi; brzine, nišanjenje i unakrsne vatre čitaju zadnje dvije sekunde prije svake smrti.

## U raščlambi {#in-the-breakdown}

[Raščlamba](breakdown.md) mjeri četiri situacije kao faktore, s i bez: *zasljepljen*, *smrt zamijenjena*, *uvodni dvoboj* i brojke (*prednost u broju*, *jednak broj*, *manjak*), svaku po K/D, runde dobivene, preživljavanju i ubojstvima u minuti.

## Mnogo utakmica {#many-matches}

Svaki sažetak utakmice [analize mnogo utakmica](mass-analysis.md) podataka sa stupcem runde nosi iste mjere kao brojeve (`cqb` u sažetku): uvodne dvoboje, zamjene, provirivanja, unakrsne vatre, ulaske pod bljeskalicom, nišanjenje, prednost u broju, postavljanja i 40 najčešće ulaženih mjesta s njihovim ulascima i smrtima. Brojevi se zbrajaju kroz utakmice, pa tisuću utakmica daje iste udjele kao jedna velika analiza. Panel, kartica **Bliska borba**, prikazuje ih kao udjele s njihovim intervalima, za sve karte ili po karti. Klik na redak učitava utakmice iz kojih dolazi.

## Za razvojne programere {#for-developers}

`src/insights/cqb/`: `walk.ts` (jedan prolaz kroz redke po vremenu, runde odvojene, dvoboji zabilježeni sa svojim stanjem), `finish.ts` (mjere i brojevi po utakmici), `model.ts` (logistička regresija IRLS-om, kalibracija, grebenska regresija konjugiranim gradijentima, empirijski Bayes, Fisher, Newcombe, permutacijski testovi), `run.ts` i `worker.ts` (preglednik: vlastiti radnik, uz prolaz uvida), `summary.ts` (sakupljač sažetka mnogo utakmica), `factors.ts` (situacije raščlambe), `shows.ts` (što čita leća), `synth.ts` (testne runde). Unosi znanja nalaze se u `src/insights/knowledge/cqb.ts`, obrasci u `patterns-cqb.ts`. Rezultati idu u izvještaj kao `lens.cqb`.
