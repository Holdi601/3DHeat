---
title: "Kopičenje"
parent: "Notranjosti upodabljanja"
nav_order: 2
lang: "sl"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Kopičenje

Kadar pregledovalnik ne more narisati vseh pik v eni sličici, nariše del njih, nato še enega in med mirovanjem sešteje slike. Slika postaja jasnejša, kot fotografija, ki se razvije. Premik kamere začne znova. Vrstica **Pokritost** v prekrivanju statistike pokaže, kako daleč je.

![Prekrivanje statistike: Pokritost kaže odstotek, medtem ko se slika razvija, in *točno*, ko je končano](../assets/img/en/performance-stats-overlay.webp)

## Za razvijalce {#for-developers}

Kadar ena sličica ne more narisati vsake vrstice, nariše vzorec in ga utež poveča; slika je nato nepristranska, a hrupna ocena. **Kopičenje** združi zaporedne sličice, tako da ocena konvergira k točnemu odgovoru, dokler se nič ne spreminja. Vsaka sličica izbere enega od petih načinov ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); zadnji uporabljeni je v `engine.live.accumMode`.

| Način | Kdaj | Kaj se zgodi z akumulatorjem |
|---|---|---|
| **ponastavi** | kamera se je premaknila, nekaj, kar spremeni polje, se je spremenilo, postopno izboljševanje je izklopljeno, začne se rastoče okno (prva sličica predvajanja, po preskoku) ali se je premaknila toplotna črta med predvajanjem | Nadomesti se z oceno te sličice. |
| **razširi** | **Kumulativno** okno, ki se je od zadnje sličice samo povečalo | Ta sličica nariše samo vrstice, ki so pravkar postale vidne, s polno težo, in jih doda. Nič ne upada. |
| **ema** | drsno okno (**Okno**, **Življenjska doba**) se je premaknilo | `acc = acc × (1 - 0,34) + sličica × 0,34` – eksponentno drseče povprečje za približno tri sličice. |
| **povprečje** | nič se ni spremenilo in ocena ni končana | `acc = acc × (1 - 1/n) + sličica × 1/n` pri *n*-ti sličici: tekoče povprečje. |
| **preskoči** (miruje) | konvergirano in nič se ni spremenilo | Nič se ne nariše; sličica samo ponovno sestavi sliko. |

### Zakaj vsak {#why-each}

- **Tekoče povprečje, ne vsota.** Pomnožitev medpomnilnika z 1 - 1/n in dodajanje 1/n nove sličice je algebraično isto kot seštevanje in deljenje z *n* na koncu, vendar medpomnilnik vedno drži le vrednost enega polja. Vsota doseže *n*-kratnik polja, pri 16-bitnem cilju pa se nasiči pri 65.504; z deliteljem, ki vedno raste, bi mirujoč pogled zbledel, bolj ko bi stal – medtem ko je premikajoča se kamera, ki se vsako sličico ponastavi, videti popolnoma pravilno. Paket dima potrjuje, da 16 združenih sličic drži 1,00× tistega, kar drži ena sličica.
- **Razširitev za kumulativno predvajanje.** Že kopičene vrstice ostanejo vidne, zato sličica potrebuje samo delček sekunde, ki je ravnokar prišel – kar se prilega eni sličici, zato gre vanjo točno. Ponovna ocena bi pri vsaki sličici osvetlila drugačno naključno podmnožico in jo nato zbledela, kar bi izgledalo kot izbruhi, ki se bliskajo in izginjajo, zaustavljena sličica pa bi še naprej polnila. Paket potrjuje, da skupna vsota med predvajanjem monotono narašča in se med 2,5 s zaustavitve drži znotraj 0,02 %.
- **Drseče povprečje za drsna okna.** Ta se dejansko spreminjajo vsako sličico. Fiksna utež mešanja sledi premikajočemu se oknu (povprečje čez vse sličice od začetka predvajanja bi zaostajalo za glavo predvajanja) in je veliko mirnejša kot začetek od nule.
- **Ponastavitev za predvajane črte.** Glave črt se premikajo vsako sličico; drseče povprečje bi vsako razmazalo v progo, zato se vsaka sličica nariše celota, zbledenje repa pa je sama slika.
- **Delne sličice gredo skozi pomožni cilj.** Sličica, združena pri delu polne teže, se najprej nariše v ločen cilj od nič in šele nato zmeša v akumulator, namesto da bi se neposredno narisal z utežjo 1/n. Pri neposrednem risanju bi se vsak sprajt dodal v 1/n velikosti vsote, ki se ji pridruži, in 16-bitna plavajoča vejica bi to zaokrožila – najslabše tam, kjer je polje najgostejše ([Kopičenje v polovični plavajoči vejici](half-float-accumulation.md)).

### Konvergenca {#convergence}

Načrt za vsako sličico ve, koliko je kandidatnih vrstic in koliko jih pošlje, zato je število sličic, potrebnih za pokritje vsake vrstice, ⌈kandidati / poslani⌉. Ko je tolikšno število sličic združenih, je pogled **konvergiran**: vrstica *Pokritost* v prekrivanju statistike preide iz odstotka v *točno*, nadaljnje sličice pa mirujejo. Ob vklopljeni možnosti **Vsako vrstico nariši v vsaki sličici** (privzeto) ena sličica navadno pokrije vse, zato je konvergenca takojšnja, postopni mehanizem pa je potreben samo, kadar okno vsebuje več vrstic, kot jih lahko nosi en risalni načrt (približno 67 milijonov).

### Kaj ga znova zažene {#what-restarts-it}

Nastavitve spadajo v tri skupine glede na to, kaj akumulirani medpomnilnik še pomeni, potem ko se spremenijo:

| Skupina | Spremembe | Učinek |
|---|---|---|
| **Geometrija** – katere vrstice prispevajo in koliko | način pogleda; poti črt; polmer sprajta, jakost v središču in na robu, upadanje, gladek profil, krivulja, omejitve slikovnih pik, sploščenje; izločanje po razdalji bližnje, daljne in ravninske; zakrivanje in skrivanje za terenom; rezina; velikost platna; ločljivost toplote; vidnost skupin in predznaki; delitev razlike; Vse / Predvajaj; zgodovina; filtri stolpcev in izbor Entitet; ojačitev polovične plavajoče vejice | Ponastavi. |
| **Okno** – časovni razpon | premik glave predvajanja; rezervna življenjska doba in zbledenje | Razširi (kumulativno) ali drseče povprečje (drseče). |
| **Sestava** – samo barvanje | nasičenje, odziv gostote, najmanjša toplota, barvne lestvice; rezanje ravni; mreža in osi; nastavitve predvajanja škatel in seja; globinska ostrina | Ponovno nariše brez dotikanja toplote. |

Premik kamere vedno ponastavi. Torej je vlečenje nasičenja ali lestvice brezplačno; vlečenje polmera sprajta pa ponovno zažene konvergenco ob vsakem koraku.
