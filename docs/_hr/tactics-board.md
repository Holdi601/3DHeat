---
title: "Ploča taktika"
nav_order: 15
has_children: true
lang: "hr"
source: "tactics-board.md"
source_hash: "09172046f5ac"
translated: true
outdated: false
---

# Ploča taktika

Kartica **Taktika** je ploča za crtanje timskog plana: na kartu stavljate male figure, crtate strelice za to kamo idu i pritisnete reprodukciju da vidite što se događa. Koristite je da isplanirate rundu ili napad prije nego igrate. Dijeli platno, kameru i [razinu](levels.md) s ostalim karticama i ništa više; plan nije podatak i ne crta toplinu.

## Vaš prvi plan {#your-first-plan}

1. Otvorite karticu **Taktika**. Odaberite **Igra** (na primjer Counter-Strike 2) i, za Valorant, pritisnite **Učitaj karte za Valorant** i odaberite **Karta**. Ili prvo učitajte [razinu](levels.md).
2. Odaberite **Stranu** (ona postavlja boju) i pritisnite **Pogled odozgo**.
3. Odaberite **Mjesto**, odaberite figuru u **Figure** (koristite **Traži figure** da je nađete) i kliknite na kartu. Postavite dvije ili tri.
4. Odaberite **Strelicu**, kliknite na figuru, kliknite duž puta kojim bi trebala ići, i pritisnite **Enter** da završite strelicu.
5. Pritisnite **+** ispod prikaza da dodate korak 2. Svaka figura počinje tamo gdje je završila njezina strelica. Tamo nacrtajte još strelica.
6. Pritisnite **▶** (ili `K`) da pustite plan od prikazanog koraka do kraja.
7. Imenujte plan u **Naziv plana** i pritisnite **Spremi**.

![Kartica Taktika u pogledu odozgo: igra, strane i alati lijevo, tri figure sa strelicama Pomakni, luk bacanja dima, Područje i koraci duž dna](../assets/img/hr/tactics.webp)

## Početak plana {#starting-a-plan}

| Kontrola | Što radi |
|---|---|
| **Igra** | Bira strane i figure koje paleta nudi: Counter-Strike 2 (T, CT; igrači i pomoćna oprema), Valorant (Napad, Obrana; igrači i opće sposobnosti), Battlefield, Squad, Arma (pješaštvo, kopnena vozila, zrakoplovi, brodovi), DCS / War Thunder / IL-2 (mlaznjaci, zrakoplovi s propelerom, helikopteri, protuzračna obrana, kopno, brodovi, oružje) i Ostalo. Plan koji već ima figure zadržava svoje strane kad se igra promijeni. |
| **Naziv plana** | Ime pod kojim se plan sprema. |
| **Karta**, **Učitaj karte za Valorant** | Uz odabran Valorant: **Učitaj karte za Valorant** dohvaća popis karata s [valorant-api.com](https://valorant-api.com); **Karta** tada postavlja mini kartu odabrane karte kao razinu, uokvirenu odozgo. Slika se dohvaća kad se odabere i nikad se ne isporučuje. Riotova obavijest prikazuje se dok je na zaslonu (vidi dolje). |
| **Strana** | Strana kojoj pripada sljedeća figura, strelica ili područje; preuzima boju strane. |

Bez razine ploča je ravna ravnina tla. Učitajte razinu pod **Razina** da planirate na stvarnoj karti: CS2 kartu izvezenu CS2 alatom, razinu iz biblioteke ili sliku karte.

## Alati {#tools}

| Alat | Klik | Napomene |
|---|---|---|
| **Odaberi** | Figura, točka puta, strelica, područje ili bilješka se odabire ovim. | Shift+klik dodaje ili uklanja; Shift+povlačenje crta okvir oko onoga što treba dodati. Odabir dobiva ručku za transformaciju (vidi dolje); `Delete` ili `Backspace` ga uklanja. `M` pomiče odabranu figuru na sljedeći klik. |
| **Mjesto** | Stavlja odabranu figuru. | Figura se bira u paleti **Figure** (uz **Traži figure**). Bez odabira, `R` okreće sljedeću figuru za 15° prije stavljanja (`Shift+R` u drugu stranu). |
| **Strelica** | Svaki klik dodaje točku; Enter, dvostruki klik ili desni klik završava, Esc odbacuje. | **Pomakni**, **Napad** (šire vrh) ili **Promatranje** (tanka linija na visini očiju). Strelica započeta na figuri je njezin put u ovom koraku: pri reprodukciji figura po njemu hoda, a sljedeći korak počinje tamo gdje je završila. |
| **Bacanje** | Bacač, zatim gdje sleti. | Isprekidani luk od jednog do drugog, a odabrano pomoćno sredstvo (dim, bljeskalica, molotov, ...) pojavljuje se gdje sleti i ostaje od ovog koraka nadalje. |
| **Područje** | Središte, zatim rub. | Disk u boji strane. |
| **Bilješka** | Gdje ide bilješka; traži njezin tekst. | Prikazuje se kao pribadača, a njezin tekst iznad nje. |
| **Briši** | Figura, strelica, područje ili bilješka. | Uklanja je od ovog koraka nadalje; na prvom koraku, uklanja je. |

**Poništi** i **Ponovi** (`Ctrl+Z`; `Ctrl+Y` ili `Ctrl+Shift+Z`) prolaze kroz svaku promjenu. Crta ispod plana pokazuje koliko figura, strelica i koraka ima. **Pogled odozgo** gleda ravno dolje (ortografski), **3D prikaz** vraća perspektivu, **Kadar** uklapa plan, ili razinu kad je plan prazan.

**Veličina figura** skalira svaku figuru na ploči; 1× je stvarna veličina, što je izdaleka nekoliko piksela za osobu.

## Pomicanje, okretanje i skaliranje {#moving-turning-and-scaling}

Sve na ploči može se pomicati kao u 3D uređivaču: figure, pomoćna sredstva, oznake, pojedinačne točke puta i cijele strelice, područja i bilješke. Ono što je odabrano dobiva ručku u svojoj sredini:

| Način | Tipke | Ručke |
|---|---|---|
| **Pomakni** | W (ili G) | Strelica po osi (X crveno, Y zeleno i gore, Z plavo) pomiče duž nje; kvadrat pomiče kroz svoju ravninu; središte pomiče preko razine ispod pokazivača. |
| **Zakreni** | E (ili R) | Prsten po osi okreće oko nje. Prstenovi jedne figure su njezin vlastiti yaw, pitch i roll; grupa se okreće oko osi svijeta oko svoje sredine. |
| **Skaliraj** | R (ili S) | Širi ili skuplja odabir iz sredine duž osi ili na sve strane; polumjer područja raste s tim. |

**Ključevi** prebacuju između W / E / R (Unity, Unreal) i G / R / S (Blender); tipke biraju način samo dok je nešto odabrano, a inače lete kamerom. Dakle `R` znači **Skaliraj** s tipkama W / E / R i **Zakreni** s tipkama G / R / S dok je nešto odabrano, a okreće sljedeću figuru za stavljanje kad ništa nije odabrano. Sve tipke ploče navedene su u [referenci tipkovnice](keyboard-reference.md#tactics-board). Držite **Ctrl** dok povlačite da pomak prikvačite na **Mrežu** (metri) ili okret na **Korak kuta**. **Prianjaj na tlo** (uključeno prema zadanom) stavlja pomaknute ljude, vozila, oznake, točke puta i područja na površinu razine; zrakoplovi i helikopteri zadržavaju visinu, a povlačenje duž strelice Y nikad ne prianja. Povlačenje ručke nikad ne pomiče kameru. **Esc** odustaje od povlačenja, a svaka promjena je jedan korak Poništi.

Točke puta prikazuju se kao točke na strelicama prikazanog koraka: kliknite jednu da je odaberete, povucite je da je pomaknete, Delete da je izbacite. Odjeljak **Odabrane** prikazuje mjesto odabira u metrima, yaw, pitch i roll figure u stupnjevima i polumjer područja, svaki za upisivanje.

## Vremenska mjerenja {#timing}

Put figure je vremenski mjeren: svaki segment traje onoliko koliko je dugačak preko razine - uzorkovan na površini svakih nekoliko metara, pa se brdo ili stubište između dvije točke računa - pri brzini njezinog načina **kretanja** za tu figuru u toj igri, plus eventualno **čekanje** na točki puta. Pješaci puze, čuče, hodaju (tiho), trče ili sprintaju; vozila i brodovi polako, oprezno, normalno ili jurišaju; zrakoplovi i helikopteri lete sporo, krstarenjem, borbenom brzinom ili maksimalno. Način koji igra nema (CS2 nema sprint) uzima najbliži koji ima. Kako nagib usporava ovisi o igri: u CS2 i Valorantu računa se samo vodoravna udaljenost, kao u igrama; mil-sim igre usporavaju pješaštvo uzbrdo (Toblerova funkcija hodanja) i vozila prema nagibu.

Brzine dolaze iz tablica po igri s njihovim izvorima (vidi [Brzine kretanja](tactics-speeds.md)): CS2 po oružju koje se drži, iz definicija oružja igre; Valorant po oružju; Battlefield, Squad, Arma i zračne igre po vrsti i klasi vozila. **Kreće se kao** bira profil figure (oružje, vrsta vozila); **Vlastita (m/s)** poništava bilo koji način za tu figuru. Načini se nazivaju kao što ih ploča prikazuje: *Puzanje*, *Čučanje*, *Hodanje (tiho)*, *Trčanje*, *Sprint*; *Oprezno*, *Normalno*, *Jurišaj*; *Sporo*, *Krstarenje*, *Borba*, *Maksimalno*.

Svaka točka puta prikazuje vrijeme od zadnje i vrijeme od početka plana („+3,9 s · 0:12”). Put odabrane figure navodi svaki segment s njegovim načinom, duljinom i vremenom, čekanjem i dolaskom. **Dolasci** pod **Mjerenje vremena** stavlja svaku figuru s putem na jednu vremensku liniju, prvi dolazak na vrhu. Uz uključeno **Pusti u stvarnom vremenu** (uključeno prema zadanom) korak traje dok ne stigne najsporija ruta, a svaka figura se kreće vlastitom brzinom; **Sekunde** su tada najmanja duljina koraka. **Jedinica razine po metru** kaže u čemu je razina: 39,37 za CS2 karte (jedinice igre), 1 za karte u metrima.

## Usporedba s podacima utakmica {#compare-with-match-data}

**Učitaj datoteke mečeva…** čita CS2 tablice utakmica karte (Parquet datoteke CS2 alata, koliko god ih želite; samo potrebni stupci, u pozadini); **Koristi učitane podatke** uzima podatke učitane u preglednik. Zatim:

- **Najraniji dolazak na karti** boji kartu prema vremenu od početka runde kad je igrač prvi put stigao do svakog mjesta - gumb **Najbrži** pokazuje najbrže preko svih rundi, **Tipično (medijan)** srednju rundu - od zelenog ranog do crvenog kasnog, za jednu stranu ili obje. Pokazuje što je moguće i kada.
- Odabrani put uspoređuje se s time što su igrači postigli od njegova početka (ili od početka runde) do njegova kraja, svaki kraj kao disk zadanog polumjera: „Najbrže zabilježeno 14,2 s, p10 15,0 s, medijan 18,3 s kroz 41 pokušaj; vaš plan 15,1 s”.
- Brzine kojima su igrači stvarno kretali - trčanje, hodanje, čučanje, iz stupaca tablica za hodanje i čučanje - u m/s.

## Koraci {#steps}

Traka ispod prikaza sadrži korake. Plan počinje s jednim; **+** dodaje jedan, a svaka figura u njemu počinje tamo gdje je završila njezina ruta u zadnjem koraku; **−** uklanja prikazani. **Sekunde** je koliko prikazani korak traje pri reprodukciji. **▶** (K) pušta od prikazanog koraka do kraja: figure s rutom hodaju njome, figure pomaknute na novo mjesto u sljedećem koraku kliznu tamo, ostale stoje. Dok je korak prikazan, mjesto svake figure u sljedećem koraku crta se kao blijeda sjena, a strelice zadnjeg koraka blijedo ispod ovih.

## Spremanje {#saving}

Odjeljak **Datoteka** sadrži **Spremi**, **Otvori** i **Očisti**. **Spremi** piše plan kao `<naziv>.h3dplan.json` (običan JSON: strane, koraci, figure s mjestom po koraku, strelice, područja, bilješke); **Otvori** ga čita natrag. Datoteka druge verzije, ili ona koja nije plan, odbija se uz razlog. **Očisti** prazni plan; Poništi ga vraća.

## Figure {#figures}

Svaku figuru izrađuje sam preglednik: jednostavni oblici prema objavljenoj veličini vrste, s obilježjima koja je razlikuju od susjeda - kotači gusjenica i kupola tenka, topovi, projektili i radari vozila protuzračne obrane, tlocrt krila, repa i motora zrakoplova, rotori i kratka krila helikoptera. Ništa nije uzeto iz igre. Dizajn koji je izmislila igra prikazuje se kao generička figura svoje klase. Kako podaci nalaze svoju figuru: [Figure](figures.md#which-figure-a-unit-gets).

## Riotova obavijest {#riots-notice}

Valorant karte prikazuju se prema politici Riot Gamesa „Legal Jibber Jabber”, koja dopušta besplatnim projektima zajednice da ih koriste i traži ovu obavijest gdje se pojave: *3DHeat je nastao prema politici Riot Gamesa „Legal Jibber Jabber” koristeći imovinu u vlasništvu Riot Gamesa. Riot Games ne odobrava niti sponzorira ovaj projekt.* Sposobnosti na ploči su generički oblici, a ne Riotova umjetnost.
