---
title: "Kamera i upravljanje"
nav_order: 14
has_children: true
lang: "hr"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera i upravljanje

Letite kroz scenu kao ptica: **W A S D** za kretanje, povucite mišem za gledanje. Koristite ovu stranicu za letenje, za skok na pogled odozgo ili sa strane i za točno čitanje gdje je kamera.

## Let u 4 koraka {#fly-in-4-steps}

1. Kliknite jednom na prikaz da bi imao tipkovnicu.
2. Držite **W** za let naprijed, **S** natrag, **A** i **D** u stranu, **Space** gore, **Q** dolje.
3. Držite lijevu ili desnu tipku miša i povucite za gledanje oko sebe.
4. Pritisnite **F** za ponovno uokvirivanje svih podataka.

Kamera je slobodna kamera za letenje s perspektivnom i paralelnom projekcijom, unaprijed postavljenim pogledima, upisanim položajem i dubinskom oštrinom. Njezine postavke su na ploči **Kamera i scena** pri dnu bočne trake (prikazana je i na karticama Analiza utrke i Meč). Implementacija je [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Letenje {#flying}

| Unos | Učinak |
|---|---|
| `W` `A` `S` `D` ili strelice | Naprijed (duž pogleda, uključujući nagib), lijevo, natrag, desno |
| `Space` ili `E` | Gore (svjetski gore) |
| `Q` ili lijevi `Ctrl` | Dolje |
| `Shift` (držano) | 6 puta brže |
| lijevi `Alt` (držano) | 15% brzine |
| Povlačenje lijevom ili desnom tipkom miša | Gledanje oko sebe. Pokazivač je zaključan dok povlačite. |
| Kotačić miša | Brzina letenja ×1,5 po zarezu (perspektiva); zumiranje (paralelno) |
| `F` | Uokviri podatke |
| Klik (bez povlačenja) | Pokaži što je pod pokazivačem ([Pregled prikaza](#inspecting-the-view)) |
| `C` | Kopiraj položaj kamere, zakret i nagib |
| `G` | Idi na upisanu točku |
| `Esc` | Zatvori karticu odabira (i prestani pratiti jedinicu) |

### Dok prati jedinicu {#while-following-a-unit}

Kad kamera prati jedinicu u reprodukciji ([Reprodukcija utakmice](match-replay.md)), tipke za letenje rade nešto drugo:

| Unos | Učinak |
|---|---|
| Kotačić, `W` / `S` | Bliže jedinici / dalje od nje (više / niže u satelitskom prikazu) |
| `A` / `D`, `Q` / `E` | Kruženje oko jedinice (prikazi Iza i Orbita) |
| Povlačenje | Gledanje oko jedinice (kokpit: gledanje unutra) |
| `V` / `Shift+V` | Sljedeći / prethodni pogled kamere |
| `Esc` | Prvo prestani gledati drugu jedinicu, zatim prestani pratiti |

Tipke za kretanje zbrajaju se s [gamepadom](gamepad.md). Za sve ostalo vidi [referencu tipkovnice](keyboard-reference.md). Tipke se ignoriraju dok je fokus u tekstnom polju ili padajućem izborniku. Nagib je ograničen tik ispod ravno gore i dolje.

## Ploča Kamera i scena {#camera--scene-panel}

![Ploča Kamera i scena: Projekcija, Unaprijed postavljeni pogledi, gumbi Vidno polje, Brzina letenja i Poza](../assets/img/en/camera-panel.webp)

### Projekcija {#projection}

**Projekcija**: *Perspektiva* (zadano) ili *Paralelna*.

*Paralelna* (ortografska) uklanja skraćivanje, pa dva žarišta jednake gustoće izgledaju jednake veličine bilo gdje u kadru. To je usporedba kojoj služi toplinska karta karte. Ona je i ono što izometrijski prikaz čini izometrijskim. U paralelnom načinu kotačić miša zumira (nema naprijed kretanja koje mijenja mjerilo), a [prikaz brzine](#fly-speed) je skriven.

**Prebacivanje čuva veličinu predmeta.** Paralelna projekcija nema vidno polje, pa njezina visina frustuma nije povezana s udaljenošću kamere. Naivno prebacivanje ili jako zumira ili ništa ne prikaže. Prelazak na paralelnu postavlja visinu frustuma na ono što perspektivna kamera pokriva na udaljenosti fokusa (2 × udaljenost × tan(vidno polje / 2); udaljenost fokusa je udaljenost zadnjeg uokvirivanja). Povratak vraća perspektivni položaj koji ste napustili, pri istom prividnom mjerilu, a ne tamo gdje je paralelni prikaz odlutao.

### Unaprijed postavljeni pogledi {#preset-views}

| Skupina | Gumbi | Orijentacija |
|---|---|---|
| **Izometrija** | **SI**, **SZ**, **JI**, **JZ** | Paralelna, nagib -35,264° (= atan(1/√2), kut pri kojem se sve tri osi projiciraju na istu duljinu), zakret -45°, 45°, -135°, 135°. Četiri kuta, jer jedan uvijek skriva pola karte iza onoga što je bliže. |
| **Ortogonalni pogledi** | **Odozgo**, **Odozdo**, **Sprijeda**, **Straga**, **Lijevo**, **Desno** | Paralelna. Odozgo gleda ravno dolje (nagib -89,9°), Odozdo ravno gore, Sprijeda duž -Z (zakret 0°), Straga duž +Z (180°), Lijevo duž -X (-90°), Desno duž +X (90°). |
| | **Natrag na perspektivu** | Vraća perspektivni položaj koji ste napustili. Onemogućeno u perspektivi. |
| | **Pogled iz tri četvrtine** | Perspektiva, zakret -35°, nagib -28°. |

Svaka unaprijed postavljena vrijednost mijenja samu projekciju: u perspektivi "pogled odozgo" i dalje konvergira prema nestajućoj točki, a jednake površine prestaju izgledati jednake. Ona uokviruje podatke iz tog smjera.

### Vidno polje {#field-of-view}

**Vidno polje**: okomiti kut. Zadano 65°, 10–140° na traci (179° s ručkom), s gumbima **Ravno 20°**, **Dugo 35°**, **Normalno 50°**, **Široko 65°**, **Vrlo široko 90°**. Usko spljoštava perspektivu i više liči na paralelnu projekciju. Široko pretjeruje dubinu i čini udaljenosti teškima za procjenu. Ostaje aktivno u paralelnom načinu, gdje određuje mjerilo koje prebacivanje rješava i udaljenost koju koristi **Kadar**.

### Brzina letenja {#fly-speed}

**Brzina letenja**: jedinice svijeta (metri) u sekundi pri punoj snazi. Zadano 120; pri svakom učitavanju vodoravni opseg podataka / 12. Logaritamski, 0,02–20.000 (200.000 s ručkom; ručka je mijenja omjerima, ne iznosima). Kotačić miša množi ili dijeli s 1,5 po zarezu, unutar 0,02–200.000.

Ista vrijednost prikazana je dolje desno na prikazu (samo perspektiva): brzina u m/s ili km/s i vrijeme koje je potrebno da se pređu podaci (ili razina, kad je učitana 3D razina) pri toj brzini. Povucite gore ili dolje da promijenite brzinu.

### Blizu i daleko {#near-and-far}

Udaljenosti odsječanja **Blizu** (zadano 0,5) i **Daleko** (zadano 40.000). Obje se ponovno računaju iz podataka pri svakom učitavanju (blizu = max(0,05; opseg / 20.000), daleko = opseg × 12). Šire se, nikad ne sužavaju, pomoću 3D razine koja je veća ([Razine](levels.md#what-a-level-does-for-the-heat)). Njihov omjer određuje dubinsku preciznost na koju se oslanja zaklanjanje, pa mali bliski i ogroman daleki slabe [zaklanjanje](depth-and-culling.md). Gledano izvan scene ili visoko iznad njezina tla, bliska ravnina koja se stvarno koristi pomiče se na 2% te udaljenosti. Tako karta gledana odozgo zadržava dovoljno dubinske preciznosti da voda i obala ne trepere. Okvir i dalje prikazuje postavljenu vrijednost.

### Ostale postavke {#other-controls}

| Postavka | Zadano | Značenje |
|---|---|---|
| **Obrni Y** | isključeno | Obrće gledanje mišem gore/dolje. |
| **Dubinska oštrina** | isključeno | Vidi dolje. |
| **Gamepad** | uključeno | Vidi [Gamepad i HOTAS](gamepad.md). |
| **Poza** | | Vidi dolje. |
| **Pregled** | | Očitanje kamere, odabir klikom, konvencija zakreta i *Idi na točku*; vidi [Pregled prikaza](#inspecting-the-view). |
| **Uokviri skup podataka (F)** | | Uklapa podatke (na kartici Analiza utrke: krugove) u prikaz, zadržavajući trenutni smjer. Kamera se postavlja na r / tan(vidno polje / 2) od središta, gdje je r polovica dijagonale granica podataka. |
| **Mreža**, **Osi** | uključeno, uključeno | Tlo s mrežom razmaka 1/2/5 × 10ⁿ, oko 1/40 raspona podataka (proteže se do 1,5 × podataka, između 8 i 120 koraka mreže), i obojene osi. |
| **Obrni os svijeta** X, Y, Z | isključeno | Vidi dolje. |

### Poza {#pose}

Pet polja za brojeve (**X**, **Y**, **Z** i **zakret °**, **nagib °**) prate kameru dok nijedno nema fokus. Upišite vrijednost i pritisnite `Enter` (ili napustite polje) da pomaknete kameru tamo. **kopiraj** stavlja `pos X Y Z · zakret A · nagib B` u međuspremnik (uz `(zakret igre)` iza, kad je ta konvencija odabrana). Letenje je način istraživanja, a koordinate su način reprodukcije pogleda. To su isti brojevi kao u [očitanju kamere](#camera-readout): vlastite koordinate podataka, uključujući kad je os obrnuta, i zakret u odabranoj [konvenciji](#yaw-conventions).

### Obrni os svijeta {#invert-world-axis}

**Obrni os svijeta X / Y / Z** crta svijet s tom osi obrnutom. Igra koja zadržava lijevi svijet ispadne zrcaljena u ovom desnom pregledniku: zavoji desne ruke crtaju se kao zavoji lijeve, a obrtanje X ili Z to vraća. **Mijenja se samo crtanje**: podaci, analiza i svaka koordinata koju alati prikazuju (poza, ravnalo, presjek) ostaju vlastiti za igru. Prikaz se preokreće na mjestu, zadržavajući pogled na istom mjestu. Ova postavka pamti se u pregledniku (ključ `localStorage` `heat3d.mirror`). Usporedite s [preokretima](axes-units-and-time.md#flips) pri učitavanju, koji mijenjaju podatke.

## Pregled prikaza {#inspecting-the-view}

Gdje je kamera, što je pod pokazivačem i odlazak na točku: blok **Pregled** na ploči Kamera i scena i dva prikaza u gornjem lijevom kutu prikaza. Kod je u [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) i [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Postavka | Zadano | Značenje |
|---|---|---|
| **Položaj kamere preko prikaza** | uključeno | Očitanje kamere, dolje. Zatvara se i gumbom **×**. |
| **Klik pokazuje što je ondje** | uključeno | Odabir klikom, dolje. |
| **Konvencija zakreta** | Preglednik | Koji zakret očitanje, polja poze i kućica za skok prikazuju i čitaju. |

Ove tri postavke pamte se u pregledniku (ključ `localStorage` `heat3d.inspect`).

### Očitanje kamere {#camera-readout}

U gornjem lijevom kutu prikaza: **x**, **y**, **z**, **zakret** i **nagib** kamere, uživo, s oznakom koja imenuje konvenciju zakreta. Prikazuje iste brojeve kao polja [Poza](#pose) i ne troši ništa dok letite (piše se na stranicu na taktu okvira, bez ponovnog crtanja ploča).

- **kopiraj** (ili `C` bilo gdje izvan tekstnog polja) stavlja `x X y Y z Z zakret A nagib B (zakret preglednika)` u međuspremnik, s decimalnim točkama bez obzira na jezik: redak koji kućica za skok i svaka skripta čita natrag.
- **idi na** (ili `G`) otvara kućicu ispod: nalijepite točku i pritisnite `Enter` da je pogledate, ili nalijepite cijelu kopiranu pozu da stanete u taj pogled. `Esc` zatvara kućicu.

### Koordinate: vlastiti okvir podataka {#coordinates-the-datas-own-frame}

Svaka koordinata koju alati za pregled prikazuju ili prihvaćaju je u **vlastitom okviru učitanih podataka**: [preslikavanje osi](axes-units-and-time.md) pri učitavanju (os gore, preokreti, mjerilo) je poništeno. Položaj očitan s prikaza je broj koji tablica izvora sadrži, a broj iz tablice upisan u kućicu za skok sletjet će na to mjesto. Kad preslikavanje ništa ne mijenja (učitavanje s Y gore i bez mjerila, što je ono što alati za snimanje i izvoznici razina pišu), to je jednostavno svijet. Inače očitanje nosi oznaku **okvir podataka**. Bez skupa podataka koordinate su svjetske. Zakret i nagib su uvijek oko svijeta preglednika, s Y gore.

### Konvencije zakreta {#yaw-conventions}

| Konvencija | Zakret 0° gleda duž | Raste prema | Koriste je |
|---|---|---|---|
| **Preglednik** | -Z | -X | slobodna kamera za letenje, [unaprijed postavljeni pogledi](#preset-views) |
| **Igra / alati za snimanje** | +X | -Z | stupci `yaw` i poze alata za snimanje; u razini izvezenoj u okviru preglednika, vlastiti zakret igre |

Nagib je isti u obje: gore od vodoravnog. Razlikuju se za četvrt okreta i ništa više:

> zakret preglednika = zakret igre - 90°

Smjer `d` je `(cos p · cos y, sin p, -cos p · sin y)` u konvenciji igre i `(-sin y · cos p, sin p, -cos y · cos p)` u konvenciji preglednika. Odaberite **Igra / alati za snimanje** da upišete zakret ravno iz tablice snimanja ili da usporedite očitanje s jednim takvim.

### Odlazak na točku {#going-to-a-point}

**Idi na točku**, u bloku Pregled (i u kućici **idi na** očitanja):

- Tekstno polje prima `x, y, z` ili `x y z` (ili `x; y; z`), s decimalnom točkom ili decimalnim zarezom: `-321.6, 137.8, -59.9` i `-321,6 137,8 -59,9` su ista točka. Pet brojeva dodaje zakret i nagib. Poza kopirana iz očitanja ili iz polja poze čita se cijela, s oznakama i konvencijom;
- **zakret °** i **nagib °** (neobavezno) okreću kameru, u odabranoj konvenciji;
- **Pogledaj** zadržava smjer (nagnut da gleda dolje najmanje 20° ako je gledao ravno) i odmiče se duž njega na trenutnu udaljenost, zadržanu između 0,3% i 3% širine scene: 6 do 60 m na razini od dva kilometra. Udaljenost fokusa, visina paralelnog prikaza i brzina letenja slijede, pa prikaz stiže upotrebljiv;
- **Stani ovdje** stavlja kameru na točku, okrenutu prema zadanom zakretu i nagibu, ili kako je bila.

Nalijepljena poza s vlastitim zakretom i nagibom uvijek stane u taj pogled.

### Odabir klikom {#click-to-pick}

Klik na prikaz (pritisak i otpuštanje bez povlačenja više od 4 piksela; povlačenje i dalje gleda oko sebe) prikazuje karticu u gornjem lijevom kutu s onim što je pod pokazivačem. Dok je [ravnalo](measure.md) uključeno, klikovi idu na ravnalo.

**Nacrtana točka podataka pobjeđuje.** Najbliži uzorak unutar 8 piksela od klika, među onima koji su stvarno nacrtani: retci u vremenskom prozoru i životnom vijeku, koji prolaze [filtere](filters.md), prikazane grupe i podjelu razlike, unutar odsijecanja udaljenosti i presjeka koji reže toplinu. U reprodukciji kutije, kutija pod pokazivačem (bilo gdje na njoj). Kartica navodi svaki stupac koji redak nosi, pod vlastitim imenima stupaca izvora: vrijeme (stvarno, ili vlastite sekunde datoteke s `m:ss.ss`), osoba, grupa, sesija, svaki zadržani stupac, položaj i smjer pogleda, te udaljenost od kamere. U memoriji su samo stupci koje je učitavanje zadržalo: stupac koji nije odabran kao [stupac filtera](column-mapping.md) se ne prikazuje.

**Inače površina razine**: točka u kojoj se zraka klika susreće sa stvarnim trokutima razine (ne s referentnom ravninom ravnala), s **dijelom** kojem pripada (ime izvoznika, `structure:props`, `ground:terrain …`), njezinom **vrstom** (tlo, građevina, voda, slika karte), koordinatama i udaljenošću. Geometrija skrivena presjekom ili odsijecanjem udaljenosti se propušta. Gdje razina ima [mrežu za navigaciju](model-levels.md#navigation-meshes), redak je imenuje i kaže leži li mjesto na njoj (✓). Ime dijela s prefiksom `≈` pogođeno je iz graničnih okvira dijelova, jer je taj dio razine pri učitavanju pojednostavljen.

Kartica ostaje dok se ne zatvori (**×**, `Esc`), dok drugi klik ne odgovori nečemu drugom ili dok se ne klikne na prazan prostor. Na točki u sceni crta se cijan križ, a preko njega na zaslonu prsten. Njezini gumbi: **kopiraj** (svaka vrijednost i koordinate kao `x, y, z`), **Pogledaj** i **Stani ovdje** (na točki podataka, gledajući kako je redak gledao kad ima smjer pogleda; na površini, 1,7 m iznad nje).

Razina se indeksira za odabir pri prvom kliku koji ga treba: rešetka stupaca preko njezina otiska, izgrađena nekoliko milisekundi po okviru tako da prikaz nikad ne stane (oko sekunde rada za razinu od nekoliko milijuna trokuta). Čuva se dok se razina ne promijeni. Dok god traje, kartica kaže *Priprema razine za odabir* s postotkom i odgovara na klik kad je spremna. Pretraga točke podataka preko više od četiri milijuna nacrtanih redaka raspoređena je preko okvira na isti način.

## Dubinska oštrina {#depth-of-field}

Sklopivi odjeljak u Kamera i scena, naslovljen *Dubinska oštrina - uključena* dok je uključen. Isključen je zadano: to je efekt prikaza, a zadani pogled treba pokazivati podatke, a ne tumačenje.

| Postavka | Zadano | Raspon (ručka) | Značenje |
|---|---|---|---|
| **Uključeno** | isključeno | | |
| **Fokusiraj na ono što je uokvireno** | uključeno | | Fokus na udaljenosti koju je koristilo zadnje uokvirivanje (*Fokusirano na N m.*). |
| **Udaljenost fokusa** | 1000 | 1–200.000, logaritamski (10.000.000) | Prikazano kad je fokus ručni. |
| **Otvor blende** | ±35% | ±2% do ±200%, logaritamski (±3200%) | Dubina koja ostaje oštra, kao udio udaljenosti fokusa: relativno, a ne f-broj, jer scene idu od sobe do karte od osam kilometara. |
| **Najveće zamućenje** | 12 px | 1–48 (256) | Najveći polumjer zamućenja; trošak raste s njim. |

Zamućuje **razinu, mrežu i kutije**, *ne toplinu*. Toplina na pikselu je zbroj sprite-ova na mnogo dubina, pa nema jedne dubine u kojoj bi bila van fokusa. Zamućivanje toplinske geometrijom koja je iza nje bilo bi pogrešno gdje god lebdi ispred. Oštri podaci nad omekšanim kontekstom su također korisnija od ta dva. Zamućenje je skupljanje od 24 uzorka po zlatnom kutu u završnom prolazu, ponderirano tako da oštar prednji plan ne bude razmazan prema van zamućenom pozadinom iza njega. Promjena ga ponovno crta bez ponovnog pokretanja akumulacije topline.

## Razlučivost platna {#canvas-resolution}

Platno se crta pri omjeru piksela zaslona, ograničenom na 2. Spremnik topline može se crtati pri nižoj razlučivosti od toga ([Razlučivost topline](performance-and-stats.md)).

## Stranice u ovom odjeljku {#pages-in-this-section}

- [Gamepad i HOTAS](gamepad.md)
- [Referenca tipkovnice i miša](keyboard-reference.md)
