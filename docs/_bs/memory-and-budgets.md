---
title: "Memorija i budžeti"
parent: "Unos podataka"
nav_order: 6
lang: "bs"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Memorija, budžeti i provjera uklapanja

Vaš računar ima ograničenu memoriju. 3DHeat zbraja šta vaše datoteke trebaju i kaže vam prije **Učitaj** da li stanu.

![Procjena memorije: neće stati, s unaprijed popunjenim Učitaj svaki [N] red i dugmetom Učitaj koje glasi Preveliko - smanjite ili proredite](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Preveliko za ovaj računar? 3DHeat predlaže učitavanje svakog N-tog reda.*

Kartica pregledača koja ostane bez memorije usred učitavanja se ruši i gubi minute rada, a GPU kome se traži više nego što ima ili gubi kontekst ili puzi. Zato prije nego što učitavanje počne, panel Izvor kaže koliko memorije treba, poredi to s budžetima otkrivenim za ovu mašinu, i odbija - uz izlaz - kad neće stati. Model je u [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Procjena memorije {#the-memory-estimate}

Prikazuje se iznad dugmeta **Učitaj** kad su redovi prebrojani.

| Red | Značenje |
|---|---|
| **Procjena memorije** - *stane* / *na granici* / *neće stati* | Ocjena, zelena, žuta ili crvena. |
| `N redova · B B/red` | Redovi koji će se učitati (poslije koraka) i stalni bajtovi po redu. |
| `RAM X zadržano, Y vrh pri učitavanju` | Memorija zadržana kad se učita, i najviša tačka tokom učitavanja. |
| `GPU Z · proc. učitavanje T` | GPU memorija za redove i procijenjeno trajanje pri 1,2 miliona redova u sekundi. |
| ime GPU-a | Ime renderera, kad ga upravljački program prijavi. |
| Poruke | Zašto ne stane, ili je na granici, i šta uraditi. |
| **Učitaj svaki [N] red** | Korak proređivanja (vidi dolje). |
| `Budžet: X RAM, Y GPU. Podesite pod Performanse → Budžeti resursa.` | Budžeti koje je provjera koristila. |

### Bajtovi po redu {#bytes-per-row}

| Kolona | Stalno (RAM) | Napomene |
|---|---|---|
| Položaj | 12 | Tri 32-bitna broja s pomičnim zarezom, uvijek (ravna osa je i dalje niz) |
| Vrijeme | 4 | Kad je mapirano |
| Životni vijek | 4 | Kad su vrijeme i osoba mapirani |
| Osoba | 4 | Kad je mapirana |
| Grupa | 2 | Kad je mapirana |
| Sesija | 4 | Kad je mapirana |
| `Source file` | 4 | Kad je učitano više od jedne datoteke |
| Svaka kolona filtera | 4 | Po označenoj koloni *Zadrži za filtriranje* |

**Vrh** dodaje ono što učitavanje treba samo prolazno - 8 bajtova 64-bitnog vremena pri spajanju, 12 bajtova ključeva sortiranja i indeksa, 4 bajta privremene permutacije (sva tri kad je vrijeme mapirano), i 4 bajta dok je kolona grupe još 32-bitna - i množi zbir sa **2,0**. Taj faktor je izmjeren (stvarno učitavanje više datoteka dostiglo je vrh od 1,9 puta u odnosu na pojedinačne nizove, zbog radnog skupa dekodera Parqueta, kopija koje skraćuju svaku kolonu na dužinu, i memorije koja je oslobođena ali još nije vraćena) i zaokružen naviše, jer podcjena košta srušenu karticu, a precjena samo nepotrebni korak.

Na **GPU-u** svaki red košta 8 bajtova (položaj i grupa, po 16 bita), plus 4 bajta (vrijeme i životni vijek, po 16 bita) kad su i vrijeme i osoba mapirani. Vidi [Zadržavanje GPU memorije](gpu-memory.md). Teksture filtera (4 bajta po redu za svaki aktivni filter) i početke segmenata toplotnih linija (8 bajtova po redu dok je režim Linije uključen) nisu dio ove procjene.

## Provjera uklapanja {#the-fit-check}

Poređe se tri ograničenja ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- vrhunska RAM memorija naspram **RAM budžeta**,
- GPU bajtovi naspram **GPU budžeta**,
- broj redova naspram **granice sortiranja** od 400.000.000 redova, kad je kolona vremena mapirana.

Najgori od tri odnosa odlučuje: do 70% *stane*, do 100% *na granici* (treba se učitati, ali očekujte sporo), iznad *neće stati*. Kad ne stane, panel imenuje ograničenje koje odlučuje i predlaže:

- učitavanje svakog *N*-tog reda, s *N* = ⌈redovi / redovi koji stanu⌉, unaprijed popunjeno u polju koraka;
- ispuštanje kolona filtera, skidanje mapiranja kolone vremena (što uklanja sortiranje i njegovu granicu, uz cijenu vremenske linije), ili povećanje budžeta.

Kad sam budžet nije činjenica o hardveru - pregledač je ograničio RAM vrijednost, podrazumijevana je spuštena onim što je trenutno slobodno, ili je GPU vrijednost pogađanje - poruka to kaže, pa ne posežete za korakom kojem nema potrebe.

### Proređivanje {#decimation}

**Učitaj svaki [N] red** zadržava jedan red od *N*, brojano po datoteci. Toplota je prosjek, pa svaki *N*-ti red daje istu raspodjelu s više šuma - isti kompromis koji renderer već pravi svaki kadar. Polje počinje s 1 (*red (svi)*); kad izbor ne stane, unaprijed je popunjeno predloženim korakom, osim ako ste nešto upisali u njega. Dugme Učitaj tada glasi *Učitaj N datoteka (1 od K)*, a ime skupa podataka bilježi `every Kth row` (svaki K-ti red).

### Granica sortiranja {#the-sort-ceiling}

Renderer treba redove u rastućem vremenskom redu, pa mapirana kolona vremena znači sortiranje svakog reda, radix sortom nad 32-bitnim ključevima ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Iznad **400 miliona** redova to se odbija umjesto da se pokuša u kartici. Ovo se provjerava prije učitavanja, pa se izbor iznad granice odbija uz prijedlog koraka umjesto da se čita cijeli i padne na zadnjem koraku. Blizu granice (*na granici*) panel upozorava da je sortiranje dug prolaz bez sopstvenog napretka. Bez kolone vremena nema sortiranja i nema granice.

## Budžeti resursa {#resource-budgets}

**Performanse → Budžeti resursa** (sklopiva linija pri dnu panela Performanse, koja glasi `Budžeti resursa - RAM, GPU, jezgra`). Budžeti se otkrivaju; otkrivena vrijednost je podrazumijevana; a klizači ne idu iznad **granice** koja je otkrivena vrijednost, osim gdje je poznato da otkrivanje nije mjerenje.

| Kontrola | Opseg | Značenje |
|---|---|---|
| **RAM za podatke redova** | 256 MiB do granice RAM-a, logaritamski | RAM budžet za provjeru uklapanja. Označeno *(iznad otkrivenog)* iznad otkrivene podrazumijevane, *(max)* na granici. |
| **GPU za podatke redova** | 128 MiB do granice GPU-a, logaritamski | GPU budžet za provjeru uklapanja i slanje redova. Označeno *(iznad otkrivenog)* iznad otkrivene podrazumijevane, *(max)* na granici. |
| **Niti parsera** | 1 do broja logičkih jezgara | Koliko datoteka učitavanje parsira istovremeno, svaka u vlastitom radniku. Podrazumijevano jezgra - 2 (jezgra - 1 na četiri ili manje jezgara). Vidi [Niti parsera](#parser-threads) (pod Za programere). |
| red Izvori | | Odakle je došla svaka vrijednost (`RAM: …. GPU: …. CPU: ….`). |
| **Ponovo otkrij** | | Traži od razvojnog servera novo očitavanje memorije i ponovo računa svaki budžet. |
| ime GPU-a | | Kratko ime adaptera; puni string renderera je u opisu. |

### Povećavanje GPU budžeta {#raising-the-gpu-budget}

GPU budžet iznad otkrivene vrijednosti primjenjuje se kako je postavljen: provjera uklapanja i slanje uzimaju istu vrijednost iz jedne funkcije ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), koja je ograničava samo GPU granicom na kojoj klizač staje. Zato učitavanje koje provjera propusti biva poslato u cijelosti. Iznad otkrivene vrijednosti klizač piše *(iznad otkrivenog)*: broj je tada vaša procjena kartice, a ne mjerenje, i postavljanje višeg nego što kartica ima nosi rizik izgubljenog konteksta ili puzanja.

## Vrlo veliki skupovi podataka: poluge {#huge-datasets-the-levers}

Od najjeftinije do najdrastičnije:

1. **Manje kolona filtera.** Svaka košta 4 bajta po redu i jedan prolaz dekodiranja.
2. **Korak.** Svaki *N*-ti red.
3. **Bez kolone vremena.** Nema sortiranja, nema granice sortiranja, nema 4-8 bajtova po redu za vrijeme i životni vijek - i nema vremenske linije.
4. **Povećajte budžete**, kad znate da memorija postoji.

Pri iscrtavanju, veliki skupovi podataka se obrađuju uzorkovanjem i progresivnom akumulacijom, a ne smanjivanjem podataka; vidi [Uzorkovanje i budžeti](sampling-and-budgets.md).

## Za programere {#for-developers}

### Niti parsera {#parser-threads}

Učitavanje više datoteka parsira do **Niti parsera** njih istovremeno, svaka u radniku parsera koji pokreće radnik unosa za to učitavanje ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Pri 1, ili za jednu datoteku, datoteke se parsiraju jedna za drugom u samom radniku unosa.

Pokretanje više odjednom ne popušta provjeru uklapanja:

- **Graditelj se broji prvi.** Spojene kolone se alociraju za cijeli izbor prije nego što se pročita prva datoteka, pa datoteke u toku dobijaju samo ono što RAM budžet ostavi pored njih (`parseHeadroom`): položaj, 64-bitno vrijeme, uglovi gledanja, osoba, 32-bitna grupa, sesija, kolone filtera i `Source file`, po redu koji se učitava - puta 2,6 kad je broj redova procjena iz CSV-a, za kolonu koja raste u veću.
- **Svaka datoteka rezerviše svoj trošak prije nego što počne** (`fileParseBytes`): njeni redovi (iz podnožja Parqueta; CSV-ov dio procjene po veličini) puta iste kolone, puta **8** - sam blok, kopija pored njega dok se redovi bez položaja ispuštaju, i radni skup dekodera, koji je za tekstualne kolone znatno veći od njihovih id-ova. Korak to ne smanjuje, jer se datoteke čitaju cijele i proređuju poslije. Faktor 8 je dozvola postavljena mjerenjem: pri 3, ili pri 5, trideset niti parsera je prebacilo karticu preko njene granice na 86 miliona redova s imenima osoba i sesija; pri 8 nije.
- **Druga datoteka počinje samo ako njena rezervacija stane** u ono što je ostalo. Datoteka koja je završila, ali čeka da se prethodna spoji, zadržava svoju rezervaciju dok se ne spoji.
- **Jedna datoteka uvijek radi.** Kad ništa nije rezervisano, sljedeća datoteka počinje koliko god koštala - to je učitavanje jedan-po-jedan koje je provjera uklapanja dopustila, pa se uska budžet vraća na njega umjesto da odbije.

Vrijednost *vrha pri učitavanju* je vrh učitavanja jedan-po-jedan, koji nastupa pri sortiranju, poslije čitanja svih datoteka. Datoteke parsirane jedna pored druge mogu uzeti memoriju iznad te vrijednosti dok se čitaju; rezervacije je drže u RAM budžetu, koliko su procjene gore tačne.

Redoslijed spajanja je redoslijed izbora, bez obzira kojim redom datoteke završe, pa su numeracija osoba, grupa i sesija, redovi i vrijednosti `Source file` identični učitavanju jedan-po-jedan. Datoteka koja se ne može pročitati se preskače i navodi kao i ranije. Radnik parsera koji pukne prekida cijelo učitavanje, kao što je smrt radnika unosa uvijek i činila, a svaki radnik parsera se zaustavlja kad se učitavanje završi, kako god se završi. Ako se radnici parsera uopšte ne mogu pokrenuti, datoteke se parsiraju u radniku unosa.

### Kako se vrijednosti otkrivaju {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) se pokreće pri pokretanju, opet kad renderer postoji, i na **Ponovo otkrij**.

**RAM, uz razvojni server.** `start.bat` i `npm run dev` poslužuju stranicu iz procesa koji može da čita memoriju mašine, na `/__host/memory` (odgovara za 1,5 s ili se ignoriše). Podrazumijevano je manje od 60% instalirane RAM memorije i 80% trenutno slobodne RAM memorije; granica je 60% instalirane. Kad slobodna memorija drži podrazumijevanu nisko, panel to kaže i predlaže zatvaranje programa i pritisak na **Ponovo otkrij**.

**RAM, bez njega** (statično postavljanje): nijedan API pregledača ne prijavljuje slobodnu memoriju, a `navigator.deviceMemory` se zaokružuje naniže na stepen dvojke i ograničava na 8 GiB u Chromeu i Edgeu. Podrazumijevano je 60% `deviceMemory`, dodatno ograničeno na 4 × slobodni JS heap kartice gdje ga pregledač prijavi, ili na 4 GiB kad se ništa ne prijavi. Kad `deviceMemory` pokazuje tačno 8 (ograničenje), vrijednost je označena kao *ograničena*, a granica je 4 × podrazumijevana, uz napomenu da je iznad podrazumijevane broj vaša tvrdnja, a ne mjerenje.

**U oba slučaja**, podrazumijevana RAM vrijednost i granica su ograničene na **12 GiB**, najviše memorije typed-array koju jedna kartica Chromea može držati bez obzira na mašinu (jedna stranica je dostigla oko 15,75 GB i pala; 12 ostavlja mjesta za sve ostalo), i nikad ne idu ispod 256 MiB.

**GPU memorija.** Nijedan web API je uopšte ne prijavljuje.

- Uz razvojni server, memoriju kartice čita `nvidia-smi` (najveći adapter) ili, na Windowsu, vrijednost registra adaptera za ekran `HardwareInformation.qwMemorySize`. Podrazumijevano je 70% toga, granica 90%.
- Bez očitavanja, zaključuje se: podrazumijevano 2 GiB; 4 GiB kad je najveća tekstura 16.384 px ili više (diskretna kartica), 1 GiB kad je manja; ili 8 × `maxBufferSize` WebGPU-a kad je to veće. Granica je tada 8 × zaključena vrijednost, jer zaključak razlikuje integrisani dio od diskretnog i ništa finije. Panel kaže da je vrijednost zaključena.
- Nikad ispod 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4 kad se ne prijavi).
