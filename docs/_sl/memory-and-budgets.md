---
title: "Pomnilnik in proračuni"
parent: "Uvoz podatkov"
nav_order: 6
lang: "sl"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---


# Pomnilnik, proračuni in preverjanje velikosti

Vaš računalnik ima omejen pomnilnik. 3DHeat sešteje, kaj vaše datoteke potrebujejo, in pred **Naloži** pove, ali se prilegajo.

![Ocena pomnilnika Ne prilega se, z vnaprej izpolnjenim Naloži vsako [N] vrstico in gumbom Naloži, ki piše Preveliko – zmanjšajte ali decimirajte](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Preveliko za ta računalnik? 3DHeat namesto tega predlaga nalaganje vsake N-te vrstice.*

Zavihek brskalnika, ki med nalaganjem ostane brez pomnilnika, se zruši in izgubi minute dela, grafična kartica pa, ki zahteva več, kot ima, izgubi svoj kontekst ali se upočasni do plazenja. Zato Plošča vir pred začetkom nalaganja pove, koliko pomnilnika potrebuje, to primerja s proračuni, zaznanimi za ta računalnik, in ko se ne prilega, zavrne z izhodom. Model je v [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Ocena pomnilnika {#the-memory-estimate}

Prikazana nad gumbom **Naloži**, ko so vrstice prešteta.

| Vrstica | Pomen |
|---|---|
| **Ocena pomnilnika** - *prilega se* / *na robu* / *ne prilega se* | Sodba: zelena, rumena ali rdeča. |
| `N vrstic · B B/vrstico` | Vrstice, ki bodo naložene (po koraku), in stalni bajti na vrstico. |
| `RAM X zadržano, Y največ med nalaganjem` | Pomnilnik, zadržan po nalaganju, in največja vrednost med nalaganjem. |
| `GPU Z · oc. nalaganje T` | Pomnilnik GPU za vrstice in ocenjeni čas pri 1,2 milijona vrstic na sekundo. |
| ime GPU | Ime upodabljalnika, kadar ga gonilnik sporoči. |
| Sporočila | Zakaj se ne prilega ali je na robu in kaj storiti. |
| **Naloži vsako [N] vrstico** | Korak redčenja (glejte spodaj). |
| `Proračun: X RAM, Y GPU. Prilagodite v razdelku Zmogljivost → Proračuni virov.` | Proračuni, ki jih je uporabilo preverjanje. |

### Bajti na vrstico {#bytes-per-row}

| Stolpec | Stalno (RAM) | Opombe |
|---|---|---|
| Položaj | 12 | Trije 32-bitni float-i, vedno (tudi ravna os je polje) |
| Čas | 4 | Kadar je preslikan |
| Življenjska doba | 4 | Kadar sta preslikana čas in oseba |
| Oseba | 4 | Kadar je preslikana |
| Skupina | 2 | Kadar je preslikana |
| Seja | 4 | Kadar je preslikana |
| `Source file` | 4 | Kadar je naložena več kot ena datoteka |
| Vsak stolpec filtra | 4 | Za vsak stolpec z obkljukano možnostjo *Ohrani za filtriranje* |

**Največja vrednost** prišteje, kar nalaganje potrebuje samo začasno – 8 bajtov 64-bitnega časa med
združevanjem, 12 bajtov ključev za razvrščanje in kazalcev, 4 bajte začasne permutacije (vse tri, kadar je
čas preslikan) in 4 bajte, medtem ko je stolpec skupine še 32-bitni – in vsoto pomnoži z **2,0**. Ta faktor je
bil izmerjen (pravo nalaganje več datotek je doseglo 1,9-kratnik naštetih polj, zaradi delovnega nabora dekoderja
Parquet, kopij, ki skrajšajo vsak stolpec na dolžino, in pomnilnika, sproščenega, a še ne vrnjenega) in
zaokrožen navzgor, ker podcenitev stane zrušen zavihek, precenitev pa samo nepotrebni korak.

Na **GPU** vsaka vrstica stane 8 bajtov (položaj in skupina, po 16 bitov vsak), plus 4 bajte (čas in
življenjska doba, po 16 bitov vsak), kadar sta preslikana tako čas kot oseba. Glejte [Zadrževanje pomnilnika GPU](gpu-memory.md).
Teksture filtrov (4 bajte na vrstico na aktivni filter) in začetki segmentov toplotne črte (8 bajtov na vrstico,
ko je način Črte vklopljen) niso del te ocene.

## Preverjanje velikosti {#the-fit-check}

Primerjajo se tri omejitve ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- največji RAM proti **proračunu RAM**,
- bajti GPU proti **proračunu GPU**,
- število vrstic proti **zgornji meji razvrščanja** 400.000.000 vrstic, kadar je preslikan stolpec časa.

Odloča najslabše od treh razmerij: do 70 % *prilega se*, do 100 % *na robu* (naložiti bi se moralo, a pričakujte počasnost), nad tem *ne prilega se*. Ko se ne prilega, plošča navede omejitev, ki jo določa, in predlaga:

- nalaganje vsake *N*-te vrstice, pri čemer je *N* = ⌈vrstice / vrstice, ki se prilegajo⌉, vnaprej izpolnjeno v polju koraka;
- odstranitev stolpcev filtrov, odstranitev preslikave stolpca časa (kar odstrani razvrščanje in njegovo mejo, na račun časovnice) ali povišanje proračuna.

Kadar proračun sam ni dejstvo o strojni opremi – brskalnik je omejil vrednost RAM, privzeta vrednost je bila
zadržana zaradi tega, kar je trenutno prosto, ali je vrednost GPU ugibanje –, sporočilo to pove, da ne
segate po koraku, ki ga ne potrebujete.

### Redčenje {#decimation}

**Naloži vsako [N] vrstico** ohrani eno vrstico od *N*, štete za vsako datoteko. Toplotna karta je povprečje, zato
vsaka *N*-ta vrstica da enako porazdelitev z več šuma – isti kompromis, ki ga upodabljalnik že dela vsak kader.
Polje se začne pri 1 (*vrstica (vse)*); kadar izbor ne ustreza, je vnaprej izpolnjeno s predlaganim korakom,
razen če ste vanj vpisali. Gumb Naloži nato piše *Naloži N datotek (1 od K)*, ime podatkovnega niza pa
zapiše `every Kth row` (vsako K-to vrstico).

### Zgornja meja razvrščanja {#the-sort-ceiling}

Upodabljalnik potrebuje vrstice v naraščajočem vrstnem redu časa, zato preslikan stolpec časa pomeni razvrščanje
vsake vrstice, z radix razvrščanjem čez 32-bitne ključe ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)).
Nad **400 milijoni** vrstic se to zavrne namesto da bi se poskusilo v zavihku. To se preveri pred nalaganjem, zato se
izbor nad mejo zavrne s predlogom koraka, namesto da bi se bral v celoti in padel na zadnjem koraku. Blizu meje
(*na robu*) plošča opozori, da je razvrščanje dolg prehod brez lastnega napredka. Brez stolpca časa razvrščanja ni in
meja se ne uporablja.

## Proračuni virov {#resource-budgets}

**Zmogljivost → Proračuni virov** (zložljiva vrstica na dnu plošče Zmogljivost, ki piše `Proračuni virov - RAM, GPU, jedra`).
Proračuni se zaznajo; zaznana vrednost je privzeta; drsniki ne gredo više od **zgornje meje**, ki je zaznana vrednost, razen
kjer je znano, da zaznavanje ni meritev.

| Nastavitev | Obseg | Pomen |
|---|---|---|
| **RAM za podatke vrstic** | od 256 MiB do zgornje meje RAM, logaritemsko | Proračun RAM za preverjanje velikosti. Označeno *(nad zaznano)* nad zaznano privzeto vrednostjo, *(največ)* pri zgornji meji. |
| **GPU za podatke vrstic** | od 128 MiB do zgornje meje GPU, logaritemsko | Proračun GPU za preverjanje velikosti in za nalaganje vrstic. Označeno *(nad zaznano)* nad zaznano privzeto vrednostjo, *(največ)* pri zgornji meji. |
| **Niti razčlenjevalnika** | od 1 do števila logičnih jeder | Koliko datotek se naloži hkrati, vsaka v svojem delavcu. Privzeto jedra - 2 (jedra - 1 na štirih ali manj jedrih). Glejte [Niti razčlenjevalnika](#parser-threads) (pod Za razvijalce). |
| vrstica Viri | | Od kod je prišla vsaka vrednost (`RAM: …. GPU: …. CPU: ….`). |
| **Znova zaznaj** | | Zahteva od razvojnega strežnika sveže branje pomnilnika in ponovno izračuna vsak proračun. |
| ime GPU | | Kratko ime adapterja; celoten niz upodabljalnika je v namigu. |

### Povišanje proračuna GPU {#raising-the-gpu-budget}

Proračun GPU nad zaznano vrednostjo velja, kot je nastavljen: preverjanje velikosti in nalaganje vzameta isto vrednost iz ene
funkcije ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), ki jo omeji samo zgornja meja GPU, pri kateri se drsnik ustavi. Zato se nalaganje, ki ga preverjanje sprejme, naloži v celoti. Nad zaznano vrednostjo drsnik kaže *(nad zaznano)*: številka je tedaj vaša presoja kartice, ne meritev, in če jo nastavite više, kot kartica zmore, tvegate izgubo konteksta ali plazenje.

## Ogromni nabori podatkov: vzvodi {#huge-datasets-the-levers}

Od najcenejšega do najbolj drastičnega:

1. **Manj stolpcev filtrov.** Vsak je 4 bajti na vrstico in en prehod dekodiranja.
2. **Korak.** Vsaka *N*-ta vrstica.
3. **Brez stolpca časa.** Brez razvrščanja, brez zgornje meje razvrščanja, brez 4–8 bajtov na vrstico za čas in življenjsko dobo – in brez časovnice.
4. **Povišajte proračune**, kadar veste, da je pomnilnik na voljo.

Med upodabljanjem se velike nabore podatkov obravnava z vzorčenjem in postopnim kopičenjem, ne z zmanjševanjem podatkov; glejte [Vzorčenje in proračuni](sampling-and-budgets.md).


## Za razvijalce {#for-developers}

### Niti razčlenjevalnika {#parser-threads}

Nalaganje več datotek razčleni do **Niti razčlenjevalnika** med njimi hkrati, vsako v delavcu razčlenjevalnika, ki ga zažene delavec sprejema za to nalaganje ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Pri 1 ali pri eni sami datoteki se datoteke razčlenjujejo ena za drugo v samem delavcu sprejema.

Hkratno izvajanje več datotek ne sprosti preverjanja velikosti:

- **Gradnik se prešteje najprej.** Združene stolpce se dodelijo za ves izbor, preden se prebere prva datoteka, zato datoteke v teku dobijo samo tisto, kar jim proračun RAM pusti poleg (`parseHeadroom`): položaj, 64-bitni čas, koti pogleda, oseba, 32-bitna skupina, seja, stolpci filtrov in `Source file`, na vrstico, ki bo naložena – pomnoženo z 2,6, kadar je število vrstic ocena CSV, za stolpec, ki raste v večjega.
- **Vsaka datoteka rezervira svoj strošek, preden se začne** (`fileParseBytes`): njene vrstice (iz noge Parquet; delež CSV iz ocene po velikosti) pomnožene z istimi stolpci in s **8** – sam blok, kopija poleg njega, medtem ko se vrstice brez položaja zavržejo, in delovni nabor dekoderja, ki je pri besedilnih stolpcih veliko večji od njihovih id-jev. Korak tega ne zmanjša, ker se datoteke berejo v celoti in se redčijo šele za tem. Vrednost 8 je rezerva, nastavljena z meritvijo: pri 3 ali pri 5 je trideset niti razčlenjevalnika zavihek potisnilo čez njegovo mejo pri 86 milijonih vrstic z imeni oseb in sej; pri 8 ni.
- **Druga datoteka se začne samo, če se njena rezervacija prilega** v tem, kar je ostalo. Datoteka, ki je končana, a čaka, da se prejšnja združi, ohrani svojo rezervacijo, dokler se ne združi.
- **Ena datoteka vedno teče.** Kadar nič ni rezervirano, se naslednja datoteka začne ne glede na strošek – to je nalaganje ena za drugo, ki ga je preverjanje velikosti dovolilo, zato se tesen proračun vrne k njemu namesto da bi zavrnil.

Številka *največ med nalaganjem* je največ pri nalaganju ena za drugo, do katerega pride pri razvrščanju, potem ko so bile vse datoteke prebrane. Datoteke, razčlenjene drugo ob drugi, lahko med branjem presežejo to številko; rezervacije jo držijo znotraj proračuna RAM, kolikor so zgornje ocene pravilne.

Vrstni red združevanja je vrstni red izbora, ne glede na to, v kakšnem vrstnem redu se datoteke končajo, zato so številčenje oseb, skupin in sej, vrstice in vrednosti `Source file` enake kot pri nalaganju ena za drugo. Datoteka, ki je ni mogoče prebrati, se preskoči in se navede natanko kot prej. Če delavec razčlenjevalnika odpove, konča celotno nalaganje, kot je smrt delavca sprejema vedno končala, in vsak delavec razčlenjevalnika se ustavi ob koncu nalaganja, ne glede na to, kako se konča. Če delavcev razčlenjevalnika sploh ni mogoče zagnati, se datoteke razčlenijo v delavcu sprejema.

### Kako se vrednosti zaznajo {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) teče ob zagonu, ponovno, ko obstaja upodabljalnik, in ob **Znova zaznaj**.

**RAM, z razvojnim strežnikom.** `start.bat` in `npm run dev` postrežejo stran iz procesa, ki lahko bere pomnilnik računalnika, na `/__host/memory` (odgovori v 1,5 s ali se prezre). Privzeto je manjše od 60 % nameščenega RAM in 80 % trenutno prostega RAM; zgornja meja je 60 % nameščenega. Kadar prosti pomnilnik zniža privzeto vrednost, plošča to pove in predlaga zapiranje programov ter pritisk na **Znova zaznaj**.

**RAM, brez njega** (statična objava): noben brskalniški API ne sporoča prostega pomnilnika, `navigator.deviceMemory` pa Chrome in Edge zaokrožita navzdol na potenco števila 2 in omejita na 8 GiB. Privzeto je 60 % `deviceMemory`, dodatno omejeno na 4 × prosti JS-kopico zavihka, kjer jo brskalnik sporoči, ali na 4 GiB, kadar ni sporočeno ničesar. Kadar `deviceMemory` kaže natanko 8 (omejitev), je vrednost označena kot *omejena*, zgornja meja pa je 4 × privzeta vrednost, z opombo, da je nad privzeto vrednostjo število vaša trditev, ne meritev.

**Vsekakor** sta privzeta vrednost in zgornja meja RAM omejeni na **12 GiB**, največ pomnilnika tipiziranih nizov, ki ga lahko drži en zavihek Chroma, ne glede na to, kaj ima računalnik (stran je dosegla približno 15,75 GB in odpovedala; 12 pusti prostor za vse drugo), in nikoli nista pod 256 MiB.

**Pomnilnik GPU.** Noben spletni API ga sploh ne sporoča.

- Z razvojnim strežnikom bere pomnilnik kartice `nvidia-smi` (največji adapter) ali, v sistemu Windows, vrednost registra adapterja zaslona `HardwareInformation.qwMemorySize`. Privzeto je 70 % tega, zgornja meja 90 %.
- Brez branja se sklepa: privzeto 2 GiB; 4 GiB, kadar je največja tekstura 16.384 slikovnih pik ali več (diskretna kartica), 1 GiB, kadar je manjša; ali 8 × `maxBufferSize` WebGPU, kadar je to večje. Zgornja meja je tedaj 8 × sklepana vrednost, ker sklep loči integrirano enoto od diskretne in nič drobnejšega. Plošča pove, da je vrednost sklepana.
- Nikoli pod 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4, kadar ni sporočeno).

