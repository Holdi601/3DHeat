---
title: "Kamera i upravljanje"
nav_order: 14
has_children: true
lang: "bs"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera i upravljanje

Letite kroz scenu kao ptica: **W A S D** za kretanje, prevucite miša za gledanje. Koristite ovu stranicu da letite, da skočite na pogled odozgo ili sa strane i da pročitate tačno gdje je kamera.

## Letenje u 4 koraka {#fly-in-4-steps}

1. Kliknite jednom na prikaz da on dobije tastaturu.
2. Držite **W** da letite naprijed, **S** nazad, **A** i **D** u stranu, **Razmak** gore, **Q** dolje.
3. Držite lijevo ili desno dugme miša i prevucite da gledate okolo.
4. Pritisnite **F** da ponovo uokvirite sve podatke.

Kamera je slobodno-leteća kamera s perspektivnom i paralelnom projekcijom, unaprijed zadanim pogledima, upisanom pozom i dubinskom oštrinom. Njene postavke su na panelu **Kamera i scena** pri dnu bočne trake (prikazan i na karticama Analiza utrke i Meč). Implementacija je [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Letenje {#flying}

| Unos | Efekat |
|---|---|
| `W` `A` `S` `D` ili tasteri sa strelicama | Naprijed (duž pogleda, uključujući njegov nagib), lijevo, nazad, desno |
| `Space` ili `E` | Gore (gore u svijetu) |
| `Q` ili lijevi `Ctrl` | Dolje |
| `Shift` (držan) | 6 puta brže |
| lijevi `Alt` (držan) | 15% brzine |
| Prevlačenje lijevim ili desnim dugmetom miša | Gledanje okolo. Pokazivač je zaključan dok prevlačite. |
| Točkić miša | Brzina leta ×1,5 po zarezu (perspektiva); zumiranje (paralelno) |
| `F` | Uokviri podatke |
| Klik (bez prevlačenja) | Pokazuje šta je pod pokazivačem ([Pregled prikaza](#inspecting-the-view)) |
| `C` | Kopira položaj kamere, zakretanje i propinjanje |
| `G` | Idi na unesenu tačku |
| `Esc` | Zatvara karticu izbora (i prestaje pratiti jedinicu) |

### Dok se prati jedinica {#while-following-a-unit}

Kad kamera prati jedinicu u reprodukciji ([Reprodukcija meča](match-replay.md)), tasteri za letenje rade nešto drugo:

| Unos | Efekat |
|---|---|
| Točkić, `W` / `S` | Bliže jedinici / dalje od nje (više / niže u satelitskom pogledu) |
| `A` / `D`, `Q` / `E` | Kruženje oko jedinice (pogledi iza i orbita) |
| Prevlačenje | Gledanje oko jedinice (kokpit: gledanje unutar njega) |
| `V` / `Shift+V` | Sljedeći / prethodni pogled kamere |
| `Esc` | Prvo prestaje gledanje druge jedinice, zatim prestaje praćenje |

Tasteri za kretanje se sabiraju s [kontrolerom](gamepad.md); vidi [referencu tastature](keyboard-reference.md) za sve ostalo. Tasteri se ignorišu dok je fokus u tekstualnom polju ili padajućoj listi. Nagib je ograničen tik ispod ravno gore i dolje.

## Panel Kamera i scena {#camera--scene-panel}

![Panel Kamera i scena: Projekcija, Unaprijed zadani pogledi, dugmad Vidno polje, Brzina leta i Poza](../assets/img/en/camera-panel.webp)

### Projekcija {#projection}

**Projekcija**: *Perspektiva* (podrazumijevano) ili *Paralelna*.

*Paralelna* (ortografska) uklanja skraćivanje, pa dva žarišta jednake gustine izgledaju iste veličine bilo gdje u kadru - poređenje koje toplotna mapa postoji da podrži - i zbog nje je izometrijski pogled izometrijski. U paralelnom režimu točkić miša zumira (nema kretanja naprijed koje mijenja razmjeru) i [prikaz brzine](#fly-speed) je skriven.

**Prebacivanje čuva istu veličinu predmeta.** Paralelna projekcija nema vidno polje, pa njena visina okvira nije povezana s udaljenošću kamere; naivno prebacivanje ili jako zumira ili ništa ne prikaže. Prelazak na paralelnu postavlja visinu okvira na ono što perspektivna kamera pokriva na udaljenosti fokusa (2 × udaljenost × tan(fov / 2), pri čemu je udaljenost fokusa udaljenost posljednjeg uokviravanja). Povratak vraća perspektivnu pozu koju ste napustili, u istoj prividnoj razmjeri, a ne tamo gdje je paralelni pogled odlutao.

### Unaprijed zadani pogledi {#preset-views}

| Grupa | Dugmad | Orijentacija |
|---|---|---|
| **Izometrija** | **SI**, **SZ**, **JI**, **JZ** | Paralelna, nagib -35,264° (= atan(1/√2), ugao pri kojem se sve tri ose projektuju na istu dužinu), zakretanje -45°, 45°, -135°, 135°. Četiri ugla, jer jedan uvijek sakrije pola mape iza onoga što je bliže. |
| **Pogledi sa strane** | **Odozgo**, **Odozdo**, **Sprijeda**, **Straga**, **Lijevo**, **Desno** | Paralelna. Odozgo gleda ravno dolje (nagib -89,9°), Odozdo ravno gore, Sprijeda duž -Z (zakretanje 0°), Straga duž +Z (180°), Lijevo duž -X (-90°), Desno duž +X (90°). |
| | **Nazad na perspektivu** | Vraća perspektivnu pozu koju ste napustili. Onemogućeno u perspektivi. |
| | **Pogled iz tri četvrtine** | Perspektiva, zakretanje -35°, nagib -28°. |

Svaki unaprijed zadani pogled mijenja samu projekciju - u perspektivi „pogled odozgo" i dalje konvergira prema tački nestajanja, a jednake površine prestaju da izgledaju jednake - i uokviruje podatke iz tog smjera.

### Vidno polje {#field-of-view}

**Vidno polje** - vertikalni ugao. Podrazumijevano 65°, 10-140° na traci (179° s ručicom), s dugmadima **Ravno 20°**, **Dugo 35°**, **Normalno 50°**, **Široko 65°**, **Vrlo široko 90°**. Usko spljoštava perspektivu i liči više na paralelnu projekciju; široko naglašava dubinu i otežava procjenu udaljenosti. Ostaje aktivno u paralelnom režimu, gdje postavlja razmjeru koju povratak računa i udaljenost koju koristi **Uokviri**.

### Brzina leta {#fly-speed}

**Brzina leta** - svjetske jedinice (metri) u sekundi pri punom gasu. Podrazumijevano 120; pri svakom učitavanju horizontalni opseg podataka / 12. Logaritamska, 0,02-20.000 (200.000 s ručicom; ručica je mijenja po omjerima, a ne iznosima). Točkić miša je množi ili dijeli s 1,5 po zarezu, u okviru 0,02-200.000.

Ista vrijednost se prikazuje dolje desno na prikazu (samo perspektiva): brzina u m/s ili km/s i vrijeme potrebno da se pređu podaci (ili nivo, kad je učitan 3D nivo) pri toj brzini. Prevucite je gore ili dolje da promijenite brzinu.

### Blizu i daleko {#near-and-far}

**Blizu** (podrazumijevano 0,5) i **Daleko** (podrazumijevano 40.000) su udaljenosti odsijecanja. Obje se računaju iz podataka pri svakom učitavanju (blizu = max(0,05, opseg / 20.000), daleko = opseg × 12) i proširuju, nikad ne sužavaju, 3D nivoom koji je veći ([Nivoi](levels.md#what-a-level-does-for-the-heat)). Njihov odnos određuje preciznost dubine na koju se oslanja zaklanjanje, pa mala vrijednost blizu uz veliku daleko slabi [zaklanjanje](depth-and-culling.md). Gledano izvan scene ili visoko iznad njenog tla, ravan blizu koja se stvarno koristi pomjera se na 2% te udaljenosti, pa mapa gledana izdaleka zadržava dovoljno preciznosti dubine da voda i obala ne trepere; okvir i dalje prikazuje postavljenu vrijednost.

### Ostale kontrole {#other-controls}

| Kontrola | Podrazumijevano | Značenje |
|---|---|---|
| **Obrni Y** | isključeno | Obrće gledanje mišem gore/dolje. |
| **Dubinska oštrina** | isključeno | Vidi ispod. |
| **Kontroler** | uključeno | Vidi [Kontroler i HOTAS](gamepad.md). |
| **Poza** | | Vidi ispod. |
| **Inspekcija** | | Očitavanje kamere, izbor klikom, konvencija zakretanja i *Idi na tačku*; vidi [Pregled prikaza](#inspecting-the-view). |
| **Uokviri skup podataka (F)** | | Uklapa podatke (na kartici Analiza utrke: krugove) u prikaz, zadržavajući trenutni smjer. Kamera se postavlja na r / tan(fov / 2) od centra, pri čemu je r polovina dijagonale granica podataka. |
| **Mreža**, **Ose** | uključeno, uključeno | Mreža na tlu s razmakom 1/2/5 × 10ⁿ od oko 1/40 raspona podataka (proteže se do 1,5 × podataka, između 8 i 120 koraka mreže), i obojene ose. |
| **Obrni osu svijeta** X, Y, Z | isključeno | Vidi ispod. |

### Poza {#pose}

Pet polja za brojeve - **X**, **Y**, **Z** i **zakretanje °**, **propinjanje °** - koja prate kameru dok nijedno nije u fokusu. Upišite vrijednost i pritisnite `Enter` (ili napustite polje) da pomjerite kameru tamo. **kopiraj** stavlja `pos X Y Z · yaw A · pitch B` na clipboard (uz `(game yaw)` iza njega kad je ta konvencija izabrana). Letenje je način istraživanja; koordinate su način da ponovite pogled. To su iste brojke kao [očitavanje kamere](#camera-readout): vlastite koordinate podataka, uključujući kad je osa obrnuta, i zakretanje u izabranoj [konvenciji](#yaw-conventions).

### Obrni osu svijeta {#invert-world-axis}

**Obrni osu svijeta X / Y / Z** crta svijet s tom osom obrnutom. Igra koja čuva lijevo-orijentisani svijet ispada zrcaljena u ovom pregledaču s desno-orijentisanim sistemom - desni zavoji nacrtani kao lijevi - a obrtanje X ili Z to vraća. **Mijenja se samo crtanje**: podaci, analiza i svaka koordinata koju alati prikazuju (poza, mjerilo, isječak) ostaju igrina vlastita. Pogled se okreće na mjestu, zadržavajući da gledate na istu tačku. Ova postavka se pamti u pregledaču (ključ `localStorage` `heat3d.mirror`); uporedite s [okretanjima](axes-units-and-time.md#flips) pri učitavanju, koja mijenjaju podatke.

## Pregled prikaza {#inspecting-the-view}

Gdje je kamera, šta je pod pokazivačem i odlazak na tačku - blok **Inspekcija** na panelu Kamera i scena i dva preklapanja u gornjem lijevom uglu prikaza. Kod je u [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) i [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Kontrola | Podrazumijevano | Značenje |
|---|---|---|
| **Položaj kamere preko prikaza** | uključeno | Očitavanje kamere, dolje. Također se zatvara sa svojim **×**. |
| **Klik pokazuje šta je tamo** | uključeno | Izbor klikom, dolje. |
| **Konvencija zakretanja** | Preglednik | Koje zakretanje očitavanje, polja poze i kutija za skok prikazuju i čitaju. |

Ove tri postavke se pamte u pregledaču (ključ `localStorage` `heat3d.inspect`).

### Očitavanje kamere {#camera-readout}

U gornjem lijevom uglu prikaza: **x**, **y**, **z**, **zakretanje** i **nagib** kamere, uživo, s oznakom koja imenuje konvenciju zakretanja. Prikazuje iste brojke kao polja [Poza](#pose) i ne troši ništa dok letite (piše se na stranicu na taktu kadra, bez ponovnog iscrtavanja panela).

- **kopiraj** (ili `C` bilo gdje van tekstualnog polja) stavlja `x X y Y z Z yaw A pitch B (viewer yaw)` na clipboard, s decimalama `.` na bilo kojem jeziku - red koji kutija za skok i bilo koja skripta čitaju nazad.
- **idi na** (ili `G`) otvara polje ispod: nalijepite tačku i pritisnite `Enter` da je pogledate, ili nalijepite cijelu kopiranu pozu da stanete u taj pogled. `Esc` zatvara polje.

### Koordinate: vlastiti sistem podataka {#coordinates-the-datas-own-frame}

Svaka koordinata koju alati za inspekciju prikazuju ili prihvataju je u **vlastitom sistemu učitanih podataka**: [mapiranje osa](axes-units-and-time.md) pri učitavanju (osa gore, okretanja, razmjera) se poništava. Položaj očitan s prikaza je broj koji tabela izvora sadrži, a broj iz tabele unesen u kutiju za skok slijeće na to mjesto. Kad mapiranje ništa ne mijenja (učitavanje s Y-gore i bez razmjere - što pišu alati za snimanje i izvoznici nivoa) to je jednostavno svijet; inače očitavanje nosi oznaku **sistem podataka**. Bez skupa podataka, koordinate su svjetske koordinate. Zakretanje i nagib su uvijek u odnosu na svijet pregledača, Y gore.

### Konvencije zakretanja {#yaw-conventions}

| Konvencija | Zakretanje 0° gleda duž | Raste prema | Koriste je |
|---|---|---|---|
| **Preglednik** | -Z | -X | slobodno-letuća kamera, [unaprijed zadani pogledi](#preset-views) |
| **Igra / alati za snimanje** | +X | -Z | kolone `yaw` i poze alata za snimanje; u nivou izvezenom u sistemu pregledača, vlastito zakretanje igre |

Nagib je isti u obje: gore od horizontale. Razlikuju se za četvrt okreta i ništa drugo:

> zakretanje preglednika = zakretanje igre - 90°

Smjer `d` je `(cos p · cos y, sin p, -cos p · sin y)` u konvenciji igre, a `(-sin y · cos p, sin p, -cos y · cos p)` u konvenciji pregledača. Izaberite **Igra / alati za snimanje** da ukucate zakretanje direktno iz tabele snimanja, ili da uporedite očitavanje s jednim takvim.

### Odlazak na tačku {#going-to-a-point}

**Idi na tačku**, u bloku Inspekcija (i u polju **idi na** očitavanja):

- tekstualno polje prihvata `x, y, z` ili `x y z` (ili `x; y; z`), s decimalnom tačkom ili decimalnim zarezom - `-321.6, 137.8, -59.9` i `-321,6 137,8 -59,9` su ista tačka. Pet brojeva dodaje zakretanje i nagib, a poza kopirana iz očitavanja ili polja poze se čita cijela, s oznakama i konvencijom;
- **zakretanje °** i **nagib °** (opciono) okreću kameru, u izabranoj konvenciji;
- **Pogledaj** zadržava smjer (nagnut da gleda dolje najmanje 20° ako je gledao ravno) i odmiče se duž njega na trenutnu udaljenost, držan između 0,3% i 3% širine scene - 6 do 60 m na nivou od dva kilometra. Udaljenost fokusa, visina paralelnog pogleda i brzina leta prate, pa pogled stiže upotrebljiv;
- **Stani ovdje** stavlja kameru na tačku, okrenutu prema zadanom zakretanju i nagibu, ili kako je bila.

Nalijepljena poza sa svojim zakretanjem i nagibom uvijek stane u taj pogled.

### Izbor klikom {#click-to-pick}

Klik na prikaz - pritisak i otpuštanje bez prevlačenja više od 4 piksela; prevlačenje i dalje gleda okolo - prikazuje karticu u gornjem lijevom uglu s onim što je pod pokazivačem. Dok je [lenjir](measure.md) uključen, klikovi idu lenjiru.

**Nacrtana tačka podataka pobjeđuje.** Najbliži uzorak unutar 8 piksela od klika, od onih zaista nacrtanih: redovi u vremenskom prozoru i životnom vijeku, koji prolaze [filtere](filters.md), prikazane grupe i podjelu razlike, unutar odsijecanja po udaljenosti i isječka koji odsijeca toplotu. U reprodukciji kutije, kutija pod pokazivačem (bilo gdje na njoj). Kartica navodi svaku kolonu koju red nosi, pod imenima kolona samog izvora - vrijeme (stvarno vrijeme, ili sekunde same datoteke s `m:ss.ss`), osoba, grupa, sesija, svaka zadržana kolona, položaj i smjer gledanja - i rastojanje od kamere. U memoriji su samo kolone koje je učitavanje zadržalo: kolona koja nije izabrana kao [kolona filtera](column-mapping.md) se ne prikazuje.

**Inače površina nivoa**: tačka u kojoj se zraka klika sastaje sa stvarnim trouglovima nivoa (ne referentnom ravni lenjira), s **dijelom** kojem pripada (ime izvoznika, `structure:props`, `ground:terrain …`), njenom **vrstom** (tlo, konstrukcija, voda, slika mape), koordinatama i rastojanjem. Geometrija skrivena isječkom ili odsijecanjem po udaljenosti se propušta. Gdje nivo ima [mrežu za navigaciju](model-levels.md#navigation-meshes), red je imenuje i kaže da li mjesto na njoj leži (✓). Ime dijela s prefiksom `≈` pogođeno je iz graničnih kutija dijelova, jer je taj dio nivoa pojednostavljen pri učitavanju.

Kartica ostaje dok se ne zatvori (**×**, `Esc`), dok sljedeći klik ne odgovori na nešto drugo, ili klik na prazno. Cijan krst se crta na tački u sceni, a prsten preko njega na ekranu. Njena dugmad: **kopiraj** (sve vrijednosti, i koordinate kao `x, y, z`), **Pogledaj** i **Stani ovdje** (na tački podataka, gledajući kako je red gledao kad ima smjer gledanja; na površini, 1,7 m iznad nje).

Nivo se indeksira za izbor pri prvom kliku kojem treba: mreža kolona preko njegovog otiska, gradi se nekoliko milisekundi između kadrova tako da se prikaz nikad ne zaustavlja (oko sekunde rada za nivo od nekoliko miliona trouglova), i čuva se dok se nivo ne promijeni. Do tada kartica kaže *Priprema nivoa za izbor* s procentom, i odgovara na klik kad je spreman. Pretraga tačke podataka nad više od četiri miliona nacrtanih redova raspoređuje se preko kadrova na isti način.

## Dubinska oštrina {#depth-of-field}

Sklopivi odjeljak u Kamera i scena, naslovljen *Dubinska oštrina - uključeno* dok je uključen. Podrazumijevano isključeno: to je efekat prikaza, a podrazumijevani pogled treba da pokazuje podatke, a ne tumačenje njih.

| Kontrola | Podrazumijevano | Opseg (točkić) | Značenje |
|---|---|---|---|
| **Uključeno** | isključeno | | |
| **Fokusiraj na ono što je uokvireno** | uključeno | | Fokus na udaljenosti koju je koristilo posljednje uokviravanje (*Fokusirano na N m.*). |
| **Udaljenost fokusa** | 1000 | 1-200.000, logaritamski (10.000.000) | Prikazano kad je fokus ručni. |
| **Otvor blende** | ±35% | ±2% do ±200%, logaritamski (±3200%) | Dubina koja ostaje oštra, kao dio udaljenosti fokusa - relativno, a ne f-broj, jer scene idu od sobe do mape od osam kilometara. |
| **Najveće zamućenje** | 12 px | 1-48 (256) | Najveći poluprečnik zamućenja; trošak raste s njim. |

Zamućuje **nivo, mrežu i kutije** - *ne toplotu*. Toplota u pikselu je zbir sprajtova na mnogo dubina, pa nema jedne dubine na kojoj bi bila van fokusa; zamućivanje je geometrijom koja stoji iza nje bilo bi pogrešno gdje god lebdi ispred. Oštri podaci preko omekšanog konteksta su i korisnije od ovo dvoje. Zamućenje je skupljanje od 24 uzorka po zlatnom uglu u kompozitnom prolazu, ponderisano tako da oštar prvi plan ne bude razmazan prema van zamućenom pozadinom iza njega. Promjena ga ponovo iscrtava bez ponovnog pokretanja akumulacije toplote.

## Rezolucija platna {#canvas-resolution}

Platno se iscrtava pri odnosu piksela prikaza, ograničenom na 2. Bafer toplote se može iscrtati pri nižoj rezoluciji od toga ([Rezolucija toplote](performance-and-stats.md)).

## Stranice u ovom odjeljku {#pages-in-this-section}

- [Kontroler i HOTAS](gamepad.md)
- [Referenca tastature i miša](keyboard-reference.md)
