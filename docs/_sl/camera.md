---
title: "Kamera in upravljanje"
nav_order: 14
has_children: true
lang: "sl"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera in upravljanje

Letite skozi prizor kot ptica: **W A S D** za premik, povlecite miško za ogled. Ta stran vam pokaže, kako leteti, kako preskočiti na pogled od zgoraj ali s strani in kako natančno preberete, kje je kamera.

## Let v 4 korakih {#fly-in-4-steps}

1. Enkrat kliknite na pogled, da dobi tipkovnico.
2. Držite **W** za let naprej, **S** nazaj, **A** in **D** vstran, **Presledek** gor, **Q** dol.
3. Držite levi ali desni gumb miške in povlecite za ogled okoli.
4. Pritisnite **F**, da spet uokvirite vse podatke.

Kamera je prosta letalska kamera s perspektivno in vzporedno projekcijo, vnaprej nastavljenimi pogledi, vnesenim položajem in globinsko ostrino. Njene nastavitve so v plošči **Kamera in prizor** na dnu stranske vrstice (prikazana tudi v zavihkih Analiza dirke in Tekma). Izvedba je v [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Letenje {#flying}

| Vnos | Učinek |
|---|---|
| `W` `A` `S` `D` ali puščične tipke | Naprej (vzdolž pogleda, vključno z njegovim nagibom), levo, nazaj, desno |
| `Presledek` ali `E` | Gor (svetovno gor) |
| `Q` ali levi `Ctrl` | Dol |
| `Shift` (držan) | 6-krat hitreje |
| levi `Alt` (držan) | 15 % hitrosti |
| Povlek z levim ali desnim gumbom miške | Ogled okoli. Kazalec je med vlečenjem zaklenjen. |
| Kolešček miške | Hitrost letenja ×1,5 na klik (perspektiva); povečava (vzporedno) |
| `F` | Uokvirite podatke |
| Klik (brez vlečenja) | Pokaže, kaj je pod kazalcem ([Pregled pogleda](#inspecting-the-view)) |
| `C` | Kopira položaj kamere, zasuk in naklon |
| `G` | Pojdite na vneseno točko |
| `Esc` | Zapre kartico izbire (in preneha slediti enoti) |

### Med sledenjem enoti {#while-following-a-unit}

Ko kamera sledi enoti v predvajanju ([Predvajanje tekme](match-replay.md)), tipke za letenje naredijo nekaj drugega:

| Vnos | Učinek |
|---|---|
| Kolešček, `W` / `S` | Bliže enoti / dlje od nje (višje / nižje v satelitskem pogledu) |
| `A` / `D`, `Q` / `E` | Kroženje okoli enote (pogled zadaj in orbita) |
| Povlek | Ogled okoli enote (kokpit: ogled znotraj) |
| `V` / `Shift+V` | Naslednji / prejšnji pogled kamere |
| `Esc` | Najprej preneha gledati drugo enoto, nato preneha slediti |

Tipke za premik se seštevajo z [igralnim ploščkom](gamepad.md); za vse drugo glejte [pregled tipkovnice](keyboard-reference.md). Tipke so prezrte, medtem ko ima polje za besedilo ali spustni seznam fokus. Naklon je omejen tik pred ravno navzgor in navzdol.

## Plošča Kamera in prizor {#camera--scene-panel}

![Plošča Kamera in prizor: Projekcija, Vnaprej nastavljeni pogledi, gumbi Vidno polje, Hitrost letenja in Poza](../assets/img/en/camera-panel.webp)

### Projekcija {#projection}

**Projekcija**: *Perspektiva* (privzeto) ali *Vzporedna*.

*Vzporedna* (pravokotna) odpravi skrajševanje, zato dve žarišči enake gostote izgledata enako velika kjerkoli v sliki – primerjava, zaradi katere obstaja toplotna karta zemljevida – in zaradi nje je izometrični pogled izometričen. V vzporednem načinu kolešček miške povečuje (ni premikanja naprej, ki bi spremenilo merilo), [prikaz hitrosti](#fly-speed) pa je skrit.

**Preklop ohrani predmet enako velik.** Vzporedna projekcija nima vidnega polja, zato njena višina okvirja ni povezana z razdaljo kamere; preprosto preklapljanje bodisi divje povečuje bodisi ne pokaže ničesar. Ob preklopu na vzporedno se višina okvirja nastavi na to, kar perspektivna kamera pokrije na razdalji ostrenja (2 × razdalja × tan(fov / 2); razdalja ostrenja je razdalja zadnjega uokvirjanja). Vrnitev obnovi perspektivni položaj, ki ste ga zapustili, pri isti navidezni velikosti, namesto kamorkoli je odplavala vzporedna slika.

### Vnaprej nastavljeni pogledi {#preset-views}

| Skupina | Gumbi | Usmerjenost |
|---|---|---|
| **Izometrično** | **SV**, **SZ**, **JV**, **JZ** | Vzporedno, naklon -35,264° (= atan(1/√2), kot, pri katerem se vse tri osi projicirajo v isto dolžino), zasuk -45°, 45°, -135°, 135°. Štirje vogali, ker en sam vedno skrije polovico zemljevida za tem, kar je bližje. |
| **Stranski pogledi** | **Zgoraj**, **Spodaj**, **Spredaj**, **Zadaj**, **Levo**, **Desno** | Vzporedno. Zgoraj gleda naravnost navzdol (naklon -89,9°), Spodaj naravnost navzgor, Spredaj vzdolž -Z (zasuk 0°), Zadaj vzdolž +Z (180°), Levo vzdolž -X (-90°), Desno vzdolž +X (90°). |
| | **Nazaj na perspektivo** | Vrne se na perspektivni položaj, ki ste ga zapustili. V perspektivi onemogočeno. |
| | **Tričetrtinski pogled** | Perspektiva, zasuk -35°, naklon -28°. |

Vsak prednastavljen pogled preklopi samo projekcijo – pod perspektivo se "pogled od zgoraj" še vedno zbližuje proti točki izginjanja in enake površine nehajo izgledati enako – in uokviri podatke iz tiste smeri.

### Vidno polje {#field-of-view}

**Vidno polje** – navpični kot. Privzeto 65°, 10–140° na drsniku (179° z ročajem), z gumbi **Ploščato 20°**, **Dolgo 35°**, **Normalno 50°**, **Široko 65°**, **Zelo široko 90°**. Ozko poravna perspektivo in bolj spominja na vzporedno projekcijo; široko poudari globino in otežuje presojo razdalj. Ostane aktivno v vzporednem načinu, kjer določa merilo, ki ga vrnitev izračuna, in razdaljo, ki jo uporablja **Sličica**.

### Hitrost letenja {#fly-speed}

**Hitrost letenja** – svetovne enote (metri) na sekundo pri polnem plinu. Privzeto 120; ob vsakem nalaganju vodoravni obseg podatkov / 12. Logaritemsko, 0,02–20.000 (200.000 z ročajem; ročaj jo spreminja v razmerjih, ne v zneskih). Kolešček miške jo pomnoži ali deli z 1,5 na klik, v okviru 0,02–200.000.

Ista vrednost je prikazana v spodnjem desnem kotu pogleda (samo perspektiva): hitrost v m/s ali km/s in čas, ki ga je potrebno, da se prečka podatki (ali raven, kadar je naložena 3D raven), pri tej hitrosti. Povlecite jo gor ali dol, da spremenite hitrost.

### Blizu in daleč {#near-and-far}

**Blizu** (privzeto 0,5) in **Daleč** (privzeto 40.000) sta razdalji rezanja. Obe se ob vsakem nalaganju izračunata iz podatkov (blizu = max(0,05, obseg / 20.000), daleč = obseg × 12) in ju 3D raven, ki je večja, samo razširi, nikoli ne zoži ([Ravni](levels.md#what-a-level-does-for-the-heat)). Njuno razmerje določa natančnost globine, na katero se zanaša zakrivanje, zato majhna vrednost blizu z veliko vrednostjo daleč oslabi [zakrivanje](depth-and-culling.md). Kadar se gleda od zunaj prizora ali visoko nad njegovim tlemi, dejansko uporabljena bližnja ravnina odide na 2 % te razdalje, tako da zemljevid, gledan od daleč zgoraj, ohrani dovolj natančnosti globine, da voda in obala ne utripata; škatla še vedno kaže nastavljeno vrednost.

### Druge nastavitve {#other-controls}

| Nastavitev | Privzeto | Pomen |
|---|---|---|
| **Obrni Y** | izklopljeno | Obrne gledanje z miško gor/dol. |
| **Globinska ostrina** | izklopljeno | Glejte spodaj. |
| **Igralni plošček** | omogočeno | Glejte [Igralni plošček in HOTAS](gamepad.md). |
| **Poza** | | Glejte spodaj. |
| **Pregled** | | Odčitek kamere, klik za izbiro, dogovor o zasuku in *Pojdi na točko*; glejte [Pregled pogleda](#inspecting-the-view). |
| **Sličica podatkov (F)** | | Prilagodi podatke (v zavihku Analiza dirke: kroge) pogledu in ohrani trenutno smer. Kamera je postavljena na r / tan(fov / 2) od središča, r je polovica diagonale meja podatkov. |
| **Mreža**, **Osi** | vklopljeno, vklopljeno | Mreža na tleh z razmikom 1/2/5 × 10ⁿ okoli 1/40 razpona podatkov (sega do 1,5 × podatkov, med 8 in 120 koraki mreže) in barvne osi. |
| **Obrni os sveta** X, Y, Z | izklopljeno | Glejte spodaj. |

### Poza {#pose}

Pet številskih polj – **X**, **Y**, **Z** in **zasuk °**, **naklon °** – ki sledijo kameri, dokler nobeno ni v fokusu. Vpišite vrednost in pritisnite `Enter` (ali zapustite polje), da premaknete kamero tja. **kopiraj** da `poz X Y Z · zasuk A · naklon B` na odložišče (s `(zasuk igre)` za tem, kadar je izbran ta dogovor). Letenje je način raziskovanja; koordinate so način ponovitve pogleda. To so iste številke kot na [odčitku kamere](#camera-readout): lastne koordinate podatkov, tudi kadar je os obrnjena, in zasuk v izbranem [dogovoru](#yaw-conventions).

### Obrni os sveta {#invert-world-axis}

**Obrni os sveta X / Y / Z** nariše svet z obrnjeno osjo. Igra, ki ohranja levoročni svet, se v tem desnoročnem pregledovalniku prikaže zrcaljeno – desni ovinki so narisani kot levi – in obrnitev X ali Z to popravi. **Spremeni se samo risba**: podatki, analiza in vsaka koordinata, ki jo orodja prikažejo (položaj, merilo, rez), ostanejo igrine lastne. Pogled se obrne na mestu in ohrani, da gledate na isto točko. Nastavitev se shrani v brskalniku (ključ `localStorage` `heat3d.mirror`); primerjajte z obračanji ob nalaganju ([obrati](axes-units-and-time.md#flips)), ki spremenijo podatke.

## Pregled pogleda {#inspecting-the-view}

Kje je kamera, kaj je pod kazalcem in pojdi na točko – blok **Pregled** v plošči Kamera in prizor ter dva prekrivna sloja v zgornjem levem kotu pogleda. Koda je v [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) in [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Nastavitev | Privzeto | Pomen |
|---|---|---|
| **Položaj kamere nad pogledom** | vklopljeno | Odčitek kamere, spodaj. Zapre se tudi z **×**. |
| **Klik pokaže, kaj je tam** | vklopljeno | Klik za izbiro, spodaj. |
| **Dogovor za zasuk** | Pregledovalnik | Kateri zasuk kažeta in berejo odčitek, polja poze in polje za skok. |

Te tri se shranijo v brskalniku (ključ `localStorage` `heat3d.inspect`).

### Odčitek kamere {#camera-readout}

V zgornjem levem kotu pogleda: **x**, **y**, **z**, **zasuk** in **naklon** kamere, v živo, z oznako, ki poimenuje dogovor o zasuku. Kaže iste številke kot polja [Poza](#pose) in med letenjem ne stane nič (zapiše se na stran ob uri sličic, brez ponovnega risanja plošč).

- **kopiraj** (ali `C` kjerkoli zunaj polja za besedilo) da `x X y Y z Z zasuk A naklon B (zasuk pregledovalnika)` na odložišče, z decimalkami `.` v vsakem jeziku – vrstico, ki jo polje za skok in vsak skript prebere nazaj.
- **pojdi na** (ali `G`) odpre polje pod njim: prilepite točko in pritisnite `Enter`, da si jo ogledate, ali prilepite celotno kopirano pozo, da stopite v ta pogled. `Esc` zapre polje.

### Koordinate: lastni okvir podatkov {#coordinates-the-datas-own-frame}

Vsaka koordinata, ki jo orodja za pregled prikažejo ali sprejmejo, je v **lastnem okviru naloženih podatkov**: preslikava osi ob nalaganju ([preslikava osi](axes-units-and-time.md): os gor, obrati, merilo) je razveljavljena. Položaj, prebran s pogleda, je število, ki ga hrani izvorna tabela, in številka iz tabele, vpisana v polje za skok, pristane na tistem mestu. Kadar preslikava ničesar ne spremeni (nalaganje z Y navzgor in brez merila – kar zapisujejo orodja za zajem in izvozniki ravni), je to kar svet; sicer odčitek nosi oznako **okvir podatkov**. Brez nabora podatkov so koordinate svetovne koordinate. Zasuk in naklon sta vedno glede na svet pregledovalnika, Y navzgor.

### Dogovori za zasuk {#yaw-conventions}

| Dogovor | Zasuk 0° gleda vzdolž | Narašča proti | Uporablja |
|---|---|---|---|
| **Pregledovalnik** | -Z | -X | letalska kamera, [vnaprej nastavljeni pogledi](#preset-views) |
| **Igra / orodja za zajem** | +X | -Z | stolpci `yaw` in poze orodij za zajem; v ravni, izvoženi v okvirju pregledovalnika, zasuk same igre |

Naklon je v obeh enak: navzgor od vodoravne. Razlikujeta se za četrt obrata in nič drugega:

> zasuk pregledovalnika = zasuk igre - 90°

Smer `d` je `(cos p · cos y, sin p, -cos p · sin y)` v dogovoru igre in `(-sin y · cos p, sin p, -cos y · cos p)` v dogovoru pregledovalnika. Izberite **Igra / orodja za zajem**, če želite zasuk vpisati naravnost iz tabele zajema ali primerjati odčitek z njo.

### Pojdi na točko {#going-to-a-point}

**Pojdi na točko**, v bloku Pregled (in v polju **pojdi na** odčitka):

- polje za besedilo sprejme `x, y, z` ali `x y z` (ali `x; y; z`), z decimalno piko ali decimalno vejico – `-321.6, 137.8, -59.9` in `-321,6 137,8 -59,9` sta ista točka. Pet številk doda zasuk in naklon, kopirana poza z odčitka ali polj poze pa se prebere celotna, vključno z oznakami in dogovorom;
- **zasuk °** in **naklon °** (neobvezno) obrneta kamero v izbranem dogovoru;
- **Poglej** ohrani smer (nagne jo, da gleda navzdol vsaj za 20°, če je gledala vodoravno) in se odmakne vzdolž nje na trenutno razdaljo, zadržano med 0,3 % in 3 % širine prizora – 6 do 60 m na dvokilometrski ravni. Razdalja ostrenja, višina vzporednega pogleda in hitrost letenja sledijo, tako da je pogled takoj uporaben;
- **Stoj tukaj** postavi kamero na točko, obrnjeno v podani zasuk in naklon, ali kot je bila.

Prilepljena poza s svojim zasukom in naklonom vedno stopi v ta pogled.

### Klik za izbiro {#click-to-pick}

Klik na pogled – pritisnite in spustite, ne da bi povlekli več kot 4 slikovne pike; vlečenje še vedno gleda okoli – pokaže kartico zgoraj levo s tem, kar je pod kazalcem. Medtem ko je [merilo](measure.md) vklopljeno, kliki gredo na merilo.

**Narisana točka podatkov zmaga.** Najbližji vzorec v 8 slikovnih pikah od klika med tistimi, ki so dejansko narisani: vrstice v časovnem oknu in življenjski dobi, ki prestanejo [filtre](filters.md), prikazane skupine in razdelitev razlike, znotraj izpuščanja po razdalji in rezine, ki obreže toplotno karto. V predvajanju škatel škatla pod kazalcem (kjerkoli na njej). Kartica našteje vsak stolpec, ki ga vrstica nosi, z lastnimi imeni stolpcev vira – čas (stenska ura ali lastne sekunde datoteke z `m:ss.ss`), oseba, skupina, seja, vsak ohranjeni stolpec, položaj in smer pogleda – ter razdaljo od kamere. V pomnilniku so le stolpci, ki jih je nalaganje ohranilo: stolpec, ki ni izbran kot [stolpec filtra](column-mapping.md), ni prikazan.

**Sicer površina ravni**: točka, kjer se žarek klika sreča z dejanskimi trikotniki ravni (ne z referenčno ravnino merila), z **delom**, kateremu pripada (ime izvoznika, `structure:props`, `ground:terrain …`), njeno **vrsto** (tla, konstrukcija, voda, slika zemljevida), koordinatami in razdaljo. Geometrija, skrita z rezino ali izpuščanjem po razdalji, je preskočena. Kjer ima raven [navigacijsko mrežo](model-levels.md#navigation-meshes), vrstica jo poimenuje in pove, ali točka leži nanjo (✓). Ime dela s predpono `≈` je bilo uganjeno iz omejevalnih škatel delov, ker je bil ta del ravni ob nalaganju poenostavljen.

Kartica ostane, dokler je ne zaprete (**×**, `Esc`), dokler drug klik ne odgovori na kaj drugega, ali dokler ne kliknete na prazno. V prizoru je na točki narisan cian križec, na zaslonu pa krog čez njega. Njeni gumbi: **kopiraj** (vsaka vrednost in koordinate kot `x, y, z`), **Poglej** in **Stoj tukaj** (na točki podatkov, gledano v smeri, v kateri je gledala vrstica, kadar ima smer pogleda; na površini 1,7 m nad njo).

Raven se za izbiranje indeksira ob prvem kliku, ki ga potrebuje: mreža stolpcev nad njenim obrisom, zgrajena po nekaj milisekund med kadri, da se pogled nikoli ne ustavi (približno sekunda dela za raven z nekaj milijoni trikotnikov), in ohranjena, dokler se raven ne spremeni. Do takrat kartica kaže *Pripravljam raven za izbiranje* z odstotkom in odgovori na klik, ko je pripravljena. Iskanje točke podatkov med več kot štirimi milijoni narisanih vrstic je razporejeno po kadrih na enak način.

## Globinska ostrina {#depth-of-field}

Zložljiv razdelek v plošči Kamera in prizor, z naslovom *Globinska ostrina - vklopljeno*, ko je omogočena. Privzeto izklopljena: je učinek predstavitve, privzeti pogled pa mora kazati podatke, ne razlage.

| Nastavitev | Privzeto | Obseg (drsnik) | Pomen |
|---|---|---|---|
| **Omogočeno** | izklopljeno | | |
| **Izostri na uokvirjeno** | vklopljeno | | Ostri na razdalji, ki jo je uporabilo zadnje uokvirjanje (*Izostreno na N m.*). |
| **Razdalja ostrenja** | 1000 | 1–200.000, logaritemsko (10.000.000) | Prikazano, kadar je ostrenje ročno. |
| **Zaslonka** | ±35 % | ±2 % do ±200 %, logaritemsko (±3200 %) | Globina, ki ostane ostra, kot delež razdalje ostrenja – relativno, ne f-število, ker prizori segajo od sobe do osemkilometrskega zemljevida. |
| **Največja zameglitev** | 12 slikovnih pik | 1–48 (256) | Največji polmer zamegljenosti; strošek se z njim veča. |

Zamegli **raven, mrežo in škatle** – *ne toplotne karte*. Toplotna karta v slikovni piki je vsota sprite-ov na mnogih globinah, zato nima ene same globine, v kateri bi bila neostra; zameglitev z geometrijo, ki je za njo, bi bila napačna, kjerkoli lebdi pred njo. Ostri podatki na mehkem kontekstu sta tudi bolj uporabna. Zameglitev je zbiranje z 24 vzorci zlatega kota v sestavljenem prehodu, uteženo tako, da ostro ospredje ne razmaže navzven zamegljeno ozadje za njim. Spremembe jo narišejo na novo, ne da bi znova zagnale kopičenje toplotne karte.

## Ločljivost platna {#canvas-resolution}

Platno se riše pri slikovnem razmerju zaslona, omejenem na 2. Medpomnilnik toplotne karte se lahko riše pri nižji ločljivosti od tega ([Ločljivost toplotne karte](performance-and-stats.md)).

## Strani v tem razdelku {#pages-in-this-section}

- [Igralni plošček in HOTAS](gamepad.md)
- [Referenca tipkovnice in miške](keyboard-reference.md)

