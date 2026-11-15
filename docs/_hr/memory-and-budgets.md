---
title: "Memorija i proračuni"
parent: "Unos podataka"
nav_order: 6
lang: "hr"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Memorija, proračuni i provjera uklapanja

Vaše računalo ima ograničenu memoriju. 3DHeat zbraja što vaše datoteke trebaju i prije **Učitaj** vam kaže hoće li stati.

![Procjena memorije: neće stati, s unaprijed popunjenim Učitaj svaki [N] redak i gumbom Učitaj koji piše Preveliko, smanjite ili prorijedite](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Preveliko za ovo računalo? 3DHeat predlaže učitavanje svakog N-tog retka.*

Kartica preglednika koja ostane bez memorije usred učitavanja se ruši i gubi minute rada. GPU kojem se traži više nego što ima ili gubi kontekst ili puzi. Zato prije početka učitavanja okno Izvor kaže koliko memorije treba, uspoređuje to s proračunima otkrivenima za ovo računalo, i odbija, uz izlaz, kad ne bi stalo. Model je u [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Procjena memorije {#the-memory-estimate}

Prikazana je iznad gumba **Učitaj** kad su redci prebrojeni.

| Redak | Značenje |
|---|---|
| **Procjena memorije** - *stane* / *na rubu* / *neće stati* | Ocjena, zelena, žuta ili crvena. |
| `N redaka · B B/redak` | Redci koji će se učitati (nakon koraka) i trajni bajtovi po retku. |
| `RAM X zadržano, Y vrh pri učitavanju` | Memorija koja ostaje zauzeta nakon učitavanja, i najviša točka tijekom učitavanja. |
| `GPU Z · proc. učitavanje T` | GPU memorija za redke i procijenjeno trajanje pri 1,2 milijuna redaka u sekundi. |
| naziv GPU-a | Naziv renderera, kad ga upravljački program prijavi. |
| Poruke | Zašto ne stane ili je na rubu, i što učiniti. |
| **Učitaj svaki [N] redak** | Korak prorjeđivanja (dolje). |
| `Proračun: X RAM, Y GPU. Podesite pod Performanse → Proračuni resursa.` | Proračuni koje je provjera koristila. |

### Bajtovi po retku {#bytes-per-row}

| Stupac | Trajno (RAM) | Napomene |
|---|---|---|
| Položaj | 12 | Tri 32-bitna broja s pomičnom točkom, uvijek (i ravna os je niz) |
| Vrijeme | 4 | Kad je mapirano |
| Životni vijek | 4 | Kad su mapirani vrijeme i osoba |
| Osoba | 4 | Kad je mapirano |
| Grupa | 2 | Kad je mapirano |
| Sesija | 4 | Kad je mapirano |
| `Source file` | 4 | Kad je učitano više od jedne datoteke |
| Svaki stupac filtera | 4 | Po označenom stupcu *Zadrži za filtriranje* |

**Vrh** dodaje ono što učitavanje treba samo privremeno: 8 bajtova 64-bitnog vremena pri spajanju, 12 bajtova ključeva sortiranja i indeksa, 4 bajta privremenog prostora za permutaciju (sva tri kad je vrijeme mapirano), i 4 bajta dok je stupac grupe još 32-bitni. Zbroj množi s **2,0**. Taj faktor je izmjeren (stvarno učitavanje više datoteka dosegnulo je vrh od 1,9 puta po stavljenim nizovima, zbog radnog skupa dekodera Parqueta, kopija koje skraćuju svaki stupac na duljinu i memorije oslobođene ali još nevraćene), i zaokružen naviše. Razlog: premala procjena košta srušenu karticu, a prevelika samo nepotreban korak.

Na **GPU-u** svaki redak košta 8 bajtova (položaj i grupa, po 16 bitova), plus 4 bajta (vrijeme i životni vijek, po 16 bitova) kad su mapirani i vrijeme i osoba. Vidi [Rezidentnost GPU memorije](gpu-memory.md). Teksture filtera (4 bajta po retku po aktivnom filteru) i početci segmenata linijske topline (8 bajtova po retku dok je način Linije uključen) nisu dio ove procjene.

## Provjera uklapanja {#the-fit-check}

Uspoređuju se tri ograničenja ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- vršna RAM memorija naspram **proračuna RAM-a**,
- GPU bajtovi naspram **proračuna GPU-a**,
- broj redaka naspram **gornje granice sortiranja** od 400.000.000 redaka, kad je stupac vremena mapiran.

Najgori od tri omjera odlučuje: do 70% *stane*, do 100% *na rubu* (treba se učitati, ali očekujte sporo), iznad toga *neće stati*. Kad ne bi stalo, okno imenuje ograničenje koje ga zaustavlja i predlaže:

- učitavanje svakog *N*-tog retka, s *N* = ⌈redci / redci koji stanu⌉, unaprijed upisano u polje koraka;
- izbacivanje stupaca filtera, uklanjanje mapiranja vremenskog stupca (što uklanja sortiranje i njegovu granicu, uz cijenu vremenske trake), ili povećanje proračuna.

Kad proračun sam nije činjenica o hardveru (preglednik je ograničio RAM vrijednost, zadano je bilo smanjeno onim što je upravo slobodno, ili je GPU vrijednost pretpostavka), poruka to kaže. Tako ne posežete za korakom koji vam ne treba.

### Prorjeđivanje {#decimation}

**Učitaj svaki [N] redak** zadržava jedan redak od *N*, brojeno po datoteci. Toplina je prosjek, pa svaki *N*-ti redak daje istu raspodjelu s više šuma, isti kompromis koji renderer već pravi svaki okvir. Polje počinje s 1 (*redak (svi)*). Kad odabir ne stane, unaprijed se popuni predloženim korakom, osim ako ste nešto upisali. Gumb Učitaj tada piše *Učitaj N datoteka (1 od K)*, a naziv skupa podataka bilježi `svaki K-ti redak`.

### Granica sortiranja {#the-sort-ceiling}

Renderer treba retke uzlaznim redoslijedom vremena, pa mapirani stupac vremena znači sortiranje svakog retka, radix sortiranjem nad 32-bitnim ključevima ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Preko **400 milijuna** redaka to se odbija umjesto da se pokuša u kartici. Ovo se provjerava prije učitavanja, pa se odabir iznad granice odbija s prijedlogom koraka, umjesto da se čita cijeli i pukne na zadnjem koraku. Blizu granice (*na rubu*) okno upozorava da je sortiranje dug prolaz bez vlastitog napretka. Bez stupca vremena nema sortiranja i nema granice.

## Proračuni resursa {#resource-budgets}

**Performanse → Proračuni resursa** (sklopiva linija pri dnu okna Performanse, koja glasi `Resource budgets - RAM, GPU, cores`). Proračuni se otkrivaju. Otkrivena vrijednost je zadana, a klizači ne idu više od **granice**, koja je otkrivena vrijednost, osim gdje je poznato da otkrivanje nije mjerenje.

| Kontrola | Raspon | Značenje |
|---|---|---|
| **RAM za podatke redaka** | 256 MiB do granice RAM-a, logaritamski | Proračun RAM-a za provjeru uklapanja. Označeno *(iznad otkrivenog)* iznad otkrivene zadane vrijednosti, *(maks)* na granici. |
| **GPU za podatke redaka** | 128 MiB do granice GPU-a, logaritamski | Proračun GPU-a za provjeru uklapanja i prijenos redaka. Označeno *(iznad otkrivenog)* iznad otkrivene zadane vrijednosti, *(maks)* na granici. |
| **Niti parsera** | 1 do broja logičkih jezgri | Koliko se datoteka parsira istodobno, svaka u vlastitom radniku. Zadano: jezgre - 2 (jezgre - 1 na četiri ili manje jezgri). Vidi [Niti parsera](#parser-threads) (pod Za razvojne programere). |
| Redak izvora | | Odakle je došla svaka vrijednost (`RAM: …. GPU: …. CPU: ….`). |
| **Ponovno otkrij** | | Traži od razvojnog poslužitelja novo očitanje memorije i ponovno izračunava svaki proračun. |
| naziv GPU-a | | Kratki naziv adaptera. Puni niz renderera je u savjetu. |

### Podizanje GPU proračuna {#raising-the-gpu-budget}

GPU proračun iznad otkrivene vrijednosti primjenjuje se kako je postavljen. Provjera uklapanja i prijenos uzimaju istu vrijednost iz jedne funkcije ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), koja je ograničava samo granicom GPU-a na kojoj klizač staje. Zato se učitavanje koje provjera propusti prenosi u cijelosti. Iznad otkrivene vrijednosti klizač čita *(iznad otkrivenog)*: broj je tada vaša procjena kartice, a ne mjerenje. Postavljanje višeg od onoga što kartica ima nosi rizik izgubljenog konteksta ili puzanja.

## Vrlo veliki skupovi podataka: poluge {#huge-datasets-the-levers}

Od najjeftinije do najdrastičnije:

1. **Manje stupaca filtera.** Svaki košta 4 bajta po retku i jedan prolaz dekodiranja.
2. **Korak.** Svaki *N*-ti redak.
3. **Bez stupca vremena.** Nema sortiranja, nema granice sortiranja, nema 4-8 bajtova po retku za vrijeme i životni vijek, i nema vremenske trake.
4. **Povećajte proračune**, kad znate da memorija postoji.

Pri prikazu, veliki skupovi podataka obrađuju se uzorkovanjem i progresivnim akumuliranjem, a ne smanjivanjem podataka. Vidi [Uzorkovanje i proračuni](sampling-and-budgets.md).

## Za razvojne programere {#for-developers}

### Niti parsera {#parser-threads}

Učitavanje više datoteka parsira do **Niti parsera** njih istodobno, svaku u radniku parsera koji ga pokreće za to učitavanje ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Pri 1, ili za jednu datoteku, datoteke se parsiraju jedna za drugom u samom radniku unosa.

Pokretanje više odjednom ne popušta provjeru uklapanja:

- **Graditelj se broji prvi.** Spojeni stupci se dodjeljuju za cijeli odabir prije nego što se pročita prva datoteka. Datoteke u tijeku dobivaju samo ono što proračun RAM-a ostavi pored njih (`parseHeadroom`): položaj, 64-bitno vrijeme, kutovi gledanja, osoba, 32-bitna grupa, sesija, stupci filtera i `Source file`, po retku koji se učitava, puta 2,6 kad je broj redaka procjena CSV-a, za stupac koji raste u veći.
- **Svaka datoteka rezervira svoj trošak prije početka** (`fileParseBytes`): njezini redci (iz podnožja Parqueta; CSV-ov dio procjene po veličini) puta isti stupci, puta **8**. To su sam blok, kopija pored njega dok se redci bez položaja odbacuju, i radni skup dekodera, koji je za tekstualne stupce daleko veći od njihovih id-ova. Korak to ne smanjuje, jer se datoteke čitaju u cijelosti i prorjeđuju poslije. Broj 8 je dozvola postavljena mjerenjem: pri 3 ili 5, trideset niti parsera gurnulo je karticu preko granice na 86 milijuna redaka s imenima osoba i sesija. Pri 8 nije.
- **Druga datoteka počinje samo ako se njezina rezervacija uklapa** u ono što je ostalo. Datoteka koja je završila, ali čeka da se prethodna spoji, zadržava svoju rezervaciju dok se ne spoji.
- **Jedna datoteka uvijek radi.** Kad nije ništa rezervirano, sljedeća datoteka počinje koliko god koštala. To je učitavanje jedne po jedne koje je provjera uklapanja dopustila, pa se uska proračunska situacija vraća na njega umjesto da odbija.

Brojka *vrh pri učitavanju* je vrh učitavanja jedne po jedne, koji dolazi pri sortiranju, nakon što su sve datoteke pročitane. Datoteke parsirane istodobno mogu zauzeti memoriju iznad te brojke dok se čitaju. Rezervacije to drže unutar proračuna RAM-a, koliko god su gornje procjene točne.

Redoslijed spajanja je redoslijed odabira, bez obzira na to kojim redom datoteke završe. Zato su brojevi osoba, grupa i sesija, redci i vrijednosti `Source file` identični učitavanju jedne po jedne. Datoteka koja se ne može pročitati preskače se i navodi se točno kao prije. Radnik parsera koji umre završava cijelo učitavanje, kao što je smrt radnika unosa uvijek i činila. Svaki radnik parsera se gasi kad učitavanje završi, kako god završi. Ako se radnici parsera uopće ne mogu pokrenuti, datoteke se parsiraju u radniku unosa.

### Kako se brojke otkrivaju {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) pokreće se pri pokretanju, opet kad postoji renderer, i pri **Ponovno otkrij**.

**RAM, uz razvojni poslužitelj.** `start.bat` i `npm run dev` poslužuju stranicu iz procesa koji može čitati memoriju stroja, na `/__host/memory` (odgovara u roku od 1,5 s ili se ignorira). Zadano je manje od 60% instaliranog RAM-a i 80% trenutno slobodnog RAM-a. Granica je 60% instaliranog. Kad slobodna memorija drži zadano smanjeno, okno to kaže i predlaže zatvaranje programa i pritisak na **Ponovno otkrij**.

**RAM, bez njega** (statička objava): nijedan web API ne prijavljuje slobodnu memoriju, a `navigator.deviceMemory` Chrome i Edge zaokružuju na dolje na potenciju dva i ograničavaju na 8 GiB. Zadano je 60% `deviceMemory`, dodatno ograničeno na 4 × slobodni JS heap kartice gdje ga preglednik prijavi, ili 4 GiB kad se ništa ne prijavi. Kad `deviceMemory` točno iznosi 8 (ograničenje), brojka se označava kao *ograničena*, a granica je 4 × zadano, uz napomenu da je iznad zadane vrijednosti broj vaša tvrdnja, a ne mjerenje.

**U oba slučaja** zadana vrijednost RAM-a i granica se ograničavaju na **12 GiB**, najviše memorije typed-array koju jedna kartica Chromea može držati bez obzira na to što stroj ima (jedna stranica je dosegla oko 15,75 GB i pukla; 12 ostavlja mjesta za sve ostalo). Nikad ne padaju ispod 256 MiB.

**GPU memorija.** Nijedan web API je uopće ne prijavljuje.

- Uz razvojni poslužitelj, memoriju kartice čita `nvidia-smi` (najveći adapter) ili, na Windowsu, vrijednost registra adaptera zaslona `HardwareInformation.qwMemorySize`. Zadano je 70% toga, granica 90%.
- Bez očitanja, zaključuje se: 2 GiB po zadanom; 4 GiB kad je najveća tekstura 16.384 px ili veća (diskretna kartica), 1 GiB kad je manja; ili 8 × `maxBufferSize` WebGPU-a kad je to veće. Granica je tada 8 × zaključena brojka, jer zaključak razlikuje integrirani dio od diskretnog i ništa finije. Okno kaže da je brojka zaključena.
- Nikad ispod 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4 kad se ne prijavi).
