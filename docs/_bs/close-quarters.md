---
title: "Bliski boj i rundovi"
parent: "Uvidi"
nav_order: 2
lang: "bs"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Bliski boj i rundovi

Za pucačine zasnovane na rundama (Counter-Strike prvo, bilo koji podaci s rundama, stranama i ubistvima), Uvidi mjere kako su borbe dobijene: ko je uzeo otvarajuće dueleve i šta su vrijedili, da li su smrti razmijenjene, da li je igrač koji ulazi u ugao nadjačao onoga koji ga drži, da li su unakrsne vatre i bljeskalice bile isplative, kako su se kvote runde mijenjale sa svakim ubistvom, i koja su vrata ubijala igrače koji su ulazili kroz njih. Koristite to da vidite zašto su runde dobijene, a ne samo ko je imao ubistva.

Mjere dolaze iz doktrine borbe u sobama i urbane borbe (fatalna lijevka, tačke dominacije, unakrsna vatra) i iz analitike e-sporta i sporta (vjerovatnoća pobjede, vrijednost akcija, prilagođeni plus-minus). Svaka se čita kroz [Sočivo znanja](knowledge.md) i citira se.

## Probajte {#try-it}

1. Učitajte jedan ili više mečeva s rundama (konverzija CS2 ima sve što treba).
2. Otvorite **Uvidi** i pritisnite **Pronađi uvide**.
3. Pod **Mjere leće** pročitajte redove od *Vjerovatnoća pobjede runde* do *Uticaj igrača*; svaki ima svoje brojke, svoj 95% interval, svoju q vrijednost i izvore koje prati.
4. Izaberite leću **E-sport** ili **Urbana borba** da ih čitate kroz tu literaturu; **Napiši uz AI** ih šalje uz izvještaj.

## Šta mjeri {#what-it-measures}

| Mjera | Šta kaže | Kako |
|---|---|---|
| Vjerovatnoća pobjede runde | Koliko je vjerovatno bila da strana dobije rundu u svakom trenutku | Logistička regresija nad igračima živim na svakoj strani, bombom ili ciljem i njegovim vremenom, satom runde i kupovinom, uklopljena u učitane podatke; kalibracija provjerena van uzorka po rundi (Brierov rezultat i vještina, log gubitak, greška kalibracije u deset grupa, nagib rekalibracije, AUC) |
| Vrijednost akcija | Koliko su ubistvo, ubistvo za otvaranje, razmjena, ubistvo iza bljeskalice, postavljanje ili bljeskalica promijenili šansu strane da pobijedi | Vjerovatnoća pobjede poslije minus prije; razmjene, otvarajuća i ubistva pod bljeskalicom testirani naspram ostalih ubistava permutacijom |
| Otvarajući dueli | Koja strana dobija prvi dvoboj, koliko često to dobija rundu, i gdje jedna strana dobija otvaranja daleko iznad svog prosjeka | Wilsonovi intervali; mjesta po tačnom binomnom testu naspram udjela strane, q preko mjesta |
| Razmjene | Smrti na koje je saigrač odgovorio ubistvom ubice unutar 5 s, koliko je to trajalo, i runde dobijene kada je prva smrt razmijenjena | Fisherov tačni test, Newcombeov interval |
| Napadač naspram držaoca | Dueli u kojima se jedan igrač uključio u borbu (1,5 m/s ili više u zadnjoj sekundi), a drugi je stajao (0,75 m/s ili manje): udio napadača | Tačni binomni test naspram polovine |
| Nišanjenje prije duela | Pogled svakog igrača naspram pravca do drugog 0,75 s prije ubistva; ko je bolje nišanio i koliko često je taj igrač pobijedio; držaoci na svom uglu (unutar 15°) naspram van njega; dometi ubistava | Tačni binomni test; Fisher |
| Unakrsna vatra | Držaoci sa nepomičnim saigračem unutar 25 m od napadača čija je linija ka njemu 35° ili više van njihove vlastite, naspram držalaca samih | Fisher, Newcombe |
| Pomoćna sredstva pri ulasku | Napadači iza bljeskalice vlastite strane (unutar 3 s i 15 m) ili dima (unutar 18 s) naspram suhih napada; otvarajući dueli s bljeskalicom samo na jednoj strani; žrtve oslijepljene | Fisher, binomni |
| Prednost u broju | Za svako stanje živih igrača (5v4, 4v5, 2v1...) prvi put dostignuto u rundi, udio rundi dobijenih od tog trenutka | Wilsonovi intervali |
| Klečevi | Runde u kojima je strana došla do svog zadnjeg igrača: pobjede naspram očekivanih pobjeda modela, po broju protivnika | Normalni test posmatranog naspram očekivanog |
| Gomilanje, rotacije, vrebanje | Najveća grupa unutar 10 m na otvarajućem dueliru (3 ili više: gomilanje); igrači preko 30 m od prve borbe ili postavljenog cilja i koliko brzo dolaze unutar 12 m; vrijeme i kvote ubistvo-prema-smrti više od 30 m od svakog saigrača | Fisher; odnos kvota s Woolfovim intervalom |
| Poslije postavljanja i ponovnog osvajanja | Runde koje je dobila strana koja je postavila, po brojkama pri postavljanju, i njen udio u dueli poslije postavljanja | Wilsonovi intervali |
| Fatalne lijevke | Ulazi na svako mjesto (promjena kolone mjesta, inače ćelije od 8 m) i smrti unutar 2,5 s od ulaska, naspram stope mape; tačni binomni test, q preko mjesta; odnos smanjen s 20 ulaza po stopi mape | Tačni binomni test, q preko mjesta; odnos smanjen s 20 ulaza po stopi mape |
| Uticaj igrača | Dodata vjerovatnoća pobjede po rundi za svakog igrača (ubistva, smrti, postavljanja), smanjena empirijskim Bayesom; grebenasti prilagođeni plus-minus rezultata runde naspram početka modela; vrijednost ubistva po mjestu i oružju, smanjena | Kazna izabrana unakrsnom validacijom u pet dijelova |

Svi testovi jedne analize dijele jednu stopu lažnih otkrića (Benjamini-Hochberg), uključujući svako probano mjesto, a ne samo prikazana; prikazana q vrijednost je preko svih njih. Model i njegova kalibracija uklapaju se u učitane podatke, pa opisuju tu populaciju: profesionalni model pogrešno procjenjuje opuštenu igru i obrnuto.

Provjereno na sintetičkim rundama s ugrađenim efektima (prednost napadača, unakrsna vatra, bljeskalice, jedna fatalna lijevka, bolje nišanjenje koje pobjeđuje), i na 100 skupova podataka istih runde bez njih, gdje stopa lažnih otkrića testova ugrađenih efekata mora ostati na nominalnih 5% (u granicama) (`src/insights/cqb/cqb.test.ts`); na otprilike hiljadu stvarnih runde model je postigao Brierov rezultat 0,14 naspram 0,25 za osnovnu stopu, grešku kalibracije 0,03 i nagib rekalibracije 1,0.

## Podaci koji su potrebni {#data-it-needs}

- kolone **vrijeme**, **igrač**, **strana** i **runda** (sesija), i ubistva i smrti u koloni događaja; runde u kojima niko ne umire dvaput tretiraju se kao runde eliminacije (prednost u broju, klečevi i model ih trebaju);
- kolona **druge strane** (`other`, `victim`, `killer`, `attacker`) koja imenuje žrtvu kod ubistva i ubicu kod smrti (bez nje, ubistva i smrti u istom trenutku se uparuju);
- **smjer pogleda** za mjere nišanjenja;
- sirova kolona `event` koja imenuje `flash`, `smoke`, `he`, `molotov`, `plant` i `defuse` za pomoćna sredstva i postavljanja;
- `won` (strana reda je dobila rundu), `place` (oznake mjesta), `weapon`, `buy` i `state_flashed` gdje ih podaci imaju.

Pozicije treba uzorkovati nekoliko puta u sekundi; brzine, nišanjenje i unakrsna vatra čitaju zadnje dvije sekunde prije svake smrti.

## U raščlambi {#in-the-breakdown}

[Raščlamba](breakdown.md) mjeri četiri situacije kao faktore, sa-bez: *oslijepljen*, *smrt razmijenjena*, *otvarajući dueo* i brojke (*čovjek više*, *jednak broj*, *čovjek manje*), svaku na K/D, rundama dobijenim, preživljavanju i ubistvima po minuti.

## Mnogo mečeva {#many-matches}

Svaki sažetak meča iz [analize mnogo mečeva](mass-analysis.md) za podatke s kolonom runde nosi iste mjere kao brojeve (`cqb` u sažetku): otvarajuće dueli, razmjene, napadi, unakrsne vatre, ulasci pod bljeskalicom, nišanjenje, prednost u broju, postavljanja i 40 najčešće ulaženih mjesta s njihovim ulascima i smrtima. Brojevi se zbrajaju kroz mečeve, pa hiljadu mečeva daje iste udjele kao jedna velika analiza. Kartica **Bliska borba** u panelu ih prikazuje kao udjele s njihovim intervalima, za sve mape ili po mapi; klik na red učitava mečeve iz kojih dolazi.

## Za programere {#for-developers}

`src/insights/cqb/`: `walk.ts` (jedan prolaz kroz redove po vremenu, runde odvojene, dueli zabilježeni s njihovim stanjem), `finish.ts` (mjere i brojevi po meču), `model.ts` (logistička regresija IRLS-om, kalibracija, grebenasta regresija konjugovanim gradijentima, empirijski Bayes, Fisher, Newcombe, permutacioni testovi), `run.ts` i `worker.ts` (pregledač: vlastiti radnik, uz prolaz uvida), `summary.ts` (sakupljač sažetka za mnogo mečeva), `factors.ts` (situacije raščlambe), `shows.ts` (šta leća čita), `synth.ts` (testne runde). Unosi znanja su u `src/insights/knowledge/cqb.ts`, obrasci u `patterns-cqb.ts`. Rezultati idu u izvještaj kao `lens.cqb`.
