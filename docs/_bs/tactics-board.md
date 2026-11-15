---
title: "Tabla taktika"
nav_order: 12
has_children: true
lang: "bs"
source: "tactics-board.md"
source_hash: "e89ef050b0f2"
translated: true
outdated: false
---

# Tabla taktika

Kartica **Taktika** je tabla za crtanje plana tima: na mapu stavljate male figure, crtate strelice za to kuda idu, i pritisnete reprodukciju da vidite šta se dešava. Koristite je da isplanirate rundu ili napad prije igre. Dijeli platno, kameru i [nivo](levels.md) s ostalim karticama i ništa drugo; plan nije podatak i ne crta toplotu.

## Vaš prvi plan {#your-first-plan}

1. Otvorite karticu **Taktika**. Izaberite **Igra** (na primjer Counter-Strike 2) i, za Valorant, pritisnite **Učitaj Valorant mape** pa izaberite **Mapu**. Ili prvo učitajte [nivo](levels.md).
2. Izaberite **Stranu** (ona određuje boju) i pritisnite **Pogled odozgo**.
3. Izaberite **Mjesto**, izaberite figuru u **Figure** (koristite **Traži figure** da je nađete) i kliknite na mapu. Postavite dvije ili tri.
4. Izaberite **Strelica**, kliknite na figuru, kliknite duž puta kojim bi trebalo da ide, i pritisnite **Enter** da završite strelicu.
5. Pritisnite **+** ispod prikaza da dodate korak 2. Svaka figura počinje tamo gdje je završila njena strelica. Nacrtajte tamo još strelica.
6. Pritisnite **▶** (ili `K`) da pustite plan od prikazanog koraka do kraja.
7. Imenujte plan u **Naziv plana** i pritisnite **Sačuvaj**.

![Kartica Taktika u pogledu odozgo: igra, strane i alati lijevo, tri figure sa strelicama Pomjeri, bacanje dima kao luk, područje i koraci pri dnu](../assets/img/bs/tactics.webp)

## Pokretanje plana {#starting-a-plan}

| Kontrola | Šta radi |
|---|---|
| **Igra** | Bira strane i figure koje paleta nudi: Counter-Strike 2 (T, CT; igrači i pomoćna sredstva), Valorant (Napad, Odbrana; igrači i opšte sposobnosti), Battlefield, Squad, Arma (pješadija, kopnena vozila, vazduhoplovi, čamci), DCS / War Thunder / IL-2 (mlazni avioni, avioni s propelerom, helikopteri, protivvazdušna odbrana, kopno, brodovi, oružje), i Ostalo. Plan koji već ima figure zadržava svoje strane kada se igra promijeni. |
| **Naziv plana** | Naziv pod kojim se plan čuva. |
| **Mapa**, **Učitaj Valorant mape** | Kada je izabran Valorant: **Učitaj Valorant mape** preuzima spisak mapa s [valorant-api.com](https://valorant-api.com); **Mapa** tada postavlja minimapu izabrane mape kao nivo, uokvirenu s vrha. Slika se preuzima kada se izabere i nikada se ne isporučuje uz program. Riotova napomena se prikazuje dok je na ekranu (vidi dolje). |
| **Strana** | Strana kojoj pripada sljedeća figura, strelica ili područje; uzima boju strane. |

Bez nivoa tabla je ravna površina tla. Učitajte nivo pod **Nivo** da planirate na pravoj mapi: mapu CS2 izvezenu CS2 alatom, nivo iz biblioteke, ili sliku mape.

## Alati {#tools}

| Alat | Klik | Napomene |
|---|---|---|
| **Izaberi** | Figuru, tačku puta, strelicu, područje ili bilješku selektuje. | Shift+klik dodaje ili uklanja; Shift+prevlačenje crta okvir oko onoga što treba dodati. Odabrano dobija gizmo za transformaciju (vidi dolje); `Delete` ili `Backspace` ga uklanja. `M` pomjera odabranu figuru na sljedeći klik. |
| **Mjesto** | Spušta izabranu figuru. | Figura se bira u paleti **Figure** (s **Traži figure**). Kada ništa nije odabrano, `R` okreće sljedeću figuru za 15° prije postavljanja (`Shift+R` u drugu stranu). |
| **Strelica** | Svaki klik dodaje tačku; Enter, dvostruki klik ili desni klik je završava, Esc je odbacuje. | **Pomjeri**, **Napad** (šire vrh) ili **Posmatranje** (tanka linija na visini očiju). Strelica započeta na figuri je njena putanja u ovom koraku: pušta se, figura je prolazi, a sljedeći korak počinje tamo gdje je završila. |
| **Bacanje** | Bacač, pa mjesto gdje sleti. | Isprekidani luk od jednog do drugog, a izabrano pomoćno sredstvo (dim, bljeskalica, molotov, ...) pojavljuje se tamo gdje sleti i ostaje od ovog koraka nadalje. |
| **Područje** | Sredina, pa ivica. | Disk u boji strane. |
| **Bilješka** | Gdje bilješka ide; traži njen tekst. | Prikazuje se kao pribadača, a njen tekst preko nje. |
| **Briši** | Figuru, strelicu, područje ili bilješku. | Uklanja je od ovog koraka nadalje; na njenom prvom koraku je uklanja. |

**Poništi** i **Ponovi** (`Ctrl+Z`; `Ctrl+Y` ili `Ctrl+Shift+Z`) kreću kroz svaku promjenu. Linija ispod plana pokazuje koliko figura, strelica i koraka ima. **Pogled odozgo** gleda ravno nadole (ortografski), **3D prikaz** vraća perspektivu, **Sličica** uklapa plan, ili nivo kada je plan prazan.

**Veličina figura** skalira svaku figuru na tabli; 1× je prava veličina, koja je odozgo nekoliko piksela za osobu.

## Pomjeranje, okretanje i skaliranje {#moving-turning-and-scaling}

Sve na tabli može se pomjerati kao u 3D uređivaču: figure, sredstva, oznake, pojedinačne tačke puta i cijele strelice, područja i bilješke. Ono što je odabrano dobija gizmo u svojoj sredini:

| Način | Tasteri | Ručke |
|---|---|---|
| **Pomjeri** | W (ili G) | Strelica po osi (X crvena, Y zelena i gore, Z plava) pomjera duž nje; kvadrat pomjera preko svoje ravni; sredina pomjera preko nivoa ispod pokazivača. |
| **Rotiraj** | E (ili R) | Prsten po osi se okreće oko nje. Prsteni jedne figure su njen vlastiti zakret, propinjanje i valjanje; grupa se okreće oko osa svijeta oko svoje sredine. |
| **Skaliraj** | R (ili S) | Širi ili sabija odabrano iz sredine duž ose ili na sve strane; poluprečnik područja raste s tim. |

**Tasteri** prebacuju između W / E / R (Unity, Unreal) i G / R / S (Blender); tasteri biraju način samo dok je nešto odabrano, a inače pomjeraju kameru. Tako `R` znači **Skaliraj** uz tastere W / E / R i **Rotiraj** uz tastere G / R / S kada je nešto odabrano, a okreće sljedeću figuru za postavljanje kada ništa nije. Svi tasteri table su navedeni u [referenci tastature](keyboard-reference.md#tactics-board). Držite **Ctrl** dok prevlačite da pomjeranje prikačite na **Mrežu** (metri) ili okretanje na **Korak ugla**. **Prianjaj na tlo** (podrazumijevano uključeno) stavlja pomjerene ljude, vozila, oznake, tačke puta i područja na površinu nivoa; vazduhoplovi i helikopteri zadržavaju visinu, a prevlačenje duž strelice Y nikada ne prianja. Prevlačenje ručke nikada ne pomjera kameru. **Esc** poništava prevlačenje, a svaka promjena je jedan korak Poništi.

Tačke puta se prikazuju kao tačke na strelicama prikazanog koraka: kliknite jednu da je odaberete, prevucite je da je pomjerite, Delete da je izbacite. Odjeljak **Odabrane** prikazuje mjesto odabranog u metrima, zakret, propinjanje i valjanje figure u stepenima i poluprečnik područja, svaki za unos.

## Mjerenje vremena {#timing}

Putanja figure se mjeri: svaki segment traje koliko je dug preko nivoa - uzorkovan na površini svakih nekoliko metara, pa se brdo ili stepenice između dvije tačke računaju - pri brzini njenog **načina** kretanja za tu figuru u toj igri, plus eventualno **čekanje** na tački puta. Pješadija puzi, čuči, hoda (tiho), trči ili sprinta; vozila i čamci idu polako, oprezno, normalno ili žurno; vazduhoplovi i helikopteri lete sporo, krstare, idu borbenom brzinom ili maksimalno. Način koji igra nema (CS2 nema sprint) uzima najbliži koji ima. Kako nagib usporava zavisi od igre: u CS2 i Valorantu računa se samo horizontalna udaljenost, kao u igrama; vojni simulatori usporavaju pješadiju uzbrdo (Toblerova funkcija hodanja) i vozila prema nagibu.

Brzine dolaze iz tabela po igri s njihovim izvorima (vidi [Brzine kretanja](tactics-speeds.md)): CS2 prema oružju u ruci, iz definicija oružja igre; Valorant prema oružju; Battlefield, Squad, Arma i zračne igre prema tipu i klasi vozila. **Kreće se kao** bira profil figure (oružje, tip vozila); **Vlastita (m/s)** nadjačava bilo koji način za tu figuru. Načini su imenovani kao ih tabla prikazuje: *Puzanje*, *Čučanje*, *Hod (tiho)*, *Trčanje*, *Sprint*; *Oprezno*, *Normalno*, *Žurba*; *Sporo*, *Krstarenje*, *Borba*, *Maksimalno*.

Svaka tačka puta prikazuje vrijeme od posljednje i vrijeme od početka plana ("+3,9 s · 0:12"). Putanja odabrane figure navodi svaki segment s njegovim načinom, dužinom i vremenom, čekanjem i dolaskom. **Dolasci** pod **Mjerenje vremena** stavlja svaku figuru s putanjom na jednu vremensku liniju, prvi dolazak na vrhu. Uz **Reprodukuj u stvarnom vremenu** (podrazumijevano uključeno) korak traje dok ne stigne njegova najsporija putanja, a svaka figura se kreće svojom brzinom; **Sekunde** su tada najkraća dužina koraka. **Jedinica nivoa po metru** kaže u čemu je nivo: 39,37 za mape CS2 (jedinice igre), 1 za mape u metrima.

## Poređenje s podacima meča {#compare-with-match-data}

**Učitaj datoteke mečeva…** čita tabele CS2 mečeva za mapu (Parquet datoteke CS2 alata, koliko god želite; samo potrebne kolone, u pozadini); **Koristi učitane podatke** uzima podatke učitane u pregledaču. Zatim:

- **Najraniji dolazak na mapi** boji mapu prema vremenu od početka runde kada je igrač prvi put stigao do svakog mjesta - dugme **Najbrži** prikazuje najbrže preko svih rundi, **Tipično (medijan)** srednju rundu - od zelene rano do crvene kasno, za jednu stranu ili obje. Pokazuje šta je moguće u kojem trenutku.
- Odabrana putanja poredi se s onim što su igrači postigli od njenog početka (ili od početka runde) do kraja, svaki kraj kao disk zadanog poluprečnika: "Najbrže viđeno 14,2 s, p10 15,0 s, medijana 18,3 s u 41 pokretanju; vaš plan 15,1 s".
- Brzine kojima su igrači zaista kretali - trčanje, hod, čučanje, iz kolona hoda i čučanja u tabelama - u m/s.

## Koraci {#steps}

Traka ispod prikaza sadrži korake. Plan počinje s jednim; **+** dodaje jedan, a svaka figura počinje tamo gdje je završila njena putanja u posljednjem koraku; **−** uklanja prikazani. **Sekunde** je koliko prikazani korak traje kada se pusti. **▶** (K) pušta od prikazanog koraka do kraja: figure s putanjom je prolaze, figure pomjerene na novo mjesto u sljedećem koraku kliznu tamo, ostale stoje. Dok je korak prikazan, mjesto svake figure u sljedećem koraku crta se kao blijedi duh, a strelice posljednjeg koraka slabo ispod ovih.

## Čuvanje {#saving}

Odjeljak **Datoteka** sadrži **Sačuvaj**, **Otv.** i **Očisti**. **Sačuvaj** upisuje plan kao `<name>.h3dplan.json` (običan JSON: strane, koraci, figure s mjestom po koraku, strelice, područja, bilješke); **Otv.** ga čita nazad. Datoteka druge verzije, ili ona koja nije plan, se odbija uz razlog. **Očisti** prazni plan; Poništi ga vraća.

## Figure {#figures}

Svaku figuru pravi sam pregledač: jednostavni oblici na objavljenu veličinu tipa, s osobinama koje je razlikuju od susjeda - gusjeničarski točkovi i kula tenka, cijevi, rakete i radari vozila protivvazdušne odbrane, tlocrt krila vazduhoplova, rep i motori, rotori i kratka krila helikoptera. Ništa se ne uzima iz igre. Dizajn koji je igra izmislila prikazuje se kao generička figura svoje klase. Vidi [Figure](figures.md#which-figure-a-unit-gets) za to kako podaci nalaze svoju figuru.

## Riotova napomena {#riots-notice}

Valorant mape se prikazuju po politici Riot Games-a "Legal Jibber Jabber", koja dozvoljava besplatnim projektima zajednice da ih koriste i traži ovu napomenu gdje god se pojave. Napomena je preuzeta doslovno: *3DHeat was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.* Sposobnosti na tabli su generički oblici, a ne Riotova umjetnost.
